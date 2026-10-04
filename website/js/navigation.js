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
// 🧭 MENÚ GLOBAL — FUENTE ÚNICA DE VERDAD
// 🎯 POR QUÉ: el propietario pide cinco grupos (Inicio, Explorar, Cultura,
//    Comunidad, Cuenta y plataforma), cada uno con su propio desplegable en
//    escritorio y en acordeón dentro del panel lateral en celular, sin perder
//    ninguna ruta existente (BAQUI, Mi Viaje, Crónicas y Aviso legal quedan
//    dentro de su grupo natural).
// ⚙️ CÓMO: estos datos generan el HTML de escritorio y de celular a la vez.
//    Cada texto lleva su clave `menu.*` (locales/*.json) para que
//    global-language.js lo traduzca. Formato de ítem:
//    [href, ícono, clave, texto, descripción, páginas extra que lo activan].
// 📦 QUÉ: cambiar el menú en este bloque lo cambia en las 28 páginas públicas.
//    El Ops Center (admin.html) conserva su propio menú.
// ============================================================================
const BQ_MENU_GROUPS = [
  {
    id: 'explore', key: 'explore', label: 'Explorar', icon: 'fa-solid fa-compass',
    sections: [
      { key: 'discover', label: 'Descubrí', items: [
        ['departamento.html', 'fa-regular fa-map', 'departments', 'Departamentos', 'Los 17 territorios de Nicaragua'],
        ['destinos.html', 'fa-solid fa-mountain-sun', 'destinations', 'Destinos', 'Volcanes, playas, reservas y ciudades', ['destino.html']],
        ['mapa.html', 'fa-solid fa-map-location-dot', 'map', 'Mapa', 'Ubicá lugares y servicios'],
        ['experiencias.html', 'fa-solid fa-person-hiking', 'experiences', 'Experiencias', 'Senderos, tours y vivencias comunitarias']
      ] },
      { key: 'plan', label: 'Planificá', items: [
        ['mi-viaje.html', 'fa-solid fa-route', 'trip', 'Mi Viaje', 'Días, presupuesto y paradas de tu ruta'],
        ['baqueano-ia.html', 'fa-solid fa-wand-magic-sparkles', 'baqui', 'BAQUI', 'Armá tu ruta y consultá el clima', ['baqueano-ai.html']]
      ] }
    ]
  },
  {
    id: 'culture', key: 'culture', label: 'Cultura', icon: 'fa-solid fa-landmark',
    sections: [
      { items: [
        ['historia.html', 'fa-regular fa-file-lines', 'history', 'Historia', 'Memoria, personajes y patrimonio'],
        ['gastronomia.html', 'fa-solid fa-utensils', 'gastronomy', 'Gastronomía', 'Platos, bebidas y tradiciones'],
        ['musica.html', 'fa-solid fa-music', 'music', 'Música', 'Archivo sonoro, artistas e instrumentos'],
        ['ambiental.html', 'fa-solid fa-leaf', 'environmental', 'Ambiental', 'Áreas protegidas y buenas prácticas'],
        ['cronicas.html', 'fa-regular fa-newspaper', 'chronicles', 'Crónicas', 'Relatos y reportajes de Nicaragua']
      ] }
    ]
  },
  {
    id: 'community', key: 'community', label: 'Comunidad', icon: 'fa-solid fa-people-group',
    sections: [
      { items: [
        ['aliados.html', 'fa-regular fa-handshake', 'allies', 'Aliados', 'Organizaciones que impulsan el turismo'],
        ['mi-negocio.html', 'fa-solid fa-shop', 'business', 'Mi Negocio', 'Registrá tu emprendimiento turístico'],
        ['testimonios.html', 'fa-regular fa-comments', 'testimonials', 'Testimonios', 'Experiencias reales de viajeros'],
        ['denuncias.html', 'fa-solid fa-shield-halved', 'complaints', 'Denuncia', 'Reporte confidencial ambiental']
      ] }
    ]
  },
  {
    id: 'account', key: 'account', shortKey: 'accountShort', label: 'Cuenta y plataforma', short: 'Cuenta',
    icon: 'fa-solid fa-user-gear', wide: true,
    sections: [
      { key: 'yourAccount', label: 'Tu cuenta', items: [
        ['perfil.html', 'fa-regular fa-user', 'profile', 'Perfil'],
        ['perfil.html#reservas', 'fa-regular fa-calendar-days', 'reservations', 'Reservas'],
        ['favoritos.html', 'fa-regular fa-heart', 'favorites', 'Favoritos']
      ] },
      { key: 'platform', label: 'Plataforma', items: [
        ['ayuda.html', 'fa-regular fa-circle-question', 'help', 'Ayuda'],
        ['nosotros.html', 'fa-solid fa-people-group', 'about', 'Nosotros'],
        ['terminos.html', 'fa-regular fa-file-lines', 'terms', 'Términos'],
        ['privacidad.html', 'fa-solid fa-user-shield', 'privacy', 'Privacidad'],
        ['cookies.html', 'fa-solid fa-cookie-bite', 'cookies', 'Cookies'],
        ['aviso-legal.html', 'fa-solid fa-scale-balanced', 'legalNotice', 'Aviso legal', '', ['legal.html']]
      ] }
    ]
  }
];

