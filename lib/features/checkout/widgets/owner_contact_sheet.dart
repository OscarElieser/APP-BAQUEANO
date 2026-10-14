// ============================================================================
// 📞 BAQUEANO — CONTACTO DIRECTO CON EL PROPIETARIO (owner_contact_sheet.dart)
// ============================================================================
//
// 🎯 POR QUÉ (Propósito):
// - Regla del propietario (2026-10-14): BAQUEANO no ofrece reservas. El viajero
//   habla directamente con el local o el propietario por WhatsApp o llamada, sin
//   intermediarios ni comisiones (comercio justo).
// - Sustituye en pantalla a `ReservationRequestSheet`, que se conserva en el código
//   (regla de no borrar nada) detrás de `kReservationRequestsEnabled`.
//
// ⚙️ CÓMO (Arquitectura):
// 1. Negocio: el recibido o, si no hay, los negocios VERIFICADOS del departamento
//    con algún canal publicado (`catalogSnapshotProvider`, Supabase: la misma fuente
//    que la web). Sin negocios verificados se dice con honestidad; nunca se inventa.
// 2. Canales reales del negocio: WhatsApp (mensaje prellenado en el idioma activo),
//    llamada y «Cómo llegar» si hay coordenadas exactas.
// 3. Cada contacto se registra con `ContactActionService` → Supabase
//    `commercial_actions` (plataforma android): el Ops Center lo ve en «Contactos
//    directos con propietarios».
// 4. Responsive: hoja inferior en teléfonos; diálogo centrado (máx. 560 px) desde
//    700 px de ancho (tablets, plegables, horizontal).
// 5. Textos de los catálogos compartidos con la web (`contact.owner.*`, 8 idiomas).
//
// 📦 QUÉ (Entregables):
// - `OwnerContactSheet.show(context, business:, destinationName:, department:)`.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/i18n/app_i18n.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/baqueano_fonts.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../data/repositories/catalog_repository.dart';
import '../../../services/contact_action_service.dart';
import 'reservation_request_sheet.dart';

class OwnerContactSheet extends ConsumerStatefulWidget {
  final CatalogBusiness? business;
  final String? destinationName;
  final String? department;

  const OwnerContactSheet({
    super.key,
    this.business,
    this.destinationName,
    this.department,
  });

  static const Color _sheetColor = Color(0xFF082B35);

  static Future<void> show(
    BuildContext context, {
    CatalogBusiness? business,
    String? destinationName,
    String? department,
  }) {
    HapticFeedback.lightImpact();
    final sheet = OwnerContactSheet(
      business: business,
      destinationName: destinationName,
      department: department,
    );
    if (MediaQuery.sizeOf(context).width >= 700) {
      return showDialog<void>(
        context: context,
        builder: (_) => Dialog(
          backgroundColor: _sheetColor,
          insetPadding: const EdgeInsets.all(24),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
          child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 560), child: sheet),
        ),
      );
    }
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: _sheetColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (_) => sheet,
    );
  }

  /// Dígitos para wa.me (8 dígitos nicaragüenses → prefijo 505).
  static String whatsappDigits(String? phone) {
    final digits = (phone ?? '').replaceAll(RegExp(r'[^0-9]'), '');
    return digits.length == 8 ? '505$digits' : digits;
  }

  /// Número marcable (conserva el + inicial).
  static String dialable(String? phone) => (phone ?? '').replaceAll(RegExp(r'[^0-9+]'), '');

  /// Un negocio se puede contactar si publicó WhatsApp o teléfono con al menos 8 dígitos.
  static bool hasChannel(CatalogBusiness business) =>
      whatsappDigits(business.whatsapp).length >= 8 || dialable(business.phone).replaceAll('+', '').length >= 8;

  @override
  ConsumerState<OwnerContactSheet> createState() => _OwnerContactSheetState();
}

class _OwnerContactSheetState extends ConsumerState<OwnerContactSheet> {
  CatalogBusiness? _business;

  @override
  void initState() {
    super.initState();
    _business = widget.business;
  }

