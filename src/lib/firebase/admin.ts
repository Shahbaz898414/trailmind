import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * Firebase Admin SDK — SERVER ONLY.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS EXISTS
 * ---------------------------------------------------------------------------
 * Almost everything in TrailMind runs client-side against user-scoped paths
 * (Security Rules are the real enforcement). This module is only for the
 * rare privileged server operations performed by Route Handlers:
 *
 *   - verifying a Bearer ID token from an incoming request (`verifyBearerToken`)
 *   - the development-only seed route (`/api/dev/seed`)
 *
 * `import "server-only"` makes any accidental client import fail the build.
 *
 * ---------------------------------------------------------------------------
 * CONFIGURATION (no credentials are hard-coded here)
 * ---------------------------------------------------------------------------
 * Three environment variables, read from `.env.local` (server-side only —
 * they are intentionally NOT `NEXT_PUBLIC_*`):
 *
 *   FIREBASE_ADMIN_PROJECT_ID     e.g. your-project-id
 *   FIREBASE_ADMIN_CLIENT_EMAIL   service-account client email
 *   FIREBASE_ADMIN_PRIVATE_KEY    service-account private key
 *                                 (paste with real newlines or literal \n —
 *                                  both are handled below)
 *
 * Until all three are set, `isFirebaseAdminConfigured` is false and every
 * getter returns `null` / `require*` throws `AdminNotConfiguredError`.
 *
 * ---------------------------------------------------------------------------
 * EMULATORS
 * ---------------------------------------------------------------------------
 * When `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true`, the Auth token verifier is
 * pointed at the local Auth emulator (standard `FIREBASE_AUTH_EMULATOR_HOST`
 * env var is honoured too). The Admin SDK never verifies against production
 * while emulator mode is on.
 *
 * Never log or return service-account values from this module.
 */

/** Thrown when an Admin operation runs before server credentials exist. */
export class AdminNotConfiguredError extends Error {
  constructor(detail = "Firebase Admin credentials are missing.") {
    super(
      `${detail} Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL and ` +
        "FIREBASE_ADMIN_PRIVATE_KEY in .env.local (see .env.example and docs/BACKEND_SETUP.md)."
    );
    this.name = "AdminNotConfiguredError";
  }
}

const REQUIRED_ADMIN_ENV = [
  "FIREBASE_ADMIN_PROJECT_ID",
  "FIREBASE_ADMIN_CLIENT_EMAIL",
  "FIREBASE_ADMIN_PRIVATE_KEY",
] as const;

/** Names of Admin env vars that are still empty. */
export const missingAdminEnvVars: string[] = REQUIRED_ADMIN_ENV.filter(
  (name) => !process.env[name]
);

/** True only when all three service-account variables are present. */
export const isFirebaseAdminConfigured = missingAdminEnvVars.length === 0;

let adminApp: App | null = null;

/**
 * Initialises (once) and returns the Admin app, or `null` when credentials
 * are missing. Falls back to an app already created elsewhere (tests, hot
 * reload) instead of calling `initializeApp()` twice, which throws.
 */
export function getAdminApp(): App | null {
  if (!isFirebaseAdminConfigured) return null;
  if (adminApp) return adminApp;

  const existing = getApps();
  if (existing.length > 0) {
    adminApp = existing[0];
    return adminApp;
  }

  // The private key often arrives as a single line with literal "\n"
  // (how console.env files are usually pasted) — normalise it for `cert()`.
  const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").replace(
    /\\n/g,
    "\n"
  );

  // Emulator mode: verify tokens against the local Auth emulator instead of
  // production. Skipped when the host is already configured explicitly.
  if (
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true" &&
    !process.env.FIREBASE_AUTH_EMULATOR_HOST
  ) {
    const host =
      process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST ?? "127.0.0.1";
    process.env.FIREBASE_AUTH_EMULATOR_HOST = `${host}:9099`;
  }

  adminApp = initializeApp({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
  return adminApp;
}

/** Admin Auth — throws `AdminNotConfiguredError` when credentials are missing. */
export function requireAdminAuth(): Auth {
  const app = getAdminApp();
  if (!app) throw new AdminNotConfiguredError();
  return getAuth(app);
}

/** Admin Firestore — throws `AdminNotConfiguredError` when credentials are missing. */
export function requireAdminFirestore(): Firestore {
  const app = getAdminApp();
  if (!app) throw new AdminNotConfiguredError();
  return getFirestore(app);
}

/** Admin Auth, or `null` when not configured (non-throwing variant). */
export function getAdminAuthOrNull(): Auth | null {
  try {
    return getAdminApp() ? requireAdminAuth() : null;
  } catch {
    return null;
  }
}

/**
 * Verifies a Firebase ID token and returns its claims, or `null` when the
 * token is missing/invalid/expired.
 *
 * Use in Route Handlers:
 *
 *   const claims = await verifyBearerToken(request.headers.get("authorization"));
 *   if (!claims) return Response.json({ error: "unauthorized" }, { status: 401 });
 */
export async function verifyBearerToken(
  authorizationHeader: string | null | undefined
): Promise<{ uid: string; email?: string } | null> {
  if (!authorizationHeader) return null;
  const match = /^Bearer\s+(.+)$/i.exec(authorizationHeader.trim());
  if (!match) return null;

  try {
    const decoded = await requireAdminAuth().verifyIdToken(match[1]);
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    // Invalid, expired or revoked — never leak why to the caller.
    return null;
  }
}
