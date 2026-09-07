# OPERATIONS

## Why

Dar al equipo un camino repetible para levantar, probar, construir, desplegar y revertir BAQUEANO Website.

## How

Usar Corepack y pnpm desde `website/`. No ejecutar produccion sin aprobacion.

## What

Local:

```bash
cd website
corepack pnpm install --frozen-lockfile
corepack pnpm dev:web
corepack pnpm dev:admin
```

Quality gate:

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

Staging: cargar variables de `.env.staging` como secretos reales en el proveedor, desplegar, validar `/api/health` y ejecutar checklist.

Production: requiere aprobacion explicita, dominio/HTTPS verificados, backup confirmado y rollback identificado.

Rollback: volver al deployment anterior o tag estable; si hay riesgo de datos, congelar mutaciones antes de hotfix.
