# POST DEPLOY CHECKLIST

## Why

El go-live no termina al publicar; se valida inmediatamente con smoke tests.

## How

Ejecutar sobre la URL real de staging o produccion y adjuntar evidencia.

## What

| Check | Estado | Evidencia |
|---|---:|---|
| Domain | PENDIENTE | No hay dominio verificado |
| HTTPS | PENDIENTE | No hay certificado verificado |
| Home | PENDIENTE | No probado en deploy |
| Destinations | PENDIENTE | No probado en deploy |
| Login | PENDIENTE | Auth no verificado |
| Admin | PENDIENTE | RBAC no verificado |
| Firestore | PENDIENTE | Sin lectura viva |
| Storage | PENDIENTE | Sin upload test |
| Maps | PENDIENTE | Conceptual |
| AI | PENDIENTE | Endpoint 501 |
| Analytics | PENDIENTE | No autorizado |
| Error monitoring | PENDIENTE | No conectado |
| Sitemap | PENDIENTE | No validado en dominio |
| Robots | PENDIENTE | No validado en dominio |
| Android intact | PENDIENTE | Git diff final |
