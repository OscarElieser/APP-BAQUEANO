// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CONTROLADOR DE NAVEGACIÓN DINÁMICA & MODALES (navigation.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia de navegación institucional ultra-interactiva, dinámica
//   y de alta fidelidad entre todas las páginas del ecosistema oficial Baqueano Nicaragua.
// - Brindar retroalimentación visual en tiempo real (indicador flotante magnético,
//   seguimiento de luz ambiental del cursor, baliza SOS viva y micro-interacciones táctiles)
//   para conectar al explorador con las rutas, historia, gastronomía y herramientas rurales.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Indicador de píldora deslizante con interpolación física suave y ajuste dinámico en resize.
// - Seguimiento de coordenadas del puntero para iluminación volumétrica con variables CSS3.
// - Menú móvil con animaciones fluidas, control de accesibilidad (ARIA) y cierre defensivo.
// - Generación de ondas táctiles (ripples) reactivas al clic en botones de acción.
// - Integración con Geolocation API y Firebase Analytics sin bloqueo del hilo principal.
//
// 📦 3. QUÉ (WHAT / FUNCIONES EXPUESTAS):
// - initNavbarScroll(): Efecto dinámico de elevación, desenfoque y brillo de borde al scrollear.
// - initDynamicNavbar(): Indicador magnético deslizante y luz ambiental interactiva del cursor.
// - initMobileMenu(): Drawer táctico para smartphones con transiciones escalonadas.
// - initActiveNavHighlight(): Identificación y resaltado de la ruta activa en el menú.
// - initActionRipples(): Micro-interacciones de ondas expansivas en botones tácticos.
// - initSosModal(): Centro de auxilio con geolocalización satelital en tiempo real.
// - initDownloadModal(): Diálogo de distribución directa del APK oficial para Android.
// - initShareTools(): Herramientas de difusión comunitaria en WhatsApp y portapapeles.
// - initSmoothScroll(): Desplazamiento fluido para hipervínculos internos.
// - initDynamicDestinationCount(): Total publicado de destinos sincronizado con Firestore.
// ============================================================================

let currentGpsCoords = "Ubicación aún no disponible";

// ============================================================================
// 🎯 POR QUÉ: mantener un único orden de navegación en todo el portal.
// ⚙️ CÓMO: normaliza la barra existente antes de activar sus controladores.
// 📦 QUÉ: cinco accesos principales y un mega menú de cuatro columnas.
// ============================================================================
function buildGlobalMegaNavigation() {
  const navbar = document.getElementById('mainNavbar');
  const navMenu = document.getElementById('navLinksMenu');
  if (!navbar || !navMenu || navMenu.dataset.globalMegaReady === 'true') return;
  if (!document.querySelector('link[data-global-mega-nav]')) {
    const style = document.createElement('link');
    style.rel = 'stylesheet'; style.href = 'css/navigation-mega.css?v=20260927-1'; style.dataset.globalMegaNav = 'true';
    document.head.appendChild(style);
  }
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const activeClass = (files) => files.includes(current) ? ' active' : '';
  navMenu.dataset.globalMegaReady = 'true';
  navMenu.innerHTML = `
    <span class="nav-pill-indicator" aria-hidden="true"></span>
    <a href="index.html" class="${activeClass(['index.html'])}" role="menuitem"><span class="nav-item-content"><span class="nav-label">Inicio</span></span></a>
    <a href="destinos.html" class="${activeClass(['destinos.html','departamento.html','mapa.html'])}" role="menuitem"><span class="nav-item-content"><span class="nav-label">Explorar</span></span></a>
    <a href="historia.html" class="${activeClass(['historia.html','gastronomia.html','musica.html','ambiental.html'])}" role="menuitem"><span class="nav-item-content"><span class="nav-label">Cultura</span></span></a>
    <a href="baqueano-ai.html#planner" class="${activeClass(['baqueano-ai.html'])}" role="menuitem"><span class="nav-item-content"><span class="nav-label">Baqueano IA</span></span></a>
    <a href="mi-viaje.html" class="${activeClass(['mi-viaje.html'])}" role="menuitem"><span class="nav-item-content"><span class="nav-label">Mi Viaje</span></span></a>
    <div class="nav-dropdown global-more-dropdown" id="navDropdownGlobalMore" role="none">
      <button class="nav-dropdown-trigger${activeClass(['aliados.html','mi-negocio.html','denuncias.html','perfil.html','nosotros.html','terminos.html','privacidad.html','cookies.html','aviso-legal.html','admin.html'])}" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="globalMegaMenu" role="menuitem"><span class="nav-item-content"><span class="nav-label">Más</span></span><i class="fa-solid fa-chevron-down"></i></button>
      <div class="nav-dropdown-menu global-mega-menu" id="globalMegaMenu" role="menu">
        <section class="global-mega-column explore"><h2><i class="fa-solid fa-location-dot"></i> Explorar</h2><a href="departamento.html"><i class="fa-regular fa-map"></i>Departamentos</a><a href="destinos.html"><i class="fa-solid fa-mountain-sun"></i>Destinos</a><a href="mapa.html"><i class="fa-regular fa-map"></i>Mapa</a><a href="index.html#experiencias"><i class="fa-solid fa-person-hiking"></i>Experiencias</a></section>
        <section class="global-mega-column culture"><h2><i class="fa-solid fa-landmark"></i> Cultura</h2><a href="historia.html"><i class="fa-regular fa-file-lines"></i>Historia</a><a href="gastronomia.html"><i class="fa-solid fa-utensils"></i>Gastronomía</a><a href="musica.html"><i class="fa-solid fa-music"></i>Música</a><a href="ambiental.html"><i class="fa-regular fa-leaf"></i>Ambiental</a></section>
        <section class="global-mega-column community"><h2><i class="fa-solid fa-people-group"></i> Comunidad</h2><a href="aliados.html"><i class="fa-regular fa-handshake"></i>Aliados</a><a href="mi-negocio.html"><i class="fa-solid fa-shop"></i>Mi Negocio</a><a href="denuncias.html"><i class="fa-solid fa-shield-halved"></i>Denuncia</a></section>
        <section class="global-mega-column account"><h2><i class="fa-solid fa-gear"></i> Cuenta y Plataforma</h2><a href="perfil.html"><i class="fa-regular fa-user"></i>Perfil</a><a href="perfil.html#tab-viajes"><i class="fa-regular fa-calendar-days"></i>Reservas</a><a href="perfil.html#dashboardFavorites"><i class="fa-regular fa-heart"></i>Favoritos</a><a href="index.html#ayuda"><i class="fa-regular fa-circle-question"></i>Ayuda</a><a href="nosotros.html"><i class="fa-solid fa-people-group"></i>Nosotros</a><a href="terminos.html"><i class="fa-regular fa-file-lines"></i>Términos</a><a href="privacidad.html"><i class="fa-solid fa-shield-halved"></i>Privacidad</a><a href="cookies.html"><i class="fa-solid fa-cookie-bite"></i>Cookies</a><a class="global-admin-link" href="admin.html"><i class="fa-solid fa-lock"></i>Admin / Ops Center <small>Solo personal</small></a></section>
      </div>
    </div>`;
  const actions = navbar.querySelector('.nav-actions-right, .nav-right-actions');
  if (actions) {
    actions.classList.add('global-nav-actions');
    actions.innerHTML = `<span class="global-weather"><i class="fa-solid fa-cloud-sun"></i> 25.0°C</span><a class="global-search" href="destinos.html" aria-label="Buscar"><i class="fa-solid fa-magnifying-glass"></i></a><button class="global-theme" type="button" aria-label="Cambiar apariencia"><i class="fa-solid fa-sun"></i><i class="fa-solid fa-moon"></i></button><a class="sos-quick-btn open-sos-btn" href="index.html#sos"><i class="fa-solid fa-shield-heart"></i><span>SOS</span></a><a class="nav-profile-btn global-session" href="perfil.html"><span class="nav-profile-avatar"><i class="fa-solid fa-user"></i></span><span class="nav-profile-info"><span class="nav-profile-name">Iniciar sesión</span><span class="nav-profile-role">Explorador</span></span></a><button class="global-language" type="button" aria-label="Cambiar idioma">ES <i class="fa-solid fa-chevron-down"></i></button><button class="mobile-nav-toggle" id="mobileNavToggle" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="navLinksMenu"><i class="fa-solid fa-bars"></i></button>`;
  }
}

