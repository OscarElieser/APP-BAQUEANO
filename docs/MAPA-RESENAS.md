# Mapa preciso, estrellas reales y ficha por lugar (20-10-2026)

Rama: `feat/mapa-resenas` (parte de `feat/navegacion-interna`). **No está publicada.**

## Las tres prioridades del propietario

### 1. Ubicación precisa
Medido en Supabase el 20-10-2026 sobre los 237 lugares publicados:

| Precisión | Lugares | Qué hace ahora el mapa |
|---|---|---|
| `exact` + `map_ready` | 21 | Pin sólido. «Cómo llegar» traza la ruta (navegador interno). |
| `approximate` | 98 | Pin punteado, «Ver la zona»: se abre el mapa **sin** trazar ruta y con un aviso. |
| `reference` | 67 | Igual que approximate. |
| `centroid` | 11 | Igual que approximate. |
| `missing` | 40 | No se dibujan, porque no hay punto. Se informa la cantidad. |

**Por qué approximate no traza ruta:** varios comparten el punto exacto de un pueblo. Por ejemplo, la Reserva Montibelli está en el punto de «Ticuantepe y El Crucero», y La Mákina en el de Diriamba. Trazar ruta ahí llevaría al turista al centro del municipio.

La regla es la misma que en `public.place_navigation` (migración del 5 de octubre, todavía sin aplicar en producción) y que en el CHECK `places_map_ready_requires_pin`.

**Otros cambios:**
- **Hospedajes del respaldo estático de `mapa.html`:**
  - Precisión alineada con Supabase: TOTOCO, Selva Negra y Yemaya pasan a `reference`.
  - Sus fotos son del territorio y ahora se rotulan así.
- **Ops Center:** un destino sin coordenadas caía en el centro de Managua (12.1364, -86.2514). Ahora queda sin punto.

### 2. Opiniones auténticas: auditoría de estrellas

| Dónde | Qué había | Origen | Ahora |
|---|---|---|---|
| `destinos.html` | 16 cifras («4.9 (1,210)»…) | Escritas a mano | `[data-bq-rating]` con datos reales o «Aún sin valoraciones» |
| `todos-los-destinos.html` | 10 cifras | Escritas a mano | Ídem |
| `index.html` | 5 cifras | Escritas a mano | Ídem |
| `gastronomia.html` | 4 «(320 reseñas)» | Escritas a mano | «Aún sin valoraciones». Los locales no existen en Supabase y comparten un mismo WhatsApp, así que no se vinculan |
| `js/baqueano-map.js`, `js/index-features.js` | `'4.9'` y `'150'` por defecto | Inventado | Solo se muestran estrellas con reseñas reales. Ninguna página carga estos archivos hoy |
| `js/tourism-catalog-expansion.js`, `js/baqueano-reels.js` | `rating` de datos semilla | Inventado | Ya no se muestra. Ninguna página carga estos archivos hoy |
| Ops Center (`ops-engine.js`) | `rating = rating \|\| 5.0` (3 lugares) | Asignaba 5 estrellas automáticamente | Eliminado. El Ops Center no escribe estrellas |
| Supabase `destinations.rating` y `reviews_count` | 7 filas con 4.88–4.98 y 275–512 opiniones | Sin respaldo (la tabla `reviews` está vacía) | No se usa. El SQL B (opcional) las respalda y las pone en nulo |
| App Android (`DestinationModel`, `PlaceModel`, `ExperienceModel`) | `?? 5.0` cuando falta | Inventado | **Pendiente de la parte Android** (no se toca en esta rama) |

**Datos semilla:** se conservan los valores en JS (`firestore-realtime.js`, `baqueano-master-catalog.js`, etc.), porque no se borra nada. Ninguna pantalla los pinta.

### 3. Seguridad (RLS)
- **Hallazgo:** la política actual `"Lectura pública de reseñas publicadas"` permitía al público leer **todas las columnas** de las reseñas publicadas, incluido el `user_uid` de Firebase del autor.
  - La prueba 1 lo demuestra: falla sin la migración.
- **Ahora:**
  - Sin acceso directo de `anon` ni de `authenticated` a `reviews`, `review_events` y `review_reports`.
  - La lectura pública pasa solo por `place_review_summaries()` y `place_reviews_public()` (SECURITY DEFINER), que devuelven solo lo publicado y sin UID.
- **Escritura:** solo la Edge Function `baqueano-place-reviews`.
  - Verifica el ID token de Firebase (RS256, emisor y audiencia `app-baqueano`).
  - Usa su `sub` como autor. **No** se usa `auth.uid()`.
