// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — OPEN GIS DATA API (ISOCHRONE CALCULATION)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Calcula envolventes de alcance temporal reales (15, 30, 45, 60 min) para planificadores
//   y herramientas inteligentes de viaje.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Valida coordenadas de origen y parámetros de tiempo y modo de transporte.
// - Genera el polígono GeoJSON de isócrona con `generateIsochronePolygon()`.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Endpoint GET `/api/open/v1/spatial/isochrones?lat=...&lng=...&minutes=30&mode=driving`
// ============================================================================

import { NextResponse } from "next/server";
import { validateCoordinates } from "../../../../../../services/spatial/spatial-engine.service";
import { generateIsochronePolygon } from "../../../../../../services/spatial/routing-engine.service";
import type { TransportMode } from "@baqueano/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const minutesStr = searchParams.get("minutes") || "30";
  const modeStr = (searchParams.get("mode") || "driving") as TransportMode;
  const name = searchParams.get("name") || "Punto de Origen";

  const lat = parseFloat(latStr || "");
  const lng = parseFloat(lngStr || "");
  const minutes = parseInt(minutesStr, 10);

  const validation = validateCoordinates(lat, lng, "NI");
  if (!validation.isValid) {
    return NextResponse.json(
      { error: validation.errorReason || "Coordenadas de origen inválidas." },
      { status: 400 }
    );
  }

  if (![15, 30, 45, 60].includes(minutes)) {
    return NextResponse.json(
      { error: "El tiempo límite debe ser 15, 30, 45 o 60 minutos." },
      { status: 400 }
    );
  }

  const isochrone = generateIsochronePolygon(
    { latitude: lat, longitude: lng },
    name,
    minutes as 15 | 30 | 45 | 60,
    modeStr
  );

  const geojson = {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [isochrone.coordinates]
    },
    properties: {
      originName: isochrone.originName,
      travelMode: isochrone.travelMode,
      timeLimitMinutes: isochrone.timeLimitMinutes,
      reachableDestinationsCount: isochrone.reachableDestinationsCount,
      boundingBox: isochrone.boundingBox,
      generatedAt: isochrone.generatedAt,
      isEstimated: isochrone.isEstimated
    }
  };

  return NextResponse.json(geojson, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/geo+json"
    }
  });
}
