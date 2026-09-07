# CONFIGURACION DE VARIABLES DE ENTORNO - BAQUEANO WEB & ADMIN

## Why

Esta guia evita que BAQUEANO mezcle secretos de servidor con valores publicos de navegador. Las apps Next pueden exponer todo lo que tenga prefijo `NEXT_PUBLIC_`, por lo que ninguna llave privada, token administrativo o secreto de proveedor debe vivir ahi.

## How

Los entornos se separan como `development`, `staging` y `production`. La validacion central vive en `website/packages/config/src/index.ts` y el health check publico en `website/apps/web/src/app/api/health/route.ts`.

Los archivos versionables (`.env.example`, `.env.staging`, `.env.production`) solo contienen placeholders. Los valores reales deben cargarse desde `.env.local`, variables del proveedor de hosting o un secret manager.

## What

### Variables publicas requeridas

```bash
NEXT_PUBLIC_BAQUEANO_ENV=development
NEXT_PUBLIC_BAQUEANO_VERSION=0.4.0-rc1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
NEXT_PUBLIC_FIREBASE_API_KEY=<firebase-client-api-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<project>.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<firebase-web-app-id>
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

### Variables privadas de servidor

```bash
FIREBASE_SERVICE_ACCOUNT_PATH=<local-path-outside-repo>
BAQUEANO_AI_GATEWAY_URL=<server-url>
BAQUEANO_AI_GATEWAY_SECRET=<server-only-secret>
MAPS_SERVER_KEY=<server-only-key>
```

### Reglas

- No versionar `.env.local`, `.env.*.local` ni JSON de Service Account.
- No usar `NEXT_PUBLIC_` para secretos.
- No pegar llaves privadas en documentacion, logs, issues ni capturas.
- Staging debe usar proyecto/configuracion separada cuando la infraestructura lo permita.
- Produccion no debe apuntar a `localhost`.

### Estado actual

| Area | Estado | Evidencia | Pendiente |
|---|---:|---|---|
| Plantillas de entorno | PARCIAL | `website/.env.example`, `.env.staging`, `.env.production` | Sustituir placeholders en hosting seguro |
| Validacion temprana | PARCIAL | `validatePublicEnvironment()` | Probar con variables reales |
| Health check | PARCIAL | `/api/health` | Verificar en staging real |
| Secretos privados | PENDIENTE | No hay secret manager conectado | Configurar en Firebase/hosting/CI |
