"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  HardDrive,
  Key,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [activeTab, setActiveTab] = useState<"seed" | "email">("seed");
  const [seedWords, setSeedWords] = useState<string[]>(Array(12).fill(""));
  const [email, setEmail] = useState("alex@example.com");
  const [isRecovering, setIsRecovering] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSeedChange = (index: number, val: string) => {
    const updated = [...seedWords];
    updated[index] = val;
    setSeedWords(updated);
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRecovering(true);
    setTimeout(() => {
      setIsRecovering(false);
      setIsSuccess(true);
    }, 700);
  };

  return (
    <div className="w-full min-h-screen bg-surface flex flex-col items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden">
      {/* Subtle Ambient Glows */}
      <div className="absolute -top-32 -left-32 size-96 rounded-full bg-secondary-container/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 size-80 rounded-full bg-primary-fixed/20 blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl mx-auto flex flex-col relative z-10">
        {/* Top Header Group */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="size-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-primary mb-4 border border-border">
            <Lock className="size-8 text-primary" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant mb-2 text-xs font-semibold">
            <ShieldCheck className="size-3.5 text-primary" />
            <span className="uppercase tracking-wider">Cryptographic Safeguard</span>
          </div>

          <h1 className="font-heading text-3xl font-bold text-primary tracking-tight">
            Recover Your Vault
          </h1>
          <p className="text-sm text-on-surface-variant max-w-lg mt-2 leading-relaxed">
            TrailMind utilizes zero-knowledge client-side encryption. Choose your recovery vector to restore access to your offline cached itineraries, encrypted passes, and local biometric credentials.
          </p>
        </div>

        {/* Recovery Card Panel */}
        <div className="w-full bg-white rounded-2xl shadow-xl border border-border p-6 sm:p-8 flex flex-col">
          {/* Vector Selector Switch */}
          <div className="grid grid-cols-2 p-1 bg-surface-container-low rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("seed")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "seed"
                  ? "bg-white text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Key className="size-4" />
              <span>12-Word Seed Phrase</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("email")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "email"
                  ? "bg-white text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Mail className="size-4" />
              <span>Cloud Security Token</span>
            </button>
          </div>

          {isSuccess ? (
            <div className="flex flex-col items-center text-center py-6 gap-3">
              <div className="size-12 rounded-full bg-secondary-fixed text-primary flex items-center justify-center">
                <ShieldCheck className="size-6" />
              </div>
              <h2 className="font-heading text-xl font-bold text-primary">
                Cryptographic Keys Restored
              </h2>
              <p className="text-xs text-on-surface-variant max-w-md">
                Your local vault session has been successfully re-keyed. You can now access all offline cached expeditions.
              </p>
              <Link
                href="/login"
                className="mt-4 flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold"
              >
                Proceed to Login
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleRecovery} className="flex flex-col gap-5">
              {activeTab === "seed" ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-on-surface">
                      Enter Emergency Mnemonic Recovery Phrase
                    </span>
                    <span className="text-[11px] font-mono text-on-surface-variant">
                      BIP-39 / AES-256
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {Array.from({ length: 12 }).map((_, idx) => (
                      <div key={idx} className="relative flex items-center">
                        <span className="absolute left-2.5 text-[10px] font-mono text-on-surface-variant/60">
                          {idx + 1}.
                        </span>
                        <input
                          type="text"
                          required
                          value={seedWords[idx]}
                          onChange={(e) => handleSeedChange(idx, e.target.value)}
                          placeholder="word"
                          className="w-full bg-surface-container-low pl-7 pr-2 py-2 rounded-lg text-xs font-mono text-on-surface border border-border focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Hint for demo prototype: Enter any 12 words or click below to simulate recovery.
                  </p>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-on-surface" htmlFor="rec-email">
                      Registered Dispatch Email
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3.5 size-4 text-on-surface-variant pointer-events-none" />
                      <input
                        id="rec-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@example.com"
                        className="w-full bg-white text-on-surface text-sm pl-10 pr-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-container-low text-xs text-on-surface-variant">
                    A single-use cryptographic recovery link will be sent with zero disclosure of your private keys.
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isRecovering}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg bg-primary hover:bg-primary-container text-white font-semibold text-xs tracking-wide shadow-md transition-all cursor-pointer disabled:opacity-75"
              >
                <span>{isRecovering ? "Verifying Keys..." : "Restore Cryptographic Keys"}</span>
                <ArrowRight className="size-4" />
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-on-surface-variant">
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-primary hover:text-primary-container font-semibold"
            >
              <ArrowLeft className="size-3.5" /> Back to Sign In
            </Link>
            <span className="font-mono text-[11px]">Enclave Status: Locked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
