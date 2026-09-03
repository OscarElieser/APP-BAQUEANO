// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PERSONAJES HISTÓRICOS & CURIOSIDADES VERIFICADAS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Recordar la gesta de los héroes y heroínas que forjaron la soberanía y
//   dignidad de Nicaragua (Sandino, Andrés Castro, Rafaela Herrera, Estrada).
// - Despertar el asombro y la curiosidad cultural mediante datos insólitos y
//   verificables con fuentes históricas comprobadas.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Tarjetas biográficas con retratos, roles y lugares de acción vinculados a Baqueano.
// - Tarjetas dinámicas de curiosidades con citas de fuentes institucionales y académicas.
//
// 📦 3. QUÉ (WHAT / WIDGET EXPUESTO):
// - `HistoricalFiguresCuriositiesSection`: Módulo de personajes y curiosidades.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/glass_container.dart';
import '../models/country_history_models.dart';

class HistoricalFiguresCuriositiesSection extends StatelessWidget {
  final List<HistoricalFigure> figures;
  final List<CountryCuriosity> curiosities;

  const HistoricalFiguresCuriositiesSection({
    super.key,
    required this.figures,
    required this.curiosities,
  });

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 1050;
    final isTablet = screenWidth >= 650 && screenWidth < 1050;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // PERSONAJES HISTÓRICOS
        Row(
          children: [
            const Icon(Icons.person_pin_rounded, color: AppColors.gold, size: 20),
            const SizedBox(width: 8),
            Text(
              'PERSONAJES QUE HICIERON HISTORIA',
              style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.gold, letterSpacing: 0.8),
            ),
          ],
        ),
        const SizedBox(height: 14),

        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: isDesktop ? 2 : 1,
            mainAxisExtent: 250,
            crossAxisSpacing: 14,
            mainAxisSpacing: 14,
          ),
          itemCount: figures.length,
          itemBuilder: (context, index) {
            final fig = figures[index];

            return GlassContainer(
              padding: const EdgeInsets.all(16),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.borderLight),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight,
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.borderGold),
                    ),
                    child: const Center(
                      child: Icon(Icons.military_tech_rounded, size: 30, color: AppColors.gold),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                fig.name,
                                style: GoogleFonts.montserrat(fontSize: 14.5, fontWeight: FontWeight.w800, color: Colors.white),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            Text(
                              fig.epoch,
                              style: GoogleFonts.spaceGrotesk(fontSize: 10.5, color: AppColors.goldLight),
                            ),
                          ],
                        ),
                        Text(
                          fig.role,
                          style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.terracottaLight),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 6),
                        Expanded(
                          child: Text(
                            fig.biography,
                            style: GoogleFonts.inter(fontSize: 11.5, color: AppColors.textLight.withValues(alpha: 0.85), height: 1.35),
                            maxLines: 4,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (fig.destinationRouteId != null) ...[
                          const SizedBox(height: 6),
                          Align(
                            alignment: Alignment.centerRight,
                            child: TextButton.icon(
                              onPressed: () {
                                HapticFeedback.lightImpact();
                                context.go(fig.destinationRouteId!);
                              },
                              icon: const Icon(Icons.place_rounded, size: 14, color: AppColors.goldLight),
                              label: Text(
                                'Conocer lugares de su gesta',
                                style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.goldLight),
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),

        const SizedBox(height: 36),

        // CURIOSIDADES ("¿SABÍAS QUE...?")
        Row(
          children: [
            const Icon(Icons.lightbulb_rounded, color: AppColors.gold, size: 20),
            const SizedBox(width: 8),
            Text(
              '¿SABÍAS QUE...? · CURIOSIDADES DE NICARAGUA',
              style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.gold, letterSpacing: 0.8),
            ),
          ],
        ),
        const SizedBox(height: 14),

        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: isDesktop ? 3 : (isTablet ? 2 : 1),
            mainAxisExtent: 180,
            crossAxisSpacing: 14,
            mainAxisSpacing: 14,
          ),
          itemCount: curiosities.length,
          itemBuilder: (context, index) {
            final cur = curiosities[index];

            return Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.bgCard,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppColors.borderGold.withValues(alpha: 0.6), width: 0.8),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(cur.icon, style: const TextStyle(fontSize: 20)),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          cur.title,
                          style: GoogleFonts.montserrat(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.goldLight),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Expanded(
                    child: Text(
                      cur.fact,
                      style: GoogleFonts.inter(fontSize: 11.5, color: AppColors.textLight.withValues(alpha: 0.9), height: 1.3),
                      maxLines: 4,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Fuente: ${cur.source}',
                    style: GoogleFonts.spaceGrotesk(fontSize: 9.5, color: AppColors.textMuted),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}
