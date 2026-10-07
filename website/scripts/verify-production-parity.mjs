#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: BAQUEANO necesita demostrar que localhost, GitHub y producción
 * sirven la misma versión verificable, no una copia local distinta.
 * ⚙️ CÓMO: Lee `/health` y `/version.json` desde el artefacto local servido en
 * 127.0.0.1:8088 y desde producción; si localhost no responde, levanta el
 * servidor local que sirve `dist-hostinger/`.
 * 📦 QUÉ: Puerta de paridad que compara commit/build y reporta evidencia
 * trazable sin modificar infraestructura ni credenciales.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const args = new Map(
  process.argv.slice(2)
    .filter((arg) => arg.startsWith('--') && arg.includes('='))
    .map((arg) => {
      const [key, ...value] = arg.slice(2).split('=');
      return [key, value.join('=')];
    })
);

const explicitLocalBase = args.get('local') || process.env.LOCAL_SITE || '';
let localBase = (explicitLocalBase || 'http://127.0.0.1:8088').replace(/\/+$/, '');
const productionBase = (args.get('production') || process.env.PRODUCTION_SITE || 'https://baqueanonicaragua.com').replace(/\/+$/, '');
const allowDifferent = process.argv.includes('--allow-different');

async function fetchJson(base, route, optional = false) {
  const response = await fetch(`${base}${route}`, {
    headers: { 'cache-control': 'no-cache' }
  });
  if (!response.ok) {
    if (optional) return null;
    throw new Error(`${base}${route} devolvio HTTP ${response.status}`);
  }
  return response.json();
}

async function isLocalReady() {
  try {
    const response = await fetch(`${localBase}/health`, { headers: { 'cache-control': 'no-cache' } });
    return response.ok;
  } catch {
    return false;
  }
}

function startLocalServer() {
  const port = new URL(localBase).port || '8088';
  const child = spawn(process.execPath, ['scripts/serve-demo.mjs'], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, BAQUEANO_LOCAL_PORT: port }
  });
  child.stdout.on('data', (chunk) => process.stdout.write(chunk));
  child.stderr.on('data', (chunk) => process.stderr.write(chunk));
  return child;
}

async function waitForLocalServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (await isLocalReady()) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Localhost no respondio en ${localBase}/health`);
}

function commitFrom(health, version) {
  return String(version?.commit || health?.fullCommit || health?.commit || '').trim();
}

function shortCommitFrom(health, version) {
  const value = String(version?.shortCommit || health?.commit || '').trim();
  return value || commitFrom(health, version).slice(0, 7);
}

function commitsMatch(localCommit, productionCommit) {
  if (!localCommit || !productionCommit) return false;
  return localCommit.startsWith(productionCommit) || productionCommit.startsWith(localCommit);
}

let server = null;
try {
  if (!(await isLocalReady())) {
    if (!explicitLocalBase) {
      localBase = 'http://127.0.0.1:18088';
    }
    server = startLocalServer();
    await waitForLocalServer();
  }

  const [localHealth, localVersion, productionHealth, productionVersion] = await Promise.all([
    fetchJson(localBase, '/health'),
    fetchJson(localBase, '/version.json', true),
    fetchJson(productionBase, '/health'),
    fetchJson(productionBase, '/version.json', true)
  ]);

  const localCommit = commitFrom(localHealth, localVersion);
  const productionCommit = commitFrom(productionHealth, productionVersion);
  const localShort = shortCommitFrom(localHealth, localVersion);
  const productionShort = shortCommitFrom(productionHealth, productionVersion);
  const sameCommit = commitsMatch(localCommit, productionCommit);

  const report = {
    local: {
      base: localBase,
      commit: localShort,
      buildId: localVersion?.buildId || localHealth?.buildId || null,
      dirty: Boolean(localVersion?.dirty || localHealth?.dirty)
    },
    production: {
      base: productionBase,
      commit: productionShort,
      buildId: productionVersion?.buildId || productionHealth?.buildId || null,
      deployedAt: productionHealth?.deployedAt || productionVersion?.builtAt || null
    },
    sameCommit
  };

  console.log(JSON.stringify(report, null, 2));
  if (!sameCommit && !allowDifferent) {
    throw new Error(`Paridad fallida: localhost=${localShort || '?'} produccion=${productionShort || '?'}`);
  }
  if (report.local.dirty) {
    console.warn('Aviso: el build local fue generado con cambios sin commit.');
  }
} finally {
  if (server) server.kill();
}
