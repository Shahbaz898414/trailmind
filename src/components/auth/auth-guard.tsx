"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CloudOff, Loader2, Mountain, ShieldAlert } from "lucide-react";

import { useAuth } from "./auth-provider";

/**
 * Route guard for every screen inside `(dashboard)`.
 *
 * ---------------------------------------------------------------------------
 * WHAT IT DOES
 * ---------------------------------------------------------------------------
 *   loading        → full-screen loader (no protected content is rendered
 *                    before the session is known)
 *   unauthenticated→ redirect to `/login?next=<current path>` so the user
 *                    lands back where they were after signing in
 *   unconfigured   → setup instructions instead of a login redirect (a login
 *                    form cannot succeed without Firebase config, and a
 *                    redirect loop would be worse than a clear message)
 *   authenticated  → render the app
 *
 * WHAT IT IS NOT
 * ---------------------------------------------------------------------------
 * This is a UX gate, NOT a security boundary — anyone can edit client state.
 * Real enforcement lives in Firestore/Storage Security Rules and in
 * Bearer-token verification inside Route Handlers.
 *
 * Note: intentionally uses `window.location` (inside `useEffect`) instead of
 * `usePathname()`, so it never suspends during prerendering of dynamic
 * `[id]` routes — the same bailout the Sidebar needed a Suspense boundary
 * for during `next build`.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { status, missingConfig } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status !== "unauthenticated") return;

    const { pathname, search } = window.location;
    // Only allow same-origin paths — never an external URL (open-redirect).
    const next =
      pathname && pathname !== "/" && !pathname.startsWith("//")
        ? `${pathname}${search}`
        : null;

    router.replace(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  }, [status, router]);

  if (status === "unconfigured") {
    return <NotConfiguredNotice missing={missingConfig} />;
  }

  if (status === "loading" || status === "unauthenticated") {
    return <SessionLoading />;
  }

  return <>{children}</>;
}

/** Full-screen state shown while the session resolves (or redirect runs). */
function SessionLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-4"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-container text-white shadow-lg">
        <Mountain className="size-7" />
      </div>
      <div className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant">
        <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
        Restoring your session…
      </div>
      <p className="max-w-sm text-center text-xs text-on-surface-variant/80">
        Checking offline cache and signing you back in.
      </p>
    </div>
  );
}

/**
 * Shown when the Firebase web config is missing entirely — sign-in is
 * impossible, so we state exactly which variables to fill in rather than
 * redirecting to a form that would always fail.
 */
function NotConfiguredNotice({ missing }: { missing: string[] }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-surface px-4 py-12">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container shadow-sm">
        <ShieldAlert className="size-7" />
      </div>
      <div className="max-w-lg text-center">
        <h1 className="font-heading text-2xl font-bold text-primary">
          Backend not configured
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          TrailMind needs Firebase credentials before you can sign in. Nothing
          is mocked — until configuration exists, this screen is the honest
          state of the app.
        </p>
      </div>

      {missing.length > 0 ? (
        <div className="w-full max-w-lg rounded-xl border border-border bg-white p-4 text-left">
          <p className="mb-2 text-xs font-semibold text-on-surface">
            Missing in <code className="font-mono">.env.local</code>:
          </p>
          <ul className="space-y-1">
            {missing.map((name) => (
              <li
                key={name}
                className="rounded bg-surface-container-low px-2.5 py-1.5 font-mono text-xs text-on-surface-variant"
              >
                {name}=
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex max-w-lg items-start gap-2.5 rounded-xl bg-secondary-container/50 p-3.5 text-xs leading-relaxed text-on-secondary-container">
        <CloudOff className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          Copy <code className="font-mono font-semibold">.env.example</code> to{" "}
          <code className="font-mono font-semibold">.env.local</code> and paste
          your Firebase web app values, or enable the local emulators with{" "}
          <code className="font-mono font-semibold">
            NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
          </code>
          . Full steps:{" "}
          <code className="font-mono font-semibold">docs/BACKEND_SETUP.md</code>
          .
        </span>
      </div>
    </div>
  );
}
