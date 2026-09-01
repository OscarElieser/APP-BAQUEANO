import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_colors.dart';
import '../theme/app_gradients.dart';

enum BaqueanoLogoSize {
  small,
  medium,
  large,
  iconOnly,
}

class BaqueanoLogo extends StatelessWidget {
  final BaqueanoLogoSize size;
  final bool showSubtitle;
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

    if (onTap != null) {
      return InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: content,
      );
    }

    return content;
  }

  // Small Logo for Mobile AppBar and Compact Headers
  Widget _buildSmallLogo() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Image.asset(
          'assets/images/logo_baqueano.png',
          height: 24,
          fit: BoxFit.contain,
          errorBuilder: (_, __, ___) => _buildFallbackTypography(16, 2.0),
        ),
        const SizedBox(width: 6),
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

  // Medium Logo for Desktop Navbar and Headers
  Widget _buildMediumLogo() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Image.asset(
          'assets/images/logo_baqueano.png',
          height: 32,
          fit: BoxFit.contain,
          errorBuilder: (_, __, ___) => _buildFallbackTypography(20, 2.5),
        ),
        const SizedBox(width: 8),
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

  // Large Hero / Splash Brand Logo
  Widget _buildLargeLogo() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Image.asset(
          'assets/images/logo_baqueano.png',
          height: 54,
          fit: BoxFit.contain,
          errorBuilder: (_, __, ___) => _buildFallbackTypography(32, 4.0),
        ),
        const SizedBox(height: 8),
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

  // Official Icon Badge: Volcanic Peak with Golden Sun & Ring
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
            Icon(
              Icons.landscape_rounded,
              size: size * 0.65,
              color: Colors.white,
            ),
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
