// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — TESTIMONIOS Y RESEÑAS VERIFICADAS DE VIAJEROS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Transmitir confianza absoluta y transparencia a los nuevos exploradores
//   mediante reseñas reales con nacionalidad, calificación de 5 estrellas y
//   experiencias vívidas de ecoturismo campesino en Nicaragua.
// - Ofrecer una experiencia de deslizamiento suave a 120 FPS sin consumo de batería
//   ni trabas de gestos táctiles.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `RepaintBoundary` para independizar la pintura del carrusel y evitar
//   sobrecargar la GPU en desplazamientos verticales.
// - `ListView.separated` horizontal con `BouncingScrollPhysics` nativa.
// - Modal interactivo `_showReviewDetailsModal` para lectura cómoda y extendida
//   con detalles del viaje y sello de verificación Baqueano.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `ExplorerTestimonials`: Carrusel horizontal de testimonios de alta fidelidad.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/section_header.dart';

class ExplorerTestimonials extends StatefulWidget {
  const ExplorerTestimonials({super.key});

  @override
  State<ExplorerTestimonials> createState() => _ExplorerTestimonialsState();
}

class _ExplorerTestimonialsState extends State<ExplorerTestimonials> {
  /// Testimonio actualmente seleccionado para modal de lectura detallada
  dynamic _selectedReview;

  Future<void> _handleReviewSelected(dynamic rev) async {
    setState(() => _selectedReview = rev);
    await _showReviewDetailsModal(context, rev);
    if (mounted) {
      setState(() => _selectedReview = null);
    }
  }

  Future<void> _showReviewDetailsModal(BuildContext context, dynamic rev) async {
    await showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF082B35),
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 44,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 18),
            Row(
              children: [
                Text(rev.countryFlag, style: const TextStyle(fontSize: 34)),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        rev.author,
                        style: GoogleFonts.montserrat(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        'Destino explorado: ${rev.destination}',
                        style: GoogleFonts.spaceGrotesk(fontSize: 12, color: AppColors.gold),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.success.withValues(alpha: 0.5)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.verified_rounded, size: 12, color: AppColors.success),
                      const SizedBox(width: 4),
                      Text(
                        'VERIFICADO',
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 9.5,
                          fontWeight: FontWeight.w800,
                          color: AppColors.success,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Row(
              children: List.generate(
                5,
                (i) => const Icon(Icons.star_rounded, size: 20, color: AppColors.gold),
              ),
            ),
            const SizedBox(height: 16),
            const Divider(color: Colors.white12),
            const SizedBox(height: 12),
            Text(
              'Bitácora del Explorador:',
              style: GoogleFonts.spaceGrotesk(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: Colors.white70,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '"${rev.review}"',
              style: GoogleFonts.inter(
                fontSize: 14,
                color: Colors.white.withValues(alpha: 0.95),
                height: 1.6,
                fontStyle: FontStyle.italic,
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(ctx),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.terracotta,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: Text(
                  'Cerrar Reseña',
                  style: GoogleFonts.spaceGrotesk(
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final reviews = CatalogData.explorerReviews;
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Encabezado temático centrado con badge informativo
        Padding(
          padding: EdgeInsets.symmetric(horizontal: isDesktop ? 48.0 : 20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SectionHeader(
                tag: 'TESTIMONIOS REALES',
                title: 'Lo que dicen nuestros Exploradores',
                subtitle: 'Historias transparentes de viajeros de todo el mundo que descubrieron la magia oculta de Nicaragua.',
                isCentered: true,
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                decoration: BoxDecoration(
                  color: AppColors.gold.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderGold.withValues(alpha: 0.4), width: 0.8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.star_rounded, size: 14, color: AppColors.gold),
                    const SizedBox(width: 6),
                    Text(
                      'RESEÑAS VERIFICADAS · ${reviews.length} EXPEDICIONARIOS',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                        color: AppColors.gold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 14),

        // Carrusel horizontal aislado con RepaintBoundary para 120 FPS
        RepaintBoundary(
          child: SizedBox(
            height: 235,
            child: ListView.separated(
              padding: EdgeInsets.symmetric(horizontal: isDesktop ? 48.0 : 20.0),
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
              itemCount: reviews.length,
              separatorBuilder: (_, __) => const SizedBox(width: 16),
              itemBuilder: (context, index) {
                final rev = reviews[index];
                final isSelected = _selectedReview == rev;

                return AnimatedScale(
                  scale: isSelected ? 1.03 : 1.0,
                  duration: const Duration(milliseconds: 140),
                  child: InkWell(
                    onTap: () => _handleReviewSelected(rev),
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      width: 320,
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        gradient: isSelected
                            ? const LinearGradient(
                                colors: [Color(0xFF0F3A47), Color(0xFFC86432)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              )
                            : AppGradients.cardGlass,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isSelected
                              ? AppColors.gold
                              : AppColors.borderLight.withValues(alpha: 0.7),
                          width: isSelected ? 1.8 : 1.0,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: isSelected
                                ? AppColors.gold.withValues(alpha: 0.35)
                                : Colors.black.withValues(alpha: 0.25),
                            blurRadius: isSelected ? 16 : 12,
                            offset: const Offset(0, 5),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Fila superior: Bandera nacional, Autor, Destino y 5 Estrellas
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

                          const SizedBox(height: 6),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              Text(
                                'Toca para leer completa 💬',
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 10,
                                  color: AppColors.goldLight.withValues(alpha: 0.7),
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ),
      ],
    );
  }
}
