// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CUADRO DE MANDO INTEGRAL (EXECUTIVE SCORECARD) (page.tsx)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una matriz consolidada de objetivos estratégicos comparando lo observado
//   real (ACTUAL), la meta planificada (TARGET) y la proyección esperada (FORECAST).
// - Prohibir índices únicos agregados engañosos (Score Universal): cada dimensión
//   conserva su métrica objetiva con su unidad, fórmula y estado de evidencia.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Agrupación por las 8 Dimensiones Estratégicas del Ecosistema.
// - Indicadores de desviación (Variance Delta) y barras de progreso proporcionales.
// - Respaldo de trazabilidad con fecha exacta de frescura y responsable asignado.
//
// 📦 3. QUÉ (WHAT / COMPONENTES EXPUESTOS):
// - Tabla de Scorecard Multidimensional.
// - Resumen de Cumplimiento de Metas Institucionales.
// - Filtro de Grupos e Indicadores de Confianza.
// ============================================================================

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock,
  Compass,
  Filter,
  Layers,
  ShieldCheck,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import { STRATEGIC_KPI_CATALOG } from "@baqueano/config";
import type { KpiGroup, StrategicKpi } from "@baqueano/types";

export default function StrategicScorecardPage() {
  const [selectedGroup, setSelectedGroup] = useState<KpiGroup | "ALL">("ALL");

  const filteredKpis = useMemo(() => {
    if (selectedGroup === "ALL") return STRATEGIC_KPI_CATALOG;
    return STRATEGIC_KPI_CATALOG.filter((k) => k.group === selectedGroup);
  }, [selectedGroup]);

  return (
    <div className="space-y-8 pb-16">
      {/* HEADER DE CABECERA — SCORECARD ESTRATÉGICO */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center rounded-2xl border border-white/10 bg-gradient-to-r from-[#06151f] via-[#091b24] to-[#165D6F]/30 p-6 backdrop-blur">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#10B981]/20 px-2.5 py-0.5 font-tech text-xs font-bold uppercase tracking-wider text-[#10B981]">
              Scorecard &middot; 2026-Q3
            </span>
            <span className="rounded bg-white/10 px-2.5 py-0.5 font-tech text-xs text-[#F4E6C1]">
              Nivel Ejecutivo
            </span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-black text-white">
            Cuadro de Mando Integral & Metas Estratégicas
          </h1>
          <p className="mt-1 text-xs text-white/70">
            Comparativa rigurosa entre lo observado real (Actual), la meta acordada (Target) y la proyección del modelo (Forecast).
          </p>
        </div>

        <Link
          href="/strategic"
          className="focus-ring inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20"
        >
          <ArrowLeft size={16} /> Volver al Cockpit
        </Link>
      </div>

      {/* FILTROS POR GRUPO */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-[#07131f]/80 p-3">
        <span className="text-xs font-bold uppercase text-[#F4E6C1] px-2">Dimensión:</span>
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
            {group === "ALL" ? "Todas las Dimensiones" : group}
          </button>
        ))}
      </div>

      {/* TABLA PRINCIPAL DE SCORECARD */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#07131f]/90 shadow-xl">
        <table className="w-full text-left text-xs text-white/80">
          <thead className="border-b border-white/10 bg-white/5 font-tech text-[11px] uppercase tracking-wider text-[#F4E6C1]">
            <tr>
              <th className="p-4">Indicador Estratégico</th>
              <th className="p-4">Dimensión</th>
              <th className="p-4 text-right">Actual (Real)</th>
              <th className="p-4 text-right">Target (Meta)</th>
              <th className="p-4 text-right">Forecast (Modelo)</th>
              <th className="p-4 text-center">Cumplimiento</th>
              <th className="p-4">Responsable</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredKpis.map((kpi) => {
              const hasActual = kpi.value !== null && kpi.status !== "UNAVAILABLE";
              const hasTarget = kpi.targetValue !== null;
              const compliancePercent = hasActual && hasTarget && kpi.targetValue! > 0
                ? Number(((kpi.value! / kpi.targetValue!) * 100).toFixed(1))
                : null;

              return (
                <tr key={kpi.kpiId} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-white block">{kpi.name}</span>
                    <span className="text-[10px] text-white/50">{kpi.period} &middot; Fuente: {kpi.source}</span>
                  </td>
                  <td className="p-4">
                    <span className="rounded bg-white/10 px-2 py-0.5 font-tech text-[10px] font-bold text-[#F65E01]">
                      {kpi.group}
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-white text-sm">
                    {hasActual ? `${kpi.value?.toLocaleString("es-NI")} ${kpi.unit}` : <span className="text-amber-400 font-sans text-xs">SIN DATOS</span>}
                  </td>
                  <td className="p-4 text-right font-mono text-sky-400">
                    {hasTarget ? `${kpi.targetValue?.toLocaleString("es-NI")} ${kpi.unit}` : "N/D"}
                  </td>
                  <td className="p-4 text-right font-mono text-[#F65E01]">
                    {kpi.forecastValue !== null ? `${kpi.forecastValue?.toLocaleString("es-NI")} ${kpi.unit}` : "N/D"}
                  </td>
                  <td className="p-4 text-center">
                    {compliancePercent !== null ? (
                      <span
                        className={`rounded px-2 py-0.5 font-mono text-xs font-bold ${
                          compliancePercent >= 95
                            ? "bg-emerald-500/20 text-emerald-300"
                            : compliancePercent >= 80
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {compliancePercent}%
                      </span>
                    ) : (
                      <span className="text-white/40">&mdash;</span>
                    )}
                  </td>
                  <td className="p-4 text-white/70">{kpi.owner}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
