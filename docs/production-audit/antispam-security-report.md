# Antispam y seguridad del servidor — matriz final (20/20 E)

<!--
🎯 POR QUÉ: cerrar el requisito 20/20 E con evidencia reproducible: cada puerta pública del
   servidor (Edge Functions y RPC de Supabase) con su autenticación, origen y límites reales.
⚙️ CÓMO: límites leídos del código (archivo:línea); pruebas negativas hechas en vivo contra
   producción el 2026-10-07 (HTTP real desde Supabase); pruebas de base de datos dentro de
   transacciones que se revierten (no dejan filas).
📦 QUÉ: matriz por función, pruebas en vivo, hallazgo corregido hoy y avisos aceptados.
-->

Fecha: 2026-10-07 (hora de Nicaragua). Proyecto Supabase `heiudfpthqwtjrtluqlm`. Sitio: https://baqueanonicaragua.com.

## 1. Edge Functions: quién puede escribir y con qué límites

| Función | Escritura exige | Origen del navegador | Límites anti-abuso (código) | Tamaño máx. |
|---|---|---|---|---|
| baqueano-intake (contacto, negocios, denuncias) | Público + honeypot `website` | Solo dominios oficiales (`originAllowed`) | Por IP (hash): contacto 5/10 min, negocio 6/h, denuncia 5/10 min; 3 solicitudes de negocio por día (`limitIp`, `baqui_consume_budget`) | 32 KB |
| baqueano-community (experiencias) | Token de Firebase | Sí | 5 experiencias/día, 12 comentarios/10 min, 10 denuncias/h, 60 reacciones/min (`LIMITS`) | 64 KB |
| baqueano-reviews (opiniones) | Token de Firebase | Sí | 6 escrituras/h por persona, 10 denuncias/h, 30/10 min por IP (`LIMITS`) | 16 KB |
| baqueano-messages (mensajería, F6) | Token de Firebase | Sí | 10 mensajes/10 min, 5 conversaciones abiertas (funciones `msg_*`) | 8 KB |
| baqueano-reservas | Token de Firebase | Sí | 10 solicitudes/día (`REQUESTS_PER_DAY`) | 8 KB |
| baqueano-sos | Token de Firebase | Sí | 3 alertas/10 min (`REPORTS_PER_10_MIN`) | 8 KB |
| baqueano-ai (BAQÜI) | Público | — | 20 consultas/10 min por IP + 400/h global (`baqui_consume_budget`) | — |
| baqueano-presence | Público (latido) | Solo dominios oficiales | 240 latidos/10 min por IP | 4 KB |
| baqueano-notifications | Token de Firebase | Sí (escrituras) | Solo sus propios avisos | 4 KB |
| baqueano-identity | Token + permiso RBAC | Sí | 1 solicitud de verificación pendiente por tipo | 16 KB |
| baqueano-ops | Token + rol de equipo (con revocación RBAC) | Sí | 1 corrida manual de controles cada 2 min | 128 KB |

Las IP nunca se guardan en claro: se usa SHA-256 (con sal diaria aleatoria en las RPC).

## 2. Pruebas negativas en vivo (HTTP real contra producción)

| Función | Sin sesión | Token falso | Origen ajeno | Cuerpo de 140 KB |
|---|---|---|---|---|
| baqueano-community | 401 | 401 | 401 | 413 |
| baqueano-identity | 401 | 401 | 401 | 413 |
| baqueano-messages | 401 | 401 | 403 | 413 |
| baqueano-notifications | 401 | 401 | 403 | 413 |
| baqueano-ops | 401 | 401 | 401 | 413 |
| baqueano-presence | 403 | 403 | 403 | 413 |
| baqueano-reservas | 401 | 401 | 401 | 413 |
| baqueano-reviews | 401 | 401 | 403 | 413 |
| baqueano-sos | 401 | 401 | 401 | 413 |

Formulario público (baqueano-intake, `contact_submit`):

- Desde origen ajeno, o sin cabecera Origin: **403**, `origin_forbidden`.
- Con el honeypot lleno desde el dominio oficial: 200 «aceptado», para no avisar al bot, y **0 filas** guardadas en `contact_messages`.

Además, el job "Pruebas negativas en vivo (RBAC y RLS)" del flujo de producción repite pruebas de este tipo en cada despliegue.

## 3. RPC públicas de Supabase (clave publicable)

| RPC | Qué hace | Límite |
|---|---|---|
| `track_event` | Analítica propia (con consentimiento) | 300/h por anonymous_id **+ 600/10 min por IP (nuevo)** |
| `track_commercial_action` | Clic en WhatsApp, llamada o ruta de un negocio | 60/h por anonymous_id **+ 120/10 min por IP (nuevo)** |
| `submit_feedback` | Valoración de una función | 10/día por anonymous_id **+ 20/h por IP (nuevo)** |
| `record_app_download` | Contador de descargas de la APK | 3 por dispositivo y día (hash de IP con sal diaria) |
| `public_app_download_stats`, `public_destination_lodging_prices`, `platform_review_summary`, `platform_reviews_public`, `public_impact_summary` | Solo lectura de agregados o de datos publicados | — |
| `security_posture` | Evidencia pública de RLS (sin datos de personas), usada por `tools/kronox-prod-evidence.mjs` | — |

### Hallazgo corregido hoy

Los límites de `track_event`, `track_commercial_action` y `submit_feedback` dependían solo de `anonymous_id`, un valor que elige el navegador. Bastaba cambiarlo en cada llamada para inflar la analítica o llenar valoraciones.

- **Corrección:** migración `20261007240000_rpc_ip_rate_limits.sql`, con `client_ip_allowed()`: límite por IP en hash con sal diaria. No aplica a service_role ni a llamadas internas.
- **Prueba (transacción revertida):**
  - 25 envíos con 25 `anonymous_id` distintos desde la misma IP: **20 aceptados, 5 bloqueados**;
  - otra IP sigue pudiendo;
  - service_role y las llamadas sin cabeceras no se limitan;
  - **0** registros con la IP en claro.

## 4. Avisos del asesor de seguridad de Supabase (aceptados, con motivo)

- **RLS activo sin políticas (20 tablas, INFO):** es intencional. Esas tablas solo se leen y escriben desde Edge Functions con service_role (buzón, mensajería, notificaciones, presencia, automatización, contadores). Ninguna se expone al navegador; por REST con la clave publicable devuelven `[]`.
- **Funciones SECURITY DEFINER ejecutables por anon/authenticated:** son las RPC de la tabla 3, públicas por diseño. Cada una valida parámetros, fija `search_path` y tiene límites.
- **Extensión `vector` en el esquema public (WARN):** moverla de esquema afecta las columnas de embeddings de BAQÜI. Queda como mejora planificada, no como riesgo de acceso.

## 5. Cómo repetir las pruebas

- Pruebas en vivo: las consultas HTTP de la sección 2 (cualquier cliente HTTP; sin claves privadas).
- Base de datos: el bloque `do $$ … raise exception … $$` descrito en SESSION_LOG.md (2026-10-07). Se revierte siempre.
