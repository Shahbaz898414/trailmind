import Dexie, { type EntityTable } from "dexie";

import type {
  ChatMessage,
  OfflinePack,
  SyncOperation,
  WalletEntry,
} from "@/types/travel";
import type { TripRecord } from "@/services/trips";
import type { ActivityRecord } from "@/services/itinerary";
import type { SavedPlaceRecord } from "@/services/saved-places";
import type { TravelDocumentRecord } from "@/services/documents";
import type { NotificationRecord } from "@/services/notifications";
import type { SavedPhraseRecord } from "@/services/language";
import type { ConversationRecord } from "@/services/conversations";

/**
 * Offline-first local data store — IndexedDB, wrapped by Dexie.
 *
 * ---------------------------------------------------------------------------
 * SCOPE (keep this separation intact)
 * ---------------------------------------------------------------------------
 * This database holds **user travel data** so the app keeps working with no
 * network connection. It is completely separate from the service worker's
 * Cache Storage (`public/sw.js`), which holds **static app assets** only.
 *
 * Deliberately NOT stored here:
 *   - auth tokens, passwords or API keys
 *   - anything the user did not create in the app
 *   - document file BYTES (uploads genuinely require the network; metadata
 *     is mirrored here, bytes are not — see `offline/documents.ts`)
 *
 * Role in the data plane (see `docs/OFFLINE_SYNC.md`):
 *   - **Mirror** of every Firestore record the app has read (the offline
 *     source of truth for reads while disconnected).
 *   - **Home of queued writes** (`syncQueue`) created while offline; the
 *     sync engine drains them into Firestore with conflict detection.
 *   - **Local-only records** (chat messages written while Firebase is
 *     unconfigured) until a sync path exists.
 * ---------------------------------------------------------------------------
 *
 * Browser-only: call `getOfflineDb()` from Client Components (or from code
 * that has already checked `isOfflineStoreAvailable()`).
 *
 * Table record types are the SERVICE record shapes (type-only imports — no
 * runtime cycle), so a mirrored row round-trips through the same validation
 * the Firestore path uses.
 */

/** An activity as mirrored locally — the trip it belongs to is path-derived
 *  in Firestore, so the mirror stores it explicitly. */
export type CachedActivity = ActivityRecord & { tripId: string };

/** Bump when the schema changes and add a matching `.stores()` clause. */
export const OFFLINE_DB_NAME = "trailmind";
export const OFFLINE_DB_VERSION = 2;

export class TrailMindDatabase extends Dexie {
  trips!: EntityTable<TripRecord, "id">;
  savedPlaces!: EntityTable<SavedPlaceRecord, "id">;
  itineraryItems!: EntityTable<CachedActivity, "id">;
  offlinePacks!: EntityTable<OfflinePack, "id">;
  walletEntries!: EntityTable<WalletEntry, "id">;
  chatMessages!: EntityTable<ChatMessage, "id">;
  /** Outbox of local mutations not yet synced to Firestore. */
  syncQueue!: EntityTable<SyncOperation, "id">;
  /* --- v2 mirrors (Phase 5) --------------------------------------------- */
  phrases!: EntityTable<SavedPhraseRecord, "id">;
  notifications!: EntityTable<NotificationRecord, "id">;
  conversations!: EntityTable<ConversationRecord, "id">;
  /** Travel-wallet document METADATA only — bytes live in Storage. */
  documentsMeta!: EntityTable<TravelDocumentRecord, "id">;

  constructor() {
    super(OFFLINE_DB_NAME);

    this.version(OFFLINE_DB_VERSION).stores({
      // Indexes: primary key first, then the fields queried most often.
      trips: "id, startDate, endDate, status",
      savedPlaces: "id, tripId, createdAt, category",
      itineraryItems: "id, tripId, day, [tripId+day]",
      offlinePacks: "id, tripId, status",
      walletEntries: "id, tripId, date, category",
      chatMessages: "id, conversationId, tripId, createdAt",
      syncQueue: "id, entity, createdAt",
      phrases: "id, createdAt, category, language",
      notifications: "id, createdAt, read",
      conversations: "id, updatedAt, createdAt, tripId",
      documentsMeta: "id, createdAt, category, tripId",
    });
  }
}

/** True when the current environment can open IndexedDB (browser only). */
export function isOfflineStoreAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

let instance: TrailMindDatabase | null = null;

/**
 * Returns the shared database instance, opening it on first use.
 *
 * Throws when called outside the browser — guard with
 * `isOfflineStoreAvailable()` if the call site might run on the server.
 */
export function getOfflineDb(): TrailMindDatabase {
  if (!isOfflineStoreAvailable()) {
    throw new Error(
      "The TrailMind offline store requires IndexedDB, which is only available in the browser."
    );
  }
  if (!instance) instance = new TrailMindDatabase();
  return instance;
}

/**
 * Deletes every local record. Used by "clear local data" in Settings.
 * Does not touch Firestore — this only affects this device.
 */
export async function clearOfflineData(): Promise<void> {
  const db = getOfflineDb();
  await Promise.all([
    db.trips.clear(),
    db.savedPlaces.clear(),
    db.itineraryItems.clear(),
    db.offlinePacks.clear(),
    db.walletEntries.clear(),
    db.chatMessages.clear(),
    db.syncQueue.clear(),
    db.phrases.clear(),
    db.notifications.clear(),
    db.conversations.clear(),
    db.documentsMeta.clear(),
  ]);
}
