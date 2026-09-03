// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MODAL DE RESERVA, FACTURACIÓN & PAGO DIRECTO
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia de reserva, contratación y liquidación transparente y
//   de comercio justo entre el explorador y los anfitriones campesinos locales.
// - Recopilar la información completa del explorador para póliza de seguro y registro
//   de expedición, al tiempo que exhibe la ficha legal, fiscal y bancaria completa
//   del emprendimiento comunitario receptor del pago sin intermediarios.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Modal deslizable (`DraggableScrollableSheet` o `Dialog` en pantallas amplias).
// - Gestión reactiva de moneda dual (USD / NIO) con tipo de cambio oficial de Nicaragua.
// - Desglose tributario en cumplimiento de la Ley No. 306 de Incentivos Turísticos
//   (0% IVA para turistas extranjeros y 15% IVA para residentes locales).
// - Acceso directo a números de cuenta bancarios (BAC Credomatic, Banpro, Lafise,
//   Billetera Móvil) con copia rápida al portapapeles.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `CheckoutModal`: Widget con formulario de datos personales, ficha del local,
//   cuentas bancarias, régimen fiscal, cálculo en tiempo real y emisión de comprobante.
// ============================================================================

import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/models/destination_model.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/baqueano_button.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../services/booking_and_communication_service.dart';
import 'baqueano_voucher_dialog.dart';

/// Ficha técnica, fiscal y bancaria del emprendimiento local anfitrión
class HostEnterpriseProfile {
  final String businessName;
  final String legalOwner;
  final String rucNumber;
  final String inturLicense;
  final String address;
  final String phone;
  final String email;
  final String bacNioAccount;
  final String bacUsdAccount;
  final String banproNioAccount;
  final String banproUsdAccount;
  final String lafiseAccount;
  final String mobileWallet;
  final String beneficiary;
  final String taxStatus;

  const HostEnterpriseProfile({
    required this.businessName,
    required this.legalOwner,
    required this.rucNumber,
    required this.inturLicense,
    required this.address,
    required this.phone,
    required this.email,
    required this.bacNioAccount,
    required this.bacUsdAccount,
    required this.banproNioAccount,
    required this.banproUsdAccount,
    required this.lafiseAccount,
    required this.mobileWallet,
    required this.beneficiary,
    required this.taxStatus,
  });

