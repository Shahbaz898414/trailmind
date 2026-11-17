import type { Content, GenerateContentRequest, InferenceSource } from "firebase/ai";
import type { ZodType } from "zod";

import { firebaseAiModel } from "@/lib/firebase/config";
import {
  isHybridModelConfigured,
  requireHybridModel,
  resolveInferenceMode,
  type InferencePreference,
} from "@/lib/ai/client";
import {
  capabilities,
  chatReplySchema,
  type CapabilityId,
  type CapabilityInput,
  type CapabilityOutput,
  type ChatReply,
} from "@/lib/ai/capabilities";
import { ensureDeviceModel } from "@/lib/ai/device-model";
import {
  AiInvalidResponseError,
  AiSafetyBlockError,
  AiUnavailableError,
  AiUnsupportedError,
  classifyAiError,
} from "@/lib/ai/errors";
import { parseStructured } from "@/lib/ai/structured";

/**
 * Generation core — one honest `invoke()` primitive plus typed wrappers.
 *
 * ---------------------------------------------------------------------------
 * What this module guarantees:
 *   - Every answer carries the SDK's REAL `inferenceSource`
 *     (`"on_device" | "in_cloud"`); when the SDK doesn't report one, the
 *     source is `"unknown"` — never assumed.
 *   - Safety blocks are detected from the real response signals
 *     (`promptFeedback.blockReason` / `FinishReason`) and surfaced as
 *     `AiSafetyBlockError` — never answered around.
 *   - Structured capabilities Zod-validate their output. If the on-device
 *     model produced unusable JSON, ONE automatic cloud retry runs — but only
 *     when the caller didn't explicitly demand on-device and the network is
 *     up. The reported source always belongs to the response actually used.
 *   - Failures throw typed errors (see `errors.ts`); there is no canned text
 *     anywhere in this path.
 * ---------------------------------------------------------------------------
 *
 * Client-only module (uses `navigator`) — import from Client Components.
 */

/** Where an answer actually came from, as reported by the SDK. */
export type AiSource = "on_device" | "in_cloud" | "unknown";

export type AiResult = {
  text: string;
  source: AiSource;
  model: string;
  latencyMs: number;
};

export type AiChatTurn = { role: "user" | "assistant"; text: string };

export type AiRequest = {
  prompt: string;
  history?: AiChatTurn[];
  systemInstruction?: string;
  preference?: InferencePreference;
};

/** Maps the SDK's `InferenceSource` (or its absence) honestly. */
function toSource(value: InferenceSource | undefined): AiSource {
  return value === "on_device" || value === "in_cloud" ? value : "unknown";
}

function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/** Flattens chat history plus the new prompt into SDK `Content` objects. */
function toContents(request: AiRequest): Content[] {
  const history: Content[] = (request.history ?? []).map((turn) => ({
    role: turn.role === "assistant" ? "model" : "user",
    parts: [{ type: "text", text: turn.text }],
  }));
  return [
    ...history,
    { role: "user", parts: [{ type: "text", text: request.prompt }] },
  ];
}

/* -------------------------------------------------------------------------- */
/* invoke — the single model-call primitive                                    */
/* -------------------------------------------------------------------------- */

type InvokeOptions = {
  prompt: string;
  history?: AiChatTurn[];
  systemInstruction?: string;
  preference?: InferencePreference;
  /** Skip device preparation (used for retries — the state is already known). */
  skipDevicePreparation?: boolean;
};

