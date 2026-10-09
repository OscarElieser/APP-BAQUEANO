// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — INYECTOR UNIVERSAL DE COMPONENTES (global-injector.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Garantizar que el 100% de las páginas del ecosistema BAQUEANO tengan:
//   * El mismo navbar oficial (el enlace al Ops Center solo aparece a cuentas autorizadas)
//   * El mismo footer oficial con 5 columnas, redes sociales y sello Nicaragua Auténtica
//   * Todos los botones interactivos funcionales (SOS, descarga APK, compartir)
//   * Formularios de contacto consistentes con temática BAQUEANO
// - Eliminar la deuda técnica de footers OLD y navs MISSING en 22 páginas del sitio.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Se ejecuta automáticamente al cargarse cualquier página del sitio.
// - Menú y footer se imponen SIEMPRE desde este archivo: una sola fuente para todo
//   el portal público. admin.html (Ops Center) queda fuera y conserva el suyo.
// - Orden del shell: este archivo coloca el armazón del menú y el pie, emite
//   `baqueano:shell-ready`, y navigation.js monta UNA vez el contenido y los
//   controles del menú; user-session.js pinta el estado de sesión y el rol.
// - Página pública nueva: basta con incluir, al final del <body>,
//     <script src="js/navigation.js?v=20261006-reviews-1"></script>
//     <script src="js/global-injector.js"></script>
//   No hay que copiar menú, pie, idioma ni sesión.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES):
// - injectGlobalNavbar(): impone el menú único del portal (reemplaza copias locales).
// - injectGlobalFooter(): impone el pie único de 5 columnas (mismo marcado que index.html).
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
    green:  '#4A7A5A'
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
      { id: 'bq-mega-nav',  href: 'css/navigation-mega.css?v=20261004-menu-2' },
      { id: 'bq-platform-enhancements', href: 'css/platform-enhancements.css?v=20261005-a11y-1' },
      { id: 'bq-accessibility', href: 'css/accessibility.css?v=20260930-1' },
      { 
        id: 'bq-fa',        
        href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
        integrity: 'sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==',
        crossOrigin: 'anonymous'
      },
      // Dos familias del sistema (Montserrat + Plus Jakarta Sans). Si la página ya
      // pide Google Fonts en su <head>, no se repite la petición.
      { id: 'bq-fonts',     href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap' },
      // Capa de identidad "Cartografía viva": correcciones de contraste y responsive.
      { id: 'bq-identity',  href: 'css/baqueano-identity.css?v=20261006-player-1' },
      // Sistema de diseño global: SIEMPRE la última hoja. Ver css/baqueano-system.css
      { id: 'bq-system',    href: 'css/baqueano-system.css?v=20261005-a11y-3' }
    ];
    needed.forEach(function(css) {
      if (css.id === 'bq-fonts' && document.querySelector('link[href*="fonts.googleapis.com/css2"]')) return;
      var cleanPath = css.href.split('?')[0];
      if (document.querySelector('link[href*="' + cleanPath + '"]')) return;
      if (!document.getElementById(css.id)) {
        var link = document.createElement('link');
        link.id = css.id; link.rel = 'stylesheet'; link.href = css.href;
        if (css.integrity) link.integrity = css.integrity;
        if (css.crossOrigin) link.crossOrigin = css.crossOrigin;
        document.head.appendChild(link);
      }
    });
    // El sistema enlazado en el <head> quedaría antes de las hojas recién
    // inyectadas; se mueve al final para que siga siendo la última palabra.
    var system = document.getElementById('bq-system');
    if (system && system !== document.head.lastElementChild) document.head.appendChild(system);

    // Estilos inline mínimos para footer y utilidades globales (navbar controlado por navigation-mega.css)
    if (!document.getElementById('bq-global-injector-styles')) {
      var style = document.createElement('style');
      style.id = 'bq-global-injector-styles';
      style.textContent = `
        /* ── Footer Oficial Baqueano ── */
        .bq-global-footer {
          background: #081827; color: #94A3B8;
          font-family: 'Aristotelica Pro', 'Plus Jakarta Sans', system-ui, sans-serif;
          border-top: 1px solid rgba(255,255,255,.06);
          margin-top: 60px;
        }
        .bq-footer-inner { max-width: 1380px; margin: 0 auto; padding: 60px 24px 0; }
        .bq-footer-grid { display: grid; grid-template-columns: 260px repeat(4,1fr); gap: 40px; }
        @media (max-width: 900px) { .bq-footer-grid { grid-template-columns: 1fr 1fr; gap: 30px; } }
        @media (max-width: 560px) { .bq-footer-grid { grid-template-columns: 1fr; } }
        .bq-footer-brand a { display: flex; align-items: center; gap: 12px; text-decoration: none; margin-bottom: 14px; }
        .bq-footer-brand img.bq-footer-logo-icon { height: 48px; width: 48px; object-fit: contain; }
        .bq-footer-brand-text { display: flex; flex-direction: column; }
        .bq-footer-brand-name { font-family: 'League Spartan', sans-serif; font-size: 1.35rem; font-weight: 900; color: #FFFFFF; line-height: 1; letter-spacing: 0.08em; }
        .bq-footer-brand-sub  { font-size: .68rem; color: #F4E6C1; letter-spacing: .12em; font-weight: 700; margin-top: 4px; text-transform: uppercase; }
        .bq-footer-tagline { font-size: .82rem; color: #64748B; margin-bottom: 18px; text-transform: uppercase; letter-spacing: .06em; font-weight: 700; }
        .bq-footer-socials { display: flex; gap: 10px; margin-bottom: 16px; }
        .bq-footer-autentica-badge { width: 175px; max-width: 100%; height: auto; object-fit: contain; display: block; margin-top: 16px; }
        .bq-social-btn {
          width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.1); display: flex; align-items: center;
          justify-content: center; color: #94A3B8; text-decoration: none; font-size: .9rem; transition: all .2s;
        }
        .bq-social-btn:hover { background: #F65E01; border-color: #F65E01; color: #FFF; }
        .bq-footer-col h4 { font-family: 'League Spartan', sans-serif; font-size: .82rem; font-weight: 800; color: #F4E6C1; text-transform: uppercase; letter-spacing: .1em; margin: 0 0 6px; }
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
        .bq-stamp-title { font-family: 'League Spartan', sans-serif; font-size: .9rem; font-weight: 900; color: #F4E6C1; }
        .bq-stamp-sub   { font-size: .65rem; color: #64748B; text-transform: uppercase; letter-spacing: .1em; }

        /* ── Botón OPS Center Flotante ── */
        /* Con el pie a la vista, la burbuja de BAQUI no tapa sus enlaces. */
        html.bq-footer-visible #bqSuggestion { opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; transition: opacity .2s ease, visibility 0s linear .2s; }
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
          background: #0B253A; border-radius: 22px; padding: 28px; max-width: 680px; width: 100%; max-height: min(88vh,760px); overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,.6); border: 1px solid rgba(239,68,68,.3);
        }
        .bq-sos-title { font-family: 'League Spartan', sans-serif; font-size: 1.2rem; font-weight: 900; color: #FFF; margin: 0 0 6px; }
        .bq-sos-sub { color: #94A3B8; font-size: .85rem; margin-bottom: 20px; }
        .bq-sos-location { background:rgba(239,68,68,.09);border:1px solid rgba(239,68,68,.24);border-radius:12px;padding:13px 14px;margin-bottom:16px;font-size:.82rem;color:#CBD5E1;display:flex;gap:10px;align-items:flex-start; }
        .bq-sos-location strong{display:block;color:#FFF;margin-bottom:3px}.bq-sos-location a{color:#7DD3FC;font-weight:700;text-decoration:none}.bq-sos-btns { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 10px; }
        .bq-sos-call {
          display: flex; align-items: center; justify-content: flex-start;
          gap: 10px; padding: 13px; border-radius: 12px; text-decoration: none;
          font-weight: 700; font-size: .9rem; font-family: 'League Spartan', sans-serif; transition: opacity .2s;
        }
        .bq-sos-call:hover { opacity: .85; }
        .bq-sos-call.police { background: rgba(59,130,246,.2); color: #60A5FA; border: 1px solid rgba(59,130,246,.3); }
        .bq-sos-call.medical { background: rgba(239,68,68,.2); color: #F87171; border: 1px solid rgba(239,68,68,.3); }
        .bq-sos-call.fire { background:rgba(246,94,1,.16);color:#FDBA74;border:1px solid rgba(246,94,1,.35) }
        .bq-sos-call.general { background:rgba(16,185,129,.14);color:#6EE7B7;border:1px solid rgba(16,185,129,.3) }
        .bq-sos-call span{display:block}.bq-sos-call small{display:block;font:500 .68rem/1.3 'Aristotelica Pro', 'Plus Jakarta Sans',sans-serif;color:#94A3B8;margin-top:2px}
        .bq-sos-tools{display:flex;gap:9px;flex-wrap:wrap;margin:14px 0}.bq-sos-tool{flex:1;min-width:180px;border:1px solid rgba(148,163,184,.25);background:rgba(255,255,255,.05);color:#E2E8F0;border-radius:11px;padding:11px 13px;font-weight:750;cursor:pointer;text-align:center}
        .bq-sos-guide{margin-top:17px;padding-top:16px;border-top:1px solid rgba(148,163,184,.16)}.bq-sos-guide h3{font:800 .88rem/1.3 'League Spartan',sans-serif;color:#F4E6C1;margin:0 0 9px}.bq-sos-guide ol{margin:0;padding-left:20px;color:#CBD5E1;font-size:.78rem;line-height:1.55}.bq-sos-note{margin:12px 0 0;color:#94A3B8;font-size:.7rem;line-height:1.45}
        .bq-sos-close {
          float: right; background: none; border: none; color: #64748B; font-size: 1.5rem;
          cursor: pointer; margin-top: -8px; transition: color .2s;
        }
        .bq-sos-close:hover { color: #FFF; }
        @media(max-width:560px){.bq-sos-box{padding:20px}.bq-sos-btns{grid-template-columns:1fr}.bq-sos-tool{min-width:100%}}
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
    var colors = { success: '#4A7A5A', info: '#165D6F', warning: '#F65E01', error: '#EF4444' };
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
  // 🎯 POR QUÉ: el propietario exige UN solo menú para todo el portal público
  //    (el Ops Center tiene el suyo). Varias páginas traían copias antiguas en
  //    su HTML: sin logo, con enlaces distintos y botones extra.
  // ⚙️ CÓMO: se descarta cualquier menú que traiga la página y se coloca el
  //    armazón canónico; navigation.js (buildGlobalMegaNavigation) lo llena con
  //    los enlaces, el mega menú "Más" y las acciones (SOS, sesión, idioma).
  //    Solo se conserva la clase bq-nav-over-video, que es de comportamiento
  //    visual sobre héroes con video y no cambia el contenido.
  // 📦 QUÉ: menú idéntico en todas las páginas, una sola vez en el documento.
  var NAV_SELECTOR = '#mainNavbar, nav.main-navbar, nav.main-navbar-exact';

  function injectGlobalNavbar() {
    var existing = Array.prototype.slice.call(document.querySelectorAll(NAV_SELECTOR));
    var overVideo = existing.some(function (n) { return n.classList.contains('bq-nav-over-video'); });

    var legacyPageHeader = document.querySelector('.nav-404-header');
    if (legacyPageHeader) {
      legacyPageHeader.hidden = true;
      legacyPageHeader.setAttribute('aria-hidden', 'true');
    }

    var nav = document.createElement('nav');
    nav.className = 'main-navbar-exact main-navbar' + (overVideo ? ' bq-nav-over-video' : '');
    nav.id = 'mainNavbar';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Navegación principal');
    nav.innerHTML = bqNavbarHTML();

    if (existing.length) {
      existing[0].replaceWith(nav);
      existing.slice(1).forEach(function (n) { n.remove(); });
    } else {
      document.body.insertBefore(nav, document.body.firstChild);
    }
  }

  function bqNavbarHTML() {
    return '<div class="exact-container nav-inner">' +
      '<a href="index.html" class="exact-nav-brand navbar-brand-pill" aria-label="Baqueano Nicaragua — Inicio">' +
        '<img src="assets/images/LOGOS/baqueano_icono_500x386-blanco.png" alt="Baqueano" class="exact-nav-logo navbar-brand-logo" decoding="async" width="500" height="386">' +
        '<div class="exact-nav-brand-text navbar-brand-text">' +
          '<span class="exact-nav-title navbar-brand-title">BAQUEANO</span>' +
          '<span class="exact-nav-tagline navbar-brand-sub">NICARAGUA AUTÉNTICA</span>' +
        '</div>' +
      '</a>' +
      '<div class="exact-nav-menu nav-links-menu" id="navLinksMenu" role="menubar"></div>' +
      '<div class="exact-nav-actions global-nav-actions"></div>' +
    '</div>';
  }

  // ── Footer único del portal ───────────────────────────────────────────────
  // 🎯 POR QUÉ: convivían cinco diseños de pie (site-footer-exact, bq-global-footer,
  //    official-footer-exact, site-footer-pro, footer-unified) y varias páginas
  //    mostraban dos pies a la vez. El portal público debe tener uno solo.
  // ⚙️ CÓMO: se retiran todos los pies institucionales que traiga la página y se
  //    agrega el pie canónico (el mismo marcado de index.html, estilado por
  //    css/pages/index-exact.css que injectGlobalCSS garantiza). No se tocan los
  //    <footer> internos de tarjetas o artículos, solo los pies de sitio.
  // 📦 QUÉ: un único pie de 5 columnas con barra de derechos en todas las páginas.
  var FOOTER_SELECTOR = '#siteFooter, .site-footer-exact, .bq-global-footer, .official-footer-exact, ' +
    '.main-footer, .site-footer-pro, .footer-unified, body > footer';

  function injectGlobalFooter() {
    document.querySelectorAll(FOOTER_SELECTOR).forEach(function (old) { old.remove(); });

    var footer = document.createElement('footer');
    footer.className = 'site-footer-exact';
    footer.id = 'siteFooter';
    footer.setAttribute('role', 'contentinfo');
    footer.innerHTML = bqFooterHTML();
    document.body.appendChild(footer);
    // 🎯 La burbuja de sugerencias de BAQUI tapaba "Cookies" y "Aviso Legal".
    // ⚙️ Mientras el pie está a la vista se marca <html>; el CSS la aparta.
    // 📦 Enlaces del footer siempre clicables.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        document.documentElement.classList.toggle('bq-footer-visible', entries.some(function (entry) { return entry.isIntersecting; }));
      }, { rootMargin: '0px 0px -40px 0px' }).observe(footer);
    }
  }

  function bqFooterLinks(title, links) {
    return '<div class="footer-nav-col"><h4>' + title + '</h4><div class="footer-accent-bar"></div><ul>' +
      links.map(function (l) { return '<li><a href="' + l[0] + '">' + l[1] + '</a></li>'; }).join('') +
      '</ul></div>';
  }

  function bqFooterHTML() {
    return '<div class="exact-container"><div class="footer-top-grid">' +
        '<div class="footer-brand-col">' +
          '<a href="index.html" class="footer-logo-row" aria-label="Baqueano Nicaragua — Inicio">' +
            '<img src="assets/logos/BAQUENO%20LOGO.png" alt="Baqueano" class="footer-logo-img" decoding="async" loading="lazy" width="21676" height="21967">' +
            '<div class="footer-brand-text-block">' +
              '<span class="footer-brand-title">BAQUEANO</span>' +
              '<span class="footer-brand-subtitle">NICARAGUA AUTÉNTICA</span>' +
            '</div>' +
          '</a>' +
          '<span class="footer-tagline-text">DESCUBRÍ LO QUE NO SALE EN EL MAPA.</span>' +
          '<div class="footer-social-row">' +
            '<a href="https://www.instagram.com/baqueano_nicaragua" target="_blank" rel="noopener noreferrer" class="footer-social-link" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>' +
            '<a href="https://www.facebook.com/share/1S71xwJKse/" target="_blank" rel="noopener noreferrer" class="footer-social-link" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>' +
            '<a href="https://www.tiktok.com/@baqueano.nicaragu?_r=1&_t=ZS-99iTnKK0i3e" target="_blank" rel="noopener noreferrer" class="footer-social-link" aria-label="TikTok"><i class="fa-brands fa-tiktok"></i></a>' +
            '<a href="https://wa.me/50584431289" target="_blank" rel="noopener noreferrer" class="footer-social-link" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>' +
          '</div>' +
        '</div>' +
        bqFooterLinks('EXPLORÁ', [['index.html', 'Inicio'], ['destinos.html', 'Destinos'], ['mapa.html', 'Mapa Interactivo'], ['experiencias.html', 'Experiencias'], ['departamento.html', 'Departamentos']]) +
        bqFooterLinks('CULTURA', [['historia.html', 'Historia &amp; Memoria'], ['gastronomia.html', 'Gastronomía Ancestral'], ['musica.html', 'Son Sonoro Folk'], ['ambiental.html', 'Custodia Ambiental'], ['aliados.html', 'Red de Aliados']]) +
        bqFooterLinks('COMUNIDAD', [['nosotros.html', 'Quiénes Somos'], ['testimonios.html', 'Experiencias de viajeros'], ['opiniones.html', 'Opiniones sobre BAQUEANO'], ['descargar.html', 'App para Android'], ['mi-negocio.html', 'Registrá tu Negocio'], ['denuncias.html', 'Canal de Denuncias'], ['perfil.html', 'Mi Perfil'], ['mi-viaje.html', 'Mi Viaje']]) +
        bqFooterLinks('LEGAL', [['terminos.html', 'Términos y Condiciones'], ['privacidad.html', 'Política de Privacidad'], ['cookies.html', 'Política de Cookies'], ['normas-comunidad.html', 'Normas de la Comunidad'], ['aviso-legal.html', 'Aviso Legal']]).replace('</ul>', '<li><a href="cookies.html#preferencias" data-cookie-open data-i18n="consent.footerLink">Configurar cookies</a></li></ul>') +
      '</div></div>' +
      '<div class="footer-bottom-bar"><div class="exact-container">' +
        '<span>&copy; 2026 BAQUEANO. Todos los derechos reservados.</span>' +
        '<span>Hecho con <i class="fa-solid fa-heart" style="color: #EF4444;"></i> en Nicaragua</span>' +
      '</div></div>';
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
        '<p class="bq-sos-sub">Acceso inmediato a servicios de emergencia en Nicaragua. Presioná un contacto para llamar.</p>' +
        '<div class="bq-sos-location">' +
          '<i class="fa-solid fa-satellite-dish" style="color:#F65E01;margin-top:3px"></i><div><strong id="bqSosGpsStatus">Obteniendo ubicación segura…</strong><span id="bqSosCoordinates">Permití el acceso al GPS para compartir coordenadas exactas.</span><br><a id="bqSosMapLink" href="https://maps.google.com/?q=Nicaragua" target="_blank" rel="noopener">Abrir ubicación en el mapa</a></div>' +
        '</div>' +
        '<div class="bq-sos-btns">' +
          '<a href="tel:118" class="bq-sos-call police"><i class="fa-solid fa-shield"></i><span>Policía Nacional<small>Emergencias: 118</small></span></a>' +
          '<a href="tel:128" class="bq-sos-call medical"><i class="fa-solid fa-truck-medical"></i><span>Ambulancia<small>Atención prehospitalaria: 128</small></span></a>' +
          '<a href="tel:115" class="bq-sos-call fire"><i class="fa-solid fa-fire-extinguisher"></i><span>Bomberos<small>Incendios y rescate: 115</small></span></a>' +
          '<a href="tel:911" class="bq-sos-call general"><i class="fa-solid fa-tower-broadcast"></i><span>Emergencia general<small>Línea alternativa: 911</small></span></a>' +
        '</div>' +
        '<div class="bq-sos-tools"><button type="button" class="bq-sos-tool" onclick="bqShareSosLocation()"><i class="fa-solid fa-location-arrow"></i> Compartir mi ubicación</button><button type="button" class="bq-sos-tool" onclick="bqCopySosLocation()"><i class="fa-regular fa-copy"></i> Copiar coordenadas</button></div>' +
        '<div class="bq-sos-guide"><h3><i class="fa-solid fa-list-check"></i> Mientras llega la ayuda</h3><ol><li>Indicá tu ubicación, puntos de referencia y tipo de emergencia.</li><li>Mantené la línea disponible y seguí las instrucciones del operador.</li><li>No movás a una persona lesionada salvo que exista peligro inmediato.</li><li>En una zona remota, compartí estas coordenadas con un contacto de confianza.</li></ol><p class="bq-sos-note">La cobertura y los tiempos de respuesta pueden variar según el territorio y la señal disponible.</p></div>' +
      '</div>';
    modal.addEventListener('click', function(e) { if (e.target === modal) bqCloseSos(); });
    var footerBoundary = document.querySelector('#siteFooter, .site-footer-exact, .bq-global-footer, footer');
    if (footerBoundary && footerBoundary.parentNode) footerBoundary.parentNode.insertBefore(modal, footerBoundary);
    else document.body.appendChild(modal);
  }

  window.bqOpenSos = function(e) {
    if (e) e.preventDefault();
    var m = document.getElementById('bqSosModal');
    if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; bqLocateForSos(); }
  };

  // 🎯 POR QUÉ: una ubicación real reduce ambigüedad durante una emergencia.
  // ⚙️ CÓMO: solicita geolocalización de alta precisión solo al abrir SOS.
  // 📦 QUÉ: coordenadas, mapa, copia y uso del diálogo nativo para compartir.
  var bqSosPosition = null;
  function bqLocateForSos() {
    var status = document.getElementById('bqSosGpsStatus');
    var coords = document.getElementById('bqSosCoordinates');
    var map = document.getElementById('bqSosMapLink');
    if (!navigator.geolocation) { if (status) status.textContent = 'GPS no disponible'; return; }
    if (status) status.textContent = 'Solicitando ubicación…';
    navigator.geolocation.getCurrentPosition(function(position) {
      var lat = Number(position.coords.latitude).toFixed(6);
      var lng = Number(position.coords.longitude).toFixed(6);
      bqSosPosition = { lat: lat, lng: lng, accuracy: Math.round(position.coords.accuracy || 0) };
      if (status) status.textContent = 'Ubicación lista para compartir';
      if (coords) coords.textContent = lat + ', ' + lng + ' · Precisión aproximada: ' + bqSosPosition.accuracy + ' m';
      if (map) map.href = 'https://maps.google.com/?q=' + encodeURIComponent(lat + ',' + lng);
    }, function() {
      if (status) status.textContent = 'Ubicación no autorizada';
      if (coords) coords.textContent = 'Podés llamar igualmente y describir un punto de referencia cercano.';
    }, { enableHighAccuracy: true, timeout: 9000, maximumAge: 30000 });
  }
  window.bqCopySosLocation = function() {
    if (!bqSosPosition) { bqToast('Activá el permiso de ubicación para obtener coordenadas.', 'warning'); return; }
    bqCopy(bqSosPosition.lat + ', ' + bqSosPosition.lng);
  };
  window.bqShareSosLocation = function() {
    if (!bqSosPosition) { bqToast('Activá el permiso de ubicación para compartirla.', 'warning'); return; }
    var url = 'https://maps.google.com/?q=' + encodeURIComponent(bqSosPosition.lat + ',' + bqSosPosition.lng);
    if (navigator.share) navigator.share({ title: 'Mi ubicación de emergencia', text: 'Necesito asistencia. Mi ubicación actual:', url: url }).catch(function() {});
    else bqCopy(url);
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
  // 🎯 POR QUÉ: antes interceptaba TODOS los formularios y mostraba "¡Mensaje
  //    enviado!" aunque fueran el login, una búsqueda o un registro con su
  //    propia lógica: el usuario veía un éxito falso.
  // ⚙️ CÓMO: solo actúa en formularios sin destino propio (sin action, sin
  //    onsubmit, sin role=search) y fuera del panel de acceso; los formularios
  //    que su página ya procesa en JS se listan en OWN_SUBMIT.
  // 📦 QUÉ: confirmación visual solo donde no existe otro manejador.
  var OWN_SUBMIT = ['bqReportForm', 'businessRegForm', 'registerBusinessForm', 'helpSearchForm', 'bizRegisterForm', 'ecoReportForm',
    'baqueanoContactForm', 'ambientalReportForm', 'ecoLookupForm', 'bzaForm', 'prForm', 'bqForm'];
  function upgradeContactForms() {
    document.querySelectorAll('form:not([data-bq-wired])').forEach(function(form) {
      if (form.hasAttribute('action') || form.hasAttribute('onsubmit') || form.getAttribute('role') === 'search' ||
          form.classList.contains('bq-auth-form') || form.closest('#mainNavbar') || OWN_SUBMIT.indexOf(form.id) !== -1 ||
          // 2026-10-07: el chat de BAQÜI tiene su propio envío. Si el servidor tardaba, este aviso se
          // disparaba igual y a los 2,2 s mandaba a la persona a nosotros.html en plena conversación.
          form.closest('#baqueanoAssistantBox')) return;
      form.setAttribute('data-bq-wired', '1');
      // 2026-10-06: ya no se simula "¡Mensaje enviado!". Un formulario sin lógica propia no envía
      // nada a ningún lado, así que se dice la verdad y se ofrece el canal real (nosotros.html → Supabase).
      form.addEventListener('submit', function(e) {
        if (form.hasAttribute('data-intake')) return;
        e.preventDefault();
        var t = window.BaqueanoLanguage && window.BaqueanoLanguage.t ? function(k, f) { return window.BaqueanoLanguage.t(k, { fallback: f }); } : function(k, f) { return f; };
        bqToast(t('intake.formUnavailable', 'Este formulario todavía no envía datos. Escribinos desde Contacto y te respondemos.'), 'warning');
        setTimeout(function() { window.location.href = 'nosotros.html#contacto'; }, 2200);
      });
    });
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
  // 🎯 POR QUÉ: buscador global DENTRO de BAQUEANO (destinos, departamentos,
  //    categorías, platos, artistas y páginas) con enlace directo al punto.
  // ⚙️ CÓMO: la lógica vive en js/global-search.js (índice generado desde los
  //    catálogos reales: data/search-index.json). Aquí solo se carga y, si
  //    alguien envía un buscador antes de que termine de cargar, se guarda
  //    la consulta para resolverla al llegar.
  // 📦 QUÉ: window.BaqueanoSiteSearch (open, go, search) en todas las páginas.
  // ========================================================================
  function initInternalSiteSearch() {
    if (!document.querySelector('script[data-bq-global-search]')) {
      var searchScript = document.createElement('script');
      searchScript.src = 'js/global-search.js?v=20261004-2';
      searchScript.defer = true;
      searchScript.dataset.bqGlobalSearch = 'true';
      document.body.appendChild(searchScript);
    }
    document.querySelectorAll('form.hero-exact-search, form[data-bq-global-search]').forEach(function(form) {
      if (form.dataset.bqSearchQueue === '1') return;
      form.dataset.bqSearchQueue = '1';
      form.addEventListener('submit', function(event) {
        if (window.BaqueanoSiteSearch && window.BaqueanoSiteSearch.__v2) return;
        event.preventDefault();
        var input = form.querySelector('input[type="search"], input[name="q"], input[type="text"]');
        window.__bqPendingSearch = input ? input.value : '';
      });
    });
  }

  // ========================================================================
  // 🎯 POR QUÉ: solicitar una decisión informada antes de activar funciones opcionales.
  // ⚙️ CÓMO: guarda una versión del consentimiento, sincroniza preferencias y
  //    emite un evento para que cada módulo respete la selección del visitante.
  // 📦 QUÉ: aviso global, panel configurable y acceso permanente para revisarlo.
  // ========================================================================
  // ========================================================================
  // 🎯 POR QUÉ: el buscador debe llevar "directo al punto": buscar "Somoto",
  //    "Gallo Pinto" o "Camilo Zapata" no puede dejar al visitante al inicio de
  //    una página larga buscando a ojo.
  // ⚙️ CÓMO: los enlaces del índice llevan `ir=<nombre>`. Al cargar, se busca
  //    el título visible cuyo texto coincide (exacto primero, luego el más
  //    parecido), esperando con MutationObserver a que la página termine de
  //    dibujar su contenido dinámico (máx. 8 s). Se centra su tarjeta y se
  //    resalta 3 s; sin animación con "reducir movimiento". Solo lee texto: el
  //    parámetro nunca se inserta como HTML.
  // 📦 QUÉ: initSearchSpotlight() en todas las páginas públicas.
  // ========================================================================
  function initSearchSpotlight() {
    var target;
    try { target = new URLSearchParams(window.location.search).get('ir'); } catch (error) { return; }
    target = normalizeSpot(target);
    if (!target || target.length < 2) return;
    var EXCLUDE = '#mainNavbar, header, footer, .footer-unified, #bqGlobalSearch, #bqThumbBar, #bqCookieConsent, script, style, noscript, [hidden], [aria-hidden="true"]';
    var TITLES = 'h1, h2, h3, h4, h5, .dish-title, .dept-item-title, [class*="title"], [class*="name"], figcaption, strong';
    var CARD = 'article, li, .dept-gastro-item, .dept-place-item, [class*="card"], [class*="item"]';

    function find() {
      var best = null;
      var bestScore = 0;
      document.querySelectorAll(TITLES).forEach(function(el) {
        if (el.closest(EXCLUDE) || !el.getClientRects().length) return;
        var text = normalizeSpot(el.textContent);
        if (!text || text.length > 160) return;
        var score = text === target ? 3 : text.indexOf(target) === 0 ? 2 : text.indexOf(target) > 0 ? 1 : 0;
        // Título más corto que el nombre buscado ("Vigorón" ↔ "Vigorón Granadino").
        if (!score && text.length >= 6 && target.indexOf(text) === 0) score = 1;
        if (!score) return;
        // Entre empates gana el texto más corto (el título, no un párrafo).
        score = score * 1000 - text.length;
        if (score > bestScore) { bestScore = score; best = el; }
      });
      return best;
    }

    function reveal(el) {
      // Resalta la tarjeta que contiene el título si cabe en pantalla.
      var box = el.closest(CARD);
      if (!box || box.getBoundingClientRect().height > window.innerHeight * 0.8) box = el;
      if (!document.getElementById('bq-spotlight-styles')) {
        var style = document.createElement('style');
        style.id = 'bq-spotlight-styles';
        style.textContent = '.bq-spotlight{outline:3px solid #F65E01;outline-offset:4px;border-radius:12px;animation:bqSpot 1.2s ease-in-out 2}@keyframes bqSpot{50%{outline-color:rgba(246,94,1,.25)}}@media (prefers-reduced-motion:reduce){.bq-spotlight{animation:none}}';
        document.head.appendChild(style);
      }
      var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      box.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      box.classList.add('bq-spotlight');
      if (!box.hasAttribute('tabindex')) box.setAttribute('tabindex', '-1');
      try { box.focus({ preventScroll: true }); } catch (error) { /* foco opcional */ }
      window.setTimeout(function() { box.classList.remove('bq-spotlight'); }, 3200);
    }

    var done = false;
    var observer = null;
    function attempt() {
      if (done) return;
      var el = find();
      if (!el) return;
      done = true;
      if (observer) observer.disconnect();
      // Un fotograma extra deja que la página termine de maquetar.
      window.requestAnimationFrame(function() { reveal(el); });
    }
    attempt();
    if (done) return;
    var pending = false;
    observer = new MutationObserver(function() {
      if (pending) return;
      pending = true;
      window.setTimeout(function() { pending = false; attempt(); }, 120);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(function() { if (observer) observer.disconnect(); done = true; }, 8000);
  }

  function normalizeSpot(value) {
    return String(value || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function injectCookieConsent() {
    var STORAGE_KEY = 'baqueano_cookie_consent_v1';
    var COOKIE_NAME = 'bq_consent';
    if (document.getElementById('bqCookieConsent')) return;

    var style = document.createElement('style');
    style.id = 'bq-cookie-consent-styles';
    style.textContent = `
      .bq-cookie-layer{position:fixed;inset:0;z-index:2147483000;background:rgba(15,23,42,.5);backdrop-filter:blur(6px);display:flex;align-items:flex-end;justify-content:center;padding:20px}
      .bq-cookie-layer[hidden],.bq-cookie-settings[hidden]{display:none!important}
      .bq-cookie-card{width:min(1120px,100%);background:#fff;color:#0F172A;border:1px solid #D7E2E6;border-radius:22px;box-shadow:0 24px 70px rgba(15,23,42,.25);padding:24px;display:grid;grid-template-columns:1fr auto;gap:22px;align-items:center;font-family:'Aristotelica Pro', 'Plus Jakarta Sans',system-ui,sans-serif}
      .bq-cookie-copy{display:flex;gap:16px;align-items:flex-start}.bq-cookie-icon{width:48px;height:48px;flex:0 0 48px;border-radius:14px;background:#FFF1E8;color:#F65E01;display:grid;place-items:center;font-size:1.35rem}
      .bq-cookie-title{font:800 1.15rem/1.25 'League Spartan',sans-serif;margin:0 0 7px;color:#0F172A}.bq-cookie-text{margin:0;color:#52627A;font-size:.91rem;line-height:1.55}.bq-cookie-text a{color:#165D6F;font-weight:800}.bq-cookie-version{display:block;margin-top:6px;color:#475569;font-size:.78rem}.bq-cookie-option label{cursor:pointer}.bq-cookie-btn:focus-visible,.bq-cookie-check:focus-visible{outline:3px solid #F65E01;outline-offset:2px}
      .bq-cookie-actions{display:flex;gap:9px;flex-wrap:wrap;justify-content:flex-end}.bq-cookie-btn{border-radius:12px;padding:11px 16px;font-weight:800;font-size:.84rem;cursor:pointer;transition:transform .2s,box-shadow .2s;border:1px solid #CBD5E1;background:#fff;color:#0F172A}.bq-cookie-btn:hover{transform:translateY(-1px)}
      .bq-cookie-reject{color:#165D6F;border-color:#165D6F}.bq-cookie-accept{color:#fff;background:#165D6F;border-color:#165D6F;box-shadow:0 8px 18px rgba(22,93,111,.22)}
      .bq-cookie-settings{grid-column:1/-1;border-top:1px solid #E2E8F0;padding-top:18px}.bq-cookie-option{display:flex;justify-content:space-between;gap:20px;align-items:center;padding:12px 0}.bq-cookie-option+ .bq-cookie-option{border-top:1px solid #EEF2F6}.bq-cookie-option strong{display:block;font-size:.9rem}.bq-cookie-option small{display:block;color:#64748B;margin-top:3px}.bq-cookie-check{width:20px;height:20px;accent-color:#165D6F}
      @media(max-width:760px){.bq-cookie-layer{padding:10px}.bq-cookie-card{grid-template-columns:1fr;padding:18px;border-radius:18px;gap:17px}.bq-cookie-copy{gap:12px}.bq-cookie-icon{width:42px;height:42px;flex-basis:42px}.bq-cookie-actions{justify-content:stretch}.bq-cookie-btn{flex:1 1 46%;}.bq-cookie-accept{flex-basis:100%}.bq-cookie-option{align-items:flex-start}}
    `;
    document.head.appendChild(style);

    // 🎯 Requisito 3 del checklist 20/20: consentimiento real, reversible y en 6 idiomas.
    // ⚙️ Textos con data-i18n (global-language.js los traduce); la política tiene
    //    versión y fecha; la analítica (js/baqueano-analytics.js) solo se carga con
    //    consentimiento y deja de enviar al retirarlo. Se reabre desde el footer
    //    ([data-cookie-open]) y desde cookies.html.
    // 📦 window.BaqueanoCookieConsent = { open, read, policyVersion }.
    var POLICY_VERSION = '2026-09-26';
    var layer = document.createElement('div');
    layer.id = 'bqCookieConsent';
    layer.className = 'bq-cookie-layer';
    layer.setAttribute('role', 'dialog');
    layer.setAttribute('aria-modal', 'true');
    layer.setAttribute('aria-labelledby', 'bqCookieTitle');
    layer.setAttribute('aria-describedby', 'bqCookieText');
    layer.innerHTML = `
      <div class="bq-cookie-card">
        <div class="bq-cookie-copy"><div class="bq-cookie-icon" aria-hidden="true"><i class="fa-solid fa-cookie-bite"></i></div><div><h2 class="bq-cookie-title" id="bqCookieTitle" data-i18n="consent.title">Tu privacidad y tus preferencias</h2><p class="bq-cookie-text" id="bqCookieText"><span data-i18n="consent.text">Usamos almacenamiento esencial para que BAQUEANO funcione y, con tu permiso, preferencias y analítica para mejorar tu experiencia. Podés aceptar, rechazar o configurar.</span> <a href="cookies.html" data-i18n="consent.policyLink">Ver política de cookies</a>. <small class="bq-cookie-version" data-i18n="consent.policyDate">Política vigente desde el 26 de septiembre de 2026.</small></p></div></div>
        <div class="bq-cookie-actions"><button type="button" class="bq-cookie-btn bq-cookie-reject" data-cookie-action="reject" data-i18n="consent.reject">Rechazar opcionales</button><button type="button" class="bq-cookie-btn" data-cookie-action="settings" aria-controls="bqCookieSettings" aria-expanded="false" data-i18n="consent.settings">Configurar</button><button type="button" class="bq-cookie-btn bq-cookie-accept" data-cookie-action="accept" data-i18n="consent.accept">Aceptar todas</button></div>
        <div class="bq-cookie-settings" id="bqCookieSettings" hidden>
          <div class="bq-cookie-option"><div><strong data-i18n="consent.essentialTitle">Cookies esenciales</strong><small data-i18n="consent.essentialDesc">Seguridad, navegación y conservación de tu elección.</small></div><input class="bq-cookie-check" type="checkbox" checked disabled data-i18n-aria-label="consent.essentialAria" aria-label="Cookies esenciales siempre activas"></div>
          <div class="bq-cookie-option"><label for="bqConsentPreferences"><strong data-i18n="consent.preferencesTitle">Preferencias</strong><small data-i18n="consent.preferencesDesc">Idioma, tema, región y personalización.</small></label><input class="bq-cookie-check" id="bqConsentPreferences" type="checkbox"></div>
          <div class="bq-cookie-option"><label for="bqConsentAnalytics"><strong data-i18n="consent.analyticsTitle">Analítica opcional</strong><small data-i18n="consent.analyticsDesc">Mediciones anónimas para mejorar el servicio.</small></label><input class="bq-cookie-check" id="bqConsentAnalytics" type="checkbox"></div>
          <div class="bq-cookie-actions"><button type="button" class="bq-cookie-btn bq-cookie-accept" data-cookie-action="save" data-i18n="consent.save">Guardar selección</button></div>
        </div>
      </div>`;
    document.body.appendChild(layer);

    function readConsent() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (error) { return null; }
    }
    function loadAnalytics() {
      if (document.querySelector('script[data-baqueano-analytics]')) return;
      var script = document.createElement('script');
      script.src = 'js/baqueano-analytics.js?v=20261005-1';
      script.defer = true;
      script.dataset.baqueanoAnalytics = 'true';
      document.body.appendChild(script);
    }
    function honorConsent(consent) {
      window.BaqueanoConsent = consent;
      if (consent && consent.analytics) { loadAnalytics(); return; }
      // Retirar la analítica también borra el identificador anónimo de este navegador.
      try { localStorage.removeItem('baqueano_anonymous_id'); sessionStorage.removeItem('baqueano_session_id'); } catch (error) { /* sin almacenamiento */ }
    }
    function applyConsent(preferences, analytics) {
      var consent = { essential: true, preferences: !!preferences, analytics: !!analytics, version: 1, policyVersion: POLICY_VERSION, updatedAt: new Date().toISOString() };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
        localStorage.setItem('baqueano_pref_enabled', String(consent.preferences));
        localStorage.setItem('baqueano_analytics_enabled', String(consent.analytics));
      } catch (error) { /* La navegación continúa aun si el navegador bloquea almacenamiento. */ }
      document.cookie = COOKIE_NAME + '=' + (consent.analytics ? 'all' : consent.preferences ? 'preferences' : 'essential') + '; Max-Age=31536000; Path=/; SameSite=Lax; Secure';
      honorConsent(consent);
      window.dispatchEvent(new CustomEvent('baqueano:consent', { detail: consent }));
      if (consent.analytics && window.BaqueanoAnalytics) window.BaqueanoAnalytics.track('consent_update', { mode: consent.preferences ? 'all' : 'analytics' });
      layer.hidden = true;
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }
    var lastFocus = null;
    function openConsent(showSettings) {
      var current = readConsent() || {};
      document.getElementById('bqConsentPreferences').checked = Boolean(current.preferences);
      document.getElementById('bqConsentAnalytics').checked = Boolean(current.analytics);
      var settings = document.getElementById('bqCookieSettings');
      settings.hidden = !showSettings;
      layer.querySelector('[data-cookie-action="settings"]').setAttribute('aria-expanded', String(!!showSettings));
      lastFocus = document.activeElement;
      layer.hidden = false;
      var first = layer.querySelector(showSettings ? '#bqConsentPreferences' : '[data-cookie-action="reject"]');
      if (first) first.focus();
    }

    layer.addEventListener('click', function(event) {
      var action = event.target.closest('[data-cookie-action]');
      if (!action) return;
      var type = action.getAttribute('data-cookie-action');
      if (type === 'accept') applyConsent(true, true);
      if (type === 'reject') applyConsent(false, false);
      if (type === 'settings') {
        document.getElementById('bqCookieSettings').hidden = false;
        action.setAttribute('aria-expanded', 'true');
        document.getElementById('bqConsentPreferences').focus();
      }
      if (type === 'save') applyConsent(document.getElementById('bqConsentPreferences').checked, document.getElementById('bqConsentAnalytics').checked);
    });
    // Reabrir: enlace del footer, botón de cookies.html o cualquier [data-cookie-open].
    document.addEventListener('click', function(event) {
      var trigger = event.target.closest && event.target.closest('[data-cookie-open]');
      if (!trigger) return;
      event.preventDefault();
      openConsent(true);
    });
    // cookies.html guarda desde sus propios interruptores: se respeta igual.
    window.addEventListener('baqueano:consent', function(event) { honorConsent(event.detail); });
    window.BaqueanoCookieConsent = { open: function() { openConsent(true); }, read: readConsent, policyVersion: POLICY_VERSION };

    var existing = readConsent();
    // Un consentimiento previo sin policyVersion sigue siendo válido; solo una
    // política NUEVA (policyVersion distinta) vuelve a pedir la decisión.
    if (existing && existing.version === 1 && (!existing.policyVersion || existing.policyVersion === POLICY_VERSION)) {
      honorConsent(existing);
      layer.hidden = true;
    } else {
      layer.hidden = false;
    }
  }

  // ==========================================================================
  // 🧭 CAPA UNIVERSAL DE ACCESIBILIDAD & SEGURIDAD CLIENTE (WCAG 2.1 AA / A11Y)
  // ==========================================================================
  // 🎯 POR QUÉ:
  // - Cumplir con WCAG 2.1 AA en todas las 28 páginas sin excepción.
  // - Evitar spam automatizado en formularios mediante trampa silenciosa Honeypot.
  // - Proteger contra Clickjacking e inyecciones de interfaz (Framing) en el cliente.
  // - Garantizar que navegadores con soporte de teclado y lectores de pantalla
  //   puedan saltar directamente al contenido principal (#mainContent).
  // ⚙️ CÓMO:
  // - Inyección del Skip Navigation Link antes del navbar.
  // - Verificación y asignación de #mainContent con tabindex="-1".
  // - Inyección automática de honeypots en todos los formularios <form>.
  // - Detección y corrección de inputs sin etiqueta descriptiva para lectores.
  // - Detección de iframes no autorizados (Frame Busting / Anti-Clickjacking).
  // 📦 QUÉ:
  // - Funciones: injectSkipNavigation(), ensureMainContentTarget(), 
  //   protectFormsWithHoneypot(), ensureInputAccessibility(), hardenClientSecurity().
  // ==========================================================================

  function injectSkipNavigation() {
    if (document.getElementById('bqSkipNav')) return;
    var skipLink = document.createElement('a');
    skipLink.id = 'bqSkipNav';
    skipLink.className = 'skip-nav';
    skipLink.href = '#mainContent';
    skipLink.textContent = 'Saltar al contenido principal';
    skipLink.setAttribute('aria-label', 'Saltar navegación e ir directo al contenido principal');

    if (document.body.firstChild) {
      document.body.insertBefore(skipLink, document.body.firstChild);
    } else {
      document.body.appendChild(skipLink);
    }
  }

  function ensureMainContentTarget() {
    if (document.getElementById('mainContent')) return;
    // Prioridad real (querySelector con lista devuelve el primero en el DOCUMENTO,
    // no el primer selector): antes podía elegir una <section> previa al <main>
    // que el shell luego reemplaza, y "Saltar al contenido" quedaba roto.
    var candidates = ['main', '[role="main"]', '.page-content', '.hero-exact-shell', '.destinos-main-container', '.main-container', 'section'];
    var main = null;
    for (var i = 0; i < candidates.length && !main; i++) {
      main = document.querySelector(candidates[i] + ':not(#mainNavbar *):not(#siteFooter *)');
    }
    if (main) {
      // Si el contenedor ya tiene id (p. ej. <main id="catalogoExperiencias">), se respeta:
      // pisarlo rompía las anclas internas que lo usan (auditoría de botones 2026-10-06).
      // El enlace "Saltar al contenido" apunta entonces a ese id.
      if (main.id) {
        var skip = document.getElementById('bqSkipNav');
        if (skip) skip.href = '#' + main.id;
      } else {
        main.id = 'mainContent';
      }
      if (!main.hasAttribute('tabindex')) {
        main.setAttribute('tabindex', '-1');
      }
    }
  }

  function protectFormsWithHoneypot() {
    var forms = document.querySelectorAll('form');
    forms.forEach(function(form) {
      if (form.querySelector('.bq-hp-field')) return;

      var hpWrapper = document.createElement('div');
      hpWrapper.className = 'bq-hp-field';
      hpWrapper.setAttribute('aria-hidden', 'true');
      hpWrapper.style.cssText = 'position:absolute!important;left:-9999px!important;top:-9999px!important;width:1px!important;height:1px!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important;';

      var hpInput = document.createElement('input');
      hpInput.type = 'text';
      hpInput.name = 'baqueano_security_hp';
      hpInput.tabIndex = -1;
      hpInput.autocomplete = 'off';
      hpInput.setAttribute('aria-hidden', 'true');

      hpWrapper.appendChild(hpInput);
      form.appendChild(hpWrapper);

      form.addEventListener('submit', function(e) {
        if (hpInput.value && hpInput.value.trim() !== '') {
          e.preventDefault();
          e.stopPropagation();
          console.warn('[BaqueanoSecurity] Intento de bot detectado y bloqueado via Honeypot.');
          if (window.bqToast) {
            window.bqToast('Solicitud rechazada por filtros de seguridad.', 'error');
          }
          return false;
        }
      }, true);
    });
  }

  function ensureInputAccessibility() {
    var inputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
    inputs.forEach(function(input) {
      if (input.getAttribute('aria-label') || input.getAttribute('aria-labelledby')) return;
      if (input.id && document.querySelector('label[for="' + input.id + '"]')) return;
      if (input.closest('label')) return;

      var fallback = input.placeholder || input.name || input.title || 'Campo de entrada';
      input.setAttribute('aria-label', fallback);
    });
  }

  function hardenClientSecurity() {
    try {
      if (window.top !== window.self) {
        var topHost = window.top.location.hostname;
        var selfHost = window.location.hostname;
        if (topHost !== selfHost && !topHost.endsWith('firebaseapp.com') && !topHost.endsWith('web.app')) {
          window.top.location = window.location;
        }
      }
    } catch (e) {
      if (window.top !== window.self) {
        document.body.style.display = 'none';
        window.top.location = window.location;
      }
    }

    var links = document.querySelectorAll('a[target="_blank"]');
    links.forEach(function(link) {
      var rel = link.getAttribute('rel') || '';
      var needs = [];
      if (!rel.includes('noopener')) needs.push('noopener');
      if (!rel.includes('noreferrer')) needs.push('noreferrer');
      if (needs.length > 0) {
        link.setAttribute('rel', (rel + ' ' + needs.join(' ')).trim());
      }
    });
  }

  async function init() {
    // Diálogo BAQUEANO accesible en lugar de alert()/confirm()/prompt() nativos (2026-10-06).
    if (!window.BaqueanoDialog && !document.querySelector('script[data-bq-dialog]')) {
      var dialogScript = document.createElement('script');
      dialogScript.src = 'js/baqueano-dialog.js?v=20261006-1';
      dialogScript.dataset.bqDialog = 'true';
      document.body.appendChild(dialogScript);
    }
    // Presencia real para el Ops Center (2026-10-06): sin cookies ni almacenamiento.
    if (!window.BaqueanoPresence && !document.querySelector('script[data-bq-presence]')) {
      var presenceScript = document.createElement('script');
      presenceScript.src = 'js/baqueano-presence.js?v=20261006-1';
      presenceScript.dataset.bqPresence = 'true';
      presenceScript.defer = true;
      document.body.appendChild(presenceScript);
    }
    // Campana de notificaciones (2026-10-06): solo aparece con sesión de Firebase.
    if (!window.BaqueanoNotifications && !document.querySelector('script[data-bq-notify]')) {
      var notifyScript = document.createElement('script');
      notifyScript.src = 'js/baqueano-notifications.js?v=20261006-1';
      notifyScript.dataset.bqNotify = 'true';
      notifyScript.defer = true;
      document.body.appendChild(notifyScript);
    }
    if (!document.querySelector('script[data-platform-enhancements]')) {
      var enhancementScript = document.createElement('script');
      enhancementScript.src = 'js/platform-enhancements.js?v=20261006-pdf-1';
      enhancementScript.dataset.platformEnhancements = 'true';
      enhancementScript.defer = true;
      document.body.appendChild(enhancementScript);
    }
    if (!document.querySelector('script[data-global-assets]')) {
      var assetScript = document.createElement('script');
      assetScript.src = 'js/global-asset-curator.js?v=20260929-1';
      assetScript.dataset.globalAssets = 'true';
      document.body.appendChild(assetScript);
    }
    if (!window.__BAQUEANO_I18N_LOADED__ && !document.querySelector('script[data-global-language]')) {
      var languageScript = document.createElement('script');
      languageScript.src = 'js/global-language.js?v=20261007-perf-1';
      languageScript.defer = true;
      languageScript.dataset.globalLanguage = 'true';
      document.body.appendChild(languageScript);
    }
    if (!document.querySelector('script[data-global-music-player]')) {
      var musicPlayerScript = document.createElement('script');
      musicPlayerScript.src = 'js/global-music-player.js?v=20261007-1';
      musicPlayerScript.defer = true;
      musicPlayerScript.dataset.globalMusicPlayer = 'true';
      document.body.appendChild(musicPlayerScript);
    }
    injectGlobalCSS();
    injectSkipNavigation();
    ensureMainContentTarget();
    hardenClientSecurity();
    protectFormsWithHoneypot();
    ensureInputAccessibility();
    injectCookieConsent();
    removeGlobalSearchButtons();
    initInternalSiteSearch();
    injectGlobalNavbar();
    injectGlobalFooter();
    injectSosModal();
    wireExistingSosButtons();
    wireGlobalButtons();
    injectThumbBar();
    initSearchSpotlight();
    // ⚡ Shell listo: navigation.js monta UNA vez el menú canónico (enlaces,
    //    mega menú "Más", cajón móvil, scroll) y repinta la sesión. Si
    //    navigation.js aún no cargó, lo monta al recibir este evento.
    window.__BQ_SHELL_READY__ = true;
    document.dispatchEvent(new CustomEvent('baqueano:shell-ready'));
    if (window.BaqueanoNavigation && typeof window.BaqueanoNavigation.mount === 'function') {
      try { window.BaqueanoNavigation.mount(); } catch (e) { console.warn('[BaqueanoShell] Menú no montado:', e); }
    }
    removeGlobalSearchButtons();
    normalizeFooterBoundary();
    protectFormsWithHoneypot();
    ensureInputAccessibility();
  }

  // ── Barra de pulgar (navegación inferior en celular) ─────────────────────
  // 🎯 POR QUÉ: en celular la navegación vivía solo en la hamburguesa de
  //    arriba, lejos del pulgar, y la mascota de BAQUI tapaba contenido.
  // ⚙️ CÓMO: una barra fija con 5 destinos clave; css/baqueano-identity.css
  //    la muestra solo con ≤ 768 px de ancho (por espacio, no por modelo) y
  //    reserva su alto con body.bq-has-thumbbar. Etiquetas con data-i18n para
  //    los 6 idiomas. El botón BAQUI abre el mismo panel de siempre; si el
  //    asistente no está cargado en la página, lleva al planificador.
  // 📦 QUÉ: Inicio · Explorar · Mapa · Mi Viaje · BAQUI, con aria-current.
  function injectThumbBar() {
    if (document.getElementById('bqThumbBar')) return;
    var groups = {
      home: ['index.html', ''],
      explore: ['destinos.html', 'destino.html', 'departamento.html', 'experiencias.html'],
      map: ['mapa.html'],
      trip: ['mi-viaje.html', 'favoritos.html']
    };
    function current(key) {
      return groups[key].indexOf(currentPage) !== -1 ? ' aria-current="page"' : '';
    }
    var bar = document.createElement('nav');
    bar.id = 'bqThumbBar';
    bar.className = 'bq-thumbbar';
    bar.setAttribute('aria-label', 'Accesos rápidos');
    bar.setAttribute('data-i18n-aria-label', 'nav.quick');
    bar.innerHTML =
      '<a href="index.html"' + current('home') + '><i class="fa-solid fa-house" aria-hidden="true"></i><span data-i18n="nav.home">Inicio</span></a>' +
      '<a href="destinos.html"' + current('explore') + '><i class="fa-solid fa-compass" aria-hidden="true"></i><span data-i18n="nav.explore">Explorar</span></a>' +
      '<a href="mapa.html"' + current('map') + '><i class="fa-solid fa-map-location-dot" aria-hidden="true"></i><span data-i18n="nav.map">Mapa</span></a>' +
      '<a href="mi-viaje.html"' + current('trip') + '><i class="fa-solid fa-route" aria-hidden="true"></i><span data-i18n="nav.trip">Mi Viaje</span></a>' +
      '<button type="button" class="bq-thumbbar-baqui">' +
        '<img src="assets/images/assistant/baqui.png?v=20261009" alt="" width="30" height="30" decoding="async">' +
        '<span class="notranslate">BAQUI</span>' +
      '</button>';
    bar.querySelector('.bq-thumbbar-baqui').addEventListener('click', function () {
      var assistant = window.BaqueanoAssistant;
      if (assistant && typeof assistant.open === 'function') {
        try {
          if (typeof assistant.show === 'function') assistant.show();
          assistant.open();
          return;
        } catch (error) {
          console.warn('[BAQUEANO] No se pudo abrir BAQUI desde la barra:', error);
        }
      }
      if (typeof window.loadBaqueanoDigital === 'function') {
        window.loadBaqueanoDigital(true);
        return;
      }
      window.location.href = 'baqueano-ia.html';
    });
    document.body.appendChild(bar);
    document.body.classList.add('bq-has-thumbbar');
  }

  // ── Cortafuegos de imágenes rotas ────────────────────────────────────────
  // 🎯 POR QUÉ: varias imágenes usan onerror="this.src='respaldo'" y el
  //    respaldo tampoco existía; el navegador entraba en un bucle infinito
  //    de errores y el evento load nunca llegaba (baqueano-ia.html colgada).
  // ⚙️ CÓMO: un único listener de 'error' en fase de captura (los errores de
  //    <img> no burbujean) cuenta los fallos de cada imagen. Al segundo fallo
  //    desactiva su onerror y usa una fotografía local que sí existe; al
  //    tercero la retira con un pixel transparente para no pedir nada más.
  // 📦 QUÉ: ninguna imagen puede volver a colgar una página ni gastar
  //    transferencia de Hosting en reintentos; el alt sigue disponible.
  var BQ_IMG_FALLBACK = 'assets/images/destinos/splash_bg.jpg';
  var BQ_IMG_BLANK = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  function installImageLoopGuard() {
    document.addEventListener('error', function (event) {
      var img = event.target;
      if (!img || img.tagName !== 'IMG') return;
      var fails = (parseInt(img.getAttribute('data-bq-img-fails'), 10) || 0) + 1;
      // Sin respaldo propio (onerror), el primer fallo ya mostraría el texto
      // alternativo roto: se salta directo a la fotografía local.
      if (fails === 1 && !img.hasAttribute('onerror') && typeof img.onerror !== 'function') fails = 2;
      img.setAttribute('data-bq-img-fails', String(fails));
      if (fails < 2) return;
      img.onerror = null;
      if (fails === 2 && img.src.indexOf(BQ_IMG_FALLBACK) === -1) {
        img.src = BQ_IMG_FALLBACK;
      } else if (img.src !== BQ_IMG_BLANK) {
        img.removeAttribute('srcset');
        img.src = BQ_IMG_BLANK;
      }
    }, true);
    // Imágenes que fallaron antes de que este script cargara (el listener no
    // las vio): se detectan por naturalWidth 0 una vez completas.
    function sweepBrokenImages() {
      Array.prototype.forEach.call(document.images, function (img) {
        if (!img.complete || img.naturalWidth > 0 || !img.currentSrc && !img.src) return;
        if (img.src.indexOf('data:') === 0 || img.hasAttribute('data-bq-img-fails')) return;
        img.setAttribute('data-bq-img-fails', '2');
        img.onerror = null;
        img.removeAttribute('srcset');
        img.src = BQ_IMG_FALLBACK;
      });
    }
    if (document.readyState === 'complete') sweepBrokenImages();
    else window.addEventListener('load', sweepBrokenImages, { once: true });
  }
  installImageLoopGuard();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
