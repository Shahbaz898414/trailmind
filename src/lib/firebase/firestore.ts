import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  startAfter,
  type DocumentData,
  type DocumentReference,
  type FirestoreError,
  type Query,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type QuerySnapshot,
} from "firebase/firestore";

import { getFirebaseDb } from "./client";

/**
 * Typed Firestore helpers shared by every service in `src/services/`.
 *
 * Design notes
 * ---------------------------------------------------------------------------
 * - `requireDb()` throws `FirebaseNotConfiguredError` instead of returning
 *   `null`, so a service call fails loudly with an actionable message rather
 *   than silently doing nothing. UI layers catch this and show the
 *   "backend not configured" state.
 * - Every error passes through `mapFirestoreError()`, which converts SDK
 *   error codes into messages safe to render — no raw stack traces or
 *   internal details reach the UI.
 * - `runWithRetry()` retries only *transient* codes (network, contention);
 *   permission and validation errors are never retried.
 */

/** Thrown when a Firestore operation runs before Firebase is configured. */
export class FirebaseNotConfiguredError extends Error {
  constructor(service: string) {
    super(
      `${service} is not configured. Copy .env.example to .env.local and add your Firebase web app values.`
    );
    this.name = "FirebaseNotConfiguredError";
  }
}

/** Firestore instance — throws when Firebase is not configured. */
export function requireDb(): NonNullable<ReturnType<typeof getFirebaseDb>> {
  const db = getFirebaseDb();
  if (!db) throw new FirebaseNotConfiguredError("Cloud Firestore");
  return db;
}

/** Path to the current user's root profile document: `users/{uid}`. */
export function userDocPath(uid: string): string {
  return `users/${uid}`;
}

/** Path to a subcollection under the user's root document. */
export function userCollectionPath(uid: string, name: string): string {
  return `users/${uid}/${name}`;
}

/** Typed document reference for `users/{uid}`. */
export function userDoc(uid: string): DocumentReference<DocumentData> {
  return doc(requireDb(), userDocPath(uid));
}

/** Typed reference for a subcollection of `users/{uid}`. */
export function userCollection(uid: string, name: string) {
  return collection(requireDb(), userCollectionPath(uid, name));
}

/**
 * User-facing messages for Firestore error codes.
 * Anything unknown maps to a generic message — internal details stay in the
 * console via the original error object.
 */
const FIRESTORE_ERROR_MESSAGES: Record<string, string> = {
  "permission-denied":
    "You don't have permission to do that. Check that you're signed in and try again.",
  unauthenticated: "Your session expired. Please sign in again.",
  "not-found": "That item no longer exists.",
  "already-exists": "An item with that information already exists.",
  "failed-precondition":
    "That change conflicts with the current data. Refresh and try again.",
  aborted:
    "The operation was interrupted by a concurrent change. Please retry.",
  "resource-exhausted":
    "Too many requests right now. Please wait a moment and try again.",
  "unavailable":
    "Cannot reach the server right now. Check your connection — your changes are saved locally.",
  "deadline-exceeded":
    "The request timed out. Check your connection and try again.",
  cancelled: "The operation was cancelled.",
  internal: "Something went wrong on our side. Please try again.",
  "invalid-argument": "Some of the provided information isn't valid.",
  "out-of-range": "That value is outside the allowed range.",
  unimplemented: "That feature isn't available yet.",
  "limit-exceeded": "You've hit a limit for this operation. Try again later.",
  "network-request-failed":
    "Network request failed. Your changes are saved locally and will sync when you're back online.",
};

/** Converts any thrown value into an error with a UI-safe message. */
export function mapFirestoreError(error: unknown): Error {
  if (error instanceof FirebaseNotConfiguredError) return error;

  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as FirestoreError).code)
      : "";

  const message =
    FIRESTORE_ERROR_MESSAGES[code] ??
    (error instanceof Error && error.message
      ? error.message
      : "Something went wrong. Please try again.");

  const mapped = new Error(message);
  mapped.name = "FirestoreError";
  // Keep the original for console debugging (never rendered in the UI).
  if (error instanceof Error) mapped.cause = error;
  return mapped;
}

/** True for error codes worth retrying automatically. */
export function isTransientFirestoreError(error: unknown): boolean {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as FirestoreError).code)
      : "";
  return [
    "unavailable",
    "deadline-exceeded",
    "aborted",
    "resource-exhausted",
    "internal",
    "network-request-failed",
  ].includes(code);
}

type RetryOptions = {
  /** Maximum attempts including the first one. Defaults to 3. */
  attempts?: number;
  /** Base delay in ms; grows exponentially with jitter. Defaults to 400. */
  baseDelayMs?: number;
};

/**
 * Runs `operation`, retrying transient Firestore failures with exponential
 * backoff. Non-transient errors are rethrown immediately.
 */
export async function runWithRetry<T>(
  operation: () => Promise<T>,
  { attempts = 3, baseDelayMs = 400 }: RetryOptions = {}
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isTransientFirestoreError(error) || attempt === attempts) throw error;
      const delay = baseDelayMs * 2 ** (attempt - 1) + Math.random() * 200;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

/** Page of results with an opaque cursor for the next page. */
export type QueryPage<T> = {
  items: T[];
  /** Pass to `fetchQueryPage`'s `cursor` to get the next page, or null when exhausted. */
  cursor: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
};

/**
 * Fetches one page of a Firestore query.
 *
 * Large collections (notifications, messages, activities) must be read
 * through this instead of `getDocs()` on the full query.
 */
export async function fetchQueryPage<T>(
  base: Query<DocumentData>,
  pageSize: number,
  cursor?: QueryDocumentSnapshot<DocumentData> | null
): Promise<QueryPage<T>> {
  const constraints: QueryConstraint[] = [limit(pageSize + 1)];
  if (cursor) constraints.push(startAfter(cursor));

  const snapshot: QuerySnapshot<DocumentData> = await getDocs(
    query(base, ...constraints)
  );
  const docs = snapshot.docs;
  const hasMore = docs.length > pageSize;
  const page = hasMore ? docs.slice(0, pageSize) : docs;

  return {
    items: page.map((d) => ({ id: d.id, ...d.data() }) as T),
    cursor: hasMore ? page[page.length - 1] : null,
    hasMore,
  };
}

/**
 * ISO-8601 string for a Firestore timestamp field.
 *
 * Reads return `Timestamp` objects (or `null` for pending server timestamps);
 * the rest of the app stores dates as ISO strings, so convert at the edge.
 */
export function timestampToIso(
  value: unknown,
  fallback = ""
): string {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (value instanceof Date) return value.toISOString();
  return fallback;
}

/** Re-export so services import timestamps from one place. */
export { serverTimestamp };
