"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Compass,
  Download,
  Info,
  MapPin,
  Mountain,
  ShieldCheck,
  Sun,
  VolumeX,
  Wind,
} from "lucide-react";

import { sampleTripsList } from "@/data/trips";

export default function DestinationDeepDivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const trip =
    sampleTripsList.find((t) => t.id === resolvedParams.id) || sampleTripsList[0];

  return (
    <div className="w-full min-h-screen bg-surface">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
        {/* Topographic Dossier Header */}
        <section className="relative w-full overflow-hidden bg-primary-container text-white rounded-2xl shadow-xl p-6 sm:p-10 bg-gradient-to-br from-[#164b3b] via-[#0f3429] to-[#003426]">
          <div className="relative z-10 flex flex-col gap-6">
            {/* Breadcrumb Bar */}
            <nav className="flex items-center gap-2 text-xs text-primary-fixed tracking-wider uppercase font-mono">
              <Link href="/trips" className="hover:text-white transition-colors">
                Trips
              </Link>
              <span>/</span>
              <Link href={`/trips/${trip.id}`} className="hover:text-white transition-colors">
                {trip.region}
              </Link>
              <span>/</span>
              <span className="text-white font-bold">Field Dossier #JP-KYO-04</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-3xl flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold uppercase tracking-wider font-mono">
                    Field Dossier #JP-KYO-04
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-200 text-xs backdrop-blur-md">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                    Synchronized 4m ago
                  </span>
                </div>

                <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-white mt-1">
                  Kyoto & Higashiyama Backcountry
                </h1>
                <p className="text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
                  A cultural and topographic analysis of the historic basin, sub-alpine cedar ridge trails, and preserved geisha quarters.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/downloads"
                  className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
                >
                  <Download className="size-4" />
                  <span>Download 612 MB Pack</span>
                </Link>
                <Link
                  href={`/trips/${trip.id}/itinerary`}
                  className="px-5 py-2.5 rounded-xl bg-secondary-fixed text-primary text-xs font-bold transition-all hover:bg-white flex items-center gap-2"
                >
                  <span>12-Day Route</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            {/* Tactical Coordinates Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/15 text-xs text-emerald-100 font-mono">
              <div>
                <span className="text-[10px] uppercase text-emerald-200/60 block">Center Coordinates</span>
                <span className="font-bold text-white">35.0116° N, 135.7681° E</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-emerald-200/60 block">Elevation Envelope</span>
                <span className="font-bold text-white">42m – 848m (Mt. Hiei)</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-emerald-200/60 block">DEM Contours</span>
                <span className="font-bold text-emerald-300">10m Interval Active</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-emerald-200/60 block">Solar Daylight</span>
                <span className="font-bold text-amber-300">12h 34m Window</span>
              </div>
            </div>
          </div>
        </section>

        {/* District Breakdown & Etiquette Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Column: District Dossiers */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <h2 className="font-heading text-xl font-bold text-primary">Topographic & District Dossiers</h2>

            <div className="flex flex-col gap-4">
              {/* Higashiyama Ridge */}
              <div className="p-6 rounded-2xl bg-white border border-border shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-secondary uppercase">Sector 01</span>
                  <span className="px-2 py-0.5 rounded bg-surface-container text-xs font-mono font-semibold">
                    Elev: 185m
                  </span>
                </div>
                <h3 className="font-heading font-bold text-lg text-primary">
                  Higashiyama Ridge & Sannen-zaka
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Steep flagstone pedestrian alleys dating to the Muromachi period. Home to Kiyomizu-dera cantilevered stage, Yasaka Pagoda, and silent dawn passages. Heavy foot traffic begins precisely at 08:30; early sunrise departures provide uninterrupted photographic windows.
                </p>
                <div className="p-3 rounded-lg bg-surface-container-low text-xs flex items-center gap-2 text-on-surface-variant">
                  <Info className="size-4 text-primary shrink-0" />
                  <span>Shoe removal protocol strictly enforced inside temple cloisters. Carry slip-on footwear.</span>
                </div>
              </div>

              {/* Arashiyama Basin */}
              <div className="p-6 rounded-2xl bg-white border border-border shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-secondary uppercase">Sector 02</span>
                  <span className="px-2 py-0.5 rounded bg-surface-container text-xs font-mono font-semibold">
                    Elev: 70m – 110m
                  </span>
                </div>
                <h3 className="font-heading font-bold text-lg text-primary">
                  Arashiyama Sagano Bamboo Corridor & Hozu Canyon
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Western mountain gateway featuring 30m vertical moso bamboo stalks, Tenryu-ji pond garden, and Okochi Sanso estate. Microclimate creates dense morning river fog over Togetsukyo Bridge between 06:00 and 07:15.
                </p>
              </div>

              {/* Northern Kurama */}
              <div className="p-6 rounded-2xl bg-white border border-border shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-secondary uppercase">Sector 03</span>
                  <span className="px-2 py-0.5 rounded bg-surface-container text-xs font-mono font-semibold">
                    Elev: 240m – 570m
                  </span>
                </div>
                <h3 className="font-heading font-bold text-lg text-primary">
                  Kurama to Kibune Mountain Pass Traverse
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Deep cedar forest ridge trail crossing ancient cedar roots (kinone-michi). Zero cellular signal along the 4km ridge between Mountain Spirit shrines. Water springs available at Kurama-dera precinct.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Etiquette & Solar Directives */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Cultural Field Etiquette */}
            <div className="p-6 rounded-2xl bg-white border border-border shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 text-primary font-bold text-base">
                <BookOpen className="size-5" />
                <span>Field Etiquette Directives</span>
              </div>

              <div className="space-y-3 text-xs text-on-surface-variant">
                <div className="flex items-start gap-2.5">
                  <VolumeX className="size-4 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-primary block font-semibold">Temple Silence Protocol</strong>
                    <span>Refrain from loud conversations or speaker audio within sacred courtyards.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Camera className="size-4 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-primary block font-semibold">Geisha & Maiko Photography</strong>
                    <span>Strictly no photography in private Gion residential alleys without explicit consent.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-primary block font-semibold">Pack It In, Pack It Out</strong>
                    <span>Kyoto has virtually no public street trash cans. Carry a sealable waste bag.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Solar Timing Card */}
            <div className="p-6 rounded-2xl bg-surface-container-low border border-border flex flex-col gap-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <Sun className="size-4" />
                <span>Solar Ephemeris Calculator</span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">First Dawn Light:</span>
                  <span className="font-bold text-primary">05:22 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Sunrise Horizon:</span>
                  <span className="font-bold text-primary">05:42 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Optimal Golden Hour:</span>
                  <span className="font-bold text-amber-700">06:05 – 06:45 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Sunset Horizon:</span>
                  <span className="font-bold text-primary">18:24 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
