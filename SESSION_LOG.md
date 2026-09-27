<!--
============================================================================
🧭 BAQUEANO ECOSYSTEM — BITÁCORA Y REGISTRO PERSISTENTE DE SESIONES
============================================================================

🎯 1. POR QUÉ (WHY / PROPÓSITO):
- Garantizar la resiliencia absoluta de la memoria del proyecto ante cortes de
  energía, fallos de hardware o reinicios de sesión en el editor.
- Ofrecer un punto único de verdad auditable y legible para el usuario y los
  agentes de IA, preservando el hilo de decisiones de arquitectura, instrucciones
  clave y tareas pendientes.

⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
- Registro cronológico estructurado en Markdown en la raíz del repositorio.
- Cada entrada detalla: Fecha/Hora, Consulta del Usuario, Decisiones Técnicas,
  Archivos Afectados, Estado de Verificación y Próximos Pasos.
- Regla innegociable en AGENTS.md (Regla 7) para actualización continua.

📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
- Bitácora activa persistente accesible localmente por Git y por el sistema.
- Historial restaurado de la sesión interrumpida por el corte de luz (26-Sept-2026).
============================================================================
-->

# 🧭 BITÁCORA DE SESIONES Y CONSULTAS — BAQUEANO NICARAGUA

---

## 📌 ESTADO ACTUAL DEL PROYECTO

- **Rama Git:** `main`
- **Último archivo en desarrollo:** `website/js/ops-center/ops-ia-copilot.js`
- **Directivas activas:**
  1. Integración de fuentes oficiales (INTUR, VisitaNicaragua, MARENA, UNESCO, Google y Baqueano).
  2. Síntesis de voz limpia sin lectura de sintaxis/signos (`cleanTextForSpeech`).
  3. No alterar `lib/` (Flutter); foco exclusivo en la plataforma web `website/`.
  4. Identidad Baqueano autónoma y de alta fidelidad.

---

## 🕒 HISTORIAL DE CONSULTAS Y EJECUCIÓN

### 📅 Sesión Previa (26 de Septiembre de 2026, ~20:13 - 20:20) [Interrumpida por corte de luz]

- **ID de Sesión Brain:** `5bef679b-9450-4534-a354-a600129bcc62`
- **Consulta del Usuario:**
  > *"recuerda que la ia tiene que puede agarrar informacion intur,visitanicaragua,marena,unesco,google, entre otros y lo mas principal la pagina de baqueano eso debe de ser importante . y cuando cuando la ia hable que no menciones todos los signos que lea normal . si le preguto muestrame destino la ia va a mostrar destinos a lo que tenemos nosotros si te dice el usuario haz una comparacion lo hace y recomiendas actua como chatgpt ,gemini,copilot y otros agentes de ia pero siempre debe de guardar tu identidad baqueano. me entiende verdad lo que te quiero decir"*
  > *(Y confirmación previa: "recuerda que despues de esto no vamos a tocar lib")*
- **Acciones Ejecutadas por el Asistente:**
  1. Se implementó `cleanTextForSpeech` en `website/js/baqueano-assistant.js` para limpiar Markdown, signos de puntuación, emojis, URLs y símbolos contables antes de llamar a `SpeechSynthesisUtterance`.
  2. Se integró la base de conocimiento local para responder consultas territoriales y comparar destinos con fuentes oficiales.
  3. Se validó la sintaxis con `node --check website/js/baqueano-assistant.js` con salida limpia (código de salida 0).
- **Resultado:** Archivo salvado en disco con éxito previo a la interrupción eléctrica.

---

### 📅 Sesión Actual (26 de Septiembre de 2026, 20:49 - Presente)

- **ID de Sesión Brain:** `c826fac5-5cba-41dc-ad21-7b1acbcbef16`
- **Consulta 1 (20:49):**
  > *"te pregunto algo porque no guarda todas las conversaicones que hemos tenidos, ya que se me fue la luz y perdi lo que estabamos haciendo"*
  - **Resolución:** Se inspeccionó el almacenamiento local (`brain`), se recuperó la transcripción completa de la sesión anterior (`5bef679b...`) y se confirmó que todo el código modificado en `website/js/baqueano-assistant.js` sobrevivió íntegro en disco.

- **Consulta 2 (20:53):**
  > *"quiero que apartir de ahora todas las consultas se guarden a partir de ahora por cualquier interrupcion"*
  - **Resolución:**
    1. Creación de este archivo persistente `SESSION_LOG.md` en la raíz del proyecto.
    2. Incorporación de la **Regla 7 en `AGENTS.md`** que hace obligatorio registrar cada consulta, decisión y cambio de archivos en esta bitácora en tiempo real.
    3. Garantía de que cualquier interrupción futura podrá reanudarse de inmediato leyendo este archivo.

