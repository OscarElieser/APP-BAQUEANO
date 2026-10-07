# 🧭 BAQUEANO OPS CENTER — Auditoría real (2026-10-07)

> 🎯 **Por qué:** es el entregable inicial obligatorio del PROMPT MAESTRO (§92). Antes de rediseñar, documenta qué existe, qué funciona y qué es falso.
> ⚙️ **Cómo:**
> - Producción: hash por fragmentos de `admin.html` y de los JS servidos, obtenidos desde Supabase con `extensions.http`.
> - Edge Functions: lista desplegada y comparación del código de `baqueano-ops` contra el repo.
> - Base de datos: consultas SQL directas a Supabase.
> - Código: lectura de `admin.html`, `js/ops-center/**` y `js/shared/roles.js`.
>
> 📦 **Qué contiene:**
> - A. Auditoría.
> - B. Mapa de dependencias.
> - C. Matriz P0–P3.
> - D. Plan de intervención.
> - E. Riesgos.
>
> Todo dato de este informe salió de una consulta o lectura real del 2026-10-07. Si algo no se pudo comprobar, se dice.

**Código auditado:** HEAD `6f4d97d` (rama `claude/sleepy-goodall-kqogrq`, igual a `main`).
**Producción:** `https://baqueanonicaragua.com`, con `Last-Modified: Wed, 07 Oct 2026 19:19:24 GMT`.

---

## A. Auditoría real

Leyenda: 🟢 FUNCIONAL · 🟡 PARCIAL · 🔴 NO FUNCIONAL · ⚪ SIN DATOS · 🔵 DEMO · 🟣 NO CONFIGURADO

