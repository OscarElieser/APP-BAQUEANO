# 🧭 BAQUEANO — Matriz de cumplimiento frente a la evaluación externa (Hackathon 2026)

## 🎯 POR QUÉ (Propósito)
Una evaluación externa estimó el cumplimiento entre 75 % y 80 % y enumeró los puntos pendientes (P0 y otros). Este documento responde **punto por punto** con evidencia verificable: archivo, prueba o ejecución de CI. Así el jurado puede comprobar cada afirmación sin creer en palabras.

## ⚙️ CÓMO (Lectura)
- ✅ **Cumplido y verificado:** hay prueba automática o comprobación en producción.
- 🟡 **Cumplido en código, falta una acción del propietario:** se indica cuál.
- Las ejecuciones de CI citadas están en GitHub Actions del repositorio, en la rama `main`.

## 📦 QUÉ (Matriz)

### P0 — Técnico

| # | Observación de la evaluación | Respuesta | Evidencia | Estado |
|---|---|---|---|---|
| 1 | CodeQL Swift y Java/Kotlin en rojo | Java/Kotlin con build manual de Flutter (CodeQL observa la compilación de `MainActivity.kt`). Swift fuera del análisis porque `ios/` está fuera de alcance (AGENTS.md). CodeQL y el CI de Flutter, en verde desde `f3e2fd9` | `.github/workflows/codeql.yml`, `android/gradle.properties` | ✅ |
| 2 | RLS: 11 tablas sin políticas y políticas `{public}` ALL | Políticas abiertas reasignadas a `service_role`. Política RESTRICTIVA explícita en 15 tablas de servidor. Privilegios de cliente retirados. El asesor de seguridad ya no reporta tablas sin políticas | `supabase/migrations/20261004235000_rls_hardening.sql`, `…235100_fix_search_path…sql` | ✅ |
| 3 | Pruebas negativas | pgTAP: 14 aserciones. Producción: 12/12 como anon. **En vivo en cada despliegue:** whoami, mod_queue y moderate sin sesión o con token falso devuelven 401, y anon no lee `staff_roles`, `audit_logs`, `ops_backup_entities`, `profiles` ni `reservations` | `supabase/tests/rls_hardening.test.sql`; job "Pruebas negativas en vivo (RBAC y RLS)" en `deploy-production.yml`: success | ✅ |
| 4 | 3+ roles funcionales (Superadmin, Admin, Auditor, Usuario, Emprendedor) | El rol lo decide el servidor (claim o `public.staff_roles` con correo verificado). El Auditor entra al Ops Center en solo lectura (52 acciones bloqueadas y 403 del servidor). Hay matriz de permisos | `docs/security/ROLES_Y_PERMISOS.md`, `website/js/shared/roles.js`, Edge Function `baqueano-community` v2 | 🟡 Falta el correo de la cuenta Auditor para la demo (una línea de SQL, documentada) |
| 5 | Supabase Auth con 0 usuarios | Es una decisión de arquitectura: la identidad es Firebase Auth y Supabase verifica su token en las Edge Functions. Está documentado en la arquitectura oficial | `docs/architecture/ARQUITECTURA_OFICIAL_BAQUEANO.md` | ✅ |
| 6 | Evidencia de Azure | El job verify-azure comprueba que `/health` sirve el mismo commit de `main`, que `/api/azure/db` responde con Supabase OK (17 departamentos), las cabeceras de seguridad, HTTP→HTTPS 301 y archivos internos 404. Evidencia de sprints 1–3 | `.github/workflows/deploy-production.yml` (success); `docs/evidencias/` | ✅ |
| 7 | README con arquitecturas contradictorias | Una sola arquitectura oficial con diagrama y responsabilidades; README alineado | `docs/architecture/ARQUITECTURA_OFICIAL_BAQUEANO.md`, `README.md` | ✅ |
| 8 | i18n incompleta en 6 idiomas | 698/698 claves en ES, EN, FR, IT, PT y DE; 0 faltantes y 0 vacías. Corregido un bug de carrera al cambiar de idioma. Prueba de navegador: 19 rutas × 6 idiomas | `website/locales/*.json`; `npm run test:i18n` y `test:i18n:browser` | ✅ |
| 9 | BAQUI debe extraer adultos, niños, presupuesto y destinos y preguntar los días | 15 frases y una conversación completa (pregunta los días y luego arma el itinerario de 4 días): 17/17 | `website/scripts/baqui-intent.test.mjs`, `docs/evidencias/BAQUI_CASOS_DEMO.md` | ✅ |

### Marketing y diseño

| Entregable pedido | Documento |
|---|---|
| Lean Canvas | `docs/marketing/01_LEAN_CANVAS_PROPUESTA_SEGMENTACION.md` §1 |
| Propuesta de valor (Value Proposition Canvas) | `01_…` §2 |
| Segmentación de mercado | `01_…` §3 |
| Buyer Persona (3: explorador, familia, anfitriona) | `01_…` §4 |
| Objetivos SMART | `docs/marketing/02_OBJETIVOS_SMART_Y_CRECIMIENTO.md` §1 |
| Estrategia de crecimiento (AARRR y bucle) | `02_…` §2 |
| Branding y manual de marca (logo, color con contraste medido, tipografía y voz) | `docs/marketing/03_MANUAL_DE_MARCA_MOODBOARD_ASSETS.md` |
| Moodboard | `03_…` §8 |
| Kit de assets | `03_…` §9 (rutas reales en `website/assets/images/`) |
| UX Flow (explorador, anfitrión y moderación) | `docs/marketing/04_UX_FLOW_WIREFRAMES_ACCESIBILIDAD.md` §1–3 |
| Wireframes (inicio, departamento, BAQUI y Ops Center) | `04_…` §4 |
| Accesibilidad (WCAG 2.1 AA) | `04_…` §5 |
| Brief creativo | `docs/marketing/05_BRIEF_CREATIVO_Y_CAMPANA.md` |
| Piezas de campaña (reel, carrusel, FB, WhatsApp, afiche con QR, historia y banner) | `05_…` P1–P7 |
| Plan de lanzamiento | `docs/marketing/06_PLAN_LANZAMIENTO_Y_CALENDARIO.md` |
| Calendario de contenido (4 semanas) | `06_…` |
| Matriz de riesgos | `docs/marketing/07_RIESGOS_Y_PITCH_DEMO.md` |
| Pitch (3 min) y guion de demo (5 min) | `07_…` |
| Modelo 4C y 4F | `docs/design/MARKETING_4C_BAQUEANO.md`, `MARKETING_4F_BAQUEANO.md` |

### Acciones que solo puede hacer el propietario

| Acción | Por qué no se hizo desde el código |
|---|---|
| Indicar el correo de la cuenta **Auditor** | Es un dato personal del equipo |
| Desplegar `firestore.rules` si se quiere que el Auditor lea paneles de Firestore | El repositorio no tiene credencial de Firebase |
| Sincronizar el tablero de Trello "VIGORÓN MIXTO" con este avance | No hay acceso a Trello. La lista para importar está en `docs/planning/BAQUEANO_TRELLO_IMPORT.csv` |
| Desactivar el escaneo de código de Copilot si consume cuota | Es una configuración del repositorio en GitHub |
