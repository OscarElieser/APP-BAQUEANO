// ============================================================================
// 🎨 SISTEMA DE COLORIMETRÍA OFICIAL & TOKENS VISUALES (APP_COLORS.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Definir la identidad cromática distintiva de Baqueano, inspirada en la geografía
//   salvaje de Nicaragua: basaltos volcánicos, arcilla de barro de San Juan de Oriente,
//   oro precolombino, selvas de nebliselva y aguas minerales de cráteres volcánicos.
// - Garantizar contraste visual accesible (WCAG AAA), elegancia en modo oscuro y
//   consistencia en toda la interfaz sin depender de valores "quemados" (hardcoded).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Constantes estáticas inmutables `Color(0xFF...)` de 32-bits ARGB.
// - Compatible al 100% con la nueva API moderna de Flutter usando `.withValues(alpha: X)`
//   evitando por completo métodos deprecados como `.withOpacity()`.
// - Estructurado por familias semánticas: Primarios, Acentos, Fondos, Naturaleza y Estados.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & TOKENS EXPUESTOS):
// - Paleta de colores oficiales accesible globalmente a través de `AppColors.[nombreColor]`.
// ============================================================================

import 'package:flutter/material.dart';

class AppColors {
  // --------------------------------------------------------------------------
  // 🌋 FAMILIA PRIMARIA: PETRÓLEO VOLCÁNICO (Basalto de los volcanes de Nicaragua)
  // --------------------------------------------------------------------------
  /// Color base principal de la plataforma, transmite profundidad y solidez geológica.
  static const Color primary = Color(0xFF082B35);

  /// Variante clara para contenedores elevados, barras de navegación y tarjetas glass.
  static const Color primaryLight = Color(0xFF13424E);

  /// Variante profunda para el fondo de pantalla general y áreas de inmersión máxima.
  static const Color primaryDark = Color(0xFF041920);

  // --------------------------------------------------------------------------
  // 🏺 FAMILIA DE ACENTO 1: TERRACOTA / ARCILLA NICA (Artesanías y calor de la tierra)
  // --------------------------------------------------------------------------
  /// Color de acción primario para botones de llamada a la acción (CTA) y destacados.
  static const Color terracotta = Color(0xFFC86432);

  /// Sombra y estado presionado de botones terracota.
  static const Color terracottaDark = Color(0xFF8B3A14);

  /// Acento vibrante para etiquetas de estado, badges de categoría y bordes iluminados.
  static const Color terracottaLight = Color(0xFFE27B48);

  // --------------------------------------------------------------------------
  // ✨ FAMILIA DE ACENTO 2: ORO PINOLERO (Tesoros ancestrales y sol naciente)
  // --------------------------------------------------------------------------
  /// Oro de lujo para medallas, valoraciones con estrellas e insignias de guías certificados.
  static const Color gold = Color(0xFFD4AF37);

  /// Variante suave para textos de énfasis sobre fondos oscuros.
  static const Color goldLight = Color(0xFFF3E5AB);

  /// Variante oscura para gradientes metálicos y detalles sutiles.
  static const Color goldDark = Color(0xFFA68519);

  // --------------------------------------------------------------------------
  // 🌌 FONDOS Y SUPERFICIES EN MODO OSCURO (Dark Luxury UI)
  // --------------------------------------------------------------------------
  /// Fondo más profundo de la aplicación (Midnight Volcano).
  static const Color bgDark = Color(0xFF0F172A);

  /// Superficie base de modales y drawers.
  static const Color bgSurface = Color(0xFF082B35);

  /// Fondo de tarjetas informativas y contenedores de catálogo.
  static const Color bgCard = Color(0xFF132A33);

  /// Estado hover/activo cuando el usuario interactúa con una tarjeta.
  static const Color bgCardHover = Color(0xFF1A3B47);

  // --------------------------------------------------------------------------
  // 🏖️ TONOS ARENA Y COSTA (Playas del Pacífico y Caribe)
  // --------------------------------------------------------------------------
  /// Tono cálido arena para insignias claras o temas híbridos.
  static const Color sand = Color(0xFFF4EBD9);

  /// Arena clara perlada para contrastes ligeros.
  static const Color sandLight = Color(0xFFF8FAF9);

  /// Arena oscura costera.
  static const Color sandDark = Color(0xFFE6D6BC);

  // --------------------------------------------------------------------------
  // 🌿 NATURALEZA: VERDE SELVA & ECOTURISMO (Reserva Indio Maíz & Bosawás)
  // --------------------------------------------------------------------------
  /// Verde selva primaria para distintivos de sostenibilidad y conservación ecológica.
  static const Color jungleGreen = Color(0xFF2E7D32);

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
  /// Texto principal en blanco marfil de máxima legibilidad (98% luminancia).
  static const Color textLight = Color(0xFFF8FAFC);

  /// Texto secundario atenuado para descripciones, metadatos y subtítulos.
  static const Color textMuted = Color(0xFF94A3B8);

  /// Texto oscuro para usar sobre fondos dorados o botones de alta luminosidad.
  static const Color textDark = Color(0xFF0F172A);

  /// Borde sutil blanco al 15% para efecto de vidrio (Glassmorphism).
  static const Color borderLight = Color(0x26FFFFFF);

  /// Borde dorado al 40% para tarjetas VIP y destacadas.
  static const Color borderGold = Color(0x66D4AF37);

  /// Borde terracota al 40% para botones y alertas culturales.
  static const Color borderTerracotta = Color(0x66C86432);

  // --------------------------------------------------------------------------
  // 🚨 ESTADOS SEMÁNTICOS DEL SISTEMA (Feedback al usuario)
  // --------------------------------------------------------------------------
  /// Verde éxito para confirmaciones de reserva y pagos procesados.
  static const Color success = Color(0xFF10B981);

  /// Ámbar de precaución para advertencias de clima o dificultad en senderos.
  static const Color warning = Color(0xFFF59E0B);

  /// Rojo volcánico de error para validaciones fallidas y alertas de rescate.
  static const Color error = Color(0xFFEF4444);

  /// Azul informativo para consejos de viaje y notificaciones del sistema.
  static const Color info = Color(0xFF3B82F6);
}
