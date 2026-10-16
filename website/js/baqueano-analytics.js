/**
 * 🎯 POR QUÉ: requisito 19 del checklist 20/20 — analítica REAL y respetuosa.
 *   Antes la web declaraba un measurementId de GA4 que nunca se inicializaba: no
 *   llegaba ningún dato. Una sola arquitectura evita duplicar herramientas: los
 *   eventos van a la ingesta propia de Supabase (RPC public.track_event), que
 *   valida en el servidor el catálogo, la plataforma, el tamaño y un límite de
 *   300 eventos/hora por visitante; el usuario lo fija auth.uid(), nunca el cliente.
 * ⚙️ CÓMO: este módulo SOLO se carga cuando BaqueanoConsent.analytics === true
 *   (global-injector.js). Si la persona retira el consentimiento deja de enviar.
 *   Usa un identificador anónimo aleatorio (no deriva de datos personales) y una
 *   sesión por pestaña. Nunca envía contraseñas, tokens, correos, teléfonos,
 *   texto de búsqueda ni contenido de BAQUI: solo nombres de evento, ruta,
 *   idioma, ids públicos de entidad y métricas numéricas.
 * 📦 QUÉ: window.BaqueanoAnalytics.track(nombreCanonico, datos) + eventos
 *   automáticos: page_view, whatsapp_click, sos_click, language_change,
 *   favorite, search, business_register, testimonial_submit, baqui_message,
 *   itinerary_generate, phone_click, directions_click (enlaces de Google Maps /
 *   "Cómo llegar"), map_open (mapa.html) y place_view/qr_generated por evento
 *   'baqueano:impact' { event, entityType, entityId, departmentId } — BAQUEANO
 *   IMPACTO: alimentan la vista impact_events (embudo descubrir → contactar).
 * 📞 CONTACTO DIRECTO (2026-10-14): BAQUEANO no gestiona reservas; el visitante contacta al
 *   propietario. Un WhatsApp, llamada o correo dentro de un elemento con data-business-id se
 *   registra con la RPC public.track_commercial_action (fila en commercial_actions + evento
 *   whatsapp_clicked/phone_clicked/inquiry_sent), que el Ops Center cuenta en «Contactos
 *   directos». Sin data-business-id sigue el evento simple de siempre (sin doble conteo).
 */
