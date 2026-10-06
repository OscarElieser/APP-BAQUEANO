# BAQUEANO — architecture summary (run-1, profile quick, source-only)

## 1. Product, principals, authority, protected resources
BAQUEANO Nicaragua is a tourism and sustainability platform made of four parts:
- a public static website (`website/`), with the AI assistant BAQUI;
- the "Ops Center" admin (`website/admin.html` plus `website/js/ops-center/`);
- a Next.js admin (`website/apps/admin`);
- a Flutter Android app (`lib/`, `android/`).

**Principals**
- anonymous visitor;
- signed-in traveler (Firebase Auth, Google);
- Supabase Auth users (`turista`, `guia`, `emprendedor`);
- staff: `auditor`, `admin`, `super_admin`.

**Protected resources**
- Supabase PostgreSQL: places, businesses, reservations, SOS events, community posts and media, RBAC tables, audit logs, AI sessions, travel plans, analytics;
- Firestore and Storage legacy collections;
- the staff role assignment itself;
- the Azure VM;
- CI secrets: the Android keystore, the Firebase service account and the Anthropic key.

## 2. Comparable baseline
The Edge Functions follow Supabase's "third-party Firebase Auth" pattern. They verify the Firebase ID token with `jose` against the Google JWKS (issuer and audience `app-baqueano`), then act through a service-role client. The trade-off this pattern accepts is that per-row authorization moves from RLS into function code. Every service-role write therefore needs an explicit owner check in the function.

## 3. Stack, deployment, offline limits
**Stack and deployment**
- Static website: HTML and vanilla JS, built by `website/scripts/build-hostinger-static.mjs` and served by nginx on the Azure VM. Headers live in `azure/nginx/baqueano-security-headers.conf`; the CSP includes `script-src 'unsafe-inline'`.
- Azure API: `azure/api/server.js`, bound to 127.0.0.1:3000.
- VM deployment: `azure/autodeploy.sh` pulls `main` every 2 minutes.
- Supabase: 8 Deno Edge Functions, all `verify_jwt=false` except `baqueano-mirror`, which is not listed in `supabase/config.toml`. Also 52 SQL migrations with RLS and SECURITY DEFINER RPCs.
- Firebase: `firestore.rules` and `storage.rules`. The `functions/` HTTP API may not be deployed.
- CI: GitHub Actions.

**Offline limits**
- No deno, flutter, firebase emulator or Playwright browsers are available to target code.
- There is no assembled, verified OS sandbox and no tested artifact promoter.

So **all checks in this run are source-only**. Any claim that needs execution or deployed state is `needs_validation`.

## 4. Entry surfaces and key paths
1. **`baqueano-ai`** (`supabase/functions/baqueano-ai/index.ts`)
   - Unauthenticated, CORS `*`, no rate limit.
   - The body's `prompt` and `history` (the client chooses the role) go to Gemini with `url_context`.
   - Context comes from `_shared/baqueano-knowledge.ts`: `select(*)` with the service role.
   - Writes `travel_plans` with a client-supplied `userUid`; calls `baqui_log_exchange` with a client-supplied `sessionId`.
2. **`baqueano-mirror`**
   - Any Firebase user can call it.
   - `ownerOf()` reads ownership from the request body; it upserts on `doc_path` with the service role.
3. **Firestore client writes → staff/public DOM sinks**
   - Writes: `environmental_reports` (any user), `businesses` (owner).
   - Staff sink: `ops-engine.js` `renderTableRow` (4230-4290).
   - Public sink: `public-cms-sync.js` ally cards (564-650).
   - Both interpolate fields into `innerHTML` and `onclick`.
4. **Anonymous SECURITY DEFINER RPCs**
   - `track_event`, `track_commercial_action`, `submit_feedback` (rate limit keyed on the client-chosen `p_anonymous_id`).
   - `security_posture`, `public_impact_summary`.
   - Anon writes to `sprint_evidence_records` (`X-Proof-Token`).
   - `get_nearby_*` and `match_knowledge_documents` with default PUBLIC execute.
