# DATA-AUDIT — Supabase (heiudfpthqwtjrtluqlm) · 2026-10-06

> 🎯 **POR QUÉ:** el propietario pidió auditar la base real y conectar Web, App y Ops Center a información real, sin inventar datos.
> ⚙️ **CÓMO:**
> - Consultas directas con el conector MCP de Supabase (`list_tables`, `get_advisors` y SQL de solo lectura).
> - Las correcciones son aditivas: `ALTER … ADD COLUMN IF NOT EXISTS` y `UPDATE` idempotentes que no pisan ediciones hechas en Ops Center (`updated_by = 'migration:territories'`).
> - Cada cifra de este informe sale de una consulta del 2026-10-06.
> 📦 **QUÉ:** el estado de las entidades, lo corregido hoy, las brechas reales y los próximos pasos.

## 1. Inventario (filas reales)

| Entidad | Filas | Nota |
|---|---|---|
| `departments` | 17 | 15 departamentos y 2 regiones autónomas |
| `municipalities` | 153 | Todos con área y caja del contorno desde hoy (antes: solo nombre) |
| `places` | 237 | 96 `verified` · 141 `pending_review` (sin fuente) |
| `businesses` | 30 | 24 verificados, 5 sin `source_url`, 10 sin coordenadas |
| `destinations` | 7 | 7 `published` |
| `verification_sources` | 144 | Fuentes citadas por lugar o negocio |
| `travel_plans` | 31 | Planes generados por BAQUI |
| `ai_sessions` / `ai_messages` | 4 / 8 | |
| `analytics_events` | 11 | Analítica propia con consentimiento |
| `staff_roles` | 4 | 1 super_admin, 2 admin, 1 auditor |

Tablas culturales y operativas **vacías (0 filas)**: `culture`, `heritage`, `museums`, `gastronomy`, `music`, `crafts`, `festivals`, `legends`, `historical_figures`, `communities`, `events`, `experiences`, `routes`, `route_stops`, `emergencies`, `day_passes`, `prices`, `sustainability_practices`, `community_impact`, `entity_accessibility`, `reviews`, `favorites`, `reservations`, `testimonials`.

Ese contenido cultural vive hoy en la web (`territories-data.js`, `territories-rich-data.js` y las páginas de historia, música y gastronomía) y todavía **no** se migró a esas tablas. 🔴 Pendiente real: no se llenan con datos de ejemplo.

## 2. Corregido hoy (con verificación)

| Problema | Causa | Cambio | Prueba | Estado |
|---|---|---|---|---|
| 177 de 237 lugares sin coordenadas en Supabase, aunque la web ya mostraba 216 pines | El importador solo leía `lat`/`lng` de `territories-data.js` e ignoraba `data/territory-places.json` (geocodificado, dentro del contorno oficial) | `migrate-territories-to-supabase.mjs`: respaldo geocodificado, siempre `approximate` o `reference` (nunca `exact`); `attributes.geo_source` guarda proveedor, etiqueta y OSM | Delta aplicado (141 lugares y 1 negocio); nueva instantánea → `territories-supabase-delta.mjs` = **0 cambios pendientes** | 🟢 |
| 193 lugares sin municipio | Solo se enlazaba si la fuente traía "zona" | Enlace por etiqueta administrativa OSM, solo con coincidencia **exacta** y **única**. Se descartan los segmentos iguales al nombre del departamento y los nombres que mencionan otro municipio | Sin municipio: 193 → **108**. Municipio de otro departamento: **0** | 🟢 |
| 5 pines geocodificados en el lugar equivocado | Nominatim devolvió homónimos: Hostal Puesta del Sol (Ometepe) en San Juan del Sur; Bluff Beach en Falso Bluff; Cascadas de Chontales en el lago; RVS Río San Juan en Los Guatuzos; Santa Lucía en Teustepe | `website/data/geocode-review.json` (rechazos revisados a mano, con motivo); el geocodificador y el importador los respetan. Regla nueva: un lago no es el punto de algo que no es un lago | Los 5 pasan a `unresolved` y se conservan en `rejected` del JSON. No se inventó ningún reemplazo | 🟢 |
| 153 municipios con solo nombre | Sin fuente de geometría | Migración `20261006040000_municipality_profile.sql` (columnas nuevas) y `supabase/imports/20261006_municipalities_geo.sql` | 153/153 con `area_km2`, `boundary_bbox` e `identity`; `latitude`/`longitude` intactos | 🟢 |
| 3 funciones con `search_path` mutable (Advisors 0011) | Sin `SET search_path` | `20261006030000_search_path_hardening.sql` | Advisors vuelve a correr; `get_nearby_*` siguen respondiendo (6 resultados de prueba en Managua) | 🟢 |

## 3. Advisors de seguridad (estado tras los cambios)

| Aviso | Decisión | Motivo |
|---|---|---|
| `rls_enabled_no_policy` en `data_migration_runs` | Aceptado | Tabla solo del servidor: sin políticas significa denegar todo al cliente. Es lo que se busca |
| `extension_in_public` (`vector`) | Pendiente, sin mover | Mover la extensión puede romper columnas `vector` existentes. Requiere ventana y respaldo |
| `anon_security_definer_function_executable`: `track_event`, `track_commercial_action`, `submit_feedback`, `public_impact_summary` | Aceptado por diseño | Son RPC públicas (analítica con consentimiento, retroalimentación, contador de impacto); validan sus entradas. El antispam de servidor queda en el bloque E |
| ídem: `security_posture` | Aceptado | La usa CI (`deploy-production.yml:204`) para verificar la postura RLS con la clave anon. Expone *grants*, no datos |
| `authenticated_security_definer_function_executable` (12) | En revisión | Verificado en el código de `data_source_status` y `db_health_report`: exigen `has_permission` dentro de la función. `has_role`, `has_permission` e `is_business_manager` solo responden sobre quien llama. Las demás (`kpi_dashboard`, `strategic_impact_report`…) se revisan en la auditoría de seguridad (`docs/security-audit/`) |

## 4. Brechas reales (no se rellenan con datos inventados)

1. **141 lugares sin fuente** (`pending_review`). Se muestran en la web como lugar sin sello de verificación. Necesitan una fuente cargada en Ops Center.
2. **40 lugares sin coordenadas** (los geocodificadores no encontraron un punto confiable) y **108 sin municipio**.
3. **Municipios**: población, historia, fiestas patronales y coordenadas de la cabecera quedan en `pending_fields` (`profile_status = 'pending_verification'`). Las fuentes oficiales (INIDE, INIFOM, Wikidata) no son accesibles desde el entorno de esta sesión: bloqueo de red documentado. El área publicada es la del contorno OSM y en municipios lacustres incluye agua; está rotulada así.
4. **Tablas culturales vacías** (sección 1).
5. **Negocios**: 5 sin `source_url` y 10 sin coordenadas.

## 5. Cómo repetir esta auditoría

```bash
node website/scripts/migrate-territories-to-supabase.mjs        # dry-run + SQL idempotente
# instantánea (SQL en la cabecera de territories-supabase-delta.mjs) → snapshot.json
node website/scripts/territories-supabase-delta.mjs snapshot.json delta.sql   # 0 cambios = sincronizado
node tools/data/build-municipalities.mjs --check                 # 153 municipios al día
```
