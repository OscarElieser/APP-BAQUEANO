# Auditoría `/lib` (Flutter/Android) — Ecosistema BAQUEANO centralizado

> Fecha: 2026-10-05 · Alcance: `lib/` (127 archivos Dart, 50 645 líneas), `test/`, `pubspec.yaml`, `android/app/src/main/AndroidManifest.xml`, contratos de `supabase/functions/*` y `functions/`.
> Método: lectura de código y búsquedas (`grep`) reproducibles. Sin Flutter SDK en el contenedor de auditoría: `flutter analyze` / `flutter test` se validan en CI (`.github/workflows/flutter_ci.yml`).

## 🎯 POR QUÉ (Propósito)

El propietario quiere un solo sistema: **Web + App + Ops Center + BAQUI**, sobre **Supabase como única fuente de verdad** y **Firebase solo para Auth y Hosting**. La lógica sensible vive en el backend/API. Ops Center es la interfaz de administración, no el servidor. Esta auditoría mide, con evidencia, qué tan lejos está la App Android de ese objetivo y en qué orden cerrar la brecha.

## ⚙️ CÓMO (Método y rúbrica de porcentajes)

Cada porcentaje de la matriz final sale de esta rúbrica por capa, verificada en código:

| Valor | Criterio verificable |
|---|---|
| 0 % | No existe nada para ese módulo en esa capa. |
| 25 % | Existe UI/código, pero con datos fijos en el código, simulados o solo en memoria. |
| 50 % | Lee datos reales de una fuente remota, pero no es la fuente oficial (Firestore heredado) o es solo lectura. |
| 75 % | Lee y escribe contra la fuente/contrato oficial, pero le falta validación en servidor, pruebas o auditoría. |
| 100 % | Contrato oficial, validación en servidor, pruebas y trazabilidad. |

## 📦 QUÉ (Hallazgos)

### 1. Inventario estructural

| Capa | Hallazgo (evidencia) |
|---|---|
| Estructura | `lib/{config,core,data,features,models,services}`. Hay 21 features. No existe una capa `data/` con repositorios ni `domain/`. |
| Estado | Riverpod 2.6. Hay 18 providers, mayoritariamente `ChangeNotifierProvider` sobre servicios. |
| Rutas | `go_router` 14 en `lib/config/app_router.dart`. 40+ rutas con aliases, sin `redirect` global de autenticación. |
| Datos fijos | `core/data/catalog_data.dart` (1761 l.), `data/baqueano_full_catalog.dart` (1595 l.), `country_history/data/nicaragua_history_data.dart` (1200 l.). Los usan 8 de 21 features. |
| Remoto | Firestore: `places`, `destinations`, `categories`, `businesses`, `users`, `user_saved_places`, `payment_orders`, `audit_logs`, `multimedia`, `app_config`, `sos_logs`. |
| Supabase | **0 uso desde la App.** No están `supabase_flutter` ni ningún cliente HTTP a PostgREST. |
| Backend | Pagos: `FirebasePaymentBackendClient` usa `httpsCallable` (`lib/core/payment/payment_gateway.dart`). BAQUI: `HttpClient` al gateway de IA. |
| Faltantes | `firebase_messaging`, `firebase_crashlytics`, `firebase_remote_config`, `flutter_secure_storage`, `connectivity_plus`, deep links propios (`app_links`), `flutter_localizations` y ARB. |
| i18n | La App no tiene ningún sistema de localización: 0 `AppLocalizations`. Hay 91+ `Text('…')` literales en español. La Web sí tiene 6 idiomas (698 claves). |
| Pruebas | 5 archivos en `test/` (814 líneas): IA, directorio, itinerarios, pasarela de pago y widget. |
| Imágenes | 160 URLs de Unsplash fijas en el código (stock, no de BAQUEANO). |

### 2. Hallazgos por severidad

**CRÍTICO**

- **L-C1 — Llaves de IA compilables en el APK:** `baqueano_ai_service.dart` leía `GROQ_API_KEY`, `OLLAMA_API_KEY` y `GEMINI_API_KEY` con `String.fromEnvironment` sin condición. Un build release con `--dart-define` las incrustaba en el binario, aunque solo se usaran en modo debug.
  - **Corregido hoy:** ahora son `kDebugMode ? String.fromEnvironment(...) : ''`. En release el compilador elimina el literal.
