// ============================================================================
// 🧭 BAQUEANO — SCRIPT DE INYECCIÓN BATCH (inject-global.js)
// ============================================================================
// Añade global-injector.js a todas las páginas HTML del sitio que lo necesitan.
// Protege: admin.html (no se toca), mi-viaje.html (ya tiene footer oficial).
// Se ejecuta una sola vez: node scripts/inject-global.js
// ============================================================================

const fs   = require('fs');
const path = require('path');

const WEBSITE_DIR  = path.join(__dirname, '..');
const INJECTOR_TAG = '<script src="js/global-injector.js"></script>';
const NAV_TAG      = '<script src="js/navigation.js"></script>';

// Páginas a NO tocar
const SKIP = ['admin.html'];

const htmlFiles = fs.readdirSync(WEBSITE_DIR).filter(f => f.endsWith('.html'));

let injected = 0, skipped = 0, alreadyDone = 0;

htmlFiles.forEach(file => {
  if (SKIP.includes(file)) { skipped++; console.log('⛔ SKIP:', file); return; }

  const filePath = path.join(WEBSITE_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Si ya tiene el inyector, no volver a añadir
  if (content.includes('global-injector.js')) { alreadyDone++; console.log('✅ YA:', file); return; }

  // Añadir navigation.js si no existe
  if (!content.includes('navigation.js') && content.includes('</body>')) {
    content = content.replace('</body>', NAV_TAG + '\n</body>');
  }

  // Añadir global-injector.js justo antes de </body>
  content = content.replace('</body>', INJECTOR_TAG + '\n</body>');

  fs.writeFileSync(filePath, content, 'utf8');
  injected++;
  console.log('💉 INJECTED:', file);
});

console.log(`\n📊 Resumen:\n  Inyectados: ${injected}\n  Ya tenían: ${alreadyDone}\n  Saltados: ${skipped}`);
