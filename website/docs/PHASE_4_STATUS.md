# PHASE 4 STATUS

## Why

Esta matriz resume si BAQUEANO puede pasar de hardening a lanzamiento.

## How

Estados permitidos: REAL / APROBADO, PARCIAL, PENDIENTE, BLOQUEANTE.

## What

| Area | Estado | Evidencia | Bloqueante | Pendiente |
|---|---:|---|---|---|
| Public Web | PARCIAL | `corepack pnpm build` web OK; visual audit local | No | Firestore vivo |
| Admin | PARCIAL | Rutas y noindex | Si | Auth/RBAC real |
| Firebase Auth | PENDIENTE | Docs/scripts | Si | Login y claims |
| Firestore | PARCIAL | Servicios/contratos | Si | Rules tests y live reads |
| RBAC | PENDIENTE | Matriz | Si | Enforcement end-to-end |
| Storage | PARCIAL | Rules | Si | Emulator/upload tests |
| Security Rules | PARCIAL | Reglas leidas | Si | Suite automatizada |
| AI Gateway | PENDIENTE | 501 seguro | No | Gateway real |
| Maps | PENDIENTE | Mapa conceptual | No | API key restringida |
| Payments | PENDIENTE | Scaffold | No | Proveedor sandbox |
| SEO | PARCIAL | Metadata/robots/sitemap | No | Dominio real |
| Performance | PENDIENTE | Budget creado | No | Lighthouse |
| Accessibility | PARCIAL | UI revisada parcialmente | No | Axe/manual |
| Responsive | PARCIAL | Visual audit parcial | No | Rutas restantes |
| E2E | PENDIENTE | No ejecutado completo | Si | Playwright flows |
| CI | PARCIAL | Template en website | No | Ubicar workflow real |
| Staging | PENDIENTE | Plan | Si | Deploy autorizado |
| Production | BLOQUEANTE | No desplegada ni autorizada | Si | Go/no-go |
| Backup | PENDIENTE | Plan | Si | Ejecutar/verificar |
| Rollback | PARCIAL | Plan | Si | Version/tag |
| Monitoring | PARCIAL | Health check | No | Alertas reales |
| Android intacto | REAL / APROBADO | `git diff -- lib android test pubspec.yaml` sin salida | No | Ninguno |