- **Consulta 3 (20:55):**
  > *"La IA del Ops Center de BAQUEANO debería actuar como el centro inteligente de supervisión y operación de toda la plataforma... sería como mi asistente personal... ¿qué más o está bien ahí?"*
  - **Resolución & Arquitectura Acordada:**
    1. **Rol Central:** BAQUEANO OPS IA como Copiloto y Asistente Personal de Oscar (Centro de Mando Digital / NOC + SOC + AI Ops).
    2. **Estructura en 8 Áreas + 4 Pilares de Gobernanza:**
       - Command Center (Baqueano Pulse 0-100%, Digital Twin, Ops IA).
       - Infrastructure & Reliability (Firebase, Supabase dual-backup, Cloud Run, Storage, APIs).
       - Operations (Reservas desatendidas, Negocios sin GPS/fotos, Usuarios, Incidencias).
       - AI Center (Gemini, Groq fallback, RAG, Latencia, Detección de Alucinaciones).
       - Security & SOC (App Check, Auditoría inmutable, RBAC, Ataques/Anomalías).
       - Analytics & Demand Forecasting (Heatmap turístico, Sostenibilidad, Conversión).
       - FinOps & Costos (Gasto de Cloud y APIs predictivo).
       - Automation & Recovery (Workflows, Auto-reparación segura, Disaster Recovery).
       - Gobernanza, SLAs, Historial de Decisiones de IA y Modo Simulación ("Impact Analysis").
    3. **Optimizaciones Clave del Asistente Personal:**
       - Mi Agenda Operativa personalizada por prioridades.
       - Triage inteligente de notificaciones (no molestar para eventos menores, alerta inmediata para críticos).
       - Acciones 1-Click con borradores pre-generados (redacción cordial para WhatsApp a negocios/turistas).

- **Consulta 4 (20:57):**
  > *"ok full"*
  - **Ejecución y Entregables:**
    1. **Motor de IA Creado:** `website/js/ops-center/ops-ia-copilot.js`
       - Cálculo dinámico de **Baqueano Pulse** (0-100%) en tiempo real con semáforo y penalizaciones por anomalías.
       - Generación de **Briefing Ejecutivo** personalizado para Oscar según la hora del día.
       - Panel interactivo de **Mi Agenda Operativa del Día** con resoluciones 1-Click (WhatsApp a anfitriones, geocodificación, sync Supabase).
       - Consola **Baqueano Commander** para interacción en lenguaje natural.
       - Modo **Simulación Predictivo (Impact Analysis)**.
       - Voz ejecutiva integrada limpia sin lectura de sintaxis.
    2. **Integración en `website/admin.html`:**
       - Inserción del contenedor `#opsIaCommandCenterWidget` en el Dashboard Ejecutivo (`view-01-dashboard`).
       - Botón directo `[Ops IA]` en el Topbar junto al reloj y estado en vivo.
       - Actualización de la vista `view-23-ai` convirtiéndola en el **BAQUEANO AI Center & Ops IA** (telemetría Gemini vs Groq, RAG, vacíos de contenido y consola Commander integrada).
       - Script importado y validado (`node --check` con código 0).

- **Consulta 5 (21:14):**
  > *"@[SESSION_LOG.md:current_problems]"*
  - **Resolución:**
    1. Corrección de advertencias del linter Markdown (`MD022`, `MD032` y `MD012`).
    2. Espaciado estándar entre encabezados y listas, y eliminación de saltos de línea sobrantes al final del archivo.

- **Consulta 6 (21:17):**
  > *"lo que quiero que la baqui al pedir recomendaciones me muestre en su panel la que tenemos integrado en la web ademas que hable normal sin mencionar los signos y haga comparaciones entre 3 y de su valoracion mas recomendada pero siempre y cuando el usuario lo quiera."*
  - **Diagnóstico del Fallo:**
    1. El motor de inferencia de rutas tenía una plantilla fija de volcanes (Cerro Negro/Masaya/Mombacho) que ignoraba la petición explícita de "playas y hotel" para 4 personas y $200 USD en San Juan del Sur.
    2. La síntesis de voz (TTS) pronunciaba asteriscos, guiones, dos puntos y paréntesis como palabras ortográficas literales.
    3. Faltaba la capacidad de comparar estrictamente 3 opciones de la web y emitir una recomendación ganadora fundamentada.
  - **Resolución y Código Entregado:**
    1. **`website/js/baqueano-assistant.js`:**
       - Perfeccionamiento de `cleanTextForSpeech`: erradicación de asteriscos, viñetas, barras, dos puntos, emojis y conversión de paréntesis a comas de pausa natural; números convertidos a palabras cardinales y ordinales.
       - Interceptor contextual local: si el usuario pide playa/hotel/SJDS o rechaza volcanes o pide catálogo web/comparativa, se activa la inteligencia territorial con los destinos reales de `destinos.html`.
       - Ruta exacta de 2 días para San Juan del Sur (Managua → SJDS en bus expreso, Bahía, Mirador del Cristo, atardecer en Maderas) con presupuesto exacto desglosado en $178 USD (dejando $22 USD de reserva dentro de los $200 USD para 4 personas).
       - Comparador territorial entre 3 opciones de playa (SJDS & Maderas vs Las Peñitas vs Popoyo) con 4 criterios y veredicto experto fundamentado seleccionando San Juan del Sur como opción #1.
       - Integración de botones interactivos directos a la web (`destinos.html#dest_bahia_sjds`, `destinos.html#dest_maderas_004`, etc.) expandidos a hasta 5 acciones.
    2. **`website/js/baqueano-ai.js`:**
       - Incorporación del territorio `playas-rivas` en `CLIENT_TERRITORIES` y resolución contextual en `resolveTerritory` para evitar desvíos a volcanes cuando se solicita playa o costa.
    3. Validación de sintaxis con `node --check` en ambos archivos (código de salida 0).

