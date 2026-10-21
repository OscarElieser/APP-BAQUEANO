#!/usr/bin/env node
/**
 * 🛡️ BAQUEANO — PUERTA DE SEGURIDAD (tools/security-guard.mjs)
 *
 * 🎯 POR QUÉ (propietario, 2026-10-21): «Qué hacemos para que no tenga fallas ni problemas de
 *   seguridad, hay que blindar eso». Esta puerta corre en cada PR y en main, y falla si algo nuevo
 *   abre un hueco antes de que llegue a producción.
 * ⚙️ CÓMO: lee solo los archivos versionados (git ls-files) y revisa:
 *   1. Claves privadas o credenciales de servidor en el repositorio (claves PEM, `sb_secret_`,
 *      JWT con rol `service_role`, cuentas de servicio de Google, claves AWS).
 *   2. Que el código que corre en el navegador o en el APK no use la clave de servidor de Supabase.
 *   3. Que toda tabla creada en `public` por una migración tenga RLS activada.
 *   4. Que toda función SECURITY DEFINER de `public` fije su search_path.
 *   5. La palabra prohibida por el propietario.
 *   Lo que ya existía antes de esta puerta queda en tools/security-guard-baseline.json (trinquete):
 *   no se borra nada, pero no puede aparecer nada nuevo.
 * 📦 QUÉ: `node tools/security-guard.mjs` → informe y salida 1 si hay hallazgos nuevos.
 *   `--update-baseline` reescribe la línea base (solo con autorización del propietario).
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE = join(ROOT, 'tools', 'security-guard-baseline.json');
const FORBIDDEN = ['pre', 'mium'].join(''); // palabra vetada; se arma en partes para no contenerla.

const TEXT_EXT = /\.(m?js|cjs|ts|tsx|jsx|json|jsonc|html?|css|md|sql|ya?ml|toml|dart|kt|kts|java|gradle|properties|xml|sh|py|txt|env|rules|conf|ini)$/i;
const CLIENT_DIRS = [/^website\/(?!scripts\/|docs\/)/, /^lib\//, /^android\/app\/src\//];

export function decodeJwtRole(token) {
  try {
    const part = token.split('.')[1];
    const json = JSON.parse(Buffer.from(part.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    return typeof json.role === 'string' ? json.role : null;
  } catch { return null; }
}

/** Busca credenciales en un texto. Devuelve [{rule, line}]. */
export function scanSecrets(path, text) {
  const out = [];
  const lines = text.split('\n');
  lines.forEach((l, i) => {
    const at = i + 1;
    if (/-----BEGIN (RSA |EC |OPENSSH |DSA |ENCRYPTED |)PRIVATE KEY-----/.test(l)) out.push({ rule: 'clave-privada', line: at });
    if (/\bsb_secret_[A-Za-z0-9_-]{10,}/.test(l)) out.push({ rule: 'supabase-secret', line: at });
    if (/\bAKIA[0-9A-Z]{16}\b/.test(l)) out.push({ rule: 'aws-key', line: at });
    if (/"type"\s*:\s*"service_account"/.test(l) && /"private_key"/.test(text)) out.push({ rule: 'google-service-account', line: at });
    for (const m of l.matchAll(/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g)) {
      if (decodeJwtRole(m[0]) === 'service_role') out.push({ rule: 'jwt-service-role', line: at });
    }
    if (CLIENT_DIRS.some((r) => r.test(path)) && /SUPABASE_SERVICE_ROLE_KEY|serviceRoleKey|service_role_key/i.test(l)) {
      out.push({ rule: 'clave-servidor-en-cliente', line: at });
    }
  });
  return out;
}

/** Palabra prohibida (sin distinguir mayúsculas). */
export function scanForbidden(text) {
  const out = [];
  const re = new RegExp(FORBIDDEN, 'i');
  text.split('\n').forEach((l, i) => { if (re.test(l)) out.push({ rule: 'palabra-prohibida', line: i + 1 }); });
  return out;
}

