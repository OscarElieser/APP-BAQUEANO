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

- **Consulta 9 (26 de Septiembre de 2026):**
  > *"Revisar si la voz funciona: que se apague al dar clic sobre ella o que siga leyendo."*
  - **Diagnóstico:** el botón cambiaba la preferencia visual, pero no detenía formalmente la locución al apagarse, no leía el contenido visible al activarse y podía mostrar un icono distinto al estado persistido tras recargar.
  - **Ejecución:**
    1. Un clic para activar ahora lee el mensaje contextual o la última respuesta de Baqüi y mantiene la lectura automática para mensajes posteriores.
    2. Un segundo clic apaga la voz y cancela inmediatamente cualquier locución en curso.
    3. Se sincronizaron icono, `aria-pressed`, etiqueta accesible y título con la preferencia guardada.
    4. Se protegieron los callbacks de voz para que una locución cancelada no interrumpa visualmente una lectura nueva.

- **Consulta 10 (26 de Septiembre de 2026):**
  > *"Quiero hacer el menú de navegación más refinado, tipo Ops Center."*
  - **Ejecución:**
    1. Se rediseñó el drawer público con el lenguaje visual del Ops Center sin incorporar controles administrativos.
    2. Se añadió cabecera de producto con logotipo, estado territorial activo y cierre compacto.
    3. Se incorporaron filas operativas, riel naranja para la ruta activa, iconografía contenida y submenús de alta legibilidad.
    4. Se agregó un pie de navegación con estado protegido y acceso directo al planificador.
    5. El diseño mantiene adaptación móvil, tablet y escritorio compacto mediante composición compartida.

- **Consulta 11 (26 de Septiembre de 2026):**
  > *"¿Todavía no puedo subir la APK? ¿Qué solución habría mediante un enlace de Google para que el usuario descargue sin varios procedimientos?"*
  - **Diagnóstico:**
    1. El Ops Center contiene interfaz y lógica de carga, pero su operación real requiere probar un APK firmado contra los servicios desplegados.
    2. El respaldo de Supabase limita actualmente cada archivo a 50 MB y los intentos de Firebase/Supabase vencen a los 3.5 segundos, plazo insuficiente para la mayoría de APK.
    3. Google Drive permite compartir archivos, pero puede mostrar confirmaciones, límites temporales de descarga y advertencias; no es una distribución estable para instaladores públicos.
  - **Recomendación:** publicación final mediante Google Play para instalación normal con un botón; como transición, alojamiento en Google Cloud Storage o Firebase Storage con enlace estable desde `baqueano.com/descargar-app`. Android puede exigir autorización de fuentes externas cuando la instalación no proviene de Google Play.
  - **Aclaración del usuario:** Google Play todavía no se utilizará por limitación presupuestaria. Se mantiene como ruta futura y se prioriza una descarga directa desde la infraestructura existente, corrigiendo límites y tiempos de carga antes de publicar el APK.
  - **Implementación autorizada:**
    1. Se añadió al módulo Android del Ops Center un campo para pegar enlaces compartidos de Google Drive y un botón independiente de publicación.
    2. El sistema valida protocolo, dominio e identificador del archivo, genera el enlace de descarga y conserva la URL original para edición y auditoría.
    3. La versión se registra en `android_releases` y `app_config/android_release`, respetando estado publicado o borrador.
    4. La navegación pública consume el mismo contrato y evita el atributo `download` para Drive, permitiendo que Google gestione correctamente la respuesta del archivo.
    5. Se reparó el selector del portal Android en `index.html`: al publicarse una versión, el botón dinámico se inserta ahora en `.app-download-actions` y actualiza la versión visible.

- **Consulta 12 (26 de Septiembre de 2026):**
  > *"Firebase Hosting falla con HTTP 400: Executable files are forbidden on the Spark billing plan."*
  - **Diagnóstico:** el APK ya estaba excluido del Hosting, pero `website/assets/videos/` contiene tres instaladores `.exe` de Roblox que Firebase intentaba incluir entre los 494 archivos públicos.
  - **Ejecución:** se amplió `hosting.ignore` en `firebase.json` para excluir APK, AAB y formatos ejecutables de Windows o binarios, sin borrar los archivos locales del usuario.
  - **Resultado:** `firebase deploy --only hosting` finalizó correctamente, publicó 491 archivos y liberó la versión `999e64d12ec4b8ff` en `https://app-baqueano.web.app`. La página principal, el panel administrativo y el script con la función `publishExternalAndroidRelease` respondieron HTTP 200 en la verificación posterior.

- **Consulta 13 (26 de Septiembre de 2026):**
  > *"Quiero que este menú sea más similar al menú del Ops Center."*
  - **Ejecución:**
    1. Se incorporaron tres grupos operativos numerados: Descubrir Nicaragua, Planificar y conectar, y Cuenta e inteligencia.
    2. Se compactaron ancho, filas, iconos, tipografía y espaciado para replicar la densidad visual del sidebar administrativo.
    3. Se conservaron el riel activo, estados, accesibilidad, enlaces públicos y comportamiento responsivo sin exponer módulos internos.
  - **Publicación:** Firebase Hosting desplegó correctamente la versión `9facdb39d931383d` en el canal público.

