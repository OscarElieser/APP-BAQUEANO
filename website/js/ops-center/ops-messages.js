// ============================================================================
// 🧭 BAQUEANO — OPS CENTER: MENSAJES DE VIAJEROS (ops-messages.js)
// ============================================================================
// 🎯 POR QUÉ:
// - Plan de evolución, F6: el equipo necesita una bandeja para leer y responder las consultas que
//   las personas escriben desde su perfil (web) o la app. Cada respuesta le llega a la persona a
//   su campana 🔔.
//
// ⚙️ CÓMO:
// - Habla con la Edge Function baqueano-messages (acciones staff_*), con el token de Firebase de la
//   sesión del Ops Center. El rol se decide en el servidor: auditor solo lee; admin y super_admin
//   responden y cierran (y queda en la auditoría). El correo del equipo nunca se le muestra a la
//   persona: ella ve "Equipo BAQUEANO".
// - Todo se pinta con textContent. Textos opsMsg.* con respaldo en español (admin.html no carga
//   el motor de idioma).
//
// 📦 QUÉ: window.BaqueanoOpsMessages = { render(panel), refresh() }.
// ============================================================================
(function (window, document) {
  'use strict';
  if (window.BaqueanoOpsMessages) return;

  var ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-messages';
  var state = { panel: null, filter: 'open', inbox: null, thread: null, error: '', notice: '', busy: false };
  var STATUS_ES = { open: 'Esperando respuesta', answered: 'Respondida', closed: 'Cerrada', all: 'Todas' };
  var STATUS_COLOR = { open: '#C2410C', answered: '#4A7A5A', closed: '#475569' };

  function tr(key, fallback, vars) {
    var out = fallback;
    try { if (window.BaqueanoLanguage && window.BaqueanoLanguage.t) out = window.BaqueanoLanguage.t(key, Object.assign({ fallback: fallback }, vars || {})); } catch (_) { /* sin motor i18n */ }
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
  function icon(name) { return el('i', { className: 'fa-solid ' + name, 'aria-hidden': 'true' }); }
  function when(iso) {
    try { return new Intl.DateTimeFormat('es-NI', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Managua' }).format(new Date(iso)); } catch (_) { return String(iso || '').slice(0, 16); }
  }
  function canWrite() { return !!(window.BaqueanoOpsData && window.BaqueanoOpsData.state && window.BaqueanoOpsData.state.canWrite); }
  function statusLabel(s) { return tr('opsMsg.status.' + s, STATUS_ES[s] || s); }

  function call(action, payload) {
    var user = null;
    try { user = window.firebase && window.firebase.auth ? window.firebase.auth().currentUser : null; } catch (_) { user = null; }
    if (!user) return Promise.reject(new Error(tr('opsMsg.noSession', 'Sin sesión administrativa.')));
    return user.getIdToken().then(function (token) {
      return fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json', 'x-firebase-token': token }, body: JSON.stringify(Object.assign({ action: action }, payload || {})) });
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (data) {
        if (!res.ok || !data || data.ok === false) throw new Error((data && data.error) || ('Error ' + res.status));
        return data;
      });
    });
  }

  var BOX = 'background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:16px;margin-top:16px;color:#E2E8F0';
  var H = 'margin:0 0 10px;font:800 1rem/1.3 Montserrat,sans-serif;color:#F4E6C1';
  function chip(s) { return el('span', { style: 'display:inline-block;padding:2px 9px;border-radius:999px;font-size:.75rem;font-weight:800;color:#fff;background:' + (STATUS_COLOR[s] || '#475569'), text: statusLabel(s) }); }

  function inboxBox() {
    var filters = el('div', { role: 'group', 'aria-label': tr('opsMsg.filterLabel', 'Filtrar conversaciones'), style: 'display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px' },
      ['open', 'answered', 'closed', 'all'].map(function (f) {
        var b = el('button', { type: 'button', className: 'ops-btn' + (state.filter === f ? ' ops-btn-primary' : ''), 'aria-pressed': state.filter === f ? 'true' : 'false', text: statusLabel(f) });
        b.addEventListener('click', function () { state.filter = f; state.thread = null; refresh(); });
        return b;
      }));
    var inbox = state.inbox;
    var body;
    if (!inbox) body = el('p', { text: state.error || tr('opsMsg.loading', 'Cargando…') });
    else if (!inbox.items.length) body = el('p', { text: tr('opsMsg.empty', 'No hay conversaciones en esta bandeja.') });
    else {
      body = el('ul', { style: 'list-style:none;margin:0;padding:0;display:grid;gap:8px' }, inbox.items.map(function (c) {
        var b = el('button', { type: 'button', style: 'width:100%;min-height:44px;text-align:left;display:grid;gap:4px;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:' + (state.thread && state.thread.id === c.id ? 'rgba(22,93,111,.35)' : 'rgba(255,255,255,.03)') + ';color:#E2E8F0;cursor:pointer;font:inherit' }, [
          el('span', { style: 'display:flex;flex-wrap:wrap;gap:8px;align-items:center' }, [el('strong', { text: c.subject }), chip(c.status),
            c.unread ? el('span', { style: 'padding:2px 8px;border-radius:999px;background:#A74001;color:#fff;font-size:.75rem;font-weight:800', text: tr('opsMsg.unread', '{n} nuevos', { n: c.unread }) }) : null]),
          el('span', { style: 'font-size:.8rem;color:#CBD5E1', text: (c.user_email || tr('opsMsg.noEmail', 'Correo no verificado')) + ' · ' + when(c.last_message_at) })
        ]);
        b.addEventListener('click', function () { openThread(c.id); });
        return el('li', {}, [b]);
      }));
    }
    return el('section', { style: BOX, 'aria-labelledby': 'opsMsgInbox' }, [
      el('h2', { id: 'opsMsgInbox', style: H, text: tr('opsMsg.inboxTitle', 'Bandeja') + (inbox ? ' · ' + tr('opsMsg.counts', '{open} esperando respuesta · {unread} mensajes nuevos', { open: inbox.open, unread: inbox.unread }) : '') }),
      filters, body
    ]);
  }

  function threadBox() {
    var th = state.thread;
    if (!th) return null;
    var log = el('ol', { 'aria-label': tr('opsMsg.threadLabel', 'Mensajes de la conversación'), style: 'list-style:none;margin:10px 0;padding:0;display:grid;gap:10px' }, (th.messages || []).map(function (m) {
      var staff = m.author === 'staff';
      return el('li', { style: 'max-width:min(620px,95%);padding:10px 12px;border-radius:12px;display:grid;gap:4px;justify-self:' + (staff ? 'end' : 'start') + ';background:' + (staff ? 'rgba(22,93,111,.35)' : 'rgba(255,255,255,.06)') }, [
        el('span', { style: 'font-weight:800;font-size:.8rem;color:#F4E6C1', text: staff ? tr('opsMsg.teamAuthor', 'Equipo') + (m.author_ref ? ' (' + m.author_ref + ')' : '') : tr('opsMsg.traveler', 'Viajero') }),
        el('p', { style: 'margin:0;white-space:pre-wrap;overflow-wrap:anywhere', text: m.body }),
        el('time', { datetime: m.created_at, style: 'font-size:.75rem;color:#CBD5E1', text: when(m.created_at) })
      ]);
    }));
    var parts = [
      el('h2', { id: 'opsMsgThread', tabindex: '-1', style: H, text: th.subject }),
      el('p', { style: 'margin:0;display:flex;flex-wrap:wrap;gap:8px;align-items:center;color:#CBD5E1' }, [chip(th.status), el('span', { text: (th.user_email || tr('opsMsg.noEmail', 'Correo no verificado')) + ' · ' + tr('opsMsg.since', 'desde') + ' ' + when(th.created_at) })]),
      log
    ];
    if (th.status === 'closed') {
      parts.push(el('p', { style: 'color:#CBD5E1', text: tr('opsMsg.closedBy', 'Cerrada {at} por {who}.', { at: th.closed_at ? when(th.closed_at) : '', who: th.closed_by || '—' }) }));
    } else if (canWrite()) {
      var ta = el('textarea', { id: 'opsMsgReply', rows: '4', maxlength: '2000', style: 'width:100%;box-sizing:border-box;font:inherit;font-size:16px;padding:10px;border-radius:10px;border:1px solid #94A3B8;background:#0B1C2C;color:#F8FAFC' });
      var send = el('button', { type: 'submit', className: 'ops-btn ops-btn-primary', disabled: state.busy ? 'disabled' : null }, [icon('fa-paper-plane'), document.createTextNode(' ' + tr('opsMsg.reply', 'Responder'))]);
      var close = el('button', { type: 'button', className: 'ops-btn', disabled: state.busy ? 'disabled' : null }, [icon('fa-box-archive'), document.createTextNode(' ' + tr('opsMsg.close', 'Cerrar conversación'))]);
      var form = el('form', { style: 'display:grid;gap:8px;margin-top:8px' }, [
        el('label', { for: 'opsMsgReply', style: 'font-weight:700;color:#F4E6C1', text: tr('opsMsg.replyLabel', 'Respuesta para la persona (la ve como «Equipo BAQUEANO»)') }), ta,
        el('div', { style: 'display:flex;flex-wrap:wrap;gap:8px' }, [send, close])
      ]);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!ta.value.trim()) { state.error = tr('opsMsg.emptyReply', 'Escribí la respuesta antes de enviarla.'); render(); return; }
        act('staff_reply', { id: th.id, body: ta.value }, tr('opsMsg.replied', 'Respuesta enviada. La persona recibió un aviso en su campana.'));
      });
      close.addEventListener('click', function () { act('staff_close', { id: th.id }, tr('opsMsg.closed', 'Conversación cerrada.')); });
      parts.push(form);
    } else {
      parts.push(el('p', { style: 'color:#CBD5E1', text: tr('opsMsg.readOnly', 'Tu rol es de solo lectura: responder requiere un administrador.') }));
    }
    return el('section', { style: BOX, 'aria-labelledby': 'opsMsgThread' }, parts);
  }

  function render() {
    var panel = state.panel;
    if (!panel) return;
    var reload = el('button', { type: 'button', className: 'ops-btn' }, [icon('fa-rotate'), document.createTextNode(' ' + tr('opsMsg.refresh', 'Actualizar'))]);
    reload.addEventListener('click', function () { refresh(); });
    panel.replaceChildren(
      el('div', { className: 'ops-view-header' }, [
        el('div', { className: 'ops-view-title-group' }, [
          el('h1', {}, [icon('fa-comments'), document.createTextNode(' ' + tr('opsMsg.title', 'Mensajes de viajeros'))]),
          el('p', { className: 'ops-view-subtitle', text: tr('opsMsg.subtitle', 'Consultas escritas desde el perfil. Cada respuesta le llega a la persona en su campana.') })
        ]),
        el('div', { className: 'ops-view-actions' }, [reload])
      ]),
      state.notice ? el('p', { role: 'status', style: 'margin:12px 0 0;color:#F4E6C1', text: state.notice }) : null,
      state.error && state.inbox ? el('p', { role: 'alert', style: 'margin:12px 0 0;color:#FCA5A5', text: state.error }) : null,
      threadBox(),
      inboxBox()
    );
  }

  function act(action, payload, okText) {
    state.busy = true; state.error = ''; render();
    return call(action, payload).then(function () {
      state.notice = okText;
      return openThread(payload.id, true);
    }, function (e) { state.error = e.message; }).then(function () { state.busy = false; render(); return refreshInbox(); });
  }

  function openThread(id, keepNotice) {
    if (!keepNotice) state.notice = '';
    state.error = '';
    return call('staff_thread', { id: id }).then(function (d) {
      state.thread = d.thread; render();
      var h = document.getElementById('opsMsgThread'); if (h) h.focus();
      return refreshInbox();
    }, function (e) { state.error = e.message; render(); });
  }

  function refreshInbox() {
    return call('staff_inbox', { status: state.filter }).then(function (d) {
      state.inbox = { items: d.items || [], unread: d.unread || 0, open: d.open || 0 }; render();
    }, function (e) { state.error = e.message; render(); });
  }
  function refresh() { state.error = ''; return refreshInbox(); }

  function render0(panel) { state.panel = panel; render(); refresh(); }
  window.addEventListener('baqueano:languageChanged', render);
  window.BaqueanoOpsMessages = { render: render0, refresh: refresh };
})(window, document);
