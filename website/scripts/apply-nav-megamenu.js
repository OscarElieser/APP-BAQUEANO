const fs = require('fs');
const path = require('path');

// 1. Actualizar navigation.js
const navJsPath = path.join(__dirname, '..', 'js', 'navigation.js');
let navJs = fs.readFileSync(navJsPath, 'utf8');

// Reemplazar la construcción de navMenu y el control interactivo
const navBuildRegex = /const navMenu = navbar\.querySelector\('#navLinksMenu[\s\S]*?const existingDivider = navbar\.querySelector\('\.nav-vertical-divider'\);/;

const newNavBuild = `const navMenu = navbar.querySelector('#navLinksMenu, .exact-nav-menu, .nav-links-menu');
  if (navMenu && navMenu.dataset.globalMegaReady !== 'true') {
    navMenu.dataset.globalMegaReady = 'true';

    const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const activeClass = (files) => files.includes(current) ? ' active' : '';

    // Menú central limpio — SIN encerrar el mega menú en un div
    navMenu.innerHTML = \`
      <a href="index.html" class="exact-nav-link\${activeClass(['index.html',''])}" role="menuitem"><span class="nav-label">Inicio</span></a>
      <a href="baqueano-ia.html" class="exact-nav-link\${activeClass(['baqueano-ia.html','baqueano-ai.html'])}" role="menuitem"><span class="nav-label">Baqueano Digital</span></a>
      <button class="nav-dropdown-trigger exact-nav-dropdown-btn\${activeClass(['destinos.html','destino.html','mapa.html','experiencias.html','mi-viaje.html','historia.html','gastronomia.html','musica.html','departamento.html','aliados.html','mi-negocio.html','ambiental.html','denuncias.html','perfil.html','nosotros.html','terminos.html','privacidad.html','cookies.html','aviso-legal.html','admin.html'])}" id="btnGlobalMoreTrigger" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="globalMegaMenu" role="menuitem">
        <span>Más</span> <i class="fa-solid fa-chevron-down" style="font-size:0.72rem;margin-left:2px"></i>
      </button>
    \`;

    // Asegurar que #globalMegaMenu esté directamente en el NAV (hijo directo de navbar)
    let megaMenu = navbar.querySelector('#globalMegaMenu');
    if (!megaMenu) {
      megaMenu = document.createElement('div');
      megaMenu.className = 'nav-dropdown-menu global-mega-menu exact-dropdown-menu';
      megaMenu.id = 'globalMegaMenu';
      megaMenu.setAttribute('role', 'menu');
      megaMenu.innerHTML = \`
        <!-- 1. MI PAÍS -->
        <section class="global-mega-column culture">
          <h2><i class="fa-solid fa-landmark"></i> Mi País</h2>
          <a href="destinos.html"><i class="fa-solid fa-map-pin"></i> Destinos</a>
          <a href="mapa.html"><i class="fa-regular fa-map"></i> Mapa Interactivo</a>
          <a href="experiencias.html"><i class="fa-solid fa-person-hiking"></i> Experiencias</a>
          <a href="historia.html"><i class="fa-regular fa-file-lines"></i> Historia &amp; Memoria</a>
          <a href="gastronomia.html"><i class="fa-solid fa-utensils"></i> Gastronomía Ancestral</a>
          <a href="musica.html"><i class="fa-solid fa-music"></i> Son Sonoro / Música</a>
          <a href="departamento.html"><i class="fa-solid fa-map-location-dot"></i> 17 Territorios</a>
        </section>

        <!-- 2. ECOSISTEMA & COMUNIDAD -->
        <section class="global-mega-column community">
          <h2><i class="fa-solid fa-people-group"></i> Ecosistema</h2>
          <a href="aliados.html"><i class="fa-regular fa-handshake"></i> Red de Aliados</a>
          <a href="mi-negocio.html"><i class="fa-solid fa-shop"></i> Mi Negocio</a>
          <a href="ambiental.html"><i class="fa-regular fa-leaf"></i> Custodia Ambiental</a>
          <a href="denuncias.html"><i class="fa-solid fa-shield-halved"></i> Canal Ético</a>
        </section>

        <!-- 3. BAQUEANO -->
        <section class="global-mega-column explore">
          <h2><i class="fa-solid fa-compass"></i> Baqueano</h2>
          <a href="nosotros.html"><i class="fa-solid fa-circle-info"></i> Quiénes Somos</a>
          <a href="nosotros.html#faq"><i class="fa-regular fa-circle-question"></i> Preguntas Frecuentes</a>
          <a href="baqueano-ia.html"><i class="fa-solid fa-wand-magic-sparkles"></i> Baqueano IA</a>
        </section>

        <!-- 4. CUENTA Y PLATAFORMA -->
        <section class="global-mega-column account">
          <h2><i class="fa-solid fa-gear"></i> Plataforma</h2>
          <a href="mi-viaje.html"><i class="fa-solid fa-route"></i> Mi Viaje</a>
          <a href="perfil.html"><i class="fa-regular fa-user"></i> Mi Perfil</a>
          <a href="perfil.html#tab-viajes"><i class="fa-regular fa-calendar-days"></i> Mis Reservas</a>
          <a href="destinos.html?favs=1"><i class="fa-regular fa-heart"></i> Favoritos</a>
          <a href="terminos.html"><i class="fa-regular fa-file-lines"></i> Términos</a>
          <a href="privacidad.html"><i class="fa-solid fa-shield-halved"></i> Privacidad</a>
          <a href="cookies.html"><i class="fa-solid fa-cookie-bite"></i> Cookies</a>
          <a class="global-admin-link" href="admin.html"><i class="fa-solid fa-lock"></i> Admin / Ops Center <small>Acceso restringido</small></a>
        </section>
      \`;
      navbar.appendChild(megaMenu);
    }
  }

  // Eliminar divisor vertical previo si existiese
  const existingDivider = navbar.querySelector('.nav-vertical-divider');`;

if (navBuildRegex.test(navJs)) {
  navJs = navJs.replace(navBuildRegex, newNavBuild);
  console.log('✅ buildGlobalMegaNavigation actualizado en navigation.js (mega menú directo en navbar)');
} else {
  console.error('❌ Error: no se encontró navBuildRegex');
}

// Actualizar control interactivo del mega menú
const controlRegex = /\/\/ ─── Control Interactivo del Mega Menú[\s\S]*?(?=\/\/ ─── Control del Menú Móvil)/;

const newControl = `// ─── Control Interactivo del Mega Menú (Hijo directo del Nav y Centrado) ───
  const moreBtn = document.getElementById('btnGlobalMoreTrigger');
  const megaMenu = document.getElementById('globalMegaMenu');
  let closeTimer = null;

  function openMegaMenu() {
    clearTimeout(closeTimer);
    if (megaMenu) {
      megaMenu.classList.add('is-open');
    }
    if (moreBtn) {
      moreBtn.classList.add('is-open');
      moreBtn.setAttribute('aria-expanded', 'true');
    }
  }

  function closeMegaMenu() {
    if (megaMenu) {
      megaMenu.classList.remove('is-open');
    }
    if (moreBtn) {
      moreBtn.classList.remove('is-open');
      moreBtn.setAttribute('aria-expanded', 'false');
    }
  }

  if (moreBtn && megaMenu) {
    moreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (megaMenu.classList.contains('is-open')) {
        closeMegaMenu();
      } else {
        openMegaMenu();
      }
    });

    moreBtn.addEventListener('mouseenter', () => {
      if (window.innerWidth <= 768) return;
      openMegaMenu();
    });

    moreBtn.addEventListener('mouseleave', () => {
      if (window.innerWidth <= 768) return;
      closeTimer = setTimeout(closeMegaMenu, 280);
    });

    megaMenu.addEventListener('mouseenter', () => {
      if (window.innerWidth <= 768) return;
      clearTimeout(closeTimer);
    });

    megaMenu.addEventListener('mouseleave', () => {
      if (window.innerWidth <= 768) return;
      closeTimer = setTimeout(closeMegaMenu, 280);
    });

    document.addEventListener('click', (e) => {
      if (megaMenu.contains(e.target) || moreBtn.contains(e.target)) return;
      closeMegaMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMegaMenu();
    });
  }

  `;

if (controlRegex.test(navJs)) {
  navJs = navJs.replace(controlRegex, newControl);
  console.log('✅ Control interactivo de mega menú actualizado en navigation.js');
} else {
  console.error('❌ Error: no se encontró controlRegex');
}

fs.writeFileSync(navJsPath, navJs, 'utf8');

// 2. Actualizar navigation-mega.css
const cssPath = path.join(__dirname, '..', 'css', 'navigation-mega.css');
let css = fs.readFileSync(cssPath, 'utf8');

const cssTargetRegex = /\/\* PANEL MEGA MENU[\s\S]*?(?=\/\* ---- ACCIONES DERECHA ----)/;

const newCssPanel = `/* PANEL MEGA MENU — EN EL NAV, MOVIDO A LA DERECHA Y CENTRADO EXACTO */
#mainNavbar {
  position: relative !important;
}

#mainNavbar > #globalMegaMenu,
#mainNavbar > .global-mega-menu,
#globalMegaMenu,
.global-mega-menu {
  display: none;
  position: absolute !important;
  top: calc(100% + 10px) !important;
  left: 50% !important;
  right: auto !important;
  transform: translateX(-50%) !important;
  margin: 0 auto !important;
  width: min(1080px, calc(100vw - 32px)) !important;
  max-width: calc(100vw - 32px) !important;
  background: linear-gradient(145deg, #0C2941 0%, #0A2035 100%) !important;
  border: 1px solid rgba(244, 230, 193, 0.22) !important;
  border-radius: 20px !important;
  box-shadow: 0 24px 64px rgba(0,0,0,0.7), 0 0 30px rgba(22, 93, 111, 0.25), inset 0 1px 0 rgba(255,255,255,0.06) !important;
  padding: 24px 28px !important;
  grid-template-columns: repeat(4, 1fr) !important;
  gap: 18px !important;
  z-index: 99999 !important;
  box-sizing: border-box !important;
}

#mainNavbar > #globalMegaMenu.is-open,
#mainNavbar > .global-mega-menu.is-open,
#globalMegaMenu.is-open,
.global-mega-menu.is-open {
  display: grid !important;
  animation: bqnPanelIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both !important;
}

@keyframes bqnPanelIn {
  from { opacity:0; transform:translateX(-50%) translateY(-10px) scale(0.98); }
  to   { opacity:1; transform:translateX(-50%) translateY(0) scale(1); }
}

#mainNavbar .global-mega-column,
#globalMegaMenu .global-mega-column,
.global-mega-column {
  display: flex !important; flex-direction: column !important; gap: 4px !important;
  background: rgba(255, 255, 255, 0.02) !important;
  padding: 14px 16px !important;
  border-radius: 14px !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

#mainNavbar .global-mega-column h2,
#globalMegaMenu .global-mega-column h2,
.global-mega-column h2 {
  font-family: League Spartan, sans-serif !important; font-size: 0.72rem !important;
  font-weight: 800 !important; color: #F4E6C1 !important;
  text-transform: uppercase !important; letter-spacing: 0.1em !important;
  margin: 0 0 10px 0 !important; padding-bottom: 8px !important;
  border-bottom: 2px solid #F65E01 !important;
  display: flex !important; align-items: center !important; gap: 7px !important;
}

#mainNavbar .global-mega-column h2 i,
#globalMegaMenu .global-mega-column h2 i,
.global-mega-column h2 i { color: #F65E01 !important; font-size: 0.8rem !important; }

#mainNavbar .global-mega-column a,
#globalMegaMenu .global-mega-column a,
.global-mega-column a {
  color: #8FA5BC !important; font-family: Aristotelica Pro, Plus Jakarta Sans, sans-serif !important;
  font-size: 0.84rem !important; font-weight: 500 !important;
  text-decoration: none !important; padding: 5px 6px !important;
  display: flex !important; align-items: center !important; gap: 9px !important;
  border-radius: 7px !important; transition: color 0.15s, background 0.15s, transform 0.15s !important;
}

#mainNavbar .global-mega-column a i,
#globalMegaMenu .global-mega-column a i,
.global-mega-column a i {
  width: 16px !important; text-align: center !important; color: #4E6A84 !important;
  font-size: 0.8rem !important; transition: color 0.15s !important; flex-shrink: 0 !important;
}

#mainNavbar .global-mega-column a:hover,
#globalMegaMenu .global-mega-column a:hover,
.global-mega-column a:hover {
  color: #fff !important; background: rgba(22,93,111,0.2) !important; transform: translateX(3px) !important;
}

#mainNavbar .global-mega-column a:hover i,
#globalMegaMenu .global-mega-column a:hover i,
.global-mega-column a:hover i { color: #F65E01 !important; }

#mainNavbar a.global-admin-link,
#globalMegaMenu a.global-admin-link,
a.global-admin-link {
  margin-top: 8px !important; padding: 7px 10px !important;
  background: rgba(22,93,111,0.18) !important;
  border: 1px solid rgba(22,93,111,0.4) !important; border-radius: 9px !important;
  color: #F4E6C1 !important; font-weight: 700 !important; font-size: 0.78rem !important;
  flex-direction: column !important; align-items: flex-start !important;
  gap: 1px !important; transform: none !important;
}

#mainNavbar a.global-admin-link:hover,
#globalMegaMenu a.global-admin-link:hover,
a.global-admin-link:hover { background: #165D6F !important; color: #fff !important; transform: none !important; }

`;

if (cssTargetRegex.test(css)) {
  css = css.replace(cssTargetRegex, newCssPanel);
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('✅ navigation-mega.css panel actualizado con posición en nav y centrado perfecto');
} else {
  console.error('❌ Error: no se encontró cssTargetRegex');
}
