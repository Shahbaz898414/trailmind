export interface TripModel {
  id: string;
  title: string;
  destination: string;
  region: string;
  country: string;
  countryCode: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  status: "upcoming" | "draft" | "completed" | "in-progress";
  travelers: number;
  offlineStatus: "downloaded" | "downloading" | "sync_required" | "not_downloaded";
  offlineSizeMb: number;
  coverImage: string;
  heroImage?: string;
  summary: string;
  terrainType: string;
  averageElevation: string;
  packWeightKg: number;
  maxWeightKg: number;
  satelliteSyncCadence: string;
}

export const sampleTripsList: TripModel[] = [
  {
    id: "trip-kyoto-2026",
    title: "Kyoto Cherry Blossom & Higashiyama Ridge",
    destination: "Kyoto, Japan",
    region: "Kansai",
    country: "Japan",
    countryCode: "JP",
    startDate: "2026-03-28",
    endDate: "2026-04-08",
    durationDays: 12,
    status: "upcoming",
    travelers: 2,
    offlineStatus: "downloaded",
    offlineSizeMb: 612,
    coverImage: "/images/stitch/my-trips-arashiyama-autumn.jpg",
    heroImage: "/images/stitch/dashboard-northern-alps-dawn.jpg",
    summary: "Ancient temple dawn circuits, sacred cedar groves of Kurama, bamboo forests, and night taxi navigation through Gion.",
    terrainType: "Cobblestone, mountain stone paths, temple steps",
    averageElevation: "280m (Max 848m Mt. Hiei)",
    packWeightKg: 8.5,
    maxWeightKg: 12.0,
    satelliteSyncCadence: "Hourly Iridium Mesh"
  },
  {
    id: "trip-ladakh-2026",
    title: "Ladakh Adventure & High Passes",
    destination: "Leh, Ladakh",
    region: "Jammu & Kashmir",
    country: "India",
    countryCode: "IN",
    startDate: "2026-06-15",
    endDate: "2026-06-22",
    durationDays: 7,
    status: "upcoming",
    travelers: 2,
    offlineStatus: "downloaded",
    offlineSizeMb: 485,
    coverImage: "/images/stitch/dashboard-zanskar-monastery.jpg",
    summary: "Acclimatization in Leh, Magnetic Hill, crossing Khardung La to Nubra Valley and high-altitude solitude at Pangong Lake.",
    terrainType: "Glacial moraine, high desert gravel, high mountain passes",
    averageElevation: "4,200m",
    packWeightKg: 10.2,
    maxWeightKg: 14.0,
    satelliteSyncCadence: "30-min inReach Pulse"
  },
  {
    id: "trip-kerala-2026",
    title: "Kerala Escape & Western Ghats",
    destination: "Munnar, Kerala",
    region: "Western Ghats",
    country: "India",
    countryCode: "IN",
    startDate: "2026-08-10",
    endDate: "2026-08-15",
    durationDays: 5,
    status: "draft",
    travelers: 2,
    offlineStatus: "not_downloaded",
    offlineSizeMb: 320,
    coverImage: "/images/stitch/my-trips-dolomites-green.jpg",
    summary: "Misty tea plantation ridges, Anamudi rainforest trails, spice sanctuaries and backwater canoe bivouac.",
    terrainType: "Tea plantation tracks, tropical cloudforest trail",
    averageElevation: "1,600m",
    packWeightKg: 6.8,
    maxWeightKg: 10.0,
    satelliteSyncCadence: "Manual Sync Only"
  },
  {
    id: "trip-jaipur-2025",
    title: "Jaipur Heritage Tour & Aravalli Forts",
    destination: "Jaipur, Rajasthan",
    region: "Rajasthan",
    country: "India",
    countryCode: "IN",
    startDate: "2025-11-14",
    endDate: "2025-11-18",
    durationDays: 4,
    status: "completed",
    travelers: 2,
    offlineStatus: "downloaded",
    offlineSizeMb: 240,
    coverImage: "/images/stitch/my-trips-hokkaido-onsen.jpg",
    summary: "Amber Fort bastions, Nahargarh sunset ridge, astronomical wonders of Jantar Mantar and Old Pink City bazaars.",
    terrainType: "Fort ramparts, sandstone hills, urban heritage streets",
    averageElevation: "430m",
    packWeightKg: 5.5,
    maxWeightKg: 9.0,
    satelliteSyncCadence: "Archived"
  },
  {
    id: "trip-patagonia-2026",
    title: "Torres del Paine W-Circuit",
    destination: "Puerto Natales, Chile",
    region: "Magallanes",
    country: "Chile",
    countryCode: "CL",
    startDate: "2026-11-04",
    endDate: "2026-11-14",
    durationDays: 10,
    status: "draft",
    travelers: 1,
    offlineStatus: "not_downloaded",
    offlineSizeMb: 540,
    coverImage: "/images/stitch/dashboard-torres-del-paine.jpg",
    summary: "Sub-antarctic katabatic wind corridors, French Valley granite amphitheater, and Grey Glacier icefall bivouacs.",
    terrainType: "Alpine moraine, Patagonian scrub, glacial rivers",
    averageElevation: "850m",
    packWeightKg: 11.8,
    maxWeightKg: 14.0,
    satelliteSyncCadence: "Continuous LoRa Mesh"
  }
];
