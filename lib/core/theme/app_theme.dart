// ============================================================================
// 🎭 SISTEMA DE TEMA GLOBAL & JERARQUÍA EDITORIAL (APP_THEME.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Unificar la identidad visual de la aplicación móvil de Baqueano con el sitio
//   web oficial (website/css/baqueano-system.css y typography.css).
// - Proporcionar un tema oscuro de alto rendimiento (Dark Luxury Theme) adaptado
//   a pantallas OLED/AMOLED con un contraste visual óptimo (WCAG 2.1 AA/AAA).
// - Aplicar las dos tipografías oficiales de la plataforma:
//   * League Spartan (títulos de display y elementos de impacto visual).
//   * Aristotelica Pro (texto corrido, etiquetas, métricas; respaldo Plus Jakarta Sans).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Especificación Material Design 3 (`useMaterial3: true`).
// - Define un `ColorScheme.dark` completo y armonioso con primary (Terracota #F65E01),
//   secondary (Petróleo Teal #165D6F), tertiary (Arena Pinolera #F4E6C1) y surface (Noche #0F172A).
// - Estricto uso de `.withValues(alpha: X)` para transparencia, erradicando `.withOpacity()`.
// - Temas especializados para AppBarTheme, CardThemeData, ChipThemeData, DividerThemeData
//   e InputDecorationTheme.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & TEMA EXPUESTO):
// - `AppTheme.darkTheme`: `ThemeData` central inyectable en MaterialApp.router.
// ============================================================================

import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'baqueano_fonts.dart';

class AppTheme {
  AppTheme._();

  /// Retorna el tema oscuro oficial de Baqueano sincronizado con el diseño web.
  static ThemeData get darkTheme {
    return ThemeData(
      // Activación del estándar moderno Material 3
      useMaterial3: true,
      brightness: Brightness.dark,

      // Fondo base de la aplicación (Noche Profunda #0F172A)
      scaffoldBackgroundColor: AppColors.bgDark,
      primaryColor: AppColors.primary,

      // Esquema de color semántico oficial sincronizado con website/
      colorScheme: const ColorScheme.dark(
        primary: AppColors.terracotta,
        onPrimary: AppColors.textLight,
        primaryContainer: AppColors.terracottaDark,
        onPrimaryContainer: AppColors.textLight,
        secondary: AppColors.primary,
        onSecondary: AppColors.textLight,
        secondaryContainer: AppColors.primaryLight,
        onSecondaryContainer: AppColors.textLight,
        tertiary: AppColors.sand,
        onTertiary: AppColors.textDark,
        tertiaryContainer: AppColors.goldDark,
        onTertiaryContainer: AppColors.textLight,
        surface: AppColors.bgDark,
        onSurface: AppColors.textLight,
        surfaceContainerHighest: AppColors.bgCard,
        error: AppColors.error,
        onError: AppColors.textLight,
        outline: AppColors.borderLight,
        outlineVariant: AppColors.borderOnDark,
      ),

      // ----------------------------------------------------------------------
      // 🔤 JERARQUÍA TIPOGRÁFICA OFICIAL (League Spartan + Aristotelica Pro)
      // ----------------------------------------------------------------------
      textTheme: TextTheme(
        // Título monumental del Hero (Ej: "NICARAGUA EN MODO SECRETO")
        displayLarge: BaqueanoFonts.display(
          fontSize: 48,
          fontWeight: FontWeight.w900,
          color: AppColors.textLight,
          letterSpacing: -1.0,
          height: 1.1,
        ),
        // Títulos de secciones mayores y modales de bienvenida
        displayMedium: BaqueanoFonts.display(
          fontSize: 36,
          fontWeight: FontWeight.w800,
          color: AppColors.textLight,
          letterSpacing: -0.5,
          height: 1.15,
        ),
        // Encabezados de tarjetas principales de destino
        displaySmall: BaqueanoFonts.display(
          fontSize: 28,
          fontWeight: FontWeight.w800,
          color: AppColors.textLight,
          height: 1.2,
        ),
        // Títulos de nivel 1 en vistas de detalle
        headlineLarge: BaqueanoFonts.display(
          fontSize: 24,
          fontWeight: FontWeight.w700,
          color: AppColors.textLight,
          letterSpacing: -0.3,
        ),
        headlineMedium: BaqueanoFonts.display(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: AppColors.textLight,
        ),
        headlineSmall: BaqueanoFonts.text(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: AppColors.textLight,
        ),
        // Títulos de tarjetas y modales
        titleLarge: BaqueanoFonts.display(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: AppColors.textLight,
        ),
        titleMedium: BaqueanoFonts.text(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: AppColors.textLight,
        ),
        titleSmall: BaqueanoFonts.text(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: AppColors.textMuted,
        ),
        // Cuerpo de texto principal para relatos y descripciones
        bodyLarge: BaqueanoFonts.text(
          fontSize: 16,
          fontWeight: FontWeight.w400,
          color: AppColors.textLight,
          height: 1.6,
        ),
        // Cuerpo de texto secundario para metadatos y reseñas
        bodyMedium: BaqueanoFonts.text(
          fontSize: 14,
          fontWeight: FontWeight.w400,
          color: AppColors.textMuted,
          height: 1.5,
        ),
        bodySmall: BaqueanoFonts.text(
          fontSize: 12,
          fontWeight: FontWeight.w400,
          color: AppColors.textMuted,
          height: 1.4,
        ),
        // Botones interactivos y etiquetas destacadas
        labelLarge: BaqueanoFonts.text(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          color: AppColors.textLight,
          letterSpacing: 0.5,
        ),
        labelMedium: BaqueanoFonts.text(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: AppColors.textMuted,
        ),
        labelSmall: BaqueanoFonts.text(
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: AppColors.textMuted,
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

      // Tarjetas base con elevación cero y borde translúcido
      cardTheme: CardThemeData(
        color: AppColors.bgCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: const BorderSide(color: AppColors.borderLight),
        ),
      ),

      // Chips de filtros de departamento y categoría
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.primary.withValues(alpha: 0.35),
        labelStyle: BaqueanoFonts.text(
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

      // Botones elevados de acción primaria (Terracota)
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.terracotta,
          foregroundColor: AppColors.textLight,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          textStyle: BaqueanoFonts.text(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.3,
          ),
        ),
      ),
    );
  }
}
