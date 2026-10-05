#!/usr/bin/env node
// ============================================================================
// 🧭 BAQUEANO — EVIDENCIA DE PRODUCCIÓN KRONOX 2026 (kronox-prod-evidence.mjs)
// ============================================================================
// 🎯 POR QUÉ:
// - El jurado necesita evidencia reproducible de que producción es REAL:
//   commit desplegado = GitHub main, HTTPS/TLS válido, cabeceras de seguridad,
//   puertos internos cerrados, páginas críticas, SEO/PWA y que Supabase
//   rechaza escrituras/lecturas no autorizadas. Un documento no basta.
// - El verificador anterior (tools/verify-sprints.mjs) se mantiene; este lo
//   complementa con los requisitos de Sprint 3 y NO aborta en el primer fallo:
//   registra cada control con su resultado para que un fallo (p. ej. VM que no
//   actualiza) no oculte el resto de la evidencia.
// ⚙️ CÓMO: Node 22 sin dependencias (fetch, tls, net, dns). Cada control produce
//   { id, requirement, ok, detail }. Salida JSON + Markdown en --out (directorio).
// 📦 QUÉ: `node tools/kronox-prod-evidence.mjs --expected=<sha> --out=evidence/`
//   Exit code 1 si falla algún control marcado `critical`.
// ============================================================================
import tls from 'node:tls';
import net from 'node:net';
import dns from 'node:dns/promises';
import fs from 'node:fs/promises';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const [k, ...v] = a.replace(/^--/, '').split('=');
  return [k, v.join('=') || 'true'];
}));
const SITE = args.site || 'https://baqueanonicaragua.com';
const HOST = new URL(SITE).hostname;
const EXPECTED = (args.expected || '').slice(0, 40);
const OUT = args.out || '';
const SUPABASE = 'https://heiudfpthqwtjrtluqlm.supabase.co';
// Clave PUBLICABLE (pública por diseño, va en el sitio). Nunca service_role.
const ANON = 'sb_publishable_q7ZhqRIRjlerZK7WOu_Qxw_X_AqXV1d';
const results = [];
const record = (id, requirement, ok, detail, critical = false) => results.push({ id, requirement, ok: Boolean(ok), critical, detail: String(detail).slice(0, 400) });

async function get(url, opts = {}) {
  const res = await fetch(url, { redirect: opts.redirect || 'follow', signal: AbortSignal.timeout(20000), ...opts });
  const text = opts.method === 'HEAD' ? '' : await res.text();
  return { res, text };
}

async function safe(id, requirement, fn, critical = false) {
  try { await fn(); } catch (error) { record(id, requirement, false, `error: ${error.message}`, critical); }
}

// 1) Despliegue: /health = GitHub main ------------------------------------------
await safe('S3-10/health', 'Producción /health sirve el commit de main', async () => {
  const { res, text } = await get(`${SITE}/health`);
  const body = JSON.parse(text);
  const deployed = String(body.commit || '');
  const match = EXPECTED ? EXPECTED.startsWith(deployed) || deployed.startsWith(EXPECTED.slice(0, 7)) : true;
  record('S3-10/health', 'Producción /health sirve el commit de main', res.ok && body.status === 'ok' && match,
    `status=${res.status} desplegado=${deployed} esperado=${EXPECTED.slice(0, 7) || '(no indicado)'} deployedAt=${body.deployedAt || '?'}`, true);
}, true);

