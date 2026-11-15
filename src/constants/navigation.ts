import {
  Bot,
  Bookmark,
  Download,
  LayoutDashboard,
  Languages,
  Map,
  Settings,
  Wallet,
} from "lucide-react";

import type { NavGroup, NavItem } from "@/types/navigation";

/** Primary navigation for the dashboard sidebar. Order = display order. */
export const dashboardNav: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview of your trips, plans and offline status.",
  },
  {
    label: "Trips",
    href: "/trips",
    icon: Map,
    description: "Create and manage itineraries for every journey.",
  },
  {
    label: "Assistant",
    href: "/assistant",
    icon: Bot,
    description: "Ask questions online or on-device when you are offline.",
  },
  {
    label: "Wallet",
    href: "/wallet",
    icon: Wallet,
    description: "Track spending, budgets and currency conversions.",
  },
  {
    label: "Language",
    href: "/language",
    icon: Languages,
    description: "Offline phrasebook and quick translations.",
  },
  {
    label: "Downloads",
    href: "/downloads",
    icon: Download,
    description: "Manage offline packs for the places you visit.",
  },
  {
    label: "Saved places",
    href: "/saved-places",
    icon: Bookmark,
    description: "Everything you have bookmarked, in one list.",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Account, sync, appearance and data controls.",
  },
];

/** Grouped navigation, ready for a sidebar with section headings. */
export const navGroups: NavGroup[] = [
  { label: "Explore", items: dashboardNav.slice(0, 4) },
  { label: "Offline tools", items: dashboardNav.slice(4, 7) },
  { label: "General", items: dashboardNav.slice(7) },
];

/** Convenience lookup for building a page from a nav item. */
export function findNavItem(href: string): NavItem | undefined {
  return dashboardNav.find((item) => item.href === href);
}
