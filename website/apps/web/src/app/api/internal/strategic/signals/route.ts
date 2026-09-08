// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — INTERNAL STRATEGIC SIGNALS API (route.ts)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Servir la lista activa de señales estratégicas con sus opciones de acción y evidencia.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Endpoint GET `/api/internal/strategic/signals?territory=...&severity=...`
// - Consulta el motor heurístico (`strategicSignalsService`).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Lista priorizada de señales con nivel de atención y fuentes de datos.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { strategicSignalsService } from "../../../../../services/strategic/strategic-signals.service";
import type { SignalSeverity } from "@baqueano/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const territoryId = searchParams.get("territory") || undefined;
    const severity = (searchParams.get("severity") as SignalSeverity) || undefined;
    const countryId = searchParams.get("country") || "NI";

    const signals = strategicSignalsService.getActiveSignals({
      countryId,
      territoryId,
      severity
    });

    return NextResponse.json({
      success: true,
      count: signals.length,
      data: signals,
      retrievedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error al recuperar señales estratégicas" },
      { status: 500 }
    );
  }
}
