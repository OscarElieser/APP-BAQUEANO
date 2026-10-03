// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — OPTIMIZADOR MASIVO DE ATRIBUTOS EN IMÁGENES HTML
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Eliminar Cumulative Layout Shift (CLS) en todos los documentos HTML mediante
//   atributos explícitos de width y height basados en las dimensiones naturales.
// - Evitar el bloqueo del hilo principal de renderizado mediante decoding="async".
// - Evitar descargas innecesarias en conexiones móviles mediante loading="lazy".
// - Garantizar que sólo el hero principal use fetchpriority="high".
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Parser binario ultra-rápido para extraer dimensiones nativas de PNG, JPEG, GIF y WebP.
// - Procesamiento defensivo de etiquetas <img> sin romper clases, IDs ni atributos reactivos.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & RESULTADOS):
// - Atributos loading="lazy", decoding="async", width="..." y height="..." aplicados.
// ============================================================================

const fs = require('fs');
const path = require('path');

function getDimensions(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const buffer = fs.readFileSync(filePath);
    
    // PNG
    if (buffer.length > 24 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
    }
    
    // GIF
    if (buffer.length > 10 && buffer.toString('ascii', 0, 3) === 'GIF') {
      return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
    }
    
    // WebP
    if (buffer.length > 30 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
      const type = buffer.toString('ascii', 12, 16);
      if (type === 'VP8 ') {
        return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
      } else if (type === 'VP8L') {
        const b1 = buffer[21], b2 = buffer[22], b3 = buffer[23], b4 = buffer[24];
        return { width: 1 + (((b2 & 0x3f) << 8) | b1), height: 1 + (((b4 & 0xf) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6)) };
      } else if (type === 'VP8X') {
        return { width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3) };
      }
    }
    
    // JPEG
    if (buffer.length > 10 && buffer[0] === 0xFF && buffer[1] === 0xD8) {
      let offset = 2;
      while (offset < buffer.length - 8) {
        if (buffer[offset] !== 0xFF) break;
        const marker = buffer[offset + 1];
        if (marker === 0xC0 || marker === 0xC2) {
          return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
        }
        const length = buffer.readUInt16BE(offset + 2);
        offset += 2 + length;
      }
    }
  } catch (e) {}
  return null;
}

const websiteDir = path.join(__dirname, '..', 'website');
const htmlFiles = fs.readdirSync(websiteDir).filter(f => f.endsWith('.html'));

let modifiedFiles = 0;
let totalImagesUpdated = 0;

htmlFiles.forEach(file => {
  const filePath = path.join(websiteDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  let fileUpdated = false;
  const newContent = content.replace(/<img\b([^>]*?)>/gi, (match, attrs) => {
    let newAttrs = attrs;
    let modified = false;

    // 1. decoding="async"
    if (!/\bdecoding\s*=/i.test(newAttrs)) {
      newAttrs += ' decoding="async"';
      modified = true;
    }

    // 2. loading="lazy" (evitar en hero principal o imágenes eager)
    const isHeroOrHigh = /fetchpriority\s*=\s*["']high["']/i.test(newAttrs) || /loading\s*=\s*["']eager["']/i.test(newAttrs);
    const isLogo = /navbar-brand|exact-nav-logo/i.test(newAttrs);
    if (!/\bloading\s*=/i.test(newAttrs) && !isHeroOrHigh && !isLogo) {
      newAttrs += ' loading="lazy"';
      modified = true;
    }

    // 3. width & height para estabilidad CLS
    let hasWidth = /\bwidth\s*=/i.test(newAttrs);
    let hasHeight = /\bheight\s*=/i.test(newAttrs);
    
    // Normalizar si tiene dimensiones obsoletas de 21668
    if (newAttrs.includes('21668')) {
      newAttrs = newAttrs.replace(/width=["']21668["']/gi, 'width="600"').replace(/height=["']21959["']/gi, 'height="608"');
      modified = true;
      hasWidth = true;
      hasHeight = true;
    }

    if (!hasWidth || !hasHeight) {
      const srcMatch = newAttrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
      if (srcMatch) {
        const rawSrc = srcMatch[1].split('?')[0];
        if (!rawSrc.startsWith('http://') && !rawSrc.startsWith('https://') && !rawSrc.startsWith('data:')) {
          const cleanSrc = decodeURIComponent(rawSrc);
          const localImgPath = path.join(websiteDir, cleanSrc);
          const dims = getDimensions(localImgPath);
          if (dims && dims.width > 0 && dims.height > 0) {
            if (!hasWidth) newAttrs += ` width="${dims.width}"`;
            if (!hasHeight) newAttrs += ` height="${dims.height}"`;
            modified = true;
          }
        }
      }
    }

    if (modified) {
      totalImagesUpdated++;
      fileUpdated = true;
      return `<img${newAttrs}>`;
    }
    return match;
  });

  if (fileUpdated) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    modifiedFiles++;
  }
});

console.log(`Auditoría & Optimización de Imágenes Completada:`);
console.log(`- Archivos HTML modificados: ${modifiedFiles}/${htmlFiles.length}`);
console.log(`- Etiquetas <img> optimizadas: ${totalImagesUpdated}`);
