# DEPLOYMENT PLAN

## Why

El despliegue debe ser controlado, reversible y aprobado.

## How

Flujo obligatorio: local, CI, staging, QA, security check, approval, production.

## What

1. Ejecutar `corepack pnpm install --frozen-lockfile`.
2. Ejecutar `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test`, `corepack pnpm build`.
3. Desplegar staging solo con credenciales separadas.
4. Validar `/api/health`, rutas publicas, rutas admin, Auth/RBAC, Firestore, Storage, Maps y AI segun disponibilidad.
5. Crear release candidate y manifest.
6. Solicitar aprobacion explicita para produccion.
7. Desplegar produccion en ventana controlada.
8. Ejecutar smoke post-deploy.
9. Monitorear errores, latencia y rutas criticas.
10. Rollback si se activa un criterio P0/P1.

Produccion no fue desplegada por Codex en esta fase.
