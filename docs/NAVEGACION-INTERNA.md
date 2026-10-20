# BAQUEANO — Navegación interna «Cómo llegar»

**Rama:** `feat/navegacion-interna` · **Fecha:** 20-10-2026 · **Estado:** lista para revisión; no se publica sin autorización del propietario.

## Qué resuelve

Al tocar «Cómo llegar», la persona ya no sale a Google Maps. Se abre el centro de navegación de BAQUEANO, sobre la misma página:

- **Mapa interactivo:** Leaflet con OpenStreetMap, el mismo que ya usaban `mapa.html` y Mi viaje.
- **Ruta real por carretera:** distancia, tiempo estimado, hora aproximada de llegada, indicaciones paso a paso y rutas alternativas.
- **Modos:** auto, moto, a pie y bici. Bus está desactivado y explicado, porque en Nicaragua no hay horarios de transporte público en línea.
- **Origen:** la ubicación del navegador (solo al tocar «Usar mi ubicación») o un lugar escrito a mano, buscado solo dentro de Nicaragua.
- **«Iniciar navegación»:**
  - Sigue la posición con GPS y la muestra en el mapa.
  - Indica el próximo paso y la distancia restante.
  - Avisa si la persona se sale de la ruta (la tolerancia depende de la precisión del GPS) y ofrece «Recalcular ruta».
  - Puede leer las indicaciones en voz alta (opcional) y mantiene la pantalla encendida si el navegador lo permite.
  - «Finalizar recorrido» libera el GPS.
- **Varias paradas:** «Ver la ruta por carretera» en Mi viaje y en el mapa de BAQUI (hasta 18 paradas).
- **Escritorio:** mapa grande con panel lateral.
- **Teléfono:** mapa a pantalla completa con panel inferior plegable, y el próximo paso siempre arriba del panel.
- **Idioma:** los 8 idiomas. Al cambiar de idioma con una ruta abierta, se piden las indicaciones en el idioma nuevo sin recargar la página.
- **Botón Atrás del navegador:** cierra el mapa y vuelve a la ficha. La dirección queda siempre en baqueanonicaragua.com (`#como-llegar`).

## Reglas que respeta

- **No inventa rutas.**
  - Sin coordenadas verificadas, muestra un aviso y no traza nada.
  - Si la coordenada es el «área general» de un lugar (centro de un lago o reserva, enlaces `?q=`), muestra el lugar en el mapa y aclara que el acceso está por confirmar. No traza ruta hasta un punto que no es la entrada.
- **Privacidad.**
  - La ubicación solo se pide al tocar el botón. No se guarda ni se envía a Supabase.
  - Solo viaja al servidor de rutas para calcular el trayecto.
  - La analítica registra «directions_click» sin coordenadas, como antes.
- **SOS no cambia.** Los enlaces de ubicación del centro de auxilio siguen abriendo el mapa externo, porque sirven para compartir la posición en una emergencia.
- **Sin JavaScript,** los enlaces siguen funcionando como antes. No se borró ningún enlace ni dato.

## Archivos

| Archivo | Cambio |
|---|---|
| `website/js/bq-navigator.js` | **Nuevo.** Componente de navegación. Intercepta los enlaces que iban a Google Maps (`/maps/dir/?destination=`, `?q=`, `/search/?query=`) y los botones `[data-bq-route]`. |
| `website/css/bq-navigator.css` | **Nuevo.** Diseño con los colores oficiales, contraste AA, botones de 44–48 px y áreas seguras del teléfono. |
| `website/js/global-injector.js` | Carga el componente y su hoja de estilos en las páginas públicas (no en el Ops Center). |
| `website/_headers` | CSP `connect-src`: agrega `https://valhalla1.openstreetmap.de` (servidor de rutas). |
| `website/js/allies-directory.js` | Ficha de Aliados: botón «Cómo llegar» con las coordenadas del negocio. |
| `website/js/mi-viaje-interactions.js` | «Ver en mapa» de cada parada abre la navegación interna (antes: `window.open` a Google). |
| `website/js/destinos-gastronomia.js` | Igual que Mi viaje. El archivo no se carga hoy en ninguna página; se dejó coherente. |
| `website/baqueano-ia.html` | El botón del mapa de BAQUI tenía una etiqueta rota («ai Map Recenter Btn»); ahora es «Centrar el mapa en la ruta», en 8 idiomas. |
| `website/locales/*.json`, `assets/i18n/*.json` | 62 claves `routeNav.*` en 8 idiomas. |
| `aliados.html`, `mi-viaje.html` | Versiones de los scripts. |

