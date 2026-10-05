# Catálogo verificado de restaurantes, comedores y kioscos — octubre 2026

> 🎯 **POR QUÉ:** dejar la fuente íntegra entregada por el propietario (2026-10-05) junto a su aplicación en el portal.
> ⚙️ **CÓMO:** `node tools/data/apply-food-catalog-2026-10.mjs` (idempotente) escribe en `website/js/territories-data.js`. De ahí se alimentan la franja y la ficha de cada departamento, `destinos.html` (filtros Restaurantes, Comedores y Kioscos), el índice del buscador y la exportación a la App.
> 📦 **QUÉ:** 12 establecimientos: 7 con pin exacto (map-ready) y 5 con pin pendiente (`partial`, sin "Cómo llegar").

## Reglas aplicadas (del catálogo)

- `map_ready = true` únicamente con latitud y longitud verificadas.
- Dirección comprobada sin pin exacto → `verificationStatus: 'partial'`, `mapReady: false`, sin coordenadas y sin botón "Cómo llegar" (solo "buscar por dirección").
- Precio, menú, horario y reseñas son dinámicos: `priceMode: 'dynamic'` y `checkedAt: 2026-10-05`. No se publican precios ni calificaciones.
- BAQUI no inventa teléfono, precio, menú, horario ni coordenadas faltantes.
- **No se publicaron** los teléfonos marcados como "confirmar antes de publicar" (Comedor La Cucaracha) o "no publicar hasta verificación directa" (Kiosco La Gata, Kiosko Vilma).
- Kiosco La Gata: la fuente nombra a su responsable. Por coherencia con la importación INTUR (sin nombres de personas), la ficha no lo publica. Puede agregarse si el propietario lo autoriza.

## Resumen

| Tipo | Cantidad | Con pin exacto | Pendientes de pin |
|---|---:|---:|---:|
| Restaurante | 6 | 5 | 1 |
| Comedor | 4 | 2 | 2 |
| Kiosco | 2 | 0 | 2 |

## Registros

| Nombre | Tipo | Departamento / municipio | Dirección | Lat, Lng | Estado | Contacto publicado | Fuente |
|---|---|---|---|---|---|---|---|
| Cocina de Doña Haydée | Restaurante | Managua / Managua | Carretera a Masaya km 4 1/2 | 12.11872, -86.26163 (exacta, OSM) | Verificado · map-ready | +505 2270-6100 | https://mapcarta.com/N887699115 |
| Restaurante Don Cándido | Restaurante | Managua / Managua | 15 Av. Sureste | 12.12577, -86.26316 (exacta, OSM) | Verificado · map-ready | +505 2277-2485 | https://mapcarta.com/es/N1748771743 |
| Restaurante El Eskimo | Restaurante | Managua / Managua | 18 y 19 Ave. Sur Oeste | 12.14409, -86.29012 (exacta, OSM) | Verificado · map-ready | +505 2266-6313 | https://mapcarta.com/es/N887537085 |
| Restaurante Los Ranchos | Restaurante | Managua / Managua | Distrito II | 12.14443, -86.29049 (exacta, OSM) | Verificado · map-ready | +505 2266-0527 | https://mapcarta.com/es/N887536144 |
| Restaurante El Zaguán | Restaurante | Granada / Granada | Costado este de la Catedral | 11.92958, -85.95256 (exacta, OSM) | Verificado · map-ready | +505 8886-6099 | https://mapcarta.com/es/W419754191 |
| Boca Baco | Restaurante | Granada / Granada | Costado oeste de la Catedral / Av. La Sirena | pendiente | Verificado parcial · pin pendiente | +505 8810-9805 · boca.baco20@gmail.com | https://bocabaconicaragua.com/english-menu/ |
| Comedor Doña Tulita | Comedor | Granada / Granada | Calle El Hormiguero | 11.9322657, -85.9573215 (exacta) | Verificado · map-ready | +505 2552-7100 | https://ni.near-place.com/comedor-dona-tulita-w2jvw33-calle-el-hormiguero-granada/en |
| Comedor La Cucaracha | Comedor | León / León | León, Nicaragua | 12.4342008, -86.873702 (exacta) | Verificado · map-ready | — (confirmar antes de publicar) | https://ni.near-place.com/comedor-la-cucaracha-leon |
| Comedor La Parada | Comedor | Granada / Granada | Terminal de pequeños buses (Plus Code W2HW+G8V) | pendiente | Verificado parcial · pin pendiente | +505 8955-8759 | https://es.restaurantguru.com/Comedor-La-Parada-Granada-Granada |
| Comedor Martha | Comedor | Granada / Granada | Frente al parque del cementerio | pendiente | Verificado parcial · pin pendiente | +505 8477-5431 | Google Business (búsqueda) |
| Kiosco La Gata | Kiosco | Granada / Granada | Parque Central Colón | pendiente | Verificado parcial · pin pendiente | — (no publicar) | https://www.lagaceta.gob.ni/la-imponente-gran-sultana-granada-muestra-algunos-de-sus-rincones-mas-hermosos/ |
| Kiosko Vilma | Kiosco | Managua / Managua | Aeropuerto Internacional Augusto C. Sandino | pendiente | Verificado parcial · pin pendiente | — (no publicar) | https://www.bigfoothostelleon.com/service-page/from-managua-airport-to-leon-shared-shuttle-23 |

Oferta declarada por registro: en `verification.amenities` de cada lugar. Fecha de revisión de todos: 05/10/2026.

**Pendiente (Supabase):** estos 12 registros viven en el catálogo del portal. Su carga en `businesses` (con `protagonist_type`: `comedor` o `empresa_turistica`) queda pendiente, igual que el resto del catálogo (ver `docs/impact/BAQUEANO_IMPACTO.md`, riesgo 2).
