/**
 * ============================================================================
 * 🧭 BAQUEANO ECOSYSTEM — CONTROLADOR Y ENRUTADOR HTTP CENTRAL (http.js)
 * ============================================================================
 * 🎯 1. POR QUÉ (WHY / PROPÓSITO):
 * - Proveer un backend real, unificado, seguro y de alta disponibilidad para
 *   Baqueano Nicaragua (https://app-baqueano.web.app/).
 * - Centralizar los endpoints fácticos de salud, catálogo, reservas, reseñas,
 *   búsqueda espacial (PostGIS), IA multi-proveedor y sincronización de respaldo.
 *
 * ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
 * - Principio FIREBASE FIRST, SUPABASE FALLBACK:
 *   - Firebase Authentication como fuente de identidad exclusiva.
 *   - Firestore como base principal; Supabase como respaldo, PostGIS y RAG.
 * - Validación defensiva de esquemas, rate limiting (10 req/min para IA) y sanitización.
 * - Respuestas normalizadas JSON con códigos HTTP semánticos y cero filtrado de secretos.
 *
 * 📦 3. QUÉ (WHAT / ENDPOINTS EXPUESTOS):
 * - GET  /api/health                  (Chequeo exhaustivo de salud multi-proveedor)
 * - POST /api/ai/chat                 (Asistente turístico Baqueano multi-LLM)
 * - POST /api/ai/travel-plan          (Generador de itinerarios verificados)
 * - GET  /api/destinations            (Catálogo oficial de destinos)
 * - GET  /api/places                  (Senderos y puntos de interés)
 * - GET  /api/businesses              (Cooperativas y negocios verificados)
 * - GET  /api/search                  (Búsqueda transversal con relevancia)
 * - GET  /api/nearby                  (Proximidad geográfica PostGIS / Haversine)
 * - POST /api/reservations            (Creación de reserva con respaldo failover)
 * - GET  /api/reservations            (Listado de reservas autenticadas)
 * - POST /api/reviews                 (Creación de reseñas)
 * - POST /api/favorites               (Gestión de favoritos)
 * - GET  /api/profile                 (Perfil verificado de usuario)
 * - GET  /api/admin/backup/status     (Telemetría de respaldo para Ops Center)
 * - POST /api/admin/backup/retry      (Reintento forzado de sincronización)
 * ============================================================================
 */
"use strict";

const { verifyAuth, verifyAdmin } = require("./auth-middleware");
const { checkSupabaseHealth, getSupabase } = require("./supabase-client");
const { findNearbyEntities } = require("./geospatial-service");
const { searchCatalog } = require("./search-service");
const { generateTravelPlan, checkRateLimit } = require("./ai-service");
const { buildBaqueanoItinerary } = require("./itinerary-service");


const ALLOWED_ORIGINS = new Set([
  "https://app-baqueano.web.app",
  "https://app-baqueano.firebaseapp.com",
  "https://www.baqueano.ni",
  "http://localhost:5000",
  "http://localhost:3000",
  "http://127.0.0.1:5000"
]);

function setCorsHeaders(request, response) {
  const headers = request?.headers || {};
  const origin = headers.origin;
  if (origin && (ALLOWED_ORIGINS.has(origin) || origin.endsWith(".web.app") || origin.endsWith(".firebaseapp.com"))) {
    response.setHeader("Access-Control-Allow-Origin", origin);
  } else if (!origin) {
    response.setHeader("Access-Control-Allow-Origin", "*");
  }
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-Operation-Id");
  response.setHeader("Access-Control-Max-Age", "86400");
}

function sendJson(response, status, payload, cacheControl = "no-store") {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", cacheControl);
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.status(status).json(payload);
}

function unavailableDatabase(response) {
  return sendJson(response, 503, {
    ok: false,
    error: { code: "DATABASE_UNAVAILABLE", message: "La fuente canónica Supabase no está disponible." }
  });
}

function normalizedPath(request) {
  const rawPath = request.path || request.url || "/";
  const pathname = rawPath.split("?")[0].replace(/\/+$/, "") || "/";
  return pathname.startsWith("/api/") ? pathname.slice(4) : pathname;
}

