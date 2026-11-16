# TrailMind — Stitch Design to Route Mapping

This document provides the definitive map between the 40 Stitch HTML designs (`stitch_trailmind_ui_ux_design_system`) and the Next.js App Router route structure in `src/app/`.

---

## 1. Authentication & Onboarding (Standalone Layout)

| Stitch Design Folder | Next.js Route | File Location | Description & States |
|---|---|---|---|
| `sign_in_trailmind` | `/login` | `src/app/(auth)/login/page.tsx` | Master passphrase login, biometric passkey option, keep-offline checkbox, expedition editorial bento banner. |
| `sign_up_trailmind` | `/signup` | `src/app/(auth)/signup/page.tsx` | Local vault initialization, emergency contact pairing, travel style directives. |
| `forgot_password_vault_recovery_trailmind` | `/forgot-password` | `src/app/(auth)/forgot-password/page.tsx` | Master vault phrase recovery & cryptographic key retrieval. |
| `onboarding_welcome_to_trailmind` | `/onboarding` (Step 0) | `src/app/(auth)/onboarding/page.tsx` | Value proposition carousel, offline model capability briefing. |
| `onboarding_step_1_hybrid_architecture_trailmind` | `/onboarding` (Step 1) | `src/app/(auth)/onboarding/page.tsx` | Dual cloud/edge orchestration briefing & air-gap architecture. |
| `onboarding_step_2_travel_style_directives_trailmind` | `/onboarding` (Step 2) | `src/app/(auth)/onboarding/page.tsx` | Travel style selector (Alpine, Cultural, Off-grid) & dietary constraints. |
| `onboarding_step_3_hardware_storage_permissions_trailmind` | `/onboarding` (Step 3) | `src/app/(auth)/onboarding/page.tsx` | Hardware storage permission grant, LoRa/satellite pairing options. |
| `onboarding_complete_expedition_vault_armed_trailmind` | `/onboarding` (Step 4) | `src/app/(auth)/onboarding/page.tsx` | Confirmation view, cryptographic keys armed, CTA into dashboard. |

---

## 2. Core Dashboard & Expedition Overview

| Stitch Design Folder | Next.js Route | File Location | Description & States |
|---|---|---|---|
| `trailmind_dashboard` | `/dashboard` | `src/app/(dashboard)/dashboard/page.tsx` | Next-leg expedition hero card (Kyoto 12-day), live satellite sync state, 4 stat tiles, recommended adventure blueprints (Dolomites, Zanskar, Abel Tasman), quick route telemetry. |

---

## 3. Expedition Planning & Trips Engine

| Stitch Design Folder | Next.js Route | File Location | Description & States |
|---|---|---|---|
| `my_trips_library_trailmind` | `/trips` | `src/app/(dashboard)/trips/page.tsx` | Full expedition library, search, status filter tabs (Upcoming, In-Progress, Draft, Completed), satellite sync badges. |
| `create_trip_step_1_destination_parameters_trailmind` | `/trips/new` (Step 1) | `src/app/(dashboard)/trips/new/page.tsx` | Destination search, geographic bounding box, dates, traveler count. |
| `create_trip_step_2_terrain_pace_logistics_trailmind` | `/trips/new` (Step 2) | `src/app/(dashboard)/trips/new/page.tsx` | Terrain difficulty, daily walking pace, transport mode, lodging style. |
| `create_trip_step_3_field_gear_health_constraints_trailmind` | `/trips/new` (Step 3) | `src/app/(dashboard)/trips/new/page.tsx` | Pack weight budget gauge (8.5/12 kg), medical directives, satellite telemetry pairing. |
| `trip_details_expedition_master_hub_logistics_trailmind` | `/trips/[id]` | `src/app/(dashboard)/trips/[id]/page.tsx` | Master expedition hub: photo mosaic, terrain parameters, quick stats, links to itinerary, documents, offline pack. |
| `destination_deep_dive_kyoto_higashiyama_trailmind` | `/trips/[id]/destination` | `src/app/(dashboard)/trips/[id]/destination/page.tsx` | Field dossier #JP-KYO-04: 10m DEM contour maps, solar twilight timing, local etiquette rules, historic district breakdown. |

---

## 4. Itinerary & AI Route Synthesis

| Stitch Design Folder | Next.js Route | File Location | Description & States |
|---|---|---|---|
| `kyoto_trip_itinerary_offline_ready` | `/trips/[id]/itinerary` | `src/app/(dashboard)/trips/[id]/itinerary/page.tsx` | 12-day interactive timeline, solar ephemeris calculator, GPX waypoints, day-by-day activity cards. |
| `trip_itinerary_empty_ai_synthesis_state_trailmind` | `/trips/[id]/itinerary` (State: Empty) | `src/app/(dashboard)/trips/[id]/itinerary/page.tsx` | Empty state with "Synthesize Itinerary with AI" trigger. |
| `ai_itinerary_synthesis_hud_trailmind` | `/trips/[id]/itinerary` (State: HUD Modal) | `src/app/(dashboard)/trips/[id]/itinerary/page.tsx` | Real-time terminal log displaying autonomous constraint solver, spatial route compilation, and heuristic tuning. |
| `add_edit_activity_drawer_trailmind` | `/trips/[id]/itinerary` (State: Drawer) | `src/app/(dashboard)/trips/[id]/itinerary/page.tsx` | Slide-out drawer for adding/editing an activity, with solar lock and transit conflict detector. |

---

## 5. AI Travel Assistant (Hybrid & Air-Gapped)

