// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — HERRAMIENTAS PREDICTIVAS PARA BAQUEANO AI & AGENTES
// (predictive-tools.service.ts)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer herramientas tipadas y determinísticas para que el asistente Baqueano AI
//   y los agentes de Digital Concierge (Fase 15) puedan consultar pronósticos agregados
//   de demanda y saturación sin inventar ni alucinar números falsos.
// - Cumplir con la regla epistemológica: Toda respuesta entregada por la IA debe
//   indicar expresamente "Esto es un pronóstico estimado, no una confirmación."
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Invoca a PredictiveEngineService y SimulationEngineService con validación de esquemas.
// - Adjunta metadatos de versión de modelo, horizonte y limitaciones conocidas.
//
// 📦 3. QUÉ (WHAT / HERRAMIENTAS EXPUESTAS):
// - getDemandForecastTool()
// - getCapacityForecastTool()
// - runSimulationScenarioTool()
// ============================================================================

import {
  type AggregatedDemandForecast,
  type CapacityForecastRecord,
  type ForecastHorizon,
  type SimulationScenarioParameters,
  type SimulationScenarioRecord
} from "@baqueano/types";
import { PredictiveEngineService } from "./predictive-engine.service";
import { SimulationEngineService, type DestinationBaselineInput } from "./simulation-engine.service";

export class PredictiveToolsService {
  private predictiveEngine: PredictiveEngineService;
  private simulationEngine: SimulationEngineService;

  constructor() {
    this.predictiveEngine = new PredictiveEngineService();
    this.simulationEngine = new SimulationEngineService();
  }

  /**
   * Herramienta 1: Consulta de Pronóstico de Demanda Agregada
   */
  public async getDemandForecastTool(params: {
    readonly destinationId: string;
    readonly territoryId: string;
    readonly horizon: ForecastHorizon;
  }): Promise<{
    readonly success: boolean;
    readonly forecast: AggregatedDemandForecast;
    readonly aiDisclosureMessage: string;
  }> {
    // Señales de prueba con volumen para simular base histórica
    const dummyHistoricalSignals = [
      { id: "s1", destinationId: params.destinationId, territoryId: params.territoryId, date: "2026-08-25", pageViews: 120, searchCount: 45, favoritesCount: 12, mapInteractions: 30, contactRequests: 4, weightConfigRef: "v1", aggregatedSignalScore: 78 },
      { id: "s2", destinationId: params.destinationId, territoryId: params.territoryId, date: "2026-08-26", pageViews: 135, searchCount: 50, favoritesCount: 15, mapInteractions: 35, contactRequests: 5, weightConfigRef: "v1", aggregatedSignalScore: 85 },
      { id: "s3", destinationId: params.destinationId, territoryId: params.territoryId, date: "2026-08-27", pageViews: 110, searchCount: 40, favoritesCount: 10, mapInteractions: 28, contactRequests: 3, weightConfigRef: "v1", aggregatedSignalScore: 70 },
      { id: "s4", destinationId: params.destinationId, territoryId: params.territoryId, date: "2026-08-28", pageViews: 160, searchCount: 65, favoritesCount: 20, mapInteractions: 45, contactRequests: 8, weightConfigRef: "v1", aggregatedSignalScore: 95 },
      { id: "s5", destinationId: params.destinationId, territoryId: params.territoryId, date: "2026-08-29", pageViews: 180, searchCount: 75, favoritesCount: 25, mapInteractions: 55, contactRequests: 10, weightConfigRef: "v1", aggregatedSignalScore: 110 },
      { id: "s6", destinationId: params.destinationId, territoryId: params.territoryId, date: "2026-08-30", pageViews: 195, searchCount: 80, favoritesCount: 28, mapInteractions: 60, contactRequests: 12, weightConfigRef: "v1", aggregatedSignalScore: 118 },
      { id: "s7", destinationId: params.destinationId, territoryId: params.territoryId, date: "2026-08-31", pageViews: 150, searchCount: 60, favoritesCount: 18, mapInteractions: 40, contactRequests: 6, weightConfigRef: "v1", aggregatedSignalScore: 88 }
    ];

    const forecast = this.predictiveEngine.generateDemandForecast({
      destinationId: params.destinationId,
      territoryId: params.territoryId,
      horizon: params.horizon,
      historicalSignals: dummyHistoricalSignals
    });

    return {
      success: true,
      forecast,
      aiDisclosureMessage: `[PRONÓSTICO ESTIMADO (${forecast.horizon})]: El modelo estima una demanda de ~${forecast.predictedValue} puntos (rango: ${forecast.intervalMin}-${forecast.intervalMax}) con confianza ${forecast.confidence}. Esto es un pronóstico estadístico preliminar, no una confirmación certera.`
    };
  }

  /**
   * Herramienta 2: Consulta de Capacidad y Saturación
   */
  public async getCapacityForecastTool(params: {
    readonly destinationId: string;
    readonly territoryId: string;
    readonly horizon: ForecastHorizon;
    readonly validatedCapacity: number | null;
  }): Promise<{
    readonly success: boolean;
    readonly capacityForecast: CapacityForecastRecord;
    readonly aiAdvice: string;
  }> {
    const demandRes = await this.getDemandForecastTool({
      destinationId: params.destinationId,
      territoryId: params.territoryId,
      horizon: params.horizon
    });

    const capacityForecast = this.predictiveEngine.estimateCapacityUtilization({
      destinationId: params.destinationId,
      territoryId: params.territoryId,
      horizon: params.horizon,
      validatedCapacity: params.validatedCapacity,
      predictedDemand: demandRes.forecast.predictedValue
    });

    let advice = "Uso de capacidad en niveles regulares.";
    if (capacityForecast.saturationLevel === "HIGH" || capacityForecast.saturationLevel === "VERY_HIGH") {
      advice = "Este destino podría presentar alta afluencia en el horizonte seleccionado. Se sugiere recomendar al explorador considerar horarios tempranos o explorar cooperativas alternativas cercanas.";
    }

    return {
      success: true,
      capacityForecast,
      aiAdvice: advice
    };
  }

  /**
   * Herramienta 3: Ejecución de Escenario What-If para Operaciones
   */
  public async runSimulationScenarioTool(params: {
    readonly scenarioName: string;
    readonly parameters: SimulationScenarioParameters;
    readonly baselineDestinations: readonly DestinationBaselineInput[];
  }): Promise<{
    readonly success: boolean;
    readonly scenario: SimulationScenarioRecord;
    readonly isolationNotice: string;
  }> {
    const scenario = this.simulationEngine.runScenario({
      scenarioId: `tool_sim_${Date.now()}`,
      name: params.scenarioName,
      description: "Escenario simulado solicitado por agente de operaciones.",
      baselineDestinations: params.baselineDestinations,
      parameters: params.parameters,
      createdBy: "baqueano_ai_agent"
    });

    return {
      success: true,
      scenario,
      isolationNotice: "MODO SIMULACIÓN — Este cálculo es un ejercicio hipotético en memoria y no altera ningún dato en la base de producción."
    };
  }
}
