// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — COMUNIDAD & BITÁCORA DEL EXPLORADOR
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Fomentar una cultura de viaje ético, respeto ambiental y apoyo a la economía
//   campesina mediante el Decálogo del Explorador Baqueano.
// - Conectar la identidad del viajero con su Cuenta de Google real y legítima,
//   permitir la subida de fotos auténticas de expedición (desde cámara o galería),
//   y detectar automáticamente la bandera patria al escribir manualmente el país.
// - Permitir explorar la bitácora cronológicamente por fecha, activando un
//   Modo Galería Dinámica en Movimiento fluido y cinemático exclusivamente cuando
//   el usuario selecciona una fecha determinada para sumergirse en esos relatos.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `CommunityScreen`: ConsumerStatefulWidget reactivo acoplado a `authServiceProvider`
//   y `FirebaseAuth` para vincular de inmediato la cuenta de Google con un toque.
// - Asistente `CountryFlagHelper` para análisis semántico en tiempo real de países y banderas.
// - Integración con `ImagePicker` para captura con cámara o galería en Android.
// - `PageView.builder` con `viewportFraction: 0.92` y temporizador de animación continua
//   a 60 FPS con control táctil de pausa/reanudación (`_startGalleryAutoMotion`).
// - Filtro cronológico interactivo con selector de fechas preestablecidas y `showDatePicker`.
// - Encabezados y tarjetas protegidas con `Expanded` y `Flexible` para erradicar
//   desbordamientos en cualquier factor de forma (móvil, tablet, pantalla ancha).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `CommunityScreen`: Pantalla comunitaria, decálogo ético, bitácora por fecha,
//   Modo Galería Dinámica en Movimiento y formulario modal interactivo conectado a Google.
// ============================================================================

import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/models/cultural_models.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/baqueano_button.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';
import '../../../services/auth_service.dart';
import '../utils/country_flag_helper.dart';

class CommunityScreen extends ConsumerStatefulWidget {
  const CommunityScreen({super.key});

  @override
  ConsumerState<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends ConsumerState<CommunityScreen> {
  late List<ExplorerReview> _reviews;

  // Estado del filtrado cronológico y Modo Galería Dinámica
  DateTime? _selectedDate;
  bool _filterEcoOnly = false;
  bool _isAutoMotionPlaying = true;
  late PageController _galleryPageController;
  int _currentGalleryIndex = 0;
  Timer? _galleryTimer;

  @override
  void initState() {
    super.initState();
    // Intención: Inicializar la lista mutable de reseñas combinando el catálogo base.
    // Mecanismo: Copia profunda en memoria de CatalogData.explorerReviews.
    // Importancia: Permite que los nuevos relatos publicados se inserten al instante en la cima.
    _reviews = List.from(CatalogData.explorerReviews);
    _galleryPageController = PageController(viewportFraction: 0.92);
  }

  @override
  void dispose() {
    _galleryTimer?.cancel();
    _galleryPageController.dispose();
    super.dispose();
  }

  // --------------------------------------------------------------------------
  // LÓGICA DE MOVIMIENTO DINÁMICO AUTOMÁTICO EN MODO GALERÍA
  // --------------------------------------------------------------------------
  void _startGalleryAutoMotion(int itemCount) {
    _galleryTimer?.cancel();
    if (!_isAutoMotionPlaying || itemCount <= 1) return;

    _galleryTimer = Timer.periodic(const Duration(milliseconds: 4500), (timer) {
      if (!mounted || !_galleryPageController.hasClients) return;
      final nextIndex = (_currentGalleryIndex + 1) % itemCount;
      _galleryPageController.animateToPage(
        nextIndex,
        duration: const Duration(milliseconds: 750),
        curve: Curves.easeInOutCubic,
      );
    });
  }

  void _stopGalleryAutoMotion() {
    _galleryTimer?.cancel();
    _galleryTimer = null;
  }

  void _toggleAutoMotion(int itemCount) {
    HapticFeedback.selectionClick();
    setState(() {
      _isAutoMotionPlaying = !_isAutoMotionPlaying;
      if (_isAutoMotionPlaying) {
        _startGalleryAutoMotion(itemCount);
      } else {
        _stopGalleryAutoMotion();
      }
    });
  }

  void _onSelectDate(DateTime? date) {
    HapticFeedback.lightImpact();
    setState(() {
      _selectedDate = date;
      _currentGalleryIndex = 0;
    });

    if (date != null) {
      final filtered = _getFilteredReviews(date);
      _startGalleryAutoMotion(filtered.length);
      if (_galleryPageController.hasClients) {
        _galleryPageController.jumpToPage(0);
      }
    } else {
      _stopGalleryAutoMotion();
    }
  }

  List<ExplorerReview> _getFilteredReviews(DateTime? date) {
    var list = _reviews;
    if (_filterEcoOnly) {
      list = list.where((rev) => rev.isEcoGuardian || rev.ecoAction != null).toList();
    }
    if (date == null) return list;
    return list.where((rev) {
      final d = parseReviewDate(rev);
      return d.year == date.year && d.month == date.month && d.day == date.day;
    }).toList();
  }

  List<DateTime> get _availableDates {
    final Map<String, DateTime> uniqueDates = {};
    for (final rev in _reviews) {
      final d = parseReviewDate(rev);
      final key = '${d.year}-${d.month}-${d.day}';
      uniqueDates[key] = DateTime(d.year, d.month, d.day);
    }
    final list = uniqueDates.values.toList();
    list.sort((a, b) => b.compareTo(a));
    return list;
  }

  String _formatDateHeader(DateTime d) {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return '${d.day} de ${months[d.month - 1]}, ${d.year}';
  }

  String _formatDateShort(DateTime d) {
    final now = DateTime(2026, 9, 3);
    final yesterday = DateTime(2026, 9, 2);

    if (d.year == now.year && d.month == now.month && d.day == now.day) {
      return 'Hoy · 3 Sep';
    }
    if (d.year == yesterday.year && d.month == yesterday.month && d.day == yesterday.day) {
      return 'Ayer · 2 Sep';
    }

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return '${d.day} ${months[d.month - 1]}';
  }

  // --------------------------------------------------------------------------
  // MODAL INTERACTIVO: PUBLICAR RELATO DE EXPEDICIÓN
  // --------------------------------------------------------------------------
  void _openPublishStoryModal(BuildContext context) {
    HapticFeedback.lightImpact();

    final authService = ref.read(authServiceProvider);
    final googleUser = authService.currentUser;

    final nameController = TextEditingController(
      text: googleUser != null ? googleUser.displayName : '',
    );
    final countryController = TextEditingController(text: 'Nicaragua');
    final storyController = TextEditingController();

    String selectedDestination = 'Volcán Cerro Negro';
    double selectedRating = 5.0;
    String? selectedEcoAction;
    CountryDetectionResult detectionResult = CountryFlagHelper.detectFlag(countryController.text);
    final List<String> selectedPhotos = [];
    final ImagePicker picker = ImagePicker();

    bool isGoogleVerified = googleUser != null;
    String? googlePhotoUrl = googleUser?.photoUrl;
    bool isSigningInWithGoogle = false;

    final destinations = [
      'Reserva Natural El Chocoyero (Managua)',
      'Playas de Pochomil & Masachapa (Managua)',
      'El Crucero & Las Nubes (Managua)',
      'Volcán Cerro Negro',
      'Cañón de Somoto',
      'Isla de Ometepe',
      'Selva Indio Maíz',
      'Reserva Miraflor Estelí',
      'Río San Juan',
      'Volcán Masaya',
      'Pueblos Blancos & Catarina',
      'Corn Island & Little Corn',
      'Matagalpa & Rutas Cafetaleras',
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalContext) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            Future<void> pickPhotos(ImageSource source) async {
              HapticFeedback.selectionClick();
              try {
                if (source == ImageSource.gallery) {
                  List<XFile> picked = [];
                  try {
                    picked = await picker.pickMultiImage(imageQuality: 85);
                  } catch (multiErr) {
                    debugPrint('Aviso fallback a selector simple: $multiErr');
                    final single = await picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
                    if (single != null) picked = [single];
                  }

                  if (picked.isNotEmpty) {
                    setModalState(() {
                      for (final f in picked) {
                        if (selectedPhotos.length < 5 && !selectedPhotos.contains(f.path)) {
                          selectedPhotos.add(f.path);
                        }
                      }
                    });
                  }
                } else {
                  final XFile? photo = await picker.pickImage(source: ImageSource.camera, imageQuality: 85);
                  if (photo != null) {
                    setModalState(() {
                      if (selectedPhotos.length < 5) {
                        selectedPhotos.add(photo.path);
                      }
                    });
                  }
                }
              } catch (e) {
                debugPrint('Aviso selector de fotos: $e');
                if (modalContext.mounted) {
                  CustomToast.error(modalContext, 'Por favor concede los permisos de cámara y fotos en tu dispositivo.');
                }
              }
            }

            Future<void> connectGoogleAccount() async {
              HapticFeedback.lightImpact();
              setModalState(() => isSigningInWithGoogle = true);

              try {
                final success = await ref.read(authServiceProvider).signInWithGoogle();
                if (success) {
                  final updatedUser = ref.read(authServiceProvider).currentUser;
                  if (updatedUser != null) {
                    setModalState(() {
                      isGoogleVerified = true;
                      googlePhotoUrl = updatedUser.photoUrl;
                      nameController.text = updatedUser.displayName;
                    });
                  }
                }
              } catch (err) {
                debugPrint('Error vinculando Google: $err');
              } finally {
                setModalState(() => isSigningInWithGoogle = false);
              }
            }

            final navBarHeight = MediaQuery.of(modalContext).padding.bottom;
            final keyboardHeight = MediaQuery.of(modalContext).viewInsets.bottom;

            return SafeArea(
              bottom: true,
              child: Container(
                padding: EdgeInsets.only(
                  left: 20,
                  right: 20,
                  top: 20,
                  bottom: keyboardHeight + navBarHeight + 28,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFF041920),
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
                  border: Border.all(color: AppColors.borderGold, width: 1.2),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.6), blurRadius: 24, spreadRadius: 4),
                  ],
                ),
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 44,
                        height: 5,
                        decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                    const SizedBox(height: 16),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Row(
                            children: [
                              const Text('✍️', style: TextStyle(fontSize: 22)),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'PUBLICAR RELATO DE EXPEDICIÓN',
                                      style: GoogleFonts.spaceGrotesk(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w800,
                                        color: AppColors.goldLight,
                                        letterSpacing: 0.8,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    Text(
                                      'Gana +200 XP en tu Pasaporte Baqueano',
                                      style: GoogleFonts.inter(fontSize: 11, color: AppColors.terracottaLight),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close_rounded, color: AppColors.textMuted),
                          onPressed: () => Navigator.of(modalContext).pop(),
                        ),
                      ],
                    ),
                    const Divider(color: AppColors.borderLight, height: 20),

