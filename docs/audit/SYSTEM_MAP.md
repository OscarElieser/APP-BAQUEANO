# 🧭 BAQUEANO — Mapa del sistema (Auditoría Fase 1)

> Fecha: 2026-10-02 · Rama: `main` (commit `2b8268d`) · Tipo: auditoría no destructiva.
> Ningún archivo fue movido, modificado ni eliminado durante esta auditoría (salvo la creación de `docs/audit/*` y la bitácora).

## 🎯 POR QUÉ

Dar a cualquier persona del equipo (y al jurado del Hackathon Nicaragua 2026) una fotografía verificable de qué existe, dónde vive y qué está realmente conectado en producción, antes de evolucionar la plataforma.

## ⚙️ CÓMO

- Inventario con `git ls-files` (5.100 archivos versionados).
- Lectura de configuración: `firebase.json`, `.firebaserc`, `supabase/config.toml`, migraciones, reglas, `pubspec.yaml`, `package.json`.
- Verificación en vivo **solo lectura**: códigos HTTP de `baqueanonicaragua.com` y `app-baqueano.web.app`; conteo de filas visibles con la clave publicable de Supabase (`Prefer: count=exact`, `limit=0`, sin descargar datos).
- Ejecución de `flutter analyze`, `flutter test` y `website/scripts/validate-i18n.mjs`.

## 📦 QUÉ

### Productos y carpetas

| Área | Carpeta | Archivos versionados | Estado |
| --- | --- | --- | --- |
| **Android (Flutter)** | `lib/`, `android/`, `test/`, `assets/` | 127 (lib) + 29 + 5 + 115 | ✅ `flutter analyze` limpio, 31/31 pruebas |
| **Website público (HTML/CSS/JS estático)** | `website/*.html`, `website/js`, `website/css`, `website/locales`, `website/assets` | ~1.300 | ✅ Desplegado en Firebase Hosting |
| Website — monorepo Next.js (no desplegado) | `website/apps/{web,admin}`, `website/packages/*` | 227 | ⚠️ Excluido del hosting (`**/apps/**` en `firebase.json`) |
| Admin Flutter separado | `admin/` | 14 | ⚠️ Sin despliegue ni referencias encontradas |
| Backend Firebase Functions | `functions/` | 22 | ⚠️ `node_modules` ausente; pruebas no ejecutables sin `npm ci` |
| Backend Genkit raíz | `src/`, `prompts/`, `package.json` | 8 | ⚠️ Solo validación de sintaxis en CI |
| Supabase | `supabase/migrations`, `supabase/functions` | 24 | ⚠️ Deriva entre migraciones y producción |
| Azure | — | 0 | ❌ No existe |
| Documentación | `docs/`, `website/docs/` (280), raíz | ~300 | ⚠️ Mucha documentación aspiracional |
| Herramientas | `tools/`, `website/scripts/` (29) | 30 | Scripts de transformación única + pruebas |
| Plataformas no objetivo | `ios/`, `web/` (Flutter), `windows/` | 70 | 🔒 No tocar (AGENTS.md) |
| **Perfiles de navegador** | `.snapshots/` | **3.154** | 🔴 P0 — ver SECURITY_AUDIT |
| Capturas QA | `.runtime/` | 24 | Evidencia visual (conservar) |

### Flujo real en producción (verificado)

```text
Usuario ──► https://app-baqueano.web.app  (Firebase Hosting, sirve website/)
              │
              ├─ Firebase Auth (Google)  ✅
              ├─ Cloud Firestore (contenido + transacciones)  ✅ fuente operativa real
              ├─ Catálogos JS embebidos (territories-data.js, 111 KB, etc.)  ✅ fuente de contenido real
              ├─ /api/** ─► Cloud Function `api` (us-central1)
              └─ Supabase  ⚠️ cliente web NO se inicializa (supabase-js no se carga en ninguna página)
                   └─ Edge Function `baqueano-ai` (BAQUI, Gemini) con verify_jwt=false

https://baqueanonicaragua.com      ─► ❌ Página "Parked Domain" de Hostinger (HTTPS raíz falla)
https://www.baqueanonicaragua.com  ─► ❌ Página "Parked Domain" de Hostinger
Azure                              ─► ❌ Sin recursos
```

### Contenido en Supabase producción (conteo anónimo, 2026-10-02)

| Tabla | Filas visibles | Observación |
| --- | --- | --- |
| departments | 17 | ✅ 15 departamentos + 2 regiones autónomas |
| destinations | 7 | Muy por debajo del catálogo web |
| municipalities | 0 | Deberían ser 153 |
| places, emergencies, tourism_services, knowledge_documents | 0 | Vacías |
| content_translations | 404 | **Migración `20261001090000` no aplicada** |
| profiles, favorites, official_super_admins | 401 | Protegidas (difiere de la migración 002, que permitía lectura pública de perfiles) |

### Documentos relacionados

- Fuentes de datos detalladas: [DATA_SOURCE_MAP.md](DATA_SOURCE_MAP.md) (auditoría previa, sigue vigente).
- Limpieza previa: [UNUSED_FILES_CLEANUP.md](UNUSED_FILES_CLEANUP.md).
- Plan: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).
