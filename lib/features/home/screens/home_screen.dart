import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/badge_chip.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';
import '../widgets/baqueano_standard.dart';
import '../widgets/business_showcase.dart';
import '../widgets/destination_card.dart';
import '../widgets/explorer_testimonials.dart';
import '../widgets/hero_section.dart';
import '../widgets/impact_counter_strip.dart';
import '../widgets/marquee_ticker.dart';
import '../widgets/quick_categories_carousel.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _selectedDepartment = 'Todos';

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    final filteredDestinations = _selectedDepartment == 'Todos'
        ? CatalogData.destinations
        : CatalogData.destinations.where((d) => d.department.toLowerCase() == _selectedDepartment.toLowerCase()).toList();

    return ResponsiveScaffold(
      currentIndex: 0,
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Hero Section
            const HeroSection(),

            // 2. Impact Counter Strip
            const ImpactCounterStrip(),

            // 3. Marquee Ticker
            const MarqueeTicker(),

            const SizedBox(height: 24),

            // 4. Quick Categories Carousel
            Padding(
              padding: EdgeInsets.symmetric(horizontal: isDesktop ? 48.0 : 20.0),
              child: const SectionHeader(
                tag: 'CATEGORÍAS DE EXPLORACIÓN',
                title: 'Nicaragua en Todos sus Sentidos',
                subtitle: 'Acceso directo a cultura viva, gastronomía ancestral, música, hospedaje sustentable y expediciones.',
              ),
            ),
            const SizedBox(height: 8),
            const QuickCategoriesCarousel(),

            const SizedBox(height: 32),

            // 5. Popular Destinations & Department Filters
            Padding(
              padding: EdgeInsets.symmetric(horizontal: isDesktop ? 48.0 : 20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SectionHeader(
                    tag: 'EXPEDICIONES VERIFICADAS',
                    title: 'Top Destinos Populares',
                    subtitle: 'Selección curada por baqueanos nativos con cálculo exacto de presupuesto y reserva directa.',
                  ),
                  const SizedBox(height: 8),

                  // Department Filter Chips
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    physics: const BouncingScrollPhysics(),
                    child: Row(
                      children: CatalogData.departments.map((dept) {
                        final isSelected = _selectedDepartment == dept;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: BadgeChip(
                            label: dept,
                            isSelected: isSelected,
                            onTap: () => setState(() => _selectedDepartment = dept),
                          ),
                        );
                      }).toList(),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Destination Grid
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
                      maxCrossAxisExtent: isDesktop ? 380 : 500,
                      mainAxisExtent: 470,
                      crossAxisSpacing: 18,
                      mainAxisSpacing: 18,
                    ),
                    itemCount: filteredDestinations.length,
                    itemBuilder: (context, index) {
                      final dest = filteredDestinations[index];
                      return DestinationCard(
                        destination: dest,
                        onFavoriteToggled: () => setState(() {}),
                      );
                    },
                  ),

                  const SizedBox(height: 40),

                  // 6. Business Showcase
                  const BusinessShowcase(),

                  const SizedBox(height: 40),

                  // 7. Explorer Testimonials
                  const ExplorerTestimonials(),

                  const SizedBox(height: 40),

                  // 8. The Baqueano Standard
                  const BaqueanoStandard(),

                  const SizedBox(height: 60),

                  // Footer Strip
                  _buildFooter(context, isDesktop),
                  const SizedBox(height: 80),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFooter(BuildContext context, bool isDesktop) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: AppColors.borderLight)),
      ),
      child: Column(
        children: [
          Wrap(
            alignment: WrapAlignment.center,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              const Text('🇳🇮', style: TextStyle(fontSize: 22)),
              const SizedBox(width: 8),
              Text(
                'BAQUEANO · Plataforma Oficial de Ecoturismo de Nicaragua',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textMuted,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '© 2026 Baqueano Ecosystem. Todos los derechos reservados. Turismo comunitario transparente y sin intermediarios.',
            style: GoogleFonts.inter(
              fontSize: 11,
              color: AppColors.textMuted.withValues(alpha: 0.7),
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
