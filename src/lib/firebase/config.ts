import { z } from "zod";

/**
 * Firebase configuration, read from environment variables.
 *
 * Design notes
 * ---------------------------------------------------------------------------
 * - Nothing here is hard-coded: no project IDs, no API keys, no app IDs.
 *   Values come exclusively from `.env.local` (see `.env.example`).
 * - The module never throws when configuration is missing. Instead it exposes
 *   `isFirebaseConfigured` so the UI can tell the developer what is missing
 *   and the app keeps running without Firebase.
 * - `NEXT_PUBLIC_*` values are inlined into the browser bundle at build time.
 *   That is expected for Firebase *web* config — real security comes from
 *   Security Rules, Auth and App Check, not from hiding these values.
 */

const firebaseEnvSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().trim().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().trim().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().trim().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().trim().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().trim().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().trim().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().trim().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY: z.string().trim().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_AI_MODEL: z.string().trim().min(1).optional(),
  NEXT_PUBLIC_ENABLE_SERVICE_WORKER: z.enum(["true", "false"]).optional(),
  NEXT_PUBLIC_USE_FIREBASE_EMULATORS: z.enum(["true", "false"]).optional(),
  /** Host for the local Firebase Emulator Suite (Auth/Firestore/Storage). */
  NEXT_PUBLIC_FIREBASE_EMULATOR_HOST: z.string().trim().min(1).optional(),
});

/**
 * Parsed once at module load. Every field is optional, so parsing can only
 * fail if an env var holds a wrong *type* — which Next.js never produces —
 * hence the defensive fallback rather than a thrown error.
 */
const env = firebaseEnvSchema.safeParse({
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY:
    process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY,
  NEXT_PUBLIC_FIREBASE_AI_MODEL: process.env.NEXT_PUBLIC_FIREBASE_AI_MODEL,
  NEXT_PUBLIC_ENABLE_SERVICE_WORKER: process.env.NEXT_PUBLIC_ENABLE_SERVICE_WORKER,
  NEXT_PUBLIC_USE_FIREBASE_EMULATORS:
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS,
  NEXT_PUBLIC_FIREBASE_EMULATOR_HOST:
    process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST,
});

const values = env.success ? env.data : {};

/** The subset of the Firebase web config object that `initializeApp()` needs. */
export type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
};

/** Variable names required before Firebase can be initialised at all. */
const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

/** Names of the required variables that are still empty. */
export const missingFirebaseEnvVars: string[] = REQUIRED_ENV_VARS.filter(
  (name) => !values[name]
);

/**
 * True only when every required Firebase variable is present.
 * Guard every Firebase call with this (or with the `null`-returning getters in
 * `client.ts`) so the app runs cleanly before credentials exist.
 */
export const isFirebaseConfigured = missingFirebaseEnvVars.length === 0;

/** The Firebase web config, or `null` when configuration is incomplete. */
export const firebaseConfig: FirebaseWebConfig | null = isFirebaseConfigured
  ? {
      apiKey: values.NEXT_PUBLIC_FIREBASE_API_KEY!,
      authDomain: values.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
      projectId: values.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
      storageBucket: values.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: values.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: values.NEXT_PUBLIC_FIREBASE_APP_ID!,
      measurementId: values.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    }
  : null;

/** Throws a descriptive error — use only where a missing config is a real bug. */
export function requireFirebaseConfig(): FirebaseWebConfig {
  if (!firebaseConfig) {
    throw new Error(
      `Firebase is not configured. Missing: ${missingFirebaseEnvVars.join(", ")}. ` +
        "Copy .env.example to .env.local and fill in your Firebase web app values."
    );
  }
  return firebaseConfig;
}

/** reCAPTCHA v3 site key for App Check. Empty until you register the app. */
export const appCheckSiteKey = values.NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY ?? "";

/** Gemini model used for in-cloud inference through Firebase AI Logic. */
export const firebaseAiModel =
  values.NEXT_PUBLIC_FIREBASE_AI_MODEL ?? "gemini-2.5-flash";

/**
 * Service worker is opt-in. Read `public/sw.js` before enabling it.
 * Never return `true` implicitly — the flag must be explicitly set to "true".
 */
export const isServiceWorkerEnabled =
  values.NEXT_PUBLIC_ENABLE_SERVICE_WORKER === "true";

/**
 * When true, every Firebase client SDK (Auth, Firestore, Storage) connects to
 * the local Emulator Suite instead of production. Requires the emulators to
 * be running (`npm run emulators`). Off unless explicitly set to "true".
 *
 * Never enable this in a production build — guard deployments accordingly.
 */
export const useFirebaseEmulators =
  values.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";

/** Host the emulators listen on. Defaults to the standard `127.0.0.1`. */
export const firebaseEmulatorHost =
  values.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST ?? "127.0.0.1";

/** Emulator ports — match `firebase.json` when you change them here. */
export const emulatorPorts = {
  auth: 9099,
  firestore: 8080,
  storage: 9199,
} as const;
