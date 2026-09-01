// ============================================================================
// 🏪 VITRINA DE NEGOCIOS RURALES & COMERCIO JUSTO DIRECTO (BUSINESS_SHOWCASE.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Empoderar a los emprendedores locales (comedores campesinos, cabañas rústicas,
//   asociaciones de guías de volcanes y cooperativas cafetaleras) dándoles visibilidad
//   directa sin comisiones intermediarias.
// - Permitir a los viajeros contactar vía llamada directa con un toque a los anfitriones.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `ListView.separated` horizontal con tarjetas Glassmorphism.
// - Integración con `url_launcher` (`Uri.parse('tel:...')`) para llamada telefónica nativa.
// - Badge verde "100% COMUNITARIO" y toast de contingencia si no hay tarjeta SIM.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `BusinessShowcase`: Carrusel de emprendedores insertado en el feed del Home.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../core/widgets/section_header.dart';

class BusinessShowcase extends StatelessWidget {
  const BusinessShowcase({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Encabezado temático de la vitrina comunitaria
        const SectionHeader(
          tag: 'RED LOCAL DIRECTA',
          title: 'Vitrina de Negocios Locales',
          subtitle: 'Conecta de forma directa con los protagonistas del ecoturismo nicaragüense. Cabañas rústicas, guías nativos certificados y gastronomía de autor campesina.',
        ),
        const SizedBox(height: 12),

        // Carrusel horizontal de emprendedores de 220px de alto
        SizedBox(
          height: 220,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: CatalogData.localBusinesses.length,
            separatorBuilder: (_, __) => const SizedBox(width: 14),
            itemBuilder: (context, index) {
              final biz = CatalogData.localBusinesses[index];
              return Container(
                width: 280,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: AppGradients.cardGlass,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.borderLight),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.2),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Fila superior: Icono del negocio y Badge verde de acreditación
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppColors.primaryLight,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(biz.icon, style: const TextStyle(fontSize: 22)),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.jungleGreen.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.jungleGreenLight, width: 0.8),
                          ),
                          child: Text(
                            biz.badge,
                            style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.jungleGreenLight),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Nombre del negocio
                    Text(
                      biz.name,
                      style: GoogleFonts.montserrat(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.textLight),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),

                    // Categoría y departamento
                    Text(
                      '${biz.category} · ${biz.department}',
                      style: GoogleFonts.spaceGrotesk(fontSize: 11, color: AppColors.terracottaLight, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 6),

                    // Descripción del emprendimiento
                    Expanded(
                      child: Text(
                        biz.description,
                        style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted, height: 1.35),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const Divider(color: AppColors.borderLight, height: 14),

                    // Fila inferior: Número telefónico y botón de marcación directa
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            biz.contact,
                            style: GoogleFonts.spaceGrotesk(fontSize: 11, color: AppColors.goldLight, fontWeight: FontWeight.w700),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),
                        InkWell(
                          onTap: () async {
                            final uri = Uri.parse('tel:${biz.contact.replaceAll(' ', '')}');
                            if (await canLaunchUrl(uri)) {
                              await launchUrl(uri);
                            } else if (context.mounted) {
                              CustomToast.show(context, message: 'Llamando a ${biz.name}: ${biz.contact}');
                            }
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.terracotta,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.phone, size: 12, color: Colors.white),
                                const SizedBox(width: 4),
                                Text('Contactar', style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white)),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
