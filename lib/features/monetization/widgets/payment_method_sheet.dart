// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — HOJA MODAL DE SELECCIÓN DE MÉTODO DE PAGO (CHECKOUT)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia de selección de método de pago bancario de alta gama
//   visual para dueños de negocios turísticos que adquieren planes de membresía.
// - Cumplir con las exigencias de transparencia y seguridad: el cliente visualiza
//   con total claridad qué entidad bancaria procesa su pago (Tarjeta, BANPRO, BAC,
//   LAFISE) y el monto exacto en dólares ($ USD) y córdobas (C$ NIO).
// - Garantizar que ningún dato sensible de tarjeta pase por la app.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Modal Bottom Sheet ergonómico con efecto Glassmorphism (`BackdropFilter`).
// - Utiliza `PaymentGateway` para pedir al backend una orden cuyo precio, dueño,
//   disponibilidad y URL de checkout se validan fuera del dispositivo.
// - La app nunca confirma transacciones ni activa membresías: observa la orden que
//   actualiza un webhook bancario autenticado.
// - Estricta paleta oficial: `#165D6F`, `#F65E01`, `#F4E6C1`, `#0F172A`.
// - Uso de `.withValues(alpha: X)` en todos los canales de color.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `PaymentMethodSheet`: Modal interactivo y método estático `show(...)`.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/payment/models/payment_method_type.dart';
import '../../../core/payment/models/payment_order.dart';
import '../../../core/payment/payment_gateway.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/baqueano_button.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../core/widgets/glass_container.dart';

class PaymentMethodSheet extends ConsumerStatefulWidget {
  final String planId;
  final String planTitle;
  final double amountUsd;
  final bool isAnnual;
  final String businessId;
  final String businessName;

  const PaymentMethodSheet({
    super.key,
    required this.planId,
    required this.planTitle,
    required this.amountUsd,
    required this.isAnnual,
    this.businessId = '',
    this.businessName = '',
  });

  /// Método de utilidad estático para desplegar el modal desde cualquier pantalla
  static Future<void> show(
    BuildContext context, {
    required String planId,
    required String planTitle,
    required double amountUsd,
    required bool isAnnual,
    String businessId = '',
    String businessName = '',
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      barrierColor: AppColors.primaryDark.withValues(alpha: 0.8),
      builder: (context) => PaymentMethodSheet(
        planId: planId,
        planTitle: planTitle,
        amountUsd: amountUsd,
        isAnnual: isAnnual,
        businessId: businessId,
        businessName: businessName,
      ),
    );
  }

  @override
  ConsumerState<PaymentMethodSheet> createState() => _PaymentMethodSheetState();
}

class _PaymentMethodSheetState extends ConsumerState<PaymentMethodSheet> {
  PaymentMethodType _selectedMethod = PaymentMethodType.card;
  bool _isProcessing = false;

