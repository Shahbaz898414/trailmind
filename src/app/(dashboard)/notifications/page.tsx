"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  CheckCheck,
  SlidersHorizontal,
  Shield,
  Satellite,
  Eye,
  Layers,
  BatteryMedium,
  Wind,
  CloudSync,
  Radio,
  CheckCircle2,
  Bell,
  Clock,
  Terminal,
  Download,
  AlertTriangle,
  X,
  Bed,
  Battery,
  AlertCircle,
  Watch,
  Smartphone,
  MessageSquare,
  Lock,
} from "lucide-react";

interface AlertItem {
  id: string;
  category: "critical" | "weather" | "storage" | "mesh" | "state";
  title: string;
  description: string;
  timestamp: string;
  packetId?: string;
  telemetry: {
    device: string;
    detail1: string;
    detail2: string;
  };
  read: boolean;
  borderClass: string;
  badgeBg: string;
  badgeText: string;
  badgeLabel: string;
}

const initialAlerts: AlertItem[] = [
  {
    id: "alert-1",
    category: "critical",
    title: "Iridium Burst Ping Acknowledged: Otowa Pass Bivouac",
    description:
      "Packet ID #IRID-9821 successfully acknowledged by Basecamp Relay. Coordinates 34.4210° N, 135.8821° E locked. Watchdog window refreshed to 120 minutes.",
    timestamp: "6 mins ago",
    packetId: "#IRID-9821",
    telemetry: {
      device: "Garmin inReach Mini 2",
      detail1: "Latency 4.2s",
      detail2: "Payload 32B",
    },
    read: false,
    borderClass: "bg-error",
    badgeBg: "bg-rose-100",
    badgeText: "text-rose-800",
    badgeLabel: "Critical • Satellite",
  },
  {
    id: "alert-2",
    category: "weather",
    title: "Barometric Drop Detected (-3.2 hPa / 2h): Omine Ridge High Pass",
    description:
      "On-device sensor fusion flags rapid pressure gradient drop. High likelihood of sudden squall and localized precipitation window at 17:45 JST. Omine exposed knife-edge gale advisory active.",
    timestamp: "24 mins ago",
    packetId: "-3.2 hPa / 2h",
    telemetry: {
      device: "Local Barometer BMP390",
      detail1: "Current: 884.1 hPa",
      detail2: "Gale Est: 45 kt",
    },
    read: false,
    borderClass: "bg-amber-500",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-900",
    badgeLabel: "High • Weather Alert",
  },
  {
    id: "alert-3",
    category: "storage",
    title: "Kumano Sector Topo DEM Cache Update Available",
    description:
      "Forestry agency published updated 5m contour lidar pack for Nachi Falls & Koguchi valley (42 MB delta). Cached offline tiles valid until 48h before forced expiration.",
    timestamp: "2 hours ago",
    packetId: "OPFS Bucket #2",
    telemetry: {
      device: "OPFS Cache Storage",
      detail1: "Delta: 42 MB",
      detail2: "Requires 30s High-Bandwidth",
    },
    read: false,
    borderClass: "bg-emerald-600",
    badgeBg: "bg-secondary-fixed",
    badgeText: "text-primary",
    badgeLabel: "Warning • Storage & DEM",
  },
  {
    id: "alert-4",
    category: "mesh",
    title: "TrailMind LoRa Relay #04 Peer Handshake Established",
    description:
      "4th ad-hoc node joined expedition mesh network on sub-GHz ISM band. Signal RSSI -84 dBm, SNR +7 dB. Relay coverage extended +3.4 km towards North Col.",
    timestamp: "3 hours ago",
    packetId: "LoRa P2P 915 MHz",
    telemetry: {
      device: "SX1262 Transceiver",
      detail1: "Spread Factor SF10",
      detail2: "Zero Packet Loss",
    },
    read: true,
    borderClass: "bg-primary",
    badgeBg: "bg-primary/10",
    badgeText: "text-primary",
    badgeLabel: "Info • Mesh Topology",
  },
  {
    id: "alert-5",
    category: "state",
    title: "Two-Way CRDT Schedule Sync Complete",
    description:
      "Merged 3 waypoint adjustments and bivouac arrival timestamp with offline secure vault. Zero state conflicts detected across multi-device replica sets.",
    timestamp: "Yesterday 19:12 JST",
    packetId: "CRDT Merged",
    telemetry: {
      device: "SQLite Local Vault #01",
      detail1: "Commit: #8f921a",
      detail2: "Audited & Sealed",
    },
    read: true,
    borderClass: "bg-outline-variant",
    badgeBg: "bg-surface-container",
    badgeText: "text-on-surface-variant",
    badgeLabel: "Resolved • State Engine",
  },
];

