"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Compass,
  Filter,
  HardDrive,
  MapPin,
  Mountain,
  Plus,
  Radio,
  Search,
  Upload,
  Users,
} from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { useAsyncResource } from "@/hooks/use-async-resource";
import { listTrips, type TripRecord } from "@/services/trips";
import { formatBytes, getStorageEstimate } from "@/lib/offline/storage-manager";

export default function TripsPage() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "completed" | "draft">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyOffline, setOnlyOffline] = useState(false);
  const [storageLabel, setStorageLabel] = useState<string | null>(null);

  // Real trips for the signed-in user (served from the local mirror offline).
  const tripsKey = uid ? `trips:${uid}` : null;
  const {
    data: tripsData,
    error,
    loading,
  } = useAsyncResource<TripRecord[]>(tripsKey, async () => {
    if (!uid) return [];
    const page = await listTrips(uid, { pageSize: 50 });
    return page.items;
  });
  const trips = tripsData ?? [];

  useEffect(() => {
    let cancelled = false;
    getStorageEstimate().then((estimate) => {
      if (!cancelled && estimate) {
        setStorageLabel(formatBytes(estimate.usageBytes));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTrips = trips.filter((trip) => {
    // Tab filter
    if (activeTab === "upcoming" && trip.status !== "upcoming" && trip.status !== "in-progress") return false;
    if (activeTab === "completed" && trip.status !== "completed") return false;
    if (activeTab === "draft" && trip.status !== "draft") return false;

    // Offline filter
    if (onlyOffline && trip.offlineStatus !== "downloaded") return false;

    // Search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchTitle = trip.title.toLowerCase().includes(q);
      const matchDest = trip.destination.toLowerCase().includes(q);
      const matchRegion = trip.region.toLowerCase().includes(q);
      return matchTitle || matchDest || matchRegion;
    }

    return true;
  });

  return (
    <div className="w-full min-h-screen bg-surface">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
        {/* Header & Primary Actions Zone */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-2">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              <span>EXPEDITION TELEMETRY & CACHING HUB</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-primary tracking-tight">
              My Trips
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Manage expedition itineraries, offline caching packages, and autonomous field telemetry across all destinations.
            </p>
          </div>

          {/* Actions & Storage Badge */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-border text-on-surface text-xs font-semibold shadow-sm">
              <HardDrive className="size-4 text-primary" />
              <span className="text-primary">
                {loading ? "…" : `${trips.length} Trip${trips.length === 1 ? "" : "s"}`}
              </span>
              <span className="text-on-surface-variant font-normal">
                {storageLabel ? `(${storageLabel} used)` : ""}
              </span>
              <span className="size-1 rounded-full bg-border" />
              <span className="text-emerald-700">
                {loading
                  ? "…"
                  : `${trips.filter((t) => t.offlineReady).length} Offline Ready`}
              </span>
            </div>

            <Link
              href="/trips/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Create New Trip</span>
            </Link>
          </div>
        </section>

        {/* Filter, Segmented Tabs & Search Bar */}
        <section className="p-4 rounded-2xl bg-white border border-border shadow-sm flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Segmented Status Tabs */}
            <div className="inline-flex p-1 rounded-xl bg-surface-container-low overflow-x-auto max-w-full">
              {[
                { id: "all" as const, label: "All Trips", count: trips.length },
                { id: "upcoming" as const, label: "Upcoming & Active", count: trips.filter((t) => t.status === "upcoming" || t.status === "in-progress").length },
                { id: "draft" as const, label: "Drafts & Planning", count: trips.filter((t) => t.status === "draft").length },
                { id: "completed" as const, label: "Completed", count: trips.filter((t) => t.status === "completed").length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-white text-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      activeTab === tab.id
                        ? "bg-secondary-fixed text-on-secondary-fixed"
                        : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Offline cached toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-on-surface-variant font-medium">
              <input
                type="checkbox"
                checked={onlyOffline}
                onChange={(e) => setOnlyOffline(e.target.checked)}
                className="size-4 rounded text-primary accent-primary cursor-pointer"
              />
              <span>Only show downloaded offline packs</span>
            </label>
          </div>

          {/* Search Bar Input */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by destination, trip title, or terrain type..."
              className="w-full bg-surface-container-low pl-10 pr-4 py-2.5 rounded-xl border border-border text-xs text-on-surface placeholder:text-on-surface-variant focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </section>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full py-12 text-center text-sm text-on-surface-variant bg-white rounded-2xl border border-border">
              Loading your trips…
            </div>
          ) : error ? (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-border">
              <p className="text-sm text-error">{error}</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Your saved trips are still on this device if you downloaded them.
              </p>
            </div>
          ) : null}

          {!loading && !error &&
            filteredTrips.map((trip) => (
            <div
              key={trip.id}
              className="rounded-2xl bg-white border border-border shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
            >
              {/* Cover Image & Status Overlays */}
              <div className="relative h-56 bg-surface-container-high overflow-hidden">
                {trip.coverImage || trip.heroImage ? (
                  <Image
                    src={(trip.coverImage || trip.heroImage) as string}
                    alt={trip.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-container to-surface-container-high">
                    <MapPin className="size-10 text-primary/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/95 text-primary text-xs font-bold shadow-sm">
                    {trip.country || trip.destination}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm ${
                      trip.status === "upcoming"
                        ? "bg-secondary-fixed text-on-secondary-fixed"
                        : trip.status === "completed"
                        ? "bg-surface-container-highest text-on-surface"
                        : "bg-tertiary-fixed text-on-tertiary-fixed"
                    }`}
                  >
                    {trip.status.toUpperCase()}
                  </span>
                  {trip.syncState === "queued" ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/90 text-white text-xs font-bold shadow-sm">
                      Pending sync
                    </span>
                  ) : null}
                </div>

                {/* Top Right Offline Indicator */}
                <div className="absolute top-3 right-3">
                  {trip.offlineStatus === "downloaded" ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/90 text-white text-xs font-bold flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="size-3" /> {trip.offlineSizeMb} MB Ready
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 text-white text-xs font-medium backdrop-blur-sm">
                      Cloud Sync Only
                    </span>
                  )}
                </div>

                {/* Bottom Overlay Title */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-white/80 block">
                    {trip.region} • {trip.durationDays} Days • {trip.travelers} Travelers
                  </span>
                  <h2 className="font-heading text-xl font-bold leading-tight mt-0.5">
                    {trip.title}
                  </h2>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-on-surface-variant border-b border-border/60 pb-2.5">
                    <span className="flex items-center gap-1.5 font-medium text-primary">
                      <Calendar className="size-3.5 text-secondary" />
                      {trip.startDate} → {trip.endDate}
                    </span>
                    <span className="font-mono text-[11px] text-secondary">
                      {trip.averageElevation}
                    </span>
                  </div>

                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                    {trip.summary}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
                  <span className="text-[11px] font-mono text-on-surface-variant flex items-center gap-1">
                    <Radio className="size-3 text-secondary" />
                    {trip.satelliteSyncCadence}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/trips/${trip.id}/itinerary`}
                      className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Itinerary</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                    <Link
                      href={`/trips/${trip.id}`}
                      className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors"
                    >
                      Hub
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!loading && !error && filteredTrips.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-dashed border-border">
              <Compass className="size-10 text-on-surface-variant/40 mb-2" />
              <h3 className="font-heading font-bold text-base text-primary">No Expeditions Found</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mt-1">
                No trips matched your active filter or search query. Try clearing the search bar or create a new expedition route.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