// ============================================================================
// CONTADOR GLOBAL DE DESTINOS PUBLICADOS
// 🎯 POR QUÉ: impedir que el menú muestre una cifra obsoleta al crecer el catálogo.
// ⚙️ CÓMO: escucha /places en tiempo real; si no hay red, usa catálogo local o caché.
// 📦 QUÉ: actualiza insignia y descripción de Destinos en cada barra de navegación.
// ============================================================================
function initDynamicDestinationCount() {
  const destinationLinks = [...document.querySelectorAll('.nav-dropdown-item[href$="destinos.html"]')];
  if (!destinationLinks.length) return;

  const cacheKey = 'baqueano_published_destinations_count';
  let unsubscribe = null;

  const renderCount = (rawCount) => {
    const count = Number(rawCount);
    if (!Number.isInteger(count) || count < 0) return;

    destinationLinks.forEach((link) => {
      const badge = link.querySelector('.nav-dd-badge');
      const description = link.querySelector('.nav-dd-desc');
      if (badge) {
        badge.textContent = String(count);
        badge.setAttribute('aria-label', `${count} destinos publicados`);
      }
      if (description) description.textContent = `${count} destinos y experiencias`;
    });

    try { localStorage.setItem(cacheKey, String(count)); } catch (_) {}
  };

  const localCards = document.querySelectorAll('.destinations-showcase-grid > .dest-card-pro').length;
  let cachedCount = 0;
  try { cachedCount = Number.parseInt(localStorage.getItem(cacheKey) || '0', 10); } catch (_) {}
  if (localCards > 0) renderCount(localCards);
  else if (cachedCount > 0) renderCount(cachedCount);
  else {
    destinationLinks.forEach((link) => {
      const badge = link.querySelector('.nav-dd-badge');
      const description = link.querySelector('.nav-dd-desc');
      if (badge) badge.textContent = '…';
      if (description) description.textContent = 'Destinos y experiencias';
    });
  }

  const connectFirestore = (attempt = 0) => {
    if (!window.firebase || typeof window.firebase.firestore !== 'function') {
      if (attempt < 12) window.setTimeout(() => connectFirestore(attempt + 1), 250);
      return;
    }

    try {
      const query = window.firebase.firestore().collection('places').where('status', '==', 'published');
      unsubscribe = query.onSnapshot((snapshot) => {
        renderCount(snapshot.size);
      }, (error) => {
        console.warn('[Baqueano Navigation] Contador de destinos en modo local:', error.message);
      });
    } catch (error) {
      console.warn('[Baqueano Navigation] No se pudo iniciar el contador:', error.message);
    }
  };

  connectFirestore();
  window.addEventListener('pagehide', () => {
    if (typeof unsubscribe === 'function') unsubscribe();
  }, { once: true });
}

function initRuntimeObservability() {
  if (window.__baqueanoObservabilityReady) return;
  window.__baqueanoObservabilityReady = true;
  const record = (type, detail) => {
    const entry = { type, detail, path: location.pathname, at: new Date().toISOString() };
    try {
      const previous = JSON.parse(sessionStorage.getItem('baqueano_runtime_trace') || '[]');
      sessionStorage.setItem('baqueano_runtime_trace', JSON.stringify([...previous.slice(-19), entry]));
    } catch (_) {}
    if (type.includes('error')) console.warn('[Baqueano Trace]', entry);
  };

  window.addEventListener('error', (event) => {
    const target = event.target;
    if (target && target !== window && (target.src || target.href)) {
      record('resource_error', String(target.src || target.href));
      return;
    }
    record('javascript_error', event.message || 'Error no identificado');
  }, true);
  window.addEventListener('unhandledrejection', (event) => {
    record('promise_error', event.reason?.message || String(event.reason || 'Promesa rechazada'));
  });

  if ('PerformanceObserver' in window) {
    try {
      new PerformanceObserver((list) => {
        const last = list.getEntries().at(-1);
        if (last) record('largest_contentful_paint', Math.round(last.startTime));
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (_) {}
  }
  window.BaqueanoTrace = { read: () => {
    try { return JSON.parse(sessionStorage.getItem('baqueano_runtime_trace') || '[]'); }
    catch (_) { return []; }
  } };
}

// Acceso global al planificador territorial desde la navegación pública.
function initBaqueanoAiNavLink() {
  const menu = document.querySelector('.nav-links-menu');
  if (!menu || menu.querySelector('a[href^="baqueano-ai.html"]')) return;
  const link = document.createElement('a');
  link.href = 'baqueano-ai.html#planner';
  link.className = 'nav-link-ai';
  link.innerHTML = `
    <span class="nav-item-content">
      <span class="nav-icon-box"><i class="fa-solid fa-wand-magic-sparkles nav-icon"></i></span>
      <span class="nav-text-group"><span class="nav-label">Baqueano AI</span><span class="nav-sublabel">Planifica tu ruta</span></span>
    </span>
    <span class="nav-right-wrap"><span class="nav-item-badge live">● En línea</span><i class="fa-solid fa-chevron-right nav-arrow"></i></span>`;
  const profileLink = menu.querySelector('a[href="perfil.html"]');
  menu.insertBefore(link, profileLink || null);
}

/**
 * POR QUÉ: habilita navegación offline sin almacenar datos personales.
 * CÓMO: registra un worker cuyo alcance y exclusiones se validan internamente.
 * QUÉ: activa el fallback público en contextos seguros compatibles.
 */
function initPublicServiceWorker() {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js?v=11', { scope: '/', updateViaCache: 'none' })
      .catch((error) => console.warn('[PWA] No fue posible registrar el modo offline:', error));
  }, { once: true });
}

/**
 * Controla el estado visual de la barra superior con efecto dinámico al hacer scroll.
 */
function initNavbarScroll() {
  const navbar = document.getElementById('mainNavbar');
  if (!navbar) return;

  let ticking = false;
  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 25) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * Píldora deslizante magnética que sigue el cursor y regresa al elemento activo.
 */
function initDynamicNavbar() {
  const navbar = document.getElementById('mainNavbar');
  const navMenu = document.getElementById('navLinksMenu');
  if (!navMenu) return;

  // Crear o reutilizar la píldora indicadora flotante
  let indicator = navMenu.querySelector('.nav-pill-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.className = 'nav-pill-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    navMenu.appendChild(indicator);
  }

  // Seleccionar solo los elementos de nivel superior (enlaces directos o trigger de dropdown)
  const topNavItems = Array.from(navMenu.querySelectorAll(':scope > a, :scope > .nav-dropdown > .nav-dropdown-trigger'));
  if (topNavItems.length === 0) return;

  navMenu.classList.add('has-indicator');

  const moveIndicatorTo = (targetEl) => {
    if (!targetEl || !indicator) return;
    const menuRect = navMenu.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    const left = targetRect.left - menuRect.left;
    const width = targetRect.width;

    indicator.style.transform = `translateX(${left}px)`;
    indicator.style.width = `${width}px`;
    indicator.style.opacity = '1';
  };

  const getActiveItem = () => {
    // Si un enlace dentro del dropdown "Mi País" está activo, el trigger es el activo
    const dropdownActiveLink = navMenu.querySelector('.nav-dropdown-menu a.active');
    if (dropdownActiveLink) {
      const trigger = navMenu.querySelector('.nav-dropdown-trigger');
      if (trigger) return trigger;
    }
    return navMenu.querySelector(':scope > a.active') || topNavItems[0];
  };

  const syncActivePosition = () => {
    const activeItem = getActiveItem();
    if (activeItem) {
      moveIndicatorTo(activeItem);
    }
  };

  // Posicionamiento inicial con retraso mínimo para asegurar cálculo de fuentes
  requestAnimationFrame(syncActivePosition);
  setTimeout(syncActivePosition, 100);

  // Escuchadores de interacción sobre los elementos superiores
  topNavItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      topNavItems.forEach(l => l.classList.remove('hovered'));
      item.classList.add('hovered');
      moveIndicatorTo(item);
    });

    item.addEventListener('focus', () => {
      topNavItems.forEach(l => l.classList.remove('hovered'));
      item.classList.add('hovered');
      moveIndicatorTo(item);
    });
  });

  // Al salir del menú, regresar suavemente al elemento activo
  navMenu.addEventListener('mouseleave', () => {
    topNavItems.forEach(l => l.classList.remove('hovered'));
    syncActivePosition();
  });

  navMenu.addEventListener('focusout', (e) => {
    if (!navMenu.contains(e.relatedTarget)) {
      topNavItems.forEach(l => l.classList.remove('hovered'));
      syncActivePosition();
    }
  });

  // Recalcular en cambio de resolución de pantalla con debounce
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(syncActivePosition, 80);
  }, { passive: true });

  // Seguimiento del puntero para iluminación ambiental en el HUD
  if (navbar) {
    navbar.addEventListener('mousemove', (e) => {
      const rect = navbar.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      navbar.style.setProperty('--nav-mouse-x', `${x}px`);
      navbar.style.setProperty('--nav-mouse-y', `${y}px`);
    }, { passive: true });
  }

  // Inicializar micro-interacciones de ondas en botones de acción
  initActionRipples();
}

