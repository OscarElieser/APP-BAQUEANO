# PRODUCTION STATUS

## Why

No confundir preparado localmente con operacion real en produccion.

## How

Estados permitidos: OPERATIVO, DEGRADADO / PARCIAL, PENDIENTE, INCIDENTE.

## What

| Componente | Estado | Evidencia | Riesgo | Accion |
|---|---:|---|---|---|
| Web publica | PENDIENTE | No desplegada | Sin usuarios reales | Validar staging primero |
| Control Center | PENDIENTE | No desplegado | Auth/RBAC pendiente | Verificar claims |
| Firestore | DEGRADADO / PARCIAL | Servicios locales | Sin live checks | Configurar proyecto |
| Storage | DEGRADADO / PARCIAL | Rules existentes | Sin upload test | Emulator/staging |
| AI Gateway | PENDIENTE | 501 | No disponible | Integrar gateway |
| Maps | PENDIENTE | Conceptual | No interactivo real | Key restringida |
| Monitoring | DEGRADADO / PARCIAL | Health check | Sin alertas | Conectar proveedor |
| Produccion | PENDIENTE | No autorizada | Go-live bloqueado | Cerrar checklist |
