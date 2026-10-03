# ⚙️ BAQUEANO — Auditoría Backend y BAQUI (Fase 1)

## 🎯 POR QUÉ

Hay tres backends y cinco implementaciones de asistente IA. Para Sprint 2/3 se necesita **una** API demostrable (Azure) y **un** BAQUI coherente que no invente datos.

## ⚙️ CÓMO

Lectura de `functions/`, `src/`, `supabase/functions/`, scripts IA en `website/js/` y servicios IA en `lib/`.

## 📦 QUÉ

### Backends existentes

| Backend | Ubicación | Qué expone | Estado |
| --- | --- | --- | --- |
| Firebase Functions v2 (Node 20) | `functions/index.js` + `functions/lib/*` | `healthCheck`, `api` (enrutado por `/api/**` en Hosting): chat IA, búsqueda, itinerarios, geoespacial, métricas públicas, respaldo | Tiene pruebas (`functions/test/*.test.js`, 5 archivos); `node_modules` ausente, no se pudieron ejecutar |
| Genkit raíz | `src/index.js`, `src/validation.js`, `prompts/*.prompt` | Flujos Genkit/Gemini | CI solo ejecuta `node -c src/index.js` |
| Supabase Edge Functions (Deno) | `supabase/functions/baqueano-ai` (522 líneas), `baqueano-status` | BAQUI: itinerarios con Gemini `gemini-3.5-flash-lite` + `url_context`, fallback local, guarda `travel_plans` | `verify_jwt=false`, CORS `*`, sin rate-limit (SEC-P1-03) |

### BAQUI — scripts en el Website

| Script | Tamaño | Cargado | Rol aparente |
| --- | --- | --- | --- |
| `baqueano-assistant.js` | 86 KB | ✅ 3 páginas | Asistente principal actual |
| `baqueano-api.js` | — | ✅ 2 páginas | Cliente HTTP |
| `baqui-evolved.js` | 42 KB | ❌ sin referencia | Versión evolucionada no conectada |
| `baqueano-ai.js` | — | ❌ sin referencia | Integra Supabase (inactivo) |
| `ai-assistant.js` | — | ❌ sin referencia | Versión antigua |

En Android: `lib/services/baqueano_ai_service.dart`, `lib/core/ai/baqueano_rag_retriever.dart`, `lib/core/security/ai_guardrails.dart` (con prueba de prompt injection ✅).

### Hallazgos

| ID | Prioridad | Hallazgo |
| --- | --- | --- |
| BE-P1-01 | P1 | Ningún backend está en Azure (requisito Sprint 2). |
| BE-P1-02 | P1 | BAQUI no consulta Supabase como primera fuente: `knowledge_documents` está vacía (0 filas) y el conocimiento real está en `_shared/baqueano-knowledge.ts` y en constantes del cliente. |
| BE-P1-03 | P1 | Edge Function pública sin control de abuso y escribiendo con `service_role`. |
| BE-P2-01 | P2 | Lógica IA duplicada en 5 scripts web + Functions + Genkit + Edge + Dart. Consolidar sin borrar: definir contrato único `POST /api/baqui` y convertir los scripts web en una sola capa cliente (`baqueano-assistant.js` como base, incorporando lo mejor de `baqui-evolved.js`). |
| BE-P2-02 | P2 | Lectura de varias variables para la misma clave (`GEMINI_API_KEY`, `BAQUEANONICARAGUA`, `"Gemini API Key"`). Normalizar a una. |
| BE-P2-03 | P2 | Multilingüe BAQUI: saludos en ES/EN dentro de la Edge Function; falta FR/IT/PT/DE/KO/ZH/RU y tomar el idioma del Website. |
| BE-P3-01 | P3 | Health checks existen (`healthCheck`, `baqueano-status`): reutilizarlos como prueba de "no localhost" ante el jurado. |

### Orden de consulta BAQUI objetivo

1. Supabase (contenido `published` + `content_translations`).
2. Conocimiento interno versionado (`knowledge_documents` con pgvector).
3. RAG sobre documentos verificados.
4. Fuente externa (`url_context`) **solo** si falta información, citando fuente y marcando "no verificado por BAQUEANO".
5. Si no hay dato: responder que no se sabe. Nunca inventar teléfonos, horarios ni coordenadas.
