import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_colors.dart';
import '../theme/app_gradients.dart';

enum BaqueanoButtonVariant {
  primary,
  secondary,
  outline,
  gold,
  glass,
}

class BaqueanoButton extends StatefulWidget {
  final String text;
  final VoidCallback? onPressed;
  final Widget? icon;
  final BaqueanoButtonVariant variant;
  final double? width;
  final double height;
  final EdgeInsetsGeometry? padding;
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
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 100),
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.96).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
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
        onTapDown: (_) => _controller.forward(),
        onTapUp: (_) => _controller.reverse(),
        onTapCancel: () => _controller.reverse(),
        child: Container(
          width: widget.width,
          height: widget.height,
          decoration: _getDecoration(),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              borderRadius: BorderRadius.circular(12),
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
                            child: Text(
                              widget.text,
                              style: _getTextStyle(),
                              textAlign: TextAlign.center,
                              overflow: TextOverflow.ellipsis,
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
