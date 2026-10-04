#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: producir evidencia repetible de los requisitos Sprint 1–3 sin
 * depender de capturas aisladas o afirmaciones manuales.
 * ⚙️ CÓMO: consulta producción, compara el commit esperado, valida rutas,
 * descarga Android, conexión de datos, CRUD efímero y exposición de puertos.
 * 📦 QUÉ: resumen JSON apto para CI y `docs/evidencias/sprint-*/resultados/`.
 */
import net from 'node:net';
import fs from 'node:fs/promises';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((entry) => {
  const [key, ...value] = entry.replace(/^--/, '').split('=');
  return [key, value.join('=') || 'true'];
}));
const site = args.site || 'https://baqueanonicaragua.com';
const publicIp = args.ip || '20.80.81.65';
const expectedCommit = args.commit || '';
const output = args.output || '';
const results = [];

async function httpCheck(name, url, options = {}, validate = () => true) {
  try {
    const response = await fetch(url, { redirect: options.redirect || 'follow', signal: AbortSignal.timeout(20_000), ...options });
    const type = response.headers.get('content-type') || '';
    const body = type.includes('json') ? await response.json() : await response.text();
    const ok = response.ok && validate(response, body);
    results.push({ name, ok, status: response.status, detail: ok ? 'correcto' : 'respuesta inesperada' });
    return { response, body };
  } catch (error) {
    results.push({ name, ok: false, detail: error.message });
    return { response: null, body: null };
  }
}

function portCheck(port, expectedOpen) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: publicIp, port });
    const finish = (open) => {
      socket.destroy();
      const ok = open === expectedOpen;
      results.push({ name: `puerto-${port}`, ok, detail: open ? 'abierto' : 'cerrado_o_filtrado' });
      resolve();
    };
    socket.setTimeout(4_000);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
  });
}

const health = await httpCheck('azure-health', `${site}/health`, {}, (_response, body) =>
  body?.status === 'ok' && (!expectedCommit || String(body.commit).startsWith(expectedCommit))
);
await httpCheck('azure-runtime', `${site}/api/azure/health`, {}, (_response, body) =>
  body?.status === 'ok' && body?.service === 'baqueano-azure-api' && /Linux/.test(body?.platform || '')
);
await httpCheck('azure-database', `${site}/api/azure/db`, {}, (_response, body) =>
  body?.primaryDatabase?.provider === 'supabase-postgresql' && body?.primaryDatabase?.ok === true && body?.azureLocalPostgres?.ok === true
);

for (const route of ['/', '/destinos.html', '/mapa.html', '/mi-viaje.html', '/perfil.html']) {
  await httpCheck(`flujo${route}`, `${site}${route}`, {}, (response) => response.status === 200);
}

await httpCheck('ip-publica-redirige', `http://${publicIp}/`, { redirect: 'manual' }, (response) =>
  response.status === 301 && response.headers.get('location')?.startsWith('https://baqueanonicaragua.com')
);
await httpCheck('apk-descargable', `${site}/downloads/baqueano-android.apk`, { method: 'HEAD' }, (response) =>
  response.status === 200 && Number(response.headers.get('content-length') || 0) > 1_000_000
);
await httpCheck('crud-completo', `${site}/api/azure/evidence/crud`, { method: 'POST' }, (_response, body) =>
  body?.ok === true && body?.source === 'supabase-postgresql' && body?.cleanup === true && body?.operations?.join(',') === 'create,read,update,delete'
);

await Promise.all([
  portCheck(80, true),
  portCheck(443, true),
  portCheck(3000, false),
  portCheck(5432, false)
]);

const summary = {
  generatedAt: new Date().toISOString(),
  site,
  publicIp,
  expectedCommit: expectedCommit || null,
  deployedCommit: health.body?.commit || null,
  passed: results.filter((result) => result.ok).length,
  failed: results.filter((result) => !result.ok).length,
  results
};

if (output) {
  const target = path.resolve(output);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
}
console.log(JSON.stringify(summary, null, 2));
if (summary.failed > 0) process.exitCode = 1;

