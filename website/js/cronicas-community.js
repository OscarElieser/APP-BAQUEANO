// ============================================================================
// 🧭 BAQUEANO — CRÓNICAS DE LA COMUNIDAD (cronicas-community.js)
// ============================================================================
// 🎯 POR QUÉ (2026-10-15): el dueño pidió que los usuarios puedan crear y
//   publicar crónicas «a como las presentamos en el sitio».
// ⚙️ CÓMO: los relatos se escriben en testimonios.html (?formato=cronica) con
//   la etiqueta «cronica», pasan por moderación en el Ops Center y se listan
//   aquí con la Edge Function baqueano-community (búsqueda por etiqueta +
//   filtro exacto en el cliente). Todo el texto se pinta con textContent.
// 📦 QUÉ: rellena #bqMagCommunityGrid; si no hay crónicas muestra el aviso
//   vacío (nunca contenido de ejemplo).
// ============================================================================
(function (window, document) {
  'use strict';
  var TAG = 'cronica';
  var grid = document.getElementById('bqMagCommunityGrid');
  var empty = document.getElementById('bqMagCommunityEmpty');
  if (!grid) return;

  function tr(key, fallback, params) {
    var L = window.BaqueanoLanguage;
    try { return (L && L.t && L.t(key, Object.assign({ fallback: fallback }, params || {}))) || fallback; } catch (_) { return fallback; }
  }
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }
  function excerpt(text, max) {
    var clean = String(text || '').replace(/\s+/g, ' ').trim();
    return clean.length > max ? clean.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : clean;
  }
  function readMinutes(text) {
    return Math.max(1, Math.round(String(text || '').split(/\s+/).length / 200));
  }

  function card(item) {
    var article = el('article', 'bq-mag-card-sm bq-mag-community-card');
    var photo = (item.media || []).find(function (m) { return m.kind === 'image' && (m.thumb || m.url); });
    if (photo) {
      var media = el('div', 'bq-mag-card-sm-media');
      var img = el('img');
      img.src = photo.thumb || photo.url; img.alt = item.title || ''; img.loading = 'lazy'; img.decoding = 'async';
      media.appendChild(img);
      article.appendChild(media);
    }
    var body = el('div', 'bq-mag-card-sm-content');
    var where = item.destination_name || item.place_name || item.municipality || '';
    body.appendChild(el('span', 'bq-mag-card-sm-kicker', where ? tr('pages.cronicas.community.kickerPlace', 'Crónica · {place}', { place: where }) : tr('pages.cronicas.community.kickerPlain', 'Crónica de la comunidad')));
    body.appendChild(el('h3', 'bq-mag-card-sm-title', item.title || ''));
    body.appendChild(el('p', 'bq-mag-card-sm-excerpt', excerpt(item.body, 220)));
    body.appendChild(el('p', 'bq-mag-community-byline', tr('pages.cronicas.community.byline', 'Por {name} · {min} min de lectura', { name: item.author_name || tr('pages.cronicas.community.anon', 'Viajero BAQUEANO'), min: readMinutes(item.body) })));
    var link = el('a', 'bq-mag-card-sm-link');
    link.href = 'testimonios.html?experiencia=' + encodeURIComponent(item.id);
    link.appendChild(el('span', null, tr('pages.cronicas.bqMagCardSm.a1', 'Leer relato completo')));
    var arrow = el('i', 'fa-solid fa-arrow-right'); arrow.setAttribute('aria-hidden', 'true');
    link.appendChild(document.createTextNode(' '));
    link.appendChild(arrow);
    body.appendChild(link);
    article.appendChild(body);
    return article;
  }

  var items = [];
  function render() {
    grid.textContent = '';
    items.forEach(function (item) { grid.appendChild(card(item)); });
    if (empty) empty.hidden = items.length > 0;
  }

  function load() {
    var API = window.BaqueanoCommunity;
    if (!API || !API.call) { render(); return; }
    API.call('list', { q: TAG, limit: 24 }).then(function (res) {
      items = ((res && res.items) || []).filter(function (it) {
        return Array.isArray(it.tags) && it.tags.some(function (t) { return String(t).toLowerCase() === TAG; });
      }).slice(0, 6);
      render();
    }).catch(function () { items = []; render(); });
  }

  window.addEventListener('baqueano:languageChanged', render);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load, { once: true });
  else load();
})(window, document);