                    // 1. CONEXIÓN CON CUENTA DE GOOGLE
                    if (isGoogleVerified) ...[
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: AppColors.primaryDark,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4), width: 1),
                        ),
                        child: Row(
                          children: [
                            CircleAvatar(
                              radius: 18,
                              backgroundColor: AppColors.terracotta.withValues(alpha: 0.2),
                              backgroundImage: (googlePhotoUrl != null && googlePhotoUrl!.isNotEmpty)
                                  ? NetworkImage(googlePhotoUrl!)
                                  : null,
                              child: (googlePhotoUrl == null || googlePhotoUrl!.isEmpty)
                                  ? const Icon(Icons.person, color: AppColors.gold, size: 20)
                                  : null,
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
                                          nameController.text.isNotEmpty ? nameController.text : 'Cuenta de Google',
                                          style: GoogleFonts.montserrat(fontSize: 13, fontWeight: FontWeight.w800, color: Colors.white),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      const Icon(Icons.verified_rounded, color: Color(0xFF10B981), size: 16),
                                    ],
                                  ),
                                  Text(
                                    'Cuenta de Google vinculada con éxito',
                                    style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF10B981)),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ] else ...[
                      InkWell(
                        onTap: isSigningInWithGoogle ? null : connectGoogleAccount,
                        borderRadius: BorderRadius.circular(14),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: AppColors.primaryDark,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: AppColors.gold.withValues(alpha: 0.45), width: 1),
                          ),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.08),
                                  shape: BoxShape.circle,
                                ),
                                child: isSigningInWithGoogle
                                    ? const SizedBox(
                                        width: 18,
                                        height: 18,
                                        child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.gold),
                                      )
                                    : const Icon(Icons.g_mobiledata_rounded, color: AppColors.gold, size: 26),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Conectar con Cuenta de Google',
                                      style: GoogleFonts.montserrat(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white),
                                    ),
                                    Text(
                                      'Verifica tu identidad y sincroniza XP en tu pasaporte',
                                      style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
                                    ),
                                  ],
                                ),
                              ),
                              const Icon(Icons.arrow_forward_ios_rounded, color: AppColors.gold, size: 14),
                            ],
                          ),
                        ),
                      ),
                    ],
                    const SizedBox(height: 14),

                    // Nombre del Explorador
                    Text('Nombre del Explorador / Viajero:', style: GoogleFonts.spaceGrotesk(fontSize: 11.5, fontWeight: FontWeight.w700, color: Colors.white70)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: nameController,
                      style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
                      decoration: InputDecoration(
                        hintText: 'Tu nombre o apodo viajero (ej. Carlos Mendoza)',
                        hintStyle: GoogleFonts.inter(color: AppColors.textMuted, fontSize: 12),
                        filled: true,
                        fillColor: AppColors.primaryDark,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.gold)),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // 2. PAÍS DE ORIGEN CON RECONOCIMIENTO AUTOMÁTICO DE BANDERA
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            'País de Origen:',
                            style: GoogleFonts.spaceGrotesk(fontSize: 11.5, fontWeight: FontWeight.w700, color: Colors.white70),
                          ),
                        ),
                        Text(
                          'Detección automática',
                          style: GoogleFonts.inter(fontSize: 10.5, color: AppColors.goldLight, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: countryController,
                      style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
                      onChanged: (val) {
                        setModalState(() {
                          detectionResult = CountryFlagHelper.detectFlag(val);
                        });
                      },
                      decoration: InputDecoration(
                        hintText: 'Escribe tu país (ej. España, Costa Rica, México, EE.UU.)...',
                        hintStyle: GoogleFonts.inter(color: AppColors.textMuted, fontSize: 12),
                        prefixIcon: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 10),
                          child: Center(
                            widthFactor: 1.0,
                            child: Text(
                              detectionResult.flag,
                              style: const TextStyle(fontSize: 24),
                            ),
                          ),
                        ),
                        suffixIcon: detectionResult.isRecognized
                            ? const Padding(
                                padding: EdgeInsets.only(right: 12),
                                child: Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 20),
                              )
                            : null,
                        filled: true,
                        fillColor: AppColors.primaryDark,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.gold)),
                      ),
                    ),
                    const SizedBox(height: 6),

                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: detectionResult.isRecognized
                            ? AppColors.gold.withValues(alpha: 0.12)
                            : Colors.white.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: detectionResult.isRecognized ? AppColors.gold.withValues(alpha: 0.4) : Colors.white10,
                          width: 0.8,
                        ),
                      ),
                      child: Row(
                        children: [
                          Text(detectionResult.flag, style: const TextStyle(fontSize: 16)),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              detectionResult.isRecognized
                                  ? 'Bandera reconocida: ${detectionResult.canonicalName}'
                                  : 'Escribe el nombre de tu país para autodetectar la bandera',
                              style: GoogleFonts.inter(
                                fontSize: 11,
                                color: detectionResult.isRecognized ? AppColors.goldLight : AppColors.textMuted,
                                fontWeight: detectionResult.isRecognized ? FontWeight.w600 : FontWeight.w400,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),

                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: CountryFlagHelper.popularCountries.map((c) {
                        final isSelected = detectionResult.canonicalName.toLowerCase() == c['name']!.toLowerCase();
                        return InkWell(
                          onTap: () {
                            countryController.text = c['name']!;
                            setModalState(() {
                              detectionResult = CountryFlagHelper.detectFlag(c['name']!);
                            });
                          },
                          borderRadius: BorderRadius.circular(8),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: isSelected ? AppColors.terracotta.withValues(alpha: 0.3) : AppColors.primaryDark,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: isSelected ? AppColors.gold : AppColors.borderLight,
                                width: 0.8,
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(c['flag']!, style: const TextStyle(fontSize: 13)),
                                const SizedBox(width: 4),
                                Text(
                                  c['name']!,
                                  style: GoogleFonts.spaceGrotesk(
                                    fontSize: 10.5,
                                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                    color: isSelected ? Colors.white : AppColors.textLight,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 14),

                    // Destino
                    Text('Destino / Ruta Explorada:', style: GoogleFonts.spaceGrotesk(fontSize: 11.5, fontWeight: FontWeight.w700, color: Colors.white70)),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: AppColors.primaryDark,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.borderLight),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: selectedDestination,
                          isExpanded: true,
                          dropdownColor: AppColors.bgDark,
                          icon: const Icon(Icons.arrow_drop_down, color: AppColors.gold),
                          items: destinations.map((d) {
                            return DropdownMenuItem<String>(
                              value: d,
                              child: Text(d, style: GoogleFonts.inter(fontSize: 13, color: Colors.white)),
                            );
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) {
                              setModalState(() => selectedDestination = val);
                            }
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Calificación en Estrellas
                    Row(
                      children: [
                        Text('Calificación:', style: GoogleFonts.spaceGrotesk(fontSize: 11.5, fontWeight: FontWeight.w700, color: Colors.white70)),
                        const SizedBox(width: 8),
                        Row(
                          children: List.generate(5, (index) {
                            final star = index + 1;
                            return IconButton(
                              padding: const EdgeInsets.symmetric(horizontal: 2),
                              constraints: const BoxConstraints(),
                              icon: Icon(
                                star <= selectedRating ? Icons.star_rounded : Icons.star_outline_rounded,
                                color: AppColors.gold,
                                size: 24,
                              ),
                              onPressed: () => setModalState(() => selectedRating = star.toDouble()),
                            );
                          }),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // 2.5 ACCIÓN DE CUIDADO DE NUESTRO PAÍS (OPCIONAL)
                    Row(
                      children: [
                        const Text('🌿', style: TextStyle(fontSize: 14)),
                        const SizedBox(width: 6),
                        Text(
                          '¿Cuidaste a Nicaragua en esta ruta? (Opcional):',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                            color: AppColors.jungleGreenLight,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: AppColors.primaryDark,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: selectedEcoAction != null
                              ? AppColors.jungleGreenLight.withValues(alpha: 0.8)
                              : AppColors.borderLight,
                          width: selectedEcoAction != null ? 1.2 : 0.8,
                        ),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String?>(
                          value: selectedEcoAction,
                          isExpanded: true,
                          hint: Text(
                            'Selecciona una acción verde que realizaste...',
                            style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted),
                          ),
                          dropdownColor: AppColors.bgDark,
                          icon: const Icon(Icons.arrow_drop_down, color: AppColors.jungleGreenLight),
                          items: [
                            DropdownMenuItem<String?>(
                              value: null,
                              child: Text('Ninguna en específico', style: GoogleFonts.inter(fontSize: 12.5, color: Colors.white60)),
                            ),
                            ...[
                              '🧹 Limpieza de plásticos y basura en sendero',
                              '🐢 Protección y respeto a fauna / tortugas',
                              '💧 Uso de bloqueador biodegradable en agua dulce',
                              '🌱 Reforestación o siembra de árbol nativo',
                              '🌾 Consumo directo en cooperativa campesina',
                              '🪸 Snorkel respetuoso sin pisar corales',
                              '🚫 No dejé ningún rastro de basura',
                            ].map((eco) => DropdownMenuItem<String?>(
                                  value: eco,
                                  child: Text(eco, style: GoogleFonts.inter(fontSize: 12.5, color: AppColors.jungleGreenLight)),
                                )),
                          ],
                          onChanged: (val) {
                            setModalState(() => selectedEcoAction = val);
                          },
                        ),
                      ),
                    ),
                    if (selectedEcoAction != null) ...[
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: AppColors.jungleGreen.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.jungleGreenLight.withValues(alpha: 0.4)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.verified_rounded, color: AppColors.jungleGreenLight, size: 14),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                '¡Esta reseña recibirá el sello oficial de Guardián de Nicaragua!',
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.jungleGreenLight,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 14),

                    // 3. SUBIDA DE FOTOS DE LA EXPEDICIÓN
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Fotos de la Expedición (Opcional):',
                          style: GoogleFonts.spaceGrotesk(fontSize: 11.5, fontWeight: FontWeight.w700, color: Colors.white70),
                        ),
                        Text(
                          '${selectedPhotos.length}/5 fotos',
                          style: GoogleFonts.inter(fontSize: 11, color: AppColors.goldLight, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),

                    if (selectedPhotos.isEmpty) ...[
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.primaryDark,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppColors.borderLight, width: 0.8),
                        ),
                        child: Column(
                          children: [
                            const Icon(Icons.add_photo_alternate_rounded, color: AppColors.gold, size: 34),
                            const SizedBox(height: 6),
                            Text(
                              'Comparte momentos visuales de tu travesía',
                              style: GoogleFonts.inter(fontSize: 11.5, color: AppColors.textMuted),
                            ),
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                OutlinedButton.icon(
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: AppColors.gold,
                                    side: const BorderSide(color: AppColors.gold, width: 0.8),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                  ),
                                  icon: const Icon(Icons.photo_camera_rounded, size: 16),
                                  label: Text('Cámara', style: GoogleFonts.spaceGrotesk(fontSize: 11.5, fontWeight: FontWeight.w700)),
                                  onPressed: () => pickPhotos(ImageSource.camera),
                                ),
                                const SizedBox(width: 12),
                                ElevatedButton.icon(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.terracotta.withValues(alpha: 0.35),
                                    foregroundColor: Colors.white,
                                    side: const BorderSide(color: AppColors.terracotta, width: 0.8),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                  ),
                                  icon: const Icon(Icons.photo_library_rounded, size: 16),
                                  label: Text('Galería', style: GoogleFonts.spaceGrotesk(fontSize: 11.5, fontWeight: FontWeight.w700)),
                                  onPressed: () => pickPhotos(ImageSource.gallery),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ] else ...[
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SizedBox(
                            height: 84,
                            child: ListView.separated(
                              scrollDirection: Axis.horizontal,
                              itemCount: selectedPhotos.length + (selectedPhotos.length < 5 ? 1 : 0),
                              separatorBuilder: (_, __) => const SizedBox(width: 10),
                              itemBuilder: (context, photoIdx) {
                                if (photoIdx == selectedPhotos.length) {
                                  return InkWell(
                                    onTap: () => pickPhotos(ImageSource.gallery),
                                    borderRadius: BorderRadius.circular(12),
                                    child: Container(
                                      width: 84,
                                      decoration: BoxDecoration(
                                        color: AppColors.primaryDark,
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(color: AppColors.gold.withValues(alpha: 0.5), width: 1),
                                      ),
                                      child: const Center(
                                        child: Icon(Icons.add_a_photo_rounded, color: AppColors.gold, size: 24),
                                      ),
                                    ),
                                  );
                                }

                                final photoPath = selectedPhotos[photoIdx];
                                return Stack(
                                  children: [
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(12),
                                      child: Image.file(
                                        File(photoPath),
                                        width: 84,
                                        height: 84,
                                        fit: BoxFit.cover,
                                        errorBuilder: (_, __, ___) => Container(
                                          width: 84,
                                          height: 84,
                                          color: AppColors.primaryDark,
                                          child: const Icon(Icons.broken_image, color: Colors.white24),
                                        ),
                                      ),
                                    ),
                                    Positioned(
                                      top: 4,
                                      right: 4,
                                      child: GestureDetector(
                                        onTap: () {
                                          setModalState(() {
                                            selectedPhotos.removeAt(photoIdx);
                                          });
                                        },
                                        child: Container(
                                          padding: const EdgeInsets.all(3),
                                          decoration: const BoxDecoration(
                                            color: Colors.black87,
                                            shape: BoxShape.circle,
                                          ),
                                          child: const Icon(Icons.close_rounded, size: 14, color: Colors.white),
                                        ),
                                      ),
                                    ),
                                  ],
                                );
                              },
                            ),
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              TextButton.icon(
                                onPressed: () => pickPhotos(ImageSource.camera),
                                icon: const Icon(Icons.photo_camera_rounded, size: 14, color: AppColors.gold),
                                label: Text('Tomar otra', style: GoogleFonts.inter(fontSize: 11, color: AppColors.gold)),
                              ),
                              const Spacer(),
                              TextButton(
                                onPressed: () => setModalState(() => selectedPhotos.clear()),
                                child: Text('Eliminar fotos', style: GoogleFonts.inter(fontSize: 11, color: Colors.redAccent.shade100)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                    const SizedBox(height: 14),

                    // Relato / Experiencia
                    Text('Tu Relato o Consejo de Sendero:', style: GoogleFonts.spaceGrotesk(fontSize: 11.5, fontWeight: FontWeight.w700, color: Colors.white70)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: storyController,
                      maxLines: 4,
                      style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
                      decoration: InputDecoration(
                        hintText: 'Cuéntanos cómo fue tu experiencia con los baqueanos locales, qué llevar, consejos ecológicos...',
                        hintStyle: GoogleFonts.inter(color: AppColors.textMuted, fontSize: 12),
                        filled: true,
                        fillColor: AppColors.primaryDark,
                        contentPadding: const EdgeInsets.all(14),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.gold)),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Botón Publicar Relato
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.terracotta,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        icon: const Icon(Icons.send_rounded, size: 18, color: Colors.white),
                        label: Text(
                          'PUBLICAR RELATO EN LA BITÁCORA',
                          style: GoogleFonts.spaceGrotesk(fontSize: 12.5, fontWeight: FontWeight.w800),
                        ),
                        onPressed: () {
                          if (storyController.text.trim().isEmpty) {
                            CustomToast.error(modalContext, 'Por favor escribe tu relato o experiencia.');
                            return;
                          }

                          HapticFeedback.mediumImpact();
                          final now = DateTime.now();
                          final dateStr = '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';

                          final newReview = ExplorerReview(
                            id: 'rev-${now.millisecondsSinceEpoch}',
                            author: nameController.text.trim().isEmpty ? 'Explorador Baqueano' : nameController.text.trim(),
                            countryFlag: detectionResult.flag,
                            destination: selectedDestination,
                            review: storyController.text.trim(),
                            rating: selectedRating,
                            photos: List.from(selectedPhotos),
                            userPhotoUrl: googlePhotoUrl,
                            isVerifiedGoogle: isGoogleVerified,
                            date: dateStr,
                            ecoAction: selectedEcoAction,
                            isEcoGuardian: selectedEcoAction != null,
                          );

                          setState(() {
                            _reviews.insert(0, newReview);
                          });

                          Navigator.of(modalContext).pop();
                          CustomToast.success(
                            context,
                            '¡Relato publicado con éxito! Has ganado +200 XP en tu Pasaporte Baqueano.',
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 48),
                  ],
                ),
              ),
            ),
          );
        },
        );
      },
    );
  }

  // --------------------------------------------------------------------------
  // DIÁLOGO EXPANDIDO DE PREVISUALIZACIÓN DE FOTOGRAFÍA
  // --------------------------------------------------------------------------
  void _showPhotoPreviewDialog(BuildContext context, String path) {
    HapticFeedback.selectionClick();
    showDialog(
      context: context,
      builder: (dialogCtx) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.all(16),
        child: Stack(
          alignment: Alignment.topRight,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.black,
                  border: Border.all(color: AppColors.gold.withValues(alpha: 0.5), width: 1.2),
                ),
                child: _buildReviewPhotoImage(path, fit: BoxFit.contain),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: CircleAvatar(
                backgroundColor: Colors.black87,
                radius: 18,
                child: IconButton(
                  padding: EdgeInsets.zero,
                  icon: const Icon(Icons.close_rounded, color: Colors.white, size: 20),
                  onPressed: () => Navigator.of(dialogCtx).pop(),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewPhotoImage(String path, {BoxFit fit = BoxFit.cover}) {
    if (path.startsWith('http')) {
      return Image.network(
        path,
        fit: fit,
        errorBuilder: (_, __, ___) => const Center(child: Icon(Icons.broken_image, color: Colors.white24)),
      );
    } else if (path.startsWith('assets/')) {
      return Image.asset(
        path,
        fit: fit,
        errorBuilder: (_, __, ___) => const Center(child: Icon(Icons.broken_image, color: Colors.white24)),
      );
    } else {
      return Image.file(
        File(path),
        fit: fit,
        errorBuilder: (_, __, ___) => const Center(child: Icon(Icons.broken_image, color: Colors.white24)),
      );
    }
  }

  // --------------------------------------------------------------------------
  // CONSTRUCCIÓN DEL MODO GALERÍA DINÁMICA EN MOVIMIENTO
  // --------------------------------------------------------------------------
  Widget _buildDynamicMotionGallery(List<ExplorerReview> dateReviews, bool isDesktop) {
    if (dateReviews.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: AppColors.borderLight),
        ),
        child: Column(
          children: [
            const Icon(Icons.event_busy_rounded, color: AppColors.gold, size: 40),
            const SizedBox(height: 10),
            Text(
              'No hay relatos registrados en esta fecha',
              style: GoogleFonts.montserrat(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 6),
            Text(
              'Sé el primer explorador en compartir tu experiencia de este día.',
              style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.gold,
                    side: const BorderSide(color: AppColors.gold),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () => _onSelectDate(null),
                  child: const Text('Ver todas las fechas'),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.terracotta,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () => _openPublishStoryModal(context),
                  child: const Text('✍️ Publicar Relato'),
                ),
              ],
            ),
          ],
        ),
      );
    }

    return Column(
      children: [
        // Barra Superior del Modo Galería Dinámica
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                AppColors.terracotta.withValues(alpha: 0.28),
                AppColors.gold.withValues(alpha: 0.16),
              ],
            ),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.gold.withValues(alpha: 0.55), width: 1),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppColors.gold.withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.motion_photos_on_rounded, color: AppColors.gold, size: 18),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'MODO GALERÍA DINÁMICA EN MOVIMIENTO',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w800,
                        color: AppColors.goldLight,
                        letterSpacing: 0.8,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      'Relatos de expedición del ${_formatDateHeader(_selectedDate!)}',
                      style: GoogleFonts.inter(fontSize: 10.5, color: Colors.white70),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              // Botón de Pausa / Reproducción de Movimiento
              IconButton(
                tooltip: _isAutoMotionPlaying ? 'Pausar movimiento' : 'Reanudar movimiento',
                icon: Icon(
                  _isAutoMotionPlaying ? Icons.pause_circle_rounded : Icons.play_circle_rounded,
                  color: AppColors.gold,
                  size: 26,
                ),
                onPressed: () => _toggleAutoMotion(dateReviews.length),
              ),
              // Botón para cerrar modo galería y ver todas las fechas
              IconButton(
                tooltip: 'Ver todas las fechas',
                icon: const Icon(Icons.close_rounded, color: Colors.white70, size: 20),
                onPressed: () => _onSelectDate(null),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // Carrusel Cinemático en Movimiento de Relatos
        SizedBox(
          height: 380,
          child: PageView.builder(
            controller: _galleryPageController,
            itemCount: dateReviews.length,
            onPageChanged: (idx) {
              setState(() => _currentGalleryIndex = idx);
            },
            itemBuilder: (context, idx) {
              final rev = dateReviews[idx];
              final hasPhotos = rev.photos.isNotEmpty;

              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                child: GlassContainer(
                  padding: const EdgeInsets.all(20),
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: AppColors.borderGold, width: 1.2),
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Encabezado de la tarjeta con autor y origen
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Row(
                                children: [
                                  if (rev.userPhotoUrl != null && rev.userPhotoUrl!.isNotEmpty) ...[
                                    CircleAvatar(
                                      radius: 16,
                                      backgroundColor: AppColors.terracotta.withValues(alpha: 0.2),
                                      backgroundImage: NetworkImage(rev.userPhotoUrl!),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(rev.countryFlag, style: const TextStyle(fontSize: 18)),
                                  ] else ...[
                                    Text(rev.countryFlag, style: const TextStyle(fontSize: 24)),
                                  ],
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Flexible(
                                              child: Text(
                                                rev.author,
                                                style: GoogleFonts.montserrat(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.w800,
                                                  color: Colors.white,
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                            if (rev.isVerifiedGoogle) ...[
                                              const SizedBox(width: 4),
                                              const Icon(Icons.verified_rounded, color: Color(0xFF10B981), size: 15),
                                            ],
                                          ],
                                        ),
                                        Text(
                                          '🗓️ ${formatReviewDate(rev)}',
                                          style: GoogleFonts.inter(fontSize: 10.5, color: AppColors.goldLight),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Flexible(
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppColors.terracotta.withValues(alpha: 0.25),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: AppColors.terracotta.withValues(alpha: 0.5), width: 0.8),
                                ),
                                child: Text(
                                  rev.destination,
                                  style: GoogleFonts.spaceGrotesk(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.goldLight,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),

                        // Estrellas de calificación
                        Row(
                          children: [
                            Row(
                              children: List.generate(5, (sIdx) {
                                return Icon(
                                  sIdx < rev.rating.floor() ? Icons.star_rounded : Icons.star_outline_rounded,
                                  size: 16,
                                  color: AppColors.gold,
                                );
                              }),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              rev.rating.toStringAsFixed(1),
                              style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.gold),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),

                        // Texto del relato en galería
                        Text(
                          rev.review,
                          style: GoogleFonts.inter(
                            fontSize: 13.5,
                            color: Colors.white.withValues(alpha: 0.95),
                            height: 1.45,
                            fontStyle: FontStyle.italic,
                          ),
                        ),

                        if (rev.ecoAction != null) ...[
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: AppColors.jungleGreen.withValues(alpha: 0.25),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: AppColors.jungleGreenLight.withValues(alpha: 0.6)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Text('🌱', style: TextStyle(fontSize: 13)),
                                const SizedBox(width: 6),
                                Flexible(
                                  child: Text(
                                    'Acción Verde: ${rev.ecoAction!}',
                                    style: GoogleFonts.spaceGrotesk(
                                      fontSize: 11.5,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.jungleGreenLight,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],

                        // Galería de fotos si la reseña incluye capturas
                        if (hasPhotos) ...[
                          const SizedBox(height: 12),
                          SizedBox(
                            height: 100,
                            child: ListView.separated(
                              scrollDirection: Axis.horizontal,
                              itemCount: rev.photos.length,
                              separatorBuilder: (_, __) => const SizedBox(width: 10),
                              itemBuilder: (context, pIdx) {
                                final photo = rev.photos[pIdx];
                                return GestureDetector(
                                  onTap: () => _showPhotoPreviewDialog(context, photo),
                                  child: Container(
                                    width: 120,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: AppColors.gold.withValues(alpha: 0.45), width: 1),
                                    ),
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(12),
                                      child: _buildReviewPhotoImage(photo),
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 10),

        // Indicadores de navegación interactiva y controles de deslizamiento
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            IconButton(
              icon: const Icon(Icons.chevron_left_rounded, color: AppColors.gold, size: 24),
              onPressed: () {
                if (_galleryPageController.hasClients && _currentGalleryIndex > 0) {
                  _galleryPageController.previousPage(
                    duration: const Duration(milliseconds: 400),
                    curve: Curves.easeInOut,
                  );
                }
              },
            ),
            Row(
              children: List.generate(dateReviews.length, (dotIdx) {
                final isCurrent = dotIdx == _currentGalleryIndex;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  margin: const EdgeInsets.symmetric(horizontal: 3),
                  width: isCurrent ? 22 : 7,
                  height: 7,
                  decoration: BoxDecoration(
                    color: isCurrent ? AppColors.gold : Colors.white24,
                    borderRadius: BorderRadius.circular(10),
                  ),
                );
              }),
            ),
            IconButton(
              icon: const Icon(Icons.chevron_right_rounded, color: AppColors.gold, size: 24),
              onPressed: () {
                if (_galleryPageController.hasClients && _currentGalleryIndex < dateReviews.length - 1) {
                  _galleryPageController.nextPage(
                    duration: const Duration(milliseconds: 400),
                    curve: Curves.easeInOut,
                  );
                }
              },
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: AppColors.primaryDark,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.borderLight, width: 0.8),
              ),
              child: Text(
                '${_currentGalleryIndex + 1}/${dateReviews.length}',
                style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.goldLight),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // --------------------------------------------------------------------------
  // BARRA SELECTORA CRONOLÓGICA DE FECHAS
  // --------------------------------------------------------------------------
  Widget _buildDateFilterBar() {
    final available = _availableDates;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                const Icon(Icons.calendar_month_rounded, size: 16, color: AppColors.gold),
                const SizedBox(width: 6),
                Text(
                  'FILTRAR POR FECHA DE EXPEDICIÓN:',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w800,
                    color: AppColors.goldLight,
                    letterSpacing: 0.8,
                  ),
                ),
              ],
            ),
            if (_selectedDate != null)
              GestureDetector(
                onTap: () => _onSelectDate(null),
                child: Text(
                  'Ver todas',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppColors.terracottaLight,
                    decoration: TextDecoration.underline,
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 8),

        SizedBox(
          height: 38,
          child: ListView(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            children: [
              // Chip "Todas las fechas"
              _buildDateChip(
                label: 'Todas las fechas',
                count: _reviews.length,
                isSelected: _selectedDate == null,
                onTap: () => _onSelectDate(null),
              ),
              const SizedBox(width: 8),

              // Chips de fechas individuales existentes
              ...available.map((d) {
                final isSelected = _selectedDate != null &&
                    _selectedDate!.year == d.year &&
                    _selectedDate!.month == d.month &&
                    _selectedDate!.day == d.day;
                final count = _getFilteredReviews(d).length;

                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: _buildDateChip(
                    label: _formatDateShort(d),
                    count: count,
                    isSelected: isSelected,
                    onTap: () => _onSelectDate(d),
                  ),
                );
              }),

              // Botón selector de fecha libre
              InkWell(
                onTap: () async {
                  HapticFeedback.selectionClick();
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _selectedDate ?? DateTime(2026, 9, 3),
                    firstDate: DateTime(2024),
                    lastDate: DateTime(2030),
                    builder: (context, child) {
                      return Theme(
                        data: ThemeData.dark().copyWith(
                          colorScheme: const ColorScheme.dark(
                            primary: AppColors.gold,
                            onPrimary: Colors.black,
                            surface: Color(0xFF041920),
                            onSurface: Colors.white,
                          ),
                        ),
                        child: child!,
                      );
                    },
                  );
                  if (picked != null) {
                    _onSelectDate(picked);
                  }
                },
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.primaryDark,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.borderLight, width: 0.8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.date_range_rounded, size: 14, color: AppColors.gold),
                      const SizedBox(width: 4),
                      Text(
                        'Otra fecha...',
                        style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.white70),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDateChip({
    required String label,
    required int count,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.gold : AppColors.primaryDark,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.gold : AppColors.borderLight,
            width: isSelected ? 1.2 : 0.8,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.gold.withValues(alpha: 0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  )
                ]
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: GoogleFonts.spaceGrotesk(
                fontSize: 11.5,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                color: isSelected ? const Color(0xFF041920) : Colors.white,
              ),
            ),
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF041920) : AppColors.terracotta.withValues(alpha: 0.35),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '$count',
                style: GoogleFonts.inter(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  color: isSelected ? AppColors.gold : AppColors.goldLight,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;
    final dateFilteredReviews = _getFilteredReviews(_selectedDate);

    return ResponsiveScaffold(
      currentIndex: 1,
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.symmetric(
          horizontal: isDesktop ? 48.0 : 20.0,
          vertical: 24.0,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SectionHeader(
              tag: 'RED DE VIAJEROS & ANFITRIONES',
              title: '👥 Comunidad & Bitácora de Exploradores',
              subtitle: 'Historias compartidas, consejos en ruta y el decálogo ético para proteger los santuarios de Nicaragua.',
              isCentered: true,
            ),
            const SizedBox(height: 16),

            // DECÁLOGO DEL EXPLORADOR BAQUEANO
            Container(
              width: double.infinity,
              padding: EdgeInsets.symmetric(
                horizontal: isDesktop ? 24.0 : 18.0,
                vertical: 20.0,
              ),
              decoration: BoxDecoration(
                gradient: AppGradients.volcanicHero,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppColors.gold, width: 1.5),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.verified_user_rounded, color: AppColors.gold, size: 22),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'DECÁLOGO DEL EXPLORADOR ÉTICO',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 13.5,
                            fontWeight: FontWeight.w800,
                            color: AppColors.goldLight,
                            letterSpacing: 0.8,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _buildDecalogueItem('1.', 'No dejes rastro: Regresa toda la basura contigo, incluso la biodegradable.'),
                  _buildDecalogueItem('2.', 'Respeta a la fauna silvestre: Observa desde la distancia sin alimentar.'),
                  _buildDecalogueItem('3.', 'Apoya la economía campesina: Contrata guías baqueanos locales certificados.'),
                  _buildDecalogueItem('4.', 'Honra las tradiciones sagradas: Pide permiso antes de fotografiar en comunidades.'),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // ----------------------------------------------------------------
            // BANNER INTERACTIVO: CÓMO CUIDAMOS NUESTRO PAÍS
            // ----------------------------------------------------------------
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    const Color(0xFF064E3B),
                    AppColors.primaryDark,
                    const Color(0xFF082B35),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.jungleGreenLight, width: 1.2),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.jungleGreen.withValues(alpha: 0.2),
                    blurRadius: 14,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.jungleGreen.withValues(alpha: 0.3),
                          shape: BoxShape.circle,
                        ),
                        child: const Text('🌿', style: TextStyle(fontSize: 22)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'IMPACTO ECOLÓGICO DE LA COMUNIDAD',
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 10.5,
                                fontWeight: FontWeight.w800,
                                color: AppColors.goldLight,
                                letterSpacing: 0.8,
                              ),
                            ),
                            Text(
                              '¿Cómo cuidamos nuestro país en cada ruta?',
                              style: GoogleFonts.montserrat(
                                fontSize: 15,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Nuestra comunidad no solo viaja: recoge plásticos en volcanes, protege nidos de tortugas, utiliza bloqueadores biodegradables en lagunas cratéricas y reforesta con cooperativas campesinas.',
                    style: GoogleFonts.inter(
                      fontSize: 12.5,
                      color: Colors.white.withValues(alpha: 0.88),
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 14),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      InkWell(
                        onTap: () {
                          HapticFeedback.selectionClick();
                          setState(() {
                            _filterEcoOnly = !_filterEcoOnly;
                          });
                        },
                        borderRadius: BorderRadius.circular(10),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                          decoration: BoxDecoration(
                            color: _filterEcoOnly ? AppColors.gold : AppColors.jungleGreen.withValues(alpha: 0.3),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: _filterEcoOnly ? AppColors.gold : AppColors.jungleGreenLight,
                              width: 1,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                _filterEcoOnly ? Icons.check_circle_rounded : Icons.filter_alt_outlined,
                                size: 15,
                                color: _filterEcoOnly ? const Color(0xFF041920) : AppColors.jungleGreenLight,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                _filterEcoOnly
                                    ? 'Viendo: Guardianes del País (${_reviews.where((r) => r.isEcoGuardian || r.ecoAction != null).length})'
                                    : 'Filtrar Relatos con Acciones Verdes (${_reviews.where((r) => r.isEcoGuardian || r.ecoAction != null).length})',
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w700,
                                  color: _filterEcoOnly ? const Color(0xFF041920) : Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      InkWell(
                        onTap: () => context.push('/campana-ambiental'),
                        borderRadius: BorderRadius.circular(10),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                          decoration: BoxDecoration(
                            color: AppColors.primaryDark,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppColors.gold.withValues(alpha: 0.5), width: 1),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.shield_outlined, size: 15, color: AppColors.goldLight),
                              const SizedBox(width: 6),
                              Text(
                                'Ver Campaña Ambiental',
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.goldLight,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 22),

            // ----------------------------------------------------------------
            // BARRA DE FILTRADO POR FECHA DE EXPEDICIÓN
            // ----------------------------------------------------------------
            _buildDateFilterBar(),

            const SizedBox(height: 20),

            // ----------------------------------------------------------------
            // CONTENIDO: MODO GALERÍA DINÁMICA (SI HAY FECHA SELECCIONADA)
            // O VISTA DE LISTA COMPLETA (SI SELECCIÓN ES "TODAS")
            // ----------------------------------------------------------------
            if (_selectedDate != null) ...[
              _buildDynamicMotionGallery(dateFilteredReviews, isDesktop),
            ] else ...[
              // LISTA COMPLETA DE RESEÑAS DE LA COMUNIDAD
              Align(
                alignment: Alignment.centerLeft,
                child: Row(
                  children: [
                    Text(
                      'EXPERIENCIAS EN SENDERO (${_reviews.length})',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: AppColors.goldLight,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Icon(Icons.photo_library_outlined, size: 15, color: AppColors.gold),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _reviews.length,
                separatorBuilder: (_, __) => const SizedBox(height: 14),
                itemBuilder: (context, index) {
                  final rev = _reviews[index];
                  final hasPhotos = rev.photos.isNotEmpty;

                  return GlassContainer(
                    padding: const EdgeInsets.all(18),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: AppColors.borderLight),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Row(
                                children: [
                                  if (rev.userPhotoUrl != null && rev.userPhotoUrl!.isNotEmpty) ...[
                                    CircleAvatar(
                                      radius: 14,
                                      backgroundColor: AppColors.terracotta.withValues(alpha: 0.2),
                                      backgroundImage: NetworkImage(rev.userPhotoUrl!),
                                    ),
                                    const SizedBox(width: 6),
                                    Text(rev.countryFlag, style: const TextStyle(fontSize: 16)),
                                  ] else ...[
                                    Text(rev.countryFlag, style: const TextStyle(fontSize: 22)),
                                  ],
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Row(
                                      children: [
                                        Flexible(
                                          child: Text(
                                            rev.author,
                                            style: GoogleFonts.montserrat(
                                              fontSize: 13.5,
                                              fontWeight: FontWeight.w800,
                                              color: AppColors.textLight,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                        if (rev.isVerifiedGoogle) ...[
                                          const SizedBox(width: 4),
                                          const Icon(
                                            Icons.verified_rounded,
                                            color: Color(0xFF10B981),
                                            size: 15,
                                          ),
                                        ],
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Flexible(
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: AppColors.terracotta.withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  rev.destination,
                                  style: GoogleFonts.spaceGrotesk(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.goldLight,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),

                        Row(
                          children: [
                            Row(
                              children: List.generate(5, (sIdx) {
                                return Icon(
                                  sIdx < rev.rating.floor() ? Icons.star_rounded : Icons.star_outline_rounded,
                                  size: 14,
                                  color: AppColors.gold,
                                );
                              }),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              '🗓️ ${formatReviewDate(rev)}',
                              style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),

                        Text(
                          rev.review,
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: AppColors.textLight.withValues(alpha: 0.9),
                            height: 1.45,
                          ),
                        ),

                        if (rev.ecoAction != null) ...[
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: AppColors.jungleGreen.withValues(alpha: 0.22),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: AppColors.jungleGreenLight.withValues(alpha: 0.55)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Text('🌱', style: TextStyle(fontSize: 13)),
                                const SizedBox(width: 6),
                                Flexible(
                                  child: Text(
                                    'Acción Verde: ${rev.ecoAction!}',
                                    style: GoogleFonts.spaceGrotesk(
                                      fontSize: 11.5,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.jungleGreenLight,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],

                        if (hasPhotos) ...[
                          const SizedBox(height: 12),
                          SizedBox(
                            height: 95,
                            child: ListView.separated(
                              scrollDirection: Axis.horizontal,
                              itemCount: rev.photos.length,
                              separatorBuilder: (_, __) => const SizedBox(width: 10),
                              itemBuilder: (context, pIdx) {
                                final photo = rev.photos[pIdx];
                                return GestureDetector(
                                  onTap: () => _showPhotoPreviewDialog(context, photo),
                                  child: Hero(
                                    tag: 'photo-${rev.id}-$pIdx',
                                    child: Container(
                                      width: 110,
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(color: AppColors.gold.withValues(alpha: 0.35), width: 0.8),
                                        boxShadow: [
                                          BoxShadow(
                                            color: Colors.black.withValues(alpha: 0.3),
                                            blurRadius: 6,
                                            offset: const Offset(0, 2),
                                          ),
                                        ],
                                      ),
                                      child: ClipRRect(
                                        borderRadius: BorderRadius.circular(12),
                                        child: _buildReviewPhotoImage(photo),
                                      ),
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                        ],
                      ],
                    ),
                  );
                },
              ),
            ],

            const SizedBox(height: 32),

            // CTA Share Story adaptativo para móvil y pantalla ancha
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: AppGradients.cardGlass,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: AppColors.gold.withValues(alpha: 0.55), width: 1.2),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.25),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: isDesktop
                  ? Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.gold.withValues(alpha: 0.15),
                            shape: BoxShape.circle,
                            border: Border.all(color: AppColors.gold.withValues(alpha: 0.3)),
                          ),
                          child: const Icon(Icons.edit_note_rounded, color: AppColors.gold, size: 28),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '¿Completaste una ruta con Baqueano?',
                                style: GoogleFonts.montserrat(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'Comparte tu relato y fotos para ganar +200 XP en tu pasaporte.',
                                style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 16),
                        BaqueanoButton(
                          text: 'Publicar Relato',
                          variant: BaqueanoButtonVariant.primary,
                          height: 42,
                          onPressed: () => _openPublishStoryModal(context),
                        ),
                      ],
                    )
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.gold.withValues(alpha: 0.15),
                                shape: BoxShape.circle,
                                border: Border.all(color: AppColors.gold.withValues(alpha: 0.3)),
                              ),
                              child: const Icon(Icons.edit_note_rounded, color: AppColors.gold, size: 26),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '¿Completaste una ruta con Baqueano?',
                                    style: GoogleFonts.montserrat(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w800,
                                      color: Colors.white,
                                    ),
                                  ),
                                  const SizedBox(height: 3),
                                  Text(
                                    'Comparte tu relato y fotos para ganar +200 XP en tu pasaporte.',
                                    style: GoogleFonts.inter(fontSize: 11.5, color: AppColors.textMuted, height: 1.3),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        BaqueanoButton(
                          text: '✍️ Publicar Relato de Expedición',
                          variant: BaqueanoButtonVariant.primary,
                          height: 44,
                          onPressed: () => _openPublishStoryModal(context),
                        ),
                      ],
                    ),
            ),

            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }

  Widget _buildDecalogueItem(String num, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(num, style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.gold)),
          const SizedBox(width: 8),
          Expanded(
            child: Text(text, style: GoogleFonts.inter(fontSize: 12, color: AppColors.textLight.withValues(alpha: 0.9), height: 1.35)),
          ),
        ],
      ),
    );
  }
}
