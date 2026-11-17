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

/**
 * Trip lifecycle as the UI presents it (the trips page filters on these
 * exact values). `draft` replaced the earlier `planning` value so Firestore,
 * Dexie and the UI share one canonical enum.
 */
export type TripStatus = "draft" | "upcoming" | "in-progress" | "completed";

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
  /** Conversation this message belongs to (AI chat history). */
  conversationId?: string;
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
  /**
   * Owner of this operation. The sync engine only flushes operations whose
   * uid matches the signed-in user — a queued write from user A can never be
   * pushed into user B's data if accounts are switched on this device.
   */
  uid: string;
  entity: string;
  entityId: string;
  operation: "create" | "update" | "delete";
  payload?: unknown;
  /** ISO timestamp */
  createdAt: string;
  attempts: number;
  /**
   * Version the edit was based on (read from the Dexie mirror when the write
   * happened offline). The sync engine refuses to auto-apply an update whose
   * remote version has moved past this — a real conflict, surfaced instead of
   * silently overwritten.
   */
  baseVersion?: number;
  /**
   * `updatedAt` (ISO) the edit was based on — conflict signal for entities
   * without a `version` counter.
   */
  baseUpdatedAt?: string;
  /**
   * Set by the sync engine when the operation must NOT be applied
   * automatically (e.g. `"conflict: remote version 7 > base 5"`). Flagged
   * operations are skipped until explicitly resolved (retry/discard).
   */
  lastError?: string;
};
