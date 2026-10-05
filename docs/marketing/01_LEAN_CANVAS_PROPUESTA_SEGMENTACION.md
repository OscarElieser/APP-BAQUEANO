# 🧭 BAQUEANO — Lean Canvas, propuesta de valor, segmentación y Buyer Personas

## 🎯 POR QUÉ (Propósito)
Explicar en una página el modelo de negocio de BAQUEANO, para quién existe y por qué lo elegirían frente a Google Maps, Facebook o una agencia. Es la base de todas las piezas de comunicación (ver `05_BRIEF_CREATIVO_Y_CAMPANA.md`).

## ⚙️ CÓMO (Método)
- **Lean Canvas** (Ash Maurya): los 9 bloques del modelo.
- **Value Proposition Canvas** (Strategyzer): tareas, dolores y alegrías del cliente frente a calmantes y creadores de alegría del producto.
- **Segmentación** geográfica, demográfica, psicográfica y conductual. Cada segmento se cruza con las 4C (`docs/design/MARKETING_4C_BAQUEANO.md`).
- Todo se apoya en funciones que **ya existen** en `baqueanonicaragua.com`; lo que es objetivo futuro se marca como tal.

## 📦 QUÉ (Entregables)

### 1. Lean Canvas

| Bloque | Contenido |
|---|---|
| **1. Problema** | (a) La información turística de Nicaragua está dispersa en grupos de Facebook, posts viejos y boca a boca. (b) Las comunidades rurales y los emprendedores no tienen presencia digital digna y dependen de intermediarios. (c) El viajero no sabe cómo llegar, cuánto cuesta ni qué tan seguro es un lugar antes de salir. |
| **Alternativas actuales** | Google Maps, grupos de Facebook, Instagram, TripAdvisor (débil fuera de Granada, León y San Juan del Sur), agencias tradicionales. |
| **2. Segmentos de clientes** | B2C: turista nacional de fin de semana, diáspora nicaragüense y turista internacional responsable. B2B: emprendedores y comunidades anfitrionas. Institucional: alcaldías, cooperativas y ONG ambientales. |
| **Early adopters** | Jóvenes profesionales de Managua, León y Estelí (22–35 años) que ya viajan los fines de semana y comparten en redes; cooperativas de turismo rural ya organizadas. |
| **3. Propuesta única de valor** | **"Descubrí lo que no sale en el mapa":** los 15 departamentos y 2 regiones autónomas en una sola plataforma, con mapa por territorio, BAQUI para planificar viajes, experiencias reales de viajeros moderadas y contacto directo con los anfitriones, sin comisiones abusivas. |
| **Concepto de alto nivel** | "La guía del baqueano local, en tu celular". |
| **4. Solución** | (1) Guía territorial de 17 territorios con historia, sabores, fiestas, rutas y SOS. (2) BAQUI: entiende "somos 2 adultos y 3 niños con 500 dólares" y arma la ruta, el mapa y el presupuesto; pregunta lo que falta. (3) Comunidad de experiencias con fotos y videos moderados. (4) Vitrina de negocios verificados. (5) App Android. |
| **5. Canales** | SEO (`baqueanonicaragua.com`, 6 idiomas), Instagram, TikTok y Facebook, WhatsApp, alianzas con alcaldías y cooperativas, ferias de turismo y universidades, código QR en negocios aliados. |
| **6. Fuentes de ingreso** | Fase 1: gratis para viajeros. Fase 2: suscripción de visibilidad para negocios verificados (plan básico gratis y plan destacado), anuncios territoriales contextuales. Fase 3: comisión baja y transparente por reserva directa. |
| **7. Estructura de costos** | Azure VM (sitio y API), Supabase (datos, almacenamiento, funciones), Firebase Auth, dominio en Hostinger, IA (BAQUI), tiempo de verificación y moderación, contenido audiovisual. |
| **8. Métricas clave** | Ver `02_OBJETIVOS_SMART_Y_CRECIMIENTO.md`: viajeros registrados, rutas generadas por BAQUI, experiencias publicadas, negocios verificados, clics a WhatsApp y retención a 30 días. |
| **9. Ventaja injusta** | Contenido territorial curado de los 17 territorios con fuentes, voz local nicaragüense (voseo), moderación y verificación humanas, y una arquitectura segura y reproducible (RLS, roles, CI) que una página de Facebook no puede copiar. |

### 2. Value Proposition Canvas

**Perfil del cliente (explorador):**

