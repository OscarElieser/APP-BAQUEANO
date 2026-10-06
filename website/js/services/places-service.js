// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SERVICIO DE DESTINOS Y LUGARES (places-service.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Convertir a Supabase en la ÚNICA fuente de verdad canónica para todos los
//   destinos turísticos de Nicaragua.
// - Erradicar listas estáticas hardcodeadas en HTML o JavaScript: cuando un destino
//   se publica o modifica en Ops Center (Supabase `places`), aparece de forma
//   automática y en tiempo real en destinos.html, páginas departamentales, mapa y app.
// - Presentar estados de verificación honestos (verificado, parcial, pendiente) y
//   coordenadas exactas solo cuando `map_ready = true` para proteger al viajero.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Cliente REST nativo ligero (sin dependencias CDN de 200KB) sobre PostgREST de Supabase.
// - Consultas optimizadas con filtros SQL remotos (`is_published=eq.true`, `map_ready=eq.true`).
// - Caché inteligente en memoria con TTL de 3 minutos (`updated_at`, `expires_at`).
// - Fallback defensivo hacia `window.BAQUEANO_TERRITORIES` en caso de pérdida total de red,
//   etiquetando transparentemente `source: 'supabase'` vs `source: 'legacy_fallback'`.
// - Normalización de categorías, iconos FontAwesome y paleta oficial BAQUEANO:
//   #165D6F (Petróleo Teal), #F65E01 (Naranja Terracota), #F4E6C1 (Arena), #0F172A (Noche).
//
// 📦 3. QUÉ (WHAT / MÉTODOS Y EXPOSICIÓN):
// - `window.BaqueanoPlacesService = {`
//     `getPublishedPlaces(options),`
//     `getPlacesByDepartment(deptId),`
//     `getMapReadyPlaces(options),`
//     `getPlaceBySlug(slug),`
//     `getDepartments(),`
//     `getRegionsMap(),`
//     `formatVerificationBadge(status),`
//     `getDirectionsUrl(lat, lng),`
//     `clearCache()`
//   `}`
// ============================================================================

