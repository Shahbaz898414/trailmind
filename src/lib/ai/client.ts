import {
  GoogleAIBackend,
  InferenceMode,
  getAI,
  getGenerativeModel,
  type GenerativeModel,
} from "firebase/ai";

import { getFirebaseApp } from "@/lib/firebase/client";
import { firebaseAiModel, isFirebaseConfigured } from "@/lib/firebase/config";
import { AiUnavailableError } from "@/lib/ai/errors";

/**
 * Lazy Firebase AI Logic client — hybrid (on-device + in-cloud) inference.
 *
 * Verified against `node_modules/@firebase/ai/dist/ai-public.d.ts`:
 *   - `getAI(app, { backend: new GoogleAIBackend() })`
 *   - `getGenerativeModel(ai, HybridParams)` where hybrid params are
 *     `{ mode, inCloudParams?: ModelParams, onDeviceParams?: OnDeviceParams }`
 *     — in hybrid mode, `model` MUST live inside `inCloudParams` (the SDK
 *     warns and ignores top-level keys besides `mode`).
 *   - `InferenceMode` = PREFER_ON_DEVICE | ONLY_ON_DEVICE | ONLY_IN_CLOUD |
 *     PREFER_IN_CLOUD (default for hybrid is PREFER_ON_DEVICE).
 *
 * This module touches browser APIs — import only from Client Components.
 */

/** Caller-facing routing preference. `"auto"` = prefer device, fall back to cloud. */
export type InferencePreference = "auto" | "on-device" | "cloud";

/** True when Firebase is configured well enough to attempt AI calls. */
export function isHybridModelConfigured(): boolean {
  return isFirebaseConfigured;
}

/**
 * Resolves a preference to the SDK's real `InferenceMode`.
 *
 * Offline behaviour is deliberate: `"auto"` never schedules a cloud round-trip
 * while `navigator.onLine === false` — it becomes ONLY_ON_DEVICE so failures
 * are honest ("offline, device model can't answer") instead of a hung fetch.
 */
export function resolveInferenceMode(
  preference: InferencePreference = "auto"
): InferenceMode {
  if (preference === "on-device") return InferenceMode.ONLY_ON_DEVICE;
  if (preference === "cloud") return InferenceMode.ONLY_IN_CLOUD;

  const online = typeof navigator === "undefined" ? true : navigator.onLine;
  return online ? InferenceMode.PREFER_ON_DEVICE : InferenceMode.ONLY_ON_DEVICE;
}

/**
 * Builds the hybrid model for the requested preference.
 *
 * @throws AiUnavailableError("not-configured") when Firebase config is missing
 *         (never returns null silently — callers need the honest reason).
 */
export function requireHybridModel(
  preference: InferencePreference = "auto"
): GenerativeModel {
  const app = getFirebaseApp();
  if (!app || !isFirebaseConfigured) {
    throw new AiUnavailableError(
      "not-configured",
      "Firebase is not configured. Add your Firebase web app values to .env.local."
    );
  }

  const ai = getAI(app, { backend: new GoogleAIBackend() });

  return getGenerativeModel(ai, {
    mode: resolveInferenceMode(preference),
    inCloudParams: { model: firebaseAiModel },
  });
}

/**
 * Non-throwing variant used where `null` maps to an honest "not configured"
 * UI state (kept for the original scaffold's call sites).
 */
export function createHybridModel(
  preference: InferencePreference = "auto"
): GenerativeModel | null {
  if (!isFirebaseConfigured || !getFirebaseApp()) return null;
  return requireHybridModel(preference);
}
