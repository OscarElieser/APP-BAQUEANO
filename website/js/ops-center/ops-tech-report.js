// ============================================================================
// 🧭 BAQUEANO — OPS CENTER: INFORME TÉCNICO PDF (ops-tech-report.js)
// ============================================================================
// 🎯 POR QUÉ:
// - Plan de evolución, F9: un informe técnico en PDF con datos reales, para presentar el estado de
//   la plataforma (jurado, aliados, auditoría) sin capturas de pantalla ni cifras escritas a mano.
//
// ⚙️ CÓMO:
// - Junta, en paralelo y en el momento, lo que ya mide el sistema:
//     baqueano-ops → health (servicios), automation_runs (F8), db_health (db_health_report) y
//     overview (conteos del catálogo); data/app-release.json y public_app_download_stats (app).
// - Cada sección lleva su fuente y su hora. Si una fuente falla, la sección dice "Sin datos" y
//   el motivo; nunca se rellena con estimaciones.
// - El PDF lo arma BaqueanoPdf.techReport (js/baqueano-pdf.js, jsPDF local, texto real).
// - Textos con claves techReport.* (respaldo en español: admin.html no carga el motor de idioma).
//
// 📦 QUÉ: window.BaqueanoOpsTechReport = { build() → datos, download() → PDF }.
// ============================================================================
(function (window, document) {
  'use strict';
  if (window.BaqueanoOpsTechReport) return;

  var STATS_RPC = 'https://heiudfpthqwtjrtluqlm.supabase.co/rest/v1/rpc/public_app_download_stats';
  var PUBLIC_KEY = 'sb_publishable_q7ZhqRIRjlerZK7WOu_Qxw_X_AqXV1d';

  function tr(key, fallback, vars) {
    var out = fallback;
    try { if (window.BaqueanoLanguage && window.BaqueanoLanguage.t) out = window.BaqueanoLanguage.t(key, Object.assign({ fallback: fallback }, vars || {})); } catch (_) { /* sin motor i18n */ }
    return String(out).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
  }
  function stamp(iso) {
    try { return new Intl.DateTimeFormat('es-NI', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Managua' }).format(iso ? new Date(iso) : new Date()); } catch (_) { return String(iso || ''); }
  }
  function n(v) { return v == null ? '—' : Number(v).toLocaleString('es-NI'); }
  function settle(p) { return p.then(function (v) { return { ok: true, v: v }; }, function (e) { return { ok: false, e: (e && e.message) || String(e) }; }); }
  function api(action, payload) {
    if (!window.BaqueanoOpsData) return Promise.reject(new Error(tr('techReport.noSession', 'El Ops Center no tiene sesión.')));
    return window.BaqueanoOpsData.call(action, payload || {});
  }

  var HEALTH_STATE = { OPERATIVO: 'ok', DEGRADADO: 'warn', SIN_CONFIGURAR: 'warn', DESCONOCIDO: 'warn', ERROR: 'fail' };
  var METRICS = [
    ['departments', 'Departamentos y regiones'], ['municipalities', 'Municipios'], ['places', 'Lugares en el catálogo'],
    ['places_published', 'Lugares publicados'], ['places_map_ready', 'Lugares con ubicación exacta en el mapa'],
    ['destinations_published', 'Destinos publicados'], ['businesses', 'Negocios registrados'], ['businesses_verified', 'Negocios verificados'],
    ['experiences', 'Experiencias'], ['emergencies', 'Contactos de emergencia'], ['profiles', 'Perfiles de usuario'],
    ['testimonials_published', 'Experiencias de la comunidad publicadas'], ['ai_messages', 'Mensajes de BAQÜI registrados'],
    ['traffic_sessions_24h', 'Sesiones de tráfico (24 h)'], ['audit_logs', 'Registros de auditoría']
  ];

  function healthSection(r) {
    var s = { title: tr('techReport.secHealth', 'Servicios en producción'), source: 'baqueano-ops · health' };
    if (!r.ok) { s.error = r.e; return s; }
    s.at = stamp(r.v.generated_at);
    s.rows = (r.v.checks || []).map(function (c) {
      return [c.label, (c.detail || '') + (c.latency_ms != null ? ' (' + c.latency_ms + ' ms)' : ''), HEALTH_STATE[c.state] || 'warn'];
    });
    return s;
  }

  function automationSection(r) {
    var s = { title: tr('techReport.secAutomation', 'Controles automáticos (cada hora)'), source: 'Supabase automation_runs · pg_cron' };
    if (!r.ok) { s.error = r.e; return s; }
    var items = r.v.items || [];
    if (!items.length) { s.error = tr('techReport.noRuns', 'todavía no hay corridas registradas'); return s; }
    var last = items[0];
    var count = { ok: 0, warn: 0, fail: 0 };
    items.forEach(function (it) { if (count[it.status] != null) count[it.status]++; });
    s.at = stamp(last.started_at);
    s.note = tr('techReport.automationNote', 'Últimas {n} corridas: {ok} correctas, {warn} con avisos, {fail} con fallas. Detalle de la más reciente:', { n: items.length, ok: count.ok, warn: count.warn, fail: count.fail });
    var name = window.BaqueanoOpsAutomation && window.BaqueanoOpsAutomation.checkName ? window.BaqueanoOpsAutomation.checkName : function (c) { return tr('opsAuto.check.' + c.id, c.label || c.id); };
    s.rows = (last.checks || []).map(function (c) { return [name(c), c.detail || '', c.state]; });
    return s;
  }

  function databaseSection(r) {
    var s = { title: tr('techReport.secDatabase', 'Base de datos y seguridad'), source: 'Supabase · db_health_report()' };
    if (!r.ok) { s.error = r.e; return s; }
    var rep = r.v.report || {}, st = rep.structure || {}, dq = rep.data_quality || {}, op = rep.operations || {};
    var len = function (a) { return Array.isArray(a) ? a.length : 0; };
    s.at = stamp(rep.generated_at);
    s.rows = [
      [tr('techReport.dbTables', 'Tablas'), n(st.tables)],
      [tr('techReport.dbRls', 'Tablas con RLS activo'), n(st.rls_enabled) + ' / ' + n(st.tables), len(st.tables_without_rls) ? 'fail' : 'ok'],
      [tr('techReport.dbRlsNoPolicy', 'Tablas con RLS y sin políticas (solo servidor)'), n(len(st.rls_without_policies))],
      [tr('techReport.dbDefiner', 'Funciones seguras sin search_path fijo'), n(len(st.security_definer_without_search_path)), len(st.security_definer_without_search_path) ? 'warn' : 'ok'],
      [tr('techReport.dbFk', 'Claves foráneas / índices'), n(st.foreign_keys) + ' / ' + n(st.indexes)],
      [tr('techReport.dqNoSource', 'Publicados sin fuente declarada'), n((dq.businesses_published_without_source || 0) + (dq.content_published_without_source || 0)), (dq.businesses_published_without_source || dq.content_published_without_source) ? 'warn' : 'ok'],
      [tr('techReport.dqCoords', 'Destinos con coordenadas fuera de Nicaragua'), n(dq.destinations_invalid_coordinates), dq.destinations_invalid_coordinates ? 'fail' : 'ok'],
      [tr('techReport.dqDuplicates', 'Posibles duplicados (negocios / destinos)'), n(dq.possible_duplicate_businesses) + ' / ' + n(dq.possible_duplicate_destinations)],
      [tr('techReport.opSos', 'SOS abiertos'), n(op.open_sos), op.open_sos ? 'warn' : 'ok'],
      [tr('techReport.opPending', 'Verificaciones / reservas pendientes'), n(op.pending_verifications) + ' / ' + n(op.pending_reservations)],
      [tr('techReport.opAudit', 'Entradas en la auditoría'), n(op.audit_log_entries)]
    ];
    return s;
  }

  function catalogSection(r) {
    var s = { title: tr('techReport.secCatalog', 'Catálogo y uso'), source: 'Supabase · baqueano-ops overview' };
    if (!r.ok) { s.error = r.e; return s; }
    var m = r.v.metrics || {};
    s.at = stamp(r.v.generated_at);
    s.rows = METRICS.filter(function (k) { return m[k[0]]; }).map(function (k) {
      var x = m[k[0]];
      return [tr('techReport.m.' + k[0], k[1]), x.state === 'ERROR' ? tr('techReport.readError', 'No se pudo leer') : n(x.value), x.state === 'ERROR' ? 'fail' : null];
    });
    var ai = r.v.ai;
    if (ai && ai.state === 'REAL') s.rows.push([tr('techReport.aiLatency', 'BAQÜI: latencia media (últimas respuestas)'), (ai.avg_latency_ms != null ? n(ai.avg_latency_ms) + ' ms' : '—') + ' · ' + tr('techReport.aiSample', 'muestra de {n}', { n: ai.sample })]);
    return s;
  }

  function appSection(release, stats) {
    var s = { title: tr('techReport.secApp', 'App Android'), source: 'data/app-release.json · public_app_download_stats()' };
    if (!release.ok) { s.error = release.e; return s; }
    var c = (release.v && release.v.current) || {};
    s.at = stamp();
    s.rows = [
      [tr('appDownload.version', 'Versión'), (c.versionName || '—') + ' (' + (c.versionCode || '—') + ')'],
      [tr('appDownload.requires', 'Requiere'), 'Android ' + (c.minAndroid || '?') + ' (API ' + (c.minSdk || '?') + ')'],
      [tr('appDownload.size', 'Tamaño'), c.sizeBytes ? (c.sizeBytes / 1e6).toFixed(1) + ' MB' : '—'],
      ['SHA-256', c.sha256 || '—']
    ];
    if (stats.ok && stats.v) {
      s.rows.push([tr('techReport.appDownloads', 'Descargas desde /descargar (total / 7 / 30 días)'), n(stats.v.total) + ' / ' + n(stats.v.last7) + ' / ' + n(stats.v.last30)]);
    } else {
      s.rows.push([tr('techReport.appDownloads', 'Descargas desde /descargar (total / 7 / 30 días)'), tr('techReport.readError', 'No se pudo leer') + (stats.e ? ': ' + stats.e : ''), 'warn']);
    }
    return s;
  }

  function build() {
    var release = fetch('data/app-release.json', { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
    var stats = fetch(STATS_RPC, { method: 'POST', headers: { apikey: PUBLIC_KEY, Authorization: 'Bearer ' + PUBLIC_KEY, 'Content-Type': 'application/json' }, body: '{}' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
    return Promise.all([settle(api('health')), settle(api('automation_runs', { limit: 24 })), settle(api('db_health')), settle(api('overview')), settle(release), settle(stats)])
      .then(function (r) {
        var st = window.BaqueanoOpsData && window.BaqueanoOpsData.state;
        return {
          generatedBy: (st && st.role ? st.role : '') || '',
          sections: [healthSection(r[0]), automationSection(r[1]), databaseSection(r[2]), catalogSection(r[3]), appSection(r[4], r[5])]
        };
      });
  }

  function download() {
    if (!window.BaqueanoPdf || !window.BaqueanoPdf.techReport) return Promise.reject(new Error(tr('techReport.noPdf', 'El generador de PDF no está disponible.')));
    return build().then(function (report) {
      var user = null;
      try { user = window.firebase && window.firebase.auth && window.firebase.auth().currentUser; } catch (_) { /* sin Firebase */ }
      if (user && user.email) report.generatedBy = user.email + (report.generatedBy ? ' (' + report.generatedBy + ')' : '');
      return window.BaqueanoPdf.techReport(report);
    });
  }

  window.BaqueanoOpsTechReport = { build: build, download: download };
})(window, document);
