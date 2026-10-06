// ============================================================================
// 🔐 BAQUEANO — EDGE FUNCTION: IDENTIDAD, ROLES Y GESTIÓN DE USUARIOS
// ============================================================================
// 🎯 POR QUÉ:
// - Supabase Auth es la autoridad central de identidad (directiva 2026-10-05).
//   El Ops Center necesita gestionar usuarios, roles, estados, verificaciones
//   e invitaciones SIN entrar al dashboard de Supabase y SIN service_role en
//   el navegador.
// - Toda decisión de autorización ocurre aquí y en RLS; la interfaz solo
//   muestra lo que el servidor permite.
//
// ⚙️ CÓMO:
// 1. Identidad (modo dual de migración):
//    - `Authorization: Bearer <JWT de Supabase>` → auth.getUser() (firma y
//      vencimiento verificados por Supabase) → profiles.id.
//    - `x-firebase-token` (heredado) → JWKS de Google → identity_links; si no
//      hay vínculo y el correo verificado está en staff_roles, actúa con ese
//      rol (compatibilidad con el Ops Center actual).
// 2. Permisos: user_roles + role_permissions (perfil activo). Nunca de
//    user_metadata ni del cliente.
// 3. Reglas anti-escalamiento: nadie modifica sus propios roles/estado;
//    turista/emprendedor/guía requieren users.assign_role; auditor/admin
//    requieren roles.assign_staff; superadmin requiere roles.assign_superadmin;
//    solo un superadmin modifica a un admin o superadmin; nunca se retira el
//    último superadmin activo.
// 4. Cada acción sensible escribe audit_logs (actor, rol, antes/después,
//    motivo). Suspender también bloquea el inicio de sesión (ban en Auth).
//
// 📦 QUÉ (POST { action, ... }):
// - Sesión: me, request_verification, link_firebase.
// - users.read: summary, list, get.
// - users.update: update_profile · users.assign_role/roles.*: set_role
// - users.suspend: set_status · users.invite: invite
// - verifications.read/review: verifications, decide_verification
// - businesses.update: set_business_member
// ============================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5.9.6";

const FIREBASE_PROJECT_ID = "app-baqueano";
const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);
const MAX_BODY_BYTES = 16 * 1024;
const PAGE_MAX = 50;
const SITE_URL = "https://baqueanonicaragua.com";

const ALLOWED_ORIGINS = new Set([
  "https://baqueanonicaragua.com",
  "https://www.baqueanonicaragua.com",
  "https://app-baqueano.web.app",
  "https://app-baqueano.firebaseapp.com",
]);

const PUBLIC_ROLES = new Set(["turista", "emprendedor", "guia"]);
const STAFF_ROLES = new Set(["auditor", "admin"]);
const ALL_ROLES = new Set([...PUBLIC_ROLES, ...STAFF_ROLES, "superadmin"]);
const STATUSES = new Set(["active", "suspended", "blocked", "pending", "deleted_soft"]);
const LANGS = new Set(["es", "en", "fr", "it", "pt", "de"]);
const VERIFICATION_TYPES = new Set(["profile", "business", "emprendedor", "guia"]);
const DECISIONS = new Set(["under_review", "approved", "rejected", "needs_information"]);
const SEGMENTS: Record<string, (q: any) => any> = {
  todos: (q) => q,
  turistas: (q) => q.contains("roles", ["turista"]).not("roles", "cs", "{emprendedor}").not("roles", "cs", "{guia}"),
  emprendedores: (q) => q.contains("roles", ["emprendedor"]),
  guias: (q) => q.contains("roles", ["guia"]),
  negocios: (q) => q.gt("business_count", 0),
  administradores: (q) => q.or("roles.cs.{admin},roles.cs.{superadmin}"),
  auditores: (q) => q.contains("roles", ["auditor"]),
  suspendidos: (q) => q.in("status", ["suspended", "blocked"]),
  pendientes: (q) => q.eq("pending_verification", true),
};
const DIRECTORY_COLUMNS =
  "id, email, display_name, first_name, last_name, phone, avatar_url, country, city, provider, status, profile_verified, preferred_language, created_at, last_seen_at, status_reason, suspended_until, roles, business_count, business_names, pending_verification";

