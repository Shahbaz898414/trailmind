"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";

import { Header } from "./header";
import { Sidebar } from "./sidebar";

/**
 * Placeholder shown while the sidebar's `usePathname()` resolves during
 * build-time prerendering of dynamic (`[id]`) routes. At runtime the pathname
 * is always available from context, so this fallback is never seen in the
 * browser — it only lets `next build` complete the static shell.
 */
function SidebarFallback() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full w-72 flex-col gap-6 border-r border-border bg-white p-5"
    >
      <div className="h-9 w-36 animate-pulse rounded-lg bg-surface-container-low" />
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-full animate-pulse rounded-lg bg-surface-container-low"
            style={{ animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>
      <div className="mt-auto h-24 w-full animate-pulse rounded-xl bg-surface-container-low" />
    </div>
  );
}

/**
 * Application shell matching Stitch designs:
 * Fixed 288px (w-72) sidebar on desktop, slide-over drawer on mobile,
 * sticky header, and main content area.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

  return (
    <div className="relative flex min-h-screen w-full bg-surface">
      {/* Desktop sidebar */}
      <aside
        aria-label="Sidebar"
        className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block"
      >
        {/* `usePathname()` inside Sidebar is URL data: during prerendering of
            dynamic `[id]` routes it suspends until params resolve, so it must
            sit behind a Suspense boundary (Next.js blocking-prerender rule). */}
        <Suspense fallback={<SidebarFallback />}>
          <Sidebar />
        </Suspense>
      </aside>

      {/* Mobile drawer */}
      {mobileNavOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className="fixed inset-0 z-50 lg:hidden"
        >
          <div
            role="presentation"
            onClick={() => setMobileNavOpen(false)}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl">
            <Sidebar
              onNavigate={() => setMobileNavOpen(false)}
              onClose={() => setMobileNavOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div className="flex min-h-screen w-full flex-col lg:pl-72">
        <Header onOpenMenu={() => setMobileNavOpen(true)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
