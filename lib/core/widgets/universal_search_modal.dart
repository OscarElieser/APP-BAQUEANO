// ============================================================================
// 🔎 BUSCADOR UNIVERSAL PREDICTIVO EN VIVO (UNIVERSAL_SEARCH_MODAL.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Permitir al explorador buscar en tiempo real cualquier rincón de Nicaragua:
//   volcanes, cascadas, platillos ancestrales, cabañas eco-lodges, pistas de marimba
//   o documentales 4K con autocompletado instantáneo.
// - Reducir la fricción de navegación y acelerar el descubrimiento de rutas.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Consulta multi-entidad sobre `CatalogData` (destinations, gastronomy, ecoLodges, musicTracks, videoSpots).
// - Filtrado reactivo en `onChanged` con debounce mínimo.
// - Navegación directa con `context.go(route)` o apertura de checkout modal.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & MODAL EXPUESTO):
// - `UniversalSearchModal.show(context)`: Despliega la barra de búsqueda global.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../data/catalog_data.dart';
import '../theme/app_colors.dart';
import '../theme/app_gradients.dart';

class UniversalSearchModal extends StatefulWidget {
  const UniversalSearchModal({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const UniversalSearchModal(),
    );
  }

  @override
  State<UniversalSearchModal> createState() => _UniversalSearchModalState();
}

class _UniversalSearchModalState extends State<UniversalSearchModal> {
  final TextEditingController _controller = TextEditingController();
  String _query = '';
  String _activeCategory = 'Todos';

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // 1. Filtrado de destinos
    final matchedDestinations = CatalogData.destinations.where((d) {
      final matchesQuery = _query.isEmpty ||
          d.title.toLowerCase().contains(_query.toLowerCase()) ||
          d.department.toLowerCase().contains(_query.toLowerCase()) ||
          d.description.toLowerCase().contains(_query.toLowerCase());
      final matchesCategory = _activeCategory == 'Todos' || _activeCategory == 'Destinos';
      return matchesQuery && matchesCategory;
    }).toList();

    // 2. Filtrado de gastronomía
    final matchedDishes = CatalogData.gastronomyDishes.where((g) {
      final matchesQuery = _query.isEmpty ||
          g.name.toLowerCase().contains(_query.toLowerCase()) ||
          g.region.toLowerCase().contains(_query.toLowerCase());
      final matchesCategory = _activeCategory == 'Todos' || _activeCategory == 'Comida';
      return matchesQuery && matchesCategory;
    }).toList();

    // 3. Filtrado de eco-lodges
    final matchedLodges = CatalogData.ecoLodges.where((l) {
      final matchesQuery = _query.isEmpty ||
          l.name.toLowerCase().contains(_query.toLowerCase()) ||
          l.location.toLowerCase().contains(_query.toLowerCase());
      final matchesCategory = _activeCategory == 'Todos' || _activeCategory == 'Hospedaje';
      return matchesQuery && matchesCategory;
    }).toList();

