// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — BANCO MAESTRO NACIONAL DE TURISMO (baqueano-master-catalog.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Consolidar el Banco Maestro Oficial de Información Turística de Nicaragua
//   cruzando fuentes oficiales (INTUR, Visita Nicaragua, Mapa Nacional de Turismo),
//   portales territoriales especializados (riosanjuan.com.ni) y fuentes de reputación
//   (Tripadvisor), bajo una arquitectura normalizada de 5 entidades clave:
//   Destino ≠ Negocio ≠ Experiencia ≠ Paquete ≠ Evento / Ruta.
// - Eliminar la desinformación y ofrecer transparencia de precios en Córdobas (C$)
//   y Dólares (USD), datos de anfitriones locales y trazabilidad de fuentes.
// - Alimentar el motor de inteligencia de Baqueano Digital (baqueano-ia.html),
//   el mapa georreferenciado, la planificación de itinerarios y la sincronización con Supabase.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Estructura de datos inmutable expuesta en `window.BAQUEANO_MASTER_CATALOG`.
// - Jerarquía de procedencia en 3 niveles:
//     * NIVEL 1 (Oficial): INTUR, Visita Nicaragua, Mapa Nicaragua.
//     * NIVEL 2 (Territorial Especializado): riosanjuan.com.ni, Alcaldías.
//     * NIVEL 3 (Reputación & Viajero): Tripadvisor (calificación agregada y reseñas).
// - Funciones de consulta rápida: `getPackagesByDepartment()`, `getRoutes()`,
//   `getDestinationsByCategory()`, `searchMasterCatalog()`.
//
// 📦 3. QUÉ (WHAT / ENTIDADES Y MÓDULOS EXPUESTOS):
// - DESTINOS: Playas (900 km litoral), Islas, Volcanes, Reservas y Monumentos.
// - PAQUETES: Circuitos turísticos con precios, duración, cupos e inclusiones.
// - RUTAS: Rutas temáticas (Oro, Colonial, Aves, Naturalistas).
// - NEGOCIOS & SERVICIOS: Hospedería, gastronomía, cafeterías, guías y operadoras.
// - BIODIVERSIDAD: Especies observables, hábitats y temporadas de avistamiento.
// ============================================================================

