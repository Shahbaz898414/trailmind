import {
  Bell,
  Bot,
  Bookmark,
  Compass,
  Download,
  Languages,
  LayoutDashboard,
  Map,
  Settings,
  Wallet,
} from "lucide-react";

import type { NavGroup, NavItem } from "@/types/navigation";

/** Primary navigation for the dashboard sidebar matching Google Stitch designs */
export const dashboardNav: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview of active expeditions, satellite telemetry and offline readiness.",
  },
  {
    label: "My Trips",
    href: "/trips",
    icon: Map,
    badge: "3",
    badgeVariant: "secondary",
    description: "Expedition library, route blueprints and active waypoint packages.",
  },
  {
    label: "AI Travel Assistant",
    href: "/assistant",
    icon: Bot,
    badge: "Gen2",
    badgeVariant: "accent",
    description: "Hybrid cloud and on-device offline travel reasoning assistant.",
  },
  {
    label: "Travel Wallet",
    href: "/wallet",
    icon: Wallet,
    description: "Cryptographic passes, Shinkansen tickets, Ryokan vouchers and offline QR codes.",
  },
  {
    label: "Language Assistant",
    href: "/language",
    icon: Languages,
    description: "Bilingual audio studio, phonetic furigana and taxi flashcards.",
  },
  {
    label: "Offline Downloads",
    href: "/downloads",
    icon: Download,
    badge: "12 GB",
    badgeVariant: "muted",
    description: "1:25k topo contour maps, on-device models and vector databases.",
  },
  {
    label: "Saved Places",
    href: "/saved-places",
    icon: Bookmark,
    description: "Off-grid bookmarks, cached elevation profiles and topo HUD waypoints.",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    description: "System preferences, edge NPU benchmarks, hardware relays and satellite sync.",
  },
];

/** Grouped navigation for layouts that display category sections */
export const navGroups: NavGroup[] = [
  { label: "Expedition", items: dashboardNav.slice(0, 3) },
  { label: "Field Tools", items: dashboardNav.slice(3, 7) },
  { label: "System", items: dashboardNav.slice(7) },
];

export function findNavItem(href: string): NavItem | undefined {
  return dashboardNav.find((item) => item.href === href);
}
