"use client";

import { useEffect, useState, type ReactNode } from "react";

import { Header } from "./header";
import { Sidebar } from "./sidebar";

/**
 * Application shell: fixed sidebar on desktop, slide-over drawer on mobile,
 * sticky header, and a `<main>` region for page content.
 *
 * Client component because it owns drawer state and keyboard handling.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close on Escape and lock background scroll while the drawer is open.
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
    <div className="relative flex min-h-screen w-full">
      {/* Desktop sidebar */}
      <aside
        aria-label="Sidebar"
        className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block"
      >
        <Sidebar />
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

      <div className="flex min-h-screen w-full flex-col lg:pl-64">
        <Header onOpenMenu={() => setMobileNavOpen(true)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
