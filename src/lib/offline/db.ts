import Dexie, { type EntityTable } from "dexie";

import type {
  ChatMessage,
  ItineraryItem,
  OfflinePack,
  SavedPlace,
  SyncOperation,
  Trip,
  WalletEntry,
} from "@/types/travel";

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
 *   - cached documents fetched from private/scoped sources
 *
 * Firestore (see `src/lib/firebase/client.ts`) is the eventual sync target;
 * `syncQueue` is the outbox of mutations waiting to be pushed.
 * ---------------------------------------------------------------------------
 *
 * Browser-only: call `getOfflineDb()` from Client Components (or from code
 * that has already checked `isOfflineStoreAvailable()`).
 */

/** Bump when the schema changes and add a matching `.stores()` clause. */
export const OFFLINE_DB_NAME = "trailmind";
export const OFFLINE_DB_VERSION = 1;

export class TrailMindDatabase extends Dexie {
  trips!: EntityTable<Trip, "id">;
  savedPlaces!: EntityTable<SavedPlace, "id">;
  itineraryItems!: EntityTable<ItineraryItem, "id">;
  offlinePacks!: EntityTable<OfflinePack, "id">;
  walletEntries!: EntityTable<WalletEntry, "id">;
  chatMessages!: EntityTable<ChatMessage, "id">;
  /** Outbox of local mutations not yet synced to Firestore. */
  syncQueue!: EntityTable<SyncOperation, "id">;

  constructor() {
    super(OFFLINE_DB_NAME);

    this.version(OFFLINE_DB_VERSION).stores({
      // Indexes: primary key first, then the fields queried most often.
      trips: "id, startDate, endDate, status",
      savedPlaces: "id, tripId, createdAt, category",
      itineraryItems: "id, tripId, day, [tripId+day]",
      offlinePacks: "id, tripId, status",
      walletEntries: "id, tripId, date, category",
      chatMessages: "id, tripId, createdAt",
      syncQueue: "id, entity, createdAt",
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
  ]);
}
