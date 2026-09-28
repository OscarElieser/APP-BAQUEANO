// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MOTOR BILINGÜE UNIVERSAL (baqueano-i18n.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Permitir que cualquier viajero internacional explore y disfrute Nicaragua
//   con total soberanía en su idioma preferido (Español 🇳🇮 o Inglés 🇺🇸).
// - Traducir de pies a cabeza y de cabeza a los pies cada componente del sitio:
//   navbar, mega-menú, hero, buscador, categorías, mapas, experiencias, cultura,
//   centro SOS, testimonios y footer institucional.
// - Eliminar barreras de idioma para potenciar el ecoturismo local y comunitario
//   sin intermediarios foráneos.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Diccionario reactivo estructurado por namespaces (nav, hero, categories, sos, footer, etc.).
// - Renderizado instantáneo en el DOM sin recargas de página utilizando:
//   * data-i18n: traduce innerText/HTML
//   * data-i18n-placeholder: traduce inputs de búsqueda y formularios
//   * data-i18n-title: traduce tooltips accesibles
// - Heurística de traducción de rescate: traduce selectores estándar (.exact-nav-link,
//   .global-mega-column, botones SOS, clima, login) automáticamente.
// - Persistencia en localStorage ('baqueano_lang') y detección del idioma del navegador.
// - Selector interactivo desplegable conectado a .global-language y .navbar-lang-pill.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & API PÚBLICA):
// - window.BaqueanoI18n = { setLanguage, getLanguage, toggleLanguage, t, applyTranslations }
// - Evento personalizado 'baqueano:languageChanged' despachado a window al cambiar de idioma.
// ============================================================================

