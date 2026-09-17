# PHASE 4 PRODUCTION AUDIT - BAQUEANO WEBSITE

## Why

BAQUEANO no debe avanzar a produccion solo porque compila o se ve terminado. Esta auditoria separa lo real, lo parcial y lo pendiente antes de exponer usuarios, datos o operaciones administrativas.

## How

Se revisaron `website/docs/*`, `website/apps/web`, `website/apps/admin`, `website/packages/*`, scripts locales, reglas Firebase de raiz en modo lectura, estado Git y reportes visuales existentes. No se modifico `lib/`, `android/`, `test/` ni `pubspec.yaml`.

## What

| Componente | Estado | Riesgo | Impacto | Accion | Prioridad | Evidencia |
| --- | --- | --- | --- | --- | --- | --- |
| Public Web Next.js | PARCIAL | Datos seed pueden confundirse con datos reales | Usuarios verian catalogo no verificado | Mantener banner de origen y verificar Firestore | Alta | `apps/web`, `visual-audit/report.md` |
| Admin Panel | PARCIAL | Sin custom claims desplegados | Riesgo de acceso no autorizado | Configurar claims y reglas | Critica | `apps/admin`, `RBAC_MATRIX.md` |
| Firestore Contracts | PARCIAL | Reglas en repo sin verificacion en vivo | Vulnerabilidad en reglas permissive | Ejecutar emulator tests y deploy | Critica | `FIRESTORE_CONTRACTS.md` |
| Storage Rules | PARCIAL | Reglas leidas pero no probadas | Uploads podrian fallar o ser inseguros | Test upload script y size limits | Alta | `storage.rules` |
| AI Gateway | PENDIENTE | Endpoint `/api/baqueano-ai` devuelve 501 | Usuarios no pueden usar asistente | Desarrollar gateway seguro en Cloud Functions | Media | `apps/web/src/app/api/baqueano-ai` |
| Maps Integration | PENDIENTE | Mapa conceptual sin key restringida | Funcionalidad limitada | Obtener Maps key con HTTP referrer | Media | `InteractiveMap.tsx` |
| Backups | PENDIENTE | Plan documentado, no automatizado | Perdida de datos ante incidente | Configurar cron GCP / gcloud | Alta | `BACKUP_RECOVERY.md` |
| Monitoring & Alerts | PARCIAL | Health check basico, sin alertas Cloud | Incidentes no detectados a tiempo | Configurar Uptime Check y Log Alerts | Alta | `INCIDENT_RESPONSE.md` |
| Performance Budget | OPERATIVO | 2.1s LCP mobile lab, 0.00 CLS | Experiencia fluida | Monitorear en produccion con RUM | Media | `PERFORMANCE_BUDGET.md` |
| Responsive Design | OPERATIVO | 16 viewports probados (320-2560px) | Layout adaptativo | Mantener en CI | Baja | `visual-audit/report.md` |
| Android Isolation | OPERATIVO | 0 cambios en lib/android/test/pubspec | App Flutter intacta | Preservar en todo momento | Critica | `git diff -- lib android test` |
