/**
 * 🧭 BAQUEANO — Estandarizador de Favicon Universal
 * Estandariza la iconografía oficial de BAQUEANO en todas las páginas públicas:
 * - /favicon.ico (sizes="any")
 * - /favicon-32x32.png (32x32)
 * - /favicon-16x16.png (16x16)
 * - /apple-touch-icon.png (180x180)
 * - /site.webmanifest
 * - theme-color: #165D6F
 */
const fs = require('fs');
const path = require('path');

const websiteDir = path.join(__dirname, '..');
const htmlFiles = fs.readdirSync(websiteDir).filter(f => f.endsWith('.html') && !/^google[a-f0-9]+\.html$/i.test(f));

const canonicalFaviconBlock = `  <!-- Favicon e Iconografía Oficial BAQUEANO -->
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">`;

let updatedCount = 0;

htmlFiles.forEach(file => {
  const filePath = path.join(websiteDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Remover comentarios de bloques de favicon anteriores
  content = content.replace(/\s*<!--\s*Favicon e Iconografía Oficial[^>]*-->/gi, '');

  // Remover cualquier <link rel="icon"...> o <link rel="apple-touch-icon"...> o <link rel="shortcut icon"...> o <link rel="manifest"...> existente
  const iconRegex = /\s*<link\s+[^>]*rel=["'](?:shortcut\s+)?icon["'][^>]*>/gi;
  const appleIconRegex = /\s*<link\s+[^>]*rel=["']apple-touch-icon["'][^>]*>/gi;
  const manifestRegex = /\s*<link\s+[^>]*rel=["']manifest["'][^>]*>/gi;

  let cleaned = content
    .replace(iconRegex, '')
    .replace(appleIconRegex, '')
    .replace(manifestRegex, '');

  // Asegurar que exista <meta name="theme-color" content="#165D6F">
  if (!/<meta\s+[^>]*name=["']theme-color["']/i.test(cleaned)) {
    // Si no tiene theme-color, lo añadimos al bloque
    cleaned = cleaned.replace('</head>', `  <meta name="theme-color" content="#165D6F">\n${canonicalFaviconBlock}\n</head>`);
  } else {
    // Si ya tiene theme-color, estandarizamos su valor a #165D6F
    cleaned = cleaned.replace(/<meta\s+[^>]*name=["']theme-color["'][^>]*>/i, '<meta name="theme-color" content="#165D6F">');
    cleaned = cleaned.replace('</head>', `${canonicalFaviconBlock}\n</head>`);
  }

  fs.writeFileSync(filePath, cleaned, 'utf8');
  updatedCount++;
  console.log(`✅ Favicon oficial insertado en: ${file}`);
});

console.log(`\n🎉 Estandarización completada en ${updatedCount} archivos HTML.`);
