// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — DIRECTORIO NACIONAL DE NICARAGUA (DESCUBRE NICARAGUA)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Servir como el portal geográfico y directorio integral de Nicaragua para
//   exploradores, turistas y ciudadanos locales en los 15 departamentos y
//   2 regiones autónomas del país.
// - Conectar lugares patrimoniales, comercios justos, atractivos ecoturísticos
//   y servicios de emergencia críticos (Policía, Bomberos, Cruz Blanca, Hospitales)
//   en una sola experiencia cartográfica fluida sin intermediarios.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `ConsumerStatefulWidget` con integración interactiva de `GoogleMap`.
// - Geolocalización con `GeoLocationService` para ordenar "Cerca de ti".
// - Filtrado multicriterio combinable (Categoría, Departamento, Municipio,
//   Emergencias, Verificados y búsqueda de texto en tiempo real).
// - Tarjeta flotante interactiva al tocar marcadores del mapa.
// - Acceso directo de alta prioridad a emergencias nacionales (118, 115, 128).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & PANTALLA EXPUESTA):
// - `NationalDirectoryScreen`: Pantalla oficial mapeada en la ruta `/descubre-nicaragua`.
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
import '../../../core/widgets/section_header.dart';
import '../models/category_model.dart';
import '../models/department_model.dart';
import '../models/municipality_model.dart';
import '../models/place_model.dart';
import '../services/categories_service.dart';
import '../services/geo_location_service.dart';
import '../services/places_service.dart';
import 'place_detail_screen.dart';

class NationalDirectoryScreen extends ConsumerStatefulWidget {
  const NationalDirectoryScreen({super.key});

  @override
  ConsumerState<NationalDirectoryScreen> createState() => _NationalDirectoryScreenState();
}

class _NationalDirectoryScreenState extends ConsumerState<NationalDirectoryScreen> {
  GoogleMapController? _mapController;

  // Centro de Nicaragua por defecto
  static const LatLng _nicaraguaCenter = LatLng(12.8654, -85.2072);

  final TextEditingController _searchController = TextEditingController();

  List<PlaceModel> _places = [];
  List<PlaceModel> _emergencyPlaces = [];
  List<CategoryModel> _categories = [];
  List<DepartmentModel> _departments = [];
  List<MunicipalityModel> _municipalities = [];

  bool _isLoading = true;
  bool _isLocating = false;
  double? _userLat;
  double? _userLng;

  // Filtros activos
  String? _selectedCategory; // null = Todas
  String? _selectedDepartment; // null = Todos
  String? _selectedMunicipality; // null = Todos
  bool _filterEmergenciesOnly = false;
  bool _filterVerifiedOnly = false;
  bool _showMapView = true;

  PlaceModel? _selectedMarkerPlace;
  Set<Marker> _markers = {};

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadInitialData() async {
    setState(() => _isLoading = true);

    final catService = ref.read(categoriesServiceProvider);

    _categories = await catService.getCategories();
    _departments = await catService.getDepartments();
    _municipalities = await catService.getMunicipalities();

    // Intentar obtener ubicación inicial del usuario
    await _fetchUserLocation(silent: true);

    await _applyFilters();
  }

  Future<void> _fetchUserLocation({bool silent = false}) async {
    if (!silent) {
      setState(() => _isLocating = true);
      HapticFeedback.selectionClick();
    }

    final geoService = ref.read(geoLocationServiceProvider);
    final pos = await geoService.getCurrentPosition();

    if (pos != null) {
      _userLat = pos.latitude;
      _userLng = pos.longitude;

      if (_mapController != null) {
        _mapController!.animateCamera(
          CameraUpdate.newLatLngZoom(LatLng(pos.latitude, pos.longitude), 13),
        );
      }

      if (!silent && mounted) {
        CustomToast.show(context, message: '✓ Ubicación GPS actualizada');
      }
    } else if (!silent && mounted) {
      CustomToast.show(context, message: 'No se pudo obtener el GPS. Mostrando todo el país.');
    }

    if (mounted) setState(() => _isLocating = false);
  }

