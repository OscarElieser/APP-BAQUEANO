// ============================================================================
// BAQUEANO - CATALOGO NATIVO VISIBLE EN OPS CENTER
// ============================================================================
// POR QUE: Permite administrar el contenido que ya existe en el sitio aunque
// todavia no tenga un documento equivalente dentro de Cloud Firestore.
// COMO: Combina respaldos existentes con las fuentes publicas usando IDs
// estables; Firestore puede reemplazar cada registro sin borrar los demas.
// QUE: Alimenta destinos, mapa, territorios, municipios y experiencias.
// ============================================================================
window.BaqueanoMockData = {
  '03-destinos': [
    { id: 'dest-001', title: 'Cañón de Somoto', department: 'Madriz', category: 'naturaleza', status: 'published', updatedAt: new Date().toISOString(), imageUrl: 'assets/images/destinos/canon_de_somoto.jpg', verified: true, priceNio: 250, priceUsd: 7 },
    { id: 'dest-002', title: 'Volcán Cerro Negro', department: 'León', category: 'volcanes', status: 'published', updatedAt: new Date().toISOString(), imageUrl: 'assets/images/destinos/cerro_negro.jpg', verified: true, priceNio: 150, priceUsd: 4 },
    { id: 'dest-003', title: 'Reserva Selva Negra', department: 'Matagalpa', category: 'montana', status: 'published', updatedAt: new Date().toISOString(), imageUrl: 'assets/images/destinos/selva_negra.jpg', verified: true, priceNio: 400, priceUsd: 11 },
    { id: 'dest-004', title: 'Isletas de Granada', department: 'Granada', category: 'islas', status: 'published', updatedAt: new Date().toISOString(), imageUrl: 'assets/images/destinos/isletas_granada.jpg', verified: true, priceNio: 600, priceUsd: 16 },
    { id: 'dest-005', title: 'Corn Island', department: 'RACCS', category: 'caribe', status: 'published', updatedAt: new Date().toISOString(), imageUrl: 'assets/images/destinos/corn_island.jpg', verified: true, priceNio: 1000, priceUsd: 27 },
    { id: 'dest-006', title: 'Volcán Masaya', department: 'Masaya', category: 'volcanes', status: 'published', updatedAt: new Date().toISOString(), imageUrl: 'assets/images/destinos/volcan_masaya.jpg', verified: true, priceNio: 200, priceUsd: 5.5 }
  ],
  '08-negocios': [
    { id: 'biz-001', title: 'Posada Ecológica La Abuela', department: 'Laguna de Apoyo', category: 'Hospedaje', status: 'published', updatedAt: new Date().toISOString(), imageUrl: 'assets/images/aliados/posada_ecologica_la_abuela.jpg', verified: true, priceNio: 1200 },
    { id: 'biz-002', title: 'Cooperativa de Café San Juan', department: 'Madriz', category: 'Agroturismo', status: 'published', updatedAt: new Date().toISOString(), imageUrl: 'assets/images/aliados/cafe_coop.jpg', verified: true, priceNio: 350 },
    { id: 'biz-003', title: 'Artesanías San Juan de Oriente', department: 'Masaya', category: 'Comercio Local', status: 'published', updatedAt: new Date().toISOString(), imageUrl: 'assets/images/aliados/artesanias_masaya.jpg', verified: true, priceNio: 500 },
    { id: 'biz-004', title: 'Hostal Lucha Libre', department: 'León', category: 'Hospedaje', status: 'published', updatedAt: new Date().toISOString(), imageUrl: 'assets/images/aliados/hostal_leon.jpg', verified: false, priceNio: 400 },
    { id: 'biz-005', title: 'Finca Ecoturística El Gato', department: 'Matagalpa', category: 'Agroturismo', status: 'pending_review', updatedAt: new Date().toISOString(), imageUrl: 'assets/images/aliados/finca_el_gato.jpg', verified: false, priceNio: 800 }
  ],
  '15-gastronomia': [
    { id: 'gas-001', title: 'Vigorón de Doña Toribia', department: 'Granada', category: 'Platillo Típico', status: 'published', updatedAt: new Date().toISOString(), imageUrl: 'assets/images/gastronomia/vigoron.jpg', verified: true, priceNio: 150 },
    { id: 'gas-002', title: 'Nacatamales de la Abuela', department: 'Masaya', category: 'Platillo Típico', status: 'published', updatedAt: new Date().toISOString(), imageUrl: 'assets/images/gastronomia/nacatamal.jpg', verified: true, priceNio: 80 },
    { id: 'gas-003', title: 'Quesillo de Nagarote', department: 'León', category: 'Comida Rápida Tradicional', status: 'published', updatedAt: new Date().toISOString(), imageUrl: 'assets/images/gastronomia/quesillo.jpg', verified: true, priceNio: 60 },
    { id: 'gas-004', title: 'Rondón Costeño', department: 'RACCS', category: 'Mariscos', status: 'published', updatedAt: new Date().toISOString(), imageUrl: 'assets/images/gastronomia/rondon.jpg', verified: true, priceNio: 400 },
    { id: 'gas-005', title: 'Indio Viejo', department: 'Managua', category: 'Platillo Típico', status: 'published', updatedAt: new Date().toISOString(), imageUrl: 'assets/images/gastronomia/indio_viejo.jpg', verified: false, priceNio: 120 }
  ],
  '04-territorios': [
    { id: 'ter-001', title: 'León', department: 'León', category: 'Departamento', status: 'published', updatedAt: new Date().toISOString() },
    { id: 'ter-002', title: 'Granada', department: 'Granada', category: 'Departamento', status: 'published', updatedAt: new Date().toISOString() },
    { id: 'ter-003', title: 'RACCS', department: 'RACCS', category: 'Región Autónoma', status: 'published', updatedAt: new Date().toISOString() }
  ],
  '05-municipios': [
    { id: 'mun-001', title: 'San Juan del Sur', department: 'Rivas', category: 'Municipio', status: 'published', updatedAt: new Date().toISOString() },
    { id: 'mun-002', title: 'Somoto', department: 'Madriz', category: 'Municipio', status: 'published', updatedAt: new Date().toISOString() }
  ],
  '06-experiencias': [
    { id: 'exp-001', title: 'Tour Volcán Masaya Nocturno', department: 'Masaya', category: 'Aventura', status: 'published', updatedAt: new Date().toISOString(), verified: true, priceNio: 500 },
    { id: 'exp-002', title: 'Ruta del Café Orgánico', department: 'Matagalpa', category: 'Agroturismo', status: 'published', updatedAt: new Date().toISOString(), verified: true, priceNio: 400 }
  ],
  '13-usuarios': [
    { id: 'usr-001', title: 'Juan Pérez', department: 'Managua', category: 'Explorador', status: 'published', updatedAt: new Date().toISOString() },
    { id: 'usr-002', title: 'María López', department: 'León', category: 'Explorador', status: 'published', updatedAt: new Date().toISOString() }
  ],
  '14-guias': [
    { id: 'gui-001', title: 'Carlos "El Baqueano" Silva', department: 'Madriz', category: 'Guía Certificado', status: 'published', updatedAt: new Date().toISOString(), verified: true },
    { id: 'gui-002', title: 'Ana Mendoza', department: 'Granada', category: 'Guía Histórico', status: 'published', updatedAt: new Date().toISOString(), verified: true }
  ],
  '20-sos': [
    { id: 'sos-001', title: 'Reporte Incendio Forestal Mombacho', department: 'Granada', category: 'Alerta Ambiental', status: 'published', updatedAt: new Date().toISOString(), verified: false }
  ]
};