type Actor = {
  profileId: string | null;
  email: string | null;
  roles: string[];
  permissions: Set<string>;
  source: "supabase" | "firebase";
  firebaseUid?: string;
};

class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && (ALLOWED_ORIGINS.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));
  return {
    "Access-Control-Allow-Origin": allowed ? origin! : "https://baqueanonicaragua.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, content-type, x-firebase-token, apikey, x-client-info",
    "Vary": "Origin",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  };
}

function reply(status: number, body: Record<string, unknown>, origin: string | null): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(origin) });
}

function cleanText(value: unknown, max: number, label: string, required = false): string | null {
  if (value == null || value === "") {
    if (required) throw new HttpError(400, `Falta ${label}.`);
    return null;
  }
  if (typeof value !== "string") throw new HttpError(400, `${label} no es texto.`);
  const text = value.normalize("NFC").replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
  if (!text) {
    if (required) throw new HttpError(400, `Falta ${label}.`);
    return null;
  }
  if (text.length > max) throw new HttpError(400, `${label} supera ${max} caracteres.`);
  return text;
}

function cleanUuid(value: unknown, label = "el usuario"): string {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw new HttpError(400, `Identificador de ${label} inválido.`);
  }
  return value.toLowerCase();
}

function cleanEmail(value: unknown): string {
  const email = cleanText(value, 254, "el correo", true)!.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new HttpError(400, "El correo no es válido.");
  return email;
}

function requirePermission(actor: Actor | null, permission: string): Actor {
  if (!actor) throw new HttpError(401, "Tu sesión venció. Iniciá sesión nuevamente.");
  if (!actor.permissions.has(permission)) throw new HttpError(403, "No tenés permiso para esta acción.");
  return actor;
}

// ---------------------------------------------------------------------------
// Identidad
// ---------------------------------------------------------------------------
async function permissionsFor(service: SupabaseClient, roles: string[]): Promise<Set<string>> {
  if (!roles.length) return new Set();
  const { data } = await service.from("role_permissions").select("permission_id").in("role_id", roles);
  return new Set((data || []).map((r: { permission_id: string }) => r.permission_id));
}

async function actorFromProfile(service: SupabaseClient, profileId: string, source: Actor["source"], extra: Partial<Actor> = {}): Promise<Actor | null> {
  const { data: profile } = await service.from("profiles").select("id, email, status").eq("id", profileId).maybeSingle();
  if (!profile) return null;
  if (profile.status !== "active") {
    throw new HttpError(403, "Tu cuenta no está activa. Si creés que es un error, escribinos.");
  }
  const { data: rows } = await service.from("user_roles").select("role_id").eq("user_id", profileId);
  const roles = (rows || []).map((r: { role_id: string }) => r.role_id);
  return { profileId, email: profile.email, roles, permissions: await permissionsFor(service, roles), source, ...extra };
}

async function verifyFirebase(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    });
    return payload as Record<string, unknown>;
  } catch (_) {
    throw new HttpError(401, "Tu sesión venció. Iniciá sesión nuevamente.");
  }
}

// POR QUÉ: un token malformado (p. ej. "a.b.c" de las pruebas de CI) llegaba a
// Supabase Auth y dejaba un warning "bad_jwt" en los logs. CÓMO: se valida la
// forma (3 segmentos base64url y cabecera JSON con "alg") antes de llamar a Auth;
// si no la tiene, se trata como sin sesión (401). La firma la sigue validando Auth.
function looksLikeJwt(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3 || parts.some((p) => !/^[A-Za-z0-9_-]+$/.test(p))) return false;
  try {
    const header = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(parts[0].length / 4) * 4, "=")));
    return typeof header?.alg === "string" && header.alg.length > 0;
  } catch {
    return false;
  }
}

