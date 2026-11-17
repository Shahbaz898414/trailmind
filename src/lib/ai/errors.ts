/**
 * Honest AI error taxonomy.
 *
 * ---------------------------------------------------------------------------
 * RULE: every failure path produces a TYPED error the UI can render. Nothing
 * in this codebase ever fabricates a model answer, an inference source, or a
 * "working" state to hide a failure. Each class below exists so the UI can
 * tell the user exactly what went wrong.
 * ---------------------------------------------------------------------------
 *
 * Mapping is driven by the REAL `@firebase/ai` error surface (verified in
 * `node_modules/@firebase/ai/dist/ai-public.d.ts`):
 *
 *   class AIError extends FirebaseError { readonly code: AIErrorCode }
 *   AIErrorCode = "error" | "request-error" | "response-error" | "fetch-error"
 *               | "session-closed" | "invalid-content" | "api-not-enabled"
 *               | "already-initialized" | "invalid-schema" | "no-api-key"
 *               | "no-app-id" | "no-model" | "no-project-id" | "parse-failed"
 *               | "unsupported"
 *
 * The SDK constructs messages as `ai: <message> (ai/<code>)`, so classifiers
 * accept either the short `code` or a prefixed `ai/<code>` form. When a cause
 * cannot be determined from real evidence (code/message/offline state), the
 * result is the generic `AiUnavailableError("failed")` with the original
 * message — never a guessed specific cause.
 */

/* -------------------------------------------------------------------------- */
/* Error classes                                                               */
/* -------------------------------------------------------------------------- */

export type AiUnavailableReason =
  /** Firebase web config is missing entirely (.env.local not filled in). */
  | "not-configured"
  /** On-device inference was required but the device model can't run here. */
  | "on-device-unavailable"
  /** The Firebase AI Logic API (or the local LanguageModel API) is disabled. */
  | "api-not-enabled"
  /** No network and no usable on-device path for this request. */
  | "offline"
  /** The model could not be reached for an undetermined reason. */
  | "failed";

/** Model unavailable / not configured / offline — the general "no answer" family. */
export class AiUnavailableError extends Error {
  readonly reason: AiUnavailableReason;

  constructor(reason: AiUnavailableReason, message: string) {
    super(message);
    this.name = "AiUnavailableError";
    this.reason = reason;
  }
}

/** The platform refused the request for safety reasons (real SDK block signal). */
export class AiSafetyBlockError extends Error {
  /** The SDK's actual `BlockReason` / `FinishReason` value, or null when unknown. */
  readonly blockReason: string | null;

  constructor(blockReason: string | null, message?: string) {
    super(
      message ??
        `The model blocked this request${blockReason ? ` (${blockReason})` : ""}.`
    );
    this.name = "AiSafetyBlockError";
    this.blockReason = blockReason;
  }
}

/** Real rate-limit / quota signal (HTTP 429 / RESOURCE_EXHAUSTED in the error). */
export class AiRateLimitError extends Error {
  constructor(message = "The model is busy right now (rate limited). Try again in a moment.") {
    super(message);
    this.name = "AiRateLimitError";
  }
}

/** The request never completed — a transport/network failure. */
export class AiNetworkError extends Error {
  constructor(message = "The model could not be reached. Check your connection and try again.") {
    super(message);
    this.name = "AiNetworkError";
  }
}

export type AiInvalidResponseKind =
  /** The model returned nothing usable (empty candidate / no text). */
  | "empty-response"
  /** The response was expected to be JSON and could not be parsed. */
  | "invalid-json"
  /** JSON parsed but didn't satisfy the declared schema. */
  | "schema-mismatch";

/** A response arrived but could not be used as-is. */
export class AiInvalidResponseError extends Error {
  readonly kind: AiInvalidResponseKind;

  constructor(kind: AiInvalidResponseKind, message: string) {
    super(message);
    this.name = "AiInvalidResponseError";
    this.kind = kind;
  }
}

/** The operation isn't supported in the current configuration (by design). */
export class AiUnsupportedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiUnsupportedError";
  }
}

/* -------------------------------------------------------------------------- */
/* SDK error classification                                                    */
/* -------------------------------------------------------------------------- */

const AI_ERROR_CODES = new Set<string>([
  "error",
  "request-error",
  "response-error",
  "fetch-error",
  "session-closed",
  "invalid-content",
  "api-not-enabled",
  "already-initialized",
  "invalid-schema",
  "no-api-key",
  "no-app-id",
  "no-model",
  "no-project-id",
  "parse-failed",
  "unsupported",
]);

