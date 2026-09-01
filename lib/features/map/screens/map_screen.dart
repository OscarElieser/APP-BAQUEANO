import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/models/destination_model.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/baqueano_button.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';
import '../../checkout/widgets/checkout_modal.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  String _selectedCategory = 'Todos';
  DestinationModel? _selectedDestination;
  double _zoomLevel = 1.0;

  @override
  void initState() {
    super.initState();
    _selectedDestination = CatalogData.destinations.first;
  }

  IconData _getCategoryIcon(String category) {
    switch (category.toLowerCase()) {
      case 'volcanes':
        return Icons.volcano;
      case 'cascadas':
        return Icons.water_drop;
      case 'playas':
        return Icons.beach_access;
      case 'lodges':
        return Icons.nature_people;
      default:
        return Icons.location_on;
    }
  }

  Color _getCategoryColor(String category) {
    switch (category.toLowerCase()) {
      case 'volcanes':
        return AppColors.terracotta;
      case 'cascadas':
        return AppColors.craterTeal;
      case 'playas':
        return AppColors.gold;
      case 'lodges':
        return AppColors.jungleGreenLight;
      default:
        return AppColors.terracottaLight;
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    final filteredDestinations = _selectedCategory == 'Todos'
        ? CatalogData.destinations
        : CatalogData.destinations.where((d) => d.category.toLowerCase() == _selectedCategory.toLowerCase()).toList();

    return ResponsiveScaffold(
      currentIndex: 2,
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
              tag: 'GEOLOCALIZACIÓN SATELITAL',
              title: '🌍 Mapa Interactivo de Nicaragua',
              subtitle: 'Explora los senderos, volcanes y refugios georreferenciados. Toca cada pin para ver detalles y guías asignados.',
            ),
            const SizedBox(height: 14),

            // Category Filter Chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: ['Todos', 'volcanes', 'cascadas', 'playas', 'lodges', 'colonial'].map((cat) {
                  final isSelected = _selectedCategory == cat;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: InkWell(
                      onTap: () => setState(() => _selectedCategory = cat),
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.terracotta : AppColors.bgCard,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: isSelected ? AppColors.gold : AppColors.borderLight),
                        ),
                        child: Text(
                          cat == 'Todos' ? 'Todos los Pines' : cat.toUpperCase(),
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                            color: isSelected ? Colors.white : AppColors.textLight,
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 18),

            // MAP INTERACTIVE CANVAS
            Stack(
              children: [
                Container(
                  height: 440,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: const Color(0xFF071E26),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: AppColors.borderGold, width: 1.5),
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
                    child: Stack(
                      children: [
                        // Map Grid Lines & Background Pattern
                        Positioned.fill(
                          child: CustomPaint(
                            painter: _MapGridPainter(),
                          ),
                        ),

                        // Thematic Markers on Map
                        ...filteredDestinations.map((dest) {
                          // Compute approximate visual coordinate on the stylized Nicaragua Map
                          // Nicaragua lat ~11.0 to 14.5, lon ~-87.5 to -83.0
                          final double normX = ((-dest.longitude - 83.0) / (87.5 - 83.0)).clamp(0.1, 0.9);
                          final double normY = (1.0 - ((dest.latitude - 11.0) / (14.5 - 11.0))).clamp(0.1, 0.9);

                          final isSelected = _selectedDestination?.id == dest.id;

                          return Positioned(
                            left: (normX * (isDesktop ? 800 : 320)) + (isDesktop ? 60 : 20),
                            top: normY * 340 + 20,
                            child: GestureDetector(
                              onTap: () {
                                setState(() => _selectedDestination = dest);
                              },
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  AnimatedContainer(
                                    duration: const Duration(milliseconds: 200),
                                    padding: EdgeInsets.all(isSelected ? 10 : 8),
                                    decoration: BoxDecoration(
                                      color: _getCategoryColor(dest.category),
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: isSelected ? Colors.white : AppColors.gold,
                                        width: isSelected ? 2.5 : 1.2,
                                      ),
                                      boxShadow: [
                                        BoxShadow(
                                          color: _getCategoryColor(dest.category).withValues(alpha: 0.6),
                                          blurRadius: isSelected ? 16 : 8,
                                        ),
                                      ],
                                    ),
                                    child: Icon(
                                      _getCategoryIcon(dest.category),
                                      color: Colors.white,
                                      size: isSelected ? 20 : 16,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: AppColors.bgDark.withValues(alpha: 0.85),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      dest.title.split(' ').first,
                                      style: GoogleFonts.spaceGrotesk(
                                        fontSize: 9,
                                        fontWeight: FontWeight.w700,
                                        color: isSelected ? AppColors.goldLight : Colors.white,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }),

                        // Map Overlay Controls (Zoom & Legend)
                        Positioned(
                          top: 16,
                          right: 16,
                          child: Column(
                            children: [
                              Container(
                                decoration: BoxDecoration(
                                  color: AppColors.bgDark.withValues(alpha: 0.85),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: AppColors.borderLight),
                                ),
                                child: Column(
                                  children: [
                                    IconButton(
                                      icon: const Icon(Icons.add, color: AppColors.textLight, size: 20),
                                      onPressed: () => setState(() => _zoomLevel = (_zoomLevel + 0.2).clamp(1.0, 2.0)),
                                    ),
                                    const Divider(color: AppColors.borderLight, height: 1),
                                    IconButton(
                                      icon: const Icon(Icons.remove, color: AppColors.textLight, size: 20),
                                      onPressed: () => setState(() => _zoomLevel = (_zoomLevel - 0.2).clamp(1.0, 2.0)),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 8),
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: AppColors.bgDark.withValues(alpha: 0.85),
                                  shape: BoxShape.circle,
                                  border: Border.all(color: AppColors.gold),
                                ),
                                child: const Icon(Icons.my_location, color: AppColors.gold, size: 20),
                              ),
                            ],
                          ),
                        ),

                        // Watermark Indicator
                        Positioned(
                          bottom: 16,
                          left: 16,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.bgDark.withValues(alpha: 0.8),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: AppColors.borderLight),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.success),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  'GPS Baqueano Activo (Nicaragua)',
                                  style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.textLight),
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

            const SizedBox(height: 20),

            // SELECTED PIN POPUP CARD
            if (_selectedDestination != null) ...[
              GlassContainer(
                padding: const EdgeInsets.all(20),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.gold, width: 1.2),
                child: isDesktop
                    ? Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(16),
                            child: Image.network(
                              _selectedDestination!.imageUrl,
                              width: 140,
                              height: 110,
                              fit: BoxFit.cover,
                            ),
                          ),
                          const SizedBox(width: 20),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: AppColors.terracotta,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        _selectedDestination!.department.toUpperCase(),
                                        style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.white),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    const Icon(Icons.star, color: AppColors.gold, size: 14),
                                    const SizedBox(width: 4),
                                    Text('${_selectedDestination!.rating}', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white)),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  _selectedDestination!.title,
                                  style: GoogleFonts.montserrat(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textLight),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  _selectedDestination!.description,
                                  style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 20),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                '\$${_selectedDestination!.priceUsd.toInt()} USD',
                                style: GoogleFonts.montserrat(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.gold),
                              ),
                              Text(
                                'C\$ ${_selectedDestination!.priceNio.toInt()} NIO',
                                style: GoogleFonts.spaceGrotesk(fontSize: 11, color: AppColors.textMuted),
                              ),
                              const SizedBox(height: 10),
                              BaqueanoButton(
                                text: 'Reservar',
                                variant: BaqueanoButtonVariant.primary,
                                height: 40,
                                onPressed: () => CheckoutModal.show(context, _selectedDestination!),
                              ),
                            ],
                          ),
                        ],
                      )
                    : Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: Image.network(
                                  _selectedDestination!.imageUrl,
                                  width: 80,
                                  height: 70,
                                  fit: BoxFit.cover,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      _selectedDestination!.department.toUpperCase(),
                                      style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.terracottaLight),
                                    ),
                                    Text(
                                      _selectedDestination!.title,
                                      style: GoogleFonts.montserrat(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.textLight),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    Row(
                                      children: [
                                        const Icon(Icons.star, color: AppColors.gold, size: 12),
                                        const SizedBox(width: 4),
                                        Text('${_selectedDestination!.rating}', style: GoogleFonts.spaceGrotesk(fontSize: 11, color: Colors.white, fontWeight: FontWeight.w700)),
                                        const SizedBox(width: 8),
                                        Text('· ${_selectedDestination!.duration}', style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted)),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '\$${_selectedDestination!.priceUsd.toInt()} USD / C\$${_selectedDestination!.priceNio.toInt()}',
                                style: GoogleFonts.montserrat(fontSize: 14, fontWeight: FontWeight.w900, color: AppColors.gold),
                              ),
                              BaqueanoButton(
                                text: 'Ver Detalles / Reservar',
                                variant: BaqueanoButtonVariant.primary,
                                height: 36,
                                padding: const EdgeInsets.symmetric(horizontal: 14),
                                onPressed: () => CheckoutModal.show(context, _selectedDestination!),
                              ),
                            ],
                          ),
                        ],
                      ),
              ),
            ],

            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }
}

class _MapGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.borderLight.withValues(alpha: 0.08)
      ..strokeWidth = 1.0;

    const step = 40.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }

    // Topographic contours
    final contourPaint = Paint()
      ..color = AppColors.craterTeal.withValues(alpha: 0.12)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    final path = Path();
    path.moveTo(size.width * 0.1, size.height * 0.4);
    path.quadraticBezierTo(size.width * 0.3, size.height * 0.2, size.width * 0.6, size.height * 0.5);
    path.quadraticBezierTo(size.width * 0.8, size.height * 0.7, size.width * 0.9, size.height * 0.3);
    canvas.drawPath(path, contourPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
