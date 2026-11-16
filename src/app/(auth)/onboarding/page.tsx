"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Cloud,
  Compass,
  Cpu,
  Fingerprint,
  HardDrive,
  Key,
  Layers,
  Lock,
  MapPin,
  Mountain,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wifi,
  Zap,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Form selections
  const [travelStyle, setTravelStyle] = useState("wilderness");
  const [pace, setPace] = useState("moderate");
  const [storageAllocation, setStorageAllocation] = useState(12);
  const [pairedHardware, setPairedHardware] = useState<string[]>(["inreach", "lora"]);

  const totalSteps = 5;

  const toggleHardware = (hw: string) => {
    setPairedHardware((prev) =>
      prev.includes(hw) ? prev.filter((x) => x !== hw) : [...prev, hw]
    );
  };

  const handleFinish = () => {
    router.push("/dashboard");
  };

  return (
    <div className="w-full min-h-screen bg-surface flex flex-col justify-between py-6 px-4 sm:px-8">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
        {/* Top Header & Progress Stepper */}
        <header className="w-full flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary-container text-white">
                <Compass className="size-4" />
              </div>
              <span className="font-heading text-lg font-bold text-primary">TrailMind</span>
            </Link>

            <div className="flex items-center gap-2 bg-white border border-border px-3 py-1 rounded-full text-xs font-semibold text-on-surface-variant">
              <Zap className="size-3.5 text-secondary" />
              <span>Step {step + 1} of {totalSteps}</span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-5 gap-2 w-full pt-1">
            {["Welcome", "Architecture", "Directives", "Hardware", "Armed"].map((label, idx) => (
              <div key={label} className="flex flex-col gap-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx <= step ? "bg-primary" : "bg-surface-container-highest"
                  }`}
                />
                <span
                  className={`text-[10px] font-semibold truncate ${
                    idx === step
                      ? "text-primary font-bold"
                      : idx < step
                      ? "text-secondary"
                      : "text-on-surface-variant/50"
                  }`}
                >
                  0{idx + 1}. {label}
                </span>
              </div>
            ))}
          </div>
        </header>

        {/* Step Content Card */}
        <main className="w-full bg-white rounded-2xl border border-border shadow-md p-6 sm:p-10 my-2">
          {/* STEP 0: Welcome to TrailMind */}
          {step === 0 && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed text-primary text-xs font-semibold w-fit">
                <Sparkles className="size-3.5" />
                <span>Autonomous Offline Travel Companion</span>
              </div>

              <div>
                <h1 className="font-heading text-3xl sm:text-4xl font-bold text-primary tracking-tight">
                  Welcome to TrailMind
                </h1>
                <p className="text-sm text-on-surface-variant mt-2 leading-relaxed max-w-2xl">
                  TrailMind is designed from first principles for travelers who venture beyond cellular coverage. Everything you plan, search, or navigate is computed natively on your device.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-surface-container-low border border-border flex flex-col gap-2">
                  <div className="size-8 rounded-lg bg-primary-container text-white flex items-center justify-center">
                    <Cpu className="size-4" />
                  </div>
                  <h3 className="font-heading font-semibold text-sm text-primary">On-Device AI Engine</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Local quantized Gemma-2B neural inference runs in zero-cell zones with zero latency.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-low border border-border flex flex-col gap-2">
                  <div className="size-8 rounded-lg bg-secondary-fixed text-primary flex items-center justify-center">
                    <HardDrive className="size-4" />
                  </div>
                  <h3 className="font-heading font-semibold text-sm text-primary">100% Offline Cache</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    1:25k topo contour maps, offline transit Aztec tickets, and bilingual audio phrasebook.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-low border border-border flex flex-col gap-2">
                  <div className="size-8 rounded-lg bg-tertiary-fixed text-primary flex items-center justify-center">
                    <Radio className="size-4" />
                  </div>
                  <h3 className="font-heading font-semibold text-sm text-primary">Satellite Mesh Links</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Pair Garmin inReach & LoRa relays for air-gapped emergency SOS and telemetry.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Hybrid Architecture */}
          {step === 1 && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed text-primary text-xs font-semibold w-fit">
                <Layers className="size-3.5" />
                <span>System Architecture Briefing</span>
              </div>

              <div>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                  Dual Cloud & Edge Intelligence
                </h2>
                <p className="text-sm text-on-surface-variant mt-2 leading-relaxed max-w-2xl">
                  TrailMind dynamically switches inference models depending on your field connectivity. No network interruptions, ever.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold uppercase text-primary tracking-wider">
                        Edge NPU Mode
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                        Air-Gapped
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-primary">Gemma-2B On-Device</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Runs directly via WebGPU & Apple Neural Engine. Handles day-by-day routing, taxi translations, emergency triage, and spatial waypoints without internet.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-border text-xs text-primary font-mono flex items-center justify-between">
                    <span>Latency: &lt;15ms</span>
                    <span>Privacy: 100% On-Chip</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-secondary/20 bg-secondary/5 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold uppercase text-secondary tracking-wider">
                        Cloud Mode
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                        When Cellular Available
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-primary">Gemini 2.5 Flash Cloud</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Escalates automatically when connected. Pulls live radar precipitation forecasts, Shinkansen delays, and synchronized booking confirmations.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-border text-xs text-secondary font-mono flex items-center justify-between">
                    <span>Live Telemetry</span>
                    <span>Auto Sync to Dexie</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Travel Style Directives */}
          {step === 2 && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed text-primary text-xs font-semibold w-fit">
                <Mountain className="size-3.5" />
                <span>Expedition Directives</span>
              </div>

              <div>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                  Personalize Your Travel Style
                </h2>
                <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                  These directives parameterize the autonomous AI synthesis solver so every generated day aligns with your physical pacing.
                </p>
              </div>

              {/* Travel Style Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                  Primary Style
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "wilderness", title: "Alpine & Wilderness", desc: "Ridge traverses, high mountain huts, 800m+ daily climbs" },
                    { id: "cultural", title: "Heritage & Temples", desc: "Dawn temple circuits, tea houses, artisan quarters, gardens" },
                    { id: "offgrid", title: "Extreme Off-Grid", desc: "Desert bivy, packrafting, zero-cellular solar ephemeris" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTravelStyle(item.id)}
                      className={`p-4 rounded-xl text-left border transition-all ${
                        travelStyle === item.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border bg-white hover:bg-surface-container-low"
                      }`}
                    >
                      <h4 className="font-heading font-bold text-sm text-primary mb-1">{item.title}</h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pacing Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                  Daily Pacing Directive
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "slow", label: "Contemplative (4-6 km/day)" },
                    { id: "moderate", label: "Steady Pacing (10-15 km/day)" },
                    { id: "fast", label: "Expedition Push (20+ km/day)" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPace(p.id)}
                      className={`p-3 rounded-lg text-center border text-xs font-semibold transition-all ${
                        pace === p.id
                          ? "bg-primary-container text-white border-primary"
                          : "bg-surface-container-low text-on-surface border-border hover:bg-surface-container"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Hardware & Storage Permissions */}
          {step === 3 && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed text-primary text-xs font-semibold w-fit">
                <HardDrive className="size-3.5" />
                <span>On-Device Storage Allocation</span>
              </div>

              <div>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                  Hardware & Storage Enclave
                </h2>
                <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                  Allocate local storage quota for DEM topographic maps and enable satellite hardware mesh pairing.
                </p>
              </div>

              {/* Storage Slider */}
              <div className="p-5 rounded-xl bg-surface-container-low border border-border flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-on-surface">Offline Storage Quota</span>
                  <span className="font-mono text-sm font-bold text-primary">{storageAllocation} GB Reserved</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="1"
                  value={storageAllocation}
                  onChange={(e) => setStorageAllocation(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[11px] text-on-surface-variant">
                  <span>5 GB (Minimal)</span>
                  <span>12 GB (Recommended for 1:25k Topo)</span>
                  <span>25 GB (Full Vector Archive)</span>
                </div>
              </div>

              {/* Hardware Pairing Toggles */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                  Available Field Hardware
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: "inreach", label: "Garmin inReach Mini 2 (Iridium)", sub: "Satellite SOS & 1616 MHz Telemetry" },
                    { id: "lora", label: "TrailMind LoRa 915MHz Mesh Node", sub: "Peer-to-peer radio relay up to 15km" },
                  ].map((hw) => {
                    const active = pairedHardware.includes(hw.id);
                    return (
                      <button
                        key={hw.id}
                        type="button"
                        onClick={() => toggleHardware(hw.id)}
                        className={`p-3.5 rounded-xl text-left border flex items-start justify-between transition-all ${
                          active
                            ? "border-primary bg-primary/5"
                            : "border-border bg-white hover:bg-surface-container-low"
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-xs text-primary">{hw.label}</p>
                          <p className="text-[11px] text-on-surface-variant">{hw.sub}</p>
                        </div>
                        <div
                          className={`size-4 rounded-full mt-0.5 border flex items-center justify-center ${
                            active ? "bg-primary border-primary text-white" : "border-border"
                          }`}
                        >
                          {active && <CheckCircle2 className="size-3" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Expedition Vault Armed */}
          {step === 4 && (
            <div className="flex flex-col items-center text-center gap-6 py-6 animate-in fade-in duration-300">
              <div className="size-20 rounded-3xl bg-secondary-fixed text-primary flex items-center justify-center shadow-lg shadow-primary/10">
                <ShieldCheck className="size-10 text-primary" />
              </div>

              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-secondary">
                  ENCLAVE INITIALIZED
                </span>
                <h2 className="font-heading text-3xl font-bold text-primary mt-1 tracking-tight">
                  Expedition Vault Armed
                </h2>
                <p className="text-sm text-on-surface-variant mt-2 max-w-md leading-relaxed">
                  Your cryptographic keys are stored on this device. Gemma-2B quantized weights and Kyoto 12-day demo blueprints are ready.
                </p>
              </div>

              <div className="w-full max-w-md p-4 rounded-xl bg-surface-container-low border border-border flex flex-col gap-2.5 text-xs text-left">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Active Storage:</span>
                  <span className="font-mono font-semibold text-primary">{storageAllocation} GB Allocated</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Primary Directive:</span>
                  <span className="font-semibold text-primary capitalize">{travelStyle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Offline Topo Engine:</span>
                  <span className="font-semibold text-emerald-700">1:25k Raster Ready</span>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between pt-8 border-t border-border mt-4">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors"
              >
                <ArrowLeft className="size-4" />
                <span>Back</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="text-xs text-on-surface-variant hover:text-primary transition-colors"
              >
                Skip to Sign In
              </Link>
            )}

            {step < totalSteps - 1 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="flex items-center gap-2 px-8 py-3 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
              >
                <span>Enter Dashboard</span>
                <ArrowRight className="size-4" />
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
