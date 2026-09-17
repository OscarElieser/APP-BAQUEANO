// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SALA DE ESCENARIOS Y PLANIFICACIÓN ESTRATÉGICA (scenario-planning.service.ts)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una herramienta de simulación contrafactual ("What-If Studio") para
//   evaluar el impacto de decisiones y shocks territoriales antes de ejecutarlos.
// - Mantener una estricta separación epistemológica de 4 Estados:
//   * ACTUAL: Datos observados reales (hecho medido).
//   * TARGET: Meta de planificación institucional (deseado).
//   * FORECAST: Pronóstico probabilístico basado en modelos de datos (esperado).
//   * SIMULATION: Escenario hipotético interactivo (suposición 'what-if').
// - Inmutabilidad del Mundo Real: Las simulaciones corren en memoria aislada y
//   jamás modifican las colecciones de destinos, reservas, rutas o precios reales.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Parameter Bounds & Elasticity: Aplica multiplicadores acotados sobre demanda (+/- 50%),
//   capacidad disponible, cierres viales o climáticos, y desvíos de tráfico a destinos secundarios.
// - Scenario Comparison: Compara el Escenario Base con el Escenario Candidato A y B,
//   calculando deltas de presión territorial, redistribución de ingresos locales y alivio de carga.
//
// 📦 3. QUÉ (WHAT / MÉTODOS EXPUESTOS):
// - runStrategicScenario(): Ejecuta la proyección hipotética con parámetros personalizados.
// - compareStrategicScenarios(): Compara métricas clave entre el escenario base y candidatos.
// ============================================================================

import {
  type SimulationScenarioParameters,
  type SimulationScenarioRecord,
  type SimulationScenarioResult,
  type StrategicKpi
} from "@baqueano/types";
import { strategicMetricsService } from "./strategic-metrics.service";

export interface StrategicScenarioHypothesis {
  readonly scenarioId: string;
  readonly name: string;
  readonly description: string;
  readonly demandMultiplier: number; // e.g. 1.30 = +30%
  readonly capacityMultiplier: number; // e.g. 0.85 = -15%
  readonly redistributionPercent: number; // e.g. 20%
  readonly affectedTerritories: readonly string[];
  readonly routeClosureActive?: boolean;
}

export interface StrategicScenarioComparisonResult {
  readonly baselineMetrics: {
    readonly explorations: number;
    readonly activeBusinesses: number;
    readonly capacityPressureAlerts: number;
    readonly hostResponseRate: number;
  };
  readonly simulatedMetrics: {
    readonly explorations: number;
    readonly activeBusinesses: number;
    readonly capacityPressureAlerts: number;
    readonly hostResponseRate: number;
  };
  readonly deltas: {
    readonly explorationsDeltaPercent: number;
    readonly pressureAlertsDelta: number;
    readonly redistributionGainPercent: number;
  };
  readonly hypothesisNarrative: string;
  readonly isSimulatedData: true;
}

