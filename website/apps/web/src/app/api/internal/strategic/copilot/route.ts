// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — INTERNAL STRATEGIC COPILOT API (route.ts)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Servir de backend para las consultas ejecutivas del Baqueano Strategic Copilot.
// - Garantizar ejecución estricta contra herramientas deterministas con control de injection.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Endpoint POST `/api/internal/strategic/copilot`
// - Procesa la consulta mediante `strategicToolsService.executeStrategicCopilot()`.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Respuesta estructurada con hechos, modelos, simulaciones, recomendaciones y citas.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { strategicToolsService } from "../../../../../services/strategic/strategic-tools.service";
import type { UserRole } from "@baqueano/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, role = "super_admin", countryId = "NI", territoryId } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { success: false, error: "Parámetro 'question' requerido" },
        { status: 400 }
      );
    }

    const response = strategicToolsService.executeStrategicCopilot({
      question,
      role: role as UserRole,
      countryId,
      territoryId
    });

    return NextResponse.json({
      success: true,
      data: response
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error al ejecutar consulta de copiloto estratégico" },
      { status: 500 }
    );
  }
}
