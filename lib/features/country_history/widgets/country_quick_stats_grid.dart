// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — ESTADÍSTICAS RÁPIDAS DEL PAÍS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Ofrecer una radiografía demográfica, territorial y geográfica instantánea
//   con datos verificados del país (INIDE/censos oficiales) sin saturar al explorador.
// - Presentar cifras clave que contextualicen la riqueza natural y humana de Nicaragua
//   con total legibilidad en cualquier dispositivo sin desbordamientos visuales.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Rejilla responsiva construida con `GridView.builder` y dimensiones adaptativas
//   (`mainAxisExtent: isDesktop ? 145 : 152`) con respiro vertical adecuado para absorber
//   textos de detalle de múltiples líneas y factores de escala tipográfica del sistema.
// - Tarjetas de estilo visual elevado con `AppColors.bgCard`, bordes dorados tenues,
//   iconos alusivos y tipografías Montserrat, Space Grotesk e Inter.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - `CountryQuickStatsGrid`: Rejilla de tarjetas de estadísticas clave del territorio nacional.
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
    // Intención: Calcular dimensiones del viewport para adaptar la rejilla.
    // Mecanismo: Breakpoints en 600px (tablet) y 950px (desktop).
    // Importancia: Garantiza fluidez y legibilidad tanto en teléfonos como en tablets.
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;
    final isTablet = screenWidth >= 600 && screenWidth < 950;

    // Intención: Estructurar los 6 indicadores principales del país.
    // Mecanismo: Lista de mapas asociativos con icono, etiqueta, valor y detalle descriptivo.
    // Importancia: Facilita el renderizado dinámico e iteración uniforme en la rejilla.
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

    // Intención: Renderizar la matriz de tarjetas sin scroll interno acoplándose al scroll padre.
    // Mecanismo: GridView.builder con NeverScrollableScrollPhysics y mainAxisExtent holgado (152px en tablet/móvil).
    // Importancia: Evita desbordamientos (BOTTOM OVERFLOWED) cuando el detalle ocupa 2 líneas.
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: isDesktop ? 3 : (isTablet ? 2 : 1),
        mainAxisExtent: isDesktop ? 145 : 152,
        crossAxisSpacing: 14,
        mainAxisSpacing: 14,
      ),
      itemCount: statItems.length,
      itemBuilder: (context, index) {
        final item = statItems[index];

        return Container(
          // Intención: Margen interno optimizado verticalmente.
          // Mecanismo: 16px horizontal para alineación y 13px vertical para dar respiro.
          // Importancia: Evita colisiones con los límites superior e inferior de la tarjeta.
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
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
              // Fila superior: Icono representativo y etiqueta de sección
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
              const SizedBox(height: 6),

              // Cifra o dato principal destacado
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

              // Texto secundario contextual de apoyo (hasta 2 líneas de texto descriptivo)
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
