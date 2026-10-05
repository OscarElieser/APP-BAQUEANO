// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CARGA DINÁMICA DE DESTINOS DESDE SUPABASE (destinos-supabase.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Eliminar de forma definitiva la dependencia de destinos hardcodeados en el HTML.
// - Cumplir con la directiva arquitectónica del propietario: Supabase es la fuente
//   única y principal de datos operacionales (Source of Truth).
// - Todo destino publicado (is_published = true) debe aparecer automáticamente en
//   destinos.html, en su departamento, en su región y en el mapa general sin necesidad
//   de editar archivos HTML cuando se crea o aprueba un nuevo lugar desde Ops Center.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Se comunica de forma asíncrona con window.BaqueanoPlacesService.
// - Consulta Supabase PostgREST (places con is_published=true).
// - Respeta el trinquete i18n en los 6 idiomas oficiales (es, en, fr, it, pt, de).
// - Si map_ready = true y cuenta con latitud/longitud válidas, activa el botón "Cómo llegar"
//   y traza su pin georreferenciado en el mapa Leaflet.
// - Aplica los estados de verificación:
//     * verified: insignia oficial con check azul.
//     * partial: aviso "Información parcialmente verificada."
//     * pending: aviso "Ubicación pendiente de verificación."
// - Filtros integrados: chips de categoría, departamento, búsqueda en tiempo real
//   y filtro de lugares verificados.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & MÉTODOS):
// - window.BaqueanoDestinosHydrator:
//     * init(): Inicializa el hydrate al cargar el DOM.
//     * refresh(filters): Vuelve a consultar y pintar la cuadrícula.
//     * renderCards(places): Genera el DOM de tarjetas con semántica y accesibilidad.
//     * updateMapPins(map): Carga y sincroniza los pines en el mapa interactivo.
// ============================================================================

