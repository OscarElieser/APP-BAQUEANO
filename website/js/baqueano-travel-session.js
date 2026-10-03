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

  function emptySession() {
    const language = window.BaqueanoLanguage?.get?.() || localStorage.getItem('baqueano_language_v2') || localStorage.getItem('baqueano_language_v1') || localStorage.getItem('baqueano_language') || 'es';
    return {
      version: 1, countryCode: 'NI', currentLanguage: language, preferredLanguage: language,
      destinations: [], resolvedEntities: [], days: 3, travelers: 1,
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
  let markerLayer = null;
  let activeRequest = null;

  function persist() {
    travelSession.updatedAt = new Date().toISOString();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(travelSession));
    window.dispatchEvent(new CustomEvent('baqueano:travelSessionChanged', { detail: clone(travelSession) }));
  }

  function parseDestinations(text) {
    const knownNames = new Set(FALLBACK_ENTITIES.map((item) => item.name));
    const catalog = window.BaqueanoMasterCatalog;
    if (Array.isArray(catalog?.destinations)) catalog.destinations.forEach((item) => item?.name && knownNames.add(item.name));
    const normalizedText = normalize(text);
    const found = [...knownNames].filter((name) => normalizedText.includes(normalize(name)));
    return [...new Map(found.map((name) => [normalize(name), name])).values()];
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

    const days = normalized.match(/(\d{1,2})\s*(?:dias?|días?)/);
    if (days) next.days = Math.max(1, Math.min(14, Number(days[1])));
    const travelers = normalized.match(/(\d{1,2})\s*(?:personas?|viajeros?|adultos?)/);
    if (travelers) next.travelers = Math.max(1, Math.min(20, Number(travelers[1])));
    if (/voy solo|solo yo|viajo solo|viajo sola/.test(normalized)) next.travelers = 1;
    if (/otra persona|somos dos|vamos dos|en pareja/.test(normalized)) next.travelers = Math.max(2, current.travelers + (/otra persona/.test(normalized) ? 1 : 0));

    const budget = normalized.match(/(?:tengo|presupuesto|solo tengo|con)?\s*(?:usd|us\$|\$)?\s*([\d.,]+)\s*(dolares?|usd|cordobas?|nio|c\$)/);
    if (budget) {
      next.budget.amount = Number(budget[1].replace(/,/g, ''));
      next.budget.currency = /dolar|usd/.test(budget[2]) ? 'USD' : 'NIO';
    }
    next.interests = ['naturaleza', 'cultura', 'gastronomia', 'historia', 'fotografia', 'playas']
      .filter((interest) => normalized.includes(interest));
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
    if (resolved) return resolved;
    const fallback = FALLBACK_ENTITIES.find((item) => normalize(item.name) === normalize(name));
    return fallback ? Object.assign({}, fallback, { id: null, source: 'territorial-fallback', warning: 'Entidad sin validación activa de Supabase.' }) : { name, type: 'unresolved', latitude: null, longitude: null, source: 'unresolved' };
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
        image: item.cover_image || 'assets/images/baqui.png', price: null
      })) : [];
    } catch (_) { return []; }
  }

  function buildItinerary() {
    const route = travelSession.route;
    if (!route.length) return [];
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
      const icon = window.L.divIcon({ className: 'custom-map-pin', html: `<div style="background:#165D6F;width:28px;height:28px;border-radius:50%;border:2px solid #fff;display:grid;place-items:center;box-shadow:0 4px 10px rgba(15,23,42,.35);color:#fff;font:800 12px Inter">${index + 1}</div>`, iconSize: [28, 28], iconAnchor: [14, 14] });
      window.L.marker([point.latitude, point.longitude], { icon }).addTo(markerLayer).bindPopup(`<strong>${escapeHtml(point.name)}</strong>`);
    });
    if (points.length > 1) routeLayer = window.L.polyline(points.map((point) => [point.latitude, point.longitude]), { color: '#F65E01', weight: 4, opacity: 0.9, dashArray: '6,8' }).addTo(map);
    if (points.length) map.fitBounds(window.L.latLngBounds(points.map((point) => [point.latitude, point.longitude])), { padding: [36, 36], maxZoom: 11 });
    else map.setView([12.8, -85.0], 7);

    const overlays = $$('.ia-map-overlay-card');
    overlays.forEach((card, index) => {
      const entity = travelSession.route[index];
      card.hidden = !entity;
      if (entity) { $('.ia-card-badge', card).textContent = `Parada ${index + 1}`; $('.ia-overlay-title', card).textContent = entity.name; $('.ia-overlay-desc', card).textContent = entity.source === 'supabase' ? 'Validado en Supabase' : 'Coordenada territorial de respaldo'; }
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
    $('#cntDaysVal').textContent = travelSession.days;
    $('#cntTravVal').textContent = travelSession.travelers;
    $('#iaBudgetInput').value = travelSession.budget.amount ?? '';
    $('#iaBudgetCurrency').value = travelSession.budget.currency;
    $('#iaBudgetConversion').textContent = travelSession.budget.amount == null ? 'Ingresá tu límite real.' : `Referencia: ${RATE.USD_NIO} NIO por USD · ${RATE.verifiedAt}`;
    const tags = $('#iaDestTags');
    tags.replaceChildren(...travelSession.destinations.map((name) => {
      const tag = document.createElement('span'); tag.className = 'ia-tag'; tag.append(document.createTextNode(name + ' '));
      const button = document.createElement('button'); button.type = 'button'; button.className = 'ia-tag-remove'; button.setAttribute('aria-label', 'Quitar ' + name); button.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
      button.addEventListener('click', () => { travelSession.destinations = travelSession.destinations.filter((item) => item !== name); generateSession(); });
      tag.appendChild(button); return tag;
    }));
  }

  function renderItinerary() {
    const grid = $('.ia-days-grid'); if (!grid) return;
    if (!travelSession.itinerary.length) { grid.innerHTML = '<p class="ia-empty-state">Contale a BAQÜI qué destinos querés visitar para crear un itinerario.</p>'; return; }
    grid.innerHTML = travelSession.itinerary.map((day) => `<article class="ia-day-card" data-day="${day.day}"><div class="ia-day-header d${(day.day - 1) % 3 + 1}"><span class="ia-day-tag">Día ${day.day}</span><div class="ia-day-title-group"><h4>${escapeHtml(day.location)}</h4><small>Plan dinámico de TravelSession</small></div></div><div class="ia-day-body"><div class="ia-day-timeline"><div class="ia-time-node"><strong>Flexible</strong> Explorar ${escapeHtml(day.location)} <small>Actividades y horarios sujetos a disponibilidad verificada</small></div></div><div class="ia-day-stats"><span><i class="fa-solid fa-route"></i> ${day.distanceKm == null ? 'Distancia pendiente' : `${day.distanceKm} km geográficos`}</span><span>Costo: <strong>Por confirmar</strong></span></div><div class="ia-day-actions"><button type="button" class="ia-day-btn" data-focus-route="${day.day - 1}"><i class="fa-solid fa-location-dot"></i> Ver en mapa</button><button type="button" class="ia-day-btn primary" data-edit-day="${day.day}"><i class="fa-regular fa-pen-to-square"></i> Editar día</button></div></div></article>`).join('');
  }

  function renderBudget() {
    const budget = calculateTripBudget();
    const intro = $('#iaBudgetCard p');
    if (intro) intro.textContent = `Desglose para ${travelSession.travelers} viajero${travelSession.travelers === 1 ? '' : 's'} · ${travelSession.days} día${travelSession.days === 1 ? '' : 's'}. Solo se suman precios vigentes y trazables.`;
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
    $('#lblBudgetUsed').textContent = budget.completeness === STATUS.UNAVAILABLE ? 'Precios por confirmar' : `${formatMoney(budget.totalNio)} estimado`;
  }

  function renderRecommendations() {
    const grid = $('.ia-recs-grid'); if (!grid) return;
    if (!travelSession.recommendations.length) { grid.innerHTML = '<p class="ia-empty-state">Todavía no hay servicios vinculados y verificables para esta ruta. BAQUEANO no mostrará recomendaciones ficticias.</p>'; return; }
    grid.innerHTML = travelSession.recommendations.map((item) => `<article class="ia-rec-card"><div class="ia-rec-img-wrap"><span class="ia-rec-badge">${escapeHtml(item.category)}</span><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="ia-rec-img"></div><div class="ia-rec-content"><h4 class="ia-rec-title">${escapeHtml(item.name)}</h4><span class="ia-rec-loc"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(item.location || 'Ubicación por confirmar')}</span>${item.verified ? '<span class="ia-rec-rating"><small>Verificado BAQUEANO</small></span>' : '<span class="ia-rec-rating"><small>Por confirmar</small></span>'}<span class="ia-rec-price">Precio por confirmar</span><a href="aliados.html" class="ia-rec-btn">Ver detalle</a></div></article>`).join('');
  }

  function renderUtilities() {
    const utilities = $$('.ia-utility-section .ia-utility-card');
    const transport = utilities.find((card) => !card.classList.contains('ia-weather-card') && normalize($('h4', card)?.textContent).includes('moverte'));
    const alerts = utilities.find((card) => normalize($('h4', card)?.textContent).includes('alertas'));
    const routeNames = travelSession.route.map((item) => item.name);
    if (transport) {
      const content = $('h4', transport)?.nextElementSibling;
      if (content) content.innerHTML = routeNames.length
        ? `<div><strong>Ruta actual:</strong> ${escapeHtml(routeNames.join(' → '))}.</div><div>Confirmá horarios y disponibilidad directamente con operadores de transporte antes de viajar.</div><div>Las distancias mostradas son geográficas hasta disponer de un proveedor vial.</div>`
        : '<div>Agregá destinos para recibir orientación de transporte vinculada a tu ruta.</div>';
    }
    if (alerts) {
      const content = $('h4', alerts)?.nextElementSibling;
      if (content) content.innerHTML = travelSession.warnings.length
        ? travelSession.warnings.map((warning) => `<div><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> ${escapeHtml(warning)}</div>`).join('')
        : '<div>Sin alertas específicas verificadas para la sesión actual. Consultá clima, accesos y condiciones locales antes de salir.</div>';
    }
  }

  function renderAll() { renderControls(); renderDynamicRoute(); renderItinerary(); renderBudget(); renderRecommendations(); renderUtilities(); persist(); }

  async function generateSession() {
    if (activeRequest) activeRequest.abort(); activeRequest = new AbortController();
    const button = $('#iaGenerateRouteBtn'); button.disabled = true; button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Validando destinos…';
    try {
      const resolved = await Promise.all(travelSession.destinations.map(resolveTravelEntity));
      travelSession.resolvedEntities = resolved;
      travelSession.route = optimizeRoute(resolved.filter((item) => item.type !== 'unresolved'));
      travelSession.warnings = resolved.flatMap((item) => item.warning ? [item.warning + ' ' + item.name] : item.type === 'unresolved' ? ['No pudimos validar ' + item.name + '.'] : []);
      travelSession.itinerary = buildItinerary();
      travelSession.recommendations = await getRouteRecommendations(travelSession.route);
      renderAll();
      addMessage(travelSession.route.length ? `Organicé ${travelSession.route.map((item) => item.name).join(' → ')} para ${travelSession.days} días y ${travelSession.travelers} viajero${travelSession.travelers === 1 ? '' : 's'}. Los precios sin ficha vigente quedan por confirmar.` : 'Decime al menos un destino para construir la ruta.', 'bot');
    } catch (error) {
      travelSession.warnings.push('No fue posible actualizar todos los datos.'); renderAll();
      addMessage('No pude consultar todos los servicios. Conservé tu solicitud y mostré únicamente los datos disponibles.', 'bot');
      console.error('[TravelSession]', error);
    } finally { button.disabled = false; button.innerHTML = 'Generar ruta con IA <i class="fa-solid fa-arrow-right"></i>'; activeRequest = null; }
  }

  function addMessage(text, sender = 'user') {
    const box = $('#iaChatMessages'); if (!box) return;
    const message = document.createElement('div'); message.className = `ia-msg ${sender}`; message.append(document.createTextNode(text));
    const time = document.createElement('span'); time.className = 'ia-msg-time'; time.textContent = new Intl.DateTimeFormat('es-NI', { hour: '2-digit', minute: '2-digit' }).format(new Date()); message.appendChild(time);
    box.appendChild(message); box.scrollTop = box.scrollHeight;
  }

  async function submitChat() {
    const input = $('#iaChatInput'); const text = input.value.trim(); if (!text) return;
    addMessage(text); input.value = ''; travelSession = parseTravelIntent(text, travelSession); await generateSession();
  }

  function readControls() {
    travelSession.days = Number($('#cntDaysVal').textContent) || 1;
    travelSession.travelers = Number($('#cntTravVal').textContent) || 1;
    travelSession.budget.amount = finite($('#iaBudgetInput').value);
    travelSession.budget.currency = $('#iaBudgetCurrency').value;
  }

  function bindControls() {
    $('#iaChatSendBtn')?.addEventListener('click', submitChat);
    $('#iaChatInput')?.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); submitChat(); } });
    $$('.ia-chat-pill[data-prompt]').forEach((button) => button.addEventListener('click', () => { $('#iaChatInput').value = button.dataset.prompt || ''; submitChat(); }));
    [['#cntDaysMinus', 'days', -1, 1, 14], ['#cntDaysPlus', 'days', 1, 1, 14], ['#cntTravMinus', 'travelers', -1, 1, 20], ['#cntTravPlus', 'travelers', 1, 1, 20]].forEach(([selector, key, delta, min, max]) => $(selector)?.addEventListener('click', () => { travelSession[key] = Math.max(min, Math.min(max, travelSession[key] + delta)); generateSession(); }));
    $('#iaBudgetInput')?.addEventListener('change', () => { readControls(); renderAll(); });
    $('#iaBudgetCurrency')?.addEventListener('change', () => { readControls(); renderAll(); });
    $('#iaGenerateRouteBtn')?.addEventListener('click', () => { readControls(); generateSession(); });
    $('#iaConfigResetBtn')?.addEventListener('click', () => { travelSession = emptySession(); sessionStorage.removeItem(SESSION_KEY); renderAll(); });
    $('#aiMapRecenterBtn')?.addEventListener('click', renderDynamicRoute);
    document.addEventListener('click', (event) => {
      const action = event.target.closest('[data-baqui-action]')?.dataset.baquiAction;
      if (action === 'save') { const saved = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'); saved.push(clone(travelSession)); localStorage.setItem(SAVED_KEY, JSON.stringify(saved.slice(-20))); window.bqToast?.('Viaje guardado con su ruta y presupuesto actuales.', 'success'); }
      if (action === 'share') navigator.share?.({ title: 'Mi ruta BAQUEANO', text: travelSession.route.map((item) => item.name).join(' → '), url: location.href }).catch(() => {});
      if (action === 'pdf') window.print();
      if (action === 'qr') window.bqToast?.('Guardá el viaje para generar un enlace QR persistente.', 'info');
      const focus = event.target.closest('[data-focus-route]'); if (focus && map) { const point = travelSession.route[Number(focus.dataset.focusRoute)]; if (point?.latitude) { map.setView([point.latitude, point.longitude], 11); $('.ia-map-box')?.scrollIntoView({ behavior: 'smooth' }); } }
      const edit = event.target.closest('[data-edit-day]'); if (edit) { $('#iaChatInput').value = `Quiero modificar el Día ${edit.dataset.editDay}: `; $('#iaChatInput').focus(); }
    });
  }

  function init() {
    if (!FLAGS.USE_REAL_BAQUI_ENGINE) return;
    const budgetControls = $('.ia-budget-controls');
    if (budgetControls) budgetControls.innerHTML = '<p class="ia-empty-state"><strong>Precios trazables:</strong> las categorías se completarán únicamente con fichas vigentes de Supabase. No se aplican importes predeterminados.</p>';
    if (!travelSession.destinations.length) {
      const messages = $('#iaChatMessages');
      if (messages) messages.replaceChildren();
      addMessage('Contame destinos, días, viajeros y presupuesto. El mapa y todo el plan se actualizarán desde esa misma solicitud.', 'bot');
    }
    bindControls(); initMap();
    window.addEventListener('baqueano:languageChanged', (event) => {
      travelSession.currentLanguage = event.detail?.lang || 'es';
      travelSession.preferredLanguage = travelSession.currentLanguage;
      renderAll();
    });
    if (travelSession.destinations.length) generateSession(); else renderAll();
    window.BaqueanoTravelSession = Object.freeze({ get: () => clone(travelSession), parseTravelIntent, resolveTravelEntity, generate: generateSession, renderDynamicRoute, calculateTripBudget, flags: FLAGS });
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init, { once: true }) : init();
}(window, document));
