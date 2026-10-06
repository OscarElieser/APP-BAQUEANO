# BAQUI-AUDIT — asistente de viaje · 2026-10-06

> 🎯 **POR QUÉ:** BAQUI responde a viajeros con datos de BAQUEANO. Regla del proyecto: nunca inventa precios, horarios, disponibilidad, teléfonos, ubicaciones, negocios ni servicios.
> ⚙️ **CÓMO:** revisión de `supabase/functions/baqueano-ai/`, `_shared/baqueano-knowledge.ts` y los clientes web y Android, más consultas reales a Supabase.
> 📦 **QUÉ:** cómo responde BAQUI, qué datos usa, qué se corrigió y qué queda.

## 1. Cómo responde (código actual)

1. **Intención.** Clasifica el mensaje: saludo, ayuda, impacto, turismo o planificación. Saludos y ayuda se responden con textos fijos en 6 idiomas.
2. **Interno primero.** `BaqueanoKnowledgeService` busca en 13 dominios de Supabase: lugares, destinos, negocios, eventos y otros.
   - Desde hoy aplica el **mismo filtro de publicación que RLS**: nada en borrador ni archivado.
   - **No entrega campos privados:** comisión, dueño, metadatos ni identificadores internos.
3. **Fuente externa solo si falta.** Si lo interno no alcanza, consulta Gemini con `url_context` sobre fuentes oficiales (INTUR, mapanicaragua.com).
   - La instrucción prohíbe inventar lugares, contactos, horarios, disponibilidad y precios.
   - Devuelve las fuentes usadas.
4. **Planificación.** Arma el itinerario con lugares del catálogo. **`publishedPrice: null`**: no pone precios.
5. **Registro.** Cada intercambio queda en `ai_sessions` / `ai_messages` con sus fuentes (`ai_message_sources`).

## 2. Datos reales (2026-10-06)

| Tabla | Filas | Nota |
|---|---|---|
| `travel_plans` | 31 | 25 sin dueño. Las 6 con `user_uid` se guardaron antes de hoy con un uid enviado por el cliente, que no se puede verificar |
| `ai_sessions` / `ai_messages` | 4 / 8 | Último mensaje: 2026-10-05 |
| `ai_message_sources` | 4 | Trazabilidad de fuentes |
| `knowledge_documents` | 0 | La búsqueda vectorial (RAG) no tiene documentos cargados todavía |

## 3. Corregido hoy

| Problema | Cambio | Estado |
|---|---|---|
| La búsqueda con service role ignoraba el estado de publicación y devolvía columnas privadas | Filtro por dominio igual a RLS (eventos `published` e `historical`) y `PRIVATE_FIELDS` | 🟡 en código, falta desplegar |
| `travel_plans` guardaba un `userUid` enviado por cualquiera | `user_uid = null` hasta verificar un token | 🟡 ídem |
| Sin límite: cualquiera podía gastar la cuota de Gemini e inflar los KPIs públicos | Presupuesto en la BD: 20 consultas cada 10 minutos por IP (hash, nunca en claro), con respuesta 429; 400 por hora en total, y al pasarlo responde solo con el catálogo | 🟡 BD aplicada y probada; función por desplegar |
| La web escribía `travel_plans` directo con la clave anon desde `js/baqueano-ai.js` y `js/route-builder.js` | Ningún HTML carga esos scripts (verificado), y anon no tiene INSERT en `travel_plans` (verificado en la BD). Son código muerto e inofensivo; se conservan por la regla de no borrar | 🟢 sin riesgo activo |

## 4. Pendientes

1. **Desplegar `baqueano-ai`** desde una máquina con la CLI de Supabase. El comando está en `docs/security-audit/2026-10-06/NEEDS-VALIDATION.md`.
2. **`knowledge_documents` vacío.** Cargar documentos oficiales con fuente (por ejemplo, fichas INTUR por departamento) para que BAQUI no dependa de Gemini en lo básico.
3. **Tablas culturales vacías** (gastronomía, cultura, eventos y tarifas). Mientras no se carguen, BAQUI responde "todavía no tengo ese dato verificado" en vez de inventar.
4. **Identidad del usuario en los planes.** BAQUI debe verificar el token de Firebase, como las otras funciones, para guardar planes a nombre de quien los pide.
