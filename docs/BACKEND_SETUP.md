# TrailMind — Backend Setup (Firebase)

> Step-by-step guide to standing up the TrailMind backend: Firebase Auth,
> Cloud Firestore, Storage, App Check, Firebase AI Logic, the Admin SDK and
> the local Emulator Suite. Companion docs: `FIRESTORE_SCHEMA.md` (data),
> `OFFLINE_SYNC.md` (local layer), `AI_ARCHITECTURE.md` (AI),
> `BACKEND_IMPLEMENTATION_STATUS.md` (what is built).
>
> **Nothing in this repo deploys itself.** Rules, indexes and config are only
> applied when *you* run a `firebase deploy` command, and this project has no
> CI/CD hook. Review `firestore.rules` / `storage.rules` before deploying.

---

## 1. Prerequisites

| Requirement | Notes |
|---|---|
| Node.js 20+ | `node -v` |
| A Google account | for the Firebase console |
| Firebase CLI (only for rules/emulators) | `npm i -g firebase-tools` — or `npx firebase-tools` |
| Java 11+ (only for the Emulator Suite) | `/usr/bin/java -version`; macOS: `brew install --cask temurin` |
| Firebase AI Logic availability | the AI features need a project/region where Gemini via Firebase AI Logic is supported |

## 2. Create the Firebase project

1. <https://console.firebase.google.com> → **Add project** (analytics optional).
2. Note the project id (`your-project-id`) — it appears in every config value.

## 3. Enable Authentication

**Authentication → Sign-in method:**

- **Email/Password** → enable (used by the login/signup forms).
- **Google** → enable (the Google button; it fails honestly until you do).
- **Passkey** → not configured in this app; the login button says so instead
  of pretending.

No other providers are wired.

## 4. Register a web app & configure `.env.local`

1. **Project settings → Your apps → Web (`</>`)** → register an app (no
   hosting needed here).
2. Copy the `firebaseConfig` values into `.env.local` (created from
   `.env.example`):

```bash
cp .env.example .env.local
```

| `.env.local` key | Comes from |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `firebaseConfig.apiKey` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `firebaseConfig.authDomain` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `firebaseConfig.projectId` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `firebaseConfig.storageBucket` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `firebaseConfig.messagingSenderId` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `firebaseConfig.appId` |

These values are **designed to be public** (they identify the project, not
authorize anyone) — real security comes from Security Rules, Auth and App
Check. `.env.local` is gitignored; never commit it, and never put server
credentials in `NEXT_PUBLIC_*` keys.

Leave `NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY` empty while developing
(App Check simply stays off). Leave the Admin keys empty unless you use the
dev-seed Route Handler (§9).

**Not configured?** The app still runs: every screen shows an honest
"Backend not configured" state instead of fake data. No credentials are
bundled anywhere in the repo.

## 5. Cloud Firestore

1. **Firestore Database → Create database** → start in **production mode**
   (deny-by-default) in the region closest to your users.
2. Deploy the rules and the one composite index (review them first):

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

- `firestore.rules` — owner-only access on every `users/{uid}/**` path plus
  field/enum/size validation mirroring the Zod schemas. **This is the real
  security boundary**; the `AuthGuard`, uid parameters and Zod validation in
  the app are UX/developer ergonomics only.
- `firestore.indexes.json` — one composite index:
  `trips: status ASC, startDate DESC` (used by `listTrips({ status })`).
  Everything else is deliberately single-field or client-sorted
  (see `FIRESTORE_SCHEMA.md` §4).

> **Deploying rules replaces the live rules for the whole project.** Read
> them, and test them locally with the emulators first (§10). Never deploy
> rules you haven't reviewed.

## 6. Firebase Storage

1. **Storage → Get started** → start in production mode (same bucket
   region as Firestore if offered).
2. Deploy the rules:

```bash
firebase deploy --only storage:rules
```

`storage.rules` limits every object to
`users/{uid}/documents/{documentId}/{fileName}`, owner-only, ≤ 10 MB,
PDF/JPEG/PNG/WebP — the same limits the client enforces before uploading.
Nothing else in the bucket is reachable.

## 7. App Check (recommended before real users)

1. **App Check → register your web app** with **reCAPTCHA v3** (this SDK
   version exposes only the reCAPTCHA v3 / Enterprise providers for web).
2. Put the site key in `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY=0x...recaptcha-key...
```

3. Enforce App Check on **Firestore** and **Storage** in the console
   (enforcement mode first, monitor, then enforce).

Behaviour in code: App Check is initialised once after sign-in only when the
key is present (`src/lib/firebase/app-check.ts`); without it the app works
normally (development). App Check adds abuse protection **on top of** Security
Rules — it never replaces them. Firebase AI Logic has no emulator and is not
App Check-gated in this project.

## 8. Firebase AI Logic

1. Enable **Firebase AI Logic** in the console for your project/region.
2. Set the model (optional — defaults to `gemini-2.5-flash`):

```env
NEXT_PUBLIC_FIREBASE_AI_MODEL=gemini-2.5-flash
```

