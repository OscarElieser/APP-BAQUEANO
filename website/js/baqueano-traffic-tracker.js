// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — TELEMETRÍA DE TRÁFICO WEB (baqueano-traffic-tracker.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer trazabilidad en tiempo real sobre los visitantes y exploradores que ingresan
//   al portal web oficial de BAQUEANO Nicaragua.
// - Conectar de forma continua y transparente el portal web con el Ops Command Center
//   para que el administrador conozca cuántos usuarios entran a la web, qué páginas
//   visitan, desde qué dirección IP y en qué fecha/hora.
// - Respetar la privacidad del usuario sin instalar cookies invasivas de terceros.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Ejecución ligera y asíncrona al cargar el DOM.
// - Detección de IP pública mediante fallback multi-nodo rápido (api.ipify.org / seeip.org / httpbin.org).
// - Generación de identificador de sesión temporal en sessionStorage para registrar
//   navegación sin duplicar registros síncronos innecesarios.
// - Escritura dual asíncrona en Cloud Firestore ('traffic_sessions') y Supabase ('public.traffic_sessions').
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Objeto global `window.BaqueanoWebTracker` con métodos `recordPageView()`,
//   `recordUserAction(action, details)` y auto-inicialización en toda página del ecosistema.
// ============================================================================

(function(window, document) {
  'use strict';

  const TRACKING_VERSION = '2.5.0-web';
  let cachedIp = null;

  async function resolveClientIp() {
    if (cachedIp) return cachedIp;
    try {
      const sessionCached = sessionStorage.getItem('baqueano_tracker_ip');
      if (sessionCached) {
        cachedIp = sessionCached;
        return cachedIp;
      }
    } catch (_) {}

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const fetchJson = async (url) => {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        return data.ip || data.origin || data.query;
      };

      const ip = await Promise.any([
        fetchJson('https://api.ipify.org?format=json'),
        fetchJson('https://api.seeip.org/jsonip'),
        fetchJson('https://httpbin.org/ip')
      ]);
      clearTimeout(timeoutId);
      if (ip) {
        cachedIp = String(ip).trim();
        try { sessionStorage.setItem('baqueano_tracker_ip', cachedIp); } catch (_) {}
        return cachedIp;
      }
    } catch (_) {}

    cachedIp = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? '127.0.0.1 (Local)'
      : (window.location.hostname || '127.0.0.1');
    return cachedIp;
  }

  function getSessionId() {
    let sid = null;
    try {
      sid = sessionStorage.getItem('baqueano_session_id');
      if (!sid) {
        sid = 'web_sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
        sessionStorage.setItem('baqueano_session_id', sid);
      }
    } catch (_) {
      sid = 'web_sess_' + Date.now();
    }
    return sid;
  }

  function getActiveUserEmail() {
    try {
      if (window.firebase && window.firebase.auth && window.firebase.auth().currentUser) {
        return window.firebase.auth().currentUser.email || 'explorador_autenticado';
      }
      const rawUser = sessionStorage.getItem('baqueano_active_user');
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        if (parsed.email) return parsed.email;
      }
    } catch (_) {}
    return 'explorador_anonimo';
  }

  const BaqueanoWebTracker = {
    async recordPageView(customPageName) {
      const pageTitle = customPageName || document.title || 'BAQUEANO Nicaragua';
      const path = window.location.pathname || '/';
      const referrer = document.referrer ? (new URL(document.referrer, window.location.href)).pathname : 'directo';
      const userAgent = navigator.userAgent || 'Web Browser';
      const ip = await resolveClientIp();
      const sessionId = getSessionId();
      const user = getActiveUserEmail();
      const nowIso = new Date().toISOString();

      const telemetryPayload = {
        id: 'visit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        sessionId: sessionId,
        platform: 'web',
        page: pageTitle,
        path: path,
        referrer: referrer,
        clientIp: ip,
        userAgent: userAgent,
        appVersion: TRACKING_VERSION,
        deviceModel: navigator.platform || 'Navegador Web',
        userId: user,
        isGuest: user === 'explorador_anonimo',
        timestamp: nowIso,
        status: 'active'
      };

      // 1. Enviar a Cloud Firestore ('traffic_sessions')
      if (window.firebase && window.firebase.firestore) {
        try {
          const db = window.firebase.firestore();
          await db.collection('traffic_sessions').doc(telemetryPayload.id).set(telemetryPayload);
        } catch (fbErr) {
          // Registro silencioso para no interrumpir navegación
        }
      }

      // 2. Enviar a Supabase PostgreSQL ('traffic_sessions')
      if (window.baqueanoSupabase && window.baqueanoSupabase.from) {
        try {
          await window.baqueanoSupabase.from('traffic_sessions').insert({
            id: telemetryPayload.id,
            platform: 'web',
            client_ip: ip,
            user_agent: userAgent,
            app_version: TRACKING_VERSION,
            device_model: navigator.platform || 'Web',
            page: pageTitle,
            path: path,
            referrer: referrer,
            user_id: user,
            is_guest: telemetryPayload.isGuest,
            created_at: nowIso
          });
        } catch (_) {}
      }

      return telemetryPayload;
    },

    async recordUserAction(actionName, details = {}) {
      const ip = await resolveClientIp();
      const user = getActiveUserEmail();
      const nowIso = new Date().toISOString();

      const eventPayload = {
        id: 'action_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        sessionId: getSessionId(),
        platform: 'web',
        action: actionName,
        details: details,
        clientIp: ip,
        userId: user,
        timestamp: nowIso
      };

      if (window.firebase && window.firebase.firestore) {
        try {
          window.firebase.firestore().collection('traffic_events').doc(eventPayload.id).set(eventPayload).catch(() => {});
        } catch (_) {}
      }
    }
  };

  window.BaqueanoWebTracker = BaqueanoWebTracker;

  // Auto-registro al cargar la página
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => BaqueanoWebTracker.recordPageView(), 350);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => BaqueanoWebTracker.recordPageView(), 350);
    });
  }

})(window, document);
