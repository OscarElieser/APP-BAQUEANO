const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'css', 'navigation-mega.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Reemplazar la regla del panel mega menú para asegurar que aplique a #globalMegaMenu directamente
const target = `/* PANEL MEGA MENU */
#mainNavbar .global-mega-menu,
#mainNavbar .exact-dropdown-menu {
  display: none !important; position: fixed !important;
  top: 70px !important; left: 50% !important; transform: translateX(-50%) !important;
  width: min(940px, calc(100vw - 48px)) !important;
  background: linear-gradient(145deg, #0C2941 0%, #0A2035 100%) !important;
  border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 18px !important;
  box-shadow: 0 24px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06) !important;
  padding: 28px 32px !important; grid-template-columns: repeat(4, 1fr) !important;
  gap: 24px !important; z-index: 99999 !important; box-sizing: border-box !important;
}

#mainNavbar .global-more-dropdown.is-open .global-mega-menu,
#mainNavbar .global-more-dropdown.is-open .exact-dropdown-menu {
  display: grid !important;
  animation: bqnPanelIn 0.22s cubic-bezier(0.16,1,0.3,1) both !important;
}`;

const replacement = `/* PANEL MEGA MENU — CENTRADO ABSOLUTO EN PANTALLA (PORTAL AL BODY) */
#mainNavbar .global-mega-menu,
#mainNavbar .exact-dropdown-menu,
#globalMegaMenu,
.global-mega-menu {
  display: none; position: fixed !important;
  top: 72px !important; left: 50% !important; right: auto !important;
  transform: translateX(-50%) !important; margin: 0 auto !important;
  width: min(1060px, calc(100vw - 32px)) !important;
  max-width: calc(100vw - 32px) !important;
  background: linear-gradient(145deg, #0C2941 0%, #0A2035 100%) !important;
  border: 1px solid rgba(244, 230, 193, 0.22) !important; border-radius: 18px !important;
  box-shadow: 0 24px 64px rgba(0,0,0,0.7), 0 0 30px rgba(22, 93, 111, 0.25), inset 0 1px 0 rgba(255,255,255,0.06) !important;
  padding: 24px 28px !important; grid-template-columns: repeat(4, 1fr) !important;
  gap: 18px !important; z-index: 100050 !important; box-sizing: border-box !important;
}

#mainNavbar .global-more-dropdown.is-open .global-mega-menu,
#mainNavbar .global-more-dropdown.is-open .exact-dropdown-menu,
#globalMegaMenu.is-open,
.global-mega-menu.is-open {
  display: grid !important;
  animation: bqnPanelIn 0.22s cubic-bezier(0.16,1,0.3,1) both !important;
}`;

if (css.replace(/\r\n/g, '\n').includes(target.replace(/\r\n/g, '\n'))) {
  // Realizar reemplazo normalizado
  css = css.replace(/\r\n/g, '\n').replace(target.replace(/\r\n/g, '\n'), replacement);
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('✅ navigation-mega.css actualizado con centrado absoluto de mega menú');
} else {
  console.warn('⚠️ No se encontró coincidencia exacta, aplicando via regex...');
  css = css.replace(
    /\/\* PANEL MEGA MENU \*\/[\s\S]*?animation: bqnPanelIn 0\.22s[^\n]*\n}/,
    replacement
  );
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('✅ navigation-mega.css actualizado via regex');
}