No service account or extra key is needed for client-side inference; the
signed-in user's auth token authorizes the call. On-device (GemNano/Gemma via
the browser `LanguageModel` API) needs no configuration at all and works
offline — see `AI_ARCHITECTURE.md` for the routing rules, the honest
`inferenceSource` reporting and the error taxonomy.

## 9. Admin SDK (server-only, optional)

Only two Route Handlers need server credentials: `POST /api/dev/seed`
(dev-only sample data) and future Bearer-token-verified endpoints. The
client app itself never uses these.

1. **Project settings → Service accounts → Generate new private key** (JSON).
2. Fill the three server-only vars in `.env.local`:

```env
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=...@....iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

The literal `\n` sequences in the key are normalised on load
(`src/lib/firebase/admin.ts`). These keys must never be `NEXT_PUBLIC_*`,
never committed, and never sent to the browser. The Admin SDK bypasses
Security Rules — treat the key like a password.

`/api/dev/seed` returns **404 in production** (`NODE_ENV === "production"`),
requires `Authorization: Bearer <ID token>` of the signed-in developer, and
only ever writes into that same user's `users/{uid}` tree.

## 10. Emulator Suite (local development & tests)

Ports are pinned in `firebase.json`: **Auth 9099, Firestore 8080, Storage
9199, Emulator UI 4000**.

```bash
# one-off install if you don't have firebase-tools globally
npm i -g firebase-tools

# start everything — no real project needed with the demo- prefix
firebase emulators:start --project demo-trailmind
```

Then point the app at the emulators in `.env.local`:

```env
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
NEXT_PUBLIC_FIREBASE_EMULATOR_HOST=127.0.0.1
# Web config can be placeholders, but every value must be non-empty:
NEXT_PUBLIC_FIREBASE_API_KEY=demo-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-trailmind.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-trailmind
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=demo-trailmind.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=demo-app-id
```

- With `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true` the client SDKs
  (Auth/Firestore/Storage) and the Admin SDK connect to the local emulators
  instead of production. **Never set this in a production build.**
- Firebase AI Logic has **no emulator** — AI calls while emulators are on go
  to the real service (or fail honestly with `not-configured` if the web
  config is placeholder-only).
- Rules are loaded by the emulators from `firebase.json`, so emulator runs
  enforce exactly the rules you will deploy. The Phase 11 test suite runs
  against these emulators.

## 11. Run the app

```bash
npm install
npm run dev        # http://localhost:3000
```

Checklist for a first run:

1. Sign up with email/password → `users/{uid}` profile appears.
2. Create a trip → shows under `/trips`.
3. Kill the network (DevTools → Offline) → the trip still reads from the
   local mirror, an edit queues, and it flushes when you reconnect
   (honest pending state, no fake "synced").
4. Assistant: on-device replies work offline; cloud-only features fail
   honestly offline.

## 12. Deploy the web app

No hosting is configured in this repo. When you're ready:

```bash
# rules + indexes (review first!)
firebase deploy --only firestore:rules,firestore:indexes,storage:rules

# the Next.js app, to your host of choice (Vercel, Cloud Run, …)
npx next build
```

Pre-deploy checklist:

- [ ] `.env.local` values present in the host's environment (all `NEXT_PUBLIC_*`)
- [ ] `.env.local` / service-account JSON **not** committed (`.env.local` is gitignored)
- [ ] Rules reviewed and deployed (§5, §6)
- [ ] App Check enforced in production (§7)
- [ ] `NEXT_PUBLIC_USE_FIREBASE_EMULATORS` **absent or `false`**
- [ ] `firebase emulators` never reachable from production
- [ ] Email/Password (+ Google, if used) enabled in Auth

## 13. Troubleshooting & security notes

| Symptom | Cause / fix |
|---|---|
| "Backend not configured" screen | `.env.local` missing/incomplete — check `missingFirebaseEnvVars` names shown on the login screen |
| `permission-denied` right after setup | Rules not deployed yet (§5) — the client guard is UX only; the rules are the gate |
| Google button fails | Google provider not enabled (§3) |
| Upload rejected at 99% | Storage rules reject type/size — check `storage.rules` vs. the file (§6) |
| Emulators won't start | Java missing (§1), or port 9099/8080/9199/4000 in use |
| AI says "not-configured" | Firebase AI Logic not enabled (§8) or model id invalid |
| Index errors on `listTrips({status})` | Deploy `firestore.indexes.json` (§5) |

**Security model (summary):**

- **Authorization:** Firestore + Storage Security Rules (owner-only,
  validated fields) — the only real boundary.
- **Authentication:** Firebase Auth ID tokens; Route Handlers verify Bearer
  tokens with the Admin SDK.
- **Abuse protection:** App Check (optional but recommended).
- **Secrets:** no credentials in the repo or the browser bundle; server keys
  only in `.env.local` (gitignored) — the web config values are public by
  design.
- **Client guards** (`AuthGuard`, uid parameters, Zod) exist for good errors
  and developer ergonomics — never rely on them for security.
