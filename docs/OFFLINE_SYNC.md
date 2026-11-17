# TrailMind — Offline & Sync Architecture

> How TrailMind keeps working without a network, what is actually persisted
> locally, and how queued writes reach Firestore. Companion docs:
> `FIRESTORE_SCHEMA.md` (data layout), `AI_ARCHITECTURE.md` (inference),
> `BACKEND_SETUP.md` (setup).

## 1. Two local layers (and why both exist)

```text
                ┌──────────────────────────────────────────────┐
  ONLINE ──────►│ Firestore web SDK                            │
                │  persistentLocalCache +                      │
                │  persistentMultipleTabManager                │
                │  (SDK natively queues offline writes)       │
                └──────────────────────────────────────────────┘
                ┌──────────────────────────────────────────────┐
  OFFLINE ─────►│ Dexie / IndexedDB  ("trailmind" v2)          │
                │  • mirror tables  → offline READ source      │
                │  • syncQueue      → app-level OUTBOX (writes)│
                └──────────────────────────────────────────────┘
```

- **Firestore's persistent cache** is the first line: it caches documents for
  offline reads of already-seen data and queues writes made while offline,
  retrying them when connectivity returns. This is real SDK behaviour, not
  app code.
- **Dexie** is the app-level layer that Firestore's cache cannot provide:
  - a **mirror** of the records the UI needs (trips, activities, documents…)
    so offline reads are complete, ordered and filtered exactly like online
    reads — even for data never fetched in this session's server round-trip;
  - an **outbox** (`syncQueue`) for writes that must carry conflict bases
    (`baseVersion` / `baseUpdatedAt`) and be applied with app-level conflict
    detection, which the SDK's blind retry cannot do.

**Exactly one copy exists per record.** Configured backend → Firestore (its
cache queues writes even offline); unconfigured backend → Dexie only. The two
never overlap for the same record, so reads cannot double-count.

## 2. Dexie schema (`src/lib/offline/db.ts`, version 2)

| Table | Key / indexes | Contents |
|---|---|---|
| `trips` | `id` | `TripRecord` mirror (+ mirror-only `syncState?: "queued"`) |
| `savedPlaces` | `id`, `tripId?` | saved-place mirror |
| `itineraryItems` | `id`, `tripId`, `[tripId+day+order]` | `CachedActivity` = activity + `tripId` |
| `documentsMeta` | `id`, `tripId?` | wallet metadata mirror (never file bytes) |
| `phrases` | `id` | phrasebook mirror |
| `notifications` | `id`, `read` | notification mirror |
| `conversations` | `id` | conversation mirror |
| `chatMessages` | `id`, `conversationId` | local-only chat messages |
| `syncQueue` | `id`, `entity`, `uid`, `createdAt` | the outbox (see §3) |

Rules:

- **Document bytes are never cached.** Files live in Firebase Storage only;
  `offlineAvailable` is set from the user's explicit download action, never
  speculatively. Offline upload attempts fail with an honest message and are
  **not queued** (an entry pointing at bytes that were never uploaded would
  be a lie).
- **Mirror merge policy is put/bulkPut, never mass-delete.** An online
  refresh must not wipe locally queued creates that the server hasn't seen
  yet; deletes are explicit (`dropCachedTrip`, `dropCachedActivity`, …).
- `clearOfflineData()` (settings) wipes the whole DB including the outbox —
  it is user-initiated and documented as "pending changes are discarded".

## 3. The outbox (`syncQueue`) — `src/lib/offline/mutation-queue.ts`

```ts
type SyncOperation = {
  id: string;              // UUID
  uid: string;             // owner — engine never flushes across users
  entity: OfflineEntity;   // "trip" | "activity" | "document" | …
  entityId: string;
  operation: "create" | "update" | "delete";
  payload?: Record<string, unknown>;
  createdAt: string;       // ISO — drain order (oldest first)
  attempts: number;
  baseVersion?: number;    // conflict base (trips)
  baseUpdatedAt?: string;  // conflict base (activities, documents)
  lastError?: string;      // "conflict: …" | "permanent: …" | last failure
};
```

**Enqueue contract (no double-writes):**

- A write is enqueued **only** when the service took its offline branch
  (`isOfflineForData()` = configured **and** `navigator.onLine === false`).
  Online writes go straight to Firestore and never touch the queue.
- When Firebase is **not configured**, `isOfflineForData()` is `false`, so
  services keep throwing the honest `FirebaseNotConfiguredError` — nothing is
  queued into a queue that could never sync anywhere.
- Flagged ops (`lastError` starting with `conflict:` or `permanent:`) are
  skipped by the engine until explicitly resolved.

**Which entities are queued:**

| Entity | Queued by the outbox? | Why |
|---|---|---|
| `trip`, `activity`, `itinerary-order`, `itinerary-clear`, `document` (update/delete) | **Yes** | need conflict bases + app-level conflict detection |
| `savedPlace`, `phrase`, `notification`, `emergencyContact`, `conversation`, `message` | **No** | writes use Firestore's own offline queue (`persistentLocalCache`); promises resolve after reconnect (documented) |
| document **create** (upload) | **Never** | bytes require the network — fails honestly offline |

If an entity without an outbox handler somehow appears in `syncQueue`, the
engine flags it `permanent:` rather than dropping it or guessing an
application path.

## 4. Sync engine — `src/lib/offline/sync-engine.ts`

Lifecycle (`SyncEngineGate` in `src/app/(dashboard)/layout.tsx`):

