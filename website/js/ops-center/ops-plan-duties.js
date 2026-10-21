// ============================================================================
// 🧭 BAQUEANO — OPS CENTER: COMPROMISOS DEL MES DE CADA PLAN (ops-plan-duties.js)
// ============================================================================
// 🎯 POR QUÉ (propietario, 2026-10-20): «adaptar según el plan seleccionado para cumplir lo que
//   debemos hacer». Cada negocio con plan vigente tiene entregas del equipo: bienvenida en redes
//   (todos), 2 publicaciones y una Crónica al mes y el sello verificado (Mirador), 4
//   publicaciones, una Crónica, una pauta y el informe al mes, más video y armado de la ficha
//   (Cumbre). Este tablero muestra qué falta y deja registrar cada entrega con su evidencia.
// ⚙️ CÓMO: Edge Function baqueano-plans (duties_list, duty_record, duty_void) con el token de
//   Firebase; el servidor calcula lo que corresponde (duties.ts) y verifica el rol (el auditor
//   solo lee). Nada se borra: una entrega mal cargada se anula con motivo. Textos con tr() y
//   textContent (i18n opsDuties.*).
// 📦 QUÉ: window.BaqueanoOpsPlanDuties.section(call, canWrite) → <section> que se actualiza sola.
//   La usa ops-plans.js dentro de la vista 44-planes.
// ============================================================================
(function (window, document) {
  'use strict';
  if (window.BaqueanoOpsPlanDuties) return;

  var PLAN_NAMES = { sendero: 'Sendero', mirador: 'Mirador', cumbre: 'Cumbre' };
  var EVIDENCE_REQUIRED = { social_welcome: true, social_post: true, social_ad: true, chronicle: true, video: true };
  var state = { month: null, data: null, loading: false, error: '', notice: '', box: null, call: null, write: false };

  function tr(key, fallback, vars) {
    var out = fallback;
    try { var v = window.BaqueanoLanguage && window.BaqueanoLanguage.t(key, { fallback: fallback }); if (v && v !== key) out = v; } catch (_) { out = fallback; }
    return String(out).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
  }
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'text') n.textContent = v; else if (k === 'className') n.className = v; else n.setAttribute(k, v === true ? '' : v);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function icon(name) { var i = el('i', { className: name }); i.setAttribute('aria-hidden', 'true'); return i; }
  function dutyName(kind) {
    var map = {
      social_welcome: tr('opsDuties.kind.social_welcome', 'Bienvenida en redes'),
      social_post: tr('opsDuties.kind.social_post', 'Publicación en redes (con historias)'),
      social_ad: tr('opsDuties.kind.social_ad', 'Pauta pagada en redes'),
      chronicle: tr('opsDuties.kind.chronicle', 'Publicación en Crónicas y Comunidad'),
      report_pdf: tr('opsDuties.kind.report_pdf', 'Informe mensual enviado'),
      verification: tr('opsDuties.kind.verification', 'Verificación (documentos o visita)'),
      video: tr('opsDuties.kind.video', 'Video de presentación'),
      onboarding: tr('opsDuties.kind.onboarding', 'Armado de la ficha (textos y fotos)')
    };
    return map[kind] || kind;
  }
  function currentMonth() { return new Date(Date.now() - 6 * 3600000).toISOString().slice(0, 7); }
  function shiftMonth(ym, n) { var y = +ym.slice(0, 4), m = +ym.slice(5, 7) - 1 + n; var d = new Date(Date.UTC(y, m, 1)); return d.toISOString().slice(0, 7); }
  function monthLabel(ym) { try { return new Date(ym + '-15T12:00:00Z').toLocaleDateString('es-NI', { month: 'long', year: 'numeric' }); } catch (_) { return ym; } }
  function fmt(v) { try { return new Date(v).toLocaleString('es-NI', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Managua' }); } catch (_) { return ''; } }

  function load() {
    state.loading = true; state.error = ''; paint();
    return state.call('duties_list', { month: state.month }).then(function (res) {
      state.data = res; state.loading = false; paint();
    }).catch(function (e) { state.loading = false; state.error = e.message; paint(); });
  }

  function recordDialog(item, duty) {
    var d = el('dialog', { className: 'ops-plans-dialog', 'aria-label': tr('opsDuties.recordTitle', 'Registrar entrega') });
    var url = el('input', { type: 'url', inputmode: 'url', maxlength: '500', placeholder: 'https://', required: EVIDENCE_REQUIRED[duty.kind] ? true : null });
    var note = el('input', { maxlength: '500', placeholder: tr('opsDuties.notePh', 'Ej.: reel de la terraza, historia del menú') });
    var err = el('p', { className: 'ops-plans-error', role: 'alert', hidden: true });
    var ok = el('button', { type: 'button', className: 'ops-btn is-primary' }, [icon('fa-solid fa-check'), ' ' + tr('opsDuties.save', 'Registrar')]);
    var close = el('button', { type: 'button', className: 'ops-btn', 'aria-label': tr('opsDuties.close', 'Cerrar') }, [icon('fa-solid fa-xmark')]);
    close.addEventListener('click', function () { d.close(); });
    d.appendChild(el('header', { className: 'ops-plans-dialog-head' }, [el('h2', { text: dutyName(duty.kind) }), close]));
    d.appendChild(el('div', { className: 'ops-plans-form' }, [
      el('p', { text: tr('opsDuties.recordFor', '{business} · Plan {plan} · {month}', { business: item.business_name, plan: PLAN_NAMES[item.plan_code] || item.plan_code, month: monthLabel(state.month) }) }),
      el('label', {}, [el('span', { text: EVIDENCE_REQUIRED[duty.kind] ? tr('opsDuties.evidenceReq', 'Enlace de la publicación (obligatorio)') : tr('opsDuties.evidenceOpt', 'Enlace de evidencia (opcional)') }), url]),
      el('label', {}, [el('span', { text: tr('opsDuties.note', 'Nota (opcional)') }), note]),
      el('p', { className: 'ops-plans-hint', text: tr('opsDuties.ownerSees', 'El propietario ve esta entrega y su enlace en «Mi plan» y en su informe del mes.') }),
      err
    ]));
    d.appendChild(el('footer', { className: 'ops-plans-dialog-foot' }, [ok]));
    d.addEventListener('close', function () { d.remove(); });
    ok.addEventListener('click', function () {
      ok.disabled = true; err.hidden = true;
      state.call('duty_record', { order_id: item.id, kind: duty.kind, month: state.month, evidence_url: url.value.trim() || null, note: note.value.trim() || null })
        .then(function () { d.close(); state.notice = tr('opsDuties.saved', 'Entrega registrada.'); load(); })
        .catch(function (e) { ok.disabled = false; err.textContent = e.message; err.hidden = false; });
    });
    document.body.appendChild(d);
    d.showModal();
    url.focus();
  }

  function voidDialog(row) {
    var d = el('dialog', { className: 'ops-plans-dialog', 'aria-label': tr('opsDuties.voidTitle', 'Anular entrega') });
    var reason = el('input', { maxlength: '500', required: true, placeholder: tr('opsDuties.voidPh', 'Ej.: se cargó en el negocio equivocado') });
    var err = el('p', { className: 'ops-plans-error', role: 'alert', hidden: true });
    var ok = el('button', { type: 'button', className: 'ops-btn is-danger' }, [icon('fa-solid fa-ban'), ' ' + tr('opsDuties.void', 'Anular')]);
    var close = el('button', { type: 'button', className: 'ops-btn', 'aria-label': tr('opsDuties.close', 'Cerrar') }, [icon('fa-solid fa-xmark')]);
    close.addEventListener('click', function () { d.close(); });
    d.appendChild(el('header', { className: 'ops-plans-dialog-head' }, [el('h2', { text: tr('opsDuties.voidTitle', 'Anular entrega') }), close]));
    d.appendChild(el('div', { className: 'ops-plans-form' }, [
      el('p', { text: dutyName(row.kind) + ' · ' + fmt(row.done_at) }),
      el('label', {}, [el('span', { text: tr('opsDuties.voidReason', 'Motivo (queda en el historial)') }), reason]),
      err
    ]));
    d.appendChild(el('footer', { className: 'ops-plans-dialog-foot' }, [ok]));
    d.addEventListener('close', function () { d.remove(); });
    ok.addEventListener('click', function () {
      ok.disabled = true; err.hidden = true;
      state.call('duty_void', { id: row.id, reason: reason.value.trim() })
        .then(function () { d.close(); state.notice = tr('opsDuties.voided', 'Entrega anulada. Queda en el historial.'); load(); })
        .catch(function (e) { ok.disabled = false; err.textContent = e.message; err.hidden = false; });
    });
    document.body.appendChild(d);
    d.showModal();
    reason.focus();
  }

  function itemCard(item) {
    var s = item.summary || { required: 0, done: 0 };
    var pct = s.required ? Math.round((s.done / s.required) * 100) : 100;
    var rules = item.rules || {};
    var auto = rules.automatic || {};
    var autoList = [
      auto.departmentFeatured ? tr('opsDuties.autoDept', 'Destacado en su departamento') : null,
      auto.alliesFirst ? tr('opsDuties.autoAllies', 'Primero en Aliados y en BAQUI') : null,
      auto.home ? tr('opsDuties.autoHome', 'Portada') : null,
      auto.baquiRecommends ? tr('opsDuties.autoBaqui', 'BAQUI lo recomienda en su zona') : null,
      auto.promo ? tr('opsDuties.autoPromo', 'Promoción en la ficha') : null,
      auto.statsCompare ? tr('opsDuties.autoStats2', 'Estadísticas con mes anterior') : tr('opsDuties.autoStats', 'Estadísticas del mes')
    ].filter(Boolean).join(' · ');
    var duties = el('ul', { className: 'ops-duties-list' });
    (item.duties || []).forEach(function (d) {
      var li = el('li', { className: d.missing ? 'is-pending' : 'is-done' }, [
        el('span', { className: 'ops-duty-name', text: dutyName(d.kind) }),
        el('span', { className: 'ops-duty-count', text: d.cadence === 'monthly'
          ? tr('opsDuties.countMonthly', '{done}/{required} este mes', { done: Math.min(d.done, d.required), required: d.required })
          : (d.missing ? tr('opsDuties.once', 'Una vez · pendiente') : tr('opsDuties.onceDone', 'Una vez · hecho')) })
      ]);
      if (state.write && d.missing) {
        var b = el('button', { type: 'button', className: 'ops-btn' }, [icon('fa-solid fa-plus'), ' ' + tr('opsDuties.record', 'Registrar')]);
        b.addEventListener('click', function () { recordDialog(item, d); });
        li.appendChild(b);
      }
      duties.appendChild(li);
    });
    var history = el('ul', { className: 'ops-duties-history' });
    (item.history || []).forEach(function (h) {
      var li = el('li', { className: h.status === 'void' ? 'is-void' : '' }, [
        el('span', { text: dutyName(h.kind) + ' · ' + fmt(h.done_at) + ' · ' + (h.done_by || '') }),
        h.evidence_url ? el('a', { href: h.evidence_url, target: '_blank', rel: 'noopener noreferrer', text: tr('opsDuties.evidence', 'evidencia') }) : null,
        h.note ? el('span', { className: 'ops-duty-note', text: h.note }) : null,
        h.status === 'void' ? el('span', { className: 'ops-duty-note', text: tr('opsDuties.voidedLabel', 'Anulada: {reason}', { reason: h.void_reason || '' }) }) : null
      ]);
      if (state.write && h.status === 'done') {
        var v = el('button', { type: 'button', className: 'ops-btn is-danger', 'aria-label': tr('opsDuties.voidTitle', 'Anular entrega') }, [icon('fa-solid fa-ban')]);
        v.addEventListener('click', function () { voidDialog(h); });
        li.appendChild(v);
      }
      history.appendChild(li);
    });
    return el('article', { className: 'ops-plans-card ops-duties-card' + (s.missing ? '' : ' is-complete') }, [
      el('div', { className: 'ops-plans-card-head' }, [
        el('strong', { text: item.business_name }),
        el('span', { className: 'ops-plans-plan is-' + item.plan_code, text: PLAN_NAMES[item.plan_code] || item.plan_code }),
        el('span', { className: 'ops-plans-status ' + (s.missing ? 'is-pending' : 'is-paid'), text: tr('opsDuties.progress', '{done} de {required} ({pct} %)', { done: s.done, required: s.required, pct: pct }) })
      ]),
      el('div', { className: 'ops-duties-bar', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(pct), 'aria-label': tr('opsDuties.progressLabel', 'Avance de entregas del mes') }, [el('span', { style: 'width:' + pct + '%' })]),
      el('p', { className: 'ops-plans-hint', text: tr('opsDuties.photos', 'Fotos permitidas: {n}', { n: rules.photo_limit == null ? tr('opsDuties.unlimited', 'sin límite + video') : rules.photo_limit }) + ' · ' + tr('opsDuties.auto', 'Automático: {list}', { list: autoList }) + (item.business_id ? '' : ' · ' + tr('opsDuties.unlinked', 'Falta vincular el negocio publicado: sin eso no se activan los beneficios automáticos.')) }),
      duties,
      item.history && item.history.length ? el('details', { className: 'ops-duties-details' }, [el('summary', { text: tr('opsDuties.history', 'Historial de entregas ({n})', { n: item.history.length }) }), history]) : null
    ]);
  }

  function paint() {
    if (!state.box) return;
    var prev = el('button', { type: 'button', className: 'ops-btn', 'aria-label': tr('opsDuties.prev', 'Mes anterior') }, [icon('fa-solid fa-chevron-left')]);
    var next = el('button', { type: 'button', className: 'ops-btn', 'aria-label': tr('opsDuties.next', 'Mes siguiente'), disabled: state.month >= currentMonth() ? true : null }, [icon('fa-solid fa-chevron-right')]);
    prev.addEventListener('click', function () { state.month = shiftMonth(state.month, -1); state.notice = ''; load(); });
    next.addEventListener('click', function () { if (state.month < currentMonth()) { state.month = shiftMonth(state.month, 1); state.notice = ''; load(); } });
    var children = [
      el('div', { className: 'ops-plans-exp-head' }, [
        el('h2', { id: 'opsDutiesTitle' }, [icon('fa-solid fa-list-check'), ' ' + tr('opsDuties.title', 'Compromisos del mes por plan')]),
        el('div', { className: 'ops-plans-tools' }, [prev, el('span', { className: 'ops-duties-month', text: monthLabel(state.month) }), next])
      ]),
      el('p', { className: 'ops-plans-hint', text: tr('opsDuties.intro', 'Lo que el equipo debe entregar a cada negocio con plan vigente. Lo automático (destacados, orden, promoción, estadísticas, BAQUI) ya lo aplica el sistema; acá se registra lo que hacemos a mano, con su enlace como evidencia.') })
    ];
    if (state.notice) children.push(el('p', { className: 'ops-plans-notice', role: 'status', text: state.notice }));
    if (state.loading) children.push(el('p', { className: 'ops-plans-empty', text: tr('opsDuties.loading', 'Cargando compromisos…') }));
    else if (state.error) children.push(el('p', { className: 'ops-plans-error', role: 'alert', text: state.error }));
    else if (state.data) {
      var items = state.data.items || [];
      var tot = state.data.totals || { required: 0, done: 0 };
      if (!items.length) children.push(el('p', { className: 'ops-plans-empty', text: tr('opsDuties.empty', 'No hay planes pagados vigentes en este mes.') }));
      else {
        children.push(el('p', { className: 'ops-duties-total', text: tr('opsDuties.total', 'Total del mes: {done} de {required} entregas · {n} negocios', { done: tot.done, required: tot.required, n: items.length }) }));
        items.slice().sort(function (a, b) { return (b.summary.missing || 0) - (a.summary.missing || 0); }).forEach(function (it) { children.push(itemCard(it)); });
      }
    }
    state.box.replaceChildren.apply(state.box, children);
  }

  function installStyle() {
    if (document.getElementById('opsDutiesStyle')) return;
    var css = '.ops-duties{margin:8px 0 18px;padding:14px;border-radius:16px;border:1px solid rgba(74,222,128,.3);background:rgba(74,222,128,.05)}' +
      '.ops-duties h2{margin:0;font:800 1.05rem/1.2 League Spartan,sans-serif;color:#fff}.ops-duties-month{align-self:center;font-weight:800;color:#f4e6c1;text-transform:capitalize}' +
      '.ops-duties-card{margin-top:10px}.ops-duties-card.is-complete{border-color:rgba(74,222,128,.45)}' +
      '.ops-duties-bar{height:8px;border-radius:999px;background:rgba(148,163,184,.25);overflow:hidden;margin:0 0 8px}.ops-duties-bar span{display:block;height:100%;background:#4ade80}' +
      '.ops-duties-list{list-style:none;margin:8px 0;padding:0;display:grid;gap:6px}.ops-duties-list li{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;padding:6px 10px;border-radius:10px;background:rgba(15,23,42,.6)}' +
      '.ops-duties-list li.is-done{opacity:.8}.ops-duties-list li.is-done .ops-duty-name::before{content:"\\2713  ";color:#4ade80}.ops-duty-name{font-weight:700;color:#f8fafc}.ops-duty-count{color:#cbd5e1;font-size:.86rem;margin-right:auto}' +
      '.ops-duties-history{list-style:none;margin:6px 0 0;padding:0;display:grid;gap:4px;font-size:.84rem;color:#cbd5e1}.ops-duties-history li{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center}.ops-duties-history li.is-void{text-decoration:line-through;opacity:.7}' +
      '.ops-duties-history a{color:#f4e6c1}.ops-duty-note{color:#94a3b8}.ops-duties-total{font-weight:800;color:#bbf7d0}.ops-duties-details summary{cursor:pointer;color:#f4e6c1;font-weight:700;min-height:32px}';
    var s = document.createElement('style'); s.id = 'opsDutiesStyle'; s.textContent = css; document.head.appendChild(s);
  }

  function section(call, canWrite) {
    installStyle();
    state.call = call; state.write = !!canWrite;
    if (!state.month) state.month = currentMonth();
    if (!state.box) state.box = el('section', { className: 'ops-duties', 'aria-labelledby': 'opsDutiesTitle' });
    // La sección se reutiliza entre repintados de ops-plans.js; solo se carga la primera vez o a pedido.
    if (!state.data && !state.loading) load(); else paint();
    return state.box;
  }

  window.BaqueanoOpsPlanDuties = { section: section, reload: function () { return state.call ? load() : Promise.resolve(); }, _state: state };
})(window, document);
