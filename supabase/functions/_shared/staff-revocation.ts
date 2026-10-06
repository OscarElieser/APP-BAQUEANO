/**
 * 🎯 POR QUÉ: auditoría de seguridad 2026-10-06 (crítico final, unidad "revocación en todas las
 *   puertas"). baqueano-ops, -sos, -reservas y -community daban rol de personal a partir del
 *   claim de Firebase (`role` o `admin`) o de un correo activo en staff_roles. Si un admin
 *   revocaba el rol o suspendía la cuenta en el RBAC de Supabase (profiles.status y user_roles),
 *   esa persona seguía entrando como personal por estas cuatro funciones.
 * ⚙️ CÓMO: después de que cada función resuelve el rol heredado, este módulo lo contrasta con
 *   Supabase:
 *   1. Si staff_roles tiene el correo marcado como inactivo, el rol se revoca aunque el claim
 *      diga otra cosa.
 *   2. Se busca el perfil vinculado: primero identity_links (firebase y uid), después el correo
 *      verificado con coincidencia exacta y única.
 *   3. Si hay perfil, manda el perfil: si no está activo, o no tiene ese rol en user_roles, se
 *      revoca. Si la consulta falla, se niega el acceso.
 *   4. Si no hay perfil, se mantiene la compatibilidad con el personal heredado.
 * 📦 QUÉ: effectiveStaffRole(service, {uid, email, emailVerified, role}) → rol vigente o "".
 */
import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

const RBAC_NAME: Record<string, string> = { super_admin: "superadmin", superadmin: "superadmin", admin: "admin", auditor: "auditor" };

export async function effectiveStaffRole(
  service: SupabaseClient,
  input: { uid: string; email: string | null; emailVerified: boolean; role: string },
): Promise<string> {
  const { uid, email, emailVerified, role } = input;
  if (!role || !RBAC_NAME[role]) return role;

  if (email) {
    const { data: legacy, error } = await service.from("staff_roles").select("is_active").eq("email", email).maybeSingle();
    if (error) return "";
    if (legacy && legacy.is_active === false) return "";
  }

  let profileId: string | null = null;
  const { data: link, error: linkError } = await service.from("identity_links").select("profile_id")
    .eq("provider", "firebase").eq("legacy_uid", uid).maybeSingle();
  if (linkError) return "";
  if (link?.profile_id) profileId = link.profile_id;
  if (!profileId && email && emailVerified) {
    const exact = email.replace(/[\\%_]/g, (c) => "\\" + c);
    const { data: rows, error: profileError } = await service.from("profiles").select("id").ilike("email", exact).limit(2);
    if (profileError || (rows || []).length > 1) return "";
    if (rows && rows[0]?.id) profileId = rows[0].id;
  }
  if (!profileId) return role; // personal heredado sin perfil en Supabase

  const { data: profile, error: statusError } = await service.from("profiles").select("status").eq("id", profileId).maybeSingle();
  if (statusError || !profile || profile.status !== "active") return "";
  const { data: granted, error: rolesError } = await service.from("user_roles").select("role_id").eq("user_id", profileId);
  if (rolesError) return "";
  const names = new Set((granted || []).map((r: { role_id: string }) => r.role_id));
  return names.has(RBAC_NAME[role]) ? role : "";
}