- **Consulta 7 (26 de Septiembre de 2026):**
  > *"Quiero que cuando me hable no sea casual; que reconozca la página principal, recomiende según la página y, si escucho música, dé una breve descripción."*
  - **Ejecución:**
    1. Se reemplazó el saludo fijo de `website/js/baqueano-assistant.js` por orientación editorial específica para cada módulo público.
    2. El asistente ahora anuncia una página únicamente cuando cambia de módulo durante la sesión y reutiliza ese contexto al reaparecer.
    3. Se conectó `website/js/epic-music-player.js` con Baqüi mediante eventos con título, intérprete, territorio y crédito documental.
    4. Al comenzar una pista nueva, Baqüi muestra y, si la voz está activa, pronuncia una descripción breve sin repetirla al pausar y reanudar la misma canción.
    5. Se actualizaron las versiones de carga del asistente en las páginas públicas y del reproductor en `musica.html` para invalidar caché del navegador.

- **Consulta 8 (26 de Septiembre de 2026, 21:21):**
  > *"no quiero que eliminada nada solo adaptarla por favor"*
  - **Directiva:**
    - Cero eliminación de destinos, rutas o patrimonios existentes (Volcanes, Cañones, Ciudades Coloniales, Reservas, Geoparques, Ruta del Café, Caribe).
    - Adaptación contextual inteligente: si el explorador consulta por playas/costas/hoteles, se muestran playas y hoteles de Rivas/León; si consulta por volcanes, aventura o geoparques, se muestran Cerro Negro, Masaya, Mombacho, Cañón de Somoto y Ometepe; si pide el catálogo completo, se despliega el inventario nacional con precios bimoneda auditados (C$ y USD).
    - Comparativas estructuradas entre 3 opciones con recomendación fundamentada para cada categoría (playas, volcanes, ciudades coloniales y experiencias territoriales).
    - Síntesis de voz (TTS) 100% natural sin pronunciar signos ortográficos, asteriscos, corchetes, barras, dos puntos ni abreviaturas.
  - **Ejecución Técnica en `website/js/baqueano-assistant.js`:**
    1. **Adaptación de Comparaciones (3 Opciones + Veredicto Experto):**
       - Rama Playas: San Juan del Sur vs Las Peñitas vs Popoyo con veredicto recomendado #1.
       - Rama Volcanes: Volcán Cerro Negro (sandboarding extremo) vs Volcán Masaya (lago de lava accesible en auto) vs Volcán Mombacho (nebliselva y orquídeas) con recomendación según perfil de aventura vs familia.
       - Rama Ciudades Coloniales: León (Catedral UNESCO y Darío) vs Granada (arquitectura colonial y 365 Isletas) vs Masaya (folclore y artesanías) con recomendación de recorrido.
       - Rama General / Territorial: Cañón de Somoto vs Isla de Ometepe vs San Juan del Sur.
    2. **Adaptación de Rutas e Itinerarios:**
       - Rama Playas: Ruta costera de 2 días para 4 personas en San Juan del Sur & Playa Maderas ($200 USD / C$ 7,330 NIO).
       - Rama Volcanes y Aventura: Ruta nacional de 3 días conectando Parque Nacional Volcán Masaya, Granada & Isletas, Sandboarding en Volcán Cerro Negro, quesillos de Nagarote y Monumento Nacional Cañón de Somoto con guías baqueanos locales.
    3. **Adaptación del Catálogo Soberano:**
       - Catálogo Costero: Playas del Pacífico y hospedajes familiares cuando la consulta es de playa.
       - Catálogo Nacional Completo: Los 8 grandes destinos y patrimonios soberanos (Cerro Negro, Cañón de Somoto, Isla de Ometepe, Volcán Masaya, San Juan del Sur, León y Granada, Selva Negra Matagalpa, Corn Island en el Caribe Sur).
    4. **Validación:**
       - Verificación de sintaxis con `node --check` (código 0). Cero advertencias y preservación total del código existente.

- **Consulta 9 (26 de Septiembre de 2026):**
  > *"Recordá que vas a conectarla a todas las páginas del sitio web."*
  - **Ejecución:**
    1. Se auditaron los 20 documentos HTML de `website/`: 10 ya cargaban Baqüi y 9 páginas públicas estaban pendientes.
    2. Se integró Baqüi en `404`, Baqueano IA, perfil, aviso legal, privacidad, términos, cookies, denuncias y modo sin conexión.
    3. Se añadieron mensajes contextuales específicos para cada una de esas páginas y se redujo la exclusión global únicamente a `admin.html`, que conserva su copiloto Ops IA independiente.
    4. La cobertura resultante es de 19 páginas públicas con Baqüi y 1 página administrativa con su asistente especializado.
