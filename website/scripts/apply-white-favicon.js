/**
 * 🧭 BAQUEANO — Actualizador de Favicon a baqueano_icono_2000x2000-blanco.png
 * Aplica el icono blanco oficial solicitado por el usuario a todas las referencias de pestaña.
 */
const fs = require('fs');
const path = require('path');

const websiteDir = path.join(__dirname, '..');
const sourceIcon = path.join(websiteDir, 'assets', 'logos', 'baqueano_icono_2000x2000-blanco.png');

if (!fs.existsSync(sourceIcon)) {
  console.error('No se encontró el icono fuente:', sourceIcon);
  process.exit(1);
}

// 1. Copiar a los destinos estándar de favicon
const copyTargets = [
  path.join(websiteDir, 'favicon.ico'),
  path.join(websiteDir, 'favicon.png'),
  path.join(websiteDir, 'assets', 'images', 'logo.png'),
  path.join(websiteDir, 'assets', 'images', 'baqueano_icono_2000x2000-blanco.png'),
  path.join(websiteDir, 'assets', 'images', 'LOGOS', 'baqueano_icono_2000x2000-blanco.png'),
  path.join(websiteDir, 'assets', 'images', 'LOGOS', 'logo.png')
];

copyTargets.forEach(tgt => {
  const dir = path.dirname(tgt);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(sourceIcon, tgt);
  console.log('✅ Copiado a:', tgt);
});

// 2. Actualizar manifest.json
const manifestPath = path.join(websiteDir, 'manifest.json');
if (fs.existsSync(manifestPath)) {
  let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.icons = [
    {
      src: "assets/logos/baqueano_icono_2000x2000-blanco.png",
      sizes: "2000x2000",
      type: "image/png",
      purpose: "any maskable"
    },
    {
      src: "assets/logos/baqueano_icono_2000x2000-blanco.png",
      sizes: "2000x2000",
      type: "image/png",
      purpose: "any"
    }
  ];
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log('✅ manifest.json actualizado.');
}

// 3. Estandarizar en todos los archivos HTML
const htmlFiles = fs.readdirSync(websiteDir).filter(f => f.endsWith('.html'));

const canonicalFaviconBlock = `  <!-- Favicon e Iconografía Oficial de Pestaña (baqueano_icono_2000x2000-blanco) -->
  <link rel="icon" type="image/png" sizes="32x32" href="assets/logos/baqueano_icono_2000x2000-blanco.png?v=20260930-white-2">
  <link rel="icon" type="image/png" sizes="192x192" href="assets/logos/baqueano_icono_2000x2000-blanco.png?v=20260930-white-2">
  <link rel="apple-touch-icon" sizes="180x180" href="assets/logos/baqueano_icono_2000x2000-blanco.png?v=20260930-white-2">
  <link rel="shortcut icon" href="favicon.ico?v=20260930-white-2">`;

let updatedHtml = 0;

htmlFiles.forEach(file => {
  const filePath = path.join(websiteDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Reemplazar el bloque anterior de favicon
  const regexFaviconBlock = /<!-- Favicon e Iconografía Oficial de Pestaña[^>]*-->[\s\S]*?<link rel="shortcut icon"[^>]*>/gi;
  if (regexFaviconBlock.test(content)) {
    content = content.replace(regexFaviconBlock, canonicalFaviconBlock);
  } else {
    // Si no está el bloque completo, limpiar cualquier link rel="icon" o similar
    content = content.replace(/\s*<link\s+rel=["'](?:shortcut\s+)?icon["'][^>]*>/gi, '');
    content = content.replace(/\s*<link\s+rel=["']apple-touch-icon["'][^>]*>/gi, '');
    content = content.replace('</head>', `${canonicalFaviconBlock}\n</head>`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  updatedHtml++;
  console.log(`✅ Favicon blanco integrado en: ${file}`);
});

console.log(`\n🎉 Completado en ${updatedHtml} páginas HTML.`);
