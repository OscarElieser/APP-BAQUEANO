/**
 * POR QUE (WHY / PROPOSITO): Evitar regresiones en la lista oficial de cuentas
 * con autoridad total, ya que una omision bloquearia operaciones administrativas.
 *
 * COMO (HOW / ARQUITECTURA E IMPLEMENTACION): Comprueba la coleccion exportada
 * por el middleware con el runner nativo de Node.js y una igualdad exacta.
 *
 * QUE (WHAT / ENTREGABLES): Prueba automatizada de los tres superadministradores
 * oficiales y de la normalizacion en minusculas usada durante la autorizacion.
 */
"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const { OFFICIAL_ADMIN_EMAILS } = require("../lib/auth-middleware");

test("mantiene el registro exacto de superadministradores oficiales", () => {
  assert.deepEqual(
    [...OFFICIAL_ADMIN_EMAILS].sort(),
    [
      "byoscarelieser@gmail.com",
      "oscarelieser.informatica.inatec@gmail.com",
      "vigoronmixt@gmail.com"
    ]
  );
});
