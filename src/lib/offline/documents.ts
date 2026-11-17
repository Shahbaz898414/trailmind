import type { TravelDocumentRecord } from "@/services/documents";
import { getOfflineDb, isOfflineStoreAvailable } from "@/lib/offline/db";
import { enqueueMutation } from "@/lib/offline/mutation-queue";

/**
 * Offline mirror + queued-write helpers for travel-wallet documents.
 *
 * ---------------------------------------------------------------------------
 * METADATA ONLY. File bytes live in Firebase Storage and genuinely cannot be
 * fetched or uploaded with no connection — this module never caches bytes and
 * never marks `offlineAvailable`. Reads fall back to mirrored metadata (so
 * titles/notes/references stay visible); opening the file offline fails
 * honestly with a network error from the Storage SDK.
 * ---------------------------------------------------------------------------

 * Queued operations:
 *   - `update` (metadata edits: title, notes, category, trip link, flags)
 *   - `delete` (engine runs the full storage-object + metadata deletion)
 * Uploads are NOT queued — an upload that can't reach Storage fails
 * immediately with an honest error instead of pretending to be pending.
 */

/** Mirrors document metadata after successful reads/writes. */
export async function mirrorDocuments(
  documents: TravelDocumentRecord[]
): Promise<void> {
  if (!isOfflineStoreAvailable() || documents.length === 0) return;
  await getOfflineDb().documentsMeta.bulkPut(documents);
}

/** Mirrors a single document record. */
export async function mirrorDocument(
  document: TravelDocumentRecord
): Promise<void> {
  if (!isOfflineStoreAvailable()) return;
  await getOfflineDb().documentsMeta.put(document);
}

/** All mirrored documents, newest first. */
export async function readCachedDocuments(): Promise<TravelDocumentRecord[]> {
  if (!isOfflineStoreAvailable()) return [];
  const rows = await getOfflineDb().documentsMeta.toArray();
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** One mirrored document, or `null`. */
export async function readCachedDocument(
  documentId: string
): Promise<TravelDocumentRecord | null> {
  if (!isOfflineStoreAvailable()) return null;
  return (await getOfflineDb().documentsMeta.get(documentId)) ?? null;
}

/** Removes a document's metadata from the mirror (bytes live elsewhere). */
export async function dropCachedDocument(documentId: string): Promise<void> {
  if (!isOfflineStoreAvailable()) return;
  await getOfflineDb().documentsMeta.delete(documentId);
}

/** Queues an offline metadata edit (mirrored immediately). */
export async function queueDocumentUpdate(
  uid: string,
  documentId: string,
  fields: Record<string, unknown>,
  baseUpdatedAt?: string
): Promise<void> {
  if (isOfflineStoreAvailable()) {
    const current = await readCachedDocument(documentId);
    if (current) {
      await getOfflineDb().documentsMeta.put({
        ...current,
        ...fields,
        id: documentId,
        updatedAt: new Date().toISOString(),
      } as TravelDocumentRecord);
    }
  }
  await enqueueMutation({
    uid,
    entity: "document",
    entityId: documentId,
    operation: "update",
    payload: fields,
    baseUpdatedAt,
  });
}

/** Queues an offline deletion (mirror dropped now; engine deletes storage
 *  object + metadata when back online). */
export async function queueDocumentDelete(uid: string, documentId: string): Promise<void> {
  await dropCachedDocument(documentId);
  await enqueueMutation({
    uid,
    entity: "document",
    entityId: documentId,
    operation: "delete",
  });
}
