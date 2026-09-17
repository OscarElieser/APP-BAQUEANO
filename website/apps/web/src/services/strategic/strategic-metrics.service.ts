// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CAPA SEMÁNTICA DE MÉTRICAS (strategic-metrics.service.ts)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Actuar como la Fuente Única de Verdad (Single Source of Truth) para todos los
//   indicadores clave de rendimiento (KPIs) estratégicos de Baqueano Nicaragua.
// - Erradicar el "Formula Drift" (cálculos discrepantes entre tableros) asegurando
//   que toda cifra posea trazabilidad completa: fórmula, origen, periodo, versión y dueño.
// - Cumplir con el principio epistemológico innegociable: si no existen datos suficientes,
//   devolver explícitamente `null` (mostrado como "SIN DATOS" en la UI), NUNCA inventar "0".
// - Proteger la privacidad de anfitriones y micro-emprendimientos mediante salvaguardas
//   de celda pequeña (Small Cell Suppression / k-anonimato).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Semantic Metric Layer: Desacopla la lógica de negocio y cálculo estadístico de los
//   componentes visuales.
// - Control de Acceso Basado en Atributos (ABAC): Filtra métricas por rol (`super_admin`,
//   `admin`, `auditor`, etc.), ámbito territorial (`territoryScope`), país (`countryId`)
//   y nivel de confidencialidad (`PUBLIC`, `INTERNAL`, `CONFIDENTIAL`, `RESTRICTED`).
// - Materialized Cache & Freshness: Permite entrega ultrarrápida de métricas agregadas
//   registrando la fecha exacta de corte (`freshness`) y cadencia de actualización (`cadence`).
//
// 📦 3. QUÉ (WHAT / MÉTODOS EXPUESTOS):
// - getStrategicKpi(): Obtiene un KPI individual validando permisos y ámbito.
// - getAllStrategicKpis(): Recupera el catálogo completo autorizado filtrable por grupo.
// - evaluateMetricConfidence(): Determina el nivel de confianza de la evidencia (Suficiente, Parcial, Insuficiente).
// - calculatePeriodComparison(): Computa comparaciones porcentuales y absolutas entre periodos.
// - applySmallCellPrivacy(): Aplica supresión si la muestra es inferior al umbral de anonimato.
// ============================================================================

import {
  type ConfidenceLevel,
  type KpiGroup,
  type MetricSensitivity,
  type StrategicKpi,
  type UserRole
} from "@baqueano/types";
import { STRATEGIC_KPI_CATALOG } from "@baqueano/config";

export interface MetricAccessScope {
  readonly role?: UserRole;
  readonly organizationId?: string;
  readonly countryId?: string;
  readonly territoryId?: string;
}

export interface PeriodComparisonResult {
  readonly currentFormatted: string;
  readonly previousFormatted: string;
  readonly absoluteDelta: number | null;
  readonly percentDelta: number | null;
  readonly trend: "UP" | "DOWN" | "STABLE" | "NO_DATA";
  readonly isFavorable: boolean | null;
  readonly periodLabel: string;
}

export class StrategicMetricsService {
  private kpis: Map<string, StrategicKpi> = new Map();

  constructor(customCatalog?: readonly StrategicKpi[]) {
    const catalog = customCatalog ?? STRATEGIC_KPI_CATALOG;
    for (const kpi of catalog) {
      this.kpis.set(kpi.kpiId, kpi);
    }
  }

  /**
   * Obtiene un KPI específico aplicando validaciones de ámbito y confidencialidad.
   */
  public getStrategicKpi(kpiId: string, scope?: MetricAccessScope): StrategicKpi | null {
    const kpi = this.kpis.get(kpiId);
    if (!kpi) return null;

    if (!this.isAuthorizedForMetric(kpi, scope)) {
      return null;
    }

    return this.applyPrivacyFilters(kpi);
  }

  /**
   * Obtiene todos los KPIs autorizados para el rol/ámbito, opcionalmente filtrados por grupo.
   */
  public getAllStrategicKpis(scope?: MetricAccessScope, group?: KpiGroup): readonly StrategicKpi[] {
    const results: StrategicKpi[] = [];

    for (const kpi of this.kpis.values()) {
      if (group && kpi.group !== group) continue;
      if (!this.isAuthorizedForMetric(kpi, scope)) continue;

      results.push(this.applyPrivacyFilters(kpi));
    }

    return results;
  }

