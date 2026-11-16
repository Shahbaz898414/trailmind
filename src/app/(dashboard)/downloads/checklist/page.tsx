"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Cpu,
  FileCheck,
  HardDrive,
  HeartPulse,
  Mountain,
  Radio,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { preFlightChecklist } from "@/data/offline";

export default function PreFlightChecklistPage() {
  const [items, setItems] = useState(preFlightChecklist);

  const verifiedCount = items.filter((i) => i.status === "verified").length;

  return (
    <div className="w-full min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/downloads"
            className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="size-3.5" /> Back to Downloads Hub
          </Link>
          <span className="font-mono text-xs text-emerald-800 font-bold bg-secondary-fixed px-2.5 py-0.5 rounded-full">
            PRE-FLIGHT GATE: 4/5 VERIFIED
          </span>
        </div>

        {/* Title Header */}
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs uppercase tracking-widest text-secondary font-bold">
            EXPEDITION READINESS VERIFICATION
          </span>
          <h1 className="font-heading text-3xl font-bold text-primary tracking-tight">
            Field Offline Readiness Gate
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Mandatory pre-departure checklist verifying 100% air-gapped autonomy before stepping off the cellular grid.
          </p>
        </div>

        {/* Checklist List */}
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 shrink-0">
                  {item.status === "verified" ? (
                    <div className="size-8 rounded-full bg-secondary-fixed text-primary flex items-center justify-center">
                      <CheckCircle2 className="size-4" />
                    </div>
                  ) : item.status === "warning" ? (
                    <div className="size-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                      <AlertTriangle className="size-4" />
                    </div>
                  ) : (
                    <div className="size-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center">
                      <XCircle className="size-4" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-secondary uppercase">
                      {item.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.2 rounded font-semibold ${
                        item.status === "verified"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-primary">{item.title}</h3>
                  <p className="text-xs text-on-surface-variant">{item.description}</p>
                </div>
              </div>

              <div className="text-right shrink-0 font-mono text-xs font-bold text-primary sm:border-l sm:border-border sm:pl-4">
                {item.metric}
              </div>
            </div>
          ))}
        </div>

        {/* Final Pass Verdict */}
        <div className="p-6 rounded-2xl bg-secondary-container/40 border border-secondary-container flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-8 text-primary shrink-0" />
            <div>
              <h4 className="font-heading font-bold text-base text-primary">
                Expedition Readiness Score: 96%
              </h4>
              <p className="text-xs text-on-surface-variant">
                All critical topographic contours, on-device models, and medical directives are armed.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold text-center transition-all shadow-md"
          >
            Authorize Expedition
          </Link>
        </div>
      </div>
    </div>
  );
}