function bqMenuItemIsCurrent(href, extra, current) {
  const [file, hash] = href.split('#');
  if (hash) return file === current && window.location.hash === '#' + hash;
  return file === current || (Array.isArray(extra) && extra.includes(current));
}

function bqRenderGlobalMenu(current) {
  const esc = (value) => String(value).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const homeCurrent = current === 'index.html' || current === '';
  let html = `
      <div class="bq-drawer-head">
        <a href="index.html" class="bq-drawer-brand" aria-label="Baqueano Nicaragua — Inicio" data-i18n-aria-label="nav.brandAria">
          <img src="assets/images/LOGOS/baqueano_icono_500x386-blanco.png" alt="" width="500" height="386" decoding="async">
          <span><strong class="notranslate">BAQUEANO</strong><small>NICARAGUA AUTÉNTICA</small></span>
        </a>
        <button type="button" class="bq-drawer-close" data-bq-close-drawer aria-label="Cerrar menú de navegación" data-i18n-aria-label="menu.closeMenu"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
      </div>
      <a href="index.html" class="bq-menu-home exact-nav-link${homeCurrent ? ' active' : ''}"${homeCurrent ? ' aria-current="page"' : ''}>
        <i class="fa-solid fa-house bq-menu-trigger-icon" aria-hidden="true"></i><span data-i18n="menu.home">Inicio</span>
      </a>`;

  BQ_MENU_GROUPS.forEach((group) => {
    const groupCurrent = group.sections.some((s) => s.items.some((i) => bqMenuItemIsCurrent(i[0], i[5], current)));
    const triggerId = `bqMenuTrigger-${group.id}`;
    const panelId = `bqMenuPanel-${group.id}`;
    const label = group.short
      ? `<span class="bq-menu-label-full" data-i18n="menu.${group.key}">${esc(group.label)}</span><span class="bq-menu-label-short" data-i18n="menu.${group.shortKey}">${esc(group.short)}</span>`
      : `<span data-i18n="menu.${group.key}">${esc(group.label)}</span>`;
    html += `
      <div class="bq-menu-group${groupCurrent ? ' is-current' : ''}${group.wide ? ' is-wide' : ''}" data-group="${group.id}">
        <button type="button" class="bq-menu-trigger${groupCurrent ? ' active' : ''}" id="${triggerId}" aria-expanded="false" aria-controls="${panelId}">
          <i class="${group.icon} bq-menu-trigger-icon" aria-hidden="true"></i>${label}<i class="fa-solid fa-chevron-down bq-menu-caret" aria-hidden="true"></i>
        </button>
        <div class="bq-menu-panel" id="${panelId}" role="region" aria-labelledby="${triggerId}" hidden>`;
    group.sections.forEach((section) => {
      html += `
          <div class="bq-menu-section">${section.label ? `<p class="bq-menu-section-title" data-i18n="menu.${section.key}">${esc(section.label)}</p>` : ''}
            <ul class="bq-menu-list">`;
      section.items.forEach(([href, icon, key, text, desc, extra]) => {
        const isCurrent = bqMenuItemIsCurrent(href, extra, current);
        html += `
              <li><a class="bq-menu-item${isCurrent ? ' active' : ''}" href="${esc(href)}"${isCurrent ? ' aria-current="page"' : ''}>
                <span class="bq-menu-item-icon" aria-hidden="true"><i class="${icon}"></i></span>
                <span class="bq-menu-item-text"><strong data-i18n="menu.${key}">${esc(text)}</strong>${desc ? `<small data-i18n="menu.${key}Desc">${esc(desc)}</small>` : ''}</span>
              </a></li>`;
      });
      html += `
            </ul>
          </div>`;
    });
    if (group.id === 'account') {
      // Solo se muestra a admin/super_admin verificados en vivo (user-session.js);
      // admin.html vuelve a verificar el rol y las reglas protegen los datos.
      html += `
          <a class="bq-menu-item bq-menu-admin global-admin-link" href="admin.html" hidden aria-hidden="true" tabindex="-1">
            <span class="bq-menu-item-icon" aria-hidden="true"><i class="fa-solid fa-satellite-dish"></i></span>
            <span class="bq-menu-item-text"><strong data-i18n="menu.admin">Admin / Ops Center</strong><small data-i18n="menu.staffOnly">Solo personal</small></span>
          </a>`;
    }
    html += `
        </div>
      </div>`;
  });

  html += `
      <div class="bq-drawer-tools">
        <p class="bq-menu-section-title" data-i18n="menu.session">Tu sesión</p>
        <div class="bq-drawer-account" data-bq-account-drawer></div>
        <div class="bq-drawer-row">
          <button type="button" class="global-language navbar-lang-pill bq-drawer-lang" aria-label="Cambiar idioma"><i class="fa-solid fa-globe" aria-hidden="true"></i><span>ES</span></button>
          <button type="button" class="bq-drawer-sos" data-bq-close-drawer onclick="openSosModal(event)"><i class="fa-solid fa-shield-heart" aria-hidden="true"></i> SOS · Emergencias</button>
        </div>
      </div>`;
  return html;
}

