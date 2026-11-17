# TrailMind — AI Architecture (Firebase AI Logic, hybrid on-device + cloud)

> Reference for how the AI layer works: routing, device lifecycle, the
> capability matrix, error taxonomy, inference-source display and offline
> behaviour. Companion docs: `FIRESTORE_SCHEMA.md`, `OFFLINE_SYNC.md`,
> `BACKEND_SETUP.md`.

## 1. Architecture

```
UI (assistant page, feature pages)
        │
        ▼
src/lib/ai/                     ← the only AI layer in the app
  hybrid-model.ts   public barrel (stable import surface)
  client.ts         getAI(GoogleAIBackend) + getGenerativeModel → InferenceMode
  capabilities.ts   the 9 use cases: prompt builder + Zod schema + device flag
  generate.ts       invoke() primitive · runCapability() · runChat() · generateText()
  device-model.ts   on-device lifecycle state machine
  structured.ts     JSON extraction (markdown fences) + Zod validation
  context.ts        bounded saved-trip context builder (≤ 1200 chars)
  errors.ts         honest error taxonomy (real SDK codes only)
        │
        ▼
firebase/ai (official `@firebase/ai` Web SDK)
   ├── on-device  → Chrome Prompt API (`window.LanguageModel`, Gemini Nano)
   └── in-cloud   → Firebase AI Logic → Gemini (default `gemini-2.5-flash`)
```

Key rules:

- **One primitive.** Every model call goes through `invoke()` in
  `generate.ts`. It resolves the `InferenceMode`, prepares the device model
  when the caller explicitly demanded on-device, performs the request,
  checks the real safety signals, and returns the text with the SDK-reported
  inference source.
- **Nothing is fabricated.** No canned answers, no simulated latency, no
  assumed sources. If the SDK omits `inferenceSource`, the result says
  `"unknown"`.
- **Client-only.** The layer reads `navigator.onLine` and browser AI globals
  — import it only from Client Components.

## 2. Local vs cloud inference (verified SDK routing)

The routing table below is taken directly from the installed SDK source
(`node_modules/@firebase/ai/dist/index.cjs.js`, `callCloudOrDevice`):

| `InferenceMode` | Browser has `LanguageModel`? | Device model usable? | Result |
|---|---|---|---|
| `PREFER_ON_DEVICE` (our `"auto"`) | yes | yes → **on-device** | `inferenceSource: "on_device"` |
| `PREFER_ON_DEVICE` (our `"auto"`) | yes | no → **cloud** | `inferenceSource: "in_cloud"` |
| `PREFER_ON_DEVICE` (our `"auto"`) | no | – → **cloud** (adapter absent) | `inferenceSource: "in_cloud"` |
| `ONLY_ON_DEVICE` (our `"on-device"`) | no | – → **hard error** before the SDK (our guard) or `AIError(unsupported)` | typed error |
| `ONLY_ON_DEVICE` (our `"on-device"`) | yes | no → `AIError(unsupported)` | typed error |
| `ONLY_IN_CLOUD` (our `"cloud"`) | – | – → **cloud** | `inferenceSource: "in_cloud"` |

The app exposes three preferences (`InferencePreference`):

| App preference | SDK mode | Used when |
|---|---|---|
| `"auto"` | `PREFER_ON_DEVICE` (offline → `ONLY_ON_DEVICE`) | engine switcher = "On-Device (Preferred)" (default) |
| `"on-device"` | `ONLY_ON_DEVICE` | explicit local-only requests (API surface) |
| `"cloud"` | `ONLY_IN_CLOUD` | engine switcher = "Cloud Only" |

Important honesty guard: the SDK would silently fall back to **cloud** for
`ONLY_ON_DEVICE` when the browser has no `LanguageModel` global (adapter
absent). The app detects that case itself (`isOnDeviceApiPresent()`) and
throws `AiUnavailableError("on-device-unavailable")` **before** calling the
SDK, so an explicit on-device request can never be silently answered from
the cloud.

## 3. Model initialization flow (user gesture + progress)

Chrome requires a user interaction before the on-device model may download.
`device-model.ts` implements an honest state machine:

```
idle ──(user gesture)──▶ initializing(progress 0..1) ──▶ ready
  │                              │                        │
  │                              ├──▶ unsupported (no window.LanguageModel,
  │                              │     or SDK: "Local LanguageModel API not
  │                              │     available in this environment")
  │                              └──▶ error (download/other failure, message kept)
  └──▶ unsupported (environment probe, no attempt made)
```

- `ensureDeviceModel()` is idempotent; concurrent callers share one
  in-flight initialization; `subscribeDeviceModelState()` drives UI
  (engine-button dot, sidebar status card, download %).
- The app triggers it from **event handlers only**: the "On-Device
  (Preferred)" engine button and the sidebar's "Prepare local model" button.
- The state machine never reports `ready` unless
  `GenerativeModel.initializeDeviceModel()` genuinely resolved (the SDK
  silently no-ops when the adapter is missing — the app's own
  `isOnDeviceApiPresent()` probe runs first so this can't produce a false
  `ready`).

## 4. Capability matrix (the 9 use cases)

