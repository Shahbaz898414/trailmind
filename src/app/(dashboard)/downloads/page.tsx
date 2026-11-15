import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "Downloads",
  description: "Manage offline packs for the places you visit.",
};

export default function DownloadsPage() {
  return <PlaceholderPage href="/downloads" />;
}
