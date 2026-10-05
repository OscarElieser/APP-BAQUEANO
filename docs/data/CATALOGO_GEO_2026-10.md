# Catálogo de playas, ríos, islas y cascadas de Nicaragua — octubre 2026

> 🎯 **POR QUÉ:** trazabilidad del catálogo geográfico que el propietario entregó el 2026-10-05 (32 puntos con coordenadas y fuente; sin precios ni teléfonos).
> ⚙️ **CÓMO:** cargado en `website/js/territories-data.js` con `tools/data/apply-geo-catalog-2026-10.mjs`. El departamento de cada punto se confirmó con el contorno oficial (geoBoundaries ADM1).
> 📦 **QUÉ:** tabla con categoría, nombre, departamento, zona, coordenadas, precisión, fuente y ficha existente que completa.

Reglas del catálogo:
- Latitud y longitud son números decimales (en Supabase: `double precision`).
- La precisión `approximate` corresponde al centro de referencia de una isla o un río, o a una coordenada por confirmar en campo. El mapa la muestra como "ubicación aproximada".
- El check azul depende de `verification_status = verified`, no de tener coordenadas.

Ajustes por contorno oficial:
- **Río Tipitapa:** el punto cae en Granada.
- **Río Estelí:** el punto cae en Madriz.
- **Playa Jiquilillo y Río Coco:** los puntos quedan sobre la línea de costa o la frontera fluvial; conservan su departamento declarado.

