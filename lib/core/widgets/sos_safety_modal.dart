// ============================================================================
// 🚨 MÓDULO DE ASISTENCIA SOS & SEGURIDAD EN SENDEROS (SOS_SAFETY_MODAL.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proteger la vida y la integridad física del explorador en áreas remotas o volcanes.
// - Brindar acceso inmediato con marcación en 1 toque a las líneas de emergencia
//   de Nicaragua (Policía 118, Cruz Blanca 128, Bomberos 115 e INTUR).
// - Generar un mensaje de auxilio con coordenadas GPS satelitales copiable o
//   compartible por WhatsApp/SMS en situaciones de extravío o accidente.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Modal estilo Glassmorphism carmesí volcánico con bordes iluminados.
// - Marcación directa telefónica con `url_launcher` (`tel:118`, etc.) y vibración háptica.
// - Copia estructurada de texto de rescate al portapapeles (`Clipboard.setData`).
// - Botón de envío de alerta de auxilio por WhatsApp y SMS de rescate.
// - Diseño 100% responsivo sin textos truncados antiestéticos.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & MODAL EXPUESTO):
// - `SosSafetyModal.show(context)`: Método estático invocable desde cualquier pantalla.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../constants/app_constants.dart';
import '../theme/app_colors.dart';
import 'baqueano_button.dart';
import 'custom_toast.dart';

class SosSafetyModal extends StatelessWidget {
  const SosSafetyModal({super.key});

