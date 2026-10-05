#!/usr/bin/env bash
# 🎯 POR QUÉ: Graphify (fork OscarElieser/graphify) da a los agentes un grafo del código de
#   BAQUEANO; el grafo (graphify-out/, ~17 MB) no se versiona, así que cada sesión lo regenera.
# ⚙️ CÓMO: si falta el CLI y hay `uv`, lo instala desde el fork; luego `graphify update .`
#   (solo AST, sin coste de API). Nunca bloquea la sesión: cualquier fallo termina en 0.
# 📦 QUÉ: hook SessionStart de Claude Code (.claude/settings.json).
cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" || exit 0
if ! command -v graphify >/dev/null 2>&1 && command -v uv >/dev/null 2>&1; then
  timeout 240 uv tool install --quiet "graphifyy[sql] @ git+https://github.com/OscarElieser/graphify" >/dev/null 2>&1 || true
  export PATH="$HOME/.local/bin:$PATH"
fi
if command -v graphify >/dev/null 2>&1; then
  timeout 180 graphify update . >/dev/null 2>&1 || true
fi
exit 0