| ID | Módulo | Estado | Evidencia | Problema | Riesgo | Prioridad | Solución |
|---|---|---|---|---|---|---|---|
| A01 | Despliegue GitHub ↔ producción | 🟢 | Los 5 JS del Ops Center tienen el mismo md5 en producción y en HEAD. `admin.html`: 70 fragmentos de 2000 caracteres; 69 iguales al build. El último solo difiere por el script `/cdn-cgi/challenge-platform` que inyecta Cloudflare. | **No hay desfase hoy.** Lo que el propietario vio como "estado antiguo" es contenido que está en el propio HEAD (ver A03 y A04). | Medio: Cloudflare inyecta un `<script>` inline; si se quita `unsafe-inline`, ese script queda bloqueado. | P0 (verificar en cada deploy) | Panel "Código vs Producción" en el Ops Center con hash real (fase 1). |
| A02 | Catálogo simulado (`ops-mock-data.js`) | 🟢 | `admin.html:1621` dice "El Ops Center no carga catálogos locales ni datos simulados", y el archivo no está en la lista de `<script>`. | El motor todavía tiene la rama `window.BaqueanoMockData` (`ops-engine.js:2428`, `:6676`), sin efecto en producción. | Bajo | P2 | Bandera `DEMO MODE` explícita, apagada en producción. |
| A03 | Sistema → Backup y Sincronización (vista 35) | 🔴 | `ops-engine.js:6262-6271` y `admin.html:970-1060`. | Datos **inventados**:<br>• "Completadas" muestra `243` si no hay datos;<br>• "Pendientes/Fallidas/Conflictos" = `0` fijo;<br>• "Último backup" y "Última sincronización" = **hora actual del navegador**;<br>• el circuito dice `CLOSED (Normal · Cero Fallos)`;<br>• el HTML trae `🟢 OPERATIVO`/`ONLINE` fijos antes de pintar.<br>En la BD, `backup_operations` = 0 y `storage_backups` = 0. | **Alto**: declara un "BACKUP OK" sin evidencia (§41). | **P0** | Mostrar SIN DATOS / SIN COMPROBAR con la fuente (`backup_operations`) y quitar valores fijos. |
| A04 | Arquitectura "Firebase First, Supabase Fallback" | 🔴 | Subtítulo de la vista 35 (`pages.admin.view35Backup.p1`, 6 idiomas), etiquetas "Firebase (Principal)" y "Supabase (Respaldo)", `ops-engine.js:1963` y el campo de solo lectura `ops-engine.js:6124`. Hay 5 documentos con el principio viejo (algunos ya marcados "histórico"). | Contradice la arquitectura vigente: Supabase es el núcleo y Firebase, la identidad. | Medio: confunde a quien opera. | **P0** | Corregir textos de interfaz (6 idiomas) y comentarios; los documentos históricos llevan un aviso, sin reemplazo ciego. |
| A05 | API administrativa `baqueano-ops` | 🟢 | v4 ACTIVE; el código desplegado es **idéntico** al del repo (44.776 caracteres). Acciones: whoami, overview, health, list, get, audit_list, save, set_status, verify, kpis, impact, db_health, duplicates, automation_runs, automation_run_now, log. | — | — | — | Mantener. |
| A06 | Edge Functions desplegadas | 🟢 | Las 14 carpetas de `supabase/functions` (menos `_shared`) están ACTIVE en Supabase. | Solo se comparó el código de `baqueano-ops`; las demás se publicaron en esta sesión desde el repo, sin comparación nueva. | Bajo | P2 | Comparación automática de hash en el panel de despliegue. |
| A07 | RBAC | 🟡 | `staff_roles`: 4 activos (1 super_admin, 2 admin, 1 auditor). `roles` 7, `permissions` 36, `role_permissions` 110, **`user_roles` 0**. `baqueano-ops` decide con el claim `role` o el correo verificado en `staff_roles`. `js/shared/roles.js` solo distingue escritura (super_admin, admin) y lectura (auditor). | El modelo de permisos atómicos existe en la BD, pero **el servidor no lo usa**: no existen todavía Editor, Moderador, Verificador ni Gestor territorial. | Medio | P1 | Resolver permisos desde `role_permissions` en `baqueano-ops` (expandir sin romper `staff_roles`). |
| A08 | Lugares (`places`) | 🔴 en interfaz · 🟢 en API | La API admite `places` (lista blanca de escritura: nombre, territorio, categoría, descripciones, coordenadas, fuente, dirección). `ops-live-data.js:43-52` **no tiene ningún módulo de Lugares**. | 237 lugares sin gestión editorial. | Alto (es el núcleo de "lo que no sale en el mapa") | **P0** | Módulo "Lugares" sobre la API existente: lista, filtros de calidad, edición y auditoría. |
| A09 | Calidad de `places` | 🟡 | Total 237, publicados 237, verificados 96. **Sin municipio 108**, **sin fuente 141**, **sin coordenadas 40**. Fuera de Nicaragua 0, sin descripción 0. | Datos incompletos visibles al público. | Medio | P1 | Filtros de calidad en el módulo Lugares. **No se completan datos automáticamente sin fuente.** |
| A10 | Destinos (`destinations`) | 🟡 | 7 en total, 7 publicados; los 7 sin municipio y sin fuente. | La web usa 237 lugares; `destinations` es un catálogo pequeño y paralelo. | Medio | P1 | Decidir la relación destinations ↔ places (no duplicar). |
| A11 | Tablas culturales | ⚪ | `experiences`, `gastronomy`, `culture` y `tourism_services` = 0 filas. | El contenido real vive en HTML/JS (gastronomía, música con 93 pistas, historia). | Medio | P2 | Migración EXTRACT→…→SWITCH READ por dominio, sin borrar el HTML. |
| A12 | Auditoría inmutable | 🟢 con matiz | Trigger `audit_logs_no_update_delete` (UPDATE/DELETE); `authenticated` solo SELECT. 5 registros. | `service_role` conserva TRUNCATE (los triggers de fila no lo frenan). | Bajo | P2 | `REVOKE TRUNCATE` + trigger de TRUNCATE (migración no destructiva). |
| A13 | Presencia | 🟢 | `presence_sessions` 190 y `presence_events` 391 (Edge Function `baqueano-presence`). | — | — | — | Mantener. |
| A14 | BAQUI | 🟡 | `ai_sessions` 12, `ai_messages` 24, `rag_sources` 21, `baqui_feedback` 0. | Faltan latencia p50/p95, costo y tasa de acierto RAG como métricas. | Medio | P2 | AI Control Center leyendo `ai_messages`. |
| A15 | Android | 🟡 | `app_download_events` 2; manifiesto real de la APK (`data/app-release.json`). Ninguna tabla de dispositivos ni de crashes. | Sin telemetría de la app. | Bajo | P2 | Mostrar "NO CONFIGURADO" (ya lo hace `ops-android-app.js`). |
| A16 | Backups | 🔴 | `backup_operations` 0, `storage_backups` 0. | Nunca se registró una copia. | Alto | P1 | Registrar copias reales y simulacro de restauración; **jamás** "BACKUP OK" sin evidencia. |
| A17 | Gestión del sitio sin código (CMS) | 🟣 | No existen `pages`, `page_sections`, `navigation_items`, `site_settings`, `feature_flags` ni `media`. | Toda la portada y la navegación están en HTML. | Alto (objetivo §94-131) | P1 | Esquema CMS incremental (fase 2-3). |
| A18 | Seguridad del frontend | 🟡 | `admin.html`: 28 `onclick` inline y 1 `<script>` inline. `ops-engine.js`: 49 `innerHTML`, 2 `confirm()` y 2 `setInterval`. CSP con `'unsafe-inline'` en script-src y style-src. | XSS si algún `innerHTML` recibe datos sin escapar. | Medio | P1 | Migración gradual a addEventListener/textContent; luego quitar `unsafe-inline` (ver A01). |
| A19 | Monolito `ops-engine.js` | 🟡 | 7.668 líneas, 366 KB. | Carga y mantenimiento costosos. | Medio | P2 | Extraer módulos uno por uno (el primero: Lugares, en archivo propio). |
| A20 | Perfiles | ⚪ | `profiles` 0 y `traveler_profiles` 0. | Identidad unificada todavía sin usuarios vinculados. | Medio | P1 | Ya en curso (tareas 16/17). |
| A21 | Hostinger / Cloudflare / Azure | 🟢 parcial | Nameservers de Cloudflare activos (cabecera `cf-*` y script de desafío inyectado en producción). Origen Azure (Nginx con gzip/limits verificado en la sesión). Hostinger: registrador del dominio. | WAF y reglas de Cloudflare no se pueden comprobar desde aquí (no hay API token). | Bajo | P2 | Panel de infraestructura con estado "NO VERIFICADO" donde falte acceso. |

