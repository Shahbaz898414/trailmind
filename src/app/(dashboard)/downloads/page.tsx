"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CloudDownload,
  Cpu,
  Database,
  Download,
  FileCheck,
  HardDrive,
  Layers,
  MapPin,
  Mountain,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Zap,
} from "lucide-react";

import { offlineStorageStatus, offlinePacksList, type OfflinePackDetail } from "@/data/offline";

export default function DownloadsPage() {
  const [packs, setPacks] = useState<OfflinePackDetail[]>(offlinePacksList);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLabel, setSyncLabel] = useState("Sync All Trips Now");

  const handleSyncAll = () => {
    setIsSyncing(true);
    setSyncLabel("Synchronizing Storage Packages...");
    setTimeout(() => {
      setSyncLabel("All Packages Synchronized");
      setTimeout(() => {
        setIsSyncing(false);
        setSyncLabel("Sync All Trips Now");
      }, 2000);
    }, 1500);
  };

  const handleDownload = (id: string) => {
    setPacks((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "downloading" } : p))
    );
    setTimeout(() => {
      setPacks((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: "ready", lastUpdated: "Just now", checksum: "8f4a19b2c3d4" }
            : p
        )
      );
    }, 1600);
  };

  const handleDelete = (id: string) => {
    setPacks((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "not_downloaded", lastUpdated: "Not cached" } : p
      )
    );
  };

  return (
    <div className="w-full min-h-screen bg-surface">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-2">
          <div className="flex flex-col gap-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                Zero-Connectivity Protocol Active
              </span>
              <span className="text-xs text-on-surface-variant font-mono">• SECURE STORAGE V4.2</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-primary tracking-tight">
              Offline Downloads & Storage Telemetry
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Manage downloaded expedition packs, edge neural weights, and verify 100% offline travel autonomy before departing cell tower coverage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/downloads/checklist"
              className="px-4 py-2.5 rounded-lg bg-white border border-border text-on-surface hover:bg-surface-container text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
            >
              <FileCheck className="size-4 text-primary" />
              <span>Pre-Flight Gate</span>
            </Link>

            <Link
              href="/downloads/sync"
              className="px-4 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <RefreshCw className="size-4" />
              <span>Conflict Resolution</span>
            </Link>

            <button
              type="button"
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-80"
            >
              <RefreshCw className={`size-4 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{syncLabel}</span>
            </button>
          </div>
        </div>

        {/* Top Telemetry Bar (4 metrics cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-on-surface-variant uppercase font-mono font-semibold">
                  Device Storage Quota
                </span>
                <span className="font-heading text-xl font-bold text-primary block mt-1">
                  {offlineStorageStatus.usedStorageGb} / {offlineStorageStatus.totalStorageGb} GB
                </span>
              </div>
              <div className="size-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                <HardDrive className="size-5" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 pt-2 border-t border-border/50">
              <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${offlineStorageStatus.quotaPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-on-surface-variant">
                {offlineStorageStatus.quotaPercent}% Utilized • {offlineStorageStatus.availableStorageGb} GB Free
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-on-surface-variant uppercase font-mono font-semibold">
                  1:25k Topo Contours
                </span>
                <span className="font-heading text-xl font-bold text-primary block mt-1">
                  2.8 GB Staged
                </span>
              </div>
              <div className="size-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-primary">
                <Mountain className="size-5" />
              </div>
            </div>
            <div className="text-xs text-on-surface-variant pt-2 border-t border-border/50 font-mono">
              <span>DEM Elevation Rasters Ready</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-on-surface-variant uppercase font-mono font-semibold">
                  Neural Model Weights
                </span>
                <span className="font-heading text-xl font-bold text-primary block mt-1">
                  Gemma-2B INT4
                </span>
              </div>
              <div className="size-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                <Cpu className="size-5" />
              </div>
            </div>
            <div className="text-xs text-on-surface-variant pt-2 border-t border-border/50 font-mono">
              <span className="text-emerald-700 font-bold">WebGPU Initialized (0ms)</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-on-surface-variant uppercase font-mono font-semibold">
                  Vector Knowledge Base
                </span>
                <span className="font-heading text-xl font-bold text-primary block mt-1">
                  HNSW Cosine
                </span>
              </div>
              <div className="size-10 rounded-xl bg-tertiary-fixed flex items-center justify-center text-primary">
                <Database className="size-5" />
              </div>
            </div>
            <div className="text-xs text-on-surface-variant pt-2 border-t border-border/50 font-mono">
              <span>14 Waypoint Embeddings</span>
            </div>
          </div>
        </div>

        {/* Downloaded Expedition Packages List */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-primary">
              Expedition Data Packages ({packs.length})
            </h2>
            <span className="text-xs text-on-surface-variant font-mono">
              Cryptographic Checksum Audit (SHA-256)
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {packs.map((pack) => (
              <div
                key={pack.id}
                className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-2 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-bold text-xs">
                      {pack.sizeMb} MB
                    </span>
                    <span className="text-xs font-mono text-on-surface-variant">
                      {pack.region}
                    </span>
                    {pack.status === "ready" && (
                      <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-primary text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="size-3" /> Ready Offline
                      </span>
                    )}
                    {pack.status === "downloading" && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold animate-pulse">
                        Downloading 72%
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading text-lg font-bold text-primary">
                    {pack.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-on-surface-variant">
                    <span>Version: {pack.version}</span>
                    <span>Updated: {pack.lastUpdated}</span>
                  </div>

                  {/* Components checklist */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant pt-1">
                    <span className={`flex items-center gap-1 ${pack.components.topoMaps ? "text-emerald-700 font-semibold" : "opacity-40"}`}>
                      <CheckCircle2 className="size-3" /> Topo Maps
                    </span>
                    <span className={`flex items-center gap-1 ${pack.components.aiWeights ? "text-emerald-700 font-semibold" : "opacity-40"}`}>
                      <CheckCircle2 className="size-3" /> AI Weights
                    </span>
                    <span className={`flex items-center gap-1 ${pack.components.vectorDb ? "text-emerald-700 font-semibold" : "opacity-40"}`}>
                      <CheckCircle2 className="size-3" /> Vector DB
                    </span>
                    <span className={`flex items-center gap-1 ${pack.components.audioPhrases ? "text-emerald-700 font-semibold" : "opacity-40"}`}>
                      <CheckCircle2 className="size-3" /> Audio Phrases
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5 shrink-0">
                  {pack.status === "ready" ? (
                    <>
                      <Link
                        href="/downloads/progress"
                        className="px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-primary transition-colors"
                      >
                        Monitor
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(pack.id)}
                        className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-red-50 transition-colors"
                        title="Remove Pack"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </>
                  ) : pack.status === "downloading" ? (
                    <Link
                      href="/downloads/progress"
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors"
                    >
                      View Progress
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDownload(pack.id)}
                      className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="size-3.5" />
                      <span>Download Pack</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
