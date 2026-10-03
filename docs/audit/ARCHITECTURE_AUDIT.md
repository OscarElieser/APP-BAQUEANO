# 🏛️ BAQUEANO — Auditoría de arquitectura (Fase 1)

## 🎯 POR QUÉ

Comparar la arquitectura oficial (Firebase = identidad, Supabase = información, Hostinger = dominio, Azure = infraestructura Hackathon) con la arquitectura real, para decidir qué evolucionar sin romper lo que funciona.

## ⚙️ CÓMO

Configuración, dependencias, código cliente y verificación en vivo (ver [SYSTEM_MAP.md](SYSTEM_MAP.md)).

## 📦 QUÉ

### Oficial vs. real

| Capa | Oficial | Real (2026-10-02) | Brecha |
| --- | --- | --- | --- |
| Identidad | Firebase Auth | ✅ Firebase Auth (web compat SDK + Android `firebase_auth` + Google Sign-In) | Ninguna |
| Información | Supabase | ⚠️ **Firestore + catálogos JS/JSON/Dart**. Supabase con esquema amplio pero casi vacío y sin cliente web activo | **Grande** |
| Dominio | Hostinger → baqueanonicaragua.com | ❌ Dominio **aparcado** en Hostinger; HTTPS raíz falla | **Bloqueante para el jurado** |
| Hosting | Firebase Hosting (respaldo) | ✅ `app-baqueano.web.app` es el **único** sitio funcional; canonical y sitemap apuntan allí | Inverso a lo deseado |
| Infraestructura Hackathon | Azure (VM, SSH, IP, NSG) | ❌ Inexistente | **Bloqueante Sprint 2** |
| IA (BAQUI) | Supabase + RAG + fuentes externas | ⚠️ Edge Function `baqueano-ai` (Gemini, `url_context`) + 5 scripts web + Genkit (`src/`) + Functions `ai-chat` + servicios Dart | Fragmentado |
| Backend | — | Firebase Functions `api` + `healthCheck` (Node 20); Genkit raíz; Edge Functions Supabase | Tres backends |

### Productos

- **Android:** sano. Flutter, Riverpod, go_router, Firestore, Firebase Auth, App Check, Google Maps. No usa Supabase. `flutter analyze` limpio, 31 pruebas.
- **Website:** HTML estático multipágina (30 páginas) con JS vanilla (68 scripts), 30 hojas CSS + `styles.css` (254 KB) + `nicaragua-branding.css` en raíz (78 KB, fuera de `website/`).
- **Website Next.js** (`website/apps/web`, `website/apps/admin`, `packages/*`): monorepo React/Tailwind que **no se despliega**. Duplica el concepto de admin con `website/admin.html` (Ops Center, 109 KB) y con `admin/` (Flutter).

### Riesgos arquitectónicos

1. **Tres paneles de administración** (Ops Center HTML, Next.js admin, Flutter `admin/`). Solo el Ops Center HTML está desplegado.
2. **Tres backends** (Functions, Genkit `src/`, Edge Functions). Hay que elegir dónde vive la API que se demostrará en Azure.
3. **Documentación contradictoria:** `README.md` dice "Exclusividad Android" y documenta Firestore como base; `website/docs/adr/ADR-001_FIREBASE_DATASTORE.md` declara Firestore fuente principal; `docs/architecture/ARQUITECTURA_OFICIAL_BAQUEANO.md` declara Supabase. Un jurado lo detectará.
4. **Sitio público dependiente de un subdominio técnico** (`web.app`).

### Arquitectura objetivo recomendada (compatible con la rúbrica y sin destruir nada)

```text
                    baqueanonicaragua.com (DNS en Hostinger)
                                 │  A/AAAA → IP pública Azure
                                 ▼
               ┌──────── Azure VM (Ubuntu 24.04 LTS) ────────┐
               │ Nginx :443 (TLS Let's Encrypt) :80→301       │
               │  ├─ /         → website estático (build)     │
               │  └─ /api/*    → BAQUEANO API (Node 20, PM2)  │
               │ NSG: 443, 80, 22 solo desde IP del equipo    │
               └───────────────┬──────────────────────────────┘
                               │ HTTPS (service role solo en servidor)
             ┌─────────────────┼─────────────────────┐
             ▼                 ▼                     ▼
      Firebase Auth      Supabase PostgreSQL     Gemini (BAQUI)
   (verifica ID token)  (RLS + firebase_uid)    (vía API, no cliente)

  app-baqueano.web.app  → se conserva como respaldo técnico (canonical = dominio principal)
  Android               → Firebase Auth + Firestore (sin cambios) → migración gradual a la API
```

**Justificación:** la VM de Azure cumple SSH, IP pública, puertos, entorno y despliegue; la API en Azure es el único lugar con la clave `service_role`, lo que resuelve SEC-P1-04 (escrituras administrativas desde el navegador). Supabase sigue siendo la base principal y su puerto 5432 nunca se expone desde Azure.
