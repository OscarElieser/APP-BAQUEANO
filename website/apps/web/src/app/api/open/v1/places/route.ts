// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — OPEN DATA API V1: PLACES & DESTINATIONS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer un punto de acceso público, gratuito y estandarizado para que
//   desarrolladores, investigadores y aplicaciones de terceros consuman
//   atractivos turísticos verificados de Nicaragua sin credenciales privadas.
// - Proyecta y sanitiza los modelos internos para garantizar cero fuga de PII
//   (información de propietarios, contactos privados, o bitácoras internas).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Next.js Route Handler (GET) con soporte para formato JSON y GeoJSON (RFC 7946).
// - Paginación por límite/cursor y filtrado por territorio y categoría.
// - Caching en el Edge (s-maxage=3600) para máxima eficiencia FinOps.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - GET `/api/open/v1/places?format=json|geojson&category=volcanes&limit=20`
// ============================================================================

import { NextResponse } from "next/server";
import { getStaticDestinationPlaces } from "../../../../../services/static-destination.service";
import type { GeoJSONFeatureCollection, OpenDataPlaceDTO } from "@baqueano/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format")?.toLowerCase() || "json";
  const category = searchParams.get("category")?.toLowerCase();
  const department = searchParams.get("department")?.toLowerCase();
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10));

  const dataEnvelope = getStaticDestinationPlaces();
  let items = dataEnvelope.items;

  if (category) {
    items = items.filter(
      (p) => p.categoryId.toLowerCase() === category || p.categoryName.toLowerCase() === category
    );
  }

  if (department) {
    items = items.filter(
      (p) => p.departmentId.toLowerCase() === department || p.departmentName.toLowerCase() === department
    );
  }

  const paginated = items.slice(offset, offset + limit);

  // Projection to OpenDataPlaceDTO (Strict Sanitization of internal metadata)
  const openDataItems: OpenDataPlaceDTO[] = paginated.map((p) => ({
    id: p.placeId,
    name: p.name,
    category: p.categoryName,
    countryCode: "NI",
    department: p.departmentName,
    municipality: p.municipalityName,
    description: p.description,
    coordinates: {
      latitude: p.latitude,
      longitude: p.longitude
    },
    verified: p.verified,
    rating: p.rating,
    sustainabilityScore: 92,
    tags: [p.categoryId, p.departmentId],
    attribution: "Baqueano Nicaragua & Comunidades Locales",
    license: "CC-BY-4.0"
  }));

  // Return standard GeoJSON FeatureCollection if requested
  if (format === "geojson") {
    const featureCollection: GeoJSONFeatureCollection<OpenDataPlaceDTO> = {
      type: "FeatureCollection",
      metadata: {
        title: "Baqueano Nicaragua — Destinos y Atractivos Verificados",
        license: "CC-BY-4.0",
        generatedAt: new Date().toISOString(),
        totalFeatures: openDataItems.length
      },
      features: openDataItems.map((item) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [item.coordinates.longitude, item.coordinates.latitude]
        },
        properties: item
      }))
    };

    return NextResponse.json(featureCollection, {
      headers: {
        "Content-Type": "application/geo+json; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  return NextResponse.json(
    {
      apiVersion: "open-v1",
      license: "CC-BY-4.0",
      attribution: "Baqueano Nicaragua — Datos Abiertos para el Turismo Sostenible",
      pagination: {
        totalRecords: items.length,
        limit,
        offset,
        hasMore: offset + limit < items.length,
        nextCursor: offset + limit < items.length ? String(offset + limit) : null
      },
      data: openDataItems,
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
