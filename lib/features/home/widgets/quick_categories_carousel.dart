// ============================================================================
// 🎠 CARRUSEL DE ACCESO RÁPIDO A CATEGORÍAS CULTURALES (QUICK_CATEGORIES_CAROUSEL.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Permitir al usuario saltar directamente desde la pantalla de inicio hacia las
//   8 áreas clave del ecosistema turístico de Nicaragua: Gastronomía, Música y Folklore,
//   Videos 4K, Playas y Ríos, Eco-Lodges, Vida Nocturna, Circuitos de Volcanes y Catálogo Maestro.
// - Reducir la fricción de navegación con accesos rápidos visualmente atractivos.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `ListView.separated` horizontal con física elástica `BouncingScrollPhysics()`.
// - Tarjetas Glassmorphism con gradiente `AppGradients.cardGlass`, bordes translúcidos y sombras.
// - Enrutamiento instantáneo GoRouter (`context.go(route)`) al presionar cada categoría.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `QuickCategoriesCarousel`: Barra de navegación temática horizontal de 120px de alto.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';

class QuickCategoriesCarousel extends StatelessWidget {
  const QuickCategoriesCarousel({super.key});

  @override
  Widget build(BuildContext context) {
    // Definición de las 8 categorías temáticas con icono, título, subtítulo y ruta canónica
    final categories = [
      {'icon': '🍽️', 'title': 'Gastronomía', 'sub': '6 Platillos & Restaurantes', 'route': '/gastronomia'},
      {'icon': '🎵', 'title': 'Música & Folklore', 'sub': 'Reproductor de Marimba', 'route': '/musica'},
      {'icon': '🎬', 'title': 'Videos 4K', 'sub': 'Expediciones en video', 'route': '/videos'},
      {'icon': '🏖️', 'title': 'Playas & Ríos', 'sub': 'Pacífico, Caribe y cañones', 'route': '/playas'},
      {'icon': '🏨', 'title': 'Eco-Lodges', 'sub': 'Hospedaje rural verde', 'route': '/hospedaje'},
      {'icon': '🎉', 'title': 'Vida Nocturna', 'sub': 'Bares bohemios y terrazas', 'route': '/nocturna'},
      {'icon': '📍', 'title': 'Turismo & Volcanes', 'sub': 'Circuitos y cumbres', 'route': '/turismo'},
      {'icon': '🧭', 'title': 'Mega-Catálogo', 'sub': 'Exploración completa', 'route': '/descubrir'},
    ];

    return SizedBox(
      height: 120,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: categories.length,
        separatorBuilder: (_, __) => const SizedBox(width: 14),
        itemBuilder: (context, index) {
          final cat = categories[index];
          return InkWell(
            onTap: () => context.go(cat['route']!),
            borderRadius: BorderRadius.circular(18),
            child: Container(
              width: 170,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                gradient: AppGradients.cardGlass,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppColors.borderLight),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.2),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Emoji / Icono temático
                  Text(cat['icon']!, style: const TextStyle(fontSize: 26)),
                  const SizedBox(height: 6),
                  // Título principal en Space Grotesk
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
                  // Subtítulo descriptivo en Inter
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
          );
        },
      ),
    );
  }
}
