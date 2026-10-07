// ============================================================================
// 🧭 BAQUEANO — OPS CENTER: CENTRO DE ALERTAS (ops-alerts.js)
// ============================================================================
// 🎯 POR QUÉ:
// - Plan de evolución (fase Ops Center): el equipo tenía que recorrer varias vistas para saber
//   si algo requería atención. La campana del Ops Center junta en un solo lugar lo urgente.
//
// ⚙️ CÓMO:
// - Solo señales reales, ya medidas por el servidor (nunca alertas de ejemplo):
//     · última corrida de automatización con falla o aviso (automation_runs, F8);
//     · conversaciones de viajeros esperando respuesta (baqueano-messages, F6);
//     · SOS abiertos (db_health_report);
//     · experiencias, denuncias, verificaciones y reservas pendientes (overview).
//   Si una fuente no responde, se muestra como alerta "sin datos" en vez de esconderla.
// - Cada alerta enlaza a su vista con #tab (la navegación del Ops Center ya entiende el hash).
// - Se consulta al iniciar sesión, cada 2 minutos con la pestaña visible y al abrir el panel.
// - Accesible: botón con aria-expanded/aria-controls, contador anunciado, Escape cierra y el
//   foco vuelve al botón. Todo con textContent.
//
// 📦 QUÉ: botón "Alertas" en la barra superior. window.BaqueanoOpsAlerts = { refresh(), items() }.
// ============================================================================
(function (window, document) {
  'use strict';
  if (window.BaqueanoOpsAlerts) return;

  var MSG_ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-messages';
  var POLL_MS = 120000;
  var state = { items: [], at: 0, open: false, button: null, panel: null, badge: null, timer: null, loading: false };
  var LEVEL = { high: { color: '#B91C1C', icon: 'fa-circle-exclamation' }, medium: { color: '#B45309', icon: 'fa-triangle-exclamation' }, info: { color: '#475569', icon: 'fa-circle-info' } };

  function tr(key, fallback, vars) {
    var out = fallback;
    try { if (window.BaqueanoLanguage && window.BaqueanoLanguage.t) out = window.BaqueanoLanguage.t(key, Object.assign({ fallback: fallback }, vars || {})) || fallback; } catch (_) { /* sin motor i18n */ }
    return String(out).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
  }
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'text') n.textContent = v; else if (k === 'className') n.className = v; else n.setAttribute(k, v);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function user() { try { return window.firebase && window.firebase.auth ? window.firebase.auth().currentUser : null; } catch (_) { return null; } }
  function settle(p) { return p.then(function (v) { return { ok: true, v: v }; }, function (e) { return { ok: false, e: (e && e.message) || String(e) }; }); }
  function ops(action, payload) { return window.BaqueanoOpsData ? window.BaqueanoOpsData.call(action, payload || {}) : Promise.reject(new Error('sin API')); }
  function messages() {
    var u = user();
    if (!u) return Promise.reject(new Error('sin sesión'));
    return u.getIdToken().then(function (token) {
      return fetch(MSG_ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json', 'x-firebase-token': token }, body: JSON.stringify({ action: 'staff_inbox', status: 'open' }) });
    }).then(function (r) { return r.json().then(function (d) { if (!r.ok || !d || d.ok === false) throw new Error((d && d.error) || ('HTTP ' + r.status)); return d; }); });
  }

  function build(r) {
    var list = [];
    var unavailable = function (label, err) { list.push({ level: 'info', text: tr('opsAlerts.noData', '{source}: sin datos ({error})', { source: label, error: err }), tab: null }); };
    // 1. Automatización
    if (r.auto.ok) {
      var run = (r.auto.v.items || [])[0];
      if (run && (run.status === 'fail' || run.status === 'warn')) {
        var bad = (run.checks || []).filter(function (c) { return c.state === run.status; }).map(function (c) {
          return window.BaqueanoOpsAutomation && window.BaqueanoOpsAutomation.checkName ? window.BaqueanoOpsAutomation.checkName(c) : c.label;
        });
        list.push({ level: run.status === 'fail' ? 'high' : 'medium', tab: '41-automatizacion',
          text: (run.status === 'fail' ? tr('opsAlerts.autoFail', 'Control automático con falla') : tr('opsAlerts.autoWarn', 'Control automático con aviso')) + ': ' + bad.join(', ') });
      }
    } else unavailable(tr('opsAuto.title', 'Automatización'), r.auto.e);
    // 2. Mensajes de viajeros
    if (r.msg.ok) {
      if (r.msg.v.open > 0) list.push({ level: 'medium', tab: '42-mensajes', text: tr('opsAlerts.messages', '{n} conversaciones de viajeros esperando respuesta', { n: r.msg.v.open }) });
    } else unavailable(tr('opsMsg.title', 'Mensajes de viajeros'), r.msg.e);
    // 3. SOS
    if (r.db.ok) {
      var sos = ((r.db.v.report || {}).operations || {}).open_sos || 0;
      if (sos > 0) list.push({ level: 'high', tab: '20-sos', text: tr('opsAlerts.sos', '{n} SOS abiertos', { n: sos }) });
    } else unavailable('SOS', r.db.e);
    // 4. Pendientes de moderación y operación
    if (r.ov.ok) {
      var m = r.ov.v.metrics || {};
      var v = function (k) { return m[k] && m[k].state !== 'ERROR' ? (m[k].value || 0) : 0; };
      if (v('reports_open')) list.push({ level: 'medium', tab: '36-comunidad', text: tr('opsAlerts.reports', '{n} denuncias de contenido abiertas', { n: v('reports_open') }) });
      if (v('testimonials_pending')) list.push({ level: 'info', tab: '36-comunidad', text: tr('opsAlerts.testimonials', '{n} experiencias esperando moderación', { n: v('testimonials_pending') }) });
      if (v('verification_pending')) list.push({ level: 'info', tab: '09-verificaciones', text: tr('opsAlerts.verifications', '{n} verificaciones pendientes', { n: v('verification_pending') }) });
      if (v('reservations_pending')) list.push({ level: 'info', tab: '11-reservas', text: tr('opsAlerts.reservations', '{n} reservas pendientes', { n: v('reservations_pending') }) });
      // Un conteo que no se pudo leer se declara: no se interpreta como "cero pendientes".
      var failed = ['reports_open', 'testimonials_pending', 'verification_pending', 'reservations_pending'].filter(function (k) { return m[k] && m[k].state === 'ERROR'; });
      if (failed.length) unavailable(tr('opsAlerts.overview', 'Resumen operativo'), failed.join(', '));
    } else unavailable(tr('opsAlerts.overview', 'Resumen operativo'), r.ov.e);
    var order = { high: 0, medium: 1, info: 2 };
    return list.sort(function (a, b) { return order[a.level] - order[b.level]; });
  }

  function paint() {
    if (!state.button) return;
    var actionable = state.items.filter(function (a) { return a.tab; }).length;
    var urgent = state.items.some(function (a) { return a.level === 'high'; });
    state.badge.textContent = actionable ? String(actionable) : '';
    state.badge.hidden = !actionable;
    state.badge.style.background = urgent ? '#B91C1C' : '#B45309';
    state.button.setAttribute('aria-label', tr('opsAlerts.buttonLabel', 'Alertas: {n} requieren atención', { n: actionable }));
    if (!state.panel) return;
    var body = state.items.length
      ? el('ul', { className: 'ops-alerts-list' }, state.items.map(function (a) {
        var meta = LEVEL[a.level] || LEVEL.info;
        var content = [el('i', { className: 'fa-solid ' + meta.icon, 'aria-hidden': 'true', style: 'color:' + meta.color }), el('span', { text: a.text })];
        var item = a.tab ? el('a', { href: '#' + a.tab, className: 'ops-alerts-item' }, content) : el('div', { className: 'ops-alerts-item is-static' }, content);
        if (a.tab) item.addEventListener('click', function () { close(); });
        return el('li', {}, [item]);
      }))
      : el('p', { className: 'ops-alerts-empty', text: state.loading ? tr('opsAlerts.loading', 'Revisando…') : tr('opsAlerts.none', 'Sin alertas: nada requiere atención ahora.') });
    var foot = el('p', { className: 'ops-alerts-foot', text: state.at ? tr('opsAlerts.updated', 'Revisado: {time}', { time: new Intl.DateTimeFormat('es-NI', { timeStyle: 'short', timeZone: 'America/Managua' }).format(new Date(state.at)) }) : '' });
    state.panel.replaceChildren(el('h2', { className: 'ops-alerts-title', text: tr('opsAlerts.title', 'Alertas') }), body, foot);
  }

  function refresh() {
    if (!user() || !window.BaqueanoOpsData || state.loading) return Promise.resolve();
    state.loading = true; paint();
    return Promise.all([settle(ops('automation_runs', { limit: 1 })), settle(messages()), settle(ops('db_health')), settle(ops('overview'))]).then(function (r) {
      state.items = build({ auto: r[0], msg: r[1], db: r[2], ov: r[3] });
      state.at = Date.now();
    }).then(function () { state.loading = false; paint(); });
  }

  function open() {
    state.open = true; state.panel.hidden = false; state.button.setAttribute('aria-expanded', 'true');
    paint(); refresh();
    var first = state.panel.querySelector('a, h2'); if (first) { first.setAttribute('tabindex', first.tagName === 'H2' ? '-1' : first.getAttribute('tabindex')); first.focus(); }
  }
  function close(returnFocus) {
    if (!state.open) return;
    state.open = false; state.panel.hidden = true; state.button.setAttribute('aria-expanded', 'false');
    if (returnFocus) state.button.focus();
  }

  function schedule() {
    window.clearInterval(state.timer);
    state.timer = window.setInterval(function () { if (document.visibilityState === 'visible') refresh(); }, POLL_MS);
  }

  function mount() {
    var right = document.querySelector('.ops-topbar-right');
    if (!right || document.getElementById('opsAlertsBtn')) return;
    var wrap = el('div', { className: 'ops-alerts-wrap' });
    state.badge = el('span', { className: 'ops-alerts-badge', hidden: 'hidden', 'aria-hidden': 'true' });
    state.button = el('button', { type: 'button', id: 'opsAlertsBtn', className: 'btn-ops-matte ops-alerts-btn', 'aria-expanded': 'false', 'aria-controls': 'opsAlertsPanel' },
      [el('i', { className: 'fa-solid fa-bell', 'aria-hidden': 'true' }), el('span', { text: tr('opsAlerts.title', 'Alertas') }), state.badge]);
    state.panel = el('div', { id: 'opsAlertsPanel', className: 'ops-alerts-panel', role: 'region', 'aria-label': tr('opsAlerts.title', 'Alertas'), hidden: 'hidden' });
    state.button.addEventListener('click', function () { state.open ? close(true) : open(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && state.open) close(true); });
    document.addEventListener('click', function (e) { if (state.open && !wrap.contains(e.target)) close(false); });
    wrap.appendChild(state.button); wrap.appendChild(state.panel);
    right.insertBefore(wrap, right.querySelector('#btnOpsBackupAction') || null);
    paint();
  }

  function start() {
    mount();
    var tries = 0;
    var wait = window.setInterval(function () {
      tries++;
      if (user() && window.BaqueanoOpsData) { window.clearInterval(wait); refresh(); schedule(); }
      else if (tries > 120) window.clearInterval(wait);
    }, 5000);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && Date.now() - state.at > POLL_MS) refresh(); });
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start, { once: true }) : start();
  window.addEventListener('baqueano:languageChanged', paint);
  window.BaqueanoOpsAlerts = { refresh: refresh, items: function () { return state.items.slice(); }, _build: build };
})(window, document);