async function resolveActor(req: Request, service: SupabaseClient): Promise<Actor | null> {
  const bearer = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  if (bearer && bearer !== anonKey && looksLikeJwt(bearer)) {
    const { data, error } = await service.auth.getUser(bearer);
    if (!error && data?.user) {
      const actor = await actorFromProfile(service, data.user.id, "supabase");
      if (actor) {
        await service.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", data.user.id);
        return actor;
      }
    }
  }

  const firebaseToken = req.headers.get("x-firebase-token") || "";
  if (!firebaseToken) return null;
  const claims = await verifyFirebase(firebaseToken);
  const uid = String(claims.sub || "");
  const email = typeof claims.email === "string" ? claims.email.toLowerCase() : null;
  const { data: link } = await service.from("identity_links").select("profile_id").eq("provider", "firebase").eq("legacy_uid", uid).maybeSingle();
  if (link?.profile_id) return actorFromProfile(service, link.profile_id, "firebase", { firebaseUid: uid });

  // Auditoría de seguridad 2026-10-06 (resolveActor:staff_roles-firebase-fallback-ignores-rbac-revocation):
  // si ese correo verificado ya tiene perfil en Supabase, manda el perfil (estado activo + user_roles),
  // así una revocación o suspensión hecha en RBAC también aplica a quien entra con Firebase sin vincular.
  if (email && claims.email_verified === true) {
    const exact = email.replace(/[\\%_]/g, (c) => "\\" + c); // ilike sin comodines: coincidencia exacta sin mayúsculas
    const { data: profilesByEmail, error: profileError } = await service.from("profiles").select("id").ilike("email", exact).limit(2);
    if (profileError || (profilesByEmail || []).length > 1) {
      throw new HttpError(403, "No pudimos confirmar tu cuenta. Vinculá tu acceso desde tu perfil.");
    }
    if (profilesByEmail && profilesByEmail[0]?.id) return actorFromProfile(service, profilesByEmail[0].id, "firebase", { firebaseUid: uid });
  }

  // Compatibilidad: personal heredado (sin perfil en Supabase) identificado por correo verificado.
  const roles: string[] = [];
  if (email && claims.email_verified === true) {
    const { data: staff } = await service.from("staff_roles").select("role").eq("email", email).eq("is_active", true).maybeSingle();
    if (staff?.role) roles.push(staff.role === "super_admin" ? "superadmin" : staff.role);
  }
  return { profileId: null, email, roles, permissions: await permissionsFor(service, roles), source: "firebase", firebaseUid: uid };
}

// ---------------------------------------------------------------------------
// Auditoría
// ---------------------------------------------------------------------------
async function audit(
  service: SupabaseClient,
  req: Request,
  actor: Actor,
  action: string,
  entityType: string,
  entityId: string,
  oldValues: unknown,
  newValues: unknown,
  reason: string | null,
  description: string,
) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || null;
  const { error } = await service.from("audit_logs").insert({
    admin_email: actor.email || actor.firebaseUid || "desconocido",
    action,
    module: "identidad",
    target_entity: entityType,
    target_id: entityId,
    description,
    payload: { source: actor.source },
    actor_user_id: actor.profileId,
    actor_role: actor.roles[0] || null,
    entity_type: entityType,
    entity_id: entityId,
    old_values: oldValues ?? null,
    new_values: newValues ?? null,
    reason,
    ip_address: ip,
    user_agent: (req.headers.get("user-agent") || "").slice(0, 300) || null,
  });
  if (error) throw new HttpError(500, "No se pudo registrar la auditoría; la acción se canceló.");
}

async function rolesOf(service: SupabaseClient, userId: string): Promise<string[]> {
  const { data } = await service.from("user_roles").select("role_id").eq("user_id", userId);
  return (data || []).map((r: { role_id: string }) => r.role_id);
}

function assertCanManageTarget(actor: Actor, targetId: string, targetRoles: string[]) {
  if (actor.profileId && actor.profileId === targetId) {
    throw new HttpError(403, "No podés modificar tus propios roles ni tu estado.");
  }
  const isSuper = actor.permissions.has("roles.assign_superadmin");
  if ((targetRoles.includes("superadmin") || targetRoles.includes("admin")) && !isSuper) {
    throw new HttpError(403, "Solo un superadministrador puede modificar a administradores.");
  }
}

