# Skills y herramientas de terceros — revisión e instalación (2026-10-06)

> 🎯 **POR QUÉ:** el propietario pidió agregar skills y herramientas externas. La regla del proyecto es no instalar código de origen desconocido sin revisarlo. Este documento deja constancia de qué se revisó, qué se instaló y qué no.
> ⚙️ **CÓMO:** cada repositorio se clonó fuera del proyecto y se revisó en busca de scripts, hooks, llamadas de red, manejo de claves, instrucciones que intenten cambiar el comportamiento del agente y licencia. Solo lo aprobado se copió a `.claude/skills/<nombre>/`, junto con su `LICENSE` y un `ORIGEN.md` (enlace, commit y cambios locales).
> 📦 **QUÉ:** el resultado por herramienta y cómo usar cada una.

## Instaladas como skills del proyecto (`.claude/skills/`)

| Skill | Origen | Licencia | Revisión | Uso en BAQUEANO |
|---|---|---|---|---|
| `prompt-master` | github.com/nidhinjs/prompt-master | MIT | Solo instrucciones; prohíbe incluir claves en los prompts generados. | Redactar o mejorar prompts para BAQUI, imágenes y video. |
| `web3d-integration-patterns` | github.com/freshtechbro/claudedesignskills | MIT | Solo documentación (Three.js, GSAP ScrollTrigger, R3F, Motion). | Referencia para heros 3D o animaciones de scroll. La web es HTML/JS sin React: adaptar, no copiar. |
| `find-skills` | github.com/vercel-labs/skills | MIT | Solo instrucciones; sugiere `npx skills add …`. | Buscar skills nuevas. **Toda skill que proponga se revisa igual que estas antes de agregarla.** |
| `scroll-world` | github.com/oso95/scroll-world | MIT | `knockout.py` solo procesa imágenes locales (Pillow) y `scrub-engine.js` solo carga los fotogramas del propio sitio. ⚠️ Genera los videos con **servicios pagos** (Higgsfield y Monid, cobro por clip en USD). | Hero tipo "vuelo por el mundo". Antes de usarla, el propietario decide si contrata esos servicios. Se reemplazó una palabra prohibida en `references/prompts.md` (ver `ORIGEN.md`). |

## Herramienta de línea de comandos

- **`agent-browser`** (vercel-labs), versión 0.27.0: se instaló con `npm install -g agent-browser` en el contenedor de esta sesión. Automatiza el navegador para agentes, como Playwright.
  - El contenedor es temporal: en una sesión nueva hay que volver a instalarlo. También se puede agregar ese comando al *setup script* del entorno en claude.ai.
  - En Antigravity o en tu PC: el mismo comando.

## No instaladas aquí, y por qué

- **Desktop Commander** (`npx @wonderwhy-er/desktop-commander@latest remote`): da control remoto de **tu computadora** (archivos y terminal) a un agente en la nube. Se ejecuta en tu PC, no en este contenedor.
  - Si lo usás, hacelo sabiendo que el agente podrá leer y ejecutar en tu equipo. Cerralo cuando no lo necesites.
  - Nunca lo apuntes a carpetas con claves (por ejemplo, `.env`).
- **OpenAlternative** (openalternative.co): es un sitio web, un directorio de alternativas de código abierto a herramientas comerciales. No hay nada que instalar; sirve como referencia para elegir herramientas.

## Precedencia

Estas skills no reemplazan `AGENTS.md`. Si una guía externa contradice una regla de BAQUEANO (paleta oficial, i18n en 6 idiomas, sin datos inventados, Supabase como base principal, Android únicamente), prevalece BAQUEANO.
