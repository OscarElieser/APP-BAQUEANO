// ============================================================================
// 🧭 BAQUEANO — WEBSITE BUILDER DEL OPS CENTER EN SUPABASE (baqueano-cms)
// ============================================================================
// 🎯 POR QUÉ: 2026-10-15 el propietario guardó un componente en Ops Center → Website
//   Builder y recibió «Error al guardar: Firestore no disponible». La fuente de verdad del
//   proyecto es Supabase; el Builder seguía escribiendo en Firestore (site_pages).
// ⚙️ CÓMO: misma verificación que baqueano-ops (token de Firebase verificado con las
//   claves públicas de Google, rol en staff_roles y revocación en el RBAC de Supabase).
//   Escribe con la clave de servicio en public.site_pages; la lectura es pública por RLS.
//   Cada guardado queda en audit_logs con antes y después.
// 📦 QUÉ (POST { action, ... }):
//   - site_page_save { page_id, title?, sections[] } → requiere admin o super_admin.
//   - site_page_get  { page_id } → cualquier personal autorizado.
// ============================================================================
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5.9.6";
import { effectiveStaffRole } from "../_shared/staff-revocation.ts";

const FIREBASE_PROJECT_ID = "app-baqueano";
const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));
const MAX_BODY_BYTES = 300 * 1024;
const MAX_SECTIONS = 400;
const ALLOWED_ORIGINS = new Set([
  "https://baqueanonicaragua.com",
  "https://www.baqueanonicaragua.com",
  "https://app-baqueano.oscarelieser-informatica-inatec.workers.dev",
  "https://app-baqueano.web.app",
  "https://app-baqueano.firebaseapp.com",
]);
const STAFF_ROLES = new Set(["super_admin", "admin", "auditor"]);

type Actor = { uid: string; email: string; role: string; canWrite: boolean };
class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && (ALLOWED_ORIGINS.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));
  return {
    "Access-Control-Allow-Origin": allowed ? origin! : "https://baqueanonicaragua.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, x-firebase-token, apikey, x-client-info, authorization",
    "Vary": "Origin",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  };
}
const reply = (status: number, body: Record<string, unknown>, origin: string | null) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders(origin) });

async function resolveActor(req: Request, service: SupabaseClient): Promise<Actor> {
  const token = req.headers.get("x-firebase-token") || "";
  if (!token) throw new HttpError(401, "Iniciá sesión con tu cuenta autorizada.");
  let claims: Record<string, unknown>;
  try {
    claims = (await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    })).payload as Record<string, unknown>;
  } catch {
    throw new HttpError(401, "Tu sesión venció. Volvé a iniciar sesión.");
  }
  const uid = String(claims.sub || "");
  const email = typeof claims.email === "string" ? claims.email.toLowerCase() : "";
  const emailVerified = claims.email_verified === true;
  let role = typeof claims.role === "string" && STAFF_ROLES.has(claims.role) ? claims.role : (claims.admin === true ? "admin" : "");
  if (!role && email && emailVerified) {
    const { data } = await service.from("staff_roles").select("role").eq("email", email).eq("is_active", true).maybeSingle();
    if (data && STAFF_ROLES.has(data.role)) role = data.role;
  }
  if (role) role = await effectiveStaffRole(service, { uid, email: email || null, emailVerified, role });
  if (!uid || !role) throw new HttpError(403, "Tu cuenta no tiene acceso al Ops Center.");
  return { uid, email, role, canWrite: role === "admin" || role === "super_admin" };
}

function pageIdOf(value: unknown): string {
  const id = String(value || "").trim().toLowerCase();
  if (!/^[a-z0-9_-]{1,60}$/.test(id)) throw new HttpError(400, "Página inválida.");
  return id;
}

// Solo objetos planos con id de texto; se descarta lo que no sea JSON serializable.
function cleanSections(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) throw new HttpError(400, "Las secciones deben ser una lista.");
  if (value.length > MAX_SECTIONS) throw new HttpError(400, `Máximo ${MAX_SECTIONS} secciones por página.`);
  return value.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new HttpError(400, `Sección ${index + 1} inválida.`);
    const section = JSON.parse(JSON.stringify(item)) as Record<string, unknown>;
    if (typeof section.id !== "string" || !section.id.trim() || section.id.length > 120) throw new HttpError(400, `La sección ${index + 1} no tiene id válido.`);
    return section;
  });
}

async function audit(service: SupabaseClient, req: Request, actor: Actor, pageId: string, description: string, before: unknown, after: unknown) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || null;
  await service.from("audit_logs").insert({
    admin_email: actor.email || actor.uid,
    ip_address: ip,
    user_agent: (req.headers.get("user-agent") || "").slice(0, 300),
    action: "PAGE_SECTION_SAVED",
    module: "Website Builder",
    target_entity: "site_pages",
    target_id: pageId,
    description: description.slice(0, 500),
    payload: { uid: actor.uid, role: actor.role, result: "ok", origin: "ops-center", before, after },
  });
}

async function handle(action: string, body: Record<string, unknown>, actor: Actor, service: SupabaseClient, req: Request) {
  switch (action) {
    case "site_page_get": {
      const pageId = pageIdOf(body.page_id);
      const { data, error } = await service.from("site_pages").select("page_id,title,sections,updated_at,updated_by").eq("page_id", pageId).maybeSingle();
      if (error) throw new HttpError(500, "No se pudo leer la página.");
      return { page: data || null };
    }
    case "site_page_save": {
      if (!actor.canWrite) throw new HttpError(403, "Rol de solo lectura: esta acción requiere un administrador.");
      const pageId = pageIdOf(body.page_id);
      const sections = cleanSections(body.sections);
      const title = String(body.title || "").slice(0, 160) || null;
      const { data: before } = await service.from("site_pages").select("sections").eq("page_id", pageId).maybeSingle();
      const row = { page_id: pageId, title, sections, updated_at: new Date().toISOString(), updated_by: actor.email || actor.uid };
      const { error } = await service.from("site_pages").upsert(row, { onConflict: "page_id" });
      if (error) throw new HttpError(500, "No se pudo guardar la página.");
      const changed = String(body.section_name || "").slice(0, 160);
      await audit(service, req, actor, pageId, `Sección ${changed ? `«${changed}» ` : ""}guardada en ${pageId}.html`, before?.sections ?? null, sections);
      return { page_id: pageId, sections: sections.length, updated_at: row.updated_at };
    }
    default:
      throw new HttpError(400, "Acción no válida.");
  }
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });
  if (req.method !== "POST") return reply(405, { ok: false, error: "Usá POST." }, origin);
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) throw new HttpError(413, "La solicitud es demasiado grande.");
    let body: Record<string, unknown>;
    try { body = JSON.parse(raw || "{}"); } catch { throw new HttpError(400, "JSON inválido."); }
    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const actor = await resolveActor(req, service);
    const result = await handle(String(body.action || ""), body, actor, service, req);
    return reply(200, { ok: true, ...result }, origin);
  } catch (error) {
    if (error instanceof HttpError) return reply(error.status, { ok: false, error: error.message }, origin);
    console.error("[baqueano-cms]", error);
    return reply(500, { ok: false, error: "Error interno. Intentá de nuevo en unos minutos." }, origin);
  }
});
