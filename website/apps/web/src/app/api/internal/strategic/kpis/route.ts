// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — INTERNAL STRATEGIC KPIS API (route.ts)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Servir la lista autorizada de indicadores estratégicos agregados para el Cockpit
//   y plataformas institucionales con control estricto de ámbito y confidencialidad.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Endpoint GET `/api/internal/strategic/kpis?group=...&territory=...`
// - Consulta la Capa Semántica de Métricas (`strategicMetricsService`).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Lista de KPIs con metadatos de procedencia, fórmula y estado epistemológico.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { strategicMetricsService } from "../../../../../services/strategic/strategic-metrics.service";
import type { KpiGroup } from "@baqueano/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const group = (searchParams.get("group") as KpiGroup) || undefined;
    const territoryId = searchParams.get("territory") || undefined;
    const countryId = searchParams.get("country") || "NI";

    const kpis = strategicMetricsService.getAllStrategicKpis(
      { role: "super_admin", countryId, territoryId },
      group
    );

    return NextResponse.json({
      success: true,
      count: kpis.length,
      data: kpis,
      metadata: {
        countryId,
        cadence: "aggregated_hourly",
        retrievedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error al recuperar métricas estratégicas" },
      { status: 500 }
    );
  }
}
