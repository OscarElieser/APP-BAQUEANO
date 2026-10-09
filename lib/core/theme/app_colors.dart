// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SISTEMA DE COLORIMETRÍA & TOKENS VISUALES
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Sincronizar fielmente la paleta de colores oficial extraída del sistema de diseño web
//   (website/css/baqueano-system.css y typography.css) con la aplicación Flutter móvil.
// - Inspirada en la geografía y cultura de Nicaragua:
//   * Petróleo Teal / Laguna (#165D6F): Navegación, serenidad e identidad oficial.
//   * Naranja Volcán / Terracota (#F65E01): Acción, energía y botones primarios.
//   * Arena Pinolera / Crema (#F4E6C1): Calidez, distinciones y superficies doradas.
//   * Noche Profunda (#0F172A): Fondos oscuros de alto contraste y ahorro energético.
//   * Selva / Naturaleza (#4A7A5A / #3E7B52): Áreas protegidas y sostenibilidad.
// - Garantizar contraste visual accesible (WCAG 2.1 AA/AAA) y soporte nativo oscuro.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Constantes estáticas inmutables `Color(0xFF...)` de 32-bits ARGB.
// - Compatible al 100% con la API moderna de Flutter usando `.withValues(alpha: X)`
//   erradicando por completo métodos deprecados como `.withOpacity()`.
// - Estructurado por familias semánticas: Marca, Acentos, Superficies, Textos,
//   Naturaleza y Estados del sistema, preservando compatibilidad retroactiva.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & TOKENS EXPUESTOS):
// - `AppColors`: Clase utilitaria global con acceso estático a todos los tokens.
// ============================================================================

