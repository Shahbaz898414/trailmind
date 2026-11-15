"use client";

import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

/**
 * Server snapshot: assume online so the first client render matches.
 * The real value is picked up immediately after hydration.
 */
function getServerSnapshot() {
  return true;
}

/**
 * Tracks the browser's connectivity state.
 *
 * `navigator.onLine` only tells us whether the device has *a* network
 * interface up — it cannot prove the internet or Firebase is reachable, so
 * treat this as a UI hint rather than a guarantee.
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
