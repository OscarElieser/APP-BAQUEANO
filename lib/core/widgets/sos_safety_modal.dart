// ============================================================================
// 🚨 MÓDULO DE ASISTENCIA SOS & SEGURIDAD EN SENDEROS (SOS_SAFETY_MODAL.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proteger la vida e integridad física del explorador en áreas remotas o volcanes.
// - Brindar acceso inmediato a las líneas oficiales de emergencia de Nicaragua
//   (Policía 118, Cruz Blanca 128, Bomberos 115 e INTUR).
// - Generar un mensaje de auxilio con coordenadas GPS satelitales copiable en un toque.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Modal estilo Glassmorphism carmesí volcánico.
// - Marcación directa telefónica con `url_launcher` (`tel:118`, etc.).
// - Copia estructurada de texto de rescate al portapapeles (`Clipboard.setData`).
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
    final cleanPhone = phone.replaceAll(' ', '').replaceAll('-', '');
    final uri = Uri.parse('tel:$cleanPhone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 24),
      child: Container(
        width: 440,
        decoration: BoxDecoration(
          color: const Color(0xFF1A0A0A), // Fondo carmesí volcánico profundo
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
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // --------------------------------------------------------------
              // 🚨 ENCABEZADO DE ALERTA SOS
              // --------------------------------------------------------------
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      const Color(0xFFEF4444),
                      const Color(0xFF991B1B),
                    ],
                  ),
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(26)),
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
                      icon: const Icon(Icons.close, color: Colors.white),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),

              // --------------------------------------------------------------
              // 📞 BOTONES DE MARCACIÓN DIRECTA RÁPIDA (118, 128, 115, INTUR)
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
                      phone: AppConstants.policePhone,
                      fullPhone: AppConstants.policePhoneFull,
                      color: const Color(0xFF3B82F6),
                    ),
                    const SizedBox(height: 10),

                    _buildEmergencyContactRow(
                      context,
                      icon: Icons.medical_services_rounded,
                      title: 'Cruz Blanca Nicaragüense (Ambulancia)',
                      phone: AppConstants.redCrossPhone,
                      fullPhone: AppConstants.redCrossPhoneFull,
                      color: const Color(0xFFEF4444),
                    ),
                    const SizedBox(height: 10),

                    _buildEmergencyContactRow(
                      context,
                      icon: Icons.fire_truck_rounded,
                      title: 'Bomberos Unificados de Nicaragua',
                      phone: AppConstants.firefightersPhone,
                      fullPhone: '115',
                      color: const Color(0xFFF97316),
                    ),
                    const SizedBox(height: 10),

                    _buildEmergencyContactRow(
                      context,
                      icon: Icons.support_agent_rounded,
                      title: 'Atención al Turista INTUR',
                      phone: AppConstants.inturPhone,
                      fullPhone: AppConstants.inturPhone,
                      color: const Color(0xFF10B981),
                    ),
                    const SizedBox(height: 20),

                    // --------------------------------------------------------
                    // 🛰️ COORDENADAS GPS & MENSAJE DE RESCATE
                    // --------------------------------------------------------
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.primaryDark,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.borderGold),
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
                                style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.goldLight),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Lat: 12.8654° N  ·  Lng: -85.2072° W\n(Región Central / Cordillera Dariense)',
                            style: GoogleFonts.spaceGrotesk(fontSize: 12, color: Colors.white, fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 10),
                          BaqueanoButton(
                            text: 'COPIAR TEXTO DE AUXILIO',
                            icon: const Icon(Icons.copy_rounded, size: 14, color: Colors.white),
                            variant: BaqueanoButtonVariant.secondary,
                            height: 38,
                            onPressed: () {
                              const rescueText = '¡EMERGENCIA BAQUEANO! Requiero asistencia en ruta turística. Ubicación estimada: Lat 12.8654° N, Lng -85.2072° W. Por favor alertar a Policía (118) o Cruz Blanca (128).';
                              Clipboard.setData(const ClipboardData(text: rescueText));
                              CustomToast.success(context, 'Texto de auxilio copiado al portapapeles.');
                            },
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),

                    // Botón Cerrar
                    BaqueanoButton(
                      text: 'ENTENDIDO / REGRESAR',
                      variant: BaqueanoButtonVariant.primary,
                      height: 44,
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
    required String phone,
    required String fullPhone,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.primaryLight.withValues(alpha: 0.35),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.white),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  fullPhone,
                  style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.goldLight),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          InkWell(
            onTap: () => _makeCall(phone),
            borderRadius: BorderRadius.circular(10),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(10),
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
                  const SizedBox(width: 4),
                  Text(
                    phone,
                    style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.white),
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
