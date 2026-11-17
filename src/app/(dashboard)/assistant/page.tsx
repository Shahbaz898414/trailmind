"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Cloud,
  Compass,
  Copy,
  Cpu,
  Info,
  Send,
  Wifi,
  WifiOff,
} from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { firebaseAiModel } from "@/lib/firebase/config";
import {
  aiUserMessage,
  buildTripContext,
  ensureDeviceModel,
  getDeviceModelState,
  isOnDeviceApiPresent,
  runChat,
  subscribeDeviceModelState,
  type DeviceModelState,
} from "@/lib/ai/hybrid-model";
import { listTrips } from "@/services/trips";
import { listActivities } from "@/services/itinerary";
import { appendMessage, createConversation } from "@/services/conversations";

/**
 * AI Assistant — real Firebase AI Logic hybrid chat.
 *
 * Every reply comes from the model (`runChat`) and displays the SDK-reported
 * inference source per message. Failures render as an alert capsule with an
 * honest message — there are no canned answers, no simulated latency, and no
 * fake offline simulation anywhere on this page.
 */

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  /** Real inference source: absent for the app-authored intro message. */
  engine?: "on-device" | "cloud" | "unknown";
  latencyMs?: number;
  flashcard?: {
    japanese: string;
    romaji: string;
    english: string;
  };
  contingency?: string;
  /** Honest persistence state (from the conversations service). */
  syncState?: "synced" | "pending" | "local-only";
}

/** App-authored intro — clearly not a model reply (no engine, not persisted). */
const introMessage: ChatMessage = {
  id: "intro",
  sender: "assistant",
  text: "Ask me about routes, temple etiquette, translations, packing or your saved trips. Each reply shows where it actually ran — on this device or in the cloud.",
  timestamp: "",
};

