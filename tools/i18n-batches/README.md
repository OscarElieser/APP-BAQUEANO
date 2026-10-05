<!--
🎯 POR QUÉ: permitir que cualquier persona o computadora retome la traducción de la Fase 2 de i18n sin perder contexto.
⚙️ CÓMO: lotes fuente (es-NN) generados por el codemod website/scripts/i18n-migrate-html.mjs; traducciones (tx-NN) alineadas por índice.
📦 QUÉ: estado por lote y pasos para continuar.
-->
# Lotes de traducción — i18n Fase 2

**Rama:** `claude/sleepy-goodall-kqogrq`.

## Cómo continuar en otra computadora

1. `git fetch origin && git checkout claude/sleepy-goodall-kqogrq`.
2. Para cada lote pendiente, crear `tx-NN.json`: un arreglo de igual longitud que las claves de `es-NN.json`, donde cada elemento es `[en, fr, it, pt, de]`.
3. Ejecutar `node tools/i18n-batches/merge.mjs NN`.
4. Ejecutar `cd website && node scripts/validate-i18n.mjs && node scripts/i18n-audit.mjs`.
5. Confirmar y subir.

Cuando todos los lotes estén fusionados y la puerta muestre 0 errores, las 30 páginas HTML pasan a `main`.

## Estado

| Lote | Claves | Estado |
|---|---:|---|
| 00–06 | ~960 | ✅ Fusionados (`16cb27a`) |
| 07–11 | 566 | ✅ Fusionados |
| 12–23 | ~1 350 | ⏳ Pendientes |
