#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: demostrar con el emulador que firestore.rules aplica los roles
 *    (docs/security/ROLES_Y_PERMISOS.md): el Auditor lee pero no escribe, la
 *    auditoría es inmutable y solo el Superadmin la depura.
 * ⚙️ CÓMO: @firebase/rules-unit-testing contra el emulador de Firestore
 *    (FIRESTORE_EMULATOR_HOST). Cada caso usa un token con claims concretos.
 * 📦 QUÉ: `firebase emulators:exec --only firestore "node tools/firestore-rules.test.mjs"`.
 */
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const [host, port] = (process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080').split(':');
const env = await initializeTestEnvironment({ projectId: 'baqueano-rules-test', firestore: { rules, host, port: Number(port) } });

await env.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  await setDoc(doc(db, 'audit_logs/log1'), { action: 'seed' });
  await setDoc(doc(db, 'destinations/draft1'), { status: 'draft', name: 'Borrador' });
  await setDoc(doc(db, 'ai_settings/s1'), { autonomy: false });
  await setDoc(doc(db, 'payment_orders/p1'), { amount: 10 });
});

const as = (uid, claims) => env.authenticatedContext(uid, claims).firestore();
const auditor = as('aud', { role: 'auditor', email: 'auditor@example.com', email_verified: true });
const auditorUnverified = as('aud2', { role: 'auditor', email: 'x@example.com', email_verified: false });
const admin = as('adm', { role: 'admin', email: 'admin@example.com', email_verified: true });
const superAdmin = as('sup', { role: 'super_admin', email: 'root@example.com', email_verified: true });
const explorer = as('exp', { email: 'viajero@example.com', email_verified: true });

const cases = [
  ['Auditor lee auditoría', () => assertSucceeds(getDoc(doc(auditor, 'audit_logs/log1')))],
  ['Auditor lee borrador de destino', () => assertSucceeds(getDoc(doc(auditor, 'destinations/draft1')))],
  ['Auditor lee ajustes de IA', () => assertSucceeds(getDoc(doc(auditor, 'ai_settings/s1')))],
  ['Auditor NO escribe destinos', () => assertFails(setDoc(doc(auditor, 'destinations/d2'), { status: 'published' }))],
  ['Auditor NO escribe ajustes de IA', () => assertFails(updateDoc(doc(auditor, 'ai_settings/s1'), { autonomy: true }))],
  ['Auditor NO crea auditoría', () => assertFails(setDoc(doc(auditor, 'audit_logs/log2'), { action: 'x' }))],
  ['Auditor NO ve pagos (datos privados)', () => assertFails(getDoc(doc(auditor, 'payment_orders/p1')))],
  ['Auditor sin correo verificado NO lee auditoría', () => assertFails(getDoc(doc(auditorUnverified, 'audit_logs/log1')))],
  ['Explorador NO lee auditoría', () => assertFails(getDoc(doc(explorer, 'audit_logs/log1')))],
  ['Explorador NO lee borrador', () => assertFails(getDoc(doc(explorer, 'destinations/draft1')))],
  ['Admin crea auditoría', () => assertSucceeds(setDoc(doc(admin, 'audit_logs/log3'), { action: 'crear' }))],
  ['Admin NO edita auditoría (inmutable)', () => assertFails(updateDoc(doc(admin, 'audit_logs/log1'), { action: 'alterada' }))],
  ['Admin NO borra auditoría', () => assertFails(deleteDoc(doc(admin, 'audit_logs/log1')))],
  ['Superadmin NO edita auditoría', () => assertFails(updateDoc(doc(superAdmin, 'audit_logs/log1'), { action: 'alterada' }))],
  ['Superadmin depura auditoría', () => assertSucceeds(deleteDoc(doc(superAdmin, 'audit_logs/log3')))],
  ['Admin escribe destinos', () => assertSucceeds(setDoc(doc(admin, 'destinations/d3'), { status: 'draft' }))],
];

let failed = 0;
for (const [name, run] of cases) {
  try { await run(); console.log(`✅ ${name}`); }
  catch (error) { failed += 1; console.error(`❌ ${name}: ${error.message.split('\n')[0]}`); }
}
await env.cleanup();
console.log(failed ? `\n${failed} falla(s)` : `\nfirestore.rules: ${cases.length}/${cases.length} OK`);
process.exit(failed ? 1 : 0);
