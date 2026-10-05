# 🧭 BAQUEANO — Auditoría completa de la base de datos (Supabase / PostgreSQL)

> **🎯 POR QUÉ:** el propietario ordenó convertir Supabase/PostgreSQL en el backend central REAL de BAQUEANO (web, Android, iOS futura, Ops Center, BAQUI) sin borrar nada y sin duplicar estructuras. Antes de crear o modificar tablas, cada objeto existente debía auditarse y clasificarse.
> **⚙️ CÓMO:** consultas de solo lectura al catálogo de PostgreSQL del proyecto `heiudfpthqwtjrtluqlm` (`pg_class`, `pg_constraint`, `pg_policies`, `pg_proc`, `pg_trigger`, `pg_indexes`, `information_schema`, `storage.buckets`, `supabase_migrations`), al asesor de seguridad de Supabase y al código del repositorio (migraciones, Edge Functions, web y app). Fecha del corte: **2026-10-05 03:35 UTC**.
> **📦 QUÉ:** inventario clasificado y los entregables A–L. A partir de este documento se implementan las correcciones en migraciones aditivas (ver `MIGRATION_GUIDE.md` y `DATABASE_DECISIONS.md`).

Clasificación usada: **✅ EXISTE Y FUNCIONA · 🟡 INCOMPLETO · 🔗 MAL RELACIONADO · ♊ DUPLICADO · 🔁 DEBE MIGRARSE · ➕ FALTA · ⛔ NO APLICA**.

---

## 0. Inventario real (antes de cambios)

| Concepto | Valor medido |
|---|---|
| Esquemas | `public`, `auth`, `storage`, `realtime`, `vault`, `graphql`, `graphql_public`, `extensions`, `supabase_migrations` |
| Tablas en `public` | **54** (todas con RLS activo) |
| Vistas | 2 (`admin_user_directory`, `public_ecosystem_metrics`) |
| Vistas materializadas | 0 |
| Funciones propias | 21 |
| Disparadores propios | 18 en `public` + 2 en `auth.users` |
| Extensiones | `postgis 3.3.7`, `vector 0.8.2` (en `public`), `pgcrypto`, `uuid-ossp`, `pg_stat_statements`, `supabase_vault` |
| `pg_cron` | No instalado |
| Realtime | Publicación `supabase_realtime` **vacía** (ninguna tabla) |
| Buckets | 6 (`baqueano-media`, `community-media`, 3 `baqueano-backup-*` públicos, `baqueano-backup-documents` privado); 0 objetos |
| `auth.users` | **0** (Supabase Auth aún sin usuarios; la web y la app autentican con Firebase) |
| Migraciones registradas | 30 aplicadas; **4 archivos del repo NO aplicados** (ver G-2) |

### Filas reales por tabla (conteo exacto)

`departments` 17 · `destinations` 7 · `businesses` 5 · `travel_plans` 31 · `roles` 6 · `permissions` 31 · `role_permissions` 96 · `staff_roles` 4 · `official_super_admins` 3 · **todas las demás 0** (incluye `municipalities`, `profiles`, `reservations`, `audit_logs`, `ai_sessions`, `ai_messages`, `favorites`, `experiences`, `culture`, `gastronomy`, `emergencies`, `knowledge_documents`…).

Conclusión: la estructura es amplia, pero el **inventario operativo real está casi vacío**. Las tablas existen; los datos y las relaciones que permitirían demostrar KPIs todavía no.

---

## 1. Clasificación por dominio

