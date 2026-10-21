/**
 * 🧭 BAQUEANO — INFORME MENSUAL DEL PLAN CUMBRE (js/plan-report.js)
 * 🎯 POR QUÉ: el plan Cumbre promete «Informe mensual en PDF» (planes.html). Propietario,
 *   2026-10-20: «adaptar según el plan seleccionado para cumplir lo que debemos hacer».
 * ⚙️ CÓMO: arma un documento imprimible en una ventana nueva con datos reales que ya trae
 *   my_plans: visitas a la ficha y contactos del mes (plan_business_stats), comparación con el
 *   mes anterior y lo que BAQUEANO entregó (plan_deliverables, con enlace de evidencia). Si no
 *   hay datos, lo dice: nunca rellena con números inventados. Textos con BaqueanoLanguage.t y
 *   todo valor escapado. Desde la ventana se imprime o se guarda como PDF.
 * 📦 QUÉ: window.BaqueanoPlanReport.open(order) — order es un elemento de my_plans.
 */
(function () {
  'use strict';
  if (window.BaqueanoPlanReport) return;

  var PLAN_NAMES = { sendero: 'Sendero', mirador: 'Mirador', cumbre: 'Cumbre' };

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
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function lang() {
    try { return String((window.BaqueanoLanguage && window.BaqueanoLanguage.get && window.BaqueanoLanguage.get()) || 'es').slice(0, 2); } catch (_) { return 'es'; }
  }
  function monthLabel(ym) {
    if (!/^\d{4}-\d{2}/.test(String(ym || ''))) return '';
    var d = new Date(String(ym).slice(0, 7) + '-15T12:00:00Z');
    try { return d.toLocaleDateString(lang() === 'es' ? 'es-NI' : lang(), { month: 'long', year: 'numeric', timeZone: 'America/Managua' }); } catch (_) { return String(ym).slice(0, 7); }
  }
  function dateTime(v) {
    try { return new Date(v || Date.now()).toLocaleString(lang() === 'es' ? 'es-NI' : lang(), { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Managua' }); } catch (_) { return ''; }
  }
  function delta(now, prev) {
    if (prev == null) return '';
    var d = Number(now || 0) - Number(prev || 0);
    return d === 0 ? '=' : (d > 0 ? '+' + d : String(d));
  }
  function dutyLabel(kind) {
    var map = {
      social_welcome: 'Publicación de bienvenida en redes', social_post: 'Publicación en Instagram, Facebook y TikTok',
      social_ad: 'Publicación promocionada (pauta pagada)', chronicle: 'Publicación en Crónicas y Comunidad',
      report_pdf: 'Informe mensual en PDF', verification: 'Sello BAQUEANO verificado',
      video: 'Video de presentación', onboarding: 'Armado de tu ficha (textos y fotos)'
    };
    return t('plans.duty.' + kind, map[kind] || kind);
  }

  function build(o) {
    var st = o.stats || null;
    var plan = PLAN_NAMES[o.plan_code] || o.plan_code;
    var rows = st ? [
      [t('plans.mine.statViews', 'Visitas a tu ficha'), st.views, st.views_prev],
      [t('plans.mine.statWa', 'Contactos por WhatsApp'), st.whatsapp, null],
      [t('plans.mine.statCalls', 'Llamadas'), st.calls, null],
      [t('plans.mine.statMessages', 'Mensajes'), st.messages, null]
    ] : [];
    var contactsNow = st ? Number(st.whatsapp || 0) + Number(st.calls || 0) + Number(st.messages || 0) : 0;
    var statsHtml = st
      ? '<table><thead><tr><th>' + esc(t('plans.report.metric', 'Indicador')) + '</th><th>' + esc(t('plans.report.thisMonth', 'Este mes')) + '</th><th>' + esc(t('plans.report.prev', 'Mes anterior')) + '</th></tr></thead><tbody>' +
        rows.map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1] || 0) + '</td><td>' + esc(r[2] == null ? '—' : r[2] + ' (' + delta(r[1], r[2]) + ')') + '</td></tr>'; }).join('') +
        '<tr class="total"><td>' + esc(t('plans.report.contacts', 'Contactos en total')) + '</td><td>' + esc(contactsNow) + '</td><td>' + esc(st.contacts_prev == null ? '—' : st.contacts_prev + ' (' + delta(contactsNow, st.contacts_prev) + ')') + '</td></tr></tbody></table>'
      : '<p>' + esc(t('plans.mine.statsPending', 'Tus estadísticas aparecen cuando tu local esté publicado.')) + '</p>';
    var delivered = (o.delivered || []);
    var deliveredHtml = delivered.length
      ? '<ul>' + delivered.map(function (d) {
          var link = d.evidence_url && /^https:\/\//.test(d.evidence_url) ? ' — <a href="' + esc(d.evidence_url) + '">' + esc(t('plans.mine.dutySee', 'Ver publicación')) + '</a>' : '';
          return '<li>' + esc(dutyLabel(d.kind)) + ' · ' + esc(dateTime(d.done_at)) + link + '</li>';
        }).join('') + '</ul>'
      : '<p>' + esc(t('plans.report.none', 'Todavía no hay entregas registradas este mes.')) + '</p>';
    var pending = (o.duties || []).filter(function (d) { return d.missing > 0; });
    var pendingHtml = pending.length
      ? '<h2>' + esc(t('plans.report.pending', 'Pendiente este mes')) + '</h2><ul>' + pending.map(function (d) {
          return '<li>' + esc(dutyLabel(d.kind)) + ' · ' + esc(d.cadence === 'monthly' ? t('plans.mine.dutyMonthly', '{done} de {required} este mes', { done: d.done, required: d.required }) : t('plans.mine.dutyPending', 'Pendiente')) + '</li>';
        }).join('') + '</ul>'
      : '';
    return '<!doctype html><html lang="' + esc(lang()) + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + esc(t('plans.report.title', 'Informe mensual de tu negocio')) + ' · ' + esc(o.business_name) + '</title>' +
      '<style>body{font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;color:#1f2937;margin:0;padding:32px;max-width:820px}' +
      'header{display:flex;align-items:center;gap:16px;border-bottom:3px solid #C2410C;padding-bottom:14px;margin-bottom:18px}header img{width:64px;height:64px}' +
      'h1{margin:0;font-size:1.5rem;color:#7c2d12}h2{font-size:1.1rem;margin:22px 0 8px;color:#7c2d12}.sub{margin:4px 0 0;color:#475569}' +
      'table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #e5e7eb}th{background:#fff7ed}tr.total td{font-weight:800}' +
      'a{color:#9a3412}.note{margin-top:26px;font-size:.85rem;color:#64748b}.actions{margin:20px 0}' +
      'button{min-height:44px;padding:.6rem 1.2rem;border:0;border-radius:10px;background:#C2410C;color:#fff;font:700 1rem system-ui;cursor:pointer}' +
      '@media print{.actions{display:none}body{padding:0}}</style></head><body>' +
      '<header><img src="' + esc(location.origin) + '/assets/images/LOGOS/baqueano_logo_horizontal_negro.png" alt="BAQUEANO" style="width:auto;height:56px" onerror="this.remove()"><div>' +
      '<h1>' + esc(t('plans.report.title', 'Informe mensual de tu negocio')) + '</h1>' +
      '<p class="sub">' + esc(t('plans.report.subtitle', '{business} · Plan {plan} · {month}', { business: o.business_name, plan: plan, month: monthLabel(o.month || (st && st.month)) })) + '</p></div></header>' +
      '<h2>' + esc(t('plans.report.stats', 'Resultados del mes en BAQUEANO')) + '</h2>' + statsHtml +
      '<h2>' + esc(t('plans.report.delivered', 'Lo que BAQUEANO hizo por tu negocio')) + '</h2>' + deliveredHtml + pendingHtml +
      '<p class="note">' + esc(t('plans.report.source', 'Datos reales de BAQUEANO: visitas a tu ficha y contactos registrados en la web y la app. Generado el {date}.', { date: dateTime() })) + '</p>' +
      '<div class="actions"><button type="button" onclick="window.print()">' + esc(t('plans.report.print', 'Imprimir o guardar PDF')) + '</button></div>' +
      '</body></html>';
  }

  function open(order) {
    var win = window.open('', '_blank', 'noopener=no,width=900,height=1000');
    if (!win) return false;
    win.document.open();
    win.document.write(build(order || {}));
    win.document.close();
    return true;
  }

  window.BaqueanoPlanReport = { open: open, _build: build };
})();
