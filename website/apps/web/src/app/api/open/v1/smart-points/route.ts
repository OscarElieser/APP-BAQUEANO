// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — OPEN DATA API V1: SMART POINTS ENDPOINT
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Publicar la red de tótems, miradores y entradas de senderos inteligentes
//   con datos de aforo público agregado, preservando 100% la privacidad ciudadana
//   (sin trazas individuales ni identificadores de dispositivos de usuarios).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Next.js Route Handler (GET) con soporte para formato JSON y GeoJSON.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - GET `/api/open/v1/smart-points?format=json|geojson`
// ============================================================================

import { NextResponse } from "next/server";
import type { GeoJSONFeatureCollection, OpenDataSmartPointDTO } from "@baqueano/types";

const publicSmartPoints: OpenDataSmartPointDTO[] = [
  {
    id: "sp-001",
    code: "BQ-NI-LEON-0001",
    name: "Mirador de Cráter & Sendero Sur",
    type: "viewpoint",
    countryCode: "NI",
    territory: "León",
    coordinates: { latitude: 12.5069, longitude: -86.7028 },
    currentAforoStatus: "moderate",
    facilities: ["Estación de agua", "Primeros auxilios", "Señalética QR"],
    attribution: "Baqueano Smart Tourism & Cooperativa Guías Volcán Cerro Negro"
  },
  {
    id: "sp-002",
    code: "BQ-NI-MADZ-0002",
    name: "Centro de Visitantes & Embarcadero Fluvial",
    type: "visitor_center",
    countryCode: "NI",
    territory: "Madriz",
    coordinates: { latitude: 13.4817, longitude: -86.5821 },
    currentAforoStatus: "low",
    facilities: ["Boletería", "Chalecos salvavidas", "Estación meteorológica"],
    attribution: "Baqueano Smart Tourism & Comunidad de Somoto"
  },
  {
    id: "sp-003",
    code: "BQ-NI-MASA-0003",
    name: "Mirador de Catarina & Acceso a Laguna",
    type: "viewpoint",
    countryCode: "NI",
    territory: "Masaya",
    coordinates: { latitude: 11.9284, longitude: -86.0319 },
    currentAforoStatus: "moderate",
    facilities: ["Tótem Kiosco Táctil", "Artesanías", "Parqueo seguro"],
    attribution: "Baqueano Smart Tourism & Municipio de Catarina"
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format")?.toLowerCase() || "json";

  if (format === "geojson") {
    const geojson: GeoJSONFeatureCollection<OpenDataSmartPointDTO> = {
      type: "FeatureCollection",
      metadata: {
        title: "Baqueano Smart Tourism — Red de Puntos Inteligentes",
        license: "CC-BY-4.0",
        generatedAt: new Date().toISOString(),
        totalFeatures: publicSmartPoints.length
      },
      features: publicSmartPoints.map((sp) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [sp.coordinates.longitude, sp.coordinates.latitude]
        },
        properties: sp
      }))
    };

    return NextResponse.json(geojson, {
      headers: {
        "Content-Type": "application/geo+json; charset=utf-8",
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  return NextResponse.json(
    {
      apiVersion: "open-v1",
      license: "CC-BY-4.0",
      count: publicSmartPoints.length,
      data: publicSmartPoints,
      retrievedAt: new Date().toISOString()
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*"
      }
    }
  );
}
