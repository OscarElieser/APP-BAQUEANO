// ============================================================================
// 🧭 BAQUEANO — OPS CENTER: EN VIVO (ops-live-presence.js)
// ============================================================================
// 🎯 POR QUÉ:
// - El equipo necesita saber cuántas personas usan BAQUEANO ahora mismo, desde dónde (web,
//   PWA o Android) y qué están mirando, sin F5. Antes el panel solo mostraba "activos 7/30
//   días", que además dependían del consentimiento de analítica.
//
// ⚙️ CÓMO:
// - Lee la Edge Function baqueano-presence (acción snapshot). El servidor verifica el token de
//   Firebase y exige admin, superadmin o auditor; el navegador no decide nada.
// - Sondeo cada 10 s solo mientras la vista "En vivo" o el Dashboard están visibles; se pausa
//   con la pestaña oculta. No abre canales Realtime: el dato ya llega agregado y es barato.
// - Persona ≠ sesión ≠ pestaña: el servidor cuenta personas = usuario o navegador.
// - El feed muestra tipos de evento, plataforma y página. Nunca nombres, correos ni textos.
// - Todo se pinta con textContent.
//
// 📦 QUÉ: window.BaqueanoOpsLive = { render(panel), renderStrip(), refresh() }.
// ============================================================================
(function (window, document) {
  'use strict';
  if (window.BaqueanoOpsLive) return;

  var ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-presence';
  var POLL_MS = 10000;
  var state = { data: null, error: null, at: 0, timer: null, loading: null, panel: null, filter: 'all' };

  function tr(key, fallback, vars) {
    var out = fallback;
    try { if (window.BaqueanoLanguage && window.BaqueanoLanguage.t) out = window.BaqueanoLanguage.t(key, Object.assign({ fallback: fallback }, vars || {})); } catch (_) { out = fallback; }
    return String(out).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
  }
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'text') node.textContent = v;
      else if (k === 'className') node.className = v;
      else if (k === 'style') node.style.cssText = v;
      else node.setAttribute(k, v === true ? '' : String(v));
    });
    (children || []).forEach(function (c) { if (c != null && c !== false) node.append(typeof c === 'string' ? document.createTextNode(c) : c); });
    return node;
  }
  function icon(name) { return el('i', { className: 'fa-solid ' + name, 'aria-hidden': 'true' }); }
  function user() { try { return window.firebase.auth().currentUser; } catch (_) { return null; } }
  function n(v) { return typeof v === 'number' ? v.toLocaleString('es-NI') : '—'; }

  var PAGE_NAMES = {
    '/': 'Inicio', '/index.html': 'Inicio', '/destinos.html': 'Destinos', '/destino.html': 'Ficha de destino',
    '/departamento.html': 'Departamento', '/mapa.html': 'Mapa', '/baqueano-ia.html': 'BAQUI',
    '/opiniones.html': 'Opiniones', '/mi-viaje.html': 'Mi Viaje', '/perfil.html': 'Perfil',
    '/aliados.html': 'Aliados', '/nosotros.html': 'Nosotros / Contacto', '/denuncias.html': 'Denuncias',
    '/musica.html': 'Música', '/gastronomia.html': 'Gastronomía', '/historia.html': 'Historia',
    '/experiencias.html': 'Experiencias', '/ambiental.html': 'Ambiental', '/testimonios.html': 'Comunidad',
    '/admin.html': 'Ops Center', '/descargar.html': 'Descargar app', '/home': 'App · Inicio'
  };
  function pageName(path) {
    if (!path) return tr('opsLive.pageUnknown', 'una página');
    return PAGE_NAMES[path] || path.replace(/^\//, '').replace(/\.html$/, '');
  }
  var PLATFORM = { web: 'Web', pwa: 'PWA', android: 'Android' };
  function who(actor) {
    return actor === 'staff' ? tr('opsLive.actorStaff', 'Administrador')
      : actor === 'user' ? tr('opsLive.actorUser', 'Usuario') : tr('opsLive.actorVisitor', 'Visitante');
  }
  var PROVIDER = { google: 'Google', password: 'Email/Password', phone: 'Teléfono', apple: 'Apple', anonymous: 'Anónimo', custom: 'Personalizado', other: 'Otro' };
  function providerLabel(p) { return p ? (PROVIDER[p] || p) : '—'; }
  function describe(item) {
    var page = pageName(item.path) + (item.label ? ' · ' + item.label : '');
    var via = item.platform ? ' · ' + (PLATFORM[item.platform] || item.platform) : '';
    if (item.src === 'presence') {
      if (item.kind === 'visit_start') return who(item.actor_type) + ' ' + tr('opsLive.evVisit', 'ingresó a {page}', { page: page }) + via;
      if (item.kind === 'page_enter') return who(item.actor_type) + ' ' + tr('opsLive.evPage', 'abrió {page}', { page: page }) + via;
      if (item.kind === 'login') return who(item.actor_type) + ' ' + tr('opsLive.evLogin', 'inició sesión') + ' · Firebase / ' + providerLabel(item.auth_provider) + via;
      if (item.kind === 'leave' && item.auth_provider === 'logout') return who('user') + ' ' + tr('opsLive.evLogout', 'cerró sesión') + via;
      if (item.kind === 'android_open') return who(item.actor_type) + ' ' + tr('opsLive.evAndroid', 'ingresó desde Android');
      if (item.kind === 'leave') return who(item.actor_type) + ' ' + tr('opsLive.evLeave', 'salió de {page}', { page: page }) + via;
    }
    if (item.src === 'review') {
      return item.kind === 'submitted' ? tr('opsLive.evReview', 'Usuario envió una opinión') + via
        : tr('opsLive.evReviewMod', 'Administrador moderó una opinión ({status})', { status: item.detail || '—' });
    }
    if (item.src === 'intake') {
      var kind = String(item.kind || '').split(':');
      var label = { contact: tr('opsLive.kContact', 'mensaje de contacto'), business: tr('opsLive.kBusiness', 'solicitud de negocio'), eco: tr('opsLive.kEco', 'denuncia ambiental') }[kind[0]] || kind[0];
      return /^(created|received|submitted)$/.test(kind[1] || '')
        ? tr('opsLive.evIntakeNew', 'Nuevo {kind} recibido', { kind: label })
        : tr('opsLive.evIntakeUpd', '{kind}: estado {status}', { kind: label, status: item.detail || kind[1] || '—' });
    }
    if (item.src === 'audit') return tr('opsLive.evAudit', 'Acción administrativa: {action}', { action: item.kind || '—' });
    return item.kind || '—';
  }
  function ago(iso) {
    var s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
    if (s < 60) return tr('opsLive.agoSec', 'hace {n} s', { n: s });
    if (s < 3600) return tr('opsLive.agoMin', 'hace {n} min', { n: Math.round(s / 60) });
    if (s < 86400) return tr('opsLive.agoHour', 'hace {n} h', { n: Math.round(s / 3600) });
    return new Date(iso).toLocaleString('es-NI');
  }

  function load() {
    var u = user();
    if (!u) { state.error = tr('opsLive.needLogin', 'Iniciá sesión con tu cuenta del equipo para ver la actividad en vivo.'); return Promise.resolve(); }
    if (state.loading) return state.loading;
    state.loading = u.getIdToken().then(function (token) {
      return window.fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json', 'x-firebase-token': token }, body: JSON.stringify({ action: 'snapshot' }) });
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (body) {
        if (!res.ok || !body.ok) throw new Error(body.error || tr('opsLive.loadError', 'No se pudo leer la presencia.'));
        state.data = body; state.error = null; state.at = Date.now();
      });
    }).catch(function (e) {
      state.error = e && e.message ? e.message : tr('opsLive.loadError', 'No se pudo leer la presencia.');
    }).finally(function () { state.loading = null; });
    return state.loading;
  }

  function kpi(iconName, value, label, accent, id) {
    return el('div', { className: 'ops-kpi-card', style: '--kpi-accent:' + accent, id: id || null }, [
      el('div', { className: 'ops-kpi-top' }, [el('div', { className: 'ops-kpi-icon', style: 'background:rgba(255,255,255,.06);color:#F4E6C1' }, [icon(iconName)])]),
      el('div', { className: 'ops-kpi-value', text: value }),
      el('div', { className: 'ops-kpi-label', text: label })
    ]);
  }
  function kpis(snap) {
    var on = (snap && snap.online) || {}, today = (snap && snap.today) || {};
    return el('div', { className: 'ops-kpi-grid', role: 'list', 'aria-label': tr('opsLive.kpisLabel', 'Presencia en tiempo real') }, [
      kpi('fa-signal', n(on.people), tr('opsLive.kOnline', 'Personas en línea ahora'), '#F65E01'),
      kpi('fa-globe', n(on.web), tr('opsLive.kWeb', 'Web'), '#165D6F'),
      kpi('fa-mobile-screen', n(on.android), tr('opsLive.kAndroid', 'Android (app)'), '#4A7A5A'),
      kpi('fa-user-check', n(on.registered), tr('opsLive.kRegistered', 'Con sesión iniciada'), '#165D6F'),
      kpi('fa-user-secret', n(on.visitors), tr('opsLive.kVisitors', 'Visitantes anónimos'), '#94A3B8'),
      kpi('fa-user-shield', n(on.staff), tr('opsLive.kStaff', 'Equipo conectado'), '#F65E01'),
      kpi('fa-calendar-day', n(today.people), tr('opsLive.kToday', 'Personas hoy'), '#4A7A5A'),
      kpi('fa-chart-line', n(snap && snap.peak_today), tr('opsLive.kPeak', 'Pico de hoy (simultáneas)'), '#F65E01')
    ].map(function (c) { c.setAttribute('role', 'listitem'); return c; }));
  }

  function renderInto(root) {
    root.replaceChildren();
    var data = state.data, snap = data && data.snapshot;
    var head = el('div', { className: 'ops-view-header' }, [
      el('div', { className: 'ops-view-title-group' }, [
        el('h1', {}, [icon('fa-tower-broadcast'), ' ', el('span', { text: tr('opsLive.title', 'Actividad en vivo') })]),
        el('p', { className: 'ops-view-subtitle', text: tr('opsLive.subtitle', 'Presencia real por latido (25 s). En línea = actividad en los últimos 90 s. Sin cookies, sin IP y sin datos personales.') })
      ]),
      el('div', { className: 'ops-view-actions' }, [
        el('span', { 'aria-live': 'polite', style: 'font-size:.78rem;color:var(--ops-text-muted,#CBD5E1)', text: state.at ? tr('opsLive.updated', 'Actualizado {when}', { when: new Date(state.at).toLocaleTimeString('es-NI') }) : tr('opsLive.loading', 'Cargando…') })
      ])
    ]);
    root.append(head);
    if (state.error && !snap) {
      root.append(el('div', { className: 'ops-empty-state', role: 'status' }, [icon('fa-plug-circle-xmark'), el('div', { className: 'ops-empty-title', text: state.error })]));
      return;
    }
    root.append(kpis(snap));
    var on = (snap && snap.online) || {};
    root.append(el('p', { style: 'color:#CBD5E1;font-size:.85rem;margin:-.6rem 0 1.2rem', text: tr('opsLive.breakdown', '{s} sesiones · {t} pestañas · móvil {m} · tablet {tb} · escritorio {d} · PWA {p}', { s: n(on.sessions), t: n(on.tabs), m: n(on.mobile), tb: n(on.tablet), d: n(on.desktop), p: n(on.pwa) }) }));

    var states = (snap && snap.states) || {};
    root.append(el('p', { style: 'color:#E2E8F0;font-size:.9rem;margin:0 0 1rem', text: tr('opsLive.states', '🟢 En línea {on} · 🟡 Inactivos {idle} · ⚪ Desconectados (30 min) {off}', { on: n(states.online), idle: n(states.inactive), off: n(states.offline_30m) }) }));
    root.append(firebaseCard(snap));
    root.append(usersTable(snap));

    var grid = el('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:1rem' });
    var pages = el('div', { className: 'ops-kpi-card', style: '--kpi-accent:#165D6F' }, [el('h2', { style: 'font-size:1rem;color:#fff;margin:0 0 .7rem', text: tr('opsLive.pagesNow', 'Qué están viendo ahora') })]);
    var list = (snap && snap.pages_now) || [];
    if (!list.length) pages.append(el('p', { style: 'color:#CBD5E1;margin:0', text: tr('opsLive.nobody', 'Nadie en línea en este momento.') }));
    else pages.append(el('ul', { style: 'list-style:none;margin:0;padding:0' }, list.map(function (p) {
      return el('li', { style: 'display:flex;justify-content:space-between;gap:1rem;padding:.4rem 0;border-bottom:1px solid rgba(255,255,255,.06);color:#E2E8F0' }, [el('span', { text: pageName(p.path) }), el('strong', { text: n(p.n) })]);
    })));
    var feed = el('div', { className: 'ops-kpi-card', style: '--kpi-accent:#F65E01' }, [el('h2', { style: 'font-size:1rem;color:#fff;margin:0 0 .7rem', text: tr('opsLive.feed', 'Actividad reciente') })]);
    feed.append(filterBar());
    var items = ((data && data.feed) || []).filter(matchesFilter);
    if (!items.length) feed.append(el('p', { style: 'color:#CBD5E1;margin:0', text: tr('opsLive.noFeed', 'Todavía no hay actividad registrada.') }));
    else feed.append(el('ol', { style: 'list-style:none;margin:0;padding:0;max-height:420px;overflow:auto', tabindex: '0', 'aria-label': tr('opsLive.feed', 'Actividad reciente') }, items.map(function (it) {
      return el('li', { style: 'display:flex;justify-content:space-between;gap:1rem;padding:.45rem 0;border-bottom:1px solid rgba(255,255,255,.06);color:#E2E8F0;font-size:.86rem' }, [
        el('span', { text: describe(it) }), el('time', { datetime: it.at, style: 'color:#94A3B8;white-space:nowrap', text: ago(it.at) })
      ]);
    })));
    grid.append(pages, feed);
    root.append(grid);
    if (state.error) root.append(el('p', { role: 'status', style: 'color:#FCA5A5;margin-top:.8rem', text: state.error }));
  }

  var FILTERS = [
    ['all', 'opsLive.fAll', 'Todos'], ['firebase', 'opsLive.fFirebase', 'Firebase'], ['guests', 'opsLive.fGuests', 'Invitados'],
    ['web', 'opsLive.kWeb', 'Web'], ['android', 'opsLive.fAndroid', 'Android'], ['login', 'opsLive.fLogin', 'Login'],
    ['baqui', 'opsLive.fBaqui', 'BAQUI'], ['reviews', 'opsLive.fReviews', 'Opiniones'], ['messages', 'opsLive.fMessages', 'Mensajes']
  ];
  function matchesFilter(it) {
    switch (state.filter) {
      case 'firebase': return it.src === 'presence' && (it.actor_type === 'user' || it.actor_type === 'staff');
      case 'guests': return it.src === 'presence' && it.actor_type === 'visitor';
      case 'web': return it.platform === 'web' || it.platform === 'pwa';
      case 'android': return it.platform === 'android';
      case 'login': return it.src === 'presence' && (it.kind === 'login' || it.auth_provider === 'logout');
      case 'baqui': return it.path === '/baqueano-ia.html';
      case 'reviews': return it.src === 'review';
      case 'messages': return it.src === 'intake';
      default: return true;
    }
  }
  function filterBar() {
    var bar = el('div', { role: 'group', 'aria-label': tr('opsLive.filters', 'Filtrar actividad'), style: 'display:flex;flex-wrap:wrap;gap:.4rem;margin:0 0 .8rem' });
    FILTERS.forEach(function (f) {
      var on = state.filter === f[0];
      var b = el('button', { type: 'button', 'aria-pressed': on ? 'true' : 'false', text: tr(f[1], f[2]),
        style: 'min-height:36px;padding:.3rem .75rem;border-radius:999px;font-size:.78rem;font-weight:700;cursor:pointer;border:1px solid ' + (on ? '#F65E01' : 'rgba(255,255,255,.18)') + ';background:' + (on ? '#C2410C' : 'rgba(255,255,255,.04)') + ';color:#fff' });
      b.addEventListener('click', function () { state.filter = f[0]; if (state.panel) renderInto(state.panel); var again = state.panel && state.panel.querySelector('[aria-pressed="true"]'); if (again) again.focus(); });
      bar.append(b);
    });
    return bar;
  }
  function firebaseCard(snap) {
    var fb = (snap && snap.firebase) || {};
    var rows = [
      [tr('opsLive.fbOnline', 'Usuarios Firebase en línea'), n(fb.online)],
      ['Google', n(fb.google)],
      ['Email/Password', n(fb.password)],
      [tr('opsLive.fbOther', 'Otros proveedores'), n(fb.other)],
      [tr('opsLive.fbGuests', 'Invitados (sin sesión)'), n(fb.guests)],
      [tr('opsLive.fbToday', 'Usuarios Firebase hoy'), n(fb.today)],
      [tr('opsLive.fbLastLogin', 'Último inicio de sesión'), fb.last_login ? ago(fb.last_login) : '—']
    ];
    return el('section', { className: 'ops-kpi-card', style: '--kpi-accent:#F65E01;margin-bottom:1rem', 'aria-labelledby': 'opsLiveFbTitle' }, [
      el('h2', { id: 'opsLiveFbTitle', style: 'font-size:1rem;color:#fff;margin:0 0 .3rem', text: '🔥 ' + tr('opsLive.fbTitle', 'Firebase Auth') }),
      el('p', { style: 'color:#CBD5E1;font-size:.8rem;margin:0 0 .7rem', text: tr('opsLive.fbNote', 'Firebase autentica; el token se verifica en el servidor y Supabase registra la sesión. Nunca se confía en un UID enviado por el navegador.') }),
      el('dl', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr));gap:.6rem;margin:0' }, rows.map(function (r) {
        return el('div', { style: 'background:rgba(255,255,255,.04);border-radius:10px;padding:.55rem .7rem' }, [
          el('dt', { style: 'color:#CBD5E1;font-size:.74rem', text: r[0] }), el('dd', { style: 'margin:0;color:#fff;font-weight:800;font-size:1.15rem', text: r[1] })
        ]);
      }))
    ]);
  }
  var STATE_BADGE = { online: ['🟢', 'opsLive.stOnline', 'En línea'], inactive: ['🟡', 'opsLive.stIdle', 'Inactivo'], offline: ['⚪', 'opsLive.stOffline', 'Desconectado'] };
  function usersTable(snap) {
    var users = (snap && snap.users) || [];
    var box = el('section', { className: 'ops-kpi-card', style: '--kpi-accent:#165D6F;margin-bottom:1rem', 'aria-labelledby': 'opsLiveUsersTitle' }, [
      el('h2', { id: 'opsLiveUsersTitle', style: 'font-size:1rem;color:#fff;margin:0 0 .7rem', text: tr('opsLive.usersTitle', 'Usuarios con sesión (últimos 30 min)') })
    ]);
    if (!users.length) { box.append(el('p', { style: 'color:#CBD5E1;margin:0', text: tr('opsLive.noUsers', 'Ningún usuario con sesión iniciada en los últimos 30 minutos.') })); return box; }
    var head = [tr('opsLive.cUser', 'Usuario'), tr('opsLive.cState', 'Estado'), tr('opsLive.cAuth', 'Autenticación'), tr('opsLive.cProvider', 'Proveedor'), tr('opsLive.cPlatform', 'Plataforma'), tr('opsLive.cPage', 'Página'), tr('opsLive.cLast', 'Última actividad')];
    var table = el('table', { style: 'width:100%;border-collapse:collapse;font-size:.84rem;color:#E2E8F0;min-width:640px' }, [
      el('caption', { style: 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap', text: tr('opsLive.usersTitle', 'Usuarios con sesión (últimos 30 min)') }),
      el('thead', {}, [el('tr', {}, head.map(function (h) { return el('th', { scope: 'col', style: 'text-align:left;padding:.45rem;color:#CBD5E1;border-bottom:1px solid rgba(255,255,255,.12)', text: h }); }))]),
      el('tbody', {}, users.map(function (u) {
        var st = STATE_BADGE[u.state] || STATE_BADGE.offline;
        var plat = u.platform === 'android' ? '📱 Android' : (u.platform === 'pwa' ? '📲 PWA' : '💻 Web');
        return el('tr', {}, [
          el('td', { style: 'padding:.45rem;font-weight:700', text: u.name + (u.role && u.role !== 'explorer' ? ' · ' + u.role : '') }),
          el('td', { style: 'padding:.45rem', text: st[0] + ' ' + tr(st[1], st[2]) }),
          el('td', { style: 'padding:.45rem', text: '🔥 Firebase' }),
          el('td', { style: 'padding:.45rem', text: providerLabel(u.provider) }),
          el('td', { style: 'padding:.45rem', text: plat + (u.tabs > 1 ? ' · ' + tr('opsLive.tabs', '{n} pestañas', { n: u.tabs }) : '') }),
          el('td', { style: 'padding:.45rem', text: pageName(u.path) + (u.label ? ' · ' + u.label : '') }),
          el('td', { style: 'padding:.45rem;white-space:nowrap', text: ago(u.last_seen) })
        ]);
      }))
    ]);
    box.append(el('div', { style: 'overflow-x:auto', tabindex: '0', role: 'region', 'aria-label': tr('opsLive.usersTitle', 'Usuarios con sesión (últimos 30 min)') }, [table]));
    // Sección técnica: solo el final del UID, para cruzar con Firebase sin ocupar la vista principal.
    box.append(el('details', { style: 'margin-top:.7rem;color:#CBD5E1;font-size:.78rem' }, [
      el('summary', { style: 'cursor:pointer', text: tr('opsLive.tech', 'Detalle técnico (UID de Firebase, últimos 6 caracteres)') }),
      el('ul', { style: 'margin:.4rem 0 0;padding-left:1.1rem' }, users.map(function (u) { return el('li', { text: u.name + ' — …' + u.uid_tail }); }))
    ]));
    return box;
  }

  // Franja ejecutiva en el Dashboard (Presencia & Telemetría en Vivo).
  function renderStrip() {
    var host = document.getElementById('opsLiveStrip');
    if (!host) return;
    host.replaceChildren();
    if (state.error && !state.data) { host.append(el('p', { style: 'color:#CBD5E1;font-size:.85rem', text: state.error })); return; }
    
    var header = el('div', { className: 'ops-live-strip-header' }, [
      el('div', { style: 'display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap' }, [
        el('span', { className: 'ops-pulse-dot' }),
        el('strong', { style: 'color:#F8FAFC;font-size:0.86rem;font-weight:700;letter-spacing:0.4px;text-transform:uppercase', text: tr('opsLive.pulseTitle', 'Presencia & Telemetría en Vivo') }),
        el('span', { style: 'font-size:0.72rem;color:var(--ops-text-muted,#94A3B8);background:rgba(255,255,255,.06);padding:.15rem .55rem;border-radius:4px;border:1px solid rgba(255,255,255,.08)', text: tr('opsLive.pulseSub', 'Latido continuo 25 s · Cero rastreo invasivo') })
      ]),
      el('span', { style: 'font-size:.75rem;color:var(--ops-text-muted,#94A3B8);font-variant-numeric:tabular-nums', text: state.at ? tr('opsLive.updated', 'Actualizado {when}', { when: new Date(state.at).toLocaleTimeString('es-NI') }) : '' })
    ]);
    host.append(header);
    host.append(kpis(state.data && state.data.snapshot));
  }

  function visible() {
    if (document.hidden) return false;
    var v = document.getElementById('view-39-en-vivo'), d = document.getElementById('view-01-dashboard');
    return (v && v.classList.contains('is-active')) || (d && d.classList.contains('is-active'));
  }
  function refresh() {
    return load().then(function () {
      if (state.panel && state.panel.isConnected) renderInto(state.panel);
      renderStrip();
    });
  }
  function loop() {
    window.clearTimeout(state.timer);
    state.timer = window.setTimeout(function () { (visible() ? refresh() : Promise.resolve()).then(loop); }, POLL_MS);
  }
  function render(panel) {
    state.panel = panel;
    renderInto(panel);
    refresh();
  }
  document.addEventListener('visibilitychange', function () { if (visible()) refresh(); });
  window.addEventListener('baqueano:languageChanged', function () { if (state.panel) renderInto(state.panel); renderStrip(); });
  try { window.firebase.auth().onAuthStateChanged(function (u) { if (u) refresh(); }); } catch (_) { /* sin Firebase: estado "inicia sesión" */ }
  loop();

  window.BaqueanoOpsLive = { render: render, renderStrip: renderStrip, refresh: refresh };
})(window, document);
