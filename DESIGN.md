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
// - Colores de apoyo (no sustituyen a los oficiales):
//   * Selva (naturaleza, éxito) : #4A7A5A · Papel de mapa (fondo web) : #F7F3EA
// - Fuente de verdad en la web: website/css/baqueano-system.css (tokens
//   --baqueano-*). No existe archivo de Figma: este documento + ese CSS mandan.
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
- **Tono Visual y Editorial Cálido**: Tipografía legible (Montserrat para títulos + Plus Jakarta Sans para texto; ninguna otra familia), títulos de alta jerarquía y lenguaje acogedor y respetuoso de la identidad nicaragüense.
- **Reseñas Comunitarias Auténticas**: Sistema visual de calificación con estrellas limpias, fotografías de visitantes reales y badges de exploradores recurrentes.

## 5. SISTEMA VISUAL WEB (tokens `--baqueano-*`)

| Rol | Token | Valor | Uso |
|---|---|---|---|
| Acción | `--baqueano-primary` | `#F65E01` | Botón principal, enlace activo, foco (anillo) |
| Navegación / info | `--baqueano-secondary` | `#165D6F` | Botón secundario, sello Verificado, datos |
| Noche | `--baqueano-dark` | `#0F172A` | Portadas oscuras, footer, texto sobre claro |
| Arena | `--baqueano-sand` | `#F4E6C1` | Acentos cálidos sobre noche, etiquetas |
| Selva | `--baqueano-accent` | `#4A7A5A` | Naturaleza, estados de éxito |
| Papel | `--baqueano-light` | `#F7F3EA` | Fondo general de página |

- **Tipografía:** 2 familias (Montserrat títulos, Plus Jakarta Sans texto), escala fluida `clamp()` de 320 a 1440 px.
- **Forma:** 4 radios (8 / 14 / 22 px / píldora). **Profundidad:** 3 sombras (sm / md / lg). **Espacio:** múltiplos de 4.
- **Regla:** el naranja es para la acción principal; no se usa como fondo de bloques de texto. Contraste mínimo 4.5:1 en texto normal.
