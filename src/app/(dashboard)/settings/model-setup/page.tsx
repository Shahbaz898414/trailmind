"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  MemoryStick as Memory,
  RefreshCw,
  Gauge,
  CheckCircle2,
  Lock,
  Layers,
  Zap,
  Sliders,
  Download,
  Shield,
  BatteryCharging,
  Fingerprint,
  Radio,
  Thermometer,
  FileText,
  Activity,
  AlertCircle,
} from "lucide-react";

export default function ModelSetupPage() {
  const [benchmarking, setBenchmarking] = useState(false);
  const [downloading7B, setDownloading7B] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleBenchmark = () => {
    setBenchmarking(true);
    setTimeout(() => {
      setBenchmarking(false);
      showToast("NPU Stress Benchmark passed: TTFT 42ms, Decode 52.4 tok/s.");
    }, 2500);
  };

  const handleDownload7B = () => {
    if (downloading7B) return;
    setDownloading7B(true);
    setDownloadProgress(10);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloading7B(false);
          showToast("Gemma-7B Q4_K_M successfully downloaded and stored in IndexedDB.");
          return 100;
        }
        return prev + 20;
      });
    }, 600);
  };

  return (
    <div className="w-full bg-surface min-h-screen">
      <div className="flex flex-col w-full">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
          {/* Breadcrumb & Control Action Bar */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <nav className="flex items-center gap-2 text-on-surface-variant text-xs">
                <Link href="/settings" className="hover:text-primary transition-colors">
                  Settings & Storage
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link href="/settings/ai" className="hover:text-primary transition-colors">
                  AI & Edge Acceleration
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-primary font-semibold">On-Device Model Setup</span>
              </nav>
              <div className="flex items-center gap-2.5 mt-1">
                <span className="p-2 rounded-lg bg-secondary-fixed text-primary">
                  <Memory className="w-6 h-6" />
                </span>
                <h1 className="text-3xl font-extrabold text-on-surface tracking-tight font-serif">
                  Edge AI Engine & On-Device Model Setup
                </h1>
              </div>
              <p className="text-sm text-on-surface-variant max-w-3xl">
                Configure, download, and benchmark local neural models for zero-latency, private, and
                air-gapped travel assistance in remote alpine and off-grid sectors.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => showToast("Purged 320 MB of obsolete temporary model checkpoints.")}
                className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm border border-outline-variant/30"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Purge Unused</span>
              </button>
              <button
                onClick={() => showToast("HuggingFace & local weights are in sync.")}
                className="px-4 py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container-low text-primary text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm border border-outline-variant/30"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Check Updates</span>
              </button>
              <button
                onClick={handleBenchmark}
                disabled={benchmarking}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-60"
              >
                <Gauge className={`w-3.5 h-3.5 ${benchmarking ? "animate-spin" : ""}`} />
                <span>{benchmarking ? "Benchmarking Hardware..." : "Run Hardware Benchmark"}</span>
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {toastMsg && (
            <div className="p-3 bg-secondary-fixed/50 border border-primary/20 rounded-xl flex items-center gap-3 text-primary text-sm font-medium animate-in fade-in slide-in-from-top duration-200">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* Hardware Diagnostic Cards (4-Column Bento Bar) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Backend */}
            <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-4 border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  Compute Backend
                </span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Optimal
                </span>
              </div>
              <div>
                <div className="text-xl font-bold text-on-surface font-serif">
                  ANE + WebGPU
                </div>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Apple Neural Engine via Metal backend. FP16 tensor core mapping verified.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-primary text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero Thermal Throttle</span>
              </div>
            </div>

            {/* Card 2: Memory */}
            <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-4 border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  Unified VRAM
                </span>
                <span className="text-xs text-primary font-bold font-mono">1.85 GB / 16.0 GB</span>
              </div>
              <div>
                <div className="text-xl font-bold text-on-surface font-serif">
                  82% Free Headroom
                </div>
                <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-primary rounded-full" style={{ width: "18%" }} />
                </div>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Static buffer locked. Zero swappiness detected on iOS/macOS kernel.
              </p>
            </div>

            {/* Card 3: Model State */}
            <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-4 border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  Primary Weight Set
                </span>
                <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">
                  Ready
                </span>
              </div>
              <div>
                <div className="text-xl font-bold text-on-surface font-serif truncate">
                  Gemma-2B AWQ
                </div>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  4-bit Group-128 quantization loaded in persistent IndexedDB.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-primary text-xs font-mono">
                <span>SHA-256: 7f3a...91d2</span>
              </div>
            </div>

            {/* Card 4: Throughput */}
            <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-4 border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  Inference Rate
                </span>
                <span className="text-xs text-primary font-bold font-mono">Cold: 118ms</span>
              </div>
              <div>
                <div className="text-xl font-bold text-primary flex items-baseline gap-1 font-mono">
                  48.2 <span className="text-xs text-on-surface-variant font-sans font-normal">tok/s</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  TTFT: 118ms • Off-grid itinerary queries render in real time.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-primary text-xs font-medium">
                <Zap className="w-3.5 h-3.5" />
                <span>Instant Turn Generation</span>
              </div>
            </div>
          </div>

          {/* Main Content Workspace (Split Layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Available On-Device Models (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Memory className="w-5 h-5 text-primary" />
                  <h2 className="text-lg text-on-surface font-bold font-serif">
                    Available On-Device Travel Models
                  </h2>
                </div>
                <span className="text-xs text-on-surface-variant uppercase tracking-wider">
                  3 Engines Profiled
                </span>
              </div>

              {/* Model 1 (Active Default) */}
              <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-4 relative overflow-hidden border border-outline-variant/30">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Installed • Active Default
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface text-[11px] font-medium">
                      Primary Engine
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant text-xs">
                    <span>
                      Disk: <strong className="text-on-surface font-mono">1.42 GB</strong>
                    </span>
                    <span>•</span>
                    <span>
                      RAM: <strong className="text-on-surface font-mono">1.8 GB</strong>
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-on-surface font-serif">
                    Gemma-2B Instruct Travel Edition (INT4)
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Specially tuned for wilderness rescue protocols, multi-turn itinerary adjustments, topo
                    landmark cross-referencing, and customs/border compliance without internet
                    connectivity.
                  </p>
                </div>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface-variant text-[11px] flex items-center gap-1">
                    First-Aid Triage
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface-variant text-[11px] flex items-center gap-1">
                    Topo QA
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface-variant text-[11px] flex items-center gap-1">
                    Baggage Limits
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface-variant text-[11px] flex items-center gap-1">
                    <Lock className="w-3 h-3" /> 100% On-Device
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                  <button
                    onClick={() => showToast("SHA-256: 9e4d1f2b88fca02d verified against canonical release.")}
                    className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-mono transition-colors flex items-center gap-1.5"
                  >
                    <Fingerprint className="w-3.5 h-3.5" />
                    <span>Hash: 9e4d1f2b...</span>
                  </button>
                  <button
                    onClick={() => showToast("Weights calibrated for current thermal envelope.")}
                    className="px-4 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-container text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Calibrate Weights</span>
                  </button>
                </div>
              </div>

              {/* Model 2 (Available for High-RAM Devices) */}
              <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-4 border border-outline-variant/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-semibold flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" />
                      Available Download
                    </span>
                    <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold">
                      Heavy Reasoning
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant text-xs">
                    <span>
                      Download: <strong className="text-on-surface font-mono">4.35 GB</strong>
                    </span>
                    <span>•</span>
                    <span>
                      RAM Req: <strong className="text-on-surface font-mono">5.2 GB</strong>
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-on-surface font-serif">
                    Gemma-7B Q4_K_M (Expanded Reasoning)
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    High-parameter deep planning model. Capable of multi-pass route synthesis across
                    high-altitude mountain passes, complex elevation budgeting, and historical culture
                    monographs.
                  </p>
                </div>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface-variant text-[11px]">
                    Deep Route Synthesis
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface-variant text-[11px]">
                    Multi-lingual History
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface-variant text-[11px]">
                    Weather Micro-climate Logic
                  </span>
                </div>

                {downloading7B && (
                  <div className="w-full space-y-1">
                    <div className="flex justify-between text-xs text-on-surface-variant">
                      <span>Downloading weights...</span>
                      <span>{downloadProgress}%</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                  <span className="text-[11px] text-on-surface-variant">
                    Requires 4.5 GB free space in IndexedDB Cache
                  </span>
                  <button
                    onClick={handleDownload7B}
                    disabled={downloading7B}
                    className="px-4 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloading7B ? `Downloading (${downloadProgress}%)` : "Download Model (4.35 GB)"}</span>
                  </button>
                </div>
              </div>

              {/* Model 3 (Lightweight / Fallback) */}
              <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-4 border border-outline-variant/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      Installed • Fallback Active
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface text-[11px] font-medium">
                      Ultra-Low Power
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant text-xs">
                    <span>
                      Disk: <strong className="text-on-surface font-mono">240 MB</strong>
                    </span>
                    <span>•</span>
                    <span>
                      RAM: <strong className="text-on-surface font-mono">380 MB</strong>
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-on-surface font-serif">
                    SmolLM-360M Extreme Compact
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Low-footprint safety net. Operates flawlessly on ultra-low battery modes (&lt;15% charge)
                    for rapid phrase interpretation, translation cues, and urgent satellite SOS encoding.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                  <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-semibold">
                    <BatteryCharging className="w-4 h-4 text-emerald-600" />
                    <span>Runs on 0.1W GPU Budget</span>
                  </div>
                  <button
                    onClick={() => showToast("Fallback trigger set to auto-engage at <15% battery.")}
                    className="px-3.5 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-medium transition-colors"
                  >
                    Configure Fallback Triggers
                  </button>
                </div>
              </div>

              {/* Terrain Context Card */}
              <div className="p-5 rounded-xl bg-surface-container flex flex-col sm:flex-row items-center gap-4 border border-outline-variant/30">
                <div className="w-full sm:w-44 h-28 rounded-lg overflow-hidden shrink-0 shadow-sm relative">
                  <Image
                    src="/images/stitch/model-setup-alpine-pass.jpg"
                    alt="Tateyama Alpine Pass"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-on-surface font-serif">
                      Field Note: Tateyama Alpine Sector
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    When trekking past Murodo Plateau (2,450m), cell tower handoffs fail completely.
                    Gemma-2B INT4 maintains immediate topographical guidance and trail rescue queries without
                    network drops.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Benchmark Suite & Security (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Live Benchmark Suite Card */}
              <div className="p-6 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-4 border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <h2 className="text-lg text-on-surface font-bold font-serif">
                      NPU Stress Benchmark
                    </h2>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold">
                    {benchmarking ? "Executing..." : "Idle (Ready)"}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Validates FP16 shader matrix multiplication, TTFT latency, and thermal stability
                  directly on this client&apos;s hardware.
                </p>

                {/* Prompt Box */}
                <div className="p-3.5 rounded-lg bg-surface-container-low flex flex-col gap-1 border border-outline-variant/20">
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                    <span className="uppercase tracking-wider font-semibold">Target Expedition Prompt</span>
                    <span className="font-mono">512 Tokens Context</span>
                  </div>
                  <p className="text-xs text-on-surface italic mt-0.5 leading-relaxed">
                    &ldquo;Synthesize 3-day emergency shelter route in Tateyama Kurobe under severe snowfall alert,
                    calculating calorie requirements and water boil points.&rdquo;
                  </p>
                </div>

                {/* Live Progress / Output */}
                <div className="p-4 rounded-xl bg-primary text-white flex flex-col gap-3 shadow-inner">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-secondary-fixed uppercase tracking-wider font-semibold text-[10px]">
                      Active Execution Telemetry
                    </span>
                    <span className="text-white/80 font-mono text-[11px]">
                      {benchmarking ? "Burn-in in progress..." : "Standard Benchmark"}
                    </span>
                  </div>

                  {/* Real-time SVG Sparkline */}
                  <div className="w-full h-16 flex items-end">
                    <svg
                      className="w-full h-full text-secondary-fixed"
                      fill="none"
                      preserveAspectRatio="none"
                      viewBox="0 0 300 60"
                    >
                      <path
                        d="M 0,50 Q 30,20 60,35 T 120,15 T 180,28 T 240,10 T 300,12"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="3"
                      />
                      <path
                        d="M 0,50 Q 30,20 60,35 T 120,15 T 180,28 T 240,10 T 300,12 L 300,60 L 0,60 Z"
                        fill="currentColor"
                        fillOpacity="0.15"
                      />
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/20">
                    <div>
                      <span className="text-[10px] text-white/70 block uppercase">Prefill TTFT</span>
                      <span className="text-xl font-bold font-mono text-white">42 ms</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/70 block uppercase">Decode Speed</span>
                      <span className="text-xl font-bold font-mono text-white">52.4 tok/s</span>
                    </div>
                  </div>
                </div>

                {/* Diagnostic Checklist */}
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-outline-variant/20">
                    <span className="flex items-center gap-1.5 text-on-surface">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      WebGPU Matrix F16 Extension
                    </span>
                    <span className="font-semibold text-primary">Supported</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-outline-variant/20">
                    <span className="flex items-center gap-1.5 text-on-surface">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      FP16 Shader Precision
                    </span>
                    <span className="font-semibold text-primary">Zero Truncation</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-outline-variant/20">
                    <span className="flex items-center gap-1.5 text-on-surface">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      IndexedDB Weight Cache
                    </span>
                    <span className="font-semibold text-primary font-mono">1,452 MB Intact</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1.5">
                    <span className="flex items-center gap-1.5 text-on-surface">
                      <Thermometer className="w-4 h-4 text-primary" />
                      Thermal Load & Drain
                    </span>
                    <span className="font-semibold text-emerald-700">Nominal (&lt;32°C)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
