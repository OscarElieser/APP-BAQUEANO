#!/usr/bin/env node
/**
 * 🧭 BAQUEANO — IMPORTADOR MARENA: PLANES DE MANEJO
 * 🎯 POR QUÉ: llevar a Supabase solo datos ambientales con fuente oficial, sin duplicar ni publicar (Fases 33-34).
 * ⚙️ CÓMO: reglas comunes en lib/marena-import.mjs; datos en scripts/data/marena/*.json.
 * 📦 QUÉ:
 *   node website/scripts/import-marena-management-plans.mjs           → modo prueba: SQL + reporte
 *   node website/scripts/import-marena-management-plans.mjs --check   → falla si el SQL versionado está desactualizado
 *   DATABASE_URL=… node website/scripts/import-marena-management-plans.mjs --apply --confirm   (SOLO con autorización)
 *   Salidas: supabase/imports/marena/marena-management-plans.sql · website/docs/data-migration/marena-management-plans-report.json
 */
import { runCli, buildPlansSql } from './lib/marena-import.mjs';

runCli({
  name: 'marena-management-plans',
  title: 'PLANES DE MANEJO',
  build: buildPlansSql,
  reportExtra: (r, d) => ({ plans: d.plans.plans.length, with_confirmed_resolution: d.plans.plans.filter((p) => p.approval_reference).length, conflicting: d.plans.plans.filter((p) => p.status === 'conflicting').map((p) => p.area_key) }),
});