/**
 * Micro-interacciones con efecto ripple táctil en botones de acción.
 */
function initActionRipples() {
  const interactiveBtns = document.querySelectorAll('.btn-nav-download, .sos-quick-btn, .mobile-nav-toggle');
  interactiveBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.className = 'nav-click-ripple';
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

/**
 * 🎯 POR QUÉ: el menú horizontal se saturaba en tablets, portátiles y escritorios medianos.
 * ⚙️ CÓMO: convierte la navegación compartida en un drawer izquierdo accesible, con
 * fondo de cierre, bloqueo del documento, tecla Escape y restauración del foco.
 * 📦 QUÉ: panel lateral reutilizable en todas las páginas sin duplicar su HTML.
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const navMenu = document.getElementById('navLinksMenu');

  if (!toggleBtn || !navMenu) return;
  if (navMenu.dataset.drawerInitialized === 'true') return;
  navMenu.dataset.drawerInitialized = 'true';

  // El menú público conserva el patrón lateral del Ops Center en cualquier viewport.
  const compactNavigation = window.matchMedia('(min-width: 0px)');
  const navInner = toggleBtn.closest('.nav-inner');
  const brand = navInner?.querySelector('.brand-box');

  let drawerHeader = navMenu.querySelector('.nav-drawer-header');
  if (!drawerHeader) {
    drawerHeader = document.createElement('div');
    drawerHeader.className = 'nav-drawer-header';
    drawerHeader.innerHTML = `
      <span class="nav-drawer-brand-mark"><img src="assets/images/logo.png" alt="" width="42" height="42"></span>
      <span class="nav-drawer-identity">
        <span class="nav-drawer-kicker">CENTRO DE EXPLORACIÓN</span>
        <strong>BAQUEANO</strong>
        <small><i aria-hidden="true"></i> Red territorial activa</small>
      </span>
      <button class="nav-drawer-close" type="button" aria-label="Cerrar menú de navegación">
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>`;
    navMenu.prepend(drawerHeader);
  }

  // ========================================================================
  // JERARQUÍA OPERATIVA DEL DRAWER PÚBLICO
  // POR QUÉ: una lista plana dificulta escanear el menú y no replica la lectura
  // por módulos que caracteriza al sidebar del centro de operaciones.
  // CÓMO: inserta controles de acordeón antes de cada bloque y asocia cada
  // destino directo con su grupo, sin duplicar ni alterar sus enlaces.
  // QUÉ: tres grupos públicos desplegables: descubrir, planificar/conectar y cuenta/IA.
  // ========================================================================
  if (!navMenu.querySelector('.nav-ops-group-title')) {
    const directNavigationItems = () => [...navMenu.children].filter((item) =>
      item.matches('a, .nav-dropdown') && !item.classList.contains('nav-drawer-footer')
    );
    const insertGroupBefore = (targetLabel, number, title) => {
      const target = directNavigationItems().find((item) => item.querySelector('.nav-label')?.textContent.trim() === targetLabel);
      if (!target) return;
      const heading = document.createElement('button');
      heading.className = 'nav-ops-group-title';
      heading.type = 'button';
      heading.dataset.groupId = `public-nav-group-${number}`;
      heading.setAttribute('aria-expanded', 'false');
      heading.setAttribute('aria-controls', heading.dataset.groupId);
      heading.innerHTML = `<span class="nav-ops-group-number">${number}</span><b>${title}</b><small></small><i class="fa-solid fa-chevron-down" aria-hidden="true"></i>`;
      navMenu.insertBefore(heading, target);
    };
    insertGroupBefore('Explorar', '01', 'Descubrir Nicaragua');
    insertGroupBefore('Servicios', '02', 'Planificar y conectar');
    const hasProfile = directNavigationItems().some((item) => item.querySelector('.nav-label')?.textContent.trim() === 'Perfil');
    insertGroupBefore(hasProfile ? 'Perfil' : 'Baqueano AI', '03', 'Cuenta e inteligencia');
  }

  const groupButtons = [...navMenu.querySelectorAll(':scope > .nav-ops-group-title')];
  const groupItems = new Map();
  groupButtons.forEach((button, index) => {
    const items = [];
    let sibling = button.nextElementSibling;
    while (sibling && !sibling.classList.contains('nav-ops-group-title') && !sibling.classList.contains('nav-drawer-footer')) {
      if (sibling.matches('a, .nav-dropdown')) {
        sibling.dataset.navGroup = button.dataset.groupId;
        items.push(sibling);
      }
      sibling = sibling.nextElementSibling;
    }
    groupItems.set(button.dataset.groupId, items);
    const counter = button.querySelector('small');
    if (counter) counter.textContent = `${items.length} accesos`;
    button.dataset.groupIndex = String(index);
  });

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const activeGroupButton = groupButtons.find((button) =>
    (groupItems.get(button.dataset.groupId) || []).some((item) =>
      [...item.querySelectorAll('a[href]'), ...(item.matches('a[href]') ? [item] : [])]
        .some((link) => (link.getAttribute('href') || '').split('/').pop().split('#')[0] === currentPage)
    )
  );

  const setExpandedGroup = (selectedButton) => {
    groupButtons.forEach((button) => {
      const isExpanded = button === selectedButton;
      button.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      button.classList.toggle('is-expanded', isExpanded);
      (groupItems.get(button.dataset.groupId) || []).forEach((item) => {
        item.classList.toggle('nav-ops-item-collapsed', !isExpanded);
        if (!isExpanded && item.classList.contains('is-open')) {
          item.classList.remove('is-open');
          item.querySelector('.nav-dropdown-trigger')?.setAttribute('aria-expanded', 'false');
        }
      });
    });
  };

  const initialGroupButton = activeGroupButton || groupButtons[0];
  if (initialGroupButton) setExpandedGroup(initialGroupButton);
  groupButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextButton = button.classList.contains('is-expanded') ? null : button;
      setExpandedGroup(nextButton);
    });
  });

  let drawerFooter = navMenu.querySelector('.nav-drawer-footer');
  if (!drawerFooter) {
    drawerFooter = document.createElement('div');
    drawerFooter.className = 'nav-drawer-footer';
    drawerFooter.innerHTML = `
      <span><i class="fa-solid fa-shield-halved" aria-hidden="true"></i><b>Navegación protegida</b><small>Asistencia territorial disponible</small></span>
      <a href="baqueano-ai.html#planner" aria-label="Abrir el planificador de Baqueano"><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>`;
    navMenu.appendChild(drawerFooter);
  }

  let backdrop = document.querySelector('.nav-drawer-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('button');
    backdrop.className = 'nav-drawer-backdrop';
    backdrop.type = 'button';
    backdrop.tabIndex = -1;
    backdrop.setAttribute('aria-label', 'Cerrar menú de navegación');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);
  }

  const closeBtn = drawerHeader.querySelector('.nav-drawer-close');

  const setMenuState = (isOpen, restoreFocus = false) => {
    navMenu.classList.toggle('mobile-open', isOpen);
    document.body.classList.toggle('nav-drawer-open', isOpen && compactNavigation.matches);
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    toggleBtn.setAttribute('aria-label', isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
    backdrop.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    if (compactNavigation.matches) navMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    else navMenu.removeAttribute('aria-hidden');
    if (isOpen) window.requestAnimationFrame(() => closeBtn?.focus());
    else if (restoreFocus) toggleBtn.focus();
  };

  const toggleMenu = () => {
    setMenuState(!navMenu.classList.contains('mobile-open'));
  };

  const closeMenu = (restoreFocus = false) => {
    if (navMenu.classList.contains('mobile-open')) setMenuState(false, restoreFocus);
  };

  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });

  closeBtn?.addEventListener('click', () => closeMenu(true));
  backdrop.addEventListener('click', () => closeMenu(true));

  // Cerrar al hacer clic en cualquier enlace
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => closeMenu());
  });

  // Cerrar al hacer clic fuera del menú o presionar la tecla Escape
  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu(true);
  });

  compactNavigation.addEventListener?.('change', () => setMenuState(false));
  setMenuState(false);
}

/**
 * Identifica la página activa actual y le asigna la clase .active.
 */
function initActiveNavHighlight() {
  const currentPath = window.location.pathname;
  const pageName = currentPath.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links-menu a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPage = href.split('/').pop().split('#')[0];

    if (linkPage === pageName || (pageName === '' && linkPage === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// ============================================================================
// 🧭 CENTRO DE AUXILIO SOS Y GEOLOCALIZACIÓN SATELITAL EN VIVO
// ============================================================================
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer auxilio inmediato en senderos de Nicaragua con geolocalización satelital
//   precisa en cualquier dispositivo, garantizando que las coordenadas sean 100%
//   compatibles con Google Maps, Waze, Policía Nacional y Cruz Blanca sin errores de búsqueda.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Invoca navigator.geolocation con enableHighAccuracy: true para activar sensores GPS
//   reales en teléfonos móviles y ordenadores (evitando aproximaciones erradas por IP).
// - Formatea las coordenadas como números decimales puros ("LAT, LON") sin prefijos "Lat:"
//   ni símbolos "°" que provocan fallos de "No se han encontrado resultados" en Google Maps.
// - Genera enlace universal directo (https://www.google.com/maps?q=lat,lon) e inyecta
//   el botón interactivo para abrir Google Maps con un solo clic.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - initSosModal(): Gestiona ciclo de vida del modal SOS, lectura GPS, copia limpia
//   al portapapeles, despacho a WhatsApp y navegación directa satelital.
// ============================================================================
let currentGpsData = null;

function initSosModal() {
  const openBtns = document.querySelectorAll('.open-sos-btn, #openSosModalBtn');
  const modal = document.getElementById('sosModal');
  const closeBtn = document.getElementById('closeSosModalBtn');
  const gpsDisplay = document.getElementById('sosGpsDisplay');
  const btnSendWa = document.getElementById('btnSendWhatsAppSos');
  const btnCopyGps = document.getElementById('btnCopyGpsSos');

  if (!modal) return;

  const fetchGps = () => {
    if (navigator.geolocation) {
      if (gpsDisplay) {
        gpsDisplay.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #2DD4BF; font-size: 0.85rem; padding: 6px 0;">
            <i class="fa-solid fa-satellite fa-spin"></i> Conectando con satélites GPS en tiempo real...
          </div>
        `;
      }

      navigator.geolocation.getCurrentPosition(
        pos => {
          const lat = pos.coords.latitude.toFixed(6);
          const lon = pos.coords.longitude.toFixed(6);
          const accuracy = Math.round(pos.coords.accuracy || 0);
          const mapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
          
          currentGpsCoords = `${lat}, ${lon}`;
          currentGpsData = { lat, lon, accuracy, mapsUrl };

          if (gpsDisplay) {
            gpsDisplay.innerHTML = `
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 4px 0;">
                <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 8px; padding: 6px 14px;">
                  <i class="fa-solid fa-satellite" style="color: #10B981; font-size: 1.1rem;"></i>
                  <span id="sosGpsValue" style="color: #FFFFFF; font-family: monospace; font-size: 1.15rem; font-weight: 800; user-select: all; cursor: text;" title="Doble clic para seleccionar">${lat}, ${lon}</span>
                </div>
                <div style="font-size: 0.72rem; color: #2DD4BF; font-weight: 500; margin-top: 2px;">
                  <i class="fa-solid fa-bullseye"></i> Margen GPS: ±${accuracy}m · Formato universal para Google Maps
                </div>
              </div>
            `;
          }

          // Garantizar botón directo "Abrir en Google Maps"
          let btnOpenMaps = document.getElementById('btnOpenGoogleMapsSos');
          if (!btnOpenMaps && btnCopyGps && btnCopyGps.parentNode) {
            btnOpenMaps = document.createElement('a');
            btnOpenMaps.id = 'btnOpenGoogleMapsSos';
            btnOpenMaps.className = 'btn-hero-glass';
            btnOpenMaps.target = '_blank';
            btnOpenMaps.rel = 'noopener noreferrer';
            btnOpenMaps.style.cssText = 'display: inline-flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; width: 100%; border-color: rgba(45, 212, 191, 0.5); color: #2DD4BF; margin-top: 6px; padding: 10px 16px; border-radius: 12px; font-weight: 700; font-size: 0.86rem;';
            btnOpenMaps.innerHTML = '<i class="fa-solid fa-map-location-dot"></i> Ver mi ubicación exacta en Google Maps';
            btnCopyGps.parentNode.appendChild(btnOpenMaps);
          }
          if (btnOpenMaps) {
            btnOpenMaps.href = mapsUrl;
            btnOpenMaps.style.display = 'inline-flex';
          }
        },
        err => {
          console.warn("Aviso GPS:", err.message);
          currentGpsData = null;
          currentGpsCoords = "Permiso de ubicación pendiente";
          if (gpsDisplay) {
            gpsDisplay.innerHTML = `
              <div style="color: #F65E01; font-size: 0.8rem; line-height: 1.35; padding: 4px;">
                <i class="fa-solid fa-triangle-exclamation" style="margin-right: 4px;"></i>
                Por favor activa el GPS o concede permiso de ubicación al navegador para geolocalizar tu auxilio.
              </div>
            `;
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      currentGpsData = null;
      currentGpsCoords = "Geolocalización no soportada por el navegador";
      if (gpsDisplay) gpsDisplay.textContent = currentGpsCoords;
    }
  };

  const openModal = e => {
    if (e) e.preventDefault();
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    fetchGps();

    if (typeof window.logFirebaseEvent === 'function' && window.firebaseAnalytics) {
      window.logFirebaseEvent(window.firebaseAnalytics, 'open_sos_center');
    }
  };

  const closeModal = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  openBtns.forEach(btn => btn.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  if (btnSendWa) {
    btnSendWa.addEventListener('click', () => {
      let sosMsg;
      if (currentGpsData) {
        sosMsg = `🚨 *¡AUXILIO SOS EN SENDERO - BAQUEANO!* 🚨\nRequiero asistencia urgente en territorio nicaragüense.\n\n📍 *Coordenadas GPS:* ${currentGpsData.lat}, ${currentGpsData.lon}\n🎯 *Precisión satelital:* ±${currentGpsData.accuracy} metros\n🗺️ *Ver ubicación directa en Google Maps:* ${currentGpsData.mapsUrl}\n\n_Emitido desde el Centro de Auxilio Baqueano SOS_`;
      } else {
        sosMsg = `🚨 *¡AUXILIO SOS EN SENDERO - BAQUEANO!* 🚨\nRequiero asistencia urgente en territorio nicaragüense. Mi dispositivo no compartió coordenadas satelitales automáticas.\n\n_Emitido desde el Centro de Auxilio Baqueano SOS_`;
      }
      const waUrl = `https://api.whatsapp.com/send?phone=50584431289&text=${encodeURIComponent(sosMsg)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }

  if (btnCopyGps) {
    btnCopyGps.addEventListener('click', async () => {
      if (!currentGpsData && (!currentGpsCoords || currentGpsCoords.includes('no') || currentGpsCoords.includes('pendiente'))) {
        alert("Primero concede acceso a la ubicación GPS para capturar las coordenadas exactas.");
        return;
      }
      const textToCopy = currentGpsData ? `${currentGpsData.lat}, ${currentGpsData.lon}` : currentGpsCoords;
      try {
        await navigator.clipboard.writeText(textToCopy);
        const originalHtml = btnCopyGps.innerHTML;
        btnCopyGps.innerHTML = `<i class="fa-solid fa-check" style="color: #10B981;"></i> ¡Copiado para Google Maps! (${textToCopy})`;
        btnCopyGps.style.background = '#165D6F';
        btnCopyGps.style.color = '#FFFFFF';

        setTimeout(() => {
          btnCopyGps.innerHTML = originalHtml;
          btnCopyGps.style.background = '';
          btnCopyGps.style.color = '';
        }, 3000);
      } catch (e) {
        prompt("Copia tus coordenadas para Google Maps:", textToCopy);
      }
    });
  }
}

function initDownloadModal() {
  const modal = document.getElementById('downloadModal');
  document.querySelectorAll('a[href$=".apk"], [download$=".apk"], .open-download-modal-btn').forEach((control) => {
    control.remove();
  });
  if (modal) modal.remove();
}

async function initAndroidReleaseDownload(retryCount = 0) {
  const container = document.querySelector('.app-download-actions, .download-cta-double');
  if (!container) return;
  if (!window.firebase || !window.firebase.firestore) {
    if (retryCount < 3) setTimeout(() => initAndroidReleaseDownload(retryCount + 1), 1000);
    return;
  }
  try {
    const snapshot = await window.firebase.firestore().collection('app_config').doc('android_release').get();
    const release = snapshot.exists ? snapshot.data() : null;
    if (!release?.published || !release.downloadUrl) return;
    const link = document.createElement('a');
    link.href = release.downloadUrl;
    link.className = container.classList.contains('app-download-actions') ? 'app-download-btn-primary' : 'btn-hero-primary';
    link.rel = 'noopener noreferrer';
    link.referrerPolicy = 'no-referrer';
    if (release.storageProvider !== 'google_drive') link.setAttribute('download', release.fileName || 'baqueanonicaragua.apk');
    link.innerHTML = '<i class="fa-solid fa-download"></i> Descargar aplicación Android';
    container.prepend(link);
    const versionLabel = document.querySelector('.app-spec-item:first-child .app-spec-val');
    if (versionLabel && release.version) versionLabel.textContent = `v${release.version}${release.channel === 'beta' ? ' (Beta)' : ''}`;
  } catch (error) {
    console.warn('[AndroidRelease] No se pudo consultar la versión pública:', error.message);
  }
}

function initShareTools() {
  const waBtn = document.getElementById('shareWhatsAppBtn');
  const copyBtn = document.getElementById('copyLinkBtn');

  const shareMsg = "¡Descubre Baqueano Nicaragua! Plataforma oficial para turismo responsable, conservación y ecoturismo campesino sin intermediarios: ";
  const currentUrl = window.location.href;

  if (waBtn) {
    waBtn.addEventListener('click', () => {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMsg + currentUrl)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(currentUrl);
        const prev = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> ¡Enlace Copiado!';
        copyBtn.style.background = 'var(--petroleo-teal)';
        copyBtn.style.color = '#FFFFFF';

        setTimeout(() => {
          copyBtn.innerHTML = prev;
          copyBtn.style.background = '';
          copyBtn.style.color = '';
        }, 2000);
      } catch (e) {
        alert("Enlace oficial: " + currentUrl);
      }
    });
  }
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || this.classList.contains('open-download-modal-btn') || this.classList.contains('open-sos-btn')) return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const offset = 80;
        const pos = targetEl.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: pos, behavior: 'smooth' });
      }
    });
  });
}

