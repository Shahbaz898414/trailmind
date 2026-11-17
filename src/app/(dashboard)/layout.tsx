import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SyncEngineGate } from "@/components/offline/sync-engine-gate";

/**
 * Route group `(dashboard)` — every authenticated app screen shares the
 * sidebar + header shell. Route groups don't affect the URL, so this layout
 * serves `/dashboard`, `/trips`, `/assistant`, …
 *
 * `AuthGuard` wraps the whole shell so an unauthenticated visitor never sees
 * the sidebar, header or any protected content — they're redirected to
 * `/login?next=…` instead (session restore on refresh happens the same way).
 * It is a UX gate only; Security Rules enforce real authorization.
 *
 * `SyncEngineGate` drains the offline outbox for the signed-in user
 * (started/stopped with the auth session; renders nothing).
 */
export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthGuard>
      <SyncEngineGate />
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
