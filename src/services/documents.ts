import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { z } from "zod";

import {
  fetchQueryPage,
  isTransientFirestoreError,
  mapFirestoreError,
  requireDb,
  timestampToIso,
  type QueryPage,
} from "@/lib/firebase/firestore";
import { isOfflineForData } from "@/lib/offline/connectivity";
import {
  dropCachedDocument,
  mirrorDocument,
  mirrorDocuments,
  queueDocumentDelete,
  queueDocumentUpdate,
  readCachedDocument,
  readCachedDocuments,
} from "@/lib/offline/documents";
import {
  UPLOAD_LIMITS,
  deleteDocumentObject,
  getDocumentDownloadUrl,
  mapStorageError,
  readDocumentBytes,
  uploadTravelDocument,
  validateTravelDocumentFile,
} from "@/lib/firebase/storage";
import { parseOrThrow, providedFields } from "@/lib/validation";

/**
 * Travel Wallet documents — Firestore metadata + Firebase Storage bytes.
 *
 * ---------------------------------------------------------------------------
 * Split of responsibility (important):
 *   - File content  → Storage at users/{uid}/documents/{documentId}/{fileName}
 *   - File metadata → Firestore users/{uid}/documents/{documentId}
 *   - Offline flag  → `offlineAvailable` records that the BYTES were fetched
 *     to this device; metadata being readable offline is NOT the same thing.
 * ---------------------------------------------------------------------------
 *
 * The record shape matches the wallet UI (`TravelDocumentItem`) plus the
 * real file fields (`fileName`, `contentType`, `sizeBytes`, `storagePath`),
 * so Phase 10 page swaps are drop-in. All writes uid-scoped; Security Rules
 * are the real boundary.
 */

/* -------------------------------------------------------------------------- */
/* Schema                                                                      */
/* -------------------------------------------------------------------------- */

const documentCategorySchema = z.enum([
  "Transport",
  "Lodging",
  "Pass / Visa",
  "Insurance",
  "Permit",
]);

export const travelDocumentSchema = z.object({
  category: documentCategorySchema.default("Transport"),
  title: z.string().trim().min(1).max(200),
  referenceCode: z.string().max(100).default(""),
  issuer: z.string().max(200).default(""),
  carrierOrHotel: z.string().max(200).default(""),
  validDates: z.string().max(100).default(""),
  seatOrRoom: z.string().max(200).nullish(),
  departureTime: z.string().max(50).nullish(),
  arrivalTime: z.string().max(50).nullish(),
  departureStation: z.string().max(100).nullish(),
  arrivalStation: z.string().max(100).nullish(),
  encryptionStatus: z
    .enum(["AES-256 Encrypted (On-Device)", "Hardware Key Bound"])
    .default("AES-256 Encrypted (On-Device)"),
  barcodeType: z
    .enum(["Aztec Code", "QR-Code", "PDF417"])
    .default("QR-Code"),
  barcodeValue: z.string().max(500).default(""),
  status: z.enum(["active", "archived", "upcoming"]).default("active"),
  image: z.string().max(500).nullish(),
  details: z.record(z.string().max(500), z.string().max(500)).default({}),
  notes: z.string().max(4000).default(""),
  /** Trip this document belongs to (de-associated, not deleted, on trip delete). */
  tripId: z.string().nullish(),
  /* --- real file fields (present after an upload) --- */
  fileName: z.string().max(255).nullish(),
  contentType: z.string().max(100).nullish(),
  sizeBytes: z.number().int().min(0).nullish(),
  storagePath: z.string().max(1024).nullish(),
  /** True once the file bytes have been fetched to this device. */
  offlineAvailable: z.boolean().default(false),
});
export type TravelDocumentInput = z.input<typeof travelDocumentSchema>;

export type TravelDocumentRecord = z.output<typeof travelDocumentSchema> & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

const recordSchema = travelDocumentSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().default(""),
  updatedAt: z.string().default(""),
});

/* -------------------------------------------------------------------------- */
/* Paths & mapping                                                             */
/* -------------------------------------------------------------------------- */

function docsRef(uid: string) {
  return collection(requireDb(), "users", uid, "documents");
}

function docRef(uid: string, documentId: string) {
  return doc(requireDb(), "users", uid, "documents", documentId);
}

function mapDoc(raw: { id: string } & Record<string, unknown>): TravelDocumentRecord | null {
  const parsed = recordSchema.safeParse({
    ...raw,
    createdAt: timestampToIso(raw.createdAt),
    updatedAt: timestampToIso(raw.updatedAt),
  });
  if (!parsed.success) {
    console.warn(`[TrailMind] document ${raw.id} failed validation:`, parsed.error.issues[0]);
    return null;
  }
  return parsed.data;
}

/* -------------------------------------------------------------------------- */
/* Upload & create                                                             */
/* -------------------------------------------------------------------------- */

