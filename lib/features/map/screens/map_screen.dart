// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MAPA GEOGRÁFICO INTERACTIVO DE GOOGLE MAPS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia cartográfica satelital real y fidedigna mediante el
//   SDK oficial de Google Maps, permitiendo al explorador navegar, hacer zoom y
//   explorar los volcanes, lagos, reservas y emprendimientos campesinos de Nicaragua
//   con imágenes satelitales auténticas de alta resolución y relieve orográfico.
// - Conectar cada marcador oficial con la ficha del anfitrión, cotización bimoneda
//   y el flujo directo de reserva en comercio justo.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Integración con `GoogleMap` de `google_maps_flutter` centrado en el corazón
//   de Nicaragua (`LatLng(12.8654, -85.2072)` con zoom adaptado a tablets y móviles).
// - Soporte multimodo interactivo: Satelital Híbrido (Google Earth con relieve y vías),
//   Topográfico de Terreno y Modo Nocturno con paleta oficial (`#082B35`, `#C86432`, `#D4AF37`).
// - Marcadores SOLO desde Supabase (`catalogSnapshotProvider`, mismo dato que la
//   Web y Ops Center): destinos publicados con coordenadas válidas y negocios
//   verificados que tengan coordenadas. Nunca se inventan posiciones, precios ni
//   guías; filtros por categorías reales; línea de estado con fuente y conteo.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & VISTAS EXPUESTAS):
// - `MapScreen`: Pantalla oficial de cartografía satelital mapeada en `/mapa`.
// ============================================================================

import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';
import '../../../data/repositories/catalog_repository.dart';
import '../../checkout/widgets/reservation_request_sheet.dart';
import '../../directory/models/place_model.dart';

class MapScreen extends ConsumerStatefulWidget {
  final double? initialLat;
  final double? initialLng;
  final String? initialTitle;

  const MapScreen({
    super.key,
    this.initialLat,
    this.initialLng,
    this.initialTitle,
  });

  @override
  ConsumerState<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends ConsumerState<MapScreen> {
  GoogleMapController? _mapController;

  // Centro geográfico oficial de Nicaragua
  static const LatLng _nicaraguaCenter = LatLng(12.8654, -85.2072);

  // Tipos de mapa disponibles
  MapType _currentMapType = MapType.hybrid; // Satelital con vías y etiquetas por defecto
  bool _isDarkStyleApplied = false;

  // 'Todos', 'Destinos', 'Negocios' o una categoría real de los destinos.
  String _selectedFilter = 'Todos';
  PlaceModel? _selectedPlace;
  CatalogBusiness? _selectedBusiness;

  // Estilo cartográfico nocturno con paleta volcánica oficial
  static const String _darkMapStyleJson = '''[
    {"elementType": "geometry", "stylers": [{"color": "#082B35"}]},
    {"elementType": "labels.text.fill", "stylers": [{"color": "#D4AF37"}]},
    {"elementType": "labels.text.stroke", "stylers": [{"color": "#041920"}]},
    {"featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [{"color": "#C86432"}, {"weight": 1.5}]},
    {"featureType": "administrative.province", "elementType": "geometry.stroke", "stylers": [{"color": "#D4AF37"}, {"weight": 0.8}]},
    {"featureType": "landscape.natural", "elementType": "geometry", "stylers": [{"color": "#0B3642"}]},
    {"featureType": "poi", "elementType": "geometry", "stylers": [{"color": "#0E4352"}]},
    {"featureType": "poi.park", "elementType": "geometry", "stylers": [{"color": "#144734"}]},
    {"featureType": "road", "elementType": "geometry", "stylers": [{"color": "#1B3B44"}]},
    {"featureType": "road", "elementType": "geometry.stroke", "stylers": [{"color": "#061A21"}]},
    {"featureType": "road.highway", "elementType": "geometry", "stylers": [{"color": "#C86432"}]},
    {"featureType": "water", "elementType": "geometry", "stylers": [{"color": "#021A24"}]},
    {"featureType": "water", "elementType": "labels.text.fill", "stylers": [{"color": "#38BDF8"}]}
  ]''';

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }

