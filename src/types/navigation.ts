import type { LucideIcon } from "lucide-react";

/** One entry in the dashboard sidebar / quick-action grid. */
export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Short line used in the quick-action grid and page placeholders. */
  description: string;
  /** Optional badge shown in the sidebar (e.g. "3", "Gen2", "12 GB") */
  badge?: string;
  badgeVariant?: "primary" | "secondary" | "accent" | "muted";
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};
