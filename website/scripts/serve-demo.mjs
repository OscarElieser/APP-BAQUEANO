// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SERVIDOR LOCAL EFÍMERO PARA AUDITORÍA Y DEMO BROWSER
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Servir la web oficial estática de BAQUEANO con baja latencia y alta fidelidad
//   para permitir la ejecución del demo oficial en video y verificación en vivo.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - HTTP nativo de Node.js sin dependencias externas; resolución de MIME types
//   estándar (HTML, CSS, JS, JSON, imágenes, webmanifest, SVG).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Escucha en http://127.0.0.1:8088 y resuelve rutas contra el directorio website/.
// ============================================================================

import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(
  process.env.BAQUEANO_STATIC_ROOT || path.join(__dirname, '..', 'dist-hostinger')
);
const PREFERRED_PORT = Number(process.env.BAQUEANO_LOCAL_PORT || 8088);
const FALLBACK_PORT = 18088;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

const server = http.createServer(async (req, res) => {
  try {
    const host = req.headers.host || `127.0.0.1:${PREFERRED_PORT}`;
    const url = new URL(req.url, `http://${host}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/') pathname = '/index.html';
    if (pathname === '/health') pathname = '/health.json';
    
    let filePath = path.resolve(ROOT, `.${pathname}`);
    
    // Si no existe en la raíz pero existe en dist-hostinger (p.ej. health.json, version.json)
    if (pathname === '/health.json' || pathname === '/version.json') {
      const distCandidate = path.resolve(ROOT, 'dist-hostinger', pathname.slice(1));
      try {
        await fs.access(distCandidate);
        filePath = distCandidate;
      } catch {}
    }
    
    // Seguridad: evitar path traversal
    if (filePath !== ROOT && !filePath.startsWith(`${ROOT}${path.sep}`)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      return res.end('Prohibido');
    }

    const stat = await fs.stat(filePath);
    let targetPath = filePath;
    if (stat.isDirectory()) {
      targetPath = path.join(filePath, 'index.html');
    }

    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';
    const content = await fs.readFile(targetPath);

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    res.end(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 No encontrado');
    } else {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`500 Error: ${err.message}`);
    }
  }
});

function listen(port, allowFallback = true) {
  server.once('error', (error) => {
    if (
      allowFallback &&
      error.code === 'EADDRINUSE' &&
      !process.env.BAQUEANO_LOCAL_PORT
    ) {
      console.warn(
        `[BAQUEANO SERVER] Puerto ${port} ocupado; usando http://127.0.0.1:${FALLBACK_PORT}`,
      );
      listen(FALLBACK_PORT, false);
      return;
    }
    throw error;
  });

  server.listen(port, '127.0.0.1', () => {
    console.log(`[BAQUEANO SERVER] Servidor activo en http://127.0.0.1:${port}`);
    console.log(`[BAQUEANO SERVER] Raiz estatica: ${ROOT}`);
  });
}

listen(PREFERRED_PORT);