(function() {
  'use strict';

  var STORAGE_KEY = 'baqueano_lang';

  // ── DICCIONARIO COMPLETO BILINGÜE ──────────────────────────────────────────
  var DICTIONARY = {
    es: {
      // 🧭 NAVEGACIÓN Y NAVBAR
      nav_brand_tagline: 'NICARAGUA AUTÉNTICA',
      nav_home: 'Inicio',
      nav_explore: 'Explorar',
      nav_culture: 'Cultura',
      nav_ai: 'Baqueano IA',
      nav_mytrip: 'Mi Viaje',
      nav_more: 'Más',
      nav_login: 'Iniciar sesión',
      nav_search_title: 'Buscar en Nicaragua',
      nav_theme_title: 'Cambiar tema',
      nav_sos: 'SOS',

      // 🗺️ MEGA MENÚ (4 COLUMNAS)
      mega_col_explore: 'Explorar',
      mega_deptos: 'Departamentos',
      mega_destinations: 'Destinos',
      mega_map: 'Mapa',
      mega_experiences: 'Experiencias',

      mega_col_culture: 'Cultura',
      mega_history: 'Historia',
      mega_gastronomy: 'Gastronomía',
      mega_music: 'Música',
      mega_environmental: 'Ambiental',

      mega_col_community: 'Comunidad',
      mega_allies: 'Aliados',
      mega_mybiz: 'Mi Negocio',
      mega_reports: 'Denuncia',

      mega_col_account: 'Cuenta y Plataforma',
      mega_profile: 'Perfil',
      mega_bookings: 'Reservas',
      mega_favorites: 'Favoritos',
      mega_help: 'Ayuda',
      mega_about: 'Nosotros',
      mega_terms: 'Términos',
      mega_privacy: 'Privacidad',
      mega_cookies: 'Cookies',
      mega_admin: 'Admin / Ops Center',
      mega_admin_badge: 'Solo personal',

      // 🌋 HERO DEL PORTAL
      hero_tag: 'NICARAGUA',
      hero_title_1: 'NO SE VISITA,',
      hero_title_2: 'SE DESCUBRE',
      hero_subtitle: 'Playas, volcanes, montañas, cultura, gastronomía y comunidades que no aparecen en las rutas tradicionales.',
      hero_search_placeholder: '¿Qué querés vivir en Nicaragua?',
      hero_search_btn: 'Buscar',
      hero_btn_map: 'Explorar mapa',
      hero_btn_ai: 'Planificar con IA',
      hero_watch_video: 'Ver video',

      // 🌴 FRANJA DE CATEGORÍAS
      cat_playas: 'Playas',
      cat_volcanes: 'Volcanes',
      cat_montanas: 'Montañas',
      cat_gastronomia: 'Gastronomía',
      cat_cultura: 'Cultura',
      cat_reservas: 'Reservas',
      cat_aventura: 'Aventura',
      cat_historia: 'Historia',
      cat_artesanias: 'Artesanías',
      cat_hospedajes: 'Hospedajes',

      // 🧭 SECCIONES DEL HOME
      sec_destinations_title: 'Destinos que Inspiran',
      sec_destinations_sub: 'Lugares únicos seleccionados por auténticos conocedores del territorio',
      sec_destinations_all: 'Ver todos los destinos',

      sec_map_title: 'Nicaragua en tus manos',
      sec_map_sub: 'Explora por departamentos, costas y reservas con capas satelitales interactivas.',
      sec_ai_badge: 'ASISTENTE VIRTUAL',
      sec_ai_title: 'Baqueano Digital IA',
      sec_ai_desc: 'Tu compañero inteligente con conocimiento vivo del territorio nicaragüense. Recomendaciones auténticas, rutas sin intermediarios y auxilio 24/7.',
      sec_ai_btn: 'Hablar con Baqueano IA',

      sec_why_title: '¿Por qué BAQUEANO?',
      sec_why_sub: 'Turismo directo, soberano y sin intermediarios foráneos que protege la economía campesina.',
      sec_why_p1_title: '0% Comisiones Ocultas',
      sec_why_p1_desc: 'El 100% de tu gasto llega directo a las cooperativas, guías y familias anfitrionas campesinas.',
      sec_why_p2_title: 'Conocimiento Auténtico',
      sec_why_p2_desc: 'Rutas trazadas por pobladores locales que conocen cada sendero, manantial y cumbre.',
      sec_why_p3_title: 'Asistencia y Auxilio 24/7',
      sec_why_p3_desc: 'Red de auxilio satelital SOS con enlace directo a brigadas de rescate y policía turística.',

      sec_exp_title: 'Experiencias Destacadas',
      sec_exp_sub: 'Aventuras inmersivas guiadas por baqueanos comunitarios certificados',
      sec_exp_all: 'Explorar todas las experiencias',

      sec_testimonials_title: 'Testimonios de Viajeros',
      sec_testimonials_sub: 'Historias reales de exploradores que descubrieron la Nicaragua auténtica',

      sec_banner_title: 'Hay una Nicaragua que no aparece en los mapas.',
      sec_banner_sub: 'Sumate a una red soberana de exploradores y anfitriones locales que transforman el turismo.',
      sec_banner_btn: 'Comenzar a explorar',

      sec_community_title: '¿Ofreces servicios turísticos?',
      sec_community_sub: 'Únete gratis a la red de anfitriones de Baqueano y recibe viajeros de todo el mundo sin comisiones.',
      sec_community_btn: 'Registrar mi negocio',

      // 🚨 CENTRO SOS & AUXILIO
      sos_title: 'Centro SOS & Emergencias Nacionales 24/7',
      sos_subtitle: 'Asistencia inmediata en rutas, volcanes, reservas y costas de Nicaragua.',
      sos_gps_status: 'Señal Satelital GPS Activa',
      sos_gps_fetching: 'Localizando posición satelital en territorio...',
      sos_btn_copy_coords: 'Copiar Coordenadas',
      sos_btn_whatsapp: 'Enviar SOS con mi GPS a WhatsApp',
      sos_police: 'Policía Nacional & Turística',
      sos_police_sub: 'Seguridad y patrullaje en rutas turísticas',
      sos_ambulance: 'Cruz Blanca Nicaragüense',
      sos_ambulance_sub: 'Ambulancias y soporte vital avanzado',
      sos_firefighters: 'Bomberos Unificados (115 / 911)',
      sos_firefighters_sub: 'Extinción, rescate vertical y accidentes',
      sos_navy: 'Fuerza Naval Militar',
      sos_navy_sub: 'Emergencias en costas Pacífico, Caribe y Lagos',
      sos_sinapred: 'SINAPRED / Defensa Civil',
      sos_sinapred_sub: 'Alerta temprana volcánica, sísmica y clima',
      sos_minsa: 'Emergencias Médicas MINSA (102)',
      sos_minsa_sub: 'Red de hospitales y centros de salud',
      sos_tool_siren: 'Sirena Acústica SOS',
      sos_tool_siren_desc: 'Emite sonido oscilante de socorro para rescate en senderos',
      sos_tool_strobe: 'Luz Estroboscópica SOS',
      sos_tool_strobe_desc: 'Destello de pantalla en código morse para señales nocturnas',
      sos_first_aid_title: 'Guía Rápida de Supervivencia',
      sos_first_aid_snake: '🐍 Mordedura de serpiente: Inmoviliza la extremidad, no cortes ni succiones, bebe agua y acude al puesto de salud más cercano.',
      sos_first_aid_heat: '☀️ Golpe de calor: Busca sombra inmediatamente, hidrátate con electrolitos en pequeños sorbos y afloja prendas ajustadas.',
      sos_first_aid_lost: '🧭 Extravío en sendero: Detente en el sitio, enciende la sirena de socorro y orienta el sol poniente hacia el oeste (Pacífico).',

      // 🦶 PIE DE PÁGINA INSTITUCIONAL (FOOTER)
      footer_brand_sub: 'NICARAGUA AUTÉNTICA',
      footer_tagline: 'Descubrí lo que no sale en el mapa.',
      footer_col_explore: 'EXPLORAR',
      footer_col_culture: 'CULTURA',
      footer_col_legal: 'LEGAL & PLATAFORMA',
      footer_col_community: 'COMUNIDAD',
      footer_col_account: 'CUENTA',
      footer_rights: 'Todos los derechos reservados.',
      footer_platform_desc: 'Ecosistema digital soberano de turismo comunitario, ecoturismo y preservación cultural en Nicaragua.',
      footer_stamp_title: 'NICARAGUA AUTÉNTICA',
      footer_stamp_sub: 'TURISMO SOBERANO',

      // 🔔 MENSAJES Y ACCIONES
      coords_copied: '¡Coordenadas GPS copiadas al portapapeles! 📋',
      siren_started: '🚨 Sirena acústica activada a volumen máximo',
      siren_stopped: 'Sirena acústica detenida',
      strobe_active: 'Linterna estroboscópica SOS activada (Toca para detener)',
      lang_switched: 'Idioma cambiado a Español 🇳🇮'
    },

    en: {
      // 🧭 NAVEGACIÓN Y NAVBAR
      nav_brand_tagline: 'AUTHENTIC NICARAGUA',
      nav_home: 'Home',
      nav_explore: 'Explore',
      nav_culture: 'Culture',
      nav_ai: 'Baqueano AI',
      nav_mytrip: 'My Trip',
      nav_more: 'More',
      nav_login: 'Sign In',
      nav_search_title: 'Search in Nicaragua',
      nav_theme_title: 'Toggle theme',
      nav_sos: 'SOS',

      // 🗺️ MEGA MENÚ (4 COLUMNS)
      mega_col_explore: 'Explore',
      mega_deptos: 'Departments',
      mega_destinations: 'Destinations',
      mega_map: 'Map',
      mega_experiences: 'Experiences',

      mega_col_culture: 'Culture',
      mega_history: 'History',
      mega_gastronomy: 'Gastronomy',
      mega_music: 'Music',
      mega_environmental: 'Environmental',

      mega_col_community: 'Community',
      mega_allies: 'Allies',
      mega_mybiz: 'My Business',
      mega_reports: 'Report Issue',

      mega_col_account: 'Account & Platform',
      mega_profile: 'Profile',
      mega_bookings: 'Reservations',
      mega_favorites: 'Favorites',
      mega_help: 'Help Center',
      mega_about: 'About Us',
      mega_terms: 'Terms of Service',
      mega_privacy: 'Privacy Policy',
      mega_cookies: 'Cookies',
      mega_admin: 'Admin / Ops Center',
      mega_admin_badge: 'Staff only',

      // 🌋 HERO DEL PORTAL
      hero_tag: 'NICARAGUA',
      hero_title_1: 'NOT JUST VISITED,',
      hero_title_2: 'DISCOVERED',
      hero_subtitle: 'Beaches, volcanoes, mountains, culture, gastronomy, and communities that do not appear on standard tourist maps.',
      hero_search_placeholder: 'What do you want to experience in Nicaragua?',
      hero_search_btn: 'Search',
      hero_btn_map: 'Explore Map',
      hero_btn_ai: 'Plan with AI',
      hero_watch_video: 'Watch Video',

      // 🌴 CATEGORY BAR
      cat_playas: 'Beaches',
      cat_volcanes: 'Volcanoes',
      cat_montanas: 'Mountains',
      cat_gastronomia: 'Gastronomy',
      cat_cultura: 'Culture',
      cat_reservas: 'Nature Reserves',
      cat_aventura: 'Adventure',
      cat_historia: 'History',
      cat_artesanias: 'Handicrafts',
      cat_hospedajes: 'Lodging',

      // 🧭 SECCIONES DEL HOME
      sec_destinations_title: 'Destinations that Inspire',
      sec_destinations_sub: 'Unique places curated by authentic local wilderness guides',
      sec_destinations_all: 'View all destinations',

      sec_map_title: 'Nicaragua in your hands',
      sec_map_sub: 'Explore departments, coastlines, and reserves with interactive satellite layers.',
      sec_ai_badge: 'VIRTUAL ASSISTANT',
      sec_ai_title: 'Baqueano Digital AI',
      sec_ai_desc: 'Your intelligent travel companion with deep knowledge of Nicaragua’s geography. Authentic recommendations, direct local routes, and 24/7 emergency support.',
      sec_ai_btn: 'Chat with Baqueano AI',

      sec_why_title: 'Why BAQUEANO?',
      sec_why_sub: 'Direct, sovereign, and commission-free travel that directly supports local family economies.',
      sec_why_p1_title: '0% Hidden Commissions',
      sec_why_p1_desc: '100% of your payment goes directly to local cooperatives, guides, and peasant host families.',
      sec_why_p2_title: 'Authentic Local Knowledge',
      sec_why_p2_desc: 'Expeditions designed by local residents who know every hidden trail, spring, and volcanic summit.',
      sec_why_p3_title: '24/7 Satellite Assistance',
      sec_why_p3_desc: 'Real-time SOS satellite safety network directly connected to search-and-rescue teams and tourist police.',

      sec_exp_title: 'Featured Experiences',
      sec_exp_sub: 'Immersive adventures guided by certified local community Baqueanos',
      sec_exp_all: 'Explore all experiences',

      sec_testimonials_title: 'Traveler Stories',
      sec_testimonials_sub: 'Real stories from travelers who discovered authentic Nicaragua',

      sec_banner_title: 'There is a Nicaragua that does not appear on ordinary maps.',
      sec_banner_sub: 'Join a sovereign network of explorers and local hosts transforming sustainable tourism.',
      sec_banner_btn: 'Start Exploring',

      sec_community_title: 'Do you offer tourism services?',
      sec_community_sub: 'Join the Baqueano host network for free and welcome travelers from around the globe without commissions.',
      sec_community_btn: 'Register My Business',

      // 🚨 SOS & RESCUE CENTER
      sos_title: '24/7 National SOS & Emergency Center',
      sos_subtitle: 'Immediate rescue and support on trails, volcanoes, nature reserves, and coasts in Nicaragua.',
      sos_gps_status: 'Satellite GPS Signal Active',
      sos_gps_fetching: 'Acquiring satellite coordinates in territory...',
      sos_btn_copy_coords: 'Copy GPS Coordinates',
      sos_btn_whatsapp: 'Send SOS with GPS via WhatsApp',
      sos_police: 'National & Tourist Police',
      sos_police_sub: 'Security, highway assistance, and patrol',
      sos_ambulance: 'Nicaraguan White Cross',
      sos_ambulance_sub: 'Ambulances and advanced medical support',
      sos_firefighters: 'Unified Firefighters (115 / 911)',
      sos_firefighters_sub: 'Fire suppression, volcano rescue, collisions',
      sos_navy: 'Naval Armed Forces',
      sos_navy_sub: 'Emergencies on Pacific, Caribbean & Lake waters',
      sos_sinapred: 'SINAPRED / Civil Defense',
      sos_sinapred_sub: 'Volcanic, seismic, and hurricane early warning',
      sos_minsa: 'MINSA Emergency Health (102)',
      sos_minsa_sub: 'Public hospital and clinic network',
      sos_tool_siren: 'Acoustic SOS Siren',
      sos_tool_siren_desc: 'High-pitch oscillating siren for wilderness trail rescues',
      sos_tool_strobe: 'Strobe SOS Beacon',
      sos_tool_strobe_desc: 'Full-screen Morse code distress flashing for night rescue',
      sos_first_aid_title: 'Quick Wilderness Survival Guide',
      sos_first_aid_snake: '🐍 Snakebite: Keep victim calm and still, do NOT cut or suck venom, drink clean water, and head to the nearest health post.',
      sos_first_aid_heat: '☀️ Heatstroke on Volcanoes: Move to shade immediately, sip oral rehydration salts slowly, and loosen tight gear.',
      sos_first_aid_lost: '🧭 Lost on a Trail: Stay put, trigger the acoustic distress siren, and remember the setting sun indicates West (Pacific Ocean).',

      // 🦶 PIE DE PÁGINA INSTITUCIONAL (FOOTER)
      footer_brand_sub: 'AUTHENTIC NICARAGUA',
      footer_tagline: 'Discover what is not on the map.',
      footer_col_explore: 'EXPLORE',
      footer_col_culture: 'CULTURA',
      footer_col_legal: 'LEGAL & PLATFORM',
      footer_col_community: 'COMMUNITY',
      footer_col_account: 'ACCOUNT',
      footer_rights: 'All rights reserved.',
      footer_platform_desc: 'Sovereign digital ecosystem for community ecotourism, cultural heritage, and nature conservation in Nicaragua.',
      footer_stamp_title: 'AUTHENTIC NICARAGUA',
      footer_stamp_sub: 'SOVEREIGN TOURISM',

      // 🔔 NOTIFICATIONS & ACTIONS
      coords_copied: 'GPS coordinates copied to clipboard! 📋',
      siren_started: '🚨 Acoustic emergency siren activated at max volume',
      siren_stopped: 'Acoustic siren stopped',
      strobe_active: 'SOS Strobe Beacon active (Tap screen to stop)',
      lang_switched: 'Language switched to English 🇺🇸'
    }
  };

  // ── ESTADO ACTUAL ─────────────────────────────────────────────────────────
  var currentLang = 'es';

  function detectInitialLanguage() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'es') return saved;
      var navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
      if (navLang.startsWith('en')) return 'en';
    } catch (e) {
      // Ignorar restricciones de cookies/storage
    }
    return 'es';
  }

  // ── FUNCIÓN DE TRADUCCIÓN PURA ────────────────────────────────────────────
  function t(key) {
    var dict = DICTIONARY[currentLang] || DICTIONARY.es;
    return dict[key] || DICTIONARY.es[key] || key;
  }

  // ── APLICAR TRADUCCIONES AL DOM ───────────────────────────────────────────
  function applyTranslations() {
    var lang = currentLang;
    var dict = DICTIONARY[lang];
    if (!dict) return;

    // Actualizar lang en <html>
    document.documentElement.lang = lang;

    // 1. Elementos con data-i18n
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    // 2. Elementos con data-i18n-html
    document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-html');
      if (dict[key]) {
        el.innerHTML = dict[key];
      }
    });

    // 3. Inputs con data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    // 4. Elementos con data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-title');
      if (dict[key]) {
        el.setAttribute('title', dict[key]);
      }
    });

    // 5. TRADUCCIÓN HEURÍSTICA INTELIGENTE DE COMPONENTES DEL NAVBAR
    translateNavbarComponents(lang);

    // 6. TRADUCCIÓN HEURÍSTICA DE COMPONENTES DEL FOOTER
    translateFooterComponents(lang);

    // 7. TRADUCCIÓN DEL HERO Y HOME PAGE
    translateHomeComponents(lang);

    // 8. Actualizar los botones indicadores de idioma en la página
    updateLanguagePill(lang);

    // Despachar evento global
    window.dispatchEvent(new CustomEvent('baqueano:languageChanged', { detail: { lang: lang } }));
  }

  // ── TRADUCCIÓN HEURÍSTICA NAVBAR ──────────────────────────────────────────
  function translateNavbarComponents(lang) {
    var isEn = lang === 'en';

    // Tagline de marca
    document.querySelectorAll('.exact-nav-tagline, .navbar-brand-sub, .bq-brand-sub').forEach(function(el) {
      el.textContent = isEn ? 'AUTHENTIC NICARAGUA' : 'NICARAGUA AUTÉNTICA';
    });

    // Enlaces del menú central
    var linkMap = {
      'Inicio': isEn ? 'Home' : 'Inicio',
      'Home': isEn ? 'Home' : 'Inicio',
      'Explorar': isEn ? 'Explore' : 'Explorar',
      'Explore': isEn ? 'Explore' : 'Explorar',
      'Destinos': isEn ? 'Destinations' : 'Destinos',
      'Destinations': isEn ? 'Destinations' : 'Destinos',
      'Cultura': isEn ? 'Culture' : 'Cultura',
      'Culture': isEn ? 'Culture' : 'Cultura',
      'Baqueano IA': isEn ? 'Baqueano AI' : 'Baqueano IA',
      'Baqueano AI': isEn ? 'Baqueano AI' : 'Baqueano IA',
      'Mi Viaje': isEn ? 'My Trip' : 'Mi Viaje',
      'My Trip': isEn ? 'My Trip' : 'Mi Viaje',
      'Más': isEn ? 'More' : 'Más',
      'More': isEn ? 'More' : 'Más'
    };

    document.querySelectorAll('#mainNavbar .exact-nav-link, #mainNavbar .nav-links-menu > a, .bq-nav-links > a').forEach(function(link) {
      var label = link.querySelector('.nav-label') || link;
      var text = label.textContent.trim();
      if (linkMap[text]) {
        label.textContent = linkMap[text];
      }
    });

    // Botón "Más"
    var moreBtn = document.getElementById('btnGlobalMoreTrigger') || document.querySelector('.exact-nav-dropdown-btn');
    if (moreBtn) {
      var span = moreBtn.querySelector('span');
      if (span) span.textContent = isEn ? 'More' : 'Más';
    }

    // Botón Iniciar Sesión
    document.querySelectorAll('.navbar-login-btn span, .exact-nav-btn-login span, .bq-nav-login').forEach(function(btn) {
      btn.textContent = isEn ? 'Sign In' : 'Iniciar sesión';
    });

    // Botón SOS
    document.querySelectorAll('.navbar-sos-btn span, .sos-quick-btn span').forEach(function(btn) {
      btn.textContent = 'SOS';
    });

    // Mega Menú Columnas
    var col1Title = document.querySelector('.global-mega-column.explore h2');
    if (col1Title) col1Title.innerHTML = '<i class="fa-solid fa-location-dot"></i> ' + (isEn ? 'Explore' : 'Explorar');

    var col2Title = document.querySelector('.global-mega-column.culture h2');
    if (col2Title) col2Title.innerHTML = '<i class="fa-solid fa-landmark"></i> ' + (isEn ? 'Culture' : 'Cultura');

    var col3Title = document.querySelector('.global-mega-column.community h2');
    if (col3Title) col3Title.innerHTML = '<i class="fa-solid fa-people-group"></i> ' + (isEn ? 'Community' : 'Comunidad');

    var col4Title = document.querySelector('.global-mega-column.account h2');
    if (col4Title) col4Title.innerHTML = '<i class="fa-solid fa-gear"></i> ' + (isEn ? 'Account & Platform' : 'Cuenta y Plataforma');

    // Mega Menú Enlaces Internos
    var megaLinks = {
      'departamento.html': isEn ? '<i class="fa-regular fa-map"></i> Departments' : '<i class="fa-regular fa-map"></i> Departamentos',
      'destinos.html': isEn ? '<i class="fa-solid fa-mountain-sun"></i> Destinations' : '<i class="fa-solid fa-mountain-sun"></i> Destinos',
      'mapa.html': isEn ? '<i class="fa-regular fa-map"></i> Map' : '<i class="fa-regular fa-map"></i> Mapa',
      'experiencias.html': isEn ? '<i class="fa-solid fa-person-hiking"></i> Experiences' : '<i class="fa-solid fa-person-hiking"></i> Experiencias',
      'historia.html': isEn ? '<i class="fa-regular fa-file-lines"></i> History' : '<i class="fa-regular fa-file-lines"></i> Historia',
      'gastronomia.html': isEn ? '<i class="fa-solid fa-utensils"></i> Gastronomy' : '<i class="fa-solid fa-utensils"></i> Gastronomía',
      'musica.html': isEn ? '<i class="fa-solid fa-music"></i> Music' : '<i class="fa-solid fa-music"></i> Música',
      'ambiental.html': isEn ? '<i class="fa-regular fa-leaf"></i> Environmental' : '<i class="fa-regular fa-leaf"></i> Ambiental',
      'aliados.html': isEn ? '<i class="fa-regular fa-handshake"></i> Allies' : '<i class="fa-regular fa-handshake"></i> Aliados',
      'mi-negocio.html': isEn ? '<i class="fa-solid fa-shop"></i> My Business' : '<i class="fa-solid fa-shop"></i> Mi Negocio',
      'denuncias.html': isEn ? '<i class="fa-solid fa-shield-halved"></i> Report Issue' : '<i class="fa-solid fa-shield-halved"></i> Denuncia',
      'perfil.html': isEn ? '<i class="fa-regular fa-user"></i> Profile' : '<i class="fa-regular fa-user"></i> Perfil',
      'perfil.html#tab-viajes': isEn ? '<i class="fa-regular fa-calendar-days"></i> Reservations' : '<i class="fa-regular fa-calendar-days"></i> Reservas',
      'destinos.html?favs=1': isEn ? '<i class="fa-regular fa-heart"></i> Favorites' : '<i class="fa-regular fa-heart"></i> Favoritos',
      'nosotros.html#faq': isEn ? '<i class="fa-regular fa-circle-question"></i> Help' : '<i class="fa-regular fa-circle-question"></i> Ayuda',
      'nosotros.html': isEn ? '<i class="fa-solid fa-people-group"></i> About Us' : '<i class="fa-solid fa-people-group"></i> Nosotros',
      'terminos.html': isEn ? '<i class="fa-regular fa-file-lines"></i> Terms' : '<i class="fa-regular fa-file-lines"></i> Términos',
      'privacidad.html': isEn ? '<i class="fa-solid fa-shield-halved"></i> Privacy' : '<i class="fa-solid fa-shield-halved"></i> Privacidad',
      'cookies.html': isEn ? '<i class="fa-solid fa-cookie-bite"></i> Cookies' : '<i class="fa-solid fa-cookie-bite"></i> Cookies',
      'admin.html': isEn ? '<i class="fa-solid fa-lock"></i> Admin / Ops Center <small>Staff only</small>' : '<i class="fa-solid fa-lock"></i> Admin / Ops Center <small>Solo personal</small>'
    };

    document.querySelectorAll('.global-mega-column a').forEach(function(a) {
      var href = a.getAttribute('href');
      if (megaLinks[href]) {
        a.innerHTML = megaLinks[href];
      }
    });
  }

  // ── TRADUCCIÓN HEURÍSTICA HOME & HERO ─────────────────────────────────────
  function translateHomeComponents(lang) {
    var isEn = lang === 'en';

    // Hero titles
    var heroTitle = document.querySelector('.hero-exact-title');
    if (heroTitle) {
      heroTitle.innerHTML = isEn
        ? 'NOT JUST VISITED,<br><span class="hero-exact-title-accent">DISCOVERED</span>'
        : 'NO SE VISITA,<br><span class="hero-exact-title-accent">SE DESCUBRE</span>';
    }

    var heroSubtitle = document.querySelector('.hero-exact-subtitle');
    if (heroSubtitle) {
      heroSubtitle.textContent = isEn
        ? 'Beaches, volcanoes, mountains, culture, gastronomy, and communities that do not appear on standard tourist maps.'
        : 'Playas, volcanes, montañas, cultura, gastronomía y comunidades que no aparecen en las rutas tradicionales.';
    }

    var heroSearchInput = document.querySelector('.hero-exact-search input[type="search"]');
    if (heroSearchInput) {
      heroSearchInput.placeholder = isEn
        ? 'What do you want to experience in Nicaragua?'
        : '¿Qué querés vivir en Nicaragua?';
    }

    var heroSearchBtn = document.querySelector('.hero-exact-search button');
    if (heroSearchBtn) {
      heroSearchBtn.textContent = isEn ? 'Search' : 'Buscar';
    }

    var heroMapBtn = document.querySelector('.hero-exact-btn.map');
    if (heroMapBtn) {
      heroMapBtn.innerHTML = isEn
        ? '<i class="fa-regular fa-map"></i> Explore map'
        : '<i class="fa-regular fa-map"></i> Explorar mapa';
    }

    var heroAiBtn = document.querySelector('.hero-exact-btn.ai');
    if (heroAiBtn) {
      heroAiBtn.innerHTML = isEn
        ? '<i class="fa-solid fa-wand-magic-sparkles"></i> Plan with AI'
        : '<i class="fa-solid fa-wand-magic-sparkles"></i> Planificar con IA';
    }

    var watchVideoBtn = document.querySelector('.hero-exact-video-btn span');
    if (watchVideoBtn) {
      watchVideoBtn.textContent = isEn ? 'Watch video' : 'Ver video';
    }

    // Categorías de la barra de 10 iconos
    var catMap = {
      'Playas': isEn ? 'Beaches' : 'Playas',
      'Beaches': isEn ? 'Beaches' : 'Playas',
      'Volcanes': isEn ? 'Volcanoes' : 'Volcanes',
      'Volcanoes': isEn ? 'Volcanoes' : 'Volcanes',
      'Montañas': isEn ? 'Mountains' : 'Montañas',
      'Mountains': isEn ? 'Mountains' : 'Montañas',
      'Gastronomía': isEn ? 'Gastronomy' : 'Gastronomía',
      'Gastronomy': isEn ? 'Gastronomy' : 'Gastronomía',
      'Cultura': isEn ? 'Culture' : 'Cultura',
      'Culture': isEn ? 'Culture' : 'Cultura',
      'Reservas': isEn ? 'Reserves' : 'Reservas',
      'Reserves': isEn ? 'Reserves' : 'Reservas',
      'Aventura': isEn ? 'Adventure' : 'Aventura',
      'Adventure': isEn ? 'Adventure' : 'Aventura',
      'Historia': isEn ? 'History' : 'Historia',
      'History': isEn ? 'History' : 'Historia',
      'Artesanías': isEn ? 'Handicrafts' : 'Artesanías',
      'Handicrafts': isEn ? 'Handicrafts' : 'Artesanías',
      'Hospedajes': isEn ? 'Lodging' : 'Hospedajes',
      'Lodging': isEn ? 'Lodging' : 'Hospedajes'
    };

    document.querySelectorAll('.category-item-exact span, .category-card span').forEach(function(span) {
      var txt = span.textContent.trim();
      if (catMap[txt]) span.textContent = catMap[txt];
    });
  }

  // ── TRADUCCIÓN HEURÍSTICA FOOTER ──────────────────────────────────────────
  function translateFooterComponents(lang) {
    var isEn = lang === 'en';

    var footerTagline = document.querySelector('.footer-brand-sub-exact, .bq-footer-tagline');
    if (footerTagline) {
      footerTagline.textContent = isEn
        ? 'Discover what is not on the map.'
        : 'Descubrí lo que no sale en el mapa.';
    }

    var stampTitle = document.querySelector('.bq-stamp-title');
    if (stampTitle) stampTitle.textContent = isEn ? 'AUTHENTIC NICARAGUA' : 'NICARAGUA AUTÉNTICA';

    var stampSub = document.querySelector('.bq-stamp-sub');
    if (stampSub) stampSub.textContent = isEn ? 'SOVEREIGN TOURISM' : 'TURISMO SOBERANO';
  }

  // ── ACTUALIZAR PÍLDORA INDICADORA DE IDIOMA EN NAVBAR ─────────────────────
  function updateLanguagePill(lang) {
    var isEn = lang === 'en';
    var labelText = isEn ? 'EN' : 'ES';

    document.querySelectorAll('.global-language, .navbar-lang-pill').forEach(function(pill) {
      pill.innerHTML = labelText + ' <i class="fa-solid fa-chevron-down" style="font-size:0.68rem;color:#F65E01"></i>';
      pill.setAttribute('aria-label', isEn ? 'Switch to Spanish' : 'Switch to English');
      pill.setAttribute('title', isEn ? 'Language: English (Click to change)' : 'Idioma: Español (Clic para cambiar)');
    });
  }

  // ── CONMUTAR O CAMBIAR IDIOMA ─────────────────────────────────────────────
  function setLanguage(lang) {
    if (lang !== 'es' && lang !== 'en') lang = 'es';
    currentLang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
    applyTranslations();
  }

  function toggleLanguage() {
    setLanguage(currentLang === 'es' ? 'en' : 'es');
  }

  function getLanguage() {
    return currentLang;
  }

  // ── CREAR DROPDOWN FLOTANTE DE IDIOMAS ─────────────────────────────────────
  function setupLanguageDropdowns() {
    // Si ya existe el dropdown flotante global, no recrearlo
    if (document.getElementById('bqLangMenuFloating')) return;

    var menu = document.createElement('div');
    menu.id = 'bqLangMenuFloating';
    menu.style.cssText = 'position:fixed;display:none;z-index:100005;background:#FFFFFF;' +
      'border:1px solid rgba(15,23,42,0.12);border-radius:12px;padding:6px;box-shadow:0 12px 36px rgba(15,23,42,0.16);' +
      'min-width:140px;font-family:\'Inter\',sans-serif;font-size:0.84rem;font-weight:700;animation:bqDropIn .18s ease;';

    menu.innerHTML =
      '<button type="button" data-lang="es" style="display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;' +
        'border:none;background:transparent;border-radius:8px;cursor:pointer;color:#0F172A;font-weight:700;text-align:left;">' +
        '<span>🇳🇮</span> <span>Español (ES)</span>' +
      '</button>' +
      '<button type="button" data-lang="en" style="display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;' +
        'border:none;background:transparent;border-radius:8px;cursor:pointer;color:#0F172A;font-weight:700;text-align:left;">' +
        '<span>🇺🇸</span> <span>English (EN)</span>' +
      '</button>';

    document.body.appendChild(menu);

    menu.querySelectorAll('button[data-lang]').forEach(function(btn) {
      btn.addEventListener('mouseenter', function() {
        btn.style.background = 'rgba(246,94,1,0.08)';
        btn.style.color = '#F65E01';
      });
      btn.addEventListener('mouseleave', function() {
        btn.style.background = 'transparent';
        btn.style.color = '#0F172A';
      });
      btn.addEventListener('click', function() {
        var chosen = btn.getAttribute('data-lang');
        setLanguage(chosen);
        menu.style.display = 'none';
        if (window.bqToast) {
          window.bqToast(chosen === 'en' ? 'Language switched to English 🇺🇸' : 'Idioma cambiado a Español 🇳🇮', 'info');
        }
      });
    });

    // Conectar botones del navbar
    document.querySelectorAll('.global-language, .navbar-lang-pill').forEach(function(pill) {
      pill.addEventListener('click', function(e) {
        e.stopPropagation();
        var isVisible = menu.style.display === 'block';
        if (isVisible) {
          menu.style.display = 'none';
          return;
        }

        var rect = pill.getBoundingClientRect();
        menu.style.top = (rect.bottom + 8) + 'px';
        menu.style.left = (rect.right - 140) + 'px';
        menu.style.display = 'block';
      });
    });

    document.addEventListener('click', function(e) {
      if (!menu.contains(e.target) && !e.target.closest('.global-language, .navbar-lang-pill')) {
        menu.style.display = 'none';
      }
    });
  }

  // ── INICIALIZACIÓN ────────────────────────────────────────────────────────
  function init() {
    currentLang = detectInitialLanguage();
    applyTranslations();
    setupLanguageDropdowns();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── EXPOSICIÓN PÚBLICA ────────────────────────────────────────────────────
  window.BaqueanoI18n = {
    setLanguage: setLanguage,
    getLanguage: getLanguage,
    toggleLanguage: toggleLanguage,
    applyTranslations: applyTranslations,
    t: t,
    DICTIONARY: DICTIONARY
  };

})();
