import type { LucideIcon } from "lucide-react";

/** One entry in the dashboard sidebar / quick-action grid. */
export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Short line used in the quick-action grid and page placeholders. */
  description: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};
