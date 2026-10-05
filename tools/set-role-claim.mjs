#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: firestore.rules reconoce el rol por custom claim (`role`). El
 *    Superadmin necesita una forma segura y repetible de asignarlo.
 * ⚙️ CÓMO: Firebase Admin SDK con la credencial de servicio del propietario
 *    (GOOGLE_APPLICATION_CREDENTIALS, nunca en el repositorio). Solo acepta
 *    roles conocidos y exige que el correo esté verificado.
 * 📦 QUÉ: node tools/set-role-claim.mjs <correo> <auditor|admin|super_admin|explorer>
 *    "explorer" quita el rol. La persona debe cerrar e iniciar sesión.
 *    También registrar el mismo rol en public.staff_roles (Supabase) para que
 *    la Edge Function lo reconozca sin claim (docs/security/ROLES_Y_PERMISOS.md).
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const [email, role] = process.argv.slice(2);
const ROLES = new Set(['auditor', 'admin', 'super_admin', 'explorer']);
if (!email || !ROLES.has(role)) {
  console.error('Uso: node tools/set-role-claim.mjs <correo> <auditor|admin|super_admin|explorer>');
  process.exit(1);
}
initializeApp({ credential: applicationDefault(), projectId: 'app-baqueano' });
const auth = getAuth();
const user = await auth.getUserByEmail(email.trim().toLowerCase());
if (!user.emailVerified) {
  console.error(`El correo ${user.email} no está verificado en Firebase; no se asigna el rol.`);
  process.exit(1);
}
const claims = { ...(user.customClaims || {}) };
delete claims.admin;
if (role === 'explorer') delete claims.role; else claims.role = role;
await auth.setCustomUserClaims(user.uid, claims);
console.log(`✅ ${user.email} → ${role}. Debe cerrar sesión y volver a entrar para que el token se actualice.`);
