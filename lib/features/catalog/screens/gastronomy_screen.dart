// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — GASTRONOMÍA AUTÓCTONA & COMEDORES CAMPESINOS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - La gastronomía campesina es el pilar de la identidad cultural y la soberanía alimentaria nicaragüense.
// - Conecta a los exploradores directamente con cocineras tradicionales, familias y comedores rurales sin intermediarios,
//   promoviendo el consumo local, precios justos y una inmersión cultural auténtica.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Implementación en Flutter/Dart con diseño reactivo, tarjetas auto-adaptativas que evitan desbordamientos de píxeles,
//   fichas completas con dirección exacta nicaragüense, teléfono de contacto con marcación telefónica directa y WhatsApp,
//   nombre de la anfitriona y estimación de precio bimoneda (C$ NIO / $ USD).
// - Integración con url_launcher para comunicación inmediata y go_router para navegación al mapa satelital.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - GastronomyScreen: Pantalla completa de gastronomía típica con lista responsiva de platillos ancestrales.
// - Acceso a llamada telefónica, mensajería WhatsApp y localización satelital de comedores.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/models/cultural_models.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';

class GastronomyScreen extends StatelessWidget {
  const GastronomyScreen({super.key});

  static Future<void> _callPhone(BuildContext context, String phone) async {
    HapticFeedback.lightImpact();
    final cleanPhone = phone.replaceAll(RegExp(r'[^\d+]'), '');
    final uri = Uri.parse('tel:$cleanPhone');
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {
      if (context.mounted) {
        CustomToast.show(context, message: 'Teléfono de contacto: $phone');
      }
    }
  }

