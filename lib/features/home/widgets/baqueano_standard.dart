// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — EL ESTÁNDAR BAQUEANO (4 PILARES & LLAMADA A LA AVENTURA)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Consolidar la identidad y la promesa de valor inquebrantable de Baqueano:
//   guías nativos acreditados, 0% intermediación usurera, tecnología offline
//   para zonas remotas e inteligencia artificial con Gemini al servicio del campesino.
// - Brindar una experiencia fluida a 120 FPS sin ralentizaciones ni parpadeos
//   en cualquier teléfono inteligente (gama media, alta y ultra-alta).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `RepaintBoundary` para independizar el renderizado del carrusel de pilares.
// - `ListView.separated` horizontal con `BouncingScrollPhysics` nativa.
// - Ficha modal detallada (`_showPillarDetailsModal`) que profundiza en la filosofía
//   y auditoría de cada pilar al tocarlo.
// - Banner hero de conversión final que invita a explorar o consultar con Baqueano AI.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `BaqueanoStandard`: Sección institucional de pilares y llamada a la acción.
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
  /// Pilar actualmente seleccionado para desplegar su ficha explicativa
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

  Future<void> _handlePillarSelected(Map<String, String> pilar) async {
    setState(() => _selectedPillar = pilar);
    await _showPillarDetailsModal(context, pilar);
    if (mounted) {
      setState(() => _selectedPillar = null);
    }
  }

  Future<void> _showPillarDetailsModal(BuildContext context, Map<String, String> std) async {
    await showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF082B35),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
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
                    border: Border.all(color: AppColors.terracotta.withValues(alpha: 0.5)),
                  ),
                  child: Text(std['icon']!, style: const TextStyle(fontSize: 32)),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        std['title']!,
                        style: GoogleFonts.montserrat(
                          fontSize: 17,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        'Pilar Fundamental Baqueano',
                        style: GoogleFonts.spaceGrotesk(fontSize: 12, color: AppColors.gold),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),
            const Divider(color: Colors.white12),
            const SizedBox(height: 12),
            Text(
              std['detail']!,
              style: GoogleFonts.inter(
                fontSize: 13.5,
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
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: Text(
                  'Entendido',
                  style: GoogleFonts.spaceGrotesk(
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Encabezado institucional centrado con badge informativo
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
                    const Icon(Icons.verified_user_rounded, size: 13, color: AppColors.gold),
                    const SizedBox(width: 6),
                    Flexible(
                      child: Text(
                        '4 PILARES INNEGOCIABLES · ÉTICA & TECNOLOGÍA',
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.8,
                          color: AppColors.gold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
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
            height: 165,
            child: ListView.separated(
              padding: EdgeInsets.symmetric(horizontal: isDesktop ? 48.0 : 20.0),
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
              itemCount: _standards.length,
              separatorBuilder: (_, __) => const SizedBox(width: 14),
              itemBuilder: (context, index) {
                final std = _standards[index];
                final isSelected = _selectedPillar?['title'] == std['title'];

                return AnimatedScale(
                  scale: isSelected ? 1.03 : 1.0,
                  duration: const Duration(milliseconds: 140),
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
