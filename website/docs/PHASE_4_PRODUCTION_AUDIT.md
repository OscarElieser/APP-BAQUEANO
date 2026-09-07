# PHASE 4 PRODUCTION AUDIT - BAQUEANO WEBSITE

## Why

BAQUEANO no debe avanzar a produccion solo porque compila o se ve terminado. Esta auditoria separa lo real, lo parcial y lo pendiente antes de exponer usuarios, datos o operaciones administrativas.

## How

Se revisaron `website/docs/*`, `website/apps/web`, `website/apps/admin`, `website/packages/*`, scripts locales, reglas Firebase de raiz en modo lectura, estado Git y reportes visuales existentes. No se modifico `lib/`, `android/`, `test/` ni `pubspec.yaml`.

## What

| Componente | Estado | Riesgo | Impacto | Accion | Prioridad | Evidencia |
|---|---:|---|---|---|---:|---|
| Public Web Next.js | PARCIAL | Datos seed pueden confundirse con datos reales | Usuarios verian catalogo no verificado | Mantener banner de origen y verificar Firestore | Alta | `apps/web`, `visual-audit/report.md` |
| Control Center | PARCIAL | Auth/RBAC no verificado end-to-end | Riesgo administrativo | Implementar/validar sesion y guards reales | Alta | `apps/admin`, `RBAC_MATRIX.md` |
| Firebase client | PARCIAL | Variables faltantes frenan conexion | Fallback a seed | Validacion temprana agregada | Alta | `packages/config/src/index.ts`, `packages/firebase/src/index.ts` |
| Firestore live reads | PENDIENTE | Sin credenciales no hay evidencia real | Datos no certificados | Configurar staging y probar lecturas | Alta | `INTEGRATION_STATUS.md` |
| Firestore rules | PARCIAL | No hay tests automatizados de rules | Regresiones de permisos | Crear suite con emulator | Alta | `firestore.rules` leido |
| Storage rules | PARCIAL | Path de `firestore.get` requiere verificacion en emulator | Uploads podrian fallar | Probar rules y corregir fuera de esta fase si se autoriza | Alta | `storage.rules` leido |
| AI Gateway | PENDIENTE | Endpoint 501 | IA no operativa | Conectar gateway server-side con rate limit | Media | `apps/web/src/app/api/baqueano-ai/route.ts` |
| Maps | PENDIENTE | Mapa conceptual | Sin geodata interactiva real | Integrar key restringida y fallback textual | Media | `/mapa`, docs previos |
| Pagos | PENDIENTE | Sin pasarela sandbox | No procesar pagos | Mantener bloqueado hasta proveedor | Alta | `TECH_DEBT.md` |
| Secretos | PARCIAL | Docs anteriores tenian ejemplos sensibles | Exposicion accidental | Reemplazado por placeholders y smoke test | Alta | `ENVIRONMENT.md`, `.env.*` |
| Headers seguridad | PARCIAL | CSP necesita prueba en staging | Posibles bloqueos por origen | Headers Next agregados | Alta | `next.config.mjs` |
| Health check | PARCIAL | No probado en deploy real | Observabilidad incompleta | `/api/health` agregado | Media | `apps/web/src/app/api/health/route.ts` |
| Visual responsive | PARCIAL | Solo rutas seleccionadas | Cobertura incompleta | Ampliar E2E visual | Media | 70 capturas existentes |
| CI | PARCIAL | Workflow esta dentro de `website/`, no raiz | Puede no ejecutarse hasta moverlo | Usar como plantilla o autorizar root `.github` | Media | `.github/workflows/website-ci.yml` |
| Android intacto | REAL | Cambios restringidos a `website/` | Nulo si se mantiene | Verificar al final con Git | Alta | `git diff -- lib android test pubspec.yaml` |

## Bloqueantes de produccion

- Auth/RBAC no esta probado con usuarios reales y custom claims.
- Firestore rules y Storage rules no tienen evidencia automatizada en emulator.
- Staging real no esta configurado ni desplegado.
- Dominio, HTTPS y DNS no estan verificados.
- AI Gateway, Maps y pagos siguen pendientes o parciales.
- No existe evidencia de smoke test post-deploy.

## Verdict

FASE 4 - PARCIAL / BLOQUEADA para produccion real. El codigo local puede avanzar como release candidate cuando `lint`, `typecheck`, `test` y `build` pasen, pero no debe declararse Production Ready hasta cerrar los bloqueantes de seguridad, Auth/RBAC, rules, staging y despliegue.
