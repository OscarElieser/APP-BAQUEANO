// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SPATIAL AI TOOLS REGISTRY (GIS TOOLSET)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Expone herramientas GIS estructuradas y deterministas consumibles por Baqueano AI
//   y los Agentes de Concierge Digital (Fase 15).
// - Asegura el cumplimiento irrestricto del Principio de Fuente de Verdad Espacial:
//   "La IA describe y coordina; el motor GIS calcula".
// - Erradica totalmente cualquier alucinación de coordenadas, distancias o tiempos de viaje
//   por parte de LLMs, garantizando respuestas hiper-precisas y verificadas.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Valida estrictamente los parámetros de entrada antes de ejecutar cálculos espaciales.
// - Conecta con `spatial-engine.service.ts` y `routing-engine.service.ts`.
// - Retorna resultados estructurados con metadatos de ejecución (`executionTimeMs`),
//   indicador de estimación y descargos de responsabilidad oficial.
// - Protege datos sensibles mediante generalización de coordenadas cuando aplique.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - findNearbyPlacesTool(): Localiza destinos, negocios o servicios en un radio definido.
// - getTravelTimeTool(): Calcula distancia vial y tiempo de viaje real entre dos puntos.
// - calculateIsochroneTool(): Determina qué lugares son alcanzables en 15, 30, 45 o 60 min.
// - findPlacesAlongRouteTool(): Descubre paradas culturales y miradores a lo largo de un trayecto.
// - getTerritoryForPointTool(): Valida soberanía territorial y departamento para una coordenada.
// - compareRoutesTool(): Compara alternativas (óptima vs escénica vs baja presión).
// ============================================================================

import type {
  GeoPointLike,
  PlaceRecord,
  TransportMode,
  GisToolExecutionResult,
  IsochronePolygonRecord,
  SpatialRouteRecord
} from "@baqueano/types";
import { findNearbyPlaces, calculateHaversineDistanceKm, validateCoordinates } from "./spatial-engine.service";
import { calculateRouteMatrix, generateIsochronePolygon, buildRouteAlternatives } from "./routing-engine.service";

/**
 * Herramienta GIS 1: Búsqueda de recursos cercanos con ordenamiento por proximidad.
 */
export function findNearbyPlacesTool(
  origin: GeoPointLike,
  places: readonly PlaceRecord[],
  radiusKm = 15,
  categoryFilter?: string
): GisToolExecutionResult<readonly (PlaceRecord & { readonly distanceKm: number; readonly estimatedMinutes: number })[]> {
  const start = Date.now();
  const results = findNearbyPlaces(origin, places, radiusKm, categoryFilter);

  return {
    toolName: "findNearbyPlacesTool",
    executionTimeMs: Date.now() - start,
    success: true,
    isCached: false,
    data: results,
    disclaimer: "Distancias calculadas geodésicamente; tiempos estimados según velocidad de red vial."
  };
}

/**
 * Herramienta GIS 2: Cálculo determinista de matriz de viaje y distancia por carretera.
 */
export function getTravelTimeTool(
  origin: GeoPointLike,
  destination: GeoPointLike,
  mode: TransportMode = "driving"
): GisToolExecutionResult<{
  readonly roadDistanceKm: number;
  readonly durationMinutes: number;
  readonly straightLineDistanceKm: number;
  readonly mode: TransportMode;
  readonly speedKmh: number;
}> {
  const start = Date.now();
  const matrix = calculateRouteMatrix(origin, destination, mode);

  return {
    toolName: "getTravelTimeTool",
    executionTimeMs: Date.now() - start,
    success: true,
    isCached: false,
    data: {
      ...matrix,
      mode
    },
    disclaimer: "Tiempos estimados bajo condiciones viales normales en Nicaragua."
  };
}

/**
 * Herramienta GIS 3: Cálculo de envolvente de viaje / Isócrona de alcance temporal.
 */
