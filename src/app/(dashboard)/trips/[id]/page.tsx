"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  FileText,
  MapPin,
  Mountain,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { useAsyncResource } from "@/hooks/use-async-resource";
import { getTrip, type TripRecord } from "@/services/trips";
import {
  listDocuments,
  type TravelDocumentRecord,
} from "@/services/documents";

export default function TripDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "passes">(
    "overview"
  );

  // The signed-in user's real trip (served from the local mirror offline).
  const tripKey = uid ? `${uid}:${resolvedParams.id}` : null;
  const {
    data: trip,
    error,
    loading,
  } = useAsyncResource<TripRecord | null>(tripKey, async () => {
    if (!uid) return null;
    return getTrip(uid, resolvedParams.id);
  });

  // Encrypted passes belonging to this trip (wallet documents).
  const passesKey = uid && trip ? `${uid}:${trip.id}` : null;
  const { data: passesData } = useAsyncResource<TravelDocumentRecord[]>(
    passesKey,
    async () => {
      if (!uid || !trip) return [];
      const page = await listDocuments(uid, {
        pageSize: 100,
        tripId: trip.id,
      });
      return page.items;
    }
  );
  const passes = passesData ?? [];

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-surface">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="py-16 text-center text-sm text-on-surface-variant bg-white rounded-2xl border border-border">
            Loading expedition…
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-surface">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="py-16 text-center bg-white rounded-2xl border border-border">
            <p className="text-sm text-error">{error}</p>
            <Link
              href="/trips"
              className="mt-3 inline-block text-xs text-primary font-semibold hover:underline"
            >
              Back to Trips
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="w-full min-h-screen bg-surface">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="py-16 text-center bg-white rounded-2xl border border-border flex flex-col items-center gap-2">
            <MapPin className="size-8 text-secondary" />
            <h1 className="font-heading text-lg font-bold text-primary">
              Trip not found
            </h1>
            <p className="text-sm text-on-surface-variant">
              It may have been deleted, or it belongs to another account.
            </p>
            <Link
              href="/trips"
              className="mt-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-container transition-colors"
            >
              Back to Trips
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Photo mosaic: only images that actually belong to this trip.
  const gallery = [trip.coverImage, trip.heroImage].filter(
    (src): src is string => Boolean(src)
  );
  const overBudget = trip.packWeightKg > trip.maxWeightKg;
  const pendingSync = trip.syncState === "queued";

  return (
    <div className="w-full min-h-screen bg-surface">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Breadcrumb & Operational Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-border shadow-sm">
          <nav className="flex items-center gap-2 text-xs text-on-surface-variant">
            <Link href="/trips" className="hover:text-primary transition-colors flex items-center gap-1 font-semibold">
              <Compass className="size-3.5" />
              <span>Trips</span>
            </Link>
            <span>/</span>
            <span className="text-on-surface font-medium truncate max-w-[200px] sm:max-w-none">
              {trip.title}
            </span>
            <span>/</span>
            <span className="text-primary font-bold">Master Expedition Hub</span>
          </nav>

          <div className="flex items-center gap-2">
            {/* Honest sync state — never a fabricated satellite link. */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low text-xs font-semibold text-primary">
              <span
                className={`size-2 rounded-full ${
                  pendingSync ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
                }`}
              />
              <span className="font-mono">
                {pendingSync ? "PENDING SYNC" : "SYNCED"}
              </span>
              <span className="text-on-surface-variant font-mono">
                • {trip.status}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold">
              FIELD SPEC V4.2
            </span>
          </div>
        </div>

        {/* Primary Expedition Hero Banner & Tactical Identity */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    trip.offlineReady
                      ? "bg-secondary-fixed text-on-secondary-fixed"
                      : "bg-surface-container-highest text-on-surface-variant"
                  }`}
                >
                  {trip.offlineReady
                    ? "100% Offline Readiness Locked"
                    : "Offline readiness not staged"}
                </span>
                <span className="text-xs font-mono text-secondary">
                  Sector: {trip.region || trip.destination}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/trips/${trip.id}/destination`}
                  className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-primary transition-colors flex items-center gap-1"
                >
                  <MapPin className="size-3.5" />
                  <span>Field Dossier</span>
                </Link>
                <Link
                  href={`/trips/${trip.id}/itinerary`}
                  className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-xs font-semibold text-white transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>Open Itinerary</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono uppercase tracking-widest text-secondary font-bold">
                Expedition Code #{trip.id.slice(0, 8).toUpperCase()}
              </span>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-primary tracking-tight">
                {trip.title}
              </h1>
              <p className="text-sm text-on-surface-variant max-w-3xl leading-relaxed mt-1">
                {trip.summary || "No summary yet."}
              </p>
            </div>

            {/* Photo Mosaic Preview — trip's own images, honest fallbacks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {gallery.length > 0 ? (
                gallery.map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className={`relative h-60 rounded-xl overflow-hidden shadow-sm ${
                      gallery.length === 1 ? "md:col-span-2" : ""
                    }`}
                  >
                    <Image
                      src={src}
                      alt={i === 0 ? trip.title : trip.region || trip.destination}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded text-white text-xs font-mono">
                      {i === 0 ? trip.destination : trip.region || trip.country}
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="relative h-60 rounded-xl overflow-hidden shadow-sm bg-gradient-to-br from-primary-container to-surface-container-high flex flex-col items-center justify-center gap-2">
                    <MapPin className="size-8 text-primary/60" />
                    <span className="text-xs font-mono text-primary/80">
                      {trip.destination}
                    </span>
                  </div>
                  <div className="relative h-60 rounded-xl overflow-hidden shadow-sm bg-gradient-to-br from-surface-container-high to-primary-container flex flex-col items-center justify-center gap-2">
                    <Mountain className="size-8 text-primary/60" />
                    <span className="text-xs font-mono text-primary/80">
                      {trip.region || trip.country || "No cover photo yet"}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Tactical Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border">
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-border/60">
                <span className="text-[11px] text-on-surface-variant font-medium block">Duration & Dates</span>
                <span className="font-mono text-sm font-bold text-primary">
                  {trip.durationDays} Days • {trip.startDate} → {trip.endDate}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-border/60">
                <span className="text-[11px] text-on-surface-variant font-medium block">Elevation Envelope</span>
                <span className="font-mono text-sm font-bold text-primary">
                  {trip.averageElevation || "—"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-border/60">
                <span className="text-[11px] text-on-surface-variant font-medium block">Trip Status</span>
                <span className="font-mono text-sm font-bold text-amber-800">
                  {trip.status} • {trip.travelers} Traveler
                  {trip.travelers === 1 ? "" : "s"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-border/60">
                <span className="text-[11px] text-on-surface-variant font-medium block">Pack Weight Envelope</span>
                <span
                  className={`font-mono text-sm font-bold ${
                    overBudget ? "text-error" : "text-emerald-800"
                  }`}
                >
                  {trip.packWeightKg} / {trip.maxWeightKg} kg (
                  {overBudget ? "Over budget" : "Within budget"})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Logistics Tabs */}
        <div className="w-full bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            {[
              { id: "overview" as const, label: "Field Logistics & Route Directives" },
              { id: "specs" as const, label: "Terrain Pacing & Gear Envelope" },
              { id: "passes" as const, label: "Offline Passes & Encrypted Vouchers" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
              <div className="flex flex-col gap-3">
                <h3 className="font-heading font-bold text-base text-primary">Route Directives</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {trip.summary ||
                    "No route directives yet — add a summary when you plan this expedition."}
                </p>
                <div className="p-3 rounded-lg bg-surface-container-low border border-border text-xs flex items-center justify-between">
                  <span className="font-semibold text-primary">Destination:</span>
                  <span className="font-mono">{trip.destination}</span>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-low border border-border text-xs flex items-center justify-between">
                  <span className="font-semibold text-primary">Country:</span>
                  <span className="font-mono">{trip.country || "—"}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="font-heading font-bold text-base text-primary">Offline Status</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {trip.offlineReady
                    ? "This expedition is marked as downloaded — its itinerary stays readable without a network."
                    : "This expedition is not staged for offline use yet. Reads and edits still work offline from this device's local cache."}
                </p>
                <div className="p-3 rounded-lg bg-secondary-fixed text-primary text-xs flex items-center gap-2">
                  <ShieldCheck className="size-4" />
                  <span>
                    {trip.offlineReady
                      ? "Trip data staged for offline use"
                      : "Local cache active • changes queue until reconnect"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "specs" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-surface-container-low border border-border">
                <h4 className="font-heading font-bold text-xs text-primary mb-1">Trail Surface</h4>
                <p className="text-xs text-on-surface-variant">{trip.terrainType || "—"}</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low border border-border">
                <h4 className="font-heading font-bold text-xs text-primary mb-1">Satellite Telemetry</h4>
                <p className="text-xs text-on-surface-variant">
                  {trip.satelliteSyncCadence || "—"}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low border border-border">
                <h4 className="font-heading font-bold text-xs text-primary mb-1">Offline Cache Size</h4>
                <p className="text-xs text-on-surface-variant">
                  {trip.offlineReady
                    ? `${trip.offlineSizeMb} MB Fully Staged`
                    : "Not staged"}
                </p>
              </div>
            </div>
          )}

          {activeTab === "passes" && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-bold text-xs text-primary">Encrypted Passes for This Expedition</h4>
                <Link href="/wallet" className="text-xs text-primary font-semibold hover:underline">
                  Open Travel Wallet
                </Link>
              </div>

              {passes.length === 0 ? (
                <div className="p-4 rounded-xl bg-surface-container-low border border-border text-xs text-on-surface-variant">
                  No travel documents are linked to this expedition yet.
                </div>
              ) : (
                passes.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl bg-surface-container-low border border-border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="size-5 text-primary" />
                      <div>
                        <h5 className="font-semibold text-xs text-primary">{doc.title}</h5>
                        <p className="text-[11px] text-on-surface-variant">
                          {doc.category}
                          {doc.referenceCode ? ` • ${doc.referenceCode}` : ""}
                          {doc.seatOrRoom ? ` • ${doc.seatOrRoom}` : ""}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/wallet/documents/${doc.id}`}
                      className="px-3 py-1.5 rounded-lg bg-white border border-border text-xs font-semibold text-primary hover:bg-surface-container"
                    >
                      View
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
