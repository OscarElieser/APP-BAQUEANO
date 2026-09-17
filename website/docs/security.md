# Security Baseline

## Why

The web ecosystem touches tourism content, user identity, host operations, and potentially reservations. Minimum privilege and validation protect travelers, hosts, and the Android data contract.

## How

- Authenticate through Firebase Authentication.
- Authorize admin routes with RBAC claims or role documents.
- Validate all writes with Zod before sending to Firestore.
- Enforce final rules in Firestore Security Rules and server-side endpoints.
- Keep secrets out of browser bundles.
- Log sensitive admin actions to audit records.

## What

Every write path must identify the actor, role, target collection, target document, timestamp, and before/after summary when practical.