window.toggleFavoriteReal = async function(placeId, btnElement) {
  try {
    const auth = window.firebase && window.firebase.auth ? window.firebase.auth() : null;
    const user = auth ? auth.currentUser : null;
    const icon = btnElement ? btnElement.querySelector('i') : null;

    if (!user) {
      const local = JSON.parse(localStorage.getItem('baqueano_favs') || '[]');
      if (local.includes(placeId)) {
        const next = local.filter(id => id !== placeId);
        localStorage.setItem('baqueano_favs', JSON.stringify(next));
        if (icon) { icon.className = 'fa-regular fa-heart'; icon.style.color = ''; }
        alert('Destino removido de tus favoritos locales.');
      } else {
        local.push(placeId);
        localStorage.setItem('baqueano_favs', JSON.stringify(local));
        if (icon) { icon.className = 'fa-solid fa-heart'; icon.style.color = '#EF4444'; }
        alert('Destino guardado en favoritos. (Inicia sesión para sincronizarlo con tu perfil en la nube).');
      }
      return;
    }

    const db = window.firebase.firestore();
    const savedId = `${user.uid}_${placeId}`;
    const docRef = db.collection('user_saved_places').doc(savedId);
    const snap = await docRef.get();

    if (snap.exists) {
      await docRef.delete();
      if (icon) { icon.className = 'fa-regular fa-heart'; icon.style.color = ''; }
      alert('Removido de tus favoritos en Cloud Firestore.');
    } else {
      await docRef.set({
        userId: user.uid,
        placeId: placeId,
        savedAt: new Date().toISOString()
      });
      if (icon) { icon.className = 'fa-solid fa-heart'; icon.style.color = '#EF4444'; }
      alert('¡Destino guardado en tu perfil de Cloud Firestore!');
    }
  } catch(err) {
    console.error('Error al gestionar favorito:', err);
  }
};

