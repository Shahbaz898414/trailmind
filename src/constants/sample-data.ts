import type { OfflinePack, SavedPlace, Trip, WalletEntry } from "@/types/travel";

/**
 * ---------------------------------------------------------------------------
 * UI PREVIEW DATA ONLY
 * ---------------------------------------------------------------------------
 * Everything in this file exists so the dashboard, cards and lists have
 * something realistic to render before Firebase and Dexie are wired up.
 * It is NOT loaded from IndexedDB or Firestore and must never be treated as
 * real user data.
 * ---------------------------------------------------------------------------
 */

export const sampleTrips: Trip[] = [
  {
    id: "trip-lisbon-2026",
    title: "Lisbon & the Algarve",
    destination: "Lisbon, Portugal",
    countryCode: "PT",
    startDate: "2026-03-12",
    endDate: "2026-03-19",
    status: "upcoming",
    cover: "sage",
    budget: { currency: "EUR", total: 1450, spent: 380 },
    placesCount: 14,
    offlineReady: true,
    summary: "Tiles, tram 28 and a slow week of coastal day trips.",
  },
  {
    id: "trip-kyoto-2026",
    title: "Kyoto Cherry Blossom",
    destination: "Kyoto, Japan",
    countryCode: "JP",
    startDate: "2026-03-28",
    endDate: "2026-04-06",
    status: "upcoming",
    cover: "accent",
    budget: { currency: "JPY", total: 320000, spent: 96000 },
    placesCount: 9,
    offlineReady: false,
    summary: "Temple mornings, tea houses and a bullet-trip to Nara.",
  },
  {
    id: "trip-patagonia-2026",
    title: "Patagonia Trek",
    destination: "Puerto Natales, Chile",
    countryCode: "CL",
    startDate: "2026-11-04",
    endDate: "2026-11-14",
    status: "planning",
    cover: "forest",
    budget: { currency: "USD", total: 2100, spent: 240 },
    placesCount: 6,
    offlineReady: false,
    summary: "W Circuit permits booked — routes still need offline maps.",
  },
  {
    id: "trip-marrakech-2025",
    title: "Marrakech Medina Hop",
    destination: "Marrakech, Morocco",
    countryCode: "MA",
    startDate: "2025-09-02",
    endDate: "2025-09-09",
    status: "completed",
    cover: "dusk",
    budget: { currency: "MAD", total: 9800, spent: 9120 },
    placesCount: 11,
    offlineReady: true,
    summary: "Riads, souks and an Atlas Mountains day trip.",
  },
];

export const sampleSavedPlaces: SavedPlace[] = [
  {
    id: "place-01",
    tripId: "trip-lisbon-2026",
    name: "Miradouro da Senhora do Monte",
    category: "Viewpoint",
    city: "Lisbon",
    latitude: 38.7169,
    longitude: -9.1333,
    notes: "Best light just before sunset.",
    createdAt: "2026-02-04T18:22:00.000Z",
  },
  {
    id: "place-02",
    tripId: "trip-lisbon-2026",
    name: "Time Out Market",
    category: "Food",
    city: "Lisbon",
    latitude: 38.7075,
    longitude: -9.1456,
    createdAt: "2026-02-06T12:10:00.000Z",
  },
  {
    id: "place-03",
    tripId: "trip-kyoto-2026",
    name: "Fushimi Inari Taisha",
    category: "Temple",
    city: "Kyoto",
    latitude: 34.9671,
    longitude: 135.7727,
    notes: "Go at 06:00 to avoid the crowds.",
    createdAt: "2026-02-11T09:41:00.000Z",
  },
];

export const sampleOfflinePacks: OfflinePack[] = [
  {
    id: "pack-01",
    tripId: "trip-lisbon-2026",
    status: "ready",
    sizeMb: 48.2,
    updatedAt: "2026-02-20T08:00:00.000Z",
  },
  {
    id: "pack-02",
    tripId: "trip-marrakech-2025",
    status: "ready",
    sizeMb: 31.7,
    updatedAt: "2025-09-01T16:30:00.000Z",
  },
  {
    id: "pack-03",
    tripId: "trip-kyoto-2026",
    status: "not-downloaded",
    sizeMb: 52.4,
    updatedAt: "2026-02-25T10:15:00.000Z",
  },
];

export const sampleWalletEntries: WalletEntry[] = [
  {
    id: "wallet-01",
    tripId: "trip-lisbon-2026",
    category: "Accommodation",
    description: "Alfama guesthouse, 4 nights",
    amount: 412,
    currency: "EUR",
    date: "2026-03-12",
  },
  {
    id: "wallet-02",
    tripId: "trip-lisbon-2026",
    category: "Transport",
    description: "Lisbon metro + Alfa Pendular train",
    amount: 86.5,
    currency: "EUR",
    date: "2026-03-13",
  },
  {
    id: "wallet-03",
    tripId: "trip-kyoto-2026",
    category: "Transport",
    description: "Shinkansen reserved seats",
    amount: 27200,
    currency: "JPY",
    date: "2026-04-02",
  },
];

/** Dashboard headline numbers, derived from `sampleTrips` so they stay consistent. */
export const sampleStats = {
  tripsPlanned: sampleTrips.filter((t) => t.status !== "completed").length,
  placesSaved: sampleTrips.reduce((sum, trip) => sum + trip.placesCount, 0),
  offlinePacks: sampleOfflinePacks.filter((p) => p.status === "ready").length,
  tripsCompleted: sampleTrips.filter((t) => t.status === "completed").length,
} as const;