| Tareas (jobs) | Dolores | Alegrías |
|---|---|---|
| Elegir a dónde ir el fin de semana | Información vieja o contradictoria | Descubrir un lugar que sus amigos no conocen |
| Calcular cuánto cuesta el viaje para la familia | Llegar y encontrar el sitio cerrado | Saber el costo antes de salir |
| Saber cómo llegar (bus, carro, lancha) | Precios inflados al llegar | Viajar seguro con los niños |
| Sentirse seguro en zonas rurales | No saber qué hacer en una emergencia | Apoyar directamente a familias locales |
| Compartir la experiencia | Planificar en 10 pestañas distintas | Ser reconocido como explorador (pasaporte, insignias) |

**Mapa de valor (BAQUEANO):**

| Productos y servicios | Calmantes de dolor | Creadores de alegría |
|---|---|---|
| Guía de 17 territorios | Fichas por territorio sin mezclar información de otros lugares | Rutas sugeridas y leyendas locales |
| BAQUI (planificador) | No inventa precios ni días: pregunta lo que falta | Ruta, mapa e itinerario en un solo paso |
| Centro SOS | Números nacionales 118, 128 y 115 y hospital de referencia por departamento | Tranquilidad para viajar en familia |
| Comunidad de experiencias | Reseñas reales moderadas; denuncias de contenido | Publicar fotos y videos y recibir comentarios |
| Vitrina de negocios verificados | Sello de verificación y contacto directo | Encontrar la finca, el comedor o el guía local |

**Declaración de propuesta de valor:**
> Para exploradores que quieren conocer la Nicaragua real sin perderse ni pagar de más, **BAQUEANO** es la guía digital del territorio que, a diferencia de los grupos de Facebook y los mapas genéricos, reúne en un solo lugar rutas, costos verificables, seguridad y experiencias reales de viajeros, y conecta directamente con las comunidades que te reciben.

### 3. Segmentación de mercado

| Segmento | Geográfica | Demográfica | Psicográfica | Conductual | Prioridad |
|---|---|---|---|---|---|
| **S1 Explorador nacional** | Managua, León, Masaya, Estelí, Granada | 22–35 años, estudiantes y profesionales | Aventura, naturaleza, orgullo nacional | Viaja 1–2 fines de semana al mes; planifica en el celular | **Alta (lanzamiento)** |
| **S2 Familia nicaragüense** | Zonas urbanas del Pacífico | 30–50 años, con hijos | Seguridad, presupuesto, tradición | Vacaciones de Semana Santa, julio y diciembre | Alta |
| **S3 Diáspora** | EE. UU., Costa Rica, España | 25–55 años | Nostalgia, reconexión con raíces | Visita anual; planifica desde fuera; idioma español o inglés | Media |
| **S4 Turista internacional responsable** | Europa y Norteamérica | 25–45 años | Ecoturismo, cultura, impacto local | Viajes de 1–3 semanas; usa EN, FR, IT, PT y DE | Media |
| **S5 Emprendedor y comunidad anfitriona (B2B)** | Los 17 territorios | Familias, cooperativas, guías y comedores | Dignidad, autonomía y ventas directas | Usa WhatsApp; poca presencia web | **Alta (oferta)** |

### 4. Buyer Personas

| | **Mateo Valenzuela** (S1) | **Karla y Roberto Duarte** (S2) | **Doña Esperanza López** (S5, anfitriona) |
|---|---|---|---|
| Edad y lugar | 28 · Managua | 38 y 41 · Masaya, con 3 hijos | 52 · Somoto, Madriz |
| Ocupación | Desarrollador remoto | Docente y técnico electricista | Dueña de comedor y guía del cañón |
| Objetivo | Escaparse a lugares nuevos cada fin de semana | Vacaciones baratas y seguras con los niños | Que lleguen visitantes todo el año, no solo en temporada |
| Frustración | Lugares cerrados; información vieja | No saber cuánto les va a costar; miedo a imprevistos | Depender de intermediarios; no saber usar páginas web |
| Cómo usa BAQUEANO | Mapa por departamento, comunidad, insignias | BAQUI: "somos 2 adultos y 3 niños, 500 dólares", SOS | Vitrina verificada y contacto por WhatsApp |
| Mensaje que le llega | "Descubrí lo que no sale en el mapa" | "Tu viaje en familia, claro desde el inicio" | "Tu negocio visible, sin intermediarios" |
| Canal | Instagram y TikTok | Facebook y WhatsApp | Visita de campo, alcaldía y cooperativa |
