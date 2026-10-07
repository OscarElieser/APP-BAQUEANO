// ============================================================================
// 🧭 BAQÜI — MOTOR DE CONVERSACIÓN, MEMORIA Y PRESUPUESTO (baqui-brain.js)
// ============================================================================
// 🎯 POR QUÉ:
// - BAQÜI perdía el hilo. Después de "quiero playa", preguntar "¿cuánto gasto?" o "no me
//   mostraste el cálculo" devolvía el menú fijo de 5 capacidades: el código lo usaba como
//   respuesta de reserva antes de que el modelo pudiera responder. El propietario pidió
//   (2026-10-07) primero entender y después resolver: memoria estructurada, supuestos
//   explícitos, presupuesto con desglose por persona y grupo, y sin inventar precios.
//
// ⚙️ CÓMO (sin dependencias; funciona en el navegador y en Node para las pruebas):
// - Memoria: estado estructurado de la conversación (origen, destinos, días, noches, adultos,
//   niños, presupuesto, moneda, preferencias, último destino recomendado, última intención…).
//   Se actualiza con cada mensaje y nunca se vuelve a pedir lo que ya se sabe.
// - Comprensión: números en palabras, "mi esposa y dos niños", "tengo 500 dólares",
//   "fin de semana", "ahí", "¿y para cuatro?", "¿y comida?", "mejor tres días",
//   "no me mostraste el cálculo".
// - Presupuesto determinista: suma SOLO precios vigentes de public.prices (verificados, con
//   fuente y fecha). Si no hay precios verificados, no inventa tarifas: reparte el
//   presupuesto que la persona dio (distribución sugerida, porcentajes de política) y
//   muestra por persona, por grupo, por día, saldo y porcentaje usado. Cada número sale de
//   una operación visible.
// - Anti-bucle: guarda la firma de las respuestas recientes; nunca repite el menú.
//
// 📦 QUÉ: window.BaquiBrain (y module.exports) = { createState, understand, budget,
//   composeBudget, composeFallback, isDuplicate, remember, DESTINATIONS }.
// ============================================================================
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BaquiBrain = api;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Distribución sugerida del presupuesto del viajero cuando NO hay precios verificados.
  // No son tarifas: es una política de reparto, editable, que se dice como tal.
  const SPLIT_POLICY = Object.freeze([
    ['transport', 0.20], ['lodging', 0.30], ['food', 0.25], ['activities', 0.10], ['localTransport', 0.05], ['contingency', 0.10]
  ]);
  const CATEGORY_LABEL = {
    transport: 'Transporte ida y vuelta', lodging: 'Hospedaje', food: 'Alimentación (desayuno, almuerzo y cena)',
    activities: 'Actividades y entradas', localTransport: 'Transporte local', contingency: 'Reserva para imprevistos'
  };
  // Nombres → slugs aproximados para buscar precios por entidad (public.prices.entity_id).
  const DESTINATIONS = Object.freeze([
    ['San Juan del Sur', 'san-juan-del-sur', 'playa'], ['Las Peñitas', 'las-penitas', 'playa'], ['Poneloya', 'poneloya', 'playa'],
    ['Pochomil', 'pochomil', 'playa'], ['Masachapa', 'masachapa', 'playa'], ['Montelimar', 'montelimar', 'playa'],
    ['El Tránsito', 'el-transito', 'playa'], ['Huehuete', 'huehuete', 'playa'], ['Casares', 'casares', 'playa'],
    ['La Boquita', 'la-boquita', 'playa'], ['Popoyo', 'popoyo', 'playa'], ['Playa Maderas', 'playa-maderas', 'playa'],
    ['El Astillero', 'el-astillero', 'playa'], ['Jiquilillo', 'jiquilillo', 'playa'], ['Corn Island', 'corn-island', 'playa'],
    ['Little Corn Island', 'little-corn-island', 'playa'], ['Ometepe', 'ometepe', 'naturaleza'], ['Granada', 'granada', 'cultura'],
    ['León', 'leon', 'cultura'], ['Masaya', 'masaya', 'cultura'], ['Matagalpa', 'matagalpa', 'naturaleza'],
    ['Jinotega', 'jinotega', 'naturaleza'], ['Estelí', 'esteli', 'cultura'], ['Laguna de Apoyo', 'laguna-de-apoyo', 'naturaleza'],
    ['Somoto', 'somoto', 'naturaleza'], ['Catarina', 'catarina', 'cultura'], ['Río San Juan', 'rio-san-juan', 'naturaleza'],
    ['El Castillo', 'el-castillo', 'cultura'], ['Bluefields', 'bluefields', 'cultura'], ['Tola', 'tola', 'playa'],
    ['Managua', 'managua', 'cultura'], ['Chinandega', 'chinandega', 'cultura'], ['Rivas', 'rivas', 'cultura'],
    ['Carazo', 'carazo', 'cultura'], ['Boaco', 'boaco', 'naturaleza'], ['Chontales', 'chontales', 'naturaleza'],
    ['Nueva Segovia', 'nueva-segovia', 'naturaleza'], ['Madriz', 'madriz', 'naturaleza']
  ]);
  const NUMBER_WORDS = { un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
    once: 11, doce: 12, quince: 15, veinte: 20, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
  const NUM = '(\\d{1,3}|' + Object.keys(NUMBER_WORDS).join('|') + ')';

  function norm(text) { return String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\u00bf\u00a1]/g, '').toLowerCase().replace(/\s+/g, ' ').trim(); }
  function toNumber(token) { return /^\d+$/.test(token) ? Number(token) : (NUMBER_WORDS[token] || null); }

  function createState() {
    return {
      origen: null, destinos: [], destino_actual: null, departamentos: [], dias: null, noches: null,
      adultos: null, ninos: null, viajeros: null, presupuesto: null, moneda: null, moneda_supuesta: false,
      transporte: null, alojamiento: null, preferencias: [], restricciones: [], lugares_mencionados: [],
      ultimo_recomendado: null, ultima_intencion: null, enfoque: null, supuestos: [], recientes: [], turnos: 0
    };
  }

  function findDestinations(text) {
    const n = norm(text);
    return DESTINATIONS.filter(([name]) => {
      const key = norm(name);
      return new RegExp('(^|[^a-z])' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z]|$)').test(n);
    }).map(([name]) => name);
  }

  // Interpreta un mensaje: actualiza la memoria y devuelve la intención y los cambios.
  function understand(prev, message) {
    const state = JSON.parse(JSON.stringify(prev || createState()));
    const text = norm(message);
    const changed = {};
    state.turnos += 1;

    // ---- destinos y referencias ("ahí", "ese lugar")
    const found = findDestinations(message);
    if (found.length) {
      found.forEach((d) => { if (!state.destinos.includes(d)) state.destinos.push(d); if (!state.lugares_mencionados.includes(d)) state.lugares_mencionados.push(d); });
      state.destino_actual = found[found.length - 1];
      changed.destino = state.destino_actual;
    } else if (/\b(ahi|alli|alla|ese lugar|esa playa|ese destino|there)\b/.test(text) && (state.ultimo_recomendado || state.destino_actual)) {
      state.destino_actual = state.destino_actual || state.ultimo_recomendado;
      changed.referencia = state.destino_actual;
    }
    const origin = text.match(/\b(?:desde|salgo de|salimos de|saliendo de|vivo en|from)\s+([a-z ]{3,30}?)(?=[,.?!]|\s+(?:y|con|para|el|la|a)\b|$)/);
    if (origin) { const o = findDestinations(origin[1])[0]; if (o) { state.origen = o; changed.origen = o; } }

    // ---- viajeros
    let adults = null, kids = null;
    const kidsMatch = text.match(new RegExp(NUM + '\\s+(?:ninos?|ninas?|hijos?|hijas?|chavalos?|chavalas?|chiquitos?|cipotes?|kids|children)'));
    if (kidsMatch) kids = toNumber(kidsMatch[1]);
    const adultsMatch = text.match(new RegExp(NUM + '\\s+(?:adultos?|adults)'));
    if (adultsMatch) adults = toNumber(adultsMatch[1]);
    if (adults == null && /\b(con mi|con mis|y mi)\s+(esposa|esposo|pareja|novia|novio|marido|mujer|compa|companera|companero|wife|husband|partner)\b/.test(text)) adults = 2;
    if (adults == null && /\b(voy solo|voy sola|viajo solo|viajo sola|solo yo|yo solo|yo sola|para mi solo|alone)\b/.test(text)) adults = 1;
    const groupMatch = text.match(new RegExp('(?:somos|vamos|viajamos|seremos|para|grupo de|we are)\\s+' + NUM + '(?:\\s+(?:personas?|viajeros?|people|amigos?|amigas?))?(?![\\s]*(?:dias?|noches?|dolares|cordobas|usd|c\\$|\\$))'));
    if (adults != null || kids != null) {
      if (adults != null) state.adultos = adults;
      if (kids != null) { state.ninos = kids; if (state.adultos == null) state.adultos = 1; }
      state.viajeros = (state.adultos || 0) + (state.ninos || 0);
      changed.viajeros = state.viajeros;
    } else if (groupMatch && toNumber(groupMatch[1])) {
      state.viajeros = toNumber(groupMatch[1]); state.adultos = state.viajeros; state.ninos = 0; changed.viajeros = state.viajeros;
    }

    // ---- duración
    const daysMatch = text.match(new RegExp(NUM + '\\s+(?:dias?|days?)'));
    const nightsMatch = text.match(new RegExp(NUM + '\\s+(?:noches?|nights?)'));
    if (/\b(fin de semana|finde|sabado y domingo|weekend)\b/.test(text)) { state.dias = 2; state.noches = 1; changed.dias = 2; }
    else if (/\b(un solo dia|de un dia|mismo dia|day trip|ida y vuelta el mismo dia)\b/.test(text)) { state.dias = 1; state.noches = 0; changed.dias = 1; }
    if (daysMatch && toNumber(daysMatch[1])) { state.dias = Math.min(60, toNumber(daysMatch[1])); state.noches = Math.max(0, state.dias - 1); changed.dias = state.dias; }
    if (nightsMatch && toNumber(nightsMatch[1])) { state.noches = Math.min(59, toNumber(nightsMatch[1])); if (!daysMatch) state.dias = state.noches + 1; changed.noches = state.noches; }

    // ---- presupuesto y moneda
    const money = text.match(/(?:us\$|u\$s|\$|c\$)?\s*(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)\s*(dolares|dolar|usd|cordobas|cordoba|pesos|bucks|dollars|k\b)?/g);
    const budgetContext = /\b(tengo|presupuesto|cuento con|puedo gastar|gastar|me alcanza|llevo|budget|have)\b/.test(text) || /(us\$|\$|c\$|dolares|usd|cordobas)/.test(text);
    if (money && budgetContext) {
      for (const raw of money) {
        const m = raw.match(/(us\$|u\$s|\$|c\$)?\s*(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)\s*(dolares|dolar|usd|cordobas|cordoba|pesos|bucks|dollars)?/);
        if (!m) continue;
        const amount = Number(m[2].replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.'));
        const isTravelNumber = new RegExp('^\\s*' + m[2] + '\\s*(dias?|noches?|personas?|ninos?|adultos?)').test(text.slice(text.indexOf(raw.trim())));
        if (!amount || amount < 10 || isTravelNumber) continue;
        let currency = null;
        if (/us\$|u\$s|dolar|usd|bucks|dollars/.test(raw) || (/^\$/.test(raw.trim()))) currency = 'USD';
        if (/c\$|cordoba|pesos/.test(raw)) currency = 'NIO';
        state.presupuesto = amount;
        if (currency) { state.moneda = currency; state.moneda_supuesta = false; }
        else { state.moneda = amount >= 1500 ? 'NIO' : 'USD'; state.moneda_supuesta = true; }
        changed.presupuesto = amount;
        break;
      }
    }

    // ---- preferencias, transporte, alojamiento
    const PREFS = { playa: /\b(playa|mar|costa|surf|beach)\b/, naturaleza: /\b(naturaleza|reserva|sendero|bosque|nature)\b/, volcanes: /\bvolcan/, gastronomia: /\b(comida|comer|gastronomia|nica|food)\b/,
      cultura: /\b(cultura|historia|museo|colonial|culture)\b/, musica: /\b(musica|marimba|music)\b/, tranquilo: /\b(tranquil|sin mucha gente|poca gente|relax|quiet)\b/, ambiente: /\b(ambiente|fiesta|vida nocturna|gente joven|party)\b/,
      cafe: /\b(cafe|coffee)\b/, artesania: /\bartesan/, aventura: /\b(aventura|adventure)\b/, familia: /\b(familia|ninos|chavalos|hijos|family)\b/ };
    Object.keys(PREFS).forEach((k) => { if (PREFS[k].test(text) && !state.preferencias.includes(k)) state.preferencias.push(k); });
    if (/\b(no|sin|nada de)\s+(?:\w+\s+)?volcan/.test(text) && !state.restricciones.includes('volcanes')) state.restricciones.push('volcanes');
    if (/\b(bus|buses|colectivo|expreso|transporte publico)\b/.test(text)) state.transporte = 'bus';
    else if (/\b(carro|auto|vehiculo|manejando|car)\b/.test(text)) state.transporte = 'carro';
    if (/\b(economic|barato|hostal|poco rial|no quiero gastar mucho|cheap)\w*/.test(text)) state.alojamiento = 'economico';
    else if (/\b(lujo|confort|comodo|resort|luxury)\b/.test(text)) state.alojamiento = 'confort';

    // ---- intención
    const isCorrection = /\b(no me (mostraste|diste|calculaste|dijiste|pusiste|desglosaste)|no veo el (calculo|desglose)|falta el (calculo|desglose)|you didn'?t show)\b/.test(text);
    const asksBudget = /\b(cuanto (gasto|voy a gastar|cuesta|sale|me sale|necesito|ocupo|dinero|vale|cobran)|presupuesto|costo|costos|me alcanza|alcanza|how much|budget|cost)\b/.test(text);
    const focus = text.match(/^\s*(?:y\s+)?(?:la\s+|el\s+|lo de\s+)?(comida|alimentacion|hotel|hospedaje|alojamiento|pasaje|pasajes|transporte|gasolina|bus|actividades|entradas)\s*\??$/) ||
      text.match(/\b(?:y\s+(?:la|el)?\s*|cuanto (?:en|de)\s+)(comida|alimentacion|hotel|hospedaje|pasaje|transporte|gasolina|actividades)\b/);
    const adjustOnly = Object.keys(changed).length > 0 && !asksBudget && text.split(' ').length <= 9 && /^(y |mejor |entonces |pero |solo |ahora |somos |vamos |tengo |para |con )/.test(text);
    const asksHelp = /^(ayuda|que (puedes|podes) hacer|que haces|como funcionas|en que me ayudas|help)\??$/.test(text);
    const greeting = /^(hola|buenas|buenos dias|buenas tardes|buenas noches|que onda|hey|saludos)[!.? ]*$/.test(text);

    let intent = 'open';
    if (greeting) intent = 'greeting';
    else if (asksHelp) intent = 'help';
    else if (isCorrection) intent = 'correction';
    else if (focus) { intent = 'budget'; state.enfoque = normFocus(focus[1]); }
    else if (asksBudget) { intent = 'budget'; state.enfoque = null; }
    else if (adjustOnly && (state.ultima_intencion === 'budget' || state.ultima_intencion === 'correction')) intent = 'budget';
    else if (/\b(compar|cual es mejor|cual me conviene| vs |versus)\b/.test(text) || found.length >= 2) intent = 'compare';
    else if (/\b(recomenda|recomienda|que playa|donde (puedo|ir)|a donde|lugar bonito|que hago|que me recomendas|que visito|suggest)\w*/.test(text)) intent = 'recommend';
    else if (adjustOnly) intent = 'adjust';

    if (intent !== 'adjust' && intent !== 'open' && intent !== 'greeting') state.ultima_intencion = intent === 'correction' ? 'budget' : intent;
    return { state, intent, changed, focus: state.enfoque };
  }
  function normFocus(word) {
    const w = norm(word);
    if (/comida|alimentacion/.test(w)) return 'food';
    if (/hotel|hospedaje|alojamiento/.test(w)) return 'lodging';
    if (/pasaje|transporte|gasolina|bus/.test(w)) return 'transport';
    if (/actividades|entradas/.test(w)) return 'activities';
    return null;
  }

  // Marca el último destino que BAQÜI recomendó (para resolver "ahí").
  function remember(state, assistantText) {
    // El punto de salida ("saliendo de Managua") aparece en cada desglose: no es una recomendación.
    const origin = state.origen || 'Managua';
    const found = findDestinations(assistantText).filter((name) => name !== origin);
    if (found.length) state.ultimo_recomendado = found[0];
    return state;
  }

  // ---- Presupuesto -----------------------------------------------------------
  function round(n) { return Math.round(n * 100) / 100; }
  // prices: filas vigentes de public.prices para el destino (ya filtradas por el cliente).
  function budget(state, prices, rate) {
    const r = rate && rate.USD_NIO ? rate : { USD_NIO: 36.6243, verifiedAt: '2026-10-01', source: 'Configuración BAQUEANO' };
    const assumptions = [];
    const travelers = state.viajeros || 1;
    if (!state.viajeros) assumptions.push('travelers1');
    const days = state.dias || 2;
    const nights = state.noches != null ? state.noches : Math.max(0, days - 1);
    if (!state.dias) assumptions.push('days2');
    const origin = state.origen || 'Managua';
    if (!state.origen) assumptions.push('originManagua');
    const destination = state.destino_actual || state.ultimo_recomendado || null;
    if (state.moneda_supuesta) assumptions.push(state.moneda === 'USD' ? 'currencyUsd' : 'currencyNio');
    const currency = state.moneda || 'USD';
    const toNio = (amount, cur) => (cur === 'USD' ? amount * r.USD_NIO : amount);

    // Precios verificados aplicables (por persona / noche / entrada).
    const verified = (prices || []).filter((p) => p && p.amount != null && p.is_active !== false);
    const lines = [];
    verified.forEach((p) => {
      const unitNio = toNio(Number(p.amount), p.currency || 'NIO');
      let qty = 1, basis = 'fixed';
      if (p.price_type === 'per_person' || p.price_type === 'entry') { qty = travelers; basis = 'perPerson'; }
      else if (p.price_type === 'per_night') { qty = Math.max(1, nights); basis = 'perNight'; }
      else if (p.price_type === 'per_day') { qty = days; basis = 'perDay'; }
      lines.push({ name: p.product_name, unitNio, qty, basis, totalNio: round(unitNio * qty), source: p.source_name || null, checkedAt: p.checked_at || null });
    });
    const verifiedTotalNio = round(lines.reduce((s, l) => s + l.totalNio, 0));

    // Presupuesto del viajero (si lo dio): reparto sugerido.
    let split = null;
    if (state.presupuesto) {
      const totalNio = toNio(state.presupuesto, currency);
      split = SPLIT_POLICY.map(([key, share]) => {
        const amountNio = round(totalNio * share);
        return { key, label: CATEGORY_LABEL[key], share, nio: amountNio, usd: round(amountNio / r.USD_NIO), perPersonNio: round(amountNio / travelers) };
      });
      const usedNio = verifiedTotalNio;
      split.summary = {
        totalNio: round(totalNio), totalUsd: round(totalNio / r.USD_NIO),
        perPersonNio: round(totalNio / travelers), perPersonUsd: round(totalNio / r.USD_NIO / travelers),
        perPersonDayNio: round(totalNio / travelers / days), perPersonDayUsd: round(totalNio / r.USD_NIO / travelers / days),
        usedNio, usedUsd: round(usedNio / r.USD_NIO), remainingNio: round(totalNio - usedNio), remainingUsd: round((totalNio - usedNio) / r.USD_NIO),
        usedPct: totalNio ? Math.round((usedNio / totalNio) * 100) : 0, overBudget: usedNio > totalNio
      };
    }
    return { destination, origin, travelers, adults: state.adultos, kids: state.ninos, days, nights, currency, rate: r, assumptions,
      verifiedLines: lines, verifiedTotalNio, verifiedTotalUsd: round(verifiedTotalNio / r.USD_NIO), split, focus: state.enfoque || null };
  }

  function money(nio, usd, currency) {
    const fNio = 'C$ ' + Math.round(nio).toLocaleString('es-NI');
    const fUsd = 'US$ ' + (Math.round(usd * 100) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 });
    return currency === 'USD' ? fUsd + ' (≈ ' + fNio + ')' : fNio + ' (≈ ' + fUsd + ')';
  }

  // Texto en español nicaragüense (voseo natural). t(key, fallback, vars) traduce si hay clave.
  function composeBudget(b, opts) {
    const o = opts || {};
    const t = o.t || ((k, f, v) => String(f).replace(/\{(\w+)\}/g, (m, x) => (v && v[x] != null ? v[x] : m)));
    const out = [];
    const who = b.kids ? t('baquiBrain.groupKids', '{adults} adultos y {kids} niños', { adults: b.adults || 1, kids: b.kids }) : t('baquiBrain.groupPeople', '{n} persona(s)', { n: b.travelers });
    const where = b.destination || t('baquiBrain.noDestination', 'el destino que elijamos');
    if (o.correction) out.push(t('baquiBrain.correction', 'Tenés razón, aquí va el desglose.'));
    out.push(t('baquiBrain.header', 'Presupuesto para {where}: {who}, {days} día(s) y {nights} noche(s), saliendo de {origin}.', { where, who, days: b.days, nights: b.nights, origin: b.origin }));
    const assumptionText = {
      travelers1: t('baquiBrain.assumeTravelers', 'como no me dijiste cuántos van, lo calculo para 1 persona'),
      days2: t('baquiBrain.assumeDays', 'tomo 2 días y 1 noche'),
      originManagua: t('baquiBrain.assumeOrigin', 'tomo Managua como punto de salida'),
      currencyUsd: t('baquiBrain.assumeUsd', 'entiendo que son dólares'),
      currencyNio: t('baquiBrain.assumeNio', 'entiendo que son córdobas')
    };
    if (b.assumptions.length) out.push(t('baquiBrain.assumptions', 'Supuestos: {list}. Si algo cambia, decime y lo recalculo.', { list: b.assumptions.map((a) => assumptionText[a]).join('; ') }));

    if (b.verifiedLines.length) {
      out.push('', t('baquiBrain.verifiedTitle', 'Con precios verificados en BAQUEANO:'));
      b.verifiedLines.forEach((l) => out.push('• ' + l.name + ': ' + money(l.unitNio, l.unitNio / b.rate.USD_NIO, b.currency) + ' × ' + l.qty + ' = ' + money(l.totalNio, l.totalNio / b.rate.USD_NIO, b.currency) + (l.source ? ' · ' + t('baquiBrain.source', 'fuente') + ': ' + l.source : '')));
      out.push(t('baquiBrain.verifiedTotal', 'Total con precios verificados: {total}.', { total: money(b.verifiedTotalNio, b.verifiedTotalUsd, b.currency) }));
    } else {
      out.push('', t('baquiBrain.noPrices', 'Todavía no tengo precios verificados de transporte, hospedaje ni comida para {where}. No te voy a dar tarifas inventadas: te reparto tu presupuesto para que sepás con cuánto contar en cada cosa, y los montos exactos se confirman con cada negocio.', { where }));
    }

    if (b.split) {
      const s = b.split.summary;
      const rows = b.focus ? b.split.filter((row) => row.key === b.focus || (b.focus === 'transport' && row.key === 'localTransport')) : b.split;
      out.push('', t('baquiBrain.splitTitle', 'Tu presupuesto: {total} · por persona {pp} · por persona por día {ppd}.', { total: money(s.totalNio, s.totalUsd, b.currency), pp: money(s.perPersonNio, s.perPersonUsd, b.currency), ppd: money(s.perPersonDayNio, s.perPersonDayUsd, b.currency) }));
      rows.forEach((row) => out.push('• ' + t('baquiBrain.cat.' + row.key, row.label) + ' (' + Math.round(row.share * 100) + ' %): ' + money(row.nio, row.usd, b.currency) + ' · ' + t('baquiBrain.perPerson', 'por persona') + ' ' + money(row.perPersonNio, row.perPersonNio / b.rate.USD_NIO, b.currency)));
      if (b.verifiedLines.length) {
        out.push(s.overBudget
          ? t('baquiBrain.over', 'Ojo: lo verificado ({used}) se pasa de tu presupuesto. Podemos bajar una noche, buscar hospedaje más económico o quitar una actividad pagada.', { used: money(s.usedNio, s.usedUsd, b.currency) })
          : t('baquiBrain.remaining', 'Usado con precios verificados: {used} ({pct} %). Te quedan {left}.', { used: money(s.usedNio, s.usedUsd, b.currency), pct: s.usedPct, left: money(s.remainingNio, s.remainingUsd, b.currency) }));
      }
      out.push(t('baquiBrain.splitNote', 'Es una distribución sugerida de tu dinero, no una lista de precios. Cambio de referencia: {rate} córdobas por dólar ({date}).', { rate: b.rate.USD_NIO, date: b.rate.verifiedAt }));
    } else {
      out.push('', t('baquiBrain.askBudget', 'Si me decís cuánto querés gastar en total (por ejemplo, "tengo 300 dólares"), te lo reparto entre pasaje, hospedaje, comida y actividades, por persona y para todo el grupo.'));
    }
    if (!b.destination) out.push(t('baquiBrain.askDestination', '¿Para qué destino lo armamos? Con eso busco los negocios verificados de la zona.'));
    else out.push(t('baquiBrain.contact', 'Puedo ponerte en contacto con negocios de {where} registrados en BAQUEANO para confirmar precios y disponibilidad.', { where: b.destination }));
    return out.join('\n');
  }

  // Respuesta de reserva con contexto (nunca el menú): retoma lo último que se hablaba.
  function composeFallback(state, opts) {
    const t = (opts && opts.t) || ((k, f, v) => String(f).replace(/\{(\w+)\}/g, (m, x) => (v && v[x] != null ? v[x] : m)));
    const dest = state.destino_actual || state.ultimo_recomendado;
    if (state.ultima_intencion === 'budget') return dest
      ? t('baquiBrain.fbBudgetDest', 'Creo que seguís con el presupuesto para {dest}. Decime qué querés ajustar: cuántos van, cuántos días o cuánto querés gastar, y lo recalculo.', { dest })
      : t('baquiBrain.fbBudget', 'Creo que seguís con el presupuesto. Decime qué querés ajustar: cuántos van, cuántos días o cuánto querés gastar, y lo recalculo.');
    if (dest) return t('baquiBrain.fbDest', 'Sigamos con {dest}: te puedo armar el presupuesto, ver cómo llegar o qué comer y hacer por ahí. ¿Qué te sirve más?', { dest });
    if (state.preferencias.length) return t('baquiBrain.fbPrefs', 'Me dijiste que te interesa {prefs}. Si me contás desde dónde salís y cuántos días tenés, te propongo dos o tres opciones concretas.', { prefs: state.preferencias.join(', ') });
    return t('baquiBrain.fbOpen', 'Contame un poco más: ¿qué querés vivir en Nicaragua (playa, volcanes, pueblos con historia, montaña, comida) y cuántos días tenés?');
  }

  // Anti-bucle: firma de la respuesta para no repetirla dos veces seguidas.
  function signature(text) { return norm(text).replace(/[^a-z0-9 ]/g, '').split(' ').filter((w) => w.length > 3).slice(0, 40).join(' '); }
  function isDuplicate(state, text) {
    const sig = signature(text);
    return !!sig && (state.recientes || []).includes(sig);
  }
  function remember_response(state, text) {
    state.recientes = [signature(text)].concat(state.recientes || []).slice(0, 4);
    return remember(state, text);
  }

  return { createState, understand, budget, composeBudget, composeFallback, isDuplicate, remember: remember_response, DESTINATIONS, SPLIT_POLICY, _norm: norm };
}));
