/**
 * 🧭 BAQUEANO — CATÁLOGO VIVO DE DESTINOS (destinos-catalog-live.js)
 *
 * 🎯 POR QUÉ: "Todos los destinos" mostraba siempre las mismas 10 tarjetas
 *   escritas a mano en destinos.html, con calificaciones y precios fijos que no
 *   salen de ninguna fuente. Supabase tiene 237 lugares publicados: el catálogo
 *   debe leerlos de ahí (Supabase = fuente principal, AGENTS.md §5) y nunca
 *   mostrar reseñas o precios inventados.
 * ⚙️ CÓMO:
 *   - BaqueanoPlacesService.getPublishedPlaces() (js/services/places-service.js)
 *     consulta solo is_published = true.
 *   - Cada lugar se pinta con el mismo markup .dest-catalog-card que ya usan los
 *     filtros, la paginación y el detalle de js/destinos-interactions.js, que
 *     espera la promesa window.BaqueanoDestinosCatalogReady antes de indexar.
 *   - Sello real de verificación (verificado / parcial / por verificar). Sin
 *     calificación ni precio: no hay dato → no se muestra (NO DATA = NO INVENTION).
 *   - Si Supabase no responde (o en 8 s), quedan las tarjetas estáticas del HTML.
 *   - Modo destacados (destinos.html): solo 10; window.BaqueanoDestinosTotal guarda el total real.
 * 📦 QUÉ: window.BaqueanoDestinosCatalogReady (Promise<{ source, count }>).
 */
