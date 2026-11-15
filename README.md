# TrailMind

**Your AI travel companion, even without internet.**

TrailMind is an offline-first AI travel companion being built for the
**Firebase Hybrid AI Hackathon 2026**. Trips, saved places, budgets and
phrasebooks live on-device first (IndexedDB via Dexie) and sync to Cloud
Firestore later; the assistant routes requests through Firebase AI Logic —
on-device when Chrome's model is available, in the cloud when you are online.

---

## ⚠️ Current status

This repository contains the **initial project foundation**: app shell, design
system, Firebase integration structure, PWA manifest and service-worker
scaffold.

| Area | Status |
| --- | --- |
| App shell, sidebar, header, dashboard preview | ✅ Built |
| Design system (Tailwind + shadcn/ui) | ✅ Built |
| Firebase config + client structure | ✅ Scaffolded, **no credentials yet** |
| Firebase AI Logic (`hybrid-model.ts`) | ⚠️ Written against the official SDK, **not yet tested** |
| Dexie offline database | ✅ Schema ready, not yet used by UI |
| Service worker (`public/sw.js`) | ⚠️ Scaffold, **opt-in and unverified** |
| Firebase Auth / Firestore sync / App Check | ⛔ Not wired up — needs your Firebase project |
| Fully offline mode | ⛔ **Not claimed** — must be verified in Chrome first |

Nothing in this project is mocked or simulated. Where functionality is
missing, the UI says so instead of pretending.

---

## Getting started

```bash
npm install        # already installed if you just cloned this
npm run dev        # development server → http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint
```

---

## Environment variables

Copy the example file and fill in your own values. **No real secrets are
committed anywhere.**

```bash
cp .env.example .env.local
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | For Firebase | Web app API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | For Firebase | Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | For Firebase | Project ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | For Firebase | Web app ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Optional | Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Optional | FCM sender ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Optional | Analytics (if enabled) |
| `NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY` | Optional | App Check reCAPTCHA v3 site key |
| `NEXT_PUBLIC_FIREBASE_AI_MODEL` | Optional | Gemini model for cloud inference (default `gemini-2.5-flash`) |
| `NEXT_PUBLIC_ENABLE_SERVICE_WORKER` | Optional | `"true"` registers `public/sw.js` (default off) |

The app runs without any of these set. `missingFirebaseEnvVars` in
`src/lib/firebase/config.ts` lists what is still absent.

### Manual Firebase setup still required

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. **Add a Web app** and copy the `firebaseConfig` values into `.env.local`.
3. Enable **Authentication → Sign-in method** (Email/Password) before using
   `/login` or `/signup`.
4. Create a **Cloud Firestore** database and write Security Rules —
   the offline persistence in `client.ts` is already configured.
5. (Optional) **App Check** → register the web app → put the site key in
   `NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY`, then call
   `initializeFirebaseAppCheck()` from a client component.
6. (Optional) **AI Logic** → confirm which Gemini models your project can use
   and set `NEXT_PUBLIC_FIREBASE_AI_MODEL` accordingly.

---

## Project structure

```text
trailmind/
├── public/
│   ├── icons/            # SVG app icons (any + maskable)
│   ├── images/
│   ├── manifest.json     # PWA web app manifest
│   └── sw.js             # service-worker scaffold (opt-in)
├── src/
│   ├── app/
│   │   ├── (auth)/       # login, signup, onboarding  → /login, /signup, /onboarding
│   │   ├── (dashboard)/  # app shell pages             → /dashboard, /trips, /assistant,
│   │   │                                                   /wallet, /language, /downloads,
│   │   │                                                   /saved-places, /settings
│   │   ├── globals.css   # design tokens
│   │   ├── layout.tsx    # root layout (Inter, metadata, SW registration)
│   │   └── page.tsx      # public landing page
│   ├── components/
│   │   ├── auth/         # auth form shell
│   │   ├── dashboard/    # travel / stat / quick-action cards
│   │   ├── layout/       # app shell, sidebar, header, page container, connectivity
│   │   ├── offline/      # service-worker registration
│   │   └── ui/           # shadcn/ui primitives
│   ├── lib/
│   │   ├── ai/hybrid-model.ts     # Firebase AI Logic hybrid routing
│   │   ├── firebase/config.ts     # env-driven config, never throws
│   │   ├── firebase/client.ts     # app / auth / firestore / app-check
│   │   ├── offline/db.ts          # Dexie (IndexedDB) schema
│   │   ├── format.ts              # date + currency helpers
│   │   └── utils.ts               # cn() helper (shadcn alias)
│   ├── constants/        # navigation, site identity, sample preview data
│   ├── hooks/            # useOnlineStatus
│   ├── services/         # reserved for future API/service layer
│   └── types/            # shared domain types
├── .env.example
├── components.json       # shadcn/ui config
└── next.config.ts
```

Route groups (`(auth)`, `(dashboard)`) add shared layouts without changing
URLs. `src/lib/utils.ts` is a file rather than a folder because the shadcn
alias `@/lib/utils` points at it.

---

## Design foundation

Tokens live in `src/app/globals.css` and are available as Tailwind utilities
(`bg-primary`, `text-muted-foreground`, `bg-brand-accent`, …).

| Role | Token | Value |
| --- | --- | --- |
| Primary — forest green | `--primary` / `--brand-forest` | `#164B3B` |
| Secondary — sage green | `--secondary` / `--brand-sage` | `#A8BFA8` |
| Accent — orange | `--accent` / `--brand-accent` | `#E89A55` |
| Background | `--background` | `#F8F8F3` |
| Surface | `--surface` / `--card` | `#FFFFFF` |
| Primary text | `--foreground` | `#202820` |
| Secondary text | `--muted-foreground` | `#737B75` |

Typography is **Inter**, loaded through `next/font` into `--font-inter`.
The sidebar uses the forest-green surface with sage/orange accents.
A dark variant is defined under `.dark` but no theme switcher exists yet.

---

## Offline & PWA notes

Two separate stores, deliberately kept apart:

- **App data** → Dexie / IndexedDB (`src/lib/offline/db.ts`): trips, places,
  wallet entries, chat history and a `syncQueue` outbox for Firestore.
- **App assets** → Cache Storage (`public/sw.js`): a small static allowlist
  only. It never caches other origins (Firebase), `/api/*`, or HTML for
  signed-in routes.

The service worker is **off by default**. Read `public/sw.js` before setting
`NEXT_PUBLIC_ENABLE_SERVICE_WORKER=true`, and read the limitations documented
at the top of that file — offline navigation between routes is not yet
guaranteed.

Recommended next step for real offline resilience: enable
`experimental.useOffline` in `next.config.ts` and surface state with the
`useOffline` hook (see the Next.js offline-support guide in
`node_modules/next/dist/docs/01-app/02-guides/offline-support.md`).

---

## Git

Git is initialised locally with a single initial commit. There is **no remote
repository** — nothing will be pushed without explicit permission.

---

## Useful commands

```bash
npm run dev                        # start development server
npx next typegen                   # regenerate LayoutProps/PageProps types
npx tsc --noEmit                   # type-check only
npm run lint                       # lint
npm run build && npm run start     # production check
```
