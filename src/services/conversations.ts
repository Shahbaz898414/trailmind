import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  writeBatch,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { z } from "zod";

import {
  mapFirestoreError,
  requireDb,
  timestampToIso,
  type QueryPage,
} from "@/lib/firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/client";
import { isOfflineStoreAvailable } from "@/lib/offline/db";
import { parseOrThrow } from "@/lib/validation";

/**
 * AI conversation history — Firestore, with a Dexie fallback for the
 * not-configured case.
 *
 * ---------------------------------------------------------------------------
 * Storage layout:
 *   users/{uid}/conversations/{conversationId}         { title, tripId, … }
 *   users/{uid}/conversations/{id}/messages/{msgId}    { role, content, source, … }
 *
 * Honesty model — `MessageRecord.syncState` tells the truth about each
 * message's durability; nothing is ever reported as synced when it isn't:
 *
 *   "synced"    → the server has confirmed this message.
 *   "pending"   → written to Firestore, awaiting server confirmation. Offline
 *                 writes queue inside Firestore's persistent cache and ARE
 *                 retried by the SDK when connectivity returns — real
 *                 `persistentLocalCache` behaviour, not an app-level claim.
 *   "local-only"→ Firestore is unavailable (Firebase not configured), so the
 *                 message lives ONLY in IndexedDB (`chatMessages`). It has
 *                 NOT been sent anywhere; pushing it later is the sync
 *                 engine's job (Phase 6). This service never pretends
 *                 otherwise.
 * ---------------------------------------------------------------------------
 *
 * Exactly ONE copy of a message exists: configured → Firestore (even when
 * offline, its cache queues it); not configured → Dexie. The two never
 * overlap for the same message, so reads can't double-count.
 */

/* -------------------------------------------------------------------------- */
/* Schemas & records                                                           */
/* -------------------------------------------------------------------------- */

const messageRoleSchema = z.enum(["user", "assistant"]);
const messageSourceSchema = z.enum(["on-device", "cloud"]);

export const conversationInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  /** Trip this conversation is about, when applicable. */
  tripId: z.string().max(128).nullish(),
});
export type ConversationInput = z.input<typeof conversationInputSchema>;

export const messageInputSchema = z.object({
  role: messageRoleSchema,
  content: z.string().trim().min(1).max(8000),
  /** Real inference source of an assistant reply; `null`/absent for user turns. */
  source: messageSourceSchema.nullish(),
});
export type MessageInput = z.input<typeof messageInputSchema>;

export type ConversationRecord = {
  id: string;
  title: string;
  tripId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MessageSyncState = "synced" | "pending" | "local-only";

export type MessageRecord = {
  id: string;
  conversationId: string;
  role: z.output<typeof messageRoleSchema>;
  content: string;
  source: z.output<typeof messageSourceSchema> | null;
  createdAt: string;
  syncState: MessageSyncState;
};

const conversationRecordSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  tripId: z.string().nullish().default(null),
  createdAt: z.string().default(""),
  updatedAt: z.string().default(""),
});

function mapConversation(
  raw: { id: string } & Record<string, unknown>
): ConversationRecord | null {
  const parsed = conversationRecordSchema.safeParse({
    ...raw,
    createdAt: timestampToIso(raw.createdAt),
    updatedAt: timestampToIso(raw.updatedAt),
  });
  if (!parsed.success) {
    console.warn(
      `[TrailMind] conversation ${raw.id} failed validation:`,
      parsed.error.issues[0]
    );
    return null;
  }
  return { ...parsed.data, tripId: parsed.data.tripId ?? null };
}

/* -------------------------------------------------------------------------- */
/* Paths & environment                                                         */
/* -------------------------------------------------------------------------- */

function conversationsRef(uid: string) {
  return collection(requireDb(), "users", uid, "conversations");
}

function conversationRef(uid: string, conversationId: string) {
  return doc(requireDb(), "users", uid, "conversations", conversationId);
}

function messagesRef(uid: string, conversationId: string) {
  return collection(
    requireDb(),
    "users",
    uid,
    "conversations",
    conversationId,
    "messages"
  );
}

function messageRef(uid: string, conversationId: string, messageId: string) {
  return doc(
    requireDb(),
    "users",
    uid,
    "conversations",
    conversationId,
    "messages",
    messageId
  );
}

function backendAvailable(): boolean {
  return isFirebaseConfigured && getFirebaseDb() !== null;
}

function isBrowserOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/* -------------------------------------------------------------------------- */
/* Conversations                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Creates a conversation shell (the title usually comes from the first exchange).
 *
 * Offline: the write is queued by Firestore's persistent cache and deliberately
 * NOT awaited — a `setDoc` promise only resolves after server acknowledgment,
 * so awaiting it would freeze the composer until the network returns. The
 * returned record carries local timestamps and is not claimed as
 * server-confirmed; the SDK flushes the queue on reconnect.
 */
