// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — DESIGN SYSTEM & MARKETING EXPERIENCE PRINCIPLES
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer la guía canónica de diseño visual, experiencia de usuario (UX) e
//   identidad estética de BAQUEANO Nicaragua, vinculando el sistema visual con
//   los principios del modelo de las 4 C del Marketing (Consumidor, Costo,
//   Conveniencia y Comunicación).
// - Garantizar que cada pantalla celebre la belleza auténtica del territorio,
//   reduzca la fricción cognitiva del explorador y dignifique a las comunidades.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & SISTEMA DE TOKENS):
// - Paleta de Color Oficial de Marca:
//   * Petróleo Teal (Primario / Naturaleza Profunda) : #165D6F
//   * Naranja Terracota Fuego (Acento / Energía Volcánica) : #F65E01
//   * Crema Arena Pinolera (Lienzo / Calidez Territorial) : #F4E6C1
//   * Noche Profunda (Contraste / Tipografía & Sombras) : #0F172A
// - Reglas Técnicas Innegociables:
//   * Cero uso de .withOpacity(); uso estricto de .withValues(alpha: X).
//   * Glassmorphism refinado: BackdropFilter con blur funcional y bordes sutiles.
//   * Animaciones continuas a 60fps con curvas ergonómicas (Curves.easeInOut).
//   * Enfoque Mobile-First riguroso: touch targets mínimos de 48x48px.
//
// 📦 3. QUÉ (WHAT / PRINCIPIOS DE EXPERIENCIA 4C):
// ============================================================================

# 🧭 BAQUEANO — MARKETING EXPERIENCE PRINCIPLES (4C & UX)

## 1. CONSUMIDOR (Customer-Centric UX)
- **Claridad de Intención**: Las interfaces no asumen qué ofrecer; responden inmediatamente a la pregunta del viajero: *¿Qué quieres vivir en Nicaragua?*
- **Cero Patrones Oscuros (No Dark Patterns)**: Prohibidos los contadores de urgencia engañosa ("¡Solo queda 1 habitación!"). La información es honesta, transparente y basada en la realidad del anfitrión campesino.
- **Microinteracciones con Sentido**: El guardado de favoritos en `mi-viaje.html` ofrece feedback háptico/visual inmediato (animación de confirmación suave) para dar certidumbre al usuario de que su itinerario está a salvo.

## 2. COSTO (Cost Transparency & Uncertainty Reduction)
- **Etiquetas de Precio Transparentes**: Toda tarjeta de destino, alojamiento o tour debe declarar su costo de manera clara y desglosada (`Desde C$...`, `Por persona`, `Entrada gratuita`).
- **Erradicación de la Incertidumbre Visual**:
  - Chips informativos claros para variables críticas:
    * `[Efectivo / Tarjeta]`
    * `[Señal Claro / Tigo / Sin Señal]`
    * `[Acceso Sedán / Requiere 4x4]`
    * `[Parqueo Seguro ✓]`
  - Sello destacado de **Negocio Verificado BAQUEANO** en color `#165D6F` con tilde dorada para garantizar legitimidad.
- **Desglose de Presupuesto en Baqueano IA**: La interfaz del concierge presenta tarjetas de presupuesto con formato estructurado (Hospedaje + Transporte + Comida + Actividades = Total por persona).

## 3. CONVENIENCIA (Frictionless All-in-One Architecture)
- **Mobile-First Real**: Navegación accesible con el pulgar en pantallas de 360px a 430px.
- **Todo en un Ecosistema**: El usuario pasa de explorar en el Home a visualizar en el mapa, chatear con IA y consultar su itinerario sin salir de la plataforma ni instalar múltiples apps.
- **Navegación Sticky y Barra Global de Acciones**: La barra de navegación permanece disponible con acceso inmediato al mapa territorial, buscador y asistencia.
- **Resiliencia Offline**: `website/mi-viaje.html` y los pases QR deben funcionar en áreas remotas sin cobertura mediante caché de Service Worker.

## 4. COMUNICACIÓN (Human, Warm & Direct Communication)
- **Contacto en 1 Toque**: Botón flotante y accesible para contactar al anfitrión vía WhatsApp con mensajes contextualizados previamente estructurados.
- **Tono Visual y Editorial Cálido**: Tipografía legible (Inter / Plus Jakarta Sans), títulos de alta jerarquía y lenguaje acogedor y respetuoso de la identidad nicaragüense.
- **Reseñas Comunitarias Auténticas**: Sistema visual de calificación con estrellas limpias, fotografías de visitantes reales y badges de exploradores recurrentes.
