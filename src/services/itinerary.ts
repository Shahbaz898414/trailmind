import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { z } from "zod";

import {
  mapFirestoreError,
  requireDb,
  timestampToIso,
} from "@/lib/firebase/firestore";
import { parseOrThrow } from "@/lib/validation";
import { getTrip } from "@/services/trips";

/**
 * Itinerary service — Firestore subcollection
 * `users/{uid}/trips/{tripId}/itinerary/{activityId}`.
 *
 * ---------------------------------------------------------------------------
 * OWNERSHIP: uid-scoped paths only; Security Rules are the real boundary.
 * ---------------------------------------------------------------------------
 *
 * Design notes:
 * - One document = one activity (the UI's `ItineraryActivity`), plus
 *   `day` (1-based day index), `date` (ISO) and `order` (position within
 *   the day). Ordering is `day` then `order`.
 * - `order` is assigned server-side-in-memory at create (max within day + 1)
 *   and rewritten wholesale by `reorderActivities` in a single batch, so a
 *   drag-and-drop reorder is atomic from Firestore's perspective.
 * - Reads of a trip's activities use a `day` equality query + in-memory
 *   sort — no composite index required (see docs/FIRESTORE_SCHEMA.md).
 * - Activity counts per trip are bounded (a trip has tens of activities),
 *   so one query with a hard cap of 500 is used instead of cursor paging;
 *   trips/notifications/documents paginate properly.
 */

/* -------------------------------------------------------------------------- */
/* Schema                                                                      */
/* -------------------------------------------------------------------------- */

export const ACTIVITY_CATEGORIES = [
  "Culture",
  "Nature",
  "Dining",
  "Transit",
  "Lodging",
  "Heritage",
] as const;
export const CROWD_LEVELS = ["Low", "Moderate", "High"] as const;
export const ACTIVITY_STATUSES = ["confirmed", "optimized", "contingency"] as const;

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD.");

/** Fields accepted when creating an activity. */
export const activityInputSchema = z.object({
  /** 1-based day index within the trip. */
  day: z.number().int().min(1).max(365),
  /** Calendar date of that day (ISO). */
  date: isoDateSchema,
  /** Display time slot, e.g. "14:15 – 15:30". */
  timeSlot: z.string().max(50).default(""),
  title: z.string().trim().min(1).max(200),
  category: z.enum(ACTIVITY_CATEGORIES),
  location: z.string().max(300).default(""),
  coordinates: z.string().max(100).default(""),
  duration: z.string().max(50).default(""),
  elevation: z.string().max(100).default(""),
  crowdLevel: z.enum(CROWD_LEVELS).default("Moderate"),
  status: z.enum(ACTIVITY_STATUSES).default("confirmed"),
  image: z.string().max(500).nullish(),
  description: z.string().max(2000).default(""),
  solarEphemeris: z.string().max(200).nullish(),
  notes: z.string().max(2000).nullish(),
  audioKey: z.string().max(200).nullish(),
  /** Position within the day; omitted → appended after the last activity. */
  order: z.number().int().min(0).optional(),
});
export type ActivityInput = z.input<typeof activityInputSchema>;

/** Partial patch accepted by `updateActivity`. */
export const activityPatchSchema = activityInputSchema.partial();
export type ActivityPatch = z.input<typeof activityPatchSchema>;

/** The activity as the app consumes it (timestamps as ISO strings). */
export type ActivityRecord = {
  id: string;
  day: number;
  date: string;
  order: number;
  timeSlot: string;
  title: string;
  category: (typeof ACTIVITY_CATEGORIES)[number];
  location: string;
  coordinates: string;
  duration: string;
  elevation: string;
  crowdLevel: (typeof CROWD_LEVELS)[number];
  status: (typeof ACTIVITY_STATUSES)[number];
  image: string | null;
  description: string;
  solarEphemeris: string | null;
  notes: string | null;
  audioKey: string | null;
  createdAt: string;
  updatedAt: string;
};

