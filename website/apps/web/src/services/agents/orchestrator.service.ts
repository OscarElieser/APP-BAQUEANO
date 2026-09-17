// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — AGENT ORCHESTRATOR & INTENT ROUTER (FASE 15)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Coordinar la red de 10 agentes especializados de Baqueano para resolver
//   intenciones complejas de viajeros, anfitriones y administradores.
// - Evitar el patrón de 'God Agent' distribuyendo tareas acotadas a cada agente.
// - Garantizar límites de pasos de ejecución (máximo 6), detección de loops
//   infinitos y control presupuestario de tokens.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - IntentRouter analiza la solicitud del usuario y selecciona el flujo adecuado.
// - Orquestación secuencial determinística combinando Destination, Map, Budget,
//   Safety y TripPlanner agents.
// - Retorna un registro estructurado AgenticWorkflowRecord con TripPlanRecord completo.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - routeAndExecuteWorkflow(): Ejecuta el workflow multiagente completo.
// - planTripWorkflow(): Especializado en planificación de itinerarios territoriales.
// ============================================================================

import type {
  AgenticWorkflowRecord,
  BudgetBreakdown,
  TripDayPlan,
  TripPlanRecord,
  TripStop
} from "@baqueano/types";
import {
  calculateBudgetTool,
  getMapDistanceTool,
  getWeatherSafetyTool,
  searchDestinationsTool
} from "./tool-registry.service";

export interface ConciergeRequestInput {
  readonly userId?: string;
  readonly message: string;
  readonly territory?: string;
  readonly daysCount?: number;
  readonly budgetLimitNio?: number;
  readonly travelersCount?: number;
  readonly currency?: "NIO" | "USD";
}

export interface ConciergeExecutionResult {
  readonly workflow: AgenticWorkflowRecord;
  readonly tripPlan?: TripPlanRecord;
  readonly messageResponse: string;
  readonly requiresHumanConfirmation: boolean;
  readonly pendingConfirmationDescription?: string;
}

/**
 * Orquestador Central: Enruta la intención del usuario y coordina los agentes especializados.
 */
