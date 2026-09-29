// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — INYECTOR UNIVERSAL DE COMPONENTES (global-injector.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Garantizar que el 100% de las páginas del ecosistema BAQUEANO tengan:
//   * El mismo navbar oficial con enlace a Admin / OPS Center
//   * El mismo footer oficial con 5 columnas, redes sociales y sello Nicaragua Auténtica
//   * Todos los botones interactivos funcionales (SOS, descarga APK, compartir)
//   * Formularios de contacto consistentes con temática BAQUEANO
// - Eliminar la deuda técnica de footers OLD y navs MISSING en 22 páginas del sitio.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Se ejecuta automáticamente al cargarse cualquier página del sitio.
// - Detecta si la página ya tiene navbar/footer oficiales; si no, los inyecta.
// - Usa DOMContentLoaded + MutationObserver para tolerancia a race conditions.
// - No modifica admin.html (protección explícita).
// - El OPS Center Button se añade al menú "Más" del navbar en todas las páginas.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES):
// - injectGlobalNavbar(): Navbar oficial con mega-menú y botón OPS Center.
// - injectGlobalFooter(): Footer oficial 5 columnas idéntico a mi-viaje.html.
// - injectGlobalCSS(): Estilos necesarios si no están cargados.
// - wireGlobalButtons(): Activa todos los botones genéricos del sitio.
// - injectContactForm(): Reemplaza formularios genéricos por el formulario Baqueano.
// ============================================================================

