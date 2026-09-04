// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — GALERÍA MANUAL 3D DE ALIADOS & COOPERATIVAS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Mostrar de forma inmersiva y estandarizada a las cooperativas campesinas, fincas
//   ecológicas, comedores ancestrales y asociaciones de guías locales de Nicaragua.
// - Ofrecer interacción táctil directa: al tocar cualquier tarjeta, esta gira 180°
//   en un espacio tridimensional (3D Flip) para revelar los canales de contacto
//   directo (WhatsApp, llamada telefónica y ubicación en el mapa) sin intermediarios.
// - Armonizar el diseño con los demás carruseles del ecosistema Baqueano (Destinos,
//   Negocios Locales y Testimonios) utilizando SectionHeader y badges canónicos.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Desplazamiento horizontal manual controlado por `ScrollController` y físicas
//   `BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics())` de alta respuesta táctil.
// - Efecto de volteo 3D (`Flip Card`) implementado con `Transform` y matriz de perspectiva
//   `Matrix4.identity()..setEntry(3, 2, 0.001)..rotateY(angle)` para alternar entre el
//   anverso institucional y el reverso de contacto directo campesino.
// - Integración con `url_launcher` para llamadas y mensajería directa en comercio justo.
// - Aislamiento de capas de dibujo con `RepaintBoundary` para asegurar 60 FPS estables.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `InteractiveAlliesGallery`: Galería horizontal manual con tarjetas interactivas 3D.
// ============================================================================

import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../core/widgets/section_header.dart';

class InteractiveAlliesGallery extends StatefulWidget {
  const InteractiveAlliesGallery({super.key});

  @override
  State<InteractiveAlliesGallery> createState() =>
      _InteractiveAlliesGalleryState();
}

class _InteractiveAlliesGalleryState extends State<InteractiveAlliesGallery> {
  /// Controlador del carrusel horizontal manual
  late final ScrollController _scrollController;

