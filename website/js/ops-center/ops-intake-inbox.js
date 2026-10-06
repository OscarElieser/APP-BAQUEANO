// ============================================================================
// 🧭 BAQUEANO — OPS CENTER: BUZÓN (ops-intake-inbox.js)
// ============================================================================
// 🎯 POR QUÉ:
// - Los mensajes de contacto, las solicitudes de la Red BAQUEANO y las denuncias ambientales ya se
//   guardan en Supabase con código (BAQ-CONTACT, BAQ-BIZ, BAQ-ECO). El equipo necesita verlos,
//   cambiar su estado con trazabilidad, derivar denuncias sin afirmar entregas que no ocurrieron y
//   abrir evidencias privadas.
//
// ⚙️ CÓMO:
// - Usa solo la Edge Function baqueano-intake:
//   - inbox_counts, inbox_list, inbox_update, eco_evidence_url y retry_notifications.
//   - El servidor decide los permisos: admin o superadmin gestionan, el auditor solo lee.
//   - Cada cambio queda en intake_events y audit_logs.
// - Todo texto de usuarios se pinta con textContent.
// - Las evidencias se abren con una URL firmada de 5 minutos, solo cuando el admin lo pide.
// - "Aprobada" no es "Publicada": son botones y etapas distintas, como pide el propietario.
//
// 📦 QUÉ:
// - window.BaqueanoOpsInbox = { render(panel), refresh() }.
// - Tres bandejas, filtros por estado, paginación, notas internas, mensaje al solicitante,
//   derivación de denuncias y estado del aviso por correo.
// ============================================================================
(function (window, document) {
  'use strict';
  if (window.BaqueanoOpsInbox) return;

  var ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-intake';
  var KINDS = {
    contact: { label: 'Mensajes', icon: 'fa-envelope', statuses: [['new', 'Nuevos'], ['in_review', 'En revisión'], ['answered', 'Respondidos'], ['closed', 'Cerrados']] },
    business: { label: 'Solicitudes de negocios', icon: 'fa-store', statuses: [['submitted', 'Enviadas'], ['under_review', 'En revisión'], ['needs_information', 'Falta información'], ['approved', 'Aprobadas'], ['published', 'Publicadas'], ['rejected', 'No aprobadas']] },
    eco: { label: 'Denuncias ambientales', icon: 'fa-leaf', statuses: [['received', 'Recibidas'], ['under_review', 'En revisión'], ['needs_information', 'Falta información'], ['referred', 'Derivadas'], ['closed', 'Cerradas'], ['archived', 'Archivadas']] }
  };
  var NOTIFY = { pending: 'Aviso por correo pendiente', sent: 'Aviso enviado al correo oficial', failed: 'El aviso por correo falló', not_configured: 'Aviso por correo sin configurar (falta proveedor)' };
  var state = { panel: null, kind: 'contact', status: '', page: 0, requestId: 0, counts: {}, notifications: {}, readOnly: true };

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'text') node.textContent = v;
      else if (k === 'className') node.className = v;
      else if (k === 'style') node.style.cssText = v;
      else if (k.indexOf('on') === 0 && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? '' : String(v));
    });
    (children || []).forEach(function (c) { if (c != null && c !== false) node.append(typeof c === 'string' ? document.createTextNode(c) : c); });
    return node;
  }
  function icon(name, style) { return el('i', { className: 'fa-solid ' + name, 'aria-hidden': 'true', style: style }); }
  function fmt(v) {
    if (!v) return '—';
    var d = new Date(v);
    if (!isFinite(d.getTime())) return '—';
    try { return d.toLocaleString('es-NI', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (_) { return d.toISOString(); }
  }
  function tr(key, fallback) {
    try { return window.BaqueanoLanguage && window.BaqueanoLanguage.t ? window.BaqueanoLanguage.t(key, { fallback: fallback }) : fallback; } catch (_) { return fallback; }
  }
  function toast(message, kind) {
    var engine = window.BaqueanoOpsEngine;
    if (engine && typeof engine.showToast === 'function') { try { engine.showToast(message, kind || 'info'); return; } catch (_) { /* respaldo */ } }
    var box = el('div', { role: 'status', text: message, style: 'position:fixed;right:1.25rem;bottom:1.25rem;z-index:9999;max-width:360px;padding:.85rem 1rem;border-radius:10px;color:#fff;font-size:.85rem;background:' + (kind === 'error' ? '#7f1d1d' : '#165D6F') });
    document.body.append(box); setTimeout(function () { box.remove(); }, 4200);
  }
  function call(action, payload) {
    var user = null;
    try { user = window.firebase && window.firebase.auth ? window.firebase.auth().currentUser : null; } catch (_) { user = null; }
    var tokenPromise = user && user.getIdToken ? user.getIdToken().catch(function () { return null; }) : Promise.resolve(null);
    return tokenPromise.then(function (token) {
      var headers = { 'content-type': 'application/json' };
      if (token) headers['x-firebase-token'] = token;
      return fetch(ENDPOINT, { method: 'POST', headers: headers, body: JSON.stringify(Object.assign({ action: action }, payload || {})) });
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (data) {
        if (res.ok && data && data.ok !== false) return data;
        var e = new Error((data && data.error) || 'No se pudo completar la acción.'); e.status = res.status; throw e;
      });
    });
  }
  function errorText(e) {
    if (!e) return 'No se pudo completar la acción.';
    if (e.status === 401) return 'Iniciá sesión con tu cuenta del equipo para ver el buzón.';
    if (!e.status) return 'No se pudo conectar con la Edge Function baqueano-intake.';
    return e.message;
  }
  var FIELD = 'width:100%;box-sizing:border-box;padding:.55rem .7rem;border-radius:8px;border:1px solid var(--ops-border-subtle);background:rgba(15,23,42,.6);color:#fff;font:inherit;font-size:.82rem;';
  function btn(label, iconName, kind, handler) { return el('button', { type: 'button', className: 'btn-ops-matte' + (kind ? ' ' + kind : ''), onclick: handler }, [icon(iconName), ' ' + label]); }
  function kv(label, value) {
    if (value == null || value === '' || (Array.isArray(value) && !value.length)) return null;
    return el('div', { style: 'display:grid;grid-template-columns:minmax(120px,30%) 1fr;gap:.6rem;font-size:.8rem;padding:.25rem 0;border-bottom:1px solid rgba(148,163,184,.12);' }, [
      el('span', { style: 'color:var(--ops-text-muted);', text: label }),
      el('span', { style: 'color:var(--ops-text-secondary);white-space:pre-line;overflow-wrap:anywhere;', text: Array.isArray(value) ? value.join(', ') : (typeof value === 'object' ? Object.keys(value).map(function (k) { return k + ': ' + value[k]; }).join(' · ') : String(value)) })
    ]);
  }

  // ------------------------------------------------------------------ estructura
  function header() {
    return el('div', { className: 'ops-view-header' }, [
      el('div', { className: 'ops-view-title-group' }, [
        el('h1', null, [icon('fa-inbox', 'color: var(--bq-secondary);'), ' Buzón BAQUEANO']),
        el('p', { className: 'ops-view-subtitle', text: 'CONTACTO · SOLICITUDES DE NEGOCIOS · DENUNCIAS AMBIENTALES · SUPABASE PRIMERO, CORREO SOLO COMO AVISO' })
      ]),
      el('div', { className: 'ops-view-actions' }, [
        state.readOnly ? null : btn('Reintentar avisos por correo', 'fa-paper-plane', '', function () {
          call('retry_notifications', {}).then(function (d) { toast(tr('opsInbox.retried', 'Avisos reintentados:') + ' ' + d.retried, 'success'); load(); }).catch(function (e) { toast(errorText(e), 'error'); });
        }),
        btn('Actualizar', 'fa-arrows-rotate', 'primary', function () { load(); })
      ])
    ]);
  }
  function kindTabs() {
    return el('div', { className: 'ops-filter-group', role: 'tablist', 'aria-label': 'Bandejas', style: 'margin-bottom:.75rem;' }, Object.keys(KINDS).map(function (k) {
      var counts = state.counts[k] || {};
      var open = k === 'contact' ? (counts.new || 0) : k === 'business' ? (counts.submitted || 0) + (counts.under_review || 0) : (counts.received || 0) + (counts.under_review || 0);
      return el('button', {
        type: 'button', role: 'tab', 'aria-selected': state.kind === k ? 'true' : 'false', className: 'ops-filter-pill' + (state.kind === k ? ' is-active' : ''),
        onclick: function () { if (state.kind === k) return; state.kind = k; state.status = ''; state.page = 0; load(); }
      }, [icon(KINDS[k].icon), ' ' + KINDS[k].label + ' ', el('span', { className: 'ops-filter-count', text: String(open) })]);
    }));
  }
  function statusFilters() {
    var counts = state.counts[state.kind] || {};
    var pills = [['', 'Todos']].concat(KINDS[state.kind].statuses).map(function (s) {
      return el('button', {
        type: 'button', className: 'ops-filter-pill' + (state.status === s[0] ? ' is-active' : ''), 'aria-pressed': state.status === s[0] ? 'true' : 'false',
        onclick: function () { state.status = s[0]; state.page = 0; load(); }
      }, [s[1] + ' ', el('span', { className: 'ops-filter-count', text: String(s[0] ? (counts[s[0]] || 0) : Object.keys(counts).reduce(function (a, k) { return a + counts[k]; }, 0)) })]);
    });
    return el('div', { className: 'ops-crud-toolbar' }, [el('div', { className: 'ops-filter-group', 'aria-label': 'Estado' }, pills)]);
  }
  function notificationLine() {
    var n = state.notifications || {};
    if (!n.not_configured && !n.failed) return null;
    return el('p', { role: 'note', style: 'margin:0 0 1rem;padding:.7rem .9rem;border-radius:8px;background:rgba(246,94,1,.12);border:1px solid rgba(246,94,1,.35);font-size:.8rem;color:#FDBA74;' }, [
      icon('fa-envelope-circle-check'), ' ',
      (n.not_configured ? n.not_configured + ' aviso(s) por correo sin enviar: falta configurar el proveedor de correo (RESEND_API_KEY e INTAKE_FROM_EMAIL en Supabase). ' : '') +
      (n.failed ? n.failed + ' aviso(s) fallaron. ' : '') + 'Los registros están guardados igual.'
    ]);
  }

  // ------------------------------------------------------------------ tarjetas
  function statusSelect(item) {
    var select = el('select', { 'aria-label': 'Nuevo estado', style: FIELD + 'width:auto;min-width:200px;' });
    KINDS[state.kind].statuses.forEach(function (s) { var o = el('option', { value: s[0], text: s[1] }); if (s[0] === item.status) o.selected = true; select.append(o); });
    return select;
  }
  function card(item) {
    var kind = state.kind;
    var details = [];
    var title = '';
    if (kind === 'contact') {
      title = (item.name || '—') + ' · ' + (item.subject || '');
      details = [kv('Correo', item.email), kv('Teléfono', item.phone), kv('Territorio', item.department), kv('Idioma', item.language), kv('Mensaje', item.message), kv('Atendido por', item.handled_by)];
    } else if (kind === 'business') {
      title = (item.business_name || '—') + ' · ' + (item.category || '');
      details = [kv('Nombre comercial', item.trade_name), kv('Responsable', [item.owner_name, item.owner_role].filter(Boolean).join(' — ')), kv('Correo', item.email), kv('Teléfono', item.phone), kv('WhatsApp', item.whatsapp), kv('Sitio web', item.website), kv('Redes', item.socials && Object.keys(item.socials).length ? item.socials : null),
        kv('Territorio', [item.department, item.municipality, item.community].filter(Boolean).join(' · ')), kv('Dirección', item.address), kv('Coordenadas', item.lat != null ? item.lat + ', ' + item.lng : null),
        kv('Descripción corta', item.short_description), kv('Descripción', item.description), kv('Ofrece', item.offerings), kv('Público', item.audience), kv('Horarios', item.schedule), kv('Temporada', item.season), kv('Capacidad', item.capacity),
        kv('Idiomas', item.languages), kv('Precios declarados', item.price_info), kv('Sostenibilidad', item.sustainability), kv('Impacto local', item.local_impact),
        kv('Consentimientos', item.consents ? 'datos: ' + !!item.consents.data + ' · veracidad: ' + !!item.consents.truth + ' · contacto: ' + !!item.consents.contact + ' · ' + (item.consents.version || '') : null),
        kv('Revisión iniciada', item.review_started_at ? fmt(item.review_started_at) : null), kv('Revisada por', item.reviewed_by), kv('Aprobada', item.approved_at ? fmt(item.approved_at) : null), kv('Publicada', item.published_at ? fmt(item.published_at) : null)];
    } else {
      title = (item.category || '—') + ' · ' + [item.department, item.municipality].filter(Boolean).join(' · ');
      details = [kv('Anónima', item.anonymous ? 'Sí' : 'No'), kv('Contacto', item.anonymous ? null : [item.contact_name, item.contact_phone, item.contact_email].filter(Boolean).join(' · ')),
        kv('Gravedad percibida', item.severity), kv('Prioridad interna', item.priority), kv('Responsable', item.assignee),
        kv('Fecha del incidente', item.incident_time_unsure ? 'No está seguro' : (item.incident_at ? fmt(item.incident_at) : null)),
        kv('Comunidad', item.community), kv('Referencia', item.reference), kv('Descripción', item.description),
        kv('Derivación', item.referred_to ? item.referred_to + ' · ' + (item.delivery_method || '') + ' · ' + (item.delivery_status || '') + (item.reference_number ? ' · ref. ' + item.reference_number : '') + ' · ' + fmt(item.referred_at) : null),
        kv('Nota pública', item.public_note)];
    }
    var map = null;
    if (item.lat != null && item.lng != null) {
      map = el('a', { href: 'https://www.openstreetmap.org/?mlat=' + item.lat + '&mlon=' + item.lng + '#map=16/' + item.lat + '/' + item.lng, target: '_blank', rel: 'noopener', className: 'btn-ops-matte', style: 'margin-top:.5rem;' }, [icon('fa-map-pin'), ' Ver punto exacto (' + item.lat + ', ' + item.lng + ' · ' + (item.location_source || 'mapa') + ')']);
    }
    var evidence = null;
    if (kind === 'eco') {
      var stored = (item.evidence || []).filter(function (e) { return e.status === 'stored'; });
      var rejected = (item.evidence || []).filter(function (e) { return e.status !== 'stored'; }).length;
      evidence = el('div', { style: 'margin-top:.6rem;display:flex;flex-wrap:wrap;gap:.4rem;align-items:center;font-size:.8rem;color:var(--ops-text-muted);' },
        [el('span', { text: 'Evidencias privadas: ' + stored.length + (rejected ? ' (+' + rejected + ' no guardadas)' : '') })].concat(stored.map(function (ev, i) {
          return btn((ev.file_type.indexOf('video') === 0 ? 'Video ' : 'Foto ') + (i + 1), ev.file_type.indexOf('video') === 0 ? 'fa-film' : 'fa-image', '', function () {
            call('eco_evidence_url', { evidenceId: ev.id }).then(function (d) { window.open(d.url, '_blank', 'noopener'); }).catch(function (e) { toast(errorText(e), 'error'); });
          });
        })));
    }
    var notification = item.notification ? el('span', { style: 'font-size:.72rem;color:var(--ops-text-muted);', text: NOTIFY[item.notification.status] || item.notification.status }) : null;
    var history = (item.history || []).length ? el('details', { style: 'margin-top:.6rem;font-size:.76rem;color:var(--ops-text-secondary);' }, [
      el('summary', { style: 'cursor:pointer;', text: 'Historial (' + item.history.length + ')' }),
      el('ol', { style: 'margin:.4rem 0 0;padding-left:1.2rem;' }, item.history.map(function (h) {
        return el('li', null, [h.action + (h.from_status && h.to_status && h.from_status !== h.to_status ? ' · ' + h.from_status + ' → ' + h.to_status : '') + ' · ' + (h.actor_type === 'admin' ? 'Equipo' + (h.actor_role ? ' (' + h.actor_role + ')' : '') : h.actor_type) + ' · ' + fmt(h.created_at) + (h.note ? ' · ' + h.note : '')]);
      }))
    ]) : null;

    var controls = null;
    if (!state.readOnly && item.status !== 'archived') {
      var select = statusSelect(item);
      var note = el('input', { type: 'text', maxlength: 1000, placeholder: 'Nota del cambio (obligatoria para rechazar, pedir información o archivar)', 'aria-label': 'Nota del cambio', style: FIELD });
      var internal = el('textarea', { rows: 2, maxlength: 4000, 'aria-label': 'Notas internas', placeholder: 'Notas internas (no las ve el usuario)', style: FIELD + 'resize:vertical;' });
      internal.value = (kind === 'business' ? item.review_notes : item.internal_notes) || '';
      var extra = [];
      var applicant = null, publicNote = null, priority = null, assignee = null;
      if (kind === 'business') {
        applicant = el('textarea', { rows: 2, maxlength: 2000, 'aria-label': 'Mensaje al solicitante', placeholder: 'Mensaje visible para el solicitante en "Mis solicitudes"', style: FIELD + 'resize:vertical;' });
        applicant.value = item.applicant_message || '';
        extra.push(applicant);
      }
      if (kind === 'eco') {
        priority = el('select', { 'aria-label': 'Prioridad interna', style: FIELD + 'width:auto;' }, ['baja', 'normal', 'alta', 'urgente'].map(function (p) { var o = el('option', { value: p, text: 'Prioridad ' + p }); if (p === item.priority) o.selected = true; return o; }));
        assignee = el('input', { type: 'text', maxlength: 120, 'aria-label': 'Responsable', placeholder: 'Responsable interno', style: FIELD });
        assignee.value = item.assignee || '';
        publicNote = el('textarea', { rows: 2, maxlength: 1000, 'aria-label': 'Nota pública', placeholder: 'Nota pública (la ve quien reportó al consultar con su código y token)', style: FIELD + 'resize:vertical;' });
        publicNote.value = item.public_note || '';
        extra.push(el('div', { style: 'display:flex;gap:.5rem;flex-wrap:wrap;' }, [priority, assignee]), publicNote);
      }
      var save = btn('Guardar cambios', 'fa-floppy-disk', 'accent', function () {
        var payload = { kind: kind, id: item.id, internalNotes: internal.value.trim() };
        if (select.value !== item.status) payload.status = select.value;
        if (note.value.trim()) payload.note = note.value.trim();
        if (applicant) payload.applicantMessage = applicant.value.trim();
        if (priority) payload.priority = priority.value;
        if (assignee) payload.assignee = assignee.value.trim();
        if (publicNote) payload.publicNote = publicNote.value.trim();
        if (['rejected', 'needs_information', 'archived'].indexOf(payload.status) !== -1 && !payload.note) { toast(tr('opsInbox.noteRequired', 'Escribí una nota que explique el cambio de estado.'), 'error'); note.focus(); return; }
        if (kind === 'business' && payload.status === 'published' && !item.approved_at) { toast(tr('opsInbox.approveFirst', 'Primero aprobá la solicitud; publicar es una etapa posterior.'), 'error'); return; }
        call('inbox_update', payload).then(function () { toast(tr('opsInbox.saved', 'Cambios guardados:') + ' ' + item.code, 'success'); load(); }).catch(function (e) { toast(errorText(e), 'error'); });
      });
      var referral = null;
      if (kind === 'eco') {
        var to = el('input', { type: 'text', maxlength: 160, placeholder: 'Institución destino (ej. MARENA, alcaldía)', 'aria-label': 'Institución destino', style: FIELD });
        var method = el('select', { 'aria-label': 'Medio de derivación', style: FIELD + 'width:auto;' }, [['manual', 'Manual'], ['email', 'Correo'], ['official_portal', 'Portal oficial'], ['api', 'API'], ['other', 'Otro']].map(function (m) { return el('option', { value: m[0], text: m[1] }); }));
        var dstatus = el('select', { 'aria-label': 'Estado de entrega', style: FIELD + 'width:auto;' }, [['pending', 'Pendiente de enviar'], ['sent', 'Enviado por BAQUEANO'], ['failed', 'Falló el envío'], ['external_confirmed', 'Recepción confirmada por la institución']].map(function (m) { return el('option', { value: m[0], text: m[1] }); }));
        var ref = el('input', { type: 'text', maxlength: 80, placeholder: 'N.º de referencia externo (si lo hay)', 'aria-label': 'Número de referencia', style: FIELD });
        referral = el('details', { style: 'margin-top:.6rem;' }, [
          el('summary', { style: 'cursor:pointer;font-size:.8rem;color:#F4E6C1;', text: 'Registrar derivación a una institución' }),
          el('p', { style: 'font-size:.74rem;color:var(--ops-text-muted);margin:.4rem 0;', text: 'Solo marcá "Recepción confirmada" cuando la institución lo haya confirmado de verdad. BAQUEANO no afirma entregas que no ocurrieron.' }),
          el('div', { style: 'display:grid;gap:.5rem;' }, [to, el('div', { style: 'display:flex;gap:.5rem;flex-wrap:wrap;' }, [method, dstatus]), ref,
            btn('Guardar derivación', 'fa-share-from-square', '', function () {
              if (to.value.trim().length < 2) { toast(tr('opsInbox.referralTarget', 'Escribí la institución destino.'), 'error'); return; }
              call('inbox_update', { kind: 'eco', id: item.id, note: note.value.trim() || null, referral: { referredTo: to.value.trim(), deliveryMethod: method.value, deliveryStatus: dstatus.value, referenceNumber: ref.value.trim() || null } })
                .then(function () { toast(tr('opsInbox.referralSaved', 'Derivación registrada.'), 'success'); load(); }).catch(function (e) { toast(errorText(e), 'error'); });
            })])
        ]);
      }
      controls = el('div', { style: 'margin-top:.8rem;display:grid;gap:.5rem;' }, [el('div', { style: 'display:flex;gap:.5rem;flex-wrap:wrap;align-items:center;' }, [select, save]), note, internal].concat(extra).concat([referral]));
    } else if (state.readOnly) {
      controls = el('span', { className: 'ops-badge-pill draft', style: 'display:inline-flex;gap:.35rem;align-items:center;margin-top:.6rem;' }, [icon('fa-eye'), ' Solo lectura (Auditor)']);
    }
    var statusLabel = (KINDS[kind].statuses.filter(function (s) { return s[0] === item.status; })[0] || [0, item.status])[1];
    return el('article', { className: 'ops-table-container-matte', style: 'padding:1.1rem 1.25rem;border-left:3px solid ' + (item.status === 'new' || item.status === 'received' || item.status === 'submitted' ? '#F65E01' : '#165D6F') + ';' }, [
      el('div', { style: 'display:flex;justify-content:space-between;gap:.6rem;flex-wrap:wrap;align-items:center;' }, [
        el('div', { style: 'min-width:0;' }, [
          el('strong', { style: 'display:block;color:#fff;font-size:.9rem;overflow-wrap:anywhere;', text: title }),
          el('span', { style: 'font-family:ui-monospace,monospace;font-size:.76rem;color:var(--ops-text-muted);', text: item.code + ' · ' + fmt(item.created_at) + (item.user_ref ? ' · usuario ' + item.user_ref : '') })
        ]),
        el('span', { className: 'ops-badge-pill ' + (item.status === 'approved' || item.status === 'published' || item.status === 'answered' ? 'published' : 'draft'), text: statusLabel })
      ]),
      el('div', { style: 'margin-top:.6rem;' }, details),
      map, evidence, notification ? el('div', { style: 'margin-top:.4rem;' }, [notification]) : null, history, controls
    ]);
  }

  // ------------------------------------------------------------------ carga
  function paint(nodes) { if (state.panel) state.panel.replaceChildren.apply(state.panel, nodes.filter(Boolean)); }
  function load() {
    if (!state.panel) return;
    var id = ++state.requestId;
    paint([header(), kindTabs(), statusFilters(), el('div', { className: 'ops-empty-state' }, [icon('fa-spinner fa-spin ops-empty-icon'), el('div', { className: 'ops-empty-title', text: 'Cargando el buzón…' })])]);
    Promise.all([call('inbox_counts', {}), call('inbox_list', { kind: state.kind, status: state.status, page: state.page })]).then(function (r) {
      if (id !== state.requestId) return;
      state.counts = r[0].counts || {}; state.notifications = r[0].notifications || {}; state.readOnly = r[1].readOnly === true;
      updateBadge();
      var items = r[1].items || [];
      var list = items.length ? el('div', { style: 'display:grid;gap:1rem;' }, items.map(card))
        : el('div', { className: 'ops-empty-state' }, [icon('fa-inbox ops-empty-icon'), el('div', { className: 'ops-empty-title', text: 'Sin registros en esta bandeja' }), el('div', { className: 'ops-empty-desc', text: 'Cuando alguien escriba, postule su negocio o reporte un daño ambiental, aparecerá aquí con su código.' })]);
      var pager = r[1].total > 20 ? el('div', { style: 'display:flex;gap:.5rem;justify-content:center;margin-top:1rem;align-items:center;' }, [
        btn('Anterior', 'fa-chevron-left', '', function () { if (state.page > 0) { state.page -= 1; load(); } }),
        el('span', { style: 'font-size:.8rem;color:var(--ops-text-muted);', text: 'Página ' + (state.page + 1) + ' de ' + Math.ceil(r[1].total / 20) }),
        btn('Siguiente', 'fa-chevron-right', '', function () { if ((state.page + 1) * 20 < r[1].total) { state.page += 1; load(); } })
      ]) : null;
      paint([header(), kindTabs(), statusFilters(), notificationLine(), list, pager]);
    }).catch(function (e) {
      if (id !== state.requestId) return;
      paint([header(), kindTabs(), el('div', { className: 'ops-empty-state' }, [icon('fa-shield-halved ops-empty-icon'), el('div', { className: 'ops-empty-title', text: tr('opsInbox.cannotOpen', 'No se pudo abrir el buzón') }), el('div', { className: 'ops-empty-desc', text: errorText(e) })])]);
    });
  }
  function updateBadge() {
    var badge = document.getElementById('badgeCount-38');
    if (!badge) return;
    var c = state.counts;
    var open = ((c.contact || {}).new || 0) + ((c.business || {}).submitted || 0) + ((c.eco || {}).received || 0);
    badge.textContent = open > 99 ? '99+' : String(open);
    badge.style.display = open ? '' : 'none';
  }
  function watchAuth() {
    try {
      if (window.firebase && window.firebase.auth) {
        window.firebase.auth().onAuthStateChanged(function (u) {
          if (u && !(state.panel && state.panel.classList.contains('is-active'))) call('inbox_counts', {}).then(function (d) { state.counts = d.counts || {}; updateBadge(); }).catch(function () { /* sin permiso */ });
        });
        return;
      }
    } catch (_) { /* aún no listo */ }
    setTimeout(watchAuth, 800);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchAuth); else watchAuth();

  window.BaqueanoOpsInbox = {
    render: function (panel) { state.panel = panel || document.getElementById('view-38-buzon'); load(); },
    refresh: load
  };
})(window, document);
