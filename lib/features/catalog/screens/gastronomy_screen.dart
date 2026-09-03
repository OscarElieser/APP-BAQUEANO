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
// - Interfaz responsiva de alta gama visual con filtros por tradición culinaria (Maíz Ancestral, Sabores Criollos, Lácteos),
//   efectos Glassmorphism con bordes dorados, fichas exhaustivas con direcciones exactas sin recortes,
//   maridajes típicos nicaragüenses (cacao con leche, café de palo, tiste, chicha) y llamadas/WhatsApp en un solo toque.
// - Cero desbordamientos de pantalla en cualquier resolución mediante Flexibles y Wraps.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - GastronomyScreen: Pantalla completa de gastronomía típica con lista interactiva y conectividad directa.
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
import '../../../core/widgets/baqueano_adaptive_image.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';

class GastronomyScreen extends StatefulWidget {
  const GastronomyScreen({super.key});

  @override
  State<GastronomyScreen> createState() => _GastronomyScreenState();
}

class _GastronomyScreenState extends State<GastronomyScreen> {
  String _selectedCategory = 'Todos';

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

  String _getPairing(String dishName) {
    final lower = dishName.toLowerCase();
    if (lower.contains('gallo pinto')) {
      return '☕ Café de palo de Matagalpa o cacao con leche';
    } else if (lower.contains('nacatamal')) {
      return '☕ Café negro caliente recién colado en jícaro';
    } else if (lower.contains('vigorón')) {
      return '🥤 Chicha de maíz con hielo o fresco de grama';
    } else if (lower.contains('indio viejo')) {
      return '🍶 Tiste helado molido con cacao y maíz tostado';
    } else if (lower.contains('sopa de queso')) {
      return '🍹 Fresco de tamarindo o pozol con leche';
    } else if (lower.contains('güirila')) {
      return '🥛 Cuajada fresca campesina y café norteño';
    } else if (lower.contains('carne asada')) {
      return '🥤 Cacao con leche bien frío o chía con tamarindo';
    } else if (lower.contains('chancho con yuca')) {
      return '🍹 Chicha de maíz o fresco de pitahaya con limón';
    } else if (lower.contains('salpicón')) {
      return '🍶 Fresco de melón criollo o limonada con dulce';
    } else if (lower.contains('mondongo')) {
      return '🥤 Naranjada agria helada o fresco de cebada';
    } else if (lower.contains('sopa de res')) {
      return '🍹 Fresco de calala o tamarindo helado';
    } else if (lower.contains('rondón') || lower.contains('rice and beans') || lower.contains('pan de coco')) {
      return '🥥 Agua de coco bien fría o ginger beer caribeña';
    } else if (lower.contains('bebidas') || lower.contains('repostería')) {
      return '🍪 Rosquilla somoteña o buñuelo con miel de caña';
    }
    return '☕ Bebida típica ancestral recomendada';
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    final List<GastronomyDish> allDishes = CatalogData.gastronomyDishes;
    final List<GastronomyDish> filteredDishes = _selectedCategory == 'Todos'
        ? allDishes
        : allDishes.where((d) {
            if (_selectedCategory == '🔥 Fritanga & Fuertes') {
              return d.category?.contains('Fritanga') == true;
            } else if (_selectedCategory == '🍲 Sopas & Guisos') {
              return d.category?.contains('Sopas') == true;
            } else if (_selectedCategory == '🥥 Cocina Caribeña') {
              return d.category?.contains('Caribeña') == true;
            } else if (_selectedCategory == '🥤 Bebidas & Antojos') {
              return d.category?.contains('Bebidas') == true;
            }
            return true;
          }).toList();

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
              subtitle: 'La cocina nicaragüense: una explosión de maíz criollo, cacao, carnes al carbón, coco caribeño y recetas precolombinas.',
            ),
            const SizedBox(height: 16),