export function calculateIsochroneTool(
  origin: GeoPointLike,
  originName: string,
  timeLimitMinutes: 15 | 30 | 45 | 60,
  travelMode: TransportMode = "driving",
  availablePlaces: readonly PlaceRecord[] = []
): GisToolExecutionResult<IsochronePolygonRecord> {
  const start = Date.now();
  const polygon = generateIsochronePolygon(origin, originName, timeLimitMinutes, travelMode, availablePlaces);

  return {
    toolName: "calculateIsochroneTool",
    executionTimeMs: Date.now() - start,
    success: true,
    isCached: false,
    data: polygon,
    disclaimer: "Polígono de isócrona aproximado mediante modelado de red vial multi-direccional."
  };
}

/**
 * Herramienta GIS 4: Búsqueda de atractivos turísticos y servicios a lo largo de un corredor vial.
 */
export function findPlacesAlongRouteTool(
  origin: GeoPointLike,
  destination: GeoPointLike,
  places: readonly PlaceRecord[],
  maxDetourDistanceKm = 8
): GisToolExecutionResult<readonly (PlaceRecord & { readonly detourKm: number })[]> {
  const start = Date.now();
  const totalRouteDistance = calculateHaversineDistanceKm(origin, destination);

  const placesAlongRoute = places
    .filter((place) => place.latitude !== 0 && place.longitude !== 0)
    .map((place) => {
      const placeCoord = { latitude: place.latitude, longitude: place.longitude };
      const distFromOrigin = calculateHaversineDistanceKm(origin, placeCoord);
      const distToDestination = calculateHaversineDistanceKm(placeCoord, destination);

      // Desvío adicional respecto a la ruta directa
      const detourKm = Math.max(0, distFromOrigin + distToDestination - totalRouteDistance);

      return {
        ...place,
        detourKm: Math.round(detourKm * 10) / 10
      };
    })
    .filter((p) => p.detourKm <= maxDetourDistanceKm)
    .sort((a, b) => a.detourKm - b.detourKm);

  return {
    toolName: "findPlacesAlongRouteTool",
    executionTimeMs: Date.now() - start,
    success: true,
    isCached: false,
    data: placesAlongRoute,
    disclaimer: "Recursos identificados dentro del corredor de desvío vial permisible."
  };
}

/**
 * Herramienta GIS 5: Validación territorial y auditoría de coordenadas geográficas.
 */
export function getTerritoryForPointTool(
  coordinates: GeoPointLike,
  countryId = "NI"
): GisToolExecutionResult<{
  readonly isValid: boolean;
  readonly qualityStatus: string;
  readonly countryId: string;
  readonly coordinates: GeoPointLike;
}> {
  const start = Date.now();
  const validation = validateCoordinates(coordinates.latitude, coordinates.longitude, countryId);

  return {
    toolName: "getTerritoryForPointTool",
    executionTimeMs: Date.now() - start,
    success: validation.isValid,
    isCached: false,
    data: {
      isValid: validation.isValid,
      qualityStatus: validation.qualityStatus,
      countryId,
      coordinates
    },
    error: validation.errorReason || null,
    disclaimer: "Validación de límites soberanos y rangos geográficos oficiales."
  };
}

/**
 * Herramienta GIS 6: Comparador multicriterio de alternativas de rutas.
 */
export function compareRoutesTool(
  origin: { readonly name: string; readonly coordinates: GeoPointLike },
  destination: { readonly name: string; readonly coordinates: GeoPointLike },
  intermediateStops: readonly { readonly id: string; readonly name: string; readonly coordinates: GeoPointLike; readonly order: number }[] = []
): GisToolExecutionResult<readonly SpatialRouteRecord[]> {
  const start = Date.now();
  const routes = buildRouteAlternatives(origin, destination, intermediateStops);

  return {
    toolName: "compareRoutesTool",
    executionTimeMs: Date.now() - start,
    success: true,
    isCached: false,
    data: routes,
    disclaimer: "Comparación de rutas balanceando velocidad, valor escénico y sostenibilidad comunitaria."
  };
}
