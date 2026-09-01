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
        _buildIconBadge(size: 34),
        const SizedBox(width: 10),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'BAQUEANO',
                  style: GoogleFonts.montserrat(
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 2.2,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(width: 4),
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
            ),
            if (showSubtitle)
              Text(
                'ECOTURISMO & RUTAS',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 8.5,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.5,
                  color: AppColors.goldLight,
                ),
              ),
          ],
        ),
      ],
    );
  }

  // Medium Logo for Desktop Navbar and Headers
  Widget _buildMediumLogo() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        _buildIconBadge(size: 44),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'BAQUEANO',
                  style: GoogleFonts.montserrat(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 3.0,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
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
            ),
            if (showSubtitle)
              Text(
                'EXPEDICIONES Y COMUNIDADES',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 9.5,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 2.0,
                  color: AppColors.goldLight,
                ),
              ),
          ],
        ),
      ],
    );
  }

  // Large Hero / Splash Brand Logo
  Widget _buildLargeLogo() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _buildIconBadge(size: 80),
        const SizedBox(height: 16),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'BAQUEANO',
              style: GoogleFonts.montserrat(
                fontSize: 32,
                fontWeight: FontWeight.w900,
                letterSpacing: 4.0,
                color: Colors.white,
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                gradient: AppGradients.gold,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'OFICIAL',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textDark,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          'PLATAFORMA NACIONAL DE ECOTURISMO',
          style: GoogleFonts.spaceGrotesk(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            letterSpacing: 2.5,
            color: AppColors.goldLight,
          ),
        ),
      ],
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
            // Volcanic silhouette
            Icon(
              Icons.landscape_rounded,
              size: size * 0.65,
              color: Colors.white,
            ),
            // Glowing golden sun rising over the peak
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