- **L-C2 — BAQUI apuntaba a un gateway inexistente:** el valor por defecto era `https://api.baqueano.app/ai/v1/chat`, un host que no aparece en ningún despliegue, workflow ni documento del repositorio. En release, toda pregunta caía al modo offline local.
  - **Corregido hoy:** ahora apunta a la Edge Function oficial `baqueano-ai`, con el contrato `prompt` + `currentLanguage`, y lee la respuesta `message` / `itinerary`. Se añadieron timeouts de 20 s.
- **L-C3 — La App no lee Supabase:** la fuente de verdad oficial no tiene ningún cliente en Android. Lo que Ops Center publica en Supabase no llega a la App: solo llega lo que está en Firestore heredado o fijo en el código.

**ALTO**

- **L-A1 — Mensajería simulada:** `booking_and_communication_service.dart` marca un mensaje como "entregado" a los 350 ms, con un `Future.delayed` local. No hay transporte ni persistencia. Muestra un estado que no es real.
- **L-A2 — SOS sin trazabilidad:** `emergency_sos_screen.dart` obtiene la posición con Geolocator y abre llamada/SMS. `FirestoreService` define `sos_logs`, pero nadie lo invoca. Ops Center no puede ver alertas.
- **L-A3 — Sin i18n:** la App solo existe en español, frente a los 6 idiomas de la Web y de BAQUI.
- **L-A4 — Sin FCM ni deep links `baqueano://`:** el Manifest solo declara `https`, `tel`, `mailto` y `geo` como consultas.
- **L-A5 — Catálogo duplicado en el código:** tres archivos con unas 4500 líneas de datos fijos divergen de Supabase (17 departamentos, 7 destinos y 5 negocios reales).

**MEDIO**

- **L-M1 — `/admin` sin guard:** la ruta solo muestra un enlace al Ops Center web, así que no expone nada; se recomienda añadir un guard por consistencia.
- **L-M2 — Sin crash reporting ni Remote Config:** tampoco hay control de versión mínima.
- **L-M3 — Imágenes:** usan URLs de Unsplash; falta acotar `cacheWidth` de forma uniforme (regla 5 de AGENTS).
- **L-M4 — Archivos gigantes:** `profile_screen` (2526 l.), `community_screen` (2252 l.), `responsive_scaffold` (1989 l.), `checkout_modal` (1837 l.).
- **L-M5 — `firebase_options.dart` heredado:** referencia una RTDB (`app-baqueano-default-rtdb`) que la arquitectura oficial no usa. Es inocuo, pero confunde.

**BAJO / correcto (mantener)**

- **Roles:** `auth_service.dart` ignora `admin` y `super_admin` leídos de Firestore y solo los acepta desde el custom claim del token. Es correcto: el rol se decide en el servidor.
- **Pagos:** `payment_gateway.dart` crea la orden vía `httpsCallable`. Valida `orderId`, `uid`, monto finito > 0 y `checkoutUrl` https. La App no decide montos.
- **Claves de Firebase:** las `apiKey` de `firebase_options.dart` son públicas por diseño. No son secretos.

### 3. Matriz por módulo

Leyenda: 🟢 funciona con datos reales · 🟡 parcial · 🔴 roto o simulado · ⚪ no existe · 🔵 depende del backend · 🟣 decisión del propietario.

