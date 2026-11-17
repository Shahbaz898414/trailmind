"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { HardDrive, X } from "lucide-react";
import { cn } from "@/lib/utils";

import { dashboardNav } from "@/constants/navigation";
import { siteConfig } from "@/constants/site";
import {
  formatBytes,
  getStorageEstimate,
  type StorageEstimateInfo,
} from "@/lib/offline/storage-manager";

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
 * Primary navigation matching Google Stitch designs:
 * Light surface (`bg-white` / `bg-surface-container-lowest`), Deep Pine active pills,
 * count chips, and bottom Storage HUD.
 */
export function Sidebar({ onNavigate, onClose, className }: SidebarProps) {
  const pathname = usePathname();
  const [storage, setStorage] = useState<StorageEstimateInfo | null>(null);

  // Real browser-reported usage for this origin (never a fabricated figure).
  useEffect(() => {
    let cancelled = false;
    getStorageEstimate()
      .then((estimate) => {
        if (!cancelled) setStorage(estimate);
      })
      .catch(() => {
        // API unavailable → the HUD renders "—" instead of inventing numbers.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col border-r border-border bg-white text-on-surface shadow-[0_1px_8px_rgba(0,0,0,0.04)]",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-border/40 px-5">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-3"
        >
          <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary-container">
            <Image
              src="/images/stitch/trailmind-logo.jpg"
              alt="TrailMind Logo"
              width={32}
              height={32}
              className="h-full w-full object-cover"
              onError={(e) => {
                // fallback
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-heading text-lg font-bold tracking-tight text-primary">
              {siteConfig.name}
            </span>
          </div>
        </Link>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface lg:hidden"
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>

      {/* Nav List */}
      <nav
        aria-label="Main navigation"
        className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
      >
        {dashboardNav.map((item) => {
          const active = isActiveRoute(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-primary-container text-white shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <Icon
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    active ? "text-white" : "text-on-surface-variant group-hover:text-primary"
                  )}
                  aria-hidden
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge ? (
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide",
                    active
                      ? "bg-white/20 text-white"
                      : item.badgeVariant === "accent"
                      ? "bg-tertiary-fixed text-on-tertiary-fixed"
                      : item.badgeVariant === "secondary"
                      ? "bg-secondary-fixed text-on-secondary-fixed"
                      : "bg-surface-container-high text-on-surface-variant"
                  )}
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Storage HUD at Bottom */}
      <div className="border-t border-border/60 bg-surface-container-low/50 p-4">
        <div className="flex items-center justify-between text-xs text-on-surface-variant">
          <span className="flex items-center gap-1.5 font-semibold text-primary">
            <HardDrive className="size-3.5 text-primary" aria-hidden />
            Field Storage
          </span>
          <span className="font-mono text-[11px] font-bold text-primary">
            {storage ? formatBytes(storage.usageBytes) : "—"} /{" "}
            {storage?.quotaBytes != null ? formatBytes(storage.quotaBytes) : "—"}
          </span>
        </div>

        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{
              width: `${
                storage?.usageFraction != null
                  ? Math.round(storage.usageFraction * 100)
                  : 0
              }%`,
            }}
          />
        </div>

        <p className="mt-1.5 truncate text-[11px] text-on-surface-variant">
          {storage?.usageFraction != null
            ? `${Math.round(storage.usageFraction * 100)}% of this device's storage quota in use`
            : "Storage estimate unavailable in this browser"}
        </p>
      </div>
    </div>
  );
}
