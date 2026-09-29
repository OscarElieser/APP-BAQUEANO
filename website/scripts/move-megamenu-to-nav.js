const fs = require('fs');
const path = require('path');

const websiteDir = path.join(__dirname, '..');

// 1. Contenido del Mega Menú de 4 Columnas (Hijo directo del Nav)
const megaMenuHTML = `  <!-- MEGA MENÚ DESPLEGABLE EN EL NAV (FUERA DEL DIV Y 100% CENTRADO AL NAV) -->
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
  </div>`;

// 2. Menú Central Nav (Sin envolver el mega menú en un div)
function buildCleanCentralMenu(currentFile) {
  const activeClass = (files) => files.includes(currentFile) ? ' active' : '';

  return `      <!-- Menú Horizontal Central de Enlaces (Limpio y Descongestionado) -->
      <div class="exact-nav-menu nav-links-menu" id="navLinksMenu" role="menubar">
        <a href="index.html" class="exact-nav-link${activeClass(['index.html', ''])}" role="menuitem"><span class="nav-label">Inicio</span></a>
        <a href="baqueano-ia.html" class="exact-nav-link${activeClass(['baqueano-ia.html', 'baqueano-ai.html'])}" role="menuitem"><span class="nav-label">Baqueano Digital</span></a>
        <button type="button" class="nav-dropdown-trigger exact-nav-dropdown-btn${activeClass(['destinos.html','destino.html','mapa.html','experiencias.html','mi-viaje.html','historia.html','gastronomia.html','musica.html','departamento.html','aliados.html','mi-negocio.html','ambiental.html','denuncias.html','perfil.html','nosotros.html','terminos.html','privacidad.html','cookies.html','aviso-legal.html','admin.html'])}" id="btnGlobalMoreTrigger" aria-haspopup="true" aria-expanded="false" aria-controls="globalMegaMenu">
          <span>Más</span> <i class="fa-solid fa-chevron-down" style="font-size:0.72rem;margin-left:2px"></i>
        </button>
      </div>`;
}

// 3. Procesar archivos HTML
const htmlFiles = fs.readdirSync(websiteDir).filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
  const filePath = path.join(websiteDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Si tiene nav#mainNavbar
  if (content.includes('id="mainNavbar"')) {
    // 1. Eliminar cualquier #globalMegaMenu viejo existente
    content = content.replace(/<div class="nav-dropdown-menu global-mega-menu[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, '</div></div>');
    content = content.replace(/<div class="nav-dropdown-menu global-mega-menu[\s\S]*?<\/div>\s*<\/div>/g, '</div>');
    content = content.replace(/<!-- MEGA MENÚ DESPLEGABLE EN EL NAV[\s\S]*?<\/div>\s*<\/nav>/g, '</nav>');

    // 2. Reemplazar navLinksMenu por la versión limpia sin el div del mega menú
    const navLinksRegex = /<div class="exact-nav-menu[^>]*id="navLinksMenu"[\s\S]*?<\/div>(?=\s*<div class="(?:exact-nav-actions|global-nav-actions)")/;
    if (navLinksRegex.test(content)) {
      content = content.replace(navLinksRegex, buildCleanCentralMenu(file) + '\n');
    }

    // 3. Insertar el mega menú como hijo directo del nav (justo antes de </nav>)
    if (!content.includes('id="globalMegaMenu"')) {
      content = content.replace('</nav>', '\n' + megaMenuHTML + '\n  </nav>');
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Archivo HTML actualizado (mega menú directo en el nav): ${file}`);
  }
});
