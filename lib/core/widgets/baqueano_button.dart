// ============================================================================
// 🔘 BOTÓN TÁCTIL MULTIVARIANTE CON MICROANIMACIÓN (BAQUEANO_BUTTON.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia táctil ultra reactiva (tactile feedback) con microanimaciones
//   de compresión elástica (scale animation a 0.96x) al ser pulsado por el usuario.
// - Estandarizar todas las llamadas a la acción del sistema (reservar, explorar, consultar IA,
//   descargar mapas offline) en 5 variantes visuales adaptadas a su jerarquía de importancia.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `AnimationController` ligero de 100ms con curva suave `Curves.easeInOut`.
// - Detección de gestos con `GestureDetector` (onTapDown, onTapUp, onTapCancel).
// - Soporte nativo para estado de carga (`isLoading`) mostrando un spinner circular sin romper el layout.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & VARIANTES EXPUESTAS):
// - `BaqueanoButton`: Widget interactivo parametrizable.
// - `BaqueanoButtonVariant`: primary (Terracota), gold (Oro), secondary (Petróleo), outline (Borde Dorado), glass (Cristal).
// ============================================================================

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_colors.dart';
import '../theme/app_gradients.dart';

/// Variantes de diseño disponibles para el botón según la jerarquía de la acción.
enum BaqueanoButtonVariant {
  /// Acción principal (CTA) con gradiente terracota y sombra profunda.
  primary,

  /// Acción secundaria sobre fondo oscuro con borde sutil.
  secondary,

  /// Botón con borde dorado y fondo transparente.
  outline,

  /// Botón dorado de máxima luminosidad (destacados e IA).
  gold,

  /// Botón translúcido estilo Glassmorphism.
  glass,
}

class BaqueanoButton extends StatefulWidget {
  /// Texto a mostrar en el botón.
  final String text;

  /// Función callback ejecutada al presionar el botón.
  final VoidCallback? onPressed;

  /// Icono opcional a la izquierda del texto.
  final Widget? icon;

  /// Estilo visual del botón.
  final BaqueanoButtonVariant variant;

  /// Ancho explícito (si es null se adapta al contenido o expande según layout).
  final double? width;

  /// Altura del botón (por defecto 48px para ergonomía táctil en móvil).
  final double height;

  /// Relleno interno personalizado.
  final EdgeInsetsGeometry? padding;

  /// Si es true, oculta el texto y muestra un indicador de progreso circular.
  final bool isLoading;

  const BaqueanoButton({
    super.key,
    required this.text,
    this.onPressed,
    this.icon,
    this.variant = BaqueanoButtonVariant.primary,
    this.width,
    this.height = 48,
    this.padding,
    this.isLoading = false,
  });

  @override
  State<BaqueanoButton> createState() => _BaqueanoButtonState();
}

class _BaqueanoButtonState extends State<BaqueanoButton> with SingleTickerProviderStateMixin {
  /// Controlador de la microanimación de escala táctil.
  late AnimationController _controller;

  /// Animación de escala desde 1.0 (reposo) hasta 0.96 (presionado).
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    // Inicialización del controlador con duración de 100ms para respuesta inmediata
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 100),
    );
    // Interpolación de escala con curva easeInOut
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.96).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    // Liberación del controlador de animación para evitar fugas de memoria
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _scaleAnimation,
      builder: (context, child) => Transform.scale(
        scale: _scaleAnimation.value,
        child: child,
      ),
      child: GestureDetector(
        // Al tocar la pantalla, reduce suavemente la escala a 0.96x
        onTapDown: (_) => _controller.forward(),
        // Al soltar, regresa la escala a 1.0x
        onTapUp: (_) => _controller.reverse(),
        // Si el usuario cancela el gesto arrastrando el dedo fuera, restaura la escala
        onTapCancel: () => _controller.reverse(),
        child: Container(
          width: widget.width,
          height: widget.height,
          decoration: _getDecoration(),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              borderRadius: BorderRadius.circular(12),
              // Si está cargando, bloquea el evento onTap
              onTap: widget.isLoading ? null : widget.onPressed,
              child: Padding(
                padding: widget.padding ?? const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                child: widget.isLoading
                    ? const Center(
                        child: SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        ),
                      )
                    : Row(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          if (widget.icon != null) ...[
                            widget.icon!,
                            const SizedBox(width: 8),
                          ],
                          Flexible(
                            child: FittedBox(
                              fit: BoxFit.scaleDown,
                              alignment: Alignment.center,
                              child: Text(
                                widget.text,
                                style: _getTextStyle(),
                                textAlign: TextAlign.center,
                                maxLines: 1,
                              ),
                            ),
                          ),
                        ],
                      ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  /// Genera la decoración visual y sombras según la variante seleccionada.
  BoxDecoration _getDecoration() {
    switch (widget.variant) {
      case BaqueanoButtonVariant.primary:
        return BoxDecoration(
          gradient: AppGradients.sunsetTerracotta,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: AppColors.terracotta.withValues(alpha: 0.35),
              blurRadius: 14,
              offset: const Offset(0, 4),
            ),
          ],
        );
      case BaqueanoButtonVariant.gold:
        return BoxDecoration(
          gradient: AppGradients.gold,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: AppColors.gold.withValues(alpha: 0.35),
              blurRadius: 14,
              offset: const Offset(0, 4),
            ),
          ],
        );
      case BaqueanoButtonVariant.secondary:
        return BoxDecoration(
          color: AppColors.primaryLight,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.borderLight),
        );
      case BaqueanoButtonVariant.outline:
        return BoxDecoration(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.gold, width: 1.5),
        );
      case BaqueanoButtonVariant.glass:
        return BoxDecoration(
          color: AppColors.bgSurface.withValues(alpha: 0.6),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.borderLight),
        );
    }
  }

  /// Selecciona la tipografía y color de texto adecuado según la variante.
  TextStyle _getTextStyle() {
    switch (widget.variant) {
      case BaqueanoButtonVariant.primary:
      case BaqueanoButtonVariant.secondary:
      case BaqueanoButtonVariant.glass:
        return GoogleFonts.spaceGrotesk(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          color: Colors.white,
          letterSpacing: 0.5,
        );
      case BaqueanoButtonVariant.gold:
        return GoogleFonts.spaceGrotesk(
          fontSize: 14,
          fontWeight: FontWeight.w800,
          color: AppColors.textDark,
          letterSpacing: 0.5,
        );
      case BaqueanoButtonVariant.outline:
        return GoogleFonts.spaceGrotesk(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          color: AppColors.goldLight,
          letterSpacing: 0.5,
        );
    }
  }
}
