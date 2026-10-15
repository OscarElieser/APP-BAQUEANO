// ============================================================================
// 🧭 BAQUEANO — CRÓNICAS DE LA COMUNIDAD (Android)
// ============================================================================
// 🎯 POR QUÉ (2026-10-15): el dueño pidió que los usuarios puedan crear y
//   publicar crónicas «a como las presentamos en el sitio». Paridad con
//   cronicas.html: la misma lista y el mismo envío a moderación.
// ⚙️ CÓMO: CommunityRepository → Edge Function baqueano-community. Una crónica
//   es un relato con la etiqueta «cronica»; el equipo la aprueba en el Ops
//   Center (web) y aparece aquí y en la Web. Nunca se publica directo.
// 📦 QUÉ: ChroniclesScreen (ruta /cronicas): lista, estado vacío honesto y
//   formulario «Escribí tu crónica». Textos en los 8 idiomas (assets/i18n).
// ============================================================================
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/i18n/app_i18n.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/baqueano_fonts.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../data/repositories/community_repository.dart';

class ChroniclesScreen extends ConsumerStatefulWidget {
  const ChroniclesScreen({super.key});

  @override
  ConsumerState<ChroniclesScreen> createState() => _ChroniclesScreenState();
}

class _ChroniclesScreenState extends ConsumerState<ChroniclesScreen> {
  List<CommunityChronicle> _items = const [];
  bool _loading = true;
  bool _failed = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _failed = false;
    });
    try {
      final items = await ref.read(communityRepositoryProvider).listChronicles();
      if (!mounted) return;
      setState(() {
        _items = items;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _failed = true;
      });
    }
  }

  Future<void> _openComposer() async {
    final sent = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.primaryDark,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => const _ChronicleComposer(),
    );
    if (sent == true && mounted) {
      final s = ref.read(appStringsProvider).valueOrNull ?? AppStrings.empty;
      CustomToast.success(
        context,
        s.t('pages.cronicas.community.sent', 'Tu crónica fue enviada a revisión. Aparecerá aquí y en la web cuando el equipo BAQUEANO la apruebe.'),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = ref.strings;
    return ResponsiveScaffold(
      currentIndex: 3,
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
          children: [
            Text(
              s.t('pages.cronicas.community.kicker', 'Escritas por la comunidad').toUpperCase(),
              style: BaqueanoFonts.text(fontSize: 11.5, fontWeight: FontWeight.w800, letterSpacing: 1.4, color: AppColors.terracotta),
            ),
            const SizedBox(height: 6),
            Text(
              s.t('pages.cronicas.community.title', 'Crónicas de viajeros y anfitriones'),
              style: BaqueanoFonts.display(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white),
            ),
            const SizedBox(height: 8),
            Text(
              s.t('pages.cronicas.community.lead', '¿Viviste una historia en algún rincón de Nicaragua? Escribila con tus fotos. El equipo BAQUEANO la revisa y la publica aquí y en la app.'),
              style: BaqueanoFonts.text(fontSize: 13.5, height: 1.5, color: AppColors.textMuted),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                key: const Key('chronicles-write'),
                onPressed: _openComposer,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.terracotta,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                ),
                icon: const Icon(Icons.edit_note_rounded),
                label: Text(s.t('pages.cronicas.community.write', 'Escribí tu crónica'), style: const TextStyle(fontWeight: FontWeight.w800)),
              ),
            ),
            const SizedBox(height: 20),
            if (_loading)
              const Padding(
                padding: EdgeInsets.all(24),
                child: Center(child: CircularProgressIndicator(color: AppColors.gold)),
              )
            else if (_failed)
              _StatusCard(
                text: s.t('pages.cronicas.community.error', 'No pudimos cargar las crónicas. Revisá tu conexión.'),
                action: TextButton.icon(
                  onPressed: _load,
                  icon: const Icon(Icons.refresh_rounded, color: AppColors.gold),
                  label: Text(s.t('actions.retry', 'Intentar de nuevo'), style: const TextStyle(color: AppColors.gold)),
                ),
              )
            else if (_items.isEmpty)
              _StatusCard(text: s.t('pages.cronicas.community.empty', 'Todavía no hay crónicas de la comunidad. ¡La tuya puede ser la primera!'))
            else
              for (final item in _items) _ChronicleCard(item: item),
          ],
        ),
      ),
    );
  }
}

class _StatusCard extends StatelessWidget {
  const _StatusCard({required this.text, this.action});
  final String text;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.borderLight),
        color: Colors.white.withValues(alpha: 0.04),
      ),
      child: Column(
        children: [
          const Icon(Icons.menu_book_rounded, color: AppColors.terracotta),
          const SizedBox(height: 8),
          Text(text, textAlign: TextAlign.center, style: BaqueanoFonts.text(fontSize: 13.5, height: 1.5, color: Colors.white70)),
          if (action != null) ...[const SizedBox(height: 8), action!],
        ],
      ),
    );
  }
}