// ============================================================================
// Controlador de grupos (escritorio = desplegables; celular = acordeón)
// 🎯 POR QUÉ: un único controlador por documento para los cinco grupos; antes
//    había varios sobre el mismo botón y se anulaban.
// ⚙️ CÓMO: patrón de "divulgación" accesible (botón + aria-expanded +
//    aria-controls + panel con hidden). Solo un grupo abierto a la vez.
//    Escritorio con puntero fino: abre al pasar el mouse (con demora) y con
//    clic; teclado: Enter/Espacio, ↓ entra al panel, ↑/↓/Inicio/Fin recorren,
//    Esc cierra y devuelve el foco; salir con Tab cierra. Clic fuera cierra.
// 📦 QUÉ: bqSetMenuGroup(), bqCloseMenuGroups(), bqInitMenuGroups().
// ============================================================================
const BQ_MENU_DRAWER_QUERY = window.matchMedia('(max-width: 960px)');
const BQ_MENU_HOVER_QUERY = window.matchMedia('(min-width: 961px) and (hover: hover) and (pointer: fine)');

function bqClampMenuPanel(panel) {
  if (!panel || BQ_MENU_DRAWER_QUERY.matches) return;
  panel.style.setProperty('--bq-panel-shift', '0px');
  const rect = panel.getBoundingClientRect();
  const margin = 12;
  const viewport = document.documentElement.clientWidth;
  let shift = 0;
  if (rect.right > viewport - margin) shift = viewport - margin - rect.right;
  if (rect.left + shift < margin) shift = margin - rect.left;
  panel.style.setProperty('--bq-panel-shift', `${Math.round(shift)}px`);
}

function bqMenuGroups() {
  return Array.from(document.querySelectorAll('#navLinksMenu .bq-menu-group'));
}

function bqSetMenuGroup(group, open, options = {}) {
  if (!group) return;
  const trigger = group.querySelector('.bq-menu-trigger');
  const panel = group.querySelector('.bq-menu-panel');
  if (!trigger || !panel) return;
  if (open) bqMenuGroups().forEach((other) => { if (other !== group) bqSetMenuGroup(other, false); });
  group.classList.toggle('is-open', open);
  trigger.setAttribute('aria-expanded', String(open));
  panel.hidden = !open;
  if (open) {
    bqClampMenuPanel(panel);
    if (options.focusFirst) {
      const first = panel.querySelector('a[href]:not([hidden])');
      if (first) first.focus();
    }
  } else if (options.returnFocus) {
    trigger.focus();
  }
}

function bqCloseMenuGroups(exceptGroup) {
  bqMenuGroups().forEach((group) => { if (group !== exceptGroup) bqSetMenuGroup(group, false); });
}

