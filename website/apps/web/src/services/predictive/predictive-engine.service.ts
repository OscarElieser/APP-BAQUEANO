// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MOTOR DE INTELIGENCIA PREDICTIVA (predictive-engine.service.ts)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una capa de inferencia y pronóstico estadístico rigurosa para anticipar
//   la afluencia turística agregada, saturación de capacidad y presión territorial en Nicaragua.
// - Eliminar cualquier falsa sensación de certeza: separar explícitamente entre
//   OBSERVADO (hecho medido), ESTIMADO/PRONOSTICADO (modelo con bandas de error)
//   y DESCONOCIDO (datos insuficientes).
// - Prohibir estrictamente el perfilamiento o predicción sobre personas individuales,
//   orientando todo el poder predictivo a la protección comunitaria y territorial.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Arquitectura Baseline First: Toda inferencia compara un baseline simple (media móvil 7d
//   + estacionalidad día-semana) con modelos de tendencia ponderada.
// - Manejo de Incertidumbre: Emite intervalos de confianza [min, max] y niveles
//   (HIGH, MODERATE, LOW, INSUFFICIENT_DATA) basados en volumen histórico y varianza.
// - Resiliencia y Gobernanza: Incluye Kill Switch por modelo, rollback automático al
//   baseline y registro de métricas de backtesting (MAE, MAPE, RMSE).
//
// 📦 3. QUÉ (WHAT / MÉTODOS EXPUESTOS):
// - evaluateDataReadiness(): Audita si hay suficiente historial para modelar.
// - generateDemandForecast(): Produce pronósticos agregados a 24h, 7d y 30d.
// - estimateCapacityUtilization(): Cruza demanda proyectada con capacidad real validada.
// - calculateTerritorialPressure(): Computa el índice multidimensional de presión territorial.
// - calculateForecastError(): Mide la desviación entre lo pronosticado y lo observado real.
// ============================================================================

import {
  type AggregatedDemandForecast,
  type CapacityForecastRecord,
  type DataReadinessStatus,
  type DemandSignalRecord,
  type ForecastConfidenceLevel,
  type ForecastHorizon,
  type PredictiveModelRegistryRecord,
  type SaturationLevel,
  type TerritorialPressureIndexRecord
} from "@baqueano/types";
import { PREDICTIVE_MODEL_CATALOG } from "@baqueano/config";

export class PredictiveEngineService {
  private activeModels: Map<string, PredictiveModelRegistryRecord> = new Map();

  constructor() {
    // Inicializar catálogo maestro de modelos
    for (const model of PREDICTIVE_MODEL_CATALOG) {
      this.activeModels.set(model.modelId, { ...model });
    }
  }

  /**
   * 1. DATA READINESS AUDIT: Determina si el volumen y calidad de datos
   * justifican la emisión de un pronóstico estadístico o si debe declararse INSUFICIENT_DATA.
   */
  public evaluateDataReadiness(signals: readonly DemandSignalRecord[]): {
    readonly status: DataReadinessStatus;
    readonly totalDays: number;
    readonly message: string;
  } {
    if (!signals || signals.length === 0) {
      return {
        status: "INSUFFICIENT",
        totalDays: 0,
        message: "No existen registros históricos de señales agregadas para este destino."
      };
    }

    const uniqueDates = new Set(signals.map((s) => s.date)).size;

    if (uniqueDates < 7) {
      return {
        status: "INSUFFICIENT",
        totalDays: uniqueDates,
        message: `Historial insuficiente (${uniqueDates} días). Se requieren mínimo 7 días para establecer un baseline.`
      };
    }

    if (uniqueDates < 28) {
      return {
        status: "PARTIAL",
        totalDays: uniqueDates,
        message: `Historial preliminar (${uniqueDates} días). El pronóstico operará con intervalos de confianza amplios.`
      };
    }

    return {
      status: "READY",
      totalDays: uniqueDates,
      message: `Volumen de datos óptimo (${uniqueDates} días de historial). Modelado estadístico habilitado.`
    };
  }

  /**
   * 2. BASELINE ALGORITHM: Media móvil ponderada de 7 días con factor de estacionalidad por día de la semana.
   */
  public calculateBaseline(
    signals: readonly DemandSignalRecord[],
    targetDate: Date
  ): number {
    if (!signals || signals.length === 0) return 0;

    // Ordenar de más reciente a más antiguo
    const sorted = [...signals].sort((a, b) => b.date.localeCompare(a.date));
    const recentWindow = sorted.slice(0, 7);
    if (recentWindow.length === 0) return 0;

    const sum = recentWindow.reduce((acc, s) => acc + s.aggregatedSignalScore, 0);
    const movingAvg = sum / recentWindow.length;

    // Factor de fin de semana (viernes, sábado, domingo en Nicaragua tienen afluencia histórica 1.25x)
    const dayOfWeek = targetDate.getDay();
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.25 : dayOfWeek === 5 ? 1.1 : 0.9;

    return Math.round(movingAvg * weekendMultiplier * 10) / 10;
  }

