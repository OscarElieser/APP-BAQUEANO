# ============================================================================
# 🧭 BAQUEANO ECOSYSTEM — MODELO DE DATOS ESPACIALES (SPATIAL DATA MODEL)
# ============================================================================

## 1. Entidades Espaciales Base

### 1.1 Coordenada Espacial (`SpatialCoordinateRecord`)
- `latitude`: Número finito entre -90 y 90 (precisión de 6 decimales para resolución submétrica).
- `longitude`: Número finito entre -180 y 180.
- `geohash`: Código de indexación espacial para consultas de proximidad rápidas.
- `countryId`: Código ISO (ej. `NI`).
- `territoryId`: Identificador del departamento o región autónoma.
- `qualityStatus`: Estado de calidad (`VALID`, `SUSPECT`, `INVALID`, `UNKNOWN`).
- `confidence`: Nivel de exactitud (`exact`, `approximate`, `territory-only`, `unknown`).
- `provenance`: Origen del dato (`manual`, `geocoded`, `field_verified`, `partner`, `official`).
- `isSensitive`: Booleano que indica si requiere generalización por motivos de privacidad.

---

### 1.2 Polígono de Isócrona (`IsochronePolygonRecord`)
- `origin`: Coordenada geográfica del punto de partida.
- `originName`: Nombre legible del lugar de origen.
- `travelMode`: Modo de transporte (`driving`, `walking`, `cycling`, `multimodal`).
- `timeLimitMinutes`: Envolvente de tiempo (`15`, `30`, `45`, `60`).
- `coordinates`: Anillo exterior GeoJSON `[lng, lat][]`.
- `boundingBox`: Caja delimitadora `[minLat, maxLat, minLng, maxLng]`.
- `reachableDestinationsCount`: Número de atractivos alcanzables en el tiempo límite.
- `isEstimated`: `true`.

---

### 1.3 Corredor Turístico (`TourismCorridorRecord`)
- `corridorId`: Identificador único inmutable.
- `slug`: Identificador URL amigable.
- `name`: Nombre descriptivo oficial.
- `theme`: Temática biocultural (`VOLCANOES`, `COFFEE`, `CRAFTS`, `CARIBBEAN`, `HERITAGE`, `COMMUNITY`).
- `territories`: Lista de departamentos y regiones conectadas.
- `stops`: Arreglo ordenado de nodos (`placeId`, `name`, `territory`, `role`, `coordinates`).
- `totalDistanceKm`: Distancia vial total acumulada.
- `suggestedDurationDays`: Tiempo sugerido para recorrido responsable.
- `sustainabilityRating`: Calificación de impacto y sostenibilidad (0-100).
- `status`: Ciclo de vida (`DRAFT`, `UNDER_REVIEW`, `PUBLISHED`, `ARCHIVED`).
- `culturalHighlights`: Lista de elementos de patrimonio tangible e intangible.
