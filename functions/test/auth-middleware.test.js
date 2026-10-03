/**
 * POR QUE (WHY / PROPOSITO): Evitar regresiones en la autorizacion del backend.
 * Una omision bloquearia operaciones administrativas; un exceso daria el Ops
 * Center a quien no corresponde (p. ej. un correo oficial sin verificar).
 *
 * COMO (HOW / ARQUITECTURA E IMPLEMENTACION): Prueba las funciones puras
 * isAdminIdentity / isSuperAdminIdentity con tokens decodificados simulados,
 * usando el runner nativo de Node.js (sin red ni Firebase real).
 *
 * QUE (WHAT / ENTREGABLES): Matriz oficial del propietario (2026-10-03):
 * super_admin = oscarelieser.informatica.inatec@gmail.com;
 * admin = byoscarelieser@gmail.com, vigoronmixt@gmail.com;
 * usuarios normales y correos sin verificar = sin acceso administrativo.
 */
"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const {
  OFFICIAL_ADMIN_EMAILS,
  OFFICIAL_SUPER_ADMIN_EMAILS,
  isAdminIdentity,
  isSuperAdminIdentity
} = require("../lib/auth-middleware");

const SUPER = "oscarelieser.informatica.inatec@gmail.com";
const ADMINS = ["byoscarelieser@gmail.com", "vigoronmixt@gmail.com"];
const token = (email, extra = {}) => ({ uid: "u1", email, email_verified: true, ...extra });

test("mantiene el registro exacto de administradores oficiales", () => {
  assert.deepEqual([...OFFICIAL_ADMIN_EMAILS].sort(), [ADMINS[0], SUPER, ADMINS[1]].sort());
});

test("solo la cuenta fundadora es superadministradora", () => {
  assert.deepEqual([...OFFICIAL_SUPER_ADMIN_EMAILS], [SUPER]);
  assert.equal(isSuperAdminIdentity(token(SUPER)), true);
  for (const email of ADMINS) assert.equal(isSuperAdminIdentity(token(email)), false, email);
});

test("las tres cuentas oficiales verificadas son administradoras", () => {
  for (const email of [SUPER, ...ADMINS]) assert.equal(isAdminIdentity(token(email)), true, email);
});

test("un correo oficial SIN verificar no obtiene privilegios", () => {
  for (const email of [SUPER, ...ADMINS]) {
    const unverified = token(email, { email_verified: false });
    assert.equal(isAdminIdentity(unverified), false, email);
    assert.equal(isSuperAdminIdentity(unverified), false, email);
  }
});

test("la comparacion de correo ignora mayusculas y espacios", () => {
  assert.equal(isSuperAdminIdentity(token("  OscarElieser.Informatica.Inatec@Gmail.com ")), true);
});

test("un usuario normal verificado no es administrador", () => {
  const user = token("viajero@example.com");
  assert.equal(isAdminIdentity(user), false);
  assert.equal(isSuperAdminIdentity(user), false);
});

test("los Custom Claims emitidos por el Admin SDK se respetan", () => {
  assert.equal(isAdminIdentity(token("x@example.com", { role: "admin" })), true);
  assert.equal(isAdminIdentity(token("x@example.com", { admin: true })), true);
  assert.equal(isSuperAdminIdentity(token("x@example.com", { role: "admin" })), false);
  assert.equal(isSuperAdminIdentity(token("x@example.com", { role: "super_admin" })), true);
});

test("tokens vacios o sin correo se rechazan", () => {
  assert.equal(isAdminIdentity(null), false);
  assert.equal(isAdminIdentity({ uid: "u1" }), false);
  assert.equal(isSuperAdminIdentity(undefined), false);
});
