/**
 * Real connectivity signals for the offline layer.
 *
 * `navigator.onLine` reports whether the device has a network interface up —
 * it cannot prove Firebase is reachable. It is used here to SCHEDULE work
 * (flush the outbox on reconnect) and to fail fast, never to claim that a
 * write succeeded.
 */

import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/client";

type Listener = (online: boolean) => void;

const listeners = new Set<Listener>();
let attached = false;

function emit(): void {
  const online = isOnline();
  for (const listener of listeners) listener(online);
}

/** Current browser connectivity (true when the API is unavailable, e.g. SSR). */
export function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine !== false;
}

/**
 * Subscribes to connectivity changes (online/offline window events).
 * The listener fires immediately with the current state.
 */
export function subscribeConnectivity(listener: Listener): () => void {
  listeners.add(listener);
  if (typeof window !== "undefined" && !attached) {
    window.addEventListener("online", emit);
    window.addEventListener("offline", emit);
    attached = true;
  }
  listener(isOnline());
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("online", emit);
      window.removeEventListener("offline", emit);
      attached = false;
    }
  };
}

/**
 * True when DATA operations must use the local layer: the backend IS
 * configured but the browser reports no connectivity.
 *
 *   - reads  → served from the Dexie mirror
 *   - writes → queued in the outbox (`syncQueue`) + mirrored immediately
 *
 * When Firebase is NOT configured this returns false, so services keep
 * throwing their honest `FirebaseNotConfiguredError` instead of silently
 * queueing writes that could never sync anywhere.
 *
 * Note: `navigator.onLine === true` with a dead connection is NOT covered
 * here — in that case Firestore's own persistent cache queues writes and
 * reads fail with a transient error (services fall back to the mirror on
 * read). `navigator.onLine` schedules work; it never proves a write landed.
 */
export function isOfflineForData(): boolean {
  return isFirebaseConfigured && getFirebaseDb() !== null && !isOnline();
}
