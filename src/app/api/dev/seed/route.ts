import { FieldValue } from "firebase-admin/firestore";

import {
  AdminNotConfiguredError,
  requireAdminFirestore,
  verifyBearerToken,
} from "@/lib/firebase/admin";
import { kyoto12DayItinerary, ladakh7DayItinerary, type ItineraryActivity, type ItineraryDay } from "@/data/itinerary";
import { sampleTripsList, type TripModel } from "@/data/trips";

/**
 * POST /api/dev/seed — DEVELOPMENT-ONLY sample data seeding.
 *
 * ---------------------------------------------------------------------------
 * SAFETY PROPERTIES (do not weaken these):
 * 1. Returns 404 in production builds (`NODE_ENV === "production"`).
 * 2. Requires a valid Firebase ID token in `Authorization: Bearer <token>` —
 *    data is seeded ONLY into that authenticated user's own paths.
 * 3. Idempotent: a trip that already exists is skipped, so re-running never
 *    duplicates or overwrites user data.
 * 4. Never runs automatically — only on an explicit POST from the signed-in
 *    developer (e.g. the "Load sample trips" action in the UI / curl).
 *
 * It uses the Admin SDK because it mirrors what Security Rules would reject
 * from an unauthenticated context; the seeded data is ordinary user data and
 * remains protected by the same rules afterwards.
 *
 * Sample content comes from `src/data/` (the Stitch preview data) — it is
 * migrated here as dev fixtures, never injected into accounts silently.
 */

/** The dev seed must not exist in production. */
export async function POST(request: Request): Promise<Response> {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  const claims = await verifyBearerToken(request.headers.get("authorization"));
  if (!claims) {
    return Response.json(
      { error: "Sign in to load sample data into your own account." },
      { status: 401 }
    );
  }

  try {
    const db = requireAdminFirestore();
    const userTrips = db.collection("users").doc(claims.uid).collection("trips");

    let tripsCreated = 0;
    let tripsSkipped = 0;
    let activitiesCreated = 0;

    for (const tripModel of sampleTripsList) {
      const tripRef = userTrips.doc(tripModel.id);
      const existing = await tripRef.get();
      if (existing.exists) {
        tripsSkipped += 1;
        continue;
      }

      await tripRef.set(tripModelToDoc(tripModel));
      tripsCreated += 1;

      const itinerary = ITINERARIES_BY_TRIP[tripModel.id];
      if (itinerary) {
        const batch = db.batch();
        for (const day of itinerary) {
          day.activities.forEach((activity, index) => {
            const activityRef = tripRef.collection("itinerary").doc();
            batch.set(activityRef, activityToDoc(day, index, activity));
            activitiesCreated += 1;
          });
        }
        await batch.commit();
      }
    }

    return Response.json({
      ok: true,
      uid: claims.uid,
      tripsCreated,
      tripsSkipped,
      activitiesCreated,
    });
  } catch (error) {
    if (error instanceof AdminNotConfiguredError) {
      return Response.json(
        { error: "Server seed credentials are not configured (FIREBASE_ADMIN_*)." },
        { status: 503 }
      );
    }
    console.error("[TrailMind] dev seed failed:", error);
    return Response.json({ error: "Seeding failed." }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/* Mappings (sample data → Firestore documents)                                */
/* -------------------------------------------------------------------------- */

function tripModelToDoc(trip: TripModel): Record<string, unknown> {
  return {
    title: trip.title,
    destination: trip.destination,
    region: trip.region,
    country: trip.country,
    countryCode: trip.countryCode,
    startDate: trip.startDate,
    endDate: trip.endDate,
    durationDays: trip.durationDays,
    status: trip.status,
    travelers: trip.travelers,
    offlineStatus: trip.offlineStatus,
    offlineSizeMb: trip.offlineSizeMb,
    coverImage: trip.coverImage,
    heroImage: trip.heroImage ?? null,
    summary: trip.summary,
    terrainType: trip.terrainType,
    averageElevation: trip.averageElevation,
    packWeightKg: trip.packWeightKg,
    maxWeightKg: trip.maxWeightKg,
    satelliteSyncCadence: trip.satelliteSyncCadence,
    budget: { currency: "USD", total: 0, spent: 0 },
    placesCount: 0,
    offlineReady: trip.offlineStatus === "downloaded",
    version: 1,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

function activityToDoc(
  day: ItineraryDay,
  order: number,
  activity: ItineraryActivity
): Record<string, unknown> {
  return {
    day: day.dayNumber,
    date: day.date,
    order,
    timeSlot: activity.timeSlot,
    title: activity.title,
    category: activity.category,
    location: activity.location,
    coordinates: activity.coordinates,
    duration: activity.duration,
    elevation: activity.elevation,
    crowdLevel: activity.crowdLevel,
    status: activity.status,
    image: activity.image ?? null,
    description: activity.description,
    solarEphemeris: activity.solarEphemeris ?? null,
    notes: activity.notes ?? null,
    audioKey: activity.audioKey ?? null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

/** Which sample itinerary belongs to which sample trip. */
const ITINERARIES_BY_TRIP: Record<string, ItineraryDay[]> = {
  "trip-kyoto-2026": kyoto12DayItinerary,
  "trip-ladakh-2026": ladakh7DayItinerary,
};
