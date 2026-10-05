#!/usr/bin/env bash
# 🎯 POR QUÉ: cada lote traducido se guarda en remoto al terminar (continuidad entre computadoras).
# ⚙️ CÓMO: fusiona los lotes indicados, regenera locales de la app, valida claves y sube la rama de trabajo.
# 📦 QUÉ: bash tools/i18n-batches/commit-batch.sh 08 09
set -euo pipefail
cd "$(dirname "$0")/../.."
node tools/i18n-batches/merge.mjs "$@"
(cd website && node scripts/validate-i18n.mjs | tail -1 && node scripts/i18n-audit.mjs | tail -1 || true)
npm --prefix website run export:app-locales >/dev/null 2>&1 || true
git add -A
git commit -q -m "i18n: lotes $* traducidos (6 idiomas)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VYEM9M4boywXmgbCadaKj1"
git push -q origin "$(git branch --show-current)"
git log --oneline -1
