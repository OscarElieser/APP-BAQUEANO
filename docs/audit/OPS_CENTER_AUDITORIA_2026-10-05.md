# 🧭 BAQUEANO OPS CENTER — Auditoría técnica real (Fase A–C)

> Fecha: 2026-10-05.
> Alcance:
> - Archivos: `website/admin.html` (1 603 líneas) y `website/js/ops-center/` (`ops-engine.js` 7 509, `ops-ia-copilot.js` 716, `ops-community-moderation.js` 410, `ops-mock-data.js` 371).
> - CSS: `css/ops-matte-theme.css` 1 860 y `css/modules.css` 2 685.
> - Supabase (`heiudfpthqwtjrtluqlm`), Firebase, Edge Functions, API de Azure y CSP.
>
> Método: lectura del código, ejecución de `admin.html` en Chromium con los SDK reales servidos localmente, consultas SQL de solo lectura a Supabase y búsqueda en el historial de git. **Ninguna conclusión se basa en suposiciones**: cada hallazgo cita archivo y línea.

## 🎯 POR QUÉ
El propietario define el Ops Center como el centro central de operaciones del ecosistema (Web + Android + BAQUI + Supabase + Firebase). Antes de rediseñar hay que saber qué funciona de verdad, qué está desconectado y qué muestra datos que no son reales.

## ⚙️ CÓMO (mapa de la arquitectura actual)

```text
admin.html (1 603 líneas, 36 módulos data-tab, 225 estilos en línea, 28 onclick)
 ├─ firebase-app-compat + firebase-auth-compat          → login Google ✅
 │    ✗ NO carga firebase-firestore-compat ni firebase-storage-compat (nunca lo hizo: git log -S)
 ├─ supabase-js + js/supabase-config.js                  → cliente anónimo ✅
 ├─ js/shared/roles.js                                   → rol: claim / matriz / whoami (servidor) ✅
 ├─ js/ops-center/ops-engine.js
 │    ├─ OpsAuth   → Google → rol → applyAuthorization (+ modo Auditor solo lectura) ✅
 │    ├─ OpsCMS    → TODO el CRUD y los listeners usan firebase.firestore()  ✗ getDb() = null
 │    │             escrituras a Supabase desactivadas (SUPABASE_BROWSER_WRITES = false, correcto por seguridad)
 │    ├─ OpsStorage→ Firebase Storage (ausente) → Supabase Storage
 │    └─ OpsUI     → render de 36 módulos, Ctrl+K, reloj, sidebar colapsable (sin persistencia)
 ├─ js/ops-center/ops-ia-copilot.js  → "pulso" e IA con métricas FIJAS (1,248 / 88 % / 12 % / 1.4 s)
 ├─ js/community-api.js + ops-community-moderation.js → Edge Function baqueano-community ✅ (único módulo con datos reales)
 └─ (ops-mock-data.js existe, pero ninguna página lo carga)

Supabase (real, 2026-10-05): 47 tablas con RLS · PostGIS (geom) · pgvector (knowledge_documents.embedding)
   departments 17 · destinations 7 · businesses 5 · travel_plans 31 · municipalities 0 · profiles 0
   reservations 0 · emergencies 0 · audit_logs 0 · traffic_sessions 0 · firestore_mirror 0 · ai_messages 0
Edge Functions: baqueano-community (RBAC) · baqueano-mirror (Firestore→Supabase) · baqueano-ai · baqueano-status
API Azure: /api/azure/health · /api/azure/db · /api/azure/evidence/crud   (no existe /api/admin/*)
```

## 📦 QUÉ (hallazgos)

### 🔴 CRÍTICO