async function invoke(options: InvokeOptions): Promise<AiResult> {
  if (!isHybridModelConfigured()) {
    throw new AiUnavailableError(
      "not-configured",
      "Firebase is not configured. Add your Firebase web app values to .env.local."
    );
  }

  const preference = options.preference ?? "auto";

  // Explicit on-device requests prepare the device model first so the user
  // gets an honest unsupported/error state instead of an opaque failure.
  // (Must run within a user-gesture chain for first-time downloads.)
  if (preference === "on-device" && !options.skipDevicePreparation) {
    const deviceState = await ensureDeviceModel();
    if (deviceState.status === "unsupported") {
      throw new AiUnavailableError(
        "on-device-unavailable",
        "This browser has no on-device model available. Use a Chrome version with the Prompt API (Gemini Nano), or switch to the cloud engine."
      );
    }
    if (deviceState.status === "error") {
      throw new AiUnavailableError(
        "on-device-unavailable",
        `The on-device model could not be prepared: ${deviceState.message}`
      );
    }
  }

  const model = requireHybridModel(preference);
  const payload: GenerateContentRequest = {
    contents: toContents(options),
  };
  if (options.systemInstruction) {
    payload.systemInstruction = options.systemInstruction;
  }

  const startedAt = performance.now();

  try {
    const result = await model.generateContent(payload);
    const response = result.response;

    // 1. Real safety signals — check BEFORE touching the text.
    const promptBlock = response.promptFeedback?.blockReason;
    if (promptBlock) {
      throw new AiSafetyBlockError(promptBlock);
    }

    // 2. Extract text; the SDK's `text()` throws when a candidate was blocked.
    let text: string;
    try {
      text = response.text();
    } catch (error) {
      const finishReason = response.candidates?.[0]?.finishReason;
      if (
        finishReason &&
        finishReason !== "STOP" &&
        finishReason !== "MAX_TOKENS"
      ) {
        throw new AiSafetyBlockError(finishReason);
      }
      throw classifyAiError(error);
    }

    if (!text.trim()) {
      throw new AiInvalidResponseError(
        "empty-response",
        "The model returned an empty response."
      );
    }

    return {
      text,
      source: toSource(response.inferenceSource),
      model: firebaseAiModel,
      latencyMs: Math.round(performance.now() - startedAt),
    };
  } catch (error) {
    throw classifyAiError(error);
  }
}

/* -------------------------------------------------------------------------- */
/* generateText — free-form generation                                         */
/* -------------------------------------------------------------------------- */

/**
 * Sends one request through the hybrid model and returns the raw text answer
 * with its real inference source. Throws typed errors — no canned fallback.
 */
export async function generateText(request: AiRequest): Promise<AiResult> {
  return invoke({
    prompt: request.prompt,
    history: request.history,
    systemInstruction: request.systemInstruction,
    preference: request.preference,
  });
}

/* -------------------------------------------------------------------------- */
/* runCapability — the 9 use cases                                             */
/* -------------------------------------------------------------------------- */

export type CapabilityResult<K extends CapabilityId> = {
  /** Zod-validated data (structured) or the raw text (free-text capabilities). */
  data: CapabilityOutput<K>;
  /** The raw model text — kept for display/debugging. */
  text: string;
  source: AiSource;
  model: string;
  latencyMs: number;
  /** True when an automatic cloud retry produced the returned answer. */
  retriedToCloud: boolean;
};

export type RunCapabilityOptions = {
  preference?: InferencePreference;
};

/**
 * Runs one of the 9 capabilities end-to-end:
 * prompt build → mode resolution → invoke → (JSON extraction + Zod) → typed result.
 *
 * Cloud-only capabilities (e.g. `guide-summary`) are enforced as such:
 * requesting them on-device fails with `AiUnsupportedError` (honestly, not by
 * quietly switching engines), and offline they fail with
 * `AiUnavailableError("offline")`.
 */
