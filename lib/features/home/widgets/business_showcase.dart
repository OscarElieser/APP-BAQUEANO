// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — VITRINA DE NEGOCIOS RURALES & GUÍAS NATIVOS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Conectar de forma directa y sin comisiones abusivas a los turistas con los
//   dueños de cabañas, comedores ancestrales, cooperativas de café y guías nativos.
// - Ofrecer una experiencia táctil inmediata y ultrafluida a 120 FPS sin consumo
//   innecesario de batería ni tirones en el feed principal.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `RepaintBoundary` para encapsular la superficie de renderizado del carrusel,
//   eliminando la propagación de repintados hacia la pantalla principal.
// - `ListView.separated` horizontal con `BouncingScrollPhysics` nativa y suave inercia.
// - Ficha modal detallada (`_showBusinessDetailsModal`) con enlaces directos a WhatsApp,
//   llamadas telefónicas y ubicación georreferenciada en el mapa satelital.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `BusinessShowcase`: Vitrina interactiva de negocios locales campesinos.
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

class BusinessShowcase extends StatefulWidget {
  const BusinessShowcase({super.key});

  @override
  State<BusinessShowcase> createState() => _BusinessShowcaseState();
}

class _BusinessShowcaseState extends State<BusinessShowcase> {
  /// Negocio actualmente presionado para feedback táctil
  dynamic _selectedBiz;

  Future<void> _handleBusinessSelection(dynamic biz) async {
    setState(() => _selectedBiz = biz);
    await _showBusinessDetailsModal(context, biz);
    if (mounted) {
      setState(() => _selectedBiz = null);
    }
  }

  Future<void> _launchWhatsApp(BuildContext context, String phone, String bizName) async {
    final cleanPhone = phone.replaceAll(RegExp(r'[^0-9]'), '');
    final uri = Uri.parse(
        'https://wa.me/$cleanPhone?text=Hola%2C%20vi%20su%20negocio%20$bizName%20en%20la%20app%20Baqueano%20y%20deseo%20m%C3%A1s%20informaci%C3%B3n.');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (context.mounted) {
          CustomToast.error(context, 'WhatsApp no disponible: $phone');
        }
      }
    } catch (_) {
      if (context.mounted) {
        CustomToast.error(context, 'No se pudo abrir WhatsApp');
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

  Future<void> _showBusinessDetailsModal(BuildContext context, dynamic biz) async {
    await showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF082B35),
      isScrollControlled: true,
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
                  Text(biz.icon as String, style: const TextStyle(fontSize: 32)),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          biz.name as String,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          '${biz.category} • ${biz.department}',
                          style: const TextStyle(fontSize: 12, color: Color(0xFFD4AF37)),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.jungleGreen.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.jungleGreenLight),
                    ),
                    child: Text(
                      biz.badge as String,
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: AppColors.jungleGreenLight,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              const Divider(color: Colors.white12),
              const SizedBox(height: 12),
              Text(
                'Sobre el Emprendimiento Comunitario:',
                style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 6),
              Text(
                biz.description as String,
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.white.withValues(alpha: 0.8),
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 16),
              _buildModalRow(Icons.person_rounded, 'Anfitrión o Responsable', biz.ownerName as String),
              const SizedBox(height: 10),
              _buildModalRow(Icons.location_on_rounded, 'Ubicación Comunitaria', '${biz.location}, ${biz.department}'),
              const SizedBox(height: 10),
              _buildModalRow(Icons.star_rounded, 'Calificación Verificada', '${biz.rating} ⭐ de exploradores Baqueano'),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _launchWhatsApp(ctx, biz.whatsapp as String, biz.name as String),
                      icon: const Icon(Icons.chat_rounded, color: Colors.white, size: 16),
                      label: const Text('Contactar WhatsApp'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF25D366),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pop(ctx);
                        context.go('/mapa');
                      },
                      icon: const Icon(Icons.map_rounded, color: Colors.white, size: 16),
                      label: const Text('Ver en Mapa'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.terracotta,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildModalRow(IconData icon, String label, String val) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: AppColors.goldLight),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 10,
                  color: Colors.white.withValues(alpha: 0.5),
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                val,
                style: GoogleFonts.inter(fontSize: 12.5, color: Colors.white),
              ),
            ],
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final businesses = CatalogData.localBusinesses;
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Encabezado temático centrado con badge informativo
        Padding(
          padding: EdgeInsets.symmetric(horizontal: isDesktop ? 48.0 : 20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SectionHeader(
                tag: 'RED LOCAL DIRECTA',
                title: 'Vitrina de Negocios Locales',
                subtitle: 'Conecta de forma directa con los protagonistas del ecoturismo nicaragüense. Cabañas rústicas, guías nativos certificados y gastronomía campesina.',
                isCentered: true,
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                decoration: BoxDecoration(
                  color: AppColors.gold.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderGold.withValues(alpha: 0.4), width: 0.8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.handshake_rounded, size: 13, color: AppColors.gold),
                    const SizedBox(width: 6),
                    Flexible(
                      child: Text(
                        'CONTACTO DIRECTO · ${businesses.length} EMPRENDIMIENTOS',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.8,
                          color: AppColors.gold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 14),

        // Carrusel horizontal aislado con RepaintBoundary para 120 FPS
        RepaintBoundary(
          child: SizedBox(
            height: 275,
            child: ListView.separated(
              padding: EdgeInsets.symmetric(horizontal: isDesktop ? 48.0 : 20.0),
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
              itemCount: businesses.length,
              separatorBuilder: (_, __) => const SizedBox(width: 16),
              itemBuilder: (context, index) {
                final biz = businesses[index];
                final isSelected = _selectedBiz == biz;

                return AnimatedScale(
                  scale: isSelected ? 1.03 : 1.0,
                  duration: const Duration(milliseconds: 140),
                  child: InkWell(
                    onTap: () => _handleBusinessSelection(biz),
                    borderRadius: BorderRadius.circular(22),
                    child: Container(
                      width: 305,
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        gradient: isSelected
                            ? const LinearGradient(
                                colors: [Color(0xFF0C3D4B), Color(0xFFC86432)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              )
                            : AppGradients.cardGlass,
                        borderRadius: BorderRadius.circular(22),
                        border: Border.all(
                          color: isSelected ? AppColors.gold : AppColors.borderLight,
                          width: isSelected ? 1.6 : 1.0,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.25),
                            blurRadius: 12,
                            offset: const Offset(0, 5),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Header con Icono y Badge
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
                                  style: GoogleFonts.spaceGrotesk(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.jungleGreenLight,
                                  ),
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
                                  child: const Icon(Icons.phone_rounded, color: Color(0xFF0284C7), size: 16),
                                ),
                              ),
                              const SizedBox(width: 8),

                              // Ver Ficha
                              Expanded(
                                child: InkWell(
                                  onTap: () => _handleBusinessSelection(biz),
                                  borderRadius: BorderRadius.circular(10),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(vertical: 8),
                                    decoration: BoxDecoration(
                                      color: AppColors.terracotta.withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(10),
                                      border: Border.all(color: AppColors.terracotta.withValues(alpha: 0.5)),
                                    ),
                                    child: Center(
                                      child: Text(
                                        'Ver Ficha',
                                        style: GoogleFonts.spaceGrotesk(
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                          color: AppColors.terracottaLight,
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
                    ),
                  ),
                );
              },
            ),
          ),
        ),
      ],
    );
  }
}
