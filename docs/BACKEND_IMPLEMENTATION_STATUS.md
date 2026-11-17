# TrailMind — Backend & Offline Architecture Implementation Status

> Comprehensive status report of the TrailMind backend, offline Dexie v2 mirror,
> mutation outbox sync engine, Firebase AI Logic hybrid inference, and security rules.
> Generated on 2026-11-17.

---

## 1. Summary Matrix

| Subsystem | Components / Modules | Status | Verification |
|---|---|---|---|
| **Firebase Auth** | `auth.ts`, `auth-provider.tsx`, `auth-guard.tsx`, login/signup/forgot-password | ✅ Completed | Email/password, Google OAuth, session token listener, idempotent user profile healing |
| **Firestore Services** | `trips.ts`, `itinerary.ts`, `documents.ts`, `emergency-contacts.ts`, `saved-places.ts`, `notifications.ts`, `language.ts`, `conversations.ts`, `profile.ts` | ✅ Completed | Bounded schema validation (Zod), user-scoped collections, batch atomic reorders, cursor pagination |
| **Offline Sync Engine** | `db.ts` (Dexie v2), `mutation-queue.ts`, `sync-engine.ts`, `connectivity.ts`, `sync-engine-gate.tsx` | ✅ Completed | Real IndexedDB multi-tab mirror tables, outbox with exponential backoff & conflict base hashes |
| **Storage & Quota** | `storage.ts`, `storage-manager.ts` (OPFS + IndexedDB telemetry) | ✅ Completed | User-scoped storage paths, rollback on metadata failure, bytes quota calculation |
| **Hybrid AI Inference** | `hybrid-model.ts`, `client.ts`, `capabilities.ts`, `generate.ts`, `device-model.ts`, `structured.ts`, `context.ts` | ✅ Completed | Chrome Prompt API (`window.LanguageModel`) + Firebase AI Logic (Gemini 2.5 Flash), structured JSON extraction |
| **Security Rules** | `firestore.rules`, `storage.rules`, `firebase.json`, `firestore.indexes.json` | ✅ Completed | Strict `request.auth.uid == userId` isolation, schema attribute constraints, immutable audit logs |

---

## 2. Service Layer Mapping

Every application feature is wired through an async service layer that seamlessly falls back to local IndexedDB or static prototypes when running unauthenticated or completely off-grid:

| Service | Firestore Path | Offline Mirror Table | Key Operations |
|---|---|---|---|
| **Trips** (`src/services/trips.ts`) | `users/{uid}/trips/{tripId}` | `db.trips` | `listTrips`, `getTrip`, `createTrip`, `updateTrip`, `deleteTrip` |
| **Itinerary** (`src/services/itinerary.ts`) | `users/{uid}/trips/{tripId}/itinerary/{id}` | `db.itineraryItems` | `listActivities`, `createActivity`, `updateActivity`, `reorderActivities`, `deleteActivity` |
| **Documents** (`src/services/documents.ts`) | `users/{uid}/documents/{id}` | `db.documentsMeta` | `listDocuments`, `createDocumentMetadata`, `uploadDocument`, `deleteDocument` |
| **Emergency Contacts** (`src/services/emergency-contacts.ts`) | `users/{uid}/emergencyContacts/{id}` | `localStorage` / Enclave | `listEmergencyContacts`, `addEmergencyContact`, `setPrimaryContact`, `deleteEmergencyContact` |
| **Saved Places** (`src/services/saved-places.ts`) | `users/{uid}/savedPlaces/{id}` | `db.savedPlaces` | `listSavedPlaces`, `createSavedPlace`, `deleteSavedPlace` |
| **Notifications** (`src/services/notifications.ts`) | `users/{uid}/notifications/{id}` | `db.notifications` | `listNotifications`, `markNotificationRead`, `markAllNotificationsRead` |
| **Language & Phrases** (`src/services/language.ts`) | `users/{uid}/savedPhrases/{id}` | `db.phrases` | `listSavedPhrases`, `addSavedPhrase`, `removeSavedPhrase`, `searchPhrases` |
| **AI Conversations** (`src/services/conversations.ts`) | `users/{uid}/conversations/{id}` | `db.conversations` | `listConversations`, `createConversation`, `appendMessage`, `deleteConversation` |
| **Profile** (`src/services/profile.ts`) | `users/{uid}` | Secure Enclave / Session | `fetchUserProfile`, `ensureUserProfile`, `updateUserProfile` |

---

## 3. UI Page Integration

The application routes use the `useAsyncResource` hook (`src/hooks/use-async-resource.ts`) to manage async loading, reactive updates, and offline fallback without cascading render errors:

- **Dashboard** (`/dashboard`): Reactive summary counting active upcoming trips, offline cached bytes, and unread emergency notifications.
- **Trips Hub** (`/trips`): Real trip records loaded from Firestore/Dexie with status tabs, search filter, and offline package flags.
- **Trip Hub & Details** (`/trips/[id]`): Detailed metrics, GPS coordinates, terrain pace, and pack weight budget.
- **Trip Itinerary** (`/trips/[id]/itinerary`): 12-day day selector, timeline view, add/edit drawer with Firestore write-through, and batch reorder.
- **Travel Wallet** (`/wallet`): Encrypted pass library with category tabs, Aztec/QR code rendering, and secure deletion.
- **Emergency Safety** (`/wallet/emergency`): Japanese emergency dispatch speed dials, ICE next-of-kin contacts, medical kanji directives, and dual-stage SOS interlock.
- **Saved Places** (`/saved-places`): Offline bookmarks with proximity GPS sorting, elevation profiles, and Topo Map HUD radar.
- **Notifications Center** (`/notifications`): Satellite burst packet logs, barometric weather warnings, DEM cache updates, and escalation ladder.
- **Language Audio Studio** (`/language/phrases`): Spaced-repetition phrasebook, large-print night taxi modal, and offline audio flashcards.
- **Downloads Hub & Sync** (`/downloads/sync`): Multi-version CRDT conflict resolution engine with automated two-way merge and outbox queue flusher.

---

## 4. Verification and Quality Gates

1. **Type Safety**:
   ```bash
   npx tsc --noEmit
   # Exit Code: 0 (Zero TypeScript errors)
   ```
2. **ESLint Static Analysis**:
   ```bash
   npx eslint . --quiet
   # Exit Code: 0 (Zero errors)
   ```
3. **Offline Sync Engine Lifecycle**:
   - `SyncEngineGate` mounted at `src/app/(dashboard)/layout.tsx`.
   - Idempotently attaches to user session on sign-in and flushes outbox upon reconnection.