(function (window, document) {
  'use strict';
  if (window.BaqueanoAnalytics) return;

  var ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/rest/v1/rpc/track_event';
  var COMMERCIAL_ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/rest/v1/rpc/track_commercial_action';
  var PUBLIC_KEY = 'sb_publishable_q7ZhqRIRjlerZK7WOu_Qxw_X_AqXV1d';
  // Nombre canónico del checklist → tipo de evento del catálogo en Supabase.
  var EVENT_MAP = {
    page_view: 'page_viewed',
    search: 'search_performed',
    destination_view: 'destination_viewed',
    business_view: 'business_viewed',
    place_view: 'place_viewed',
    map_open: 'map_opened',
    directions_click: 'directions_clicked',
    qr_generated: 'qr_generated',
    itinerary_generate: 'itinerary_generated',
    baqui_message: 'baqui_message_sent',
    login: 'login_completed',
    favorite: 'favorite_added',
    reservation_start: 'reservation_started',
    reservation_complete: 'booking_requested',
    whatsapp_click: 'whatsapp_clicked',
    phone_click: 'phone_clicked',
    sos_click: 'sos_clicked',
    language_change: 'language_changed',
    testimonial_submit: 'testimonial_submitted',
    business_register: 'business_registration_submitted',
    consent_update: 'consent_updated'
  };
  // `signup` lo registra el servidor (user_registered) al crear el perfil verificado.
  var SAFE_META_KEYS = ['latency_ms', 'count', 'mode', 'source', 'result_count', 'query_length', 'step', 'intent', 'people', 'lead_days'];

  function consentGranted() {
    return Boolean(window.BaqueanoConsent && window.BaqueanoConsent.analytics);
  }
  function storage(kind) {
    try { return window[kind]; } catch (_) { return null; }
  }
  function randomId() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
  }
  function anonymousId() {
    var ls = storage('localStorage');
    var id = ls && ls.getItem('baqueano_anonymous_id');
    if (!id) { id = 'web-' + randomId(); if (ls) ls.setItem('baqueano_anonymous_id', id); }
    return id;
  }
  function sessionId() {
    var ss = storage('sessionStorage');
    var id = ss && ss.getItem('baqueano_session_id');
    if (!id) { id = 'ses-' + randomId(); if (ss) ss.setItem('baqueano_session_id', id); }
    return id;
  }
  function language() {
    var lang = (window.BaqueanoLanguage && window.BaqueanoLanguage.getLanguage && window.BaqueanoLanguage.getLanguage()) || document.documentElement.lang || 'es';
    return String(lang).slice(0, 2).toLowerCase();
  }
  function utm() {
    try {
      var params = new URLSearchParams(window.location.search);
      var out = {};
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) { if (params.get(k)) out[k] = params.get(k).slice(0, 150); });
      if (document.referrer) { try { out.referrer_domain = new URL(document.referrer).hostname; } catch (_) { /* referrer opaco */ } }
      out.landing_path = window.location.pathname;
      return out;
    } catch (_) { return null; }
  }
  function safeMeta(meta) {
    var out = {};
    SAFE_META_KEYS.forEach(function (k) {
      if (meta && meta[k] !== undefined && meta[k] !== null) out[k] = typeof meta[k] === 'number' ? meta[k] : String(meta[k]).slice(0, 60);
    });
    return out;
  }

  // Módulo 3 (16-10-2026): sin señal, el envío queda en la cola de js/offline-route.js y sale al
  // volver la conexión (Background Sync o, en iOS, desde la página). Sin ese módulo, fetch directo.
  function post(url, body) {
    var headers = { 'Content-Type': 'application/json', apikey: PUBLIC_KEY, Authorization: 'Bearer ' + PUBLIC_KEY };
    try {
      if (window.BaqueanoOffline && typeof window.BaqueanoOffline.send === 'function') {
        window.BaqueanoOffline.send(url, body, headers).catch(function () { /* la analítica nunca rompe la navegación */ });
        return;
      }
      window.fetch(url, { method: 'POST', keepalive: true, headers: headers, body: JSON.stringify(body) })
        .catch(function () { /* la analítica nunca rompe la navegación */ });
    } catch (_) { /* sin red o fetch bloqueado */ }
  }

  var sent = 0;
  function track(name, data) {
    if (!consentGranted()) return false;
    var eventName = EVENT_MAP[name] || (Object.values(EVENT_MAP).indexOf(name) >= 0 ? name : null);
    if (!eventName || sent >= 120) return false; // tope por página además del límite del servidor
    sent += 1;
    data = data || {};
    var body = {
      p_event_name: eventName,
      p_anonymous_id: anonymousId(),
      p_session_id: sessionId(),
      p_platform: 'web',
      p_entity_type: data.entityType ? String(data.entityType).slice(0, 40) : null,
      p_entity_id: data.entityId ? String(data.entityId).slice(0, 120) : null,
      p_department_id: data.departmentId ? String(data.departmentId).slice(0, 60) : null,
      p_language: language(),
      p_path: window.location.pathname.slice(0, 300),
      p_metadata: safeMeta(data),
      p_utm: name === 'page_view' ? utm() : null
    };
    post(ENDPOINT, body);
    return true;
  }

  // Acción comercial ligada a un negocio real (el servidor valida que exista y limita la frecuencia).
  var commercialSent = 0;
  function trackCommercial(actionType, businessId) {
    if (!consentGranted() || !businessId || commercialSent >= 30) return false;
    commercialSent += 1;
    post(COMMERCIAL_ENDPOINT, { p_action_type: actionType, p_anonymous_id: anonymousId(), p_session_id: sessionId(), p_platform: 'web', p_business_id: String(businessId).slice(0, 120) });
    return true;
  }

  // Módulo 2 (16-10-2026): consulta con intención desde el formulario de contacto (lead-modal.js).
  // Contrato { destinationId, hostId, experienceId, timestamp, intent, people, leadDays }. Va como
  // acción comercial «whatsapp» (cuenta en «Contactos directos» del Ops Center y en las estadísticas
  // de los planes) + evento inquiry_sent con el motivo. Nunca nombre, teléfono, nota ni fecha exacta.
  var INTENTS = { info: 1, visit: 1, stay: 1, food: 1, group: 1, event: 1, other: 1, direct: 1 };
  function trackLead(lead) {
    if (!lead || !consentGranted()) return false;
    var intent = INTENTS[lead.intent] ? lead.intent : 'other';
    var people = Number(lead.people);
    var days = Number(lead.leadDays);
    var entityType = lead.hostId ? 'business' : (lead.experienceId ? 'experience' : (lead.destinationId ? 'destination' : null));
    var entityId = lead.hostId || lead.experienceId || lead.destinationId || null;
    if (entityId) {
      post(COMMERCIAL_ENDPOINT, { p_action_type: 'whatsapp', p_anonymous_id: anonymousId(), p_session_id: sessionId(), p_platform: 'web',
            p_business_id: lead.hostId ? String(lead.hostId).slice(0, 120) : null,
            p_destination_id: lead.destinationId ? String(lead.destinationId).slice(0, 120) : null,
            p_experience_id: lead.experienceId ? String(lead.experienceId).slice(0, 120) : null });
    } else {
      track('whatsapp_click', {});
    }
    var meta = { source: 'lead_modal', intent: intent };
    if (Number.isInteger(people) && people > 0 && people <= 60) meta.people = people;
    if (Number.isInteger(days) && days >= 0 && days <= 730) meta.lead_days = days;
    var eventName = 'inquiry_sent';
    if (sent >= 120) return true;
    sent += 1;
    post(ENDPOINT, { p_event_name: eventName, p_anonymous_id: anonymousId(), p_session_id: sessionId(), p_platform: 'web',
          p_entity_type: entityType, p_entity_id: entityId ? String(entityId).slice(0, 120) : null, p_department_id: null,
          p_language: language(), p_path: window.location.pathname.slice(0, 300), p_metadata: safeMeta(meta), p_utm: null });
    return true;
  }

  // ── Eventos automáticos ────────────────────────────────────────────────────
  function closestAttr(el, attr) {
    var node = el && el.closest ? el.closest('[' + attr + ']') : null;
    return node ? node.getAttribute(attr) : null;
  }
  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    var link = target.closest('a[href]');
    var href = link ? link.getAttribute('href') || '' : '';
    // Los enlaces con formulario de contacto (data-bq-lead) los registra trackLead al enviar.
    if (link && link.hasAttribute('data-bq-lead') && window.BaqueanoLeadModal) return;
    var businessId = closestAttr(link, 'data-business-id');
    if (/wa\.me\/|api\.whatsapp\.com|whatsapp:/i.test(href)) {
      if (!trackCommercial('whatsapp', businessId)) track('whatsapp_click', { entityType: businessId ? 'business' : null, entityId: businessId });
    } else if (/^tel:/i.test(href)) {
      if (!trackCommercial('call', businessId)) track('phone_click', { entityType: businessId ? 'business' : null, entityId: businessId });
    } else if (/^mailto:/i.test(href) && businessId) {
      trackCommercial('contact', businessId);
    } else if (/google\.[a-z.]+\/maps|maps\.google\.|maps\.apple\.com|waze\.com\/ul|[?&]destination=/i.test(href)) {
      // "Cómo llegar": solo el tipo de evento y el id público; nunca coordenadas del visitante.
      var placeId = closestAttr(link, 'data-business-id') || closestAttr(link, 'data-place-id');
      track('directions_click', { entityType: closestAttr(link, 'data-business-id') ? 'business' : (placeId ? 'place' : null), entityId: placeId });
    }
    if (target.closest('[onclick*="SosModal"], .open-sos-btn, [href="#sosModal"], [data-sos], .bq-sos-trigger, #bqSosFab')) track('sos_click', {});
  }, true);

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!form || !form.id) return;
    if (/^(businessRegForm|registerBusinessForm|bizRegisterForm)$/.test(form.id)) track('business_register', {});
    else if (/testimon/i.test(form.id)) track('testimonial_submit', {});
    else if (/search/i.test(form.id)) {
      var input = form.querySelector('input[type="search"], input[type="text"]');
      track('search', { query_length: input ? input.value.trim().length : 0 }); // nunca el texto buscado
    }
  }, true);

  window.addEventListener('baqueano:languageChanged', function () { track('language_change', {}); });
  window.addEventListener('baqueano_favs_updated', function (event) {
    var favs = event && event.detail;
    var last = Array.isArray(favs) && favs.length ? favs[favs.length - 1] : null;
    var id = last && (typeof last === 'string' ? last : last.id || last.destinationId);
    track('favorite', { entityType: 'destination', entityId: id || null });
  });
  // BAQUI publica 'baqueano:analytics'; se reenvía SOLO el tipo de evento y la latencia.
  window.addEventListener('baqueano:analytics', function (event) {
    var name = event && event.detail && event.detail.event;
    if (name === 'assistant_response') track('baqui_message', { latency_ms: event.detail.latency_ms, mode: event.detail.mode });
    if (name === 'assistant_itinerary_requested') track('itinerary_generate', { source: 'baqui' });
  });

  // Fichas de lugar, QR y otros hitos del embudo de impacto emitidos por los módulos.
  var IMPACT_EVENTS = { place_view: true, qr_generated: true, business_view: true, map_open: true, directions_click: true, reservation_start: true };
  window.addEventListener('baqueano:impact', function (event) {
    var d = (event && event.detail) || {};
    if (IMPACT_EVENTS[d.event]) track(d.event, { entityType: d.entityType, entityId: d.entityId, departmentId: d.departmentId, source: d.source });
  });

  window.BaqueanoAnalytics = { track: track, trackLead: trackLead, events: Object.keys(EVENT_MAP), consentGranted: consentGranted };

  // Página vista (y, si corresponde, ficha de destino o negocio).
  track('page_view', {});
  var params = new URLSearchParams(window.location.search);
  if (/mapa\.html$/.test(window.location.pathname)) track('map_open', { source: 'mapa' });
  if (/destino\.html$/.test(window.location.pathname) && (params.get('id') || params.get('slug'))) {
    track('destination_view', { entityType: 'destination', entityId: params.get('id') || params.get('slug') });
  }
})(window, document);