| Stitch Design Folder | Next.js Route | File Location | Description & States |
|---|---|---|---|
| `ai_travel_assistant_hybrid_inference` | `/assistant` | `src/app/(dashboard)/assistant/page.tsx` | Dual cloud/edge orchestration chat console, suggested queries, transit routing, RAG context picker. |
| `ai_travel_assistant_offline_zero_cellular_mode` | `/assistant` (State: Offline Toggle) | `src/app/(dashboard)/assistant/page.tsx` | Air-gapped on-device Gemma-2B mode with amber caution banner, driver visual flashcards. |
| `ai_travel_assistant_structured_response_contingency_hud` | `/assistant` (State: Contingency HUD) | `src/app/(dashboard)/assistant/page.tsx` | Structured contingency card overlay with fallback options and emergency action items. |

---

## 6. Travel Wallet & Field Safety

| Stitch Design Folder | Next.js Route | File Location | Description & States |
|---|---|---|---|
| `travel_wallet_overview_trailmind` | `/wallet` | `src/app/(dashboard)/wallet/page.tsx` | Overview of passes, Shinkansen tickets, Ryokan vouchers, offline QR codes, category filters. |
| `travel_wallet_add_edit_document_modal` | `/wallet` (State: Modal) | `src/app/(dashboard)/wallet/page.tsx` | AES-256 encrypted file attachment, pass categorization, optical character recognition parser. |
| `document_details_jr_shinkansen_nozomi_23` | `/wallet/documents/[id]` | `src/app/(dashboard)/wallet/documents/[id]/page.tsx` | Full-screen high-contrast inspection view, offline Aztec barcode, car and seat locks, transit details. |
| `emergency_information_field_safety_trailmind` | `/wallet/emergency` | `src/app/(dashboard)/wallet/emergency/page.tsx` | Embassy dispatch, mountain rescue frequencies, blood type and allergy kanji cards, emergency contacts. |

---

## 7. Language Assistant & Audio Studio

| Stitch Design Folder | Next.js Route | File Location | Description & States |
|---|---|---|---|
| `language_assistant_live_field_translation_console_trailmind` | `/language` | `src/app/(dashboard)/language/page.tsx` | Live field translation console, English ↔ Japanese text translation, local neural speech synthesis. |
| `language_assistant_phrasebook_trailmind` | `/language` (Tab: Phrasebook) | `src/app/(dashboard)/language/page.tsx` | Contextual category matrices (Transport, Dining, Emergency, Lodging) with bilingual audio playback. |
| `saved_phrases_field_audio_studio_trailmind` | `/language/phrases` | `src/app/(dashboard)/language/phrases/page.tsx` | High-contrast taxi flashcards, neural audio playback studio, spaced repetition drills. |

---

## 8. Offline Downloads & Edge Synchronization

| Stitch Design Folder | Next.js Route | File Location | Description & States |
|---|---|---|---|
| `offline_downloads_storage_hub_trailmind` | `/downloads` | `src/app/(dashboard)/downloads/page.tsx` | 25 GB storage breakdown, 1:25k topo map packs, local vector database allocations, download triggers. |
| `download_trip_for_offline_use_progress_monitor_trailmind` | `/downloads/progress` | `src/app/(dashboard)/downloads/progress/page.tsx` | Multi-threaded package staging, 612 MB DEM contour download, SHA-256 checksum audit. |
| `field_offline_readiness_checklist_pre_flight_gate_trailmind` | `/downloads/checklist` | `src/app/(dashboard)/downloads/checklist/page.tsx` | Pre-flight gate checklist: maps, on-device model, medical directives, satellite link status. |
| `offline_sync_conflict_resolution_trailmind` | `/downloads/sync` | `src/app/(dashboard)/downloads/sync/page.tsx` | Distributed version tree, two-way diff viewer, merge resolution actions. |

---

## 9. Exploration & Saved Places

| Stitch Design Folder | Next.js Route | File Location | Description & States |
|---|---|---|---|
| `saved_places_off_grid_bookmarks_trailmind` | `/saved-places` | `src/app/(dashboard)/saved-places/page.tsx` | 48 saved places, cached elevation profiles, proximity-sorted waypoints, split topo HUD. |

---

## 10. Settings, Hardware & Notifications

| Stitch Design Folder | Next.js Route | File Location | Description & States |
|---|---|---|---|
| `general_settings_system_preferences_trailmind` | `/settings` | `src/app/(dashboard)/settings/page.tsx` | General preferences, offline storage rules, satellite burst compression, cache controls. |
| `profile_emergency_contact_directive_settings_trailmind` | `/settings/profile` | `src/app/(dashboard)/settings/profile/page.tsx` | Alex Morgan profile, next-of-kin contacts, medical flags, hardware key pairing. |
| `ai_inference_edge_model_performance_settings_trailmind` | `/settings/ai` | `src/app/(dashboard)/settings/ai/page.tsx` | Edge NPU benchmarking, WebGPU compute pipelines, INT4 quantization controls. |
| `on_device_ai_model_setup_edge_npu_benchmarking_trailmind` | `/settings/model-setup` | `src/app/(dashboard)/settings/model-setup/page.tsx` | Model weights downloader, Apple Neural Engine benchmark telemetry, thermal throttling profile. |
| `field_hardware_satellite_sync_hub_trailmind` | `/settings/hardware` | `src/app/(dashboard)/settings/hardware/page.tsx` | Garmin inReach Mini 2 link, TrailMind LoRa 915MHz relay, Iridium polar azimuth radar, SOS hardware interlock. |
| `expedition_notifications_satellite_alerts_center_trailmind` | `/notifications` | `src/app/(dashboard)/notifications/page.tsx` | Notifications center: Satellite alerts, sync updates, weather advisories, emergency alarms. |
