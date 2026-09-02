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

  /// Gradiente atardecer pacífico (Terracota a Oro), usado en botones CTA primarios.
  static const LinearGradient sunsetTerracotta = LinearGradient(
    colors: [
      AppColors.terracotta,    // Arcilla de San Juan de Oriente (#C86432)
      Color(0xFFE27B48),       // Transición naranja atardecer
      AppColors.gold,          // Destello dorado de salida
    ],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  /// Gradiente de inmersión volcánica para fondos principales y encabezados de sección.
  static const LinearGradient volcanicHero = LinearGradient(
    colors: [
      Color(0xFF041920), // Noche cerrada volcánica
      Color(0xFF082B35), // Petróleo base
      Color(0xFF0F172A), // Base azul medianoche
    ],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  /// Gradiente translúcido para tarjetas Glassmorphism con bordes brillantes.
  static const LinearGradient cardGlass = LinearGradient(
    colors: [
      Color(0x2E13424E), // Brillo cristal superior al 18%
      Color(0x1A082B35), // Sombra cristal inferior al 10%
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
