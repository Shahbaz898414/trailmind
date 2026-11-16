"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, Cpu, Menu, Search, Wifi } from "lucide-react";

import { Button } from "@/components/ui/button";
import { currentUser } from "@/data/user";
import { sampleNotificationsList } from "@/data/notifications";

type HeaderProps = {
  /** Opens the mobile navigation drawer. */
  onOpenMenu: () => void;
};

export function Header({ onOpenMenu }: HeaderProps) {
  const unreadCount = sampleNotificationsList.filter((n) => !n.read).length;

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
        {/* Online / Synced Pill */}
        <div className="hidden items-center gap-1.5 rounded-full bg-secondary-fixed px-2.5 py-1 text-xs font-semibold text-on-secondary-fixed md:flex">
          <Wifi className="size-3.5 text-secondary" />
          <span>Online • Synced</span>
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

        {/* User Profile Avatar */}
        <Link
          href="/settings/profile"
          className="flex items-center gap-2 rounded-full p-0.5 transition-transform hover:scale-105"
          title={`${currentUser.name} (${currentUser.email})`}
        >
          <div className="relative size-8 overflow-hidden rounded-full ring-1 ring-border">
            <Image
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              width={32}
              height={32}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          <span className="hidden text-xs font-semibold text-on-surface lg:inline">
            {currentUser.name}
          </span>
        </Link>
      </div>
    </header>
  );
}
