"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  RefreshCw,
  Gauge,
  Cpu,
  Zap,
  Layers,
  Thermometer,
  TrendingUp,
  Radio,
  WifiOff,
  Cloud,
  CheckCircle2,
  Brain,
  Mic,
  Sparkles,
  Database,
  Search,
  BookOpen,
  Sliders,
  Check,
  RotateCcw,
} from "lucide-react";

export default function AiInferenceSettingsPage() {
  const [inferenceMode, setInferenceMode] = useState<"hybrid" | "airgap" | "cloud">("hybrid");
  const [fp16Enabled, setFp16Enabled] = useState(true);
  const [benchmarking, setBenchmarking] = useState(false);
  const [latency, setLatency] = useState(11.8);
  const [reindexing, setReindexing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleBenchmark = () => {
    setBenchmarking(true);
    setTimeout(() => {
      setBenchmarking(false);
      setLatency(9.4);
      showToast("Live NPU Benchmark complete: 142 tokens/sec, 9.4 ms/token.");
    }, 2000);
  };

  const handleReindex = () => {
    setReindexing(true);
    setTimeout(() => {
      setReindexing(false);
      showToast("HNSW local vector knowledge base re-indexed (1,420 chunks in 120ms).");
    }, 1500);
  };

  return (
    <div className="w-full bg-surface min-h-screen">
      <div className="flex flex-col w-full">
        <div className="px-4 md:px-8 py-6 flex flex-col gap-6 max-w-[1400px] mx-auto w-full">
          {/* Breadcrumb & Page Heading */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <nav className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <Link
                  href="/settings"
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Settings & Governance
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-outline" />
                <span className="text-primary font-bold">
                  AI Inference & Edge Model Performance
                </span>
              </nav>
              <h1 className="text-3xl font-extrabold text-on-surface tracking-tight font-serif">
                AI Inference & Edge Model Performance
              </h1>
              <p className="text-sm text-on-surface-variant max-w-3xl">
                Hardware acceleration (WebGPU / Apple Neural Engine), local quantized model
                allocations, RAG vector indexing, and hybrid fallback thresholds.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => showToast("Local weight cache verified. All hashes match.")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary text-xs font-semibold shadow-sm transition-all active:scale-[0.98] border border-outline-variant/30"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Model Weights Cache</span>
              </button>
              <button
                onClick={handleBenchmark}
                disabled={benchmarking}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white hover:bg-primary-container text-xs font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-60"
              >
                <Gauge className={`w-3.5 h-3.5 ${benchmarking ? "animate-spin" : ""}`} />
                <span>{benchmarking ? "Benchmarking Neural Engine..." : "Run Live NPU Benchmark"}</span>
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

          {/* Telemetry HUD Bar (4 Status Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* HUD Card 1 */}
            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/30">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    Active Local Engine
                  </span>
                  <span className="text-lg text-on-surface font-bold mt-1 font-serif">
                    Gemma-2B INT4
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-primary">
                  <Cpu className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-on-surface-variant">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Quantized GGUF/Wasm</span>
                </div>
                <span className="bg-surface-container-high px-2 py-0.5 rounded text-on-surface font-mono text-[10px]">
                  v2.4-e
                </span>
              </div>
            </div>

            {/* HUD Card 2 */}
            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/30">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    Inference Latency
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl text-on-surface font-bold tracking-tight font-mono">
                      {latency}
                    </span>
                    <span className="text-xs text-on-surface-variant">ms / token</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">Apple M-series / WebGPU</span>
                <div className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+38% vs CPU</span>
                </div>
              </div>
            </div>

            {/* HUD Card 3 */}
            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/30">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    Edge Memory Footprint
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl text-on-surface font-bold tracking-tight font-mono">
                      1.84
                    </span>
                    <span className="text-xs text-on-surface-variant">/ 8.00 GB Pool</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-primary">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-1.5">
                <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: "23%" }} />
                </div>
                <div className="flex justify-between items-center text-[10px] text-on-surface-variant">
                  <span>23% WebGPU Allocation</span>
                  <span className="text-on-surface font-medium">6.16 GB Headroom</span>
                </div>
              </div>
            </div>

            {/* HUD Card 4 */}
            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/30">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    Thermal Budget
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl text-emerald-700 font-bold tracking-tight font-serif">
                      Safe
                    </span>
                    <span className="text-xs text-on-surface-variant font-mono">(30.8°C)</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-emerald-800">
                  <Thermometer className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Zero Throttling</span>
                </div>
                <span className="text-on-surface-variant text-[11px] font-mono">Power: 2.1W Peak</span>
              </div>
            </div>
          </div>

          {/* Main Settings 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Engine Strategy & Model Weights (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Section 1: Inference Execution Mode */}
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-4 border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-primary" />
                    <h2 className="text-lg text-on-surface font-bold font-serif">
                      Inference Execution Mode
                    </h2>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-semibold">
                    Dynamic Auto-Switch
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Defines routing behavior between offline edge weights and high-density cloud multi-agent
                  clusters during fieldwork.
                </p>

                {/* Radio Cards */}
                <div className="flex flex-col gap-3 mt-1">
                  {/* Option 1: Hybrid */}
                  <label
                    onClick={() => setInferenceMode("hybrid")}
                    className={`relative flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all border ${
                      inferenceMode === "hybrid"
                        ? "bg-secondary-fixed/20 border-primary shadow-sm"
                        : "bg-surface-container-low border-transparent hover:bg-surface-container"
                    }`}
                  >
                    <input
                      type="radio"
                      name="inference_mode"
                      value="hybrid"
                      checked={inferenceMode === "hybrid"}
                      onChange={() => setInferenceMode("hybrid")}
                      className="mt-1 text-primary focus:ring-0 w-4 h-4 accent-primary"
                    />
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-on-surface font-bold">
                          Hybrid Adaptive (Recommended)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-white font-bold">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        Uses on-device Gemma-2B for zero-signal offline trails, bursts to Gemini 1.5 Pro
                        when 5G/Wi-Fi is detected for complex multi-lingual historical deep-dives.
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <WifiOff className="w-3 h-3 text-emerald-700" /> Local priority
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Cloud className="w-3 h-3 text-primary" /> Cloud burst
                        </span>
                      </div>
                    </div>
                  </label>

                  {/* Option 2: Air-Gapped */}
                  <label
                    onClick={() => setInferenceMode("airgap")}
                    className={`relative flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all border ${
                      inferenceMode === "airgap"
                        ? "bg-secondary-fixed/20 border-primary shadow-sm"
                        : "bg-surface-container-low border-transparent hover:bg-surface-container"
                    }`}
                  >
                    <input
                      type="radio"
                      name="inference_mode"
                      value="airgap"
                      checked={inferenceMode === "airgap"}
                      onChange={() => setInferenceMode("airgap")}
                      className="mt-1 text-primary focus:ring-0 w-4 h-4 accent-primary"
                    />
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-on-surface font-bold">
                          Strict Air-Gapped / Offline Only
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                          Zero Egress
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        Forces 100% on-device processing. Zero data packets dispatched over any network.
                        Maximum battery conservation and zero cloud exposure.
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1 text-amber-700">
                          Maximum isolation
                        </span>
                        <span>•</span>
                        <span>Battery drain: -42%</span>
                      </div>
                    </div>
                  </label>

                  {/* Option 3: Cloud Priority */}
                  <label
                    onClick={() => setInferenceMode("cloud")}
                    className={`relative flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all border ${
                      inferenceMode === "cloud"
                        ? "bg-secondary-fixed/20 border-primary shadow-sm"
                        : "bg-surface-container-low border-transparent hover:bg-surface-container"
                    }`}
                  >
                    <input
                      type="radio"
                      name="inference_mode"
                      value="cloud"
                      checked={inferenceMode === "cloud"}
                      onChange={() => setInferenceMode("cloud")}
                      className="mt-1 text-primary focus:ring-0 w-4 h-4 accent-primary"
                    />
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-on-surface font-bold">
                          Cloud Priority (When Available)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                          High Precision
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        Maximizes reasoning depth whenever a cell or satellite broadband connection is
                        present. Fallbacks to edge weights only in signal dead zones.
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1 text-primary">
                          Full context reasoning (1M tokens)
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Section 2: Local Model Roster & Quota Management */}
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-4 border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    <h2 className="text-lg text-on-surface font-bold font-serif">
                      Local Model Roster & Quota Management
                    </h2>
                  </div>
                  <span className="text-xs text-on-surface-variant font-mono">
                    1.70 GB Total Loaded
                  </span>
                </div>

                {/* Model List */}
                <div className="flex flex-col gap-3">
                  {/* Model 1 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-surface-container-low gap-3 border border-outline-variant/20">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                        <Brain className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-on-surface">
                            Gemma-2B-Instruct INT4
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-primary text-white font-medium">
                            Active (Default Reasoner)
                          </span>
                        </div>
                        <span className="text-[11px] text-on-surface-variant mt-0.5">
                          Primary offline conversational guide, botanical ID, trail routing logic
                        </span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0 pl-11 sm:pl-0">
                      <span className="text-xs font-semibold text-on-surface font-mono">1.42 GB</span>
                      <span className="text-[10px] text-emerald-700 flex items-center gap-0.5 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    </div>
                  </div>

                  {/* Model 2 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-surface-container-low gap-3 border border-outline-variant/20">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-primary shrink-0 mt-0.5">
                        <Mic className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-on-surface">
                            Kokoro-82M TTS (Field Voice)
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-medium">
                            Loaded
                          </span>
                        </div>
                        <span className="text-[11px] text-on-surface-variant mt-0.5">
                          Japanese & English dialect speech synthesis, zero network audio latency
                        </span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0 pl-11 sm:pl-0">
                      <span className="text-xs font-semibold text-on-surface font-mono">184 MB</span>
                      <span className="text-[10px] text-emerald-700 flex items-center gap-0.5 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    </div>
                  </div>

                  {/* Model 3 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-surface-container-low gap-3 border border-outline-variant/20">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-on-surface">
                            MiniLM-L6 Spatial Vector Embeddings
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-primary text-white font-medium">
                            Active
                          </span>
                        </div>
                        <span className="text-[11px] text-on-surface-variant mt-0.5">
                          Local RAG embeddings for 48,000 trail POIs, hazard bulletins, rules
                        </span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0 pl-11 sm:pl-0">
                      <span className="text-xs font-semibold text-on-surface font-mono">92 MB</span>
                      <span className="text-[10px] text-emerald-700 flex items-center gap-0.5 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                  <button
                    onClick={() => showToast("Checking HuggingFace edge repo: all model weights are up-to-date.")}
                    className="flex items-center gap-1.5 text-primary text-xs font-semibold hover:underline"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Check for Quantized Weight Updates</span>
                  </button>
                  <Link
                    href="/settings/model-setup"
                    className="text-xs font-bold text-primary hover:text-primary-container"
                  >
                    Setup New Model →
                  </Link>
                </div>
              </div>

              {/* Section 3: WebGPU Compute Pipeline Tuning */}
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-4 border border-outline-variant/30">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-primary" />
                  <h2 className="text-lg text-on-surface font-bold font-serif">
                    WebGPU Compute Pipeline Tuning
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-1 border border-outline-variant/20">
                    <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                      Shader Workgroup Size
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-bold text-on-surface">
                        128 threads / SIMD group
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-medium">
                        Auto-Tuned
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                      Optimized for unified memory throughput across Apple Neural Engine & Vulkan backend.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-1 justify-between border border-outline-variant/20">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                        FP16 Half-Precision Math
                      </span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-bold text-on-surface">FP16 Acceleration</span>
                        <button
                          type="button"
                          onClick={() => setFp16Enabled(!fp16Enabled)}
                          className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                            fp16Enabled ? "bg-primary" : "bg-outline-variant"
                          }`}
                        >
                          <span
                            className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                              fp16Enabled ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                      Saves 46% VRAM and boosts matrix multiply by 1.8x with zero perceptual perplexity loss.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-low flex items-center justify-between border border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <Cpu className="w-5 h-5 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-on-surface">
                        Metal Performance Shaders / WebGPU Adapter
                      </span>
                      <span className="text-[11px] text-on-surface-variant">
                        Device ID: 0x6440 • Apple M3 Pro GPU (18 cores allocated)
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold">
                    Active Pipeline
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: RAG, Vector Store & Fallback Rules (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Section 1: Local Vector Knowledge Base (Edge RAG) */}
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-4 border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <h2 className="text-lg text-on-surface font-bold font-serif">
                      Local Vector Knowledge Base
                    </h2>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary text-white font-bold">
                    Edge RAG
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Zero-network semantic context retrieval directly from compressed high-density SQLite
                  vector databases stored on field memory.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-surface-container-low flex flex-col border border-outline-variant/20">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                      Indexed Documents
                    </span>
                    <span className="text-xl text-on-surface font-bold mt-1 font-serif">
                      1,420 <span className="text-xs text-on-surface-variant font-normal">chunks</span>
                    </span>
                    <span className="text-[10px] text-on-surface-variant mt-1 truncate">
                      Kumano Kodo, ryokan, trains
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low flex flex-col border border-outline-variant/20">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                      Search Latency
                    </span>
                    <span className="text-xl text-emerald-700 font-bold mt-1 font-mono">
                      2.1 <span className="text-xs text-on-surface-variant font-normal">ms</span>
                    </span>
                    <span className="text-[10px] text-on-surface-variant mt-1">
                      HNSW SQLite vector index
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                  <span className="text-xs font-bold text-on-surface">
                    Embedded Offline Dossiers:
                  </span>
                  <ul className="text-xs text-on-surface-variant flex flex-col gap-1.5 list-none pl-0">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Kyoto Higashiyama Cultural Etiquette (840 KB)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Alpine Wilderness Hypothermia Protocols (420 KB)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Emergency Japanese Railway Schedule 2026 (1.2 MB)</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleReindex}
                  disabled={reindexing}
                  className="w-full py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Search className={`w-3.5 h-3.5 ${reindexing ? "animate-spin" : ""}`} />
                  <span>{reindexing ? "Re-indexing Local Vector Store..." : "Re-index Local Vector Store"}</span>
                </button>
              </div>

              {/* Section 2: Hybrid Inference Handshake & Network Fallback */}
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-4 border border-outline-variant/30">
                <div className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-primary" />
                  <h2 className="text-lg text-on-surface font-bold font-serif">
                    Network Fallback Handshake
                  </h2>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
                    <div>
                      <div className="font-bold text-on-surface">Cellular RSRP Cutoff Threshold</div>
                      <div className="text-[11px] text-on-surface-variant">Switch to edge below -108 dBm</div>
                    </div>
                    <span className="font-mono font-bold text-primary bg-surface-container px-2 py-0.5 rounded">
                      -108 dBm
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
                    <div>
                      <div className="font-bold text-on-surface">Cloud Burst Timeout</div>
                      <div className="text-[11px] text-on-surface-variant">Fallback to local if no reply in 3.5s</div>
                    </div>
                    <span className="font-mono font-bold text-primary bg-surface-container px-2 py-0.5 rounded">
                      3,500 ms
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
                    <div>
                      <div className="font-bold text-on-surface">Satellite Telemetry Compression</div>
                      <div className="text-[11px] text-on-surface-variant">Brotli 11-level byte packing</div>
                    </div>
                    <span className="font-bold text-emerald-700 bg-secondary-fixed/50 px-2 py-0.5 rounded text-[11px]">
                      Enabled
                    </span>
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
