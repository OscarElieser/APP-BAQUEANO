import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/models/destination_model.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/baqueano_button.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/custom_toast.dart';

class CheckoutModal extends StatefulWidget {
  final DestinationModel destination;

  const CheckoutModal({
    super.key,
    required this.destination,
  });

  static Future<void> show(BuildContext context, DestinationModel destination) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => CheckoutModal(destination: destination),
    );
  }

  @override
  State<CheckoutModal> createState() => _CheckoutModalState();
}

class _CheckoutModalState extends State<CheckoutModal> {
  int _participants = 1;
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 2));
  bool _isTourist = true; // 0% IVA (Turista Extranjero) vs 15% (Residente Local)
  bool _useNioCurrency = false; // Toggle USD / NIO
  final TextEditingController _couponController = TextEditingController();
  bool _couponApplied = false;
  double _discountPercentage = 0.0;
  String _couponError = '';

  final TextEditingController _nameController = TextEditingController(text: 'Explorador Baqueano');
  final TextEditingController _emailController = TextEditingController(text: 'explorador@baqueano.ni');
  final TextEditingController _phoneController = TextEditingController(text: '+505 8888-9999');

  bool _isConfirmed = false;
  String _expeditionCode = '';

  @override
  void initState() {
    super.initState();
    _generateExpeditionCode();
  }

  void _generateExpeditionCode() {
    final random = Random();
    final number = 100000 + random.nextInt(900000);
    _expeditionCode = 'BAQ-$number';
  }

  @override
  void dispose() {
    _couponController.dispose();
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  void _applyCoupon() {
    final code = _couponController.text.trim().toUpperCase();
    if (code == AppConstants.promoCouponCode) {
      setState(() {
        _couponApplied = true;
        _discountPercentage = AppConstants.promoCouponDiscount;
        _couponError = '';
      });
      CustomToast.success(context, '¡Cupón BAQUEANO2026 aplicado con éxito! -15%');
    } else {
      setState(() {
        _couponApplied = false;
        _discountPercentage = 0.0;
        _couponError = 'Cupón inválido. Prueba con: BAQUEANO2026';
      });
    }
  }

  double get _subtotalUsd => widget.destination.priceUsd * _participants;
  double get _discountAmountUsd => _subtotalUsd * _discountPercentage;
  double get _afterDiscountUsd => _subtotalUsd - _discountAmountUsd;
  double get _vatRate => _isTourist ? AppConstants.touristVatRate : AppConstants.residentVatRate;
  double get _vatAmountUsd => _afterDiscountUsd * _vatRate;
  double get _totalUsd => _afterDiscountUsd + _vatAmountUsd;

  double get _totalNio => _totalUsd * AppConstants.exchangeRateNioUsd;
  double get _subtotalNio => _subtotalUsd * AppConstants.exchangeRateNioUsd;
  double get _vatAmountNio => _vatAmountUsd * AppConstants.exchangeRateNioUsd;
  double get _discountAmountNio => _discountAmountUsd * AppConstants.exchangeRateNioUsd;

  String _formatCurrency(double usdAmount, double nioAmount) {
    if (_useNioCurrency) {
      return 'C\$ ${NumberFormat('#,##0.00', 'en_US').format(nioAmount)} NIO';
    } else {
      return '\$ ${NumberFormat('#,##0.00', 'en_US').format(usdAmount)} USD';
    }
  }

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 700;

    return DraggableScrollableSheet(
      initialChildSize: isMobile ? 0.92 : 0.85,
      minChildSize: 0.5,
      maxChildSize: 0.96,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: AppColors.bgDark,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
            border: Border(top: BorderSide(color: AppColors.gold, width: 1.5)),
          ),
          child: Column(
            children: [
              // Sheet Grabber
              Center(
                child: Container(
                  margin: const EdgeInsets.only(top: 12, bottom: 8),
                  width: 48,
                  height: 5,
                  decoration: BoxDecoration(
                    color: AppColors.borderLight,
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),

              // Header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.terracotta.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.shield_outlined, color: AppColors.gold, size: 22),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _isConfirmed ? 'COMPROBANTE DE EXPEDICIÓN' : 'SOLICITUD DE RESERVA & PAGO',
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppColors.terracottaLight,
                              letterSpacing: 1.1,
                            ),
                          ),
                          Text(
                            widget.destination.title,
                            style: GoogleFonts.montserrat(
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                              color: AppColors.textLight,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: AppColors.textMuted),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ],
                ),
              ),
              const Divider(color: AppColors.borderLight),

              // Content
              Expanded(
                child: _isConfirmed
                    ? _buildConfirmationView(scrollController)
                    : _buildBookingForm(scrollController),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildBookingForm(ScrollController scrollController) {
    return ListView(
      controller: scrollController,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      children: [
        // Currency Selector Switcher
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.4),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.borderLight),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'MONEDA DE COBRO',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textMuted,
                      letterSpacing: 1.0,
                    ),
                  ),
                  Text(
                    'Tasa Oficial: C\$ 36.65 NIO = \$1.00 USD',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: AppColors.goldLight,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
              Container(
                decoration: BoxDecoration(
                  color: AppColors.bgDark,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.borderGold),
                ),
                child: Row(
                  children: [
                    _buildCurrencyTab('USD', !_useNioCurrency, () => setState(() => _useNioCurrency = false)),
                    _buildCurrencyTab('NIO (C\$)', _useNioCurrency, () => setState(() => _useNioCurrency = true)),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // 1. PARTICIPANTES Y FECHAS
        Text(
          '1. DETALLES DE LA EXPEDICIÓN',
          style: GoogleFonts.spaceGrotesk(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: AppColors.gold,
            letterSpacing: 1.0,
          ),
        ),
        const SizedBox(height: 10),

        Row(
          children: [
            // Participantes
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Exploradores', style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted)),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        InkWell(
                          onTap: _participants > 1 ? () => setState(() => _participants--) : null,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: AppColors.primaryLight,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Icon(Icons.remove, size: 18, color: AppColors.textLight),
                          ),
                        ),
                        Text(
                          '$_participants pax',
                          style: GoogleFonts.spaceGrotesk(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textLight),
                        ),
                        InkWell(
                          onTap: _participants < 12 ? () => setState(() => _participants++) : null,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: AppColors.primaryLight,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Icon(Icons.add, size: 18, color: AppColors.textLight),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 12),

            // Selector de Fecha
            Expanded(
              child: InkWell(
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _selectedDate,
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 365)),
                    builder: (context, child) {
                      return Theme(
                        data: ThemeData.dark().copyWith(
                          colorScheme: const ColorScheme.dark(
                            primary: AppColors.terracotta,
                            onPrimary: Colors.white,
                            surface: AppColors.bgDark,
                            onSurface: AppColors.textLight,
                          ),
                        ),
                        child: child!,
                      );
                    },
                  );
                  if (picked != null) {
                    setState(() => _selectedDate = picked);
                  }
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: AppColors.bgCard,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Fecha de Salida', style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted)),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          const Icon(Icons.calendar_today, size: 16, color: AppColors.gold),
                          const SizedBox(width: 6),
                          Text(
                            DateFormat('dd MMM yyyy').format(_selectedDate),
                            style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textLight),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),

        const SizedBox(height: 16),

        // 2. RÉGIMEN FISCAL (TURISTA 0% vs RESIDENTE 15%)
        Text(
          '2. RÉGIMEN TRIBUTARIO (LEY DE TURISMO DE NICARAGUA)',
          style: GoogleFonts.spaceGrotesk(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: AppColors.gold,
            letterSpacing: 1.0,
          ),
        ),
        const SizedBox(height: 8),

        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.bgCard,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.borderLight),
          ),
          child: Column(
            children: [
              RadioListTile<bool>(
                value: true,
                groupValue: _isTourist,
                activeColor: AppColors.terracotta,
                contentPadding: EdgeInsets.zero,
                dense: true,
                title: Text(
                  'Turista Extranjero (0% IVA Exonerado)',
                  style: GoogleFonts.spaceGrotesk(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textLight),
                ),
                subtitle: Text(
                  'Aplica exoneración fiscal de la Ley de Incentivos Turísticos de Nicaragua.',
                  style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted),
                ),
                onChanged: (val) => setState(() => _isTourist = val!),
              ),
              const Divider(color: AppColors.borderLight, height: 16),
              RadioListTile<bool>(
                value: false,
                groupValue: _isTourist,
                activeColor: AppColors.terracotta,
                contentPadding: EdgeInsets.zero,
                dense: true,
                title: Text(
                  'Residente Local / Nacional (15% IVA Estándar)',
                  style: GoogleFonts.spaceGrotesk(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textLight),
                ),
                subtitle: Text(
                  'Incluye impuesto al valor agregado nacional DGI.',
                  style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted),
                ),
                onChanged: (val) => setState(() => _isTourist = val!),
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // 3. CUPÓN DE DESCUENTO
        Text(
          '3. CUPÓN DE DESCUENTO COMUNITARIO',
          style: GoogleFonts.spaceGrotesk(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: AppColors.gold,
            letterSpacing: 1.0,
          ),
        ),
        const SizedBox(height: 8),

        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _couponController,
                style: GoogleFonts.spaceGrotesk(color: AppColors.textLight, fontWeight: FontWeight.w600),
                decoration: InputDecoration(
                  hintText: 'Ingresa código (ej. BAQUEANO2026)',
                  hintStyle: GoogleFonts.inter(color: AppColors.textMuted, fontSize: 13),
                  filled: true,
                  fillColor: AppColors.bgCard,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.gold)),
                ),
              ),
            ),
            const SizedBox(width: 10),
            BaqueanoButton(
              text: 'Aplicar',
              variant: BaqueanoButtonVariant.secondary,
              height: 48,
              onPressed: _applyCoupon,
            ),
          ],
        ),
        if (_couponError.isNotEmpty) ...[
          const SizedBox(height: 6),
          Text(_couponError, style: GoogleFonts.inter(fontSize: 12, color: AppColors.error)),
        ],
        if (_couponApplied) ...[
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(Icons.check_circle, color: AppColors.success, size: 16),
              const SizedBox(width: 6),
              Text('Cupón activo: 15% de descuento en esta expedición', style: GoogleFonts.inter(fontSize: 12, color: AppColors.success)),
            ],
          ),
        ],

        const SizedBox(height: 20),

        // DESGLOSE FINANCIERO EN VIVO
        GlassContainer(
          backgroundColor: AppColors.primaryLight.withValues(alpha: 0.3),
          borderRadius: BorderRadius.circular(16),
          padding: const EdgeInsets.all(16),
          border: Border.all(color: AppColors.borderGold, width: 1.2),
          child: Column(
            children: [
              _buildPriceRow(
                'Tarifa Base x $_participants persona(s)',
                _formatCurrency(_subtotalUsd, _subtotalNio),
              ),
              if (_couponApplied) ...[
                const SizedBox(height: 8),
                _buildPriceRow(
                  'Descuento Comunitario (-15%)',
                  '- ${_formatCurrency(_discountAmountUsd, _discountAmountNio)}',
                  textColor: AppColors.success,
                ),
              ],
              const SizedBox(height: 8),
              _buildPriceRow(
                _isTourist ? 'IVA (Exoneración Turista 0%)' : 'IVA (Residente Local 15%)',
                _formatCurrency(_vatAmountUsd, _vatAmountNio),
                textColor: _isTourist ? AppColors.goldLight : AppColors.textMuted,
              ),
              const Divider(color: AppColors.borderLight, height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'TOTAL A PAGAR',
                        style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.goldLight, letterSpacing: 1.0),
                      ),
                      Text(
                        'Pago 100% directo a los anfitriones',
                        style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
                      ),
                    ],
                  ),
                  Text(
                    _formatCurrency(_totalUsd, _totalNio),
                    style: GoogleFonts.montserrat(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: AppColors.gold,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 24),

        // CTA DE CONFIRMACIÓN
        BaqueanoButton(
          text: 'CONFIRMAR EXPEDICIÓN & GENERAR COMPROBANTE',
          icon: const Icon(Icons.verified, color: Colors.white, size: 20),
          variant: BaqueanoButtonVariant.primary,
          height: 54,
          onPressed: () {
            setState(() => _isConfirmed = true);
            CustomToast.success(context, '¡Expedición confirmada! Tu comprobante está listo.');
          },
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildPriceRow(String label, String value, {Color? textColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(fontSize: 13, color: AppColors.textMuted),
        ),
        Text(
          value,
          style: GoogleFonts.spaceGrotesk(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: textColor ?? AppColors.textLight,
          ),
        ),
      ],
    );
  }

  Widget _buildCurrencyTab(String label, bool isSelected, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.terracotta : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: GoogleFonts.spaceGrotesk(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected ? Colors.white : AppColors.textMuted,
          ),
        ),
      ),
    );
  }

  Widget _buildConfirmationView(ScrollController scrollController) {
    return ListView(
      controller: scrollController,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      children: [
        // Official Document Header
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: AppGradients.cardGlass,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.gold, width: 1.5),
            boxShadow: [
              BoxShadow(
                color: AppColors.gold.withValues(alpha: 0.15),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Text('🇳🇮', style: TextStyle(fontSize: 28)),
                      const SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('REPÚBLICA DE NICARAGUA', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.gold)),
                          Text('BAQUEANO EXPEDITION PASS', style: GoogleFonts.montserrat(fontSize: 13, fontWeight: FontWeight.w900, color: Colors.white)),
                        ],
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.success.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.success),
                    ),
                    child: Text(
                      'AUTORIZADO',
                      style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.success),
                    ),
                  ),
                ],
              ),
              const Divider(color: AppColors.borderLight, height: 28),

              // Code and Details
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('CÓDIGO ÚNICO', style: GoogleFonts.spaceGrotesk(fontSize: 10, color: AppColors.textMuted)),
                      Text(_expeditionCode, style: GoogleFonts.spaceGrotesk(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.goldLight)),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('FECHA DE VIAJE', style: GoogleFonts.spaceGrotesk(fontSize: 10, color: AppColors.textMuted)),
                      Text(DateFormat('dd MMMM yyyy').format(_selectedDate), style: GoogleFonts.spaceGrotesk(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white)),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 16),

              _buildDetailRow('Destino / Circuito:', widget.destination.title),
              _buildDetailRow('Departamento:', widget.destination.department),
              _buildDetailRow('Guía Asignado:', '${widget.destination.guideName} (${widget.destination.guideBadge})'),
              _buildDetailRow('Participantes:', '$_participants persona(s)'),
              _buildDetailRow('Monto Total:', _formatCurrency(_totalUsd, _totalNio)),
              _buildDetailRow('Régimen Fiscal:', _isTourist ? 'Turista (0% IVA Exonerado)' : 'Residente (15% IVA Incluido)'),

              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.primaryDark.withValues(alpha: 0.7),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline, color: AppColors.gold, size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Presenta este comprobante digital o tu código $_expeditionCode a tu guía baqueano al iniciar el sendero.',
                        style: GoogleFonts.inter(fontSize: 12, color: AppColors.textLight),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),

        Row(
          children: [
            Expanded(
              child: BaqueanoButton(
                text: 'Descargar / Imprimir',
                icon: const Icon(Icons.download, size: 18),
                variant: BaqueanoButtonVariant.secondary,
                onPressed: () {
                  CustomToast.success(context, 'Comprobante $_expeditionCode guardado en tu dispositivo.');
                },
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: BaqueanoButton(
                text: 'Cerrar',
                variant: BaqueanoButtonVariant.primary,
                onPressed: () => Navigator.of(context).pop(),
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),
      ],
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted)),
          Flexible(
            child: Text(
              value,
              style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textLight),
              textAlign: TextAlign.end,
            ),
          ),
        ],
      ),
    );
  }
}