  Future<void> _applyFilters() async {
    final placesService = ref.read(placesServiceProvider);

    final filtered = await placesService.getPlaces(
      searchQuery: _searchController.text,
      categoryId: _selectedCategory,
      departmentId: _selectedDepartment,
      municipalityId: _selectedMunicipality,
      isEmergency: _filterEmergenciesOnly ? true : null,
      verifiedOnly: _filterVerifiedOnly ? true : null,
      userLat: _userLat,
      userLng: _userLng,
      limit: 80,
    );

    _emergencyPlaces = await placesService.getEmergencyServices(
      userLat: _userLat,
      userLng: _userLng,
    );

    _places = filtered;
    _updateMapMarkers();

    if (mounted) setState(() => _isLoading = false);
  }

  void _updateMapMarkers() {
    final newMarkers = <Marker>{};

    for (final place in _places) {
      final isSelected = _selectedMarkerPlace?.placeId == place.placeId;

      newMarkers.add(
        Marker(
          markerId: MarkerId(place.placeId),
          position: LatLng(place.latitude, place.longitude),
          zIndexInt: isSelected ? 3 : 1,
          icon: place.isEmergency
              ? BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed)
              : place.isTourist
                  ? BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange)
                  : BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueCyan),
          infoWindow: InfoWindow(
            title: place.name,
            snippet: '${place.categoryName} • ${place.municipalityName}',
            onTap: () => _openPlaceDetails(place),
          ),
          onTap: () {
            HapticFeedback.selectionClick();
            setState(() => _selectedMarkerPlace = place);
          },
        ),
      );
    }

    _markers = newMarkers;
  }

  void _openPlaceDetails(PlaceModel place) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => PlaceDetailScreen(
          placeId: place.placeId,
          preloadedPlace: place,
        ),
      ),
    );
  }

  Future<void> _callEmergencyNumber(String number) async {
    HapticFeedback.mediumImpact();
    final uri = Uri.parse('tel:$number');
    try {
      await launchUrl(uri);
    } catch (_) {
      if (mounted) CustomToast.show(context, message: 'No se pudo iniciar la llamada de auxilio');
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    return ResponsiveScaffold(
      currentIndex: 1, // Pestaña de Explorar / Descubrir
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.symmetric(
          horizontal: isDesktop ? 48.0 : 16.0,
          vertical: 20.0,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Encabezado Oficial
            const SectionHeader(
              tag: 'DIRECTORIO NACIONAL DE NICARAGUA',
              title: '🇳🇮 Descubre Nicaragua',
              subtitle: 'Encuentra lugares, servicios y experiencias cerca de ti en los 15 departamentos y 2 regiones autónomas.',
              isCentered: false,
            ),
            const SizedBox(height: 18),

            // SECCIÓN DESTACADA: EMERGENCIAS Y SEGURIDAD NACIONAL
            _buildEmergencyFastAccessBar(),
            const SizedBox(height: 20),

            // Barra de Búsqueda y Botón GPS
            Row(
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: AppColors.primaryDark.withValues(alpha: 0.8),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: TextField(
                      controller: _searchController,
                      style: GoogleFonts.inter(fontSize: 13.5, color: Colors.white),
                      onChanged: (_) => _applyFilters(),
                      decoration: InputDecoration(
                        hintText: 'Buscar museos, hospitales, bomberos, bancos...',
                        hintStyle: GoogleFonts.inter(fontSize: 12.5, color: Colors.white54),
                        prefixIcon: const Icon(Icons.search_rounded, color: AppColors.goldLight, size: 20),
                        suffixIcon: _searchController.text.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear_rounded, size: 18, color: Colors.white60),
                                onPressed: () {
                                  _searchController.clear();
                                  _applyFilters();
                                },
                              )
                            : null,
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),

                // Botón GPS "Mi Ubicación"
                InkWell(
                  onTap: _isLocating ? null : () => _fetchUserLocation(),
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    height: 48,
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      color: _userLat != null
                          ? AppColors.jungleGreenLight.withValues(alpha: 0.2)
                          : AppColors.primaryDark.withValues(alpha: 0.8),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: _userLat != null ? AppColors.jungleGreenLight : AppColors.gold,
                        width: 1.0,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.my_location_rounded,
                          size: 18,
                          color: _userLat != null ? AppColors.jungleGreenLight : AppColors.goldLight,
                        ),
                        if (isDesktop) ...[
                          const SizedBox(width: 6),
                          Text(
                            _isLocating ? 'Buscando...' : 'Cerca de Mí',
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Selector de Filtros Rápidos (Departamentos & Categorías)
            _buildFilterSelectors(),
            const SizedBox(height: 16),

            // Conmutador de Vista: Mapa Interactivo / Lista
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${_places.length} LUGARES ENCONTRADOS',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.1,
                    color: AppColors.goldLight,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(3),
                  decoration: BoxDecoration(
                    color: AppColors.primaryDark,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _buildViewToggle(Icons.map_rounded, 'Mapa', _showMapView, () {
                        setState(() => _showMapView = true);
                      }),
                      _buildViewToggle(Icons.view_list_rounded, 'Lista', !_showMapView, () {
                        setState(() => _showMapView = false);
                      }),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            if (_isLoading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(40.0),
                  child: CircularProgressIndicator(color: AppColors.gold),
                ),
              )
            else ...[
              // Contenido Principal (Mapa o Lista)
              if (_showMapView) ...[
                _buildMapSection(),
                if (_selectedMarkerPlace != null) ...[
                  const SizedBox(height: 12),
                  _buildSelectedMarkerCard(_selectedMarkerPlace!),
                ],
              ],

              const SizedBox(height: 24),

              // Lista "Cerca de ti" y explorador
              Text(
                _userLat != null ? '📍 LUGARES & SERVICIOS CERCA DE TI' : '📍 CATÁLOGO GENERAL DE LUGARES',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.1,
                  color: AppColors.goldLight,
                ),
              ),
              const SizedBox(height: 12),

              _buildPlacesList(),
            ],
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  // --- BARRA DE ACCESO RÁPIDO A EMERGENCIAS ---
  Widget _buildEmergencyFastAccessBar() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primaryDark.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.error.withValues(alpha: 0.6), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: AppColors.error.withValues(alpha: 0.15),
            blurRadius: 18,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.shield_rounded, color: AppColors.error, size: 20),
              const SizedBox(width: 8),
              Text(
                'SERVICIOS DE EMERGENCIA 24/7 EN NICARAGUA',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.1,
                  color: AppColors.error,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'Líneas de auxilio y rescate inmediato oficiales a nivel nacional:',
            style: GoogleFonts.inter(fontSize: 11.5, color: Colors.white70),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _buildEmergencyDialChip('🚓 Policía Nacional', '118', AppColors.primaryLight),
              _buildEmergencyDialChip('🚒 Bomberos', '115', AppColors.terracotta),
              _buildEmergencyDialChip('🚑 Cruz Blanca', '128', AppColors.error),
              _buildEmergencyDialChip('🏥 Hospital Militar', '2298-0100', AppColors.primary),
            ],
          ),
          if (_emergencyPlaces.isNotEmpty && _userLat != null) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.near_me_rounded, color: AppColors.jungleGreenLight, size: 14),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    'Más cercano: ${_emergencyPlaces.first.name} (${_emergencyPlaces.first.formattedDistance})',
                    style: GoogleFonts.inter(fontSize: 10.5, color: AppColors.jungleGreenLight),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildEmergencyDialChip(String title, String number, Color color) {
    return InkWell(
      onTap: () => _callEmergencyNumber(number),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.25),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.7), width: 0.8),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              title,
              style: GoogleFonts.inter(
                fontSize: 11.5,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                number,
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // --- FILTROS RÁPIDOS ---
  Widget _buildFilterSelectors() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Row(
        children: [
          // Filtro de Solo Emergencias
          FilterChip(
            label: Text(
              '🚨 Emergencias',
              style: GoogleFonts.spaceGrotesk(
                fontSize: 11.5,
                fontWeight: FontWeight.w700,
                color: _filterEmergenciesOnly ? Colors.white : AppColors.error,
              ),
            ),
            selected: _filterEmergenciesOnly,
            selectedColor: AppColors.error,
            backgroundColor: AppColors.primaryDark,
            checkmarkColor: Colors.white,
            side: BorderSide(color: AppColors.error.withValues(alpha: 0.6)),
            onSelected: (val) {
              setState(() => _filterEmergenciesOnly = val);
              _applyFilters();
            },
          ),
          const SizedBox(width: 8),

          // Filtro de Verificados
          FilterChip(
            label: Text(
              '✓ Verificados',
              style: GoogleFonts.spaceGrotesk(
                fontSize: 11.5,
                fontWeight: FontWeight.w700,
                color: _filterVerifiedOnly ? Colors.white : AppColors.jungleGreenLight,
              ),
            ),
            selected: _filterVerifiedOnly,
            selectedColor: AppColors.jungleGreenLight,
            backgroundColor: AppColors.primaryDark,
            checkmarkColor: Colors.white,
            side: BorderSide(color: AppColors.jungleGreenLight.withValues(alpha: 0.6)),
            onSelected: (val) {
              setState(() => _filterVerifiedOnly = val);
              _applyFilters();
            },
          ),
          const SizedBox(width: 8),

          // Selector de Departamento
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            decoration: BoxDecoration(
              color: AppColors.primaryDark,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _selectedDepartment,
                hint: Text(
                  'Todos los Departamentos',
                  style: GoogleFonts.inter(fontSize: 11.5, color: Colors.white70),
                ),
                dropdownColor: AppColors.bgDark,
                style: GoogleFonts.inter(fontSize: 11.5, color: Colors.white),
                icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.goldLight, size: 18),
                items: [
                  const DropdownMenuItem(
                    value: null,
                    child: Text('Todos los Departamentos'),
                  ),
                  ..._departments.map((d) => DropdownMenuItem(
                        value: d.id,
                        child: Text('${d.name} (${d.zone})'),
                      )),
                ],
                onChanged: (val) {
                  setState(() {
                    _selectedDepartment = val;
                    _selectedMunicipality = null; // Reiniciar municipio al cambiar depto
                  });
                  _applyFilters();
                },
              ),
            ),
          ),
          if (_selectedDepartment != null) ...[
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              decoration: BoxDecoration(
                color: AppColors.primaryDark,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.gold.withValues(alpha: 0.6)),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedMunicipality,
                  hint: Text(
                    'Todos los Municipios',
                    style: GoogleFonts.inter(fontSize: 11.5, color: Colors.white70),
                  ),
                  dropdownColor: AppColors.bgDark,
                  style: GoogleFonts.inter(fontSize: 11.5, color: Colors.white),
                  icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.goldLight, size: 18),
                  items: [
                    const DropdownMenuItem(
                      value: null,
                      child: Text('Todos los Municipios'),
                    ),
                    ..._municipalities
                        .where((m) => m.departmentId.toLowerCase() == _selectedDepartment!.toLowerCase())
                        .map((m) => DropdownMenuItem(
                              value: m.id,
                              child: Text(m.name),
                            )),
                  ],
                  onChanged: (val) {
                    setState(() => _selectedMunicipality = val);
                    _applyFilters();
                  },
                ),
              ),
            ),
          ],
          const SizedBox(width: 8),

          // Selector de Categoría
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            decoration: BoxDecoration(
              color: AppColors.primaryDark,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _selectedCategory,
                hint: Text(
                  'Todas las Categorías',
                  style: GoogleFonts.inter(fontSize: 11.5, color: Colors.white70),
                ),
                dropdownColor: AppColors.bgDark,
                style: GoogleFonts.inter(fontSize: 11.5, color: Colors.white),
                icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.goldLight, size: 18),
                items: [
                  const DropdownMenuItem(
                    value: null,
                    child: Text('Todas las Categorías'),
                  ),
                  ..._categories.map((c) => DropdownMenuItem(
                        value: c.categoryId,
                        child: Text(c.name),
                      )),
                ],
                onChanged: (val) {
                  setState(() => _selectedCategory = val);
                  _applyFilters();
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildViewToggle(IconData icon, String label, bool isSelected, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.gold : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 15,
              color: isSelected ? const Color(0xFF041920) : Colors.white60,
            ),
            const SizedBox(width: 4),
            Text(
              label,
              style: GoogleFonts.spaceGrotesk(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                color: isSelected ? const Color(0xFF041920) : Colors.white60,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // --- SECCIÓN DE MAPA ---
  Widget _buildMapSection() {
    return Container(
      height: 380,
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.gold.withValues(alpha: 0.4), width: 1.4),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.4),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: GoogleMap(
          initialCameraPosition: CameraPosition(
            target: _userLat != null ? LatLng(_userLat!, _userLng!) : _nicaraguaCenter,
            zoom: _userLat != null ? 12.0 : 7.2,
          ),
          markers: _markers,
          myLocationEnabled: true,
          myLocationButtonEnabled: false,
          zoomControlsEnabled: true,
          onMapCreated: (controller) {
            _mapController = controller;
          },
        ),
      ),
    );
  }

  // --- TARJETA FLOTANTE INFERIOR DE MARCADOR SELECCIONADO ---
  Widget _buildSelectedMarkerCard(PlaceModel place) {
    return GlassContainer(
      padding: const EdgeInsets.all(16),
      borderRadius: BorderRadius.circular(20),
      border: Border.all(color: AppColors.gold, width: 1.2),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(14),
            child: Container(
              width: 70,
              height: 70,
              color: AppColors.primaryDark,
              child: place.imageUrl.isNotEmpty
                  ? Image.network(place.imageUrl, fit: BoxFit.cover)
                  : const Icon(Icons.place_rounded, color: AppColors.goldLight, size: 30),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: place.isEmergency
                            ? AppColors.error.withValues(alpha: 0.25)
                            : AppColors.primaryLight.withValues(alpha: 0.4),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        place.categoryName,
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 9.5,
                          fontWeight: FontWeight.w700,
                          color: place.isEmergency ? AppColors.error : AppColors.goldLight,
                        ),
                      ),
                    ),
                    if (place.distanceKm != null) ...[
                      const SizedBox(width: 6),
                      Text(
                        '• ${place.formattedDistance}',
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: AppColors.jungleGreenLight,
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  place.name,
                  style: GoogleFonts.montserrat(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  '${place.municipalityName}, ${place.departmentName}',
                  style: GoogleFonts.inter(fontSize: 11, color: Colors.white60),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    BaqueanoButton(
                      text: 'Ver detalles',
                      variant: BaqueanoButtonVariant.primary,
                      height: 32,
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      onPressed: () => _openPlaceDetails(place),
                    ),
                    const SizedBox(width: 8),
                    BaqueanoButton(
                      text: 'Cómo llegar',
                      variant: BaqueanoButtonVariant.outline,
                      height: 32,
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      onPressed: () {
                        final uri = Uri.parse(
                          'https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}',
                        );
                        launchUrl(uri, mode: LaunchMode.externalApplication);
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.close_rounded, color: Colors.white54, size: 20),
            onPressed: () => setState(() => _selectedMarkerPlace = null),
          ),
        ],
      ),
    );
  }

  // --- LISTA DE LUGARES ---
  Widget _buildPlacesList() {
    if (_places.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(30),
        alignment: Alignment.center,
        child: Column(
          children: [
            const Icon(Icons.search_off_rounded, size: 48, color: Colors.white38),
            const SizedBox(height: 12),
            Text(
              'No se encontraron lugares con los filtros seleccionados',
              style: GoogleFonts.inter(fontSize: 13, color: Colors.white70),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _places.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final place = _places[index];

        return InkWell(
          onTap: () => _openPlaceDetails(place),
          borderRadius: BorderRadius.circular(18),
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.primaryDark.withValues(alpha: 0.6),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: place.isEmergency
                    ? AppColors.error.withValues(alpha: 0.5)
                    : AppColors.borderLight,
              ),
            ),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    width: 60,
                    height: 60,
                    color: AppColors.primary,
                    child: place.imageUrl.isNotEmpty
                        ? Image.network(place.imageUrl, fit: BoxFit.cover)
                        : Icon(
                            place.isEmergency ? Icons.emergency_rounded : Icons.landscape_rounded,
                            color: place.isEmergency ? AppColors.error : AppColors.goldLight,
                            size: 26,
                          ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: (place.isEmergency ? AppColors.error : AppColors.primary)
                                  .withValues(alpha: 0.3),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              place.categoryName,
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 9.5,
                                fontWeight: FontWeight.w700,
                                color: place.isEmergency ? AppColors.error : AppColors.goldLight,
                              ),
                            ),
                          ),
                          if (place.verified) ...[
                            const SizedBox(width: 6),
                            const Icon(Icons.verified_rounded, size: 12, color: AppColors.jungleGreenLight),
                          ],
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        place.name,
                        style: GoogleFonts.montserrat(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        '${place.municipalityName}, ${place.departmentName}',
                        style: GoogleFonts.inter(fontSize: 11, color: Colors.white60),
                      ),
                    ],
                  ),
                ),
                if (place.distanceKm != null)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        place.formattedDistance,
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: AppColors.jungleGreenLight,
                        ),
                      ),
                      Text(
                        'distancia',
                        style: GoogleFonts.inter(fontSize: 9, color: Colors.white38),
                      ),
                    ],
                  ),
                const SizedBox(width: 4),
                const Icon(Icons.chevron_right_rounded, color: Colors.white38, size: 20),
              ],
            ),
          ),
        );
      },
    );
  }
}
