# 🧭 TAXONOMÍA DE ANALÍTICA DE PRODUCTO — BAQUEANO

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)
Estandarizar la recolección de eventos de telemetría y comportamiento del explorador sin comprometer la privacidad individual ni almacenar información personal identificable (PII). Esta taxonomía garantiza que cada dato recolectado responda directamente a una hipótesis de producto o necesidad de optimización territorial.

---

## ⚙️ 2. CÓMO (HOW / CONVENCIONES & PRIVACIDAD)
- **Nomenclatura**: Estricto uso de `snake_case` para nombres de eventos y propiedades.
- **Política Cero PII**: Prohibido transmitir correos electrónicos, números telefónicos, nombres de personas, coordenadas GPS con precisión menor a 5 km, o textos libres de prompts privados.
- **Validación**: Cada llamada al servicio de analítica valida el esquema tipado antes de su emisión.

---

## 📦 3. QUÉ (WHAT / MATRIZ DE TAXONOMÍA DE EVENTOS)

| Evento | Objetivo | Propiedades Permitidas | Fuente | Riesgo PII | Estado |
|---|---|---|---|---|---|
| `destination_view` | Medir interés y tiempo de atención por destino turístico | `place_id`, `department_id`, `category_id`, `source_screen` | Web / App | Ninguno | ✅ Activo |
| `destination_save` | Evaluar intención de viaje y destinos favoritos | `place_id`, `action_type` (`add`/`remove`) | Web / App | Ninguno | ✅ Activo |
| `map_open` | Analizar adopción del explorador cartográfico | `source_screen`, `initial_filter` | Web / App | Ninguno | ✅ Activo |
| `map_marker_click` | Detectar densidad de interés geoespacial | `place_id`, `department_id` | Web | Ninguno | ✅ Activo |
| `search_executed` | Analizar patrones de búsqueda por palabras clave | `query_length`, `normalized_term`, `result_count` | Web | Bajo (Sanitizado) | ✅ Activo |
| `search_zero_results` | Detectar brechas de catálogo y sinónimos faltantes | `normalized_term`, `attempted_category` | Web | Bajo (Sanitizado) | ✅ Activo |
| `filter_applied` | Entender preferencias temáticas (volcanes, cascadas, etc.) | `filter_type`, `filter_value` | Web | Ninguno | ✅ Activo |
| `territory_view` | Medir el alcance del SEO y descubrimiento departamental | `department_id`, `region_id` | Web | Ninguno | ✅ Activo |
| `business_contact_click` | Cuantificar el beneficio económico directo a negocios locales | `business_id`, `contact_channel` (`whatsapp`/`tel`) | Web | Ninguno | ✅ Activo |
| `android_cta_click` | Medir tasa de conversión y derivación hacia la app nativa | `source_section`, `device_category` | Web | Ninguno | ✅ Activo |
| `ai_session_started` | Medir demanda de itinerarios asistidos | `entry_point` | Web | Ninguno | ✅ Activo |
| `ai_itinerary_completed` | Medir éxito y latencia de respuestas del asistente | `category_requested`, `duration_ms`, `status` | API Gateway | Ninguno | 🟡 En Desarrollo |
| `host_onboarding_started` | Evaluar interés de campesinos y anfitriones en registrarse | `source_landing` | Web Anfitriones | Ninguno | ✅ Activo |
| `error_boundary_triggered` | Monitorear excepciones en cliente de forma reactiva | `route`, `component_name`, `error_type` | Web Frontend | Ninguno | ✅ Activo |
