// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — HOTELES, ECO-LODGES & ALOJAMIENTOS DE NICARAGUA
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Conectar a los exploradores nacionales y extranjeros con alojamientos auténticos:
//   hoteles coloniales boutique, eco-hostales de surf, cabañas frente a la laguna,
//   resorts caribeños y quintas de playa privadas sin intermediarios abusivos.
// - Brindar canales directos de reserva (WhatsApp, llamadas telefónicas, correo)
//   y navegación vial GPS precisa hacia cada establecimiento.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Interfaz responsiva adaptativa con filtrado interactivo por destino turístico
//   (Laguna de Apoyo, Corn Island, Granada Colonial, San Juan del Sur, Quintas, Montañas).
// - Fichas digitales completas renderizadas con `BaqueanoAdaptiveImage` a 60 FPS.
// - Integración con `url_launcher` para llamadas telefónicas, WhatsApp con textos
//   predefinidos, correos estructurados e intents nativos de Google Maps
//   (`google.navigation:q=LAT,LNG&mode=d`) con fallback de direcciones universales.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `LodgingScreen`: Catálogo completo de hospedaje con modales interactivos
//   de gestión de reservas y consulta de rutas viales.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/models/cultural_models.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/baqueano_adaptive_image.dart';
import '../../../core/widgets/baqueano_button.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';

class LodgingScreen extends StatefulWidget {
  const LodgingScreen({super.key});

  @override
  State<LodgingScreen> createState() => _LodgingScreenState();
}

class _LodgingScreenState extends State<LodgingScreen> {
  String _selectedCategory = 'Todos';

