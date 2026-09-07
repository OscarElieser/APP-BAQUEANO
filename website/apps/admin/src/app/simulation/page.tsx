// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SIMULATION LAB / WHAT-IF STUDIO (page.tsx)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer un entorno de simulación avanzado para que las autoridades y cooperativas
//   locales experimenten con escenarios hipotéticos ("What-If") sin riesgo operacional.
// - Evaluar el impacto de políticas de redistribución territorial ética: desviar flujo
//   desde atractivos saturados hacia cooperativas rurales con capacidad disponible.
// - Garantizar el aislamiento de datos: Los resultados son exclusivamente inmutables
//   y de solo lectura en memoria, sin escribir jamás sobre la base de producción.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Componente React interactivo con controles deslizantes (sliders), toggles de cierre
//   y cálculo determinístico en tiempo real a través de SimulationEngineService.
// - Banner obligatorio y permanente de MODO SIMULACIÓN en la parte superior.
// - Tabla de comparación multilateral entre Escenario Base y Escenarios Simulados.
//
// 📦 3. QUÉ (WHAT / COMPONENTES EXPUESTOS):
// - Banner de Modo Simulación.
// - Panel de Parámetros de Entrada (Demanda, Capacidad, Clima, Cierre de Senderos, Redistribución).
// - Matriz Comparativa de Resultados (Demanda Proyectada, Saturación, Alivio Comunitario).
// - Lista de Supuestos y Premisas Explícitas del Modelo.
// ============================================================================

"use client";

import { useMemo, useState } from "react";
import {
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Compass,
  FlaskConical,
  Layers,
  MapPin,
  RefreshCw,
  Share2,
  ShieldAlert,
  Sliders,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap
} from "lucide-react";

interface DestinationSimItem {
  readonly id: string;
  readonly name: string;
  readonly territory: string;
  readonly baselineDemand: number;
  readonly validatedCapacity: number;
  readonly alternativeId: string;
  readonly alternativeName: string;
}

const mockDestinations: DestinationSimItem[] = [
  {
    id: "canon-de-somoto",
    name: "Cañón de Somoto",
    territory: "Madriz",
    baselineDemand: 170,
    validatedCapacity: 200,
    alternativeId: "miraflor",
    alternativeName: "Reserva Miraflor (Estelí)"
  },
  {
    id: "cerro-negro",
    name: "Volcán Cerro Negro",
    territory: "León",
    baselineDemand: 230,
    validatedCapacity: 250,
    alternativeId: "volcan-telica",
    alternativeName: "Volcán Telica (León)"
  },
  {
    id: "isla-de-ometepe",
    name: "Isla de Ometepe",
    territory: "Rivas",
    baselineDemand: 340,
    validatedCapacity: 500,
    alternativeId: "archipielago-solentiname",
    alternativeName: "Solentiname (Río San Juan)"
  },
  {
    id: "cascada-la-luna",
    name: "Cascada La Luna",
    territory: "Jinotega",
    baselineDemand: 80,
    validatedCapacity: 180,
    alternativeId: "macizo-penhas-blancas",
    alternativeName: "Peñas Blancas (Matagalpa)"
  }
];