function bqInitMenuGroups(navMenu) {
  if (!navMenu || navMenu.dataset.bqGroupsWired === 'true') return;
  navMenu.dataset.bqGroupsWired = 'true';
  const hoverTimers = new WeakMap();

  navMenu.addEventListener('click', (event) => {
    const trigger = event.target.closest('.bq-menu-trigger');
    if (!trigger || !navMenu.contains(trigger)) return;
    event.preventDefault();
    event.stopPropagation();
    const group = trigger.closest('.bq-menu-group');
    // Si el mouse lo acaba de abrir, el clic que sigue no debe cerrarlo.
    const justHovered = BQ_MENU_HOVER_QUERY.matches && Date.now() - (Number(group.dataset.hoverAt) || 0) < 600;
    bqSetMenuGroup(group, justHovered || !group.classList.contains('is-open'));
  });

  navMenu.querySelectorAll('.bq-menu-group').forEach((group) => {
    group.addEventListener('mouseenter', () => {
      if (!BQ_MENU_HOVER_QUERY.matches) return;
      clearTimeout(hoverTimers.get(group));
      hoverTimers.set(group, setTimeout(() => {
        if (!group.classList.contains('is-open')) group.dataset.hoverAt = String(Date.now());
        bqSetMenuGroup(group, true);
      }, 90));
    });
    group.addEventListener('mouseleave', () => {
      if (!BQ_MENU_HOVER_QUERY.matches) return;
      clearTimeout(hoverTimers.get(group));
      hoverTimers.set(group, setTimeout(() => bqSetMenuGroup(group, false), 220));
    });
    // En escritorio, al salir del grupo con Tab se cierra su panel.
    group.addEventListener('focusout', (event) => {
      if (BQ_MENU_DRAWER_QUERY.matches) return;
      if (event.relatedTarget && group.contains(event.relatedTarget)) return;
      if (!event.relatedTarget) return;
      bqSetMenuGroup(group, false);
    });
  });

  navMenu.addEventListener('keydown', (event) => {
    const group = event.target.closest('.bq-menu-group');
    if (!group) return;
    const trigger = group.querySelector('.bq-menu-trigger');
    const panel = group.querySelector('.bq-menu-panel');
    const items = Array.from(panel.querySelectorAll('a[href]:not([hidden])'));
    const onTrigger = event.target === trigger;
    if (event.key === 'Escape' && group.classList.contains('is-open')) {
      event.preventDefault();
      event.stopPropagation();
      bqSetMenuGroup(group, false, { returnFocus: true });
      return;
    }
    if (onTrigger && event.key === 'ArrowDown') {
      event.preventDefault();
      bqSetMenuGroup(group, true, { focusFirst: true });
      return;
    }
    if (onTrigger || !items.length) return;
    const index = items.indexOf(document.activeElement);
    let next = -1;
    if (event.key === 'ArrowDown') next = (index + 1) % items.length;
    else if (event.key === 'ArrowUp') next = index <= 0 ? items.length - 1 : index - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    if (next >= 0) {
      event.preventDefault();
      items[next].focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (BQ_MENU_DRAWER_QUERY.matches) return;
    if (!event.target.closest || !event.target.closest('#navLinksMenu .bq-menu-group')) bqCloseMenuGroups();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !BQ_MENU_DRAWER_QUERY.matches) bqCloseMenuGroups();
  });
  const onLayoutChange = () => bqCloseMenuGroups();
  if (BQ_MENU_DRAWER_QUERY.addEventListener) BQ_MENU_DRAWER_QUERY.addEventListener('change', onLayoutChange);
  else if (BQ_MENU_DRAWER_QUERY.addListener) BQ_MENU_DRAWER_QUERY.addListener(onLayoutChange);
  window.addEventListener('resize', () => {
    const open = document.querySelector('#navLinksMenu .bq-menu-group.is-open .bq-menu-panel');
    if (open) bqClampMenuPanel(open);
  }, { passive: true });
}


