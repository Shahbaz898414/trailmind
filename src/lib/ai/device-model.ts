import { classifyAiError, AiUnavailableError } from "@/lib/ai/errors";
import { requireHybridModel } from "@/lib/ai/client";

/**
 * On-device model lifecycle — an honest state machine.
 *
 * ---------------------------------------------------------------------------
 * States (no state is ever "ready" without a real successful initialization):
 *   idle          → nothing attempted yet
 *   initializing  → download/preparation in progress (0..1 progress)
 *   ready         → `initializeDeviceModel()` resolved for this session
 *   unsupported   → this environment has no on-device API at all
 *                   (verified: `window.LanguageModel` missing — this is
 *                   exactly what the SDK's chromeAdapterFactory checks)
 *   error         → an attempt was made and genuinely failed
 * ---------------------------------------------------------------------------
 *
 * IMPORTANT (real SDK requirement, from `GenerativeModel.initializeDeviceModel`
 * docs): initialization that triggers a download must happen on or after a
 * user gesture (click/keypress). Call `ensureDeviceModel()` from event
 * handlers — never during render.
 */

export type DeviceModelState =
  | { status: "idle" }
  | { status: "initializing"; progress: number }
  | { status: "ready" }
  | { status: "unsupported" }
  | { status: "error"; message: string };

type Listener = (state: DeviceModelState) => void;

let state: DeviceModelState = { status: "idle" };
let inFlight: Promise<DeviceModelState> | null = null;
const listeners = new Set<Listener>();

function setState(next: DeviceModelState): void {
  state = next;
  for (const listener of listeners) listener(state);
}

/** Current state (synchronous read for rendering). */
export function getDeviceModelState(): DeviceModelState {
  return state;
}

/**
 * Subscribes to state changes. Returns an unsubscribe function.
 * The listener fires immediately with the current state.
 */
export function subscribeDeviceModelState(listener: Listener): () => void {
  listeners.add(listener);
  listener(state);
  return () => listeners.delete(listener);
}

/**
 * True when the browser exposes the Prompt API global the Firebase AI SDK
 * requires for on-device inference (`globalObj.LanguageModel`, verified in
 * `chromeAdapterFactory` in the SDK source).
 */
export function isOnDeviceApiPresent(): boolean {
  return typeof window !== "undefined" && "LanguageModel" in window;
}

/**
 * Prepares the on-device model (downloading it on first use), exactly once.
 *
 * - Unsupported environments resolve to `{ status: "unsupported" }` without
 *   pretending an attempt happened.
 * - Concurrent callers share one in-flight initialization.
 * - Download progress is published through the `initializing` state.
 *
 * Safe to call from event handlers; idempotent for the session.
 */
export async function ensureDeviceModel(): Promise<DeviceModelState> {
  if (state.status === "ready" || state.status === "unsupported") return state;
  if (inFlight) return inFlight;

  if (!isOnDeviceApiPresent()) {
    setState({
      status: "unsupported",
    });
    return state;
  }

  inFlight = (async (): Promise<DeviceModelState> => {
    setState({ status: "initializing", progress: 0 });
    try {
      // ONLY_ON_DEVICE model instance — used purely for device preparation.
      const model = requireHybridModel("on-device");
      await model.initializeDeviceModel((progress) => {
        setState({ status: "initializing", progress });
      });
      setState({ status: "ready" });
      return state;
    } catch (error) {
      const mapped = classifyAiError(error);
      // Genuine "no usable local model here" outcomes are `unsupported`,
      // not `error` — the SDK signals these with api-not-enabled/unsupported.
      const isUnsupported =
        mapped instanceof AiUnavailableError &&
        (mapped.reason === "on-device-unavailable" ||
          mapped.reason === "api-not-enabled");
      if (isUnsupported) {
        setState({ status: "unsupported" });
      } else {
        setState({
          status: "error",
          message: mapped.message,
        });
      }
      return state;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

/** Test/dev helper — returns the machine to `idle` (does not cancel downloads). */
export function resetDeviceModelState(): void {
  state = { status: "idle" };
  inFlight = null;
  for (const listener of listeners) listener(state);
}
