# 🧭 BAQUEANO 2.0 — RELEASE & ROLLBACK RUNBOOK

## 1. Procedimiento de Pre-Despliegue
1. Ejecutar `flutter analyze` y `flutter test` en el workspace raíz.
2. Ejecutar `corepack pnpm typecheck`, `corepack pnpm lint`, `corepack pnpm test` y `corepack pnpm build` en `/website`.
3. Verificar ausencia de secretos expuestos mediante `node scripts/production-smoke.test.mjs`.
4. Confirmar respaldo completo de Firestore y reglas en staging.

## 2. Procedimiento de Despliegue de Producción
1. Desplegar reglas de seguridad y cloud functions en Firebase:
   ```bash
   firebase deploy --only firestore:rules,storage
   ```
2. Desplegar aplicación Web y Admin en Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```
3. Ejecutar suite de smoke tests pos-despliegue en producción.

## 3. Plan de Reversión Inmediata (Rollback)
En caso de fallo crítico en autenticación o integridad de datos pos-lanzamiento:
```bash
firebase hosting:rollback
```
Revertir a la versión previa inmutable en Firebase Hosting y notificar a los operadores mediante Control Tower.
