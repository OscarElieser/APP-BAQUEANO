// ============================================================================
// 🍞 NOTIFICACIONES TOAST FLOTANTES ESTILO GLASS (CUSTOM_TOAST.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer retroalimentación sutil, elegante y no intrusiva al explorador cuando
//   guarda un destino en favoritos, copia un contacto, reproduce una pista o completa un pago.
// - Reemplazar los SnackBars estándar y planos de Material por tarjetas flotantes
//   con bordes brillantes, sombras ricas y soporte para iconos vectoriales temáticos.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Utiliza `ScaffoldMessenger.of(context)` con comportamiento flotante (`SnackBarBehavior.floating`).
// - Limpia notificaciones previas mediante `hideCurrentSnackBar()` para evitar colas visuales molestas.
// - Métodos de conveniencia estáticos: `CustomToast.show()`, `CustomToast.success()` y `CustomToast.error()`.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & CLASE EXPUESTA):
// - `CustomToast`: Clase utilitaria estática accesible desde cualquier `BuildContext`.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_colors.dart';

class CustomToast {
  /// Muestra una notificación flotante personalizada con icono y mensaje.
  static void show(
    BuildContext context, {
    required String message,
    IconData icon = Icons.info_outline,
    Color backgroundColor = AppColors.primaryLight,
    Color accentColor = AppColors.gold,
    Duration duration = const Duration(seconds: 3),
  }) {
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    // Cancela cualquier toast anterior para mostrar inmediatamente el nuevo
    scaffoldMessenger.hideCurrentSnackBar();

    scaffoldMessenger.showSnackBar(
      SnackBar(
        duration: duration,
        backgroundColor: Colors.transparent, // Transparente para usar el Container custom
        elevation: 0,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        content: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: backgroundColor.withValues(alpha: 0.95),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: accentColor.withValues(alpha: 0.6), width: 1.2),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.35),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Row(
            children: [
              // Icono temático destacado con color de acento
              Icon(icon, color: accentColor, size: 22),
              const SizedBox(width: 12),
              // Mensaje textual con tipografía Inter
              Expanded(
                child: Text(
                  message,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textLight,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Notificación de éxito verde bosque con icono de check.
  static void success(BuildContext context, String message) {
    show(
      context,
      message: message,
      icon: Icons.check_circle_outline,
      backgroundColor: const Color(0xFF0F382E),
      accentColor: AppColors.success,
    );
  }

  /// Notificación de error carmesí volcánico con icono de alerta.
  static void error(BuildContext context, String message) {
    show(
      context,
      message: message,
      icon: Icons.error_outline,
      backgroundColor: const Color(0xFF381515),
      accentColor: AppColors.error,
    );
  }
}
