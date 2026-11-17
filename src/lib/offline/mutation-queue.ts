import type { SyncOperation } from "@/types/travel";
import { getOfflineDb, isOfflineStoreAvailable } from "@/lib/offline/db";
import type { OfflineEntity } from "@/lib/offline/schema";

/**
 * Mutation queue (outbox) — Dexie `syncQueue`.
 *
 * ---------------------------------------------------------------------------
 * Contract:
 *   - An operation is enqueued ONLY when the write could not reach Firestore
 *     (browser offline). Online writes go straight to Firestore and never
 *     touch this queue — no double-write paths.
 *   - `enqueueMutation` is the single write entry point; the sync engine
 *     drains entries in `createdAt` order and removes each only after a real
 *     server-side outcome (applied → removed; conflict → kept + flagged;
 *     transient failure → kept + attempts/lastError updated).
 *   - Flagged operations (`lastError` starting with "conflict") are SKIPPED
 *     by the engine until the user resolves them explicitly
 *     (`resolveMutation`) — remote data is never silently overwritten.
 * ---------------------------------------------------------------------------
 */

export type EnqueueInput = {
  /** Owner of the mutation — the engine refuses to flush across users. */
  uid: string;
  entity: OfflineEntity;
  entityId: string;
  operation: SyncOperation["operation"];
  payload?: Record<string, unknown>;
  /** Remote `version` the editor based its change on (versioned entities). */
  baseVersion?: number;
  /** Remote `updatedAt` (ISO) the editor based its change on. */
  baseUpdatedAt?: string;
};

/** True when a queue entry is waiting for explicit conflict resolution. */
export function isConflictFlagged(op: SyncOperation): boolean {
  return (op.lastError ?? "").startsWith("conflict");
}

/**
 * True when the engine must NOT apply this operation automatically:
 * either a conflict awaiting the user's decision, or a permanent failure
 * (validation/permission) that retrying cannot fix.
 */
export function isSkippedMutation(op: SyncOperation): boolean {
  const error = op.lastError ?? "";
  return error.startsWith("conflict") || error.startsWith("permanent");
}

/** Adds one operation. No-op outside the browser (nothing to persist to). */
export async function enqueueMutation(
  input: EnqueueInput
): Promise<SyncOperation> {
  if (!isOfflineStoreAvailable()) {
    throw new Error(
      "IndexedDB is unavailable — cannot queue an offline write for later sync."
    );
  }
  const op: SyncOperation = {
    id: crypto.randomUUID(),
    uid: input.uid,
    entity: input.entity,
    entityId: input.entityId,
    operation: input.operation,
    payload: input.payload,
    createdAt: new Date().toISOString(),
    attempts: 0,
    baseVersion: input.baseVersion,
    baseUpdatedAt: input.baseUpdatedAt,
  };
  await getOfflineDb().syncQueue.put(op);
  return op;
}

/** All pending operations, oldest first (the order they must be applied in). */
export async function listPendingMutations(
  entity?: OfflineEntity
): Promise<SyncOperation[]> {
  if (!isOfflineStoreAvailable()) return [];
  const db = getOfflineDb();
  const rows = entity
    ? await db.syncQueue.where("entity").equals(entity).toArray()
    : await db.syncQueue.toArray();
  return rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** Records a failed (transient) attempt — kept for retry, attempts +1. */
export async function recordMutationFailure(
  op: SyncOperation,
  message: string
): Promise<void> {
  if (!isOfflineStoreAvailable()) return;
  await getOfflineDb().syncQueue.put({
    ...op,
    attempts: op.attempts + 1,
    lastError: message.slice(0, 500),
  });
}

/** Flags an operation as conflicted — it will be skipped until resolved. */
export async function flagMutationConflict(
  op: SyncOperation,
  detail: string
): Promise<void> {
  if (!isOfflineStoreAvailable()) return;
  await getOfflineDb().syncQueue.put({
    ...op,
    attempts: op.attempts + 1,
    lastError: `conflict: ${detail}`.slice(0, 500),
  });
}

/** Removes a completed operation. */
export async function removeMutation(id: string): Promise<void> {
  if (!isOfflineStoreAvailable()) return;
  await getOfflineDb().syncQueue.delete(id);
}

export type ConflictResolution = "retry" | "discard";

/**
 * Resolves a flagged conflict:
 *   - `"retry"`  → clear the flag; the engine will apply the local change
 *                  (an explicit last-writer-wins choice by the user).
 *   - `"discard"`→ drop the queued change; the remote version wins. The local
 *                  mirror is left as-is and will be refreshed from Firestore
 *                  on the next online read.
 */
export async function resolveMutation(
  id: string,
  resolution: ConflictResolution
): Promise<void> {
  if (!isOfflineStoreAvailable()) return;
  const db = getOfflineDb();
  const op = await db.syncQueue.get(id);
  if (!op) return;

  if (resolution === "discard") {
    await db.syncQueue.delete(id);
    return;
  }
  await db.syncQueue.put({ ...op, lastError: undefined, attempts: 0 });
}

/** Queue counters for status UI. */
export async function getQueueCounts(): Promise<{
  pending: number;
  conflicts: number;
}> {
  if (!isOfflineStoreAvailable()) return { pending: 0, conflicts: 0 };
  const rows = await getOfflineDb().syncQueue.toArray();
  return {
    pending: rows.length,
    conflicts: rows.filter((r) => isConflictFlagged(r)).length,
  };
}
