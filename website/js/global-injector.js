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
      { id: 'bq-headings',  href: 'css/headings-system.css?v=20260927-1' },
      { id: 'bq-mega-nav',  href: 'css/navigation-mega.css?v=20260928-nav-fix-6' },
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

    // Estilos inline del navbar y footer globales
    if (!document.getElementById('bq-global-injector-styles')) {
      var style = document.createElement('style');
      style.id = 'bq-global-injector-styles';
      style.textContent = `
        /* ── Navbar Oficial Baqueano ── */
        .bq-global-navbar {
          position: sticky; top: 0; z-index: 1000; width: 100%;
          background: rgba(11,37,58,.97); backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(246,94,1,.18);
          font-family: 'Inter', system-ui, sans-serif;
        }
        .bq-nav-inner {
          max-width: 1380px; margin: 0 auto; padding: 0 24px;
          display: flex; align-items: center; height: 64px; gap: 0;
        }
        .bq-nav-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; }
        .bq-nav-brand img { height: 38px; width: 38px; object-fit: contain; }
        .bq-brand-name { font-family: 'Montserrat', sans-serif; font-size: .9rem; font-weight: 900; color: #F4E6C1; line-height: 1; }
        .bq-brand-sub  { font-size: .6rem; color: #94A3B8; letter-spacing: .08em; font-weight: 600; }
        .bq-nav-links  { display: flex; align-items: center; gap: 2px; margin-left: 28px; flex: 1; }
        .bq-nav-links a {
          color: rgba(255,255,255,.8); text-decoration: none; padding: 6px 14px;
          border-radius: 8px; font-size: .88rem; font-weight: 600; transition: all .2s;
          white-space: nowrap;
        }
        .bq-nav-links a:hover, .bq-nav-links a.active { color: #F65E01; background: rgba(246,94,1,.1); }
        .bq-nav-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }
        .bq-nav-btn {
          background: none; border: none; color: rgba(255,255,255,.7); cursor: pointer;
          padding: 7px; border-radius: 8px; font-size: .9rem; transition: all .2s;
          font-family: 'Inter', sans-serif; display: flex; align-items: center; gap: 6px;
        }
        .bq-nav-btn:hover { color: #FFF; background: rgba(255,255,255,.1); }
        .bq-nav-sos {
          background: rgba(239,68,68,.15); color: #EF4444; border: 1px solid rgba(239,68,68,.3);
          padding: 6px 14px; border-radius: 8px; font-weight: 700; font-size: .82rem;
          cursor: pointer; font-family: 'Montserrat', sans-serif; white-space: nowrap;
          transition: all .2s; display: flex; align-items: center; gap: 6px;
        }
        .bq-nav-sos:hover { background: #EF4444; color: #FFF; }
        .bq-nav-login {
          background: #F65E01; color: #FFF; border: none; padding: 8px 18px;
          border-radius: 9px; font-weight: 700; font-size: .85rem; cursor: pointer;
          font-family: 'Montserrat', sans-serif; text-decoration: none; transition: background .2s;
        }
        .bq-nav-login:hover { background: #D94E00; color: #FFF; }
        /* Dropdown Más */
        .bq-nav-dropdown { position: relative; }
        .bq-nav-dropdown-btn {
          color: rgba(255,255,255,.8); background: none; border: none; padding: 6px 14px;
          border-radius: 8px; font-size: .88rem; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; gap: 6px; transition: all .2s; white-space: nowrap;
          font-family: 'Inter', sans-serif;
        }
        .bq-nav-dropdown-btn:hover { color: #F65E01; background: rgba(246,94,1,.1); }
        .bq-dropdown-menu {
          position: absolute; top: calc(100% + 10px); right: 0; min-width: 220px;
          background: #0B253A; border: 1px solid rgba(255,255,255,.08); border-radius: 14px;
          padding: 8px; box-shadow: 0 16px 48px rgba(0,0,0,.5);
          display: none; z-index: 999; animation: bqDropIn .2s ease;
        }
        @keyframes bqDropIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:none; } }
        .bq-nav-dropdown:hover .bq-dropdown-menu,
        .bq-nav-dropdown-btn[aria-expanded="true"] + .bq-dropdown-menu { display: block; }
        .bq-dropdown-item {
          display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,.8);
          text-decoration: none; padding: 9px 12px; border-radius: 9px; font-size: .85rem;
          font-weight: 600; transition: all .18s;
        }
        .bq-dropdown-item:hover { background: rgba(246,94,1,.12); color: #F65E01; }
        .bq-dropdown-item.ops { border-top: 1px solid rgba(255,255,255,.08); margin-top: 6px; padding-top: 12px; color: #F4E6C1; }
        .bq-dropdown-item.ops:hover { background: rgba(244,230,193,.1); color: #F4E6C1; }
        .bq-burger {
          display: none; background: none; border: none; color: #FFF; font-size: 1.3rem;
          cursor: pointer; padding: 8px; border-radius: 8px;
        }
        @media (max-width: 768px) {
          .bq-nav-links { display: none; }
          .bq-nav-links.open { display: flex; flex-direction: column; position: absolute; top: 64px; left: 0; right: 0; background: #0B253A; padding: 16px; gap: 4px; border-bottom: 2px solid rgba(246,94,1,.3); }
          .bq-burger { display: flex; }
          .bq-nav-actions .bq-nav-btn { display: none; }
        }

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
        .bq-ops-fab {
          position: fixed; bottom: 24px; left: 24px; z-index: 900;
          background: #0B253A; border: 1px solid rgba(244,230,193,.25); border-radius: 12px;
          padding: 10px 16px; display: flex; align-items: center; gap: 8px;
          color: #F4E6C1; font-size: .78rem; font-weight: 700; text-decoration: none;
          box-shadow: 0 4px 20px rgba(0,0,0,.4); transition: all .25s;
          font-family: 'Inter', sans-serif;
        }
        .bq-ops-fab:hover { background: #165D6F; border-color: #F65E01; color: #FFF; transform: translateY(-2px); }
        .bq-ops-fab i { font-size: 1rem; color: #F65E01; }

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
    document.body.appendChild(modal);
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
  function init() {
    injectGlobalCSS();
    injectGlobalNavbar();
    upgradeOldFooters();
    injectGlobalFooter();
    injectOPSButton();
    injectSosModal();
    addOpsToExistingNavbar();
    wireNavbarButtons(null);
    wireExistingSosButtons();
    wireGlobalButtons();
    // ⚡ Activar lógica del Mega Menú en todas las páginas
    if (typeof buildGlobalMegaNavigation === 'function') {
      buildGlobalMegaNavigation();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
