// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — FICHA DETALLADA DE LUGAR (PLACE DETAIL SCREEN)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Mostrar toda la información verificada de un establecimiento, punto turístico,
//   patrimonio cultural o servicio de emergencia de Nicaragua.
// - Conectar al usuario con acciones reales inmediatas (Cómo llegar en mapa,
//   llamada telefónica, chat de WhatsApp, compartir ficha y guardar en favoritos).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `ConsumerStatefulWidget` reactivo con Riverpod.
// - Integración con `url_launcher` para navegación GPS (`maps.google.com`), telefonía y mensajería.
// - Mini mapa satelital interactivo centrado en la ubicación exacta del lugar.
// - Manejo condicional defensivo: solo se muestran los botones cuyas vías de contacto existen.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & PANTALLA EXPUESTA):
// - `PlaceDetailScreen`: Pantalla oficial mapeada en `/descubre-nicaragua/:placeId`.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/baqueano_button.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../models/place_model.dart';
import '../services/places_service.dart';

class PlaceDetailScreen extends ConsumerStatefulWidget {
  final String placeId;
  final PlaceModel? preloadedPlace;

  const PlaceDetailScreen({
    super.key,
    required this.placeId,
    this.preloadedPlace,
  });

  @override
  ConsumerState<PlaceDetailScreen> createState() => _PlaceDetailScreenState();
}

class _PlaceDetailScreenState extends ConsumerState<PlaceDetailScreen> {
  PlaceModel? _place;
  bool _isLoading = true;
  bool _isSaved = false;
  List<PlaceModel> _nearbyServices = [];

  @override
  void initState() {
    super.initState();
    _loadPlaceDetails();
  }

  Future<void> _loadPlaceDetails() async {
    final placesService = ref.read(placesServiceProvider);

    if (widget.preloadedPlace != null) {
      _place = widget.preloadedPlace;
      _isLoading = false;
    } else {
      _place = await placesService.getPlaceById(widget.placeId);
      _isLoading = false;
    }

    if (_place != null) {
      _isSaved = await placesService.isPlaceSaved(_place!.placeId);

      // Cargar lugares o servicios cercanos en el mismo municipio o departamento
      final nearby = await placesService.getPlaces(
        departmentId: _place!.departmentId,
        userLat: _place!.latitude,
        userLng: _place!.longitude,
        limit: 4,
      );
      _nearbyServices = nearby.where((p) => p.placeId != _place!.placeId).toList();
    }

    if (mounted) setState(() {});
  }

  Future<void> _toggleSave() async {
    if (_place == null) return;
    HapticFeedback.selectionClick();
    final placesService = ref.read(placesServiceProvider);
    final newState = await placesService.toggleSavePlace(_place!.placeId);
    setState(() => _isSaved = newState);

    if (mounted) {
      CustomToast.show(
        context,
        message: newState ? '✓ Guardado en tu lista de lugares' : 'Eliminado de tus guardados',
      );
    }
  }

  Future<void> _openNavigation() async {
    if (_place == null) return;
    HapticFeedback.mediumImpact();
    final uri = Uri.parse(
      'https://www.google.com/maps/dir/?api=1&destination=${_place!.latitude},${_place!.longitude}',
    );
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {
      if (mounted) CustomToast.show(context, message: 'No se pudo abrir la aplicación de mapas');
    }
  }

  Future<void> _makeCall() async {
    if (_place == null || _place!.phone == null || _place!.phone!.isEmpty) return;
    HapticFeedback.mediumImpact();
    final cleanPhone = _place!.phone!.replaceAll(RegExp(r'[^0-9+]'), '');
    final uri = Uri.parse('tel:$cleanPhone');
    try {
      await launchUrl(uri);
    } catch (_) {
      if (mounted) CustomToast.show(context, message: 'No se pudo iniciar la llamada');
    }
  }

  Future<void> _openWhatsApp() async {
    if (_place == null || _place!.whatsapp == null || _place!.whatsapp!.isEmpty) return;
    HapticFeedback.mediumImpact();
    final cleanWa = _place!.whatsapp!.replaceAll(RegExp(r'[^0-9]'), '');
    final msg = Uri.encodeComponent('Hola, los contacto desde la plataforma oficial Baqueano.');
    final uri = Uri.parse('https://wa.me/$cleanWa?text=$msg');
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {
      if (mounted) CustomToast.show(context, message: 'No se pudo abrir WhatsApp');
    }
  }

  Future<void> _openWebsite() async {
    if (_place == null || _place!.website == null || _place!.website!.isEmpty) return;
    HapticFeedback.selectionClick();
    final uri = Uri.parse(_place!.website!);
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {
      if (mounted) CustomToast.show(context, message: 'No se pudo abrir el sitio web');
    }
  }

