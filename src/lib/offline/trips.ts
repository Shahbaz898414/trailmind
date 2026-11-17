import type { TripStatus } from "@/types/travel";
import type { TripRecord } from "@/services/trips";
import { getOfflineDb, isOfflineStoreAvailable } from "@/lib/offline/db";
import { enqueueMutation } from "@/lib/offline/mutation-queue";

/**
 * Offline mirror + queued-write helpers for trips.
 *
 * Reads:  `mirrorTrip(s)` runs after every successful Firestore read/write,
 *         and `readCached*` is the offline read path used by
 *         `services/trips.ts` when the browser is offline.
 * Writes: `queueTrip*` runs INSTEAD of the Firestore write while offline —
 *         the local mirror updates immediately and the mutation enters the
 *         outbox with the `baseVersion` the edit was based on, so the sync
 *         engine can detect a conflict on flush instead of silently
 *         overwriting a newer remote change.
 */

/** Server-managed fields kept out of queued payloads (engine sets them). */
function toPayload(record: TripRecord): Record<string, unknown> {
  const { id: _id, createdAt: _c, updatedAt: _u, syncState: _s, ...fields } = record;
  void _id;
  void _c;
  void _u;
  void _s;
  return fields;
}

/** Stores/refreshes a trip in the mirror. */
export async function mirrorTrip(trip: TripRecord): Promise<void> {
  if (!isOfflineStoreAvailable()) return;
  await getOfflineDb().trips.put(trip);
}

/** Stores several trips at once (list reads). */
export async function mirrorTrips(trips: TripRecord[]): Promise<void> {
  if (!isOfflineStoreAvailable() || trips.length === 0) return;
  await getOfflineDb().trips.bulkPut(trips);
}

/** All mirrored trips, newest start date first, optionally filtered. */
export async function readCachedTrips(
  status?: TripStatus
): Promise<TripRecord[]> {
  if (!isOfflineStoreAvailable()) return [];
  const rows = await getOfflineDb().trips.toArray();
  const filtered = status ? rows.filter((t) => t.status === status) : rows;
  return filtered.sort((a, b) => b.startDate.localeCompare(a.startDate));
}

/** One mirrored trip, or `null`. */
export async function readCachedTrip(tripId: string): Promise<TripRecord | null> {
  if (!isOfflineStoreAvailable()) return null;
  return (await getOfflineDb().trips.get(tripId)) ?? null;
}

/** Removes a trip from the mirror (deletes / de-association flows). */
export async function dropCachedTrip(tripId: string): Promise<void> {
  if (!isOfflineStoreAvailable()) return;
  const db = getOfflineDb();
  await db.trips.delete(tripId);
  await db.itineraryItems.where("tripId").equals(tripId).delete();
}

/**
 * Queues an offline trip creation. The mirror gains the record immediately
 * (marked `queued`), and the outbox holds the full payload so the sync
 * engine can create the exact same document id on flush.
 */
export async function queueTripCreate(
  uid: string,
  tripId: string,
  record: TripRecord
): Promise<TripRecord> {
  const queued: TripRecord = { ...record, syncState: "queued" };
  await mirrorTrip(queued);
  await enqueueMutation({
    uid,
    entity: "trip",
    entityId: tripId,
    operation: "create",
    payload: toPayload(record),
  });
  return queued;
}

/**
 * Queues an offline trip update.
 *
 * `baseVersion` (from the mirror) is the conflict signal: if the remote
 * version has moved past it by flush time, the engine flags a conflict and
 * does NOT apply.
 */
export async function queueTripUpdate(
  uid: string,
  tripId: string,
  fields: Record<string, unknown>,
  current: TripRecord | null
): Promise<void> {
  if (current) {
    await mirrorTrip({
      ...current,
      ...fields,
      id: tripId,
      syncState: "queued",
      updatedAt: new Date().toISOString(),
    } as TripRecord);
  }
  await enqueueMutation({
    uid,
    entity: "trip",
    entityId: tripId,
    operation: "update",
    payload: fields,
    baseVersion: current?.version,
    baseUpdatedAt: current?.updatedAt,
  });
}

/**
 * Queues an offline trip deletion: the mirror copy (and its activities)
 * disappears now; the engine runs the full cascade (itinerary deletion +
 * place/document de-association) on flush.
 */
export async function queueTripDelete(uid: string, tripId: string): Promise<void> {
  await dropCachedTrip(tripId);
  await enqueueMutation({
    uid,
    entity: "trip",
    entityId: tripId,
    operation: "delete",
  });
}

/** True when the record exists only locally (queued write not yet flushed). */
export function isQueuedRecord(record: { syncState?: string }): boolean {
  return record.syncState === "queued";
}
