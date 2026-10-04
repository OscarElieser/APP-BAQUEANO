/*
=====================================================
BAQUEANO — API de infraestructura Azure
=====================================================

PROPÓSITO:
  Demostrar el flujo real "Cliente → servidor Azure → datos" que exige la
  rúbrica del Hackathon Nicaragua 2026 (Sprint 2 y 3), sin sustituir la
  arquitectura oficial: Supabase sigue siendo la base de datos principal.

ARQUITECTURA:
  - Servidor HTTP nativo de Node.js 20 (sin dependencias npm: nada que
    auditar ni instalar, menor superficie de ataque).
  - Escucha SOLO en 127.0.0.1:3000. Internet llega únicamente por Nginx
    (443) en la ruta /api/azure/*. El puerto 3000 nunca se abre en el NSG.
  - Lo ejecuta systemd (azure/systemd/baqueano-api.service) como usuario sin
    privilegios, con reinicio automático y arranque al encender la VM.

DEPENDENCIAS:
  Node.js 20 (fetch y AbortController nativos), pg_isready (paquete
  postgresql-client) para verificar el PostgreSQL local.

DATOS:
  - Supabase: conteo de departamentos publicados mediante PostgREST con la
    clave PUBLICABLE (la misma que ya usa el Website). No descarga filas.
  - PostgreSQL local: solo comprueba que acepta conexiones (evidencia de BD
    instalada en Azure); no contiene datos de BAQUEANO.
  - health.json de la release activa: commit de GitHub desplegado.

SEGURIDAD:
  - GET/HEAD para salud y un POST acotado para la prueba CRUD efímera.
  - La prueba genera su propio token criptográfico, no acepta campos de negocio
    y elimina el registro al terminar.
  - Resultados cacheados 30 s: miles de peticiones no se traducen en miles de
    consultas a Supabase.
  - Timeouts de 5 s en llamadas externas para que la API nunca se bloquee.
  - La clave service_role NO se usa aquí. Si una ruta futura la necesita,
    se leerá de /etc/baqueano/api.env (permisos 600), nunca de Git.

RELACIÓN:
  azure/nginx/baqueano.conf (proxy /api/azure/), azure/systemd/,
  docs/AZURE_DEPLOYMENT.md (evidencias para el jurado).
=====================================================
*/
'use strict';

const http = require('node:http');
const os = require('node:os');
const fs = require('node:fs/promises');
const { execFile } = require('node:child_process');
const { createHash, randomBytes, randomUUID } = require('node:crypto');

const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT || 3000);

// Valores públicos por diseño (idénticos a website/js/supabase-config.js).
// Se pueden sobrescribir desde /etc/baqueano/api.env.
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://heiudfpthqwtjrtluqlm.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_q7ZhqRIRjlerZK7WOu_Qxw_X_AqXV1d';
const RELEASE_HEALTH = process.env.RELEASE_HEALTH || '/var/www/baqueano/current/health.json';

const CACHE_TTL_MS = 30_000;
const EXTERNAL_TIMEOUT_MS = 5_000;
let dbCache = { at: 0, value: null };
const evidenceRate = new Map();

// Lee el commit desplegado escrito por azure/deploy.sh.
async function readRelease() {
  try {
    return JSON.parse(await fs.readFile(RELEASE_HEALTH, 'utf8'));
  } catch {
    return { status: 'unknown' };
  }
}

// Comprueba el PostgreSQL local sin credenciales (pg_isready solo prueba el socket).
function checkLocalPostgres() {
  return new Promise((resolve) => {
    execFile('pg_isready', ['-h', '127.0.0.1', '-p', '5432'], { timeout: EXTERNAL_TIMEOUT_MS }, (error, stdout) => {
      if (error && error.code === 'ENOENT') return resolve({ ok: false, detail: 'pg_isready no instalado' });
      resolve({ ok: !error, detail: String(stdout || '').trim() || 'sin respuesta' });
    });
  });
}

