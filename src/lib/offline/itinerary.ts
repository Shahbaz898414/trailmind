import type { ActivityRecord } from "@/services/itinerary";
import {
  getOfflineDb,
  isOfflineStoreAvailable,
  type CachedActivity,
} from "@/lib/offline/db";
import { enqueueMutation } from "@/lib/offline/mutation-queue";

/**
 * Offline mirror + queued-write helpers for itinerary activities.
 *
 * Same contract as `offline/trips.ts`: mirror on every read/write, queue on
 * offline writes with `baseUpdatedAt` for conflict detection (activities
 * have no `version` counter — they use `updatedAt` comparison).
 */

function withTrip(tripId: string, activity: ActivityRecord): CachedActivity {
  return { ...activity, tripId };
}

/** Mirrors a full day-set for a trip (merge policy: put, never mass-delete —
 *  locally queued creates must survive an online refresh of the same trip). */
export async function mirrorActivities(
  tripId: string,
  activities: ActivityRecord[]
): Promise<void> {
  if (!isOfflineStoreAvailable() || activities.length === 0) return;
  await getOfflineDb().itineraryItems.bulkPut(
    activities.map((a) => withTrip(tripId, a))
  );
}

/** Mirrors one activity. */
export async function mirrorActivity(
  tripId: string,
  activity: ActivityRecord
): Promise<void> {
  if (!isOfflineStoreAvailable()) return;
  await getOfflineDb().itineraryItems.put(withTrip(tripId, activity));
}

/** All mirrored activities of a trip, ordered day then position. */
export async function readCachedActivities(
  tripId: string
): Promise<CachedActivity[]> {
  if (!isOfflineStoreAvailable()) return [];
  const rows = await getOfflineDb()
    .itineraryItems.where("tripId")
    .equals(tripId)
    .toArray();
  return rows.sort((a, b) => a.day - b.day || a.order - b.order);
}

/** One mirrored activity, or `null`. */
export async function readCachedActivity(
  tripId: string,
  activityId: string
): Promise<CachedActivity | null> {
  if (!isOfflineStoreAvailable()) return null;
  return (await getOfflineDb().itineraryItems.get(activityId)) ?? null;
}

/** Removes one activity from the mirror. */
export async function dropCachedActivity(activityId: string): Promise<void> {
  if (!isOfflineStoreAvailable()) return;
  await getOfflineDb().itineraryItems.delete(activityId);
}

/** Removes every mirrored activity of a trip. */
export async function dropCachedItinerary(tripId: string): Promise<void> {
  if (!isOfflineStoreAvailable()) return;
  await getOfflineDb().itineraryItems.where("tripId").equals(tripId).delete();
}

/**
 * Applies a completed online reorder to the mirror (position `i` → id at
 * index `i`). Best-effort — the mirror refreshes from the server on the
 * next read regardless.
 */
export async function mirrorReorder(
  tripId: string,
  orderedActivityIds: string[]
): Promise<void> {
  if (!isOfflineStoreAvailable()) return;
  const db = getOfflineDb();
  const rows = await db.itineraryItems.where("tripId").equals(tripId).toArray();
  const byId = new Map(rows.map((r) => [r.id, r]));
  const updates: CachedActivity[] = [];
  orderedActivityIds.forEach((id, position) => {
    const row = byId.get(id);
    if (row && row.order !== position) updates.push({ ...row, order: position });
  });
  if (updates.length > 0) await db.itineraryItems.bulkPut(updates);
}

/* -------------------------------------------------------------------------- */
/* Queued writes                                                              */
/* -------------------------------------------------------------------------- */

export async function queueActivityCreate(
  uid: string,
  tripId: string,
  activity: ActivityRecord
): Promise<ActivityRecord> {
  if (!isOfflineStoreAvailable()) return activity;
  await getOfflineDb().itineraryItems.put(withTrip(tripId, activity));
  const { tripId: _t, ...fields } = withTrip(tripId, activity);
  void _t;
  await enqueueMutation({
    uid,
    entity: "activity",
    entityId: activity.id,
    operation: "create",
    payload: { tripId, ...fields },
  });
  return activity;
}

export async function queueActivityUpdate(
  uid: string,
  tripId: string,
  activityId: string,
  fields: Record<string, unknown>,
  baseUpdatedAt?: string
): Promise<void> {
  if (isOfflineStoreAvailable()) {
    const current = await readCachedActivity(tripId, activityId);
    if (current) {
      await getOfflineDb().itineraryItems.put({
        ...current,
        ...fields,
        id: activityId,
        updatedAt: new Date().toISOString(),
      });
    }
  }
  const { tripId: _t, ...cleanFields } = { ...fields };
  void _t;
  await enqueueMutation({
    uid,
    entity: "activity",
    entityId: activityId,
    operation: "update",
    payload: { tripId, ...cleanFields },
    baseUpdatedAt,
  });
}

export async function queueActivityDelete(
  uid: string,
  tripId: string,
  activityId: string
): Promise<void> {
  await dropCachedActivity(activityId);
  await enqueueMutation({
    uid,
    entity: "activity",
    entityId: activityId,
    operation: "delete",
    payload: { tripId },
  });
}

/**
 * Queues an offline reorder AND rewrites the mirror immediately so the UI
 * shows the new order without waiting for the flush.
 */
export async function queueItineraryReorder(
  uid: string,
  tripId: string,
  orderedActivityIds: string[]
): Promise<void> {
  await mirrorReorder(tripId, orderedActivityIds);
  await enqueueMutation({
    uid,
    entity: "itinerary-order",
    entityId: tripId,
    operation: "update",
    payload: { tripId, orderedActivityIds },
  });
}

/** Queues an offline itinerary clear (mirror emptied immediately). */
export async function queueItineraryClear(uid: string, tripId: string): Promise<void> {
  await dropCachedItinerary(tripId);
  await enqueueMutation({
    uid,
    entity: "itinerary-clear",
    entityId: tripId,
    operation: "delete",
    payload: { tripId },
  });
}