| Categoría | Nombre | Departamento | Zona | Lat | Lng | Precisión | Fuente | Completa ficha existente |
|---|---|---|---|---|---|---|---|---|
| playa | Playa San Juan del Sur | rivas | San Juan del Sur | 11.2548 | -85.8729 | exact | [Visit Nicaragua / Mapcarta-OSM](https://visitanicaragua.com/en/beaches/San-Juan-del-Sur-beach/) |  |
| playa | Playa Maderas | rivas | San Juan del Sur | 11.295 | -85.91 | exact | [Visit Nicaragua / OpenStreetMap](https://www.visitanicaragua.com/playas/playa-maderas/) |  |
| playa | Playa Remanso | rivas | San Juan del Sur | 11.22249 | -85.84622 | exact | [Mapa Nacional de Turismo / OpenStreetMap](https://www.mapanicaragua.com/municipio-de-san-juan-del-sur/) |  |
| playa | Playa El Coco | rivas | San Juan del Sur | 11.1559 | -85.7998 | exact | [Mapa Nacional de Turismo](https://www.mapanicaragua.com/sol-y-playa/) |  |
| playa | Popoyo y Guasacate | rivas | Tola | 11.473 | -86.1279 | exact | [Mapa Nacional de Turismo / OpenStreetMap](https://www.mapanicaragua.com/sol-y-playa/) |  |
| playa | Playa Gigante | rivas | Tola | 11.3911 | -86.0326 | exact | [Mapa Nacional de Turismo / Wikidata-OSM](https://www.mapanicaragua.com/videos/) |  |
| playa | Playa Las Peñitas | leon | León | 12.3614 | -87.0215 | exact | [Mapa Nacional de Turismo / GeoNames](https://www.mapanicaragua.com/sol-y-playa/) |  |
| playa | Playa Poneloya | leon | León | 12.3783 | -87.0422 | exact | [Mapa Nacional de Turismo / GeoNames](https://www.mapanicaragua.com/videos/) |  |
| playa | Playa Pochomil | managua | San Rafael del Sur | 11.77244 | -86.50435 | exact | [Mapa Nacional de Turismo / GeoNames](https://www.mapanicaragua.com/sol-y-playa/) |  |
| playa | Playa Masachapa | managua | San Rafael del Sur | 11.78467 | -86.51594 | exact | [Mapa Nacional de Turismo / GeoNames](https://www.mapanicaragua.com/sol-y-playa/) |  |
| playa | La Boquita | carazo | Diriamba | 11.67825 | -86.38236 | exact | [Visit Nicaragua / GeoNames](https://www.visitanicaragua.com/atractivos/playas/) | La Boquita |
| playa | Playa Jiquilillo | chinandega | El Viejo | 12.736 | -87.451 | exact | [Mapa Nacional de Turismo](https://www.mapanicaragua.com/sol-y-playa/) |  |
| rio | Río San Juan | rio-san-juan | San Carlos / El Castillo / San Juan de Nicaragua | 11.119218 | -84.778118 | approximate | [Mapa Nacional de Turismo / Wikidata](https://www.mapanicaragua.com/rio-san-juan/) |  |
| rio | Río Coco o Wangki | raccn | Waspam y zona fronteriza | 14.99751 | -83.13809 | approximate | [GeoNames / Wikidata](https://mapcarta.com/es/19586360) | Río Coco / Wangki |
| rio | Río Grande de Matagalpa | raccs | Cuenca del Río Grande | 12.90905 | -83.51531 | approximate | [GeoNames / OpenStreetMap](https://mapcarta.com/es/19583878) |  |
| rio | Río Escondido | raccs | Bluefields / El Rama | 12.08677 | -83.74916 | approximate | [GeoNames / Mapcarta](https://mapcarta.com/es/19584100) |  |
| rio | Río Tuma | matagalpa | El Tuma-La Dalia | 13.1025 | -85.74323 | exact | [OpenStreetMap](https://mapcarta.com/es/N5135651522) |  |
| rio | Río Tipitapa | managua | Tipitapa | 12.08333 | -85.88333 | approximate | [GeoNames / Wikidata](https://mapcarta.com/es/19577744) |  |
| rio | Río Estelí | esteli | Cuenca Estelí-Telpaneca | 13.49602 | -86.26757 | approximate | [GeoNames](https://mapcarta.com/es/19584058) |  |
| isla | Isla de Ometepe | rivas | Altagracia / Moyogalpa | 11.491051 | -85.554472 | approximate | [Visit Nicaragua / GeoNames](https://www.visitanicaragua.com/islas/isla-de-ometepe/) | Reserva de Biosfera Isla de Ometepe |
| isla | Great Corn Island | raccs | Corn Island | 12.1664 | -83.0514 | approximate | [Visit Nicaragua / GeoNames](https://www.visitanicaragua.com/islas/great-corn-island/) | Corn Island & Little Corn Island |
| isla | Little Corn Island | raccs | Corn Island | 12.2884 | -82.9812 | approximate | [Visit Nicaragua / GeoNames](https://www.visitanicaragua.com/atractivos/islas/) | Little Corn Island y Otto Beach |
| isla | Isletas de Granada | granada | Granada | 11.89911 | -85.88519 | approximate | [Visit Nicaragua / GeoNames](https://www.visitanicaragua.com/atractivos/islas/) | Isletas de Granada |
| isla | Archipiélago de Solentiname | rio-san-juan | San Carlos | 11.17283 | -84.99081 | approximate | [Visit Nicaragua / GeoNames](https://www.visitanicaragua.com/atractivos/islas/) | Archipiélago de Solentiname |
| isla | Isla Juan Venado | leon | León | 12.31306 | -86.94889 | approximate | [Wikidata / Mapa Nacional de Turismo](https://www.mapanicaragua.com/sol-y-playa/) | Isla Juan Venado |
| isla | Isla Zapatera | granada | Granada | 11.739 | -85.835 | approximate | [MARENA / GeoNames](https://www.marena.gob.ni/wp-content/uploads/2023/08/11-Plan-de-Manejo-Parque-Nacional-Archipielago-Zapatera.pdf) |  |
| cascada | Cascada de San Ramón | rivas | Altagracia, Isla de Ometepe | 11.43424 | -85.51924 | exact | [Visit Nicaragua / OpenStreetMap](https://www.visitanicaragua.com/islas/isla-de-ometepe/) | Cascada de San Ramón |
| cascada | Cascada La Luna (El Tuma-La Dalia) | matagalpa | El Tuma-La Dalia | 13.11685 | -85.75101 | exact | [OpenStreetMap / Mapa Nacional de Turismo](https://mapcarta.com/es/N5607799821) |  |
| cascada | Cascada Blanca (Río Yasica) | matagalpa | San Ramón / Santa Emilia | 12.99124 | -85.82931 | exact | [OpenStreetMap / UCC](https://mapcarta.com/es/N4904807522) |  |
| cascada | Cascada La Bujona | jinotega | Jinotega | 13.08037 | -85.87418 | exact | [OpenStreetMap](https://mapcarta.com/es/N6907277586) |  |
| cascada | Cascadas Chocoyero y El Brujo | managua | Ticuantepe | 11.99 | -86.25 | approximate | [Mapa Nacional de Turismo / KBA](https://www.mapanicaragua.com/reserva-natural-chocoyero-el-brujo/) | Reserva Natural Chocoyero–El Brujo |
| cascada | Salto de La Estanzuela | esteli | Estelí | 13.025 | -86.39 | approximate | [Mapa Nacional de Turismo / referencia geográfica secundaria](https://www.mapanicaragua.com/category/atractivos-turisticos/) |  |
