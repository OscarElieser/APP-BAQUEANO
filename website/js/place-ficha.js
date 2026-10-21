/**
 * ============================================================================
 * 🧭 BAQUEANO — FICHA COMPLETA DE UN LUGAR PUBLICADO (place-ficha.js)
 * ============================================================================
 * 🎯 POR QUÉ:
 * - Pedido del propietario (2026-10-20): «Ver destino» desde /mapa debe abrir la ficha propia
 *   del lugar, no la página del departamento. Una sola ficha por lugar, con la misma
 *   información, estrellas y opiniones que /mapa y /destinos.
 * - Solo información real de Supabase (public.places). Si un dato no está, no se inventa:
 *   la sección no aparece. «Verificado» solo si verification_status = 'verified'.
 *
 * ⚙️ CÓMO:
 * - destino.html?lugar=<slug> → BaqueanoPlacesService.getPlaceBySlug(slug).
 * - «Cómo llegar» abre el navegador interno (js/bq-navigator.js): ruta solo con pin exacto
 *   (map_ready); si no, modo zona con aviso. «Mi viaje» guarda coordenadas solo si son exactas.
 * - Estrellas: [data-bq-rating="place:<slug>"] y sección [data-bq-reviews] (js/bq-reviews.js).
 * - El contenido editorial está en español en la base: se marca lang="es" y, si la interfaz
 *   está en otro idioma, se avisa «Contenido original en español» (no se traduce en silencio).
 * - Todo con createElement/textContent: nada de la base se interpreta como HTML.
 *
 * 📦 QUÉ: window.BaqueanoPlaceFicha = { render(container, slug) } → Promise<boolean>.
 * ============================================================================
 */
