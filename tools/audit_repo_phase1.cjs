// ============================================================================
// 🧭 BAQUEANO — AUDITORÍA PROFUNDA DE REPOSITORIO (FASE 1)
// ============================================================================
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');

let totalFiles = 0;
let totalDirs = 0;
let totalSizeBytes = 0;

const junkFiles = [];
const cacheDirs = [];
const largeFiles = [];
const sensitiveFiles = [];
const filesBySize = new Map();

// Ignorar directorios pesados y de caché para no degradar el escaneo
const HEAVY_CACHE_DIRS = new Set([
  '.git',
  'node_modules',
  '.pnpm-store',
  '.dart_tool',
  'build',
  '.gradle',
  '.snapshots',
  '.runtime',
  '.firebase',
  '.obsidian',
  'dist',
  'dist-hostinger'
]);

function getFileHash(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(buffer).digest('hex');
  } catch (e) {
    return null;
  }
}

function walkDir(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(ROOT, fullPath).replace(/\\/g, '/');
    const lower = entry.name.toLowerCase();

    if (entry.isDirectory()) {
      totalDirs++;
      if (HEAVY_CACHE_DIRS.has(lower) || HEAVY_CACHE_DIRS.has(entry.name)) {
        cacheDirs.push({ name: entry.name, path: relPath });
        continue; // No entrar recursivamente en directorios de dependencias o caches
      }
      walkDir(fullPath);
    } else if (entry.isFile()) {
      totalFiles++;
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch (e) {
        continue;
      }

      totalSizeBytes += stat.size;

      // 1. Detección de temporales, backups y basura del sistema
      const isJunk = 
        lower.endsWith('.tmp') ||
        lower.endsWith('.bak') ||
        lower.endsWith('.old') ||
        lower.endsWith('.swp') ||
        lower.endsWith('.crdownload') ||
        lower.endsWith('~') ||
        lower === 'thumbs.db' ||
        lower === 'desktop.ini' ||
        lower === '.ds_store' ||
        lower.includes('copia') ||
        lower.includes('copy') ||
        lower.includes('backup') ||
        lower.includes('final-final') ||
        lower.includes('respaldo');

      if (isJunk) {
        junkFiles.push({ path: relPath, sizeBytes: stat.size, sizeKB: (stat.size / 1024).toFixed(1), mtime: stat.mtime });
      }

      // 2. Archivos grandes (> 10MB)
      if (stat.size > 10 * 1024 * 1024) {
        largeFiles.push({
          path: relPath,
          sizeBytes: stat.size,
          sizeMB: (stat.size / (1024 * 1024)).toFixed(2)
        });
      }

      // 3. Secretos o archivos sensibles
      const isSensitive =
        lower.endsWith('.env') ||
        lower.endsWith('.pem') ||
        lower.endsWith('.key') ||
        lower.endsWith('.jks') ||
        lower.endsWith('.p12') ||
        lower.includes('id_rsa') ||
        lower.includes('serviceaccount') ||
        lower.includes('service-account') ||
        lower.includes('keystore') ||
        (lower.endsWith('.json') && (lower.includes('credential') || lower.includes('secret') || lower.includes('auth-key')));

      if (isSensitive) {
        sensitiveFiles.push({ path: relPath, sizeBytes: stat.size });
      }

      // 4. Posibles duplicados
      if (stat.size > 1024 && stat.size < 20 * 1024 * 1024) {
        if (!filesBySize.has(stat.size)) {
          filesBySize.set(stat.size, []);
        }
        filesBySize.get(stat.size).push(relPath);
      }
    }
  }
}

console.log('Iniciando escaneo optimizado...');
const startTime = Date.now();
walkDir(ROOT);

// Hash de archivos con tamaños idénticos
const exactDuplicates = [];
for (const [size, list] of filesBySize.entries()) {
  if (list.length > 1) {
    const hashGroups = new Map();
    for (const p of list) {
      const full = path.join(ROOT, p);
      const hash = getFileHash(full);
      if (!hash) continue;
      if (!hashGroups.has(hash)) {
        hashGroups.set(hash, []);
      }
      hashGroups.get(hash).push(p);
    }
    for (const [hash, group] of hashGroups.entries()) {
      if (group.length > 1) {
        exactDuplicates.push({
          sizeBytes: size,
          sizeKB: (size / 1024).toFixed(1),
          files: group
        });
      }
    }
  }
}

const duration = ((Date.now() - startTime) / 1000).toFixed(2);

const report = {
  durationSeconds: duration,
  totalFiles,
  totalDirs,
  totalSizeMB: (totalSizeBytes / (1024 * 1024)).toFixed(2),
  junkFiles,
  cacheDirs,
  largeFiles: largeFiles.sort((a, b) => b.sizeBytes - a.sizeBytes),
  sensitiveFiles,
  exactDuplicates: exactDuplicates.sort((a, b) => b.sizeBytes - a.sizeBytes)
};

fs.writeFileSync(path.join(ROOT, 'tools', 'audit_report.json'), JSON.stringify(report, null, 2), 'utf-8');
console.log(`Auditoría completada con éxito en ${duration}s. Archivos escaneados: ${totalFiles}. Guardado en tools/audit_report.json`);
