import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { z } from "zod";

import {
  mapFirestoreError,
  requireDb,
  timestampToIso,
} from "@/lib/firebase/firestore";
import { parseOrThrow } from "@/lib/validation";

/**
 * Language Assistant / phrasebook service — Firestore
 * `users/{uid}/savedPhrases/{phraseId}`.
 *
 * Shape matches the phrasebook UI (`PhraseItem`). Honest scope:
 * - Phrase storage, categories, search and offline-flag bookkeeping only.
 * - There is NO translation function here — translation would require a real
 *   model capability (Firebase AI Logic); nothing is faked or hardcoded.
 * - The user's language preference lives on the profile
 *   (`preferredLanguage` via `src/services/profile.ts`).
 * - Local phrasebook persistence for offline use is handled by the Dexie
 *   offline layer (`src/lib/offline/`) — this service never claims offline
 *   access by itself.
 */

const phraseCategorySchema = z.enum([
  "Transport & Taxi",
  "Emergency & Medical",
  "Dining & Dietary",
  "Lodging & Ryokan",
  "Direction & Trail",
]);

export const savedPhraseSchema = z.object({
  category: phraseCategorySchema,
  english: z.string().trim().min(1).max(1000),
  japaneseKanji: z.string().max(1000).default(""),
  japaneseFurigana: z.string().max(1000).default(""),
  romaji: z.string().max(1000).default(""),
  contextNote: z.string().max(1000).default(""),
  audioKey: z.string().max(200).default(""),
  isSavedForOfflineFlashcard: z.boolean().default(false),
  /** BCP-47-ish tag of the phrase's target language (UI is Japanese-first). */
  language: z.string().max(20).default("ja"),
});
export type SavedPhraseInput = z.input<typeof savedPhraseSchema>;

export type SavedPhraseRecord = z.output<typeof savedPhraseSchema> & {
  id: string;
  createdAt: string;
};

const recordSchema = savedPhraseSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().default(""),
});

function phrasesRef(uid: string) {
  return collection(requireDb(), "users", uid, "savedPhrases");
}

function phraseRef(uid: string, id: string) {
  return doc(requireDb(), "users", uid, "savedPhrases", id);
}

function mapDoc(raw: { id: string } & Record<string, unknown>): SavedPhraseRecord | null {
  const parsed = recordSchema.safeParse({
    ...raw,
    createdAt: timestampToIso(raw.createdAt),
  });
  if (!parsed.success) {
    console.warn(`[TrailMind] phrase ${raw.id} failed validation:`, parsed.error.issues[0]);
    return null;
  }
  return parsed.data;
}

/** Saves a phrase to the user's phrasebook. */
export async function addSavedPhrase(
  uid: string,
  input: SavedPhraseInput
): Promise<SavedPhraseRecord> {
  try {
    const data = parseOrThrow(savedPhraseSchema, input);
    const ref = doc(phrasesRef(uid));
    await setDoc(ref, { ...data, createdAt: serverTimestamp() });
    return { id: ref.id, ...data, createdAt: new Date().toISOString() };
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/**
 * Lists saved phrases (bounded read of up to 200; phrasebooks are small).
 * Optional category/language filters are applied client-side — Firestore has
 * no full-text search (documented in FIRESTORE_SCHEMA.md).
 */
export async function listSavedPhrases(
  uid: string,
  options: {
    category?: z.output<typeof phraseCategorySchema>;
    language?: string;
  } = {}
): Promise<SavedPhraseRecord[]> {
  try {
    const snapshot = await getDocs(query(phrasesRef(uid), limit(200)));
    let items = snapshot.docs
      .map((d) => mapDoc({ id: d.id, ...d.data() }))
      .filter((p): p is SavedPhraseRecord => p !== null);
    if (options.category) items = items.filter((p) => p.category === options.category);
    if (options.language) items = items.filter((p) => p.language === options.language);
    return items;
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/**
 * Case-insensitive substring search across English text, Japanese script and
 * romaji over the user's phrases (bounded client-side filter — honest
 * limitation of Firestore full-text search).
 */
export async function searchPhrases(uid: string, term: string): Promise<SavedPhraseRecord[]> {
  const needle = term.trim().toLowerCase();
  if (!needle) return [];
  const all = await listSavedPhrases(uid);
  return all.filter(
    (p) =>
      p.english.toLowerCase().includes(needle) ||
      p.japaneseKanji.includes(needle) ||
      p.japaneseFurigana.toLowerCase().includes(needle) ||
      p.romaji.toLowerCase().includes(needle)
  );
}

/** One phrase, or `null`. */
export async function getSavedPhrase(uid: string, phraseId: string): Promise<SavedPhraseRecord | null> {
  try {
    const snapshot = await getDoc(phraseRef(uid, phraseId));
    if (!snapshot.exists()) return null;
    return mapDoc({ id: snapshot.id, ...snapshot.data() });
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** Removes a phrase from the phrasebook. Idempotent. */
export async function removeSavedPhrase(uid: string, phraseId: string): Promise<void> {
  try {
    await deleteDoc(phraseRef(uid, phraseId));
  } catch (error) {
    throw mapFirestoreError(error);
  }
}

/** Distinct categories present in the user's phrasebook (for filter chips). */
export async function listPhraseCategories(
  uid: string
): Promise<z.output<typeof phraseCategorySchema>[]> {
  const phrases = await listSavedPhrases(uid);
  return [...new Set(phrases.map((p) => p.category))];
}

export { phraseCategorySchema };