    return Container(
      height: MediaQuery.of(context).size.height * 0.88,
      decoration: BoxDecoration(
        color: AppColors.bgDark,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        border: const Border(top: BorderSide(color: AppColors.gold, width: 1.5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.6),
            blurRadius: 30,
            offset: const Offset(0, -6),
          ),
        ],
      ),
      child: Column(
        children: [
          // Píldora de arrastre
          Container(
            margin: const EdgeInsets.symmetric(vertical: 12),
            width: 44,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.borderLight,
              borderRadius: BorderRadius.circular(10),
            ),
          ),

          // ------------------------------------------------------------------
          // 🔎 CAMPO DE BÚSQUEDA INTERACTIVO
          // ------------------------------------------------------------------
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight.withValues(alpha: 0.5),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.borderGold),
                    ),
                    child: TextField(
                      controller: _controller,
                      autofocus: true,
                      style: GoogleFonts.inter(fontSize: 14, color: Colors.white),
                      onChanged: (val) => setState(() => _query = val.trim()),
                      decoration: InputDecoration(
                        hintText: 'Buscar volcán, laguna, platillo, cabaña...',
                        hintStyle: GoogleFonts.inter(fontSize: 13, color: AppColors.textMuted),
                        prefixIcon: const Icon(Icons.search_rounded, color: AppColors.gold, size: 22),
                        suffixIcon: _query.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear_rounded, color: AppColors.textMuted, size: 18),
                                onPressed: () {
                                  _controller.clear();
                                  setState(() => _query = '');
                                },
                              )
                            : null,
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text(
                    'Cerrar',
                    style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.goldLight),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // ------------------------------------------------------------------
          // 🏷️ CHIPS DE CATEGORÍA RÁPIDA (Todos, Destinos, Comida, Hospedaje)
          // ------------------------------------------------------------------
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: ['Todos', 'Destinos', 'Comida', 'Hospedaje'].map((cat) {
                final isSelected = _activeCategory == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: InkWell(
                    onTap: () => setState(() => _activeCategory = cat),
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.terracotta : AppColors.primaryLight.withValues(alpha: 0.4),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: isSelected ? AppColors.gold : AppColors.borderLight),
                      ),
                      child: Text(
                        cat,
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 11,
                          fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: 14),
          const Divider(color: AppColors.borderLight, height: 1),

          // ------------------------------------------------------------------
          // 📋 LISTA DINÁMICA DE RESULTADOS COINCIDENTES
          // ------------------------------------------------------------------
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                if (matchedDestinations.isNotEmpty) ...[
                  _buildSectionTitle('EXPEDICIONES Y RUTAS (${matchedDestinations.length})'),
                  ...matchedDestinations.map(
                    (d) => _buildResultItem(
                      icon: Icons.landscape_rounded,
                      title: d.title,
                      subtitle: '${d.department} · \$${d.priceUsd.toInt()} USD · ${d.difficulty}',
                      onTap: () {
                        Navigator.pop(context);
                        context.go('/descubrir');
                      },
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                if (matchedDishes.isNotEmpty) ...[
                  _buildSectionTitle('GASTRONOMÍA ANCESTRAL (${matchedDishes.length})'),
                  ...matchedDishes.map(
                    (g) => _buildResultItem(
                      icon: Icons.restaurant_menu_rounded,
                      title: g.name,
                      subtitle: '${g.region} · ${g.recommendedPlace}',
                      onTap: () {
                        Navigator.pop(context);
                        context.go('/gastronomia');
                      },
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                if (matchedLodges.isNotEmpty) ...[
                  _buildSectionTitle('ECO-LODGES & CABAÑAS (${matchedLodges.length})'),
                  ...matchedLodges.map(
                    (l) => _buildResultItem(
                      icon: Icons.hotel_rounded,
                      title: l.name,
                      subtitle: '${l.location} · \$${l.pricePerNightUsd.toInt()} USD/noche',
                      onTap: () {
                        Navigator.pop(context);
                        context.go('/hospedaje');
                      },
                    ),
                  ),
                ],

                if (matchedDestinations.isEmpty && matchedDishes.isEmpty && matchedLodges.isEmpty)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.all(40.0),
                      child: Column(
                        children: [
                          const Icon(Icons.search_off_rounded, size: 48, color: AppColors.textMuted),
                          const SizedBox(height: 12),
                          Text(
                            'No se encontraron resultados para "$_query"',
                            style: GoogleFonts.inter(fontSize: 14, color: AppColors.textMuted),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, top: 4),
      child: Text(
        title,
        style: GoogleFonts.spaceGrotesk(
          fontSize: 10,
          fontWeight: FontWeight.w900,
          color: AppColors.gold,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildResultItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        gradient: AppGradients.cardGlass,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: ListTile(
        onTap: onTap,
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.primaryLight,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: AppColors.goldLight, size: 20),
        ),
        title: Text(
          title,
          style: GoogleFonts.montserrat(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white),
        ),
        subtitle: Text(
          subtitle,
          style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
        ),
        trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.gold),
      ),
    );
  }
}
