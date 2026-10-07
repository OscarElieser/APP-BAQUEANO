// 🎯 POR QUÉ: probar que BAQÜI conserva el contexto y calcula bien (pedido del propietario 2026-10-07).
// ⚙️ CÓMO: node:test sobre baqui-brain.js con las conversaciones del propio pedido.
// 📦 QUÉ: node --test tests/baqui-brain.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const B = require('../js/baqui-brain.js');

function talk(lines, prices) {
  let state = B.createState(); const out = [];
  for (const line of lines) {
    const r = B.understand(state, line.user); state = r.state;
    if (line.assistant) state = B.remember(state, line.assistant);
    out.push({ intent: r.intent, state: JSON.parse(JSON.stringify(state)), budget: r.intent === 'budget' || r.intent === 'correction' ? B.budget(state, prices || []) : null });
  }
  return out;
}

test('playa → ¿cuánto gasto? usa el destino recomendado y no muestra menú', () => {
  const r = talk([{ user: 'Quiero playa', assistant: 'Si querés ambiente, San Juan del Sur es buena opción; si preferís tranquilidad, Las Peñitas.' }, { user: '¿Cuánto gasto?' }]);
  assert.equal(r[1].intent, 'budget');
  const b = r[1].budget;
  assert.equal(b.destination, 'San Juan del Sur');
  assert.deepEqual(b.assumptions.sort(), ['days2', 'originManagua', 'travelers1'].sort());
  const text = B.composeBudget(b);
  assert.match(text, /San Juan del Sur/);
  assert.doesNotMatch(text, /Puedo ayudarte con|Por dónde querés empezar/);
});

test('esposa y dos niños + 500 dólares: 4 viajeros, USD y reparto exacto', () => {
  const r = talk([{ user: 'Quiero playa y voy con mi esposa y dos niños' }, { user: 'Tengo 500 dólares' }, { user: '¿cuánto gasto?' }]);
  const s = r[2].state;
  assert.equal(s.adultos, 2); assert.equal(s.ninos, 2); assert.equal(s.viajeros, 4);
  assert.equal(s.presupuesto, 500); assert.equal(s.moneda, 'USD'); assert.equal(s.moneda_supuesta, false);
  const b = r[2].budget;
  const sum = b.split.reduce((acc, row) => acc + row.usd, 0);
  assert.ok(Math.abs(sum - 500) < 0.05, 'el reparto suma el presupuesto');
  assert.equal(b.split.summary.perPersonUsd, 125);
  assert.equal(b.split.summary.perPersonDayUsd, 62.5);
});

test('seguimientos: ¿y para cuatro? / mejor sábado y domingo / ¿y comida?', () => {
  const r = talk([{ user: 'quiero ir a Las Peñitas' }, { user: 'cuanto gasto con 200 dolares' }, { user: '¿y para cuatro?' }, { user: 'mejor solo sábado y domingo' }, { user: '¿y comida?' }]);
  assert.equal(r[2].intent, 'budget'); assert.equal(r[2].state.viajeros, 4); assert.equal(r[2].state.destino_actual, 'Las Peñitas');
  assert.equal(r[3].intent, 'budget'); assert.equal(r[3].state.dias, 2); assert.equal(r[3].state.noches, 1); assert.equal(r[3].state.viajeros, 4);
  assert.equal(r[4].intent, 'budget'); assert.equal(r[4].budget.focus, 'food');
  assert.equal(r[4].state.presupuesto, 200);
});

test('"no me mostraste el cálculo" es una corrección que vuelve al presupuesto', () => {
  const r = talk([{ user: 'Quiero playa', assistant: 'San Juan del Sur tiene ambiente.' }, { user: 'no me mostraste cuánto puedo gastar en comida, pasaje y hospedaje' }]);
  assert.equal(r[1].intent, 'correction');
  const text = B.composeBudget(r[1].budget, { correction: true });
  assert.match(text, /^Tenés razón/);
  assert.match(text, /San Juan del Sur/);
});

test('"ahí" se resuelve al último destino recomendado', () => {
  const r = talk([{ user: '¿qué playa me recomendás?', assistant: 'Te recomiendo Pochomil para ir en familia.' }, { user: '¿cuánto gasto ahí?' }]);
  assert.equal(r[1].budget.destination, 'Pochomil');
});

test('con precios verificados suma, compara con el presupuesto y avisa si se pasa', () => {
  const prices = [
    { product_name: 'Bus Managua–Rivas', amount: 150, currency: 'NIO', price_type: 'per_person', source_name: 'Cooperativa X', is_active: true },
    { product_name: 'Hostal doble', amount: 40, currency: 'USD', price_type: 'per_night', source_name: 'Negocio verificado', is_active: true }
  ];
  const r = talk([{ user: 'somos 2 personas a San Juan del Sur, 3 días, tengo 100 dólares' }, { user: 'cuanto gasto' }], prices);
  const b = r[1].budget;
  assert.equal(b.travelers, 2); assert.equal(b.days, 3); assert.equal(b.nights, 2);
  const expectedNio = 150 * 2 + 40 * 36.6243 * 2;
  assert.ok(Math.abs(b.verifiedTotalNio - expectedNio) < 0.01);
  assert.equal(b.split.summary.overBudget, false);
  const text = B.composeBudget(b);
  assert.match(text, /fuente: Cooperativa X/);
});

test('el número de días o personas no se toma como presupuesto', () => {
  const r = talk([{ user: 'somos 5 personas por 3 días' }]);
  assert.equal(r[0].state.presupuesto, null);
  assert.equal(r[0].state.viajeros, 5); assert.equal(r[0].state.dias, 3);
});

test('anti-bucle detecta una respuesta repetida', () => {
  let s = B.createState();
  s = B.remember(s, 'Creo que seguís con el presupuesto para Granada. Decime qué querés ajustar.');
  assert.equal(B.isDuplicate(s, 'Creo que seguís con el presupuesto para Granada. Decime qué querés ajustar.'), true);
});

test('el punto de salida del desglose no se vuelve el destino recordado', () => {
  let s = B.createState();
  s = B.understand(s, '¿Cuánto gasto? Voy con mi esposa y dos niños, tengo 500 dólares').state;
  const text = B.composeBudget(B.budget(s, []), {});
  assert.match(text, /saliendo de Managua/);
  s = B.remember(s, text);
  assert.notEqual(s.ultimo_recomendado, 'Managua');
  const again = B.budget(B.understand(s, "no me mostraste el cálculo").state, []);
  assert.notEqual(again.destination, 'Managua');
});
