// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — AUDITORÍA PROFUNDA DE RENDIMIENTO (audit_perf.cjs)
// ============================================================================
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Detectar cuellos de botella exactos en HTML, CSS, JS, imágenes, fuentes,
//   video, mapas, Firebase y Supabase para acelerar la navegación en móvil y desktop.
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Analiza estáticamente todas las páginas HTML, scripts referenciados, hojas de estilo,
//   imágenes sin lazy loading / decoding / dimensiones, scripts bloqueantes, videos y favicons.
// 📦 3. QUÉ (WHAT / ENTREGABLES):
// - Informe de hallazgos con métricas cuantitativas precisas.
// ============================================================================

const fs = require('fs');
const path = require('path');

const websiteDir = path.resolve(__dirname, '../website');
const htmlFiles = fs.readdirSync(websiteDir).filter(f => f.endsWith('.html'));

console.log('=== AUDITORÍA PROFUNDA DE RENDIMIENTO BAQUEANO ===');
console.log('Total páginas HTML analizadas:', htmlFiles.length);

// 1. Assets referenciados y sus tamaños
const references = new Map();

function scanForAssets(content) {
  const matches = content.match(/assets\/[^"'()<>\s]+/gi) || [];
  matches.forEach(m => {
    const clean = m.split('?')[0].split('#')[0].replace(/\\/g, '/');
    references.set(clean, (references.get(clean) || 0) + 1);
  });
}

const pageAudits = [];

htmlFiles.forEach(file => {
  const filePath = path.join(websiteDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  scanForAssets(content);

  // Análisis por página
  const audit = {
    file,
    sizeKB: Math.round(content.length / 1024),
    stylesheets: (content.match(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi) || []).length,
    externalStylesheets: (content.match(/<link[^>]+href=["']https?:\/\/[^>]+rel=["']stylesheet["'][^>]*>/gi) || []).length,
    inlineStyles: (content.match(/<style\b[^>]*>/gi) || []).length,
    scripts: (content.match(/<script\b[^>]*>/gi) || []).length,
    scriptsHead: ((content.split(/<\/head>/i)[0] || '').match(/<script\b[^>]*>/gi) || []).length,
    scriptsWithoutDeferAsync: 0,
    images: (content.match(/<img\b[^>]*>/gi) || []).length,
    imagesWithoutLazy: 0,
    imagesWithoutDimensions: 0,
    imagesPngJpg: 0,
    videos: (content.match(/<video\b[^>]*>/gi) || []).length,
    videosWithoutPreloadNone: 0,
    hasLeaflet: /leaflet/i.test(content),
    hasFirebase: /firebase/i.test(content),
    hasSupabase: /supabase/i.test(content)
  };

  // Inspect scripts
  const scriptTags = content.match(/<script\b[^>]*>/gi) || [];
  scriptTags.forEach(s => {
    if (/src=["']/i.test(s)) {
      if (!/defer/i.test(s) && !/async/i.test(s) && !/type=["']module["']/i.test(s)) {
        audit.scriptsWithoutDeferAsync++;
      }
    }
  });

  // Inspect images
  const imgTags = content.match(/<img\b[^>]*>/gi) || [];
  imgTags.forEach(img => {
    if (!/loading=["']lazy["']/i.test(img) && !/fetchpriority=["']high["']/i.test(img)) {
      audit.imagesWithoutLazy++;
    }
    if (!/width=/i.test(img) || !/height=/i.test(img)) {
      audit.imagesWithoutDimensions++;
    }
    if (/\.(png|jpe?g)["'?]/i.test(img)) {
      audit.imagesPngJpg++;
    }
  });

  // Inspect videos
  const videoTags = content.match(/<video\b[^>]*>/gi) || [];
  videoTags.forEach(v => {
    if (!/preload=["']none["']/i.test(v)) {
      audit.videosWithoutPreloadNone++;
    }
  });

  pageAudits.push(audit);
});

// Scan CSS files
const cssDir = path.join(websiteDir, 'css');
if (fs.existsSync(cssDir)) {
  const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
  cssFiles.forEach(c => scanForAssets(fs.readFileSync(path.join(cssDir, c), 'utf8')));
}
const stylesCss = path.join(websiteDir, 'styles.css');
if (fs.existsSync(stylesCss)) scanForAssets(fs.readFileSync(stylesCss, 'utf8'));

// Top referenced assets
const refList = [];
for (const [ref, count] of references.entries()) {
  const full = path.join(websiteDir, ref);
  if (fs.existsSync(full) && !fs.statSync(full).isDirectory()) {
    const sizeKB = Math.round(fs.statSync(full).size / 1024);
    refList.push({ ref, count, sizeKB });
  }
}
refList.sort((a,b) => b.sizeKB - a.sizeKB);

console.log('\n--- TOP 20 ASSETS REFERENCIADOS POR TAMAÑO ---');
refList.slice(0, 20).forEach(r => {
  console.log(`${r.sizeKB} KB (${r.count} refs): ${r.ref}`);
});

console.log('\n--- RESUMEN POR PÁGINAS HTML ---');
console.table(pageAudits.map(p => ({
  file: p.file,
  'HTML (KB)': p.sizeKB,
  'CSS Links': p.stylesheets,
  'Scripts': p.scripts,
  'Scripts no defer': p.scriptsWithoutDeferAsync,
  'Img total': p.images,
  'Img no lazy': p.imagesWithoutLazy,
  'Img no dim': p.imagesWithoutDimensions,
  'Img PNG/JPG': p.imagesPngJpg,
  'Video no preload=none': p.videosWithoutPreloadNone
})));
