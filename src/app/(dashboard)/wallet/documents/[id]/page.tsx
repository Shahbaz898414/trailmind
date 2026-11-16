"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Lock,
  QrCode,
  Radio,
  Share2,
  ShieldCheck,
  Sun,
  Train,
  X,
} from "lucide-react";

import { travelDocumentsList } from "@/data/travel-documents";

export default function DocumentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const doc =
    travelDocumentsList.find((d) => d.id === resolvedParams.id) || travelDocumentsList[0];

  const [isFlashMode, setIsFlashMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyBarcode = () => {
    navigator.clipboard?.writeText(doc.barcodeValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-surface">
      {/* Top Header & Breadcrumb */}
      <div className="px-4 sm:px-6 lg:px-8 py-3.5 bg-white border-b border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-mono">
          <Link
            href="/wallet"
            className="hover:text-primary transition-colors flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="size-3.5" />
            <span>Wallet</span>
          </Link>
          <span>/</span>
          <span className="text-on-surface font-semibold truncate max-w-[200px] sm:max-w-none">
            {doc.title}
          </span>
          <span>/</span>
          <span className="px-2 py-0.5 rounded bg-primary-fixed text-primary font-bold">
            {doc.referenceCode}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFlashMode(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold shadow-sm hover:bg-amber-200 transition-all cursor-pointer"
          >
            <Sun className="size-3.5" />
            <span>Turnstile Flash Mode</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-surface-container text-xs text-on-surface"
          >
            <Download className="size-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Main Inspection Viewport */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Physical-Digital Shinkansen Pass */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white rounded-3xl border border-border shadow-xl overflow-hidden">
              {/* Header Strip with Mt Fuji Image */}
              {doc.image && (
                <div className="relative h-48 sm:h-56 bg-surface-container-high overflow-hidden">
                  <Image
                    src={doc.image}
                    alt={doc.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-white/90 text-primary text-xs font-bold">
                      {doc.issuer}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Offline Verified
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 font-bold block">
                      {doc.carrierOrHotel}
                    </span>
                    <h1 className="font-heading text-2xl sm:text-3xl font-bold leading-tight">
                      {doc.title}
                    </h1>
                  </div>
                </div>
              )}

              {/* Transit Nodes Grid */}
              <div className="p-6 sm:p-8 flex flex-col gap-6">
                {doc.departureStation && (
                  <div className="grid grid-cols-2 gap-4 border-b border-border pb-6">
                    <div>
                      <span className="text-xs text-on-surface-variant uppercase font-mono block">
                        Origin Station
                      </span>
                      <h2 className="font-heading text-2xl font-bold text-primary mt-0.5">
                        {doc.departureStation}
                      </h2>
                      <span className="font-mono text-sm font-bold text-secondary">
                        {doc.departureTime}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-on-surface-variant uppercase font-mono block">
                        Destination Station
                      </span>
                      <h2 className="font-heading text-2xl font-bold text-primary mt-0.5">
                        {doc.arrivalStation}
                      </h2>
                      <span className="font-mono text-sm font-bold text-secondary">
                        {doc.arrivalTime}
                      </span>
                    </div>
                  </div>
                )}

                {/* Seat & Class Information */}
                {doc.seatOrRoom && (
                  <div className="p-4 rounded-xl bg-surface-container-low border border-border flex items-center justify-between">
                    <div>
                      <span className="text-xs text-on-surface-variant font-medium block">
                        Assigned Seat / Compartment
                      </span>
                      <span className="font-mono text-base font-bold text-primary">
                        {doc.seatOrRoom}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-white border border-border text-xs font-mono font-bold text-emerald-800">
                      ORDINARY RESERVED
                    </span>
                  </div>
                )}

                {/* Additional Spec Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {Object.entries(doc.details).map(([k, v]) => (
                    <div key={k} className="p-3 rounded-lg bg-surface-container-low">
                      <span className="text-on-surface-variant text-[11px] block">{k}</span>
                      <span className="font-semibold text-primary block mt-0.5">{v}</span>
                    </div>
                  ))}
                </div>

                {doc.notes && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                    <strong>Expedition Note:</strong> {doc.notes}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: High-Contrast Aztec Barcode */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white rounded-3xl border border-border shadow-xl p-6 sm:p-8 flex flex-col items-center text-center gap-5">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-secondary font-bold">
                  OFFLINE AZTEC SCANNER DISPLAY
                </span>
                <h3 className="font-heading text-xl font-bold text-primary mt-0.5">
                  Direct Turnstile Inspection
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Present this high-contrast digital Aztec barcode directly to the Shinkansen JR Shinkansen gate scanner.
                </p>
              </div>

              {/* Simulated High-Contrast Aztec / QR Code */}
              <div className="size-60 bg-white p-4 rounded-2xl border-4 border-black flex flex-col items-center justify-center shadow-lg relative group">
                <QrCode className="size-full text-black" strokeWidth={1.5} />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 rounded-xl text-white text-xs font-mono p-4">
                  {doc.barcodeValue}
                </div>
              </div>

              <div className="flex flex-col gap-1 w-full text-xs font-mono">
                <div className="flex justify-between p-2 rounded bg-surface-container-low">
                  <span className="text-on-surface-variant">Barcode Type:</span>
                  <span className="font-bold text-primary">{doc.barcodeType}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-surface-container-low">
                  <span className="text-on-surface-variant">Security Enclave:</span>
                  <span className="font-bold text-emerald-700">AES-256 Validated</span>
                </div>
              </div>

              <button
                type="button"
                onClick={copyBarcode}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-xs transition-colors cursor-pointer"
              >
                <Copy className="size-4" />
                <span>{copied ? "Barcode Copied" : "Copy Barcode Token"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN MAX-BRIGHTNESS TURNSTILE FLASH MODE */}
      {isFlashMode && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-between p-6 sm:p-12 animate-in fade-in duration-150">
          <div className="w-full flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
              JR SHINKANSEN NOZOMI #23 • CAR 7 SEAT 14-E
            </span>
            <button
              type="button"
              onClick={() => setIsFlashMode(false)}
              className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary"
            >
              <X className="size-6" />
            </button>
          </div>

          <div className="flex flex-col items-center text-center gap-4 my-auto">
            <div className="size-80 sm:size-96 border-8 border-black p-6 bg-white shadow-2xl flex items-center justify-center">
              <QrCode className="size-full text-black" strokeWidth={2} />
            </div>
            <span className="font-mono text-sm font-bold tracking-widest text-black">
              {doc.barcodeValue}
            </span>
            <p className="text-xs text-on-surface-variant">
              Hold screen 5cm above the turnstile optical glass.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsFlashMode(false)}
            className="px-8 py-3 rounded-xl bg-primary text-white text-xs font-bold"
          >
            Exit Turnstile Mode
          </button>
        </div>
      )}
    </div>
  );
}