### Identidad
| Objeto | Estado | Nota |
|---|---|---|
| `auth.users` + triggers `on_auth_user_created_baqueano` / `on_auth_user_confirmed_baqueano` | ✅ | Crea `profiles` 1:1 y sincroniza roles de personal por correo verificado. |
| `profiles` | ✅ / 🔁 | FK a `auth.users` ON DELETE RESTRICT, `preferred_language`, `status` con suspensión. `role` texto heredado (traveler/business_owner…) convive con RBAC → 🔁 retirar gradualmente. `firebase_uid` se conserva. |
| `roles`, `permissions`, `role_permissions`, `user_roles` | ✅ | 6 roles oficiales (incluye `auditor`), 31 permisos, anti-autoasignación en Edge Function y RLS. |
| `staff_roles`, `official_super_admins` | 🔁 | Listas de correo heredadas; `sync_staff_roles` las traduce a `user_roles`. Se conservan. |
| `identity_links` | ✅ | Equivale a `legacy_identity_map` (provider, legacy_uid, profile_id). No se duplica. |

### Territorio
| Objeto | Estado | Nota |
|---|---|---|
| `departments` | ✅ | 17 filas (15 departamentos + 2 regiones). |
| `municipalities` | 🟡 | Tabla correcta (FK a departamento) pero **0 filas**: el repo tiene 140 municipios reales en `website/js/territories-data.js` y faltan los 13 de Chinandega (oficial: 153). |
| `communities` | 🟡 | 0 filas; `municipality_id` sin FK. |
| `locations` | ⛔ | No hace falta: cada entidad tiene `latitude/longitude/geom` (PostGIS). |

### Turismo
| Objeto | Estado | Nota |
|---|---|---|
| `destinations` | 🟡 | 7 publicadas, todas `confidence_status = pending` y **sin fuente** (`source_name` nulo) → publicadas sin trazabilidad. Falta `municipality_id`. |
| `places` | 🟡 | 0 filas; lectura pública sin filtro de estado. |
| `businesses` | 🔗 / 🟡 | `id` texto; **`department` y `municipality` en texto libre** (no FK) → viola 3FN y rompe filtros. Sin `status` editorial (solo `verified`), sin fuente/verificador/fecha, sin coordenadas en los 5 negocios, teléfonos dudosos (`50587654321` secuencial; `50584431289` repetido en 2 negocios). `owner_uid` texto heredado (convive con `business_members`). |
| `business_members` | ✅ | N:N negocio↔perfil con `owner/manager/staff`. |
| `tourism_services` | ✅ | Precios `numeric` + `currency` + `price_kind` con checks (buen modelo). |
| `experiences` | 🟡 | Falta descripción, requisitos, no incluye, sostenibilidad, fuente/verificación; `municipality_id` ausente. |
| `routes`, `route_stops` | 🟡 | Paradas por `entity_type/entity_id` texto (polimórfico sin FK); `routes.department_ids` es arreglo (viola 1FN para filtrar). Check `budget_tier` usa un término vetado por la regla del proyecto; se documenta y no se altera sin autorización. |
| `day_passes` | 🟡 | Faltan restricciones, contacto, fecha de verificación. |

### Cultura
`culture`, `heritage`, `museums`, `gastronomy`, `music`, `crafts`, `festivals`, `legends`, `historical_figures`, `events` → 🟡 todas con estado editorial y FK a departamento, pero **`municipality_id` sin FK**, sin campos de trazabilidad homogéneos (solo `culture` tiene fuente) y **0 filas** (el contenido real está en JS de la web, no en la BD).

### Emergencias
`emergencies` 🟡 (estructura correcta: tipo, entidad, teléfono, 24 h, coordenadas, verificado) con 0 filas, sin `verified_at`/fuente, sin check de `service_type`. `sos_events` ✅ (alertas reales, solo servidor; RLS sin política explícita → aviso INFO del asesor).

### Comunidad
`testimonials` + `testimonial_*` ✅ (modelo completo con moderación, contadores por trigger, búsqueda). `reviews` 🔁 (paralela a testimonios; `user_uid` texto). `favorites`, `explorer_passport_stamps`, `travel_diaries` 🔁 (`user_uid` texto Firebase; sin FK a `profiles`).