  void _onMapCreated(GoogleMapController controller) {
    _mapController = controller;
    if (widget.initialLat != null && widget.initialLng != null) {
      final target = LatLng(widget.initialLat!, widget.initialLng!);
      controller.animateCamera(
        CameraUpdate.newCameraPosition(
          CameraPosition(target: target, zoom: 14.5),
        ),
      );
    }
  }

  void _toggleMapType() {
    setState(() {
      if (_currentMapType == MapType.hybrid) {
        _currentMapType = MapType.terrain;
        _isDarkStyleApplied = false;
      } else if (_currentMapType == MapType.terrain) {
        _currentMapType = MapType.normal;
        _isDarkStyleApplied = true;
      } else {
        _currentMapType = MapType.hybrid;
        _isDarkStyleApplied = false;
      }
    });
  }

  void _recenterNicaragua() {
    _mapController?.animateCamera(
      CameraUpdate.newCameraPosition(
        const CameraPosition(target: _nicaraguaCenter, zoom: 7.2),
      ),
    );
  }

  Future<void> _launchWhatsApp(String phone, String name) async {
    final cleanPhone = phone.replaceAll(RegExp(r'[^0-9]'), '');
    final uri = Uri.parse(
        'https://wa.me/$cleanPhone?text=Hola%2C%20vi%20su%20informaci%C3%B3n%20en%20el%20Mapa%20Baqueano%20y%20deseo%20m%C3%A1s%20detalles%20sobre%20$name.');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (mounted) CustomToast.error(context, 'No se pudo abrir WhatsApp');
      }
    } catch (_) {
      if (mounted) CustomToast.show(context, message: 'WhatsApp: $phone');
    }
  }

  Future<void> _launchCall(String phone) async {
    final uri = Uri.parse('tel:$phone');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      }
    } catch (_) {}
  }

  /// Abre la ruta en Google Maps hacia coordenadas reales verificadas.
  Future<void> _openDirections(double lat, double lng) async {
    final uri = Uri.parse(
      'https://www.google.com/maps/dir/?api=1&destination=$lat,$lng',
    );
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else if (mounted) {
        CustomToast.error(context, 'No se pudo abrir la navegación');
      }
    } catch (_) {
      if (mounted) CustomToast.error(context, 'No se pudo abrir la navegación');
    }
  }

  /// Pines del mapa: SOLO datos de Supabase con coordenadas válidas (el
  /// repositorio descarta coordenadas nulas o fuera de Nicaragua). Antes se
  /// pintaban destinos con precios fijos y negocios ficticios.
  Set<Marker> _buildMarkers(CatalogSnapshot? catalog) {
    final Set<Marker> markers = {};
    if (catalog == null) return markers;

    final showBusinesses = _selectedFilter == 'Todos' || _selectedFilter == 'Negocios';
    final showPlaces = _selectedFilter != 'Negocios';

    if (showPlaces) {
      for (final place in catalog.places) {
        if (_selectedFilter != 'Todos' &&
            _selectedFilter != 'Destinos' &&
            place.categoryId != _selectedFilter) {
          continue;
        }
        final position = LatLng(place.latitude, place.longitude);
        markers.add(
          Marker(
            markerId: MarkerId('place_${place.placeId}'),
            position: position,
            infoWindow: InfoWindow(
              title: place.name,
              snippet: '${place.departmentName} • ${place.categoryName}',
            ),
            icon: BitmapDescriptor.defaultMarkerWithHue(
              place.verified ? BitmapDescriptor.hueOrange : BitmapDescriptor.hueYellow,
            ),
            zIndexInt: _selectedPlace?.placeId == place.placeId ? 2 : 1,
            onTap: () {
              setState(() {
                _selectedPlace = place;
                _selectedBusiness = null;
              });
              _mapController?.animateCamera(CameraUpdate.newLatLngZoom(position, 11.5));
            },
          ),
        );
      }
    }

    if (showBusinesses) {
      for (final biz in catalog.businesses.where((b) => b.verified && b.hasCoordinates)) {
        final position = LatLng(biz.latitude!, biz.longitude!);
        markers.add(
          Marker(
            markerId: MarkerId('biz_${biz.id}'),
            position: position,
            infoWindow: InfoWindow(title: biz.name, snippet: biz.department),
            icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
            zIndexInt: _selectedBusiness?.id == biz.id ? 2 : 1,
            onTap: () {
              setState(() {
                _selectedBusiness = biz;
                _selectedPlace = null;
              });
              _mapController?.animateCamera(CameraUpdate.newLatLngZoom(position, 12.0));
            },
          ),
        );
      }
    }
    return markers;
  }

  /// Línea de estado honesta: cuántos pines hay y de dónde salen.
  Widget _buildDataStatus(AsyncValue<CatalogSnapshot> catalogAsync) {
    final String text;
    Color color = Colors.white70;
    if (catalogAsync.isLoading && !catalogAsync.hasValue) {
      text = 'Cargando lugares verificados…';
    } else {
      final catalog = catalogAsync.valueOrNull;
      if (catalog == null || catalog.source == CatalogSource.none) {
        text = 'Sin conexión y sin copia guardada: no hay pines que mostrar.';
        color = const Color(0xFFFBBF24);
      } else {
        final businessPins = catalog.businesses.where((b) => b.verified && b.hasCoordinates).length;
        final pending = catalog.businesses.where((b) => b.verified && !b.hasCoordinates).length;
        final origin = catalog.source == CatalogSource.supabase ? 'Supabase (en vivo)' : 'copia guardada';
        text = '${catalog.places.length} destinos y $businessPins negocios con coordenadas reales · fuente: $origin'
            '${pending > 0 ? ' · $pending negocios verificados aún sin coordenadas' : ''}';
      }
    }
    return Row(
      children: [
        Icon(Icons.verified_outlined, size: 14, color: color),
        const SizedBox(width: 6),
        Expanded(
          child: Text(text, style: TextStyle(fontSize: 11.5, color: color, height: 1.4)),
        ),
        IconButton(
          tooltip: 'Actualizar datos',
          icon: const Icon(Icons.refresh_rounded, size: 18, color: Color(0xFFD4AF37)),
          onPressed: () => ref.invalidate(catalogSnapshotProvider),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;
    final mapHeight = isDesktop ? 580.0 : 500.0;
    final catalogAsync = ref.watch(catalogSnapshotProvider);
    final catalog = catalogAsync.valueOrNull;
    final categories = <String>{
      for (final place in catalog?.places ?? const <PlaceModel>[]) place.categoryId,
    }.where((c) => c.isNotEmpty).toList()
      ..sort();
    final categoryLabels = {
      for (final place in catalog?.places ?? const <PlaceModel>[]) place.categoryId: place.categoryName,
    };

    return ResponsiveScaffold(
      currentIndex: 2,
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.symmetric(
          horizontal: isDesktop ? 48.0 : 20.0,
          vertical: 20.0,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SectionHeader(
              tag: 'CARTOGRAFÍA SATELITAL & GOOGLE MAPS',
              title: '🌍 Mapa Satelital de Nicaragua',
              subtitle: 'Explora imágenes satelitales de Google Maps con los destinos y negocios verificados por BAQUEANO, los mismos de la web.',
            ),
            const SizedBox(height: 14),

            // Filtros de Capas
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: [
                  'Todos',
                  'Destinos',
                  'Negocios',
                  ...categories,
                ].map((filter) {
                  final isSelected = _selectedFilter == filter;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: InkWell(
                      onTap: () => setState(() => _selectedFilter = filter),
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFFC86432) : const Color(0xFF082B35),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected ? const Color(0xFFD4AF37) : Colors.white12,
                          ),
                        ),
                        child: Text(
                          filter == 'Todos'
                              ? '🗺️ Todos los Pines'
                              : filter == 'Negocios'
                                  ? '🏪 Negocios Verificados'
                                  : filter == 'Destinos'
                                      ? '📍 Destinos'
                                      : (categoryLabels[filter] ?? filter).toUpperCase(),
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                            color: isSelected ? Colors.white : Colors.white70,
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 8),
            _buildDataStatus(catalogAsync),
            const SizedBox(height: 8),

            // ----------------------------------------------------------------
            // LIENZO DE GOOGLE MAPS REAL CON IMÁGENES SATELITALES Y RELIEVE
            // ----------------------------------------------------------------
            Stack(
              children: [
                Container(
                  height: mapHeight,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: const Color(0xFF041920),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: const Color(0xFFD4AF37).withValues(alpha: 0.65),
                      width: 1.8,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.6),
                        blurRadius: 28,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(24),
                    child: Stack(
                      children: [
                        // GOOGLE MAP WIDGET NATIVO CON SOPORTE TÁCTIL COMPLETO Y BOTONES
                        GoogleMap(
                          initialCameraPosition: CameraPosition(
                            target: (widget.initialLat != null && widget.initialLng != null)
                                ? LatLng(widget.initialLat!, widget.initialLng!)
                                : _nicaraguaCenter,
                            zoom: (widget.initialLat != null && widget.initialLng != null) ? 14.5 : 7.2,
                          ),
                          mapType: _currentMapType,
                          style: _isDarkStyleApplied ? _darkMapStyleJson : null,
                          markers: _buildMarkers(catalog),
                          onMapCreated: _onMapCreated,
                          myLocationEnabled: false,
                          myLocationButtonEnabled: false,
                          zoomControlsEnabled: false,
                          zoomGesturesEnabled: true,
                          scrollGesturesEnabled: true,
                          rotateGesturesEnabled: true,
                          tiltGesturesEnabled: true,
                          gestureRecognizers: <Factory<OneSequenceGestureRecognizer>>{
                            Factory<OneSequenceGestureRecognizer>(
                              () => EagerGestureRecognizer(),
                            ),
                          },
                          compassEnabled: true,
                          mapToolbarEnabled: false,
                        ),

                        // MINIMAPA MUNDI / RADAR GLOBAL EN ESQUINA SUPERIOR IZQUIERDA
                        Positioned(
                          top: 14,
                          left: 14,
                          child: _buildWorldRadarWidget(),
                        ),

                        // BOTONES FLOTANTES DE CONTROL DE GOOGLE MAPS
                        Positioned(
                          top: 14,
                          right: 14,
                          child: Column(
                            children: [
                              // Alternador de Tipo de Mapa (Satélite / Terreno / Nocturno)
                              InkWell(
                                onTap: _toggleMapType,
                                borderRadius: BorderRadius.circular(14),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF082B35).withValues(alpha: 0.94),
                                    borderRadius: BorderRadius.circular(14),
                                    border: Border.all(color: const Color(0xFFD4AF37), width: 1.2),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withValues(alpha: 0.4),
                                        blurRadius: 10,
                                      ),
                                    ],
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        _currentMapType == MapType.hybrid
                                            ? Icons.satellite_alt_rounded
                                            : _currentMapType == MapType.terrain
                                                ? Icons.terrain_rounded
                                                : Icons.nightlight_round,
                                        color: const Color(0xFFD4AF37),
                                        size: 18,
                                      ),
                                      const SizedBox(width: 6),
                                      Text(
                                        _currentMapType == MapType.hybrid
                                            ? 'Satélite Real'
                                            : _currentMapType == MapType.terrain
                                                ? 'Relieve'
                                                : 'Nocturno',
                                        style: GoogleFonts.spaceGrotesk(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w800,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              const SizedBox(height: 8),

                              // Botón Centrar Nicaragua
                              InkWell(
                                onTap: _recenterNicaragua,
                                borderRadius: BorderRadius.circular(12),
                                child: Container(
                                  padding: const EdgeInsets.all(9),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF082B35).withValues(alpha: 0.94),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.5)),
                                  ),
                                  child: const Icon(Icons.center_focus_strong_rounded, color: Color(0xFFD4AF37), size: 20),
                                ),
                              ),
                              const SizedBox(height: 8),

                              // Zoom +
                              InkWell(
                                onTap: () => _mapController?.animateCamera(CameraUpdate.zoomIn()),
                                borderRadius: BorderRadius.circular(12),
                                child: Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF082B35).withValues(alpha: 0.94),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: Colors.white24),
                                  ),
                                  child: const Icon(Icons.add_rounded, color: Colors.white, size: 18),
                                ),
                              ),
                              const SizedBox(height: 6),

                              // Zoom -
                              InkWell(
                                onTap: () => _mapController?.animateCamera(CameraUpdate.zoomOut()),
                                borderRadius: BorderRadius.circular(12),
                                child: Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF082B35).withValues(alpha: 0.94),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: Colors.white24),
                                  ),
                                  child: const Icon(Icons.remove_rounded, color: Colors.white, size: 18),
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Banner inferior de Coordenadas
                        Positioned(
                          bottom: 12,
                          left: 14,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: const Color(0xFF041920).withValues(alpha: 0.90),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.4)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.gps_fixed, color: Color(0xFFD4AF37), size: 12),
                                const SizedBox(width: 6),
                                Text(
                                  'Google Maps SDK • Nicaragua: 12.86° N, 85.20° W',
                                  style: GoogleFonts.spaceGrotesk(fontSize: 10, color: Colors.white70, fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 22),

            // ----------------------------------------------------------------
            // FICHA DETALLADA DEL PUNTO SELECCIONADO (DESTINO O NEGOCIO)
            // ----------------------------------------------------------------
            if (_selectedPlace != null)
              _buildPlaceDetailCard(_selectedPlace!)
            else if (_selectedBusiness != null)
              _buildBusinessDetailCard(_selectedBusiness!),

            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }

  /// Minimapa Mundi / Radar con indicador sobre Nicaragua
  Widget _buildWorldRadarWidget() {
    return Container(
      constraints: const BoxConstraints(maxWidth: 170),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFF041920).withValues(alpha: 0.94),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.6), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.45),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: const RadialGradient(
                colors: [Color(0xFF0284C7), Color(0xFF041920)],
              ),
              border: Border.all(color: const Color(0xFFD4AF37), width: 1),
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                CustomPaint(
                  size: const Size(28, 28),
                  painter: _MiniGlobePainter(),
                ),
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    color: Color(0xFFC86432),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(color: Color(0xFFD4AF37), blurRadius: 6, spreadRadius: 1),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Flexible(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'GOOGLE MAPS',
                  style: GoogleFonts.spaceGrotesk(fontSize: 8.5, fontWeight: FontWeight.w800, color: const Color(0xFFD4AF37), letterSpacing: 0.8),
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  'Satélite & GPS',
                  style: GoogleFonts.inter(fontSize: 9.5, color: Colors.white, fontWeight: FontWeight.w600),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _cardDecorationWrapper({required Color accent, required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: AppGradients.cardGlass,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: accent.withValues(alpha: 0.6), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.35),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: child,
    );
  }

  /// Ficha de un negocio verificado: solo campos que existen en Supabase.
  Widget _buildBusinessDetailCard(CatalogBusiness biz) {
    final phone = biz.phone ?? '';
    final whatsapp = biz.whatsapp ?? '';
    return _cardDecorationWrapper(
      accent: const Color(0xFF10B981),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            biz.name,
            style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 2),
          Text(
            [biz.category, biz.department].where((p) => p.isNotEmpty).join(' • '),
            style: const TextStyle(color: Color(0xFFD4AF37), fontSize: 12, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 14),
          if (biz.hostName.isNotEmpty) ...[
            _buildInfoRow(Icons.person_outline_rounded, 'Anfitrión', biz.hostName),
            const SizedBox(height: 8),
          ],
          if (biz.address.isNotEmpty) ...[
            _buildInfoRow(Icons.location_on_outlined, 'Dirección', biz.address),
            const SizedBox(height: 8),
          ],
          if (biz.specialty.isNotEmpty) ...[
            _buildInfoRow(Icons.star_border_rounded, 'Especialidad', biz.specialty),
            const SizedBox(height: 8),
          ],
          const SizedBox(height: 10),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              if (whatsapp.isNotEmpty)
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF25D366)),
                  icon: const Icon(Icons.chat_rounded, color: Colors.white, size: 18),
                  label: const Text('WhatsApp', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  onPressed: () => _launchWhatsApp(whatsapp, biz.name),
                ),
              if (phone.isNotEmpty)
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0284C7)),
                  icon: const Icon(Icons.phone_rounded, color: Colors.white, size: 18),
                  label: const Text('Llamar', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  onPressed: () => _launchCall(phone),
                ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF65E01)),
                icon: const Icon(Icons.event_available_rounded, color: Colors.white, size: 18),
                label: const Text('Solicitar reserva', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                onPressed: () => ReservationRequestSheet.show(context, business: biz),
              ),
              if (biz.hasCoordinates)
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFC86432)),
                  icon: const Icon(Icons.directions_rounded, color: Colors.white, size: 18),
                  label: const Text('Cómo llegar', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  onPressed: () => _openDirections(biz.latitude!, biz.longitude!),
                ),
            ],
          ),
        ],
      ),
    );
  }

  /// Ficha de un destino publicado en Supabase. Sin precios ni guías
  /// inventados: muestra la fuente de verificación cuando existe.
  Widget _buildPlaceDetailCard(PlaceModel place) {
    return _cardDecorationWrapper(
      accent: const Color(0xFFD4AF37),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: place.imageUrl.isEmpty
                    ? Container(
                        width: 70,
                        height: 70,
                        color: const Color(0xFF082B35),
                        child: const Icon(Icons.landscape_rounded, color: Color(0xFFD4AF37)),
                      )
                    : Image.network(
                        place.imageUrl,
                        width: 70,
                        height: 70,
                        fit: BoxFit.cover,
                        cacheWidth: 200,
                        cacheHeight: 200,
                        errorBuilder: (_, __, ___) => Container(
                          width: 70,
                          height: 70,
                          color: const Color(0xFF082B35),
                          child: const Icon(Icons.landscape_rounded, color: Color(0xFFD4AF37)),
                        ),
                      ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      place.name,
                      style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${place.departmentName} • ${place.categoryName}',
                      style: const TextStyle(color: Color(0xFFD4AF37), fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                    if (place.verified) ...[
                      const SizedBox(height: 4),
                      Text(
                        place.verificationSource == null
                            ? '✅ Verificado por BAQUEANO'
                            : '✅ Verificado · fuente: ${place.verificationSource}',
                        style: TextStyle(color: Colors.white.withValues(alpha: 0.75), fontSize: 11),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          if (place.description.isNotEmpty) ...[
            const SizedBox(height: 14),
            Text(
              place.description,
              maxLines: 5,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 12, height: 1.4),
            ),
          ],
          if (place.address.isNotEmpty) ...[
            const SizedBox(height: 10),
            _buildInfoRow(Icons.alt_route_rounded, 'Cómo llegar', place.address),
          ],
          const SizedBox(height: 16),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFC86432)),
                icon: const Icon(Icons.directions_rounded, color: Colors.white, size: 18),
                label: const Text('Cómo llegar', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                onPressed: () => _openDirections(place.latitude, place.longitude),
              ),
              OutlinedButton.icon(
                style: OutlinedButton.styleFrom(side: const BorderSide(color: Color(0xFFD4AF37))),
                icon: const Icon(Icons.info_outline_rounded, color: Color(0xFFD4AF37), size: 18),
                label: const Text('Ver ficha', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                onPressed: () => context.push('/descubre-nicaragua/${Uri.encodeComponent(place.placeId)}'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: const Color(0xFFD4AF37), size: 16),
        const SizedBox(width: 8),
        Expanded(
          child: RichText(
            text: TextSpan(
              children: [
                TextSpan(
                  text: '$label: ',
                  style: const TextStyle(color: Colors.white54, fontSize: 11, fontWeight: FontWeight.bold),
                ),
                TextSpan(
                  text: value,
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

/// Dibuja el minimapa esférico decorativo para el indicador global
class _MiniGlobePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final gridPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.25)
      ..strokeWidth = 0.8
      ..style = PaintingStyle.stroke;

    final cx = size.width / 2;
    final cy = size.height / 2;
    final r = size.width / 2;

    canvas.drawOval(Rect.fromCenter(center: Offset(cx, cy), width: r * 1.2, height: r * 2), gridPaint);
    canvas.drawLine(Offset(0, cy), Offset(size.width, cy), gridPaint);
    canvas.drawLine(Offset(cx, 0), Offset(cx, size.height), gridPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
