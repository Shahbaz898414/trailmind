"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Compass,
  Download,
  Filter,
  Heart,
  Layers,
  MapPin,
  Mountain,
  Plus,
  Search,
  Sparkles,
  Upload,
} from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { useAsyncResource } from "@/hooks/use-async-resource";
import {
  listSavedPlaces,
  type SavedPlaceRecord,
} from "@/services/saved-places";

export default function SavedPlacesPage() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMapHud, setShowMapHud] = useState(true);

  // Real saved places for the signed-in user (Firestore cache serves them
  // offline once fetched).
  const placesKey = uid ? `places:${uid}` : null;
  const { data, error, loading } = useAsyncResource<SavedPlaceRecord[]>(
    placesKey,
    async () => {
      if (!uid) return [];
      return listSavedPlaces(uid);
    }
  );
  const places = data ?? [];
  const cachedCount = places.filter((p) => p.offlineCached).length;
  const nearest = places.find((p) => p.proximityKm != null) ?? places[0] ?? null;
  const hudRegion = (nearest?.region || nearest?.city || "Saved Places").toUpperCase();

  const copyCoordinates = async (place: SavedPlaceRecord) => {
    if (!place.coordinates) return;
    try {
      await navigator.clipboard.writeText(place.coordinates);
      setCopiedId(place.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard unavailable (insecure context) — nothing to report.
    }
  };

  const categories = [
    "All",
    "Temple",
    "Ryokan",
    "Mountain Hut",
    "Trail",
    "Food",
  ];

  const filteredPlaces = places.filter((place) => {
    if (activeCategory !== "All" && place.category !== activeCategory) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        place.name.toLowerCase().includes(q) ||
        place.city.toLowerCase().includes(q) ||
        place.region.toLowerCase().includes(q) ||
        (place.japaneseName && place.japaneseName.includes(q))
      );
    }
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-surface">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
        {/* Top Utility Context Bar */}
        <div className="flex flex-col gap-1.5 pt-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-on-surface-variant">
            <span className="size-2 rounded-full bg-primary" />
            <span>Expedition Field Archive</span>
            <span>•</span>
            <span>Storage Layer 04</span>
            <span>•</span>
            <span className="text-secondary font-bold">Encrypted Local SQLite & GeoTIFF</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mt-1">
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-primary tracking-tight">
                Saved Places & Off-Grid Bookmarks
              </h1>
              <p className="text-sm text-on-surface-variant max-w-3xl mt-1 leading-relaxed">
                Curated collection of alpine huts, cultural landmarks, local eateries, and offline GPS coordinates across destinations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold shadow-sm">
                {loading
                  ? "Loading places…"
                  : `${places.length} Saved Place${places.length === 1 ? "" : "s"} • ${cachedCount} Cached Offline`}
              </span>

              <button
                type="button"
                onClick={() => setShowMapHud(!showMapHud)}
                className="px-4 py-2 rounded-xl bg-white border border-border text-on-surface hover:bg-surface-container text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                {showMapHud ? "Hide Topo HUD" : "Show Topo HUD"}
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls Surface */}
        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm flex flex-col gap-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved places by name, Japanese kanji (#ryokan, #onsen), or coordinates..."
              className="w-full bg-surface-container-low pl-10 pr-4 py-2.5 rounded-xl border border-border text-xs text-on-surface placeholder:text-on-surface-variant focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {cat === "All" ? "All Places" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Split Layout: Topo HUD Preview + Places Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Topo HUD Radar/Elevation Panel */}
          {showMapHud && (
            <div className="lg:col-span-4 bg-white rounded-2xl border border-border shadow-sm p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase font-bold text-secondary">
                  TOPO MAP HUD • {hudRegion} SECTOR
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  10m CONTOURS
                </span>
              </div>

              {/* Decorative Topo SVG Canvas */}
              <div className="h-56 w-full rounded-xl bg-surface-container-low border border-border relative overflow-hidden flex flex-col items-center justify-center p-4">
                <svg className="absolute inset-0 w-full h-full stroke-primary/30 fill-none" strokeWidth="1.2">
                  <path d="M 0 50 Q 100 20, 200 80 T 400 60" />
                  <path d="M 0 100 Q 120 70, 220 130 T 400 110" />
                  <path d="M 0 150 Q 140 120, 240 180 T 400 160" />
                  <path d="M 0 200 Q 160 170, 260 230 T 400 210" />
                </svg>
                <div className="relative z-10 flex flex-col items-center text-center gap-1">
                  <Mountain className="size-8 text-primary" />
                  <span className="font-bold text-xs text-primary">
                    {places.length === 0
                      ? "No places saved yet"
                      : `${cachedCount} of ${places.length} places cached for offline`}
                  </span>
                  <span className="font-mono text-[11px] text-on-surface-variant">
                    {nearest?.coordinates
                      ? `Centered: ${nearest.coordinates}`
                      : "No coordinates on file"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-xs font-mono">
                <div className="flex justify-between p-2 rounded bg-surface-container-low">
                  <span className="text-on-surface-variant">Nearest Waypoint:</span>
                  <span className="font-bold text-primary text-right">
                    {nearest
                      ? `${nearest.name}${nearest.proximityKm != null ? ` (${nearest.proximityKm} km)` : ""}`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded bg-surface-container-low">
                  <span className="text-on-surface-variant">Archive Size:</span>
                  <span className="font-bold text-secondary">
                    {places.length} places • {cachedCount} offline
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Places Cards Grid */}
          <div className={showMapHud ? "lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6" : "col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
            {loading ? (
              <div className="col-span-full py-12 text-center text-sm text-on-surface-variant bg-white rounded-2xl border border-border">
                Loading your saved places…
              </div>
            ) : error ? (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-border">
                <p className="text-sm text-error">{error}</p>
              </div>
            ) : filteredPlaces.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-border">
                <p className="text-sm text-on-surface-variant">
                  {places.length === 0
                    ? "No saved places yet — bookmarks you save appear here."
                    : "No places match this filter."}
                </p>
              </div>
            ) : null}

            {filteredPlaces.map((place) => (
              <div
                key={place.id}
                className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
              >
                <div className="relative h-48 bg-surface-container-high overflow-hidden">
                  {place.image ? (
                    <Image
                      src={place.image}
                      alt={place.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-container to-surface-container-high">
                      <MapPin className="size-10 text-primary/50" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/95 text-primary text-xs font-bold shadow-sm">
                      {place.category}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white font-mono text-[11px]">
                    {place.elevation}
                  </div>
                </div>

                <div className="p-5 flex flex-col justify-between flex-1 gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs text-secondary">
                      <span>{place.region}, {place.city}</span>
                      {place.proximityKm && (
                        <span className="font-mono font-bold text-primary">
                          {place.proximityKm} km away
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-heading text-base font-bold text-primary group-hover:text-primary-container transition-colors">
                        {place.name}
                      </h3>
                      {place.japaneseName && (
                        <span className="text-xs font-bold text-on-surface-variant">
                          {place.japaneseName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                      {place.notes}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                    <span
                      className={`font-mono text-[11px] flex items-center gap-1 font-semibold ${
                        place.offlineCached
                          ? "text-emerald-800"
                          : "text-on-surface-variant"
                      }`}
                    >
                      <CheckCircle2
                        className={`size-3 ${
                          place.offlineCached ? "text-emerald-600" : "text-on-surface-variant"
                        }`}
                      />
                      {place.offlineCached ? "Cached Offline" : "Online only"}
                    </span>

                    <button
                      type="button"
                      onClick={() => void copyCoordinates(place)}
                      disabled={!place.coordinates}
                      className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-primary hover:text-white text-on-surface text-xs font-semibold transition-colors disabled:opacity-50 disabled:hover:bg-surface-container disabled:hover:text-on-surface"
                    >
                      {copiedId === place.id
                        ? "Coordinates Copied"
                        : place.coordinates
                          ? "Copy Coordinates"
                          : "No Coordinates"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
