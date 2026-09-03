// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — GALERÍA INFINITA 3D DE ALIADOS & COOPERATIVAS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Mostrar de forma inmersiva y continua a las cooperativas campesinas, fincas
//   ecológicas, comedores ancestrales y asociaciones de guías locales de Nicaragua.
// - Ofrecer interacción táctil directa: al tocar cualquier tarjeta, esta gira 180°
//   en un espacio tridimensional (3D Flip) para revelar los canales de contacto
//   directo (WhatsApp, llamada telefónica y ubicación en el mapa) sin intermediarios.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Desplazamiento infinito continuo a 60 FPS controlado por `ScrollController` que
//   se pausa de forma reactiva al interactuar con cualquier tarjeta.
// - Efecto de volteo 3D (`Flip Card`) implementado con `Transform` y matriz de perspectiva
//   `Matrix4.identity()..setEntry(3, 2, 0.001)..rotateY(angle)` para alternar entre el
//   anverso institucional y el reverso de contacto directo.
// - Integración con `url_launcher` para llamadas y mensajería directa en comercio justo.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `InteractiveAlliesGallery`: Galería horizontal motorizada con tarjetas interactivas 3D.
// ============================================================================

import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/custom_toast.dart';

class InteractiveAlliesGallery extends StatefulWidget {
  const InteractiveAlliesGallery({super.key});

  @override
  State<InteractiveAlliesGallery> createState() => _InteractiveAlliesGalleryState();
}

class _InteractiveAlliesGalleryState extends State<InteractiveAlliesGallery> {
  /// Controlador del carrusel horizontal con animación continua
  late final ScrollController _scrollController;

  /// Bandera para evitar fugas de memoria al desmontar el widget
  bool _isDisposed = false;

  /// Estado de pausa manual cuando el usuario está interactuando
  bool _isPaused = false;

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
    WidgetsBinding.instance.addPostFrameCallback((_) => _startContinuousScroll());
  }

  /// Bucle asíncrono para desplazamiento continuo fluido sin saltos visibles
  void _startContinuousScroll() async {
    while (!_isDisposed && mounted) {
      if (_scrollController.hasClients && !_isPaused) {
        final maxScroll = _scrollController.position.maxScrollExtent;
        final currentScroll = _scrollController.offset;
        final remaining = maxScroll - currentScroll;

        if (remaining > 0) {
          // Velocidad constante suave (28ms por píxel)
          final durationMs = (remaining * 28).toInt();
          await _scrollController.animateTo(
            maxScroll,
            duration: Duration(milliseconds: durationMs),
            curve: Curves.linear,
          );
        }

        // Retorno sin parpadeo al inicio del ciclo
        if (!_isDisposed && mounted && _scrollController.hasClients && !_isPaused) {
          _scrollController.jumpTo(0);
        }
      } else {
        await Future.delayed(const Duration(milliseconds: 300));
      }
    }
  }

  @override
  void dispose() {
    _isDisposed = true;
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    // Multiplicación de la lista para crear el efecto de galería infinita
    final continuousList = [
      ..._allies,
      ..._allies,
      ..._allies,
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Cabecera de sección centrada
        Padding(
          padding: EdgeInsets.symmetric(horizontal: isDesktop ? 48.0 : 20.0),
          child: Center(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Wrap(
                  alignment: WrapAlignment.center,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  spacing: 8,
                  runSpacing: 6,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(7),
                      decoration: BoxDecoration(
                        color: AppColors.gold.withValues(alpha: 0.15),
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.gold.withValues(alpha: 0.4)),
                      ),
                      child: const Icon(Icons.hub_rounded, color: AppColors.gold, size: 18),
                    ),
                    Text(
                      'RED NACIONAL DE COOPERATIVAS & GUÍAS',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.3,
                        color: AppColors.gold,
                      ),
                    ),
                    _buildFlipHintBadge(),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  'Aliados Locales en Modo 3D',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.montserrat(
                    fontSize: isDesktop ? 22 : 18,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 16),

        // Carrusel horizontal infinito con tarjetas de giro 3D
        SizedBox(
          height: 215,
          child: Listener(
            onPointerDown: (_) => setState(() => _isPaused = true),
            onPointerUp: (_) {
              setState(() => _isPaused = false);
              _startContinuousScroll();
            },
            child: ListView.separated(
              controller: _scrollController,
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              padding: EdgeInsets.symmetric(horizontal: isDesktop ? 48.0 : 20.0),
              itemCount: continuousList.length,
              separatorBuilder: (_, __) => const SizedBox(width: 16),
              itemBuilder: (context, index) {
                final ally = continuousList[index];
                return _FlipAllyCard(ally: ally);
              },
            ),
          ),
        ),
      ],
    );
  }

  /// Badge indicador de interacción 3D para voltear tarjeta
  Widget _buildFlipHintBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.primaryLight.withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderGold.withValues(alpha: 0.4)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.flip_rounded, size: 12, color: AppColors.goldLight),
          const SizedBox(width: 4),
          Text(
            'Giro 3D',
            style: GoogleFonts.spaceGrotesk(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: AppColors.goldLight,
            ),
          ),
        ],
      ),
    );
  }
}

