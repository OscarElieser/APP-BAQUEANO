# FINDINGS-DETAIL — auditoría de seguridad 2026-10-06

> 🎯 **POR QUÉ:** dejar cada hallazgo con su traza en el código, para que se pueda revisar sin repetir la auditoría.
> ⚙️ **CÓMO:** generado desde `findings.json` (validado con `validate-findings.cjs`). El título y el estado están en español. Descripción, traza y evidencia son el texto técnico del verificador independiente, en inglés, sin editar.
> 📦 **QUÉ:** 10 registros, todos `needs_validation`: no hubo sandbox para ejecutar las reproducciones.

## 1. Autodeploy de la VM sin compuerta de CI y con sudo

- **Fingerprint:** `azure/autodeploy.sh:ungated-main-deploy-with-sudo`
- **Severidad estimada:** Alta (condicional)
- **Estado:** 🔴 Abierto: acción del propietario (protección de rama en main, alcance de sudo, compuerta de CI en autodeploy.sh)

**Descripción (verificador):** On the production VM, the systemd timer runs azure/autodeploy.sh every 2 minutes. The script fetches origin/main. When that commit differs from the one in health.json, it checks out origin/main and executes a copy of the newly checked-out azure/deploy.sh (autodeploy.sh:40-58). deploy.sh then runs code that the repository controls as user 'baqueano': `node scripts/build-hostinger-static.mjs` (deploy.sh:107) and `npm ci --omit=dev` in azure/api (deploy.sh:161), which runs dependency lifecycle scripts. deploy.sh also calls sudo non-interactively for install, ln, rm, sed, cp, grep, `nginx -t`, `systemctl reload nginx` and `systemctl restart baqueano-api` (deploy.sh:45-80, 167).

Several files show that this account has passwordless sudo, not just a narrow set of commands:
- The autodeploy unit says it omits NoNewPrivileges because deploy.sh needs "sudo sin contraseña del usuario administrador de Azure" (passwordless sudo of the Azure admin user), at baqueano-autodeploy.service:6-8.
- setup-server.sh lists "usuario con sudo (baqueano)" (a user with sudo, baqueano) as a prerequisite (setup-server.sh:18).
- No file in the repository narrows sudoers.

Nothing on the pull path checks CI status. The deploy-production.yml 'checks' job runs only on push to main and workflow_dispatch, not on pull_request, so the VM pull does not wait for it. Commits pushed with GITHUB_TOKEN, such as the geocode bot push, do not trigger that workflow at all.

The result: whoever can land a commit on main gets code execution as 'baqueano' on the VM. If sudoers is unrestricted, as the comments imply, that is root.

Corrections to the hunter's wording:
- /etc/baqueano/api.env is root:baqueano mode 640 (setup-server.sh:153-154), so 'baqueano' can already read it without sudo. Reading it is not part of the escalation.
- Running repository code as 'baqueano' on deploy is intended (autodeploy.sh:21-22). The security-relevant gaps are two: no binding to a passing CI run or an approved commit, and sudo rights broader than the fixed commands deploy.sh needs.

Whether this is a real escalation depends on two facts that are not in the repository: the sudoers scope of 'baqueano' and the branch protection on main.

**Causa raíz:** The pull-based deploy trusts the mutable origin/main ref alone, with no binding to a passing required CI run or an approved or attested commit. It executes repository code, including its own deploy script and npm lifecycle scripts, under an account that is expected to have passwordless sudo not limited to the fixed nginx and systemctl commands deploy.sh needs.

**Traza:**

| Tipo | Archivo:línea | Ámbito | Detalle |
|---|---|---|---|
| entrypoint | `.github/workflows/geocode-territories.yml:53` | geocode job, step 'Guardar resultado en main' | A workflow with contents: write runs `git push origin HEAD:main` directly. This shows main is expected to accept direct pushes, either unprotected or with github-actions[bot] as a bypass actor. A commit landed this way, or by any collaborator with direct push, is what the VM deploys. GITHUB_TOKEN pushes do not trigger deploy-production.yml, so its checks never run for such commits. |
| propagation | `azure/autodeploy.sh:51` | main() | Runs `git checkout --detach origin/main` whenever origin/main differs from the deployed commit in health.json. There is no CI status, signature, or attestation check. |
| propagation | `azure/autodeploy.sh:58` | main() | Runs `bash` on a temp copy of the newly checked-out azure/deploy.sh, so the commit on main controls the deploy script itself. |
| propagation | `azure/deploy.sh:107` | top-level build step | Runs the repository-controlled `node scripts/build-hostinger-static.mjs` as user baqueano. |
| sink | `azure/deploy.sh:45` | reload_nginx() | Calls `sudo install` non-interactively from the timer-driven service; further sudo calls follow at lines 46-80 and 167. The baqueano account therefore holds passwordless sudo. Repository code running as that user can call sudo for arbitrary commands unless sudoers is narrowed to these exact invocations. |

**Evidencia:**

- `azure/systemd/baqueano-autodeploy.service:6`: The comment says NoNewPrivileges is intentionally omitted because deploy.sh needs passwordless sudo of the Azure administrator user.
- `azure/systemd/baqueano-autodeploy.service:20`: The service runs as User=baqueano (line 17) and executes autodeploy.sh from the repository checkout.
- `azure/setup-server.sh:18`: The provisioning prerequisite names 'usuario con sudo (baqueano)', the sudo-capable administrator account. No sudoers narrowing exists anywhere in the repository.
- `.github/workflows/deploy-production.yml:30`: The workflow triggers only on push to main and workflow_dispatch. The 'checks' job (tests, build, i18n and SEO gates) never runs on pull_request, so it cannot be a required PR status check, and the VM pull does not wait for it.
- `azure/deploy.sh:161`: `npm ci --omit=dev` in azure/api runs dependency lifecycle scripts from the checked-out lockfile as baqueano.
- `azure/autodeploy.sh:40`: Fetches origin main on every run. The ref alone decides what executes.
- `azure/autodeploy.sh:21`: The source acknowledges that whoever can push to main can deploy, and leaves protection of main to GitHub settings that are not in the repository.

**Bloqueos:**

- No verified OS-enforced sandbox or tested artifact promoter in run-1, so the deploy chain could not be exercised locally.
- The sudoers scope of user 'baqueano' on vm-baqueano-prod is not in the repository. It decides whether a repository write becomes root or stays limited to the fixed nginx and systemctl commands.
- GitHub branch protection and rulesets on main are not observable from source: required reviews, required status checks, and bypass actors such as github-actions[bot] and admins.

**Plan de validación local:** On a disposable VM or container with systemd and dummy credentials only:
1. Create user 'baqueano' with a sudoers entry that copies production exactly.
2. Install baqueano-autodeploy.service and baqueano-autodeploy.timer.
3. Point REPO_DIR at a clone whose 'origin' is a local bare repository.
4. Push a fixture commit to that bare repository's main, where website/scripts/build-hostinger-static.mjs runs `sudo -n id -u > /tmp/marker` and exits non-zero so no release is activated.
5. Start the service once and read /tmp/marker. The value 0 confirms root execution; a sudo denial refutes the escalation step.

**Plan de validación en despliegue:** Owner checks, read-only:
1. On the VM, run `sudo -l -U baqueano` and `ls /etc/sudoers.d/`. Output such as '(ALL) NOPASSWD: ALL', for example from the cloud-init 90-cloud-init-users file, confirms a repository write gives root on the VM.
2. In GitHub, open Settings > Rules and Branches for main. Record whether PRs, reviews and status checks are required, and whether github-actions[bot], admins or other actors can bypass them.

Fix:
- Restrict sudoers for baqueano to the exact commands deploy.sh needs: fixed `install` targets, `nginx -t`, `systemctl reload nginx` and `systemctl restart baqueano-api`. Preferably use a root-owned wrapper that is not taken from the checkout.
- Make autodeploy deploy only a commit bound to a successful required check run, for example a tag or attested ref pushed by the workflow after 'checks' passes.
- Add the 'checks' job to the pull_request trigger so branch protection can require it.
- Remove direct bot pushes to main, or make them go through a PR.

## 2. BAQUI pública sin límite: gasto de Gemini e inflado de KPIs

- **Fingerprint:** `baqueano-ai:anonymous-unmetered-gemini-and-persistent-writes`
- **Severidad estimada:** Media
- **Estado:** 🟡 Corregido en código y BD (presupuesto por IP con hash y global, migración 20261006070000 aplicada y probada). La Edge Function falta desplegar

