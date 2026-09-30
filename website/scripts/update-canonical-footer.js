/**
 * 🧭 BAQUEANO — Sincronizador Canónico de Footer
 * Actualiza el footer de index.html para reflejar exactamente las 5 columnas:
 * Marca + Explorá + Cultura + Comunidad + Legal con sus enlaces y acentos oficiales.
 */
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const footerTagStart = '<footer class="site-footer-exact" id="siteFooter">';
const footerTagEnd = '</footer>';

const startIndex = html.indexOf(footerTagStart);
if (startIndex === -1) {
  console.error('No se encontró el footer en index.html');
  process.exit(1);
}

const endIndex = html.indexOf(footerTagEnd, startIndex) + footerTagEnd.length;

const canonicalFooter = `  <footer class="site-footer-exact" id="siteFooter">
    <div class="exact-container">
      <div class="footer-top-grid">
        <!-- Columna 1: Marca y Redes -->
        <div class="footer-brand-col">
          <a href="index.html" class="footer-logo-row">
            <img src="assets/images/logo.png" alt="Baqueano" class="footer-logo-img">
            <div class="footer-brand-text-block">
              <span class="footer-brand-title">BAQUEANO</span>
              <span class="footer-brand-subtitle">NICARAGUA AUTÉNTICA</span>
            </div>
          </a>
          <span class="footer-tagline-text">DESCUBRÍ LO QUE NO SALE EN EL MAPA.</span>
          <div class="footer-social-row">
            <a href="https://www.instagram.com/baqueano_nicaragua" target="_blank" rel="noopener" class="footer-social-link" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
            <a href="https://www.facebook.com/share/1S71xwJKse/" target="_blank" rel="noopener" class="footer-social-link" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
            <a href="https://www.tiktok.com/@baqueano.nicaragu?_r=1&_t=ZS-99iTnKK0i3e" target="_blank" rel="noopener" class="footer-social-link" aria-label="TikTok"><i class="fa-brands fa-tiktok"></i></a>
            <a href="https://wa.me/50584431289" target="_blank" rel="noopener" class="footer-social-link" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
          </div>
        </div>

        <!-- Columna 2: Explorá -->
        <div class="footer-nav-col">
          <h4>EXPLORÁ</h4>
          <div class="footer-accent-bar"></div>
          <ul>
            <li><a href="index.html">Inicio</a></li>
            <li><a href="destinos.html">Destinos</a></li>
            <li><a href="mapa.html">Mapa Interactivo</a></li>
            <li><a href="experiencias.html">Experiencias</a></li>
            <li><a href="departamento.html">Departamentos</a></li>
          </ul>
        </div>

        <!-- Columna 3: Cultura -->
        <div class="footer-nav-col">
          <h4>CULTURA</h4>
          <div class="footer-accent-bar"></div>
          <ul>
            <li><a href="historia.html">Historia &amp; Memoria</a></li>
            <li><a href="gastronomia.html">Gastronomía Ancestral</a></li>
            <li><a href="musica.html">Son Sonoro Folk</a></li>
            <li><a href="ambiental.html">Custodia Ambiental</a></li>
            <li><a href="aliados.html">Red de Aliados</a></li>
          </ul>
        </div>

        <!-- Columna 4: Comunidad -->
        <div class="footer-nav-col">
          <h4>COMUNIDAD</h4>
          <div class="footer-accent-bar"></div>
          <ul>
            <li><a href="nosotros.html">Quiénes Somos</a></li>
            <li><a href="mi-negocio.html">Registrá tu Negocio</a></li>
            <li><a href="denuncias.html">Canal de Denuncias</a></li>
            <li><a href="perfil.html">Mi Perfil</a></li>
            <li><a href="mi-viaje.html">Mi Viaje</a></li>
          </ul>
        </div>

        <!-- Columna 5: Legal -->
        <div class="footer-nav-col">
          <h4>LEGAL</h4>
          <div class="footer-accent-bar"></div>
          <ul>
            <li><a href="terminos.html">Términos y Condiciones</a></li>
            <li><a href="privacidad.html">Política de Privacidad</a></li>
            <li><a href="cookies.html">Política de Cookies</a></li>
            <li><a href="aviso-legal.html">Aviso Legal</a></li>
          </ul>
        </div>

      </div>
    </div>

    <!-- Barra Inferior de Copyright -->
    <div class="footer-bottom-bar">
      <div class="exact-container">
        <span>&copy; 2026 BAQUEANO. Todos los derechos reservados.</span>
        <span>Hecho con <i class="fa-solid fa-heart" style="color: #EF4444;"></i> en Nicaragua</span>
      </div>
    </div>
  </footer>`;

html = html.substring(0, startIndex) + canonicalFooter + html.substring(endIndex);
fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ Footer sincronizado exitosamente en index.html');