(function (window, document) {
  'use strict';
  if (window.BaqueanoPlaceFicha) return;

  var SLUG_RE = /^[a-z0-9][a-z0-9-]{1,119}$/;
  var DEPARTMENTS = {
    boaco: 'Boaco', carazo: 'Carazo', chinandega: 'Chinandega', chontales: 'Chontales', raccn: 'Costa Caribe Norte',
    raccs: 'Costa Caribe Sur', esteli: 'Estelí', granada: 'Granada', jinotega: 'Jinotega', leon: 'León', madriz: 'Madriz',
    managua: 'Managua', masaya: 'Masaya', matagalpa: 'Matagalpa', nueva_segovia: 'Nueva Segovia', rio_san_juan: 'Río San Juan', rivas: 'Rivas'
  };

  function t(key, fallback, vars) {
    var out = fallback;
    try { out = (window.BaqueanoLanguage && window.BaqueanoLanguage.t('placeFicha.' + key, { fallback: fallback })) || fallback; } catch (_) { out = fallback; }
    return String(out).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
  }
  function lang() {
    try { return String((window.BaqueanoLanguage && window.BaqueanoLanguage.get && window.BaqueanoLanguage.get()) || 'es').slice(0, 2); } catch (_) { return 'es'; }
  }
  function el(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  }
  function icon(name) { var i = el('i', 'fa-solid ' + name); i.setAttribute('aria-hidden', 'true'); return i; }
  function i18nNode(tag, className, key, fallback) {
    var n = el(tag, className, t(key, fallback));
    n.setAttribute('data-i18n', 'placeFicha.' + key);
    return n;
  }
  function fmtDate(v) {
    try { return new Intl.DateTimeFormat(lang(), { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(v)); } catch (_) { return ''; }
  }
  function safeUrl(u) { return /^https:\/\/[^\s"'<>]+$/.test(String(u || '')) ? String(u) : ''; }
  function spanishText(tag, className, text) {
    var n = el(tag, className, text);
    n.setAttribute('lang', 'es');
    return n;
  }

  function section(title, key, iconName) {
    var s = el('section', 'bq-pf-section');
    var h = el('h2');
    h.append(icon(iconName), ' ');
    var label = el('span', null, t(key, title));
    label.setAttribute('data-i18n', 'placeFicha.' + key);
    h.append(label);
    s.append(h);
    return s;
  }

  function notFound(container, slug) {
    container.replaceChildren();
    var box = el('div', 'bq-pf-missing');
    box.append(icon('fa-triangle-exclamation'), i18nNode('h1', null, 'notFoundTitle', 'Lugar no encontrado'));
    var p = el('p', null, t('notFoundBody', 'No encontramos un lugar publicado con el identificador «{id}».', { id: String(slug).slice(0, 120) }));
    var back = el('a', 'bq-pf-btn is-ghost');
    back.href = 'mapa.html';
    back.append(icon('fa-map-location-dot'), ' ', t('backToMap', 'Volver al mapa'));
    box.append(p, back);
    container.append(box);
  }

  function build(container, place) {
    var slug = place.slug || String(place.id).replace(/^pl-/, '');
    var attrs = place.attributes || {};
    var exact = !!place.map_ready && place.location_precision === 'exact';
    var hasCoords = isFinite(place.latitude) && isFinite(place.longitude) && !(place.latitude === 0 && place.longitude === 0);
    var deptId = place.department_id || '';
    var dept = DEPARTMENTS[deptId] || '';
    var ownPhoto = safeUrl(attrs.cover_image) || safeUrl(attrs.image) || (/^assets\//.test(attrs.cover_image || attrs.image || '') ? (attrs.cover_image || attrs.image) : '');
    var photo = ownPhoto || (deptId ? 'assets/images/departamentos/' + deptId.replace(/_/g, '-') + '.jpg' : '');

    container.replaceChildren();
    var root = el('article', 'bq-pf');
    root.setAttribute('data-place-id', place.id);

    // Portada
    var hero = el('header', 'bq-pf-hero');
    if (photo) {
      var img = el('img', 'bq-pf-hero-img');
      img.src = photo; img.alt = ownPhoto ? place.name : ''; img.decoding = 'async'; img.width = 1200; img.height = 640;
      img.addEventListener('error', function () { img.remove(); hero.classList.add('is-nophoto'); });
      hero.append(img);
      if (!ownPhoto) hero.append(i18nNode('span', 'bq-pf-photo-note', 'territoryPhoto', 'Foto del departamento, no de este lugar'));
    } else hero.classList.add('is-nophoto');
    var heroText = el('div', 'bq-pf-hero-text');
    var badges = el('div', 'bq-pf-badges');
    if (place.type_label) badges.append(el('span', 'bq-pf-badge', place.type_label));
    if (dept) { var b = el('span', 'bq-pf-badge'); b.setAttribute('translate', 'no'); b.append(icon('fa-location-dot'), ' ', dept); badges.append(b); }
    var verified = place.verification_status === 'verified';
    var seal = el('span', 'bq-pf-badge ' + (verified ? 'is-verified' : 'is-pending'));
    seal.append(icon(verified ? 'fa-circle-check' : 'fa-clock'), ' ', verified ? t('verified', 'Información verificada') : t('pending', 'Información por verificar'));
    badges.append(seal);
    var h1 = el('h1', 'bq-pf-title', place.name);
    h1.setAttribute('translate', 'no');
    heroText.append(badges, h1);
    if (place.zone_text) { var z = el('p', 'bq-pf-zone'); z.setAttribute('translate', 'no'); z.append(icon('fa-map-pin'), ' ', place.zone_text); heroText.append(z); }
    var rating = el('div', 'bq-pf-rating');
    rating.setAttribute('data-bq-rating', 'place:' + slug);
    rating.append(icon('fa-star'), ' ', t('ratingLoading', 'Cargando valoraciones…'));
    heroText.append(rating);
    hero.append(heroText);
    root.append(hero);

    // Acciones
    var actions = el('div', 'bq-pf-actions');
    if (hasCoords) {
      var go = el('button', 'bq-pf-btn');
      go.type = 'button';
      go.setAttribute('data-bq-route', '');
      go.setAttribute('data-lat', String(place.latitude));
      go.setAttribute('data-lng', String(place.longitude));
      go.setAttribute('data-precision', exact ? 'exact' : 'area');
      go.setAttribute('data-place-id', place.id);
      if (ownPhoto) go.setAttribute('data-image', ownPhoto);
      go.append(icon(exact ? 'fa-diamond-turn-right' : 'fa-map-location-dot'), ' ', exact ? t('directions', 'Cómo llegar') : t('viewArea', 'Ver la zona'));
      actions.append(go);
    }
    var onMap = el('a', 'bq-pf-btn is-ghost');
    onMap.href = 'mapa.html?q=' + encodeURIComponent(place.name);
    onMap.append(icon('fa-map'), ' ', t('onMap', 'Ver en el mapa'));
    actions.append(onMap);
    if (window.BaqueanoTrip) {
      var trip = el('button', 'bq-pf-btn is-ghost');
      trip.type = 'button';
      var paintTrip = function () {
        var saved = window.BaqueanoTrip.has(place.id);
        trip.replaceChildren(icon(saved ? 'fa-check' : 'fa-suitcase-rolling'), ' ', saved ? t('inTrip', 'En Mi viaje') : t('addTrip', 'Agregar a Mi viaje'));
        trip.setAttribute('aria-pressed', String(saved));
      };
      trip.addEventListener('click', function () {
        if (window.BaqueanoTrip.has(place.id)) window.BaqueanoTrip.remove(place.id);
        else {
          // Coordenadas solo si son exactas: Mi viaje traza rutas entre paradas.
          window.BaqueanoTrip.add({ destId: place.id, name: place.name, location: [place.zone_text, dept].filter(Boolean).join(', '),
            desc: place.short_description || '', lat: exact ? place.latitude : null, lng: exact ? place.longitude : null,
            link: 'destino.html?lugar=' + encodeURIComponent(slug), image: ownPhoto || '' });
        }
        paintTrip();
      });
      paintTrip();
      actions.append(trip);
    }
    root.append(actions);

    if (lang() !== 'es') root.append(i18nNode('p', 'bq-pf-langnote', 'spanishOnly', 'Contenido original en español. La traducción de las fichas está en curso.'));

    // Descripción
    var text = place.description || place.short_description;
    if (text) {
      var about = section('Sobre este lugar', 'about', 'fa-book-open');
      about.append(spanishText('p', null, text));
      root.append(about);
    }

    // Información práctica (solo lo que existe en la base)
    var facts = [];
    if (attrs.activities) facts.push(['activities', 'Actividades', 'fa-person-hiking', attrs.activities]);
    if (attrs.facts && attrs.facts !== text) facts.push(['facts', 'Datos del lugar', 'fa-circle-info', attrs.facts]);
    if (attrs.amenities && attrs.amenities.length) facts.push(['amenities', 'Servicios', 'fa-list-check', [].concat(attrs.amenities).join(' · ')]);
    if (attrs.price_note && attrs.price_note.text) {
      facts.push(['prices', 'Precios y horarios', 'fa-receipt', attrs.price_note.text +
        (attrs.price_note.checked_at ? ' (' + t('checkedOn', 'consultado el {date}', { date: fmtDate(attrs.price_note.checked_at) }) + ')' : '')]);
    }
    if (attrs.contact_note) facts.push(['contact', 'Contacto', 'fa-address-book', attrs.contact_note]);
    if (place.address) facts.push(['address', 'Dirección', 'fa-signs-post', place.address]);
    if (facts.length) {
      var info = section('Información práctica', 'practical', 'fa-clipboard-list');
      var dl = el('dl', 'bq-pf-facts');
      facts.forEach(function (f) {
        var dt = el('dt');
        dt.append(icon(f[2]), ' ');
        var label = el('span', null, t('fact.' + f[0], f[1]));
        label.setAttribute('data-i18n', 'placeFicha.fact.' + f[0]);
        dt.append(label);
        dl.append(dt, spanishText('dd', null, String(f[3])));
      });
      info.append(dl);
      root.append(info);
    }

    // Ubicación y precisión
    var loc = section('Ubicación', 'location', 'fa-location-crosshairs');
    if (!hasCoords) loc.append(i18nNode('p', 'bq-pf-precision is-missing', 'precisionMissing', 'Este lugar todavía no tiene coordenadas verificadas. Consultá con la comunidad o el prestador cómo llegar.'));
    else if (exact) loc.append(i18nNode('p', 'bq-pf-precision is-exact', 'precisionExact', 'Ubicación exacta verificada: «Cómo llegar» traza la ruta hasta este punto.'));
    else loc.append(i18nNode('p', 'bq-pf-precision is-area', 'precisionArea', 'Zona aproximada: el punto del mapa no es la entrada del lugar. Confirmá el acceso con la comunidad o el prestador antes de salir.'));
    root.append(loc);

    // Fuente
    if (place.source_name) {
      var src = section('Fuente de la información', 'source', 'fa-book-bookmark');
      var p = el('p');
      var url = safeUrl(place.source_url);
      if (url) { var a = el('a', null, place.source_name); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; p.append(a); }
      else p.append(place.source_name);
      if (place.verified_at) p.append(' · ', t('verifiedOn', 'verificado el {date}', { date: fmtDate(place.verified_at) }));
      src.append(p);
      root.append(src);
    }

    // Opiniones (mismo sistema que /mapa y /destinos)
    var reviews = el('section', 'bq-pf-reviews');
    reviews.id = 'opiniones';
    reviews.setAttribute('data-bq-reviews', 'place:' + slug);
    root.append(reviews);

    container.append(root);
    document.title = place.name + ' | BAQUEANO Nicaragua';
    var desc = document.querySelector('meta[name="description"]');
    if (desc && place.short_description) desc.setAttribute('content', String(place.short_description).slice(0, 160));
    if (window.BaqueanoReviews) { window.BaqueanoReviews.scan(root); window.BaqueanoReviews.mount(reviews, 'place:' + slug); }
    if (window.location.hash === '#opiniones') window.setTimeout(function () { reviews.scrollIntoView({ block: 'start' }); }, 400);
  }

  function render(container, slug) {
    slug = String(slug || '').toLowerCase();
    if (!container) return Promise.resolve(false);
    if (!SLUG_RE.test(slug)) { notFound(container, slug); return Promise.resolve(false); }
    container.replaceChildren(i18nNode('p', 'bq-pf-loading', 'loading', 'Cargando la ficha…'));
    var service = window.BaqueanoPlacesService;
    if (!service || !service.getPlaceBySlug) { notFound(container, slug); return Promise.resolve(false); }
    return service.getPlaceBySlug(slug).then(function (place) {
      if (!place || place.source !== 'supabase') { notFound(container, slug); return false; }
      build(container, place);
      return true;
    });
  }

  window.BaqueanoPlaceFicha = { render: render };
})(window, document);
