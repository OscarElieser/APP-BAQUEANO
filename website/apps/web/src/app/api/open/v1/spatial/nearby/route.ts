// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — OPEN GIS DATA API (NEARBY SPATIAL SEARCH)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Provee búsqueda espacial determinista por radio geodésico para aplicaciones cliente
//   y plataformas aliadas de turismo sostenible.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Valida coordenadas de origen mediante `validateCoordinates()`.
// - Filtra destinos contra el inventario público utilizando `findNearbyPlaces()`.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Endpoint GET `/api/open/v1/spatial/nearby?lat=...&lng=...&radiusKm=...`
// ============================================================================

import { NextResponse } from "next/server";
import { validateCoordinates, findNearbyPlaces } from "../../../../../../services/spatial/spatial-engine.service";
import type { PlaceRecord } from "@baqueano/types";

// Catálogo base de prueba / seed para demostración espacial
const SEED_PLACES: readonly PlaceRecord[] = [
  {
    placeId: "volcan-masaya",
    name: "Parque Nacional Volcán Masaya",
    categoryId: "volcanes",
    categoryName: "Volcanes & Aventura",
    subcategory: "Parque Nacional",
    description: "Cráter activo Santiago con lago de lava visible.",
    departmentId: "masaya",
    departmentName: "Masaya",
    municipalityId: "nindiri",
    municipalityName: "Nindirí",
    address: "Km 23 Carretera a Masaya",
    latitude: 11.9842,
    longitude: -86.1608,
    geohash: "d42y5",
    imageUrl: "/assets/destinations/masaya.jpg",
    imageUrls: ["/assets/destinations/masaya.jpg"],
    is24Hours: false,
    isOpen: true,
    isEmergency: false,
    isTourist: true,
    isCommercial: false,
    verified: true,
    rating: 4.8,
    reviewCount: 320,
    status: "published",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z"
  },
  {
    placeId: "laguna-apoyo",
    name: "Reserva Natural Laguna de Apoyo",
    categoryId: "naturaleza",
    categoryName: "Naturaleza & Conservación",
    subcategory: "Reserva Natural",
    description: "Laguna de origen volcánico con aguas termales y minerales.",
    departmentId: "masaya",
    departmentName: "Masaya",
    municipalityId: "catarina",
    municipalityName: "Catarina",
    address: "Bajada a la Laguna, Masaya",
    latitude: 11.9283,
    longitude: -86.0317,
    geohash: "d42vv",
    imageUrl: "/assets/destinations/apoyo.jpg",
    imageUrls: ["/assets/destinations/apoyo.jpg"],
    is24Hours: true,
    isOpen: true,
    isEmergency: false,
    isTourist: true,
    isCommercial: false,
    verified: true,
    rating: 4.9,
    reviewCount: 450,
    status: "published",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z"
  },
  {
    placeId: "hospital-masaya",
    name: "Hospital Departamental Humberto Alvarado",
    categoryId: "health",
    categoryName: "Salud & Emergencias",
    subcategory: "Hospital General",
    description: "Atención médica integral de urgencias 24/7.",
    departmentId: "masaya",
    departmentName: "Masaya",
    municipalityId: "masaya",
    municipalityName: "Masaya",
    address: "Entrada principal a Masaya",
    latitude: 11.9722,
    longitude: -86.0944,
    geohash: "d42v8",
    imageUrl: "/assets/services/hospital.jpg",
    imageUrls: [],
    is24Hours: true,
    isOpen: true,
    isEmergency: true,
    isTourist: false,
    isCommercial: false,
    verified: true,
    rating: 4.5,
    reviewCount: 88,
    status: "published",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z"
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const radiusStr = searchParams.get("radiusKm") || "25";
  const categoryFilter = searchParams.get("category") || undefined;

  const lat = parseFloat(latStr || "");
  const lng = parseFloat(lngStr || "");
  const radiusKm = parseFloat(radiusStr);

  const validation = validateCoordinates(lat, lng, "NI");
  if (!validation.isValid) {
    return NextResponse.json(
      { error: validation.errorReason || "Coordenadas inválidas." },
      { status: 400 }
    );
  }

  const results = findNearbyPlaces({ latitude: lat, longitude: lng }, SEED_PLACES, radiusKm, categoryFilter);

  return NextResponse.json({
    origin: { latitude: lat, longitude: lng },
    radiusKm,
    resultsCount: results.length,
    results,
    generatedAt: new Date().toISOString()
  });
}
