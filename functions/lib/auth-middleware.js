// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MIDDLEWARE DE AUTENTICACIÓN Y ROLES (auth-middleware.js)
// ============================================================================
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proteger las rutas privadas y administrativas del backend contra suplantación.
// - Erradicar la confianza ciega en valores de cliente (localStorage, sessionStorage o DOM).
// - Validar criptográficamente el Firebase ID Token con el Firebase Admin SDK.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Extrae el token Bearer del encabezado 'Authorization'.
// - Invoca `admin.auth().verifyIdToken()`.
// - Evalúa Custom Claims y la lista oficial de administradores de Baqueano Nicaragua.
// - Adjunta `request.user` al ciclo de vida de la petición.
//
// 📦 3. QUÉ (WHAT / ENTIDADES EXPUESTAS):
// - `verifyAuth`: Valida token de usuario activo.
// - `verifyAdmin`: Valida privilegios de administrador.
// - `verifySuperAdmin`: Valida rol de superadministrador.
// ============================================================================
"use strict";

const { getAuth } = require("firebase-admin/auth");

// Matriz oficial de cuentas privilegiadas (definida por el propietario, 2026-10-03):
//   super_admin → oscarelieser.informatica.inatec@gmail.com
//   admin       → byoscarelieser@gmail.com, vigoronmixt@gmail.com
// OFFICIAL_ADMIN_EMAILS conserva las tres cuentas (todas son, como mínimo, admin).
const OFFICIAL_ADMIN_EMAILS = new Set([
  "oscarelieser.informatica.inatec@gmail.com",
  "byoscarelieser@gmail.com",
  "vigoronmixt@gmail.com"
]);

const OFFICIAL_SUPER_ADMIN_EMAILS = new Set([
  "oscarelieser.informatica.inatec@gmail.com"
]);

const ADMIN_CLAIM_ROLES = new Set(["admin", "superadmin", "super_admin"]);
const SUPER_ADMIN_CLAIM_ROLES = new Set(["superadmin", "super_admin"]);

// Un correo solo cuenta como identidad si Firebase confirmó que el usuario lo
// controla (email_verified). Así nadie puede registrarse con correo/contraseña
// usando una dirección oficial ajena y heredar sus privilegios.
function verifiedEmail(decodedToken) {
  if (!decodedToken || decodedToken.email_verified !== true || typeof decodedToken.email !== "string") {
    return null;
  }
  return decodedToken.email.trim().toLowerCase();
}

// Decisión pura (sin red ni SDK) para poder probarla: ¿es administrador?
// Custom Claims solo los puede emitir el Admin SDK, por eso se aceptan tal cual.
function isAdminIdentity(decodedToken) {
  if (!decodedToken) return false;
  if (decodedToken.admin === true || ADMIN_CLAIM_ROLES.has(decodedToken.role)) return true;
  const email = verifiedEmail(decodedToken);
  return Boolean(email && OFFICIAL_ADMIN_EMAILS.has(email));
}

// Decisión pura: ¿es superadministrador? Solo claim super_admin o el correo
// fundador verificado; las cuentas admin NO heredan este nivel.
function isSuperAdminIdentity(decodedToken) {
  if (!decodedToken) return false;
  if (SUPER_ADMIN_CLAIM_ROLES.has(decodedToken.role)) return true;
  const email = verifiedEmail(decodedToken);
  return Boolean(email && OFFICIAL_SUPER_ADMIN_EMAILS.has(email));
}

function extractBearerToken(request) {
  const authHeader = request.headers.authorization || request.headers.Authorization;
  if (!authHeader || typeof authHeader !== "string") return null;
  const parts = authHeader.trim().split(/\s+/);
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
    return parts[1];
  }
  return null;
}

async function verifyAuth(request) {
  const token = extractBearerToken(request);
  if (!token) {
    return { ok: false, status: 401, error: { code: "UNAUTHORIZED", message: "Token de autorización ausente o inválido." } };
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    return { ok: true, user: decodedToken };
  } catch (err) {
    return { ok: false, status: 401, error: { code: "INVALID_TOKEN", message: "El token de Firebase ha expirado o no es válido." } };
  }
}

async function verifyAdmin(request) {
  const authResult = await verifyAuth(request);
  if (!authResult.ok) return authResult;

  const user = authResult.user;

  if (!isAdminIdentity(user)) {
    return { ok: false, status: 403, error: { code: "FORBIDDEN", message: "Acceso denegado: se requieren permisos administrativos." } };
  }

  return { ok: true, user };
}

async function verifySuperAdmin(request) {
  const authResult = await verifyAdmin(request);
  if (!authResult.ok) return authResult;

  const user = authResult.user;

  if (!isSuperAdminIdentity(user)) {
    return { ok: false, status: 403, error: { code: "FORBIDDEN", message: "Acceso denegado: se requieren privilegios de Super Administrador." } };
  }

  return { ok: true, user };
}

module.exports = {
  verifyAuth,
  verifyAdmin,
  verifySuperAdmin,
  extractBearerToken,
  isAdminIdentity,
  isSuperAdminIdentity,
  OFFICIAL_ADMIN_EMAILS,
  OFFICIAL_SUPER_ADMIN_EMAILS
};