**Enlaces cubiertos automáticamente.** No hizo falta tocar estos archivos: sus enlaces de «Cómo llegar» a Google Maps ahora abren la navegación interna:

- `mapa.html` (popups del mapa)
- `js/index-features.js`
- `js/baqueano-map.js`
- `js/mapa-atlas.js`
- `js/destinos-verified.js`
- `js/madriz-territory-map.js` (punto exacto: ruta; área general: solo vista con aviso)
- `js/services/places-service.js`

**Sin cambio:**
- `js/lodging-showcase.js`: enlaces cortos `maps.app.goo.gl`, sin coordenadas. Se pueden convertir cuando el hospedaje tenga coordenadas verificadas.
- `js/baqueano-pdf.js`: enlace impreso en el PDF del itinerario.
- Los enlaces SOS.

## Pruebas realizadas (20-10-2026, navegador real con Playwright)

1. **Usuario en Managua, GPS simulado → Catedral de León:** 93 km, 1 h 43 min, 22 pasos, 2 rutas alternativas. La dirección quedó en el sitio (`destinos.html#como-llegar`) y se abrieron 0 ventanas nuevas.
2. **GPS denegado:** muestra el aviso y permite escribir el origen.
3. **Origen escrito («Rivas») → negocio de Aliados:** 108 km, 2 h 9 min.
4. **Cambio de modo:** a pie, 82 km y 16 h 50 min; bus desactivado y explicado.
5. **Varias rutas seguidas** (León y luego Laguna de Apoyo): título y ruta correctos.
6. **Iniciar y detener el seguimiento:** próximo paso («En 2,5 km: Siga por la derecha…»), distancia restante, aviso de señal débil que se corrige solo, y detención.
7. **Cambio de idioma con la ruta abierta:** etiquetas e indicaciones en inglés sin recargar.
8. **Celular (390 px):** panel inferior plegable, mapa encima y botones táctiles.
9. **iPhone:** no se probó en un aparato físico. Se usa la API estándar de geolocalización de Safari; falta una prueba manual.
10. **Lugar sin coordenadas:** aviso, sin ruta y sin selector de origen.
11. **Sin conexión:** mensaje «Sin conexión: no se puede calcular la ruta ahora».
12. **Volver a la ficha con Atrás:** cierra el mapa y la dirección vuelve a la de inicio.
13. **Mi viaje con 3 paradas:** 252 km, 4 h 49 min, 50 pasos.
14. **Accesibilidad:** axe WCAG 2.2 AA del navegador abierto, en escritorio y en celular: 0 violaciones. Contraste en Modo Sol: 0.
15. **Checks del proyecto:** i18n, glosario, auditoría i18n, export a la app, territorios, build, SEO, production-audit, browser QA de las 32 páginas × 16 anchos y flutter test.

## Limitaciones honestas

- **Servidor de rutas.** Valhalla de FOSSGIS (comunidad OpenStreetMap) es gratuito para uso moderado y no tiene garantía de servicio. Con mucho tráfico, conviene pasar a Google Routes o a un servidor propio.
- **Calidad de los datos.** Los tiempos y caminos rurales dependen de OpenStreetMap. Se avisa que son estimados.
- **Indicaciones en chino.** Valhalla no las tiene, así que se muestran en inglés con aviso.
- **Seguimiento.** Es un seguimiento web, no navegación profesional giro a giro: no funciona con la pantalla apagada ni en segundo plano.

## Para pasar a Google Maps (cuando exista la clave)

Hoy ninguna clave del proyecto puede usar la Routes API. Lo comprobé el 20-10-2026:
- La clave web de Firebase responde `API_KEY_SERVICE_BLOCKED`.
- En el proyecto 935908985330 la Routes API está desactivada.

Pasos del propietario:
1. Activar la facturación.
2. Habilitar **Maps JavaScript API** y **Routes API**.
3. Crear una clave de navegador restringida a `https://baqueanonicaragua.com/*` y `https://www.baqueanonicaragua.com/*`, limitada a esas dos API.
4. Crear un **Map ID** (JavaScript, vectorial).
5. Poner un presupuesto con alertas.

Con la clave y el Map ID, en `bq-navigator.js` se agrega un proveedor «google» junto al de Valhalla:
- `Route.computeRoutes()`, `createPolylines()` y `createWaypointAdvancedMarkers()` de la Routes Library.
- Leaflet se reemplaza por `google.maps.Map` solo dentro del navegador interno.
- En `_headers` se agrega `https://routes.googleapis.com` a `connect-src`.

La interfaz, los textos, las pruebas y la integración con los botones no cambian.
