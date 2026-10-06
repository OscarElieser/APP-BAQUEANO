# Presencia real y Actividad en vivo (Ops Center) — 2026-10-06

> 🎯 **POR QUÉ:** el propietario reportó que unas 5 personas usaron BAQUEANO a la vez y el Ops Center no las mostró. Pidió encontrar la causa real, corregirla y demostrarlo.
> ⚙️ **CÓMO:** se investigó con consultas a la base de producción y con el código. Después se construyó la presencia sobre Firebase (autenticación) y Supabase (registro), y se probó con SQL en transacciones revertidas, con llamadas HTTP reales a la Edge Function y con Playwright + axe.
> 📦 **QUÉ:** causa comprobada, arquitectura, respuestas a las 17 preguntas del propietario, evidencia y pendientes.

## 1. Causa real (comprobada, no supuesta)

| # | Hallazgo | Evidencia | Severidad |
|---|---|---|---|
| 1 | El Ops Center **no tenía ninguna métrica de "ahora"**: solo "usuarios activos 7/30 días". | `js/ops-center/ops-live-data.js` (tarjeta `ops.impact.active`, fuente `analytics_events`) | 🔴 |
| 2 | La analítica **solo se envía con consentimiento de analítica**. Quien rechaza o ignora el aviso de cookies no se cuenta. | `js/baqueano-analytics.js` → `consentGranted()`. El 2026-10-06 en producción: 9 visitantes anónimos y **1 solo** `consent_updated`. | 🔴 |
| 3 | La web inicia sesión con **Firebase**, pero `track_event` toma el usuario de `auth.uid()` de **Supabase**: `user_id` llega siempre vacío. | `analytics_events` del 05 y 06/10: `users = 0`. | 🔴 |
| 4 | **Android no enviaba ninguna señal.** | `analytics_events`: solo `platform = web`. | 🔴 |
| 5 | El rastreador antiguo (`baqueano-traffic-tracker.js`, que pedía la IP a servicios de terceros) **no lo carga ninguna página** y su tabla `traffic_sessions` quedó bloqueada en `20261003213000`: tiene 0 filas. | Búsqueda en el repo y `select count(*)`. | 🟠 (bloquearlo fue correcto; faltó el reemplazo) |
| 6 | No existía Realtime/Presence ni heartbeat. | Búsqueda de `presence`, `heartbeat` y `last_seen` sin resultados. | 🔴 |

Conclusión: las personas sí entraron, pero el sistema no tenía cómo verlas *en el momento*. La analítica contaba solo a quien aceptaba cookies, a nadie por nombre y nada de Android.

## 2. Arquitectura

```
Usuario ─▶ Firebase Auth (Google / correo) ─▶ ID Token
   │                                              │ (x-firebase-token, nunca se guarda)
   ▼                                              ▼
Web (js/baqueano-presence.js)     ┐      Edge Function baqueano-presence
Android (lib/services/            ├────▶  · verifica firma JWKS de Google, emisor y audiencia
  presence_service.dart)          ┘       · UID, proveedor y nombre salen SOLO del token verificado
                                          · rol: staff_roles + effectiveStaffRole (revocación)
                                          · límite 240 latidos / 10 min por IP (hash, nunca en claro)
                                                     │ service_role
                                                     ▼
                         Supabase: presence_sessions (1 fila por pestaña / proceso de app)
                                   presence_events   (solo inserción, para el feed)
                                                     │
                                                     ▼
                         Ops Center "Actividad en vivo" + franja del Dashboard
                         (snapshot cada 10 s solo con la vista visible; solo admin, superadmin o auditor)
```

- **Persona ≠ usuario ≠ sesión ≠ pestaña:**
  - persona = `coalesce(user_uid, browser_id)`;
  - sesión = `browser_id`;
  - pestaña = fila.
  - El `browser_id` lo comparten las pestañas por BroadcastChannel y vive solo en memoria. Por eso 5 pestañas cuentan como **1 persona**.
- **Estados:**
  - 🟢 en línea: latido en los últimos 90 s con la pestaña visible;
  - 🟡 inactivo: pestaña oculta o app en segundo plano, o sin latido entre 90 s y 5 min;
  - ⚪ desconectado: `leave` al cerrar, o sin latido por más de 5 min.
- **Latido:**
  - 25 s con la pestaña visible y 60 s oculta (web);
  - 30 s en primer plano (Android);
  - nada en segundo plano en Android.
- **Cierres abruptos** (se corta la red, se mata la app): el servidor no recibe más latidos y la sesión pasa sola a inactiva y luego a desconectada. No depende de que llegue el `leave`.

## 3. Respuestas a las preguntas del propietario

