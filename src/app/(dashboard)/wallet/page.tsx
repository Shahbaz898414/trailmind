"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Fingerprint,
  HeartPulse,
  Key,
  Lock,
  Plus,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Train,
  Trash2,
  X,
} from "lucide-react";

import { travelDocumentsList, type TravelDocumentItem } from "@/data/travel-documents";

export default function WalletPage() {
  const [documents, setDocuments] = useState<TravelDocumentItem[]>(travelDocumentsList);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // New Document Modal Form
  const [docCategory, setDocCategory] = useState<TravelDocumentItem["category"]>("Transport");
  const [docTitle, setDocTitle] = useState("");
  const [docRef, setDocRef] = useState("");
  const [docIssuer, setDocIssuer] = useState("");
  const [docDates, setDocDates] = useState("28 MAR – 08 APR 2026");

  const categories = ["All", "Transport", "Lodging", "Insurance", "Pass / Visa"];

  const filteredDocs = documents.filter((doc) => {
    if (activeCategory === "All") return true;
    return doc.category.toLowerCase().includes(activeCategory.toLowerCase());
  });

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    const newDoc: TravelDocumentItem = {
      id: `doc-${Date.now()}`,
      category: docCategory,
      title: docTitle,
      referenceCode: docRef || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      issuer: docIssuer || "Verified Provider",
      carrierOrHotel: docIssuer || "Expedition Service",
      validDates: docDates,
      encryptionStatus: "AES-256 Encrypted (On-Device)",
      barcodeType: "Aztec Code",
      barcodeValue: `TM-${docTitle.toUpperCase()}-VERIFIED`,
      status: "active",
      details: {
        "Status": "Confirmed",
        "Storage": "Local Encrypted Enclave",
      },
      notes: "Added to offline vault.",
    };

    setDocuments([newDoc, ...documents]);
    setIsModalOpen(false);
    setDocTitle("");
    setDocRef("");
    setDocIssuer("");
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="w-full min-h-screen bg-surface">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
        {/* Top Context & Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                <Lock className="size-3" /> Encrypted Vault
              </span>
              <span className="text-xs text-on-surface-variant font-mono">
                • Hardware Enclave Tier-4
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-primary tracking-tight">
              Travel Wallet
            </h1>
            <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
              AES-256 Encrypted on-device vault with instant offline QR & barcode display. Operates with zero network dependency.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsLocked(!isLocked)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isLocked
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : "bg-white hover:bg-surface-container border-border text-on-surface"
              }`}
            >
              <Fingerprint className="size-4 text-primary" />
              <span>{isLocked ? "Vault Locked" : "Lock Enclave"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold transition-all shadow-md cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Add New Document</span>
            </button>
          </div>
        </div>

        {/* Status HUD & Security Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-border shadow-sm flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-on-surface-variant uppercase font-mono font-semibold">
                  STORED ITEMS
                </span>
                <span className="font-heading text-xl font-bold text-primary block mt-1">
                  {documents.length} Passes
                </span>
              </div>
              <div className="size-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-primary">
                <FileText className="size-5" />
              </div>
            </div>
            <div className="text-xs text-on-surface-variant flex justify-between border-t border-border/50 pt-2 font-mono">
              <span>Active: {documents.filter((d) => d.status === "active").length}</span>
              <span className="text-emerald-700 font-bold">100% Offline</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-border shadow-sm flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-on-surface-variant uppercase font-mono font-semibold">
                  CIPHER STANDARD
                </span>
                <span className="font-heading text-xl font-bold text-primary block mt-1">
                  AES-256-GCM
                </span>
              </div>
              <div className="size-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                <ShieldCheck className="size-5" />
              </div>
            </div>
            <div className="text-xs text-on-surface-variant flex justify-between border-t border-border/50 pt-2 font-mono">
              <span>On-Chip Key</span>
              <span className="text-primary font-bold">Hardware Enclave</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-border shadow-sm flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-on-surface-variant uppercase font-mono font-semibold">
                  AZTEC BARCODES
                </span>
                <span className="font-heading text-xl font-bold text-primary block mt-1">
                  High Contrast
                </span>
              </div>
              <div className="size-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                <QrCode className="size-5" />
              </div>
            </div>
            <div className="text-xs text-on-surface-variant flex justify-between border-t border-border/50 pt-2 font-mono">
              <span>Full Screen Max Bright</span>
              <span className="text-secondary font-bold">Instant Lock</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-border shadow-sm flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-on-surface-variant uppercase font-mono font-semibold">
                  EMERGENCY (ICE)
                </span>
                <span className="font-heading text-xl font-bold text-red-700 block mt-1">
                  Directives Staged
                </span>
              </div>
              <div className="size-10 rounded-xl bg-red-100 flex items-center justify-center text-red-700">
                <HeartPulse className="size-5" />
              </div>
            </div>
            <div className="text-xs text-on-surface-variant flex justify-between border-t border-border/50 pt-2 font-mono">
              <Link href="/wallet/emergency" className="text-red-700 font-bold hover:underline flex items-center gap-1">
                <span>View ICE Directives</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Emergency Field Safety Callout Banner */}
        <div className="w-full bg-red-50 border border-red-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
              <HeartPulse className="size-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-red-950">
                Field Medical Directives & Embassy Dispatch
              </h3>
              <p className="text-xs text-red-900/80">
                Blood Type O+ and severe peanut allergy kanji cards staged for immediate offline access.
              </p>
            </div>
          </div>
          <Link
            href="/wallet/emergency"
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold whitespace-nowrap text-center transition-colors shadow-sm"
          >
            Open Emergency Safety Hub
          </Link>
        </div>

        {/* Pass Categories Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white border border-border text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Document Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-border shadow-sm p-6 flex flex-col justify-between gap-4 group hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-primary text-xs font-semibold">
                      {doc.category}
                    </span>
                    <span className="font-mono text-xs text-on-surface-variant">
                      {doc.referenceCode}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {doc.barcodeType}
                  </span>
                </div>

                <div>
                  <h3 className="font-heading text-lg font-bold text-primary group-hover:text-primary-container transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {doc.carrierOrHotel} • Valid: {doc.validDates}
                  </p>
                </div>

                {doc.seatOrRoom && (
                  <div className="p-3 rounded-xl bg-surface-container-low border border-border text-xs flex items-center justify-between font-mono">
                    <span className="text-on-surface-variant">Reservation Lock:</span>
                    <span className="font-bold text-primary">{doc.seatOrRoom}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                <span className="text-[11px] font-mono text-on-surface-variant flex items-center gap-1">
                  <ShieldCheck className="size-3 text-secondary" />
                  {doc.encryptionStatus}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 rounded-lg text-on-surface-variant hover:text-error transition-colors"
                    title="Remove Document"
                  >
                    <Trash2 className="size-4" />
                  </button>

                  <Link
                    href={`/wallet/documents/${doc.id}`}
                    className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <span>Inspect Pass</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD / EDIT DOCUMENT MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-border p-6 sm:p-8 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-secondary font-bold">
                  AES-256 VAULT ENTRY
                </span>
                <h3 className="font-heading text-xl font-bold text-primary">
                  Add Travel Document / Pass
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Document Category</label>
                <select
                  value={docCategory}
                  onChange={(e) =>
                    setDocCategory(e.target.value as TravelDocumentItem["category"])
                  }
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-border text-xs"
                >
                  <option value="Transport">🚄 Transport / Rail Ticket</option>
                  <option value="Lodging">🏮 Hotel / Ryokan Voucher</option>
                  <option value="Insurance">🛡️ Travel Medical Insurance</option>
                  <option value="Pass / Visa">🛂 Visa / Rail Pass</option>
                  <option value="Permit">📋 Wilderness Trail Permit</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Document Title</label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Hakone Free Pass 3-Day"
                  className="w-full bg-surface-container-low px-3.5 py-2 rounded-xl border border-border text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Reference / Confirmation #</label>
                  <input
                    type="text"
                    value={docRef}
                    onChange={(e) => setDocRef(e.target.value)}
                    placeholder="e.g. HK-99482"
                    className="w-full bg-surface-container-low px-3.5 py-2 rounded-xl border border-border text-xs font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Issuer / Carrier</label>
                  <input
                    type="text"
                    value={docIssuer}
                    onChange={(e) => setDocIssuer(e.target.value)}
                    placeholder="e.g. Odakyu Electric Railway"
                    className="w-full bg-surface-container-low px-3.5 py-2 rounded-xl border border-border text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Valid Dates / Timeframe</label>
                <input
                  type="text"
                  value={docDates}
                  onChange={(e) => setDocDates(e.target.value)}
                  className="w-full bg-surface-container-low px-3.5 py-2 rounded-xl border border-border text-xs font-mono"
                />
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low text-xs text-on-surface-variant flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                <span>Zero cloud transmission. Document is written to local IndexedDB with AES-256-GCM.</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Encrypt & Save Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