/**
 * 🧭 Buscador Rápido Desplegable en el Menú Superior
 * POR QUÉ: Permite buscar destinos y atractivos desde la lupa del menú sin estorbar en el contenido central.
 * CÓMO: Abre un dropdown glassmorphic anclado a la lupa del navbar con autofocus, control ARIA y cierre con Escape/click outside.
 * QUÉ: Alternancia de visibilidad, autofocus automático y enlaces rápidos a categorías.
 */
function initNavbarQuickSearch() {
  const searchWrap = document.getElementById('navSearchWrap');
  const searchBtn = document.getElementById('navSearchBtn');
  const dropdown = document.getElementById('navSearchDropdown');
  const searchInput = document.getElementById('navSearchInput');
  const closeBtn = document.getElementById('navSearchCloseBtn');

  if (!searchBtn || !dropdown) return;

  function openDropdown() {
    dropdown.classList.add('is-open');
    dropdown.removeAttribute('hidden');
    dropdown.setAttribute('aria-hidden', 'false');
    searchBtn.setAttribute('aria-expanded', 'true');
    searchBtn.classList.add('active');
    setTimeout(() => {
      if (searchInput) searchInput.focus();
    }, 80);
  }

  function closeDropdown() {
    dropdown.classList.remove('is-open');
    dropdown.setAttribute('aria-hidden', 'true');
    searchBtn.setAttribute('aria-expanded', 'false');
    searchBtn.classList.remove('active');
  }

  searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isOpen = dropdown.classList.contains('is-open');
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDropdown();
      searchBtn.focus();
    });
  }

  // Prevenir que clics dentro del dropdown lo cierren
  dropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Cerrar al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (searchWrap && !searchWrap.contains(e.target)) {
      closeDropdown();
    }
  });

  // Cerrar con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dropdown.classList.contains('is-open')) {
      closeDropdown();
      searchBtn.focus();
    }
  });
}