export default function SimulationLabPage() {
  // Parámetros de simulación
  const [demandMultiplier, setDemandMultiplier] = useState<number>(1.25); // +25%
  const [capacityMultiplier, setCapacityMultiplier] = useState<number>(1.0); // 100%
  const [somotoOpen, setSomotoOpen] = useState<boolean>(true);
  const [cerroNegroOpen, setCerroNegroOpen] = useState<boolean>(true);
  const [weatherDisruption, setWeatherDisruption] = useState<"NONE" | "MODERATE" | "SEVERE">("NONE");
  const [redistributionRate, setRedistributionRate] = useState<number>(15); // 15%

  // Cálculo de resultados simulados en tiempo real
  const simulationResult = useMemo(() => {
    let totalBaseDemand = 0;
    let totalSimDemand = 0;
    let totalBaseCapacity = 0;
    let totalSimCapacity = 0;
    let totalDivertedVisitors = 0;

    const destinationBreakdown = mockDestinations.map((d) => {
      totalBaseDemand += d.baselineDemand;
      totalBaseCapacity += d.validatedCapacity;

      const isAvailable =
        (d.id === "canon-de-somoto" ? somotoOpen : true) &&
        (d.id === "cerro-negro" ? cerroNegroOpen : true);

      let effectiveCapacity = isAvailable ? Math.round(d.validatedCapacity * capacityMultiplier) : 0;
      let simDemand = d.baselineDemand * demandMultiplier;

      if (weatherDisruption === "SEVERE") simDemand *= 0.6;
      else if (weatherDisruption === "MODERATE") simDemand *= 0.85;

      let diverted = 0;
      if ((!isAvailable || simDemand > effectiveCapacity) && redistributionRate > 0) {
        diverted = Math.round(simDemand * (redistributionRate / 100));
        totalDivertedVisitors += diverted;
        simDemand -= diverted;
      }

      totalSimDemand += simDemand;
      totalSimCapacity += effectiveCapacity;

      const util = effectiveCapacity > 0 ? Math.round((simDemand / effectiveCapacity) * 100) : 100;

      return {
        ...d,
        isAvailable,
        effectiveCapacity,
        simDemand: Math.round(simDemand),
        diverted,
        util
      };
    });

    const baseUtilization =
      totalBaseCapacity > 0 ? Math.round((totalBaseDemand / totalBaseCapacity) * 100) : 0;
    const simUtilization =
      totalSimCapacity > 0 ? Math.round((totalSimDemand / totalSimCapacity) * 100) : 100;

    return {
      baseDemand: totalBaseDemand,
      simDemand: Math.round(totalSimDemand),
      baseCapacity: totalBaseCapacity,
      simCapacity: totalSimCapacity,
      baseUtilization,
      simUtilization,
      totalDivertedVisitors,
      destinationBreakdown
    };
  }, [demandMultiplier, capacityMultiplier, somotoOpen, cerroNegroOpen, weatherDisruption, redistributionRate]);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto text-slate-100">
      {/* BANNER INMUTABLE DE MODO SIMULACIÓN */}
      <div className="p-4 md:p-5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/50 backdrop-blur-md flex items-center justify-between gap-4 shadow-lg shadow-amber-950/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <FlaskConical className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="text-base font-black text-amber-300 font-mono tracking-wide uppercase flex items-center gap-2">
              MODO SIMULACIÓN ACTIVO — DATOS HIPOTÉTICOS
            </div>
            <p className="text-xs text-amber-200/80 mt-0.5">
              Este entorno no modifica el estado real de reservas, disponibilidad ni capacidades comunitarias. Los cálculos se realizan estrictamente en memoria para apoyo a la toma de decisiones.
            </p>
          </div>
        </div>

        <span className="hidden md:inline-flex px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold">
          Read-Only Sandbox
        </span>
      </div>

      {/* HEADER DE PÁGINA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Sliders className="h-8 w-8 text-cyan-400" />
            Simulation Lab (What-If Studio)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Simulador de escenarios de saturación, contingencias climáticas y redistribución territorial.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setDemandMultiplier(1.0);
              setCapacityMultiplier(1.0);
              setSomotoOpen(true);
              setCerroNegroOpen(true);
              setWeatherDisruption("NONE");
              setRedistributionRate(0);
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Restablecer a Línea Base
          </button>
        </div>
      </div>

      {/* PANEL DE CONTROL DE PARÁMETROS & RESULTADOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMNA 1: CONTROLES DE ENTRADA (WHAT-IF) */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-[#F65E01]" />
              Parámetros del Escenario
            </h2>
            <span className="text-[11px] font-mono text-cyan-400">Interactivos</span>
          </div>

          {/* 1. Multiplicador de Demanda */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">Variación de Demanda:</span>
              <span className="font-mono font-bold text-cyan-400">
                {demandMultiplier >= 1 ? `+${Math.round((demandMultiplier - 1) * 100)}%` : `${Math.round((demandMultiplier - 1) * 100)}%`}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={demandMultiplier}
              onChange={(e) => setDemandMultiplier(parseFloat(e.target.value))}
              className="w-full accent-[#F65E01] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-50% (Baja)</span>
              <span>Línea Base</span>
              <span>+100% (Pico Extremo)</span>
            </div>
          </div>

          {/* 2. Tasa de Redistribución Ética */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">Desvío Solidario a Cooperativas:</span>
              <span className="font-mono font-bold text-emerald-400">{redistributionRate}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={redistributionRate}
              onChange={(e) => setRedistributionRate(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              Redirige interés de destinos saturados hacia cooperativas rurales cercanas.
            </p>
          </div>

          {/* 3. Disponibilidad de Destinos Insigne */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <span className="text-xs font-medium text-slate-300 block">Disponibilidad de Rutas:</span>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
              <span className="text-xs text-slate-300">Cañón de Somoto</span>
              <input
                type="checkbox"
                checked={somotoOpen}
                onChange={(e) => setSomotoOpen(e.target.checked)}
                className="rounded accent-cyan-500 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
              <span className="text-xs text-slate-300">Volcán Cerro Negro</span>
              <input
                type="checkbox"
                checked={cerroNegroOpen}
                onChange={(e) => setCerroNegroOpen(e.target.checked)}
                className="rounded accent-cyan-500 h-4 w-4"
              />
            </label>
          </div>

          {/* 4. Disrupción Climática */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <span className="text-xs font-medium text-slate-300 block">Condición Meteorológica:</span>
            <div className="grid grid-cols-3 gap-2">
              {(["NONE", "MODERATE", "SEVERE"] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setWeatherDisruption(w)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    weatherDisruption === w
                      ? "bg-[#165D6F] text-white border border-cyan-500/40"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {w === "NONE" ? "Normal" : w === "MODERATE" ? "Lluvias" : "Temporal"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA 2 & 3: MATRIZ DE COMPARACIÓN DE RESULTADOS */}
        <div className="lg:col-span-2 space-y-6">
          {/* TARJETAS COMPARATIVAS DE ALTO NIVEL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
              <div className="text-xs text-slate-400 mb-1">Demanda Proyectada Total</div>
              <div className="text-2xl font-black text-cyan-400 font-mono">
                {simulationResult.simDemand} pts
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Línea Base: {simulationResult.baseDemand} pts
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
              <div className="text-xs text-slate-400 mb-1">Ocupación de Capacidad</div>
              <div
                className={`text-2xl font-black font-mono ${
                  simulationResult.simUtilization >= 90
                    ? "text-rose-400"
                    : simulationResult.simUtilization >= 75
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {simulationResult.simUtilization}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Línea Base: {simulationResult.baseUtilization}%
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
              <div className="text-xs text-slate-400 mb-1">Alivio a Cooperativas</div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                +{simulationResult.totalDivertedVisitors} viajeros
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Redistribución comunitaria</div>
            </div>
          </div>

          {/* DESGLOSE POR DESTINO EN SIMULACIÓN */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-cyan-400" />
              Impacto por Destino en el Escenario Simulado
            </h2>

            <div className="space-y-3">
              {simulationResult.destinationBreakdown.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{item.name}</span>
                      <span className="text-xs text-slate-400 font-mono">({item.territory})</span>
                      {!item.isAvailable && (
                        <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/40 text-rose-400 text-[10px] font-mono">
                          CERRADO
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-1">
                      Demanda: {item.simDemand} pts | Capacidad: {item.effectiveCapacity} pers/día
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {item.diverted > 0 && (
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-400 block font-mono">
                          → Desviado: {item.diverted} pts
                        </span>
                        <span className="text-[10px] text-slate-500">{item.alternativeName}</span>
                      </div>
                    )}

                    <div className="text-right w-24">
                      <div className="text-xs font-mono font-bold text-slate-200">
                        {item.util}% Uso
                      </div>
                      <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full ${
                            item.util >= 90
                              ? "bg-rose-500"
                              : item.util >= 75
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(100, item.util)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SUPUESTOS Y PREMISAS VISIBLES */}
          <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 text-xs space-y-2">
            <span className="font-bold text-slate-300 font-mono uppercase tracking-wider block">
              Supuestos Explícitos del Escenario:
            </span>
            <ul className="list-disc list-inside text-slate-400 space-y-1">
              <li>El multiplicador de demanda ({demandMultiplier}x) se aplica uniformemente sobre los registros base.</li>
              <li>La redistribución comunitaria ({redistributionRate}%) solo se activa cuando un destino excede su umbral de capacidad o está cerrado.</li>
              <li>No se generan alertas automáticas ni se alteran precios ni cupos en el backend transaccional.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
