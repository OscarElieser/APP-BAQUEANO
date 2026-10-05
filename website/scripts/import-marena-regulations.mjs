#!/usr/bin/env node
/**
 * 🧭 BAQUEANO — IMPORTADOR MARENA: NORMATIVAS Y VEDAS
 * 🎯 POR QUÉ: llevar a Supabase solo datos ambientales con fuente oficial, sin duplicar ni publicar (Fases 33-34).
 * ⚙️ CÓMO: reglas comunes en lib/marena-import.mjs; datos en scripts/data/marena/*.json.
 * 📦 QUÉ:
 *   node website/scripts/import-marena-regulations.mjs           → modo prueba: SQL + reporte
 *   node website/scripts/import-marena-regulations.mjs --check   → falla si el SQL versionado está desactualizado
 *   DATABASE_URL=… node website/scripts/import-marena-regulations.mjs --apply --confirm   (SOLO con autorización)
 *   Salidas: supabase/imports/marena/marena-regulations.sql · website/docs/data-migration/marena-regulations-report.json
 */
import { runCli, buildRegulationsSql } from './lib/marena-import.mjs';

runCli({
  name: 'marena-regulations',
  title: 'NORMATIVAS Y VEDAS',
  build: buildRegulationsSql,
  reportExtra: (r, d) => ({ regulations: d.regulations.regulations.map((x) => ({ key: x.regulation_key, status: x.status })), wildlife_restrictions: d.vedas.restrictions.length, conflicting: d.vedas.restrictions.filter((w) => /conflicting/i.test(w.note || '')).map((w) => w.scientific_name) }),
});