import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // --------------------------------------------------------------------------
  // 🌊 FAMILIA PRIMARIA: PETRÓLEO TEAL (#165D6F - Identidad Oficial Baqueano)
  // --------------------------------------------------------------------------
  /// Color base principal de la plataforma (Laguna / Navegación).
  static const Color primary = Color(0xFF165D6F);

  /// Variante clara para contenedores elevados, barras de navegación y tarjetas.
  static const Color primaryLight = Color(0xFF227B91);

  /// Variante profunda para fondos de inmersión y hover.
  static const Color primaryDark = Color(0xFF0E4655);

  /// Alias semántico web para navegación e información.
  static const Color secondary = Color(0xFF165D6F);

  // --------------------------------------------------------------------------
  // 🔥 FAMILIA DE ACENTO 1: NARANJA FUEGO / TERRACOTA (#F65E01 - Acción Oficial)
  // --------------------------------------------------------------------------
  /// Color de acción primario para botones de llamada a la acción (CTA) y destacados.
  static const Color terracotta = Color(0xFFF65E01);

  /// Sombra y estado presionado/fill de botones terracota (#C54B01 / #BF4800).
  static const Color terracottaDark = Color(0xFFC54B01);

  /// Acento vibrante para etiquetas de estado, badges de categoría y bordes iluminados.
  static const Color terracottaLight = Color(0xFFFF7B26);

  // --------------------------------------------------------------------------
  // ✨ FAMILIA DE ACENTO 2: ORO PINOLERO Y CREMA (#F4E6C1 - Tonos Cálidos)
  // --------------------------------------------------------------------------
  /// Oro cálido para medallas, valoraciones con estrellas e insignias de guías.
  static const Color gold = Color(0xFFD4AF37);

  /// Crema suave oficial para textos de énfasis, badges e iluminación.
  static const Color goldLight = Color(0xFFF4E6C1);

  /// Variante oscura para gradientes y detalles sutiles.
  static const Color goldDark = Color(0xFFA68519);

  // --------------------------------------------------------------------------
  // 🌌 FONDOS Y SUPERFICIES (Dark Luxury UI Sincronizada con Web)
  // --------------------------------------------------------------------------
  /// Fondo más profundo de la aplicación (Noche Profunda #0F172A).
  static const Color bgDark = Color(0xFF0F172A);

  /// Noche con relieve para contenedores y paneles (#102A43).
  static const Color bgDark2 = Color(0xFF102A43);

  /// Superficie base de modales y drawers alineada al Petróleo Teal (#165D6F).
  static const Color bgSurface = Color(0xFF165D6F);

  /// Fondo de tarjetas informativas y contenedores de catálogo (#0F4350 / #102A43).
  static const Color bgCard = Color(0xFF0F4350);

  /// Estado hover/activo cuando el usuario interactúa con una tarjeta (#1B6A7D).
  static const Color bgCardHover = Color(0xFF1B6A7D);

  /// Superficie clara tipo papel de mapa para elementos de alto contraste (#F7F3EA).
  static const Color bgLight = Color(0xFFF7F3EA);

  // --------------------------------------------------------------------------
  // 🏖️ TONOS ARENA Y CREMA PINOLERA (#F4E6C1 - Oficial Web)
  // --------------------------------------------------------------------------
  /// Tono crema cálido oficial para insignias claras, acentos y fondos contrastados.
  static const Color sand = Color(0xFFF4E6C1);

  /// Arena clara perlada / papel de mapa (#F7F3EA).
  static const Color sandLight = Color(0xFFF7F3EA);

  /// Arena dorada costera (#E5D2A0).
  static const Color sandDark = Color(0xFFE5D2A0);

  // --------------------------------------------------------------------------
  // 🌿 NATURALEZA: VERDE SELVA & ECOTURISMO (Reserva Indio Maíz & Bosawás)
  // --------------------------------------------------------------------------
  /// Verde selva primario para distintivos de sostenibilidad (#4A7A5A / #3E7B52).
  static const Color accent = Color(0xFF4A7A5A);

  /// Verde selva para sellos de conservación (#2E7D32 / #3E7B52).
  static const Color jungleGreen = Color(0xFF3E7B52);

  /// Verde vibrante para sellos de comercio justo "100% Comunitario".
  static const Color jungleGreenLight = Color(0xFF4CAF50);

  /// Verde oscuro follaje para fondos de tarjetas ecológicas.
  static const Color jungleGreenDark = Color(0xFF1B5E20);

  // --------------------------------------------------------------------------
  // 🌊 AGUAS DE CRÁTER & RÍOS (Laguna de Apoyo y Río San Juan)
  // --------------------------------------------------------------------------
  /// Teal esmeralda para rutas acuáticas, cascadas y nado en cañones.
  static const Color craterTeal = Color(0xFF00A896);

  /// Acento teal iluminado para etiquetas de senderismo acuático.
  static const Color craterTealLight = Color(0xFF02C39A);

  // --------------------------------------------------------------------------
  // 📝 TIPOGRAFÍA, NEUTROS & BORDES TRANSLÚCIDOS
  // --------------------------------------------------------------------------
  /// Texto principal en papel de mapa / marfil (#F7F3EA) de máxima legibilidad.
  static const Color textLight = Color(0xFFF7F3EA);

  /// Texto secundario atenuado para descripciones, metadatos y subtítulos (#94A3B8 / #4F5E6B).
  static const Color textMuted = Color(0xFF94A3B8);

  /// Texto oscuro para usar sobre fondos crema, arenas o botones dorados (#15232F).
  static const Color textDark = Color(0xFF15232F);

  /// Borde sutil blanco al 15% para efecto de vidrio (Glassmorphism).
  static const Color borderLight = Color(0x26FFFFFF);

  /// Borde dorado al 40% para tarjetas destacadas (#D4AF37).
  static const Color borderGold = Color(0x66D4AF37);

  /// Borde terracota al 40% para botones y alertas culturales (#F65E01).
  static const Color borderTerracotta = Color(0x66F65E01);

  /// Borde sobre superficies oscuras (#F4E6C1 al 18%).
  static const Color borderOnDark = Color(0x2EF4E6C1);

  // --------------------------------------------------------------------------
  // 🚨 ESTADOS SEMÁNTICOS DEL SISTEMA (Feedback al usuario)
  // --------------------------------------------------------------------------
  /// Verde éxito para confirmaciones de reserva y pagos procesados (#3E7B52 / #10B981).
  static const Color success = Color(0xFF3E7B52);

  /// Ámbar de precaución para advertencias de clima o dificultad en senderos (#B7791F).
  static const Color warning = Color(0xFFB7791F);

  /// Rojo volcánico de error para validaciones fallidas y alertas (#C0392B).
  static const Color error = Color(0xFFC0392B);

  /// Azul informativo para consejos de viaje y notificaciones (#165D6F).
  static const Color info = Color(0xFF165D6F);
}
