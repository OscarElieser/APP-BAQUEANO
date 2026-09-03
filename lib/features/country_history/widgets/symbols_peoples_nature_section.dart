// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SÍMBOLOS, PUEBLOS ORIGINARIOS & NATURALEZA
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Reunir los tres pilares de identidad física y territorial de Nicaragua:
//   los símbolos patrios (bandera, escudo, himno, flora y fauna nacional),
//   los pueblos indígenas/afrodescendientes y las maravillas naturales más icónicas.
// - Crear puentes de navegación directos hacia las expediciones de BAQUEANO.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Tarjetas estructuradas con categorías visuales, nombres científicos e historia.
// - Botones interactivos '📍 Conocer este lugar' que transportan al usuario a las
//   rutas de senderismo, volcanes o reservas.
//
// 📦 3. QUÉ (WHAT / WIDGET EXPUESTO):
// - `SymbolsPeoplesNatureSection`: Módulo tripartito de identidad nacional y geografía.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/glass_container.dart';
import '../models/country_history_models.dart';

class SymbolsPeoplesNatureSection extends StatelessWidget {
  final List<NationalSymbol> symbols;
  final List<IndigenousPeople> indigenousPeoples;
  final List<NatureWonder> natureWonders;

  const SymbolsPeoplesNatureSection({
    super.key,
    required this.symbols,
    required this.indigenousPeoples,
    required this.natureWonders,
  });

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 1050;
    final isTablet = screenWidth >= 650 && screenWidth < 1050;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 1. SÍMBOLOS NACIONALES
        _buildSectionTitle('🇳🇮 SÍMBOLOS NACIONALES DE IDENTIDAD'),
        const SizedBox(height: 12),

        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: isDesktop ? 3 : (isTablet ? 2 : 1),
            mainAxisExtent: isDesktop ? 275 : 305,
            crossAxisSpacing: 14,
            mainAxisSpacing: 14,
          ),
          itemCount: symbols.length,
          itemBuilder: (context, index) {
            final sym = symbols[index];

            return GlassContainer(
              padding: const EdgeInsets.all(16),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.borderLight),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.gold.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.goldLight),
                        ),
                        child: Text(
                          sym.category.toUpperCase(),
                          style: GoogleFonts.spaceGrotesk(fontSize: 9.5, fontWeight: FontWeight.w800, color: AppColors.gold),
                        ),
                      ),
                      if (sym.scientificName != null) ...[
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            sym.scientificName!,
                            style: GoogleFonts.inter(fontSize: 10, fontStyle: FontStyle.italic, color: AppColors.textMuted),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    sym.name,
                    style: GoogleFonts.montserrat(fontSize: 14.5, fontWeight: FontWeight.w800, color: Colors.white),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    sym.significance,
                    style: GoogleFonts.inter(fontSize: 11.5, color: AppColors.textLight.withValues(alpha: 0.85), height: 1.35),
                    maxLines: 4,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.bgDark,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.borderLight.withValues(alpha: 0.5)),
                    ),
                    child: Text(
                      'Dato curioso: ${sym.interestingFact}',
                      style: GoogleFonts.inter(fontSize: 10, color: AppColors.goldLight),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            );
          },
        ),

        const SizedBox(height: 36),

        // 2. PUEBLOS ORIGINARIOS Y DIVERSIDAD
        _buildSectionTitle('🌎 PUEBLOS ORIGINARIOS & DIVERSIDAD CULTURAL'),
        const SizedBox(height: 12),

        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: isDesktop ? 2 : 1,
            // Aumentado de 285/325 a 320/400 para absorber contenido variable y
            // escalado de fuentes de accesibilidad sin generar bottom overflow.
            mainAxisExtent: isDesktop ? 320 : 400,
            crossAxisSpacing: 14,
            mainAxisSpacing: 14,
          ),
          itemCount: indigenousPeoples.length,
          itemBuilder: (context, index) {
            final people = indigenousPeoples[index];

            return GlassContainer(
              padding: const EdgeInsets.all(16),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.borderLight),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Expandido para que el nombre largo no desborde a la derecha
                      Expanded(
                        child: Text(
                          people.name,
                          style: GoogleFonts.montserrat(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.goldLight),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Flexible: la región cede espacio al nombre si es necesario
                      Flexible(
                        child: Text(
                          people.region,
                          style: GoogleFonts.spaceGrotesk(fontSize: 11, color: AppColors.textMuted),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          textAlign: TextAlign.end,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Lengua: ${people.language}',
                    style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppColors.terracottaLight),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    people.history,
                    style: GoogleFonts.inter(fontSize: 11.5, color: AppColors.textLight.withValues(alpha: 0.85), height: 1.3),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Tradiciones: ${people.traditions}',
                    style: GoogleFonts.inter(fontSize: 10.5, color: AppColors.textMuted),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton.icon(
                      onPressed: () {
                        HapticFeedback.lightImpact();
                        context.go('/comunidad');
                      },
                      icon: const Icon(Icons.handshake_rounded, size: 13, color: AppColors.goldLight),
                      label: Text(
                        'Artesanías & Cooperativas',
                        style: GoogleFonts.spaceGrotesk(fontSize: 10.5, fontWeight: FontWeight.w700, color: AppColors.goldLight),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),

        const SizedBox(height: 36),

        // 3. NATURALEZA EXTRAORDINARIA (CONEXIÓN TURÍSTICA)
        _buildSectionTitle('🌋 MARAVILLAS NATURALES DE NICARAGUA'),
        const SizedBox(height: 12),

        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: isDesktop ? 3 : (isTablet ? 2 : 1),
            // Aumentado de 350/400 a 390/460 para que el contenido no desborde
            mainAxisExtent: isDesktop ? 390 : 460,
            crossAxisSpacing: 14,
            mainAxisSpacing: 14,
          ),
          itemCount: natureWonders.length,
          itemBuilder: (context, index) {
            final wonder = natureWonders[index];

            return GlassContainer(
              padding: const EdgeInsets.all(14),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.borderLight),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.network(
                      wonder.imageUrl,
                      height: 120,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(height: 120, color: AppColors.primaryLight),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Flexible: la categoría cede espacio al departamento
                      Flexible(
                        child: Text(
                          wonder.category.toUpperCase(),
                          style: GoogleFonts.spaceGrotesk(fontSize: 9.5, fontWeight: FontWeight.w800, color: AppColors.terracottaLight),
                          overflow: TextOverflow.ellipsis,
                          maxLines: 1,
                        ),
                      ),
                      const SizedBox(width: 6),
                      // Flexible: el departamento cede espacio a la categoría
                      Flexible(
                        child: Text(
                          wonder.department,
                          style: GoogleFonts.inter(fontSize: 10.5, color: AppColors.textMuted),
                          overflow: TextOverflow.ellipsis,
                          maxLines: 1,
                          textAlign: TextAlign.end,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    wonder.name,
                    style: GoogleFonts.montserrat(fontSize: 14.5, fontWeight: FontWeight.w800, color: Colors.white),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    wonder.description,
                    style: GoogleFonts.inter(fontSize: 11, color: AppColors.textLight.withValues(alpha: 0.8), height: 1.3),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        HapticFeedback.lightImpact();
                        context.go(wonder.destinationRouteId);
                      },
                      icon: const Icon(Icons.explore_rounded, size: 14, color: Colors.white),
                      label: Text(
                        '📍 Conocer este lugar',
                        style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w800),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.terracotta,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildSectionTitle(String title) {
    return Row(
      children: [
        const Icon(Icons.stars_rounded, color: AppColors.gold, size: 20),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            title,
            style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.gold, letterSpacing: 0.8),
          ),
        ),
      ],
    );
  }
}
