/**
 * 🎯 POR QUÉ: impedir que la cola de reservas vuelva a excluir las solicitudes
 * recibidas directamente por teléfono o WhatsApp.
 * ⚙️ CÓMO: valida de forma estática el contrato coordinado entre migración,
 * Edge Function, Ops Center e internacionalización en los seis idiomas.
 * 📦 QUÉ: prueba de regresión sin red ni credenciales para el flujo de reservas.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

const migration = read('supabase/migrations/20261008010000_reservations_phone_whatsapp_intake.sql');
assert.match(migration, /channel in \('android', 'web', 'phone', 'whatsapp'\)/);

const edge = read('supabase/functions/baqueano-reservas/index.ts');
assert.match(edge, /case "create_manual"/);
assert.match(edge, /if \(!a\.isAdmin\)/);
assert.match(edge, /channel !== "phone" && channel !== "whatsapp"/);
assert.match(edge, /business\.verified !== true/);

const liveData = read('website/js/ops-center/ops-live-data.js');
assert.match(liveData, /callReservations\('create_manual'/);
assert.match(liveData, /opsReservationStatus/);
assert.match(liveData, /RES_CHANNEL/);

const engine = read('website/js/ops-center/ops-engine.js');
assert.match(engine, /id="opsReservationForm"/);
assert.match(engine, /data-i18n="opsReservations\.title"/);

for (const language of ['es', 'en', 'fr', 'it', 'pt', 'de', 'ko', 'zh']) {
  const catalog = JSON.parse(read(`website/locales/${language}.json`));
  for (const key of ['title', 'new', 'formTitle', 'phone', 'whatsapp', 'business', 'traveler', 'save', 'empty', 'loadError']) {
    assert.equal(typeof catalog.opsReservations?.[key], 'string', `${language}: falta opsReservations.${key}`);
    assert.ok(catalog.opsReservations[key].trim(), `${language}: opsReservations.${key} está vacío`);
  }
}

console.log('Reservas Ops: teléfono + WhatsApp cubiertos en BD, servidor, interfaz e i18n.');
