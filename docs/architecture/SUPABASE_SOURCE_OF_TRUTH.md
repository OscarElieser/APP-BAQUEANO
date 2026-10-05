# Supabase como fuente principal de verdad de BAQUEANO

> **Regla del proyecto (propietario, 2026-10-05):**
> "Supabase es la fuente principal de verdad de BAQUEANO Nicaragua. Todo nuevo destino, negocio, alojamiento, restaurante, experiencia, contenido territorial, indicador, impacto, reserva o información operativa debe persistirse en Supabase. Firestore y archivos estáticos podrán mantenerse temporalmente por compatibilidad, respaldo o migración, pero no deberán utilizarse como nuevas fuentes paralelas de datos estructurados."
>
> "Desde este momento, toda nueva escritura estructurada de BAQUEANO debe ir a Supabase. Firestore queda en modo legado hasta completar la migración."

🎯 **POR QUÉ:** una sola fuente de datos para web, app, Ops Center, BAQUI, mapa, Mi Negocio e Impacto.
⚙️ **CÓMO:** migración progresiva, sin big-bang: auditoría → respaldo → esquema → importación idempotente → lectura desde Supabase → retiro de dependencias.
📦 **QUÉ:** este documento reúne la auditoría, el modelo, la migración, los conteos, los riesgos, el rollback y el estado real.

Firebase sigue **solo para Authentication (Google) y APIs (Functions)** — decisión del propietario, 2026-10-05. Hosting, reglas de Firestore/Storage y RTDB quedan en pausa en `firebase.legacy.json`; el sitio público vive solo en Azure (`baqueanonicaragua.com`). Hoy no hay Cloud Functions desplegadas (plan Spark): las APIs activas son las Edge Functions de Supabase y `/api/azure/`. **No se migra la autenticación ahora:** primero los datos; después se evalúa Supabase Auth.

## 1. Auditoría (2026-10-05, consultas reales de solo lectura)

### 1.1 Firestore

| Hecho | Evidencia |
|---|---|
| La base `(default)` **no existe**; la única es `appbaqueano` | `firestore_list_databases` |
| `appbaqueano` tiene **0 colecciones** (vacía) | `firestore_list_collections` |
| La web y la app apuntan a `appbaqueano` | `js/firebase-config.js` (Proxy), `lib/**` con `databaseId: 'appbaqueano'` |

**Consecuencia:** no hay datos en Firestore para migrar. Todo lo que el código "guarda" en Firestore hoy se pierde o es rechazado por las reglas. El caso más grave es Mi Negocio: escribe en `registro_negocios`, una colección que ni siquiera tiene regla, así que **las postulaciones de negocios solo llegan por WhatsApp**.

### 1.2 Matriz de fuentes actuales

