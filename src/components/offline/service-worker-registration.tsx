"use client";

import { useEffect } from "react";

/**
 * Registers the service worker that powers TrailMind's offline app shell.
 *
 * Opt-in: it only runs when `NEXT_PUBLIC_ENABLE_SERVICE_WORKER=true` is set in
 * `.env.local`. Read `public/sw.js` before enabling it — it caches a small
 * static allowlist and never stores authenticated pages or Firebase traffic.
 *
 * Rendered once from the root layout. Returns no UI.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_SERVICE_WORKER !== "true") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    let cancelled = false;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.warn("[TrailMind] Service worker registration failed:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
