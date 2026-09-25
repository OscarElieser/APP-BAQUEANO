// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SERVICIO DE BÚSQUEDA INTEGRAL (search-service.js)
// ============================================================================
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia de búsqueda instantánea, precisa y unificada a través
//   de todo el catálogo turístico de Nicaragua (destinos, lugares, cooperativas y cultura).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Nivel 1: Búsqueda de texto completo (Full Text Search) en PostgreSQL / Supabase.
// - Nivel 2: Indexación y coincidencia de términos fácticos en memoria con normalización
//   de tildes y diacríticos en el catálogo territorial Baqueano.
//
// 📦 3. QUÉ (WHAT / ENTIDADES EXPUESTAS):
// - `searchCatalog`: Realiza la búsqueda transversal con puntuación de relevancia.
// ============================================================================
"use strict";

const { BAQUEANO_FALLBACK_TERRITORIES } = require("./baqueano-knowledge");
const { getSupabase } = require("./supabase-client");

function normalizeString(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

async function searchCatalog({ query, category = null, department = null, limit = 20 }) {
  const cleanQuery = normalizeString(query);
  const terms = cleanQuery.split(/\s+/).filter(Boolean);

  if (terms.length === 0) {
    return { query: "", count: 0, results: [] };
  }

  const sb = getSupabase();

  // 1. Intento de búsqueda en Supabase
  if (sb) {
    try {
      let sbQuery = sb.from("destinations").select("id, name, category, description, latitude, longitude, cover_image, rating").eq("status", "published");

      if (category) sbQuery = sbQuery.ilike("category", `%${category}%`);
      if (department) sbQuery = sbQuery.ilike("department_id", `%${department}%`);

      const { data, error } = await sbQuery.ilike("name", `%${cleanQuery}%`).limit(limit);

      if (!error && Array.isArray(data) && data.length > 0) {
        return {
          query,
          source: "supabase-postgresql",
          count: data.length,
          results: data
        };
      }
    } catch (err) {
      // Continuar al respaldo
    }
  }

  // 2. Respaldo territorial verificado en memoria
  const results = [];

  for (const territory of BAQUEANO_FALLBACK_TERRITORIES) {
    const territoryNorm = normalizeString(territory.name);

    if (department && !territoryNorm.includes(normalizeString(department))) {
      continue;
    }

    for (const place of territory.places || []) {
      const nameNorm = normalizeString(place.name);
      const catNorm = normalizeString(place.category);

      if (category && !catNorm.includes(normalizeString(category))) {
        continue;
      }

      let score = 0;
      for (const term of terms) {
        if (nameNorm.includes(term)) score += 3;
        if (catNorm.includes(term)) score += 2;
        if (territoryNorm.includes(term)) score += 1;
      }

      if (score > 0) {
        results.push({
          id: place.id || nameNorm.replace(/\s+/g, "-"),
          name: place.name,
          category: place.category || "Destino Natural",
          department: territory.name,
          latitude: place.latitude || null,
          longitude: place.longitude || null,
          score
        });
      }
    }
  }

  results.sort((a, b) => b.score - a.score);

  return {
    query,
    source: "baqueano-verified-knowledge",
    count: results.length,
    results: results.slice(0, limit)
  };
}

module.exports = {
  searchCatalog,
  normalizeString
};
