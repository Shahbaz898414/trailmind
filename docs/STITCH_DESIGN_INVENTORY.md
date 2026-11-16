# Stitch Design Inventory

Source of truth for the TrailMind frontend: the Google Stitch design package at
`~/Downloads/stitch_trailmind_ui_ux_design_system` (read-only — never modified).

This document inventories every design in the package: the shared shell, the
design tokens, the icon and image asset mapping, and a per-screen breakdown of
layout, sections, components, controls, states and exact copy. It is the
reference used to implement the pages in `src/app/` and is paired with
`STITCH_ROUTE_MAPPING.md` (where each screen lives in the router) and
`IMPLEMENTATION_STATUS.md` (what has been built).

## 1. Package structure

| Item | Count | Notes |
| --- | --- | --- |
| Screen folders (`*/code.html`) | 40 | Each contains `code.html` + a rendered `screen.png` reference |
| Design system folder | 1 | `trailmind_design_system/` — `DESIGN.md` token YAML + component guidance (brand-palette era, superseded by rendered tokens — see §3) |
| Export manifest | 1 | `trailmind_complete_design_package_export_manifest.md` — 24-screen inventory, IA notes, shared shell spec |
| External images referenced | 24 | All `lh3.googleusercontent.com`; downloaded to `public/images/stitch/` (no hotlinking) |

Every `code.html` shares the same skeleton: `<head>` (fonts + one giant line 5
containing `<style>`, Tailwind CDN, `tailwind-config` script), `<body>`, the
shared `<aside>` sidebar + `<header>`, then page content starting at
`<main class="w-full pt-16 bg-surface min-h-screen">`.

During inventory the shell was stripped from all 40 files into
`/tmp/tm_inspect/body/*.clean.html` so each page's own content could be read in
isolation; the extracted shared shell lives at `/tmp/tm_inspect/shell-pretty.html`
and the canonical Tailwind token config at `/tmp/tm_inspect/tm-config.js`.

## 2. Shared app shell (every in-app screen)

All dashboard-area screens render inside one persistent shell. Auth and
onboarding screens are standalone (no sidebar/header).

### Sidebar — `<aside>`, fixed, `w-72` (18rem)

- White surface (`surface-container-lowest`), full height, `z-40`.
- Brand block at top: TrailMind logo (`/images/stitch/trailmind-logo.jpg`) + wordmark.
- Nav order with Material icon → `data-path` attribute and any count chip:
  1. `grid_view` → `dashboard` — "Dashboard"
  2. `explore` → `my-trips` — "My Trips" — badge **3**
  3. `neurology` → `assistant` — "AI Travel Assistant" — badge **Gen2**
  4. `account_balance_wallet` → `wallet` — "Travel Wallet"
  5. `translate` → `language` — "Language Assistant"
  6. `download_for_offline` → `downloads` — "Offline Downloads" — badge **12 GB**
  7. `bookmark` → `saved-places` — "Saved Places"
  8. `settings` → `settings` — "Settings"
- Active item: `bg-primary-container text-on-primary font-label-lg rounded-lg`
  (Deep Pine pill, white label).
- Bottom "Field Storage" HUD: label + **82%** progress + caption
  "5.4 GB cached for offline routing".

### Header — `<header>`, fixed, `h-16`, `left-72`

- White, blurred, sits above content; content column is `pl-72` + `pt-16`.
- Search input, placeholder: **"Search trails, waypoints, offline maps..."**
- Status pills, in order:
  - **"Online • Synced"** — emerald pill
  - **"Local On-Device AI"** — edge-AI pill (shows prototype Local/Cloud states)
- Notifications bell with red/error dot → notifications center.
- Avatar + user chip (mock user: **Alex Morgan**, `alex@example.com`).

### Content band

`<main class="w-full pt-16 bg-surface min-h-screen">` — page background is
`surface #f4fbf4`. Each page then applies its own container (see per-screen
entries): `max-w-[1400px]`, `max-w-[1280px]`, `max-w-7xl`, or full-bleed with
`px-space-md md:px-margin-desktop`.

### Grid & card vocabulary (shared)

- Layout idiom: `grid grid-cols-1 lg:grid-cols-12 gap-space-lg(-xl) items-start`
  with 7/5 or 8/4 splits; collapses to one column on mobile.
