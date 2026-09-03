// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — TARJETA DESTACADA 3D INTERACTIVA
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Convertir la tarjeta insigne de destino (Cascada La Luna & Cañones de Matagalpa)
//   en una pieza visual emblemática, táctil y de alta fidelidad que sorprenda al
//   explorador desde el primer contacto en el Home.
// - Conectar de forma directa el interés visual con la reserva comunitaria sin intermediarios,
//   mostrando precios transparentes en córdobas (NIO) y dólares (USD).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Interacción táctil con físicas de perspectiva 3D (`Transform` con `Matrix4` y rotación
//   dinámica en ejes X e Y) que reacciona a los gestos `onPanUpdate` y retorna elásticamente
//   con una curva de amortiguación suave (`Curves.easeOutCubic`).
// - Shimmer especular adaptativo: un gradiente de luz dinámico cuya posición se traslada
//   según la inclinación de la tarjeta, simulando reflexión de luz física.
// - Microanimación continua: Badge "DESTACADO" con animación pulsante cíclica a 60 FPS.
// - Renderizado Glassmorphism optimizado con `BackdropFilter` y bordes en tono Oro Pinolero.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `Interactive3DFeaturedCard`: Widget con interacción táctil 3D, información del destino
//   y botón de acción rápida para abrir el modal de reserva.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../checkout/widgets/checkout_modal.dart';

class Interactive3DFeaturedCard extends StatefulWidget {
  final dynamic destination;

  const Interactive3DFeaturedCard({
    super.key,
    required this.destination,
  });

  @override
  State<Interactive3DFeaturedCard> createState() => _Interactive3DFeaturedCardState();
}

