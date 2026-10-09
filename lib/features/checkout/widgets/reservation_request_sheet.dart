// ============================================================================
// 📅 BAQUEANO — SOLICITUD DE RESERVA POR WHATSAPP / TELÉFONO
// ============================================================================
//
// 🎯 POR QUÉ (Propósito):
// - BAQUEANO no tiene pasarela de pago: la reserva se coordina directamente
//   con el negocio verificado por WhatsApp o llamada (directiva 2026-10-05).
// - Sustituye el flujo anterior, que mostraba anfitriones, teléfonos, RUC y
//   precios ficticios y "enviaba" solicitudes que solo quedaban en memoria.
//
// ⚙️ CÓMO (Arquitectura):
// 1. Negocio: el recibido o, si no hay, los negocios VERIFICADOS del mismo
//    departamento en Supabase (`catalogSnapshotProvider`). Sin negocios
//    verificados se informa con honestidad; nunca se inventa un anfitrión.
// 2. Formulario: fecha (desde hoy), personas (1–50), nombre, teléfono, nota.
// 3. Registro en `baqueano-reservas` (código BQ-XXXXXX del servidor) y luego
//    WhatsApp con mensaje prellenado o llamada al número real del negocio.
//    Sin sesión se puede contactar igual, pero la solicitud no se guarda.
// 4. No se muestran precios: se acuerdan con el negocio.
//
// 📦 QUÉ (Entregables):
// - `ReservationRequestSheet.show(context, business:, destinationName:, department:)`.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/baqueano_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../data/repositories/catalog_repository.dart';
import '../../../data/repositories/reservation_repository.dart';
import '../../../services/auth_service.dart';

class ReservationRequestSheet extends ConsumerStatefulWidget {
  final CatalogBusiness? business;
  final String? destinationName;
  final String? department;

  const ReservationRequestSheet({
    super.key,
    this.business,
    this.destinationName,
    this.department,
  });

  static Future<void> show(
    BuildContext context, {
    CatalogBusiness? business,
    String? destinationName,
    String? department,
  }) {
    HapticFeedback.lightImpact();
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF082B35),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (_) => ReservationRequestSheet(
        business: business,
        destinationName: destinationName,
        department: department,
      ),
    );
  }

  /// Compara departamentos sin tildes ni mayúsculas (`León` == `leon`).
  static String normalizeDepartment(String value) {
    const from = 'áéíóúüñ';
    const to = 'aeiouun';
    var text = value.trim().toLowerCase().replaceAll('-', ' ').replaceAll('_', ' ');
    for (var i = 0; i < from.length; i++) {
      text = text.replaceAll(from[i], to[i]);
    }
    return text;
  }

  @override
  ConsumerState<ReservationRequestSheet> createState() => _ReservationRequestSheetState();
}

class _ReservationRequestSheetState extends ConsumerState<ReservationRequestSheet> {
  CatalogBusiness? _business;
  DateTime _date = DateTime.now().add(const Duration(days: 7));
  int _people = 2;
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _notesController = TextEditingController();
  bool _submitting = false;
  ReservationRequest? _created;
  String _createdPhone = '';
  String _createdWhatsapp = '';

  @override
  void initState() {
    super.initState();
    _business = widget.business;
    final user = ref.read(authServiceProvider).currentUser;
    if (user != null) _nameController.text = user.displayName;
  }

  @override
  void didUpdateWidget(covariant ReservationRequestSheet oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.business?.id != widget.business?.id) _business = widget.business;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  String get _whatsappNumber => _createdWhatsapp.isNotEmpty
      ? _createdWhatsapp
      : (_business?.whatsapp ?? '');

  String get _phoneNumber => _createdPhone.isNotEmpty ? _createdPhone : (_business?.phone ?? '');

