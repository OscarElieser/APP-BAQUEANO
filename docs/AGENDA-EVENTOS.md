# Agenda BAQUEANO: «¡Nicaragua está de fiesta!» (20-10-2026)

## Qué se hizo
- **Index:** sección nueva `#agendaEventos`, justo antes de `#mapaAiSection` («Explorá Nicaragua en el mapa» + BAQÜI). Mantiene el mismo orden en computadora, tableta y celular.
  - Carrusel con 3 a 6 eventos próximos, con desplazamiento táctil, flechas y teclado.
  - Solo carga cuando la sección se acerca a la pantalla.
  - Sin eventos muestra «Muy pronto tendremos nuevas experiencias para descubrir Nicaragua». Nunca muestra ejemplos.
- **`eventos.html`:** agenda completa.
  - Filtros por categoría, departamento, desde y hasta.
  - Muestra próximos o anteriores, y la URL guarda los filtros.
- **`evento.html?e=<slug>`:** ficha del evento.
  - Foto, categoría y estado.
  - Avisos de cancelado, reprogramado o pospuesto.
  - Fecha y horario en hora de Nicaragua, o «Horario por confirmar».
  - Lugar, organizador y entrada.
  - Programa, recomendaciones, enlaces oficiales y fuente.
  - «Cómo llegar» con el navegador interno, solo si las coordenadas están verificadas.
  - «Añadir a mi calendario» (.ics), «Agregar a Mi Viaje» sin duplicar y «Compartir».
  - Schema.org Event solo con datos reales, y Open Graph.
  - Las entradas y las inscripciones se marcan como servicio del organizador. BAQUEANO no vende entradas.
- **Ops Center, pestaña 46 «Gestión de eventos»:**
  - Crear y editar todos los campos y subir la foto.
  - Enviar a revisión, aprobar y publicar, despublicar con motivo, destacar.
  - Cancelar, posponer, reprogramar con aviso y nueva fecha, o volver a programado.
  - Historial de cambios.
  - Nada se borra.
- **BAQÜI:** intención nueva «eventos». Responde preguntas como «¿qué eventos hay este fin de semana en León?».
  - Consulta solo eventos publicados y filtra por fecha (hoy, mañana, fin de semana, semana, mes) y por departamento.
  - Ofrece la ficha y la agenda.
  - Si no hay eventos, lo dice. No inventa ninguno.
- **Menú:** «Cultura» → «Agenda de eventos». También se agregó al sitemap y al buscador.
- **Idiomas:** 97 claves nuevas en 8 idiomas. Fechas y horas se muestran con el formato de cada idioma. El contenido de cada evento queda en su idioma original, y la ficha lo indica.

## Base de datos (`supabase/migrations/20261020150000_tourism_events.sql`)
- **Se reutiliza `public.events`.** Ya existía, vacía. Se amplía: slug, descripción, `start_at` y `end_at` (timestamptz), zona horaria, hora confirmada, modalidad, coordenadas verificadas, acceso, precio y moneda, enlaces oficiales, programa y recomendaciones.
- **El estado del evento y su publicación son campos separados:**
  - `event_status`: programado, cancelado, reprogramado o pospuesto.
  - `publication_status`: borrador, en revisión, publicado o despublicado.
- **Restricciones en la base:**
  - Publicar exige slug, inicio, descripción, foto y fuente oficial.
  - Precio solo si el evento es de pago y tiene moneda.
  - Coordenadas solo dentro de Nicaragua.
  - Enlaces solo https.
  - Un evento nuevo nace en borrador. El valor anterior por defecto era «published».
- **Seguridad:**
  - El público no lee la tabla directamente: usa `public_events()` y `public_event()`, que devuelven solo lo publicado y calculan el estado con la hora real de Nicaragua.
  - Un evento cancelado nunca aparece «en curso». Los finalizados salen de «próximos» y quedan en el histórico.
  - Se quitó la política que dejaba leer la tabla directamente.
- **Historial:** `event_changes` admite solo inserciones. Los eventos no se pueden borrar.
- **Fotos:** bucket `event-images` (5 MB; WebP, JPG o PNG). Solo sube la Edge Function, que comprueba el tipo real del archivo.

## Edge Function `baqueano-events`
- **Lectura pública:** `list` y `get`.
- **Equipo:** `whoami`, `mod_list`, `mod_get`, `save`, `publication`, `status`, `feature`, `upload_url` y `attach_image`.
- **Permisos:** verifica el token de Firebase y `staff_roles`, con la revocación del RBAC. admin y super_admin editan; auditor solo lee.
- **Registro:** cada cambio queda en `event_changes` y en `audit_logs`.

## Pruebas (todas ejecutadas)
| Prueba | Resultado |
|---|---|
| `supabase/tests/tourism_events.test.sql` en Postgres 16 local con la estructura de producción | **15/15 OK**, 0 filas al final. Falla sin la migración |
| `deno test baqueano-events/helpers.test.ts` (hora de Nicaragua → UTC, validaciones) + `deno check` | **5/5 OK** |
| `deno test baqueano-ai/events-answer.test.ts` (BAQÜI: fechas, departamento, sin inventar) | **4/4 OK** |
| `scripts/agenda-qa.mjs` (Chromium; función simulada; escrituras a producción bloqueadas) | **32/32 OK** |
| i18n, glosario, auditoría, export app, build, SEO, auditoría estática | OK |

**Lo que todavía no se probó de punta a punta:** el flujo real del Ops Center (crear, subir foto y publicar) contra la función desplegada. Necesita correr el SQL y desplegar `baqueano-events` y la nueva versión de `baqueano-ai`.

**Pendiente heredado en `baqueano-ai/index.ts`:** el archivo ya tenía 8 errores de tipos en `deno check` (llamadas a `logExchange` y `rpc`). La llamada nueva repite el mismo patrón. No impide desplegar.

## Publicación
1. Correr el SQL de eventos en el SQL Editor de Supabase. Después correr la prueba; debe dar 15/15.
2. Desplegar `baqueano-events` (`index.ts`, `helpers.ts`, `deno.json`, `../_shared/staff-revocation.ts`).
3. Desplegar la versión nueva de `baqueano-ai` (con `events-answer.ts`).
4. Desde el Ops Center: crear un evento real con su fuente oficial, subir la foto y publicarlo. Debería aparecer en el index.

## Reversión
El código se revierte con `git revert`. La base:
```sql
begin;
drop function if exists public.public_event(text);
drop function if exists public.public_events(text, text, text, date, date, integer, integer);
drop function if exists public.event_time_state(public.events, timestamptz);
drop trigger if exists events_guard on public.events;
drop function if exists public.events_guard();
-- Columnas, eventos e historial se conservan (no se borran datos).
commit;
```