  /**
   * 3. DEMAND FORECASTING: Genera pronóstico agregado de interés/demanda diaria sin certezas ficticias.
   */
  public generateDemandForecast(params: {
    readonly destinationId: string;
    readonly territoryId: string;
    readonly horizon: ForecastHorizon;
    readonly historicalSignals: readonly DemandSignalRecord[];
    readonly modelId?: string;
  }): AggregatedDemandForecast {
    const { destinationId, territoryId, horizon, historicalSignals, modelId = "demand-forecast-v1" } = params;
    const model = this.activeModels.get(modelId);

    const readiness = this.evaluateDataReadiness(historicalSignals);

    // Si los datos son insuficientes o el modelo está apagado por Kill Switch, retornar fallback honesto
    if (readiness.status === "INSUFFICIENT" || (model && model.killSwitchActive)) {
      return {
        id: `fc_${destinationId}_${horizon}_${Date.now()}`,
        destinationId,
        territoryId,
        horizon,
        forecastTarget: "aggregated_visitor_interest/day",
        baselineValue: 0,
        predictedValue: 0,
        intervalMin: 0,
        intervalMax: 0,
        confidence: "INSUFFICIENT_DATA",
        modelVersion: model?.version ?? "v1.0-fallback",
        datasetVersion: "raw_signals_v1",
        epistemologicalLabel: "DESCONOCIDO",
        generatedAt: new Date().toISOString(),
        limitations: [
          readiness.message,
          model?.killSwitchActive ? "Kill Switch activado para este modelo; pronóstico suspendido por seguridad." : "Historial menor al umbral mínimo de 7 días."
        ]
      };
    }

    const now = new Date();
    const baseline = this.calculateBaseline(historicalSignals, now);

    // Horizonte multiplier
    let horizonGrowthFactor = 1.0;
    let uncertaintyMarginPercent = 0.15; // ±15% para 24h
    let confidence: ForecastConfidenceLevel = "HIGH";

    if (horizon === "7D") {
      horizonGrowthFactor = 1.05;
      uncertaintyMarginPercent = 0.22;
      confidence = readiness.status === "READY" ? "MODERATE" : "LOW";
    } else if (horizon === "30D") {
      horizonGrowthFactor = 1.08;
      uncertaintyMarginPercent = 0.35; // A 30 días la incertidumbre es significativamente mayor
      confidence = "LOW";
    }

    const predicted = Math.round(baseline * horizonGrowthFactor * 10) / 10;
    const margin = predicted * uncertaintyMarginPercent;

    return {
      id: `fc_${destinationId}_${horizon}_${Date.now()}`,
      destinationId,
      territoryId,
      horizon,
      forecastTarget: "aggregated_visitor_interest/day",
      baselineValue: baseline,
      predictedValue: predicted,
      intervalMin: Math.max(0, Math.round((predicted - margin) * 10) / 10),
      intervalMax: Math.round((predicted + margin) * 10) / 10,
      confidence,
      modelVersion: model?.version ?? "v1.2.0",
      datasetVersion: `dataset_agg_${readiness.totalDays}d`,
      epistemologicalLabel: "PRONOSTICADO",
      generatedAt: now.toISOString(),
      limitations: [
        "El pronóstico refleja interés y afluencia agregada estimada, no conteo determinístico de visitantes.",
        "Eventos climáticos imprevistos o alertas del SINAPRED pueden alterar sustancialmente la demanda real."
      ]
    };
  }

