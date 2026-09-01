// ============================================================================
// 🚀 PANTALLA DE BIENVENIDA & CARGA INMERSIVA (SPLASH_SCREEN.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Cautivar al explorador desde el primer segundo con una experiencia visual
//   exótica y cinematográfica de los amaneceres montañosos de Nicaragua.
// - Brindar un periodo de precarga suave para inicializar servicios en la nube
//   (Firebase Auth, Firestore, geolocalización) antes de pasar al Home principal.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `AnimationController` con duración de 1400ms coordinando dos animaciones simultáneas:
//   * `FadeTransition` con curva suave `Curves.easeIn`.
//   * `ScaleTransition` elástica con curva `Curves.easeOutCubic` (0.88x a 1.0x).
// - Temporizador de progreso `Timer.periodic` de 40ms que actualiza la barra dorada
//   y conmuta automáticamente hacia `/home` mediante `GoRouter` al llegar al 100%.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & PANTALLA EXPUESTA):
// - `SplashScreen`: Vista inicial de la aplicación registrada en `/splash`.
// ============================================================================

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  /// Controlador principal de las animaciones de escala y desvanecimiento.
  late AnimationController _animController;

  /// Animación de opacidad de entrada suave.
  late Animation<double> _fadeAnimation;

  /// Animación de escala para efecto de zoom cinematográfico.
  late Animation<double> _scaleAnimation;

  /// Progreso porcentual simulado de carga (0.0 a 1.0).
  double _loadProgress = 0.0;

  /// Temporizador para la barra de progreso.
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    // Inicialización del controlador con duración de 1.4 segundos
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );

    // Configuración de la curva de opacidad
    _fadeAnimation = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeIn,
    );

    // Configuración de la interpolación de escala desde 88% hasta tamaño natural
    _scaleAnimation = Tween<double>(begin: 0.88, end: 1.0).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic),
    );

    // Inicia la animación de entrada
    _animController.forward();

    // Simulación de carga de catálogo y rutas en segundo plano
    _timer = Timer.periodic(const Duration(milliseconds: 40), (t) {
      if (!mounted) return;
      setState(() {
        _loadProgress += 0.03;
        // Al completar el 100%, espera 300ms y redirige a /home
        if (_loadProgress >= 1.0) {
          _timer?.cancel();
          Future.delayed(const Duration(milliseconds: 300), () {
            if (mounted) context.go('/home');
          });
        }
      });
    });
  }

  @override
  void dispose() {
    // Cancelación de temporizador y liberación de controlador de animación
    _timer?.cancel();
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // ------------------------------------------------------------------
          // 🌄 FONDO CINEMATOGRÁFICO DE MONTAÑAS CON NIEBLA AL AMANECER
          // ------------------------------------------------------------------
          Image.asset(
            'assets/images/splash_bg.jpg',
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(
              decoration: const BoxDecoration(
                gradient: AppGradients.volcanicHero,
              ),
            ),
          ),

          // ------------------------------------------------------------------
          // 🌌 VIÑETA OSCURA DEGRADADA PARA LEGIBILIDAD
          // ------------------------------------------------------------------
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppColors.bgDark.withValues(alpha: 0.65),
                  AppColors.bgDark.withValues(alpha: 0.85),
                  AppColors.bgDark,
                ],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                stops: const [0.0, 0.55, 1.0],
              ),
            ),
          ),

          // ------------------------------------------------------------------
          // ✨ CONTENIDO CENTRAL ANIMADO (LOGOTIPO + SLOGAN + BARRA DE CARGA)
          // ------------------------------------------------------------------
          Center(
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: ScaleTransition(
                scale: _scaleAnimation,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 32.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Logotipo oficial en PNG con fallback tipográfico
                      Image.asset(
                        'assets/images/logo_baqueano.png',
                        height: 52,
                        fit: BoxFit.contain,
                        errorBuilder: (_, __, ___) => Text(
                          'BAQUEANO',
                          style: GoogleFonts.montserrat(
                            fontSize: 36,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 4.0,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Lema oficial en oro brillante
                      Text(
                        'NICARAGUA EN MODO SECRETO',
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 3.0,
                          color: AppColors.goldLight,
                        ),
                      ),
                      const SizedBox(height: 8),

                      // Subtítulo descriptivo
                      Text(
                        'Expediciones Comunitarias & Guías Locales',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppColors.textMuted,
                          letterSpacing: 0.8,
                        ),
                      ),
                      const SizedBox(height: 48),

                      // Barra de progreso y cálculo porcentual en tiempo real
                      SizedBox(
                        width: 220,
                        child: Column(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(10),
                              child: LinearProgressIndicator(
                                value: _loadProgress.clamp(0.0, 1.0),
                                minHeight: 4,
                                backgroundColor: AppColors.primaryLight.withValues(alpha: 0.4),
                                valueColor: const AlwaysStoppedAnimation<Color>(AppColors.gold),
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'Cargando rutas y volcanes... ${(_loadProgress * 100).toInt().clamp(0, 100)}%',
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // ------------------------------------------------------------------
          // 🇳🇮 SELLO OFICIAL EN LA PARTE INFERIOR
          // ------------------------------------------------------------------
          Positioned(
            bottom: 24,
            left: 0,
            right: 0,
            child: Center(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('🇳🇮', style: TextStyle(fontSize: 16)),
                  const SizedBox(width: 8),
                  Text(
                    'PLATAFORMA OFICIAL DE TURISMO',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.5,
                      color: AppColors.textMuted,
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
}
