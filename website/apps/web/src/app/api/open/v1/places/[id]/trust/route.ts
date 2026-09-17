// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — OPEN DATA API V1: PLACE TRUST ENDPOINT (FASE 14)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Exponer señales de confianza, procedencia de datos e índice BRTI higienizados
//   para desarrolladores e investigadores cívicos.
// - Proteger de forma incondicional documentos privados de anfitriones.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Next.js Dynamic Route Handler (GET) con caching público en el Edge.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - GET `/api/open/v1/places/[id]/trust`
// ============================================================================

import { NextResponse } from "next/server";
import { getPublicTrustSummary } from "../../../../../../../services/trust-public.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const trustSummary = await getPublicTrustSummary(id);

    return NextResponse.json(
      {
        apiVersion: "open-v1",
        license: "CC-BY-4.0",
        data: trustSummary
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "TRUST_SUMMARY_ERROR",
        message: "No se pudieron obtener las señales de confianza para el recurso solicitado.",
        details: error?.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}
