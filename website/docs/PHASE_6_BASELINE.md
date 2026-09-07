# 🧭 BAQUEANO — LÍNEA BASE DE PRODUCTO (FASE 6 BASELINE)

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)
Establecer un registro estricto, veraz y fundamentado del estado inicial del ecosistema web de Baqueano antes de ejecutar optimizaciones o experimentos de crecimiento. Siguiendo el principio de rigor técnico, queda prohibido proyectar o inventar cifras métricas donde no exista tráfico productivo activo.

---

## ⚙️ 2. CÓMO (HOW / METODOLOGÍA & FUENTES)
- **Entorno Evaluado**: Local / Staging (`http://localhost:3000`, `http://localhost:3001`, `https://app-baqueano.web.app`).
- **Instrumentación**: Smoke tests automatizados (`node scripts/production-smoke.test.mjs`), auditoría visual por breakpoints Playwright y contratos tipados Firestore.
- **Criterio de Medición**: Toda métrica de comportamiento de usuario real en producción se etiqueta con `SIN DATOS SUFICIENTES` hasta la conexión y autorización formal de telemetría de campo.

---

## 📦 3. QUÉ (WHAT / MATRIZ DE LÍNEA BASE INICIAL)

| Dimensión / Métrica | Estado / Valor Inicial | Fuente / Evidencia | Observaciones |
|---|---|---|---|
| **Tráfico (Sesiones / Usuarios)** | `SIN DATOS SUFICIENTES` | Firebase Hosting / GA4 | Entorno productivo en fase pre-lanzamiento / piloto |
| **Distribución de Dispositivos** | `SIN DATOS SUFICIENTES` | Telemetría RUM | Verificación sintética probada en 16 resoluciones (320px a 2560px) |
| **Fuentes de Tráfico (Canales)** | `SIN DATOS SUFICIENTES` | Atribución UTM / Search Console | Sin campañas activas en producción |
| **Páginas Principales (Visitas)** | `SIN DATOS SUFICIENTES` | Servidor / Analytics | Rutas activas: `/`, `/destinos`, `/mapa`, `/destinos/[slug]` |
| **Tasa de Errores en Producción** | `0 incidentes críticos en smoke tests` | Smoke Suite Local / Health API (`/api/health`) | Endpoint `/api/health` responde 200 OK |
| **Web Vitals — LCP (Lab)** | `< 1.2s` (Desktop) / `< 2.1s` (Mobile) | Auditoría sintética local | Requiere validación RUM con usuarios reales |
| **Web Vitals — FID / INP (Lab)** | `< 50ms` | Auditoría sintética local | Cero bloqueo en hilo principal para componentes estáticos |
| **Web Vitals — CLS (Lab)** | `0.00` | Playwright Visual Audit | Layout estable sin saltos dinámicos en render inicial |
| **Búsquedas Internas** | `SIN DATOS SUFICIENTES` | Telemetría interna | Soporte de filtrado por categoría y departamento operativo |
| **Búsquedas Sin Resultados (`search_zero_results`)** | `SIN DATOS SUFICIENTES` | Telemetría interna | Métrica definida en taxonomía de Fase 6 |
| **Conversión a Guardado (`destination_save`)** | `SIN DATOS SUFICIENTES` | Botón interactivo `SavePlaceButton` | Requiere persistencia y autenticación en vivo |
| **Uso del Mapa Interactivo (`map_open`)** | `SIN DATOS SUFICIENTES` | Módulo `/mapa` | Carga de pines territoriales y filtros funcional |
| **Uso de Baqueano AI (`ai_started`)** | `0 ejecuciones en vivo` | Endpoint `/api/baqueano-ai` | Enrutador configurado con respuesta HTTP 501 / Fallback seguro |
| **Clicks de Contacto a Negocios Locales** | `SIN DATOS SUFICIENTES` | Enlaces WhatsApp / Teléfono | Directorio de anfitriones en proceso de enrolamiento |
| **Clicks de Descarga App Android** | `SIN DATOS SUFICIENTES` | Enlaces CTA en Home / Destinos | Enlaces directos a APK / Tienda Android |

---

## 🧭 North Star Metric Definida
> **Definición**: *Exploraciones Turísticas de Alto Valor (ETAV)*  
> **Cálculo**: Usuario consulta ficha de destino + interactúa con el mapa territorial + ejecuta una acción de valor (guardar, consultar ruta o click a contacto con baqueano/negocio local).
