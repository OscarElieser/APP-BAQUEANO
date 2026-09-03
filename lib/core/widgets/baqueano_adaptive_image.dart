// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — RENDERIZADOR ADAPTATIVO DE IMÁGENES (ASSET / NETWORK)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proporcionar un renderizador universal de imágenes que resuelva de forma transparente
//   archivos locales empaquetados en los assets (`assets/images/lugares/`, `assets/images/comida/`, etc.)
//   y URLs remotas en internet, con soporte offline inmediato y tolerancia a fallos.
// - Eliminar pantallas en blanco cuando no hay conexión móvil o cuando las imágenes
//   están almacenadas localmente en el dispositivo del explorador.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Inspección dinámica de URI: Si el string inicia con `assets/`, invoca `Image.asset`.
//   En caso contrario, invoca `Image.network`.
// - Manejo de errores con fallback visual volcánico (paleta `#082B35`, `#D4AF37`, `#C86432`).
// - Soporte completo para `BoxFit`, dimensiones fijas/flexibles y `BorderRadius`.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `BaqueanoAdaptiveImage`: Widget reutilizable en tarjetas de destinos, gastronomía y modales.
// ============================================================================

import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class BaqueanoAdaptiveImage extends StatelessWidget {
  final String imageUrl;
  final double? width;
  final double? height;
  final BoxFit fit;
  final BorderRadius? borderRadius;
  final Widget? fallbackWidget;
  final String? fallbackText;

  const BaqueanoAdaptiveImage({
    super.key,
    required this.imageUrl,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.borderRadius,
    this.fallbackWidget,
    this.fallbackText,
  });

  @override
  Widget build(BuildContext context) {
    final cleanPath = imageUrl.trim();

    Widget imageWidget;

    // Intención: Detectar si el recurso es local o remoto.
    // Mecanismo: Evaluación de prefijo 'assets/'.
    // Importancia: Carga inmediata desde almacenamiento local a 60 FPS sin consumo de red.
    if (cleanPath.startsWith('assets/')) {
      imageWidget = Image.asset(
        cleanPath,
        width: width,
        height: height,
        fit: fit,
        errorBuilder: (context, error, stackTrace) => _buildErrorFallback(),
      );
    } else if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
      imageWidget = Image.network(
        cleanPath,
        width: width,
        height: height,
        fit: fit,
        errorBuilder: (context, error, stackTrace) => _buildErrorFallback(),
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return Container(
            width: width,
            height: height,
            color: AppColors.primaryDark,
            child: Center(
              child: SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: const AlwaysStoppedAnimation<Color>(AppColors.gold),
                  value: loadingProgress.expectedTotalBytes != null
                      ? loadingProgress.cumulativeBytesLoaded /
                          loadingProgress.expectedTotalBytes!
                      : null,
                ),
              ),
            ),
          );
        },
      );
    } else {
      imageWidget = _buildErrorFallback();
    }

    if (borderRadius != null) {
      return ClipRRect(
        borderRadius: borderRadius!,
        child: imageWidget,
      );
    }

    return imageWidget;
  }

  Widget _buildErrorFallback() {
    if (fallbackWidget != null) return fallbackWidget!;

    return Container(
      width: width,
      height: height,
      color: AppColors.primaryDark,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.terrain_rounded, size: 36, color: AppColors.gold),
            if (fallbackText != null && fallbackText!.isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(
                fallbackText!,
                style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                textAlign: TextAlign.center,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
