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
  late AnimationController _animController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;
  double _loadProgress = 0.0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );

    _fadeAnimation = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeIn,
    );

    _scaleAnimation = Tween<double>(begin: 0.88, end: 1.0).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic),
    );

    _animController.forward();

    // Simulated initialization progress
    _timer = Timer.periodic(const Duration(milliseconds: 40), (t) {
      if (!mounted) return;
      setState(() {
        _loadProgress += 0.03;
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
          // Background Image (Misty Sunrise Mountains)
          Image.asset(
            'assets/images/splash_bg.jpg',
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(
              decoration: const BoxDecoration(
                gradient: AppGradients.volcanicHero,
              ),
            ),
          ),

          // Vignette Gradient Overlay
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

          // Center Animated Content
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
                      // Official Logo Image or Vector Fallback
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

                      // Slogan
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

                      Text(
                        'Expediciones Comunitarias & Guías Locales',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppColors.textMuted,
                          letterSpacing: 0.8,
                        ),
                      ),
                      const SizedBox(height: 48),

                      // Progress Indicator & Percentage
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

          // Bottom Seal
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