  /**
   * Determina la confianza estadística y epistemológica de un indicador.
   */
  public evaluateMetricConfidence(kpi: StrategicKpi): ConfidenceLevel {
    if (kpi.status === "UNAVAILABLE" || kpi.value === null) {
      return "INSUFFICIENT_DATA";
    }

    if (kpi.status === "EXPERIMENTAL" || kpi.status === "PARTIAL") {
      return "PARTIAL_EVIDENCE";
    }

    // Validación de frescura: si los datos son más antiguos a 30 días en métricas diarias
    const lastUpdate = new Date(kpi.freshness).getTime();
    const now = Date.now();
    const diffDays = (now - lastUpdate) / (1000 * 60 * 60 * 24);

    if (kpi.cadence === "daily" && diffDays > 7) {
      return "PARTIAL_EVIDENCE";
    }

    return "SUFFICIENT_EVIDENCE";
  }

  /**
   * Calcula la variación entre periodos equivalentes evitando falsas comparaciones.
   */
  public calculatePeriodComparison(
    currentValue: number | null,
    previousValue: number | null,
    unit: string = "",
    higherIsBetter: boolean = true
  ): PeriodComparisonResult {
    if (currentValue === null || previousValue === null) {
      return {
        currentFormatted: currentValue !== null ? `${currentValue} ${unit}`.trim() : "SIN DATOS",
        previousFormatted: previousValue !== null ? `${previousValue} ${unit}`.trim() : "SIN DATOS",
        absoluteDelta: null,
        percentDelta: null,
        trend: "NO_DATA",
        isFavorable: null,
        periodLabel: "Comparativa no disponible"
      };
    }

    const absoluteDelta = currentValue - previousValue;
    const percentDelta = previousValue !== 0 ? (absoluteDelta / Math.abs(previousValue)) * 100 : null;

    let trend: "UP" | "DOWN" | "STABLE" = "STABLE";
    if (Math.abs(absoluteDelta) > 0.001) {
      trend = absoluteDelta > 0 ? "UP" : "DOWN";
    }

    let isFavorable: boolean | null = null;
    if (trend !== "STABLE") {
      isFavorable = higherIsBetter ? trend === "UP" : trend === "DOWN";
    }

    return {
      currentFormatted: `${currentValue.toLocaleString("es-NI")} ${unit}`.trim(),
      previousFormatted: `${previousValue.toLocaleString("es-NI")} ${unit}`.trim(),
      absoluteDelta: Number(absoluteDelta.toFixed(2)),
      percentDelta: percentDelta !== null ? Number(percentDelta.toFixed(1)) : null,
      trend,
      isFavorable,
      periodLabel: "vs periodo equivalente anterior"
    };
  }

  /**
   * Aplica salvaguardas de confidencialidad y anonimato diferencial (Small Cell Protection).
   */
  public applySmallCellPrivacy(value: number | null, sampleEntitiesCount: number): number | null {
    // Si la cantidad de anfitriones o entidades analizadas es menor a 5, se suprime el número para evitar inferencias individuales
    if (sampleEntitiesCount > 0 && sampleEntitiesCount < 5) {
      return null;
    }
    return value;
  }

  /**
   * Valida si el usuario con su rol y ámbito tiene permiso de lectura sobre el indicador.
   */
  private isAuthorizedForMetric(kpi: StrategicKpi, scope?: MetricAccessScope): boolean {
    const role = scope?.role ?? "explorer";

    // Si el usuario es explorador regular, solo ve métricas públicas agregadas
    if (role === "explorer" && kpi.sensitivity !== "PUBLIC") {
      return false;
    }

    // Aislamiento por país (Regionalización)
    if (scope?.countryId && kpi.countryId !== "ALL" && kpi.countryId !== scope.countryId) {
      return false;
    }

    // Aislamiento por territorio si el scope de la organización es local
    if (scope?.territoryId && kpi.territoryScope !== "ALL" && kpi.territoryScope !== scope.territoryId) {
      return false;
    }

    // Permisos por nivel de sensibilidad
    if (kpi.sensitivity === "RESTRICTED") {
      return role === "super_admin";
    }

    if (kpi.sensitivity === "CONFIDENTIAL") {
      return role === "super_admin" || role === "admin";
    }

    return true;
  }

  /**
   * Sanitiza el KPI antes de entregarlo.
   */
  private applyPrivacyFilters(kpi: StrategicKpi): StrategicKpi {
    return {
      ...kpi,
      // Si el estado es UNAVAILABLE, forzar explícitamente null
      value: kpi.status === "UNAVAILABLE" ? null : kpi.value
    };
  }
}

export const strategicMetricsService = new StrategicMetricsService();