  /// Resuelve la información del anfitrión según el destino seleccionado
  factory HostEnterpriseProfile.fromDestination(DestinationModel dest) {
    if (dest.id.contains('luna') || dest.department.toLowerCase().contains('matagalpa')) {
      return const HostEnterpriseProfile(
        businessName: 'Cooperativa Ecoturística Cascada La Luna & Cañones R.L.',
        legalOwner: 'Rosa Amelia Valle Palacios',
        rucNumber: 'J0310000492819',
        inturLicense: 'INTUR-MAT-2026-084',
        address: 'Km 142 Carretera El Tuma - La Dalia, Caserío El Diamante, Matagalpa',
        phone: '+505 8990-7766',
        email: 'reservas.cascadalaluna@baqueano.ni',
        bacNioAccount: '365-849201-9',
        bacUsdAccount: '365-849202-7',
        banproNioAccount: '1002-3948-2819',
        banproUsdAccount: '1002-3948-2820',
        lafiseAccount: '4920-1928-301',
        mobileWallet: '50589907766 (Billetera Móvil / CoDi)',
        beneficiary: 'Rosa Amelia Valle Palacios (Coop. Cascada La Luna)',
        taxStatus: 'Régimen Especial Ecoturismo Campesino (Exonerado Turistas Ley 306)',
      );
    } else if (dest.id.contains('somoto') || dest.department.toLowerCase().contains('madriz')) {
      return const HostEnterpriseProfile(
        businessName: 'Asociación de Guías Nativos del Cañón de Somoto',
        legalOwner: 'Antonio "Don Toño" Calero Ruiz',
        rucNumber: 'J0210000194821',
        inturLicense: 'INTUR-MAD-2026-012',
        address: 'Comunidad Sonís, Monumento Nacional Cañón de Somoto, Madriz',
        phone: '+505 8443-1289',
        email: 'canon.somoto@baqueano.ni',
        bacNioAccount: '361-902184-2',
        bacUsdAccount: '361-902185-0',
        banproNioAccount: '1001-4492-8812',
        banproUsdAccount: '1001-4492-8813',
        lafiseAccount: '4810-2918-091',
        mobileWallet: '50584431289 (Billetera Móvil)',
        beneficiary: 'Antonio Calero Ruiz (Asoc. Guías Cañón)',
        taxStatus: 'Turismo Comunitario Sostenible (Exonerado Turistas Ley 306)',
      );
    } else if (dest.id.contains('ometepe') || dest.department.toLowerCase().contains('rivas')) {
      return const HostEnterpriseProfile(
        businessName: 'Finca Agroecológica & Turismo El Encanto de Ometepe',
        legalOwner: 'Mayra Auxiliadora Carcache',
        rucNumber: 'J0510000281944',
        inturLicense: 'INTUR-RIV-2026-119',
        address: 'Faldas del Volcán Maderas, Comunidad Balgüe, Isla de Ometepe, Rivas',
        phone: '+505 8892-3401',
        email: 'ometepe.agroeco@baqueano.ni',
        bacNioAccount: '368-119284-5',
        bacUsdAccount: '368-119285-3',
        banproNioAccount: '1005-7712-4019',
        banproUsdAccount: '1005-7712-4020',
        lafiseAccount: '4950-7712-882',
        mobileWallet: '50588923401 (Billetera Móvil / Kash)',
        beneficiary: 'Mayra Auxiliadora Carcache (Finca El Encanto)',
        taxStatus: 'Agroturismo Comunitario (0% IVA Turista / 15% IVA Nacional)',
      );
    } else if (dest.id.contains('masaya') || dest.id.contains('granada')) {
      return const HostEnterpriseProfile(
        businessName: 'Ecotours Volcán & Lagos de Nicaragua R.L.',
        legalOwner: 'Carlos Mendieta Flores',
        rucNumber: 'J0410000381920',
        inturLicense: 'INTUR-MAS-2026-041',
        address: 'Km 23 Carretera a Masaya, Complejo Parque Nacional Volcán Masaya',
        phone: '+505 8831-4422',
        email: 'volcan.masaya@baqueano.ni',
        bacNioAccount: '362-749102-1',
        bacUsdAccount: '362-749103-9',
        banproNioAccount: '1003-8821-5012',
        banproUsdAccount: '1003-8821-5013',
        lafiseAccount: '4820-3391-401',
        mobileWallet: '50588314422 (Billetera Móvil)',
        beneficiary: 'Carlos Mendieta Flores (Ecotours Volcán)',
        taxStatus: 'Operadora de Turismo de Aventura (Ley 306 INTUR)',
      );
    } else {
      return HostEnterpriseProfile(
        businessName: 'Red Baqueano Comunitario — Operación ${dest.department}',
        legalOwner: dest.guideName,
        rucNumber: 'J0110000984712',
        inturLicense: 'INTUR-NIC-2026-${dest.id.hashCode.abs().toString().substring(0, 3)}',
        address: '${dest.title}, Departamento de ${dest.department}, Nicaragua',
        phone: '+505 8888-9999',
        email: 'operaciones.${dest.id.replaceAll("-", "")}@baqueano.ni',
        bacNioAccount: '360-554421-8',
        bacUsdAccount: '360-554422-6',
        banproNioAccount: '1000-8849-2011',
        banproUsdAccount: '1000-8849-2012',
        lafiseAccount: '4800-9941-203',
        mobileWallet: '50588889999 (Billetera Móvil / CoDi)',
        beneficiary: '${dest.guideName} (Red Baqueano Comunitario)',
        taxStatus: 'Turismo Campesino Comunitario Directo (Ley No. 306)',
      );
    }
  }
}

class CheckoutModal extends ConsumerStatefulWidget {
  final DestinationModel destination;

  const CheckoutModal({
    super.key,
    required this.destination,
  });

