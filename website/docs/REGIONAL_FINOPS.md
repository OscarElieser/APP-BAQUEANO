# ANÁLISIS FINOPS REGIONAL & ATRIBUCIÓN DE COSTOS POR PAÍS

## 1. Atribución de Costos de Infraestructura Cloud

La arquitectura multi-país de Baqueano permite auditar y atribuir con precisión el consumo de recursos en Google Cloud / Firebase por país:

| Recurso Cloud | Mecanismo de Atribución | Estrategia de Optimización |
| :--- | :--- | :--- |
| **Firestore Read/Write Ops** | Etiquetado por `countryId` en colecciones compartidas | Cacheo en el Edge con SSG / ISR para reducir lecturas en más de 80%. |
| **Baqueano AI Gateway (Tokens LLM)**| Metadatos `context.countryId` en cada llamada al endpoint | Enrutamiento a modelos Flash optimizados para consultas recurrentes. |
| **Storage & Media Delivery** | Prefijo de bucket `/media/{countryId}/...` | Transformación automática WebP/AVIF y CDN caching global. |

---

## 2. Prevención del Desperdicio Financiero

- No se despliegan bases de datos aisladas ni clústeres dedicados por país de forma prematura. Se utiliza particionamiento lógico de alta eficiencia hasta que el volumen de un mercado justifique particionamiento físico.