5. **Identity/RBAC**
   - `baqueano-identity`: `set_role`, `set_status`, `link_firebase`; the Firebase fallback actor has `profileId` null.
   - Role sources: `staff_roles`, `official_super_admins`, the claim `role`/legacy `admin`, and hard-coded email lists in the rules.
   - `sync_staff_roles` grants staff on Supabase signup once the email is confirmed.
6. **Other Edge Functions:** `baqueano-community`, `baqueano-reservas`, `baqueano-sos`, `baqueano-ops`.
   - Owner checks.
   - PostgREST `.or()` string building (`cleanId`, `safeSearch`).
   - Signed upload URLs with `inspectObject`.
   - Rate limits per UID.
7. **Firebase Functions** (`functions/lib/http.js`, deployment uncertain)
   - `/admin/crud` mass assignment.
   - `POST /reservations`.
   - CORS by suffix.
   - Rate limit trusts `X-Forwarded-For`.
8. **CI/CD**
   - `flutter_ci.yml` uses keystore secrets on same-repo PRs.
   - `claude-review.yml` gives an LLM write tokens.
   - `geocode-territories.yml` pushes to `main`.
   - VM autodeploy runs `deploy.sh` from `main` with sudo-capable systemd.
9. **Next admin API routes:** `api/auth/claims`, `api/ai/orchestrator`. **Azure API:** `/health`, `/evidence/crud`.

## 5. Trust boundaries and strongest visible control
| Boundary | Strongest visible control |
|---|---|
| anon → Edge Functions | in-function `jwtVerify` (`baqueano-ai` has none) |
| user → others' rows | owner checks in function code (`loadOwned`, cancel owner) and RLS restrictive policies |
| user → staff role | server-only `user_roles` and the `assertCanGrant` chain; Firebase claims set only via the Admin SDK |
| stored data → staff browser | none visible beyond ad hoc escaping, and the CSP allows inline script |
| anon → DB | RLS on every table plus SECURITY DEFINER validation |
| push to main → VM | branch protection [DEPLOY] |

## 6. Starting paths
- `supabase/functions/*/index.ts`, `supabase/functions/_shared/`, `supabase/migrations/*.sql`
- `firestore.rules`, `storage.rules`
- `website/js/ops-center/ops-engine.js`, `website/js/public-cms-sync.js`, `website/js/firestore-realtime.js`
- `functions/lib/*.js`, `website/apps/admin/src/app/api/**`, `azure/api/server.js`
- `.github/workflows/*.yml`, `azure/*.sh`

## 7. Prior coverage
- No prior run ledger exists for this repository; this is run-1.
- The in-repo `docs/audit/SECURITY_AUDIT.md` is prose. It is not a compatible ledger.
- One reconnaissance lead was rejected by direct DB query: the permissions `analytics.read`, `content.read`, `content.verify` and `roles.assign_staff` exist.

## 8. Companion selection
- **AI-AND-LLM:** BAQUI. Untrusted prompt and history, retrieval from DB rows, and the `url_context` tool.
- **CLIENT-SIDE:** stored data reaching `innerHTML`/`onclick` in staff and public pages.
- **WEB-PROTOCOL-AND-AUTH:** federated Firebase→Supabase identity, claims and the email-based role fallback.
- **DATA-ISOLATION-AND-LIFECYCLE:** owner scoping in the mirror, community and reservations; role revocation.
- **RESOURCE-EXHAUSTION-AND-AVAILABILITY:** anonymous RPC and AI endpoints with client-keyed limits.
- **SUPPLY-CHAIN-AND-RELEASE:** workflows, the commit-to-VM autodeploy, and the committed APK.
- **CLOUD-AND-DEPLOYMENT:** nginx, systemd sudo scope and the Azure API.

**Excluded**
- MEMORY-SAFETY-AND-BINARY: no native code is in scope.
- DESKTOP-MOBILE-AND-LOCAL-IPC: the Android app has no deep links, no exported components beyond the launcher, and no WebView.
- PROTOCOLS-RPC-AND-MESSAGING: no custom protocol or broker.
