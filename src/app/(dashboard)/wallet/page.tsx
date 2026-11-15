import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "Wallet",
  description: "Track spending, budgets and currency conversions.",
};

export default function WalletPage() {
  return <PlaceholderPage href="/wallet" />;
}