/** Extracts an `AIErrorCode` from an SDK error, or `null` for other errors. */
function sdkErrorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null) return null;
  const code = (error as { code?: unknown }).code;
  if (typeof code !== "string") return null;
  const short = code.replace(/^(ai|firebase-ai)\//, "");
  return AI_ERROR_CODES.has(short) ? short : null;
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/** True when the error text carries a genuine rate-limit signal. */
function looksLikeRateLimit(message: string): boolean {
  return /\b429\b|rate.?limit|quota|RESOURCE_EXHAUSTED|too many requests|overloaded/i.test(
    message
  );
}

/** True when the error text carries a genuine transport failure signal. */
function looksLikeNetworkFailure(message: string): boolean {
  return /failed to fetch|networkerror|network request failed|load failed|ECONN|timed? ?out|fetch failed/i.test(
    message
  );
}

/**
 * Maps any thrown value onto the typed AI taxonomy using real evidence
 * (SDK code → message signals → connectivity state). Unknown failures become
 * `AiUnavailableError("failed")` with the original message preserved — the
 * cause is never invented.
 */
export function classifyAiError(error: unknown): Error {
  if (
    error instanceof AiUnavailableError ||
    error instanceof AiSafetyBlockError ||
    error instanceof AiRateLimitError ||
    error instanceof AiNetworkError ||
    error instanceof AiInvalidResponseError ||
    error instanceof AiUnsupportedError
  ) {
    return error;
  }

  const message = errorText(error);
  const code = sdkErrorCode(error);

  if (code) {
    switch (code) {
      case "no-api-key":
      case "no-app-id":
      case "no-project-id":
      case "no-model":
        return new AiUnavailableError(
          "not-configured",
          "Firebase AI Logic is not configured. Add the missing Firebase values to .env.local."
        );

      case "api-not-enabled":
        // The SDK uses this code for BOTH cases — distinguish by real message text:
        //   "Local LanguageModel API not available in this environment."
        //   vs the cloud API being disabled in the Firebase console.
        if (/local languagemodel/i.test(message)) {
          // Offline + not-available: the truthful cause for the USER is
          // "offline" (the browser may well support on-device, the model
          // just isn't usable right now with no network).
          if (isOffline()) {
            return new AiUnavailableError(
              "offline",
              "You are offline and the on-device model cannot answer this request."
            );
          }
          return new AiUnavailableError(
            "on-device-unavailable",
            "This browser has no on-device model available. Use a Chrome version with the Prompt API (Gemini Nano), or switch to the cloud engine."
          );
        }
        return new AiUnavailableError(
          "api-not-enabled",
          "Firebase AI Logic is not enabled for this project. Enable it in the Firebase console (Build → AI Logic)."
        );

      case "unsupported":
        if (/only_on_device|on-device/i.test(message)) {
          if (isOffline()) {
            return new AiUnavailableError(
              "offline",
              "You are offline and the on-device model cannot answer this request."
            );
          }
          return new AiUnavailableError(
            "on-device-unavailable",
            "The on-device model is not available for this request. Switch to the cloud engine or use a supported Chrome version."
          );
        }
        return new AiUnsupportedError(message);

      case "fetch-error":
      case "request-error":
      case "response-error":
        if (looksLikeRateLimit(message)) return new AiRateLimitError(message);
        if (isOffline()) {
          return new AiUnavailableError(
            "offline",
            "You are offline and the on-device model cannot answer this request."
          );
        }
        if (looksLikeNetworkFailure(message) || code === "fetch-error") {
          return new AiNetworkError(
            `The model could not be reached: ${message}`
          );
        }
        return new AiUnavailableError("failed", message);

      case "parse-failed":
      case "invalid-content":
        return new AiInvalidResponseError(
          "invalid-json",
          "The model service returned a response the app could not parse."
        );

      case "session-closed":
        return new AiUnsupportedError(
          "That model session has already ended. Start a new request."
        );

      case "invalid-schema":
        return new AiUnsupportedError(
          "The app sent an invalid request shape to the model (invalid-schema). This is a bug — check the capability schema."
        );

      case "already-initialized":
        return new AiUnavailableError("failed", message);

      case "error":
      default:
        // Real but generic SDK error — fall through to the evidence checks below.
        break;
    }
  }

  // Non-AIError failures (or generic AIError "error"): use real signals.
  if (looksLikeRateLimit(message)) return new AiRateLimitError(message);
  if (isOffline()) {
    return new AiUnavailableError(
      "offline",
      "You are offline and the on-device model cannot answer this request."
    );
  }
  if (looksLikeNetworkFailure(message)) return new AiNetworkError(message);

  return new AiUnavailableError("failed", message);
}

/* -------------------------------------------------------------------------- */
/* UI-safe messages                                                            */
/* -------------------------------------------------------------------------- */

/** Renders an AI failure as a message that is safe and honest to show users. */
export function aiUserMessage(error: unknown): string {
  const e =
    error instanceof Error ? error : new Error(String(error ?? "Unknown error."));

  if (e instanceof AiUnavailableError) {
    switch (e.reason) {
      case "not-configured":
        return "The AI backend isn't configured yet. Add your Firebase values to .env.local, then reload.";
      case "on-device-unavailable":
        return e.message;
      case "api-not-enabled":
        return e.message;
      case "offline":
        return e.message;
      case "failed":
        return `The model could not be reached. ${e.message}`;
    }
  }
  if (e instanceof AiSafetyBlockError) {
    return "The model declined this request because of its safety filters. Try rephrasing.";
  }
  if (e instanceof AiRateLimitError) {
    return e.message;
  }
  if (e instanceof AiNetworkError) {
    return e.message;
  }
  if (e instanceof AiInvalidResponseError) {
    switch (e.kind) {
      case "empty-response":
        return "The model returned an empty response. Try again or rephrase.";
      case "invalid-json":
        return "The model's reply couldn't be structured. Try again — or switch engines.";
      case "schema-mismatch":
        return "The model's reply didn't match the expected format. Try again — or switch engines.";
    }
  }
  if (e instanceof AiUnsupportedError) {
    return e.message;
  }
  return e.message;
}
