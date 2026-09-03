// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — EXPLORADOR DE DEPARTAMENTOS Y REGIONES AUTÓNOMAS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Permitir al usuario recorrer la división territorial completa de Nicaragua
//   (15 departamentos y 2 regiones autónomas) conociendo sus cabeceras, población,
//   gastronomía, personajes ilustres, sitios turísticos y artesanías.
// - Conectar cada territorio con las rutas turísticas activas del catálogo Baqueano.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Rejilla adaptativa con `GridView.builder` que muestra tarjetas territoriales.
// - Diálogo modal detallado `_showDepartmentDetails` que despliega la ficha completa
//   con fotografías, datos geográficos y botón directo de expedición.
//
// 📦 3. QUÉ (WHAT / WIDGET EXPUESTO):
// - `DepartmentsExplorerGrid`: Rejilla interactiva de los 17 territorios.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../models/country_history_models.dart';

class DepartmentsExplorerGrid extends StatelessWidget {
  final List<CountryDepartment> departments;

  const DepartmentsExplorerGrid({super.key, required this.departments});

  void _showDepartmentDetails(BuildContext context, CountryDepartment dept) {
    HapticFeedback.mediumImpact();

    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF082B35),
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.85,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (_, scrollController) => ListView(
          controller: scrollController,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          children: [
            Center(
              child: Container(
                width: 44,
                height: 4,
                decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 16),

            // Cabecera con Imagen y Nombre
            ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Image.network(
                dept.imageUrl,
                height: 180,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  height: 180,
                  color: AppColors.primaryLight,
                  child: const Center(child: Icon(Icons.map_rounded, size: 48, color: AppColors.gold)),
                ),
              ),
            ),
            const SizedBox(height: 16),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    dept.name,
                    style: GoogleFonts.montserrat(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.gold.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.goldLight),
                  ),
                  child: Text(
                    dept.zone,
                    style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.goldLight),
                  ),
                ),
              ],
            ),

            Text(
              'Cabecera: ${dept.capital}',
              style: GoogleFonts.spaceGrotesk(fontSize: 13, color: AppColors.goldLight),
            ),

            const SizedBox(height: 14),

            // Métricas Rápidas
            Wrap(
              spacing: 12,
              runSpacing: 8,
              children: [
                _buildMetricChip(Icons.people_alt_rounded, dept.population),
                _buildMetricChip(Icons.square_foot_rounded, dept.areaKm2),
                _buildMetricChip(Icons.location_city_rounded, '${dept.municipalitiesCount} Municipios'),
              ],
            ),

            const SizedBox(height: 18),
            const Divider(color: AppColors.borderLight),

            // Cultura
            _buildDetailSection('🎭 Identidad & Cultura', dept.cultureDescription),

            // Gastronomía
            _buildDetailSection('🍽️ Gastronomía Típica', dept.gastronomyHighlight),

            // Tradiciones
            _buildDetailSection('🎉 Fiestas & Tradiciones', dept.traditionsHighlight),

            // Artesanías
            _buildDetailSection('🏺 Artesanías Tradicionales', dept.craftsHighlight),

            // Curiosidad
            _buildDetailSection('💡 Curiosidad Territorial', dept.curiosity),

            // Sitios Turísticos Destacados
            const SizedBox(height: 12),
            Text(
              '📍 Sitios Turísticos Imperdibles:',
              style: GoogleFonts.montserrat(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.goldLight),
            ),
            const SizedBox(height: 6),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: dept.touristAttractions.map((attraction) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: AppColors.bgDark,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.borderGold.withValues(alpha: 0.6)),
                  ),
                  child: Text(
                    '🧭 $attraction',
                    style: GoogleFonts.inter(fontSize: 11.5, color: Colors.white),
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: 24),

            // Botón de Enlace Turístico a Baqueano
            ElevatedButton.icon(
              onPressed: () {
                Navigator.pop(ctx);
                HapticFeedback.mediumImpact();
                context.go(dept.destinationRouteId ?? '/descubrir');
              },
              icon: const Icon(Icons.explore_rounded, color: Colors.white, size: 18),
              label: Text('Explorar Destinos de ${dept.name} en Baqueano'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.terracotta,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricChip(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.primaryLight.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppColors.gold),
          const SizedBox(width: 6),
          Text(text, style: GoogleFonts.spaceGrotesk(fontSize: 11, color: Colors.white)),
        ],
      ),
    );
  }

  Widget _buildDetailSection(String title, String content) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: GoogleFonts.montserrat(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.goldLight),
          ),
          const SizedBox(height: 4),
          Text(
            content,
            style: GoogleFonts.inter(fontSize: 12.5, color: AppColors.textLight.withValues(alpha: 0.9), height: 1.4),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 1050;
    final isTablet = screenWidth >= 650 && screenWidth < 1050;

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: isDesktop ? 3 : (isTablet ? 2 : 1),
        mainAxisExtent: 220,
        crossAxisSpacing: 14,
        mainAxisSpacing: 14,
      ),
      itemCount: departments.length,
      itemBuilder: (context, index) {
        final dept = departments[index];

        return InkWell(
          onTap: () => _showDepartmentDetails(context, dept),
          borderRadius: BorderRadius.circular(20),
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.bgCard,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.borderLight, width: 0.8),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.3),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Stack(
              children: [
                // Imagen de fondo con gradiente
                ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: Image.network(
                    dept.imageUrl,
                    width: double.infinity,
                    height: double.infinity,
                    fit: BoxFit.cover,
                    color: Colors.black.withValues(alpha: 0.65),
                    colorBlendMode: BlendMode.darken,
                    errorBuilder: (_, __, ___) => Container(color: AppColors.primaryDark),
                  ),
                ),

                // Gradiente oscuro inferior
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.transparent,
                        AppColors.bgDark.withValues(alpha: 0.95),
                      ],
                      stops: const [0.4, 1.0],
                    ),
                  ),
                ),

                // Contenido
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.terracotta,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              dept.zone.toUpperCase(),
                              style: GoogleFonts.spaceGrotesk(fontSize: 9, fontWeight: FontWeight.w800, color: Colors.white),
                            ),
                          ),
                          const Spacer(),
                          const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.gold),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        dept.name,
                        style: GoogleFonts.montserrat(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        'Cabecera: ${dept.capital}',
                        style: GoogleFonts.spaceGrotesk(fontSize: 11.5, color: AppColors.goldLight),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 6),
                      Text(
                        dept.cultureDescription,
                        style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted, height: 1.3),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
