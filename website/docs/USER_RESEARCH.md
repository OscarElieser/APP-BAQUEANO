# 🔬 MARCO DE INVESTIGACIÓN DE USUARIOS (USER RESEARCH & UX LAB) — BAQUEANO

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)
Complementar la analítica cuantitativa con comprensión cualitativa profunda. Mientras la analítica indica *qué* ocurre en la plataforma, las pruebas con usuarios reales revelan *por qué* suceden las fricciones, cómo perciben la identidad territorial de Nicaragua y qué obstáculos enfrentan al interactuar con anfitriones y comunidades locales.

---

## ⚙️ 2. CÓMO (HOW / METODOLOGÍA & ÉTICA)
- **Protocolo de Privacidad**: Cero grabación de rostros o recolección de identificadores personales en reportes públicos. Consentimiento explícito informado previo a cada sesión.
- **Enfoque Basado en Tareas**: Evaluación mediante escenarios realistas de exploración turística rural y cultural.
- **Bucle de Retroalimentación**:
  ```text
  FEEDBACK DE USUARIO
         ↓
  TRIAGE & CLASIFICACIÓN
         ↓
  PRIORIZACIÓN POR IMPACTO
         ↓
  BACKLOG TÉCNICO
         ↓
  IMPLEMENTACIÓN & TEST
         ↓
  MEDICIÓN POST-CAMBIO
  ```

---

## 📦 3. QUÉ (WHAT / ESCENARIOS DE PRUEBA DE TAREAS)

### Tarea 1: Descubrimiento Territorial Específico
- **Consigna**: *"Estás planeando un viaje al norte de Nicaragua y deseas encontrar un destino de naturaleza en el departamento de Matagalpa."*
- **Ruta Esperada**: Home → Destinos → Filtro por Departamento (Matagalpa) → Selección de Ficha (ej. Cascada Blanca / Selva Negra).
- **Indicadores de Éxito**: Tiempo hasta el primer clic relevante (< 15s), uso correcto del selector departamental, tasa de éxito sin asistencia (> 90%).

### Tarea 2: Consulta de Contacto con Negocio Rural
- **Consigna**: *"Deseas coordinar un almuerzo tradicional o guía local antes de visitar el Cañón de Somoto."*
- **Ruta Esperada**: Ficha Cañón de Somoto → Sección de Negocios y Anfitriones Aliados → Clic en botón WhatsApp oficial.
- **Indicadores de Éxito**: Claridad en la información de contacto, comprensión del rol del baqueano local, cero ambigüedad en tarifas orientativas.

### Tarea 3: Exploración Cartográfica en Conexión Móvil
- **Consigna**: *"Abres el mapa interactivo desde tu teléfono para ubicar qué volcanes activos tienen senderos habilitados cerca de León o Masaya."*
- **Ruta Esperada**: Navegación `/mapa` → Filtro por Categoría "Volcanes" → Tap en marcador → Vista previa resumida.
- **Indicadores de Éxito**: Fluidez de gestos táctiles (pinch/zoom sin latencia), legibilidad de marcadores agrupados, carga visual en menos de 2 segundos.

### Tarea 4: Guardado de Itinerario Personal
- **Consigna**: *"Guarda 3 destinos que te interesen para revisarlos más tarde sin perder la lista al navegar."*
- **Ruta Esperada**: Interacción con `SavePlaceButton` en tarjetas o fichas → Consulta de destinos guardados.
- **Indicadores de Éxito**: Feedback visual inmediato (animación de confirmación en microinteracción), persistencia local/sesión clara.
