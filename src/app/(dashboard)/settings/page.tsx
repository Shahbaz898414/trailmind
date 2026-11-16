"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Battery,
  CheckCircle2,
  Cpu,
  Database,
  Eye,
  HardDrive,
  HeartPulse,
  Key,
  Lock,
  Moon,
  Radio,
  RefreshCw,
  Save,
  ShieldCheck,
  Sliders,
  Sun,
  User,
  Zap,
} from "lucide-react";

export default function SettingsPage() {
  const [highContrast, setHighContrast] = useState(true);
  const [coldBatterySaver, setColdBatterySaver] = useState(false);
  const [autoPrune, setAutoPrune] = useState(false);
  const [satelliteCadence, setSatelliteCadence] = useState("hourly");
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="w-full min-h-screen bg-surface">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 text-xs font-semibold">
          <CheckCircle2 className="size-4 text-emerald-300" />
          <span>Preferences synchronized to local hardware keystore</span>
        </div>
      )}

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
        {/* Header Block & Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
          <div className="flex flex-col gap-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-on-surface-variant">
              <span>Settings & Governance</span>
              <span>/</span>
              <span className="text-primary font-bold">General System Preferences</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-primary tracking-tight">
              System Preferences
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Display ergonomics, offline storage partitioning, satellite ephemeris auto-sync cadence, and zero-knowledge cryptographic vault management.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Save className="size-4" />
              <span>Save All Changes</span>
            </button>
          </div>
        </div>

        {/* Sub-System Module Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/settings/profile"
            className="p-5 rounded-2xl bg-white border border-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-secondary">USER DIRECTIVES</span>
              <User className="size-5 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-primary">Profile & Emergency ICE</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Medical kanji, next of kin, and bio passkeys.</p>
            </div>
            <span className="text-xs text-primary font-bold flex items-center gap-1">Open Profile →</span>
          </Link>

          <Link
            href="/settings/ai"
            className="p-5 rounded-2xl bg-white border border-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-secondary">NEURAL CORE</span>
              <Cpu className="size-5 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-primary">Edge AI Performance</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">WebGPU shaders, INT4 quantization, and quotas.</p>
            </div>
            <span className="text-xs text-primary font-bold flex items-center gap-1">Configure AI →</span>
          </Link>

          <Link
            href="/settings/model-setup"
            className="p-5 rounded-2xl bg-white border border-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-secondary">BENCHMARKING</span>
              <HardDrive className="size-5 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-primary">On-Device Model Setup</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Apple Neural Engine calibration and thermal checks.</p>
            </div>
            <span className="text-xs text-primary font-bold flex items-center gap-1">Run Benchmark →</span>
          </Link>

          <Link
            href="/settings/hardware"
            className="p-5 rounded-2xl bg-white border border-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-secondary">HARDWARE LINK</span>
              <Radio className="size-5 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-primary">Field Hardware Hub</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Garmin inReach, LoRa 915 MHz, and SOS interlock.</p>
            </div>
            <span className="text-xs text-primary font-bold flex items-center gap-1">Manage Mesh →</span>
          </Link>
        </div>

        {/* General Settings Form Sections */}
        <div className="flex flex-col gap-6">
          {/* Display & Field Ergonomics */}
          <div className="p-6 rounded-2xl bg-white border border-border shadow-sm flex flex-col gap-4">
            <h2 className="font-heading font-bold text-lg text-primary">Display & Field Ergonomics</h2>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low">
                <div>
                  <h4 className="font-semibold text-xs text-primary">High-Contrast Sunlight & Night Mode</h4>
                  <p className="text-[11px] text-on-surface-variant">Boosts UI luminance for direct alpine solar glare and deep forest shade.</p>
                </div>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="size-5 rounded text-primary accent-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low">
                <div>
                  <h4 className="font-semibold text-xs text-primary">Sub-Zero Battery Preservation Throttle</h4>
                  <p className="text-[11px] text-on-surface-variant">Throttles background display frame rate under 0°C to preserve lithium voltage.</p>
                </div>
                <input
                  type="checkbox"
                  checked={coldBatterySaver}
                  onChange={(e) => setColdBatterySaver(e.target.checked)}
                  className="size-5 rounded text-primary accent-primary cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Storage & Satellite Cadence */}
          <div className="p-6 rounded-2xl bg-white border border-border shadow-sm flex flex-col gap-4">
            <h2 className="font-heading font-bold text-lg text-primary">Satellite Mesh & Storage Directives</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface">Satellite Telemetry Heartbeat Cadence</label>
                <select
                  value={satelliteCadence}
                  onChange={(e) => setSatelliteCadence(e.target.value)}
                  className="w-full bg-surface-container-low px-3.5 py-2.5 rounded-xl border border-border text-xs"
                >
                  <option value="10min">Every 10 Minutes (High Precision Expedition)</option>
                  <option value="hourly">Hourly Pulse (Recommended Balance)</option>
                  <option value="manual">Manual SOS & Burst Broadcast Only</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface">Cache Preservation Protocol</label>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-border">
                  <span className="text-xs text-on-surface-variant">Prevent browser evictions (Persistent Storage API)</span>
                  <span className="font-mono text-xs font-bold text-emerald-700">PERSISTED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
