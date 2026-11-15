/**
 * Core domain types for TrailMind.
 *
 * These types are shared between the offline store (`src/lib/offline/db.ts`),
 * the sample preview data (`src/constants/sample-data.ts`) and the future
 * Firestore sync layer, so keep them free of any storage- or framework-specific
 * fields.
 *
 * Dates are stored as ISO-8601 strings (`YYYY-MM-DD` or full ISO timestamp)
 * because that is what both IndexedDB and Firestore handle well.
 */

export type TripStatus = "planning" | "upcoming" | "in-progress" | "completed";

/** Visual theme used for a trip's cover block until real photos are added. */
export type CoverTheme = "forest" | "sage" | "accent" | "dusk";

export type Trip = {
  id: string;
  title: string;
  destination: string;
  countryCode: string;
  /** ISO date, `YYYY-MM-DD` */
  startDate: string;
  /** ISO date, `YYYY-MM-DD` */
  endDate: string;
  status: TripStatus;
  cover: CoverTheme;
  budget: {
    currency: string;
    /** Total budget in the trip currency */
    total: number;
    /** Amount spent so far */
    spent: number;
  };
  /** Number of places saved for this trip */
  placesCount: number;
  /** Whether an offline pack has been downloaded for this trip */
  offlineReady: boolean;
  /** Short note shown on the trip card preview */
  summary: string;
};

export type SavedPlace = {
  id: string;
  tripId: string;
  name: string;
  category: string;
  city: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  /** ISO timestamp */
  createdAt: string;
};

export type ItineraryItem = {
  id: string;
  tripId: string;
  /** 1-based day index within the trip */
  day: number;
  title: string;
  startsAt?: string;
  endsAt?: string;
  location?: string;
  notes?: string;
};

export type OfflinePackStatus = "not-downloaded" | "downloading" | "ready" | "failed";

/** A downloadable bundle of trip data kept for offline use. */
export type OfflinePack = {
  id: string;
  tripId: string;
  status: OfflinePackStatus;
  /** Size in megabytes */
  sizeMb: number;
  /** ISO timestamp of the last successful update */
  updatedAt: string;
};

export type WalletEntry = {
  id: string;
  tripId: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  /** ISO date, `YYYY-MM-DD` */
  date: string;
};

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  tripId?: string;
  role: ChatRole;
  content: string;
  /** Where the answer came from, once hybrid inference is wired up */
  source?: "on-device" | "cloud";
  /** ISO timestamp */
  createdAt: string;
};

/** A single pending mutation waiting to be pushed to Firestore. */
export type SyncOperation = {
  /** Client-generated UUID (kept as a string so it works across tabs). */
  id: string;
  entity: string;
  entityId: string;
  operation: "create" | "update" | "delete";
  payload?: unknown;
  /** ISO timestamp */
  createdAt: string;
  attempts: number;
};
