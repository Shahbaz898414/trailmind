/** Global identity for the app — used in metadata, the sidebar and the PWA manifest. */
export const siteConfig = {
  name: "TrailMind",
  tagline: "Your AI travel companion, even without internet.",
  description:
    "TrailMind is an offline-first AI travel companion: plan trips, keep your itinerary, wallet and phrasebook on-device, and ask questions even when you have no connection.",
  /** Keep in sync with `public/manifest.json` and the themeColor in `src/app/layout.tsx`. */
  themeColor: "#164B3B",
  backgroundColor: "#F8F8F3",
  /** Replace with the deployed domain before sharing links publicly. */
  url: "http://localhost:3000",
} as const;