| MÓDULO | ESTADO | FUNCIONA | NO FUNCIONA / INCOMPLETO | FALTA | TABLA SUPABASE | API NECESARIA | OPS CENTER | WEB | PRIORIDAD | RIESGO | RECOMENDACIÓN |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Auth / perfil | 🟡 | Google Sign-In; rol desde el claim | Perfil en Firestore `users`; sin perfil unificado | Espejo a `profiles` | `profiles`, `staff_roles` | `baqueano-ops whoami` / perfil | Usuarios | Sí | P1 | Alto | Mantener Firebase Auth; perfil en Supabase vía Edge Function. |
| Destinos / catálogo | 🔴 | UI rica | Datos fijos en código + Firestore `places`/`destinations` | Lectura Supabase, caché | `destinations`, `departments`, `municipalities` | `GET destinations` (PostgREST anon + RLS) | 03-destinos (escritura real) | Sí | P1 | Alto | Repositorio `DestinationsRepository` Supabase-first con respaldo local. |
| Negocios / directorio | 🟡 | Lee Firestore `businesses` | Fuente heredada | Supabase | `businesses` | PostgREST | 08-negocios (escritura real) | Sí | P1 | Medio | Igual que destinos. |
| BAQUI (IA) | 🟡 | RAG local, modo offline, guardrails | Gateway inexistente (**corregido**) | Acciones validadas (`open_destination`…) | `ai_messages`, `travel_plans` | `baqueano-ai` | KPIs IA (reales) | Sí | P0 | Crítico → Medio | Hecho hoy: gateway oficial + llaves solo debug. Siguiente: lista blanca de acciones. |
| Mapa | 🟡 | Google Maps con coordenadas del catálogo | Coordenadas del catálogo fijo | Coordenadas `geom` de Supabase | `destinations.geom` | PostgREST | 07-mapa | Sí | P2 | Medio | Mostrar solo puntos con coordenadas verificadas; nunca inventarlas. |
| Reservas / checkout | 🟡 | Modal, voucher QR | Estado local | Tabla de reservas | `bookings` | Edge Function `bookings` | Reservas | Parcial | P2 | Alto | El flujo reserva → pago → QR debe ser del servidor. |
| Pagos | 🔵 | Callable con validación | Depende de Cloud Functions (no desplegadas por facturación) | Webhook del proveedor | `payment_orders` | Backend de pagos | Finanzas | — | P2 | Alto | Mantener el cliente; decidir proveedor y backend (🟣). |
| Mensajería | 🔴 | UI | Entrega simulada, sin persistencia | Transporte real | `messages` | Edge Function / Realtime | Moderación | — | P3 | Medio | Rotular "en cola local" o conectar con Realtime. |
| Notificaciones | 🔴 | Lista local | Sin FCM | `firebase_messaging` | `notifications` | Backend de envío | Comunicaciones | — | P3 | Bajo | FCM + tabla de tokens. |
| SOS | 🟡 | GPS real, llamada/SMS | Sin registro remoto | Registro con consentimiento | `emergencies` / `sos_events` | Edge Function `sos` | Emergencias (Realtime) | — | P1 | Alto | Registrar la alerta sin bloquear la llamada. |
| Comunidad / testimonios | 🟡 | UI | Sin publicación a Supabase | Envío + moderación | `testimonials`, `reviews` | `baqueano-community` | Moderación | Sí | P2 | Medio | Reutilizar `baqueano-community` (ya en producción). |
| Historia del país | 🟡 | Contenido amplio | Fijo en el código | Versionado | `culture`, `heritage` | PostgREST | 15/17 | Sí | P4 | Bajo | Migrar al final. |
| Pasaporte / membresía | 🟡 | Sellos y XP en `users` | Firestore | Supabase | `profiles`, `passport_stamps` | Edge Function | Usuarios | Parcial | P3 | Medio | Escrituras de XP solo desde el servidor. |
| Admin (App) | 🟢 | Redirige al Ops Center web | — | Guard | — | — | — | — | P5 | Bajo | Correcto por diseño. |
| Ambiental / institucional / búsqueda | 🟡 | UI | Datos fijos | Supabase | varias | PostgREST | — | Sí | P4 | Bajo | Migrar con el catálogo. |

### 4. Matriz final de integración (porcentajes según la rúbrica)

