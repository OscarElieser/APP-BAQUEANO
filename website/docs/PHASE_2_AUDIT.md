# BAQUEANO WEBSITE - PHASE 2 AUDIT

## Why

This audit prevents Phase 1 scaffolding from being mistaken for real production integration. Baqueano must distinguish visual seed content from Firebase-backed behavior before expanding Web and Admin.

## How

The review inspected `website/apps/web`, `website/apps/admin`, `website/packages`, `website/docs`, existing Android directory models, and Firestore/Storage rules without modifying Flutter, Android, tests, or `pubspec.yaml`.

## What

Matrix of current state, integration truth, risk, required action, and priority.

| MODULO | ESTADO ACTUAL | REAL / MOCK | PROBLEMA | ACCION REQUERIDA | PRIORIDAD |
|---|---|---:|---|---|---:|
| `apps/web` shell | Next app compiles with navigation, SEO defaults, images, and public routes | PARCIAL | Visual foundation works, but content is static seed data | Add services that read Firestore and fall back explicitly to seed data | ALTA |
| Home hero | Cinematic Ometepe hero, coordinates, CTA, route SVG | PARCIAL | Motion exists only at entry; route is decorative | Add scroll progress, reduced-motion aware route animation, stronger mobile composition | ALTA |
| Public navigation | Desktop links and mobile panel | PARCIAL | Mobile panel is functional but visually simple | Improve overlay hierarchy, add current ecosystem status and touch ergonomics | MEDIA |
| `/destinos` | Search input, filter chips, destination grid | MOCK | Search/filter controls do not execute queries | Add client explorer with real local filtering and service-fed records | ALTA |
| `/destinos/[slug]` | Editorial detail from seed records | MOCK | Essential sections are placeholders; map and booking are not connected | Add map status, recommendations, conservation, contact states, and data source labels | ALTA |
| `/mapa` | Conceptual map surface with pins | MOCK | No Google Maps runtime integration; pins are projected manually | Document as conceptual, add adapter boundary for Google Maps without frontend secrets | ALTA |
| `/historia` | Timeline list | MOCK | Content is static and visually limited | Add scroll-led timeline and mark source as editorial seed | MEDIA |
| `/territorios` | 17 territory cards and details | MOCK | Territory detail pages are sparse | Add service boundary and richer local sections | MEDIA |
| `/gastronomia` | Dish cards with local images | MOCK | No business/map relationship yet | Add source labels and service-ready content shape | MEDIA |
| `/cultura` | Cultural category panels | MOCK | No Firestore content | Keep as editorial scaffold and connect later | MEDIA |
| `/sostenibilidad` | Metric tiles | MOCK | Metrics are illustrative | Label as seed metrics until Firestore impact collection exists | ALTA |
| `/baqueano-ai` | Structured AI interface | MOCK | Response is static and could be mistaken as generated | Mark as interface-only and create gateway client boundary | ALTA |
| `apps/admin` shell | Control Center layout with module navigation | PARCIAL | No authenticated session or route guard | Add RBAC helpers, protected data service contracts, and clear disconnected state | ALTA |
| Admin dashboard | KPI tiles and activity list | MOCK | KPIs are illustrative | Replace with service-fed records or label as seed dashboard | ALTA |
| Admin modules | All required routes exist | MOCK | Most routes use `ModulePlaceholder` | Build real list/read service layer first; CRUD later per collection | ALTA |
| Admin destinations | Static table | MOCK | Not connected to `places`/`destinations` collections | Use repository service with seed fallback and Android-compatible place contract | ALTA |
| `packages/types` | General models created | PARCIAL | Destination model does not mirror Android `PlaceModel` exactly | Add `PlaceRecord`, `CategoryRecord`, `DepartmentRecord`, `MunicipalityRecord` | ALTA |
| `packages/validators` | Destination schema exists | PARCIAL | Missing Android-compatible place/category/department validators | Add Zod schemas for real Firestore collection names | ALTA |
| `packages/firebase` | Firebase client initializer exists | PARCIAL | No repository/services layer; throws when env missing | Add safe availability check and collection services with explicit seed fallback | ALTA |
| `packages/config` | Routes, modules, collection names | PARCIAL | Collection names currently mix `destinations` and required `places` | Align primary collections with existing Firestore rules | ALTA |
| Error states | Public 404 exists | PARCIAL | Missing 500/offline/no-permission/Firebase unavailable states | Add reusable status components and route-level states over time | MEDIA |
| Accessibility | Focus rings, landmarks, alt text basics | PARCIAL | Needs visual breakpoint and keyboard audit | Run viewport checks and fix overflow/touch issues found | ALTA |
| Performance | Server components mostly preserved; images use `next/image` | PARCIAL | Framer Motion adds JS to hero/home; map is client-side | Keep client boundaries narrow and avoid app-wide `"use client"` | MEDIA |
| Firebase | Client package installed and configured via env | PARCIAL | No live project env in `website/apps/*/.env.local`; no real reads verified | Report as not connected until env and reads are confirmed | ALTA |
| AI Gateway | No gateway implementation | PENDIENTE | Static itinerary can mislead | Add interface-only copy and a service stub that never stores API keys in frontend | ALTA |
| CRUD | No create/update/archive flows | PENDIENTE | Buttons and modules are scaffolds only | Implement after auth/RBAC and service contracts | ALTA |

## Mock Inventory

- `featuredDestinations`, `territories`, `dishes`, and `historyPeriods` are development seed data.
- `/mapa` is a conceptual representation, not a Google Maps integration.
- `/baqueano-ai` is an interface prototype, not a live AI Gateway.
- Admin KPIs, activity rows, and destination rows are illustrative seed content.
- CRUD, payments, subscriptions, reservations, audit writes, and RBAC enforcement are not connected yet.

## Existing Firebase Signals

Firestore rules already reference:

- `places`
- `categories`
- `departments`
- `municipalities`
- `businesses`
- `business_subscriptions`
- `users`
- `user_saved_places`
- `payment_orders`
- `payment_transactions`
- `audit_logs`

Android directory models confirm `places`, `categories`, and `departments` should preserve existing field names.
