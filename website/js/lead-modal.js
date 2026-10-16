/**
 * 🧭 BAQUEANO — MÓDULO 2 · CONTACTO DIRECTO CON INTENCIÓN (js/lead-modal.js)
 * 🎯 POR QUÉ: pedido del propietario (15-10-2026, «Módulo 2»). El botón de WhatsApp mandaba
 *   un «Hola» sin contexto: el propietario tenía que preguntar fecha, cuántas personas y para
 *   qué. Y BAQUEANO no sabía qué buscaba la gente. BAQUEANO no hace reservas: este formulario
 *   solo prepara el mensaje; el trato es directo con el propietario.
 * ⚙️ CÓMO:
 *   - Mejora progresiva: los enlaces de WhatsApp marcados con data-bq-lead abren este diálogo
 *     (<dialog> nativo: foco atrapado, Esc cierra, etiquetas y errores asociados). Sin JS el
 *     enlace sigue abriendo WhatsApp igual que antes.
 *   - Fecha aproximada (opcional), personas, motivo y una nota opcional. El mensaje de WhatsApp
 *     sale con esos datos ya escritos; la persona lo revisa y lo envía desde su WhatsApp.
 *   - «Escribir sin completar» abre WhatsApp directo, sin formulario.
 *   - Registro del interés (lo que el prompt llamaba POST /api/track-lead): el contrato
 *     { destinationId, hostId, timestamp, intent } se entrega a BaqueanoAnalytics.trackLead,
 *     que lo manda a Supabase (RPC track_commercial_action + track_event 'inquiry_sent'). Solo
 *     con consentimiento de analítica; nunca se envían nombre, teléfono, nota ni fecha exacta
 *     (solo cuántos días faltan). Si la analítica no está, WhatsApp se abre igual.
 * 📦 QUÉ: window.BaqueanoLeadModal.open({ href, name, businessId, destinationId, experienceId }).
 *   Marcado: <a href="https://wa.me/…" data-bq-lead data-business-id="…" data-lead-name="…">.
 */