- `startSyncEngine(uid)` on sign-in → subscribes to connectivity and flushes
  immediately (covers a reload that still has queued ops) + on every
  transition to online.
- Stopped on sign-out / user switch / unmount. **Only ops whose `uid` matches
  the signed-in user are considered** — user A's queued write can never land
  in user B's data.

Flush pass (`flushSyncQueue(uid)`):

1. Skips honestly when unconfigured (`"unconfigured"`) or offline
   (`"offline"`); concurrent calls coalesce into the one in-flight pass.
2. Applies eligible ops **oldest-first, one at a time**, removing each from
   the outbox **only after the Firestore call succeeds**.
3. **Conflict detection** — remote state is read first and compared to the
   op's base:
   - trips: remote `version` ≠ `baseVersion` → conflict;
   - activities/documents: remote `updatedAt` ≠ `baseUpdatedAt` → conflict;
   - target deleted remotely → conflict ("deleted on another device").
   Conflicts are **flagged, never applied** — remote data is not silently
   overwritten.
4. **Rebase within a pass**: consecutive ops on the same entity
   (`appliedThisFlush`) skip the base check, so an offline edit sequence
   (update → update → delete) applies as a sequence instead of
   self-conflicting.
5. **Error classes**:
   - *transient* (network / `unauthenticated` token refresh / browser went
     offline mid-pass) → record `attempts` + `lastError`, **stop the pass
     early** (`stoppedEarly: true`), retry on the next online event;
   - *conflict* → `flagMutationConflict` → skipped until resolved;
   - *permanent* (validation, permission, missing handler, bad payload) →
     flagged `permanent:` so it is surfaced instead of retried forever.
6. `create` ops are idempotent (existing remote doc = already applied), so a
   crashed pass that re-runs never duplicates data.

State machine for UI (`subscribeSyncState` / `getSyncEngineState`):

```ts
type SyncEngineState =
  | { status: "idle"; pending: number; conflicts: number }
  | { status: "syncing"; processed: number; total: number }
  | { status: "error"; message: string };
```

`FlushResult` reports `applied` / `conflicts` / `permanent` / `stoppedEarly`
honestly — an `"ok"` status means a pass *ran*, not that everything applied.

### Conflict resolution (user-facing)

```ts
resolveMutation(opId, "retry");   // explicit last-writer-wins: apply local change
resolveMutation(opId, "discard"); // remote wins; queued change dropped
```

`"discard"` leaves the mirror as-is — it refreshes from Firestore on the
next online read, so the UI converges to the server truth.

## 5. Read/write paths in the services

Every service function follows the same shape (example: `src/services/trips.ts`):

```text
read:   offline? → Dexie mirror
        online   → Firestore → mirror refresh (bulkPut, best-effort)
        online but transient failure → fall back to mirror if present
                                        (navigator.onLine can lie)

create: offline? → mirror + outbox (returned record honestly syncState:"queued")
        online   → Firestore → mirror refresh

update: offline? → mirror patch + outbox with base (conflict signal)
        online   → Firestore (version increment) → mirror refresh

delete: offline? → mirror drop + outbox
        online   → Firestore cascade → mirror drop
```

Honesty rules the UI relies on:

- `syncState: "synced" | "pending" | "local-only"` — a message/record is
  never labelled synced without a server acknowledgment
  (`hasPendingWrites` → `"pending"`; Dexie-only → `"local-only"`).
- `TripRecord.syncState?: "queued"` is **mirror-only** — it is never written
  to Firestore.
- `offlineAvailable` is only ever set by an explicit user download.
- Offline upload → immediate honest failure, not a fake "pending".

## 6. Connectivity — `src/lib/offline/connectivity.ts`

- `isOnline()` — `navigator.onLine` (schedules work; never proves a write
  landed).
- `isOfflineForData()` — configured && db present && offline; gates every
  offline branch.
- `subscribeConnectivity(listener)` — fires immediately with the current
  state; used by the sync engine.

UI-level connectivity (`src/hooks/use-online-status.ts`) is separate and only
drives banners.

## 7. Browser storage management — `src/lib/offline/storage-manager.ts`

- `getStorageEstimate()` — real `navigator.storage.estimate()` numbers for
  this origin (labelled as origin-wide, not "TrailMind-only" — no such API
  exists).
- `isStoragePersisted()` / `requestStoragePersistence()` — the real
  persistent-storage permission; honest `granted | denied | unsupported`.
- `clearAppAssetCaches()` — deletes **only** this app's Cache Storage entries
  (static assets). IndexedDB — user data and the outbox — is never touched.
- `formatBytes()` — display helper.

## 8. What is deliberately NOT done

- **No fake sync.** Nothing reports success without a real server outcome;
  no simulated reconnects, no "sync complete" claims over an empty queue.
- **No speculative caching.** Document bytes are not mirrored; assets are
  only cached by the opt-in service worker
  (`NEXT_PUBLIC_ENABLE_SERVICE_WORKER=true`, see `public/sw.js`).
- **No background Sync API / periodic sync** — flush is driven by
  connectivity events + page lifecycle, which is deterministic and testable.
- **No cross-user or cross-tab leader election** — each tab runs its own
  engine; Firestore's multi-tab manager deduplicates SDK-level writes, and
  outbox ops are idempotent, so concurrent flushes converge.
- **No offline AI beyond what `AI_ARCHITECTURE.md` states** — on-device
  inference works offline; cloud-only capabilities fail honestly.
