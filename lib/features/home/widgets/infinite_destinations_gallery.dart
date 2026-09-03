// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — GALERÍA INTERACTIVA DE TOP DESTINOS POPULARES
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Presentar los destinos turísticos y comunitarios más aclamados de Nicaragua
//   con cotización exacta bimoneda (USD/NIO) y reserva directa al anfitrión.
// - Ofrecer una experiencia de deslizamiento táctil con inercia nativa de alta gama
//   que responda instantáneamente al pulgar en cualquier teléfono (gama media, alta y ultra-alta).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `RepaintBoundary` para aislar el renderizado del carrusel, evitando repintar
//   la pantalla principal durante el scroll y erradicando el lag del sistema.
// - `ListView.separated` horizontal con `BouncingScrollPhysics` que no interfiere
//   con el desplazamiento vertical del feed ni genera conflictos de gestos.
// - Integración fluida con `CheckoutModal.show(context, destination)`.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `InfiniteDestinationsGallery`: Galería horizontal de destinos con alto rendimiento.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/models/destination_model.dart';
import '../../../core/theme/app_colors.dart';
import '../../checkout/widgets/checkout_modal.dart';
import 'destination_card.dart';

class InfiniteDestinationsGallery extends StatelessWidget {
  /// Lista de destinos a mostrar (filtrable por departamento)
  final List<DestinationModel> destinations;

  const InfiniteDestinationsGallery({
    super.key,
    required this.destinations,
  });

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    if (destinations.isEmpty) {
      return Container(
        height: 200,
        alignment: Alignment.center,
        child: Text(
          'No hay destinos en este departamento.',
          style: GoogleFonts.inter(color: AppColors.textLight.withValues(alpha: 0.6)),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // --------------------------------------------------------------------
        // 🧭 BADGE INDICADOR CENTRADO DE EXPLORACIÓN RÁPIDA
        // --------------------------------------------------------------------
        Padding(
          padding: EdgeInsets.symmetric(
            horizontal: isDesktop ? 48.0 : 20.0,
            vertical: 4.0,
          ),
          child: Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
              decoration: BoxDecoration(
                color: AppColors.gold.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderGold.withValues(alpha: 0.4), width: 0.8),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.swipe_rounded, size: 13, color: AppColors.gold),
                  const SizedBox(width: 6),
                  Text(
                    'DESLIZA PARA EXPLORAR · ${destinations.length} DESTINOS VERIFICADOS',
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
          ),
        ),

        const SizedBox(height: 12),

        // --------------------------------------------------------------------
        // 📱 CARRUSEL AISLADO CON REPAINT BOUNDARY & MÁXIMO RENDIMIENTO A 120 FPS
        // --------------------------------------------------------------------
        RepaintBoundary(
          child: SizedBox(
            height: 485,
            child: ListView.separated(
              padding: EdgeInsets.symmetric(horizontal: isDesktop ? 48.0 : 20.0),
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
              itemCount: destinations.length,
              separatorBuilder: (_, __) => const SizedBox(width: 18),
              itemBuilder: (context, index) {
                final destination = destinations[index];
                return SizedBox(
                  width: 310,
                  child: DestinationCard(
                    destination: destination,
                    onCardTapped: () => CheckoutModal.show(context, destination),
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