- **Triggers:**
  - Autor y destino inmutables.
  - `created_at` controlado por la base.
  - Sin DELETE.
  - Historial de solo inserción.

## Un solo sistema
- Tabla `public.reviews`: existía, estaba vacía y se amplió. Una opinión por usuario y lugar; editar actualiza la misma fila.
- **Destinos:**
  - `place:<slug>` para lugares de Supabase.
  - `destination:<clave>` para las tarjetas de /destinos, vía `review_target_aliases`. Solo hay 8 equivalencias inequívocas: ometepe, isletas, miraflor, apoyo, cornisland, indiomaiz, sjds y riosanjuan.
  - Granada, León, Masaya, El Viejo, etc. no se vinculan. Cañón de Somoto y Cerro Negro no están en `places`.
- **Web:** `js/bq-reviews.js` es el mismo componente en /mapa (popup), /destinos (tarjetas), la ficha de lugar y la ficha del catálogo.
- **Ficha nueva:** `destino.html?lugar=<slug>` (`js/place-ficha.js`). «Ver destino» del mapa abre esa ficha.
  - Muestra solo los datos que existen en la base.
  - «Verificado» aparece solo con `verification_status = verified`.
  - El texto en español se marca como tal.
- **Ops Center:** pestaña 45 «Gestión de reseñas turísticas» (`js/ops-center/ops-place-reviews.js`).
  - Pendientes, con alertas, con reportes, publicadas, ocultas, rechazadas y retiradas.
  - Motivo obligatorio para rechazar u ocultar.
  - Respuesta oficial e historial.
  - No hay botón de borrar ni campo para tocar el promedio.
- **Antispam:**
  - Límites por usuario y por IP con hash.
  - Sin enlaces, correos ni teléfonos.
  - Banderas para el equipo: lenguaje, mayúsculas, texto repetido en otros lugares. Las banderas **no** rechazan solas, y una crítica no se marca por tener 1–3 estrellas.

## Pruebas (todas ejecutadas)
| Prueba | Resultado |
|---|---|
| `supabase/tests/place_reviews.test.sql` en Postgres 16 local con la estructura de producción | **16/16 OK**, 0 filas al final. Sin la migración, falla en la prueba 1 |
| Migración aplicada dos veces seguidas (idempotente) | OK |
| `deno test` de utilidades de la función (`helpers.test.ts`) | **5/5 OK** |
| `deno check` de la Edge Function | OK |
| `scripts/mapa-resenas-qa.mjs` (Chromium, servicio de reseñas simulado, escrituras a producción bloqueadas) | **29/29 OK** |
| i18n (8 idiomas, 108 claves nuevas), glosario ko/zh, auditoría i18n (JS pendientes igual que la base: 648), export app, territorios, SEO, build | OK |

**Lo que todavía no se probó de punta a punta:** el flujo con sesión real de Firebase (crear, editar y moderar) contra la función desplegada. Necesita que corras el SQL y autorices desplegar `baqueano-place-reviews`.

## Publicación controlada
1. **Supabase (SQL Editor):** correr el SQL A (`supabase/migrations/20261020120000_place_reviews.sql`). Después, `supabase/tests/place_reviews.test.sql` debe dar 16/16.
2. **Opcional, SQL B:** respaldar y poner en nulo `destinations.rating` y `reviews_count`.
3. **Desplegar la Edge Function** `baqueano-place-reviews` (`index.ts`, `helpers.ts`, `deno.json`, `../_shared/staff-revocation.ts`, `../_shared/notify.ts`; verify_jwt false).
4. **Probar con una cuenta real:** opinar, aprobar en el Ops Center y ver la opinión en /mapa, /destinos y la ficha.
5. **Merge** de `feat/navegacion-interna` y luego `feat/mapa-resenas` a `main`. Cloudflare publica.

## Reversión
El código se revierte con `git revert`. La base:
```sql
begin;
drop function if exists public.place_reviews_public(text, text, integer, integer);
drop function if exists public.place_review_summaries(text[]);
drop function if exists public.review_resolve_target(text);
drop trigger if exists reviews_guard on public.reviews;
drop function if exists public.reviews_guard();
-- Las tablas nuevas y las columnas agregadas se conservan (no se borran datos).
-- Si hay que volver al comportamiento anterior de lectura:
grant select on public.reviews to anon, authenticated;
create policy "Lectura pública de reseñas publicadas" on public.reviews for select using (status = 'published');
commit;
```
Volver a la política anterior **reabre la exposición del UID**. Solo debería hacerse si hay una emergencia.
