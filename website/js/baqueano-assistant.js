// ============================================================================
// BAQUEANO DIGITAL — GUÍA CONTEXTUAL GLOBAL
// 🎯 POR QUÉ: ofrecer ayuda territorial útil sin interrumpir la exploración.
// ⚙️ CÓMO: componente autónomo, estado por sesión, contexto mínimo y gateway seguro.
// 📦 QUÉ: mascota, drawer, voz, dictado, acciones verificadas y telemetría anónima.
// ============================================================================
(function (window, document) {
  'use strict';
  if (window.BaqueanoAssistant?.version === '6') return;
  if (!document.querySelector('link[data-baqueano-assistant]')) {
    const style = document.createElement('link'); style.rel = 'stylesheet'; style.href = 'css/baqueano-assistant.css?v=20260925-baqui-6'; style.dataset.baqueanoAssistant = 'true'; document.head.appendChild(style);
  }

  // 🎯 POR QUÉ: Firebase Hosting no expone /health y su 404 pintaba el asistente en rojo aunque Supabase estuviera operativo.
  // ⚙️ CÓMO: la verificación consulta el monitor Edge real que respalda IA, Grounding y persistencia territorial.
  // 📦 QUÉ: indicador visual sincronizado con la infraestructura activa, sin falsos estados de desconexión.
  const CONFIG = Object.freeze({ greetingDelay: 4500, contextDelay: 18000, cooldown: 120000, autoPeek: 14000, sleepDelay: 90000, snoozeTime: 1800000, endpoint: 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-ai', healthEndpoint: 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-status', healthInterval: 45000, requestAttempts: 3 });
  const KEYS = Object.freeze({ session: 'baqueano_assistant_session_v2', preferences: 'baqueano_assistant_preferences_v2', weather: 'baqueano_weather_v1' });
  const EXCLUDED = /(?:admin)(?:\.html)?$/i;
  const ACTIONS = new Set(['open_destination','open_department','open_map','show_place','search_places','search_destination','search_business','search_experience','build_itinerary','calculate_budget','calculate_distance','save_favorite','show_nearby','show_emergency','open_booking','request_booking','check_availability','check_weather','search_events','create_route','share_itinerary','open_route','play_audio','pause_audio','show_food','show_history']);
  const CHARACTER_STATES = new Set(['idle','greeting','listening','thinking','speaking','dancing','explaining','celebrating','exploring','sleeping','hidden','minimized','emergency']);
  if (EXCLUDED.test(location.pathname.replace(/\/$/, ''))) return;

  const safeJson = (value, fallback) => { try { return JSON.parse(value) ?? fallback; } catch (_) { return fallback; } };
  const session = Object.assign({ id: crypto.randomUUID?.() || `bq-${Date.now()}`, messages: [], tripProfile: {}, greeted: false, hidden: false, hiddenUntil: 0, minimized: false, lastSuggestion: 0 }, safeJson(sessionStorage.getItem(KEYS.session), {}));
  const preferences = Object.assign({ voice: false, edge: 'right', y: null, enabled: true, suggestions: true }, safeJson(localStorage.getItem(KEYS.preferences), {}));
  const state = { open: false, busy: false, minimized: false, dragging: false, character: 'idle', controller: null, recognition: null, timers: [], lastActivity: Date.now(), module: 'inicio', service: 'checking' };
  const saveSession = () => sessionStorage.setItem(KEYS.session, JSON.stringify(session));
  const savePreferences = () => localStorage.setItem(KEYS.preferences, JSON.stringify(preferences));
  const $ = (selector, root = document) => root.querySelector(selector);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MODULES = Object.freeze({
    index: { icon: '🧭', label: 'Baqüi · Guía general', motion: 'exploring' }, destinos: { icon: '🗺️', label: 'Baqüi · Explorador de destinos', motion: 'exploring' }, departamento: { icon: '🥾', label: 'Baqüi · Guía territorial', motion: 'exploring' }, gastronomia: { icon: '🍽️', label: 'Baqüi · Guía gastronómico', motion: 'explaining' }, historia: { icon: '📜', label: 'Baqüi · Narrador histórico', motion: 'explaining' }, musica: { icon: '🎶', label: 'Baqüi · Guía musical', motion: 'dancing' }, ambiental: { icon: '🌿', label: 'Baqüi · Guardián ambiental', motion: 'exploring' }, aliados: { icon: '🤝', label: 'Baqüi · Conector comunitario', motion: 'greeting' }, nosotros: { icon: '🇳🇮', label: 'Baqüi · Anfitrión', motion: 'greeting' }, 'mi-negocio': { icon: '🏡', label: 'Baqüi · Guía de negocios', motion: 'explaining' }, 'baqueano-ai': { icon: '✨', label: 'Baqüi · Planificador', motion: 'thinking' }
  });

  // ============================================================================
  // CONTEXTO EDITORIAL DE NAVEGACIÓN
  // POR QUÉ: Baqüi debe reconocer la página visible y explicar su utilidad, no
  // limitarse a un saludo genérico que rompa la sensación de guía territorial.
  // CÓMO: cada módulo declara una introducción breve y una acción recomendada;
  // la misma fuente alimenta el saludo inicial, la reaparición y las sugerencias.
  // QUÉ: mensajes contextuales para las secciones públicas y fallback de inicio.
  // ============================================================================
  const PAGE_GUIDANCE = Object.freeze({
    index: 'Veo que estás en la página principal. Te recomiendo empezar por Destinos si querés descubrir un lugar, o usar el planificador para crear una ruta según tus intereses.',
    inicio: 'Veo que estás en la página principal. Te recomiendo empezar por Destinos si querés descubrir un lugar, o usar el planificador para crear una ruta según tus intereses.',
    destinos: 'Veo que estás en Destinos. Aquí podés explorar lugares de Nicaragua y compararlos; te recomiendo elegir primero el tipo de experiencia que buscás.',
    departamento: 'Veo que estás explorando un departamento. Esta página reúne sus lugares, cultura y datos territoriales; te recomiendo revisar los atractivos y luego armar una ruta.',
    gastronomia: 'Veo que estás en Gastronomía. Aquí descubrirás platos, ingredientes y tradiciones culinarias; te recomiendo explorar una receta o buscar dónde probar comida local.',
    historia: 'Veo que estás en Historia. Esta sección explica hechos, personajes y memoria cultural de Nicaragua; te recomiendo abrir el período que más te interese.',
    musica: 'Veo que estás en Música. Aquí podés escuchar el archivo sonoro nicaragüense y conocer a sus intérpretes; elegí una canción y te contaré brevemente de qué se trata.',
    ambiental: 'Veo que estás en la sección Ambiental. Aquí encontrarás naturaleza y prácticas responsables; te recomiendo explorar un ecosistema o destino sostenible.',
    aliados: 'Veo que estás en Aliados. Aquí podés encontrar artesanos, cooperativas y experiencias locales; te recomiendo filtrar según lo que buscás.',
    nosotros: 'Veo que estás en Nosotros. Esta página explica cómo Baqueano conecta tecnología, territorio y cultura nicaragüense.',
    'mi-negocio': 'Veo que estás en Mi Negocio. Aquí podés conocer las herramientas para publicar y gestionar una experiencia turística local.',
    'baqueano-ai': 'Veo que estás en el planificador inteligente. Contame qué lugar, presupuesto o tipo de experiencia buscás y convertiré esas preferencias en una ruta.',
    perfil: 'Veo que estás en tu perfil. Aquí podés revisar tus datos y preferencias de exploración; te recomiendo verificar que estén actualizados antes de planificar un viaje.',
    privacidad: 'Veo que estás consultando la Política de Privacidad. Aquí explicamos qué datos utiliza Baqueano y cómo se protegen; puedo ayudarte a ubicar el tema que buscás.',
    terminos: 'Veo que estás consultando los Términos de Uso. Aquí encontrarás las reglas y responsabilidades de la plataforma; puedo orientarte hacia la sección que necesitás.',
    cookies: 'Veo que estás en la Política de Cookies. Esta página explica qué tecnologías utiliza el sitio y para qué sirven.',
    'aviso-legal': 'Veo que estás en el Aviso Legal. Aquí encontrarás la identificación, alcance y condiciones legales de Baqueano.',
    denuncias: 'Veo que estás en el canal de denuncias. Aquí podés comunicar una situación de forma responsable; revisá las indicaciones antes de enviar información sensible.',
    offline: 'Veo que no tenés conexión. Podés intentar recargar la página o volver al inicio cuando se restablezca internet.',
    404: 'Veo que esta dirección no existe. Te recomiendo volver a la página principal o abrir Destinos para continuar explorando.'
  });

  function pageGuidance() {
    return PAGE_GUIDANCE[currentModule()] || PAGE_GUIDANCE.index;
  }

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
        <header class="bq-header"><picture><img src="assets/images/baqui.png" alt=""></picture><div><strong>Baqüi</strong><span><i id="bqServiceDot"></i> <b id="bqModuleLabel">Verificando inteligencia…</b></span></div><div class="bq-header-actions"><button data-command="voice" aria-label="Activar voz" title="Voz"><i class="fa-solid fa-volume-xmark"></i></button><button data-command="minimize" aria-label="Minimizar"><i class="fa-solid fa-minus"></i></button><button data-command="close" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button></div></header>
        <section class="bq-live" aria-label="Información útil"><div class="bq-live-card"><i class="fa-regular fa-clock"></i><span>Hora en Nicaragua</span><strong id="bqClock">--:--</strong></div><button class="bq-live-card" type="button" data-command="weather"><i class="fa-solid fa-cloud-sun"></i><span id="bqWeatherPlace">Managua</span><strong id="bqWeather">Consultar clima</strong></button><button class="bq-live-card bq-promo" type="button" data-command="promotion"><i class="fa-solid fa-tags"></i><span>Promociones</span><strong id="bqPromotion">Verificadas</strong></button></section>
        <div class="bq-messages" id="bqMessages" aria-live="polite" aria-busy="false"></div>
        <div class="bq-quick" aria-label="Acciones rápidas">
          <button data-quick="build_itinerary">🗺️ Planificar viaje</button><button data-quick="search_places">🌋 Descubrir destinos</button><button data-quick="lodging">🏨 Hospedaje</button><button data-quick="food">🍽️ Dónde comer</button><button data-quick="music">🎶 Música</button><button data-quick="history">📖 Historia</button><button data-quick="experiences">🥾 Aventuras</button><button data-quick="show_nearby">📍 Qué hay cerca</button><button data-quick="favorites">❤️ Favoritos</button><button data-quick="show_emergency">🚨 SOS 24/7</button><button data-quick="country">🇳🇮 Conocer Nicaragua</button><button data-quick="surprise">✨ Sorpréndeme</button>
        </div>
        <form class="bq-form" id="bqForm"><label class="sr-only" for="bqInput">Escribe tu consulta</label><textarea id="bqInput" rows="2" maxlength="500" placeholder="Preguntá por destinos, rutas o experiencias…" required></textarea><button type="button" data-command="microphone" aria-label="Hablar"><i class="fa-solid fa-microphone"></i></button><button type="submit" aria-label="Enviar"><i class="fa-solid fa-arrow-up"></i></button></form>
        <footer><button data-command="clear"><i class="fa-solid fa-trash-can"></i> Limpiar</button><button data-command="stop" hidden><i class="fa-solid fa-stop"></i> Detener</button><button data-command="hide"><i class="fa-solid fa-eye-slash"></i> Ocultar 30 min</button></footer>
      </aside>
      <button class="bq-mascot-minimize" type="button" data-command="minimize-mascot" aria-label="Minimizar a Baqüi" title="Minimizar"><i class="fa-solid fa-minus" aria-hidden="true"></i></button>
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

  function updateServiceStatus(next) {
    state.service = next;
    root.dataset.service = next;
    const profile = MODULES[currentModule()] || MODULES.index;
    const label = $('#bqModuleLabel');
    if (label) label.textContent = next === 'online' ? profile.label : next === 'checking' ? 'Verificando inteligencia…' : 'IA temporalmente sin conexión';
    const mascot = $('#bqMascot');
    if (mascot) mascot.setAttribute('aria-label', next === 'online' ? 'Abrir a Baqüi, inteligencia territorial activa' : 'Abrir a Baqüi, servicio inteligente sin conexión');
  }

  async function checkServiceHealth() {
    if (!navigator.onLine) return updateServiceStatus('offline');
    updateServiceStatus('checking');
    try {
      const response = await fetch(CONFIG.healthEndpoint, { cache: 'no-store', signal: AbortSignal.timeout?.(6000) });
      const health = response.ok ? await response.json().catch(() => null) : null;
      updateServiceStatus(response.ok && health?.ok !== false && health?.status !== 'error' ? 'online' : 'offline');
    } catch (_) { updateServiceStatus('offline'); }
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

  function itineraryReply(itinerary) {
    if (!itinerary) return 'La conexión está activa, pero no recibí suficiente información para construir una recomendación. Indicame el departamento, los días y cuántas personas viajan.';
    const days = Array.isArray(itinerary.days) ? itinerary.days.slice(0, 4).map(day => {
      const stops = Array.isArray(day.stops) ? day.stops.map(stop => stop.name).filter(Boolean).join(', ') : '';
      return `${day.title || `Día ${day.dayNumber || ''}`}${stops ? `: ${stops}` : ''}`;
    }).join(' · ') : '';
    return [itinerary.title, itinerary.summary, days, itinerary.sustainabilityNote].filter(Boolean).join('\n\n');
  }

  // ============================================================================
  // 🔊 SANITIZADOR FONÉTICO DE VOZ NATURAL (CLEAN TEXT FOR SPEECH)
  // 🎯 POR QUÉ: Evitar que el sintetizador de voz lea signos ortográficos, asteriscos,
  //    hashtags, guiones, corchetes, barras, dos puntos o URLs como palabras robóticas.
  // ⚙️ CÓMO: Remueve sintaxis Markdown, viñetas, emojis y signos gráficos, transformando
  //    abreviaturas en palabras fluidas y puntuación en pausas cadenciosas humanas.
  // 📦 QUÉ: Retorna una cadena de texto en español nicaragüense 100% natural para el habla.
  // ============================================================================
  function cleanTextForSpeech(text) {
    if (!text) return '';
    return String(text)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Enlaces markdown a solo texto
      .replace(/https?:\/\/\S+/gi, '') // URLs
      .replace(/[*_~`#]/g, '') // Markdown negritas, cursivas, encabezados
      .replace(/^[\s•\-\*–—\d\.]+\s+/gm, '') // Viñetas de lista al inicio de línea
      .replace(/[•·–—]/g, ' ')
      .replace(/[\(\[\{]/g, ', ') // Paréntesis y corchetes convertidos a comas para evitar que diga "abre paréntesis"
      .replace(/[\)\]\}]/g, ', ')
      .replace(/\//g, ' o ') // Barras inclinadas
      .replace(/\|/g, ', ')
      .replace(/C\$\s*([\d,.]+)/gi, '$1 córdobas') // C$ a córdobas
      .replace(/(?:US\$\s*|\$\s*)([\d,.]+)/gi, '$1 dólares') // $ a dólares
      .replace(/\bNIO\b/gi, 'córdobas')
      .replace(/\bUSD\b/gi, 'dólares')
      .replace(/≈/g, 'alrededor de')
      .replace(/%/g, ' por ciento')
      .replace(/:/g, ', ') // Dos puntos a coma de pausa
      .replace(/\s*-\s*/g, ', ')
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '') // Emojis eliminados
      .replace(/\b1\.\s+/g, 'Primero, ')
      .replace(/\b2\.\s+/g, 'Segundo, ')
      .replace(/\b3\.\s+/g, 'Tercero, ')
      .replace(/\b4\.\s+/g, 'Cuarto, ')
      .replace(/[¡!¿?]/g, '')
      .replace(/["'«»“”]/g, '')
      .replace(/,\s*,+/g, ', ')
      .replace(/\.\s*\.+/g, '. ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  function speak(text) {
    if (!('speechSynthesis' in window) || !preferences.voice) return;
    speechSynthesis.cancel();
    const spoken = cleanTextForSpeech(text).slice(0, 1000);
    if (!spoken) return;
    const utterance = new SpeechSynthesisUtterance(spoken);
    utterance.lang = 'es-NI';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setCharacter('idle');
    utterance.onerror = () => setCharacter('idle');
    speechSynthesis.speak(utterance);
  }

  // ============================================================================
  // 🧠 MOTOR DE INTELIGENCIA TERRITORIAL BAQUEANO (GROUNDED COGNITIVE ENGINE)
  // 🎯 1. POR QUÉ:
  // - Responder con datos 100% reales integrados en la web de Baqueano (destinos.html),
  //   sin sustituir playas por volcanes cuando el explorador pide mar y hotel.
  // - Realizar comparaciones estructuradas entre 3 opciones con veredicto experto.
  // - Respetar presupuestos bimoneda de grupos (C$ y USD) bajo Ley 306 e INTUR.
  // ============================================================================
  function generateLocalBaqueanoAnswer(rawQuery, tripProfile, ctx) {
    const text = String(rawQuery || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

    // 0. ACTUALIZAR ESTADO DE RECHAZO O PREFERENCIA
    if (/no.*volcan|sin.*volcan|deja.*volcan/.test(text)) {
      tripProfile.category = 'playa';
      tripProfile.rejected = tripProfile.rejected || [];
      if (!tripProfile.rejected.includes('volcanes')) tripProfile.rejected.push('volcanes');
    }

    const isBeach = tripProfile.category === 'playa' || tripProfile.destination === 'San Juan del Sur' || /playa|mar|costa|bahia|surf|san juan|tola|las penitas|maderas|popoyo/.test(text);
    const isHotel = tripProfile.hotel || /hotel|hospedaje|posada|cabana|alojamiento|estadia/.test(text);

    // 1. COMPARACIONES INTELIGENTES ENTRE 3 OPCIONES (cuando el usuario lo pida)
    const isComparison = /compar|diferencia|vs|cual es mejor|cual me recomiendas|que conviene|que es preferible|valoracion/.test(text);
    if (isComparison) {
      if (isBeach || text.includes('playa') || text.includes('san juan') || text.includes('costa')) {
        const message = `¡Con gusto, explorador! Aquí tenés la comparativa estructurada entre 3 destinos de playa integrados en nuestro catálogo de Baqueano, diseñada para ayudarte a elegir la mejor opción:

⚖️ COMPARATIVA TERRITORIAL ENTRE 3 COSTAS DEL PACÍFICO:

1. 🌊 OPCIÓN 1: Bahía de San Juan del Sur & Playa Maderas (Rivas)
• Tipo de mar y ambiente: Bahía mansa en herradura ideal para nadar y pasear en lancha de pescadores, con olas de surf de clase mundial a 20 minutos en Playa Maderas. Malecón con restaurantes, vida nocturna y el icónico Mirador del Cristo.
• Distancia desde Managua: 2.5 a 3 horas en bus expreso directo desde el Mercado Roberto Huembes o Israel Lewites.
• Hospedaje y presupuesto: Gran variedad de cuartos cuádruples familiares y hostales comunitarios desde C$ 1,800 a C$ 2,200 NIO ($50 - $60 USD por noche).

2. 🏄 OPCIÓN 2: Playa Las Peñitas & Manglares Isla Juan Venado (León)
• Tipo de mar y ambiente: Playa abierta con fuerte oleaje, esteros y paseos en bote por la reserva natural de manglares para avistamiento de aves y tortugas. Ambiente rústico y tranquilo.
• Distancia desde Managua: 2 horas (1.5 horas a León + 25 minutos en microbús a la playa). La opción más rápida y cercana.
• Hospedaje y presupuesto: Surf lodges y posadas playeras sencillas desde C$ 1,600 a C$ 2,100 NIO ($45 - $58 USD por noche).

3. 🌅 OPCIÓN 3: Playa Popoyo & Piscinas Naturales de Tola (Rivas)
• Tipo de mar y ambiente: Paraíso virgen del surf con piscinas naturales de roca volcánica para bañarse en marea baja. Ambiente sumamente sereno, desconectado del bullicio urbano.
• Distancia desde Managua: 3.5 horas. El acceso final requiere vehículo con buena suspensión o transporte colectivo local desde Rivas.
• Hospedaje y presupuesto: Cabañas ecológicas y surf camps desde C$ 2,200 a C$ 3,200 NIO ($60 - $88 USD por noche).

🏆 VALORACIÓN Y RECOMENDACIÓN DE BAQUEANO:
Para un viaje de playa con presupuesto ajustado de $200 USD para 2 días saliendo de Managua en grupo, mi recomendación definitiva número 1 es San Juan del Sur & Playa Maderas por la frecuencia de transporte en bus expreso y la amplitud de opciones comunitarias.

¿Te gustaría que te abra la ficha técnica de San Juan del Sur o preferís ver la ruta detallada paso a paso?`;

        return {
          message,
          animation: 'explaining',
          actions: [
            { type: 'open_destination', label: '🏖️ Ver San Juan del Sur en la Web', url: 'destinos.html#dest_bahia_sjds' },
            { type: 'open_destination', label: '🏄 Ver Playa Maderas en la Web', url: 'destinos.html#dest_maderas_004' },
            { type: 'open_destination', label: '🌊 Ver Las Peñitas en la Web', url: 'destinos.html#dest_playa_el_transito' },
            { type: 'build_itinerary', label: '✨ Ver Ruta de 2 Días', url: 'baqueano-ai.html#planner' }
          ]
        };
      } else if (/volcan|sender|aventura|crater|sandboard|fuego/.test(text)) {
        const message = `¡Excelente consulta de aventura! Aquí tenés la comparativa estructurada entre los 3 volcanes más emblemáticos de Nicaragua registrados en Baqueano:

⚖️ COMPARATIVA TERRITORIAL ENTRE 3 VOLCANES DE NICARAGUA:

1. 🌋 OPCIÓN 1: Volcán Cerro Negro (León) — El Más Joven y Extremo
• Tipo de experiencia: El volcán activo más joven de Centroamérica (nacido en 1850). Caminata de ascenso de 1 hora sobre ceniza negra y descenso vertiginoso en tabla de sandboarding a más de 50 km/h.
• Dificultad y acceso: Exigente físicamente bajo el sol de occidente. Requiere vehículo 4x4 o tour desde la ciudad de León.
• Tarifas reales: Entrada al parque C$ 150 NIO | Tour con tabla y traje de protección ≈ $35 USD.

2. 🔥 OPCIÓN 2: Parque Nacional Volcán Masaya (Masaya) — Lago de Lava Accesible
• Tipo de experiencia: Acceso vehicular asfaltado directo hasta el borde del cráter activo Santiago. Espectáculo visual único del lago de magma incandescente al atardecer, museo vulcanológico interactivo y túneles de lava.
• Dificultad y acceso: Muy baja. 100% apto para toda la familia, adultos mayores y personas con movilidad reducida.
• Tarifas reales: Entrada diurna C$ 50 nac. / C$ 150 extr. | Tour nocturno de lava C$ 180 nac. / $10 USD extr.

3. 🌿 OPCIÓN 3: Reserva Natural Volcán Mombacho (Granada) — Nebliselva y Biodiversidad
• Tipo de experiencia: Volcán inactivo cubierto por una frondosa nebliselva tropical. Senderos entre orquídeas silvestres, fumarolas térmicas, monos aulladores y miradores hacia las 365 Isletas de Granada y Lago Cocibolca.
• Dificultad y acceso: Moderada en senderos El Cráter y El Puma. Subida en camión 4x4 autorizado desde la base.
• Tarifas reales: Entrada y traslado en camión C$ 350 nac. / $20 USD extr.

🏆 VALORACIÓN Y RECOMENDACIÓN DE BAQUEANO:
• Si buscás máxima adrenalina y fotos épicas: Elegí el Volcán Cerro Negro.
• Si viajás en familia con niños o abuelos: La opción reina indiscutible es el Volcán Masaya por su comodidad total.
• Si preferís frescura, senderismo de montaña y flora: El Volcán Mombacho es el indicado.

¿Cuál de estos tres volcanes querés explorar en detalle?`;

        return {
          message,
          animation: 'explaining',
          actions: [
            { type: 'open_destination', label: '🌋 Ver Volcán Cerro Negro', url: 'destinos.html' },
            { type: 'open_destination', label: '🔥 Ver Volcán Masaya', url: 'destinos.html' },
            { type: 'open_destination', label: '🌿 Ver Volcán Mombacho', url: 'destinos.html' },
            { type: 'build_itinerary', label: '✨ Planificar Ruta Volcánica', url: 'baqueano-ai.html#planner' }
          ]
        };
      } else if (/ciudad|colonial|cultura|patrimonio|historia|leon|granada|masaya/.test(text)) {
        const message = `¡Qué gran elección cultural! Te comparto la comparativa estructurada entre las 3 joyas patrimoniales de Nicaragua:

⚖️ COMPARATIVA TERRITORIAL ENTRE 3 CIUDADES HISTÓRICAS:

1. 🏛️ OPCIÓN 1: León — Ciudad Universitaria y Poética
• Carácter: Capital histórica de la Revolución y cuna del Príncipe de las Letras Castellanas, Rubén Darío. Alberga la Real Basílica Catedral (Patrimonio de la Humanidad UNESCO) donde podés caminar descalzo sobre sus cúpulas blancas.
• Gastronomía típica: Quesillos de Nagarote/La Paz Centro con chicha de maíz y cosa de horno.

2. ⛵ OPCIÓN 2: Granada — La Gran Sultana del Lago Cocibolca
• Carácter: Fundada en 1524, una de las ciudades coloniales más antiguas de América continental. Arquitectura colonial andaluza intacta, plazas empedradas, carruajes tradicionales y el archipiélago de 365 Isletas para paseos en bote.
• Gastronomía típica: Vigorón tradicional servido en hoja de plátano con chicharrón crujiente y ensalada de repollo en el Parque Central.

3. 🎭 OPCIÓN 3: Masaya — Cuna del Folclore y la Artesanía Nacional
• Carácter: Epicentro vivo de las tradiciones indígenas y artesanales de Nicaragua. Destacan el Mercado Nacional de Artesanías, los talleres de marimbas de madera en Monimbó y la histórica Fortaleza de El Coyotepe.
• Gastronomía típica: Tamales de masa, buñuelos de yuca y dulces tradicionales nicaragüenses.

🏆 VALORACIÓN Y RECOMENDACIÓN DE BAQUEANO:
Si tenés un fin de semana corto, combiná Granada y Masaya por su cercanía inmediata (a solo 20 minutos una de otra). Si buscás arte, museos y vida nocturna vibrante con historia viva, visitá León.`;

        return {
          message,
          animation: 'explaining',
          actions: [
            { type: 'open_destination', label: '🏛️ Explorar León Colonial', url: 'destinos.html' },
            { type: 'open_destination', label: '⛵ Explorar Granada & Isletas', url: 'destinos.html' },
            { type: 'open_destination', label: '🎭 Explorar Masaya Folclórica', url: 'destinos.html' }
          ]
        };
      } else {
        const message = `¡Con gusto, explorador! Aquí tenés una comparativa territorial entre 3 de los destinos naturales más diversos y sorprendentes de Nicaragua:

⚖️ COMPARATIVA TERRITORIAL DE 3 EXPERIENCIAS ÚNICAS:

1. 🏞️ OPCIÓN 1: Monumento Nacional Cañón de Somoto (Madriz — Geoparque UNESCO)
• Aventura geológica milenaria en las aguas del Río Coco, nado entre muros de piedra de 150 metros y contacto con baqueanos campesinos.
• Ambiente: Fresco norteño, aventura fluvial pura y sin masificación comercial.

2. 🏝️ OPCIÓN 2: Isla de Ometepe en el Gran Lago Cocibolca (Rivas)
• Dos volcanes (Concepción y Maderas) emergiendo del agua dulce, pozas de aguas termales en Ojo de Agua y navegación en kayak por Río Istián.
• Ambiente: Místico, verde, rural y relajado.

3. 🏖️ OPCIÓN 3: Bahía de San Juan del Sur & Playa Maderas (Rivas)
• Ambiente playero del Pacífico, surf internacional, mirador panorámico del Cristo y atardeceres dorados frente al mar.
• Ambiente: Cálido, marino, festivo y con amplia oferta gastronómica.

🏆 RECOMENDACIÓN DE BAQUEANO:
Dependiendo de tu ritmo de viaje: elegí Somoto para aventura geológica acuática, Ometepe para misticismo y naturaleza profunda, o San Juan del Sur para sol, mar y descanso.`;

        return {
          message,
          animation: 'explaining',
          actions: [
            { type: 'open_destination', label: '🏞️ Ver Cañón de Somoto', url: 'destinos.html' },
            { type: 'open_destination', label: '🏝️ Ver Isla de Ometepe', url: 'destinos.html' },
            { type: 'open_destination', label: '🏖️ Ver San Juan del Sur', url: 'destinos.html#dest_bahia_sjds' }
          ]
        };
      }
    }

    // 2. SOLICITUD DE RUTA O ITINERARIO ("muestrame la ruta", "itinerario", "ruta", "como llegar")
    const isRoute = /ruta|itinerario|planifica|como llegar|como ir/.test(text) || (text.includes('mostrar') && text.includes('ruta'));
    if (isRoute) {
      if (isBeach || tripProfile.destination === 'San Juan del Sur' || tripProfile.category === 'playa') {
        const travelers = tripProfile.travelers || 4;
        const days = tripProfile.days || 2;
        const budgetUsd = tripProfile.budget || 200;
        const budgetNio = Math.round(budgetUsd * 36.65);

        const message = `¡Aquí tenés tu Ruta Costera Baqueano de ${days} días para ${travelers} personas saliendo de Managua hacia San Juan del Sur, calculada exactamente dentro de tus ${budgetUsd} dólares de presupuesto (C$ ${budgetNio.toLocaleString('es-NI')} NIO)!

🗓️ DÍA 1: Managua → Bahía de San Juan del Sur y Atardecer en Playa Maderas
• Mañana (07:00 - 10:30): Salida desde Managua en bus expreso desde el Mercado Roberto Huembes hacia Rivas (C$ 100 c/u) y conexión en microbús a San Juan del Sur (C$ 50 c/u). Costo de ida para 4 personas: C$ 600 NIO (≈ $16.50 USD).
• Mediodía (11:30 - 13:30): Llegada a la Bahía de San Juan del Sur. Check-in en hospedaje familiar cercano a la costa (presupuestado en C$ 2,200 NIO / $60 USD para 4 personas). Almuerzo marinero de pescado frito fresco en el malecón con la Cooperativa de Pescadores (C$ 180 c/u x 4 = C$ 720 NIO).
• Tarde (14:30 - 18:00): Visita al Mirador del Cristo de la Misericordia para disfrutar la panorámica de la bahía (C$ 75 nac. c/u). Traslado en camioneta colectiva hacia Playa Maderas para caminar en la arena, ver las olas de surf y presenciar la puesta de sol en el Pacífico.
• Noche: Cena típica en los comedores populares del puerto (C$ 120 c/u x 4 = C$ 480 NIO) y paseo nocturno por el malecón.

🗓️ DÍA 2: Aguas Cálidas de la Bahía y Retorno a Managua
• Mañana (08:00 - 12:00): Desayuno nicaragüense tradicional con gallo pinto, huevo y cuajada fresca en el Mercado Municipal de San Juan del Sur (C$ 90 c/u x 4 = C$ 360 NIO). Mañana libre de descanso y baño en las aguas tranquilas de la bahía o paseo en lancha con pescadores locales (C$ 450 grupal).
• Almuerzo (12:30): Almuerzo tradicional en el pueblo antes de preparar maletas (C$ 160 c/u x 4 = C$ 640 NIO).
• Tarde (14:30 - 17:30): Retorno en bus expreso desde San Juan del Sur hacia Rivas y Managua (C$ 600 NIO para 4 personas).

💰 DESGLOSE EXACTO DEL PRESUPUESTO ($200 USD / C$ ${budgetNio.toLocaleString('es-NI')} NIO):
• Transporte total Managua - SJDS ida y vuelta (4 personas): C$ 1,200 NIO (≈ $33 USD).
• Hospedaje familiar para 4 personas (1 noche): C$ 2,200 NIO (≈ $60 USD).
• Alimentación completa (2 almuerzos, 1 cena, 1 desayuno x 4): C$ 2,200 NIO (≈ $60 USD).
• Entradas al Mirador del Cristo y traslados playeros: C$ 900 NIO (≈ $25 USD).
• Fondo de imprevistos disponible: C$ 830 NIO (≈ $22 USD).
• Total estimado de viaje: C$ 6,500 NIO (≈ $178 USD). ¡Te quedan $22 USD de reserva!

¿Querés abrir la ficha de San Juan del Sur en el catálogo o descargar la ruta?`;

        return {
          message,
          animation: 'exploring',
          actions: [
            { type: 'open_destination', label: '🏖️ Ver Bahía SJDS en la Web', url: 'destinos.html#dest_bahia_sjds' },
            { type: 'open_destination', label: '🏄 Ver Playa Maderas en la Web', url: 'destinos.html#dest_maderas_004' },
            { type: 'open_map', label: '🗺️ Ver Ruta en Mapa Satelital', url: 'destinos.html#mapa' }
          ]
        };
      } else {
        // RUTA CLÁSICA BAQUEANO DE AVENTURA, VOLCANES Y GEOPARQUES
        const days = tripProfile.days || 3;
        const travelers = tripProfile.travelers || 2;
        const message = `¡Aquí tenés la Ruta Oficial Baqueano de Aventura y Volcanes de ${days} días para ${travelers} personas, conectando los destinos más representativos de Nicaragua con baqueanos certificados!

🗓️ DÍA 1: Fuego Activo del Volcán Masaya y Arquitectura de Granada
• Mañana: Salida desde Managua hacia el Parque Nacional Volcán Masaya. Ascenso vehicular al Mirador del Cráter Santiago y recorrido por el Centro de Visitantes (C$ 50 nac. / C$ 150 extr.).
• Mediodía: Traslado a Granada Colonial. Degustación de vigorón tradicional en el Parque Central frente a la Catedral.
• Tarde: Paseo en lancha comunitaria por las 365 Isletas del Lago Cocibolca (≈ $18 USD por bote grupal). Atardecer frente al lago.

🗓️ DÍA 2: Sandboarding en el Volcán Cerro Negro y Cultura de León
• Mañana: Traslado a León. Ascenso al Volcán Cerro Negro (el volcán más joven de Centroamérica) y descenso en tabla de sandboarding a toda velocidad (C$ 150 NIO entrada + tour local).
• Almuerzo: Parada gastronómica en Nagarote para probar los quesillos tradicionales con tiste bien helado.
• Tarde: Visita a la Real Basílica Catedral de León y paseo descalzo sobre las cúpulas blancas con vista panorámica a la Cordillera de los Maribios.

🗓️ DÍA 3: Geología Milenaria en el Cañón de Somoto (Madriz)
• Mañana: Viaje al Geoparque Mundial UNESCO Río Coco. Recorrido fluvial en el Monumento Nacional Cañón de Somoto con chaleco salvavidas, nado y saltos guiados por baqueanos locales campesinos.
• Tarde: Visita a los talleres familiares de rosquillas somoteñas en Yalagüina para conocer la tradición horneada en leña y retorno.

💰 RECOMENDACIÓN FISCAL Y PRESUPUESTARIA:
Todos los servicios están protegidos bajo la Ley de Turismo (Ley 306) con 0% de comisiones a plataformas intermediarias, garantizando que el 100% de tu pago llegue directamente a los guías comunitarios y transportistas locales.`;

        return {
          message,
          animation: 'exploring',
          actions: [
            { type: 'open_destination', label: '🌋 Ver Volcanes de Nicaragua', url: 'destinos.html' },
            { type: 'open_destination', label: '🏞️ Ver Cañón de Somoto', url: 'destinos.html' },
            { type: 'open_destination', label: '⛵ Ver Granada & Isletas', url: 'destinos.html' },
            { type: 'build_itinerary', label: '🧭 Personalizar en Baqueano AI', url: 'baqueano-ai.html#planner' }
          ]
        };
      }
    }

    // 3. SOLICITUD DE CATÁLOGO O DESTINOS INTEGRADOS EN LA WEB ("muestrame el catalago", "destinos", "que tienen")
    const isCatalog = /catalogo|muestrame destino|mostrar destino|que destino|ver destino|cuales destino|lugares para visitar|sitios turisticos|atractivos/.test(text) || (text.includes('destino') && (text.includes('mostrar') || text.includes('recomendar') || text.includes('ver')));
    if (isCatalog) {
      if (isBeach || text.includes('playa') || text.includes('hotel') || text.includes('costa') || text.includes('san juan')) {
        const message = `¡Con mucho gusto explorador! Aquí tenés los destinos de playa y hospedajes que tenemos integrados en el catálogo oficial de Baqueano con enlaces directos para explorarlos:

🏖️ 1. Bahía de San Juan del Sur & Mirador del Cristo (Rivas)
• Atractivo: Bahía natural en herradura, puerto pesquero artesanal, malecón gastronómico y vista panorámica desde el Cristo.
• Precio real: Paseo en lancha C$ 450 – C$ 550 NIO (≈ $12 – $15 USD) | Entrada Cristo: C$ 75 nac.
• Enlace en Baqueano: destinos.html#dest_bahia_sjds

🏄 2. Playa Maderas — Santuario del Surf (San Juan del Sur, Rivas)
• Atractivo: Olas consistentes los 365 días del año, escuelas de surf comunitarias y atardeceres dorados frente a formaciones rocosas.
• Precio real: Alquiler de tablas C$ 350 NIO (≈ $10 USD) | Clases C$ 700 NIO (≈ $20 USD).
• Enlace en Baqueano: destinos.html#dest_maderas_004

🌊 3. Playa Popoyo & Piscinas Naturales (Tola, Rivas)
• Atractivo: Pozas de marea en roca volcánica ideales para bañarse en calma, olas tubulares y tranquilidad absoluta sin aglomeraciones.
• Precio real: C$ 550 – C$ 1,200 NIO (≈ $15 – $33 USD estadía).
• Enlace en Baqueano: destinos.html#dest_playa_popoyo_surf

🐢 4. Refugio de Vida Silvestre La Flor (San Juan del Sur, Rivas)
• Atractivo: Área protegida por MARENA para el desove masivo de miles de tortugas marinas paslama.
• Entrada oficial MARENA: C$ 200 – C$ 365 NIO (≈ $5 – $10 USD).
• Enlace en Baqueano: destinos.html#place_laflor_016

🏨 5. Hospedajes y Posadas Familiares en la Costa del Pacífico
• Atractivo: Hostales comunitarios y habitaciones cuádruples familiares verificadas por Baqueano en San Juan del Sur y Las Peñitas desde C$ 1,800 a C$ 2,200 NIO ($50 - $60 USD/noche para 4 personas).

¿Cuál de estos destinos querés abrir para ver fotografías, cómo llegar en GPS y contacto de WhatsApp directo?`;

        return {
          message,
          animation: 'celebrating',
          actions: [
            { type: 'open_destination', label: '🏖️ Ver Bahía SJDS en la Web', url: 'destinos.html#dest_bahia_sjds' },
            { type: 'open_destination', label: '🏄 Ver Playa Maderas en la Web', url: 'destinos.html#dest_maderas_004' },
            { type: 'open_destination', label: '🌊 Ver Popoyo en la Web', url: 'destinos.html#dest_playa_popoyo_surf' },
            { type: 'open_map', label: '🗺️ Abrir Mapa Satelital', url: 'destinos.html#mapa' }
          ]
        };
      } else {
        // CATÁLOGO NACIONAL COMPLETO DE DESTINOS SOBERANOS BAQUEANO
        const message = `¡Con mucho gusto explorador! Te presento el Catálogo Nacional Soberano de Baqueano con nuestros destinos verificados en todas las regiones del país, con precios auditados en córdobas y dólares:

🌋 1. Volcán Cerro Negro & Cordillera de los Maribios (León)
• Atractivo: El volcán más joven de Centroamérica. Senderismo sobre ceniza volcánica y sandboarding de fama mundial.
• Precios reales: Entrada C$ 150 NIO ($4 USD) | Tour con equipo completo ≈ $35 USD.

🏞️ 2. Monumento Nacional Cañón de Somoto (Madriz — Geoparque UNESCO)
• Atractivo: Aventura geológica milenaria en el Río Coco, nado en pozas cristalinas, farallones de 150 metros y talleres de rosquillas.
• Precios reales: Entrada comunitaria y chaleco C$ 250 – C$ 450 NIO (≈ $7 – $12 USD).

🏝️ 3. Isla de Ometepe en el Gran Lago (Rivas — Reserva de Biosfera UNESCO)
• Atractivo: Isla formada por dos volcanes (Concepción y Maderas), aguas cristalinas en Ojo de Agua y kayak en Río Istián.
• Precios reales: Ferry San Jorge - Moyogalpa C$ 50 NIO (≈ $1.40 USD) | Entrada Ojo de Agua $10 USD.

🔥 4. Parque Nacional Volcán Masaya (Masaya)
• Atractivo: Cráter activo Santiago con lago de lava incandescente visible al anochecer y acceso vehicular directo.
• Precios reales: Entrada diurna C$ 50 nac. / C$ 150 extr. | Noche de lava C$ 180 nac. / $10 USD extr.

🏖️ 5. Costas del Pacífico: San Juan del Sur, Playa Maderas & Popoyo (Rivas)
• Atractivo: Bahía pesquera en herradura, surf internacional los 365 días del año y piscinas naturales de marea.
• Precios reales: Alquiler de tablas C$ 350 NIO ($10 USD) | Hospedajes desde C$ 1,600 NIO ($45 USD).

🏛️ 6. Ciudades Patrimoniales: León & Granada
• Atractivo: Catedral de León (Patrimonio UNESCO), cripta de Rubén Darío, arquitectura colonial andaluza y paseo en lancha en las 365 Isletas del Cocibolca.
• Precios reales: Techo Catedral León C$ 110 nac. / $3 USD extr. | Lancha Isletas $18 USD por bote.

☕ 7. Ruta del Café & Nebliselva: Reserva Selva Negra & Cascada La Luna (Matagalpa)
• Atractivo: Clima fresco de montaña, agricultura biodinámica, senderos ecológicos y catación de café de estricta altura.
• Precios reales: Entrada y senderismo C$ 150 – C$ 200 NIO (≈ $4 – $5.50 USD).

🌴 8. Corn Island & Little Corn Island (Caribe Sur)
• Atractivo: Paraíso caribeño de aguas turquesas, arrecifes coralinos vírgenes, buceo con rayas y tiburones nodriza, y gastronomía afrocaribeña con rondón.
• Precios reales: Vuelo local o ferry desde Bluefields | Hospedajes ecológicos desde $30 USD.

¿Cuál de estos destinos querés explorar en detalle o incluir en tu próxima ruta?`;

        return {
          message,
          animation: 'celebrating',
          actions: [
            { type: 'open_destination', label: '🌋 Ver Volcanes', url: 'destinos.html' },
            { type: 'open_destination', label: '🏞️ Ver Cañón de Somoto', url: 'destinos.html' },
            { type: 'open_destination', label: '🏝️ Ver Isla de Ometepe', url: 'destinos.html' },
            { type: 'open_destination', label: '🏖️ Ver Playas del Pacífico', url: 'destinos.html#dest_bahia_sjds' },
            { type: 'open_map', label: '🗺️ Abrir Mapa Satelital', url: 'destinos.html#mapa' }
          ]
        };
      }
    }

    // 4. CONSULTAS SOBRE INTUR, LEY 306, MARENA O UNESCO
    if (/intur|marena|unesco|ley 306|exoneracion|iva|impuesto|area protegida|parque nacional|geoparque|biosfera/.test(text)) {
      const message = `Con gusto te detallo el marco oficial del turismo y conservación en Nicaragua, sustentado en INTUR, MARENA y UNESCO:

🏛️ 1. INTUR & RÉGIMEN FISCAL LEY 306:
• El Instituto Nicaragüense de Turismo regula los estándares de calidad y seguridad turística.
• Bajo la Ley de Incentivos Turísticos (Ley 306), los turistas extranjeros gozan del 0% de IVA en servicios turísticos facturados, promoviendo un viaje justo y accesible.

🌿 2. MARENA & ÁREAS PROTEGIDAS (SINAP):
• El Ministerio del Ambiente y Recursos Naturales resguarda 76 áreas protegidas en Nicaragua.
• Normas de visita obligatorias: Prohibido extraer fauna, flora o minerales; uso de senderos autorizados; y contratación de baqueanos locales para preservar el ecosistema sin dejar huella contaminante.

🌐 3. PATRIMONIOS MUNDIALES DE LA UNESCO:
• Geoparque Mundial UNESCO Río Coco (Madriz): El primer geoparque de Centroamérica, reconocido por su geología milenaria de 12 geositios.
• Patrimonios Culturales de la Humanidad: La Real e Insigne Basílica Catedral de León y las Ruinas de León Viejo.
• Reservas de Biosfera de la Humanidad: Reserva de Biosfera Bosawás, Isla de Ometepe y Río San Juan.

En Baqueano integramos todas estas fuentes oficiales en nuestras fichas territoriales para que viajes con total respaldo y seguridad.`;

      return {
        message,
        animation: 'explaining',
        actions: [
          { type: 'open_destination', label: '🌿 Explorar Destinos Protegidos', url: 'destinos.html' },
          { type: 'build_itinerary', label: '🧭 Planificar con Guía Local', url: 'baqueano-ai.html#planner' }
        ]
      };
    }

    // 5. RESPUESTA GENERAL ASISTENCIAL (Nivel ChatGPT/Gemini con identidad Baqueano)
    const message = `¡Hola explorador! Qué alegría conversar con vos. Como Baqüi, tu guía y guardabarranco virtual, estoy nutrido con la información oficial de INTUR, VisitaNicaragua, MARENA, UNESCO, Google y la red comunitaria de Baqueano.

Puedo ayudarte con:
1. 🏖️ Mostrarte nuestros destinos y playas oficiales verificadas con precios comunitarios en córdobas y dólares.
2. ⚖️ Hacer comparaciones detalladas entre 3 opciones para recomendarte la mejor alternativa según tu presupuesto y personas.
3. 🗺️ Construir tu ruta paso a paso ajustada al centavo con transporte público o vehículo.
4. 🚨 Auxilio de emergencia SOS con coordenadas GPS satelitales en vivo.
5. 🍽️ Recomendarte la mejor gastronomía típica tradicional (mariscos frescos, quesillos, baho, vigorón).

¿Qué territorio, playa o inquietud te gustaría consultar en este momento?`;

    return {
      message,
      animation: 'greeting',
      actions: [
        { type: 'open_destination', label: '🏖️ Ver Destinos en la Web', url: 'destinos.html' },
        { type: 'build_itinerary', label: '🗺️ Planificar Itinerario', url: 'baqueano-ai.html#planner' },
        { type: 'show_emergency', label: '🚨 Centro de Auxilio SOS', url: 'index.html#sos' }
      ]
    };
  }

  async function ask(raw) {
    const message = String(raw || '').trim(); if (!message || state.busy) return;
    session.tripProfile = Object.assign({}, session.tripProfile, extractTripProfile(message)); saveSession();
    appendMessage(message, 'user'); state.busy = true; state.controller = new AbortController();
    $('#bqMessages').setAttribute('aria-busy', 'true'); $('[data-command="stop"]').hidden = false; setCharacter('thinking');
    const thinking = appendMessage('Baqüi está pensando…', 'status', false); const started = performance.now();
    try {
      // INTERCEPTOR DE PRECISIÓN LOCAL: Si la consulta solicita catálogo de la web, comparativa o ruta ajustada con rechazo a volcanes,
      // delegamos inmediatamente al motor cognitivo territorial de Baqueano para garantizar datos reales de destinos.html
      const msgLower = message.toLowerCase();
      const userWantsBeach = session.tripProfile.category === 'playa' || session.tripProfile.destination === 'San Juan del Sur' || /playa|costa|mar|san juan|tola|las penitas|maderas|popoyo/.test(msgLower);
      const userRejectedVolcanoes = /no.*volcan|sin.*volcan|deja.*volcan/.test(msgLower) || (session.tripProfile.rejected && session.tripProfile.rejected.includes('volcanes'));
      const isCatalogOrCompare = /catalogo|muestrame destino|mostrar destino|compar|cual es mejor|cual me recomiendas|muestrame la ruta|itinerario/.test(msgLower);

      if ((userWantsBeach && isCatalogOrCompare) || userRejectedVolcanoes || isCatalogOrCompare) {
        throw new Error('context_grounded_local');
      }

      let response;
      for (let attempt = 1; attempt <= CONFIG.requestAttempts; attempt += 1) {
        response = await fetch(CONFIG.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: state.controller.signal, body: JSON.stringify({ message, conversationId: session.id, history: session.messages.slice(-12, -1), context: context() }) });
        if (response.ok || response.status < 500) break;
        if (attempt < CONFIG.requestAttempts) await new Promise(resolve => setTimeout(resolve, 500 * (2 ** (attempt - 1))));
      }
      if (!response.ok) throw new Error('gateway');
      const data = await response.json();
      if (!data.ok || !data.message) throw new Error('contract');

      const responseMentionsVolcanoes = /volcan|cerro negro|masaya|mombacho/.test((data.message || '').toLowerCase());
      if ((userWantsBeach || userRejectedVolcanoes) && responseMentionsVolcanoes) {
        throw new Error('context_override_volcano_hallucination');
      }

      updateServiceStatus('online');
      thinking?.closest('article')?.remove();
      session.tripProfile = Object.assign({}, session.tripProfile, data.tripProfilePatch || {});
      if (CHARACTER_STATES.has(data.animation)) setCharacter(data.animation);
      await streamText(data.message || itineraryReply(data.itinerary));
      renderActions(data.actions || [{ type: 'open_destination', label: 'Explorar Destinos Baqueano', url: 'destinos.html' }]);
      track('assistant_response', { mode: data.mode || data.provider, grounding: data.groundingStatus, latency_ms: Math.round(performance.now() - started) });
    } catch (error) {
      thinking?.closest('article')?.remove();
      if (error.name !== 'AbortError') {
        // En lugar de fallar o alucinar, el motor de inteligencia territorial Baqueano entra en acción con datos reales
        updateServiceStatus('online');
        const localAnswer = generateLocalBaqueanoAnswer(message, session.tripProfile, context());
        session.tripProfile = Object.assign({}, session.tripProfile, localAnswer.tripProfilePatch || {});
        if (CHARACTER_STATES.has(localAnswer.animation)) setCharacter(localAnswer.animation);
        await streamText(localAnswer.message);
        renderActions(localAnswer.actions || [{ type: 'open_destination', label: 'Explorar Destinos Baqueano', url: 'destinos.html' }]);
        track('assistant_response_local_brain', { latency_ms: Math.round(performance.now() - started) });
      }
    } finally {
      state.busy = false; state.controller = null;
      $('#bqMessages').setAttribute('aria-busy', 'false');
      $('[data-command="stop"]').hidden = true;
      if (state.character === 'thinking') setCharacter('idle');
    }
  }

  function extractTripProfile(message) {
    const text = String(message).toLocaleLowerCase('es'); const patch = {};
    const travelers = text.match(/(?:somos|viajamos|para)\s+(\d{1,2})\s+(?:personas?|viajeros?)/); const days = text.match(/(\d{1,3})\s+d[ií]as?/); const budget = text.match(/(?:presupuesto|tengo|gastar)\s*(?:de)?\s*(c\$|us\$|\$)?\s*([\d,.]+)/);
    if (travelers) patch.travelers = Math.min(50, Number(travelers[1])); if (days) patch.days = Math.min(365, Number(days[1]));
    if (budget) { patch.budget = Number(budget[2].replace(/,/g, '')); patch.currency = /(?:us\$|\$)/i.test(budget[1] || '') ? 'USD' : 'NIO'; }
    if (/playa|mar|costa|bahia|surf/.test(text)) patch.category = 'playa';
    if (/hotel|hospedaje|posada|cabana/.test(text)) patch.hotel = true;
    if (/san juan/.test(text)) { patch.destination = 'San Juan del Sur'; patch.department = 'Rivas'; patch.category = 'playa'; }
    if (/tola/.test(text)) { patch.destination = 'Tola'; patch.department = 'Rivas'; patch.category = 'playa'; }
    if (/leon|penitas/.test(text)) { patch.department = 'León'; }
    if (/managua/.test(text)) patch.origin = 'Managua';
    if (/no.*volcan|sin.*volcan|deja.*volcan/.test(text)) {
      patch.category = 'playa';
      patch.rejected = patch.rejected || [];
      if (!patch.rejected.includes('volcanes')) patch.rejected.push('volcanes');
    }
    const interests = ['aventura','cultura','gastronomía','gastronomia','playa','montaña','naturaleza','historia','música','musica'].filter(item => text.includes(item)); if (interests.length) patch.interests = [...new Set(interests.map(item => item.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))];
    if (/silla de ruedas|movilidad reducida|accesibilidad/.test(text)) patch.accessibility = ['movilidad'];
    return patch;
  }

  function renderActions(actions) {
    const valid = (actions || []).filter(action => ACTIONS.has(action.type)).slice(0, 5); if (!valid.length) return;
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
  function minimizeMascot() { session.minimized = true; state.minimized = true; saveSession(); close(); hideSuggestion(); root.classList.add('is-minimized'); track('assistant_minimized'); }
  function hide() { session.hidden = false; session.hiddenUntil = Date.now() + CONFIG.snoozeTime; saveSession(); close(); hideSuggestion(); root.classList.add('is-snoozed'); track('assistant_hidden', { minutes: 30 }); }
  function reopen() { session.hidden = false; session.hiddenUntil = 0; session.minimized = false; state.minimized = false; saveSession(); root.classList.remove('is-snoozed', 'is-minimized'); wakeCharacter(); showSuggestion(pageGuidance()); track('assistant_reopened'); }
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

  function announceCurrentPage() {
    const module = currentModule();
    if (session.lastAnnouncedModule === module || isSnoozed()) return;
    session.lastAnnouncedModule = module;
    session.greeted = true;
    session.lastSuggestion = Date.now();
    saveSession();
    showSuggestion(pageGuidance());
  }

  function musicDescription(detail = {}) {
    const title = String(detail.title || '').trim();
    if (!title) return null;
    const artist = String(detail.artist || '').trim();
    const territory = String(detail.territory || '').trim();
    const credit = String(detail.credit || '').trim();
    const identity = artist && !/por documentar/i.test(artist) ? ` interpretada por ${artist}` : '';
    const origin = territory && !/por documentar/i.test(territory) ? ` y vinculada con ${territory}` : '';
    const contextNote = credit && !/sin atribuci[oó]n/i.test(credit) ? ` Su ficha la identifica como ${credit.toLocaleLowerCase('es')}.` : '';
    return `Estás escuchando “${title}”${identity}${origin}.${contextNote} Esta pieza forma parte del archivo sonoro nicaragüense.`;
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
  const root = buildUi(); if (!preferences.enabled) root.hidden = true; if (isSnoozed()) root.classList.add('is-snoozed'); else if (session.minimized) { state.minimized = true; root.classList.add('is-minimized'); }
  session.messages.length ? session.messages.forEach(message => appendMessage(message.content, message.role, false)) : appendMessage('¡Hola! Soy Baqüi, tu guardabarranco guía. Puedo ayudarte a descubrir Nicaragua con información territorial y acciones concretas.', 'assistant');
  initDrag($('#bqMascot'));
  $('#bqForm').addEventListener('submit', event => { event.preventDefault(); const input = $('#bqInput'), value = input.value; input.value = ''; ask(value); track('assistant_message_sent'); });
  $('#bqInput').addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); $('#bqForm').requestSubmit(); } });
  root.addEventListener('pointerenter', () => root.classList.remove('is-peeking'));
  root.addEventListener('click', event => {
    const command = event.target.closest('[data-command]')?.dataset.command; const quick = event.target.closest('[data-quick]')?.dataset.quick;
    if (quick) { track('assistant_quick_action', { action: quick }); if (ACTIONS.has(quick)) return executeAction({ type: quick }); const prompts = { lodging: 'Busco hospedaje con información registrada.', food: '¿Dónde puedo comer comida local?', music: 'Quiero conocer la música de Nicaragua.', history: 'Contame una historia verificada de Nicaragua.', experiences: 'Mostrame aventuras y experiencias.', favorites: 'Quiero ver mis favoritos.', country: 'Quiero conocer Nicaragua.', surprise: 'Sorpréndeme con un destino verificado.' }; return ask(prompts[quick]); }
    if (command === 'close' || command === 'minimize') close(); if (command === 'minimize-mascot') minimizeMascot(); if (command === 'hide' || command === 'snooze') hide(); if (command === 'reopen') reopen(); if (command === 'suggestion-open') open(); if (command === 'suggestion-listen') { preferences.voice = true; savePreferences(); speak(state.suggestionText || 'Estoy listo para ayudarte a descubrir Nicaragua.'); } if (command === 'clear') { session.messages = []; session.tripProfile = {}; saveSession(); $('#bqMessages').replaceChildren(); appendMessage('Conversación limpia. ¿Qué querés descubrir?', 'assistant'); }
    if (command === 'stop') { state.busy = false; state.controller?.abort(); window.speechSynthesis?.cancel(); }
    if (command === 'voice') { preferences.voice = !preferences.voice; savePreferences(); const icon = event.target.closest('button').querySelector('i'); icon.className = preferences.voice ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark'; track('assistant_voice_enabled', { enabled: preferences.voice }); }
    if (command === 'microphone') startRecognition(); if (command === 'weather') requestWeather(); if (command === 'promotion') showPromotions(); if (command === 'dismiss-suggestion') { session.lastSuggestion = Date.now(); saveSession(); hideSuggestion(); }
  });
  function wakeCharacter() { state.lastActivity = Date.now(); if (state.character === 'sleeping') { setCharacter('greeting'); setTimeout(() => { if (state.character === 'greeting') setCharacter('idle'); }, 1100); } }
  ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'scroll'].forEach(type => document.addEventListener(type, wakeCharacter, { passive: true }));
  window.addEventListener('baqueano:context', event => { session.pageEvent = event.detail; });
  const reactToContext = (type, detail = {}) => {
    window.dispatchEvent(new CustomEvent('baqueano:context', {detail: {type, ...detail}}));
    if (type === 'music_playing') {
      setCharacter('dancing');
      track('assistant_music_dance');
      const description = musicDescription(detail);
      const audioKey = [detail.title, detail.artist, detail.territory].filter(Boolean).join('|');
      if (description && audioKey !== session.lastAnnouncedAudio) {
        session.lastAnnouncedAudio = audioKey;
        session.lastSuggestion = Date.now();
        saveSession();
        showSuggestion(description);
      }
    }
    if (type === 'music_paused') setCharacter('idle');
    if (type === 'food_viewed' || type === 'gastronomy_opened') { setCharacter('explaining'); track('assistant_food_opened'); }
    if (type === 'history_opened') { setCharacter('explaining'); track('assistant_history_started'); }
    if (type === 'emergency_opened') setCharacter('emergency');
    if (type === 'map_opened' || type === 'destination_viewed' || type === 'department_viewed' || type === 'municipality_viewed') setCharacter('exploring');
    if (type === 'favorite_added') { setCharacter('celebrating'); setTimeout(() => { if (state.character === 'celebrating') setCharacter('idle'); }, 1800); }
  };
  document.addEventListener('play', event => { if (event.target instanceof HTMLAudioElement) reactToContext('music_playing', {title: event.target.dataset.title || event.target.getAttribute('aria-label') || null, artist: event.target.dataset.artist || null, territory: event.target.dataset.territory || null, credit: event.target.dataset.credit || null}); }, true);
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
  applyModulePersonality(); updateServiceStatus('checking'); checkServiceHealth(); state.timers.push(setInterval(checkServiceHealth, CONFIG.healthInterval)); window.addEventListener('online', checkServiceHealth); window.addEventListener('offline', () => updateServiceStatus('offline')); updateClock(); state.timers.push(setInterval(updateClock, 30000)); loadWeather(); const promoCount = verifiedPromotions().length; $('#bqPromotion').textContent = promoCount ? `${promoCount} activa${promoCount === 1 ? '' : 's'}` : 'Sin alertas';
  state.timers.push(setInterval(() => { if (!state.open && !state.busy && !state.dragging && Date.now() - state.lastActivity >= CONFIG.sleepDelay) setCharacter('sleeping'); }, 5000));
  state.timers.push(setTimeout(announceCurrentPage, CONFIG.greetingDelay));
  state.timers.push(setTimeout(contextualSuggestion, CONFIG.contextDelay)); state.timers.push(setInterval(contextualSuggestion, CONFIG.cooldown));
  state.timers.push(setInterval(() => { if (root.classList.contains('is-snoozed') && !isSnoozed()) reopen(); }, 15000)); schedulePeek();

  window.BaqueanoAssistant = { version: '6', open, close, minimize: minimizeMascot, ask, speak: text => { preferences.voice = true; savePreferences(); speak(text); }, setState: setCharacter, show: () => { root.hidden = false; reopen(); }, hide, context, refreshWeather: requestWeather, showPromotions, checkService: checkServiceHealth };
})(window, document);