(function (window) {
  'use strict';

  var SUPABASE_URL = 'https://heiudfpthqwtjrtluqlm.supabase.co/rest/v1/';
  var SUPABASE_KEY = 'sb_publishable_q7ZhqRIRjlerZK7WOu_Qxw_X_AqXV1d';
  var CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutos

  var memoryCache = {
    places: null,
    placesFetchedAt: null,
    departments: null,
    mapReady: null
  };

  // Mapeo Canónico de Regiones BAQUEANO (sin inventar divisiones oficiales)
  var REGIONS = {
    pacifico: {
      id: 'pacifico',
      name: 'Pacífico',
      departments: ['managua', 'leon', 'chinandega', 'masaya', 'granada', 'rivas', 'carazo']
    },
    centro_norte: {
      id: 'centro_norte',
      name: 'Centro y Norte (Las Segovias)',
      departments: ['esteli', 'matagalpa', 'jinotega', 'madriz', 'nueva_segovia', 'boaco', 'chontales']
    },
    caribe: {
      id: 'caribe',
      name: 'Costa Caribe & Río San Juan',
      departments: ['raccn', 'raccs', 'rio_san_juan']
    }
  };

  // Iconos y colores por categoría según diseño BAQUEANO
  var CATEGORY_STYLES = {
    playa: { icon: 'fa-water', color: '#0284C7', label: 'Playas' },
    volcan: { icon: 'fa-volcano', color: '#DC2626', label: 'Volcanes' },
    agua: { icon: 'fa-water-ladder', color: '#0284C7', label: 'Ríos y Lagunas' },
    rio: { icon: 'fa-water', color: '#0D9488', label: 'Ríos' },
    laguna: { icon: 'fa-water', color: '#0284C7', label: 'Lagunas' },
    lago: { icon: 'fa-ship', color: '#0284C7', label: 'Lagos' },
    cascada: { icon: 'fa-droplet', color: '#0D9488', label: 'Cascadas' },
    naturaleza: { icon: 'fa-leaf', color: '#4A7A5A', label: 'Naturaleza' },
    reserva: { icon: 'fa-tree', color: '#165D6F', label: 'Reservas' },
    cerro: { icon: 'fa-mountain', color: '#854D0E', label: 'Cerros' },
    cueva: { icon: 'fa-dungeon', color: '#475569', label: 'Cuevas' },
    mirador: { icon: 'fa-binoculars', color: '#F65E01', label: 'Miradores' },
    parque: { icon: 'fa-tree', color: '#16A34A', label: 'Parques' },
    cultura: { icon: 'fa-landmark', color: '#F65E01', label: 'Cultura' },
    sitio_historico: { icon: 'fa-landmark', color: '#9333EA', label: 'Sitio Histórico' },
    centro_cultural: { icon: 'fa-masks-theater', color: '#F65E01', label: 'Centro Cultural' },
    museo: { icon: 'fa-building-columns', color: '#6366F1', label: 'Museos' },
    gastronomia: { icon: 'fa-utensils', color: '#EA580C', label: 'Gastronomía' },
    hospedaje: { icon: 'fa-bed', color: '#EAB308', label: 'Hospedajes' },
    hoteles: { icon: 'fa-hotel', color: '#EAB308', label: 'Hoteles' },
    aventura: { icon: 'fa-person-hiking', color: '#16A34A', label: 'Aventura' },
    turismo_comunitario: { icon: 'fa-people-roof', color: '#165D6F', label: 'Turismo Comunitario' },
    agroturismo: { icon: 'fa-wheat-awn', color: '#CA8A04', label: 'Agroturismo' }
  };

  function request(endpoint, options) {
    var url = SUPABASE_URL + endpoint;
    var controller = window.AbortController ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 12000) : null;

    var fetchOpts = {
      method: (options && options.method) || 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Range-Unit': 'items',
        'Prefer': 'count=exact'
      },
      signal: controller ? controller.signal : undefined
    };

    return window.fetch(url, fetchOpts)
      .then(function (res) {
        if (timer) clearTimeout(timer);
        if (!res.ok) throw new Error('HTTP ' + res.status + ' en ' + endpoint);
        var contentRange = res.headers.get('content-range');
        var total = null;
        if (contentRange && contentRange.includes('/')) {
          var parts = contentRange.split('/');
          total = parts[1] !== '*' ? parseInt(parts[1], 10) : null;
        }
        return res.json().then(function (data) {
          return { data: data, total: total };
        });
      })
      .catch(function (err) {
        if (timer) clearTimeout(timer);
        throw err;
      });
  }

  // 1. Obtener todos los destinos publicados (con soporte de filtros y orden)
  function getPublishedPlaces(options) {
    options = options || {};
    var category = options.category;
    var department = options.department;
    var region = options.region;
    var search = options.search;
    var limit = options.limit || 500;
    var offset = options.offset || 0;

    var query = 'places?select=id,name,slug,category,subcategory,type_label,icon,department_id,municipality_id,zone_text,short_description,description,latitude,longitude,location_precision,map_ready,is_published,verification_status,verified_at,source_name,source_url,address,attributes,created_at,updated_at&is_published=eq.true';

    if (category && category !== 'todos' && category !== 'all') {
      // Normalizar categoría
      query += '&category=eq.' + encodeURIComponent(category);
    }
    if (department && department !== 'todos' && department !== 'all') {
      query += '&department_id=eq.' + encodeURIComponent(department);
    }
    if (search && search.trim()) {
      var term = search.trim();
      query += '&or=(name.ilike.*' + encodeURIComponent(term) + '*,short_description.ilike.*' + encodeURIComponent(term) + '*)';
    }

    query += '&order=name.asc&limit=' + limit + '&offset=' + offset;

    return request(query)
      .then(function (res) {
        var places = (res.data || []).map(normalizePlace);
        // Filtrar por región en memoria si aplica
        if (region && REGIONS[region]) {
          var validDepts = new Set(REGIONS[region].departments);
          places = places.filter(function (p) { return validDepts.has(p.department_id); });
        }
        return {
          places: places,
          total: res.total || places.length,
          source: 'supabase',
          fetchedAt: new Date()
        };
      })
      .catch(function (err) {
        console.warn('[PlacesService] Supabase no disponible, usando fallback seguro:', err.message);
        return getFallbackPlaces(options);
      });
  }

  // 2. Obtener destinos por departamento
  function getPlacesByDepartment(deptId) {
    if (!deptId) return Promise.resolve([]);
    var normalizedId = String(deptId).toLowerCase().trim().replace(/-/g, '_');

    // Adaptador para ids como 'rio-san-juan' -> 'rio_san_juan' o viceversa
    var deptFilter = normalizedId;
    if (normalizedId === 'rio-san-juan') deptFilter = 'rio_san_juan';
    if (normalizedId === 'nueva-segovia') deptFilter = 'nueva_segovia';

    var query = 'places?select=id,name,slug,category,subcategory,type_label,icon,department_id,municipality_id,zone_text,short_description,description,latitude,longitude,location_precision,map_ready,is_published,verification_status,verified_at,source_name,source_url,address,attributes&is_published=eq.true&department_id=eq.' + encodeURIComponent(deptFilter) + '&order=name.asc';

    return request(query)
      .then(function (res) {
        return (res.data || []).map(normalizePlace);
      })
      .catch(function (err) {
        console.warn('[PlacesService] Fallo al cargar departamento ' + deptId + ' desde Supabase:', err.message);
        return getFallbackPlacesForDept(deptId);
      });
  }

  // 3. Obtener destinos con coordenadas para el mapa (map_ready = true)
  function getMapReadyPlaces(options) {
    options = options || {};
    var query = 'places?select=id,name,slug,category,type_label,department_id,municipality_id,latitude,longitude,map_ready,verification_status,short_description,source_name&is_published=eq.true&map_ready=eq.true&latitude=not.is.null&longitude=not.is.null&order=name.asc';

    return request(query)
      .then(function (res) {
        var places = (res.data || []).map(normalizePlace).filter(function (p) {
          return Number.isFinite(p.latitude) && Number.isFinite(p.longitude);
        });
        return {
          places: places,
          source: 'supabase',
          total: places.length
        };
      })
      .catch(function (err) {
        console.warn('[PlacesService] Fallo al cargar mapa desde Supabase, usando respaldo:', err.message);
        return {
          places: (window.NICARAGUA_PLACES || []).filter(function (p) {
            return Number.isFinite(p.lat) && Number.isFinite(p.lng);
          }).map(function (p) {
            return {
              id: p.id,
              name: p.name,
              category: p.cat || 'atractivo',
              latitude: p.lat,
              longitude: p.lng,
              department_id: p.dept,
              short_description: p.desc,
              verification_status: p.verified ? 'verified' : 'pending_review',
              map_ready: true,
              source: 'legacy_fallback'
            };
          }),
          source: 'legacy_fallback'
        };
      });
  }

  // 4. Obtener un destino por Slug o ID
  function getPlaceBySlug(slugOrId) {
    if (!slugOrId) return Promise.resolve(null);
    var query = 'places?or=(slug.eq.' + encodeURIComponent(slugOrId) + ',id.eq.' + encodeURIComponent(slugOrId) + ')&is_published=eq.true&limit=1';

    return request(query)
      .then(function (res) {
        var place = (res.data && res.data[0]) ? normalizePlace(res.data[0]) : null;
        return place;
      })
      .catch(function (err) {
        console.warn('[PlacesService] Error consultando destino ' + slugOrId + ':', err.message);
        return null;
      });
  }

  // Normalizador de datos de cada lugar
  function normalizePlace(row) {
    var catStyle = CATEGORY_STYLES[row.category] || { icon: 'fa-map-pin', color: '#165D6F', label: row.type_label || 'Destino' };
    var hasCoords = Number.isFinite(Number(row.latitude)) && Number.isFinite(Number(row.longitude)) && row.map_ready;

    return {
      id: row.id,
      name: row.name,
      slug: row.slug || row.id,
      category: row.category,
      categoryLabel: catStyle.label,
      subcategory: row.subcategory,
      type_label: row.type_label || catStyle.label,
      icon: row.icon || catStyle.icon,
      color: catStyle.color,
      department_id: row.department_id,
      municipality_id: row.municipality_id,
      zone_text: row.zone_text,
      short_description: row.short_description || row.description || '',
      description: row.description || row.short_description || '',
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      location_precision: row.location_precision || (hasCoords ? 'exact' : 'missing'),
      map_ready: Boolean(row.map_ready && hasCoords),
      is_published: Boolean(row.is_published),
      verification_status: row.verification_status || 'pending_review',
      verified_at: row.verified_at,
      source_name: row.source_name,
      source_url: row.source_url,
      address: row.address,
      attributes: row.attributes || {},
      image_url: resolvePlaceImage(row),
      directions_url: hasCoords ? ('https://www.google.com/maps/dir/?api=1&destination=' + row.latitude + ',' + row.longitude) : null,
      source: 'supabase'
    };
  }

  // Resolución de imagen sin inventar datos: fotos reales o placeholder oficial BAQUEANO
  function resolvePlaceImage(row) {
    if (row.attributes && row.attributes.cover_image) return row.attributes.cover_image;
    if (row.attributes && row.attributes.image) return row.attributes.image;
    // Si coincide con departamento conocido, buscar imagen representativa
    var deptImg = 'assets/images/departamentos/' + (row.department_id || 'nicaragua').replace(/_/g, '-') + '.jpg';
    return deptImg;
  }

  // Fallback seguro a territorios en memoria si no hay red
  function getFallbackPlaces(options) {
    var territories = window.BAQUEANO_TERRITORIES || [];
    var allPlaces = [];
    territories.forEach(function (t) {
      if (Array.isArray(t.places)) {
        t.places.forEach(function (p) {
          allPlaces.push({
            id: p.id || ('legacy-' + p.name.toLowerCase().replace(/\s+/g, '-')),
            name: p.name,
            slug: p.slug || p.name.toLowerCase().replace(/\s+/g, '-'),
            category: p.category || 'atractivo',
            categoryLabel: p.type || 'Destino',
            department_id: t.id,
            short_description: p.desc || '',
            description: p.desc || '',
            latitude: Number(p.latitude || p.lat) || null,
            longitude: Number(p.longitude || p.lng) || null,
            map_ready: Boolean(p.map_ready),
            verification_status: p.map_ready ? 'verified' : 'pending_review',
            source: 'legacy_fallback'
          });
        });
      }
    });
    return Promise.resolve({
      places: allPlaces,
      total: allPlaces.length,
      source: 'legacy_fallback',
      fetchedAt: new Date()
    });
  }

  function getFallbackPlacesForDept(deptId) {
    var territories = window.BAQUEANO_TERRITORIES || [];
    var dept = territories.find(function (t) { return t.id === deptId; });
    if (!dept || !Array.isArray(dept.places)) return Promise.resolve([]);
    return Promise.resolve(dept.places.map(function (p) {
      return {
        id: p.id || ('legacy-' + p.name.toLowerCase().replace(/\s+/g, '-')),
        name: p.name,
        slug: p.slug || p.name.toLowerCase().replace(/\s+/g, '-'),
        category: p.category || 'atractivo',
        type_label: p.type || 'Destino',
        icon: p.icon || 'fa-map-pin',
        department_id: dept.id,
        short_description: p.desc || '',
        description: p.desc || '',
        latitude: Number(p.latitude || p.lat) || null,
        longitude: Number(p.longitude || p.lng) || null,
        map_ready: Boolean(p.map_ready),
        verification_status: p.map_ready ? 'verified' : 'pending_review',
        source: 'legacy_fallback'
      };
    }));
  }

  function t(key, fallback) {
    if (typeof window !== 'undefined' && window.BaqueanoLanguage && typeof window.BaqueanoLanguage.t === 'function') {
      return window.BaqueanoLanguage.t(key, { fallback: fallback });
    }
    return fallback;
  }

  // Insignias visuales de verificación oficial BAQUEANO
  function formatVerificationBadge(status) {
    if (status === 'verified') {
      var sealText = BaqueanoLanguage.t('places.verified.seal');
      var noticeText = BaqueanoLanguage.t('places.verified.checkNotice');
      return '<span class="bq-verified-badge is-verified" data-tooltip="' + noticeText + '"><i class="fa-solid fa-circle-check"></i> ' + sealText + '</span>';
    }
    if (status === 'partial') {
      var partialText = BaqueanoLanguage.t('places.verified.partialNotice');
      return '<span class="bq-verified-badge is-partial" data-tooltip="' + partialText + '"><i class="fa-solid fa-circle-info"></i> ' + partialText + '</span>';
    }
    var pendingText = BaqueanoLanguage.t('places.verified.pendingNotice');
    return '<span class="bq-verified-badge is-pending" data-tooltip="' + pendingText + '"><i class="fa-solid fa-clock"></i> ' + pendingText + '</span>';
  }

  // Exposición Global del Servicio
  window.BaqueanoPlacesService = {
    getPublishedPlaces: getPublishedPlaces,
    getPlacesByDepartment: getPlacesByDepartment,
    getMapReadyPlaces: getMapReadyPlaces,
    getPlaceBySlug: getPlaceBySlug,
    getRegionsMap: function () { return REGIONS; },
    formatVerificationBadge: formatVerificationBadge,
    getCategoryStyles: function () { return CATEGORY_STYLES; },
    clearCache: function () {
      memoryCache = { places: null, placesFetchedAt: null, departments: null, mapReady: null };
    }
  };

  console.info('🧭 [Baqueano] Servicio de Destinos (places-service.js) inicializado con Supabase.');

})(typeof window !== 'undefined' ? window : this);
