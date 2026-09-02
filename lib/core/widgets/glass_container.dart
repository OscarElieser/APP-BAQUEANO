// ============================================================================
// 🔮 CONTENEDOR GLASSMORPHISM CON FILTRO DE DESENFOQUE (GLASS_CONTAINER.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer el efecto visual de "cristal esmerilado" (Glassmorphism) que define el
//   look and feel Pro y moderno de Baqueano, permitiendo ver las texturas de
//   mapas y fondos volcánicos difuminados bajo las tarjetas de contenido.
// - Crear una sensación de profundidad óptica sofisticada y jerarquía visual en capas.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Utiliza `BackdropFilter` con `ImageFilter.blur(sigmaX: blur, sigmaY: blur)`
//   encapsulado dentro de un `ClipRRect` para evitar desbordes del filtro gausiano.
// - Aplica un color de fondo translúcido con `.withValues(alpha: X)` y borde sutil
//   que refleja la luz cenital ambiental.
// - Soporta interacción táctil (`onTap`) con efecto splash de tinta `InkWell`.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `GlassContainer`: Contenedor universal de interfaz con radio de esquinas, relleno,
//   márgenes y nivel de desenfoque configurables.
// ============================================================================

import 'dart:ui';
import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class GlassContainer extends StatelessWidget {
  /// Contenido hijo a posicionar dentro del contenedor de cristal.
  final Widget child;

  /// Ancho explícito opcional.
  final double? width;

  /// Altura explícita opcional.
  final double? height;

  /// Relleno interno (por defecto 16px en todos los lados).
  final EdgeInsetsGeometry? padding;

  /// Margen externo opcional.
  final EdgeInsetsGeometry? margin;

  /// Radio de esquinas redondeadas (por defecto 16px).
  final BorderRadius? borderRadius;

  /// Color de tinte translúcido del cristal (por defecto Petróleo al 45% alfa).
  final Color? backgroundColor;

  /// Borde perimetral iluminado (por defecto borde blanco al 15% alfa).
  final Border? border;

  /// Intensidad del desenfoque gausiano (sigma X e Y, por defecto 12.0).
  final double blur;

  /// Acción interactiva al tocar la tarjeta de cristal.
  final VoidCallback? onTap;

  const GlassContainer({
    super.key,
    required this.child,
    this.width,
    this.height,
    this.padding,
    this.margin,
    this.borderRadius,
    this.backgroundColor,
    this.border,
    this.blur = 12.0,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    // Definición de valores por defecto para bordes y esquinas redondeadas
    final effectiveBorderRadius = borderRadius ?? BorderRadius.circular(16);
    final effectiveBorder = border ??
        Border.all(
          color: AppColors.borderLight,
          width: 1.0,
        );

    // Construcción del árbol de renderizado del cristal
    Widget content = ClipRRect(
      borderRadius: effectiveBorderRadius,
      child: BackdropFilter(
        // Desenfoque óptico en tiempo real del fondo detrás del widget
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: Container(
          width: width,
          height: height,
          padding: padding ?? const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: backgroundColor ?? AppColors.primary.withValues(alpha: 0.45),
            borderRadius: effectiveBorderRadius,
            border: effectiveBorder,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.2),
                blurRadius: 16,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: child,
        ),
      ),
    );

    // Si el contenedor tiene callback onTap, se añade respuesta háptica y visual con InkWell
    if (onTap != null) {
      content = Material(
        color: Colors.transparent,
        borderRadius: effectiveBorderRadius,
        child: InkWell(
          borderRadius: effectiveBorderRadius,
          onTap: onTap,
          splashColor: AppColors.terracotta.withValues(alpha: 0.2),
          highlightColor: AppColors.gold.withValues(alpha: 0.1),
          child: content,
        ),
      );
    }

    // Si se especifica margen externo, se envuelve en un Padding
    if (margin != null) {
      return Padding(
        padding: margin!,
        child: content,
      );
    }

    return content;
  }
}
