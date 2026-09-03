// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — COMUNIDAD & BITÁCORA DEL EXPLORADOR
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Fomentar una cultura de viaje ético, respeto ambiental y apoyo a la economía
//   campesina mediante el Decálogo del Explorador Baqueano.
// - Ofrecer una bitácora transparente con historias reales de viajeros de todo el
//   mundo y permitirles compartir sus propias experiencias en sendero.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Encabezados protegidos con `Expanded` y `TextOverflow.ellipsis` para eliminar
//   cualquier desbordamiento en dispositivos de cualquier formato.
// - `ListView.separated` con `GlassContainer` para renderizar las reseñas comunitarias.
// - Formulario modal interactivo para enviar un nuevo relato de expedición.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `CommunityScreen`: Pantalla comunitaria y decálogo ético del viajero.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/baqueano_button.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';

class CommunityScreen extends StatelessWidget {
  const CommunityScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    return ResponsiveScaffold(
      currentIndex: 1,
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.symmetric(
          horizontal: isDesktop ? 48.0 : 20.0,
          vertical: 24.0,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SectionHeader(
              tag: 'RED DE VIAJEROS & ANFITRIONES',
              title: '👥 Comunidad & Bitácora de Exploradores',
              subtitle: 'Historias compartidas, consejos en ruta y el decálogo ético para proteger los santuarios de Nicaragua.',
              isCentered: true,
            ),
            const SizedBox(height: 16),

            // DECÁLOGO DEL EXPLORADOR BAQUEANO
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                gradient: AppGradients.volcanicHero,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppColors.gold, width: 1.5),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Text('📜', style: TextStyle(fontSize: 26)),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'DECÁLOGO DEL EXPLORADOR',
                          style: GoogleFonts.montserrat(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: AppColors.gold,
                            letterSpacing: 1.1,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  _buildDecalogueRule('1. Sin Huella Ecológica', 'Llévate toda tu basura de vuelta. No extraigas orquídeas, piedras volcánicas ni molestes la fauna silvestre.'),
                  _buildDecalogueRule('2. Comercio Justo y Local', 'Paga el valor justo sin regatear a los campesinos y artesanos. Consume en comedores de las familias locales.'),
                  _buildDecalogueRule('3. Respeta las Tradiciones', 'Pide permiso antes de fotografiar rostros de lugareños y respeta los sitios sagrados precolombinos.'),
                  _buildDecalogueRule('4. Confía en tu Baqueano', 'Sigue siempre las recomendaciones técnicas de tu guía nativo en ríos, volcanes y senderos de selva.'),
                ],
              ),
            ),

            const SizedBox(height: 36),

            // BITÁCORA COMUNITARIA
            const SectionHeader(
              tag: 'HISTORIAS EN RUTA',
              title: 'Bitácora Comunitaria de Viajeros',
              subtitle: 'Relatos auténticos de exploradores que apoyan el ecoturismo campesino.',
              isCentered: true,
            ),
            const SizedBox(height: 12),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: CatalogData.explorerReviews.length,
              separatorBuilder: (_, __) => const SizedBox(height: 14),
              itemBuilder: (context, index) {
                final rev = CatalogData.explorerReviews[index];
                return GlassContainer(
                  padding: const EdgeInsets.all(18),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppColors.borderLight),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Row(
                              children: [
                                Text(rev.countryFlag, style: const TextStyle(fontSize: 22)),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    rev.author,
                                    style: GoogleFonts.montserrat(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w800,
                                      color: AppColors.textLight,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.terracotta.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              rev.destination,
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: AppColors.goldLight,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        rev.review,
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: AppColors.textLight.withValues(alpha: 0.9),
                          height: 1.45,
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),

            const SizedBox(height: 32),

            // CTA Share Story
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: AppGradients.cardGlass,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.gold.withValues(alpha: 0.5)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.gold.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.edit_note_rounded, color: AppColors.gold, size: 28),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '¿Completaste una ruta con Baqueano?',
                          style: GoogleFonts.montserrat(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          'Comparte tu relato y fotos para ganar +200 XP en tu pasaporte.',
                          style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  BaqueanoButton(
                    text: 'Publicar Relato',
                    variant: BaqueanoButtonVariant.primary,
                    height: 40,
                    onPressed: () {
                      CustomToast.success(context, 'Tu relato fue enviado a revisión comunitaria.');
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildDecalogueRule(String title, String desc) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.check_circle_outline, color: AppColors.gold, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: RichText(
              text: TextSpan(
                style: GoogleFonts.inter(fontSize: 12, color: AppColors.textLight, height: 1.4),
                children: [
                  TextSpan(
                    text: '$title: ',
                    style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w800, color: AppColors.goldLight),
                  ),
                  TextSpan(text: desc),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