export type CreateDocumentOptions = {
  uid: string;
  file: File;
  metadata: TravelDocumentInput;
  /** 0–1 upload progress for the UI. */
  onProgress?: (fraction: number) => void;
};

/**
 * Validates the file, uploads it to the user's scoped Storage folder, then
 * writes the metadata document. If the metadata write fails after upload,
 * the uploaded object is cleaned up so no orphaned bytes remain.
 *
 * Uploads are NEVER queued — bytes genuinely require the network, so an
 * offline attempt fails immediately with an honest message instead of
 * pretending to be pending.
 */
export async function uploadDocument({
  uid,
  file,
  metadata,
  onProgress,
}: CreateDocumentOptions): Promise<TravelDocumentRecord> {
  const validation = validateTravelDocumentFile(file);
  if (!validation.ok) throw new Error(validation.error);

  if (isOfflineForData()) {
    throw new Error(
      "Uploading requires a connection — the file was not saved. It will not be queued."
    );
  }

  const input = parseOrThrow(travelDocumentSchema, metadata);
  const ref = doc(docsRef(uid));

  const uploaded = await uploadTravelDocument(file, {
    uid,
    documentId: ref.id,
    onProgress,
  });

  try {
    const stored = {
      ...input,
      fileName: file.name,
      contentType: uploaded.contentType,
      sizeBytes: uploaded.size,
      storagePath: uploaded.path,
      offlineAvailable: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, stored);

    return {
      id: ref.id,
      ...input,
      fileName: file.name,
      contentType: uploaded.contentType,
      sizeBytes: uploaded.size,
      storagePath: uploaded.path,
      offlineAvailable: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    // Roll back the uploaded object — never leave orphaned bytes behind.
    try {
      await deleteDocumentObject(uploaded.path);
    } catch {
      /* best effort; the object remains harmless without a metadata record */
    }
    throw mapFirestoreError(error);
  }
}

/**
 * Creates a metadata-only document (no file attached yet).
 *
 * Offline: fails honestly — creates are not queued (an entry pointing at a
 * file that was never uploaded would be a lie).
 */
export async function createDocumentMetadata(
  uid: string,
  metadata: TravelDocumentInput
): Promise<TravelDocumentRecord> {
  try {
    if (isOfflineForData()) {
      throw new Error(
        "Adding a travel document requires a connection — nothing was saved."
      );
    }
    const input = parseOrThrow(travelDocumentSchema, metadata);
    const ref = doc(docsRef(uid));
    await setDoc(ref, {
      ...input,
      offlineAvailable: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return {
      id: ref.id,
      ...input,
      offlineAvailable: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Read                                                                        */
/* -------------------------------------------------------------------------- */

export type ListDocumentsOptions = {
  pageSize?: number;
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
  /** Filter by category, status or trip. */
  category?: z.output<typeof documentCategorySchema>;
  tripId?: string;
};

/**
 * Newest-first page of wallet documents (cursor paginated).
 *
 * Offline (or transient failure with a mirror present): served from Dexie.
 */
export async function listDocuments(
  uid: string,
  { pageSize = 20, cursor, category, tripId }: ListDocumentsOptions = {}
): Promise<QueryPage<TravelDocumentRecord>> {
  const filter = (items: TravelDocumentRecord[]) => {
    let out = items;
    if (category) out = out.filter((d) => d.category === category);
    if (tripId) out = out.filter((d) => d.tripId === tripId);
    return out;
  };

  if (isOfflineForData()) {
    return { items: filter(await readCachedDocuments()), cursor: null, hasMore: false };
  }
  try {
    // Equality filters are applied client-side over an createdAt ordering —
    // keeps composite-index requirements minimal (see FIRESTORE_SCHEMA.md).
    const base = query(docsRef(uid), orderBy("createdAt", "desc"));
    const page = await fetchQueryPage<{ id: string } & Record<string, unknown>>(
      base,
      pageSize,
      cursor
    );

    const mapped = page.items
      .map(mapDoc)
      .filter((d): d is TravelDocumentRecord => d !== null);
    void mirrorDocuments(mapped).catch((error) =>
      console.warn("[TrailMind] documents mirror failed:", error)
    );

    // The cursor tracks the RAW page, so pagination stays correct even when
    // filtered items shrink this page below `pageSize`.
    return { items: filter(mapped), cursor: page.cursor, hasMore: page.hasMore };
  } catch (error) {
    if (isTransientFirestoreError(error)) {
      const cached = filter(await readCachedDocuments());
      if (cached.length > 0) return { items: cached, cursor: null, hasMore: false };
    }
    throw mapFirestoreError(error);
  }
}

/** One document, or `null` when missing/malformed. */
export async function getDocument(
  uid: string,
  documentId: string
): Promise<TravelDocumentRecord | null> {
  if (isOfflineForData()) return readCachedDocument(documentId);
  try {
    const snapshot = await getDoc(docRef(uid, documentId));
    if (!snapshot.exists()) return null;
    const record = mapDoc({ id: snapshot.id, ...snapshot.data() });
    if (record) {
      void mirrorDocument(record).catch((error) =>
        console.warn("[TrailMind] document mirror failed:", error)
      );
    }
    return record;
  } catch (error) {
    if (isTransientFirestoreError(error)) {
      const cached = await readCachedDocument(documentId);
      if (cached) return cached;
    }
    throw mapFirestoreError(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Update & delete                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Updates metadata fields (never touches the uploaded file).
 *
 * Offline: applied to the mirror immediately and queued with the
 * `updatedAt` it was based on (conflict signal on flush).
 */
export async function updateDocument(
  uid: string,
  documentId: string,
  patch: Partial<TravelDocumentInput>
): Promise<void> {
  try {
    const parsed = parseOrThrow(travelDocumentSchema.partial(), patch);
    // Zod fills defaults for absent keys (status, notes, offlineAvailable, …)
    // — keep only what the caller sent so an update is strictly additive.
    const fields: Record<string, unknown> = {
      ...providedFields(patch, parsed),
    };
    if (Object.keys(fields).length === 0) throw new Error("Nothing to update.");

    if (isOfflineForData()) {
      const current = await readCachedDocument(documentId);
      if (!current) {
        throw new Error(
          "This document isn't saved on this device — reconnect to edit it."
        );
      }
      await queueDocumentUpdate(
        uid,
        documentId,
        fields,
        current.updatedAt
      );
      return;
    }

    await updateDoc(docRef(uid, documentId), {
      ...fields,
      updatedAt: serverTimestamp(),
    });

    // Refresh the mirror so a later offline edit has the right base state.
    const fresh = await getDoc(docRef(uid, documentId)).catch(() => null);
    const record = fresh?.exists()
      ? mapDoc({ id: fresh.id, ...fresh.data() })
      : null;
    if (record) {
      void mirrorDocument(record).catch((error) =>
        console.warn("[TrailMind] document mirror failed:", error)
      );
    }
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/**
 * Deletes the Storage object first (when one exists), then the metadata
 * document. A failure between the two is reported honestly — partial state
 * is retried by calling again (delete is idempotent).
 *
 * Offline: mirror entry disappears now; the engine runs the full deletion
 * (storage object + metadata) on reconnect.
 */
export async function deleteDocument(uid: string, documentId: string): Promise<void> {
  if (isOfflineForData()) {
    await queueDocumentDelete(uid, documentId);
    return;
  }
  try {
    const record = await getDocument(uid, documentId);
    if (!record) {
      // Already gone remotely — drop any stale mirror copy too.
      await dropCachedDocument(documentId).catch(() => {});
      return;
    }

    if (record.storagePath) {
      try {
        await deleteDocumentObject(record.storagePath);
      } catch (error) {
        const mapped = mapStorageError(error);
        // object-not-found is fine (already removed)
        if (!String(mapped.message).includes("no longer exists")) throw mapped;
      }
    }
    await deleteDoc(docRef(uid, documentId));
    await dropCachedDocument(documentId).catch((error) =>
      console.warn("[TrailMind] document mirror drop failed:", error)
    );
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Content access                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Reads the document's bytes directly (no URL exposure) — the safe path for
 * inline display. Requires the file to exist and the user to be the owner
 * (enforced by Storage Rules).
 */
export async function readDocumentContent(
  uid: string,
  record: TravelDocumentRecord
): Promise<ArrayBuffer> {
  if (!record.storagePath) {
    throw new Error("This entry has no uploaded file attached.");
  }
  try {
    return await readDocumentBytes(record.storagePath);
  } catch (error) {
    throw mapStorageError(error);
  }
}

/**
 * Signed download URL for opening the file in a new tab.
 *
 * SECURITY: the URL embeds an access token — anyone holding it can read the
 * file until it expires. Never log, share or persist it. Prefer
 * `readDocumentContent()` everywhere else.
 */
export async function getDocumentUrl(
  record: TravelDocumentRecord
): Promise<string> {
  if (!record.storagePath) {
    throw new Error("This entry has no uploaded file attached.");
  }
  try {
    return await getDocumentDownloadUrl(record.storagePath);
  } catch (error) {
    throw mapStorageError(error);
  }
}

/**
 * Marks the file bytes as fetched to this device. Callers MUST actually
 * store the bytes (offline layer) before setting this — the flag is never
 * set speculatively.
 */
export async function markDocumentOffline(
  uid: string,
  documentId: string,
  available: boolean
): Promise<void> {
  try {
    await updateDoc(docRef(uid, documentId), {
      offlineAvailable: available,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** Maximum bytes a wallet document may have (mirrors Storage Rules). */
export const DOCUMENT_SIZE_LIMIT = UPLOAD_LIMITS.maxBytes;