(function (window, document) {
  'use strict';

  var TIMEOUT_MS = 8000;
  var K = 'destinos.verified.kind.';
  // Categoría de Supabase → palabra que entienden los chips de destinos-interactions.js.
  var CHIP_CATEGORY = {
    playa: 'playa', volcan: 'volcan', cerro: 'volcan montana', rio: 'rio agua', laguna: 'laguna agua', lago: 'agua',
    cascada: 'agua naturaleza', isla: 'isleta agua', reserva: 'naturaleza bosque', parque: 'naturaleza bosque',
    area_protegida: 'naturaleza bosque', canon: 'naturaleza aventura', cueva: 'naturaleza aventura', mirador: 'naturaleza montana',
    museo: 'cultura', sitio_historico: 'cultura', centro_cultural: 'cultura', mercado: 'cultura gastronomia',
    turismo_rural: 'naturaleza cultura', turismo_comunitario: 'cultura naturaleza', agroturismo: 'naturaleza gastronomia', atractivo: 'cultura'
  };
  var TAG_COLOR = { playa: 'blue', rio: 'blue', laguna: 'blue', lago: 'blue', cascada: 'blue', isla: 'blue', volcan: 'orange', cerro: 'orange', mirador: 'orange' };

  function t(key, options) {
    var lang = window.BaqueanoLanguage;
    return lang && typeof lang.t === 'function' ? lang.t(key, options) : '';
  }
  function el(tag, className, attrs) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    Object.keys(attrs || {}).forEach(function (name) { if (attrs[name] != null) node.setAttribute(name, attrs[name]); });
    return node;
  }
  function keyed(tag, className, key) {
    var node = el(tag, className, { 'data-i18n': key });
    node.textContent = t(key);
    return node;
  }
  function slug(value) {
    return String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  // Nombres propios de los 17 territorios (ids de Supabase); mismos textos que el
  // filtro "Departamento" de destinos-interactions.js para que el filtro coincida.
  var DEPARTMENTS = {
    boaco: 'Boaco', carazo: 'Carazo', chinandega: 'Chinandega', chontales: 'Chontales', raccn: 'Costa Caribe Norte',
    raccs: 'Costa Caribe Sur', esteli: 'Estelí', granada: 'Granada', jinotega: 'Jinotega', leon: 'León', madriz: 'Madriz',
    managua: 'Managua', masaya: 'Masaya', matagalpa: 'Matagalpa', nueva_segovia: 'Nueva Segovia', rio_san_juan: 'Río San Juan', rivas: 'Rivas'
  };
  function departmentNames() { return DEPARTMENTS; }

  // Foto: la propia del lugar si Supabase la trae; si no, una foto REAL de su
  // territorio (js/territory-media-catalog.js) marcada como "Foto del territorio".
  // Nunca el logo ni una foto de otro departamento.
  function photoFor(place) {
    var attrs = place.attributes || {};
    var own = attrs.cover_image || attrs.image;
    if (own) return { src: own, territory: false };
    var catalog = window.BAQUEANO_MEDIA_CATALOG || {};
    var entry = catalog[String(place.department_id || '').replace(/_/g, '-')];
    var list = entry && entry.carousel && entry.carousel.length ? entry.carousel : null;
    if (!list) return { src: 'assets/images/destinos/isla_de_ometepe.jpg', territory: true };
    var hash = 0;
    String(place.id || place.name).split('').forEach(function (ch) { hash = (hash * 31 + ch.charCodeAt(0)) >>> 0; });
    return { src: list[hash % list.length], fallback: list[0], territory: true };
  }

  function verificationBadge(status) {
    if (status === 'verified') return { key: 'places.verified.seal', cls: 'is-verified', icon: 'fa-circle-check' };
    if (status === 'partial') return { key: 'pages.destinos.live.partial', cls: 'is-partial', icon: 'fa-circle-half-stroke' };
    return { key: 'pages.destinos.live.pending', cls: 'is-pending', icon: 'fa-clock' };
  }

  function card(place, deptNames) {
    var deptName = deptNames[place.department_id] || '';
    var article = el('article', 'dest-catalog-card dest-catalog-card--live', {
      'data-destination-id': place.slug || place.id,
      'data-category': CHIP_CATEGORY[place.category] || 'cultura',
      'data-verification': place.verification_status || 'pending_review',
      'data-live': 'true'
    });
    // Coordenadas reales (si existen) para «Mi viaje» y su mapa; nunca se completan si faltan.
    if (place.latitude != null && place.longitude != null && place.location_precision !== 'missing' &&
        Number(place.latitude) >= 10.5 && Number(place.latitude) <= 15.2 && Number(place.longitude) >= -88 && Number(place.longitude) <= -82.5) {
      article.setAttribute('data-lat', String(place.latitude));
      article.setAttribute('data-lng', String(place.longitude));
    }

    var media = el('div', 'dest-catalog-media');
    var tagKey = K + place.category;
    var tag = keyed('span', 'dest-catalog-tag ' + (TAG_COLOR[place.category] || 'green'), tagKey);
    if (!tag.textContent) tag.textContent = place.type_label || '';
    media.appendChild(tag);
    var photo = photoFor(place);
    var img = el('img', '', { src: photo.src, alt: place.name, loading: 'lazy', decoding: 'async', width: '669', height: '446', translate: 'no' });
    if (photo.fallback) img.addEventListener('error', function retry() { img.removeEventListener('error', retry); img.src = photo.fallback; });
    media.appendChild(img);
    if (photo.territory) media.appendChild(keyed('span', 'dest-live-photo-note', 'pages.destinos.live.territoryPhoto'));
    article.appendChild(media);

    var body = el('div', 'dest-catalog-body');
    var title = el('h4', '', { translate: 'no' });
    title.textContent = place.name;
    body.appendChild(title);
    var location = el('span', 'location', { translate: 'no' });
    location.appendChild(el('i', 'fa-solid fa-location-dot', { style: 'color: #0284C7;', 'aria-hidden': 'true' }));
    location.appendChild(document.createTextNode(' ' + [place.zone_text, deptName].filter(Boolean).join(' · ')));
    body.appendChild(location);

    var badge = verificationBadge(place.verification_status);
    var seal = el('div', 'dest-live-verification ' + badge.cls);
    seal.appendChild(el('i', 'fa-solid ' + badge.icon, { 'aria-hidden': 'true' }));
    seal.appendChild(document.createTextNode(' '));
    seal.appendChild(keyed('span', '', badge.key));
    body.appendChild(seal);

    if (place.short_description) {
      var desc = el('p', 'dest-live-desc');
      desc.textContent = place.short_description;
      body.appendChild(desc);
    }

    var actions = el('div', 'dest-catalog-dual-btns');
    var dept = String(place.department_id || '').replace(/_/g, '-');
    var link = keyed('a', 'dest-btn-green', 'testimonials.viewDestination');
    link.setAttribute('href', dept ? 'departamento.html?id=' + encodeURIComponent(dept) + '&ir=' + encodeURIComponent(place.name) : 'destinos.html');
    actions.appendChild(link);
    actions.appendChild(keyed('button', 'dest-btn-subtle', 'pages.destinos.destCatalogCard.button1')).setAttribute('type', 'button');
    body.appendChild(actions);
    article.appendChild(body);
    // Firma propia de BAQUEANO al pie (misma identidad que las fichas de hospedaje).
    var footSeal = el('footer', 'dest-card-seal');
    footSeal.appendChild(el('img', 'dest-card-seal-logo', { src: 'assets/images/LOGOS/baqueano_icono_oficial.png', alt: '', width: '480', height: '480', loading: 'lazy', decoding: 'async' }));
    var sealText = el('p');
    sealText.appendChild(keyed('strong', '', 'lodgingShowcase.sealTitle'));
    var tagline = el('span', 'dest-card-seal-tagline');
    tagline.appendChild(document.createTextNode(' · '));
    tagline.appendChild(keyed('span', '', 'lodgingShowcase.sealTagline'));
    sealText.appendChild(tagline);
    footSeal.appendChild(sealText);
    article.appendChild(footSeal);
    return article;
  }

  // 2026-10-07: en destinos.html (data-destinos-mode="featured") solo se destacan 10 lugares
  // (primero los verificados, en el orden del servicio); el catálogo completo vive en
  // todos-los-destinos.html. Devuelve también el total real para el enlace «Ver los N destinos».
  var FEATURED_LIMIT = 10;
  function pickFeatured(places) {
    var verified = places.filter(function (p) { return p.verification_status === 'verified'; });
    var rest = places.filter(function (p) { return p.verification_status !== 'verified'; });
    return verified.concat(rest).slice(0, FEATURED_LIMIT);
  }

  function render(places) {
    var rows = Array.prototype.slice.call(document.querySelectorAll('.destinos-catalog-row'));
    if (!rows.length) return 0;
    window.BaqueanoDestinosTotal = places.length;
    var isFeatured = document.documentElement.getAttribute('data-destinos-mode') === 'featured';
    if (isFeatured) places = pickFeatured(places);
    var names = departmentNames();
    var cards = places.map(function (place) { return card(place, names); });
    var targetRow = rows[0];

    // Si la fila ya tenía un marquee montado, desmontar limpiamente para reconstruir
    if (window.BaqueanoMarquee && typeof window.BaqueanoMarquee.destroy === 'function') {
      window.BaqueanoMarquee.destroy(targetRow);
    }

    // Las tarjetas estáticas del HTML se quitan de la página en vivo
    rows.forEach(function (row) {
      row.querySelectorAll('.dest-catalog-card').forEach(function (old) { old.remove(); });
      if (isFeatured && row !== targetRow) row.style.display = 'none';
    });
    cards.forEach(function (node) { targetRow.appendChild(node); });
    document.documentElement.setAttribute('data-destinos-source', 'supabase');

    if (isFeatured) {
      targetRow.setAttribute('data-bq-marquee', '');
      targetRow.setAttribute('data-bq-gallery-ready', 'true');
      targetRow.setAttribute('data-bq-speed', '40');
      targetRow.style.setProperty('--bq-marquee-item', '280px');
      if (window.BaqueanoMarquee && typeof window.BaqueanoMarquee.refresh === 'function') {
        window.BaqueanoMarquee.refresh(targetRow);
      }
    }
    return cards.length;
  }

  window.BaqueanoDestinosCatalogReady = new Promise(function (resolve) {
    var done = false;
    function finish(result) { if (!done) { done = true; resolve(result); } }
    window.setTimeout(function () { finish({ source: 'static', count: 0, reason: 'timeout' }); }, TIMEOUT_MS);

    function start() {
      var service = window.BaqueanoPlacesService;
      if (!service || typeof service.getPublishedPlaces !== 'function') return finish({ source: 'static', count: 0, reason: 'no-service' });
      service.getPublishedPlaces({ limit: 1000 }).then(function (result) {
        if (done) return;
        var places = (result && result.places) || [];
        if (result && result.source === 'supabase' && places.length) {
          finish({ source: 'supabase', count: render(places) });
        } else {
          finish({ source: 'static', count: 0, reason: 'empty-or-fallback' });
        }
      }).catch(function () { finish({ source: 'static', count: 0, reason: 'error' }); });
    }
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start, { once: true }) : start();
  });
})(window, document);