| Fuente actual | Tipo de dato | Archivo | Tabla o colección | Quién lo usa | Riesgo | Destino en Supabase | Estado |
|---|---|---|---|---|---|---|---|
| JS estático | 266 lugares (destinos, hospedajes, restaurantes…) | `website/js/territories-data.js` | — | franja y ficha de departamento, destinos.html, mapa, buscador, BAQUI (travel-knowledge), App (`assets/data/territories_places.json`) | Alto: fuente paralela que crece con cada catálogo | `places` (237) + `businesses` (25) | 🟡 SQL generado, sin aplicar |
| JS estático | municipios por territorio | `territories-data.js` | — | fichas | Bajo | `municipalities` (153, ya existe) | 🟢 ya en Supabase |
| JS estático | catálogo maestro, rutas, negocios demo | `baqueano-master-catalog.js`, `website-business-catalog.js`, `tourism-catalog-expansion.js`, `territories-rich-data.js` | — | home, destinos | Medio | `routes`, `businesses`, `experiences` | 🔴 pendiente de inventario fino |
| JSON generado | índice de búsqueda, conocimiento de BAQUI | `website/data/search-index.json`, `travel-knowledge.json` | — | buscador, BAQUI web | Medio (derivado) | se regenera desde Supabase | 🔴 |
| Firestore (escritura perdida) | postulación de negocio | `js/navigation.js` | `registro_negocios` | Mi Negocio | **Alto: datos perdidos** | `businesses` (pending_review) + `business_members` + `verification_requests` | 🔴 diseño listo (ver §6) |
| Firestore (escritura) | usuarios, auditoría | `js/user-session.js`, `destinos-gastronomia.js`, `firestore-realtime.js` | `users`, `audit_logs` | sesión web | Medio | `profiles`, `identity_links`, `audit_logs` (existen) | 🔴 |
| Firestore (escritura) | tráfico | `js/baqueano-traffic-tracker.js` | `traffic_sessions`, `traffic_events` | analítica | Bajo | `analytics_events` (`track_event`, existe) | 🟡 la analítica nueva ya va a Supabase |
| Firestore (escritura) | órdenes de pago | `js/calculator.js` | `payment_orders` | calculadora | Medio | `reservations` (flujo sin pago, existe) | 🔴 |
| Firestore (escritura) | reportes ambientales, lugares guardados | `js/firestore-realtime.js` | `environmental_reports`, `user_saved_places` | ambiental, favoritos | Medio | `favorites` (existe); tabla de reportes ambientales | 🔴 |
| Firestore (lect./escr.) | configuración, SEO, IA, versión Android | `js/ops-center/ops-engine.js`, `navigation.js`, `video-registry.js`, `route-builder.js` | `app_config`, `system_settings`, `ai_settings`, `ai_tasks`, `site_pages` | Ops Center, home | Medio | tabla de configuración (por crear) | 🔴 |
| Firestore (lectura) | CMS público | `js/public-cms-sync.js` | `businesses`, `gastronomy`, `history_timeline`, `notifications`, `places` | web | Bajo (lee vacío) | tablas de Supabase existentes | 🔴 |
| Firestore (Flutter) | lugares, categorías, pagos, usuarios | `lib/features/directory/services/*.dart`, `lib/services/*`, `lib/core/payment/*` | `places`, `categories`, `payment_orders`, `users` | App | Medio | `places`, `businesses`; repositorios Supabase existentes | 🟡 la App ya tiene `SupabaseRestClient` y 5 repositorios |
| localStorage | idioma, favoritos, viajes, consentimiento, sesión | varios `js/` | — | web | Bajo (preferencias por dispositivo) | `favorites`, `travel_plans` cuando hay sesión | ⚪ preferencias locales válidas |
| Supabase Storage | 6 buckets, **0 objetos** | — | — | — | — | buckets por dominio (§5) | 🟡 |
| Firebase Storage | referencias en Ops Center | `ops-engine.js` | — | subidas de Ops | Bajo | buckets de Supabase vía Edge Function | 🔴 |
| Edge Functions | ops, identity, ai, community, reservas, sos, mirror, status | `supabase/functions/*` | — | todo | — | se reutilizan | 🟢 existen |
| Cloud Functions | `api` (`functions/index.js`) | — | — | `/api/**` en Firebase Hosting | Bajo | — | ⚪ sin cambios |

### 1.3 Supabase (conteos reales)

| Tabla | Filas |
|---|---:|
| departments | 17 |
| municipalities | 153 |
| destinations | 7 (pending_review, sin municipio) |
| businesses | 5 (verificados **sin `source_url`**) |
| places | 0 |
| experiences, routes, communities, emergencies, cultura | 0 |
| travel_plans | 31 |
| ai_messages | 8 |
| profiles, identity_links | 0 |

`places` tenía una política RLS `using (true)`, es decir, lectura pública de todo. La migración la cambia a `is_published`.

## 2. Diagrama antes / después

```
ANTES                                         DESPUÉS (objetivo)
territories-data.js ──► web, mapa, BAQUI,     Ops Center / Mi Negocio / importador
  JSON derivados        App (export JSON)        │  (Edge Functions + token Firebase verificado + RBAC)
Firestore appbaqueano ◄─ escrituras (perdidas)   ▼
Supabase (7 destinos, 5 negocios) ──► Ops,    SUPABASE ── places · businesses · prices · verification_sources
  Impacto, App (parcial)                         │        · municipalities · experiences · routes · …
                                                 ├──► web (js/services/baqueano-data.js, solo lectura pública)
                                                 ├──► App Flutter (SupabaseRestClient + repositorios)
                                                 ├──► BAQUI (Supabase primero → fuentes oficiales → externo)
                                                 ├──► Mapa (is_published; "Cómo llegar" solo con map_ready)
                                                 └──► Impacto (public_impact_summary, conteos reales)
                                              Firestore = LEGADO (solo lectura); territories-data.js = respaldo/fallback
```

## 3. Modelo de datos (reutiliza lo existente; no duplica tablas)