// ============================================================================
// 🎯 POR QUÉ: mantener un único orden de navegación en todo el portal.
// ⚙️ CÓMO: normaliza la barra existente antes de activar sus controladores.
// 📦 QUÉ: cinco accesos principales y un mega menú de cuatro columnas.
// ============================================================================
function buildGlobalMegaNavigation() {
  const navbar = document.getElementById('mainNavbar') || document.querySelector('.main-navbar, .main-navbar-exact');
  if (!navbar) return;
  
  if (!document.querySelector('link[data-global-headings]')) {
    const headings = document.createElement('link');
    headings.rel = 'stylesheet'; headings.href = 'css/headings-system.css?v=20260927-1'; headings.dataset.globalHeadings = 'true';
    document.head.appendChild(headings);
  }
  // Si la página ya enlaza la hoja (con cualquier versión) no se descarga otra
  // copia: antes se cargaba dos veces y alteraba el orden de la cascada.
  if (!document.querySelector('link[data-global-mega-nav], link[href*="css/navigation-mega.css"]')) {
    const style = document.createElement('link');
    style.rel = 'stylesheet'; style.href = 'css/navigation-mega.css?v=20261004-menu-2'; style.dataset.globalMegaNav = 'true';
    document.head.appendChild(style);
  }

  const navMenu = navbar.querySelector('#navLinksMenu, .exact-nav-menu, .nav-links-menu');
  if (navMenu && navMenu.dataset.globalMegaReady !== 'true') {
    navMenu.dataset.globalMegaReady = 'true';

    const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    // Navegación por divulgación (botones + paneles), no "menubar".
    navMenu.removeAttribute('role');
    navMenu.innerHTML = bqRenderGlobalMenu(current);
  }

  // Eliminar divisor vertical previo si existiese
  const existingDivider = navbar.querySelector('.nav-vertical-divider');
  if (existingDivider) existingDivider.remove();

  const actions = navbar.querySelector('.nav-actions-right, .nav-right-actions, .exact-nav-actions, .global-nav-actions');
  if (actions && actions.dataset.globalActionsReady !== 'true') {
    actions.dataset.globalActionsReady = 'true';
    actions.classList.add('global-nav-actions');
    actions.innerHTML = `
      <button type="button" class="sos-quick-btn navbar-sos-btn" onclick="openSosModal(event)" aria-label="Centro de auxilio SOS"><i class="fa-solid fa-shield-heart"></i><span>SOS</span></button>
      <div class="bq-account-slot" data-bq-account><a class="exact-nav-btn-login global-session navbar-login-btn" href="perfil.html" aria-label="Iniciar sesión"><i class="fa-solid fa-circle-user" aria-hidden="true"></i><span>Iniciar sesión</span></a></div>
      <button class="global-language navbar-lang-pill" type="button" aria-label="Cambiar idioma"><span>ES</span> <i class="fa-solid fa-chevron-down" style="font-size:0.68rem;margin-left:2px"></i></button>
      <button class="exact-nav-mobile-toggle mobile-nav-toggle" id="mobileNavToggle" type="button" aria-label="Abrir menú de navegación" data-i18n-aria-label="menu.openMenu" aria-expanded="false" aria-controls="navLinksMenu"><i class="fa-solid fa-bars" aria-hidden="true"></i></button>
    `;
  }

  // Cinco grupos: un solo controlador (ver bqInitMenuGroups).
  bqInitMenuGroups(navMenu);

  // El cajón móvil (hamburguesa) lo controla únicamente initMobileMenu(), por
  // delegación. Antes había tres controladores sobre el mismo botón que se
  // anulaban entre sí y dejaban la página sin scroll al cerrar.
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
  if (!menu || menu.querySelector('a[href^="baqueano-ia.html"], a[href^="baqueano-ai.html"]')) return;
  const link = document.createElement('a');
  link.href = 'baqueano-ai.html#planner';
  link.className = 'nav-link-ai';
  link.innerHTML = `
    <span class="nav-item-content">
      <span class="nav-icon-box"><i class="fa-solid fa-wand-magic-sparkles nav-icon"></i></span>
      <span class="nav-text-group"><span class="nav-label">Baqueano AI</span><span class="nav-sublabel">Planifica tu ruta</span></span>
    </span>
    <span class="nav-right-wrap"><span class="nav-item-badge live">● En línea</span><i class="fa-solid fa-chevron-right nav-arrow"></i></span>`;
  const profileLink = menu.querySelector(':scope > a[href="perfil.html"]');
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
// 🎯 POR QUÉ: antes guardaba una referencia al menú que global-injector.js
//    reemplaza después; la clase .scrolled nunca llegaba al menú visible.
// ⚙️ CÓMO: un único listener pasivo (rAF) que busca #mainNavbar en cada cuadro.
// 📦 QUÉ: fondo más sólido y sombra al desplazarse, en cualquier página.
function initNavbarScroll() {
  if (window.__bqNavScrollReady) {
    window.__bqNavScrollSync?.();
    return;
  }
  window.__bqNavScrollReady = true;

  let ticking = false;
  const sync = () => {
    ticking = false;
    const navbar = document.getElementById('mainNavbar');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 25);
  };
  window.__bqNavScrollSync = sync;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(sync);
  }, { passive: true });
  sync();
}

/**
 * 🎯 POR QUÉ: Garantizar un menú horizontal estable, ordenado y libre de saltos.
 * ⚙️ CÓMO: Neutraliza el cálculo dinámico de la píldora flotante, delegando el
 * estilo activo a CSS puro sin colisiones ni desalineaciones de texto.
 * 📦 QUÉ: Mantiene las micro-interacciones de botones de acción.
 */
function initDynamicNavbar() {
  const navMenu = document.getElementById('navLinksMenu');
  if (navMenu) {
    navMenu.querySelectorAll('.nav-pill-indicator').forEach((el) => el.remove());
    navMenu.classList.remove('has-indicator');
  }
  initActionRipples();
}

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
 * 🎯 POR QUÉ: Brindar un menú móvil desplegable limpio, accesible y fluido
 * sin alterar la estructura del menú horizontal en pantallas medianas y de escritorio.
 * ⚙️ CÓMO: Maneja la clase .mobile-open sobre navLinksMenu sin inyectar elementos
 * invasivos en el DOM que contaminen la barra de navegación horizontal.
 * 📦 QUÉ: Controlador reactivo de apertura/cierre, backdrop y navegación móvil.
 */
