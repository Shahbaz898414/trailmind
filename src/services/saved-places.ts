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
} from "firebase/firestore";
import { z } from "zod";

import {
  mapFirestoreError,
  requireDb,
  timestampToIso,
} from "@/lib/firebase/firestore";
import { parseOrThrow, providedFields } from "@/lib/validation";

/**
 * Saved Places service — Firestore `users/{uid}/savedPlaces/{placeId}`.
 *
 * Shape matches the saved-places UI (`SavedPlaceItem`) so page swaps are
 * drop-in. `tripId` links a place to a trip (de-associated, never deleted,
 * when the trip is removed). `offlineCached` records that the place's
 * details were fetched to this device by the offline layer — this service
 * only manages the Firestore record and never sets it speculatively.
 *
 * All functions are uid-scoped; Security Rules enforce ownership.
 */

const placeCategorySchema = z.enum([
  "Temple",
  "Ryokan",
  "Mountain Hut",
  "Viewpoint",
  "Food",
  "Trail",
]);

export const savedPlaceSchema = z.object({
  name: z.string().trim().min(1).max(200),
  japaneseName: z.string().max(200).nullish(),
  category: placeCategorySchema.default("Viewpoint"),
  city: z.string().max(100).default(""),
  region: z.string().max(100).default(""),
  elevation: z.string().max(50).default(""),
  /** Display coordinates, e.g. "34.9949° N, 135.7850° E". */
  coordinates: z.string().max(100).default(""),
  image: z.string().max(500).default(""),
  offlineCached: z.boolean().default(false),
  notes: z.string().max(4000).default(""),
  proximityKm: z.number().min(0).nullish(),
  tripId: z.string().nullish(),
});
export type SavedPlaceInput = z.input<typeof savedPlaceSchema>;

export type SavedPlaceRecord = z.output<typeof savedPlaceSchema> & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

const recordSchema = savedPlaceSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().default(""),
  updatedAt: z.string().default(""),
});

function placesRef(uid: string) {
  return collection(requireDb(), "users", uid, "savedPlaces");
}

function placeRef(uid: string, placeId: string) {
  return doc(requireDb(), "users", uid, "savedPlaces", placeId);
}

function mapDoc(raw: { id: string } & Record<string, unknown>): SavedPlaceRecord | null {
  const parsed = recordSchema.safeParse({
    ...raw,
    createdAt: timestampToIso(raw.createdAt),
    updatedAt: timestampToIso(raw.updatedAt),
  });
  if (!parsed.success) {
    console.warn(`[TrailMind] saved place ${raw.id} failed validation:`, parsed.error.issues[0]);
    return null;
  }
  return parsed.data;
}

/** Saves a new place for the user. */
export async function savePlace(
  uid: string,
  input: SavedPlaceInput
): Promise<SavedPlaceRecord> {
  try {
    const data = parseOrThrow(savedPlaceSchema, input);
    const ref = doc(placesRef(uid));
    await setDoc(ref, {
      ...data,
      japaneseName: data.japaneseName ?? null,
      proximityKm: data.proximityKm ?? null,
      tripId: data.tripId ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return {
      id: ref.id,
      ...data,
      japaneseName: data.japaneseName ?? null,
      proximityKm: data.proximityKm ?? null,
      tripId: data.tripId ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/**
 * Lists saved places (newest first). Optional trip/category filters are
 * applied client-side over a bounded read — personal collections are small
 * and this avoids composite indexes (documented in FIRESTORE_SCHEMA.md).
 */
export async function listSavedPlaces(
  uid: string,
  options: { tripId?: string; category?: z.output<typeof placeCategorySchema> } = {}
): Promise<SavedPlaceRecord[]> {
  try {
    const snapshot = await getDocsOrderByCreated(uid);
    let items = snapshot.map(mapDoc).filter((p): p is SavedPlaceRecord => p !== null);
    if (options.tripId) items = items.filter((p) => p.tripId === options.tripId);
    if (options.category) items = items.filter((p) => p.category === options.category);
    return items;
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

async function getDocsOrderByCreated(uid: string) {
  const snapshot = await getDocs(query(placesRef(uid), orderBy("createdAt", "desc"), limit(200)));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** One saved place, or `null`. */
export async function getSavedPlace(
  uid: string,
  placeId: string
): Promise<SavedPlaceRecord | null> {
  try {
    const snapshot = await getDoc(placeRef(uid, placeId));
    if (!snapshot.exists()) return null;
    return mapDoc({ id: snapshot.id, ...snapshot.data() });
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** Updates free-form notes (and any other editable field). */
export async function updatePlaceNotes(
  uid: string,
  placeId: string,
  notes: string
): Promise<void> {
  await updateSavedPlace(uid, placeId, { notes });
}

/** Applies a validated partial update to a saved place. */
export async function updateSavedPlace(
  uid: string,
  placeId: string,
  patch: Partial<SavedPlaceInput>
): Promise<void> {
  try {
    const parsed = parseOrThrow(savedPlaceSchema.partial(), patch);
    // Zod fills defaults for absent keys (category, city, notes, …) — keep
    // only what the caller sent so an update is strictly additive.
    const fields: Record<string, unknown> = {
      ...providedFields(patch, parsed),
    };
    if (Object.keys(fields).length === 0) throw new Error("Nothing to update.");
    await updateDoc(placeRef(uid, placeId), {
      ...fields,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** Links a place to a trip (or `null` to unlink). */
export async function associatePlaceWithTrip(
  uid: string,
  placeId: string,
  tripId: string | null
): Promise<void> {
  try {
    await updateDoc(placeRef(uid, placeId), {
      tripId,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** Removes a saved place. Idempotent — missing place = success. */
export async function removeSavedPlace(uid: string, placeId: string): Promise<void> {
  try {
    await deleteDoc(placeRef(uid, placeId));
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** Marks the Firestore record as mirrored to the offline store. */
export async function setPlaceOfflineCached(
  uid: string,
  placeId: string,
  cached: boolean
): Promise<void> {
  try {
    await updateDoc(placeRef(uid, placeId), {
      offlineCached: cached,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw mapFirestoreError(error);
  }
}