| MÓDULO | OPS CENTER | SUPABASE | API | WEB | FLUTTER | ESTADO |
|---|---|---|---|---|---|---|
| Destinos | 75 % (lee/escribe vía `baqueano-ops`) | 75 % (7 filas reales, RLS, PostGIS) | 75 % | 50 % | 25 % (fijo + Firestore) | 🟡 |
| Negocios | 75 % | 75 % (5 filas) | 75 % | 50 % | 50 % (Firestore) | 🟡 |
| Departamentos | 50 % (lectura) | 75 % (17 filas) | 50 % | 75 % | 25 % | 🟡 |
| BAQUI | 50 % (KPIs reales) | 75 % (`ai_messages`, `travel_plans` 31) | 75 % (`baqueano-ai`) | 75 % | 50 % (gateway corregido hoy; falta prueba en vivo) | 🟡 |
| Pagos | 0 % | 0 % | 50 % (callable, no desplegado) | 0 % | 75 % (cliente validado) | 🔵 |
| Reservas | 0 % | 25 % (tabla vacía) | 0 % | 25 % | 25 % | 🔴 |
| SOS / emergencias | 25 % | 25 % | 0 % | 25 % | 50 % | 🟡 |
| Mensajería | 0 % | 0 % | 0 % | 0 % | 25 % | 🔴 |
| Notificaciones push | 0 % | 0 % | 0 % | — | 0 % | ⚪ |
| Comunidad / testimonios | 75 % (moderación) | 75 % (0 filas, flujo listo) | 75 % | 75 % | 25 % | 🟡 |
| Auth / roles | 75 % (RBAC en servidor) | 75 % (`staff_roles`) | 75 % | 75 % | 75 % (rol solo desde el claim) | 🟢 |
| i18n | — | — | — | 100 % (6 idiomas) | 0 % | 🔴 |

### 5. Respuestas a las 20 preguntas

1. **¿La App usa la misma fuente de verdad que la Web?** No. La Web y Ops leen Supabase; la App lee Firestore heredado y datos fijos en el código (L-C3).
2. **¿Hay secretos en el APK?** Ya no. Las llaves de IA quedaron solo para debug (L-C1). Las claves Firebase son públicas. No hay `service_role`.
3. **¿La App contiene claves privadas de IA?** No en release, tras la corrección de hoy.
4. **¿BAQUI pasa por un gateway?** Sí: `baqueano-ai` con el ID token de Firebase y App Check. Antes apuntaba a un host inexistente (L-C2).
5. **¿Una respuesta de IA puede ejecutar código?** No. El servicio solo produce texto y tarjetas. Las acciones (`ai_tool_action.dart`) deben limitarse a una lista blanca: `open_destination`, `open_map`, `build_itinerary`, `call_emergency`. Esto queda en el roadmap P1.
6. **¿Los roles se validan en el backend?** Sí. El claim `role` lo firma el servidor y la App descarta `admin` leído de Firestore. Ops valida en `baqueano-ops`.
7. **¿Hay un perfil de usuario único?** No. Está en Firestore `users`; la tabla `profiles` de Supabase tiene 0 filas.
8. **¿Pagos en el backend?** El diseño es correcto (callable más validación), pero el backend no está desplegado. Nadie puede cobrar hoy.
9. **¿Existe el flujo reserva → pago → QR → Mi Viaje?** Solo en la UI. El QR/voucher se genera localmente, sin una reserva persistida en el servidor.
10. **¿Los mapas inventan posiciones?** Usan las coordenadas del catálogo fijo; el centro por defecto es Nicaragua. Hay que migrarlas a `geom` verificado.
11. **¿SOS funciona sin red?** La llamada y el SMS, sí. El registro remoto no existe.
12. **¿FCM y deep links?** No hay ninguno de los dos.
13. **¿Analítica y crash reporting?** No hay Crashlytics ni analítica. Al añadirlos, sin PII: nada de email, coordenadas exactas ni texto de chats.
14. **¿Remote Config / versión mínima?** No hay. Propuesta: `app_config` en Supabase con `min_version` y flags, leído al iniciar.
15. **¿Caché offline?** Parcial: SharedPreferences para el caché de IA y la sesión. No hay caché de catálogo con `updated_at`.
16. **¿Sincronización Ops → App?** No existe, porque la App no lee Supabase. Diseño: lectura por `updated_at > last_sync`, versión de catálogo en `app_config` e invalidación al cambiar la versión. Realtime solo en SOS, reservas y moderación.
17. **¿Riverpod bien usado?** Es funcional, pero los `ChangeNotifier` mezclan red, estado y persistencia. Faltan repositorios inyectables para hacer pruebas.
18. **¿Guards de go_router?** No hay un `redirect` global. Las pantallas sensibles dependen de que el servidor valide, que es lo correcto. Conviene añadir el guard para la experiencia de uso.
19. **¿Pruebas suficientes?** No: 5 archivos y ninguna prueba de repositorio ni de contrato API.
20. **¿Entornos dev/staging/prod?** Solo existe `--dart-define` para `AI_GATEWAY_URL`. No hay flavors ni un proyecto Supabase de staging.

