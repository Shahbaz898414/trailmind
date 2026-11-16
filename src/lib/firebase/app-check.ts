import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  type AppCheck,
} from "firebase/app-check";

import { getFirebaseApp } from "./client";
import { appCheckSiteKey } from "./config";

/**
 * Firebase App Check — attests that traffic really comes from TrailMind.
 *
 * ---------------------------------------------------------------------------
 * Opt-in, never called automatically.
 * ---------------------------------------------------------------------------
 * Returns `null` unless `NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY` is set, and
 * `null` on subsequent calls (App Check can only be initialised once per app).
 *
 * Call this once from a Client Component — e.g. the dashboard layout — after
 * you have registered the web app in the Firebase console:
 *
 *   initializeFirebaseAppCheck();
 *
 * Note: this SDK version only exposes the reCAPTCHA v3 and reCAPTCHA
 * Enterprise providers; there is no exported debug provider. For local
 * development against emulators, leave the site key empty — App Check is
 * simply not enforced until you configure it.
 *
 * Production setup (see docs/BACKEND_SETUP.md):
 *   1. Firebase console → App Check → register the web app with reCAPTCHA v3
 *   2. Enforce App Check for Auth/Firestore/Storage in the console
 *   3. Put the issued site key into `NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY`
 */
let appCheck: AppCheck | null = null;

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

/** True once App Check has been initialised in this session. */
export function isAppCheckInitialized(): boolean {
  return appCheck !== null;
}
