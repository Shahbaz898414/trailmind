import {
  deleteDoc,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/client";
import {
  isTransientFirestoreError,
  timestampToIso,
} from "@/lib/firebase/firestore";
import { isOnline, subscribeConnectivity } from "@/lib/offline/connectivity";
import {
  flagMutationConflict,
  getQueueCounts,
  isSkippedMutation,
  listPendingMutations,
  recordMutationFailure,
  removeMutation,
} from "@/lib/offline/mutation-queue";
import { deleteTrip } from "@/services/trips";
import { clearItinerary, reorderActivities } from "@/services/itinerary";
import { deleteDocument } from "@/services/documents";
import type { SyncOperation } from "@/types/travel";

/**
 * Sync engine — drains the Dexie outbox (`syncQueue`) into Firestore.
 *
 * ---------------------------------------------------------------------------
 * CONTRACT (see docs/OFFLINE_SYNC.md)
 * ---------------------------------------------------------------------------
 *   - Runs ONLY while online and configured; never claims an op applied
 *     without a real server-side outcome.
 *   - Operations are applied oldest-first, one at a time, and each is removed
 *     from the outbox only after the Firestore call succeeds.
 *   - Conflicts (remote `version` / `updatedAt` moved past the local base)
 *     are FLAGGED, not applied — remote data is never silently overwritten.
 *     Flagged ops wait for `resolveMutation(id, "retry" | "discard")`.
 *   - Transient failures (network) stop the pass and keep the op for the
 *     next connectivity event; attempts/lastError are recorded honestly.
 *   - Permanent failures (validation, permission) are flagged `permanent:`
 *     so they are surfaced instead of retried forever.
 *   - Only ops whose `uid` matches the signed-in user are considered — a
 *     queued write from user A can never land in user B's data.
 *   - Entities without an outbox handler (savedPlace, phrase, notification,
 *     emergencyContact, conversation, message) are never enqueued by the
 *     services: their writes use Firestore's own offline queue
 *     (`persistentLocalCache`). If one somehow appears, it is flagged
 *     permanent rather than dropped or guessed at.
 * ---------------------------------------------------------------------------
 */

/* -------------------------------------------------------------------------- */
/* Error types (internal control flow)                                         */
/* -------------------------------------------------------------------------- */

/** Remote state moved past the local base — flag, don't apply. */
class SyncConflictError extends Error {
  constructor(detail: string) {
    super(detail);
    this.name = "SyncConflictError";
  }
}

/** Retrying cannot fix this (bad payload, no handler) — flag permanent. */
class PermanentSyncError extends Error {
  constructor(detail: string) {
    super(detail);
    this.name = "PermanentSyncError";
  }
}

/* -------------------------------------------------------------------------- */
/* State                                                                       */
/* -------------------------------------------------------------------------- */

export type SyncEngineState =
  | { status: "idle"; pending: number; conflicts: number }
  | { status: "syncing"; processed: number; total: number }
  | { status: "error"; message: string };

export type FlushResult = {
  /** "ok" — a pass ran; "offline" — skipped (no network); "unconfigured" — no backend. */
  status: "ok" | "offline" | "unconfigured" | "already-running";
  applied: number;
  conflicts: number;
  /** Ops that failed permanently this pass. */
  permanent: number;
  /** True when a transient failure stopped the pass early (retry on reconnect). */
  stoppedEarly: boolean;
};

type Listener = (state: SyncEngineState) => void;

let state: SyncEngineState = { status: "idle", pending: 0, conflicts: 0 };
const listeners = new Set<Listener>();

let flushInFlight: Promise<FlushResult> | null = null;
let stopConnectivity: (() => void) | null = null;
let engineUid: string | null = null;

function setState(next: SyncEngineState): void {
  state = next;
  for (const listener of listeners) listener(state);
}

/** Current engine state (synchronous read for UI). */
export function getSyncEngineState(): SyncEngineState {
  return state;
}

/** Subscribes to engine state changes; fires immediately with the current state. */
export function subscribeSyncState(listener: Listener): () => void {
  listeners.add(listener);
  listener(state);
  return () => listeners.delete(listener);
}

async function refreshCounts(): Promise<void> {
  const counts = await getQueueCounts();
  if (state.status === "idle") {
    setState({
      status: "idle",
      pending: counts.pending,
      conflicts: counts.conflicts,
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Lifecycle                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Starts the engine for `uid`: subscribes to connectivity and flushes the
 * outbox on every transition to online (plus once immediately, which covers
 * a page reload that still has queued ops). Idempotent per uid.
 *
 * Returns a stop function — call it on sign-out / unmount.
 */
export function startSyncEngine(uid: string): () => void {
  if (engineUid === uid && stopConnectivity) {
    return () => stopSyncEngine();
  }
  stopSyncEngine();

  engineUid = uid;
  void refreshCounts();

  // subscribeConnectivity fires immediately with the current state, so an
  // online session with a backlog flushes right away.
  stopConnectivity = subscribeConnectivity((online) => {
    if (online) void flushSyncQueue(uid);
  });

  return () => stopSyncEngine();
}

/** Stops the engine (sign-out). An in-flight pass finishes but is not restarted. */
export function stopSyncEngine(): void {
  stopConnectivity?.();
  stopConnectivity = null;
  engineUid = null;
}

/* -------------------------------------------------------------------------- */
/* Flush                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Applies every eligible outbox operation for `uid`, oldest first.
 *
 * Concurrent calls coalesce into the in-flight pass (one writer at a time).
 */
export async function flushSyncQueue(uid: string): Promise<FlushResult> {
  if (flushInFlight) return flushInFlight;
  flushInFlight = doFlush(uid).finally(() => {
    flushInFlight = null;
  });
  return flushInFlight;
}

async function doFlush(uid: string): Promise<FlushResult> {
  const skip = (status: FlushResult["status"]): FlushResult => ({
    status,
    applied: 0,
    conflicts: 0,
    permanent: 0,
    stoppedEarly: false,
  });

  if (!isFirebaseConfigured || !getFirebaseDb()) return skip("unconfigured");
  if (!isOnline()) return skip("offline");

  const pending = await listPendingMutations();
  // Foreign-uid ops stay untouched — they flush when that user signs in.
  const ops = pending.filter((op) => op.uid === uid && !isSkippedMutation(op));

  if (ops.length === 0) {
    await refreshCounts();
    return skip("ok");
  }

  setState({ status: "syncing", processed: 0, total: ops.length });

  /** Entities already updated this pass — later ops rebase instead of conflicting. */
  const appliedThisFlush = new Set<string>();
  let applied = 0;
  let conflicts = 0;
  let permanent = 0;
  let stoppedEarly = false;

  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    setState({ status: "syncing", processed: i, total: ops.length });
    try {
      await applyOperation(uid, op, appliedThisFlush);
      await removeMutation(op.id);
      appliedThisFlush.add(`${op.entity}:${op.entityId}`);
      applied += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (error instanceof SyncConflictError) {
        await flagMutationConflict(op, message);
        conflicts += 1;
      } else if (error instanceof PermanentSyncError) {
        await recordMutationFailure(op, `permanent: ${message}`);
        permanent += 1;
      } else if (isRetryable(error)) {
        await recordMutationFailure(op, message);
        stoppedEarly = true;
        break; // network/auth likely gone — stop, retry on the next online event
      } else {
        // Real server rejection (validation, bad reference): flag permanent
        // so it is surfaced instead of retried forever.
        await recordMutationFailure(op, `permanent: ${message}`);
        permanent += 1;
      }
    }
  }

  const counts = await getQueueCounts();
  setState({
    status: "idle",
    pending: counts.pending,
    conflicts: counts.conflicts,
  });

  return { status: "ok", applied, conflicts, permanent, stoppedEarly };
}

/** Retryable = transport failure, or the browser is (back) offline, or the
 *  auth token is mid-refresh while connectivity exists. */
function isRetryable(error: unknown): boolean {
  if (isTransientFirestoreError(error)) return true;
  if (!isOnline()) return true;
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";
  return code === "unauthenticated";
}

/* -------------------------------------------------------------------------- */
/* Operation dispatch                                                          */
/* -------------------------------------------------------------------------- */

async function applyOperation(
  uid: string,
  op: SyncOperation,
  appliedThisFlush: Set<string>
): Promise<void> {
  const key = `${op.entity}:${op.entityId}`;
  const rebased = appliedThisFlush.has(key);

  switch (op.entity) {
    case "trip":
      return applyTripOp(uid, op, rebased);
    case "activity":
      return applyActivityOp(uid, op, rebased);
    case "itinerary-order":
      return applyReorderOp(uid, op);
    case "itinerary-clear":
      return applyClearOp(uid, op);
    case "document":
      return applyDocumentOp(uid, op, rebased);
    default:
      throw new PermanentSyncError(
        `No sync handler for "${op.entity}" — this write used a path the engine does not manage.`
      );
  }
}

function requirePayload(op: SyncOperation): Record<string, unknown> {
  if (typeof op.payload !== "object" || op.payload === null) {
    throw new PermanentSyncError(
      `Queued ${op.entity} ${op.operation} carries no payload — cannot be applied.`
    );
  }
  return op.payload as Record<string, unknown>;
}

function requireString(value: unknown, field: string, op: SyncOperation): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new PermanentSyncError(
      `Queued ${op.entity} ${op.operation} is missing "${field}".`
    );
  }
  return value;
}

/* -------------------------------------------------------------------------- */
/* Trips                                                                       */
/* -------------------------------------------------------------------------- */

function tripRef(uid: string, tripId: string) {
  const db = getFirebaseDb();
  if (!db) throw new PermanentSyncError("Firestore is not available.");
  return doc(db, "users", uid, "trips", tripId);
}

async function applyTripOp(
  uid: string,
  op: SyncOperation,
  rebased: boolean
): Promise<void> {
  if (op.operation === "delete") {
    // Cascade (itinerary + de-association) — idempotent for a missing trip.
    await deleteTrip(uid, op.entityId);
    return;
  }

  const ref = tripRef(uid, op.entityId);
  const snapshot = await getDoc(ref);

  if (op.operation === "create") {
    // Idempotent: an existing doc means a previous pass already applied it.
    if (snapshot.exists()) return;
    const payload = requirePayload(op);
    await setDoc(ref, {
      ...payload,
      version: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return;
  }

  // update
  if (!snapshot.exists()) {
    throw new SyncConflictError("the trip was deleted on another device");
  }
  const payload = requirePayload(op);
  if (!rebased && op.baseVersion !== undefined) {
    const remoteVersion = Number(snapshot.data().version ?? 1);
    if (remoteVersion !== op.baseVersion) {
      throw new SyncConflictError(
        `remote version ${remoteVersion} moved past the version this edit was based on (${op.baseVersion})`
      );
    }
  }
  await updateDoc(ref, {
    ...payload,
    version: increment(1),
    updatedAt: serverTimestamp(),
  });
}

/* -------------------------------------------------------------------------- */
/* Itinerary activities                                                        */
/* -------------------------------------------------------------------------- */

function activityRef(uid: string, tripId: string, activityId: string) {
  const db = getFirebaseDb();
  if (!db) throw new PermanentSyncError("Firestore is not available.");
  return doc(db, "users", uid, "trips", tripId, "itinerary", activityId);
}

/** Strips mirror/path-only fields so only real document data is written. */
function activityData(payload: Record<string, unknown>): Record<string, unknown> {
  const {
    tripId: _tripId,
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...data
  } = payload;
  void _tripId;
  void _id;
  void _createdAt;
  void _updatedAt;
  return data;
}

async function applyActivityOp(
  uid: string,
  op: SyncOperation,
  rebased: boolean
): Promise<void> {
  const payload = requirePayload(op);
  const tripId = requireString(payload.tripId, "tripId", op);
  const ref = activityRef(uid, tripId, op.entityId);

  if (op.operation === "delete") {
    await deleteDoc(ref);
    return;
  }

  const snapshot = await getDoc(ref);

  if (op.operation === "create") {
    if (snapshot.exists()) return; // already applied by a previous pass
    await setDoc(ref, {
      ...activityData(payload),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return;
  }

  // update
  if (!snapshot.exists()) {
    throw new SyncConflictError("the activity was deleted on another device");
  }
  if (!rebased && op.baseUpdatedAt) {
    const remoteUpdatedAt = timestampToIso(snapshot.data().updatedAt);
    if (remoteUpdatedAt && remoteUpdatedAt !== op.baseUpdatedAt) {
      throw new SyncConflictError(
        `the activity was changed on another device at ${remoteUpdatedAt} (this edit was based on ${op.baseUpdatedAt})`
      );
    }
  }
  await updateDoc(ref, {
    ...activityData(payload),
    updatedAt: serverTimestamp(),
  });
}

/* -------------------------------------------------------------------------- */
/* Itinerary reorder / clear                                                   */
/* -------------------------------------------------------------------------- */

async function applyReorderOp(uid: string, op: SyncOperation): Promise<void> {
  const payload = requirePayload(op);
  const tripId = requireString(payload.tripId, "tripId", op);
  const ids = payload.orderedActivityIds;
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new PermanentSyncError("the queued reorder has no activity ids.");
  }
  try {
    await reorderActivities(uid, tripId, ids as string[]);
  } catch (error) {
    // The itinerary vanished remotely — the reorder's intent is satisfied.
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes("no longer exists") ||
      message.includes("No activities to reorder")
    ) {
      return;
    }
    throw error;
  }
}

async function applyClearOp(uid: string, op: SyncOperation): Promise<void> {
  const payload = requirePayload(op);
  const tripId = requireString(payload.tripId, "tripId", op);
  await clearItinerary(uid, tripId); // idempotent (empty itinerary → 0)
}

/* -------------------------------------------------------------------------- */
/* Travel-wallet documents                                                     */
/* -------------------------------------------------------------------------- */

function documentRef(uid: string, documentId: string) {
  const db = getFirebaseDb();
  if (!db) throw new PermanentSyncError("Firestore is not available.");
  return doc(db, "users", uid, "documents", documentId);
}

async function applyDocumentOp(
  uid: string,
  op: SyncOperation,
  rebased: boolean
): Promise<void> {
  if (op.operation === "create") {
    // Uploads genuinely require the network and are never queued.
    throw new PermanentSyncError(
      "queued document creation is not supported — uploads require a connection."
    );
  }

  if (op.operation === "delete") {
    await deleteDocument(uid, op.entityId); // handles missing doc + storage object
    return;
  }

  const payload = requirePayload(op);
  const ref = documentRef(uid, op.entityId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    throw new SyncConflictError("the document was deleted on another device");
  }
  if (!rebased && op.baseUpdatedAt) {
    const remoteUpdatedAt = timestampToIso(snapshot.data().updatedAt);
    if (remoteUpdatedAt && remoteUpdatedAt !== op.baseUpdatedAt) {
      throw new SyncConflictError(
        `the document was changed on another device at ${remoteUpdatedAt} (this edit was based on ${op.baseUpdatedAt})`
      );
    }
  }
  await updateDoc(ref, { ...payload, updatedAt: serverTimestamp() });
}
