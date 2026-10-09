// ============================================================================
// 🧭 BAQUEANO — OPS CENTER: AUTOMATIZACIÓN (ops-automation.js)
// ============================================================================
// 🎯 POR QUÉ:
// - Plan de evolución, F8: automatización en infraestructura con historial verificable. Los
//   controles corren solos cada hora (pg_cron → run_automation_checks) y el equipo tiene que ver
//   qué se comprobó, cuándo y con qué resultado, sin abrir Supabase.
// - La primera corrida (2026-10-07) detectó que la APK respondía 404 en producción: la vista
//   existe para que algo así se vea en minutos, no por casualidad.
//
// ⚙️ CÓMO:
// - Lee `automation_runs` por la Edge Function baqueano-ops (rol de equipo verificado en el
//   servidor; la tabla no tiene políticas públicas). "Ejecutar ahora" usa `automation_run_now`,
//   que exige rol admin, deja auditoría y admite como máximo 1 corrida cada 2 minutos.
// - Los nombres de los controles se traducen con opsAuto.check.<id>; el detalle es el dato medido
//   por el servidor (códigos HTTP, conteos, commit) y se muestra tal cual.
// - Todo se pinta con textContent.
//
// - Botón "Informe técnico PDF" (F9): BaqueanoOpsTechReport.download() con los datos del momento.
//
// 📦 QUÉ: window.BaqueanoOpsAutomation = { render(panel), refresh(), latest(), checkName(check) }.
// ============================================================================
(function (window, document) {
  'use strict';
  if (window.BaqueanoOpsAutomation) return;

  var state = { panel: null, items: null, schedule: '', error: '', busy: false, pdfBusy: false, notice: '' };
  var COLORS = { ok: '#4A7A5A', warn: '#B45309', fail: '#B91C1C', running: '#475569' };
  // Nombres en español si el Ops Center no tiene el motor de idioma cargado (admin.html no lo carga).
  var CHECK_ES = {
    web_health: 'Web publicada (/health)', sitemap: 'Sitemap (sitemap.xml)', app_download: 'Descarga de la app (/descargar y APK)',
    rls: 'RLS en todas las tablas públicas', definer_search_path: 'Funciones seguras con search_path fijo',
    data_quality: 'Calidad de datos publicados', operations: 'Pendientes de operación', baqui_activity: 'BAQÜI (actividad 7 días)',
    db_health: 'Reporte de salud de la base'
  };
  var ICONS = { ok: 'fa-circle-check', warn: 'fa-triangle-exclamation', fail: 'fa-circle-xmark', running: 'fa-spinner' };

  function tr(key, fallback, vars) {
    var out = fallback;
    try { if (window.BaqueanoLanguage && window.BaqueanoLanguage.t) out = window.BaqueanoLanguage.t(key, Object.assign({ fallback: fallback }, vars || {})); } catch (_) { /* sin motor i18n */ }
    return String(out).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
  }
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'text') node.textContent = v;
      else if (k === 'className') node.className = v;
      else node.setAttribute(k, v);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }
  function icon(name, color) { return el('i', { className: 'fa-solid ' + name, 'aria-hidden': 'true', style: color ? 'color:' + color : null }); }
  function when(iso) {
    if (!iso) return '—';
    try {
      var o = { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Managua' };
      return window.BaqueanoLanguage && window.BaqueanoLanguage.formatDate ? window.BaqueanoLanguage.formatDate(iso, o) : new Intl.DateTimeFormat('es-NI', o).format(new Date(iso));
    } catch (_) { return String(iso).slice(0, 16); }
  }
  function checkName(c) { return tr('opsAuto.check.' + c.id, CHECK_ES[c.id] || c.label || c.id); }
  function statusLabel(s) {
    return tr('opsAuto.status.' + s, { ok: 'Todo en orden', warn: 'Con avisos', fail: 'Con fallas', running: 'En curso' }[s] || s);
  }
  function badge(s) {
    return el('span', { style: 'display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;font-weight:800;font-size:.78rem;color:#fff;background:' + (COLORS[s] || '#475569') }, [icon(ICONS[s] || 'fa-circle'), document.createTextNode(statusLabel(s))]);
  }
  var BOX = 'background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:16px;margin-top:16px;color:#E2E8F0';
  var H = 'margin:0 0 10px;font:800 1rem/1.3 League Spartan,sans-serif;color:#F4E6C1';

  function latestBox() {
    var run = state.items && state.items[0];
    if (!run) {
      return el('section', { style: BOX }, [el('p', { style: 'margin:0', text: state.error || (state.items ? tr('opsAuto.empty', 'Todavía no hay corridas registradas.') : tr('opsAuto.loading', 'Cargando…')) })]);
    }
    var rows = (run.checks || []).map(function (c) {
      return el('tr', {}, [
        el('td', { style: 'padding:8px 6px;border-bottom:1px solid rgba(255,255,255,.06);white-space:nowrap' }, [badge(c.state)]),
        el('th', { scope: 'row', style: 'padding:8px 6px;border-bottom:1px solid rgba(255,255,255,.06);text-align:left;font-weight:700', text: checkName(c) }),
        el('td', { style: 'padding:8px 6px;border-bottom:1px solid rgba(255,255,255,.06);color:#CBD5E1;overflow-wrap:anywhere', text: c.detail || '' })
      ]);
    });
    return el('section', { style: BOX, 'aria-labelledby': 'opsAutoLatest' }, [
      el('h2', { id: 'opsAutoLatest', style: H, text: tr('opsAuto.latestTitle', 'Última corrida') }),
      el('p', { style: 'margin:0 0 10px;display:flex;flex-wrap:wrap;gap:10px;align-items:center' }, [
        badge(run.status),
        el('span', { text: when(run.started_at) + ' · ' + tr('opsAuto.trigger.' + run.trigger, run.trigger === 'cron' ? 'Programada' : 'Manual') }),
        el('span', { style: 'color:#94A3B8', text: run.summary || '' })
      ]),
      el('div', { style: 'overflow-x:auto' }, [el('table', { style: 'width:100%;border-collapse:collapse;font-size:.88rem' }, [
        el('caption', { className: 'sr-only', text: tr('opsAuto.latestTitle', 'Última corrida') }),
        el('thead', {}, [el('tr', {}, [
          el('th', { scope: 'col', style: 'text-align:left;padding:6px;color:#94A3B8', text: tr('opsAuto.colState', 'Estado') }),
          el('th', { scope: 'col', style: 'text-align:left;padding:6px;color:#94A3B8', text: tr('opsAuto.colCheck', 'Control') }),
          el('th', { scope: 'col', style: 'text-align:left;padding:6px;color:#94A3B8', text: tr('opsAuto.colDetail', 'Resultado medido') })
        ])]),
        el('tbody', {}, rows)
      ])])
    ]);
  }

  function historyBox() {
    var items = state.items || [];
    if (items.length < 2) return null;
    return el('section', { style: BOX, 'aria-labelledby': 'opsAutoHistory' }, [
      el('h2', { id: 'opsAutoHistory', style: H, text: tr('opsAuto.historyTitle', 'Historial') }),
      el('ol', { style: 'list-style:none;margin:0;padding:0;display:grid;gap:6px' }, items.map(function (r) {
        return el('li', { style: 'display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)' }, [
          badge(r.status),
          el('span', { text: when(r.started_at) }),
          el('span', { style: 'color:#94A3B8', text: tr('opsAuto.trigger.' + r.trigger, r.trigger === 'cron' ? 'Programada' : 'Manual') + ' · ' + (r.summary || '') })
        ]);
      }))
    ]);
  }

  function renderInto(panel) {
    if (!panel) return;
    var canWrite = !!(window.BaqueanoOpsData && window.BaqueanoOpsData.state && window.BaqueanoOpsData.state.canWrite);
    var actions = [];
    var reload = el('button', { type: 'button', className: 'ops-btn' }, [icon('fa-rotate'), document.createTextNode(' ' + tr('opsAuto.refresh', 'Actualizar'))]);
    reload.addEventListener('click', function () { refresh(); });
    actions.push(reload);
    // F9: informe técnico en PDF con los datos reales del momento (lectura: todo el personal).
    if (window.BaqueanoOpsTechReport) {
      var pdf = el('button', { type: 'button', className: 'ops-btn', disabled: state.pdfBusy ? 'disabled' : null, 'aria-busy': state.pdfBusy ? 'true' : null },
        [icon(state.pdfBusy ? 'fa-spinner fa-spin' : 'fa-file-pdf'), document.createTextNode(' ' + tr('techReport.button', 'Informe técnico PDF'))]);
      pdf.addEventListener('click', downloadReport);
      actions.push(pdf);
    }
    if (canWrite) {
      var run = el('button', { type: 'button', className: 'ops-btn ops-btn-primary', disabled: state.busy ? 'disabled' : null, 'aria-busy': state.busy ? 'true' : null },
        [icon(state.busy ? 'fa-spinner fa-spin' : 'fa-play'), document.createTextNode(' ' + tr('opsAuto.runNow', 'Ejecutar ahora'))]);
      run.addEventListener('click', runNow);
      actions.push(run);
    }
    panel.replaceChildren(
      el('div', { className: 'ops-view-header' }, [
        el('div', { className: 'ops-view-title-group' }, [
          el('h1', {}, [icon('fa-robot'), document.createTextNode(' ' + tr('opsAuto.title', 'Automatización'))]),
          el('p', { className: 'ops-view-subtitle', text: tr('opsAuto.subtitle', 'Controles automáticos cada hora: web, sitemap, descarga de la app, seguridad de la base y calidad de datos.') })
        ]),
        el('div', { className: 'ops-view-actions' }, actions)
      ]),
      state.notice ? el('p', { role: 'status', style: 'margin:12px 0 0;color:#F4E6C1', text: state.notice }) : null,
      latestBox(),
      historyBox()
    );
  }

  function refresh() {
    if (!window.BaqueanoOpsData) { state.error = tr('opsAuto.noApi', 'El Ops Center todavía no inició sesión.'); renderInto(state.panel); return Promise.resolve(); }
    return window.BaqueanoOpsData.call('automation_runs', { limit: 24 }).then(function (d) {
      state.items = d.items || []; state.schedule = d.schedule || ''; state.error = '';
    }, function (e) {
      state.items = state.items || null; state.error = (e && e.message) || tr('opsAuto.error', 'No se pudo leer el historial.');
    }).then(function () { renderInto(state.panel); });
  }

  function runNow() {
    if (state.busy || !window.BaqueanoOpsData) return;
    state.busy = true; state.notice = tr('opsAuto.running', 'Ejecutando los controles…'); renderInto(state.panel);
    window.BaqueanoOpsData.call('automation_run_now', {}).then(function (d) {
      state.notice = d.throttled ? tr('opsAuto.throttled', 'Hubo una corrida hace menos de 2 minutos; se muestra esa.') : tr('opsAuto.done', 'Controles ejecutados.');
    }, function (e) {
      state.notice = (e && e.message) || tr('opsAuto.error', 'No se pudo leer el historial.');
    }).then(function () { state.busy = false; return refresh(); });
  }

  function downloadReport() {
    if (state.pdfBusy) return;
    state.pdfBusy = true; state.notice = tr('techReport.building', 'Reuniendo los datos y armando el PDF…'); renderInto(state.panel);
    window.BaqueanoOpsTechReport.download().then(function (r) {
      state.notice = tr('techReport.ready', 'Informe descargado: {file} ({pages} páginas).', { file: r.filename, pages: r.pages });
    }, function (e) {
      state.notice = tr('techReport.failed', 'No se pudo generar el informe') + ': ' + ((e && e.message) || e);
    }).then(function () { state.pdfBusy = false; renderInto(state.panel); });
  }

  function render(panel) { state.panel = panel; renderInto(panel); refresh(); }
  window.addEventListener('baqueano:languageChanged', function () { renderInto(state.panel); });

  window.BaqueanoOpsAutomation = { render: render, refresh: refresh, checkName: checkName, latest: function () { return state.items && state.items[0] || null; } };
})(window, document);
