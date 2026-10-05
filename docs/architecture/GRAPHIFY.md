<!--
🎯 POR QUÉ: el propietario pidió agregar Graphify (https://github.com/OscarElieser/graphify) al trabajo.
  Convierte el repositorio en un grafo de conocimiento consultable: los agentes (Claude Code,
  Antigravity) se orientan con consultas pequeñas en lugar de leer cientos de archivos.
⚙️ CÓMO: herramienta de DESARROLLO (no se publica en el sitio). Instalación desde el fork; grafo
  generado solo por AST (sin API); salida graphify-out/ fuera de git; hooks seguros si no está instalado.
📦 QUÉ: instalación (Windows/Linux/macOS), uso, integración con Claude Code y Antigravity, mantenimiento.
  Verificado el 2026-10-05: graphifyy 0.9.76 · 9 607 nodos · 13 298 relaciones · 767 comunidades · 18 s.
-->
# Graphify en BAQUEANO

## Qué hace

Graphify recorre el código de BAQUEANO (Dart/Flutter, JavaScript, TypeScript, SQL de Supabase, Markdown) y construye un grafo de símbolos, archivos y relaciones. Así un agente responde "¿dónde se registra el consentimiento?" con una consulta pequeña en lugar de leer cientos de archivos.

- Etiqueta cada relación como `EXTRACTED` (leída en el código) o `INFERRED` (resuelta).
- `.graphifyignore` excluye binarios, assets, locales, builds e `ios/`, `web/` y `windows/`.

## Instalación (en tu computadora)

Requiere Python 3.10 o superior y [`uv`](https://docs.astral.sh/uv/).

```bash
uv tool install "graphifyy[sql] @ git+https://github.com/OscarElieser/graphify"
uv tool update-shell          # si `graphify` no aparece en el PATH
```

En la carpeta del proyecto (`APP-BAQUEANO`):

```bash
graphify update .             # genera graphify-out/ (solo AST, sin costo de API)
graphify antigravity install  # registra la skill en Google Antigravity
```

En PowerShell se escribe `graphify .` sin la barra inicial.

## Claude Code

Ya está configurado en el repositorio:

- `.claude/skills/graphify/`: la skill.
- `CLAUDE.md`: las reglas de consulta.
- `.claude/settings.json`: los hooks.
  - Al iniciar sesión, `.claude/hooks/graphify-session-start.sh` instala Graphify desde el fork si falta (requiere `uv`) y regenera el grafo.
  - Antes de buscar o leer, el hook recomienda `graphify query`.
  - Si Graphify no está instalado, todos los hooks son no-op y nunca bloquean.

## Uso

```bash
graphify query "dónde se valida track_event"
graphify path "global-injector" "baqueano-analytics"
graphify explain "consentimiento de cookies"
graphify update .        # después de modificar código
```

## Mantenimiento

- `graphify-out/` (unos 17 MB) está en `.gitignore`: se regenera en unos 18 s en cualquier computadora.
- Para actualizar la herramienta, sincroniza tu fork con `Graphify-Labs/graphify` y ejecuta `uv tool upgrade graphifyy`.
- El grafo orienta pero no es evidencia. El checklist 20/20 y la matriz Kronox se demuestran con pruebas, builds y consultas reales.
