import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";

import { getFirebaseAuth } from "./client";

/**
 * Firebase Authentication service — the only place the client Auth SDK is
 * called from application code.
 *
 * Design notes
 * ---------------------------------------------------------------------------
 * - Every function throws `AuthOperationError` whose `message` is safe to
 *   render directly in the UI (see `mapAuthError`); the original SDK error is
 *   kept on `cause` for console debugging only.
 * - `onAuthChange` is the single source of truth for session state; the
 *   `AuthProvider` context subscribes to it so session restoration on refresh
 *   happens in exactly one place.
 * - No credentials are stored or logged anywhere in this module.
 */

/** Error type thrown by every auth operation. Message is UI-safe. */
export class AuthOperationError extends Error {
  readonly code: string;

  constructor(code: string, message: string, cause?: unknown) {
    super(message);
    this.name = "AuthOperationError";
    this.code = code;
    if (cause !== undefined) this.cause = cause;
  }
}

/**
 * Firebase Auth error codes → messages safe to show to users.
 * Unknown codes fall back to a generic message; the raw code is preserved
 * for debugging but never includes internal details.
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "That email address doesn't look valid.",
  "auth/missing-email": "Enter your email address.",
  "auth/invalid-credential":
    "Wrong email or password. Check your details and try again.",
  "auth/wrong-password": "Wrong email or password. Check your details and try again.",
  "auth/user-not-found":
    "No account exists with that email. Try signing up instead.",
  "auth/missing-password": "Enter your password.",
  "auth/weak-password":
    "That password is too weak. Use at least 8 characters.",
  "auth/email-already-in-use":
    "An account with that email already exists. Try signing in instead.",
  "auth/too-many-requests":
    "Too many attempts. Wait a moment and try again.",
  "auth/network-request-failed":
    "Cannot reach the authentication service. Check your connection and try again.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/operation-not-allowed":
    "That sign-in method isn't enabled for this project yet.",
  "auth/popup-closed-by-user": "Sign-in was cancelled before it finished.",
  "auth/popup-blocked":
    "Your browser blocked the sign-in window. Allow popups for this site and retry.",
  "auth/cancelled-popup-request": "Another sign-in window is already open.",
  "auth/unauthorized-domain":
    "This domain isn't authorised for sign-in. Add it in Firebase Console → Authentication → Settings.",
  "auth/invalid-api-key":
    "Firebase is misconfigured. Check your .env.local values.",
  "auth/app-not-authorized":
    "This app isn't authorised for this Firebase project.",
  "auth/requires-recent-login":
    "For security, sign in again before making this change.",
  "auth/too-many-requests-try-later": "Too many attempts. Try again later.",
};

/** Converts any thrown value into an `AuthOperationError` with a UI message. */
export function mapAuthError(error: unknown, fallbackCode = "unknown"): AuthOperationError {
  if (error instanceof AuthOperationError) return error;

  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: string }).code)
      : fallbackCode;

  const message =
    AUTH_ERROR_MESSAGES[code] ??
    "Something went wrong while signing in. Please try again.";

  return new AuthOperationError(code, message, error);
}

function requireAuth(): NonNullable<ReturnType<typeof getFirebaseAuth>> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new AuthOperationError(
      "auth/not-configured",
      "Firebase Auth is not configured. Copy .env.example to .env.local and add your Firebase web app values."
    );
  }
  return auth;
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Email + password validation shared by signup/login/reset forms.
 * Returns an error message, or `null` when valid.
 */
export function validateCredentials(
  email: string,
  password: string,
  { requirePassword = true }: { requirePassword?: boolean } = {}
): string | null {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) return "Enter your email address.";
  // Deliberately pragmatic — Firebase enforces the real rules server-side.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return "That email address doesn't look valid.";
  }
  if (!requirePassword) return null;
  if (!password) return "Enter your password.";
  if (password.length < 8) return "Use at least 8 characters for the password.";
  if (password.length > 128) return "That password is too long (max 128 characters).";
  return null;
}

/* -------------------------------------------------------------------------- */
/* Operations                                                                  */
/* -------------------------------------------------------------------------- */

export type AuthUser = User;

/**
 * Creates an account with email + password and sets the display name.
 *
 * The Firestore profile document is created separately by
 * `ensureUserProfile()` (called from AuthProvider) so that profile creation
 * also repairs accounts that predate the profile service.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const auth = requireAuth();
  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );
    if (displayName.trim()) {
      await updateProfile(credential.user, { displayName: displayName.trim() });
    }
    return credential.user;
  } catch (error) {
    throw mapAuthError(error);
  }
}

/** Signs in with email + password. */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  const auth = requireAuth();
  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );
    return credential.user;
  } catch (error) {
    throw mapAuthError(error);
  }
}

/**
 * Signs in with Google via popup.
 *
 * Requires the Google provider to be enabled in Firebase Console →
 * Authentication → Sign-in method, and the current domain added under
 * Authorized domains.
 */
export async function signInWithGoogle(): Promise<User> {
  const auth = requireAuth();
  try {
    const credential = await signInWithPopup(auth, new GoogleAuthProvider());
    return credential.user;
  } catch (error) {
    throw mapAuthError(error);
  }
}

/**
 * Sends a password-reset email to `email`.
 *
 * Always resolves successfully for unknown addresses — Firebase deliberately
 * does not reveal which emails exist, and this service mirrors that so the
 * UI can show a uniform confirmation.
 */
export async function sendPasswordReset(email: string): Promise<void> {
  const auth = requireAuth();
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error) {
    throw mapAuthError(error);
  }
}

/** Signs out and clears the local session. Never throws for a missing user. */
export async function signOutUser(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth || !auth.currentUser) return;
  try {
    await signOut(auth);
  } catch (error) {
    throw mapAuthError(error);
  }
}

/**
 * Subscribes to session changes. The callback receives `null` once the
 * initial state is known and no user is signed in.
 *
 * Returns the unsubscribe function — always call it on component unmount.
 */
export function onAuthChange(
  callback: (user: User | null) => void
): () => void {
  const auth = requireAuth();
  return onAuthStateChanged(auth, callback, (error) => {
    // Surface session-restore failures instead of hanging in "loading".
    console.error("[TrailMind] auth state restore failed:", error);
    callback(null);
  });
}

/** The signed-in user, or `null`. */
export function getCurrentUser(): User | null {
  return getFirebaseAuth()?.currentUser ?? null;
}

/**
 * Short-lived ID token for authenticating against Route Handlers
 * (`Authorization: Bearer <token>`). Forces a refresh when the token is
 * expired or missing.
 */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const user = getCurrentUser();
  if (!user) return null;
  try {
    return await user.getIdToken(forceRefresh);
  } catch (error) {
    throw mapAuthError(error);
  }
}

/** UID of the signed-in user — throws when nobody is authenticated. */
export function requireUid(): string {
  const user = getCurrentUser();
  if (!user) {
    throw new AuthOperationError(
      "auth/unauthenticated",
      "You need to sign in to do that."
    );
  }
  return user.uid;
}
