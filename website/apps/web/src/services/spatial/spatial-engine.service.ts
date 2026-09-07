// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SPATIAL ENGINE SERVICE (GIS CORE)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Provee el motor determinista de análisis geoespacial para la plataforma BAQUEANO.
// - Transforma las coordenadas brutas en inteligencia territorial, garantizando que
//   los exploradores y anfitriones cuenten con validaciones geográficas rigurosas,
//   detección de anomalías de ubicación y métricas de accesibilidad sin sesgos.
// - Evita que modelos de lenguaje o interfaces cliente inventen o alucinen distancias,
//   ubicaciones o análisis de cobertura espacial.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Implementa algoritmos esféricos basados en la fórmula de Haversine bajo datum WGS84 (EPSG:4326).
// - Ejecuta validaciones de límites territoriales oficiales de Nicaragua (lat: 10.5 a 15.1, lng: -87.8 a -82.5).
// - Clasifica la calidad de coordenadas con estados deterministas (VALID, SUSPECT, INVALID, UNKNOWN).
// - Aplica reglas defensivas: NUNCA auto-corrige silenciosamente coordenadas erróneas, sino que emite alertas auditables.
// - Realiza análisis de brecha de servicios de emergencia (salud, policía, bomberos, cruz roja) sin estigmatizar comunidades rurales.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - validateCoordinates(): Audita puntos geográficos contra límites soberanos y rangos válidos.
// - calculateHaversineDistanceKm(): Calcula distancia ortodrómica exacta entre dos pares de coordenadas.
// - isPointInsideBoundingBox(): Determina si un punto reside dentro de un polígono delimitador.
// - findNearbyPlaces(): Filtra y ordena recursos dentro de un radio espacial predefinido.
// - evaluateTerritoryAccessibility(): Calcula el índice de accesibilidad territorial multidimensional.
// - detectServiceGaps(): Identifica destinos turísticos con lejanía a servicios esenciales para planificación.
// ============================================================================

import type {
  GeoPointLike,
  GeoBoundingBox,
  GeoQualityStatus,
  LocationConfidence,
  TerritorialAccessibilityRecord,
  ServiceGapAnalysisRecord,
  PlaceRecord,
  AccessibilityLevel
} from "@baqueano/types";
import { NICARAGUA_TERRITORY_BOUNDS, GIS_THRESHOLDS_CONFIG } from "@baqueano/config";

const EARTH_RADIUS_KM = 6371.0;

/**
 * Valida si un par de coordenadas cumple los rangos globales de latitud/longitud
 * y los límites geográficos soberanos de Nicaragua cuando countryId sea 'NI'.
 */
export function validateCoordinates(
  lat: number,
  lng: number,
  countryId = "NI",
  _expectedTerritory?: string
): {
  readonly isValid: boolean;
  readonly qualityStatus: GeoQualityStatus;
  readonly confidence: LocationConfidence;
  readonly errorReason?: string;
} {
  // 1. Verificación de números finitos y rangos globales
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return {
      isValid: false,
      qualityStatus: "INVALID",
      confidence: "unknown",
      errorReason: "Coordenadas no numéricas o infinitas detectadas."
    };
  }

  if (lat === 0 && lng === 0) {
    return {
      isValid: false,
      qualityStatus: "INVALID",
      confidence: "unknown",
      errorReason: "Coordenadas nulas (0,0) detectadas (Null Island)."
    };
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return {
      isValid: false,
      qualityStatus: "INVALID",
      confidence: "unknown",
      errorReason: "Coordenadas fuera del rango esférico global (-90..90, -180..180)."
    };
  }

  // 2. Verificación de límites de Nicaragua para recursos soberanos
  if (countryId.toUpperCase() === "NI") {
    const isInsideNicaragua =
      lat >= NICARAGUA_TERRITORY_BOUNDS.minLat &&
      lat <= NICARAGUA_TERRITORY_BOUNDS.maxLat &&
      lng >= NICARAGUA_TERRITORY_BOUNDS.minLng &&
      lng <= NICARAGUA_TERRITORY_BOUNDS.maxLng;

    if (!isInsideNicaragua) {
      return {
        isValid: false,
        qualityStatus: "SUSPECT",
        confidence: "unknown",
        errorReason: `Coordenadas [${lat.toFixed(4)}, ${lng.toFixed(4)}] fuera de los límites territoriales de Nicaragua.`
      };
    }
  }

  return {
    isValid: true,
    qualityStatus: "VALID",
    confidence: "exact"
  };
}

