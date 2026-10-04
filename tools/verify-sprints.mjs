#!/usr/bin/env node
// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — VALIDADOR AUTOMATIZADO DE SPRINTS 1, 2 Y 3
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Producir evidencia técnica verificable, repetible y auditable de los requisitos
//   fundamentales de los Sprints 1, 2 y 3 (Accesibilidad Pública, Seguridad Básica,
//   Funcionamiento Autónomo, Integración Completa y Actualización del Repositorio)
//   sin requerir intervenciones manuales ni exponer datos privados en el cliente.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Consulta el endpoint /health de producción y verifica paridad con el commit de GitHub.
// - Valida el runtime de la máquina virtual Azure (Linux Azure, Node.js v22).
// - Comprueba la conectividad de base de datos desde Azure (Supabase PostgreSQL y PostgreSQL local).
// - Verifica la navegación autónoma de punta a punta (Home, Destinos, Mapa, Mi Viaje, Perfil).
// - Audita el perímetro de red: puertos 80 y 443 accesibles; puertos 3000 y 5432 filtrados/cerrados.
// - Valida la resolución DNS y accesibilidad de la IP pública 20.80.81.65.
// - Valida la integración de datos cliente con Supabase y la existencia del instalable móvil Android (APK).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Genera un reporte JSON con métricas, estados de respuesta y auditoría de seguridad
//   almacenable en docs/evidencias/sprint-*/resultados/.
// ============================================================================

import net from 'node:net';
import fs from 'node:fs/promises';
import path from 'node:path';
import dns from 'node:dns/promises';

const args = Object.fromEntries(
  process.argv.slice(2).map((entry) => {
    const [key, ...value] = entry.replace(/^--/, '').split('=');
    return [key, value.join('=') || 'true'];
  })
);

const site = args.site || 'https://baqueanonicaragua.com';
const publicIp = args.ip || '20.80.81.65';
const expectedCommit = args.commit || '';
const output = args.output || '';
const results = [];

async function httpCheck(name, url, options = {}, validate = () => true) {
  try {
    const response = await fetch(url, {
      redirect: options.redirect || 'follow',
      signal: AbortSignal.timeout(20_000),
      ...options
    });
    const type = response.headers.get('content-type') || '';
    const body = type.includes('json') ? await response.json() : await response.text();
    const ok = response.ok && validate(response, body);
    results.push({
      name,
      ok,
      status: response.status,
      detail: ok ? 'correcto' : 'respuesta inesperada'
    });
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
      results.push({
        name: 'puerto-' + port,
        ok,
        detail: open ? 'abierto' : 'cerrado_o_filtrado'
      });
      resolve();
    };
    socket.setTimeout(4_000);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
  });
}

async function run() {
  // 1. Salud de producción y paridad de commit (Sprint 3 / Repositorio)
  const health = await httpCheck('azure-health', site + '/health', {}, (_response, body) =>
    body?.status === 'ok' && (!expectedCommit || String(body.commit).startsWith(expectedCommit))
  );

  // 2. Runtime de Azure VM (Sprint 2 / Infraestructura)
  await httpCheck('azure-runtime', site + '/api/azure/health', {}, (_response, body) =>
    body?.status === 'ok' && body?.service === 'baqueano-azure-api' && /Linux/.test(body?.platform || '')
  );

  // 3. Conectividad Azure -> Supabase PostgreSQL y Postgres Local (Sprint 2 / Base de Datos)
  await httpCheck('azure-database', site + '/api/azure/db', {}, (_response, body) =>
    body?.primaryDatabase?.provider === 'supabase-postgresql' &&
    body?.primaryDatabase?.ok === true &&
    body?.azureLocalPostgres?.ok === true
  );

  // 4. Funcionamiento Autónomo: Flujo completo de navegación del usuario (Sprint 3)
  for (const route of ['/', '/destinos.html', '/mapa.html', '/mi-viaje.html', '/perfil.html']) {
    await httpCheck('flujo' + route, site + route, {}, (response) => response.status === 200);
  }

  // 5. Accesibilidad Pública: Resolución DNS y acceso a IP
  try {
    const lookup = await dns.lookup(new URL(site).hostname);
    const dnsMatch = lookup.address === publicIp;
    results.push({
      name: 'dns-resolucion-ip',
      ok: dnsMatch,
      detail: dnsMatch ? 'dominio apunta a IP de Azure (' + publicIp + ')' : 'ip no coincide: ' + lookup.address
    });
  } catch (err) {
    results.push({ name: 'dns-resolucion-ip', ok: false, detail: err.message });
  }

  // 6. Seguridad Básica de Red: Puertos autorizados vs críticos aislados (Sprint 2)
  await Promise.all([
    portCheck(80, true),
    portCheck(443, true),
    portCheck(3000, false),
    portCheck(5432, false)
  ]);

  // 7. Integración Completa: Consulta real a Supabase (Sprint 3 / Base de datos)
  try {
    const supabaseUrl = 'https://heiudfpthqwtjrtluqlm.supabase.co';
    const supabaseKey = 'sb_publishable_q7ZhqRIRjlerZK7WOu_Qxw_X_AqXV1d';
    const resDept = await fetch(supabaseUrl + '/rest/v1/departments?select=id,name&limit=5', {
      headers: { apikey: supabaseKey, Authorization: 'Bearer ' + supabaseKey },
      signal: AbortSignal.timeout(10_000)
    });
    const depts = await resDept.json();
    const deptsOk = resDept.ok && Array.isArray(depts) && depts.length > 0;
    results.push({
      name: 'integracion-datos-supabase',
      ok: deptsOk,
      detail: deptsOk ? 'consulta exitosa: ' + depts.length + ' departamentos obtenidos' : 'error en consulta'
    });
  } catch (err) {
    results.push({ name: 'integracion-datos-supabase', ok: false, detail: err.message });
  }

  // 8. Aplicación Móvil Android: Existencia del paquete APK funcional (Sprint 1)
  try {
    const apkPath = path.resolve('website/assets/BaqueanoNicaragua.apk');
    const stat = await fs.stat(apkPath);
    const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);
    const apkOk = stat.size > 20_000_000;
    results.push({
      name: 'aplicacion-movil-apk',
      ok: apkOk,
      detail: apkOk ? 'APK verificado (' + sizeMb + ' MB)' : 'tamano insuficiente'
    });
  } catch (err) {
    results.push({ name: 'aplicacion-movil-apk', ok: false, detail: err.message });
  }

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
    await fs.writeFile(target, JSON.stringify(summary, null, 2) + '\n', 'utf8');
  }
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failed > 0) process.exitCode = 1;
}

run().catch((err) => {
  console.error('Error ejecutando verificación:', err);
  process.exit(1);
});