- Card idiom: `bg-surface-container-lowest rounded-xl p-space-lg shadow-sm`,
  hover `shadow-md`/`shadow-xl`; `rounded-2xl` for hero/section cards.
- Inner metric tiles: `bg-surface-container-low` / `-high` / `-highest`.
- Pills: `rounded-full font-label-sm` on `bg-secondary-fixed` (green),
  `bg-tertiary-fixed` (peach), `bg-primary-container` (dark green + white text),
  `bg-surface-container-high` (neutral). Status text often uppercase.
- Live-state dots: `w-2 h-2 rounded-full bg-emerald-600 animate-ping/pulse`.
- Progress bars: `h-1`/`h-1.5`/`h-2 rounded-full` track
  `bg-surface-container-highest` with `bg-primary`/`bg-secondary`/
  `bg-primary-container` fill + inline width %.
- Buttons: `rounded-xl shadow-sm/shadow-md active:scale-95`, primary
  `bg-primary text-on-primary` (or `bg-primary-container`), secondary
  `bg-surface-container-lowest` + border-less.
- Interactions are local-state only; nothing persists to Firebase. AI answers
  are labelled as mock, and Local AI / Cloud AI appear only as prototype states.

## 3. Design tokens (reconciled → `src/app/globals.css`)

The manifest/`DESIGN.md` brand palette (`#E89A55` etc.) describes an earlier
brand pass. The **rendered** M3 tokens inside each `code.html`
(`tailwind-config`) are what `screen.png` actually shows — verified by
pixel-sampling — so they are the source of truth and are what
`globals.css` defines.

### Color

| Token | Hex | Role |
| --- | --- | --- |
| `primary` | `#003426` | Darkest green — solid CTAs, dark hero, terminal panels |
| `primary-container` | `#164b3b` | Deep Pine — active nav pill, filled cards, dark banners |
| `on-primary` | `#ffffff` | Text/icons on `primary` / `primary-container` |
| `primary-fixed` / `-dim` | `#b8eed8` / `#9dd2bc` | Light mint accents, icon tiles, chips |
| `secondary` | `#4f6450` | Muted green — secondary fills, chart bar |
| `secondary-fixed` / `secondary-container` | `#d1e9d0` | "Ready / verified / cached" green pill |
| `tertiary` / `tertiary-container` | `#472300` / `#673600` | Amber-brown fills |
| `tertiary-fixed` / `-dim` | `#ffdcc2` / `#ffb77b` | Peach emphasis pill / warmer variant |
| `error` | `#ba1a1a` | Destructive + urgent |
| `error-container` / `on-error-container` | `#ffdad6` / `#93000a` | Soft red surface |
| `surface` | `#f4fbf4` | Page background |
| `surface-container-lowest` | `#ffffff` | Cards, header, sidebar |
| `surface-container-low` | `#eef6ee` | Subtle grouped rows |
| `surface-container` | `#e8f0e8` | Panels, HUD tiles |
| `surface-container-high` | `#e2eae3` | Neutral chips |
| `surface-container-highest` | `#dde5dd` | Tracks, dividers |
| `on-surface` | `#161d19` | Primary text |
| `on-surface-variant` | `#404944` | Secondary text |
| `outline` / `outline-variant` | `#707974` / `#c0c9c3` | Icons/placeholders · borders |
| `inverse-surface` / `inverse-on-surface` | `#2b322d` / `#ebf3eb` | Dark terminal/log panels |

shadcn aliases map onto the same palette (`muted`→`#eef6ee`, `accent`→`#d1e9d0`,
`destructive`→`#ba1a1a`, `border`→`#dde5dd`, `input`→`#c0c9c3`,
`ring`→`#003426`, `card`/`popover`→`#ffffff`, sidebar→white with
`#164b3b` active pill).

### Typography

- **Manrope** → `font-headline-*`, `font-display-*` (loaded in
  `src/app/layout.tsx` as `--font-manrope`).
- **Inter** → `font-body-*`, `font-label-*` (`--font-inter`).
- `font-mono` → system mono stack (Stitch defines no mono family; telemetry
  values simply fall back to the browser default).

