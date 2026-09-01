// ============================================================================
// 🧭 COMPONENTE DE IDENTIDAD VISUAL & LOGOTIPO OFICIAL (BAQUEANO_LOGO.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proporcionar una representación consistente, responsiva y adaptable del logotipo
//   oficial de la marca "BAQUEANO", asegurando presencia gráfica impecable tanto en
//   pantallas pequeñas (móviles) como en barras de navegación de escritorio y pantallas Splash.
// - Incluir un mecanismo de contingencia (fallback tipográfico) en caso de fallo de red
//   o retardo en la carga de assets locales, garantizando que la marca nunca desaparezca.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Enumeración `BaqueanoLogoSize` para variantes: `small` (AppBar móvil), `medium` (Navbar desktop),
//   `large` (Hero/Splash) e `iconOnly` (Emblema circular con volcán y sol dorado).
// - Carga `assets/images/logo_baqueano.png` con `Image.asset` y renderiza tipografía vectorial
//   con `GoogleFonts.montserrat` y badges dorados con `AppGradients.gold`.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `BaqueanoLogo`: Widget reutilizable con callback interactivo opcional `onTap`.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_colors.dart';
import '../theme/app_gradients.dart';

/// Tamaños estandarizados del logotipo según la ubicación en la interfaz.
enum BaqueanoLogoSize {
  /// Tamaño compacto para AppBar móvil (altura ~24px).
  small,

  /// Tamaño mediano para barras de navegación de escritorio y tablet (altura ~32px).
  medium,

  /// Tamaño grande monumental para SplashScreen y encabezados institucionales (altura ~54px).
  large,

  /// Variante de sólo isotipo/emblema circular para botones flotantes y avatares.
  iconOnly,
}

class BaqueanoLogo extends StatelessWidget {
  /// Tamaño seleccionado del logotipo.
  final BaqueanoLogoSize size;

  /// Si es true, muestra el subtítulo institucional "PLATAFORMA OFICIAL DE ECOTURISMO".
  final bool showSubtitle;

  /// Acción a ejecutar al tocar el logotipo (generalmente redirigir a `/home`).
  final VoidCallback? onTap;

  const BaqueanoLogo({
    super.key,
    this.size = BaqueanoLogoSize.medium,
    this.showSubtitle = true,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    Widget content;

    // Selección de la variante visual según el tamaño solicitado
    switch (size) {
      case BaqueanoLogoSize.small:
        content = _buildSmallLogo();
        break;
      case BaqueanoLogoSize.medium:
        content = _buildMediumLogo();
        break;
      case BaqueanoLogoSize.large:
        content = _buildLargeLogo();
        break;
      case BaqueanoLogoSize.iconOnly:
        content = _buildIconBadge(size: 40);
        break;
    }

    // Si se proporciona un callback onTap, se envuelve en un InkWell para feedback táctil
    if (onTap != null) {
      return InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: content,
      );
    }

    return content;
  }

  // --------------------------------------------------------------------------
  // 📱 LOGO PEQUEÑO PARA APPBAR MÓVIL
  // --------------------------------------------------------------------------
  Widget _buildSmallLogo() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Imagen del logo oficial
        Image.asset(
          'assets/images/logo_baqueano.png',
          height: 24,
          fit: BoxFit.contain,
          errorBuilder: (_, __, ___) => _buildFallbackTypography(16, 2.0),
        ),
        const SizedBox(width: 6),
        // Badge dorado de país 'NI'
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
          decoration: BoxDecoration(
            gradient: AppGradients.gold,
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(
            'NI',
            style: GoogleFonts.spaceGrotesk(
              fontSize: 8,
              fontWeight: FontWeight.w900,
              color: AppColors.textDark,
            ),
          ),
        ),
      ],
    );
  }

  // --------------------------------------------------------------------------
  // 💻 LOGO MEDIANO PARA NAVBAR DE ESCRITORIO
  // --------------------------------------------------------------------------
  Widget _buildMediumLogo() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Imagen del logo oficial
        Image.asset(
          'assets/images/logo_baqueano.png',
          height: 32,
          fit: BoxFit.contain,
          errorBuilder: (_, __, ___) => _buildFallbackTypography(20, 2.5),
        ),
        const SizedBox(width: 8),
        // Badge dorado completo 'NICARAGUA'
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(
            gradient: AppGradients.gold,
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(
            'NICARAGUA',
            style: GoogleFonts.spaceGrotesk(
              fontSize: 9,
              fontWeight: FontWeight.w900,
              color: AppColors.textDark,
            ),
          ),
        ),
      ],
    );
  }

  // --------------------------------------------------------------------------
  // 🚀 LOGO GRANDE PARA SPLASH SCREEN & HERO
  // --------------------------------------------------------------------------
  Widget _buildLargeLogo() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Imagen del logo en alta resolución
        Image.asset(
          'assets/images/logo_baqueano.png',
          height: 54,
          fit: BoxFit.contain,
          errorBuilder: (_, __, ___) => _buildFallbackTypography(32, 4.0),
        ),
        const SizedBox(height: 8),
        // Lema y bandera nacional
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('🇳🇮', style: TextStyle(fontSize: 14)),
            const SizedBox(width: 6),
            Text(
              'PLATAFORMA OFICIAL DE ECOTURISMO',
              style: GoogleFonts.spaceGrotesk(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                letterSpacing: 2.0,
                color: AppColors.goldLight,
              ),
            ),
          ],
        ),
      ],
    );
  }

  // --------------------------------------------------------------------------
  // 🛡️ CONTINGENCIA TIPOGRÁFICA (Fallback)
  // --------------------------------------------------------------------------
  Widget _buildFallbackTypography(double fontSize, double letterSpacing) {
    return Text(
      'BAQUEANO',
      style: GoogleFonts.montserrat(
        fontSize: fontSize,
        fontWeight: FontWeight.w900,
        letterSpacing: letterSpacing,
        color: Colors.white,
      ),
    );
  }

  // --------------------------------------------------------------------------
  // 🌋 EMBLEMA CIRCULAR OFICIAL (Volcán & Sol Dorado)
  // --------------------------------------------------------------------------
  Widget _buildIconBadge({required double size}) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: AppGradients.sunsetTerracotta,
        border: Border.all(color: AppColors.gold, width: size > 50 ? 2.5 : 1.5),
        boxShadow: [
          BoxShadow(
            color: AppColors.terracotta.withValues(alpha: 0.4),
            blurRadius: size * 0.35,
            offset: const Offset(0, 3),
          ),
          BoxShadow(
            color: AppColors.gold.withValues(alpha: 0.25),
            blurRadius: size * 0.2,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Center(
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Silueta del volcán
            Icon(
              Icons.landscape_rounded,
              size: size * 0.65,
              color: Colors.white,
            ),
            // Sol naciente dorado
            Positioned(
              top: size * 0.16,
              right: size * 0.18,
              child: Container(
                width: size * 0.22,
                height: size * 0.22,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: AppGradients.gold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
