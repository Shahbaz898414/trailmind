import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Query,
} from "firebase/firestore";
import { z } from "zod";

import type { TripStatus } from "@/types/travel";
import {
  fetchQueryPage,
  mapFirestoreError,
  requireDb,
  timestampToIso,
  type QueryPage,
} from "@/lib/firebase/firestore";
import { parseOrThrow } from "@/lib/validation";

/**
 * Trips service — Firestore collection `users/{uid}/trips/{tripId}`.
 *
 * ---------------------------------------------------------------------------
 * OWNERSHIP: every function takes an explicit `uid` and only touches
 * `users/{uid}/trips`. Firestore Security Rules enforce owner-only access —
 * this module is convenience, not the security boundary.
 * ---------------------------------------------------------------------------
 *
 * Design notes:
 * - Inputs are Zod-validated (`tripInputSchema` / `tripPatchSchema`);
 *   reads are re-validated defensively so a malformed/legacy document
 *   degrades to `null` (logged) instead of crashing a page.
 * - `version` starts at 1 and is incremented by `increment(1)` on every
 *   update (works offline — transactions would not). The sync engine
 *   (Phase 6) uses `version` + `updatedAt` for conflict detection.
 * - Dates are ISO `YYYY-MM-DD` strings, exactly what the UI already uses.
 * - `durationDays` is derived at write time (inclusive: start day counts).
 * - Reads use `runWithRetry` for transient failures; writes are single-doc
 *   and idempotent enough to retry via the outbox later.
 * - Large listings paginate through `fetchQueryPage` (cursor-based).
 *
 * Search: Firestore has no full-text search. `searchTrips` fetches a bounded
 * number of the user's trips and filters client-side — honest and adequate
 * for a personal trip collection (documented in docs/FIRESTORE_SCHEMA.md).
 */

/* -------------------------------------------------------------------------- */
/* Schema                                                                      */
/* -------------------------------------------------------------------------- */

/** Canonical trip lifecycle (matches the UI's trip tabs). */
export const TRIP_STATUSES = [
  "draft",
  "upcoming",
  "in-progress",
  "completed",
] as const satisfies readonly TripStatus[];
export const tripStatusSchema = z.enum(TRIP_STATUSES);

const OFFLINE_STATUSES = [
  "downloaded",
  "downloading",
  "sync_required",
  "not_downloaded",
] as const;
const offlineStatusSchema = z.enum(OFFLINE_STATUSES);

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD.");

const budgetSchema = z.object({
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/, "Currency must be a 3-letter code (e.g. USD)."),
  total: z.number().min(0),
  spent: z.number().min(0),
});

/** Fields accepted when creating a trip. Defaults fill in what's omitted. */
export const tripInputSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    destination: z.string().trim().min(1).max(200),
    region: z.string().trim().max(200).default(""),
    country: z.string().trim().max(100).default(""),
    /** ISO 3166-1 alpha-2, or "" when unknown. */
    countryCode: z
      .string()
      .trim()
      .regex(/^([A-Z]{2})?$/, "Use a 2-letter country code (e.g. JP).")
      .default(""),
    startDate: isoDateSchema,
    endDate: isoDateSchema,
    status: tripStatusSchema.default("draft"),
    travelers: z.number().int().min(1).max(99).default(1),
    offlineStatus: offlineStatusSchema.default("not_downloaded"),
    offlineSizeMb: z.number().min(0).default(0),
    coverImage: z.string().max(500).default(""),
    heroImage: z.string().max(500).nullish(),
    summary: z.string().max(1000).default(""),
    terrainType: z.string().max(300).default(""),
    averageElevation: z.string().max(100).default(""),
    packWeightKg: z.number().min(0).max(500).default(0),
    maxWeightKg: z.number().min(0).max(500).default(0),
    satelliteSyncCadence: z.string().max(100).default(""),
    budget: budgetSchema.default({ currency: "USD", total: 0, spent: 0 }),
  })
  .refine((trip) => trip.endDate >= trip.startDate, {
    message: "End date must be on or after the start date.",
    path: ["endDate"],
  });

export type TripInput = z.input<typeof tripInputSchema>;

/** Partial patch accepted by `updateTrip`. */
export const tripPatchSchema = tripInputSchema.partial();
export type TripPatch = z.input<typeof tripPatchSchema>;

