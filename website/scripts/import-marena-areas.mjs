#!/usr/bin/env node
/**
 * 🧭 BAQUEANO — IMPORTADOR MARENA: ÁREAS PROTEGIDAS
 * 🎯 POR QUÉ: llevar a Supabase solo datos ambientales con fuente oficial, sin duplicar ni publicar (Fases 33-34).
 * ⚙️ CÓMO: reglas comunes en lib/marena-import.mjs; datos en scripts/data/marena/*.json.
 * 📦 QUÉ:
 *   node website/scripts/import-marena-areas.mjs           → modo prueba: SQL + reporte
 *   node website/scripts/import-marena-areas.mjs --check   → falla si el SQL versionado está desactualizado
 *   DATABASE_URL=… node website/scripts/import-marena-areas.mjs --apply --confirm   (SOLO con autorización)
 *   Salidas: supabase/imports/marena/marena-areas.sql · website/docs/data-migration/marena-areas-report.json
 */
import { runCli, buildAreasSql } from './lib/marena-import.mjs';

runCli({
  name: 'marena-areas',
  title: 'ÁREAS PROTEGIDAS',
  build: buildAreasSql,
  reportExtra: (r) => ({ areas: r.matches.length, linked_to_existing_place: r.matches.filter((m) => m.match).map((m) => ({ area: m.plan.area_key, place_id: m.match.id, place_name: m.match.name, place_published: m.match.is_published })), new_unpublished_places: r.matches.filter((m) => !m.match && !m.ambiguous.length).length, ambiguous: r.matches.filter((m) => m.ambiguous.length).map((m) => ({ area: m.plan.area_key, candidates: m.ambiguous })), possible_same_entity_for_ops_review: r.matches.filter((m) => m.possibleSameEntity.length).map((m) => ({ area: m.plan.area_key, candidates: m.possibleSameEntity })) }),
});
