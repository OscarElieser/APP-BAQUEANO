// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SERVICIO GEOGRÁFICO Y PROXIMIDAD (geospatial-service.js)
// ============================================================================
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer consultas espaciales de alta precisión (lugares, restaurantes, hoteles,
//   servicios de emergencia y senderos cercanos al explorador).
// - Soportar el endpoint oficial `GET /api/nearby`.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Nivel 1: PostGIS RPC en Supabase (`get_nearby_destinations`, `get_nearby_businesses`).
// - Nivel 2: Algoritmo geodésico Haversine nativo con datos de Firestore / Catálogo local
//   para garantizar 100% de disponibilidad cuando PostGIS no esté configurado.
//
// 📦 3. QUÉ (WHAT / ENTIDADES EXPUESTAS):
// - `findNearbyEntities`: Búsqueda espacial por latitud, longitud, radio y categoría.
// - `haversineDistanceMeters`: Cálculo trigonométrico de distancia entre dos coordenadas.
// ============================================================================
"use strict";

const { getSupabase } = require("./supabase-client");
const { BAQUEANO_FALLBACK_TERRITORIES } = require("./baqueano-knowledge");

function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radio de la Tierra en metros
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

async function findNearbyEntities({ latitude, longitude, radiusMeters = 25000, category = null, limit = 30 }) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new TypeError("Coordenadas geográficas inválidas.");
  }

  const radius = Math.min(Math.max(Number(radiusMeters) || 25000, 500), 200000); // 500m a 200km
  const sb = getSupabase();

  // 1. Intento con PostGIS en Supabase
  if (sb) {
    try {
      const { data: destinations, error: rpcErr } = await sb.rpc("get_nearby_destinations", {
        lat: lat,
        lng: lng,
        radius_meters: radius,
        filter_category: category || null
      });

      if (!rpcErr && Array.isArray(destinations) && destinations.length > 0) {
        return {
          source: "supabase-postgis",
          latitude: lat,
          longitude: lng,
          radiusMeters: radius,
          count: destinations.length,
          results: destinations.slice(0, limit)
        };
      }
    } catch (sbEx) {
      console.warn("[GeospatialService] PostGIS no disponible temporalmente:", sbEx.message);
    }
  }

  // 2. Respaldo Geodésico Determinista (Haversine sobre catálogo verificado Baqueano)
  const results = [];
  for (const territory of BAQUEANO_FALLBACK_TERRITORIES) {
    for (const place of territory.places || []) {
      if (place.latitude && place.longitude) {
        const dist = haversineDistanceMeters(lat, lng, place.latitude, place.longitude);
        if (dist <= radius) {
          if (!category || place.category?.toLowerCase().includes(category.toLowerCase()) || territory.name.toLowerCase().includes(category.toLowerCase())) {
            results.push({
              id: place.id || place.name.toLowerCase().replace(/\s+/g, "-"),
              name: place.name,
              category: place.category || "Destino Natural",
              department: territory.name,
              latitude: place.latitude,
              longitude: place.longitude,
              distance_meters: dist,
              verified: true
            });
          }
        }
      }
    }
  }

  results.sort((a, b) => a.distance_meters - b.distance_meters);

  return {
    source: "haversine-territorial-fallback",
    latitude: lat,
    longitude: lng,
    radiusMeters: radius,
    count: results.length,
    results: results.slice(0, limit)
  };
}

module.exports = {
  findNearbyEntities,
  haversineDistanceMeters
};
