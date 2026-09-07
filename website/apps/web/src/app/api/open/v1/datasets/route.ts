// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — OPEN DATA CATALOG API ENDPOINT (FASE 13)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer un catálogo indexable de metadatos de los datasets abiertos
//   oficiales de Baqueano (licencias, frecuencias de actualización, formatos).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Next.js Route Handler (GET) que expone OPEN_DATASETS_CATALOG.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - GET `/api/open/v1/datasets`
// ============================================================================

import { NextResponse } from "next/server";
import { OPEN_DATASETS_CATALOG } from "@baqueano/config";

export async function GET() {
  return NextResponse.json(
    {
      apiVersion: "open-v1",
      licensePolicy: "https://baqueano.app/open-data#licencia",
      totalDatasets: OPEN_DATASETS_CATALOG.length,
      datasets: OPEN_DATASETS_CATALOG,
      retrievedAt: new Date().toISOString()
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*"
      }
    }
  );
}