| # | Problema | Archivo / línea | Causa | Riesgo | Solución | Prior. | Impacto | Dependencias |
|---|---|---|---|---|---|---|---|---|
| C1 | **El Ops Center no lee ni escribe ningún dato del catálogo.** Los listeners nunca arrancan y crear, editar o publicar falla con "Base de datos no conectada". | `ops-engine.js:2289` (`getDb`), `:2323` (`initDataSync`), `:2658` (`saveEntity`), `:3008` (`seedInitialContent`) | `admin.html` no carga `firebase-firestore-compat`; todo `OpsCMS` depende de Firestore. Verificado en el navegador: `typeof firebase.firestore === "undefined"`. | El panel administra en apariencia, pero nada se guarda. La Web y Android no reciben cambios. | Capa de datos sobre **Supabase** (directiva 2026-10-05): Edge Function administrativa con token de Firebase, RBAC y auditoría; lecturas reales por módulo. | P0 | Todo el panel | `roles.js`, `staff_roles`, RLS |
| C2 | **KPIs inventados presentados como reales**: 1,248 consultas, 88 % Gemini, 12 % Groq, 1.4 s, "98 % de pulso", "0 fallos". | `admin.html:750-795`; `ops-ia-copilot.js:85,331,493-497` | Valores fijos de una demo. | Decisiones sobre datos falsos; pérdida de credibilidad ante el jurado. | Estados explícitos (REAL / SIN DATOS / NO CONFIGURADO / DEMO / ERROR) con origen; leer `ai_messages` (hoy 0 → "Sin datos"). | P0 | Dashboard, IA | `ai_messages`, `baqueano-ai` |
| C3 | **Contadores del menú fijos en HTML** (29 destinos, 153 municipios, 14 negocios, 12 usuarios…) y métricas con valores de reserva `\|\| 29`, `\|\| 10`, `\|\| 12`. | `admin.html:119-179`; `ops-engine.js:6526-6531` | Números escritos a mano. | La BD real tiene 7 destinos, 0 municipios y 5 negocios. | Contadores desde conteos reales de Supabase; "—" mientras carga. | P0 | Navegación | C1 |
| C4 | **Éxito falso en respaldo**: el botón llama a `/api/admin/backup/retry` (no existe) y, si falla, muestra "Servicio de respaldo verificado. Cola al corriente." | `ops-engine.js:6492-6506` | `catch` que informa éxito. | Se cree que hay respaldo cuando no lo hay. | Mostrar el error real y el estado "NO CONFIGURADO" hasta que exista el endpoint. | P0 | Backups | API Azure |
| C5 | **Arquitectura contradictoria en pantalla**: el subtítulo dice "Firebase (Auth & Hosting) + Supabase (base turística)", la consola habla de "sincronización canónica hacia Cloud Firestore" y "Firebase principal / respaldo Supabase", y `AGENTS.md` decía "Firestore prioritaria". | `admin.html:385,395-400`; `ops-engine.js:3011`; `AGENTS.md` regla 5 | Directivas sucesivas sin consolidar. | Nadie sabe dónde vive el dato oficial. | Una sola fuente de verdad: **Supabase BD principal; Firebase = Auth + Hosting** (directiva 2026-10-05) en textos, código y documentación. | P0 | Todo | Docs |

### 🟠 ALTO

| # | Problema | Archivo / línea | Causa | Riesgo | Solución | Prior. |
|---|---|---|---|---|---|---|
| A1 | El espejo Firestore→Supabase nunca recibió escrituras (`firestore_mirror` = 0) y `profiles` = 0: no existe hoy la "sincronización de perfiles" que declara la documentación | `js/firestore-mirror.js`, `baqueano-mirror` | El panel no escribe en Firestore (C1); la web pública escribe poco | Datos de usuarios solo en Firebase | Escribir directo en Supabase vía Edge Function; perfiles al iniciar sesión | P1 |
| A2 | Se consulta la IP pública del administrador a 3 servicios externos (ipify, seeip, httpbin) que la CSP bloquea | `ops-engine.js:2293-2321` | Registro de IP desde el cliente | Fuga de privacidad a terceros; errores de consola; IP no confiable | La IP la registra el servidor (Edge Function, cabecera `x-forwarded-for`) | P1 |
| A3 | Auditoría escrita desde el navegador a Firestore (inactivo) → `audit_logs` vacío; sin valor anterior/nuevo | `ops-engine.js:2540-2600` | C1 | Sin trazabilidad real | Auditoría en el servidor con antes/después, UID, rol, origen | P1 |
| A4 | "Autonomía IA": un `setInterval` de 5 min ejecuta jobs de IA sin revisión y sin limpieza al salir | `ops-engine.js:7027-7040` | Diseño experimental | La IA podría modificar contenido oficial | Solo con revisión humana; desactivada por defecto | P1 |
| A5 | 46 usos de `innerHTML` (38 con `escape`) y 55 `onclick` generados como texto | `ops-engine.js` | Plantillas de texto | Riesgo de XSS si un campo no se escapa | Revisar cada uno y pasar progresivamente a `textContent` o nodos | P1 |
| A6 | `script-src 'unsafe-inline'` necesario por 28 `onclick` en línea | `admin.html`, CSP | Handlers en línea | Debilita la CSP | Migrar a `addEventListener` y luego retirar `unsafe-inline` | P2 |

### 🟡 MEDIO

