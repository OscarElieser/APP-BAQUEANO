<!--
🎯 POR QUÉ: Claude Code lee este archivo al iniciar; las reglas del proyecto viven en AGENTS.md
  (fuente única) y aquí solo se añade el uso del grafo de código Graphify.
⚙️ CÓMO: Graphify (fork OscarElieser/graphify) genera graphify-out/ (no versionado) en cada sesión
  mediante .claude/hooks/graphify-session-start.sh; los hooks PreToolUse son no-op si no está instalado.
📦 QUÉ: reglas de consulta del grafo. Guía completa: docs/architecture/GRAPHIFY.md.
-->
# BAQUEANO — Claude Code

**Las reglas del proyecto están en `AGENTS.md`** (bitácora en `SESSION_LOG.md` primero, no eliminar nada, i18n en 8 idiomas, sin verdes falsos, Android + web únicamente). Este archivo no las reemplaza.

## graphify

Este proyecto tiene un grafo de conocimiento en `graphify-out/`, con los nodos centrales, la estructura de comunidades y las relaciones entre archivos.

1. **Preguntas sobre el código.** Cuando exista `graphify-out/graph.json`, empezá por `graphify query "<pregunta>"`. Para relaciones usá `graphify path "<A>" "<B>"`, y para un concepto puntual `graphify explain "<concepto>"`.
2. **Navegación amplia.** Si existe `graphify-out/wiki/index.md`, usalo para orientarte.
3. **Informe completo.** Leé `graphify-out/GRAPH_REPORT.md` solo para revisar la arquitectura en conjunto.
4. **Después de modificar código**, ejecutá `graphify update .` para mantener el grafo al día. Usa solo el AST y no consume API.
5. **El grafo orienta, no prueba.** La evidencia del checklist sale siempre de pruebas, builds y consultas reales.