### Viajes
`travel_plans` 🔁 (31 filas reales, `user_uid` texto). `reservations` ✅ (estados correctos, código único, historial) / 🔁 (`user_uid` texto). `trips`/`trip_days`/`trip_items` ➕ no se crean ahora: `travel_plans.payload` cubre el itinerario generado; se documenta la normalización futura.

### IA (BAQUI)
| Objeto | Estado | Nota |
|---|---|---|
| `ai_sessions`, `ai_messages` | 🟡 | Existen (con `rag_sources`, `tool_calls`, `provider_used`, `tokens_used`, `latency_ms`) pero **BAQUI no escribe en ellas** → el KPI "uso de BAQUI" no tiene fuente. `ai_sessions.user_uid` texto. |
| `knowledge_documents` | ✅ | pgvector + HNSW + `match_knowledge_documents`; 0 documentos. |
| `rag_sources` | ➕ | No existe catálogo de fuentes. |
| `baqui_trip_memory`, `knowledge_candidates`, `baqui_feedback`, `baqui_knowledge_gaps` | ➕ | Definidas en `20261001120000_baqui_responsible_memory.sql` pero **nunca aplicadas**. |

### Operación
`verification_requests` ✅ (estados pending/under_review/approved/rejected/needs_information + `verified` heredado). `audit_logs` ✅ (inmutable por trigger; actor/rol/entidad/antes/después/motivo). `reports`/`complaints` → las denuncias de comunidad viven en `testimonial_reports`; las denuncias ambientales del portal aún no persisten en BD (➕ evaluar).

### Analítica
`traffic_sessions` 🟡 (inserción pública desde la web, **guarda IP del cliente** = PII innecesaria, sin `session_id`/UTM). `analytics_events`, `commercial_actions`, `campaign_attribution`, `user_feedback` ➕ **no existen** → hoy no se puede medir activación, conversión, retención ni valoración desde la BD. `public_ecosystem_metrics` ✅ (vista pública de conteos).

### i18n de contenido
`content_translations` ➕ definida en `20261001090000_content_translations.sql` (equivale a `entity_translations`) pero **nunca aplicada**.

### Respaldo / espejo
`backup_operations`, `storage_backups`, `ops_backup_entities`, `firestore_mirror` ✅ (solo servidor). `sprint_evidence_records` ✅ (CRUD efímero de evidencia del sprint).

---

## A. Lo que YA ESTÁ BIEN
1. RLS activo en las 54 tablas; tablas sensibles cerradas con política RESTRICTIVA "Solo servidor".
2. RBAC normalizado (roles/permissions/role_permissions/user_roles) con `auditor` oficial y funciones `SECURITY DEFINER` con `search_path=''`.
3. `profiles` 1:1 con `auth.users` y triggers de alta; estados de usuario con suspensión trazable.
4. `audit_logs` inmutable (UPDATE/DELETE/TRUNCATE bloqueados por trigger) con actor, rol, antes/después y motivo.
5. Modelo de comunidad (testimonios) completo con moderación, contadores e índices adecuados.
6. Precios con `numeric` + moneda + tipo de precio en `tourism_services`; `reservations` con estados y código único.
7. PostGIS con índices GiST en todas las entidades geográficas; pgvector con HNSW.
8. `service_role` no expuesto en la web ni en la app; operaciones administrativas por Edge Functions con RBAC y auditoría.

## B. Lo que está INCOMPLETO
1. `municipalities` vacía (0/153). 2. Destinos publicados sin fuente ni verificación. 3. Negocios sin estado editorial, fuente, coordenadas ni medida de completitud. 4. Cultura, emergencias, experiencias, day passes sin trazabilidad homogénea ni datos. 5. BAQUI no registra sesiones/mensajes. 6. Sin tablas de analítica de producto ni KPIs calculables. 7. Sin `rag_sources`. 8. Sin `updated_at` automático (función común) en la mayoría de tablas de catálogo. 9. Sin reporte de salud de la BD.

