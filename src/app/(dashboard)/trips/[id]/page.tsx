"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Download,
  FileText,
  HardDrive,
  HeartPulse,
  Layers,
  MapPin,
  Mountain,
  Radio,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sun,
  Users,
  Zap,
} from "lucide-react";

import { sampleTripsList } from "@/data/trips";

export default function TripDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const trip =
    sampleTripsList.find((t) => t.id === resolvedParams.id) || sampleTripsList[0];

  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "passes">("overview");

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
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low text-xs font-semibold text-primary">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono">IRIDIUM SATELLITE LINK #8841</span>
              <span className="text-on-surface-variant font-mono">• 0.4kbps</span>
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
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold">
                  100% Offline Readiness Locked
                </span>
                <span className="text-xs font-mono text-secondary">
                  Sector: {trip.region} • Topo 1:25k Active
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
                EXPEDITION CODE #JP-KYO-2026
              </span>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-primary tracking-tight">
                {trip.title}
              </h1>
              <p className="text-sm text-on-surface-variant max-w-3xl leading-relaxed mt-1">
                {trip.summary}
              </p>
            </div>

            {/* Photo Mosaic Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="relative h-60 rounded-xl overflow-hidden shadow-sm">
                <Image
                  src="/images/stitch/trip-details-kumano-kodo-cedars.jpg"
                  alt="Ancient Cedar Trail"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded text-white text-xs font-mono">
                  Ancient Cedars • Daimon-zaka
                </div>
              </div>

              <div className="relative h-60 rounded-xl overflow-hidden shadow-sm">
                <Image
                  src="/images/stitch/trip-details-nachi-taisha.jpg"
                  alt="Kumano Nachi Taisha"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded text-white text-xs font-mono">
                  Nachi Waterfall & Shrine
                </div>
              </div>
            </div>

            {/* Tactical Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border">
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-border/60">
                <span className="text-[11px] text-on-surface-variant font-medium block">Duration & Distance</span>
                <span className="font-mono text-sm font-bold text-primary">
                  {trip.durationDays} Days • 84 km
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-border/60">
                <span className="text-[11px] text-on-surface-variant font-medium block">Elevation Envelope</span>
                <span className="font-mono text-sm font-bold text-primary">
                  {trip.averageElevation}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-border/60">
                <span className="text-[11px] text-on-surface-variant font-medium block">Solar Ephemeris</span>
                <span className="font-mono text-sm font-bold text-amber-800">
                  Dawn 05:42 • Dusk 18:24
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-border/60">
                <span className="text-[11px] text-on-surface-variant font-medium block">Pack Weight Envelope</span>
                <span className="font-mono text-sm font-bold text-emerald-800">
                  {trip.packWeightKg} / {trip.maxWeightKg} kg (Budget OK)
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
                <h3 className="font-heading font-bold text-base text-primary">Daily Route Synthesis</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Autonomous constraint compilation guarantees a minimum 45-minute buffer between cultural waypoints and local train transfers. Solar ephemeris calculated against 10m DEM horizon mesh.
                </p>
                <div className="p-3 rounded-lg bg-surface-container-low border border-border text-xs flex items-center justify-between">
                  <span className="font-semibold text-primary">Primary Navigation Mode:</span>
                  <span className="font-mono">Offline GPX Vector Track</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="font-heading font-bold text-base text-primary">Contingency Protocols</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  If rainfall exceeds 15mm/hr along Higashiyama ridge passes, alternative valley routes through covered temple cloisters are automatically rendered on-device.
                </p>
                <div className="p-3 rounded-lg bg-secondary-fixed text-primary text-xs flex items-center gap-2">
                  <ShieldCheck className="size-4" />
                  <span>Rain Contingency Blueprint Staged in Offline Cache</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "specs" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-surface-container-low border border-border">
                <h4 className="font-heading font-bold text-xs text-primary mb-1">Trail Surface</h4>
                <p className="text-xs text-on-surface-variant">{trip.terrainType}</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low border border-border">
                <h4 className="font-heading font-bold text-xs text-primary mb-1">Satellite Telemetry</h4>
                <p className="text-xs text-on-surface-variant">{trip.satelliteSyncCadence}</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low border border-border">
                <h4 className="font-heading font-bold text-xs text-primary mb-1">Offline Cache Size</h4>
                <p className="text-xs text-on-surface-variant">{trip.offlineSizeMb} MB Fully Staged</p>
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
              <div className="p-4 rounded-xl bg-surface-container-low border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="size-5 text-primary" />
                  <div>
                    <h5 className="font-semibold text-xs text-primary">JR Shinkansen Nozomi #23 Ticket</h5>
                    <p className="text-[11px] text-on-surface-variant">Car 7 • Seat 14-E • Aztec Barcode Ready</p>
                  </div>
                </div>
                <Link
                  href="/wallet/documents/doc-nozomi-23"
                  className="px-3 py-1.5 rounded-lg bg-white border border-border text-xs font-semibold text-primary hover:bg-surface-container"
                >
                  View Ticket
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
