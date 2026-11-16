"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
} from "firebase/auth";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Fingerprint,
  HardDrive,
  Key,
  Lock,
  Mail,
  Mountain,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import {
  signInWithEmail,
  signInWithGoogle,
  validateCredentials,
} from "@/lib/firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";

/** Google "G" mark — lucide-react ships no brand icons. */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.63h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.86c2.26-2.09 3.6-5.17 3.6-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.92l-3.86-3c-1.08.73-2.46 1.16-4.08 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.28V6.63H1.29A12 12 0 0 0 0 12c0 1.94.47 3.77 1.29 5.37l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.74c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.63l3.98 3.09C6.22 6.87 8.87 4.74 12 4.74Z"
      />
    </svg>
  );
}

/**
 * Reads the intended post-sign-in destination from `?next=`.
 *
 * Only same-origin paths are accepted — never an external URL (open-redirect).
 * Reads `window` directly (client-only) instead of `useSearchParams()`, so no
 * Suspense boundary is needed during prerendering.
 */
function readSafeNextPath(): string {
  if (typeof window === "undefined") return "/dashboard";
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const { status } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepOffline, setKeepOffline] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Already signed in (session restored, or landed here while authenticated).
  useEffect(() => {
    if (status === "authenticated") router.replace(readSafeNextPath());
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const validationError = validateCredentials(email, password);
    if (validationError) {
      setAuthError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      // Honour the "keep me signed in" control: default Firebase persistence
      // keeps the session across restarts; unchecking limits it to this tab
      // session. (Only ever called while signed out, as on this page.)
      const auth = getFirebaseAuth();
      if (auth) {
        await setPersistence(
          auth,
          keepOffline ? browserLocalPersistence : browserSessionPersistence
        );
      }
      await signInWithEmail(email, password);
      router.replace(readSafeNextPath());
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "Sign-in failed. Please try again."
      );
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
      router.replace(readSafeNextPath());
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "Google sign-in failed. Please try again."
      );
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = () => {
    // Honest state: no WebAuthn/passkey backend is configured in this build,
    // so the button explains itself instead of pretending to succeed.
    setAuthError(
      "Passkeys (FIDO2) aren't configured in this build yet — sign in with your email and password below."
    );
  };

  return (
    <div className="w-full min-h-screen bg-surface">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch min-h-[calc(100vh-5rem)]">
          {/* Left Visual / Expedition Editorial Column (Bento Split) */}
          <div className="lg:col-span-5 relative flex flex-col justify-between overflow-hidden rounded-2xl bg-primary-container text-on-primary p-6 lg:p-10 shadow-xl bg-gradient-to-b from-[#164b3b] via-[#0f3429] to-[#003426]">
            {/* Top Content: Badge & Hardware State */}
            <div className="relative z-10 flex flex-col items-start gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-primary-fixed">
                <span className="inline-block size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-widest text-emerald-200">
                  SYSTEM PROTOCOL 4.2
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex size-9 items-center justify-center rounded-xl bg-tertiary-fixed text-primary">
                  <Mountain className="size-5" />
                </div>
                <span className="font-heading text-2xl font-bold tracking-tight text-white">
                  TrailMind
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-tertiary-container/80 text-amber-200 font-semibold uppercase tracking-wider ml-1">
                  OS
                </span>
              </div>
            </div>

            {/* Center Editorial Quotation */}
            <div className="relative z-10 my-auto py-8">
              <p className="font-mono text-xs uppercase tracking-widest text-primary-fixed mb-2 font-semibold">
                Expedition Manifesto
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl text-white font-bold leading-tight tracking-tight">
                “Explore boldly, even off the grid.”
              </h2>
              <p className="text-sm text-emerald-100/90 mt-3 max-w-sm leading-relaxed">
                Autonomous route synthesis, local topographic models, and cryptographic trip telemetry compiled natively on your device.
              </p>

              {/* Elevation Sparkline Data Visual */}
              <div className="mt-6 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                <div className="flex items-center justify-between text-emerald-100 text-xs mb-2">
                  <span className="flex items-center gap-1 font-semibold uppercase tracking-wider">
                    <TrendingUp className="size-3.5 text-emerald-300" /> Ridge Profile Delta
                  </span>
                  <span className="font-mono font-semibold text-emerald-300">+1,842m • 0ms Latency</span>
                </div>
                <svg className="w-full h-12 text-emerald-300" fill="none" preserveAspectRatio="none" viewBox="0 0 300 48">
                  <path d="M0 44 L35 38 L70 41 L110 24 L145 31 L185 14 L220 22 L260 5 L285 18 L300 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                  <path d="M0 44 L35 38 L70 41 L110 24 L145 31 L185 14 L220 22 L260 5 L285 18 L300 12 L300 48 L0 48 Z" fill="currentColor" fillOpacity="0.15" />
                </svg>
              </div>
            </div>

            {/* Bottom Specifications Pill Strip */}
            <div className="relative z-10 pt-4">
              <div className="grid grid-cols-2 gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <div className="flex items-center gap-2.5">
                  <HardDrive className="size-4 text-emerald-300" />
                  <div className="flex flex-col">
                    <span className="text-xs text-white font-bold tracking-tight">100% OFFLINE</span>
                    <span className="text-[11px] text-emerald-200/80">Trip Knowledge Cached</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="size-4 text-amber-300" />
                  <div className="flex flex-col">
                    <span className="text-xs text-white font-bold tracking-tight">ZERO TELEMETRY</span>
                    <span className="text-[11px] text-emerald-200/80">Edge Hardware Cryptography</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7 flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-4">
            <div className="max-w-md w-full mx-auto flex flex-col">
              {/* Header Titles */}
              <div className="flex flex-col gap-1 mb-6">
                <span className="font-mono text-xs uppercase tracking-wider text-secondary font-bold">
                  AUTHENTICATION GATEWAY
                </span>
                <h1 className="font-heading text-3xl font-bold text-primary tracking-tight">
                  Welcome Back, Explorer
                </h1>
                <p className="text-sm text-on-surface-variant mt-1">
                  Sign in to access your offline trips, cryptographic field credentials, and on-device AI models.
                </p>
              </div>

              {/* Passkey / Hardware Key Fast-Track */}
              <button
                type="button"
                onClick={handleBiometricAuth}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/60 text-primary font-semibold text-sm transition-all shadow-sm group"
              >
                <Fingerprint className="size-5 text-primary group-hover:scale-110 transition-transform" />
                <span>Unlock with Biometric Passkey</span>
                <span className="ml-auto font-mono text-[11px] bg-surface-container-highest px-2 py-0.5 rounded text-on-surface-variant">
                  FIDO2
                </span>
              </button>

              {/* Google sign-in — requires the Google provider to be enabled
                  in Firebase Console → Authentication → Sign-in method. */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="mt-3 w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-surface-container-low border border-outline-variant/60 text-on-surface font-semibold text-sm transition-all shadow-sm group cursor-pointer disabled:opacity-75"
              >
                <GoogleIcon className="size-4" />
                <span>Continue with Google</span>
              </button>

              <div className="relative my-6 flex items-center">
                <div className="flex-grow border-t border-border" />
                <span className="flex-shrink mx-4 text-xs uppercase tracking-wider text-on-surface-variant/70 font-semibold font-mono">
                  Or Master Passphrase
                </span>
                <div className="flex-grow border-t border-border" />
              </div>

              {/* Standard Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Email Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface" htmlFor="email">
                    Field Dispatch Email / Vault ID
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 size-4 text-on-surface-variant pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full bg-white text-on-surface text-sm pl-10 pr-4 py-3 rounded-lg border border-border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-on-surface" htmlFor="password">
                      Master Passphrase
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-primary hover:text-primary-container font-semibold transition-colors underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative flex items-center">
                    <Key className="absolute left-3.5 size-4 text-on-surface-variant pointer-events-none" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter vault passphrase"
                      className="w-full bg-white text-on-surface text-sm pl-10 pr-11 py-3 rounded-lg border border-border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <button
                      type="button"
                      aria-label="Toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-on-surface-variant hover:text-primary p-1 transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* Checkbox: Offline Persistence */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-low transition-colors hover:bg-surface-container">
                  <input
                    id="keepOffline"
                    type="checkbox"
                    checked={keepOffline}
                    onChange={(e) => setKeepOffline(e.target.checked)}
                    className="mt-1 size-4 rounded text-primary-container accent-primary-container cursor-pointer"
                  />
                  <label htmlFor="keepOffline" className="text-xs text-on-surface-variant cursor-pointer select-none leading-relaxed">
                    <strong className="font-semibold text-on-surface block sm:inline mr-1">
                      Keep me signed in for offline trips
                    </strong>
                    <span className="block text-on-surface-variant/80">
                      Caches encryption key locally in on-chip secure storage
                    </span>
                  </label>
                </div>

                {/* Authentication error — role=alert for screen readers */}
                {authError ? (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-lg border border-border bg-secondary-container/60 p-3 text-xs font-semibold leading-relaxed text-on-secondary-container"
                  >
                    <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>{authError}</span>
                  </div>
                ) : null}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg bg-primary hover:bg-primary-container text-white font-semibold text-sm tracking-wide shadow-md hover:shadow-lg transition-all active:scale-[0.99] group cursor-pointer disabled:opacity-75"
                >
                  <span>{isLoading ? "Unlocking Vault..." : "Sign In to TrailMind"}</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </button>
              </form>

              {/* Offline Security Notice Capsule */}
              <div className="mt-4 p-3 rounded-lg bg-secondary-container/50 flex items-center gap-3">
                <div className="size-7 rounded-full bg-secondary-container flex items-center justify-center shrink-0 text-on-secondary-container">
                  <Zap className="size-3.5" />
                </div>
                <p className="text-xs font-semibold text-on-secondary-container leading-tight">
                  On-device biometric login & local session caching enabled
                </p>
              </div>

              {/* Registration Link */}
              <div className="mt-6 text-center text-xs text-on-surface-variant">
                Don’t have an account?
                <Link
                  href="/signup"
                  className="font-bold text-primary hover:text-primary-container ml-1.5 transition-colors underline-offset-4 hover:underline"
                >
                  Sign up for free
                </Link>
              </div>

              {/* Cryptographic Footnote */}
              <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-y-2 text-center text-on-surface-variant/75 text-[11px]">
                <span className="flex items-center gap-1.5 mx-auto sm:mx-0">
                  <ShieldCheck className="size-3.5 text-secondary" />
                  Protected by Edge Cryptographic Enclave
                </span>
                <div className="flex items-center gap-3 mx-auto sm:mx-0">
                  <span className="hover:text-primary cursor-pointer">Terms</span>
                  <span>•</span>
                  <span className="hover:text-primary cursor-pointer">Privacy</span>
                  <span>•</span>
                  <span className="hover:text-primary cursor-pointer">Offline Spec</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
