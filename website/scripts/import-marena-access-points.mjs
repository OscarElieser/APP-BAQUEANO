#!/usr/bin/env node
/**
 * 🧭 BAQUEANO — IMPORTADOR MARENA: PUNTOS DE ACCESO
 * 🎯 POR QUÉ: llevar a Supabase solo datos ambientales con fuente oficial, sin duplicar ni publicar (Fases 33-34).
 * ⚙️ CÓMO: reglas comunes en lib/marena-import.mjs; datos en scripts/data/marena/*.json.
 * 📦 QUÉ:
 *   node website/scripts/import-marena-access-points.mjs           → modo prueba: SQL + reporte
 *   node website/scripts/import-marena-access-points.mjs --check   → falla si el SQL versionado está desactualizado
 *   DATABASE_URL=… node website/scripts/import-marena-access-points.mjs --apply --confirm   (SOLO con autorización)
 *   Salidas: supabase/imports/marena/marena-access-points.sql · website/docs/data-migration/marena-access-points-report.json
 */
import { runCli, buildAccessPointsSql } from './lib/marena-import.mjs';

runCli({
  name: 'marena-access-points',
  title: 'PUNTOS DE ACCESO',
  build: buildAccessPointsSql,
  reportExtra: (r) => ({ verified_access_points: r.sql.length, rejected: r.rejected }),
});
