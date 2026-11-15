import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "Language",
  description: "Offline phrasebook and quick translations.",
};

export default function LanguagePage() {
  return <PlaceholderPage href="/language" />;
}
