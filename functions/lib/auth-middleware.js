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

const OFFICIAL_ADMIN_EMAILS = new Set([
  "oscarelieser.informatica.inatec@gmail.com",
  "byoscarelieser@gmail.com",
  "vigoronmixt@gmail.com"
]);

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
  const isEmailAdmin = user.email && OFFICIAL_ADMIN_EMAILS.has(user.email.toLowerCase());
  const isClaimAdmin = user.admin === true || user.role === "admin" || user.role === "superadmin" || user.role === "super_admin";

  if (!isEmailAdmin && !isClaimAdmin) {
    return { ok: false, status: 403, error: { code: "FORBIDDEN", message: "Acceso denegado: se requieren permisos administrativos." } };
  }

  return { ok: true, user };
}

async function verifySuperAdmin(request) {
  const authResult = await verifyAdmin(request);
  if (!authResult.ok) return authResult;

  const user = authResult.user;
  const isSuper = user.role === "superadmin" || user.role === "super_admin" || (user.email && user.email.toLowerCase() === "oscarelieser.informatica.inatec@gmail.com");

  if (!isSuper) {
    return { ok: false, status: 403, error: { code: "FORBIDDEN", message: "Acceso denegado: se requieren privilegios de Super Administrador." } };
  }

  return { ok: true, user };
}

module.exports = {
  verifyAuth,
  verifyAdmin,
  verifySuperAdmin,
  extractBearerToken,
  OFFICIAL_ADMIN_EMAILS
};
