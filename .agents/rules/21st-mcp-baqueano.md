---
trigger: always_on
---

# 🧭 BAQUEANO — 21st MCP & Orquestación de Diseño UI

## 🎯 1. POR QUÉ (Why / Propósito)

Proveer acceso estructurado al catálogo de componentes modernos y patrones visuales de **21st.dev (Magic MCP)** dentro del ecosistema BAQUEANO, acelerando la creación de interfaces de alta fidelidad sin comprometer la identidad turística territorial, la accesibilidad, el rendimiento web en Firebase Hosting ni la seguridad de Ops Center.

---

## ⚙️ 2. CÓMO (How / Arquitectura e Implementación)

### 2.1 Orquestación: Agent Skills + 21st MCP

21st MCP complementa la suite de ingeniería `agent-skills`, no la reemplaza:

```text
SOLICITUD DEL USUARIO 
  ↓ 
AGENT SKILLS (spec-driven-development → planning-and-task-breakdown)
  ↓ 
¿Es una tarea UI?
  ├─ SÍ → 21ST MCP (search → get_component / get_inspiration)
  │         ↓
  │       ADAPTACIÓN A BAQUEANO (HTML/CSS/JS modular, paleta de marca, responsive)
  │         ↓
  │       IMPLEMENTACIÓN INCREMENTAL (frontend-ui-engineering)
  │         ↓
  │       VERIFICACIÓN (browser-testing-with-devtools / responsive / a11y)
  │         ↓
  │       OPTIMIZACIÓN & SEGURIDAD (performance-optimization, security-and-hardening)
  │         ↓
  │       REVISIÓN DE CÓDIGO (code-review-and-quality)
  └─ NO → Flujo estándar de Agent Skills (backend, db, tests, etc.)
```

### 2.2 Cuándo Activar 21st MCP

Activar automáticamente ante tareas de:
- Componentes UI: navegación, header, footer, hero, cards territoriales, botones, modales, formularios.
- Dashboards y paneles administrativos: Ops Center (`admin.html`), KPI cards, data tables, filtros, modales CRUD.
- Experiencias interactivas: Mi Viaje, Baqueano Digital, itinerarios, mapas, SOS chat, búsqueda.
- Rediseños, templates, paletas y elevación del estándar estético visual.

### 2.3 Cuándo NO Utilizar 21st MCP

No utilizar 21st para:
- Lógica de negocio pura, algoritmos de cálculo, servicios backend Node.js.
- SQL, esquemas, funciones, triggers o migraciones de Supabase.
- Reglas de seguridad Firebase (`firestore.rules`, `storage.rules`, App Check).
- Autenticación, tokens, roles y autorización en servidor.
- Lógica de estado o controladores Dart/Flutter sin relación con patrones visuales.

### 2.4 Reglas de Adaptación e Identidad de Marca BAQUEANO

1. **Cero Copy-Paste Ciego**: Todo componente obtenido se deconstruye y adapta a los estándares de BAQUEANO.
2. **Paleta Oficial**: Integrar `#165D6F` (Petróleo Teal), `#F65E01` (Naranja Fuego Terracota), `#F4E6C1` (Crema Arena Pinolera), `#0F172A` (Noche Profunda) y colores de soporte territoriales.
3. **Pila Tecnológica del Website**: `website/` es estático en Firebase Hosting (HTML5, Vanilla CSS, JS modular). No introducir React, Tailwind o bibliotecas pesadas solo porque el componente original de 21st esté en React. Traducir al stack local.
4. **Ops Center (`admin.html`)**: Usar 21st para componentes de dashboard, pero NUNCA delegar la seguridad, validaciones o autorización al componente visual. La autorización se valida en servidor/Supabase.
5. **Flutter Android (`lib/`, `android/`)**: Usar 21st exclusivamente como referencia visual y de UX. Implementar nativamente en Dart/Flutter cumpliendo el estándar de rendimiento (`RepaintBoundary`, `.withValues(alpha: X)`).
6. **Manejo de Generación IA (`aiGenerationEnabled`)**:
   - Si la cuenta tiene `aiGenerationEnabled: false`, NO invocar en bucle `generate` o `iterate_generation`.
   - Utilizar `search`, `get_component`, `get_inspiration` y adaptar el código con el propio agente.

### 2.5 Seguridad y Cuotas

- `API_KEY_21ST` es un secreto exclusivo de desarrollo. Prohibido exponerla en el navegador (`window`, scripts, commits, repositorios o logs).
- Respetar cuotas diarias de retrieval de la cuenta (usar `get_usage` para diagnosticar estado).
- Optimizar assets (imágenes en WebP, SVGs limpios) para no incrementar el consumo de transferencia en Firebase Hosting.

---

## 📦 3. QUÉ (What / Entregables y Configuración)

- **Servidor MCP**: `21st` (`https://21st.dev/api/mcp`).
- **Configuración Local**: `.mcp.json` con referencia a `${API_KEY_21ST}`.
- **Configuración Global Antigravity**: `%USERPROFILE%\.gemini\config\mcp_config.json`.
- **Manual de Operaciones**: `docs/21ST_MCP_ANTIGRAVITY.md`.