| Utility | Size / line / tracking / weight |
| --- | --- |
| `text-display-lg` | 3.5rem / 4rem / -0.03em / 800 |
| `text-display-lg-mobile` | 2.25rem / 2.75rem / -0.02em / 800 |
| `text-headline-lg` (+ `-mobile`) | 2.5rem / 3rem / -0.02em / 700 · 1.75rem mobile |
| `text-headline-md` | 1.5rem / 2rem / -0.01em / 600 |
| `text-headline-sm` | 1.25rem / 1.75rem / 600 |
| `text-body-lg` / `-md` / `-sm` | 1.125/1.75 · 1/1.5 · 0.875/1.25 rem, 400 |
| `text-label-lg` | 0.875rem / 1.25rem / 0.01em / 600 |
| `text-label-md` | 0.75rem / 1rem / 0.04em / 600 |
| `text-label-sm` | 0.6875rem / 0.875rem / 0.06em / 700 |

### Spacing, radii

- Spacing: `space-xs .25rem · space-sm .5rem · space-md 1rem · space-lg 1.5rem ·
  space-xl 2.5rem · gutter 1rem · gutter-desktop 1.5rem · margin 1rem ·
  margin-desktop 2.5rem` → utilities `p-space-md`, `gap-space-lg`,
  `px-margin-desktop`, etc.
- Radii: Tailwind defaults already match Stitch — `rounded .25rem`,
  `rounded-lg .5rem`, `rounded-xl .75rem`, `rounded-2xl 1rem`, `rounded-full`.

All of the above were verified by building and grepping the emitted CSS
(`.p-space-md{padding:1rem}`, `.text-headline-lg{…}`, `.bg-primary-container{background-color:#164b3b}`, …).

## 4. Iconography — Material Symbols Outlined → Lucide

Stitch uses Google's **Material Symbols Outlined** ligature icons (often with
`FILL 1` variants), sized `text-[14px]`–`text-[32px]`. The app uses
**lucide-react** instead. Mapping rules:

- Direct name matches are imported from `lucide-react` verbatim
  (`Search`, `Bell`, `Map`, `Download`, `Settings`, `Share2`, `Star`,
  `Calendar`, `Clock`, `CheckCircle2`, `XCircle`, `AlertTriangle`, `Info`,
  `Lock`, `Key`, `RefreshCw`, `Send`, `Mic`, `Paperclip`, `Copy`, `Trash2`,
  `ChevronRight/Left/Down`, `ArrowLeft/Right/Forward`, `Plus`, `Minus`,
  `Edit3`, `Eye`, `Play`, `Pause`, `Volume2`, `QrCode`, `Fingerprint`,
  `Terminal`, `Cpu`, `Database`, `Wifi`, `WifiOff`, `Battery…`, `Cloud`,
  `CloudOff`, `CloudDownload`, `Navigation`, `Route`, `Compass`, `Flag`,
  `Pin`, `Bookmark`, `Heart`, `User`, `Users`, `Building2`, `Bed`, `Utensils`,
  `Trees`, `Mountain`, `Sun`, `CloudSun`, `Wind`, `Thermometer`, `Gauge`,
  `Activity`, `Layers`, `Grid3x3`, `List`, `LayoutGrid`, `Filter`, `SlidersHorizontal`,
  `Upload`, `FolderOpen`, `FileText`, `Image`, `Radio`, `Satellite`*).
- `*` = no exact Lucide equivalent; nearest used (e.g. `Satellite` → `Radio`/
  `Radar`, `SatelliteAlt` → `Radar`, `Battery5Bar` → `BatteryFull`).
- Ligature-only names in the designs map as below (kept in sync while
  implementing; per-screen reports list every icon used):

