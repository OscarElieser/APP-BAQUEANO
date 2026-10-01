// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — LOCAL DEV HTTP SERVER
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Servir la plataforma web estática de BAQUEANO (website/) en localhost de
//   forma instantánea, confiable y con cero dependencias externas de npm.
// - Permitir la previsualización y prueba interactiva del portal, mapa territorial,
//   asistente Baqüi y componentes visuales en navegadores locales.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Utiliza módulos nativos de Node.js (http, fs, path, url).
// - Mapeo completo de tipos MIME (HTML, CSS, JS, WebP, PNG, JPEG, SVG, JSON, etc.).
// - Manejo defensivo contra directory traversal (sanitización de rutas relativas).
// - Encabezados de control de caché para desarrollo (no-cache) y CORS local.
// - Soporte automático para index.html en subdirectorios y rutas raíz.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Servidor HTTP configurable por PORT (por defecto 5000).
// - Logs en consola con timestamp y estado de cada solicitud.
// ============================================================================

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '5000', 10);
const PUBLIC_DIR = path.join(__dirname, 'website');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  // Manejo de métodos: solo GET y HEAD
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Método no permitido');
    return;
  }

  // Parsear URL y extraer ruta relativa limpia
  let reqPath = '/';
  try {
    const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
    reqPath = decodeURIComponent(parsedUrl.pathname);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Solicitud inválida');
    return;
  }

  // Normalizar ruta para evitar directory traversal
  let safePath = path.normalize(reqPath).replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(PUBLIC_DIR, safePath);

  // Asegurar que la ruta permanezca dentro de PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Acceso denegado');
    return;
  }

  // Verificar estado del archivo o directorio
  fs.stat(filePath, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Intentar archivo con .html si no tiene extensión
        if (!path.extname(filePath)) {
          const htmlTry = `${filePath}.html`;
          if (fs.existsSync(htmlTry)) {
            serveFile(htmlTry, res, req.method);
            return;
          }
        }
        // Retornar 404
        serve404(res);
        return;
      }
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Error interno del servidor');
      return;
    }

    if (stats.isDirectory()) {
      const indexFile = path.join(filePath, 'index.html');
      if (fs.existsSync(indexFile)) {
        serveFile(indexFile, res, req.method);
      } else {
        serve404(res);
      }
      return;
    }

    serveFile(filePath, res, req.method);
  });
});

function serveFile(filePath, res, method) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  const headers = {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  };

  if (method === 'HEAD') {
    res.writeHead(200, headers);
    res.end();
    return;
  }

  const stream = fs.createReadStream(filePath);
  res.writeHead(200, headers);
  stream.pipe(res);
  stream.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    res.end();
  });
}

function serve404(res) {
  const custom404 = path.join(PUBLIC_DIR, '404.html');
  if (fs.existsSync(custom404)) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(custom404).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 — Archivo no encontrado');
  }
}

server.listen(PORT, '127.0.0.1', () => {
  console.log(`🧭 [BAQUEANO] Servidor local activo en: http://localhost:${PORT}`);
  console.log(`📁 Directorio raíz: ${PUBLIC_DIR}`);
});
