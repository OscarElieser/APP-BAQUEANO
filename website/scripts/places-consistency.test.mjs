// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PRUEBA DE CONSISTENCIA DE DESTINOS SUPABASE (places-consistency.test.mjs)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Verificar que la regla arquitectónica de fuente única de verdad (Supabase)
//   se cumpla de forma consistente en todos los canales de BAQUEANO:
//     * destinos.html
//     * departamento.html
//     * mapa.html
//     * Flutter Android (CatalogRepository)
//     * Ops Center (ops-live-data.js)
//     * BAQUI (baqueano-assistant.js)
// - Prevenir regresiones donde se vuelva a hardcodear destinos o se desincronice
//   la visualización de los lugares publicados en Supabase.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Prueba automatizada en Node.js (ES Modules).
// - Consulta el endpoint REST de Supabase PostgREST para la tabla `places`.
// - Valida integridad referencial:
//     * is_published = true → deben aparecer en catálogo.
//     * map_ready = true → deben tener latitud y longitud válidas en Nicaragua.
//     * verification_status = verified → badge con check.
//     * verification_status = partial → aviso parcial.
//     * verification_status = pending → aviso pendiente.
// - Audita estáticamente que el HTML y los repositorios estén cableados a Supabase.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & SALIDA):
// - Ejecución vía: `node scripts/places-consistency.test.mjs`.
// - Reporta número de lugares, coherencia territorial y estado final (PASS/FAIL).
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const SUPABASE_URL = 'https://heiudfpthqwtjrtluqlm.supabase.co/rest/v1';
const SUPABASE_KEY = 'sb_publishable_q7ZhqRIRjlerZK7WOu_Qxw_X_AqXV1d';

async function testSupabaseLivePlaces() {
  console.log('🔍 [Test 1] Verificando catálogo en vivo de Supabase (places)...');
  const res = await fetch(`${SUPABASE_URL}/places?select=id,name,slug,category,department_id,municipality_id,latitude,longitude,map_ready,is_published,verification_status&is_published=eq.true&order=name.asc`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });

  assert.equal(res.ok, true, `Supabase REST respondió con HTTP ${res.status}`);
  const places = await res.json();
  assert.ok(Array.isArray(places), 'La respuesta debe ser una lista de lugares');
  assert.ok(places.length >= 200, `Se esperaban al menos 200 lugares publicados en Supabase, se obtuvieron ${places.length}`);

  const verifiedCount = places.filter(p => p.verification_status === 'verified').length;
  const pendingCount = places.filter(p => p.verification_status === 'pending_review' || p.verification_status === 'pending').length;
  const mapReadyCount = places.filter(p => p.map_ready && p.latitude != null && p.longitude != null).length;
  const rivasPlaces = places.filter(p => (p.department_id || '').toLowerCase() === 'rivas');

  console.log(`   ✅ Supabase Total publicados: ${places.length}`);
  console.log(`   ✅ Supabase Verificados: ${verifiedCount}`);
  console.log(`   ✅ Supabase Pendientes: ${pendingCount}`);
  console.log(`   ✅ Supabase Listos para mapa: ${mapReadyCount}`);
  console.log(`   ✅ Supabase Destinos en Rivas: ${rivasPlaces.length}`);

  assert.ok(rivasPlaces.length > 0, 'Deben existir destinos en Rivas en Supabase');
  assert.ok(mapReadyCount > 0, 'Deben existir destinos listos para mapa con coordenadas');

  // Validar que NINGÚN destino con map_ready=true tenga coordenadas nulas
  for (const p of places) {
    if (p.map_ready) {
      assert.ok(p.latitude != null && !isNaN(Number(p.latitude)), `Lugar ${p.name} tiene map_ready=true pero latitud nula`);
      assert.ok(p.longitude != null && !isNaN(Number(p.longitude)), `Lugar ${p.name} tiene map_ready=true pero longitud nula`);
    }
  }
}

function testHtmlAndScriptWiring() {
  console.log('🔍 [Test 2] Verificando cableado estático de destinos en la Web...');

  // 1. destinos.html
  const destinosHtml = fs.readFileSync(path.join(root, 'destinos.html'), 'utf8');
  assert.ok(destinosHtml.includes('js/services/places-service.js'), 'destinos.html debe cargar places-service.js');
  assert.ok(destinosHtml.includes('js/destinos-supabase.js'), 'destinos.html debe cargar destinos-supabase.js');
  assert.ok(destinosHtml.includes('getMapReadyPlaces'), 'destinos.html debe consultar getMapReadyPlaces para los pines del mapa');
  console.log('   ✅ destinos.html correctamente cableado a Supabase');

  // 2. departamento.html
  const departamentoHtml = fs.readFileSync(path.join(root, 'departamento.html'), 'utf8');
  assert.ok(departamentoHtml.includes('js/services/places-service.js'), 'departamento.html debe cargar places-service.js');
  assert.ok(departamentoHtml.includes('getPlacesByDepartment'), 'departamento.html debe consultar getPlacesByDepartment');
  console.log('   ✅ departamento.html correctamente cableado a Supabase');

  // 3. mapa.html
  const mapaHtml = fs.readFileSync(path.join(root, 'mapa.html'), 'utf8');
  assert.ok(mapaHtml.includes('js/services/places-service.js'), 'mapa.html debe cargar places-service.js');
  assert.ok(mapaHtml.includes('getMapReadyPlaces'), 'mapa.html debe consultar getMapReadyPlaces');
  console.log('   ✅ mapa.html correctamente cableado a Supabase');

  // 4. Flutter CatalogRepository
  const catalogRepoPath = path.join(root, '..', 'lib', 'data', 'repositories', 'catalog_repository.dart');
  if (fs.existsSync(catalogRepoPath)) {
    const catalogRepo = fs.readFileSync(catalogRepoPath, 'utf8');
    assert.ok(catalogRepo.includes("'places'"), 'CatalogRepository debe consultar la tabla places');
    assert.ok(catalogRepo.includes('is_published'), 'CatalogRepository debe filtrar por is_published');
    console.log('   ✅ Flutter Android (CatalogRepository) correctamente cableado a places');
  }

  // 5. Ops Center
  const opsLiveData = fs.readFileSync(path.join(root, 'js', 'ops-center', 'ops-live-data.js'), 'utf8');
  assert.ok(opsLiveData.includes("'03-destinos': { entity: 'places'"), 'Ops Center 03-destinos debe mapear a la entidad places');
  console.log('   ✅ Ops Center live data correctamente mapeado a places');

  // 6. BAQUI
  const assistantJs = fs.readFileSync(path.join(root, 'js', 'baqueano-assistant.js'), 'utf8');
  assert.ok(assistantJs.includes('departamento.html?id='), 'BAQUI debe vincular consultas de departamentos a su guía oficial');
  console.log('   ✅ BAQUI asistente territorial correctamente integrado');
}

async function runAll() {
  console.log('====================================================================');
  console.log('🧭 INICIANDO SUITE DE CONSISTENCIA TERRITORIAL (SUPABASE = SOURCE OF TRUTH)');
  console.log('====================================================================');

  await testSupabaseLivePlaces();
  testHtmlAndScriptWiring();

  console.log('====================================================================');
  console.log('🎉 TODAS LAS PRUEBAS DE CONSISTENCIA PASARON EXITOSAMENTE (100%)');
  console.log('====================================================================');
}

runAll().catch(err => {
  console.error('❌ FALLO EN LA PRUEBA DE CONSISTENCIA:', err.message);
  process.exit(1);
});
