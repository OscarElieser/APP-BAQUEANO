// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — OPEN GIS DATA API (TOURISM CORRIDORS GEOJSON)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Expone los corredores turísticos oficiales y verificados de Nicaragua en formato
//   abierto GeoJSON (RFC 7946) para desarrolladores, academia e instituciones aliadas.
// - Cumple con el estándar de Open Data de la Fase 13 garantizando soberanía espacial.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Transforma las definiciones de `TOURISM_CORRIDORS_CATALOG` en un FeatureCollection
//   GeoJSON con geometrías de tipo `LineString` y `Point` asociadas a cada parada.
// - Controla encabezados CORS y cache estricto (Cache-Control: public, max-age=3600).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Endpoint GET `/api/open/v1/spatial/corridors` (?slug=opcional).
// ============================================================================

import { NextResponse } from "next/server";
import { TOURISM_CORRIDORS_CATALOG } from "@baqueano/config";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  let corridors = TOURISM_CORRIDORS_CATALOG.filter((c) => c.status === "PUBLISHED");
  if (slug) {
    corridors = corridors.filter((c) => c.slug === slug);
  }

  const features = corridors.map((corridor) => ({
    type: "Feature",
    id: corridor.corridorId,
    geometry: {
      type: "LineString",
      coordinates: corridor.stops.map((s) => [s.coordinates.longitude, s.coordinates.latitude])
    },
    properties: {
      corridorId: corridor.corridorId,
      slug: corridor.slug,
      name: corridor.name,
      theme: corridor.theme,
      territories: corridor.territories,
      totalDistanceKm: corridor.totalDistanceKm,
      suggestedDurationDays: corridor.suggestedDurationDays,
      sustainabilityRating: corridor.sustainabilityRating,
      stopsCount: corridor.stops.length,
      publishedAt: corridor.publishedAt,
      license: "Creative Commons Attribution 4.0 International (CC BY 4.0)"
    }
  }));

  const geojson = {
    type: "FeatureCollection",
    metadata: {
      provider: "BAQUEANO NICARAGUA SPATIAL PLATFORM",
      crs: "urn:ogc:def:crs:OGC:1.3:CRS84",
      generatedAt: new Date().toISOString(),
      disclaimer: "Datos geoespaciales para turismo responsable y planificación territorial."
    },
    features
  };

  return NextResponse.json(geojson, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Content-Type": "application/geo+json"
    }
  });
}
