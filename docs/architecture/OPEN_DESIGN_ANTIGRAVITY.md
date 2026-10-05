<!--
🎯 POR QUÉ: el propietario pidió instalar OpenDesign (https://github.com/nexu-io/open-design) para diseñar
  con agentes. Es una aplicación local (daemon + MCP), no una librería del sitio: instalarla dentro del
  repositorio añadiría 452 MB al build de producción y contradice AGENTS.md §9 (no copiar repos externos).
⚙️ CÓMO: se instala en la computadora del propietario y se conecta a Antigravity / Claude Code por MCP.
  BAQUEANO no depende de ella en tiempo de ejecución: solo la usa como herramienta de diseño.
📦 QUÉ: requisitos, instalación (Docker o CLI), conexión con Antigravity y Claude Code, reglas de uso y
  desinstalación. Revisado el 2026-10-05 sobre open-design v0.23.1 (Apache-2.0).
-->
# OpenDesign con Antigravity y Claude Code

## Qué es

OpenDesign es un espacio de trabajo de diseño con agentes (código abierto, Apache-2.0, v0.23.1). Corre **localmente** un servicio (`od` daemon, puerto `7456`) con 139 skills de diseño, sistemas de diseño y plantillas, y lo expone a agentes de código por **MCP**. No es parte del sitio BAQUEANO ni se publica en producción.

## Opción A — Docker (recomendada en Windows)

Requisitos: Docker Desktop con Compose v2.

```bash
git clone https://github.com/nexu-io/open-design.git
cd open-design/deploy
cp .env.example .env
openssl rand -hex 32        # copiar el valor en OD_API_TOKEN= dentro de .env
docker compose up -d
```

Abrir `http://127.0.0.1:7456`.

## Opción B — CLI sin Docker

Requisitos: Node.js 24 y pnpm 10.33 (Corepack).

```bash
npm install -g @open-design/cli
od daemon start --headless
```

## Conectar con los agentes

| Agente | Comando |
|---|---|
| Antigravity | `od mcp install antigravity` |
| Claude Code | `od mcp install claude` |
| Claude Desktop | `od mcp install claude-desktop` |

En Claude Code también puede agregarse como plugin del marketplace del propio repositorio:

```text
/plugin marketplace add nexu-io/open-design
/plugin install open-design@open-design
```

El plugin requiere que `od` esté en el `PATH` y que el daemon esté corriendo.

## Reglas de uso en BAQUEANO

Mismas reglas que 21st MCP (AGENTS.md):

1. **Herramienta de diseño, no de arquitectura.** Sus propuestas se adaptan a BAQUEANO, nunca se copian a ciegas.
2. **Paleta e identidad oficiales.** Colores `#165D6F`, `#F65E01`, `#F4E6C1`, `#0F172A`; identidad nicaragüense, comunitaria y cultural.
3. **Todo texto visible pasa por i18n.** Se usan claves en los 6 idiomas (AGENTS.md §9).
4. **Las puertas de calidad siguen vigentes.** Accesibilidad WCAG AA, rendimiento y seguridad se aplican igual que a cualquier cambio.
5. **No se copian archivos de OpenDesign al repositorio.** La única excepción es un componente concreto ya adaptado y revisado.
6. **Proveedores en la nube.** OpenDesign ofrece planes y proveedores de modelos (OpenDesign Go, BYOK). Cualquier costo o clave es decisión del propietario; nunca se guardan claves en el repositorio.

## Desinstalar

- Docker: `cd open-design/deploy && docker compose down`.
- CLI: `npm uninstall -g @open-design/cli`.
- MCP: eliminar la entrada `open-design` de la configuración MCP del agente.