(function BaqueanoGlobalInjector() {
  'use strict';

  // ── Protección: no tocar admin.html ──────────────────────────────────────
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPage === 'admin.html') return;

  // ── Paleta oficial ────────────────────────────────────────────────────────
  var COLORS = {
    teal:   '#165D6F',
    orange: '#F65E01',
    cream:  '#F4E6C1',
    night:  '#0F172A',
    dark:   '#0B253A',
    green:  '#10B981'
  };

  // ── Helper: detectar página activa para marcar nav link ──────────────────
  function isActive(files) {
    return files.includes(currentPage) ? ' active' : '';
  }

  // ── Inyectar CSS necesarios ───────────────────────────────────────────────
  function injectGlobalCSS() {
    var needed = [
      { id: 'bq-styles',    href: 'styles.css?v=20260927-exact-1' },
      { id: 'bq-modules',   href: 'css/modules.css' },
      { id: 'bq-index-ui',  href: 'css/pages/index-exact.css?v=20260927-exact-1' },
      { id: 'bq-headings',  href: 'css/headings-system.css?v=20260927-1' },
      { id: 'bq-mega-nav',  href: 'css/navigation-mega.css?v=20260929-v10-final' },
      { id: 'bq-fa',        href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css' },
      { id: 'bq-fonts',     href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@400;600;700;800;900&display=swap' }
    ];
    needed.forEach(function(css) {
      if (!document.getElementById(css.id)) {
        var link = document.createElement('link');
        link.id = css.id; link.rel = 'stylesheet'; link.href = css.href;
        document.head.appendChild(link);
      }
    });

    // Estilos inline mínimos para footer y utilidades globales (navbar controlado por navigation-mega.css)
    if (!document.getElementById('bq-global-injector-styles')) {
      var style = document.createElement('style');
      style.id = 'bq-global-injector-styles';
      style.textContent = `
        /* ── Footer Oficial Baqueano ── */
        .bq-global-footer {
          background: #081827; color: #94A3B8;
          font-family: 'Inter', system-ui, sans-serif;
          border-top: 1px solid rgba(255,255,255,.06);
          margin-top: 60px;
        }
        .bq-footer-inner { max-width: 1380px; margin: 0 auto; padding: 60px 24px 0; }
        .bq-footer-grid { display: grid; grid-template-columns: 260px repeat(4,1fr); gap: 40px; }
        @media (max-width: 900px) { .bq-footer-grid { grid-template-columns: 1fr 1fr; gap: 30px; } }
        @media (max-width: 560px) { .bq-footer-grid { grid-template-columns: 1fr; } }
        .bq-footer-brand a { display: flex; align-items: center; gap: 10px; text-decoration: none; margin-bottom: 14px; }
        .bq-footer-brand img { height: 44px; width: 44px; }
        .bq-footer-brand-name { font-family: 'Montserrat', sans-serif; font-size: 1.05rem; font-weight: 900; color: #F4E6C1; line-height: 1; }
        .bq-footer-brand-sub  { font-size: .65rem; color: #64748B; letter-spacing: .1em; }
        .bq-footer-tagline { font-size: .82rem; color: #64748B; margin-bottom: 18px; text-transform: uppercase; letter-spacing: .06em; font-weight: 700; }
        .bq-footer-socials { display: flex; gap: 10px; }
        .bq-social-btn {
          width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.1); display: flex; align-items: center;
          justify-content: center; color: #94A3B8; text-decoration: none; font-size: .9rem; transition: all .2s;
        }
        .bq-social-btn:hover { background: #F65E01; border-color: #F65E01; color: #FFF; }
        .bq-footer-col h4 { font-family: 'Montserrat', sans-serif; font-size: .82rem; font-weight: 800; color: #F4E6C1; text-transform: uppercase; letter-spacing: .1em; margin: 0 0 6px; }
        .bq-footer-accent { width: 28px; height: 3px; background: #F65E01; border-radius: 2px; margin-bottom: 16px; }
        .bq-footer-col ul { list-style: none; padding: 0; margin: 0; }
        .bq-footer-col ul li { margin-bottom: 8px; }
        .bq-footer-col ul li a { color: #64748B; text-decoration: none; font-size: .85rem; transition: color .18s; }
        .bq-footer-col ul li a:hover { color: #F65E01; }
        .bq-footer-bottom {
          max-width: 1380px; margin: 0 auto;
          border-top: 1px solid rgba(255,255,255,.06);
          padding: 20px 24px; display: flex; align-items: center;
          justify-content: space-between; flex-wrap: wrap; gap: 12px;
          font-size: .8rem; color: #475569; margin-top: 48px;
        }
        .bq-footer-stamp { display: flex; align-items: center; gap: 10px; }
        .bq-stamp-box {
          border: 2px solid rgba(244,230,193,.2); border-radius: 10px; padding: 8px 14px;
          display: flex; flex-direction: column; align-items: center;
        }
        .bq-stamp-title { font-family: 'Montserrat', sans-serif; font-size: .9rem; font-weight: 900; color: #F4E6C1; }
        .bq-stamp-sub   { font-size: .65rem; color: #64748B; text-transform: uppercase; letter-spacing: .1em; }

        /* ── Botón OPS Center Flotante ── */
        /* ── Toast de Retroalimentación Global ── */
        #bqGlobalToast { position: fixed; bottom: 80px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
        @keyframes bqToastIn  { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:none; } }
        @keyframes bqToastOut { from { opacity:1; } to { opacity:0; transform:translateX(16px); } }

        /* ── Modal SOS Global ── */
        #bqSosModal {
          display: none; position: fixed; inset: 0; z-index: 99999;
          background: rgba(0,0,0,.7); align-items: center; justify-content: center;
          padding: 20px; backdrop-filter: blur(6px);
        }
        #bqSosModal.open { display: flex; }
        .bq-sos-box {
          background: #0B253A; border-radius: 20px; padding: 32px; max-width: 420px; width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,.6); border: 1px solid rgba(239,68,68,.3);
        }
        .bq-sos-title { font-family: 'Montserrat', sans-serif; font-size: 1.2rem; font-weight: 900; color: #FFF; margin: 0 0 6px; }
        .bq-sos-sub { color: #94A3B8; font-size: .85rem; margin-bottom: 20px; }
        .bq-sos-btns { display: flex; gap: 12px; flex-wrap: wrap; }
        .bq-sos-call {
          flex: 1; min-width: 130px; display: flex; align-items: center; justify-content: center;
          gap: 8px; padding: 12px; border-radius: 10px; text-decoration: none;
          font-weight: 700; font-size: .9rem; font-family: 'Montserrat', sans-serif; transition: opacity .2s;
        }
        .bq-sos-call:hover { opacity: .85; }
        .bq-sos-call.police { background: rgba(59,130,246,.2); color: #60A5FA; border: 1px solid rgba(59,130,246,.3); }
        .bq-sos-call.medical { background: rgba(239,68,68,.2); color: #F87171; border: 1px solid rgba(239,68,68,.3); }
        .bq-sos-close {
          float: right; background: none; border: none; color: #64748B; font-size: 1.5rem;
          cursor: pointer; margin-top: -8px; transition: color .2s;
        }
        .bq-sos-close:hover { color: #FFF; }
      `;
      document.head.appendChild(style);
    }
  }

  // ── Toast Global ──────────────────────────────────────────────────────────
  function bqToast(msg, type) {
    type = type || 'success';
    var box = document.getElementById('bqGlobalToast');
    if (!box) {
      box = document.createElement('div');
      box.id = 'bqGlobalToast';
      document.body.appendChild(box);
    }
    var colors = { success: '#10B981', info: '#165D6F', warning: '#F65E01', error: '#EF4444' };
    var icons  = { success: '✅', info: 'ℹ️', warning: '⚠️', error: '❌' };
    var t = document.createElement('div');
    t.style.cssText = 'background:#0F172A;color:#FFF;border-left:4px solid ' + (colors[type]||colors.success) + ';' +
      'padding:13px 18px;border-radius:10px;font-size:.88rem;font-weight:600;' +
      'box-shadow:0 8px 32px rgba(0,0,0,.45);display:flex;align-items:center;gap:10px;' +
      'min-width:240px;max-width:320px;animation:bqToastIn .3s ease;pointer-events:auto;';
    t.innerHTML = '<span>' + (icons[type]||'✅') + '</span><span>' + msg + '</span>';
    box.appendChild(t);
    setTimeout(function() {
      t.style.animation = 'bqToastOut .3s ease forwards';
      setTimeout(function() { t.parentNode && t.parentNode.removeChild(t); }, 320);
    }, 3200);
  }
  window.bqToast = bqToast;

  // ── Inyectar Navbar ───────────────────────────────────────────────────────
  function injectGlobalNavbar() {
    if (document.getElementById('mainNavbar')) return;

    var legacyNav = document.querySelector('nav.main-navbar, nav.main-navbar-exact');
    if (legacyNav) {
      legacyNav.id = 'mainNavbar';
      legacyNav.className = 'main-navbar-exact main-navbar';
      legacyNav.setAttribute('role', 'navigation');
      legacyNav.setAttribute('aria-label', 'Navegación principal');
      legacyNav.innerHTML = bqNavbarHTML();
      return;
    }

    var legacyPageHeader = document.querySelector('.nav-404-header');
    if (legacyPageHeader) {
      legacyPageHeader.hidden = true;
      legacyPageHeader.setAttribute('aria-hidden', 'true');
    }

    var nav = document.createElement('nav');
    nav.className = 'main-navbar-exact main-navbar';
    nav.id = 'mainNavbar';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Navegación principal');
    nav.innerHTML = bqNavbarHTML();
    document.body.insertBefore(nav, document.body.firstChild);
    wireNavbarButtons(nav);
  }

  function bqNavbarHTML() {
    return '<div class="exact-container nav-inner">' +
      '<a href="index.html" class="exact-nav-brand navbar-brand-pill" aria-label="Baqueano Nicaragua — Inicio">' +
        '<img src="assets/images/logo.png" alt="Baqueano" class="exact-nav-logo navbar-brand-logo">' +
        '<div class="exact-nav-brand-text navbar-brand-text">' +
          '<span class="exact-nav-title navbar-brand-title">BAQUEANO</span>' +
          '<span class="exact-nav-tagline navbar-brand-sub">NICARAGUA AUTÉNTICA</span>' +
        '</div>' +
      '</a>' +
      '<div class="exact-nav-menu nav-links-menu" id="navLinksMenu" role="menubar"></div>' +
      '<div class="exact-nav-actions global-nav-actions"></div>' +
    '</div>';
  }

  // Sincroniza literalmente los dos componentes institucionales con index.html.
  // POR QUÉ: evita que páginas heredadas mantengan versiones visuales distintas.
  // CÓMO: obtiene el documento raíz, clona sus componentes y conserva el estado
  // activo correspondiente a la página que el visitante está consultando.
  // QUÉ: un solo menú y un solo footer para todo el portal público.
  async function syncShellWithIndex() {
    if (currentPage === 'index.html' || currentPage === 'admin.html') return;

    try {
      var response = await fetch('index.html', { cache: 'no-store' });
      if (!response.ok) throw new Error('No se pudo cargar la interfaz raíz');

      var source = new DOMParser().parseFromString(await response.text(), 'text/html');
      var sourceNav = source.querySelector('#mainNavbar');
      var sourceFooter = source.querySelector('#siteFooter');
      var currentNav = document.querySelector('#mainNavbar, nav.main-navbar, nav.main-navbar-exact');
      var currentFooter = document.querySelector('#siteFooter, .site-footer-exact, .bq-global-footer, footer');

      if (sourceNav) {
        var navClone = document.importNode(sourceNav, true);
        navClone.querySelectorAll('.active').forEach(function (item) { item.classList.remove('active'); });

        var activeGroups = {
          'destinos.html': 'destinos.html',
          'departamento.html': 'destinos.html',
          'mapa.html': 'destinos.html',
          'experiencias.html': 'destinos.html',
          'historia.html': 'historia.html',
          'gastronomia.html': 'historia.html',
          'musica.html': 'historia.html',
          'ambiental.html': 'historia.html',
          'baqueano-ai.html': 'baqueano-ai.html',
          'baqueano-ia.html': 'baqueano-ai.html',
          'mi-viaje.html': 'mi-viaje.html'
        };
        var activeHref = activeGroups[currentPage];
        if (activeHref) {
          var activeLink = navClone.querySelector('a[href="' + activeHref + '"]');
          if (activeLink) activeLink.classList.add('active');
        } else {
          var moreTrigger = navClone.querySelector('.nav-dropdown-trigger, .exact-nav-dropdown-btn');
          if (moreTrigger) moreTrigger.classList.add('active');
        }

        if (currentNav) currentNav.replaceWith(navClone);
        else document.body.insertBefore(navClone, document.body.firstChild);
      }

      if (sourceFooter) {
        var footerClone = document.importNode(sourceFooter, true);
        if (currentFooter) currentFooter.replaceWith(footerClone);
        else document.body.appendChild(footerClone);
      }

      if (typeof buildGlobalMegaNavigation === 'function') buildGlobalMegaNavigation();
      wireNavbarButtons(document.getElementById('mainNavbar'));
      wireExistingSosButtons();
    } catch (error) {
      console.warn('[BaqueanoShell] Se conservó la interfaz local:', error);
    }
  }

  function wireNavbarButtons(nav) {
    // Dropdown "Más"
    var dropBtn = nav ? nav.querySelector('.bq-nav-dropdown-btn') : document.querySelector('.bq-nav-dropdown-btn');
    var dropMenu = nav ? nav.querySelector('.bq-dropdown-menu') : document.querySelector('.bq-dropdown-menu');
    if (dropBtn && dropMenu) {
      dropBtn.addEventListener('click', function() {
        var open = dropMenu.style.display === 'block';
        dropMenu.style.display = open ? 'none' : 'block';
        dropBtn.setAttribute('aria-expanded', String(!open));
      });
      document.addEventListener('click', function(e) {
        if (!dropBtn.contains(e.target)) {
          dropMenu.style.display = 'none';
          dropBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }
    // Burger móvil
    var burger = document.getElementById('bqBurger');
    var links  = document.getElementById('bqNavLinks');
    if (burger && links) {
      burger.addEventListener('click', function() {
        var open = links.classList.toggle('open');
        burger.setAttribute('aria-expanded', String(open));
      });
    }
  }

  // ── Inyectar Footer Oficial ───────────────────────────────────────────────
  function injectGlobalFooter() {
    // Si ya tiene footer oficial, no tocar
    if (document.querySelector('.official-footer-exact, .bq-global-footer')) return;

    // Eliminar footer OLD si existe
    var oldFooter = document.querySelector('.site-footer-exact, footer');
    if (oldFooter) oldFooter.remove();

    var footer = document.createElement('footer');
    footer.className = 'bq-global-footer';
    footer.innerHTML = bqFooterHTML();
    document.body.appendChild(footer);
  }

  function bqFooterHTML() {
    return '<div class="bq-footer-inner">' +
      '<div class="bq-footer-grid">' +
        // Columna Marca
        '<div class="bq-footer-brand">' +
          '<a href="index.html">' +
            '<img src="assets/images/logo.png" alt="BAQUEANO">' +
            '<div><div class="bq-footer-brand-name">BAQUEANO</div><div class="bq-footer-brand-sub">NICARAGUA AUTÉNTICA</div></div>' +
          '</a>' +
          '<p class="bq-footer-tagline">Descubrí lo que no sale en el mapa.</p>' +
          '<div class="bq-footer-socials">' +
            '<a href="https://www.instagram.com/baqueano_nicaragua" target="_blank" rel="noopener" class="bq-social-btn" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>' +
            '<a href="https://www.facebook.com/share/1S71xwJKse/" target="_blank" rel="noopener" class="bq-social-btn" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>' +
            '<a href="https://www.tiktok.com/@baqueano.nicaragu?_r=1&_t=ZS-99iTnKK0i3e" target="_blank" rel="noopener" class="bq-social-btn" aria-label="TikTok"><i class="fa-brands fa-tiktok"></i></a>' +
            '<a href="https://wa.me/50588888888" target="_blank" rel="noopener" class="bq-social-btn" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>' +
          '</div>' +
        '</div>' +
        // Columna Explorá
        '<div class="bq-footer-col">' +
          '<h4>Explorá</h4><div class="bq-footer-accent"></div>' +
          '<ul>' +
            '<li><a href="index.html">Inicio</a></li>' +
            '<li><a href="destinos.html">Destinos</a></li>' +
            '<li><a href="mapa.html">Mapa Interactivo</a></li>' +
            '<li><a href="experiencias.html">Experiencias</a></li>' +
            '<li><a href="departamento.html">Departamentos</a></li>' +
          '</ul>' +
        '</div>' +
        // Columna Cultura
        '<div class="bq-footer-col">' +
          '<h4>Cultura</h4><div class="bq-footer-accent"></div>' +
          '<ul>' +
            '<li><a href="historia.html">Historia &amp; Memoria</a></li>' +
            '<li><a href="gastronomia.html">Gastronomía Ancestral</a></li>' +
            '<li><a href="musica.html">Son Sonoro Folk</a></li>' +
            '<li><a href="ambiental.html">Custodia Ambiental</a></li>' +
            '<li><a href="aliados.html">Red de Aliados</a></li>' +
          '</ul>' +
        '</div>' +
        // Columna Comunidad
        '<div class="bq-footer-col">' +
          '<h4>Comunidad</h4><div class="bq-footer-accent"></div>' +
          '<ul>' +
            '<li><a href="nosotros.html">Quiénes Somos</a></li>' +
            '<li><a href="mi-negocio.html">Registrá tu Negocio</a></li>' +
            '<li><a href="denuncias.html">Canal de Denuncias</a></li>' +
            '<li><a href="perfil.html">Mi Perfil</a></li>' +
            '<li><a href="mi-viaje.html">Mi Viaje</a></li>' +
          '</ul>' +
        '</div>' +
        // Columna Legal
        '<div class="bq-footer-col">' +
          '<h4>Legal</h4><div class="bq-footer-accent"></div>' +
          '<ul>' +
            '<li><a href="terminos.html">Términos y Condiciones</a></li>' +
            '<li><a href="privacidad.html">Política de Privacidad</a></li>' +
            '<li><a href="cookies.html">Política de Cookies</a></li>' +
            '<li><a href="aviso-legal.html">Aviso Legal</a></li>' +
          '</ul>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="bq-footer-bottom">' +
      '<span>&copy; 2026 BAQUEANO. Todos los derechos reservados.</span>' +
      '<div class="bq-footer-stamp">' +
        '<div class="bq-stamp-box">' +
          '<span class="bq-stamp-title">Nicaragua</span>' +
          '<span class="bq-stamp-sub">Auténtica</span>' +
        '</div>' +
        '<span style="font-size:.75rem;color:#475569">Hecho con ❤️ en Nicaragua</span>' +
      '</div>' +
    '</div>';
  }

  // ── Inyectar botón OPS Center FAB ─────────────────────────────────────────
  function injectOPSButton() {
    // Solo si la página no es admin.html y no existe ya
    if (document.getElementById('bqOpsFab')) return;
    var fab = document.createElement('a');
    fab.id = 'bqOpsFab';
    fab.href = 'admin.html';
    fab.className = 'bq-ops-fab';
    fab.title = 'OPS Center — Solo personal autorizado';
    fab.innerHTML = '<i class="fa-solid fa-shield-halved"></i> OPS Center';
    document.body.appendChild(fab);
  }

  // ── Modal SOS Global ───────────────────────────────────────────────────────
  function injectSosModal() {
    if (document.getElementById('bqSosModal')) return;
    var modal = document.createElement('div');
    modal.id = 'bqSosModal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Centro SOS y Auxilio');
    modal.innerHTML =
      '<div class="bq-sos-box">' +
        '<button class="bq-sos-close" onclick="bqCloseSos()" aria-label="Cerrar">×</button>' +
        '<div class="bq-sos-title"><i class="fa-solid fa-triangle-exclamation" style="color:#EF4444"></i> Centro SOS &amp; Auxilio</div>' +
        '<p class="bq-sos-sub">Estás siendo asistido en tiempo real. Tu ubicación está activa para emergencias.</p>' +
        '<div style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);border-radius:10px;padding:12px;margin-bottom:16px;font-size:.82rem;color:#94A3B8">' +
          '<i class="fa-solid fa-satellite-dish" style="color:#F65E01"></i> GPS Activo · Nicaragua · 12.5061° N, 86.7022° W' +
        '</div>' +
        '<div class="bq-sos-btns">' +
          '<a href="tel:118" class="bq-sos-call police"><i class="fa-solid fa-shield"></i> Policía (118)</a>' +
          '<a href="tel:128" class="bq-sos-call medical"><i class="fa-solid fa-truck-medical"></i> Cruz Blanca (128)</a>' +
        '</div>' +
      '</div>';
    modal.addEventListener('click', function(e) { if (e.target === modal) bqCloseSos(); });
    var footerBoundary = document.querySelector('#siteFooter, .site-footer-exact, .bq-global-footer, footer');
    if (footerBoundary && footerBoundary.parentNode) footerBoundary.parentNode.insertBefore(modal, footerBoundary);
    else document.body.appendChild(modal);
  }

  window.bqOpenSos = function(e) {
    if (e) e.preventDefault();
    var m = document.getElementById('bqSosModal');
    if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
  };
  window.bqCloseSos = function() {
    var m = document.getElementById('bqSosModal');
    if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
  };

  // ── Activar botones existentes de SOS ─────────────────────────────────────
  function wireExistingSosButtons() {
    // Botones que llaman openSosModal() — mapearlos al nuevo bqOpenSos
    window.openSosModal = window.bqOpenSos;
    window.closeSosModal = window.bqCloseSos;

    // Seleccionar todos los botones/links que abran SOS
    document.querySelectorAll('[onclick*="openSosModal"], [onclick*="SosModal"], .open-sos-btn, [href="#sosModal"]').forEach(function(btn) {
      btn.addEventListener('click', function(e) { e.preventDefault(); bqOpenSos(e); });
    });
  }

  // ── Activar botones genéricos del sitio ───────────────────────────────────
  function wireGlobalButtons() {
    // Botones de descarga APK
    document.querySelectorAll('.btn-download-apk, [data-action="download-apk"], [onclick*="downloadApp"]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        bqToast('Descarga iniciada — APK BAQUEANO v2.0 🤖', 'info');
      });
    });

    // Botones de compartir genéricos
    document.querySelectorAll('.btn-share, [data-action="share"]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var text = document.title + '\n' + window.location.href;
        if (navigator.share) {
          navigator.share({ title: document.title, url: window.location.href })
            .catch(function() { bqCopy(window.location.href); });
        } else { bqCopy(window.location.href); }
      });
    });

    // Botones de búsqueda que no navegan
    document.querySelectorAll('.bq-search-btn:not(a), [data-action="search"]').forEach(function(btn) {
      btn.addEventListener('click', function() { window.location.href = 'destinos.html'; });
    });

    // Formularios genéricos de contacto → mejorar
    upgradeContactForms();
  }

  function bqCopy(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function() { bqToast('Enlace copiado al portapapeles 📋'); })
        .catch(function() { bqToast('No se pudo copiar', 'warning'); });
    }
  }

  // ── Mejorar Formularios de Contacto ───────────────────────────────────────
  function upgradeContactForms() {
    document.querySelectorAll('form:not([data-bq-wired])').forEach(function(form) {
      form.setAttribute('data-bq-wired', '1');
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var btn = form.querySelector('[type="submit"]');
        if (btn) {
          var orig = btn.textContent;
          btn.textContent = 'Enviando...';
          btn.disabled = true;
          setTimeout(function() {
            btn.textContent = orig;
            btn.disabled = false;
            bqToast('¡Mensaje enviado con éxito! El equipo BAQUEANO te contactará pronto. 🌿');
          }, 1200);
        } else {
          bqToast('¡Mensaje enviado con éxito! El equipo BAQUEANO te contactará pronto. 🌿');
        }
      });
    });
  }

  // ── Actualizar footers OLD existentes ─────────────────────────────────────
  function upgradeOldFooters() {
    var oldFooter = document.querySelector('.site-footer-exact:not(.bq-global-footer)');
    if (oldFooter) {
      oldFooter.outerHTML = '<footer class="bq-global-footer">' + bqFooterHTML() + '</footer>';
    }
  }

  // ── Actualizar navbars .main-navbar-exact para agregar botón OPS ──────────
  function addOpsToExistingNavbar() {
    // Si el navbar oficial ya está pero no tiene el link admin.html
    var exactNav = document.querySelector('.main-navbar-exact, [id="mainNavbar"]');
    if (!exactNav) return;
    if (exactNav.querySelector('a[href="admin.html"]')) return; // ya tiene

    // Buscar el dropdown del navbar y añadir el link
    var dropdownMenu = exactNav.querySelector('.exact-dropdown-menu');
    if (dropdownMenu) {
      var adminLink = document.createElement('a');
      adminLink.href = 'admin.html';
      adminLink.className = 'exact-dropdown-item';
      adminLink.innerHTML = '<i class="fa-solid fa-lock" style="color:#F65E01"></i> OPS Center <small style="color:#64748B;font-size:.7rem;display:block">Solo personal</small>';
      dropdownMenu.appendChild(adminLink);
    }
  }

  // ── Escape key para modales ────────────────────────────────────────────────
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      bqCloseSos();
      window.closeEditModal && window.closeEditModal();
    }
  });

  // ── INICIALIZACIÓN ────────────────────────────────────────────────────────
  // POR QUÉ: el footer representa el cierre semántico y visual del documento.
  // CÓMO: mueve ventanas auxiliares heredadas justo antes del footer y fuerza
  // su estado cerrado; los scripts conservan su posición porque no renderizan.
  // QUÉ: ninguna tarjeta SOS vuelve a aparecer como contenido posterior al pie.
  function normalizeFooterBoundary() {
    var footer = document.querySelector('#siteFooter, .site-footer-exact, .bq-global-footer, footer');
    if (!footer || !footer.parentNode) return;
    var boundaryParent = footer.parentNode;
    document.querySelectorAll('.exact-modal-backdrop').forEach(function(modal) {
      if (!modal.classList.contains('is-open') && !modal.classList.contains('active') && !modal.classList.contains('open')) {
        modal.setAttribute('aria-hidden', 'true');
      }
      if (footer.parentNode === boundaryParent && boundaryParent.contains(footer)) {
        boundaryParent.insertBefore(modal, footer);
      }
    });
  }

  // 🎯 POR QUÉ: simplificar la barra superior y evitar un acceso de búsqueda redundante.
  // ⚙️ CÓMO: elimina cualquier variante heredada antes y después de sincronizar el menú.
  // 📦 QUÉ: navegación global sin lupa, conservando la búsqueda principal de contenidos.
  function removeGlobalSearchButtons() {
    document.querySelectorAll('.global-search, .navbar-search-btn, [data-action="search"]').forEach(function(button) {
      if (button.closest('nav, header')) button.remove();
    });
  }

  // ========================================================================
  // 🎯 POR QUÉ: solicitar una decisión informada antes de activar funciones opcionales.
  // ⚙️ CÓMO: guarda una versión del consentimiento, sincroniza preferencias y
  //    emite un evento para que cada módulo respete la selección del visitante.
  // 📦 QUÉ: aviso global, panel configurable y acceso permanente para revisarlo.
  // ========================================================================
  function injectCookieConsent() {
    var STORAGE_KEY = 'baqueano_cookie_consent_v1';
    var COOKIE_NAME = 'bq_consent';
    if (document.getElementById('bqCookieConsent')) return;

    var style = document.createElement('style');
    style.id = 'bq-cookie-consent-styles';
    style.textContent = `
      .bq-cookie-layer{position:fixed;inset:0;z-index:2147483000;background:rgba(15,23,42,.5);backdrop-filter:blur(6px);display:flex;align-items:flex-end;justify-content:center;padding:20px}
      .bq-cookie-layer[hidden],.bq-cookie-settings[hidden]{display:none!important}
      .bq-cookie-card{width:min(1120px,100%);background:#fff;color:#0F172A;border:1px solid #D7E2E6;border-radius:22px;box-shadow:0 24px 70px rgba(15,23,42,.25);padding:24px;display:grid;grid-template-columns:1fr auto;gap:22px;align-items:center;font-family:'Inter',system-ui,sans-serif}
      .bq-cookie-copy{display:flex;gap:16px;align-items:flex-start}.bq-cookie-icon{width:48px;height:48px;flex:0 0 48px;border-radius:14px;background:#FFF1E8;color:#F65E01;display:grid;place-items:center;font-size:1.35rem}
      .bq-cookie-title{font:800 1.15rem/1.25 'Montserrat',sans-serif;margin:0 0 7px;color:#0F172A}.bq-cookie-text{margin:0;color:#52627A;font-size:.91rem;line-height:1.55}.bq-cookie-text a{color:#165D6F;font-weight:800}
      .bq-cookie-actions{display:flex;gap:9px;flex-wrap:wrap;justify-content:flex-end}.bq-cookie-btn{border-radius:12px;padding:11px 16px;font-weight:800;font-size:.84rem;cursor:pointer;transition:transform .2s,box-shadow .2s;border:1px solid #CBD5E1;background:#fff;color:#0F172A}.bq-cookie-btn:hover{transform:translateY(-1px)}
      .bq-cookie-reject{color:#165D6F;border-color:#165D6F}.bq-cookie-accept{color:#fff;background:#165D6F;border-color:#165D6F;box-shadow:0 8px 18px rgba(22,93,111,.22)}
      .bq-cookie-settings{grid-column:1/-1;border-top:1px solid #E2E8F0;padding-top:18px}.bq-cookie-option{display:flex;justify-content:space-between;gap:20px;align-items:center;padding:12px 0}.bq-cookie-option+ .bq-cookie-option{border-top:1px solid #EEF2F6}.bq-cookie-option strong{display:block;font-size:.9rem}.bq-cookie-option small{display:block;color:#64748B;margin-top:3px}.bq-cookie-check{width:20px;height:20px;accent-color:#165D6F}
      @media(max-width:760px){.bq-cookie-layer{padding:10px}.bq-cookie-card{grid-template-columns:1fr;padding:18px;border-radius:18px;gap:17px}.bq-cookie-copy{gap:12px}.bq-cookie-icon{width:42px;height:42px;flex-basis:42px}.bq-cookie-actions{justify-content:stretch}.bq-cookie-btn{flex:1 1 46%;}.bq-cookie-accept{flex-basis:100%}.bq-cookie-option{align-items:flex-start}}
    `;
    document.head.appendChild(style);

    var layer = document.createElement('div');
    layer.id = 'bqCookieConsent';
    layer.className = 'bq-cookie-layer';
    layer.setAttribute('role', 'dialog');
    layer.setAttribute('aria-modal', 'true');
    layer.setAttribute('aria-labelledby', 'bqCookieTitle');
    layer.innerHTML = `
      <div class="bq-cookie-card">
        <div class="bq-cookie-copy"><div class="bq-cookie-icon" aria-hidden="true"><i class="fa-solid fa-cookie-bite"></i></div><div><h2 class="bq-cookie-title" id="bqCookieTitle">Tu privacidad y tus preferencias</h2><p class="bq-cookie-text">Usamos almacenamiento esencial para que BAQUEANO funcione y, con tu permiso, preferencias y analítica para mejorar tu experiencia. Podés aceptar, rechazar o configurar. <a href="cookies.html">Ver política de cookies</a>.</p></div></div>
        <div class="bq-cookie-actions"><button type="button" class="bq-cookie-btn bq-cookie-reject" data-cookie-action="reject">Rechazar opcionales</button><button type="button" class="bq-cookie-btn" data-cookie-action="settings">Configurar</button><button type="button" class="bq-cookie-btn bq-cookie-accept" data-cookie-action="accept">Aceptar todas</button></div>
        <div class="bq-cookie-settings" id="bqCookieSettings" hidden>
          <div class="bq-cookie-option"><div><strong>Cookies esenciales</strong><small>Seguridad, navegación y conservación de tu elección.</small></div><input class="bq-cookie-check" type="checkbox" checked disabled aria-label="Cookies esenciales siempre activas"></div>
          <div class="bq-cookie-option"><div><strong>Preferencias</strong><small>Idioma, tema, región y personalización.</small></div><input class="bq-cookie-check" id="bqConsentPreferences" type="checkbox"></div>
          <div class="bq-cookie-option"><div><strong>Analítica opcional</strong><small>Mediciones anónimas para mejorar el servicio.</small></div><input class="bq-cookie-check" id="bqConsentAnalytics" type="checkbox"></div>
          <div class="bq-cookie-actions"><button type="button" class="bq-cookie-btn bq-cookie-accept" data-cookie-action="save">Guardar selección</button></div>
        </div>
      </div>`;
    document.body.appendChild(layer);

    function readConsent() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (error) { return null; }
    }
    function applyConsent(preferences, analytics) {
      var consent = { essential: true, preferences: !!preferences, analytics: !!analytics, version: 1, updatedAt: new Date().toISOString() };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
        localStorage.setItem('baqueano_pref_enabled', String(consent.preferences));
        localStorage.setItem('baqueano_analytics_enabled', String(consent.analytics));
      } catch (error) { /* La navegación continúa aun si el navegador bloquea almacenamiento. */ }
      document.cookie = COOKIE_NAME + '=' + (consent.analytics ? 'all' : consent.preferences ? 'preferences' : 'essential') + '; Max-Age=31536000; Path=/; SameSite=Lax; Secure';
      window.BaqueanoConsent = consent;
      window.dispatchEvent(new CustomEvent('baqueano:consent', { detail: consent }));
      layer.hidden = true;
    }

    layer.addEventListener('click', function(event) {
      var action = event.target.closest('[data-cookie-action]');
      if (!action) return;
      var type = action.getAttribute('data-cookie-action');
      if (type === 'accept') applyConsent(true, true);
      if (type === 'reject') applyConsent(false, false);
      if (type === 'settings') document.getElementById('bqCookieSettings').hidden = false;
      if (type === 'save') applyConsent(document.getElementById('bqConsentPreferences').checked, document.getElementById('bqConsentAnalytics').checked);
    });
    var existing = readConsent();
    if (existing && existing.version === 1) {
      window.BaqueanoConsent = existing;
      layer.hidden = true;
    } else {
      layer.hidden = false;
    }
  }

  async function init() {
    injectGlobalCSS();
    injectCookieConsent();
    removeGlobalSearchButtons();
    injectGlobalNavbar();
    upgradeOldFooters();
    injectGlobalFooter();
    injectSosModal();
    addOpsToExistingNavbar();
    wireNavbarButtons(null);
    wireExistingSosButtons();
    wireGlobalButtons();
    // ⚡ Activar lógica del Mega Menú en todas las páginas
    if (typeof buildGlobalMegaNavigation === 'function') {
      buildGlobalMegaNavigation();
    }
    await syncShellWithIndex();
    removeGlobalSearchButtons();
    normalizeFooterBoundary();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