  void _sharePlace() {
    if (_place == null) return;
    HapticFeedback.selectionClick();
    final text = '🇳🇮 *${_place!.name}*\n'
        '• Categoría: ${_place!.categoryName}\n'
        '• Ubicación: ${_place!.municipalityName}, ${_place!.departmentName}\n'
        '• Dirección: ${_place!.address}\n'
        '🗺️ Ver en mapa: https://maps.google.com/?q=${_place!.latitude},${_place!.longitude}\n\n'
        'Encuéntralo en Baqueano — Ecosistema Turístico de Nicaragua';

    Clipboard.setData(ClipboardData(text: text));
    CustomToast.show(context, message: '✓ Enlace y datos copiados para compartir');
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 900;

    if (_isLoading) {
      return const ResponsiveScaffold(
        currentIndex: 1,
        body: Center(
          child: CircularProgressIndicator(color: AppColors.gold),
        ),
      );
    }

    if (_place == null) {
      return ResponsiveScaffold(
        currentIndex: 1,
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.location_off_rounded, size: 48, color: Colors.white38),
              const SizedBox(height: 12),
              Text(
                'Lugar no encontrado',
                style: GoogleFonts.montserrat(fontSize: 16, color: Colors.white70),
              ),
              const SizedBox(height: 16),
              BaqueanoButton(
                text: 'Volver al Directorio',
                variant: BaqueanoButtonVariant.outline,
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
        ),
      );
    }

    final place = _place!;