  Future<void> _processCheckout() async {
    HapticFeedback.mediumImpact();
    setState(() => _isProcessing = true);

    try {
      final gateway = ref.read(paymentGatewayProvider);

      // El servidor calcula el precio y crea la sesión; el valor visual del plan
      // nunca se envía como autoridad financiera.
      final order = await gateway.createCheckoutSession(
        businessId: widget.businessId,
        planId: widget.planId,
        isAnnual: widget.isAnnual,
        methodType: _selectedMethod,
      );

      if (!mounted) return;

      final uri = Uri.parse(order.checkoutUrl!);
      final launched = await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );
      if (!launched) {
        throw const PaymentGatewayException(
          PaymentFailureReason.unavailable,
          'Android no pudo abrir el checkout hospedado.',
        );
      }

      if (mounted) {
        Navigator.of(context).pop();
        _showPaymentConfirmationDialog(order);
      }
    } catch (e) {
      if (mounted) {
        CustomToast.show(context, message: 'Error iniciando pasarela: $e');
      }
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  void _showPaymentConfirmationDialog(PaymentOrder order) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.bgDark,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: AppColors.gold.withValues(alpha: 0.5)),
        ),
        title: Row(
          children: [
            const Icon(Icons.verified_user_rounded, color: AppColors.jungleGreenLight),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Sesión de Pago Iniciada',
                style: GoogleFonts.montserrat(
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  fontSize: 16,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        content: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
            Text(
              'Abrimos la sesión hospedada que autorizó el servidor para ${_selectedMethod.displayName}.',
              style: GoogleFonts.inter(fontSize: 13, color: Colors.white70),
            ),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primaryDark,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Plan: ${order.planTitle}',
                    style: GoogleFonts.spaceGrotesk(
                      fontWeight: FontWeight.w700,
                      color: AppColors.goldLight,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Monto: \$${order.amountUsd.toInt()} USD (C\$ ${(order.amountNio).toInt()} NIO)',
                    style: GoogleFonts.inter(
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Estado: pendiente de confirmación bancaria',
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      color: AppColors.jungleGreenLight,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Orden: ${order.orderId}',
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      color: Colors.white38,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Completar el formulario no confirma el pago. La activación ocurrirá únicamente cuando el webhook bancario valide monto, moneda y orden.',
              style: GoogleFonts.inter(fontSize: 11.5, color: Colors.white60),
            ),
          ],
        ),
      ),
      actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text(
              'Entendido',
              style: GoogleFonts.spaceGrotesk(
                fontWeight: FontWeight.w700,
                color: AppColors.goldLight,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _contactAssistance() async {
    HapticFeedback.selectionClick();
    final billing = widget.isAnnual ? 'Facturación Anual' : 'Facturación Mensual';
    final msg = Uri.encodeComponent(
      '🤝 *CONSULTA DE AFILIACIÓN COMERCIAL BAQUEANO*\n\n'
      'Hola equipo Baqueano, deseo asistencia personalizada para coordinar el pago de mi plan:\n'
      '• Plan: *${widget.planTitle}*\n'
      '• Modalidad: *$billing*\n'
      '• Monto: *\$${widget.amountUsd.toInt()} USD*\n\n'
      '¿Podemos coordinar los detalles?',
    );
    const supportPhone = String.fromEnvironment(
      'BAQUEANO_SUPPORT_WHATSAPP',
    );
    if (supportPhone.isEmpty) {
      if (mounted) {
        CustomToast.show(
          context,
          message: 'La asistencia comercial aún no está configurada.',
        );
      }
      return;
    }
    final waUri = Uri.parse('https://wa.me/$supportPhone?text=$msg');
    try {
      await launchUrl(waUri, mode: LaunchMode.externalApplication);
    } catch (_) {
      if (mounted) {
        CustomToast.show(
          context,
          message: 'No fue posible abrir el canal de asistencia.',
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final isLandscape = size.width > size.height;
    final maxHeight = size.height * (isLandscape ? 0.94 : 0.88);
    final nioAmount = (widget.amountUsd * 36.65).toInt();
    final billingCycle = widget.isAnnual ? 'Facturación Anual' : 'Facturación Mensual';

    return SafeArea(
      child: ConstrainedBox(
        constraints: BoxConstraints(maxHeight: maxHeight),
        child: Container(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
          decoration: BoxDecoration(
            color: AppColors.bgDark,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            border: Border.all(color: AppColors.gold.withValues(alpha: 0.4), width: 1.2),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.6),
                blurRadius: 30,
                offset: const Offset(0, -10),
              ),
            ],
          ),
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
              // Barra de arrastre superior
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
              const SizedBox(height: 16),

              // Encabezado
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'MÉTODO DE PAGO',
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.2,
                          color: AppColors.goldLight,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Checkout Seguro Oficial',
                        style: GoogleFonts.montserrat(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close_rounded, color: Colors.white60),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Resumen del Plan Elegido
              GlassContainer(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                borderRadius: BorderRadius.circular(16),
                backgroundColor: AppColors.primaryDark.withValues(alpha: 0.8),
                border: Border.all(color: AppColors.borderLight),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.planTitle,
                          style: GoogleFonts.montserrat(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          billingCycle,
                          style: GoogleFonts.inter(fontSize: 11, color: Colors.white60),
                        ),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                        'Estimado: \$${widget.amountUsd.toInt()} USD',
                          style: GoogleFonts.montserrat(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: AppColors.goldLight,
                          ),
                        ),
                        Text(
                          'C\$ $nioAmount NIO',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.jungleGreenLight,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),

              Text(
                'Solicita un canal; el servidor confirmará su disponibilidad:',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: Colors.white70,
                ),
              ),
              const SizedBox(height: 10),

              // Opciones de Métodos Bancarios
              _buildMethodCard(
                type: PaymentMethodType.card,
                badgeText: 'MULTI-BANCO',
                badgeColor: AppColors.jungleGreenLight,
              ),
              const SizedBox(height: 10),

              _buildMethodCard(
                type: PaymentMethodType.banpro,
                badgeText: 'LIQUIDACIÓN DIRECTA',
                badgeColor: AppColors.goldLight,
              ),
              const SizedBox(height: 10),

              _buildMethodCard(
                type: PaymentMethodType.bac,
                badgeText: '3D SECURE',
                badgeColor: AppColors.terracottaLight,
              ),
              const SizedBox(height: 10),

              _buildMethodCard(
                type: PaymentMethodType.lafise,
                badgeText: 'PAGO RECURRENTE',
                badgeColor: AppColors.terracotta,
              ),
              const SizedBox(height: 16),

              // Nota de seguridad y privacidad PCI-DSS
              Row(
                children: [
                  const Icon(Icons.lock_outline_rounded, color: AppColors.jungleGreenLight, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Baqueano no recibe números de tarjeta ni CVV. El precio definitivo y el canal disponible se validan en el servidor.',
                      style: GoogleFonts.inter(
                        fontSize: 10.5,
                        color: Colors.white54,
                        height: 1.25,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Botón de Pago Principal
              BaqueanoButton(
                text: _isProcessing ? 'Conectando con banco...' : 'CONTINUAR AL PAGO SEGURO',
                variant: BaqueanoButtonVariant.primary,
                height: 48,
                width: double.infinity,
                isLoading: _isProcessing,
                onPressed: _isProcessing ? null : _processCheckout,
              ),
              const SizedBox(height: 8),

              // Opción de Asistencia Humana / Convenio WhatsApp
              Center(
                child: TextButton.icon(
                  onPressed: _contactAssistance,
                  icon: const Icon(Icons.chat_outlined, size: 16, color: AppColors.goldLight),
                  label: Text(
                    '¿Prefieres coordinar con un asesor comercial?',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w700,
                      color: AppColors.goldLight,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    ),
  );
}

  Widget _buildMethodCard({
    required PaymentMethodType type,
    required String badgeText,
    required Color badgeColor,
  }) {
    final isSelected = _selectedMethod == type;

    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        setState(() => _selectedMethod = type);
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withValues(alpha: 0.35)
              : AppColors.primaryDark.withValues(alpha: 0.6),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppColors.gold : AppColors.borderLight,
            width: isSelected ? 1.6 : 1.0,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: isSelected
                    ? AppColors.gold.withValues(alpha: 0.2)
                    : Colors.white.withValues(alpha: 0.05),
                shape: BoxShape.circle,
              ),
              child: Icon(
                type.icon,
                color: isSelected ? AppColors.goldLight : Colors.white70,
                size: 22,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          type.displayName,
                          style: GoogleFonts.montserrat(
                            fontSize: 13.5,
                            fontWeight: FontWeight.w800,
                            color: isSelected ? Colors.white : Colors.white70,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: badgeColor.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: badgeColor.withValues(alpha: 0.6), width: 0.6),
                        ),
                        child: Text(
                          badgeText,
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 8.5,
                            fontWeight: FontWeight.w800,
                            color: badgeColor,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    type.subtitle,
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      color: Colors.white54,
                    ),
                  ),
                ],
              ),
            ),
            Radio<PaymentMethodType>(
              value: type,
              groupValue: _selectedMethod,
              activeColor: AppColors.gold,
              onChanged: (val) {
                if (val != null) {
                  setState(() => _selectedMethod = val);
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}
