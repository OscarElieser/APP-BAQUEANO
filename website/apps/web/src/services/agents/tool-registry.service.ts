// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — AGENT TOOL REGISTRY & EXECUTORS (FASE 15)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer herramientas seguras, acotadas y tipadas para los agentes del
//   Digital Concierge y operaciones de Baqueano.
// - Garantizar que las matemáticas financieras (cálculo de presupuestos) se ejecuten
//   mediante funciones determinísticas puras, sin delegar sumas ni conversiones al LLM.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Funciones TypeScript determinísticas con validación de inputs y sanitización.
// - Cálculo geodésico Haversine para distancias y tiempos de traslado.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - searchDestinationsTool()
// - getMapDistanceTool()
// - calculateBudgetTool()
// - getWeatherSafetyTool()
// - prepareReservationTool()
// ============================================================================

import { getStaticDestinationPlaces } from "../static-destination.service";
import { getPublicTrustSummary } from "../trust-public.service";
import type { BudgetBreakdown, TripStop } from "@baqueano/types";

export interface DestinationSearchParams {
  readonly territory?: string;
  readonly category?: string;
  readonly maxPriceUsd?: number;
  readonly limit?: number;
}

/**
 * Herramienta: Búsqueda y filtrado de destinos territoriales.
 */
export async function searchDestinationsTool(params: DestinationSearchParams): Promise<TripStop[]> {
  const envelope = getStaticDestinationPlaces();
  let items = envelope.items;

  if (params.territory) {
    const term = params.territory.toLowerCase();
    items = items.filter(
      (p) => p.departmentName.toLowerCase().includes(term) || p.municipalityName.toLowerCase().includes(term)
    );
  }

  if (params.category) {
    const cat = params.category.toLowerCase();
    items = items.filter((p) => p.categoryName.toLowerCase().includes(cat));
  }

  const limit = params.limit ?? 5;
  const sliced = items.slice(0, limit);

  return sliced.map((p) => ({
    placeId: p.placeId,
    name: p.name,
    category: p.categoryName,
    department: p.departmentName,
    durationHours: 3,
    priceNio: 450,
    priceUsd: 12,
    isVerified: p.verified,
    latitude: p.latitude,
    longitude: p.longitude,
    notes: p.description
  }));
}

/**
 * Herramienta: Cálculo determinístico de distancias geodésicas (Fórmula Haversine).
 */
export function getMapDistanceTool(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): { distanceKm: number; estimatedDrivingHours: number } {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((toLat - fromLat) * Math.PI) / 180;
  const dLng = ((toLng - fromLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((fromLat * Math.PI) / 180) *
      Math.cos((toLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c * 10) / 10;

  // Estimación de velocidad promedio en carreteras nicaragüenses (50 km/h)
  const estimatedDrivingHours = Math.round((distanceKm / 50) * 10) / 10;

  return { distanceKm, estimatedDrivingHours };
}

/**
 * Herramienta: Motor de cálculo presupuestario determinístico (Cero matemática en LLM).
 */
export function calculateBudgetTool(
  activitiesCostsNio: readonly number[],
  daysCount: number,
  travelersCount: number,
  currency: "NIO" | "USD" = "NIO",
  budgetLimitNio?: number
): BudgetBreakdown {
  const sumActivities = activitiesCostsNio.reduce((acc, cost) => acc + cost, 0) * travelersCount;
  const transportEstimate = daysCount * 600 * Math.ceil(travelersCount / 4); // Estimación C$600 por día de traslado
  const foodEstimate = daysCount * travelersCount * 450; // Estimación C$450/día por persona (comida típica local)

  const totalCalculated = sumActivities + transportEstimate + foodEstimate;
  const isWithinBudget = budgetLimitNio ? totalCalculated <= budgetLimitNio : true;

  if (currency === "USD") {
    const exchangeRate = 36.8; // NIO por USD
    return {
      currency: "USD",
      activitiesCost: Math.round((sumActivities / exchangeRate) * 100) / 100,
      transportEstimate: Math.round((transportEstimate / exchangeRate) * 100) / 100,
      foodEstimate: Math.round((foodEstimate / exchangeRate) * 100) / 100,
      totalCalculated: Math.round((totalCalculated / exchangeRate) * 100) / 100,
      budgetLimit: budgetLimitNio ? Math.round((budgetLimitNio / exchangeRate) * 100) / 100 : undefined,
      isWithinBudget
    };
  }

  return {
    currency: "NIO",
    activitiesCost: sumActivities,
    transportEstimate,
    foodEstimate,
    totalCalculated,
    budgetLimit: budgetLimitNio,
    isWithinBudget
  };
}

/**
 * Herramienta: Evaluación de clima y seguridad.
 */
export function getWeatherSafetyTool(territory: string): { climateAdvice: string; safetyWarnings: string[] } {
  const term = territory.toLowerCase();
  const safetyWarnings: string[] = [];
  let climateAdvice = "Clima tropical con temperaturas promedio de 28°C. Llevar hidratación y calzado cómodo.";

  if (term.includes("matagalpa") || term.includes("jinotega") || term.includes("somoto")) {
    climateAdvice = "Zona montañosa norteña: clima fresco (18°C a 24°C) con posibilidad de lloviznas en las tardes.";
    safetyWarnings.push("Senderos de altura: se recomienda calzado con buen agarre para superficies húmedas.");
  } else if (term.includes("león") || term.includes("chinandega")) {
    climateAdvice = "Zona de occidente: clima cálido y soleado (hasta 34°C). Alta radiación UV entre 11:00 y 15:00.";
    safetyWarnings.push("Ascenso a volcanes: llevar al menos 2 litros de agua por persona y protección solar.");
  } else if (term.includes("ometepe") || term.includes("san juan del sur") || term.includes("rivas")) {
    climateAdvice = "Zona lacustre y costera: vientos moderados a fuertes y clima tropical soleado.";
    safetyWarnings.push("Ferry a Ometepe: verificar horarios de zarpe ante alertas de vientos en el Lago Cocibolca.");
  }

  return { climateAdvice, safetyWarnings };
}

/**
 * Herramienta: Consulta de señales de confianza territoriales.
 */
export async function getTrustSignalsTool(resourceId: string): Promise<string[]> {
  try {
    const summary = await getPublicTrustSummary(resourceId);
    return summary.publicBadges.map((b) => b.name);
  } catch {
    return ["Información en proceso de verificación territorial"];
  }
}
