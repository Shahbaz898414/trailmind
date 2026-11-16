"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  GitBranch,
  GitCommit,
  GitMerge,
  Layers,
  Radio,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Split,
  X,
} from "lucide-react";

interface ConflictItem {
  id: string;
  entityName: string;
  field: string;
  localValue: string;
  remoteValue: string;
  chosen: "local" | "remote" | "merged" | null;
}

export default function ConflictResolutionPage() {
  const [conflicts, setConflicts] = useState<ConflictItem[]>([
    {
      id: "cnf-1",
      entityName: "Day 4: Nanzen-ji Transit Buffer",
      field: "Departure Window",
      localValue: "08:30 – 10:30 JST (Local Solar Alignment)",
      remoteValue: "09:15 – 11:00 JST (Cloud Weather Delay)",
      chosen: "local",
    },
    {
      id: "cnf-2",
      entityName: "Ryokan Motonaga Check-in",
      field: "Arrival Buffer",
      localValue: "16:00 (Direct MK Taxi from Station)",
      remoteValue: "17:30 (Bus Transit Schedule)",
      chosen: null,
    },
    {
      id: "cnf-3",
      entityName: "Expedition Gear Weight",
      field: "Pack Budget",
      localValue: "8.5 kg (Alpine Ultralight Kit)",
      remoteValue: "9.2 kg (Added Heavy Rain Poncho)",
      chosen: null,
    },
  ]);

  const [isCommitted, setIsCommitted] = useState(false);

  const resolve = (id: string, choice: "local" | "remote") => {
    setConflicts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, chosen: choice } : c))
    );
  };

  const acceptAllLocal = () => {
    setConflicts((prev) => prev.map((c) => ({ ...c, chosen: "local" })));
  };

  const pendingCount = conflicts.filter((c) => c.chosen === null).length;

  const handleCommit = () => {
    setIsCommitted(true);
    setTimeout(() => {
      setIsCommitted(false);
    }, 2500);
  };

  return (
    <div className="w-full min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Top Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-mono">
            <Link href="/downloads" className="hover:text-primary transition-colors flex items-center gap-1 font-semibold">
              <ArrowLeft className="size-3.5" /> Downloads Hub
            </Link>
            <span>/</span>
            <span className="text-primary font-bold">Conflict Resolution Engine</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-primary text-xs font-semibold">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>PEER MESH ACTIVE • NODE #JP-ALPS-8842</span>
            </span>
          </div>
        </div>

        {/* Header Banner */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold font-mono">
                CRDT DIVERGENCE DETECTED
              </span>
              <span className="text-xs text-secondary font-bold">14 Auto-Merged Successfully</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-primary tracking-tight">
              Autonomous Sync & Conflict Resolution
            </h1>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Local on-device changes reconciled against Remote Cloud Ledger v4.1 via Conflict-Free Replicated Data Types (CRDT). Resolve branches before committing to the immutable field log.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={acceptAllLocal}
              className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold transition-colors"
            >
              Accept All Local
            </button>
            <button
              type="button"
              onClick={handleCommit}
              disabled={isCommitted}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-80"
            >
              <RefreshCw className={`size-4 ${isCommitted ? "animate-spin" : ""}`} />
              <span>{isCommitted ? "Sync Committed" : `Commit & Sync (${pendingCount} Pending)`}</span>
            </button>
          </div>
        </div>

        {/* Conflicts List */}
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-xl font-bold text-primary">
            Divergent Mutation Branches ({conflicts.length})
          </h2>

          <div className="flex flex-col gap-4">
            {conflicts.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-4"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <h3 className="font-heading font-bold text-base text-primary">
                      {c.entityName}
                    </h3>
                    <span className="text-xs text-on-surface-variant font-mono">
                      Field: {c.field}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                      c.chosen === "local"
                        ? "bg-secondary-fixed text-primary"
                        : c.chosen === "remote"
                        ? "bg-blue-100 text-blue-900"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {c.chosen ? `Chosen: ${c.chosen.toUpperCase()}` : "Resolution Required"}
                  </span>
                </div>

                {/* Two-Way Diff Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Local Card */}
                  <div
                    onClick={() => resolve(c.id, "local")}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      c.chosen === "local"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-surface-container-low hover:bg-surface-container"
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-primary uppercase">LOCAL ON-DEVICE VERSION</span>
                        {c.chosen === "local" && <Check className="size-4 text-primary" />}
                      </div>
                      <p className="font-mono text-xs font-semibold text-on-surface mt-1">
                        {c.localValue}
                      </p>
                    </div>
                    <span className="text-[11px] text-on-surface-variant">Timestamp: Today at 04:12 JST (Air-Gapped)</span>
                  </div>

                  {/* Remote Card */}
                  <div
                    onClick={() => resolve(c.id, "remote")}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      c.chosen === "remote"
                        ? "border-blue-600 bg-blue-50/50 shadow-sm"
                        : "border-border bg-surface-container-low hover:bg-surface-container"
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-blue-900 uppercase">REMOTE CLOUD LEDGER</span>
                        {c.chosen === "remote" && <Check className="size-4 text-blue-700" />}
                      </div>
                      <p className="font-mono text-xs font-semibold text-on-surface mt-1">
                        {c.remoteValue}
                      </p>
                    </div>
                    <span className="text-[11px] text-on-surface-variant">Timestamp: Yesterday at 23:40 JST (Cellular)</span>
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
