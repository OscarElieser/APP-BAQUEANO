// ============================================================================
// 🧭 BAQUEANO — OPS CENTER: OPINIONES SOBRE BAQUEANO (ops-platform-reviews.js)
// ============================================================================
// 🎯 POR QUÉ:
// - Cada opinión sobre la plataforma entra como `pending` y no se ve en
//   opiniones.html hasta que el equipo la revise según las Normas de la
//   Comunidad. Sin esta vista nada saldría al público ni se atenderían los
//   reportes.
// - Las normas prohíben borrar o editar opiniones ajenas y rechazar una
//   crítica solo por ser negativa: aquí no hay botón de eliminar ni de editar
//   el texto del usuario, y rechazar u ocultar exige un motivo que queda
//   auditado.
//
// ⚙️ CÓMO:
// - Usa solo la Edge Function `baqueano-reviews` (mod_list, moderate,
//   respond, resolve_report) con el token de Firebase. El servidor verifica
//   el rol (admin o superadmin para actuar, auditor solo lectura) y escribe
//   en audit_logs; este archivo no decide permisos.
// - Todo texto de usuarios se pinta con textContent (nunca innerHTML).
// - El identificador del usuario llega enmascarado desde el servidor.
// - Una sola petición en vuelo por vista para no pintar resultados viejos.
//
// 📦 QUÉ:
// - window.BaqueanoPlatformReviewsModeration = { render(panel), refresh() }.
// - Filtros por estado con contadores, tarjetas con aprobar / rechazar /
//   ocultar / marcar como reportada, respuesta institucional "Respuesta de
//   BAQUEANO", reportes abiertos con resolver o descartar, historial y
//   contador en el menú lateral.
// ============================================================================
(function (window, document) {
  'use strict';
  if (window.BaqueanoPlatformReviewsModeration) return;

  var ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-reviews';
  var STATES = [
    { id: 'pending', label: 'Pendientes', icon: 'fa-hourglass-half' },
    { id: 'reports', label: 'Con reportes', icon: 'fa-flag' },
    { id: 'approved', label: 'Publicadas', icon: 'fa-circle-check' },
    { id: 'reported', label: 'Marcadas reportadas', icon: 'fa-triangle-exclamation' },
    { id: 'hidden', label: 'Ocultas', icon: 'fa-eye-slash' },
    { id: 'rejected', label: 'Rechazadas', icon: 'fa-ban' },
    { id: 'withdrawn', label: 'Retiradas por su autor', icon: 'fa-user-xmark' }
  ];
  var REPORT_REASONS = {
    insulto: 'Insulto', amenaza: 'Amenaza', spam: 'Spam', ilegal: 'Contenido ilegal', datos_personales: 'Datos personales',
    suplantacion: 'Suplantación', automatizado: 'Contenido automatizado', repetido: 'Repetido', enlace_peligroso: 'Enlace peligroso',
    discriminacion: 'Discriminación', otro: 'Otro'
  };
  var EVENT_LABELS = {
    created: 'Creada', edited: 'Editada por su autor', erased: 'Datos borrados por su autor', approved: 'Aprobada', rejected: 'Rechazada', hidden: 'Ocultada',
    marked_reported: 'Marcada como reportada', withdrawn: 'Retirada por su autor', deletion_requested: 'Su autor pidió eliminarla',
    reported: 'Reportada', responded: 'Respuesta publicada', response_removed: 'Respuesta retirada', report_resolved: 'Reporte resuelto'
  };

  var state = { status: 'pending', panel: null, requestId: 0, busy: false, totals: {} };

  // --------------------------------------------------------------------------
  // Utilidades de DOM seguras
  // --------------------------------------------------------------------------
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        var value = attrs[key];
        if (value == null || value === false) return;
        if (key === 'text') node.textContent = value;
        else if (key === 'className') node.className = value;
        else if (key === 'style') node.style.cssText = value;
        else if (key.indexOf('on') === 0 && typeof value === 'function') node.addEventListener(key.slice(2), value);
        else node.setAttribute(key, value === true ? '' : String(value));
      });
    }
    (children || []).forEach(function (child) {
      if (child == null || child === false) return;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return node;
  }
  function tr(key, fallback) {
    try { return window.BaqueanoLanguage && typeof window.BaqueanoLanguage.t === 'function' ? window.BaqueanoLanguage.t(key, { fallback: fallback }) : fallback; } catch (_) { return fallback; }
  }
  function icon(name, style) { return el('i', { className: 'fa-solid ' + name, 'aria-hidden': 'true', style: style }); }
  function formatDate(value) {
    if (!value) return '—';
    var date = new Date(value);
    if (!isFinite(date.getTime())) return '—';
    try { return date.toLocaleString('es-NI', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch (_) { return date.toISOString().slice(0, 16).replace('T', ' '); }
  }
  function toast(message, kind) {
    var engine = window.BaqueanoOpsEngine;
    if (engine && typeof engine.showToast === 'function') {
      try { engine.showToast(message, kind || 'info'); return; } catch (_) { /* respaldo abajo */ }
    }
    var box = el('div', {
      role: 'status', text: message,
      style: 'position:fixed;right:1.25rem;bottom:1.25rem;z-index:9999;max-width:360px;padding:0.85rem 1rem;border-radius:10px;' +
        'background:' + (kind === 'error' ? '#7f1d1d' : '#165D6F') + ';color:#fff;font-size:0.85rem;box-shadow:0 18px 40px rgba(15,23,42,0.45);'
    });
    document.body.appendChild(box);
    setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 4200);
  }
  function chip(text, color) {
    return el('span', {
      text: text,
      style: 'display:inline-flex;align-items:center;gap:0.3rem;padding:0.2rem 0.6rem;border-radius:999px;font-size:0.72rem;font-weight:600;' +
        'background:' + (color || 'rgba(22,93,111,0.25)') + ';color:#F4E6C1;'
    });
  }
  function emptyState(iconName, title, desc) {
    return el('div', { className: 'ops-empty-state' }, [
      icon(iconName + ' ops-empty-icon'),
      el('div', { className: 'ops-empty-title', text: title }),
      el('div', { className: 'ops-empty-desc', text: desc })
    ]);
  }
  function actionButton(label, iconName, kind, handler) {
    return el('button', { type: 'button', className: 'btn-ops-matte' + (kind ? ' ' + kind : ''), onclick: handler }, [icon(iconName), ' ' + label]);
  }
  var FIELD_STYLE = 'width:100%;padding:0.6rem 0.75rem;border-radius:8px;border:1px solid var(--ops-border-subtle);background:rgba(15,23,42,0.6);color:#fff;font:inherit;font-size:0.82rem;resize:vertical;';

  // --------------------------------------------------------------------------
  // Cliente de la Edge Function
  // --------------------------------------------------------------------------
  function call(action, payload) {
    var user = null;
    try { user = window.firebase && window.firebase.auth ? window.firebase.auth().currentUser : null; } catch (_) { user = null; }
    var tokenPromise = user && typeof user.getIdToken === 'function' ? user.getIdToken().catch(function () { return null; }) : Promise.resolve(null);
    return tokenPromise.then(function (token) {
      var headers = { 'content-type': 'application/json' };
      if (token) headers['x-firebase-token'] = token;
      return fetch(ENDPOINT, { method: 'POST', headers: headers, body: JSON.stringify(Object.assign({ action: action }, payload || {})) });
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (data) {
        if (res.ok && data && data.ok !== false) return data;
        var e = new Error((data && data.error) || 'No se pudo completar la acción.');
        e.status = res.status; throw e;
      });
    });
  }
  function errorMessage(error) {
    if (!error) return 'No se pudo completar la acción.';
    if (error.status === 401) return 'Iniciá sesión con tu cuenta administradora para moderar.';
    if (error.status === 403) return error.message || 'Tu cuenta no tiene permiso para esta acción.';
    if (!error.status) return 'No se pudo conectar con la Edge Function baqueano-reviews.';
    return error.message || 'No se pudo completar la acción.';
  }

  // --------------------------------------------------------------------------
  // Indicador del menú lateral
  // --------------------------------------------------------------------------
  function updateNavBadge(totals) {
    var badge = document.getElementById('badgeCount-37');
    if (!badge) return;
    var pending = Number(totals && totals.pending) || 0;
    badge.textContent = pending > 99 ? '99+' : String(pending);
    badge.style.display = pending === 0 ? 'none' : '';
    badge.title = pending + ' opiniones pendientes de revisión';
  }

  // --------------------------------------------------------------------------
  // Estructura de la vista
  // --------------------------------------------------------------------------
  function header() {
    return el('div', { className: 'ops-view-header' }, [
      el('div', { className: 'ops-view-title-group' }, [
        el('h1', null, [icon('fa-star', 'color: var(--bq-secondary);'), ' Opiniones BAQUEANO']),
        el('p', { className: 'ops-view-subtitle', text: 'OPINIONES SOBRE LA PLATAFORMA · REVISIÓN, REPORTES Y RESPUESTA INSTITUCIONAL · SIN BORRADO DIRECTO' })
      ]),
      el('div', { className: 'ops-view-actions' }, [
        el('a', { className: 'btn-ops-matte', href: 'normas-comunidad.html', target: '_blank', rel: 'noopener' }, [icon('fa-scale-balanced'), ' Normas']),
        el('a', { className: 'btn-ops-matte', href: 'opiniones.html', target: '_blank', rel: 'noopener' }, [icon('fa-arrow-up-right-from-square'), ' Ver página pública']),
        el('button', { type: 'button', className: 'btn-ops-matte primary', onclick: function () { load(); } }, [icon('fa-arrows-rotate'), ' Actualizar'])
      ])
    ]);
  }

  function filters() {
    var totals = state.totals || {};
    return el('div', { className: 'ops-crud-toolbar' }, [
      el('div', { className: 'ops-filter-group', role: 'tablist', 'aria-label': 'Estado de las opiniones' }, STATES.map(function (s) {
        var active = state.status === s.id;
        var count = s.id === 'reports' ? null : Number(totals[s.id]) || 0;
        return el('button', {
          type: 'button', role: 'tab', 'aria-selected': active ? 'true' : 'false',
          className: 'ops-filter-pill' + (active ? ' is-active' : ''),
          onclick: function () { if (state.status === s.id || state.busy) return; state.status = s.id; load(); }
        }, [icon(s.icon), ' ' + s.label + (count == null ? '' : ' '), count == null ? null : el('span', { className: 'ops-filter-count', text: String(count) })]);
      }))
    ]);
  }

  function stars(rating) {
    var n = Math.max(0, Math.min(5, Number(rating) || 0));
    return el('span', { 'aria-label': n + ' de 5 estrellas', role: 'img', style: 'color:#F59E0B;letter-spacing:1px;' }, ['★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n)]);
  }

  function historyBlock(history) {
    if (!history || !history.length) return null;
    return el('details', { style: 'margin-top:0.75rem;font-size:0.78rem;color:var(--ops-text-secondary);' }, [
      el('summary', { style: 'cursor:pointer;', text: 'Historial (' + history.length + ')' }),
      el('ol', { style: 'margin:0.5rem 0 0;padding-left:1.2rem;' }, history.map(function (h) {
        var who = h.actor_type === 'admin' ? 'Equipo' + (h.actor_role ? ' (' + h.actor_role + ')' : '') : h.actor_type === 'user' ? 'Usuario' : 'Sistema';
        var change = h.from_status && h.to_status && h.from_status !== h.to_status ? ' · ' + h.from_status + ' → ' + h.to_status : '';
        return el('li', null, [
          el('strong', { text: EVENT_LABELS[h.action] || h.action }),
          ' · ' + who + change + ' · ' + formatDate(h.created_at),
          h.reason ? el('div', { style: 'color:var(--ops-text-muted);overflow-wrap:anywhere;', text: 'Motivo: ' + h.reason }) : null
        ]);
      }))
    ]);
  }

  function reviewCard(item) {
    var reason = el('textarea', { rows: 2, maxlength: 500, placeholder: 'Motivo (obligatorio para rechazar, ocultar, marcar o resolver reportes; queda en la auditoría)', 'aria-label': 'Motivo de la decisión', style: FIELD_STYLE });
    var response = el('textarea', { rows: 3, maxlength: 1000, placeholder: 'Respuesta institucional pública. Se mostrará como "Respuesta de BAQUEANO", separada del texto del usuario.', 'aria-label': 'Respuesta de BAQUEANO', style: FIELD_STYLE });
    response.value = item.response_text || '';
    var closed = item.status === 'withdrawn' || !!item.erased_at;

    function needReason() {
      var value = reason.value.trim();
      if (value.length < 5) { toast(tr('opsReviews.reasonRequired', 'Escribí un motivo de al menos 5 caracteres.'), 'error'); reason.focus(); return null; }
      return value;
    }
    function moderate(decision) {
      var body = { reviewId: item.id, decision: decision };
      if (decision !== 'approve') { var r = needReason(); if (!r) return; body.reason = r; }
      else if (reason.value.trim()) body.reason = reason.value.trim();
      run(call('moderate', body), 'Opinión actualizada.');
    }

    var actions = [];
    if (!closed) {
      if (item.status !== 'approved') actions.push(actionButton('Aprobar y publicar', 'fa-circle-check', 'accent', function () { moderate('approve'); }));
      if (item.status !== 'rejected') actions.push(actionButton('Rechazar', 'fa-ban', '', function () { moderate('reject'); }));
      if (item.status !== 'hidden') actions.push(actionButton('Ocultar', 'fa-eye-slash', '', function () { moderate('hide'); }));
      if (item.status !== 'reported') actions.push(actionButton('Marcar como reportada', 'fa-flag', '', function () { moderate('mark_reported'); }));
    }

    var reports = (item.reports || []).filter(function (r) { return r.status === 'open'; });
    var reportsBox = reports.length ? el('div', { style: 'margin-top:0.85rem;padding:0.75rem;border-radius:8px;background:rgba(246,94,1,0.12);border:1px solid rgba(246,94,1,0.35);' }, [
      el('strong', { style: 'display:block;font-size:0.8rem;color:#F65E01;margin-bottom:0.4rem;' }, [icon('fa-flag'), ' ' + reports.length + (reports.length === 1 ? ' reporte abierto' : ' reportes abiertos')])
    ].concat(reports.map(function (r) {
      return el('div', { style: 'display:flex;gap:0.5rem;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;padding:0.4rem 0;border-top:1px solid rgba(246,94,1,0.2);font-size:0.78rem;color:var(--ops-text-secondary);' }, [
        el('div', { style: 'flex:1 1 220px;min-width:0;overflow-wrap:anywhere;' }, [el('strong', { text: (REPORT_REASONS[r.reason] || r.reason) + ': ' }), r.details || 'sin detalle', el('span', { style: 'color:var(--ops-text-muted);', text: ' · ' + formatDate(r.created_at) })]),
        el('div', { style: 'display:flex;gap:0.4rem;flex-wrap:wrap;' }, [
          actionButton('Resolver', 'fa-check', '', function () { var v = needReason(); if (v) run(call('resolve_report', { reportId: r.id, outcome: 'resolved', reason: v }), 'Reporte resuelto.'); }),
          actionButton('Descartar', 'fa-xmark', '', function () { var v = needReason(); if (v) run(call('resolve_report', { reportId: r.id, outcome: 'dismissed', reason: v }), 'Reporte descartado.'); })
        ])
      ]);
    }))) : null;

    var responseBox = closed ? null : el('div', { style: 'margin-top:0.85rem;' }, [
      el('label', { style: 'display:block;font-size:0.78rem;font-weight:600;color:#F4E6C1;margin-bottom:0.35rem;', text: 'Respuesta de BAQUEANO' }),
      response,
      el('div', { style: 'display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.5rem;' }, [
        actionButton(item.response_text ? 'Actualizar respuesta' : 'Publicar respuesta', 'fa-reply', '', function () {
          var text = response.value.trim();
          if (text.length < 2) { toast(tr('opsReviews.responseRequired', 'Escribí la respuesta antes de publicarla.'), 'error'); response.focus(); return; }
          run(call('respond', { reviewId: item.id, text: text }), 'Respuesta guardada.');
        }),
        item.response_text ? actionButton('Retirar respuesta', 'fa-eraser', '', function () {
          if (window.confirm('¿Retirar la respuesta institucional de esta opinión?')) run(call('respond', { reviewId: item.id, remove: true }), 'Respuesta retirada.');
        }) : null
      ])
    ]);

    var statusLabel = (STATES.filter(function (s) { return s.id === item.status; })[0] || { label: item.status }).label;
    return el('article', {
      className: 'ops-table-container-matte', 'data-id': item.id,
      style: 'padding:1.25rem;border-left:3px solid ' + (item.open_reports > 0 || item.status === 'reported' ? '#F65E01' : item.status === 'approved' ? '#3ECF8E' : '#165D6F') + ';'
    }, [
      el('div', { style: 'display:flex;gap:0.75rem;align-items:center;justify-content:space-between;flex-wrap:wrap;' }, [
        el('div', { style: 'min-width:0;' }, [
          el('strong', { text: item.display_name_snapshot || (item.erased_at ? 'Datos borrados por su autor' : 'Usuario BAQUEANO'), style: 'display:block;color:#fff;font-size:0.88rem;' }),
          el('span', { style: 'font-size:0.74rem;color:var(--ops-text-muted);', text: 'Usuario ' + (item.user_ref || '—') + ' · ' + (item.auth_provider || '—') + ' · ' + (item.platform || 'web') + ' · ' + (item.language || '—') })
        ]),
        el('span', { className: 'ops-badge-pill ' + (item.status === 'approved' ? 'published' : 'draft'), text: statusLabel })
      ]),
      el('div', { style: 'display:flex;gap:0.4rem;flex-wrap:wrap;align-items:center;margin:0.75rem 0 0.5rem;' }, [
        stars(item.rating),
        chip('Enviada ' + formatDate(item.created_at)),
        item.edit_count ? chip('Editada ' + item.edit_count + ' vez/veces') : null,
        item.published_at ? chip('Publicada ' + formatDate(item.published_at), 'rgba(62,207,142,0.25)') : null,
        item.deletion_requested_at ? chip('Pidió eliminación', 'rgba(246,94,1,0.3)') : null,
        chip('Consentimiento ' + (item.consent_version || '—'))
      ]),
      item.comment ? el('p', { text: item.comment, style: 'margin:0;white-space:pre-line;font-size:0.88rem;line-height:1.6;color:var(--ops-text-secondary);overflow-wrap:anywhere;' }) : el('p', { text: 'Texto borrado por su autor.', style: 'margin:0;font-style:italic;color:var(--ops-text-muted);font-size:0.82rem;' }),
      item.improvement ? el('p', { style: 'margin:0.6rem 0 0;font-size:0.8rem;color:var(--ops-text-secondary);white-space:pre-line;overflow-wrap:anywhere;' }, [el('strong', { text: 'Qué mejorar (privado): ' }), item.improvement]) : null,
      item.moderation_reason ? el('p', { style: 'margin:0.6rem 0 0;font-size:0.78rem;color:var(--ops-text-muted);overflow-wrap:anywhere;', text: 'Último motivo: ' + item.moderation_reason + (item.moderated_by ? ' · ' + item.moderated_by : '') + ' · ' + formatDate(item.moderated_at) }) : null,
      reportsBox,
      closed ? null : el('div', { style: 'margin-top:0.85rem;' }, [reason]),
      actions.length ? el('div', { style: 'display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.6rem;' }, actions) : null,
      responseBox,
      historyBlock(item.history)
    ]);
  }

  // --------------------------------------------------------------------------
  // Carga y acciones
  // --------------------------------------------------------------------------
  function paint(nodes) { if (state.panel) state.panel.replaceChildren.apply(state.panel, nodes); }

  function load() {
    if (!state.panel) return;
    var requestId = ++state.requestId;
    state.busy = true;
    paint([header(), filters(), emptyState('fa-spinner fa-spin', 'Cargando opiniones…', 'Consultando la Edge Function baqueano-reviews.')]);
    call('mod_list', { status: state.status }).then(function (data) {
      if (requestId !== state.requestId) return;
      state.totals = data.totals || {};
      updateNavBadge(state.totals);
      var items = Array.isArray(data.items) ? data.items : [];
      var label = (STATES.filter(function (s) { return s.id === state.status; })[0] || {}).label || state.status;
      var note = el('p', { style: 'margin:0 0 1rem;font-size:0.78rem;color:var(--ops-text-muted);', text: 'Rechazar una opinión solo por ser negativa va contra las Normas de la Comunidad. Cada decisión queda en audit_logs con tu cuenta, la fecha y el motivo. No existe borrado directo.' });
      var list = items.length
        ? el('div', { style: 'display:grid;gap:1rem;' }, items.map(reviewCard))
        : emptyState('fa-inbox', 'Sin opiniones en "' + label + '"', state.status === 'pending' ? 'Cuando un usuario publique su opinión aparecerá aquí para revisarla.' : 'No hay registros en este estado.');
      var more = data.total > items.length ? el('p', { style: 'margin-top:1rem;font-size:0.78rem;color:var(--ops-text-muted);', text: 'Mostrando ' + items.length + ' de ' + data.total + '.' }) : null;
      paint([header(), filters(), note, list, more]);
    }).catch(function (error) {
      if (requestId !== state.requestId) return;
      paint([header(), filters(), emptyState('fa-shield-halved', 'No se pudo abrir la moderación de opiniones', errorMessage(error))]);
    }).then(function () { if (requestId === state.requestId) state.busy = false; });
  }

  function run(promise, okMessage) {
    state.busy = true;
    promise.then(function () { toast(okMessage, 'success'); load(); })
      .catch(function (error) { state.busy = false; toast(errorMessage(error), 'error'); });
  }

  function refreshBadge() {
    if (state.panel && state.panel.classList.contains('is-active')) return;
    call('mod_list', { status: 'pending' }).then(function (data) { updateNavBadge(data.totals || {}); })
      .catch(function () { /* sin sesión o sin permiso: el indicador queda oculto */ });
  }
  function watchAuth() {
    try {
      if (window.firebase && window.firebase.auth) {
        window.firebase.auth().onAuthStateChanged(function (user) { if (user) refreshBadge(); });
        return;
      }
    } catch (_) { /* Firebase aún no listo */ }
    setTimeout(watchAuth, 800);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchAuth);
  else watchAuth();

  window.BaqueanoPlatformReviewsModeration = {
    render: function (panel) { state.panel = panel || document.getElementById('view-37-opiniones'); load(); },
    refresh: load
  };
})(window, document);
