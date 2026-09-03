// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CATÁLOGO DE PLAYAS, RÍOS & LAGUNAS (BEACHES_SCREEN)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proporcionar al explorador una vitrina visual de alta gama de los litorales pacíficos,
//   caribeños, ríos históricos y lagunas cratéricas de Nicaragua.
// - Ofrecer transparencia total sobre si cada sitio requiere reserva previa,
//   si es de acceso público o si los eco-hoteles y day-pass operan por reservación.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Carga de imágenes locales desde `assets/images/rios_y_playas/` con `BaqueanoAdaptiveImage`.
// - Cuadrícula adaptativa con `SliverGridDelegateWithMaxCrossAxisExtent` que se ajusta a
//   teléfonos, tablets y escritorio.
// - Modal informativo de políticas de acceso y reservaciones por destino (`showModalBottomSheet`).
// - Integración con `CheckoutModal` para consultar y reservar rutas comunitarias.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `BeachesScreen`: Pantalla completa del catálogo de aguas de Nicaragua.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/models/cultural_models.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/baqueano_adaptive_image.dart';
import '../../../core/widgets/baqueano_button.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';
import '../../checkout/widgets/checkout_modal.dart';

class BeachesScreen extends StatelessWidget {
  const BeachesScreen({super.key});

  /// Muestra modal interactivo con la política detallada de reservas del destino
  void _showReservationDialog(BuildContext context, LodgingSpot spot) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppColors.primaryLight,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          border: Border.all(color: AppColors.borderGold.withValues(alpha: 0.6), width: 1.2),
        ),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.borderLight,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              Row(
                children: [
                  const Icon(Icons.event_available_rounded, color: AppColors.gold, size: 22),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Políticas de Acceso & Reserva',
                      style: GoogleFonts.montserrat(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                spot.name,
                style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.terracotta),
              ),
              Text(
                spot.location,
                style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.primaryDark.withValues(alpha: 0.7),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Text(
                  spot.reservationInfo ?? 'Acceso público y libre según regulaciones locales.',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: AppColors.textLight,
                    height: 1.5,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: BaqueanoButton(
                  text: 'ENTENDIDO',
                  variant: BaqueanoButtonVariant.primary,
                  height: 48,
                  onPressed: () => Navigator.of(ctx).pop(),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    return ResponsiveScaffold(
      currentIndex: 1,
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.symmetric(
          horizontal: isDesktop ? 48.0 : 20.0,
          vertical: 24.0,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SectionHeader(
              tag: 'AGUAS PINOLERAS',
              title: '🏖️ Playas, Ríos & Lagunas Vírgenes',
              subtitle: 'Del Pacífico salvaje con olas mundiales al Caribe turquesa, ríos históricos y lagunas cratéricas.',
            ),
            const SizedBox(height: 20),

            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
                maxCrossAxisExtent: isDesktop ? 450 : 550,
                mainAxisExtent: 475,
                crossAxisSpacing: 18,
                mainAxisSpacing: 18,
              ),
              itemCount: CatalogData.beachesAndRivers.length,
              itemBuilder: (context, index) {
                final spot = CatalogData.beachesAndRivers[index];
                return GlassContainer(
                  padding: EdgeInsets.zero,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.borderLight),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      BaqueanoAdaptiveImage(
                        imageUrl: spot.imageUrl,
                        height: 180,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                        fallbackWidget: Container(
                          height: 180,
                          color: AppColors.primaryLight,
                          child: const Center(child: Icon(Icons.waves, size: 48, color: AppColors.gold)),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    spot.type.toUpperCase(),
                                    style: GoogleFonts.spaceGrotesk(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.craterTeal,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Row(
                                  children: [
                                    const Icon(Icons.star, color: AppColors.gold, size: 14),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${spot.rating}',
                                      style: GoogleFonts.spaceGrotesk(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              spot.name,
                              style: GoogleFonts.montserrat(
                                fontSize: 15,
                                fontWeight: FontWeight.w800,
                                color: AppColors.textLight,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              spot.location,
                              style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              spot.description,
                              style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted, height: 1.35),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 8),
                            Wrap(
                              spacing: 6,
                              runSpacing: 4,
                              children: spot.amenities.take(3).map((a) {
                                return Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryDark,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    '• $a',
                                    style: GoogleFonts.inter(fontSize: 10, color: AppColors.goldLight),
                                  ),
                                );
                              }).toList(),
                            ),
                            const SizedBox(height: 8),

                            // Chip interactivo de información de reserva
                            if (spot.reservationInfo != null)
                              InkWell(
                                onTap: () => _showReservationDialog(context, spot),
                                borderRadius: BorderRadius.circular(8),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryDark.withValues(alpha: 0.6),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: AppColors.gold.withValues(alpha: 0.35),
                                      width: 0.8,
                                    ),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.info_outline_rounded, size: 12, color: AppColors.goldLight),
                                      const SizedBox(width: 5),
                                      Text(
                                        '¿Requiere reserva? Toca para ver',
                                        style: GoogleFonts.inter(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.goldLight,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),

                            const SizedBox(height: 10),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Desde \$${spot.pricePerNightUsd.toInt()} USD',
                                  style: GoogleFonts.montserrat(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w900,
                                    color: AppColors.gold,
                                  ),
                                ),
                                BaqueanoButton(
                                  text: 'Consultar Ruta',
                                  variant: BaqueanoButtonVariant.primary,
                                  height: 36,
                                  padding: const EdgeInsets.symmetric(horizontal: 14),
                                  onPressed: () => CheckoutModal.show(
                                    context,
                                    CatalogData.destinations.firstWhere(
                                      (d) => d.id == 'cascada-la-luna',
                                      orElse: () => CatalogData.destinations.first,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }
}