    return ResponsiveScaffold(
      currentIndex: 1,
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.symmetric(
          horizontal: isDesktop ? 48.0 : 16.0,
          vertical: 20.0,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Botón superior de retorno y acciones rápidas
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                InkWell(
                  onTap: () => Navigator.of(context).pop(),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.primaryDark.withValues(alpha: 0.8),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.arrow_back_rounded, color: AppColors.goldLight, size: 18),
                        const SizedBox(width: 6),
                        Text(
                          'Directorio Nacional',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.goldLight,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.share_outlined, color: Colors.white, size: 22),
                      tooltip: 'Compartir lugar',
                      onPressed: _sharePlace,
                    ),
                    IconButton(
                      icon: Icon(
                        _isSaved ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
                        color: _isSaved ? AppColors.gold : Colors.white,
                        size: 24,
                      ),
                      tooltip: 'Guardar',
                      onPressed: _toggleSave,
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Tarjeta Principal de Imagen y Cabecera
            ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: Stack(
                children: [
                  Container(
                    height: isDesktop ? 340 : 240,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: AppColors.primaryDark,
                      image: place.imageUrl.isNotEmpty
                          ? DecorationImage(
                              image: NetworkImage(place.imageUrl),
                              fit: BoxFit.cover,
                            )
                          : null,
                    ),
                    child: place.imageUrl.isEmpty
                        ? const Center(
                            child: Icon(Icons.landscape_rounded, size: 64, color: Colors.white24),
                          )
                        : null,
                  ),
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Colors.transparent,
                            AppColors.bgDark.withValues(alpha: 0.95),
                          ],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 16,
                    left: 18,
                    right: 18,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: place.isEmergency
                                    ? AppColors.error.withValues(alpha: 0.85)
                                    : AppColors.primary.withValues(alpha: 0.85),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: place.isEmergency ? AppColors.error : AppColors.gold,
                                  width: 0.8,
                                ),
                              ),
                              child: Text(
                                place.categoryName.toUpperCase(),
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                            if (place.verified) ...[
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppColors.jungleGreenLight.withValues(alpha: 0.25),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: AppColors.jungleGreenLight, width: 0.8),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.verified_rounded, size: 12, color: AppColors.jungleGreenLight),
                                    const SizedBox(width: 4),
                                    Text(
                                      '✓ Lugar verificado',
                                      style: GoogleFonts.spaceGrotesk(
                                        fontSize: 9.5,
                                        fontWeight: FontWeight.w800,
                                        color: AppColors.jungleGreenLight,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          place.name,
                          style: GoogleFonts.montserrat(
                            fontSize: isDesktop ? 26 : 20,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            height: 1.2,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.location_on_outlined, color: AppColors.goldLight, size: 15),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                '${place.municipalityName}, ${place.departmentName}',
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.goldLight,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (place.distanceKm != null) ...[
                              const SizedBox(width: 8),
                              Text(
                                '• ${place.formattedDistance}',
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.jungleGreenLight,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Fila de Botones de Acción Rápida
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                BaqueanoButton(
                  text: 'Cómo llegar',
                  variant: BaqueanoButtonVariant.primary,
                  height: 42,
                  icon: const Icon(Icons.directions_rounded, size: 18, color: Colors.white),
                  onPressed: _openNavigation,
                ),
                if (place.phone != null && place.phone!.isNotEmpty)
                  BaqueanoButton(
                    text: 'Llamar (${place.phone})',
                    variant: BaqueanoButtonVariant.secondary,
                    height: 42,
                    icon: const Icon(Icons.call_rounded, size: 18, color: Colors.white),
                    onPressed: _makeCall,
                  ),
                if (place.whatsapp != null && place.whatsapp!.isNotEmpty)
                  BaqueanoButton(
                    text: 'WhatsApp',
                    variant: BaqueanoButtonVariant.outline,
                    height: 42,
                    icon: const Icon(Icons.chat_bubble_rounded, size: 18, color: AppColors.jungleGreenLight),
                    onPressed: _openWhatsApp,
                  ),
                if (place.website != null && place.website!.isNotEmpty)
                  BaqueanoButton(
                    text: 'Página Web',
                    variant: BaqueanoButtonVariant.glass,
                    height: 42,
                    icon: const Icon(Icons.language_rounded, size: 18, color: Colors.white70),
                    onPressed: _openWebsite,
                  ),
              ],
            ),
            const SizedBox(height: 24),

            // Bloque de Información & Descripción
            GlassContainer(
              padding: const EdgeInsets.all(20),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.borderLight),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'ACERCA DE ESTE LUGAR',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: AppColors.goldLight,
                      letterSpacing: 1.1,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    place.description.isNotEmpty
                        ? place.description
                        : 'Establecimiento y punto geográfico registrado en el Directorio Nacional de Baqueano Nicaragua.',
                    style: GoogleFonts.inter(
                      fontSize: 13.5,
                      color: Colors.white.withValues(alpha: 0.9),
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 18),
                  const Divider(color: AppColors.borderLight),
                  const SizedBox(height: 14),

                  // Detalles Específicos
                  _buildDetailRow(
                    Icons.place_outlined,
                    'Dirección',
                    place.address.isNotEmpty ? place.address : 'Ubicación georreferenciada en mapa',
                  ),
                  const SizedBox(height: 12),

                  if (place.openingHours != null && place.openingHours!.isNotEmpty) ...[
                    _buildDetailRow(
                      Icons.access_time_rounded,
                      'Horario de Atención',
                      place.openingHours!,
                    ),
                    const SizedBox(height: 12),
                  ],

                  if (place.verificationSource != null && place.verificationSource!.isNotEmpty) ...[
                    _buildDetailRow(
                      Icons.shield_outlined,
                      'Fuente de Verificación Oficial',
                      place.verificationSource!,
                    ),
                    const SizedBox(height: 12),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Mini Mapa de Ubicación Geográfica
            Text(
              '📍 UBICACIÓN EN MAPA',
              style: GoogleFonts.spaceGrotesk(
                fontSize: 11.5,
                fontWeight: FontWeight.w800,
                color: AppColors.goldLight,
                letterSpacing: 1.1,
              ),
            ),
            const SizedBox(height: 10),
            RepaintBoundary(
              child: Container(
                height: 200,
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.gold.withValues(alpha: 0.5), width: 1.2),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: GoogleMap(
                    initialCameraPosition: CameraPosition(
                      target: LatLng(place.latitude, place.longitude),
                      zoom: 15,
                    ),
                    markers: {
                      Marker(
                        markerId: MarkerId(place.placeId),
                        position: LatLng(place.latitude, place.longitude),
                        infoWindow: InfoWindow(title: place.name),
                      ),
                    },
                    zoomControlsEnabled: false,
                    myLocationButtonEnabled: false,
                    mapToolbarEnabled: false,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 30),

            // Lugares cercanos relacionados
            if (_nearbyServices.isNotEmpty) ...[
              Text(
                'SERVICIOS Y LUGARES CERCANOS',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w800,
                  color: AppColors.goldLight,
                  letterSpacing: 1.1,
                ),
              ),
              const SizedBox(height: 12),
              ..._nearbyServices.map((nearby) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: InkWell(
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (context) => PlaceDetailScreen(
                              placeId: nearby.placeId,
                              preloadedPlace: nearby,
                            ),
                          ),
                        );
                      },
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.primaryDark.withValues(alpha: 0.6),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.borderLight),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: nearby.isEmergency
                                    ? AppColors.error.withValues(alpha: 0.2)
                                    : AppColors.primary.withValues(alpha: 0.3),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(
                                nearby.isEmergency ? Icons.emergency_rounded : Icons.place_rounded,
                                color: nearby.isEmergency ? AppColors.error : AppColors.goldLight,
                                size: 22,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    nearby.name,
                                    style: GoogleFonts.montserrat(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w700,
                                      color: Colors.white,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  Text(
                                    '${nearby.categoryName} • ${nearby.municipalityName}',
                                    style: GoogleFonts.inter(
                                      fontSize: 11,
                                      color: Colors.white60,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            if (nearby.distanceKm != null)
                              Text(
                                nearby.formattedDistance,
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.jungleGreenLight,
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  )),
            ],
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String title, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: AppColors.goldLight),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textMuted,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
