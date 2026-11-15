import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "Settings",
  description: "Account, sync, appearance and data controls.",
};

export default function SettingsPage() {
  return <PlaceholderPage href="/settings" />;
}
