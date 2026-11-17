import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { z } from "zod";

import {
  fetchQueryPage,
  mapFirestoreError,
  requireDb,
  timestampToIso,
  type QueryPage,
} from "@/lib/firebase/firestore";
import { parseOrThrow } from "@/lib/validation";

/**
 * Notifications service — Firestore `users/{uid}/notifications/{id}`.
 *
 * - Created ONLY by legitimate in-app events (exported `createNotification`).
 *   There are no fake live travel alerts and no push/FCM in this phase.
 * - `timestamp` is a human-relative string derived from `createdAt` at read
 *   time ("12 min ago") so the existing UI renders unchanged, while the
 *   stored value stays a real timestamp.
 * - Updates are restricted to the `read` field by Security Rules.
 */

const categorySchema = z.enum([
  "Satellite",
  "Weather",
  "Offline Sync",
  "Emergency",
  "Transit",
]);
const severitySchema = z.enum(["critical", "warning", "info", "success"]);

export const notificationSchema = z.object({
  category: categorySchema,
  title: z.string().trim().min(1).max(200),
  body: z.string().max(1000).default(""),
  read: z.boolean().default(false),
  severity: severitySchema.default("info"),
  actionLabel: z.string().max(100).nullish(),
  actionHref: z.string().max(500).nullish(),
});
export type NotificationInput = z.input<typeof notificationSchema>;

export type NotificationRecord = z.output<typeof notificationSchema> & {
  id: string;
  /** Stored creation time (ISO). */
  createdAt: string;
  /** Relative display string for the UI, derived from `createdAt`. */
  timestamp: string;
};

const recordSchema = notificationSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().default(""),
});

/** Relative display time: "just now" | "12 min ago" | "3 hrs ago" | "2 days ago". */
export function relativeTime(iso: string, now = Date.now()): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "just now";
  const minutes = Math.floor((now - then) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(then).toLocaleDateString();
}

function notifRef(uid: string) {
  return collection(requireDb(), "users", uid, "notifications");
}

function oneRef(uid: string, id: string) {
  return doc(requireDb(), "users", uid, "notifications", id);
}

function mapDoc(raw: { id: string } & Record<string, unknown>): NotificationRecord | null {
  const createdAt = timestampToIso(raw.createdAt);
  const parsed = recordSchema.safeParse({ ...raw, createdAt });
  if (!parsed.success) {
    console.warn(`[TrailMind] notification ${raw.id} failed validation:`, parsed.error.issues[0]);
    return null;
  }
  return { ...parsed.data, timestamp: relativeTime(createdAt) };
}

/**
 * Records an in-app notification (app events only — trip created, sync
 * finished, document uploaded, AI reply ready, …). Never used to fabricate
 * external/live alerts.
 */
export async function createNotification(
  uid: string,
  input: NotificationInput
): Promise<NotificationRecord> {
  try {
    const data = parseOrThrow(notificationSchema, input);
    const ref = doc(notifRef(uid));
    await setDoc(ref, {
      ...data,
      actionLabel: data.actionLabel ?? null,
      actionHref: data.actionHref ?? null,
      createdAt: serverTimestamp(),
    });
    const now = new Date().toISOString();
    return { id: ref.id, ...data, actionLabel: data.actionLabel ?? null, actionHref: data.actionHref ?? null, createdAt: now, timestamp: "just now" };
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

export type ListNotificationsOptions = {
  pageSize?: number;
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
  unreadOnly?: boolean;
};

/** Newest-first page of notifications (cursor paginated). */
export async function listNotifications(
  uid: string,
  { pageSize = 20, cursor, unreadOnly }: ListNotificationsOptions = {}
): Promise<QueryPage<NotificationRecord>> {
  try {
    const base = query(notifRef(uid), orderBy("createdAt", "desc"));
    const page = await fetchQueryPage<{ id: string } & Record<string, unknown>>(
      base,
      pageSize,
      cursor
    );
    let items = page.items.map(mapDoc).filter((n): n is NotificationRecord => n !== null);
    if (unreadOnly) items = items.filter((n) => !n.read);
    return { items, cursor: page.cursor, hasMore: page.hasMore };
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** Unread badge count over the newest 100 notifications (bounded read). */
export async function countUnreadNotifications(uid: string): Promise<number> {
  try {
    const page = await fetchQueryPage<{ id: string } & Record<string, unknown>>(
      query(notifRef(uid), orderBy("createdAt", "desc")),
      100,
      null
    );
    return page.items
      .map(mapDoc)
      .filter((n): n is NotificationRecord => n !== null && !n.read).length;
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** Marks one notification as read. */
export async function markNotificationRead(
  uid: string,
  notificationId: string
): Promise<void> {
  try {
    await updateDoc(oneRef(uid, notificationId), { read: true });
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** Marks one notification as unread again. */
export async function markNotificationUnread(
  uid: string,
  notificationId: string
): Promise<void> {
  try {
    await updateDoc(oneRef(uid, notificationId), { read: false });
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** Marks every notification as read in one batch. */
export async function markAllNotificationsRead(uid: string): Promise<number> {
  try {
    const page = await fetchQueryPage<{ id: string } & Record<string, unknown>>(
      query(notifRef(uid), orderBy("createdAt", "desc")),
      100,
      null
    );
    const unread = page.items.filter((raw) => raw.read !== true);
    if (unread.length === 0) return 0;

    const batch = writeBatch(requireDb());
    unread.forEach((raw) => batch.update(oneRef(uid, raw.id), { read: true }));
    await batch.commit();
    return unread.length;
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** Deletes one notification. Idempotent. */
export async function deleteNotification(uid: string, notificationId: string): Promise<void> {
  try {
    await deleteDoc(oneRef(uid, notificationId));
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** Deletes every notification (batched). Returns the number removed. */
export async function clearAllNotifications(uid: string): Promise<number> {
  try {
    const snapshot = await getDocs(query(notifRef(uid), limit(400)));
    if (snapshot.empty) return 0;
    const batch = writeBatch(requireDb());
    snapshot.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    return snapshot.size;
  } catch (error) {
    throw mapFirestoreError(error);
  }
}
