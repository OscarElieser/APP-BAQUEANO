// ============================================================================
// 🧭 BAQUEANO — VISTAS DE ARTISTAS POR TERRITORIO (territory-artists.js)
// ============================================================================
// 🎯 POR QUÉ:
// - Cada artista debe verse en Historia, agrupado por su territorio, y en la
//   guía de su departamento o región, sin duplicar datos entre páginas.
//
// ⚙️ CÓMO:
// - Lee window.BAQUEANO_TERRITORY_ARTISTS (js/territory-artists-data.js).
// - Todo texto traducible se inserta con `data-i18n`, así global-language.js
//   lo traduce al insertarlo y en cada cambio de idioma; los nombres propios
//   llevan translate="no". Nada de HTML desde datos: solo createElement.
// - Historia: pinta #territoryArtistsGroups al cargar.
// - Departamento: departamento.html llama render(dept) en cada cambio de
//   territorio; el bloque se oculta si el territorio no tiene artistas.
//
// 📦 QUÉ: window.BaqueanoTerritoryArtists = { renderHistoria(host), render(dept) }.
// ============================================================================
(function (window, document) {
  'use strict';

  var BASE = 'pages.historia.artistas.';

  function t(key) {
    var lang = window.BaqueanoLanguage;
    return lang && typeof lang.t === 'function' ? lang.t(key) : '';
  }

  function el(tag, className, attrs) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    Object.keys(attrs || {}).forEach(function (name) { node.setAttribute(name, attrs[name]); });
    return node;
  }

  // Texto con clave: el valor inicial sale del catálogo activo y global-language.js
  // lo mantiene sincronizado con el idioma elegido.
  function keyed(tag, className, key) {
    var node = el(tag, className, { 'data-i18n': key });
    node.textContent = t(key);
    return node;
  }

  function proper(tag, className, text) {
    var node = el(tag, className, { translate: 'no', 'data-no-translate': '' });
    node.textContent = text;
    return node;
  }

  function icon(name) { return el('i', 'fa-solid ' + name, { 'aria-hidden': 'true' }); }

  function data() {
    var source = window.BAQUEANO_TERRITORY_ARTISTS || {};
    return { groups: source.groups || [], artists: source.artists || [] };
  }

  var LOGO = 'assets/images/logo.png';

  // Retrato: foto real con crédito y licencia si existe; si no (o si no carga), el logo de
  // BAQUEANO con el aviso "Foto pendiente". Nunca se muestra una cara que no sea la persona.
  function placeholder(figure) {
    figure.className = 'bq-artist-portrait is-pending';
    var logo = el('img', 'bq-artist-portrait-logo', { src: LOGO, alt: '', width: '600', height: '608', loading: 'lazy', decoding: 'async' });
    figure.replaceChildren(logo, keyed('span', 'bq-artist-portrait-chip', BASE + 'photoPending'));
  }

  function portrait(artist) {
    var figure = el('figure', 'bq-artist-portrait');
    var photo = artist.photo;
    if (!photo || !photo.src) { placeholder(figure); return figure; }
    var img = el('img', 'bq-artist-portrait-img', { src: photo.src, alt: artist.name, loading: 'lazy', decoding: 'async' });
    img.addEventListener('error', function () { placeholder(figure); }, { once: true });
    var caption = el('figcaption', 'bq-artist-portrait-credit');
    if (photo.sourceUrl) {
      caption.appendChild(keyed('span', '', BASE + 'photoCredit'));
      caption.appendChild(document.createTextNode(': '));
      var source = el('a', '', { href: photo.sourceUrl, target: '_blank', rel: 'noopener noreferrer', translate: 'no' });
      source.textContent = photo.credit + ' · ' + photo.license;
      caption.appendChild(source);
    } else {
      // Aportada por el propietario sin enlace de origen: se dice tal cual, sin inventar crédito.
      // Si la foto trae el crédito impreso (p. ej. "Foto por Gabriel García"), se muestra.
      if (photo.credit) {
        caption.appendChild(keyed('span', '', BASE + 'photoCredit'));
        caption.appendChild(document.createTextNode(': '));
        caption.appendChild(proper('span', '', photo.credit));
        caption.appendChild(document.createTextNode(' · '));
      }
      caption.appendChild(keyed('span', '', BASE + 'photoOwner'));
    }
    figure.appendChild(img);
    figure.appendChild(caption);
    return figure;
  }

  function artistCard(artist) {
    var card = el('article', 'bq-artist-card', { id: 'artista-' + artist.id });
    card.appendChild(portrait(artist));
    var head = el('div', 'bq-artist-head');
    head.appendChild(keyed('span', 'bq-artist-discipline', BASE + 'disciplines.' + artist.discipline));
    card.appendChild(head);
    card.appendChild(proper('h4', 'bq-artist-name', artist.name));
    var place = el('span', 'bq-artist-place');
    place.appendChild(icon('fa-location-dot'));
    place.appendChild(document.createTextNode(' '));
    place.appendChild(artist.localityKey ? keyed('span', '', artist.localityKey) : proper('span', '', artist.locality));
    card.appendChild(place);
    card.appendChild(keyed('p', 'bq-artist-milestone', BASE + 'items.' + artist.id + '.milestone'));
    return card;
  }

  function renderHistoria(host) {
    var target = host || document.getElementById('territoryArtistsGroups');
    if (!target) return;
    var all = data();
    var blocks = all.groups.map(function (group) {
      var members = all.artists.filter(function (artist) { return artist.group === group.id; });
      if (!members.length) return null;
      var block = el('section', 'bq-artists-group', { 'aria-labelledby': 'artistasGrupo-' + group.id, id: 'artistas-' + group.id });
      var header = el('header', 'bq-artists-group-head');
      var titleWrap = el('div', 'bq-artists-group-title');
      var title = el('h3', '', { id: 'artistasGrupo-' + group.id });
      title.appendChild(icon(group.icon));
      title.appendChild(document.createTextNode(' '));
      title.appendChild(proper('span', '', group.name));
      titleWrap.appendChild(title);
      titleWrap.appendChild(keyed('p', 'bq-artists-group-tagline', BASE + 'groups.' + group.id));
      header.appendChild(titleWrap);
      var link = el('a', 'bq-artists-group-link', { href: 'departamento.html?id=' + group.id + '#territoryArtistsSection' });
      link.appendChild(keyed('span', '', BASE + 'deptLink'));
      link.appendChild(document.createTextNode(' '));
      link.appendChild(icon('fa-arrow-right'));
      header.appendChild(link);
      block.appendChild(header);
      var grid = el('div', 'bq-artists-grid');
      members.forEach(function (artist) { grid.appendChild(artistCard(artist)); });
      block.appendChild(grid);
      return block;
    }).filter(Boolean);
    target.replaceChildren.apply(target, blocks);
  }

  function render(dept) {
    var section = document.getElementById('territoryArtistsSection');
    var grid = document.getElementById('territoryArtistsGrid');
    if (!section || !grid) return;
    var id = dept && dept.id;
    var members = data().artists.filter(function (artist) { return id && artist.depts.indexOf(id) !== -1; });
    grid.replaceChildren.apply(grid, members.map(artistCard));
    section.hidden = members.length === 0;
    // El enlace desde Historia apunta a este bloque, que nace oculto: se ubica tras pintarlo.
    if (!section.hidden && !scrolledToHash && window.location.hash === '#territoryArtistsSection') {
      scrolledToHash = true;
      window.setTimeout(function () { section.scrollIntoView({ block: 'start' }); }, 400);
    }
  }
  var scrolledToHash = false;

  window.BaqueanoTerritoryArtists = { renderHistoria: renderHistoria, render: render };

  function boot() { if (document.getElementById('territoryArtistsGroups')) renderHistoria(); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot, { once: true }) : boot();
})(window, document);