| # | Problema | Archivo / línea | Solución |
|---|---|---|---|
| M1 | Sidebar colapsable sin persistencia ni tooltips; 36 módulos sin la agrupación pedida | `ops-engine.js:3962`, `admin.html:112-320` | Recordar el estado, tooltips al colapsar, reagrupar sin quitar módulos |
| M2 | 225 estilos en línea en `admin.html` y 4 545 líneas de CSS con reglas repetidas | `admin.html`, CSS | Tokens centrales y componentes reutilizables |
| M3 | Solo 1 atributo `aria-*` en `admin.html`; los nombres accesibles se agregan después por JS | `admin.html`, `ensureOpsAccessibleControlNames` | ARIA y labels en el origen; foco visible; `prefers-reduced-motion` |
| M4 | 32 `addEventListener` frente a 2 `removeEventListener`; 3 `setInterval` (reloj, pulso IA, autonomía) | `ops-engine.js`, `ops-ia-copilot.js:687` | Pausar con `visibilitychange` y limpiar al cerrar sesión |
| M5 | Todos los módulos se cargan al inicio (7 509 líneas de motor) | `admin.html` | Carga bajo demanda por módulo |
| M6 | Texto "Autenticación TLS 1.3" fijo en la pantalla de ingreso | `admin.html` (login) | Quitar la afirmación o verificarla |

### 🔵 BAJO
- 55 `console.*` en el motor (ruido en producción).
- 1 `alert()` y 18 `confirm()` nativos, en vez de `OpsDialog` (ya existe).
- Montserrat y Plus Jakarta Sans vía Google Fonts. Proxima Nova es de licencia comercial: no está disponible sin licencia y se usará como primera opción con fallback seguro.

### ✅ Lo que SÍ funciona y se conserva
- Login con Google, resolución de rol en el servidor (`whoami`) y modo Auditor de solo lectura.
- Moderación de la comunidad (datos reales vía `baqueano-community`).
- Ctrl+K, `OpsDialog`, `OpsToast`, el registro de 36 módulos (`ENTITY_REGISTRY`) y los formularios de destinos con coordenadas, tarifas, multimedia y SEO.
- Exportación de respaldo JSON, carga de APK y configuración de videos.
- RLS endurecida y pruebas negativas en CI.

## Calificación actual (0–100)

| Área | Nota | Motivo principal |
|---|---:|---|
| UX/UI | 58 | Identidad visual lograda, pero 36 módulos planos, densidad alta y sin jerarquía ejecutiva |
| Arquitectura | 30 | Panel acoplado a Firestore sin SDK; contradicciones de fuente de verdad |
| Frontend | 42 | Monolito de 7 509 líneas; HTML generado como texto; estilos en línea |
| Backend | 50 | Edge Functions sólidas (comunidad, espejo, IA), pero no hay API administrativa |
| Base de datos | 62 | Esquema rico (PostGIS, pgvector, RLS), con poca información cargada |
| Firebase | 45 | Auth correcto; Firestore y Storage referidos pero no cargados |
| Supabase | 64 | RLS y pruebas buenas; el panel no lo usa para leer ni escribir |
| Seguridad | 66 | RBAC en el servidor y RLS endurecida; IP a terceros; `unsafe-inline` |
| IA (observabilidad) | 20 | Métricas inventadas; `ai_messages` vacío |
| Android/Web (sincronía) | 28 | Sin canal único de datos operativos |
| Rendimiento | 50 | Todo se carga al inicio; intervalos permanentes |
| Responsive | 55 | Funciona; denso en móvil |
| Accesibilidad | 38 | Casi sin ARIA de origen |
| Trazabilidad | 25 | `audit_logs` vacío; sin antes/después |
| Mantenibilidad | 32 | Archivo único gigante; CSS repetido |
| **Global** | **44** | |

## Deuda técnica principal
1. Capa de datos inexistente: hay CRUD visual, pero no persistencia efectiva.
2. Métricas de demostración mezcladas con producción.
3. Monolito `ops-engine.js` con HTML en texto.
4. Doble modelo de datos (Firestore en el código, Supabase en la base real).

## Plan de intervención priorizado (sin eliminar nada)
1. **P0, esta entrega:**
   - Directiva de arquitectura unificada (AGENTS, documentación y textos).
   - KPIs honestos con estado y origen.
   - Contadores reales.
   - Éxito falso de respaldo corregido.
   - Fin de la consulta de IP a terceros.
   - Edge Function `baqueano-ops`: lecturas reales, conteos, salud de servicios y auditoría en el servidor.
   - Health Center real.
2. **P1:**
   - CRUD de destinos y negocios contra Supabase vía `baqueano-ops`: publicar, archivar y restaurar con auditoría antes/después.
   - Visor de auditoría.
   - Sello "Verificado por BAQUEANO" con trazabilidad.
   - Perfiles al iniciar sesión.
3. **P2:**
   - Sidebar reagrupado y persistente.
   - Dashboard ejecutivo.
   - Tokens y componentes.
   - Accesibilidad.
   - Carga bajo demanda.
   - Supabase Realtime para SOS, reservas y moderación.
4. **P3:**
   - Observabilidad de BAQUI (tokens, latencia y errores reales desde `ai_messages`).
   - Ecosistema Android (versiones y dispositivos cuando la app los transmita).
   - Notificaciones segmentadas con confirmación.
