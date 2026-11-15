/*
 * TrailMind service worker — offline app-shell scaffold.
 * ===========================================================================
 * STATUS: scaffold only. It has NOT been verified offline in Chrome yet, so
 * do not describe TrailMind as "fully offline" until that testing is done.
 *
 * WHAT THIS CACHES (allowlist only — anything not listed passes through):
 *   - the static landing shell (`/`), the manifest and brand icons
 *   - hashed build assets under `/_next/static/` (immutable, safe to reuse)
 *   - images and icons in `public/`
 *
 * WHAT IT DELIBERATELY NEVER CACHES:
 *   - anything on another origin (Firebase Auth, Firestore, AI Logic, reCAPTCHA)
 *   - `/api/*` route handlers
 *   - HTML for authenticated/private routes (navigations are never stored)
 *   - IndexedDB/Dexie data — local app data lives in `src/lib/offline/db.ts`,
 *     completely separate from this Cache Storage layer
 *
 * OFFLINE NAVIGATION LIMITATION (read before claiming offline support):
 *   When the network is down, a navigation falls back to the cached shell so
 *   the app can boot, and page data is read from IndexedDB. However the client
 *   router's RSC requests for other routes are not cached here — navigating
 *   between routes while fully offline is NOT yet guaranteed. Options to close
 *   that gap: enable `experimental.useOffline` in `next.config.ts`, or cache
 *   RSC payloads deliberately. Verify any of it in Chrome before claiming it.
 *
 * ENABLED BY DEFAULT? No. Registration happens in
 * `src/components/offline/service-worker-registration.tsx` only when
 * `NEXT_PUBLIC_ENABLE_SERVICE_WORKER=true`.
 */

const CACHE_VERSION = "v1";
const SHELL_CACHE = `trailmind-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `trailmind-runtime-${CACHE_VERSION}`;

/** Small, public, static set — safe to keep for an offline cold start. */
const SHELL_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon.svg",
  "/icons/icon-maskable.svg",
];

/** Only these same-origin paths may ever be written to Cache Storage. */
const CACHEABLE_PATH_PREFIXES = ["/_next/static/", "/icons/", "/images/"];
const CACHEABLE_PATHS = ["/manifest.json", "/favicon.ico"];
const CACHEABLE_EXTENSIONS = /\.(?:svg|png|jpe?g|webp|ico|woff2?)$/;

function isCacheableAsset(pathname) {
  return (
    CACHEABLE_PATHS.includes(pathname) ||
    CACHEABLE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    CACHEABLE_EXTENSIONS.test(pathname)
  );
}

/* ---------------------------------------------------------------- install */

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      // allSettled: one failed asset must not block the worker from installing.
      Promise.allSettled(SHELL_ASSETS.map((url) => cache.add(url)))
    )
  );
  // No skipWaiting(): let the user pick up the new worker on the next load so
  // an in-progress request is never pulled out from under them.
});

/* --------------------------------------------------------------- activate */

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith("trailmind-") &&
                key !== SHELL_CACHE &&
                key !== RUNTIME_CACHE
            )
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ------------------------------------------------------------------ fetch */

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Mutations and partial requests are never cached.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Cross-origin traffic (Firebase, Google) always goes straight to the network.
  if (url.origin !== self.location.origin) return;

  // Navigations: network first, cached shell as the offline fallback.
  // The navigation response itself is intentionally NOT stored — HTML for
  // signed-in routes may contain private data.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/").then((cached) => cached || Response.error())
      )
    );
    return;
  }

  if (!isCacheableAsset(url.pathname)) return;

  // Static build assets are content-hashed and immutable → cache first,
  // refreshed in the background.
  event.respondWith(
    caches.open(RUNTIME_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          if (response.ok) void cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached || Response.error());

      return cached || network;
    })
  );
});
