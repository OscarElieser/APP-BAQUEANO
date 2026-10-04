// ============================================================================
// 🧭 BAQUEANO — OPS CENTER: MODERACIÓN DE LA COMUNIDAD (ops-community-moderation.js)
// ============================================================================
// 🎯 POR QUÉ:
// - Toda experiencia nueva de viajeros entra como `pending_review` y no se ve
//   en testimonios.html hasta que el equipo la apruebe. Sin esta vista la
//   comunidad quedaba bloqueada: se podía publicar pero nada salía al público.
// - Las denuncias (3 abiertas ocultan solas una publicación o comentario)
//   también necesitan una bandeja donde resolverse.
//
// ⚙️ CÓMO:
// - Usa exclusivamente la Edge Function `baqueano-community` a través de
//   window.BaqueanoCommunity (js/community-api.js): mod_queue, moderate y
//   mod_comment. La función verifica el token de Firebase y que la cuenta sea
//   administradora (claims o public.official_super_admins); este archivo no
//   decide permisos, solo muestra lo que el servidor autoriza.
// - Todo texto de usuarios se pinta con textContent (nunca innerHTML) para
//   impedir inyección de HTML/JS desde una publicación.
// - Imágenes en miniatura con tamaño acotado, `loading="lazy"` y
//   `decoding="async"`: la cola nunca descarga fotos completas.
// - Una sola petición en vuelo por vista (token de solicitud) para que un
//   cambio rápido de filtro no pinte resultados viejos.
//
// 📦 QUÉ:
// - window.BaqueanoCommunityModeration = { render(panel), refresh() }.
// - Filtros por estado con contadores, tarjetas con aprobar / ocultar /
//   rechazar / destacar / visita verificada / nota de moderación, bandeja de
//   comentarios denunciados u ocultos e indicador en el menú lateral.
// ============================================================================
(function (window, document) {
  'use strict';
  if (window.BaqueanoCommunityModeration) return;

  var STATES = [
    { id: 'pending_review', label: 'Pendientes', icon: 'fa-hourglass-half' },
    { id: 'reported', label: 'Denunciadas', icon: 'fa-flag' },
    { id: 'published', label: 'Publicadas', icon: 'fa-circle-check' },
    { id: 'hidden', label: 'Ocultas', icon: 'fa-eye-slash' },
    { id: 'rejected', label: 'Rechazadas', icon: 'fa-ban' }
  ];
  var REASONS = { spam: 'Spam', ofensivo: 'Ofensivo', falso: 'Falso', privacidad: 'Privacidad', peligroso: 'Peligroso', otro: 'Otro' };
  var TYPES = {
    naturaleza: 'Naturaleza', cultura: 'Cultura', gastronomia: 'Gastronomía', aventura: 'Aventura', playa: 'Playa',
    montana: 'Montaña', comunidad: 'Comunidad', historia: 'Historia', ecoturismo: 'Ecoturismo', hospedaje: 'Hospedaje',
    restaurante: 'Restaurante', tour: 'Tour', evento: 'Evento', otro: 'Otro'
  };

  var state = { status: 'pending_review', panel: null, requestId: 0, busy: false };

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

  function icon(name, style) {
    return el('i', { className: 'fa-solid ' + name, 'aria-hidden': 'true', style: style });
  }

  function formatDate(value) {
    if (!value) return '—';
    var date = new Date(value);
    if (!isFinite(date.getTime())) return '—';
    try {
      return date.toLocaleString('es-NI', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (_) {
      return date.toISOString().slice(0, 16).replace('T', ' ');
    }
  }

  function formatMonth(value) {
    if (!value) return null;
    var date = new Date(value);
    if (!isFinite(date.getTime())) return null;
    try { return date.toLocaleDateString('es-NI', { month: 'long', year: 'numeric', timeZone: 'UTC' }); } catch (_) { return null; }
  }

  function toast(message, kind) {
    var engine = window.BaqueanoOpsEngine;
    if (engine && typeof engine.showToast === 'function') {
      try { engine.showToast(message, kind || 'info'); return; } catch (_) { /* respaldo abajo */ }
    }
    var box = el('div', {
      role: 'status',
      text: message,
      style: 'position:fixed;right:1.25rem;bottom:1.25rem;z-index:9999;max-width:360px;padding:0.85rem 1rem;border-radius:10px;' +
        'background:' + (kind === 'error' ? '#7f1d1d' : '#165D6F') + ';color:#fff;font-size:0.85rem;box-shadow:0 18px 40px rgba(15,23,42,0.45);'
    });
    document.body.appendChild(box);
    setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 4200);
  }

  function api() {
    return window.BaqueanoCommunity && typeof window.BaqueanoCommunity.call === 'function' ? window.BaqueanoCommunity : null;
  }

  function errorMessage(error) {
    if (!error) return 'No se pudo completar la acción.';
    if (error.status === 401) return 'Iniciá sesión con tu cuenta administradora para moderar.';
    if (error.status === 403) return 'Tu cuenta no tiene permiso de moderación.';
    return error.message || 'No se pudo completar la acción.';
  }

  // --------------------------------------------------------------------------
  // Indicador en el menú lateral
  // --------------------------------------------------------------------------
  function updateNavBadge(counts) {
    var badge = document.getElementById('badgeCount-36');
    if (!badge) return;
    var pending = Number(counts && counts.pending_review) || 0;
    var reported = Number(counts && counts.reported) || 0;
    var total = pending + reported;
    badge.textContent = total > 99 ? '99+' : String(total);
    badge.style.display = total === 0 ? 'none' : '';
    badge.title = pending + ' pendientes · ' + reported + ' denunciadas';
  }

  // --------------------------------------------------------------------------
  // Estructura de la vista
  // --------------------------------------------------------------------------
  function header() {
    return el('div', { className: 'ops-view-header' }, [
      el('div', { className: 'ops-view-title-group' }, [
        el('h1', null, [icon('fa-people-group', 'color: var(--bq-secondary);'), ' Comunidad · Moderación']),
        el('p', { className: 'ops-view-subtitle', text: 'EXPERIENCIAS DE VIAJEROS · APROBACIÓN, DENUNCIAS Y COMENTARIOS · SUPABASE + FIREBASE AUTH' })
      ]),
      el('div', { className: 'ops-view-actions' }, [
        el('a', { className: 'btn-ops-matte', href: 'testimonios.html', target: '_blank', rel: 'noopener' }, [icon('fa-arrow-up-right-from-square'), ' Ver página pública']),
        el('button', { type: 'button', className: 'btn-ops-matte primary', onclick: function () { load(); } }, [icon('fa-arrows-rotate'), ' Actualizar'])
      ])
    ]);
  }

  function filters(counts) {
    return el('div', { className: 'ops-crud-toolbar' }, [
      el('div', { className: 'ops-filter-group', role: 'tablist', 'aria-label': 'Estado de las experiencias' }, STATES.map(function (s) {
        var active = state.status === s.id;
        return el('button', {
          type: 'button',
          role: 'tab',
          'aria-selected': active ? 'true' : 'false',
          className: 'ops-filter-pill' + (active ? ' is-active' : ''),
          onclick: function () {
            if (state.status === s.id || state.busy) return;
            state.status = s.id;
            load();
          }
        }, [icon(s.icon), ' ' + s.label + ' ', el('span', { className: 'ops-filter-count', text: String(Number(counts && counts[s.id]) || 0) })]);
      }))
    ]);
  }

  function emptyState(iconName, title, desc) {
    return el('div', { className: 'ops-empty-state' }, [
      icon(iconName + ' ops-empty-icon'),
      el('div', { className: 'ops-empty-title', text: title }),
      el('div', { className: 'ops-empty-desc', text: desc })
    ]);
  }

  function chip(text, color) {
    return el('span', {
      text: text,
      style: 'display:inline-flex;align-items:center;gap:0.3rem;padding:0.2rem 0.6rem;border-radius:999px;font-size:0.72rem;font-weight:600;' +
        'background:' + (color || 'rgba(22,93,111,0.25)') + ';color:#F4E6C1;'
    });
  }

  function mediaStrip(media) {
    if (!media || !media.length) return null;
    return el('div', { style: 'display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.75rem;' }, media.map(function (m) {
      var src = m.thumb || (m.kind === 'image' ? m.url : null);
      var inner = src
        ? el('img', { src: src, alt: m.kind === 'video' ? 'Portada del video' : 'Foto de la experiencia', width: 96, height: 72, loading: 'lazy', decoding: 'async', style: 'width:96px;height:72px;object-fit:cover;display:block;' })
        : el('div', { style: 'width:96px;height:72px;display:flex;align-items:center;justify-content:center;background:#0F172A;' }, [icon('fa-film')]);
      return el('a', {
        href: m.url || '#', target: '_blank', rel: 'noopener',
        title: m.kind === 'video' ? 'Abrir video' : 'Abrir foto',
        style: 'position:relative;border-radius:8px;overflow:hidden;border:1px solid var(--ops-border-subtle);'
      }, [inner, m.kind === 'video' ? el('span', { style: 'position:absolute;inset:auto 4px 4px auto;font-size:0.7rem;color:#fff;background:rgba(15,23,42,0.75);padding:0.1rem 0.35rem;border-radius:6px;' }, [icon('fa-play')]) : null]);
    }));
  }

  function reportsBlock(reports) {
    var open = (reports || []).filter(function (r) { return r.status === 'open'; });
    if (!open.length) return null;
    return el('div', { style: 'margin-top:0.85rem;padding:0.75rem;border-radius:8px;background:rgba(246,94,1,0.12);border:1px solid rgba(246,94,1,0.35);' }, [
      el('strong', { style: 'display:block;font-size:0.8rem;color:#F65E01;margin-bottom:0.4rem;' }, [icon('fa-flag'), ' ' + open.length + (open.length === 1 ? ' denuncia abierta' : ' denuncias abiertas')]),
      el('ul', { style: 'margin:0;padding-left:1.1rem;font-size:0.78rem;color:var(--ops-text-secondary);' }, open.slice(0, 8).map(function (r) {
        return el('li', null, [
          el('strong', { text: (REASONS[r.reason] || r.reason) + ': ' }),
          r.details || 'sin detalle',
          el('span', { style: 'color:var(--ops-text-muted);', text: ' · ' + formatDate(r.created_at) })
        ]);
      }))
    ]);
  }

  function actionButton(label, iconName, kind, handler) {
    return el('button', { type: 'button', className: 'btn-ops-matte' + (kind ? ' ' + kind : ''), onclick: handler }, [icon(iconName), ' ' + label]);
  }

  function testimonialCard(item) {
    var note = el('textarea', {
      rows: 2, maxlength: 500,
      placeholder: 'Nota de moderación (la ve el autor en "Mis experiencias")',
      'aria-label': 'Nota de moderación',
      style: 'width:100%;margin-top:0.75rem;padding:0.6rem 0.75rem;border-radius:8px;border:1px solid var(--ops-border-subtle);background:rgba(15,23,42,0.6);color:#fff;font:inherit;font-size:0.82rem;resize:vertical;'
    });
    note.value = item.moderation_note || '';

    function moderate(patch, confirmText) {
      if (confirmText && !window.confirm(confirmText)) return;
      var body = Object.assign({ id: item.id }, patch);
      var trimmed = note.value.trim();
      if (trimmed !== (item.moderation_note || '')) body.note = trimmed;
      run(api().call('moderate', body), 'Experiencia actualizada.');
    }

    var place = [item.destination_name || item.place_name, item.municipality, item.department_id].filter(Boolean).join(' · ');
    var meta = [
      item.experience_type ? chip(TYPES[item.experience_type] || item.experience_type) : null,
      item.rating ? chip('★ ' + item.rating + '/5', 'rgba(246,94,1,0.25)') : null,
      formatMonth(item.visit_month) ? chip('Visita: ' + formatMonth(item.visit_month)) : null,
      item.featured ? chip('Destacada', 'rgba(246,94,1,0.35)') : null,
      item.verified_visit ? chip('Visita verificada', 'rgba(62,207,142,0.25)') : null,
      item.photo_count ? chip(item.photo_count + ' foto(s)') : null,
      item.video_count ? chip(item.video_count + ' video') : null,
      item.comments_count ? chip(item.comments_count + ' comentario(s)') : null
    ];

    var actions = [];
    if (item.status !== 'published') actions.push(actionButton('Aprobar y publicar', 'fa-circle-check', 'accent', function () { moderate({ status: 'published' }); }));
    if (item.status !== 'hidden') actions.push(actionButton('Ocultar', 'fa-eye-slash', '', function () { moderate({ status: 'hidden' }); }));
    if (item.status !== 'rejected') {
      actions.push(actionButton('Rechazar', 'fa-ban', '', function () {
        moderate({ status: 'rejected' }, 'Rechazar elimina las fotos y videos de esta experiencia para liberar almacenamiento. ¿Continuar?');
      }));
    }
    actions.push(actionButton(item.featured ? 'Quitar destacado' : 'Destacar', 'fa-star', '', function () { moderate({ featured: !item.featured }); }));
    actions.push(actionButton(item.verified_visit ? 'Quitar verificación' : 'Visita verificada', 'fa-certificate', '', function () { moderate({ verified_visit: !item.verified_visit }); }));
    actions.push(actionButton('Guardar nota', 'fa-floppy-disk', '', function () { moderate({}); }));

    return el('article', {
      className: 'ops-table-container-matte',
      'data-id': item.id,
      style: 'padding:1.25rem;border-left:3px solid ' + (item.status === 'reported' ? '#F65E01' : item.status === 'published' ? '#3ECF8E' : '#165D6F') + ';'
    }, [
      el('div', { style: 'display:flex;gap:0.75rem;align-items:center;justify-content:space-between;flex-wrap:wrap;' }, [
        el('div', { style: 'display:flex;gap:0.65rem;align-items:center;min-width:0;' }, [
          item.author_avatar
            ? el('img', { src: item.author_avatar, alt: '', width: 36, height: 36, loading: 'lazy', decoding: 'async', referrerpolicy: 'no-referrer', style: 'width:36px;height:36px;border-radius:50%;object-fit:cover;' })
            : el('span', { style: 'width:36px;height:36px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:#165D6F;color:#F4E6C1;' }, [icon('fa-user')]),
          el('div', { style: 'min-width:0;' }, [
            el('strong', { text: item.author_name || 'Viajero', style: 'display:block;color:#fff;font-size:0.88rem;' }),
            el('span', { text: 'Enviada ' + formatDate(item.created_at) + (item.published_at ? ' · Publicada ' + formatDate(item.published_at) : ''), style: 'font-size:0.74rem;color:var(--ops-text-muted);' })
          ])
        ]),
        el('span', { className: 'ops-badge-pill ' + (item.status === 'published' ? 'published' : 'draft'), text: (STATES.filter(function (s) { return s.id === item.status; })[0] || { label: item.status }).label })
      ]),
      el('h3', { text: item.title, style: 'margin:0.85rem 0 0.25rem;color:#fff;font-size:1.05rem;line-height:1.35;overflow-wrap:anywhere;' }),
      place ? el('div', { style: 'font-size:0.78rem;color:var(--ops-text-secondary);margin-bottom:0.5rem;' }, [icon('fa-location-dot'), ' ', place]) : null,
      el('div', { style: 'display:flex;gap:0.4rem;flex-wrap:wrap;margin:0.4rem 0 0.6rem;' }, meta),
      el('p', { text: item.body, style: 'margin:0;white-space:pre-line;font-size:0.86rem;line-height:1.6;color:var(--ops-text-secondary);overflow-wrap:anywhere;max-height:16rem;overflow:auto;' }),
      item.recommendations ? el('p', { style: 'margin:0.6rem 0 0;font-size:0.8rem;color:var(--ops-text-secondary);white-space:pre-line;overflow-wrap:anywhere;' }, [el('strong', { text: 'Recomendaciones: ' }), item.recommendations]) : null,
      item.tips ? el('p', { style: 'margin:0.4rem 0 0;font-size:0.8rem;color:var(--ops-text-secondary);white-space:pre-line;overflow-wrap:anywhere;' }, [el('strong', { text: 'Consejos: ' }), item.tips]) : null,
      item.tags && item.tags.length ? el('div', { style: 'margin-top:0.5rem;font-size:0.76rem;color:var(--ops-text-muted);', text: item.tags.map(function (t) { return '#' + t; }).join(' ') }) : null,
      mediaStrip(item.media),
      reportsBlock(item.testimonial_reports),
      note,
      el('div', { style: 'display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.75rem;' }, actions)
    ]);
  }

  function commentRow(comment) {
    function act(status, confirmText) {
      if (confirmText && !window.confirm(confirmText)) return;
      run(api().call('mod_comment', { id: comment.id, status: status }), 'Comentario actualizado.');
    }
    return el('div', {
      style: 'display:flex;gap:1rem;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;padding:0.85rem 0;border-top:1px solid var(--ops-border-subtle);'
    }, [
      el('div', { style: 'flex:1 1 280px;min-width:0;' }, [
        el('div', { style: 'font-size:0.78rem;color:var(--ops-text-muted);margin-bottom:0.25rem;' }, [
          el('strong', { text: comment.author_name || 'Viajero', style: 'color:#fff;' }),
          ' · ' + formatDate(comment.created_at) + ' · ',
          chip(comment.status === 'reported' ? 'Denunciado (' + (comment.reports_count || 0) + ')' : 'Oculto', comment.status === 'reported' ? 'rgba(246,94,1,0.3)' : null)
        ]),
        el('p', { text: comment.body, style: 'margin:0;font-size:0.84rem;color:var(--ops-text-secondary);white-space:pre-line;overflow-wrap:anywhere;' })
      ]),
      el('div', { style: 'display:flex;gap:0.4rem;flex-wrap:wrap;' }, [
        actionButton('Restaurar', 'fa-rotate-left', 'accent', function () { act('published'); }),
        comment.status !== 'hidden' ? actionButton('Ocultar', 'fa-eye-slash', '', function () { act('hidden'); }) : null,
        actionButton('Eliminar', 'fa-trash', '', function () { act('deleted', '¿Eliminar este comentario de forma definitiva para el público?'); })
      ])
    ]);
  }

  // --------------------------------------------------------------------------
  // Carga y acciones
  // --------------------------------------------------------------------------
  function paint(nodes) {
    if (!state.panel) return;
    state.panel.replaceChildren.apply(state.panel, nodes);
  }

  function load() {
    var panel = state.panel;
    if (!panel) return;
    var client = api();
    if (!client) {
      paint([header(), emptyState('fa-plug-circle-exclamation', 'Cliente de la comunidad no disponible', 'No se cargó js/community-api.js. Recargá la página.')]);
      return;
    }
    var requestId = ++state.requestId;
    state.busy = true;
    paint([header(), filters(state.lastCounts), emptyState('fa-spinner fa-spin', 'Cargando la cola de moderación…', 'Consultando la Edge Function baqueano-community.')]);
    client.call('mod_queue', { status: state.status }).then(function (data) {
      if (requestId !== state.requestId) return;
      state.lastCounts = data.counts || {};
      updateNavBadge(state.lastCounts);
      var items = Array.isArray(data.items) ? data.items : [];
      var comments = Array.isArray(data.comments) ? data.comments : [];
      var label = (STATES.filter(function (s) { return s.id === state.status; })[0] || {}).label || state.status;
      var list = items.length
        ? el('div', { style: 'display:grid;gap:1rem;' }, items.map(testimonialCard))
        : emptyState('fa-inbox', 'Sin experiencias en "' + label + '"', state.status === 'pending_review' ? 'Cuando un viajero comparta su experiencia aparecerá aquí para aprobarla.' : 'No hay registros en este estado.');
      var commentsBox = el('section', { className: 'ops-table-container-matte', style: 'padding:1.25rem;margin-top:1.5rem;' }, [
        el('h2', { style: 'margin:0 0 0.25rem;font-size:1rem;color:#fff;' }, [icon('fa-comments', 'color:var(--bq-secondary);'), ' Comentarios denunciados u ocultos']),
        el('p', { style: 'margin:0 0 0.5rem;font-size:0.78rem;color:var(--ops-text-muted);', text: 'Con 3 denuncias abiertas un comentario se retira solo hasta que lo revisés.' })
      ].concat(comments.length ? comments.map(commentRow) : [el('p', { style: 'margin:0;font-size:0.82rem;color:var(--ops-text-secondary);', text: 'No hay comentarios pendientes de revisión.' })]));
      paint([header(), filters(state.lastCounts), list, commentsBox]);
    }).catch(function (error) {
      if (requestId !== state.requestId) return;
      paint([header(), filters(state.lastCounts), emptyState('fa-shield-halved', 'No se pudo abrir la moderación', errorMessage(error))]);
    }).then(function () {
      if (requestId === state.requestId) state.busy = false;
    });
  }

  function run(promise, okMessage) {
    state.busy = true;
    promise.then(function () {
      toast(okMessage, 'success');
      load();
    }).catch(function (error) {
      state.busy = false;
      toast(errorMessage(error), 'error');
    });
  }

  // Contador del menú sin abrir la vista (solo si hay sesión administradora).
  function refreshBadge() {
    var client = api();
    if (!client || state.panel && state.panel.classList.contains('is-active')) return;
    client.call('mod_queue', { status: 'pending_review' }).then(function (data) {
      updateNavBadge(data.counts || {});
    }).catch(function () { /* sin sesión o sin permiso: el indicador queda oculto */ });
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

  window.BaqueanoCommunityModeration = {
    render: function (panel) {
      state.panel = panel || document.getElementById('view-36-comunidad');
      load();
    },
    refresh: load
  };
})(window, document);