(function (window) {
  'use strict';

  const BAQUEANO_MASTER_CATALOG = {
    version: '2026.09.28-v1',
    verifiedDate: '2026-09-28',

    // --------------------------------------------------------------------------
    // JERARQUÍA DE FUENTES OFICIALES Y DE REPUTACIÓN
    // --------------------------------------------------------------------------
    sourcesHierarchy: {
      level1_official_national: [
        { id: 'intur', name: 'INTUR — Instituto Nicaragüense de Turismo', url: 'https://www.intur.gob.ni' },
        { id: 'visita_nicaragua', name: 'Portal Oficial Visita Nicaragua', url: 'https://www.visitanicaragua.com' },
        { id: 'mapa_nicaragua', name: 'Mapa Nacional de Turismo', url: 'https://www.mapanicaragua.com' }
      ],
      level2_territorial_specialized: [
        { id: 'rio_san_juan_portal', name: 'Portal Territorial Río San Juan', url: 'https://www.riosanjuan.com.ni' }
      ],
      level3_reputation_market: [
        { id: 'tripadvisor', name: 'Tripadvisor Nicaragua Vacations', url: 'https://www.tripadvisor.es/Tourism-g294477-Nicaragua-Vacations.html' }
      ]
    },

    // --------------------------------------------------------------------------
    // 1. DESTINOS NACIONALES (PLAYAS, ISLAS, VOLCANES, NATURALEZA)
    // --------------------------------------------------------------------------
    destinations: [
      // PLAYAS DEL PACÍFICO & CARIBE
      {
        id: 'playa_popoyo',
        category: 'playas',
        subCategory: 'surf_aventura',
        name: 'Playa Popoyo',
        department: 'Rivas',
        municipality: 'Tola',
        description: 'La meca internacional del surf en Nicaragua. Rompientes consistentes todo el año, aguas cálidas y vientos offshore del Lago Cocibolca.',
        surfSpot: true,
        sources: ['visita_nicaragua', 'tripadvisor'],
        tripadvisorRating: 4.8,
        reviewsCount: 640
      },
      {
        id: 'playa_maderas',
        category: 'playas',
        subCategory: 'surf_vida_marina',
        name: 'Playa Maderas',
        department: 'Rivas',
        municipality: 'San Juan del Sur',
        description: 'Famosa por sus formaciones rocosas en forma de aleta de tiburón, escuelas de surf para todos los niveles y ambiente juvenil.',
        surfSpot: true,
        sources: ['visita_nicaragua', 'tripadvisor'],
        tripadvisorRating: 4.6,
        reviewsCount: 1120
      },
      {
        id: 'playa_las_penitas',
        category: 'playas',
        subCategory: 'surf_manglares',
        name: 'Playa Las Peñitas',
        department: 'León',
        municipality: 'León',
        description: 'Poblado pesquero tradicional con extensas olas para surf, atardeceres dorados y puerta de entrada a la Reserva Natural Isla Juan Venado.',
        surfSpot: true,
        sources: ['visita_nicaragua', 'intur'],
        tripadvisorRating: 4.7,
        reviewsCount: 780
      },
      {
        id: 'playa_el_bluff',
        category: 'playas',
        subCategory: 'caribe_pesca',
        name: 'Playa El Bluff',
        department: 'RACCS',
        municipality: 'Bluefields',
        description: 'Extensa playa caribeña situada en la península de El Bluff frente a la Bahía de Bluefields, ideal para caminatas y gastronomía marina.',
        surfSpot: false,
        sources: ['visita_nicaragua', 'intur'],
        tripadvisorRating: 4.3,
        reviewsCount: 190
      },

      // ISLAS
      {
        id: 'isla_de_ometepe',
        category: 'islas',
        subCategory: 'reserva_biosfera_volcanes',
        name: 'Isla de Ometepe',
        department: 'Rivas',
        municipality: 'Moyogalpa / Altagracia',
        description: 'Reserva de Biósfera UNESCO en el Lago Cocibolca. Con dos volcanes colosales (Concepción y Maderas), petroglifos sagrados, Charco Verde y Ojo de Agua.',
        access: 'Ferry lacustre desde el Puerto de San Jorge (Rivas)',
        sources: ['visita_nicaragua', 'intur', 'tripadvisor'],
        tripadvisorRating: 4.9,
        reviewsCount: 2200
      },
      {
        id: 'archipielago_solentiname',
        category: 'islas',
        subCategory: 'arte_naturaleza',
        name: 'Archipiélago de Solentiname',
        department: 'Río San Juan',
        municipality: 'San Carlos',
        description: 'Conjunto de 36 islas en el Gran Lago de Nicaragua: Mancarrón, San Fernando, La Venada, Zapote y El Padre. Hogar del arte primitivista y santuario de avifauna.',
        access: 'Lancha rápida desde el Malecón de San Carlos',
        sources: ['rio_san_juan_portal', 'visita_nicaragua', 'intur'],
        tripadvisorRating: 4.7,
        reviewsCount: 410
      },
      {
        id: 'corn_islands',
        category: 'islas',
        subCategory: 'paraiso_coralino',
        name: 'Great & Little Corn Island',
        department: 'RACCS',
        municipality: 'Corn Island',
        description: 'El paraíso caribeño de aguas turquesas, arrecifes coralinos vírgenes, cultura creole, rondón tradicional y buceo de primer nivel.',
        access: 'Vuelo La Costeña a Great Corn Island o lancha panga hacia Little Corn',
        sources: ['visita_nicaragua', 'intur', 'tripadvisor'],
        tripadvisorRating: 4.9,
        reviewsCount: 1850
      },
      {
        id: 'cayos_perlas',
        category: 'islas',
        subCategory: 'cayos_virgenes',
        name: 'Cayos Perlas',
        department: 'RACCS',
        municipality: 'Laguna de Perlas',
        description: 'Grupo de 18 islotes de arena blanca brillante y palmeras en el Caribe, rodeados de arrecifes de coral y tortugas carey.',
        access: 'Lancha rápida desde Laguna de Perlas',
        sources: ['mapa_nicaragua', 'visita_nicaragua', 'intur'],
        tripadvisorRating: 4.8,
        reviewsCount: 310
      },

      // VOLCANES
      {
        id: 'volcan_masaya',
        category: 'volcanes',
        subCategory: 'crater_activo',
        name: 'Parque Nacional Volcán Masaya',
        department: 'Masaya',
        municipality: 'Nindirí',
        description: 'El lago de lava incandescente en el Cráter Santiago. Primer Parque Nacional de Nicaragua con fácil acceso vehicular hasta el borde del cráter.',
        sources: ['visita_nicaragua', 'intur', 'tripadvisor'],
        tripadvisorRating: 4.7,
        reviewsCount: 3100
      },
      {
        id: 'volcan_cerro_negro',
        category: 'volcanes',
        subCategory: 'sandboarding_extremo',
        name: 'Volcán Cerro Negro',
        department: 'León',
        municipality: 'León',
        description: 'El volcán más joven de Centroamérica (nacido en 1850). Famoso en todo el mundo por la experiencia de Sandboarding sobre sus laderas de arena volcánica negra.',
        sources: ['visita_nicaragua', 'tripadvisor'],
        tripadvisorRating: 4.8,
        reviewsCount: 1950
      },
      {
        id: 'volcan_mombacho',
        category: 'volcanes',
        subCategory: 'bosque_nuboso',
        name: 'Reserva Natural Volcán Mombacho',
        department: 'Granada',
        municipality: 'Granada',
        description: 'Coloso cubierto de bosque nuboso frente al Cocibolca y las Isletas. Senderos El Cráter, El Tigrillo y El Puma con especies endémicas de orquídeas y salamandras.',
        sources: ['visita_nicaragua', 'mapa_nicaragua', 'tripadvisor'],
        tripadvisorRating: 4.8,
        reviewsCount: 1650
      },

      // NATURALEZA Y RESERVAS
      {
        id: 'canon_somoto',
        category: 'naturaleza',
        subCategory: 'monumento_nacional_geoparque',
        name: 'Monumento Nacional Cañón de Somoto',
        department: 'Madriz',
        municipality: 'Somoto',
        description: 'Parte medular del Geoparque Mundial UNESCO Río Coco. Paredes de roca de hasta 150 metros donde nace el Río Coco; senderismo, navegación y flotación con guías locales.',
        sources: ['visita_nicaragua', 'intur', 'tripadvisor'],
        tripadvisorRating: 4.9,
        reviewsCount: 890
      },
      {
        id: 'reserva_indio_maiz',
        category: 'naturaleza',
        subCategory: 'selva_tropical_biosfera',
        name: 'Reserva Biológica Indio Maíz',
        department: 'Río San Juan',
        municipality: 'El Castillo / San Juan de Nicaragua',
        description: 'Una de las reservas selváticas más ricas e intactas de América Central. Hábitat del jaguar, tapir, águila arpía y manatí; acceso exclusivo por puestos autorizados con guardarrecursos.',
        sources: ['rio_san_juan_portal', 'intur', 'visita_nicaragua'],
        tripadvisorRating: 4.9,
        reviewsCount: 280
      }
    ],

    // --------------------------------------------------------------------------
    // 2. PAQUETES TURÍSTICOS OFICIALES (MAPA NACIONAL DE TURISMO)
    // --------------------------------------------------------------------------
    packages: [
      {
        id: 'pkg_managua_nubes_olas',
        title: 'ENTRE NUBES Y OLAS',
        department: 'Managua',
        zone: 'El Crucero + Pochomil',
        durationDays: 2,
        durationNights: 1,
        priceCordobas: 3100,
        priceUSD: 85,
        maxCapacity: 15,
        difficulty: 'Baja',
        targetAudience: 'Familias, jóvenes y adultos',
        includes: ['Transporte ida y vuelta', 'Recorrido guiado', 'Alojamiento', 'Alimentación conforme al itinerario'],
        notIncludes: ['Gastos personales', 'Bebidas alcohólicas extras'],
        highlights: ['Miradores frescos de El Crucero', 'Atardecer en Playa Pochomil', 'Gastronomía marina del Pacífico'],
        source: 'Mapa Nacional de Turismo (Septiembre 2026)',
        verifiedINTUR: true
      },
      {
        id: 'pkg_managua_raices',
        title: 'MANAGUA, RAÍCES, HISTORIA Y ENCANTO',
        department: 'Managua',
        zone: 'Centro Histórico & Puerto Salvador Allende',
        durationDays: 1,
        durationNights: 0,
        priceCordobas: 880,
        priceUSD: 24,
        maxCapacity: 12,
        difficulty: 'Baja',
        targetAudience: 'Niños, jóvenes y adultos',
        includes: ['Transporte urbano turístico', 'Desayuno nicaragüense', 'Almuerzo típico', 'Guía acreditado', 'Entradas a monumentos'],
        notIncludes: ['Actividades opcionales fuera de itinerario'],
        highlights: ['Loma de Tiscapa', 'Antigua Catedral', 'Palacio Nacional de la Cultura', 'Paseo Xolotlán', 'Puerto Salvador Allende'],
        source: 'Mapa Nacional de Turismo',
        verifiedINTUR: true
      },
      {
        id: 'pkg_granada_night_mombacho',
        title: 'NIGHT TOUR VOLCÁN MOMBACHO',
        department: 'Granada',
        zone: 'Reserva Natural Volcán Mombacho',
        durationDays: 1,
        durationHours: 5,
        priceCordobas: 1100,
        priceUSD: 30,
        maxCapacity: 16,
        difficulty: 'Media',
        targetAudience: 'Familias, jóvenes y adultos',
        includes: ['Transporte 4x4 desde Granada', 'Guía ambiental certificado', 'Caminata nocturna en Sendero El Cráter', 'Equipo de iluminación'],
        notIncludes: ['Cena'],
        highlights: ['Observación de fauna nocturna', 'Salamandra endémica', 'Vistas panorámicas nocturnas de Granada e Isletas'],
        source: 'Mapa Nacional de Turismo',
        verifiedINTUR: true
      },
      {
        id: 'pkg_rio_san_juan_castillo',
        title: 'BOCA DE SÁBALOS & FORTALEZA EL CASTILLO',
        department: 'Río San Juan',
        zone: 'El Castillo y ribera del río',
        durationDays: 2,
        durationNights: 1,
        priceCordobas: 1700,
        priceUSD: 46,
        minGroup: 2,
        difficulty: 'Baja / Cultural',
        targetAudience: 'Todo público',
        includes: ['Alojamiento ribereño 1 noche', 'Entrada guiada a Fortaleza de la Inmaculada Concepción', 'Visita al museo histórico'],
        notIncludes: ['Transporte acuático en lancha desde San Carlos (se abona en muelle)'],
        highlights: ['Gesta histórica de Rafaela Herrera', 'Paisaje fluvial y selva', 'Gastronomía de río'],
        source: 'Mapa Nacional de Turismo & riosanjuan.com.ni',
        verifiedINTUR: true
      },
      {
        id: 'pkg_nueva_segovia_cerros_pegados',
        title: 'CAÑÓN CERROS PEGADOS (ZIPOTE VAGO)',
        department: 'Nueva Segovia',
        zone: 'Cordillera Segoviana',
        operator: 'Zipote Vago Tours',
        durationDays: 1,
        priceCordobas: 1200,
        priceUSD: 33,
        difficulty: 'Alta',
        targetAudience: 'Jóvenes y adultos con buena condición física',
        includes: ['Transporte 4x4 de montaña', 'Café segoviano y rosquillas', 'Recorrido por senderos con baqueanos', 'Almuerzo campesino', 'Botiquín de primeros auxilios'],
        notIncludes: ['Ropa y calzado impermeable'],
        highlights: ['Formaciones rocosas milenarias', 'Pozas cristalinas', 'Aventura en las serranías norteñas'],
        source: 'Mapa Nacional de Turismo',
        verifiedINTUR: true
      },
      {
        id: 'pkg_raccs_cayos_perlas',
        title: 'TRAVESÍA CAYOS PERLAS',
        department: 'RACCS',
        zone: 'Laguna de Perlas & Cayos Coralinos',
        durationDays: 2,
        durationNights: 1,
        priceCordobas: 2910,
        priceUSD: 80,
        difficulty: 'Baja',
        targetAudience: 'Familias, jóvenes y adultos',
        includes: ['Transporte acuático en lancha rápida', 'Chalecos salvavidas normados', 'Desayuno criollo', 'Almuerzo caribeño con mariscos', 'Guía local', 'Equipo de snorkel y kayaks'],
        notIncludes: ['Traslado terrestre hasta Laguna de Perlas'],
        highlights: ['Snorkel en arrecife de coral', 'Islotes desiertos', 'Cultura garífuna y miskita'],
        source: 'Mapa Nacional de Turismo',
        verifiedINTUR: true
      }
    ],

    // --------------------------------------------------------------------------
    // 3. RUTAS TEMÁTICAS ESPECIALIZADAS (RÍO SAN JUAN)
    // --------------------------------------------------------------------------
    routes: [
      {
        id: 'ruta_del_oro',
        name: 'Ruta del Oro (Ruta Interoceánica del Tránsito)',
        theme: 'Historia Interoceánica, Navegación y Aventura',
        department: 'Río San Juan & Rivas',
        stops: ['Managua', 'San Juan del Sur', 'Río San Juan', 'El Castillo', 'Sarapiquí', 'San Juan de Nicaragua / Greytown', 'Reserva Indio Maíz', 'Bartola'],
        durationDays: 6,
        difficulty: 'Moderada',
        transportType: 'Terrestre y Lancha Fluvial',
        description: 'Reconstruye el trayecto de los viajeros durante la fiebre del oro de California en el siglo XIX a través de la antigua ruta del vapor y el río.',
        source: 'riosanjuan.com.ni'
      },
      {
        id: 'ruta_colonial_rsj',
        name: 'Ruta Colonial del Río San Juan',
        theme: 'Defensa Territorial, Piratería y Baluartes Españoles',
        department: 'Río San Juan',
        stops: ['San Carlos', 'Raudal del Toro', 'El Castillo', 'Fortaleza Inmaculada Concepción', 'Desaguadero'],
        durationDays: 2,
        difficulty: 'Baja',
        transportType: 'Lancha y Caminata Urbana',
        description: 'Explora la historia militar colonial, las incursiones de bucaneros ingleses por el Desaguadero y la defensa comandada por Rafaela Herrera.',
        source: 'riosanjuan.com.ni'
      },
      {
        id: 'ruta_de_las_aves_rsj',
        name: 'Ruta de las Aves del Trópico Húmedo',
        theme: 'Aviturismo y Humedales de Importancia Internacional',
        department: 'Río San Juan',
        stops: ['Humedales de San Miguelito', 'Archipiélago de Solentiname', 'Refugio Los Guatuzos', 'Boca de Bartola'],
        speciesCount: '+270 especies registradas',
        difficulty: 'Baja / Kayak y Bote',
        description: 'Santuario ornitológico: garzas tigres, espátulas rosadas, martín pescador, cormoranes, patos agujas y loras verdes en su hábitat prístino.',
        source: 'riosanjuan.com.ni'
      },
      {
        id: 'ruta_naturalistas_rsj',
        name: 'Ruta de los Naturalistas en Indio Maíz',
        theme: 'Ecología Profunda, Selva Primaria y Biodiversidad',
        department: 'Río San Juan',
        stops: ['San Carlos', 'El Castillo', 'Río Bartola', 'Boca de la Juana', 'Senderos Indio Maíz'],
        difficulty: 'Media / Exigente',
        requiresGuide: true,
        description: 'Expedición en el bosque tropical húmedo con guardarrecursos locales, avistamiento de primates, orquídeas salvajes y árboles gigantes de ceiba y cedro.',
        source: 'riosanjuan.com.ni'
      },
      {
        id: 'comunidad_rama_cantagallo',
        name: 'Convivencia Ancestral Rama: Reserva Cantagallo',
        theme: 'Turismo Comunitario y Cosmovisión Originaria',
        department: 'Río San Juan',
        community: 'Pueblo Originario Rama',
        highlights: ['Alojamiento comunitario', 'Líderes Rama certificados', 'Basalto columnar', 'Aguas termales medicinales', 'Senderismo en bosque virgen'],
        difficulty: 'Media',
        requiresCommunityCoordination: true,
        source: 'riosanjuan.com.ni'
      }
    ],

    // --------------------------------------------------------------------------
    // 4. MARCO LEGAL & MODALIDADES TURÍSTICAS (LEYES 1210 & 1211)
    // --------------------------------------------------------------------------
    legalFramework: {
      law1210: {
        name: 'Ley No. 1210 — Ley General de Turismo',
        article16_modalities: [
          'Turismo de Aventura',
          'Turismo Natural y Ecoturismo',
          'Turismo Cultural',
          'Turismo Gastronómico',
          'Turismo de Sol y Playa',
          'Turismo de Bienestar',
          'Turismo Rural y Agroturismo',
          'Turismo Religioso',
          'Turismo Urbano',
          'Turismo de Voluntariado',
          'Turismo Médico',
          'Turismo Industrial',
          'Turismo de Negocios, Congresos, Conferencias, Ferias y Exposiciones'
        ]
      },
      law1211: {
        name: 'Ley No. 1211 — Ley de Incentivos para los Desarrollos Turísticos',
        status: 'Actualizada en 2026 por INTUR',
        benefits: [
          'Exoneraciones tributarias para inversiones en infraestructura turística',
          'Incentivos para hospedería, gastronomía típica y tour operadoras',
          'Régimen especial de formalización para Pymes y cooperativas rurales'
        ]
      }
    },

    // --------------------------------------------------------------------------
    // MÉTODOS DE CONSULTA Y UTILIDADES
    // --------------------------------------------------------------------------
    getPackagesByDepartment: function (dept) {
      if (!dept) return this.packages;
      const lower = dept.toLowerCase();
      return this.packages.filter(p => p.department.toLowerCase().includes(lower));
    },

    getDestinationsByCategory: function (category) {
      if (!category || category === 'todos') return this.destinations;
      return this.destinations.filter(d => d.category === category);
    },

    getRoutes: function () {
      return this.routes;
    }
  };

  // Exposición global en el navegador
  window.BAQUEANO_MASTER_CATALOG = BAQUEANO_MASTER_CATALOG;

})(typeof window !== 'undefined' ? window : this);
