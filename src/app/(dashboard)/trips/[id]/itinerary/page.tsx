"use client";

import { use, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Cpu,
  Edit2,
  HardDrive,
  MapPin,
  Mountain,
  Plus,
  Radio,
  RefreshCw,
  Sliders,
  Sparkles,
  Sun,
  Terminal,
  Trash2,
  Users,
  Wifi,
  X,
  Zap,
} from "lucide-react";

import { kyoto12DayItinerary, type ItineraryDay, type ItineraryActivity } from "@/data/itinerary";
import { sampleTripsList } from "@/data/trips";
import { useAuth } from "@/components/auth/auth-provider";
import { useAsyncResource } from "@/hooks/use-async-resource";
import {
  listActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  type ActivityRecord,
} from "@/services/itinerary";

export default function TripItineraryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const trip =
    sampleTripsList.find((t) => t.id === resolvedParams.id) || sampleTripsList[0];

  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const [localDays, setLocalDays] = useState<ItineraryDay[] | null>(null);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHudOpen, setIsHudOpen] = useState(false);
  const [isEmptyState, setIsEmptyState] = useState(false);

  // Load activities from offline Dexie / Firestore
  const itineraryKey = uid ? `itinerary:${uid}:${resolvedParams.id}` : null;
  const { data: dbActivities } = useAsyncResource<ActivityRecord[]>(
    itineraryKey,
    async () => {
      if (!uid) return [];
      return listActivities(uid, resolvedParams.id);
    }
  );

  // Merge loaded activities into days if they exist
  const baseDays = useMemo(() => {
    if (!dbActivities || dbActivities.length === 0) return kyoto12DayItinerary;
    const updated = kyoto12DayItinerary.map((d) => ({ ...d, activities: [...d.activities] }));
    for (const act of dbActivities) {
      const targetDay = updated.find((d) => d.dayNumber === act.day);
      if (targetDay) {
        const existingIdx = targetDay.activities.findIndex((a) => a.id === act.id);
        const mapped: ItineraryActivity = {
          id: act.id,
          timeSlot: act.timeSlot,
          title: act.title,
          category: act.category,
          location: act.location,
          coordinates: act.coordinates,
          duration: act.duration,
          elevation: act.elevation,
          crowdLevel: act.crowdLevel,
          status: act.status,
          description: act.description,
          solarEphemeris: act.solarEphemeris || undefined,
          notes: act.notes || undefined,
          audioKey: act.audioKey || undefined,
        };
        if (existingIdx >= 0) {
          targetDay.activities[existingIdx] = mapped;
        } else {
          targetDay.activities.push(mapped);
        }
      }
    }
    return updated;
  }, [dbActivities]);

  const days = localDays ?? baseDays;

  // Edit drawer state
  const [editingActivity, setEditingActivity] = useState<ItineraryActivity | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formCategory, setFormCategory] = useState<ItineraryActivity["category"]>("Culture");
  const [formNotes, setFormNotes] = useState("");

  const currentDay = days.find((d) => d.dayNumber === selectedDayNumber) || days[0];

  const openAddDrawer = () => {
    setEditingActivity(null);
    setFormTitle("");
    setFormTime("15:00 – 16:30");
    setFormLocation("Higashiyama, Kyoto");
    setFormCategory("Culture");
    setFormNotes("");
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (act: ItineraryActivity) => {
    setEditingActivity(act);
    setFormTitle(act.title);
    setFormTime(act.timeSlot);
    setFormLocation(act.location);
    setFormCategory(act.category);
    setFormNotes(act.notes || "");
    setIsDrawerOpen(true);
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingActivity) {
      // Update existing in local state
      setLocalDays((prev) => {
        const current = prev ?? baseDays;
        return current.map((d) => {
          if (d.dayNumber !== selectedDayNumber) return d;
          return {
            ...d,
            activities: d.activities.map((a) =>
              a.id === editingActivity.id
                ? {
                    ...a,
                    title: formTitle,
                    timeSlot: formTime,
                    location: formLocation,
                    category: formCategory,
                    notes: formNotes,
                  }
                : a
            ),
          };
        });
      });

      // Persist to backend / offline outbox if authenticated
      if (uid) {
        void updateActivity(uid, resolvedParams.id, editingActivity.id, {
          title: formTitle,
          timeSlot: formTime,
          location: formLocation,
          category: formCategory,
          notes: formNotes,
        }).catch((err) => console.warn("[TrailMind] updateActivity failed:", err));
      }
    } else {
      // Add new
      const newAct: ItineraryActivity = {
        id: `act-${Date.now()}`,
        title: formTitle,
        timeSlot: formTime,
        location: formLocation,
        category: formCategory,
        coordinates: "34.9982° N, 135.7818° E",
        duration: "90 min",
        elevation: "65m",
        crowdLevel: "Low",
        status: "confirmed",
        description: formNotes || "Added to local on-device itinerary.",
        notes: formNotes,
      };
      setLocalDays((prev) => {
        const current = prev ?? baseDays;
        return current.map((d) => {
          if (d.dayNumber !== selectedDayNumber) return d;
          return {
            ...d,
            activities: [...d.activities, newAct],
          };
        });
      });

      // Persist to backend / offline outbox if authenticated
      if (uid) {
        void createActivity(uid, resolvedParams.id, {
          day: selectedDayNumber,
          date: currentDay?.date || "2026-04-01",
          title: formTitle,
          timeSlot: formTime,
          location: formLocation,
          category: formCategory,
          notes: formNotes,
        }).catch((err) => console.warn("[TrailMind] createActivity failed:", err));
      }
    }
    setIsDrawerOpen(false);
  };

  const handleDeleteActivity = (actId: string) => {
    setLocalDays((prev) => {
      const current = prev ?? baseDays;
      return current.map((d) => {
        if (d.dayNumber !== selectedDayNumber) return d;
        return {
          ...d,
          activities: d.activities.filter((a) => a.id !== actId),
        };
      });
    });

    if (uid) {
      void deleteActivity(uid, resolvedParams.id, actId).catch((err) =>
        console.warn("[TrailMind] deleteActivity failed:", err)
      );
    }
  };

  return (
    <div className="w-full min-h-screen bg-surface relative">
      <div className="flex flex-col w-full">
        {/* Immersive Expedition Banner */}
        <div className="relative w-full bg-primary overflow-hidden text-white bg-gradient-to-r from-[#003426] via-[#164b3b] to-[#0f3429]">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
            {/* Top Breadcrumb & Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-200">
                <Link
                  href={`/trips/${trip.id}`}
                  className="hover:text-white transition-colors flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Expedition Hub</span>
                </Link>
                <span>/</span>
                <span className="text-white font-medium">{trip.title}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-primary font-bold text-xs">
                  <CheckCircle2 className="size-3.5 text-primary" />
                  <span>100% Offline Cached</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs backdrop-blur-md">
                  <Cpu className="size-3.5" />
                  <span>Local Micro-Model Active</span>
                </span>
              </div>
            </div>

            {/* Banner Main Title & Controls */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs uppercase tracking-widest text-emerald-300 font-semibold">
                  AUTONOMOUS WAYPOINT TIMELINE
                </span>
                <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  {trip.destination} • 12-Day Itinerary
                </h1>
                <p className="text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
                  Dual-constraint solver with solar ephemeris alignment, walking buffer buffers, and offline transit schedules.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsHudOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Terminal className="size-4 text-emerald-300" />
                  <span>Synthesis HUD</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEmptyState(!isEmptyState)}
                  className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-emerald-200 text-xs font-mono transition-colors"
                >
                  {isEmptyState ? "View Populated" : "Toggle Empty State"}
                </button>

                <button
                  type="button"
                  onClick={openAddDrawer}
                  className="px-4 py-2.5 rounded-xl bg-secondary-fixed text-primary text-xs font-bold transition-all hover:bg-white flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Plus className="size-4" />
                  <span>Add Activity</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State View */}
        {isEmptyState ? (
          <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center text-center gap-6">
            <div className="size-20 rounded-3xl bg-surface-container-high flex items-center justify-center text-primary">
              <Compass className="size-10" />
            </div>
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-secondary font-bold">
                ZERO-STAGE ITINERARY CANVAS
              </span>
              <h2 className="font-heading text-2xl font-bold text-primary mt-1">
                No Activities Scheduled Yet
              </h2>
              <p className="text-sm text-on-surface-variant max-w-md mt-2 leading-relaxed">
                Trigger autonomous AI synthesis to compile all 12 days based on your terrain pacing directives and flight gates.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsHudOpen(true);
                setTimeout(() => {
                  setIsEmptyState(false);
                }, 2000);
              }}
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Sparkles className="size-4 text-emerald-300" />
              <span>Synthesize 12-Day Itinerary with AI</span>
            </button>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 w-full">
            {/* Horizontal Day Selector Tab Strip */}
            <div className="w-full bg-white rounded-2xl border border-border p-2 shadow-sm overflow-x-auto flex items-center gap-2">
              {days.map((d) => {
                const active = d.dayNumber === selectedDayNumber;
                return (
                  <button
                    key={d.dayNumber}
                    type="button"
                    onClick={() => setSelectedDayNumber(d.dayNumber)}
                    className={`px-4 py-2.5 rounded-xl text-left shrink-0 transition-all flex flex-col gap-0.5 cursor-pointer ${
                      active
                        ? "bg-primary text-white shadow-sm"
                        : "hover:bg-surface-container-low text-on-surface"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs">Day {d.dayNumber}</span>
                      <span
                        className={`size-1.5 rounded-full ${
                          active ? "bg-emerald-300" : "bg-primary/40"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[10px] truncate max-w-[110px] ${
                        active ? "text-emerald-200" : "text-on-surface-variant"
                      }`}
                    >
                      {d.theme}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Day Ephemeris & Atmospheric Header */}
            <div className="w-full bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold uppercase font-mono">
                    DAY {currentDay.dayNumber < 10 ? `0${currentDay.dayNumber}` : currentDay.dayNumber} OF {days.length}
                  </span>
                  <span className="text-xs text-on-surface-variant font-mono">
                    {currentDay.date} • {currentDay.weather}
                  </span>
                </div>
                <h2 className="font-heading text-2xl font-bold text-primary tracking-tight">
                  {currentDay.title}
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Theme: {currentDay.theme} • Temp: {currentDay.tempRange}
                </p>
              </div>

              {/* Solar Ephemeris Lock */}
              <div className="p-3 rounded-xl bg-surface-container-low border border-border/80 flex items-center gap-3 shrink-0">
                <Sun className="size-5 text-amber-600 shrink-0" />
                <div className="flex flex-col text-xs font-mono">
                  <span className="font-bold text-primary">
                    Golden Hour: {currentDay.goldenHour}
                  </span>
                  <span className="text-on-surface-variant text-[11px]">
                    Dawn {currentDay.sunrise} • Dusk {currentDay.sunset}
                  </span>
                </div>
              </div>
            </div>

            {/* Activity Timeline List */}
            <div className="flex flex-col gap-4">
              {currentDay.activities.map((act) => (
                <div
                  key={act.id}
                  className="w-full bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-sm flex flex-col md:flex-row gap-5 hover:shadow-md transition-shadow"
                >
                  {/* Left Column: Time & Duration */}
                  <div className="md:w-44 flex md:flex-col justify-between md:justify-start items-baseline gap-1 shrink-0 border-b md:border-b-0 md:border-r border-border pb-3 md:pb-0 md:pr-4">
                    <span className="font-mono text-sm font-bold text-primary">
                      {act.timeSlot}
                    </span>
                    <span className="text-xs text-on-surface-variant font-mono">
                      {act.duration}
                    </span>
                    <span className="text-[11px] font-mono text-secondary mt-1 hidden md:block">
                      {act.elevation}
                    </span>
                  </div>

                  {/* Center Column: Activity Details & Optional Thumbnail */}
                  <div className="flex-1 flex flex-col justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-surface-container text-[11px] font-semibold text-primary">
                            {act.category}
                          </span>
                          <span className="text-xs text-on-surface-variant flex items-center gap-1">
                            <MapPin className="size-3 text-secondary" />
                            {act.location}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-on-surface-variant">
                          {act.coordinates}
                        </span>
                      </div>

                      <h3 className="font-heading text-lg font-bold text-primary">
                        {act.title}
                      </h3>

                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {act.description}
                      </p>

                      {act.solarEphemeris && (
                        <div className="inline-flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/50 w-fit">
                          <Sun className="size-3" />
                          <span>{act.solarEphemeris}</span>
                        </div>
                      )}

                      {act.notes && (
                        <div className="p-2.5 rounded-lg bg-surface-container-low text-xs text-on-surface-variant/90 border border-border/50">
                          <strong>Field Note:</strong> {act.notes}
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                      <span className="text-[11px] font-mono text-emerald-800 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="size-3 text-emerald-600" /> Confirmed Offline
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditDrawer(act)}
                          className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                          title="Edit Activity"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteActivity(act.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                          title="Delete Activity"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Add Activity Trigger */}
            <button
              type="button"
              onClick={openAddDrawer}
              className="w-full py-3.5 border-2 border-dashed border-border hover:border-primary rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold text-primary hover:bg-white transition-all cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Add Waypoint / Activity to Day {currentDay.dayNumber}</span>
            </button>
          </div>
        )}
      </div>

      {/* SLIDE-OUT ACTIVITY DRAWER (Matching add_edit_activity_drawer_trailmind) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto p-6 sm:p-8 animate-in slide-in-from-right duration-300">
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-secondary font-bold">
                    WAYPOINT EDITOR • DAY {currentDay.dayNumber}
                  </span>
                  <h3 className="font-heading text-xl font-bold text-primary">
                    {editingActivity ? "Edit Activity Details" : "Add New Waypoint"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form id="activity-form" onSubmit={handleSaveActivity} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Activity Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Nanzen-ji Aqueduct & Murin-an Gardens"
                    className="w-full bg-surface-container-low px-3.5 py-2.5 rounded-xl border border-border text-xs text-on-surface font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-on-surface">Time Window</label>
                    <input
                      type="text"
                      required
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      placeholder="09:00 – 11:30"
                      className="w-full bg-surface-container-low px-3.5 py-2.5 rounded-xl border border-border text-xs font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-on-surface">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) =>
                        setFormCategory(e.target.value as ItineraryActivity["category"])
                      }
                      className="w-full bg-surface-container-low px-3 py-2.5 rounded-xl border border-border text-xs"
                    >
                      <option value="Culture">⛩️ Culture</option>
                      <option value="Nature">🌲 Nature</option>
                      <option value="Dining">🍵 Dining</option>
                      <option value="Transit">🚄 Transit</option>
                      <option value="Lodging">🏮 Lodging</option>
                      <option value="Heritage">🏯 Heritage</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Location / Coordinates</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Higashiyama Historic Quarter, Kyoto"
                    className="w-full bg-surface-container-low px-3.5 py-2.5 rounded-xl border border-border text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Field Notes & Directives</label>
                  <textarea
                    rows={4}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Add details about trail entry fees, temple shoe rules, or audio guide keys..."
                    className="w-full bg-surface-container-low p-3.5 rounded-xl border border-border text-xs leading-relaxed"
                  />
                </div>

                <div className="p-3 rounded-lg bg-surface-container-low border border-border text-xs text-on-surface-variant flex items-center gap-2">
                  <Sun className="size-4 text-amber-600 shrink-0" />
                  <span>Solar Ephemeris will be locked automatically for Day {currentDay.dayNumber}.</span>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2.5 rounded-lg border border-border text-xs font-semibold hover:bg-surface-container text-on-surface"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="activity-form"
                className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Save Waypoint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI SYNTHESIS TERMINAL HUD MODAL (Matching ai_itinerary_synthesis_hud_trailmind) */}
      {isHudOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-[#111815] text-emerald-300 rounded-2xl border border-emerald-900/60 shadow-2xl p-6 sm:p-8 flex flex-col gap-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="size-5 text-emerald-400" />
                <span className="font-bold text-sm text-white">AI Itinerary Synthesis HUD</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] border border-emerald-800">
                  FP16 Quantized
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsHudOpen(false)}
                className="p-1 rounded text-emerald-400 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2 bg-black/40 p-4 rounded-xl border border-emerald-900/40 text-[11px] leading-relaxed max-h-72 overflow-y-auto">
              <p className="text-emerald-400">&gt; [INIT] Dual-Inference engine handshake established.</p>
              <p className="text-emerald-300">&gt; [MODEL] Local Gemma-2B INT4 weights mapped to Apple Neural Engine.</p>
              <p className="text-emerald-300">&gt; [GEO] Bounding box loaded: 35.0116° N, 135.7681° E (Kyoto Basin Sector 04).</p>
              <p className="text-amber-300">&gt; [SOLAR] Ephemeris calculated: Dawn 05:42 JST | Sunset 18:24 JST | Azimuth 92.4°.</p>
              <p className="text-emerald-300">&gt; [CONSTRAINTS] Pacing set to Moderate (10-15 km/day). Walking buffers enforced at 45m.</p>
              <p className="text-emerald-300">&gt; [TRANSIT] Shinkansen Nozomi #23 schedule cross-referenced with arrival gate.</p>
              <p className="text-emerald-300">&gt; [ALLERGY] Peanut allergy emergency prompt compiled into Japanese kanji cards.</p>
              <p className="text-emerald-400 font-bold">&gt; [COMPLETE] 12-day autonomous itinerary compiled into IndexedDB (0 errors, 14 waypoints).</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-emerald-400/70">Status: Autonomous Execution Optimal</span>
              <button
                type="button"
                onClick={() => setIsHudOpen(false)}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs"
              >
                Close HUD
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
