// ============================================================================
// 🎭 SISTEMA DE TEMA GLOBAL & TIPOGRAFÍA EDITORIAL (APP_THEME.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Centralizar la apariencia visual de la aplicación bajo un estándar consistente,
//   elegante y oscuro (Dark Luxury Theme), optimizado para reducir fatiga visual
//   y ahorrar batería en pantallas OLED/AMOLED de teléfonos modernos.
// - Implementar una jerarquía tipográfica triple de clase mundial:
//   * Montserrat (Títulos de gran impacto y presencia imponente).
//   * Space Grotesk (Subtítulos técnicos, métricas y etiquetas geográficas).
//   * Inter (Párrafos y descripciones con máxima legibilidad en lectura continua).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Configura `ThemeData` conforme a la especificación Material Design 3 (`useMaterial3: true`).
// - Define un `ColorScheme` oscuro integral con colores onPrimary, onSecondary y onSurface.
// - Sobrescribe temas de componentes base (CardTheme, AppBarTheme, ChipTheme, DividerTheme).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & TEMA EXPUESTO):
// - `AppTheme.darkTheme`: Objeto `ThemeData` listo para inyectarse en `MaterialApp.router`.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTheme {
  /// Retorna el tema oscuro oficial de Baqueano con tipografías cargadas vía GoogleFonts.
  static ThemeData get darkTheme {
    return ThemeData(
      // Activación del estándar moderno Material 3
      useMaterial3: true,
      brightness: Brightness.dark,

      // Fondo base de la aplicación (Medianoche Volcánica)
      scaffoldBackgroundColor: AppColors.bgDark,
      primaryColor: AppColors.primary,

      // Esquema de color semántico oficial
      colorScheme: const ColorScheme.dark(
        primary: AppColors.terracotta,
        secondary: AppColors.gold,
        surface: AppColors.bgSurface,
        error: AppColors.error,
        onPrimary: AppColors.textLight,
        onSecondary: AppColors.textDark,
        onSurface: AppColors.textLight,
      ),

      // ----------------------------------------------------------------------
      // 🔤 JERARQUÍA TIPOGRÁFICA EDITORIAL (Montserrat + Space Grotesk + Inter)
      // ----------------------------------------------------------------------
      textTheme: TextTheme(
        // Título monumental del Hero (Ej: "NICARAGUA EN MODO SECRETO")
        displayLarge: GoogleFonts.montserrat(
          fontSize: 48,
          fontWeight: FontWeight.w900,
          color: AppColors.textLight,
          letterSpacing: -1.0,
          height: 1.1,
        ),
        // Títulos de secciones mayores y modales de bienvenida
        displayMedium: GoogleFonts.montserrat(
          fontSize: 36,
          fontWeight: FontWeight.w800,
          color: AppColors.textLight,
          letterSpacing: -0.5,
          height: 1.15,
        ),
        // Encabezados de tarjetas principales de destino
        displaySmall: GoogleFonts.montserrat(
          fontSize: 28,
          fontWeight: FontWeight.w800,
          color: AppColors.textLight,
          height: 1.2,
        ),
        // Títulos técnicos con estilo monoespaciado moderno
        headlineLarge: GoogleFonts.spaceGrotesk(
          fontSize: 24,
          fontWeight: FontWeight.w700,
          color: AppColors.textLight,
          letterSpacing: -0.3,
        ),
        headlineMedium: GoogleFonts.spaceGrotesk(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: AppColors.textLight,
        ),
        headlineSmall: GoogleFonts.spaceGrotesk(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: AppColors.textLight,
        ),
        // Títulos de tarjetas en cuadrícula
        titleLarge: GoogleFonts.montserrat(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: AppColors.textLight,
        ),
        titleMedium: GoogleFonts.spaceGrotesk(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: AppColors.textLight,
        ),
        titleSmall: GoogleFonts.spaceGrotesk(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: AppColors.textMuted,
        ),
        // Cuerpo de texto principal para relatos y descripciones
        bodyLarge: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w400,
          color: AppColors.textLight,
          height: 1.6,
        ),
        // Cuerpo de texto secundario para metadatos y reseñas
        bodyMedium: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w400,
          color: AppColors.textMuted,
          height: 1.5,
        ),
        bodySmall: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w400,
          color: AppColors.textMuted,
          height: 1.4,
        ),
        // Texto para botones interactivos y chips
        labelLarge: GoogleFonts.spaceGrotesk(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.5,
        ),
      ),

      // ----------------------------------------------------------------------
      // 📱 TEMAS DE COMPONENTES MATERIAL BASE
      // ----------------------------------------------------------------------
      // Barra de navegación superior transparente estilo Glassmorphism
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: AppColors.textLight),
      ),

      // Tarjetas base con borde translúcido
      cardTheme: CardTheme(
        color: AppColors.bgCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.borderLight),
        ),
      ),

      // Chips de filtros de departamento y categoría
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.primaryLight.withValues(alpha: 0.5),
        labelStyle: GoogleFonts.spaceGrotesk(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: AppColors.goldLight,
        ),
        side: const BorderSide(color: AppColors.borderGold, width: 0.8),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),

      // Divisores estéticos ultra delgados
      dividerTheme: const DividerThemeData(
        color: AppColors.borderLight,
        thickness: 1,
      ),
    );
  }
}