**Descripción (verificador):** At a25cb23, baqueano-ai is deployed with verify_jwt=false (supabase/config.toml:8-10). It sends CORS * (index.ts:50-55), and its Deno.serve handler (index.ts:456-490) has no authentication, rate limit, or per-principal or global budget. An anonymous caller can POST prompts repeatedly. Each request runs 13 parallel service-role catalog queries (baqueano-knowledge.ts:24-32, 43-57). Each planning-intent request then makes one Gemini url_context interaction on the operator's key, tried against every configured key in turn (index.ts:222-235). It also makes one durable service-role travel_plans insert (index.ts:592-610) and one baqui_log_exchange call (session upsert plus message inserts, index.ts:620ff). A non-greeting tourism prompt without sufficient internal knowledge also triggers a Gemini url_context call (index.ts:399-405) and a log entry. sessionKey is client-chosen or random (index.ts:486-487), so no session-based accounting exists. The anon-executable public_impact_summary() (impact_alignment.sql:408-441) counts all travel_plans rows as itinerarios_generados and all user ai_messages as consultas_baqui (lines 428-429). The public page website/nosotros.html:480 displays itinerarios_generados through website/js/impact-public.js:119. sesiones_baqui (line 353) belongs to the authenticated-only strategic_impact_report, not the public summary. An anonymous attacker can therefore inflate publicly displayed impact figures at will. They can also consume the shared Gemini quota or spend, which can deny BAQUI's grounded answers to other users. Whether deployed gateway, provider quota, or billing caps bound this is not visible in source.

**Causa raíz:** baqueano-ai has no authentication, rate limit or per-request budget before operator-paid Gemini calls and durable service-role writes. Its accounting has no principal or network dimension, because sessionKey is client-chosen. Public KPIs count those unauthenticated rows without filtering.

**Traza:**

| Tipo | Archivo:línea | Ámbito | Detalle |
|---|---|---|---|
| entrypoint | `supabase/functions/baqueano-ai/index.ts:456` | Deno.serve | Anonymous POST handler with no auth or rate-limit check. CORS * at lines 50-55; verify_jwt=false in supabase/config.toml:10. |
| propagation | `supabase/functions/_shared/baqueano-knowledge.ts:43` | BaqueanoKnowledgeService.search | 13 parallel service-role select(*) queries per request (SEARCH_DOMAINS, lines 24-32), called from index.ts:489. |
| propagation | `supabase/functions/baqueano-ai/index.ts:223` | buildGroundedItinerary | Additional sink on the same path: Paid Gemini interactions call with url_context on every planning request, retried across all configured keys (lines 222-235). |
| propagation | `supabase/functions/baqueano-ai/index.ts:597` | Deno.serve | Additional sink on the same path: Durable service-role travel_plans insert on every planning request (lines 592-610). |
| sink | `supabase/migrations/20261005070000_impact_alignment.sql:428` | public_impact_summary | Anon-executable (line 441) public KPI counts all travel_plans (itinerarios_generados) and user ai_messages (consultas_baqui, line 429). |

**Evidencia:**

- `supabase/functions/baqueano-ai/index.ts:400`: buildGroundedTourismAnswer also calls Gemini url_context for non-greeting tourism prompts when internal knowledge is insufficient (call site index.ts:522).
- `supabase/functions/baqueano-ai/index.ts:487`: Session key is client-chosen, or randomly generated when absent or invalid; no per-principal or per-IP accounting.
- `supabase/config.toml:10`: verify_jwt = false for baqueano-ai, so the platform requires no user JWT.
- `website/nosotros.html:480`: Public page renders itinerarios_generados from public_impact_summary, fetched by website/js/impact-public.js:119.

**Bloqueos:**

- No verified OS-enforced sandbox or tested artifact promoter in run-1, so the local reproduction cannot be executed.
- Not visible in source and decisive for shared impact: Supabase Edge gateway or platform invocation limits, any WAF in front of /functions/v1, and the Gemini API keys' quota and billing caps or alerts.

**Plan de validación local:** Source confirms no limiter on the path. In an approved sandbox with no network, run the function against a local Supabase stack and stub fetch to generativelanguage.googleapis.com with a call counter. Send 5 sequential planning POSTs, for example {"prompt":"planifica un itinerario de 3 dias en Granada"}, without an Authorization header. Expect 5 stubbed Gemini calls, 5 new travel_plans rows, and public_impact_summary().itinerarios_generados increased by 5. Stop there; no load testing. Suggested fix: require a verified Firebase token, or a DB-backed per-IP and per-session token bucket like the other functions' per-UID limits, before any model call or write. Exclude unauthenticated or anonymous rows from public KPIs.

**Plan de validación en despliegue:** Owner-observed, non-destructive: check the Gemini key quota, billing caps and alerts in Google AI Studio or Cloud console. Check Supabase Edge Function invocation limits and any WAF or rate-limiting rule for /functions/v1/baqueano-ai. Check how many travel_plans and ai_messages rows have null user_uid or user_id, as a baseline for KPI inflation.

## 3. Recuperación de BAQUI ignoraba el estado de publicación

- **Fingerprint:** `baqueano-ai:knowledge-service-role-bypasses-publication-rls`
- **Severidad estimada:** Media
- **Estado:** 🟡 Corregido en código (filtro de publicación igual a RLS y campos privados removidos). Falta desplegar

**Descripción (verificador):** The baqueano-ai Edge Function has verify_jwt=false (supabase/config.toml:8-10), has no in-function authentication, and allows CORS *. An anonymous POST with any prompt reaches BaqueanoKnowledgeService.search. That runs select('*') on 13 catalog tables through a client built with SUPABASE_SERVICE_ROLE_KEY. The only filter is an ilike on each table's name or title column. There is no status, deleted_at or is_published predicate. The anon RLS policies expose only published rows: businesses where status='published' and deleted_at is null, places where is_published, and culture, heritage, museums, gastronomy, communities, routes and experiences where status='published'. The service role bypasses all of them. For every intent except 'impact' and 'planning', the JSON response 'sources' array returns {id, label, entityType} for every matched row. That includes draft, pending_review, rejected and archived businesses, soft-deleted rows, and unpublished places and experiences. When the 'tourism' intent is internally sufficient, up to 8 of those titles also go into the message text. This works as a name-search existence and identifier oracle for unpublished content. When no deterministic answer applies, the full rows go into the Gemini prompt via JSON.stringify, truncated to 8000 chars, and the model's free text is returned to the caller. For unpublished rows that context includes owner_uid, email, phone, whatsapp, commission_rate and metadata. Correction to the hunter's wording: the private-column claim crosses a boundary only for unpublished or deleted rows. No migration revokes column-level SELECT on businesses, so anon can already read every column of published businesses through PostgREST. Secondary note: a business manager may update the 'name' column of their own row (identity_rbac_foundation.sql:432-437). Text placed there enters other anonymous visitors' Gemini context next to other rows. This is only a prompt-injection surface: the model has no side-effecting tool.

**Causa raíz:** BaqueanoKnowledgeService (supabase/functions/_shared/baqueano-knowledge.ts:45-48) runs select('*') through the service-role client that baqueano-ai/index.ts:484-489 hands it. It does not reapply the publication predicate that RLS enforces for anon: status='published' AND deleted_at IS NULL, or is_published for places. It also has no public-column allowlist. The retrieved ids, titles and full payloads then reach the unauthenticated response and the model prompt.

**Traza:**

| Tipo | Archivo:línea | Ámbito | Detalle |
|---|---|---|---|
| entrypoint | `supabase/functions/baqueano-ai/index.ts:456` | Deno.serve | Unauthenticated handler (verify_jwt=false in supabase/config.toml, CORS *); the prompt comes from body.prompt or body.message at line 472 |
| propagation | `supabase/functions/baqueano-ai/index.ts:485` | Deno.serve | Supabase client created with SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS |
| propagation | `supabase/functions/baqueano-ai/index.ts:489` | Deno.serve | BaqueanoKnowledgeService(supabase).search(prompt) runs on the service-role client before intent routing |
| propagation | `supabase/functions/_shared/baqueano-knowledge.ts:45` | BaqueanoKnowledgeService.search | Additional sink on the same path: select('*') per domain table, filtered only by a name/title ilike (lines 46-48); no status, deleted_at or is_published filter; the full row is kept as the payload (line 52) |
| propagation | `supabase/functions/baqueano-ai/index.ts:537` | Deno.serve conversation response | Additional sink on the same path: Returns id, label and entityType of every retrieved row to the anonymous caller for greeting, farewell, thanks, help and tourism intents |
| propagation | `supabase/functions/baqueano-ai/index.ts:312` | internalKnowledgeAnswer | Additional sink on the same path: Up to 8 retrieved titles placed in the response message when the tourism intent is internally sufficient (used at line 521) |
| sink | `supabase/functions/baqueano-ai/index.ts:388` | buildGroundedTourismAnswer | JSON.stringify of the full retrieved rows (up to 8000 chars) placed in the Gemini prompt; the model output is returned as the message at line 523 |

