# Security Baseline

> **WHY:** protect identity, operations, and evidence without trusting clients.
> **HOW:** Firebase Auth, Custom Claims, deny-by-default rules, contract
> validation, and private Storage paths. **WHAT:** verifiable requirements for
> Web, Android, Control Center, and backend services.

## Why

The web ecosystem touches tourism content, user identity, host operations, and potentially reservations. Minimum privilege and validation protect travelers, hosts, and the Android data contract.

## How

- Authenticate through Firebase Authentication.
- Authorize admin routes exclusively with Firebase Auth Custom Claims. A role
  document, browser storage value, email allowlist, or hidden UI is never an
  authorization boundary.
- Validate all writes with Zod before sending to Firestore.
- Enforce final rules in Firestore Security Rules and server-side endpoints.
- Keep secrets out of browser bundles.
- Log sensitive admin actions to audit records.
- Keep App Check enforcement and Firebase API-key restrictions enabled in each
  deployed environment; neither mechanism replaces Auth or Security Rules.

## What

Every write path must identify the actor, role, target collection, target document, timestamp, and before/after summary when practical.

Client SDKs cannot write `audit_logs`, payment records, subscriptions, or rate
limits. Those records are emitted only by trusted backend code through the
Admin SDK. Verification evidence lives under
`trust/{resourceId}/evidence/{fileName}` and is readable/writable only by an
authenticated admin claim; accepted uploads are PDF, JPEG, PNG, or WebP up to
12 MiB. Public download URLs must not be persisted for that evidence.

The Storage-to-Firestore ownership checks target the standard `(default)`
Firestore database. A deployment using a named database must introduce and
test a separate ruleset instead of changing this path silently.