(function () {
  'use strict';
  if (window.BaqueanoLeadModal) return;

  var INTENTS = [
    ['info', 'lead.intent.info', 'Pedir información'],
    ['visit', 'lead.intent.visit', 'Visitar o conocer el lugar'],
    ['stay', 'lead.intent.stay', 'Hospedaje'],
    ['food', 'lead.intent.food', 'Comer o probar la gastronomía'],
    ['group', 'lead.intent.group', 'Grupo, tour o excursión'],
    ['event', 'lead.intent.event', 'Evento o celebración'],
    ['other', 'lead.intent.other', 'Otro motivo']
  ];
  var MAX_PEOPLE = 60;
  var state = { dialog: null, current: null, opener: null };

  function t(key, fallback, vars) {
    var out = fallback;
    try {
      if (window.BaqueanoLanguage && window.BaqueanoLanguage.t) {
        var v = window.BaqueanoLanguage.t(key, { fallback: fallback });
        if (v && v !== key) out = v;
      }
    } catch (_) { out = fallback; }
    return String(out).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
  }
  function lang() { return (document.documentElement.lang || 'es').slice(0, 2); }
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'className') n.className = attrs[k];
      else if (attrs[k] != null && attrs[k] !== false) n.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    });
    (children || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  // Fecha local (no UTC): el «hoy» de Nicaragua, no el de Greenwich.
  function todayIso() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function daysUntil(iso) {
    if (!iso) return null;
    var a = new Date(todayIso() + 'T12:00:00'), b = new Date(iso + 'T12:00:00');
    return Math.round((b - a) / 86400000);
  }
  function prettyDate(iso) {
    try {
      return new Date(iso + 'T12:00:00').toLocaleDateString(lang() === 'es' ? 'es-NI' : lang(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch (_) { return iso; }
  }

  // El saludo que ya traía el enlace (por ejemplo «Hola Hotel X, los encontré en BAQUEANO.»).
  function splitWa(href) {
    try {
      var u = new URL(href, window.location.href);
      return { base: u.origin + u.pathname, greeting: u.searchParams.get('text') || '' };
    } catch (_) { return { base: href.split('?')[0], greeting: '' }; }
  }

  // ── Diálogo ───────────────────────────────────────────────────────────────
  function field(id, labelKey, labelEs, control, hintKey, hintEs) {
    var hint = hintKey ? el('p', { className: 'bq-lead-hint', id: id + 'Hint', 'data-i18n': hintKey, text: t(hintKey, hintEs) }) : null;
    if (hint) control.setAttribute('aria-describedby', id + 'Hint ' + id + 'Err');
    else control.setAttribute('aria-describedby', id + 'Err');
    return el('div', { className: 'bq-lead-field' }, [
      el('label', { for: id, 'data-i18n': labelKey, text: t(labelKey, labelEs) }),
      control,
      hint,
      el('p', { className: 'bq-lead-error', id: id + 'Err', role: 'alert', hidden: true })
    ]);
  }

  function build() {
    var date = el('input', { type: 'date', id: 'bqLeadDate', name: 'date', min: todayIso(), autocomplete: 'off' });
    var people = el('input', { type: 'number', id: 'bqLeadPeople', name: 'people', min: '1', max: String(MAX_PEOPLE), step: '1', value: '2', inputmode: 'numeric', required: true });
    var intent = el('select', { id: 'bqLeadIntent', name: 'intent', required: true }, [el('option', { value: '', 'data-i18n': 'lead.intent.choose', text: t('lead.intent.choose', 'Elegí un motivo') })]
      .concat(INTENTS.map(function (i) { return el('option', { value: i[0], 'data-i18n': i[1], text: t(i[1], i[2]) }); })));
    var note = el('textarea', { id: 'bqLeadNote', name: 'note', rows: '3', maxlength: '300' });

    var form = el('form', { className: 'bq-lead-form', method: 'dialog', novalidate: true }, [
      field('bqLeadDate', 'lead.date', 'Fecha aproximada (opcional)', date, 'lead.dateHint', 'Si todavía no sabés, dejalo en blanco.'),
      field('bqLeadPeople', 'lead.people', '¿Cuántas personas?', people),
      field('bqLeadIntent', 'lead.intent.label', 'Motivo', intent),
      field('bqLeadNote', 'lead.note', 'Mensaje para el propietario (opcional)', note, 'lead.noteHint', 'Se envía solo por WhatsApp. BAQUEANO no lo guarda.'),
      el('p', { className: 'bq-lead-privacy', 'data-i18n': 'lead.privacy', text: t('lead.privacy', 'BAQUEANO no hace reservas: hablás directo con el propietario. Solo contamos, sin datos personales, el motivo y cuántas personas consultan.') }),
      el('div', { className: 'bq-lead-actions' }, [
        el('button', { type: 'submit', className: 'bq-lead-send', value: 'send' }, [
          el('i', { className: 'fa-brands fa-whatsapp', 'aria-hidden': 'true' }), ' ',
          el('span', { 'data-i18n': 'lead.send', text: t('lead.send', 'Preparar mensaje en WhatsApp') })
        ]),
        el('button', { type: 'button', className: 'bq-lead-skip', 'data-i18n': 'lead.skip', text: t('lead.skip', 'Escribir sin completar') })
      ])
    ]);

    var dialog = el('dialog', { className: 'bq-lead-dialog', id: 'bqLeadDialog', 'aria-labelledby': 'bqLeadTitle', 'aria-describedby': 'bqLeadLead' }, [
      el('header', { className: 'bq-lead-head' }, [
        el('div', {}, [
          el('p', { className: 'bq-lead-kicker', 'data-i18n': 'lead.kicker', text: t('lead.kicker', 'Contacto directo') }),
          el('h2', { id: 'bqLeadTitle' }),
          el('p', { id: 'bqLeadLead', className: 'bq-lead-lead', 'data-i18n': 'lead.lead', text: t('lead.lead', 'Contanos qué buscás y armamos el mensaje para que el propietario te responda más rápido.') })
        ]),
        el('button', { type: 'button', className: 'bq-lead-close', 'aria-label': t('dialog.close', 'Cerrar'), 'data-i18n-aria-label': 'dialog.close' }, [el('i', { className: 'fa-solid fa-xmark', 'aria-hidden': 'true' })])
      ]),
      form
    ]);

    dialog.querySelector('.bq-lead-close').addEventListener('click', function () { dialog.close('cancel'); });
    dialog.querySelector('.bq-lead-skip').addEventListener('click', function () { finish(false); });
    // Clic en el fondo (fuera de la caja) cierra.
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close('cancel'); });
    dialog.addEventListener('close', function () {
      var back = state.opener;
      state.opener = null;
      if (back && back.isConnected && typeof back.focus === 'function') back.focus();
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); finish(true); });
    form.addEventListener('input', function (e) { if (e.target && e.target.id) showError(e.target.id, ''); });
    document.body.appendChild(dialog);
    return dialog;
  }

  function showError(id, msg) {
    var box = document.getElementById(id + 'Err');
    var input = document.getElementById(id);
    if (!box || !input) return;
    box.textContent = msg;
    box.hidden = !msg;
    if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
  }

  function validate() {
    var ok = true, first = null;
    var date = document.getElementById('bqLeadDate');
    var people = document.getElementById('bqLeadPeople');
    var intent = document.getElementById('bqLeadIntent');
    ['bqLeadDate', 'bqLeadPeople', 'bqLeadIntent'].forEach(function (id) { showError(id, ''); });
    if (date.value && daysUntil(date.value) < 0) {
      showError('bqLeadDate', t('lead.err.pastDate', 'Elegí una fecha de hoy en adelante.'));
      ok = false; first = first || date;
    }
    var n = Number(people.value);
    if (!Number.isInteger(n) || n < 1 || n > MAX_PEOPLE) {
      showError('bqLeadPeople', t('lead.err.people', 'Escribí un número de personas entre 1 y {max}.', { max: MAX_PEOPLE }));
      ok = false; first = first || people;
    }
    if (!intent.value) {
      showError('bqLeadIntent', t('lead.err.intent', 'Elegí el motivo de tu consulta.'));
      ok = false; first = first || intent;
    }
    if (first) first.focus();
    return ok;
  }

  function message(withDetails) {
    var c = state.current;
    var lines = [c.greeting || t('lead.wa.hello', 'Hola, los encontré en BAQUEANO.')];
    if (withDetails) {
      var date = document.getElementById('bqLeadDate').value;
      var people = document.getElementById('bqLeadPeople').value;
      var intent = document.getElementById('bqLeadIntent');
      var note = document.getElementById('bqLeadNote').value.replace(/\s+/g, ' ').trim().slice(0, 300);
      lines.push('');
      lines.push('• ' + t('lead.wa.intent', 'Motivo') + ': ' + intent.options[intent.selectedIndex].text);
      lines.push('• ' + t('lead.wa.people', 'Personas') + ': ' + people);
      lines.push('• ' + t('lead.wa.date', 'Fecha') + ': ' + (date ? prettyDate(date) : t('lead.wa.dateOpen', 'por definir')));
      if (note) { lines.push(''); lines.push(note); }
    }
    return lines.join('\n');
  }

  function finish(withDetails) {
    if (withDetails && !validate()) return;
    var c = state.current;
    var url = c.base + '?text=' + encodeURIComponent(message(withDetails));
    var dateVal = withDetails ? document.getElementById('bqLeadDate').value : '';
    var payload = {
      destinationId: c.destinationId || null,
      hostId: c.businessId || null,
      experienceId: c.experienceId || null,
      timestamp: new Date().toISOString(),
      intent: withDetails ? document.getElementById('bqLeadIntent').value : 'direct',
      people: withDetails ? Number(document.getElementById('bqLeadPeople').value) : null,
      leadDays: dateVal ? daysUntil(dateVal) : null
    };
    try { if (window.BaqueanoAnalytics && typeof window.BaqueanoAnalytics.trackLead === 'function') window.BaqueanoAnalytics.trackLead(payload); } catch (_) { /* la analítica nunca bloquea el contacto */ }
    try { document.dispatchEvent(new CustomEvent('bq:lead', { detail: payload })); } catch (_) { /* navegadores viejos */ }
    state.dialog.close('sent');
    // El envío del formulario es un gesto del usuario: el navegador permite abrir la pestaña.
    var win = window.open(url, '_blank', 'noopener');
    if (!win) window.location.href = url;
  }

  function open(opts) {
    if (!opts || !opts.href) return false;
    if (typeof HTMLDialogElement === 'undefined') return false; // navegador muy viejo: sigue el enlace
    state.dialog = document.getElementById('bqLeadDialog') || build();
    var wa = splitWa(opts.href);
    state.current = {
      base: wa.base, greeting: wa.greeting,
      businessId: opts.businessId || null, destinationId: opts.destinationId || null, experienceId: opts.experienceId || null
    };
    state.opener = opts.opener || document.activeElement;
    var title = state.dialog.querySelector('#bqLeadTitle');
    title.textContent = opts.name ? t('lead.titleNamed', 'Escribile a {name}', { name: opts.name }) : t('lead.title', 'Escribile al propietario');
    var form = state.dialog.querySelector('form');
    form.reset();
    state.dialog.querySelector('#bqLeadDate').min = todayIso();
    ['bqLeadDate', 'bqLeadPeople', 'bqLeadIntent'].forEach(function (id) { showError(id, ''); });
    state.dialog.showModal();
    state.dialog.querySelector('#bqLeadDate').focus();
    return true;
  }

  // Nombre por defecto: el título de la tarjeta donde está el botón (sube hasta 6 niveles).
  function cardTitle(a) {
    var node = a.parentElement;
    for (var i = 0; node && i < 6; i++, node = node.parentElement) {
      var h = node.querySelector('h2, h3, h4, [class*="card-title"]');
      if (h && !h.contains(a)) return h.textContent.replace(/\s+/g, ' ').trim().slice(0, 80);
    }
    return '';
  }

  // Delegación: cualquier enlace de WhatsApp marcado con data-bq-lead, también los que se crean después.
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest('a[data-bq-lead][href]') : null;
    if (!a || !/wa\.me\/|api\.whatsapp\.com/i.test(a.getAttribute('href') || '')) return;
    var host = a.closest('[data-business-id]');
    var ok = open({
      href: a.href,
      name: a.getAttribute('data-lead-name') || (host && host.getAttribute('data-business-name')) || cardTitle(a),
      businessId: a.getAttribute('data-business-id') || (host && host.getAttribute('data-business-id')) || null,
      destinationId: a.getAttribute('data-destination-id') || null,
      experienceId: a.getAttribute('data-experience-id') || null,
      opener: a
    });
    if (ok) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  window.BaqueanoLeadModal = Object.freeze({ open: open });
})();