const activityRecordSchema = z.object({
  id: z.string().min(1),
  day: z.number().int().min(1),
  date: isoDateSchema,
  order: z.number().int().min(0).default(0),
  timeSlot: z.string().default(""),
  title: z.string(),
  category: z.enum(ACTIVITY_CATEGORIES),
  location: z.string().default(""),
  coordinates: z.string().default(""),
  duration: z.string().default(""),
  elevation: z.string().default(""),
  crowdLevel: z.enum(CROWD_LEVELS).default("Moderate"),
  status: z.enum(ACTIVITY_STATUSES).default("confirmed"),
  image: z.string().nullish().default(null),
  description: z.string().default(""),
  solarEphemeris: z.string().nullish().default(null),
  notes: z.string().nullish().default(null),
  audioKey: z.string().nullish().default(null),
  createdAt: z.string().default(""),
  updatedAt: z.string().default(""),
});

/* -------------------------------------------------------------------------- */
/* Mapping & paths                                                             */
/* -------------------------------------------------------------------------- */

function mapActivityDoc(
  raw: { id: string } & Record<string, unknown>
): ActivityRecord | null {
  const normalized = {
    ...raw,
    createdAt: timestampToIso(raw.createdAt),
    updatedAt: timestampToIso(raw.updatedAt),
  };
  const parsed = activityRecordSchema.safeParse(normalized);
  if (!parsed.success) {
    console.warn(
      `[TrailMind] activity ${raw.id} failed validation:`,
      parsed.error.issues[0]
    );
    return null;
  }
  return parsed.data;
}

function itineraryRef(uid: string, tripId: string) {
  return collection(requireDb(), "users", uid, "trips", tripId, "itinerary");
}

function activityRef(uid: string, tripId: string, activityId: string) {
  return doc(requireDb(), "users", uid, "trips", tripId, "itinerary", activityId);
}

/* -------------------------------------------------------------------------- */
/* Create / read                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Adds an activity to a trip's itinerary.
 *
 * `order` is appended after the existing activities of that day when the
 * caller doesn't supply one. Verifies the trip exists first, so you can't
 * add activities to a deleted trip.
 *
 * @throws Error with a UI-safe message.
 */
