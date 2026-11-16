# TrailMind — Firestore Schema

> Reference for every Cloud Firestore collection, document field, index and
> ownership rule in TrailMind. Companion docs: `OFFLINE_SYNC.md` (local layer),
> `AI_ARCHITECTURE.md` (AI), `BACKEND_SETUP.md` (setup).

## 1. Principles

- **User-scoped by construction.** Every document lives under `users/{uid}`.
  There are no shared or public collections. Security Rules enforce
  `request.auth.uid == uid` on every path — the schema makes the rule trivial.
- **No cross-user references.** References are always to documents inside the
  same user's tree (e.g. `savedPlaces.tripId` is a plain string id, never a
  global path).
- **Zod-validated at the service layer.** All writes go through
  `src/services/*` (`src/lib/validation.ts` → `parseOrThrow`), and reads are
  defensively re-validated; malformed documents degrade to `null` + a console
  warning instead of crashing a page.
- **Server timestamps for audit fields** (`createdAt`, `updatedAt`), read back
  through `timestampToIso()` so the rest of the app works with ISO strings
  (the same representation IndexedDB uses).
- **Optimistic concurrency via `version`** (trips): every update increments it
  with `increment(1)` — which works offline, unlike transactions. The sync
  engine uses `version` + `updatedAt` for conflict detection.

## 2. Collection tree

```text
users/{uid}                                profile + preferences
├── trips/{tripId}                         a trip
│   └── itinerary/{activityId}             day-wise activities (ordered)
├── savedPlaces/{placeId}                  bookmarks, optionally trip-linked
├── documents/{documentId}                 travel-wallet metadata (files in Storage)
├── emergencyContacts/{contactId}          emergency contacts
├── savedPhrases/{phraseId}                phrasebook entries
├── notifications/{notificationId}         in-app notifications
└── conversations/{conversationId}         AI chat sessions
    └── messages/{messageId}               chat messages
```

## 3. Collections & fields

### 3.1 `users/{uid}` — profile

Managed by `src/services/profile.ts` (created idempotently by `AuthProvider`
on every sign-in; missing fields are repaired, never overwritten).

| Field | Type | Notes |
|---|---|---|
| `uid` | string | = document id |
| `email` | string \| null | from Auth |
| `displayName` | string \| null | from Auth / editable |
| `photoURL` | string \| null | from Auth / editable |
| `preferredLanguage` | string | BCP-47-ish tag, default `"en"` |
| `travelStyle` | string \| null | chosen at signup (adventure/cultural/offgrid) |
| `onboardingComplete` | boolean | default `false` |
| `createdAt`, `updatedAt` | server timestamp | → ISO on read |

### 3.2 `users/{uid}/trips/{tripId}` — trip

Managed by `src/services/trips.ts`.

| Field | Type | Notes |
|---|---|---|
| `title`, `destination` | string (1–200) | required |
| `region`, `country` | string | `country` derived from destination tail when omitted |
| `countryCode` | `^[A-Z]{2}$` or `""` | |
| `startDate`, `endDate` | `YYYY-MM-DD` | `endDate >= startDate` enforced |
| `durationDays` | int 1–365 | derived at write (inclusive day count) |
| `status` | enum | `draft` \| `upcoming` \| `in-progress` \| `completed` |
| `travelers` | int 1–99 | |
| `offlineStatus` | enum | `downloaded` \| `downloading` \| `sync_required` \| `not_downloaded` |
| `offlineSizeMb` | number ≥ 0 | |
| `offlineReady` | boolean | derived (`offlineStatus === "downloaded"`) |
| `coverImage`, `heroImage` | string / null | local asset paths |
| `summary` ≤1000, `terrainType` ≤300, `averageElevation` ≤100 | string | |
| `packWeightKg`, `maxWeightKg` | number ≥ 0 | |
| `satelliteSyncCadence` | string ≤100 | |
| `budget` | `{ currency: ^[A-Z]{3}$, total ≥ 0, spent ≥ 0 }` | default USD/0/0 |
| `placesCount` | int ≥ 0 | maintained when places are linked |
| `version` | int ≥ 1 | incremented on every update |
| `createdAt`, `updatedAt` | server timestamp | |

**Relationships:** `savedPlaces.tripId` and `documents.tripId` reference a
trip id (plain string). Deleting a trip **de-associates** (sets `tripId` to
`null`) instead of deleting those user records, and deletes its `itinerary`
subcollection explicitly (Firestore does not cascade).

### 3.3 `users/{uid}/trips/{tripId}/itinerary/{activityId}` — activity

Managed by `src/services/itinerary.ts`. Ordering = `day`, then `order`.