## C. Lo que está DUPLICADO (no se borra; se documenta)
- Índices redundantes: `audit_logs` (`idx_audit_logs_created_at` = `audit_logs_created_at_idx`), `profiles.firebase_uid` (único + índice simple), `backup_operations.operation_id`, `routes.slug`, `storage_backups.firebase_path`, `verification_requests.status`.
- Políticas de storage duplicadas sobre `baqueano-media` (`Lectura pública…` + `baqueano-media 1gfcbiv_*`).
- Rol en `profiles.role` (texto) frente a `user_roles`; personal en `staff_roles`/`official_super_admins` frente a `user_roles`.
- `reviews` frente a `testimonials`; `baqui_trip_memory` (repo) frente a `ai_sessions`.
- Propietario de negocio en `businesses.owner_uid` frente a `business_members`.
Estrategia: mantener compatibilidad, marcar la fuente canónica en `DATABASE_DECISIONS.md` y retirar solo con autorización expresa.

## D. Lo que está MAL RELACIONADO
1. `businesses.department` / `municipality` en texto → sin FK. 2. `municipality_id` (texto) sin FK en 11 tablas culturales/turísticas. 3. Identidad de usuario como texto Firebase (`user_uid`, `author_uid`, `reporter_uid`) en `favorites`, `reservations`, `travel_plans`, `reviews`, `testimonials`, `sos_events`, `ai_sessions`… sin FK a `profiles`. 4. `route_stops` polimórfico sin FK. 5. `routes.department_ids` como arreglo.

## E. Lo que FALTA para la Hackathon 2026
Municipios cargados · trazabilidad y estado editorial de negocios/destinos · completitud de fichas medible · `analytics_events` + `commercial_actions` + `user_feedback` + definición de activación · KPIs desde el backend (`kpi_dashboard`) · BAQUI registrando sesiones/mensajes/fuentes · reporte de salud · Ops Center "Analítica / Impacto" sin cifras inventadas · documentación (ER, diccionario, normalización, seguridad, SMART, decisiones, guía de migración, pruebas).

## F. Lo que FALTA para producción real
Login con Supabase Auth en web y app (hoy Firebase) y migración de `user_uid` texto → `user_id uuid` · carga real y verificada de contenido (cultura, emergencias, municipios con coordenadas) · política de retención de analítica/auditoría · exportación/anonimización de datos del usuario · `terms_accepted_at`/`privacy_accepted_at` · entornos dev/staging/prod separados · respaldo previo documentado a cada migración crítica · Realtime solo donde aporte (reservas/SOS) · revisión de los teléfonos sospechosos de los 5 negocios verificados.

## G. RIESGOS DE SEGURIDAD
| # | Riesgo | Severidad | Evidencia | Acción |
|---|---|---|---|---|
| G-1 | **Storage abierto**: políticas `public` (incluye `anon`) permiten INSERT/UPDATE/DELETE de objetos en `baqueano-media` y crear buckets | **CRÍTICA** | `pg_policies` en `storage.objects`/`storage.buckets` | Se limitan a `service_role` (ALTER POLICY, sin borrar) |
| G-2 | Deriva repo↔producción: `20261003213000_lock_down_sensitive_surfaces.sql` (cierre de storage/telemetría), `content_translations` y `baqui_responsible_memory` **nunca se aplicaron** | ALTA | `supabase_migrations` | Aplicar equivalentes no destructivos y registrar |
| G-3 | `anon`/`authenticated` conservan privilegios `TRUNCATE/INSERT/UPDATE/DELETE` en tablas de catálogo (RLS los frena, salvo `TRUNCATE`, que RLS no cubre) | MEDIA (no expuesto por PostgREST) | `role_table_grants` | REVOKE de escritura y TRUNCATE a clientes |
| G-4 | `traffic_sessions` acepta inserciones anónimas sin límites y guarda IP | MEDIA | política `WITH CHECK (true)` | Check de forma/longitudes; minimizar IP |
| G-5 | `sos_events` RLS sin políticas (bloqueado, pero implícito) | INFO | asesor | Política RESTRICTIVA explícita |
| G-6 | Extensión `vector` en `public` | BAJA | asesor | Documentado; mover requiere recrear índice (no ahora) |
| G-7 | `has_permission`/`has_role`/`is_business_manager` ejecutables por `authenticated` | ACEPTADO | asesor | Necesarias para RLS; solo devuelven booleanos del propio usuario |
| G-8 | Buckets `baqueano-backup-*` públicos | MEDIA | `storage.buckets` | Documentado; cambiar visibilidad requiere confirmar consumidores (pendiente de autorización) |