  @override
  void didUpdateWidget(covariant OwnerContactSheet oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.business?.id != widget.business?.id) _business = widget.business;
  }

  AppStrings get _s => ref.strings;

  Future<void> _open(Uri uri, ContactChannel? channel, CatalogBusiness business) async {
    HapticFeedback.selectionClick();
    if (channel != null) ContactActionService.instance.record(channel, business.id);
    try {
      final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!ok && mounted) CustomToast.error(context, _s.t('contact.owner.openError', 'No se pudo abrir la aplicación. Probá de nuevo.'));
    } catch (_) {
      if (mounted) CustomToast.error(context, _s.t('contact.owner.openError', 'No se pudo abrir la aplicación. Probá de nuevo.'));
    }
  }

  void _whatsapp(CatalogBusiness business) {
    final topic = (widget.destinationName ?? '').trim().isNotEmpty
        ? widget.destinationName!.trim()
        : _s.t('contact.owner.topicGeneric', 'sus servicios');
    final message = _s.t(
      'contact.owner.waMessage',
      'Hola {name}, los encontré en BAQUEANO. Quisiera información sobre {topic}.',
      {'name': business.name, 'topic': topic},
    );
    final digits = OwnerContactSheet.whatsappDigits(business.whatsapp);
    _open(Uri.parse('https://wa.me/$digits?text=${Uri.encodeComponent(message)}'), ContactChannel.whatsapp, business);
  }

  void _call(CatalogBusiness business) =>
      _open(Uri.parse('tel:${OwnerContactSheet.dialable(business.phone)}'), ContactChannel.call, business);

  void _directions(CatalogBusiness business) => _open(
        Uri.parse('https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}'),
        null,
        business,
      );

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.viewInsetsOf(context).bottom;
    return SafeArea(
      top: false,
      child: SingleChildScrollView(
        padding: EdgeInsets.fromLTRB(20, 14, 20, 24 + bottom),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 44,
                height: 5,
                decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(99)),
              ),
            ),
            const SizedBox(height: 18),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [AppColors.terracotta, AppColors.terracottaLight]),
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: [BoxShadow(color: AppColors.terracotta.withValues(alpha: 0.35), blurRadius: 16, offset: const Offset(0, 6))],
                  ),
                  child: const Icon(Icons.forum_rounded, color: Colors.white, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    _s.t('contact.owner.title', 'Contacto directo con el propietario'),
                    style: BaqueanoFonts.display(fontSize: 20, color: Colors.white, fontWeight: FontWeight.w800),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              _s.t('contact.owner.note', 'BAQUEANO no cobra comisiones ni gestiona reservas: acordás fecha, precio y detalles directamente con el negocio.'),
              style: BaqueanoFonts.text(fontSize: 12.5, color: Colors.white70, height: 1.45),
            ),
            const SizedBox(height: 18),
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 260),
              child: _business == null
                  ? KeyedSubtree(key: const ValueKey('picker'), child: _buildPicker())
                  : KeyedSubtree(key: ValueKey('biz_${_business!.id}'), child: _buildBusiness(_business!)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPicker() {
    final catalogAsync = ref.watch(catalogSnapshotProvider);
    if (catalogAsync.isLoading && !catalogAsync.hasValue) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 24),
        child: Center(child: CircularProgressIndicator(color: AppColors.gold)),
      );
    }
    final department = (widget.department ?? '').trim();
    final wanted = ReservationRequestSheet.normalizeDepartment(department);
    final all = (catalogAsync.valueOrNull?.businesses ?? const <CatalogBusiness>[])
        .where((b) => b.verified && OwnerContactSheet.hasChannel(b))
        .toList();
    final local = wanted.isEmpty
        ? all
        : all.where((b) => ReservationRequestSheet.normalizeDepartment(b.department) == wanted).toList();
    if (local.isEmpty) {
      return _note(department.isEmpty
          ? _s.t('contact.owner.noneAny', 'Aún no hay negocios verificados con contacto publicado.')
          : _s.t('contact.owner.noneIn', 'Aún no hay negocios verificados en {department} con contacto publicado. Cuando el equipo BAQUEANO los verifique aparecerán aquí.', {'department': department}));
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (department.isNotEmpty) ...[
          Text(
            _s.t('contact.owner.nearTitle', 'Negocios verificados en {department}', {'department': department}),
            style: BaqueanoFonts.text(color: AppColors.goldLight, fontWeight: FontWeight.w800, fontSize: 13),
          ),
          const SizedBox(height: 10),
        ],
        for (final business in local)
          Padding(
            key: ValueKey('owner_${business.id}'),
            padding: const EdgeInsets.only(bottom: 10),
            child: Material(
              color: Colors.white.withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(18),
              child: InkWell(
                borderRadius: BorderRadius.circular(18),
                onTap: () => setState(() => _business = business),
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(14, 12, 8, 12),
                  child: Row(
                    children: [
                      Expanded(child: _businessHeader(business, compact: true)),
                      if (OwnerContactSheet.whatsappDigits(business.whatsapp).length >= 8)
                        IconButton(
                          tooltip: 'WhatsApp',
                          onPressed: () => _whatsapp(business),
                          icon: const Icon(Icons.chat_rounded, color: Color(0xFF25D366)),
                        ),
                      if (OwnerContactSheet.dialable(business.phone).replaceAll('+', '').length >= 8)
                        IconButton(
                          tooltip: _s.t('contact.owner.call', 'Llamar'),
                          onPressed: () => _call(business),
                          icon: const Icon(Icons.phone_rounded, color: Color(0xFF38BDF8)),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _businessHeader(CatalogBusiness business, {bool compact = false}) {
    final place = [business.municipality, business.department].where((p) => p.trim().isNotEmpty).join(' · ');
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          business.name,
          maxLines: compact ? 2 : 3,
          overflow: TextOverflow.ellipsis,
          style: BaqueanoFonts.text(color: Colors.white, fontWeight: FontWeight.w800, fontSize: compact ? 14 : 17),
        ),
        const SizedBox(height: 4),
        Wrap(
          spacing: 8,
          runSpacing: 4,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            if (business.verified)
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.verified_rounded, color: AppColors.craterTealLight, size: 15),
                  const SizedBox(width: 4),
                  // Flexible: en pantallas angostas o con letra grande el sello baja de línea.
                  Flexible(
                    child: Text(_s.t('contact.owner.verified', 'Verificado por BAQUEANO'),
                        style: BaqueanoFonts.text(color: AppColors.craterTealLight, fontSize: 11.5, fontWeight: FontWeight.w700)),
                  ),
                ],
              ),
            if (place.isNotEmpty) Text(place, style: BaqueanoFonts.text(color: AppColors.goldLight, fontSize: 11.5)),
          ],
        ),
      ],
    );
  }

  Widget _buildBusiness(CatalogBusiness business) {
    final hasWa = OwnerContactSheet.whatsappDigits(business.whatsapp).length >= 8;
    final hasPhone = OwnerContactSheet.dialable(business.phone).replaceAll('+', '').length >= 8;
    final hasCoords = business.latitude != null && business.longitude != null;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [AppColors.primary.withValues(alpha: 0.55), AppColors.bgDark.withValues(alpha: 0.85)],
            ),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.goldLight.withValues(alpha: 0.22)),
          ),
          child: _businessHeader(business),
        ),
        const SizedBox(height: 16),
        if (!hasWa && !hasPhone)
          _note(_s.t('contact.owner.noChannel', 'Este negocio todavía no publicó un canal de contacto.'))
        else
          LayoutBuilder(
            builder: (context, constraints) {
              final buttons = <Widget>[
                if (hasWa)
                  _actionButton(
                    key: const ValueKey('owner_whatsapp'),
                    label: 'WhatsApp',
                    icon: Icons.chat_rounded,
                    color: const Color(0xFF128C4B),
                    onPressed: () => _whatsapp(business),
                  ),
                if (hasPhone)
                  _actionButton(
                    key: const ValueKey('owner_call'),
                    label: _s.t('contact.owner.call', 'Llamar'),
                    icon: Icons.phone_rounded,
                    color: AppColors.primary,
                    onPressed: () => _call(business),
                  ),
              ];
              // Dos columnas cuando hay espacio; una debajo de otra en pantallas angostas.
              if (constraints.maxWidth >= 380 && buttons.length == 2) {
                return Row(children: [Expanded(child: buttons[0]), const SizedBox(width: 10), Expanded(child: buttons[1])]);
              }
              return Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [for (final b in buttons) Padding(padding: const EdgeInsets.only(bottom: 10), child: b)],
              );
            },
          ),
        if (hasCoords) ...[
          const SizedBox(height: 10),
          OutlinedButton.icon(
            onPressed: () => _directions(business),
            icon: const Icon(Icons.directions_rounded, color: AppColors.goldLight),
            label: Text(_s.t('app.map.directions', 'Cómo llegar'), style: const TextStyle(color: AppColors.goldLight)),
            style: OutlinedButton.styleFrom(
              minimumSize: const Size.fromHeight(48),
              side: BorderSide(color: AppColors.goldLight.withValues(alpha: 0.45)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
          ),
        ],
        if (widget.business == null) ...[
          const SizedBox(height: 6),
          TextButton.icon(
            onPressed: () => setState(() => _business = null),
            icon: const Icon(Icons.arrow_back_rounded, color: Colors.white70, size: 18),
            label: Text(_s.t('actions.back', 'Volver'), style: const TextStyle(color: Colors.white70)),
          ),
        ],
      ],
    );
  }

  Widget _actionButton({
    required Key key,
    required String label,
    required IconData icon,
    required Color color,
    required VoidCallback onPressed,
  }) {
    return ElevatedButton.icon(
      key: key,
      onPressed: onPressed,
      icon: Icon(icon, color: Colors.white, size: 20),
      label: Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        foregroundColor: Colors.white,
        minimumSize: const Size.fromHeight(52),
        elevation: 6,
        shadowColor: color.withValues(alpha: 0.45),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
    );
  }

  Widget _note(String text) => Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.06),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white12),
        ),
        child: Text(text, style: BaqueanoFonts.text(color: Colors.white70, fontSize: 13, height: 1.45)),
      );
}
