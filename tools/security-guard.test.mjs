// 🧪 Pruebas de la puerta de seguridad (tools/security-guard.mjs): cada detector atrapa su caso
// y no da falsos positivos con el código correcto. `node --test tools/security-guard.test.mjs`
import test from 'node:test';
import assert from 'node:assert/strict';
import { scanSecrets, scanForbidden, tablesWithoutRls, definerWithoutSearchPath, decodeJwtRole } from './security-guard.mjs';

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt = (role) => `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ iss: 'supabase', role })}.firmaFalsaDePrueba123`;

test('JWT con rol service_role se detecta; el anon no', () => {
  assert.equal(decodeJwtRole(jwt('service_role')), 'service_role');
  assert.equal(scanSecrets('website/js/a.js', `const k = "${jwt('service_role')}";`)[0].rule, 'jwt-service-role');
  assert.equal(scanSecrets('website/js/a.js', `const k = "${jwt('anon')}";`).length, 0);
});

test('claves privadas, sb_secret y AWS', () => {
  const pem = ['-----BEGIN', 'PRIVATE KEY-----'].join(' ');
  assert.equal(scanSecrets('x.txt', pem)[0].rule, 'clave-privada');
  assert.equal(scanSecrets('x.ts', 'const s = "sb_secret_' + 'abcdefghijklmnop";')[0].rule, 'supabase-secret');
  assert.equal(scanSecrets('x.ts', 'AKIA' + 'ABCDEFGHIJKLMNOP')[0].rule, 'aws-key');
});

test('clave de servidor en el cliente (web, app, APK) pero no en funciones de servidor', () => {
  assert.equal(scanSecrets('website/js/x.js', 'fetch(u, { headers: { k: SUPABASE_SERVICE_ROLE_KEY } })')[0].rule, 'clave-servidor-en-cliente');
  assert.equal(scanSecrets('lib/main.dart', 'final k = serviceRoleKey;')[0].rule, 'clave-servidor-en-cliente');
  assert.equal(scanSecrets('supabase/functions/a/index.ts', 'Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")').length, 0);
});

test('palabra prohibida, sin distinguir mayúsculas', () => {
  const w = ['Pre', 'mium'].join('');
  assert.equal(scanForbidden(`hola\n${w} aquí`)[0].line, 2);
  assert.equal(scanForbidden('plan Cumbre').length, 0);
});

test('tabla nueva sin RLS se detecta; con RLS (directa o en bloque) no', () => {
  const m = (file, sql) => ({ file, sql });
  assert.deepEqual(tablesWithoutRls([m('a.sql', 'create table public.foo (id int);')]).map((x) => x.table), ['foo']);
  assert.equal(tablesWithoutRls([m('a.sql', 'create table if not exists public.foo (id int);'), m('b.sql', 'alter table public.foo enable row level security;')]).length, 0);
  assert.equal(tablesWithoutRls([m('a.sql', "create table bar (id int);\nforeach t in array array['bar'] loop execute format('alter table public.%I enable row level security', t); end loop;")]).length, 0);
  assert.equal(tablesWithoutRls([m('a.sql', '-- create table public.zz (id int);\ncreate table storage.x (id int);')]).length, 0);
});

test('SECURITY DEFINER sin search_path se detecta; con SET search_path o ALTER posterior no', () => {
  const bad = "create or replace function public.f() returns int language sql security definer as $$ select 1 $$;";
  const good = "create or replace function public.f() returns int language sql security definer set search_path = '' as $$ select 1 $$;";
  const after = "create function public.g() returns int as $$ select 1 $$ language sql security definer;";
  assert.deepEqual(definerWithoutSearchPath([{ file: 'a.sql', sql: bad }]).map((x) => x.fn), ['f']);
  assert.equal(definerWithoutSearchPath([{ file: 'a.sql', sql: good }]).length, 0);
  assert.deepEqual(definerWithoutSearchPath([{ file: 'a.sql', sql: after }]).map((x) => x.fn), ['g']);
  assert.equal(definerWithoutSearchPath([{ file: 'a.sql', sql: bad }, { file: 'b.sql', sql: "alter function public.f() set search_path = '';" }]).length, 0);
  assert.equal(definerWithoutSearchPath([{ file: 'a.sql', sql: bad }, { file: 'b.sql', sql: good }]).length, 0);
});
