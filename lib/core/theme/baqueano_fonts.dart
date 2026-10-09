// ============================================================================
// 🔤 TIPOGRAFÍAS OFICIALES DE BAQUEANO (BAQUEANO_FONTS.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Directiva del propietario (2026-10-08): League Spartan y Aristotelica Pro
//   son las dos tipografías oficiales de BAQUEANO y las predeterminadas en
//   toda la app. Antes convivían Montserrat, Space Grotesk e Inter repartidas
//   en cientos de llamadas `GoogleFonts.*` sueltas.
// - Un único punto de entrada permite cambiar la voz tipográfica sin tocar
//   cada pantalla otra vez.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `display` → League Spartan (OFL 1.1) vía `google_fonts`, misma carga
//   y caché que usaba Montserrat.
// - `text` → familia 'Aristotelica Pro' (comercial, Zetafonts). Flutter la usa
//   cuando está registrada en `pubspec.yaml` (bloque `fonts:` con los .ttf en
//   `assets/fonts/aristotelica-pro/`). Mientras no lo esté, el motor cae en
//   `fontFamilyFallback`: Plus Jakarta Sans con el MISMO peso pedido, así
//   que la jerarquía visual no se rompe.
// - Las firmas replican las de `GoogleFonts.*` para que el reemplazo sea
//   directo (`GoogleFonts.montserrat(` → `BaqueanoFonts.display(`).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES):
// - `BaqueanoFonts.display(...)`: títulos, cifras grandes, botones de marca.
// - `BaqueanoFonts.text(...)`: párrafos, etiquetas, métricas y formularios.
// ============================================================================

import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class BaqueanoFonts {
  BaqueanoFonts._();

  /// Familia oficial de títulos.
  static const String displayFamily = 'League Spartan';

  /// Familia oficial de texto (debe coincidir con `family:` en pubspec.yaml).
  static const String textFamily = 'Aristotelica Pro';

  /// League Spartan — títulos y elementos de impacto.
  static TextStyle display({
    TextStyle? textStyle,
    Color? color,
    Color? backgroundColor,
    double? fontSize,
    FontWeight? fontWeight,
    FontStyle? fontStyle,
    double? letterSpacing,
    double? wordSpacing,
    TextBaseline? textBaseline,
    double? height,
    Locale? locale,
    Paint? foreground,
    Paint? background,
    List<ui.Shadow>? shadows,
    List<ui.FontFeature>? fontFeatures,
    TextDecoration? decoration,
    Color? decorationColor,
    TextDecorationStyle? decorationStyle,
    double? decorationThickness,
  }) {
    return GoogleFonts.leagueSpartan(
      textStyle: textStyle,
      color: color,
      backgroundColor: backgroundColor,
      fontSize: fontSize,
      fontWeight: fontWeight,
      fontStyle: fontStyle,
      letterSpacing: letterSpacing,
      wordSpacing: wordSpacing,
      textBaseline: textBaseline,
      height: height,
      locale: locale,
      foreground: foreground,
      background: background,
      shadows: shadows,
      fontFeatures: fontFeatures,
      decoration: decoration,
      decorationColor: decorationColor,
      decorationStyle: decorationStyle,
      decorationThickness: decorationThickness,
    );
  }

  /// Aristotelica Pro — texto de lectura, etiquetas y datos.
  /// Respaldo: Plus Jakarta Sans con el mismo peso y estilo.
  static TextStyle text({
    TextStyle? textStyle,
    Color? color,
    Color? backgroundColor,
    double? fontSize,
    FontWeight? fontWeight,
    FontStyle? fontStyle,
    double? letterSpacing,
    double? wordSpacing,
    TextBaseline? textBaseline,
    double? height,
    Locale? locale,
    Paint? foreground,
    Paint? background,
    List<ui.Shadow>? shadows,
    List<ui.FontFeature>? fontFeatures,
    TextDecoration? decoration,
    Color? decorationColor,
    TextDecorationStyle? decorationStyle,
    double? decorationThickness,
  }) {
    final fallback = GoogleFonts.plusJakartaSans(
      textStyle: textStyle,
      color: color,
      backgroundColor: backgroundColor,
      fontSize: fontSize,
      fontWeight: fontWeight,
      fontStyle: fontStyle,
      letterSpacing: letterSpacing,
      wordSpacing: wordSpacing,
      textBaseline: textBaseline,
      height: height,
      locale: locale,
      foreground: foreground,
      background: background,
      shadows: shadows,
      fontFeatures: fontFeatures,
      decoration: decoration,
      decorationColor: decorationColor,
      decorationStyle: decorationStyle,
      decorationThickness: decorationThickness,
    );
    return fallback.copyWith(
      fontFamily: textFamily,
      fontFamilyFallback: <String>[
        if (fallback.fontFamily != null) fallback.fontFamily!,
        ...?fallback.fontFamilyFallback,
      ],
    );
  }
}
