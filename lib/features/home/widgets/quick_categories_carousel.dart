// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CARRUSEL DE CATEGORÍAS CULTURALES
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer acceso rápido e interactivo a las 8 rutas y categorías esenciales
//   de Nicaragua (Gastronomía ancestral, Marimba, Videos 4K, Playas, Eco-Lodges, etc.).
// - Brindar una navegación ultrafluida y libre de retrasos tanto en dispositivos
//   de gama media como en pantallas de 120Hz de alta gama.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `RepaintBoundary` para aislar el renderizado del carrusel y evitar redibujados
//   innecesarios en la pantalla principal vertical.
// - `ListView.separated` horizontal con `BouncingScrollPhysics` nativa que asegura
//   un desplazamiento suave, ligero y sin fricción de gestos táctiles.
// - Microinteracción con `AnimatedScale` y paleta volcánica oficial (#082B35, #C86432, #D4AF37).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `QuickCategoriesCarousel`: Carrusel horizontal de alto rendimiento y bajo consumo.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';

class QuickCategoriesCarousel extends StatefulWidget {
  const QuickCategoriesCarousel({super.key});

  @override
  State<QuickCategoriesCarousel> createState() => _QuickCategoriesCarouselState();
}

class _QuickCategoriesCarouselState extends State<QuickCategoriesCarousel> {
  /// Categoría actualmente presionada para dar feedback táctil inmediato
  String? _selectedCategory;

  /// Lista base de categorías temáticas de exploración en Nicaragua
  final List<Map<String, String>> _categories = const [
    {'icon': '🇳🇮', 'title': 'Historia Patria', 'sub': '17 Territorios & Memoria', 'route': '/historia-mi-pais'},
    {'icon': '🍽️', 'title': 'Gastronomía', 'sub': '6 Platillos & Restaurantes', 'route': '/gastronomia'},
    {'icon': '🎵', 'title': 'Música & Folklore', 'sub': 'Reproductor de Marimba', 'route': '/musica'},
    {'icon': '🎬', 'title': 'Videos 4K', 'sub': 'Expediciones en video', 'route': '/videos'},
    {'icon': '🏖️', 'title': 'Playas & Ríos', 'sub': 'Pacífico, Caribe y cañones', 'route': '/playas'},
    {'icon': '🏨', 'title': 'Eco-Lodges', 'sub': 'Hospedaje rural verde', 'route': '/hospedaje'},
    {'icon': '🎉', 'title': 'Vida Nocturna', 'sub': 'Bares bohemios y terrazas', 'route': '/nocturna'},
    {'icon': '📍', 'title': 'Turismo & Volcanes', 'sub': 'Circuitos y cumbres', 'route': '/turismo'},
    {'icon': '🧭', 'title': 'Mega-Catálogo', 'sub': 'Exploración completa', 'route': '/descubrir'},
  ];

  void _onCategoryTapped(Map<String, String> cat) async {
    setState(() => _selectedCategory = cat['title']);
    await Future.delayed(const Duration(milliseconds: 140));
    if (mounted) {
      context.go(cat['route']!);
      setState(() => _selectedCategory = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    return RepaintBoundary(
      child: SizedBox(
        height: 125,
        child: ListView.separated(
          padding: EdgeInsets.symmetric(horizontal: isDesktop ? 48.0 : 20.0),
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
          itemCount: _categories.length,
          separatorBuilder: (_, __) => const SizedBox(width: 14),
          itemBuilder: (context, index) {
            final cat = _categories[index];
            final isSelected = _selectedCategory == cat['title'];

            return AnimatedScale(
              scale: isSelected ? 1.04 : 1.0,
              duration: const Duration(milliseconds: 140),
              child: InkWell(
                onTap: () => _onCategoryTapped(cat),
                borderRadius: BorderRadius.circular(18),
                child: Container(
                  width: 175,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    gradient: isSelected
                        ? const LinearGradient(
                            colors: [Color(0xFF0F3A47), Color(0xFFC86432)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          )
                        : AppGradients.cardGlass,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: isSelected
                          ? AppColors.gold
                          : AppColors.borderLight.withValues(alpha: 0.7),
                      width: isSelected ? 1.8 : 1.0,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: isSelected
                            ? AppColors.gold.withValues(alpha: 0.3)
                            : Colors.black.withValues(alpha: 0.2),
                        blurRadius: isSelected ? 14 : 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(cat['icon']!, style: const TextStyle(fontSize: 26)),
                      const SizedBox(height: 6),
                      Text(
                        cat['title']!,
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textLight,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        cat['sub']!,
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          color: AppColors.textMuted,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