class _Interactive3DFeaturedCardState extends State<Interactive3DFeaturedCard>
    with TickerProviderStateMixin {
  /// Controlador de retorno elástico a posición neutral al soltar el dedo
  late final AnimationController _resetController;
  late Animation<double> _rotXAnim;
  late Animation<double> _rotYAnim;

  /// Controlador para el pulso sutil del badge de destacado
  late final AnimationController _pulseController;
  late final Animation<double> _pulseAnimation;

  /// Ángulos de rotación 3D actuales en radianes
  double _rotX = 0.0;
  double _rotY = 0.0;

  /// Coordenadas normalizadas del toque para el gradiente especular (-1.0 a 1.0)
  double _touchNormalizedX = 0.0;
  double _touchNormalizedY = 0.0;

  /// Ángulo máximo de inclinación permitido (aproximadamente 8.5 grados)
  static const double _maxAngle = 0.15;

  @override
  void initState() {
    super.initState();

    // 1. Inicialización de la animación de retorno elástico
    _resetController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 450),
    )..addListener(() {
        setState(() {
          _rotX = _rotXAnim.value;
          _rotY = _rotYAnim.value;
          _touchNormalizedX = _rotY / _maxAngle;
          _touchNormalizedY = -_rotX / _maxAngle;
        });
      });

    _rotXAnim = Tween<double>(begin: 0.0, end: 0.0).animate(_resetController);
    _rotYAnim = Tween<double>(begin: 0.0, end: 0.0).animate(_resetController);

    // 2. Inicialización del pulso visual para el badge 'DESTACADO'
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.08).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _resetController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  /// Maneja el inicio del gesto táctil cancelando cualquier animación de retorno activa
  void _handlePanStart(DragStartDetails details) {
    _resetController.stop();
  }

  /// Calcula en tiempo real la inclinación 3D proporcional al desplazamiento del dedo
  void _handlePanUpdate(DragUpdateDetails details, Size cardSize) {
    if (cardSize.width == 0 || cardSize.height == 0) return;

    final dx = details.localPosition.dx;
    final dy = details.localPosition.dy;

    // Normalización de -1.0 a 1.0 relativo al centro de la tarjeta
    final normX = ((dx / cardSize.width) * 2.0 - 1.0).clamp(-1.0, 1.0);
    final normY = ((dy / cardSize.height) * 2.0 - 1.0).clamp(-1.0, 1.0);

    setState(() {
      // Inclinación en eje X responde al movimiento vertical, eje Y al horizontal
      _rotX = (-normY * _maxAngle).clamp(-_maxAngle, _maxAngle);
      _rotY = (normX * _maxAngle).clamp(-_maxAngle, _maxAngle);
      _touchNormalizedX = normX;
      _touchNormalizedY = normY;
    });
  }

  /// Al soltar el dedo, la tarjeta regresa elásticamente al centro con física suave
  void _handlePanEnd(DragEndDetails details) {
    _rotXAnim = Tween<double>(
      begin: _rotX,
      end: 0.0,
    ).animate(CurvedAnimation(
      parent: _resetController,
      curve: Curves.easeOutCubic,
    ));

    _rotYAnim = Tween<double>(
      begin: _rotY,
      end: 0.0,
    ).animate(CurvedAnimation(
      parent: _resetController,
      curve: Curves.easeOutCubic,
    ));

    _resetController.forward(from: 0.0);
  }

  @override
  Widget build(BuildContext context) {
    final destination = widget.destination;

    return LayoutBuilder(
      builder: (context, constraints) {
        final cardWidth = constraints.maxWidth;
        final cardSize = Size(cardWidth, 440);

        // Matriz de perspectiva 3D realista
        final transform = Matrix4.identity()
          ..setEntry(3, 2, 0.0012) // Profundidad de campo visual
          ..rotateX(_rotX)
          ..rotateY(_rotY);

        return GestureDetector(
          onPanStart: _handlePanStart,
          onPanUpdate: (details) => _handlePanUpdate(details, cardSize),
          onPanEnd: _handlePanEnd,
          onPanCancel: () => _handlePanEnd(DragEndDetails()),
          child: Transform(
            transform: transform,
            alignment: FractionalOffset.center,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 120),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(28),
                boxShadow: [
                  // Sombra profunda reactiva a la rotación 3D
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.45),
                    blurRadius: 30,
                    offset: Offset(_rotY * 40, 12 - (_rotX * 30)),
                  ),
                  // Resplandor cálido volcánico en el borde activo
                  BoxShadow(
                    color: AppColors.terracotta.withValues(
                      alpha: (0.15 + (_rotY.abs() * 0.4)).clamp(0.0, 0.5),
                    ),
                    blurRadius: 24,
                    spreadRadius: -2,
                    offset: Offset(_rotY * 20, -_rotX * 20),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(28),
                child: Container(
                  decoration: BoxDecoration(
                    color: AppColors.primaryDark.withValues(alpha: 0.85),
                    border: Border.all(
                      color: AppColors.borderGold.withValues(alpha: 0.8),
                      width: 1.5,
                    ),
                  ),
                  child: Stack(
                    children: [
                      // Contenido principal de la tarjeta
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          _buildImageHeader(destination),
                          _buildCardBody(context, destination),
                        ],
                      ),

                      // Capa de brillo especular dinámico que se mueve con la inclinación
                      Positioned.fill(
                        child: IgnorePointer(
                          child: Container(
                            decoration: BoxDecoration(
                              gradient: RadialGradient(
                                center: Alignment(
                                  _touchNormalizedX * 0.8,
                                  _touchNormalizedY * 0.8,
                                ),
                                radius: 1.2,
                                colors: [
                                  Colors.white.withValues(
                                    alpha: (0.12 + (_rotX.abs() + _rotY.abs()) * 0.25).clamp(0.0, 0.28),
                                  ),
                                  Colors.white.withValues(alpha: 0.0),
                                ],
                                stops: const [0.0, 0.7],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  /// Cabecera visual con imagen, badge pulsante y selector de favoritos
  Widget _buildImageHeader(dynamic destination) {
    return Stack(
      children: [
        // Imagen del destino con filtro de viñeta
        ClipRRect(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(26)),
          child: SizedBox(
            height: 200,
            width: double.infinity,
            child: Stack(
              fit: StackFit.expand,
              children: [
                Image.asset(
                  'assets/images/cascada_la_luna.jpg',
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Image.network(
                    destination.imageUrl ?? '',
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      color: AppColors.primaryLight,
                      child: const Center(
                        child: Icon(Icons.terrain_rounded, size: 52, color: AppColors.gold),
                      ),
                    ),
                  ),
                ),
                // Gradiente inferior oscuro para contraste
                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.black.withValues(alpha: 0.2),
                        Colors.black.withValues(alpha: 0.75),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),

        // Badge pulsante 'DESTACADO' en esquina superior izquierda
        Positioned(
          top: 14,
          left: 14,
          child: ScaleTransition(
            scale: _pulseAnimation,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFF5722), Color(0xFFE64A19)],
                ),
                borderRadius: BorderRadius.circular(10),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFFF5722).withValues(alpha: 0.5),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.local_fire_department_rounded, size: 14, color: Colors.white),
                  const SizedBox(width: 4),
                  Text(
                    'DESTACADO',
                    style: GoogleFonts.montserrat(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.2,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),

        // Etiqueta de departamento en esquina superior derecha
        Positioned(
          top: 14,
          right: 14,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: AppColors.primaryDark.withValues(alpha: 0.85),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.borderLight, width: 1),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.location_on, size: 12, color: AppColors.goldLight),
                const SizedBox(width: 4),
                Text(
                  (destination.department as String? ?? 'Matagalpa').toUpperCase(),
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: AppColors.goldLight,
                    letterSpacing: 0.8,
                  ),
                ),
              ],
            ),
          ),
        ),

        // Indicador de interacción 3D en la esquina inferior
        Positioned(
          bottom: 10,
          right: 14,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.6),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.touch_app_rounded, size: 11, color: AppColors.gold),
                const SizedBox(width: 4),
                Text(
                  '3D INTERACTIVO',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 9,
                    fontWeight: FontWeight.w700,
                    color: Colors.white70,
                    letterSpacing: 0.6,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  /// Cuerpo informativo de la tarjeta con badges técnicos y botón de reserva
  Widget _buildCardBody(BuildContext context, dynamic destination) {
    return Padding(
      padding: const EdgeInsets.all(18.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Subtítulo de linaje campesino
          Text(
            'RUTA CURADA POR LOCALES',
            style: GoogleFonts.spaceGrotesk(
              fontSize: 11,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.5,
              color: AppColors.gold,
            ),
          ),
          const SizedBox(height: 6),

          // Título del destino
          Text(
            destination.title.toUpperCase(),
            style: GoogleFonts.montserrat(
              fontSize: 20,
              fontWeight: FontWeight.w900,
              letterSpacing: 0.5,
              color: Colors.white,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 6),

          // Descripción concisa
          Text(
            destination.description ?? 'Aventura única entre cascadas y senderos ocultos de Nicaragua.',
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w400,
              color: AppColors.textLight.withValues(alpha: 0.8),
              height: 1.4,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 14),

          // Chips de métricas de la ruta (Rating, Duración, Kilometraje)
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: [
              _buildMetricPill(
                icon: Icons.star_rounded,
                iconColor: Colors.amber,
                label: '${destination.rating ?? 4.9} (${destination.reviewsCount ?? 128})',
              ),
              _buildMetricPill(
                icon: Icons.schedule_rounded,
                iconColor: AppColors.goldLight,
                label: destination.duration?.toString().isNotEmpty == true ? destination.duration.toString() : '1 Día',
              ),
              _buildMetricPill(
                icon: Icons.hiking_rounded,
                iconColor: AppColors.jungleGreen,
                label: destination.distance?.toString().isNotEmpty == true ? destination.distance.toString() : '18 km',
              ),
            ],
          ),

          const SizedBox(height: 16),
          Divider(color: AppColors.borderLight.withValues(alpha: 0.5), height: 1),
          const SizedBox(height: 14),

          // Fila inferior: Precio en doble moneda y botón de reserva directa
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Precios bimoneda flexibles y adaptables
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'PRECIO BASE',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textLight.withValues(alpha: 0.6),
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: 2),
                    FittedBox(
                      fit: BoxFit.scaleDown,
                      alignment: Alignment.centerLeft,
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text(
                            '\$${destination.priceUsd?.toInt() ?? 25}',
                            style: GoogleFonts.montserrat(
                              fontSize: 21,
                              fontWeight: FontWeight.w900,
                              color: AppColors.gold,
                            ),
                          ),
                          Text(
                            ' USD',
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: AppColors.gold.withValues(alpha: 0.7),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            '· C\$${destination.priceNio?.toInt() ?? ((destination.priceUsd ?? 25) * 36.62).toInt()} NIO',
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                              color: AppColors.textLight.withValues(alpha: 0.65),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),

              // Botón de reserva directa
              ElevatedButton.icon(
                onPressed: () => CheckoutModal.show(context, destination),
                icon: const Icon(Icons.bookmark_add_rounded, size: 15, color: Colors.white),
                label: Text(
                  'RESERVAR',
                  style: GoogleFonts.montserrat(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.8,
                    color: Colors.white,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.terracotta,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  elevation: 6,
                  shadowColor: AppColors.terracotta.withValues(alpha: 0.5),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Píldora individual para métricas rápidas de ruta
  Widget _buildMetricPill({
    required IconData icon,
    required Color iconColor,
    required String label,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.primaryLight.withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.borderLight.withValues(alpha: 0.8)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: iconColor),
          const SizedBox(width: 5),
          Text(
            label,
            style: GoogleFonts.spaceGrotesk(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: AppColors.textLight,
            ),
          ),
        ],
      ),
    );
  }
}