**Evidencia:**

- `supabase/migrations/20261005080000_supabase_source_of_truth.sql:162`: anon and authenticated may select businesses only where status='published' and deleted_at is null
- `supabase/migrations/20261005080000_supabase_source_of_truth.sql:109`: places are readable by anon and authenticated only when is_published
- `supabase/migrations/20261005052200_traceability_3_status_fields.sql:33`: businesses.status defaults to 'draft'; the CHECK at line 39 allows draft, pending_review, rejected and archived, so unpublished rows exist by design
- `supabase/migrations/20261005052200_traceability_3_status_fields.sql:64`: businesses gains email, website_url and opening_hours columns
- `supabase/migrations/001_initial_schema.sql:106`: businesses has owner_uid, phone, whatsapp, commission_rate and metadata columns (lines 106-122)
- `supabase/migrations/012_comprehensive_cultural_and_ops_schema.sql:648`: experiences are readable only when status='published'; the same applies to culture, heritage, museums, gastronomy, communities and routes at lines 612-642
- `supabase/migrations/20261005040000_identity_rbac_foundation.sql:432`: authenticated business managers may update name and other fields of their own business row, a writable path into other visitors' BAQUI context
- `supabase/config.toml:10`: baqueano-ai is deployed with verify_jwt = false

**Bloqueos:**

- Decisive observation requires execution: run-1 has no verified OS-enforced sandbox or tested artifact promoter, and no deno or local Supabase stack. The service-role read of unpublished rows and their appearance in the 'sources' array could not be reproduced against dummy rows.
- Disclosure of unpublished rows' private columns through the model free text depends on Gemini behavior, which cannot be observed locally without a stub.
- Production impact depends on data state: whether unpublished or soft-deleted rows exist in the 13 tables, and whether the deployed function has SUPABASE_SERVICE_ROLE_KEY set. Neither is observable from source.

**Plan de validación local:** 1. In a disposable local Supabase with migrations applied up to a25cb23, insert a dummy business id 'zz-draft-1', name 'Zeta Prueba Borrador', status 'draft', email 'dummy@example.invalid', owner_uid 'dummy-owner'. 2. Insert a second dummy business id 'zz-del-1', name 'Zeta Prueba Borrada', status 'published', deleted_at now(). 3. Serve baqueano-ai locally with the local service key. Stub fetch to generativelanguage.googleapis.com so it records the request body and returns a fixed reply. 4. POST {"prompt":"Zeta Prueba"} with no Authorization header. 5. Expected: sources contains ids zz-draft-1 and zz-del-1, and the recorded Gemini request body contains dummy@example.invalid and dummy-owner. 6. Run the same select with the anon key and confirm both rows are hidden. 7. Stop at that observation. Fix: in SEARCH_DOMAINS, give each domain its publication predicate (.eq('status','published').is('deleted_at',null) for businesses, .eq('is_published',true) for places, .eq('status','published') for culture, heritage, museums, gastronomy, communities, experiences and routes, status in ('published','historical') for events) and an explicit public column list instead of '*'. Alternatively, run retrieval with an anon-key client. Add a regression test asserting that draft or deleted rows never appear in sources or in the model context.

**Plan de validación en despliegue:** Owner-only, read-only checks: count rows in businesses where status <> 'published' or deleted_at is not null; count places where not is_published; count unpublished rows in experiences, culture, heritage, museums, gastronomy, communities, routes and events. This sizes the exposure. Confirm whether the deployed baqueano-ai has SUPABASE_SERVICE_ROLE_KEY set and verify_jwt=false. Do not probe the deployed endpoint.

## 4. travel_plans guardado con un userUid enviado por el cliente

- **Fingerprint:** `baqueano-ai:travel_plans-unverified-userUid`
- **Severidad estimada:** Baja-Media
- **Estado:** 🟡 Corregido en código (user_uid null hasta verificar token). Falta desplegar

**Descripción (verificador):** At a25cb23 the baqueano-ai Edge Function runs with verify_jwt=false (supabase/config.toml:8-10) and never verifies a token: there is no jwtVerify or jose use, and the only 'authorization' string is the CORS allow-header at line 53. The handler sets userUid = String(body.userUid) (index.ts:479). For any prompt classified as 'planning', it inserts a travel_plans row with user_uid: userUid through a client built from SUPABASE_SERVICE_ROLE_KEY (index.ts:592-610), so RLS does not apply. The header comment (index.ts:28-29) says body.userUid is unverified. That is why it is not passed to baqui_log_exchange, but it is still written to travel_plans. The canonical migration revokes all privileges on travel_plans from anon and authenticated (20260929005610:74-75) and drops the old insert/select policies (66-67), so the server is the intended authority for row ownership. user_uid is free TEXT with no FK (001_initial_schema.sql:181). The only per-user reader in source is GET /api/travel-plans in functions/lib/http.js:536-545. It verifies the Firebase token and returns the 25 newest travel_plans rows where user_uid = auth.user.uid. A forged row would therefore appear in the victim's list, and a flood of rows would push the victim's real plans out of that 25-row window. The attacker controls the content of the stored payload: travelStyle has no length bound (index.ts:476) and is embedded in summary and travelStyle (573, 577); the prompt also feeds the grounded itinerary. The website defines BaqueanoApi.travelPlans() (website/js/baqueano-api.js:89) but nothing in website/ or lib/ calls it. baqueano-ops reads travel_plans only as an aggregate count (baqueano-ops/index.ts:132). So the source does not show a victim-facing consumer that is deployed and reachable. Impact is limited to the integrity of the victim's saved-plan list and inflated itinerary counts. No disclosure follows from this path.

**Causa raíz:** The ownership field of a durable row (travel_plans.user_uid) comes from an unauthenticated request body rather than a verified identity. The service-role client then bypasses RLS, and the canonical migration made the server the sole writer for that table.

**Traza:**

| Tipo | Archivo:línea | Ámbito | Detalle |
|---|---|---|---|
| entrypoint | `supabase/functions/baqueano-ai/index.ts:456` | Deno.serve | Public handler with verify_jwt=false and CORS *. It parses the JSON body with no token verification anywhere in the handler. |
| propagation | `supabase/functions/baqueano-ai/index.ts:479` | Deno.serve | userUid = body.userUid ? String(body.userUid) : null. Client-chosen, with no validation or binding to any identity. |
| propagation | `supabase/functions/baqueano-ai/index.ts:476` | Deno.serve | travelStyle is taken from the body with no length or enum bound. It is embedded in localItinerary.summary and travelStyle (lines 573, 577) and passed to buildGroundedItinerary (547). |
| propagation | `supabase/functions/baqueano-ai/index.ts:600` | Deno.serve travel_plans insert | Additional sink on the same path: A service-role client (supabaseKey = serviceKey, lines 592-596) inserts into travel_plans with user_uid: userUid and payload: generatedItinerary. |
| sink | `functions/lib/http.js:542` | GET /travel-plans | Returns the 25 newest travel_plans rows where user_uid equals the verified Firebase uid, so forged rows appear in the victim's list and can push out real plans. |

**Evidencia:**

- `supabase/functions/baqueano-ai/index.ts:28`: Header comment states that the body's userUid is not stored as identity because it is unverified. The travel_plans insert at line 600 still uses it.
- `supabase/config.toml:10`: verify_jwt = false for functions.baqueano-ai. The gateway does not require a JWT.
- `supabase/migrations/20260929005610_canonical_supabase_data_layer.sql:74`: REVOKE ALL on travel_plans from anon and authenticated, and the old user policies are dropped (66-67), making server-side paths the only writers.
- `supabase/migrations/001_initial_schema.sql:181`: travel_plans.user_uid is TEXT with no foreign key, so any string is accepted.
- `website/js/baqueano-api.js:89`: travelPlans() client wrapper for GET travel-plans is defined. No call site was found in website/ or lib/ at a25cb23.

**Bloqueos:**

- No verified OS-enforced sandbox or tested artifact promoter in run-1, so the write and read path cannot be executed locally.
- Whether the Firebase functions/ HTTP API (GET /api/travel-plans) is deployed is uncertain, and no UI calls BaqueanoApi.travelPlans(). A victim-facing consumer of forged rows is therefore not established from source. baqueano-ops only counts travel_plans.

