// ============================================================================
// BAQUEANO — MOTOR DE SESIÓN DE VIAJE PARA BAQÜI
// ============================================================================
// 🎯 POR QUÉ: mapa, itinerario, presupuesto y recomendaciones deben representar
//    la solicitud vigente del viajero, nunca una demostración independiente.
// ⚙️ CÓMO: una TravelSession normalizada gobierna todos los renderizadores;
//    Supabase valida entidades y servicios, con respaldo territorial explícito.
// 📦 QUÉ: parser conversacional, resolución de entidades, mapa Leaflet dinámico,
//    presupuesto trazable, persistencia temporal y controles bidireccionales.
// ============================================================================
(function initializeTravelSession(window, document) {
  'use strict';

  const SESSION_KEY = 'baqueano_travel_session_v1';
  const SAVED_KEY = 'baqueano_saved_trips_v1';
  const RATE = Object.freeze({ USD_NIO: 36.6243, verifiedAt: '2026-10-01', source: 'Configuración BAQUEANO' });
  const FLAGS = Object.freeze({ USE_REAL_BAQUI_ENGINE: true, ALLOW_DEMO_FALLBACK: false });
  const STATUS = Object.freeze({ VERIFIED: 'VERIFIED', ESTIMATED: 'ESTIMATED', UNAVAILABLE: 'UNAVAILABLE' });
  const FALLBACK_ENTITIES = Object.freeze([
    { name: 'León', type: 'municipality', latitude: 12.4379, longitude: -86.8780 },
    { name: 'Chinandega', type: 'municipality', latitude: 12.6294, longitude: -87.1311 },
    { name: 'Somoto', type: 'municipality', latitude: 13.4808, longitude: -86.5821 },
    { name: 'Estelí', type: 'municipality', latitude: 13.0918, longitude: -86.3538 },
    { name: 'Managua', type: 'municipality', latitude: 12.1364, longitude: -86.2514 },
    { name: 'Granada', type: 'municipality', latitude: 11.9344, longitude: -85.9560 },
    { name: 'Masaya', type: 'municipality', latitude: 11.9744, longitude: -86.0942 }
  ]);

  const QUICK_DESTINATIONS = Object.freeze(['Granada', 'Masaya', 'León', 'Estelí', 'Somoto']);

  // Orientación general (no ligada a una ruta): hechos estables de movilidad y
  // seguridad en Nicaragua. Se muestran mientras no haya destinos, en lugar de
  // tarjetas vacías; nunca se presentan como datos verificados de la ruta.
  const TRANSPORT_GUIDE = Object.freeze([
    ['fa-bus', 'Buses interurbanos', 'Salen de los mercados de Managua: Roberto Huembes hacia Masaya, Granada y Rivas; Israel Lewites hacia León.'],
    ['fa-ferry', 'Lancha a Ometepe', 'Sale de San Jorge (Rivas). Llegá con tiempo en temporada alta.'],
    ['fa-taxi', 'Taxis', 'No usan taxímetro: acordá la tarifa antes de subir.'],
    ['fa-plane', 'Caribe', 'A Corn Island se llega en avioneta desde Managua o en barco desde Bluefields.']
  ]);
  const SAFETY_GUIDE = Object.freeze([
    ['fa-cloud-rain', 'Mayo a octubre es temporada de lluvias: revisá caminos y salidas en lancha.'],
    ['fa-sun', 'Protector solar, sombrero y agua, sobre todo en volcanes y playas del Pacífico.'],
    ['fa-money-bill-wave', 'Llevá córdobas en efectivo para comunidades y mercados.'],
    ['fa-phone', 'Emergencias: Policía 118 · Bomberos 115 · Cruz Roja 128.']
  ]);

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const repairEncoding = (value) => {
    const text = String(value || '');
    if (!/[ÃÂ]/.test(text)) return text;
    try { return decodeURIComponent(Array.from(text).map((char) => '%' + char.charCodeAt(0).toString(16).padStart(2, '0')).join('')); }
    catch (_) { return text; }
  };
  const normalize = (value) => repairEncoding(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const finite = (value) => Number.isFinite(Number(value)) ? Number(value) : null;
  const clone = (value) => JSON.parse(JSON.stringify(value));

  // ==========================================================================
  // 🎯 POR QUÉ: las tarjetas "Cómo moverte" y "Alertas" eran genéricas o
  //    mostraban texto técnico ("Entidad sin validación activa de Supabase"),
  //    y el reconocedor de destinos solo conocía 7 ciudades.
  // ⚙️ CÓMO: data/travel-knowledge.json (generado desde territories-data.js y
  //    destination-dossier.js por scripts/build-search-index.mjs) trae, por
  //    lugar real: cómo llegar, mejor época, recomendaciones, seguridad,
  //    clima, duración, dificultad y coordenadas. Se descarga una vez.
  // 📦 QUÉ: loadKnowledge(), findKnowledge(nombre), destinationNames().
  // ==========================================================================
  const KNOWLEDGE_URL = 'data/travel-knowledge.json?v=2026-10-05-spots';
  let knowledge = [];
  let knowledgePromise = null;
  function loadKnowledge() {
    if (!knowledgePromise) {
      knowledgePromise = fetch(KNOWLEDGE_URL, { credentials: 'same-origin', cache: 'force-cache' })
        .then((res) => (res.ok ? res.json() : { places: [] }))
        .then((json) => { knowledge = Array.isArray(json.places) ? json.places : []; return knowledge; })
        .catch(() => { knowledgePromise = null; return knowledge; });
    }
    return knowledgePromise;
  }
  const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const wordMatch = (text, alias) => Boolean(alias) && new RegExp('(^|[^a-z0-9ñ])' + escapeRegExp(alias) + '($|[^a-z0-9ñ])').test(text);
  function findKnowledge(name) {
    const n = normalize(name);
    if (!n) return null;
    return knowledge.find((p) => p.kind === 'destino' && p.aliases.includes(n))
      || knowledge.find((p) => p.kind === 'territorio' && normalize(p.name) === n)
      || knowledge.find((p) => p.kind === 'territorio' && p.aliases.includes(n))
      || knowledge.find((p) => p.aliases.some((a) => a.length > 4 && (n.includes(a) || a.includes(n))))
      || null;
  }
  // Nombres reconocibles con su ortografía original (17 departamentos, sus
  // municipios, fichas de destino y catálogo maestro).
  function destinationNames() {
    const names = new Map();
    const addName = (label) => { const key = normalize(label); if (key.length > 2 && !names.has(key)) names.set(key, label); };
    FALLBACK_ENTITIES.forEach((item) => addName(item.name));
    knowledge.forEach((place) => {
      addName(place.name);
      (place.municipalities || []).forEach(addName);
      if (place.kind === 'destino') place.aliases.forEach((alias) => { if (!names.has(alias)) names.set(alias, place.name); });
    });
    const catalog = window.BAQUEANO_MASTER_CATALOG || window.BaqueanoMasterCatalog;
    if (Array.isArray(catalog?.destinations)) catalog.destinations.forEach((item) => item?.name && addName(item.name));
    return names;
  }

  function emptySession() {
    const language = window.BaqueanoLanguage?.get?.() || localStorage.getItem('baqueano_language_v2') || localStorage.getItem('baqueano_language_v1') || localStorage.getItem('baqueano_language') || 'es';
    return {
      version: 1, countryCode: 'NI', currentLanguage: language, preferredLanguage: language,
      // Sin valores supuestos: días y viajeros quedan vacíos hasta que la
      // persona los diga (antes "3 días y 1 viajero" aparecían sin pedirlos).
      destinations: [], resolvedEntities: [], days: null, travelers: null, adults: null, children: 0,
      budget: { amount: null, currency: 'USD' }, interests: [], origin: null,
      transportPreference: null, accommodationPreference: null, itinerary: [],
      route: [], recommendations: [], prices: [], warnings: [], updatedAt: new Date().toISOString()
    };
  }

  function restoreSession() {
    try {
      const value = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
      return value && Array.isArray(value.destinations) ? Object.assign(emptySession(), value) : emptySession();
    } catch (_) { return emptySession(); }
  }

  let travelSession = restoreSession();
  let map = null;
  let routeLayer = null;
  let chatRecognition = null;
  let markerLayer = null;
  let activeRequest = null;

  function persist() {
    travelSession.updatedAt = new Date().toISOString();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(travelSession));
    window.dispatchEvent(new CustomEvent('baqueano:travelSessionChanged', { detail: clone(travelSession) }));
  }

  function parseDestinations(text) {
    const normalizedText = normalize(text);
    const names = destinationNames();
    // Los nombres más largos primero: "León Viejo" antes que "León".
    const keys = [...names.keys()].sort((a, b) => b.length - a.length);
    const found = [];
    let remaining = normalizedText;
    keys.forEach((key) => {
      if (wordMatch(remaining, key)) {
        found.push({ label: names.get(key), at: normalizedText.indexOf(key) });
        remaining = remaining.split(key).join(' ');
      }
    });
    // Tolerancia a errores de tipeo ("carazon" → Carazo, "esteli" ya se normaliza):
    // solo contra los 17 departamentos y los destinos del catálogo, palabras de
    // 5+ letras y distancia de edición 1 (2 en nombres de 8+ letras).
    lastCorrections = [];
    const words = remaining.split(/[^a-z0-9ñ]+/).filter((word) => word.length >= 5 && !TYPO_STOPWORDS.has(word));
    fuzzyTargets().forEach(({ key, label }) => {
      if (found.some((item) => normalize(item.label) === normalize(label))) return;
      const size = key.split(' ').length;
      for (let i = 0; i + size <= words.length; i += 1) {
        const candidate = words.slice(i, i + size).join(' ');
        if (candidate === key || Math.abs(candidate.length - key.length) > 2) continue;
        if (editDistance(candidate, key) <= (key.length >= 8 ? 2 : 1)) {
          found.push({ label, at: normalizedText.indexOf(candidate) });
          lastCorrections.push({ typed: candidate, label });
          break;
        }
      }
    });
    // En el orden en que la persona los nombró.
    return [...new Map(found.sort((a, b) => a.at - b.at).map((item) => [normalize(item.label), item.label])).values()];
  }

  let lastCorrections = [];
  const TYPO_STOPWORDS = new Set(['quiero', 'queremos', 'vamos', 'somos', 'personas', 'dolares', 'cordobas', 'presupuesto', 'tengo', 'tenemos',
    'conocer', 'nicaragua', 'playa', 'playas', 'departamentos', 'departamento', 'adultos', 'ninos', 'viajar', 'visitar', 'semana', 'noches']);
  function editDistance(a, b) {
    const row = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i += 1) {
      let previous = row[0]; row[0] = i;
      for (let j = 1; j <= b.length; j += 1) {
        const current = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
        previous = current;
      }
    }
    return row[b.length];
  }
  function fuzzyTargets() {
    const targets = [];
    knowledge.forEach((place) => {
      if (place.kind === 'territorio') targets.push({ key: normalize(place.name), label: place.name });
      if (place.kind === 'destino') place.aliases.filter((alias) => alias.length >= 5).forEach((alias) => targets.push({ key: alias, label: place.name }));
    });
    return targets.filter((item) => item.key.length >= 5);
  }

  // ==========================================================================
  // 🎯 POR QUÉ: con "quiero conocer Nicaragua" BAQUI debe proponer la ruta, y
  //    con "quiero playa" debe decir QUÉ playas reales hay en cada parada.
  // ⚙️ CÓMO: solo lugares del catálogo BAQUEANO (data/travel-knowledge.json,
  //    generado de territories-data.js): destinos por categoría e interés y los
  //    lugares (spots) de cada departamento con su tipo. Nada inventado.
  // 📦 QUÉ: wantsDiscovery(), proposeDestinations(), interestSpots().
  // ==========================================================================
  const DISCOVERY = /(conocer|recorrer|explorar|descubrir|ver)\s+(todo\s+|toda\s+|un poco de\s+)?nicaragua|no se (a )?donde|que me recomiend|recomienda(me|nos)?|sugier|sorprend|armame (una )?ruta|lo mejor de nicaragua/;
  const INTEREST_DESTINOS = {
    playas: ['sjds', 'cornisland'], volcanes: ['masaya', 'cerro_negro', 'ometepe'], cultura: ['granada', 'masaya'],
    historia: ['granada'], naturaleza: ['ometepe', 'apoyo', 'miraflor', 'somoto'], aventura: ['cerro_negro', 'somoto'],
    gastronomia: ['masaya', 'granada'], fotografia: ['isletas', 'ometepe']
  };
  // Ruta clásica del Pacífico, por cercanía, cuando no hay intereses.
  const DEFAULT_DISCOVERY = ['granada', 'masaya', 'ometepe', 'cerro_negro'];
  const SPOT_PATTERNS = {
    playas: /playa|surf|bahia|costa|balneario/, volcanes: /volcan|crater/, naturaleza: /reserva|sendero|bosque|laguna|cascada|manglar|naturaleza/,
    cultura: /museo|catedral|basilica|iglesia|colonial|patrimonio|cultura/, historia: /historia|museo|ruinas|patrimonio/, aventura: /surf|canopy|kayak|sandboard|caminata|aventura/
  };
  function wantsDiscovery(text) { return DISCOVERY.test(normalize(text)); }
  function proposeDestinations(interests, days) {
    const ids = [];
    (interests || []).forEach((interest) => (INTEREST_DESTINOS[interest] || []).forEach((id) => { if (!ids.includes(id)) ids.push(id); }));
    DEFAULT_DISCOVERY.forEach((id) => { if (ids.length < 3 && !ids.includes(id)) ids.push(id); });
    const size = days ? Math.max(2, Math.min(5, Math.ceil(days / 2))) : 4;
    return ids.slice(0, size).map((id) => knowledge.find((place) => place.id === id)?.name).filter(Boolean);
  }
  function interestSpots(route, interests) {
    const patterns = (interests || []).map((name) => SPOT_PATTERNS[name]).filter(Boolean);
    if (!patterns.length) return [];
    const seen = new Set();
    return route.map((stop) => {
      const place = knowledge.find((p) => p.id === stop.knowledgeId);
      const territory = place?.kind === 'territorio' ? place : knowledge.find((p) => p.kind === 'territorio' && p.id === place?.territory);
      if (!territory || seen.has(territory.id)) return null;
      seen.add(territory.id);
      const spots = (territory.spots || []).filter((spot) => patterns.some((re) => re.test(normalize(spot.name + ' ' + spot.type)))).slice(0, 4).map((spot) => spot.name);
      return spots.length ? { department: territory.name, spots } : null;
    }).filter(Boolean);
  }

  const NUMBER_WORDS = Object.freeze({ un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, catorce: 14, quince: 15 });
  const toNumber = (word) => (/^\d+$/.test(word) ? Number(word) : NUMBER_WORDS[word] ?? null);
  const NUM = '(\\d{1,3}|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|catorce|quince)';
  function travelersLabel() {
    const adults = travelSession.adults;
    const children = travelSession.children || 0;
    if (adults == null && !travelSession.travelers) return '';
    if (adults == null) {
      const count = travelSession.travelers;
      return count === 1 ? i18n('baqui.trip.travelerOne', '1 viajero') : i18n('baqui.trip.travelerMany', '{count} viajeros', { count });
    }
    const a = adults === 1 ? i18n('baqui.trip.adultOne', '1 adulto') : i18n('baqui.trip.adultMany', '{count} adultos', { count: adults });
    if (!children) return a;
    const c = children === 1 ? i18n('baqui.trip.childOne', '1 niño') : i18n('baqui.trip.childMany', '{count} niños', { count: children });
    return i18n('baqui.trip.adultsAndChildren', '{adults} y {children}', { adults: a, children: c });
  }

  // Montos en formato nicaragüense o anglosajón: "1.500", "1,500", "8,000",
  // "1.500,50", "450.75". Un grupo final de 3 dígitos es separador de miles.
  function parseAmount(raw) {
    const value = String(raw || '').replace(/[.,]+$/, '');
    if (/^\d{1,3}([.,]\d{3})+$/.test(value)) return Number(value.replace(/[.,]/g, ''));
    if (/^\d{1,3}(\.\d{3})+,\d{1,2}$/.test(value)) return Number(value.replace(/\./g, '').replace(',', '.'));
    if (/^\d{1,3}(,\d{3})+\.\d{1,2}$/.test(value)) return Number(value.replace(/,/g, ''));
    if (/^\d+,\d{1,2}$/.test(value)) return Number(value.replace(',', '.'));
    return Number(value);
  }

  function parseTravelIntent(text, current = travelSession) {
    const normalized = normalize(text);
    const next = clone(current);
    const destinations = parseDestinations(text);
    const removeMatch = normalized.match(/(?:quita|quita|saca|elimina)\s+(?:a\s+)?([a-záéíóúüñ\s]+?)(?=\s+y\s+|\s+e\s+|,|\.|$)/i);
    const removedName = removeMatch ? normalize(removeMatch[1]) : '';
    if (removeMatch) next.destinations = next.destinations.filter((name) => !removedName.includes(normalize(name)));
    if (destinations.length) {
      const replacement = /(?:quita|saca|elimina).+(?:agrega|mete|añade)/i.test(text);
      next.destinations = replacement
        ? [...new Set([...next.destinations, ...destinations.filter((name) => !removedName.includes(normalize(name)))])]
        : destinations;
    }

    // Días: "3 días", "dos noches" (= 3 días), "fin de semana", "una semana".
    const days = normalized.match(new RegExp(NUM + '\\s*(dias?|noches?)'));
    if (days) {
      const n = toNumber(days[1]);
      if (n) next.days = Math.max(1, Math.min(14, /noche/.test(days[2]) ? n + 1 : n));
    } else if (/fin de semana/.test(normalized)) next.days = 2;
    else if (/una semana/.test(normalized)) next.days = 7;

    // Viajeros = adultos + niños. Un monto ($500) nunca se toma como personas.
    // "3 niños", "dos de ellos niños", "de los cuales 2 son menores".
    const childrenMatch = normalized.match(new RegExp(NUM + '\\s+(?:de\\s+(?:ellos|ellas|los cuales|las cuales)\\s+)?(?:son\\s+)?(?:ninos?|ninas?|hijos?|hijas?|menores|chavalos?|chiquitos?|bebes?)'))
      || normalized.match(new RegExp('(?:de\\s+(?:ellos|ellas|los cuales|las cuales)\\s+)' + NUM + '\\s+(?:son\\s+)?(?:ninos?|ninas?|menores)'));
    const adultsMatch = normalized.match(new RegExp(NUM + '\\s+(?:adultos?|personas mayores)'));
    const totalMatch = normalized.match(new RegExp('(?:somos|vamos|viajamos)\\s+' + NUM + '\\b(?!\\s*(?:dias?|noches?|dolares?|usd|cordobas?))'))
      || normalized.match(new RegExp(NUM + '\\s*(?:personas?|viajeros?)'));
    const companion = /(?:mi|con mi|y mi)\s+(?:pareja|esposa|esposo|novia|novio|marido|mujer|companera|companero)/.test(normalized);
    let children = childrenMatch ? toNumber(childrenMatch[1]) : (/(?:mi|con mi)\s+(?:hijo|hija|nino|nina)\b/.test(normalized) ? 1 : null);
    let adults = adultsMatch ? toNumber(adultsMatch[1]) : null;
    const total = totalMatch ? toNumber(totalMatch[1]) : null;
    if (/voy solo|voy sola|solo yo|viajo solo|viajo sola/.test(normalized)) { adults = 1; children = children ?? 0; }
    if (adults == null && companion) adults = 2;
    if (adults == null && total != null) adults = Math.max(1, total - (children || 0));
    if (adults == null && children != null) adults = current.adults ?? null;
    // "Somos 4 adultos" describe al grupo completo: sin niños mencionados son 0
    // (no se arrastran los de una consulta anterior).
    const wholeGroup = /\b(?:somos|vamos|viajamos|familia de)\b/.test(normalized) || /voy solo|voy sola|viajo solo|viajo sola/.test(normalized);
    if (wholeGroup && adults != null && children == null) children = 0;
    if (adults != null || children != null) {
      next.adults = adults ?? current.adults ?? null;
      next.children = children ?? current.children ?? 0;
      next.travelers = next.adults != null ? next.adults + (next.children || 0) : null;
    }

    // Presupuesto: "$500", "US$ 500", "500 dólares", "C$ 3000", "3000 córdobas".
    const money = normalized.match(/(c\$|us\$|\$)\s*(\d[\d.,]*)/) || normalized.match(/(\d[\d.,]*)\s*(dolares?|usd|cordobas?|nio)/);
    if (money) {
      const symbolFirst = /\$/.test(money[1]);
      const amount = parseAmount(symbolFirst ? money[2] : money[1]);
      const unit = symbolFirst ? money[1] : money[2];
      if (Number.isFinite(amount) && amount > 0) {
        // "50 dólares por persona" con 4 viajeros = 200 de presupuesto total.
        const perPerson = /por persona|por cabeza|cada uno|cada una|c\/u|p\/p/.test(normalized);
        const people = next.travelers || null;
        next.budget.perPerson = perPerson ? amount : null;
        next.budget.amount = perPerson && people ? amount * people : amount;
        next.budget.currency = /c\$|cordoba|nio/.test(unit) ? 'NIO' : 'USD';
      }
    }
    const INTERESTS = [['playas', /playa|surf|costa/], ['naturaleza', /naturaleza|reserva|bosque/], ['volcanes', /volcan/], ['cultura', /cultura|colonial|museo/],
      ['gastronomia', /gastronomia|comida/], ['historia', /historia/], ['aventura', /aventura|canopy|kayak/], ['fotografia', /fotografia|fotos/]];
    const interests = INTERESTS.filter(([, pattern]) => pattern.test(normalized)).map(([name]) => name);
    if (interests.length) next.interests = [...new Set([...(current.interests || []), ...interests])];
    if (destinations.length) next.proposed = false;
    next.discover = !next.destinations.length && wantsDiscovery(text);
    next.typoCorrections = lastCorrections.slice();
    return next;
  }

  async function queryEntity(name) {
    const client = window.baqueanoSupabase;
    if (!client?.from) return null;
    const started = performance.now();
    const tables = [
      { table: 'destinations', field: 'name', type: 'destination' },
      { table: 'municipalities', field: 'name', type: 'municipality' },
      { table: 'departments', field: 'name', type: 'department' },
      { table: 'places', field: 'name', type: 'place' },
      { table: 'businesses', field: 'name', type: 'business' }
    ];
    const timeout = new Promise((resolve) => setTimeout(() => resolve(null), 1800));
    const lookups = Promise.all(tables.map(async (source) => {
      try {
        const { data, error } = await client.from(source.table).select('id,' + source.field + ',latitude,longitude').ilike(source.field, name).limit(1);
        return !error && data?.[0] ? { source, row: data[0] } : null;
      } catch (_) { return null; }
    }));
    const matches = await Promise.race([lookups, timeout]);
    const match = Array.isArray(matches) ? matches.find(Boolean) : null;
    if (match) {
      window.dispatchEvent(new CustomEvent('baqueano:telemetry', { detail: { event: 'entity_resolved', table: match.source.table, durationMs: Math.round(performance.now() - started) } }));
      return { id: match.row.id, name: match.row[match.source.field], type: match.source.type, latitude: finite(match.row.latitude), longitude: finite(match.row.longitude), source: 'supabase' };
    }
    return null;
  }

  async function resolveTravelEntity(name) {
    const resolved = await queryEntity(name);
    const place = findKnowledge(name);
    if (resolved) return Object.assign(resolved, { knowledgeId: place?.id || null });
    // Coordenadas reales del catálogo BAQUEANO (ciudad precisa si existe;
    // si no, las del destino o del territorio). Es un dato interno: al
    // usuario no se le muestran mensajes técnicos de validación.
    const city = FALLBACK_ENTITIES.find((item) => normalize(item.name) === normalize(name));
    if (city) return Object.assign({}, city, { id: null, source: 'baqueano-catalog', knowledgeId: place?.id || null });
    if (place && Number.isFinite(place.lat) && Number.isFinite(place.lng)) {
      return { id: null, name, type: place.kind === 'destino' ? 'destination' : 'department', latitude: place.lat, longitude: place.lng, source: 'baqueano-catalog', knowledgeId: place.id };
    }
    return { name, type: 'unresolved', latitude: null, longitude: null, source: 'unresolved', knowledgeId: null };
  }

  function haversine(a, b) {
    if (![a.latitude, a.longitude, b.latitude, b.longitude].every(Number.isFinite)) return null;
    const rad = (value) => value * Math.PI / 180;
    const dLat = rad(b.latitude - a.latitude); const dLng = rad(b.longitude - a.longitude);
    const value = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
  }

  function optimizeRoute(entities) {
    if (entities.length < 3) return entities.slice();
    const remaining = entities.slice(1); const ordered = [entities[0]];
    while (remaining.length) {
      const previous = ordered[ordered.length - 1];
      remaining.sort((a, b) => (haversine(previous, a) ?? Infinity) - (haversine(previous, b) ?? Infinity));
      ordered.push(remaining.shift());
    }
    return ordered;
  }

  async function getRouteRecommendations(entities) {
    const client = window.baqueanoSupabase;
    if (!client?.from || !entities.length) return [];
    const names = entities.map((item) => item.name);
    try {
      const request = client.from('businesses')
        .select('id,name,category,department,municipality,verified,cover_image,metadata')
        .or(names.flatMap((name) => [`department.ilike.%${name}%`, `municipality.ilike.%${name}%`]).join(','))
        .is('deleted_at', null).limit(8);
      const response = await Promise.race([request, new Promise((resolve) => setTimeout(() => resolve({ data: [] }), 1800))]);
      const data = response?.data;
      return Array.isArray(data) ? data.map((item) => ({
        id: item.id, name: item.name, category: item.category || 'Servicio local',
        location: item.municipality || item.department, verified: item.verified === true,
        image: item.cover_image || 'assets/images/assistant/baqui.png', price: null
      })) : [];
    } catch (_) { return []; }
  }

  function buildItinerary() {
    const route = travelSession.route;
    if (!route.length || !travelSession.days) return [];
    return Array.from({ length: travelSession.days }, (_, index) => {
      const entity = route[index % route.length];
      const next = route[(index + 1) % route.length];
      const distance = route.length > 1 ? haversine(entity, next) : null;
      return {
        day: index + 1, location: entity.name,
        activities: [{ name: 'Explorar ' + entity.name, status: STATUS.UNAVAILABLE }],
        accommodation: { status: STATUS.UNAVAILABLE }, meals: [], estimatedCost: null,
        distanceKm: distance == null ? null : Math.round(distance), distanceKind: 'geographic'
      };
    });
  }

  function calculateTripBudget() {
    const verified = travelSession.prices.filter((price) => price.status === STATUS.VERIFIED && Number.isFinite(price.amountNio));
    const totals = { accommodation: 0, transport: 0, food: 0, activities: 0, other: 0 };
    verified.forEach((price) => { totals[price.category] = (totals[price.category] || 0) + price.amountNio; });
    const totalNio = Object.values(totals).reduce((sum, value) => sum + value, 0);
    const maximumNio = travelSession.budget.amount == null ? null : travelSession.budget.currency === 'USD' ? travelSession.budget.amount * RATE.USD_NIO : travelSession.budget.amount;
    return { totals, totalNio, maximumNio, remainingNio: maximumNio == null ? null : maximumNio - totalNio, completeness: verified.length ? STATUS.VERIFIED : STATUS.UNAVAILABLE };
  }

  function initMap() {
    if (map || !window.L || !$('#aiInteractiveMap')) return;
    map = window.L.map('aiInteractiveMap', { zoomControl: true, attributionControl: false }).setView([12.8, -85.0], 7);
    window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18 }).addTo(map);
    window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18 }).addTo(map);
    markerLayer = window.L.layerGroup().addTo(map);
  }

  function renderDynamicRoute() {
    initMap(); if (!map) return;
    markerLayer.clearLayers(); if (routeLayer) { map.removeLayer(routeLayer); routeLayer = null; }
    const points = travelSession.route.filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
    points.forEach((point, index) => {
      const icon = window.L.divIcon({ className: 'custom-map-pin', html: `<div style="background:#165D6F;width:28px;height:28px;border-radius:50%;border:2px solid #fff;display:grid;place-items:center;box-shadow:0 4px 10px rgba(15,23,42,.35);color:#fff;font:800 12px Aristotelica Pro, Plus Jakarta Sans">${index + 1}</div>`, iconSize: [28, 28], iconAnchor: [14, 14] });
      window.L.marker([point.latitude, point.longitude], { icon }).addTo(markerLayer).bindPopup(`<strong>${escapeHtml(point.name)}</strong>`);
    });
    if (points.length > 1) routeLayer = window.L.polyline(points.map((point) => [point.latitude, point.longitude]), { color: '#F65E01', weight: 4, opacity: 0.9, dashArray: '6,8' }).addTo(map);
    if (points.length) map.fitBounds(window.L.latLngBounds(points.map((point) => [point.latitude, point.longitude])), { padding: [36, 36], maxZoom: 11 });
    else map.setView([12.8, -85.0], 7);

    const overlays = $$('.ia-map-overlay-card');
    overlays.forEach((card, index) => {
      const entity = travelSession.route[index];
      card.hidden = !entity;
      if (entity) { $('.ia-card-badge', card).textContent = `Parada ${index + 1}`; $('.ia-overlay-title', card).textContent = entity.name; const place = knowledge.find((p) => p.id === entity.knowledgeId); $('.ia-overlay-desc', card).textContent = entity.source === 'supabase' ? 'Ficha verificada por BAQUEANO' : (place?.department || place?.name || 'Catálogo BAQUEANO'); }
    });
    const chip = $('.ia-map-time-chip');
    if (chip) chip.textContent = points.length > 1 ? 'Distancias geográficas · ruta vial pendiente' : 'Añadí destinos para construir la ruta';
  }

  function formatMoney(nio) {
    if (!Number.isFinite(nio)) return 'Por confirmar';
    const main = travelSession.budget.currency === 'USD' ? nio / RATE.USD_NIO : nio;
    return new Intl.NumberFormat(travelSession.budget.currency === 'USD' ? 'en-US' : 'es-NI', { style: 'currency', currency: travelSession.budget.currency, maximumFractionDigits: 2 }).format(main);
  }

  function renderControls() {
    $('#cntDaysVal').textContent = travelSession.days ?? '—';
    $('#cntTravVal').textContent = travelSession.travelers ?? '—';
    $('#iaBudgetInput').value = travelSession.budget.amount ?? '';
    $('#iaBudgetCurrency').value = travelSession.budget.currency;
    $('#iaBudgetConversion').textContent = travelSession.budget.amount == null ? 'Ingresá tu límite real.' : `Referencia: ${RATE.USD_NIO} NIO por USD · ${RATE.verifiedAt}`;
    const tags = $('#iaDestTags');
    if (!travelSession.destinations.length) {
      // Estado vacío útil: accesos rápidos a destinos que el motor resuelve
      // siempre (FALLBACK_ENTITIES), aun sin conexión a Supabase.
      const hint = document.createElement('p'); hint.className = 'ia-dest-empty';
      hint.textContent = 'Todavía no elegiste destinos. Escribile a BAQUI o empezá con uno de estos:';
      const quick = QUICK_DESTINATIONS.map((name) => {
        const chip = document.createElement('button'); chip.type = 'button'; chip.className = 'ia-dest-quick';
        chip.innerHTML = '<i class="fa-solid fa-plus" aria-hidden="true"></i> ' + escapeHtml(name);
        chip.setAttribute('aria-label', 'Agregar ' + name + ' a la ruta');
        chip.addEventListener('click', () => { if (!travelSession.destinations.includes(name)) travelSession.destinations.push(name); generateSession(); });
        return chip;
      });
      tags.replaceChildren(hint, ...quick);
      return;
    }
    tags.replaceChildren(...travelSession.destinations.map((name) => {
      const tag = document.createElement('span'); tag.className = 'ia-tag'; tag.append(document.createTextNode(name + ' '));
      const button = document.createElement('button'); button.type = 'button'; button.className = 'ia-tag-remove'; button.setAttribute('aria-label', 'Quitar ' + name); button.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
      button.addEventListener('click', () => { travelSession.destinations = travelSession.destinations.filter((item) => item !== name); generateSession(); });
      tag.appendChild(button); return tag;
    }));
  }

  function renderItinerary() {
    const grid = $('.ia-days-grid'); if (!grid) return;
    if (!travelSession.itinerary.length) {
      grid.innerHTML = travelSession.route.length && !travelSession.days
        ? '<p class="ia-empty-state">Tu ruta está lista. Decime cuántos días querés viajar y reparto las paradas por día.</p>'
        : '<p class="ia-empty-state">Contale a BAQÜI qué destinos querés visitar para crear un itinerario.</p>';
      return;
    }
    grid.innerHTML = travelSession.itinerary.map((day) => `<article class="ia-day-card" data-day="${day.day}"><div class="ia-day-header d${(day.day - 1) % 3 + 1}"><span class="ia-day-tag">Día ${day.day}</span><div class="ia-day-title-group"><h4>${escapeHtml(day.location)}</h4><small>Plan dinámico de TravelSession</small></div></div><div class="ia-day-body"><div class="ia-day-timeline"><div class="ia-time-node"><strong>Flexible</strong> Explorar ${escapeHtml(day.location)} <small>Actividades y horarios sujetos a disponibilidad verificada</small></div></div><div class="ia-day-stats"><span><i class="fa-solid fa-route"></i> ${day.distanceKm == null ? 'Distancia pendiente' : `${day.distanceKm} km geográficos`}</span><span>Costo: <strong>Por confirmar</strong></span></div><div class="ia-day-actions"><button type="button" class="ia-day-btn" data-focus-route="${day.day - 1}"><i class="fa-solid fa-location-dot"></i> Ver en mapa</button><button type="button" class="ia-day-btn primary" data-edit-day="${day.day}"><i class="fa-regular fa-pen-to-square"></i> Editar día</button></div></div></article>`).join('');
  }

  function renderBudget() {
    const budget = calculateTripBudget();
    const intro = $('#iaBudgetCard p');
    if (intro) intro.textContent = `Desglose para ${travelersLabel() || 'viajeros por confirmar'} · ${travelSession.days ? `${travelSession.days} día${travelSession.days === 1 ? '' : 's'}` : 'días por confirmar'}. Solo se suman precios vigentes y trazables.`;
    const rows = { valStayRow: budget.totals.accommodation, valTransportRow: budget.totals.transport, valFoodRow: budget.totals.food, valActivityRow: budget.totals.activities, valOtherRow: budget.totals.other };
    Object.entries(rows).forEach(([id, amount]) => { const node = $('#' + id); if (node) node.textContent = amount > 0 ? formatMoney(amount) : 'Por confirmar'; });
    $('#valTotalBudget').textContent = budget.completeness === STATUS.UNAVAILABLE ? 'Sin precios verificados' : formatMoney(budget.totalNio);
    const badge = $('#iaBudgetStatusBadge');
    if (budget.maximumNio == null) { badge.className = 'ia-budget-status-pill'; badge.textContent = 'Presupuesto pendiente'; }
    else if (budget.completeness === STATUS.UNAVAILABLE) { badge.className = 'ia-budget-status-pill'; badge.textContent = 'Por confirmar · faltan precios'; }
    else if (budget.remainingNio >= 0) { badge.className = 'ia-budget-status-pill ok'; badge.textContent = `Dentro del presupuesto · quedan ${formatMoney(budget.remainingNio)}`; }
    else { badge.className = 'ia-budget-status-pill over'; badge.textContent = `Supera el presupuesto por ${formatMoney(Math.abs(budget.remainingNio))}`; }
    const percentage = budget.maximumNio > 0 && budget.completeness !== STATUS.UNAVAILABLE ? Math.min(150, Math.round(budget.totalNio / budget.maximumNio * 100)) : 0;
    $('#iaGaugePct').textContent = budget.completeness === STATUS.UNAVAILABLE ? '—' : `${percentage}%`;
    renderBudgetSplit();
    $('#lblBudgetUsed').textContent = budget.completeness === STATUS.UNAVAILABLE ? 'Precios por confirmar' : `${formatMoney(budget.totalNio)} estimado`;
  }

  // Reparto del presupuesto de la persona (no son precios de servicios).
  function renderBudgetSplit() {
    const total = $('#valTotalBudget'); if (!total) return;
    const anchor = total.closest('div') || total.parentElement;
    let box = $('#iaBudgetSplit');
    const split = budgetSplit();
    const max = $('#lblBudgetMax');
    if (max) max.textContent = split ? '○ ' + i18n('baqui.trip.budgetMax', 'Tope: {total} (≈ {equivalent})', split) : '○ ' + i18n('baqui.trip.budgetMaxNone', 'Sin tope definido');
    if (!split) { if (box) box.hidden = true; return; }
    if (!box) {
      box = document.createElement('div'); box.id = 'iaBudgetSplit'; box.className = 'ia-budget-share';
      box.setAttribute('role', 'group');
      anchor.insertAdjacentElement('afterend', box);
    }
    box.hidden = false;
    box.setAttribute('aria-label', i18n('baqui.trip.splitTitle', 'Cómo se reparte tu presupuesto'));
    const rows = [
      [i18n('baqui.trip.splitTotal', 'Tu presupuesto'), `${split.total} · ≈ ${split.equivalent}`],
      [i18n('baqui.trip.splitPerPerson', 'Por persona'), split.perPerson || i18n('baqui.trip.splitNeedTravelers', 'Decime cuántos viajan')],
      [i18n('baqui.trip.splitPerDay', 'Por día (grupo)'), split.perDay || i18n('baqui.trip.splitNeedDays', 'Decime cuántos días')],
      [i18n('baqui.trip.splitPerPersonDay', 'Por persona por día'), split.perPersonDay || '—']
    ];
    box.innerHTML = `<h5>${escapeHtml(i18n('baqui.trip.splitTitle', 'Cómo se reparte tu presupuesto'))}</h5><dl>${rows.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl><small>${escapeHtml(i18n('baqui.trip.splitNote', 'Es tu presupuesto dividido; los precios de servicios se suman solo cuando están verificados. Cambio de referencia: {rate} NIO por USD ({date}).', { rate: RATE.USD_NIO, date: RATE.verifiedAt }))}</small>`;
  }

  function renderRecommendations() {
    const grid = $('.ia-recs-grid'); if (!grid) return;
    if (!travelSession.recommendations.length) { grid.innerHTML = '<p class="ia-empty-state">Todavía no hay servicios vinculados y verificables para esta ruta. BAQUEANO no mostrará recomendaciones ficticias.</p>'; return; }
    grid.innerHTML = travelSession.recommendations.map((item) => `<article class="ia-rec-card"><div class="ia-rec-img-wrap"><span class="ia-rec-badge">${escapeHtml(item.category)}</span><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="ia-rec-img"></div><div class="ia-rec-content"><h4 class="ia-rec-title">${escapeHtml(item.name)}</h4><span class="ia-rec-loc"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(item.location || 'Ubicación por confirmar')}</span>${item.verified ? '<span class="ia-rec-rating"><small>Verificado BAQUEANO</small></span>' : '<span class="ia-rec-rating"><small>Por confirmar</small></span>'}<span class="ia-rec-price">Precio por confirmar</span><a href="aliados.html" class="ia-rec-btn">Ver detalle</a></div></article>`).join('');
  }

  // ==========================================================================
  // 🎯 POR QUÉ: "Cómo moverte" y "Alertas y recomendaciones" eran pobres
  //    (texto genérico o técnico). El propietario pide información rotativa
  //    según lo que BAQUEANO recomienda: si la ruta tiene 3 lugares, la de los
  //    tres; si tiene uno, la de ese.
  // ⚙️ CÓMO: por cada parada se busca su ficha real (findKnowledge) y se arma
  //    un panel: cómo llegar, distancia desde la parada anterior, transporte
  //    específico (lancha, avioneta, terminal de buses), mejor época,
  //    recomendaciones o seguridad, clima, duración y dificultad. Con más de
  //    una parada rota cada 8 s (pestañas accesibles; se pausa al pasar el
  //    mouse o con foco, y no rota con "reducir movimiento").
  // 📦 QUÉ: renderUtilities() + rotadores en ambas tarjetas.
  // ==========================================================================
  const ROTATE_MS = 8000;
  const rotators = new WeakMap();
  const RAINY_MONTHS = [5, 6, 7, 8, 9, 10];
  const TRANSPORT_HINTS = [
    [/ometepe|san jorge/, 'fa-ferry', 'Lancha o ferry desde el Puerto de San Jorge (Rivas). Llegá con tiempo en temporada alta.'],
    [/corn|maiz|caribe sur|bluefields|perlas/, 'fa-plane', 'Avioneta desde Managua o barco desde Bluefields; confirmá horarios con anticipación.'],
    [/leon|chinandega|cerro negro/, 'fa-bus', 'Buses interurbanos desde el mercado Israel Lewites (Managua).'],
    [/masaya|granada|rivas|carazo|san juan del sur|apoyo|mombacho|isletas/, 'fa-bus', 'Buses y microbuses desde el mercado Roberto Huembes (Managua).'],
    [/esteli|madriz|somoto|nueva segovia|jinotega|matagalpa|miraflor/, 'fa-bus', 'Buses al norte desde la terminal del Mercado Mayoreo (Managua).']
  ];
  const clip = (text, max = 260) => {
    const value = String(text || '').replace(/\s+/g, ' ').trim();
    return value.length > max ? value.slice(0, max - 1).trimEnd() + '…' : value;
  };

  function stopInsights() {
    return travelSession.route.map((entity, index) => {
      const place = knowledge.find((p) => p.id === entity.knowledgeId) || findKnowledge(entity.name);
      const previous = index > 0 ? travelSession.route[index - 1] : null;
      const km = previous ? haversine(previous, entity) : null;
      const key = normalize([entity.name, place?.name, place?.department].join(' '));
      const hint = TRANSPORT_HINTS.find(([pattern]) => pattern.test(key));
      return { entity, place, previous, km: km == null ? null : Math.round(km), hint };
    });
  }

  function transportPanel(stop) {
    const { entity, place, previous, km, hint } = stop;
    const parts = [];
    if (place?.howToReach) parts.push(`<p class="ia-rot-lead"><i class="fa-solid fa-signs-post" aria-hidden="true"></i> ${escapeHtml(clip(place.howToReach, 320))}</p>`);
    const facts = [];
    if (previous && km != null) facts.push(`<li><i class="fa-solid fa-route" aria-hidden="true"></i><span>Desde ${escapeHtml(previous.name)}: ~${km} km en línea recta (la distancia por carretera es mayor).</span></li>`);
    if (hint) facts.push(`<li><i class="fa-solid ${hint[1]}" aria-hidden="true"></i><span>${escapeHtml(hint[2])}</span></li>`);
    if (place?.duration) facts.push(`<li><i class="fa-regular fa-clock" aria-hidden="true"></i><span>Tiempo sugerido: ${escapeHtml(place.duration)}.</span></li>`);
    if (facts.length) parts.push(`<ul class="ia-guide-list ia-rot-list">${facts.join('')}</ul>`);
    if (!parts.length) parts.push(`<p class="ia-rot-lead">Todavía no tenemos indicaciones de acceso para ${escapeHtml(entity.name)}. Consultá el mapa o preguntale a BAQUI.</p>`);
    if (place?.url) parts.push(`<a class="ia-rot-link" href="${escapeHtml(place.url)}">Ver ficha de ${escapeHtml(place.name)} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>`);
    return parts.join('');
  }

  function alertsPanel(stop) {
    const { entity, place } = stop;
    const items = [];
    const month = new Date().getMonth() + 1;
    if (RAINY_MONTHS.includes(month)) items.push(`<li class="is-warning"><i class="fa-solid fa-cloud-rain" aria-hidden="true"></i><span>Temporada de lluvias (mayo–octubre): revisá caminos, ríos y salidas en lancha antes de ir.</span></li>`);
    if (place?.bestSeason) items.push(`<li><i class="fa-regular fa-calendar-check" aria-hidden="true"></i><span><strong>Cuándo ir:</strong> ${escapeHtml(clip(place.bestSeason, 220))}</span></li>`);
    if (place?.safetyTips) items.push(`<li><i class="fa-solid fa-shield-halved" aria-hidden="true"></i><span><strong>Seguridad:</strong> ${escapeHtml(clip(place.safetyTips, 240))}</span></li>`);
    if (place?.recommendations) items.push(`<li><i class="fa-solid fa-lightbulb" aria-hidden="true"></i><span><strong>Recomendación local:</strong> ${escapeHtml(clip(place.recommendations, 240))}</span></li>`);
    const chips = [place?.climate && `<span><i class="fa-solid fa-temperature-half" aria-hidden="true"></i> ${escapeHtml(place.climate)}</span>`,
      place?.difficulty && `<span><i class="fa-solid fa-person-hiking" aria-hidden="true"></i> ${escapeHtml(place.difficulty)}</span>`].filter(Boolean);
    if (!place) items.push(`<li><i class="fa-solid fa-circle-info" aria-hidden="true"></i><span>No encontramos la ficha de ${escapeHtml(entity.name)} en BAQUEANO todavía.</span></li>`);
    items.push(`<li><i class="fa-solid fa-phone" aria-hidden="true"></i><span>Emergencias: Policía 118 · Bomberos 115 · Cruz Roja 128.</span></li>`);
    return (chips.length ? `<div class="ia-rot-chips">${chips.join('')}</div>` : '') + `<ul class="ia-guide-list ia-rot-list">${items.join('')}</ul>`;
  }

  // 🎯 POR QUÉ: el propietario pidió más información por lugar: "si recomendó
  //    3 lugares, información de los tres; si es uno, igual".
  // ⚙️ CÓMO: ficha real de cada parada (data/travel-knowledge.json, generado
  //    desde territories-data.js y destination-dossier.js): foto del sitio,
  //    lema, región, descripción, qué hacer, qué ver, qué probar y cooperativas
  //    aliadas. Solo se pinta lo que existe; nada se rellena con texto genérico.
  // 📦 QUÉ: panel de la tarjeta "Conocé cada parada de tu ruta".
  function listBlock(icon, title, items) {
    if (!items || !items.length) return '';
    return `<div class="ia-discover-block"><h5><i class="fa-solid ${icon}" aria-hidden="true"></i> ${escapeHtml(title)}</h5><ul>${items.map((item) => `<li>${escapeHtml(clip(item, 120))}</li>`).join('')}</ul></div>`;
  }

  function discoverPanel(stop) {
    const { entity, place } = stop;
    if (!place) return `<p class="ia-rot-lead"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> Todavía no tenemos la ficha de ${escapeHtml(entity.name)} en BAQUEANO. Probá con el buscador o preguntale a BAQUI.</p>`;
    const chips = [
      place.region || (place.department && `Departamento de ${place.department}`),
      !place.region && place.municipalities && place.municipalities.length && `${place.municipalities.length} municipios`,
      place.capital && `Cabecera: ${place.capital}`,
      place.municipality,
      place.category,
      place.geopark
    ].filter(Boolean).map((text) => `<span>${escapeHtml(text)}</span>`).join('');
    const media = place.image
      ? `<figure class="ia-discover-media"><img src="${escapeHtml(place.image)}" alt="${escapeHtml(place.name)}" loading="lazy" decoding="async" width="480" height="320"></figure>`
      : '';
    const blocks = [
      listBlock('fa-person-hiking', 'Qué hacer', place.activities),
      listBlock('fa-map-pin', 'Qué conocer', place.places),
      listBlock('fa-bowl-food', 'Qué probar', place.food),
      listBlock('fa-handshake', 'Comunidad aliada', place.allies)
    ].filter(Boolean).join('');
    const sources = (place.sources || []).filter((src) => /^https:\/\//.test(src.url));
    const verified = place.highlights && place.highlights.length
      ? `<div class="ia-discover-verified"><h5><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Dato verificado</h5><ul>${place.highlights.map((text) => `<li>${escapeHtml(clip(text, 200))}</li>`).join('')}</ul>`
        + (sources.length ? `<p>Fuente: ${sources.map((src) => `<a href="${escapeHtml(src.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(src.label)}</a>`).join(' · ')}${place.verifiedAt ? ` · verificado el ${escapeHtml(place.verifiedAt)}` : ''}</p>` : '')
        + '</div>'
      : '';
    const links = [
      place.url && `<a class="ia-rot-link" href="${escapeHtml(place.url)}">Ver ficha completa <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>`,
      place.community && `<a class="ia-rot-link" href="${escapeHtml(place.community)}">Experiencias de viajeros <i class="fa-regular fa-comments" aria-hidden="true"></i></a>`
    ].filter(Boolean).join('');
    return `<div class="ia-discover">${media}<div class="ia-discover-copy">`
      + `<h5 class="ia-discover-title">${escapeHtml(place.name)}</h5>`
      + (place.tagline ? `<p class="ia-discover-tagline">${escapeHtml(place.tagline)}</p>` : '')
      + (chips ? `<div class="ia-rot-chips">${chips}</div>` : '')
      + (place.description ? `<p class="ia-discover-desc">${escapeHtml(place.description)}</p>` : '')
      + (blocks ? `<div class="ia-discover-grid">${blocks}</div>` : '')
      + verified
      + (links ? `<div class="ia-discover-links">${links}</div>` : '')
      + `</div></div>`;
  }

  function mountRotator(card, stops, renderPanel, label) {
    const content = $('h4', card)?.nextElementSibling;
    if (!content) return;
    const previous = rotators.get(card);
    if (previous) clearInterval(previous.timer);
    if (!stops.length) return;
    const id = card.dataset.rotId || (card.dataset.rotId = 'iaRot' + Math.random().toString(36).slice(2, 8));
    const tabs = stops.length > 1 ? `<div class="ia-rot-tabs" role="tablist" aria-label="${escapeHtml(label)}">${stops.map((stop, i) => `<button type="button" role="tab" id="${id}-tab-${i}" aria-controls="${id}-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-rot-index="${i}"><span>${i + 1}</span> ${escapeHtml(stop.entity.name)}</button>`).join('')}</div>` : `<p class="ia-rot-single"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${escapeHtml(stops[0].entity.name)}</p>`;
    content.innerHTML = `${tabs}<div class="ia-rot-panel" id="${id}-panel" role="tabpanel" aria-live="polite"></div>`;
    const panel = $('.ia-rot-panel', content);
    const buttons = $$('[data-rot-index]', content);
    const state = { index: 0, timer: null, paused: false };
    const show = (index) => {
      state.index = (index + stops.length) % stops.length;
      panel.innerHTML = renderPanel(stops[state.index]);
      panel.setAttribute('aria-labelledby', buttons.length ? `${id}-tab-${state.index}` : '');
      buttons.forEach((button, i) => { button.setAttribute('aria-selected', String(i === state.index)); button.tabIndex = i === state.index ? 0 : -1; });
    };
    buttons.forEach((button) => {
      button.addEventListener('click', () => show(Number(button.dataset.rotIndex)));
      button.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        event.preventDefault();
        show(state.index + (event.key === 'ArrowRight' ? 1 : -1));
        buttons[state.index].focus();
      });
    });
    ['mouseenter', 'focusin'].forEach((type) => card.addEventListener(type, () => { state.paused = true; }));
    ['mouseleave', 'focusout'].forEach((type) => card.addEventListener(type, () => { state.paused = false; }));
    show(0);
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (stops.length > 1 && !reduced) {
      state.timer = setInterval(() => { if (!state.paused && !document.hidden) show(state.index + 1); }, ROTATE_MS);
    }
    rotators.set(card, state);
  }

  function renderUtilities() {
    const utilities = $$('.ia-utility-section .ia-utility-card');
    const transport = utilities.find((card) => !card.classList.contains('ia-weather-card') && normalize($('h4', card)?.textContent).includes('moverte'));
    const alerts = utilities.find((card) => normalize($('h4', card)?.textContent).includes('alertas'));
    const discover = utilities.find((card) => card.classList.contains('ia-discover-card'));
    const stops = stopInsights();
    if (discover) {
      if (stops.length) mountRotator(discover, stops, discoverPanel, 'Lugares de tu ruta');
      else {
        const content = $('h4', discover)?.nextElementSibling;
        if (content) content.innerHTML = '<p class="ia-guide-note">Contale a BAQUI a dónde querés ir: acá vas a ver qué hacer, qué conocer y qué probar en cada lugar de tu ruta.</p>';
      }
    }
    if (transport) {
      if (stops.length) mountRotator(transport, stops, transportPanel, 'Paradas de la ruta');
      else {
        const content = $('h4', transport)?.nextElementSibling;
        if (content) content.innerHTML = '<ul class="ia-guide-list">' + TRANSPORT_GUIDE.map(([icon, title, text]) => `<li><i class="fa-solid ${icon}" aria-hidden="true"></i><span><strong>${escapeHtml(title)}.</strong> ${escapeHtml(text)}</span></li>`).join('') + '</ul><p class="ia-guide-note">Agregá destinos y te digo cómo llegar a cada uno.</p>';
      }
    }
    if (alerts) {
      const notFound = travelSession.warnings.filter(Boolean);
      if (stops.length) {
        mountRotator(alerts, stops, alertsPanel, 'Alertas por parada');
        if (notFound.length) {
          const content = $('h4', alerts)?.nextElementSibling;
          content?.insertAdjacentHTML('afterbegin', notFound.map((text) => `<p class="ia-rot-missing"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> ${escapeHtml(text)}</p>`).join(''));
        }
      } else {
        const content = $('h4', alerts)?.nextElementSibling;
        if (content) content.innerHTML = (notFound.length ? notFound.map((text) => `<p class="ia-rot-missing"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> ${escapeHtml(text)}</p>`).join('') : '<p class="ia-alert-status"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Sin alertas activas para tu sesión</p>')
          + '<ul class="ia-guide-list">' + SAFETY_GUIDE.map(([icon, text]) => `<li><i class="fa-solid ${icon}" aria-hidden="true"></i><span>${escapeHtml(text)}</span></li>`).join('') + '</ul>';
      }
    }
  }

  function renderAll() { renderControls(); renderDynamicRoute(); renderItinerary(); renderBudget(); renderRecommendations(); renderUtilities(); persist(); }

  async function generateSession() {
    if (activeRequest) activeRequest.abort(); activeRequest = new AbortController();
    const button = $('#iaGenerateRouteBtn'); button.disabled = true; button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Validando destinos…';
    try {
      await loadKnowledge();
      if (travelSession.discover && !travelSession.destinations.length) {
        travelSession.destinations = proposeDestinations(travelSession.interests, travelSession.days);
        travelSession.proposed = true;
      }
      travelSession.discover = false;
      const resolved = await Promise.all(travelSession.destinations.map(resolveTravelEntity));
      travelSession.resolvedEntities = resolved;
      travelSession.route = optimizeRoute(resolved.filter((item) => item.type !== 'unresolved'));
      travelSession.warnings = resolved.filter((item) => item.type === 'unresolved').map((item) => `No encontramos ${item.name} en BAQUEANO todavía.`);
      travelSession.itinerary = buildItinerary();
      travelSession.recommendations = await getRouteRecommendations(travelSession.route);
      renderAll();
      addMessage(sessionSummary(), 'bot');
    } catch (error) {
      travelSession.warnings.push('No fue posible actualizar todos los datos.'); renderAll();
      addMessage('No pude consultar todos los servicios. Conservé tu solicitud y mostré únicamente los datos disponibles.', 'bot');
      console.error('[TravelSession]', error);
    } finally { button.disabled = false; button.innerHTML = 'Generar ruta con IA <i class="fa-solid fa-arrow-right"></i>'; activeRequest = null; }
  }

  // Resumen sin datos inventados: repite lo entendido y pide lo que falta.
  // Textos con clave i18n (baqui.trip.*) y respaldo en español.
  const i18n = (key, fallback, vars) => {
    const lang = window.BaqueanoLanguage;
    const value = lang && typeof lang.t === 'function' ? lang.t(key, Object.assign({ fallback }, vars || {})) : '';
    return value || String(fallback).replace(/\{(\w+)\}/g, (_, token) => (vars && vars[token] != null ? vars[token] : '{' + token + '}'));
  };
  const money = (amount, currency) => new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'es-NI', { style: 'currency', currency, maximumFractionDigits: amount < 100 ? 2 : 0 }).format(amount);
  const INTEREST_LABEL = {
    playas: () => i18n('baqui.trip.interestBeaches', 'playas'), volcanes: () => i18n('baqui.trip.interestVolcanoes', 'volcanes'),
    naturaleza: () => i18n('baqui.trip.interestNature', 'naturaleza'), cultura: () => i18n('baqui.trip.interestCulture', 'cultura'),
    historia: () => i18n('baqui.trip.interestHistory', 'historia'), aventura: () => i18n('baqui.trip.interestAdventure', 'aventura'),
    gastronomia: () => i18n('baqui.trip.interestFood', 'gastronomía'), fotografia: () => i18n('baqui.trip.interestPhoto', 'fotografía')
  };

  // Reparto del presupuesto QUE LA PERSONA DIO (no son precios de servicios):
  // total, por persona, por día y por persona por día, con su equivalente.
  function budgetSplit() {
    const amount = finite(travelSession.budget.amount);
    if (amount == null || amount <= 0) return null;
    const currency = travelSession.budget.currency;
    const people = finite(travelSession.travelers);
    const days = finite(travelSession.days);
    const other = currency === 'USD' ? { amount: amount * RATE.USD_NIO, currency: 'NIO' } : { amount: amount / RATE.USD_NIO, currency: 'USD' };
    return {
      total: money(amount, currency), equivalent: money(other.amount, other.currency),
      perPerson: people ? money(amount / people, currency) : null,
      perDay: days ? money(amount / days, currency) : null,
      perPersonDay: people && days ? money(amount / people / days, currency) : null
    };
  }

  function sessionSummary() {
    const names = travelSession.route.map((item) => item.name);
    if (!names.length) return i18n('baqui.trip.needDestination', 'Decime al menos un destino de Nicaragua o escribí "quiero conocer Nicaragua" y te propongo una ruta.');
    const parts = [];
    (travelSession.typoCorrections || []).forEach((fix) => parts.push(i18n('baqui.trip.typoFix', 'Entendí «{typed}» como {label}.', fix)));
    const interests = (travelSession.interests || []).map((name) => (INTEREST_LABEL[name] ? INTEREST_LABEL[name]() : name)).join(', ');
    if (travelSession.proposed) {
      parts.push(i18n('baqui.trip.proposed', 'Te propongo esta ruta para conocer Nicaragua: {route}.', { route: names.join(' → ') })
        + (interests ? ' ' + i18n('baqui.trip.proposedBecause', 'La elegí por lo que te interesa: {interests}.', { interests }) : '')
        + ' ' + i18n('baqui.trip.proposedEdit', 'Podés quitar o agregar destinos cuando quieras.'));
    } else {
      parts.push(names.length > 1
        ? i18n('baqui.trip.routeMany', 'Tengo tu ruta con {count} paradas: {route}.', { count: names.length, route: names.join(' → ') })
        : i18n('baqui.trip.routeOne', 'Tengo tu ruta a {name}.', { name: names[0] }));
    }
    const who = travelersLabel();
    const split = budgetSplit();
    if (who) parts.push(i18n('baqui.trip.travelers', 'Viajan {who}.', { who }));
    if (split) {
      let line = i18n('baqui.trip.budgetTotal', 'Tu presupuesto: {total} (≈ {equivalent}).', split);
      if (split.perPerson) line += ' ' + i18n('baqui.trip.budgetPerPerson', 'Son {perPerson} por persona.', split);
      if (split.perPersonDay) line += ' ' + i18n('baqui.trip.budgetPerPersonDay', 'Con {days} días: {perDay} por día para el grupo, {perPersonDay} por persona por día.', Object.assign({ days: travelSession.days }, split));
      parts.push(line);
    }
    const spots = interestSpots(travelSession.route, travelSession.interests);
    if (spots.length) {
      parts.push(i18n('baqui.trip.spotsIntro', 'Lugares de tu ruta según lo que buscás ({interests}):', { interests })
        + ' ' + spots.map((item) => item.department + ': ' + item.spots.join(', ')).join(' · ') + '.');
    }
    parts.push(names.length > 1
      ? i18n('baqui.trip.compare', 'Abajo, en "Cómo moverte" y "Alertas", ves la información real de cada lugar.')
      : i18n('baqui.trip.compareOne', 'Abajo tenés cómo llegar y qué tener en cuenta.'));
    const missing = [];
    if (!travelSession.days) missing.push(i18n('baqui.trip.missingDays', 'cuántos días quieren viajar'));
    if (!who) missing.push(i18n('baqui.trip.missingTravelers', 'cuántas personas viajan (y si van niños)'));
    parts.push(missing.length
      ? i18n('baqui.trip.missing', 'Para repartir las paradas por día y el presupuesto me falta saber {items}.', { items: missing.join(' ' + i18n('baqui.trip.and', 'y') + ' ') })
      : i18n('baqui.trip.pricesPending', 'Los precios de hospedaje, transporte y comida se suman solo cuando hay negocios verificados; no los invento.'));
    return parts.join(' ');
  }

  function addMessage(text, sender = 'user') {
    const box = $('#iaChatMessages'); if (!box) return;
    const message = document.createElement('div'); message.className = `ia-msg ${sender}`; message.append(document.createTextNode(text));
    const time = document.createElement('span'); time.className = 'ia-msg-time'; time.textContent = new Intl.DateTimeFormat('es-NI', { hour: '2-digit', minute: '2-digit' }).format(new Date()); message.appendChild(time);
    box.appendChild(message); box.scrollTop = box.scrollHeight;
  }

  async function submitChat() {
    const input = $('#iaChatInput'); const text = input.value.trim(); if (!text) return;
    addMessage(text); input.value = ''; await loadKnowledge(); travelSession = parseTravelIntent(text, travelSession); await generateSession();
  }

  function setChatMicrophoneState(listening, message) {
    const button = $('#iaChatMicBtn');
    const input = $('#iaChatInput');
    if (button) {
      button.classList.toggle('is-listening', listening);
      button.setAttribute('aria-pressed', String(listening));
      button.setAttribute('aria-label', listening ? 'Detener dictado' : 'Iniciar dictado');
      button.title = listening ? 'Detener dictado' : 'Hablar con BAQUI';
      const icon = $('i', button);
      if (icon) icon.className = listening ? 'fa-solid fa-stop' : 'fa-solid fa-microphone';
    }
    if (input && message) input.placeholder = message;
  }

  function chatRecognitionError(code) {
    const messages = {
      'not-allowed': 'El micrófono está bloqueado. Permitilo en el candado del navegador.',
      'service-not-allowed': 'El navegador bloqueó el servicio de voz.',
      'audio-capture': 'No encontré un micrófono disponible.',
      'no-speech': 'No detecté voz. Tocá el micrófono e intentá nuevamente.',
      network: 'El dictado necesita conexión a internet.',
      aborted: 'Dictado detenido.',
      'language-not-supported': 'El navegador no admite este idioma para dictado.'
    };
    return messages[code] || 'No pude iniciar el dictado. Revisá el permiso del micrófono.';
  }

  async function toggleChatRecognition() {
    const input = $('#iaChatInput');
    if (chatRecognition) {
      chatRecognition.stop();
      setChatMicrophoneState(false, 'Dictado detenido. Podés editar o enviar el texto.');
      return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      addMessage('Tu navegador no admite dictado por voz. En Android, abrí esta página con la versión actual de Chrome.', 'bot');
      return;
    }
    if (!window.isSecureContext) {
      addMessage('El dictado por voz necesita una conexión HTTPS segura.', 'bot');
      return;
    }

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (error) {
      const message = 'El micrófono está bloqueado. Permitilo desde el candado del navegador y volvé a intentarlo.';
      if (input) input.placeholder = message;
      addMessage(message, 'bot');
      return;
    }

    const recognition = new Recognition();
    chatRecognition = recognition;
    recognition.lang = 'es-NI';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    let finalTranscript = '';
    let errorCode = '';

    recognition.onstart = () => setChatMicrophoneState(true, 'Escuchando… hablá ahora.');
    recognition.onspeechend = () => recognition.stop();
    recognition.onresult = event => {
      let interimTranscript = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0]?.transcript || '';
        if (event.results[index].isFinal) finalTranscript += transcript;
        else interimTranscript += transcript;
      }
      const transcript = `${finalTranscript} ${interimTranscript}`.trim();
      if (input && transcript) input.value = transcript.slice(0, 500);
    };
    recognition.onerror = event => {
      errorCode = event.error || 'unknown';
      const message = chatRecognitionError(errorCode);
      if (input) input.placeholder = message;
      if (!['aborted', 'no-speech'].includes(errorCode)) addMessage(message, 'bot');
    };
    recognition.onend = () => {
      chatRecognition = null;
      const hasText = Boolean(input?.value.trim());
      setChatMicrophoneState(false, hasText ? 'Listo. Podés editar o enviar tu idea de viaje.' : chatRecognitionError(errorCode || 'no-speech'));
      if (hasText) input.focus();
    };

    try {
      recognition.start();
    } catch (error) {
      chatRecognition = null;
      setChatMicrophoneState(false, 'No pude iniciar el dictado. Intentá nuevamente.');
    }
  }

  function readControls() {
    travelSession.days = Number($('#cntDaysVal').textContent) || null;
    const travelers = Number($('#cntTravVal').textContent) || null;
    if (travelers !== travelSession.travelers) { travelSession.travelers = travelers; travelSession.adults = travelers; travelSession.children = 0; }
    travelSession.budget.amount = finite($('#iaBudgetInput').value);
    travelSession.budget.currency = $('#iaBudgetCurrency').value;
  }

  function bindControls() {
    $('#iaChatSendBtn')?.addEventListener('click', submitChat);
    $('#iaChatMicBtn')?.addEventListener('click', toggleChatRecognition);
    $('#iaChatInput')?.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); submitChat(); } });
    $$('.ia-chat-pill[data-prompt]').forEach((button) => button.addEventListener('click', () => { $('#iaChatInput').value = button.dataset.prompt || ''; submitChat(); }));
    [['#cntDaysMinus', 'days', -1, 1, 14], ['#cntDaysPlus', 'days', 1, 1, 14], ['#cntTravMinus', 'travelers', -1, 1, 20], ['#cntTravPlus', 'travelers', 1, 1, 20]].forEach(([selector, key, delta, min, max]) => $(selector)?.addEventListener('click', () => {
      const base = travelSession[key] ?? (delta > 0 ? min - 1 : min);
      travelSession[key] = Math.max(min, Math.min(max, base + delta));
      // Ajustar el total a mano conserva los niños ya indicados.
      if (key === 'travelers') travelSession.adults = Math.max(1, travelSession.travelers - (travelSession.children || 0));
      generateSession();
    }));
    $('#iaBudgetInput')?.addEventListener('change', () => { readControls(); renderAll(); });
    $('#iaBudgetCurrency')?.addEventListener('change', () => { readControls(); renderAll(); });
    $('#iaGenerateRouteBtn')?.addEventListener('click', () => { readControls(); generateSession(); });
    $('#iaConfigResetBtn')?.addEventListener('click', () => { travelSession = emptySession(); sessionStorage.removeItem(SESSION_KEY); renderAll(); });
    $('#aiMapRecenterBtn')?.addEventListener('click', renderDynamicRoute);
    document.addEventListener('click', (event) => {
      const action = event.target.closest('[data-baqui-action]')?.dataset.baquiAction;
      if (action === 'save') { const saved = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'); saved.push(clone(travelSession)); localStorage.setItem(SAVED_KEY, JSON.stringify(saved.slice(-20))); window.bqToast?.('Viaje guardado con su ruta y presupuesto actuales.', 'success'); }
      if (action === 'share') navigator.share?.({ title: 'Mi ruta BAQUEANO', text: travelSession.route.map((item) => item.name).join(' → '), url: location.href }).catch(() => {});
      // 2026-10-06: PDF real con la plantilla BAQUEANO (texto seleccionable) en lugar de imprimir la pantalla.
      if (action === 'pdf') exportRoutePdf();
      if (action === 'qr') window.bqToast?.('Guardá el viaje para generar un enlace QR persistente.', 'info');
      const focus = event.target.closest('[data-focus-route]'); if (focus && map) { const point = travelSession.route[Number(focus.dataset.focusRoute)]; if (point?.latitude) { map.setView([point.latitude, point.longitude], 11); $('.ia-map-box')?.scrollIntoView({ behavior: 'smooth' }); } }
      const edit = event.target.closest('[data-edit-day]'); if (edit) { $('#iaChatInput').value = `Quiero modificar el Día ${edit.dataset.editDay}: `; $('#iaChatInput').focus(); }
    });
  }

  function exportRoutePdf() {
    const route = travelSession.route || [];
    if (!route.length) { window.bqToast?.(i18n('trip.pdfEmpty', 'Agregá al menos un destino para generar el PDF.'), 'warning'); return; }
    const trip = {
      name: i18n('baqui.pdf.title', 'Ruta BAQUI por Nicaragua'),
      kind: 'route',
      demo: false,
      days: route.map((item, index) => ({
        badge: i18n('baqui.pdf.stop', 'Parada {n}', { n: index + 1 }),
        title: item.name,
        location: [item.municipality, item.department].filter(Boolean).join(', ') || item.location || '',
        desc: item.summary || item.description || '',
        cost: '',
        lat: Number.isFinite(item.latitude) ? item.latitude : null,
        lng: Number.isFinite(item.longitude) ? item.longitude : null
      }))
    };
    const run = () => window.BaqueanoPdf.trip(trip, null).catch(() => window.bqToast?.(i18n('pdf.error', 'No se pudo generar el PDF.'), 'warning'));
    if (window.BaqueanoPdf) { run(); return; }
    const script = document.createElement('script');
    script.src = 'js/baqueano-pdf.js?v=20261006-2';
    script.onload = run;
    script.onerror = () => window.bqToast?.(i18n('pdf.error', 'No se pudo generar el PDF.'), 'warning');
    document.head.appendChild(script);
  }

  function init() {
    if (!FLAGS.USE_REAL_BAQUI_ENGINE) return;
    const budgetControls = $('.ia-budget-controls');
    if (budgetControls) budgetControls.innerHTML = '<p class="ia-empty-state"><strong>Precios trazables:</strong> cada categoría se completa solo con precios vigentes de negocios verificados en BAQUEANO. No sumamos importes inventados.</p>';
    if (!travelSession.destinations.length) {
      const messages = $('#iaChatMessages');
      if (messages) messages.replaceChildren();
      addMessage('¡Hola! Soy BAQUI. Contame destinos, días, cuántos viajan y tu presupuesto, y armo el mapa, el itinerario y el costo en un solo paso.', 'bot');
      addMessage('Por ejemplo: «3 días entre Granada y Masaya, 2 personas, 400 dólares».', 'bot');
    }
    bindControls(); initMap();
    window.addEventListener('baqueano:languageChanged', (event) => {
      travelSession.currentLanguage = event.detail?.lang || 'es';
      travelSession.preferredLanguage = travelSession.currentLanguage;
      renderAll();
    });
    if (travelSession.destinations.length) generateSession(); else renderAll();
    // Llegada desde una ficha del mapa (departamento.html): baqueano-ia.html?q=…
    // Se trata como texto que escribe la persona (addMessage usa textNode).
    try {
      const incoming = new URLSearchParams(window.location.search).get('q');
      const input = $('#iaChatInput');
      if (incoming && input && incoming.trim().length <= 200) {
        input.value = incoming.trim();
        submitChat();
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch (_) { /* sin parámetros válidos: BAQUI arranca normal */ }
    window.BaqueanoTravelSession = Object.freeze({ get: () => clone(travelSession), parseTravelIntent, resolveTravelEntity, loadKnowledge, generate: generateSession, renderDynamicRoute, calculateTripBudget, flags: FLAGS });
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init, { once: true }) : init();
}(window, document));