function assertCanGrant(actor: Actor, role: string) {
  if (PUBLIC_ROLES.has(role) && !actor.permissions.has("users.assign_role")) throw new HttpError(403, "No tenés permiso para asignar ese rol.");
  if (STAFF_ROLES.has(role) && !actor.permissions.has("roles.assign_staff")) throw new HttpError(403, "Solo un superadministrador asigna roles de auditor o administrador.");
  if (role === "superadmin" && !actor.permissions.has("roles.assign_superadmin")) throw new HttpError(403, "Operación reservada a superadministradores.");
}

function safeSearch(value: unknown): string | null {
  const q = cleanText(value, 80, "la búsqueda");
  if (!q) return null;
  // Evita inyectar sintaxis de filtros de PostgREST.
  return q.replace(/[,()%*\\]/g, " ").trim() || null;
}

// ---------------------------------------------------------------------------
// Acciones
// ---------------------------------------------------------------------------
async function handle(req: Request, action: string, body: Record<string, unknown>, actor: Actor | null, service: SupabaseClient) {
  switch (action) {
    case "me": {
      if (!actor) throw new HttpError(401, "Tu sesión venció. Iniciá sesión nuevamente.");
      let profile = null;
      if (actor.profileId) {
        const { data } = await service.from("profiles")
          .select("id, email, display_name, first_name, last_name, phone, avatar_url, country, city, preferred_language, provider, status, profile_verified, created_at")
          .eq("id", actor.profileId).maybeSingle();
        profile = data;
      }
      return {
        profile,
        roles: actor.roles,
        permissions: [...actor.permissions].sort(),
        source: actor.source,
        can_access_ops: actor.permissions.has("users.read") || actor.permissions.has("audits.read"),
        linked_legacy: actor.source === "firebase" && Boolean(actor.profileId),
      };
    }

    case "summary": {
      requirePermission(actor, "users.read");
      const { data, error } = await service.rpc("admin_user_summary");
      if (error) throw new HttpError(500, "No se pudo calcular el resumen de usuarios.");
      return { summary: data };
    }

    case "list": {
      requirePermission(actor, "users.read");
      const page = Math.min(Math.max(Number(body.page) || 0, 0), 1000);
      const size = Math.min(Math.max(Number(body.page_size) || 20, 5), PAGE_MAX);
      let query = service.from("admin_user_directory").select(DIRECTORY_COLUMNS, { count: "exact" });
      const segment = typeof body.segment === "string" && SEGMENTS[body.segment] ? body.segment : "todos";
      query = SEGMENTS[segment](query);
      if (typeof body.provider === "string" && ["google", "email"].includes(body.provider)) query = query.eq("provider", body.provider);
      if (body.verified === true || body.verified === false) query = query.eq("profile_verified", body.verified);
      if (typeof body.status === "string" && STATUSES.has(body.status)) query = query.eq("status", body.status);
      const q = safeSearch(body.q);
      if (q) {
        const isUuid = /^[0-9a-f-]{36}$/i.test(q);
        query = isUuid
          ? query.eq("id", q.toLowerCase())
          : query.or(`email.ilike.%${q}%,display_name.ilike.%${q}%,phone.ilike.%${q}%,business_names.ilike.%${q}%`);
      }
      const sortable = new Set(["created_at", "last_seen_at", "display_name", "email"]);
      const sort = typeof body.sort === "string" && sortable.has(body.sort) ? body.sort : "created_at";
      query = query.order(sort, { ascending: body.dir === "asc", nullsFirst: false }).range(page * size, page * size + size - 1);
      const { data, error, count } = await query;
      if (error) throw new HttpError(500, "No se pudieron cargar los usuarios.");
      return { items: data || [], total: count || 0, page, page_size: size, segment };
    }

    case "get": {
      const a = requirePermission(actor, "users.read");
      const id = cleanUuid(body.id);
      const { data: user } = await service.from("admin_user_directory").select(DIRECTORY_COLUMNS).eq("id", id).maybeSingle();
      if (!user) throw new HttpError(404, "El usuario no existe.");
      const [{ data: businesses }, { data: verifications }, { data: history }] = await Promise.all([
        service.from("business_members").select("business_id, member_role, status, created_at, businesses(name, department, verified)").eq("user_id", id),
        service.from("verification_requests").select("id, request_type, entity_type, status, created_at, decided_at, decision_notes").eq("applicant_id", id).order("created_at", { ascending: false }).limit(20),
        service.from("audit_logs").select("created_at, admin_email, actor_role, action, reason, old_values, new_values").eq("entity_type", "profile").eq("entity_id", id).order("created_at", { ascending: false }).limit(50),
      ]);
      return {
        user,
        businesses: businesses || [],
        verifications: verifications || [],
        history: history || [],
        can: {
          update: a.permissions.has("users.update"),
          suspend: a.permissions.has("users.suspend"),
          assign_role: a.permissions.has("users.assign_role"),
          assign_staff: a.permissions.has("roles.assign_staff"),
          assign_superadmin: a.permissions.has("roles.assign_superadmin"),
          verify: a.permissions.has("verifications.review"),
        },
      };
    }

    case "update_profile": {
      const a = requirePermission(actor, "users.update");
      const id = cleanUuid(body.id);
      const targetRoles = await rolesOf(service, id);
      assertCanManageTarget(a, id, targetRoles);
      const fields: Record<string, unknown> = {};
      for (const [key, max] of [["first_name", 80], ["last_name", 80], ["display_name", 120], ["phone", 20], ["country", 80], ["city", 80]] as const) {
        if (key in body) fields[key] = cleanText(body[key], max, key);
      }
      if (fields.phone && !/^[0-9+ ()-]{7,20}$/.test(String(fields.phone))) throw new HttpError(400, "El teléfono no es válido.");
      if ("preferred_language" in body) {
        if (!LANGS.has(String(body.preferred_language))) throw new HttpError(400, "Idioma no soportado.");
        fields.preferred_language = body.preferred_language;
      }
      if (!Object.keys(fields).length) throw new HttpError(400, "No hay cambios para guardar.");
      const { data: before } = await service.from("profiles").select(Object.keys(fields).join(", ")).eq("id", id).maybeSingle();
      if (!before) throw new HttpError(404, "El usuario no existe.");
      const { error } = await service.from("profiles").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw new HttpError(400, "No se pudo actualizar el perfil. Revisá los datos.");
      await audit(service, req, a, "profile.update", "profile", id, before, fields, cleanText(body.reason, 300, "el motivo"), "Edición administrativa del perfil");
      return { id, updated: Object.keys(fields) };
    }

    case "set_role": {
      if (!actor) throw new HttpError(401, "Tu sesión venció. Iniciá sesión nuevamente.");
      const id = cleanUuid(body.id);
      const role = String(body.role || "");
      if (!ALL_ROLES.has(role)) throw new HttpError(400, "Rol inválido.");
      const grant = body.grant !== false;
      const reason = cleanText(body.reason, 300, "el motivo", true)!;
      assertCanGrant(actor, role);
      const before = await rolesOf(service, id);
      if (!before.length) throw new HttpError(404, "El usuario no existe.");
      assertCanManageTarget(actor, id, before);
      if (!grant && role === "turista") throw new HttpError(400, "El rol base turista no se retira; suspendé la cuenta si es necesario.");
      if (!grant && role === "superadmin") {
        const { count } = await service.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role_id", "superadmin");
        if ((count || 0) <= 1) throw new HttpError(400, "No se puede retirar al último superadministrador.");
      }
      if (grant) {
        const { error } = await service.from("user_roles").upsert({ user_id: id, role_id: role, granted_by: actor.profileId, reason }, { onConflict: "user_id,role_id", ignoreDuplicates: true });
        if (error) throw new HttpError(500, "No se pudo asignar el rol.");
      } else {
        const { error } = await service.from("user_roles").delete().eq("user_id", id).eq("role_id", role);
        if (error) throw new HttpError(500, "No se pudo retirar el rol.");
      }
      const after = await rolesOf(service, id);
      await audit(service, req, actor, grant ? "role.grant" : "role.revoke", "profile", id, { roles: before }, { roles: after }, reason,
        `${grant ? "Asignó" : "Retiró"} el rol ${role}`);
      return { id, roles: after };
    }

    case "set_status": {
      const a = requirePermission(actor, "users.suspend");
      const id = cleanUuid(body.id);
      const status = String(body.status || "");
      if (!["active", "suspended", "blocked"].includes(status)) throw new HttpError(400, "Estado inválido.");
      const reason = cleanText(body.reason, 500, "el motivo", true)!;
      const targetRoles = await rolesOf(service, id);
      assertCanManageTarget(a, id, targetRoles);
      const { data: before } = await service.from("profiles").select("status, status_reason, suspended_until").eq("id", id).maybeSingle();
      if (!before) throw new HttpError(404, "El usuario no existe.");
      let until: string | null = null;
      if (status === "suspended" && body.days != null) {
        const days = Number(body.days);
        if (!Number.isInteger(days) || days < 1 || days > 365) throw new HttpError(400, "La suspensión va de 1 a 365 días.");
        until = new Date(Date.now() + days * 86_400_000).toISOString();
      }
      const now = new Date().toISOString();
      const patch = { status, status_reason: reason, status_changed_by: a.profileId, status_changed_at: now, suspended_until: until, updated_at: now };
      const { error } = await service.from("profiles").update(patch).eq("id", id);
      if (error) throw new HttpError(500, "No se pudo cambiar el estado.");
      // Bloqueo real del inicio de sesión en Supabase Auth (no solo en la interfaz).
      const banDuration = status === "active" ? "none" : until ? `${Math.ceil((Date.parse(until) - Date.now()) / 3_600_000)}h` : "876000h";
      await service.auth.admin.updateUserById(id, { ban_duration: banDuration } as Record<string, unknown>);
      await audit(service, req, a, status === "active" ? "user.reactivate" : `user.${status === "suspended" ? "suspend" : "block"}`, "profile", id,
        before, { status, suspended_until: until }, reason, status === "active" ? "Reactivó la cuenta" : "Suspendió o bloqueó la cuenta");
      return { id, status, suspended_until: until };
    }

    case "invite": {
      const a = requirePermission(actor, "users.invite");
      const email = cleanEmail(body.email);
      const role = String(body.role || "turista");
      if (!ALL_ROLES.has(role)) throw new HttpError(400, "Rol inválido.");
      assertCanGrant(a, role);
      const name = cleanText(body.name, 120, "el nombre");
      const message = cleanText(body.message, 300, "el mensaje");
      const { data: existing } = await service.from("profiles").select("id").ilike("email", email).maybeSingle();
      if (existing) throw new HttpError(409, "Ya existe una cuenta con ese correo. Gestioná su rol desde su ficha.");
      const { data, error } = await service.auth.admin.inviteUserByEmail(email, {
        data: { full_name: name || undefined, invite_message: message || undefined },
        redirectTo: `${SITE_URL}/perfil.html`,
      });
      if (error || !data?.user) throw new HttpError(400, "No se pudo enviar la invitación. Revisá el correo.");
      if (role !== "turista") {
        await service.from("user_roles").upsert({ user_id: data.user.id, role_id: role, granted_by: a.profileId, reason: "Invitación" }, { onConflict: "user_id,role_id", ignoreDuplicates: true });
      }
      await audit(service, req, a, "user.invite", "profile", data.user.id, null, { email, role }, message, `Invitó a ${email} como ${role}`);
      return { id: data.user.id, email, role };
    }

    case "request_verification": {
      if (!actor?.profileId) throw new HttpError(401, "Iniciá sesión con tu cuenta BAQUEANO para solicitar verificación.");
      requirePermission(actor, "verifications.request");
      const type = String(body.request_type || "");
      if (!VERIFICATION_TYPES.has(type)) throw new HttpError(400, "Tipo de solicitud inválido.");
      const phone = cleanText(body.phone, 20, "tu teléfono", true)!;
      if (!/^[0-9+ ()-]{7,20}$/.test(phone)) throw new HttpError(400, "El teléfono no es válido.");
      let entityId = actor.profileId;
      if (type === "business") {
        entityId = cleanText(body.business_id, 120, "el negocio", true)!;
        const { data: member } = await service.from("business_members").select("member_role").eq("business_id", entityId).eq("user_id", actor.profileId).eq("status", "active").maybeSingle();
        if (!member) throw new HttpError(403, "Solo los responsables del negocio pueden solicitar su verificación.");
      }
      const { count } = await service.from("verification_requests").select("id", { count: "exact", head: true })
        .eq("applicant_id", actor.profileId).eq("request_type", type).in("status", ["pending", "under_review", "needs_information"]);
      if ((count || 0) > 0) throw new HttpError(409, "Ya tenés una solicitud de este tipo en revisión.");
      const { data: profile } = await service.from("profiles").select("display_name, email").eq("id", actor.profileId).maybeSingle();
      const notes = cleanText(body.notes, 1000, "la descripción");
      const links = Array.isArray(body.documents) ? body.documents.filter((d) => typeof d === "string" && /^https:\/\//.test(d)).slice(0, 5) : [];
      const { data, error } = await service.from("verification_requests").insert({
        entity_type: type === "business" ? "business" : "profile",
        entity_id: entityId,
        applicant_uid: actor.profileId,
        applicant_id: actor.profileId,
        applicant_name: profile?.display_name || profile?.email || "Usuario BAQUEANO",
        applicant_phone: phone,
        request_type: type,
        documents_payload: { notes, links },
        status: "pending",
      }).select("id, status, created_at").single();
      if (error) throw new HttpError(500, "No se pudo registrar la solicitud.");
      return { request: data };
    }

    case "verifications": {
      const a = requirePermission(actor, "verifications.read");
      const status = typeof body.status === "string" && ["pending", "under_review", "approved", "rejected", "needs_information"].includes(body.status) ? body.status : null;
      let query = service.from("verification_requests")
        .select("id, request_type, entity_type, entity_id, applicant_id, applicant_name, applicant_phone, documents_payload, status, decision_notes, decided_at, reviewer_id, created_at", { count: "exact" })
        .order("created_at", { ascending: false }).limit(PAGE_MAX);
      if (status) query = query.eq("status", status);
      const { data, error, count } = await query;
      if (error) throw new HttpError(500, "No se pudieron cargar las verificaciones.");
      return { items: data || [], total: count || 0, read_only: !a.permissions.has("verifications.review") };
    }

    case "decide_verification": {
      const a = requirePermission(actor, "verifications.review");
      const id = cleanUuid(body.id, "la solicitud");
      const decision = String(body.decision || "");
      if (!DECISIONS.has(decision)) throw new HttpError(400, "Decisión inválida.");
      const notes = cleanText(body.notes, 1000, "las observaciones", decision !== "under_review");
      const { data: request } = await service.from("verification_requests").select("*").eq("id", id).maybeSingle();
      if (!request) throw new HttpError(404, "La solicitud no existe.");
      if (request.applicant_id && request.applicant_id === a.profileId) throw new HttpError(403, "No podés resolver tu propia solicitud.");
      if (["approved", "rejected"].includes(request.status)) throw new HttpError(400, "La solicitud ya fue resuelta.");
      const now = new Date().toISOString();
      if (decision === "approved" && request.applicant_id) {
        if (request.request_type === "emprendedor" || request.request_type === "guia") {
          await service.from("user_roles").upsert({ user_id: request.applicant_id, role_id: request.request_type, granted_by: a.profileId, reason: "Solicitud aprobada" }, { onConflict: "user_id,role_id", ignoreDuplicates: true });
        } else if (request.request_type === "profile") {
          await service.from("profiles").update({ profile_verified: true, updated_at: now }).eq("id", request.applicant_id);
        } else if (request.request_type === "business") {
          if (!a.permissions.has("businesses.verify")) throw new HttpError(403, "No tenés permiso para verificar negocios.");
          await service.from("businesses").update({ verified: true, updated_at: now }).eq("id", request.entity_id);
        }
      }
      const { error } = await service.from("verification_requests").update({
        status: decision, decision_notes: notes, reviewer_id: a.profileId, reviewed_by: a.email, reviewed_at: now,
        decided_at: ["approved", "rejected"].includes(decision) ? now : null, updated_at: now,
      }).eq("id", id);
      if (error) throw new HttpError(500, "No se pudo guardar la decisión.");
      await audit(service, req, a, `verification.${decision}`, request.request_type === "business" ? "business" : "profile",
        request.request_type === "business" ? request.entity_id : (request.applicant_id || request.entity_id),
        { status: request.status }, { status: decision, request_type: request.request_type }, notes, `Verificación ${request.request_type}: ${decision}`);
      return { id, status: decision };
    }

    case "set_business_member": {
      const a = requirePermission(actor, "businesses.update");
      const userId = cleanUuid(body.user_id);
      const businessId = cleanText(body.business_id, 120, "el negocio", true)!;
      const memberRole = String(body.member_role || "owner");
      if (!["owner", "manager", "staff"].includes(memberRole)) throw new HttpError(400, "Rol en el negocio inválido.");
      const active = body.active !== false;
      const { data: business } = await service.from("businesses").select("id, name").eq("id", businessId).maybeSingle();
      if (!business) throw new HttpError(404, "El negocio no existe.");
      const { data: before } = await service.from("business_members").select("member_role, status").eq("business_id", businessId).eq("user_id", userId).maybeSingle();
      const { error } = await service.from("business_members").upsert({
        business_id: businessId, user_id: userId, member_role: memberRole, status: active ? "active" : "revoked", added_by: a.profileId,
      }, { onConflict: "business_id,user_id" });
      if (error) throw new HttpError(400, "No se pudo vincular el usuario al negocio.");
      await audit(service, req, a, active ? "business.member_set" : "business.member_revoke", "business", businessId,
        before, { user_id: userId, member_role: memberRole, status: active ? "active" : "revoked" }, cleanText(body.reason, 300, "el motivo"),
        `${active ? "Vinculó" : "Desvinculó"} un usuario de ${business.name}`);
      return { business_id: businessId, user_id: userId, member_role: memberRole, active };
    }

    case "link_firebase": {
      // Vincula la cuenta Firebase heredada con la cuenta Supabase: requiere
      // AMBOS tokens válidos y el MISMO correo verificado (prueba de control).
      const bearer = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
      const firebaseToken = req.headers.get("x-firebase-token") || "";
      if (!bearer || !firebaseToken) throw new HttpError(400, "Se requieren ambas sesiones para vincular la cuenta.");
      if (!looksLikeJwt(bearer)) throw new HttpError(401, "Confirmá tu correo en BAQUEANO antes de vincular.");
      const { data: sb } = await service.auth.getUser(bearer);
      if (!sb?.user?.email || !sb.user.email_confirmed_at) throw new HttpError(401, "Confirmá tu correo en BAQUEANO antes de vincular.");
      const claims = await verifyFirebase(firebaseToken);
      const fbEmail = typeof claims.email === "string" ? claims.email.toLowerCase() : "";
      if (claims.email_verified !== true || fbEmail !== sb.user.email.toLowerCase()) {
        throw new HttpError(403, "Los correos de ambas cuentas no coinciden o no están verificados.");
      }
      const legacyUid = String(claims.sub || "");
      const { error } = await service.from("identity_links").upsert({ provider: "firebase", legacy_uid: legacyUid, profile_id: sb.user.id, email: fbEmail }, { onConflict: "provider,legacy_uid" });
      if (error) throw new HttpError(409, "Esa cuenta ya está vinculada a otro perfil.");
      await service.from("profiles").update({ firebase_uid: legacyUid }).eq("id", sb.user.id).is("firebase_uid", null);
      const linker = await actorFromProfile(service, sb.user.id, "supabase");
      if (linker) await audit(service, req, linker, "identity.link_firebase", "profile", sb.user.id, null, { provider: "firebase" }, null, "Vinculó su cuenta heredada de Firebase");
      return { linked: true };
    }

    default:
      throw new HttpError(400, "Acción desconocida.");
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
    try { body = JSON.parse(raw || "{}"); } catch (_) { throw new HttpError(400, "JSON inválido."); }
    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false, autoRefreshToken: false } });
    const action = String(body.action || "");
    const actor = action === "link_firebase" ? null : await resolveActor(req, service);
    const result = await handle(req, action, body, actor, service);
    return reply(200, { ok: true, ...result }, origin);
  } catch (error) {
    if (error instanceof HttpError) return reply(error.status, { ok: false, error: error.message }, origin);
    console.error("[baqueano-identity]", error);
    return reply(500, { ok: false, error: "Algo se nos trabó. Probá otra vez en unos minutos." }, origin);
  }
});
