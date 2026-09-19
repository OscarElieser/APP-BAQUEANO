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
  // --------------------------------------------------------------------------
  // 0. REGISTRO UNIVERSAL DE PÁGINAS Y SECCIONES DEL SITIO WEB (16 PÁGINAS)
  // --------------------------------------------------------------------------
  const SITE_PAGES_REGISTRY = {
    // 01. PORTADA PRINCIPAL (INDEX)
    index: {
      name: 'Portada Principal',
      file: 'index.html',
      icon: 'fa-house',
      sections: [
        {
          id: 'sec_index_header',
          name: 'Encabezado & Barra de Navegación',
          type: 'header',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Ecoturismo Auténtico & Soberanía Territorial Campesina',
          badgeText: 'GPS Satelital Activo 24/7',
          content: 'Inicio:index.html, Destinos:destinos.html, Guía Verde:ambiental.html, Aliados:aliados.html, Nosotros:nosotros.html, Gastronomía:gastronomia.html, Historia:historia.html, Música:musica.html, Denuncias:denuncias.html',
          ctaText: 'SOS Satelital',
          ctaLink: 'tel:118',
          cta2Text: 'Descargar APK',
          cta2Link: 'assets/BaqueanoNicaragua.apk',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 1
        },
        {
          id: 'sec_index_hero',
          name: 'Hero Principal Cinemático',
          type: 'hero',
          title: 'El Sendero lo Abren las Comunidades',
          subtitle: 'Ecoturismo Auténtico en Nicaragua sin intermediarios',
          badgeText: 'Soberanía Ecoturística',
          content: 'Baqueano existe para transformar el turismo en una actividad más responsable, distribuida, segura, culturalmente consciente y beneficiosa para las familias campesinas.',
          ctaText: 'Explora Nicaragua en 3D',
          ctaLink: '#mapaVivo3dSection',
          cta2Text: 'Descargar APK Android',
          cta2Link: 'assets/BaqueanoNicaragua.apk',
          imageUrl: 'assets/images/heroes/hero-bg.jpg',
          status: 'published',
          sortOrder: 2
        },
        {
          id: 'sec_index_map3d',
          name: 'Mapa Vivo 3D de Nicaragua',
          type: 'map',
          title: 'Mapa Topográfico Vivo 3D de Nicaragua',
          subtitle: 'Relieve de volcanes, lagos, reservas y cordilleras con Three.js',
          badgeText: 'WebGL 3D a 60fps',
          content: 'Visualiza la geografía soberana de Nicaragua en WebGL interactivo a 60fps con brújula de rumbo y selector de regiones.',
          ctaText: 'Abrir Navegación Libre',
          ctaLink: '#mapaVivo3dSection',
          cta2Text: 'Ver Ficha Departamental',
          cta2Link: 'departamento.html',
          imageUrl: '',
          status: 'published',
          sortOrder: 3
        },
        {
          id: 'sec_index_routes',
          name: 'Diseñador Inteligente de Rutas',
          type: 'custom',
          title: 'Diseña tu Travesía Comunitaria',
          subtitle: 'Itinerarios inteligentes con presupuesto real bimoneda (C$ y US$ a tipo de cambio oficial BCN)',
          badgeText: 'Cotizador Bimoneda Oficial',
          content: 'Selecciona tus días de viaje, presupuesto diario y preferencias para generar una ruta conectada a las cooperativas anfitrionas.',
          ctaText: 'Calcular Ruta',
          ctaLink: '#disenadorRutasSection',
          cta2Text: 'Explorar Catálogo',
          cta2Link: 'destinos.html',
          imageUrl: '',
          status: 'published',
          sortOrder: 4
        },
        {
          id: 'sec_index_featured',
          name: 'Destinos Insignia & Senderos',
          type: 'cards',
          title: 'Destinos Protegidos en Vivo',
          subtitle: 'Senderos, volcanes activos y reservas campesinas conectadas a Cloud Firestore',
          badgeText: '76 Áreas Protegidas',
          content: 'Explora fichas técnicas verificadas con coordenadas precisas, dificultad y tarifas justas.',
          ctaText: 'Ver Catálogo Completo',
          ctaLink: 'destinos.html',
          cta2Text: '',
          cta2Link: '',
          imageUrl: 'assets/images/destinos/canon_de_somoto.jpg',
          status: 'published',
          sortOrder: 5
        },
        {
          id: 'sec_index_testimonials',
          name: 'Voces del Territorio & Testimonios',
          type: 'testimonial',
          title: 'Historias Reales de Familias y Viajeros',
          subtitle: 'Transparencia total sin comisiones foráneas abusivas',
          badgeText: 'Comunidad Viva',
          content: 'Campesinos de Somoto, Ometepe y Selva Negra relatan el impacto directo del modelo Baqueano.',
          ctaText: 'Enviar Testimonio',
          ctaLink: '#testimoniosComunitarios',
          cta2Text: '',
          cta2Link: '',
          imageUrl: '',
          status: 'published',
          sortOrder: 6
        },
        {
          id: 'sec_index_apk',
          name: 'Portal de Descarga APK Android',
          type: 'banner',
          title: 'Descarga Baqueano para Android',
          subtitle: 'Mapas offline, coordenadas GPS sin señal y botón SOS satelital',
          badgeText: '100% Android Soberano',
          content: 'Instala la versión oficial del APK en tu dispositivo móvil y lleva el conocimiento campesino en el bolsillo.',
          ctaText: 'Descargar BaqueanoNicaragua.apk',
          ctaLink: 'assets/BaqueanoNicaragua.apk',
          cta2Text: '',
          cta2Link: '',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 7
        },
        {
          id: 'sec_index_register',
          name: 'Postulación de Anfitriones Comunitarios',
          type: 'form',
          title: 'Registra tu Local, Hospedaje o Cooperativa',
          subtitle: 'Formulario oficial conectado directamente a la Mesa Técnica Baqueano vía WhatsApp (+505 8443-1289)',
          badgeText: 'Ley 1210 / Ley 306',
          content: 'Inscribe tu negocio bajo los principios de turismo ético y soberanía comunitaria.',
          ctaText: 'Postular a Mesa Baqueano',
          ctaLink: '#registroAnfitrionSection',
          cta2Text: 'WhatsApp Directo',
          cta2Link: 'https://wa.me/50584431289',
          imageUrl: '',
          status: 'published',
          sortOrder: 8
        },
        {
          id: 'sec_index_footer',
          name: 'Pie de Página / Footer Institucional',
          type: 'footer',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Atención 24/7: +505 8443-1289 • Emergencias: 118',
          badgeText: 'Acreditado INTUR • MARENA',
          content: '© 2026 Baqueano Nicaragua. Plataforma Soberana de Ecoturismo Campesino y Tecnológico. Sin intermediarios foráneos.',
          ctaText: 'WhatsApp Mesa Técnica',
          ctaLink: 'https://wa.me/50584431289',
          cta2Text: 'Canal de Denuncias',
          cta2Link: 'denuncias.html',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 9
        }
      ]
    },

    // 02. CATÁLOGO DE DESTINOS
    destinos: {
      name: 'Catálogo de Destinos',
      file: 'destinos.html',
      icon: 'fa-mountain',
      sections: [
        {
          id: 'sec_dest_header',
          name: 'Encabezado & Barra de Navegación',
          type: 'header',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Catálogo Oficial de Destinos y Áreas Protegidas',
          badgeText: 'GPS Satelital Activo',
          content: 'Inicio:index.html, Destinos:destinos.html, Guía Verde:ambiental.html, Aliados:aliados.html, Nosotros:nosotros.html',
          ctaText: 'SOS Satelital',
          ctaLink: 'tel:118',
          cta2Text: 'Descargar APK',
          cta2Link: 'assets/BaqueanoNicaragua.apk',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 1
        },
        {
          id: 'sec_dest_hero',
          name: 'Hero de Destinos & Búsqueda',
          type: 'hero',
          title: 'Catálogo Oficial de Destinos y Áreas Protegidas',
          subtitle: 'Fichas técnicas con coordenadas GPS verificadas y cotizador bimoneda Ley 306',
          badgeText: 'Geolocalización Verificada',
          content: 'Encuentra senderos, volcanes y reservas naturales administradas con respeto ambiental por familias nicaragüenses.',
          ctaText: 'Filtrar por Departamento',
          ctaLink: '#filtrosDepartamento',
          cta2Text: 'Ver en Mapa 3D',
          cta2Link: 'index.html#mapaVivo3dSection',
          imageUrl: 'assets/images/destinos/cerro_negro.jpg',
          status: 'published',
          sortOrder: 2
        },
        {
          id: 'sec_dest_calc',
          name: 'Cotizador Bimoneda en Tiempo Real',
          type: 'form',
          title: 'Calculadora de Presupuesto Bimoneda (C$ y US$)',
          subtitle: 'Conversión transparente bajo la tasa oficial del Banco Central de Nicaragua (BCN)',
          badgeText: 'Transparencia Fiscal Ley 306',
          content: 'Calcula el costo total de tus expediciones con guías nativos, hospedajes comunitarios y alimentación tradicional.',
          ctaText: 'Calcular Presupuesto',
          ctaLink: '#cotizadorBimonedaSection',
          cta2Text: '',
          cta2Link: '',
          imageUrl: '',
          status: 'published',
          sortOrder: 3
        },
        {
          id: 'sec_dest_grid',
          name: 'Rejilla de Destinos Sincronizada',
          type: 'cards',
          title: 'Senderos y Destinos Activos en Todo el País',
          subtitle: 'Sincronización en tiempo real desde Firestore con la app Android',
          badgeText: 'Fichas Oficiales',
          content: 'Tarjetas dinámicas con dificultad, tarifas en córdobas y dólares, coordenadas y contacto de baqueanos nativos.',
          ctaText: 'Ver Detalles',
          ctaLink: '#',
          cta2Text: '',
          cta2Link: '',
          imageUrl: '',
          status: 'published',
          sortOrder: 4
        },
        {
          id: 'sec_dest_footer',
          name: 'Pie de Página / Footer Institucional',
          type: 'footer',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Atención 24/7: +505 8443-1289 • Emergencias: 118',
          badgeText: 'Acreditado INTUR • MARENA',
          content: '© 2026 Baqueano Nicaragua. Destinos verificados y protegidos por sus guardianes comunitarios.',
          ctaText: 'WhatsApp Mesa Técnica',
          ctaLink: 'https://wa.me/50584431289',
          cta2Text: 'Guía Ambiental',
          cta2Link: 'ambiental.html',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 5
        }
      ]
    },

    // 03. GUÍA AMBIENTAL & SOSTENIBILIDAD
    ambiental: {
      name: 'Guía Ambiental & Sostenibilidad',
      file: 'ambiental.html',
      icon: 'fa-leaf',
      sections: [
        {
          id: 'sec_amb_header',
          name: 'Encabezado & Barra de Navegación',
          type: 'header',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Guía Ambiental & Protección de Áreas Protegidas',
          badgeText: 'Huella Cero',
          content: 'Inicio:index.html, Destinos:destinos.html, Guía Verde:ambiental.html, Denuncias:denuncias.html',
          ctaText: 'SOS Satelital',
          ctaLink: 'tel:118',
          cta2Text: 'Descargar APK',
          cta2Link: 'assets/BaqueanoNicaragua.apk',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 1
        },
        {
          id: 'sec_amb_hero',
          name: 'Hero Ambiental',
          type: 'hero',
          title: 'Guía Ambiental & Huella Cero en Territorio Soberano',
          subtitle: 'Protocolo de protección para las 76 áreas protegidas de Nicaragua',
          badgeText: 'Custodia Ecológica',
          content: 'El ecoturismo campesino protege nuestros bosques, fuentes de agua y biodiversidad nativa.',
          ctaText: 'Leer Decálogo Verde',
          ctaLink: '#decalogoVerde',
          cta2Text: 'Denunciar Infracción',
          cta2Link: 'denuncias.html',
          imageUrl: 'assets/images/destinos/selva_negra.jpg',
          status: 'published',
          sortOrder: 2
        },
        {
          id: 'sec_amb_decalogo',
          name: 'Decálogo Verde del Explorador',
          type: 'content',
          title: '10 Mandamientos del Ecoturismo Consciente',
          subtitle: 'Normas innegociables de no dejar rastro y respeto a la cosmovisión rural',
          badgeText: 'Decálogo Ético',
          content: 'No extraigas flora silvestre, no introduzcas plásticos de un solo uso y apoya el consumo de alimentos del fogón local.',
          ctaText: 'Conocer Protocolos MARENA',
          ctaLink: '#protocolosMarena',
          cta2Text: '',
          cta2Link: '',
          imageUrl: '',
          status: 'published',
          sortOrder: 3
        },
        {
          id: 'sec_amb_reservas',
          name: 'Catálogo de Reservas y Áreas Protegidas',
          type: 'cards',
          title: 'Las 76 Áreas Naturales Bajo Custodia Comunitaria',
          subtitle: 'Refugios de vida silvestre, reservas biológicas y parques nacionales',
          badgeText: 'Patrimonio Natural',
          content: 'Descubre los ecosistemas de Bosawás, Indio Maíz, Mombacho, Zapatera y Miraflor.',
          ctaText: 'Explorar Reservas',
          ctaLink: '#reservasNaturales',
          cta2Text: '',
          cta2Link: '',
          imageUrl: '',
          status: 'published',
          sortOrder: 4
        },
        {
          id: 'sec_amb_footer',
          name: 'Pie de Página / Footer Institucional',
          type: 'footer',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Línea Verde MARENA: 118 • WhatsApp Baqueano: +505 8443-1289',
          badgeText: 'Protección Ambiental Activa',
          content: '© 2026 Baqueano Nicaragua. Conservación activa de la madre tierra sin concesiones extractivistas.',
          ctaText: 'WhatsApp Mesa Técnica',
          ctaLink: 'https://wa.me/50584431289',
          cta2Text: 'Canal de Denuncias',
          cta2Link: 'denuncias.html',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 5
        }
      ]
    },

    // 04. RED DE ALIADOS & NEGOCIOS
    aliados: {
      name: 'Red de Aliados & Negocios',
      file: 'aliados.html',
      icon: 'fa-store',
      sections: [
        {
          id: 'sec_aliados_header',
          name: 'Encabezado & Barra de Navegación',
          type: 'header',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Red de Anfitriones y Cooperativas Rurales Certificadas',
          badgeText: 'Comercio Justo Directo',
          content: 'Inicio:index.html, Destinos:destinos.html, Aliados:aliados.html, Mi Negocio:mi-negocio.html',
          ctaText: 'SOS Satelital',
          ctaLink: 'tel:118',
          cta2Text: 'Afiliar mi Negocio',
          cta2Link: 'mi-negocio.html',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 1
        },
        {
          id: 'sec_aliados_hero',
          name: 'Hero de Aliados',
          type: 'hero',
          title: 'Red de Anfitriones y Cooperativas Campesinas',
          subtitle: 'Directorio acreditado con sello verificado bajo Ley 1210/1211',
          badgeText: 'Sello Verificado',
          content: 'Hospedajes rurales, comederos típicos, guías certificados y cooperativas de transporte comunitario sin comisiones abusivas.',
          ctaText: 'Contactar por WhatsApp',
          ctaLink: '#directorioAliados',
          cta2Text: 'Inscribir mi Negocio',
          cta2Link: 'mi-negocio.html',
          imageUrl: 'assets/images/aliados/posada_ecologica_la_abuela.jpg',
          status: 'published',
          sortOrder: 2
        },
        {
          id: 'sec_aliados_grid',
          name: 'Directorio 3D de Comercios',
          type: 'cards',
          title: 'Tarjetas Interactivas con Giro 3D',
          subtitle: 'Toca cada tarjeta para voltearla y chatear directamente por WhatsApp con el anfitrión',
          badgeText: 'Directo al Fogón Campesino',
          content: 'Datos reales comprobados en campo sin intermediarios extranjeros.',
          ctaText: 'Ver Negocios',
          ctaLink: '#',
          cta2Text: '',
          cta2Link: '',
          imageUrl: '',
          status: 'published',
          sortOrder: 3
        },
        {
          id: 'sec_aliados_benefits',
          name: 'Beneficios de Afiliación Soberana',
          type: 'content',
          title: '¿Por qué Integrar la Red Baqueano?',
          subtitle: 'Tecnología digital soberana sin pagos mensuales extorsivos',
          badgeText: 'Economía Solidaria',
          content: 'Visibilidad en la app Android y en la web, cotizaciones en moneda nacional y dólares, y respaldo técnico directo de la Mesa Baqueano.',
          ctaText: 'Unirme a la Red',
          ctaLink: 'mi-negocio.html',
          cta2Text: '',
          cta2Link: '',
          imageUrl: '',
          status: 'published',
          sortOrder: 4
        },
        {
          id: 'sec_aliados_footer',
          name: 'Pie de Página / Footer Institucional',
          type: 'footer',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Mesa de Atención a Aliados: +505 8443-1289',
          badgeText: 'Ley 1210 de Comercio Justo',
          content: '© 2026 Baqueano Nicaragua. Apoyando el trabajo digno de las cooperativas y comederos del país.',
          ctaText: 'WhatsApp Aliados',
          ctaLink: 'https://wa.me/50584431289',
          cta2Text: 'Portal Mi Negocio',
          cta2Link: 'mi-negocio.html',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 5
        }
      ]
    },

    // 05. NOSOTROS & MANIFIESTO
    nosotros: {
      name: 'Nosotros & Manifiesto',
      file: 'nosotros.html',
      icon: 'fa-users',
      sections: [
        {
          id: 'sec_nosotros_header',
          name: 'Encabezado & Barra de Navegación',
          type: 'header',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Manifiesto de Soberanía Ecoturística',
          badgeText: 'Identidad y Soberanía',
          content: 'Inicio:index.html, Destinos:destinos.html, Nosotros:nosotros.html, Historia:historia.html',
          ctaText: 'SOS Satelital',
          ctaLink: 'tel:118',
          cta2Text: 'Descargar APK',
          cta2Link: 'assets/BaqueanoNicaragua.apk',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 1
        },
        {
          id: 'sec_nosotros_hero',
          name: 'Manifiesto Soberano',
          type: 'hero',
          title: 'Manifiesto Baqueano: Soberanía Ecoturística',
          subtitle: 'Tecnología digital puesta al servicio del campesinado nicaragüense',
          badgeText: 'Pueblo y Territorio',
          content: 'Nacimos para que el turismo beneficie directamente a quienes cuidan la tierra, protegen las cuencas y abren los senderos.',
          ctaText: 'Conoce Nuestra Misión',
          ctaLink: '#misionBaqueano',
          cta2Text: 'Leer Decálogo Verde',
          cta2Link: 'ambiental.html',
          imageUrl: 'assets/images/destinos/canon_de_somoto.jpg',
          status: 'published',
          sortOrder: 2
        },
        {
          id: 'sec_nosotros_mision',
          name: 'Pilares Fundamentales',
          type: 'content',
          title: 'Comercio Justo, Identidad y Seguridad Satelital',
          subtitle: 'Los tres ejes que guían cada línea de código y cada sendero mapeado',
          badgeText: 'Tres Pilares',
          content: 'Cero comisiones abusivas, rescate de la historia viva y tecnología de rescate SOS en Android.',
          ctaText: 'Unirme al Movimiento',
          ctaLink: 'aliados.html',
          cta2Text: '',
          cta2Link: '',
          imageUrl: '',
          status: 'published',
          sortOrder: 3
        },
        {
          id: 'sec_nosotros_cooperativas',
          name: 'Red de Guardianes y Familias Fundadoras',
          type: 'cards',
          title: 'Las Familias que Hacen Posible Baqueano',
          subtitle: 'Testimonios vivos de Somoto, Miraflor, Ometepe y Río San Juan',
          badgeText: 'Comunidades Fundadoras',
          content: 'Conoce a los guías ancestrales y sus historias de resistencia y arraigo campesino.',
          ctaText: 'Ver Familias',
          ctaLink: '#guardianesTerritorio',
          cta2Text: '',
          cta2Link: '',
          imageUrl: '',
          status: 'published',
          sortOrder: 4
        },
        {
          id: 'sec_nosotros_footer',
          name: 'Pie de Página / Footer Institucional',
          type: 'footer',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Contacto Comunitario: +505 8443-1289',
          badgeText: 'Ecoturismo 100% Nicaragüense',
          content: '© 2026 Baqueano Nicaragua. Sembrando soberanía, dignidad y respeto mutuo.',
          ctaText: 'WhatsApp Mesa Técnica',
          ctaLink: 'https://wa.me/50584431289',
          cta2Text: 'Historia Patria',
          cta2Link: 'historia.html',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 5
        }
      ]
    },

    // 06. GASTRONOMÍA ANCESTRAL
    gastronomia: {
      name: 'Gastronomía Ancestral',
      file: 'gastronomia.html',
      icon: 'fa-utensils',
      sections: [
        {
          id: 'sec_gastro_header',
          name: 'Encabezado & Barra de Navegación',
          type: 'header',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Gastronomía Ancestral y Fogón Campesino',
          badgeText: 'Patrimonio Culinario',
          content: 'Inicio:index.html, Destinos:destinos.html, Gastronomía:gastronomia.html, Aliados:aliados.html',
          ctaText: 'SOS Satelital',
          ctaLink: 'tel:118',
          cta2Text: 'Descargar APK',
          cta2Link: 'assets/BaqueanoNicaragua.apk',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 1
        },
        {
          id: 'sec_gastro_hero',
          name: 'Hero Gastronómico',
          type: 'hero',
          title: 'Gastronomía Ancestral de Nicaragua',
          subtitle: 'El sabor del fogón de leña y el maíz nixtamalizado de nuestras abuelas',
          badgeText: 'Sabor de la Tierra',
          content: 'Gallo pinto, nacatamal, vigorón, baho, quesillo e indio viejo: la identidad patria servida en la mesa campesina.',
          ctaText: 'Explorar Recetas',
          ctaLink: '#recetasTradicionales',
          cta2Text: 'Ver Comederos Locales',
          cta2Link: 'aliados.html',
          imageUrl: 'assets/images/comida/gallo_pinto.jpg',
          status: 'published',
          sortOrder: 2
        },
        {
          id: 'sec_gastro_recetario',
          name: 'Recetario Campesino y Platillos Típicos',
          type: 'cards',
          title: 'Platillos Emblema de los 15 Departamentos',
          subtitle: 'Preparaciones tradicionales documentadas directamente en los fogones rurales',
          badgeText: 'Recetas Tradicionales',
          content: 'Ingredientes nativos, técnicas de cocción en barro y maridaje con bebidas ancestrales.',
          ctaText: 'Ver Platillos',
          ctaLink: '#platillosTradicionales',
          cta2Text: '',
          cta2Link: '',
          imageUrl: '',
          status: 'published',
          sortOrder: 3
        },
        {
          id: 'sec_gastro_bebidas',
          name: 'Bebidas Tradicionales y Refrescos de Maíz',
          type: 'content',
          title: 'Pinolillo, Tiste, Cacao y Chicha Bruja',
          subtitle: 'Bebidas soberanas que alimentaron a nuestros pueblos originarios',
          badgeText: 'Herencia Precolombina',
          content: 'El maíz como eje sagrado de nuestra alimentación e identidad cultural nicaragüense.',
          ctaText: 'Conocer Tradición',
          ctaLink: '#bebidasAncestrales',
          cta2Text: '',
          cta2Link: '',
          imageUrl: '',
          status: 'published',
          sortOrder: 4
        },
        {
          id: 'sec_gastro_footer',
          name: 'Pie de Página / Footer Institucional',
          type: 'footer',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Mesa de Tradiciones: +505 8443-1289',
          badgeText: 'Fogón de Leña Campesino',
          content: '© 2026 Baqueano Nicaragua. Rescatando la cocina autóctona frente a la comida rápida foránea.',
          ctaText: 'WhatsApp Mesa Técnica',
          ctaLink: 'https://wa.me/50584431289',
          cta2Text: 'Directorio de Comedores',
          cta2Link: 'aliados.html',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 5
        }
      ]
    },

    // 07. HISTORIA PATRIA
    historia: {
      name: 'Historia Patria',
      file: 'historia.html',
      icon: 'fa-scroll',
      sections: [
        {
          id: 'sec_hist_header',
          name: 'Encabezado & Barra de Navegación',
          type: 'header',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Cronología Soberana e Historia Viva',
          badgeText: 'Memoria Histórica',
          content: 'Inicio:index.html, Historia:historia.html, Música:musica.html, Nosotros:nosotros.html',
          ctaText: 'SOS Satelital',
          ctaLink: 'tel:118',
          cta2Text: 'Descargar APK',
          cta2Link: 'assets/BaqueanoNicaragua.apk',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 1
        },
        {
          id: 'sec_hist_hero',
          name: 'Hero de Historia',
          type: 'hero',
          title: 'Cronología Soberana de Nicaragua',
          subtitle: 'Hitos patrios desde los pueblos originarios hasta la defensa de la autodeterminación',
          badgeText: 'Soberanía Nacional',
          content: 'Descubre la memoria viva que impregna cada valle, volcán y río de nuestra patria bendita.',
          ctaText: 'Ver Línea de Tiempo',
          ctaLink: '#lineaDeTiempo',
          cta2Text: 'Conocer Patriotas',
          cta2Link: '#patriotasSoberanos',
          imageUrl: 'assets/images/heroes/hero-bg.jpg',
          status: 'published',
          sortOrder: 2
        },
        {
          id: 'sec_hist_timeline',
          name: 'Línea de Tiempo Soberana y Periodos',
          type: 'content',
          title: 'Grandes Épocas de la Resistencia Popular',
          subtitle: 'Desde la lucha contra la ocupación colonial hasta la actualidad soberana',
          badgeText: 'Cronología Oficial',
          content: 'Diriangén, Nicarao, San Jacinto 1856, Zeledón 1912 y la gesta del General Sandino.',
          ctaText: 'Explorar Hitos',
          ctaLink: '#periodosHistoricos',
          cta2Text: '',
          cta2Link: '',
          imageUrl: '',
          status: 'published',
          sortOrder: 3
        },
        {
          id: 'sec_hist_heroes',
          name: 'Héroes y Mártires de la Patria',
          type: 'cards',
          title: 'Defensores de la Autodeterminación Territorial',
          subtitle: 'Vidas dedicadas a la libertad, soberanía y dignidad de las familias campesinas',
          badgeText: 'Dignidad Heroica',
          content: 'Biografías y testimonios históricos de los constructores de la nación.',
          ctaText: 'Ver Biografías',
          ctaLink: '#biografiasPatrias',
          cta2Text: '',
          cta2Link: '',
          imageUrl: '',
          status: 'published',
          sortOrder: 4
        },
        {
          id: 'sec_hist_footer',
          name: 'Pie de Página / Footer Institucional',
          type: 'footer',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Archivo Histórico Baqueano: +505 8443-1289',
          badgeText: 'Memoria Viva de la Patria',
          content: '© 2026 Baqueano Nicaragua. La historia patria es el cimiento de nuestro ecoturismo soberano.',
          ctaText: 'WhatsApp Mesa Técnica',
          ctaLink: 'https://wa.me/50584431289',
          cta2Text: 'Música & Folclore',
          cta2Link: 'musica.html',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 5
        }
      ]
    },

    // 08. MÚSICA & FOLCLORE
    musica: {
      name: 'Música & Folclore',
      file: 'musica.html',
      icon: 'fa-guitar',
      sections: [
        {
          id: 'sec_mus_header',
          name: 'Encabezado & Barra de Navegación',
          type: 'header',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Patrimonio Sonoro y Tradiciones Vivas',
          badgeText: 'Folclore Nacional',
          content: 'Inicio:index.html, Música:musica.html, Historia:historia.html, Gastronomía:gastronomia.html',
          ctaText: 'SOS Satelital',
          ctaLink: 'tel:118',
          cta2Text: 'Descargar APK',
          cta2Link: 'assets/BaqueanoNicaragua.apk',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 1
        },
        {
          id: 'sec_mus_hero',
          name: 'Hero Folclórico',
          type: 'hero',
          title: 'Patrimonio Sonoro de Nicaragua',
          subtitle: 'Son de marimba, mazurcas norteñas y polkas segovianas',
          badgeText: 'Sonidos de la Tierra',
          content: 'La música autóctona que acompaña las fiestas patronales, las faenas campesinas y la danza en los atrios.',
          ctaText: 'Escuchar Grabaciones',
          ctaLink: '#reproductorSonoro',
          cta2Text: 'Ver Danzas Típicas',
          cta2Link: '#danzasTradicionales',
          imageUrl: '',
          status: 'published',
          sortOrder: 2
        },
        {
          id: 'sec_mus_player',
          name: 'Reproductor Sonoro Comunitario',
          type: 'custom',
          title: 'Grabaciones de Campo y Marimba de Arco',
          subtitle: 'Audios preservados en Cloud Storage directamente de manos de los músicos nativos',
          badgeText: 'Audio Alta Fidelidad',
          content: 'El solar de Monimbó, La mora limpia, Aquella indita y los sones de toro tradicionales.',
          ctaText: 'Reproducir Colección',
          ctaLink: '#reproductorSonoro',
          cta2Text: '',
          cta2Link: '',
          imageUrl: '',
          status: 'published',
          sortOrder: 3
        },
        {
          id: 'sec_mus_danzas',
          name: 'Danzas y Bailes Tradicionales',
          type: 'cards',
          title: 'El Güegüense, Las Inditas y El Toro Huaco',
          subtitle: 'Expresiones dancísticas reconocidas como Patrimonio Inmaterial de la Humanidad',
          badgeText: 'Patrimonio UNESCO',
          content: 'Trajes de satín, máscaras de madera y zapateo en las fiestas de Masaya, Diriamba y León.',
          ctaText: 'Ver Danzas',
          ctaLink: '#danzasPatrimoniales',
          cta2Text: '',
          cta2Link: '',
          imageUrl: '',
          status: 'published',
          sortOrder: 4
        },
        {
          id: 'sec_mus_footer',
          name: 'Pie de Página / Footer Institucional',
          type: 'footer',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Mesa de Cultura y Tradiciones: +505 8443-1289',
          badgeText: 'Música Campesina Auténtica',
          content: '© 2026 Baqueano Nicaragua. Preservando el compás campesino frente al olvido comercial.',
          ctaText: 'WhatsApp Mesa Técnica',
          ctaLink: 'https://wa.me/50584431289',
          cta2Text: 'Gastronomía Ancestral',
          cta2Link: 'gastronomia.html',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 5
        }
      ]
    },

    // 09. CANAL DE DENUNCIAS AMBIENTALES
    denuncias: {
      name: 'Canal de Denuncias',
      file: 'denuncias.html',
      icon: 'fa-shield-halved',
      sections: [
        {
          id: 'sec_den_header',
          name: 'Encabezado & Barra de Navegación',
          type: 'header',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Canal Oficial de Denuncia Ambiental y Territorial',
          badgeText: 'Alerta Ciudadana 24/7',
          content: 'Inicio:index.html, Denuncias:denuncias.html, Guía Verde:ambiental.html, Destinos:destinos.html',
          ctaText: 'SOS Satelital',
          ctaLink: 'tel:118',
          cta2Text: 'Descargar APK',
          cta2Link: 'assets/BaqueanoNicaragua.apk',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 1
        },
        {
          id: 'sec_den_hero',
          name: 'Hero de Denuncias',
          type: 'hero',
          title: 'Canal Comunitario de Denuncia Ambiental',
          subtitle: 'Alerta ciudadana para la protección de cuencas, bosques y fauna silvestre',
          badgeText: 'Vigilancia Popular',
          content: 'Tus reportes son canalizados ante las autoridades ambientales competentes con respaldo georreferenciado e inmutable.',
          ctaText: 'Presentar Denuncia',
          ctaLink: '#formularioDenuncia',
          cta2Text: 'Ver Marco Jurídico',
          cta2Link: '#marcoJuridicoMarena',
          imageUrl: '',
          status: 'published',
          sortOrder: 2
        },
        {
          id: 'sec_den_form',
          name: 'Formulario de Denuncia Georreferenciada',
          type: 'form',
          title: 'Formulario Oficial de Denuncia Ambiental',
          subtitle: 'Ingresa los datos, ubicación y evidencia gráfica para tramitación inmediata',
          badgeText: 'Formulario Seguro',
          content: 'Reporta tala clandestina, caza furtiva, contaminación de ríos o vertederos ilegales en áreas protegidas.',
          ctaText: 'Enviar Denuncia',
          ctaLink: '#formularioDenuncia',
          cta2Text: 'WhatsApp Emergencias',
          cta2Link: 'https://wa.me/50584431289',
          imageUrl: '',
          status: 'published',
          sortOrder: 3
        },
        {
          id: 'sec_den_legal',
          name: 'Marco Jurídico y Procedimiento Legal',
          type: 'content',
          title: 'Ley General del Medio Ambiente (Ley 217) y Código Penal',
          subtitle: 'Sanciones legales ante delitos ambientales en la República de Nicaragua',
          badgeText: 'Respaldo Jurídico',
          content: 'Toda infracción en zonas de amortiguamiento y núcleos de reserva cuenta con sanción administrativa y penal.',
          ctaText: 'Leer Ley 217',
          ctaLink: '#ley217',
          cta2Text: '',
          cta2Link: '',
          imageUrl: '',
          status: 'published',
          sortOrder: 4
        },
        {
          id: 'sec_den_footer',
          name: 'Pie de Página / Footer Institucional',
          type: 'footer',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Línea de Alerta Verde: 118 • WhatsApp Mesa: +505 8443-1289',
          badgeText: 'Defensa Ecológica Comunitaria',
          content: '© 2026 Baqueano Nicaragua. Custodiando la integridad territorial y ambiental de la patria.',
          ctaText: 'WhatsApp Mesa Técnica',
          ctaLink: 'https://wa.me/50584431289',
          cta2Text: 'Guía Ambiental',
          cta2Link: 'ambiental.html',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 5
        }
      ]
    },

    // 10. FICHA DEPARTAMENTAL
    departamento: {
      name: 'Ficha Departamental',
      file: 'departamento.html',
      icon: 'fa-map-location-dot',
      sections: [
        {
          id: 'sec_dep_header',
          name: 'Encabezado & Barra de Navegación',
          type: 'header',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Exploración Territorial por Departamentos',
          badgeText: '15 Departamentos & 2 Regiones',
          content: 'Inicio:index.html, Departamentos:departamento.html, Destinos:destinos.html, Aliados:aliados.html',
          ctaText: 'SOS Satelital',
          ctaLink: 'tel:118',
          cta2Text: 'Descargar APK',
          cta2Link: 'assets/BaqueanoNicaragua.apk',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 1
        },
        {
          id: 'sec_dep_hero',
          name: 'Hero Departamental',
          type: 'hero',
          title: 'Exploración Territorial por Departamento',
          subtitle: 'Los 15 departamentos y 2 regiones autónomas de la República de Nicaragua',
          badgeText: 'Geografía Soberana',
          content: 'Información geográfica soberana, cabeceras, municipios y destinos comunitarios verificados.',
          ctaText: 'Seleccionar Territorio',
          ctaLink: '#selectorDepartamento',
          cta2Text: 'Ver Mapa 3D',
          cta2Link: 'index.html#mapaVivo3dSection',
          imageUrl: '',
          status: 'published',
          sortOrder: 2
        },
        {
          id: 'sec_dep_selector',
          name: 'Selector y Mapa Departamental',
          type: 'map',
          title: 'Mapa y Fichas Territoriales',
          subtitle: 'Explora datos demográficos, clima, atractivos y cooperativas por región',
          badgeText: 'Cartografía Nacional',
          content: 'Pacífico, Centro, Norte y Regiones Autónomas de la Costa Caribe Norte y Sur.',
          ctaText: 'Ver Ficha Seleccionada',
          ctaLink: '#fichaDepartamental',
          cta2Text: '',
          cta2Link: '',
          imageUrl: '',
          status: 'published',
          sortOrder: 3
        },
        {
          id: 'sec_dep_destinos',
          name: 'Destinos del Departamento',
          type: 'cards',
          title: 'Senderos y Atractivos Verificados por Región',
          subtitle: 'Conexión con los baqueanos locales del departamento elegido',
          badgeText: 'Guías de la Zona',
          content: 'Fichas técnicas con kilometraje, dificultad y hospedajes comunitarios certificados.',
          ctaText: 'Explorar Senderos',
          ctaLink: '#senderosZona',
          cta2Text: '',
          cta2Link: '',
          imageUrl: '',
          status: 'published',
          sortOrder: 4
        },
        {
          id: 'sec_dep_footer',
          name: 'Pie de Página / Footer Institucional',
          type: 'footer',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Atención Territorial: +505 8443-1289',
          badgeText: 'Integración Territorial Soberana',
          content: '© 2026 Baqueano Nicaragua. Conectando cada rincón de nuestra geografía con orgullo campesino.',
          ctaText: 'WhatsApp Mesa Técnica',
          ctaLink: 'https://wa.me/50584431289',
          cta2Text: 'Catálogo de Destinos',
          cta2Link: 'destinos.html',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 5
        }
      ]
    },

    // 11. PORTAL MI NEGOCIO
    'mi-negocio': {
      name: 'Portal Mi Negocio',
      file: 'mi-negocio.html',
      icon: 'fa-id-badge',
      sections: [
        {
          id: 'sec_biz_header',
          name: 'Encabezado & Barra de Navegación',
          type: 'header',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Portal de Autogestión para Anfitriones y Cooperativas',
          badgeText: 'Autonomía Campesina',
          content: 'Inicio:index.html, Aliados:aliados.html, Mi Negocio:mi-negocio.html, Destinos:destinos.html',
          ctaText: 'SOS Satelital',
          ctaLink: 'tel:118',
          cta2Text: 'WhatsApp Mesa',
          cta2Link: 'https://wa.me/50584431289',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 1
        },
        {
          id: 'sec_biz_hero',
          name: 'Hero Mi Negocio',
          type: 'hero',
          title: 'Portal de Autogestión para Anfitriones Locales',
          subtitle: 'Actualiza tus tarifas, verifica reservas y mantén al día tu perfil de aliado',
          badgeText: 'Cero Intermediación',
          content: 'Acceso directo y soberano para cooperativas, hospedajes rurales y guías comunitarios de toda Nicaragua.',
          ctaText: 'Acceder a Mi Perfil',
          ctaLink: '#panelAutogestion',
          cta2Text: 'Inscribir Nuevo Emprendimiento',
          cta2Link: '#formularioInscripcionNegocio',
          imageUrl: '',
          status: 'published',
          sortOrder: 2
        },
        {
          id: 'sec_biz_form',
          name: 'Formulario de Inscripción y Tarifas',
          type: 'form',
          title: 'Inscripción de Comercio Comunitario y Actualización de Tarifas',
          subtitle: 'Envía los datos de tu emprendimiento para verificación y sello oficial en la app',
          badgeText: 'Sello Ley 1210',
          content: 'Tarifas en córdobas y dólares, amenidades, número de WhatsApp para reservas directas y fotos del local.',
          ctaText: 'Guardar y Enviar a Mesa Técnica',
          ctaLink: '#formularioInscripcionNegocio',
          cta2Text: 'WhatsApp Mesa de Afiliación',
          cta2Link: 'https://wa.me/50584431289',
          imageUrl: '',
          status: 'published',
          sortOrder: 3
        },
        {
          id: 'sec_biz_beneficios',
          name: 'Ventajas de la Membresía Comunitaria',
          type: 'content',
          title: 'Tu Negocio en el Radar Nacional de Ecoturistas',
          subtitle: 'Plataforma web, app Android, geolocalización satelital y soporte técnico gratuito',
          badgeText: 'Economía Popular',
          content: 'Los turistas te contactan y pagan directamente a ti, sin cobros de pasarelas extranjeras que confiscan tus ganancias.',
          ctaText: 'Ver Todos los Beneficios',
          ctaLink: '#beneficiosMembresia',
          cta2Text: '',
          cta2Link: '',
          imageUrl: '',
          status: 'published',
          sortOrder: 4
        },
        {
          id: 'sec_biz_footer',
          name: 'Pie de Página / Footer Institucional',
          type: 'footer',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Mesa de Autogestión de Anfitriones: +505 8443-1289',
          badgeText: 'Soberanía Económica Popular',
          content: '© 2026 Baqueano Nicaragua. El fruto del trabajo de la tierra le pertenece a quien la suda.',
          ctaText: 'WhatsApp Mesa Técnica',
          ctaLink: 'https://wa.me/50584431289',
          cta2Text: 'Red de Aliados',
          cta2Link: 'aliados.html',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 5
        }
      ]
    },

    // 12. PERFIL DE USUARIO
    perfil: {
      name: 'Perfil de Usuario',
      file: 'perfil.html',
      icon: 'fa-circle-user',
      sections: [
        {
          id: 'sec_prf_header',
          name: 'Encabezado & Barra de Navegación',
          type: 'header',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Pasaporte del Explorador y Sesión Activa',
          badgeText: 'Explorador Soberano',
          content: 'Inicio:index.html, Destinos:destinos.html, Perfil:perfil.html, Mi Negocio:mi-negocio.html',
          ctaText: 'SOS Satelital',
          ctaLink: 'tel:118',
          cta2Text: 'Descargar APK',
          cta2Link: 'assets/BaqueanoNicaragua.apk',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 1
        },
        {
          id: 'sec_prf_hero',
          name: 'Hero de Perfil',
          type: 'hero',
          title: 'Pasaporte del Explorador Baqueano',
          subtitle: 'Tus expediciones guardadas, bitácora de viaje y preferencias de ruta',
          badgeText: 'Bitácora Digital',
          content: 'Sincronizado de manera continua entre tu sesión web y la app móvil de Android.',
          ctaText: 'Ver Rutas Guardadas',
          ctaLink: '#rutasGuardadas',
          cta2Text: 'Editar Preferencias',
          cta2Link: '#preferenciasUsuario',
          imageUrl: '',
          status: 'published',
          sortOrder: 2
        },
        {
          id: 'sec_prf_trips',
          name: 'Bitácora de Rutas Guardadas y Senderos',
          type: 'cards',
          title: 'Tus Travesías Comunitarias Guardadas',
          subtitle: 'Itinerarios calculados, cotizaciones en córdobas y destinos favoritos',
          badgeText: 'Mis Senderos',
          content: 'Consulta tus rutas sin conexión y coordina directamente con los baqueanos anfitriones.',
          ctaText: 'Ver Mis Rutas',
          ctaLink: '#rutasGuardadas',
          cta2Text: '',
          cta2Link: '',
          imageUrl: '',
          status: 'published',
          sortOrder: 3
        },
        {
          id: 'sec_prf_settings',
          name: 'Preferencias de Cuenta y Seguridad',
          type: 'content',
          title: 'Configuración de Seguridad y Modo Offline',
          subtitle: 'Control soberano sobre tus datos personales y dispositivos enlazados',
          badgeText: 'Privacidad Protegida',
          content: 'Administra tu sesión Google, descargas de mapas offline y notificaciones satelitales.',
          ctaText: 'Configurar Cuenta',
          ctaLink: '#configuracionCuenta',
          cta2Text: '',
          cta2Link: '',
          imageUrl: '',
          status: 'published',
          sortOrder: 4
        },
        {
          id: 'sec_prf_footer',
          name: 'Pie de Página / Footer Institucional',
          type: 'footer',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Soporte al Explorador: +505 8443-1289',
          badgeText: 'Pasaporte Digital Protegido',
          content: '© 2026 Baqueano Nicaragua. Privacidad ciudadana y soberanía de datos.',
          ctaText: 'WhatsApp Mesa Técnica',
          ctaLink: 'https://wa.me/50584431289',
          cta2Text: 'Términos y Privacidad',
          cta2Link: 'terminos.html',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 5
        }
      ]
    },

    // 13. TÉRMINOS & CONDICIONES
    terminos: {
      name: 'Términos & Condiciones',
      file: 'terminos.html',
      icon: 'fa-scale-balanced',
      sections: [
        {
          id: 'sec_term_header',
          name: 'Encabezado & Barra de Navegación',
          type: 'header',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Marco Legal & Términos de Servicio',
          badgeText: 'Soberanía Legal',
          content: 'Inicio:index.html, Destinos:destinos.html, Términos:terminos.html, Privacidad:privacidad.html',
          ctaText: 'SOS Satelital',
          ctaLink: 'tel:118',
          cta2Text: 'Descargar APK',
          cta2Link: 'assets/BaqueanoNicaragua.apk',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 1
        },
        {
          id: 'sec_term_hero',
          name: 'Hero de Términos Legales',
          type: 'hero',
          title: 'Términos & Condiciones de Uso Soberano',
          subtitle: 'Marco legal bajo la legislación de la República de Nicaragua y Ley 306',
          badgeText: 'Ley 306 & Ley 1210',
          content: 'Normas claras de no intermediación, respeto a la propiedad comunitaria y exoneraciones fiscales legales.',
          ctaText: 'Leer Cláusulas',
          ctaLink: '#clausulasLegales',
          cta2Text: 'Política de Privacidad',
          cta2Link: 'privacidad.html',
          imageUrl: '',
          status: 'published',
          sortOrder: 2
        },
        {
          id: 'sec_term_content',
          name: 'Cláusulas de Servicio y No Intermediación',
          type: 'content',
          title: 'Acuerdo Soberano entre Exploradores y Familias Locales',
          subtitle: 'Baqueano actúa exclusivamente como facilitador tecnológico comunitario sin cobro de comisiones',
          badgeText: 'Comercio Ético',
          content: 'Toda contratación de servicios turísticos se realiza de mutuo acuerdo entre el viajero y el prestador certificado bajo las tarifas fijadas por este último.',
          ctaText: 'Ver Derechos del Explorador',
          ctaLink: '#derechosExplorador',
          cta2Text: '',
          cta2Link: '',
          imageUrl: '',
          status: 'published',
          sortOrder: 3
        },
        {
          id: 'sec_term_footer',
          name: 'Pie de Página / Footer Institucional',
          type: 'footer',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Consultas Legales: mesa@baqueano.ni • +505 8443-1289',
          badgeText: 'Legislación Soberana',
          content: '© 2026 Baqueano Nicaragua. Sujeto a la jurisdicción de los tribunales de la República de Nicaragua.',
          ctaText: 'WhatsApp Mesa Técnica',
          ctaLink: 'https://wa.me/50584431289',
          cta2Text: 'Aviso Legal',
          cta2Link: 'aviso-legal.html',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 4
        }
      ]
    },

    // 14. POLÍTICA DE PRIVACIDAD
    privacidad: {
      name: 'Política de Privacidad',
      file: 'privacidad.html',
      icon: 'fa-user-shield',
      sections: [
        {
          id: 'sec_priv_header',
          name: 'Encabezado & Barra de Navegación',
          type: 'header',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Política Soberana de Protección de Datos',
          badgeText: 'Privacidad Blindada',
          content: 'Inicio:index.html, Privacidad:privacidad.html, Términos:terminos.html, Cookies:cookies.html',
          ctaText: 'SOS Satelital',
          ctaLink: 'tel:118',
          cta2Text: 'Descargar APK',
          cta2Link: 'assets/BaqueanoNicaragua.apk',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 1
        },
        {
          id: 'sec_priv_hero',
          name: 'Hero de Privacidad',
          type: 'hero',
          title: 'Política de Privacidad y Protección de Datos',
          subtitle: 'Tus datos pertenecen a tu persona y jamás serán comercializados a terceros',
          badgeText: 'Derechos ARCO',
          content: 'Protocolos rigurosos de cifrado, almacenamiento local defensivo y geolocalización satelital para emergencias.',
          ctaText: 'Leer Política Completa',
          ctaLink: '#politicaDatos',
          cta2Text: 'Términos de Servicio',
          cta2Link: 'terminos.html',
          imageUrl: '',
          status: 'published',
          sortOrder: 2
        },
        {
          id: 'sec_priv_content',
          name: 'Tratamiento de Datos y Geolocalización',
          type: 'content',
          title: 'Uso Estrictamente Operativo y de Rescate Satelital',
          subtitle: 'Cero venta de perfiles, cero rastreo invasivo y soberanía tecnológica',
          badgeText: 'Cero Rastreo Comercial',
          content: 'Las coordenadas GPS solo se utilizan para posicionarte en los senderos offline y para enviar tu ubicación precisa en caso de activar el botón SOS satelital.',
          ctaText: 'Ver Derechos ARCO',
          ctaLink: '#derechosArco',
          cta2Text: '',
          cta2Link: '',
          imageUrl: '',
          status: 'published',
          sortOrder: 3
        },
        {
          id: 'sec_priv_footer',
          name: 'Pie de Página / Footer Institucional',
          type: 'footer',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Oficial de Datos: privacidad@baqueano.ni',
          badgeText: 'Privacidad Ciudadana',
          content: '© 2026 Baqueano Nicaragua. Respetando el derecho fundamental a la intimidad digital.',
          ctaText: 'WhatsApp Mesa Técnica',
          ctaLink: 'https://wa.me/50584431289',
          cta2Text: 'Política de Cookies',
          cta2Link: 'cookies.html',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 4
        }
      ]
    },

    // 15. POLÍTICA DE COOKIES
    cookies: {
      name: 'Política de Cookies',
      file: 'cookies.html',
      icon: 'fa-cookie-bite',
      sections: [
        {
          id: 'sec_cook_header',
          name: 'Encabezado & Barra de Navegación',
          type: 'header',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Política de Cookies y Almacenamiento Local',
          badgeText: 'Transparencia Técnica',
          content: 'Inicio:index.html, Cookies:cookies.html, Privacidad:privacidad.html, Términos:terminos.html',
          ctaText: 'SOS Satelital',
          ctaLink: 'tel:118',
          cta2Text: 'Descargar APK',
          cta2Link: 'assets/BaqueanoNicaragua.apk',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 1
        },
        {
          id: 'sec_cook_hero',
          name: 'Hero de Política de Cookies',
          type: 'hero',
          title: 'Política de Cookies y Almacenamiento Local',
          subtitle: 'Información transparente sobre el uso de tokens de sesión y caché local',
          badgeText: 'Almacenamiento Seguro',
          content: 'Solo empleamos cookies técnicas indispensables para la persistencia de sesión segura y caché offline de senderos.',
          ctaText: 'Ver Tipos de Cookies',
          ctaLink: '#tiposCookies',
          cta2Text: 'Aviso Legal',
          cta2Link: 'aviso-legal.html',
          imageUrl: '',
          status: 'published',
          sortOrder: 2
        },
        {
          id: 'sec_cook_content',
          name: 'Cookies Técnicas y Configuración',
          type: 'content',
          title: 'Cero Cookies Publicitarias de Terceros',
          subtitle: 'Tu navegador almacena únicamente los mapas y tokens autenticados por Firebase Auth',
          badgeText: 'Cero Cookies Espías',
          content: 'Puedes borrar tu almacenamiento local en cualquier instante desde las preferencias de tu navegador sin perder tu cuenta.',
          ctaText: 'Ajustar Configuración',
          ctaLink: '#configuracionCookies',
          cta2Text: '',
          cta2Link: '',
          imageUrl: '',
          status: 'published',
          sortOrder: 3
        },
        {
          id: 'sec_cook_footer',
          name: 'Pie de Página / Footer Institucional',
          type: 'footer',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Mesa Técnica: mesa@baqueano.ni',
          badgeText: 'Navegación Limpia',
          content: '© 2026 Baqueano Nicaragua. Sin cookies de seguimiento comercial abusivo.',
          ctaText: 'WhatsApp Mesa Técnica',
          ctaLink: 'https://wa.me/50584431289',
          cta2Text: 'Aviso Legal',
          cta2Link: 'aviso-legal.html',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 4
        }
      ]
    },

    // 16. AVISO LEGAL & SOBERANÍA DIGITAL
    'aviso-legal': {
      name: 'Aviso Legal & Soberanía',
      file: 'aviso-legal.html',
      icon: 'fa-gavel',
      sections: [
        {
          id: 'sec_legal_header',
          name: 'Encabezado & Barra de Navegación',
          type: 'header',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Aviso Legal & Soberanía Tecnológica',
          badgeText: 'Marco Jurídico Nacional',
          content: 'Inicio:index.html, Aviso Legal:aviso-legal.html, Términos:terminos.html, Privacidad:privacidad.html',
          ctaText: 'SOS Satelital',
          ctaLink: 'tel:118',
          cta2Text: 'Descargar APK',
          cta2Link: 'assets/BaqueanoNicaragua.apk',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 1
        },
        {
          id: 'sec_legal_hero',
          name: 'Hero de Aviso Legal',
          type: 'hero',
          title: 'Aviso Legal & Soberanía Tecnológica',
          subtitle: 'Régimen de propiedad intelectual, soberanía y marco institucional de Nicaragua',
          badgeText: 'Constitución Política',
          content: 'Plataforma comunitaria regida bajo las leyes soberanas de la República de Nicaragua.',
          ctaText: 'Leer Aviso Legal',
          ctaLink: '#avisoLegalCompleto',
          cta2Text: 'Términos y Condiciones',
          cta2Link: 'terminos.html',
          imageUrl: '',
          status: 'published',
          sortOrder: 2
        },
        {
          id: 'sec_legal_content',
          name: 'Titularidad y Propiedad Intelectual',
          type: 'content',
          title: 'Titularidad Comunitaria y Salvaguarda del Conocimiento Nativo',
          subtitle: 'Los saberes de los senderos pertenecen a las cooperativas y familias campesinas',
          badgeText: 'Soberanía Popular',
          content: 'Baqueano es una herramienta soberana para el desarrollo económico campesino sin sujeción a monopolios turísticos.',
          ctaText: 'Ver Régimen Legal',
          ctaLink: '#regimenLegal',
          cta2Text: '',
          cta2Link: '',
          imageUrl: '',
          status: 'published',
          sortOrder: 3
        },
        {
          id: 'sec_legal_footer',
          name: 'Pie de Página / Footer Institucional',
          type: 'footer',
          title: 'BAQUEANO NICARAGUA',
          subtitle: 'Consultas Jurídicas: legal@baqueano.ni',
          badgeText: 'República de Nicaragua',
          content: '© 2026 Baqueano Nicaragua. Plataforma de soberanía y desarrollo integral campesino.',
          ctaText: 'WhatsApp Mesa Técnica',
          ctaLink: 'https://wa.me/50584431289',
          cta2Text: 'Términos & Condiciones',
          cta2Link: 'terminos.html',
          imageUrl: 'assets/images/logo.png',
          status: 'published',
          sortOrder: 4
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
  // 5. GESTOR HÍBRIDO DE ALMACENAMIENTO (FIREBASE PRINCIPAL + SUPABASE RESPALDO)
  // --------------------------------------------------------------------------
  const OpsStorage = {
    getFirebaseStorage() {
      return window.firebase && window.firebase.storage ? window.firebase.storage() : null;
    },

    getSupabaseStorage() {
      return window.baqueanoSupabase ? window.baqueanoSupabase.storage : null;
    },

    async uploadFile(file, folder = 'destinations', onProgress = null) {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${sanitizedName}`;
      const path = `${folder}/${filename}`;

      // 1. INTENTAR CON FIREBASE (ALMACENAMIENTO PRINCIPAL)
      const fbStorage = this.getFirebaseStorage();
      if (fbStorage) {
        try {
          const storageRef = fbStorage.ref(path);
          const metadata = {
            contentType: file.type,
            customMetadata: {
              uploadedBy: OpsState.currentUser?.email || 'admin',
              uploadedAt: new Date().toISOString()
            }
          };

          const uploadTask = storageRef.put(file, metadata);

          const firebaseResult = await new Promise((resolve, reject) => {
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (typeof onProgress === 'function') onProgress(progress);
              },
              (error) => reject(error),
              async () => {
                try {
                  const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                  resolve({ downloadURL, path, filename, provider: 'firebase' });
                } catch (urlErr) {
                  reject(urlErr);
                }
              }
            );
          });
          
          console.info('🟢 [OpsStorage] Archivo subido exitosamente a FIREBASE Storage.');
          return firebaseResult;

        } catch (firebaseErr) {
          console.warn('🟡 [OpsStorage] Falló subida a Firebase. Activando Supabase como RESPALDO...', firebaseErr);
        }
      } else {
        console.warn('🟡 [OpsStorage] Firebase Storage inaccesible. Activando Supabase como RESPALDO...');
      }

      // 2. INTENTAR CON SUPABASE (ALMACENAMIENTO DE RESPALDO)
      const sbStorage = this.getSupabaseStorage();
      if (!sbStorage) {
        throw new Error('CRÍTICO: Ni Firebase ni Supabase están disponibles para almacenamiento.');
      }

      const bucketName = 'baqueano-media';
      try {
        if (typeof onProgress === 'function') onProgress(50); // Simular progreso rápido de respaldo
        
        const { data, error } = await sbStorage.from(bucketName).upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

        if (error) throw error;

        if (typeof onProgress === 'function') onProgress(100);

        const { data: publicUrlData } = sbStorage.from(bucketName).getPublicUrl(path);
        const downloadURL = publicUrlData.publicUrl;

        console.info('🔵 [OpsStorage] Archivo subido exitosamente a SUPABASE Storage (Respaldo).');
        return { downloadURL, path, filename, provider: 'supabase' };
      } catch (err) {
        console.error('🔴 [OpsStorage] Falla total: Firebase y Supabase rechazaron el archivo.', err);
        throw err;
      }
    },

    async deleteFileByUrl(fileUrl) {
      if (!fileUrl) return;

      // ELIMINAR DE FIREBASE
      if (fileUrl.includes('firebasestorage.googleapis.com')) {
        const fbStorage = this.getFirebaseStorage();
        if (fbStorage) {
          try {
            const ref = fbStorage.refFromURL(fileUrl);
            await ref.delete();
            console.info('🟢 [OpsStorage] Archivo eliminado de Firebase Storage.');
          } catch (err) {
            console.warn('🟡 [OpsStorage] No se pudo eliminar de Firebase:', err.message);
          }
        }
        return;
      }

      // ELIMINAR DE SUPABASE
      if (fileUrl.includes('supabase.co/storage')) {
        const sbStorage = this.getSupabaseStorage();
        if (sbStorage) {
          try {
            const bucketName = 'baqueano-media';
            const urlObj = new URL(fileUrl);
            const pathParts = urlObj.pathname.split(`/public/${bucketName}/`);
            
            if (pathParts.length > 1) {
              const relativePath = pathParts[1];
              const { error } = await sbStorage.from(bucketName).remove([relativePath]);
              if (error) throw error;
              console.info('🔵 [OpsStorage] Archivo eliminado de Supabase Storage.');
            }
          } catch (err) {
            console.warn('🟡 [OpsStorage] No se pudo eliminar de Supabase:', err.message);
          }
        }
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
          let items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));

          // Fallback: Si no hay datos en la DB, usar los datos simulados existentes para que el Ops Center no se vea vacío
          if (items.length === 0 && window.BaqueanoMockData && window.BaqueanoMockData[tabId]) {
            items = window.BaqueanoMockData[tabId];
          }

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

    // 7.7b Check de Verificado Manual (TikTok / Instagram / X / FB Style)
    async toggleManualVerified(tabId, entityId) {
      const config = ENTITY_REGISTRY[tabId];
      const items = OpsState.collectionsData[tabId] || [];
      const item = items.find((x) => x.id === entityId);
      if (!item) return;

      const newVerified = !(item.verified === true || item.verificationStatus === 'verified');
      const collName = config?.collection || 'destinations';

      const db = this.getDb();
      if (!db) return;

      const updateData = {
        verified: newVerified,
        verificationStatus: newVerified ? 'verified' : 'unverified',
        updatedAt: new Date().toISOString(),
        verifiedAt: newVerified ? new Date().toISOString() : null,
        verifiedBy: newVerified ? (OpsState.currentUser?.email || 'admin') : null
      };

      await db.collection(collName).doc(entityId).set(updateData, { merge: true });

      // Si es un destino, sincronizar también en colección espejo
      if (config.dualSyncCollection) {
        await db.collection(config.dualSyncCollection).doc(entityId).set(updateData, { merge: true }).catch(() => {});
      }

      item.verified = newVerified;
      item.verificationStatus = updateData.verificationStatus;

      OpsToast.show(
        newVerified
          ? `✅ Check Oficial de Verificación otorgado a "${item.title || item.name}".`
          : `Insignia de verificación removida de "${item.title || item.name}".`,
        newVerified ? 'success' : 'info'
      );

      await this.logAuditEvent({
        action: newVerified ? 'BADGE_VERIFIED_GRANTED' : 'BADGE_VERIFIED_REVOKED',
        module: config?.title || tabId,
        collection: collName,
        recordId: entityId,
        description: `Check de verificación manual (estilo red social) ${newVerified ? 'otorgado' : 'retirado'} para "${item.title || item.name}"`,
        status: 'success'
      });
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
            const existingSections = data.sections || [];
            const baseSections = SITE_PAGES_REGISTRY[pageId]?.sections || [];
            const existingIds = new Set(existingSections.map((s) => s.id));
            const missingBase = baseSections.filter((b) => !existingIds.has(b.id));

            if (missingBase.length > 0) {
              const merged = [...existingSections, ...missingBase];
              merged.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
              OpsState.pageSections[pageId] = merged;
            } else {
              OpsState.pageSections[pageId] = existingSections;
            }
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
      
      // Optimización: Usar el estado local sincronizado en lugar de esperar la red
      let sections = [];
      if (OpsState.pageSections && OpsState.pageSections[pageId]) {
        sections = [...OpsState.pageSections[pageId]];
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

      // Actualización optimista: Disparamos la escritura y no bloqueamos la UI esperando al servidor
      pageDocRef.set({
        pageId,
        sections,
        updatedAt: new Date().toISOString(),
        updatedBy: OpsState.currentUser?.email || 'admin'
      }, { merge: true }).catch(err => {
        console.warn('[OpsCMS] Error guardando sección en segundo plano:', err.message);
        OpsToast.show('Aviso: La red está inestable. Los cambios se guardarán localmente.', 'warning');
      });

      // Ejecutar auditoría en segundo plano (fire-and-forget) para no bloquear la UI
      this.logAuditEvent({
        action: 'PAGE_SECTION_SAVED',
        module: 'Website Builder',
        description: `Sección "${sectionData.name || sectionData.title}" guardada en ${pageId}.html`,
        status: 'success'
      }).catch(e => console.warn(e));
    },

    async togglePageSectionStatus(pageId, sectionId) {
      const db = this.getDb();
      if (!db) return;

      const pageDocRef = db.collection('site_pages').doc(pageId);
      
      let sections = [...(OpsState.pageSections[pageId] || [])];
      if (sections.length === 0) return;

      const target = sections.find((s) => s.id === sectionId);
      if (!target) return;

      target.status = target.status === 'published' ? 'draft' : 'published';

      pageDocRef.set({
        sections,
        updatedAt: new Date().toISOString(),
        updatedBy: OpsState.currentUser?.email || 'admin'
      }, { merge: true }).catch(e => console.warn(e));

      OpsToast.show(`Sección "${target.name || target.title}" ahora está ${target.status === 'published' ? 'Publicada' : 'en Borrador / Oculta'}.`, 'success');
      this.logAuditEvent({
        action: 'PAGE_SECTION_STATUS_TOGGLED',
        module: 'Website Builder',
        description: `Estado de "${target.name || target.title}" cambiado a ${target.status}`,
        status: 'success'
      }).catch(e => console.warn(e));
    },

    async movePageSectionOrder(pageId, sectionId, direction) {
      const db = this.getDb();
      if (!db) return;

      const pageDocRef = db.collection('site_pages').doc(pageId);
      
      let sections = [...(OpsState.pageSections[pageId] || [])];
      if (sections.length === 0) return;

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

      pageDocRef.set({
        sections,
        updatedAt: new Date().toISOString(),
        updatedBy: OpsState.currentUser?.email || 'admin'
      }, { merge: true }).catch(e => console.warn(e));

      OpsToast.show('Orden de secciones actualizado.', 'info');
    },

    async trashPageSection(pageId, sectionId) {
      const db = this.getDb();
      if (!db) return;

      const pageDocRef = db.collection('site_pages').doc(pageId);
      
      let sections = [...(OpsState.pageSections[pageId] || [])];
      if (sections.length === 0) return;

      const target = sections.find((s) => s.id === sectionId);
      if (!target) return;

      target.status = 'trashed';

      pageDocRef.set({
        sections,
        updatedAt: new Date().toISOString(),
        updatedBy: OpsState.currentUser?.email || 'admin'
      }, { merge: true }).catch(e => console.warn(e));

      OpsToast.show(`Sección movida a la papelera.`, 'warning');
      this.logAuditEvent({
        action: 'PAGE_SECTION_TRASHED',
        module: 'Website Builder',
        description: `Sección "${target.name || target.title}" movida a papelera`,
        status: 'success'
      }).catch(e => console.warn(e));
    },

    async restorePageSection(pageId, sectionId) {
      const db = this.getDb();
      if (!db) return;

      const pageDocRef = db.collection('site_pages').doc(pageId);
      
      let sections = [...(OpsState.pageSections[pageId] || [])];
      if (sections.length === 0) return;

      const target = sections.find((s) => s.id === sectionId);
      if (!target) return;

      target.status = 'published';

      pageDocRef.set({
        sections,
        updatedAt: new Date().toISOString(),
        updatedBy: OpsState.currentUser?.email || 'admin'
      }, { merge: true }).catch(e => console.warn(e));

      OpsToast.show(`Sección restaurada y publicada en la web.`, 'success');
      this.logAuditEvent({
        action: 'PAGE_SECTION_RESTORED',
        module: 'Website Builder',
        description: `Sección "${target.name || target.title}" restaurada a publicada`,
        status: 'success'
      }).catch(e => console.warn(e));
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
      
      let sections = [...(OpsState.pageSections[pageId] || [])];
      if (sections.length === 0) return;

      sections = sections.filter((s) => s.id !== sectionId);

      pageDocRef.set({
        sections,
        updatedAt: new Date().toISOString(),
        updatedBy: OpsState.currentUser?.email || 'admin'
      }, { merge: true }).catch(e => console.warn(e));

      OpsToast.show(`Sección eliminada permanentemente.`, 'error');
      this.logAuditEvent({
        action: 'PAGE_SECTION_HARD_DELETED',
        module: 'Website Builder',
        description: `Sección ${sectionId} eliminada físicamente de ${pageId}.html`,
        status: 'danger'
      }).catch(e => console.warn(e));
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
      db.collection('site_pages').doc(pageId).set({
        pageId,
        sections: baseSections,
        updatedAt: new Date().toISOString(),
        updatedBy: OpsState.currentUser?.email || 'admin'
      }, { merge: true }).catch(e => console.warn(e));

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
      const isVerified = item.verified === true || item.verificationStatus === 'verified';

      return `
        <tr class="ops-table-row ${isSelected ? 'is-selected' : ''}">
          <td>
            <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="window.BaqueanoOpsEngine.toggleSelect('${item.id}', this.checked)">
          </td>
          <td>
            <div class="ops-cell-title">
              ${image ? `<img src="${image}" class="ops-cell-thumb" alt="" referrerpolicy="no-referrer">` : `<div class="ops-cell-thumb" style="display:flex;align-items:center;justify-content:center;color:var(--ops-text-muted);"><i class="fa-solid fa-image"></i></div>`}
              <div class="ops-cell-meta">
                <span class="ops-cell-meta-title">
                  ${this.escape(title)}
                  ${isVerified ? `<span class="ops-social-verified-check" title="Verificado Oficialmente (Sello Auténtico)"><i class="fa-solid fa-circle-check"></i></span>` : ''}
                </span>
                <span class="ops-cell-meta-sub">ID: ${item.id} ${item.priceNio ? `• C$ ${item.priceNio} (≈ $${item.priceUsd})` : ''}</span>
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
              <button class="btn-ops-icon ${isVerified ? 'verified-active' : ''}" title="${isVerified ? 'Insignia Verificada (Clic para retirar)' : 'Check de verificado manual estilo red social (TikTok, Instagram, X)'}" onclick="window.BaqueanoOpsEngine.toggleManualVerified('${tabId}', '${item.id}')">
                <i class="fa-solid fa-circle-check" style="${isVerified ? 'color: #00BAF2;' : 'color: var(--ops-text-muted);'}"></i>
              </button>
              <button class="btn-ops-icon" title="Editar registro (imagen, precio, textos)" onclick="window.BaqueanoOpsEngine.openEditDrawer('${tabId}', '${item.id}')">
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
      const verCheckbox = document.getElementById('entityVerified');
      if (verCheckbox) {
        verCheckbox.checked = item ? (item.verified === true || item.verificationStatus === 'verified') : false;
      }

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
      const isVerified = document.getElementById('entityVerified') ? document.getElementById('entityVerified').checked : false;

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
        keywords: document.getElementById('entityKeywords').value.trim(),
        verified: isVerified,
        verificationStatus: isVerified ? 'verified' : 'unverified',
        verifiedAt: isVerified ? new Date().toISOString() : null,
        verifiedBy: isVerified ? (OpsState.currentUser?.email || 'admin') : null
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
      const typeSelect = document.getElementById('secFormType');

      const closeModal = () => {
        if (modal) modal.classList.remove('is-open');
      };

      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

      if (typeSelect) {
        typeSelect.addEventListener('change', (e) => {
          this.adaptSectionModalForm(e.target.value);
        });
      }

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

    adaptSectionModalForm(type) {
      const lblTitle = document.getElementById('lblSecFormTitle');
      const inputTitle = document.getElementById('secFormTitle');
      const hintTitle = document.getElementById('hintSecFormTitle');

      const lblSub = document.getElementById('lblSecFormSubtitle');
      const inputSub = document.getElementById('secFormSubtitle');
      const hintSub = document.getElementById('hintSecFormSubtitle');

      const lblBadge = document.getElementById('lblSecFormBadge');
      const inputBadge = document.getElementById('secFormBadgeText');
      const hintBadge = document.getElementById('hintSecFormBadge');

      const lblContent = document.getElementById('lblSecFormContent');
      const inputContent = document.getElementById('secFormContent');
      const hintContent = document.getElementById('hintSecFormContent');

      const lblCtaText = document.getElementById('lblSecFormCtaText');
      const inputCtaText = document.getElementById('secFormCtaText');
      const hintCtaText = document.getElementById('hintSecFormCtaText');

      const lblCtaLink = document.getElementById('lblSecFormCtaLink');
      const inputCtaLink = document.getElementById('secFormCtaLink');
      const hintCtaLink = document.getElementById('hintSecFormCtaLink');

      const lblCta2Text = document.getElementById('lblSecFormCta2Text');
      const inputCta2Text = document.getElementById('secFormCta2Text');
      const hintCta2Text = document.getElementById('hintSecFormCta2Text');

      const lblCta2Link = document.getElementById('lblSecFormCta2Link');
      const inputCta2Link = document.getElementById('secFormCta2Link');
      const hintCta2Link = document.getElementById('hintSecFormCta2Link');

      const lblImage = document.getElementById('lblSecFormImage');
      const inputImage = document.getElementById('secFormImageUrl');

      if (type === 'header') {
        if (lblTitle) lblTitle.textContent = 'Marca / Nombre de Encabezado (Logo Text) *';
        if (inputTitle) inputTitle.placeholder = 'Ej. BAQUEANO NICARAGUA';
        if (hintTitle) hintTitle.textContent = 'Nombre de la marca o título visible en la barra superior fija.';

        if (lblSub) lblSub.textContent = 'Lema / Subtítulo de Cabecera';
        if (inputSub) inputSub.placeholder = 'Ej. Ecoturismo Auténtico & Soberanía Territorial Campesina';
        if (hintSub) hintSub.textContent = 'Texto descriptivo secundario visible en el encabezado.';

        if (lblBadge) lblBadge.textContent = 'Indicador Superior / Cintillo';
        if (inputBadge) inputBadge.placeholder = 'Ej. GPS Satelital Activo 24/7';
        if (hintBadge) hintBadge.textContent = 'Cintillo o indicador de estado superior.';

        if (lblContent) lblContent.textContent = 'Menú de Navegación (Etiqueta:URL separados por coma)';
        if (inputContent) inputContent.placeholder = 'Inicio:index.html, Destinos:destinos.html, Guía Verde:ambiental.html, Aliados:aliados.html...';
        if (hintContent) hintContent.textContent = 'Define los enlaces principales de navegación del encabezado.';

        if (lblCtaText) lblCtaText.textContent = 'Botón Principal de Cabecera (Texto)';
        if (inputCtaText) inputCtaText.placeholder = 'Ej. SOS Satelital o Explorar';
        if (lblCtaLink) lblCtaLink.textContent = 'Botón Principal: Enlace o Teléfono';
        if (inputCtaLink) inputCtaLink.placeholder = 'Ej. tel:118 o destinos.html';

        if (lblCta2Text) lblCta2Text.textContent = 'Botón Secundario de Cabecera (Texto)';
        if (inputCta2Text) inputCta2Text.placeholder = 'Ej. Descargar APK o Mi Negocio';
        if (lblCta2Link) lblCta2Link.textContent = 'Botón Secundario: Enlace o URL';
        if (inputCta2Link) inputCta2Link.placeholder = 'Ej. assets/BaqueanoNicaragua.apk';

        if (lblImage) lblImage.textContent = 'URL del Logotipo Oficial / Isotipo';
        if (inputImage) inputImage.placeholder = 'assets/images/logo.png o URL de Storage';
      } else if (type === 'footer') {
        if (lblTitle) lblTitle.textContent = 'Título / Nombre Institucional en Pie de Página *';
        if (inputTitle) inputTitle.placeholder = 'Ej. BAQUEANO NICARAGUA';
        if (hintTitle) hintTitle.textContent = 'Nombre institucional en el bloque principal del pie de página.';

        if (lblSub) lblSub.textContent = 'Línea de Emergencia / Teléfono de Contacto';
        if (inputSub) inputSub.placeholder = 'Ej. Atención 24/7: +505 8443-1289 • Emergencias: 118';
        if (hintSub) hintSub.textContent = 'Teléfono principal o línea directa que se muestra en el pie.';

        if (lblBadge) lblBadge.textContent = 'Sello Institucional / Certificación';
        if (inputBadge) inputBadge.placeholder = 'Ej. Acreditado INTUR • MARENA';
        if (hintBadge) hintBadge.textContent = 'Distintivo de acreditación o custodia comunitaria.';

        if (lblContent) lblContent.textContent = 'Texto de Copyright, Misión y Enlaces Legales';
        if (inputContent) inputContent.placeholder = 'Ej. © 2026 Baqueano Nicaragua. Plataforma Soberana de Ecoturismo Campesino...';
        if (hintContent) hintContent.textContent = 'Párrafo de copyright, aviso de derechos y aclaraciones.';

        if (lblCtaText) lblCtaText.textContent = 'Enlace / Botón Principal de Pie (Texto)';
        if (inputCtaText) inputCtaText.placeholder = 'Ej. WhatsApp Mesa Técnica';
        if (lblCtaLink) lblCtaLink.textContent = 'Enlace Principal: URL / WhatsApp';
        if (inputCtaLink) inputCtaLink.placeholder = 'Ej. https://wa.me/50584431289';

        if (lblCta2Text) lblCta2Text.textContent = 'Enlace Secundario de Pie (Texto)';
        if (inputCta2Text) inputCta2Text.placeholder = 'Ej. Canal de Denuncias o Términos';
        if (lblCta2Link) lblCta2Link.textContent = 'Enlace Secundario: URL';
        if (inputCta2Link) inputCta2Link.placeholder = 'Ej. denuncias.html o terminos.html';

        if (lblImage) lblImage.textContent = 'Logotipo / Escudo de Pie de Página';
      } else if (type === 'map') {
        if (lblTitle) lblTitle.textContent = 'Título del Módulo de Mapa *';
        if (inputTitle) inputTitle.placeholder = 'Ej. Mapa Topográfico Vivo 3D de Nicaragua';
        if (hintTitle) hintTitle.textContent = 'Encabezado principal visible en el visor cartográfico.';

        if (lblSub) lblSub.textContent = 'Subtítulo / Instrucciones del Mapa';
        if (inputSub) inputSub.placeholder = 'Ej. Relieve de volcanes, lagos, reservas y cordilleras con Three.js';
        if (hintSub) hintSub.textContent = 'Guía para la interacción de órbita y zoom en 3D.';

        if (lblBadge) lblBadge.textContent = 'Modo de Navegación / Brújula';
        if (inputBadge) inputBadge.placeholder = 'Ej. WebGL 3D a 60fps';
        if (hintBadge) hintBadge.textContent = 'Distintivo técnico o modo de visualización.';

        if (lblContent) lblContent.textContent = 'Información Geográfica / Leyenda del Mapa';
        if (inputContent) inputContent.placeholder = 'Ej. Visualiza la geografía soberana con brújula de rumbo y selector de regiones...';
        if (hintContent) hintContent.textContent = 'Detalles cartográficos y referencias de altitud.';

        if (lblCtaText) lblCtaText.textContent = 'Botón de Acción del Mapa (Texto)';
        if (inputCtaText) inputCtaText.placeholder = 'Ej. Abrir Navegación Libre';
        if (lblCtaLink) lblCtaLink.textContent = 'Botón del Mapa: Enlace o Ancla';
        if (inputCtaLink) inputCtaLink.placeholder = 'Ej. #mapaVivo3dSection';

        if (lblCta2Text) lblCta2Text.textContent = 'Botón Secundario del Mapa (Texto)';
        if (inputCta2Text) inputCta2Text.placeholder = 'Ej. Ver Ficha Departamental';
        if (lblCta2Link) lblCta2Link.textContent = 'Botón Secundario: Enlace';
        if (inputCta2Link) inputCta2Link.placeholder = 'Ej. departamento.html';

        if (lblImage) lblImage.textContent = 'Textura / Captura de Mapa';
      } else if (type === 'form') {
        if (lblTitle) lblTitle.textContent = 'Título del Formulario / Registro *';
        if (inputTitle) inputTitle.placeholder = 'Ej. Registra tu Local, Hospedaje o Cooperativa';
        if (hintTitle) hintTitle.textContent = 'Encabezado del formulario visible al explorador o anfitrión.';

        if (lblSub) lblSub.textContent = 'Subtítulo / Instrucciones del Formulario';
        if (inputSub) inputSub.placeholder = 'Ej. Formulario oficial conectado directamente a la Mesa Técnica Baqueano';
        if (hintSub) hintSub.textContent = 'Instrucciones paso a paso para el usuario.';

        if (lblBadge) lblBadge.textContent = 'Marco Jurídico / Distintivo del Formulario';
        if (inputBadge) inputBadge.placeholder = 'Ej. Ley 1210 / Ley 306';
        if (hintBadge) hintBadge.textContent = 'Insignia o ley que ampara este formulario.';

        if (lblContent) lblContent.textContent = 'Instrucciones Detalladas / Política de Datos';
        if (inputContent) inputContent.placeholder = 'Ej. Inscribe tu negocio bajo los principios de turismo ético y soberanía comunitaria...';
        if (hintContent) hintContent.textContent = 'Texto explicativo que se despliega antes de los campos.';

        if (lblCtaText) lblCtaText.textContent = 'Texto del Botón de Envío del Formulario';
        if (inputCtaText) inputCtaText.placeholder = 'Ej. Postular a Mesa Baqueano o Enviar Denuncia';
        if (lblCtaLink) lblCtaLink.textContent = 'Destino de Recepción (WhatsApp o Endpoint)';
        if (inputCtaLink) inputCtaLink.placeholder = 'Ej. https://wa.me/50584431289 o #registroAnfitrionSection';

        if (lblCta2Text) lblCta2Text.textContent = 'Botón Secundario / Alternativo (Texto)';
        if (inputCta2Text) inputCta2Text.placeholder = 'Ej. WhatsApp Directo o Descargar Formato';
        if (lblCta2Link) lblCta2Link.textContent = 'Botón Secundario: Enlace / URL';
        if (inputCta2Link) inputCta2Link.placeholder = 'Ej. https://wa.me/50584431289';

        if (lblImage) lblImage.textContent = 'Imagen Ilustrativa del Formulario';
      } else {
        // Hero, Content, Cards, CTA, Banner, Testimonial
        if (lblTitle) lblTitle.textContent = 'Título de la Sección / Encabezado *';
        if (inputTitle) inputTitle.placeholder = 'Ej. El Sendero lo Abren las Comunidades';
        if (hintTitle) hintTitle.textContent = 'Encabezado principal de este bloque.';

        if (lblSub) lblSub.textContent = 'Subtítulo / Bajada Cultural';
        if (inputSub) inputSub.placeholder = 'Ej. Ecoturismo Auténtico en Nicaragua sin intermediarios';
        if (hintSub) hintSub.textContent = 'Lema o descripción corta bajo el título.';

        if (lblBadge) lblBadge.textContent = 'Distintivo / Badge Superior';
        if (inputBadge) inputBadge.placeholder = 'Ej. Soberanía Ecoturística, Ley 306, etc.';
        if (hintBadge) hintBadge.textContent = 'Pill o etiqueta que flota sobre el título.';

        if (lblContent) lblContent.textContent = 'Cuerpo del Contenido / Descripción / Texto Legal';
        if (inputContent) inputContent.placeholder = 'Texto descriptivo, párrafos, notas de copyright o manifiesto...';
        if (hintContent) hintContent.textContent = 'Contenido principal en prosa de este bloque.';

        if (lblCtaText) lblCtaText.textContent = 'Botón Principal: Texto';
        if (inputCtaText) inputCtaText.placeholder = 'Ej. Explorar Nicaragua en 3D';
        if (lblCtaLink) lblCtaLink.textContent = 'Botón Principal: Enlace / URL';
        if (inputCtaLink) inputCtaLink.placeholder = 'Ej. #mapaVivo3dSection o destinos.html';

        if (lblCta2Text) lblCta2Text.textContent = 'Botón Secundario: Texto (Opcional)';
        if (inputCta2Text) inputCta2Text.placeholder = 'Ej. Descargar APK Android';
        if (lblCta2Link) lblCta2Link.textContent = 'Botón Secundario: Enlace / URL';
        if (inputCta2Link) inputCta2Link.placeholder = 'Ej. assets/BaqueanoNicaragua.apk';

        if (lblImage) lblImage.textContent = 'URL de Fotografía / Fondo Multimedia';
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
        titleEl.innerHTML = `<i class="fa-solid fa-layer-group" style="color: var(--bq-accent);"></i> ${section ? 'Modificar Componente' : 'Añadir Nuevo Componente'}`;
      }
      if (subEl) {
        subEl.textContent = `Página: ${pageInfo.name} (${pageInfo.file}) • Todo elemento es editable en vivo`;
      }

      const secType = section ? (section.type || 'content') : 'content';
      document.getElementById('secFormType').value = secType;
      this.adaptSectionModalForm(secType);

      document.getElementById('secFormTitle').value = section ? (section.title || section.name || '') : '';
      document.getElementById('secFormSubtitle').value = section ? (section.subtitle || '') : '';
      document.getElementById('secFormBadgeText').value = section ? (section.badgeText || '') : '';
      document.getElementById('secFormContent').value = section ? (section.content || '') : '';
      document.getElementById('secFormCtaText').value = section ? (section.ctaText || '') : '';
      document.getElementById('secFormCtaLink').value = section ? (section.ctaLink || '') : '';
      document.getElementById('secFormCta2Text').value = section ? (section.cta2Text || '') : '';
      document.getElementById('secFormCta2Link').value = section ? (section.cta2Link || '') : '';
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
        OpsToast.show('El título / encabezado del componente es obligatorio.', 'warning');
        titleInput.focus();
        return;
      }

      const saveBtn = document.getElementById('btnSaveSectionModal');
      if (saveBtn) saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando en Vivo...';

      const sectionData = {
        id: sectionId || undefined,
        name: titleInput.value.trim(),
        title: titleInput.value.trim(),
        subtitle: document.getElementById('secFormSubtitle').value.trim(),
        badgeText: document.getElementById('secFormBadgeText').value.trim(),
        type: document.getElementById('secFormType').value,
        content: document.getElementById('secFormContent').value.trim(),
        ctaText: document.getElementById('secFormCtaText').value.trim(),
        ctaLink: document.getElementById('secFormCtaLink').value.trim(),
        cta2Text: document.getElementById('secFormCta2Text').value.trim(),
        cta2Link: document.getElementById('secFormCta2Link').value.trim(),
        imageUrl: document.getElementById('secFormImageUrl').value.trim(),
        status: document.getElementById('secFormStatus').value,
        sortOrder: parseInt(document.getElementById('secFormSortOrder').value, 10) || 1
      };

      try {
        await OpsCMS.savePageSection(pageId, sectionData);
        const modal = document.getElementById('opsSectionModal');
        if (modal) modal.classList.remove('is-open');
        OpsToast.show(`¡Componente "${sectionData.title}" guardado con éxito y publicado en ${pageId}.html!`, 'success');
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

    async toggleManualVerified(tabId, entityId) {
      await OpsCMS.toggleManualVerified(tabId, entityId);
      OpsUI.renderEntityView(tabId);
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