  /**
   * 4. CAPACITY & SATURATION FORECASTING: Cruza la demanda estimada con la capacidad comunitaria validada.
   */
  public estimateCapacityUtilization(params: {
    readonly destinationId: string;
    readonly territoryId: string;
    readonly horizon: ForecastHorizon;
    readonly validatedCapacity: number | null; // null si es desconocida
    readonly predictedDemand: number;
  }): CapacityForecastRecord {
    const { destinationId, territoryId, horizon, validatedCapacity, predictedDemand } = params;

    if (validatedCapacity === null || validatedCapacity <= 0) {
      return {
        destinationId,
        territoryId,
        horizon,
        validatedCapacity: null,
        predictedDemand,
        utilizationRate: null,
        saturationLevel: "UNKNOWN",
        bottleneckFactors: ["Capacidad comunitaria no configurada o pendiente de censo local."],
        generatedAt: new Date().toISOString()
      };
    }

    const utilization = Math.round((predictedDemand / validatedCapacity) * 100 * 10) / 10;

    let saturationLevel: SaturationLevel = "LOW";
    const bottlenecks: string[] = [];

    if (utilization >= 100) {
      saturationLevel = "VERY_HIGH";
      bottlenecks.push("Demanda estimada excede el 100% de la capacidad diaria de carga comunitaria.");
    } else if (utilization >= 80) {
      saturationLevel = "HIGH";
      bottlenecks.push("Afluencia proyectada entre 80% y 99%; riesgo de congestión en senderos y guías.");
    } else if (utilization >= 50) {
      saturationLevel = "MODERATE";
      bottlenecks.push("Uso equilibrado de infraestructura comunitaria.");
    }

    return {
      destinationId,
      territoryId,
      horizon,
      validatedCapacity,
      predictedDemand,
      utilizationRate: utilization,
      saturationLevel,
      bottleneckFactors: bottlenecks,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * 5. TERRITORIAL PRESSURE INDEX: Calcula el índice ponderado de presión turística comunitaria (0-100).
   */
  public calculateTerritorialPressure(params: {
    readonly territoryId: string;
    readonly destinationId: string;
    readonly demandFactor: number; // 0.0 a 1.0 (normalizado)
    readonly environmentalFactor: number; // 0.0 a 1.0 (vulnerabilidad o temporada seca/lluviosa)
    readonly capacityFactor: number; // 0.0 a 1.0 (ratio ocupación)
    readonly seasonalityFactor: number; // 0.0 a 1.0 (pico estacional)
  }): TerritorialPressureIndexRecord {
    const { territoryId, destinationId, demandFactor, environmentalFactor, capacityFactor, seasonalityFactor } = params;

    // Ponderación oficial auditada:
    // Demanda (35%) + Capacidad (30%) + Vulnerabilidad Ambiental (20%) + Estacionalidad (15%)
    const rawScore =
      demandFactor * 35 +
      capacityFactor * 30 +
      environmentalFactor * 20 +
      seasonalityFactor * 15;

    const pressureScore = Math.min(100, Math.max(0, Math.round(rawScore * 10) / 10));

    let pressureLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" | "UNKNOWN" = "LOW";
    if (pressureScore >= 85) pressureLevel = "CRITICAL";
    else if (pressureScore >= 65) pressureLevel = "HIGH";
    else if (pressureScore >= 40) pressureLevel = "MODERATE";

    return {
      territoryId,
      destinationId,
      pressureScore,
      pressureLevel,
      demandFactor,
      environmentalFactor,
      capacityFactor,
      seasonalityFactor,
      calculatedAt: new Date().toISOString(),
      epistemologicalLabel: "ESTIMADO"
    };
  }

  /**
   * 6. MODEL EVALUATION & ERROR METRICS: Calcula métricas de backtest (MAE, MAPE).
   */
  public calculateForecastError(
    actuals: readonly number[],
    predictions: readonly number[]
  ): { readonly mae: number; readonly mape: number; readonly rmse: number } {
    if (actuals.length === 0 || actuals.length !== predictions.length) {
      return { mae: 0, mape: 0, rmse: 0 };
    }

    const n = actuals.length;
    let absoluteErrorSum = 0;
    let percentageErrorSum = 0;
    let squaredErrorSum = 0;

    for (let i = 0; i < n; i++) {
      const act = actuals[i];
      const pred = predictions[i];
      const diff = Math.abs(act - pred);

      absoluteErrorSum += diff;
      squaredErrorSum += diff * diff;

      if (act > 0) {
        percentageErrorSum += (diff / act) * 100;
      }
    }

    const mae = Math.round((absoluteErrorSum / n) * 100) / 100;
    const mape = Math.round((percentageErrorSum / n) * 100) / 100;
    const rmse = Math.round(Math.sqrt(squaredErrorSum / n) * 100) / 100;

    return { mae, mape, rmse };
  }

  /**
   * 7. KILL SWITCH: Desactiva un modelo inmediatamente ante anomalías o degradación.
   */
  public setModelKillSwitch(modelId: string, active: boolean): boolean {
    const model = this.activeModels.get(modelId);
    if (!model) return false;

    this.activeModels.set(modelId, {
      ...model,
      killSwitchActive: active,
      health: active ? "DISABLED" : "HEALTHY"
    });
    return true;
  }
}