| Material Symbols | Lucide |
| --- | --- |
| `grid_view` | `LayoutGrid` |
| `explore` | `Compass` |
| `neurology` / `psychology` / `smart_toy` | `Brain` / `BrainCircuit` / `Sparkles` |
| `account_balance_wallet` / `wallet` | `Wallet` |
| `translate` | `Languages` |
| `download_for_offline` / `downloading` | `DownloadCloud` / `Download` |
| `bookmark` / `bookmark_add` | `Bookmark` / `BookmarkPlus` |
| `settings` / `tune` / `settings_suggest` | `Settings` / `SlidersHorizontal` / `Settings2` |
| `search` / `travel_explore` | `Search` / `Search` |
| `notifications` / `notifications_active` | `Bell` / `BellRing` |
| `memory` / `memory_alt` | `MemoryStick` / `Cpu` |
| `offline_pin` / `offline_bolt` | `MapPinCheck` / `Zap` |
| `satellite_alt` / `satellite` / `cell_tower` | `Radar` / `Satellite`→`Radar` / `RadioTower` |
| `cloud_done` / `cloud_sync` / `cloud_off` | `CloudCheck`→`Cloud` / `RefreshCw` / `CloudOff` |
| `sync` / `sync_saved_locally` | `RefreshCw` / `SaveAll` |
| `inventory_2` / `inventory` | `Boxes` / `Package` |
| `map` / `map_2` | `Map` |
| `event_upcoming` / `calendar_month` / `calendar_today` | `CalendarDays` / `Calendar` |
| `schedule` / `timer` / `history` | `Clock` / `Timer` / `History` |
| `verified` / `verified_user` / `check_circle` | `BadgeCheck` / `ShieldCheck` / `CheckCircle2` |
| `bolt` / `offline_bolt` | `Zap` |
| `wifi_tethering` / `signal_cellular_alt` | `Wifi` / `Signal` |
| `folder_special` / `folder_managed` / `folder_open` | `Folder` / `FolderCog`→`FolderCog` / `FolderOpen` |
| `sd_card` / `database` | `SdCard` / `Database` |
| `auto_awesome` / `auto_fix_high` | `Sparkles` / `Wand2` |
| `pending_actions` / `checklist_rtl` / `checklist` | `ListTodo` / `ClipboardCheck` / `ListChecks` |
| `handyman` / `build` | `Wrench` / `Hammer` |
| `medical_services` / `emergency` / `crisis_alert` | `Stethoscope` / `Siren` / `TriangleAlert` |
| `contact_emergency` / `emergency_share` | `ContactRound`→`Siren` / `Share2` |
| `sensors` / `sensors_krx` | `Activity` / `Waves` |
| `thermostat` / `speed` / `air` | `Thermometer` / `Gauge` / `Wind` |
| `wb_sunny` / `wb_twilight` / `partly_cloudy_day` | `Sun` / `Sunset` / `CloudSun` |
| `directions_walk` / `hiking` | `Footprints` / `PersonStanding`→`Hiking` |
| `train` / `directions_bus` | `Train` / `Bus` |
| `hotel` / `bed` / `cottage` / `hot_tub` | `Hotel` / `BedDouble` / `Home` / `Bath` |
| `restaurant` / `ramen_dining` / `currency_exchange` | `Utensils` / `Utensils` / `Banknote` |
| `payments` / `receipt_long` | `CreditCard` / `Receipt` |
| `qr_code_2` | `QrCode` |
| `pin_drop` / `location_on` / `add_location_alt` | `MapPin` / `MapPin` / `MapPinned` |
| `navigation` / `route` / `alt_route` | `Navigation` / `Route` / `GitBranch`→`Route` |
| `show_chart` / `trending_up` / `query_stats` | `LineChart` / `TrendingUp` / `BarChart3` |
| `terminal` | `Terminal` |
| `lock` / `lock_reset` / `security` | `Lock` / `LockKeyhole` / `Shield` |
| `key` / `fingerprint` | `KeyRound` / `Fingerprint` |
| `share` / `ios_share` | `Share2` |
| `upload_file` / `file_upload` / `file_download` | `Upload` / `Upload` / `FileDown` |
| `description` / `edit_note` / `draft` | `FileText` / `FilePenLine` / `FileEdit` |
| `delete` / `delete_sweep` / `cleaning_services` | `Trash2` / `Trash2` / `Eraser` |
| `more_vert` / `expand_more` / `unfold_more` | `MoreVertical` / `ChevronDown` / `ChevronsUpDown` |
| `arrow_forward` / `arrow_back` / `chevron_right` | `ArrowRight` / `ArrowLeft` / `ChevronRight` |
| `add_circle` / `add` / `remove` | `CirclePlus` / `Plus` / `Minus` |
| `grid_view` / `view_agenda` | `LayoutGrid` / `Rows3` |
| `play_circle` / `play_arrow` / `visibility` | `PlayCircle` / `Play` / `Eye` |
| `headphones` / `volume_up` / `record_voice_over` | `Headphones` / `Volume2` / `Mic` |
| `lightbulb` | `Lightbulb` |
| `local_taxi` | `CarTaxiFront`→`Car` |
| `person` / `people` | `User` / `Users` |
| `archived` / `archive` | `Archive` |
| `drag_handle` / `swap_vert` | `GripVertical` / `ArrowUpDown` |
| `rss_feed` / `podcasts` / `hub` / `device_hub` | `Rss` / `Podcast` / `Share2`→`Hub` / `Network` |
| `battery_5_bar` / `battery_charging_90` / `power` | `BatteryFull` / `BatteryCharging` / `Zap` |
| `usb` / `bluetooth_connected` | `Usb` / `Bluetooth` |
| `watch` | `Watch` |
| `terminal` / `developer_board` | `Terminal` / `Cpu` |

