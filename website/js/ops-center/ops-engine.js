// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — OPS CENTER & UNIVERSAL CMS ENGINE (ops-engine.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Servir como el CEREBRO OPERATIVO y CMS UNIVERSAL de BAQUEANO Nicaragua,
//   permitiendo al Superadministrador y equipo editorial gestionar de forma
//   100% autónoma, sin entrar al código fuente, los 33 módulos de la plataforma.
// - Garantizar que cualquier publicación, edición, archivo o eliminación
//   quede sincronizada al instante tanto en el Portal Web como en la App Android,
//   respetando los contratos de datos de Firestore y el modelo compartido.
// - Erradicar terminantemente datos inventados, botones sin función, pantallas
//   estáticas y el uso de alert(), prompt() y confirm() en favor de una UX
//   ejecutiva de alta gama con modales, off-canvas drawers y notificaciones toast.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Registro universal de entidades (ENTITY_REGISTRY) que estandariza las 33
//   vistas con ciclo de vida editorial completo: published, draft, archived, trashed.
// - Conexión robusta con Cloud Firestore usando escrituras atómicas (WriteBatch)
//   para mantener en sincronía dual las colecciones 'destinations' y 'places'.
// - Carga real y directa de fotografías y documentos a Firebase Storage con
//   validación de formato, compresión y previsualización inmediata.
// - Auditoría inmutable en 'audit_logs' con marcas de tiempo del servidor
//   (serverTimestamp) y atribución explícita del usuario administrativo.
// - Command Palette (Ctrl+K) con búsqueda omnicanal y navegación instantánea.
// - Control de acceso multinivel (RBAC): superAdmin, admin, editor, auditor.
//
// 📦 3. QUÉ (WHAT / SERVICIOS & FACADES EXPUESTOS):
// - window.BaqueanoOpsEngine: Fachada central de control y métodos de interfaz.
// - OpsCMS: Motor genérico de CRUD, paginación, filtros y acciones masivas.
// - OpsStorage: Gestor de subida y eliminación de medios en Firebase Storage.
// - OpsAuth: Autenticación Google OAuth 2.0 y resolución de roles RBAC.
// - OpsToast: Sistema de alertas no intrusivas flotantes.
// - OpsDialog: Modal de confirmación reforzada para acciones críticas.
// ============================================================================

