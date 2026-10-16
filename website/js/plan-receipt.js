/**
 * 🧭 BAQUEANO — COMPROBANTE DE PAGO DE PLANES (js/plan-receipt.js)
 * 🎯 POR QUÉ: el propietario pidió que, al pagar un plan, «le salga la factura» con el nombre
 *   de BAQUEANO y todos los datos del cliente. BAQUEANO todavía no tiene numeración autorizada
 *   por la DGI, así que el documento se llama «Comprobante de pago» y lo dice: no se presenta
 *   como factura fiscal.
 * ⚙️ CÓMO: arma un documento imprimible (A4/carta) en una ventana nueva con los datos del
 *   pedido ya emitido (número BQ-000001…, fecha, cliente, plan, período, montos en C$ y US$,
 *   cambio, método y referencia de pago). Desde ahí se imprime o se guarda como PDF.
 *   Todo texto del cliente se escapa. Lo usan planes.html (Mi plan) y el Ops Center.
 *   15-10-2026: logo de BAQUEANO y hora de la suscripción, del pago y de la emisión (hora de
 *   Nicaragua), a pedido del propietario.
 * 📦 QUÉ: window.BaqueanoPlanReceipt.open(order).
 */
(function () {
  'use strict';
  if (window.BaqueanoPlanReceipt) return;

  var ISSUER = {
    name: 'BAQUEANO Nicaragua',
    site: 'baqueanonicaragua.com',
    email: 'baqueanonicaragua@gmail.com',
    phone: '+505 7797 6973',
    city: 'Managua, Nicaragua'
  };
  var PLAN_NAMES = { sendero: 'Plan Sendero', mirador: 'Plan Mirador', cumbre: 'Plan Cumbre' };
  var ID_TYPES = { cedula: 'Cédula de identidad', ruc: 'RUC', pasaporte: 'Pasaporte', residencia: 'Cédula de residencia' };
  var METHODS = { transferencia: 'Transferencia bancaria', deposito: 'Depósito bancario', efectivo: 'Efectivo', billetera: 'Billetera electrónica', otro: 'Otro' };

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(value, currency) {
    var n = Number(value || 0);
    return (currency === 'NIO' ? 'C$ ' : 'US$ ') + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function date(value) {
    if (!value) return '—';
    var d = new Date(String(value).length === 10 ? value + 'T12:00:00' : value);
    if (isNaN(d)) return '—';
    return d.toLocaleDateString('es-NI', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Managua' });
  }

  // Fecha y hora en Nicaragua (el comprobante muestra la hora exacta de la suscripción y del pago).
  function dateTime(value) {
    if (!value) return '—';
    var d = new Date(value);
    if (isNaN(d)) return '—';
    return d.toLocaleString('es-NI', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Managua' });
  }
  function logoUrl() {
    var origin = (window.location && /^https?:/.test(window.location.origin)) ? window.location.origin : 'https://baqueanonicaragua.com';
    return origin + '/assets/images/LOGOS/baqueano_logo_horizontal_negro.png';
  }

  function html(o) {
    var period = o.billing_period === 'annual' ? 'Anual (12 meses)' : 'Mensual (1 mes)';
    var plan = PLAN_NAMES[o.plan_code] || ('Plan ' + o.plan_code);
    return '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Comprobante ' + esc(o.receipt_number) + ' · BAQUEANO</title>' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<style>' +
      '*{box-sizing:border-box}body{margin:0;background:#e5e7eb;font:14px/1.45 "Segoe UI",Arial,sans-serif;color:#111827}' +
      '.sheet{width:min(800px,100%);margin:20px auto;background:#fff;padding:36px 40px;border-radius:6px;box-shadow:0 10px 30px rgba(0,0,0,.15)}' +
      '.top{display:flex;justify-content:space-between;gap:20px;border-bottom:3px solid #165D6F;padding-bottom:16px}' +
      '.brand .logo{display:block;width:200px;max-width:60vw;height:auto;margin:0 0 8px}.brand h1{margin:0;font-size:24px;letter-spacing:.06em;color:#0D1B2A}.brand p{margin:2px 0;color:#374151}' +
      '.doc{text-align:right}.doc h2{margin:0;font-size:18px;color:#C2410C;letter-spacing:.04em}.doc .num{font-size:22px;font-weight:800;margin:4px 0}' +
      '.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:20px 0}' +
      '.box{border:1px solid #d1d5db;border-radius:6px;padding:12px 14px}.box h3{margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#165D6F}' +
      '.box p{margin:2px 0}table{width:100%;border-collapse:collapse;margin-top:6px}th,td{border:1px solid #d1d5db;padding:8px 10px;text-align:left;vertical-align:top}' +
      'th{background:#f3f4f6;font-size:12px;text-transform:uppercase;letter-spacing:.05em}td.r,th.r{text-align:right;white-space:nowrap}' +
      '.tot td{font-weight:800;background:#fff7ed}.note{margin-top:18px;padding:10px 12px;border-left:4px solid #C2410C;background:#fff7ed;font-size:12px;color:#7c2d12}' +
      '.foot{margin-top:24px;display:flex;justify-content:space-between;gap:20px;font-size:12px;color:#4b5563}.sign{margin-top:36px;border-top:1px solid #9ca3af;padding-top:6px;width:220px;text-align:center}' +
      '.actions{width:min(800px,100%);margin:0 auto 20px;display:flex;gap:10px;justify-content:flex-end}' +
      '.actions button{min-height:44px;padding:0 18px;border:0;border-radius:999px;background:#C2410C;color:#fff;font-weight:700;cursor:pointer}' +
      '@media print{body{background:#fff}.sheet{box-shadow:none;margin:0;width:100%;padding:18px}.actions{display:none}}' +
      '@media(max-width:640px){.sheet{padding:20px}.top,.foot{flex-direction:column}.doc{text-align:left}.grid{grid-template-columns:1fr}}' +
      '</style></head><body>' +
      '<div class="sheet">' +
        '<div class="top"><div class="brand"><img class="logo" src="' + esc(logoUrl()) + '" alt="BAQUEANO Nicaragua" width="200"><p><strong>' + esc(ISSUER.name) + '</strong></p><p>' + esc(ISSUER.city) + '</p><p>' + esc(ISSUER.phone) + ' · ' + esc(ISSUER.email) + '</p><p>' + esc(ISSUER.site) + '</p></div>' +
        '<div class="doc"><h2>COMPROBANTE DE PAGO</h2><div class="num">N.º ' + esc(o.receipt_number) + '</div><p>Emisión: ' + esc(dateTime(o.receipt_issued_at)) + '</p><p>Pedido: ' + esc(o.code) + '</p><p>Suscripción: ' + esc(dateTime(o.created_at)) + '</p></div></div>' +
        '<div class="grid">' +
          '<div class="box"><h3>Cliente</h3><p><strong>' + esc(o.legal_name) + '</strong></p><p>' + esc(ID_TYPES[o.id_type] || o.id_type) + ': ' + esc(o.id_number) + '</p><p>' + esc(o.billing_address) + '</p><p>' + esc(o.phone) + ' · ' + esc(o.email) + '</p>' + (o.client_type === 'empresa' ? '<p>Contacto: ' + esc(o.contact_name) + '</p>' : '') + '</div>' +
          '<div class="box"><h3>Local publicado</h3><p><strong>' + esc(o.business_name) + '</strong></p><p>' + esc([o.municipality, o.department].filter(Boolean).join(', ')) + '</p><h3 style="margin-top:10px">Pago</h3><p>' + esc(METHODS[o.payment_method] || o.payment_method || '—') + (o.payment_reference ? ' · Ref. ' + esc(o.payment_reference) : '') + '</p><p>Fecha y hora de pago: ' + esc(dateTime(o.paid_at)) + '</p></div>' +
        '</div>' +
        '<table><thead><tr><th>Cant.</th><th>Descripción</th><th class="r">Precio US$</th><th class="r">Total C$</th></tr></thead><tbody>' +
          '<tr><td>1</td><td>' + esc(plan) + ' — publicación del local en BAQUEANO (web y app Android).<br>Modalidad: ' + esc(period) + '<br>Vigencia: del ' + esc(date(o.period_start)) + ' al ' + esc(date(o.period_end)) + '</td><td class="r">' + esc(money(o.amount_usd, 'USD')) + '</td><td class="r">' + esc(money(o.amount_nio, 'NIO')) + '</td></tr>' +
          '<tr class="tot"><td colspan="3" class="r">TOTAL PAGADO</td><td class="r">' + esc(money(o.amount_nio, 'NIO')) + '<br><small>' + esc(money(o.amount_usd, 'USD')) + '</small></td></tr>' +
        '</tbody></table>' +
        '<p style="margin:8px 0 0;font-size:12px;color:#4b5563">Tipo de cambio de referencia: C$ ' + esc(Number(o.exchange_rate || 36.6243).toFixed(4)) + ' por US$ 1. Precio original en dólares.</p>' +
        '<div class="note"><strong>Documento no fiscal.</strong> Este comprobante acredita el pago del plan. BAQUEANO emitirá factura con numeración autorizada por la Dirección General de Ingresos (DGI) cuando cuente con dicha autorización.</div>' +
        '<div class="foot"><div><p>Gracias por confiar en BAQUEANO.</p><p>Consultas: ' + esc(ISSUER.phone) + ' (WhatsApp)</p></div><div class="sign">Recibido por BAQUEANO</div></div>' +
      '</div>' +
      '<div class="actions"><button type="button" onclick="window.print()">Imprimir o guardar PDF</button></div>' +
      '</body></html>';
  }

  function open(order) {
    if (!order || !order.receipt_number) return false;
    var win = window.open('', '_blank', 'noopener=no,width=900,height=1000');
    if (!win) return false;
    win.document.open();
    win.document.write(html(order));
    win.document.close();
    return true;
  }

  window.BaqueanoPlanReceipt = Object.freeze({ open: open, html: html });
})();
