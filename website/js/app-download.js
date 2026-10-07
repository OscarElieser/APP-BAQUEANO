// ============================================================================
// 🧭 BAQUEANO — PÁGINA DE DESCARGA DE LA APP (js/app-download.js)
// ============================================================================
// 🎯 POR QUÉ:
// - /descargar debe mostrar datos reales de la APK publicada (versión, Android mínimo, tamaño,
//   huella, permisos), nunca valores escritos a mano que se desactualizan.
//
// ⚙️ CÓMO:
// - Lee data/app-release.json (generado por scripts/app-release-manifest.mjs desde la APK) con
//   revalidación, para que una versión nueva se vea sin esperar la caché.
// - Pinta todo con textContent y claves appDownload.* (fecha y números con el formato del idioma),
//   y vuelve a pintar al cambiar de idioma.
// - Si el JSON no carga, el botón de descarga sigue funcionando y se avisa sin inventar datos.
//
// 📦 QUÉ: rellena #dlMeta, #dlSpecs, #dlPerms, #dlSha y #dlSigner en descargar.html y cuenta los
//    clics en el botón oficial (record_app_download).
// ============================================================================
(function (window, document) {
  'use strict';

  var release = null;

  function lang() { return window.BaqueanoLanguage; }
  function t(key, params) {
    var L = lang();
    return L && typeof L.t === 'function' ? L.t(key, params || {}) : '';
  }
  function $(id) { return document.getElementById(id); }

  function megabytes(bytes) {
    var value = bytes / 1e6;
    var L = lang();
    return L && L.formatNumber ? L.formatNumber(value, { maximumFractionDigits: 1 }) : value.toFixed(1);
  }

  function date(iso) {
    var L = lang();
    // Hora de Nicaragua: la APK publicada el 30/09 a las 22:24 (UTC-6) no debe verse como 1/10.
    try { return L && L.formatDate ? L.formatDate(iso, { dateStyle: 'long', timeZone: 'America/Managua' }) : new Date(iso).toLocaleDateString(undefined, { timeZone: 'America/Managua' }); } catch (_) { return iso.slice(0, 10); }
  }

  function render() {
    if (!release || !release.current) return;
    var c = release.current;
    var size = megabytes(c.sizeBytes);
    $('dlMeta').textContent = t('appDownload.meta', { version: c.versionName, size: size, android: c.minAndroid || c.minSdk });
    $('dlVersion').textContent = c.versionName + ' (' + c.versionCode + ')';
    $('dlPublished').textContent = c.publishedAt ? date(c.publishedAt) : '—';
    $('dlRequires').textContent = t('appDownload.requiresValue', { android: c.minAndroid || ('API ' + c.minSdk), sdk: c.minSdk });
    $('dlSize').textContent = t('appDownload.sizeValue', { size: size });
    $('dlPackage').textContent = c.package || '—';
    $('dlNotes').textContent = c.notesKey ? t(c.notesKey) : '—';
    $('dlSha').textContent = c.sha256;
    $('dlSigner').textContent = release.signer && release.signer.certSha256
      ? release.signer.certSha256 + (release.signer.subjectCN ? ' · ' + release.signer.subjectCN : '')
      : t('appDownload.signerPending');
    var perms = $('dlPerms');
    perms.replaceChildren.apply(perms, (c.permissions || []).map(function (key) {
      var li = document.createElement('li');
      var name = document.createElement('strong');
      name.textContent = t('appDownload.perm.' + key + '.name');
      var why = document.createElement('span');
      why.textContent = t('appDownload.perm.' + key + '.why');
      li.appendChild(name);
      li.appendChild(why);
      return li;
    }));
    $('dlSpecs').hidden = false;
    $('dlSpecsError').hidden = true;
  }

  function load() {
    fetch('data/app-release.json', { cache: 'no-cache' })
      .then(function (res) { if (!res.ok) throw new Error('http ' + res.status); return res.json(); })
      .then(function (data) { release = data; return lang() && lang().ready ? lang().ready() : null; })
      .then(render)
      .catch(function () { $('dlSpecsError').hidden = false; });
  }

  // Contador de descargas (Supabase record_app_download): solo el clic en el botón oficial.
  // keepalive para que el aviso salga aunque el navegador ya esté descargando; nunca frena la
  // descarga ni muestra errores. El servidor no guarda IP (hash diario con sal aleatoria).
  var RPC = 'https://heiudfpthqwtjrtluqlm.supabase.co/rest/v1/rpc/record_app_download';
  var PUBLIC_KEY = 'sb_publishable_q7ZhqRIRjlerZK7WOu_Qxw_X_AqXV1d';
  function countDownload() {
    var c = release && release.current;
    try {
      fetch(RPC, {
        method: 'POST', keepalive: true,
        headers: { apikey: PUBLIC_KEY, Authorization: 'Bearer ' + PUBLIC_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_version_name: c ? c.versionName : 'desconocida', p_version_code: c ? c.versionCode : null })
      }).catch(function () {});
    } catch (_) { /* sin red: la descarga sigue igual */ }
  }
  function wireButton() {
    var button = $('dlButton');
    if (button && !button.dataset.bqCounted) { button.dataset.bqCounted = '1'; button.addEventListener('click', countDownload); }
  }

  window.addEventListener('baqueano:languageChanged', render);
  function boot() { wireButton(); load(); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot, { once: true }) : boot();
})(window, document);