// Cuenta departamentos en Supabase con HEAD + Prefer: count=exact (cero filas transferidas).
async function checkSupabase() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EXTERNAL_TIMEOUT_MS);
  const started = Date.now();
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/departments?select=id`, {
      method: 'HEAD',
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        Prefer: 'count=exact'
      },
      signal: controller.signal
    });
    const range = response.headers.get('content-range') || '';
    const total = Number.parseInt(range.split('/')[1], 10);
    return {
      ok: response.ok,
      status: response.status,
      departments: Number.isFinite(total) ? total : null,
      latencyMs: Date.now() - started
    };
  } catch (error) {
    return { ok: false, error: error.name === 'AbortError' ? 'timeout' : 'network_error' };
  } finally {
    clearTimeout(timer);
  }
}

async function databaseStatus() {
  if (dbCache.value && Date.now() - dbCache.at < CACHE_TTL_MS) return { ...dbCache.value, cached: true };
  const [supabase, localPostgres] = await Promise.all([checkSupabase(), checkLocalPostgres()]);
  const value = {
    primaryDatabase: { provider: 'supabase-postgresql', ...supabase },
    azureLocalPostgres: { role: 'evidencia-rubrica (solo localhost, sin datos productivos)', ...localPostgres },
    checkedAt: new Date().toISOString()
  };
  dbCache = { at: Date.now(), value };
  return { ...value, cached: false };
}

// Ejecuta una operación PostgREST autenticada por el token efímero que RLS
// compara contra `proof_hash`. La clave usada es publicable y no omite RLS.
async function evidenceRequest(resource, method, proofToken, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EXTERNAL_TIMEOUT_MS);
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${resource}`, {
      method,
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        'Content-Type': 'application/json',
        'X-Proof-Token': proofToken,
        Prefer: method === 'DELETE' ? 'return=minimal' : 'return=representation'
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) {
      const error = new Error(`Supabase ${method} respondió ${response.status}`);
      error.status = response.status;
      error.safeCode = data?.code || 'DATA_API_ERROR';
      throw error;
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

// Prueba aislada crear → leer → actualizar → leer → eliminar. Nunca modifica
// catálogos, usuarios ni reservas y no devuelve el token de autorización.
async function runEvidenceCrud() {
  const proofToken = randomBytes(32).toString('hex');
  const proofHash = createHash('sha256').update(proofToken).digest('hex');
  const id = randomUUID();
  const table = 'sprint_evidence_records';
  const filter = `${table}?id=eq.${encodeURIComponent(id)}`;
  const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();

  try {
    const created = await evidenceRequest(table, 'POST', proofToken, {
      id,
      proof_hash: proofHash,
      value: 'created-by-azure',
      version: 1,
      expires_at: expiresAt
    });
    const read = await evidenceRequest(`${filter}&select=id,value,version`, 'GET', proofToken);
    const updated = await evidenceRequest(filter, 'PATCH', proofToken, {
      value: 'updated-by-azure',
      version: 2,
      updated_at: new Date().toISOString()
    });
    const verified = await evidenceRequest(`${filter}&select=id,value,version`, 'GET', proofToken);
    await evidenceRequest(filter, 'DELETE', proofToken);

    const valid = created?.[0]?.id === id && read?.[0]?.version === 1 &&
      updated?.[0]?.version === 2 && verified?.[0]?.value === 'updated-by-azure';
    if (!valid) throw new Error('La secuencia CRUD no devolvió el estado esperado');

    return {
      ok: true,
      source: 'supabase-postgresql',
      via: 'azure-api',
      operations: ['create', 'read', 'update', 'delete'],
      recordId: id,
      cleanup: true,
      checkedAt: new Date().toISOString()
    };
  } catch (error) {
    // Limpieza defensiva: si una fase intermedia falla, se intenta borrar la fila.
    try { await evidenceRequest(filter, 'DELETE', proofToken); } catch { /* no-op */ }
    throw error;
  }
}

function clientAddress(req) {
  return String(req.headers['x-real-ip'] || req.socket.remoteAddress || 'unknown').slice(0, 80);
}

function allowEvidenceRun(req) {
  const key = clientAddress(req);
  const now = Date.now();
  const current = evidenceRate.get(key);
  if (current && now - current.startedAt < 60_000 && current.count >= 3) return false;
  const next = !current || now - current.startedAt >= 60_000
    ? { startedAt: now, count: 1 }
    : { ...current, count: current.count + 1 };
  evidenceRate.set(key, next);
  if (evidenceRate.size > 500) {
    for (const [address, window] of evidenceRate) {
      if (now - window.startedAt >= 60_000) evidenceRate.delete(address);
    }
  }
  return true;
}

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(payload);
}

const routes = {
  // Estado del servidor Azure y del commit desplegado.
  '/api/azure/health': async () => ({
    status: 'ok',
    service: 'baqueano-azure-api',
    hostname: os.hostname(),
    platform: `${os.type()} ${os.release()}`,
    node: process.version,
    uptimeSeconds: Math.round(os.uptime()),
    release: await readRelease()
  }),
  // Conectividad Azure → Supabase (base principal) y PostgreSQL local (evidencia).
  '/api/azure/db': databaseStatus,
  '/api/azure/evidence/crud': runEvidenceCrud
};

const server = http.createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://localhost').pathname.replace(/\/+$/, '');
    const handler = routes[path];
    if (!handler) return send(res, 404, { error: 'not_found' });
    const isEvidenceCrud = path === '/api/azure/evidence/crud';
    if (isEvidenceCrud && req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' });
    if (!isEvidenceCrud && req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'method_not_allowed' });
    if (isEvidenceCrud && !allowEvidenceRun(req)) return send(res, 429, { error: 'rate_limited' });
    return send(res, 200, await handler());
  } catch (error) {
    // Nunca se exponen trazas internas al cliente.
    console.error('[baqueano-api]', error);
    return send(res, 500, { error: 'internal_error' });
  }
});

server.requestTimeout = 10_000;

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`[baqueano-api] escuchando en http://${HOST}:${PORT}`);
  });

  // Apagado ordenado cuando systemd detiene o reinicia el servicio.
  for (const signal of ['SIGTERM', 'SIGINT']) {
    process.on(signal, () => server.close(() => process.exit(0)));
  }
}

module.exports = { checkSupabase, databaseStatus, evidenceRequest, runEvidenceCrud, allowEvidenceRun, server };