export async function createConversation(
  uid: string,
  input: ConversationInput
): Promise<ConversationRecord> {
  try {
    const data = parseOrThrow(conversationInputSchema, input);
    const ref = doc(conversationsRef(uid));
    const stored = {
      ...data,
      tripId: data.tripId ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const now = new Date().toISOString();
    const record: ConversationRecord = {
      id: ref.id,
      title: data.title,
      tripId: data.tripId ?? null,
      createdAt: now,
      updatedAt: now,
    };

    if (isBrowserOffline()) {
      void setDoc(ref, stored).catch((error) =>
        console.warn("[TrailMind] queued conversation write failed:", error)
      );
      return record;
    }

    await setDoc(ref, stored);
    return record;
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** Newest-activity-first page of conversations (cursor paginated). */
export async function listConversations(
  uid: string,
  {
    pageSize = 20,
    cursor,
  }: { pageSize?: number; cursor?: QueryDocumentSnapshot<DocumentData> | null } = {}
): Promise<QueryPage<ConversationRecord>> {
  try {
    const base = query(conversationsRef(uid), orderBy("updatedAt", "desc"));
    const constraints: QueryConstraint[] = [limit(pageSize + 1)];
    if (cursor) constraints.push(startAfter(cursor));
    const snapshot = await getDocs(query(base, ...constraints));

    const docs = snapshot.docs;
    const hasMore = docs.length > pageSize;
    const page = hasMore ? docs.slice(0, pageSize) : docs;

    return {
      items: page
        .map((d) => mapConversation({ id: d.id, ...d.data() }))
        .filter((c): c is ConversationRecord => c !== null),
      cursor: hasMore ? docs[pageSize - 1] : null,
      hasMore,
    };
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** One conversation, or `null` when missing/malformed. */
export async function getConversation(
  uid: string,
  conversationId: string
): Promise<ConversationRecord | null> {
  try {
    const snapshot = await getDoc(conversationRef(uid, conversationId));
    if (!snapshot.exists()) return null;
    return mapConversation({ id: snapshot.id, ...snapshot.data() });
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** Renames a conversation. */
export async function renameConversation(
  uid: string,
  conversationId: string,
  title: string
): Promise<void> {
  try {
    const parsed = z.string().trim().min(1).max(200).safeParse(title);
    if (!parsed.success) throw new Error("Title must be 1–200 characters.");
    await updateDoc(conversationRef(uid, conversationId), {
      title: parsed.data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/**
 * Deletes a conversation, its messages, and any local-only copies.
 * Firestore does not cascade, so messages are batch-deleted explicitly.
 */
export async function deleteConversation(
  uid: string,
  conversationId: string
): Promise<void> {
  try {
    const db = requireDb();
    const messages = await getDocs(messagesRef(uid, conversationId));
    if (!messages.empty) {
      const docs = messages.docs;
      for (let i = 0; i < docs.length; i += 400) {
        const batch = writeBatch(db);
        docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    }
    await deleteDoc(conversationRef(uid, conversationId));

    // Local-only copies (never sent to the server) go too.
    if (isOfflineStoreAvailable()) {
      const { getOfflineDb } = await import("@/lib/offline/db");
      await getOfflineDb()
        .chatMessages.where("conversationId")
        .equals(conversationId)
        .delete();
    }
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Messages                                                                    */
/* -------------------------------------------------------------------------- */

export type AppendMessageResult = {
  message: MessageRecord;
  /**
   * "synced"     — server-confirmed.
   * "pending"    — in Firestore's offline queue; the SDK retries for real
   *                when connectivity returns, but NOT yet server-confirmed.
   * "local-only" — IndexedDB only; not sent anywhere (Phase 6 syncs it).
   */
  status: MessageSyncState;
};

/**
 * Appends one message to a conversation.
 *
 * - Backend configured → Firestore. Online: resolves after server
 *   confirmation ("synced"). Offline: `setDoc` is queued by Firestore's
 *   persistent cache and deliberately NOT awaited (it can't be confirmed
 *   while offline) → honestly reported "pending"; queue failures are logged.
 * - Backend not configured → Dexie `chatMessages` only → "local-only".
 *
 * Also bumps the parent conversation's `updatedAt` (list ordering).
 */
export async function appendMessage(
  uid: string,
  conversationId: string,
  input: MessageInput
): Promise<AppendMessageResult> {
  const data = parseOrThrow(messageInputSchema, input);
  const now = new Date().toISOString();

  // --- path 1: Firebase not configured → Dexie only ----------------------
  if (!backendAvailable()) {
    const record = await writeLocalMessage(conversationId, {
      role: data.role,
      content: data.content,
      source: data.source ?? null,
    });
    return { message: record, status: "local-only" };
  }

  // --- path 2: configured → Firestore (offline writes queue for real) ----
  try {
    const ref = messageRef(
      uid,
      conversationId,
      doc(messagesRef(uid, conversationId)).id
    );
    const stored = {
      role: data.role,
      content: data.content,
      source: data.source ?? null,
      createdAt: serverTimestamp(),
    };

    if (isBrowserOffline()) {
      // Firestore's persistent cache queues this and retries on reconnect.
      // Awaiting server ack here would hang until the network returns, so we
      // don't — and we don't claim confirmation we don't have.
      void setDoc(ref, stored).catch((error) =>
        console.warn("[TrailMind] queued message write failed:", error)
      );
      void updateDoc(conversationRef(uid, conversationId), {
        updatedAt: serverTimestamp(),
      }).catch(() => {});
      return {
        message: {
          id: ref.id,
          conversationId,
          role: data.role,
          content: data.content,
          source: data.source ?? null,
          createdAt: now,
          syncState: "pending",
        },
        status: "pending",
      };
    }

    await setDoc(ref, stored);
    // Ordering update is cosmetic — a failure must not fail the message.
    await updateDoc(conversationRef(uid, conversationId), {
      updatedAt: serverTimestamp(),
    }).catch((error) =>
      console.warn("[TrailMind] conversation updatedAt bump failed:", error)
    );

    return {
      message: {
        id: ref.id,
        conversationId,
        role: data.role,
        content: data.content,
        source: data.source ?? null,
        createdAt: now,
        syncState: "synced",
      },
      status: "synced",
    };
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

async function writeLocalMessage(
  conversationId: string,
  data: { role: "user" | "assistant"; content: string; source: "on-device" | "cloud" | null }
): Promise<MessageRecord> {
  if (!isOfflineStoreAvailable()) {
    throw new Error(
      "No backend is configured and IndexedDB is unavailable — this message cannot be stored anywhere. Not sending it."
    );
  }
  const { getOfflineDb } = await import("@/lib/offline/db");
  const record: MessageRecord = {
    id: crypto.randomUUID(),
    conversationId,
    role: data.role,
    content: data.content,
    source: data.source,
    createdAt: new Date().toISOString(),
    syncState: "local-only",
  };
  await getOfflineDb().chatMessages.put({
    id: record.id,
    conversationId,
    tripId: undefined,
    role: record.role,
    content: record.content,
    source: record.source ?? undefined,
    createdAt: record.createdAt,
  });
  return record;
}

export type ListMessagesOptions = {
  pageSize?: number;
  /** Cursor from the previous (older) page. */
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
  /** Include Dexie local-only messages (default true). */
  includeLocal?: boolean;
};

export type ListMessagesPage = {
  /** Newest → oldest (prepend order for the UI). */
  items: MessageRecord[];
  cursor: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
};

/**
 * One page of messages, newest first, with per-message sync state derived
 * from real Firestore metadata (`hasPendingWrites` → "pending") plus any
 * local-only Dexie messages for this conversation.
 *
 * When the backend is not configured, falls back to Dexie entirely.
 */
export async function listMessages(
  uid: string,
  conversationId: string,
  { pageSize = 50, cursor, includeLocal = true }: ListMessagesOptions = {}
): Promise<ListMessagesPage> {
  const localMessages = includeLocal
    ? await readLocalMessages(conversationId)
    : [];

  if (!backendAvailable()) {
    const sorted = [...localMessages]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, pageSize);
    return { items: sorted, cursor: null, hasMore: false };
  }

  try {
    const constraints: QueryConstraint[] = [orderBy("createdAt", "desc"), limit(pageSize + 1)];
    if (cursor) constraints.push(startAfter(cursor));
    const snapshot = await getDocs(
      query(messagesRef(uid, conversationId), ...constraints)
    );

    const docs = snapshot.docs;
    const hasMore = docs.length > pageSize;
    const page = hasMore ? docs.slice(0, pageSize) : docs;

    const items: MessageRecord[] = page.map((d) => {
      const raw = d.data();
      return {
        id: d.id,
        conversationId,
        role: raw.role === "assistant" ? "assistant" : "user",
        content: typeof raw.content === "string" ? raw.content : "",
        source:
          raw.source === "on-device" || raw.source === "cloud"
            ? raw.source
            : null,
        createdAt: timestampToIso(raw.createdAt),
        syncState: d.metadata.hasPendingWrites ? "pending" : "synced",
      };
    });

    // Local-only messages from "backend unconfigured" periods (they never
    // reached Firestore, so their ids can't collide with server ids).
    items.push(...localMessages);
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return { items, cursor: hasMore ? docs[pageSize - 1] : null, hasMore };
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** Reads local-only (Dexie) messages for a conversation, unsorted. */
export async function readLocalMessages(
  conversationId: string
): Promise<MessageRecord[]> {
  if (!isOfflineStoreAvailable()) return [];
  try {
    const { getOfflineDb } = await import("@/lib/offline/db");
    const rows = await getOfflineDb()
      .chatMessages.where("conversationId")
      .equals(conversationId)
      .toArray();
    return rows.map((row) => ({
      id: row.id,
      conversationId,
      role: row.role,
      content: row.content,
      source: row.source ?? null,
      createdAt: row.createdAt,
      syncState: "local-only" as const,
    }));
  } catch (error) {
    console.warn("[TrailMind] could not read local chat messages:", error);
    return [];
  }
}