/** The trip as the app consumes it (timestamps as ISO strings). */
export type TripRecord = {
  id: string;
  title: string;
  destination: string;
  region: string;
  country: string;
  countryCode: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  status: TripStatus;
  travelers: number;
  offlineStatus: (typeof OFFLINE_STATUSES)[number];
  offlineSizeMb: number;
  coverImage: string;
  heroImage: string | null;
  summary: string;
  terrainType: string;
  averageElevation: string;
  packWeightKg: number;
  maxWeightKg: number;
  satelliteSyncCadence: string;
  budget: { currency: string; total: number; spent: number };
  placesCount: number;
  offlineReady: boolean;
  /** Optimistic-concurrency counter — incremented on every update. */
  version: number;
  createdAt: string;
  updatedAt: string;
};

/** Read-side schema: everything the UI needs, tolerant of legacy docs. */
const tripRecordSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  destination: z.string(),
  region: z.string().default(""),
  country: z.string().default(""),
  countryCode: z.string().default(""),
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  durationDays: z.number().int().min(1).default(1),
  status: tripStatusSchema,
  travelers: z.number().int().min(1).max(99).default(1),
  offlineStatus: offlineStatusSchema.default("not_downloaded"),
  offlineSizeMb: z.number().min(0).default(0),
  coverImage: z.string().default(""),
  heroImage: z.string().nullish().default(null),
  summary: z.string().default(""),
  terrainType: z.string().default(""),
  averageElevation: z.string().default(""),
  packWeightKg: z.number().default(0),
  maxWeightKg: z.number().default(0),
  satelliteSyncCadence: z.string().default(""),
  budget: budgetSchema.default({ currency: "USD", total: 0, spent: 0 }),
  placesCount: z.number().int().min(0).default(0),
  offlineReady: z.boolean().default(false),
  version: z.number().int().min(1).default(1),
  createdAt: z.string().default(""),
  updatedAt: z.string().default(""),
});

/** Inclusive day count: the start day itself counts as a day. */
export function computeDurationDays(startDate: string, endDate: string): number {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) return 1;
  return Math.max(1, Math.round((end - start) / 86_400_000) + 1);
}