  /// Lista curada de cooperativas campesinas y aliados comunitarios de Nicaragua
  final List<Map<String, dynamic>> _allies = const [
    {
      'id': 'selva_negra',
      'name': 'Finca Selva Negra',
      'department': 'Matagalpa',
      'specialty': 'Café Sombra & Bosque de Niebla',
      'category': 'Agroturismo',
      'leader': 'Don Eddy & Familia',
      'phone': '+505 8456 1234',
      'whatsapp': '50584561234',
      'icon': Icons.forest_rounded,
      'accentColor': Color(0xFF2E7D32),
      'verified': true,
    },
    {
      'id': 'cerro_negro',
      'name': 'Cerro Negro Volcano Club',
      'department': 'León',
      'specialty': 'Sandboarding en Cenizas Activas',
      'category': 'Aventura Extrema',
      'leader': 'Comité de Jóvenes Guías',
      'phone': '+505 8765 4321',
      'whatsapp': '50587654321',
      'icon': Icons.terrain_rounded,
      'accentColor': Color(0xFFFF5722),
      'verified': true,
    },
    {
      'id': 'somoto_canyon',
      'name': 'Baqueanos del Cañón de Somoto',
      'department': 'Madriz',
      'specialty': 'Navegación & Nado en Cañón Rupestre',
      'category': 'Geoturismo',
      'leader': 'Cooperativa La Guayaba',
      'phone': '+505 8123 9876',
      'whatsapp': '50581239876',
      'icon': Icons.kayaking_rounded,
      'accentColor': Color(0xFF4FC3F7),
      'verified': true,
    },
    {
      'id': 'ometepe_kayaks',
      'name': 'Ometepe Eco-Hospedajes',
      'department': 'Rivas',
      'specialty': 'Río Istián & Fincas Volcánicas',
      'category': 'Hospedaje Rural',
      'leader': 'Red Comunitaria Altagracia',
      'phone': '+505 8989 3322',
      'whatsapp': '50589893322',
      'icon': Icons.cottage_rounded,
      'accentColor': Color(0xFFD4AF37),
      'verified': true,
    },
    {
      'id': 'san_juan_oriente',
      'name': 'Alfarería San Juan de Oriente',
      'department': 'Masaya',
      'specialty': 'Cerámica Precolombina en Torno',
      'category': 'Artesanía Ancestral',
      'leader': 'Maestros Artesanos Unidos',
      'phone': '+505 8333 4455',
      'whatsapp': '50583334455',
      'icon': Icons.handyman_rounded,
      'accentColor': Color(0xFFC86432),
      'verified': true,
    },
    {
      'id': 'indio_maiz',
      'name': 'Guardianes de Indio Maíz',
      'department': 'Río San Juan',
      'specialty': 'Expediciones en Selva Virgen',
      'category': 'Soberanía Forestal',
      'leader': 'Comunidad Rama & Baqueanos',
      'phone': '+505 8222 1100',
      'whatsapp': '50582221100',
      'icon': Icons.eco_rounded,
      'accentColor': Color(0xFF00897B),
      'verified': true,
    },
  ];

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // --------------------------------------------------------------------
        // 🧭 ENCABEZADO CANÓNICO ESTANDARIZADO (IDÉNTICO A LOS DEMÁS CARRUSELES)
        // --------------------------------------------------------------------
        Padding(
          padding: EdgeInsets.symmetric(horizontal: isDesktop ? 48.0 : 20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SectionHeader(
                tag: 'RED NACIONAL DE COOPERATIVAS & GUÍAS',
                title: 'Aliados Locales en Modo 3D',
                subtitle:
                    'Conexión directa con cooperativas campesinas, artesanos y guías nativos en perspectiva tridimensional interactiva.',
                isCentered: true,
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                decoration: BoxDecoration(
                  color: AppColors.gold.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: AppColors.borderGold.withValues(alpha: 0.4),
                    width: 0.8,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.flip_rounded,
                      size: 13,
                      color: AppColors.gold,
                    ),
                    const SizedBox(width: 6),
                    Flexible(
                      child: Text(
                        'DESLIZA Y VOLTEA · ${_allies.length} COOPERATIVAS EN MODO 3D',
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

        // --------------------------------------------------------------------
        // 📱 CARRUSEL HORIZONTAL MANUAL AISLADO CON REPAINT BOUNDARY
        // --------------------------------------------------------------------
        RepaintBoundary(
          child: SizedBox(
            height: 250,
            child: ListView.separated(
              controller: _scrollController,
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(
                parent: AlwaysScrollableScrollPhysics(),
              ),
              padding: EdgeInsets.symmetric(
                horizontal: isDesktop ? 48.0 : 20.0,
              ),
              itemCount: _allies.length,
              separatorBuilder: (_, __) => const SizedBox(width: 16),
              itemBuilder: (context, index) {
                final ally = _allies[index];
                return RepaintBoundary(
                  child: _FlipAllyCard(
                    key: ValueKey<String>(ally['id'] as String),
                    ally: ally,
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

/// Tarjeta individual con efecto de volteo tridimensional (3D Flip Card)
class _FlipAllyCard extends StatefulWidget {
  final Map<String, dynamic> ally;

  const _FlipAllyCard({super.key, required this.ally});

  @override
  State<_FlipAllyCard> createState() => _FlipAllyCardState();
}

class _FlipAllyCardState extends State<_FlipAllyCard>
    with SingleTickerProviderStateMixin {
  late final AnimationController _flipController;
  late final Animation<double> _flipAnimation;
  bool _isFlipped = false;

  @override
  void initState() {
    super.initState();
    _flipController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );

    _flipAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _flipController, curve: Curves.easeInOutBack),
    );
  }

  @override
  void dispose() {
    _flipController.dispose();
    super.dispose();
  }

  /// Alterna el giro de la tarjeta en 180 grados
  void _toggleFlip() {
    if (_isFlipped) {
      _flipController.reverse();
    } else {
      _flipController.forward();
    }
    setState(() => _isFlipped = !_isFlipped);
  }

  /// Lanza WhatsApp para contacto directo sin comisiones
  Future<void> _launchWhatsApp(String phone, String name) async {
    final clean = phone.replaceAll(RegExp(r'[^0-9]'), '');
    final uri = Uri.parse(
      'https://wa.me/$clean?text=Hola%2C%20vi%20su%20cooperativa%20$name%20en%20la%20app%20Baqueano%20y%20deseo%20m%C3%A1s%20informaci%C3%B3n.',
    );
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (mounted) {
          CustomToast.error(
            context,
            'WhatsApp no disponible en este dispositivo',
          );
        }
      }
    } catch (_) {
      if (mounted) {
        CustomToast.error(context, 'No se pudo abrir WhatsApp');
      }
    }
  }

  /// Lanza llamada telefónica directa
  Future<void> _launchPhone(String phone) async {
    final uri = Uri.parse('tel:$phone');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        if (mounted) {
          CustomToast.show(context, message: 'Teléfono: $phone');
        }
      }
    } catch (_) {
      if (mounted) {
        CustomToast.show(context, message: 'Teléfono: $phone');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final ally = widget.ally;
    final accentColor = ally['accentColor'] as Color;

    return AnimatedBuilder(
      animation: _flipAnimation,
      builder: (context, child) {
        // Cálculo del ángulo en radianes (de 0 a pi)
        final angle = _flipAnimation.value * math.pi;
        final isUnder = angle > (math.pi / 2);

        final transform =
            Matrix4.identity()
              ..setEntry(3, 2, 0.001) // Perspectiva 3D
              ..rotateY(angle);

        return GestureDetector(
          onTap: _toggleFlip,
          child: Transform(
            transform: transform,
            alignment: FractionalOffset.center,
            child:
                isUnder
                    // Reverso (espejado para que el texto sea legible al voltear)
                    ? Transform(
                      transform: Matrix4.identity()..rotateY(math.pi),
                      alignment: FractionalOffset.center,
                      child: _buildBackSide(ally, accentColor),
                    )
                    // Anverso
                    : _buildFrontSide(ally, accentColor),
          ),
        );
      },
    );
  }

  /// Anverso de la tarjeta (Identidad y Especialidad)
  Widget _buildFrontSide(Map<String, dynamic> ally, Color accentColor) {
    return Container(
      width: 295,
      height: 230,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0C3843), Color(0xFF072129)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: accentColor.withValues(alpha: 0.5),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.35),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Fila superior: Icono temático + Departamento + Badge 3D
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: accentColor.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: accentColor.withValues(alpha: 0.4)),
                ),
                child: Icon(
                  ally['icon'] as IconData,
                  color: accentColor,
                  size: 22,
                ),
              ),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight.withValues(alpha: 0.7),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.location_on,
                          size: 10,
                          color: AppColors.goldLight,
                        ),
                        const SizedBox(width: 3),
                        Text(
                          ally['department'] as String,
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 9.5,
                            fontWeight: FontWeight.w700,
                            color: AppColors.goldLight,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 7,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.gold.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: AppColors.borderGold.withValues(alpha: 0.4),
                      ),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.flip_rounded,
                          size: 10,
                          color: AppColors.goldLight,
                        ),
                        const SizedBox(width: 3),
                        Text(
                          '3D',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 9.5,
                            fontWeight: FontWeight.w800,
                            color: AppColors.goldLight,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),

          // Cuerpo de la tarjeta
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                ally['name'] as String,
                style: GoogleFonts.montserrat(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 5),
              Text(
                ally['specialty'] as String,
                style: GoogleFonts.inter(
                  fontSize: 12,
                  color: AppColors.textLight.withValues(alpha: 0.85),
                  height: 1.35,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),

          // Pie de la tarjeta: Categoría y sugerencia táctil de giro
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                ally['category'] as String,
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 10.5,
                  fontWeight: FontWeight.w700,
                  color: AppColors.gold,
                ),
              ),
              Row(
                children: [
                  Icon(Icons.touch_app_rounded, size: 13, color: accentColor),
                  const SizedBox(width: 4),
                  Text(
                    'Toca para girar',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: accentColor,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Reverso de la tarjeta (Canales de Contacto Directo Campesino)
  Widget _buildBackSide(Map<String, dynamic> ally, Color accentColor) {
    return Container(
      width: 295,
      height: 230,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0F3A47), Color(0xFF08262E)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.gold, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: AppColors.gold.withValues(alpha: 0.2),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Cabecera del reverso
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'CONTACTO DIRECTO',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 10.5,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.1,
                  color: AppColors.gold,
                ),
              ),
              Row(
                children: [
                  const Icon(
                    Icons.verified_user_rounded,
                    color: AppColors.gold,
                    size: 15,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Verificado',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 9.5,
                      fontWeight: FontWeight.w700,
                      color: AppColors.goldLight,
                    ),
                  ),
                ],
              ),
            ],
          ),

