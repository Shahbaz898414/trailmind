"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Cpu,
  Download,
  HardDrive,
  MapPin,
  Mountain,
  Plus,
  Radio,
  RefreshCw,
  Sliders,
  Sun,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useAsyncResource } from "@/hooks/use-async-resource";
import { isOnDeviceApiPresent } from "@/lib/ai/device-model";
import {
  flushSyncQueue,
  subscribeSyncState,
  type SyncEngineState,
} from "@/lib/offline/sync-engine";
import {
  formatBytes,
  getStorageEstimate,
  type StorageEstimateInfo,
} from "@/lib/offline/storage-manager";
import { listTrips, type TripRecord } from "@/services/trips";
import { recommendedDestinations } from "@/data/destinations";

const IDLE_SYNC: SyncEngineState = { status: "idle", pending: 0, conflicts: 0 };

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const online = useOnlineStatus();

  // Real trips for the signed-in user (mirrored locally when offline).
  const tripsKey = uid ? `trips:${uid}` : null;
  const {
    data: tripsData,
    error,
    loading,
  } = useAsyncResource<TripRecord[]>(tripsKey, async () => {
    if (!uid) return [];
    const page = await listTrips(uid, { pageSize: 20 });
    return page.items;
  });
  const trips = tripsData ?? [];

  const [storage, setStorage] = useState<StorageEstimateInfo | null>(null);
  const [sync, setSync] = useState<SyncEngineState>(IDLE_SYNC);
  const [syncing, setSyncing] = useState(false);
  const [syncLabel, setSyncLabel] = useState("Sync Now");
  const [greeting] = useState(() => greetingForHour(new Date().getHours()));

  // Live sync-engine state + one-off browser storage estimate.
  useEffect(() => subscribeSyncState(setSync), []);
  useEffect(() => {
    let cancelled = false;
    getStorageEstimate().then((estimate) => {
      if (!cancelled) setStorage(estimate);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Real flush — no simulated progress, the button reports the actual result.
  const handleSync = async () => {
    if (!uid || syncing) return;
    setSyncing(true);
    setSyncLabel("Syncing…");
    try {
      const result = await flushSyncQueue(uid);
      if (result.status === "unconfigured") {
        setSyncLabel("Backend not configured");
      } else if (result.status === "offline") {
        setSyncLabel("Offline — syncs on reconnect");
      } else if (result.status === "already-running") {
        setSyncLabel("Sync already running");
      } else if (
        result.applied === 0 &&
        result.conflicts === 0 &&
        result.permanent === 0
      ) {
        setSyncLabel("Nothing queued — all synced");
      } else {
        const parts = [`Applied ${result.applied}`];
        if (result.conflicts > 0) parts.push(`${result.conflicts} conflict(s)`);
        if (result.permanent > 0) parts.push(`${result.permanent} failed`);
        setSyncLabel(parts.join(" • "));
      }
    } catch {
      setSyncLabel("Sync failed — will retry");
    } finally {
      window.setTimeout(() => {
        setSyncing(false);
        setSyncLabel("Sync Now");
      }, 3000);
    }
  };

  const firstName =
    user?.displayName?.trim().split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "traveler";

  // Nearest active trip first, then any trip by start date.
  const nextTrip =
    trips
      .filter((t) => t.status === "upcoming" || t.status === "in-progress")
      .sort((a, b) => a.startDate.localeCompare(b.startDate))[0] ??
    trips[0] ??
    null;

  const offlineReadyCount = trips.filter((t) => t.offlineReady).length;
  const pending = sync.status === "idle" ? sync.pending : 0;
  const conflicts = sync.status === "idle" ? sync.conflicts : 0;
  const onDeviceAi = isOnDeviceApiPresent();

  const readinessBadge =
    conflicts > 0
      ? { label: "Conflicts", className: "bg-error/10 text-error" }
      : pending > 0
        ? { label: "Sync pending", className: "bg-amber-100 text-amber-800" }
        : online
          ? { label: "Optimal", className: "bg-secondary-container text-on-secondary-container" }
          : { label: "Offline", className: "bg-surface-container-highest text-on-surface-variant" };

  const readinessDetail = !online
    ? pending > 0
      ? `${pending} change${pending === 1 ? "" : "s"} queued locally — will sync on reconnect`
      : "No network — showing data saved on this device"
    : sync.status === "syncing"
      ? `Flushing local queue (${sync.processed}/${sync.total})…`
      : conflicts > 0
        ? `${conflicts} change${conflicts === 1 ? "" : "s"} need review on the Trips screen`
        : pending > 0
          ? `${pending} change${pending === 1 ? "" : "s"} waiting to sync`
          : "Everything on this device is synced with the server";

  const heroImage = nextTrip
    ? nextTrip.coverImage || nextTrip.heroImage || null
    : null;

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
                • {online ? "Autonomous Sync" : "Offline Mode"}
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-primary tracking-tight">
              {greeting}, {firstName}
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
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${readinessBadge.className}`}
                    >
                      {readinessBadge.label}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    {readinessDetail}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`size-2 rounded-full ${
                    online && pending === 0 && conflicts === 0
                      ? "bg-emerald-500 animate-ping"
                      : online
                        ? "bg-amber-500"
                        : "bg-error"
                  }`}
                />
                <span className="font-mono text-xs uppercase tracking-wide text-on-surface font-semibold">
                  {!online
                    ? "Offline"
                    : sync.status === "syncing"
                      ? "Syncing"
                      : pending > 0 || conflicts > 0
                        ? "Pending"
                        : "Synced"}
                </span>
              </div>
            </div>

            {/* Telemetry Indicators Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-border/50 flex flex-col gap-1">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="text-xs font-semibold">Stored Trips</span>
                  <Download className="size-3.5 text-secondary" />
                </div>
                <span className="font-heading text-lg font-bold text-primary">
                  {loading ? "…" : `${trips.length} Trip${trips.length === 1 ? "" : "s"}`}
                </span>
                <span className="font-mono text-[11px] text-on-surface-variant">
                  {storage
                    ? `${formatBytes(storage.usageBytes)} used on device`
                    : "Storage estimate unavailable"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-border/50 flex flex-col gap-1">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="text-xs font-semibold">On-Device AI</span>
                  <Cpu className="size-3.5 text-secondary" />
                </div>
                <span className="font-heading text-lg font-bold text-primary">
                  {onDeviceAi ? "Available" : "Not Available"}
                </span>
                <span className="font-mono text-[11px] text-on-surface-variant">
                  {onDeviceAi
                    ? "Runs locally in this browser"
                    : "Browser lacks the LanguageModel API"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-border/50 flex flex-col gap-1">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="text-xs font-semibold">Offline Ready</span>
                  <Mountain className="size-3.5 text-secondary" />
                </div>
                <span className="font-heading text-lg font-bold text-primary">
                  {loading ? "…" : `${offlineReadyCount} Ready`}
                </span>
                <span className="font-mono text-[11px] text-on-surface-variant">
                  Trips marked downloaded
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-border/50 flex flex-col gap-1">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="text-xs font-semibold">Connectivity</span>
                  <Radio className="size-3.5 text-secondary" />
                </div>
                <span className="font-heading text-lg font-bold text-primary">
                  {online ? "Online" : "Offline"}
                </span>
                <span
                  className={`font-mono text-[11px] font-semibold ${
                    online ? "text-emerald-700" : "text-error"
                  }`}
                >
                  {online
                    ? "Syncing enabled • ID token ready"
                    : "Changes queue on this device"}
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
                Push every locally-queued change to the server now. Conflict-flagged
                edits are kept for your review, never applied silently.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleSync()}
              disabled={syncing || !uid}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-80 cursor-pointer"
            >
              <RefreshCw className={`size-3.5 ${syncing ? "animate-spin" : ""}`} />
              <span>{syncLabel}</span>
            </button>
          </div>
        </div>

        {/* Hero Upcoming Expedition Card */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-primary">Next Expedition</h2>
            <Link
              href="/trips"
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              <span>
                {trips.length > 0
                  ? `View All ${trips.length} Trip${trips.length === 1 ? "" : "s"}`
                  : "View Trips"}
              </span>
              <ArrowRight className="size-3" />
            </Link>
          </div>

          {loading ? (
            <div className="w-full bg-white rounded-2xl border border-border shadow-md p-10 text-center text-sm text-on-surface-variant">
              Loading your trips…
            </div>
          ) : error ? (
            <div className="w-full bg-white rounded-2xl border border-border shadow-md p-10 text-center">
              <p className="text-sm text-error">{error}</p>
              <Link
                href="/trips"
                className="mt-3 inline-block text-xs text-primary font-semibold hover:underline"
              >
                Open Trips
              </Link>
            </div>
          ) : !nextTrip ? (
            <div className="w-full bg-white rounded-2xl border border-border shadow-md p-10 text-center flex flex-col items-center gap-3">
              <MapPin className="size-8 text-secondary" />
              <div>
                <h3 className="font-heading text-lg font-bold text-primary">
                  No expeditions yet
                </h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  Plan your first route and it will appear here with its itinerary.
                </p>
              </div>
              <Link
                href="/trips/new"
                className="flex items-center gap-2 py-2.5 px-5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold transition-all shadow-sm"
              >
                <Plus className="size-4" />
                <span>Plan New Route</span>
              </Link>
            </div>
          ) : (
            <div className="w-full bg-white rounded-2xl border border-border shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              {/* Image Column */}
              <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-[340px] bg-surface-container-high overflow-hidden">
                {heroImage ? (
                  <Image
                    src={heroImage}
                    alt={nextTrip.title}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-container to-surface-container-high">
                    <MapPin className="size-12 text-primary/60" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-primary font-bold text-xs">
                    {nextTrip.country || nextTrip.destination}
                  </span>
                  {nextTrip.offlineReady ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Offline Ready
                    </span>
                  ) : null}
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs text-white/80 uppercase font-mono tracking-wider">
                    {nextTrip.region || nextTrip.destination} • {nextTrip.durationDays} Days
                  </p>
                  <h3 className="font-heading text-2xl font-bold leading-tight">
                    {nextTrip.title}
                  </h3>
                </div>
              </div>

              {/* Logistics & Details Column */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant border-b border-border pb-4">
                    <span className="flex items-center gap-1.5 font-semibold text-primary">
                      <Calendar className="size-4 text-secondary" />
                      {nextTrip.startDate} → {nextTrip.endDate}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="size-4 text-secondary" />
                      {nextTrip.travelers} Traveler{nextTrip.travelers === 1 ? "" : "s"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Sun className="size-4 text-amber-600" />
                      {nextTrip.status === "in-progress"
                        ? "Expedition in progress"
                        : `Status: ${nextTrip.status}`}
                    </span>
                  </div>

                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {nextTrip.summary || "No summary yet — add one from the trip page."}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-lg bg-surface-container-low border border-border">
                      <span className="text-[11px] text-on-surface-variant block font-medium">Pack Weight</span>
                      <span className="font-mono font-bold text-sm text-primary">
                        {nextTrip.packWeightKg} / {nextTrip.maxWeightKg} kg
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-container-low border border-border">
                      <span className="text-[11px] text-on-surface-variant block font-medium">Elevation Delta</span>
                      <span className="font-mono font-bold text-sm text-primary">
                        {nextTrip.averageElevation || "—"}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-container-low border border-border col-span-2 sm:col-span-1">
                      <span className="text-[11px] text-on-surface-variant block font-medium">Sync Cadence</span>
                      <span className="text-xs font-semibold text-emerald-800">
                        {nextTrip.satelliteSyncCadence || "On reconnect"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href={`/trips/${nextTrip.id}/itinerary`}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold transition-all shadow-sm"
                  >
                    <span>Open {nextTrip.durationDays}-Day Itinerary</span>
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href={`/trips/${nextTrip.id}`}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-5 rounded-lg border border-border hover:bg-surface-container text-on-surface text-xs font-semibold transition-colors"
                  >
                    <span>Expedition Master Hub</span>
                  </Link>
                  <Link
                    href={`/trips/${nextTrip.id}/destination`}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-surface-container text-primary text-xs font-semibold hover:bg-surface-container-high transition-colors"
                  >
                    <span>Field Dossier</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
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
                      {online ? (
                        <Wifi className="size-3 text-secondary" />
                      ) : (
                        <WifiOff className="size-3 text-error" />
                      )}
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
