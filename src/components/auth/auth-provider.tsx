"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";

import { initializeFirebaseAppCheck } from "@/lib/firebase/app-check";
import { onAuthChange, signOutUser } from "@/lib/firebase/auth";
import { isFirebaseConfigured, missingFirebaseEnvVars } from "@/lib/firebase/config";
import { ensureUserProfile } from "@/services/profile";

/**
 * Application-wide authentication state.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS EXISTS
 * ---------------------------------------------------------------------------
 * Firebase Auth restores the session asynchronously on page load, so every
 * screen needs one answer to "is someone signed in?" without each screen
 * subscribing to the SDK itself. This provider:
 *
 *   1. subscribes to `onAuthStateChanged` exactly once (root layout)
 *   2. initialises App Check once, after mount
 *   3. ensures the Firestore profile document exists for the signed-in user
 *      (idempotent — also repairs accounts created before this code existed)
 *   4. exposes a `status` the route guard (`AuthGuard`) turns into
 *      loading / redirect / rendered states
 *
 * `status` values:
 *   "loading"        — Firebase configured, session not resolved yet
 *   "authenticated"  — a user is signed in (profile may still be ensuring)
 *   "unauthenticated"— resolved, nobody signed in
 *   "unconfigured"   — Firebase web config missing entirely; sign-in is
 *                      impossible, so the guard shows setup instructions
 *                      instead of bouncing to a login form that can't work
 *
 * Security note: this provider is UX only. Real authorization is enforced by
 * Firestore/Storage Security Rules and by Bearer-token checks in Route
 * Handlers — hiding screens is not a security boundary.
 */

export type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "unconfigured";

type AuthContextValue = {
  status: AuthStatus;
  /** The signed-in Firebase user, or `null`. */
  user: User | null;
  /** True once the profile document has been ensured for the current user. */
  isProfileReady: boolean;
  /** Sign out and clear local session state. Never rejects. */
  signOut: () => Promise<void>;
  /** Env var names still missing when status is "unconfigured". */
  missingConfig: string[];
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(
    isFirebaseConfigured ? "loading" : "unconfigured"
  );
  const [user, setUser] = useState<User | null>(null);
  const [isProfileReady, setIsProfileReady] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    // One-time App Check initialisation (no-op without a site key).
    initializeFirebaseAppCheck();

    const unsubscribe = onAuthChange((nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        setStatus("unauthenticated");
        setIsProfileReady(false);
        return;
      }

      setStatus("authenticated");

      // Ensure/repair the profile document — never blocks sign-in on failure
      // (e.g. offline, or Security Rules not deployed yet).
      ensureUserProfile(nextUser)
        .catch((error) => {
          console.warn(
            "[TrailMind] profile could not be ensured (sign-in continues):",
            error
          );
        })
        .finally(() => setIsProfileReady(true));
    });

    return unsubscribe;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await signOutUser();
    } finally {
      // `onAuthChange` normally flips the state; set it here too so the UI
      // reacts even if the listener already tore down.
      setUser(null);
      setIsProfileReady(false);
      setStatus(isFirebaseConfigured ? "unauthenticated" : "unconfigured");
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isProfileReady,
      signOut,
      missingConfig: missingFirebaseEnvVars,
    }),
    [status, user, isProfileReady, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Read auth state from any Client Component under `AuthProvider`.
 *
 * Throws when used outside the provider — that is a wiring bug, not a
 * runtime condition, so failing loudly is correct.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth() must be used inside <AuthProvider>.");
  }
  return context;
}
