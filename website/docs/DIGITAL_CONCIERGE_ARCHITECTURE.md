# ARQUITECTURA DEL DIGITAL CONCIERGE

## 1. Experiencia de Usuario & Layout
El Digital Concierge (`/baqueano-ai`) ofrece una experiencia interactiva en dos columnas:
- **Columna Izquierda (Workspace de Conversación)**: Entrada de intenciones, ajustes de parámetros de viaje (días, personas, moneda) y sugerencias rápidas.
- **Columna Derecha (Plan de Viaje Estructurado & Trazabilidad)**: Desglose por días de paradas, mapa de ruta, presupuesto determinístico en NIO/USD, señales de confianza y trazabilidad de agentes.

## 2. Modal de Confirmación Humana (*Human-in-the-Loop*)
Para acciones de escritura reversible (Nivel 2) o sensible (Nivel 3), se despliega un diálogo emergente con descripción clara de la acción, estado antes/después y botón de confirmación.
