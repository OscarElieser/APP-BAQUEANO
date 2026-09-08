// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MOTOR DE SEÑALES ESTRATÉGICAS (strategic-signals.service.ts)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Detectar patrones emergentes, riesgos de capacidad y oportunidades de cobertura
//   territorial antes de que se conviertan en crisis operativas.
// - Mantener una distinción categórica:
//   * INCIDENTE OPERACIONAL (Fase 9): Algo técnico o de soporte está fallando en tiempo real.
//   * SEÑAL ESTRATÉGICA (Fase 19): Una tendencia o patrón que amerita análisis o deliberación humana.
// - Evitar la "Fatiga de Alertas" (Alarm Fatigue) priorizando solo señales con severidad
//   justificada (INFORMATIONAL, ATTENTION, HIGH) y respaldo de datos medibles o proyectados.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Heuristic Signal Engine: Cruza deltas de demanda, tasas de saturación de capacidad,
//   frescura de auditorías de confianza y vacíos de documentación geoespacial.
// - Action Options: Cada señal incluye opciones de acción sugeridas (Monitor, Investigate,
//   Run Simulation, Review Territory) sin ejecutar acciones coercitivas o automáticas.
//
// 📦 3. QUÉ (WHAT / MÉTODOS EXPUESTOS):
// - getActiveSignals(): Devuelve las señales activas con filtro por territorio o país.
// - evaluateSignalThresholds(): Evalúa reglas sobre el ecosistema y genera nuevas señales.
// - acknowledgeSignal(): Permite al tomador de decisiones marcar una señal como revisada o resuelta.
// ============================================================================

import {
  type SignalSeverity,
  type SignalSource,
  type SignalType,
  type StrategicSignal
} from "@baqueano/types";
import { STRATEGIC_SIGNAL_DEFINITIONS } from "@baqueano/config";

export interface SignalFilterScope {
  readonly countryId?: string;
  readonly territoryId?: string;
  readonly severity?: SignalSeverity;
  readonly type?: SignalType;
}

export class StrategicSignalsService {
  private signals: Map<string, StrategicSignal> = new Map();

  constructor(customSignals?: readonly StrategicSignal[]) {
    const seed = customSignals ?? STRATEGIC_SIGNAL_DEFINITIONS;
    for (const signal of seed) {
      this.signals.set(signal.signalId, signal);
    }
  }

  /**
   * Obtiene la lista de señales estratégicas activas bajo un ámbito dado.
   */
  public getActiveSignals(scope?: SignalFilterScope): readonly StrategicSignal[] {
    const list: StrategicSignal[] = [];

    for (const signal of this.signals.values()) {
      if (signal.status === "ARCHIVED" || signal.status === "RESOLVED") continue;

      if (scope?.countryId && signal.scope.countryId !== scope.countryId) continue;
      if (scope?.territoryId && signal.scope.territoryId && signal.scope.territoryId !== scope.territoryId) continue;
      if (scope?.severity && signal.severity !== scope.severity) continue;
      if (scope?.type && signal.type !== scope.type) continue;

      list.push(signal);
    }

    // Ordenar por severidad: HIGH primero, luego ATTENTION, luego INFORMATIONAL
    const severityWeight: Record<SignalSeverity, number> = {
      HIGH: 3,
      ATTENTION: 2,
      INFORMATIONAL: 1
    };

    return list.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity]);
  }

  /**
   * Evalúa condiciones del sistema para sintetizar señales estratégicas deterministas.
   */
  public evaluateSignal(params: {
    readonly signalId: string;
    readonly type: SignalType;
    readonly title: string;
    readonly scope: { territoryId?: string; destinationId?: string; countryId: string; corridorId?: string };
    readonly severity: SignalSeverity;
    readonly source: SignalSource;
    readonly evidence: { metricRef?: string; metricName?: string; currentValue?: number | string | null; threshold?: number | string; details: string };
    readonly implications: readonly string[];
    readonly options: readonly { id: string; label: string; actionType: "MONITOR" | "INVESTIGATE" | "RUN_SIMULATION" | "REVIEW_TERRITORY" | "MANUAL_NOTE" }[];
  }): StrategicSignal {
    const signal: StrategicSignal = {
      ...params,
      observedAt: new Date().toISOString(),
      status: "ACTIVE"
    };

    this.signals.set(signal.signalId, signal);
    return signal;
  }

  /**
   * Actualiza el estado de una señal por parte de un operador estratégico humano.
   */
  public updateSignalStatus(
    signalId: string,
    status: "ACTIVE" | "REVIEWED" | "RESOLVED" | "ARCHIVED"
  ): boolean {
    const existing = this.signals.get(signalId);
    if (!existing) return false;

    this.signals.set(signalId, {
      ...existing,
      status
    });

    return true;
  }
}

export const strategicSignalsService = new StrategicSignalsService();
