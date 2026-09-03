// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SECCIÓN DE IMPACTO SOCIAL & COMERCIO JUSTO CAMPESINO
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Transparentar y visibilizar ante el explorador el modelo de comercio justo:
//   el 85% de cada córdoba o dólar pagado va directo a las familias rurales campesinas,
//   eliminando intermediarios turísticos abusivos y preservando el entorno natural.
// - Convertir datos fríos en una experiencia interactiva viva que genere apego y
//   conciencia comunitaria mediante métricas dinámicas y explicativas.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Anillo de progreso radial dinámico (`CustomPainter`) que anima el arco del 85%
//   con resplandor de partículas doradas y gradiente volcánico Terracota-Oro.
// - Contadores numéricos animados con `TweenAnimationBuilder` para entrada suave.
// - Tarjetas interactivas con estado de expansión táctil que despliegan desgloses
//   detallados de impacto social y preservación de cuencas hidrográficas.
// - Envoltura Glassmorphism con bordes sutiles y contraste de alta visibilidad.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `InteractiveImpactSection`: Sección modular integrada en la pantalla principal.
// ============================================================================

import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';

class InteractiveImpactSection extends StatefulWidget {
  const InteractiveImpactSection({super.key});

  @override
  State<InteractiveImpactSection> createState() => _InteractiveImpactSectionState();
}