(Exact import choices get finalised with the shared components; this table is
the agreed vocabulary.)

## 5. Image assets

All 24 external images were downloaded (originals are never modified, never
hotlinked) into `public/images/stitch/` with curated slugs:

| Local file | Used by screen(s) |
| --- | --- |
| `trailmind-logo.jpg` | App shell brand mark |
| `dashboard-northern-alps-dawn.jpg` | Dashboard hero |
| `dashboard-torres-del-paine.jpg` | Dashboard pipeline card |
| `dashboard-dolomites-autumn.jpg` | Dashboard pipeline card |
| `dashboard-hornstrandir-fjord.jpg` | Dashboard curated trip |
| `dashboard-zanskar-monastery.jpg` | Dashboard curated trip |
| `dashboard-abel-tasman.jpg` | Dashboard curated trip |
| `my-trips-arashiyama-autumn.jpg` | My Trips hero card |
| `my-trips-torres-del-paine.jpg` | My Trips card |
| `my-trips-dolomites-green.jpg` | My Trips card |
| `my-trips-hokkaido-onsen.jpg` | My Trips completed card |
| `trip-details-kumano-kodo-cedars.jpg` | Trip details photo mosaic |
| `trip-details-nachi-taisha.jpg` | Trip details photo mosaic |
| `kyoto-arashiyama-bamboo.jpg` | Itinerary activity card |
| `kyoto-tenryuji-zen-garden.jpg` | Itinerary activity card |
| `kyoto-shojin-ryori.jpg` | Itinerary activity card |
| `kyoto-okochi-sanso-view.jpg` | Itinerary activity card |
| `kyoto-pontocho-dusk.jpg` | Itinerary activity card |
| `create-trip-kumano-kodo-daimon-zaka.jpg` | Create trip step 1 |
| `document-mount-fuji-shinkansen.jpg` | Wallet document details |
| `saved-ryokan-motonaga.jpg` | Saved Places card |
| `saved-kiyomizu-dera.jpg` | Saved Places card |
| `saved-tateyama-hut.jpg` | Saved Places card |
| `model-setup-alpine-pass.jpg` | On-device AI model setup |
| `profile-kenji-takahashi.jpg` | Profile settings avatar |

### Known asset gaps (documented, must be redrawn or omitted)

1. **Topo HUD background** on Saved Places — a CSS `background-image` never
   listed in the image manifest; no local equivalent. Redraw as CSS/SVG grid.
2. **Five CSS `background-image` backgrounds** on the Destination deep-dive
   screen (hero underlay, 3 district thumbnails, map panel) — not in the image
   manifest. Redraw (SVG contours for hero; omit/gradient for thumbnails;
   SVG map + HUD overlay for the map panel).
3. **Map thumbnail** on the Emergency information screen — same situation.
4. **Language live-console backgrounds** — decorative backgrounds with no
   downloadable asset; omit or redraw.

## 6. Per-screen inventory

Each entry: suggested route, wrapper/layout, sections in order, cards &
components (with exact copy), form controls, interactive elements, states
shown, key visual details, and verbatim notes.

<!-- SCREEN-INVENTORY-START -->

