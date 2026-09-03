// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PANTALLA PRINCIPAL: HISTORIA DE MI PAÍS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Servir como el centro digital de conocimiento cultural, histórico, literario
//   y geográfico de Nicaragua dentro de BAQUEANO.
// - Conectar la identidad patria con el motor turístico para que el explorador
//   comprenda la trascendencia de los lugares que visita.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Orquestador reactivo con Riverpod (`countryHistoryProvider`).
// - Integración de Hero de alto impacto, buscador semántico, filtros temáticos
//   y widgets modulares especializados.
// - Diseño 100% responsivo con `ResponsiveScaffold` y desplazamiento fluido a 120 FPS.
//
// 📦 3. QUÉ (WHAT / WIDGET EXPUESTO):
// - `CountryHistoryScreen`: Pantalla oficial de historia e identidad de Nicaragua.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';
import '../providers/country_history_provider.dart';
import '../widgets/country_gastronomy_section.dart';
import '../widgets/country_quick_stats_grid.dart';
import '../widgets/country_search_filter_bar.dart';
import '../widgets/departments_explorer_grid.dart';
import '../widgets/historical_figures_curiosities_section.dart';
import '../widgets/history_hero_section.dart';
import '../widgets/history_timeline_widget.dart';
import '../widgets/symbols_peoples_nature_section.dart';
import '../widgets/voices_and_literature_section.dart';

class CountryHistoryScreen extends ConsumerStatefulWidget {
  final String countryId;

  const CountryHistoryScreen({super.key, this.countryId = 'nicaragua'});

  @override
  ConsumerState<CountryHistoryScreen> createState() => _CountryHistoryScreenState();
}

class _CountryHistoryScreenState extends ConsumerState<CountryHistoryScreen> {
  final ScrollController _scrollController = ScrollController();
  final GlobalKey _contentKey = GlobalKey();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(countryHistoryProvider.notifier).setCountry(widget.countryId);
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToContent() {
    final context = _contentKey.currentContext;
    if (context != null) {
      Scrollable.ensureVisible(
        context,
        duration: const Duration(milliseconds: 600),
        curve: Curves.easeInOut,
      );
    }
  }

