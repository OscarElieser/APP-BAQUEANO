// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CATÁLOGO DE PLAYAS, RÍOS & NAVEGACIÓN (BEACHES_SCREEN)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proporcionar al explorador una vitrina visual de alta gama de los litorales pacíficos,
//   caribeños, ríos históricos y lagunas cratéricas de Nicaragua.
// - Calcular la ruta vial exacta desde el punto de partida actual del usuario hasta el
//   acceso carretero y parqueo del destino seleccionado (evitando puntos marinos o inaccesibles).
// - Proporcionar integración nativa con Google Maps para navegación paso a paso y exploración.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Coordenadas viales de entrada calibradas en `CatalogData.beachesAndRivers`.
// - Intent nativo de Android `google.navigation:q=LAT,LNG&mode=d` que activa de inmediato
//   la navegación GPS desde "Tu ubicación actual" en el dispositivo del usuario.
// - Fallback a la API universal de Google Maps `https://www.google.com/maps/dir/?api=1&destination=LAT,LNG&travelmode=driving`.
// - Modal interactivo `_showRouteNavigationModal` con tiempo estimado, instrucciones de acceso
//   y botones para iniciar navegación o explorar el mapa.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `BeachesScreen`: Pantalla completa del catálogo de aguas de Nicaragua con hoja de ruta dinámica.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/models/cultural_models.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/baqueano_adaptive_image.dart';
import '../../../core/widgets/baqueano_button.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';

class BeachesScreen extends StatelessWidget {
  const BeachesScreen({super.key});

  /// Abre la navegación vehicular paso a paso en Google Maps desde la ubicación actual del usuario
  Future<void> _launchNavigationDirections(BuildContext context, LodgingSpot spot) async {
    final lat = spot.latitude;
    final lng = spot.longitude;
    if (lat == null || lng == null) {
      CustomToast.error(context, 'Coordenadas GPS no disponibles');
      return;
    }

    // Intención: Trazar la ruta de viaje desde la ubicación actual del explorador hasta el destino.
    // Mecanismo: Usar el intent nativo de navegación de Android para guiado por voz,
    // y la URL universal de direcciones de Google Maps como fallback seguro.
    final nativeNavUri = Uri.parse('google.navigation:q=$lat,$lng&mode=d');
    final universalDirUri = Uri.parse(
      'https://www.google.com/maps/dir/?api=1&destination=$lat,$lng&travelmode=driving',
    );

    try {
      if (await canLaunchUrl(nativeNavUri)) {
        await launchUrl(nativeNavUri, mode: LaunchMode.externalApplication);
      } else if (await canLaunchUrl(universalDirUri)) {
        await launchUrl(universalDirUri, mode: LaunchMode.externalApplication);
      } else {
        await launchUrl(universalDirUri, mode: LaunchMode.platformDefault);
      }
    } catch (_) {
      try {
        await launchUrl(universalDirUri, mode: LaunchMode.externalApplication);
      } catch (_) {
        if (context.mounted) {
          CustomToast.show(context, message: 'GPS: $lat, $lng');
        }
      }
    }
  }

  /// Abre la ubicación y ficha geográfica en Google Maps
  Future<void> _launchLocationInMaps(BuildContext context, LodgingSpot spot) async {
    final lat = spot.latitude;
    final lng = spot.longitude;
    if (lat == null || lng == null) {
      CustomToast.error(context, 'Coordenadas GPS no disponibles');
      return;
    }

    // Intención: Mostrar la ficha satelital, fotos y accesos del destino.
    // Mecanismo: Búsqueda geolocalizada precisa por coordenadas y nombre.
    final searchUri = Uri.parse('https://www.google.com/maps/search/?api=1&query=$lat,$lng');
    final geoUri = Uri.parse('geo:$lat,$lng?q=$lat,$lng(${Uri.encodeComponent(spot.name)})');

    try {
      if (await canLaunchUrl(geoUri)) {
        await launchUrl(geoUri, mode: LaunchMode.externalApplication);
      } else if (await canLaunchUrl(searchUri)) {
        await launchUrl(searchUri, mode: LaunchMode.externalApplication);
      } else {
        await launchUrl(searchUri, mode: LaunchMode.platformDefault);
      }
    } catch (_) {
      if (context.mounted) {
        CustomToast.show(context, message: 'Ubicación: ${spot.name}');
      }
    }
  }

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