function nowTime(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const STATUS_BADGES: Record<string, string> = {
  draft: "Draft",
  upcoming: "Upcoming",
  "in-progress": "In progress",
  completed: "Completed",
};

export default function AssistantPage() {
  const { status: authStatus, user } = useAuth();
  const uid = user?.uid;

  const [messages, setMessages] = useState<ChatMessage[]>([introMessage]);
  const [inputText, setInputText] = useState("");
  const [engineMode, setEngineMode] = useState<"on-device" | "cloud">("on-device");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [deviceState, setDeviceState] = useState<DeviceModelState>(
    getDeviceModelState
  );
  const [activeTrip, setActiveTrip] = useState<{
    title: string;
    durationDays: number;
    status: string;
    offlineReady: boolean;
    offlineSizeMb: number;
  } | null>(null);

  const conversationIdRef = useRef<string | null>(null);
  const tripContextRef = useRef("");
  const idCounter = useRef(0);

  /* --- real connectivity (replaces the old fake air-gap simulation) ----- */
  useEffect(() => {
    const update = () => setIsOnline(typeof navigator !== "undefined" && navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  /* --- on-device model state machine ------------------------------------ */
  useEffect(() => subscribeDeviceModelState(setDeviceState), []);

  /* --- active trip + bounded context for AI ----------------------------- */
  useEffect(() => {
    if (authStatus !== "authenticated" || !uid) return;
    let cancelled = false;

    (async () => {
      try {
        const page = await listTrips(uid, { pageSize: 8 });
        const trip =
          page.items.find((t) => t.status === "in-progress") ??
          page.items.find((t) => t.status === "upcoming") ??
          page.items[0] ??
          null;
        if (!trip || cancelled) return;

        setActiveTrip({
          title: trip.title,
          durationDays: trip.durationDays,
          status: trip.status,
          offlineReady: trip.offlineReady,
          offlineSizeMb: trip.offlineSizeMb,
        });

        const activities = await listActivities(uid, trip.id).catch(() => []);
        if (cancelled) return;

        tripContextRef.current = buildTripContext(
          {
            title: trip.title,
            destination: trip.destination,
            startDate: trip.startDate,
            endDate: trip.endDate,
            durationDays: trip.durationDays,
            status: trip.status,
            summary: trip.summary,
          },
          activities.map((a) => ({
            day: a.day,
            title: a.title,
            timeSlot: a.timeSlot,
          }))
        );
      } catch (error) {
        // Context is an enhancement — chat still works without it.
        console.warn("[TrailMind] trip context load failed:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authStatus, uid]);

  const suggestedQueries = [
    "Translate taxi card for Ryokan Motonaga",
    "Where is the nearest water spring along Kurama trail?",
    "Solar twilight timing for Kiyomizu-dera dawn",
    "Shinkansen baggage regulations for 14 kg packs",
    "Emergency kanji card for peanut allergy",
  ];

  /** Preference for the current engine selection (see `docs/AI_ARCHITECTURE.md`). */
  const preference = engineMode === "on-device" ? "auto" : "cloud";

  const handleEngineDeviceClick = () => {
    setEngineMode("on-device");
    // User gesture → safe to prepare/download the on-device model.
    const state = getDeviceModelState();
    if (state.status !== "ready" && state.status !== "unsupported") {
      void ensureDeviceModel();
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;
    if (authStatus !== "authenticated" || !uid) {
      setErrorMessage("Sign in to use the AI assistant.");
      return;
    }

    setInputText("");
    setErrorMessage(null);

    const userMsg: ChatMessage = {
      id: `usr-${++idCounter.current}`,
      sender: "user",
      text,
      timestamp: nowTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Lazily create the conversation on the first exchange.
    if (!conversationIdRef.current) {
      try {
        const conversation = await createConversation(uid, {
          title: text.length > 80 ? `${text.slice(0, 79)}…` : text,
        });
        conversationIdRef.current = conversation.id;
      } catch (error) {
        // Chat continues; messages just aren't persisted this session.
        console.warn("[TrailMind] conversation creation failed:", error);
      }
    }
    const conversationId = conversationIdRef.current;

    // Persist the user turn without blocking the model call; report the real
    // sync state back onto the bubble ("syncing" / "device only").
    if (conversationId) {
      void appendMessage(uid, conversationId, { role: "user", content: text })
        .then((result) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === userMsg.id ? { ...m, syncState: result.status } : m
            )
          );
        })
        .catch((error) =>
          console.warn("[TrailMind] user message persist failed:", error)
        );
    }

    const history = messages
      .filter((m) => m.id !== "intro" && m.text)
      .map((m) => ({ role: m.sender, text: m.text }));

    try {
      const result = await runChat({
        question: text,
        history,
        tripContext: tripContextRef.current || undefined,
        preference,
      });

      const botId = `bot-${++idCounter.current}`;
      const botMsg: ChatMessage = {
        id: botId,
        sender: "assistant",
        text: result.reply.reply,
        timestamp: nowTime(),
        engine:
          result.source === "on_device"
            ? "on-device"
            : result.source === "in_cloud"
              ? "cloud"
              : "unknown",
        latencyMs: result.latencyMs,
        flashcard: result.reply.flashcard ?? undefined,
        contingency: result.reply.contingency ?? undefined,
      };
      setMessages((prev) => [...prev, botMsg]);

      if (conversationId) {
        void appendMessage(uid, conversationId, {
          role: "assistant",
          content: result.reply.reply,
          source:
            result.source === "on_device"
              ? "on-device"
              : result.source === "in_cloud"
                ? "cloud"
                : null,
        })
          .then((persistence) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === botId ? { ...m, syncState: persistence.status } : m
              )
            );
          })
          .catch((error) =>
            console.warn("[TrailMind] assistant message persist failed:", error)
          );
      }
    } catch (error) {
      setErrorMessage(aiUserMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const copyFlashcard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const deviceStatusLabel = (() => {
    switch (deviceState.status) {
      case "initializing":
        return `DOWNLOADING ${Math.round(deviceState.progress * 100)}%`;
      case "ready":
        return "READY";
      case "unsupported":
        return "UNAVAILABLE";
      case "error":
        return "ERROR";
      default:
        return "NOT PREPARED";
    }
  })();

  const deviceDotClass =
    deviceState.status === "ready"
      ? "bg-emerald-500"
      : deviceState.status === "initializing"
        ? "bg-amber-500 animate-pulse"
        : deviceState.status === "error"
          ? "bg-red-400"
          : "bg-outline";

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
                {activeTrip?.title ?? "No saved trip yet"}
              </span>
              {activeTrip &&
                (activeTrip.offlineReady ? (
                  <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-primary text-[10px] font-bold">
                    Offline pack ({activeTrip.offlineSizeMb} MB)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-primary text-[10px] font-bold">
                    {activeTrip.durationDays} days ·{" "}
                    {STATUS_BADGES[activeTrip.status] ?? activeTrip.status}
                  </span>
                ))}
            </div>
          </div>
        </div>

        {/* Engine Switcher & Connectivity Indicator */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={handleEngineDeviceClick}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                engineMode === "on-device"
                  ? "bg-white text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Cpu className="size-3.5 text-primary" />
              <span>On-Device (Preferred)</span>
              <span className={`size-1.5 rounded-full ${deviceDotClass}`} />
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
              <span>Cloud Only</span>
            </button>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
              isOnline
                ? "bg-surface-container text-on-surface-variant"
                : "bg-amber-100 text-amber-900 border border-amber-300"
            }`}
          >
            <span
              className={`size-2 rounded-full ${
                isOnline ? "bg-emerald-500" : "bg-amber-600 animate-ping"
              }`}
            />
            <span>{isOnline ? "Online" : "Offline"}</span>
            {isOnline ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
          </div>
        </div>
      </div>

      {/* Real Offline Banner (browser connectivity, not a simulation) */}
      {!isOnline && (
        <div className="w-full bg-amber-500/15 border-b border-amber-500/30 px-6 py-2 flex items-center justify-between text-xs text-amber-950 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-700" />
            <strong>Offline:</strong>
            <span>
              Cloud replies are unavailable — on-device answers still work when the
              local model is ready.
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold text-amber-900">
            Local inference only
          </span>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar: Suggested Queries & Device Model Status */}
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
                  onClick={() => void handleSend(q)}
                  disabled={isLoading}
                  className="p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-left text-xs font-medium text-on-surface border border-border/60 transition-all flex items-center justify-between group cursor-pointer disabled:opacity-60"
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
                ON-DEVICE MODEL
              </span>
              <span
                className={`text-[10px] font-mono font-bold ${
                  deviceState.status === "ready"
                    ? "text-emerald-700"
                    : deviceState.status === "initializing"
                      ? "text-amber-700"
                      : deviceState.status === "error"
                        ? "text-red-700"
                        : "text-on-surface-variant"
                }`}
              >
                {deviceStatusLabel}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {deviceState.status === "unsupported"
                ? "This browser does not expose the Prompt API (Gemini Nano), so replies run in the cloud instead."
                : "Runs locally in your browser when available. Replies fall back to the cloud automatically and show the real source."}
            </p>
            <div className="p-2.5 rounded-lg bg-surface-container-low text-[11px] font-mono text-primary flex items-center justify-between">
              <span>Prompt API (Gemini Nano)</span>
              <span>{isOnDeviceApiPresent() ? "Detected" : "Not available"}</span>
            </div>
            {(deviceState.status === "idle" || deviceState.status === "error") &&
              isOnDeviceApiPresent() && (
                <button
                  type="button"
                  onClick={() => void ensureDeviceModel()}
                  className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-left text-xs font-semibold text-primary border border-border/60 transition-all cursor-pointer"
                >
                  Prepare local model (downloads once)
                </button>
              )}
            {deviceState.status === "error" && (
              <p className="text-[11px] text-red-700">{deviceState.message}</p>
            )}
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
                  {msg.sender === "assistant" && msg.engine && (
                    <span className="inline-flex items-center gap-1 font-semibold text-primary">
                      <Cpu className="size-3 text-secondary" />
                      {msg.engine === "on-device"
                        ? "On-Device AI"
                        : msg.engine === "cloud"
                          ? `Cloud AI`
                          : "AI · source unknown"}
                    </span>
                  )}
                  {msg.latencyMs ? (
                    <span className="text-emerald-700 font-semibold">
                      • {msg.latencyMs}ms
                    </span>
                  ) : null}
                  {msg.syncState === "pending" && (
                    <span className="text-amber-700 font-semibold">• syncing</span>
                  )}
                  {msg.syncState === "local-only" && (
                    <span className="text-amber-700 font-semibold">
                      • device only
                    </span>
                  )}
                  {msg.timestamp && <span>{msg.timestamp}</span>}
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

            {/* Honest loading state while the model runs */}
            {isLoading && (
              <div
                className="flex flex-col gap-1.5 items-start"
                role="status"
                aria-label="The model is composing a reply"
              >
                <div className="flex items-center gap-2 text-[11px] font-mono text-on-surface-variant px-1">
                  <span className="inline-flex items-center gap-1 font-semibold text-primary">
                    <Cpu className="size-3 text-secondary" />
                    Thinking…
                  </span>
                </div>
                <div className="p-4 rounded-2xl rounded-tl-sm bg-surface-container-low border border-border shadow-sm flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-on-surface-variant/50 animate-bounce" />
                  <span
                    className="size-1.5 rounded-full bg-on-surface-variant/50 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="size-1.5 rounded-full bg-on-surface-variant/50 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Honest error capsule (never a fabricated reply) */}
          {errorMessage && (
            <div
              role="alert"
              className="mx-4 mb-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-950 text-xs flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2 min-w-0">
                <AlertTriangle className="size-4 text-red-700 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-[11px] font-semibold text-red-800 underline shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Bottom Chat Input Form */}
          <div className="p-4 border-t border-border bg-surface-container-low/40">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend();
              }}
              className="flex items-center gap-2 bg-white rounded-xl border border-border p-2 shadow-sm focus-within:ring-1 focus-within:ring-primary"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
                placeholder="Ask about waypoint directions, temple etiquette, or translations..."
                className="flex-1 bg-transparent px-3 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="size-8 rounded-lg bg-primary hover:bg-primary-container text-white flex items-center justify-center transition-all cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="size-4" />
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between text-[11px] text-on-surface-variant px-1 font-mono">
              <span>
                Hybrid AI via Firebase AI Logic · {firebaseAiModel} · on-device or
                cloud per reply
              </span>
              <span>No canned responses — real source shown per answer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