- **Consulta 10 (26 de Septiembre de 2026, 21:28):**
  > *"📸 Instagram: https://www.instagram.com/baqueano_nicaragua 📲 Facebook: https://www.facebook.com/share/1S71xwJKse/ 🎬 TikTok: https://www.tiktok.com/@baqueano.nicaragu?_r=1&_t=ZS-99iTnKK0i3e a los iconos de redes sociales agregarla por favor"*
  - **Ejecución y Entregables:**
    1. **Actualización Masiva de Enlaces Oficiales (17 Páginas Web):**
       - Se sustituyeron los enlaces genéricos por las cuentas oficiales de Baqueano Nicaragua en:
         * Instagram: `https://www.instagram.com/baqueano_nicaragua`
         * Facebook: `https://www.facebook.com/share/1S71xwJKse/`
         * TikTok: `https://www.tiktok.com/@baqueano.nicaragu?_r=1&_t=ZS-99iTnKK0i3e`
       - Páginas actualizadas: `index.html` (se incorporó la barra de redes sociales que faltaba en su pie de página), `destinos.html`, `aliados.html`, `gastronomia.html`, `historia.html`, `ambiental.html`, `departamento.html`, `nosotros.html`, `musica.html`, `mi-negocio.html`, `perfil.html`, `baqueano-ai.html`, `terminos.html`, `privacidad.html`, `aviso-legal.html`, `cookies.html` y `denuncias.html`.
    2. **Integración Cognitiva en Baqüi (`baqueano-assistant.js`):**
       - Se añadió detección de intención para consultas sobre redes sociales, cuentas, Instagram, Facebook y TikTok.
       - Baqüi ahora responde con los enlaces oficiales y botones de acción directa con apertura segura en nueva pestaña (`window.open(..., '_blank')`).
    3. **Validación:**
       - `node --check website/js/baqueano-assistant.js` verificado con código de salida 0.
       - Verificación con `grep_search` en todo el proyecto confirmando 100% de consistencia en los 17 archivos HTML.

