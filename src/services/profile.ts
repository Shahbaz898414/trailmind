import type { User } from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { z } from "zod";

import { requireDb, timestampToIso } from "@/lib/firebase/firestore";

/**
 * User profile service — `users/{uid}` document.
 *
 * ---------------------------------------------------------------------------
 * OWNERSHIP: every function takes an explicit `uid` and only ever touches
 * `users/{uid}`. Firestore Security Rules enforce that this path can only be
 * written by its own owner — this module is convenience, not security.
 * ---------------------------------------------------------------------------
 *
 * `ensureUserProfile()` is called by `AuthProvider` after every successful
 * sign-in/sign-up. It is deliberately **idempotent** and **repairing**:
 *   - creates the profile document for new accounts
 *   - fills missing fields (e.g. displayName set in Auth later) on existing
 *     accounts, so profiles from before this service existed get healed
 *   - never overwrites data the user already has
 *
 * Errors are allowed to propagate — `AuthProvider` catches them so a failed
 * profile write (offline, rules not deployed yet) never blocks sign-in.
 */

/** BCP-47-ish language tag: "en", "fr", "pt-BR". */
const languageTagSchema = z
  .string()
  .trim()
  .regex(/^[a-z]{2,3}(-[A-Za-z]{2,8})*$/, "Invalid language tag");

/** Free-form travel style, bounded — the UI offers a fixed set of chips. */
const travelStyleSchema = z.string().trim().min(1).max(40);

/** Inputs accepted by `ensureUserProfile` (signup form extras). */
const profileOverridesSchema = z.object({
  travelStyle: travelStyleSchema.optional(),
  preferredLanguage: languageTagSchema.optional(),
});
type ProfileOverrides = z.input<typeof profileOverridesSchema>;

/** The profile document as the app consumes it (timestamps as ISO strings). */
export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  /** UI language, e.g. "en". */
  preferredLanguage: string;
  /** Preferred travel style chosen at signup, if given. */
  travelStyle: string | null;
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * Validates a profile document read from Firestore.
 *
 * Returns `null` when the document is missing or does not match the schema —
 * callers treat that as "no usable profile" instead of crashing on bad data.
 */
export const userProfileSchema = z.object({
  uid: z.string().min(1),
  email: z.string().nullable().default(null),
  displayName: z.string().nullable().default(null),
  photoURL: z.string().nullable().default(null),
  preferredLanguage: languageTagSchema.default("en"),
  travelStyle: travelStyleSchema.nullable().default(null),
  onboardingComplete: z.boolean().default(false),
});

/** Maps a raw Firestore document into `UserProfile`, or `null` if invalid. */
function toUserProfile(
  uid: string,
  data: Record<string, unknown> | undefined
): UserProfile | null {
  if (!data) return null;
  const parsed = userProfileSchema.safeParse({ uid, ...data });
  if (!parsed.success) return null;
  return {
    ...parsed.data,
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
  };
}

/**
 * Creates (or repairs) the profile document for `user`.
 *
 * @returns `{ created: true }` when a new document was written, or
 *          `{ created: false }` when it already existed (and was patched
 *          only if fields were missing).
 *
 * @throws FirebaseNotConfiguredError — Firebase web config missing.
 * @throws FirestoreError (mapped) — permission/network failures.
 */
export async function ensureUserProfile(
  user: Pick<User, "uid" | "email" | "displayName" | "photoURL">,
  overrides: ProfileOverrides = {}
): Promise<{ created: boolean }> {
  const db = requireDb();
  const ref = doc(db, "users", user.uid);

  const existing = await getDoc(ref);

  if (existing.exists()) {
    // Repair pass: only fill gaps, never overwrite what the user has.
    const current = existing.data();
    const patch: Record<string, unknown> = {};
    if (!current.displayName && user.displayName) {
      patch.displayName = user.displayName;
    }
    if (!current.email && user.email) patch.email = user.email;
    if (!current.photoURL && user.photoURL) patch.photoURL = user.photoURL;

    if (Object.keys(patch).length > 0) {
      patch.updatedAt = serverTimestamp();
      await updateDoc(ref, patch);
    }
    return { created: false };
  }

  const overridesParsed = profileOverridesSchema.parse(overrides);

  const profile: Record<string, unknown> = {
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    photoURL: user.photoURL ?? null,
    preferredLanguage: overridesParsed.preferredLanguage ?? "en",
    onboardingComplete: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  // Only include travelStyle when explicitly provided: signup and AuthProvider
  // may both create this document at the same instant, and `merge: true`
  // means a concurrent write without this key can never erase it.
  if (overridesParsed.travelStyle !== undefined) {
    profile.travelStyle = overridesParsed.travelStyle;
  }

  await setDoc(ref, profile, { merge: true });

  return { created: true };
}

/**
 * Reads the profile for `uid`.
 *
 * @returns the profile, or `null` when it does not exist / is malformed.
 */
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const db = requireDb();
  const snapshot = await getDoc(doc(db, "users", uid));
  if (!snapshot.exists()) return null;
  return toUserProfile(snapshot.id, snapshot.data());
}

/** Patch accepted by `updateUserProfile` — all fields optional, all bounded. */
const profilePatchSchema = z
  .object({
    displayName: z.string().trim().min(1).max(100),
    photoURL: z.string().trim().max(500).nullable(),
    preferredLanguage: languageTagSchema,
    travelStyle: travelStyleSchema.nullable(),
    onboardingComplete: z.boolean(),
  })
  .partial();
export type ProfilePatch = z.input<typeof profilePatchSchema>;

/**
 * Updates fields on the user's profile document.
 *
 * @throws when the patch is empty or invalid (Zod) — callers surface
 *         `error.message`, which is safe to render.
 */
export async function updateUserProfile(
  uid: string,
  patch: ProfilePatch
): Promise<void> {
  const parsed = profilePatchSchema.parse(patch);
  const keys = Object.keys(parsed);
  if (keys.length === 0) {
    throw new Error("Nothing to update.");
  }
  const db = requireDb();
  await updateDoc(doc(db, "users", uid), {
    ...parsed,
    updatedAt: serverTimestamp(),
  });
}