Sin hallazgos de: `service_role` en frontend, SQL dinámico concatenado en funciones, autoasignación de roles (bloqueada por RLS + Edge Function), tablas sensibles públicas.

## H. PLAN DE MIGRACIONES (aditivas, idempotentes)
1. `20261005050000_security_storage_lockdown` — G-1, G-3, G-4, G-5.
2. `20261005051000_territory_municipalities` — 153 municipios reales con fuente; FKs `municipality_id` (NOT VALID → VALIDATE); `department_id`/`municipality_id` en `businesses` con respaldo del texto.
3. `20261005052000_traceability_and_status` — función común `set_updated_at()`; estado editorial y trazabilidad en negocios/destinos/experiencias/cultura/emergencias/day passes; `sustainability_attributes`; completitud de ficha.
4. Aplicar `20261001090000_content_translations` y `20261001120000_baqui_responsible_memory` del repo (mismo contenido, versionado).
5. `20261005053000_baqui_traceability` — `rag_sources`; columnas de identidad/idioma/modelo en `ai_sessions`/`ai_messages`.
6. `20261005054000_analytics_smart` — `analytics_events`, `commercial_actions`, `campaign_attribution`, `user_feedback`, permiso `analytics.read`, definición de activación, `kpi_dashboard()`.
7. `20261005055000_db_health_and_duplicates` — `db_health_report()`, sugerencia de duplicados, vistas `v_*`.

## I. MODELO ER ACTUAL
Ver `ER_DIAGRAM.md` § "Actual": núcleo `departments ─< destinations ─< places`, `departments ─< (cultura ×10)`, `businesses ─< (day_passes, tourism_services, experiences, reservations, reviews, testimonials, business_members)`, `profiles ─< (user_roles, business_members, verification_requests, identity_links)`; islas sin FK: `favorites`, `travel_plans`, `ai_sessions`, `traffic_sessions`.

## J. MODELO ER OBJETIVO
Ver `ER_DIAGRAM.md` § "Objetivo": territorio jerárquico (departamento → municipio → comunidad → lugar), identidad única por `profiles.id`, oferta (negocio → servicio/experiencia/day pass) con trazabilidad, viajes y reservas enlazados a perfil, BAQUI con sesiones/mensajes/fuentes, analítica (`analytics_events`, `commercial_actions`, `user_feedback`) y operación (verificaciones, auditoría).

## K. MATRIZ SMART → BD → KPI
Ver `SMART_KPI_MATRIX.md` (objetivo, tabla, evento, fórmula, período, fuente, tablero).

## L. PRIORIDAD DE IMPLEMENTACIÓN
1. **P0 seguridad**: G-1/G-3/G-4/G-5. 2. **P0 trazabilidad territorial**: municipios + FKs. 3. **P1 medición**: analítica SMART + KPIs backend + Ops Center. 4. **P1 BAQUI**: registro de sesiones/mensajes/fuentes. 5. **P1 calidad de oferta**: estado/fuente/completitud. 6. **P2 salud y duplicados**. 7. **P2 documentación Hackathon**. 8. **P3 migración de `user_uid` texto → `user_id uuid`** (requiere login Supabase en web y app).
