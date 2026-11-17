"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, Cpu, LogOut, Menu, Search, Wifi, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { useOnlineStatus } from "@/hooks/use-online-status";
import {
  subscribeSyncState,
  type SyncEngineState,
} from "@/lib/offline/sync-engine";
import { countUnreadNotifications } from "@/services/notifications";

type HeaderProps = {
  /** Opens the mobile navigation drawer. */
  onOpenMenu: () => void;
};

const INITIAL_IDLE_STATE: SyncEngineState = {
  status: "idle",
  pending: 0,
  conflicts: 0,
};

export function Header({ onOpenMenu }: HeaderProps) {
  const { signOut, status, user } = useAuth();
  const online = useOnlineStatus();
  const [unreadCount, setUnreadCount] = useState(0);
  const [sync, setSync] = useState<SyncEngineState>(INITIAL_IDLE_STATE);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const uid = user?.uid ?? null;
  const displayName =
    user?.displayName?.trim() || user?.email?.split("@")[0] || "Traveler";
  const email = user?.email ?? "";
  const avatarSrc = user?.photoURL;
  const initial = displayName.charAt(0).toUpperCase();

  // Real unread count — 0 while offline/unconfigured rather than a fake badge.
  useEffect(() => {
    if (!uid) {
      setUnreadCount(0);
      return;
    }
    let cancelled = false;
    const load = () => {
      countUnreadNotifications(uid)
        .then((count) => {
          if (!cancelled) setUnreadCount(count);
        })
        .catch(() => {
          // Offline / backend unconfigured: show no badge instead of a
          // fabricated number. The notifications page loads them properly.
        });
    };
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, [uid]);

  // Live sync-engine state (pending queue / conflicts / in-flight flush).
  useEffect(() => subscribeSyncState(setSync), []);

  useEffect(() => setAvatarFailed(false), [avatarSrc]);

  const pending = sync.status === "idle" ? sync.pending : 0;
  const conflicts = sync.status === "idle" ? sync.conflicts : 0;

  const statusLabel = !online
    ? pending > 0
      ? `Offline • ${pending} queued`
      : "Offline"
    : sync.status === "syncing"
      ? `Syncing ${sync.processed}/${sync.total}`
      : conflicts > 0
        ? `${conflicts} conflict${conflicts === 1 ? "" : "s"}`
        : pending > 0
          ? `${pending} change${pending === 1 ? "" : "s"} queued`
          : "Online • Synced";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-white/95 px-4 backdrop-blur sm:px-6">
      {/* Left: Mobile Toggle & Omnibar Search */}
      <div className="flex flex-1 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMenu}
          aria-label="Open navigation menu"
          className="lg:hidden"
        >
          <Menu className="size-5 text-on-surface" />
        </Button>

        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant/70" />
          <input
            type="text"
            placeholder="Search trails, waypoints, offline maps..."
            className="h-9 w-full rounded-lg bg-surface-container-low pl-9 pr-4 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Right: Status Pills, Alerts & User Profile */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Connectivity / sync pill — reflects the REAL engine state */}
        <div
          className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold md:flex ${
            online
              ? "bg-secondary-fixed text-on-secondary-fixed"
              : "bg-error/10 text-error"
          }`}
          title={
            online
              ? "Browser connectivity and pending offline changes"
              : "No network — changes are queued locally and sync on reconnect"
          }
        >
          {online ? (
            <Wifi className="size-3.5 text-secondary" />
          ) : (
            <WifiOff className="size-3.5 text-error" />
          )}
          <span>{statusLabel}</span>
        </div>

        {/* Local On-Device AI Pill */}
        <div className="hidden items-center gap-1.5 rounded-full bg-primary-container px-2.5 py-1 text-xs font-semibold text-white sm:flex">
          <Cpu className="size-3.5 text-primary-fixed" />
          <span>Local On-Device AI</span>
        </div>

        {/* Notification Bell */}
        <Link
          href="/notifications"
          className="relative flex size-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          aria-label="Expedition Alerts"
        >
          <Bell className="size-4" />
          {unreadCount > 0 ? (
            <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-error ring-2 ring-white" />
          ) : null}
        </Link>

        {/* User Profile Avatar (real signed-in user, honest fallback) */}
        <Link
          href="/settings/profile"
          className="flex items-center gap-2 rounded-full p-0.5 transition-transform hover:scale-105"
          title={email ? `${displayName} (${email})` : displayName}
        >
          <div className="relative flex size-8 items-center justify-center overflow-hidden rounded-full bg-primary-container ring-1 ring-border">
            {avatarSrc && !avatarFailed ? (
              // Google avatar hosts are not in the next/image allowlist and
              // avatars are tiny — plain img with a graceful initial fallback.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarSrc}
                alt={displayName}
                width={32}
                height={32}
                className="h-full w-full object-cover"
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <span className="text-xs font-bold text-primary">{initial}</span>
            )}
          </div>
          <span className="hidden text-xs font-semibold text-on-surface lg:inline">
            {displayName}
          </span>
        </Link>

        {/* Sign out — AuthProvider flips to "unauthenticated" and AuthGuard
            redirects to /login?next=… (intended path preserved). */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => void signOut()}
          disabled={status !== "authenticated"}
          aria-label="Sign out"
          title="Sign out"
          className="text-on-surface-variant hover:text-error"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  );
}