## B. Mapa de dependencias

```
ADMIN (admin.html + js/ops-center/*)
  │  Firebase ID token (firebase-auth-compat)        js/shared/roles.js (vista; no autoriza)
  ▼
EDGE FUNCTIONS  baqueano-ops (CRUD/KPIs/auditoría) · baqueano-status (health) · baqueano-ai (BAQUI)
                baqueano-community · -reviews · -intake · -messages · -notifications · -presence
                baqueano-sos · -reservas · -identity · -profile · -mirror (Firestore→Supabase)
  │  verifica JWT Firebase (JWKS) → staff_roles / claim → lista blanca → audit_logs
  ▼
SUPABASE  places(237) · destinations(7) · businesses(31) · departments(17) · municipalities(153)
          audit_logs · presence_* · ai_* · rag_sources · automation_runs · app_download_events
  │  RLS: lectura pública solo de lo publicado
  ├──▶ WEB (baqueanonicaragua.com: Cloudflare → Azure/Nginx → archivos estáticos + supabase-js)
  ├──▶ ANDROID (Flutter: catálogo Supabase; Firestore heredado en flujos sin migrar)
  └──▶ BAQUI (baqueano-ai: RAG sobre rag_sources/knowledge_documents)
```

## C. Matriz de prioridad

- **P0 (ahora):**
  - A03: Backup con datos inventados.
  - A04: "Firebase First" en la interfaz.
  - A08: módulo Lugares.
  - A01: verificación de despliegue.
- **P1:**
  - A07: permisos atómicos en el servidor.
  - A09/A10: calidad y relación destinos ↔ lugares.
  - A16: backups reales.
  - A17: esquema CMS.
  - A18: `innerHTML`/`onclick`.
  - A20: identidad.
- **P2:**
  - A02: DEMO MODE.
  - A06: hash de todas las funciones.
  - A11: migración cultural.
  - A12: TRUNCATE.
  - A14: AI Control Center.
  - A15: telemetría Android.
  - A19: monolito.
  - A21: infraestructura.
- **P3:** rediseño visual completo "Territorial Intelligence Command Center", page builder y reportes XLSX, después de que la verdad y los datos estén resueltos.

## D. Plan exacto de intervención (esta entrega)

1. **A03/A04 — Verdad en Backup y arquitectura:**
   - `ops-engine.js` → `renderBackupSyncModule()`:
     - sin `243`, sin hora falsa ni circuito inventado;
     - lee `backup_operations` mediante `baqueano-ops`; si no hay registros, muestra SIN DATOS.
   - `admin.html` vista 35: estados iniciales "SIN COMPROBAR".
   - Subtítulo y etiquetas en 6 idiomas: Supabase = núcleo de datos y Firebase = identidad.
   - Comentarios de `ops-engine.js` (línea 1963) y campo de la línea 6124.
2. **A08 — Módulo Lugares:**
   - archivo nuevo `js/ops-center/ops-places.js`, fuera del monolito;
   - lista paginada en el servidor mediante `baqueano-ops list entity=places`;
   - filtros de calidad (sin municipio, sin fuente, sin coordenadas, verificados);
   - edición con `save`, que el servidor valida y audita;
   - enlace "Ver en el mapa".
3. **Pruebas:**
   - Playwright del módulo con la API simulada;
   - prueba negativa real contra `baqueano-ops` (sin token → 401);
   - i18n con 0 errores.
4. **Docs:** este informe; `OPS_CENTER_ARCHITECTURE.md` y los demás documentos de §79 en las fases siguientes.