class _ChronicleCard extends ConsumerWidget {
  const _ChronicleCard({required this.item});
  final CommunityChronicle item;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final s = ref.strings;
    final kicker = item.place.isEmpty
        ? s.t('pages.cronicas.community.kickerPlain', 'Crónica de la comunidad')
        : s.t('pages.cronicas.community.kickerPlace', 'Crónica · {place}', {'place': item.place});
    final byline = s.t('pages.cronicas.community.byline', 'Por {name} · {min} min de lectura', {
      'name': item.author.isEmpty ? s.t('pages.cronicas.community.anon', 'Viajero BAQUEANO') : item.author,
      'min': item.readMinutes,
    });
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      color: AppColors.primaryDark,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18), side: const BorderSide(color: AppColors.borderLight)),
      child: InkWell(
        onTap: () => showModalBottomSheet<void>(
          context: context,
          isScrollControlled: true,
          backgroundColor: AppColors.primaryDark,
          builder: (_) => DraggableScrollableSheet(
            expand: false,
            initialChildSize: 0.85,
            builder: (context, controller) => ListView(
              controller: controller,
              padding: const EdgeInsets.all(20),
              children: [
                Text(kicker.toUpperCase(), style: BaqueanoFonts.text(fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1.2, color: AppColors.terracotta)),
                const SizedBox(height: 8),
                Text(item.title, style: BaqueanoFonts.display(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
                const SizedBox(height: 6),
                Text(byline, style: BaqueanoFonts.text(fontSize: 12, color: AppColors.textMuted)),
                if (item.photoUrl != null) ...[
                  const SizedBox(height: 14),
                  ClipRRect(borderRadius: BorderRadius.circular(14), child: Image.network(item.photoUrl!, fit: BoxFit.cover)),
                ],
                const SizedBox(height: 14),
                Text(item.body, style: BaqueanoFonts.text(fontSize: 15, height: 1.6, color: Colors.white)),
              ],
            ),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (item.photoUrl != null)
              AspectRatio(
                aspectRatio: 16 / 9,
                child: Image.network(item.photoUrl!, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const SizedBox.shrink()),
              ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(kicker.toUpperCase(), style: BaqueanoFonts.text(fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1.2, color: AppColors.terracotta)),
                  const SizedBox(height: 6),
                  Text(item.title, style: BaqueanoFonts.display(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white)),
                  const SizedBox(height: 6),
                  Text(item.body, maxLines: 3, overflow: TextOverflow.ellipsis, style: BaqueanoFonts.text(fontSize: 13.5, height: 1.5, color: Colors.white70)),
                  const SizedBox(height: 8),
                  Text(byline, style: BaqueanoFonts.text(fontSize: 12, color: AppColors.textMuted)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ChronicleComposer extends ConsumerStatefulWidget {
  const _ChronicleComposer();

  @override
  ConsumerState<_ChronicleComposer> createState() => _ChronicleComposerState();
}

class _ChronicleComposerState extends ConsumerState<_ChronicleComposer> {
  final _title = TextEditingController();
  final _place = TextEditingController();
  final _body = TextEditingController();
  bool _busy = false;

  @override
  void dispose() {
    _title.dispose();
    _place.dispose();
    _body.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final s = ref.read(appStringsProvider).valueOrNull ?? AppStrings.empty;
    if (CommunityRepository.validate(title: _title.text, body: _body.text) != null) {
      CustomToast.error(context, s.t('pages.cronicas.community.invalid', 'El título necesita al menos 5 caracteres y la crónica al menos 30.'));
      return;
    }
    setState(() => _busy = true);
    final result = await ref.read(communityRepositoryProvider).submit(
          title: _title.text,
          body: _body.text,
          destinationName: _place.text,
          experienceType: 'cultura',
          tags: const [CommunityRepository.chronicleTag],
        );
    if (!mounted) return;
    setState(() => _busy = false);
    switch (result.status) {
      case CommunitySubmitStatus.pendingReview:
        Navigator.of(context).pop(true);
      case CommunitySubmitStatus.needsSignIn:
        CustomToast.error(context, s.t('pages.cronicas.community.signIn', 'Iniciá sesión para publicar tu crónica.'));
        Navigator.of(context).pop(false);
        context.push('/login');
      default:
        CustomToast.error(context, s.t('pages.cronicas.community.failed', 'No pudimos enviar tu crónica. Intentá de nuevo en un momento.'));
    }
  }

  InputDecoration _decoration(String hint) => InputDecoration(
        hintText: hint,
        hintStyle: BaqueanoFonts.text(color: AppColors.textMuted, fontSize: 12.5),
        filled: true,
        fillColor: Colors.white.withValues(alpha: 0.05),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.gold)),
      );

  @override
  Widget build(BuildContext context) {
    final s = ref.strings;
    final label = BaqueanoFonts.text(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white70);
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 20, 20, 20 + MediaQuery.of(context).viewInsets.bottom),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(s.t('testimonials.chronicleTitle', 'Escribí tu crónica'), style: BaqueanoFonts.display(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white)),
            const SizedBox(height: 16),
            Text(s.t('pages.cronicas.community.fieldTitle', 'Título de tu crónica *'), style: label),
            const SizedBox(height: 6),
            TextField(controller: _title, maxLength: 120, style: const TextStyle(color: Colors.white), decoration: _decoration(s.t('testimonials.titlePlaceholder', 'Ej.: Atardecer inolvidable en Las Peñitas'))),
            const SizedBox(height: 6),
            Text(s.t('testimonials.fieldDestination', 'Destino o lugar visitado'), style: label),
            const SizedBox(height: 6),
            TextField(controller: _place, maxLength: 120, style: const TextStyle(color: Colors.white), decoration: _decoration('Ometepe, Somoto, Bluefields…')),
            const SizedBox(height: 6),
            Text(s.t('pages.cronicas.community.fieldBody', 'Tu crónica *'), style: label),
            const SizedBox(height: 6),
            TextField(controller: _body, maxLines: 8, maxLength: 4000, style: const TextStyle(color: Colors.white), decoration: _decoration(s.t('testimonials.bodyPlaceholder', 'Cómo llegaste, qué hiciste, qué te sorprendió… (mínimo 30 caracteres)'))),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                key: const Key('chronicles-submit'),
                onPressed: _busy ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.terracotta,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                icon: _busy
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.send_rounded),
                label: Text(s.t('testimonials.submitReview', 'Enviar a revisión'), style: const TextStyle(fontWeight: FontWeight.w800)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