  /// Muestra modal completo con tiempo de llegada, cómo llegar y botón de Google Maps
  void _showRouteNavigationModal(BuildContext context, LodgingSpot spot) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.90,
        ),
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
        decoration: BoxDecoration(
          color: AppColors.primaryLight,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          border: Border.all(color: AppColors.borderGold.withValues(alpha: 0.6), width: 1.2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.6),
              blurRadius: 25,
              offset: const Offset(0, -6),
            ),
          ],
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 44,
                    height: 5,
                    decoration: BoxDecoration(
                      color: AppColors.borderLight,
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Encabezado con Icono y Título
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.primaryDark,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.gold.withValues(alpha: 0.4)),
                      ),
                      child: const Icon(Icons.alt_route_rounded, color: AppColors.gold, size: 24),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Hoja de Ruta & Navegación',
                            style: GoogleFonts.montserrat(
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                            ),
                          ),
                          Text(
                            spot.name,
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppColors.terracotta,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Indicador de punto de partida dinámico
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.primaryDark.withValues(alpha: 0.6),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.gold.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.my_location_rounded, size: 14, color: AppColors.gold),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Punto de partida: Tu ubicación actual (GPS)',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.goldLight,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),

                // Imagen con badge de ubicación
                Stack(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(18),
                      child: BaqueanoAdaptiveImage(
                        imageUrl: spot.imageUrl,
                        height: 155,
                        width: double.infinity,
                        fit: BoxFit.cover,
                      ),
                    ),
                    Positioned(
                      bottom: 10,
                      left: 10,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: AppColors.primaryDark.withValues(alpha: 0.85),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.borderLight),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.location_on, color: AppColors.goldLight, size: 14),
                            const SizedBox(width: 4),
                            Text(
                              spot.location,
                              style: GoogleFonts.inter(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Bloque 1: Tiempo Estimado de Llegada
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.primaryDark.withValues(alpha: 0.8),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.terracotta.withValues(alpha: 0.4), width: 1),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.timer_outlined, color: AppColors.terracotta, size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'TIEMPO ESTIMADO DE LLEGADA',
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                color: AppColors.terracotta,
                                letterSpacing: 0.8,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              spot.estimatedTime ?? 'Aproximadamente 2 horas según tráfico.',
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // Bloque 2: Cómo Llegar (Ruta Recomendada)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.primaryDark.withValues(alpha: 0.8),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.craterTeal.withValues(alpha: 0.4), width: 1),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.directions_car_rounded, color: AppColors.craterTeal, size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'CÓMO LLEGAR (RUTA EXACTA & ENTRADA VIAL)',
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                color: AppColors.craterTeal,
                                letterSpacing: 0.8,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              spot.howToGetThere ?? 'Sigue las indicaciones oficiales por la carretera principal.',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                color: AppColors.textLight,
                                height: 1.45,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // Bloque 3: Coordenadas GPS Calibradas
                if (spot.latitude != null && spot.longitude != null)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppColors.primaryDark.withValues(alpha: 0.5),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.pin_drop_rounded, size: 15, color: AppColors.goldLight),
                            const SizedBox(width: 6),
                            Text(
                              'GPS Entrada: ${spot.latitude!.toStringAsFixed(4)}, ${spot.longitude!.toStringAsFixed(4)}',
                              style: GoogleFonts.spaceGrotesk(fontSize: 11, color: AppColors.goldLight),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.jungleGreen.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            'Carretera Conectada',
                            style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.jungleGreen),
                          ),
                        ),
                      ],
                    ),
                  ),

                const SizedBox(height: 18),

                // Botón 1: INICIAR NAVEGACIÓN GPS (Desde tu ubicación actual)
                SizedBox(
                  width: double.infinity,
                  child: BaqueanoButton(
                    text: 'INICIAR RUTA CON GOOGLE MAPS',
                    icon: const Icon(Icons.directions_car_rounded, size: 18, color: Colors.white),
                    variant: BaqueanoButtonVariant.primary,
                    height: 50,
                    onPressed: () => _launchNavigationDirections(context, spot),
                  ),
                ),
                const SizedBox(height: 10),

                // Botón 2: EXPLORAR EN GOOGLE MAPS (Ficha y fotos satelitales)
                SizedBox(
                  width: double.infinity,
                  child: BaqueanoButton(
                    text: 'EXPLORAR EN EL MAPA',
                    icon: const Icon(Icons.map_outlined, size: 18, color: AppColors.goldLight),
                    variant: BaqueanoButtonVariant.secondary,
                    height: 46,
                    onPressed: () => _launchLocationInMaps(context, spot),
                  ),
                ),
                const SizedBox(height: 8),

                Center(
                  child: TextButton(
                    onPressed: () => Navigator.of(ctx).pop(),
                    child: Text(
                      'Cerrar',
                      style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted),
                    ),
                  ),
                ),
              ],
            ),
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
                                height: 1.25,
                              ),
                              maxLines: 2,
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
                                  icon: const Icon(Icons.alt_route_rounded, size: 16, color: Colors.white),
                                  variant: BaqueanoButtonVariant.primary,
                                  height: 38,
                                  padding: const EdgeInsets.symmetric(horizontal: 12),
                                  onPressed: () => _showRouteNavigationModal(context, spot),
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
