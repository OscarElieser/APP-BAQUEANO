// ============================================================================
// 🏪 VITRINA DE NEGOCIOS RURALES & COMERCIO JUSTO DIRECTO (BUSINESS_SHOWCASE.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Empoderar a los emprendedores locales (comedores campesinos, cabañas rústicas,
//   asociaciones de guías de volcanes y cooperativas cafetaleras) dándoles visibilidad
//   completa con propietario, teléfono, WhatsApp, correo, dirección y pin GPS.
// - Conectar a los exploradores sin intermediarios para un impacto comunitario real.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `ListView.separated` horizontal con tarjetas Glassmorphism elevadas.
// - Botones de acción directa: WhatsApp (`https://wa.me/`), Llamada telefónica y
//   Navegación al Mapa GPS (`/mapa`).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `BusinessShowcase`: Carrusel de emprendedores con ficha técnica completa.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../core/widgets/section_header.dart';

class BusinessShowcase extends StatelessWidget {
  const BusinessShowcase({super.key});

  Future<void> _launchWhatsApp(BuildContext context, String phone, String bizName) async {
    final cleanPhone = phone.replaceAll(RegExp(r'[^0-9]'), '');
    final uri = Uri.parse('https://wa.me/$cleanPhone?text=Hola%2C%20vi%20su%20negocio%20$bizName%20en%20la%20app%20Baqueano%20y%20deseo%20m%C3%A1s%20informaci%C3%B3n.');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (context.mounted) {
          CustomToast.error(context, 'No se pudo abrir WhatsApp en este dispositivo');
        }
      }
    } catch (_) {
      if (context.mounted) {
        CustomToast.error(context, 'WhatsApp no disponible: $phone');
      }
    }
  }

  Future<void> _launchPhone(BuildContext context, String phone) async {
    final uri = Uri.parse('tel:$phone');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        if (context.mounted) {
          CustomToast.show(context, message: 'Teléfono del negocio: $phone');
        }
      }
    } catch (_) {
      if (context.mounted) {
        CustomToast.show(context, message: 'Contacto: $phone');
      }
    }
  }

  void _showBusinessDetailsModal(BuildContext context, dynamic biz) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF082B35),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Text(biz.icon, style: const TextStyle(fontSize: 32)),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          biz.name,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        Text(
                          '${biz.category} • ${biz.department}',
                          style: const TextStyle(color: Color(0xFFD4AF37), fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(color: Colors.white12),
              const SizedBox(height: 12),

              // Información del Propietario
              _buildDetailRow(Icons.person_outline_rounded, 'Propietario / Gerente', biz.ownerName),
              const SizedBox(height: 10),
              _buildDetailRow(Icons.location_on_outlined, 'Dirección Exacta', biz.address),
              const SizedBox(height: 10),
              _buildDetailRow(Icons.phone_outlined, 'Teléfono', biz.contact),
              const SizedBox(height: 10),
              _buildDetailRow(Icons.email_outlined, 'Correo', biz.email),
              const SizedBox(height: 10),
              _buildDetailRow(Icons.schedule_outlined, 'Horario', biz.schedule),

              const SizedBox(height: 20),

              // Botones de Contacto Rápido
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF25D366),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      icon: const Icon(Icons.chat_rounded, color: Colors.white, size: 18),
                      label: const Text('WhatsApp', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      onPressed: () {
                        Navigator.of(ctx).pop();
                        _launchWhatsApp(context, biz.whatsapp, biz.name);
                      },
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFC86432),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      icon: const Icon(Icons.map_rounded, color: Colors.white, size: 18),
                      label: const Text('Ver en Mapa', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      onPressed: () {
                        Navigator.of(ctx).pop();
                        context.go('/mapa');
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: const Color(0xFFD4AF37), size: 18),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(color: Colors.white54, fontSize: 11, fontWeight: FontWeight.w600),
              ),
              Text(
                value,
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500),
              ),
            ],
          ),
        ),
      ],
    );
  }

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
        const SizedBox(height: 14),

        // Carrusel horizontal de emprendedores de 270px de alto
        SizedBox(
          height: 270,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: CatalogData.localBusinesses.length,
            separatorBuilder: (_, __) => const SizedBox(width: 14),
            itemBuilder: (context, index) {
              final biz = CatalogData.localBusinesses[index];
              return Container(
                width: 300,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: AppGradients.cardGlass,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: AppColors.borderLight),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.3),
                      blurRadius: 14,
                      offset: const Offset(0, 6),
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
                    const SizedBox(height: 10),

                    // Nombre y categoría
                    Text(
                      biz.name,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '👤 ${biz.ownerName} • ${biz.department}',
                      style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFFD4AF37),
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 6),

                    // Descripción breve
                    Text(
                      biz.description,
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.white.withValues(alpha: 0.7),
                        height: 1.3,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),

                    const Spacer(),

                    // Botones de Acción
                    Row(
                      children: [
                        // WhatsApp
                        InkWell(
                          onTap: () => _launchWhatsApp(context, biz.whatsapp, biz.name),
                          borderRadius: BorderRadius.circular(10),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                            decoration: BoxDecoration(
                              color: const Color(0xFF25D366).withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFF25D366).withValues(alpha: 0.5)),
                            ),
                            child: const Icon(Icons.chat_rounded, color: Color(0xFF25D366), size: 16),
                          ),
                        ),
                        const SizedBox(width: 8),

                        // Llamar
                        InkWell(
                          onTap: () => _launchPhone(context, biz.contact),
                          borderRadius: BorderRadius.circular(10),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0284C7).withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFF0284C7).withValues(alpha: 0.5)),
                            ),
                            child: const Icon(Icons.phone_rounded, color: Color(0xFF38BDF8), size: 16),
                          ),
                        ),
                        const SizedBox(width: 8),

                        // Ver Ficha Completa
                        Expanded(
                          child: InkWell(
                            onTap: () => _showBusinessDetailsModal(context, biz),
                            borderRadius: BorderRadius.circular(10),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              decoration: BoxDecoration(
                                gradient: AppGradients.sunsetTerracotta,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Center(
                                child: Text(
                                  'Ver Ficha & Pin 🗺️',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ),
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
