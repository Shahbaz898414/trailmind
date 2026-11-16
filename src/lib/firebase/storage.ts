import {
  deleteObject,
  getBytes,
  getDownloadURL,
  getMetadata,
  listAll,
  ref,
  uploadBytesResumable,
  type StorageError,
  type StorageReference,
  type UploadTaskSnapshot,
} from "firebase/storage";

import { getFirebaseStorage } from "./client";

/**
 * Firebase Storage service for travel documents (boarding passes, vouchers,
 * insurance PDFs, permits).
 *
 * Design notes
 * ---------------------------------------------------------------------------
 * - Object paths are always user-scoped:
 *     users/{uid}/documents/{documentId}/{fileName}
 *   `storage.rules` rejects any path that doesn't match the signed-in user,
 *   so ownership is enforced server-side, not by hiding paths.
 * - `readObjectBytes()` is the preferred way to consume a document: it
 *   returns the bytes directly without minting a long-lived URL.
 *   `getDownloadUrl()` exists for cases that genuinely need a URL (opening a
 *   PDF in a new tab) — Firebase signed URLs embed an access token, so treat
 *   them as bearer credentials and never log or share them.
 * - File type and size limits are validated *before* upload here AND again
 *   in `storage.rules`; client checks are UX, rules are the security boundary.
 */

/** Hard limits enforced by both this module and `storage.rules`. */
export const UPLOAD_LIMITS = {
  /**10 MB — documents are scans/PDFs, not raw media. */
  maxBytes: 10 * 1024 * 1024,
  allowedTypes: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ],
  allowedExtensions: [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
} as const;

/** Storage instance — throws when Firebase is not configured. */
function requireStorage(): NonNullable<ReturnType<typeof getFirebaseStorage>> {
  const storage = getFirebaseStorage();
  if (!storage) {
    throw new Error(
      "Firebase Storage is not configured. Copy .env.example to .env.local and add your Firebase web app values."
    );
  }
  return storage;
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

/** Result of a pre-upload file check. `error` is UI-safe when `ok` is false. */
export type FileValidation = { ok: true } | { ok: false; error: string };

/** Validates MIME type and size before any bytes leave the browser. */
export function validateTravelDocumentFile(file: File): FileValidation {
  if (file.size === 0) {
    return { ok: false, error: "That file is empty." };
  }
  if (file.size > UPLOAD_LIMITS.maxBytes) {
    const mb = Math.round(UPLOAD_LIMITS.maxBytes / (1024 * 1024));
    return {
      ok: false,
      error: `That file is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). The limit is ${mb} MB.`,
    };
  }
  const name = file.name.toLowerCase();
  const hasAllowedExtension = UPLOAD_LIMITS.allowedExtensions.some((ext) =>
    name.endsWith(ext)
  );
  const hasAllowedType = (UPLOAD_LIMITS.allowedTypes as readonly string[]).includes(
    file.type
  );
  if (!hasAllowedExtension && !hasAllowedType) {
    return {
      ok: false,
      error: "Allowed file types: PDF, JPEG, PNG and WebP images.",
    };
  }
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* Errors                                                                      */
/* -------------------------------------------------------------------------- */

const STORAGE_ERROR_MESSAGES: Record<string, string> = {
  "storage/unauthorized": "You don't have permission to access that file.",
  "storage/canceled": "The upload was cancelled.",
  "storage/unknown": "Upload failed unexpectedly. Please try again.",
  "storage/object-not-found": "That file no longer exists.",
  "storage/bucket-not-found": "Storage bucket is not configured for this project.",
  "storage/project-not-found": "This Firebase project has no Storage bucket.",
  "storage/quota-exceeded": "Storage quota exceeded for this project.",
  "storage/unauthenticated": "Your session expired. Sign in and try again.",
  "storage/retry-limit-exceeded":
    "The upload timed out. Check your connection and retry.",
  "storage/invalid-checksum": "The upload was corrupted. Please retry.",
  "storage/cannot-slice-blob": "Upload failed on this browser. Please retry.",
  "storage/server-file-wrong-size": "Upload finished incorrectly. Please retry.",
  "storage/invalid-event-name": "Upload error. Please try again.",
};

/** Converts a Storage error into a UI-safe message. */
export function mapStorageError(error: unknown): Error {
  if (error instanceof Error && error.name === "StorageError") {
    const code = (error as StorageError).code ?? "unknown";
    const mapped = new Error(
      STORAGE_ERROR_MESSAGES[code] ?? "Something went wrong with that file."
    );
    mapped.name = "StorageError";
    mapped.cause = error;
    return mapped;
  }
  if (error instanceof Error) {
    const mapped = new Error(
      error.message.includes("not configured")
        ? error.message
        : "Something went wrong with that file."
    );
    mapped.cause = error;
    return mapped;
  }
  return new Error("Something went wrong with that file.");
}

/* -------------------------------------------------------------------------- */
/* Paths                                                                       */
/* -------------------------------------------------------------------------- */

/** Builds the canonical user-scoped object path for a document upload. */
export function documentObjectPath(
  uid: string,
  documentId: string,
  fileName: string
): string {
  // Strip anything that could escape the folder or inject path segments.
  const safeName = fileName.replace(/[/\\]+/g, "_").replace(/^\.+/, "_");
  return `users/${uid}/documents/${documentId}/${safeName}`;
}

function storageRefFor(path: string): StorageReference {
  return ref(requireStorage(), path);
}

/* -------------------------------------------------------------------------- */
/* Operations                                                                  */
/* -------------------------------------------------------------------------- */

/** Summary returned after a successful upload — metadata only, no URL. */
export type UploadedDocument = {
  path: string;
  fileName: string;
  contentType: string;
  size: number;
  /** ISO timestamp of the upload. */
  uploadedAt: string;
};

export type UploadOptions = {
  uid: string;
  documentId: string;
  /** 0–1 progress callback for the UI progress bar. */
  onProgress?: (fraction: number) => void;
};

/**
 * Uploads one travel document to the user's scoped folder.
 *
 * Validates type/size first, then uses a resumable task so progress is real
 * (not simulated). Rejects with a UI-safe message on failure.
 */
export async function uploadTravelDocument(
  file: File,
  { uid, documentId, onProgress }: UploadOptions
): Promise<UploadedDocument> {
  const validation = validateTravelDocumentFile(file);
  if (!validation.ok) throw new Error(validation.error);

  const path = documentObjectPath(uid, documentId, file.name);
  const storageRef = storageRefFor(path);

  try {
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type || "application/octet-stream",
      customMetadata: { documentId },
    });

    const snapshot: UploadTaskSnapshot = await new Promise(
      (resolve, reject) => {
        task.on(
          "state_changed",
          (snap) => {
            if (snap.totalBytes > 0 && onProgress) {
              onProgress(snap.bytesTransferred / snap.totalBytes);
            }
          },
          (error) => reject(mapStorageError(error)),
          () => resolve(task.snapshot)
        );
      }
    );

    onProgress?.(1);
    return {
      path,
      fileName: file.name,
      contentType: snapshot.metadata.contentType ?? file.type,
      size: snapshot.metadata.size ?? file.size,
      uploadedAt:
        snapshot.metadata.timeCreated ?? new Date().toISOString(),
    };
  } catch (error) {
    throw mapStorageError(error);
  }
}

