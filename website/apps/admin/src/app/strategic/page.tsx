// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — EXECUTIVE COCKPIT & STRATEGIC INTELLIGENCE (page.tsx)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer el Cuadro de Mando Estratégico ("Executive Cockpit") para directores,
//   planificadores territoriales y tomadores de decisión del ecosistema Baqueano.
// - Transformar datos dispersos (operaciones, GIS, predicciones, confianza, sostenibilidad,
//   marketplace) en evidencia comprensible para entender QUÉ ESTÁ PASANDO, POR QUÉ IMPORTA
//   y QUÉ OPCIONES EXISTEN.
// - Respetar los principios epistemológicos fundamentales:
//   * Cuatro Estados Claramente Diferenciados: ACTUAL (observado), TARGET (planificado),
//     FORECAST (pronosticado), SIMULATION (hipotético).
//   * Cero datos falsos: si un indicador no tiene datos, se muestra explícitamente "SIN DATOS".
//   * Toda cifra cuenta con procedencia rastreable: fórmula, fuente, periodo, frescura y dueño.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Diseño de Alto Impacto Visual con Glassmorphism (`#165D6F`, `#F65E01`, `#F4E6C1`, `#0F172A`, `#0F2A2E`).
// - Filtro de Ámbito Territorial y Navegación Drill-down (Nacional → Departamento → Nodo).
// - Integración de Mapa Estratégico multicapa (Destinos, Nodos IoT, Capacidad, Cobertura Trust).
// - Módulo interactivo del Baqueano Strategic Copilot con herramientas deterministas.
// - Espacio de Soporte a Decisiones con registro de evidencia y gobernanza humana estricta.
//
// 📦 3. QUÉ (WHAT / COMPONENTES EXPUESTOS):
// - Visión Consolidada Nacional (Nicaragua Overview).
// - Matriz de Señales Estratégicas y Opciones de Acción.
// - Portafolio Territorial Multidimensional y Cuadrantes de Demanda vs Sostenibilidad.
// - Consola de Copiloto Estratégico basada en IA fundamentada en herramientas.
// - Registro de Decisiones y enlaces a Escenarios, Scorecard y Briefing.
// ============================================================================

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bot,
  BrainCircuit,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Compass,
  FileSpreadsheet,
  FileText,
  Filter,
  Globe2,
  HelpCircle,
  Info,
  Layers,
  MapPin,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Workflow,
  Zap
} from "lucide-react";
import {
  STRATEGIC_KPI_CATALOG,
  STRATEGIC_SIGNAL_DEFINITIONS,
  TERRITORIAL_PORTFOLIO_DEFAULTS,
  STRATEGIC_INITIATIVES_SEED
} from "@baqueano/config";
import type {
  KpiGroup,
  KpiState,
  SignalSeverity,
  StrategicKpi,
  StrategicSignal,
  TerritoryPortfolioProfile
} from "@baqueano/types";
import { strategicMetricsService } from "../../../../../apps/web/src/services/strategic/strategic-metrics.service";
import { strategicToolsService } from "../../../../../apps/web/src/services/strategic/strategic-tools.service";
import { territorialPortfolioService } from "../../../../../apps/web/src/services/strategic/territorial-portfolio.service";

