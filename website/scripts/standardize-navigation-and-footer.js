const fs = require('fs');
const path = require('path');

const websiteDir = path.join(__dirname, '..');

// 1. Estructura unificada del Menú Central (solo Inicio, Baqueano Digital, Más)
function buildCentralMenuHTML(currentFile) {
  const activeClass = (files) => files.includes(currentFile) ? ' active' : '';

  return `      <!-- Menú Horizontal Central de Enlaces (Limpio y Descongestionado) -->
      <div class="exact-nav-menu nav-links-menu" id="navLinksMenu" role="menubar">
        <a href="index.html" class="exact-nav-link${activeClass(['index.html', ''])}" role="menuitem"><span class="nav-label">Inicio</span></a>
        <a href="baqueano-ia.html" class="exact-nav-link${activeClass(['baqueano-ia.html', 'baqueano-ai.html'])}" role="menuitem"><span class="nav-label">Baqueano Digital</span></a>

        <!-- Menú Desplegable "Más ˇ" con Mega Menú Centrado de 4 Columnas -->
        <div class="nav-dropdown global-more-dropdown exact-nav-dropdown" id="navDropdownGlobalMore" role="none">
          <button type="button" class="nav-dropdown-trigger exact-nav-dropdown-btn${activeClass(['destinos.html','destino.html','mapa.html','experiencias.html','mi-viaje.html','historia.html','gastronomia.html','musica.html','departamento.html','aliados.html','mi-negocio.html','ambiental.html','denuncias.html','perfil.html','nosotros.html','terminos.html','privacidad.html','cookies.html','aviso-legal.html','admin.html'])}" id="btnGlobalMoreTrigger" aria-haspopup="true" aria-expanded="false" aria-controls="globalMegaMenu">
            <span>Más</span> <i class="fa-solid fa-chevron-down" style="font-size:0.72rem;margin-left:2px"></i>
          </button>
          <div class="nav-dropdown-menu global-mega-menu exact-dropdown-menu" id="globalMegaMenu" role="menu">
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
          </div>
        </div>
      </div>`;
}

// 2. Acciones del extremo derecho (Clima, SOS, Sesión, Idioma, Móvil - SIN BUSCADOR Y SIN FAVORITOS)
const unifiedActionsHTML = `      <!-- Acciones a la Derecha (Clima en vivo, SOS, Iniciar Sesión, Idioma) -->
      <div class="exact-nav-actions global-nav-actions">
        <div class="navbar-weather-pill" id="bqWeatherWidget" title="Clima actual en Nicaragua (clic para ver detalles)" aria-label="Clima en Nicaragua" role="button" tabindex="0">
          <i class="fa-solid fa-cloud-sun" id="bqWeatherIcon"></i>
          <span class="weather-temp" id="bqWeatherTemp">28°C</span>
          <span class="weather-label" id="bqWeatherCity">Nicaragua</span>
        </div>
        <button type="button" class="sos-quick-btn navbar-sos-btn" onclick="if(window.bqOpenSos)bqOpenSos();else if(window.openSosModal)openSosModal(event);" aria-label="Centro de auxilio SOS">
          <i class="fa-solid fa-shield-heart"></i><span>SOS</span>
        </button>
        <a href="perfil.html" class="exact-nav-btn-login global-session navbar-login-btn">
          <i class="fa-solid fa-circle-user"></i><span>Iniciar sesión</span>
        </a>
        <button type="button" class="global-language navbar-lang-pill" aria-label="Cambiar idioma">
          <span>ES</span> <i class="fa-solid fa-chevron-down" style="font-size:0.68rem; margin-left: 2px;"></i>
        </button>
        <button type="button" class="exact-nav-mobile-toggle mobile-nav-toggle" id="mobileNavToggle" aria-label="Abrir menú móvil">
          <i class="fa-solid fa-bars"></i>
        </button>
      </div>`;

// Procesar todos los archivos HTML
const files = fs.readdirSync(websiteDir).filter(f => f.endsWith('.html'));
let modifiedCount = 0;

files.forEach(file => {
  const filePath = path.join(websiteDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Actualizar versión de cache de CSS y JS de navegación
  if (content.includes('navigation-mega.css')) {
    content = content.replace(/navigation-mega\.css(?:\?[^"'>]*)?/g, 'navigation-mega.css?v=20260929-v12-centered');
    changed = true;
  }
  if (content.includes('navigation.js')) {
    content = content.replace(/navigation\.js(?:\?[^"'>]*)?/g, 'navigation.js?v=20260929-v12-centered');
    changed = true;
  }
  if (content.includes('global-injector.js')) {
    content = content.replace(/global-injector\.js(?:\?[^"'>]*)?/g, 'global-injector.js?v=20260929-v12-centered');
    changed = true;
  }

  // Reemplazar menú central si existe
  const navMenuRegex = /<div class="exact-nav-menu[^>]*id="navLinksMenu"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
  if (navMenuRegex.test(content)) {
    content = content.replace(navMenuRegex, buildCentralMenuHTML(file));
    changed = true;
  }

  // Reemplazar acciones a la derecha
  const actionsRegex = /<div class="(?:exact-nav-actions|global-nav-actions)[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/nav>/;
  if (actionsRegex.test(content)) {
    content = content.replace(actionsRegex, unifiedActionsHTML + '\n    </div>\n  </nav>');
    changed = true;
  }

  // Reemplazar botones o enlaces de SOS huérfanos en footers estáticos
  if (content.includes('onclick="openSosModal(event)"')) {
    content = content.replace(/onclick="openSosModal\(event\)"/g, 'onclick="if(window.bqOpenSos)bqOpenSos();else if(window.openSosModal)openSosModal(event);"');
    changed = true;
  }

  // Sustituir mailto soporte en footer estático por WhatsApp
  if (content.includes('href="mailto:soporte@baqueano.ni"')) {
    content = content.replace(/href="mailto:soporte@baqueano\.ni"/g, 'href="https://wa.me/50584431289?text=Hola%20BAQUEANO%2C%20necesito%20asistencia" target="_blank" rel="noopener noreferrer"');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedCount++;
    console.log(`✅ Archivo HTML actualizado: ${file}`);
  }
});

console.log(`\n🎉 Total archivos HTML actualizados con el nuevo estándar: ${modifiedCount}`);
