// ============================================================================
// 🏅 MODAL DE DESBLOQUEO DE SELLO DE TINTA EN PASAPORTE (STAMP_UNLOCK_DIALOG.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Transformar la experiencia de viaje en una aventura gamificada interactiva.
// - Recompensar al explorador con sellos de tinta coleccionables, puntos de experiencia (+XP)
//   y ascensos de rango (*Explorador Novato ➔ Baqueano de Montaña ➔ Cacique de los Volcanes*).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `AnimationController` elástico que simula el impacto físico de un sello de tinta sobre papel pergamino.
// - Contador de puntos XP animados y destellos de partículas doradas.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `StampUnlockDialog.show(...)`: Despliega la animación de sellado oficial.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/models/cultural_models.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/baqueano_button.dart';

class StampUnlockDialog extends StatefulWidget {
  final PassportBadge badge;

  const StampUnlockDialog({super.key, required this.badge});

  static void show(BuildContext context, PassportBadge badge) {
    showDialog(
      context: context,
      builder: (context) => StampUnlockDialog(badge: badge),
    );
  }

  @override
  State<StampUnlockDialog> createState() => _StampUnlockDialogState();
}

class _StampUnlockDialogState extends State<StampUnlockDialog> with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _rotateAnimation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );

    _scaleAnimation = Tween<double>(begin: 2.5, end: 1.0).animate(
      CurvedAnimation(parent: _animController, curve: Curves.elasticOut),
    );

    _rotateAnimation = Tween<double>(begin: -0.2, end: 0.0).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOut),
    );

    _animController.forward();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final badge = widget.badge;

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20),
      child: Container(
        width: 380,
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppColors.bgDark,
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: AppColors.gold, width: 2),
          boxShadow: [
            BoxShadow(
              color: AppColors.gold.withValues(alpha: 0.3),
              blurRadius: 36,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Sello institucional
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('🇳🇮', style: TextStyle(fontSize: 18)),
                const SizedBox(width: 8),
                Text(
                  'PASAPORTE OFICIAL DE EXPEDICIÓN',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    color: AppColors.gold,
                    letterSpacing: 1.5,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // ----------------------------------------------------------------
            // 🎴 IMPACTO DEL SELLO DE TINTA ANIMADO
            // ----------------------------------------------------------------
            AnimatedBuilder(
              animation: _animController,
              builder: (context, child) => Transform.rotate(
                angle: _rotateAnimation.value,
                child: Transform.scale(
                  scale: _scaleAnimation.value,
                  child: Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: AppGradients.sunsetTerracotta,
                      border: Border.all(color: AppColors.gold, width: 3),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.terracotta.withValues(alpha: 0.5),
                          blurRadius: 20,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Center(
                      child: Text(
                        badge.icon,
                        style: const TextStyle(fontSize: 52),
                      ),
                    ),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Título del sello
            Text(
              badge.title.toUpperCase(),
              style: GoogleFonts.montserrat(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                color: Colors.white,
                letterSpacing: 0.5,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 6),

            // Descripción del hito
            Text(
              badge.description,
              style: GoogleFonts.inter(
                fontSize: 12,
                color: AppColors.textMuted,
                height: 1.4,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 18),

            // ----------------------------------------------------------------
            // ✨ RECOMPENSA DE EXPERIENCIA (+XP)
            // ----------------------------------------------------------------
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.gold.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.gold, width: 1),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.bolt_rounded, color: AppColors.gold, size: 20),
                  const SizedBox(width: 6),
                  Text(
                    '+${badge.xpValue} PUNTOS DE EXPERIENCIA',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      color: AppColors.goldLight,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Botón de coleccionar
            BaqueanoButton(
              text: 'COLECCIONAR EN PASAPORTE',
              variant: BaqueanoButtonVariant.primary,
              height: 46,
              onPressed: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }
}
