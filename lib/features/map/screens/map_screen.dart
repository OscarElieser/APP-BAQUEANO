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
// - Marcadores georreferenciados dinámicos para destinos y cooperativas campesinas
//   con filtrado reactivo de capas y animaciones suaves de cámara (`animateCamera`).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & VISTAS EXPUESTAS):
// - `MapScreen`: Pantalla oficial de cartografía satelital mapeada en `/mapa`.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/models/cultural_models.dart';
import '../../../core/models/destination_model.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';
import '../../checkout/widgets/checkout_modal.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  GoogleMapController? _mapController;

  // Centro geográfico oficial de Nicaragua
  static const LatLng _nicaraguaCenter = LatLng(12.8654, -85.2072);

  // Tipos de mapa disponibles
  MapType _currentMapType = MapType.hybrid; // Satelital con vías y etiquetas por defecto
  bool _isDarkStyleApplied = false;

  String _selectedFilter = 'Todos'; // 'Todos', 'Destinos', 'Negocios', 'volcanes', 'cascadas'
  DestinationModel? _selectedDestination;
  LocalBusiness? _selectedBusiness;

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
  void initState() {
    super.initState();
    _selectedDestination = CatalogData.destinations.first;
  }

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }

  void _onMapCreated(GoogleMapController controller) {
    _mapController = controller;
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

  void _openCheckout(DestinationModel dest) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => CheckoutModal(destination: dest),
    );
  }

  Set<Marker> _buildMarkers() {
    final Set<Marker> markers = {};

    final showDestinations = _selectedFilter == 'Todos' ||
        _selectedFilter == 'Destinos' ||
        _selectedFilter == 'volcanes' ||
        _selectedFilter == 'cascadas';

    final showBusinesses = _selectedFilter == 'Todos' || _selectedFilter == 'Negocios';

    // Marcadores de Destinos Turísticos
    if (showDestinations) {
      for (final dest in CatalogData.destinations) {
        if (_selectedFilter == 'volcanes' && dest.category != 'volcanes') continue;
        if (_selectedFilter == 'cascadas' && dest.category != 'cascadas') continue;

        final isSelected = _selectedDestination?.id == dest.id;

        markers.add(
          Marker(
            markerId: MarkerId('dest_${dest.id}'),
            position: LatLng(dest.latitude, dest.longitude),
            infoWindow: InfoWindow(
              title: dest.title,
              snippet: '${dest.department} • \$${dest.priceUsd.toStringAsFixed(0)} USD',
              onTap: () => _openCheckout(dest),
            ),
            icon: BitmapDescriptor.defaultMarkerWithHue(
              dest.category == 'volcanes'
                  ? BitmapDescriptor.hueOrange
                  : dest.category == 'cascadas'
                      ? BitmapDescriptor.hueCyan
                      : BitmapDescriptor.hueYellow,
            ),
            zIndexInt: isSelected ? 2 : 1,
            onTap: () {
              setState(() {
                _selectedDestination = dest;
                _selectedBusiness = null;
              });
              _mapController?.animateCamera(
                CameraUpdate.newLatLngZoom(LatLng(dest.latitude, dest.longitude), 11.5),
              );
            },
          ),
        );
      }
    }

    // Marcadores de Negocios Campesinos
    if (showBusinesses) {
      for (final biz in CatalogData.localBusinesses) {
        final isSelected = _selectedBusiness?.id == biz.id;

        markers.add(
          Marker(
            markerId: MarkerId('biz_${biz.id}'),
            position: LatLng(biz.latitude, biz.longitude),
            infoWindow: InfoWindow(
              title: '${biz.icon} ${biz.name}',
              snippet: '${biz.category} • ${biz.department}',
            ),
            icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
            zIndexInt: isSelected ? 2 : 1,
            onTap: () {
              setState(() {
                _selectedBusiness = biz;
                _selectedDestination = null;
              });
              _mapController?.animateCamera(
                CameraUpdate.newLatLngZoom(LatLng(biz.latitude, biz.longitude), 12.0),
              );
            },
          ),
        );
      }
    }

    return markers;
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;
    final mapHeight = isDesktop ? 580.0 : 500.0;

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
              subtitle: 'Explora imágenes satelitales auténticas de Google Maps. Descubre senderos, volcanes activos y cooperativas campesinas georreferenciadas con precisión.',
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
                  'volcanes',
                  'cascadas',
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
                          filter == 'Todos' ? '🗺️ Todos los Pines' : filter == 'Negocios' ? '🏪 Negocios Campesinos' : filter.toUpperCase(),
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

            const SizedBox(height: 16),

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
                        // GOOGLE MAP WIDGET NATIVO
                        GoogleMap(
                          initialCameraPosition: const CameraPosition(
                            target: _nicaraguaCenter,
                            zoom: 7.2,
                          ),
                          mapType: _currentMapType,
                          style: _isDarkStyleApplied ? _darkMapStyleJson : null,
                          markers: _buildMarkers(),
                          onMapCreated: _onMapCreated,
                          myLocationEnabled: false,
                          myLocationButtonEnabled: false,
                          zoomControlsEnabled: false,
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
            if (_selectedDestination != null)
              _buildDestinationDetailCard(_selectedDestination!)
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

  Widget _buildBusinessDetailCard(LocalBusiness biz) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: AppGradients.cardGlass,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.6), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.35),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: const Color(0xFF082B35),
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFF10B981), width: 2),
                ),
                child: Center(
                  child: Text(biz.icon, style: const TextStyle(fontSize: 28)),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      biz.name,
                      style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${biz.category} • ${biz.department}',
                      style: const TextStyle(color: Color(0xFFD4AF37), fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(color: Colors.white12),
          const SizedBox(height: 10),

          // Ficha Completa del Negocio Campesino
          _buildInfoRow(Icons.person_outline_rounded, 'Propietario / Responsable', biz.ownerName),
          const SizedBox(height: 8),
          _buildInfoRow(Icons.location_on_outlined, 'Dirección', biz.address),
          const SizedBox(height: 8),
          _buildInfoRow(Icons.phone_outlined, 'Teléfono', biz.contact),
          const SizedBox(height: 8),
          _buildInfoRow(Icons.email_outlined, 'Correo', biz.email),
          const SizedBox(height: 8),
          _buildInfoRow(Icons.schedule_outlined, 'Horario', biz.schedule),

          const SizedBox(height: 18),

          // Botones de Contacto y Reserva Directa
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF25D366),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  icon: const Icon(Icons.chat_rounded, color: Colors.white, size: 18),
                  label: const Text('WhatsApp', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  onPressed: () => _launchWhatsApp(biz.whatsapp, biz.name),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0284C7),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  icon: const Icon(Icons.phone_rounded, color: Colors.white, size: 18),
                  label: const Text('Llamar', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  onPressed: () => _launchCall(biz.contact),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Botón de Reserva y Cuentas de Pago
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFC86432),
                padding: const EdgeInsets.symmetric(vertical: 13),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              icon: const Icon(Icons.account_balance_wallet_rounded, color: Colors.white, size: 18),
              label: const Text('Reservar Ruta & Ver Cuentas de Pago', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
              onPressed: () {
                final dest = CatalogData.destinations.firstWhere(
                  (d) => d.department.toLowerCase() == biz.department.toLowerCase(),
                  orElse: () => CatalogData.destinations.first,
                );
                _openCheckout(dest);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDestinationDetailCard(DestinationModel dest) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: AppGradients.cardGlass,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.5), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.35),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: Image.network(
                  dest.imageUrl,
                  width: 70,
                  height: 70,
                  fit: BoxFit.cover,
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
                      dest.title,
                      style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${dest.department} • Dificultad: ${dest.difficulty}',
                      style: const TextStyle(color: Color(0xFFD4AF37), fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '🧭 Guía asignado: ${dest.guideName}',
                      style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 11),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            dest.description,
            style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 12, height: 1.4),
          ),
          const SizedBox(height: 18),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Precio por Explorador', style: TextStyle(color: Colors.white54, fontSize: 10)),
                    Text(
                      '\$${dest.priceUsd.toStringAsFixed(0)} USD / C\$ ${dest.priceNio.toStringAsFixed(0)} NIO',
                      style: const TextStyle(color: Color(0xFFD4AF37), fontSize: 13, fontWeight: FontWeight.w900),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFC86432),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                icon: const Icon(Icons.calendar_today_rounded, color: Colors.white, size: 15),
                label: const Text('Reservar', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12.5)),
                onPressed: () => _openCheckout(dest),
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
