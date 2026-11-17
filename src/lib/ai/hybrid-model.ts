/**
 * Hybrid AI — public entry point for the Firebase AI Logic integration.
 *
 * ---------------------------------------------------------------------------
 * STATUS: real integration against the official `firebase/ai` Web SDK.
 * There are NO mocked, canned, or fabricated responses anywhere in this
 * layer. Every answer carries the SDK-reported inference source
 * (`on_device` / `in_cloud` / `unknown`), and every failure surfaces as a
 * typed error (see `errors.ts`) the UI must render honestly.
 * ---------------------------------------------------------------------------
 *
 * Module map:
 *   `client.ts`         lazy `getAI`/`getGenerativeModel` + preference→InferenceMode
 *   `device-model.ts`   on-device lifecycle state machine (user-gesture download)
 *   `capabilities.ts`   the 9 travel use cases + Zod schemas + device matrix
 *   `generate.ts`       `invoke` primitive, `runCapability`, `runChat`, `generateText`
 *   `structured.ts`     JSON extraction (markdown fences tolerated) + Zod parse
 *   `context.ts`        bounded saved-trip context builder
 *   `errors.ts`         honest error taxonomy mapped from real SDK codes
 *
 * Routing (handled by the SDK through `InferenceMode`):
 *   auto       → PREFER_ON_DEVICE (ONLY_ON_DEVICE while offline)
 *   on-device  → ONLY_ON_DEVICE  (fails honestly when unavailable)
 *   cloud      → ONLY_IN_CLOUD
 *
 * On-device initialization requires a user gesture (Chrome Prompt API
 * download rule) — call `ensureDeviceModel()` from event handlers.
 *
 * This layer touches browser APIs — import only from Client Components.
 */

/* Types & core generation */
export type {
  AiChatTurn,
  AiRequest,
  AiResult,
  AiSource,
  CapabilityResult,
  ChatRequest,
  ChatResult,
  RunCapabilityOptions,
} from "@/lib/ai/generate";
export { generateText, runCapability, runChat } from "@/lib/ai/generate";
/* Back-compat alias from the original scaffold — same honest behaviour. */
export { generateText as generateContent } from "@/lib/ai/generate";

/* Client & routing */
export type { InferencePreference } from "@/lib/ai/client";
export {
  createHybridModel,
  isHybridModelConfigured,
  requireHybridModel,
  resolveInferenceMode,
} from "@/lib/ai/client";

/* On-device lifecycle */
export type { DeviceModelState } from "@/lib/ai/device-model";
export {
  ensureDeviceModel,
  getDeviceModelState,
  isOnDeviceApiPresent,
  resetDeviceModelState,
  subscribeDeviceModelState,
} from "@/lib/ai/device-model";
import { ensureDeviceModel, subscribeDeviceModelState } from "@/lib/ai/device-model";
import type { DeviceModelState } from "@/lib/ai/device-model";

/**
 * Prepares the on-device model (downloads on first use).
 *
 * Kept from the original scaffold's API: resolves `true` only when the device
 * model is genuinely ready — `false` for unsupported/error states.
 */
export async function initializeOnDeviceModel(
  onDownloadProgress?: (progress: number) => void
): Promise<boolean> {
  const unsubscribe = onDownloadProgress
    ? subscribeDeviceModelState((state: DeviceModelState) => {
        if (state.status === "initializing") onDownloadProgress(state.progress);
      })
    : () => {};
  try {
    const state = await ensureDeviceModel();
    return state.status === "ready";
  } finally {
    unsubscribe();
  }
}

/* Capabilities (the 9 use cases) */
export type {
  CapabilityId,
  CapabilityInput,
  CapabilityOutput,
  ChatReply,
  CultureTips,
  DayItinerary,
  PackingList,
  PhraseAssist,
  Recommendations,
  TripPlan,
} from "@/lib/ai/capabilities";
export { CAPABILITY_IDS, capabilities, getCapability } from "@/lib/ai/capabilities";

/* Context */
export { buildTripContext, MAX_TRIP_CONTEXT_CHARS } from "@/lib/ai/context";
export type { TripContextActivity, TripContextTrip } from "@/lib/ai/context";

/* Errors — the honest taxonomy */
export type { AiInvalidResponseKind, AiUnavailableReason } from "@/lib/ai/errors";
export {
  AiInvalidResponseError,
  AiNetworkError,
  AiRateLimitError,
  AiSafetyBlockError,
  AiUnsupportedError,
  AiUnavailableError,
  aiUserMessage,
  classifyAiError,
} from "@/lib/ai/errors";

/* Structured parsing (exported for tests) */
export { extractJson, parseStructured } from "@/lib/ai/structured";
