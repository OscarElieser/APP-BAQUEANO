// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SALA DE ESCENARIOS (SCENARIO ROOM) (page.tsx)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer un simulador interactivo ("What-If Studio") para modelar hipótesis de
//   crecimiento de demanda, restricciones viales y redistribución de visitantes en Nicaragua.
// - Garantizar que la simulación sea una herramienta de deliberación reflexiva y NUNCA
//   un sustituto del mundo real ni una predicción garantizada.
// - Inmutabilidad estricta: Las simulaciones corren en memoria aislada y jamás alteran
//   las colecciones transaccionales de la base de datos real.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Banner Prominente de Modo Simulación ("MODO SIMULACIÓN ACTIVO").
// - Controles reactivos de elasticidad: Multiplicador de Demanda (0.5x - 2.0x), Capacidad
//   disponible (0.5x - 1.5x) y Porcentaje de Desvío hacia circuitos rurales (0% - 40%).
// - Comparador en tiempo real de Línea Base vs Escenario Simulado.
//
// 📦 3. QUÉ (WHAT / COMPONENTES EXPUESTOS):
// - Controles de Parámetros de Simulación.
// - Comparador de Deltas (Demanda, Alivio de Presión, Ganancia Comunitaria).
// - Sugerencias de Rutas de Desvío Alternativo.
// ============================================================================

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BarChart2,
  CheckCircle2,
  Cpu,
  Info,
  Layers,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Zap
} from "lucide-react";
import { scenarioPlanningService } from "../../../../../../apps/web/src/services/strategic/scenario-planning.service";