  void _shareCountry() {
    HapticFeedback.lightImpact();
    Clipboard.setData(const ClipboardData(text: '¡Descubre la historia y riqueza cultural de Nicaragua en BAQUEANO! https://baqueano.app/historia-mi-pais'));
    CustomToast.success(context, 'Enlace copiado al portapapeles para compartir');
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(countryHistoryProvider);
    final profile = state.profile;
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    return ResponsiveScaffold(
      currentIndex: 0,
      body: SingleChildScrollView(
        controller: _scrollController,
        physics: const BouncingScrollPhysics(),
        child: Column(
          children: [
            // HERO PRINCIPAL PANORÁMICO
            HistoryHeroSection(
              profile: profile,
              onExploreTap: _scrollToContent,
            ),

            // CONTENIDO PRINCIPAL
            Container(
              key: _contentKey,
              padding: EdgeInsets.symmetric(
                horizontal: isDesktop ? 48.0 : 20.0,
                vertical: 28.0,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Botón de Compartir y Tag Superior
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.gold.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.borderGold.withValues(alpha: 0.5)),
                        ),
                        child: Text(
                          '📖 PATRIMONIO, IDENTIDAD & CULTURA',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 10.5,
                            fontWeight: FontWeight.w800,
                            color: AppColors.gold,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.share_rounded, color: AppColors.goldLight, size: 20),
                        tooltip: 'Compartir Historia de Nicaragua',
                        onPressed: _shareCountry,
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // INTRODUCCIÓN: CONOCE NICARAGUA
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.primaryDark.withValues(alpha: 0.75),
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Text('🇳🇮', style: TextStyle(fontSize: 24)),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                'Conoce Nicaragua: Corazón de América Central',
                                style: GoogleFonts.montserrat(
                                  fontSize: 17,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text(
                          profile.overviewText,
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: AppColors.textLight.withValues(alpha: 0.9),
                            height: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // ESTADÍSTICAS RÁPIDAS
                  CountryQuickStatsGrid(stats: profile.stats),

                  const SizedBox(height: 28),

                  // BUSCADOR Y FILTROS TEMÁTICOS
                  CountrySearchFilterBar(
                    activeCategory: state.selectedCategory,
                    onSearchChanged: (q) => ref.read(countryHistoryProvider.notifier).setSearchQuery(q),
                    onCategorySelected: (cat) => ref.read(countryHistoryProvider.notifier).setCategory(cat),
                  ),

                  const SizedBox(height: 36),

                  // SECCIONES SEGÚN EL FILTRO ACTIVO
                  _buildCategorizedContent(state, isDesktop),

                  const SizedBox(height: 80),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategorizedContent(CountryHistoryNotifier state, bool isDesktop) {
    final cat = state.selectedCategory;

    if (cat == 'HISTORIA') {
      return Column(
        children: [
          const SectionHeader(
            tag: 'CRONOLOGÍA PATRIA',
            title: '📜 Historia de Nicaragua',
            subtitle: 'Recorrido interactivo a través de los 7 grandes periodos que forjaron la identidad nacional.',
            isCentered: true,
          ),
          const SizedBox(height: 16),
          HistoryTimelineWidget(periods: state.periods),
        ],
      );
    }

    if (cat == 'DEPARTAMENTOS') {
      return Column(
        children: [
          const SectionHeader(
            tag: 'GEOGRAFÍA VIVA',
            title: '🗺️ Explora los 17 Territorios',
            subtitle: '15 departamentos y 2 regiones autónomas, cada uno con su propia alma, cultura y destinos.',
            isCentered: true,
          ),
          const SizedBox(height: 16),
          DepartmentsExplorerGrid(departments: state.filteredDepartments),
        ],
      );
    }

    if (cat == 'GASTRONOMÍA') {
      return Column(
        children: [
          const SectionHeader(
            tag: 'HERENCIA DEL MAÍZ',
            title: '🍽️ Sabores de Nicaragua',
            subtitle: 'Platillos ancestrales, desayunos típicos, caldos criollos y bebidas de maíz y cacao.',
            isCentered: true,
          ),
          const SizedBox(height: 16),
          CountryGastronomySection(dishes: state.filteredGastronomy),
        ],
      );
    }

    if (cat == 'LITERATURA') {
      return Column(
        children: [
          const SectionHeader(
            tag: 'TIERRA DE POETAS',
            title: '✍️ Grandes Voces & Literatura',
            subtitle: 'Rubén Darío y las plumas inmortales que transformaron las letras hispanoamericanas.',
            isCentered: true,
          ),
          const SizedBox(height: 16),
          VoicesAndLiteratureSection(writers: state.filteredWriters),
        ],
      );
    }

    if (cat == 'SÍMBOLOS') {
      return Column(
        children: [
          const SectionHeader(
            tag: 'IDENTIDAD NACIONAL',
            title: '🇳🇮 Símbolos de la Patria',
            subtitle: 'Bandera, escudo, himno solemne, flor de sacuanjoche, madroño y guardabarranco.',
            isCentered: true,
          ),
          const SizedBox(height: 16),
          SymbolsPeoplesNatureSection(
            symbols: state.symbols,
            indigenousPeoples: state.indigenousPeoples,
            natureWonders: state.filteredNatureWonders,
          ),
        ],
      );
    }

    if (cat == 'NATURALEZA') {
      return Column(
        children: [
          const SectionHeader(
            tag: 'BIODIVERSIDAD VOLCÁNICA',
            title: '🌋 Maravillas Naturales',
            subtitle: 'Volcanes activos, cañones geológicos, reservas de biosfera y lagos de agua dulce.',
            isCentered: true,
          ),
          const SizedBox(height: 16),
          SymbolsPeoplesNatureSection(
            symbols: const [],
            indigenousPeoples: const [],
            natureWonders: state.filteredNatureWonders,
          ),
        ],
      );
    }

    if (cat == 'PERSONAJES') {
      return Column(
        children: [
          const SectionHeader(
            tag: 'MEMORIA Y SOBERANÍA',
            title: '👤 Personajes & Curiosidades',
            subtitle: 'Héroes patrios, próceres de la soberanía nacional y datos insólitos verificados.',
            isCentered: true,
          ),
          const SizedBox(height: 16),
          HistoricalFiguresCuriositiesSection(
            figures: state.filteredHistoricalFigures,
            curiosities: state.curiosities,
          ),
        ],
      );
    }

    // POR DEFECTO ('TODOS'): Renderizado completo ordenado con cabeceras
    return Column(
      children: [
        // 1. HISTORIA
        const SectionHeader(
          tag: 'CRONOLOGÍA PATRIA',
          title: '📜 Historia de Nicaragua',
          subtitle: 'Recorrido interactivo a través de los 7 grandes periodos que forjaron la identidad nacional.',
          isCentered: true,
        ),
        const SizedBox(height: 16),
        HistoryTimelineWidget(periods: state.periods),

        const SizedBox(height: 48),

        // 2. TERRITORIOS
        const SectionHeader(
          tag: 'GEOGRAFÍA VIVA',
          title: '🗺️ Explora los 17 Territorios',
          subtitle: '15 departamentos y 2 regiones autónomas, cada uno con su propia alma, cultura y destinos.',
          isCentered: true,
        ),
        const SizedBox(height: 16),
        DepartmentsExplorerGrid(departments: state.filteredDepartments),

        const SizedBox(height: 48),

        // 3. GASTRONOMÍA
        const SectionHeader(
          tag: 'HERENCIA DEL MAÍZ',
          title: '🍽️ Sabores de Nicaragua',
          subtitle: 'Platillos ancestrales, desayunos típicos, caldos criollos y bebidas de maíz y cacao.',
          isCentered: true,
        ),
        const SizedBox(height: 16),
        CountryGastronomySection(dishes: state.filteredGastronomy),

        const SizedBox(height: 48),

        // 4. LITERATURA
        const SectionHeader(
          tag: 'TIERRA DE POETAS',
          title: '✍️ Grandes Voces & Literatura',
          subtitle: 'Rubén Darío y las plumas inmortales que transformaron las letras hispanoamericanas.',
          isCentered: true,
        ),
        const SizedBox(height: 16),
        VoicesAndLiteratureSection(writers: state.filteredWriters),

        const SizedBox(height: 48),

        // 5. SÍMBOLOS, PUEBLOS & NATURALEZA
        const SectionHeader(
          tag: 'PATRIA Y GEOGRAFÍA',
          title: '🇳🇮 Símbolos, Pueblos & Naturaleza',
          subtitle: 'La esencia viva de Nicaragua: emblemas patrios, raíces indígenas y paisajes volcánicos.',
          isCentered: true,
        ),
        const SizedBox(height: 16),
        SymbolsPeoplesNatureSection(
          symbols: state.symbols,
          indigenousPeoples: state.indigenousPeoples,
          natureWonders: state.filteredNatureWonders,
        ),

        const SizedBox(height: 48),

        // 6. PERSONAJES & CURIOSIDADES
        const SectionHeader(
          tag: 'MEMORIA Y ASOMBRO',
          title: '👤 Personajes & Curiosidades',
          subtitle: 'Héroes patrios, próceres de la soberanía nacional y datos insólitos verificados.',
          isCentered: true,
        ),
        const SizedBox(height: 16),
        HistoricalFiguresCuriositiesSection(
          figures: state.filteredHistoricalFigures,
          curiosities: state.curiosities,
        ),

        const SizedBox(height: 56),

        // 7. CONEXIÓN TERRITORIAL: DEL CONOCIMIENTO AL VIAJE RESPONSABLE
        _buildTerritorialConnectionCard(context, isDesktop),
      ],
    );
  }

  Widget _buildTerritorialConnectionCard(BuildContext context, bool isDesktop) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(isDesktop ? 32 : 20),
      decoration: BoxDecoration(
        color: AppColors.primaryLight.withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.gold.withValues(alpha: 0.4)),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.primaryDark.withValues(alpha: 0.95),
            AppColors.primaryLight.withValues(alpha: 0.45),
          ],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.terracotta.withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.terracotta),
                ),
                child: const Icon(Icons.explore_rounded, color: AppColors.goldLight, size: 24),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'ECOSISTEMA BAQUEANO',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: AppColors.goldLight,
                        letterSpacing: 1.2,
                      ),
                    ),
                    Text(
                      'Conecta la Memoria con el Territorio',
                      style: GoogleFonts.montserrat(
                        fontSize: isDesktop ? 20 : 16,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            'Ahora que conoces las raíces, héroes y geografía de Nicaragua, conviértete en un Explorador Responsable. Recorre senderos alternativos, contacta baqueanos campesinos sin intermediarios y degusta sabores auténticos en comedores locales.',
            style: GoogleFonts.inter(
              fontSize: 13,
              color: AppColors.textLight.withValues(alpha: 0.9),
              height: 1.5,
            ),
          ),
          const SizedBox(height: 22),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              _buildBridgeButton(
                context,
                icon: Icons.hiking_rounded,
                label: 'Rutas y Senderos',
                route: '/descubrir',
                isPrimary: true,
              ),
              _buildBridgeButton(
                context,
                icon: Icons.support_agent_rounded,
                label: 'Contactar Baqueano',
                route: '/mensajes',
              ),
              _buildBridgeButton(
                context,
                icon: Icons.restaurant_rounded,
                label: 'Comedores Típicos',
                route: '/gastronomia',
              ),
              _buildBridgeButton(
                context,
                icon: Icons.map_rounded,
                label: 'Mapa Satelital GPS',
                route: '/mapa',
              ),
              _buildBridgeButton(
                context,
                icon: Icons.qr_code_2_rounded,
                label: 'Pasaporte del Explorador',
                route: '/perfil',
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBridgeButton(
    BuildContext context, {
    required IconData icon,
    required String label,
    required String route,
    bool isPrimary = false,
  }) {
    if (isPrimary) {
      return ElevatedButton.icon(
        onPressed: () {
          HapticFeedback.lightImpact();
          context.go(route);
        },
        icon: Icon(icon, size: 16, color: Colors.white),
        label: Text(
          label,
          style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.terracotta,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }

    return OutlinedButton.icon(
      onPressed: () {
        HapticFeedback.lightImpact();
        context.go(route);
      },
      icon: Icon(icon, size: 16, color: AppColors.goldLight),
      label: Text(
        label,
        style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white),
      ),
      style: OutlinedButton.styleFrom(
        side: BorderSide(color: AppColors.goldLight.withValues(alpha: 0.5)),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
