"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Copy,
  Download,
  Flame,
  Languages,
  Mic,
  Plus,
  Radio,
  Sparkles,
  Volume2,
} from "lucide-react";

import { samplePhrases, type PhraseItem } from "@/data/languages";
import { useAuth } from "@/components/auth/auth-provider";
import { useAsyncResource } from "@/hooks/use-async-resource";
import {
  listSavedPhrases,
  type SavedPhraseRecord,
} from "@/services/language";

export default function SavedPhrasesAudioStudioPage() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const phrasesKey = uid ? `phrases:${uid}` : null;
  const { data: dbPhrases } = useAsyncResource<SavedPhraseRecord[]>(
    phrasesKey,
    async () => {
      if (!uid) return [];
      return listSavedPhrases(uid);
    }
  );

  const phrases: PhraseItem[] =
    dbPhrases && dbPhrases.length > 0
      ? dbPhrases.map((p) => ({
          id: p.id,
          english: p.english,
          japaneseKanji: p.japaneseKanji,
          japaneseFurigana: p.japaneseFurigana || p.romaji,
          romaji: p.romaji,
          category: p.category,
          contextNote: p.contextNote,
          audioKey: p.audioKey,
          isSavedForOfflineFlashcard: p.isSavedForOfflineFlashcard,
          taxiCardLargePrint: p.category === "Transport & Taxi",
        }))
      : samplePhrases.filter((p) => p.isSavedForOfflineFlashcard);

  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTaxiModal, setShowTaxiModal] = useState(false);

  const currentPhrase = phrases[activeIdx] || phrases[0];

  const handlePlayVoice = () => {
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-surface">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
        {/* Breadcrumb & Mode Telemetry */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-mono">
            <Link href="/language" className="hover:text-primary transition-colors flex items-center gap-1 font-semibold">
              <ArrowLeft className="size-3.5" /> Language Assistant
            </Link>
            <span>/</span>
            <span className="text-primary font-bold">Saved Phrases Audio Studio</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold shadow-sm">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>100% Offline Ready • 140/140 Audio Clips</span>
            </span>
          </div>
        </div>

        {/* Title & Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-primary tracking-tight">
              Saved Phrases & Field Audio Studio
            </h1>
            <p className="text-sm text-on-surface-variant max-w-3xl mt-1 leading-relaxed">
              Autonomous zero-latency neural phrasebook with on-device TTS audio, phonetic Furigana overlays, and large-print emergency flashcards.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowTaxiModal(true)}
              className="px-4 py-2.5 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold shadow-sm hover:bg-amber-200 transition-all cursor-pointer"
            >
              Full-Screen Taxi Card Mode
            </button>
          </div>
        </div>

        {/* Featured Large-Print Flashcard Studio */}
        <div className="w-full bg-inverse-surface text-inverse-on-surface rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col justify-between gap-8 min-h-[380px]">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-white/10 text-tertiary-fixed text-xs font-mono font-bold uppercase tracking-wider">
              FLASHCARD {activeIdx + 1} OF {phrases.length} • {currentPhrase.category}
            </span>

            <button
              type="button"
              onClick={handlePlayVoice}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isPlaying
                  ? "bg-emerald-500 text-white animate-pulse"
                  : "bg-tertiary-fixed text-on-tertiary-fixed hover:bg-white"
              }`}
            >
              <Volume2 className="size-4" />
              <span>{isPlaying ? "Kokoro-TTS Playing..." : "Speak Phrase (Neural)"}</span>
            </button>
          </div>

          {/* Main Japanese Kanji & Furigana */}
          <div className="flex flex-col gap-3 my-auto">
            <p className="text-sm font-mono text-emerald-200 tracking-wider">
              {currentPhrase.japaneseFurigana}
            </p>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold text-white tracking-wide leading-tight">
              {currentPhrase.japaneseKanji}
            </h2>
            <p className="text-sm font-mono text-white/80">
              {currentPhrase.romaji}
            </p>
            <p className="text-base text-emerald-100/90 font-medium italic mt-2 border-t border-white/15 pt-3">
              &quot;{currentPhrase.english}&quot;
            </p>
          </div>

          {/* Bottom Card Controls */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-xs text-white/60 font-mono">
              Context: {currentPhrase.contextNote}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={activeIdx === 0}
                onClick={() => setActiveIdx((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
              >
                Previous Card
              </button>
              <button
                type="button"
                disabled={activeIdx === phrases.length - 1}
                onClick={() => setActiveIdx((prev) => Math.min(phrases.length - 1, prev + 1))}
                className="px-5 py-2 rounded-lg bg-primary-fixed text-primary text-xs font-bold disabled:opacity-40 transition-all hover:bg-white cursor-pointer"
              >
                Next Card →
              </button>
            </div>
          </div>
        </div>

        {/* Saved Phrases List Grid */}
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-xl font-bold text-primary">All Staged Offline Flashcards</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {phrases.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => setActiveIdx(idx)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  idx === activeIdx
                    ? "bg-white border-primary shadow-md ring-1 ring-primary"
                    : "bg-white border-border hover:bg-surface-container-low"
                }`}
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-semibold text-[10px]">
                      {p.category}
                    </span>
                    <span className="text-[11px] font-mono text-on-surface-variant">Card #{idx + 1}</span>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-primary">{p.english}</h3>
                  <p className="font-heading font-bold text-base text-on-surface mt-1">{p.japaneseKanji}</p>
                  <p className="text-xs text-on-surface-variant font-mono">{p.romaji}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                  <span className="text-[11px] font-mono text-emerald-800 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="size-3 text-emerald-600" /> Offline TTS Ready
                  </span>
                  <span className="text-xs font-bold text-primary">Select Card</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FULL-SCREEN NIGHT TAXI FLASHCARD MODAL */}
      {showTaxiModal && (
        <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between p-6 sm:p-12 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-amber-300 font-bold uppercase tracking-widest">
              NIGHT TAXI PRESENTATION MODE (MAX BRIGHTNESS)
            </span>
            <button
              type="button"
              onClick={() => setShowTaxiModal(false)}
              className="px-4 py-2 rounded-lg bg-white/20 text-white text-xs font-bold hover:bg-white/30"
            >
              Exit Flashcard
            </button>
          </div>

          <div className="my-auto flex flex-col gap-6 text-center max-w-4xl mx-auto">
            <p className="text-base sm:text-xl font-mono text-emerald-300">
              {currentPhrase.japaneseFurigana}
            </p>
            <h1 className="font-heading text-4xl sm:text-6xl font-bold text-white tracking-wide leading-tight">
              {currentPhrase.japaneseKanji}
            </h1>
            <p className="text-lg sm:text-xl font-mono text-white/80">
              {currentPhrase.romaji}
            </p>
            <p className="text-base text-amber-200 mt-4 italic">
              &quot;{currentPhrase.english}&quot;
            </p>
          </div>

          <div className="text-center text-xs text-white/60 font-mono">
            Hold screen in front of taxi driver. Tap anywhere to return.
          </div>
        </div>
      )}
    </div>
  );
}
