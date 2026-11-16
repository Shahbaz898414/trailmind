"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Cpu,
  Download,
  HardDrive,
  MapPin,
  Mountain,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Sliders,
  Sparkles,
  Sun,
  Users,
  Wifi,
  Zap,
} from "lucide-react";

import { currentUser } from "@/data/user";
import { sampleTripsList } from "@/data/trips";
import { recommendedDestinations } from "@/data/destinations";
import { offlineStorageStatus } from "@/data/offline";

export default function DashboardPage() {
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("Sync Route Artifacts");
  const kyotoTrip = sampleTripsList[0]; // Primary expedition

  const handleSync = () => {
    setSyncing(true);
    setSyncStatus("Synchronizing 14 Artifacts...");
    setTimeout(() => {
      setSyncStatus("All Packs Synced (1.8 GB)");
      setTimeout(() => {
        setSyncing(false);
        setSyncStatus("Sync Route Artifacts");
      }, 2500);
    }, 1500);
  };

  return (
    <div className="w-full min-h-screen bg-surface">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
        {/* Top Greeting Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold">
                Expedition Station Active
              </span>
              <span className="text-xs text-secondary uppercase tracking-widest font-mono">
                • Autonomous Sync
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-primary tracking-tight">
              Good morning, {currentUser.name.split(" ")[0]}
            </h1>
            <p className="text-sm text-on-surface-variant max-w-xl leading-relaxed">
              Where will your next journey take you? Calibrated for uninterrupted navigation, dynamic topography, and offline intelligence.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/settings/hardware"
              className="px-4 py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm border border-border"
            >
              <Sliders className="size-4 text-on-surface-variant" />
              <span>Field Specs</span>
            </Link>
            <Link
              href="/trips/new"
              className="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="size-4" />
              <span>Plan New Route</span>
            </Link>
          </div>
        </div>

        {/* Offline Readiness & Field Telemetry System Card */}
        <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-border flex flex-col lg:flex-row items-stretch gap-6">
          <div className="flex flex-col justify-between flex-1 gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                  <HardDrive className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-base text-on-surface">
                      Field Readiness Hub
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-semibold">
                      Optimal
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Last synchronized 14 mins ago via high-altitude mesh relay
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-mono text-xs uppercase tracking-wide text-on-surface font-semibold">
                  Telemetry Synced
                </span>
              </div>
            </div>

            {/* Telemetry Indicators Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-border/50 flex flex-col gap-1">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="text-xs font-semibold">Cached Packs</span>
                  <Download className="size-3.5 text-secondary" />
                </div>
                <span className="font-heading text-lg font-bold text-primary">3 Trips</span>
                <span className="font-mono text-[11px] text-on-surface-variant">
                  1.8 GB / 12 GB Field SSD
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-border/50 flex flex-col gap-1">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="text-xs font-semibold">Edge AI Core</span>
                  <Cpu className="size-3.5 text-secondary" />
                </div>
                <span className="font-heading text-lg font-bold text-primary">Gemma-2B</span>
                <span className="font-mono text-[11px] text-on-surface-variant">
                  NPU Bench: 42 tok/s
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-border/50 flex flex-col gap-1">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="text-xs font-semibold">Topo Maps</span>
                  <Mountain className="size-3.5 text-secondary" />
                </div>
                <span className="font-heading text-lg font-bold text-primary">1:25k Staged</span>
                <span className="font-mono text-[11px] text-on-surface-variant">
                  DEM Contours Active
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-border/50 flex flex-col gap-1">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="text-xs font-semibold">Satellite Link</span>
                  <Radio className="size-3.5 text-secondary" />
                </div>
                <span className="font-heading text-lg font-bold text-primary">Garmin inReach</span>
                <span className="font-mono text-[11px] text-emerald-700 font-semibold">
                  100% Signal • 1616 MHz
                </span>
              </div>
            </div>
          </div>

          {/* Sync Trigger Side Panel */}
          <div className="lg:w-72 bg-surface-container-low rounded-xl p-4 flex flex-col justify-between gap-3 border border-border">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs uppercase text-secondary font-bold">
                OFF-GRID STAGING
              </span>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Re-hash local cryptographic keys, download updated trail closures, and pre-bake terrain shaders.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-80 cursor-pointer"
            >
              <RefreshCw className={`size-3.5 ${syncing ? "animate-spin" : ""}`} />
              <span>{syncStatus}</span>
            </button>
          </div>
        </div>

        {/* Hero Upcoming Expedition Card (Kyoto Cherry Blossom) */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-primary">Next Expedition</h2>
            <Link
              href="/trips"
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              <span>View All 3 Trips</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="w-full bg-white rounded-2xl border border-border shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            {/* Image Column */}
            <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-[340px] bg-surface-container-high overflow-hidden">
              <Image
                src={kyotoTrip.coverImage}
                alt={kyotoTrip.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-primary font-bold text-xs">
                  {kyotoTrip.country}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 className="size-3" /> Offline Ready
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-xs text-white/80 uppercase font-mono tracking-wider">
                  {kyotoTrip.region} • {kyotoTrip.durationDays} Days
                </p>
                <h3 className="font-heading text-2xl font-bold leading-tight">
                  {kyotoTrip.title}
                </h3>
              </div>
            </div>

            {/* Logistics & Details Column */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant border-b border-border pb-4">
                  <span className="flex items-center gap-1.5 font-semibold text-primary">
                    <Calendar className="size-4 text-secondary" />
                    {kyotoTrip.startDate} → {kyotoTrip.endDate}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="size-4 text-secondary" />
                    {kyotoTrip.travelers} Travelers
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Sun className="size-4 text-amber-600" />
                    Solar Ephemeris Locked
                  </span>
                </div>

                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {kyotoTrip.summary}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-surface-container-low border border-border">
                    <span className="text-[11px] text-on-surface-variant block font-medium">Pack Weight</span>
                    <span className="font-mono font-bold text-sm text-primary">
                      {kyotoTrip.packWeightKg} / {kyotoTrip.maxWeightKg} kg
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-container-low border border-border">
                    <span className="text-[11px] text-on-surface-variant block font-medium">Elevation Delta</span>
                    <span className="font-mono font-bold text-sm text-primary">
                      {kyotoTrip.averageElevation}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-container-low border border-border col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-on-surface-variant block font-medium">Satellite Sync</span>
                    <span className="text-xs font-semibold text-emerald-800">
                      {kyotoTrip.satelliteSyncCadence}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href={`/trips/${kyotoTrip.id}/itinerary`}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold transition-all shadow-sm"
                >
                  <span>Open 12-Day Itinerary</span>
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href={`/trips/${kyotoTrip.id}`}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-5 rounded-lg border border-border hover:bg-surface-container text-on-surface text-xs font-semibold transition-colors"
                >
                  <span>Expedition Master Hub</span>
                </Link>
                <Link
                  href={`/trips/${kyotoTrip.id}/destination`}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-surface-container text-primary text-xs font-semibold hover:bg-surface-container-high transition-colors"
                >
                  <span>Field Dossier</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Adventure Blueprints */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-primary">Recommended Expedition Blueprints</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Curated remote routes with verified DEM offline contour profiles and low-cell contingency models.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedDestinations.slice(0, 3).map((dest) => (
              <div
                key={dest.id}
                className="rounded-2xl bg-white border border-border shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
              >
                <div className="relative h-48 bg-surface-container-high overflow-hidden">
                  <Image
                    src={dest.image}
                    alt={dest.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-primary text-[11px] font-semibold">
                      {dest.badge1}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-semibold">
                      {dest.badge2}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white font-mono text-[11px]">
                    {dest.duration} • {dest.distance}
                  </div>
                </div>

                <div className="p-5 flex flex-col justify-between flex-1 gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-secondary text-xs">
                      <span>{dest.location}</span>
                      <span className="font-mono font-semibold">{dest.elevation}</span>
                    </div>
                    <h3 className="font-heading text-base font-bold text-primary group-hover:text-primary-container transition-colors">
                      {dest.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                      {dest.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <span className="text-[11px] font-mono text-on-surface-variant flex items-center gap-1">
                      <Radio className="size-3 text-secondary" />
                      {dest.connectivityBadge}
                    </span>
                    <Link
                      href="/trips/new"
                      className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-primary hover:text-white text-on-surface text-xs font-semibold transition-colors"
                    >
                      Stage Blueprint
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