export default function StrategicScenarioRoomPage() {
  const [demandMultiplier, setDemandMultiplier] = useState<number>(1.25); // +25%
  const [capacityMultiplier, setCapacityMultiplier] = useState<number>(1.0); // 100%
  const [redistributionPercent, setRedistributionPercent] = useState<number>(20); // 20%
  const [routeClosureActive, setRouteClosureActive] = useState<boolean>(false);

  const simulationComparison = useMemo(() => {
    return scenarioPlanningService.compareStrategicScenario({
      scenarioId: "scen-custom-interactive",
      name: "Escenario Personalizado de Planificación",
      description: "Evaluación interactiva de sensibilidad territorial y capacidad comunitaria.",
      demandMultiplier,
      capacityMultiplier,
      redistributionPercent,
      affectedTerritories: ["Leon", "Masaya", "Rivas", "Matagalpa"],
      routeClosureActive
    });
  }, [demandMultiplier, capacityMultiplier, redistributionPercent, routeClosureActive]);

  const handleReset = () => {
    setDemandMultiplier(1.0);
    setCapacityMultiplier(1.0);
    setRedistributionPercent(10);
    setRouteClosureActive(false);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* BANNER PROMINENTE DE MODO SIMULACIÓN */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-purple-500/50 bg-gradient-to-r from-purple-950/60 via-[#07131f] to-purple-900/30 p-6 shadow-2xl backdrop-blur">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/30 border border-purple-400/40 text-purple-300">
              <Sparkles size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-purple-500/20 px-2 py-0.5 font-tech text-xs font-bold uppercase tracking-wider text-purple-300">
                  MODO SIMULACIÓN ACTIVO &middot; WHAT-IF STUDIO
                </span>
                <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                  Aislamiento Estricto
                </span>
              </div>
              <h1 className="mt-1 font-display text-xl font-black text-white sm:text-2xl">
                Sala de Escenarios Estratégicos
              </h1>
            </div>
          </div>

          <Link
            href="/strategic"
            className="focus-ring inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20"
          >
            <ArrowLeft size={16} /> Volver al Cockpit
          </Link>
        </div>
        <p className="mt-3 text-xs text-purple-200/80 leading-relaxed">
          Los escenarios aquí generados son hipótesis de trabajo contrafactuales. No alteran ni modifican
          en ningún momento las reservas, destinos o parámetros reales en producción.
        </p>
      </div>

      {/* CONTROLES INTERACTIVOS DE SENSIBILIDAD */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#07131f]/90 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="font-display text-base font-bold text-white">Parámetros de Hipótesis</h2>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-[11px] font-semibold text-white/60 hover:text-white"
            >
              <RotateCcw size={12} /> Restablecer
            </button>
          </div>

          {/* CONTROL: MULTIPLICADOR DE DEMANDA */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Multiplicador de Demanda:</span>
              <span className="font-mono font-bold text-[#F65E01]">
                {demandMultiplier >= 1 ? `+${((demandMultiplier - 1) * 100).toFixed(0)}%` : `-${((1 - demandMultiplier) * 100).toFixed(0)}%`} ({demandMultiplier}x)
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={demandMultiplier}
              onChange={(e) => setDemandMultiplier(parseFloat(e.target.value))}
              className="w-full accent-[#F65E01]"
            />
            <p className="text-[10px] text-white/50">Simula incremento o caída de interés en plataformas digitales.</p>
          </div>

          {/* CONTROL: CAPACIDAD DISPONIBLE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Capacidad de Operadores:</span>
              <span className="font-mono font-bold text-[#10B981]">
                {((capacityMultiplier) * 100).toFixed(0)}% ({capacityMultiplier}x)
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={capacityMultiplier}
              onChange={(e) => setCapacityMultiplier(parseFloat(e.target.value))}
              className="w-full accent-[#10B981]"
            />
            <p className="text-[10px] text-white/50">Ajusta disponibilidad de guías, transporte y alojamiento local.</p>
          </div>

          {/* CONTROL: REDISTRIBUCIÓN HACIA CIRCUITOS COMUNITARIOS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Redistribución Comunitaria:</span>
              <span className="font-mono font-bold text-purple-400">{redistributionPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={redistributionPercent}
              onChange={(e) => setRedistributionPercent(parseInt(e.target.value, 10))}
              className="w-full accent-purple-400"
            />
            <p className="text-[10px] text-white/50">Porcentaje de tráfico derivado hacia micro-cooperativas y circuitos rurales.</p>
          </div>

          {/* TOGGLE: CIERRE VIAL O CLIMÁTICO */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-3">
            <div>
              <span className="text-xs font-bold text-white">Restricción Vial Temporal</span>
              <p className="text-[10px] text-white/50">Simular bloqueo o reparación en tramo sur</p>
            </div>
            <button
              onClick={() => setRouteClosureActive(!routeClosureActive)}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
                routeClosureActive ? "bg-red-500 text-white" : "bg-white/10 text-white/60"
              }`}
            >
              {routeClosureActive ? "ACTIVO" : "INACTIVO"}
            </button>
          </div>
        </div>

        {/* COMPARADOR DE RESULTADOS: BASELINE VS SIMULADO */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#07131f]/90 p-6 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="font-display text-base font-bold text-white">Comparativa de Impacto</h2>
              <span className="rounded bg-purple-500/20 px-2.5 py-0.5 font-tech text-xs font-bold text-purple-300">
                DELTA DE SENSIBILIDAD
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {/* DEMANDA PROYECTADA */}
              <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-1">
                <span className="text-[11px] text-white/60">Demanda Total Mensual</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl font-black text-white">
                    {simulationComparison.simulatedMetrics.explorations.toLocaleString("es-NI")}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      simulationComparison.deltas.explorationsDeltaPercent >= 0 ? "text-[#F65E01]" : "text-emerald-400"
                    }`}
                  >
                    {simulationComparison.deltas.explorationsDeltaPercent > 0 ? "+" : ""}
                    {simulationComparison.deltas.explorationsDeltaPercent}%
                  </span>
                </div>
                <p className="text-[10px] text-white/40">Base real: {simulationComparison.baselineMetrics.explorations.toLocaleString("es-NI")}</p>
              </div>

              {/* ALERTAS DE CAPACIDAD DE CARGA */}
              <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-1">
                <span className="text-[11px] text-white/60">Destinos con Presión Alta</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl font-black text-purple-300">
                    {simulationComparison.simulatedMetrics.capacityPressureAlerts}
                  </span>
                  <span className="text-xs font-bold text-white/60">
                    ({simulationComparison.deltas.pressureAlertsDelta >= 0 ? "+" : ""}
                    {simulationComparison.deltas.pressureAlertsDelta} vs base)
                  </span>
                </div>
                <p className="text-[10px] text-white/40">Base real: {simulationComparison.baselineMetrics.capacityPressureAlerts} destinos</p>
              </div>

              {/* TASA DE RESPUESTA ESTIMADA */}
              <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-1">
                <span className="text-[11px] text-white/60">Respuesta de Anfitriones</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl font-black text-[#10B981]">
                    {simulationComparison.simulatedMetrics.hostResponseRate}%
                  </span>
                </div>
                <p className="text-[10px] text-white/40">Base real: {simulationComparison.baselineMetrics.hostResponseRate}%</p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-purple-500/20 bg-purple-950/20 p-4 text-xs leading-relaxed text-purple-200">
              <strong className="text-white">Dictamen de Simulación: </strong>
              {simulationComparison.hypothesisNarrative}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
            <span className="font-bold text-white">Recomendación para Políticas Públicas y Comunitarias:</span> Si se prevé un shock de demanda mayor al 20%, activar de forma prioritaria el programa de redistribución comunitaria en plataformas de difusión para evitar la degradación de senderos naturales.
          </div>
        </div>
      </div>
    </div>
  );
}
