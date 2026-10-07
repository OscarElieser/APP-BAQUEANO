// ============================================================================
// 🧭 BAQUEANO — MENSAJES CON EL EQUIPO (js/baqueano-messages.js)
// ============================================================================
// 🎯 POR QUÉ:
// - Plan de evolución, F6: que la persona pueda escribirle al equipo de BAQUEANO y LEER la
//   respuesta dentro de su perfil (antes el contacto era de una sola vía). La respuesta del
//   equipo también llega a la campana 🔔 (F5) con enlace a esta sección.
//
// ⚙️ CÓMO:
// - Solo con sesión de Firebase. Todo pasa por la Edge Function baqueano-messages, que verifica el
//   token: cada persona ve solo sus conversaciones (el uid nunca sale del navegador).
// - Pinta con textContent (nunca HTML del usuario). Textos con claves messages.* en 6 idiomas;
//   al cambiar de idioma se repinta.
// - Accesible: formulario con etiquetas, contador de caracteres, mensajes de estado con
//   role="status" y errores con role="alert"; al abrir una conversación el foco va a su título.
//
// 📦 QUÉ: rellena section#mensajes de perfil.html. window.BaqueanoMessages = { refresh() }.
// ============================================================================
(function (window, document) {
  'use strict';
  if (window.BaqueanoMessages) return;

  var ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-messages';
  var state = { items: null, thread: null, view: 'list', notice: '', error: '', busy: false };

  function t(key, fallback, vars) {
    var out = fallback;
    try { if (window.BaqueanoLanguage && window.BaqueanoLanguage.t) out = window.BaqueanoLanguage.t(key, Object.assign({ fallback: fallback }, vars || {})) || fallback; } catch (_) { out = fallback; }
    return String(out).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
  }
  function user() { try { return window.firebase && window.firebase.auth ? window.firebase.auth().currentUser : null; } catch (_) { return null; } }
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
  function when(iso) {
    try {
      var L = window.BaqueanoLanguage;
      var o = { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Managua' };
      return L && L.formatDate ? L.formatDate(iso, o) : new Intl.DateTimeFormat(undefined, o).format(new Date(iso));
    } catch (_) { return String(iso || '').slice(0, 16); }
  }
  function root() { return document.getElementById('mensajes'); }

  function call(action, payload) {
    var u = user();
    if (!u) return Promise.reject(new Error(t('messages.loginRequired', 'Iniciá sesión para ver tus mensajes.')));
    return u.getIdToken().then(function (token) {
      return fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json', 'x-firebase-token': token }, body: JSON.stringify(Object.assign({ action: action }, payload || {})) });
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (data) {
        if (!res.ok || !data || data.ok === false) {
          var key = data && data.code ? 'messages.err.' + data.code : '';
          throw new Error(key ? t(key, (data && data.error) || '') : t('messages.errGeneric', 'No se pudo completar la acción. Intentá de nuevo.'));
        }
        return data;
      });
    });
  }

  function statusLabel(s) { return t('messages.status.' + s, { open: 'Esperando respuesta', answered: 'Respondida', closed: 'Cerrada' }[s] || s); }

  function counter(field, max) {
    var out = el('span', { className: 'bq-msg-counter', 'aria-live': 'polite' });
    function upd() { out.textContent = t('messages.counter', '{n} de {max} caracteres', { n: field.value.length, max: max }); }
    field.addEventListener('input', upd); upd();
    return out;
  }

  function composeForm() {
    var subject = el('input', { id: 'bqMsgSubject', type: 'text', required: 'required', minlength: '3', maxlength: '120', autocomplete: 'off' });
    var body = el('textarea', { id: 'bqMsgBody', required: 'required', maxlength: '2000', rows: '4' });
    var form = el('form', { className: 'bq-msg-form', novalidate: 'novalidate' }, [
      el('h3', { className: 'bq-msg-h3', text: t('messages.newTitle', 'Nueva consulta') }),
      el('label', { for: 'bqMsgSubject', text: t('messages.subject', 'Asunto') }), subject,
      el('label', { for: 'bqMsgBody', text: t('messages.body', 'Mensaje') }), body, counter(body, 2000),
      el('button', { type: 'submit', className: 'bq-msg-btn', disabled: state.busy ? 'disabled' : null, text: t('messages.send', 'Enviar') })
    ]);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (subject.value.trim().length < 3) { setError(t('messages.err.subject_invalid', 'El asunto debe tener entre 3 y 120 caracteres.')); subject.focus(); return; }
      if (!body.value.trim()) { setError(t('messages.err.body_invalid', 'El mensaje debe tener entre 1 y 2000 caracteres.')); body.focus(); return; }
      busy(true);
      call('start', { subject: subject.value, body: body.value }).then(function (d) {
        state.notice = t('messages.sent', 'Mensaje enviado. Te avisamos en la campana cuando el equipo responda.');
        return openThread(d.id);
      }, function (err) { setError(err.message); }).then(function () { busy(false); });
    });
    return form;
  }

  function listView() {
    var items = state.items || [];
    var list = items.length
      ? el('ul', { className: 'bq-msg-list' }, items.map(function (c) {
        var btn = el('button', { type: 'button', className: 'bq-msg-item' }, [
          el('strong', { text: c.subject }),
          el('span', { className: 'bq-msg-meta', text: statusLabel(c.status) + ' · ' + when(c.last_message_at) }),
          c.unread ? el('span', { className: 'bq-msg-badge', text: t('messages.unread', '{n} sin leer', { n: c.unread }) }) : null
        ]);
        btn.addEventListener('click', function () { openThread(c.id); });
        return el('li', {}, [btn]);
      }))
      : el('p', { className: 'bq-msg-empty', text: state.items ? t('messages.empty', 'Todavía no tenés conversaciones. Escribinos y te respondemos aquí.') : t('messages.loading', 'Cargando…') });
    return [el('h3', { className: 'bq-msg-h3', text: t('messages.listTitle', 'Tus conversaciones') }), list, composeForm()];
  }

  function threadView() {
    var th = state.thread;
    var back = el('button', { type: 'button', className: 'bq-msg-link', text: '← ' + t('messages.back', 'Volver a tus conversaciones') });
    back.addEventListener('click', function () { state.view = 'list'; state.thread = null; load(); });
    var title = el('h3', { className: 'bq-msg-h3', tabindex: '-1', id: 'bqMsgThreadTitle', text: th.subject });
    var log = el('ol', { className: 'bq-msg-thread', 'aria-label': t('messages.threadLabel', 'Mensajes de la conversación') }, (th.messages || []).map(function (m) {
      var mine = m.author === 'user';
      return el('li', { className: 'bq-msg-bubble ' + (mine ? 'is-mine' : 'is-team') }, [
        el('span', { className: 'bq-msg-author', text: mine ? t('messages.you', 'Vos') : t('messages.team', 'Equipo BAQUEANO') }),
        el('p', { text: m.body }),
        el('time', { datetime: m.created_at, text: when(m.created_at) })
      ]);
    }));
    var parts = [back, title, el('p', { className: 'bq-msg-meta', text: statusLabel(th.status) }), log];
    if (th.status === 'closed') {
      parts.push(el('p', { className: 'bq-msg-empty', text: t('messages.closedNote', 'El equipo cerró esta conversación. Si necesitás algo más, abrí una nueva consulta.') }));
    } else {
      var body = el('textarea', { id: 'bqMsgReply', required: 'required', maxlength: '2000', rows: '3' });
      var form = el('form', { className: 'bq-msg-form', novalidate: 'novalidate' }, [
        el('label', { for: 'bqMsgReply', text: t('messages.reply', 'Tu respuesta') }), body, counter(body, 2000),
        el('button', { type: 'submit', className: 'bq-msg-btn', disabled: state.busy ? 'disabled' : null, text: t('messages.send', 'Enviar') })
      ]);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!body.value.trim()) { setError(t('messages.err.body_invalid', 'El mensaje debe tener entre 1 y 2000 caracteres.')); body.focus(); return; }
        busy(true);
        call('send', { id: th.id, body: body.value }).then(function () {
          state.notice = t('messages.sentReply', 'Respuesta enviada.');
          return openThread(th.id);
        }, function (err) { setError(err.message); }).then(function () { busy(false); });
      });
      parts.push(form);
    }
    return parts;
  }

  function render() {
    var host = root();
    if (!host) return;
    var box = host.querySelector('[data-messages-body]');
    if (!box) return;
    var children = [];
    if (state.notice) children.push(el('p', { className: 'bq-msg-notice', role: 'status', text: state.notice }));
    if (state.error) children.push(el('p', { className: 'bq-msg-error', role: 'alert', text: state.error }));
    if (!user()) children = [el('p', { className: 'bq-msg-empty', text: t('messages.loginRequired', 'Iniciá sesión para ver tus mensajes.') })];
    else children = children.concat(state.view === 'thread' && state.thread ? threadView() : listView());
    // Al repintar se conserva el foco (por id): el lector de pantalla no pierde su lugar.
    var focusedId = document.activeElement && box.contains(document.activeElement) ? document.activeElement.id : '';
    box.replaceChildren.apply(box, children);
    if (focusedId) { var again = document.getElementById(focusedId); if (again) again.focus(); }
  }
  function setError(msg) { state.error = msg; state.notice = ''; render(); }
  function busy(on) { state.busy = on; render(); }

  function openThread(id) {
    state.error = '';
    return call('thread', { id: id }).then(function (d) {
      state.thread = d.thread; state.view = 'thread'; render();
      var title = document.getElementById('bqMsgThreadTitle');
      if (title) title.focus();
    }, function (err) { setError(err.message); });
  }

  function load() {
    state.error = '';
    return call('list').then(function (d) { state.items = d.items || []; render(); }, function (err) { state.items = state.items || []; setError(err.message); });
  }

  function onAuth(u) {
    if (!root()) return;
    if (!u) { state.items = null; state.thread = null; state.view = 'list'; render(); return; }
    load();
  }

  function boot() {
    if (!root()) return;
    render();
    try { if (window.firebase && window.firebase.auth) { window.firebase.auth().onAuthStateChanged(onAuth); return; } } catch (_) { /* sin Firebase */ }
  }
  window.addEventListener('baqueano:languageChanged', render);
  window.addEventListener('baqueano:i18nReady', render);
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot, { once: true }) : boot();

  window.BaqueanoMessages = { refresh: load, _state: state, _render: render };
})(window, document);