| Field | Type | Notes |
|---|---|---|
| `day` | int ≥ 1 | 1-based day index within the trip |
| `date` | `YYYY-MM-DD` | calendar date of that day |
| `order` | int ≥ 0 | position within the day; appended on create, rewritten atomically on reorder |
| `timeSlot` | string ≤50 | display slot, e.g. `"14:15 – 15:30"` (replaces separate start/end fields — the UI edits one string) |
| `title` | string 1–200 | required |
| `category` | enum | `Culture` \| `Nature` \| `Dining` \| `Transit` \| `Lodging` \| `Heritage` |
| `location` ≤300, `coordinates` ≤100, `duration` ≤50, `elevation` ≤100 | string | |
| `crowdLevel` | enum | `Low` \| `Moderate` \| `High` |
| `status` | enum | `confirmed` \| `optimized` \| `contingency` |
| `image`, `solarEphemeris`, `notes`, `audioKey` | string \| null | optional |
| `description` | string ≤2000 | |
| `createdAt`, `updatedAt` | server timestamp | |

### 3.4 `users/{uid}/savedPlaces/{placeId}`

Managed by `src/services/saved-places.ts`. `name`, `category`, `city`,
`latitude`/`longitude` (number|null), `notes`, `tripId` (string|null),
`createdAt`/`updatedAt`.

### 3.5 `users/{uid}/documents/{documentId}` — travel wallet metadata

Managed by `src/services/documents.ts`. **File bytes live in Storage** — this
collection never contains file content or public URLs, only metadata:
`title`, `fileName`, `category`, `tripId` (string|null),
`sizeBytes` (≤ 10 MB), `contentType` (pdf/jpeg/png/webp), `storagePath`,
`notes` (string|null), `createdAt`/`updatedAt`.

### 3.6 `users/{uid}/emergencyContacts/{contactId}`

`name`, `relation`, `phone`, `email` (string|null), `isPrimary` (boolean),
`createdAt`/`updatedAt`. Exactly one primary is maintained by a batch in
`setPrimaryContact`.

### 3.7 `users/{uid}/savedPhrases/{phraseId}`

`phrase`, `translation`, `language` (tag), `category`, `createdAt`.

### 3.8 `users/{uid}/notifications/{notificationId}`

`type` (app event kind), `title` ≤200, `body` ≤1000, `read` (boolean),
`link` (string|null), `createdAt`. Created only by legitimate in-app events
(never fake live alerts). Updates are restricted to the `read` field by
Security Rules.

### 3.9 `users/{uid}/conversations/{…}/messages/{…}` — AI history

Conversation: `title`, `tripId` (string|null), `createdAt`/`updatedAt`.
Message: `role` (`user`|`assistant`), `content` ≤8000,
`source` (`on-device`|`cloud`|null — the **real** inference source),
`createdAt`. Written when online; the offline copy lives in IndexedDB
(`chatMessages`) — see `OFFLINE_SYNC.md`.

## 4. Indexes

Single-field queries use Firestore's automatic indexes. Composite indexes
(`firestore.indexes.json`):

| Collection | Fields | Used by |
|---|---|---|
| `users/{uid}/trips` (COLLECTION scope, group `trips`) | `status ASC, startDate DESC` | `listTrips({ status })` — status filter + date ordering |

Everything else deliberately avoids composite indexes:

- **Itinerary**: fetched with a single `day ==` equality query (or `orderBy("day")`
  alone) and sorted in memory — trips have tens of activities.
- **Search**: Firestore has no full-text search; `searchTrips()` pages through
  a bounded set (≤ 100 trips) and filters client-side. Revisit with a search
  service only if collections grow beyond personal scale.
- **Notifications/documents/phrases**: filtered with equality + ordered on a
  single field, or ordered alone.

## 5. Pagination

Potentially large collections are read through `fetchQueryPage()`
(returns `{ items, cursor, hasMore }`, page size + 1 to detect the next page):

- `listTrips` (default 20/page, cursor-based)
- `listDocuments`, `listNotifications`, message history in
  `conversations.ts`, and the bounded helpers in other services.

## 6. Ownership & Security Rules

Rules live in `firestore.rules` / `storage.rules` (Phase 9) and are the **real**
authorization layer:

- Every `match` requires `request.auth != null && request.auth.uid == uid`,
  including all subcollections — cross-user reads/writes are denied outright.
- Writes validate field types, enums, date patterns and size limits.
- Notification updates may only touch `read`; deletes are owner-only.
- Storage objects live at `users/{uid}/documents/{documentId}/{fileName}` with
  content-type and 10 MB limits enforced server-side; nothing else in the
  bucket is reachable.

Client-side guards (uid parameters, Zod validation, the `AuthGuard` UX gate)
exist for good errors and developer ergonomics — **not** as security.

## 7. Error handling

All service errors pass through `mapFirestoreError()`, which converts SDK
codes (`permission-denied`, `unavailable`, `network-request-failed`, …) into
messages safe to render. Transient codes are retried with exponential backoff
by `runWithRetry()`; permission/validation errors are never retried. Missing
documents return `null` (a normal state), not an exception.

## 8. Development seed

`POST /api/dev/seed` (dev builds only, requires `Authorization: Bearer <ID token>`)
copies the Stitch sample trips/itineraries from `src/data/` into the
**signed-in developer's own** `users/{uid}` tree. It is idempotent (existing
trips are skipped), never runs automatically, and is unreachable in production
(`NODE_ENV === "production"` → 404). Production accounts never receive sample
data.