**Plan de validación local:** In a sandbox with a local Supabase stack, the migrations applied and Gemini stubbed or unset (the local-catalog itinerary path), POST to baqueano-ai with no Authorization header and the body {"prompt":"planifica un itinerario de 2 dias","userUid":"dummy-victim-uid","travelStyle":"MARKER-123"}. Confirm that the response contains a planId and that SELECT user_uid, payload->>'travelStyle' FROM travel_plans WHERE id = planId returns dummy-victim-uid / MARKER-123. Then invoke the functions/lib/http.js /travel-plans GET handler with verifyAuth mocked to return uid 'dummy-victim-uid', and confirm the MARKER row is listed. Stop there. Fix: verify a Firebase ID token with jose, as the sibling functions do, and use its sub (store null when unauthenticated); bound travelStyle to an enum or a short length.

**Plan de validación en despliegue:** Owner check, read-only: confirm whether the Firebase HTTP API exposing /api/travel-plans is deployed. Confirm whether any client (web mi-viaje, Android app, Ops Center) lists travel_plans by user_uid. Check whether the deployed baqueano-ai matches a25cb23 (no token check, service-role insert using body.userUid).

## 5. La revocación en RBAC no aplicaba a quien entra por Firebase

- **Fingerprint:** `baqueano-identity:resolveActor:staff_roles-firebase-fallback-ignores-rbac-revocation`
- **Severidad estimada:** Media
- **Estado:** 🟡 Corregido en código en identity, ops, sos, reservas y community (_shared/staff-revocation.ts). Falta desplegar

**Descripción (verificador):** baqueano-identity treats user_roles plus profiles.status as the staff authority. Its set_role revoke (L409) deletes only the user_roles row. Its set_status (L436-440) updates only profiles.status and bans the Supabase Auth user. resolveActor (L188-217) also has a second identity path. When a request has no usable Supabase bearer but sends an x-firebase-token, the token is verified with jose against Google's JWKS (iss and aud app-baqueano). If the uid has no identity_links row, the actor gets its roles straight from staff_roles, matched by the verified email with is_active=true (L213-214). That actor has profileId null and no profiles.status check; that check exists only in actorFromProfile (L153). Revocation, suspension and blocking therefore have no effect on an unlinked Firebase login. At a25cb23 nothing in the source writes staff_roles: it is only seeded by migrations 20261005000000 L45-48 and 20261005010000 L8. Consequences: a revoked or suspended admin keeps users.read, users.update, users.suspend, users.assign_role, users.invite, businesses.update, businesses.verify and verifications.review (migration 20261005040000 L148-153). A revoked superadmin also keeps roles.assign_staff and roles.assign_superadmin. Because profileId is null, the self-modification guard (L262) and the self-approval guard (L522) never match. The person can resolve their own verification requests and, once their user_roles hold no admin role, run set_status active on their own profile to clear the suspension and the Supabase ban. The only precondition is that the person never ran link_firebase, which is optional, and that their Firebase (Google) account is still usable. The same staff_roles-only role source is also read by baqueano-ops L241, baqueano-sos L110, baqueano-reservas L133 and baqueano-community L192, so revocation through baqueano-identity does not reach those functions either.

**Causa raíz:** Staff authority has two unsynchronized sources inside the same function: user_roles with profiles.status (via actorFromProfile), and staff_roles keyed by verified email (via the unlinked Firebase fallback in resolveActor). set_role revoke and set_status mutate only the first source. sync_staff_roles copies staff_roles into user_roles one way only, at signup and email confirmation. The fallback never looks up the Supabase profile with the same email to check its status or user_roles.

**Traza:**

