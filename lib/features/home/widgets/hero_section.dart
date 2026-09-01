import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/baqueano_button.dart';
import '../../../core/widgets/glass_container.dart';
import '../../checkout/widgets/checkout_modal.dart';

class HeroSection extends StatelessWidget {
  const HeroSection({super.key});

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;
    final featuredDestination = CatalogData.destinations.first;

    return Stack(
      children: [
        // Background Glow Effects
        Positioned(
          top: -100,
          right: -80,
          child: Container(
            width: 350,
            height: 350,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.terracotta.withValues(alpha: 0.18),
            ),
          ),
        ),
        Positioned(
          top: 150,
          left: -100,
          child: Container(
            width: 300,
            height: 300,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.craterTeal.withValues(alpha: 0.12),
            ),
          ),
        ),

        // Main Hero Content
        Padding(
          padding: EdgeInsets.symmetric(
            horizontal: isDesktop ? 48.0 : 20.0,
            vertical: isDesktop ? 40.0 : 24.0,
          ),
          child: isDesktop
              ? Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // Left Text Column
                    Expanded(
                      flex: 6,
                      child: _buildHeroTextContent(context, isDesktop),
                    ),
                    const SizedBox(width: 48),
                    // Right Featured Floating Card
                    Expanded(
                      flex: 4,
                      child: _buildFeaturedCard(context, featuredDestination),
                    ),
                  ],
                )
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildHeroTextContent(context, isDesktop),
                    const SizedBox(height: 28),
                    _buildFeaturedCard(context, featuredDestination),
                  ],
                ),
        ),
      ],
    );
  }

  Widget _buildHeroTextContent(BuildContext context, bool isDesktop) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Tag Pill
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
          decoration: BoxDecoration(
            color: AppColors.terracotta.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppColors.terracottaLight.withValues(alpha: 0.5)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('🇳🇮', style: TextStyle(fontSize: 14)),
              const SizedBox(width: 8),
              Text(
                'ECOTURISMO COMUNITARIO AUTÉNTICO',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: AppColors.goldLight,
                  letterSpacing: 1.2,
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 18),

        // Hero Headline with Gradient
        ShaderMask(
          shaderCallback: (bounds) => AppGradients.sunsetTerracotta.createShader(
            Rect.fromLTWH(0, 0, bounds.width, bounds.height),
          ),
          child: Text(
            AppConstants.appSlogan,
            style: GoogleFonts.montserrat(
              fontSize: isDesktop ? 48 : 34,
              fontWeight: FontWeight.w900,
              color: Colors.white,
              letterSpacing: -1.0,
              height: 1.15,
            ),
          ),
        ),

        const SizedBox(height: 14),

        // Subtitle
        Text(
          AppConstants.appSubtitle,
          style: GoogleFonts.inter(
            fontSize: isDesktop ? 16 : 14,
            fontWeight: FontWeight.w400,
            color: AppColors.textLight.withValues(alpha: 0.9),
            height: 1.6,
          ),
        ),

        const SizedBox(height: 26),

        // CTA Buttons
        Wrap(
          spacing: 14,
          runSpacing: 12,
          children: [
            BaqueanoButton(
              text: 'DISEÑAR MI RUTA',
              icon: const Icon(Icons.explore, size: 18, color: Colors.white),
              variant: BaqueanoButtonVariant.primary,
              height: 52,
              onPressed: () => context.go('/descubrir'),
            ),
            BaqueanoButton(
              text: 'PROBAR BAQUEANO AI',
              icon: const Icon(Icons.smart_toy_outlined, size: 18, color: AppColors.textDark),
              variant: BaqueanoButtonVariant.gold,
              height: 52,
              onPressed: () => context.go('/ai'),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildFeaturedCard(BuildContext context, dynamic destination) {
    return GlassContainer(
      padding: EdgeInsets.zero,
      borderRadius: BorderRadius.circular(24),
      border: Border.all(color: AppColors.borderGold, width: 1.5),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image with Badges
          Stack(
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                child: Image.network(
                  destination.imageUrl,
                  height: 200,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    height: 200,
                    color: AppColors.primaryLight,
                    child: const Center(child: Icon(Icons.landscape, size: 48, color: AppColors.gold)),
                  ),
                ),
              ),
              Positioned(
                top: 12,
                left: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.bgDark.withValues(alpha: 0.85),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.gold),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.star, color: AppColors.gold, size: 14),
                      const SizedBox(width: 4),
                      Text(
                        '${destination.rating} (128)',
                        style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white),
                      ),
                    ],
                  ),
                ),
              ),
              Positioned(
                top: 12,
                right: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    gradient: AppGradients.sunsetTerracotta,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    'DESTACADO',
                    style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.white),
                  ),
                ),
              ),
            ],
          ),

          // Card Body
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      destination.department.toUpperCase(),
                      style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.terracottaLight),
                    ),
                    Text(
                      '${destination.duration} · ${destination.distance}',
                      style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  destination.title,
                  style: GoogleFonts.montserrat(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textLight,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  destination.description,
                  style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted, height: 1.4),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Desde', style: GoogleFonts.inter(fontSize: 10, color: AppColors.textMuted)),
                          Wrap(
                            crossAxisAlignment: WrapCrossAlignment.center,
                            children: [
                              Text(
                                '\$${destination.priceUsd.toInt()} USD',
                                style: GoogleFonts.montserrat(fontSize: 17, fontWeight: FontWeight.w900, color: AppColors.gold),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '/ C\$${destination.priceNio.toInt()}',
                                style: GoogleFonts.spaceGrotesk(fontSize: 12, color: AppColors.textMuted),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    BaqueanoButton(
                      text: 'Reservar',
                      variant: BaqueanoButtonVariant.primary,
                      height: 40,
                      onPressed: () => CheckoutModal.show(context, destination),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