export async function createActivity(
  uid: string,
  tripId: string,
  input: ActivityInput
): Promise<ActivityRecord> {
  try {
    const trip = await getTrip(uid, tripId);
    if (!trip) throw new Error("That trip no longer exists.");

    const data = parseOrThrow(activityInputSchema, input);

    let order = data.order;
    if (order === undefined) {
      const existing = await getDocs(
        query(itineraryRef(uid, tripId), where("day", "==", data.day))
      );
      const orders = existing.docs
        .map((d) => Number(d.data().order))
        .filter((n) => Number.isFinite(n));
      order = orders.length > 0 ? Math.max(...orders) + 1 : 0;
    }

    const ref = doc(itineraryRef(uid, tripId));
    const stored = {
      ...data,
      image: data.image ?? null,
      solarEphemeris: data.solarEphemeris ?? null,
      notes: data.notes ?? null,
      audioKey: data.audioKey ?? null,
      order,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, stored);

    return {
      id: ref.id,
      ...data,
      image: data.image ?? null,
      solarEphemeris: data.solarEphemeris ?? null,
      notes: data.notes ?? null,
      audioKey: data.audioKey ?? null,
      order,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/**
 * All activities of a trip, ordered by day then position (in-memory sort —
 * no composite index needed). Hard cap of 500 per trip.
 */
export async function listActivities(
  uid: string,
  tripId: string
): Promise<ActivityRecord[]> {
  try {
    const snapshot = await getDocs(
      query(itineraryRef(uid, tripId), orderBy("day"), limit(500))
    );
    return snapshot.docs
      .map((d) => mapActivityDoc({ id: d.id, ...d.data() }))
      .filter((a): a is ActivityRecord => a !== null)
      .sort((a, b) => a.day - b.day || a.order - b.order);
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** Reads a single activity, or `null` when missing/malformed. */
export async function getActivity(
  uid: string,
  tripId: string,
  activityId: string
): Promise<ActivityRecord | null> {
  try {
    const snapshot = await getDoc(activityRef(uid, tripId, activityId));
    if (!snapshot.exists()) return null;
    return mapActivityDoc({ id: snapshot.id, ...snapshot.data() });
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** Groups activities by their 1-based day, each day sorted by `order`. */
export function groupActivitiesByDay(
  activities: ActivityRecord[]
): Map<number, ActivityRecord[]> {
  const days = new Map<number, ActivityRecord[]>();
  for (const activity of activities) {
    const bucket = days.get(activity.day);
    if (bucket) bucket.push(activity);
    else days.set(activity.day, [activity]);
  }
  for (const bucket of days.values()) {
    bucket.sort((a, b) => a.order - b.order);
  }
  return days;
}

/* -------------------------------------------------------------------------- */
/* Update / reorder / delete                                                   */
/* -------------------------------------------------------------------------- */

/** Applies a validated partial update to one activity. */
export async function updateActivity(
  uid: string,
  tripId: string,
  activityId: string,
  patch: ActivityPatch
): Promise<void> {
  try {
    const parsed = parseOrThrow(activityPatchSchema, patch);
    if (Object.keys(parsed).length === 0) throw new Error("Nothing to update.");

    await updateDoc(activityRef(uid, tripId, activityId), {
      ...parsed,
      image: parsed.image === undefined ? undefined : parsed.image ?? null,
      solarEphemeris:
        parsed.solarEphemeris === undefined
          ? undefined
          : parsed.solarEphemeris ?? null,
      notes: parsed.notes === undefined ? undefined : parsed.notes ?? null,
      audioKey: parsed.audioKey === undefined ? undefined : parsed.audioKey ?? null,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** Update just the notes field (the itinerary page's quick-edit action). */
export async function updateActivityNotes(
  uid: string,
  tripId: string,
  activityId: string,
  notes: string
): Promise<void> {
  await updateActivity(uid, tripId, activityId, { notes });
}

/**
 * Rewrites the position of a day's activities in one atomic batch.
 *
 * `orderedActivityIds[i]` becomes position `i`. Ids that don't belong to
 * this trip are ignored (never write to another user's path), and ids
 * missing on the server are skipped rather than failing the whole batch.
 */
export async function reorderActivities(
  uid: string,
  tripId: string,
  orderedActivityIds: string[]
): Promise<void> {
  try {
    const ids = orderedActivityIds.filter(
      (id, index) =>
        typeof id === "string" && id.length > 0 && orderedActivityIds.indexOf(id) === index
    );
    if (ids.length === 0) throw new Error("No activities to reorder.");

    const snapshot = await getDocs(itineraryRef(uid, tripId));
    const existing = new Set(snapshot.docs.map((d) => d.id));

    const batch = writeBatch(requireDb());
    let changed = 0;
    ids.forEach((id, position) => {
      if (!existing.has(id)) return;
      batch.update(activityRef(uid, tripId, id), {
        order: position,
        updatedAt: serverTimestamp(),
      });
      changed += 1;
    });

    if (changed === 0) throw new Error("That activity no longer exists.");
    await batch.commit();
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** Deletes one activity. Missing activity = success (idempotent). */
export async function deleteActivity(
  uid: string,
  tripId: string,
  activityId: string
): Promise<void> {
  try {
    await deleteDoc(activityRef(uid, tripId, activityId));
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** Deletes every activity of a trip (used by trip deletion / AI regenerate). */
export async function clearItinerary(
  uid: string,
  tripId: string
): Promise<number> {
  try {
    const snapshot = await getDocs(itineraryRef(uid, tripId));
    if (snapshot.empty) return 0;
    const docs = snapshot.docs;
    for (let i = 0; i < docs.length; i += 400) {
      const batch = writeBatch(requireDb());
      docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
    return docs.length;
  } catch (error) {
    throw mapFirestoreError(error);
  }
}
