# BACKUP AND RECOVERY

## Why

Un lanzamiento controlado requiere poder recuperar datos y configuracion sin improvisar.

## How

Usar herramientas oficiales de Firebase/Google Cloud, versionar configuracion no secreta y probar restauracion en staging antes de tocar produccion.

## What

| Recurso | Backup | Restore | Estado |
|---|---|---|---:|
| Firestore | Export programado a bucket protegido | Import a proyecto staging primero | PENDIENTE |
| Storage | Versionado/replica de bucket o copia programada | Restaurar prefijos afectados | PENDIENTE |
| Env vars | Secret manager/hosting config documentada | Reaplicar desde fuente segura | PENDIENTE |
| Codigo website | Git tag release candidate | Rollback a tag/version hosting | PARCIAL |

No ejecutar restauraciones, migraciones ni borrados sobre produccion sin aprobacion explicita.
