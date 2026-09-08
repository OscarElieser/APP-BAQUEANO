// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — INTERNAL STRATEGIC BRIEFING API (route.ts)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Generar y servir instantáneas estructuradas del resumen ejecutivo semanal.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Endpoint GET `/api/internal/strategic/briefing?type=...`
// - Compila snapshot mediante `strategicReportingService`.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Snapshot tipificado con secciones, evidencia y estado de firma humana.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { strategicReportingService } from "../../../../../services/strategic/strategic-reporting.service";
import type { StrategicReportType } from "@baqueano/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = (searchParams.get("type") as StrategicReportType) || "WEEKLY_EXECUTIVE_BRIEF";
    const countryId = searchParams.get("country") || "NI";
    const territoryId = searchParams.get("territory") || undefined;

    const snapshot = strategicReportingService.generateReportSnapshot({
      reportType,
      countryId,
      territoryId,
      userRole: "super_admin"
    });

    return NextResponse.json({
      success: true,
      data: snapshot
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error al generar resumen ejecutivo estratégico" },
      { status: 500 }
    );
  }
}
