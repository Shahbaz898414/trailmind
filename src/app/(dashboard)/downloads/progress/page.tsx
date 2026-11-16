"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Download,
  HardDrive,
  Mountain,
  Pause,
  Play,
  Radio,
  RefreshCw,
  ShieldCheck,
  Volume2,
  X,
} from "lucide-react";

export default function DownloadProgressMonitorPage() {
  const [progress, setProgress] = useState(72);
  const [isPaused, setIsPaused] = useState(false);
  const [downloadSpeed, setDownloadSpeed] = useState("18.4 MB/s");

  useEffect(() => {
    if (isPaused || progress >= 100) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [isPaused, progress]);

  return (
    <div className="w-full min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/downloads"
            className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="size-3.5" /> Back to Downloads Hub
          </Link>
          <span className="font-mono text-xs text-secondary font-bold">
            STAGE RUNNER: WORKER #04
          </span>
        </div>

        {/* Primary Download Progress Card */}
        <div className="bg-white rounded-3xl border border-border shadow-xl p-6 sm:p-10 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs uppercase tracking-widest text-secondary font-bold">
                MULTI-THREADED OFF-GRID STAGING
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                Kyoto & Kansai Wilderness Basin (v4.2)
              </h1>
              <p className="text-xs text-on-surface-variant">
                Staging 612 MB DEM contour rasters, quantized Gemma-2B INT4 weights, and HNSW vector index.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isPaused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
                <span>{isPaused ? "Resume" : "Pause"}</span>
              </button>
            </div>
          </div>

          {/* Progress Bar & Rate Telemetry */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-primary">{progress}% Downloaded</span>
              <span className="text-secondary font-semibold">
                {isPaused ? "Paused" : `${downloadSpeed} • Est. 42s remaining`}
              </span>
            </div>

            <div className="h-4 w-full bg-surface-container-highest rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-mono">
              <span>{Math.round((612 * progress) / 100)} MB of 612 MB</span>
              <span>SHA-256 Verified Threads (8 Cores)</span>
            </div>
          </div>

          {/* Staging Pipeline Components */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-border">
            <div className="p-4 rounded-xl bg-surface-container-low border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mountain className="size-5 text-primary" />
                <div>
                  <span className="font-semibold text-xs text-primary block">10m DEM Topo Contours</span>
                  <span className="text-[11px] text-on-surface-variant">280 MB • 1:25k Quad Tiles</span>
                </div>
              </div>
              <CheckCircle2 className="size-4 text-emerald-600" />
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cpu className="size-5 text-primary" />
                <div>
                  <span className="font-semibold text-xs text-primary block">Gemma-2B Neural Weights</span>
                  <span className="text-[11px] text-on-surface-variant">195 MB • INT4 WebGPU Matrix</span>
                </div>
              </div>
              <CheckCircle2 className="size-4 text-emerald-600" />
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="size-5 text-primary" />
                <div>
                  <span className="font-semibold text-xs text-primary block">HNSW Spatial Vector Store</span>
                  <span className="text-[11px] text-on-surface-variant">68 MB • 14 Waypoint Embeddings</span>
                </div>
              </div>
              {progress > 50 ? (
                <CheckCircle2 className="size-4 text-emerald-600" />
              ) : (
                <RefreshCw className="size-4 text-amber-600 animate-spin" />
              )}
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="size-5 text-primary" />
                <div>
                  <span className="font-semibold text-xs text-primary block">Bilingual Audio Clips</span>
                  <span className="text-[11px] text-on-surface-variant">69 MB • Kokoro-TTS 140 Clips</span>
                </div>
              </div>
              {progress >= 90 ? (
                <CheckCircle2 className="size-4 text-emerald-600" />
              ) : (
                <span className="font-mono text-xs text-on-surface-variant">Staging...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
