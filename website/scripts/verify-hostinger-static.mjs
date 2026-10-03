#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: Confirmar que el artefacto de Hostinger se puede servir y conserva las rutas críticas antes de publicarlo.
 * ⚙️ CÓMO: Levanta un servidor HTTP efímero sobre `dist-hostinger`, consulta recursos esenciales y lo cierra siempre.
 * 📦 QUÉ: Prueba local sin dependencias externas, credenciales ni cambios en infraestructura.
 */
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';

const output = path.resolve(process.cwd(), 'dist-hostinger');
const routes = [
  '/', '/404.html', '/destinos.html', '/departamento.html?depto=managua', '/baqueano-ia.html',
  '/js/global-injector.js', '/js/global-language.js', '/locales/es.json', '/manifest.json', '/service-worker.js'
];
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.css': 'text/css' };
const server = http.createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, 'http://127.0.0.1').pathname;
    const relative = pathname === '/' ? 'index.html' : decodeURIComponent(pathname.slice(1));
    const target = path.resolve(output, relative);
    if (!target.startsWith(`${output}${path.sep}`)) throw new Error('Ruta inválida');
    const body = await fs.readFile(target);
    response.writeHead(200, { 'Content-Type': mime[path.extname(target)] || 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
try {
  const address = server.address();
  for (const route of routes) {
    const response = await fetch(`http://127.0.0.1:${address.port}${route}`);
    if (!response.ok) throw new Error(`${route} devolvió HTTP ${response.status}`);
  }
  console.log(`Hostinger static verification passed: ${routes.length} critical routes.`);
} finally {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}
