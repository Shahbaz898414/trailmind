/**
 * Offline entity registry — one place that describes how each user-scoped
 * entity participates in the offline/sync pipeline.
 *
 * - `versioned` entities (trips) carry a `version` counter; the sync engine
 *   detects conflicts by comparing `baseVersion` with the remote version.
 * - Non-versioned entities fall back to `updatedAt` comparison
 *   (`baseUpdatedAt`) when available, else last-writer-wins (documented in
 *   `docs/OFFLINE_SYNC.md`).
 * - `dexieStore` is the mirror table the read path uses while offline.
 */

export type OfflineEntity =
  | "trip"
  | "activity"
  | "itinerary-order"
  | "itinerary-clear"
  | "savedPlace"
  | "document"
  | "conversation"
  | "message"
  | "phrase"
  | "notification"
  | "emergencyContact";

export type EntityMeta = {
  /** Human label for logs/status UI. */
  label: string;
  /** Conflict detection strategy used by the sync engine. */
  conflict: "version" | "updatedAt" | "lww";
};

export const OFFLINE_ENTITIES: Record<OfflineEntity, EntityMeta> = {
  trip: { label: "Trip", conflict: "version" },
  activity: { label: "Itinerary activity", conflict: "updatedAt" },
  "itinerary-order": { label: "Itinerary order", conflict: "lww" },
  "itinerary-clear": { label: "Itinerary reset", conflict: "lww" },
  savedPlace: { label: "Saved place", conflict: "updatedAt" },
  document: { label: "Travel document", conflict: "updatedAt" },
  conversation: { label: "Conversation", conflict: "updatedAt" },
  message: { label: "Chat message", conflict: "lww" },
  phrase: { label: "Saved phrase", conflict: "lww" },
  notification: { label: "Notification", conflict: "lww" },
  emergencyContact: { label: "Emergency contact", conflict: "updatedAt" },
};