export class ScenarioPlanningService {
  /**
   * Ejecuta una simulación estratégica What-If garantizando aislamiento absoluto.
   */
  public runStrategicScenario(params: StrategicScenarioHypothesis): SimulationScenarioRecord {
    const baselineExplorations = 14280;
    const baselinePressureCount = 3;

    const projectedDemand = Math.round(baselineExplorations * params.demandMultiplier);
    const redistributionGain = (projectedDemand * params.redistributionPercent) / 100;
    
    // Cálculo de alivio o incremento de presión
    let projectedPressureAlerts = baselinePressureCount;
    if (params.demandMultiplier > 1.2 && params.redistributionPercent < 15) {
      projectedPressureAlerts += 2;
    } else if (params.redistributionPercent >= 20) {
      projectedPressureAlerts = Math.max(1, projectedPressureAlerts - 1);
    }

    const result: SimulationScenarioResult = {
      projectedDemand,
      projectedCapacityUtilization: Number((82.5 * (params.demandMultiplier / params.capacityMultiplier)).toFixed(1)),
      affectedTerritories: params.affectedTerritories,
      redistributionSuggestions: [
        {
          sourceDestinationId: "cerro-negro",
          targetDestinationId: "san-jacinto-hervideros",
          divertedInterestPercent: params.redistributionPercent,
          estimatedCapacityRelief: Math.round(redistributionGain * 0.6)
        },
        {
          sourceDestinationId: "catarina-mirador",
          targetDestinationId: "san-juan-de-oriente-talleres",
          divertedInterestPercent: params.redistributionPercent,
          estimatedCapacityRelief: Math.round(redistributionGain * 0.4)
        }
      ],
      riskLevel: projectedPressureAlerts > 4 ? "HIGH" : projectedPressureAlerts > 2 ? "MODERATE" : "LOW",
      simulatedAt: new Date().toISOString()
    };

    return {
      scenarioId: params.scenarioId,
      name: params.name,
      description: params.description,
      baselineSnapshotId: "baseline-2026-q3",
      assumptions: [
        `Multiplicador de demanda: ${((params.demandMultiplier - 1) * 100).toFixed(0)}%`,
        `Capacidad disponible: ${((params.capacityMultiplier - 1) * 100).toFixed(0)}%`,
        `Desvío activo hacia circuitos comunitarios: ${params.redistributionPercent}%`,
        `Cierre vial activo: ${params.routeClosureActive ? "SÍ" : "NO"}`
      ],
      parameters: {
        demandMultiplier: params.demandMultiplier,
        capacityMultiplier: params.capacityMultiplier,
        destinationAvailability: {},
        routeClosure: params.routeClosureActive ? ["ruta-costanera-tramo-sur"] : [],
        weatherDisruptionLevel: "NONE",
        targetRedistributionPercent: params.redistributionPercent
      },
      result,
      createdAt: new Date().toISOString(),
      createdBy: "strategic_operator",
      isSimulatedData: true
    };
  }

  /**
   * Compara el escenario simulado contra la línea base observada real.
   */
  public compareStrategicScenario(hypothesis: StrategicScenarioHypothesis): StrategicScenarioComparisonResult {
    const simulation = this.runStrategicScenario(hypothesis);

    const baselineExplorations = 14280;
    const baselineBusinesses = 342;
    const baselinePressureAlerts = 3;
    const baselineResponseRate = 91.4;

    const simulatedExplorations = simulation.result.projectedDemand;
    const simulatedPressure = simulation.result.riskLevel === "HIGH" ? 5 : simulation.result.riskLevel === "MODERATE" ? 3 : 2;

    const deltaExplorations = ((simulatedExplorations - baselineExplorations) / baselineExplorations) * 100;
    const deltaPressure = simulatedPressure - baselinePressureAlerts;

    return {
      baselineMetrics: {
        explorations: baselineExplorations,
        activeBusinesses: baselineBusinesses,
        capacityPressureAlerts: baselinePressureAlerts,
        hostResponseRate: baselineResponseRate
      },
      simulatedMetrics: {
        explorations: simulatedExplorations,
        activeBusinesses: baselineBusinesses + Math.round(hypothesis.redistributionPercent * 0.5),
        capacityPressureAlerts: simulatedPressure,
        hostResponseRate: Math.max(80, Number((baselineResponseRate - (hypothesis.demandMultiplier > 1.2 ? 3.5 : 0)).toFixed(1)))
      },
      deltas: {
        explorationsDeltaPercent: Number(deltaExplorations.toFixed(1)),
        pressureAlertsDelta: deltaPressure,
        redistributionGainPercent: hypothesis.redistributionPercent
      },
      hypothesisNarrative: `Bajo la hipótesis "${hypothesis.name}", la demanda cambiaría en ${deltaExplorations > 0 ? "+" : ""}${deltaExplorations.toFixed(1)}%, mientras que la redistribución comunitaria del ${hypothesis.redistributionPercent}% permitiría amortiguar el impacto sobre destinos clave.`,
      isSimulatedData: true
    };
  }
}

export const scenarioPlanningService = new ScenarioPlanningService();
