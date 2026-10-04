// ============================================================================
// 🧭 BAQUEANO — MATRIZ DE ROLES DEL FRONTEND (js/shared/roles.js)
// ============================================================================
//
// 🎯 POR QUÉ (Why / Propósito):
// - Separar AUTENTICACIÓN (quién eres: Firebase Auth) de AUTORIZACIÓN (qué puedes
//   hacer: rol). Iniciar sesión no da acceso al Ops Center.
// - La lista de cuentas administrativas estaba copiada en user-session.js y en
//   ops-center/ops-engine.js, y ambas trataban distinto a super_admin y admin.
//   Este archivo es la única fuente para la interfaz web.
//
// ⚙️ CÓMO (How / Arquitectura):
// - El rol se resuelve SOLO desde la identidad que entrega Firebase Auth en vivo:
//   1. Custom Claim `role` del token (admin | super_admin), si existe.
//   2. Si no, correo VERIFICADO por Firebase que figure en la matriz oficial.
//   3. Cualquier otra cuenta autenticada es `explorer` (usuario normal).
// - Nunca se lee el rol de localStorage, sessionStorage, la URL ni Firestore
//   escrito por el cliente.
// - Esto decide únicamente qué muestra la interfaz. La protección real de los
//   datos la aplican firestore.rules / storage.rules (función isAdmin(), misma
//   condición: claim o correo verificado en la lista) y el middleware de
//   Functions. Si cambia esta matriz, se cambian también esos archivos.
//
// 📦 QUÉ (What / Entregables):
// - window.BaqueanoRoles.resolve({ email, emailVerified, claimsRole }) → rol.
// - window.BaqueanoRoles.canAccessOps(rol) → true solo para admin y super_admin.
// - window.BaqueanoRoles.label(rol) → etiqueta en español para la interfaz.
// - window.BaqueanoRoles.resolveFirebaseUser(user) → Promise<rol> (lee claims).
// ============================================================================
(function (window) {
  'use strict';
  if (window.BaqueanoRoles) return;

  var ROLES = Object.freeze({
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    USER: 'explorer',
    GUEST: 'guest'
  });

  // Matriz oficial del propietario (2026-10-03).
  var OFFICIAL_ACCOUNTS = Object.freeze({
    'oscarelieser.informatica.inatec@gmail.com': ROLES.SUPER_ADMIN,
    'byoscarelieser@gmail.com': ROLES.ADMIN,
    'vigoronmixt@gmail.com': ROLES.ADMIN
  });

  var LABELS = Object.freeze({
    super_admin: 'Superadministrador',
    admin: 'Administrador',
    explorer: 'Explorador',
    guest: 'Invitado'
  });

  function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
  }

  function resolve(identity) {
    if (!identity) return ROLES.GUEST;
    var claim = String(identity.claimsRole || '').trim().toLowerCase();
    if (claim === ROLES.SUPER_ADMIN || claim === ROLES.ADMIN) return claim;
    if (identity.emailVerified === true) {
      var official = OFFICIAL_ACCOUNTS[normalizeEmail(identity.email)];
      if (official) return official;
    }
    return ROLES.USER;
  }

  function canAccessOps(role) {
    return role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN;
  }

  // Lee el Custom Claim del token vigente; si falla (sin red), usa el correo
  // verificado. Nunca concede más de lo que concede resolve().
  function resolveFirebaseUser(user) {
    if (!user) return Promise.resolve(ROLES.GUEST);
    var base = { email: user.email, emailVerified: user.emailVerified === true };
    if (typeof user.getIdTokenResult !== 'function') return Promise.resolve(resolve(base));
    return user.getIdTokenResult()
      .then(function (token) {
        base.claimsRole = token && token.claims ? token.claims.role : '';
        return resolve(base);
      })
      .catch(function () { return resolve(base); });
  }

  window.BaqueanoRoles = Object.freeze({
    ROLES: ROLES,
    resolve: resolve,
    resolveFirebaseUser: resolveFirebaseUser,
    canAccessOps: canAccessOps,
    label: function (role) { return LABELS[role] || LABELS.explorer; },
    isOfficialEmail: function (email) { return Boolean(OFFICIAL_ACCOUNTS[normalizeEmail(email)]); }
  });
})(window);
