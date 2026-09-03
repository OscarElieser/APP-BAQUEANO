// ============================================================================
// 🛡️ EL ESTÁNDAR BAQUEANO: GALERÍA DINÁMICA INFINITA & CONVERSIÓN (BAQUEANO_STANDARD.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Presentar los 4 pilares innegociables del ecosistema Baqueano (Guías Nativos,
//   0% Intermediación, PWA Offline y Baqueano AI) en un carrusel dinámico infinito
//   continuo a 60 FPS con movimiento en dirección opuesta (Reverse: derecha a izquierda).
// - Cumplir con la pausa inteligente: cuando el explorador toca cualquier pilar, el carrusel
//   se detiene al instante y abre el desglose técnico y ético del pilar; al cerrarlo,
//   continúa fluidamente su marcha.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `StatefulWidget` con `ScrollController` animado en reversa hacia el offset 0
//   y reinicio transparente a la mitad del contenido cuadriplicado.
// - Modal explicativo `_showPillarDetailsModal` con diseño Glassmorphism y paleta volcánica.
// - Banner inferior de conversión hero con doble llamada a la acción interactiva.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `BaqueanoStandard`: Carrusel infinito bidireccional de pilares y banner de conversión.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/baqueano_button.dart';
import '../../../core/widgets/section_header.dart';

class BaqueanoStandard extends StatefulWidget {
  const BaqueanoStandard({super.key});

  @override
  State<BaqueanoStandard> createState() => _BaqueanoStandardState();
}

class _BaqueanoStandardState extends State<BaqueanoStandard> {
  /// Controlador del desplazamiento horizontal en reversa
  late final ScrollController _scrollController;

  /// Bandera para evitar llamadas asíncronas tras dispose
  bool _isDisposed = false;

  /// Estado reactivo de pausa inteligente
  bool _isPaused = false;

  /// Pilar actualmente seleccionado para feedback visual
  Map<String, String>? _selectedPillar;

