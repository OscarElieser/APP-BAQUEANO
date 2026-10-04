# 🧭 BAQUEANO — 21st MCP (Magic MCP) para Antigravity

## 🎯 1. POR QUÉ (Why / Propósito)

Documentar la integración permanente, segura y verificada de **21st MCP** (la evolución de **Magic MCP**) en el entorno de desarrollo de Antigravity para el proyecto **BAQUEANO**, garantizando acceso a componentes modernos de UI, inspiración visual y aceleración de prototipado sin comprometer la seguridad ni la identidad territorial del proyecto.

---

## ⚙️ 2. CÓMO (How / Arquitectura e Implementación)

### 2.1 Evolución Tecnológica: Magic MCP → 21st MCP

El proyecto de `21st-dev/magic-mcp` evolucionó a la arquitectura oficial de **21st MCP**:
- **Servidor Remoto Oficial (HTTP MCP)**: `https://21st.dev/api/mcp`
- **Autenticación**: Header HTTP `x-api-key: ${API_KEY_21ST}`
- **Fallback Stdio (Legacy)**: `npx -y @21st-dev/magic@latest` con variable `API_KEY_21ST` (utilizado únicamente si el cliente no soporta transporte HTTP MCP).

### 2.2 Configuración en Antigravity

#### A. Nivel Global (CLI Antigravity)
El servidor está registrado globalmente en Antigravity a través de:
```powershell
agy mcp add --header "x-api-key: <API_KEY_21ST>" 21st https://21st.dev/api/mcp
```
Verificable con:
```powershell
agy mcp list
```

#### B. Nivel de Proyecto (`.mcp.json`)
Ubicado en la raíz de `APP-BAQUEANO/.mcp.json` para persistencia del espacio de trabajo:
```json
{
  "mcpServers": {
    "21st": {
      "url": "https://21st.dev/api/mcp",
      "headers": {
        "x-api-key": "${API_KEY_21ST}"
      }
    }
  }
}
```

#### C. Variables Locales Seguras
- `APP-BAQUEANO/.env` (ignorado en Git): contiene la clave asignada `API_KEY_21ST`.
- `APP-BAQUEANO/.env.example` (público): documenta la referencia `API_KEY_21ST=` sin valores sensibles.

---

### 2.3 Herramientas Descubiertas (Catálogo Real: 34 Tools)

El servidor expone las siguientes herramientas comprobadas mediante el protocolo MCP JSON-RPC 2.0:

1. **Búsqueda & Descubrimiento**:
   - `search`: Búsqueda de componentes, temas y plantillas por palabras clave.
   - `search_picker`: Selector inline de componentes.
   - `get_inspiration`: Recomendación contextual de UI e inspiración visual adaptada al proyecto.
   - `record_inspiration_feedback`: Registro de decisiones sobre inspiración propuesta.
   - `search_logo`: Búsqueda de logotipos en formato SVG.

2. **Obtención de Código & Estilos**:
   - `get_component`: Recupera el código fuente y dependencias del componente (vía `id`).
   - `get_theme`: Recupera los estilos CSS y tokens de diseño de un tema.

3. **Gestión de Cuenta & Cuotas**:
   - `get_usage`: Consulta el estado de la cuenta, plan (free/pro), cuota de búsquedas, retrievals diarios restantes y estado de generación IA.

4. **Gestión de Favoritos & Equipos**:
   - `list_bookmarks`, `bookmark`, `list_bookmark_lists`, `get_bookmark_list`, `create_bookmark_list`, `add_to_list`.
   - `list_teams`, `list_team_libraries`, `list_team_lists`, `list_team_components`.

5. **Generación IA & Jobs**:
   - `get_generation`, `get_generation_job`, `get_take`.
   - *Nota de uso*: Si `get_usage` reporta `aiGenerationEnabled: false`, no realizar llamadas a `generate` ni reintentar en bucle; trabajar con `search` + `get_component` y adaptar con el modelo del agente.

6. **Publicación & Perfil**:
   - `edit_component`, `submit_component`, `withdraw_component`, `resubmit_component`, `remove_component_from_catalog`, `delete_component`.
   - `edit_theme`, `delete_theme`, `edit_template`, `delete_template`.
   - `get_profile`, `edit_profile`, `upload_profile_media`.

---

### 2.4 Integración con Agent Skills

El flujo operativo vincula Agent Skills con 21st MCP:

```text
[Solicitud UI] 
   → spec-driven-development 
   → planning-and-task-breakdown 
   → 21st search / get_component 
   → Adaptación al Stack BAQUEANO (HTML/CSS/JS, sin React innecesario) 
   → frontend-ui-engineering 
   → browser-testing-with-devtools 
   → performance-optimization 
   → code-review-and-quality
```

---

### 2.5 Reglas Innegociables de BAQUEANO

1. **Cero Exposición de Secretos**: `API_KEY_21ST` nunca debe exponerse en el código cliente del sitio web (`website/`), en GitHub ni en logs de sesión.
2. **Preservación Arquitectónica**:
   - `website/` continúa publicándose mediante Firebase Hosting como web estática modular.
   - Si un componente de 21st está construido en React/TSX o Tailwind, debe **traducirse a Vanilla HTML/CSS/JS** y adoptar la paleta BAQUEANO (`#165D6F`, `#F65E01`, `#F4E6C1`, `#0F172A`).
   - Flutter Android (`lib/`, `android/`) se mantiene puro en Dart, usando 21st solo como referencia de UX/diseño.
   - La seguridad de Ops Center (`admin.html`) nunca descansa en el componente visual.
3. **Resiliencia Operativa**: Si 21st.dev no está disponible o la cuota diaria se agota, el desarrollo continúa sin interrupción utilizando Agent Skills y recursos locales del proyecto.

---

## 📦 3. QUÉ (What / Verificación y Comandos)

### Diagnóstico de Conexión y Cuota:
```powershell
# Verificar servidor activo en Antigravity
agy mcp list

# Probar estado de cuenta y cuotas
node -e "fetch('https://21st.dev/api/mcp', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.API_KEY_21ST }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'get_usage', arguments: {} } }) }).then(r=>r.json()).then(d=>console.log(d.result.content[0].text))"
```
