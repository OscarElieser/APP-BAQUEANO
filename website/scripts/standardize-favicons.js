/**
 * 🧭 BAQUEANO — Estandarizador de Favicon Universal
 * Asegura que todas las páginas HTML contengan el favicon oficial en la pestaña del navegador:
 * - favicon.ico en la raíz
 * - assets/images/logo.png (32x32)
 * - assets/images/baqueano_launcher_solid.png (192x192)
 * - apple-touch-icon (180x180)
 */
const fs = require('fs');
const path = require('path');

const websiteDir = path.join(__dirname, '..');
const htmlFiles = fs.readdirSync(websiteDir).filter(f => f.endsWith('.html'));

const canonicalFaviconBlock = `  <!-- Favicon e Iconografía Oficial de Pestaña -->
  <link rel="icon" type="image/png" sizes="32x32" href="assets/images/logo.png?v=20260930">
  <link rel="icon" type="image/png" sizes="192x192" href="assets/images/baqueano_launcher_solid.png?v=20260930">
  <link rel="apple-touch-icon" sizes="180x180" href="assets/images/logo.png?v=20260930">
  <link rel="shortcut icon" href="favicon.ico?v=20260930">`;

let updatedCount = 0;

htmlFiles.forEach(file => {
  const filePath = path.join(websiteDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Remover cualquier <link rel="icon"...> o <link rel="apple-touch-icon"...> o <link rel="shortcut icon"...> existente
  const iconRegex = /\s*<link\s+rel=["'](?:shortcut\s+)?icon["'][^>]*>/gi;
  const appleIconRegex = /\s*<link\s+rel=["']apple-touch-icon["'][^>]*>/gi;

  let cleaned = content.replace(iconRegex, '').replace(appleIconRegex, '');

  // Insertar el bloque canónico antes de </head>
  if (cleaned.includes('</head>')) {
    cleaned = cleaned.replace('</head>', `${canonicalFaviconBlock}\n</head>`);
    fs.writeFileSync(filePath, cleaned, 'utf8');
    updatedCount++;
    console.log(`✅ Favicon oficial insertado en: ${file}`);
  }
});

console.log(`\n🎉 Estandarización completada en ${updatedCount} archivos HTML.`);
