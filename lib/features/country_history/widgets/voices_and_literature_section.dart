// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — GRANDES VOCES & LITERATURA DE NICARAGUA
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Honrar a Nicaragua como "Tierra de Poetas", destacando a Rubén Darío como
//   Príncipe de las Letras Castellanas y a los escritores que han marcado
//   la literatura continental e hispanoamericana.
// - Presentar biografías rigurosas, portadas de libros célebres y citas inmortales.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Tarjeta de Honor dedicada exclusivamente a Rubén Darío con sus obras cumbre.
// - Rejilla de autores emblemáticos (Cardenal, Belli, PAC, Ramírez, Alegría).
// - Tarjetas de libros con citas y conexión turística a sus ciudades natales.
//
// 📦 3. QUÉ (WHAT / WIDGET EXPUESTO):
// - `VoicesAndLiteratureSection`: Espacio literario y biográfico interactivo.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/glass_container.dart';
import '../models/country_history_models.dart';

class VoicesAndLiteratureSection extends StatelessWidget {
  final List<LiteraryAuthor> writers;

  const VoicesAndLiteratureSection({super.key, required this.writers});

  LiteraryAuthor? get _dario => writers.firstWhere((w) => w.isSpotlight, orElse: () => writers.first);

  List<LiteraryAuthor> get _otherWriters => writers.where((w) => !w.isSpotlight).toList();

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // TARJETA DE HONOR: RUBÉN DARÍO
        if (_dario != null) _buildDarioSpotlight(context, _dario!, isDesktop),

        const SizedBox(height: 28),

        // AUTORES Y POETAS FUNDAMENTALES
        Row(
          children: [
            const Icon(Icons.auto_stories_rounded, color: AppColors.gold, size: 20),
            const SizedBox(width: 8),
            Text(
              'OTRAS GRANDES VOCES DE LAS LETRAS PATRIAS',
              style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.gold, letterSpacing: 0.8),
            ),
          ],
        ),
        const SizedBox(height: 14),

        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: isDesktop ? 3 : (screenWidth >= 650 ? 2 : 1),
            mainAxisExtent: 280,
            crossAxisSpacing: 14,
            mainAxisSpacing: 14,
          ),
          itemCount: _otherWriters.length,
          itemBuilder: (context, index) {
            final author = _otherWriters[index];

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
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.borderGold),
                        ),
                        child: const Center(
                          child: Icon(Icons.history_edu_rounded, color: AppColors.gold, size: 24),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              author.name,
                              style: GoogleFonts.montserrat(fontSize: 13.5, fontWeight: FontWeight.w800, color: Colors.white),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              author.epoch,
                              style: GoogleFonts.spaceGrotesk(fontSize: 10.5, color: AppColors.goldLight),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  Text(
                    'Género: ${author.genre}',
                    style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.terracottaLight),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    'Lugar de origen: ${author.birthplace}',
                    style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Expanded(
                    child: Text(
                      author.literaryContribution,
                      style: GoogleFonts.inter(fontSize: 11.5, color: AppColors.textLight.withValues(alpha: 0.85), height: 1.3),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),

                  if (author.works.isNotEmpty) ...[
                    const Divider(color: AppColors.borderLight, height: 16),
                    Text(
                      'Obra: "${author.works.first.title}" (${author.works.first.year})',
                      style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.goldLight),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildDarioSpotlight(BuildContext context, LiteraryAuthor dario, bool isDesktop) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: AppGradients.volcanicHero,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.borderGold, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: AppColors.terracotta.withValues(alpha: 0.25),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Insignia Rubén Darío
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                decoration: BoxDecoration(
                  color: AppColors.gold,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  'PRÍNCIPE DE LAS LETRAS CASTELLANAS',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    color: Colors.black87,
                    letterSpacing: 0.8,
                  ),
                ),
              ),
              const Spacer(),
              Text(
                '1867 — 1916',
                style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.goldLight),
              ),
            ],
          ),
          const SizedBox(height: 14),

          Text(
            dario.name,
            style: GoogleFonts.montserrat(
              fontSize: isDesktop ? 24 : 20,
              fontWeight: FontWeight.w900,
              color: Colors.white,
            ),
          ),
          Text(
            'Nacimiento: ${dario.birthplace}',
            style: GoogleFonts.spaceGrotesk(fontSize: 12.5, color: AppColors.goldLight),
          ),

          const SizedBox(height: 10),

          Text(
            dario.biography,
            style: GoogleFonts.inter(
              fontSize: 13,
              color: AppColors.textLight.withValues(alpha: 0.9),
              height: 1.45,
            ),
          ),

          const SizedBox(height: 16),

          // Tarjetas de Obras de Darío
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: dario.works.map((work) {
              return Container(
                width: isDesktop ? 340 : double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.bgDark.withValues(alpha: 0.7),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          work.title,
                          style: GoogleFonts.montserrat(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.goldLight),
                        ),
                        Text(
                          work.year,
                          style: GoogleFonts.spaceGrotesk(fontSize: 11, color: AppColors.textMuted),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      work.description,
                      style: GoogleFonts.inter(fontSize: 11.5, color: AppColors.textLight.withValues(alpha: 0.8)),
                    ),
                    if (work.famousQuote != null) ...[
                      const SizedBox(height: 6),
                      Text(
                        work.famousQuote!,
                        style: GoogleFonts.inter(fontSize: 11, fontStyle: FontStyle.italic, color: AppColors.gold),
                      ),
                    ],
                  ],
                ),
              );
            }).toList(),
          ),

          const SizedBox(height: 18),

          // Botón de Enlace a León
          Align(
            alignment: Alignment.centerRight,
            child: ElevatedButton.icon(
              onPressed: () {
                HapticFeedback.lightImpact();
                context.go('/turismo');
              },
              icon: const Icon(Icons.location_city_rounded, size: 16, color: Colors.white),
              label: Text(
                'Visitar la Tumba de Darío en la Catedral de León',
                style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.terracotta,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