class _InteractiveImpactSectionState extends State<InteractiveImpactSection>
    with SingleTickerProviderStateMixin {
  /// Índice de la tarjeta seleccionada para mostrar detalles de impacto (-1 si ninguna)
  int _selectedStatIndex = 0;

  /// Controlador de animación para el brillo continuo del arco de progreso
  late final AnimationController _glowController;
  late final Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();
    _glowController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    )..repeat(reverse: true);

    _glowAnimation = Tween<double>(begin: 0.7, end: 1.0).animate(
      CurvedAnimation(parent: _glowController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _glowController.dispose();
    super.dispose();
  }

  /// Lista de métricas y sus desgloses de transparencia comunitaria
  final List<Map<String, dynamic>> _statsData = const [
    {
      'number': '85%',
      'numericValue': 85.0,
      'title': 'Impacto Comunitario',
      'subtitle': 'Directo a familias rurales',
      'icon': Icons.volunteer_activism_rounded,
      'color': Color(0xFFD4AF37),
      'detail':
          'Por cada \$100 USD invertidos, \$85 van directamente al bolsillo del campesino anfitrión, sus guías y cocineras locales, garantizando soberanía alimentaria y protección ecológica de los bosques.',
    },
    {
      'number': '50+',
      'numericValue': 50.0,
      'title': 'Emprendedores',
      'subtitle': 'Cooperativas y familias',
      'icon': Icons.groups_rounded,
      'color': Color(0xFFC86432),
      'detail':
          'Red conformada por dueños de fincas cafetaleras, cooperativas de sandboarding en volcanes activos, comedores ancestrales y artesanos del barro negro y filigrana.',
    },
    {
      'number': '100+',
      'numericValue': 100.0,
      'title': 'Experiencias Únicas',
      'subtitle': 'Rutas 100% auténticas',
      'icon': Icons.explore_rounded,
      'color': Color(0xFF2E7D32),
      'detail':
          'Senderos secretos, cascadas sin señal telefónica, ascensos a cráteres humeantes y noches de fogata bajo las estrellas de Nicaragua verificadas en persona por baqueanos nativos.',
    },
    {
      'number': '15',
      'numericValue': 15.0,
      'title': 'Departamentos',
      'subtitle': 'Cobertura nacional viva',
      'icon': Icons.map_rounded,
      'color': Color(0xFF4FC3F7),
      'detail':
          'Presencia territorial activa desde los pinares y cañones de Madriz y Nueva Segovia hasta las costas del Pacífico en Rivas y el archipiélago de Solentiname.',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;
    final selectedStat = _statsData[_selectedStatIndex];

    return Container(
      width: double.infinity,
      margin: EdgeInsets.symmetric(
        horizontal: isDesktop ? 48.0 : 20.0,
        vertical: 16.0,
      ),
      padding: EdgeInsets.symmetric(
        horizontal: isDesktop ? 36.0 : 20.0,
        vertical: 28.0,
      ),
      decoration: BoxDecoration(
        color: AppColors.primaryDark.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: AppColors.borderGold.withValues(alpha: 0.7), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.4),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
          BoxShadow(
            color: AppColors.craterTeal.withValues(alpha: 0.15),
            blurRadius: 30,
            spreadRadius: -4,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ------------------------------------------------------------------
          // 🌿 CABECERA DEL MÓDULO DE IMPACTO SOCIAL (CENTRADA)
          // ------------------------------------------------------------------
          Center(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.terracotta.withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.terracotta.withValues(alpha: 0.5)),
                  ),
                  child: const Icon(Icons.handshake_rounded, color: AppColors.terracotta, size: 22),
                ),
                const SizedBox(height: 10),
                Text(
                  'TRANSPARENCIA & COMERCIO JUSTO',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.6,
                    color: AppColors.gold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'El Retorno que Transforma a Nicaragua',
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

          const SizedBox(height: 28),

          // ------------------------------------------------------------------
          // 📊 ANILLO RADIAL DINÁMICO + CUADRÍCULA DE MÉTRICAS INTERACTIVAS
          // ------------------------------------------------------------------
          isDesktop
              ? Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    _buildRadialGauge(isDesktop),
                    const SizedBox(width: 36),
                    Expanded(child: _buildStatsGrid(isDesktop)),
                  ],
                )
              : Column(
                  children: [
                    _buildRadialGauge(isDesktop),
                    const SizedBox(height: 28),
                    _buildStatsGrid(isDesktop),
                  ],
                ),

          const SizedBox(height: 22),

          // ------------------------------------------------------------------
          // 🔍 PANEL DE DESGLOSE INTERACTIVO AL TOCAR UNA MÉTRICA
          // ------------------------------------------------------------------
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 300),
            transitionBuilder: (child, animation) {
              return FadeTransition(
                opacity: animation,
                child: SlideTransition(
                  position: Tween<Offset>(
                    begin: const Offset(0.0, 0.15),
                    end: Offset.zero,
                  ).animate(animation),
                  child: child,
                ),
              );
            },
            child: Container(
              key: ValueKey<int>(_selectedStatIndex),
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppColors.primaryLight.withValues(alpha: 0.6),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: (selectedStat['color'] as Color).withValues(alpha: 0.5),
                  width: 1.2,
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: (selectedStat['color'] as Color).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      selectedStat['icon'] as IconData,
                      color: selectedStat['color'] as Color,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Wrap(
                          alignment: WrapAlignment.spaceBetween,
                          crossAxisAlignment: WrapCrossAlignment.center,
                          spacing: 8,
                          runSpacing: 4,
                          children: [
                            Text(
                              '${selectedStat['title']} (${selectedStat['number']})',
                              style: GoogleFonts.montserrat(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                              ),
                            ),
                            Text(
                              'Toca otra para ver desglose',
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 10,
                                color: AppColors.goldLight.withValues(alpha: 0.7),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          selectedStat['detail'] as String,
                          style: GoogleFonts.inter(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w400,
                            color: AppColors.textLight.withValues(alpha: 0.85),
                            height: 1.45,
                          ),
                        ),
                      ],
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

  /// Medidor radial circular del 85% con resplandor pulsante
  Widget _buildRadialGauge(bool isDesktop) {
    return AnimatedBuilder(
      animation: _glowAnimation,
      builder: (context, child) {
        return Center(
          child: SizedBox(
            width: 150,
            height: 150,
            child: Stack(
              alignment: Alignment.center,
              children: [
                // CustomPainter para el arco radial
                CustomPaint(
                  size: const Size(150, 150),
                  painter: _RadialImpactPainter(
                    percentage: 0.85,
                    glowFactor: _glowAnimation.value,
                  ),
                ),
                // Contenido central con número animado y label
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TweenAnimationBuilder<double>(
                      tween: Tween<double>(begin: 0, end: 85),
                      duration: const Duration(milliseconds: 1600),
                      curve: Curves.easeOutCubic,
                      builder: (context, value, _) {
                        return ShaderMask(
                          shaderCallback: (bounds) => AppGradients.gold.createShader(bounds),
                          child: Text(
                            '${value.toInt()}%',
                            style: GoogleFonts.montserrat(
                              fontSize: 32,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                              letterSpacing: -1,
                            ),
                          ),
                        );
                      },
                    ),
                    Text(
                      'A COMUNIDADES',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.1,
                        color: AppColors.goldLight,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  /// Cuadrícula responsiva y adaptable de tarjetas métricas
  Widget _buildStatsGrid(bool isDesktop) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: isDesktop ? 4 : 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        mainAxisExtent: isDesktop ? 96 : 116,
      ),
      itemCount: _statsData.length,
      itemBuilder: (context, index) {
        final item = _statsData[index];
        final isSelected = _selectedStatIndex == index;
        final itemColor = item['color'] as Color;

        return InkWell(
          onTap: () => setState(() => _selectedStatIndex = index),
          borderRadius: BorderRadius.circular(18),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 250),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: isSelected
                  ? itemColor.withValues(alpha: 0.18)
                  : AppColors.primaryLight.withValues(alpha: 0.4),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: isSelected ? itemColor : AppColors.borderLight.withValues(alpha: 0.6),
                width: isSelected ? 1.8 : 1.0,
              ),
              boxShadow: isSelected
                  ? [
                      BoxShadow(
                        color: itemColor.withValues(alpha: 0.3),
                        blurRadius: 14,
                        offset: const Offset(0, 4),
                      ),
                    ]
                  : [],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Icon(item['icon'] as IconData, size: 18, color: itemColor),
                    if (isSelected)
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: itemColor,
                          shape: BoxShape.circle,
                        ),
                      ),
                  ],
                ),
                FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerLeft,
                  child: Text(
                    item['number'] as String,
                    style: GoogleFonts.montserrat(
                      fontSize: 21,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                    ),
                  ),
                ),
                Text(
                  item['title'] as String,
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textLight.withValues(alpha: 0.9),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

/// CustomPainter para dibujar el medidor radial del impacto campesino
class _RadialImpactPainter extends CustomPainter {
  final double percentage;
  final double glowFactor;

  _RadialImpactPainter({
    required this.percentage,
    required this.glowFactor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width - 24) / 2;
    const strokeWidth = 10.0;

    // 1. Pista de fondo oscura
    final backgroundPaint = Paint()
      ..color = AppColors.primaryLight.withValues(alpha: 0.5)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth;

    canvas.drawCircle(center, radius, backgroundPaint);

    // 2. Arco activo con gradiente volcánico Terracota-Oro
    const startAngle = -math.pi / 2;
    final sweepAngle = 2 * math.pi * percentage;

    final rect = Rect.fromCircle(center: center, radius: radius);
    final gradient = const SweepGradient(
      startAngle: 0.0,
      endAngle: 2 * math.pi,
      colors: [
        Color(0xFFC86432), // Terracota
        Color(0xFFD4AF37), // Oro Pinolero
        Color(0xFFFF7043), // Lava ardiente
        Color(0xFFC86432),
      ],
      stops: [0.0, 0.45, 0.85, 1.0],
    );

    final progressPaint = Paint()
      ..shader = gradient.createShader(rect)
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = strokeWidth;

    // 3. Sombra de resplandor para el arco
    final glowPaint = Paint()
      ..color = const Color(0xFFD4AF37).withValues(alpha: (0.35 * glowFactor).clamp(0.0, 0.6))
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = strokeWidth + 6
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8);

    canvas.drawArc(rect, startAngle, sweepAngle, false, glowPaint);
    canvas.drawArc(rect, startAngle, sweepAngle, false, progressPaint);

    // 4. Indicador en la punta del arco
    final endAngle = startAngle + sweepAngle;
    final indicatorX = center.dx + radius * math.cos(endAngle);
    final indicatorY = center.dy + radius * math.sin(endAngle);

    final tipPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    canvas.drawCircle(Offset(indicatorX, indicatorY), 6, tipPaint);
  }

  @override
  bool shouldRepaint(covariant _RadialImpactPainter oldDelegate) {
    return oldDelegate.percentage != percentage || oldDelegate.glowFactor != glowFactor;
  }
}
