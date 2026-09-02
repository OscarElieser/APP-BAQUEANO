// ============================================================================
// 🏠 PANTALLA PRINCIPAL & FEED INTERACTIVO DE EXPERIENCIAS (HOME_SCREEN.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Servir como el portal neurálgico donde los exploradores descubren las maravillas
//   ocultas de Nicaragua, filtran destinos por departamento (Rivas, Matagalpa, León, etc.),
//   exploran las categorías culturales y reservan directamente con baqueanos campesinos.
// - Ofrecer una experiencia fluida, continua y de alto impacto visual sin recargas.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Estado mutable `_HomeScreenState` con variable `_selectedDepartment` para filtrado reactivo.
// - Orquesta de widgets modulares: HeroSection, ImpactCounterStrip, MarqueeTicker,
//   QuickCategoriesCarousel, DestinationCard en Grid adaptativo, BusinessShowcase,
//   ExplorerTestimonials y BaqueanoStandard.
// - Integración con `ResponsiveScaffold` para adaptación fluida móvil nativa.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & VISTA EXPUESTA):
// - `HomeScreen`: Vista principal mapeada en la ruta `/home`.
// ============================================================================

import 'package:flutter/material.dart';
import '../../../core/data/catalog_data.dart';
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
  /// Filtro activo por departamento geográfico ('Todos', 'Matagalpa', 'Madriz', etc.)
  String _selectedDepartment = 'Todos';

  @override
  Widget build(BuildContext context) {
    // Detección del ancho del dispositivo para layout adaptativo
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    // Filtrado de la lista en memoria según el departamento seleccionado
    final filteredDestinations = _selectedDepartment == 'Todos'
        ? CatalogData.destinations
        : CatalogData.destinations
            .where((d) => d.department.toLowerCase() == _selectedDepartment.toLowerCase())
            .toList();

    return ResponsiveScaffold(
      currentIndex: 0, // Índice 0 = Home en la barra de navegación
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ----------------------------------------------------------------
            // 1. HERO SECTION (Titular "NICARAGUA EN MODO SECRETO" + Card Cascada La Luna)
            // ----------------------------------------------------------------
            const HeroSection(),

            // ----------------------------------------------------------------
            // 2. FRANJA DE MÉTRICAS (85% Impacto Comunitario, 50+ Aliados)
            // ----------------------------------------------------------------
            const ImpactCounterStrip(),

            // ----------------------------------------------------------------
            // 3. TICKER INFINITO DE COOPERATIVAS Y ALIANZAS A 60 FPS
            // ----------------------------------------------------------------
            const MarqueeTicker(),

            const SizedBox(height: 24),

            // ----------------------------------------------------------------
            // 4. CARRUSEL HORIZONTAL DE CATEGORÍAS CULTURALES
            // ----------------------------------------------------------------
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

            // ----------------------------------------------------------------
            // 5. DESTINOS POPULARES & FILTROS POR DEPARTAMENTO
            // ----------------------------------------------------------------
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

                  // Barra horizontal de chips de filtrado por departamento
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

                  // Cuadrícula responsiva de tarjetas de destino
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

                  // ------------------------------------------------------------
                  // 6. VITRINA DE NEGOCIOS Y GUÍAS LOCALES ALIADOS
                  // ------------------------------------------------------------
                  const BusinessShowcase(),

                  const SizedBox(height: 40),

                  // ------------------------------------------------------------
                  // 7. TESTIMONIOS Y RESEÑAS VERIFICADAS DE VIAJEROS
                  // ------------------------------------------------------------
                  const ExplorerTestimonials(),

                  const SizedBox(height: 40),

                  // ------------------------------------------------------------
                  // 8. EL ESTÁNDAR BAQUEANO (4 PILARES Y CTA DE CONVERSIÓN)
                  // ------------------------------------------------------------
                  const BaqueanoStandard(),

                  const SizedBox(height: 48),
                ],
              ),
            ),

            // ----------------------------------------------------------------
            // 9. CIERRE NATIVO DEL FEED (SELLO DE MARCA & FIN DE RUTAS)
            // ----------------------------------------------------------------
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Column(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(0xFF082B35),
                      border: Border.all(
                        color: const Color(0xFFD4AF37).withValues(alpha: 0.3),
                      ),
                    ),
                    child: const Icon(
                      Icons.explore_rounded,
                      color: Color(0xFFD4AF37),
                      size: 22,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'BAQUEANO • NICARAGUA',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.5),
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.5,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Has explorado todas las rutas destacadas de hoy 🌋',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.35),
                      fontSize: 11,
                    ),
                  ),
                  const SizedBox(height: 80),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
