# ============================================================================
# 🧭 BAQUEANO ECOSYSTEM — REGISTRO DE HERRAMIENTAS GIS (AI TOOL REGISTRY)
# ============================================================================

## 1. Herramientas Espaciales Disponibles para Baqueano AI

| Nombre de la Herramienta | Proveedor / Motor | Parámetros de Entrada | Salida Estructurada | Costo API |
| :--- | :--- | :--- | :--- | :--- |
| `findNearbyPlacesTool` | `spatial-engine.service.ts` | `origin: GeoPointLike`, `radiusKm: number`, `category?: string` | Lista de destinos ordenados por km y minutos | $0 (Local) |
| `getTravelTimeTool` | `routing-engine.service.ts` | `origin: GeoPointLike`, `destination: GeoPointLike`, `mode: TransportMode` | Distancia vial, duración, velocidad promedio | $0 (Local) |
| `calculateIsochroneTool` | `routing-engine.service.ts` | `origin: GeoPointLike`, `timeLimitMinutes: 15\|30\|45\|60`, `mode` | Polígono GeoJSON 16 vértices + destinos | $0 (Local) |
| `findPlacesAlongRouteTool` | `spatial-tools.service.ts` | `origin`, `destination`, `maxDetourDistanceKm` | Paradas intermedias y miradores en el corredor | $0 (Local) |
| `getTerritoryForPointTool` | `spatial-engine.service.ts` | `coordinates: GeoPointLike`, `countryId: string` | Validación soberana y departamento oficial | $0 (Local) |
| `compareRoutesTool` | `routing-engine.service.ts` | `origin`, `destination`, `intermediateStops` | Alternativas (Óptima, Escénica, Sostenible) | $0 (Local) |

---

## 2. Invariante de Salida para Modelos de Lenguaje

Cualquier invocación de estas herramientas devuelve un objeto `GisToolExecutionResult<T>` que incluye:
- `executionTimeMs`: Tiempo de cómputo en milisegundos.
- `success`: Booleano de éxito.
- `data`: Datos estructurados validados por Zod.
- `disclaimer`: Advertencia explicativa sobre el carácter estimado del enrutamiento.