/// Tarjeta individual con efecto de volteo tridimensional (3D Flip Card)
class _FlipAllyCard extends StatefulWidget {
  final Map<String, dynamic> ally;

  const _FlipAllyCard({required this.ally});

  @override
  State<_FlipAllyCard> createState() => _FlipAllyCardState();
}

class _FlipAllyCardState extends State<_FlipAllyCard> with SingleTickerProviderStateMixin {
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
          CustomToast.error(context, 'WhatsApp no disponible en este dispositivo');
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

        final transform = Matrix4.identity()
          ..setEntry(3, 2, 0.001) // Perspectiva 3D
          ..rotateY(angle);

        return GestureDetector(
          onTap: _toggleFlip,
          child: Transform(
            transform: transform,
            alignment: FractionalOffset.center,
            child: isUnder
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
      width: 250,
      height: 200,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primaryDark.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: accentColor.withValues(alpha: 0.5), width: 1.2),
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
                child: Icon(ally['icon'] as IconData, color: accentColor, size: 22),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight.withValues(alpha: 0.7),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.location_on, size: 10, color: AppColors.goldLight),
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
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                ally['name'] as String,
                style: GoogleFonts.montserrat(
                  fontSize: 14.5,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Text(
                ally['specialty'] as String,
                style: GoogleFonts.inter(
                  fontSize: 11.5,
                  color: AppColors.textLight.withValues(alpha: 0.8),
                  height: 1.3,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                ally['category'] as String,
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: AppColors.gold,
                ),
              ),
              Row(
                children: [
                  Icon(Icons.touch_app, size: 12, color: accentColor),
                  const SizedBox(width: 4),
                  Text(
                    'Contacto 3D',
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
      width: 250,
      height: 200,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primaryLight.withValues(alpha: 0.95),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.gold, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: AppColors.gold.withValues(alpha: 0.25),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'CONTACTO DIRECTO',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.1,
                  color: AppColors.gold,
                ),
              ),
              const Icon(Icons.verified_user_rounded, color: AppColors.gold, size: 16),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                ally['leader'] as String,
                style: GoogleFonts.montserrat(
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                ally['phone'] as String,
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 11,
                  color: AppColors.textLight.withValues(alpha: 0.75),
                ),
              ),
            ],
          ),
          // Botones de acción directa
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _launchWhatsApp(
                    ally['whatsapp'] as String,
                    ally['name'] as String,
                  ),
                  icon: const Icon(Icons.chat_bubble_rounded, size: 14, color: Colors.white),
                  label: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Text(
                      'WHATSAPP',
                      style: GoogleFonts.montserrat(fontSize: 9.5, fontWeight: FontWeight.w800),
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF25D366),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              InkWell(
                onTap: () => _launchPhone(ally['phone'] as String),
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  padding: const EdgeInsets.all(9),
                  decoration: BoxDecoration(
                    color: AppColors.terracotta,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.phone_rounded, size: 15, color: Colors.white),
                ),
              ),
              const SizedBox(width: 6),
              InkWell(
                onTap: () => context.go('/mapa'),
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  padding: const EdgeInsets.all(9),
                  decoration: BoxDecoration(
                    color: AppColors.primaryDark,
                    border: Border.all(color: AppColors.borderGold),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.map_rounded, size: 15, color: AppColors.gold),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
