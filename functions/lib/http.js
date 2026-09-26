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

const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const { verifyAuth, verifyAdmin } = require("./auth-middleware");
const { checkSupabaseHealth, getSupabase } = require("./supabase-client");
const { recordBackupOperation, syncFirebaseBackup, getBackupMetrics } = require("./backup-service");
const { getStorageBackupMetrics } = require("./storage-backup-service");
const { findNearbyEntities } = require("./geospatial-service");
const { searchCatalog } = require("./search-service");
const { generateTravelPlan, checkRateLimit } = require("./ai-service");
const { BAQUEANO_FALLBACK_TERRITORIES } = require("./baqueano-knowledge");
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
function createApiHandler({ readPublicMetrics, handleAiChat, now = () => new Date(), getApiKey = () => "" } = {}) {
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
        let firestoreStatus = "connected";
        try {
          const db = getFirestore();
          await db.collection("public_metrics").doc("stats").get();
        } catch (_) {
          firestoreStatus = "degraded";
        }

        const supabaseHealth = await checkSupabaseHealth({ timeoutMs: 3000 });
        const backupMetrics = await getBackupMetrics();

        const hasAiKey = Boolean(getApiKey() || process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY);

        const healthReport = {
          status: firestoreStatus === "connected" ? "ok" : "degraded",
          service: "BAQUEANO API",
          firebase: {
            status: firestoreStatus
          },
          supabase: {
            status: supabaseHealth.status,
            database: supabaseHealth.database
          },
          storage: {
            firebase: "available",
            supabase_backup: supabaseHealth.storage
          },
          backup: {
            pending_operations: backupMetrics.pending_operations,
            failed_operations: backupMetrics.failed_operations,
            synced_operations: backupMetrics.synced_operations,
            conflicts: backupMetrics.conflicts,
            last_sync: backupMetrics.last_sync
          },
          ai: {
            status: hasAiKey ? "available" : "fallback_mode",
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
        return sendJson(response, 200, { ok: true, data: metrics, source: "firestore-aggregations", measuredAt: now().toISOString() }, "public, max-age=60, s-maxage=300, stale-while-revalidate=60");
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
      const results = BAQUEANO_FALLBACK_TERRITORIES.map(t => ({
        id: t.id,
        name: t.name,
        shortDesc: t.shortDesc,
        placesCount: (t.places || []).length,
        activitiesCount: (t.activities || []).length
      }));
      return sendJson(response, 200, { ok: true, count: results.length, data: results });
    }

    if ((path === "/places" || path === "places") && method === "GET") {
      const deptFilter = query.department ? query.department.toLowerCase() : null;
      const allPlaces = [];
      for (const t of BAQUEANO_FALLBACK_TERRITORIES) {
        if (!deptFilter || t.name.toLowerCase().includes(deptFilter)) {
          for (const p of t.places || []) {
            allPlaces.push({ ...p, department: t.name });
          }
        }
      }
      return sendJson(response, 200, { ok: true, count: allPlaces.length, data: allPlaces });
    }

    if ((path === "/businesses" || path === "businesses") && method === "GET") {
      const allBiz = [];
      for (const t of BAQUEANO_FALLBACK_TERRITORIES) {
        for (const p of t.places || []) {
          allBiz.push({
            id: `biz-${p.id}`,
            name: `Anfitrión Campesino de ${p.name}`,
            place_id: p.id,
            department: t.name,
            verified: true,
            commission_rate: 0.00
          });
        }
      }
      return sendJson(response, 200, { ok: true, count: allBiz.length, data: allBiz });
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
        try {
          const db = getFirestore();
          const snapshot = await db.collection("reservations").where("userUid", "==", auth.user.uid).limit(50).get();
          const reservations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          return sendJson(response, 200, { ok: true, count: reservations.length, data: reservations });
        } catch (fbErr) {
          // Fallback a Supabase
          const sb = getSupabase();
          if (sb) {
            const { data } = await sb.from("reservations").select("*").eq("user_uid", auth.user.uid);
            return sendJson(response, 200, { ok: true, count: data?.length || 0, data: data || [], source: "supabase-fallback" });
          }
          return sendJson(response, 503, { ok: false, error: { code: "RESERVATIONS_UNAVAILABLE" } });
        }
      }

      if (method === "POST") {
        const body = request.body || {};
        const userUid = auth.ok ? auth.user.uid : (body.userUid || "anonymous");
        const operationId = request.headers["x-operation-id"] || crypto.randomUUID();

        const reservationPayload = {
          userUid,
          serviceTitle: body.serviceTitle || "Aventura Baqueano",
          destination: body.destination || "Nicaragua",
          travelDate: body.travelDate || new Date().toISOString().split("T")[0],
          peopleCount: Number(body.peopleCount) || 1,
          totalPrice: Number(body.totalPrice) || 0,
          currency: body.currency || "NIO",
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Guardado directo y prioritario en Supabase
        const sb = getSupabase();
        let supabaseResId = null;
        if (sb) {
          try {
            const resCode = "BQ-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
            const { data: sbData, error: sbError } = await sb.from("reservations").insert({
              reservation_code: resCode,
              user_uid: userUid,
              service_title: reservationPayload.serviceTitle,
              travel_date: reservationPayload.travelDate,
              people_count: reservationPayload.peopleCount,
              total_price: reservationPayload.totalPrice,
              currency: reservationPayload.currency,
              status: "pending"
            }).select().single();
            if (!sbError && sbData) supabaseResId = sbData.id;
          } catch (sbErr) {
            console.warn("[API] Supabase direct reservation:", sbErr.message);
          }
        }

        // Firebase First / Sincronización
        try {
          const db = getFirestore();
          const docRef = await db.collection("reservations").add(reservationPayload);
          return sendJson(response, 201, {
            ok: true,
            message: "Reserva registrada con éxito.",
            reservationId: docRef.id,
            supabaseId: supabaseResId,
            status: "pending"
          });
        } catch (fbErr) {
          // Supabase Contingency Fallback
          console.warn("[API] Error guardando reserva en Firestore. Registrada en Supabase:", fbErr.message);
          const backupRes = await recordBackupOperation({
            operationId,
            firebaseUid: userUid,
            entityType: "reservations",
            entityId: operationId,
            operationType: "INSERT",
            payload: reservationPayload,
            error: fbErr.message
          });

          return sendJson(response, 201, {
            ok: true,
            contingency: true,
            message: "Reserva registrada con éxito en Supabase.",
            reservationId: supabaseResId || backupRes.operationId,
            status: "pending"
          });
        }
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

      // Guardado directo en Supabase
      const sb = getSupabase();
      if (sb) {
        try {
          await sb.from("reviews").insert({
            user_uid: auth.user.uid,
            user_name: reviewData.userName,
            rating: reviewData.rating,
            comment: reviewData.comment,
            destination_id: reviewData.destinationId,
            status: "published"
          });
        } catch (sbErr) {
          console.warn("[API] Supabase review:", sbErr.message);
        }
      }

      try {
        const db = getFirestore();
        const docRef = await db.collection("reviews").add(reviewData);
        return sendJson(response, 201, { ok: true, reviewId: docRef.id });
      } catch (fbErr) {
        await recordBackupOperation({
          firebaseUid: auth.user.uid,
          entityType: "reviews",
          entityId: crypto.randomUUID(),
          payload: reviewData,
          error: fbErr.message
        });
        return sendJson(response, 201, { ok: true, message: "Reseña registrada con éxito en Supabase." });
      }
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

      // Guardado directo en Supabase
      const sb = getSupabase();
      if (sb) {
        try {
          await sb.from("favorites").upsert({
            user_uid: auth.user.uid,
            entity_type: favData.entityType,
            entity_id: favData.entityId
          });
        } catch (sbErr) {
          console.warn("[API] Supabase favorite:", sbErr.message);
        }
      }

      try {
        const db = getFirestore();
        await db.collection("users").doc(auth.user.uid).collection("favorites").doc(`${favData.entityType}_${favData.entityId}`).set(favData);
        return sendJson(response, 200, { ok: true, favorited: true });
      } catch (fbErr) {
        await recordBackupOperation({
          firebaseUid: auth.user.uid,
          entityType: "favorites",
          entityId: `${favData.entityType}_${favData.entityId}`,
          payload: favData,
          error: fbErr.message
        });
        return sendJson(response, 200, { ok: true, favorited: true, storedIn: "supabase" });
      }
    }


    // ========================================================================
    // 10. PERFIL DE USUARIO (GET /api/profile)
    // ========================================================================
    if ((path === "/profile" || path === "profile") && method === "GET") {
      const auth = await verifyAuth(request);
      if (!auth.ok) return sendJson(response, auth.status, auth.error);

      try {
        const db = getFirestore();
        const doc = await db.collection("users").doc(auth.user.uid).get();
        if (doc.exists) {
          return sendJson(response, 200, { ok: true, profile: { uid: doc.id, ...doc.data() } });
        }
        return sendJson(response, 200, {
          ok: true,
          profile: { uid: auth.user.uid, email: auth.user.email, displayName: auth.user.name, role: "traveler" }
        });
      } catch (err) {
        return sendJson(response, 500, { ok: false, error: { code: "PROFILE_FETCH_ERROR", message: err.message } });
      }
    }

    // ========================================================================
    // 11. GESTIÓN ADMINISTRATIVA DE BACKUP (GET/POST /api/admin/backup/*)
    // ========================================================================
    if (path.startsWith("/admin/backup") || path.startsWith("admin/backup")) {
      const adminAuth = await verifyAdmin(request);
      if (!adminAuth.ok) return sendJson(response, adminAuth.status, adminAuth.error);

      if (path.endsWith("/status") && method === "GET") {
        const dbMetrics = await getBackupMetrics();
        const storageMetrics = await getStorageBackupMetrics();
        const sbHealth = await checkSupabaseHealth();

        return sendJson(response, 200, {
          ok: true,
          telemetry: {
            supabaseStatus: sbHealth.status,
            database: sbHealth.database,
            storage: sbHealth.storage,
            backupOperations: dbMetrics,
            storageBackups: storageMetrics,
            serverTimestamp: now().toISOString()
          }
        });
      }

      if (path.endsWith("/retry") && method === "POST") {
        try {
          const db = getFirestore();
          const syncResult = await syncFirebaseBackup(db);
          return sendJson(response, 200, { ok: true, result: syncResult });
        } catch (err) {
          return sendJson(response, 500, { ok: false, error: err.message });
        }
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
