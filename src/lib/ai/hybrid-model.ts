import {
  GoogleAIBackend,
  InferenceMode,
  getAI,
  getGenerativeModel,
  type Content,
  type GenerateContentRequest,
  type GenerativeModel,
} from "firebase/ai";

import { getFirebaseApp } from "@/lib/firebase/client";
import { firebaseAiModel, isFirebaseConfigured } from "@/lib/firebase/config";

/**
 * Hybrid AI model — Firebase AI Logic with on-device + in-cloud inference.
 *
 * ---------------------------------------------------------------------------
 * STATUS: integration scaffold, NOT yet verified.
 * ---------------------------------------------------------------------------
 * This module talks to the **official Firebase AI Logic Web SDK**
 * (`firebase/ai`, re-exporting `@firebase/ai`) — it does not wrap a fake or
 * mocked response anywhere. What it does *not* do yet:
 *
 *   - It has not been run against a real Firebase project, so no behaviour
 *     here should be described as "working" until it has been tested in Chrome.
 *   - On-device inference depends on Chrome's Prompt API (Gemini Nano) being
 *     available and the model being downloaded first. When it is unavailable,
 *     this module throws `AiUnavailableError` — it never silently invents an
 *     answer to hide the failure.
 *
 * Inference routing (handled by the SDK through `InferenceMode`):
 *   auto       → prefer on-device, fall back to cloud when online
 *   on-device  → ONLY_ON_DEVICE  (fails if the device model is not ready)
 *   cloud      → ONLY_IN_CLOUD
 *
 * This module touches browser APIs (`navigator`, Prompt API), so import it
 * only from Client Components.
 */

export type InferencePreference = "auto" | "on-device" | "cloud";

export type AiChatTurn = { role: "user" | "assistant"; text: string };

export type AiRequest = {
  prompt: string;
  /** Prior turns for multi-turn conversations. */
  history?: AiChatTurn[];
  /** Optional system instruction, e.g. travel-assistant persona. */
  systemInstruction?: string;
  /** Defaults to `"auto"`. */
  preference?: InferencePreference;
};

export type AiResult = {
  text: string;
  /** Reported by the SDK — where inference actually happened. */
  source: "on_device" | "in_cloud";
  model: string;
  latencyMs: number;
};

export type AiUnavailableReason =
  | "not-configured"
  | "on-device-unavailable"
  | "offline"
  | "failed";

/**
 * Thrown when a response could not be produced.
 *
 * Deliberately distinct from a "no answer" result: the UI must show this to
 * the user rather than presenting a fabricated reply.
 */
export class AiUnavailableError extends Error {
  readonly reason: AiUnavailableReason;

  constructor(reason: AiUnavailableReason, message: string) {
    super(message);
    this.name = "AiUnavailableError";
    this.reason = reason;
  }
}

/** True when Firebase is configured well enough to attempt AI calls. */
export function isHybridModelConfigured(): boolean {
  return isFirebaseConfigured;
}

function resolveInferenceMode(
  preference: InferencePreference = "auto"
): InferenceMode {
  if (preference === "on-device") return InferenceMode.ONLY_ON_DEVICE;
  if (preference === "cloud") return InferenceMode.ONLY_IN_CLOUD;

  // "auto": never force a network round-trip while the device is offline.
  const online =
    typeof navigator === "undefined" ? false : navigator.onLine;
  return online ? InferenceMode.PREFER_ON_DEVICE : InferenceMode.ONLY_ON_DEVICE;
}

/**
 * Builds the Firebase AI Logic model for the requested inference preference.
 * Returns `null` when Firebase is not configured.
 */
export function createHybridModel(
  preference: InferencePreference = "auto"
): GenerativeModel | null {
  const app = getFirebaseApp();
  if (!app) return null;

  const ai = getAI(app, { backend: new GoogleAIBackend() });

  return getGenerativeModel(ai, {
    mode: resolveInferenceMode(preference),
    inCloudParams: { model: firebaseAiModel },
  });
}

/**
 * Prepares the on-device model, downloading it if necessary.
 *
 * The Chrome Prompt API requires a user gesture before a download can start,
 * so call this from an event handler (a button click), not during render.
 * Returns `true` when the device model is ready.
 */
export async function initializeOnDeviceModel(
  onDownloadProgress?: (progress: number) => void
): Promise<boolean> {
  const model = createHybridModel("on-device");
  if (!model) return false;

  try {
    await model.initializeDeviceModel(onDownloadProgress);
    return true;
  } catch (error) {
    console.warn("[TrailMind] On-device model unavailable:", error);
    return false;
  }
}

/**
 * Sends one request through the hybrid model and returns the model's answer.
 *
 * Throws `AiUnavailableError` when no answer can honestly be produced —
 * there is no canned fallback in this code path.
 */
export async function generateContent(request: AiRequest): Promise<AiResult> {
  const model = createHybridModel(request.preference);
  if (!model) {
    throw new AiUnavailableError(
      "not-configured",
      "Firebase is not configured. Add your Firebase web app values to .env.local."
    );
  }

  const startedAt = performance.now();

  try {
    const payload: GenerateContentRequest = {
      contents: toContents(request),
    };
    if (request.systemInstruction) {
      payload.systemInstruction = request.systemInstruction;
    }

    const result = await model.generateContent(payload);

    return {
      text: result.response.text(),
      source: result.response.inferenceSource ?? "in_cloud",
      model: firebaseAiModel,
      latencyMs: Math.round(performance.now() - startedAt),
    };
  } catch (error) {
    throw toUnavailableError(error);
  }
}

/** Maps SDK/network failures onto a reason the UI can render. */
function toUnavailableError(error: unknown): AiUnavailableError {
  if (error instanceof AiUnavailableError) return error;

  const message = error instanceof Error ? error.message : String(error);
  const offline =
    typeof navigator !== "undefined" && navigator.onLine === false;

  if (offline) {
    return new AiUnavailableError(
      "offline",
      "You are offline and the on-device model is not available for this request."
    );
  }

  return new AiUnavailableError(
    "failed",
    `The model could not be reached: ${message}`
  );
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
