// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — ALOJAMIENTOS SOSTENIBLES & ECO-LODGES
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Conectar a los exploradores con cabañas bioclimáticas, eco-lodges y fincas
//   agroecológicas que preservan la biodiversidad de Nicaragua.
// - Brindar una interfaz de reservación directa con anfitriones rurales sin
//   intermediarios abusivos.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `GridView.builder` con `SliverGridDelegateWithMaxCrossAxisExtent` y altura
//   dimensionada (`mainAxisExtent: 490`) para prevenir desbordamientos verticales.
// - Etiquetas de amenidades con `TextOverflow.ellipsis` y `Flexible` en precios.
// - Integración directa con el flujo de reserva `CheckoutModal`.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `LodgingScreen`: Catálogo visual de alojamientos bioclimáticos.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/baqueano_button.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';
import '../../checkout/widgets/checkout_modal.dart';

class LodgingScreen extends StatelessWidget {
  const LodgingScreen({super.key});

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
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SectionHeader(
              tag: 'HOSPEDAJE SOSTENIBLE',
              title: '🏨 Eco-Lodges & Cabañas Bioclimáticas',
              subtitle: 'Duerme bajo el dosel de la nebliselva, en las faldas de volcanes o frente a cañones ancestrales.',
              isCentered: true,
            ),
            const SizedBox(height: 20),

            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
                maxCrossAxisExtent: isDesktop ? 450 : 550,
                mainAxisExtent: isDesktop ? 475 : 490,
                crossAxisSpacing: 18,
                mainAxisSpacing: 18,
              ),
              itemCount: CatalogData.ecoLodges.length,
              itemBuilder: (context, index) {
                final lodge = CatalogData.ecoLodges[index];
                return GlassContainer(
                  padding: EdgeInsets.zero,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.borderLight),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ClipRRect(
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                        child: Image.network(
                          lodge.imageUrl,
                          height: 175,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            height: 175,
                            color: AppColors.primaryLight,
                            child: const Center(child: Icon(Icons.hotel, size: 48, color: AppColors.gold)),
                          ),
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
                                Text(
                                  lodge.type.toUpperCase(),
                                  style: GoogleFonts.spaceGrotesk(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.jungleGreenLight,
                                  ),
                                ),
                                Row(
                                  children: [
                                    const Icon(Icons.star, color: AppColors.gold, size: 14),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${lodge.rating}',
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
                              lodge.name,
                              style: GoogleFonts.montserrat(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                color: AppColors.textLight,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              lodge.location,
                              style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 6),
                            Text(
                              lodge.description,
                              style: GoogleFonts.inter(fontSize: 11.5, color: AppColors.textMuted, height: 1.35),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 8),
                            Wrap(
                              spacing: 6,
                              runSpacing: 4,
                              children: lodge.amenities.take(3).map((a) {
                                return Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryDark,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    '🌿 $a',
                                    style: GoogleFonts.inter(fontSize: 10, color: AppColors.goldLight),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                );
                              }).toList(),
                            ),
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Flexible(
                                  child: Text(
                                    '\$${lodge.pricePerNightUsd.toInt()} USD / noche',
                                    style: GoogleFonts.montserrat(
                                      fontSize: 14.5,
                                      fontWeight: FontWeight.w900,
                                      color: AppColors.gold,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                BaqueanoButton(
                                  text: 'Reservar Estadía',
                                  variant: BaqueanoButtonVariant.primary,
                                  height: 36,
                                  padding: const EdgeInsets.symmetric(horizontal: 14),
                                  onPressed: () => CheckoutModal.show(
                                    context,
                                    CatalogData.destinations.firstWhere(
                                      (d) => d.id == 'selva-negra-reserva',
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
