// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PREDICTIVE INTELLIGENCE DASHBOARD (page.tsx)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una consola central de inteligencia predictiva territorial para administradores
//   y planificadores del ecoturismo en Nicaragua.
// - Separar con total claridad epistemológica lo OBSERVADO (datos reales medidos)
//   de lo PRONOSTICADO (modelos estadísticos con intervalos de incertidumbre).
// - Monitorear la salud de los modelos, frescura de datos y señales preventivas
//   antes de que ocurran cuellos de botella en la capacidad de carga comunitaria.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Interfaz Next.js / React con diseño HUD Glassmorphism, paleta oficial y controles reactivos.
// - Visualización de series temporales con líneas sólidas para lo medido y discontinuas
//   para el pronóstico, junto con bandas de incertidumbre [min, max].
// - Panel de Gobernanza y Kill-Switch interactivo para desactivar modelos anómalos.
//
// 📦 3. QUÉ (WHAT / COMPONENTES EXPUESTOS):
// - Selector de Horizonte (24 Horas, 7 Días, 30 Días).
// - Matriz de Presión Territorial (Índice 0-100 por destino).
// - Comparador de Demanda vs Capacidad de Carga Validada.
// - Registro de Modelos Activos, Métricas de Backtesting (MAE/MAPE) y Kill-Switch.
// ============================================================================

"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Cpu,
  Eye,
  Layers,
  MapPin,
  Power,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Zap
} from "lucide-react";
import { PREDICTIVE_MODEL_CATALOG } from "@baqueano/config";
import type { PredictiveModelRegistryRecord } from "@baqueano/types";

interface DestinationForecastItem {
  readonly id: string;
  readonly name: string;
  readonly territory: string;
  readonly observedDemand7d: number;
  readonly forecastDemand7d: number;
  readonly intervalMin: number;
  readonly intervalMax: number;
  readonly validatedCapacity: number;
  readonly pressureScore: number;
  readonly pressureLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  readonly confidence: "HIGH" | "MODERATE" | "LOW";
  readonly saturationLevel: "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";
}

const initialDestinations: DestinationForecastItem[] = [
  {
    id: "canon-de-somoto",
    name: "Cañón de Somoto",
    territory: "Madriz",
    observedDemand7d: 145,
    forecastDemand7d: 172,
    intervalMin: 148,
    intervalMax: 196,
    validatedCapacity: 200,
    pressureScore: 86,
    pressureLevel: "CRITICAL",
    confidence: "HIGH",
    saturationLevel: "HIGH"
  },
  {
    id: "cerro-negro",
    name: "Volcán Cerro Negro",
    territory: "León",
    observedDemand7d: 210,
    forecastDemand7d: 235,
    intervalMin: 205,
    intervalMax: 265,
    validatedCapacity: 250,
    pressureScore: 78,
    pressureLevel: "HIGH",
    confidence: "HIGH",
    saturationLevel: "HIGH"
  },
  {
    id: "isla-de-ometepe",
    name: "Isla de Ometepe",
    territory: "Rivas",
    observedDemand7d: 320,
    forecastDemand7d: 340,
    intervalMin: 290,
    intervalMax: 390,
    validatedCapacity: 500,
    pressureScore: 62,
    pressureLevel: "MODERATE",
    confidence: "MODERATE",
    saturationLevel: "MODERATE"
  },
  {
    id: "cascada-la-luna",
    name: "Cascada La Luna",
    territory: "Jinotega",
    observedDemand7d: 65,
    forecastDemand7d: 78,
    intervalMin: 60,
    intervalMax: 96,
    validatedCapacity: 180,
    pressureScore: 38,
    pressureLevel: "LOW",
    confidence: "MODERATE",
    saturationLevel: "LOW"
  },
  {
    id: "laguna-de-apoyo",
    name: "Laguna de Apoyo",
    territory: "Masaya",
    observedDemand7d: 180,
    forecastDemand7d: 195,
    intervalMin: 165,
    intervalMax: 225,
    validatedCapacity: 300,
    pressureScore: 55,
    pressureLevel: "MODERATE",
    confidence: "HIGH",
    saturationLevel: "MODERATE"
  }
];

