# BAQUEANO WEBSITE - PHASE 2 REPORT

## Why

Phase 2 raises the web workspace from a visual scaffold to a more honest product foundation: UI, services, Firebase readiness, admin workflows, and known gaps are now separated instead of blended.

## How

Changes stayed inside `website/`. The Flutter Android app, `android/`, `lib/`, `test/`, and `pubspec.yaml` were not modified. Public Web and Control Center now consume service boundaries instead of hardcoded UI-only records where Phase 2 touched them.

## What

| COMPONENTE | ESTADO | EVIDENCIA | PENDIENTE |
|---|---|---|---|
| Auditoria inicial | REAL | `website/docs/PHASE_2_AUDIT.md` created with module matrix and mock inventory | Keep updating as modules become real |
| Android protection | REAL | Work stayed under `website/`; no Flutter app files modified | None for this phase |
| Firestore collection alignment | PARCIAL | `firestoreCollections` now includes `places`, `business_subscriptions`, `payment_orders`, `payment_transactions`, `audit_logs` | Confirm live indexes and env values |
| Android-compatible place contract | REAL | `PlaceRecord` mirrors Android `PlaceModel` field names | Add migration notes for future field additions |
| Zod validation | PARCIAL | `placeRecordSchema`, `categoryRecordSchema`, `auditLogSchema` available | Add schemas for every collection |
| Data layer | PARCIAL | `listPublishedPlaces`, `listPlacesForAdmin`, CRUD place methods, audit writer, generic list readers | Authenticated writes and server-only endpoints |
| `/destinos` explorer | PARCIAL | Search, department/category filters, sorting, visible count, empty state | Firestore env needed for live reads; save requires Auth |
| `/destinos/[slug]` | PARCIAL | Reads through service, source banner, Android-compatible fields | Full editorial sections, booking/contact actions |
| `/mapa` | PARCIAL | Clearly marked conceptual; consumes `places` service output | Real Google Maps adapter with restricted public key |
| Baqueano AI | PARCIAL | Explicit gateway status says frontend is not connected; `/api/baqueano-ai` returns 501 | Secure AI Gateway endpoint and real itinerary generation |
| Control Center destinations | PARCIAL | Reads through admin service and shared Firebase repository | Auth, RBAC guards, create/update/archive UI |
| Host panel | PARCIAL | `/mi-negocio` route added and scoped concept documented | Owner-enforced service queries and forms |
| Motion | PARCIAL | Hero motion and scroll progress exist; reduced motion supported | More scroll reveal and path animation with viewport testing |
| Loading/error states | PARCIAL | Public `loading.tsx`, `error.tsx`, `not-found.tsx` | Admin error states, offline state, permission screens |
| Visual breakpoint audit | REAL | Playwright report in `website/docs/visual-audit/report.md`; 70 checks passed after fixing admin grid overflow | Extend to every secondary route and interactive state |
| Firebase live connection | PENDIENTE | `.env.example` exists; fallback identifies seed source | Add `.env.local` and verify live reads |
| AI Gateway live connection | PENDIENTE | Frontend status boundary prevents false claim | Connect server-side gateway only |
| CRUD real | PENDIENTE | Repository methods exist for places | Secure forms, route guards, Firestore rules verification |
| Validation commands | REAL | `lint`, `typecheck`, and `build` pass after Phase 2 edits | Add automated visual tests |

## Screen Status

Public screens touched or reviewed:

- `/`
- `/destinos`
- `/destinos/[slug]`
- `/mapa`
- `/historia`
- `/territorios`
- `/territorios/[slug]`
- `/gastronomia`
- `/cultura`
- `/sostenibilidad`
- `/baqueano-ai`

Admin screens touched or reviewed:

- `/dashboard`
- `/destinos`
- `/mi-negocio`
- `/negocios`
- `/usuarios`
- `/auditoria`
- generic module routes

## Integration Truth

- Firebase is prepared but not confirmed live because no `.env.local` credentials were provided in `website/apps/web` or `website/apps/admin`.
- AI Gateway is not connected.
- Google Maps is not connected; `/mapa` is a conceptual map surface.
- CRUD UI is not connected; place repository methods exist, but real writes must wait for Auth/RBAC flow.

## Visual Audit Evidence

- Routes checked: `/`, `/destinos`, `/mapa`, `/dashboard`, `/destinos` admin.
- Widths checked: 320, 360, 375, 390, 412, 430, 768, 820, 1024, 1280, 1366, 1440, 1920, 2560.
- Result: 70 total checks, 0 failing checks.
- Evidence files: `website/docs/visual-audit/report.md`, `website/docs/visual-audit/report.json`, and screenshots in `website/docs/visual-audit/`.