/** "Kyoto, Japan" → "Japan" (used when the form only collects a destination). */
function deriveCountry(destination: string): string {
  const parts = destination.split(",").map((p) => p.trim()).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

/* -------------------------------------------------------------------------- */
/* Mapping                                                                     */
/* -------------------------------------------------------------------------- */

/** Raw Firestore doc → `TripRecord`, or `null` when malformed (logged). */
function mapTripDoc(raw: { id: string } & Record<string, unknown>): TripRecord | null {
  const normalized = {
    ...raw,
    createdAt: timestampToIso(raw.createdAt),
    updatedAt: timestampToIso(raw.updatedAt),
  };
  const parsed = tripRecordSchema.safeParse(normalized);
  if (!parsed.success) {
    console.warn(`[TrailMind] trip ${raw.id} failed validation:`, parsed.error.issues[0]);
    return null;
  }
  return parsed.data;
}

function tripsRef(uid: string) {
  return collection(requireDb(), "users", uid, "trips");
}

function tripRef(uid: string, tripId: string) {
  return doc(requireDb(), "users", uid, "trips", tripId);
}

/* -------------------------------------------------------------------------- */
/* Create / read                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Creates a trip for `uid` and returns the stored record.
 *
 * @throws Error with a UI-safe message (validation / permission / network).
 */
export async function createTrip(uid: string, input: TripInput): Promise<TripRecord> {
  try {
    const data = parseOrThrow(tripInputSchema, input);
    const country = data.country || deriveCountry(data.destination);
    const ref = doc(tripsRef(uid));

    const stored = {
      ...data,
      country,
      durationDays: computeDurationDays(data.startDate, data.endDate),
      offlineReady: data.offlineStatus === "downloaded",
      placesCount: 0,
      version: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(ref, stored);

    return {
      id: ref.id,
      ...data,
      country,
      heroImage: data.heroImage ?? null,
      durationDays: stored.durationDays,
      offlineReady: stored.offlineReady,
      placesCount: 0,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

export type ListTripsOptions = {
  /** Server-side status filter (needs the composite index — see docs). */
  status?: TripStatus;
  /** Page size. Defaults to 20. */
  pageSize?: number;
  /** Cursor from the previous page. */
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
};

/**
 * Fetches one page of the user's trips, newest start date first.
 *
 * Large collections must use this instead of loading everything.
 */
export async function listTrips(
  uid: string,
  { status, pageSize = 20, cursor }: ListTripsOptions = {}
): Promise<QueryPage<TripRecord>> {
  try {
    const constraints = [];
    if (status) constraints.push(where("status", "==", status));
    constraints.push(orderBy("startDate", "desc"));
    const base: Query<DocumentData> = query(tripsRef(uid), ...constraints);

    const page = await fetchQueryPage<{ id: string } & Record<string, unknown>>(
      base,
      pageSize,
      cursor
    );

    return {
      items: page.items.map(mapTripDoc).filter((t): t is TripRecord => t !== null),
      cursor: page.cursor,
      hasMore: page.hasMore,
    };
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/**
 * Reads one trip.
 *
 * @returns the trip, or `null` when it doesn't exist / is malformed
 *          (missing documents are a normal state, not an error).
 */
export async function getTrip(uid: string, tripId: string): Promise<TripRecord | null> {
  try {
    const snapshot = await getDoc(tripRef(uid, tripId));
    if (!snapshot.exists()) return null;
    return mapTripDoc({ id: snapshot.id, ...snapshot.data() });
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/**
 * Bounded client-side search over the user's trips (Firestore has no
 * full-text search). Fetches up to `maxTrips` (default 100) and filters
 * by title / destination / country substring, case-insensitive.
 */
export async function searchTrips(
  uid: string,
  term: string,
  maxTrips = 100
): Promise<TripRecord[]> {
  const needle = term.trim().toLowerCase();
  if (!needle) return [];

  try {
    const pageSize = 25;
    const results: TripRecord[] = [];
    let cursor: QueryDocumentSnapshot<DocumentData> | null = null;

    while (results.length < maxTrips) {
      const page = await listTrips(uid, { pageSize, cursor });
      results.push(
        ...page.items.filter(
          (t) =>
            t.title.toLowerCase().includes(needle) ||
            t.destination.toLowerCase().includes(needle) ||
            t.country.toLowerCase().includes(needle)
        )
      );
      if (!page.hasMore || !page.cursor) break;
      cursor = page.cursor;
    }

    return results.slice(0, maxTrips);
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Update / delete                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Applies a validated partial update to a trip.
 *
 * Increments `version` (offline-safe optimistic concurrency) and refreshes
 * `updatedAt`. Cross-field date validation runs when both dates are present
 * in the patch; full validation happens at create time.
 */
export async function updateTrip(
  uid: string,
  tripId: string,
  patch: TripPatch
): Promise<void> {
  try {
    const parsed = parseOrThrow(tripPatchSchema, patch);
    if (Object.keys(parsed).length === 0) throw new Error("Nothing to update.");

    if (parsed.startDate && parsed.endDate && parsed.endDate < parsed.startDate) {
      throw new Error("End date must be on or after the start date.");
    }

    const fields: Record<string, unknown> = { ...parsed };
    if (parsed.startDate || parsed.endDate) {
      // Recompute duration if either endpoint changed — read the other side.
      const current = await getDoc(tripRef(uid, tripId));
      if (!current.exists()) throw new Error("That trip no longer exists.");
      const data = current.data();
      const startDate = parsed.startDate ?? String(data.startDate ?? "");
      const endDate = parsed.endDate ?? String(data.endDate ?? "");
      fields.durationDays = computeDurationDays(startDate, endDate);
    }
    if (parsed.offlineStatus !== undefined) {
      fields.offlineReady = parsed.offlineStatus === "downloaded";
    }

    await updateDoc(tripRef(uid, tripId), {
      ...fields,
      version: increment(1),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** Convenience: change only the trip status (bumps version like any update). */
export async function setTripStatus(
  uid: string,
  tripId: string,
  status: TripStatus
): Promise<void> {
  await updateTrip(uid, tripId, { status });
}

/**
 * Deletes a trip and its itinerary subcollection, then de-associates (never
 * deletes) the user's saved places and documents that pointed at it, so no
 * dangling references or lost user data remain.
 */
export async function deleteTrip(uid: string, tripId: string): Promise<void> {
  try {
    const db = requireDb();

    // 1. Itinerary lives in a subcollection — Firestore does not cascade.
    const activities = await getDocs(
      collection(db, "users", uid, "trips", tripId, "itinerary")
    );
    if (!activities.empty) {
      const docs = activities.docs;
      for (let i = 0; i < docs.length; i += 400) {
        const batch = writeBatch(db);
        docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    }

    // 2. De-associate saved places and documents (preserve the user's data).
    for (const subcollection of ["savedPlaces", "documents"] as const) {
      const snapshot = await getDocs(
        query(
          collection(db, "users", uid, subcollection),
          where("tripId", "==", tripId)
        )
      );
      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.docs.forEach((d) => batch.update(d.ref, { tripId: null }));
        await batch.commit();
      }
    }

    // 3. Finally the trip itself.
    await deleteDoc(tripRef(uid, tripId));
  } catch (error) {
    throw mapFirestoreError(error);
  }
}