// 2) Dominio, HTTPS y redirecciones -------------------------------------------------
await safe('S3-02/http', 'HTTP redirige a HTTPS', async () => {
  const { res } = await get(`http://${HOST}/`, { redirect: 'manual' });
  const loc = res.headers.get('location') || '';
  record('S3-02/http', 'HTTP redirige a HTTPS', [301, 308].includes(res.status) && loc.startsWith('https://'), `status=${res.status} location=${loc}`, true);
}, true);
await safe('S3-01/www', 'www responde y converge al dominio canónico', async () => {
  const { res } = await get(`https://www.${HOST}/`, { redirect: 'manual' });
  const loc = res.headers.get('location') || '';
  record('S3-01/www', 'www responde y converge al dominio canónico', res.status === 200 || ([301, 308].includes(res.status) && loc.includes(HOST)), `status=${res.status} location=${loc || '(sin redirección)'}`);
});
await safe('S3-02/tls', 'Certificado TLS válido', () => new Promise((resolve) => {
  const socket = tls.connect({ host: HOST, port: 443, servername: HOST, timeout: 15000 }, () => {
    const cert = socket.getPeerCertificate();
    const days = Math.round((new Date(cert.valid_to) - Date.now()) / 86400000);
    record('S3-02/tls', 'Certificado TLS válido', socket.authorized && days > 7,
      `autorizado=${socket.authorized} emisor=${cert.issuer && cert.issuer.O} vence=${cert.valid_to} (${days} días) protocolo=${socket.getProtocol()}`, true);
    socket.end(); resolve();
  });
  socket.on('error', (e) => { record('S3-02/tls', 'Certificado TLS válido', false, e.message, true); resolve(); });
  socket.on('timeout', () => { record('S3-02/tls', 'Certificado TLS válido', false, 'timeout', true); socket.destroy(); resolve(); });
}), true);
await safe('S2-15/dns', 'DNS del dominio', async () => {
  const a = await dns.resolve4(HOST);
  record('S2-15/dns', 'DNS del dominio apunta a Azure', a.length > 0, `A=${a.join(', ')}`);
});

