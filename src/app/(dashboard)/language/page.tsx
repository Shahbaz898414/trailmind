"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Copy,
  Languages,
  Mic,
  Radio,
  RotateCcw,
  Sparkles,
  Volume2,
  Zap,
} from "lucide-react";

import { samplePhrases, type PhraseItem } from "@/data/languages";

export default function LanguagePage() {
  const [activeTab, setActiveTab] = useState<"console" | "phrasebook">("console");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Translation console state
  const [englishInput, setEnglishInput] = useState("Please take me to Ryokan Motonaga in Higashiyama near Ishibei-koji.");
  const [translatedOutput, setTranslatedOutput] = useState({
    kanji: "東山の石塀小路近くの「元奈古旅館」までお願いします。",
    furigana: "ひがしやま の いしべいこうじ ちかく の もとなご りょかん まで おねがいします。",
    romaji: "Higashiyama no Ishibei-kōji chikaku no 'Motonaga Ryokan' made onegaishimasu.",
  });
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const categories = [
    "All",
    "Transport & Taxi",
    "Emergency & Medical",
    "Dining & Dietary",
    "Lodging & Ryokan",
    "Direction & Trail",
  ];

  const handleTranslate = () => {
    // Simulated instant offline neural translation
    if (englishInput.toLowerCase().includes("water")) {
      setTranslatedOutput({
        kanji: "近くに飲める湧き水はありますか？",
        furigana: "ちかく に のめる わきみず は あります か？",
        romaji: "Chikaku ni nomeru wakimizu wa arimasu ka?",
      });
    } else if (englishInput.toLowerCase().includes("bill") || englishInput.toLowerCase().includes("check")) {
      setTranslatedOutput({
        kanji: "お会計をお願いします。",
        furigana: "おかいけい を おねがいします。",
        romaji: "O-kaikei o onegaishimasu.",
      });
    } else {
      setTranslatedOutput({
        kanji: "東山の石塀小路近くの「元奈古旅館」までお願いします。",
        furigana: "ひがしやま の いしべいこうじ ちかく の もとなご りょかん まで おねがいします。",
        romaji: "Higashiyama no Ishibei-kōji chikaku no 'Motonaga Ryokan' made onegaishimasu.",
      });
    }
  };

  const handlePlayAudio = () => {
    setIsPlayingAudio(true);
    setTimeout(() => setIsPlayingAudio(false), 2000);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(translatedOutput.kanji);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  const filteredPhrases = samplePhrases.filter((p) => {
    if (selectedCategory === "All") return true;
    return p.category === selectedCategory;
  });

  return (
    <div className="w-full min-h-screen bg-surface">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
        {/* Breadcrumb & Engine Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-mono">
            <span>Language Assistant</span>
            <span>/</span>
            <span className="text-primary font-bold">Live Field Translation Console</span>
            <span>/</span>
            <span>Kansai Alpine Sector</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold shadow-sm">
              <Zap className="size-3.5 text-primary" />
              <span>100% Offline Neural Voice & Furigana</span>
            </span>
            <Link
              href="/language/phrases"
              className="px-3.5 py-1 rounded-full bg-primary hover:bg-primary-container text-white text-xs font-semibold shadow-sm transition-all"
            >
              Audio Studio Flashcards →
            </Link>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-border w-fit shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("console")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "console"
                ? "bg-primary text-white shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Live Translation Console
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("phrasebook")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "phrasebook"
                ? "bg-primary text-white shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Bilingual Phrasebook ({samplePhrases.length} Cards)
          </button>
        </div>

        {/* TAB 1: Live Translation Console */}
        {activeTab === "console" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
            {/* Left: Input & Translated Cards */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Language Selector Bar */}
              <div className="bg-white rounded-2xl border border-border shadow-sm p-5 flex flex-col gap-5">
                <div className="flex items-center justify-between bg-surface-container-low p-2 rounded-xl">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm">
                    <span className="text-[10px] font-mono uppercase text-secondary font-bold">SOURCE</span>
                    <span className="font-heading font-bold text-sm text-primary">English</span>
                  </div>

                  <button
                    type="button"
                    className="size-8 rounded-full bg-white border border-border hover:bg-surface-container flex items-center justify-center text-primary transition-transform hover:rotate-180"
                  >
                    <Languages className="size-4" />
                  </button>

                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm">
                    <span className="text-[10px] font-mono uppercase text-amber-700 font-bold">TARGET</span>
                    <span className="font-heading font-bold text-sm text-primary">Japanese (Kanji + Furigana)</span>
                  </div>
                </div>

                {/* Input Text Area */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-on-surface">Input English Field Prompt</label>
                  <textarea
                    rows={3}
                    value={englishInput}
                    onChange={(e) => setEnglishInput(e.target.value)}
                    placeholder="Type in English (e.g. Where is the nearest trail water spring?)..."
                    className="w-full bg-surface-container-low p-3.5 rounded-xl border border-border text-xs leading-relaxed focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-mono text-on-surface-variant">
                      Kokoro-82M on-device phonetic engine
                    </span>
                    <button
                      type="button"
                      onClick={handleTranslate}
                      className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-sm cursor-pointer"
                    >
                      Translate Offline
                    </button>
                  </div>
                </div>

                {/* Translation Output Card */}
                <div className="p-6 rounded-2xl bg-inverse-surface text-inverse-on-surface shadow-xl flex flex-col gap-4 mt-2">
                  <div className="flex items-center justify-between text-tertiary-fixed text-xs font-mono">
                    <span className="uppercase font-bold">JAPANESE (HIGH CONTRAST DISPLAY)</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="flex items-center gap-1 hover:text-white transition-colors"
                      >
                        <Copy className="size-3.5" />
                        <span>{isCopied ? "Copied" : "Copy"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handlePlayAudio}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          isPlayingAudio
                            ? "bg-emerald-500 text-white animate-pulse"
                            : "bg-tertiary-fixed text-on-tertiary-fixed hover:bg-white"
                        }`}
                      >
                        <Volume2 className="size-3.5" />
                        <span>{isPlayingAudio ? "Playing 100% Neural Voice" : "Audio Playback"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Phonetic Furigana Subtitle */}
                  <div className="flex flex-col gap-1.5">
                    <p className="text-xs text-emerald-200/90 font-mono tracking-wide">
                      {translatedOutput.furigana}
                    </p>
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-wide leading-relaxed">
                      {translatedOutput.kanji}
                    </h2>
                    <p className="text-xs text-white/70 font-mono mt-1">
                      {translatedOutput.romaji}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Quick Field Phrase Prompts */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm flex flex-col gap-3">
                <span className="font-mono text-xs font-bold uppercase text-secondary">
                  COMMON DISPATCH PROMPTS
                </span>
                <div className="flex flex-col gap-2">
                  {samplePhrases.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setEnglishInput(p.english);
                        setTranslatedOutput({
                          kanji: p.japaneseKanji,
                          furigana: p.japaneseFurigana,
                          romaji: p.romaji,
                        });
                      }}
                      className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-left border border-border text-xs transition-colors flex flex-col gap-1 group cursor-pointer"
                    >
                      <span className="text-[10px] font-mono text-secondary font-bold uppercase">
                        {p.category}
                      </span>
                      <span className="font-semibold text-primary group-hover:text-primary-container">
                        {p.english}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Bilingual Phrasebook Matrix */}
        {activeTab === "phrasebook" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCategory(c)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === c
                      ? "bg-primary text-white shadow-sm"
                      : "bg-white border border-border text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Phrase Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPhrases.map((phrase) => (
                <div
                  key={phrase.id}
                  className="bg-white rounded-2xl border border-border shadow-sm p-6 flex flex-col justify-between gap-4 group hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-semibold text-[11px]">
                        {phrase.category}
                      </span>
                      <span className="text-[11px] font-mono text-on-surface-variant">
                        {phrase.contextNote}
                      </span>
                    </div>

                    <h3 className="font-heading text-lg font-bold text-primary mt-1">
                      {phrase.english}
                    </h3>

                    <div className="p-4 rounded-xl bg-surface-container-low border border-border/60 flex flex-col gap-1 mt-1">
                      <span className="text-[11px] text-secondary font-mono">{phrase.japaneseFurigana}</span>
                      <span className="font-heading text-xl font-bold text-on-surface">{phrase.japaneseKanji}</span>
                      <span className="text-xs text-on-surface-variant font-mono">{phrase.romaji}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                    <span className="text-[11px] font-mono text-emerald-800 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="size-3 text-emerald-600" /> Kokoro Audio Ready
                    </span>

                    <button
                      type="button"
                      onClick={handlePlayAudio}
                      className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-primary hover:text-white text-primary font-semibold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Volume2 className="size-3.5" />
                      <span>Play Voice</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
