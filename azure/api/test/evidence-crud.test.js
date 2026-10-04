/**
 * 🎯 POR QUÉ: prevenir regresiones en la demostración Cliente → Azure → Supabase.
 * ⚙️ CÓMO: sustituye `fetch` por una Data API determinista y valida la secuencia
 * completa, incluido el borrado final, sin tocar servicios remotos.
 * 📦 QUÉ: prueba unitaria del ciclo CRUD efímero y de sus cabeceras RLS.
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const originalFetch = global.fetch;
const calls = [];
let record = null;

global.fetch = async (url, options = {}) => {
  calls.push({ url: String(url), options });
  const method = options.method || 'GET';
  if (method === 'POST') {
    record = JSON.parse(options.body);
    return new Response(JSON.stringify([record]), { status: 201 });
  }
  if (method === 'GET') return new Response(JSON.stringify(record ? [record] : []), { status: 200 });
  if (method === 'PATCH') {
    record = { ...record, ...JSON.parse(options.body) };
    return new Response(JSON.stringify([record]), { status: 200 });
  }
  if (method === 'DELETE') {
    record = null;
    return new Response(null, { status: 204 });
  }
  return new Response('{}', { status: 405 });
};

const { runEvidenceCrud } = require('../server');

test.after(() => {
  global.fetch = originalFetch;
});

test('crea, lee, actualiza, verifica y elimina evidencia efimera', async () => {
  const result = await runEvidenceCrud();
  assert.equal(result.ok, true);
  assert.deepEqual(result.operations, ['create', 'read', 'update', 'delete']);
  assert.equal(result.cleanup, true);
  assert.deepEqual(calls.map((call) => call.options.method), ['POST', 'GET', 'PATCH', 'GET', 'DELETE']);
  assert.ok(calls.every((call) => /^[a-f0-9]{64}$/.test(call.options.headers['X-Proof-Token'])));
  assert.equal(record, null);
});

