# BAQUEANO — Agent Skills para Antigravity

## 🎯 POR QUÉ (Why / Propósito)

Documentar la integración nativa y persistente de `addyosmani/agent-skills` con Antigravity CLI para que futuras sesiones de BAQUEANO descubran procedimientos y agentes especializados sin duplicar el repositorio externo.

## ⚙️ CÓMO (How / Arquitectura e Implementación)

### Estado instalado

- CLI: Antigravity `agy` 1.0.8.
- Plugin: `agent-skills` 0.6.11.
- Origen: `https://github.com/addyosmani/agent-skills.git`.
- Instalación global: `%USERPROFILE%\.gemini\config\plugins\agent-skills\`.
- Componentes detectados: 25 skills, 4 agentes y 9 comandos heredados convertidos.
- BAQUEANO conserva su `AGENTS.md`; el `AGENTS.md` externo no se copia ni sustituye reglas locales.

### Instalación y verificación

```powershell
agy --version
agy plugin install https://github.com/addyosmani/agent-skills.git
agy plugin list
```

`agy plugin list` debe incluir un import llamado `agent-skills` con los componentes `skills`, `agents` y `commands`.

### Actualización segura

1. Confirmar que el repositorio BAQUEANO está limpio.
2. Ejecutar `agy plugin list` y anotar la versión instalada desde `plugin.json`.
3. Usar el procedimiento de actualización compatible con la versión instalada de Antigravity. Si no existe actualización directa del plugin, desinstalar y reinstalar únicamente después de confirmar que no hay personalizaciones dentro del directorio global del plugin.
4. Volver a comprobar catálogo, agentes y pruebas de routing.
5. No reemplazar `pnpm-lock.yaml`, dependencias de BAQUEANO ni configuraciones Firebase/Supabase durante esta operación.

### Descubrimiento automático

Antigravity lee las descripciones de los skills y selecciona bajo demanda el procedimiento relacionado con la intención. La regla `.agents/rules/agent-skills-baqueano.md` agrega el contexto arquitectónico local y evita cargar todos los skills simultáneamente.

Rutas principales:

| Intención | Skills esperados |
|---|---|
| Nueva funcionalidad | `spec-driven-development`, `planning-and-task-breakdown`, `incremental-implementation`, `test-driven-development`, `code-review-and-quality` |
| Bug | `debugging-and-error-recovery`, `test-driven-development`, `code-review-and-quality` |
| Backend/API | `api-and-interface-design`, `security-and-hardening`, `test-driven-development`, `observability-and-instrumentation` |
| Firebase/Supabase | `constraint-driven-development`, `deprecation-and-migration`, `security-and-hardening`, `test-driven-development` |
| Website | `frontend-ui-engineering`, `browser-testing-with-devtools`, `performance-optimization`, `security-and-hardening`, `code-review-and-quality` |
| Entrega | `shipping-and-launch`, `security-and-hardening`, `code-review-and-quality` |

### Invocación manual

Las invocaciones namespaced son la referencia canónica:

```text
/agent-skills:spec-driven-development
/agent-skills:constraint-driven-development
/agent-skills:planning-and-task-breakdown
/agent-skills:incremental-implementation
/agent-skills:test-driven-development
/agent-skills:code-review-and-quality
/agent-skills:code-simplification
/agent-skills:shipping-and-launch
```

En Antigravity 1.1.x y versiones cercanas, los wrappers heredados como `/build`, `/test`, `/review` y `/ship` pueden ser convertidos correctamente pero no aparecer en el catálogo. Esto no afecta las invocaciones namespaced de los skills.

### Agentes especializados

- `code-reviewer`: revisión estructurada de corrección, calidad y mantenibilidad.
- `security-auditor`: revisión de autenticación, autorización, secretos y superficies de ataque.
- `test-engineer`: estrategia y cobertura de pruebas.
- `web-performance-auditor`: rendimiento de Website y Core Web Vitals.

Son especialistas auxiliares; el agente principal mantiene la responsabilidad y aplica las reglas de BAQUEANO.

### Resolución de problemas

1. Si `agy` tarda al iniciar, esperar a que complete su verificación interna y volver a ejecutar `agy --version`.
2. Si el plugin no aparece, revisar `%USERPROFILE%\.gemini\config\plugins\agent-skills\plugin.json` y ejecutar `agy plugin list`.
3. Si los aliases cortos no aparecen, usar `/agent-skills:<skill>`.
4. Si el catálogo no se refresca, cerrar Antigravity, iniciar una sesión nueva en la raíz de BAQUEANO y abrir `/skills`.
5. Si una instalación local necesita validación, ejecutar `agy plugin validate <ruta-del-clon>`; no clonar dentro de BAQUEANO.
6. Nunca solucionar un problema copiando todos los `SKILL.md` a `.agents/rules/`.

### Autenticación requerida para pruebas headless

La instalación, listado y validación del plugin no requieren una conversación autenticada. Las pruebas `agy -p`, en cambio, necesitan una sesión Google activa. Si devuelven `authentication failed or timed out`, abrir una sesión interactiva de `agy`, completar el OAuth mostrado en el navegador, cerrar la sesión y repetir las pruebas headless. No guardar códigos OAuth, tokens ni credenciales en el repositorio o en la bitácora.

### Desinstalación segura

```powershell
agy plugin uninstall agent-skills
agy plugin list
```

La desinstalación elimina el plugin global, pero no debe borrar `AGENTS.md`, `.agents/rules/agent-skills-baqueano.md`, esta documentación ni ningún archivo funcional de BAQUEANO. Si se decide retirar también la política local, hacerlo en un cambio Git independiente y reversible.

## 📦 QUÉ (What / Funcionalidad y Entregables)

La integración ofrece activación automática por intención, invocación namespaced, cuatro agentes especializados y una política BAQUEANO que preserva Android, Firebase Hosting, Firebase Authentication, Supabase, Functions, Genkit y el Ops Center.