(function hydrateOpsCatalogFromWebsite(window) {
  'use strict';
  const now = new Date().toISOString();
  const publicPlaces = window.BaqueanoFirestore?.SEED_PLACES || [];
  const publicTerritories = window.BAQUEANO_TERRITORIES || [];
  const mergeById = (base, additions) => {
    const records = new Map((base || []).map((item) => [item.id, item]));
    additions.forEach((item) => {
      const identity = String(item.title || item.name || '').trim().toLocaleLowerCase('es');
      const duplicate = Array.from(records.entries()).find(([, current]) =>
        String(current.title || current.name || '').trim().toLocaleLowerCase('es') === identity
      );
      if (duplicate && duplicate[0] !== item.id) records.delete(duplicate[0]);
      records.set(item.id, { ...(records.get(item.id) || {}), ...item });
    });
    return Array.from(records.values());
  };
  const destinations = publicPlaces.map((place) => ({
    ...place,
    id: place.id,
    title: place.title || place.name,
    name: place.name || place.title,
    latitude: Number(place.latitude ?? place.lat),
    longitude: Number(place.longitude ?? place.lng),
    coordinates: {
      lat: Number(place.latitude ?? place.lat),
      lng: Number(place.longitude ?? place.lng)
    },
    status: place.status || 'published',
    updatedAt: place.updatedAt || now,
    source: 'website_catalog'
  }));

  window.BaqueanoMockData['03-destinos'] = mergeById(window.BaqueanoMockData['03-destinos'], destinations);
  window.BaqueanoMockData['07-mapa'] = destinations.filter((item) =>
    Number.isFinite(item.latitude) && Number.isFinite(item.longitude)
  );

  const territories = publicTerritories.map((territory) => ({
    id: `ter-${territory.id}`,
    title: territory.name,
    name: territory.name,
    capital: territory.capital || territory.name,
    department: territory.name,
    category: territory.id === 'raccn' || territory.id === 'raccs' ? 'Region Autonoma' : 'Departamento',
    description: territory.shortDesc || territory.tagline || '',
    imageUrl: territory.heroImage || '',
    latitude: Number(territory.lat),
    longitude: Number(territory.lng),
    status: 'published',
    updatedAt: now,
    source: 'website_catalog'
  }));
  window.BaqueanoMockData['04-territorios'] = mergeById(window.BaqueanoMockData['04-territorios'], territories);

  const municipalities = destinations.filter((place) => place.municipality).map((place) => ({
    id: `mun-${String(place.department)}-${String(place.municipality)}`
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title: place.municipality,
    name: place.municipality,
    department: place.department || 'Nacional',
    category: 'Municipio',
    status: 'published',
    updatedAt: now,
    source: 'website_catalog'
  }));
  window.BaqueanoMockData['05-municipios'] = mergeById(window.BaqueanoMockData['05-municipios'], municipalities);

  const experiences = destinations.map((place) => ({
    ...place,
    id: `exp-${place.id}`,
    destinationId: place.id,
    title: place.experienceTitle || `Explorar ${place.name}`,
    category: place.category || 'Experiencia turistica',
    source: 'website_catalog'
  }));
  window.BaqueanoMockData['06-experiencias'] = mergeById(window.BaqueanoMockData['06-experiencias'], experiences);

  const businesses = window.BaqueanoWebsiteBusinesses || [];
  window.BaqueanoMockData['08-negocios'] = mergeById(window.BaqueanoMockData['08-negocios'], businesses);

  const guides = businesses.filter((business) =>
    /gu[ií]a|baqueano/i.test(`${business.type || ''} ${business.name || ''}`)
  ).map((business) => ({
    ...business,
    id: `guide-${business.id}`,
    businessId: business.id,
    category: 'Guía Certificado',
    specialty: business.type,
    certified: business.verified === true
  }));
  window.BaqueanoMockData['14-guias'] = mergeById(window.BaqueanoMockData['14-guias'], guides);
  window.BaqueanoMockData['21-multimedia'] = mergeById([], window.BaqueanoWebsiteMedia || []);
  window.BaqueanoMockData['22-notificaciones'] = mergeById([], window.BaqueanoWebsiteNotifications || []);
  window.BaqueanoMockData['23-ai'] = mergeById([], window.BaqueanoAiCapabilities || []);
  window.BaqueanoMockData['25-android'] = mergeById([], window.BaqueanoAndroidInventory || []);
})(window);
