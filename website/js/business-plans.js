/**
 * 🧭 BAQUEANO — PLANES PARA NEGOCIOS (js/business-plans.js)
 * 🎯 POR QUÉ: página planes.html (pedido del propietario, 2026-10-15). Precios en córdobas y
 *   dólares, mensual o anual, pedido con los datos del comprobante, pago por WhatsApp y
 *   «Mi plan» para el propietario con su usuario y contraseña.
 * ⚙️ CÓMO: precios desde la Edge Function baqueano-plans (catalog); si no responde quedan los
 *   publicados en el HTML. El pedido se envía a order_create (los montos los pone el
 *   servidor). Al terminar se arma el enlace de WhatsApp con el código. «Mi plan» usa la sesión
 *   de Firebase (my_plans) y, si la contraseña es temporal, pide cambiarla (updatePassword).
 *   Textos con BaqueanoLanguage.t y textContent: nada del servidor entra como HTML.
 * 📦 QUÉ: comportamiento de planes.html.
 */
(function () {
  'use strict';
  var ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-plans';
  var WHATSAPP = '50577976973';
  var PLAN_NAMES = { sendero: 'Sendero', mirador: 'Mirador', cumbre: 'Cumbre' };
  var state = { period: 'monthly', plan: null, plans: {}, sending: false };

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
  function lang() {
    try { return String((window.BaqueanoLanguage && window.BaqueanoLanguage.get && window.BaqueanoLanguage.get()) || 'es').slice(0, 2); } catch (_) { return 'es'; }
  }
  function nio(n) { return 'C$ ' + Math.round(Number(n) || 0).toLocaleString('en-US'); }
  function usd(n) { return 'US$ ' + (Number(n) || 0).toFixed(2); }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function user() { try { return window.firebase && window.firebase.auth ? window.firebase.auth().currentUser : null; } catch (_) { return null; } }

  function api(action, payload, withAuth) {
    var u = withAuth ? user() : null;
    var tokenP = u ? u.getIdToken() : Promise.resolve(null);
    return tokenP.then(function (token) {
      var headers = { 'content-type': 'application/json' };
      if (token) headers['x-firebase-token'] = token;
      return fetch(ENDPOINT, { method: 'POST', headers: headers, body: JSON.stringify(Object.assign({ action: action }, payload || {})) });
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (body) {
        if (!res.ok || !body.ok) { var e = new Error(body.error || t('plans.error.generic', 'No pudimos completar la solicitud. Intentá de nuevo.')); e.code = body.code; throw e; }
        return body;
      });
    });
  }

  // ── Precios ──
  function cardPrices(card) {
    var code = card.getAttribute('data-plan');
    var p = state.plans[code];
    return {
      monthlyUsd: p ? p.monthly_usd : card.getAttribute('data-monthly-usd'),
      annualUsd: p ? p.annual_usd : card.getAttribute('data-annual-usd'),
      monthlyNio: p ? p.monthly_nio : card.getAttribute('data-monthly-nio'),
      annualNio: p ? p.annual_nio : card.getAttribute('data-annual-nio')
    };
  }
  function renderPrices() {
    document.querySelectorAll('.bq-plan-card').forEach(function (card) {
      var p = cardPrices(card);
      var annual = state.period === 'annual';
      card.querySelector('[data-price-nio]').textContent = nio(annual ? p.annualNio : p.monthlyNio);
      card.querySelector('[data-price-usd]').textContent = usd(annual ? p.annualUsd : p.monthlyUsd);
      var unit = card.querySelector('[data-price-unit]');
      unit.setAttribute('data-i18n', annual ? 'plans.price.perYear' : 'plans.price.perMonth');
      unit.textContent = annual ? t('plans.price.perYear', '/ año') : t('plans.price.perMonth', '/ mes');
      card.querySelector('[data-price-equiv]').textContent = annual
        ? t('plans.price.equiv', 'Equivale a {amount} al mes', { amount: nio(Number(p.annualNio) / 12) })
        : '';
    });
  }
  function setPeriod(period) {
    state.period = period;
    document.querySelectorAll('.bq-plans-toggle button').forEach(function (b) {
      var on = b.getAttribute('data-period') === period;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    renderPrices();
  }

  // ── Formulario ──
  var dialog, form, errorBox, submitBtn;
  function summaryText() {
    var card = document.querySelector('.bq-plan-card[data-plan="' + state.plan + '"]');
    var p = cardPrices(card);
    var annual = state.period === 'annual';
    return t('plans.form.summary', 'Plan {plan} · {period} · {nio} ({usd})', {
      plan: PLAN_NAMES[state.plan],
      period: annual ? t('plans.toggle.annual', 'Anual') : t('plans.toggle.monthly', 'Mensual'),
      nio: nio(annual ? p.annualNio : p.monthlyNio),
      usd: usd(annual ? p.annualUsd : p.monthlyUsd)
    });
  }
  function openForm(plan) {
    state.plan = plan;
    form.hidden = false;
    document.getElementById('bqPlanDone').hidden = true;
    errorBox.hidden = true;
    document.getElementById('bqPlanSummary').textContent = summaryText();
    var u = user();
    if (u && u.email && !form.email.value) form.email.value = u.email;
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    setTimeout(function () { form.legal_name.focus(); }, 30);
  }
  function closeForm() { if (dialog.open) dialog.close(); }
  function showError(message, field) {
    errorBox.textContent = message;
    errorBox.hidden = false;
    if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
  }
  function idemKey() {
    var a = new Uint8Array(16);
    (window.crypto || window.msCrypto).getRandomValues(a);
    return 'pl_' + Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }
  function submit(event) {
    event.preventDefault();
    if (state.sending) return;
    form.querySelectorAll('[aria-invalid]').forEach(function (f) { f.removeAttribute('aria-invalid'); });
    var invalid = Array.prototype.find.call(form.elements, function (f) { return f.willValidate && !f.checkValidity(); });
    if (invalid) {
      var label = invalid.closest('label');
      var name = label && label.querySelector('span') ? label.querySelector('span').textContent : '';
      return showError(invalid.name === 'accept_terms'
        ? t('plans.error.terms', 'Tenés que aceptar los términos para continuar.')
        : t('plans.error.field', 'Revisá este dato: {field}', { field: name }), invalid);
    }
    var data = {};
    ['client_type', 'legal_name', 'id_type', 'id_number', 'billing_address', 'contact_name', 'email', 'phone', 'business_name', 'business_category', 'department', 'municipality', 'business_description', 'notes'].forEach(function (k) {
      data[k] = (form.elements[k].value || '').trim();
    });
    data.accept_terms = form.accept_terms.checked;
    data.plan = state.plan;
    data.period = state.period;
    data.language = lang();
    data.idempotency_key = form.dataset.idem || (form.dataset.idem = idemKey());
    state.sending = true;
    submitBtn.disabled = true;
    submitBtn.textContent = t('plans.form.sending', 'Enviando…');
    api('order_create', data, false).then(function (res) {
      var o = res.order;
      document.getElementById('bqPlanCode').textContent = o.code;
      var msg = t('plans.done.waText', 'Hola BAQUEANO, envié mi pedido {code}: plan {plan} {period} ({nio} / {usd}) para {business}. Quiero coordinar el pago.', {
        code: o.code, plan: PLAN_NAMES[o.plan_code] || o.plan_code,
        period: o.billing_period === 'annual' ? t('plans.toggle.annual', 'Anual') : t('plans.toggle.monthly', 'Mensual'),
        nio: nio(o.amount_nio), usd: usd(o.amount_usd), business: data.business_name
      });
      document.getElementById('bqPlanWhatsapp').href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg);
      form.hidden = true;
      document.getElementById('bqPlanDone').hidden = false;
      form.reset();
      delete form.dataset.idem;
      try { if (window.BaqueanoAnalytics && window.BaqueanoAnalytics.track) window.BaqueanoAnalytics.track('plan_order_created', { plan: o.plan_code, period: o.billing_period }); } catch (_) {}
    }).catch(function (err) {
      showError(err.message || t('plans.error.generic', 'No pudimos completar la solicitud. Intentá de nuevo.'));
    }).then(function () {
      state.sending = false;
      submitBtn.disabled = false;
      submitBtn.textContent = t('plans.form.submit', 'Enviar y continuar por WhatsApp');
    });
  }

  // ── Mi plan ──
  function statusLabel(s) {
    return ({
      pending: t('plans.status.pending', 'Pendiente de pago'),
      contacted: t('plans.status.contacted', 'En contacto por WhatsApp'),
      paid: t('plans.status.paid', 'Pagado'),
      cancelled: t('plans.status.cancelled', 'Cancelado')
    })[s] || s;
  }
  function fmtDate(v) {
    if (!v) return '—';
    var d = new Date(String(v).length === 10 ? v + 'T12:00:00' : v);
    return isNaN(d) ? '—' : d.toLocaleDateString(lang() === 'es' ? 'es-NI' : lang(), { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function renderLoggedOut(box) {
    box.textContent = '';
    box.appendChild(el('p', 'bq-my-plan-empty', t('plans.mine.login', '¿Ya tenés un plan? Iniciá sesión con el usuario que te enviamos para ver tu plan y tus comprobantes.')));
    var b = el('button', 'bq-plan-cta is-secondary', t('plans.mine.loginBtn', 'Iniciar sesión'));
    b.type = 'button';
    b.addEventListener('click', login);
    box.appendChild(b);
  }
  function login() {
    if (window.BaqueanoAuthModal && window.BaqueanoAuthModal.open) window.BaqueanoAuthModal.open('login');
    else window.location.href = 'perfil.html';
  }
  function renderPasswordForm(box) {
    var wrap = el('form', 'bq-my-plan-pass');
    wrap.appendChild(el('strong', null, t('plans.mine.passTitle', 'Cambiá tu contraseña temporal')));
    wrap.appendChild(el('span', null, t('plans.mine.passHelp', 'Por seguridad, elegí una contraseña propia de al menos 8 caracteres.')));
    var p1 = el('input'); p1.type = 'password'; p1.autocomplete = 'new-password'; p1.minLength = 8; p1.required = true; p1.setAttribute('aria-label', t('plans.mine.passNew', 'Nueva contraseña')); p1.placeholder = t('plans.mine.passNew', 'Nueva contraseña');
    var p2 = el('input'); p2.type = 'password'; p2.autocomplete = 'new-password'; p2.minLength = 8; p2.required = true; p2.setAttribute('aria-label', t('plans.mine.passRepeat', 'Repetí la contraseña')); p2.placeholder = t('plans.mine.passRepeat', 'Repetí la contraseña');
    var msg = el('p', 'bq-plan-error'); msg.hidden = true; msg.setAttribute('role', 'alert');
    var btn = el('button', 'bq-plan-cta', t('plans.mine.passSave', 'Guardar contraseña')); btn.type = 'submit';
    [p1, p2, msg, btn].forEach(function (n) { wrap.appendChild(n); });
    wrap.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.hidden = true;
      if (p1.value.length < 8) { msg.textContent = t('plans.mine.passShort', 'La contraseña debe tener al menos 8 caracteres.'); msg.hidden = false; return; }
      if (p1.value !== p2.value) { msg.textContent = t('plans.mine.passMismatch', 'Las contraseñas no coinciden.'); msg.hidden = false; return; }
      btn.disabled = true;
      user().updatePassword(p1.value).then(function () { return api('password_changed', {}, true); }).then(function () {
        wrap.textContent = '';
        wrap.appendChild(el('strong', null, t('plans.mine.passDone', 'Listo: tu contraseña quedó cambiada.')));
      }).catch(function (err) {
        btn.disabled = false;
        msg.textContent = err && err.code === 'auth/requires-recent-login'
          ? t('plans.mine.passRelogin', 'Por seguridad, cerrá sesión, volvé a entrar con la contraseña temporal y cambiála de inmediato.')
          : (err && err.message) || t('plans.error.generic', 'No pudimos completar la solicitud. Intentá de nuevo.');
        msg.hidden = false;
      });
    });
    box.appendChild(wrap);
  }
  function renderMine() {
    var box = document.getElementById('bqMyPlan');
    if (!box) return;
    var u = user();
    if (!u) return renderLoggedOut(box);
    box.textContent = '';
    box.appendChild(el('p', 'bq-my-plan-empty', t('plans.mine.loading', 'Cargando tu plan…')));
    api('my_plans', {}, true).then(function (res) {
      box.textContent = '';
      var orders = res.orders || [];
      if (!orders.length) {
        box.appendChild(el('p', 'bq-my-plan-empty', t('plans.mine.none', 'Tu cuenta todavía no tiene planes. Elegí uno arriba y te ayudamos por WhatsApp.')));
        return;
      }
      if (orders.some(function (o) { return o.must_change_password; })) renderPasswordForm(box);
      orders.forEach(function (o) {
        var item = el('article', 'bq-my-plan-item');
        var info = el('div');
        info.appendChild(el('h3', null, t('plans.mine.item', 'Plan {plan} · {business}', { plan: PLAN_NAMES[o.plan_code] || o.plan_code, business: o.business_name })));
        var status = el('span', 'bq-my-plan-status' + (o.status === 'paid' ? ' is-paid' : ''), statusLabel(o.status));
        info.appendChild(status);
        info.appendChild(el('p', null, (o.billing_period === 'annual' ? t('plans.toggle.annual', 'Anual') : t('plans.toggle.monthly', 'Mensual')) + ' · ' + nio(o.amount_nio) + ' (' + usd(o.amount_usd) + ') · ' + t('plans.mine.order', 'Pedido') + ' ' + o.code));
        if (o.period_start) info.appendChild(el('p', null, t('plans.mine.valid', 'Vigente del {from} al {to}', { from: fmtDate(o.period_start), to: fmtDate(o.period_end) })));
        if (o.business_application_code) info.appendChild(el('p', null, t('plans.mine.review', 'Publicación de tu local: solicitud {code} en revisión del equipo.', { code: o.business_application_code })));
        item.appendChild(info);
        if (o.receipt_number) {
          var b = el('button', 'bq-plan-cta', t('plans.mine.receipt', 'Ver comprobante {n}', { n: o.receipt_number }));
          b.type = 'button';
          b.addEventListener('click', function () { if (window.BaqueanoPlanReceipt) window.BaqueanoPlanReceipt.open(o); });
          item.appendChild(b);
        } else {
          var w = el('a', 'bq-plan-cta is-whatsapp', t('plans.mine.pay', 'Coordinar pago'));
          w.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(t('plans.mine.payText', 'Hola BAQUEANO, quiero coordinar el pago de mi pedido {code}.', { code: o.code }));
          w.target = '_blank'; w.rel = 'noopener';
          item.appendChild(w);
        }
        box.appendChild(item);
      });
    }).catch(function (err) {
      box.textContent = '';
      box.appendChild(el('p', 'bq-my-plan-empty', err.message));
    });
  }

  function init() {
    dialog = document.getElementById('bqPlanDialog');
    form = document.getElementById('bqPlanForm');
    errorBox = document.getElementById('bqPlanError');
    submitBtn = document.getElementById('bqPlanSubmit');
    if (!dialog || !form) return;
    document.querySelectorAll('.bq-plans-toggle button').forEach(function (b) {
      b.addEventListener('click', function () { setPeriod(b.getAttribute('data-period')); });
    });
    document.querySelectorAll('[data-choose-plan]').forEach(function (b) {
      b.addEventListener('click', function () { openForm(b.getAttribute('data-choose-plan')); });
    });
    dialog.addEventListener('click', function (e) {
      if (e.target.closest('[data-plan-close]') || e.target === dialog) closeForm();
    });
    form.addEventListener('submit', submit);
    document.querySelectorAll('[data-plans-login]').forEach(function (b) { b.addEventListener('click', login); });
    if (/^#(sendero|mirador|cumbre)$/.test(location.hash)) setTimeout(function () { openForm(location.hash.slice(1)); }, 400);

    api('catalog', {}, false).then(function (res) {
      (res.plans || []).forEach(function (p) { state.plans[p.code] = p; });
      renderPrices();
    }).catch(function () { /* quedan los precios publicados en el HTML */ });
    renderPrices();

    window.addEventListener('baqueano_session_updated', renderMine);
    ['baqueano:languageChanged', 'baqueano:i18nReady'].forEach(function (type) {
      window.addEventListener(type, function () { renderPrices(); if (state.plan && dialog.open) document.getElementById('bqPlanSummary').textContent = summaryText(); });
    });
    var tries = 0;
    (function waitAuth() {
      if (window.firebase && window.firebase.auth) {
        try { window.firebase.auth().onAuthStateChanged(function () { renderMine(); }); return; } catch (_) {}
      }
      if (++tries < 40) setTimeout(waitAuth, 250);
    })();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