// 🎯 POR QUÉ: el botón hamburguesa tenía tres controladores (este, uno dentro de
//    buildGlobalMegaNavigation y una delegación al final del archivo) que se
//    anulaban: el menú a veces no abría y, al cerrar, la página quedaba sin
//    scroll porque `nav-drawer-open` se quedaba pegado.
// ⚙️ CÓMO: un solo controlador registrado una vez por documento, con delegación
//    de eventos: busca #navLinksMenu y #mobileNavToggle en el momento del evento,
//    así sobrevive a que global-injector.js reemplace el menú. El bloqueo de
//    scroll se aplica a <html> (quien realmente desplaza la página) y se
//    libera siempre al cerrar, al pasar a escritorio y al volver con "atrás".
// 📦 QUÉ: abre/cierra con el botón, cierra al elegir una opción, al tocar
//    fuera, con Escape y al rotar a horizontal ancho; foco accesible.
const BQ_DRAWER_BREAKPOINT = 960; // mismo corte que css/navigation-mega.css

function bqDrawerParts() {
  return {
    menu: document.getElementById('navLinksMenu'),
    toggle: document.getElementById('mobileNavToggle'),
    backdrop: document.querySelector('.nav-drawer-backdrop')
  };
}

function bqIsDrawerOpen() {
  const { menu } = bqDrawerParts();
  return Boolean(menu && menu.classList.contains('mobile-open'));
}

function bqSetDrawerState(isOpen, restoreFocus = false) {
  const { menu, toggle, backdrop } = bqDrawerParts();
  if (menu) menu.classList.toggle('mobile-open', isOpen);
  document.documentElement.classList.toggle('nav-drawer-open', isOpen);
  document.body.classList.toggle('nav-drawer-open', isOpen);
  if (backdrop) backdrop.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  if (toggle) {
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    // La etiqueta sigue al idioma activo (global-language.js) si está cargado.
    const i18nKey = isOpen ? 'menu.closeMenu' : 'menu.openMenu';
    const fallback = isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación';
    const translated = window.BaqueanoLanguage && typeof window.BaqueanoLanguage.t === 'function' ? window.BaqueanoLanguage.t(i18nKey, { fallback }) : '';
    toggle.setAttribute('data-i18n-aria-label', i18nKey);
    toggle.setAttribute('aria-label', translated && translated !== i18nKey ? translated : fallback);
    const icon = toggle.querySelector('i');
    if (icon) icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  }
  // Acordeón: al abrir se despliega el grupo de la página actual; al cerrar,
  // todo vuelve a plegarse para la próxima apertura.
  if (isOpen && menu) {
    const currentGroup = menu.querySelector('.bq-menu-group.is-current');
    if (currentGroup && !menu.querySelector('.bq-menu-group.is-open')) bqSetMenuGroup(currentGroup, true);
  } else if (!isOpen) {
    bqCloseMenuGroups();
  }
  if (isOpen && menu) {
    const firstControl = menu.querySelector('.bq-drawer-close') || menu.querySelector('a, button');
    if (firstControl) window.requestAnimationFrame(() => firstControl.focus({ preventScroll: true }));
  } else if (!isOpen && restoreFocus && toggle) {
    toggle.focus();
  }
}