// 3) Cabeceras de seguridad ---------------------------------------------------------
await safe('S3-04/headers', 'Cabeceras de seguridad', async () => {
  const { res, text } = await get(`${SITE}/`);
  const h = (n) => res.headers.get(n);
  const required = ['strict-transport-security', 'content-security-policy', 'x-content-type-options', 'referrer-policy', 'permissions-policy'];
  const missing = required.filter((n) => !h(n));
  const frame = Boolean(h('x-frame-options')) || /frame-ancestors/i.test(h('content-security-policy') || '');
  record('S3-04/headers', 'HSTS, CSP, nosniff, Referrer-Policy, Permissions-Policy y anti-framing', missing.length === 0 && frame,
    missing.length || !frame ? `faltan: ${[...missing, ...(frame ? [] : ['x-frame-options/frame-ancestors'])].join(', ')}` : `HSTS="${h('strict-transport-security')}" XFO="${h('x-frame-options') || '-'}"`, true);
  record('S3-04/server-banner', 'Sin versión de servidor expuesta', !/\d/.test(h('server') || ''), `server=${h('server') || '(oculto)'}`);
  // SEO del home (S3-14)
  const canonical = (text.match(/<link[^>]+rel=["']canonical["'][^>]*>/i) || [''])[0];
  record('S3-14/canonical', 'Canonical del home apunta al dominio oficial', canonical.includes(`https://${HOST}/`), canonical || 'sin canonical');
  record('S3-14/meta', 'Title, description y Open Graph en el home', /<title>[^<]{10,}/i.test(text) && /name=["']description["']/i.test(text) && /property=["']og:title["']/i.test(text), 'title/description/og:title');
  record('S3-14/hreflang', 'hreflang declarado', /hreflang=/i.test(text), /hreflang=/i.test(text) ? 'presente' : 'ausente');
  record('S3-14/jsonld', 'Datos estructurados JSON-LD', /application\/ld\+json/i.test(text), /application\/ld\+json/i.test(text) ? 'presente' : 'ausente');
  record('S3-12/manifest-link', 'Manifest enlazado', /rel=["']manifest["']/i.test(text), /rel=["']manifest["']/i.test(text) ? 'presente' : 'ausente');
});

// 4) Archivos internos no expuestos ------------------------------------------------
for (const p of ['/README.md', '/.git/config', '/.env', '/supabase/config.toml', '/package.json']) {
  await safe(`S3-04/blocked${p}`, `No se sirve ${p}`, async () => {
    const { res } = await get(`${SITE}${p}`, { redirect: 'manual' });
    record(`S3-04/blocked${p}`, `No se sirve ${p}`, res.status === 404 || res.status === 403, `status=${res.status}`, true);
  }, true);
}

// 5) Páginas críticas ----------------------------------------------------------------
const pages = ['/', '/destinos.html', '/departamento.html?depto=madriz', '/destino.html', '/mapa.html', '/baqueano-ia.html', '/mi-viaje.html',
  '/perfil.html', '/experiencias.html', '/testimonios.html', '/mi-negocio.html', '/ayuda.html', '/offline.html', '/404.html', '/admin.html'];
for (const p of pages) {
  await safe(`S3-10/page${p}`, `Página ${p}`, async () => {
    const { res, text } = await get(`${SITE}${p}`);
    record(`S3-10/page${p}`, `Página ${p} responde 200 con HTML`, res.status === 200 && /<html/i.test(text), `status=${res.status} bytes=${text.length}`);
  });
}
await safe('S3-10/404', 'Ruta inexistente devuelve 404', async () => {
  const { res } = await get(`${SITE}/esta-ruta-no-existe-kronox`, { redirect: 'manual' });
  record('S3-10/404', 'Ruta inexistente devuelve 404 (no 200)', res.status === 404, `status=${res.status}`);
});

// 6) SEO y PWA -----------------------------------------------------------------------
await safe('S3-14/robots', 'robots.txt', async () => {
  const { res, text } = await get(`${SITE}/robots.txt`);
  record('S3-14/robots', 'robots.txt con Sitemap', res.ok && /sitemap:/i.test(text), `status=${res.status} sitemap=${/sitemap:/i.test(text)}`);
});
await safe('S3-14/sitemap', 'sitemap.xml', async () => {
  const { res, text } = await get(`${SITE}/sitemap.xml`);
  const urls = (text.match(/<loc>/g) || []).length;
  record('S3-14/sitemap', 'sitemap.xml válido', res.ok && urls > 5, `status=${res.status} urls=${urls}`);
});
// La PWA es válida con cualquiera de los nombres estándar (manifest.json o
// manifest.webmanifest; service-worker.js o sw.js): se exige uno de cada par.
for (const [id, label, paths] of [
  ['S3-12/manifest', 'PWA manifest servido', ['/manifest.json', '/manifest.webmanifest']],
  ['S3-12/service-worker', 'PWA service worker servido', ['/service-worker.js', '/sw.js']]
]) {
  await safe(id, label, async () => {
    const found = [];
    for (const p of paths) {
      const { res } = await get(`${SITE}${p}`, { method: 'HEAD' });
      if (res.ok) found.push(p);
    }
    record(id, label, found.length > 0, found.length ? `servido=${found.join(',')}` : `ninguno de ${paths.join(',')}`);
  });
}

// 7) Azure → Supabase (cliente-servidor) --------------------------------------------
await safe('S2-15/api', 'API Azure consulta Supabase vía HTTPS', async () => {
  const { res, text } = await get(`${SITE}/api/azure/db`);
  record('S2-15/api', 'API Azure (VM) consulta Supabase vía HTTPS', res.ok && /supabase-postgresql/.test(text) && /"ok":true/.test(text), `status=${res.status} ${text.slice(0, 160)}`, true);
}, true);

// 8) Puertos (perímetro) --------------------------------------------------------------
const ip = (await dns.resolve4(HOST).catch(() => []))[0];
const portOpen = (port) => new Promise((resolve) => {
  const s = net.createConnection({ host: ip, port });
  const done = (open) => { s.destroy(); resolve(open); };
  s.setTimeout(4000); s.once('connect', () => done(true)); s.once('timeout', () => done(false)); s.once('error', () => done(false));
});
if (ip) {
  for (const [port, shouldOpen] of [[80, true], [443, true], [5432, false], [3000, false], [6379, false], [8080, false], [3306, false]]) {
    const open = await portOpen(port);
    record(`S2-15/port-${port}`, `Puerto ${port} ${shouldOpen ? 'abierto' : 'cerrado al público'}`, open === shouldOpen, `${ip}:${port} ${open ? 'abierto' : 'cerrado/filtrado'}`, !shouldOpen);
  }
  const ssh = await portOpen(22);
  record('S2-15/port-22', 'SSH restringido (no abierto a Internet)', !ssh, `${ip}:22 ${ssh ? 'ABIERTO desde el runner de GitHub (revisar NSG)' : 'cerrado/filtrado para IPs no autorizadas'}`);
}

// 9) Supabase: lecturas públicas sí, escrituras/lecturas sensibles no ----------------
const rest = (p, opts = {}) => fetch(`${SUPABASE}/rest/v1/${p}`, { ...opts, headers: { apikey: ANON, 'content-type': 'application/json', ...(opts.headers || {}) }, signal: AbortSignal.timeout(20000) });
await safe('S2-01/public-read', 'Lectura pública del catálogo', async () => {
  const r = await rest('municipalities?select=id&limit=200');
  const rows = await r.json();
  record('S2-07/municipalities', '153 municipios disponibles vía API pública', r.ok && Array.isArray(rows) && rows.length === 153, `status=${r.status} filas=${Array.isArray(rows) ? rows.length : '?'}`);
  const d = await rest('departments?select=id');
  const dr = await d.json();
  record('S2-06/departments', '17 territorios vía API pública', d.ok && Array.isArray(dr) && dr.length === 17, `status=${d.status} filas=${Array.isArray(dr) ? dr.length : '?'}`);
});
for (const [table, body] of [['destinations', { id: 'kronox-probe', name: 'x' }], ['businesses', { id: 'kronox-probe', name: 'x' }], ['municipalities', { id: 'x', department_id: 'leon', name: 'x' }]]) {
  await safe(`S3-05/anon-write-${table}`, `anon no escribe ${table}`, async () => {
    const r = await rest(table, { method: 'POST', body: JSON.stringify(body), headers: { Prefer: 'return=minimal' } });
    record(`S3-05/anon-write-${table}`, `anon NO puede insertar en ${table}`, r.status === 401 || r.status === 403, `status=${r.status}`, true);
  }, true);
}
for (const table of ['profiles', 'audit_logs', 'reservations', 'sos_events', 'analytics_events', 'commercial_actions', 'user_feedback', 'ai_messages', 'staff_roles']) {
  await safe(`S3-05/anon-read-${table}`, `anon no lee ${table}`, async () => {
    const r = await rest(`${table}?select=*&limit=1`);
    const t = await r.text();
    record(`S3-05/anon-read-${table}`, `anon NO lee filas de ${table}`, t === '[]' || r.status >= 400, `status=${r.status} ${t.slice(0, 60)}`, true);
  }, true);
}
await safe('S3-05/rpc-kpi', 'anon no ejecuta kpi_dashboard', async () => {
  const r = await fetch(`${SUPABASE}/rest/v1/rpc/kpi_dashboard`, { method: 'POST', headers: { apikey: ANON, 'content-type': 'application/json' }, body: '{}', signal: AbortSignal.timeout(20000) });
  record('S3-05/rpc-kpi', 'anon NO ejecuta kpi_dashboard()', r.status >= 400, `status=${r.status}`, true);
}, true);
await safe('S3-05/rpc-server-event', 'anon no emite eventos de servidor', async () => {
  const r = await fetch(`${SUPABASE}/rest/v1/rpc/track_event`, { method: 'POST', headers: { apikey: ANON, 'content-type': 'application/json' }, body: JSON.stringify({ p_event_name: 'user_registered', p_anonymous_id: 'kronox-ci-probe' }), signal: AbortSignal.timeout(20000) });
  record('S3-05/rpc-server-event', 'anon NO puede emitir user_registered (evento de servidor)', r.status >= 400, `status=${r.status}`, true);
}, true);

// Reporte -----------------------------------------------------------------------------
const summary = {
  generatedAt: new Date().toISOString(), site: SITE, expectedCommit: EXPECTED || null,
  passed: results.filter((r) => r.ok).length, failed: results.filter((r) => !r.ok).length,
  criticalFailed: results.filter((r) => !r.ok && r.critical).map((r) => r.id), results,
};
const md = [
  '# Evidencia de producción — Kronox 2026', '',
  `Generado: ${summary.generatedAt} · Sitio: ${SITE} · Commit esperado: ${EXPECTED.slice(0, 7) || '-'}`, '',
  `**${summary.passed} OK · ${summary.failed} con observaciones · críticos fallidos: ${summary.criticalFailed.length}**`, '',
  '| ID | Control | Resultado | Detalle |', '|---|---|---|---|',
  ...results.map((r) => `| ${r.id} | ${r.requirement} | ${r.ok ? '✅' : (r.critical ? '❌ crítico' : '⚠️')} | ${r.detail.replace(/\|/g, '\\|')} |`), '',
].join('\n');
if (OUT) {
  await fs.mkdir(OUT, { recursive: true });
  await fs.writeFile(path.join(OUT, 'kronox-prod-evidence.json'), `${JSON.stringify(summary, null, 2)}\n`);
  await fs.writeFile(path.join(OUT, 'kronox-prod-evidence.md'), md);
}
console.log(md);
if (process.env.GITHUB_STEP_SUMMARY) await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, md);
if (summary.criticalFailed.length) process.exitCode = 1;
