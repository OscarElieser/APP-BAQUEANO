# 🗺️ BAQUEANO — Plan de implementación (resultado de la Auditoría Fase 1)

## 🎯 POR QUÉ

Convertir los hallazgos en lotes pequeños, verificables y ordenados P0 → P1 → P2 → P3, alineados con los tres Sprints del Hackathon Nicaragua 2026 y sin eliminar contenido.

## ⚙️ CÓMO

Cada lote: rama `feature/baqueano-global-platform` (o subrama), cambio acotado, comentarios en español, pruebas (`flutter analyze`, `flutter test`, `website` smoke/i18n, Playwright cuando exista), registro en `SESSION_LOG.md` y commit convencional (`security(...)`, `fix(...)`, `i18n(...)`…). No se avanza si hay errores críticos.

## 📦 QUÉ

### 1. Cumplimiento por Sprint (estado actual)

#### Sprint 1

| Requisito | Estado | Evidencia / brecha |
| --- | --- | --- |
| README técnico | ⚠️ | Existe (36 KB), pero describe "solo Android" y Firestore; contradice la arquitectura oficial |
| Modelo ER / BD | ❌ | Esquema en migraciones; **sin diagrama ER** |
| Interfaces navegables | ✅ | 30 páginas web + app Android |
| Formularios funcionales | ⚠️ | Firestore sí; flujos Supabase inactivos |
| GitHub / commits / push / pull | ✅ | 387 commits, `main` sincronizada con `origin` |
| 3 roles (Admin, Usuario, Auditor) | ⚠️ | Admin y usuario sí; **Auditor no existe** en Supabase ni en reglas |
| Ejecución local | ✅ | `node dev-server.js` → `localhost:5000`; `flutter run` |
| Video de navegación | ❓ | No encontrado en el repo (puede existir fuera) |
| Lean Canvas, Buyer Persona, Propuesta de valor, SMART | ❌ | No encontrados como documentos (hay `docs/MARKETING_4C_BAQUEANO.md`, `docs/MARKETING_4F_BAQUEANO.md`) |
| Branding, logo, colores, tipografía, valores | ⚠️ | `DESIGN.md`, logos en `assets/`; falta manual de marca consolidado |
| Moodboard, Wireframes | ❌ | No encontrados |

#### Sprint 2

| Requisito | Estado |
| --- | --- |
| Build Web | ✅ `website/scripts/build-hostinger-static.mjs` → `dist-hostinger/` |
| APK Android | ✅ CI construye AAB; APK en `website/assets/` |
| Azure, SSH, IP pública, puertos, entorno | ❌ |
| BD / conexión cloud, no localhost | ⚠️ Firebase/Supabase en la nube sí; sin Azure |
| Marketing (campaña, audiencia, canales, calendario) | ⚠️ Parcial en documentos 4C/4F |
| Diseño (mockups, componentes, UX flow, accesibilidad) | ⚠️ Capturas en `.runtime/`; sin documento de UX flow |

#### Sprint 3

| Requisito | Estado |
| --- | --- |
| Acceso público | ⚠️ Solo `app-baqueano.web.app`; **dominio principal aparcado** |
| Seguridad / puertos | ❌ P0 abiertos (perfiles en Git, RLS permisivas) |
| Flujo autónomo / integración completa | ⚠️ |
| Guardar/leer/modificar datos reales | ⚠️ Firestore sí; Supabase no |
| GitHub = código desplegado | ⚠️ Sin pipeline de despliegue web; videos desplegables no versionados |
| README de despliegue | ⚠️ `website/docs/HOSTINGER_STATIC_DEPLOYMENT.md` existe; falta Azure |

### 2. Lotes de ejecución

#### Lote P0 — Seguridad inmediata (Sprint 2, antes de todo)

| # | Cambio | Archivos | Riesgo | Prueba |
| --- | --- | --- | --- | --- |
| P0-1 | **Acción del propietario:** cerrar sesiones y cambiar contraseñas de las cuentas usadas en los perfiles de `.snapshots/` | — | Ninguno | Confirmación del propietario |
| P0-2 | Dejar de versionar perfiles: `.gitignore` + `git rm -r --cached` (archivos quedan en disco) | `.gitignore` | Bajo | `git ls-files .snapshots` solo PNG/MD |
| P0-3 | **Con autorización explícita:** purgar historial (`git filter-repo --path-glob '.snapshots/*-profile*' …`) + force-push; respaldo previo del repo (`git clone --mirror`) | Historial Git | **Alto, irreversible** | Clon limpio no contiene perfiles |
| P0-4 | Migración RLS correctiva: `audit_logs`, `ops_backup_entities`, `traffic_sessions`, `storage.objects` (`baqueano-media`), `storage.buckets` | `supabase/migrations/2026100x_security_hardening.sql` | Medio: cortar escrituras que algo use | Conteos anónimos + intento de escritura anónima en entorno local (`supabase start`) → denegado |
| P0-5 | Reconciliar historial de migraciones con producción **antes** de P0-4 (`supabase migration list`, `db pull`) | `supabase/` | Medio | Lista coincide |

#### Lote P1 — Funciones principales e infraestructura (Sprint 2)

