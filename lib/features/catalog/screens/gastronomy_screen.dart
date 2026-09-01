import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';

class GastronomyScreen extends StatelessWidget {
  const GastronomyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    return ResponsiveScaffold(
      currentIndex: 1,
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.symmetric(
          horizontal: isDesktop ? 48.0 : 20.0,
          vertical: 24.0,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SectionHeader(
              tag: 'SABORES ANCESTRALES',
              title: '🍽️ Gastronomía Autóctona de Nicaragua',
              subtitle: 'La cocina nicaragüense: una explosión de maíz criollo, cacao, carnes cecinadas, lácteos artesanales y tradición precolombina.',
            ),
            const SizedBox(height: 16),

            // Intro Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: AppGradients.cardGlass,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.borderGold),
              ),
              child: Row(
                children: [
                  const Text('🌽', style: TextStyle(fontSize: 32)),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Text(
                      '«Somos hijos del maíz». Cada platillo refleja la fusión entre las raíces indígenas chorotegas, náhuatl y las técnicas coloniales campesinas.',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        color: AppColors.textLight.withValues(alpha: 0.9),
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            // Grid of Gastronomic Dishes
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
                maxCrossAxisExtent: isDesktop ? 420 : 500,
                mainAxisExtent: 490,
                crossAxisSpacing: 18,
                mainAxisSpacing: 18,
              ),
              itemCount: CatalogData.gastronomyDishes.length,
              itemBuilder: (context, index) {
                final dish = CatalogData.gastronomyDishes[index];
                return GlassContainer(
                  padding: EdgeInsets.zero,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.borderLight),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Dish Image
                      Stack(
                        children: [
                          ClipRRect(
                            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                            child: Image.network(
                              dish.imageUrl,
                              height: 180,
                              width: double.infinity,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(
                                height: 180,
                                color: AppColors.primaryLight,
                                child: Center(child: Text(dish.icon, style: const TextStyle(fontSize: 48))),
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
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: AppColors.gold),
                              ),
                              child: Text(
                                dish.region,
                                style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.goldLight),
                              ),
                            ),
                          ),
                        ],
                      ),

                      // Dish Details
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(dish.icon, style: const TextStyle(fontSize: 20)),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    dish.name,
                                    style: GoogleFonts.montserrat(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w800,
                                      color: AppColors.textLight,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              dish.history,
                              style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted, height: 1.4),
                              maxLines: 3,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'INGREDIENTES PRINCIPALES:',
                              style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.terracottaLight),
                            ),
                            const SizedBox(height: 6),
                            Wrap(
                              spacing: 6,
                              runSpacing: 4,
                              children: dish.ingredients.take(4).map((ing) {
                                return Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryDark,
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: AppColors.borderLight, width: 0.8),
                                  ),
                                  child: Text(
                                    ing,
                                    style: GoogleFonts.inter(fontSize: 10, color: AppColors.textLight.withValues(alpha: 0.9)),
                                  ),
                                );
                              }).toList(),
                            ),
                            const SizedBox(height: 12),
                            const Divider(color: AppColors.borderLight, height: 1),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(Icons.location_on, size: 14, color: AppColors.gold),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    dish.recommendedPlace,
                                    style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.goldLight),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }
}