function initMobileMenu() {
  if (!document.querySelector('.nav-drawer-backdrop')) {
    const backdrop = document.createElement('button');
    backdrop.className = 'nav-drawer-backdrop';
    backdrop.type = 'button';
    backdrop.tabIndex = -1;
    backdrop.setAttribute('aria-label', 'Cerrar menú de navegación');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);
  }
  // Estado inicial limpio (también si el menú se acaba de reemplazar).
  bqSetDrawerState(false);

  if (window.__bqDrawerReady) return;
  window.__bqDrawerReady = true;

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const { menu } = bqDrawerParts();

    if (target.closest('#mobileNavToggle')) {
      event.preventDefault();
      bqSetDrawerState(!bqIsDrawerOpen());
      return;
    }
    if (!bqIsDrawerOpen()) return;
    // El menú de idiomas se abre fuera del cajón: elegir idioma no lo cierra.
    if (target.closest('.bq-language-menu')) return;
    if (target.closest('[data-bq-close-drawer]')) {
      bqSetDrawerState(false);
      return;
    }
    if (target.closest('.nav-drawer-backdrop')) {
      bqSetDrawerState(false, true);
      return;
    }
    // Elegir una ruta cierra el cajón; el botón "Más" solo expande su sección.
    if (menu && menu.contains(target)) {
      if (target.closest('a[href]')) bqSetDrawerState(false);
      return;
    }
    // Toque fuera del cajón (salvo los controles de la barra, p. ej. idioma).
    if (!target.closest('#mainNavbar')) bqSetDrawerState(false);
  });

  document.addEventListener('keydown', (event) => {
    if (!bqIsDrawerOpen()) return;
    if (event.key === 'Escape') {
      bqSetDrawerState(false, true);
      return;
    }
    // Con el panel abierto, Tab recorre solo sus controles (como un diálogo).
    if (event.key !== 'Tab') return;
    const { menu } = bqDrawerParts();
    if (!menu) return;
    const focusables = Array.from(menu.querySelectorAll('a[href], button:not([disabled])'))
      .filter((el) => !el.hidden && el.getAttribute('aria-hidden') !== 'true' && el.getClientRects().length > 0);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!menu.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const desktopQuery = window.matchMedia(`(min-width: ${BQ_DRAWER_BREAKPOINT + 1}px)`);
  const releaseOnDesktop = () => { if (desktopQuery.matches && bqIsDrawerOpen()) bqSetDrawerState(false); };
  if (desktopQuery.addEventListener) desktopQuery.addEventListener('change', releaseOnDesktop);
  else if (desktopQuery.addListener) desktopQuery.addListener(releaseOnDesktop);

  // Volver con "atrás" restaura la página desde bfcache con el cajón abierto.
  window.addEventListener('pageshow', () => { if (bqIsDrawerOpen()) bqSetDrawerState(false); });
}

function initActiveNavHighlight() {
  const currentPath = window.location.pathname;
  const pageName = currentPath.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links-menu a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const [linkFile, linkHash] = href.split('/').pop().split('#');
    const linkPage = linkFile;
    // Un enlace con ancla (perfil.html#reservas) solo es "actual" con esa ancla.
    const hashMatches = !linkHash || window.location.hash === '#' + linkHash;

    if (hashMatches && (linkPage === pageName || (pageName === '' && linkPage === 'index.html'))) {
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
//   compatibles con Google Maps, Waze, Policía Nacional y Cruz Roja sin errores de búsqueda.
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
                  <i class="fa-solid fa-satellite" style="color: #4A7A5A; font-size: 1.1rem;"></i>
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
        btnCopyGps.innerHTML = `<i class="fa-solid fa-check" style="color: #4A7A5A;"></i> ¡Copiado para Google Maps! (${textToCopy})`;
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

// El pie de página único lo coloca global-injector.js (injectGlobalFooter).

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
  // Los menús ya cableados (p. ej. "Más") se excluyen: un segundo toggle lo anulaba.
  const dropdowns = Array.from(document.querySelectorAll('.nav-dropdown:not([data-bq-wired="true"])'));
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
  // roles.js (matriz de autorización) debe ejecutarse antes que user-session.js:
  // async=false conserva el orden de ejecución de scripts insertados por JS.
  const load = (src, ready) => {
    if (ready || document.querySelector(`script[src^="${src.split('?')[0]}"]`)) return;
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    document.head.appendChild(script);
  };
  load('js/shared/roles.js?v=20261003-1', window.BaqueanoRoles);
  load('js/user-session.js?v=20261003-2', window.BaqueanoSession);
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
      if (!type) markError('bizType', 'Elegí el tipo de negocio');
      if (!owner) markError('bizOwner', 'Ingresa el nombre del propietario o responsable');
      if (!category) markError('bizCategory', 'Elegí la categoría Baqueano');
      if (!department) markError('bizDepartment', 'Elegí el departamento');
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

// ============================================================================
// 🎯 POR QUÉ: los controladores del menú se enganchaban al menú que trae cada
//    HTML y global-injector.js lo reemplazaba después por el canónico: el menú
//    visible quedaba sin scroll dinámico, sin resaltado y con listeners huérfanos.
// ⚙️ CÓMO: mountGlobalNavigation() actúa sobre el menú canónico ya colocado y es
//    idempotente (data-bq-mounted). Si la página usa el inyector, se espera su
//    evento `baqueano:shell-ready`; si no, se monta sobre el menú existente.
// 📦 QUÉ: un único montaje del header por página, en el orden correcto.
// ============================================================================
function mountGlobalNavigation() {
  const navbar = document.getElementById('mainNavbar');
  if (!navbar || navbar.dataset.bqMounted === 'true') return;
  navbar.dataset.bqMounted = 'true';
  buildGlobalMegaNavigation();
  buildAboutDropdown();
  initBaqueanoAiNavLink();
  initNavbarScroll();
  initDynamicNavbar();
  initNavbarQuickSearch();
  initMobileMenu();
  initActiveNavHighlight();
  initDynamicDestinationCount();
  initDropdownMiPais();
  ensureAccessibleControlNames(navbar);
  window.BaqueanoSession?.refreshNavbar?.();
}
window.BaqueanoNavigation = { mount: mountGlobalNavigation, closeDrawer: () => bqSetDrawerState(false) };

function initializeNavigationModules() {
  initRuntimeObservability();
  initPublicServiceWorker();
  ensureUserSessionLoaded();
  ensureThemeSwitcherLoaded();
  const usesGlobalShell = document.querySelector('script[src*="global-injector.js"]');
  if (!usesGlobalShell || window.__BQ_SHELL_READY__) mountGlobalNavigation();
  else document.addEventListener('baqueano:shell-ready', mountGlobalNavigation, { once: true });
  initSosModal();
  initDownloadModal();
  initAndroidReleaseDownload();
  initShareTools();
  initSmoothScroll();
  initFooterBizRegister();
  scheduleBaqueanoDigitalLoad();
  ensureAccessibleControlNames();
  initInstantNavigation();
}

// ============================================================================
// 🎯 POR QUÉ: Navegación instantánea mediante prefetch inteligente en hover/touchstart.
// ⚙️ CÓMO: Detecta enlaces internos a archivos .html, verifica si la conexión no es Save-Data,
//         y precarga el documento usando <link rel="prefetch"> bajo demanda una sola vez.
// 📦 QUÉ: initInstantNavigation() para acelerar transiciones entre páginas.
// ============================================================================
function initInstantNavigation() {
  if (navigator.connection) {
    if (navigator.connection.saveData || /(^|2)g/.test(navigator.connection.effectiveType || '')) {
      return;
    }
  }

  const prefetchedUrls = new Set();
  const currentPath = window.location.pathname;

  function prefetchUrl(url) {
    if (!url || prefetchedUrls.has(url)) return;
    prefetchedUrls.add(url);

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'document';
    document.head.appendChild(link);
  }

  function handleInteraction(e) {
    if (!(e.target instanceof Element)) return;
    const anchor = e.target.closest('a[href]');
    if (!anchor || anchor.target || anchor.hasAttribute('download')) return;

    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;

    try {
      const targetUrl = new URL(anchor.href, window.location.href);
      if (targetUrl.origin === window.location.origin && targetUrl.pathname !== currentPath) {
        if (!/admin\.html/i.test(targetUrl.pathname)) {
          prefetchUrl(targetUrl.href);
        }
      }
    } catch (_) {}
  }

  document.addEventListener('pointerenter', handleInteraction, { capture: true, passive: true });
  document.addEventListener('touchstart', handleInteraction, { capture: true, passive: true });
}

// ============================================================================
// BAQUEANO DIGITAL — CARGA GLOBAL DIFERIDA
// 🎯 POR QUÉ: compartir un solo asistente en las páginas turísticas públicas.
// ⚙️ CÓMO: carga CSS/JS una vez y respeta rutas sensibles o institucionales.
// 📦 QUÉ: bootstrap liviano del componente global.
// ============================================================================
// ============================================================================
// BAQUEANO DIGITAL — CARGA DINÁMICA BAJO DEMANDA & IDLE
// 🎯 POR QUÉ: no bloquear el renderizado ni competir por ancho de banda inicial.
// ⚙️ CÓMO: carga CSS/JS al interactuar el usuario o en tiempo ocioso (requestIdleCallback).
// 📦 QUÉ: interfaz de asistente que se abre inmediatamente al pulsar el botón.
// ============================================================================
function loadBaqueanoDigital(openWhenReady) {
  const excluded = /(?:admin|perfil|privacidad|terminos|cookies|aviso-legal|offline|denuncias)(?:\.html)?$/i;
  if (excluded.test(window.location.pathname.replace(/\/$/, ''))) return;

  if (!document.querySelector('link[data-baqueano-assistant]')) {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = 'css/baqueano-assistant.css?v=20261003-microphone-1';
    style.dataset.baqueanoAssistant = 'true';
    document.head.appendChild(style);
  }

  if (window.BaqueanoAssistant) {
    if (openWhenReady) {
      if (typeof window.BaqueanoAssistant.show === 'function') window.BaqueanoAssistant.show();
      if (typeof window.BaqueanoAssistant.open === 'function') window.BaqueanoAssistant.open();
    }
    return;
  }

  if (!document.querySelector('script[data-baqueano-assistant]')) {
    const script = document.createElement('script');
    script.src = 'js/baqueano-assistant.js?v=20261003-microphone-1';
    script.defer = true;
    script.dataset.baqueanoAssistant = 'true';
    if (openWhenReady) {
      script.onload = function() {
        if (window.BaqueanoAssistant) {
          if (typeof window.BaqueanoAssistant.show === 'function') window.BaqueanoAssistant.show();
          if (typeof window.BaqueanoAssistant.open === 'function') window.BaqueanoAssistant.open();
        }
      };
    }
    document.body.appendChild(script);
  }
}
window.loadBaqueanoDigital = loadBaqueanoDigital;

function scheduleBaqueanoDigitalLoad() {
  let scheduled = false;
  const trigger = () => {
    if (scheduled) return;
    scheduled = true;
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => loadBaqueanoDigital(false), { timeout: 3500 });
    } else {
      setTimeout(() => loadBaqueanoDigital(false), 2500);
    }
  };
  ['pointerdown', 'touchstart', 'scroll'].forEach(evt => {
    window.addEventListener(evt, trigger, { once: true, passive: true });
  });
  setTimeout(trigger, 4000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeNavigationModules, { once: true });
} else {
  initializeNavigationModules();
}