  /// Lanza llamada telefónica al hotel 100% real
  Future<void> _callPhone(BuildContext context, String phone) async {
    HapticFeedback.lightImpact();
    final cleanPhone = phone.replaceAll(RegExp(r'[^\d+]'), '');
    final uri = Uri.parse('tel:$cleanPhone');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        await launchUrl(uri, mode: LaunchMode.platformDefault);
      }
    } catch (_) {
      try {
        await launchUrl(uri);
      } catch (_) {
        if (context.mounted) {
          CustomToast.show(context, message: 'Teléfono de contacto: $phone');
        }
      }
    }
  }

  /// Lanza WhatsApp 100% real con mensaje predeterminado
  Future<void> _launchWhatsApp(BuildContext context, LodgingSpot spot) async {
    HapticFeedback.lightImpact();
    final phone = spot.contactPhone ?? '+505 8888 1234';
    final cleanPhone = phone.replaceAll(RegExp(r'[^\d]'), '');
    final defaultMsg = Uri.encodeComponent(
      '¡Hola! Los contacto a través de la app Baqueano Nicaragua. Quisiera consultar sobre disponibilidad y tarifas de hospedaje en ${spot.name}.',
    );

    // Intent nativo directo de WhatsApp en Android
    final nativeWaUri = Uri.parse('whatsapp://send?phone=$cleanPhone&text=$defaultMsg');
    final webWaUri = spot.whatsappUrl != null && spot.whatsappUrl!.isNotEmpty
        ? Uri.parse(spot.whatsappUrl!)
        : Uri.parse('https://wa.me/$cleanPhone?text=$defaultMsg');

    try {
      if (await canLaunchUrl(nativeWaUri)) {
        await launchUrl(nativeWaUri, mode: LaunchMode.externalApplication);
        return;
      } else if (await canLaunchUrl(webWaUri)) {
        await launchUrl(webWaUri, mode: LaunchMode.externalApplication);
        return;
      } else {
        await launchUrl(webWaUri, mode: LaunchMode.platformDefault);
        return;
      }
    } catch (_) {
      try {
        await launchUrl(webWaUri, mode: LaunchMode.externalApplication);
      } catch (_) {
        if (context.mounted) {
          CustomToast.show(context, message: 'WhatsApp: $phone');
        }
      }
    }
  }

  /// Abre cliente de correo con asunto y cuerpo predefinidos
  Future<void> _launchEmail(BuildContext context, LodgingSpot spot) async {
    HapticFeedback.lightImpact();
    final email = spot.email ?? 'info@baqueano.ni';
    final subject = Uri.encodeComponent('Solicitud de Reserva - ${spot.name} (App Baqueano)');
    final body = Uri.encodeComponent(
      'Estimado equipo de ${spot.name},\n\n'
      'Deseo solicitar información y disponibilidad para hospedaje:\n'
      '- Fecha de Entrada (Check-in):\n'
      '- Fecha de Salida (Check-out):\n'
      '- Cantidad de Huéspedes:\n'
      '- Tipo de Habitación / Paquete:\n\n'
      'Agradezco su pronta confirmación.\n'
      'Contacto enviado desde la app Baqueano Nicaragua.',
    );
    final uri = Uri.parse('mailto:$email?subject=$subject&body=$body');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        await launchUrl(uri, mode: LaunchMode.platformDefault);
      }
    } catch (_) {
      try {
        await launchUrl(uri);
      } catch (_) {
        if (context.mounted) {
          CustomToast.show(context, message: 'Correo: $email');
        }
      }
    }
  }

  /// Lanza navegación vehicular en Google Maps desde el punto GPS actual
  Future<void> _launchNavigationDirections(BuildContext context, LodgingSpot spot) async {
    final lat = spot.latitude;
    final lng = spot.longitude;
    if (lat == null || lng == null) {
      CustomToast.error(context, 'Coordenadas GPS no disponibles');
      return;
    }

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

  /// Abre ficha geográfica en Google Maps
  Future<void> _launchLocationInMaps(BuildContext context, LodgingSpot spot) async {
    final lat = spot.latitude;
    final lng = spot.longitude;
    if (lat == null || lng == null) {
      CustomToast.error(context, 'Coordenadas GPS no disponibles');
      return;
    }

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

  /// Modal interactivo para gestionar la reserva según el canal del establecimiento
  void _showReservationModal(BuildContext context, LodgingSpot spot) {
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
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.gold.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.goldLight),
                    ),
                    child: const Text('🛎️', style: TextStyle(fontSize: 24)),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'CANALES DE RESERVA DIRECTA',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: AppColors.goldLight,
                            letterSpacing: 1.0,
                          ),
                        ),
                        Text(
                          spot.name,
                          style: GoogleFonts.montserrat(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.primaryDark,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.info_outline_rounded, color: AppColors.gold, size: 16),
                        const SizedBox(width: 6),
                        Text(
                          'Política y Canal Recomendado:',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.goldLight,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      spot.reservationInfo ?? 'Contacto directo con la administración.',
                      style: GoogleFonts.inter(fontSize: 12.5, color: Colors.white70, height: 1.4),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              // Contenedor Destacado de Tarifa en Modal
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: AppColors.primaryDark,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.gold.withValues(alpha: 0.5), width: 1.2),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.jungleGreen.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.payments_rounded, color: AppColors.jungleGreenLight, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'TARIFA ESTIMADA DE HOSPEDAJE',
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: AppColors.goldLight,
                              letterSpacing: 0.8,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            spot.priceRange ?? '\$${spot.pricePerNightUsd.toInt()} USD / noche',
                            style: GoogleFonts.montserrat(
                              fontSize: 13.5,
                              fontWeight: FontWeight.w800,
                              color: AppColors.jungleGreenLight,
                              height: 1.3,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Elige cómo deseas reservar:',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textMuted,
                ),
              ),
              const SizedBox(height: 12),

              // Botón WhatsApp
              if (spot.whatsappUrl != null || spot.contactPhone != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: BaqueanoButton(
                    text: 'Chatear por WhatsApp Directo',
                    icon: const Icon(Icons.chat_bubble_outline_rounded, size: 18),
                    variant: BaqueanoButtonVariant.primary,
                    height: 44,
                    width: double.infinity,
                    onPressed: () {
                      Navigator.pop(ctx);
                      _launchWhatsApp(context, spot);
                    },
                  ),
                ),

              // Botón Llamada Telefónica
              if (spot.contactPhone != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: BaqueanoButton(
                    text: 'Llamar al Hotel (${spot.contactPhone})',
                    icon: const Icon(Icons.phone_in_talk_rounded, size: 18),
                    variant: BaqueanoButtonVariant.outline,
                    height: 44,
                    width: double.infinity,
                    onPressed: () {
                      Navigator.pop(ctx);
                      _callPhone(context, spot.contactPhone!);
                    },
                  ),
                ),

              // Botón Correo Electrónico
              if (spot.email != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: BaqueanoButton(
                    text: 'Enviar Correo Electrónico (${spot.email})',
                    icon: const Icon(Icons.email_outlined, size: 18),
                    variant: BaqueanoButtonVariant.secondary,
                    height: 44,
                    width: double.infinity,
                    onPressed: () {
                      Navigator.pop(ctx);
                      _launchEmail(context, spot);
                    },
                  ),
                ),

              // Si es Quintas de Playa, enlace especial
              if (spot.id == 'quintas-privadas-pacifico')
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: BaqueanoButton(
                    text: 'Explorar Quintas en Airbnb / VRBO',
                    icon: const Icon(Icons.travel_explore_rounded, size: 18),
                    variant: BaqueanoButtonVariant.gold,
                    height: 44,
                    width: double.infinity,
                    onPressed: () async {
                      Navigator.pop(ctx);
                      final uri = Uri.parse('https://www.airbnb.com/s/Nicaragua/homes');
                      try {
                        await launchUrl(uri, mode: LaunchMode.externalApplication);
                      } catch (_) {}
                    },
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  /// Modal interactivo de ruta vial en Google Maps
  void _showRouteModal(BuildContext context, LodgingSpot spot) {
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
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.gold.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.goldLight),
                    ),
                    child: const Text('🧭', style: TextStyle(fontSize: 24)),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'ITINERARIO VIAL Y RUTA SATELITAL',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: AppColors.goldLight,
                            letterSpacing: 1.0,
                          ),
                        ),
                        Text(
                          spot.name,
                          style: GoogleFonts.montserrat(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.primaryDark,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.my_location_rounded, color: AppColors.jungleGreenLight, size: 16),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Punto de partida: Tu ubicación actual (GPS)',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppColors.jungleGreenLight,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        const Icon(Icons.timer_outlined, color: AppColors.gold, size: 16),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            spot.estimatedTime ?? 'Calculando tiempo de llegada...',
                            style: GoogleFonts.inter(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.directions_car_rounded, color: AppColors.terracotta, size: 16),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            spot.howToGetThere ?? 'Sigue las indicaciones de navegación vehicular asistida.',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: Colors.white70,
                              height: 1.35,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              BaqueanoButton(
                text: 'INICIAR RUTA CON GOOGLE MAPS',
                icon: const Icon(Icons.navigation_rounded, size: 18),
                variant: BaqueanoButtonVariant.primary,
                height: 48,
                width: double.infinity,
                onPressed: () {
                  Navigator.pop(ctx);
                  _launchNavigationDirections(context, spot);
                },
              ),
              const SizedBox(height: 10),
              BaqueanoButton(
                text: 'EXPLORAR EN EL MAPA',
                icon: const Icon(Icons.map_rounded, size: 18),
                variant: BaqueanoButtonVariant.outline,
                height: 42,
                width: double.infinity,
                onPressed: () {
                  Navigator.pop(ctx);
                  _launchLocationInMaps(context, spot);
                },
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

    final List<LodgingSpot> allLodgings = CatalogData.ecoLodges;
    final List<LodgingSpot> filteredLodgings = _selectedCategory == 'Todos'
        ? allLodgings
        : allLodgings.where((l) {
            final dest = l.destination ?? '';
            if (_selectedCategory == '🌋 Laguna de Apoyo') {
              return dest == 'Laguna de Apoyo';
            } else if (_selectedCategory == '🥥 Corn Island') {
              return dest == 'Corn Island';
            } else if (_selectedCategory == '🏛️ Granada Colonial') {
              return dest == 'Granada';
            } else if (_selectedCategory == '🌊 San Juan & Surf') {
              return dest == 'San Juan del Sur' || dest == 'Playas & Surf';
            } else if (_selectedCategory == '🏡 Quintas de Playa') {
              return dest == 'Quintas de Playa';
            } else if (_selectedCategory == '🌿 Montañas') {
              return dest == 'Montañas';
            }
            return true;
          }).toList();

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
              tag: 'HOSPEDAJE & ESTADÍAS',
              title: '🏨 Hoteles, Eco-Lodges & Quintas de Nicaragua',
              subtitle: 'Descubre casonas coloniales con historia, eco-hostales de surf, cabañas frente a lagunas cratéricas y quintas de playa privadas.',
            ),
            const SizedBox(height: 16),

            // Hero Banner de Alta Gama
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                gradient: AppGradients.volcanicHero,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: AppColors.gold, width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.gold.withValues(alpha: 0.15),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.gold.withValues(alpha: 0.15),
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.goldLight),
                        ),
                        child: const Text('🛎️', style: TextStyle(fontSize: 28)),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'HOSPEDAJE AUTÉNTICO & RESERVA DIRECTA',
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 12,
                                fontWeight: FontWeight.w800,
                                color: AppColors.goldLight,
                                letterSpacing: 0.8,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              'Contacto directo con anfitriones y hoteles locales sin intermediarios.',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                color: Colors.white70,
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  const Divider(color: AppColors.borderLight, height: 1),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 16,
                    runSpacing: 8,
                    children: [
                      _buildHeroStat('${allLodgings.length} Alojamientos Verificados', Icons.hotel_rounded),
                      _buildHeroStat('WhatsApp & Llamada Directa', Icons.support_agent_rounded),
                      _buildHeroStat('Rutas con Google Maps', Icons.navigation_rounded),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Chips Filtros de Categorías
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: [
                  'Todos',
                  '🌋 Laguna de Apoyo',
                  '🥥 Corn Island',
                  '🏛️ Granada Colonial',
                  '🌊 San Juan & Surf',
                  '🏡 Quintas de Playa',
                  '🌿 Montañas',
                ].map((category) {
                  final isSelected = _selectedCategory == category;
                  return Padding(
                    padding: const EdgeInsets.only(right: 10.0),
                    child: InkWell(
                      onTap: () {
                        HapticFeedback.selectionClick();
                        setState(() => _selectedCategory = category);
                      },
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.terracotta : AppColors.primaryDark,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected ? AppColors.gold : AppColors.borderLight,
                            width: isSelected ? 1.2 : 0.8,
                          ),
                          boxShadow: isSelected
                              ? [
                                  BoxShadow(
                                    color: AppColors.terracotta.withValues(alpha: 0.4),
                                    blurRadius: 10,
                                    offset: const Offset(0, 3),
                                  )
                                ]
                              : null,
                        ),
                        child: Text(
                          category == 'Todos' ? 'Todos (${allLodgings.length})' : category,
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 20),

            // Grid de Hospedajes
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
                maxCrossAxisExtent: isDesktop ? 450 : 550,
                mainAxisExtent: isDesktop ? 545 : 575,
                crossAxisSpacing: 18,
                mainAxisSpacing: 18,
              ),
              itemCount: filteredLodgings.length,
              itemBuilder: (context, index) {
                final lodge = filteredLodgings[index];
                return GlassContainer(
                  padding: EdgeInsets.zero,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: AppColors.borderLight),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Fotografía Adaptativa
                      ClipRRect(
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(22)),
                        child: BaqueanoAdaptiveImage(
                          imageUrl: lodge.imageUrl,
                          height: 185,
                          width: double.infinity,
                          fit: BoxFit.cover,
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Tipo y Rating
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryDark,
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: AppColors.gold.withValues(alpha: 0.4)),
                                  ),
                                  child: Text(
                                    lodge.type.toUpperCase(),
                                    style: GoogleFonts.spaceGrotesk(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.goldLight,
                                    ),
                                  ),
                                ),
                                Row(
                                  children: [
                                    const Icon(Icons.star, color: AppColors.gold, size: 14),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${lodge.rating}',
                                      style: GoogleFonts.spaceGrotesk(
                                        fontSize: 12.5,
                                        fontWeight: FontWeight.w800,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              lodge.name,
                              style: GoogleFonts.montserrat(
                                fontSize: 16.5,
                                fontWeight: FontWeight.w800,
                                color: AppColors.textLight,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              lodge.location,
                              style: GoogleFonts.inter(
                                fontSize: 11,
                                color: AppColors.textMuted,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 6),
                            Text(
                              lodge.description,
                              style: GoogleFonts.inter(
                                fontSize: 11.5,
                                color: Colors.white70,
                                height: 1.35,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 8),

                            // Amenidades
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
                                    '✨ $a',
                                    style: GoogleFonts.inter(fontSize: 10, color: AppColors.goldLight),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                );
                              }).toList(),
                            ),
                            const SizedBox(height: 12),

                            const SizedBox(height: 10),

                            // Contenedor Destacado de Rango de Tarifa
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                              decoration: BoxDecoration(
                                color: AppColors.primaryDark.withValues(alpha: 0.92),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.gold.withValues(alpha: 0.45), width: 1.1),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.25),
                                    blurRadius: 6,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(6),
                                    decoration: BoxDecoration(
                                      color: AppColors.gold.withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Icon(Icons.payments_rounded, color: AppColors.goldLight, size: 16),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Text(
                                          'RANGO DE PRECIO ESTIMADO',
                                          style: GoogleFonts.spaceGrotesk(
                                            fontSize: 9.5,
                                            fontWeight: FontWeight.w800,
                                            color: AppColors.goldLight,
                                            letterSpacing: 0.8,
                                          ),
                                        ),
                                        const SizedBox(height: 1),
                                        Text(
                                          lodge.priceRange ?? '\$${lodge.pricePerNightUsd.toInt()} USD / noche',
                                          style: GoogleFonts.montserrat(
                                            fontSize: 12.5,
                                            fontWeight: FontWeight.w800,
                                            color: AppColors.jungleGreenLight,
                                            height: 1.25,
                                          ),
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 10),

                            // Botones de Acción
                            Row(
                              children: [
                                Expanded(
                                  child: BaqueanoButton(
                                    text: 'Consultar Ruta',
                                    icon: const Icon(Icons.navigation_rounded, size: 16),
                                    variant: BaqueanoButtonVariant.secondary,
                                    height: 38,
                                    padding: const EdgeInsets.symmetric(horizontal: 8),
                                    onPressed: () => _showRouteModal(context, lodge),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: BaqueanoButton(
                                    text: 'Reservar Estadía',
                                    icon: const Icon(Icons.calendar_month_rounded, size: 16),
                                    variant: BaqueanoButtonVariant.primary,
                                    height: 38,
                                    padding: const EdgeInsets.symmetric(horizontal: 8),
                                    onPressed: () => _showReservationModal(context, lodge),
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

  Widget _buildHeroStat(String text, IconData icon) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: AppColors.gold, size: 16),
        const SizedBox(width: 6),
        Text(
          text,
          style: GoogleFonts.spaceGrotesk(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
      ],
    );
  }
}
