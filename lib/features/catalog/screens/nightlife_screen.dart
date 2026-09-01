import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';

class NightlifeScreen extends StatelessWidget {
  const NightlifeScreen({super.key});

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
              tag: 'NOCHES BOHEMIAS & CULTURALES',
              title: '🎉 Vida Nocturna Bohemia de Nicaragua',
              subtitle: 'Terrazas coloniales, bares frente al Pacífico, música en vivo y el trago nacional "El Macuá".',
            ),
            const SizedBox(height: 20),

            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
                maxCrossAxisExtent: isDesktop ? 450 : 550,
                mainAxisExtent: 440,
                crossAxisSpacing: 18,
                mainAxisSpacing: 18,
              ),
              itemCount: CatalogData.nightlifeSpots.length,
              itemBuilder: (context, index) {
                final spot = CatalogData.nightlifeSpots[index];
                return GlassContainer(
                  padding: EdgeInsets.zero,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.borderLight),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ClipRRect(
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                        child: Image.network(
                          spot.imageUrl,
                          height: 180,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            height: 180,
                            color: AppColors.primaryLight,
                            child: const Center(child: Icon(Icons.nightlife, size: 48, color: AppColors.gold)),
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  spot.city.toUpperCase(),
                                  style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.terracottaLight),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryDark,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    spot.schedule,
                                    style: GoogleFonts.inter(fontSize: 10, color: AppColors.goldLight),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              spot.name,
                              style: GoogleFonts.montserrat(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textLight),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              spot.area,
                              style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              spot.description,
                              style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted, height: 1.35),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 10),
                            Text(
                              'TRAGOS & CÓCTELES RECOMENDADOS:',
                              style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.gold),
                            ),
                            const SizedBox(height: 6),
                            Wrap(
                              spacing: 6,
                              runSpacing: 4,
                              children: spot.recommendedDrinks.map((drink) {
                                return Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryDark,
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: AppColors.borderGold.withOpacity(0.5)),
                                  ),
                                  child: Text('🍹 $drink', style: GoogleFonts.inter(fontSize: 10, color: AppColors.textLight)),
                                );
                              }).toList(),
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
