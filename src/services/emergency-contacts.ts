import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { z } from "zod";

import {
  mapFirestoreError,
  requireDb,
  timestampToIso,
} from "@/lib/firebase/firestore";
import { parseOrThrow, providedFields } from "@/lib/validation";

/**
 * Emergency Contacts service — Firestore `users/{uid}/emergencyContacts/{id}`.
 *
 * Shape matches the profile UI (`EmergencyContactItem`). Exactly one contact
 * can be the primary ICE (In Case of Emergency) — `setPrimaryContact` clears
 * the others in the same batch, so the invariant never breaks mid-write.
 */

export const emergencyContactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  relationship: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(1).max(50),
  satelliteAddress: z.string().max(200).nullish(),
  priority: z.number().int().min(1).max(99).default(1),
  isPrimaryIce: z.boolean().default(false),
});
export type EmergencyContactInput = z.input<typeof emergencyContactSchema>;

export type EmergencyContactRecord = z.output<typeof emergencyContactSchema> & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

const recordSchema = emergencyContactSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().default(""),
  updatedAt: z.string().default(""),
});

function contactsRef(uid: string) {
  return collection(requireDb(), "users", uid, "emergencyContacts");
}

function contactRef(uid: string, id: string) {
  return doc(requireDb(), "users", uid, "emergencyContacts", id);
}

function mapDoc(raw: { id: string } & Record<string, unknown>): EmergencyContactRecord | null {
  const parsed = recordSchema.safeParse({
    ...raw,
    createdAt: timestampToIso(raw.createdAt),
    updatedAt: timestampToIso(raw.updatedAt),
  });
  if (!parsed.success) {
    console.warn(`[TrailMind] contact ${raw.id} failed validation:`, parsed.error.issues[0]);
    return null;
  }
  return parsed.data;
}

/** Adds a contact. When `isPrimaryIce` is set, it becomes the sole primary. */
export async function addEmergencyContact(
  uid: string,
  input: EmergencyContactInput
): Promise<EmergencyContactRecord> {
  try {
    const data = parseOrThrow(emergencyContactSchema, input);
    const ref = doc(contactsRef(uid));

    if (data.isPrimaryIce) await clearOtherPrimaries(uid, ref.id);

    await setDoc(ref, {
      ...data,
      satelliteAddress: data.satelliteAddress ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return {
      id: ref.id,
      ...data,
      satelliteAddress: data.satelliteAddress ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** Contacts ordered by priority (then name). */
export async function listEmergencyContacts(uid: string): Promise<EmergencyContactRecord[]> {
  try {
    const snapshot = await getDocs(query(contactsRef(uid), orderBy("priority")));
    return snapshot.docs
      .map((d) => mapDoc({ id: d.id, ...d.data() }))
      .filter((c): c is EmergencyContactRecord => c !== null);
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** One contact, or `null`. */
export async function getEmergencyContact(
  uid: string,
  contactId: string
): Promise<EmergencyContactRecord | null> {
  try {
    const snapshot = await getDoc(contactRef(uid, contactId));
    if (!snapshot.exists()) return null;
    return mapDoc({ id: snapshot.id, ...snapshot.data() });
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** Applies a validated partial update (maintains the single-primary rule). */
export async function updateEmergencyContact(
  uid: string,
  contactId: string,
  patch: Partial<EmergencyContactInput>
): Promise<void> {
  try {
    const parsed = parseOrThrow(emergencyContactSchema.partial(), patch);
    // Zod fills defaults for absent keys (priority, isPrimaryIce) — keep only
    // what the caller sent so an update can never demote the primary contact.
    const fields: Record<string, unknown> = {
      ...providedFields(patch, parsed),
    };
    if (Object.keys(fields).length === 0) throw new Error("Nothing to update.");
    if (fields.isPrimaryIce === true) await clearOtherPrimaries(uid, contactId);

    await updateDoc(contactRef(uid, contactId), {
      ...fields,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/**
 * Makes `contactId` the single primary ICE contact: clears every other
 * primary and sets this one — all in one atomic batch.
 */
export async function setPrimaryContact(uid: string, contactId: string): Promise<void> {
  try {
    const db = requireDb();
    const snapshot = await getDocs(contactsRef(uid));
    const batch = writeBatch(db);
    let found = false;

    snapshot.docs.forEach((d) => {
      const shouldBePrimary = d.id === contactId;
      if (shouldBePrimary) found = true;
      const isPrimary = d.data().isPrimaryIce === true;
      if (isPrimary !== shouldBePrimary) {
        batch.update(d.ref, {
          isPrimaryIce: shouldBePrimary,
          updatedAt: serverTimestamp(),
        });
      }
    });

    if (!found) throw new Error("That contact no longer exists.");
    await batch.commit();
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** Deletes one contact. Idempotent. */
export async function deleteEmergencyContact(uid: string, contactId: string): Promise<void> {
  try {
    await deleteDoc(contactRef(uid, contactId));
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** Batch-clears other primaries (used when adding/patching a primary). */
async function clearOtherPrimaries(uid: string, exceptId: string): Promise<void> {
  const db = requireDb();
  const snapshot = await getDocs(contactsRef(uid));
  const primaries = snapshot.docs.filter(
    (d) => d.id !== exceptId && d.data().isPrimaryIce === true
  );
  if (primaries.length === 0) return;

  const batch = writeBatch(db);
  primaries.forEach((d) =>
    batch.update(d.ref, { isPrimaryIce: false, updatedAt: serverTimestamp() })
  );
  await batch.commit();
}
