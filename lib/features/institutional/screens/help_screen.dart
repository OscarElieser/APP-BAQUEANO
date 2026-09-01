import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/baqueano_button.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';
import '../../../core/widgets/custom_toast.dart';

class HelpScreen extends StatelessWidget {
  const HelpScreen({super.key});

  final List<Map<String, String>> faqs = const [
    {
      'q': '¿Cómo funciona la reserva directa sin intermediarios?',
      'a': 'En Baqueano conectas directamente con las cooperativas campesinas y guías nativos. El 85% al 100% de tu pago llega de forma íntegra a sus manos, sin cobros de comisiones abusivas de agencias.',
    },
    {
      'q': '¿Cómo funciona el modo 100% Offline y mapas descargables?',
      'a': 'Puedes guardar tus rutas, mapas satelitales y números de contacto antes de iniciar tu viaje. Toda la información queda almacenada localmente en tu dispositivo para navegar en cumbres o cañones sin señal.',
    },
    {
      'q': '¿Qué es el Asistente Baqueano AI (Gemini)?',
      'a': 'Es un asistente de inteligencia artificial entrenado con datos geográficos y costos reales de Nicaragua. Te calcula presupuestos en USD y Córdobas (NIO), planifica itinerarios hora por hora y te conecta con guías.',
    },
    {
      'q': '¿Qué cubre la política de cancelación por fuerza mayor climática?',
      'a': 'Si un volcán presenta actividad restringida o hay lluvias torrenciales en cañones, priorizamos la seguridad del viajero y reprogramamos la expedición sin ninguna penalización.',
    },
    {
      'q': '¿Cómo puedo registrar mi emprendimiento o cooperativa rural?',
      'a': 'Desde el menú lateral o el panel de registro de emprendedores puedes postular tu negocio. El equipo de administración valida tus credenciales de INTUR y activa tu publicación en menos de 12 horas.',
    },
  ];

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
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SectionHeader(
              tag: 'SOPORTE AL VIAJERO',
              title: '❓ Centro de Ayuda & Preguntas Frecuentes',
              subtitle: 'Respuestas a todas tus consultas sobre expediciones, cancelaciones, modo offline y contactos de emergencia.',
            ),
            const SizedBox(height: 16),

            // Emergency Contacts Strip
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF260D0D),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.error.withValues(alpha: 0.5)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.emergency, color: AppColors.error, size: 24),
                      const SizedBox(width: 10),
                      Text(
                        'LÍNEAS DE ATENCIÓN DE EMERGENCIA NACIONAL (24/7)',
                        style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: 1.0),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 16,
                    runSpacing: 10,
                    children: [
                      _buildEmergencyPhone(context, 'Policía Turística', AppConstants.policePhone, AppConstants.policePhoneFull),
                      _buildEmergencyPhone(context, 'Cruz Roja Nica', AppConstants.redCrossPhone, AppConstants.redCrossPhoneFull),
                      _buildEmergencyPhone(context, 'Bomberos Unificados', AppConstants.firefightersPhone, '115 / 911'),
                      _buildEmergencyPhone(context, 'INTUR Turismo', 'INTUR', AppConstants.inturPhone),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // FAQ Accordions
            Text(
              'PREGUNTAS FRECUENTES (FAQ)',
              style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.gold, letterSpacing: 1.0),
            ),
            const SizedBox(height: 12),

            ...faqs.map((faq) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 10.0),
                child: GlassContainer(
                  padding: EdgeInsets.zero,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderLight),
                  child: Theme(
                    data: ThemeData.dark().copyWith(dividerColor: Colors.transparent),
                    child: ExpansionTile(
                      iconColor: AppColors.gold,
                      collapsedIconColor: AppColors.textMuted,
                      title: Text(
                        faq['q']!,
                        style: GoogleFonts.montserrat(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textLight),
                      ),
                      children: [
                        Padding(
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                          child: Text(
                            faq['a']!,
                            style: GoogleFonts.inter(fontSize: 13, color: AppColors.textMuted, height: 1.45),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),

            const SizedBox(height: 32),

            // Direct Support CTA
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: AppGradients.cardGlass,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppColors.borderGold),
              ),
              child: Column(
                children: [
                  Text(
                    '¿Aún necesitas ayuda con una reserva?',
                    style: GoogleFonts.montserrat(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Nuestro equipo comunitario y baqueanos de guardia están listos para asistirte por WhatsApp o correo electrónico.',
                    style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 12,
                    runSpacing: 10,
                    alignment: WrapAlignment.center,
                    children: [
                      BaqueanoButton(
                        text: 'WHATSAPP DE SOPORTE',
                        icon: const Icon(Icons.chat, size: 16, color: Colors.white),
                        variant: BaqueanoButtonVariant.primary,
                        height: 44,
                        onPressed: () async {
                          final uri = Uri.parse(AppConstants.supportWhatsApp);
                          if (await canLaunchUrl(uri)) {
                            await launchUrl(uri);
                          } else if (context.mounted) {
                            CustomToast.show(context, message: 'Abriendo WhatsApp de Soporte Baqueano');
                          }
                        },
                      ),
                      BaqueanoButton(
                        text: 'ENVIAR CORREO',
                        icon: const Icon(Icons.email_outlined, size: 16, color: AppColors.textDark),
                        variant: BaqueanoButtonVariant.gold,
                        height: 44,
                        onPressed: () async {
                          final uri = Uri.parse('mailto:${AppConstants.supportEmail}');
                          if (await canLaunchUrl(uri)) {
                            await launchUrl(uri);
                          } else if (context.mounted) {
                            CustomToast.show(context, message: 'Correo: ${AppConstants.supportEmail}');
                          }
                        },
                      ),
                    ],
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

  Widget _buildEmergencyPhone(BuildContext context, String entity, String shortNumber, String fullNumber) {
    return InkWell(
      onTap: () async {
        final uri = Uri.parse('tel:$shortNumber');
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri);
        } else if (context.mounted) {
          CustomToast.show(context, message: 'Llamando a $entity: $fullNumber');
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: AppColors.bgDark,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.error.withValues(alpha: 0.6)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.phone_in_talk, size: 14, color: AppColors.error),
            const SizedBox(width: 6),
            Text(
              '$entity: $shortNumber',
              style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white),
            ),
          ],
        ),
      ),
    );
  }
}