| # | Cambio |
| --- | --- |
| P1-1 | Azure: VM + NSG + Nginx + TLS + PM2; scripts en `azure/` y `docs/AZURE_DEPLOYMENT.md` (ver AZURE_AUDIT) |
| P1-2 | DNS Hostinger → Azure; `baqueanonicaragua.com` sirviendo el sitio con HTTPS; `www` → 301 |
| P1-3 | Canonical, sitemap y robots → dominio principal |
| P1-4 | Supabase Third-Party Auth (Firebase) + helper `public.firebase_uid()` + reescritura de políticas de usuario |
| P1-5 | Cliente web Supabase con `accessToken` de Firebase; cargar `supabase-js` (versión fijada) y `supabase-config.js` |
| P1-6 | Rol **Auditor** (claim Firebase + RLS de solo lectura sobre `audit_logs` y estados) → 3 roles funcionales. Matriz oficial del propietario (2026-10-03): `oscarelieser.informatica.inatec@gmail.com` = **super_admin**; `byoscarelieser@gmail.com` y `vigoronmixt@gmail.com` = **admin**. Corregir desalineaciones: `functions/lib/auth-middleware.js` (`verifySuperAdmin` concede super a los 3), `official_super_admins` en Supabase (3 como super_admin; corregir con migración nueva), `website/js/user-session.js` (los 3 como admin; vigoronmixt etiquetado "Auditor Baqueano") |
| P1-7 | `email_verified` en `isAdmin()` (Firestore, Storage, Functions) |
| P1-8 | BAQUI: CORS a dominios oficiales, rate-limit, App Check/ID token; mover a `/api/baqui` en Azure |
| P1-9 | Publicar videos comprimidos y corregir `baqui.png` (FE-P1-01/02) |
| P1-10 | Escrituras del Ops Center → API backend con verificación de token |
| P1-11 | Importación inicial validada a Supabase: 153 municipios + destinos (desde `assets/data/*.json` y `territories-data.js`), con fuente y estado `PENDING` |
| P1-12 | CI Android: keystore desde GitHub Secrets (el build release ya prohíbe la firma debug y hoy haría fallar el job) |

#### Lote P2 — i18n, SEO, accesibilidad, performance (Sprint 2-3)

- i18n: KO/ZH/RU, cadena `→ en → es`, `preferred_language`, `data-i18n` en navegación/footer/index/formularios, aplicar `content_translations`.
- SEO: hreflang, JSON-LD, quitar `Disallow: /css/`, sitemap generado.
- A11y: skip link, `width/height`, contraste de `#F65E01`, pausa de video, Playwright + axe.
- Performance: logo 4,7 MB → SVG/WebP, póster AVIF con `fetchpriority`, caché inmutable para assets versionados, modo bajo consumo.
- Seguridad: auditoría de `innerHTML`, plan de CSP sin `unsafe-inline`.
- Consolidación BAQUI (sin borrar) y buscador global (`smart-search.js` como base).

#### Lote P3 — Refinamiento (Sprint 3)

- Design System a partir de `variables.css`/`colors.css`/`theme-master.css`/`typography.css`; reducción progresiva de `!important`.
- Navegación con prioridad oficial; URLs amigables con rewrites.
- Documentos Hackathon: Lean Canvas, Buyer Persona, Propuesta de valor, SMART, Moodboard, Wireframes, Manual de marca, `DATABASE_ER.md`.
- Actualizar `README.md` a la arquitectura oficial (sin borrar la sección Android, reubicándola).

### 3. Estructura de carpetas recomendada (sin movimientos forzados)

```text
APP-BAQUEANO/
├── android/  lib/  test/  assets/        # Android (sin cambios)
├── website/                               # Website público (estático actual)
│   ├── *.html  css/  js/  locales/  assets/
│   ├── apps/ packages/                    # Next.js: congelado, documentado como laboratorio
│   ├── legacy/                            # NUEVO: destino de candidatos verificados (no borrado)
│   └── scripts/                           # build/test + scripts/one-off/ para parches históricos
├── functions/                             # Firebase Functions
├── supabase/                              # migraciones + edge functions
├── azure/                                 # NUEVO: cloud-init, nginx, pm2, scripts de despliegue
├── docs/                                  # documentación oficial (+ docs/audit/)
├── tools/                                 # utilidades
└── (ios/ web/ windows/ — intactos)
```

Movimientos recomendados únicamente: `nicaragua-branding.css` (raíz) → evaluar si pertenece a `website/css/`; `src/` + `prompts/` (Genkit) → documentar o integrar en `functions/`; `admin/` (Flutter) → documentar estado.

### 4. Documentos a crear/actualizar (prompt §62)

`docs/ARCHITECTURE.md`, `FIREBASE_AUTH.md`, `SUPABASE_ARCHITECTURE.md`, `DATABASE_ER.md`, `AZURE_DEPLOYMENT.md`, `I18N_ARCHITECTURE.md`, `SECURITY.md` (raíz existente, 640 B, ampliar), `SEO.md`, `ACCESSIBILITY.md`, `PERFORMANCE.md`, `OPS_CENTER.md`, `BAQUI_ARCHITECTURE.md`, `DEPLOYMENT.md`, `TESTING.md`, `DISASTER_RECOVERY.md` (existe `DISASTER_RECOVERY_BAQUEANO.md`; reutilizar).

Además: marcar como **sustituidos** (no borrar) `website/docs/adr/ADR-001_FIREBASE_DATASTORE.md`, `DATA_CATALOG.md` y `DATA_FLOW.md`. `website/docs/` contiene 280 documentos, muchos describen capacidades no implementadas: crear un índice que distinga "vigente" de "visión".