            // Hero Banner Visualmente Impactante
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                gradient: AppGradients.volcanicHero,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: AppColors.gold, width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.gold.withValues(alpha: 0.15),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.gold.withValues(alpha: 0.15),
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.goldLight),
                        ),
                        child: const Text('🌽', style: TextStyle(fontSize: 28)),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'SOBERANÍA DEL MAÍZ & SABORES DE TIERRA ADENTRO',
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 12,
                                fontWeight: FontWeight.w800,
                                color: AppColors.goldLight,
                                letterSpacing: 0.8,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              '«Somos hijos del maíz». Recetas heredadas de abuelas y cocineras rurales.',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                color: Colors.white70,
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  const Divider(color: AppColors.borderLight, height: 1),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 16,
                    runSpacing: 8,
                    children: [
                      _buildHeroStat('${allDishes.length} Recetas Clásicas', Icons.restaurant_menu_rounded),
                      _buildHeroStat('Comercio Justo', Icons.handshake_rounded),
                      _buildHeroStat('100% Directo a Familias', Icons.savings_rounded),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Chips Filtros de Categorías Culinarias
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: ['Todos', '🔥 Fritanga & Fuertes', '🍲 Sopas & Guisos', '🥥 Cocina Caribeña', '🥤 Bebidas & Antojos'].map((category) {
                  final isSelected = _selectedCategory == category;
                  return Padding(
                    padding: const EdgeInsets.only(right: 10.0),
                    child: InkWell(
                      onTap: () {
                        HapticFeedback.selectionClick();
                        setState(() => _selectedCategory = category);
                      },
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.terracotta : AppColors.primaryDark,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected ? AppColors.gold : AppColors.borderLight,
                            width: isSelected ? 1.2 : 0.8,
                          ),
                          boxShadow: isSelected
                              ? [
                                  BoxShadow(
                                    color: AppColors.terracotta.withValues(alpha: 0.4),
                                    blurRadius: 10,
                                    offset: const Offset(0, 3),
                                  )
                                ]
                              : null,
                        ),
                        child: Text(
                          category == 'Todos' ? 'Todos (${allDishes.length})' : category,
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                            color: isSelected ? Colors.white : AppColors.textMuted,
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 24),

            // Lista de Platillos Gastronómicos con Información Completa
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: filteredDishes.length,
              separatorBuilder: (_, __) => const SizedBox(height: 24),
              itemBuilder: (context, index) {
                final dish = filteredDishes[index];
                return _buildDishCard(context, dish);
              },
            ),

            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroStat(String text, IconData icon) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: AppColors.goldLight),
        const SizedBox(width: 5),
        Text(
          text,
          style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.goldLight),
        ),
      ],
    );
  }

  Widget _buildDishCard(BuildContext context, GastronomyDish dish) {
    return Container(
      decoration: BoxDecoration(
        gradient: AppGradients.cardGlass,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.borderGold.withValues(alpha: 0.6), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.45),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Imagen en Alta Definición con Badges Flotantes
          Stack(
            children: [
              BaqueanoAdaptiveImage(
                imageUrl: dish.imageUrl,
                height: 210,
                width: double.infinity,
                fit: BoxFit.cover,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                fallbackWidget: Container(
                  height: 210,
                  color: AppColors.primaryLight,
                  child: Center(child: Text(dish.icon, style: const TextStyle(fontSize: 54))),
                ),
              ),
              // Sombra degradada para contraste
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.black.withValues(alpha: 0.5),
                        Colors.transparent,
                        Colors.black.withValues(alpha: 0.7),
                      ],
                      stops: const [0.0, 0.5, 1.0],
                    ),
                  ),
                ),
              ),
              // Badges Superiores Adaptativos (Región & Precio Estimado protegidos contra colisiones)
              Positioned(
                top: 12,
                left: 12,
                right: 12,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // Badge de Región
                    Flexible(
                      flex: 2,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: AppColors.bgDark.withValues(alpha: 0.92),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.gold, width: 1.2),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withValues(alpha: 0.4), blurRadius: 6),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.place_rounded, size: 14, color: AppColors.gold),
                            const SizedBox(width: 4),
                            Flexible(
                              child: Text(
                                dish.region,
                                style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.goldLight),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),

                    // Badge de Precio Estimado (Autoescalable para no solapar la región)
                    Flexible(
                      flex: 3,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          gradient: AppGradients.sunsetTerracotta,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.white24, width: 0.8),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withValues(alpha: 0.5), blurRadius: 8),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.payments_rounded, size: 13, color: Colors.white),
                            const SizedBox(width: 4),
                            Flexible(
                              child: FittedBox(
                                fit: BoxFit.scaleDown,
                                alignment: Alignment.centerRight,
                                child: Text(
                                  dish.estimatedPrice,
                                  style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w900, color: Colors.white),
                                  maxLines: 1,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              // Nombre del Platillo Superpuesto en la Base de la Imagen
              Positioned(
                bottom: 12,
                left: 16,
                right: 16,
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: AppColors.bgDark.withValues(alpha: 0.85),
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.borderGold),
                      ),
                      child: Text(dish.icon, style: const TextStyle(fontSize: 20)),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        dish.name,
                        style: GoogleFonts.montserrat(
                          fontSize: 19,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          shadows: [
                            const Shadow(color: Colors.black, blurRadius: 8),
                          ],
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
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
                // Reseña Histórica Ancestral
                Text(
                  dish.history,
                  style: GoogleFonts.inter(fontSize: 12.5, color: AppColors.textLight.withValues(alpha: 0.88), height: 1.45),
                ),
                const SizedBox(height: 14),

                // Maridaje Típico Sugerido
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight.withValues(alpha: 0.4),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.gold.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.local_cafe_rounded, size: 15, color: AppColors.goldLight),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Maridaje recomendado: ${_getPairing(dish.name)}',
                          style: GoogleFonts.inter(fontSize: 11.5, color: AppColors.goldLight, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
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

                // 🧭 FICHA DEL COMEDOR & ANFITRIONA RURAL (INFORMACIÓN COMPLETA Y VISIBLE)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF041920).withValues(alpha: 0.95),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.borderGold, width: 1.2),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.3),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.storefront_rounded, size: 18, color: AppColors.gold),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'PUESTO & COMEDOR CAMPESINO RECOMENDADO',
                              style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.gold, letterSpacing: 0.8),
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

                      // Dirección Completa (Totalmente visible sin truncamiento)
                      _buildInfoField(
                        icon: Icons.location_on_rounded,
                        label: 'Dirección Completa:',
                        value: dish.fullAddress,
                        isFullText: true,
                        iconColor: AppColors.terracottaLight,
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
                          backgroundColor: AppColors.terracotta,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 13),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          elevation: 4,
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
                          side: const BorderSide(color: Color(0xFF25D366), width: 1.3),
                          padding: const EdgeInsets.symmetric(vertical: 13),
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
                      icon: const Icon(Icons.map_rounded, size: 18, color: AppColors.gold),
                      style: IconButton.styleFrom(
                        backgroundColor: AppColors.primaryDark,
                        side: const BorderSide(color: AppColors.gold, width: 1.0),
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
        Icon(icon, size: 15, color: iconColor ?? AppColors.gold),
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
              color: valueColor ?? (isHighlight ? AppColors.goldLight : Colors.white),
              height: 1.35,
            ),
          ),
        ),
      ],
    );
  }
}