/**
 * Calcula la distancia en línea recta (ortodrómica) en kilómetros usando la fórmula de Haversine.
 */
export function calculateHaversineDistanceKm(pointA: GeoPointLike, pointB: GeoPointLike): number {
  const dLat = ((pointB.latitude - pointA.latitude) * Math.PI) / 180.0;
  const dLng = ((pointB.longitude - pointA.longitude) * Math.PI) / 180.0;

  const lat1Rad = (pointA.latitude * Math.PI) / 180.0;
  const lat2Rad = (pointB.latitude * Math.PI) / 180.0;

  const a =
    Math.sin(dLat / 2.0) * Math.sin(dLat / 2.0) +
    Math.sin(dLng / 2.0) * Math.sin(dLng / 2.0) * Math.cos(lat1Rad) * Math.cos(lat2Rad);

  const c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
  const distanceKm = EARTH_RADIUS_KM * c;

  return Math.round(distanceKm * 100) / 100;
}

/**
 * Evalúa si un punto se encuentra contenido dentro de una caja delimitadora (Bounding Box).
 */
export function isPointInsideBoundingBox(point: GeoPointLike, bbox: GeoBoundingBox): boolean {
  return (
    point.latitude >= bbox.minLat &&
    point.latitude <= bbox.maxLat &&
    point.longitude >= bbox.minLng &&
    point.longitude <= bbox.maxLng
  );
}

/**
 * Encuentra y ordena destinos o negocios cercanos a un origen dado un radio en km.
 */
