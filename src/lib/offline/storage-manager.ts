/**
 * Browser storage management — honest estimates, persistence, cache clearing.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS REAL HERE
 *   - `navigator.storage.estimate()` — the browser's actual usage/quota
 *     numbers (Origin Private File System + IndexedDB + Cache Storage for
 *     this origin). Not a TrailMind-specific figure; labelled as such.
 *   - `navigator.storage.persisted()` / `persist()` — the real persistent-
 *     storage permission. Chrome grants it automatically for installed /
 *     engaged sites; otherwise the result is `"denied"` and we say so.
 *   - Cache clearing deletes ONLY this app's Cache Storage entries (static
 *     assets re-fetched by the service worker on next visit). It never
 *     touches IndexedDB — user data and the sync outbox survive, by design.
 * ---------------------------------------------------------------------------
 * There is no API that reports "how much space TrailMind data uses" alone,
 * so nothing here pretends to one.
 */

export type StorageEstimateInfo = {
  /** Bytes currently used by this origin (browser-reported). */
  usageBytes: number;
  /** Bytes available to this origin (browser-reported), or null if unknown. */
  quotaBytes: number | null;
  /** usage / quota as 0..1, or null when the quota is unknown. */
  usageFraction: number | null;
};

export type PersistenceState =
  | "granted"
  | "denied"
  /** The Storage Manager API doesn't exist in this browser. */
  | "unsupported";

/** Browser-reported storage usage for this origin, or null when unavailable. */
export async function getStorageEstimate(): Promise<StorageEstimateInfo | null> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) {
    return null;
  }
  try {
    const { usage, quota } = await navigator.storage.estimate();
    if (usage === undefined) return null;
    return {
      usageBytes: usage,
      quotaBytes: quota ?? null,
      usageFraction:
        quota !== undefined && quota > 0 ? Math.min(1, usage / quota) : null,
    };
  } catch (error) {
    console.warn("[TrailMind] storage estimate failed:", error);
    return null;
  }
}

/** Checks whether this origin already has persistent storage granted. */
export async function isStoragePersisted(): Promise<boolean | null> {
  if (typeof navigator === "undefined" || !navigator.storage?.persisted) {
    return null;
  }
  try {
    return await navigator.storage.persisted();
  } catch {
    return null;
  }
}

/**
 * Requests persistent storage (the browser may auto-grant, prompt, or deny).
 * Returns the honest outcome — never reports "granted" without the API
 * confirming it.
 */
export async function requestStoragePersistence(): Promise<PersistenceState> {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) {
    return "unsupported";
  }
  try {
    return (await navigator.storage.persist()) ? "granted" : "denied";
  } catch {
    return "denied";
  }
}

/**
 * Deletes this app's Cache Storage entries (the service worker's static-asset
 * caches). IndexedDB — user data and the pending sync outbox — is untouched.
 *
 * @returns the names of the caches actually removed.
 */
export async function clearAppAssetCaches(): Promise<string[]> {
  if (typeof caches === "undefined") return [];
  try {
    const names = await caches.keys();
    const removed: string[] = [];
    for (const name of names) {
      // Only this app's caches (next-trailmind-* / workbox-*) — never a
      // shared or third-party cache that happens to live on this origin.
      if (/^(next-trailmind|trailmind|workbox)/i.test(name)) {
        if (await caches.delete(name)) removed.push(name);
      }
    }
    return removed;
  } catch (error) {
    console.warn("[TrailMind] cache clearing failed:", error);
    return [];
  }
}

/** Human-readable byte formatting (binary units). */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value >= 10 || unit === 0 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
}
