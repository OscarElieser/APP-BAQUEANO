# BAQUEANO INTEGRATION STATUS

## Why

This document states only what is verifiably connected in the current `website/` workspace and avoids presenting seed data as production behavior.

## How

Status is based on local code review, existing Firebase rules, environment files, HTTP checks, visual audit output, and successful build output. A feature is not marked real unless a live integration was verified during this phase.

## What

| Integration | Status | Evidence | Pending |
|---|:---:|---|---|
| Firebase client setup | PARCIAL | `@baqueano/firebase` initializes from `NEXT_PUBLIC_FIREBASE_*` | Provide `.env.local` and verify live project reads |
| Firestore `places` | PARCIAL | Services and validators target `places`; Android `PlaceModel` field names mirrored | Live read/write verification |
| Categories/departments/municipalities | PARCIAL | Collection names and generic list readers exist | Typed screens and live queries |
| Businesses | PARCIAL | Collection and host route prepared | Owner-scoped Auth/RBAC queries |
| Firebase Auth | PENDIENTE | No verified web/admin login flow in Next apps | Auth UI, session provider, route guards |
| Storage | PENDIENTE | Storage accessor exists | Upload policies and image pipeline |
| Google Maps | PENDIENTE | `/mapa` is conceptual and labeled as such | Restricted key and real map adapter |
| Baqueano AI Gateway | PENDIENTE | API route returns 501; page labels gateway as pending | Secure server-side gateway |
| Payments | PENDIENTE | Admin scaffold only | Payment gateway contract and secure endpoints |
| Subscriptions | PARCIAL | Collection name and route scaffold exist | Billing workflow and role checks |
| Audit logs | PARCIAL | Schema and reader/writer helpers exist | Live write/read verification with authenticated actor |
