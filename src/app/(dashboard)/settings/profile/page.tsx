"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Fingerprint,
  QrCode,
  ShieldCheck,
  Radio,
  HeartPulse,
  Pill,
  Users,
  Phone,
  Mail,
  Key,
  Usb,
  ShieldAlert,
  X,
  Download,
  CheckCircle2,
  AlertTriangle,
  Flame,
  FileCheck,
} from "lucide-react";
import { currentUser } from "@/data/user";
import { emergencyContactsList } from "@/data/emergency-contacts";

export default function ProfileSettingsPage() {
  const [showQrModal, setShowQrModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [autoSosThreshold, setAutoSosThreshold] = useState("12h");
  const [sarBroadcastActive, setSarBroadcastActive] = useState(true);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="w-full bg-surface min-h-screen">
      <div className="flex flex-col w-full">
        <div className="px-4 lg:px-8 py-6 max-w-[1400px] w-full mx-auto space-y-6">
          {/* Top Breadcrumbs & Page Action Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-1">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                <Link
                  href="/settings"
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Settings & Governance
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant" />
                <span className="text-primary font-bold">
                  Profile & Emergency Directives
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <h1 className="text-3xl font-extrabold text-primary tracking-tight font-serif">
                  Profile & Emergency Directives
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-pulse" />
                  Enclave Active
                </span>
              </div>
              <p className="text-sm text-on-surface-variant max-w-3xl">
                Cryptographic identity, emergency responder telemetry tags, medical
                directives, and automated embassy SAR dispatch protocols.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setShowQrModal(true)}
                className="px-4 py-2 rounded-lg bg-surface-container-lowest text-primary text-sm font-semibold shadow-sm hover:bg-surface-container-high transition-colors flex items-center gap-2 border border-outline-variant/30"
              >
                <QrCode className="w-4 h-4" />
                <span>Lockscreen QR</span>
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary-container active:scale-[0.99] transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{saveSuccess ? "Saved to Enclave!" : "Save Directives"}</span>
              </button>
            </div>
          </div>

          {/* Success Notification Banner */}
          {saveSuccess && (
            <div className="p-3 bg-secondary-fixed/50 border border-primary/20 rounded-xl flex items-center gap-3 text-primary text-sm font-medium animate-in fade-in slide-in-from-top duration-200">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>
                Directives successfully cryptographically resigned and synced to Secure
                Enclave key store.
              </span>
            </div>
          )}

          {/* Master-Detail 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Primary Triage & Responder Roster (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* 1. Personal & Trekker Cryptographic Identity */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm relative overflow-hidden border border-outline-variant/30">
                <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-secondary-fixed/20 pointer-events-none blur-2xl" />
                <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 mb-4">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold text-primary font-serif">
                      Expedition Identity & Telemetry Tag
                    </h2>
                  </div>
                  <span className="text-xs text-on-surface-variant font-mono tracking-wider uppercase">
                    FIPS 140-3 L3 Sealed
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-sm bg-surface-container relative">
                      <Image
                        src="/images/stitch/profile-kenji-takahashi.jpg"
                        alt="Kenji Takahashi"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold tracking-wide uppercase flex items-center gap-1 shadow-sm">
                      Lead
                    </span>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <div className="space-y-1">
                      <label className="text-xs text-on-surface-variant uppercase font-medium">
                        Full Legal Name
                      </label>
                      <div className="text-lg font-semibold text-on-surface">
                        {currentUser.name}
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        高橋 健司 • (He/Him)
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-on-surface-variant uppercase font-medium">
                        Satellite Call Sign & Node
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold text-primary bg-surface-container px-2 py-0.5 rounded">
                          TM-ECHO-99
                        </span>
                        <Radio className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        Garmin inReach ID: #98421-ECHO
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-on-surface-variant uppercase font-medium">
                        DID Cryptographic Hash
                      </label>
                      <div className="text-xs font-mono text-on-surface bg-surface-container-low px-2 py-1 rounded truncate">
                        did:key:z6MkqBfF2e89R8h9PqZ3wJvXvK1Y
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-on-surface-variant uppercase font-medium">
                        Emergency Dispatch Tier
                      </label>
                      <div className="text-xs font-semibold text-primary flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        Priority 1 Alpine SAR Dispatch
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Medical Triage Profile & Directives */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm space-y-4 border border-outline-variant/30">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-rose-600" />
                    <h3 className="text-lg font-bold text-primary font-serif">
                      Medical Triage Directives
                    </h3>
                  </div>
                  <span className="text-xs text-rose-600 font-bold uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded-full">
                    Physician Certified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-lg bg-surface-container-low space-y-1">
                    <span className="text-xs text-on-surface-variant uppercase font-medium">
                      Blood Group
                    </span>
                    <div className="text-xl font-extrabold text-primary font-mono">
                      {currentUser.bloodType}
                    </div>
                    <p className="text-[11px] text-on-surface-variant">
                      Universal receiver compatibility
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-rose-50/70 border border-rose-200 space-y-1">
                    <span className="text-xs text-rose-900 uppercase font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" /> Critical Allergies
                    </span>
                    <div className="text-sm font-bold text-rose-800">
                      {currentUser.allergies.join(", ")}
                    </div>
                    <p className="text-[11px] text-rose-700">
                      Anaphylaxis protocol / carry EpiPen
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-surface-container-low space-y-1">
                    <span className="text-xs text-on-surface-variant uppercase font-medium">
                      Medical Conditions
                    </span>
                    <div className="text-sm font-semibold text-on-surface">
                      Mild Asthmatic / Exercise-Induced
                    </div>
                    <p className="text-[11px] text-on-surface-variant">
                      Alpine altitude tolerant up to 4,200m
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-surface-container-low space-y-1">
                    <span className="text-xs text-on-surface-variant uppercase font-medium flex items-center gap-1">
                      <Pill className="w-3 h-3 text-primary" /> Daily Medications
                    </span>
                    <div className="text-sm font-semibold text-on-surface">
                      Salbutamol Inhaler (PRN), Cetirizine 10mg
                    </div>
                    <p className="text-[11px] text-on-surface-variant">
                      Staged in top brain pack compartment
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-surface-container-low space-y-1">
                    <span className="text-xs text-on-surface-variant uppercase font-medium">
                      Organ Donor
                    </span>
                    <div className="text-sm font-semibold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active Card
                    </div>
                    <p className="text-[11px] text-on-surface-variant">
                      International donor registry verified
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-surface-container-low space-y-1">
                    <span className="text-xs text-on-surface-variant uppercase font-medium">
                      DNR / Resuscitation
                    </span>
                    <div className="text-sm font-semibold text-primary">
                      Resuscitate Full Protocol
                    </div>
                    <p className="text-[11px] text-on-surface-variant">
                      Defibrillation and advanced airway authorized
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Emergency Responder Roster & Primary Next-of-Kin */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm space-y-4 border border-outline-variant/30">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-primary font-serif">
                      Emergency Contacts & Responder Roster
                    </h3>
                  </div>
                  <span className="text-xs text-on-surface-variant">
                    Priority Escalation Sequence
                  </span>
                </div>

                <div className="space-y-3">
                  {emergencyContactsList.map((contact, idx) => (
                    <div
                      key={contact.id}
                      className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-outline-variant/20"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-on-surface">
                              {contact.name}
                            </span>
                            <span className="text-xs px-2 py-0.2 rounded-full bg-surface-container-high text-on-surface-variant font-medium">
                              {contact.relationship}
                            </span>
                          </div>
                          <div className="text-xs text-on-surface-variant mt-0.5">
                            {contact.satelliteAddress || "Direct cellular & satellite relay dispatch"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:self-center self-end">
                        <a
                          href={`tel:${contact.phone}`}
                          className="px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface text-primary text-xs font-semibold flex items-center gap-1.5 border border-outline-variant/30 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{contact.phone}</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Governance, Hardware Key & Directives (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Automated SAR & Satellite Dispatch Thresholds */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm space-y-4 border border-outline-variant/30">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-primary font-serif">
                    Automated SAR Telemetry
                  </h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">
                      Missed Check-In Escalation Trigger
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["6h", "12h", "24h"].map((thresh) => (
                        <button
                          key={thresh}
                          type="button"
                          onClick={() => setAutoSosThreshold(thresh)}
                          className={`py-2 rounded-lg font-bold transition-colors ${
                            autoSosThreshold === thresh
                              ? "bg-primary text-white"
                              : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                          }`}
                        >
                          {thresh} Overdue
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-1.5">
                      Triggers Iridium satellite heartbeat ping to emergency dispatch roster.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-outline-variant/20 space-y-2">
                    <label className="text-xs font-semibold text-on-surface block">
                      Coordinate Projection Encoding
                    </label>
                    <div className="p-2.5 rounded-lg bg-surface-container-low font-mono text-xs flex justify-between items-center text-primary font-bold">
                      <span>WGS84 + MGRS 10-Figure</span>
                      <FileCheck className="w-4 h-4 text-emerald-700" />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-on-surface">
                        Alpine SAR Direct Broadcast
                      </div>
                      <div className="text-[11px] text-on-surface-variant">
                        Auto-share telemetry with 110/119 JCG
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSarBroadcastActive(!sarBroadcastActive)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                        sarBroadcastActive ? "bg-primary" : "bg-outline-variant"
                      }`}
                    >
                      <span
                        className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                          sarBroadcastActive ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Hardware Key & Biometric Auth Lock */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm space-y-4 border border-outline-variant/30">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-primary font-serif">
                    Hardware & Cryptographic Enclave
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
                    <div className="flex items-center gap-3">
                      <Usb className="w-4 h-4 text-primary" />
                      <div>
                        <div className="text-xs font-bold text-on-surface">
                          YubiKey 5C NFC
                        </div>
                        <div className="text-[10px] text-on-surface-variant font-mono">
                          FIDO2 Hardware Token
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-bold">
                      Paired
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
                    <div className="flex items-center gap-3">
                      <Fingerprint className="w-4 h-4 text-primary" />
                      <div>
                        <div className="text-xs font-bold text-on-surface">
                          Biometric Decryption
                        </div>
                        <div className="text-[10px] text-on-surface-variant font-mono">
                          TouchID Secure Enclave Decrypt
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-bold">
                      Active
                    </span>
                  </div>
                </div>

                {/* Duress Distress PIN Notice */}
                <div className="p-3.5 rounded-xl bg-surface-container-high/60 space-y-1.5 border border-outline-variant/30">
                  <div className="flex items-center gap-1.5 text-error text-xs font-bold uppercase">
                    <Flame className="w-3.5 h-3.5 text-rose-600" />
                    Duress Distress PIN Configured
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Entering designated alternate 4-digit Duress PIN instantly purges local
                    sensitive credentials while silently transmitting a panic beacon to
                    Wakayama SAR dispatch.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lockscreen QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 relative border border-outline-variant/40">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-bold text-primary font-serif">
                Emergency QR Flashcard
              </h4>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-outline-variant">
              {/* QR Code SVG Representation */}
              <svg
                className="w-44 h-44 text-primary"
                fill="currentColor"
                viewBox="0 0 100 100"
              >
                <rect x="10" y="10" width="20" height="20" rx="2" />
                <rect x="70" y="10" width="20" height="20" rx="2" />
                <rect x="10" y="70" width="20" height="20" rx="2" />
                <rect fill="white" x="15" y="15" width="10" height="10" />
                <rect fill="white" x="75" y="15" width="10" height="10" />
                <rect fill="white" x="15" y="75" width="10" height="10" />
                <rect x="35" y="12" width="6" height="6" />
                <rect x="45" y="12" width="6" height="6" />
                <rect x="55" y="12" width="6" height="6" />
                <rect x="35" y="22" width="10" height="6" />
                <rect x="50" y="22" width="8" height="6" />
                <rect x="10" y="38" width="80" height="6" />
                <rect x="12" y="50" width="20" height="8" />
                <rect x="38" y="50" width="24" height="6" />
                <rect x="68" y="50" width="22" height="12" />
                <rect x="38" y="65" width="14" height="25" />
                <rect x="58" y="68" width="10" height="10" />
                <rect x="74" y="68" width="16" height="22" />
              </svg>
              <span className="font-mono text-[10px] text-on-surface-variant mt-2 text-center">
                CRYPTO-SIGN: 0x9AF4...881C
              </span>
            </div>

            <p className="text-xs text-on-surface-variant text-center leading-relaxed">
              Scan provides authenticated wilderness medical passport, blood group, &
              satellite relay dispatch IDs without unlocking device.
            </p>

            <button
              onClick={() => {
                alert("Lockscreen QR Flashcard downloaded successfully.");
                setShowQrModal(false);
              }}
              className="w-full py-2.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-container transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export to Lockscreen Wallpaper</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
