# RELEASE NOTES

## Why

Registrar cambios relevantes por version del website sin mezclarlo con Android.

## How

Formato: Added, Changed, Fixed, Security, Known Issues.

## What

## website-0.4.0-rc1 - 2026-09-07

### Added

- Health check publico `/api/health`.
- Validacion central de entorno publico.
- Plantillas `.env` sin secretos para development, staging y production.
- Documentacion de despliegue, backup, incidentes, costos, DNS y lanzamiento.
- Smoke test local de invariantes de hardening.
- Plantilla de CI dentro de `website/.github/workflows`.

### Changed

- Documentacion de entorno reemplaza valores sensibles por placeholders.
- Admin declara `noindex,nofollow` en metadata y headers.

### Fixed

- Consulta de favoritos usa el `userId` recibido en runtime.

### Security

- CSP y cabeceras de seguridad agregadas a web/admin.
- Se evita exponer secretos en plantillas versionadas.

### Known Issues

- Produccion no desplegada.
- Staging, Auth/RBAC real, rules tests, Maps, AI Gateway y pagos siguen pendientes.
