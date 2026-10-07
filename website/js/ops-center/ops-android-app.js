// ============================================================================
// 🧭 BAQUEANO — OPS CENTER: APLICACIÓN ANDROID (ops-android-app.js)
// ============================================================================
// 🎯 POR QUÉ:
// - El plan (F7) pide ver en Ops Center qué versión de la app está publicada, si el archivo es el
//   oficial y cuántas veces se descarga, sin cifras inventadas.
//
// ⚙️ CÓMO:
// - Versión, requisitos, tamaño, huella y firma: data/app-release.json, que genera
//   scripts/app-release-manifest.mjs leyendo la APK real (la misma que sirve /descargar).
// - Descargas: Supabase public_app_download_stats() (solo agregados). Cuenta los clics en el botón
//   oficial de /descargar; una descarga directa del archivo no se cuenta, y la vista lo dice.
// - Todo se pinta con textContent; textos con claves opsApp.* en 6 idiomas.
//
// 📦 QUÉ: window.BaqueanoOpsAndroid = { render(panel), refresh() }.
// ============================================================================
(function (window, document) {
  'use strict';
  if (window.BaqueanoOpsAndroid) return;

  var STATS_RPC = 'https://heiudfpthqwtjrtluqlm.supabase.co/rest/v1/rpc/public_app_download_stats';
  var PUBLIC_KEY = 'sb_publishable_q7ZhqRIRjlerZK7WOu_Qxw_X_AqXV1d';
  var state = { panel: null, release: null, stats: null, releaseError: false, statsError: false, at: 0 };

  function tr(key, fallback, vars) {
    var out = fallback;
    try { if (window.BaqueanoLanguage && window.BaqueanoLanguage.t) out = window.BaqueanoLanguage.t(key, Object.assign({ fallback: fallback }, vars || {})); } catch (_) { /* sin motor i18n */ }
    return out;
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
  function icon(name) { return el('i', { className: 'fa-solid ' + name, 'aria-hidden': 'true' }); }
  function num(v) {
    try { return window.BaqueanoLanguage && window.BaqueanoLanguage.formatNumber ? window.BaqueanoLanguage.formatNumber(v) : String(v); } catch (_) { return String(v); }
  }
  function date(iso, withTime) {
    if (!iso) return '—';
    try {
      var o = withTime ? { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Managua' } : { dateStyle: 'long', timeZone: 'America/Managua' };
      // Sin motor de idioma (Ops Center), se usa es-NI igual con la zona horaria de Nicaragua.
      return window.BaqueanoLanguage && window.BaqueanoLanguage.formatDate ? window.BaqueanoLanguage.formatDate(iso, o) : new Intl.DateTimeFormat('es-NI', o).format(new Date(iso));
    } catch (_) { return String(iso).slice(0, 16); }
  }
  function kpi(iconName, value, label, accent) {
    return el('div', { className: 'ops-kpi-card', style: '--kpi-accent:' + accent }, [
      el('div', { className: 'ops-kpi-top' }, [el('div', { className: 'ops-kpi-icon', style: 'background:rgba(255,255,255,.06);color:#F4E6C1' }, [icon(iconName)])]),
      el('div', { className: 'ops-kpi-value', text: value }),
      el('div', { className: 'ops-kpi-label', text: label })
    ]);
  }
  var BOX = 'background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:16px;margin-top:16px;color:#E2E8F0';
  var H = 'margin:0 0 10px;font:800 1rem/1.3 Montserrat,sans-serif;color:#F4E6C1';
  var MONO = 'display:block;padding:8px 10px;border-radius:8px;background:rgba(0,0,0,.25);font:600 .8rem/1.5 ui-monospace,Menlo,Consolas,monospace;overflow-wrap:anywhere;word-break:break-all;color:#F4E6C1';

  function row(label, value, mono) {
    return el('div', { style: 'display:grid;grid-template-columns:minmax(120px,34%) minmax(0,1fr);gap:10px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.06)' }, [
      el('dt', { text: label, style: 'font-weight:700;color:#CBD5E1' }),
      el('dd', { text: value, style: mono ? MONO + ';margin:0' : 'margin:0;overflow-wrap:anywhere' })
    ]);
  }

  function releaseBox() {
    var r = state.release;
    if (!r || !r.current) {
      return el('section', { style: BOX }, [el('p', { text: state.releaseError ? tr('opsApp.releaseError', 'No se pudo leer data/app-release.json.') : tr('opsApp.loading', 'Cargando…') })]);
    }
    var c = r.current;
    var mb = (c.sizeBytes / 1e6).toFixed(1) + ' MB';
    return el('section', { style: BOX, 'aria-labelledby': 'opsAppRelease' }, [
      el('h2', { id: 'opsAppRelease', style: H, text: tr('opsApp.releaseTitle', 'Versión publicada') }),
      el('dl', { style: 'margin:0' }, [
        row(tr('appDownload.version', 'Versión'), c.versionName + ' (' + c.versionCode + ')'),
        row(tr('appDownload.published', 'Publicada'), date(c.publishedAt)),
        row(tr('appDownload.requires', 'Requiere'), 'Android ' + (c.minAndroid || '?') + ' (API ' + c.minSdk + ') · target API ' + c.targetSdk),
        row(tr('appDownload.size', 'Tamaño'), mb),
        row(tr('appDownload.package', 'Paquete'), c.package || '—'),
        row('SHA-256', c.sha256, true),
        row(tr('opsApp.signer', 'Firma'), r.signer && r.signer.certSha256 ? r.signer.certSha256 + ' · ' + (r.signer.subjectCN || '') : tr('appDownload.signerPending', 'Firma pendiente de verificación.'), true),
        row(tr('opsApp.history', 'Versiones anteriores'), (r.history || []).length ? r.history.map(function (h) { return h.versionName + ' (' + h.versionCode + ')'; }).join(', ') : tr('opsApp.noHistory', 'Ninguna todavía'))
      ]),
      el('p', { style: 'margin:12px 0 0;display:flex;flex-wrap:wrap;gap:10px' }, [
        el('a', { href: 'descargar.html', target: '_blank', rel: 'noopener', className: 'ops-btn', text: tr('opsApp.openPage', 'Abrir /descargar') }),
        el('a', { href: r.apkUrl || '/downloads/baqueano-android.apk', className: 'ops-btn', text: tr('opsApp.apkLink', 'Enlace directo de la APK') })
      ])
    ]);
  }

  function statsBox() {
    var s = state.stats;
    var children = [el('h2', { id: 'opsAppDownloads', style: H, text: tr('opsApp.downloadsTitle', 'Descargas desde /descargar') })];
    if (!s) {
      children.push(el('p', { text: state.statsError ? tr('opsApp.statsError', 'No se pudieron leer las descargas (Supabase).') : tr('opsApp.loading', 'Cargando…') }));
      return el('section', { style: BOX, 'aria-labelledby': 'opsAppDownloads' }, children);
    }
    children.push(el('div', { className: 'ops-kpi-grid' }, [
      kpi('fa-download', num(s.total || 0), tr('opsApp.total', 'Total'), '#165D6F'),
      kpi('fa-calendar-week', num(s.last7 || 0), tr('opsApp.last7', 'Últimos 7 días'), '#C2410C'),
      kpi('fa-calendar', num(s.last30 || 0), tr('opsApp.last30', 'Últimos 30 días'), '#4A7A5A'),
      kpi('fa-clock', s.lastAt ? date(s.lastAt, true) : '—', tr('opsApp.lastAt', 'Última descarga'), '#F4E6C1')
    ]));
    var days = Array.isArray(s.daily) ? s.daily : [];
    var max = days.reduce(function (m, d) { return Math.max(m, d.count || 0); }, 0) || 1;
    var chart = el('div', { role: 'img', 'aria-label': tr('opsApp.chartLabel', 'Descargas por día, últimos 14 días'), style: 'display:grid;grid-template-columns:repeat(' + Math.max(days.length, 1) + ',1fr);gap:4px;align-items:end;height:110px;margin-top:14px' },
      days.map(function (d) {
        var h = Math.round((d.count || 0) / max * 90) + 4;
        return el('div', { title: d.date + ': ' + d.count, style: 'display:grid;gap:3px;justify-items:center' }, [
          el('span', { text: String(d.count || 0), style: 'font-size:.7rem;color:#CBD5E1' }),
          el('span', { style: 'width:100%;height:' + h + 'px;border-radius:4px 4px 0 0;background:' + (d.count ? '#C2410C' : 'rgba(255,255,255,.12)') })
        ]);
      }));
    children.push(chart);
    if (days.length) children.push(el('p', { style: 'display:flex;justify-content:space-between;margin:4px 0 0;font-size:.72rem;color:#94A3B8' }, [el('span', { text: days[0].date }), el('span', { text: days[days.length - 1].date })]));
    var versions = Array.isArray(s.byVersion) ? s.byVersion : [];
    children.push(el('p', { style: 'margin:12px 0 0;color:#CBD5E1', text: tr('opsApp.byVersion', 'Por versión') + ': ' + (versions.length ? versions.map(function (v) { return v.version + ' → ' + num(v.count); }).join(' · ') : '—') }));
    children.push(el('p', { style: 'margin:10px 0 0;font-size:.82rem;color:#94A3B8', text: tr('opsApp.countNote', 'Cuenta los clics en «Descargar para Android» de /descargar (máximo 3 por dispositivo y día; sin guardar IP). Una descarga directa del archivo no se cuenta.') }));
    return el('section', { style: BOX, 'aria-labelledby': 'opsAppDownloads' }, children);
  }

  function renderInto(panel) {
    if (!panel) return;
    var header = el('div', { className: 'ops-view-header' }, [
      el('div', { className: 'ops-view-title-group' }, [
        el('h1', {}, [icon('fa-mobile-screen'), document.createTextNode(' ' + tr('opsApp.title', 'Aplicación Android'))]),
        el('p', { className: 'ops-view-subtitle', text: state.at ? tr('opsApp.updated', 'Actualizado') + ': ' + date(new Date(state.at).toISOString(), true) : '' })
      ]),
      el('div', { className: 'ops-view-actions' }, [(function () {
        var b = el('button', { type: 'button', className: 'ops-btn' }, [icon('fa-rotate'), document.createTextNode(' ' + tr('opsApp.refresh', 'Actualizar'))]);
        b.addEventListener('click', refresh);
        return b;
      })()])
    ]);
    panel.replaceChildren(header, statsBox(), releaseBox());
  }

  function refresh() {
    var releaseReq = fetch('data/app-release.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
      .then(function (d) { state.release = d; state.releaseError = false; }, function () { state.releaseError = true; });
    var statsReq = fetch(STATS_RPC, { method: 'POST', headers: { apikey: PUBLIC_KEY, Authorization: 'Bearer ' + PUBLIC_KEY, 'Content-Type': 'application/json' }, body: '{}' })
      .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
      .then(function (d) { state.stats = d; state.statsError = false; }, function () { state.statsError = true; });
    return Promise.all([releaseReq, statsReq]).then(function () { state.at = Date.now(); renderInto(state.panel); });
  }

  function render(panel) {
    state.panel = panel;
    renderInto(panel);
    refresh();
  }
  window.addEventListener('baqueano:languageChanged', function () { renderInto(state.panel); });

  window.BaqueanoOpsAndroid = { render: render, refresh: refresh };
})(window, document);