/**
 * 🎯 POR QUÉ: impedir que las páginas públicas mantengan versiones distintas del
 * pie institucional y asegurar que index.html sea la referencia visual del portal.
 * ⚙️ CÓMO: sustituye el contenido de cualquier .site-footer-pro por una sola
 * plantilla compartida antes de activar telemetría y microinteracciones.
 * 📦 QUÉ: contacto oficial, enlaces legales, derechos y estado territorial.
 */
function normalizeInstitutionalFooter() {
  const footer = document.querySelector('.site-footer-pro');
  if (!footer) return;

  footer.innerHTML = `
    <div class="container">
      <div class="footer-columns-grid">
        <div class="footer-col-contact">
          <h4 class="footer-col-header">INFORMACIÓN OFICIAL</h4>
          <ul class="footer-contact-list">
            <li class="footer-contact-item">
              <i class="fa-solid fa-envelope" aria-hidden="true"></i>
              <div><span>Correo Oficial:</span><br><a href="mailto:contacto@baqueano.ni">contacto@baqueano.ni</a></div>
            </li>
            <li class="footer-contact-item">
              <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
              <div><span>Mesa de Enlace:</span><br><a href="https://wa.me/50584431289" target="_blank" rel="noopener noreferrer">+505 8443-1289</a></div>
            </li>
            <li class="footer-contact-item">
              <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
              <div><span>Sede Territorial:</span><br><span>Managua · 17 Territorios de Nicaragua</span></div>
            </li>
          </ul>
        </div>
      </div>

      <div class="footer-legal-stack">
        <a href="terminos.html">Términos &amp; Condiciones</a><span class="separator" aria-hidden="true">|</span>
        <a href="privacidad.html">Política de Privacidad</a><span class="separator" aria-hidden="true">|</span>
        <a href="aviso-legal.html">Aviso Legal</a><span class="separator" aria-hidden="true">|</span>
        <a href="cookies.html">Política de Cookies</a><span class="separator" aria-hidden="true">|</span>
        <a href="ambiental.html">Decálogo Verde &amp; Huella Cero</a><span class="separator" aria-hidden="true">|</span>
        <a href="denuncias.html">Canal Ético Ambiental</a><span class="separator" aria-hidden="true">|</span>
        <a href="admin.html">Baqueano Ops Center</a>
      </div>

      <div class="footer-bottom-bar">
        <div>© 2026 Baqueano Nicaragua. Catálogo Oficial de Áreas Protegidas y Turismo Comunitario. Todos los derechos reservados.</div>
        
      </div>
    </div>`;

  footer.dataset.canonicalFooter = 'true';
}

/**
 * Inicializa la telemetría en vivo, seguidor de luz ambiental y micro-interacciones del footer táctico futurista.
 */
function initDynamicFooter() {
  const footer = document.querySelector('.site-footer-pro');
  if (!footer) return;

  // 1. Inyectar rayo láser de escaneo si no existe
  if (!footer.querySelector('.footer-laser-scan')) {
    const laser = document.createElement('div');
    laser.className = 'footer-laser-scan';
    laser.setAttribute('aria-hidden', 'true');
    footer.prepend(laser);
  }

  // 2. Inyectar cinta HUD de telemetría si no existe
  if (!footer.querySelector('.footer-telemetry-hud')) {
    const container = footer.querySelector('.container');
    if (container) {
      const hudStrip = document.createElement('div');
      hudStrip.className = 'footer-telemetry-hud';
      hudStrip.innerHTML = `
        <div class="hud-stat-item">
          <span class="hud-beacon-led"></span>
          <span class="hud-label">NODO CENTRAL:</span>
          <strong class="hud-val">NICARAGUA SOBERANA</strong>
        </div>
        <div class="hud-stat-item">
          <i class="fa-solid fa-satellite" style="color: var(--petroleo-glow);"></i>
          <span class="hud-label">TELEMETRÍA GPS:</span>
          <strong class="hud-val">12.1364° N, 86.2514° O</strong>
        </div>
        <div class="hud-stat-item">
          <i class="fa-solid fa-shield-halved" style="color: var(--terracotta-light);"></i>
          <span class="hud-label">SEGURIDAD:</span>
          <strong class="hud-val">AES-GCM 256-BIT</strong>
        </div>
        <div class="hud-stat-item">
          <i class="fa-regular fa-clock" style="color: var(--arena-pinolera);"></i>
          <span class="hud-label">HORA LOCAL CST:</span>
          <strong class="hud-val" id="footerLiveClock">--:--:--</strong>
        </div>
      `;
      container.insertBefore(hudStrip, container.firstChild);
    }
  }

  // 3. Reloj en vivo de Nicaragua (CST UTC-6)
  const clockEl = document.getElementById('footerLiveClock');
  const updateClock = () => {
    if (clockEl) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('es-NI', { 
        timeZone: 'America/Managua',
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      clockEl.textContent = `${timeStr} (UTC-6)`;
    }
  };
  updateClock();
  setInterval(updateClock, 1000);

  // 4. Luz ambiental reactiva en el footer
  footer.addEventListener('mousemove', (e) => {
    const rect = footer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    footer.style.setProperty('--footer-mouse-x', `${x}px`);
    footer.style.setProperty('--footer-mouse-y', `${y}px`);
  }, { passive: true });

  // 5. Interactividad táctica en las líneas de emergencia
  const emergencyItems = footer.querySelectorAll('.emergency-line-item');
  emergencyItems.forEach(item => {
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('title', 'Tocar para activar asistencia directa');
    
    const strong = item.querySelector('strong');
    const phoneNum = strong ? strong.textContent.replace(/[^0-9+]/g, '') : '';
    
    const triggerContact = () => {
      if (!phoneNum) return;
      if (phoneNum.startsWith('+505') || phoneNum.length > 4) {
        const cleanWa = phoneNum.replace('+', '');
        window.open(`https://api.whatsapp.com/send?phone=${cleanWa}&text=${encodeURIComponent('🚨 Auxilio Baqueano SOS: Solicitud de asistencia directa.')}`, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = `tel:${phoneNum}`;
      }
    };

    item.addEventListener('click', triggerContact);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerContact();
      }
    });
  });
}

/**
 * POR QUÉ: reunir identidad institucional y documentos legales sin saturar la barra principal.
 * CÓMO: transforma el enlace Nosotros existente en un desplegable accesible antes de iniciar controles.
 * QUÉ: acceso a Nosotros, Términos, Privacidad, Aviso Legal y Cookies en todas las páginas.
 */
function buildAboutDropdown() {
  const navMenu = document.getElementById('navLinksMenu');
  if (!navMenu || navMenu.querySelector('#navDropdownAbout')) return;

  const aboutLink = Array.from(navMenu.children).find((item) =>
    item.matches?.('a[href="nosotros.html"], a[href$="/nosotros.html"]')
  );
  if (!aboutLink) return;

  const dropdown = document.createElement('div');
  dropdown.className = 'nav-dropdown nav-dropdown-about';
  dropdown.id = 'navDropdownAbout';
  dropdown.setAttribute('role', 'none');
  dropdown.innerHTML = `
    <button class="nav-dropdown-trigger" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="megaMenuAbout" role="menuitem">
      <span class="nav-item-content"><span class="nav-icon-box"><i class="fa-solid fa-people-roof nav-icon"></i></span><span class="nav-text-group"><span class="nav-label">Nosotros</span></span></span>
      <span class="nav-dropdown-caret"><i class="fa-solid fa-chevron-down"></i></span>
    </button>
    <div class="nav-dropdown-menu" id="megaMenuAbout" role="menu">
      <div class="mega-menu-header" aria-hidden="true"><span class="mega-menu-header-icon"><i class="fa-solid fa-scale-balanced"></i></span><span class="mega-menu-header-title">Institución & Transparencia</span><span class="mega-menu-header-line"></span></div>
      <a href="nosotros.html" class="nav-dropdown-item" role="menuitem"><span class="nav-dd-icon-box"><i class="fa-solid fa-people-group"></i></span><span class="nav-dd-text"><span class="nav-dd-title">Quiénes Somos</span><span class="nav-dd-desc">Marca, propósito y manifiesto</span></span></a>
      <a href="terminos.html" class="nav-dropdown-item" role="menuitem"><span class="nav-dd-icon-box"><i class="fa-solid fa-file-signature"></i></span><span class="nav-dd-text"><span class="nav-dd-title">Términos y Condiciones</span><span class="nav-dd-desc">Reglas de uso de la plataforma</span></span></a>
      <a href="privacidad.html" class="nav-dropdown-item" role="menuitem"><span class="nav-dd-icon-box"><i class="fa-solid fa-shield-halved"></i></span><span class="nav-dd-text"><span class="nav-dd-title">Política de Privacidad</span><span class="nav-dd-desc">Protección y tratamiento de datos</span></span></a>
      <a href="aviso-legal.html" class="nav-dropdown-item" role="menuitem"><span class="nav-dd-icon-box"><i class="fa-solid fa-gavel"></i></span><span class="nav-dd-text"><span class="nav-dd-title">Aviso Legal</span><span class="nav-dd-desc">Responsabilidad y marco institucional</span></span></a>
      <a href="cookies.html" class="nav-dropdown-item" role="menuitem"><span class="nav-dd-icon-box"><i class="fa-solid fa-cookie-bite"></i></span><span class="nav-dd-text"><span class="nav-dd-title">Política de Cookies</span><span class="nav-dd-desc">Preferencias y tecnologías utilizadas</span></span></a>
    </div>`;

  aboutLink.replaceWith(dropdown);
}
/**
 * Control interactivo del submenú desplegable "Mi País"
 */
