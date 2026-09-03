// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — COMUNIDAD & BITÁCORA DEL EXPLORADOR
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Fomentar una cultura de viaje ético, respeto ambiental y apoyo a la economía
//   campesina mediante el Decálogo del Explorador Baqueano.
// - Ofrecer una bitácora transparente con historias reales de viajeros de todo el
//   mundo y permitirles compartir sus propias experiencias en sendero con recompensa de XP.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `CommunityScreen`: StatefulWidget reactivo que mantiene la lista de relatos en memoria
//   e integra un formulario modal interactivo completo para publicar nuevas vivencias.
// - Encabezados protegidos con `Expanded` y `TextOverflow.ellipsis` para erradicar desbordamientos.
// - Modal ergonómico con selección de destino, valoración de 1 a 5 estrellas, país de origen
//   y redacción de testimonio con feedback háptico.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `CommunityScreen`: Pantalla comunitaria, decálogo ético del viajero y formulario de relatos.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/models/cultural_models.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/baqueano_button.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';

class CommunityScreen extends StatefulWidget {
  const CommunityScreen({super.key});

  @override
  State<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends State<CommunityScreen> {
  late List<ExplorerReview> _reviews;

  @override
  void initState() {
    super.initState();
    _reviews = List.from(CatalogData.explorerReviews);
  }

  void _openPublishStoryModal(BuildContext context) {
    HapticFeedback.lightImpact();
    final nameController = TextEditingController();
    final storyController = TextEditingController();
    String selectedDestination = 'Volcán Cerro Negro';
    double selectedRating = 5.0;
    String selectedFlag = '🇳🇮';

    final destinations = [
      'Volcán Cerro Negro',
      'Cañón de Somoto',
      'Isla de Ometepe',
      'Selva Indio Maíz',
      'Reserva Miraflor Estelí',
      'Río San Juan',
      'Volcán Masaya',
      'Pueblos Blancos & Catarina',
    ];

    final flags = ['🇳🇮', '🇨🇷', '🇸🇻', '🇲🇽', '🇺🇸', '🇨🇦', '🇪🇸', '🇩🇪', '🇨🇭', '🇨🇴'];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalContext) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
              ),
              decoration: BoxDecoration(
                color: const Color(0xFF041920),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
                border: Border.all(color: AppColors.borderGold, width: 1.2),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.6), blurRadius: 24, spreadRadius: 4),
                ],
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Indicador superior de arrastre
                    Center(
                      child: Container(
                        width: 44,
                        height: 5,
                        decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                    const SizedBox(height: 16),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Text('✍️', style: TextStyle(fontSize: 22)),
                            const SizedBox(width: 8),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'PUBLICAR RELATO DE EXPEDICIÓN',
                                  style: GoogleFonts.spaceGrotesk(fontSize: 11.5, fontWeight: FontWeight.w800, color: AppColors.goldLight, letterSpacing: 0.8),
                                ),
                                Text(
                                  'Gana +200 XP en tu Pasaporte Baqueano',
                                  style: GoogleFonts.inter(fontSize: 11, color: AppColors.terracottaLight),
                                ),
                              ],
                            ),
                          ],
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: AppColors.textMuted),
                          onPressed: () => Navigator.of(modalContext).pop(),
                        ),
                      ],
                    ),
                    const Divider(color: AppColors.borderLight, height: 20),

                    // Nombre del Explorador
                    Text('Nombre del Explorador / Viajero:', style: GoogleFonts.spaceGrotesk(fontSize: 11.5, fontWeight: FontWeight.w700, color: Colors.white70)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: nameController,
                      style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
                      decoration: InputDecoration(
                        hintText: 'Tu nombre o apodo viajero (ej. Carlos Mendoza)',
                        hintStyle: GoogleFonts.inter(color: AppColors.textMuted, fontSize: 12),
                        filled: true,
                        fillColor: AppColors.primaryDark,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.gold)),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Bandera / Nacionalidad
                    Text('País de Origen:', style: GoogleFonts.spaceGrotesk(fontSize: 11.5, fontWeight: FontWeight.w700, color: Colors.white70)),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 8,
                      children: flags.map((f) {
                        final isSel = selectedFlag == f;
                        return InkWell(
                          onTap: () => setModalState(() => selectedFlag = f),
                          borderRadius: BorderRadius.circular(10),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: isSel ? AppColors.terracotta.withValues(alpha: 0.3) : AppColors.primaryDark,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: isSel ? AppColors.gold : AppColors.borderLight),
                            ),
                            child: Text(f, style: const TextStyle(fontSize: 18)),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 14),

                    // Destino
                    Text('Destino / Ruta Explorada:', style: GoogleFonts.spaceGrotesk(fontSize: 11.5, fontWeight: FontWeight.w700, color: Colors.white70)),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: AppColors.primaryDark,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.borderLight),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: selectedDestination,
                          isExpanded: true,
                          dropdownColor: AppColors.bgDark,
                          icon: const Icon(Icons.arrow_drop_down, color: AppColors.gold),
                          items: destinations.map((d) {
                            return DropdownMenuItem<String>(
                              value: d,
                              child: Text(d, style: GoogleFonts.inter(fontSize: 13, color: Colors.white)),
                            );
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) {
                              setModalState(() => selectedDestination = val);
                            }
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Calificación en Estrellas
                    Row(
                      children: [
                        Text('Calificación:', style: GoogleFonts.spaceGrotesk(fontSize: 11.5, fontWeight: FontWeight.w700, color: Colors.white70)),
                        const SizedBox(width: 8),
                        Row(
                          children: List.generate(5, (index) {
                            final star = index + 1;
                            return IconButton(
                              padding: const EdgeInsets.symmetric(horizontal: 2),
                              constraints: const BoxConstraints(),
                              icon: Icon(
                                star <= selectedRating ? Icons.star_rounded : Icons.star_outline_rounded,
                                color: AppColors.gold,
                                size: 24,
                              ),
                              onPressed: () => setModalState(() => selectedRating = star.toDouble()),
                            );
                          }),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Relato / Experiencia
                    Text('Tu Relato o Consejo de Sendero:', style: GoogleFonts.spaceGrotesk(fontSize: 11.5, fontWeight: FontWeight.w700, color: Colors.white70)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: storyController,
                      maxLines: 4,
                      style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
                      decoration: InputDecoration(
                        hintText: 'Cuéntanos cómo fue tu experiencia con los baqueanos locales, qué llevar, consejos ecológicos...',
                        hintStyle: GoogleFonts.inter(color: AppColors.textMuted, fontSize: 12),
                        filled: true,
                        fillColor: AppColors.primaryDark,
                        contentPadding: const EdgeInsets.all(14),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.gold)),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Botón Publicar
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.terracotta,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        icon: const Icon(Icons.send_rounded, size: 18, color: Colors.white),
                        label: Text(
                          'PUBLICAR RELATO EN LA BITÁCORA',
                          style: GoogleFonts.spaceGrotesk(fontSize: 12.5, fontWeight: FontWeight.w800),
                        ),
                        onPressed: () {
                          if (storyController.text.trim().isEmpty) {
                            CustomToast.error(modalContext, 'Por favor escribe tu relato o experiencia.');
                            return;
                          }

                          HapticFeedback.mediumImpact();
                          final newReview = ExplorerReview(
                            id: 'rev-${DateTime.now().millisecondsSinceEpoch}',
                            author: nameController.text.trim().isEmpty ? 'Explorador Baqueano' : nameController.text.trim(),
                            countryFlag: selectedFlag,
                            destination: selectedDestination,
                            review: storyController.text.trim(),
                            rating: selectedRating,
                          );

                          setState(() {
                            _reviews.insert(0, newReview);
                          });

                          Navigator.of(modalContext).pop();
                          CustomToast.success(context, '¡Relato publicado con éxito! Has ganado +200 XP en tu Pasaporte Baqueano.');
                        },
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

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
                      const Icon(Icons.verified_user_rounded, color: AppColors.gold, size: 24),
                      const SizedBox(width: 10),
                      Text(
                        'DECÁLOGO DEL EXPLORADOR ÉTICO',
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: AppColors.goldLight,
                          letterSpacing: 1.0,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _buildDecalogueItem('1.', 'No dejes rastro: Regresa toda la basura contigo, incluso la biodegradable.'),
                  _buildDecalogueItem('2.', 'Respeta a la fauna silvestre: Observa desde la distancia sin alimentar.'),
                  _buildDecalogueItem('3.', 'Apoya la economía campesina: Contrata guías baqueanos locales certificados.'),
                  _buildDecalogueItem('4.', 'Honra las tradiciones sagradas: Pide permiso antes de fotografiar en comunidades.'),
                ],
              ),
            ),

            const SizedBox(height: 28),

            // LISTA DE RESEÑAS DE LA COMUNIDAD
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'EXPERIENCIAS EN SENDERO (${_reviews.length})',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  color: AppColors.goldLight,
                  letterSpacing: 1.2,
                ),
              ),
            ),
            const SizedBox(height: 14),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _reviews.length,
              separatorBuilder: (_, __) => const SizedBox(height: 14),
              itemBuilder: (context, index) {
                final rev = _reviews[index];
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

            // CTA Share Story adaptativo para móvil y pantalla ancha
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: AppGradients.cardGlass,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: AppColors.gold.withValues(alpha: 0.55), width: 1.2),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.25),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: isDesktop
                  ? Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.gold.withValues(alpha: 0.15),
                            shape: BoxShape.circle,
                            border: Border.all(color: AppColors.gold.withValues(alpha: 0.3)),
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
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'Comparte tu relato y fotos para ganar +200 XP en tu pasaporte.',
                                style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 16),
                        BaqueanoButton(
                          text: 'Publicar Relato',
                          variant: BaqueanoButtonVariant.primary,
                          height: 42,
                          onPressed: () => _openPublishStoryModal(context),
                        ),
                      ],
                    )
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.gold.withValues(alpha: 0.15),
                                shape: BoxShape.circle,
                                border: Border.all(color: AppColors.gold.withValues(alpha: 0.3)),
                              ),
                              child: const Icon(Icons.edit_note_rounded, color: AppColors.gold, size: 26),
                            ),
                            const SizedBox(width: 14),
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
                                  const SizedBox(height: 3),
                                  Text(
                                    'Comparte tu relato y fotos para ganar +200 XP en tu pasaporte.',
                                    style: GoogleFonts.inter(fontSize: 11.5, color: AppColors.textMuted, height: 1.3),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        BaqueanoButton(
                          text: '✍️ Publicar Relato de Expedición',
                          variant: BaqueanoButtonVariant.primary,
                          height: 44,
                          onPressed: () => _openPublishStoryModal(context),
                        ),
                      ],
                    ),
            ),

            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }

  Widget _buildDecalogueItem(String num, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(num, style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.gold)),
          const SizedBox(width: 8),
          Expanded(
            child: Text(text, style: GoogleFonts.inter(fontSize: 12, color: AppColors.textLight.withValues(alpha: 0.9), height: 1.35)),
          ),
        ],
      ),
    );
  }
}