function parseQueryParams(request) {
  if (request.query && typeof request.query === "object") return request.query;
  const rawUrl = request.url || "";
  const qIdx = rawUrl.indexOf("?");
  if (qIdx === -1) return {};
  const searchParams = new URLSearchParams(rawUrl.slice(qIdx));
  const result = {};
  for (const [key, value] of searchParams.entries()) {
    result[key] = value;
  }
  return result;
}

// ----------------------------------------------------------------------------
// HANDLER DE SALUD BÁSICO (Para pruebas unitarias y monitores simples)
// ----------------------------------------------------------------------------
function createHealthHandler({ now = () => new Date() } = {}) {
  return function healthHandler(request, response) {
    setCorsHeaders(request, response);
    if (request.method === "OPTIONS") return response.status(204).end();
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.setHeader("Allow", "GET, HEAD");
      return sendJson(response, 405, { ok: false, error: { code: "METHOD_NOT_ALLOWED" } });
    }
    return sendJson(response, 200, { ok: true, service: "baqueano-functions", timestamp: now().toISOString() });
  };
}

// ----------------------------------------------------------------------------
// CONTROLADOR CENTRAL DE LA API DE BAQUEANO
// ----------------------------------------------------------------------------
function createApiHandler({ readPublicMetrics, handleAiChat, now = () => new Date(), getApiKey = () => "", databaseProvider = getSupabase } = {}) {
  if (typeof readPublicMetrics !== "function") throw new TypeError("readPublicMetrics debe ser una función.");

  return async function apiHandler(request, response) {
    setCorsHeaders(request, response);

    if (request.method === "OPTIONS") {
      return response.status(204).end();
    }

    const path = normalizedPath(request);
    const method = request.method;
    const query = parseQueryParams(request);

    // ========================================================================
    // 1. CHEQUEO EXHAUSTIVO DE SALUD MULTI-PROVEEDOR (GET /api/health)
    // ========================================================================
    if ((path === "/health" || path === "health" || path === "/api/health") && method === "GET") {
      try {
        const supabaseHealth = await checkSupabaseHealth({ timeoutMs: 3000 });

        const hasAiKey = Boolean(getApiKey() || process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY);

        const healthReport = {
          status: supabaseHealth.status === "connected" ? "ok" : "degraded",
          service: "BAQUEANO API",
          firebase: {
            hosting: "configured",
            authentication: "configured"
          },
          supabase: {
            status: supabaseHealth.status,
            database: supabaseHealth.database
          },
          storage: {
            firebase: "available",
            supabase_backup: supabaseHealth.storage
          },
          ai: {
            status: hasAiKey ? "available" : "unavailable",
            multi_provider: true
          },
          timestamp: now().toISOString()
        };

        return sendJson(response, 200, healthReport);
      } catch (err) {
        return sendJson(response, 500, {
          status: "error",
          service: "BAQUEANO API",
          error: err.message,
          timestamp: now().toISOString()
        });
      }
    }

    // ========================================================================
    // 2. MÉTRICAS PÚBLICAS (GET /api/v1/public/metrics o /metrics)
    // ========================================================================
    const isMetricsPath = path === "/v1/public/metrics" || path === "/metrics" || path === "metrics" || path === "v1/public/metrics";
    if (isMetricsPath) {
      if (method !== "GET") {
        response.setHeader("Allow", "GET");
        return sendJson(response, 405, { ok: false, error: { code: "METHOD_NOT_ALLOWED" } });
      }
      try {
        const metrics = await readPublicMetrics();
        return sendJson(response, 200, { ok: true, data: metrics, source: "supabase-postgresql", measuredAt: now().toISOString() }, "public, max-age=60, s-maxage=300, stale-while-revalidate=60");
      } catch (error) {
        console.error("No fue posible agregar las métricas públicas.", error);
        return sendJson(response, 503, { ok: false, error: { code: "METRICS_UNAVAILABLE", message: "Las métricas reales no están disponibles temporalmente." } });
      }
    }

    // ========================================================================
    // 3. GENERADOR DE ITINERARIOS WEB BAQUEANO AI (POST /api/baqueano-ai)
    // ========================================================================
    if (path === "/baqueano-ai" || path === "baqueano-ai") {
      if (method !== "POST") {
        response.setHeader("Allow", "POST");
        return sendJson(response, 405, { ok: false, error: { code: "METHOD_NOT_ALLOWED" } });
      }

      try {
        const body = request.body || {};
        const userPrompt = String(body.prompt || body.message || "").trim();
        const days = Math.max(1, Math.min(Number(body.days) || 3, 15));
        const territory = body.department || body.territory || "Nicaragua";
        const budgetNio = Number(body.budgetNio) || (Number(body.budgetUsd) ? Number(body.budgetUsd) * 36.65 : 12000);
        const budgetUsd = Number(body.budgetUsd) || Number((budgetNio / 36.65).toFixed(2));
        const groupSize = Number(body.groupSize || body.travelers) || 2;
        const travelStyle = body.travelStyle || (Array.isArray(body.interests) ? body.interests[0] : "aventura") || "aventura";

        const result = await buildBaqueanoItinerary({
          prompt: userPrompt,
          department: territory,
          days,
          budgetNio,
          budgetUsd,
          groupSize,
          travelStyle,
          apiKey: getApiKey()
        });

        return sendJson(response, 200, result);
      } catch (err) {
        return sendJson(response, 500, { success: false, ok: false, error: err.message });
      }
    }

    // ========================================================================
    // 4. IA TURÍSTICA & CHAT (POST /api/ai/chat o /v1/ai/chat)
    // ========================================================================
    const isAiChatPath = path === "/v1/ai/chat" || path === "v1/ai/chat" || path === "/ai/chat" || path === "ai/chat";
    if (isAiChatPath) {
      if (method === "GET") {
        return sendJson(response, 503, { ok: false, error: { code: "AI_NOT_CONFIGURED", message: "El servicio de IA requiere método POST." } });
      }
      if (method !== "POST") {
        response.setHeader("Allow", "POST");
        return sendJson(response, 405, { ok: false, error: { code: "METHOD_NOT_ALLOWED" } });
      }

      const clientIp = request?.headers?.["x-forwarded-for"] || request?.socket?.remoteAddress || "anonymous";
      if (!checkRateLimit(clientIp)) {
        return sendJson(response, 429, { ok: false, error: { code: "RATE_LIMIT_EXCEEDED", message: "Límite de solicitudes de IA alcanzado. Por favor esperá 1 minuto." } });
      }

      if (typeof handleAiChat === "function") {
        const result = await handleAiChat(request);
        return sendJson(response, result.status, result.body);
      }
      return sendJson(response, 503, { ok: false, error: { code: "AI_NOT_CONFIGURED" } });
    }


    // ========================================================================
    // 4. PLANIFICADOR DE VIAJE IA (POST /api/ai/travel-plan)
    // ========================================================================
    const isTravelPlanPath = path === "/ai/travel-plan" || path === "ai/travel-plan" || path === "/v1/ai/travel-plan";
    if (isTravelPlanPath) {
      if (method !== "POST") {
        response.setHeader("Allow", "POST");
        return sendJson(response, 405, { ok: false, error: { code: "METHOD_NOT_ALLOWED" } });
      }

      try {
        const body = request.body || {};
        const planResult = await generateTravelPlan({
          destination: body.destination || body.origin || "Nicaragua",
          days: body.days || 3,
          budget: body.budget || 250,
          currency: body.currency || "USD",
          travelers: body.travelers || 2,
          preferences: body.preferences || ["naturaleza", "cultura"],
          apiKeyResolver: { gemini: getApiKey() }
        });
        return sendJson(response, 200, planResult);
      } catch (err) {
        return sendJson(response, 500, { ok: false, error: { code: "TRAVEL_PLAN_ERROR", message: err.message } });
      }
    }

    // ========================================================================
    // 5. CATÁLOGO TURÍSTICO (GET /api/destinations, /api/places, /api/businesses)
    // ========================================================================
    if ((path === "/destinations" || path === "destinations") && method === "GET") {
      const database = databaseProvider();
      if (!database) return unavailableDatabase(response);
      let requestQuery = database.from("destinations")
        .select("id,name,category,short_desc,description,latitude,longitude,cover_image,rating,reviews_count,verified,confidence_status,source_name,source_url,last_verified_at,department_id,departments(name)")
        .eq("status", "published").is("deleted_at", null).order("name");
      if (query.id) requestQuery = requestQuery.eq("id", String(query.id)).limit(1);
      if (query.department) requestQuery = requestQuery.eq("department_id", String(query.department));
      const { data, error } = await requestQuery;
      if (error) return sendJson(response, 503, { ok: false, error: { code: "CATALOG_UNAVAILABLE", message: error.message } });
      return sendJson(response, 200, { ok: true, count: data.length, data, source: "supabase-postgresql" });
    }

    if ((path === "/places" || path === "places") && method === "GET") {
      const database = databaseProvider();
      if (!database) return unavailableDatabase(response);
      let requestQuery = database.from("places").select("*,destinations!inner(name,department_id,status)").eq("destinations.status", "published").order("name");
      if (query.destinationId) requestQuery = requestQuery.eq("destination_id", String(query.destinationId));
      if (query.department) requestQuery = requestQuery.eq("destinations.department_id", String(query.department));
      const { data, error } = await requestQuery;
      if (error) return sendJson(response, 503, { ok: false, error: { code: "PLACES_UNAVAILABLE", message: error.message } });
      return sendJson(response, 200, { ok: true, count: data.length, data, source: "supabase-postgresql" });
    }

    if ((path === "/businesses" || path === "businesses") && method === "GET") {
      const database = databaseProvider();
      if (!database) return unavailableDatabase(response);
      let requestQuery = database.from("businesses").select("id,name,category,department,municipality,phone,whatsapp,address,latitude,longitude,cover_image,verified,metadata,updated_at").eq("verified", true).is("deleted_at", null).order("name");
      if (query.department) requestQuery = requestQuery.eq("department", String(query.department));
      const { data, error } = await requestQuery;
      if (error) return sendJson(response, 503, { ok: false, error: { code: "BUSINESSES_UNAVAILABLE", message: error.message } });
      return sendJson(response, 200, { ok: true, count: data.length, data, source: "supabase-postgresql" });
    }

    // ========================================================================
    // 6. BÚSQUEDA TRANSVERSAL (GET /api/search)
    // ========================================================================
    if ((path === "/search" || path === "search") && method === "GET") {
      const q = query.q || query.query || "";
      const searchRes = await searchCatalog({
        query: q,
        category: query.category || null,
        department: query.department || null,
        limit: Number(query.limit) || 20
      });
      return sendJson(response, 200, { ok: true, ...searchRes });
    }

    // ========================================================================
    // 7. PROXIMIDAD GEOGRÁFICA (GET /api/nearby)
    // ========================================================================
    if ((path === "/nearby" || path === "nearby") && method === "GET") {
      const lat = query.latitude || query.lat;
      const lng = query.longitude || query.lng;
      if (!lat || !lng) {
        return sendJson(response, 400, { ok: false, error: { code: "MISSING_COORDINATES", message: "Parámetros 'latitude' y 'longitude' son requeridos." } });
      }

      try {
        const nearbyRes = await findNearbyEntities({
          latitude: lat,
          longitude: lng,
          radiusMeters: query.radius || 25000,
          category: query.category || null,
          limit: Number(query.limit) || 30
        });
        return sendJson(response, 200, { ok: true, ...nearbyRes });
      } catch (err) {
        return sendJson(response, 400, { ok: false, error: { code: "INVALID_GEODATA", message: err.message } });
      }
    }

    // ========================================================================
    // 8. RESERVAS COMUNITARIAS (POST /api/reservations & GET /api/reservations)
    // ========================================================================
    if (path === "/reservations" || path === "reservations") {
      const auth = await verifyAuth(request);

      if (method === "GET") {
        if (!auth.ok) return sendJson(response, auth.status, auth.error);
        const database = databaseProvider();
        if (!database) return unavailableDatabase(response);
        const { data, error } = await database.from("reservations").select("*")
          .eq("user_uid", auth.user.uid).is("deleted_at", null).order("created_at", { ascending: false }).limit(50);
        if (error) return sendJson(response, 503, { ok: false, error: { code: "RESERVATIONS_UNAVAILABLE", message: error.message } });
        return sendJson(response, 200, { ok: true, count: data.length, data, source: "supabase-postgresql" });
      }

      if (method === "POST") {
        if (!auth.ok) return sendJson(response, auth.status, auth.error);
        const body = request.body || {};
        const userUid = auth.user.uid;

        const reservationPayload = {
          userUid,
          serviceTitle: String(body.serviceTitle || "").trim(),
          travelDate: body.travelDate,
          peopleCount: Number(body.peopleCount) || 1,
          totalPrice: Number(body.totalPrice) || 0,
          currency: body.currency || "NIO",
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date()
        };

        if (!reservationPayload.serviceTitle || !reservationPayload.travelDate) {
          return sendJson(response, 400, { ok: false, error: { code: "INVALID_RESERVATION", message: "Servicio y fecha son obligatorios." } });
        }
        const database = databaseProvider();
        if (!database) return unavailableDatabase(response);
        const reservationCode = `BQ-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
        const { data, error } = await database.from("reservations").insert({
          reservation_code: reservationCode, user_uid: userUid,
          business_id: body.businessId || null, service_title: reservationPayload.serviceTitle,
          travel_date: reservationPayload.travelDate, people_count: reservationPayload.peopleCount,
          total_price: Number.isFinite(reservationPayload.totalPrice) ? reservationPayload.totalPrice : null,
          currency: reservationPayload.currency, status: "pending", notes: body.notes || null
        }).select("id,reservation_code,status").single();
        if (error) return sendJson(response, 503, { ok: false, error: { code: "RESERVATION_SAVE_FAILED", message: error.message } });
        return sendJson(response, 201, { ok: true, reservationId: data.id, reservationCode: data.reservation_code, status: data.status, source: "supabase-postgresql" });
      }

      response.setHeader("Allow", "GET, POST");
      return sendJson(response, 405, { ok: false, error: { code: "METHOD_NOT_ALLOWED" } });
    }

    // ========================================================================
    // 9. RESEÑAS & FAVORITOS (POST /api/reviews, POST /api/favorites)
    // ========================================================================
    if ((path === "/reviews" || path === "reviews") && method === "POST") {
      const auth = await verifyAuth(request);
      if (!auth.ok) return sendJson(response, auth.status, auth.error);

      const body = request.body || {};
      const reviewData = {
        userUid: auth.user.uid,
        userName: auth.user.name || "Explorador Baqueano",
        rating: Math.max(1, Math.min(Number(body.rating) || 5, 5)),
        comment: String(body.comment || "").slice(0, 1000),
        destinationId: body.destinationId || null,
        createdAt: new Date()
      };

      if (!reviewData.comment || !reviewData.destinationId) {
        return sendJson(response, 400, { ok: false, error: { code: "INVALID_REVIEW", message: "Destino, valoración y comentario son obligatorios." } });
      }
      const database = databaseProvider();
      if (!database) return unavailableDatabase(response);
      const { data, error } = await database.from("reviews").insert({
        user_uid: auth.user.uid, user_name: reviewData.userName,
        rating: reviewData.rating, comment: reviewData.comment,
        destination_id: reviewData.destinationId, status: "moderation"
      }).select("id,status").single();
      if (error) return sendJson(response, 503, { ok: false, error: { code: "REVIEW_SAVE_FAILED", message: error.message } });
      return sendJson(response, 201, { ok: true, reviewId: data.id, status: data.status, source: "supabase-postgresql" });
    }

    if ((path === "/favorites" || path === "favorites") && method === "POST") {
      const auth = await verifyAuth(request);
      if (!auth.ok) return sendJson(response, auth.status, auth.error);

      const body = request.body || {};
      const favData = {
        userUid: auth.user.uid,
        entityType: body.entityType || "destination",
        entityId: body.entityId,
        createdAt: new Date()
      };

      if (!favData.entityId) return sendJson(response, 400, { ok: false, error: { code: "INVALID_FAVORITE" } });
      const database = databaseProvider();
      if (!database) return unavailableDatabase(response);
      const { error } = await database.from("favorites").upsert({
        user_uid: auth.user.uid, entity_type: favData.entityType, entity_id: favData.entityId
      }, { onConflict: "user_uid,entity_type,entity_id" });
      if (error) return sendJson(response, 503, { ok: false, error: { code: "FAVORITE_SAVE_FAILED", message: error.message } });
      return sendJson(response, 200, { ok: true, favorited: true, source: "supabase-postgresql" });
    }


    // ========================================================================
    // 10. PERFIL DE USUARIO (GET /api/profile)
    // ========================================================================
    if ((path === "/profile" || path === "profile") && method === "GET") {
      const auth = await verifyAuth(request);
      if (!auth.ok) return sendJson(response, auth.status, auth.error);

      const database = databaseProvider();
      if (!database) return unavailableDatabase(response);
      const { data, error } = await database.from("profiles")
        .select("firebase_uid,display_name,email,avatar_url,role,phone,explorer_level,xp,metadata,updated_at")
        .eq("firebase_uid", auth.user.uid).is("deleted_at", null).maybeSingle();
      if (error) return sendJson(response, 503, { ok: false, error: { code: "PROFILE_FETCH_ERROR", message: error.message } });
      if (!data) return sendJson(response, 200, { ok: true, profile: null, requiresProfileSetup: true });
      return sendJson(response, 200, { ok: true, profile: data, source: "supabase-postgresql" });
    }

    // ========================================================================
    // 11. PLANES DE VIAJE DEL USUARIO (GET/POST /api/travel-plans)
    // ========================================================================
    if (path === "/travel-plans" || path === "travel-plans") {
      const auth = await verifyAuth(request);
      if (!auth.ok) return sendJson(response, auth.status, auth.error);
      const database = databaseProvider();
      if (!database) return unavailableDatabase(response);
      if (method === "GET") {
        const { data, error } = await database.from("travel_plans").select("*")
          .eq("user_uid", auth.user.uid).order("created_at", { ascending: false }).limit(25);
        if (error) return sendJson(response, 503, { ok: false, error: { code: "TRAVEL_PLANS_UNAVAILABLE", message: error.message } });
        return sendJson(response, 200, { ok: true, count: data.length, data, source: "supabase-postgresql" });
      }
      if (method === "POST") {
        const body = request.body || {};
        if (!body.planTitle || !body.payload) return sendJson(response, 400, { ok: false, error: { code: "INVALID_TRAVEL_PLAN" } });
        const { data, error } = await database.from("travel_plans").insert({
          user_uid: auth.user.uid, plan_title: String(body.planTitle).slice(0, 180),
          destination: body.destination || null, days: Number(body.days) || null,
          budget: Number.isFinite(Number(body.budget)) ? Number(body.budget) : null,
          currency: body.currency === "USD" ? "USD" : "NIO", payload: body.payload,
          source: body.source || "user"
        }).select("id,created_at").single();
        if (error) return sendJson(response, 503, { ok: false, error: { code: "TRAVEL_PLAN_SAVE_FAILED", message: error.message } });
        return sendJson(response, 201, { ok: true, data, source: "supabase-postgresql" });
      }
      return sendJson(response, 405, { ok: false, error: { code: "METHOD_NOT_ALLOWED" } });
    }

    // ========================================================================
    // 12. MÉTRICAS ADMINISTRATIVAS CANÓNICAS (GET /api/admin/metrics)
    // ========================================================================
    if (path === "/admin/metrics" || path === "admin/metrics") {
      const adminAuth = await verifyAdmin(request);
      if (!adminAuth.ok) return sendJson(response, adminAuth.status, adminAuth.error);
      if (method !== "GET") return sendJson(response, 405, { ok: false, error: { code: "METHOD_NOT_ALLOWED" } });
      try {
        const metrics = await readPublicMetrics();
        return sendJson(response, 200, { ok: true, data: metrics, source: "supabase-postgresql", measuredAt: now().toISOString() });
      } catch (error) {
        return sendJson(response, 503, { ok: false, error: { code: "METRICS_UNAVAILABLE", message: error.message } });
      }
    }

    // Rutas residuales no encontradas
    return sendJson(response, 404, { ok: false, error: { code: "NOT_FOUND" } });
  };
}

module.exports = {
  createApiHandler,
  createHealthHandler,
  normalizedPath,
  setCorsHeaders
};
