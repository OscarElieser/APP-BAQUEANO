# ENVIRONMENTS - BAQUEANO WEBSITE

## Why

Separar entornos evita que pruebas destructivas, datos semilla o credenciales incompletas afecten usuarios reales.

## How

Cada entorno debe definir sus variables en el proveedor de ejecucion. Los archivos versionados son plantillas sin secretos.

## What

| Entorno | Uso | Dominio esperado | Datos | Estado |
|---|---|---|---|---:|
| development | Desarrollo local | `localhost:3000`, `localhost:3001` | Seed o Firebase dev | PARCIAL |
| staging | QA preproduccion | Pendiente de autorizacion | Datos controlados | PENDIENTE |
| production | Usuarios reales | `www.baqueano.ni`, `admin.baqueano.ni` si se autorizan | Publicados y verificados | PENDIENTE |

Reglas:

- No usar produccion para probar mutaciones destructivas.
- No mezclar credenciales entre staging y produccion.
- No subir `.env.local`.
- No declarar staging operativo hasta validar URL real, Auth, Firestore, Storage, Maps y health check.