(function (window, document) {
  'use strict';

  // --------------------------------------------------------------------------
  // 0. REGISTRO UNIVERSAL DE PÁGINAS Y SECCIONES DEL SITIO WEB (12 PÁGINAS)
  // --------------------------------------------------------------------------
  const SITE_PAGES_REGISTRY = {
    index: {
      name: 'Portada Principal',
      file: 'index.html',
      icon: 'fa-house',
      sections: [
        {
          id: 'sec_index_hero',
          name: 'Hero Principal Cinemático',
          type: 'hero',
          title: 'El Sendero lo Abren las Comunidades',
          subtitle: 'Ecoturismo Auténtico en Nicaragua sin intermediarios',
          content: 'Baqueano existe para transformar el turismo en una actividad más responsable, distribuida, segura, culturalmente consciente y beneficiosa para las familias campesinas.',
          ctaText: 'Explora Nicaragua en 3D',
          ctaLink: '#mapaVivo3dSection',
          imageUrl: 'assets/images/heroes/hero-bg.jpg',
          status: 'published',
          sortOrder: 1
        },
        {
          id: 'sec_index_map3d',
          name: 'Mapa Vivo 3D de Nicaragua',
          type: 'custom',
          title: 'Mapa Topográfico Vivo 3D de Nicaragua',
          subtitle: 'Relieve de volcanes, lagos, reservas y cordilleras con Three.js',
          content: 'Visualiza la geografía soberana de Nicaragua en WebGL interactivo a 60fps con brújula de rumbo y selector de regiones.',
          ctaText: 'Abrir Navegación Libre',
          ctaLink: '#mapaVivo3dSection',
          imageUrl: '',
          status: 'published',
          sortOrder: 2
        },
        {
          id: 'sec_index_routes',
          name: 'Diseñador Inteligente de Rutas',
          type: 'custom',
          title: 'Diseña tu Travesía Comunitaria',
          subtitle: 'Itinerarios inteligentes con presupuesto real bimoneda (C$ y US$ a tipo de cambio oficial BCN)',
          content: 'Selecciona tus días de viaje, presupuesto diario y preferencias para generar una ruta conectada a las cooperativas anfitrionas.',
          ctaText: 'Calcular Ruta',
          ctaLink: '#disenadorRutasSection',
          imageUrl: '',
          status: 'published',
          sortOrder: 3
        },
        {
          id: 'sec_index_featured',
          name: 'Destinos Insignia & Senderos',
          type: 'cards',
          title: 'Destinos Protegidos en Vivo',
          subtitle: 'Senderos, volcanes activos y reservas campesinas conectadas a Cloud Firestore',
          content: 'Explora fichas técnicas verificadas con coordenadas precisas, dificultad y tarifas justas.',
          ctaText: 'Ver Catálogo Completo',
          ctaLink: 'destinos.html',
          imageUrl: 'assets/images/destinos/canon_de_somoto.jpg',
          status: 'published',
          sortOrder: 4
        },
        {
          id: 'sec_index_testimonials',
          name: 'Voces del Territorio & Testimonios',
          type: 'testimonial',
          title: 'Historias Reales de Familias y Viajeros',
          subtitle: 'Transparencia total sin comisiones foráneas abusivas',
          content: 'Campesinos de Somoto, Ometepe y Selva Negra relatan el impacto directo del modelo Baqueano.',
          ctaText: 'Enviar Testimonio',
          ctaLink: '#testimoniosComunitarios',
          imageUrl: '',
          status: 'published',
          sortOrder: 5
        },
        {
          id: 'sec_index_apk',
          name: 'Portal de Descarga APK Android',
          type: 'banner',
          title: 'Descarga Baqueano para Android',
          subtitle: 'Mapas offline, coordenadas GPS sin señal y botón SOS satelital',
          content: 'Instala la versión oficial del APK en tu dispositivo móvil y lleva el conocimiento campesino en el bolsillo.',
          ctaText: 'Descargar BaqueanoNicaragua.apk',
          ctaLink: 'assets/BaqueanoNicaragua.apk',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 6
        },
        {
          id: 'sec_index_register',
          name: 'Postulación de Anfitriones Comunitarios',
          type: 'cta',
          title: 'Registra tu Local, Hospedaje o Cooperativa',
          subtitle: 'Formulario oficial conectado directamente a la Mesa Técnica Baqueano vía WhatsApp (+505 8443-1289)',
          content: 'Inscribe tu negocio bajo los principios de turismo ético y soberanía comunitaria.',
          ctaText: 'Postular a Mesa Baqueano',
          ctaLink: '#registroAnfitrionSection',
          imageUrl: '',
          status: 'published',
          sortOrder: 7
        }
      ]
    },
    destinos: {
      name: 'Catálogo de Destinos',
      file: 'destinos.html',
      icon: 'fa-mountain',
      sections: [
        {
          id: 'sec_dest_hero',
          name: 'Hero de Destinos',
          type: 'hero',
          title: 'Catálogo Oficial de Destinos y Áreas Protegidas',
          subtitle: 'Fichas técnicas con coordenadas GPS verificadas y cotizador bimoneda Ley 306',
          content: 'Encuentra senderos, volcanes y reservas naturales administradas con respeto ambiental.',
          ctaText: 'Filtrar por Departamento',
          ctaLink: '#filtrosDepartamento',
          imageUrl: 'assets/images/destinos/cerro_negro.jpg',
          status: 'published',
          sortOrder: 1
        },
        {
          id: 'sec_dest_grid',
          name: 'Rejilla de Destinos Sincronizada',
          type: 'cards',
          title: 'Senderos Activos en Todo el País',
          subtitle: 'Sincronización en tiempo real desde Firestore con la app Android',
          content: 'Tarjetas dinámicas con dificultad, tarifas en córdobas y dólares y contacto de baqueanos.',
          ctaText: 'Ver Detalles',
          ctaLink: '#',
          imageUrl: '',
          status: 'published',
          sortOrder: 2
        }
      ]
    },
    ambiental: {
      name: 'Guía Ambiental & Sostenibilidad',
      file: 'ambiental.html',
      icon: 'fa-leaf',
      sections: [
        {
          id: 'sec_amb_hero',
          name: 'Hero Ambiental',
          type: 'hero',
          title: 'Guía Ambiental & Huella Cero en Territorio Soberano',
          subtitle: 'Protocolo de protección para las 76 áreas protegidas de Nicaragua',
          content: 'El ecoturismo campesino protege nuestros bosques, fuentes de agua y biodiversidad nativa.',
          ctaText: 'Leer Decálogo Verde',
          ctaLink: '#decalogoVerde',
          imageUrl: 'assets/images/destinos/selva_negra.jpg',
          status: 'published',
          sortOrder: 1
        },
        {
          id: 'sec_amb_decalogo',
          name: 'Decálogo Verde del Explorador',
          type: 'content',
          title: '10 Mandamientos del Ecoturismo Consciente',
          subtitle: 'Normas innegociables de no dejar rastro y respeto a la cosmovisión rural',
          content: 'No extraigas flora silvestre, no introduzcas plásticos de un solo uso y apoya el consumo local.',
          ctaText: 'Conocer Protocolos',
          ctaLink: '#protocolosMarena',
          imageUrl: '',
          status: 'published',
          sortOrder: 2
        }
      ]
    },
    aliados: {
      name: 'Red de Aliados & Negocios',
      file: 'aliados.html',
      icon: 'fa-store',
      sections: [
        {
          id: 'sec_aliados_hero',
          name: 'Hero de Aliados',
          type: 'hero',
          title: 'Red de Anfitriones y Cooperativas Campesinas',
          subtitle: 'Directorio acreditado con sello verificado bajo Ley 1210/1211',
          content: 'Hospedajes rurales, comederos típicos, guías certificados y transporte comunitario.',
          ctaText: 'Contactar por WhatsApp',
          ctaLink: '#directorioAliados',
          imageUrl: 'assets/images/aliados/posada_ecologica_la_abuela.jpg',
          status: 'published',
          sortOrder: 1
        },
        {
          id: 'sec_aliados_grid',
          name: 'Directorio 3D de Comercios',
          type: 'cards',
          title: 'Tarjetas Interactivas con Giro 3D',
          subtitle: 'Toca cada tarjeta para voltearla y chatear directamente por WhatsApp con el anfitrión',
          content: 'Datos reales comprobados en campo sin intermediarios extranjeros.',
          ctaText: 'Ver Negocios',
          ctaLink: '#',
          imageUrl: '',
          status: 'published',
          sortOrder: 2
        }
      ]
    },
    nosotros: {
      name: 'Nosotros & Manifiesto',
      file: 'nosotros.html',
      icon: 'fa-users',
      sections: [
        {
          id: 'sec_nosotros_hero',
          name: 'Manifiesto Soberano',
          type: 'hero',
          title: 'Manifiesto Baqueano: Soberanía Ecoturística',
          subtitle: 'Tecnología digital puesta al servicio del campesinado nicaragüense',
          content: 'Nacimos para que el turismo beneficie directamente a quienes cuidan la tierra y abren los senderos.',
          ctaText: 'Conoce Nuestra Misión',
          ctaLink: '#misionBaqueano',
          imageUrl: 'assets/images/destinos/canon_de_somoto.jpg',
          status: 'published',
          sortOrder: 1
        },
        {
          id: 'sec_nosotros_mision',
          name: 'Pilares Fundamentales',
          type: 'content',
          title: 'Comercio Justo, Identidad y Seguridad Satelital',
          subtitle: 'Los tres ejes que guían cada línea de código y cada sendero mapeado',
          content: 'Cero comisiones abusivas, rescate de la historia viva y tecnología de rescate SOS en Android.',
          ctaText: 'Unirme al Movimiento',
          ctaLink: '#',
          imageUrl: '',
          status: 'published',
          sortOrder: 2
        }
      ]
    },
    gastronomia: {
      name: 'Gastronomía Ancestral',
      file: 'gastronomia.html',
      icon: 'fa-utensils',
      sections: [
        {
          id: 'sec_gastro_hero',
          name: 'Hero Gastronómico',
          type: 'hero',
          title: 'Gastronomía Ancestral de Nicaragua',
          subtitle: 'El sabor del fogón de leña y el maíz nixtamalizado de nuestras abuelas',
          content: 'Gallo pinto, nacatamal, vigorón, baho, quesillo e indio viejo: la identidad patria servida en la mesa.',
          ctaText: 'Explorar Recetas',
          ctaLink: '#recetasTradicionales',
          imageUrl: 'assets/images/comida/gallo_pinto.jpg',
          status: 'published',
          sortOrder: 1
        }
      ]
    },
    historia: {
      name: 'Historia Patria',
      file: 'historia.html',
      icon: 'fa-scroll',
      sections: [
        {
          id: 'sec_hist_hero',
          name: 'Hero de Historia',
          type: 'hero',
          title: 'Cronología Soberana de Nicaragua',
          subtitle: 'Hitos patrios desde los pueblos originarios hasta la defensa de la autodeterminación',
          content: 'Descubre la memoria viva que impregna cada valle, volcán y río de nuestra patria bendita.',
          ctaText: 'Ver Línea de Tiempo',
          ctaLink: '#lineaDeTiempo',
          imageUrl: 'assets/images/heroes/hero-bg.jpg',
          status: 'published',
          sortOrder: 1
        }
      ]
    },
    musica: {
      name: 'Música & Folclore',
      file: 'musica.html',
      icon: 'fa-guitar',
      sections: [
        {
          id: 'sec_mus_hero',
          name: 'Hero Folclórico',
          type: 'hero',
          title: 'Patrimonio Sonoro de Nicaragua',
          subtitle: 'Son de marimba, mazurcas norteñas y polkas segovianas',
          content: 'La música autóctona que acompaña las fiestas patronales y las faenas campesinas.',
          ctaText: 'Escuchar Grabaciones',
          ctaLink: '#reproductorSonoro',
          imageUrl: '',
          status: 'published',
          sortOrder: 1
        }
      ]
    },
    denuncias: {
      name: 'Canal de Denuncias',
      file: 'denuncias.html',
      icon: 'fa-shield-halved',
      sections: [
        {
          id: 'sec_den_hero',
          name: 'Hero de Denuncias',
          type: 'hero',
          title: 'Canal Comunitario de Denuncia Ambiental',
          subtitle: 'Alerta ciudadana para la protección de cuencas, bosques y fauna silvestre',
          content: 'Tus reportes son canalizados ante las autoridades ambientales competentes con respaldo georreferenciado.',
          ctaText: 'Presentar Denuncia',
          ctaLink: '#formularioDenuncia',
          imageUrl: '',
          status: 'published',
          sortOrder: 1
        }
      ]
    },
    departamento: {
      name: 'Ficha Departamental',
      file: 'departamento.html',
      icon: 'fa-map-location-dot',
      sections: [
        {
          id: 'sec_dep_hero',
          name: 'Hero Departamental',
          type: 'hero',
          title: 'Exploración Territorial por Departamento',
          subtitle: 'Los 15 departamentos y 2 regiones autónomas de la República de Nicaragua',
          content: 'Información geográfica soberana, cabeceras, municipios y destinos comunitarios verificados.',
          ctaText: 'Seleccionar Territorio',
          ctaLink: '#selectorDepartamento',
          imageUrl: '',
          status: 'published',
          sortOrder: 1
        }
      ]
    },
    'mi-negocio': {
      name: 'Portal Mi Negocio',
      file: 'mi-negocio.html',
      icon: 'fa-id-badge',
      sections: [
        {
          id: 'sec_biz_hero',
          name: 'Hero Mi Negocio',
          type: 'hero',
          title: 'Portal de Autogestión para Anfitriones Locales',
          subtitle: 'Actualiza tus tarifas, verifica reservas y mantén al día tu perfil de aliado',
          content: 'Acceso directo y soberano para cooperativas, hospedajes rurales y guías comunitarios.',
          ctaText: 'Acceder a Mi Negocio',
          ctaLink: '#panelAutogestion',
          imageUrl: '',
          status: 'published',
          sortOrder: 1
        }
      ]
    },
    perfil: {
      name: 'Perfil de Usuario',
      file: 'perfil.html',
      icon: 'fa-circle-user',
      sections: [
        {
          id: 'sec_prf_hero',
          name: 'Hero de Perfil',
          type: 'hero',
          title: 'Pasaporte del Explorador Baqueano',
          subtitle: 'Tus expediciones guardadas, bitácora de viaje y preferencias de ruta',
          content: 'Sincronizado entre tu sesión web y la app móvil de Android.',
          ctaText: 'Ver Rutas Guardadas',
          ctaLink: '#rutasGuardadas',
          imageUrl: '',
          status: 'published',
          sortOrder: 1
        }
      ]
    }
  };

  // --------------------------------------------------------------------------
  // 1. REGISTRO MAESTRO DE ENTIDADES (33 MÓDULOS DE GESTIÓN)
  // --------------------------------------------------------------------------
  const ENTITY_REGISTRY = {
    // 01: Dashboard Ejecutivo (Vista consolidada de KPIs y Pulso Nacional)
    '01-dashboard': {
      isSystem: true,
      title: 'Dashboard Ejecutivo',
      icon: 'fa-gauge-high'
    },
    // 02: CMS de Contenido Editorial
    '02-contenido': {
      collection: 'cms_content',
      title: 'Contenido Editorial & Artículos',
      singular: 'Artículo',
      icon: 'fa-file-lines',
      hasImage: true,
      fields: ['title', 'category', 'department', 'shortDesc', 'description', 'status']
    },
    // 03: Destinos Turísticos (Sincronización dual con 'places')
    '03-destinos': {
      collection: 'destinations',
      dualSyncCollection: 'places',
      title: 'Catálogo de Destinos',
      singular: 'Destino',
      icon: 'fa-mountain',
      hasImage: true,
      hasGeo: true,
      hasPricing: true,
      fields: ['title', 'slug', 'category', 'department', 'municipality', 'description', 'difficulty', 'priceUsd', 'priceNio', 'imageUrl', 'status', 'featured']
    },
    // 04: Territorios Nacionales (15 Departamentos y 2 Regiones Autónomas)
    '04-territorios': {
      collection: 'departments',
      title: 'Territorios Nacionales',
      singular: 'Territorio',
      icon: 'fa-earth-americas',
      hasImage: true,
      fields: ['name', 'capital', 'region', 'description', 'status']
    },
    // 05: Municipios
    '05-municipios': {
      collection: 'municipalities',
      title: 'Municipios',
      singular: 'Municipio',
      icon: 'fa-city',
      fields: ['name', 'department', 'description', 'status']
    },
    // 06: Experiencias Turísticas (Tours, Rutas y Senderismo)
    '06-experiencias': {
      collection: 'experiences',
      title: 'Experiencias Turísticas',
      singular: 'Experiencia',
      icon: 'fa-compass',
      hasImage: true,
      hasPricing: true,
      fields: ['title', 'category', 'department', 'duration', 'priceUsd', 'difficulty', 'description', 'status']
    },
    // 07: Mapa Geográfico & Coordenadas
    '07-mapa': {
      isSystem: true,
      title: 'Mapa Geográfico & Coordenadas',
      icon: 'fa-map-location-dot'
    },
    // 08: Negocios & Aliados Comunitarios
    '08-negocios': {
      collection: 'businesses',
      title: 'Negocios & Aliados',
      singular: 'Negocio',
      icon: 'fa-store',
      hasImage: true,
      hasContact: true,
      fields: ['name', 'type', 'department', 'municipality', 'address', 'phone', 'priceRange', 'description', 'verified', 'status']
    },
    // 09: Verificaciones & Sello Oficial (Ley 1210/1211)
    '09-verificaciones': {
      isSystem: true,
      title: 'Verificaciones & Sello Oficial',
      icon: 'fa-certificate'
    },
    // 10: Suscripciones & Membresías
    '10-suscripciones': {
      isSystem: true,
      title: 'Suscripciones & Membresías',
      icon: 'fa-id-card'
    },
    // 11: Reservas & Expediciones
    '11-reservas': {
      collection: 'reservations',
      title: 'Reservas & Expediciones',
      singular: 'Reserva',
      icon: 'fa-calendar-check',
      fields: ['destinationTitle', 'touristName', 'touristEmail', 'contactPhone', 'participants', 'requestedDate', 'status']
    },
    // 12: Pagos & Comprobantes Fiscales
    '12-pagos': {
      collection: 'payment_orders',
      title: 'Pagos & Comprobantes',
      singular: 'Comprobante',
      icon: 'fa-receipt',
      fields: ['orderId', 'businessId', 'amountNio', 'amountUsd', 'paymentMethod', 'reference', 'status']
    },
    // 13: Directorio de Usuarios & RBAC
    '13-usuarios': {
      collection: 'users',
      title: 'Directorio de Usuarios',
      singular: 'Usuario',
      icon: 'fa-users',
      fields: ['displayName', 'email', 'role', 'status', 'explorerLevel', 'createdAt']
    },
    // 14: Guías / Baqueanos Nativos
    '14-guias': {
      collection: 'guides',
      title: 'Guías & Baqueanos Certificados',
      singular: 'Baqueano',
      icon: 'fa-person-hiking',
      hasImage: true,
      fields: ['name', 'department', 'specialty', 'phone', 'languages', 'certified', 'status']
    },
    // 15: Gastronomía Tradicional
    '15-gastronomia': {
      collection: 'gastronomy',
      title: 'Gastronomía Ancestral',
      singular: 'Platillo / Comedero',
      icon: 'fa-utensils',
      hasImage: true,
      fields: ['name', 'department', 'category', 'ingredients', 'description', 'status']
    },
    // 16: Historia Soberana
    '16-historia': {
      collection: 'history_timeline',
      title: 'Historia & Cronología',
      singular: 'Hito Histórico',
      icon: 'fa-scroll',
      hasImage: true,
      fields: ['title', 'yearRange', 'category', 'description', 'status']
    },
    // 17: Cultura & Patrimonio Sonoro
    '17-cultura': {
      collection: 'cultural_items',
      title: 'Cultura & Patrimonio Sonoro',
      singular: 'Elemento Cultural',
      icon: 'fa-guitar',
      hasImage: true,
      fields: ['title', 'type', 'department', 'audioUrl', 'description', 'status']
    },
    // 18: Sostenibilidad & Huella Cero
    '18-sostenibilidad': {
      collection: 'sustainability_initiatives',
      title: 'Iniciativas de Sostenibilidad',
      singular: 'Iniciativa',
      icon: 'fa-seedling',
      hasImage: true,
      fields: ['title', 'department', 'impactMetric', 'description', 'status']
    },
    // 19: Campañas & Denuncias Ambientales
    '19-ambiental': {
      collection: 'environmental_reports',
      title: 'Denuncias & Campañas Ambientales',
      singular: 'Denuncia',
      icon: 'fa-leaf',
      fields: ['issueType', 'department', 'description', 'reportedAt', 'status']
    },
    // 20: Centro SOS de Emergencias
    '20-sos': {
      collection: 'sos_logs',
      title: 'Centro SOS de Emergencias',
      singular: 'Alerta SOS',
      icon: 'fa-tower-broadcast',
      fields: ['emergencyType', 'userUid', 'coordinates', 'platform', 'status', 'createdAt']
    },
    // 21: Biblioteca Multimedia (Storage)
    '21-multimedia': {
      isSystem: true,
      title: 'Biblioteca Multimedia (Cloud Storage)',
      icon: 'fa-photo-film'
    },
    // 22: Centro de Notificaciones
    '22-notificaciones': {
      collection: 'notifications',
      title: 'Notificaciones del Ecosistema',
      singular: 'Notificación',
      icon: 'fa-bullhorn',
      fields: ['title', 'message', 'targetPlatform', 'link', 'status']
    },
    // 23: BAQUEANO AI Admin
    '23-ai': {
      isSystem: true,
      title: 'BAQUEANO AI Admin & Guardrails',
      icon: 'fa-brain'
    },
    // 24: Website Builder por Bloques
    '24-builder': {
      isSystem: true,
      title: 'Website Builder por Bloques',
      icon: 'fa-cubes'
    },
    // 25: Android Monitor
    '25-android': {
      isSystem: true,
      title: 'Android Monitor & Telemetría APK',
      icon: 'fa-brands fa-android'
    },
    // 26: Analítica Web vs Android
    '26-analitica': {
      isSystem: true,
      title: 'Analítica Web vs Android',
      icon: 'fa-chart-line'
    },
    // 27: Registro Inmutable de Auditoría
    '27-auditoria': {
      isSystem: true,
      title: 'Registro Inmutable de Auditoría',
      icon: 'fa-file-shield'
    },
    // 28: Seguridad & RBAC
    '28-seguridad': {
      isSystem: true,
      title: 'Seguridad & Políticas RBAC',
      icon: 'fa-shield-halved'
    },
    // 29: Fuentes Oficiales
    '29-fuentes': {
      collection: 'official_sources',
      title: 'Fuentes Oficiales Enlazadas',
      singular: 'Fuente Oficial',
      icon: 'fa-building-columns',
      fields: ['institutionName', 'acronym', 'website', 'description', 'status']
    },
    // 30: Legislación Turística & Ley 306
    '30-legislacion': {
      collection: 'legislation_articles',
      title: 'Legislación Turística & Ley 306',
      singular: 'Artículo de Ley',
      icon: 'fa-scale-balanced',
      fields: ['lawNumber', 'title', 'category', 'summary', 'status']
    },
    // 31: SEO Center & Metadatos
    '31-seo': {
      isSystem: true,
      title: 'SEO Center & OpenGraph',
      icon: 'fa-magnifying-glass-chart'
    },
    // 32: Configuración Global
    '32-configuracion': {
      isSystem: true,
      title: 'Configuración Global del Ecosistema',
      icon: 'fa-sliders'
    },
    // 33: Estado del Sistema & Salud de Infraestructura
    '33-estado': {
      isSystem: true,
      title: 'Estado del Sistema & Infraestructura',
      icon: 'fa-server'
    }
  };

  // --------------------------------------------------------------------------
  // 2. ESTADO GLOBAL REACTIVO (OPS STATE)
  // --------------------------------------------------------------------------
  const OpsState = {
    currentUser: null,
    currentRole: 'superAdmin',
    activeTab: '01-dashboard',
    activeFilterStatus: 'all',
    activeFilterCategory: 'all',
    activeFilterDepartment: 'all',
    activeSearchQuery: '',
    sidebarCollapsed: false,

    // CMS Universal de Páginas y Secciones
    activeBuilderPage: 'index',
    activeBuilderFilter: 'all',
    builderSearchQuery: '',
    pageSections: {},

    // Caché reactivo por colección
    collectionsData: {},
    selectedIds: new Set(),

    // Métricas en tiempo real
    metrics: {
      totalUsers: 0,
      totalDestinations: 0,
      publishedDestinations: 0,
      totalBusinesses: 0,
      pendingBusinesses: 0,
      verifiedBusinesses: 0,
      activeSosAlerts: 0,
      auditEventsCount: 0,
      lastUpdated: null
    },

    listeners: [],
    loadedTabs: new Set()
  };

  // --------------------------------------------------------------------------
  // 3. SISTEMA DE TOASTS FLOTANTES (CERO ALERT())
  // --------------------------------------------------------------------------
  const OpsToast = {
    show(message, type = 'success', duration = 3500) {
      let container = document.getElementById('opsToastContainer');
      if (!container) {
        container = document.createElement('div');
        container.id = 'opsToastContainer';
        container.className = 'ops-toast-container';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `ops-toast ${type}`;

      let iconClass = 'fa-circle-check';
      if (type === 'error') iconClass = 'fa-circle-xmark';
      if (type === 'warning') iconClass = 'fa-triangle-exclamation';
      if (type === 'info') iconClass = 'fa-circle-info';

      toast.innerHTML = `
        <i class="fa-solid ${iconClass} ops-toast-icon"></i>
        <div class="ops-toast-body">${message}</div>
        <button class="ops-toast-close" title="Cerrar"><i class="fa-solid fa-xmark"></i></button>
      `;

      const closeBtn = toast.querySelector('.ops-toast-close');
      const removeToast = () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 250);
      };

      if (closeBtn) closeBtn.addEventListener('click', removeToast);
      setTimeout(removeToast, duration);
      container.appendChild(toast);
    }
  };

  // --------------------------------------------------------------------------
  // 4. MODAL DE CONFIRMACIÓN REFORZADA (CERO PROMPT() NI CONFIRM())
  // --------------------------------------------------------------------------
  const OpsDialog = {
    confirm({ title = '¿Confirmar acción?', message = 'Esta acción impactará los registros del sistema.', isDangerous = false, confirmText = 'Confirmar', cancelText = 'Cancelar' }) {
      return new Promise((resolve) => {
        const modal = document.getElementById('opsConfirmModal');
        const titleEl = document.getElementById('opsConfirmTitle');
        const descEl = document.getElementById('opsConfirmDesc');
        const okBtn = document.getElementById('opsConfirmOkBtn');
        const cancelBtn = document.getElementById('opsConfirmCancelBtn');

        if (!modal || !titleEl || !descEl || !okBtn || !cancelBtn) {
          resolve(window.confirm(`${title}\n\n${message}`));
          return;
        }

        titleEl.textContent = title;
        descEl.textContent = message;
        okBtn.textContent = confirmText;
        cancelBtn.textContent = cancelText;

        if (isDangerous) {
          okBtn.className = 'btn-ops-matte danger';
        } else {
          okBtn.className = 'btn-ops-matte primary';
        }

        modal.classList.add('is-open');

        const cleanup = () => {
          modal.classList.remove('is-open');
          okBtn.removeEventListener('click', onOk);
          cancelBtn.removeEventListener('click', onCancel);
        };

        const onOk = () => {
          cleanup();
          resolve(true);
        };

        const onCancel = () => {
          cleanup();
          resolve(false);
        };

        okBtn.addEventListener('click', onOk);
        cancelBtn.addEventListener('click', onCancel);
      });
    }
  };

  // --------------------------------------------------------------------------
  // 5. GESTOR DE FIREBASE STORAGE (OPS STORAGE)
  // --------------------------------------------------------------------------
  const OpsStorage = {
    getStorage() {
      return window.firebase && window.firebase.storage ? window.firebase.storage() : null;
    },

    async uploadFile(file, folder = 'destinations', onProgress = null) {
      const storage = this.getStorage();
      if (!storage) {
        throw new Error('Firebase Storage no está disponible en este momento.');
      }

      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${sanitizedName}`;
      const path = `${folder}/${filename}`;
      const storageRef = storage.ref(path);

      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: OpsState.currentUser?.email || 'admin',
          uploadedAt: new Date().toISOString()
        }
      };

      const uploadTask = storageRef.put(file, metadata);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (typeof onProgress === 'function') onProgress(progress);
          },
          (error) => {
            console.error('[OpsStorage] Error de carga:', error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
              resolve({ downloadURL, path, filename });
            } catch (urlErr) {
              reject(urlErr);
            }
          }
        );
      });
    },

    async deleteFileByUrl(fileUrl) {
      const storage = this.getStorage();
      if (!storage || !fileUrl) return;

      try {
        const ref = storage.refFromURL(fileUrl);
        await ref.delete();
        console.info('[OpsStorage] Archivo eliminado con éxito de Storage:', fileUrl);
      } catch (err) {
        console.warn('[OpsStorage] No fue posible eliminar archivo de Storage:', err.message);
      }
    }
  };

  // --------------------------------------------------------------------------
  // 6. SEGURIDAD & AUTENTICACIÓN ADMIN (OPS AUTH)
  // --------------------------------------------------------------------------
  const OpsAuth = {
    authorizedAdmins: [
      'oscarelieser.informatica.inatec@gmail.com',
      'byoscarelieser@gmail.com',
      'vigoronmixt@gmail.com'
    ],

    init() {
      if (!window.firebase || !window.firebase.auth) {
        console.warn('[OpsAuth] Firebase Auth no está disponible.');
        return;
      }

      window.firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          this.handleAuthenticatedUser(user);
        } else {
          this.handleSignedOutUser();
        }
      });

      this.bindAuthButtons();
    },

    bindAuthButtons() {
      const googleBtn = document.getElementById('btnGoogleLogin');
      const logoutBtn = document.getElementById('btnLogoutAdmin');

      if (googleBtn) {
        googleBtn.addEventListener('click', () => this.loginWithGoogle());
      }
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => this.logout());
      }
    },

    async loginWithGoogle() {
      const feedbackEl = document.getElementById('loginFeedback');
      if (feedbackEl) {
        feedbackEl.className = 'login-feedback-alert success';
        feedbackEl.style.display = 'flex';
        feedbackEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Conectando de forma segura con Google...';
      }

      try {
        const provider = new window.firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        await window.firebase.auth().signInWithPopup(provider);
      } catch (error) {
        console.error('[OpsAuth] Error en login:', error);
        if (feedbackEl) {
          feedbackEl.className = 'login-feedback-alert error';
          feedbackEl.style.display = 'flex';
          feedbackEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Error de autenticación: ${error.message}`;
        }
      }
    },

    handleAuthenticatedUser(user) {
      const email = (user.email || '').toLowerCase().trim();
      const isAuthorized = this.authorizedAdmins.some((adminEmail) => adminEmail.toLowerCase() === email);

      if (!isAuthorized) {
        console.warn(`[OpsAuth] Acceso denegado a usuario no autorizado: ${email}`);
        window.firebase.auth().signOut();
        const feedbackEl = document.getElementById('loginFeedback');
        if (feedbackEl) {
          feedbackEl.className = 'login-feedback-alert error';
          feedbackEl.style.display = 'flex';
          feedbackEl.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:0.4rem;text-align:left;">
              <div><i class="fa-solid fa-lock"></i> <strong>Acceso Restringido</strong></div>
              <div style="font-size:0.82rem;color:var(--ops-text-secondary);">
                La cuenta <code>${email}</code> no cuenta con privilegios administrativos en el Ops Center.
              </div>
            </div>`;
        }
        OpsUI.showLoginGate();
        return;
      }

      let cachedAvatar = '';
      try {
        const stored = localStorage.getItem('baqueano_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.avatar || parsed.photoURL)) {
            cachedAvatar = parsed.avatar || parsed.photoURL;
          }
        }
      } catch (_) {}

      const resolvedPhoto = user.photoURL ||
        (Array.isArray(user.providerData) && user.providerData.find((p) => p && p.photoURL)?.photoURL) ||
        cachedAvatar ||
        '';

      OpsState.currentUser = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        photoURL: resolvedPhoto,
        role: 'superAdmin'
      };

      OpsUI.updateUserProfileUI(OpsState.currentUser);
      OpsUI.hideLoginGate();
      OpsCMS.initDataSync();

      // Enriquecimiento de perfil desde Firestore
      try {
        const db = OpsCMS.getDb();
        if (db && user.uid) {
          db.collection('usuarios').doc(user.uid).get().then((doc) => {
            if (doc.exists) {
              const uData = doc.data();
              const fsPhoto = uData.photoURL || uData.avatar || uData.foto;
              if (fsPhoto && fsPhoto !== OpsState.currentUser.photoURL) {
                OpsState.currentUser.photoURL = fsPhoto;
                OpsUI.updateUserProfileUI(OpsState.currentUser);
              }
            }
          }).catch(() => {});
        }
      } catch (_) {}

      // Registro de inicio de sesión en auditoría
      OpsCMS.logAuditEvent({
        action: 'ADMIN_SESSION_STARTED',
        module: 'Seguridad',
        description: `Inicio de sesión verificado para ${user.email}`,
        status: 'success'
      });
    },

    handleSignedOutUser() {
      OpsState.currentUser = null;
      OpsCMS.stopAllListeners();
      const avatarEl = document.getElementById('opsTopUserAvatar');
      if (avatarEl) avatarEl.textContent = 'AD';
      OpsUI.showLoginGate();
    },

    async logout() {
      if (window.firebase && window.firebase.auth) {
        await window.firebase.auth().signOut();
      }
      OpsState.currentUser = null;
      sessionStorage.removeItem('baqueano_active_user');
      OpsUI.showLoginGate();
    }
  };

  // --------------------------------------------------------------------------
  // 7. MOTOR CMS UNIVERSAL (OPS CMS)
  // --------------------------------------------------------------------------
  const OpsCMS = {
    getDb() {
      return window.firebase && window.firebase.firestore ? window.firebase.firestore() : null;
    },

    initDataSync() {
      const db = this.getDb();
      if (!db) return;

      // Iniciar listeners para los módulos base de telemetría y catálogo
      this.listenToCollection('03-destinos');
      this.listenToCollection('08-negocios');
      this.listenToCollection('20-sos');
      this.listenToAuditLogs();
      this.listenToAppConfig();
    },

    stopAllListeners() {
      OpsState.listeners.forEach((unsub) => {
        if (typeof unsub === 'function') unsub();
      });
      OpsState.listeners = [];
    },

    // 7.1 Listener Dinámico por Entidad
    listenToCollection(tabId) {
      const config = ENTITY_REGISTRY[tabId];
      if (!config || !config.collection) return;

      const db = this.getDb();
      if (!db) return;

      const unsub = db.collection(config.collection).onSnapshot(
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));

          OpsState.collectionsData[tabId] = items;
          OpsState.loadedTabs.add(tabId);

          // Actualizar métricas globales
          if (tabId === '03-destinos') {
            OpsState.metrics.totalDestinations = snapshot.size;
            OpsState.metrics.publishedDestinations = items.filter((d) => d.status === 'published').length;
          }
          if (tabId === '08-negocios') {
            OpsState.metrics.totalBusinesses = snapshot.size;
            OpsState.metrics.pendingBusinesses = items.filter((b) => b.status === 'pending_review' || b.status === 'pending').length;
            OpsState.metrics.verifiedBusinesses = items.filter((b) => b.verified === true || b.verificationStatus === 'verified').length;
            OpsUI.updateBadge('badgePendingBiz', OpsState.metrics.pendingBusinesses);
          }
          if (tabId === '20-sos') {
            OpsState.metrics.activeSosAlerts = items.filter((s) => s.status === 'active').length;
            OpsUI.updateBadge('badgeActiveSos', OpsState.metrics.activeSosAlerts, OpsState.metrics.activeSosAlerts > 0 ? 'alert' : 'neutral');
          }

          OpsUI.renderDashboardMetrics();
          OpsUI.renderEntityView(tabId);
        },
        (error) => {
          console.error(`[OpsCMS] Error escuchando colección ${config.collection}:`, error);
        }
      );

      OpsState.listeners.push(unsub);
    },

    // 7.2 Auditoría Inmutable
    listenToAuditLogs() {
      const db = this.getDb();
      if (!db) return;

      const unsub = db.collection('audit_logs')
        .orderBy('timestamp', 'desc')
        .limit(40)
        .onSnapshot(
          (snapshot) => {
            const logs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            OpsState.collectionsData['27-auditoria'] = logs;
            OpsState.metrics.auditEventsCount = snapshot.size;
            OpsUI.renderAuditFeed();
          },
          (error) => console.warn('[OpsCMS] Listener audit_logs:', error.message)
        );
      OpsState.listeners.push(unsub);
    },

    listenToAppConfig() {
      const db = this.getDb();
      if (!db) return;

      const unsub = db.collection('app_config').doc('global').onSnapshot(
        (doc) => {
          if (doc.exists) {
            OpsState.appConfig = doc.data();
            const input = document.getElementById('cfgAnnouncementText');
            if (input && doc.data().announcementText) {
              input.value = doc.data().announcementText;
            }
          }
        },
        (error) => console.warn('[OpsCMS] Config global:', error.message)
      );
      OpsState.listeners.push(unsub);
    },

    async logAuditEvent(eventData) {
      const db = this.getDb();
      if (!db || !OpsState.currentUser) return;

      try {
        await db.collection('audit_logs').add({
          action: eventData.action || 'ADMIN_ACTION',
          module: eventData.module || 'Sistema',
          collection: eventData.collection || '',
          recordId: eventData.recordId || '',
          description: eventData.description || '',
          performedBy: OpsState.currentUser.email,
          performedByUid: OpsState.currentUser.uid,
          role: OpsState.currentUser.role || 'superAdmin',
          timestamp: new Date().toISOString(),
          status: eventData.status || 'success'
        });
      } catch (err) {
        console.warn('[OpsCMS] No se pudo escribir en audit_logs:', err.message);
      }
    },

    // 7.3 Guardado y Actualización Universal (con Dual-Write Atómico)
    async saveEntity(tabId, itemData) {
      const config = ENTITY_REGISTRY[tabId];
      if (!config || !config.collection) {
        throw new Error(`Módulo "${tabId}" no está configurado para persistencia.`);
      }

      const db = this.getDb();
      if (!db) throw new Error('Base de datos no conectada.');

      const isUpdate = Boolean(itemData.id);
      const entityId = itemData.id || `${config.singular.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      // Clonar payload limpio
      const payload = {
        ...itemData,
        id: entityId,
        updatedAt: new Date().toISOString(),
        updatedBy: OpsState.currentUser?.email || 'admin',
        version: (itemData.version || 0) + 1
      };

      if (!isUpdate) {
        payload.createdAt = new Date().toISOString();
        payload.createdBy = OpsState.currentUser?.email || 'admin';
        if (!payload.status) payload.status = 'published';
      }

      // Normalizar campos para compatibilidad con Android DestinationModel
      if (tabId === '03-destinos') {
        payload.name = payload.title || payload.name || 'Destino Sin Nombre';
        payload.title = payload.name;
        payload.priceUsd = parseFloat(payload.priceUsd) || 0;
        payload.priceNio = parseFloat(payload.priceNio) || (payload.priceUsd * 36.65);
        payload.rating = payload.rating || 5.0;
        payload.reviewsCount = payload.reviewsCount || 0;

        const lat = parseFloat(payload.latitude) || 12.1364;
        const lng = parseFloat(payload.longitude) || -86.2514;
        payload.coordinates = { lat, lng };
        payload.latitude = lat;
        payload.longitude = lng;
      }

      // Escritura atómica (Batch) si requiere sincronización dual
      const batch = db.batch();
      const primaryDocRef = db.collection(config.collection).doc(entityId);
      batch.set(primaryDocRef, payload, { merge: true });

      if (config.dualSyncCollection) {
        const secondaryDocRef = db.collection(config.dualSyncCollection).doc(entityId);
        batch.set(secondaryDocRef, payload, { merge: true });
      }

      await batch.commit();

      await this.logAuditEvent({
        action: isUpdate ? `${config.singular.toUpperCase()}_UPDATED` : `${config.singular.toUpperCase()}_CREATED`,
        module: config.title,
        collection: config.collection,
        recordId: entityId,
        description: `${isUpdate ? 'Actualizó' : 'Creó'} ${config.singular} "${payload.title || payload.name || entityId}"`,
        status: 'success'
      });

      return entityId;
    },

    // 7.4 Cambio de Estado Editorial (Publicar / Despublicar / Archivar)
    async updateStatus(tabId, entityId, newStatus) {
      const config = ENTITY_REGISTRY[tabId];
      if (!config || !config.collection) return;

      const db = this.getDb();
      if (!db) return;

      const updatePayload = {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: OpsState.currentUser?.email || 'admin'
      };

      const batch = db.batch();
      batch.update(db.collection(config.collection).doc(entityId), updatePayload);

      if (config.dualSyncCollection) {
        batch.update(db.collection(config.dualSyncCollection).doc(entityId), updatePayload);
      }

      await batch.commit();

      OpsToast.show(`Estado actualizado a "${newStatus}"`, 'success');
      await this.logAuditEvent({
        action: 'STATUS_CHANGED',
        module: config.title,
        collection: config.collection,
        recordId: entityId,
        description: `Cambió estado de ${entityId} a "${newStatus}"`,
        status: 'success'
      });
    },

    // 7.5 Eliminación Lógica (Papelera) & Restauración
    async setTrashed(tabId, entityId, trashed = true) {
      const newStatus = trashed ? 'trashed' : 'draft';
      const config = ENTITY_REGISTRY[tabId];
      if (!config) return;

      const db = this.getDb();
      if (!db) return;

      const updatePayload = {
        status: newStatus,
        deletedAt: trashed ? new Date().toISOString() : null,
        deletedBy: trashed ? (OpsState.currentUser?.email || 'admin') : null,
        updatedAt: new Date().toISOString()
      };

      const batch = db.batch();
      batch.update(db.collection(config.collection).doc(entityId), updatePayload);
      if (config.dualSyncCollection) {
        batch.update(db.collection(config.dualSyncCollection).doc(entityId), updatePayload);
      }
      await batch.commit();

      OpsToast.show(trashed ? 'Registro enviado a la papelera.' : 'Registro restaurado exitosamente.', trashed ? 'warning' : 'success');
      await this.logAuditEvent({
        action: trashed ? 'SENT_TO_TRASH' : 'RESTORED_FROM_TRASH',
        module: config.title,
        collection: config.collection,
        recordId: entityId,
        description: `${trashed ? 'Envió a la papelera' : 'Restauró'} el registro ${entityId}`,
        status: 'success'
      });
    },

    // 7.6 Eliminación Definitiva (Hard Delete - Exclusivo SuperAdmin)
    async hardDelete(tabId, entityId) {
      const config = ENTITY_REGISTRY[tabId];
      if (!config) return;

      const db = this.getDb();
      if (!db) return;

      const batch = db.batch();
      batch.delete(db.collection(config.collection).doc(entityId));
      if (config.dualSyncCollection) {
        batch.delete(db.collection(config.dualSyncCollection).doc(entityId));
      }
      await batch.commit();

      OpsToast.show('Registro eliminado permanentemente de la base de datos.', 'info');
      await this.logAuditEvent({
        action: 'PERMANENTLY_DELETED',
        module: config.title,
        collection: config.collection,
        recordId: entityId,
        description: `Eliminación física permanente del registro ${entityId}`,
        status: 'warning'
      });
    },

    // 7.7 Duplicar Registro
    async duplicate(tabId, entityId) {
      const config = ENTITY_REGISTRY[tabId];
      const items = OpsState.collectionsData[tabId] || [];
      const item = items.find((x) => x.id === entityId);
      if (!item) return;

      const clone = { ...item };
      delete clone.id;
      clone.title = `${clone.title || clone.name || 'Registro'} (Copia)`;
      if (clone.name) clone.name = clone.title;
      clone.status = 'draft';
      clone.slug = `${clone.slug || 'item'}-copia-${Date.now()}`;

      await this.saveEntity(tabId, clone);
      OpsToast.show('Registro duplicado en modo borrador.', 'success');
    },

    // 7.8 Acciones Masivas
    async executeBulkAction(tabId, action, ids) {
      if (!ids || ids.length === 0) return;

      const confirmed = await OpsDialog.confirm({
        title: `¿Aplicar acción a ${ids.length} registros?`,
        message: `Se aplicará la acción "${action}" sobre todos los elementos seleccionados.`,
        isDangerous: action === 'hard_delete' || action === 'trash'
      });

      if (!confirmed) return;

      for (const id of ids) {
        if (action === 'publish') await this.updateStatus(tabId, id, 'published');
        if (action === 'draft') await this.updateStatus(tabId, id, 'draft');
        if (action === 'archive') await this.updateStatus(tabId, id, 'archived');
        if (action === 'trash') await this.setTrashed(tabId, id, true);
        if (action === 'restore') await this.setTrashed(tabId, id, false);
        if (action === 'hard_delete') await this.hardDelete(tabId, id);
      }

      OpsState.selectedIds.clear();
      OpsUI.updateBulkBar();
      OpsToast.show(`Acción masiva completada para ${ids.length} registros.`, 'success');
    },

    // 7.9 Migración Progresiva & Poblado Inicial Canónico
    async seedInitialContent() {
      const db = this.getDb();
      if (!db) throw new Error('Base de datos no conectada.');

      OpsToast.show('Iniciando sincronización canónica hacia Cloud Firestore...', 'info');

      // 1. Sembrar Negocios / Cooperativas Aliadas
      const seedBusinesses = [
        {
          id: 'biz_somoto_guias',
          name: 'Coop. Guías Comunitarios del Cañón de Somoto',
          title: 'Coop. Guías Comunitarios del Cañón de Somoto',
          department: 'Madriz',
          municipality: 'Somoto',
          category: 'cooperativas',
          verified: true,
          verificationStatus: 'verified',
          verifiedBy: OpsState.currentUser?.email || 'admin',
          verifiedAt: new Date().toISOString(),
          verificationNotes: 'Certificada por el INTUR y acreditada en campo por BAQUEANO Nicaragua.',
          phone: '+505 8443-1289',
          whatsapp: '+505 8443-1289',
          imageUrl: 'assets/images/destinos/canon_de_somoto.jpg',
          description: '32 familias campesinas de Sonís y El Guayabo. Ofrecen recorridos acuáticos seguros con chalecos certificados, lanchas y hospedaje rural familiar con rosquillas calientes.',
          status: 'published',
          subscriptionStatus: 'active',
          subscriptionType: 'Comunitaria Campesina',
          subscriptionStart: '2026-01-01',
          subscriptionEnd: '2026-12-31'
        },
        {
          id: 'biz_abuela_apoyo',
          name: 'Posada Ecológica La Abuela',
          title: 'Posada Ecológica La Abuela',
          department: 'Masaya',
          municipality: 'Laguna de Apoyo',
          category: 'hospedajes',
          verified: true,
          verificationStatus: 'verified',
          verifiedBy: OpsState.currentUser?.email || 'admin',
          verifiedAt: new Date().toISOString(),
          verificationNotes: 'Posada con normas ecológicas de cero emisiones de hidrocarburos en la laguna.',
          phone: '+505 8888-1234',
          whatsapp: '+505 8888-1234',
          imageUrl: 'assets/images/aliados/posada_ecologica_la_abuela.jpg',
          description: 'Pioneros en bioconstrucción en la ladera del cráter volcánico. Cabañas de madera reforestada, kayaks limpios y gastronomía tradicional.',
          status: 'published',
          subscriptionStatus: 'active',
          subscriptionType: 'Ecológica Anual',
          subscriptionStart: '2026-01-01',
          subscriptionEnd: '2026-12-31'
        },
        {
          id: 'biz_magdalena_ometepe',
          name: 'Finca Magdalena & Cooperativa Carlos Díaz Cajina',
          title: 'Finca Magdalena & Cooperativa Carlos Díaz Cajina',
          department: 'Rivas',
          municipality: 'Altagracia, Ometepe',
          category: 'fincas',
          verified: true,
          verificationStatus: 'verified',
          verifiedBy: OpsState.currentUser?.email || 'admin',
          verifiedAt: new Date().toISOString(),
          verificationNotes: 'Cooperativa agroecológica comunitaria histórica en las faldas del Volcán Maderas.',
          phone: '+505 8443-1289',
          whatsapp: '+505 8443-1289',
          imageUrl: 'assets/images/destinos/finca_magdalena.jpg',
          description: '24 socios campesinos fundaron esta cooperativa en 1983. Cultivan café orgánico bajo sombra en las faldas del Volcán Maderas.',
          status: 'published',
          subscriptionStatus: 'active',
          subscriptionType: 'Comunitaria Campesina',
          subscriptionStart: '2026-01-01',
          subscriptionEnd: '2026-12-31'
        },
        {
          id: 'biz_selva_negra',
          name: 'Eco-Reserva Selva Negra Matagalpa',
          title: 'Eco-Reserva Selva Negra Matagalpa',
          department: 'Matagalpa',
          municipality: 'Matagalpa',
          category: 'hospedajes',
          verified: true,
          verificationStatus: 'verified',
          verifiedBy: OpsState.currentUser?.email || 'admin',
          verifiedAt: new Date().toISOString(),
          verificationNotes: 'Referente nacional de conservación de bosque nuboso y huella de carbono neutral.',
          phone: '+505 2772-3888',
          whatsapp: '+505 8443-1289',
          imageUrl: 'assets/images/destinos/selva_negra.jpg',
          description: 'Santuario de conservación de nebliselva tropical. Caficultura orgánica regenerativa y generación de biogás para autosuficiencia energética.',
          status: 'published',
          subscriptionStatus: 'active',
          subscriptionType: 'Empresarial Sostenible',
          subscriptionStart: '2026-01-01',
          subscriptionEnd: '2026-12-31'
        },
        {
          id: 'biz_maribios_leon',
          name: 'Guías Comunitarios Los Maribios',
          title: 'Guías Comunitarios Los Maribios',
          department: 'León',
          municipality: 'León',
          category: 'guias',
          verified: true,
          verificationStatus: 'verified',
          verifiedBy: OpsState.currentUser?.email || 'admin',
          verifiedAt: new Date().toISOString(),
          verificationNotes: 'Jóvenes baqueanos campesinos de Malpaisillo capacitados en socorrismo y sandboarding.',
          phone: '+505 8443-1289',
          whatsapp: '+505 8443-1289',
          imageUrl: 'assets/images/destinos/cerro_negro.jpg',
          description: 'Asociación de jóvenes campesinos de Malpaisillo capacitados en vulcanología, primeros auxilios y volcano sandboarding seguro.',
          status: 'published',
          subscriptionStatus: 'active',
          subscriptionType: 'Comunitaria Campesina',
          subscriptionStart: '2026-01-01',
          subscriptionEnd: '2026-12-31'
        }
      ];

      // 2. Sembrar Gastronomía Ancestral
      const seedDishes = [
        {
          id: 'gastro_gallo_pinto',
          title: 'Gallo Pinto Campesino',
          name: 'Gallo Pinto Campesino',
          department: 'Nacional',
          category: 'desayunos',
          imageUrl: 'assets/images/comida/gallo_pinto.jpg',
          dayPass: 'Arroz, frijol rojo criollo, cebolla picada y chiltoma frita en manteca.',
          description: 'El corazón de la mesa nicaragüense. Preparado con frijol cocido del día anterior y frito hasta dorar. Se acompaña de queso frito, maduro frito y tortilla caliente de maíz blanco.',
          status: 'published'
        },
        {
          id: 'gastro_nacatamal',
          title: 'Nacatamal de Domingo',
          name: 'Nacatamal de Domingo',
          department: 'Nacional',
          category: 'tradicional',
          imageUrl: 'assets/images/comida/nacatamal.jpg',
          dayPass: 'Masa de maíz nixtamalizado, cerdo marinado en naranja agria y hojas de plátano.',
          description: 'Monumental banquete envuelto en hojas de chagüite. Relleno de tocino, papa, arroz, tomate, hierbabuena, pasas y chile congo. Cocido a fuego lento durante 5 horas.',
          status: 'published'
        },
        {
          id: 'gastro_vigoron',
          title: 'Vigorón Granadino',
          name: 'Vigorón Granadino',
          department: 'Granada',
          category: 'antojitos',
          imageUrl: 'assets/images/comida/vigoron.jpg',
          dayPass: 'Yuca cocida harinosa, chicharrón crujiente con carne y ensalada de repollo.',
          description: 'Nacido bajo los laureles de la Plaza Central de Granada. Servido tradicionalmente sobre hoja de plátano fresca, aderezado con vinagre de guineo y muserola de mimbro.',
          status: 'published'
        },
        {
          id: 'gastro_quesillo',
          title: 'Quesillo Chontaleño y de Nagarote',
          name: 'Quesillo Chontaleño y de Nagarote',
          department: 'León',
          category: 'lacteos',
          imageUrl: 'assets/images/comida/quesillo.jpg',
          dayPass: 'Queso tierno elástico, tortilla caliente, cebollita en vinagre negro y crema espesa.',
          description: 'Manjar artesanal servido envuelto en papel plástico o chimbomba. Una explosión láctea de la cuenca ganadera de Chontales y el Pacífico occidental.',
          status: 'published'
        },
        {
          id: 'gastro_baho',
          title: 'Baho Criollo',
          name: 'Baho Criollo',
          department: 'Masaya',
          category: 'almuerzos',
          imageUrl: 'assets/images/comida/baho.jpg',
          dayPass: 'Carne de res cecina curada al sol, plátano verde, plátano maduro y yuca al vapor.',
          description: 'Cocinado al vapor durante la noche entera en una olla sellada con hojas de plátano. La carne se deshace al toque y el maduro aporta una dulzura acaramelada inigualable.',
          status: 'published'
        },
        {
          id: 'gastro_indio_viejo',
          title: 'Indio Viejo Ancestral',
          name: 'Indio Viejo Ancestral',
          department: 'Nacional',
          category: 'ancestral',
          imageUrl: 'assets/images/comida/indio_viejo.jpg',
          dayPass: 'Masa de maíz desmoronada, carne de res mechada, hierbabuena fresca y achiote.',
          description: 'Uno de los guisos prehispánicos más antiguos de América Latina. Su textura cremosa aromatizada con naranja agria y hierbabuena es símbolo de fiesta patronal campesina.',
          status: 'published'
        }
      ];

      // 3. Sembrar Historia de Nicaragua
      const seedHistory = [
        {
          id: 'hist_01_prehispanica',
          title: 'Pueblos Originarios & Cosmovisión del Xolotlán',
          name: 'Pueblos Originarios & Cosmovisión del Xolotlán',
          department: 'Época Prehispánica (~8,000 a.C. - 1502 d.C.)',
          category: 'prehispanica',
          sortOrder: 1,
          description: 'Asentamientos Chorotegas, Nicaraos, Maribios, Matagalpas, Miskitos y Mayangnas que veneraban el agua, los volcanes sagrados y cultivaban el maíz como génesis divina.',
          status: 'published'
        },
        {
          id: 'hist_02_resistencia',
          title: 'Resistencia Indígena: El Encuentro y Diriangén',
          name: 'Resistencia Indígena: El Encuentro y Diriangén',
          department: 'Siglo XVI (1523 - 1524)',
          category: 'resistencia',
          sortOrder: 2,
          description: 'El Cacique Nicarao dialoga filosóficamente con Gil González Dávila, mientras el gran jefe Diriangén organiza la primera insurrección armada en defensa de la soberanía de estas tierras.',
          status: 'published'
        },
        {
          id: 'hist_03_colonial',
          title: 'Periodo Colonial: Fundación de Ciudades & El Güegüense',
          name: 'Periodo Colonial: Fundación de Ciudades & El Güegüense',
          department: 'Periodo Colonial (1524 - 1821)',
          category: 'colonial',
          sortOrder: 3,
          description: 'Francisco Hernández de Córdoba funda Santiago de los Caballeros de León y Granada. Surge el mestizaje arquitectónico, el habla popular pinolera y la inmortal comedia bailete de protesta popular: El Güegüense.',
          status: 'published'
        },
        {
          id: 'hist_04_independencia',
          title: 'Independencia de Centroamérica (1821)',
          name: 'Independencia de Centroamérica (1821)',
          department: 'Independencia (1821)',
          category: 'independencia',
          sortOrder: 4,
          description: 'El 15 de septiembre de 1821 se proclama el Acta de Independencia de Centroamérica. Nicaragua inicia su senda como nación soberana, defendiendo su autodeterminación territorial.',
          status: 'published'
        },
        {
          id: 'hist_05_san_jacinto',
          title: 'Guerra Nacional & La Pedrada de Andrés Castro (1856)',
          name: 'Guerra Nacional & La Pedrada de Andrés Castro (1856)',
          department: 'Guerra Nacional (1856)',
          category: 'guerra_nacional',
          sortOrder: 5,
          description: 'Frente a la invasión del filibustero William Walker que pretendía esclavizar Centroamérica, el pueblo se levanta en la gloriosa Batalla de San Jacinto (14 de septiembre de 1856). Andrés Castro derriba al invasor de una certera pedrada.',
          status: 'published'
        },
        {
          id: 'hist_06_sandino',
          title: 'General de Hombres Libres: Augusto C. Sandino (1927 - 1934)',
          name: 'General de Hombres Libres: Augusto C. Sandino (1927 - 1934)',
          department: 'Siglo XX (1927 - 1934)',
          category: 'sandino',
          sortOrder: 6,
          description: 'Desde las montañas de Las Segovias, Sandino y su Ejército Defensor de la Soberanía Nacional expulsan a las tropas de ocupación extranjera con tácticas de guerrilla comunitaria y cooperativismo agrícola sobre el Río Coco.',
          status: 'published'
        },
        {
          id: 'hist_07_resiliencia',
          title: 'Resiliencia & Soberanía Territorial Contemporánea',
          name: 'Resiliencia & Soberanía Territorial Contemporánea',
          department: 'Época Contemporánea (1979 - Presente)',
          category: 'contemporanea',
          sortOrder: 7,
          description: 'Nicaragua se erige como una nación digna y amante de la paz, proyectando su ecoturismo comunitario, la protección de sus reservas de biosfera (Bosawás, Río San Juan, Ometepe) y el protagonismo del campesinado rural.',
          status: 'published'
        }
      ];

      // 0. Sembrar Destinos Turísticos Insignia (dualSync en destinations y places)
      const seedDestinations = [
        {
          id: 'dest_somoto',
          title: 'Cañón de Somoto',
          name: 'Cañón de Somoto',
          slug: 'canon-de-somoto',
          category: 'canon',
          department: 'Madriz',
          municipality: 'Somoto',
          difficulty: 'Moderada',
          priceNio: 650,
          priceUsd: 18,
          imageUrl: 'assets/images/destinos/canon_de_somoto.jpg',
          description: 'Monumento Nacional con paredes de roca de casi 150 metros de altura que encajonan las aguas cristalinas del Río Coco. Recorrido guiado por baqueanos campesinos con lanchas y chalecos.',
          status: 'published',
          featured: true,
          latitude: 13.4833,
          longitude: -86.5833
        },
        {
          id: 'dest_cerro_negro',
          title: 'Volcán Cerro Negro',
          name: 'Volcán Cerro Negro',
          slug: 'volcan-cerro-negro',
          category: 'volcan',
          department: 'León',
          municipality: 'León',
          difficulty: 'Alta',
          priceNio: 1100,
          priceUsd: 30,
          imageUrl: 'assets/images/destinos/cerro_negro.jpg',
          description: 'El volcán más joven de Centroamérica, nacido en 1850. Famoso en todo el mundo por la experiencia de volcano sandboarding sobre sus laderas de arena volcánica negra azabache.',
          status: 'published',
          featured: true,
          latitude: 12.5064,
          longitude: -86.7028
        },
        {
          id: 'dest_ometepe',
          title: 'Isla de Ometepe (Volcán Concepción & Maderas)',
          name: 'Isla de Ometepe',
          slug: 'isla-de-ometepe',
          category: 'isla',
          department: 'Rivas',
          municipality: 'Altagracia / Moyogalpa',
          difficulty: 'Moderada',
          priceNio: 920,
          priceUsd: 25,
          imageUrl: 'assets/images/destinos/finca_magdalena.jpg',
          description: 'Reserva de Biosfera mundial en el Gran Lago Cocibolca formada por dos colosos volcánicos: el activo Concepción y el Maderas con su laguna cratérica de nebliselva.',
          status: 'published',
          featured: true,
          latitude: 11.5386,
          longitude: -85.5908
        },
        {
          id: 'dest_masaya',
          title: 'Volcán Masaya (Popogatepe)',
          name: 'Volcán Masaya',
          slug: 'volcan-masaya',
          category: 'volcan',
          department: 'Masaya',
          municipality: 'Nindirí / Masaya',
          difficulty: 'Baja',
          priceNio: 550,
          priceUsd: 15,
          imageUrl: 'assets/images/heroes/hero-bg.jpg',
          description: 'Parque Nacional con el cráter activo Santiago donde se puede contemplar el lago de lava incandescente al caer el atardecer, rodeado de senderos de lava solidificada.',
          status: 'published',
          featured: true,
          latitude: 11.9844,
          longitude: -86.1608
        },
        {
          id: 'dest_apoyo',
          title: 'Laguna de Apoyo',
          name: 'Laguna de Apoyo',
          slug: 'laguna-de-apoyo',
          category: 'laguna',
          department: 'Masaya',
          municipality: 'Catarina / Diriá',
          difficulty: 'Baja',
          priceNio: 450,
          priceUsd: 12,
          imageUrl: 'assets/images/aliados/posada_ecologica_la_abuela.jpg',
          description: 'Cráter volcánico extinto con aguas termales y minerales de azul turquesa profundo, rodeado de un exuberante bosque seco tropical con monos congos y aves migratorias.',
          status: 'published',
          featured: true,
          latitude: 11.9222,
          longitude: -86.0333
        },
        {
          id: 'dest_miraflor',
          title: 'Reserva Natural Miraflor',
          name: 'Reserva Natural Miraflor',
          slug: 'reserva-miraflor',
          category: 'reserva',
          department: 'Estelí',
          municipality: 'Estelí',
          difficulty: 'Moderada',
          priceNio: 750,
          priceUsd: 20,
          imageUrl: 'assets/images/destinos/selva_negra.jpg',
          description: 'Paisaje protegido donde conviven tres zonas ecológicas: bosque seco, transición y nebliselva con más de 200 especies de orquídeas y hospedajes campesinos auténticos.',
          status: 'published',
          featured: true,
          latitude: 13.2333,
          longitude: -86.2500
        },
        {
          id: 'dest_corn_island',
          title: 'Islas del Maíz (Corn Island & Little Corn)',
          name: 'Corn Island',
          slug: 'corn-island',
          category: 'isla',
          department: 'RACCS',
          municipality: 'Corn Island',
          difficulty: 'Baja',
          priceNio: 1500,
          priceUsd: 40,
          imageUrl: 'assets/images/destinos/canon_de_somoto.jpg',
          description: 'Paraíso del Caribe nicaragüense con arrecifes de coral virgen, playas de arena blanca nacarada, cultura criolla y gastronomía a base de langosta y pan de coco.',
          status: 'published',
          featured: true,
          latitude: 12.1667,
          longitude: -83.0500
        },
        {
          id: 'dest_la_luna',
          title: 'Cascada La Luna',
          name: 'Cascada La Luna',
          slug: 'cascada-la-luna',
          category: 'cascada',
          department: 'Jinotega',
          municipality: 'El Cuá',
          difficulty: 'Baja',
          priceNio: 350,
          priceUsd: 10,
          imageUrl: 'assets/images/destinos/selva_negra.jpg',
          description: 'Impresionante caída de agua entre cafetales de altura en las montañas brumosas del norte, con poza cristalina para natación y senderismo ecológico.',
          status: 'published',
          featured: true,
          latitude: 13.3667,
          longitude: -85.7667
        },
        {
          id: 'dest_mombacho',
          title: 'Volcán Mombacho',
          name: 'Volcán Mombacho',
          slug: 'volcan-mombacho',
          category: 'volcan',
          department: 'Granada',
          municipality: 'Granada',
          difficulty: 'Moderada',
          priceNio: 800,
          priceUsd: 22,
          imageUrl: 'assets/images/destinos/cerro_negro.jpg',
          description: 'Reserva Natural con bosque nuboso perpetuo, fumarolas activas, túneles de neblina y miradores con vistas panorámicas hacia las 365 isletas de Granada.',
          status: 'published',
          featured: true,
          latitude: 11.8264,
          longitude: -85.9681
        },
        {
          id: 'dest_rio_san_juan',
          title: 'Río San Juan & Fortaleza El Castillo',
          name: 'Río San Juan',
          slug: 'rio-san-juan-el-castillo',
          category: 'rio',
          department: 'Río San Juan',
          municipality: 'El Castillo',
          difficulty: 'Moderada',
          priceNio: 1200,
          priceUsd: 32,
          imageUrl: 'assets/images/destinos/canon_de_somoto.jpg',
          description: 'Ruta fluvial histórica que conecta el Gran Lago con el Mar Caribe. Fortaleza colonial de la Inmaculada Concepción y selva tropical virgen.',
          status: 'published',
          featured: true,
          latitude: 11.0189,
          longitude: -84.3972
        }
      ];

      // Ejecución por lotes
      const batch = db.batch();

      seedDestinations.forEach((dest) => {
        batch.set(db.collection('destinations').doc(dest.id), dest, { merge: true });
        batch.set(db.collection('places').doc(dest.id), dest, { merge: true });
      });

      seedBusinesses.forEach((b) => {
        batch.set(db.collection('businesses').doc(b.id), b, { merge: true });
      });

      seedDishes.forEach((d) => {
        batch.set(db.collection('gastronomy').doc(d.id), d, { merge: true });
      });

      seedHistory.forEach((h) => {
        batch.set(db.collection('history_timeline').doc(h.id), h, { merge: true });
      });

      // Sembrar Secciones de las 12 Páginas en site_pages
      Object.keys(SITE_PAGES_REGISTRY).forEach((pId) => {
        const pData = SITE_PAGES_REGISTRY[pId];
        batch.set(db.collection('site_pages').doc(pId), {
          pageId: pId,
          title: pData.name,
          sections: pData.sections,
          updatedAt: new Date().toISOString(),
          updatedBy: OpsState.currentUser?.email || 'admin'
        }, { merge: true });
      });

      // Anuncio Global en app_config
      batch.set(db.collection('app_config').doc('global'), {
        announcementText: '¡BIENVENIDOS A BAQUEANO! Conectamos al viajero consciente con comunidades campesinas sin intermediarios.',
        updatedAt: new Date().toISOString(),
        updatedBy: OpsState.currentUser?.email || 'admin'
      }, { merge: true });

      await batch.commit();

      OpsToast.show('¡Catálogo Completo Sincronizado! Destinos, negocios, páginas e historia en vivo en Firestore.', 'success');
      await this.logAuditEvent({
        action: 'CANONICAL_SEED_COMPLETED',
        module: 'Sistema',
        description: 'Poblado integral canónico de destinos (destinations/places), negocios, site_pages, gastronomía e historia.',
        status: 'success'
      });
    },

    // 7.10 GESTIÓN UNIVERSAL DE SECCIONES DE PÁGINAS (SITE_PAGES)
    listenToPageSections(pageId) {
      const db = this.getDb();
      if (!db) return;

      const unsub = db.collection('site_pages').doc(pageId).onSnapshot(
        async (doc) => {
          if (!doc.exists) {
            const baseSections = SITE_PAGES_REGISTRY[pageId]?.sections || [];
            try {
              await db.collection('site_pages').doc(pageId).set({
                pageId: pageId,
                title: SITE_PAGES_REGISTRY[pageId]?.name || pageId,
                sections: baseSections,
                updatedAt: new Date().toISOString(),
                updatedBy: OpsState.currentUser?.email || 'sistema'
              }, { merge: true });
              OpsState.pageSections[pageId] = baseSections;
            } catch (_) {
              OpsState.pageSections[pageId] = baseSections;
            }
          } else {
            const data = doc.data();
            OpsState.pageSections[pageId] = data.sections || [];
          }

          if (OpsState.activeTab === '24-builder' || OpsState.activeTab === '02-contenido') {
            OpsUI.renderWebsiteBuilderModule(OpsState.activeTab);
          }
        },
        (err) => console.warn(`[OpsCMS] Error escuchando site_pages/${pageId}:`, err.message)
      );

      OpsState.listeners.push(unsub);
    },

    async savePageSection(pageId, sectionData) {
      const db = this.getDb();
      if (!db) throw new Error('Firestore no disponible');

      const pageDocRef = db.collection('site_pages').doc(pageId);
      const doc = await pageDocRef.get();
      let sections = [];
      if (doc.exists && doc.data().sections) {
        sections = [...doc.data().sections];
      } else {
        sections = [...(SITE_PAGES_REGISTRY[pageId]?.sections || [])];
      }

      if (sectionData.id) {
        const idx = sections.findIndex((s) => s.id === sectionData.id);
        if (idx >= 0) {
          sections[idx] = { ...sections[idx], ...sectionData };
        } else {
          sections.push(sectionData);
        }
      } else {
        sectionData.id = `sec_${pageId}_${Date.now()}`;
        sectionData.sortOrder = sections.length + 1;
        sections.push(sectionData);
      }

      sections.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

      await pageDocRef.set({
        pageId,
        sections,
        updatedAt: new Date().toISOString(),
        updatedBy: OpsState.currentUser?.email || 'admin'
      }, { merge: true });

      await this.logAuditEvent({
        action: 'PAGE_SECTION_SAVED',
        module: 'Website Builder',
        description: `Sección "${sectionData.name || sectionData.title}" guardada en ${pageId}.html`,
        status: 'success'
      });
    },

    async togglePageSectionStatus(pageId, sectionId) {
      const db = this.getDb();
      if (!db) return;

      const pageDocRef = db.collection('site_pages').doc(pageId);
      const doc = await pageDocRef.get();
      if (!doc.exists) return;

      let sections = doc.data().sections || [];
      const target = sections.find((s) => s.id === sectionId);
      if (!target) return;

      target.status = target.status === 'published' ? 'draft' : 'published';

      await pageDocRef.set({
        sections,
        updatedAt: new Date().toISOString(),
        updatedBy: OpsState.currentUser?.email || 'admin'
      }, { merge: true });

      OpsToast.show(`Sección "${target.name || target.title}" ahora está ${target.status === 'published' ? 'Publicada' : 'en Borrador / Oculta'}.`, 'success');
      await this.logAuditEvent({
        action: 'PAGE_SECTION_STATUS_TOGGLED',
        module: 'Website Builder',
        description: `Estado de "${target.name || target.title}" cambiado a ${target.status}`,
        status: 'success'
      });
    },

    async movePageSectionOrder(pageId, sectionId, direction) {
      const db = this.getDb();
      if (!db) return;

      const pageDocRef = db.collection('site_pages').doc(pageId);
      const doc = await pageDocRef.get();
      if (!doc.exists) return;

      let sections = [...(doc.data().sections || [])];
      sections.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

      const idx = sections.findIndex((s) => s.id === sectionId);
      if (idx < 0) return;

      if (direction === 'up' && idx > 0) {
        const prevOrder = sections[idx - 1].sortOrder || idx;
        sections[idx - 1].sortOrder = sections[idx].sortOrder || (idx + 1);
        sections[idx].sortOrder = prevOrder;
      } else if (direction === 'down' && idx < sections.length - 1) {
        const nextOrder = sections[idx + 1].sortOrder || (idx + 2);
        sections[idx + 1].sortOrder = sections[idx].sortOrder || (idx + 1);
        sections[idx].sortOrder = nextOrder;
      }

      sections.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

      await pageDocRef.set({
        sections,
        updatedAt: new Date().toISOString(),
        updatedBy: OpsState.currentUser?.email || 'admin'
      }, { merge: true });

      OpsToast.show('Orden de secciones actualizado.', 'info');
    },

    async trashPageSection(pageId, sectionId) {
      const db = this.getDb();
      if (!db) return;

      const pageDocRef = db.collection('site_pages').doc(pageId);
      const doc = await pageDocRef.get();
      if (!doc.exists) return;

      let sections = doc.data().sections || [];
      const target = sections.find((s) => s.id === sectionId);
      if (!target) return;

      target.status = 'trashed';

      await pageDocRef.set({
        sections,
        updatedAt: new Date().toISOString(),
        updatedBy: OpsState.currentUser?.email || 'admin'
      }, { merge: true });

      OpsToast.show(`Sección movida a la papelera.`, 'warning');
      await this.logAuditEvent({
        action: 'PAGE_SECTION_TRASHED',
        module: 'Website Builder',
        description: `Sección "${target.name || target.title}" movida a papelera`,
        status: 'success'
      });
    },

    async restorePageSection(pageId, sectionId) {
      const db = this.getDb();
      if (!db) return;

      const pageDocRef = db.collection('site_pages').doc(pageId);
      const doc = await pageDocRef.get();
      if (!doc.exists) return;

      let sections = doc.data().sections || [];
      const target = sections.find((s) => s.id === sectionId);
      if (!target) return;

      target.status = 'published';

      await pageDocRef.set({
        sections,
        updatedAt: new Date().toISOString(),
        updatedBy: OpsState.currentUser?.email || 'admin'
      }, { merge: true });

      OpsToast.show(`Sección restaurada y publicada en la web.`, 'success');
      await this.logAuditEvent({
        action: 'PAGE_SECTION_RESTORED',
        module: 'Website Builder',
        description: `Sección "${target.name || target.title}" restaurada a publicada`,
        status: 'success'
      });
    },

    async hardDeletePageSection(pageId, sectionId) {
      const confirmed = await OpsDialog.confirm({
        title: '¿Eliminar Sección Definitivamente?',
        message: 'Esta acción removerá la sección de forma permanente en Firestore sin posibilidad de recuperación.',
        isDangerous: true,
        confirmText: 'Eliminar Permanente'
      });
      if (!confirmed) return;

      const db = this.getDb();
      if (!db) return;

      const pageDocRef = db.collection('site_pages').doc(pageId);
      const doc = await pageDocRef.get();
      if (!doc.exists) return;

      let sections = (doc.data().sections || []).filter((s) => s.id !== sectionId);

      await pageDocRef.set({
        sections,
        updatedAt: new Date().toISOString(),
        updatedBy: OpsState.currentUser?.email || 'admin'
      }, { merge: true });

      OpsToast.show('Sección eliminada definitivamente.', 'success');
      await this.logAuditEvent({
        action: 'PAGE_SECTION_HARD_DELETED',
        module: 'Website Builder',
        description: `Sección eliminada permanentemente de ${pageId}.html`,
        status: 'danger'
      });
    },

    async resetPageSectionsToBaseline(pageId) {
      const confirmed = await OpsDialog.confirm({
        title: '¿Restaurar Secciones Originales?',
        message: `Se restablecerán las secciones predeterminadas para ${pageId}.html desde la plantilla canónica.`,
        isDangerous: true,
        confirmText: 'Restablecer Plantilla'
      });
      if (!confirmed) return;

      const db = this.getDb();
      if (!db) return;

      const baseSections = SITE_PAGES_REGISTRY[pageId]?.sections || [];
      await db.collection('site_pages').doc(pageId).set({
        pageId,
        sections: baseSections,
        updatedAt: new Date().toISOString(),
        updatedBy: OpsState.currentUser?.email || 'admin'
      }, { merge: true });

      OpsToast.show(`Plantilla original restablecida para ${pageId}.html.`, 'success');
    }
  };

  // --------------------------------------------------------------------------
  // 8. INTERFAZ DE USUARIO Y CONTROLADOR DOM (OPS UI)
  // --------------------------------------------------------------------------
  const OpsUI = {
    init() {
      this.bindSidebar();
      this.bindLiveClock();
      this.bindTabs();
      this.bindDrawer();
      this.bindCommandPalette();
      this.bindOmniSearch();
      this.bindSectionModal();
    },

    bindSidebar() {
      const toggleBtn = document.getElementById('opsSidebarToggleBtn');
      const sidebar = document.getElementById('opsSidebarMatte');

      if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
          OpsState.sidebarCollapsed = !OpsState.sidebarCollapsed;
          sidebar.classList.toggle('is-collapsed', OpsState.sidebarCollapsed);
          const icon = toggleBtn.querySelector('i');
          if (icon) {
            icon.className = OpsState.sidebarCollapsed ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-left';
          }
        });
      }
    },

    bindLiveClock() {
      const clockEl = document.getElementById('opsLiveClock');
      const dateEl = document.getElementById('opsLiveDate');

      const updateClock = () => {
        const now = new Date();
        if (clockEl) clockEl.textContent = now.toLocaleTimeString('es-NI', { hour12: false });
        if (dateEl) {
          const formatted = now.toLocaleDateString('es-NI', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }).toUpperCase();
          dateEl.textContent = formatted;
        }
      };

      updateClock();
      setInterval(updateClock, 1000);
    },

    bindTabs() {
      const navItems = document.querySelectorAll('.ops-nav-item');
      navItems.forEach((item) => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const tabId = item.getAttribute('data-tab');
          if (tabId) this.switchTab(tabId);
        });
      });
    },

    switchTab(tabId) {
      if (!ENTITY_REGISTRY[tabId]) return;

      OpsState.activeTab = tabId;
      OpsState.selectedIds.clear();
      this.updateBulkBar();

      // Botones activos en el sidebar
      document.querySelectorAll('.ops-nav-item').forEach((item) => {
        item.classList.toggle('is-active', item.getAttribute('data-tab') === tabId);
      });

      // Mostrar panel activo
      document.querySelectorAll('.ops-view-panel').forEach((panel) => {
        panel.classList.toggle('is-active', panel.id === `view-${tabId}`);
      });

      // Iniciar listener si la entidad no está en memoria
      const config = ENTITY_REGISTRY[tabId];
      if (config && config.collection && !OpsState.loadedTabs.has(tabId)) {
        OpsCMS.listenToCollection(tabId);
      }

      this.renderEntityView(tabId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    renderDashboardMetrics() {
      this.setText('kpiPublishedDestinations', OpsState.metrics.publishedDestinations);
      this.setText('kpiTotalDestinations', OpsState.metrics.totalDestinations);
      this.setText('kpiVerifiedBusinesses', OpsState.metrics.verifiedBusinesses);
      this.setText('kpiPendingBusinesses', OpsState.metrics.pendingBusinesses);
      this.setText('kpiActiveSos', OpsState.metrics.activeSosAlerts);
      this.setText('kpiTotalUsers', OpsState.metrics.totalUsers || (OpsState.collectionsData['13-usuarios']?.length || 0));

      const updatedEl = document.getElementById('opsMetricsLastUpdated');
      if (updatedEl) {
        updatedEl.textContent = `Actualizado: ${new Date().toLocaleTimeString('es-NI')}`;
      }
    },

    // 8.1 Renderizado de Tablas CRUD Universales
    renderEntityView(tabId) {
      const panel = document.getElementById(`view-${tabId}`);
      if (!panel) return;

      const config = ENTITY_REGISTRY[tabId];
      if (!config) return;

      // Si es una vista especializada del sistema, delegar al renderizador correspondiente
      if (tabId === '01-dashboard') return this.renderDashboardMetrics();
      if (tabId === '02-contenido') return this.renderWebsiteBuilderModule('02-contenido');
      if (tabId === '09-verificaciones') return this.renderVerificationsModule();
      if (tabId === '10-suscripciones') return this.renderSubscriptionsModule();
      if (tabId === '21-multimedia') return this.renderMediaLibraryModule();
      if (tabId === '24-builder') return this.renderWebsiteBuilderModule('24-builder');
      if (tabId === '27-auditoria') return this.renderAuditFeed();

      // Si es una colección administrable estándar, construir o actualizar la tabla
      let items = OpsState.collectionsData[tabId] || [];

      // Aplicar filtros de estado
      if (OpsState.activeFilterStatus !== 'all') {
        items = items.filter((x) => (x.status || 'published') === OpsState.activeFilterStatus);
      }

      // Aplicar búsqueda en tiempo real
      if (OpsState.activeSearchQuery) {
        const query = OpsState.activeSearchQuery.toLowerCase();
        items = items.filter((x) => {
          const text = `${x.title || ''} ${x.name || ''} ${x.department || ''} ${x.category || ''} ${x.type || ''}`.toLowerCase();
          return text.includes(query);
        });
      }

      const totalItems = (OpsState.collectionsData[tabId] || []).length;
      const publishedCount = (OpsState.collectionsData[tabId] || []).filter((x) => x.status === 'published').length;
      const draftCount = (OpsState.collectionsData[tabId] || []).filter((x) => x.status === 'draft').length;
      const archivedCount = (OpsState.collectionsData[tabId] || []).filter((x) => x.status === 'archived').length;
      const trashedCount = (OpsState.collectionsData[tabId] || []).filter((x) => x.status === 'trashed').length;

      panel.innerHTML = `
        <div class="ops-view-header">
          <div class="ops-view-title-group">
            <h1><i class="fa-solid ${config.icon}" style="color: var(--bq-secondary);"></i> ${config.title}</h1>
            <p class="ops-view-subtitle">ADMINISTRACIÓN EDITORIAL EN TIEMPO REAL · PERSISTENCIA CLOUD FIRESTORE</p>
          </div>
          <div class="ops-view-actions">
            <button class="btn-ops-matte accent" onclick="window.BaqueanoOpsEngine.openCreateDrawer('${tabId}')">
              <i class="fa-solid fa-plus"></i> Nuevo ${config.singular || 'Registro'}
            </button>
          </div>
        </div>

        <div class="ops-crud-toolbar">
          <div class="ops-filter-group">
            <button class="ops-filter-pill ${OpsState.activeFilterStatus === 'all' ? 'is-active' : ''}" onclick="window.BaqueanoOpsEngine.setFilterStatus('${tabId}', 'all')">
              Todos <span class="ops-filter-count">${totalItems}</span>
            </button>
            <button class="ops-filter-pill ${OpsState.activeFilterStatus === 'published' ? 'is-active' : ''}" onclick="window.BaqueanoOpsEngine.setFilterStatus('${tabId}', 'published')">
              Publicados <span class="ops-filter-count">${publishedCount}</span>
            </button>
            <button class="ops-filter-pill ${OpsState.activeFilterStatus === 'draft' ? 'is-active' : ''}" onclick="window.BaqueanoOpsEngine.setFilterStatus('${tabId}', 'draft')">
              Borradores <span class="ops-filter-count">${draftCount}</span>
            </button>
            <button class="ops-filter-pill ${OpsState.activeFilterStatus === 'archived' ? 'is-active' : ''}" onclick="window.BaqueanoOpsEngine.setFilterStatus('${tabId}', 'archived')">
              Archivados <span class="ops-filter-count">${archivedCount}</span>
            </button>
            <button class="ops-filter-pill ${OpsState.activeFilterStatus === 'trashed' ? 'is-active' : ''}" onclick="window.BaqueanoOpsEngine.setFilterStatus('${tabId}', 'trashed')">
              Papelera <span class="ops-filter-count">${trashedCount}</span>
            </button>
          </div>

          <div class="ops-search-input-wrap">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" class="ops-filter-search-input" placeholder="Buscar en ${config.title}..." value="${this.escape(OpsState.activeSearchQuery)}" oninput="window.BaqueanoOpsEngine.onSearchInput('${tabId}', this.value)">
          </div>
        </div>

        <div class="ops-table-wrap">
          <table class="ops-table-matte">
            <thead>
              <tr>
                <th style="width: 40px;"><input type="checkbox" onchange="window.BaqueanoOpsEngine.toggleSelectAll('${tabId}', this.checked)"></th>
                <th>${config.singular || 'Elemento'}</th>
                <th>Territorio / Tipo</th>
                <th>Estado</th>
                <th>Actualizado</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${items.length === 0 ? `
                <tr>
                  <td colspan="6" style="text-align: center; padding: 3rem 1.5rem;">
                    <div class="ops-empty-state">
                      <i class="fa-solid ${config.icon} ops-empty-icon"></i>
                      <div class="ops-empty-title">0 ${config.title} encontrados</div>
                      <div class="ops-empty-desc">No existen registros que coincidan con los filtros actuales en Cloud Firestore.</div>
                      <button class="btn-ops-matte primary" style="margin-top: 1rem;" onclick="window.BaqueanoOpsEngine.openCreateDrawer('${tabId}')">
                        <i class="fa-solid fa-plus"></i> Crear Primer ${config.singular || 'Registro'}
                      </button>
                    </div>
                  </td>
                </tr>
              ` : items.map((item) => this.renderTableRow(tabId, item)).join('')}
            </tbody>
          </table>
        </div>
      `;
    },

    renderTableRow(tabId, item) {
      const isSelected = OpsState.selectedIds.has(item.id);
      const title = item.title || item.name || 'Sin Título';
      const status = item.status || 'published';
      const image = item.imageUrl || item.image || item.photo || '';
      const territory = item.department || item.region || item.category || 'Nacional';
      const updated = item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('es-NI', { day: '2-digit', month: 'short' }) : 'Hoy';

      return `
        <tr class="ops-table-row ${isSelected ? 'is-selected' : ''}">
          <td>
            <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="window.BaqueanoOpsEngine.toggleSelect('${item.id}', this.checked)">
          </td>
          <td>
            <div class="ops-cell-title">
              ${image ? `<img src="${image}" class="ops-cell-thumb" alt="" referrerpolicy="no-referrer">` : `<div class="ops-cell-thumb" style="display:flex;align-items:center;justify-content:center;color:var(--ops-text-muted);"><i class="fa-solid fa-image"></i></div>`}
              <div class="ops-cell-meta">
                <span class="ops-cell-meta-title">${this.escape(title)}</span>
                <span class="ops-cell-meta-sub">ID: ${item.id}</span>
              </div>
            </div>
          </td>
          <td>
            <span style="font-size: 0.8rem; color: var(--ops-text-secondary);">${this.escape(territory)}</span>
          </td>
          <td>
            <span class="ops-badge-pill ${status}">
              <i class="fa-solid ${status === 'published' ? 'fa-circle-check' : status === 'draft' ? 'fa-file-pen' : status === 'archived' ? 'fa-box-archive' : 'fa-trash-can'}"></i>
              ${status === 'published' ? 'Publicado' : status === 'draft' ? 'Borrador' : status === 'archived' ? 'Archivado' : 'Papelera'}
            </span>
          </td>
          <td style="font-size: 0.76rem; color: var(--ops-text-muted);">${updated}</td>
          <td>
            <div class="ops-table-actions">
              <button class="btn-ops-icon" title="Editar registro" onclick="window.BaqueanoOpsEngine.openEditDrawer('${tabId}', '${item.id}')">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn-ops-icon" title="Vista previa" onclick="window.BaqueanoOpsEngine.previewEntity('${tabId}', '${item.id}')">
                <i class="fa-solid fa-eye"></i>
              </button>
              <button class="btn-ops-icon" title="Duplicar" onclick="window.BaqueanoOpsEngine.duplicateEntity('${tabId}', '${item.id}')">
                <i class="fa-solid fa-copy"></i>
              </button>
              ${status === 'trashed' ? `
                <button class="btn-ops-icon success" title="Restaurar de papelera" onclick="window.BaqueanoOpsEngine.restoreEntity('${tabId}', '${item.id}')">
                  <i class="fa-solid fa-rotate-left"></i>
                </button>
                <button class="btn-ops-icon danger" title="Eliminación definitiva (SuperAdmin)" onclick="window.BaqueanoOpsEngine.hardDeleteEntity('${tabId}', '${item.id}')">
                  <i class="fa-solid fa-ban"></i>
                </button>
              ` : `
                <button class="btn-ops-icon danger" title="Mover a papelera" onclick="window.BaqueanoOpsEngine.trashEntity('${tabId}', '${item.id}')">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              `}
            </div>
          </td>
        </tr>
      `;
    },

    // 8.2 Drawer de Creación y Edición
    bindDrawer() {
      const drawer = document.getElementById('opsEntityDrawer');
      const closeBtn = document.getElementById('opsDrawerCloseBtn');
      const cancelBtn = document.getElementById('opsDrawerCancelBtn');
      const saveDraftBtn = document.getElementById('opsDrawerSaveDraftBtn');
      const savePublishBtn = document.getElementById('opsDrawerSavePublishBtn');
      const fileInput = document.getElementById('entityFileInput');
      const dropzone = document.getElementById('entityDropzone');
      const removePreviewBtn = document.getElementById('btnRemovePreview');

      const closeDrawer = () => {
        if (drawer) drawer.classList.remove('is-open');
      };

      if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
      if (cancelBtn) cancelBtn.addEventListener('click', closeDrawer);

      // Tabs internos del drawer
      const tabBtns = document.querySelectorAll('.ops-drawer-tab-btn');
      tabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const targetPane = btn.getAttribute('data-drawer-tab');
          tabBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
          document.querySelectorAll('.ops-drawer-tab-pane').forEach((pane) => {
            pane.classList.toggle('is-active', pane.id === `pane-${targetPane}`);
          });
        });
      });

      // Subida de imagen a Firebase Storage
      if (dropzone && fileInput) {
        dropzone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if (file) await this.handleFileUpload(file);
        });
      }

      if (removePreviewBtn) {
        removePreviewBtn.addEventListener('click', () => {
          const urlInput = document.getElementById('entityImageUrl');
          const previewBox = document.getElementById('entityPreviewBox');
          if (urlInput) urlInput.value = '';
          if (previewBox) previewBox.style.display = 'none';
        });
      }

      if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', () => this.submitDrawerForm('draft'));
      }
      if (savePublishBtn) {
        savePublishBtn.addEventListener('click', () => this.submitDrawerForm('published'));
      }
    },

    async handleFileUpload(file) {
      const dropzone = document.getElementById('entityDropzone');
      const previewBox = document.getElementById('entityPreviewBox');
      const previewImg = document.getElementById('entityPreviewImg');
      const urlInput = document.getElementById('entityImageUrl');

      if (dropzone) dropzone.innerHTML = '<i class="fa-solid fa-spinner fa-spin ops-dropzone-icon"></i><div>Subiendo a Firebase Storage...</div>';

      try {
        const { downloadURL } = await OpsStorage.uploadFile(file, 'destinations');
        if (urlInput) urlInput.value = downloadURL;
        if (previewImg) previewImg.src = downloadURL;
        if (previewBox) previewBox.style.display = 'block';
        if (dropzone) {
          dropzone.innerHTML = '<i class="fa-solid fa-check ops-dropzone-icon" style="color:var(--bq-jungle);"></i><div>¡Imagen subida con éxito! Haz clic para cambiar.</div>';
        }
        OpsToast.show('Imagen alojada en Storage con URL pública segura.', 'success');
      } catch (err) {
        OpsToast.show(`Error al subir imagen: ${err.message}`, 'error');
        if (dropzone) {
          dropzone.innerHTML = '<i class="fa-solid fa-cloud-arrow-up ops-dropzone-icon"></i><div>Reintentar carga de imagen</div>';
        }
      }
    },

    openDrawer(tabId, item = null) {
      const drawer = document.getElementById('opsEntityDrawer');
      const titleEl = document.getElementById('opsDrawerTitle');
      const subEl = document.getElementById('opsDrawerSubtitle');
      const config = ENTITY_REGISTRY[tabId];
      if (!drawer || !config) return;

      document.getElementById('entityCollection').value = tabId;
      document.getElementById('entityId').value = item ? item.id : '';

      titleEl.textContent = item ? `Editar ${config.singular || 'Registro'}` : `Nuevo ${config.singular || 'Registro'}`;
      subEl.textContent = item ? `ID: ${item.id}` : `Módulo: ${config.title}`;

      // Resetear campos
      document.getElementById('entityTitle').value = item ? (item.title || item.name || '') : '';
      document.getElementById('entitySlug').value = item ? (item.slug || '') : '';
      document.getElementById('entityCategory').value = item ? (item.category || item.type || '') : '';
      document.getElementById('entityStatus').value = item ? (item.status || 'published') : 'published';
      document.getElementById('entitySortOrder').value = item ? (item.sortOrder || 0) : 0;
      document.getElementById('entityShortDesc').value = item ? (item.shortDesc || '') : '';
      document.getElementById('entityDescription').value = item ? (item.description || '') : '';

      // Ubicación
      document.getElementById('entityDepartment').value = item ? (item.department || 'Nacional') : 'Nacional';
      document.getElementById('entityMunicipality').value = item ? (item.municipality || '') : '';
      document.getElementById('entityAddress').value = item ? (item.address || item.locationDetail || '') : '';
      document.getElementById('entityLatitude').value = item ? (item.latitude || item.coordinates?.lat || '') : '';
      document.getElementById('entityLongitude').value = item ? (item.longitude || item.coordinates?.lng || '') : '';

      // Tarifas
      document.getElementById('entityPriceNio').value = item ? (item.priceNio || '') : '';
      document.getElementById('entityPriceUsd').value = item ? (item.priceUsd || '') : '';
      document.getElementById('entityPhone').value = item ? (item.phone || '') : '';
      document.getElementById('entityWhatsapp').value = item ? (item.whatsapp || '') : '';
      document.getElementById('entityEmail').value = item ? (item.email || '') : '';
      document.getElementById('entityWebsite').value = item ? (item.website || '') : '';
      document.getElementById('entityDayPass').value = item ? (item.dayPass || item.amenities || '') : '';

      // Media
      const imageUrl = item ? (item.imageUrl || item.image || item.photo || '') : '';
      document.getElementById('entityImageUrl').value = imageUrl;
      const previewBox = document.getElementById('entityPreviewBox');
      const previewImg = document.getElementById('entityPreviewImg');
      if (imageUrl && previewBox && previewImg) {
        previewImg.src = imageUrl;
        previewBox.style.display = 'block';
      } else if (previewBox) {
        previewBox.style.display = 'none';
      }

      // SEO
      document.getElementById('entityMetaTitle').value = item ? (item.metaTitle || '') : '';
      document.getElementById('entityMetaDesc').value = item ? (item.metaDescription || '') : '';
      document.getElementById('entityKeywords').value = item ? (item.keywords || '') : '';

      // Activar primer tab
      document.querySelectorAll('.ops-drawer-tab-btn').forEach((b, idx) => b.classList.toggle('is-active', idx === 0));
      document.querySelectorAll('.ops-drawer-tab-pane').forEach((p, idx) => p.classList.toggle('is-active', idx === 0));

      drawer.classList.add('is-open');
    },

    async submitDrawerForm(statusToSave) {
      const tabId = document.getElementById('entityCollection').value;
      const titleInput = document.getElementById('entityTitle');

      if (!titleInput.value.trim()) {
        OpsToast.show('El título / nombre es un campo obligatorio.', 'warning');
        titleInput.focus();
        return;
      }

      const id = document.getElementById('entityId').value;
      const payload = {
        id: id || undefined,
        title: titleInput.value.trim(),
        name: titleInput.value.trim(),
        slug: document.getElementById('entitySlug').value.trim() || titleInput.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: document.getElementById('entityCategory').value.trim(),
        status: statusToSave,
        sortOrder: parseInt(document.getElementById('entitySortOrder').value, 10) || 0,
        shortDesc: document.getElementById('entityShortDesc').value.trim(),
        description: document.getElementById('entityDescription').value.trim(),
        department: document.getElementById('entityDepartment').value,
        municipality: document.getElementById('entityMunicipality').value.trim(),
        address: document.getElementById('entityAddress').value.trim(),
        latitude: parseFloat(document.getElementById('entityLatitude').value) || null,
        longitude: parseFloat(document.getElementById('entityLongitude').value) || null,
        priceNio: parseFloat(document.getElementById('entityPriceNio').value) || 0,
        priceUsd: parseFloat(document.getElementById('entityPriceUsd').value) || 0,
        phone: document.getElementById('entityPhone').value.trim(),
        whatsapp: document.getElementById('entityWhatsapp').value.trim(),
        email: document.getElementById('entityEmail').value.trim(),
        website: document.getElementById('entityWebsite').value.trim(),
        dayPass: document.getElementById('entityDayPass').value.trim(),
        imageUrl: document.getElementById('entityImageUrl').value.trim(),
        metaTitle: document.getElementById('entityMetaTitle').value.trim(),
        metaDescription: document.getElementById('entityMetaDesc').value.trim(),
        keywords: document.getElementById('entityKeywords').value.trim()
      };

      try {
        await OpsCMS.saveEntity(tabId, payload);
        const drawer = document.getElementById('opsEntityDrawer');
        if (drawer) drawer.classList.remove('is-open');
        OpsToast.show(`Registro guardado exitosamente como "${statusToSave}".`, 'success');
      } catch (err) {
        OpsToast.show(`Error al guardar en Firestore: ${err.message}`, 'error');
      }
    },

    updateBulkBar() {
      const bar = document.getElementById('opsBulkBar');
      const countEl = document.getElementById('opsBulkCount');
      const size = OpsState.selectedIds.size;

      if (bar && countEl) {
        countEl.textContent = `${size} seleccionado${size === 1 ? '' : 's'}`;
        bar.classList.toggle('is-visible', size > 0);
      }
    },

    // 8.3 Módulos Especializados
    renderVerificationsModule() {
      const panel = document.getElementById('view-09-verificaciones');
      if (!panel) return;

      const businesses = OpsState.collectionsData['08-negocios'] || [];

      panel.innerHTML = `
        <div class="ops-view-header">
          <div class="ops-view-title-group">
            <h1><i class="fa-solid fa-certificate" style="color: var(--bq-accent);"></i> Verificaciones & Sello Oficial</h1>
            <p class="ops-view-subtitle">ACREDITACIÓN TERRITORIAL Y FISCALIZACIÓN EN CAMPO BAJO LEY 1210/1211</p>
          </div>
        </div>

        <div class="ops-table-wrap">
          <table class="ops-table-matte">
            <thead>
              <tr>
                <th>Negocio</th>
                <th>Territorio</th>
                <th>Estado de Sello</th>
                <th>Notas de Acreditación</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${businesses.length === 0 ? `
                <tr><td colspan="5" style="text-align:center;padding:2rem;">No hay negocios registrados para verificar.</td></tr>
              ` : businesses.map((b) => `
                <tr class="ops-table-row">
                  <td><strong>${this.escape(b.name || b.title)}</strong><div style="font-size:0.75rem;color:var(--ops-text-muted);">ID: ${b.id}</div></td>
                  <td>${this.escape(b.department || 'Nacional')}</td>
                  <td>
                    <span class="ops-badge-pill ${b.verified ? 'verified' : 'draft'}">
                      <i class="fa-solid ${b.verified ? 'fa-shield-check' : 'fa-clock'}"></i>
                      ${b.verified ? 'Verificado Oficial' : 'Sin Sello'}
                    </span>
                  </td>
                  <td style="font-size:0.8rem;color:var(--ops-text-secondary);max-width:280px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${this.escape(b.verificationNotes || 'Pendiente de auditoría física')}
                  </td>
                  <td style="text-align: right;">
                    ${b.verified ? `
                      <button class="btn-ops-matte" onclick="window.BaqueanoOpsEngine.revokeBusinessVerification('${b.id}')"><i class="fa-solid fa-ban"></i> Revocar</button>
                    ` : `
                      <button class="btn-ops-matte primary" onclick="window.BaqueanoOpsEngine.verifyBusiness('${b.id}')"><i class="fa-solid fa-check"></i> Asignar Sello</button>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    },

    renderSubscriptionsModule() {
      const panel = document.getElementById('view-10-suscripciones');
      if (!panel) return;

      const businesses = OpsState.collectionsData['08-negocios'] || [];

      panel.innerHTML = `
        <div class="ops-view-header">
          <div class="ops-view-title-group">
            <h1><i class="fa-solid fa-id-card" style="color: var(--bq-secondary);"></i> Suscripciones & Membresías</h1>
            <p class="ops-view-subtitle">VIGENCIA, COMPROBANTES DE PAGO Y ALERTAS DE RENOVACIÓN DE ALIADOS</p>
          </div>
        </div>

        <div class="ops-table-wrap">
          <table class="ops-table-matte">
            <thead>
              <tr>
                <th>Aliado / Negocio</th>
                <th>Tipo de Membresía</th>
                <th>Inicio</th>
                <th>Vencimiento</th>
                <th>Estado</th>
                <th style="text-align: right;">Gestión</th>
              </tr>
            </thead>
            <tbody>
              ${businesses.length === 0 ? `
                <tr><td colspan="6" style="text-align:center;padding:2rem;">No hay registros de suscripción activos.</td></tr>
              ` : businesses.map((b) => {
                const isExpired = b.subscriptionEnd && new Date(b.subscriptionEnd) < new Date();
                return `
                  <tr class="ops-table-row">
                    <td><strong>${this.escape(b.name || b.title)}</strong></td>
                    <td>${b.subscriptionType || 'Comunitaria Anual'}</td>
                    <td style="font-size:0.78rem;">${b.subscriptionStart || '2026-01-01'}</td>
                    <td style="font-size:0.78rem;">${b.subscriptionEnd || '2026-12-31'}</td>
                    <td>
                      <span class="ops-badge-pill ${isExpired ? 'trashed' : 'published'}">
                        ${isExpired ? 'Vencida' : 'Activa'}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <button class="btn-ops-matte" onclick="window.BaqueanoOpsEngine.manageSubscription('${b.id}')"><i class="fa-solid fa-pen"></i> Actualizar</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    },

    renderWebsiteBuilderModule(currentTab = '24-builder') {
      const panel = document.getElementById(`view-${currentTab}`) || document.getElementById('view-24-builder');
      if (!panel) return;

      const pageId = OpsState.activeBuilderPage || 'index';
      const pageInfo = SITE_PAGES_REGISTRY[pageId] || { name: 'Página', file: `${pageId}.html`, icon: 'fa-file', sections: [] };

      // Iniciar listener reactivo si no existe en memoria
      if (!OpsState.pageSections[pageId]) {
        OpsCMS.listenToPageSections(pageId);
      }

      let allSections = OpsState.pageSections[pageId] || pageInfo.sections || [];
      const totalCount = allSections.length;
      const publishedCount = allSections.filter((s) => s.status === 'published').length;
      const draftCount = allSections.filter((s) => s.status === 'draft').length;
      const trashedCount = allSections.filter((s) => s.status === 'trashed').length;

      // Filtrar secciones
      let filteredSections = [...allSections];
      if (OpsState.activeBuilderFilter !== 'all') {
        filteredSections = filteredSections.filter((s) => (s.status || 'published') === OpsState.activeBuilderFilter);
      }

      if (OpsState.builderSearchQuery) {
        const q = OpsState.builderSearchQuery.toLowerCase();
        filteredSections = filteredSections.filter((s) =>
          `${s.name || ''} ${s.title || ''} ${s.subtitle || ''} ${s.content || ''} ${s.type || ''}`.toLowerCase().includes(q)
        );
      }

      filteredSections.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

      panel.innerHTML = `
        <div class="ops-view-header">
          <div class="ops-view-title-group">
            <h1><i class="fa-solid fa-cubes" style="color: var(--bq-accent);"></i> Website Builder Universal</h1>
            <p class="ops-view-subtitle">CONTROL TOTAL DE PÁGINAS Y SECCIONES · EDITA, AGREGA, ELIMINA Y RESTAURA SIN TOCAR CÓDIGO</p>
          </div>
          <div class="ops-view-actions">
            <button class="btn-ops-matte primary" onclick="window.BaqueanoOpsEngine.saveGlobalAnnouncement()"><i class="fa-solid fa-floppy-disk"></i> Guardar Anuncio Global</button>
          </div>
        </div>

        <!-- CINTILLO DE ANUNCIO GLOBAL -->
        <div style="background: var(--ops-surface-1); border: 1px solid var(--ops-border-subtle); border-radius: var(--ops-radius-lg); padding: 1.25rem 1.5rem; margin-bottom: 1.5rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <strong style="color:#fff; font-size:0.92rem;"><i class="fa-solid fa-bullhorn" style="color:var(--bq-accent);"></i> Banner de Anuncio Global en Vivo (Web & Android)</strong>
            <span class="ops-badge-pill published">Sincronización Inmediata</span>
          </div>
          <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
            <input type="text" id="cfgAnnouncementText" placeholder="Ej. ¡Descubre Nicaragua auténtica con baqueanos campesinos sin intermediarios!" style="flex:1; background: var(--ops-surface-2); border: 1px solid var(--ops-border-subtle); border-radius: var(--ops-radius-md); padding: 0.65rem 1rem; color: #fff; font-size: 0.88rem;">
            <button class="btn-ops-matte accent" onclick="window.BaqueanoOpsEngine.saveGlobalAnnouncement()"><i class="fa-solid fa-floppy-disk"></i> Publicar Anuncio</button>
          </div>
        </div>

        <!-- BARRA DE SELECCIÓN DE PÁGINA (12 PÁGINAS DEL ECOSISTEMA) -->
        <div class="ops-builder-header-strip" style="margin-bottom: 1.5rem;">
          <div class="ops-page-selector-box">
            <label style="font-size:0.88rem; font-weight:700; color:#fff;">Página a Administrar:</label>
            <select class="ops-page-select" id="builderPageSelect" onchange="window.BaqueanoOpsEngine.onBuilderPageChange(this.value)">
              ${Object.keys(SITE_PAGES_REGISTRY).map((pId) => {
                const p = SITE_PAGES_REGISTRY[pId];
                return `<option value="${pId}" ${pId === pageId ? 'selected' : ''}>${p.name} (${p.file})</option>`;
              }).join('')}
            </select>
            <a href="${pageInfo.file}" target="_blank" rel="noopener noreferrer" class="ops-page-live-link">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> Ver ${pageInfo.file} en vivo
            </a>
          </div>

          <div style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap;">
            <button class="btn-ops-matte accent" onclick="window.BaqueanoOpsEngine.addSectionToPage('${pageId}')">
              <i class="fa-solid fa-plus"></i> Añadir Nueva Sección
            </button>
            <button class="btn-ops-matte" onclick="window.BaqueanoOpsEngine.resetPageToBaseline('${pageId}')" title="Restablecer plantilla inicial de esta página">
              <i class="fa-solid fa-arrow-rotate-left"></i> Restablecer Plantilla
            </button>
          </div>
        </div>

        <!-- BARRA DE FILTROS Y BÚSQUEDA DE SECCIONES -->
        <div class="ops-crud-toolbar">
          <div class="ops-filter-group">
            <button class="ops-filter-pill ${OpsState.activeBuilderFilter === 'all' ? 'is-active' : ''}" onclick="window.BaqueanoOpsEngine.setBuilderFilter('all')">
              Todas <span class="ops-filter-count">${totalCount}</span>
            </button>
            <button class="ops-filter-pill ${OpsState.activeBuilderFilter === 'published' ? 'is-active' : ''}" onclick="window.BaqueanoOpsEngine.setBuilderFilter('published')">
              Publicadas <span class="ops-filter-count">${publishedCount}</span>
            </button>
            <button class="ops-filter-pill ${OpsState.activeBuilderFilter === 'draft' ? 'is-active' : ''}" onclick="window.BaqueanoOpsEngine.setBuilderFilter('draft')">
              Borradores / Ocultas <span class="ops-filter-count">${draftCount}</span>
            </button>
            <button class="ops-filter-pill ${OpsState.activeBuilderFilter === 'trashed' ? 'is-active' : ''}" onclick="window.BaqueanoOpsEngine.setBuilderFilter('trashed')">
              En Papelera <span class="ops-filter-count">${trashedCount}</span>
            </button>
          </div>

          <div class="ops-search-input-wrap">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" class="ops-filter-search-input" placeholder="Buscar secciones en ${pageInfo.name}..." value="${this.escape(OpsState.builderSearchQuery)}" oninput="window.BaqueanoOpsEngine.onBuilderSearch(this.value)">
          </div>
        </div>

        <!-- LISTA DE TARJETAS DE SECCIÓN -->
        <div id="builderSectionsList" style="margin-top: 1rem;">
          ${filteredSections.length === 0 ? `
            <div class="ops-empty-state" style="padding: 3rem 1.5rem; background: var(--ops-surface-1); border-radius: var(--ops-radius-lg); border: 1px solid var(--ops-border-subtle);">
              <i class="fa-solid fa-layer-group ops-empty-icon" style="color:var(--bq-secondary);"></i>
              <div class="ops-empty-title">0 Secciones encontradas en ${pageInfo.name}</div>
              <div class="ops-empty-desc">No existen bloques con el filtro seleccionado. Puedes crear uno nuevo o restablecer la plantilla base.</div>
              <button class="btn-ops-matte accent" style="margin-top: 1rem;" onclick="window.BaqueanoOpsEngine.addSectionToPage('${pageId}')">
                <i class="fa-solid fa-plus"></i> Crear Primera Sección
              </button>
            </div>
          ` : filteredSections.map((s, idx) => {
            const status = s.status || 'published';
            const statusLabel = status === 'published' ? 'Publicado' : status === 'draft' ? 'Borrador / Oculto' : 'En Papelera';
            return `
              <div class="ops-section-card status-${status}">
                <div class="ops-section-card-top">
                  <div class="ops-section-card-title-group">
                    <div class="ops-section-order-badge" title="Orden de aparición: #${s.sortOrder || idx + 1}">
                      ${s.sortOrder || idx + 1}
                    </div>
                    <div>
                      <h4 class="ops-section-name">${this.escape(s.name || s.title || 'Sección')}</h4>
                      <div style="font-size:0.75rem; color:var(--ops-text-muted);">ID: <code>${s.id}</code></div>
                    </div>
                    <span class="ops-section-type-badge">${s.type || 'bloque'}</span>
                  </div>

                  <div style="display:flex; align-items:center; gap:0.5rem;">
                    <span class="ops-badge-pill ${status}">
                      <i class="fa-solid ${status === 'published' ? 'fa-circle-check' : status === 'draft' ? 'fa-eye-slash' : 'fa-trash-can'}"></i>
                      ${statusLabel}
                    </span>
                  </div>
                </div>

                <div class="ops-section-card-body">
                  ${s.title ? `<div class="ops-section-title-preview">${this.escape(s.title)}</div>` : ''}
                  ${s.subtitle ? `<div class="ops-section-sub-preview">${this.escape(s.subtitle)}</div>` : ''}
                  ${s.content ? `<p style="font-size:0.8rem; color:var(--ops-text-secondary); line-height:1.5; margin:0 0 0.5rem 0;">${this.escape(s.content)}</p>` : ''}

                  <div class="ops-section-meta-chips">
                    ${s.ctaText ? `
                      <span class="ops-section-meta-chip">
                        <i class="fa-solid fa-arrow-pointer" style="color:var(--bq-accent);"></i> Botón: "${this.escape(s.ctaText)}" (${this.escape(s.ctaLink || '#')})
                      </span>
                    ` : ''}
                    ${s.imageUrl ? `
                      <span class="ops-section-meta-chip">
                        <i class="fa-solid fa-image" style="color:var(--bq-jungle);"></i> Imagen Vinculada
                      </span>
                    ` : ''}
                  </div>
                </div>

                <div class="ops-section-actions">
                  <button type="button" class="ops-btn-action-icon" title="Subir posición" onclick="window.BaqueanoOpsEngine.moveSectionOrder('${pageId}', '${s.id}', 'up')">
                    <i class="fa-solid fa-arrow-up"></i> Subir
                  </button>
                  <button type="button" class="ops-btn-action-icon" title="Bajar posición" onclick="window.BaqueanoOpsEngine.moveSectionOrder('${pageId}', '${s.id}', 'down')">
                    <i class="fa-solid fa-arrow-down"></i> Bajar
                  </button>
                  <button type="button" class="ops-btn-action-icon accent" onclick="window.BaqueanoOpsEngine.openSectionModal('${pageId}', '${s.id}')">
                    <i class="fa-solid fa-pen-to-square"></i> Modificar
                  </button>
                  <button type="button" class="ops-btn-action-icon" onclick="window.BaqueanoOpsEngine.toggleSectionStatus('${pageId}', '${s.id}')" title="${status === 'published' ? 'Ocultar del sitio web' : 'Hacer visible en el sitio web'}">
                    <i class="fa-solid ${status === 'published' ? 'fa-eye-slash' : 'fa-eye'}"></i>
                    ${status === 'published' ? 'Despublicar' : 'Publicar'}
                  </button>

                  ${status === 'trashed' ? `
                    <button type="button" class="ops-btn-action-icon success" onclick="window.BaqueanoOpsEngine.restoreSection('${pageId}', '${s.id}')" title="Restaurar de la papelera">
                      <i class="fa-solid fa-rotate-left"></i> Restaurar
                    </button>
                    <button type="button" class="ops-btn-action-icon danger" onclick="window.BaqueanoOpsEngine.hardDeleteSection('${pageId}', '${s.id}')" title="Eliminar para siempre">
                      <i class="fa-solid fa-ban"></i> Eliminar Definitivo
                    </button>
                  ` : `
                    <button type="button" class="ops-btn-action-icon danger" onclick="window.BaqueanoOpsEngine.trashSection('${pageId}', '${s.id}')" title="Mover a papelera">
                      <i class="fa-solid fa-trash-can"></i> Papelera
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    },

    bindSectionModal() {
      const modal = document.getElementById('opsSectionModal');
      const closeBtn = document.getElementById('opsSectionModalCloseBtn');
      const cancelBtn = document.getElementById('btnCancelSectionModal');
      const saveBtn = document.getElementById('btnSaveSectionModal');
      const uploadBtn = document.getElementById('btnUploadSectionMedia');
      const fileInput = document.getElementById('secFormFileInput');

      const closeModal = () => {
        if (modal) modal.classList.remove('is-open');
      };

      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

      if (saveBtn) {
        saveBtn.addEventListener('click', () => this.saveSectionForm());
      }

      if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          uploadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Subiendo...';
          try {
            const { downloadURL } = await OpsStorage.uploadFile(file, 'pages');
            const imgInput = document.getElementById('secFormImageUrl');
            if (imgInput) imgInput.value = downloadURL;
            OpsToast.show('Medio subido a Firebase Storage.', 'success');
            uploadBtn.innerHTML = '<i class="fa-solid fa-check" style="color:var(--bq-jungle);"></i> Listo';
          } catch (err) {
            OpsToast.show(`Error subiendo medio: ${err.message}`, 'error');
            uploadBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Subir a Storage';
          }
        });
      }
    },

    openSectionModal(pageId, sectionId = null) {
      const modal = document.getElementById('opsSectionModal');
      const titleEl = document.getElementById('opsSectionModalTitle');
      const subEl = document.getElementById('opsSectionModalSubtitle');
      if (!modal) return;

      const pageInfo = SITE_PAGES_REGISTRY[pageId] || { name: pageId, file: `${pageId}.html` };
      const sections = OpsState.pageSections[pageId] || pageInfo.sections || [];
      const section = sectionId ? sections.find((s) => s.id === sectionId) : null;

      document.getElementById('sectionPageId').value = pageId;
      document.getElementById('sectionId').value = sectionId || '';

      if (titleEl) {
        titleEl.innerHTML = `<i class="fa-solid fa-layer-group" style="color: var(--bq-accent);"></i> ${section ? 'Modificar Sección' : 'Añadir Nueva Sección'}`;
      }
      if (subEl) {
        subEl.textContent = `Página: ${pageInfo.name} (${pageInfo.file})`;
      }

      document.getElementById('secFormTitle').value = section ? (section.title || section.name || '') : '';
      document.getElementById('secFormSubtitle').value = section ? (section.subtitle || '') : '';
      document.getElementById('secFormType').value = section ? (section.type || 'content') : 'content';
      document.getElementById('secFormContent').value = section ? (section.content || '') : '';
      document.getElementById('secFormCtaText').value = section ? (section.ctaText || '') : '';
      document.getElementById('secFormCtaLink').value = section ? (section.ctaLink || '') : '';
      document.getElementById('secFormImageUrl').value = section ? (section.imageUrl || '') : '';
      document.getElementById('secFormStatus').value = section ? (section.status || 'published') : 'published';
      document.getElementById('secFormSortOrder').value = section ? (section.sortOrder || sections.length + 1) : (sections.length + 1);

      modal.classList.add('is-open');
    },

    async saveSectionForm() {
      const pageId = document.getElementById('sectionPageId').value;
      const sectionId = document.getElementById('sectionId').value;
      const titleInput = document.getElementById('secFormTitle');

      if (!titleInput.value.trim()) {
        OpsToast.show('El título de la sección es obligatorio.', 'warning');
        titleInput.focus();
        return;
      }

      const saveBtn = document.getElementById('btnSaveSectionModal');
      if (saveBtn) saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

      const sectionData = {
        id: sectionId || undefined,
        name: titleInput.value.trim(),
        title: titleInput.value.trim(),
        subtitle: document.getElementById('secFormSubtitle').value.trim(),
        type: document.getElementById('secFormType').value,
        content: document.getElementById('secFormContent').value.trim(),
        ctaText: document.getElementById('secFormCtaText').value.trim(),
        ctaLink: document.getElementById('secFormCtaLink').value.trim(),
        imageUrl: document.getElementById('secFormImageUrl').value.trim(),
        status: document.getElementById('secFormStatus').value,
        sortOrder: parseInt(document.getElementById('secFormSortOrder').value, 10) || 1
      };

      try {
        await OpsCMS.savePageSection(pageId, sectionData);
        const modal = document.getElementById('opsSectionModal');
        if (modal) modal.classList.remove('is-open');
        OpsToast.show('¡Sección guardada con éxito en Firestore!', 'success');
        this.renderWebsiteBuilderModule(OpsState.activeTab);
      } catch (err) {
        OpsToast.show(`Error al guardar: ${err.message}`, 'error');
      } finally {
        if (saveBtn) saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Cambios en Vivo';
      }
    },

    renderMediaLibraryModule() {
      const panel = document.getElementById('view-21-multimedia');
      if (!panel) return;

      panel.innerHTML = `
        <div class="ops-view-header">
          <div class="ops-view-title-group">
            <h1><i class="fa-solid fa-photo-film" style="color: var(--bq-secondary);"></i> Biblioteca Multimedia Cloud Storage</h1>
            <p class="ops-view-subtitle">ALMACENAMIENTO DE ALTA RESOLUCIÓN: FOTOGRAFÍAS, AUDIOS, VIDEOS Y DOCUMENTOS</p>
          </div>
          <div class="ops-view-actions">
            <button class="btn-ops-matte accent" onclick="document.getElementById('mediaDirectUpload').click()"><i class="fa-solid fa-cloud-arrow-up"></i> Cargar Archivo</button>
            <input type="file" id="mediaDirectUpload" style="display:none;" onchange="window.BaqueanoOpsEngine.onDirectMediaUpload(this.files[0])">
          </div>
        </div>

        <div class="ops-dropzone" style="margin-bottom: 1.5rem;" onclick="document.getElementById('mediaDirectUpload').click()">
          <i class="fa-solid fa-cloud-arrow-up ops-dropzone-icon"></i>
          <div style="font-size:0.95rem; font-weight:700; color:#fff;">Haz clic o arrastra archivos multimedia para alojarlos en Cloud Storage</div>
          <div style="font-size:0.78rem; color:var(--ops-text-muted); margin-top:0.3rem;">Soporte nativo para WebP, PNG, JPG, MP3 y PDF bajo políticas de lectura pública y escritura administrativa.</div>
        </div>

        <div style="background: var(--ops-surface-1); border: 1px solid var(--ops-border-subtle); border-radius: var(--ops-radius-md); padding: 1.25rem;">
          <h3 style="font-size:0.92rem; color:#fff; margin-bottom:1rem;"><i class="fa-solid fa-folder-tree"></i> Rutas Oficiales de Almacenamiento</h3>
          <ul style="font-size:0.82rem; color:var(--ops-text-secondary); line-height:1.8; margin:0; padding-left:1.25rem;">
            <li><code>/destinations/{id}</code> — Fotografías oficiales de senderos, playas y volcanes.</li>
            <li><code>/businesses/{id}</code> — Logotipos y galerías de anfitriones y cooperativas.</li>
            <li><code>/pages/{pageId}</code> — Banners y fondos dinámicos del Website Builder.</li>
            <li><code>/multimedia/{id}</code> — Archivos de audio folclórico, marimba y documentos patrimoniales.</li>
          </ul>
        </div>
      `;
    },

    renderAuditFeed() {
      const logs = OpsState.collectionsData['27-auditoria'] || [];

      // Actualizar feed en Dashboard (Vista 01)
      const dashFeed = document.getElementById('opsAuditFeed');
      if (dashFeed) {
        if (logs.length === 0) {
          dashFeed.innerHTML = '<div class="ops-empty-state" style="padding: 1.5rem;"><div style="font-size: 0.85rem;">Esperando eventos de auditoría...</div></div>';
        } else {
          dashFeed.innerHTML = logs.slice(0, 8).map((log) => `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; padding: 0.65rem 0; border-bottom: 1px solid var(--ops-border-subtle); font-size: 0.8rem;">
              <div>
                <strong style="color: #fff;">${this.escape(log.action)}</strong>
                <div style="color: var(--ops-text-secondary); font-size: 0.74rem;">${this.escape(log.description || '')}</div>
              </div>
              <span style="font-size: 0.7rem; color: var(--ops-text-muted); white-space: nowrap;">
                ${log.timestamp ? new Date(log.timestamp).toLocaleTimeString('es-NI', { hour12: false }) : ''}
              </span>
            </div>
          `).join('');
        }
      }

      // Actualizar Módulo Dedicado de Auditoría (Vista 27)
      const auditPanel = document.getElementById('view-27-auditoria');
      if (auditPanel) {
        auditPanel.innerHTML = `
          <div class="ops-view-header">
            <div class="ops-view-title-group">
              <h1><i class="fa-solid fa-file-shield" style="color: var(--bq-secondary);"></i> Registro Inmutable de Auditoría</h1>
              <p class="ops-view-subtitle">TRAZABILIDAD DE ACCIONES EDITORIALES, VERIFICACIONES Y MODIFICACIONES EN FIRESTORE</p>
            </div>
          </div>

          <div class="ops-table-wrap">
            <table class="ops-table-matte">
              <thead>
                <tr>
                  <th>Fecha &amp; Hora</th>
                  <th>Acción</th>
                  <th>Módulo</th>
                  <th>Detalle Operativo</th>
                  <th>Responsable</th>
                </tr>
              </thead>
              <tbody id="auditTableBody">
                ${logs.length === 0 ? `
                  <tr><td colspan="5" style="text-align:center;padding:2.5rem;color:var(--ops-text-muted);">No existen registros de auditoría aún.</td></tr>
                ` : logs.map((log) => `
                  <tr class="ops-table-row">
                    <td style="font-size:0.78rem; font-family:monospace; color:var(--ops-text-muted);">
                      ${log.timestamp ? new Date(log.timestamp).toLocaleString('es-NI', { hour12: false }) : 'Reciente'}
                    </td>
                    <td><strong style="color:#fff;">${this.escape(log.action)}</strong></td>
                    <td>${this.escape(log.module || 'Sistema')}</td>
                    <td style="font-size:0.82rem; color:var(--ops-text-secondary); max-width:320px;">
                      ${this.escape(log.description || '')}
                    </td>
                    <td><code>${this.escape(log.performedBy || 'Admin')}</code></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
    },

    // 8.4 Command Palette (Ctrl+K) con Búsqueda Omnicanal
    bindCommandPalette() {
      const paletteBtn = document.getElementById('opsCommandPaletteTrigger');
      const modal = document.getElementById('opsCommandModalBackdrop');
      const input = document.getElementById('opsCommandSearchInput');
      const closeBtn = document.getElementById('opsCommandCloseBtn');
      const resultsContainer = document.getElementById('opsCommandResultsList');

      const openPalette = () => {
        if (modal) {
          modal.classList.add('is-open');
          if (input) {
            input.value = '';
            input.focus();
          }
          this.renderPaletteResults('');
        }
      };

      const closePalette = () => {
        if (modal) modal.classList.remove('is-open');
      };

      if (paletteBtn) paletteBtn.addEventListener('click', openPalette);
      if (closeBtn) closeBtn.addEventListener('click', closePalette);

      if (input) {
        input.addEventListener('input', (e) => this.renderPaletteResults(e.target.value));
      }

      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          if (modal && modal.classList.contains('is-open')) closePalette();
          else openPalette();
        }
        if (e.key === 'Escape' && modal) closePalette();
      });
    },

    renderPaletteResults(query) {
      const resultsContainer = document.getElementById('opsCommandResultsList');
      if (!resultsContainer) return;

      const q = (query || '').toLowerCase().trim();
      const results = [];

      // Comandos y navegación directa
      Object.keys(ENTITY_REGISTRY).forEach((tabId) => {
        const conf = ENTITY_REGISTRY[tabId];
        if (!q || conf.title.toLowerCase().includes(q) || tabId.includes(q)) {
          results.push({
            type: 'Módulo',
            label: conf.title,
            icon: conf.icon,
            action: () => {
              this.switchTab(tabId);
              document.getElementById('opsCommandModalBackdrop')?.classList.remove('is-open');
            }
          });
        }
      });

      // Búsqueda en entidades cargadas
      Object.keys(OpsState.collectionsData).forEach((tabId) => {
        const items = OpsState.collectionsData[tabId] || [];
        items.forEach((item) => {
          const text = `${item.title || ''} ${item.name || ''}`.trim();
          if (text && q && text.toLowerCase().includes(q)) {
            results.push({
              type: ENTITY_REGISTRY[tabId]?.singular || 'Elemento',
              label: text,
              icon: ENTITY_REGISTRY[tabId]?.icon || 'fa-file',
              action: () => {
                this.switchTab(tabId);
                this.openDrawer(tabId, item);
                document.getElementById('opsCommandModalBackdrop')?.classList.remove('is-open');
              }
            });
          }
        });
      });

      if (results.length === 0) {
        resultsContainer.innerHTML = '<div style="padding:1.5rem;text-align:center;color:var(--ops-text-muted);font-size:0.85rem;">No se encontraron resultados coincidentes.</div>';
        return;
      }

      resultsContainer.innerHTML = results.slice(0, 15).map((r, idx) => `
        <div class="ops-command-item" data-index="${idx}">
          <i class="fa-solid ${r.icon}"></i>
          <div style="display:flex;flex-direction:column;gap:0.1rem;flex:1;">
            <span style="color:#fff;font-weight:600;">${this.escape(r.label)}</span>
            <span style="font-size:0.72rem;color:var(--ops-text-muted);">${r.type}</span>
          </div>
          <i class="fa-solid fa-chevron-right" style="font-size:0.7rem;color:var(--ops-text-muted);"></i>
        </div>
      `).join('');

      resultsContainer.querySelectorAll('.ops-command-item').forEach((el, idx) => {
        el.addEventListener('click', () => {
          if (results[idx] && typeof results[idx].action === 'function') {
            results[idx].action();
          }
        });
      });
    },

    bindOmniSearch() {
      const topTrigger = document.getElementById('opsCommandPaletteTrigger');
      if (topTrigger) {
        topTrigger.addEventListener('click', () => {
          const modal = document.getElementById('opsCommandModalBackdrop');
          if (modal) {
            modal.classList.add('is-open');
            document.getElementById('opsCommandSearchInput')?.focus();
          }
        });
      }
    },

    updateUserProfileUI(user) {
      const nameEl = document.getElementById('opsTopUserName');
      const roleEl = document.getElementById('opsTopUserRole');
      const avatarEl = document.getElementById('opsTopUserAvatar');

      const displayName = user.name || user.displayName || user.email || 'Administrador';
      if (nameEl) nameEl.textContent = displayName;
      if (roleEl) roleEl.textContent = 'Super Administrador';

      if (avatarEl) {
        const photo = user.photoURL ||
          (Array.isArray(user.providerData) && user.providerData.find((p) => p && p.photoURL)?.photoURL) ||
          '';
        const initials = displayName.substring(0, 2).toUpperCase();

        if (photo) {
          avatarEl.innerHTML = `<img src="${photo}" alt="${displayName}" class="ops-user-avatar-img" referrerpolicy="no-referrer" loading="eager" onerror="this.remove(); this.parentElement.textContent='${initials}';">`;
          avatarEl.title = displayName;
        } else {
          avatarEl.textContent = initials;
          avatarEl.title = displayName;
        }
      }
    },

    showLoginGate() {
      const loginGate = document.getElementById('adminLoginGate');
      const opsWorkspace = document.getElementById('opsAppContainer');
      if (loginGate) loginGate.style.display = 'flex';
      if (opsWorkspace) opsWorkspace.style.display = 'none';
    },

    hideLoginGate() {
      const loginGate = document.getElementById('adminLoginGate');
      const opsWorkspace = document.getElementById('opsAppContainer');
      if (loginGate) loginGate.style.display = 'none';
      if (opsWorkspace) opsWorkspace.style.display = 'flex';
    },

    updateBadge(badgeId, count, type = 'neutral') {
      const badge = document.getElementById(badgeId);
      if (!badge) return;
      badge.textContent = count.toString();
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    },

    setText(elementId, text) {
      const el = document.getElementById(elementId);
      if (el) el.textContent = text;
    },

    escape(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }
  };

  // --------------------------------------------------------------------------
  // 9. FACHADA PÚBLICA (WINDOW.BAQUEANOOPSENGINE)
  // --------------------------------------------------------------------------
  window.BaqueanoOpsEngine = {
    init() {
      console.info('[BaqueanoOpsEngine] Inicializando cerebro de operaciones & CMS Universal...');
      OpsUI.init();
      OpsAuth.init();
    },

    // Navegación
    switchTab(tabId) {
      OpsUI.switchTab(tabId);
    },

    // Filtros y Búsqueda
    setFilterStatus(tabId, status) {
      OpsState.activeFilterStatus = status;
      OpsUI.renderEntityView(tabId);
    },

    onSearchInput(tabId, query) {
      OpsState.activeSearchQuery = query;
      OpsUI.renderEntityView(tabId);
    },

    toggleSelect(entityId, isChecked) {
      if (isChecked) OpsState.selectedIds.add(entityId);
      else OpsState.selectedIds.delete(entityId);
      OpsUI.updateBulkBar();
    },

    toggleSelectAll(tabId, isChecked) {
      const items = OpsState.collectionsData[tabId] || [];
      if (isChecked) {
        items.forEach((x) => OpsState.selectedIds.add(x.id));
      } else {
        OpsState.selectedIds.clear();
      }
      OpsUI.renderEntityView(tabId);
      OpsUI.updateBulkBar();
    },

    // Operaciones de Formulario / Drawer
    openCreateDrawer(tabId) {
      OpsUI.openDrawer(tabId, null);
    },

    openEditDrawer(tabId, entityId) {
      const item = (OpsState.collectionsData[tabId] || []).find((x) => x.id === entityId);
      if (item) OpsUI.openDrawer(tabId, item);
    },

    async previewEntity(tabId, entityId) {
      const item = (OpsState.collectionsData[tabId] || []).find((x) => x.id === entityId);
      if (!item) return;

      const modal = document.getElementById('opsPreviewModal');
      const titleEl = document.getElementById('previewModalTitle');
      const bodyEl = document.getElementById('previewModalBody');

      if (!modal || !bodyEl) return;

      titleEl.textContent = item.title || item.name || 'Vista Previa';
      bodyEl.innerHTML = `
        <div style="display:flex;gap:1.5rem;flex-wrap:wrap;">
          ${item.imageUrl ? `<img src="${item.imageUrl}" style="width:100%;max-height:260px;object-fit:cover;border-radius:var(--ops-radius-md);border:1px solid var(--ops-border-subtle);" alt="">` : ''}
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;">
              <span class="ops-badge-pill ${item.status || 'published'}">${item.status || 'published'}</span>
              <span style="font-size:0.8rem;color:var(--ops-text-secondary);">${item.department || 'Nacional'}</span>
            </div>
            <h2 style="font-size:1.3rem;color:#fff;margin:0 0 0.75rem 0;">${OpsUI.escape(item.title || item.name)}</h2>
            <p style="font-size:0.88rem;color:var(--ops-text-secondary);line-height:1.6;">${OpsUI.escape(item.description || 'Sin descripción detallada.')}</p>
            ${item.priceUsd ? `<div style="font-size:1.1rem;font-weight:700;color:var(--bq-accent);margin-top:1rem;">$${item.priceUsd} USD <span style="font-size:0.8rem;color:var(--ops-text-muted);">(C$ ${item.priceNio || item.priceUsd * 36.65})</span></div>` : ''}
          </div>
        </div>
      `;

      modal.classList.add('is-open');
      const closeBtn = document.getElementById('previewModalCloseBtn');
      if (closeBtn) closeBtn.onclick = () => modal.classList.remove('is-open');
    },

    // Mutaciones individuales
    async saveDestination(destData) {
      return OpsCMS.saveEntity('03-destinos', destData);
    },

    async duplicateEntity(tabId, entityId) {
      await OpsCMS.duplicate(tabId, entityId);
    },

    async trashEntity(tabId, entityId) {
      const confirmed = await OpsDialog.confirm({
        title: '¿Mover registro a la papelera?',
        message: 'El elemento se despublicará y podrá ser restaurado o eliminado definitivamente por el Superadministrador.',
        isDangerous: true,
        confirmText: 'Mover a Papelera'
      });
      if (confirmed) await OpsCMS.setTrashed(tabId, entityId, true);
    },

    async restoreEntity(tabId, entityId) {
      await OpsCMS.setTrashed(tabId, entityId, false);
    },

    async hardDeleteEntity(tabId, entityId) {
      const confirmed = await OpsDialog.confirm({
        title: '⚠️ ¿ELIMINACIÓN FÍSICA DEFINITIVA?',
        message: 'Esta acción borrará el registro para siempre de Cloud Firestore y no podrá recuperarse.',
        isDangerous: true,
        confirmText: 'Eliminar Permanentemente'
      });
      if (confirmed) await OpsCMS.hardDelete(tabId, entityId);
    },

    // Verificaciones & Suscripciones
    async verifyBusiness(businessId) {
      const confirmed = await OpsDialog.confirm({
        title: '¿Acreditar Sello Oficial BAQUEANO?',
        message: 'Se certificará que el negocio cumple la auditoría de campo bajo Ley 1210 y 1211.',
        confirmText: 'Asignar Sello'
      });
      if (!confirmed) return;

      const db = OpsCMS.getDb();
      if (!db) return;

      await db.collection('businesses').doc(businessId).update({
        verified: true,
        verificationStatus: 'verified',
        verifiedAt: new Date().toISOString(),
        verifiedBy: OpsState.currentUser?.email || 'admin',
        verificationNotes: 'Acreditado tras verificación presencial de estándares ecoturísticos.',
        status: 'published',
        updatedAt: new Date().toISOString()
      });

      OpsToast.show('Sello oficial asignado exitosamente.', 'success');
      OpsUI.renderVerificationsModule();
    },

    async revokeBusinessVerification(businessId) {
      const confirmed = await OpsDialog.confirm({
        title: '¿Revocar Sello de Verificación?',
        message: 'El negocio perderá el distintivo oficial de BAQUEANO en Web y Android.',
        isDangerous: true,
        confirmText: 'Revocar Sello'
      });
      if (!confirmed) return;

      const db = OpsCMS.getDb();
      if (!db) return;

      await db.collection('businesses').doc(businessId).update({
        verified: false,
        verificationStatus: 'unverified',
        updatedAt: new Date().toISOString()
      });

      OpsToast.show('Sello de verificación revocado.', 'warning');
      OpsUI.renderVerificationsModule();
    },

    async manageSubscription(businessId) {
      const confirmed = await OpsDialog.confirm({
        title: '¿Renovar Suscripción de Aliado por 1 Año?',
        message: 'Se actualizará la vigencia hasta el 31 de Diciembre del año en curso con comprobante fiscal validado.',
        confirmText: 'Renovar Membresía'
      });
      if (!confirmed) return;

      const db = OpsCMS.getDb();
      if (!db) return;

      await db.collection('businesses').doc(businessId).update({
        subscriptionStatus: 'active',
        subscriptionType: 'Comunitaria Anual',
        subscriptionStart: new Date().toISOString().split('T')[0],
        subscriptionEnd: `${new Date().getFullYear() + 1}-12-31`,
        updatedAt: new Date().toISOString()
      });

      OpsToast.show('Membresía renovada por 1 año.', 'success');
      OpsUI.renderSubscriptionsModule();
    },

    async saveGlobalAnnouncement() {
      const input = document.getElementById('cfgAnnouncementText');
      const text = input ? input.value.trim() : '';

      const db = OpsCMS.getDb();
      if (!db) return;

      await db.collection('app_config').doc('global').set({
        announcementText: text,
        updatedAt: new Date().toISOString(),
        updatedBy: OpsState.currentUser?.email || 'admin'
      }, { merge: true });

      OpsToast.show('Anuncio global sincronizado con Website y Android.', 'success');
    },

    async onDirectMediaUpload(file) {
      if (!file) return;
      try {
        const { downloadURL } = await OpsStorage.uploadFile(file, 'multimedia');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(downloadURL).catch(() => {});
        }
        OpsToast.show(`Archivo "${file.name}" subido. Enlace copiado al portapapeles.`, 'success', 4500);
      } catch (err) {
        OpsToast.show(`Error de carga: ${err.message}`, 'error');
      }
    },

    async seedInitialContent() {
      const confirmed = await OpsDialog.confirm({
        title: '¿Sincronizar Contenido Canónico a Firestore?',
        message: 'Se sembrarán cooperativas aliadas, platillos ancestrales, periodos históricos y destinos oficiales en Cloud Firestore para su gestión inmediata.',
        confirmText: 'Sembrar en Firestore'
      });
      if (confirmed) {
        await OpsCMS.seedInitialContent();
      }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // MÉTODOS DEL WEBSITE & PAGE BUILDER UNIVERSAL CMS
    // ══════════════════════════════════════════════════════════════════════════
    onBuilderPageChange(pageId) {
      OpsState.activeBuilderPage = pageId;
      OpsCMS.listenToPageSections(pageId);
      OpsUI.renderWebsiteBuilderModule(OpsState.activeTab);
    },

    setBuilderFilter(filter) {
      OpsState.activeBuilderFilter = filter;
      OpsUI.renderWebsiteBuilderModule(OpsState.activeTab);
    },

    onBuilderSearch(query) {
      OpsState.builderSearchQuery = query;
      OpsUI.renderWebsiteBuilderModule(OpsState.activeTab);
    },

    openSectionModal(pageId, sectionId) {
      OpsUI.openSectionModal(pageId, sectionId);
    },

    addSectionToPage(pageId) {
      OpsUI.openSectionModal(pageId, null);
    },

    async toggleSectionStatus(pageId, sectionId) {
      await OpsCMS.togglePageSectionStatus(pageId, sectionId);
      OpsUI.renderWebsiteBuilderModule(OpsState.activeTab);
    },

    async moveSectionOrder(pageId, sectionId, direction) {
      await OpsCMS.movePageSectionOrder(pageId, sectionId, direction);
      OpsUI.renderWebsiteBuilderModule(OpsState.activeTab);
    },

    async trashSection(pageId, sectionId) {
      await OpsCMS.trashPageSection(pageId, sectionId);
      OpsUI.renderWebsiteBuilderModule(OpsState.activeTab);
    },

    async restoreSection(pageId, sectionId) {
      await OpsCMS.restorePageSection(pageId, sectionId);
      OpsUI.renderWebsiteBuilderModule(OpsState.activeTab);
    },

    async hardDeleteSection(pageId, sectionId) {
      await OpsCMS.hardDeletePageSection(pageId, sectionId);
      OpsUI.renderWebsiteBuilderModule(OpsState.activeTab);
    },

    async resetPageToBaseline(pageId) {
      await OpsCMS.resetPageSectionsToBaseline(pageId);
      OpsUI.renderWebsiteBuilderModule(OpsState.activeTab);
    }
  };

  // --------------------------------------------------------------------------
  // 10. AUTO-INICIALIZACIÓN
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    window.BaqueanoOpsEngine.init();

    // Eventos de barra flotante de acciones masivas
    const btnBulkPub = document.getElementById('btnBulkPublish');
    const btnBulkDft = document.getElementById('btnBulkDraft');
    const btnBulkArc = document.getElementById('btnBulkArchive');
    const btnBulkTrs = document.getElementById('btnBulkTrash');

    if (btnBulkPub) btnBulkPub.addEventListener('click', () => OpsCMS.executeBulkAction(OpsState.activeTab, 'publish', Array.from(OpsState.selectedIds)));
    if (btnBulkDft) btnBulkDft.addEventListener('click', () => OpsCMS.executeBulkAction(OpsState.activeTab, 'draft', Array.from(OpsState.selectedIds)));
    if (btnBulkArc) btnBulkArc.addEventListener('click', () => OpsCMS.executeBulkAction(OpsState.activeTab, 'archive', Array.from(OpsState.selectedIds)));
    if (btnBulkTrs) btnBulkTrs.addEventListener('click', () => OpsCMS.executeBulkAction(OpsState.activeTab, 'trash', Array.from(OpsState.selectedIds)));
  });

})(window, document);
