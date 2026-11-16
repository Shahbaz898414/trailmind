"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Radio,
  Satellite,
  Terminal,
  PlusCircle,
  Bolt,
  Layers,
  BatteryMedium,
  BatteryCharging,
  Cpu,
  Watch,
  Droplets,
  Zap,
  Lock,
  Send,
  AlertOctagon,
  CheckCircle2,
  Settings,
  Compass,
} from "lucide-react";

export default function FieldHardwareSettingsPage() {
  const [satMessage, setSatMessage] = useState("Delayed by technical terrain (approx 1h). All safe.");
  const [charCount, setCharCount] = useState(48);
  const [transmitting, setTransmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handlePreset = (text: string) => {
    setSatMessage(text);
    setCharCount(text.length);
  };

  const handleTransmit = () => {
    if (!satMessage.trim() || transmitting) return;
    setTransmitting(true);
    setTimeout(() => {
      setTransmitting(false);
      showToast("Satellite Burst Packet ACK: Transmitted to Iridium LEO constellation [Ack: 2.8s].");
    }, 2000);
  };

  const handlePing = () => {
    showToast("Satellite Beacon Ping Dispatched. Signal: 4/5 bars (LEO mesh acknowledged).");
  };

  return (
    <div className="w-full bg-surface min-h-screen">
      <div className="flex flex-col w-full">
        {/* Top Header & Telemetry */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-4 max-w-[1400px] mx-auto">
          {/* Breadcrumb & Action Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs text-secondary uppercase tracking-widest font-mono">
                <Link href="/settings" className="hover:text-primary transition-colors">
                  Settings & Hardware
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-primary font-bold">Field Hardware & Satellite Comms Hub</span>
                <span className="text-outline">/</span>
                <span className="text-outline font-mono">NODE_REF: TM-LORA-915-JP4</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap mt-0.5">
                <h1 className="text-3xl font-extrabold text-primary tracking-tight font-serif">
                  Expedition Hardware & Mesh Hub
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                  Zero Cellular Field Link Active
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => showToast("Diagnostic logs exported to secure offline storage.")}
                className="px-3.5 py-2 rounded-lg bg-surface-container-lowest text-primary text-xs font-semibold shadow-sm hover:bg-surface-container transition-all flex items-center gap-1.5 border border-outline-variant/30"
              >
                <Terminal className="w-4 h-4" />
                <span>Diagnostic Logs</span>
              </button>
              <button
                onClick={handlePing}
                className="px-3.5 py-2 rounded-lg bg-surface-container-lowest text-primary text-xs font-semibold shadow-sm hover:bg-surface-container transition-all flex items-center gap-1.5 border border-outline-variant/30"
              >
                <Satellite className="w-4 h-4 text-emerald-700" />
                <span>Ping Satellite Beacon</span>
              </button>
              <button
                onClick={() => showToast("Bluetooth LE discovery mode initiated for 60 seconds.")}
                className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold shadow-sm hover:bg-primary-container transition-all flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Pair New Device</span>
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

          {/* Active Hardware Status Rail */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex items-center justify-between border border-outline-variant/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-primary">
                  <Satellite className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-on-surface">Garmin Iridium Network</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  </div>
                  <span className="text-[11px] text-on-surface-variant">4/5 Bars • 100% Sky Clearance</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-bold">
                Connected
              </span>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex items-center justify-between border border-outline-variant/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-primary">
                  <Radio className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-on-surface">LoRa Mesh 915MHz</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  </div>
                  <span className="text-[11px] text-on-surface-variant">4 Nodes Active • Otowa Ridge</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-bold font-mono">
                20 dBm Tx
              </span>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex items-center justify-between border border-outline-variant/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <Bolt className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-on-surface">BLE / USB-C PD Bus</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  </div>
                  <span className="text-[11px] text-on-surface-variant">Air-Gapped Telemetry Link</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface text-[11px] font-bold">
                Secured
              </span>
            </div>
          </div>

          {/* 3 Core Telemetry Master Cards */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Card 1: Garmin inReach Mini 2 */}
            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden border border-outline-variant/30">
              <div className="absolute -right-8 -top-8 w-28 h-28 bg-secondary-fixed/40 rounded-full blur-2xl pointer-events-none" />
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-primary" />
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                      Transceiver #01
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-primary text-[11px] font-bold flex items-center gap-1">
                    <Bolt className="w-3 h-3" /> 94% (~68h)
                  </span>
                </div>
                <h2 className="text-lg font-bold text-primary font-serif">Garmin inReach Mini 2</h2>
                <p className="text-xs text-on-surface-variant">Primary Satellite SOS & Polling Beacon</p>
                <div className="mt-2 p-3 rounded-lg bg-surface-container-low flex flex-col gap-1 text-[11px] font-mono border border-outline-variant/20">
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Constellation:</span>
                    <span className="text-on-surface font-semibold">Iridium LEO mesh (66 sats)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Beacon Cadence:</span>
                    <span className="text-on-surface font-semibold">10 min (last sent 2m ago)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">GNSS Fix:</span>
                    <span className="text-primary font-bold">35.0003° N, 135.7812° E</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">Prefectural SAR & Coast Guard</span>
                <span className="text-primary font-bold">Ready</span>
              </div>
            </div>

            {/* Card 2: TrailMind LoRa Relay #04 */}
            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden border border-outline-variant/30">
              <div className="absolute -right-8 -top-8 w-28 h-28 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-primary" />
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                      Field Mesh Repeater
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-primary text-[11px] font-bold flex items-center gap-1">
                    <BatteryMedium className="w-3 h-3" /> 88% (~140h)
                  </span>
                </div>
                <h2 className="text-lg font-bold text-primary font-serif">TrailMind LoRa Relay #04</h2>
                <p className="text-xs text-on-surface-variant">Local Peer Ad-Hoc Intercept (Otowa Pass)</p>
                <div className="mt-2 p-3 rounded-lg bg-surface-container-low flex flex-col gap-1 text-[11px] font-mono border border-outline-variant/20">
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Frequency / RF:</span>
                    <span className="text-on-surface font-semibold">915 MHz ISM • 20dBm</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Peers In Range:</span>
                    <span className="text-primary font-bold">4 Active (Basecamp, Ridge, Scout, #2)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Tx/Rx Queue:</span>
                    <span className="text-on-surface font-semibold">0 pending • 100% acked</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">2x 18650 Li-ion Cells (Nominal)</span>
                <span className="text-primary font-bold">Online</span>
              </div>
            </div>

            {/* Card 3: Host Mobile Core */}
            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden border border-outline-variant/30">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-primary" />
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                      Host Mobile Core
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-primary text-[11px] font-bold">
                    Nominal (31°C)
                  </span>
                </div>
                <h2 className="text-lg font-bold text-primary font-serif">iPhone 16 Pro (512GB)</h2>
                <p className="text-xs text-on-surface-variant">On-Device Autonomous Field AI & Sensor Fusion</p>
                <div className="mt-2 p-3 rounded-lg bg-surface-container-low flex flex-col gap-1 text-[11px] font-mono border border-outline-variant/20">
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Field Storage:</span>
                    <span className="text-on-surface font-semibold">5.4 GB cached of 142 GB free</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">External Power PD:</span>
                    <span className="text-primary font-bold">Anker 24k @ 22.5W (98% charged)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Thermal Throttling:</span>
                    <span className="text-on-surface font-semibold">0% (Alpine Ambient 9°C)</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">USB-C Bidirectional PD Bus</span>
                <span className="text-primary font-bold">Engaged</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Left (7 cols) / Right (5 cols) */}
        <div className="w-full px-4 sm:px-6 lg:px-8 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-[1400px] mx-auto">
          {/* LEFT COLUMN (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Terminal & Message Log */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-4 border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary text-white">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary font-serif">
                      Satellite Burst Terminal & Message Log
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      Sub-GHz & Iridium bi-directional packet log (JST UTC+9)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="text-xs text-on-surface-variant font-mono">RX_LISTENING</span>
                </div>
              </div>

              {/* Terminal Box */}
              <div className="w-full bg-[#111814] text-white/90 p-4 rounded-xl font-mono text-xs flex flex-col gap-2.5 shadow-inner">
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 leading-relaxed">
                  <span className="text-amber-400 font-bold">[16:42:19 JST]</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-800 text-white text-[10px] w-fit font-bold">
                    SAT_BURST_ACK
                  </span>
                  <span className="text-white/80 flex-1">
                    Check-in ping dispatched: &ldquo;Arrived Kiyomizu approach. Terrain pace nominal.&rdquo; [RSSI: -94dBm • Ack in 3.4s]
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 leading-relaxed">
                  <span className="text-amber-400 font-bold">[16:30:02 JST]</span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-800 text-white text-[10px] w-fit font-bold">
                    WEATHER_PACKET
                  </span>
                  <span className="text-white/80 flex-1">
                    Micro-forecast ingested: Ridge wind 14kt NW, ambient 8°C, zero precip next 12h. Baro trend +1.2 hPa.
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 leading-relaxed">
                  <span className="text-amber-400 font-bold">[16:15:44 JST]</span>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-700 text-white text-[10px] w-fit font-bold">
                    MESH_RELAY_RX
                  </span>
                  <span className="text-white/80 flex-1">
                    Peer node Scout Alpha reported bridge clear at Otowa ravine. Path impedance: 1.1km LOS.
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 leading-relaxed">
                  <span className="text-amber-400 font-bold">[15:58:10 JST]</span>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-700 text-white text-[10px] w-fit font-bold">
                    EPHEMERIS_SYNC
                  </span>
                  <span className="text-white/80 flex-1">
                    Iridium orbital ephemeris verified. 66 operational nodes synchronized. Next pass: Overhead continuous.
                  </span>
                </div>
              </div>

              {/* Quick Compose Satellite Message */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <span>Quick Compose Field Satellite Message</span>
                  </label>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <span className="text-on-surface-variant">Payload:</span>
                    <span className="text-primary font-bold">{charCount}</span>
                    <span className="text-on-surface-variant">/ 160 chars</span>
                  </div>
                </div>

                {/* Presets */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handlePreset("Status OK: Camp established. All nominal.")}
                    className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-left text-xs transition-colors flex items-center justify-between border border-outline-variant/20"
                  >
                    <span>Camp OK</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </button>
                  <button
                    onClick={() => handlePreset("Delayed by technical terrain (approx 1h). All safe.")}
                    className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-left text-xs transition-colors flex items-center justify-between border border-outline-variant/20"
                  >
                    <span>Delayed 1h</span>
                    <Radio className="w-3.5 h-3.5 text-primary" />
                  </button>
                  <button
                    onClick={() => handlePreset("Holding position due to low visibility. Safe shelter.")}
                    className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-left text-xs transition-colors flex items-center justify-between border border-outline-variant/20"
                  >
                    <span>Bivouac Safe</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </button>
                  <button
                    onClick={() => handlePreset("Requesting non-emergency trail update via Basecamp.")}
                    className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-left text-xs transition-colors flex items-center justify-between border border-outline-variant/20"
                  >
                    <span>Trail Advisory</span>
                    <Radio className="w-3.5 h-3.5 text-primary" />
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    value={satMessage}
                    onChange={(e) => {
                      setSatMessage(e.target.value);
                      setCharCount(e.target.value.length);
                    }}
                    maxLength={160}
                    rows={3}
                    className="w-full p-3 rounded-lg bg-surface-container-low text-on-surface font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-inner resize-none border border-outline-variant/30"
                    placeholder="Type standard 160-char satellite transmission payload..."
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                    <Satellite className="w-3.5 h-3.5 text-primary" />
                    <span>Encrypted via AES-256 Iridium Bridge</span>
                  </div>
                  <button
                    onClick={handleTransmit}
                    disabled={transmitting}
                    className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send className={`w-3.5 h-3.5 ${transmitting ? "animate-spin" : ""}`} />
                    <span>{transmitting ? "Transmitting..." : "Transmit via Iridium Link"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Paired Field Hardware Matrix */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-4 border border-outline-variant/30">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-lg font-bold text-primary font-serif">
                    Paired Field Hardware Matrix
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    5 Devices integrated on local peripheral bus
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold font-mono">
                  5 / 8 Channels Assigned
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {/* Device 1 */}
                <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container transition-colors border border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                      <Satellite className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-on-surface">Garmin inReach Mini 2</span>
                        <span className="px-1.5 py-0.2 rounded bg-secondary-fixed text-primary text-[10px] font-bold">
                          Active Sat
                        </span>
                      </div>
                      <span className="text-[11px] text-on-surface-variant font-mono">
                        Satellite Comms • Bluetooth LE 5.2 • RSSI -68 dBm
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-xs text-primary font-bold font-mono block">94% Battery</span>
                      <span className="text-[10px] text-on-surface-variant font-mono">68h autonomy</span>
                    </div>
                    <button className="p-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface-variant transition-colors border border-outline-variant/30">
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Device 2 */}
                <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container transition-colors border border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary-fixed text-primary flex items-center justify-center shrink-0">
                      <Radio className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-on-surface">TrailMind LoRa Mesh #04</span>
                        <span className="px-1.5 py-0.2 rounded bg-secondary-fixed text-primary text-[10px] font-bold">
                          Relay Host
                        </span>
                      </div>
                      <span className="text-[11px] text-on-surface-variant font-mono">
                        LoRa 915MHz ISM • SPI/Direct • 4 Peers linked
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-xs text-primary font-bold font-mono block">88% (2x 18650)</span>
                      <span className="text-[10px] text-on-surface-variant font-mono">140h reserve</span>
                    </div>
                    <button className="p-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface-variant transition-colors border border-outline-variant/30">
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Device 3 */}
                <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container transition-colors border border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center shrink-0">
                      <Watch className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-on-surface">Suunto Vertical Titanium Solar</span>
                        <span className="px-1.5 py-0.2 rounded bg-surface-container-highest text-on-surface text-[10px] font-bold">
                          Biometrics
                        </span>
                      </div>
                      <span className="text-[11px] text-on-surface-variant font-mono">
                        Barometric Altimeter • Heart Rate • Solar Ingest +12%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-xs text-primary font-bold font-mono block">78% Solar +</span>
                      <span className="text-[10px] text-on-surface-variant font-mono">82h track mode</span>
                    </div>
                    <button className="p-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface-variant transition-colors border border-outline-variant/30">
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Device 4 */}
                <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container transition-colors border border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center shrink-0">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-on-surface">Katadyn BeFree Flow Sensor</span>
                        <span className="px-1.5 py-0.2 rounded bg-surface-container-highest text-on-surface text-[10px] font-bold">
                          Telemetry
                        </span>
                      </div>
                      <span className="text-[11px] text-on-surface-variant font-mono">
                        Hydration Telemetry • RFID/NFC Tagged • 1.8L Clean
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-xs text-primary font-bold font-mono block">Filter: 91% Life</span>
                      <span className="text-[10px] text-on-surface-variant font-mono">Pure Stream</span>
                    </div>
                    <button className="p-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface-variant transition-colors border border-outline-variant/30">
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Device 5 */}
                <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container transition-colors border border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary-fixed text-primary flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-on-surface">Anker Prime 27,650mAh Power Bank</span>
                        <span className="px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold">
                          PD Bus
                        </span>
                      </div>
                      <span className="text-[11px] text-on-surface-variant font-mono">
                        Smart USB-PD 3.1 • Output: 22.5W • 99.54Wh Cap
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-xs text-primary font-bold font-mono block">96% Capacity</span>
                      <span className="text-[10px] text-on-surface-variant font-mono">3.4 days pack</span>
                    </div>
                    <button className="p-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface-variant transition-colors border border-outline-variant/30">
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Azimuth Radar */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-4 border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-primary font-serif">
                    Iridium Sky Pass & Azimuth
                  </h3>
                  <p className="text-xs text-on-surface-variant">Polar Azimuth Tracking & Terrain Mask</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold font-mono">
                  Az 174° S • El 52°
                </span>
              </div>

              {/* Radar Representation */}
              <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-full bg-surface-container-low p-3 flex items-center justify-center shadow-inner overflow-hidden border border-outline-variant/30">
                {/* Rings */}
                <div className="absolute inset-4 rounded-full border border-secondary/20" />
                <div className="absolute inset-10 rounded-full border border-secondary/20" />
                <div className="absolute inset-16 rounded-full border border-secondary/30" />
                {/* Crosshairs */}
                <div className="absolute inset-x-0 top-1/2 h-px bg-secondary/20" />
                <div className="absolute inset-y-0 left-1/2 w-px bg-secondary/20" />
                {/* Compass Marks */}
                <span className="absolute top-1 text-[10px] font-mono font-bold text-primary">N 0°</span>
                <span className="absolute bottom-1 text-[10px] font-mono font-bold text-on-surface-variant">S 180°</span>
                <span className="absolute left-1 text-[10px] font-mono font-bold text-on-surface-variant">W 270°</span>
                <span className="absolute right-1 text-[10px] font-mono font-bold text-on-surface-variant">E 90°</span>

                {/* Terrain Mask Arc */}
                <svg className="absolute inset-0 w-full h-full text-secondary-fixed/40" viewBox="0 0 200 200">
                  <path d="M 100,100 L 15,35 A 90,90 0 0,1 115,10 Z" fill="currentColor" opacity="0.45" />
                </svg>
                <div className="absolute top-5 left-10 text-[9px] font-mono text-on-surface-variant bg-white/80 px-1 rounded shadow-xs">
                  Mt. Hiei Shadow (El &lt; 28°)
                </div>

                {/* Active Satellites */}
                <div className="absolute top-16 right-16 flex flex-col items-center animate-bounce">
                  <div className="w-4 h-4 rounded-full bg-emerald-600 shadow-sm flex items-center justify-center text-white text-[8px]">
                    <Satellite className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-primary mt-0.5">IRID-142</span>
                </div>

                <div className="absolute bottom-16 right-12 flex flex-col items-center opacity-80">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-[8px] font-mono text-on-surface-variant mt-0.5">IRID-88</span>
                </div>

                <div className="absolute bottom-20 left-16 flex flex-col items-center opacity-70">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-[8px] font-mono text-on-surface-variant mt-0.5">IRID-105</span>
                </div>

                {/* User Center Position */}
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white shadow-sm z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>

              {/* Radar Footer */}
              <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1 text-xs border border-outline-variant/20 font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Active Satellite Window:</span>
                  <span className="font-bold text-primary font-sans">Continuous (Polar Mesh)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Constellation Overhead:</span>
                  <span className="text-on-surface">3 satellites visible (&gt;15°)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Optimal Aim Heading:</span>
                  <span className="text-primary font-bold">Bearing 174° (SSE)</span>
                </div>
              </div>
            </div>

            {/* Emergency SOS Hardware Interlock */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden border border-outline-variant/30">
              <div className="h-2 w-full bg-[repeating-linear-gradient(45deg,#ba1a1a,#ba1a1a_10px,#ffdcc2_10px,#ffdcc2_20px)] rounded-t-lg -mt-6 -mx-6 mb-1" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-6 h-6 text-rose-600" />
                  <div>
                    <h3 className="text-lg font-bold text-rose-700 font-serif">
                      Emergency SOS Hardware Interlock
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      Prefectural Alpine Search & Rescue
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                  ARMED
                </span>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                Dual-stage satellite beacon. In an unrecoverable event, pulling hardware guard transmits
                distress packets every 60 seconds with offline medical triage telemetry.
              </p>

              <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1.5 text-xs font-mono border border-outline-variant/20">
                <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Automated SOS Encrypted Payload Preview
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Subject Name:</span>
                  <span className="text-on-surface font-semibold font-sans">Alex Morgan (Lead)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Blood / Vitals:</span>
                  <span className="text-on-surface font-semibold">A+ Rh Positive • Resting HR 54</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Medical Flags:</span>
                  <span className="text-rose-700 font-bold">Severe Penicillin Allergy</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Location:</span>
                  <span className="text-primary font-bold">35.0003° N, 135.7812° E</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  <div>
                    <span className="text-xs font-bold text-primary block">Hardware SOS Guard</span>
                    <span className="text-[11px] text-on-surface-variant">Physical cover locked</span>
                  </div>
                </div>
                <button
                  onClick={() => alert("SOS Hardware Interlock Test: Trigger verified nominal. No SAR dispatch transmitted.")}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-sm"
                >
                  TEST INTERLOCK
                </button>
              </div>
            </div>

            {/* Field Battery & Power Budget Forecaster */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-4 border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-primary font-serif">
                    Field Power Forecaster
                  </h3>
                  <p className="text-xs text-on-surface-variant">72-Hour Alpine Bivouac Projection</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-primary font-mono block">96.8h</span>
                  <div className="text-[10px] text-on-surface-variant uppercase">Total System Life</div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">Energy Distribution</span>
                  <span className="text-primary font-semibold font-mono">122.4 Wh available</span>
                </div>
                <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden flex">
                  <div className="bg-primary h-full" style={{ width: "45%" }} title="Host Mobile (45%)" />
                  <div className="bg-emerald-700 h-full" style={{ width: "25%" }} title="Satellite Beacon (25%)" />
                  <div className="bg-secondary-fixed-dim h-full" style={{ width: "18%" }} title="LoRa Mesh (18%)" />
                  <div className="bg-tertiary-fixed h-full" style={{ width: "12%" }} title="Headlamp & Peripherals (12%)" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-mono pt-1">
                  <span>Host Mobile (45%)</span>
                  <span>Sat Beacon (25%)</span>
                  <span>LoRa Mesh (18%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