  Future<void> _pickDate() async {
    final today = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _date,
      firstDate: DateTime(today.year, today.month, today.day),
      lastDate: DateTime(today.year + 2, today.month, today.day),
    );
    if (picked != null && mounted) setState(() => _date = picked);
  }

  Future<void> _submit() async {
    final business = _business;
    if (business == null) return;
    if (_phoneController.text.trim().length < 7) {
      CustomToast.error(context, 'Escribe tu teléfono para que el negocio pueda contactarte.');
      return;
    }
    setState(() => _submitting = true);
    try {
      final result = await ref.read(reservationRepositoryProvider).create(
            businessId: business.id,
            travelDate: _date,
            people: _people,
            contactPhone: _phoneController.text,
            contactName: _nameController.text,
            destinationName: widget.destinationName,
            notes: _notesController.text,
          );
      if (!mounted) return;
      ref.invalidate(myReservationsProvider);
      setState(() {
        _created = result.reservation;
        _createdPhone = result.businessPhone;
        _createdWhatsapp = result.businessWhatsapp;
        _submitting = false;
      });
    } on ReservationException catch (error) {
      if (!mounted) return;
      setState(() => _submitting = false);
      CustomToast.error(
        context,
        error.needsSignIn
            ? 'Inicia sesión para guardar la solicitud en Mi Viaje. Igual puedes escribir al negocio por WhatsApp.'
            : error.message,
      );
    }
  }

  Future<void> _openWhatsApp() async {
    final business = _business;
    final digits = ReservationRepository.whatsappDigits(_whatsappNumber);
    if (business == null || digits.isEmpty) {
      CustomToast.error(context, 'Este negocio no tiene WhatsApp registrado.');
      return;
    }
    final message = ReservationRepository.buildWhatsAppMessage(
      businessName: business.name,
      travelDate: _date,
      people: _people,
      code: _created?.code,
      destinationName: widget.destinationName,
      contactName: _nameController.text.trim(),
      notes: _notesController.text.trim(),
    );
    final uri = Uri.parse('https://wa.me/$digits?text=${Uri.encodeComponent(message)}');
    try {
      final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!ok && mounted) CustomToast.error(context, 'No se pudo abrir WhatsApp.');
    } catch (_) {
      if (mounted) CustomToast.error(context, 'No se pudo abrir WhatsApp.');
    }
  }

  Future<void> _call() async {
    final phone = _phoneNumber.replaceAll(RegExp(r'[^0-9+]'), '');
    if (phone.isEmpty) {
      CustomToast.error(context, 'Este negocio no tiene teléfono registrado.');
      return;
    }
    try {
      await launchUrl(Uri.parse('tel:$phone'));
    } catch (_) {
      if (mounted) CustomToast.error(context, 'No se pudo abrir el marcador.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset),
      child: DraggableScrollableSheet(
        initialChildSize: 0.88,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (_, controller) => ListView(
          controller: controller,
          padding: const EdgeInsets.fromLTRB(22, 14, 22, 32),
          children: [
            Center(
              child: Container(
                width: 44,
                height: 4,
                decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 14),
            Text(
              'Solicitud de reserva',
              style: BaqueanoFonts.display(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white),
            ),
            const SizedBox(height: 6),
            Text(
              'BAQUEANO no cobra en línea. Registras tu solicitud y coordinas disponibilidad, precio y pago directamente con el negocio verificado por WhatsApp o llamada.',
              style: BaqueanoFonts.text(fontSize: 12.5, color: Colors.white70, height: 1.45),
            ),
            const SizedBox(height: 16),
            if (_created != null) _buildConfirmation() else if (_business == null) _buildBusinessPicker() else _buildForm(),
          ],
        ),
      ),
    );
  }

  Widget _buildBusinessPicker() {
    final catalogAsync = ref.watch(catalogSnapshotProvider);
    if (catalogAsync.isLoading && !catalogAsync.hasValue) {
      return _note('Buscando negocios verificados…');
    }
    final department = widget.department ?? '';
    final wanted = ReservationRequestSheet.normalizeDepartment(department);
    final all = (catalogAsync.valueOrNull?.businesses ?? const <CatalogBusiness>[])
        .where((b) => b.verified)
        .toList();
    final local = wanted.isEmpty
        ? all
        : all.where((b) => ReservationRequestSheet.normalizeDepartment(b.department) == wanted).toList();
    if (local.isEmpty) {
      return _note(
        department.isEmpty
            ? 'Aún no hay negocios verificados que reciban reservas. Cuando el equipo BAQUEANO los verifique aparecerán aquí.'
            : 'Aún no hay negocios verificados en $department que reciban reservas. Cuando el equipo BAQUEANO los verifique aparecerán aquí.',
      );
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _label('Elige un negocio verificado${department.isEmpty ? '' : ' en $department'}'),
        const SizedBox(height: 8),
        ...local.map(
          (business) => Card(
            color: AppColors.bgDark,
            margin: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              key: ValueKey('biz_${business.id}'),
              title: Text(business.name, style: BaqueanoFonts.text(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13.5)),
              subtitle: Text(
                [business.category, business.municipality, business.department].where((p) => p.isNotEmpty).join(' · '),
                style: BaqueanoFonts.text(color: AppColors.goldLight, fontSize: 11.5),
              ),
              trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.gold),
              onTap: () => setState(() => _business = business),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildForm() {
    final business = _business!;
    final dateLabel = ReservationRepository.formatDate(_date);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.bgDark,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.borderGold.withValues(alpha: 0.6)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(business.name, style: BaqueanoFonts.text(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 15)),
              const SizedBox(height: 2),
              Text(
                ['✅ Verificado', business.department, if (widget.destinationName != null) widget.destinationName!]
                    .where((p) => p.isNotEmpty)
                    .join(' · '),
                style: BaqueanoFonts.text(color: AppColors.goldLight, fontSize: 11.5),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        _label('Fecha del viaje'),
        OutlinedButton.icon(
          onPressed: _pickDate,
          icon: const Icon(Icons.calendar_month_rounded, color: AppColors.gold),
          label: Text(dateLabel, style: const TextStyle(color: Colors.white)),
        ),
        const SizedBox(height: 12),
        _label('Personas'),
        Row(
          children: [
            IconButton(
              tooltip: 'Menos personas',
              onPressed: _people > 1 ? () => setState(() => _people--) : null,
              icon: const Icon(Icons.remove_circle_outline, color: AppColors.gold),
            ),
            Text('$_people', style: BaqueanoFonts.text(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
            IconButton(
              tooltip: 'Más personas',
              onPressed: _people < 50 ? () => setState(() => _people++) : null,
              icon: const Icon(Icons.add_circle_outline, color: AppColors.gold),
            ),
          ],
        ),
        const SizedBox(height: 8),
        _field(_nameController, 'Tu nombre', Icons.person_outline, TextInputType.name),
        const SizedBox(height: 10),
        _field(_phoneController, 'Tu teléfono / WhatsApp', Icons.phone_outlined, TextInputType.phone),
        const SizedBox(height: 10),
        _field(_notesController, 'Nota para el negocio (opcional)', Icons.notes_rounded, TextInputType.multiline, maxLines: 3),
        const SizedBox(height: 18),
        FilledButton.icon(
          style: FilledButton.styleFrom(
            backgroundColor: AppColors.terracotta,
            padding: const EdgeInsets.symmetric(vertical: 14),
          ),
          onPressed: _submitting ? null : _submit,
          icon: _submitting
              ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
              : const Icon(Icons.bookmark_add_rounded, color: Colors.white),
          label: const Text('Registrar solicitud', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
        ),
        const SizedBox(height: 10),
        _contactButtons(),
        if (widget.business == null) ...[
          const SizedBox(height: 6),
          TextButton(
            onPressed: () => setState(() => _business = null),
            child: const Text('Elegir otro negocio', style: TextStyle(color: AppColors.goldLight)),
          ),
        ],
      ],
    );
  }

  Widget _buildConfirmation() {
    final created = _created!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.bgDark,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.gold),
          ),
          child: Column(
            children: [
              Text('Código de solicitud', style: BaqueanoFonts.text(color: Colors.white70, fontSize: 12)),
              const SizedBox(height: 4),
              SelectableText(
                created.code,
                style: BaqueanoFonts.text(color: AppColors.gold, fontSize: 26, fontWeight: FontWeight.w800, letterSpacing: 1.5),
              ),
              const SizedBox(height: 8),
              Text(
                'Guardada en Mi Viaje como "${created.statusLabel}". El negocio aún no la confirmó: escríbele o llámale con este código.',
                textAlign: TextAlign.center,
                style: BaqueanoFonts.text(color: Colors.white70, fontSize: 12, height: 1.45),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        _contactButtons(),
        const SizedBox(height: 8),
        TextButton.icon(
          onPressed: () {
            final router = GoRouter.of(context);
            Navigator.of(context).pop();
            router.go('/historial');
          },
          icon: const Icon(Icons.luggage_rounded, color: AppColors.goldLight),
          label: const Text('Ver Mi Viaje', style: TextStyle(color: AppColors.goldLight)),
        ),
      ],
    );
  }

  Widget _contactButtons() {
    final hasWhatsapp = ReservationRepository.whatsappDigits(_whatsappNumber).isNotEmpty;
    final hasPhone = _phoneNumber.trim().isNotEmpty;
    if (!hasWhatsapp && !hasPhone) {
      return _note('Este negocio aún no tiene teléfono ni WhatsApp registrados.');
    }
    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: [
        if (hasWhatsapp)
          FilledButton.icon(
            style: FilledButton.styleFrom(backgroundColor: const Color(0xFF25D366)),
            onPressed: _openWhatsApp,
            icon: const Icon(Icons.chat_rounded, color: Colors.white),
            label: const Text('Coordinar por WhatsApp', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
          ),
        if (hasPhone)
          OutlinedButton.icon(
            onPressed: _call,
            icon: const Icon(Icons.phone_rounded, color: AppColors.gold),
            label: const Text('Llamar', style: TextStyle(color: Colors.white)),
          ),
      ],
    );
  }

  Widget _label(String text) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Text(text, style: BaqueanoFonts.text(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.goldLight)),
      );

  Widget _note(String text) => Text(
        text,
        style: BaqueanoFonts.text(fontSize: 12.5, color: Colors.white70, height: 1.45),
      );

  Widget _field(
    TextEditingController controller,
    String label,
    IconData icon,
    TextInputType type, {
    int maxLines = 1,
  }) {
    return TextField(
      controller: controller,
      keyboardType: type,
      maxLines: maxLines,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white60),
        prefixIcon: Icon(icon, color: AppColors.gold),
        filled: true,
        fillColor: AppColors.bgDark,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
      ),
    );
  }
}
