// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CENTRO DE AYUDA & SOPORTE INSTITUCIONAL
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer un punto de contacto confiable, transparente y directo para exploradores
//   y anfitriones locales, resolviendo dudas críticas sobre reservas, modo offline y emergencias.
// - Brindar asistencia inmediata por múltiples canales oficiales (correo electrónico,
//   WhatsApp y marcación de emergencia) sin barreras ni intermediarios.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Intent de correo `mailto` con parámetros predefinidos (`subject` y `body`), ejecutado
//   con `LaunchMode.externalApplication` protegido contra fallos en Android 11+.
// - Mecanismo de contingencia con modal emergente estilizado que permite copiar la dirección
//   oficial al portapapeles (`Clipboard.setData`) o saltar a WhatsApp de soporte.
// - Acordeón expandible para preguntas frecuentes (FAQ) y botones SOS directos.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `HelpScreen`: Pantalla completa de soporte, preguntas frecuentes y teléfonos de emergencia.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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

  Future<void> _handleSendEmail(BuildContext context) async {
    HapticFeedback.lightImpact();
    final uri = Uri(
      scheme: 'mailto',
      path: AppConstants.supportEmail,
      queryParameters: {
        'subject': 'Consulta de Soporte — Explorador Baqueano Nicaragua',
        'body': 'Hola equipo de soporte Baqueano,\n\nEscribo desde la aplicación móvil oficial para consultar lo siguiente:\n\n',
      },
    );

    try {
      final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!launched && context.mounted) {
        _showDirectSupportModal(context);
      }
    } catch (_) {
      if (context.mounted) {
        _showDirectSupportModal(context);
      }
    }
  }

  void _showDirectSupportModal(BuildContext context) {
    HapticFeedback.lightImpact();
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (modalCtx) {
        return Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: const Color(0xFF041920),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            border: Border.all(color: AppColors.borderGold, width: 1.2),
            boxShadow: [
              BoxShadow(color: Colors.black.withValues(alpha: 0.6), blurRadius: 24, spreadRadius: 4),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 5,
                  decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 18),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.gold.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.goldLight),
                    ),
                    child: const Icon(Icons.mark_email_read_rounded, color: AppColors.gold, size: 24),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'MESA DE AYUDA & SOPORTE',
                          style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.goldLight, letterSpacing: 0.8),
                        ),
                        Text(
                          'Atención directa 24/7 sin intermediarios',
                          style: GoogleFonts.inter(fontSize: 11.5, color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppColors.textMuted),
                    onPressed: () => Navigator.of(modalCtx).pop(),
                  ),
                ],
              ),
              const Divider(color: AppColors.borderLight, height: 24),
              Text(
                'Correo Oficial de Soporte:',
                style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white70),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: AppColors.primaryDark,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.borderGold.withValues(alpha: 0.5)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        AppConstants.supportEmail,
                        style: GoogleFonts.spaceGrotesk(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.goldLight),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    InkWell(
                      onTap: () {
                        Clipboard.setData(const ClipboardData(text: AppConstants.supportEmail));
                        CustomToast.success(context, '¡Correo copiado al portapapeles!');
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.terracotta,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.copy, size: 14, color: Colors.white),
                            const SizedBox(width: 4),
                            Text('Copiar', style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              Text(
                'Tiempo estimado de respuesta: menos de 15 minutos en horario diurno.',
                style: GoogleFonts.inter(fontSize: 11.5, color: AppColors.textMuted, height: 1.3),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF25D366),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 13),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  icon: const Icon(Icons.chat, size: 18, color: Colors.white),
                  label: Text(
                    'Contactar por WhatsApp Directo',
                    style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.w700),
                  ),
                  onPressed: () async {
                    Navigator.of(modalCtx).pop();
                    final uri = Uri.parse(AppConstants.supportWhatsApp);
                    if (await canLaunchUrl(uri)) {
                      await launchUrl(uri, mode: LaunchMode.externalApplication);
                    }
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = MediaQuery.of(context).size.width >= 950;

    return ResponsiveScaffold(
      currentIndex: 0,
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
              subtitle: 'Encuentra respuestas inmediatas sobre reservas comunitarias, políticas éticas y asistencia en ruta en Nicaragua.',
            ),
            const SizedBox(height: 20),

            // Tarjeta de Emergencias SOS Nacionales
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppColors.error.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.error.withValues(alpha: 0.5)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.warning_amber_rounded, color: AppColors.error, size: 24),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'LÍNEAS DE ASISTENCIA & EMERGENCIA NACIONAL (SOS)',
                          style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.error),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'En caso de cualquier imprevisto en sendero o montaña, puedes marcar directamente a los servicios oficiales de auxilio de Nicaragua:',
                    style: GoogleFonts.inter(fontSize: 12, color: AppColors.textLight.withValues(alpha: 0.85), height: 1.4),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _buildEmergencyPhone(context, 'Cruz Blanca', '128', '+505 2265-1440'),
                      _buildEmergencyPhone(context, 'Policía Turística', '101', '+505 2222-2222'),
                      _buildEmergencyPhone(context, 'Bomberos Unificados', '115', '+505 2265-0101'),
                      _buildEmergencyPhone(context, 'Defensa Civil', '100', '+505 2228-3333'),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Lista interactiva de FAQs
            Text(
              'PREGUNTAS FRECUENTES',
              style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.goldLight, letterSpacing: 1.2),
            ),
            const SizedBox(height: 12),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: faqs.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final faq = faqs[index];
                return GlassContainer(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderLight),
                  child: Theme(
                    data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                    child: ExpansionTile(
                      iconColor: AppColors.gold,
                      collapsedIconColor: AppColors.textMuted,
                      tilePadding: EdgeInsets.zero,
                      childrenPadding: const EdgeInsets.only(bottom: 12),
                      title: Text(
                        faq['q']!,
                        style: GoogleFonts.spaceGrotesk(fontSize: 13.5, fontWeight: FontWeight.w700, color: AppColors.textLight),
                      ),
                      children: [
                        Text(
                          faq['a']!,
                          style: GoogleFonts.inter(fontSize: 12.5, color: AppColors.textMuted, height: 1.45),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),

            const SizedBox(height: 32),

            // Contacto Directo con el Equipo Baqueano
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                gradient: AppGradients.cardGlass,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: AppColors.borderGold, width: 1.2),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      const Icon(Icons.support_agent_rounded, color: AppColors.gold, size: 28),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          '¿Tienes una consulta específica o necesitas apoyo en ruta?',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Nuestro equipo de soporte territorial y asistencia al viajero está disponible para ayudarte en tu expedición.',
                    style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted, height: 1.4),
                  ),
                  const SizedBox(height: 16),
                  LayoutBuilder(
                    builder: (context, btnConstraints) {
                      final isNarrow = btnConstraints.maxWidth < 480;

                      if (isNarrow) {
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            BaqueanoButton(
                              text: 'WHATSAPP DE SOPORTE',
                              icon: const Icon(Icons.chat, size: 16, color: Colors.white),
                              variant: BaqueanoButtonVariant.primary,
                              height: 48,
                              width: double.infinity,
                              onPressed: () async {
                                final uri = Uri.parse(AppConstants.supportWhatsApp);
                                if (await canLaunchUrl(uri)) {
                                  await launchUrl(uri, mode: LaunchMode.externalApplication);
                                } else if (context.mounted) {
                                  _showDirectSupportModal(context);
                                }
                              },
                            ),
                            const SizedBox(height: 10),
                            BaqueanoButton(
                              text: 'ENVIAR CORREO',
                              icon: const Icon(Icons.email_outlined, size: 16, color: AppColors.textDark),
                              variant: BaqueanoButtonVariant.gold,
                              height: 48,
                              width: double.infinity,
                              onPressed: () => _handleSendEmail(context),
                            ),
                          ],
                        );
                      }

                      return Row(
                        children: [
                          Expanded(
                            child: BaqueanoButton(
                              text: 'WHATSAPP DE SOPORTE',
                              icon: const Icon(Icons.chat, size: 16, color: Colors.white),
                              variant: BaqueanoButtonVariant.primary,
                              height: 48,
                              onPressed: () async {
                                final uri = Uri.parse(AppConstants.supportWhatsApp);
                                if (await canLaunchUrl(uri)) {
                                  await launchUrl(uri, mode: LaunchMode.externalApplication);
                                } else if (context.mounted) {
                                  _showDirectSupportModal(context);
                                }
                              },
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: BaqueanoButton(
                              text: 'ENVIAR CORREO',
                              icon: const Icon(Icons.email_outlined, size: 16, color: AppColors.textDark),
                              variant: BaqueanoButtonVariant.gold,
                              height: 48,
                              onPressed: () => _handleSendEmail(context),
                            ),
                          ),
                        ],
                      );
                    },
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

  Widget _buildEmergencyPhone(BuildContext context, String entity, String shortNumber, String fullNumber) {
    return InkWell(
      onTap: () async {
        final uri = Uri.parse('tel:$shortNumber');
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
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
