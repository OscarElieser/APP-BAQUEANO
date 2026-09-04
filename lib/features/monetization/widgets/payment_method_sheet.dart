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
// - Utiliza `PaymentGateway` para despachar la orden de pago y orquestar el checkout
//   oficial del banco seleccionado.
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
    this.businessId = 'biz_active_user',
    this.businessName = 'Mi Negocio Turístico',
  });

  /// Método de utilidad estático para desplegar el modal desde cualquier pantalla
  static Future<void> show(
    BuildContext context, {
    required String planId,
    required String planTitle,
    required double amountUsd,
    required bool isAnnual,
    String businessId = 'biz_active_user',
    String businessName = 'Mi Negocio Turístico',
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

      // 1. Crear la orden formal en Firestore
      final order = await gateway.createOrder(
        businessId: widget.businessId,
        businessName: widget.businessName,
        planId: widget.planId,
        planTitle: widget.planTitle,
        amountUsd: widget.amountUsd,
        isAnnual: widget.isAnnual,
        methodType: _selectedMethod,
      );

      // 2. Iniciar sesión de checkout seguro con el proveedor
      final sessionOrder = await gateway.initiatePaymentSession(order: order);

      if (!mounted) return;

      // 3. Abrir el checkout bancario seguro oficial
      if (sessionOrder.checkoutUrl != null && sessionOrder.checkoutUrl!.isNotEmpty) {
        final uri = Uri.parse(sessionOrder.checkoutUrl!);
        try {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        } catch (_) {
          debugPrint('No se pudo lanzar navegador externo para checkout');
        }

        if (mounted) {
          Navigator.of(context).pop();
          _showPaymentConfirmationDialog(sessionOrder);
        }
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
            Text(
              'Sesión de Pago Iniciada',
              style: GoogleFonts.montserrat(
                fontWeight: FontWeight.w800,
                color: Colors.white,
                fontSize: 16,
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Hemos abierto el checkout seguro oficial de ${_selectedMethod.displayName}.',
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
                    'Destino de Liquidación: ${_selectedMethod.settlementBank}',
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
              'Una vez completado en el portal bancario, tu membresía quedará activa automáticamente.',
              style: GoogleFonts.inter(fontSize: 11.5, color: Colors.white60),
            ),
          ],
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
    final waUri = Uri.parse('https://wa.me/50588883333?text=$msg');
    try {
      await launchUrl(waUri, mode: LaunchMode.externalApplication);
    } catch (_) {
      if (mounted) {
        CustomToast.show(context, message: 'Escríbenos a negocios@baqueano.com');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final nioAmount = (widget.amountUsd * 36.65).toInt();
    final billingCycle = widget.isAnnual ? 'Facturación Anual' : 'Facturación Mensual';

    return SafeArea(
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
                          '\$${widget.amountUsd.toInt()} USD',
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
                'Selecciona tu canal bancario de preferencia:',
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
                      'Baqueano no almacena números de tarjeta ni CVV. Tu pago es cifrado por la entidad bancaria.',
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
                      Text(
                        type.displayName,
                        style: GoogleFonts.montserrat(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w800,
                          color: isSelected ? Colors.white : Colors.white70,
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