| Tipo | Archivo:línea | Ámbito | Detalle |
|---|---|---|---|
| entrypoint | `supabase/functions/baqueano-identity/index.ts:605` | Deno.serve | Every action except link_firebase resolves the actor via resolveActor; supabase/config.toml sets verify_jwt=false for baqueano-identity, so any caller reaches it. |
| propagation | `supabase/functions/baqueano-identity/index.ts:202` | resolveActor | If no usable Supabase bearer is sent (omitting it avoids the actorFromProfile status check at L191-199), it reads x-firebase-token and verifies it with jose (L204, L161-171; iss https://securetoken.google.com/app-baqueano, aud app-baqueano). |
| propagation | `supabase/functions/baqueano-identity/index.ts:207` | resolveActor | Only a uid with an identity_links row goes through actorFromProfile (L208), which enforces profiles.status=='active' and user_roles. |
| propagation | `supabase/functions/baqueano-identity/index.ts:213` | resolveActor | Unlinked uid with email_verified=true: role read from staff_roles where email equals the verified Firebase email and is_active=true; super_admin is mapped to superadmin (L214). |
| propagation | `supabase/functions/baqueano-identity/index.ts:216` | resolveActor | Additional sink on the same path: Returns an actor with permissionsFor(staff role) and profileId null. No profiles.status or user_roles lookup happens, and requirePermission (L135-138) then authorizes staff actions. |
| sink | `supabase/functions/baqueano-identity/index.ts:419` | handle:set_status | Example staff action reachable by the revoked or suspended principal (users.suspend). With profileId null, assertCanManageTarget's self-check (L262) is skipped. decide_verification (L515, self-check L522) and the list/get/update_profile actions are equally reachable. |

**Evidencia:**

- `supabase/functions/baqueano-identity/index.ts:409`: set_role revoke deletes only the user_roles row; staff_roles is untouched.
- `supabase/functions/baqueano-identity/index.ts:436`: set_status updates profiles.status, and L440 bans the Supabase Auth user. Neither touches staff_roles, identity_links or the Firebase account, and the unlinked fallback never reads profiles.
- `supabase/functions/baqueano-identity/index.ts:153`: The profile status check exists only in actorFromProfile, which the unlinked Firebase path does not call.
- `supabase/functions/baqueano-identity/index.ts:262`: The self-modification guard depends on actor.profileId being truthy, and profileId is null on the fallback path.
- `supabase/functions/baqueano-identity/index.ts:522`: The self-approval guard compares applicant_id with a.profileId (null), so a fallback actor can decide their own verification request.
- `supabase/migrations/20261005040000_identity_rbac_foundation.sql:312`: sync_staff_roles copies active staff_roles into user_roles one way only. There is no reverse sync and no trigger that keeps the two sources consistent.
- `supabase/migrations/20261005040000_identity_rbac_foundation.sql:151`: The permission matrix gives admin and superadmin users.update, users.suspend, users.assign_role, users.invite, businesses.update, businesses.verify and verifications.review. Superadmin also gets roles.assign_staff and roles.assign_superadmin (L155).
- `supabase/migrations/20261005000000_staff_roles_rbac.sql:45`: staff_roles is seeded with active super_admin and admin emails. No function or migration at a25cb23 ever sets is_active=false or deletes rows on revocation; a grep for staff_roles writers finds only migration seeds and tests.

**Bloqueos:**

- No verified OS-enforced sandbox or artifact promoter in run-1, so the function cannot be executed against a local Supabase stack with dummy users. The decisive accept/deny result is therefore not observed.
- Whether operators manually set staff_roles.is_active=false, delete the row, or disable the Firebase account when they revoke or suspend staff is operational state that the source does not show. Exploitability requires the staff_roles row and the Firebase account to stay active after set_role revoke or set_status, and nothing in the source changes either one.
- Whether the affected staff member has an identity_links row in the deployed database (the fallback applies only to an unlinked Firebase uid) is deployed data, not source.

**Plan de validación local:** Inside an isolated sandbox running a local Supabase stack with migrations applied and dummy data only: (1) insert staff_roles ('dummy-admin@example.test','admin',true) and create Supabase user A with that email confirmed, so sync_staff_roles gives A user_roles admin; create dummy superadmin S; do not insert identity_links for A. (2) Use a test-only copy of baqueano-identity in which the hard-coded Google JWKS URL (L43) points to a local test JWKS. Mint a token for uid 'dummy-uid-A' with iss https://securetoken.google.com/app-baqueano, aud app-baqueano, email dummy-admin@example.test and email_verified=true. (3) As S (Supabase bearer), call set_role {id:A, role:'admin', grant:false, reason:'test'} and then set_status {id:A, status:'blocked', reason:'test'}. (4) Call baqueano-identity {action:'list'} with no Authorization bearer and only x-firebase-token. Vulnerable: 200 with directory rows. Fixed: 401 or 403. Stop at that single read; optionally also call set_status on a second dummy user to observe 200 versus 403. Make no other mutations.

**Plan de validación en despliegue:** Owner-observed, non-destructive: for each staff member previously revoked or suspended via the Ops Center, query staff_roles (email, is_active) and identity_links (provider='firebase', profile_id) with the service role. Any row that is still is_active=true and has no identity_links entry is exposed. Optionally, revoke a dedicated test staff account, sign in to the Ops Center with only its Firebase Google login, and confirm whether the users directory still loads.

## 6. baqueano-mirror: un usuario podía pisar filas de otro

- **Fingerprint:** `baqueano-mirror/ownerOf-request-derived-owner`
- **Severidad estimada:** Media (integridad)
- **Estado:** 🟡 Corregido en código (dueño tomado de la fila guardada, 403 si no coincide). Falta desplegar

**Descripción (verificador):** At a25cb23, baqueano-mirror verifies the Firebase ID token (issuer and audience app-baqueano) and then derives the document owner only from the request. For users/* paths the owner comes from the path. For every other path it comes from owner fields in the body (OWNER_FIELDS), and it is null for op=delete or when the body has no owner field. The only non-admin owner check is `owner && owner !== uid`, so it passes when the owner is null or when the caller sets it to their own uid. The existing row is read for version and data only; its owner_uid is never compared. The service-role upsert onConflict doc_path then replaces whatever row sits at that path. As a result, any signed-in Firebase user can do the following on any doc_path whose collection (the last collection segment) is a non-users OWNER_WRITABLE collection (businesses, travelPlans, reservation_requests, sos_logs, environmental_reports, registro_negocios, messages, user_saved_places):
- send {path:'businesses/<victimId>', op:'set'|'update'|'add', data:{...}} with no owner field or with ownerUid=<self>, which replaces the victim's mirrored data and sets owner_uid to the attacker's uid;
- send {op:'delete'}, which sets deleted=true on the victim's row.
The function never checks that a matching Firestore write happened. It can therefore plant content that firestore.rules forbids, for example a businesses row with verified=true or status=published. This contradicts the function's own claim that it applies 'the same rules as firestore.rules': Firestore binds updates to the stored resource.data.ownerUid. The table is private: RLS is on and all privileges are revoked from anon and authenticated. The effect is therefore integrity loss of the Supabase copy, not disclosure. Its real impact depends on whether anything consumes the mirror as authoritative.

**Causa raíz:** ownerOf() (supabase/functions/baqueano-mirror/index.ts:88-98) returns an owner taken from the request: from the path for users/*, otherwise from body.data owner fields, or null. The non-admin authorization at line 153 rejects only when that request-derived owner is non-null and differs from the caller's uid. The pre-write read at line 160 selects 'version, data' but not owner_uid, so the stored owner is never checked before the service-role upsert onConflict doc_path at line 175. Line 166 then writes owner_uid = owner ?? uid, which hands ownership of the victim's row to the attacker.

**Traza:**

| Tipo | Archivo:línea | Ámbito | Detalle |
|---|---|---|---|
| entrypoint | `supabase/functions/baqueano-mirror/index.ts:100` | Deno.serve | Public POST handler. Lines 106-119 accept any valid app-baqueano Firebase ID token in x-firebase-token; uid is taken from sub. |
| propagation | `supabase/functions/baqueano-mirror/index.ts:145` | Deno.serve | owner = ownerOf(collection, segments, data): taken from the request body, or null for op=delete (data is null at line 130) or when the body has no owner field |
| propagation | `supabase/functions/baqueano-mirror/index.ts:153` | Deno.serve | Non-admin check `if (owner && owner !== uid)`: a null owner or an owner the caller sets to itself passes |
| propagation | `supabase/functions/baqueano-mirror/index.ts:160` | Deno.serve | Existing-row read selects only 'version, data'; the stored owner_uid is never compared with uid |
| sink | `supabase/functions/baqueano-mirror/index.ts:175` | Deno.serve | Service-role upsert onConflict doc_path replaces the victim's row: new data, owner_uid set to the attacker's uid, or deleted=true |

**Evidencia:**

- `supabase/functions/baqueano-mirror/index.ts:88`: ownerOf derives the owner from the path (users/* only) or from body fields in OWNER_FIELDS, never from the stored record
- `supabase/functions/baqueano-mirror/index.ts:130`: For op=delete, data is null, so ownerOf returns null for non-users paths and the line-153 check is skipped
- `supabase/functions/baqueano-mirror/index.ts:166`: owner_uid: owner ?? (isAdmin ? null : uid): an attacker's write takes over owner_uid at the victim's doc_path
- `supabase/functions/baqueano-mirror/index.ts:16`: Header comment claims the function applies 'the same rules as firestore.rules', including 'user documents → their own uid'
- `firestore.rules:173`: Intended businesses policy: create requires ownerUid==auth.uid, status pending_review and verified false; updates require the existing resource.data.ownerUid==auth.uid and keep ownerUid, status and verified unchanged. The mirror enforces none of this against the stored row.
- `supabase/migrations/20261003200000_firestore_mirror.sql:18`: doc_path is the primary key, so all users share one global namespace and the upsert replaces the existing owner's row
- `supabase/migrations/20261003200000_firestore_mirror.sql:40`: Privileges revoked from anon and authenticated, so the Edge Function is the only enforcement layer and no direct disclosure path exists (integrity only)

**Bloqueos:**

- No verified OS-enforced sandbox or tested artifact promoter exists in run-1, so the Edge Function cannot be run locally with dummy Firebase users to observe the overwrite
- Impact depends on whether firestore_mirror is or will be consumed as a migration, restore or source-of-truth copy. At a25cb23 the only source readers are a row count (baqueano-ops/index.ts:141 and the ops copilot metric). SESSION_LOG records the table as holding 0 rows on 2026-10-04.
- Victims' Firestore document IDs in the non-users OWNER_WRITABLE collections must be known or guessable. Auto-IDs are random; any predictable or uid-based IDs are not visible from source.

**Plan de validación local:** In a local Supabase stack, serve baqueano-mirror with the JWKS/issuer pointed at a Firebase Auth emulator issuing tokens for dummy users A and B, using non-sensitive fixtures only. (1) B POSTs {path:'businesses/biz1',op:'set',data:{ownerUid:'<B>',name:'b'}}. Expect 200; firestore_mirror owner_uid=B. (2) A POSTs {path:'businesses/biz1',op:'set',data:{name:'x',verified:true}}. Expect 200; row now has owner_uid=A, data.verified=true, version=2. (3) A POSTs {path:'businesses/biz1',op:'delete'}. Expect 200; deleted=true. Stop there. Fix to verify: select owner_uid in the line-160 read; for non-admins, reject when existing.owner_uid is set and differs from uid (including on delete); for set/update/add, require a body owner (when present) to equal uid; never reassign owner_uid of an existing row.

**Plan de validación en despliegue:** Owner-observed and read-only: confirm whether any job, backfill or restore (current or planned migration phases 2-3) reads firestore_mirror.data or owner_uid as authoritative, for example into businesses, travel_plans or reservations. Confirm whether document IDs in businesses, travelPlans, reservation_requests, sos_logs, environmental_reports, registro_negocios, messages and user_saved_places are random auto-IDs or predictable. Confirm whether the deployed baqueano-mirror matches a25cb23.

## 7. Límites de analítica según un anonymous_id que elige el cliente

- **Fingerprint:** `supabase/migrations/analytics_ingestion_kpis:anon-rate-limit-keyed-on-client-anonymous_id`
- **Severidad estimada:** Media (integridad de KPIs)
- **Estado:** 🔴 Abierto: requiere token de dispositivo emitido por el servidor y límites globales. Propuesta en NEEDS-VALIDATION

**Descripción (verificador):** track_event, track_commercial_action and submit_feedback are SECURITY DEFINER functions that anon can execute (grants at lines 201-203). Their only abuse controls are row counts filtered by the client-supplied p_anonymous_id: 300 events per hour (lines 67-71), 60 commercial actions per hour (lines 134-137) and 10 feedbacks per day (lines 184-187). p_anonymous_id is any string of 8 to 120 characters, so a fresh value on each call resets every limit. No later migration at a25cb23 redefines these functions. An anonymous caller holding the public anon key (the website posts to /rest/v1/rpc/track_event) can do four things. (a) Insert unlimited commercial_actions with is_qualified hardcoded true against any existing business, destination or experience. This inflates qualified_actions_total, by_type and the conversion numerator, and the actions also feed the impact_events view. (b) Create unlimited distinct activated actors: any client_allowed event with is_activation=true (favorite_added, trip_created, baqui_used, inquiry_sent, booking_requested, and so on) under a new id inserts a server-side user_activated row. (c) Submit unlimited 1-5 star feedback, which skews positive_pct and avg_rating. (d) Persist up to about 4 KB of metadata per event, plus campaign_attribution rows, with no retention bound. kpi_dashboard computes these figures, and the Ops Center labels them 'reproducible queries over real data'. Forged rows cannot be told apart from real ones because the tables store no IP or other server-observed signal. Source supports the DB-layer flaw. Whether an upstream per-IP gateway limit narrows the volume, and the runtime behaviour itself, could not be observed in this run.

**Causa raíz:** The rate-limit and actor-identity key is the client-asserted p_anonymous_id rather than a server-observed value, and the DB layer has no global, per-entity or per-network budget. track_commercial_action also sets is_qualified=true for every anonymous action, so the DB records no corroboration.

**Traza:**

| Tipo | Archivo:línea | Ámbito | Detalle |
|---|---|---|---|
| entrypoint | `supabase/migrations/20261005054100_analytics_ingestion_kpis.sql:201` | grant execute track_event/track_commercial_action/submit_feedback to anon | The three SECURITY DEFINER ingestion RPCs are granted to anon (lines 201-203), so any holder of the public anon key can call them through PostgREST /rest/v1/rpc/* |
| propagation | `supabase/migrations/20261005054100_analytics_ingestion_kpis.sql:61` | track_event | p_anonymous_id is only length-checked (8-120 characters); nothing binds it to a device, session, token or network |
| propagation | `supabase/migrations/20261005054100_analytics_ingestion_kpis.sql:67` | track_event rate limit | count(*) WHERE anonymous_id = p_anonymous_id over the last hour >= 300; a new id starts at 0 |
| propagation | `supabase/migrations/20261005054100_analytics_ingestion_kpis.sql:134` | track_commercial_action rate limit | The same client-keyed count, at 60 per hour |
| propagation | `supabase/migrations/20261005054100_analytics_ingestion_kpis.sql:148` | track_commercial_action insert | Additional sink on the same path: Inserts a commercial_actions row with is_qualified=true (line 151) for any existing business, destination or experience id |
| propagation | `supabase/migrations/20261005054100_analytics_ingestion_kpis.sql:88` | track_event activation | Additional sink on the same path: An actor key with no user_activated row gets a server-emitted user_activated event on its first is_activation event, so each new anonymous_id adds one activated actor |
| sink | `supabase/migrations/20261005054100_analytics_ingestion_kpis.sql:313` | kpi_dashboard commercial_conversion | Conversion counts distinct actor keys: the denominator comes from *_viewed analytics_events (lines 313-315) and the numerator from qualified commercial_actions (lines 316-317). Forged actors therefore move both sides, as well as qualified_actions_total and by_type (lines 322-324) |

**Evidencia:**

- `supabase/migrations/20261005054100_analytics_ingestion_kpis.sql:184`: submit_feedback's limit of 10 per day is keyed on p_anonymous_id, so rotating the id bypasses it; rating is bounded only to 1-5 by a table CHECK
- `supabase/migrations/20261005054100_analytics_ingestion_kpis.sql:151`: is_qualified is hardcoded true for every commercial action, anonymous ones included
- `supabase/migrations/20261005054000_analytics_smart.sql:55`: The activation events favorite_added, trip_created, baqui_used, itinerary_generated, inquiry_sent and booking_requested are both is_activation=true and client_allowed=true, so anon can trigger activation directly
- `supabase/migrations/20261005054000_analytics_smart.sql:113`: The only analytics_events index that supports the limit is (anonymous_id, occurred_at). The table comment says no IP is stored, so the DB has no network dimension to limit on
- `supabase/migrations/20261005070000_impact_alignment.sql:215`: The impact_events view also unions every commercial_actions row as contact or reservation impact, so forged actions spread into the strategic impact reporting
- `website/js/ops-center/ops-live-data.js:857`: The Ops Center presents kpi_dashboard figures as reproducible queries over real data

**Bloqueos:**

- Run-1 has no verified OS-enforced sandbox and no tested artifact promoter, so the migrations cannot be applied and the RPCs cannot be exercised against a local Postgres or Supabase stack
- Whether the deployed Supabase API gateway, PostgREST or another upstream layer enforces a per-IP or global request rate on /rest/v1/rpc/track_* is not visible in source. That rate bounds the practical volume of forgery, though it does not bound the per-id bypass

**Plan de validación local:** In a sandboxed local Supabase stack (supabase start) with every migration applied: insert one dummy published business with id 'dummy-biz-1'. As role anon, call public.track_commercial_action('whatsapp', 'anon-id-0001'..'anon-id-0061', null, 'web', 'dummy-biz-1') 61 times, using 61 distinct ids. Expect all 61 calls to return true, against a documented limit of 60 per actor. Then call public.track_event('favorite_added', 'anon-id-0001'..'anon-id-0005') and observe 5 new user_activated rows. Call public.submit_feedback('app', 5::smallint, 'fb-id-0001'..'fb-id-0011') and observe that all 11 calls return true. Finally, as service_role, call public.kpi_dashboard(now() - interval '1 hour', now()) and record qualified_actions_total, actors_activated.value and feedback.total. Stop there and run no volume testing.

**Plan de validación en despliegue:** An owner should check two things. First, whether Supabase project settings, an API gateway or WAF apply any per-IP rate limit to PostgREST /rest/v1/rpc/track_event, track_commercial_action and submit_feedback. Second, using service_role on production analytics_events, commercial_actions and user_feedback, look for bursts of many distinct anonymous_id values per minute that carry the same session_id pattern or entity. Fix: key the limits on a server-observed or server-issued value, such as a signed per-device token from an Edge Function that also hashes the request IP. Add global and per-entity hourly caps in the RPCs. Default is_qualified to false for anonymous actors until a second signal corroborates them. Add a retention job for analytics_events and campaign_attribution.

## 8. Evidencias de sprint vencidas sumaban al KPI interno

- **Fingerprint:** `supabase/migrations/sprint_evidence_crud:anon-insert-no-expiry-cleanup-counted-in-kpi`
- **Severidad estimada:** Baja
- **Estado:** 🟢 KPI corregido en BD (migración 20261006060000 aplicada y verificada; hoy hay 0 filas). Limpieza programada: decisión del propietario

**Descripción (verificador):** At a25cb23, migration 20261003223000 grants INSERT on public.sprint_evidence_records to anon and authenticated (line 37). The INSERT policy (lines 41-46) checks only two things: proof_hash must equal sha256 of the caller-chosen x-proof-token request header, and expires_at must be <= now()+15 minutes. Table CHECKs bound value to 1-120 characters, proof_hash to 64 characters and version to 1-3, and keep expires_at within 15 minutes of a created_at the client supplies (lines 24-29). Anyone holding the public anon key can therefore insert unlimited rows, each with a fresh token. The repository has no row cap, no DB-side rate limit, no cron.schedule and no job that deletes expired rows. The only delete path is the Azure /api/azure/evidence/crud flow, and it removes only the row it created itself (azure/api/server.js 163-205). Expired rows become invisible to anon and authenticated through the SELECT, UPDATE and DELETE policies, which require expires_at > now(), so after expiry not even the inserter can remove them. They stay in storage. strategic_impact_report() is SECURITY DEFINER (impact_alignment.sql 286), so it bypasses RLS. It reports count(*) over every row, expired ones included, as education.evidencias_sprint (line 349). An anonymous caller can therefore inflate that KPI without limit and grow the table indefinitely. Scope is limited in three ways. First, the report is visible only to service_role or staff with analytics.read (lines 293, 404-405; it is consumed by the baqueano-ops 'impact' action). Second, the matching INTUR-4 alignment row is marked 'potential' with no linked indicator codes (line 531). Third, each row is at most about 300 bytes. The impact is integrity of an internal dashboard figure plus slow storage growth, not data disclosure or cross-user mutation.

**Causa raíz:** The ephemeral-record contract relies on expires_at only for RLS visibility. Nothing deletes expired rows or caps anonymous inserts, which are reachable directly through PostgREST with any self-chosen x-proof-token. The SECURITY DEFINER KPI query counts every row and does not filter on expires_at.

**Traza:**

| Tipo | Archivo:línea | Ámbito | Detalle |
|---|---|---|---|
| entrypoint | `supabase/migrations/20261003223000_sprint_evidence_crud.sql:37` | GRANT SELECT, INSERT, UPDATE, DELETE ... TO anon, authenticated | Anonymous PostgREST callers with the public anon key hold the INSERT privilege on the table |
| propagation | `supabase/migrations/20261003223000_sprint_evidence_crud.sql:44` | INSERT policy 'Evidencia crea su registro efimero' WITH CHECK | Only requires proof_hash = sha256(x-proof-token) and expires_at <= now()+15m (line 45). The caller controls the header, proof_hash, created_at and expires_at, so every insert passes, with no count or rate condition |
| sink | `supabase/migrations/20261005070000_impact_alignment.sql:349` | strategic_impact_report() education.evidencias_sprint | The SECURITY DEFINER function (line 286) counts all rows, including expired and attacker-inserted ones, and reports the total as an impact KPI |

**Evidencia:**

- `supabase/migrations/20261003223000_sprint_evidence_crud.sql:29`: The CHECK bounds expires_at only relative to the created_at the client supplies. No TTL deletion is defined
- `supabase/migrations/20261003223000_sprint_evidence_crud.sql:32`: An expires_at index exists, but no cron.schedule or DELETE job references the table anywhere in the repository at a25cb23 (git grep for 'cron.schedule' returns nothing)
- `supabase/migrations/20261003223000_sprint_evidence_crud.sql:72`: The DELETE policy also requires expires_at > now(), so once a row expires, neither anon nor authenticated callers can remove it
- `azure/api/server.js:203`: The only legitimate writer deletes its own row in both the success and failure paths, so legitimate traffic should leave the count near zero. The Azure per-IP limit (allowEvidenceRun) does not apply to direct PostgREST inserts
- `supabase/migrations/20261005070000_impact_alignment.sql:405`: EXECUTE is revoked from public and anon, and the function body requires service_role or analytics.read (line 293). The inflated figure therefore reaches only staff dashboards, which limits the impact

**Bloqueos:**

- No verified OS-enforced sandbox or tested artifact promoter in run-1, so the local insert-and-count reproduction could not be run
- Not source-visible: whether the deployed project has a pg_cron job, a Supabase scheduled function or an external job that purges expired sprint_evidence_records
- Not source-visible: whether the Supabase API gateway or PostgREST applies a per-IP or per-key rate limit to anon inserts on /rest/v1/sprint_evidence_records

**Plan de validación local:** On a local Supabase stack with all migrations applied, send N anon-key POSTs to /rest/v1/sprint_evidence_records. Give each a distinct header x-proof-token=tK, a body with a random id, proof_hash=sha256(tK), value='x' and expires_at=now()+1 minute. Wait 2 minutes. As service_role, run select count(*) from public.sprint_evidence_records where expires_at < now() and confirm it equals N. Then call strategic_impact_report(now()-interval '1 day', now()) as service_role and confirm education.evidencias_sprint >= N. Use only dummy values, then delete the rows as service_role.

**Plan de validación en despliegue:** Owner check, read-only: select jobname, schedule, command from cron.job; then select count(*), min(created_at) from public.sprint_evidence_records where expires_at < now(); and check the gateway or PostgREST rate-limit configuration for anon inserts. If expired rows accumulate, three fixes apply. Add a scheduled delete of rows where expires_at < now(). Filter the KPI with expires_at > now(), or drop it from strategic_impact_report. Revoke the anon and authenticated INSERT grants and route evidence writes only through the Azure API using a server-held key.

## 9. Rol de personal asignado al registrarse si el correo está confirmado

- **Fingerprint:** `supabase:sync_staff_roles:email_confirmed_at-trusted-as-staff-email-ownership`
- **Severidad estimada:** Alta (condicional)
- **Estado:** 🔴 Abierto: el propietario debe confirmar en Supabase Auth "Confirm email" y los proveedores

**Descripción (verificador):** At a25cb23, the AFTER INSERT trigger on_auth_user_created_baqueano on auth.users runs handle_new_auth_user, which calls sync_staff_roles(new.id). A second trigger, on_auth_user_confirmed_baqueano, calls it again on the first null-to-non-null change of email_confirmed_at. sync_staff_roles reads lower(email) and email_confirmed_at from auth.users. Its only gate is email_confirmed_at IS NOT NULL. It then inserts admin/auditor/superadmin into public.user_roles for any active staff_roles email match, and superadmin for any active official_super_admins email match. baqueano-identity's actorFromProfile treats user_roles as the authority for staff permissions. A non-null email_confirmed_at proves mailbox control only when the deployed Supabase Auth settings are safe: email confirmations required with no mailer autoconfirm, enabled external providers that only assert verified emails, and identity linking that does not let a pre-registered unconfirmed password identity survive. If autoconfirm is on, or a provider passes an unverified email through as confirmed, an anonymous visitor can sign up with one of the official super-admin emails, which are published in a committed migration, and receive superadmin at insert time. The pre-registration/identity-linking path depends on GoTrue version and linking behavior; current GoTrue is documented to drop unconfirmed identities when linking, so that path is the weaker one. supabase/config.toml at a25cb23 contains only [functions.*] sections and no [auth] block, so none of these settings can be seen in source. No later migration redefines sync_staff_roles. Execute on sync_staff_roles is revoked from public, anon and authenticated, so the trigger is the only path into it. Hosted Supabase requires email confirmation by default, which is calibration only: the deployed value is unknown. A related lifecycle gap was observed: deactivating a staff_roles or official_super_admins row does not remove user_roles grants that were already inherited (inserts use on conflict do nothing, and no revocation trigger exists). It shares the same root cause.

**Causa raíz:** Privileged role assignment is keyed only on the email string plus a confirmation timestamp whose meaning is set by external Supabase Auth configuration. It is not bound to an explicit owner-approved account id or an invite, and nothing revokes it when the source row is deactivated.

**Traza:**

| Tipo | Archivo:línea | Ámbito | Detalle |
|---|---|---|---|
| entrypoint | `supabase/migrations/20261005040000_identity_rbac_foundation.sql:374` | trigger on_auth_user_created_baqueano | Any Supabase Auth signup (public signup endpoint or OAuth sign-in) inserts into auth.users and fires this AFTER INSERT trigger. |
| propagation | `supabase/migrations/20261005040000_identity_rbac_foundation.sql:356` | handle_new_auth_user | Calls public.sync_staff_roles(new.id) at insert time (SECURITY DEFINER). |
| propagation | `supabase/migrations/20261005040000_identity_rbac_foundation.sql:303` | sync_staff_roles | The only ownership check: return early if email is null or email_confirmed_at is null. |
| propagation | `supabase/migrations/20261005040000_identity_rbac_foundation.sql:315` | sync_staff_roles | Additional sink on the same path: Inserts user_roles 'superadmin' for an active official_super_admins email match (admin/auditor/superadmin for an active staff_roles match at L307). |
| sink | `supabase/functions/baqueano-identity/index.ts:156` | actorFromProfile | Loads the user's roles from user_roles and derives staff permissions from role_permissions; user_roles is the authority for staff actions. |

**Evidencia:**

- `supabase/migrations/20261005040000_identity_rbac_foundation.sql:301`: Reads lower(email) and email_confirmed_at from auth.users; there is no provider, invite or owner-approval binding.
- `supabase/migrations/20261005040000_identity_rbac_foundation.sql:382`: The confirmation trigger re-runs the grant on the first null-to-non-null email_confirmed_at transition.
- `supabase/migrations/20261005040000_identity_rbac_foundation.sql:322`: Execute on sync_staff_roles is revoked from public/anon/authenticated, so the trigger path is the only route in. This is a strong control against direct RPC, but not against signup.
- `supabase/config.toml:2`: The file starts with [functions.*] sections only (sections at L2-L40); there is no [auth]/[auth.email]/[auth.external.*] block, so confirmation/autoconfirm, provider and linking settings are not source-controlled.
- `supabase/migrations/20260928192057_register_official_super_admins.sql:44`: The INSERT of active super_admin emails (L45-L47) makes the target emails public in the repository.

**Bloqueos:**

- No verified OS-enforced sandbox or tested artifact promoter in run-1, so a local Supabase stack cannot be run.
- The deployed Supabase Auth settings are not in source and are decisive: enable_confirmations/mailer_autoconfirm for email signups, which external providers are enabled and whether they assert verified emails, and the GoTrue version and automatic identity-linking behavior for unconfirmed pre-registered identities.

**Plan de validación local:** In a sandboxed local Supabase stack (no network), apply the migrations with dummy staff_roles/official_super_admins rows such as staff-dummy@example.test. Run 1: set [auth.email] enable_confirmations=false and sign up staff-dummy@example.test with a password via the local signup endpoint, then run select role_id from public.user_roles where user_id=<new id>. Expect 'superadmin' or 'admin'. Run 2: with enable_confirmations=true, repeat the signup. Expect only 'turista' until a confirmation link is followed. Run 3: pre-register the dummy email with a password and leave it unconfirmed, then complete a local OAuth/magic-link sign-in for the same email. Check whether the original password still authenticates to a user id that now holds a staff role. Stop at the first user_roles row; no further actions.

**Plan de validación en despliegue:** Owner-observed and read-only in the Supabase dashboard for the production project. Under Authentication > Providers > Email, confirm 'Confirm email' is enabled (no autoconfirm). List the enabled external providers and confirm each one only returns verified emails. Note the Auth (GoTrue) version and its identity-linking setting. Also query public.user_roles joined to auth.users for staff/superadmin rows whose email no longer has an active staff_roles/official_super_admins row (de-provisioning gap). No live signup against production.

## 10. XSS almacenado en Ops Center vía businesses.cover_image

- **Fingerprint:** `website/js/ops-center/ops-engine.js:renderTableRow:raw-imageUrl-from-businesses.cover_image`
- **Severidad estimada:** Alta
- **Estado:** 🟢 Corregido en cliente (escape, safeUrl, jsAttr) y en BD (CHECK businesses_cover_image_safe_url aplicado y probado contra la carga de ataque)

**Descripción (verificador):** A business owner or manager can write businesses.cover_image directly through PostgREST, and the staff Ops Center later inserts that value unencoded into HTML. To do this the user needs a Supabase Auth account with the emprendedor permission businesses.manage_own and an active owner/manager row in business_members. Staff with businesses.update create that row through baqueano-identity set_business_member. This user is a non-staff, lower-trust principal. The column-level UPDATE grant includes cover_image, the RLS UPDATE policy checks only is_business_manager(id), and the guard_business_verification trigger does not cover cover_image. No CHECK constraint or URL validation applies on this path; baqueano-ops validates cover_image as a 'url' only for staff writes made through the function. When an admin or auditor opens the 'Negocios & Aliados' tab (08-negocios), ops-live-data.js lists the businesses through baqueano-ops, which reads with the service role and so also returns unpublished rows. It maps cover_image to imageUrl and calls BaqueanoOpsEngine.ingestCollection, which calls OpsUI.renderEntityView. That view then calls renderTableRow, which writes `<img src="${image}">` into innerHTML without encoding. previewEntity does the same with item.imageUrl, and also with item.status and item.department. A value such as `x" onerror="..." x="` breaks out of the src attribute. The CSP in source (azure/nginx/baqueano-security-headers.conf) allows script-src 'unsafe-inline', so the handler would run in the staff origin with the admin's session and could call baqueano-ops and baqueano-identity as that admin. A source-only review confirms the data path. It does not confirm execution in the browser or the deployed grants, memberships and headers.

**Causa raíz:** ops-engine.js treats records loaded from Supabase as trusted. renderTableRow (line 4246) and previewEntity (line 6662) interpolate item.imageUrl into an HTML attribute without OpsUI.escape. OpsUI.escape also does not encode single quotes, and item.id and status are interpolated raw as well. On the data side, the database grants authenticated business managers UPDATE on cover_image with no URL or scheme constraint. URL validation exists only in baqueano-ops for staff writes, not for direct owner PostgREST updates.

**Traza:**

| Tipo | Archivo:línea | Ámbito | Detalle |
|---|---|---|---|
| entrypoint | `supabase/migrations/20261005040000_identity_rbac_foundation.sql:432` | grant update (name, category, municipality, phone, whatsapp, address, cover_image, host_name, host_story, day_pass_available) on public.businesses to authenticated | Role authenticated gets a column UPDATE grant on cover_image, so a PATCH /rest/v1/businesses through PostgREST can set it. The RLS policy at line 436 allows the update when is_business_manager(id) is true, meaning an active owner/manager membership plus businesses.manage_own (lines 211-222). |
| propagation | `supabase/migrations/20261005080000_supabase_source_of_truth.sql:166` | public.guard_business_verification() | The BEFORE UPDATE trigger rejects non-staff changes to verified, verification_status, verified_at, verified_by, status, map_ready, protagonist_verified_at and owner_uid, but not cover_image. No migration at a25cb23 adds a CHECK constraint on businesses.cover_image. |
| propagation | `supabase/functions/baqueano-ops/index.ts:87` | ENTITIES.businesses.select | The staff list select includes cover_image and returns it unchanged. The write map ('url' validator, line 90) applies only to writes made through this function. |
| propagation | `website/js/ops-center/ops-live-data.js:323` | toEngine('businesses') | imageUrl is set to row.cover_image. loadTab then passes the items to BaqueanoOpsEngine.ingestCollection('08-negocios') (line 352), and ingestCollection calls OpsUI.renderEntityView (ops-engine.js line 6402). |
| propagation | `website/js/ops-center/ops-engine.js:4234` | OpsUI.renderTableRow | `const image = item.imageUrl \|\| item.image \|\| item.photo \|\| ''` applies no encoding. renderEntityView calls this function for each item at line 4223. |
| propagation | `website/js/ops-center/ops-engine.js:4246` | OpsUI.renderTableRow | Additional sink on the same path: `<img src="${image}" ...>` goes into the table markup that renderEntityView assigns through innerHTML. A double quote in cover_image ends the attribute, and an injected onerror handler follows. |
| sink | `website/js/ops-center/ops-engine.js:6662` | BaqueanoOpsEngine.previewEntity | `bodyEl.innerHTML` includes `<img src="${item.imageUrl}">` without encoding. item.status and item.department are also interpolated raw (lines 6665-6666). |

**Evidencia:**

- `supabase/migrations/20261005040000_identity_rbac_foundation.sql:432`: The column UPDATE grant on public.businesses to authenticated includes cover_image, after a blanket revoke at line 431.
- `supabase/migrations/20261005040000_identity_rbac_foundation.sql:211`: is_business_manager requires an active owner/manager business_members row, an active profile and has_permission('businesses.manage_own'). Line 144 gives that permission to the non-staff emprendedor role.
- `supabase/functions/baqueano-identity/index.ts:546`: set_business_member (requires businesses.update, a staff permission) creates the owner/manager membership. The attacker is therefore a legitimately onboarded business owner, which is lower trust than staff.
- `website/js/ops-center/ops-engine.js:6369`: OpsUI.escape encodes & < > " but not ', and it is not applied to image, status or id in renderTableRow or previewEntity.
- `azure/nginx/baqueano-security-headers.conf:18`: The CSP script-src includes 'unsafe-inline', so injected inline event handlers would run if these headers are the ones served.
- `website/admin.html:1577`: admin.html loads ops-live-data.js after ops-engine.js, so the 08-negocios tab is populated from Supabase through baqueano-ops.

**Bloqueos:**

- No verified OS-enforced sandbox or tested artifact promoter exists in run-1, so the rendered admin DOM could not be checked in a local browser to see whether the injected onerror handler fires.
- Deployed database state is not visible in source: whether migration 20261005040000's column grant and RLS policy are applied in production without a later out-of-repo constraint on businesses.cover_image, and whether any non-staff profile currently holds the emprendedor role (businesses.manage_own) plus an active owner/manager business_members row.
- The Content-Security-Policy actually served for /admin.html is not visible in source. Only the nginx snippet is in the repo, and it is not known whether it is included for that location.

**Plan de validación local:** With a local Supabase stack built from a25cb23 migrations and dummy accounts only: (1) as a dummy staff admin, call baqueano-identity set_business_member to link a dummy emprendedor profile as owner of a dummy business. (2) As that emprendedor, send PATCH /rest/v1/businesses?id=eq.<dummy-id> with {"cover_image":"x\" onerror=\"document.title='bq-xss'\" x=\""} and confirm 204 and the stored value. (3) Serve website/ locally with the nginx security-headers config, sign in to admin.html as the dummy admin, open 08-negocios and the row's preview, and check that document.title becomes 'bq-xss'. Stop there. Regression check: after encoding image/imageUrl/status/id (and adding a CHECK or trigger that requires an https URL in cover_image), the same row renders an inert src and the PATCH is rejected.

**Plan de validación en despliegue:** Read-only owner checks, no exploitation: run `select grantee, privilege_type from information_schema.column_privileges where table_schema='public' and table_name='businesses' and column_name='cover_image';` and `select count(*) from public.business_members where status='active' and member_role in ('owner','manager');`. List the constraints and triggers on public.businesses. Fetch the response headers for /admin.html from the production host and confirm whether script-src contains 'unsafe-inline'.

