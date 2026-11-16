"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Compass,
  Footprints,
  HardDrive,
  HeartPulse,
  Layers,
  MapPin,
  Mountain,
  Radio,
  Scale,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";

export default function CreateTripPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Destination Parameters
  const [title, setTitle] = useState("Kumano Kodo Ancient Pilgrimage");
  const [destination, setDestination] = useState("Kii Peninsula, Wakayama, Japan");
  const [startDate, setStartDate] = useState("2026-05-10");
  const [endDate, setEndDate] = useState("2026-05-16");
  const [travelers, setTravelers] = useState(2);

  // Step 2: Terrain, Pace & Logistics
  const [terrain, setTerrain] = useState("steep-stone");
  const [pace, setPace] = useState("moderate");
  const [lodging, setLodging] = useState("minshuku");

  // Step 3: Field Gear & Health
  const [packWeight, setPackWeight] = useState(8.5);
  const [maxWeight, setMaxWeight] = useState(12.0);
  const [satelliteSync, setSatelliteSync] = useState(true);
  const [hasAllergies, setHasAllergies] = useState(true);

  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const handleFinish = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      setIsSynthesizing(false);
      router.push("/trips/trip-kyoto-2026/itinerary");
    }, 1200);
  };

  return (
    <div className="w-full min-h-screen bg-surface">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Top Breadcrumb & Metadata Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs">
            <Link href="/trips" className="hover:text-primary transition-colors flex items-center gap-1 font-semibold">
              <Compass className="size-3.5" />
              <span>Trips</span>
            </Link>
            <span>/</span>
            <span className="text-on-surface">Create New Expedition</span>
            <span>/</span>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-bold">
              Step {currentStep} of 3
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-semibold">
              <Radio className="size-3.5" />
              <span>GNSS Staging Active</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-on-surface-variant text-xs font-semibold">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              <span>Air-Gap Solver</span>
            </span>
          </div>
        </div>

        {/* Stepper Navigation */}
        <div className="w-full bg-white rounded-2xl p-4 border border-border shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Step 1 */}
            <div
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                currentStep === 1
                  ? "bg-primary-container text-white"
                  : currentStep > 1
                  ? "bg-secondary-fixed text-primary"
                  : "bg-surface-container-low text-on-surface-variant opacity-60"
              }`}
            >
              <div
                className={`size-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentStep === 1 ? "bg-white text-primary" : "bg-primary text-white"
                }`}
              >
                1
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase tracking-wider font-bold">
                  {currentStep === 1 ? "Active Step" : "Completed"}
                </span>
                <span className="text-sm font-semibold truncate">Scope & Parameters</span>
              </div>
            </div>

            {/* Step 2 */}
            <div
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                currentStep === 2
                  ? "bg-primary-container text-white"
                  : currentStep > 2
                  ? "bg-secondary-fixed text-primary"
                  : "bg-surface-container-low text-on-surface-variant opacity-60"
              }`}
            >
              <div
                className={`size-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentStep === 2
                    ? "bg-white text-primary"
                    : currentStep > 2
                    ? "bg-primary text-white"
                    : "bg-surface-container-high text-on-surface-variant"
                }`}
              >
                2
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase tracking-wider font-bold">
                  {currentStep === 2 ? "Active Step" : currentStep > 2 ? "Completed" : "Next"}
                </span>
                <span className="text-sm font-semibold truncate">Terrain & Logistics</span>
              </div>
            </div>

            {/* Step 3 */}
            <div
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                currentStep === 3
                  ? "bg-primary-container text-white"
                  : "bg-surface-container-low text-on-surface-variant opacity-60"
              }`}
            >
              <div
                className={`size-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentStep === 3
                    ? "bg-white text-primary"
                    : "bg-surface-container-high text-on-surface-variant"
                }`}
              >
                3
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase tracking-wider font-bold">
                  {currentStep === 3 ? "Active Step" : "Final"}
                </span>
                <span className="text-sm font-semibold truncate">Field Gear & Health</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="w-full bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8">
          {/* STEP 1: Scope & Parameters */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              {/* Hero Banner for Destination Staging */}
              <div className="relative h-48 sm:h-56 rounded-xl overflow-hidden">
                <Image
                  src="/images/stitch/create-trip-kumano-kodo-daimon-zaka.jpg"
                  alt="Daimon-zaka Kumano Kodo"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 font-semibold">
                    PRE-STAGED EXPEDITION CORRIDOR
                  </span>
                  <h3 className="font-heading text-xl sm:text-2xl font-bold">
                    Kumano Kodo Daimon-Zaka Ancient Cedar Trail
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Expedition Name</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-surface-container-low px-3.5 py-2.5 rounded-xl border border-border text-xs text-on-surface font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Target Destination / Region</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant" />
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full bg-surface-container-low pl-9 pr-3 py-2.5 rounded-xl border border-border text-xs text-on-surface font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Expedition Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-surface-container-low px-3.5 py-2.5 rounded-xl border border-border text-xs text-on-surface font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Expedition End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-surface-container-low px-3.5 py-2.5 rounded-xl border border-border text-xs text-on-surface font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-on-surface">Number of Field Travelers</label>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setTravelers(num)}
                        className={`size-10 rounded-xl border text-xs font-bold transition-all ${
                          travelers === num
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-surface-container-low text-on-surface border-border hover:bg-surface-container"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                    <span className="text-xs text-on-surface-variant">Travelers in Party</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Terrain, Pace & Logistics */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              <div>
                <h3 className="font-heading text-lg font-bold text-primary">Terrain & Physical Pacing</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  The AI solver uses these constraints to enforce walking buffer times and elevation climb limits.
                </p>
              </div>

              {/* Terrain Difficulty */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                  Primary Trail Surface & Gradient
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "paved", title: "Cobblestone & Town", desc: "Flagstone paths, temple staircases, urban walkways" },
                    { id: "steep-stone", title: "Ancient Forest Stone", desc: "Uneven stone stairs, exposed tree roots, 600m climbs" },
                    { id: "alpine-ridge", title: "Alpine Ridge & Scree", desc: "High mountain ridge, loose scree, via ferrata cables" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTerrain(item.id)}
                      className={`p-4 rounded-xl text-left border transition-all ${
                        terrain === item.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border bg-white hover:bg-surface-container-low"
                      }`}
                    >
                      <h4 className="font-heading font-bold text-xs text-primary mb-1">{item.title}</h4>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Walking Pace */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                  Daily Pacing Strategy
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "contemplative", title: "Contemplative Pace", desc: "4-8 km / day • Photographers & Zen contemplation" },
                    { id: "moderate", title: "Steady Trekking", desc: "10-16 km / day • Balanced trail exploration" },
                    { id: "endurance", title: "Endurance Mountain", desc: "18-25+ km / day • Dawn-to-dusk mountain push" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPace(p.id)}
                      className={`p-3.5 rounded-xl text-left border transition-all ${
                        pace === p.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border bg-white hover:bg-surface-container-low"
                      }`}
                    >
                      <h4 className="font-heading font-bold text-xs text-primary mb-1">{p.title}</h4>
                      <p className="text-[11px] text-on-surface-variant">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lodging Architecture */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                  Accommodation Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "minshuku", title: "Traditional Minshuku & Ryokan", desc: "Tatami mats, kaiseki meals, onsen soaking" },
                    { id: "hut", title: "Mountain Refuge / Hut", desc: "Shared bunks, warm stew, high-pass staging" },
                    { id: "camp", title: "Wilderness Bivouac", desc: "Self-supported tent pitching, water filtration" },
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLodging(l.id)}
                      className={`p-3.5 rounded-xl text-left border transition-all ${
                        lodging === l.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border bg-white hover:bg-surface-container-low"
                      }`}
                    >
                      <h4 className="font-heading font-bold text-xs text-primary mb-1">{l.title}</h4>
                      <p className="text-[11px] text-on-surface-variant">{l.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Field Gear & Health Constraints */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              <div>
                <h3 className="font-heading text-lg font-bold text-primary">Field Gear & Health Directives</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Set equipment weight envelope and link active satellite radio beacons.
                </p>
              </div>

              {/* Pack Weight Gauge */}
              <div className="p-5 rounded-xl bg-surface-container-low border border-border flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                    <Scale className="size-4 text-primary" /> Pack Weight Budget
                  </span>
                  <span className="font-mono text-sm font-bold text-primary">
                    {packWeight} kg / {maxWeight} kg Max
                  </span>
                </div>

                <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${(packWeight / maxWeight) * 100}%` }}
                  />
                </div>

                <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                  <label className="flex items-center gap-2">
                    <span>Target:</span>
                    <input
                      type="number"
                      step="0.5"
                      value={packWeight}
                      onChange={(e) => setPackWeight(Number(e.target.value))}
                      className="w-16 bg-white px-2 py-1 rounded border text-xs font-mono"
                    />
                    <span>kg</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <span>Ceiling:</span>
                    <input
                      type="number"
                      step="0.5"
                      value={maxWeight}
                      onChange={(e) => setMaxWeight(Number(e.target.value))}
                      className="w-16 bg-white px-2 py-1 rounded border text-xs font-mono"
                    />
                    <span>kg</span>
                  </label>
                </div>
              </div>

              {/* Emergency Directives & Telemetry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border bg-white flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="chk-telemetry"
                    checked={satelliteSync}
                    onChange={(e) => setSatelliteSync(e.target.checked)}
                    className="size-4 rounded text-primary mt-1 accent-primary"
                  />
                  <label htmlFor="chk-telemetry" className="text-xs">
                    <strong className="font-semibold text-primary block">
                      Pair Garmin inReach Mini 2 Telemetry
                    </strong>
                    <span className="text-on-surface-variant text-[11px] block mt-0.5">
                      Transmit hourly waypoints via 1616 MHz Iridium network.
                    </span>
                  </label>
                </div>

                <div className="p-4 rounded-xl border border-border bg-white flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="chk-med"
                    checked={hasAllergies}
                    onChange={(e) => setHasAllergies(e.target.checked)}
                    className="size-4 rounded text-primary mt-1 accent-primary"
                  />
                  <label htmlFor="chk-med" className="text-xs">
                    <strong className="font-semibold text-primary block">
                      Sync Medical & Allergy Kanji Cards
                    </strong>
                    <span className="text-on-surface-variant text-[11px] block mt-0.5">
                      Stage peanut allergy and O+ blood type in encrypted offline wallet.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Bottom Action Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-border mt-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors"
              >
                <ArrowLeft className="size-3.5" />
                <span>Previous Step</span>
              </button>
            ) : (
              <Link
                href="/trips"
                className="text-xs text-on-surface-variant hover:text-primary transition-colors font-medium"
              >
                Cancel
              </Link>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="size-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={isSynthesizing}
                className="flex items-center gap-2 px-7 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-lg transition-all cursor-pointer disabled:opacity-80"
              >
                <Sparkles className="size-4 text-emerald-300" />
                <span>{isSynthesizing ? "Synthesizing Route..." : "Compile Expedition Blueprint"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