function initDropdownMiPais() {
  const dropdowns = Array.from(document.querySelectorAll('.nav-dropdown'));
  if (dropdowns.length === 0) return;

  const closeDropdown = (dropdown, returnFocus = false) => {
    const trigger = dropdown.querySelector('.nav-dropdown-trigger');
    dropdown.classList.remove('is-open');
    trigger?.setAttribute('aria-expanded', 'false');
    if (returnFocus) trigger?.focus();
  };

  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector('.nav-dropdown-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const willOpen = !dropdown.classList.contains('is-open');
      dropdowns.forEach((item) => closeDropdown(item));
      dropdown.classList.toggle('is-open', willOpen);
      trigger.setAttribute('aria-expanded', String(willOpen));
    });
  });

  document.addEventListener('click', (event) => {
    dropdowns.forEach((dropdown) => {
      if (!dropdown.contains(event.target)) closeDropdown(dropdown);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    dropdowns.forEach((dropdown) => {
      if (dropdown.classList.contains('is-open')) closeDropdown(dropdown, true);
    });
  });
}
/**
 * Asegura la carga reactiva del módulo de sesión de usuario (user-session.js)
 * para adaptar el enlace del Navbar entre "Ops Center" (Admin/Auditor) y "Perfil" (Explorador).
 */
function ensureUserSessionLoaded() {
  if (!window.BaqueanoSession) {
    const script = document.createElement('script');
    script.src = 'js/user-session.js';
    document.head.appendChild(script);
  }
}

/**
 * Asegura la carga reactiva del selector dinámico de temas y paletas (theme-switcher.js)
 */
function ensureThemeSwitcherLoaded() {
  if (!window.BaqueanoThemeManager && !document.getElementById('baqueanoThemeSwitcherScript')) {
    const script = document.createElement('script');
    script.id = 'baqueanoThemeSwitcherScript';
    script.src = 'js/theme-switcher.js?v=20260926-global-theme-1';
    document.head.appendChild(script);
  }
}

/**
 * POR QUE: los controles con solo iconos o placeholders necesitan un nombre
 * accesible para lectores de pantalla y navegacion asistida.
 * COMO: conserva etiquetas HTML existentes y completa un aria-label defensivo
 * usando title, placeholder, name o un identificador humanizado.
 * QUE: normaliza botones, campos y selectores publicos sin cambiar su diseno.
 */
function ensureAccessibleControlNames(root = document) {
  root.querySelectorAll('button, input:not([type="hidden"]), select, textarea').forEach((control) => {
    if (control.getAttribute('aria-hidden') === 'true') return;
    if (control.getAttribute('aria-label') || control.getAttribute('aria-labelledby')) return;
    if (control.closest('label')) return;
    if (control.id && document.querySelector(`label[for="${CSS.escape(control.id)}"]`)) return;

    const rawName = control.getAttribute('title')
      || control.getAttribute('placeholder')
      || control.getAttribute('name')
      || control.id;
    if (!rawName) return;

    const accessibleName = rawName
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (accessibleName) control.setAttribute('aria-label', accessibleName);
  });
}

/**
 * Inicializa el acordeón desplegable y la interactividad del registro de negocios en el footer.
 */
function initFooterBizRegister() {
  if (window.__bizRegisterInitialized) return;
  const toggleBtn = document.getElementById('btnToggleBizForm');
  const formCollapse = document.getElementById('bizFormCollapse');
  const closeBtnTop = document.getElementById('btnCloseBizFormTop');
  const form = document.getElementById('registerBusinessForm');

  if (!toggleBtn && !formCollapse) return;
  window.__bizRegisterInitialized = true;

  function openBizForm(shouldScroll = true) {
    if (!formCollapse) return;
    formCollapse.classList.add('is-expanded');
    formCollapse.setAttribute('aria-hidden', 'false');
    if (toggleBtn) {
      toggleBtn.classList.add('is-open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      const textSpan = toggleBtn.querySelector('.btn-text');
      if (textSpan) {
        textSpan.innerHTML = '<i class="fa-solid fa-chevron-up"></i> Ocultar Formulario de Postulación';
      }
    }
    if (shouldScroll) {
      setTimeout(() => {
        formCollapse.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const firstInput = document.getElementById('bizName');
        if (firstInput) firstInput.focus();
      }, 180);
    }
  }

  function closeBizForm() {
    if (!formCollapse) return;
    formCollapse.classList.remove('is-expanded');
    formCollapse.setAttribute('aria-hidden', 'true');
    if (toggleBtn) {
      toggleBtn.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      const textSpan = toggleBtn.querySelector('.btn-text');
      if (textSpan) {
        textSpan.innerHTML = '<i class="fa-brands fa-whatsapp"></i> Postular Negocio a Mesa Baqueano';
      }
    }
  }

  function toggleBizForm() {
    if (formCollapse && formCollapse.classList.contains('is-expanded')) {
      closeBizForm();
    } else {
      openBizForm(true);
    }
  }

  if (toggleBtn) toggleBtn.addEventListener('click', toggleBizForm);
  if (closeBtnTop) closeBtnTop.addEventListener('click', closeBizForm);

  // Abrir también al hacer clic en títulos o tags del banner
  const bizTitles = document.querySelectorAll('.footer-biz-title, .footer-biz-tag');
  bizTitles.forEach(el => {
    if (el) {
      el.style.cursor = 'pointer';
      el.title = 'Haz clic para desplegar el formulario de postulación';
      el.addEventListener('click', () => {
        if (formCollapse && !formCollapse.classList.contains('is-expanded')) {
          openBizForm(true);
        }
      });
    }
  });

  // Enlace en Módulos Web del footer
  const footerLinks = document.querySelectorAll('#footerLinkRegBiz, a[href="#registroNegocios"]');
  footerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openBizForm(true);
    });
  });

  // Abrir automáticamente si la URL contiene el hash #registroNegocios
  if (window.location.hash === '#registroNegocios') {
    setTimeout(() => openBizForm(true), 250);
  }
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#registroNegocios') {
      openBizForm(true);
    }
  });

  // Contador reactivo de caracteres
  const descInput = document.getElementById('bizDescription');
  const charCounter = document.getElementById('bizCharCounter');
  if (descInput && charCounter) {
    descInput.addEventListener('input', function() {
      charCounter.textContent = `${this.value.length} / 300`;
    });
  }

  // Manejo de archivo y preview de imagen
  const photoInput = document.getElementById('bizPhoto');
  const previewBox = document.getElementById('bizPhotoPreview');
  const previewImg = document.getElementById('bizPreviewImg');
  const placeholder = document.getElementById('bizUploadPlaceholder');
  const btnRemovePhoto = document.getElementById('bizBtnRemovePhoto');

  if (photoInput && previewBox && previewImg) {
    photoInput.addEventListener('change', function(e) {
      const file = e.target.files && e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert('La fotografía debe ser menor a 5MB.');
          photoInput.value = '';
          return;
        }
        const reader = new FileReader();
        reader.onload = function(evt) {
          previewImg.src = evt.target.result;
          if (placeholder) placeholder.style.display = 'none';
          previewBox.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });

    if (btnRemovePhoto) {
      btnRemovePhoto.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        photoInput.value = '';
        previewImg.src = '';
        previewBox.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
      });
    }
  }

  // Envío del Formulario
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      form.querySelectorAll('.biz-error-msg').forEach(el => el.textContent = '');
      form.querySelectorAll('.biz-input, .biz-select, .biz-textarea').forEach(el => el.classList.remove('has-error'));

      let isValid = true;
      function markError(fieldId, msg) {
        const field = document.getElementById(fieldId);
        const err = document.getElementById('err-' + fieldId);
        if (field) field.classList.add('has-error');
        if (err) err.textContent = msg;
        if (isValid && field) field.focus();
        isValid = false;
      }

      const name = document.getElementById('bizName')?.value.trim() || '';
      const type = document.getElementById('bizType')?.value || '';
      const owner = document.getElementById('bizOwner')?.value.trim() || '';
      const category = document.getElementById('bizCategory')?.value || '';
      const department = document.getElementById('bizDepartment')?.value || '';
      const municipality = document.getElementById('bizMunicipality')?.value.trim() || '';
      const address = document.getElementById('bizAddress')?.value.trim() || '';
      const phone = document.getElementById('bizPhone')?.value.trim() || '';
      const whatsapp = document.getElementById('bizWhatsapp')?.value.trim() || '';
      const email = document.getElementById('bizEmail')?.value.trim() || '';
      const website = document.getElementById('bizWebsite')?.value.trim() || '';
      const price = document.getElementById('bizPrice')?.value.trim() || '';
      const schedule = document.getElementById('bizSchedule')?.value.trim() || '';
      const description = descInput ? descInput.value.trim() : '';
      const terms = document.getElementById('bizTerms')?.checked;

      if (!name) markError('bizName', 'Por favor ingresa el nombre del negocio');
      if (!type) markError('bizType', 'Selecciona el tipo de negocio');
      if (!owner) markError('bizOwner', 'Ingresa el nombre del propietario o responsable');
      if (!category) markError('bizCategory', 'Selecciona la categoría Baqueano');
      if (!department) markError('bizDepartment', 'Selecciona el departamento');
      if (!municipality) markError('bizMunicipality', 'Ingresa el municipio');
      if (!address) markError('bizAddress', 'Indica la dirección o referencia exacta');
      if (!phone) markError('bizPhone', 'Ingresa un teléfono principal de contacto');
      if (!description) markError('bizDescription', 'Escribe una breve descripción del servicio');
      if (!terms) markError('bizTerms', 'Debes aceptar los términos de turismo justo');

      if (!isValid) return;

      const submitBtn = document.getElementById('btnSubmitBiz');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registrando en Mesa Baqueano...';
      }

      const payload = {
        name, businessType: type, owner, category, department, municipality,
        address, phone, whatsapp: whatsapp || phone, email, website, price,
        schedule, description, status: 'pendiente_auditoria', createdAt: new Date().toISOString()
      };

      // Guardar en Firestore si está disponible
      try {
        if (window.firebase && firebase.firestore) {
          await firebase.firestore().collection('registro_negocios').add(payload);
        }
      } catch (err) {
        console.warn('[Baqueano Biz] Nota al guardar en Firestore:', err);
      }

      // Preparar mensaje de WhatsApp oficial (+505 8443-1289)
      const waMsg = `🇳🇮 *NUEVA POSTULACIÓN DE NEGOCIO — BAQUEANO NICARAGUA*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🏪 *Negocio:* ${name}\n` +
        `📌 *Tipo:* ${type}\n` +
        `👤 *Propietario:* ${owner}\n` +
        `📍 *Ubicación:* ${municipality}, ${department}\n` +
        `🧭 *Dirección:* ${address}\n` +
        `📞 *Teléfono:* ${phone}\n` +
        `💬 *WhatsApp:* ${whatsapp || phone}\n` +
        `💰 *Precio estimado:* C$ ${price || 'N/D'}\n` +
        `📝 *Descripción:* ${description}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `_Solicito incorporación a la Mesa Técnica y Catálogo Baqueano._`;

      const cleanWa = '50584431289';
      const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(waMsg)}`;

      alert(`¡Gracias ${owner}! Tu negocio "${name}" ha sido postulado exitosamente. Se abrirá el WhatsApp oficial de la Mesa Baqueano (+505 8443-1289) para finalizar la verificación territorial.`);
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      form.reset();
      if (previewBox) previewBox.style.display = 'none';
      if (placeholder) placeholder.style.display = 'flex';
      if (charCounter) charCounter.textContent = '0 / 300';
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
      closeBizForm();
    });
  }
}