export default function NotificationsCenterPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [quietHours, setQuietHours] = useState(true);
  const [batteryConservation, setBatteryConservation] = useState(true);
  const [fallDetection, setFallDetection] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    showToast("All 5 expedition alerts marked as read.");
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    showToast("Alert dismissed.");
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab === "all") return true;
    if (activeTab === "satellite") return alert.category === "critical" || alert.category === "mesh";
    if (activeTab === "weather") return alert.category === "weather";
    if (activeTab === "storage") return alert.category === "storage" || alert.category === "state";
    return true;
  });

  return (
    <div className="w-full bg-surface min-h-screen">
      <div className="flex flex-col w-full">
        <div className="px-4 lg:px-8 py-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
          {/* Top Context & Header Row */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-on-surface-variant text-xs tracking-wider uppercase font-mono">
              <Link href="/settings" className="hover:text-primary transition-colors">
                Settings & Governance
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-primary font-bold">Expedition Notifications & Satellite Alerts</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-1">
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-extrabold text-primary tracking-tight font-serif flex items-center gap-3 flex-wrap">
                  <span>Expedition Notifications & Satellite Alerts</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5 animate-ping" />
                    2 Critical Dispatches
                  </span>
                </h1>
                <p className="text-sm text-on-surface-variant max-w-3xl">
                  Priority telemetry, low-power satellite dispatch queues, hardware watchdog alarms, and
                  offline cache invalidation logs across active field nodes.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  onClick={markAllRead}
                  className="px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 border border-outline-variant/30"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark All Read</span>
                </button>
                <button
                  onClick={() => showToast("Severity filter active: Showing all unmasked priorities.")}
                  className="px-3.5 py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm border border-outline-variant/30"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filter by Severity</span>
                </button>
                <Link
                  href="/settings/hardware"
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-container text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Configure Alert Rules</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Toast Notification */}
          {toastMsg && (
            <div className="p-3 bg-secondary-fixed/50 border border-primary/20 rounded-xl flex items-center gap-3 text-primary text-sm font-medium animate-in fade-in slide-in-from-top duration-200">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* Telemetry Stat Strip (4 Metric Tiles) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stat 1 */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between gap-2 relative overflow-hidden group hover:shadow-md transition-shadow border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold">
                  Critical Dispatches
                </span>
                <span className="p-1.5 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
                  <Satellite className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-on-surface font-mono">2</span>
                <span className="text-xs text-rose-600 font-semibold">Pending / Acked</span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant text-[11px] pt-1 border-t border-outline-variant/20">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> Garmin inReach Mesh
                </span>
                <span className="text-primary font-mono font-medium">99.8% Uplink</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between gap-2 relative overflow-hidden group hover:shadow-md transition-shadow border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold">
                  Emergency Watch
                </span>
                <span className="p-1.5 rounded-lg bg-secondary-fixed text-primary flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-primary font-serif">Armed</span>
                <span className="text-xs text-on-surface-variant">Watchdog 120m</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden mt-1">
                <div className="bg-primary h-full rounded-full transition-all" style={{ width: "74%" }} />
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between gap-2 relative overflow-hidden group hover:shadow-md transition-shadow border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold">
                  Cache Invalidation
                </span>
                <span className="p-1.5 rounded-lg bg-secondary-fixed text-primary flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-on-surface font-mono">1 Sector</span>
                <span className="text-xs text-amber-700 font-semibold">Exp. in 48h</span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant text-[11px] pt-1 border-t border-outline-variant/20">
                <span className="truncate">Kumano High Ridge DEM</span>
                <span className="bg-surface-container-high text-on-surface px-1.5 py-0.2 rounded font-mono text-[10px]">
                  42 MB
                </span>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between gap-2 relative overflow-hidden group hover:shadow-md transition-shadow border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold">
                  Battery & Thermal
                </span>
                <span className="p-1.5 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                  <BatteryMedium className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-primary font-serif">0 Active</span>
                <span className="text-xs text-emerald-700 font-medium font-mono">Nominal 31°C</span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant text-[11px] pt-1 border-t border-outline-variant/20">
                <span>Core: 84% • Bivouac: OK</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Main Content Area: Split View (8 cols / 4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Filter Tabs + Notification Feed (8 Cols) */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {/* Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap shadow-sm flex items-center gap-1.5 font-semibold transition-all ${
                    activeTab === "all"
                      ? "bg-primary text-white"
                      : "bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant border border-outline-variant/30"
                  }`}
                >
                  <span>All Alerts</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      activeTab === "all" ? "bg-white/20 text-white" : "bg-surface-container text-on-surface"
                    }`}
                  >
                    {alerts.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("satellite")}
                  className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap shadow-sm flex items-center gap-1.5 font-semibold transition-all ${
                    activeTab === "satellite"
                      ? "bg-primary text-white"
                      : "bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant border border-outline-variant/30"
                  }`}
                >
                  <span>Satellite & Mesh</span>
                </button>
                <button
                  onClick={() => setActiveTab("weather")}
                  className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap shadow-sm flex items-center gap-1.5 font-semibold transition-all ${
                    activeTab === "weather"
                      ? "bg-primary text-white"
                      : "bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant border border-outline-variant/30"
                  }`}
                >
                  <span>Weather Advisories</span>
                </button>
                <button
                  onClick={() => setActiveTab("storage")}
                  className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap shadow-sm flex items-center gap-1.5 font-semibold transition-all ${
                    activeTab === "storage"
                      ? "bg-primary text-white"
                      : "bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant border border-outline-variant/30"
                  }`}
                >
                  <span>Storage & State</span>
                </button>
              </div>

              {/* Alerts List */}
              <div className="flex flex-col gap-3">
                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`bg-surface-container-lowest rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 relative overflow-hidden border border-outline-variant/30 ${
                      alert.read ? "opacity-80" : ""
                    }`}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${alert.borderClass}`} />
                    <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-surface-container shrink-0 shadow-sm mt-0.5 text-primary">
                          {alert.category === "critical" && <Satellite className="w-5 h-5 text-rose-600" />}
                          {alert.category === "weather" && <Wind className="w-5 h-5 text-amber-600" />}
                          {alert.category === "storage" && <CloudSync className="w-5 h-5 text-emerald-600" />}
                          {alert.category === "mesh" && <Radio className="w-5 h-5 text-primary" />}
                          {alert.category === "state" && <CheckCircle2 className="w-5 h-5 text-on-surface-variant" />}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-full ${alert.badgeBg} ${alert.badgeText} text-[11px] font-bold tracking-wider uppercase`}
                            >
                              {alert.badgeLabel}
                            </span>
                            {alert.packetId && (
                              <span className="text-[11px] text-on-surface-variant font-mono">
                                ID: {alert.packetId}
                              </span>
                            )}
                          </div>
                          <h2 className="text-base font-bold text-on-surface mt-1 tracking-tight font-serif">
                            {alert.title}
                          </h2>
                        </div>
                      </div>
                      <span className="text-xs text-on-surface-variant whitespace-nowrap bg-surface-container-low px-2 py-1 rounded-md font-mono">
                        {alert.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-on-surface-variant ml-0 sm:ml-12 leading-relaxed">
                      {alert.description}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 ml-0 sm:ml-12 border-t border-outline-variant/20">
                      <div className="flex items-center gap-2 text-on-surface-variant text-[11px] flex-wrap font-mono">
                        <span className="font-medium text-on-surface">{alert.telemetry.device}</span>
                        <span>•</span>
                        <span>{alert.telemetry.detail1}</span>
                        <span>•</span>
                        <span>{alert.telemetry.detail2}</span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => showToast(`Inspect Raw Hex: Payload 0x4B92... verified.`)}
                          className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-mono transition-colors flex items-center gap-1"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                          <span>Raw Hex</span>
                        </button>
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="px-2.5 py-1 rounded-lg bg-surface-container-lowest hover:bg-rose-50 hover:text-rose-700 text-on-surface-variant text-xs transition-colors border border-outline-variant/30"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* In-Field Telemetry Mini-Log footer */}
              <div className="p-3.5 rounded-xl bg-surface-container flex items-center justify-between gap-4 text-on-surface-variant border border-outline-variant/30">
                <div className="flex items-center gap-2 text-xs">
                  <Radio className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-on-surface">
                    Telemetry Buffer: 1,420 events cached locally. Real-time satellite relay polling every 60s.
                  </span>
                </div>
                <span className="font-mono text-xs text-primary uppercase font-bold tracking-widest shrink-0">
                  CRC-32 OK
                </span>
              </div>
            </div>

            {/* Right Column: Escalation Hierarchy & Controls Rail (4 Cols) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Satellite Escalation Hierarchy Card */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-4 border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-primary text-white flex items-center justify-center">
                      <Shield className="w-4 h-4" />
                    </span>
                    <h3 className="text-lg font-bold text-primary font-serif">Escalation Ladder</h3>
                  </div>
                  <span className="text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md font-mono">
                    POL-SAR-09
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Automated dispatcher failsafe when telemetry heartbeat goes silent past the programmed
                  deadline.
                </p>

                {/* Ladder Visual */}
                <div className="flex flex-col gap-3 relative pl-6 border-l-2 border-outline-variant/40 my-1">
                  {/* Tier 1 */}
                  <div className="relative flex flex-col gap-1 pb-2">
                    <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-rose-600 border-2 border-white shadow-sm flex items-center justify-center text-[9px] text-white font-bold">
                      1
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-rose-700 font-bold uppercase tracking-wider">
                        Priority 1 • SAR SOS
                      </span>
                      <span className="font-mono text-[10px] text-on-surface-variant">T + 120m</span>
                    </div>
                    <p className="text-xs text-on-surface font-medium leading-tight">
                      Iridium Satellite Distress burst to Prefectural Police Mountain SAR Relay.
                    </p>
                  </div>

                  {/* Tier 2 */}
                  <div className="relative flex flex-col gap-1 pb-2">
                    <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-sm flex items-center justify-center text-[9px] text-white font-bold">
                      2
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-amber-800 font-bold uppercase tracking-wider">
                        Priority 2 • Basecamp
                      </span>
                      <span className="font-mono text-[10px] text-on-surface-variant">T + 60m</span>
                    </div>
                    <p className="text-xs text-on-surface font-medium leading-tight">
                      LoRa Peer Ping broadcast across high-gain valley relay towers.
                    </p>
                  </div>

                  {/* Tier 3 */}
                  <div className="relative flex flex-col gap-1">
                    <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-white shadow-sm flex items-center justify-center text-[9px] text-white font-bold">
                      3
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary font-bold uppercase tracking-wider">
                        Priority 3 • In-Situ Tone
                      </span>
                      <span className="font-mono text-[10px] text-on-surface-variant">T + 0m</span>
                    </div>
                    <p className="text-xs text-on-surface font-medium leading-tight">
                      Local audio buzzer alert & BLE vibration pulses to Suunto watch.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between text-xs border border-outline-variant/20">
                  <span className="text-on-surface-variant">
                    Watchdog: <strong className="text-on-surface">114 mins remaining</strong>
                  </span>
                  <button
                    onClick={() => showToast("Watchdog timer refreshed for 120 minutes.")}
                    className="text-primary font-bold hover:underline"
                  >
                    Ping Now
                  </button>
                </div>
              </div>

              {/* Quiet Hours & Low-Power Dwell Policy */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-4 border border-outline-variant/30">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-secondary-fixed text-primary flex items-center justify-center">
                    <Bed className="w-4 h-4" />
                  </span>
                  <h3 className="text-lg font-bold text-primary font-serif">Dwell & Quiet Policy</h3>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-bold text-on-surface block">Mute Bivouac Buzzers</span>
                      <span className="text-[11px] text-on-surface-variant leading-relaxed">
                        Silence non-critical tones between 21:00 & 05:30 JST. SOS bypasses mute.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuietHours(!quietHours)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                        quietHours ? "bg-primary" : "bg-outline-variant"
                      }`}
                    >
                      <span
                        className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                          quietHours ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="h-px bg-outline-variant/30" />

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-bold text-on-surface block">Battery Conservation Guard</span>
                      <span className="text-[11px] text-on-surface-variant leading-relaxed">
                        Suppress background DEM & vector sync when phone charge &lt; 25%.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBatteryConservation(!batteryConservation)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                        batteryConservation ? "bg-primary" : "bg-outline-variant"
                      }`}
                    >
                      <span
                        className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                          batteryConservation ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="h-px bg-outline-variant/30" />

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-bold text-on-surface block">Fall-Detection Auto-Beacon</span>
                      <span className="text-[11px] text-on-surface-variant leading-relaxed">
                        Trigger Iridium burst if 4G+ impact is followed by 90s immobility.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFallDetection(!fallDetection)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                        fallDetection ? "bg-primary" : "bg-outline-variant"
                      }`}
                    >
                      <span
                        className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                          fallDetection ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notification Delivery Channels */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-4 border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-surface-container text-primary flex items-center justify-center">
                      <Bell className="w-4 h-4" />
                    </span>
                    <h3 className="text-lg font-bold text-primary font-serif">Delivery Channels</h3>
                  </div>
                  <span className="text-xs text-on-surface-variant font-bold">3 Paired</span>
                </div>

                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
                    <div className="flex items-center gap-2.5">
                      <Smartphone className="w-4 h-4 text-primary" />
                      <div>
                        <div className="text-xs font-bold text-on-surface">Native OS Push</div>
                        <div className="text-[10px] text-on-surface-variant">Lockscreen alerts</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-primary text-[10px] font-bold">
                      Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
                    <div className="flex items-center gap-2.5">
                      <Watch className="w-4 h-4 text-primary" />
                      <div>
                        <div className="text-xs font-bold text-on-surface">LED Strobe & Haptic</div>
                        <div className="text-[10px] text-on-surface-variant">Suunto 9 Peak Pro (BLE-91)</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-primary text-[10px] font-bold">
                      Paired
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
                    <div className="flex items-center gap-2.5">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <div>
                        <div className="text-xs font-bold text-on-surface">Satellite SMS Gateway</div>
                        <div className="text-[10px] text-on-surface-variant">Emergency Dispatch Roster</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">
                      Armed
                    </span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs text-on-surface-variant border-t border-outline-variant/20">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Lock className="w-3.5 h-3.5 text-primary" />
                    AES-256 Payload Hash
                  </span>
                  <Link href="/settings/profile" className="text-primary font-bold hover:underline">
                    Edit Contacts
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