/** Storage object metadata as stored by Firebase. */
export type ObjectMetadata = {
  path: string;
  name: string;
  contentType: string;
  size: number;
  timeCreated: string;
  updated: string;
  md5Hash?: string;
};

/** Reads metadata for one object. Throws when it doesn't exist. */
export async function getDocumentMetadata(path: string): Promise<ObjectMetadata> {
  try {
    const meta = await getMetadata(storageRefFor(path));
    return {
      path,
      name: meta.name ?? path.split("/").pop() ?? path,
      contentType: meta.contentType ?? "application/octet-stream",
      size: meta.size ?? 0,
      timeCreated: meta.timeCreated ?? "",
      updated: meta.updated ?? "",
      md5Hash: meta.md5Hash,
    };
  } catch (error) {
    throw mapStorageError(error);
  }
}

/** Lists every object under a document folder (or the user's root). */
export async function listDocumentObjects(
  uid: string,
  documentId?: string
): Promise<ObjectMetadata[]> {
  const folderPath = documentId
    ? `users/${uid}/documents/${documentId}`
    : `users/${uid}/documents`;
  try {
    const result = await listAll(storageRefFor(folderPath));
    const metas = await Promise.all(
      result.items.map((item) => getMetadata(item))
    );
    return metas.map((meta) => ({
      path: `${folderPath}/${meta.name ?? ""}`,
      name: meta.name ?? "",
      contentType: meta.contentType ?? "application/octet-stream",
      size: meta.size ?? 0,
      timeCreated: meta.timeCreated ?? "",
      updated: meta.updated ?? "",
      md5Hash: meta.md5Hash,
    }));
  } catch (error) {
    throw mapStorageError(error);
  }
}

/**
 * Reads an object's bytes directly — the safe way to display a document
 * offline or inline without exposing a shareable URL.
 *
 * Returns an `ArrayBuffer`; wrap with `new Uint8Array(buffer)` when a view is
 * needed (e.g. `new Blob([buffer])` for an object URL).
 */
export async function readDocumentBytes(path: string): Promise<ArrayBuffer> {
  try {
    return await getBytes(storageRefFor(path));
  } catch (error) {
    throw mapStorageError(error);
  }
}

/**
 * Signed download URL for an object.
 *
 * The URL contains an access token: anyone holding it can read the file
 * until it expires. Only use when a real URL is required (e.g. opening a PDF
 * in a new tab); prefer `readDocumentBytes()` everywhere else.
 */
export async function getDocumentDownloadUrl(path: string): Promise<string> {
  try {
    return await getDownloadURL(storageRefFor(path));
  } catch (error) {
    throw mapStorageError(error);
  }
}

/** Permanently deletes one object. Owner-only via `storage.rules`. */
export async function deleteDocumentObject(path: string): Promise<void> {
  try {
    await deleteObject(storageRefFor(path));
  } catch (error) {
    throw mapStorageError(error);
  }
}
