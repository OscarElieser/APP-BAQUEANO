import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/baqueano_button.dart';
import '../../../core/widgets/section_header.dart';

class BaqueanoStandard extends StatelessWidget {
  const BaqueanoStandard({super.key});

  @override
  Widget build(BuildContext context) {
    final standards = [
      {
        'icon': '🛡️',
        'title': 'Guías Nativos Certificados',
        'desc': 'Conocedores ancestrales de senderos, primeros auxilios y el comportamiento del clima en cada montaña y volcán.',
      },
      {
        'icon': '🌱',
        'title': '0% Intermediación Abusiva',
        'desc': 'El 100% de los honorarios de guiado y consumo va directo a las familias rurales y cooperativas anfitrionas.',
      },
      {
        'icon': '📡',
        'title': 'PWA 100% Offline Ready',
        'desc': 'Guarda tus mapas y rutas para consultarlos en cumbres volcánicas o cañones remotos sin necesidad de señal celular.',
      },
      {
        'icon': '🤖',
        'title': 'Baqueano AI (Gemini)',
        'desc': 'Asistente de inteligencia artificial que calcula tu presupuesto exacto y genera itinerarios cronológicos a tu medida.',
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionHeader(
          tag: 'NUESTRO COMPROMISO',
          title: 'El Estándar Baqueano',
          subtitle: 'Diseñado con tecnología de punta y valores innegociables para brindarte la mejor experiencia de aventura comunitaria.',
        ),
        const SizedBox(height: 12),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
            maxCrossAxisExtent: 400,
            mainAxisExtent: 160,
            crossAxisSpacing: 14,
            mainAxisSpacing: 14,
          ),
          itemCount: standards.length,
          itemBuilder: (context, index) {
            final std = standards[index];
            return Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: AppGradients.cardGlass,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.terracotta.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.terracotta.withOpacity(0.4)),
                    ),
                    child: Text(std['icon']!, style: const TextStyle(fontSize: 22)),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          std['title']!,
                          style: GoogleFonts.montserrat(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textLight,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Expanded(
                          child: Text(
                            std['desc']!,
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              color: AppColors.textMuted,
                              height: 1.4,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
        const SizedBox(height: 24),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: AppGradients.sunsetTerracotta,
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: AppColors.terracotta.withOpacity(0.3),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            children: [
              Text(
                '¿Listo para explorar la Nicaragua auténtica?',
                style: GoogleFonts.montserrat(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Únete a miles de exploradores que viajan con propósito, apoyando a las comunidades locales y viviendo aventuras inolvidables.',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: Colors.white.withOpacity(0.95),
                  height: 1.4,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 12,
                runSpacing: 10,
                alignment: WrapAlignment.center,
                children: [
                  BaqueanoButton(
                    text: 'EXPLORAR EXPERIENCIAS',
                    variant: BaqueanoButtonVariant.secondary,
                    height: 46,
                    onPressed: () => context.go('/descubrir'),
                  ),
                  BaqueanoButton(
                    text: 'CONSULTAR A BAQUEANO AI',
                    icon: const Icon(Icons.smart_toy_outlined, size: 16, color: AppColors.textDark),
                    variant: BaqueanoButtonVariant.gold,
                    height: 46,
                    onPressed: () => context.go('/ai'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
