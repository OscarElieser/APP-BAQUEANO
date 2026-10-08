// ============================================================================
// 🧭 BAQUEANO — DESTINOS DESTACADOS EN MOVIMIENTO (destinos-featured.js)
// ============================================================================
// 🎯 POR QUÉ: pedido del propietario (2026-10-07): en destinos.html «solo los primeros 10 se van a
//    destacar pero automáticamente se estarán moviendo», y «Ver todos» debe abrir una página aparte
//    con todos los destinos (todos-los-destinos.html).
// ⚙️ CÓMO:
//    - js/destinos-catalog-live.js pinta solo 10 lugares cuando <html data-destinos-mode="featured">.
//    - Cuando el catálogo está listo (y destinos-interactions.js ya indexó las tarjetas), la primera
//      fila se convierte en galería infinita con Pausar (js/bq-marquee.js).
//    - Buscar o tocar una categoría lleva al catálogo completo con ?q= y ?categoria=, que
//      destinos-interactions.js ya entiende.
//    - El enlace «Ver los N destinos» usa el total real de Supabase; sin dato, solo «Ver todos».
// 📦 QUÉ: sin API pública; solo actúa en destinos.html.
// ============================================================================
(function (window, document) {
  'use strict';
  if (document.documentElement.getAttribute('data-destinos-mode') !== 'featured') return;
  var ALL = 'todos-los-destinos.html';

  function t(key, fallback, vars) {
    var out = fallback;
    try { if (window.BaqueanoLanguage && window.BaqueanoLanguage.t) out = window.BaqueanoLanguage.t(key, { fallback: fallback }) || fallback; } catch (_) { out = fallback; }
    return String(out).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
  }
  function go(params) {
    var url = ALL;
    var q = Object.keys(params).filter(function (k) { return params[k]; }).map(function (k) { return k + '=' + encodeURIComponent(params[k]); }).join('&');
    window.location.assign(q ? url + '?' + q : url);
  }

  // Buscar y categorías → catálogo completo (fase de captura: antes que el filtro local).
  document.addEventListener('submit', function (e) {
    var form = e.target.closest && e.target.closest('.destinos-hero-search');
    if (!form) return;
    e.preventDefault(); e.stopPropagation();
    var input = form.querySelector('input[type="search"]');
    go({ q: input ? input.value.trim() : '' });
  }, true);
  document.addEventListener('click', function (e) {
    var chip = e.target.closest && e.target.closest('.destinos-cat-chip');
    if (!chip) return;
    e.preventDefault(); e.stopPropagation();
    var cat = chip.getAttribute('data-category') || 'todos';
    go({ categoria: cat === 'todos' ? '' : cat });
  }, true);

  function paintTotal() {
    var total = window.BaqueanoDestinosTotal;
    document.querySelectorAll('[data-destinos-all-link] span').forEach(function (span) {
      span.removeAttribute('data-i18n');
      span.textContent = total ? t('pages.destinos.viewAllN', 'Ver los {n} destinos', { n: total }) : t('actions.viewAll', 'Ver todos');
    });
    var count = document.querySelector('.destinos-featured-row-head [aria-live]');
    if (count) count.textContent = '';
  }

  function start() {
    Promise.resolve(window.BaqueanoDestinosCatalogReady).catch(function () { return null; }).then(function () {
      // Después de que destinos-interactions.js indexó las tarjetas (misma promesa, registrada antes).
      window.setTimeout(function () {
        var row = document.querySelector('.destinos-featured-row');
        if (row) {
          document.querySelectorAll('.destinos-catalog-row').forEach(function (other) {
            if (other === row) return;
            Array.prototype.slice.call(other.querySelectorAll('.dest-catalog-card')).forEach(function (card) { row.appendChild(card); });
            other.style.display = 'none';
          });
          Array.prototype.slice.call(row.querySelectorAll('.dest-catalog-card')).forEach(function (card, i) { card.hidden = i >= 10; });
          document.querySelectorAll('[data-destinos-more]').forEach(function (n) { n.hidden = true; });

          row.setAttribute('data-bq-marquee', '');
          row.setAttribute('data-bq-gallery-ready', 'true');
          row.setAttribute('data-bq-speed', '40');
          row.style.setProperty('--bq-marquee-item', '280px');
          row.setAttribute('data-bq-label', t('pages.destinos.featuredLabel', 'Destinos destacados en movimiento'));
          if (window.BaqueanoMarquee && typeof window.BaqueanoMarquee.refresh === 'function') {
            window.BaqueanoMarquee.refresh(row);
          }
        }
        paintTotal();
      }, 0);
    });
  }
  window.addEventListener('baqueano:languageChanged', paintTotal);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})(window, document);