| # | Capability | id | Structured output (Zod) | On-device? | Rationale |
|---|---|---|---|---|---|
| 1 | Trip planning | `trip-planning` | `tripPlanSchema` | ✅ | Prompt-driven reasoning over user details, bounded output |
| 2 | Day-wise itinerary | `day-itinerary` | `dayItinerarySchema` | ✅ | One day per call, small JSON; `category` matches the Firestore enum so output can be saved directly |
| 3 | Destination recommendations | `recommendations` | `recommendationsSchema` | ✅ | Static-knowledge reasoning, no live data |
| 4 | Travel questions | `travel-qa` | free text | ✅ | Core chat Q&A; history flattened into the request |
| 5 | Packing list | `packing-list` | `packingListSchema` | ✅ | Deterministic structured output from trip parameters |
| 6 | Guide summarization | `guide-summary` | free text | ❌ **cloud-only** | Document-sized input exceeds the on-device context window; no local document processing is assumed |
| 7 | Culture / travel tips | `culture-tips` | `cultureTipsSchema` | ✅ | Static-knowledge, bounded list |
| 8 | Saved-trip Q&A | `trip-context-qa` | free text | ✅ | Context is capped at 1200 chars by construction (`buildTripContext`) |
| 9 | Travel phrases | `phrase-assist` | `phraseAssistSchema` | ✅ | Short structured output |

**Actual on-device limitations respected by this design:** no tool calling,
no live APIs/search, no document processing, small context window. Anything
needing those (currently only `guide-summary`) is cloud-only and *fails
honestly* if asked to run on-device (`AiUnsupportedError`) — it never
pretends to have done it locally.

Structured capabilities also handle the messy reality of LLM JSON: fenced
blocks, leading commentary, schema drift — extracted in `structured.ts`,
validated by Zod; failure is a typed error, not a guess.

**Automatic cloud retry (structured capabilities only):** if a response with
`inferenceSource === "on_device"` fails JSON parsing, the same prompt is
retried once in `ONLY_IN_CLOUD` mode — only when the caller didn't force
on-device and the browser is online. The returned `source` always belongs to
the response actually used, and `retriedToCloud` flags the swap. Free-text
chat (`runChat`) does **not** retry: its text fallback already yields an
honest answer.

## 5. Error taxonomy (`errors.ts`)

| Class | Meaning | Typical real trigger |
|---|---|---|
| `AiUnavailableError` (`reason`) | No answer possible — reasons: `not-configured`, `on-device-unavailable`, `api-not-enabled`, `offline`, `failed` | Missing env vars; no `LanguageModel`; AI API disabled; offline with no usable device path; undetermined (original message preserved) |
| `AiSafetyBlockError` | Real safety signal | `promptFeedback.blockReason` (SAFETY/BLOCKLIST/PROHIBITED_CONTENT/OTHER) or a candidate `FinishReason` (SAFETY, RECITATION, SPII, …) |
| `AiRateLimitError` | Rate limit / quota | Error text carries a genuine `429` / quota / `RESOURCE_EXHAUSTED` signal |
| `AiNetworkError` | Transport failure | `fetch-error` / "Failed to fetch"-class messages while online |
| `AiInvalidResponseError` (`kind`) | Unusable reply: `empty-response`, `invalid-json`, `schema-mismatch` | Empty candidate; JSON extraction failure; Zod rejection |
| `AiUnsupportedError` | Operation rejected by design | Cloud-only capability forced on-device; `session-closed`; invalid request shape |

Classification (`classifyAiError`) uses only real evidence: the SDK's
`AIErrorCode` values (`no-api-key`, `api-not-enabled`, `unsupported`,
`fetch-error`, `request-error`, `response-error`, `parse-failed`, …) →
message signals → connectivity state. When no cause can be proven, the
result is `AiUnavailableError("failed")` with the original message — a
specific cause is never invented. The UI renders everything through
`aiUserMessage()` (role="alert" capsule on the assistant page).

## 6. Inference-source display

- Each assistant message shows a badge derived from the SDK's real
  `response.inferenceSource`: `"on_device"` → **On-Device AI**,
  `"in_cloud"` → **Cloud AI**, absent → **AI · source unknown**.
- Latency shown per message is measured client-side around the actual call.
- The value persisted to Firestore messages is `source: "on-device" |
  "cloud"` (or `null` when unknown) — see `FIRESTORE_SCHEMA.md`.

## 7. Offline behaviour

- `navigator.onLine === false` + preference `"auto"` resolves to
  `ONLY_ON_DEVICE` so the SDK never schedules a cloud round-trip it can't
  complete; if the device model can't answer, the error is
  `AiUnavailableError("offline")` — an honest failure, never a fake reply.
- On-device requests work fully offline once the model is downloaded.
- Cloud-only capabilities (`guide-summary`) and `"cloud"` preference fail
  fast offline with `AiUnavailableError("offline")`.
- The assistant page shows a real offline banner driven by the browser's
  connectivity events (the previous "Simulate Air-Gap" fake was removed).

## 8. Conversation persistence

Chat history is persisted by `src/services/conversations.ts`
(Firestore `users/{uid}/conversations/{id}/messages`, Dexie fallback) with a
three-state honesty model — `synced` (server-confirmed) / `pending`
(queued by Firestore's persistent offline cache, not yet confirmed) /
`local-only` (IndexedDB only, never sent). See `OFFLINE_SYNC.md`.

## 9. What is deliberately NOT done

- No fake latency numbers, no scripted answers, no simulated offline mode.
- No translation/lookup of live data (flights, weather, prices) — the app
  never claims to have facts it can't verify.
- No automatic cloud upgrade for explicitly local requests.
- No claims about specific on-device model versions beyond what the browser
  actually exposes (`window.LanguageModel`); the UI says "On-Device model",
  not a specific weight name that isn't verifiable.
- No emulator path for AI: Firebase AI Logic has no emulator — testing
  requires a configured project (see `BACKEND_SETUP.md` §6).