// Auto-inicialización completa y defensiva para páginas directas.

  // Delegación global infalible para el botón hamburguesa móvil
  document.addEventListener('click', (e) => {
    const burger = e.target.closest('#mobileNavToggle, .mobile-nav-toggle');
    if (burger) {
      e.preventDefault();
      e.stopPropagation();
      const menu = document.getElementById('navLinksMenu');
      if (menu) {
        const willOpen = !menu.classList.contains('mobile-open');
        menu.classList.toggle('mobile-open', willOpen);
        document.body.classList.toggle('nav-drawer-open', willOpen);
        burger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        const bdrop = document.querySelector('.nav-drawer-backdrop');
        if (bdrop) bdrop.setAttribute('aria-hidden', willOpen ? 'false' : 'true');
      }
    }
  });

function initializeNavigationModules() {
  initRuntimeObservability();
  initPublicServiceWorker();
  ensureUserSessionLoaded();
  ensureThemeSwitcherLoaded();
  normalizeInstitutionalFooter();
  buildGlobalMegaNavigation();
  buildAboutDropdown();
  initBaqueanoAiNavLink();
  initNavbarScroll();
  initDynamicNavbar();
  initNavbarQuickSearch();
  initMobileMenu();
  initActiveNavHighlight();
  initDynamicDestinationCount();
  initSosModal();
  initDownloadModal();
  initAndroidReleaseDownload();
  initShareTools();
  initSmoothScroll();
  initDynamicFooter();
  initFooterBizRegister();
  initDropdownMiPais();
  loadBaqueanoDigital();
  ensureAccessibleControlNames();
}

// ============================================================================
// BAQUEANO DIGITAL — CARGA GLOBAL DIFERIDA
// 🎯 POR QUÉ: compartir un solo asistente en las páginas turísticas públicas.
// ⚙️ CÓMO: carga CSS/JS una vez y respeta rutas sensibles o institucionales.
// 📦 QUÉ: bootstrap liviano del componente global.
// ============================================================================
function loadBaqueanoDigital() {
  const excluded = /(?:admin|perfil|privacidad|terminos|cookies|aviso-legal|offline|denuncias)(?:\.html)?$/i;
  if (excluded.test(window.location.pathname.replace(/\/$/, ''))) return;
  if (!document.querySelector('link[data-baqueano-assistant]')) {
    const style = document.createElement('link');
    style.rel = 'stylesheet'; style.href = 'css/baqueano-assistant.css?v=20260925-baqui-6'; style.dataset.baqueanoAssistant = 'true';
    document.head.appendChild(style);
  }
  if (!document.querySelector('script[data-baqueano-assistant]') && !window.BaqueanoAssistant) {
    const script = document.createElement('script');
    script.src = 'js/baqueano-assistant.js?v=20260925-baqui-6'; script.defer = true; script.dataset.baqueanoAssistant = 'true';
    document.body.appendChild(script);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeNavigationModules, { once: true });
} else {
  initializeNavigationModules();
}
