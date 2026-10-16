// ============================================================================
// 🧭 BAQUEANO — OPS CENTER: PLANES Y COMPROBANTES (ops-plans.js)
// ============================================================================
// 🎯 POR QUÉ: pedido del propietario (2026-10-15). Los negocios piden un plan en planes.html,
//   el pago se coordina por WhatsApp y el equipo tiene que poder: ver el pedido con los datos
//   del cliente, marcar el contacto, confirmar el pago (sale el comprobante numerado), crear el
//   usuario del propietario con contraseña temporal y mandarle sus datos por WhatsApp.
// ⚙️ CÓMO: todo pasa por la Edge Function baqueano-plans con el token de Firebase de la sesión;
//   el servidor decide el rol (auditor solo lee; admin y super_admin actúan) y deja auditoría.
//   El comprobante lo arma js/plan-receipt.js. La contraseña temporal llega una sola vez y no se
//   guarda en ningún lado: se muestra para copiarla o enviarla. Todo se pinta con textContent.
// 📦 QUÉ: window.BaqueanoOpsPlans = { render(panel), refresh() } para la vista 44-planes.
// ============================================================================
(function (window, document) {
  'use strict';
  if (window.BaqueanoOpsPlans) return;

  var ENDPOINT = 'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-plans';
  var PLAN_NAMES = { sendero: 'Sendero', mirador: 'Mirador', cumbre: 'Cumbre' };
  var STATUS = [
    ['', 'Todos'], ['pending', 'Pendientes de pago'], ['contacted', 'En contacto'], ['paid', 'Pagados'], ['cancelled', 'Cancelados']
  ];
  var STATUS_LABEL = { pending: 'Pendiente de pago', contacted: 'En contacto', paid: 'Pagado', cancelled: 'Cancelado' };
  var ID_TYPES = { cedula: 'Cédula', ruc: 'RUC', pasaporte: 'Pasaporte', residencia: 'Residencia' };
  var METHODS = [['transferencia', 'Transferencia bancaria'], ['deposito', 'Depósito bancario'], ['efectivo', 'Efectivo'], ['billetera', 'Billetera electrónica'], ['otro', 'Otro']];
  var state = { panel: null, filter: '', orders: [], loading: false, error: '', notice: '', role: '' };

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
  function nio(n) { return 'C$ ' + Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 }); }
  function usd(n) { return 'US$ ' + Number(n || 0).toFixed(2); }
  function fmt(v) { if (!v) return '—'; var d = new Date(v); return isNaN(d) ? '—' : d.toLocaleString('es-NI', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Managua' }); }
  function waDigits(phone) { return String(phone || '').replace(/\D/g, ''); }
  function canWrite() { return state.role !== 'auditor'; }

  function call(action, payload) {
    var u = null;
    try { u = window.firebase && window.firebase.auth ? window.firebase.auth().currentUser : null; } catch (_) { u = null; }
    if (!u) return Promise.reject(new Error('Iniciá sesión con tu cuenta del equipo.'));
    return u.getIdToken().then(function (token) {
      return fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json', 'x-firebase-token': token }, body: JSON.stringify(Object.assign({ action: action }, payload || {})) });
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (body) {
        if (!res.ok || !body.ok) throw new Error(body.error || ('Error ' + res.status));
        return body;
      });
    });
  }

  function refresh() {
    state.loading = true; state.error = ''; paint();
    try { var s = window.BaqueanoOpsData && window.BaqueanoOpsData.state; state.role = (s && s.role) || state.role; } catch (_) {}
    return call('orders_list', {}).then(function (res) {
      state.orders = res.orders || [];
    }).catch(function (e) { state.error = e.message; }).then(function () { state.loading = false; paint(); });
  }

  // ── Ventanas ──
  function dialog(title, body, actions) {
    var d = el('dialog', { className: 'ops-plans-dialog', 'aria-label': title });
    var close = el('button', { type: 'button', className: 'ops-btn', 'aria-label': 'Cerrar' }, [icon('fa-solid fa-xmark')]);
    close.addEventListener('click', function () { d.close(); });
    d.appendChild(el('header', { className: 'ops-plans-dialog-head' }, [el('h2', { text: title }), close]));
    d.appendChild(body);
    if (actions) d.appendChild(el('footer', { className: 'ops-plans-dialog-foot' }, actions));
    d.addEventListener('close', function () { d.remove(); });
    document.body.appendChild(d);
    d.showModal();
    return d;
  }

  function confirmPayment(o) {
    var method = el('select', { required: true });
    METHODS.forEach(function (m) { method.appendChild(el('option', { value: m[0], text: m[1] })); });
    var ref = el('input', { maxlength: '120', placeholder: 'N.º de transferencia o recibo' });
    var paid = el('input', { type: 'datetime-local' });
    var now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); paid.value = now.toISOString().slice(0, 16);
    var err = el('p', { className: 'ops-plans-error', role: 'alert', hidden: true });
    var body = el('div', { className: 'ops-plans-form' }, [
      el('p', { text: 'Pedido ' + o.code + ' · Plan ' + (PLAN_NAMES[o.plan_code] || o.plan_code) + ' ' + (o.billing_period === 'annual' ? 'anual' : 'mensual') + ' · ' + nio(o.amount_nio) + ' (' + usd(o.amount_usd) + ')' }),
      el('label', {}, [el('span', { text: 'Método de pago' }), method]),
      el('label', {}, [el('span', { text: 'Referencia (opcional)' }), ref]),
      el('label', {}, [el('span', { text: 'Fecha y hora del pago' }), paid]),
      el('p', { className: 'ops-plans-hint', text: 'Al confirmar se emite el comprobante con número correlativo. Ese número y los montos ya no cambian.' }),
      err
    ]);
    var ok = el('button', { type: 'button', className: 'ops-btn is-primary' }, [icon('fa-solid fa-file-invoice'), ' Confirmar pago y emitir comprobante']);
    var d = dialog('Confirmar pago', body, [ok]);
    ok.addEventListener('click', function () {
      ok.disabled = true; err.hidden = true;
      call('order_confirm_payment', { id: o.id, payment_method: method.value, payment_reference: ref.value, paid_at: paid.value ? new Date(paid.value).toISOString() : null })
        .then(function (res) {
          d.close();
          state.notice = 'Comprobante ' + res.order.receipt_number + ' emitido para ' + o.code + '.';
          if (window.BaqueanoPlanReceipt) window.BaqueanoPlanReceipt.open(res.order);
          refresh();
        }).catch(function (e) { ok.disabled = false; err.textContent = e.message; err.hidden = false; });
    });
  }

  function createAccount(o) {
    var err = el('p', { className: 'ops-plans-error', role: 'alert', hidden: true });
    var body = el('div', { className: 'ops-plans-form' }, [
      el('p', { text: 'Se crea la cuenta de ' + o.contact_name + ' con el correo ' + o.email + ' y una contraseña temporal. Al entrar en planes.html#mi-plan tendrá que cambiarla.' }),
      el('p', { text: 'Además, el local «' + o.business_name + '» entra a la cola de solicitudes de negocios para revisarlo y publicarlo.' }),
      err
    ]);
    var ok = el('button', { type: 'button', className: 'ops-btn is-primary' }, [icon('fa-solid fa-user-plus'), ' Crear cuenta']);
    var d = dialog('Cuenta del propietario', body, [ok]);
    ok.addEventListener('click', function () {
      ok.disabled = true; err.hidden = true;
      call('owner_account_create', { id: o.id }).then(function (res) {
        d.close();
        showCredentials(o, res);
        refresh();
      }).catch(function (e) { ok.disabled = false; err.textContent = e.message; err.hidden = false; });
    });
  }

  function showCredentials(o, res) {
    var link = 'https://baqueanonicaragua.com/planes.html#mi-plan';
    var text = 'Hola ' + res.contact_name + ', bienvenido a BAQUEANO. Tu plan ' + (PLAN_NAMES[o.plan_code] || o.plan_code) + ' ya está activo.\n\n' +
      'Entrá en ' + link + '\nUsuario: ' + res.email + '\nContraseña temporal: ' + res.temp_password + '\n\n' +
      'Al entrar te vamos a pedir que la cambiés. Ahí también ves tu comprobante ' + (o.receipt_number || '') + '.';
    var pass = el('code', { className: 'ops-plans-pass', text: res.temp_password });
    var copy = el('button', { type: 'button', className: 'ops-btn' }, [icon('fa-regular fa-copy'), ' Copiar mensaje']);
    copy.addEventListener('click', function () {
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { copy.replaceChildren(icon('fa-solid fa-check')); });
    });
    var wa = el('a', { className: 'ops-btn is-primary', href: 'https://wa.me/' + waDigits(res.phone) + '?text=' + encodeURIComponent(text), target: '_blank', rel: 'noopener' }, [icon('fa-brands fa-whatsapp'), ' Enviar por WhatsApp']);
    dialog('Cuenta creada', el('div', { className: 'ops-plans-form' }, [
      el('p', { text: 'Usuario: ' + res.email }),
      el('p', {}, ['Contraseña temporal: ', pass]),
      el('p', { className: 'ops-plans-hint is-warning', text: 'Se muestra una sola vez y no queda guardada. Enviala ahora al propietario.' }),
      res.application_code ? el('p', { text: 'Solicitud de publicación: ' + res.application_code + ' (Buzón / Negocios).' }) : null
    ]), [copy, wa]);
  }

  function setStatus(o, status, label) {
    if (status === 'cancelled' && !window.confirm('¿Cancelar el pedido ' + o.code + '? No se borra: queda como cancelado.')) return;
    call('order_status', { id: o.id, status: status }).then(function () {
      state.notice = 'Pedido ' + o.code + ': ' + label + '.'; refresh();
    }).catch(function (e) { state.error = e.message; paint(); });
  }

  // ── Pintado ──
  function orderCard(o) {
    var head = el('div', { className: 'ops-plans-card-head' }, [
      el('strong', { text: o.code }),
      el('span', { className: 'ops-plans-status is-' + o.status, text: STATUS_LABEL[o.status] || o.status }),
      el('span', { className: 'ops-plans-plan is-' + o.plan_code, text: (PLAN_NAMES[o.plan_code] || o.plan_code) + ' · ' + (o.billing_period === 'annual' ? 'Anual' : 'Mensual') }),
      el('span', { className: 'ops-plans-amount', text: nio(o.amount_nio) + ' · ' + usd(o.amount_usd) })
    ]);
    var info = el('dl', { className: 'ops-plans-info' }, [
      el('dt', { text: 'Local' }), el('dd', { text: o.business_name + ' · ' + [o.municipality, o.department].filter(Boolean).join(', ') }),
      el('dt', { text: 'Cliente' }), el('dd', { text: o.legal_name + ' · ' + (ID_TYPES[o.id_type] || o.id_type) + ' ' + o.id_number }),
      el('dt', { text: 'Contacto' }), el('dd', { text: o.contact_name + ' · ' + o.phone + ' · ' + o.email }),
      el('dt', { text: 'Dirección' }), el('dd', { text: o.billing_address }),
      el('dt', { text: 'Recibido' }), el('dd', { text: fmt(o.created_at) }),
      o.receipt_number ? el('dt', { text: 'Comprobante' }) : null,
      o.receipt_number ? el('dd', { text: o.receipt_number + ' · ' + fmt(o.receipt_issued_at) + ' · vigencia ' + (o.period_start || '') + ' → ' + (o.period_end || '') }) : null,
      o.owner_uid ? el('dt', { text: 'Cuenta' }) : null,
      o.owner_uid ? el('dd', { text: 'Creada ' + fmt(o.account_created_at) + (o.must_change_password ? ' · falta cambiar la contraseña temporal' : ' · contraseña cambiada') + (o.business_application_code ? ' · solicitud ' + o.business_application_code : '') }) : null,
      o.notes ? el('dt', { text: 'Notas del cliente' }) : null,
      o.notes ? el('dd', { text: o.notes }) : null
    ]);
    var actions = el('div', { className: 'ops-plans-actions' });
    var wa = el('a', { className: 'ops-btn', href: 'https://wa.me/' + waDigits(o.phone) + '?text=' + encodeURIComponent('Hola ' + o.contact_name + ', te escribimos de BAQUEANO por tu pedido ' + o.code + ' (plan ' + (PLAN_NAMES[o.plan_code] || o.plan_code) + ').'), target: '_blank', rel: 'noopener' }, [icon('fa-brands fa-whatsapp'), ' WhatsApp']);
    actions.appendChild(wa);
    if (o.receipt_number) {
      var r = el('button', { type: 'button', className: 'ops-btn' }, [icon('fa-solid fa-file-invoice'), ' Ver comprobante']);
      r.addEventListener('click', function () { if (window.BaqueanoPlanReceipt) window.BaqueanoPlanReceipt.open(o); });
      actions.appendChild(r);
    }
    if (canWrite()) {
      if (o.status === 'pending') {
        var c = el('button', { type: 'button', className: 'ops-btn' }, [icon('fa-regular fa-comments'), ' Marcar en contacto']);
        c.addEventListener('click', function () { setStatus(o, 'contacted', 'en contacto'); });
        actions.appendChild(c);
      }
      if (o.status === 'pending' || o.status === 'contacted') {
        var p = el('button', { type: 'button', className: 'ops-btn is-primary' }, [icon('fa-solid fa-circle-check'), ' Confirmar pago']);
        p.addEventListener('click', function () { confirmPayment(o); });
        actions.appendChild(p);
        var x = el('button', { type: 'button', className: 'ops-btn is-danger' }, [icon('fa-solid fa-ban'), ' Cancelar']);
        x.addEventListener('click', function () { setStatus(o, 'cancelled', 'cancelado'); });
        actions.appendChild(x);
      }
      if (o.status === 'cancelled') {
        var re = el('button', { type: 'button', className: 'ops-btn' }, [icon('fa-solid fa-rotate-left'), ' Reabrir']);
        re.addEventListener('click', function () { setStatus(o, 'pending', 'reabierto'); });
        actions.appendChild(re);
      }
      if (o.status === 'paid' && !o.owner_uid) {
        var a = el('button', { type: 'button', className: 'ops-btn is-primary' }, [icon('fa-solid fa-user-plus'), ' Crear cuenta del propietario']);
        a.addEventListener('click', function () { createAccount(o); });
        actions.appendChild(a);
      }
    }
    return el('article', { className: 'ops-plans-card' }, [head, info, actions]);
  }

  function paint() {
    if (!state.panel) return;
    var counts = {};
    state.orders.forEach(function (o) { counts[o.status] = (counts[o.status] || 0) + 1; });
    var filters = el('div', { className: 'ops-plans-filters', role: 'group', 'aria-label': 'Filtrar pedidos' });
    STATUS.forEach(function (s) {
      var n = s[0] ? (counts[s[0]] || 0) : state.orders.length;
      var b = el('button', { type: 'button', className: 'ops-btn' + (state.filter === s[0] ? ' is-active' : ''), 'aria-pressed': state.filter === s[0] ? 'true' : 'false', text: s[1] + ' (' + n + ')' });
      b.addEventListener('click', function () { state.filter = s[0]; paint(); });
      filters.appendChild(b);
    });
    var reload = el('button', { type: 'button', className: 'ops-btn' }, [icon('fa-solid fa-rotate'), ' Actualizar']);
    reload.addEventListener('click', refresh);
    var page = el('a', { className: 'ops-btn', href: 'planes.html', target: '_blank', rel: 'noopener' }, [icon('fa-solid fa-store'), ' Ver página de planes']);
    var list = el('div', { className: 'ops-plans-list', 'aria-live': 'polite' });
    if (state.loading) list.appendChild(el('p', { className: 'ops-plans-empty', text: 'Cargando pedidos…' }));
    else if (state.error) list.appendChild(el('p', { className: 'ops-plans-error', role: 'alert', text: state.error }));
    else {
      var rows = state.orders.filter(function (o) { return !state.filter || o.status === state.filter; });
      if (!rows.length) list.appendChild(el('p', { className: 'ops-plans-empty', text: state.orders.length ? 'No hay pedidos con ese estado.' : 'Todavía no hay pedidos de planes. Cuando un negocio envíe el formulario en planes.html aparece aquí.' }));
      rows.forEach(function (o) { list.appendChild(orderCard(o)); });
    }
    var header = el('div', { className: 'ops-view-header' }, [el('h1', {}, [icon('fa-solid fa-store'), ' ', el('span', { 'data-i18n': 'opsPlans.title', text: 'Planes y comprobantes' })])]);
    var intro = el('p', { className: 'ops-plans-hint', text: 'Pedidos de Sendero (US$ 8), Mirador (US$ 20) y Cumbre (US$ 50). Flujo: en contacto por WhatsApp → confirmar pago (sale el comprobante) → crear la cuenta del propietario (el local entra a revisión).' });
    var children = [header, intro, el('div', { className: 'ops-plans-toolbar' }, [filters, el('div', { className: 'ops-plans-tools' }, [reload, page])])];
    if (state.notice) children.push(el('p', { className: 'ops-plans-notice', role: 'status', text: state.notice }));
    if (!canWrite()) children.push(el('p', { className: 'ops-plans-hint', text: 'Rol de solo lectura: podés ver los pedidos y los comprobantes.' }));
    children.push(list);
    state.panel.replaceChildren.apply(state.panel, children);
  }

  function installStyle() {
    if (document.getElementById('opsPlansStyle')) return;
    var css = '.ops-plans-toolbar{display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;margin:12px 0}' +
      '.ops-plans-filters,.ops-plans-tools,.ops-plans-actions{display:flex;flex-wrap:wrap;gap:8px}' +
      '.ops-plans-filters .ops-btn.is-active{background:#C2410C;color:#fff;border-color:#C2410C}' +
      '.ops-plans-list{display:grid;gap:12px}' +
      '.ops-plans-card{padding:14px 16px;border-radius:14px;border:1px solid rgba(244,230,193,.14);background:rgba(15,23,42,.7);color:#f8fafc}' +
      '.ops-plans-card-head{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin-bottom:8px}' +
      '.ops-plans-card-head strong{font:800 1.05rem/1.2 League Spartan,sans-serif;letter-spacing:.03em}' +
      '.ops-plans-status,.ops-plans-plan{padding:.2rem .6rem;border-radius:999px;font-size:.76rem;font-weight:800;background:rgba(148,163,184,.2)}' +
      '.ops-plans-status.is-paid{background:rgba(74,222,128,.18);color:#bbf7d0}.ops-plans-status.is-pending{background:rgba(251,191,36,.18);color:#fde68a}' +
      '.ops-plans-status.is-contacted{background:rgba(56,189,248,.18);color:#bae6fd}.ops-plans-status.is-cancelled{background:rgba(248,113,113,.18);color:#fecaca}' +
      '.ops-plans-plan.is-sendero{color:#f5c49b}.ops-plans-plan.is-mirador{color:#e5e7eb}.ops-plans-plan.is-cumbre{color:#fde68a}' +
      '.ops-plans-amount{margin-left:auto;font-weight:800}' +
      '.ops-plans-info{display:grid;grid-template-columns:max-content 1fr;gap:4px 12px;margin:0 0 10px;font-size:.88rem}.ops-plans-info dt{color:#94a3b8;font-weight:700}.ops-plans-info dd{margin:0;color:#e2e8f0;overflow-wrap:anywhere}' +
      '.ops-plans-empty,.ops-plans-hint{color:#cbd5e1}.ops-plans-hint.is-warning{color:#fed7aa;font-weight:700}' +
      '.ops-plans-error{padding:.6rem .8rem;border-radius:10px;background:rgba(248,113,113,.14);border:1px solid rgba(248,113,113,.5);color:#fecaca}' +
      '.ops-plans-notice{padding:.6rem .8rem;border-radius:10px;background:rgba(74,222,128,.12);border:1px solid rgba(74,222,128,.4);color:#bbf7d0}' +
      '.ops-btn.is-danger{border-color:rgba(248,113,113,.6);color:#fecaca}' +
      '.ops-plans-dialog{width:min(560px,calc(100vw - 24px));padding:0;border:1px solid rgba(244,230,193,.18);border-radius:16px;background:#0e1726;color:#f8fafc}' +
      '.ops-plans-dialog::backdrop{background:rgba(2,6,23,.7)}' +
      '.ops-plans-dialog-head{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.1)}.ops-plans-dialog-head h2{margin:0;font-size:1.15rem;color:#fff}' +
      '.ops-plans-form{display:grid;gap:10px;padding:14px 16px}.ops-plans-form label{display:grid;gap:4px;font-weight:700;font-size:.88rem}' +
      '.ops-plans-form input,.ops-plans-form select{min-height:44px;padding:.5rem .7rem;border-radius:10px;border:1px solid rgba(244,230,193,.22);background:#0b1320;color:#fff;font:inherit}' +
      '.ops-plans-dialog-foot{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;padding:0 16px 16px}' +
      '.ops-plans-pass{display:inline-block;padding:.3rem .6rem;border-radius:8px;background:#0b1320;border:1px dashed #f4e6c1;font-size:1.05rem;letter-spacing:.04em;user-select:all}' +
      '@media(max-width:600px){.ops-plans-info{grid-template-columns:1fr}.ops-plans-amount{margin-left:0}}';
    var s = document.createElement('style'); s.id = 'opsPlansStyle'; s.textContent = css; document.head.appendChild(s);
  }

  function render(panel) { installStyle(); state.panel = panel; state.notice = ''; paint(); refresh(); }
  window.BaqueanoOpsPlans = { render: render, refresh: refresh, _state: state };
})(window, document);
