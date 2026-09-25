// ============================================================================
// BAQUEANO DIGITAL — GUÍA CONTEXTUAL GLOBAL
// 🎯 POR QUÉ: ofrecer ayuda territorial útil sin interrumpir la exploración.
// ⚙️ CÓMO: componente autónomo, estado por sesión, contexto mínimo y gateway seguro.
// 📦 QUÉ: mascota, drawer, voz, dictado, acciones verificadas y telemetría anónima.
// ============================================================================
(function (window, document) {
  'use strict';
  if (window.BaqueanoAssistant?.version === '4') return;
  if (!document.querySelector('link[data-baqueano-assistant]')) {
    const style = document.createElement('link'); style.rel = 'stylesheet'; style.href = 'css/baqueano-assistant.css?v=20260925-baqui-4'; style.dataset.baqueanoAssistant = 'true'; document.head.appendChild(style);
  }

  const CONFIG = Object.freeze({ greetingDelay: 4500, contextDelay: 18000, cooldown: 120000, autoPeek: 14000, sleepDelay: 90000, snoozeTime: 1800000, endpoint: '/api/v1/ai/chat' });
  const KEYS = Object.freeze({ session: 'baqueano_assistant_session_v2', preferences: 'baqueano_assistant_preferences_v2', weather: 'baqueano_weather_v1' });
  const EXCLUDED = /(?:admin|perfil|privacidad|terminos|cookies|aviso-legal|offline|denuncias)(?:\.html)?$/i;
  const ACTIONS = new Set(['open_destination','open_department','open_map','show_place','search_places','search_destination','search_business','search_experience','build_itinerary','calculate_budget','calculate_distance','save_favorite','show_nearby','show_emergency','open_booking','request_booking','check_availability','check_weather','search_events','create_route','share_itinerary','open_route','play_audio','pause_audio','show_food','show_history']);
  const CHARACTER_STATES = new Set(['idle','greeting','listening','thinking','speaking','dancing','explaining','celebrating','exploring','sleeping','hidden','minimized','emergency']);
  if (EXCLUDED.test(location.pathname.replace(/\/$/, ''))) return;

  const safeJson = (value, fallback) => { try { return JSON.parse(value) ?? fallback; } catch (_) { return fallback; } };
  const session = Object.assign({ id: crypto.randomUUID?.() || `bq-${Date.now()}`, messages: [], tripProfile: {}, greeted: false, hidden: false, hiddenUntil: 0, lastSuggestion: 0 }, safeJson(sessionStorage.getItem(KEYS.session), {}));
  const preferences = Object.assign({ voice: false, edge: 'right', y: null, enabled: true, suggestions: true }, safeJson(localStorage.getItem(KEYS.preferences), {}));
  const state = { open: false, busy: false, minimized: false, dragging: false, character: 'idle', controller: null, recognition: null, timers: [], lastActivity: Date.now(), module: 'inicio' };
  const saveSession = () => sessionStorage.setItem(KEYS.session, JSON.stringify(session));
  const savePreferences = () => localStorage.setItem(KEYS.preferences, JSON.stringify(preferences));
  const $ = (selector, root = document) => root.querySelector(selector);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MODULES = Object.freeze({
    index: { icon: '🧭', label: 'Baqüi · Guía general', motion: 'exploring' }, destinos: { icon: '🗺️', label: 'Baqüi · Explorador de destinos', motion: 'exploring' }, departamento: { icon: '🥾', label: 'Baqüi · Guía territorial', motion: 'exploring' }, gastronomia: { icon: '🍽️', label: 'Baqüi · Guía gastronómico', motion: 'explaining' }, historia: { icon: '📜', label: 'Baqüi · Narrador histórico', motion: 'explaining' }, musica: { icon: '🎶', label: 'Baqüi · Guía musical', motion: 'dancing' }, ambiental: { icon: '🌿', label: 'Baqüi · Guardián ambiental', motion: 'exploring' }, aliados: { icon: '🤝', label: 'Baqüi · Conector comunitario', motion: 'greeting' }, nosotros: { icon: '🇳🇮', label: 'Baqüi · Anfitrión', motion: 'greeting' }, 'mi-negocio': { icon: '🏡', label: 'Baqüi · Guía de negocios', motion: 'explaining' }, 'baqueano-ai': { icon: '✨', label: 'Baqüi · Planificador', motion: 'thinking' }
  });

  function track(name, detail = {}) {
    const payload = { event: name, page: location.pathname, ...detail };
    window.dataLayer?.push(payload);
    window.dispatchEvent(new CustomEvent('baqueano:analytics', { detail: payload }));
  }

  function buildUi() {
    document.getElementById('baqueanoAssistantBox')?.remove();
    const root = document.createElement('div');
    root.id = 'baqueanoAssistantBox';
    root.className = `bq-assistant bq-edge-${preferences.edge}`;
    root.innerHTML = `
      <div class="bq-suggestion" id="bqSuggestion" role="status" hidden><button type="button" class="bq-suggestion-close" data-command="dismiss-suggestion" aria-label="Cerrar sugerencia">×</button><p></p><div class="bq-suggestion-actions"><button type="button" data-command="suggestion-listen"><i class="fa-solid fa-volume-high"></i> Escuchar</button><button type="button" data-command="suggestion-open"><i class="fa-solid fa-comments"></i> Abrir panel</button><button type="button" data-command="snooze">Ahora no</button></div></div>
      <aside class="bq-drawer" id="bqDrawer" aria-hidden="true" aria-label="Baqüi, guía digital de Nicaragua">
        <header class="bq-header"><picture><img src="assets/images/baqui.png" alt=""></picture><div><strong>Baqüi</strong><span><i></i> <b id="bqModuleLabel">Guía IA de Nicaragua</b></span></div><div class="bq-header-actions"><button data-command="voice" aria-label="Activar voz" title="Voz"><i class="fa-solid fa-volume-xmark"></i></button><button data-command="minimize" aria-label="Minimizar"><i class="fa-solid fa-minus"></i></button><button data-command="close" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button></div></header>
        <section class="bq-live" aria-label="Información útil"><div class="bq-live-card"><i class="fa-regular fa-clock"></i><span>Hora en Nicaragua</span><strong id="bqClock">--:--</strong></div><button class="bq-live-card" type="button" data-command="weather"><i class="fa-solid fa-cloud-sun"></i><span id="bqWeatherPlace">Managua</span><strong id="bqWeather">Consultar clima</strong></button><button class="bq-live-card bq-promo" type="button" data-command="promotion"><i class="fa-solid fa-tags"></i><span>Promociones</span><strong id="bqPromotion">Verificadas</strong></button></section>
        <div class="bq-messages" id="bqMessages" aria-live="polite" aria-busy="false"></div>
        <div class="bq-quick" aria-label="Acciones rápidas">
          <button data-quick="build_itinerary">🗺️ Planificar viaje</button><button data-quick="search_places">🌋 Descubrir destinos</button><button data-quick="lodging">🏨 Hospedaje</button><button data-quick="food">🍽️ Dónde comer</button><button data-quick="music">🎶 Música</button><button data-quick="history">📖 Historia</button><button data-quick="experiences">🥾 Aventuras</button><button data-quick="show_nearby">📍 Qué hay cerca</button><button data-quick="favorites">❤️ Favoritos</button><button data-quick="show_emergency">🚨 SOS 24/7</button><button data-quick="country">🇳🇮 Conocer Nicaragua</button><button data-quick="surprise">✨ Sorpréndeme</button>
        </div>
        <form class="bq-form" id="bqForm"><label class="sr-only" for="bqInput">Escribe tu consulta</label><textarea id="bqInput" rows="2" maxlength="500" placeholder="Preguntá por destinos, rutas o experiencias…" required></textarea><button type="button" data-command="microphone" aria-label="Hablar"><i class="fa-solid fa-microphone"></i></button><button type="submit" aria-label="Enviar"><i class="fa-solid fa-arrow-up"></i></button></form>
        <footer><button data-command="clear"><i class="fa-solid fa-trash-can"></i> Limpiar</button><button data-command="stop" hidden><i class="fa-solid fa-stop"></i> Detener</button><button data-command="hide"><i class="fa-solid fa-eye-slash"></i> Ocultar 30 min</button></footer>
      </aside>
      <button class="bq-mascot" id="bqMascot" type="button" aria-label="Abrir a Baqüi, guía digital" aria-expanded="false">
        <span class="bq-glow"></span><span class="bq-context-icon" id="bqContextIcon" aria-hidden="true">🧭</span><span class="bq-character" aria-hidden="true"><img class="bq-character-base" src="assets/images/baqui.png" alt="" draggable="false"><span class="bq-character-part bq-character-head"></span><span class="bq-character-part bq-character-wing"></span><span class="bq-character-part bq-character-tail"></span><span class="bq-sleep-symbol">Z</span></span><span class="sr-only">Baqüi, guardabarranco guía virtual de Nicaragua</span><span class="bq-online" aria-hidden="true"></span><span class="bq-mini-time" id="bqMiniTime" aria-hidden="true"></span>
      </button>
      <button class="bq-reopen-tab" type="button" data-command="reopen" aria-label="Mostrar nuevamente a Baqüi"><img src="assets/images/baqui.png" alt=""><span>Hablar con Baqüi</span></button>`;
    document.body.appendChild(root);
    restorePosition(root);
    return root;
  }

  function restorePosition(root) {
    if (Number.isFinite(preferences.y)) root.style.setProperty('--bq-y', `${Math.max(90, Math.min(innerHeight - 170, preferences.y))}px`);
  }

  function context() {
    const meta = (name) => document.querySelector(`meta[name="${name}"]`)?.content || null;
    const activeFilters = Array.from(document.querySelectorAll('[data-filter].active,[aria-pressed="true"][data-filter]')).slice(0, 8).map(el => el.dataset.filter);
    return {
      currentPage: `${document.title} · ${location.pathname}`, currentModule: document.body.dataset.module || location.pathname.split('/').pop()?.replace('.html','') || 'inicio',
      destination: document.querySelector('[data-destination].is-active,[data-destination-detail]')?.dataset.destination || meta('baqueano:destination'),
      department: document.querySelector('[data-department].is-active')?.dataset.department || meta('baqueano:department'),
      municipality: meta('baqueano:municipality'), category: meta('baqueano:category'), business: meta('baqueano:business'),
      currentSearch: document.querySelector('input[type="search"],#destSearchInput,#searchDestinations')?.value || null,
      currentAudio: document.querySelector('.is-playing,[data-playing="true"]')?.dataset.title || null,
      currentFood: document.querySelector('[data-food].is-active,[data-dish].is-active')?.dataset.food || null,
      currentArticle: document.querySelector('article.is-active,[data-article].is-active')?.dataset.article || null,
      activeFilters, recentPlaces: safeJson(sessionStorage.getItem('baqueano_recent_items'), []).slice(-5), filters: { active: activeFilters }, recentItems: safeJson(sessionStorage.getItem('baqueano_recent_items'), []).slice(-5), tripProfile: session.tripProfile
    };
  }

  function currentModule() { return (document.body.dataset.module || location.pathname.split('/').pop()?.replace('.html', '') || 'index').toLowerCase(); }
  function applyModulePersonality() {
    const key = currentModule(); const profile = MODULES[key] || MODULES.index; state.module = key;
    root.dataset.module = key; $('#bqContextIcon').textContent = profile.icon; $('#bqModuleLabel').textContent = profile.label;
    if (!state.open && state.character === 'idle') setCharacter(profile.motion);
  }

  function updateClock() {
    const now = new Intl.DateTimeFormat('es-NI', { timeZone: 'America/Managua', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date());
    $('#bqClock').textContent = now; $('#bqMiniTime').textContent = now;
  }

  function weatherLabel(code) { if (code === 0) return 'Despejado'; if ([1,2,3].includes(code)) return 'Parcialmente nublado'; if ([45,48].includes(code)) return 'Neblina'; if ([51,53,55,61,63,65,80,81,82].includes(code)) return 'Lluvia'; if ([95,96,99].includes(code)) return 'Tormenta'; return 'Condición variable'; }
  function renderWeather(value) { $('#bqWeatherPlace').textContent = value.place; $('#bqWeather').textContent = `${value.temp}° · ${weatherLabel(value.code)}`; }
  async function loadWeather(lat = 12.1364, lng = -86.2514, place = 'Managua') {
    const cached = safeJson(sessionStorage.getItem(KEYS.weather), null); if (cached && cached.place === place && Date.now() - cached.time < 900000) return renderWeather(cached);
    $('#bqWeather').textContent = 'Actualizando…';
    try { const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lng)}&current=temperature_2m,weather_code&timezone=America%2FManagua`); if (!response.ok) throw new Error('weather'); const data = await response.json(); const value = { place, temp: Math.round(data.current.temperature_2m), code: data.current.weather_code, time: Date.now() }; sessionStorage.setItem(KEYS.weather, JSON.stringify(value)); renderWeather(value); track('assistant_weather_loaded', { place }); } catch (_) { $('#bqWeather').textContent = 'No disponible'; }
  }
  function requestWeather() {
    if (!navigator.geolocation || !confirm('¿Usar tu ubicación solo para consultar el clima actual? No se guardarán coordenadas precisas.')) return loadWeather();
    navigator.geolocation.getCurrentPosition(position => loadWeather(position.coords.latitude.toFixed(2), position.coords.longitude.toFixed(2), 'Tu ubicación'), () => loadWeather(), { enableHighAccuracy: false, timeout: 7000, maximumAge: 900000 });
  }

  function verifiedPromotions() {
    const fromPage = Array.from(document.querySelectorAll('[data-promotion][data-verified="true"]')).map(node => ({ title: node.dataset.promotion || node.textContent.trim(), url: node.dataset.promotionUrl || '' }));
    const fromSession = safeJson(sessionStorage.getItem('baqueano_verified_promotions'), []).filter(item => item && item.verified === true);
    return [...fromPage, ...fromSession].slice(0, 5);
  }
  function showPromotions() { const items = verifiedPromotions(); open(); appendMessage(items.length ? `Promociones verificadas disponibles: ${items.map(item => item.title).join(' · ')}` : 'No hay promociones verificadas activas en esta página. Nunca te mostraré una oferta sin fuente confirmada.', 'assistant'); setCharacter(items.length ? 'celebrating' : 'idle'); track('assistant_promotions_opened', { count: items.length }); }

  function setCharacter(next) {
    if (!CHARACTER_STATES.has(next) || state.character === next) return;
    root?.classList.remove(`is-${state.character}`); state.character = next; root?.classList.add(`is-${next}`);
    root?.setAttribute('data-character-state', next);
  }

  function isSensitiveInteraction() {
    const active = document.activeElement;
    return Boolean(active?.matches('input,textarea,select,[contenteditable="true"]') || document.querySelector('[data-payment].is-open,.auth-modal.is-open,.modal-backdrop-pro.is-open'));
  }

  function appendMessage(text, role = 'assistant', persist = true) {
    const body = $('#bqMessages');
    if (!body) return;
    const item = document.createElement('article'); item.className = `bq-message is-${role}`;
    const p = document.createElement('p'); p.textContent = text; item.appendChild(p); body.appendChild(item); body.scrollTop = body.scrollHeight;
    if (persist) { session.messages.push({ role: role === 'user' ? 'user' : 'assistant', content: String(text).slice(0, 1000) }); session.messages = session.messages.slice(-16); saveSession(); }
    return p;
  }

  async function streamText(text) {
    setCharacter('speaking');
    const p = appendMessage('', 'assistant', false); if (!p) return;
    const chunks = String(text).split(/(\s+)/); let rendered = '';
    for (const chunk of chunks) { if (!state.busy) break; rendered += chunk; p.textContent = rendered; await new Promise(resolve => setTimeout(resolve, reduceMotion ? 0 : 14)); }
    session.messages.push({ role: 'assistant', content: String(text).slice(0, 1000) }); session.messages = session.messages.slice(-16); saveSession();
    if (preferences.voice && text) speak(text); else setCharacter('idle');
  }

  function speak(text) { if (!('speechSynthesis' in window) || !preferences.voice) return; speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(String(text).slice(0, 1200)); utterance.lang = 'es-NI'; utterance.rate = .96; utterance.onend = () => setCharacter('idle'); utterance.onerror = () => setCharacter('idle'); speechSynthesis.speak(utterance); }

  async function ask(raw) {
    const message = String(raw || '').trim(); if (!message || state.busy) return;
    session.tripProfile = Object.assign({}, session.tripProfile, extractTripProfile(message)); saveSession();
    appendMessage(message, 'user'); state.busy = true; state.controller = new AbortController();
    $('#bqMessages').setAttribute('aria-busy', 'true'); $('[data-command="stop"]').hidden = false; setCharacter('thinking');
    const thinking = appendMessage('Baqüi está pensando…', 'status', false); const started = performance.now();
    try {
      const response = await fetch(CONFIG.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: state.controller.signal, body: JSON.stringify({ message, conversationId: session.id, history: session.messages.slice(-12, -1), context: context() }) });
      if (!response.ok) throw new Error('gateway'); const data = await response.json(); if (!data.ok) throw new Error('contract');
      thinking?.closest('article')?.remove(); session.tripProfile = Object.assign({}, session.tripProfile, data.tripProfilePatch || {}); if (CHARACTER_STATES.has(data.animation)) setCharacter(data.animation); await streamText(data.message); renderActions(data.actions || []); track('assistant_response', { mode: data.mode, latency_ms: Math.round(performance.now() - started) });
    } catch (error) {
      thinking?.closest('article')?.remove();
      if (error.name !== 'AbortError') {
        appendMessage('No pude conectarme con el servicio de inteligencia en este momento. Tu pregunta no fue respondida ni sustituida por contenido automático. Intentá nuevamente en unos instantes.', 'status', false);
        setCharacter('idle');
        track('assistant_error', { code: 'AI_UNAVAILABLE', latency_ms: Math.round(performance.now() - started) });
      }
    } finally { state.busy = false; state.controller = null; $('#bqMessages').setAttribute('aria-busy', 'false'); $('[data-command="stop"]').hidden = true; if (state.character === 'thinking') setCharacter('idle'); }
  }

  function extractTripProfile(message) {
    const text = String(message).toLocaleLowerCase('es'); const patch = {};
    const travelers = text.match(/(?:somos|viajamos|para)\s+(\d{1,2})\s+(?:personas?|viajeros?)/); const days = text.match(/(\d{1,3})\s+d[ií]as?/); const budget = text.match(/(?:presupuesto|tengo|gastar)\s*(?:de)?\s*(c\$|us\$|\$)?\s*([\d,.]+)/);
    if (travelers) patch.travelers = Math.min(50, Number(travelers[1])); if (days) patch.days = Math.min(365, Number(days[1]));
    if (budget) { patch.budget = Number(budget[2].replace(/,/g, '')); patch.currency = /(?:us\$|\$)/i.test(budget[1] || '') ? 'USD' : 'NIO'; }
    const interests = ['aventura','cultura','gastronomía','gastronomia','playa','montaña','naturaleza','historia','música','musica'].filter(item => text.includes(item)); if (interests.length) patch.interests = [...new Set(interests.map(item => item.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))];
    if (/silla de ruedas|movilidad reducida|accesibilidad/.test(text)) patch.accessibility = ['movilidad'];
    return patch;
  }

  function renderActions(actions) {
    const valid = actions.filter(action => ACTIONS.has(action.type)).slice(0, 3); if (!valid.length) return;
    const wrap = document.createElement('div'); wrap.className = 'bq-actions';
    valid.forEach(action => { const button = document.createElement('button'); button.type = 'button'; button.textContent = action.label || 'Abrir'; button.addEventListener('click', () => executeAction(action)); wrap.appendChild(button); });
    $('#bqMessages').appendChild(wrap); $('#bqMessages').scrollTop = $('#bqMessages').scrollHeight;
  }

  function safeLocalPath(value, fallback) { try { const url = new URL(value || fallback, location.origin); return url.origin === location.origin ? `${url.pathname}${url.search}${url.hash}` : fallback; } catch (_) { return fallback; } }
  function executeAction(action) {
    track('assistant_suggestion_clicked', { action: action.type });
    if (action.type === 'build_itinerary') track('assistant_itinerary_requested');
    const routes = { open_map: 'destinos.html#mapa', show_place: 'destinos.html', search_places: 'destinos.html', search_destination: 'destinos.html', search_business: 'aliados.html', search_experience: 'destinos.html', open_destination: 'destinos.html', open_department: 'departamento.html', build_itinerary: 'baqueano-ai.html#planner', calculate_budget: 'baqueano-ai.html#planner', calculate_distance: 'destinos.html#mapa', show_emergency: 'index.html#sos', open_route: 'index.html#routeBuilderSection', create_route: 'index.html#routeBuilderSection', open_booking: 'mi-negocio.html', request_booking: 'mi-negocio.html', check_availability: 'mi-negocio.html', search_events: 'destinos.html', share_itinerary: 'baqueano-ai.html#planner', show_food: 'gastronomia.html', show_history: 'historia.html' };
    if (action.type === 'show_nearby') return requestNearby();
    if (action.type === 'check_weather') return requestWeather();
    if (action.type === 'play_audio') { document.querySelector('audio')?.play().catch(() => {}); return; }
    if (action.type === 'pause_audio') { document.querySelectorAll('audio').forEach(audio => audio.pause()); return; }
    if (action.type === 'save_favorite') { if (!confirm('¿Guardar este destino en tus favoritos de este dispositivo?')) return; const favorites = safeJson(localStorage.getItem('baqueano_favorites'), []); if (action.id && !favorites.includes(action.id)) favorites.push(action.id); localStorage.setItem('baqueano_favorites', JSON.stringify(favorites)); appendMessage('Destino guardado en tus favoritos.', 'assistant'); return; }
    location.href = safeLocalPath(action.url, routes[action.type] || 'destinos.html');
  }

  function requestNearby() {
    if (!navigator.geolocation) return appendMessage('Tu navegador no permite obtener ubicación. Elegí un departamento en el mapa.', 'assistant');
    if (!confirm('¿Permitir ubicación solo para esta búsqueda? No se guardará tu coordenada precisa.')) return;
    navigator.geolocation.getCurrentPosition(position => { const lat = position.coords.latitude.toFixed(2), lng = position.coords.longitude.toFixed(2); location.href = `destinos.html#mapa?near=${encodeURIComponent(`${lat},${lng}`)}`; }, () => appendMessage('No fue posible obtener la ubicación. Podés elegir el territorio manualmente.', 'assistant'), { enableHighAccuracy: false, timeout: 7000, maximumAge: 300000 });
  }

  function isSnoozed() { return Number(session.hiddenUntil || 0) > Date.now(); }
  function open() { if (isSnoozed()) return; wakeCharacter(); state.open = true; state.minimized = false; $('#bqDrawer').classList.add('is-open'); $('#bqDrawer').setAttribute('aria-hidden', 'false'); $('#bqMascot').setAttribute('aria-expanded', 'true'); root.classList.remove('is-peeking'); hideSuggestion(); setTimeout(() => $('#bqInput')?.focus(), 120); track('assistant_opened'); }
  function close() { state.open = false; $('#bqDrawer').classList.remove('is-open'); $('#bqDrawer').setAttribute('aria-hidden', 'true'); $('#bqMascot').setAttribute('aria-expanded', 'false'); window.speechSynthesis?.cancel(); track('assistant_closed'); schedulePeek(); }
  function hide() { session.hidden = false; session.hiddenUntil = Date.now() + CONFIG.snoozeTime; saveSession(); close(); hideSuggestion(); root.classList.add('is-snoozed'); track('assistant_hidden', { minutes: 30 }); }
  function reopen() { session.hidden = false; session.hiddenUntil = 0; saveSession(); root.classList.remove('is-snoozed'); wakeCharacter(); showSuggestion('Estoy de vuelta. Puedo recomendarte algo de esta sección o abrir el panel cuando vos decidás.'); track('assistant_reopened'); }
  function showSuggestion(text) { if (state.open || isSnoozed() || isSensitiveInteraction()) return; state.suggestionText = String(text); const box = $('#bqSuggestion'); $('p', box).textContent = text; box.hidden = false; const preserveMode = state.character === 'dancing' || state.character === 'emergency'; if (!preserveMode) setCharacter('greeting'); if (preferences.voice) speak(text); setTimeout(() => { if (state.character === 'greeting') setCharacter('idle'); hideSuggestion(); }, 12000); track('assistant_shown'); track('assistant_context_suggestion'); }
  function hideSuggestion() { const box = $('#bqSuggestion'); if (box) box.hidden = true; }
  function schedulePeek() { clearTimeout(state.peekTimer); state.peekTimer = setTimeout(() => { if (!state.open && !state.dragging) root.classList.add('is-peeking'); }, CONFIG.autoPeek); }

  function contextualSuggestion() {
    if (!preferences.suggestions || state.open || isSnoozed() || isSensitiveInteraction() || Date.now() - session.lastSuggestion < CONFIG.cooldown) return;
    const ctx = context(); let text = null;
    if (ctx.destination) text = `Puedo mostrarte cómo llegar, qué visitar cerca y cómo incluir ${ctx.destination} en una ruta.`;
    else if (ctx.department) text = `¿Querés que prepare una ruta de un día por ${ctx.department}?`;
    else if (/destinos/.test(location.pathname)) text = '¿Querés que te ayude a comparar destinos según tus intereses?';
    else if (/gastronomia/.test(location.pathname)) text = '¿Te dio hambre? Puedo enseñarte qué se come tradicionalmente y mostrarte opciones registradas.';
    else if (/historia/.test(location.pathname)) text = 'Este territorio guarda historias interesantes. ¿Querés que te cuente una con fuentes verificadas?';
    else if (/musica/.test(location.pathname)) text = 'Estás explorando música nicaragüense. Puedo explicarte el género, su historia y sus intérpretes.';
    else if (/departamento/.test(location.pathname)) text = 'Puedo ayudarte a descubrir este territorio y convertir tus intereses en una ruta.';
    else if (/ambiental/.test(location.pathname)) text = 'Puedo ayudarte a explorar naturaleza y prácticas responsables usando información registrada.';
    else if (/aliados/.test(location.pathname)) text = 'Puedo ayudarte a encontrar artesanos, cooperativas y experiencias culturales con contacto directo.';
    else if (/nosotros/.test(location.pathname)) text = '¿Querés que te cuente cómo Baqueano conecta tecnología, territorio y cultura nicaragüense?';
    else text = 'Puedo recomendarte destinos, historia, gastronomía, museos, arte, cultura o música según lo que te interese.';
    if (text) { session.lastSuggestion = Date.now(); saveSession(); showSuggestion(text); }
  }

  function initDrag(mascot) {
    let startX, startY, originY, moved;
    mascot.addEventListener('pointerdown', event => { if (event.button !== 0) return; state.dragging = true; moved = false; startX = event.clientX; startY = event.clientY; originY = mascot.getBoundingClientRect().top; mascot.setPointerCapture(event.pointerId); root.classList.remove('is-peeking'); });
    mascot.addEventListener('pointermove', event => { if (!state.dragging) return; const dx = event.clientX - startX, dy = event.clientY - startY; if (Math.hypot(dx, dy) > 6) moved = true; const y = Math.max(76, Math.min(innerHeight - mascot.offsetHeight - 20, originY + dy)); root.style.setProperty('--bq-y', `${y}px`); root.classList.toggle('bq-edge-left', event.clientX < innerWidth / 2); root.classList.toggle('bq-edge-right', event.clientX >= innerWidth / 2); });
    mascot.addEventListener('pointerup', event => { if (!state.dragging) return; state.dragging = false; mascot.releasePointerCapture(event.pointerId); preferences.edge = root.classList.contains('bq-edge-left') ? 'left' : 'right'; preferences.y = parseFloat(getComputedStyle(root).getPropertyValue('--bq-y')) || mascot.getBoundingClientRect().top; savePreferences(); schedulePeek(); if (!moved) open(); });
    mascot.addEventListener('click', event => { if (moved) event.preventDefault(); });
    mascot.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
  }

  function startRecognition() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition; if (!Recognition) return appendMessage('El reconocimiento de voz no está disponible en este navegador.', 'assistant');
    setCharacter('listening'); track('assistant_voice_used');
    state.recognition?.abort(); const recognition = new Recognition(); state.recognition = recognition; recognition.lang = 'es-NI'; recognition.interimResults = false; $('#bqInput').placeholder = 'Escuchando…';
    recognition.onresult = event => { $('#bqInput').value = event.results[0][0].transcript; $('#bqInput').placeholder = 'Entendido. Podés enviarlo o editarlo.'; };
    recognition.onerror = () => { $('#bqInput').placeholder = 'No pude escuchar. Intentá nuevamente.'; }; recognition.onend = () => { state.recognition = null; setCharacter('idle'); }; recognition.start();
  }

  session.hidden = false;
  const root = buildUi(); if (!preferences.enabled) root.hidden = true; if (isSnoozed()) root.classList.add('is-snoozed');
  session.messages.length ? session.messages.forEach(message => appendMessage(message.content, message.role, false)) : appendMessage('¡Hola! Soy Baqüi, tu guardabarranco guía. Puedo ayudarte a descubrir Nicaragua con información territorial y acciones concretas.', 'assistant');
  initDrag($('#bqMascot'));
  $('#bqForm').addEventListener('submit', event => { event.preventDefault(); const input = $('#bqInput'), value = input.value; input.value = ''; ask(value); track('assistant_message_sent'); });
  $('#bqInput').addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); $('#bqForm').requestSubmit(); } });
  root.addEventListener('pointerenter', () => root.classList.remove('is-peeking'));
  root.addEventListener('click', event => {
    const command = event.target.closest('[data-command]')?.dataset.command; const quick = event.target.closest('[data-quick]')?.dataset.quick;
    if (quick) { track('assistant_quick_action', { action: quick }); if (ACTIONS.has(quick)) return executeAction({ type: quick }); const prompts = { lodging: 'Busco hospedaje con información registrada.', food: '¿Dónde puedo comer comida local?', music: 'Quiero conocer la música de Nicaragua.', history: 'Contame una historia verificada de Nicaragua.', experiences: 'Mostrame aventuras y experiencias.', favorites: 'Quiero ver mis favoritos.', country: 'Quiero conocer Nicaragua.', surprise: 'Sorpréndeme con un destino verificado.' }; return ask(prompts[quick]); }
    if (command === 'close' || command === 'minimize') close(); if (command === 'hide' || command === 'snooze') hide(); if (command === 'reopen') reopen(); if (command === 'suggestion-open') open(); if (command === 'suggestion-listen') { preferences.voice = true; savePreferences(); speak(state.suggestionText || 'Estoy listo para ayudarte a descubrir Nicaragua.'); } if (command === 'clear') { session.messages = []; session.tripProfile = {}; saveSession(); $('#bqMessages').replaceChildren(); appendMessage('Conversación limpia. ¿Qué querés descubrir?', 'assistant'); }
    if (command === 'stop') { state.busy = false; state.controller?.abort(); window.speechSynthesis?.cancel(); }
    if (command === 'voice') { preferences.voice = !preferences.voice; savePreferences(); const icon = event.target.closest('button').querySelector('i'); icon.className = preferences.voice ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark'; track('assistant_voice_enabled', { enabled: preferences.voice }); }
    if (command === 'microphone') startRecognition(); if (command === 'weather') requestWeather(); if (command === 'promotion') showPromotions(); if (command === 'dismiss-suggestion') { session.lastSuggestion = Date.now(); saveSession(); hideSuggestion(); }
  });
  function wakeCharacter() { state.lastActivity = Date.now(); if (state.character === 'sleeping') { setCharacter('greeting'); setTimeout(() => { if (state.character === 'greeting') setCharacter('idle'); }, 1100); } }
  ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'scroll'].forEach(type => document.addEventListener(type, wakeCharacter, { passive: true }));
  window.addEventListener('baqueano:context', event => { session.pageEvent = event.detail; });
  const reactToContext = (type, detail = {}) => {
    window.dispatchEvent(new CustomEvent('baqueano:context', {detail: {type, ...detail}}));
    if (type === 'music_playing') { setCharacter('dancing'); track('assistant_music_dance'); if (Date.now() - session.lastSuggestion > CONFIG.cooldown) showSuggestion('🎶 ¡Esta música tiene historia! ¿Querés que te la cuente?'); }
    if (type === 'music_paused') setCharacter('idle');
    if (type === 'food_viewed' || type === 'gastronomy_opened') { setCharacter('explaining'); track('assistant_food_opened'); }
    if (type === 'history_opened') { setCharacter('explaining'); track('assistant_history_started'); }
    if (type === 'emergency_opened') setCharacter('emergency');
    if (type === 'map_opened' || type === 'destination_viewed' || type === 'department_viewed' || type === 'municipality_viewed') setCharacter('exploring');
    if (type === 'favorite_added') { setCharacter('celebrating'); setTimeout(() => { if (state.character === 'celebrating') setCharacter('idle'); }, 1800); }
  };
  document.addEventListener('play', event => { if (event.target instanceof HTMLAudioElement) reactToContext('music_playing', {title: event.target.dataset.title || event.target.getAttribute('aria-label') || null}); }, true);
  document.addEventListener('pause', event => { if (event.target instanceof HTMLAudioElement) reactToContext('music_paused'); }, true);
  document.addEventListener('ended', event => { if (event.target instanceof HTMLAudioElement) reactToContext('music_paused'); }, true);
  document.addEventListener('click', event => {
    const target = event.target.closest('button,a,[role="button"]'); if (!target || target.closest('.bq-assistant')) return;
    if (target.matches('.open-sos-btn,.sos-quick-btn,#openSosModalBtn,[href*="#sos"]')) reactToContext('emergency_opened');
    else if (target.matches('.favorite-btn,.btn-favorite,[data-favorite],[onclick*="toggleFavorite"]')) reactToContext('favorite_added');
    else if (target.matches('[href*="#mapa"],[data-open-map],.open-map-btn,.leaflet-control')) reactToContext('map_opened');
    else if (target.matches('[data-food],[data-dish],.gastro-card button')) reactToContext('food_viewed');
    else if (target.matches('[data-history],.timeline-period-card button')) reactToContext('history_opened');
  }, true);
  ['music_playing','music_paused','music_changed','department_viewed','municipality_viewed','history_opened','gastronomy_opened','food_viewed','destination_viewed','business_viewed','map_opened','search_started','search_no_results','itinerary_started','emergency_opened','favorite_added'].forEach(type => window.addEventListener(`baqueano:${type}`, event => reactToContext(type, event.detail)));
  window.addEventListener('resize', () => restorePosition(root), { passive: true });
  window.addEventListener('baqueano:promotion', event => { if (!event.detail?.verified) return; const items = safeJson(sessionStorage.getItem('baqueano_verified_promotions'), []); items.push(event.detail); sessionStorage.setItem('baqueano_verified_promotions', JSON.stringify(items.slice(-5))); $('#bqPromotion').textContent = `${items.length} nueva${items.length === 1 ? '' : 's'}`; if (!isSensitiveInteraction()) showSuggestion(`🏷️ Promoción verificada: ${event.detail.title}`); });
  applyModulePersonality(); updateClock(); state.timers.push(setInterval(updateClock, 30000)); loadWeather(); const promoCount = verifiedPromotions().length; $('#bqPromotion').textContent = promoCount ? `${promoCount} activa${promoCount === 1 ? '' : 's'}` : 'Sin alertas';
  state.timers.push(setInterval(() => { if (!state.open && !state.busy && !state.dragging && Date.now() - state.lastActivity >= CONFIG.sleepDelay) setCharacter('sleeping'); }, 5000));
  state.timers.push(setTimeout(() => { if (!session.greeted && !isSnoozed()) { session.greeted = true; saveSession(); showSuggestion('👋 ¡Hola! Soy Baqüi. ¿Qué rincón de Nicaragua querés descubrir?'); } }, CONFIG.greetingDelay));
  state.timers.push(setTimeout(contextualSuggestion, CONFIG.contextDelay)); state.timers.push(setInterval(contextualSuggestion, CONFIG.cooldown));
  state.timers.push(setInterval(() => { if (root.classList.contains('is-snoozed') && !isSnoozed()) reopen(); }, 15000)); schedulePeek();

  window.BaqueanoAssistant = { version: '4', open, close, ask, speak: text => { preferences.voice = true; savePreferences(); speak(text); }, setState: setCharacter, show: () => { root.hidden = false; reopen(); }, hide, context, refreshWeather: requestWeather, showPromotions };
})(window, document);