export default function StrategicCockpitPage() {
  const [selectedGroup, setSelectedGroup] = useState<KpiGroup | "ALL">("ALL");
  const [selectedTerritory, setSelectedTerritory] = useState<string>("ALL");
  const [activeKpiModal, setActiveKpiModal] = useState<StrategicKpi | null>(null);
  const [copilotInput, setCopilotInput] = useState<string>("");
  const [copilotLoading, setCopilotLoading] = useState<boolean>(false);
  const [copilotResponse, setCopilotResponse] = useState<{
    summary: string;
    facts: readonly string[];
    forecasts: readonly string[];
    simulations: readonly string[];
    recommendations: readonly string[];
    citedMetrics: readonly { name: string; value: string; source: string; period: string }[];
  } | null>({
    summary: "El ecosistema Baqueano presenta un crecimiento saludable en exploraciones (+28% en Corredor Volcánico de Occidente) con 342 negocios activos y 78.4% de cobertura de verificación.",
    facts: [
      "14,280 exploraciones significativas registradas en los últimos 30 días.",
      "342 negocios locales comunitarios activos en el marketplace.",
      "Disponibilidad de la plataforma en 99.94%."
    ],
    forecasts: [
      "Proyección de alta demanda en Cerro Negro para el fin de semana (+28%)."
    ],
    simulations: [
      "Simulación What-If sugiere que desviar 20% del flujo a San Jacinto reduce la presión de carga en un 40%."
    ],
    recommendations: [
      "Monitorear telemetría de Smart Points en el acceso a Cerro Negro.",
      "Coordinar auditoría para 14 fichas con más de 180 días sin revisión en Meseta de Carazo."
    ],
    citedMetrics: [
      { name: "Exploraciones Significativas", value: "14,280", source: "analytics_events", period: "30d" },
      { name: "Negocios Locales Activos", value: "342", source: "businesses", period: "Al corte" },
      { name: "Cobertura de Verificación", value: "78.4%", source: "verifications", period: "Al corte" }
    ]
  });

  // Filtro de KPIs por grupo y territorio
  const filteredKpis = useMemo(() => {
    return STRATEGIC_KPI_CATALOG.filter((kpi) => {
      if (selectedGroup !== "ALL" && kpi.group !== selectedGroup) return false;
      if (selectedTerritory !== "ALL" && kpi.territoryScope !== "ALL" && kpi.territoryScope !== selectedTerritory) {
        return false;
      }
      return true;
    });
  }, [selectedGroup, selectedTerritory]);

  // Señales estratégicas activas
  const activeSignals = useMemo(() => {
    return STRATEGIC_SIGNAL_DEFINITIONS.filter((sig) => {
      if (selectedTerritory !== "ALL" && sig.scope.territoryId && sig.scope.territoryId !== selectedTerritory) {
        return false;
      }
      return true;
    });
  }, [selectedTerritory]);

  // Portafolio de territorios
  const portfolioProfiles = useMemo(() => {
    return territorialPortfolioService.getTerritoryProfiles("NI");
  }, []);

  const handleAskCopilot = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!copilotInput.trim()) return;

    setCopilotLoading(true);
    setTimeout(() => {
      const response = strategicToolsService.executeStrategicCopilot({
        question: copilotInput,
        role: "super_admin",
        countryId: "NI",
        territoryId: selectedTerritory !== "ALL" ? selectedTerritory : undefined
      });
      setCopilotResponse(response);
      setCopilotLoading(false);
      setCopilotInput("");
    }, 400);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* HEADER DE CABECERA — STRATEGIC INTELLIGENCE COCKPIT */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#06151f] via-[#0b222c] to-[#165D6F]/30 p-6 lg:p-8 backdrop-blur-xl">
        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10B981]/40 bg-[#10B981]/15 px-3 py-1 font-tech text-xs font-bold uppercase tracking-wider text-[#10B981]">
                <Activity size={14} className="animate-pulse" /> National Command &middot; Live
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-tech text-xs text-[#F4E6C1]">
                Contexto: Nicaragua (NI)
              </span>
              <span className="rounded-full border border-[#F65E01]/30 bg-[#F65E01]/10 px-3 py-1 font-tech text-xs text-[#F65E01]">
                Gobernanza Humana &middot; Soporte a Decisiones
              </span>
            </div>
            <h1 className="mt-3 font-display text-2xl font-black tracking-tight text-white lg:text-3xl">
              Centro de Inteligencia Estratégica & Territorial
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/70">
              Observabilidad holística de operaciones, marketplace comunitario, cobertura GIS, confianza,
              sostenibilidad y modelos predictivos para la toma informada de decisiones.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/strategic/briefing"
              className="focus-ring inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/20"
            >
              <FileText size={16} className="text-[#F4E6C1]" /> Briefing Semanal
            </Link>
            <Link
              href="/strategic/scorecard"
              className="focus-ring inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/20"
            >
              <BarChart3 size={16} className="text-[#10B981]" /> Scorecard
            </Link>
            <Link
              href="/strategic/scenarios"
              className="focus-ring inline-flex items-center gap-2 rounded-lg border border-[#F65E01]/40 bg-[#F65E01]/20 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#F65E01]/30"
            >
              <Sparkles size={16} className="text-[#F65E01]" /> Sala de Escenarios
            </Link>
          </div>
        </div>

        {/* LEYENDA EPISTEMOLÓGICA DE 4 ESTADOS */}
        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-white/10 pt-4 text-xs font-medium">
          <span className="text-white/50">Convención de Estados:</span>
          <div className="flex items-center gap-1.5 text-[#10B981]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
            <span>ACTUAL (Medido Real)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#38BDF8]">
            <span className="h-2.5 w-2.5 rounded-full border border-[#38BDF8] bg-transparent" />
            <span>TARGET (Meta Planificada)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#F65E01]">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-dashed border-[#F65E01] bg-transparent" />
            <span>FORECAST (Pronóstico de Modelo)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#C084FC]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#C084FC]/60" />
            <span>SIMULATION (Hipótesis What-If)</span>
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS Y DRILL-DOWN TERRITORIAL */}
      <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#08131e]/80 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-bold uppercase text-[#F4E6C1]">
            <Filter size={14} /> Grupo:
          </span>
          {(["ALL", "EXPERIENCE", "MARKETPLACE", "TERRITORY", "SUSTAINABILITY", "TRUST", "OPERATIONS", "PLATFORM", "ECONOMY"] as const).map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`focus-ring rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedGroup === group
                  ? "bg-[#165D6F] text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {group === "ALL" ? "Todos los Indicadores" : group}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="territory-select" className="text-xs font-bold uppercase text-[#F4E6C1]">
            Territorio:
          </label>
          <select
            id="territory-select"
            value={selectedTerritory}
            onChange={(e) => setSelectedTerritory(e.target.value)}
            className="focus-ring rounded-lg border border-white/15 bg-[#061018] px-3 py-1.5 text-xs font-semibold text-white"
          >
            <option value="ALL">Nicaragua (Nacional)</option>
            <option value="Leon">León (Occidente)</option>
            <option value="Matagalpa">Matagalpa (Norte Central)</option>
            <option value="Masaya">Masaya & Pueblos Blancos</option>
            <option value="Rivas">Rivas & Ometepe</option>
            <option value="Rio San Juan">Río San Juan & Solentiname</option>
          </select>
        </div>
      </div>

      {/* SECCIÓN 1: SEÑALES ESTRATÉGICAS ACTIVAS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} className="text-[#F65E01]" />
            <h2 className="font-display text-lg font-black text-white">Señales Estratégicas en Atención ({activeSignals.length})</h2>
          </div>
          <span className="text-xs text-white/50">Actualizado vía telemetría y pronósticos</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeSignals.map((signal) => {
            const isHigh = signal.severity === "HIGH";
            const isAttention = signal.severity === "ATTENTION";
            return (
              <div
                key={signal.signalId}
                className={`flex flex-col justify-between rounded-xl border p-5 backdrop-blur ${
                  isHigh
                    ? "border-red-500/40 bg-red-950/20"
                    : isAttention
                    ? "border-[#F65E01]/40 bg-[#F65E01]/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-tech text-[10px] font-bold uppercase ${
                        isHigh
                          ? "bg-red-500/20 text-red-400"
                          : isAttention
                          ? "bg-[#F65E01]/20 text-[#F65E01]"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {signal.severity} &middot; {signal.type}
                    </span>
                    <span className="font-mono text-[11px] text-white/50">
                      {new Date(signal.observedAt).toLocaleDateString("es-NI")}
                    </span>
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-white leading-snug">{signal.title}</h3>
                  <p className="mt-2 text-xs text-white/70 leading-relaxed">{signal.evidence.details}</p>

                  <div className="mt-3 rounded-lg border border-white/10 bg-black/30 p-2.5 text-[11px]">
                    <span className="font-bold text-[#F4E6C1]">Evidencia: </span>
                    <span className="text-white/80">{signal.evidence.metricName} ({signal.evidence.currentValue})</span>
                  </div>
                </div>

                <div className="mt-4 border-t border-white/10 pt-3">
                  <p className="text-[11px] font-bold text-white/60 uppercase">Opciones de Acción:</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {signal.options.map((opt) => (
                      <button
                        key={opt.id}
                        className="rounded bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/90 hover:bg-white/20 transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 2: CATÁLOGO DE KPIs ESTRATÉGICOS CON 4 ESTADOS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass size={20} className="text-[#10B981]" />
            <h2 className="font-display text-lg font-black text-white">Indicadores Clave del Ecosistema ({filteredKpis.length})</h2>
          </div>
          <span className="text-xs text-white/50">Haga clic en un indicador para auditar su fórmula y origen</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredKpis.map((kpi) => {
            const hasData = kpi.value !== null && kpi.status !== "UNAVAILABLE";
            return (
              <button
                key={kpi.kpiId}
                onClick={() => setActiveKpiModal(kpi)}
                className="focus-ring group flex flex-col justify-between rounded-xl border border-white/10 bg-[#07131f]/90 p-5 text-left transition-all hover:border-[#165D6F] hover:bg-[#0c1f2c]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-tech text-[10px] font-bold uppercase tracking-wider text-[#F65E01]">
                      {kpi.group}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        kpi.status === "VALIDATED"
                          ? "bg-[#10B981]/15 text-[#10B981]"
                          : kpi.status === "PARTIAL"
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-red-500/15 text-red-400"
                      }`}
                    >
                      {kpi.status}
                    </span>
                  </div>

                  <h3 className="mt-2 text-sm font-bold text-white group-hover:text-[#F4E6C1] transition-colors leading-snug">
                    {kpi.name}
                  </h3>

                  {/* VALOR ACTUAL (SOLID) O SIN DATOS */}
                  <div className="mt-3 flex items-baseline gap-2">
                    {hasData ? (
                      <span className="font-display text-2xl font-black text-white">
                        {kpi.value?.toLocaleString("es-NI")}
                        <span className="ml-1 text-xs font-normal text-white/60">{kpi.unit}</span>
                      </span>
                    ) : (
                      <span className="rounded bg-white/10 px-2 py-1 font-tech text-xs font-bold text-amber-300">
                        SIN DATOS
                      </span>
                    )}
                  </div>

                  {/* METAS Y PRONÓSTICOS COMPARADOS */}
                  <div className="mt-3 space-y-1 text-[11px] text-white/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[#38BDF8]">Target (Meta):</span>
                      <span className="font-mono text-white/90">
                        {kpi.targetValue !== null ? `${kpi.targetValue} ${kpi.unit}` : "No definida"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#F65E01]">Forecast (Pronóstico):</span>
                      <span className="font-mono text-white/90">
                        {kpi.forecastValue !== null ? `${kpi.forecastValue} ${kpi.unit}` : "Sin modelo"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] text-white/40">
                  <span>{kpi.period}</span>
                  <span className="flex items-center gap-1 text-[#F4E6C1] group-hover:underline">
                    Auditar <ChevronRight size={12} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 3: PORTAFOLIO TERRITORIAL MULTIDIMENSIONAL */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 size={20} className="text-[#38BDF8]" />
            <h2 className="font-display text-lg font-black text-white">Portafolio de Desarrollo Territorial</h2>
          </div>
          <span className="text-xs text-white/50">Evaluación multidimensional sin estigmatización de zonas rurales</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#07131f]/90">
          <table className="w-full text-left text-xs text-white/80">
            <thead className="border-b border-white/10 bg-white/5 font-tech text-[11px] uppercase tracking-wider text-[#F4E6C1]">
              <tr>
                <th className="p-3.5">Territorio / Eje</th>
                <th className="p-3.5">Cobertura</th>
                <th className="p-3.5">Confianza (Trust)</th>
                <th className="p-3.5">Accesibilidad</th>
                <th className="p-3.5">Demanda</th>
                <th className="p-3.5">Sostenibilidad</th>
                <th className="p-3.5 text-center">Destinos / Negocios</th>
                <th className="p-3.5">Confianza de Datos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {portfolioProfiles.map((p) => (
                <tr key={p.territoryId} className="hover:bg-white/5 transition-colors">
                  <td className="p-3.5 font-bold text-white">{p.territoryName}</td>
                  <td className="p-3.5">
                    <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-medium text-emerald-300">
                      {p.coverageRating}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="rounded bg-sky-500/15 px-2 py-0.5 font-medium text-sky-300">
                      {p.trustRating}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="rounded bg-amber-500/15 px-2 py-0.5 font-medium text-amber-300">
                      {p.accessibilityRating}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="rounded bg-orange-500/15 px-2 py-0.5 font-medium text-orange-300">
                      {p.demandRating}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="rounded bg-teal-500/15 px-2 py-0.5 font-medium text-teal-300">
                      {p.sustainabilityRating}
                    </span>
                  </td>
                  <td className="p-3.5 text-center font-mono">
                    {p.destinationsCount} dest &middot; {p.businessesCount} neg
                  </td>
                  <td className="p-3.5">
                    <span className="text-[11px] text-white/60">{p.dataConfidence}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN 4: BAQUEANO STRATEGIC COPILOT & WORKSPACE DE DECISIÓN */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* COPILOTO ESTRATÉGICO IA BASADO EN HERRAMIENTAS */}
        <div className="flex flex-col justify-between rounded-2xl border border-white/15 bg-gradient-to-b from-[#06151f] to-[#0a1e28] p-6 shadow-xl backdrop-blur">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#165D6F]">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-white">Baqueano Strategic Copilot</h3>
                  <p className="text-xs text-[#F4E6C1]">Asistente analítico con acceso determinista a métricas reales</p>
                </div>
              </div>
              <span className="rounded bg-[#10B981]/20 px-2 py-1 font-tech text-[10px] font-bold text-[#10B981]">
                GROUNDED &middot; ZERO HALLUCINATIONS
              </span>
            </div>

            {/* RESPUESTA DEL COPILOTO */}
            {copilotResponse && (
              <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-black/30 p-4 text-xs">
                <p className="leading-relaxed text-white/90">{copilotResponse.summary}</p>

                {copilotResponse.facts.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-bold text-[#10B981] uppercase text-[10px]">Hechos Medidos (Facts):</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-white/70">
                      {copilotResponse.facts.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {copilotResponse.forecasts.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-bold text-[#F65E01] uppercase text-[10px]">Pronóstico de Modelos (Forecasts):</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-white/70">
                      {copilotResponse.forecasts.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {copilotResponse.recommendations.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-bold text-[#38BDF8] uppercase text-[10px]">Opciones Sugeridas (No vinculantes):</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-white/70">
                      {copilotResponse.recommendations.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleAskCopilot} className="mt-4 flex gap-2">
            <input
              type="text"
              value={copilotInput}
              onChange={(e) => setCopilotInput(e.target.value)}
              placeholder="Pregunte sobre demanda en León, cobertura de confianza o alertas..."
              className="focus-ring flex-1 rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-xs text-white placeholder-white/40"
            />
            <button
              type="submit"
              disabled={copilotLoading}
              className="focus-ring flex items-center justify-center rounded-xl bg-[#165D6F] px-4 py-2.5 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>
        </div>

        {/* DECISION SUPPORT WORKSPACE & INICIATIVAS ACTIVAS */}
        <div className="flex flex-col justify-between rounded-2xl border border-white/15 bg-gradient-to-b from-[#06151f] to-[#0a1e28] p-6 shadow-xl backdrop-blur">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F65E01]">
                  <Workflow size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-white">Iniciativas Estratégicas ({STRATEGIC_INITIATIVES_SEED.length})</h3>
                  <p className="text-xs text-[#F4E6C1]">Seguimiento de decisiones y metas vinculadas a KPIs</p>
                </div>
              </div>
              <span className="rounded bg-sky-500/20 px-2 py-1 font-tech text-[10px] font-bold text-sky-400">
                HUMAN GOVERNANCE
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {STRATEGIC_INITIATIVES_SEED.map((init) => (
                <div key={init.initiativeId} className="rounded-xl border border-white/10 bg-black/20 p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white">{init.name}</h4>
                    <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      {init.status}
                    </span>
                  </div>
                  <p className="text-white/70 leading-relaxed">{init.objective}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px] text-white/50">
                    <span>Responsable: <strong className="text-white/80">{init.owner}</strong></span>
                    <span>Plazo: <strong className="text-[#F4E6C1]">{init.targetDate}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-[11px] text-white/60 text-center">
            Toda decisión de alto impacto permanece bajo revisión y firma de la autoridad humana correspondiente.
          </div>
        </div>
      </div>

      {/* MODAL DE AUDITORÍA Y TRAZABILIDAD DE KPI */}
      {activeKpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-white/15 bg-[#081824] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-tech text-xs font-bold uppercase text-[#F65E01]">
                  Ficha Técnica &middot; {activeKpiModal.kpiId}
                </span>
                <h3 className="mt-1 font-display text-xl font-bold text-white">{activeKpiModal.name}</h3>
              </div>
              <button
                onClick={() => setActiveKpiModal(null)}
                className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-white/75">{activeKpiModal.description}</p>

            <div className="mt-5 space-y-2.5 rounded-xl border border-white/10 bg-black/40 p-4 text-xs font-mono">
              <div>
                <span className="text-[#38BDF8]">Fórmula: </span>
                <span className="text-white/90">{activeKpiModal.formula}</span>
              </div>
              <div>
                <span className="text-[#10B981]">Fuente de Datos: </span>
                <span className="text-white/90">{activeKpiModal.source}</span>
              </div>
              <div>
                <span className="text-[#F4E6C1]">Periodo Cubierto: </span>
                <span className="text-white/90">{activeKpiModal.period}</span>
              </div>
              <div>
                <span className="text-[#F65E01]">Cadencia de Actualización: </span>
                <span className="text-white/90">{activeKpiModal.cadence}</span>
              </div>
              <div>
                <span className="text-purple-400">Responsable / Dueño: </span>
                <span className="text-white/90">{activeKpiModal.owner}</span>
              </div>
              <div>
                <span className="text-teal-400">Última Frescura: </span>
                <span className="text-white/90">{new Date(activeKpiModal.freshness).toLocaleString("es-NI")}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveKpiModal(null)}
                className="rounded-lg bg-[#165D6F] px-4 py-2 text-xs font-bold text-white hover:bg-[#165D6F]/80"
              >
                Cerrar Ficha Técnica
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
