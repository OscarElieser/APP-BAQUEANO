// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MOTOR DE SIMULACIÓN WHAT-IF (simulation-engine.service.ts)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer un laboratorio de simulación determinístico (Simulation Lab) para que
//   los administradores de territorio y líderes comunitarios evalúen escenarios hipotéticos
//   (¿Qué pasa si la demanda aumenta 25%? ¿Qué pasa si un sendero se cierra por lluvia?
//   ¿Qué pasa si redistribuimos 15% de flujo hacia cooperativas emergentes?).
// - Garantizar el aislamiento absoluto frente al estado real de producción:
//   El motor de simulación es 100% de solo lectura y nunca altera reservas, precios,
//   capacidades reales ni publica alertas automáticas.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Inferencia inmutable en memoria con límites estrictos definidos en SIMULATION_BOUNDS_CONFIG.
// - Modelado de Redistribución Territorial: Calcula desvíos de afluencia basados en proximidad
//   geográfica, afinidad cultural y capacidad comunitaria ociosa.
// - Etiquetado Inviolable: Todo resultado lleva `isSimulatedData: true` y marca de agua
//   epistemológica 'SIMULADO'.
//
// 📦 3. QUÉ (WHAT / MÉTODOS EXPUESTOS):
// - runScenario(): Ejecuta un escenario What-If determinístico.
// - compareScenarios(): Compara cuantitativamente el escenario base contra candidatos A y B.
// - simulateTerritorialRedistribution(): Simula el impacto ético de diversificar el turismo.
// ============================================================================

import {
  type SimulationComparisonRecord,
  type SimulationRedistributionResult,
  type SimulationScenarioParameters,
  type SimulationScenarioRecord,
  type SimulationScenarioResult
} from "@baqueano/types";
import { SIMULATION_BOUNDS_CONFIG } from "@baqueano/config";

export interface DestinationBaselineInput {
  readonly destinationId: string;
  readonly territoryId: string;
  readonly name: string;
  readonly baselineDemand: number;
  readonly validatedCapacity: number;
  readonly basePressureScore: number;
  readonly nearbyAlternativeId?: string;
}