          // Datos del anfitrión o cooperativa
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                ally['leader'] as String,
                style: GoogleFonts.montserrat(
                  fontSize: 13.5,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                ally['phone'] as String,
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 11.5,
                  color: AppColors.textLight.withValues(alpha: 0.8),
                ),
              ),
            ],
          ),

          // Botones de acción directa (WhatsApp, llamada y mapa)
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed:
                      () => _launchWhatsApp(
                        ally['whatsapp'] as String,
                        ally['name'] as String,
                      ),
                  icon: const Icon(
                    Icons.chat_bubble_rounded,
                    size: 14,
                    color: Colors.white,
                  ),
                  label: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Text(
                      'WHATSAPP',
                      style: GoogleFonts.montserrat(
                        fontSize: 9.5,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF25D366),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 9),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              InkWell(
                onTap: () => _launchPhone(ally['phone'] as String),
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.terracotta,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.phone_rounded,
                    size: 15,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(width: 6),
              InkWell(
                onTap: () => context.go('/mapa'),
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.primaryDark,
                    border: Border.all(color: AppColors.borderGold),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.map_rounded,
                    size: 15,
                    color: AppColors.gold,
                  ),
                ),
              ),
            ],
          ),

          // Indicador de retorno
          Center(
            child: Text(
              'Toca para volver al frente',
              style: GoogleFonts.spaceGrotesk(
                fontSize: 9.5,
                color: AppColors.gold.withValues(alpha: 0.7),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