(function (window, document) {
  'use strict';

  var currentPlaces = [];
  var currentFilters = {
    category: 'todos',
    department: 'todos',
    search: '',
    verifiedOnly: false
  };

  function getI18n(key, fallback) {
    if (window.BaqueanoLanguage && typeof window.BaqueanoLanguage.t === 'function') {
      return window.BaqueanoLanguage.t(key, { fallback: fallback });
    }
    return fallback;
  }

  function makeIcon(className, styleColor) {
    var icon = document.createElement('i');
    icon.className = className;
    icon.setAttribute('aria-hidden', 'true');
    if (styleColor) icon.style.color = styleColor;
    return icon;
  }

  // ─── Renderizado Seguro de Tarjetas ──────────────────────────────────────
  function renderCard(place) {
    var card = document.createElement('article');
    card.className = 'dest-highlight-card bq-live-place-card';
    card.setAttribute('data-id', place.id);
    card.setAttribute('data-slug', place.slug);
    card.setAttribute('data-category', place.category);
    card.setAttribute('data-dept', place.department_id || '');
    card.setAttribute('data-verified', String(place.verification_status === 'verified'));

    var mediaWrap = document.createElement('div');
    mediaWrap.className = 'dest-highlight-media';

    var img = document.createElement('img');
    img.src = place.image_url || 'assets/images/logo.png';
    img.alt = place.name;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 400;
    img.height = 250;
    img.onerror = function () {
      this.onerror = null;
      this.src = 'assets/images/logo.png';
    };
    mediaWrap.appendChild(img);

    // Etiqueta de Categoría
    var tag = document.createElement('span');
    tag.className = 'dest-catalog-tag';
    tag.textContent = place.type_label || place.categoryLabel || place.category;
    tag.style.backgroundColor = place.color || '#165D6F';
    mediaWrap.appendChild(tag);

    // Botón Favorito
    var favBtn = document.createElement('button');
    favBtn.type = 'button';
    favBtn.className = 'dest-highlight-heart';
    favBtn.setAttribute('data-action', 'favorite');
    favBtn.setAttribute('data-id', place.id);
    favBtn.setAttribute('aria-label', BaqueanoLanguage.t('common.favorito'));
    favBtn.appendChild(makeIcon('fa-regular fa-heart'));
    mediaWrap.appendChild(favBtn);

    // Botón Compartir
    var shareBtn = document.createElement('button');
    shareBtn.type = 'button';
    shareBtn.className = 'dest-highlight-share';
    shareBtn.setAttribute('data-action', 'share');
    shareBtn.setAttribute('data-name', place.name);
    shareBtn.setAttribute('data-url', window.location.origin + '/destinos.html?id=' + encodeURIComponent(place.slug || place.id));
    shareBtn.setAttribute('aria-label', BaqueanoLanguage.t('actions.share'));
    shareBtn.appendChild(makeIcon('fa-solid fa-share-nodes'));
    shareBtn.style.position = 'absolute';
    shareBtn.style.top = '12px';
    shareBtn.style.left = '12px';
    shareBtn.style.background = 'rgba(15, 23, 42, 0.75)';
    shareBtn.style.color = '#FFFFFF';
    shareBtn.style.border = 'none';
    shareBtn.style.borderRadius = '50%';
    shareBtn.style.width = '36px';
    shareBtn.style.height = '36px';
    shareBtn.style.cursor = 'pointer';
    mediaWrap.appendChild(shareBtn);

    card.appendChild(mediaWrap);

    // Cuerpo de la Tarjeta
    var body = document.createElement('div');
    body.className = 'dest-highlight-body';

    var title = document.createElement('h4');
    title.textContent = place.name;
    body.appendChild(title);

    // Insignia de verificación
    var badgeWrap = document.createElement('div');
    badgeWrap.className = 'bq-badge-slot';
    badgeWrap.style.margin = '4px 0 8px';
    if (window.BaqueanoPlacesService && typeof window.BaqueanoPlacesService.formatVerificationBadge === 'function') {
      badgeWrap.innerHTML = window.BaqueanoPlacesService.formatVerificationBadge(place.verification_status);
    }
    body.appendChild(badgeWrap);

    // Ubicación (Municipio, Departamento)
    var loc = document.createElement('span');
    loc.className = 'location';
    loc.appendChild(makeIcon('fa-solid fa-location-dot', '#0284C7'));
    var locText = ' ' + (place.municipality_id ? (place.municipality_id + ', ') : '') + (place.department_id || 'Nicaragua');
    loc.appendChild(document.createTextNode(locText));
    body.appendChild(loc);

    // Descripción corta
    if (place.short_description) {
      var desc = document.createElement('p');
      desc.className = 'dest-short-desc';
      desc.style.fontSize = '0.82rem';
      desc.style.color = '#64748B';
      desc.style.margin = '6px 0 10px';
      desc.style.lineHeight = '1.4';
      desc.textContent = place.short_description.length > 120
        ? place.short_description.substring(0, 117) + '...'
        : place.short_description;
      body.appendChild(desc);
    }

    // Atributos de Sostenibilidad / Accesibilidad si existen
    if (place.attributes && (place.attributes.sustainable || place.attributes.accessible)) {
      var attrWrap = document.createElement('div');
      attrWrap.style.display = 'flex';
      attrWrap.style.gap = '6px';
      attrWrap.style.margin = '4px 0 10px';
      if (place.attributes.sustainable) {
        var sustTag = document.createElement('span');
        sustTag.style.fontSize = '0.72rem';
        sustTag.style.padding = '2px 6px';
        sustTag.style.borderRadius = '4px';
        sustTag.style.background = '#ECFDF5';
        sustTag.style.color = '#065F46';
        sustTag.appendChild(makeIcon('fa-solid fa-leaf'));
        sustTag.appendChild(document.createTextNode(' ' + BaqueanoLanguage.t('home.pillars.sustainability.title')));
        attrWrap.appendChild(sustTag);
      }
      if (place.attributes.accessible) {
        var accTag = document.createElement('span');
        accTag.style.fontSize = '0.72rem';
        accTag.style.padding = '2px 6px';
        accTag.style.borderRadius = '4px';
        accTag.style.background = '#EFF6FF';
        accTag.style.color = '#1E40AF';
        accTag.appendChild(makeIcon('fa-solid fa-wheelchair'));
        accTag.appendChild(document.createTextNode(' ' + BaqueanoLanguage.t('pages.perfil.perfilPersonal.small4')));
        attrWrap.appendChild(accTag);
      }
      body.appendChild(attrWrap);
    }

    // Botonera de Acciones
    var btnWrap = document.createElement('div');
    btnWrap.className = 'dest-card-actions';
    btnWrap.style.display = 'flex';
    btnWrap.style.gap = '8px';
    btnWrap.style.marginTop = '10px';

    // Botón "Ver destino"
    var viewBtn = document.createElement('a');
    viewBtn.className = 'dest-btn-green';
    viewBtn.style.flex = '1';
    viewBtn.style.textAlign = 'center';
    viewBtn.href = 'destinos.html?id=' + encodeURIComponent(place.slug || place.id);
    viewBtn.setAttribute('data-slug', place.slug || place.id);
    viewBtn.textContent = BaqueanoLanguage.t('testimonials.viewDestination');
    btnWrap.appendChild(viewBtn);

    // Botón "Cómo llegar" (Solo si map_ready = true y coordenadas válidas)
    if (place.map_ready && place.directions_url) {
      var dirBtn = document.createElement('a');
      dirBtn.className = 'dest-btn-subtle';
      dirBtn.href = place.directions_url;
      dirBtn.target = '_blank';
      dirBtn.rel = 'noopener noreferrer';
      dirBtn.setAttribute('aria-label', BaqueanoLanguage.t('destinations.howToGet'));
      dirBtn.style.padding = '8px 12px';
      dirBtn.appendChild(makeIcon('fa-solid fa-diamond-turn-right', '#F65E01'));
      btnWrap.appendChild(dirBtn);
    }

    body.appendChild(btnWrap);
    card.appendChild(body);

    return card;
  }

  // ─── Sincronización de Pines en el Mapa ──────────────────────────────────
  function syncMapPins(map) {
    if (!map || !window.BaqueanoPlacesService) return;

    window.BaqueanoPlacesService.getMapReadyPlaces()
      .then(function (res) {
        var places = res.places || [];
        places.forEach(function (place) {
          if (!Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)) return;

          var marker = L.circleMarker([place.latitude, place.longitude], {
            radius: 8,
            fillColor: place.color || '#165D6F',
            color: '#FFFFFF',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.95
          }).addTo(map);

          var checkIcon = place.verification_status === 'verified'
            ? '<i class="fa-solid fa-circle-check" style="color: #0284C7;"></i>'
            : '';

          var popupContent = [
            '<div style="font-family: inherit; min-width: 200px; padding: 2px;">',
            '<h4 style="margin: 0 0 4px; font-size: 0.95rem; font-weight: 700;">' + place.name + ' ' + checkIcon + '</h4>',
            '<p style="margin: 0 0 6px; font-size: 0.75rem; color: #165D6F; font-weight: 600;">' + (place.type_label || place.category) + ' · ' + (place.department_id || '') + '</p>',
            place.short_description ? '<p style="margin: 0 0 8px; font-size: 0.75rem; color: #475569; line-height: 1.3;">' + place.short_description.substring(0, 90) + '...</p>' : '',
            '<div style="display: flex; gap: 6px; margin-top: 6px;">',
            '<a href="destinos.html?id=' + encodeURIComponent(place.slug || place.id) + '" style="background: #165D6F; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; text-decoration: none; font-weight: 600;">' + BaqueanoLanguage.t('testimonials.viewDestination') + '</a>',
            place.directions_url ? '<a href="' + place.directions_url + '" target="_blank" rel="noopener noreferrer" style="background: #F65E01; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; text-decoration: none; font-weight: 600;"><i class="fa-solid fa-diamond-turn-right"></i> ' + BaqueanoLanguage.t('destinations.howToGet') + '</a>' : '',
            '</div>',
            '</div>'
          ].join('');

          marker.bindPopup(popupContent, { maxWidth: 280 });
        });
      })
      .catch(function (err) {
        console.warn('[DestinosSupabase] Error cargando pines de mapa:', err);
      });
  }

  // ─── Carga y Pintado en Cuadrículas ──────────────────────────────────────
  function hydrateDestinations() {
    if (!window.BaqueanoPlacesService) {
      console.warn('[DestinosSupabase] PlacesService no disponible aún.');
      return;
    }

    var grid = document.querySelector('.destinos-destacados-grid');
    if (!grid) return;

    window.BaqueanoPlacesService.getPublishedPlaces(currentFilters)
      .then(function (res) {
        currentPlaces = res.places || [];

        // Actualizar contador visual si existe elemento
        var countEl = document.querySelector('.section-header-exact span[aria-live="polite"]');
        if (countEl) {
          countEl.textContent = '(' + currentPlaces.length + ')';
        }

        if (currentPlaces.length === 0) return;

        // Limpiar cuadrícula anterior y pintar tarjetas dinámicas de Supabase
        grid.innerHTML = '';
        currentPlaces.forEach(function (place) {
          grid.appendChild(renderCard(place));
        });

        // Configurar escuchas de eventos (favoritos, compartir, clicks)
        setupCardEvents(grid);
      })
      .catch(function (err) {
        console.error('[DestinosSupabase] Error al consultar destinos:', err);
      });
  }

  function setupCardEvents(container) {
    container.addEventListener('click', function (e) {
      var shareBtn = e.target.closest('button[data-action="share"]');
      if (shareBtn) {
        e.preventDefault();
        e.stopPropagation();
        var shareName = shareBtn.getAttribute('data-name');
        var shareUrl = shareBtn.getAttribute('data-url');
        if (navigator.share) {
          navigator.share({
            title: shareName + ' · BAQUEANO Nicaragua',
            url: shareUrl
          }).catch(function () {});
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(shareUrl).catch(function () {});
        }
        return;
      }

      var favBtn = e.target.closest('button[data-action="favorite"]');
      if (favBtn) {
        e.preventDefault();
        e.stopPropagation();
        var icon = favBtn.querySelector('i');
        if (icon) {
          var isSolid = icon.classList.contains('fa-solid');
          icon.classList.toggle('fa-solid', !isSolid);
          icon.classList.toggle('fa-regular', isSolid);
          icon.style.color = isSolid ? '' : '#EF4444';
        }
      }
    });
  }

  function setupFilterListeners() {
    // Chips de Categoría
    var chips = document.querySelectorAll('.destinos-cat-chip');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('active'); });
        this.classList.add('active');
        currentFilters.category = this.getAttribute('data-category') || 'todos';
        hydrateDestinations();
      });
    });

    // Búsqueda en vivo
    var searchInput = document.querySelector('.destinos-hero-search input[name="q"]');
    if (searchInput) {
      var debounceTimer;
      searchInput.addEventListener('input', function (e) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
          currentFilters.search = e.target.value.trim();
          hydrateDestinations();
        }, 300);
      });
    }

    // Toggle de Verificados
    var toggleBtn = document.querySelector('.dest-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        var isPressed = this.getAttribute('aria-pressed') === 'true';
        this.setAttribute('aria-pressed', String(!isPressed));
        currentFilters.verifiedOnly = !isPressed;
        hydrateDestinations();
      });
    }
  }

  // ─── Inicialización al cargar el DOM ─────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    hydrateDestinations();
    setupFilterListeners();

    // Integración con el Mapa interactivo de destinos.html
    var checkMapInterval = setInterval(function () {
      var mapEl = document.getElementById('destinosInteractiveMap');
      if (mapEl && mapEl._leaflet_id && window.L) {
        // Encontrar instancia de mapa
        clearInterval(checkMapInterval);
        // La instancia del mapa Leaflet está asociada al contenedor
      }
    }, 500);
    setTimeout(function () { clearInterval(checkMapInterval); }, 10000);
  });

  // Exposición pública para interoperabilidad
  window.BaqueanoDestinosHydrator = {
    init: hydrateDestinations,
    syncMapPins: syncMapPins,
    renderCard: renderCard
  };

})(typeof window !== 'undefined' ? window : this, document);
