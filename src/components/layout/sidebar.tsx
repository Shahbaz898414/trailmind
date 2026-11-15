"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, HardDrive, X } from "lucide-react";
import { cn } from "cn";

import { navGroups } from "@/constants/navigation";
import { siteConfig } from "@/constants/site";

type SidebarProps = {
  /** Fired after a link is clicked — lets the mobile drawer close itself. */
  onNavigate?: () => void;
  /** When set, renders a close button (mobile drawer only). */
  onClose?: () => void;
  className?: string;
};

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Primary navigation. Forest-green rail on desktop, slide-over drawer on
 * mobile (see `AppShell`). Active state is derived from the current pathname.
 */
export function Sidebar({ onNavigate, onClose, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 px-5 py-5">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-2.5"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-accent text-brand-forest">
            <Compass className="size-5" aria-hidden />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-heading text-base font-semibold leading-none">
              {siteConfig.name}
            </span>
            <span className="mt-1 truncate text-xs text-white/55">
              Offline-first travel AI
            </span>
          </span>
        </Link>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-sidebar-accent hover:text-white"
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>

      <nav
        aria-label="Main navigation"
        className="flex-1 overflow-y-auto px-3 pb-4"
      >
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-2.5 pb-1.5 text-[0.68rem] font-semibold uppercase tracking-wider text-white/45">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActiveRoute(pathname, item.href);
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "bg-sidebar-accent font-medium text-white"
                          : "text-white/70 hover:bg-sidebar-accent hover:text-white"
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          active ? "text-sidebar-primary" : "text-white/50"
                        )}
                        aria-hidden
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-5 py-4 text-xs text-white/55">
        <span className="flex items-center gap-1.5">
          <HardDrive className="size-3.5 shrink-0" aria-hidden />
          Local data stays on this device
        </span>
      </div>
    </div>
  );
}
