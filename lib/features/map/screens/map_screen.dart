// ============================================================================
// 🌍 MAPA GPS SATELITAL & GEOLOCALIZACIÓN DE RUTAS (MAP_SCREEN.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia de navegación geográfica completa e interactiva
//   donde los exploradores visualizan los pines exactos de volcanes, cañones,
//   cascadas y la red de negocios y familias campesinas aliadas en Nicaragua.
// - Facilitar el contacto directo vía WhatsApp, llamada y cálculo de ruta.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Renderizado interactivo con cálculo de coordenadas normalizadas sobre Nicaragua
//   (Lat: 11.0° - 14.8° N, Long: -87.8° - -83.0° O).
// - Pines temáticos diferenciados por categoría (Destinos vs Negocios Campesinos).
// - Tarjeta flotante interactiva con ficha técnica del propietario, dirección,
//   teléfono, WhatsApp directo y botón de reserva.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & VISTAS EXPUESTAS):
// - `MapScreen`: Pantalla del mapa satelital mapeada en la ruta `/mapa`.
// ============================================================================

import 'package:flutter/material.dart';
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
  String _selectedFilter = 'Todos'; // 'Todos', 'Destinos', 'Negocios', 'volcanes', 'cascadas'
  DestinationModel? _selectedDestination;
  LocalBusiness? _selectedBusiness;
  double _zoomLevel = 1.0;
  bool _isSatelliteMode = true;

  @override
  void initState() {
    super.initState();
    _selectedDestination = CatalogData.destinations.first;
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

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    // Filtrado de destinos
    final showDestinations = _selectedFilter == 'Todos' ||
        _selectedFilter == 'Destinos' ||
        _selectedFilter == 'volcanes' ||
        _selectedFilter == 'cascadas';

    // Filtrado de negocios
    final showBusinesses = _selectedFilter == 'Todos' ||
        _selectedFilter == 'Negocios';

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
              tag: 'GEOLOCALIZACIÓN SATELITAL',
              title: '🌍 Mapa Interactivo de Nicaragua',
              subtitle: 'Explora los senderos, volcanes activos y negocios campesinos geolocalizados con pines exactos. Toca cada pin para ver ficha y contacto directo.',
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

            const SizedBox(height: 18),

            // ----------------------------------------------------------------
            // CANVAS DEL MAPA INTERACTIVO CON PINES GEORREFERENCIADOS
            // ----------------------------------------------------------------
            Stack(
              children: [
                Container(
                  height: 480,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: _isSatelliteMode ? const Color(0xFF051B22) : const Color(0xFF0B212D),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: const Color(0xFFD4AF37).withValues(alpha: 0.5),
                      width: 1.5,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.45),
                        blurRadius: 22,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(24),
                    child: Stack(
                      children: [
                        // Cuadrícula y textura geográfica
                        Positioned.fill(
                          child: CustomPaint(
                            painter: _NicaraguaMapPainter(isSatellite: _isSatelliteMode),
                          ),
                        ),

                        // PINES DE DESTINOS TURÍSTICOS
                        if (showDestinations)
                          ...CatalogData.destinations.map((dest) {
                            final double normX = ((-dest.longitude - 83.0) / (87.5 - 83.0)).clamp(0.08, 0.92);
                            final double normY = (1.0 - ((dest.latitude - 11.0) / (14.5 - 11.0))).clamp(0.08, 0.92);

                            final isSelected = _selectedDestination?.id == dest.id;

                            return Positioned(
                              left: (normX * (isDesktop ? 780 : 310)) + (isDesktop ? 60 : 15),
                              top: normY * 360 + 20,
                              child: GestureDetector(
                                onTap: () {
                                  setState(() {
                                    _selectedDestination = dest;
                                    _selectedBusiness = null;
                                  });
                                },
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    AnimatedContainer(
                                      duration: const Duration(milliseconds: 200),
                                      padding: EdgeInsets.all(isSelected ? 9 : 7),
                                      decoration: BoxDecoration(
                                        color: dest.category == 'volcanes'
                                            ? const Color(0xFFC86432)
                                            : dest.category == 'cascadas'
                                                ? const Color(0xFF0284C7)
                                                : const Color(0xFFD4AF37),
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                          color: isSelected ? Colors.white : const Color(0xFFD4AF37),
                                          width: isSelected ? 2.5 : 1.2,
                                        ),
                                        boxShadow: [
                                          BoxShadow(
                                            color: (dest.category == 'volcanes' ? const Color(0xFFC86432) : const Color(0xFF0284C7))
                                                .withValues(alpha: isSelected ? 0.8 : 0.4),
                                            blurRadius: isSelected ? 14 : 6,
                                          ),
                                        ],
                                      ),
                                      child: Icon(
                                        dest.category == 'volcanes'
                                            ? Icons.volcano_rounded
                                            : dest.category == 'cascadas'
                                                ? Icons.water_drop_rounded
                                                : Icons.landscape_rounded,
                                        color: Colors.white,
                                        size: isSelected ? 18 : 14,
                                      ),
                                    ),
                                    const SizedBox(height: 3),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF082B35).withValues(alpha: 0.9),
                                        borderRadius: BorderRadius.circular(6),
                                        border: Border.all(color: Colors.white12),
                                      ),
                                      child: Text(
                                        dest.title.split(' ').first,
                                        style: TextStyle(
                                          fontSize: 9,
                                          fontWeight: FontWeight.w700,
                                          color: isSelected ? const Color(0xFFD4AF37) : Colors.white,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          }),

                        // PINES DE NEGOCIOS CAMPESINOS LOCALES
                        if (showBusinesses)
                          ...CatalogData.localBusinesses.map((biz) {
                            final double normX = ((-biz.longitude - 83.0) / (87.5 - 83.0)).clamp(0.08, 0.92);
                            final double normY = (1.0 - ((biz.latitude - 11.0) / (14.5 - 11.0))).clamp(0.08, 0.92);

                            final isSelected = _selectedBusiness?.id == biz.id;

                            return Positioned(
                              left: (normX * (isDesktop ? 780 : 310)) + (isDesktop ? 60 : 15),
                              top: normY * 360 + 20,
                              child: GestureDetector(
                                onTap: () {
                                  setState(() {
                                    _selectedBusiness = biz;
                                    _selectedDestination = null;
                                  });
                                },
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    AnimatedContainer(
                                      duration: const Duration(milliseconds: 200),
                                      padding: EdgeInsets.all(isSelected ? 9 : 7),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF10B981),
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                          color: isSelected ? Colors.white : const Color(0xFFD4AF37),
                                          width: isSelected ? 2.5 : 1.2,
                                        ),
                                        boxShadow: [
                                          BoxShadow(
                                            color: const Color(0xFF10B981).withValues(alpha: isSelected ? 0.8 : 0.4),
                                            blurRadius: isSelected ? 14 : 6,
                                          ),
                                        ],
                                      ),
                                      child: Text(biz.icon, style: const TextStyle(fontSize: 14)),
                                    ),
                                    const SizedBox(height: 3),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF041920).withValues(alpha: 0.9),
                                        borderRadius: BorderRadius.circular(6),
                                        border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                                      ),
                                      child: Text(
                                        biz.name.split(' ').first,
                                        style: TextStyle(
                                          fontSize: 9,
                                          fontWeight: FontWeight.w700,
                                          color: isSelected ? const Color(0xFF10B981) : Colors.white70,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          }),

                        // Controles del Mapa (Satelital, Zoom y Posición)
                        Positioned(
                          top: 16,
                          right: 16,
                          child: Column(
                            children: [
                              // Toggle Modo Satelital / Vectorial
                              InkWell(
                                onTap: () => setState(() => _isSatelliteMode = !_isSatelliteMode),
                                borderRadius: BorderRadius.circular(12),
                                child: Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF082B35).withValues(alpha: 0.9),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: const Color(0xFFD4AF37)),
                                  ),
                                  child: Icon(
                                    _isSatelliteMode ? Icons.satellite_alt_rounded : Icons.layers_rounded,
                                    color: const Color(0xFFD4AF37),
                                    size: 20,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 8),

                              // Zoom In / Out
                              Container(
                                decoration: BoxDecoration(
                                  color: const Color(0xFF082B35).withValues(alpha: 0.9),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: Colors.white24),
                                ),
                                child: Column(
                                  children: [
                                    IconButton(
                                      icon: const Icon(Icons.add_rounded, color: Colors.white, size: 20),
                                      onPressed: () => setState(() => _zoomLevel = (_zoomLevel + 0.2).clamp(1.0, 2.0)),
                                    ),
                                    const Divider(color: Colors.white12, height: 1),
                                    IconButton(
                                      icon: const Icon(Icons.remove_rounded, color: Colors.white, size: 20),
                                      onPressed: () => setState(() => _zoomLevel = (_zoomLevel - 0.2).clamp(1.0, 2.0)),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Leyenda en esquina inferior
                        Positioned(
                          bottom: 16,
                          left: 16,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: const Color(0xFF082B35).withValues(alpha: 0.9),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.4)),
                            ),
                            child: const Row(
                              children: [
                                Icon(Icons.gps_fixed_rounded, color: Color(0xFFD4AF37), size: 14),
                                SizedBox(width: 6),
                                Text(
                                  'GPS Nicaragua • Red Baqueano',
                                  style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
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

            const SizedBox(height: 24),

            // ----------------------------------------------------------------
            // TARJETA DE DETALLE DEL PIN SELECCIONADO (DESTINO O NEGOCIO)
            // ----------------------------------------------------------------
            if (_selectedBusiness != null)
              _buildBusinessDetailCard(_selectedBusiness!)
            else if (_selectedDestination != null)
              _buildDestinationDetailCard(_selectedDestination!),

            const SizedBox(height: 36),
          ],
        ),
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
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF10B981)),
                ),
                child: Text(biz.icon, style: const TextStyle(fontSize: 28)),
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

          // Ficha Completa del Negocio
          _buildInfoRow(Icons.person_outline_rounded, 'Propietario / Gerente', biz.ownerName),
          const SizedBox(height: 8),
          _buildInfoRow(Icons.location_on_outlined, 'Dirección', biz.address),
          const SizedBox(height: 8),
          _buildInfoRow(Icons.phone_outlined, 'Teléfono', biz.contact),
          const SizedBox(height: 8),
          _buildInfoRow(Icons.email_outlined, 'Correo', biz.email),
          const SizedBox(height: 8),
          _buildInfoRow(Icons.schedule_outlined, 'Horario', biz.schedule),

          const SizedBox(height: 18),

          // Botones de Contacto
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
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Precio por Explorador', style: TextStyle(color: Colors.white54, fontSize: 10)),
                  Text(
                    '\$${dest.priceUsd.toStringAsFixed(0)} USD / C\$ ${dest.priceNio.toStringAsFixed(0)} NIO',
                    style: const TextStyle(color: Color(0xFFD4AF37), fontSize: 14, fontWeight: FontWeight.w900),
                  ),
                ],
              ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFC86432),
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                icon: const Icon(Icons.calendar_today_rounded, color: Colors.white, size: 16),
                label: const Text('Reservar Ruta', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                onPressed: () {
                  showModalBottomSheet(
                    context: context,
                    isScrollControlled: true,
                    backgroundColor: Colors.transparent,
                    builder: (ctx) => CheckoutModal(destination: dest),
                  );
                },
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

class _NicaraguaMapPainter extends CustomPainter {
  final bool isSatellite;

  _NicaraguaMapPainter({required this.isSatellite});

  @override
  void paint(Canvas canvas, Size size) {
    final bgPaint = Paint()
      ..color = isSatellite ? const Color(0xFF041920) : const Color(0xFF072430)
      ..style = PaintingStyle.fill;

    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), bgPaint);

    final linePaint = Paint()
      ..color = Colors.white.withValues(alpha: isSatellite ? 0.04 : 0.08)
      ..strokeWidth = 1.0;

    for (double i = 0; i < size.width; i += 35) {
      canvas.drawLine(Offset(i, 0), Offset(i, size.height), linePaint);
    }
    for (double i = 0; i < size.height; i += 35) {
      canvas.drawLine(Offset(0, i), Offset(size.width, i), linePaint);
    }

    // Dibujar siluetas esquemáticas de Lago Cocibolca y Xolotlán
    final lakePaint = Paint()
      ..color = const Color(0xFF0284C7).withValues(alpha: isSatellite ? 0.25 : 0.4)
      ..style = PaintingStyle.fill;

    // Lago Xolotlán (Managua)
    canvas.drawOval(
      Rect.fromCenter(
        center: Offset(size.width * 0.35, size.height * 0.52),
        width: size.width * 0.16,
        height: size.height * 0.12,
      ),
      lakePaint,
    );

    // Lago Cocibolca (Nicaragua / Ometepe)
    canvas.drawOval(
      Rect.fromCenter(
        center: Offset(size.width * 0.58, size.height * 0.72),
        width: size.width * 0.32,
        height: size.height * 0.24,
      ),
      lakePaint,
    );
  }

  @override
  bool shouldRepaint(covariant _NicaraguaMapPainter oldDelegate) =>
      oldDelegate.isSatellite != isSatellite;
}
