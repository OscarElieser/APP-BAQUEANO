// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SABORES DE NICARAGUA (GASTRONOMÍA TRADICIONAL)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Celebrar el maíz criollo, los granos rojos, los caldos ahumados y las bebidas
//   ancestrales (pinolillo, tiste, chicha) que forman el corazón culinario de Nicaragua.
// - Ofrecer fichas educativas de cada platillo con ingredientes, momento festivo
//   y curiosidades culturales para turistas e investigadores.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Filtros interactivos por categoría (Desayunos, Almuerzos, Bebidas, Comida Regional).
// - Tarjetas estructuradas con ingredientes en chips, procedencia geográfica y curiosidad.
//
// 📦 3. QUÉ (WHAT / WIDGET EXPUESTO):
// - `CountryGastronomySection`: Catálogo visual gastronómico filtrable.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/glass_container.dart';
import '../models/country_history_models.dart';

class CountryGastronomySection extends StatefulWidget {
  final List<GastronomicDish> dishes;

  const CountryGastronomySection({super.key, required this.dishes});

  @override
  State<CountryGastronomySection> createState() => _CountryGastronomySectionState();
}

class _CountryGastronomySectionState extends State<CountryGastronomySection> {
  String _selectedCategory = 'TODOS';

  final List<String> _categories = ['TODOS', 'Desayuno', 'Almuerzo', 'Bebida', 'Comida Regional'];

  List<GastronomicDish> get _filteredDishes {
    if (_selectedCategory == 'TODOS') return widget.dishes;
    return widget.dishes.where((d) => d.category.toLowerCase() == _selectedCategory.toLowerCase()).toList();
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 1050;
    final isTablet = screenWidth >= 650 && screenWidth < 1050;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Selector de Categorías Culinarias
        SizedBox(
          height: 42,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: _categories.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (context, index) {
              final cat = _categories[index];
              final isSelected = cat == _selectedCategory;

              return FilterChip(
                selected: isSelected,
                label: Text(cat),
                labelStyle: GoogleFonts.spaceGrotesk(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: isSelected ? Colors.white : AppColors.textLight,
                ),
                selectedColor: AppColors.terracotta,
                backgroundColor: AppColors.bgCard,
                side: BorderSide(
                  color: isSelected ? AppColors.gold : AppColors.borderLight,
                ),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                onSelected: (val) {
                  HapticFeedback.selectionClick();
                  setState(() => _selectedCategory = cat);
                },
              );
            },
          ),
        ),

        const SizedBox(height: 18),

        // Rejilla de Platillos
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: isDesktop ? 3 : (isTablet ? 2 : 1),
            mainAxisExtent: 410,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
          ),
          itemCount: _filteredDishes.length,
          itemBuilder: (context, index) {
            final dish = _filteredDishes[index];

            return GlassContainer(
              padding: const EdgeInsets.all(16),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.borderLight),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Imagen del platillo
                  ClipRRect(
                    borderRadius: BorderRadius.circular(14),
                    child: Image.network(
                      dish.imageUrl,
                      height: 140,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        height: 140,
                        color: AppColors.primaryLight,
                        child: const Center(child: Icon(Icons.restaurant_rounded, size: 36, color: AppColors.gold)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Categoría y Región
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.terracotta.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.terracottaLight),
                        ),
                        child: Text(
                          dish.category.toUpperCase(),
                          style: GoogleFonts.spaceGrotesk(fontSize: 9.5, fontWeight: FontWeight.w800, color: AppColors.terracottaLight),
                        ),
                      ),
                      Expanded(
                        child: Text(
                          dish.region,
                          textAlign: TextAlign.end,
                          style: GoogleFonts.inter(fontSize: 10.5, color: AppColors.textMuted),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 8),

                  // Nombre del platillo
                  Text(
                    dish.name,
                    style: GoogleFonts.montserrat(fontSize: 15.5, fontWeight: FontWeight.w800, color: Colors.white),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),

                  const SizedBox(height: 4),

                  // Descripción
                  Text(
                    dish.description,
                    style: GoogleFonts.inter(fontSize: 11.5, color: AppColors.textLight.withValues(alpha: 0.85), height: 1.35),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),

                  const SizedBox(height: 8),

                  // Curiosidad Cultural
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.bgDark,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.borderGold.withValues(alpha: 0.4)),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('💡', style: TextStyle(fontSize: 12)),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            dish.culturalCuriosity,
                            style: GoogleFonts.inter(fontSize: 10.5, color: AppColors.goldLight, height: 1.25),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const Spacer(),

                  // Botón "Explorar Gastronomía en Baqueano"
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        HapticFeedback.lightImpact();
                        context.go(dish.destinationRouteId ?? '/gastronomia');
                      },
                      icon: const Icon(Icons.restaurant_menu_rounded, size: 14, color: AppColors.goldLight),
                      label: Text(
                        'Degustar en Baqueano',
                        style: GoogleFonts.spaceGrotesk(fontSize: 11.5, fontWeight: FontWeight.w700, color: Colors.white),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.borderGold, width: 1.0),
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}