export function findNearbyPlaces(
  origin: GeoPointLike,
  places: readonly PlaceRecord[],
  radiusKm: number = GIS_THRESHOLDS_CONFIG.nearbyDefaultRadiusKm,
  categoryFilter?: string
): readonly (PlaceRecord & { readonly distanceKm: number; readonly estimatedMinutes: number })[] {
  const clampedRadius = Math.min(Math.max(radiusKm, 1), GIS_THRESHOLDS_CONFIG.nearbyMaxRadiusKm);

  return places
    .filter((place) => {
      if (categoryFilter && place.categoryId !== categoryFilter && place.categoryName !== categoryFilter) {
        return false;
      }
      return place.latitude !== 0 && place.longitude !== 0;
    })
    .map((place) => {
      const distanceKm = calculateHaversineDistanceKm(origin, {
        latitude: place.latitude,
        longitude: place.longitude
      });
      // Estimación base: velocidad promedio en red secundaria de 45 km/h
      const estimatedMinutes = Math.round((distanceKm / GIS_THRESHOLDS_CONFIG.defaultDrivingSpeedKmh) * 60);
      return {
        ...place,
        distanceKm,
        estimatedMinutes
      };
    })
    .filter((item) => item.distanceKm <= clampedRadius)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Calcula el índice de accesibilidad territorial multidimensional para un departamento o región.
 */
export function evaluateTerritoryAccessibility(
  territoryId: string,
  territoryName: string,
  primaryRoadAccess: boolean,
  averageTravelTimeToCapitalMinutes: number,
  publicTransportCoverageScore: number,
  digitalConnectivityScore: number,
  emergencyServicesWithin30Min: number,
  healthCentersCount: number,
  policeStationsCount: number,
  fireStationsCount: number,
  totalTouristAttractions: number
): TerritorialAccessibilityRecord {
  // Ponderación de factores de accesibilidad territorial:
  // 1. Conectividad vial y tiempo a capital (30%)
  // 2. Transporte público local (25%)
  // 3. Cobertura de telecomunicaciones (20%)
  // 4. Servicios de emergencia próximos (25%)
  const roadScore = primaryRoadAccess
    ? Math.max(0, 100 - (averageTravelTimeToCapitalMinutes / 360) * 50)
    : 35;
  const emergencyScore = Math.min(100, emergencyServicesWithin30Min * 15);

  const weightedIndex = Math.round(
    roadScore * 0.3 +
    publicTransportCoverageScore * 0.25 +
    digitalConnectivityScore * 0.2 +
    emergencyScore * 0.25
  );

  let accessibilityLevel: AccessibilityLevel = "MODERATE";
  if (weightedIndex >= 75) {
    accessibilityLevel = "HIGH_ACCESS";
  } else if (weightedIndex < 50) {
    accessibilityLevel = "LIMITED";
  }

  return {
    territoryId,
    territoryName,
    accessibilityLevel,
    accessibilityIndex: weightedIndex,
    primaryRoadAccess,
    averageTravelTimeToCapitalMinutes,
    publicTransportCoverageScore,
    digitalConnectivityScore,
    emergencyServicesWithin30Min,
    healthCentersCount,
    policeStationsCount,
    fireStationsCount,
    totalTouristAttractions,
    lastEvaluatedAt: new Date().toISOString(),
    evaluationSource: "FIELD_VALIDATION"
  };
}

/**
 * Detecta brechas de servicios esenciales alrededor de atracciones turísticas
 * para fines estrictos de planificación y seguridad operativa.
 */
export function detectServiceGaps(
  destination: {
    readonly id: string;
    readonly name: string;
    readonly territoryId: string;
    readonly territoryName: string;
    readonly coordinates: GeoPointLike;
  },
  availableServices: readonly PlaceRecord[]
): readonly ServiceGapAnalysisRecord[] {
  const gaps: ServiceGapAnalysisRecord[] = [];
  const requiredCategories: Array<{
    category: "health" | "police" | "firefighters";
    name: string;
  }> = [
    { category: "health", name: "Centro de Salud / Hospital" },
    { category: "police", name: "Estación de Policía Nacional" },
    { category: "firefighters", name: "Cuerpo de Bomberos Unificados" }
  ];

  for (const req of requiredCategories) {
    const categoryServices = availableServices.filter(
      (s) => s.isEmergency && (s.categoryId.toLowerCase().includes(req.category) || s.categoryName.toLowerCase().includes(req.category))
    );

    if (categoryServices.length === 0) {
      gaps.push({
        gapId: `gap-${destination.id}-${req.category}`,
        territoryId: destination.territoryId,
        territoryName: destination.territoryName,
        destinationId: destination.id,
        destinationName: destination.name,
        destinationCoordinates: destination.coordinates,
        missingCategory: req.category,
        nearestServiceDistanceKm: 999,
        nearestServiceEstimatedMinutes: 999,
        nearestServiceName: "No registrado en el inventario territorial",
        severity: "HIGH",
        recommendedMitigation: "Establecer botiquín de primeros auxilios y protocolo satelital de comunicación comunitaria.",
        isPlanningOnly: true,
        detectedAt: new Date().toISOString()
      });
      continue;
    }

    const nearest = categoryServices
      .map((s) => ({
        service: s,
        distanceKm: calculateHaversineDistanceKm(destination.coordinates, {
          latitude: s.latitude,
          longitude: s.longitude
        })
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)[0];

    if (nearest && nearest.distanceKm > GIS_THRESHOLDS_CONFIG.emergencyServiceCriticalDistanceKm) {
      const estimatedMinutes = Math.round(
        (nearest.distanceKm / GIS_THRESHOLDS_CONFIG.defaultDrivingSpeedKmh) * 60
      );

      gaps.push({
        gapId: `gap-${destination.id}-${req.category}`,
        territoryId: destination.territoryId,
        territoryName: destination.territoryName,
        destinationId: destination.id,
        destinationName: destination.name,
        destinationCoordinates: destination.coordinates,
        missingCategory: req.category,
        nearestServiceDistanceKm: nearest.distanceKm,
        nearestServiceEstimatedMinutes: estimatedMinutes,
        nearestServiceName: nearest.service.name,
        severity: nearest.distanceKm > 40 ? "HIGH" : "MODERATE",
        recommendedMitigation: `Coordinación preventiva con ${nearest.service.name} a ${nearest.distanceKm} km (${estimatedMinutes} min).`,
        isPlanningOnly: true,
        detectedAt: new Date().toISOString()
      });
    }
  }

  return gaps;
}
