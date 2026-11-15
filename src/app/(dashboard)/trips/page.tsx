import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "Trips",
  description: "Create and manage itineraries for every journey.",
};

export default function TripsPage() {
  return <PlaceholderPage href="/trips" />;
}