## E. Riesgos y cómo se evitan

| Riesgo | Mitigación |
|---|---|
| Romper vistas existentes del monolito | Cambios acotados a una función y un archivo nuevo. Sin reescritura. Pruebas antes de publicar. |
| Escrituras sin permiso | Todo pasa por `baqueano-ops`, que ya valida token, rol, lista blanca y auditoría. El navegador nunca usa `service_role`. |
| Datos inventados al "completar" lugares | El módulo solo edita lo que el administrador escribe; no autocompleta municipio, fuente ni coordenadas. |
| Quitar `unsafe-inline` y romper Cloudflare/inline | No se toca la CSP en esta entrega (A01 documenta el script de Cloudflare). |
| Traducciones rotas | Claves nuevas en 6 idiomas; `npm run i18n` con 0 errores antes del commit. |

---

## F. Estado tras la primera intervención (2026-10-07)

| ID | Antes | Después | Evidencia | Estado |
|---|---|---|---|---|
| A01 | Se suponía un desfase con producción | Se comprobó que no hay desfase (md5 de JS y de los fragmentos de `admin.html`) | Consultas `extensions.http` documentadas en A01 | VERIFICADO |
| A03 | "243" sincronizados, 0 fallos fijos, hora actual como "último backup", circuito "Cero Fallos", 🟢 OPERATIVO fijo en el HTML | Estados iniciales "SIN COMPROBAR". Los KPI se leen de `backup_operations` y `storage_backups` vía `baqueano-ops`; con 0 filas se muestra "Sin registros…/Sin copias registradas" y "⚪ SIN DATOS" | Playwright: "Backup sin datos inventados" ✅ en 3 escenarios | VERIFICADO (con API simulada); con datos reales de producción: PENDIENTE DE VALIDACIÓN tras el deploy |
| A04 | "FIREBASE FIRST, SUPABASE FALLBACK", "Firebase (Principal)", "Supabase (Respaldo)", campo "Firebase (Primario) + Supabase (Respaldo) ACTIVA" | "Supabase = núcleo de datos · Firebase = identidad", en 6 idiomas; el comentario del gestor de almacenamiento queda marcado como heredado | `npm run i18n` 0 errores; Playwright comprueba el subtítulo | VERIFICADO |
| A08 | Sin módulo de Lugares | Vista **43 · Lugares** (`js/ops-center/ops-places.js`): lista paginada en el servidor, 8 filtros de calidad con conteo real, búsqueda, territorio, editor (solo envía lo que cambió), crear como borrador, publicar/despublicar, archivar con doble confirmación, restaurar, verificar con fuente obligatoria y vencimiento, "Ver en el mapa" | Playwright 35/35 (admin 1366 y 390 px, auditor 1366 px); axe 0 | VERIFICADO (con API simulada) |
| A08-API | `baqueano-ops` no tenía filtros, publicación ni verificación para `places` | v5: `quality`, `department_id`, `is_published`/`archived_at`, verificación con traza en `attributes.verification` y entidades de solo lectura `backup_operations`/`storage_backups` | Desplegada == repo (comparación textual); sin token → 401; token falso → 401; el filtro anidado "sin fuente" en PostgREST devuelve 141 (igual que el SQL) | DESPLEGADA · escrituras con token real PENDIENTES DE VALIDACIÓN (requiere sesión del propietario) |
| A18 | `innerHTML` del avatar con nombre y URL (la URL puede venir de localStorage) | Avatar armado con DOM; solo acepta https | Revisión de código | VERIFICADO |
| §71 | Un error de un módulo al preparar el panel mostraba "No tienes autorización" a un admin válido | Solo un fallo al resolver el rol niega el acceso; un módulo que falla se registra | Reproducido en Playwright (listener heredado de Firestore) y corregido | VERIFICADO |
| a11y | `aria-label` "btn Google Login" derivado del id y contraste 3.6 en el login | El ayudante no pone nombre a botones con texto visible; contraste ≥ 4.5 | browser-qa `admin.html`: 16 anchos, 0 fallos (antes 3, también en HEAD) | VERIFICADO |
| Config | "Versión mínima requerida 1.2.4 (Build 18)" (no existe) | Campo vacío; la APK publicada (1.0.0, código 1) es la fuente | Revisión de código | VERIFICADO |

**Sigue pendiente (no se declara hecho):**
- RBAC atómico en el servidor (A07).
- Esquema CMS (A17).
- Backups reales con simulacro de restauración (A16).
- Migración de contenido cultural (A11).
- Quitar `unsafe-inline` (A18).
- Separar el resto del monolito (A19).
- Rediseño "Territorial Intelligence Command Center" (P3).
