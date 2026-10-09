// ============================================================================
// 🧭 BAQUEANO — CAMPANA DE NOTIFICACIONES (baqueano-notifications.js)
// ============================================================================
// 🎯 POR QUÉ:
// - El propietario pidió un centro de notificaciones con campana 🔔 y contador que cambie sin
//   F5: opinión aprobada o rechazada, respuestas, mensajes, negocio aprobado, novedades.
//
// ⚙️ CÓMO:
// - Solo aparece con sesión de Firebase. Lee y cambia avisos a través de la Edge Function
//   baqueano-notifications, que verifica el ID Token: cada persona ve solo los suyos.
// - Contador "en vivo": se consulta al cargar, al volver a la pestaña y cada 30 s mientras está
//   visible. Si una pestaña marca avisos como leídos, las demás se enteran por
//   BroadcastChannel. Con la pestaña oculta no hay consultas.
// - Los textos llegan como claves i18n + params y se pintan con textContent en el idioma activo;
//   al cambiar de idioma el panel se repinta.
// - Nada se borra: "Archivar" mueve el aviso a la bandeja de archivados.
// - Panel accesible: botón con aria-expanded, Escape cierra y el foco vuelve a la campana.
//
// 📦 QUÉ: window.BaqueanoNotifications = { refresh(), open(), close() }.
// ============================================================================
(function (window, document) {
  'use strict';
  if (window.BaqueanoNotifications) return;

  var ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-notifications';
  var POLL_MS = 30000;
  var state = { unread: 0, items: [], hasMore: false, box: 'inbox', open: false, timer: null, button: null, panel: null, loading: false };
  var channel = null;
  try { channel = 'BroadcastChannel' in window ? new window.BroadcastChannel('baqueano-notifications') : null; } catch (_) { channel = null; }

  function t(key, fallback, vars) {
    var out = fallback;
    try { if (window.BaqueanoLanguage && window.BaqueanoLanguage.t) out = window.BaqueanoLanguage.t(key, Object.assign({ fallback: fallback }, vars || {})) || fallback; } catch (_) { out = fallback; }
    return String(out).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
  }
  function user() { try { return window.firebase && window.firebase.auth ? window.firebase.auth().currentUser : null; } catch (_) { return null; } }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }

  function call(action, payload) {
    var u = user();
    if (!u) return Promise.reject(new Error('login_required'));
    return u.getIdToken().then(function (token) {
      return window.fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json', 'x-firebase-token': token }, body: JSON.stringify(Object.assign({ action: action }, payload || {})) });
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (body) {
        if (!res.ok || !body.ok) throw new Error(body.error || t('notify.error', 'No se pudieron cargar las notificaciones.'));
        return body;
      });
    });
  }

  function installStyle() {
    if (document.getElementById('bqNotifyStyle')) return;
    var css = '.bq-bell{position:relative;display:inline-flex;align-items:center;justify-content:center;min-width:44px;min-height:44px;border-radius:999px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#fff;cursor:pointer;font-size:1.05rem}' +
      '.bq-bell:focus-visible{outline:3px solid #F4E6C1;outline-offset:2px}' +
      '.bq-bell-count{position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;padding:0 5px;border-radius:999px;background:#C2410C;color:#fff;font:800 .72rem/20px League Spartan,sans-serif;text-align:center;border:2px solid #0D1B2A}' +
      '.bq-notify-panel{position:fixed;z-index:10050;top:72px;right:12px;width:min(380px,calc(100vw - 24px));max-height:min(70vh,560px);display:flex;flex-direction:column;background:#0D1B2A;color:#F8FAFC;border:1px solid rgba(255,255,255,.14);border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,.45)}' +
      '.bq-notify-head{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.1)}' +
      '.bq-notify-panel .bq-notify-head h2{margin:0;font:800 1rem/1.2 League Spartan,sans-serif;flex:1;color:#fff;-webkit-text-fill-color:#fff;background:none;letter-spacing:0}' +
      '.bq-notify-tabs{display:flex;gap:6px;padding:8px 14px}' +
      '.bq-notify-tab,.bq-notify-act{min-height:36px;padding:0 12px;border-radius:999px;border:1px solid rgba(255,255,255,.2);background:transparent;color:#E2E8F0;font:700 .8rem/1 League Spartan,sans-serif;cursor:pointer}' +
      '.bq-notify-tab[aria-selected="true"]{background:#165D6F;border-color:#165D6F;color:#fff}' +
      '.bq-notify-tab:focus-visible,.bq-notify-act:focus-visible,.bq-notify-item a:focus-visible{outline:3px solid #F4E6C1;outline-offset:2px}' +
      '.bq-notify-list{list-style:none;margin:0;padding:4px 8px 10px;overflow:auto}' +
      '.bq-notify-item{display:grid;gap:4px;padding:10px;border-radius:12px;margin:4px 0;background:rgba(255,255,255,.04)}' +
      '.bq-notify-item[data-status="new"]{background:rgba(246,94,1,.14);border-left:3px solid #F65E01}' +
      '.bq-notify-item strong{font-size:.92rem;color:#fff}.bq-notify-item p{margin:0;font-size:.85rem;color:#CBD5E1;line-height:1.45}' +
      '.bq-notify-item time{font-size:.76rem;color:#94A3B8}.bq-notify-item a{color:#FDBA74;font-weight:700;font-size:.84rem}' +
      '.bq-notify-row{display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap}' +
      '.bq-notify-empty{padding:18px 14px;color:#CBD5E1;font-size:.9rem}' +
      // Aviso nuevo: la campana se sacude (sin animación si se pide movimiento reducido).
      '.bq-bell.is-ringing i{animation:bqBellRing .9s ease-in-out 1;transform-origin:50% 0}' +
      '.bq-bell.is-ringing .bq-bell-count{animation:bqBellPop .5s ease-out 1}' +
      '@keyframes bqBellRing{0%,100%{transform:rotate(0)}15%{transform:rotate(18deg)}30%{transform:rotate(-16deg)}45%{transform:rotate(12deg)}60%{transform:rotate(-8deg)}75%{transform:rotate(4deg)}}' +
      '@keyframes bqBellPop{0%{transform:scale(.6)}60%{transform:scale(1.25)}100%{transform:scale(1)}}' +
      '@media (prefers-reduced-motion:reduce){.bq-bell.is-ringing i,.bq-bell.is-ringing .bq-bell-count{animation:none}}' +
      '.bq-notify-sound{min-width:36px;padding:0 10px}.bq-notify-sound[aria-pressed="false"]{color:#94A3B8}' +
      '.bq-sr-only{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}';
    var style = el('style'); style.id = 'bqNotifyStyle'; style.appendChild(document.createTextNode(css)); document.head.appendChild(style);
  }

  function ensureButton() {
    if (state.button && state.button.isConnected) return state.button;
    var host = document.querySelector('.global-nav-actions, .nav-actions-right, .nav-right-actions, .exact-nav-actions');
    if (!host) return null;
    var btn = el('button', 'bq-bell');
    btn.type = 'button';
    btn.id = 'bqNotifyBell';
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-expanded', 'false');
    var i = el('i', 'fa-solid fa-bell'); i.setAttribute('aria-hidden', 'true');
    var count = el('span', 'bq-bell-count'); count.hidden = true; count.setAttribute('aria-hidden', 'true');
    btn.append(i, count);
    btn.addEventListener('click', function (e) { e.stopPropagation(); if (state.open) close(); else open(); });
    var lang = host.querySelector('.navbar-lang-pill, .global-language');
    if (lang) host.insertBefore(btn, lang); else host.appendChild(btn);
    state.button = btn;
    paintCount();
    return btn;
  }
  function paintCount() {
    var btn = state.button; if (!btn) return;
    var c = btn.querySelector('.bq-bell-count');
    c.hidden = !state.unread;
    c.textContent = state.unread > 99 ? '99+' : String(state.unread);
    btn.setAttribute('aria-label', state.unread ? t('notify.bellUnread', 'Notificaciones: {n} sin leer', { n: state.unread }) : t('notify.bell', 'Notificaciones'));
  }

  // ---------------------------------------------------------------- sonido al recibir
  // 2026-10-09 (pedido del propietario): cuando llega un aviso nuevo (p. ej. una alerta del
  // superadministrador o del administrador) la campana suena, se sacude y lo anuncia a lectores de
  // pantalla. Solo si el contador SUBE respecto de la consulta anterior (nunca al cargar la página),
  // con la pestaña visible y si la persona no lo silenció. El timbre se genera con Web Audio (sin
  // archivos); los navegadores exigen una interacción previa para reproducir audio.
  var SOUND_KEY = 'baqueano_bell_sound';
  var audioCtx = null;
  var primed = false; // la primera consulta solo fija la línea base
  function soundOn() { try { return window.localStorage.getItem(SOUND_KEY) !== 'off'; } catch (_) { return true; } }
  function setSound(on) { try { window.localStorage.setItem(SOUND_KEY, on ? 'on' : 'off'); } catch (_) { /* sin almacenamiento: solo esta visita */ } }
  function unlockAudio() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (_) { audioCtx = null; }
  }
  ['pointerdown', 'keydown'].forEach(function (ev) { document.addEventListener(ev, unlockAudio, { once: true, passive: true }); });
  function chime() {
    if (!audioCtx || audioCtx.state !== 'running') return;
    var now = audioCtx.currentTime;
    [[880, 0], [1318.5, 0.16]].forEach(function (note) {
      var osc = audioCtx.createOscillator(); var gain = audioCtx.createGain();
      osc.type = 'sine'; osc.frequency.value = note[0];
      gain.gain.setValueAtTime(0.0001, now + note[1]);
      gain.gain.exponentialRampToValueAtTime(0.18, now + note[1] + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note[1] + 0.55);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(now + note[1]); osc.stop(now + note[1] + 0.6);
    });
  }
  function announce(text) {
    var live = document.getElementById('bqNotifyLive');
    if (!live) { live = el('div', 'bq-sr-only'); live.id = 'bqNotifyLive'; live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite'); document.body.appendChild(live); }
    live.textContent = ''; window.setTimeout(function () { live.textContent = text; }, 50);
  }
  function ring(added, total) {
    if (document.hidden) return;
    if (soundOn()) chime();
    var btn = state.button;
    if (btn) { btn.classList.remove('is-ringing'); void btn.offsetWidth; btn.classList.add('is-ringing'); }
    announce(t('notify.newArrived', 'Tenés {n} notificaciones nuevas', { n: total }));
  }

  function refreshCount() {
    if (!user() || document.hidden) return Promise.resolve();
    return call('count').then(function (d) {
      var n = d.unread || 0;
      if (primed && n > state.unread) ring(n - state.unread, n);
      primed = true;
      setUnread(n, false);
    }).catch(function () { /* sin red: se reintenta */ });
  }
  function setUnread(n, broadcast) {
    state.unread = n; paintCount();
    if (broadcast && channel) channel.postMessage({ type: 'unread', n: n });
  }
  if (channel) channel.onmessage = function (e) { if (e.data && e.data.type === 'unread') { state.unread = e.data.n; paintCount(); if (state.open) loadList(); } };

  function schedule() {
    window.clearTimeout(state.timer);
    state.timer = window.setTimeout(function () { refreshCount().then(schedule); }, POLL_MS);
  }

  function loadList(more) {
    if (state.loading) return Promise.resolve();
    state.loading = true;
    var before = more && state.items.length ? state.items[state.items.length - 1].created_at : null;
    return call('list', { box: state.box, before: before }).then(function (d) {
      state.items = more ? state.items.concat(d.items || []) : (d.items || []);
      state.hasMore = !!d.hasMore;
      setUnread(d.unread || 0, false);
      renderPanel();
    }).catch(function (e) {
      state.error = e.message; renderPanel();
    }).then(function () { state.loading = false; });
  }

  function fmt(iso) {
    try { return window.BaqueanoLanguage && window.BaqueanoLanguage.formatDate ? window.BaqueanoLanguage.formatDate(iso, { dateStyle: 'medium', timeStyle: 'short' }) : new Date(iso).toLocaleString(); } catch (_) { return iso; }
  }
  var TYPE_FALLBACK = {
    'notify.reviewApprovedTitle': 'Tu opinión fue aprobada', 'notify.reviewApprovedBody': 'Ya se muestra en la galería de opiniones de la comunidad.',
    'notify.reviewRejectedTitle': 'Tu opinión no fue aprobada', 'notify.reviewRejectedBody': 'Motivo del equipo: {reason}',
    'notify.reviewResponseTitle': 'BAQUEANO respondió tu opinión', 'notify.reviewResponseBody': 'Podés leer la respuesta en tu historial de opiniones.'
  };

  function renderPanel() {
    var p = state.panel; if (!p) return;
    p.replaceChildren();
    var head = el('div', 'bq-notify-head');
    var h = el('h2', null, t('notify.title', 'Notificaciones')); h.id = 'bqNotifyTitle';
    // El panel vive en <body> de cualquier página: cada página tiene su estilo de h2, así que el
    // color se fija en línea para garantizar el contraste sobre el fondo oscuro.
    h.style.setProperty('color', '#FFFFFF', 'important');
    h.style.setProperty('-webkit-text-fill-color', '#FFFFFF', 'important');
    h.style.setProperty('font-size', '1rem', 'important');
    head.append(h);
    if (state.box === 'inbox' && state.unread) {
      var all = el('button', 'bq-notify-act', t('notify.markAll', 'Marcar todo como leído'));
      all.type = 'button';
      all.addEventListener('click', function () { call('mark_read', { all: true }).then(function () { setUnread(0, true); loadList(); }); });
      head.append(all);
    }
    // Sonido de la campana: activado por defecto; la elección queda en este navegador.
    var snd = el('button', 'bq-notify-act bq-notify-sound');
    snd.type = 'button';
    var paintSound = function () {
      var on = soundOn();
      snd.setAttribute('aria-pressed', on ? 'true' : 'false');
      snd.setAttribute('aria-label', on ? t('notify.soundOnLabel', 'Sonido activado: tocá para silenciar') : t('notify.soundOffLabel', 'Sonido silenciado: tocá para activarlo'));
      var ico = el('i', 'fa-solid ' + (on ? 'fa-volume-high' : 'fa-volume-xmark')); ico.setAttribute('aria-hidden', 'true');
      snd.replaceChildren(ico);
    };
    paintSound();
    snd.addEventListener('click', function () { setSound(!soundOn()); unlockAudio(); paintSound(); if (soundOn()) chime(); });
    head.append(snd);
    var x = el('button', 'bq-notify-act', '×'); x.type = 'button'; x.setAttribute('aria-label', t('notify.close', 'Cerrar notificaciones'));
    x.addEventListener('click', function () { close(); });
    head.append(x);
    p.append(head);
    var tabs = el('div', 'bq-notify-tabs'); tabs.setAttribute('role', 'tablist');
    [['inbox', t('notify.inbox', 'Recibidas')], ['archived', t('notify.archived', 'Archivadas')]].forEach(function (tab) {
      var b = el('button', 'bq-notify-tab', tab[1]); b.type = 'button'; b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', state.box === tab[0] ? 'true' : 'false');
      b.addEventListener('click', function () { state.box = tab[0]; state.items = []; loadList(); });
      tabs.append(b);
    });
    p.append(tabs);
    if (state.error) { p.append(el('p', 'bq-notify-empty', state.error)); state.error = null; return; }
    if (!state.items.length) { p.append(el('p', 'bq-notify-empty', state.box === 'inbox' ? t('notify.empty', 'No tenés notificaciones.') : t('notify.emptyArchived', 'No hay notificaciones archivadas.'))); return; }
    var list = el('ul', 'bq-notify-list');
    state.items.forEach(function (n) {
      var li = el('li', 'bq-notify-item'); li.dataset.status = n.status;
      var params = n.params || {};
      li.append(el('strong', null, t(n.title_key, TYPE_FALLBACK[n.title_key] || n.title_key, params)));
      if (n.body_key) li.append(el('p', null, t(n.body_key, TYPE_FALLBACK[n.body_key] || '', params)));
      var time = el('time', null, fmt(n.created_at)); time.dateTime = n.created_at;
      var row = el('div', 'bq-notify-row');
      row.append(time);
      var actions = el('span');
      if (n.link && /^\/[A-Za-z0-9/_.?=&#-]*$/.test(n.link)) {
        var a = el('a', null, t('notify.open', 'Ver')); a.href = n.link;
        a.addEventListener('click', function () { if (n.status === 'new') call('mark_read', { ids: [n.id] }).catch(function () {}); });
        actions.append(a, ' ');
      }
      if (n.status === 'new') {
        var read = el('button', 'bq-notify-act', t('notify.markRead', 'Leída')); read.type = 'button';
        read.addEventListener('click', function () { call('mark_read', { ids: [n.id] }).then(function () { setUnread(Math.max(0, state.unread - 1), true); loadList(); }); });
        actions.append(read, ' ');
      }
      var arch = el('button', 'bq-notify-act', n.status === 'archived' ? t('notify.unarchive', 'Restaurar') : t('notify.archive', 'Archivar')); arch.type = 'button';
      arch.addEventListener('click', function () {
        call(n.status === 'archived' ? 'unarchive' : 'archive', { id: n.id }).then(function () { loadList(); refreshCount(); if (channel) channel.postMessage({ type: 'unread', n: state.unread }); });
      });
      actions.append(arch);
      row.append(actions);
      li.append(row);
      list.append(li);
    });
    p.append(list);
    if (state.hasMore) {
      var more = el('button', 'bq-notify-act', t('notify.more', 'Ver más')); more.type = 'button'; more.style.margin = '0 14px 12px';
      more.addEventListener('click', function () { loadList(true); });
      p.append(more);
    }
  }

  function onKey(e) { if (e.key === 'Escape' && state.open) { close(); } }
  function onOutside(e) { if (state.open && state.panel && !state.panel.contains(e.target) && e.target !== state.button) close(true); }
  function open() {
    if (!ensureButton()) return;
    state.open = true;
    var p = el('div', 'bq-notify-panel');
    p.setAttribute('role', 'dialog'); p.setAttribute('aria-labelledby', 'bqNotifyTitle'); p.tabIndex = -1;
    document.body.appendChild(p);
    state.panel = p;
    state.button.setAttribute('aria-expanded', 'true');
    renderPanel();
    p.focus();
    loadList();
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onOutside, true);
  }
  function close(keepFocus) {
    state.open = false;
    if (state.panel) state.panel.remove();
    state.panel = null;
    if (state.button) { state.button.setAttribute('aria-expanded', 'false'); if (!keepFocus) state.button.focus(); }
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('click', onOutside, true);
  }

  function onAuth(u) {
    if (u) {
      installStyle();
      if (!ensureButton()) { window.setTimeout(function () { onAuth(user()); }, 800); return; }
      refreshCount(); schedule();
    } else {
      window.clearTimeout(state.timer);
      if (state.open) close(true);
      if (state.button) state.button.remove();
      state.button = null; state.unread = 0;
    }
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) refreshCount(); });
  window.addEventListener('focus', refreshCount);
  window.addEventListener('baqueano:languageChanged', function () { paintCount(); renderPanel(); });

  var tries = 0;
  (function waitAuth() {
    try {
      if (window.firebase && window.firebase.auth) { window.firebase.auth().onAuthStateChanged(onAuth); return; }
    } catch (_) { /* Firebase todavía no cargó */ }
    if (++tries < 20) window.setTimeout(waitAuth, 1000);
  })();

  window.BaqueanoNotifications = { refresh: refreshCount, open: open, close: close };
})(window, document);