export async function runCapability<K extends CapabilityId>(
  id: K,
  input: CapabilityInput<K>,
  options: RunCapabilityOptions = {}
): Promise<CapabilityResult<K>> {
  const capability = capabilities[id];
  const preference = options.preference ?? "auto";

  // --- honest mode resolution -------------------------------------------
  if (!capability.deviceCapable && preference === "on-device") {
    throw new AiUnsupportedError(
      `"${capability.title}" requires the cloud model — the on-device model cannot process document-sized input. Switch the engine to cloud.`
    );
  }
  if (!capability.deviceCapable && isOffline()) {
    throw new AiUnavailableError(
      "offline",
      "You are offline and this request needs the cloud model. On-device replies still work for questions, plans, lists and phrases."
    );
  }

  const prompt = (capability.buildPrompt as (i: unknown) => string)(input);

  const first = await invoke({
    prompt,
    systemInstruction: capability.systemInstruction,
    preference,
  });

  // Free-text capabilities: the model's text IS the answer.
  if (capability.schema === null) {
    return {
      data: first.text as CapabilityOutput<K>,
      text: first.text,
      source: first.source,
      model: first.model,
      latencyMs: first.latencyMs,
      retriedToCloud: false,
    };
  }

  // --- structured output -------------------------------------------------
  const schema = capability.schema as ZodType<unknown>;
  const invalidKind = (reason: string) =>
    reason === "schema-mismatch" ? ("schema-mismatch" as const) : ("invalid-json" as const);

  let outcome = parseStructured(schema, first.text);
  let used = first;
  let retriedToCloud = false;

  // One automatic cloud retry when the DEVICE produced unusable JSON and the
  // caller didn't explicitly force on-device. The reported source is always
  // the source of the response that actually succeeded.
  if (!outcome.ok && used.source === "on_device" && preference !== "on-device") {
    if (isOffline()) {
      throw new AiInvalidResponseError(
        invalidKind(outcome.reason),
        `The on-device model's reply didn't match the expected format (offline — no cloud retry possible): ${outcome.detail}`
      );
    }
    const retry = await invoke({
      prompt,
      systemInstruction: capability.systemInstruction,
      preference: "cloud",
      skipDevicePreparation: true,
    });
    retriedToCloud = true;
    outcome = parseStructured(schema, retry.text);
    used = retry;
  }

  if (!outcome.ok) {
    throw new AiInvalidResponseError(
      invalidKind(outcome.reason),
      `The model's reply didn't match the expected format: ${outcome.detail}`
    );
  }

  return {
    data: outcome.data as CapabilityOutput<K>,
    text: used.text,
    source: used.source,
    model: used.model,
    latencyMs: used.latencyMs,
    retriedToCloud,
  };
}

/* -------------------------------------------------------------------------- */
/* runChat — the assistant page's reply path                                   */
/* -------------------------------------------------------------------------- */

export type ChatResult = {
  reply: ChatReply;
  source: AiSource;
  model: string;
  latencyMs: number;
  /** True when the reply is the model's raw prose (JSON shape not achieved). */
  usedTextFallback: boolean;
};

export type ChatRequest = {
  question: string;
  history?: AiChatTurn[];
  tripContext?: string;
  preference?: InferencePreference;
};

const CHAT_SYSTEM_INSTRUCTION =
  "You are TrailMind, a practical travel assistant for independent travelers. " +
  "Be concise, accurate and specific. When uncertain, say so — never invent facts, " +
  "prices, opening hours or translations. " +
  'Respond with ONLY a single JSON object: {"reply": string, ' +
  '"flashcard": {"japanese": string, "romaji": string, "english": string} or null, ' +
  '"contingency": string or null}. ' +
  "Set `flashcard` only when the user needs a foreign-language phrase to show or " +
  "speak to someone (taxi, restaurant, medical) — then write it in the target " +
  "language with romanized pronunciation. Set `contingency` only for a genuine " +
  "practical caveat (access, closures, safety). Otherwise use null.";

/**
 * Produces one assistant reply.
 *
 * The model is asked for the structured chat shape (`reply` + optional
 * `flashcard` + `contingency`). If a valid object comes back, the flashcard
 * UI can render; if the model returns prose instead, that prose IS the answer
 * — returned verbatim as `reply` with `usedTextFallback: true`. Never a
 * fabricated flashcard, never a discarded real answer.
 *
 * No automatic cloud retry here: the text fallback already yields an honest
 * answer, so an extra round-trip isn't justified.
 */
export async function runChat(request: ChatRequest): Promise<ChatResult> {
  const prompt = request.tripContext
    ? `Saved trip context:\n${request.tripContext}\n\nQuestion: ${request.question}`
    : request.question;

  const result = await invoke({
    prompt,
    history: request.history,
    systemInstruction: CHAT_SYSTEM_INSTRUCTION,
    preference: request.preference,
  });

  const outcome = parseStructured(chatReplySchema, result.text);
  if (outcome.ok) {
    return {
      reply: {
        reply: outcome.data.reply,
        flashcard: outcome.data.flashcard ?? null,
        contingency: outcome.data.contingency ?? null,
      },
      source: result.source,
      model: result.model,
      latencyMs: result.latencyMs,
      usedTextFallback: false,
    };
  }

  return {
    reply: { reply: result.text, flashcard: null, contingency: null },
    source: result.source,
    model: result.model,
    latencyMs: result.latencyMs,
    usedTextFallback: true,
  };
}
