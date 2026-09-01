// ============================================================================
// 💬 TESTIMONIOS & RESEÑAS VERIFICADAS DE EXPLORADORES (EXPLORER_TESTIMONIALS.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer prueba social (social proof) auténtica de viajeros de diversos países
//   (Alemania, España, Estados Unidos, Costa Rica) que han vivido experiencias con
//   baqueanos locales en Cañón de Somoto, Cerro Negro y Cascada La Luna.
// - Transmitir seguridad, confianza y entusiasmo a nuevos usuarios.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `ListView.separated` horizontal con física de rebote `BouncingScrollPhysics()`.
// - Tarjetas Glassmorphism con bandera emoji del país del autor, 5 estrellas doradas y relato en cursiva.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `ExplorerTestimonials`: Carrusel de testimonios para la sección social del Home.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/section_header.dart';

class ExplorerTestimonials extends StatelessWidget {
  const ExplorerTestimonials({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Encabezado de la sección de reseñas
        const SectionHeader(
          tag: 'TESTIMONIOS REALES',
          title: 'Lo que dicen nuestros Exploradores',
          subtitle: 'Historias transparentes de viajeros de todo el mundo que descubrieron la magia oculta de Nicaragua a través de Baqueano.',
        ),
        const SizedBox(height: 12),

        // Lista horizontal de testimonios de 230px de altura
        SizedBox(
          height: 230,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: CatalogData.explorerReviews.length,
            separatorBuilder: (_, __) => const SizedBox(width: 14),
            itemBuilder: (context, index) {
              final rev = CatalogData.explorerReviews[index];
              return Container(
                width: 320,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: AppGradients.cardGlass,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.borderLight),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.2),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Fila superior: Bandera nacional, Autor, Destino y 5 Estrellas doradas
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Row(
                            children: [
                              Text(rev.countryFlag, style: const TextStyle(fontSize: 22)),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      rev.author,
                                      style: GoogleFonts.montserrat(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w800,
                                        color: AppColors.textLight,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    Text(
                                      rev.destination,
                                      style: GoogleFonts.spaceGrotesk(
                                        fontSize: 11,
                                        color: AppColors.goldLight,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 6),
                        // 5 Estrellas de puntuación máxima
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: List.generate(
                            5,
                            (i) => const Icon(Icons.star_rounded, size: 14, color: AppColors.gold),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Relato en cursiva del explorador
                    Expanded(
                      child: Text(
                        rev.review,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppColors.textLight.withValues(alpha: 0.85),
                          height: 1.45,
                          fontStyle: FontStyle.italic,
                        ),
                        maxLines: 4,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