### Group 1: Authentication & Onboarding (8 Screens)
1. **`sign_in_trailmind`** (`/login`): Split-screen bento layout (5-col editorial left, 7-col form right). Master passphrase input with eye toggle, email input, "Keep me signed in for offline trips" checkbox, biometric passkey banner, edge cryptographic enclave footnote.
2. **`sign_up_trailmind`** (`/signup`): Full registration flow. Name, email, master passphrase, travel style directive selector (Alpine, Cultural, Off-grid), emergency contact pairing.
3. **`forgot_password_vault_recovery_trailmind`** (`/forgot-password`): Cryptographic master vault recovery. Email input, recovery key phrase submission, hardware security token verification.
4. **`onboarding_welcome_to_trailmind`** (`/onboarding` Step 0): Value proposition briefing, air-gapped on-device neural model capabilities preview, storage authorization.
5. **`onboarding_step_1_hybrid_architecture_trailmind`** (`/onboarding` Step 1): Dual cloud/edge orchestration briefing. Architecture diagram comparing Firebase Cloud AI with local Gemma-2B INT4 inference.
6. **`onboarding_step_2_travel_style_directives_trailmind`** (`/onboarding` Step 2): Travel style directives (Wilderness Trekking, Cultural Heritage, Urban Expedition) and dietary/medical constraints flags.
7. **`onboarding_step_3_hardware_storage_permissions_trailmind`** (`/onboarding` Step 3): Local storage allocation slider (5 GB - 25 GB), satellite device pairing (Garmin inReach, LoRa), offline permission grant.
8. **`onboarding_complete_expedition_vault_armed_trailmind`** (`/onboarding` Step 4): Vault armed confirmation screen, encryption key initialized, launch CTA to Dashboard.

### Group 2: Create Trip & Activity Management (5 Screens)
9. **`create_trip_step_1_destination_parameters_trailmind`** (`/trips/new` Step 1): Destination search, region selection, travel dates, traveler count, Kumano Kodo hero banner.
10. **`create_trip_step_2_terrain_pace_logistics_trailmind`** (`/trips/new` Step 2): Terrain difficulty selector, daily elevation tolerance, walking pace, transit mode, accommodation type.
11. **`create_trip_step_3_field_gear_health_constraints_trailmind`** (`/trips/new` Step 3): Pack weight budget gauge (8.5/12 kg), medical directives, satellite telemetry pairing, finish button.
12. **`add_edit_activity_drawer_trailmind`** (`/trips/[id]/itinerary` drawer): Right slide-out drawer with activity title, time slot, category pills, coordinates, elevation, ephemeris lock, transit conflict warning.
13. **`trip_itinerary_empty_ai_synthesis_state_trailmind`** (`/trips/[id]/itinerary` empty state): Empty itinerary canvas with "Synthesize with AI" primary trigger and constraint overview.

### Group 3: Core Dashboard & Trips Library (5 Screens)
14. **`trailmind_dashboard`** (`/dashboard`): Master expedition dashboard. Upcoming Kyoto Cherry Blossom hero card, 4 live stat tiles, recommended adventure blueprints (Alta Via 1 Dolomites, Zanskar Monasteries, Abel Tasman), quick telemetry feed.
15. **`my_trips_library_trailmind`** (`/trips`): Trip cards grid with search, status filters (Upcoming, In-Progress, Draft, Completed), satellite sync status badges.
16. **`trip_details_expedition_master_hub_logistics_trailmind`** (`/trips/[id]`): Expedition master logistics hub. Photo mosaic, terrain parameters, solar ephemeris, waypoints, tabs for overview, itinerary, documents.
17. **`destination_deep_dive_kyoto_higashiyama_trailmind`** (`/trips/[id]/destination`): Field dossier #JP-KYO-04: 10m DEM contour maps, solar twilight timing, district breakdown, local etiquette rules.
18. **`ai_itinerary_synthesis_hud_trailmind`** (`/trips/[id]/itinerary` synthesis HUD): Terminal HUD displaying autonomous constraint solver, spatial route compiler, and heuristic tuning log.