  static Future<void> show(BuildContext context, DestinationModel destination) {
    final width = MediaQuery.of(context).size.width;
    if (width >= 700) {
      return showDialog(
        context: context,
        builder: (context) => Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 680, maxHeight: 880),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: CheckoutModal(destination: destination),
            ),
          ),
        ),
      );
    }
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => CheckoutModal(destination: destination),
    );
  }

  @override
  ConsumerState<CheckoutModal> createState() => _CheckoutModalState();
}

class _CheckoutModalState extends ConsumerState<CheckoutModal> {
  int _participants = 1;
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 2));
  bool _isTourist = true; // 0% IVA (Turista Extranjero) vs 15% (Residente Local)
  bool _useNioCurrency = false; // Toggle USD / NIO
  final TextEditingController _couponController = TextEditingController();
  bool _couponApplied = false;
  double _discountPercentage = 0.0;
  String _couponError = '';

  // Datos del explorador / usuario
  final TextEditingController _nameController = TextEditingController(text: 'Valeria Mendoza');
  final TextEditingController _documentController = TextEditingController(text: 'CR-849204-P');
  final TextEditingController _phoneController = TextEditingController(text: '+505 8443-8822');
  final TextEditingController _emailController = TextEditingController(text: 'valeria.exploradora@baqueano.ni');
  final TextEditingController _nationalityController = TextEditingController(text: 'Costa Rica');

  late final HostEnterpriseProfile _hostEnterprise;

  bool _isConfirmed = false;
  String _expeditionCode = '';

  @override
  void initState() {
    super.initState();
    _hostEnterprise = HostEnterpriseProfile.fromDestination(widget.destination);
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
    _documentController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _nationalityController.dispose();
    super.dispose();
  }

  void _copyToClipboard(String text, String label) {
    Clipboard.setData(ClipboardData(text: text));
    CustomToast.success(context, '$label copiado: $text');
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
      initialChildSize: isMobile ? 0.94 : 0.88,
      minChildSize: 0.55,
      maxChildSize: 0.98,
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
                            _isConfirmed ? 'COMPROBANTE OFICIAL DE RESERVA' : 'SOLICITUD DE RESERVA & PAGO DIRECTO',
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w700,
                              color: AppColors.terracottaLight,
                              letterSpacing: 0.8,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            widget.destination.title,
                            style: GoogleFonts.montserrat(
                              fontSize: 15,
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
          child: Wrap(
            alignment: WrapAlignment.spaceBetween,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 10,
            runSpacing: 8,
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
                      fontSize: 11.5,
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
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _buildCurrencyTab('USD', !_useNioCurrency, () => setState(() => _useNioCurrency = false)),
                    _buildCurrencyTab('NIO (C\$)', _useNioCurrency, () => setState(() => _useNioCurrency = true)),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 18),

        // --------------------------------------------------------------------
        // SECCIÓN 1: DATOS COMPLETOS DEL EXPLORADOR / USUARIO
        // --------------------------------------------------------------------
        _buildSectionTitle('1. DATOS DEL EXPLORADOR SOLICITANTE', Icons.badge_outlined),
        const SizedBox(height: 10),

        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.bgCard,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.borderLight),
          ),
          child: Column(
            children: [
              _buildTextInputField(
                label: 'Nombre Completo',
                controller: _nameController,
                hint: 'Ej. Valeria Mendoza',
                icon: Icons.person_outline,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _buildTextInputField(
                      label: 'Cédula o Pasaporte',
                      controller: _documentController,
                      hint: 'Ej. 001-240995-1002A',
                      icon: Icons.credit_card_outlined,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildTextInputField(
                      label: 'Nacionalidad',
                      controller: _nationalityController,
                      hint: 'Ej. Costa Rica / Nicaragua',
                      icon: Icons.flag_outlined,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _buildTextInputField(
                      label: 'Teléfono / WhatsApp',
                      controller: _phoneController,
                      hint: 'Ej. +505 8443-8822',
                      icon: Icons.phone_outlined,
                      keyboardType: TextInputType.phone,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildTextInputField(
                      label: 'Correo Electrónico',
                      controller: _emailController,
                      hint: 'correo@ejemplo.com',
                      icon: Icons.email_outlined,
                      keyboardType: TextInputType.emailAddress,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 18),

        // --------------------------------------------------------------------
        // SECCIÓN 2: INFORMACIÓN COMPLETA DEL LOCAL / EMPRENDIMIENTO
        // --------------------------------------------------------------------
        _buildSectionTitle('2. INFORMACIÓN DEL LOCAL & EMPRENDIMIENTO CAMPESINO', Icons.storefront_outlined),
        const SizedBox(height: 10),

        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                AppColors.primaryDark.withValues(alpha: 0.95),
                AppColors.bgCard,
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.gold.withValues(alpha: 0.4), width: 1.2),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.gold.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.gold, width: 1.2),
                    ),
                    child: const Icon(Icons.verified_user_rounded, color: AppColors.goldLight, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _hostEnterprise.businessName,
                          style: GoogleFonts.montserrat(
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Propietario / Responsable: ${_hostEnterprise.legalOwner}',
                          style: GoogleFonts.inter(fontSize: 12, color: AppColors.goldLight, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const Divider(color: AppColors.borderLight, height: 20),

              _buildEnterpriseInfoRow('Número RUC:', _hostEnterprise.rucNumber, isMonospace: true),
              _buildEnterpriseInfoRow('Licencia INTUR:', _hostEnterprise.inturLicense, isMonospace: true),
              _buildEnterpriseInfoRow('Dirección Exacta:', _hostEnterprise.address),
              _buildEnterpriseInfoRow('Teléfono Directo:', _hostEnterprise.phone),
              _buildEnterpriseInfoRow('Correo Oficial:', _hostEnterprise.email),
              _buildEnterpriseInfoRow('Régimen Legal:', _hostEnterprise.taxStatus),
            ],
          ),
        ),

        const SizedBox(height: 18),

        // --------------------------------------------------------------------
        // SECCIÓN 3: CUENTAS BANCARIAS PARA PAGO DIRECTO
        // --------------------------------------------------------------------
        _buildSectionTitle('3. CUENTAS BANCARIAS OFICIALES PARA PAGO DIRECTO', Icons.account_balance_outlined),
        const SizedBox(height: 10),

        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF041920),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.borderGold, width: 1.2),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.jungleGreen.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.jungleGreen),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle_outline, color: AppColors.jungleGreen, size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Comercio Justo: El 100% de tu pago se transfiere directamente al anfitrión sin comisión.',
                        style: GoogleFonts.inter(fontSize: 11, color: Colors.white70),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              Text(
                'Beneficiario: ${_hostEnterprise.beneficiary}',
                style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.goldLight),
              ),
              const SizedBox(height: 10),

              // BAC Credomatic
              _buildBankAccountTile(
                bankName: 'BAC Credomatic',
                nioAccount: _hostEnterprise.bacNioAccount,
                usdAccount: _hostEnterprise.bacUsdAccount,
                bankColor: const Color(0xFFE50019),
              ),
              const SizedBox(height: 8),

              // BANPRO
              _buildBankAccountTile(
                bankName: 'Banco de la Producción (BANPRO)',
                nioAccount: _hostEnterprise.banproNioAccount,
                usdAccount: _hostEnterprise.banproUsdAccount,
                bankColor: const Color(0xFF007A3D),
              ),
              const SizedBox(height: 8),

              // LAFISE
              _buildSingleAccountTile(
                bankName: 'Banco LAFISE Bancentro',
                accountNumber: _hostEnterprise.lafiseAccount,
                currencyBadge: 'Cta Unificada NIO / USD',
                bankColor: const Color(0xFF003865),
              ),
              const SizedBox(height: 8),

              // Billetera Móvil / CoDi
              _buildSingleAccountTile(
                bankName: 'Billetera Móvil / Transferencia Celular',
                accountNumber: _hostEnterprise.mobileWallet,
                currencyBadge: 'Transferencia Rápida',
                bankColor: const Color(0xFFC86432),
              ),
            ],
          ),
        ),

        const SizedBox(height: 18),

        // --------------------------------------------------------------------
        // SECCIÓN 4: DETALLES DE LA EXPEDICIÓN
        // --------------------------------------------------------------------
        _buildSectionTitle('4. DETALLES DE LA EXPEDICIÓN', Icons.event_available_outlined),
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

        const SizedBox(height: 18),

        // --------------------------------------------------------------------
        // SECCIÓN 5: RÉGIMEN FISCAL (TURISTA 0% vs RESIDENTE 15%)
        // --------------------------------------------------------------------
        _buildSectionTitle('5. RÉGIMEN TRIBUTARIO & POLÍTICA DE IVA (LEY NO. 306)', Icons.gavel_outlined),
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
                  'Aplica exoneración fiscal de la Ley de Incentivos Turísticos de Nicaragua (Ley 306 INTUR).',
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
                  'Residente Local / Nacional (15% IVA General DGI)',
                  style: GoogleFonts.spaceGrotesk(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textLight),
                ),
                subtitle: Text(
                  'Incluye impuesto al valor agregado nacional para facturación fiscal DGI.',
                  style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted),
                ),
                onChanged: (val) => setState(() => _isTourist = val!),
              ),
            ],
          ),
        ),

        const SizedBox(height: 18),

        // --------------------------------------------------------------------
        // SECCIÓN 6: CUPÓN DE DESCUENTO
        // --------------------------------------------------------------------
        _buildSectionTitle('6. CUPÓN DE DESCUENTO COMUNITARIO', Icons.local_offer_outlined),
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

        // --------------------------------------------------------------------
        // DESGLOSE FINANCIERO EN VIVO
        // --------------------------------------------------------------------
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
                _isTourist ? 'IVA (Exoneración Turista 0% Ley 306)' : 'IVA (Residente Local 15% DGI)',
                _formatCurrency(_vatAmountUsd, _vatAmountNio),
                textColor: _isTourist ? AppColors.goldLight : AppColors.textMuted,
              ),
              const Divider(color: AppColors.borderLight, height: 20),
              Wrap(
                alignment: WrapAlignment.spaceBetween,
                crossAxisAlignment: WrapCrossAlignment.center,
                spacing: 12,
                runSpacing: 8,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'TOTAL A PAGAR',
                        style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.goldLight, letterSpacing: 1.0),
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
                      fontSize: 18,
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
            if (_nameController.text.trim().isEmpty) {
              CustomToast.error(context, 'Por favor ingresa el nombre del explorador');
              return;
            }

            // Registrar reserva real en el servicio central de Baqueano
            ref.read(bookingCommunicationProvider.notifier).createBooking(
              code: _expeditionCode,
              destinationTitle: widget.destination.title,
              destinationId: widget.destination.id,
              department: widget.destination.department,
              hostName: _hostEnterprise.legalOwner,
              hostBusiness: _hostEnterprise.businessName,
              hostPhone: _hostEnterprise.phone,
              date: DateFormat('dd MMM yyyy').format(_selectedDate),
              participants: _participants,
              totalUsd: _totalUsd,
              totalNio: _totalNio,
              isTourist: _isTourist,
              imageUrl: widget.destination.imageUrl,
              clientName: _nameController.text.trim(),
              clientPhone: _phoneController.text.trim(),
            );

            setState(() => _isConfirmed = true);
            CustomToast.success(context, '¡Expedición confirmada! Tu comprobante está listo.');
          },
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildSectionTitle(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppColors.gold),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            title,
            style: GoogleFonts.spaceGrotesk(
              fontSize: 11,
              fontWeight: FontWeight.w800,
              color: AppColors.gold,
              letterSpacing: 0.9,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTextInputField({
    required String label,
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textMuted),
        ),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          style: GoogleFonts.inter(fontSize: 13, color: Colors.white, fontWeight: FontWeight.w500),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: GoogleFonts.inter(color: AppColors.textMuted.withValues(alpha: 0.6), fontSize: 12),
            prefixIcon: Icon(icon, color: AppColors.goldLight, size: 18),
            filled: true,
            fillColor: const Color(0xFF041920),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.borderLight)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.borderLight)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.gold)),
          ),
        ),
      ],
    );
  }

  Widget _buildEnterpriseInfoRow(String label, String value, {bool isMonospace = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted, fontWeight: FontWeight.w600),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: isMonospace
                  ? GoogleFonts.spaceGrotesk(fontSize: 12, color: AppColors.goldLight, fontWeight: FontWeight.w700)
                  : GoogleFonts.inter(fontSize: 12, color: Colors.white70),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBankAccountTile({
    required String bankName,
    required String nioAccount,
    required String usdAccount,
    required Color bankColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(color: bankColor, shape: BoxShape.circle),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  bankName,
                  style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: Text('C\$ (NIO): $nioAccount', style: GoogleFonts.spaceGrotesk(fontSize: 12, color: AppColors.goldLight, fontWeight: FontWeight.w600)),
              ),
              InkWell(
                onTap: () => _copyToClipboard(nioAccount, 'Cta $bankName Córdobas'),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(6)),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.copy, size: 12, color: Colors.white70),
                      const SizedBox(width: 4),
                      Text('Copiar', style: GoogleFonts.inter(fontSize: 10, color: Colors.white)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Expanded(
                child: Text('\$ (USD): $usdAccount', style: GoogleFonts.spaceGrotesk(fontSize: 12, color: Colors.white70, fontWeight: FontWeight.w600)),
              ),
              InkWell(
                onTap: () => _copyToClipboard(usdAccount, 'Cta $bankName Dólares'),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(6)),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.copy, size: 12, color: Colors.white70),
                      const SizedBox(width: 4),
                      Text('Copiar', style: GoogleFonts.inter(fontSize: 10, color: Colors.white)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSingleAccountTile({
    required String bankName,
    required String accountNumber,
    required String currencyBadge,
    required Color bankColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(color: bankColor, shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        bankName,
                        style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(color: AppColors.gold.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(4)),
                child: Text(currencyBadge, style: GoogleFonts.spaceGrotesk(fontSize: 9, color: AppColors.goldLight, fontWeight: FontWeight.w700)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: Text(accountNumber, style: GoogleFonts.spaceGrotesk(fontSize: 12, color: AppColors.goldLight, fontWeight: FontWeight.w600)),
              ),
              InkWell(
                onTap: () => _copyToClipboard(accountNumber, 'Cuenta $bankName'),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(6)),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.copy, size: 12, color: Colors.white70),
                      const SizedBox(width: 4),
                      Text('Copiar', style: GoogleFonts.inter(fontSize: 10, color: Colors.white)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPriceRow(String label, String value, {Color? textColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(
            label,
            style: GoogleFonts.inter(fontSize: 12.5, color: AppColors.textMuted),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          value,
          style: GoogleFonts.spaceGrotesk(
            fontSize: 13,
            fontWeight: FontWeight.w700,
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Wrap(
                alignment: WrapAlignment.spaceBetween,
                crossAxisAlignment: WrapCrossAlignment.center,
                spacing: 8,
                runSpacing: 8,
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text('🇳🇮', style: TextStyle(fontSize: 26)),
                      const SizedBox(width: 8),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('REPÚBLICA DE NICARAGUA', style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.gold)),
                          Text('BAQUEANO EXPEDITION PASS', style: GoogleFonts.montserrat(fontSize: 12.5, fontWeight: FontWeight.w900, color: Colors.white)),
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
                      style: GoogleFonts.spaceGrotesk(fontSize: 10.5, fontWeight: FontWeight.w800, color: AppColors.success),
                    ),
                  ),
                ],
              ),
              const Divider(color: AppColors.borderLight, height: 28),

              // Code and Details
              Wrap(
                alignment: WrapAlignment.spaceBetween,
                crossAxisAlignment: WrapCrossAlignment.center,
                spacing: 12,
                runSpacing: 8,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('CÓDIGO ÚNICO', style: GoogleFonts.spaceGrotesk(fontSize: 10, color: AppColors.textMuted)),
                      Text(_expeditionCode, style: GoogleFonts.spaceGrotesk(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.goldLight)),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('FECHA DE VIAJE', style: GoogleFonts.spaceGrotesk(fontSize: 10, color: AppColors.textMuted)),
                      Text(DateFormat('dd MMMM yyyy').format(_selectedDate), style: GoogleFonts.spaceGrotesk(fontSize: 12.5, fontWeight: FontWeight.w700, color: Colors.white)),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Datos del Explorador
              Text('DATOS DEL EXPLORADOR', style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.gold)),
              const SizedBox(height: 6),
              _buildDetailRow('Nombre Titular:', _nameController.text),
              _buildDetailRow('Cédula / Pasaporte:', _documentController.text),
              _buildDetailRow('Teléfono / WhatsApp:', _phoneController.text),
              _buildDetailRow('Correo:', _emailController.text),
              _buildDetailRow('Nacionalidad:', _nationalityController.text),
              _buildDetailRow('Exploradores:', '$_participants persona(s)'),

              const Divider(color: AppColors.borderLight, height: 20),

              // Datos del Local
              Text('EMPRENDIMIENTO RECEPTOR', style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.gold)),
              const SizedBox(height: 6),
              _buildDetailRow('Local Anfitrión:', _hostEnterprise.businessName),
              _buildDetailRow('Propietario:', _hostEnterprise.legalOwner),
              _buildDetailRow('RUC Oficial:', _hostEnterprise.rucNumber),
              _buildDetailRow('Licencia INTUR:', _hostEnterprise.inturLicense),
              _buildDetailRow('Dirección:', _hostEnterprise.address),
              _buildDetailRow('Teléfono Local:', _hostEnterprise.phone),
              _buildDetailRow('Beneficiario Cuentas:', _hostEnterprise.beneficiary),

              const Divider(color: AppColors.borderLight, height: 20),

              _buildDetailRow('Destino:', widget.destination.title),
              _buildDetailRow('Monto Total:', _formatCurrency(_totalUsd, _totalNio)),
              _buildDetailRow('Régimen Fiscal:', _isTourist ? 'Turista (0% IVA Exonerado Ley 306)' : 'Residente (15% IVA Incluido)'),

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
                        'Presenta este comprobante digital o transfiere a las cuentas de ${_hostEnterprise.legalOwner}. El 100% de tu dinero llega directo sin intermediarios.',
                        style: GoogleFonts.inter(fontSize: 12, color: AppColors.textLight),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Coordinar Llegada con el Propietario
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0284C7),
              padding: const EdgeInsets.symmetric(vertical: 13),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            icon: const Icon(Icons.chat_bubble_outline_rounded, color: Colors.white, size: 18),
            label: Text(
              'Coordinar Llegada por Chat con el Propietario',
              style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
            ),
            onPressed: () {
              Navigator.of(context).pop();
              context.go('/mensajes');
            },
          ),
        ),
        const SizedBox(height: 12),

        Row(
          children: [
            Expanded(
              child: BaqueanoButton(
                text: 'Ver Pase QR Oficial',
                icon: const Icon(Icons.qr_code_2_rounded, size: 18),
                variant: BaqueanoButtonVariant.secondary,
                onPressed: () {
                  BaqueanoVoucherDialog.show(
                    context,
                    destination: widget.destination,
                    travelersCount: _participants,
                    totalUsd: _totalUsd,
                    totalNio: _totalNio,
                    isTouristExempt: _isTourist,
                  );
                },
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: BaqueanoButton(
                text: 'Finalizar',
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
      padding: const EdgeInsets.symmetric(vertical: 3.5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 4,
            child: Text(
              label,
              style: GoogleFonts.inter(fontSize: 11.5, color: AppColors.textMuted, fontWeight: FontWeight.w500),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            flex: 5,
            child: Text(
              value,
              style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppColors.textLight),
              textAlign: TextAlign.end,
            ),
          ),
        ],
      ),
    );
  }
}
