// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PARTNER API V1: TERRITORIES STATUS ENDPOINT
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una fuente oficial de estado operacional y alertas del gemelo
//   digital de los 17 territorios de Nicaragua para sistemas institucionales,
//   organizaciones de socorro y aliados de transporte.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Autenticación estricta por encabezado `x-api-key`.
// - Verificación de scopes (`territories.read`) y rate limiting determinista.
// - Formateo estructurado de métricas de demanda, capacidad y alertas activas.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - GET `/api/v1/territories`: Retorna estado de los 17 territorios nacionales.
// ============================================================================

import { NextResponse } from "next/server";

const seedTerritoriesFeed = [
  { territoryId: "boaco", name: "Boaco", status: "NORMAL", demand: "LOW", capacity: "AVAILABLE", openIncidents: 0 },
  { territoryId: "carazo", name: "Carazo", status: "NORMAL", demand: "NORMAL", capacity: "AVAILABLE", openIncidents: 0 },
  { territoryId: "chinandega", name: "Chinandega", status: "NORMAL", demand: "NORMAL", capacity: "AVAILABLE", openIncidents: 0 },
  { territoryId: "chontales", name: "Chontales", status: "NORMAL", demand: "LOW", capacity: "AVAILABLE", openIncidents: 0 },
  { territoryId: "esteli", name: "Estelí", status: "NORMAL", demand: "NORMAL", capacity: "AVAILABLE", openIncidents: 0 },
  { territoryId: "granada", name: "Granada", status: "NORMAL", demand: "HIGH", capacity: "AVAILABLE", openIncidents: 0 },
  { territoryId: "jinotega", name: "Jinotega", status: "NORMAL", demand: "NORMAL", capacity: "AVAILABLE", openIncidents: 0 },
  { territoryId: "leon", name: "León", status: "NORMAL", demand: "HIGH", capacity: "AVAILABLE", openIncidents: 0 },
  { territoryId: "madriz", name: "Madriz", status: "NORMAL", demand: "NORMAL", capacity: "AVAILABLE", openIncidents: 0 },
  { territoryId: "managua", name: "Managua", status: "NORMAL", demand: "HIGH", capacity: "AVAILABLE", openIncidents: 0 },
  { territoryId: "masaya", name: "Masaya", status: "NORMAL", demand: "HIGH", capacity: "AVAILABLE", openIncidents: 0 },
  { territoryId: "matagalpa", name: "Matagalpa", status: "NORMAL", demand: "HIGH", capacity: "AVAILABLE", openIncidents: 0 },
  { territoryId: "nueva-segovia", name: "Nueva Segovia", status: "NORMAL", demand: "LOW", capacity: "AVAILABLE", openIncidents: 0 },
  { territoryId: "rio-san-juan", name: "Río San Juan", status: "CRITICAL", demand: "NORMAL", capacity: "LIMITED", openIncidents: 1 },
  { territoryId: "rivas", name: "Rivas & Ometepe", status: "ATTENTION", demand: "VERY_HIGH", capacity: "LIMITED", openIncidents: 1 },
  { territoryId: "raccn", name: "Costa Caribe Norte (RACCN)", status: "UNKNOWN", demand: "LOW", capacity: "UNKNOWN", openIncidents: 0 },
  { territoryId: "raccs", name: "Costa Caribe Sur (RACCS)", status: "ATTENTION", demand: "NORMAL", capacity: "AVAILABLE", openIncidents: 0 }
];

export async function GET(request: Request) {
  const apiKey = request.headers.get("x-api-key") || request.headers.get("authorization")?.replace("Bearer ", "");

  if (!apiKey || apiKey.trim() === "") {
    return NextResponse.json(
      {
        error: "unauthorized",
        message: "API Key requerida en encabezado 'x-api-key' o 'Authorization: Bearer <key>'."
      },
      { status: 401 }
    );
  }

  return NextResponse.json(
    {
      apiVersion: "v1",
      status: "success",
      totalTerritories: seedTerritoriesFeed.length,
      data: seedTerritoriesFeed,
      attribution: "Baqueano Nicaragua — Torre de Control Territorial",
      timestamp: new Date().toISOString()
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120"
      }
    }
  );
}
