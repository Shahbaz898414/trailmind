"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  Cpu,
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
  User,
  Zap,
} from "lucide-react";

import { signUpWithEmail, validateCredentials } from "@/lib/firebase/auth";
import { ensureUserProfile } from "@/services/profile";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [travelStyle, setTravelStyle] = useState("adventure");
  const [initializeVault, setInitializeVault] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const validationError = validateCredentials(email, password);
    if (validationError) {
      setAuthError(validationError);
      return;
    }
    if (!fullName.trim()) {
      setAuthError("Enter your name.");
      return;
    }

    setIsLoading(true);
    try {
      const user = await signUpWithEmail(email, password, fullName);

      // Create the Firestore profile now (with the chosen travel style).
      // Idempotent: AuthProvider also ensures the profile on auth change, and
      // both writes merge safely. A failure here is not fatal — the provider
      // retries on every auth-state change — so sign-up still succeeds.
      try {
        await ensureUserProfile(user, { travelStyle });
      } catch (error) {
        console.warn(
          "[TrailMind] profile creation deferred to AuthProvider:",
          error
        );
      }

      router.push("/onboarding");
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "Sign-up failed. Please try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-surface">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch min-h-[calc(100vh-5rem)]">
          {/* Left Hero Showcase: Adventure & Architecture */}
          <section className="lg:col-span-5 hidden lg:flex flex-col justify-between relative rounded-2xl overflow-hidden shadow-xl bg-primary text-white p-6 lg:p-10 bg-gradient-to-b from-[#164b3b] via-[#0f3429] to-[#003426]">
            {/* Top Header Pill & Telemetry */}
            <div className="relative z-20 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold">
                <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="uppercase tracking-wider text-emerald-200">Expedition Engine v3.4</span>
              </div>
              <span className="font-mono text-xs text-emerald-300 tracking-wider uppercase">
                Grid: 35.0116° N, 135.7681° E
              </span>
            </div>

            {/* Center Architecture Blueprint Feature Card */}
            <div className="relative z-20 my-auto py-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-400/20 text-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
                    <Zap className="size-3.5 text-emerald-300" />
                    <span>Hybrid Intelligence Active</span>
                  </div>
                  <span className="font-mono text-[11px] text-emerald-300 font-semibold tracking-wider">
                    SECURE ON-CHIP
                  </span>
                </div>

                <h3 className="font-heading text-xl text-white font-bold mb-2">
                  Hybrid Travel Intelligence
                </h3>
                <p className="text-xs text-emerald-100/80 leading-relaxed mb-4">
                  Gemma-2B on-device neural parser for zero-cell zones + automated Cloud Gemini escalation when cell towers handshake.
                </p>

                {/* Topology Network Diagram */}
                <div className="grid grid-cols-2 gap-3 bg-black/20 p-3 rounded-xl border border-white/10">
                  <div className="flex flex-col gap-1 p-2 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-1.5 text-emerald-300">
                      <Cpu className="size-3.5" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Local Edge</span>
                    </div>
                    <span className="text-xs font-semibold text-white">0 ms Response</span>
                    <span className="text-[10px] text-emerald-200/70">Topo maps, emergency SOS, kit logs</span>
                  </div>
                  <div className="flex flex-col gap-1 p-2 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-1.5 text-amber-300">
                      <Cloud className="size-3.5" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Cloud Gemini</span>
                    </div>
                    <span className="text-xs font-semibold text-white">Auto-Sync</span>
                    <span className="text-[10px] text-emerald-200/70">Dynamic weather, park permits</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Specifications */}
            <div className="relative z-20 flex items-center justify-between text-xs text-emerald-200/80 pt-4 border-t border-white/10">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-emerald-400" />
                Zero-Knowledge Local Store
              </span>
              <span className="font-mono">AES-256-GCM</span>
            </div>
          </section>

          {/* Right Form Column */}
          <div className="lg:col-span-7 flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-4">
            <div className="max-w-md w-full mx-auto flex flex-col">
              <div className="flex flex-col gap-1 mb-6">
                <span className="font-mono text-xs uppercase tracking-wider text-secondary font-bold">
                  EXPEDITION VAULT INITIALIZATION
                </span>
                <h1 className="font-heading text-3xl font-bold text-primary tracking-tight">
                  Join TrailMind
                </h1>
                <p className="text-sm text-on-surface-variant mt-1">
                  Create your local cryptographic vault. Your routes, medical flags, and offline packs stay securely on this device.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface" htmlFor="name">
                    Explorer Full Name
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 size-4 text-on-surface-variant pointer-events-none" />
                    <input
                      id="name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alex Morgan"
                      className="w-full bg-white text-on-surface text-sm pl-10 pr-4 py-3 rounded-lg border border-border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface" htmlFor="signup-email">
                    Field Dispatch Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 size-4 text-on-surface-variant pointer-events-none" />
                    <input
                      id="signup-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full bg-white text-on-surface text-sm pl-10 pr-4 py-3 rounded-lg border border-border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Master Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface" htmlFor="signup-password">
                    Vault Master Passphrase
                  </label>
                  <div className="relative flex items-center">
                    <Key className="absolute left-3.5 size-4 text-on-surface-variant pointer-events-none" />
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create secure passphrase"
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

                {/* Travel Style Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">
                    Primary Travel Style Directive
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "adventure", label: "Adventure", icon: Mountain },
                      { id: "cultural", label: "Cultural", icon: User },
                      { id: "offgrid", label: "Off-Grid", icon: HardDrive },
                    ].map((style) => {
                      const Icon = style.icon;
                      const active = travelStyle === style.id;
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setTravelStyle(style.id)}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                            active
                              ? "bg-primary-container text-white border-primary shadow-sm"
                              : "bg-surface-container-low text-on-surface border-border hover:bg-surface-container"
                          }`}
                        >
                          <Icon className={`size-4 mb-1 ${active ? "text-white" : "text-primary"}`} />
                          <span>{style.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Local Vault Checkbox */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-low">
                  <input
                    id="initVault"
                    type="checkbox"
                    checked={initializeVault}
                    onChange={(e) => setInitializeVault(e.target.checked)}
                    className="mt-1 size-4 rounded text-primary-container accent-primary-container cursor-pointer"
                  />
                  <label htmlFor="initVault" className="text-xs text-on-surface-variant cursor-pointer select-none leading-relaxed">
                    <strong className="font-semibold text-on-surface block sm:inline mr-1">
                      Initialize On-Chip Cryptographic Enclave
                    </strong>
                    <span className="block text-on-surface-variant/80">
                      Creates local IndexedDB tables with zero cloud telemetry requirements
                    </span>
                  </label>
                </div>

                {/* Sign-up error — role=alert for screen readers */}
                {authError ? (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-lg border border-border bg-secondary-container/60 p-3 text-xs font-semibold leading-relaxed text-on-secondary-container"
                  >
                    <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>{authError}</span>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg bg-primary hover:bg-primary-container text-white font-semibold text-sm tracking-wide shadow-md hover:shadow-lg transition-all active:scale-[0.99] group cursor-pointer disabled:opacity-75"
                >
                  <span>{isLoading ? "Creating Vault..." : "Initialize Vault & Begin"}</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-on-surface-variant">
                Already have an initialized vault?
                <Link
                  href="/login"
                  className="font-bold text-primary hover:text-primary-container ml-1.5 transition-colors underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
