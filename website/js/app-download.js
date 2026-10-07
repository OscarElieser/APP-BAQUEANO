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
// 📦 QUÉ: rellena #dlMeta, #dlSpecs, #dlPerms, #dlSha y #dlSigner en descargar.html.
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

  window.addEventListener('baqueano:languageChanged', render);
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', load, { once: true }) : load();
})(window, document);
