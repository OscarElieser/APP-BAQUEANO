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
//   1. Custom Claim `role` del token (admin | super_admin | auditor), si existe.
//   2. Si no, correo VERIFICADO por Firebase que figure en la matriz oficial.
//   3. Si no, el servidor (Edge Function baqueano-community, acción `whoami`)
//      consulta public.staff_roles con el token verificado: así se asignan
//      auditores sin tocar código.
//   4. Cualquier otra cuenta autenticada es `explorer` (usuario normal).
// - AUDITOR: entra al Ops Center en SOLO LECTURA (ve auditoría, moderación y
//   respaldos; no crea, edita, publica ni borra). El servidor lo hace cumplir.
// - Nunca se lee el rol de localStorage, sessionStorage, la URL ni Firestore
//   escrito por el cliente.
// - Esto decide únicamente qué muestra la interfaz. La protección real de los
//   datos la aplican firestore.rules / storage.rules (función isAdmin(), misma
//   condición: claim o correo verificado en la lista) y el middleware de
//   Functions. Si cambia esta matriz, se cambian también esos archivos.
//
// 📦 QUÉ (What / Entregables):
// - window.BaqueanoRoles.resolve({ email, emailVerified, claimsRole }) → rol.
// - window.BaqueanoRoles.canAccessOps(rol) → admin, super_admin y auditor.
// - window.BaqueanoRoles.canWriteOps(rol) → solo admin y super_admin.
// - window.BaqueanoRoles.label(rol) → etiqueta en español para la interfaz.
// - window.BaqueanoRoles.resolveFirebaseUser(user) → Promise<rol> (lee claims).
// ============================================================================
(function (window) {
  'use strict';
  if (window.BaqueanoRoles) return;

  var ROLES = Object.freeze({
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    AUDITOR: 'auditor',
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
    auditor: 'Auditor (solo lectura)',
    explorer: 'Explorador',
    guest: 'Invitado'
  });

  function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
  }

  function resolve(identity) {
    if (!identity) return ROLES.GUEST;
    var claim = String(identity.claimsRole || '').trim().toLowerCase();
    if (claim === ROLES.SUPER_ADMIN || claim === ROLES.ADMIN || claim === ROLES.AUDITOR) return claim;
    if (identity.emailVerified === true) {
      var official = OFFICIAL_ACCOUNTS[normalizeEmail(identity.email)];
      if (official) return official;
    }
    return ROLES.USER;
  }

  function canWriteOps(role) {
    return role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN;
  }

  function canAccessOps(role) {
    return canWriteOps(role) || role === ROLES.AUDITOR;
  }

  var WHOAMI_ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-community';

  // Rol asignado en el servidor (public.staff_roles). Solo se consulta si el
  // token y la matriz local dicen `explorer`; ante error se queda en explorer.
  function serverRole(user) {
    if (!user || user.emailVerified !== true || typeof user.getIdToken !== 'function' || typeof fetch !== 'function') {
      return Promise.resolve(null);
    }
    return user.getIdToken()
      .then(function (token) {
        return fetch(WHOAMI_ENDPOINT, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-firebase-token': token },
          body: JSON.stringify({ action: 'whoami' })
        });
      })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        var role = data && data.ok !== false ? String(data.role || '') : '';
        return role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN || role === ROLES.AUDITOR ? role : null;
      })
      .catch(function () { return null; });
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
      .catch(function () { return resolve(base); })
      .then(function (role) {
        if (role !== ROLES.USER) return role;
        return serverRole(user).then(function (remote) { return remote || role; });
      });
  }

  window.BaqueanoRoles = Object.freeze({
    ROLES: ROLES,
    resolve: resolve,
    resolveFirebaseUser: resolveFirebaseUser,
    canAccessOps: canAccessOps,
    canWriteOps: canWriteOps,
    label: function (role) { return LABELS[role] || LABELS.explorer; },
    isOfficialEmail: function (email) { return Boolean(OFFICIAL_ACCOUNTS[normalizeEmail(email)]); }
  });
})(window);