| Pedido | Implementación |
|---|---|
| places | **Se reutiliza `places`** y se agregan: slug, subcategory, department_id/municipality_id (FK), short_description, location_precision, address, map_ready, is_published, archived_at, attributes, legacy_source/legacy_key, created_by/updated_by. Los IDs son `text`, igual que el resto del esquema. |
| businesses | **Se reutiliza** y se agregan: slug, business_type, location_precision, map_ready, `is_published` (columna generada desde `status`), attributes, legacy y trazabilidad. |
| departments / municipalities | Se reutilizan: 17 y 153. |
| experiences, routes, route_stops, reservations, reviews, testimonials, gastronomy, community_impact, impact_indicators, national_alignment, analytics_events | Ya existen (las de impacto vienen en la migración 20261005070000). |
| cultural_content | Equivale a `culture` + `heritage`, `music`, `crafts`, `festivals`, `legends`, `historical_figures` (no se duplica). |
| emergency_services | Equivale a `emergencies` (teléfono, ubicación, fuente, vigencia). |
| sustainability_practices | Migración 20261005070000. |
| **prices** | **Nueva.** Precio dinámico con `checked_at`, vigencia, moneda y tipo. Sin fila vigente se muestra "Precio por confirmar". |
| **verification_sources** | **Nueva.** Fuente por entidad (official, business_official, government, osm, wikidata, manual_verified…); vencida pasa a `needs_review` (`refresh_source_expiry()`). |
| profiles | Ya existe (firebase_uid, provider, email, display_name, status). `identity_links` mapea el UID de Firebase con el perfil. |
| roles | Se reutilizan: superadmin, admin, auditor, **emprendedor (= business_owner)**, **guia (= guide)**, **turista (= tourist/user)**. **Se agrega `editor`** con los permisos `content.read` y `content.manage`. |

**Trazabilidad:** `created_at`, `updated_at`, `created_by`, `updated_by`, `verified_at`, `verified_by`, `source_url` y `verification_status` en places y businesses. Las escrituras desde Ops quedan en `audit_logs`, como ya funcionaba.

**Seguridad (RLS):**
- El público solo puede hacer SELECT de lo publicado (places `is_published`; businesses `status = published`).
- Escritura solo por Edge Functions con `service_role` en el servidor; nunca en el frontend.
- El emprendedor edita su ficha (`is_business_manager`), pero un **trigger le impide verificar, publicar o cambiar el titular**: no puede autoasignarse el check azul.

## 4. Migraciones (en `supabase/migrations/`, sin aplicar)

| Archivo | Contenido | Validación |
|---|---|---|
| `20261005070000_impact_alignment.sql` | BAQUEANO IMPACTO (sesión anterior) | 52 sentencias analizadas con libpg_query |
| `20261005080000_supabase_source_of_truth.sql` | places, businesses, prices, verification_sources, data_migration_runs, rol editor, buckets, `data_source_status()`, `public_impact_summary()` con places | 60 sentencias + 3 cuerpos PL/pgSQL analizados; columnas confirmadas contra el esquema en vivo (solo lectura) |
| `supabase/imports/20261005_territories_import.sql` (generado) | 237 places + 25 businesses + fuentes + registro de la corrida | 409 sentencias analizadas; idéntico en cada corrida (`--check`) |

## 5. Importación de los 266 lugares (dry-run, no toca la base)

Comando: `node website/scripts/migrate-territories-to-supabase.mjs` (dentro de `website/`).

| Indicador | Valor |
|---|---:|
| total_fuente_original | **266** |
| → places | 237 |
| → businesses (hospedajes 13, restaurantes 6, comedores 4, kioscos 2) | 25 |
| total_insertados | 262 |
| total_duplicados (ya existen como `destinations`: Cañón de Somoto, Cerro Negro, Laguna de Apoyo, Mombacho) | 4 |
| **Cuadre:** 262 + 4 = 266 ✔ · 237 + 25 = 262 ✔ | |
| verificados / parciales / pendientes | 115 / 6 / 141 (= 262 ✔) |
| sin fuente (quedan `pending_review`) | 141 |
| map_ready (pin exacto) | 37 |
| sin coordenadas | 183 |
| coordenadas descartadas fuera de Nicaragua | 0 |
| sin municipio enlazado (no se adivina; queda en `zone_text`) | 193 |
| categoría inferida del tipo (si es dudosa: "atractivo") | 177 |
| notas de precio (quedan como nota fechada, no como precio) | 38 |
| posibles duplicados para revisión manual | 3 (Selva Negra ×2, Corn Island) |

Detalle completo en `website/docs/data-migration/territories-import-report.json`.

**Pendiente de decisión:** los 4 duplicados tienen en el catálogo más datos (fuentes, coordenadas) que en `destinations`. Conviene completar esos destinos desde Ops Center en lugar de crear filas nuevas.

## 6. Estado por fase