| Pregunta | Respuesta |
|---|---|
| ¿Dónde se almacena? | En `public.presence_sessions` y `public.presence_events` (Supabase), con migraciones `20261006200000_realtime_presence.sql` y `20261006200100_realtime_presence_functions.sql`, más las funciones v2 aplicadas en producción. |
| ¿Quién la puede utilizar? | El latido lo envía cualquier visitante. El resumen solo lo ven admin, superadmin o auditor, y lo comprueba el servidor. |
| ¿Cómo se autentica? | Con el ID Token de Firebase, verificado en la Edge Function (JWKS de Google, `iss` y `aud` = `app-baqueano`). Nunca se acepta un UID que mande el navegador ni se guardan tokens. |
| ¿Cómo se protege? | RLS activo en ambas tablas, sin acceso para `anon` ni `authenticated` (comprobado con `has_table_privilege`). Funciones `SECURITY DEFINER` con `search_path` vacío, ejecutables solo por `service_role`. El feed es de solo inserción (trigger). Hay límite por IP y origen permitido. |
| ¿Cómo aparece en Supabase? | Una fila por pestaña con `last_seen`, `visible`, `platform`, `device_class`, `path`, `label`, `auth_provider`, `display_name` (solo con sesión) y `ended_at`. |
| ¿Cómo se relaciona con Firebase? | `user_uid` = `sub` del token verificado. `auth_provider` = `firebase.sign_in_provider` (google, password…). |
| ¿Cómo aparece en el Ops Center? | En la vista **39 "Actividad en vivo"**: KPIs, estados, widget 🔥 Firebase Auth, tabla de usuarios, páginas vistas ahora y feed con filtros. También en una franja de KPIs en el Dashboard. |
| ¿Cómo funciona en la web? | `js/baqueano-presence.js`, cargado por `global-injector.js` en todas las páginas públicas y directamente en `admin.html`. |
| ¿Cómo funciona en Android? | `lib/services/presence_service.dart`, iniciado en `main.dart` contra el mismo endpoint, con ciclo de vida y ruta de GoRouter. |
| ¿Cómo funciona en tiempo real? | El latido llega en ≤25 s y el Ops Center consulta cada 10 s con la vista abierta. No se usan canales Realtime: el dato llega agregado, cuesta menos y no queda ningún WebSocket abierto en las páginas públicas. |
| ¿Cómo se audita? | `presence_events` es inmutable. Las acciones administrativas siguen en `audit_logs` y aparecen en el mismo feed. |
| ¿Cómo se monitorea? | Logs de la Edge Function (`[baqueano-presence]`). Si la vista no carga, muestra el error real ("Desconectado" o "Error"), nunca ceros inventados. |
| ¿Cómo escala? | Upsert por clave primaria e índices en `last_seen` y `browser_id`. Con 1.000 personas simultáneas son unas 40 escrituras por segundo, dentro de lo que Postgres soporta. El resumen solo mira los últimos 30 min. |
| ¿Cómo se recupera si falla? | El cliente ignora los errores y reintenta en el siguiente latido. Si la base no responde, la web sigue funcionando. Si se cae el endpoint, el Ops Center lo dice. |
| ¿Cómo afecta el rendimiento? | Un script de 6 KB con `defer`, una petición pequeña cada 25 s, sin librerías. El QA del sitio sigue con 60 cargas y 0 fallos. |
| ¿Cómo se prueba? | SQL en transacciones revertidas (multipestaña, login, Android, inactivo) y HTTP real contra la función (200 / 403 origen / 401 token falso / ruta sin query). Playwright: 2 pestañas = 1 navegador, etiqueta, `leave`, sin almacenamiento local, y la vista con axe en 390 y 1366 px. |
| ¿Cómo se despliega? | La Edge Function ya está desplegada (v2 ACTIVE). La web va con el despliegue normal a Azure. Android necesita una APK nueva para enviar presencia. |

## 4. Privacidad

- No se guarda la IP (solo un hash dentro del contador de límite), ni el user agent completo, ni coordenadas, ni la query string. Por ejemplo, `/opiniones.html?q=secret#x` se guarda como `/opiniones.html`.
- La web no escribe en cookies ni en localStorage o sessionStorage (verificado con Playwright).
- El nombre del usuario se toma del token y solo lo ve el equipo. Del UID se muestran solo los últimos 6 caracteres, en la sección técnica.
- **Pendiente legal:** mencionar la presencia operativa en la Política de Cookies y Privacidad. Usa memoria y no almacenamiento, pero conviene informarlo. Requiere revisión humana del texto legal.

## 5. Pendientes honestos

- 🟡 **Android:** el código está escrito pero no se pudo compilar aquí, porque este entorno no tiene Flutter. Lo valida el CI de Flutter/Gradle, y se necesita una APK nueva.
- 🟡 La prueba de punta a punta con una cuenta real de Google en producción la tiene que hacer el propietario: entrar con su cuenta y abrir la vista 39.
- 🟡 Destinos y departamentos más consultados: hoy salen de `label` (slug de la URL). Falta un ranking dedicado.
