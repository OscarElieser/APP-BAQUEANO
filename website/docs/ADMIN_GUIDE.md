# ADMIN GUIDE

## Why

El Control Center debe operarse con roles claros y sin exponer acciones sensibles a usuarios no autorizados.

## How

Usar Firebase Auth y Custom Claims. No crear cuentas admin desde botones publicos.

## What

- Iniciar sesion con cuenta autorizada.
- Revisar dashboard solo despues de confirmar origen de datos.
- Crear o editar destinos respetando `FIRESTORE_CONTRACTS.md`.
- Publicar solo contenido verificado.
- Aprobar negocios despues de revisar propietario, contacto y ubicacion.
- Revisar auditoria para cambios sensibles.
- No modificar roles sin motivo documentado y registro auditable.

Estado: guia operativa inicial. Requiere validacion con Control Center autenticado real.