| Fase | Estado | Evidencia o motivo |
|---|---|---|
| 1 Auditoría | 🟢 | §1, con consultas reales |
| 2 Modelo | 🟢 diseñado / 🟡 sin aplicar | §3 y migración 080000 |
| 3 Migrar 266 lugares | 🟡 | SQL idempotente generado y validado; sin ejecutar |
| 4 Migrar negocios | 🟡 | 25 incluidos en el mismo SQL |
| 5 Mapa desde Supabase | 🔴 | consultas definidas (§3), consumidores todavía sin cambiar |
| 6 Ops Center CMS | 🔴 | falta agregar `places` a la lista blanca de `baqueano-ops` y el panel "Estado del sistema de datos" (la función SQL `data_source_status()` ya está) |
| 7 Mi Negocio → Supabase | 🔴 | diseño: acción `register_business` en `baqueano-identity` (token Firebase → perfil + `identity_links` → negocio `pending_review` + miembro owner + `verification_request`); el guard del check azul ya está en la migración |
| 8 BAQUI desde Supabase | 🔴 | hoy consulta `BaqueanoKnowledgeService`; falta incluir places, businesses y prices |
| 9 Precios | 🟡 | tabla `prices` creada (sin aplicar) |
| 10 Fuentes | 🟡 | `verification_sources` + vencimiento (sin aplicar); el importador carga 115+ fuentes |
| 11 Auth | 🟡 | se reutilizan `profiles` e `identity_links`; Firebase Auth sin cambios |
| 12 Roles y RLS | 🟡 | rol `editor`, RLS de publicación y guard del check azul (sin aplicar) |
| 13 Storage | 🟡 | 6 buckets por dominio en la migración, sin mover archivos |
| 14 Analítica | 🟢 (sesión anterior) | `analytics_events` + vista `impact_events` |
| 15 Impacto | 🟡 | `public_impact_summary()` cuenta places + businesses |
| 16 Capa de servicios web | 🔴 | `js/services/baqueano-data.js` por crear |
| 17 Flutter | 🟡 | `SupabaseRestClient` + 5 repositorios ya existen; faltan PlaceRepository y BusinessRepository |
| 18 Firestore legado | 🔴 | punto único de intercepción identificado (Proxy en `firebase-config.js`); bandera `FIRESTORE_LEGACY_MODE` por implementar |
| 19 Fallback | 🔴 | regla definida: si Supabase falla no se escribe en Firestore; se muestra "Servicio temporalmente no disponible" |
| 20 Seguridad | 🟡 | sin service_role en el frontend (verificado); RLS endurecida en la migración |
| 21 Respaldos | 🟢 | `backups/migration-20261005/` (ignorado por git; SHA256SUMS): territories-data.js, catálogos JS, JSON, tablas públicas de Supabase. **Falta:** respaldo completo desde el dashboard de Supabase antes de aplicar (incluye tablas privadas) |
| 22–23 Orden y migraciones | 🟢 | todo en `supabase/migrations/`, idempotente y documentado |
| 27–28 Estado e indicadores de migración | 🟡 | `data_source_status()` + `data_migration_runs` |
| 29 Pruebas | 🟡 | análisis SQL, cuadre de totales e idempotencia (`--check`); faltan RLS en vivo, CRUD y E2E |
| 30 Producción | ⛔ | **esperando tu autorización** |

**Avance real: ~35 %.** Auditoría, respaldo, modelo, migraciones e importador están listos y validados offline. Falta conectar los consumidores (mapa, Ops, Mi Negocio, BAQUI, web, Flutter) y aplicar en producción.

## 7. Plan de aplicación (cuando lo autorices)

1. Respaldo completo desde el dashboard de Supabase (Database → Backups) o `pg_dump`.
2. Aplicar `20261005070000` y `20261005080000` (`supabase db push`).
3. Ejecutar `supabase/imports/20261005_territories_import.sql`.
4. Validar con `select public.data_source_status();`: places = 237, businesses = 25 + 5, map_ready = 37 + …
5. Ejecutar los advisors de seguridad y rendimiento de Supabase.
6. Desplegar las Edge Functions modificadas.
7. Cambiar los consumidores uno por uno (mapa → BAQUI → web), manteniendo territories-data.js como fallback de solo lectura.
8. Monitorear y retirar dependencias de Firestore.

## 8. Rollback

- **Importación:** `delete from public.places where legacy_source = 'territories-data.js' and updated_by = 'migration:territories';` (lo mismo en businesses y verification_sources con `verified_by = 'migration:territories'`). Las filas editadas en Ops no se tocan.
- **Migración 080000:** las columnas y tablas nuevas son aditivas; se pueden retirar (`drop table prices, verification_sources, data_migration_runs`; `drop trigger trg_guard_business_verification`; restaurar las políticas anteriores: places `using (true)` y businesses `verified = true`). No se perdieron datos previos.
- **Web:** territories-data.js sigue intacto como respaldo.
- **Respaldo de archivos:** `backups/migration-20261005/` con SHA256SUMS.
