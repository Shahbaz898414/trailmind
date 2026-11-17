"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  HeartPulse,
  Phone,
  Printer,
  Radio,
  ShieldAlert,
  ShieldCheck,
  User,
  Volume2,
} from "lucide-react";

import { currentUser } from "@/data/user";
import { emergencyContactsList, fieldRescueServices } from "@/data/emergency-contacts";
import { useAuth } from "@/components/auth/auth-provider";
import { useAsyncResource } from "@/hooks/use-async-resource";
import {
  listEmergencyContacts,
  type EmergencyContactRecord,
} from "@/services/emergency-contacts";

export default function EmergencyPage() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const contactsKey = uid ? `contacts:${uid}` : null;
  const { data: dbContacts } = useAsyncResource<EmergencyContactRecord[]>(
    contactsKey,
    async () => {
      if (!uid) return [];
      return listEmergencyContacts(uid);
    }
  );

  const contacts = dbContacts && dbContacts.length > 0 ? dbContacts : emergencyContactsList;

  const [isBeaconActive, setIsBeaconActive] = useState(false);
  const [sosArmed, setSosArmed] = useState(false);
  const [sosTriggered, setSosTriggered] = useState(false);

  const handleTriggerBeacon = () => {
    setIsBeaconActive(!isBeaconActive);
  };

  const handleSosSlide = () => {
    if (!sosArmed) {
      setSosArmed(true);
    } else {
      setSosTriggered(true);
    }
  };

  return (
    <div className="w-full min-h-screen bg-surface">
      {/* Critical Offline Protocol Banner */}
      <div className="bg-red-100 text-red-950 px-4 sm:px-6 py-2.5 shadow-sm border-b border-red-200 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <AlertOctagon className="size-4 text-red-700 shrink-0" />
          <p className="leading-tight">
            <strong className="font-bold">Offline Field Safety Mode Active:</strong> Showing verified local emergency protocols and encrypted medical directives. Works 100% without internet.
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-white text-red-900 font-mono text-[10px] font-bold shrink-0 uppercase tracking-wider">
          Off-Grid Staged
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Header Strip */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-2 border-b border-border">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant font-mono">
              <Link href="/wallet" className="hover:text-primary transition-colors flex items-center gap-1">
                <ArrowLeft className="size-3.5" /> Back to Wallet
              </Link>
              <span>/</span>
              <span className="text-red-700 font-bold uppercase">Field Defense Protocol</span>
            </div>
            <h1 className="font-heading text-3xl font-bold text-primary tracking-tight">
              Emergency Field ID & Consular Contacts
            </h1>
            <p className="text-sm text-on-surface-variant max-w-3xl leading-relaxed">
              Instant offline access to blood type, critical medical contraindications, dispatch numbers, bilingual addresses, and bilateral consular posts for the Kyoto & Kansai District.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleTriggerBeacon}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                isBeaconActive
                  ? "bg-amber-600 text-white animate-pulse"
                  : "bg-primary text-white hover:bg-primary-container"
              }`}
            >
              <Radio className="size-4" />
              <span>{isBeaconActive ? "Mesh Beacon Transmitting" : "Broadcast Mesh Beacon"}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-border text-on-surface text-xs font-semibold hover:bg-surface-container"
            >
              <Printer className="size-4" />
              <span>Print Medical Card</span>
            </button>
          </div>
        </div>

        {/* Mesh Beacon Pulse Banner */}
        {isBeaconActive && (
          <div className="p-4 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-950 flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <Radio className="size-4 text-amber-800 animate-spin" />
              <span>
                <strong>LoRa Mesh Beacon Active:</strong> Broadcasting GPS ping (35.0116° N, 135.7681° E) on 915 MHz frequency to nearby TrailMind field nodes.
              </span>
            </div>
            <span className="font-mono font-bold text-[11px]">Interval: 30s</span>
          </div>
        )}

        {/* Medical ID & Critical Kanji Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Blood Type & Allergies Card */}
          <div className="lg:col-span-6 bg-white rounded-2xl border-2 border-red-200 shadow-sm p-6 flex flex-col justify-between gap-5">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-700">
                  CRITICAL MEDICAL DIRECTIVE
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-bold">
                  High Priority
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="size-16 rounded-2xl bg-red-600 text-white flex flex-col items-center justify-center font-bold">
                  <span className="text-xl">O+</span>
                  <span className="text-[10px]">Rh+</span>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-primary">
                    {currentUser.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-mono">
                    Blood Type: {currentUser.bloodType}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {currentUser.medicalNotes}
                  </p>
                </div>
              </div>

              {/* Japanese Kanji Allergy Flashcards */}
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                <span className="text-xs font-semibold text-on-surface">
                  Severe Allergies (Show to Emergency Personnel / Doctors):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-black text-white flex flex-col gap-1">
                    <span className="text-[10px] text-amber-300 font-mono">PEANUTS / PEANUT OIL</span>
                    <span className="font-heading text-lg font-bold">落花生（ピーナッツ）</span>
                    <span className="text-[11px] text-emerald-200">Rakkasei (Allergy)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black text-white flex flex-col gap-1">
                    <span className="text-[10px] text-amber-300 font-mono">PENICILLIN</span>
                    <span className="font-heading text-lg font-bold">ペニシリン</span>
                    <span className="text-[11px] text-emerald-200">Penishirin (Allergy)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-on-surface-variant border-t border-border/60 pt-3 flex items-center justify-between">
              <span>Encrypted on On-Chip Hardware Vault</span>
              <span className="text-emerald-700 font-bold">ICE Staged</span>
            </div>
          </div>

          {/* SOS Guarded Interlock Slider Component */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-border shadow-sm p-6 flex flex-col justify-between gap-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-secondary">
                  SATELLITE HARDWARE SOS INTERLOCK
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container text-xs font-mono">
                  Guarded Slider
                </span>
              </div>
              <h3 className="font-heading text-lg font-bold text-primary">
                Emergency Distress Interlock
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Requires a two-stage deliberate hardware slide to arm, preventing false satellite alarms while trekking.
              </p>
            </div>

            {sosTriggered ? (
              <div className="p-4 rounded-xl bg-red-600 text-white flex flex-col gap-2 text-center animate-in zoom-in-95">
                <AlertOctagon className="size-8 mx-auto animate-bounce" />
                <h4 className="font-heading font-bold text-base">DISTRESS BEACON ARMED (DEMO)</h4>
                <p className="text-xs text-red-100">
                  Simulated satellite SOS signal would now be transmitted to Japan Coast Guard & Garmin Iridium dispatch.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSosArmed(false);
                    setSosTriggered(false);
                  }}
                  className="mt-2 py-2 px-4 rounded-lg bg-white text-red-700 font-bold text-xs"
                >
                  Cancel / Reset Slider
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="p-4 rounded-xl bg-surface-container-low border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className={`size-6 ${sosArmed ? "text-red-600" : "text-on-surface-variant"}`} />
                    <div>
                      <span className="font-bold text-xs text-primary block">
                        {sosArmed ? "STAGE 2: CONFIRM ACTIVATION" : "STAGE 1: SLIDE TO ARM"}
                      </span>
                      <span className="text-[11px] text-on-surface-variant">
                        {sosArmed ? "Click below to confirm distress broadcast" : "Safety interlock engaged"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSosSlide}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      sosArmed
                        ? "bg-red-600 text-white hover:bg-red-700 animate-pulse"
                        : "bg-surface-container hover:bg-primary hover:text-white text-primary"
                    }`}
                  >
                    {sosArmed ? "CONFIRM DISTRESS" : "Slide to Arm"}
                  </button>
                </div>

                <p className="text-[11px] text-on-surface-variant/80 italic text-center">
                  Notice: Prototype simulation only. Never initiates real-world emergency dispatch services without paired physical hardware.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Emergency Dispatch Phone Directory Grid */}
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-xl font-bold text-primary">
            Emergency Dispatch & Mountain Rescue Directives
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fieldRescueServices.map((svc) => (
              <div
                key={svc.name}
                className="p-5 rounded-2xl bg-white border border-border shadow-sm flex flex-col justify-between gap-3"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold text-secondary uppercase">
                      {svc.serviceType}
                    </span>
                    {svc.japaneseKanji && (
                      <span className="text-xs font-bold text-primary">{svc.japaneseKanji}</span>
                    )}
                  </div>
                  <h3 className="font-heading font-bold text-base text-primary">
                    {svc.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {svc.notes}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                  {svc.frequency ? (
                    <span className="font-mono text-[11px] text-emerald-800 font-semibold">
                      {svc.frequency}
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-on-surface-variant">24/7 Hotline</span>
                  )}
                  <a
                    href={`tel:${svc.phone.replace(/[^0-9+]/g, "")}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-primary hover:text-white text-primary font-mono font-bold text-xs transition-colors"
                  >
                    <Phone className="size-3.5" />
                    <span>{svc.phone}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personal In-Case-Of-Emergency (ICE) Contacts */}
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-xl font-bold text-primary">
            Personal Next-of-Kin (ICE) Directives
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="p-5 rounded-2xl bg-white border border-border shadow-sm flex flex-col justify-between gap-3"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-secondary uppercase">
                      Priority #{contact.priority}
                    </span>
                    {contact.isPrimaryIce && (
                      <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-primary text-[10px] font-bold">
                        Primary ICE
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading font-bold text-base text-primary">
                    {contact.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-medium">
                    {contact.relationship}
                  </p>
                </div>

                <div className="flex flex-col gap-1 pt-2 border-t border-border text-xs font-mono">
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center justify-between hover:text-primary transition-colors"
                  >
                    <span className="text-on-surface-variant">Phone:</span>
                    <span className="font-bold text-primary">{contact.phone}</span>
                  </a>
                  {contact.satelliteAddress && (
                    <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                      <span>Satellite:</span>
                      <span className="text-emerald-700 truncate max-w-[150px]">
                        {contact.satelliteAddress}
                      </span>
                    </div>
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
