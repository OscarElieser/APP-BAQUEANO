// ============================================================================
// BAQUEANO - CATALOGO PUBLICO DE NEGOCIOS, ALIADOS Y GUIAS
// ============================================================================
// POR QUE: La red visible en la portada y en Aliados debe tener una fuente
// administrable comun sin perder contenido durante la migracion a Firestore.
// COMO: Define IDs estables y datos editoriales reutilizables. El Ops Center
// fusiona esta base con Firestore, donde cada documento con el mismo ID manda.
// QUE: Expone negocios comunitarios y guias que ya aparecen en el sitio web.
// ============================================================================
(function exposeWebsiteBusinessCatalog(window) {
  'use strict';

  const records = [
    ['coop-canon-somoto', 'Coop. Cañón de Somoto', 'Madriz', 'Senderismo', 'Somoto'],
    ['posada-ecologica-abuela', 'Posada Ecológica La Abuela', 'Masaya', 'Alojamiento', 'Laguna de Apoyo'],
    ['baqueanos-volcan', 'Baqueanos del Volcán', 'León', 'Guías Certificados', 'León'],
    ['red-ometepe-viva', 'Red Comunitaria Ometepe Viva', 'Rivas', 'Reserva Biosfera', 'Ometepe'],
    ['ecolodge-selva-negra', 'Ecolodge Selva Negra', 'Matagalpa', 'Ecoturismo', 'Matagalpa'],
    ['comedor-dona-chepita', 'Comedor Doña Chepita', 'Estelí', 'Gastronomía', 'Estelí'],
    ['rancho-aventura-chinandega', 'Rancho Aventura Chinandega', 'Chinandega', 'Cabalgata', 'Chinandega'],
    ['cooperativa-pesquera-rio', 'Cooperativa Pesquera El Río', 'Río San Juan', 'Pesca', 'El Castillo'],
    ['hacienda-cafetalera-san-marcos', 'Hacienda Cafetalera San Marcos', 'Jinotega', 'Café', 'Jinotega'],
    ['taller-artesanal-nicoya', 'Taller Artesanal Nicoya', 'Granada', 'Artesanías', 'Granada'],
    ['surf-camp-las-penitas', 'Surf Camp Las Peñitas', 'León', 'Surf & Playa', 'Las Peñitas'],
    ['guias-macizo-penas-blancas', 'Guías Macizo Peñas Blancas', 'Matagalpa', 'Guías Certificados', 'Macizo Peñas Blancas'],
    ['cooperativa-arrocera-jalapa', 'Cooperativa Arrocera Jalapa', 'Nueva Segovia', 'Agroturismo', 'Jalapa'],
    ['lanchas-lago-azul', 'Lanchas El Lago Azul', 'Granada', 'Navegación', 'Granada'],
    ['vivero-comunitario-dipilto', 'Vivero Comunitario Dipilto', 'Nueva Segovia', 'Flora', 'Dipilto'],
    ['tours-fotograficos-mombacho', 'Tours Fotográficos Mombacho', 'Granada', 'Fotografía', 'Mombacho'],
    ['apoyo-resort-comunitario', 'Apoyo Resort Comunitario', 'Masaya', 'Resort', 'Catarina'],
    ['artesanas-ceramica-mozonte', 'Artesanas de Cerámica Mozonte', 'Nueva Segovia', 'Artesanías', 'Mozonte'],
    ['campamento-bocay-selva', 'Campamento Bocay Selva', 'Jinotega', 'Camping', 'San José de Bocay'],
    ['bici-ruta-isla-verde', 'Bici-Ruta La Isla Verde', 'Rivas', 'Ciclismo', 'Ometepe']
  ];

  window.BaqueanoWebsiteBusinesses = records.map(([id, name, department, type, municipality], index) => ({
    id: `biz-web-${id}`,
    title: name,
    name,
    department,
    municipality,
    category: type,
    type,
    description: `${type} comunitario visible en la red publica de aliados Baqueano.`,
    imageUrl: index === 1
      ? 'assets/images/aliados/posada_ecologica_la_abuela.jpg'
      : index === 4
        ? 'assets/images/aliados/oro_eco.jpg'
        : index === 16
          ? 'assets/images/aliados/apoyo_resort.jpg'
          : 'assets/images/logo.png',
    phone: '50584431289',
    whatsapp: '50584431289',
    verified: true,
    verificationStatus: 'verified',
    subscriptionStatus: 'active',
    subscriptionType: 'Comunitaria Anual',
    status: 'published',
    sortOrder: index + 1,
    source: 'website_catalog'
  }));
})(window);