### Group 4: AI Travel Assistant (3 Screens)
19. **`ai_travel_assistant_hybrid_inference`** (`/assistant`): Dual cloud/edge orchestration chat console, suggested queries, transit routing, RAG context picker, green Online/Cloud status pill.
20. **`ai_travel_assistant_offline_zero_cellular_mode`** (`/assistant` offline): Air-gapped on-device Gemma-2B mode with amber caution banner, driver visual flashcards, local vector search.
21. **`ai_travel_assistant_structured_response_contingency_hud`** (`/assistant` contingency): Structured contingency card overlay with fallback options and emergency action items.

### Group 5: Travel Wallet & Emergency Safety (4 Screens)
22. **`travel_wallet_overview_trailmind`** (`/wallet`): Pass & ticket overview, JR Shinkansen ticket, Ryokan Motonaga voucher, insurance policies, filter tabs.
23. **`travel_wallet_add_edit_document_modal`** (`/wallet` modal): AES-256 encrypted file attachment, pass categorization, optical character recognition parser.
24. **`document_details_jr_shinkansen_nozomi_23`** (`/wallet/documents/[id]`): Full-screen high-contrast inspection view, offline Aztec barcode, car and seat locks, transit details.
25. **`emergency_information_field_safety_trailmind`** (`/wallet/emergency`): Embassy dispatch, mountain rescue frequencies, blood type and allergy kanji cards, emergency contacts.

### Group 6: Language Assistant & Audio Studio (3 Screens)
26. **`language_assistant_live_field_translation_console_trailmind`** (`/language`): Live field translation console, English ↔ Japanese text translation, local neural speech synthesis.
27. **`language_assistant_phrasebook_trailmind`** (`/language` phrasebook): Contextual category matrices (Transport, Dining, Emergency, Lodging) with bilingual audio playback.
28. **`saved_phrases_field_audio_studio_trailmind`** (`/language/phrases`): High-contrast taxi flashcards, neural audio playback studio, spaced repetition drills.

### Group 7: Offline Downloads & Synchronization (4 Screens)
29. **`offline_downloads_storage_hub_trailmind`** (`/downloads`): 25 GB storage breakdown, 1:25k topo map packs, local vector database allocations, download triggers.
30. **`download_trip_for_offline_use_progress_monitor_trailmind`** (`/downloads/progress`): Multi-threaded package staging, 612 MB DEM contour download, SHA-256 checksum audit.
31. **`field_offline_readiness_checklist_pre_flight_gate_trailmind`** (`/downloads/checklist`): Pre-flight gate checklist: maps, on-device model, medical directives, satellite link status.
32. **`offline_sync_conflict_resolution_trailmind`** (`/downloads/sync`): Distributed version tree, two-way diff viewer, merge resolution actions.

### Group 8: Saved Places (1 Screen)
33. **`saved_places_off_grid_bookmarks_trailmind`** (`/saved-places`): 48 saved places, cached elevation profiles, proximity-sorted waypoints, split topo HUD.

### Group 9: Settings, Hardware & Notifications (7 Screens)
34. **`general_settings_system_preferences_trailmind`** (`/settings`): General preferences, offline storage rules, satellite burst compression, cache controls.
35. **`profile_emergency_contact_directive_settings_trailmind`** (`/settings/profile`): Alex Morgan profile, next-of-kin contacts, medical flags, hardware key pairing.
36. **`ai_inference_edge_model_performance_settings_trailmind`** (`/settings/ai`): Edge NPU benchmarking, WebGPU compute pipelines, INT4 quantization controls.
37. **`on_device_ai_model_setup_edge_npu_benchmarking_trailmind`** (`/settings/model-setup`): Model weights downloader, Apple Neural Engine benchmark telemetry, thermal throttling profile.
38. **`field_hardware_satellite_sync_hub_trailmind`** (`/settings/hardware`): Garmin inReach Mini 2 link, TrailMind LoRa 915MHz relay, Iridium polar azimuth radar, SOS hardware interlock.
39. **`expedition_notifications_satellite_alerts_center_trailmind`** (`/notifications`): Notifications center: Satellite alerts, sync updates, weather advisories, emergency alarms.
40. **`kyoto_trip_itinerary_offline_ready`** (`/trips/[id]/itinerary`): 12-day interactive timeline, solar ephemeris calculator, GPX waypoints, day-by-day activity cards.

<!-- SCREEN-INVENTORY-END -->