  /// Definición de los 4 pilares fundamentales del Estándar Baqueano
  final List<Map<String, String>> _standards = const [
    {
      'icon': '🛡️',
      'title': 'Guías Nativos Certificados',
      'desc': 'Conocedores ancestrales de senderos, primeros auxilios y el comportamiento del clima en cada montaña y volcán.',
      'detail': 'Cada baqueano pasa por una acreditación comunitaria obligatoria. Conocen las plantas medicinales, las rutas seguras de ascenso y cuentan con botiquín de primeros auxilios en zonas agrestes.',
    },
    {
      'icon': '🌱',
      'title': '0% Intermediación Abusiva',
      'desc': 'El 100% de los honorarios de guiado y consumo va directo a las familias rurales y cooperativas anfitrionas.',
      'detail': 'Baqueano no cobra comisiones predatorias a los campesinos. Tu aporte dinamiza la economía comunitaria, financia escuelas rurales y reforesta cuencas hidrográficas en Nicaragua.',
    },
    {
      'icon': '📡',
      'title': 'PWA 100% Offline Ready',
      'desc': 'Guarda tus mapas y rutas para consultarlos en cumbres volcánicas o cañones remotos sin necesidad de señal celular.',
      'detail': 'Descarga mapas vectoriales con tracks GPS en caché local antes de salir a expedición. Tu brújula, altímetro y waypoints siguen funcionando en modo avión en lo profundo de la selva.',
    },
    {
      'icon': '🤖',
      'title': 'Baqueano AI (Gemini)',
      'desc': 'Asistente de inteligencia artificial que calcula tu presupuesto exacto y genera itinerarios cronológicos a tu medida.',
      'detail': 'Entrenado con geografía, tarifas en córdobas/dólares, horarios de buses y clima nicaragüense para armar tu ruta soñada en segundos.',
    },
  ];

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    // Posiciona el scroll en un punto medio y arranca el desplazamiento en reversa
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        final maxScroll = _scrollController.position.maxScrollExtent;
        if (maxScroll > 0) {
          _scrollController.jumpTo(maxScroll * 0.6);
        }
      }
      _startContinuousReverseScroll();
    });
  }

  /// Desplazamiento continuo infinito a 60 FPS en dirección opuesta (Reverse: derecha -> izquierda)
  void _startContinuousReverseScroll() async {
    while (!_isDisposed && mounted) {
      if (_scrollController.hasClients && !_isPaused) {
        final currentScroll = _scrollController.offset;

        if (currentScroll > 5) {
          // Velocidad constante suave (44ms por píxel)
          final durationMs = (currentScroll * 44).toInt();
          await _scrollController.animateTo(
            0,
            duration: Duration(milliseconds: durationMs),
            curve: Curves.linear,
          );
        }

        // Al llegar a 0 salta transparentemente a la mitad para continuar el bucle
        if (!_isDisposed && mounted && _scrollController.hasClients && !_isPaused) {
          final maxScroll = _scrollController.position.maxScrollExtent;
          _scrollController.jumpTo(maxScroll * 0.6);
        }
      } else {
        await Future.delayed(const Duration(milliseconds: 250));
      }
    }
  }

  /// Abre el detalle exhaustivo del pilar y pausa el carrusel
  Future<void> _handlePillarSelected(Map<String, String> std) async {
    setState(() {
      _isPaused = true;
      _selectedPillar = std;
    });

    await _showPillarDetailsModal(context, std);

    if (mounted && !_isDisposed) {
      setState(() {
        _isPaused = false;
        _selectedPillar = null;
      });
      _startContinuousReverseScroll();
    }
  }

  /// Modal con explicación profunda del pilar seleccionado
  Future<void> _showPillarDetailsModal(BuildContext context, Map<String, String> std) async {
    await showModalBottomSheet(
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
              const SizedBox(height: 18),

              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.terracotta.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.terracotta.withValues(alpha: 0.4)),
                    ),
                    child: Text(std['icon']!, style: const TextStyle(fontSize: 30)),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          std['title']!,
                          style: GoogleFonts.montserrat(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          'Pilar Fundamental Baqueano',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 11,
                            color: AppColors.gold,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),
              const Divider(color: Colors.white12),
              const SizedBox(height: 14),

              Text(
                'Compromiso con la Comunidad & el Explorador:',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.1,
                  color: AppColors.goldLight,
                ),
              ),
              const SizedBox(height: 8),

              Text(
                std['detail']!,
                style: GoogleFonts.inter(
                  fontSize: 14,
                  color: Colors.white.withValues(alpha: 0.9),
                  height: 1.55,
                ),
              ),

              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(ctx),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.terracotta,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: Text(
                    'Entendido · Volver al Estándar',
                    style: GoogleFonts.montserrat(fontWeight: FontWeight.w800, fontSize: 12),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _isDisposed = true;
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Cuadriplicación de los 4 pilares para flujo continuo infinito
    final continuousList = [
      ..._standards,
      ..._standards,
      ..._standards,
      ..._standards,
    ];

    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Encabezado institucional centrado con indicador dinámico de estado en vivo
        Padding(
          padding: EdgeInsets.symmetric(horizontal: isDesktop ? 48.0 : 20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SectionHeader(
                tag: 'NUESTRO COMPROMISO',
                title: 'El Estándar Baqueano',
                subtitle: 'Diseñado con tecnología de punta y valores innegociables para brindarte la mejor aventura comunitaria.',
                isCentered: true,
              ),
              const SizedBox(height: 6),
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: _isPaused
                      ? AppColors.terracotta.withValues(alpha: 0.22)
                      : AppColors.gold.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: _isPaused
                        ? AppColors.terracotta.withValues(alpha: 0.6)
                        : AppColors.borderGold.withValues(alpha: 0.4),
                    width: 1,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      _isPaused ? Icons.pause_circle_rounded : Icons.sync_alt_rounded,
                      size: 11,
                      color: _isPaused ? AppColors.terracotta : AppColors.gold,
                    ),
                    const SizedBox(width: 5),
                    Text(
                      _isPaused ? 'PAUSADO (EXPLORANDO)' : 'FLUJO INVERSO · 60 FPS',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.6,
                        color: _isPaused ? AppColors.terracotta : AppColors.gold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 12),

        // Carrusel horizontal continuo en dirección opuesta (Reverse)
        SizedBox(
          height: 165,
          child: Listener(
            onPointerDown: (_) => setState(() => _isPaused = true),
            onPointerUp: (_) {
              if (_selectedPillar == null) {
                setState(() => _isPaused = false);
                _startContinuousReverseScroll();
              }
            },
            child: ListView.separated(
              controller: _scrollController,
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              padding: EdgeInsets.symmetric(horizontal: isDesktop ? 48.0 : 20.0),
              itemCount: continuousList.length,
              separatorBuilder: (_, __) => const SizedBox(width: 14),
              itemBuilder: (context, index) {
                final std = continuousList[index];
                final isSelected = _selectedPillar?['title'] == std['title'];

                return AnimatedScale(
                  scale: isSelected ? 1.03 : 1.0,
                  duration: const Duration(milliseconds: 200),
                  child: InkWell(
                    onTap: () => _handlePillarSelected(std),
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      width: 320,
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        gradient: isSelected
                            ? const LinearGradient(
                                colors: [Color(0xFF0C3D4B), Color(0xFFC86432)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              )
                            : AppGradients.cardGlass,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isSelected
                              ? AppColors.gold
                              : AppColors.borderLight.withValues(alpha: 0.7),
                          width: isSelected ? 1.8 : 1.0,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: isSelected
                                ? AppColors.gold.withValues(alpha: 0.35)
                                : Colors.black.withValues(alpha: 0.25),
                            blurRadius: isSelected ? 16 : 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Icono enmarcado en terracota
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppColors.terracotta.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.terracotta.withValues(alpha: 0.4)),
                            ),
                            child: Text(std['icon']!, style: const TextStyle(fontSize: 22)),
                          ),
                          const SizedBox(width: 14),

                          // Título y descripción del pilar
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  std['title']!,
                                  style: GoogleFonts.montserrat(
                                    fontSize: 13.5,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.textLight,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  std['desc']!,
                                  style: GoogleFonts.inter(
                                    fontSize: 11,
                                    color: AppColors.textMuted,
                                    height: 1.35,
                                  ),
                                  maxLines: 3,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
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

        const SizedBox(height: 28),

        // --------------------------------------------------------------------
        // 🚀 BANNER HERO FINAL DE CONVERSIÓN (LLAMADA A LA AVENTURA)
        // --------------------------------------------------------------------
        Padding(
          padding: EdgeInsets.symmetric(horizontal: isDesktop ? 48.0 : 20.0),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: AppGradients.sunsetTerracotta,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: AppColors.terracotta.withValues(alpha: 0.3),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              children: [
                Text(
                  '¿Listo para explorar la Nicaragua auténtica?',
                  style: GoogleFonts.montserrat(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  'Únete a miles de exploradores que viajan con propósito, apoyando a las comunidades locales y viviendo aventuras inolvidables.',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: Colors.white.withValues(alpha: 0.95),
                    height: 1.4,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                // Botones de acción dual: Catálogo o Chat IA
                Wrap(
                  spacing: 12,
                  runSpacing: 10,
                  alignment: WrapAlignment.center,
                  children: [
                    BaqueanoButton(
                      text: 'EXPLORAR EXPERIENCIAS',
                      variant: BaqueanoButtonVariant.secondary,
                      height: 46,
                      onPressed: () => context.go('/descubrir'),
                    ),
                    BaqueanoButton(
                      text: 'CONSULTAR A BAQUEANO AI',
                      icon: const Icon(Icons.smart_toy_outlined, size: 16, color: AppColors.textDark),
                      variant: BaqueanoButtonVariant.gold,
                      height: 46,
                      onPressed: () => context.go('/ai'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