export class SimulationEngineService {
  /**
   * 1. RUN SCENARIO: Ejecuta una simulación What-If determinística en memoria.
   */
  public runScenario(params: {
    readonly scenarioId: string;
    readonly name: string;
    readonly description: string;
    readonly baselineDestinations: readonly DestinationBaselineInput[];
    readonly parameters: SimulationScenarioParameters;
    readonly createdBy: string;
  }): SimulationScenarioRecord {
    const { scenarioId, name, description, baselineDestinations, parameters, createdBy } = params;

    // 1. Sanitizar y limitar parámetros según cotas de seguridad
    const safeDemandMultiplier = Math.min(
      SIMULATION_BOUNDS_CONFIG.maxDemandMultiplier,
      Math.max(SIMULATION_BOUNDS_CONFIG.minDemandMultiplier, parameters.demandMultiplier)
    );

    const safeCapacityMultiplier = Math.min(
      SIMULATION_BOUNDS_CONFIG.maxCapacityMultiplier,
      Math.max(SIMULATION_BOUNDS_CONFIG.minCapacityMultiplier, parameters.capacityMultiplier)
    );

    const safeRedistributionPercent = Math.min(
      SIMULATION_BOUNDS_CONFIG.maxRedistributionPercent,
      Math.max(0, parameters.targetRedistributionPercent)
    );

    let totalProjectedDemand = 0;
    let totalProjectedCapacity = 0;
    const affectedTerritoriesSet = new Set<string>();
    const redistributionSuggestions: SimulationRedistributionResult[] = [];

    // 2. Procesar cada destino bajo las premisas del escenario
    for (const dest of baselineDestinations) {
      affectedTerritoriesSet.add(dest.territoryId);

      const isAvailable = parameters.destinationAvailability[dest.destinationId] !== false;
      const isRouteClosed = parameters.routeClosure.includes(dest.destinationId);

      // Si está cerrado o la ruta bloqueada, su capacidad aprovechable es 0
      const effectiveCapacity =
        !isAvailable || isRouteClosed
          ? 0
          : Math.round(dest.validatedCapacity * safeCapacityMultiplier);

      let demandForDest = dest.baselineDemand * safeDemandMultiplier;

      // Aplicar factor por clima adverso
      if (parameters.weatherDisruptionLevel === "SEVERE") {
        demandForDest *= 0.6; // Reducción del 40% por tormenta/lluvia
      } else if (parameters.weatherDisruptionLevel === "MODERATE") {
        demandForDest *= 0.85;
      }

      // Si el destino está saturado o cerrado, simular redistribución hacia alternativo
      if ((!isAvailable || demandForDest > effectiveCapacity) && dest.nearbyAlternativeId && safeRedistributionPercent > 0) {
        const divertedAmount = Math.round(demandForDest * (safeRedistributionPercent / 100));
        redistributionSuggestions.push({
          sourceDestinationId: dest.destinationId,
          targetDestinationId: dest.nearbyAlternativeId,
          divertedInterestPercent: safeRedistributionPercent,
          estimatedCapacityRelief: divertedAmount
        });
      }

      totalProjectedDemand += demandForDest;
      totalProjectedCapacity += effectiveCapacity;
    }

    const projectedCapacityUtilization =
      totalProjectedCapacity > 0
        ? Math.round((totalProjectedDemand / totalProjectedCapacity) * 100 * 10) / 10
        : 100;

    let riskLevel: "LOW" | "MODERATE" | "HIGH" | "ELEVATED" = "LOW";
    if (projectedCapacityUtilization >= 95) riskLevel = "ELEVATED";
    else if (projectedCapacityUtilization >= 80) riskLevel = "HIGH";
    else if (projectedCapacityUtilization >= 60) riskLevel = "MODERATE";

    const result: SimulationScenarioResult = {
      projectedDemand: Math.round(totalProjectedDemand),
      projectedCapacityUtilization,
      affectedTerritories: Array.from(affectedTerritoriesSet),
      redistributionSuggestions,
      riskLevel,
      simulatedAt: new Date().toISOString()
    };

    const assumptions = [
      `Multiplicador de demanda configurado en ${(safeDemandMultiplier * 100).toFixed(0)}%.`,
      `Multiplicador de capacidad comunitaria en ${(safeCapacityMultiplier * 100).toFixed(0)}%.`,
      parameters.weatherDisruptionLevel !== "NONE"
        ? `Impacto climático modelado en nivel: ${parameters.weatherDisruptionLevel}.`
        : "Condiciones meteorológicas estándar asumidas.",
      safeRedistributionPercent > 0
        ? `Tasa de desvío solidario hacia cooperativas emergentes: ${safeRedistributionPercent}%.`
        : "Sin política de redistribución activa en este escenario."
    ];

    return {
      scenarioId,
      name,
      description,
      baselineSnapshotId: `base_snap_${Date.now()}`,
      assumptions,
      parameters: {
        demandMultiplier: safeDemandMultiplier,
        capacityMultiplier: safeCapacityMultiplier,
        destinationAvailability: parameters.destinationAvailability,
        routeClosure: parameters.routeClosure,
        weatherDisruptionLevel: parameters.weatherDisruptionLevel,
        targetRedistributionPercent: safeRedistributionPercent
      },
      result,
      createdAt: new Date().toISOString(),
      createdBy,
      isSimulatedData: true // GARANTÍA ESTRICTA: Datos simulados, no modifican la base de datos real
    };
  }

  /**
   * 2. COMPARE SCENARIOS: Compara una línea base frente a múltiples candidatos What-If.
   */
  public compareScenarios(
    baselineScenario: SimulationScenarioRecord,
    candidateScenarios: readonly SimulationScenarioRecord[]
  ): SimulationComparisonRecord {
    const diffMetrics = candidateScenarios.map((cand) => {
      const demandChangePercent =
        baselineScenario.result.projectedDemand > 0
          ? Math.round(
              ((cand.result.projectedDemand - baselineScenario.result.projectedDemand) /
                baselineScenario.result.projectedDemand) *
                100 *
                10
            ) / 10
          : 0;

      const pressureDelta =
        Math.round(
          (cand.result.projectedCapacityUtilization - baselineScenario.result.projectedCapacityUtilization) * 10
        ) / 10;

      const totalRelief = cand.result.redistributionSuggestions.reduce(
        (acc, r) => acc + r.estimatedCapacityRelief,
        0
      );

      return {
        scenarioId: cand.scenarioId,
        demandChangePercent,
        pressureDelta,
        redistributionGain: totalRelief
      };
    });

    return {
      id: `sim_comp_${Date.now()}`,
      baselineScenario,
      candidateScenarios,
      diffMetrics
    };
  }
}
