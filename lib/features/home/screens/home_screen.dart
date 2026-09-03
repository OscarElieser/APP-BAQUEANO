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
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/badge_chip.dart';
import '../../../core/widgets/baqueano_button.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';
import '../widgets/baqueano_standard.dart';
import '../widgets/business_showcase.dart';
import '../widgets/explorer_testimonials.dart';
import '../widgets/hero_section.dart';
import '../widgets/infinite_destinations_gallery.dart';
import '../widgets/interactive_allies_gallery.dart';
import '../widgets/interactive_impact_section.dart';
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
            // 1. HERO SECTION (Titular Monumental + Tarjeta 3D Cascada La Luna)
            // ----------------------------------------------------------------
            const HeroSection(),

            // ----------------------------------------------------------------
            // 2. SECCIÓN DINÁMICA DE IMPACTO SOCIAL (85% a Familias Rurales)
            // ----------------------------------------------------------------
            const InteractiveImpactSection(),

            const SizedBox(height: 12),

            // ----------------------------------------------------------------
            // 2.5 BANNER MONUMENTAL: CAMPAÑA AMBIENTAL & CUIDADO DE RECURSOS
            // ----------------------------------------------------------------
            Padding(
              padding: EdgeInsets.symmetric(horizontal: isDesktop ? 48.0 : 20.0),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      const Color(0xFF064E3B), // Verde bosque profundo
                      AppColors.primaryDark,
                      const Color(0xFF082B35),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: AppColors.jungleGreenLight, width: 1.4),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.jungleGreen.withValues(alpha: 0.25),
                      blurRadius: 18,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppColors.jungleGreen.withValues(alpha: 0.25),
                            shape: BoxShape.circle,
                            border: Border.all(color: AppColors.jungleGreenLight),
                          ),
                          child: const Text('🌿', style: TextStyle(fontSize: 24)),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'MISIÓN FUNDAMENTAL DE BAQUEANO',
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.goldLight,
                                  letterSpacing: 1.0,
                                ),
                              ),
                              Text(
                                'Campaña Ambiental & Cuidado de Nuestros Recursos',
                                style: GoogleFonts.montserrat(
                                  fontSize: 15.5,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Sensibilización activa para turistas nacionales e internacionales: protejamos los volcanes, lagunas, arrecifes, nebliselvas y fauna silvestre de Nicaragua.',
                      style: GoogleFonts.inter(
                        fontSize: 12.5,
                        color: Colors.white.withValues(alpha: 0.85),
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 14),
                    BaqueanoButton(
                      text: 'CONOCER Y SUMARME AL COMPROMISO VERDE',
                      icon: const Icon(Icons.eco_rounded, size: 18),
                      variant: BaqueanoButtonVariant.primary,
                      height: 44,
                      width: double.infinity,
                      onPressed: () => context.push('/campana-ambiental'),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 12),

            // ----------------------------------------------------------------
            // 3. GALERÍA INFINITA 3D DE ALIADOS LOCALES & COOPERATIVAS (Flip Cards)
            // ----------------------------------------------------------------
            const InteractiveAlliesGallery(),

            const SizedBox(height: 16),

            // ----------------------------------------------------------------
            // 4. TICKER INFINITO DE COOPERATIVAS Y ALIANZAS A 60 FPS
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
                isCentered: true,
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
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SectionHeader(
                    tag: 'EXPEDICIONES VERIFICADAS',
                    title: 'Top Destinos Populares',
                    subtitle: 'Selección curada por baqueanos nativos con cálculo exacto de presupuesto y reserva directa.',
                    isCentered: true,
                  ),
                  const SizedBox(height: 8),

                  // Barra horizontal de chips de filtrado centrada
                  Center(
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      physics: const BouncingScrollPhysics(),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
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
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // ----------------------------------------------------------------
            // ♾️ GALERÍA DINÁMICA INFINITA CON PAUSA INTELIGENTE AL SELECCIONAR
            // ----------------------------------------------------------------
            InfiniteDestinationsGallery(destinations: filteredDestinations),

            const SizedBox(height: 36),

            // ------------------------------------------------------------
            // 6. VITRINA DINÁMICA INFINITA DE NEGOCIOS RURALES (FLUJO INVERSO)
            // ------------------------------------------------------------
            const BusinessShowcase(),

            const SizedBox(height: 36),

            // ------------------------------------------------------------
            // 7. TESTIMONIOS Y RESEÑAS DINÁMICAS INFINITAS (FLUJO HACIA ADELANTE)
            // ------------------------------------------------------------
            const ExplorerTestimonials(),

            const SizedBox(height: 36),

            // ------------------------------------------------------------
            // 8. EL ESTÁNDAR BAQUEANO: PILARES INFINITOS (FLUJO INVERSO) & CONVERSIÓN
            // ------------------------------------------------------------
            const BaqueanoStandard(),

            const SizedBox(height: 48),

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
