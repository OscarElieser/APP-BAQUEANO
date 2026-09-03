// ============================================================================
// 🌅 SISTEMA DE GRADIENTES CROMÁTICOS & EFECTOS ATMOSFÉRICOS (APP_GRADIENTS.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer transiciones de luz y color ricas, inmersivas y dinámicas que simulan
//   los atardeceres del Pacífico, los cráteres incandescentes y la niebla de las
//   montañas de Nicaragua, elevando la aplicación al estándar visual Pro de alta gama.
// - Evitar fondos planos y aburridos, creando profundidad visual tridimensional
//   y guiando la atención del usuario hacia elementos clave interactivos.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Utiliza `LinearGradient` inmutables optimizados para renderizado en GPU
//   mediante el motor Impeller y Skia en Flutter.
// - Puntos de anclaje (`Alignment.topLeft`, `Alignment.bottomRight`) calculados
//   matemáticamente para una distribución armónica de la luminosidad.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & GRADIENTES EXPUESTOS):
// - `AppGradients.gold`: Para insignias de honor, suscripciones y elementos destacados.
// - `AppGradients.sunsetTerracotta`: Para botones de llamada a la acción (CTA) y Hero.
// - `AppGradients.volcanicHero`: Para fondos oscuros principales de alta inmersión.
// - `AppGradients.cardGlass`: Para tarjetas translúcidas con efecto de cristal (Glassmorphism).
// - `AppGradients.jungle`: Para destinos de ecoturismo y áreas protegidas.
// - `AppGradients.fireAccent`: Para avisos de volcán activo y ofertas exclusivas.
// ============================================================================

import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppGradients {
  /// Gradiente metálico dorado para medallas, estrellas y reconocimientos de prestigio.
  static const LinearGradient gold = LinearGradient(
    colors: [
      AppColors.gold,      // Base dorada pinolera
      AppColors.goldLight, // Brillo superior iluminado
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Gradiente atardecer pacífico (Terracota #F65E01 a Crema #F4E6C1), usado en botones CTA primarios.
  static const LinearGradient sunsetTerracotta = LinearGradient(
    colors: [
      AppColors.terracotta,    // Naranja Terracota Oficial (#F65E01)
      Color(0xFFFF7B26),       // Transición naranja vibrante
      AppColors.goldLight,     // Crema Arena Pinolera (#F4E6C1)
    ],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  /// Gradiente de inmersión volcánica para fondos principales y encabezados de sección.
  static const LinearGradient volcanicHero = LinearGradient(
    colors: [
      AppColors.primaryDark, // Petróleo oscuro (#0C3843)
      AppColors.primary,     // Petróleo Teal Oficial (#165D6F)
      AppColors.bgDark,      // Noche profunda (#0F172A)
    ],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  /// Gradiente translúcido para tarjetas Glassmorphism con bordes brillantes.
  static const LinearGradient cardGlass = LinearGradient(
    colors: [
      Color(0x2E227B91), // Brillo cristal superior al 18% (#227B91)
      Color(0x1A165D6F), // Sombra cristal inferior al 10% (#165D6F)
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Gradiente selva tropical para senderos ecológicos y reservas de biósfera.
  static const LinearGradient jungle = LinearGradient(
    colors: [
      AppColors.jungleGreen, // Verde bosque nuboso
      AppColors.craterTeal,  // Verde azulado de laguna
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Gradiente volcán activo para cintillos de ofertas y alertas de expedición.
  static const LinearGradient fireAccent = LinearGradient(
    colors: [
      Color(0xFFEA580C),    // Fuego de magma
      AppColors.terracotta, // Arcilla caliente
      AppColors.gold,       // Chispa dorada
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
