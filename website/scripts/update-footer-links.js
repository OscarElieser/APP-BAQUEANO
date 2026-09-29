const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'global-injector.js');
let content = fs.readFileSync(filePath, 'utf8');

// Buscamos bqFooterHTML
const oldFooterFnRegex = /function bqFooterHTML\(\)\s*\{[\s\S]*?return '<div class="bq-footer-inner">'[\s\S]*?<\/div>';\s*\}/;

const newFooterFn = `function bqFooterHTML() {
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
            '<a href="https://www.instagram.com/baqueano_nicaragua" target="_blank" rel="noopener noreferrer" class="bq-social-btn" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>' +
            '<a href="https://www.facebook.com/share/1S71xwJKse/" target="_blank" rel="noopener noreferrer" class="bq-social-btn" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>' +
            '<a href="https://www.tiktok.com/@baqueano.nicaragu?_r=1&_t=ZS-99iTnKK0i3e" target="_blank" rel="noopener noreferrer" class="bq-social-btn" aria-label="TikTok"><i class="fa-brands fa-tiktok"></i></a>' +
            '<a href="https://youtube.com/@baqueanonicaragua" target="_blank" rel="noopener noreferrer" class="bq-social-btn" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>' +
            '<a href="https://wa.me/50584431289?text=Hola%20BAQUEANO%2C%20necesito%20informaci%C3%B3n%20sobre%20Nicaragua" target="_blank" rel="noopener noreferrer" class="bq-social-btn" aria-label="WhatsApp de BAQUEANO"><i class="fa-brands fa-whatsapp"></i></a>' +
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
            '<li><a href="departamento.html">17 Departamentos</a></li>' +
            '<li><a href="baqueano-ia.html">Baqueano Digital</a></li>' +
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
            '<li><a href="denuncias.html">Canal Ético / Denuncias</a></li>' +
            '<li><a href="perfil.html">Mi Perfil</a></li>' +
            '<li><a href="mi-viaje.html">Mi Viaje</a></li>' +
            '<li><a href="https://wa.me/50584431289?text=Hola%20BAQUEANO%2C%20necesito%20asistencia" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-whatsapp" style="color:#25D366;margin-right:5px"></i>Contacto WhatsApp</a></li>' +
            '<li><a href="javascript:void(0)" onclick="if(window.bqOpenSos)bqOpenSos();else if(window.openSosModal)openSosModal(event);"><i class="fa-solid fa-shield-heart" style="color:#EF4444;margin-right:5px"></i>Centro SOS 24/7</a></li>' +
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
  }`;

if (oldFooterFnRegex.test(content)) {
  content = content.replace(oldFooterFnRegex, newFooterFn);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Footer global actualizado exitosamente en global-injector.js');
} else {
  console.error('❌ Error: no se pudo encontrar la función bqFooterHTML en global-injector.js');
}
