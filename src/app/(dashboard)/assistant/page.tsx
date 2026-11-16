"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Cloud,
  Compass,
  Copy,
  Cpu,
  Fingerprint,
  HardDrive,
  Info,
  MapPin,
  Mic,
  Mountain,
  Radio,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  Volume2,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  engine: "on-device" | "cloud";
  latencyMs?: number;
  flashcard?: {
    japanese: string;
    romaji: string;
    english: string;
  };
  contingency?: string;
}

const defaultMessages: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "user",
    text: "We just arrived at Kyoto Station on the Haruka Express. What is the fastest and easiest way to reach Ryokan Motonaga in Higashiyama with two heavy trekking packs?",
    timestamp: "15:32 JST",
    engine: "on-device",
  },
  {
    id: "msg-2",
    sender: "assistant",
    text: "Recommended transit vector: Take MK Taxi or City Taxi from Kyoto Station Karasuma Exit directly to the Ishibei-koji pedestrian entrance (approx. 15 minutes, ¥1,500 – ¥1,800). City buses #206 and #100 are currently carrying high tourist volume (85% capacity). Here is the offline driver card to show your driver:",
    timestamp: "15:32 JST",
    engine: "on-device",
    latencyMs: 12,
    flashcard: {
      japanese: "東山の石塀小路近くの「元奈古旅館」までお願いします。",
      romaji: "Higashiyama no Ishibei-kōji chikaku no 'Motonaga Ryokan' made onegaishimasu.",
      english: "Please take me to Ryokan Motonaga in Higashiyama near Ishibei-koji.",
    },
    contingency: "Pedestrian notice: Taxis cannot enter Ishibei-koji alley itself. Driver will drop you at the Shimogawara-dori lantern arch (40m walk on flat flagstone).",
  },
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessages);
  const [inputText, setInputText] = useState("");
  const [engineMode, setEngineMode] = useState<"on-device" | "cloud">("on-device");
  const [isOfflineSim, setIsOfflineSim] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const idCounter = useRef(0);

  const suggestedQueries = [
    "Translate taxi card for Ryokan Motonaga",
    "Where is the nearest water spring along Kurama trail?",
    "Solar twilight timing for Kiyomizu-dera dawn",
    "Shinkansen baggage regulations for 14 kg packs",
    "Emergency kanji card for peanut allergy",
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${++idCounter.current}`,
      sender: "user",
      text,
      timestamp: "Just now",
      engine: engineMode,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");

    // Simulate smart responsive answer
    setTimeout(() => {
      let replyText = "";
      let flashcard = undefined;
      let contingency = undefined;

      if (text.toLowerCase().includes("water") || text.toLowerCase().includes("spring")) {
        replyText = "Local Topographic Vector: Natural mountain spring detected at Kurama-dera lower shrine fountain (35.1180° N, 135.7810° E). Clean potable water tested daily by temple wardens. Bring 1.5L bottle.";
        contingency = "No water taps between summit ridge and Kibune river gorge (3.8 km dry traverse).";
      } else if (text.toLowerCase().includes("allergy") || text.toLowerCase().includes("peanut")) {
        replyText = "Emergency Medical Declaration: Display this card to restaurant staff or emergency personnel:";
        flashcard = {
          japanese: "重度の落花生（ピーナッツ）アレルギーがあります。落花生やピーナッツ油は入っていますか？",
          romaji: "Jūdo no peanut allergy ga arimasu. Rakkasei ya peanut-yu wa haitte imasu ka?",
          english: "I have a severe peanut allergy. Does this dish contain peanuts or peanut oil?",
        };
      } else {
        replyText = `Local Gemma-2B Engine (${engineMode === "on-device" ? "On-Device Neural Model" : "Cloud Gemini Escalation"}): Synthesizing route context for Kyoto Basin Sector 04. Waypoints confirmed in offline vector cache.`;
      }

      const botMsg: ChatMessage = {
        id: `bot-${++idCounter.current}`,
        sender: "assistant",
        text: replyText,
        timestamp: "Just now",
        engine: isOfflineSim ? "on-device" : engineMode,
        latencyMs: isOfflineSim ? 9 : 24,
        flashcard,
        contingency,
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  const copyFlashcard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-surface">
      {/* Top Command & Engine Selector Bar */}
      <div className="w-full bg-white border-b border-border px-4 sm:px-6 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-sm">
        {/* Active Trip Target */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center shrink-0">
            <Compass className="size-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase font-mono tracking-wider text-on-surface-variant font-bold">
              ACTIVE EXPEDITION CONTEXT
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary truncate">
                Kyoto Cherry Blossom & Higashiyama Ridge
              </span>
              <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-primary text-[10px] font-bold">
                Offline Cached (612 MB)
              </span>
            </div>
          </div>
        </div>

        {/* Engine Switcher & Offline Simulation Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setEngineMode("on-device")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                engineMode === "on-device"
                  ? "bg-white text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Cpu className="size-3.5 text-primary" />
              <span>Gemma-2B (On-Device)</span>
              <span className="size-1.5 rounded-full bg-emerald-500" />
            </button>

            <button
              type="button"
              onClick={() => setEngineMode("cloud")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                engineMode === "cloud"
                  ? "bg-white text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Cloud className="size-3.5" />
              <span>Cloud Gemini (Standby)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsOfflineSim(!isOfflineSim)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              isOfflineSim
                ? "bg-amber-100 text-amber-900 border border-amber-300"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <span className={`size-2 rounded-full ${isOfflineSim ? "bg-amber-600 animate-ping" : "bg-outline"}`} />
            <span>{isOfflineSim ? "Zero-Cellular Mode Active" : "Simulate Air-Gap"}</span>
            {isOfflineSim ? <WifiOff className="size-3.5" /> : <Wifi className="size-3.5" />}
          </button>
        </div>
      </div>

      {/* Offline Alert Caution Banner (When Simulation Active) */}
      {isOfflineSim && (
        <div className="w-full bg-amber-500/15 border-b border-amber-500/30 px-6 py-2 flex items-center justify-between text-xs text-amber-950 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-700" />
            <strong>Zero-Cellular Air-Gap Engaged:</strong>
            <span>All responses synthesized strictly through local Gemma-2B weights and IndexedDB vector store.</span>
          </div>
          <span className="font-mono text-[11px] font-bold text-amber-900">0 KB Network Egress</span>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar: Suggested Queries & Local Vectors */}
        <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm flex flex-col gap-3">
            <span className="font-mono text-xs font-bold uppercase text-secondary">
              SUGGESTED FIELD QUERIES
            </span>
            <div className="flex flex-col gap-2">
              {suggestedQueries.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSend(q)}
                  className="p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-left text-xs font-medium text-on-surface border border-border/60 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span className="line-clamp-2">{q}</span>
                  <ArrowRight className="size-3 text-secondary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase text-secondary">
                LOCAL VECTOR INDEX
              </span>
              <span className="text-[10px] font-mono text-emerald-700 font-bold">14 WAYPOINTS</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Spatial embeddings loaded into browser memory. Instant semantic search across Kyoto shrines, transit gates, and ryokan vouchers.
            </p>
            <div className="p-2.5 rounded-lg bg-surface-container-low text-[11px] font-mono text-primary flex items-center justify-between">
              <span>HNSW Cosine Graph</span>
              <span>Ready (0ms Latency)</span>
            </div>
          </div>
        </aside>

        {/* Center: Live Chat Stream */}
        <div className="flex-1 w-full bg-white rounded-2xl border border-border shadow-sm flex flex-col min-h-[620px] justify-between overflow-hidden">
          {/* Chat Messages Log */}
          <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[520px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col gap-1.5 ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                {/* Message Header Meta */}
                <div className="flex items-center gap-2 text-[11px] font-mono text-on-surface-variant px-1">
                  {msg.sender === "assistant" && (
                    <span className="inline-flex items-center gap-1 font-semibold text-primary">
                      <Cpu className="size-3 text-secondary" />
                      {msg.engine === "on-device" ? "Gemma-2B (Local Edge)" : "Cloud Gemini"}
                    </span>
                  )}
                  {msg.latencyMs && (
                    <span className="text-emerald-700 font-semibold">• {msg.latencyMs}ms</span>
                  )}
                  <span>{msg.timestamp}</span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-2xl max-w-2xl text-xs leading-relaxed shadow-sm ${
                    msg.sender === "user"
                      ? "bg-primary text-white rounded-tr-sm"
                      : "bg-surface-container-low border border-border text-on-surface rounded-tl-sm"
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Japanese Taxi Flashcard UI */}
                  {msg.flashcard && (
                    <div className="mt-3 p-4 rounded-xl bg-inverse-surface text-inverse-on-surface shadow-md flex flex-col gap-2">
                      <div className="flex items-center justify-between text-tertiary-fixed text-[11px] font-mono uppercase">
                        <span>TAXI PRESENTATION CARD (HIGH CONTRAST)</span>
                        <button
                          type="button"
                          onClick={() => copyFlashcard(msg.flashcard!.japanese)}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          <Copy className="size-3" />
                          <span>{isCopied ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                      <p className="font-heading text-xl font-bold text-white tracking-wide">
                        {msg.flashcard.japanese}
                      </p>
                      <p className="text-xs text-emerald-200/80 font-mono">
                        {msg.flashcard.romaji}
                      </p>
                      <p className="text-[11px] text-white/70 italic border-t border-white/10 pt-1.5">
                        &quot;{msg.flashcard.english}&quot;
                      </p>
                    </div>
                  )}

                  {/* Contingency HUD Box */}
                  {msg.contingency && (
                    <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-2">
                      <Info className="size-4 text-amber-700 shrink-0 mt-0.5" />
                      <span>{msg.contingency}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Chat Input Form */}
          <div className="p-4 border-t border-border bg-surface-container-low/40">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 bg-white rounded-xl border border-border p-2 shadow-sm focus-within:ring-1 focus-within:ring-primary"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about waypoint directions, temple etiquette, or translations..."
                className="flex-1 bg-transparent px-3 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none"
              />
              <button
                type="submit"
                className="size-8 rounded-lg bg-primary hover:bg-primary-container text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
              >
                <Send className="size-4" />
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between text-[11px] text-on-surface-variant px-1 font-mono">
              <span>Prototype Mode: Simulated response from local mock data</span>
              <span>Zero external credentials leaked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
