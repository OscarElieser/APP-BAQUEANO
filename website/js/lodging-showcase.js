// ============================================================================
// 🧭 BAQUEANO — FICHAS DE HOSPEDAJES DESTACADOS (lodging-showcase.js)
// ============================================================================
// 🎯 POR QUÉ:
// - Ficha publicitaria de hospedajes locales en destinos.html: el negocio es el protagonista,
//   BAQUEANO lo presenta y conecta al viajero por WhatsApp, sin intermediar reservas.
//
// ⚙️ CÓMO:
// - Lee window.BAQUEANO_LODGING_SHOWCASE (js/lodging-showcase-data.js).
// - Todo texto traducible va con data-i18n (global-language.js lo traduce al cambiar de idioma);
//   nombres propios con translate="no". Solo createElement + textContent, sin HTML desde datos.
// - Tarifas: solo si hoy (hora de Nicaragua) está dentro de la vigencia; si no, "consultá la tarifa".
// - Compartir: navigator.share si existe; si no, copia el enlace a la ficha.
//
// 📦 QUÉ: pinta #lodgingShowcaseGrid. window.BaqueanoLodgingShowcase = { render }.
// ============================================================================
(function (window, document) {
  'use strict';

  // Icono oficial a color: el sello va sobre fondo blanco (el logo blanco no se vería).
  var LOGO = 'assets/images/LOGOS/baqueano_icono_oficial.png';

  function t(key, params) {
    var L = window.BaqueanoLanguage;
    return L && typeof L.t === 'function' ? L.t(key, params || {}) : '';
  }
  function el(tag, className, attrs) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    Object.keys(attrs || {}).forEach(function (name) { node.setAttribute(name, attrs[name]); });
    return node;
  }
  function keyed(tag, className, key, attrs) {
    var node = el(tag, className, Object.assign({ 'data-i18n': key }, attrs || {}));
    node.textContent = t(key);
    return node;
  }
  function proper(tag, className, text) {
    var node = el(tag, className, { translate: 'no' });
    node.textContent = text;
    return node;
  }
  function icon(name) { return el('i', name, { 'aria-hidden': 'true' }); }

  // Fecha de hoy en Nicaragua (AAAA-MM-DD), para comparar con la vigencia de las tarifas.
  function todayManagua() {
    try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Managua' }).format(new Date()); }
    catch (_) { return new Date().toISOString().slice(0, 10); }
  }

  function brand(item) {
    var box = el('div', 'bq-lodging-brand');
    if (item.logo) {
      var img = el('img', 'bq-lodging-logo', { src: item.logo, alt: item.name, loading: 'lazy', decoding: 'async' });
      box.appendChild(img);
    } else {
      // Logo original pendiente: el nombre del hotel en texto, nunca el logo de BAQUEANO.
      var word = el('p', 'bq-lodging-wordmark', { translate: 'no' });
      word.appendChild(proper('span', 'bq-lodging-wordmark-top', 'HOTEL'));
      word.appendChild(proper('span', 'bq-lodging-wordmark-main', item.name.replace(/^Hotel\s+/i, '').toUpperCase()));
      box.appendChild(word);
    }
    var place = el('p', 'bq-lodging-place');
    place.appendChild(icon('fa-solid fa-location-dot'));
    place.appendChild(document.createTextNode(' '));
    place.appendChild(proper('span', '', item.place));
    box.appendChild(place);
    return box;
  }

  function prices(item) {
    var box = el('section', 'bq-lodging-prices', { 'aria-labelledby': 'lodgingPrices-' + item.id });
    var current = todayManagua() >= item.pricesValidFrom && todayManagua() <= item.pricesValidUntil;
    var title = keyed('h4', '', 'lodging.' + item.i18nKey + '.pricesTitle', { id: 'lodgingPrices-' + item.id });
    box.appendChild(title);
    if (!current) {
      box.appendChild(keyed('p', 'bq-lodging-price-note', 'lodgingShowcase.pricesExpired'));
      return box;
    }
    var list = el('ul', 'bq-lodging-price-list');
    item.prices.forEach(function (price) {
      var li = el('li');
      li.appendChild(keyed('span', 'bq-lodging-price-label', 'lodging.' + item.i18nKey + '.price.' + price.key));
      li.appendChild(proper('strong', 'bq-lodging-price-amount', (price.currency === 'USD' ? 'US$' : 'C$') + price.amount));
      list.appendChild(li);
    });
    box.appendChild(list);
    box.appendChild(keyed('p', 'bq-lodging-price-note', 'lodgingShowcase.pricesNote'));
    return box;
  }

  function share(item, button) {
    var url = window.location.origin + window.location.pathname + '#' + item.id;
    var data = { title: item.name, text: t('lodging.' + item.i18nKey + '.tagline'), url: url };
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    var done = function () {
      var label = button.querySelector('[data-i18n]');
      if (!label) return;
      label.setAttribute('data-i18n', 'lodgingShowcase.copied');
      label.textContent = t('lodgingShowcase.copied');
      setTimeout(function () { label.setAttribute('data-i18n', 'lodgingShowcase.share'); label.textContent = t('lodgingShowcase.share'); }, 2500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () {});
  }

  function actions(item) {
    var row = el('div', 'bq-lodging-actions');
    // El mensaje se arma al tocar (y al enfocar), con el idioma ya cargado: si se armara al pintar,
    // podría salir vacío porque el catálogo de idioma todavía no llegó.
    var waHref = function () {
      var message = t('lodgingShowcase.whatsappMessage', { name: item.name }) || item.name;
      return 'https://wa.me/' + item.whatsapp + '?text=' + encodeURIComponent(message);
    };
    var wa = el('a', 'bq-lodging-btn is-whatsapp', { href: waHref(), target: '_blank', rel: 'noopener noreferrer' });
    ['pointerdown', 'focus', 'click'].forEach(function (type) { wa.addEventListener(type, function () { wa.href = waHref(); }); });
    wa.appendChild(icon('fa-brands fa-whatsapp'));
    wa.appendChild(document.createTextNode(' '));
    wa.appendChild(keyed('span', '', 'lodgingShowcase.whatsapp'));
    // Enlace exacto del negocio si existe; si no, búsqueda por nombre (nunca un pin inventado).
    var mapHref = item.mapsUrl || ('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(item.mapsQuery));
    var map = el('a', 'bq-lodging-btn is-map', { href: mapHref, target: '_blank', rel: 'noopener noreferrer' });
    map.appendChild(icon('fa-solid fa-map-location-dot'));
    map.appendChild(document.createTextNode(' '));
    map.appendChild(keyed('span', '', 'lodgingShowcase.location'));
    var shareBtn = el('button', 'bq-lodging-btn is-share', { type: 'button' });
    shareBtn.appendChild(icon('fa-solid fa-share-nodes'));
    shareBtn.appendChild(document.createTextNode(' '));
    shareBtn.appendChild(keyed('span', '', 'lodgingShowcase.share'));
    shareBtn.addEventListener('click', function () { share(item, shareBtn); });
    row.appendChild(wa); row.appendChild(map); row.appendChild(shareBtn);
    // Pin en el mapa de BAQUEANO solo con ubicación exacta (mapa.html centra ?lat=&lng= dentro de Nicaragua).
    if (item.locationPrecision === 'exact' && isFinite(item.latitude) && isFinite(item.longitude)) {
      var own = el('a', 'bq-lodging-btn is-baqueano-map', { href: 'mapa.html?lat=' + item.latitude.toFixed(6) + '&lng=' + item.longitude.toFixed(6) });
      own.appendChild(icon('fa-solid fa-map-pin'));
      own.appendChild(document.createTextNode(' '));
      own.appendChild(keyed('span', '', 'lodgingShowcase.baqueanoMap'));
      row.appendChild(own);
    }
    var nodes = [row];
    if (item.address) {
      var address = el('p', 'bq-lodging-address');
      address.appendChild(icon('fa-solid fa-location-dot'));
      address.appendChild(document.createTextNode(' '));
      address.appendChild(proper('span', '', item.address));
      nodes.push(address);
    }
    var phone = el('p', 'bq-lodging-phone');
    phone.appendChild(icon('fa-brands fa-whatsapp'));
    phone.appendChild(document.createTextNode(' '));
    phone.appendChild(proper('span', '', item.whatsappLabel));
    nodes.push(phone);
    if (item.email) {
      var mail = el('p', 'bq-lodging-email');
      mail.appendChild(icon('fa-regular fa-envelope'));
      mail.appendChild(document.createTextNode(' '));
      var link = el('a', '', { href: 'mailto:' + item.email, translate: 'no' });
      link.textContent = item.email;
      mail.appendChild(link);
      nodes.push(mail);
    }
    return nodes;
  }

  function card(item) {
    var base = 'lodging.' + item.i18nKey + '.';
    var article = el('article', 'bq-lodging-card', { id: item.id, 'aria-labelledby': 'lodgingName-' + item.id });
    var name = proper('h3', 'bq-sr-only', item.name);
    name.id = 'lodgingName-' + item.id;
    article.appendChild(name);
    var head = el('header', 'bq-lodging-head');
    head.appendChild(brand(item));
    head.appendChild(keyed('p', 'bq-lodging-tagline', base + 'tagline'));
    article.appendChild(head);
    var body = el('div', 'bq-lodging-body');
    var info = el('div', 'bq-lodging-info');
    info.appendChild(keyed('p', 'bq-lodging-description', base + 'description'));
    info.appendChild(keyed('h4', '', 'lodgingShowcase.amenitiesTitle'));
    var list = el('ul', 'bq-lodging-amenities');
    item.amenities.forEach(function (key) {
      var li = el('li');
      li.appendChild(icon('fa-solid fa-circle-check'));
      li.appendChild(document.createTextNode(' '));
      li.appendChild(keyed('span', '', base + 'amenity.' + key));
      list.appendChild(li);
    });
    info.appendChild(list);
    body.appendChild(info);
    var side = el('div', 'bq-lodging-side');
    side.appendChild(prices(item));
    var promise = el('p', 'bq-lodging-promise');
    promise.appendChild(keyed('strong', '', base + 'promise'));
    side.appendChild(promise);
    actions(item).forEach(function (node) { side.appendChild(node); });
    body.appendChild(side);
    article.appendChild(body);
    var foot = el('footer', 'bq-lodging-seal');
    foot.appendChild(el('img', 'bq-lodging-seal-logo', { src: LOGO, alt: '', width: '480', height: '480', loading: 'lazy', decoding: 'async' }));
    var sealText = el('p');
    sealText.appendChild(keyed('strong', '', 'lodgingShowcase.sealTitle'));
    sealText.appendChild(document.createTextNode(' · '));
    sealText.appendChild(proper('span', '', 'baqueanonicaragua.com'));
    sealText.appendChild(document.createTextNode(' · '));
    sealText.appendChild(keyed('span', '', 'lodgingShowcase.sealTagline'));
    foot.appendChild(sealText);
    article.appendChild(foot);
    return article;
  }

  function render() {
    var grid = document.getElementById('lodgingShowcaseGrid');
    if (!grid) return;
    var items = window.BAQUEANO_LODGING_SHOWCASE || [];
    grid.replaceChildren.apply(grid, items.map(card));
    var section = document.getElementById('hospedajesBaqueano');
    if (section) section.hidden = items.length === 0;
    // Enlace compartido (#hotel-…): la ficha nace con el script, así que se ubica después de pintarla.
    var target = window.location.hash && document.getElementById(window.location.hash.slice(1));
    if (target && target.classList.contains('bq-lodging-card')) setTimeout(function () { target.scrollIntoView({ block: 'start' }); }, 300);
  }

  window.BaqueanoLodgingShowcase = { render: render };
  // El mensaje prellenado de WhatsApp sale en el idioma activo: se vuelve a pintar al cambiarlo.
  window.addEventListener('baqueano:languageChanged', render);

  function boot() {
    var L = window.BaqueanoLanguage;
    if (L && L.ready) L.ready().then(render, render); else render();
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot, { once: true }) : boot();
})(window, document);