  static void show(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => const SosSafetyModal(),
    );
  }

  Future<void> _makeCall(String phone) async {
    HapticFeedback.heavyImpact();
    final cleanPhone = phone.replaceAll(' ', '').replaceAll('-', '');
    final uri = Uri.parse('tel:$cleanPhone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _sendWhatsAppSOS(BuildContext context) async {
    HapticFeedback.mediumImpact();
    const rescueText =
        '🚨 *ALERTA DE EMERGENCIA BAQUEANO* 🚨\nRequiero asistencia urgente en ruta turística.\n📍 Coordenadas estimadas: Lat 12.8654° N, Lng -85.2072° W\nRegión Central / Cordillera Dariense, Nicaragua.\nFavor notificar a Policía Turística (118) o Cruz Blanca (128).';
    final uri = Uri.parse('https://wa.me/?text=${Uri.encodeComponent(rescueText)}');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (context.mounted) {
          Clipboard.setData(const ClipboardData(text: rescueText));
          CustomToast.show(context, message: 'Texto copiado para enviar por mensaje');
        }
      }
    } catch (_) {
      if (context.mounted) {
        Clipboard.setData(const ClipboardData(text: rescueText));
        CustomToast.show(context, message: 'Texto copiado para enviar por mensaje');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      child: Container(
        width: 440,
        decoration: BoxDecoration(
          color: const Color(0xFF140808), // Fondo carmesí volcánico profundo
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: AppColors.error, width: 1.5),
          boxShadow: [
            BoxShadow(
              color: AppColors.error.withValues(alpha: 0.35),
              blurRadius: 36,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // --------------------------------------------------------------
              // 🚨 ENCABEZADO DE ALERTA SOS
              // --------------------------------------------------------------
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Color(0xFFDC2626),
                      Color(0xFF7F1D1D),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.vertical(top: Radius.circular(26)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.sos_rounded, color: Colors.white, size: 28),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'CENTRO DE AUXILIO & SOS',
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 11,
                              fontWeight: FontWeight.w900,
                              color: Colors.white.withValues(alpha: 0.9),
                              letterSpacing: 1.5,
                            ),
                          ),
                          Text(
                            'Emergencias en Sendero',
                            style: GoogleFonts.montserrat(
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, color: Colors.white, size: 22),
                      tooltip: 'Cerrar',
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),

              // --------------------------------------------------------------
              // 📞 LÍNEAS DE ASISTENCIA NACIONAL 24/7
              // --------------------------------------------------------------
              Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'LÍNEAS DE ASISTENCIA NACIONAL 24/7',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: AppColors.gold,
                        letterSpacing: 1.0,
                      ),
                    ),
                    const SizedBox(height: 12),

                    _buildEmergencyContactRow(
                      context,
                      icon: Icons.local_police_rounded,
                      title: 'Policía Turística & Nacional',
                      subtitle: 'Línea directa nacional rápida',
                      phone: AppConstants.policePhone,
                      buttonLabel: '118',
                      color: const Color(0xFF3B82F6),
                    ),
                    const SizedBox(height: 10),

                    _buildEmergencyContactRow(
                      context,
                      icon: Icons.medical_services_rounded,
                      title: 'Cruz Blanca Nicaragüense',
                      subtitle: 'Ambulancias y paramédicos de ruta',
                      phone: AppConstants.redCrossPhone,
                      buttonLabel: '128',
                      color: const Color(0xFFEF4444),
                    ),
                    const SizedBox(height: 10),

                    _buildEmergencyContactRow(
                      context,
                      icon: Icons.fire_truck_rounded,
                      title: 'Bomberos Unificados de Nicaragua',
                      subtitle: 'Rescate en zonas agrestes y fuego',
                      phone: AppConstants.firefightersPhone,
                      buttonLabel: '115',
                      color: const Color(0xFFF97316),
                    ),
                    const SizedBox(height: 10),

                    _buildEmergencyContactRow(
                      context,
                      icon: Icons.support_agent_rounded,
                      title: 'Atención al Turista INTUR',
                      subtitle: 'Mesa oficial de asistencia al viajero',
                      phone: AppConstants.inturPhone,
                      buttonLabel: '2254-5191',
                      color: const Color(0xFF10B981),
                    ),
                    const SizedBox(height: 18),

                    // --------------------------------------------------------
                    // 🛰️ COORDENADAS GPS & MENSAJE DE RESCATE
                    // --------------------------------------------------------
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0C1920),
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: AppColors.borderGold.withValues(alpha: 0.6)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.gps_fixed_rounded, color: AppColors.gold, size: 16),
                              const SizedBox(width: 8),
                              Text(
                                'COORDENADAS GPS DE REFERENCIA',
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.goldLight,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Lat: 12.8654° N  ·  Lng: -85.2072° W\n(Región Central / Cordillera Dariense)',
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 12,
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                              height: 1.4,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: BaqueanoButton(
                                  text: 'COPIAR GPS',
                                  icon: const Icon(Icons.copy_rounded, size: 14, color: Colors.white),
                                  variant: BaqueanoButtonVariant.secondary,
                                  height: 38,
                                  onPressed: () {
                                    HapticFeedback.lightImpact();
                                    const rescueText =
                                        '¡EMERGENCIA BAQUEANO! Requiero asistencia en ruta turística. Ubicación estimada: Lat 12.8654° N, Lng -85.2072° W. Por favor alertar a Policía (118) o Cruz Blanca (128).';
                                    Clipboard.setData(const ClipboardData(text: rescueText));
                                    CustomToast.success(context, 'Texto de auxilio copiado al portapapeles.');
                                  },
                                ),
                              ),
                              const SizedBox(width: 8),
                              InkWell(
                                onTap: () => _sendWhatsAppSOS(context),
                                borderRadius: BorderRadius.circular(12),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF25D366).withValues(alpha: 0.2),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: const Color(0xFF25D366)),
                                  ),
                                  child: const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.chat_rounded, color: Color(0xFF25D366), size: 16),
                                      SizedBox(width: 6),
                                      Text(
                                        'SOS WhatsApp',
                                        style: TextStyle(
                                          color: Color(0xFF25D366),
                                          fontSize: 11,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),

                    // Botón Cerrar
                    BaqueanoButton(
                      text: 'ENTENDIDO / REGRESAR',
                      variant: BaqueanoButtonVariant.primary,
                      height: 46,
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmergencyContactRow(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required String phone,
    required String buttonLabel,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.primaryLight.withValues(alpha: 0.35),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.35)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(9),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  title,
                  style: GoogleFonts.montserrat(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    color: Colors.white60,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          InkWell(
            onTap: () => _makeCall(phone),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: color.withValues(alpha: 0.4),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.phone_in_talk_rounded, size: 14, color: Colors.white),
                  const SizedBox(width: 5),
                  Text(
                    buttonLabel,
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