  static Future<void> _openWhatsApp(BuildContext context, String phone, String dishName, String place) async {
    HapticFeedback.lightImpact();
    final cleanPhone = phone.replaceAll(RegExp(r'[^\d]'), '');
    final message = Uri.encodeComponent(
      '¡Hola! Los contacto a través de la app Baqueano Nicaragua. Quisiera consultar sobre el platillo tradicional "$dishName" en $place.',
    );
    final uri = Uri.parse('https://wa.me/$cleanPhone?text=$message');
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {
      if (context.mounted) {
        CustomToast.show(context, message: 'Contacto WhatsApp: $phone');
      }
    }
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
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SectionHeader(
              tag: 'SABORES ANCESTRALES',
              title: '🍽️ Gastronomía Autóctona de Nicaragua',
              subtitle: 'La cocina nicaragüense: una explosión de maíz criollo, cacao, carnes cecinadas, lácteos artesanales y tradición precolombina.',
            ),
            const SizedBox(height: 16),

            // Intro Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: AppGradients.cardGlass,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.borderGold),
              ),
              child: Row(
                children: [
                  const Text('🌽', style: TextStyle(fontSize: 32)),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Text(
                      '«Somos hijos del maíz». Cada platillo refleja la fusión entre las raíces indígenas chorotegas, náhuatl y las técnicas coloniales campesinas.',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        color: AppColors.textLight.withValues(alpha: 0.9),
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            // Lista de Platillos Gastronómicos con Información Completa
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: CatalogData.gastronomyDishes.length,
              separatorBuilder: (_, __) => const SizedBox(height: 24),
              itemBuilder: (context, index) {
                final dish = CatalogData.gastronomyDishes[index];
                return _buildDishCard(context, dish);
              },
            ),

            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }

  Widget _buildDishCard(BuildContext context, GastronomyDish dish) {
    return GlassContainer(
      padding: EdgeInsets.zero,
      borderRadius: BorderRadius.circular(22),
      border: Border.all(color: AppColors.borderLight),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Imagen con Badges de Región y Precio
          Stack(
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(22)),
                child: Image.network(
                  dish.imageUrl,
                  height: 200,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    height: 200,
                    color: AppColors.primaryLight,
                    child: Center(child: Text(dish.icon, style: const TextStyle(fontSize: 54))),
                  ),
                ),
              ),
              // Badge de Región
              Positioned(
                top: 12,
                left: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: AppColors.bgDark.withValues(alpha: 0.92),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.gold, width: 1),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.place_rounded, size: 13, color: AppColors.gold),
                      const SizedBox(width: 4),
                      Text(
                        dish.region,
                        style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.goldLight),
                      ),
                    ],
                  ),
                ),
              ),
              // Badge de Precio Estimado
              Positioned(
                top: 12,
                right: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFC86432).withValues(alpha: 0.95),
                    borderRadius: BorderRadius.circular(10),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withValues(alpha: 0.45), blurRadius: 6),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.monetization_on_rounded, size: 13, color: Colors.white),
                      const SizedBox(width: 4),
                      Text(
                        dish.estimatedPrice,
                        style: GoogleFonts.spaceGrotesk(fontSize: 10.5, fontWeight: FontWeight.w800, color: Colors.white),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Contenido Detallado
          Padding(
            padding: const EdgeInsets.all(18.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Título del Platillo
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(dish.icon, style: const TextStyle(fontSize: 24)),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        dish.name,
                        style: GoogleFonts.montserrat(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textLight,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Reseña Histórica Ancestral
                Text(
                  dish.history,
                  style: GoogleFonts.inter(fontSize: 12.5, color: AppColors.textMuted, height: 1.45),
                ),
                const SizedBox(height: 14),

                // Ingredientes Principales
                Text(
                  'INGREDIENTES ANCESTRALES:',
                  style: GoogleFonts.spaceGrotesk(fontSize: 10.5, fontWeight: FontWeight.w800, color: AppColors.terracottaLight, letterSpacing: 0.8),
                ),
                const SizedBox(height: 6),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: dish.ingredients.map((ing) {
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primaryDark,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.borderLight, width: 0.8),
                      ),
                      child: Text(
                        ing,
                        style: GoogleFonts.inter(fontSize: 11, color: AppColors.textLight.withValues(alpha: 0.9)),
                      ),
                    );
                  }).toList(),
                ),

                const SizedBox(height: 16),
                const Divider(color: AppColors.borderLight, height: 1),
                const SizedBox(height: 14),

                // 🧭 FICHA TÉCNICA DEL COMEDOR & ANFITRIONA RURAL (INFORMACIÓN COMPLETA)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF041920).withValues(alpha: 0.88),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.55), width: 1.1),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.storefront_rounded, size: 16, color: Color(0xFFD4AF37)),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'PUESTO & COMEDOR CAMPESINO RECOMENDADO',
                              style: GoogleFonts.spaceGrotesk(fontSize: 10.5, fontWeight: FontWeight.w800, color: const Color(0xFFD4AF37), letterSpacing: 0.8),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // Nombre del Local
                      _buildInfoField(
                        icon: Icons.restaurant_rounded,
                        label: 'Comedor / Local:',
                        value: dish.recommendedPlace,
                        isHighlight: true,
                      ),
                      const SizedBox(height: 8),

                      // Propietario / Anfitrión Campesino
                      _buildInfoField(
                        icon: Icons.person_pin_circle_rounded,
                        label: 'Propietario / Anfitrión:',
                        value: dish.ownerName,
                      ),
                      const SizedBox(height: 8),

                      // Dirección Completa (¡Totalmente visible, sin truncamiento!)
                      _buildInfoField(
                        icon: Icons.location_on_rounded,
                        label: 'Dirección Completa:',
                        value: dish.fullAddress,
                        isFullText: true,
                        iconColor: const Color(0xFFC86432),
                      ),
                      const SizedBox(height: 8),

                      // Precio Estimado
                      _buildInfoField(
                        icon: Icons.payments_rounded,
                        label: 'Precio Estimado:',
                        value: dish.estimatedPrice,
                        valueColor: AppColors.goldLight,
                      ),

                      // Horario
                      if (dish.schedule != null) ...[
                        const SizedBox(height: 8),
                        _buildInfoField(
                          icon: Icons.access_time_rounded,
                          label: 'Horario de Atención:',
                          value: dish.schedule!,
                        ),
                      ],

                      const SizedBox(height: 8),

                      // Teléfono
                      _buildInfoField(
                        icon: Icons.phone_rounded,
                        label: 'Teléfono Directo:',
                        value: dish.contactPhone,
                        valueColor: Colors.white,
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Botones Interactivos de Acción (Llamar, WhatsApp, Mapa)
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => _callPhone(context, dish.contactPhone),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFC86432),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        icon: const Icon(Icons.phone_in_talk_rounded, size: 16, color: Colors.white),
                        label: Text(
                          'Llamar al Local',
                          style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _openWhatsApp(context, dish.contactPhone, dish.name, dish.recommendedPlace),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF25D366),
                          side: const BorderSide(color: Color(0xFF25D366), width: 1.2),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        icon: const Icon(Icons.chat_rounded, size: 16, color: Color(0xFF25D366)),
                        label: Text(
                          'WhatsApp',
                          style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      tooltip: 'Ver en Mapa Satelital',
                      onPressed: () {
                        HapticFeedback.lightImpact();
                        context.go('/mapa');
                      },
                      icon: const Icon(Icons.map_rounded, size: 18, color: Color(0xFFD4AF37)),
                      style: IconButton.styleFrom(
                        backgroundColor: AppColors.primaryDark,
                        side: const BorderSide(color: Color(0xFFD4AF37), width: 0.9),
                        padding: const EdgeInsets.all(12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoField({
    required IconData icon,
    required String label,
    required String value,
    Color? iconColor,
    Color? valueColor,
    bool isHighlight = false,
    bool isFullText = false,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 15, color: iconColor ?? const Color(0xFFD4AF37)),
        const SizedBox(width: 8),
        Text(
          label,
          style: GoogleFonts.spaceGrotesk(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: Colors.white70,
          ),
        ),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 11.5,
              fontWeight: isHighlight ? FontWeight.w700 : FontWeight.w500,
              color: valueColor ?? (isHighlight ? const Color(0xFFD4AF37) : Colors.white),
              height: 1.35,
            ),
          ),
        ),
      ],
    );
  }
}
