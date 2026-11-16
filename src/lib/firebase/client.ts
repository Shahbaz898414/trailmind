import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  connectFirestoreEmulator,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";
import { getStorage, connectStorageEmulator, type FirebaseStorage } from "firebase/storage";

import {
  emulatorPorts,
  firebaseEmulatorHost,
  firebaseConfig,
  isFirebaseConfigured,
  useFirebaseEmulators,
} from "./config";

/**
 * Firebase client entry point.
 *
 * ---------------------------------------------------------------------------
 * IMPORTANT
 * ---------------------------------------------------------------------------
 * Every getter here returns `null` instead of throwing when Firebase has not
 * been configured yet, so the app runs normally before credentials exist.
 * Nothing in this file is initialised automatically at import time — services
 * come up lazily, the first time something actually asks for them.
 *
 * Which services are ready:
 *   ✓ Firebase App          (client.ts)
 *   ✓ Cloud Firestore       (client.ts — with offline persistence enabled)
 *   ✓ Firebase Auth         (client.ts)
 *   ✓ Firebase Storage      (client.ts)
 *   ✓ Firebase AI Logic     (see `src/lib/ai/hybrid-model.ts`)
 *   ✓ Firebase App Check    (see `src/lib/firebase/app-check.ts` — opt-in)
 *
 * App data lives in Dexie (`src/lib/offline/db.ts`) first and syncs to
 * Firestore later; the service worker (`public/sw.js`) caches app *assets*
 * only. Those two stores are deliberately kept separate.
 *
 * When `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true`, every getter wires the
 * service to the local Emulator Suite exactly once (see `emulatorConnections`).
 */

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

/** Services already pointed at the emulator — `connect*Emulator` throws on
 *  a second call, so each service is recorded here after the first connect. */
const emulatorConnections = new Set<"auth" | "firestore" | "storage">();

/** Returns the default Firebase app, or `null` when configuration is missing. */
export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured || !firebaseConfig) return null;
  if (app) return app;

  // Reuse an app already created elsewhere (tests, hot reload) instead of
  // calling initializeApp() twice, which throws.
  const existing = getApps();
  app = existing.length > 0 ? existing[0] : initializeApp(firebaseConfig);
  return app;
}

/** Firebase Auth instance, or `null` when Firebase is not configured. */
export function getFirebaseAuth(): Auth | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!auth) {
    auth = getAuth(firebaseApp);
    if (useFirebaseEmulators && !emulatorConnections.has("auth")) {
      emulatorConnections.add("auth");
      connectAuthEmulator(auth, `http://${firebaseEmulatorHost}:${emulatorPorts.auth}`, {
        disableWarnings: true,
      });
    }
  }
  return auth;
}

/**
 * Cloud Firestore instance with offline persistence enabled.
 *
 * `persistentLocalCache` + `persistentMultipleTabManager` let Firestore keep a
 * local copy in IndexedDB so reads keep working without a connection — the
 * foundation for Firestore-backed offline support.
 *
 * Returns `null` when Firebase is not configured.
 */
export function getFirebaseDb(): Firestore | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;

  if (!db) {
    try {
      initializeFirestore(firebaseApp, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } catch {
      // Already initialised for this app — fall through to getFirestore().
    }
    db = getFirestore(firebaseApp);
    if (useFirebaseEmulators && !emulatorConnections.has("firestore")) {
      emulatorConnections.add("firestore");
      connectFirestoreEmulator(db, firebaseEmulatorHost, emulatorPorts.firestore);
    }
  }
  return db;
}

/**
 * Firebase Storage instance for travel-document uploads.
 *
 * Returns `null` when Firebase is not configured. Access to objects is
 * governed by `storage.rules` — never build a URL you have not verified the
 * caller is allowed to read.
 */
export function getFirebaseStorage(): FirebaseStorage | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!storage) {
    storage = getStorage(firebaseApp);
    if (useFirebaseEmulators && !emulatorConnections.has("storage")) {
      emulatorConnections.add("storage");
      connectStorageEmulator(storage, firebaseEmulatorHost, emulatorPorts.storage);
    }
  }
  return storage;
}

/** True when the Firebase web config is complete enough to initialise. */
export { isFirebaseConfigured };
