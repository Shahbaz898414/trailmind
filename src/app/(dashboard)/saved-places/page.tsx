import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "Saved places",
  description: "Everything you have bookmarked, in one list.",
};

export default function SavedPlacesPage() {
  return <PlaceholderPage href="/saved-places" />;
}
