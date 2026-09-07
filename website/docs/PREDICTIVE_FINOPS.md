# MODELADO FINOPS & PROYECCIÓN DE COSTOS DE INFRAESTRUCTURA

## 💰 1. Servicios Monitoreados

1. **Lecturas y Escrituras en Cloud Firestore**: Estimación de costos basada en volumen de reservas y consultas.
2. **Tokens de IA (Gemini / AI Gateway)**: Modelado de consumo del Asistente y Digital Concierge.
3. **Peticiones de Mapas y Rutas Vectoriales**: Costo estimado de tiles y geocodificación.
4. **Cómputo en Cloud Functions & Hosting**: Tráfico esperado en fines de semana pico.

---

## 📈 2. Umbrales de Alerta Preventiva

Si la proyección mensual estimada excede el 85% del presupuesto asignado, el sistema genera una señal interna para optimizar caching y reducir llamadas redundantes al LLM.
