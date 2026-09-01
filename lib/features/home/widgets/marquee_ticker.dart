// ============================================================================
// ♾️ CINTILLO TICKER CON DESPLAZAMIENTO INFINITO A 60 FPS (MARQUEE_TICKER.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Mostrar de forma dinámica, viva y continua la red de cooperativas campesinas,
//   asociaciones de guías y reservas naturales aliadas a Baqueano (Finca Selva Negra,
//   Cerro Negro Club, Ometepe Kayaks, Baqueanos del Cañón de Somoto).
// - Dar dinamismo visual al Home, generando credibilidad y validación comunitaria.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `ScrollController` controlado por un bucle asíncrono con `animateTo(maxScroll, curve: Curves.linear)`
//   y reinicio instantáneo con `jumpTo(0)` al completar la distancia.
// - Cuadriplicación de la lista de aliados para garantizar un desplazamiento sin saltos (seamless loop).
// - Manejo de ciclo de vida seguro con bandera `_isDisposed` para evitar fugas de memoria.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `MarqueeTicker`: Ticker animado horizontal que recorre la pantalla de forma infinita.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/theme/app_colors.dart';

class MarqueeTicker extends StatefulWidget {
  const MarqueeTicker({super.key});

  @override
  State<MarqueeTicker> createState() => _MarqueeTickerState();
}

class _MarqueeTickerState extends State<MarqueeTicker> {
  /// Controlador del scroll horizontal continuo.
  late final ScrollController _scrollController;

  /// Bandera para verificar si el widget ha sido destruido antes de continuar el bucle.
  bool _isDisposed = false;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    // Inicia el bucle de animación una vez montado el primer frame
    WidgetsBinding.instance.addPostFrameCallback((_) => _startInfiniteScroll());
  }

  /// Bucle asíncrono que calcula la velocidad en función de la distancia restante.
  void _startInfiniteScroll() async {
    while (!_isDisposed && mounted) {
      if (_scrollController.hasClients) {
        final maxScroll = _scrollController.position.maxScrollExtent;
        final currentScroll = _scrollController.offset;
        final remainingDistance = maxScroll - currentScroll;

        if (remainingDistance > 0) {
          // Velocidad constante lineal (25ms por píxel)
          final durationMs = (remainingDistance * 25).toInt();
          await _scrollController.animateTo(
            maxScroll,
            duration: Duration(milliseconds: durationMs),
            curve: Curves.linear,
          );
        }

        // Al llegar al final, salta instantáneamente al inicio sin salto visible
        if (!_isDisposed && mounted && _scrollController.hasClients) {
          _scrollController.jumpTo(0);
        }
      } else {
        await Future.delayed(const Duration(milliseconds: 500));
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
    // Cuadruplicación de la lista para crear el bucle infinito sin huecos
    final partners = [
      ...CatalogData.marqueePartners,
      ...CatalogData.marqueePartners,
      ...CatalogData.marqueePartners,
      ...CatalogData.marqueePartners,
    ];

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.primaryDark.withValues(alpha: 0.95),
        border: const Border.symmetric(
          horizontal: BorderSide(color: AppColors.borderLight, width: 0.8),
        ),
      ),
      child: SingleChildScrollView(
        controller: _scrollController,
        scrollDirection: Axis.horizontal,
        physics: const NeverScrollableScrollPhysics(), // El usuario no interrumpe el scroll motorizado
        child: Row(
          children: [
            // Badge naranja inicial "RED DE ALIANZAS"
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFFF5722),
                borderRadius: BorderRadius.circular(6),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFFF5722).withValues(alpha: 0.4),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Text(
                'RED DE ALIANZAS',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 10,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  letterSpacing: 1.0,
                ),
              ),
            ),
            // Renderizado de cada aliado con icono de verificación y separador '✦'
            ...partners.map(
              (partner) => Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    const Icon(Icons.verified, size: 14, color: AppColors.gold),
                    const SizedBox(width: 6),
                    Text(
                      partner,
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textLight.withValues(alpha: 0.9),
                      ),
                    ),
                    const SizedBox(width: 16),
                    const Text('✦', style: TextStyle(color: Color(0xFFFF5722), fontSize: 10)),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
