import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

/**
 * Route group `(dashboard)` — every authenticated app screen shares the
 * sidebar + header shell. Route groups don't affect the URL, so this layout
 * serves `/dashboard`, `/trips`, `/assistant`, …
 */
export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