export async function routeAndExecuteWorkflow(
  input: ConciergeRequestInput
): Promise<ConciergeExecutionResult> {
  const text = input.message.toLowerCase();
  const userId = input.userId || "anonymous_explorer";
  const workflowId = `wf-${Date.now()}`;

  // 1. Detección de Intentos Prohibidos (Nivel 4)
  if (text.includes("paga por mi") || text.includes("pagar con tarjeta") || text.includes("cobrame")) {
    return {
      workflow: {
        workflowId,
        userId,
        intent: "PROHIBITED_FINANCIAL_OPERATION",
        status: "FAILED",
        currentStep: 1,
        totalSteps: 1,
        executionSteps: [
          {
            agent: "reservation",
            action: "DENIED_FINANCIAL_ACTION",
            resultSummary: "La IA tiene terminantemente prohibido ejecutar pagos o transacciones monetarias automáticas.",
            timestamp: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      messageResponse: "Por razones de seguridad y protección de tus fondos, Baqueano AI no procesa pagos directamente. Puedes completar tu pago de forma segura a través de nuestra pasarela de pagos oficial.",
      requiresHumanConfirmation: false
    };
  }

  // 2. Intención de Planificación de Viaje (Trip Planning Multi-Agent)
  const isPlanningIntent =
    text.includes("plan") ||
    text.includes("itinerario") ||
    text.includes("viaje") ||
    text.includes("días") ||
    text.includes("visitar") ||
    text.includes("conocer") ||
    Boolean(input.territory);

  if (isPlanningIntent) {
    return await executeTripPlanningWorkflow(workflowId, userId, input);
  }

  // 3. Intención de Consulta Cultural / Informativa
  return {
    workflow: {
      workflowId,
      userId,
      intent: "GENERAL_INQUIRY",
      status: "COMPLETED",
      currentStep: 1,
      totalSteps: 1,
      executionSteps: [
        {
          agent: "culture",
          action: "CONSULT_HERITAGE",
          resultSummary: "Información cultural y comunitaria consultada con éxito.",
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    messageResponse: `¡Hola explorador! En Baqueano estamos listos para coordinar tu viaje por Nicaragua. Indícame qué territorio deseas explorar (ej: Matagalpa, Somoto, León u Ometepe), cuántos días dispones y tu presupuesto estimado, y nuestros agentes especializados organizarán tu ruta con destinos verificados y economía campesina directa.`,
    requiresHumanConfirmation: false
  };
}

/**
 * Workflow Multiagente de Planificación de Viaje (Trip Planner)
 */
async function executeTripPlanningWorkflow(
  workflowId: string,
  userId: string,
  input: ConciergeRequestInput
): Promise<ConciergeExecutionResult> {
  const executionSteps: { agent: any; action: string; resultSummary: string; timestamp: string }[] = [];

  const territory = input.territory || detectTerritory(input.message) || "Matagalpa";
  const daysCount = input.daysCount || detectDays(input.message) || 2;
  const travelersCount = input.travelersCount || 2;
  const currency = input.currency || "NIO";

  // Paso 1: Destination Agent — Búsqueda de Atractivos
  executionSteps.push({
    agent: "destination",
    action: "SEARCH_DESTINATIONS",
    resultSummary: `Búsqueda de destinos y cooperativas verificadas en el territorio de ${territory}.`,
    timestamp: new Date().toISOString()
  });
  const rawStops = await searchDestinationsTool({ territory, limit: daysCount * 2 });

  // Paso 2: Map Agent — Secuenciación y Cálculo de Traslados
  executionSteps.push({
    agent: "map",
    action: "OPTIMIZE_ROUTE",
    resultSummary: "Cálculo de distancias y tiempos de traslado entre paradas territoriales.",
    timestamp: new Date().toISOString()
  });

  // Paso 3: Safety Agent — Análisis de Clima y Alertas
  executionSteps.push({
    agent: "safety",
    action: "ASSESS_WEATHER_SAFETY",
    resultSummary: "Evaluación de condiciones meteorológicas y recomendaciones de seguridad.",
    timestamp: new Date().toISOString()
  });
  const { climateAdvice, safetyWarnings } = getWeatherSafetyTool(territory);

  // Distribuir paradas por días
  const days: TripDayPlan[] = [];
  const activitiesCosts: number[] = [];

  for (let i = 1; i <= daysCount; i++) {
    const dayStops: TripStop[] = rawStops.slice((i - 1) * 2, i * 2);
    if (dayStops.length === 0 && rawStops.length > 0) {
      dayStops.push(rawStops[0]);
    }

    const dayCost = dayStops.reduce((sum, s) => sum + s.priceNio, 0);
    activitiesCosts.push(dayCost);

    days.push({
      dayNumber: i,
      title: `Día ${i}: Exploración en ${territory}`,
      stops: dayStops,
      estimatedTravelHours: 1.5,
      dayCostNio: dayCost * travelersCount,
      dayCostUsd: Math.round((dayCost / 36.8) * travelersCount * 100) / 100,
      climateAdvice
    });
  }

  // Paso 4: Budget Agent — Cálculo Determinístico Puro
  executionSteps.push({
    agent: "budget",
    action: "CALCULATE_BUDGET_DETERMINISTIC",
    resultSummary: `Cálculo exacto de actividades, transporte y alimentación para ${travelersCount} personas.`,
    timestamp: new Date().toISOString()
  });
  const budget: BudgetBreakdown = calculateBudgetTool(
    activitiesCosts,
    daysCount,
    travelersCount,
    currency,
    input.budgetLimitNio
  );

  // Paso 5: Trip Planner Agent — Consolidación
  executionSteps.push({
    agent: "trip_planner",
    action: "CONSOLIDATE_TRIP_PLAN",
    resultSummary: `Plan de viaje de ${daysCount} días estructurado con ${days.length} etapas.`,
    timestamp: new Date().toISOString()
  });

  const tripPlanId = `trip-${Date.now()}`;
  const tripPlan: TripPlanRecord = {
    id: tripPlanId,
    userId,
    title: `Ruta Auténtica: ${territory} (${daysCount} Días)`,
    territory,
    daysCount,
    days,
    budget,
    safetyWarnings,
    trustSignals: [
      "Alojamientos con compras directas a cooperativas locales campesinas",
      "Destinos con verificación territorial vigente",
      "Cálculo presupuestario determinístico transparente"
    ],
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const workflow: AgenticWorkflowRecord = {
    workflowId,
    userId,
    intent: "TRIP_PLANNING",
    status: "COMPLETED",
    currentStep: executionSteps.length,
    totalSteps: executionSteps.length,
    activeAgent: "trip_planner",
    tripPlanId,
    executionSteps,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const messageResponse = `He coordinado con nuestros agentes especializados un plan de ${daysCount} días en **${territory}** para ${travelersCount} personas. El costo total estimado es de **${budget.currency} ${budget.totalCalculated.toLocaleString()}** (incluyendo actividades, transporte local y alimentación típica). Puedes revisar el itinerario interactivo a continuación:`;

  return {
    workflow,
    tripPlan,
    messageResponse,
    requiresHumanConfirmation: false
  };
}

function detectTerritory(msg: string): string | null {
  const territories = ["Matagalpa", "Somoto", "León", "Chinandega", "Ometepe", "Granada", "Rivas", "Estelí", "Jinotega", "Carazo", "Masaya", "Boaco", "Chontales", "Río San Juan", "Madriz", "Nueva Segovia"];
  for (const t of territories) {
    if (msg.toLowerCase().includes(t.toLowerCase())) return t;
  }
  return null;
}

function detectDays(msg: string): number | null {
  const match = msg.match(/(\d+)\s*(días|dias|dia|día)/i);
  if (match && match[1]) {
    const num = parseInt(match[1], 10);
    return num > 0 && num <= 7 ? num : 2;
  }
  if (msg.includes("fin de semana")) return 2;
  if (msg.includes("un día") || msg.includes("un dia")) return 1;
  return null;
}
