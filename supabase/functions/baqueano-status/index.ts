// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SUPABASE EDGE FUNCTION: STATUS & TELEMETRY
// ============================================================================
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer un punto de verificación perimetral sin generar intentos anónimos
//   contra tablas privadas ni ruido de permisos en los registros de Postgres.
// - Servir al Centro de Operaciones y al sitio oficial en Azure sin exponer
//   credenciales administrativas ni convertir RLS en una falsa señal de falla.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Ejecutado en Deno / V8 Edge Runtime desplegado globalmente.
// - Usa `SUPABASE_SERVICE_ROLE_KEY` únicamente dentro del runtime servidor para
//   leer conteos operativos protegidos. La llave nunca aparece en la respuesta.
// - CORS se limita a orígenes oficiales y desarrollo local.
// - Ejecuta las verificaciones en paralelo y devuelve 503 si alguna falla.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & CONTRATO):
// - Endpoint HTTP GET /baqueano-status
// - Salida JSON estructurada con estado de servicios, componentes activos y latencia.
// ============================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = new Set([
  "https://baqueanonicaragua.com",
  "https://www.baqueanonicaragua.com",
]);

function responseHeaders(origin: string | null): Record<string, string> {
  const isLocal = origin != null && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const allowedOrigin = origin && (ALLOWED_ORIGINS.has(origin) || isLocal)
    ? origin
    : "https://baqueanonicaragua.com";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
}

Deno.serve(async (req: Request) => {
  const headers = responseHeaders(req.headers.get("origin"));
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ ok: false, error: "Método no permitido." }), {
      status: 405,
      headers: { ...headers, "Allow": "GET, OPTIONS" },
    });
  }

  const startTime = performance.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Configuración interna incompleta");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const [destinationsResult, placesResult, businessesResult, operationsResult] = await Promise.all([
      supabase.from("destinations").select("id", { count: "exact", head: true }),
      supabase.from("places").select("id", { count: "exact", head: true }),
      supabase.from("businesses").select("id", { count: "exact", head: true }),
      supabase.from("backup_operations").select("id", { count: "exact", head: true }),
    ]);
    const errors = [
      destinationsResult.error,
      placesResult.error,
      businessesResult.error,
      operationsResult.error,
    ].filter(Boolean);
    const isOperational = errors.length === 0;
    const destinations = destinationsResult.count ?? 0;
    const places = placesResult.count ?? 0;
    const businesses = businessesResult.count ?? 0;

    const latencyMs = Math.round(performance.now() - startTime);

    const payload = {
      ok: isOperational,
      service: "Baqueano Supabase Edge Runtime",
      region: Deno.env.get("DENO_REGION") || "edge-global",
      status: isOperational ? "operational" : "degraded",
      latency_ms: latencyMs,
      features: {
        postgis: true,
        pgvector: true,
        failover_queue: !operationsResult.error,
        storage_replica: true,
      },
      counts: {
        destinations,
        places,
        businesses,
        catalog_total: destinations + places + businesses,
        pending_failovers: operationsResult.count ?? 0,
      },
      server_time: new Date().toISOString(),
    };

    return new Response(JSON.stringify(payload, null, 2), {
      status: isOperational ? 200 : 503,
      headers,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify(
        {
          ok: false,
          service: "Baqueano Supabase Edge Runtime",
          status: "error",
          error: errorMessage,
          server_time: new Date().toISOString(),
        },
        null,
        2
      ),
      {
        status: 500,
        headers,
      }
    );
  }
});
