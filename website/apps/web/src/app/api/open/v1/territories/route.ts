// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — OPEN DATA API V1: TERRITORIES ENDPOINT
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Exponer el listado normalizado de los 17 territorios oficiales de Nicaragua
//   (15 departamentos y 2 regiones autónomas) y sus cabeceras para sistemas GIS,
//   aplicaciones académicas y plataformas de investigación territorial.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Next.js Route Handler (GET) con caching público inmutable en el Edge.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - GET `/api/open/v1/territories`
// ============================================================================

import { NextResponse } from "next/server";
import { getStaticTerritorySummaries } from "../../../../../services/static-territory.service";

export async function GET() {
  const envelope = getStaticTerritorySummaries();

  const publicTerritories = envelope.items.map((t) => ({
    id: t.slug,
    name: t.name,
    category: t.category,
    countryCode: "NI",
    capital: t.capital,
    municipalityCount: t.municipalityCount,
    highlights: t.highlights,
    attribution: "Baqueano Nicaragua & División Político-Administrativa Oficial",
    license: "CC-BY-4.0"
  }));

  return NextResponse.json(
    {
      apiVersion: "open-v1",
      license: "CC-BY-4.0",
      totalCount: publicTerritories.length,
      data: publicTerritories,
      retrievedAt: new Date().toISOString()
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        "Access-Control-Allow-Origin": "*"
      }
    }
  );
}