const stripComments = (sql) => sql.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
const ident = (s) => s.replace(/"/g, '').toLowerCase();

/** Tablas de public creadas por migraciones sin RLS activada en ninguna migración. */
export function tablesWithoutRls(migrations) {
  const created = new Map();
  const rls = new Set();
  for (const { file, sql } of migrations) {
    const s = stripComments(sql);
    for (const m of s.matchAll(/create\s+(?:unlogged\s+)?table\s+(?:if\s+not\s+exists\s+)?((?:"?\w+"?\.)?"?\w+"?)\s*\(/gi)) {
      const full = ident(m[1]);
      const [schema, name] = full.includes('.') ? full.split('.') : ['public', full];
      if (schema === 'public' && !created.has(name)) created.set(name, file);
    }
    for (const m of s.matchAll(/alter\s+table\s+(?:if\s+exists\s+)?(?:only\s+)?((?:"?\w+"?\.)?"?\w+"?)\s+enable\s+row\s+level\s+security/gi)) {
      const full = ident(m[1]);
      rls.add(full.includes('.') ? full.split('.')[1] : full);
    }
    // Bloques dinámicos: format('alter table public.%I enable row level security', t) sobre un array literal.
    for (const m of s.matchAll(/array\s*\[([^\]]+)\][\s\S]{0,400}?enable\s+row\s+level\s+security/gi)) {
      for (const t of m[1].matchAll(/'(\w+)'/g)) rls.add(t[1].toLowerCase());
    }
  }
  return [...created].filter(([name]) => !rls.has(name)).map(([name, file]) => ({ table: name, file }));
}

/** Funciones SECURITY DEFINER de public cuya última definición no fija search_path. */
export function definerWithoutSearchPath(migrations) {
  const last = new Map();
  for (const { file, sql } of migrations) {
    const s = stripComments(sql);
    const re = /create\s+(?:or\s+replace\s+)?function\s+((?:"?\w+"?\.)?"?\w+"?)\s*\(/gi;
    let m;
    while ((m = re.exec(s))) {
      const full = ident(m[1]);
      const [schema, name] = full.includes('.') ? full.split('.') : ['public', full];
      if (schema !== 'public') continue;
      // Cabecera hasta el inicio del cuerpo ($...$ o 'as').
      const rest = s.slice(m.index);
      const bodyAt = rest.search(/\$[a-z_]*\$/i);
      const header = rest.slice(0, bodyAt > 0 ? bodyAt : 2000);
      const tail = bodyAt > 0 ? rest.slice(bodyAt) : '';
      const tag = bodyAt > 0 ? rest.slice(bodyAt).match(/^\$[a-z_]*\$/i)[0] : '';
      const end = tag ? tail.indexOf(tag, tag.length) : -1;
      const after = end > 0 ? tail.slice(end + tag.length, end + tag.length + 400).split(';')[0] : '';
      const decl = header + ' ' + after;
      last.set(name, { file, definer: /security\s+definer/i.test(decl), path: /set\s+search_path/i.test(decl) });
    }
    for (const a of s.matchAll(/alter\s+function\s+((?:"?\w+"?\.)?"?\w+"?)\s*\([^)]*\)[^;]*set\s+search_path/gi)) {
      const full = ident(a[1]);
      const name = full.includes('.') ? full.split('.')[1] : full;
      if (last.has(name)) last.get(name).path = true;
    }
  }
  return [...last].filter(([, v]) => v.definer && !v.path).map(([name, v]) => ({ fn: name, file: v.file }));
}

function trackedFiles() {
  return execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .split('\0').filter(Boolean);
}

export function collect() {
  const findings = [];
  const migrations = [];
  for (const path of trackedFiles()) {
    if (!TEXT_EXT.test(path) || path.startsWith('tools/security-guard')) continue;
    const abs = join(ROOT, path);
    if (!existsSync(abs)) continue;
    let text;
    try { text = readFileSync(abs, 'utf8'); } catch { continue; }
    if (text.length > 8 * 1024 * 1024 || text.includes('\u0000')) continue;
    for (const f of scanSecrets(path, text)) findings.push({ ...f, file: path });
    for (const f of scanForbidden(text)) findings.push({ ...f, file: path });
    if (/^supabase\/migrations\/.+\.sql$/.test(path)) migrations.push({ file: path, sql: text });
  }
  migrations.sort((a, b) => a.file.localeCompare(b.file));
  for (const t of tablesWithoutRls(migrations)) findings.push({ rule: 'tabla-sin-rls', file: t.file, detail: t.table });
  for (const f of definerWithoutSearchPath(migrations)) findings.push({ rule: 'definer-sin-search-path', file: f.file, detail: f.fn });
  return findings;
}

// Clave estable: sin número de línea, para que mover texto no rompa la línea base.
const key = (f) => [f.rule, f.file, f.detail || ''].join('|');

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const findings = collect();
  const counts = {};
  for (const f of findings) counts[key(f)] = (counts[key(f)] || 0) + 1;
  if (process.argv.includes('--update-baseline')) {
    writeFileSync(BASELINE, JSON.stringify({ note: 'Hallazgos previos a la puerta (2026-10-21). Solo pueden bajar.', counts }, null, 2) + '\n');
    console.log(`Línea base escrita: ${Object.keys(counts).length} entradas.`);
    process.exit(0);
  }
  const base = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, 'utf8')).counts : {};
  const fresh = findings.filter((f) => {
    const k = key(f);
    if ((base[k] || 0) > 0) { base[k]--; return false; }
    return true;
  });
  const byRule = {};
  findings.forEach((f) => { byRule[f.rule] = (byRule[f.rule] || 0) + 1; });
  console.log('🛡️ Puerta de seguridad BAQUEANO');
  console.log('   Hallazgos totales por regla:', JSON.stringify(byRule));
  if (!fresh.length) { console.log('✅ Sin hallazgos nuevos.'); process.exit(0); }
  console.log(`❌ ${fresh.length} hallazgo(s) nuevo(s):`);
  for (const f of fresh) console.log(`   - [${f.rule}] ${f.file}${f.line ? ':' + f.line : ''}${f.detail ? ' → ' + f.detail : ''}`);
  process.exit(1);
}
