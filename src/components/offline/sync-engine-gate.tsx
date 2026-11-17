"use client";

import { useEffect } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { startSyncEngine } from "@/lib/offline/sync-engine";

/**
 * Starts/stops the offline sync engine alongside the auth session.
 *
 * Renders no UI. Mounted once from the dashboard layout:
 *
 *   - signed in  → `startSyncEngine(uid)` (subscribes to connectivity and
 *     flushes the Dexie outbox immediately + on every reconnect)
 *   - signed out / user switched / unmount → engine stopped, so a queued
 *     write from user A is never flushed while user B is signed in
 *
 * This is lifecycle wiring only — the engine itself never claims an
 * operation applied without a real Firestore outcome (see OFFLINE_SYNC.md).
 */
export function SyncEngineGate() {
  const { status, user } = useAuth();

  useEffect(() => {
    if (status !== "authenticated" || !user) return;
    // startSyncEngine is idempotent per uid and returns its own stop fn.
    return startSyncEngine(user.uid);
  }, [status, user]);

  return null;
}
