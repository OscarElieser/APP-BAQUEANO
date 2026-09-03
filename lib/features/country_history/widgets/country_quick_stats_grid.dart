// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — ESTADÍSTICAS RÁPIDAS DEL PAÍS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Ofrecer una radiografía demográfica, territorial y geográfica instantánea
//   con datos verificados del país (INIDE/censos oficiales) sin saturar al usuario.
// - Presentar cifras clave que contextualicen la riqueza natural y humana de Nicaragua.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Rejilla adaptativa con `LayoutBuilder` y `GridView.builder` que conmuta entre
//   2 columnas en móvil y 3 o 6 en desktop.
// - Tarjetas Glassmorphism con bordes dorados, iconos y tipografía Space Grotesk.
//
// 📦 3. QUÉ (WHAT / WIDGET EXPUESTO):
// - `CountryQuickStatsGrid`: Rejilla de tarjetas de estadísticas clave.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../models/country_history_models.dart';

class CountryQuickStatsGrid extends StatelessWidget {
  final CountryQuickStats stats;

  const CountryQuickStatsGrid({super.key, required this.stats});

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;
    final isTablet = screenWidth >= 600 && screenWidth < 950;

    final statItems = [
      {
        'icon': '🇳🇮',
        'tag': 'PAÍS',
        'value': 'Nicaragua',
        'detail': 'Corazón de América Central (130,373 km²)',
      },
      {
        'icon': '👥',
        'tag': 'POBLACIÓN',
        'value': stats.population,
        'detail': stats.populationYear,
      },
      {
        'icon': '🗺️',
        'tag': 'DIVISIÓN TERRITORIAL',
        'value': '17 Territorios',
        'detail': stats.territorialDivisions,
      },
      {
        'icon': '🗣️',
        'tag': 'IDIOMAS Y LENGUAS',
        'value': '${stats.officialLanguages.length} Lenguas',
        'detail': stats.officialLanguages.join(' · '),
      },
      {
        'icon': '🌋',
        'tag': 'VOLCANES Y ACTIVIDAD',
        'value': stats.volcanoesCount,
        'detail': stats.volcanoesDetail,
      },
      {
        'icon': '🌊',
        'tag': 'GRANDES CUERPOS DE AGUA',
        'value': stats.lakesCount,
        'detail': stats.lakesDetail,
      },
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: isDesktop ? 3 : (isTablet ? 2 : 1),
        mainAxisExtent: 135,
        crossAxisSpacing: 14,
        mainAxisSpacing: 14,
      ),
      itemCount: statItems.length,
      itemBuilder: (context, index) {
        final item = statItems[index];
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.bgCard,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppColors.borderLight, width: 0.8),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.25),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Row(
                children: [
                  Text(item['icon']!, style: const TextStyle(fontSize: 22)),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      item['tag']!,
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.0,
                        color: AppColors.gold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                item['value']!,
                style: GoogleFonts.montserrat(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Text(
                item['detail']!,
                style: GoogleFonts.inter(
                  fontSize: 11,
                  color: AppColors.textMuted,
                  height: 1.25,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        );
      },
    );
  }
}
