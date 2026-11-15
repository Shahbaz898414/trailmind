"use client";

import { Wifi, WifiOff } from "lucide-react";
import { cn } from "cn";

import { useOnlineStatus } from "@/hooks/use-online-status";

/**
 * Online/offline pill for the top header.
 *
 * Uses `navigator.onLine`, which reports the device's link status — it proves
 * a network interface is up, not that Firebase is reachable. Treat it as a
 * UI hint. Renders the same label during SSR and updates after hydration.
 */
export function ConnectivityIndicator({ className }: { className?: string }) {
  const isOnline = useOnlineStatus();

  return (
    <span
      role="status"
      aria-live="polite"
      title={
        isOnline
          ? "Connected to the network"
          : "No network — local data is still available"
      }
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium",
        isOnline
          ? "border-border bg-muted text-muted-foreground"
          : "border-accent/50 bg-accent/15 text-accent-foreground",
        className
      )}
    >
      {isOnline ? (
        <Wifi className="size-3.5" aria-hidden />
      ) : (
        <WifiOff className="size-3.5" aria-hidden />
      )}
      <span>{isOnline ? "Online" : "Offline"}</span>
      {!isOnline ? (
        <span
          className="size-1.5 animate-pulse rounded-full bg-accent"
          aria-hidden
        />
      ) : null}
    </span>
  );
}
