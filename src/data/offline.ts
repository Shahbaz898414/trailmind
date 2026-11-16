export interface OfflineStorageAllocation {
  totalStorageGb: number;
  usedStorageGb: number;
  availableStorageGb: number;
  quotaPercent: number;
  categories: {
    label: string;
    sizeGb: number;
    color: string;
  }[];
}

export interface OfflinePackDetail {
  id: string;
  name: string;
  region: string;
  sizeMb: number;
  status: "ready" | "downloading" | "sync_required" | "not_downloaded";
  version: string;
  lastUpdated: string;
  checksum: string;
  components: {
    topoMaps: boolean;
    aiWeights: boolean;
    vectorDb: boolean;
    audioPhrases: boolean;
  };
}

export interface PreFlightChecklistItem {
  id: string;
  category: "Navigation" | "AI & Neural Engine" | "Safety & Emergency" | "Hardware";
  title: string;
  status: "verified" | "warning" | "pending";
  description: string;
  metric: string;
}

export const offlineStorageStatus: OfflineStorageAllocation = {
  totalStorageGb: 25.0,
  usedStorageGb: 5.4,
  availableStorageGb: 19.6,
  quotaPercent: 21.6,
  categories: [
    { label: "1:25k DEM Topographic Contours", sizeGb: 2.8, color: "bg-primary" },
    { label: "Gemma-2B Quantized INT4 Weights", sizeGb: 1.4, color: "bg-primary-container" },
    { label: "Spatial Vector Embeddings (HNSW)", sizeGb: 0.7, color: "bg-secondary" },
    { label: "Offline Audio & Phonetic Pronunciation", sizeGb: 0.5, color: "bg-tertiary-fixed" }
  ]
};

export const offlinePacksList: OfflinePackDetail[] = [
  {
    id: "pack-kyoto-2026",
    name: "Kyoto & Kansai Wilderness Basin (v4.2)",
    region: "Kansai, Japan",
    sizeMb: 612,
    status: "ready",
    version: "SHA-256: 4f8b2e19a4c0",
    lastUpdated: "Today at 01:14 AM",
    checksum: "4f8b2e19a4c07d3e",
    components: {
      topoMaps: true,
      aiWeights: true,
      vectorDb: true,
      audioPhrases: true
    }
  },
  {
    id: "pack-ladakh-2026",
    name: "Ladakh High Passes & Zanskar Gorge Pack",
    region: "Leh, Ladakh, India",
    sizeMb: 485,
    status: "ready",
    version: "SHA-256: 8e21bc7892df",
    lastUpdated: "Yesterday at 18:30",
    checksum: "8e21bc7892df31a2",
    components: {
      topoMaps: true,
      aiWeights: true,
      vectorDb: true,
      audioPhrases: false
    }
  },
  {
    id: "pack-patagonia-2026",
    name: "Torres del Paine & Southern Patagonian Icefield",
    region: "Magallanes, Chile",
    sizeMb: 540,
    status: "downloading",
    version: "Staging package 72%",
    lastUpdated: "In progress",
    checksum: "Pending verification...",
    components: {
      topoMaps: true,
      aiWeights: false,
      vectorDb: false,
      audioPhrases: false
    }
  },
  {
    id: "pack-dolomites-2026",
    name: "Dolomites Alta Via 1 & 2 High Traverse",
    region: "Trentino-Alto Adige, Italy",
    sizeMb: 390,
    status: "not_downloaded",
    version: "Unstaged",
    lastUpdated: "Not cached",
    checksum: "None",
    components: {
      topoMaps: false,
      aiWeights: false,
      vectorDb: false,
      audioPhrases: false
    }
  }
];

export const preFlightChecklist: PreFlightChecklistItem[] = [
  {
    id: "chk-1",
    category: "Navigation",
    title: "10m DEM Topographic Contours Cached",
    status: "verified",
    description: "Kyoto basin and northern Kurama ridges loaded in IndexedDB raster tiles.",
    metric: "100% (612 MB)"
  },
  {
    id: "chk-2",
    category: "AI & Neural Engine",
    title: "On-Device Gemma-2B INT4 Model Initialized",
    status: "verified",
    description: "Apple Neural Engine benchmark: 42 tokens/sec under zero-cellular air-gap.",
    metric: "42 tok/s • WebGPU OK"
  },
  {
    id: "chk-3",
    category: "Safety & Emergency",
    title: "Medical Directives & Japanese Kanji Cards",
    status: "verified",
    description: "Peanut allergy kanji and O-positive blood type stored in offline hardware vault.",
    metric: "3 Cards Staged"
  },
  {
    id: "chk-4",
    category: "Hardware",
    title: "Garmin inReach Mini 2 Battery & Satellite Lock",
    status: "verified",
    description: "100% battery reserve, 3 Iridium polar satellites in azimuth view.",
    metric: "98% Batt • 3 Sats"
  },
  {
    id: "chk-5",
    category: "Safety & Emergency",
    title: "SOS Hardware Slider Interlock Test",
    status: "warning",
    description: "Routine 30-day hardware interlock slide test due before departure.",
    metric: "Test Recommended"
  }
];
