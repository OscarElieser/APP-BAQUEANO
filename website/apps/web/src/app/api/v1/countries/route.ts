// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PUBLIC REGIONAL COUNTRIES API (FASE 12)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer un endpoint público y cacheado para que clientes web, socios
//   institucionales e interfaces territoriales descubran los países soportados,
//   sus monedas, protocolos de emergencia y capacidades habilitadas.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Next.js Route Handler (GET) con caching público (s-maxage=3600, stale-while-revalidate=86400).
// - Filtrado por query parameter ?status=ACTIVE|PILOT|ALL.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - GET /api/v1/countries
// ============================================================================

import { NextResponse } from "next/server";
import { CENTRAL_AMERICA_COUNTRIES } from "@baqueano/config";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status")?.toUpperCase();

  let results = CENTRAL_AMERICA_COUNTRIES;

  if (statusFilter && statusFilter !== "ALL") {
    results = results.filter((c) => c.status === statusFilter);
  }

  return NextResponse.json(
    {
      success: true,
      region: "CENTRAL_AMERICA",
      count: results.length,
      data: results,
      retrievedAt: new Date().toISOString()
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "X-Baqueano-Region": "CentralAmerica"
      }
    }
  );
}
