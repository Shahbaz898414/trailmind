import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  type AppCheck,
} from "firebase/app-check";

import { appCheckSiteKey, firebaseConfig, isFirebaseConfigured } from "./config";

/**
 * Firebase client entry point.
 *
 * ---------------------------------------------------------------------------
 * IMPORTANT
 * ---------------------------------------------------------------------------
 * Every getter here returns `null` instead of throwing when Firebase has not
 * been configured yet, so the app runs normally before credentials exist.
 * Nothing in this file is initialised automatically at import time — services
 * come up lazily, the first time something actually asks for them.
 *
 * Which services are ready:
 *   ✓ Firebase App          (client.ts)
 *   ✓ Cloud Firestore       (client.ts — with offline persistence enabled)
 *   ✓ Firebase Auth         (client.ts)
 *   ✓ Firebase AI Logic     (see `src/lib/ai/hybrid-model.ts`)
 *   ✓ Firebase App Check    (client.ts — only when a site key is provided)
 *   ✗ Storage / Analytics / Messaging — not wired yet, add when needed
 *
 * App data lives in Dexie (`src/lib/offline/db.ts`) first and syncs to
 * Firestore later; the service worker (`public/sw.js`) caches app *assets*
 * only. Those two stores are deliberately kept separate.
 */

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let appCheck: AppCheck | null = null;

/** Returns the default Firebase app, or `null` when configuration is missing. */
export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured || !firebaseConfig) return null;
  if (app) return app;

  // Reuse an app already created elsewhere (tests, hot reload) instead of
  // calling initializeApp() twice, which throws.
  const existing = getApps();
  app = existing.length > 0 ? existing[0] : initializeApp(firebaseConfig);
  return app;
}

/** Firebase Auth instance, or `null` when Firebase is not configured. */
export function getFirebaseAuth(): Auth | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!auth) auth = getAuth(firebaseApp);
  return auth;
}

/**
 * Cloud Firestore instance with offline persistence enabled.
 *
 * `persistentLocalCache` + `persistentMultipleTabManager` let Firestore keep a
 * local copy in IndexedDB so reads keep working without a connection — the
 * foundation for Firestore-backed offline support.
 *
 * Returns `null` when Firebase is not configured.
 */
export function getFirebaseDb(): Firestore | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;

  if (!db) {
    try {
      initializeFirestore(firebaseApp, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } catch {
      // Already initialised for this app — fall through to getFirestore().
    }
    db = getFirestore(firebaseApp);
  }
  return db;
}

/**
 * Initialises Firebase App Check. **Opt-in, never called automatically.**
 *
 * Returns `null` unless `NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY` is set, and
 * `null` on subsequent calls (App Check can only be initialised once per app).
 *
 * Call this from a client component once — e.g. from the dashboard layout —
 * after you have registered the web app in the Firebase console.
 *
 * Note: this SDK version only exposes the reCAPTCHA v3 and reCAPTCHA
 * Enterprise providers; there is no exported debug provider.
 */
export function initializeFirebaseAppCheck(): AppCheck | null {
  if (appCheck) return appCheck;

  const firebaseApp = getFirebaseApp();
  if (!firebaseApp || !appCheckSiteKey) return null;

  try {
    appCheck = initializeAppCheck(firebaseApp, {
      provider: new ReCaptchaV3Provider(appCheckSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (error) {
    console.warn("[TrailMind] App Check could not be initialised:", error);
    return null;
  }
  return appCheck;
}

/** True when the Firebase web config is complete enough to initialise. */
export { isFirebaseConfigured };