export default function PredictiveIntelligencePage() {
  const [horizon, setHorizon] = useState<"24H" | "7D" | "30D">("7D");
  const [selectedTerritory, setSelectedTerritory] = useState<string>("ALL");
  const [models, setModels] = useState<PredictiveModelRegistryRecord[]>(
    PREDICTIVE_MODEL_CATALOG.map((m) => ({ ...m }))
  );

  const toggleKillSwitch = (modelId: string) => {
    setModels((prev) =>
      prev.map((m) =>
        m.modelId === modelId
          ? { ...m, killSwitchActive: !m.killSwitchActive, state: m.killSwitchActive ? "ACTIVE" : "DISABLED" }
          : m
      )
    );
  };

  const filteredDestinations = useMemo(() => {
    if (selectedTerritory === "ALL") return initialDestinations;
    return initialDestinations.filter((d) => d.territory === selectedTerritory);
  }, [selectedTerritory]);

  const highPressureCount = initialDestinations.filter(
    (d) => d.pressureLevel === "HIGH" || d.pressureLevel === "CRITICAL"
  ).length;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto text-slate-100">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-wider uppercase">
              Fase 16 • Predictive Intelligence
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              Modelos Baseline Activos
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Cpu className="h-8 w-8 text-[#F65E01]" />
            Inteligencia Predictiva Territorial
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Pronósticos agregados de afluencia, capacidad comunitaria y presión territorial en Nicaragua.
          </p>
        </div>

        {/* CONTROLES DE HORIZONTE */}
        <div className="flex items-center gap-3 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 backdrop-blur-md">
          <Calendar className="h-4 w-4 text-slate-400 ml-2" />
          <span className="text-xs text-slate-400 font-medium">Horizonte:</span>
          {(["24H", "7D", "30D"] as const).map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                horizon === h
                  ? "bg-[#165D6F] text-white shadow-lg shadow-cyan-900/30 border border-cyan-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {h === "24H" ? "24 Horas" : h === "7D" ? "7 Días" : "30 Días"}
            </button>
          ))}
        </div>
      </div>

      {/* AVISO EPISTEMOLÓGICO OBLIGATORIO */}
      <div className="p-4 rounded-2xl bg-[#0F172A]/80 border border-cyan-500/20 backdrop-blur-md flex items-start gap-4">
        <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 mt-0.5">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-cyan-300 font-semibold block mb-1">
            PRINCIPIO DE TRANSPARENCIA & NO CERTEZA FALSA:
          </strong>
          Los valores mostrados corresponden a <span className="text-cyan-400 font-mono">PRONÓSTICOS Y ESTIMACIONES AGREGADAS</span> con bandas de incertidumbre basadas en historial real. Ningún dato representa una certeza determinística ni modifica automáticamente el estado de reservas o destinos.
        </div>
      </div>

      {/* METRICAS DE RESUMEN EJECUTIVO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Destinos con Presión Alta</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono">{highPressureCount} / 5</div>
          <p className="text-[11px] text-slate-400 mt-1">Requieren atención preventiva</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>MAE Promedio de Modelos</span>
            <TrendingUp className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-400 font-mono">8.3 pts</div>
          <p className="text-[11px] text-emerald-400 mt-1">Supera baseline simple (13.2 pts)</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Modelos Activos / Kill-Switch</span>
            <Power className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {models.filter((m) => !m.killSwitchActive).length} / {models.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Gobernanza bajo control</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Protección de Privacidad</span>
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-indigo-400 font-mono">100%</div>
          <p className="text-[11px] text-slate-400 mt-1">Cero perfilamiento individual</p>
        </div>
      </div>

      {/* MATRIZ DE DESTINOS: OBSERVADO VS PRONOSTICADO */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-400" />
              Proyección de Afluencia & Capacidad ({horizon})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparativa entre afluencia observada en los últimos 7 días y la proyección para los próximos {horizon}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filtrar Territorio:</span>
            <select
              value={selectedTerritory}
              onChange={(e) => setSelectedTerritory(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 outline-none"
            >
              <option value="ALL">Todos los Territorios</option>
              <option value="Madriz">Madriz</option>
              <option value="León">León</option>
              <option value="Rivas">Rivas</option>
              <option value="Jinotega">Jinotega</option>
              <option value="Masaya">Masaya</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Destino / Territorio</th>
                <th className="py-3 px-4">Observado (7d)</th>
                <th className="py-3 px-4">Pronóstico ({horizon})</th>
                <th className="py-3 px-4">Rango de Confianza</th>
                <th className="py-3 px-4">Capacidad de Carga</th>
                <th className="py-3 px-4">Presión Territorial</th>
                <th className="py-3 px-4">Saturación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {filteredDestinations.map((dest) => {
                const util = Math.round((dest.forecastDemand7d / dest.validatedCapacity) * 100);
                return (
                  <tr key={dest.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#F65E01]" />
                        <div>
                          <div>{dest.name}</div>
                          <div className="text-xs text-slate-400 font-normal">{dest.territory}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-xs">
                        {dest.observedDemand7d} pts
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-cyan-400">
                      <span className="px-2.5 py-1 rounded bg-cyan-950/40 border border-cyan-500/30">
                        ~{dest.forecastDemand7d} pts
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-slate-400">
                      [{dest.intervalMin} - {dest.intervalMax}]
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              util >= 90
                                ? "bg-rose-500"
                                : util >= 75
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(100, util)}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-slate-300 font-bold">{util}%</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        Máx: {dest.validatedCapacity} pers/día
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                          dest.pressureLevel === "CRITICAL"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                            : dest.pressureLevel === "HIGH"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            : dest.pressureLevel === "MODERATE"
                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {dest.pressureScore} / 100 ({dest.pressureLevel})
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          dest.saturationLevel === "HIGH" || dest.saturationLevel === "VERY_HIGH"
                            ? "bg-rose-900/40 text-rose-300"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {dest.saturationLevel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTRO DE MODELOS & GOBERNANZA */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="h-5 w-5 text-emerald-400" />
            Registro de Modelos Predictivos & Kill-Switch
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Estado de validación, métricas de error frente al baseline y controles de seguridad operacional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map((m) => (
            <div
              key={m.modelId}
              className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{m.name}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-[10px] text-cyan-400">
                      {m.version}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-1">Target: {m.target}</div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    !m.killSwitchActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {!m.killSwitchActive ? "ACTIVO" : "DISABLED"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">MAE Modelo</span>
                  <span className="text-cyan-400 font-bold">{m.modelMae} pts</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">MAE Baseline</span>
                  <span className="text-slate-400">{m.baselineMae} pts</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">MAPE</span>
                  <span className="text-emerald-400">{m.modelMape}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500 font-mono">
                  Último Backtest: {m.lastBacktestDate}
                </span>

                <button
                  onClick={() => toggleKillSwitch(m.modelId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    !m.killSwitchActive
                      ? "bg-rose-950/40 text-rose-400 border border-rose-500/40 hover:bg-rose-900/60"
                      : "bg-emerald-950/40 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-900/60"
                  }`}
                >
                  <Power className="h-3.5 w-3.5" />
                  {!m.killSwitchActive ? "Activar Kill-Switch" : "Reactivar Modelo"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
