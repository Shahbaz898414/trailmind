import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "Assistant",
  description: "Ask questions online, or on-device when you are offline.",
};

export default function AssistantPage() {
  return <PlaceholderPage href="/assistant" />;
}
