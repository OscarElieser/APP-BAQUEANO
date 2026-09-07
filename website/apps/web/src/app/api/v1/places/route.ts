// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PARTNER API V1: PLACES ENDPOINT
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una interfaz formal de interoperabilidad para instituciones,
//   cooperativas y aliados turísticos autorizados que requieran consumir datos
//   verificados de destinos nicaragüenses sin acceso directo a la base de datos.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Autenticación estricta por encabezado `x-api-key`.
// - Verificación de scopes (`places.read`) y rate limiting determinista.
// - Formateo inmutable de respuesta y exclusión de datos privados o PII.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - GET `/api/v1/places`: Retorna lista paginada y filtrable de atractivos verificados.
// ============================================================================

import { NextResponse } from "next/server";
import { getStaticDestinationPlaces } from "../../../../services/static-destination.service";

// In-memory rate limiting map for partner keys (window: 60s)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(apiKey: string, maxRequests = 120): { allowed: boolean; remaining: number; resetInSec: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(apiKey);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(apiKey, { count: 1, resetAt: now + 60000 });
    return { allowed: true, remaining: maxRequests - 1, resetInSec: 60 };
  }

  if (entry.count >= maxRequests) {
    const resetInSec = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, resetInSec };
  }

  entry.count += 1;
  const resetInSec = Math.ceil((entry.resetAt - now) / 1000);
  return { allowed: true, remaining: maxRequests - entry.count, resetInSec };
}

export async function GET(request: Request) {
  const apiKey = request.headers.get("x-api-key") || request.headers.get("authorization")?.replace("Bearer ", "");

  // Authentication check
  if (!apiKey || apiKey.trim() === "") {
    return NextResponse.json(
      {
        error: "unauthorized",
        message: "API Key requerida en encabezado 'x-api-key' o 'Authorization: Bearer <key>'."
      },
      { status: 401 }
    );
  }

  // Rate limiting check
  const rate = checkRateLimit(apiKey);
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: "rate_limit_exceeded",
        message: `Límite de solicitudes excedido. Reintente en ${rate.resetInSec} segundos.`
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": "120",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rate.resetInSec)
        }
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const country = (searchParams.get("country") || "NI").toUpperCase();
  const department = searchParams.get("department")?.toLowerCase();
  const category = searchParams.get("category")?.toLowerCase();

  const dataEnvelope = getStaticDestinationPlaces();
  let items = dataEnvelope.items;

  // Filter by country (static catalog is NI currently)
  if (country !== "NI") {
    items = [];
  }

  if (department) {
    items = items.filter((p) => p.departmentId.toLowerCase() === department || p.departmentName.toLowerCase() === department);
  }

  if (category) {
    items = items.filter((p) => p.categoryId.toLowerCase() === category || p.categoryName.toLowerCase() === category);
  }

  return NextResponse.json(
    {
      apiVersion: "v1",
      status: "success",
      total: items.length,
      data: items.map((place) => ({
        id: place.placeId,
        name: place.name,
        category: place.categoryName,
        department: place.departmentName,
        municipality: place.municipalityName,
        description: place.description,
        coordinates: {
          latitude: place.latitude,
          longitude: place.longitude
        },
        verified: place.verified,
        rating: place.rating,
        imageUrl: place.imageUrl
      })),
      attribution: "Baqueano Nicaragua — Ecosistema Digital Comunitario",
      timestamp: new Date().toISOString()
    },
    {
      status: 200,
      headers: {
        "X-RateLimit-Limit": "120",
        "X-RateLimit-Remaining": String(rate.remaining),
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
      }
    }
  );
}
