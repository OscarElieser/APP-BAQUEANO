# OPS-CENTER-AUDIT — admin.html · 2026-10-06

> 🎯 **POR QUÉ:** el Ops Center es la fuente que alimenta la web y la app. Si muestra datos incompletos o inseguros, todo lo demás hereda el error.
> ⚙️ **CÓMO:** revisión de `website/admin.html`, `js/ops-center/ops-engine.js`, `ops-live-data.js` y la Edge Function `baqueano-ops`, contrastada con conteos reales de Supabase.
> 📦 **QUÉ:** qué pestañas leen datos reales, qué se corrigió y qué queda.

## 1. Pestañas conectadas a Supabase

**Arquitectura:** 36 pestañas en total. 10 leen y escriben datos reales a través de `baqueano-ops`, que usa service role, solo para personal autorizado y con auditoría en el servidor.

| Pestaña | Entidad | Filas reales | Escritura |
|---|---|---|---|
| 03 Destinos | `destinations` | 7 | Sí |
| 07 Mapa | `destinations` + **`places`** (nuevo) | 7 + 237 (solo se dibujan las que tienen coordenadas) | No |
| 08 Negocios | `businesses` | 30 | Sí |
| 04 Territorios | `departments` | 17 | No |
| 05 Municipios | `municipalities` | **153** (antes se veían 100) | No |
| 06 Experiencias, 15 Gastronomía, 17 Cultura, 34 Tarifas | tablas homónimas | 0. Se muestra "SIN DATOS", sin relleno | No |
| 09 Verificaciones | `verification_requests` | — | Verificar o rechazar |

**Otras pestañas con datos reales:** SOS (`sos_events`), auditoría (`audit_logs`), KPIs (`kpi_dashboard`), impacto y salud de la BD. Las demás son paneles de gestión sin entidad propia todavía.

## 2. Correcciones de hoy

| Problema | Causa | Cambio | Estado |
|---|---|---|---|
| Municipios mostraba 100 de 153; lugares quedaba cortado | `loadTab` pedía solo la primera página (máximo 100 filas) | `listAll()` recorre las páginas hasta completar `total`, con un tope de 2000 filas. El servidor ya pagina, así que funciona sin redesplegar | 🟢 en el código de la web (se publica con el autodeploy) |
| El mapa del equipo no mostraba el catálogo de lugares | Solo leía `destinations` | Suma `places`, con la precisión de la ubicación en español (aproximada, de referencia o centro del municipio) | 🟢 ídem |
| Municipios sin área ni identidad en el panel | El `select` de `baqueano-ops` no pedía las columnas nuevas | `select` con `area_km2`, `identity` y `profile_status`; el panel los muestra como descripción | 🟡 falta desplegar `baqueano-ops` |
| XSS almacenado vía `businesses.cover_image` | `renderTableRow` y `previewEntity` interpolaban sin codificar | `escape()`, `jsAttr()`, `safeUrl()`, estado en lista blanca y CHECK en la BD | 🟢 (ver `docs/security-audit/2026-10-06/`) |
| Menú lateral sin teclado ni enlace directo | `<a>` sin href | `href="#tab"`, historial y `aria-current` | 🟢 |
| La revocación en RBAC no aplicaba a quien entra con Firebase | `resolveActor` usaba solo el claim o `staff_roles` | `_shared/staff-revocation.ts` | 🟡 falta desplegar |

## 3. Pendientes

1. **No hay pestaña "Lugares" con edición.**
   - `baqueano-ops` ya soporta la entidad `places` (lectura, escritura y verificación).
   - Falta la vista en el panel para que el equipo cargue la fuente de los 141 lugares sin fuente y el municipio de los 108 sin municipio.
   - Es el siguiente paso de mayor impacto para la calidad de datos.
2. **Tablas culturales vacías.** Experiencias, gastronomía, cultura, eventos y tarifas: el contenido existe en la web pero no se migró. No se rellenan con ejemplos.
3. **Despliegue de Edge Functions.** Lo hace el propietario; el comando está en `docs/security-audit/2026-10-06/NEEDS-VALIDATION.md`.
4. **Textos del panel en español fijo.** La i18n del runtime del Ops Center sigue pendiente (tarea 19).
