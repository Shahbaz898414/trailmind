"use client";

import { Menu, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/constants/site";

import { ConnectivityIndicator } from "./connectivity-indicator";

type HeaderProps = {
  /** Opens the mobile navigation drawer. */
  onOpenMenu: () => void;
};

/**
 * Sticky top bar: navigation toggle on small screens, connectivity state and
 * a user profile placeholder on the right.
 */
export function Header({ onOpenMenu }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-card/95 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMenu}
          aria-label="Open navigation menu"
          className="lg:hidden"
        >
          <Menu />
        </Button>
        <span className="truncate font-heading text-sm font-semibold lg:hidden">
          {siteConfig.name}
        </span>
        <span className="hidden truncate text-sm text-muted-foreground lg:block">
          {siteConfig.tagline}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <ConnectivityIndicator />

        {/*
          Profile placeholder. Firebase Auth will replace this with the real
          signed-in user (avatar, display name, sign-out) in a later iteration.
        */}
        <div
          className="flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-2.5 sm:pr-3"
          title="Profile — not signed in"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
            <User className="size-4" aria-hidden />
          </span>
          <span className="hidden text-sm font-medium sm:inline">
            Guest traveler
          </span>
        </div>
      </div>
    </header>
  );
}
