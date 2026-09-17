# PRODUCTION CHECKLIST

## Why

Produccion solo puede abrirse con evidencia objetiva.

## How

Actualizar cada fila con fecha, comando, URL o captura real antes de aprobar.

## What

| Item | Status | Evidence | Date |
|---|---:|---|---|
| Build | PARCIAL | `corepack pnpm build` OK web/admin local | 2026-09-07 |
| Security | PARCIAL | CSP/headers agregados; falta staging | 2026-09-07 |
| Auth | PENDIENTE | Login real no verificado | 2026-09-07 |
| RBAC | PENDIENTE | Custom claims no verificados | 2026-09-07 |
| Firestore | PARCIAL | Servicios y contratos listos; sin lectura viva | 2026-09-07 |
| Storage | PARCIAL | Rules existentes; sin upload test | 2026-09-07 |
| Critical E2E | PENDIENTE | No ejecutado contra staging/produccion | 2026-09-07 |
| Backup | PENDIENTE | Plan sin ejecucion | 2026-09-07 |
| Rollback | PARCIAL | Plan documentado | 2026-09-07 |
| Domain | PENDIENTE | DNS no verificado | 2026-09-07 |
| HTTPS | PENDIENTE | Dominio no desplegado | 2026-09-07 |
| Monitoring | PARCIAL | `/api/health` agregado; deploy real pendiente | 2026-09-07 |
| Android intact | PARCIAL | `git diff -- lib android test pubspec.yaml` sin salida | 2026-09-07 |