### 6. Arquitectura objetivo (sin crearla de golpe)

```
lib/
  core/      api_client (timeouts, retry exponencial, cancelación, refresh del ID token, errores tipados), env, cache
  data/      dto/ + mappers/ + repositories/ (Supabase-first, Firestore heredado como respaldo de lectura)
  domain/    entities/ (Destination, Business, Booking, SosEvent…)
  features/  presentation por feature (se conserva la estructura actual)
```

La migración se hace por módulo: se añade un repositorio, se cambia el provider y la UI no se toca. No se borra nada mientras el repositorio nuevo no tenga pruebas.

**Capa API (contrato común Web + App):**

- PostgREST público con RLS para lecturas de catálogo, con paginación `range` y `order=updated_at`.
- Edge Functions para escrituras y lógica sensible: `baqueano-ops`, `baqueano-community`, `baqueano-ai`, y las futuras `bookings` y `sos`.
- Token: el ID token de Firebase en `Authorization: Bearer`, verificado con JWKS (igual que las funciones actuales).
- Timeouts de 10–20 s, reintento solo en GET idempotentes (3 intentos, backoff de 0,5/1/2 s) y nunca en pagos.
- Contrato documentado en OpenAPI: `docs/api/openapi.yaml`, pendiente P1.

### 7. Roadmap técnico

| Prioridad | Entregable | Criterio de hecho |
|---|---|---|
| **P0** | ✅ Llaves de IA solo debug; ✅ BAQUI → `baqueano-ai`; validar en CI (`flutter analyze`/`test`). | CI verde; APK release sin `GROQ`/`GEMINI`/`OLLAMA`. |
| **P1** | `supabase_flutter` (anon key pública) + `DestinationsRepository`/`BusinessesRepository` Supabase-first; lista blanca de acciones de BAQUI; registro SOS; OpenAPI v1; perfil `profiles`. | Lo publicado en Ops aparece en la App; pruebas de repositorio. |
| **P2** | Reservas en el servidor (Edge Function `bookings`), pago → webhook → QR firmado → "Mi Viaje"; mapas con `geom`; testimonios vía `baqueano-community`. | Reserva persistida y visible en Ops. |
| **P3** | FCM + deep links `baqueano://destination/{id}`; mensajería real o rotulada; pasaporte con XP del servidor. | Notificación de prueba entregada; enlace abre la ficha. |
| **P4** | i18n con ARB en 6 idiomas (reutilizando las claves de la Web); migrar historia/cultura; Crashlytics sin PII; `app_config` con `min_version`. | 6 locales; versión mínima forzable. |
| **P5** | Flavors dev/staging/prod; dividir archivos de más de 1500 líneas; imágenes propias con `cacheWidth`; retirar datos fijos cuando Supabase cubra el 100 %. | Builds por entorno; 0 URLs de Unsplash. |

### 8. Cambios aplicados en esta entrega

- `lib/services/baqueano_ai_service.dart`:
  - Gateway por defecto: `https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-ai`, configurable con `--dart-define=AI_GATEWAY_URL`.
  - Payload con `prompt`, `currentLanguage` y `countryCode`, conservando `messages` y `session`.
  - Lectura de `message` / `itinerary` (y las claves heredadas).
  - Timeouts de 20 s.
  - Llaves de proveedores solo con `kDebugMode`.
  - No se eliminó ninguna ruta de código: el modo offline y los proveedores de depuración siguen disponibles.