- **Consulta 11 (26 de Septiembre de 2026, 21:35):**
   > *"quiero que tema aiga una seccion de cambiar fondo del sitio ya sea negro, blanco o buscas colores que hagan constrante a la nuestra, en tema"*
   - **Ejecución y Entregables:**
     1. **Nueva Pestaña "Fondo del Sitio" y Barra de Acceso Rápido (theme-switcher.js y theme-switcher.css):**
        - Se añadió una pestaña dedicada en el modal de temas: "Fondo del Sitio" (#tabBtnSiteBg), situada entre el catálogo de temas de Nicaragua y el estudio de tinte de secciones.
        - Se incorporó una barra superior de acceso rápido con pills (.baq-quick-bg-strip) en la cabecera del modal para cambiar de fondo con 1 solo toque desde cualquier vista.
     2. **Paleta de Fondos de Alto Contraste Curada para Baqueano:**
        - **Original / Tema:** Restaura el fondo ambiental autóctono del tema seleccionado.
        - **Negro OLED (#000000):** Fondo negro absoluto de máximo contraste que resalta la iconografía, el Naranja Fuego (#F65E01) y el Petróleo Teal (#165D6F).
        - **Blanco Solar (#FFFFFF):** Modo claro de alta legibilidad con tipografía oscura adaptativa (#0F172A) conforme a WCAG AAA para lectura descansada bajo la luz del sol.
        - **Crema Arena Pinolera (#FAF6ED):** Tono editorial cálido inspirado en el maíz y las costas de Nicaragua, suave para la vista.
        - **Petróleo Selva Profunda (#05191F):** Verde/petróleo nocturno de alto contraste orgánico.
        - **Azul Océano Pacífico (#06101E):** Azul ultramar náutico de gran elegancia y profundidad.
        - **Carbón Masaya Fuego (#120804):** Basalto volcánico cálido que armoniza con los acentos de lava y fogata.
        - **Fondo Libre Personalizado:** Selector hexadecimal interactivo (#inputSiteBgCustomColor) con detección algorítmica de luminancia (isColorLight) para adaptar automáticamente el color de tipografía y tarjetas.
     3. **Adaptabilidad y Persistencia Automática:**
        - El fondo seleccionado se guarda en localStorage (baqueano_site_bg) y se aplica instantáneamente en toda la web a través de variables CSS (--bg-space, --bg-dark, --bg-surface, --bg-card, --text-primary, --text-secondary, etc.).
        - Se implementaron selectores [data-bg-mode="light"] y [data-site-bg="negro"] en theme-switcher.css para ajustar barras de navegación, bordes, sombras de tarjetas y textos con nitidez absoluta.
     4. **Validación:**
        - Verificación de sintaxis con node --check website/js/theme-switcher.js (código de salida 0).
        - Validación de no uso de términos prohibidos.

- **Consulta 12 (26 de Septiembre de 2026, 21:46):**
   > *"tambien quiero que revise la responsabilidad y la adaptabilidad quiero que se adapte a cualquier dispositivo electronico. es una regla fundamental ya que es para un evento nacional y si quiero ganar"*
   - **Ejecución y Entregables:**
     1. **Auditoría Integral de Viewports y Safe Area (20 Páginas HTML):**
        - Se estandarizó el meta viewport a `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">` en los 20 archivos HTML del sitio web.
        - Se habilitó la cobertura visual completa bajo notches, Dynamic Island (iPhone) y barras de navegación por gestos (Android).
     2. **Nueva Hoja Maestra de Arquitectura Responsiva Universal (`responsive-ecosystem.css`):**
        - Se creó el módulo central con documentación bajo el estándar del Círculo Dorado.
        - **Cero Desbordamiento Horizontal:** Reglas estrictas en `html`, `body`, contenedores, tablas, bloques pre, imágenes y vídeos para erradicar cualquier fuga o scroll lateral no deseado.
        - **Soporte Nativo de Safe Area Insets:** Integrado en `.main-navbar`, `.site-footer-pro`, `.baq-theme-float-btn` y modales flotantes mediante `env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`, `env(safe-area-inset-left)` y `env(safe-area-inset-right)`.
        - **Matriz de Breakpoints Universales:**
          * Ultracompactos (<= 375px: iPhone SE, Galaxy A).
          * Gama Alta / Estándar (376px - 480px: iPhone 14/15/16 Pro, Galaxy S24).
          * Plegables desplegados y Tablets en retrato (481px - 768px).
          * Tablets en paisaje y portátiles (769px - 1024px).
          * Monitores de escritorio estándar (1025px - 1440px).
          * Pantallas Ultra-Wide y 4K institucionales (> 1680px y > 2200px) con escala tipográfica fluida (`clamp`).
          * Modo Paisaje en smartphones (`@media (max-height: 520px) and (orientation: landscape)`) para evitar recortes de interfaz.
          * Pantallas táctiles (`@media (pointer: coarse)`) con áreas de pulsación mínimas de 40px-44px conformes a WCAG 2.1 AA/AAA.
     3. **Corrección Quirúrgica de Anchos Rígidos Identificados:**
        - `website/css/pages/index.css`: `.exp-card` convertido a fluido con `min-width: min(380px, calc(100vw - 2.5rem))` para evitar desbordamientos en teléfonos de 360px-390px.
        - `website/css/nicaragua-branding.css`: `.compact-nl-form` adaptado con `min-width: min(340px, 100%)` y colapso vertical en <= 480px.
        - `website/css/theme-switcher.css`: `.baq-studio-grid` y `.baq-sitebg-grid` optimizados para adaptarse a pantallas estrechas sin romper columnas.
        - `website/css/layout.css` y `website/styles.css`: Vinculación universal mediante `@import url('css/responsive-ecosystem.css');`.
     4. **Validación:**
        - Verificación sintáctica con balance perfecto de llaves en todas las hojas modificadas.
        - 100% libre de términos restringidos y 100% compatible con eventos y presentaciones institucionales.

- **Consulta 13 (26 de Septiembre de 2026, 21:56):**
   > *"Reorganización de jerarquía comercial y narrativa del index.html para competencia nacional sin borrar nada: Hero de Marca (declaración de impacto + 3 CTAs) -> Problema/Solución (flujo 5 pasos + 4 pilares de valor) -> Crea tu viaje con IA ('¿Qué querés vivir en Nicaragua?') -> Explora Nicaragua -> Mapa de los 17 territorios -> Destinos -> Cultura Viva -> Servicios Turísticos -> Negocios y Comunidades -> Impacto -> Seguridad/SOS -> Historias/Experiencias -> Red de Anfitriones -> Ficha Técnica App Android (APK) -> CTA Final -> Footer."*
   - **Ejecución y Entregables:**
     1. **Preservación Integral al 100%:**
        - Cero eliminación de módulos o scripts existentes.
        - Toda la funcionalidad (Leaflet, Three.js 3D, reproductor de audio, selector de territorios, Baqüi IA, formularios y modales) se preservó intacta.
     2. **Nueva Jerarquía Comercial de Producto (Nivel Competencia Nacional):**
        - **01. Cinematic Brand Hero:** Declaración de marca contundente ("NICARAGUA NO SE VISITA. SE DESCUBRE."), subtítulo narrativo y 3 CTAs estratégicos: "Explorar Nicaragua", "✨ Crear mi aventura con IA" y "▶ Ver cómo funciona".
        - **02. El Problema → La Solución Baqueano (#problemaSolucionSection):**
          * Explica en 15 segundos el reto del viajero (fragmentación de 10 plataformas diferentes vs ecosistema unificado Baqueano).
          * Flujo visual interactivo de viaje en 5 pasos: `Descubrir → Planificar → Conectar → Reservar → Viajar`.
          * 4 Pilares estratégicos de la propuesta de valor: 🧭 Descubre, 🤖 Planifica, 🤝 Conecta y 🌿 Impacta.
        - **03. Crea tu viaje con IA (#baqueanoDigitalSection):** Elevado al inicio de la experiencia con la nueva caja conversacional interactiva "¿Qué querés vivir en Nicaragua?", sugerencias rápidas ("3 días en León y Las Peñitas", "Ometepe", "Cañón de Somoto") y conexión en vivo con Baqüi y el planificador.
        - **04. Explora Nicaragua (#queQueresVivir):** Pilares experienciales con botón de revelación progresiva ("Ver todas las experiencias").
        - **05. Mapa Vivo de los 17 Territorios (#territorioMapaSection):** Presentación turística priorizada ("Explora Nicaragua en un mapa vivo: 15 Departamentos + 2 Regiones Autónomas"), con selector interactivo y sello técnico secundario WebGL / WGS-84.
        - **06 a 09. Destinos, Cultura Viva, Servicios Turísticos y Negocios Aliados:** Con etiquetas de credibilidad profesional ("Red de Emprendimientos Locales · Prototipo Funcional de Demostración").
        - **10 y 11. Cifras, Impacto y Seguridad SOS:** Indicadores verificables, asistencia en ruta y geolocalización GPS satelital.
        - **12 a 15. Historias, Red de Anfitriones, Ficha Técnica App Android (APK v2.4.0 Beta) y CTA Final.**
    3. **Estilos e Integridad Sintáctica:**
        - Incorporación de estilos de jerarquía comercial en `website/css/pages/index.css` con Golden Circle, paleta oficial y cero uso de términos prohibidos.
        - Verificación de balance de etiquetas HTML (16/16 secciones, 464/464 divs, 1/1 main, 1/1 footer, 5/5 forms).
        - Validación JavaScript con `node --check` (código 0).

- **Consulta de recuperación (26 de Septiembre de 2026):**
  > *"puede recuperar la ultima orientacion ante que se interrumpiera"*
  - **Estado recuperado:**
    1. La última orientación estratégica registrada fue reorganizar `website/index.html` para la competencia nacional, preservando todos los módulos y ordenando la narrativa desde el Hero de Marca hasta el CTA final y el footer.
    2. La intervención técnica más reciente fue refinar el menú público para acercarlo visualmente al sidebar del Ops Center mediante tres grupos operativos, mayor densidad visual y conservación de accesibilidad y respuesta multidispositivo.
    3. Los cambios de esa intervención permanecen en disco, aún sin consolidar en Git, dentro de `website/js/navigation.js`, `website/styles.css` y esta bitácora.
    4. No se detectó pérdida de los cambios anteriores ni necesidad de modificar `lib/`, `ios/` o `web/`.

- **Confirmación del punto de reanudación (26 de Septiembre de 2026):**
  > *"La intervención más reciente fue adaptar el menú público al estilo del Ops Center, con tres grupos operativos y diseño más compacto."*
  - **Punto confirmado:** se continuará desde la adaptación del menú público conservada en `website/js/navigation.js` y `website/styles.css`.
  - **Grupos implementados:** `01 Descubrir Nicaragua`, `02 Planificar y conectar` y `03 Cuenta e inteligencia`.
  - **Estado:** cambios locales intactos; no se realizaron modificaciones funcionales adicionales durante esta confirmación.

- **Continuación del menú público desplegable (26 de Septiembre de 2026):**
  > *"continua porque no se ve muy bien y recuerda que se iba hacer desplegable como el ops center"*
  - **Decisión:** convertir los tres rótulos operativos en controles de acordeón accesibles, conservando todos los enlaces públicos.
  - **Implementación:** apertura exclusiva por grupo, cierre de los demás bloques, apertura inicial de la sección correspondiente a la página actual, contador de accesos y chevrón animado.
  - **Ajuste visual:** drawer ampliado de forma responsiva, encabezados de grupo con mayor área táctil, contraste reforzado y jerarquía equivalente al Ops Center.
  - **Archivos modificados:** `website/js/navigation.js`, `website/styles.css` y `SESSION_LOG.md`.

- **Corrección del menú horizontal visible en escritorio (26 de Septiembre de 2026):**
  > *"mira eso es un menu desplegable"* — acompañado de evidencia visual donde la navegación aparecía como una píldora horizontal.
  - **Diagnóstico:** el drawer solo se activaba hasta 1699 px; en pantallas más amplias reaparecía la barra horizontal comprimida.
  - **Corrección:** el patrón lateral desplegable del Ops Center queda activo en todos los tamaños de pantalla y la barra horizontal deja de renderizarse como navegación principal.
  - **Interacción:** el botón de menú abre el drawer, el fondo exterior lo cierra y los tres grupos internos permanecen desplegables tipo acordeón.
  - **Caché:** se actualizaron las versiones de `styles.css` y `navigation.js` en las 18 páginas que cargan la navegación para impedir que el navegador conserve la barra anterior.
  - **Validación:** sintaxis JavaScript limpia, balance CSS correcto y `git diff --check` sin errores.

- **Autorización de mejora integral del `index.html` (26 de Septiembre de 2026):**
  > *"ok hagamosla que todas lleguen al 10/10 pero sin borra la informacion que tenemos . haz tu magia eres libre pero me tiene que informar lo que hiciste"*
  - **Alcance autorizado:** elevar claridad, identidad, narrativa comercial, diseño, respuesta multidispositivo y preparación para competencia nacional.
  - **Restricción central:** conservar íntegramente la información, módulos, enlaces y capacidades funcionales existentes.
  - **Método:** auditoría estructural, capa visual cohesionada, optimización por secciones, validaciones técnicas y reporte detallado al usuario.
  - **Ejecución completada:**
    1. Se preservaron las 16 secciones de la portada, todos sus textos, mapas, formularios, carruseles, destinos, enlaces y scripts.
    2. Se creó una capa editorial unificada en `website/css/pages/index.css` con tokens locales, ancho editorial, espaciado fluido, radios, sombras y estados accesibles.
    3. Se reconstruyó la jerarquía del hero: promesa principal de gran impacto, alineación editorial izquierda, contraste reforzado y tres niveles claros de acción.
    4. La propuesta Problema/Solución se convirtió en un tablero legible; el planificador con IA recibió prioridad visual como núcleo del producto.
    5. Se normalizaron encabezados, tarjetas e imágenes en experiencias, destinos, cultura, servicios, mapa, aliados, cifras, impacto, SOS, comunidad, anfitriones y Android.
    6. Se reforzaron el mapa vivo, la descarga Android y el CTA final mediante superficies, profundidad y escalas tipográficas consistentes.
    7. Se incorporaron foco visible por teclado, soporte para movimiento reducido, `content-visibility` y contención intrínseca para secciones fuera del viewport.
    8. La prueba visual real detectó desbordamiento del hero y saturación de la barra móvil; ambos fueron corregidos con tipografía fluida y navegación ultracompacta.
    9. Se actualizó la versión de carga de `index.css` para invalidar caché del navegador.
  - **Archivos afectados:** `website/index.html`, `website/css/pages/index.css`, `website/styles.css` y `SESSION_LOG.md`.

- **Solicitud de videos fijos administrados por Ops Center (26 de Septiembre de 2026):**
  > *"quiero que aplique los videos donde corresponden además que sean de ultra alta calidad. y que no cambien. hasta que el ops center lo cambie"*
  - **Objetivo:** asignar material audiovisual de alta resolución a las secciones pertinentes del sitio.
  - **Regla de gobernanza:** impedir rotaciones o sustituciones automáticas; cada video permanecerá fijo hasta una actualización explícita desde el Ops Center.
  - **Plan:** auditar activos y registro multimedia, definir contrato persistente, integrar reproducción optimizada y validar rendimiento.
  - **Implementación:**
    1. Se sustituyó el registro externo y variable por cinco slots audiovisuales fijos con respaldo local: portada, destinos, cultura musical, gastronomía e historia.
    2. El hero dejó de encadenar cuatro fuentes alternativas; ahora utiliza una única fuente aprobada y no cambia según disponibilidad de terceros.
    3. Se integraron videos contextuales en la primera tarjeta de destinos y en los tres pilares de Cultura Viva, conservando las imágenes originales como pósteres.
    4. `video-registry.js` reproduce solo material visible, pausa al ocultarse la pestaña y respeta la preferencia de movimiento reducido.
    5. Se creó el contrato `app_config/site_videos`: la web aplica exclusivamente la última configuración publicada y conserva el catálogo local ante fallos de red.
    6. La Biblioteca Multimedia del Ops Center incorpora editores por slot, previsualización, URL MP4, póster, descripción y publicación auditada.
    7. El inventario operativo ahora registra los seis MP4 locales como recursos reales del sitio.
  - **Gobernanza:** `locked: true`, estado publicado y auditoría `SITE_VIDEOS_PUBLISHED`; no existe rotación automática.
  - **Archivos modificados:** `website/index.html`, `website/admin.html`, `website/js/video-registry.js`, `website/js/website-operations-catalog.js`, `website/js/ops-center/ops-engine.js`, `website/css/pages/index.css`, `website/assets/videos/README.md` y `SESSION_LOG.md`.

- **Enlace compartido para publicación de APK (26 de Septiembre de 2026):**
  > `https://drive.google.com/file/d/1gtk1uIlr5lLWhY0sVs6e-p-i-Kl51Nkq/view?usp=sharing`
  - **Objetivo:** utilizar el archivo compartido como descarga oficial transitoria de la aplicación Android.
  - **Validación:** Google Drive respondió HTTP 200 y el identificador `1gtk1uIlr5lLWhY0sVs6e-p-i-Kl51Nkq` cumple el formato esperado.
  - **Implementación:** el botón principal de Android utiliza la ruta directa `drive.usercontent.google.com/download`, sin atributo `download`, para delegar la entrega a Google Drive.
  - **Prueba de descarga:** respuesta HTTP 200, `Content-Type: application/octet-stream`, `Content-Disposition: attachment; filename="BaqueanoNicaragua.apk"` y tamaño reportado de 95,441,231 bytes.
  - **Ops Center:** el formulario de publicación externa queda precargado con el enlace compartido; una publicación administrativa futura puede reemplazarlo mediante `app_config/android_release` sin modificar código.

- **Auditoría integral del selector de tema y colores (26 de Septiembre de 2026):**
  > *"revisa bien el selector de tema que función tiene; no quiero que solo una sección cambie, el objetivo es que cambie todo el color de cada sección de la página y también el fondo"*
  - **Objetivo:** garantizar que paleta y fondo afecten globalmente secciones, superficies, tarjetas, textos, bordes y controles, manteniendo contraste y persistencia.
  - **Plan:** auditar variables y selectores, localizar colores rígidos, crear cobertura temática completa y probar todos los modos.
  - **Diagnóstico:** la portada contenía más de 200 declaraciones cromáticas rígidas; el Estudio de Color solo modificaba su vista previa y un fondo previamente seleccionado podía ocultar visualmente una nueva paleta.
  - **Correcciones:**
    1. Se añadieron tokens semánticos RGB y cromáticos para identidad, acento, fondos, superficies, bordes y textos.
    2. Se creó cobertura global para `main`, secciones, tarjetas, encabezados, párrafos, insignias, botones, navegación y footer.
    3. Las 16 secciones de `index.html` cuentan con una capa final que supera los antiguos fondos rígidos y alterna superficies pertenecientes a la paleta activa.
    4. Los modos Blanco, Crema, Negro, Petróleo, Pacífico, Carbón y color libre actualizan el fondo y las superficies de todas las secciones.
    5. El Estudio de Color aplica ahora fondo, título, texto y acento sobre las secciones reales; su estado personalizado se puede restablecer completamente.
    6. Al seleccionar manualmente un tema oficial se liberan overrides anteriores de fondo o estudio para aplicar la apariencia completa.
    7. Los textos ubicados sobre fotografías y videos conservan blanco de alto contraste incluso en modo claro.
    8. Se actualizaron versiones de caché de CSS y JavaScript para propagar el cambio inmediatamente.
  - **Archivos modificados:** `website/js/theme-switcher.js`, `website/css/theme-switcher.css`, `website/css/pages/index.css`, `website/js/navigation.js`, `website/index.html` y `SESSION_LOG.md`.

- **Directiva estratégica de teoría del color (26 de Septiembre de 2026):**
  > *"recuerda usar la teoría de color aquí en esa parte; quiero que vaya de todo: marketing, mercadólogo y diseñador gráfico"*
  - **Criterio obligatorio:** toda decisión cromática del selector debe integrar psicología del color, armonía, contraste, accesibilidad, identidad territorial y objetivos de conversión.
  - **Enfoque comercial:** naranja para acción y energía; petróleo/teal para confianza y tecnología; crema para cercanía cultural; verdes para sostenibilidad; azules para seguridad y exploración.
  - **Enfoque de diseño:** jerarquía 60-30-10, contraste WCAG, equilibrio de temperatura, consistencia de superficies y protección de legibilidad sobre fotografía y video.
  - **Aplicación futura:** evaluar cada paleta simultáneamente desde la perspectiva de marca, marketing turístico, conversión y diseño gráfico.

- **Verificación solicitada de videos (26 de Septiembre de 2026):**
  > *"verifica lo de los videos"*
  - **Alcance:** comprobar archivos, slots, URLs, carga pública, reproducción optimizada y administración exclusiva desde Ops Center.
  - **Resultados técnicos:**
    1. Los seis archivos tienen firma MP4 válida.
    2. Los cinco videos publicados responden HTTP 200 con `Content-Type: video/mp4` y tamaño completo.
    3. Los cinco slots del HTML coinciden con el catálogo de `video-registry.js`.
    4. La gobernanza `app_config/site_videos`, bloqueo editorial, auditoría e IntersectionObserver están conectados.
    5. `video nicaragua.mp4`: 2244×1586, 30 fps y aproximadamente 8.4 Mbps; apto como fuente principal de alta resolución.
    6. `destinos.mp4`, `video.mp4`, `gastronomia.mp4` e `historia.mp4`: 848×478 y aproximadamente 1.36 Mbps; funcionales en tarjetas pequeñas, pero no califican como UHD.
    7. `video 2.mp4`: 478×850, formato vertical de reserva.
  - **Decisión:** conservar los clips contextuales en tarjetas pequeñas y marcar su sustitución por 1080p/2160p real desde Ops Center; no simular ni declarar una resolución inexistente.

- **Corrección integral y rediseño de alta fidelidad del menú lateral (26 de Septiembre de 2026):**
  > *"el menu se ve feo asi a como esta"* — acompañado de captura de pantalla con colisión de capas flotantes.
  - **Diagnóstico del problema visual:**
    1. Las opciones con submenú (`Explorar` y `Mi País`) dentro del drawer lateral conservaban reglas de megamenú de escritorio (`position: absolute; width: 390px; top: calc(100% + 12px)`). Al activarse por clic o cursor, la tarjeta flotante cubría de forma desordenada las opciones inferiores (`Experiencias`, `Mi País`, `02 Planificar y conectar`).
    2. El botón flotante `#baqFloatingThemeBtn` ("Colores PERSONALIZAR") con `z-index: 9999` quedaba superpuesto sobre el pie del drawer (`Navegación protegida`), generando choque de elementos en la esquina inferior izquierda.
    3. Tipografías, alturas y anchos de tarjetas secundarias resultaban desproporcionadas y saturaban el espacio del drawer.
  - **Solución implementada:**
    1. **Arquitectura in-flow / Acordeón integrado:** El submenú dentro de `.nav-links-menu.mobile-open` se convirtió estrictamente a flujo natural en bloque (`position: static !important; width: 100% !important; transform: none !important`), empujando suavemente las opciones inferiores sin ningún solapamiento ni invasión de texto.
    2. **Sangría jerárquica territorial:** Los ítems anidados (`Destinos & Volcanes`, `17 Territorios`, `Mapa Vivo & 3D`, `Naturaleza & Conservación`) se presentan con sangría elegante (`margin-left: 12px`, `padding-left: 10px`), borde guía luminosa en `#F65E01` (Naranja Terracota Fuego), micro-iconos compactos y tarjetas estilizadas.
    3. **Micro-interacciones y control de estado:** Rotación suave de 180° en el chevrón indicador al expandir. Al contraer un grupo operativo, cualquier submenú abierto en su interior se repliega automáticamente para conservar el orden. Se eliminó la apertura accidental por `:hover` en el drawer.
    4. **Aislamiento del botón flotante de temas:** Se añadió la regla autoritativa `body.nav-drawer-open #baqFloatingThemeBtn { opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; }`, ocultándolo limpiamente mientras el drawer esté abierto.
    5. **Jerarquía Z-Index autoritativa:** El drawer opera en `z-index: 10050` y su fondo en `10040`, garantizando que ninguna capa o componente flotante de la web interfiera con la navegación.
    6. **Invalidación de caché:** Se actualizó la versión de activos a `v=20260926-ops-nav-4` en las 17 páginas HTML del ecosistema Baqueano.
  - **Validaciones:** `node --check` limpio (código 0), `git diff --check` limpio (código 0).

- **Corrección de apilamiento Z-Index y visibilidad cristalina del drawer (26 de Septiembre de 2026):**
  > *"mira como queda el menu"* — captura mostrando el drawer oscurecido y desenfocado detrás de un velo.
  - **Diagnóstico del problema de renderizado:**
    1. `.main-navbar` conservaba `z-index: 1000` en su regla base, mientras que `.nav-drawer-backdrop` tenía `z-index: 10040`. Al ser el backdrop un hijo directo de `<body>` y tener mayor índice que el contexto de apilamiento del navbar, el fondo oscuro con desenfoque (`backdrop-filter: blur(5px); background: rgba(2, 8, 15, 0.7)`) se renderizaba **por encima del drawer**, velándolo, oscureciéndolo y haciéndolo ilegible.
    2. El ancho del panel (`min(336px, 94vw)`) resultaba estrecho para pantallas de escritorio amplias, y los textos secundarios carecían de suficiente luminosidad.
  - **Solución implementada:**
    1. **Corrección de apilamiento en 3 niveles:**
       - Nivel 1: `.nav-drawer-backdrop` en `z-index: 10040 !important` (cubre y desenfoca únicamente el contenido de la página: hero, texto, media).
       - Nivel 2: `.main-navbar` en `z-index: 10050 !important` (supera al backdrop).
       - Nivel 3: `.main-navbar .nav-links-menu.mobile-open` en `z-index: 10060 !important` (el drawer queda completamente al frente, nítido, sin ningún velo ni desenfoque encima).
    2. **Amplitud y legibilidad:** Se amplió el ancho a `min(390px, 92vw)`, con tipografía en blanco puro (`#FFFFFF`), acentos territoriales en `#F65E01`, iconos en crema `#F4E6C1` y descripciones en `#CBD5E1`.
    3. **Invalidación de caché:** Se actualizó la versión de activos a `v=20260926-ops-nav-5` en las 17 páginas HTML.
  - **Archivos modificados:** `website/styles.css`, las 17 páginas `.html` del portal y `SESSION_LOG.md`.
  - **Validaciones:** `node --check` limpio (código 0), `git diff --check` limpio (código 0).
## 2026-09-26 — Diagnóstico de videos fuente 8K

- 🎯 **POR QUÉ:** El usuario informó que convirtió los videos a 8K y solicitó una solución para reducir su peso sin perder la calidad visual del sitio.
- ⚙️ **CÓMO:** Se inspeccionaron de forma no destructiva los MP4 de `website/assets/videos/`, sus tamaños, nombres y la disponibilidad local de herramientas de transcodificación.
- 📦 **QUÉ:** Se confirmó que las seis copias nuevas con sufijo `(1)` pesan aproximadamente 492 MB en conjunto y todavía no están enlazadas por el registro público. Los originales permanecen activos. `ffmpeg` y `ffprobe` no están instalados, por lo que no se realizó ninguna conversión. Se recomienda conservar las fuentes 8K fuera de la entrega pública y generar derivados web AV1/WebM y MP4 H.264 en 1440p/1080p según el tamaño visible de cada sección.

---

### 📅 Sesión del 27 de Septiembre de 2026 (~00:00) — Rediseño Editorial del Hero con Video y Carrusel de Destinos

- **Consulta del Usuario:**
  > *"no me gusta el diseño se puede hacer como la segunda imagen pero con video"* — acompañado de captura del hero actual y de imagen de referencia estilo expedición de clase mundial con video, titular editorial asimétrico, botón de acción en caja y carrusel de tarjetas al pie.
- **Diagnóstico y Análisis de la Referencia:**
  1. La portada previa presentaba un titular centrado, denso y macizo que cubría casi la totalidad del fondo, impidiendo apreciar el video panorámico de Nicaragua.
  2. La imagen de referencia plantea una arquitectura editorial de expedición:
     - Flanco izquierdo con ceja (*eyebrow*) `TIERRA DE LAGOS Y VOLCANES` acompañada de una línea horizontal luminosa.
     - Titular asimétrico nítido `NICARAGUA NO SE VISITA. SE DESCUBRE.` alineado a la izquierda.
     - Párrafo narrativo limpio y legible.
     - Botón minimalista `EXPLORAR DESTINOS` en caja con fondo traslúcido y borde fino, complementado con acceso a IA territorial.
     - Franja de redes sociales con micro-iconos monocromáticos alineados al margen izquierdo.
     - Carrusel al pie con tarjetas redondeadas de destinos icónicos (Corn Island, Isla de Ometepe, Cañón de Somoto, San Juan del Sur, Granada Colonial & Isletas) con botones circulares `<` y `>` para desplazarse.
     - Flanco derecho completamente abierto para reproducir el video panorámico en alta definición sin obstáculos, protegido por una máscara asimétrica de gradiente de 90°.
- **Solución Técnica Implementada:**
  1. **Hoja de Estilos Especializada:** Se creó `website/css/hero-editorial.css` bajo el estándar de la paleta oficial (`#165D6F`, `#F65E01`, `#F4E6C1`, `#061018`), con gradiente asimétrico, micro-interacciones a 60fps, y compatibilidad estricta con viewports de laptops y pantallas de 1366x768 / 1370x659 para asegurar que todos los componentes (incluyendo las tarjetas al pie) convivan dentro del viewport sin desbordes.
  2. **Controlador Interactivo:** Se programó `website/js/hero-experience.js` para:
     - Desplazamiento horizontal del carrusel con botones circulares de navegación y gestos táctiles.
     - Intercambio dinámico de video de fondo al seleccionar cualquier tarjeta con transición suave.
     - Controles HUD de video discretos en la esquina inferior derecha (Mute/Unmute y Play/Pause).
     - Detección con `IntersectionObserver` para ocultar automáticamente la baliza flotante de personalización de temas mientras el usuario se encuentre en el Hero, evitando cualquier solapamiento con los botones.
  3. **Integración en `website/index.html`:** Enlace de la nueva hoja de estilos y script modular preservando todos los metadatos y enlaces de navegación previos.
- **Validaciones:**
- **Supresión Definitiva de Baliza Flotante de Tema (27 de Septiembre de 2026):**
  > *"quitalo te ahi que funcione nada mas cuando toque el boton principal"* — acompañado de captura de pantalla del botón flotante "Colores PERSONALIZAR".
  - **Diagnóstico:** El botón flotante `.baq-theme-float-btn` se insertaba de forma persistente en `<body>` en la esquina inferior izquierda. Aunque resultaba accesible, generaba ruido visual y superposiciones indeseadas sobre la interfaz limpia del Hero y los botones de acción.
  - **Solución implementada:**
    1. Se eliminó la inyección en el DOM de `.baq-theme-float-btn` y `#baqFloatingThemeBtn` en `website/js/theme-switcher.js`, asegurando que si ya existía en memoria sea retirado inmediatamente con `.remove()`.
    2. Se configuró `.baq-theme-float-btn, #baqFloatingThemeBtn { display: none !important; visibility: hidden !important; pointer-events: none !important; opacity: 0 !important; }` en `website/css/theme-switcher.css` y `website/css/responsive-ecosystem.css`.
    3. El catálogo y personalizador de paletas y colores opera de forma exclusiva al pulsar el botón principal **"Tema"** (`#navThemeSwitcherBtn`) ubicado en la barra superior de navegación.
    4. Se actualizó la versión de activos a `v=20260926-global-theme-2` en `website/index.html`.
  - **Validaciones:**
    - Verificación con subagente en navegador real: botón flotante ausente en el 100% de la pantalla, apertura fluida del modal al pulsar el botón "Tema" del navbar y cierre impecable.
    - `node --check website/js/theme-switcher.js` limpio (código 0).

- **Alineación Tipográfica Exacta de Portada y Acento Fuego (27 de Septiembre de 2026):**
  > Captura de pantalla enviada por el usuario con la composición tipográfica exacta:
  > - Eyebrow: `AVENTURA · CULTURA · NATURALEZA · GASTRONOMÍA · GENTE INCREÍBLE`
  > - Titular en 3 líneas:
  >   `NICARAGUA` (blanco)
  >   `NO SE VISITA,` (blanco, con coma)
  >   `SE DESCUBRE` (Naranja Terracota Fuego `#F65E01`, sin punto final)
  > - Copia narrativa en voz nicaragüense: `Explorá sus destinos, viví su cultura, saboreá su gastronomía y conectá con experiencias auténticas que te transforman.`
  - **Diagnóstico:** El script general de tipografía cinética (`app.js`) transformaba el contenido del encabezado dividiendo las palabras y eliminando etiquetas internas como `<br>` y `<span>`.
  - **Solución implementada:**
    1. Se añadió `data-no-kinetic="true"` al elemento `<h1>` en `website/index.html` y se blindó la regla de exclusión en `app.js` (`heading.classList.contains('hero-editorial-title')`).
    2. Se garantizó la preservación estructural y cromática en `website/js/hero-experience.js`.
    3. Se aplicó `-webkit-text-fill-color: #F65E01 !important;` y `color: #F65E01 !important;` con máxima especificidad en `website/css/hero-editorial.css`.
  - **Validaciones:**
    - Verificación visual con subagente en navegador real: renderizado perfecto en 3 líneas, "SE DESCUBRE" en tono naranja fuego oficial (#F65E01) y texto narrativo con voseo local auténtico.
    - `node --check website/app.js` y `node --check website/js/hero-experience.js` limpios (código 0).


