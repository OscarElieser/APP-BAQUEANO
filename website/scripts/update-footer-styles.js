const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'css', 'pages', 'index-exact.css');
let css = fs.readFileSync(cssPath, 'utf8');

const targetSectionStart = '/* ============================================================================\n   12. FOOTER INSTITUCIONAL (SECCIÓN 10 - IMAGEN 4)\n   ============================================================================ */';
const startIndex = css.indexOf('.site-footer-exact {');

if (startIndex === -1) {
  console.error('No se encontró .site-footer-exact en index-exact.css');
  process.exit(1);
}

// Encontrar hasta el final de la sección del footer
const nextSection = '/* ============================================================================\n   13. MODALES INSTITUCIONALES';
let endIndex = css.indexOf(nextSection);
if (endIndex === -1) {
  endIndex = css.indexOf('/* 13. MODALES', startIndex);
}
if (endIndex === -1) {
  endIndex = css.length;
}

const updatedFooterCSS = `.site-footer-exact {
  background: #081827;
  color: #94A3B8;
  font-family: 'Aristotelica Pro', 'Plus Jakarta Sans', system-ui, sans-serif;
  padding-top: 50px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.footer-top-grid {
  display: grid;
  grid-template-columns: 280px repeat(4, 1fr);
  gap: 36px;
  padding-bottom: 40px;
}

@media (max-width: 1024px) {
  .footer-top-grid {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
}

@media (max-width: 560px) {
  .footer-top-grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }
}

.footer-brand-col {
  display: flex;
  flex-direction: column;
}

.footer-logo-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  text-decoration: none;
}

.footer-logo-img {
  width: 44px;
  height: 44px;
  object-fit: contain;
}

.footer-brand-text-block {
  display: flex;
  flex-direction: column;
}

.footer-brand-title {
  font-family: 'League Spartan', sans-serif;
  font-size: 1.05rem;
  font-weight: 900;
  letter-spacing: 0.09em;
  color: #FFFFFF;
  line-height: 1.1;
}

.footer-brand-subtitle {
  font-size: 0.65rem;
  color: #F4E6C1;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 700;
  margin-top: 3px;
}

.footer-tagline-text {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #64748B;
  text-transform: uppercase;
  margin-bottom: 18px;
}

.footer-social-row {
  display: flex;
  gap: 10px;
}

.footer-social-link {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94A3B8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.footer-social-link:hover {
  background: #F65E01;
  border-color: #F65E01;
  color: #FFFFFF;
  transform: translateY(-2px);
}

.footer-nav-col h4 {
  font-family: 'League Spartan', sans-serif;
  font-size: 0.82rem;
  font-weight: 800;
  color: #F4E6C1;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 6px 0;
}

.footer-accent-bar {
  width: 28px;
  height: 3px;
  background: #F65E01;
  border-radius: 2px;
  margin-bottom: 16px;
}

.footer-nav-col ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-nav-col a {
  color: #8FA5BC;
  font-size: 0.85rem;
  text-decoration: none;
  transition: color 0.18s ease, transform 0.18s ease;
  display: inline-block;
}

.footer-nav-col a:hover {
  color: #F65E01;
  transform: translateX(3px);
}

.footer-bottom-bar {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 20px 0;
  margin-top: 10px;
}

.footer-bottom-bar .exact-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.8rem;
  color: #64748B;
}

`;

css = css.substring(0, startIndex) + updatedFooterCSS + css.substring(endIndex);
fs.writeFileSync(cssPath, css, 'utf8');
console.log('✅ Estilos del footer actualizados exitosamente en index-exact.css');
