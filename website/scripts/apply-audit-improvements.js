// ============================================================================
// 🧭 BAQUEANO — SCRIPT DE ACTUALIZACIONES AUDITORÍA (apply-audit-improvements.js)
// ============================================================================
// Aplica sistemáticamente las mejoras de la auditoría técnica en:
// 1. departamento.html (elimina 'Cargando Territorio...' y fija 15 deptos + 2 regiones)
// 2. mi-negocio.html (terminología institucional: contacto directo sin comisión)
// 3. experiencias.html (ajuste de sellos institucionales contrastados)
// 4. admin.html (coherencia de arquitectura Firebase + Supabase)
// 5. perfil.html (conexión con user-session.js y estado de autenticación)
// 6. firebase.json (redirecciones canónicas)
// ============================================================================

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');

// ── 1. departamento.html ────────────────────────────────────────────────────
const deptoPath = path.join(ROOT_DIR, 'departamento.html');
if (fs.existsSync(deptoPath)) {
  let content = fs.readFileSync(deptoPath, 'utf8');
  content = content.replace(
    /<h1 class="dept-title-big" id="deptTitle">Cargando Territorio\.\.\.<\/h1>/g,
    '<h1 class="dept-title-big" id="deptTitle">Territorios de Nicaragua</h1>'
  );
  content = content.replace(
    /<div class="dept-tagline" id="deptTagline"><\/div>/g,
    '<div class="dept-tagline" id="deptTagline">15 Departamentos &amp; 2 Regiones Autónomas</div>'
  );
  fs.writeFileSync(deptoPath, content, 'utf8');
  console.log('✅ departamento.html actualizado');
}

// ── 2. mi-negocio.html ──────────────────────────────────────────────────────
const negocioPath = path.join(ROOT_DIR, 'mi-negocio.html');
if (fs.existsSync(negocioPath)) {
  let content = fs.readFileSync(negocioPath, 'utf8');
  content = content.replace(
    /Cero comisiones abusivas/g,
    'Contacto directo sin comisión de intermediación foránea'
  );
  content = content.replace(
    /<div class="mi-negocio-inline-007">Comisión abusiva<\/div>/g,
    '<div class="mi-negocio-inline-007">Comisión foránea (-20%)</div>'
  );
  content = content.replace(
    /Tu comunidad merece ganar el 100% de lo que cobra/g,
    'Contacto directo con el viajero: tu comunidad recibe el 100% de lo pactado'
  );
  fs.writeFileSync(negocioPath, content, 'utf8');
  console.log('✅ mi-negocio.html actualizado');
}

// ── 3. experiencias.html ────────────────────────────────────────────────────
const expPath = path.join(ROOT_DIR, 'experiencias.html');
if (fs.existsSync(expPath)) {
  let content = fs.readFileSync(expPath, 'utf8');
  content = content.replace(
    /Paquetes Turísticos Verificados \(Mapa Nicaragua &amp; INTUR\)/g,
    'Paquetes Turísticos de Nicaragua (Mapa Nacional &amp; Fuentes Oficiales)'
  );
  content = content.replace(
    /<i class="fa-solid fa-circle-check" style="color: #10B981;"><\/i> Verificado por INTUR/g,
    '<i class="fa-solid fa-circle-check" style="color: #10B981;"></i> Información contrastada con fuentes turísticas oficiales'
  );
  fs.writeFileSync(expPath, content, 'utf8');
  console.log('✅ experiencias.html actualizado');
}

// ── 4. admin.html ───────────────────────────────────────────────────────────
const adminPath = path.join(ROOT_DIR, 'admin.html');
if (fs.existsSync(adminPath)) {
  let content = fs.readFileSync(adminPath, 'utf8');
  content = content.replace(
    /ARQUITECTURA HÍBRIDA · CATÁLOGO EDITORIAL PRECARGADO \(29 DESTINOS\) &amp; REGISTROS DINÁMICOS FIRESTORE/g,
    'ARQUITECTURA OFICIAL: FIREBASE (AUTH &amp; HOSTING) + SUPABASE (BASE TURÍSTICA &amp; AUDITORÍA)'
  );
  content = content.replace(
    /El ecosistema cuenta con <strong>29 destinos territoriales<\/strong> y <strong>14 cooperativas<\/strong> precargados estáticamente en el frontend para navegación instantánea sin consumo de cuota\. Los contadores en este panel reflejan registros creados dinámicamente en tiempo real desde la app y portal \(\/destinations, \/businesses en Cloud Firestore\)\./g,
    'El ecosistema cuenta con <strong>29 destinos territoriales</strong> y <strong>14 cooperativas</strong> verificadas, sincronizadas con <strong>Supabase</strong> como base de datos principal y <strong>Firebase</strong> para autenticación segura (RBAC) y distribución global CDN.'
  );
  fs.writeFileSync(adminPath, content, 'utf8');
  console.log('✅ admin.html actualizado');
}

// ── 5. perfil.html ──────────────────────────────────────────────────────────
const perfilPath = path.join(ROOT_DIR, 'perfil.html');
if (fs.existsSync(perfilPath)) {
  let content = fs.readFileSync(perfilPath, 'utf8');
  if (!content.includes('user-session.js')) {
    content = content.replace(
      '<script src="js/navigation.js"></script>',
      '<script src="js/user-session.js"></script>\n<script src="js/navigation.js"></script>'
    );
  }
  fs.writeFileSync(perfilPath, content, 'utf8');
  console.log('✅ perfil.html actualizado con user-session.js');
}

// ── 6. firebase.json ────────────────────────────────────────────────────────
const fbJsonPath = path.join(ROOT_DIR, '..', 'firebase.json');
if (fs.existsSync(fbJsonPath)) {
  let content = fs.readFileSync(fbJsonPath, 'utf8');
  content = content.replace(
    '"destination": "/baqueano-ai.html",\n        "type": 301',
    '"destination": "/baqueano-ia.html",\n        "type": 301'
  );
  fs.writeFileSync(fbJsonPath, content, 'utf8');
  console.log('✅ firebase.json actualizado');
}

console.log('\n🎉 Todas las actualizaciones aplicadas con éxito.');
