// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CAMPAÑA AMBIENTAL & CUIDADO DE NUESTROS RECURSOS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Nicaragua alberga el 7% de la biodiversidad del planeta, 78 áreas protegidas,
//   y reservas de biosfera de la UNESCO (Bosawás, Río San Juan, Ometepe).
// - El objetivo medular e innegociable de Baqueano es la preservación absoluta
//   de los ecosistemas naturales y el apoyo directo a las comunidades campesinas.
// - Esta pantalla educa, sensibiliza y compromete activamente tanto a turistas
//   nacionales como a viajeros internacionales en el cuidado riguroso de volcanes,
//   lagunas cratéricas, arrecifes caribeños, nebliselvas y fauna silvestre.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `StatefulWidget` con persistencia local (`SharedPreferences`) del compromiso
//   ambiental ("Pledge del Explorador").
// - Despliegue interactivo de los 8 Mandamientos del Viajero Responsable.
// - Generación de certificado digital interactivo de "Guardián de los Recursos".
// - Integración con `url_launcher` y `Share` / WhatsApp para viralizar la campaña.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `EnvironmentalCampaignScreen`: Pantalla oficial de la campaña ambiental en `/campana-ambiental`.
// ============================================================================

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/baqueano_button.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';

class EnvironmentalCampaignScreen extends StatefulWidget {
  const EnvironmentalCampaignScreen({super.key});

  @override
  State<EnvironmentalCampaignScreen> createState() => _EnvironmentalCampaignScreenState();
}

class _EnvironmentalCampaignScreenState extends State<EnvironmentalCampaignScreen> {
  bool _hasSignedPledge = false;
  final TextEditingController _nameController = TextEditingController();

  final List<Map<String, dynamic>> _commandments = const [
    {
      'icon': '🐢',
      'title': 'Protección Total de Fauna Silvestre',
      'highlight': 'Prohibido tocar, alimentar o acosar animales',
      'description': 'Monos congos, tortugas paslama en desove (Chococente y La Flor), aves de Los Guatuzos y tiburones nodriza en Corn Island merecen respeto absoluto. Nunca compres artesanías de caparazón de carey, plumas o conchas marinas.',
      'color': AppColors.jungleGreen,
    },
    {
      'icon': '🚫',
      'title': 'Cero Plásticos & "No Dejes Rastro"',
      'highlight': 'Lo que sube contigo, regresa en tu mochila',
      'description': 'En las cumbres volcánicas (Telica, Concepción, Cerro Negro) y en el fondo del Cañón de Somoto no hay cuadrillas de limpieza. Lleva cantimploras reutilizables y traslada todos tus desechos hasta centros de acopio autorizados.',
      'color': AppColors.terracotta,
    },
    {
      'icon': '💧',
      'title': 'Cuidado Sagrado de Fuentes de Agua Dulce',
      'highlight': 'Bloqueadores biodegradables obligatorios',
      'description': 'En la Laguna de Apoyo, ríos de Matagalpa y cascadas naturales, no uses bloqueadores con químicos tóxicos (oxibenzona). Los químicos matan los alevines y enturbian el agua mineral volcánica pura.',
      'color': Color(0xFF0284C7),
    },
    {
      'icon': '🪸',
      'title': 'Arrecifes de Coral Vivos en el Caribe',
      'highlight': 'Nunca te pares ni toques el coral',
      'description': 'En Southwest Bay, Brig Bay y los Cayos Perlas, nada con flotabilidad controlada. Quebrar una sola rama de coral cerebro o cuerno de alce toma más de 50 años en recuperarse.',
      'color': Color(0xFFE11D48),
    },
    {
      'icon': '🔥',
      'title': 'Prevención Rigurosa de Incendios Forestales',
      'highlight': 'Cero fogatas no autorizadas',
      'description': 'En los bosques secos del Pacífico y los pinares de Dipilto-Jalapa, una sola colilla o brasa puede desatar incendios que arrasen miles de hectáreas protegidas y destruyan nidos de aves nativas.',
      'color': Color(0xFFEA580C),
    },
    {
      'icon': '🌾',
      'title': 'Comercio Campesino que Salva Bosques',
      'highlight': 'Consume local, orgánico y de comercio justo',
      'description': 'Comprar frutas, café de sombra y comida típica directamente a cooperativas y familias campesinas garantiza que no tengan que talar sus bosques para subsistir. El turismo regenerativo fortalece el arraigo campesino.',
      'color': AppColors.gold,
    },
    {
      'icon': '👣',
      'title': 'Respeta los Senderos de los Baqueanos',
      'highlight': 'Evita la erosión y el pisoteo de flora silvestre',
      'description': 'Caminar fuera de las trochas delimitadas fragmenta el hábitat de pequeños mamíferos y acelera la erosión de laderas volcánicas ante las lluvias tropicales. Sigue siempre a tu guía nativo.',
      'color': Color(0xFF059669),
    },
    {
      'icon': '🤝',
      'title': 'Respeto a la Identidad Cultural y Comunitaria',
      'highlight': 'Pide permiso antes de fotografiar',
      'description': 'Las comunidades campesinas e indígenas de Nicaragua no son una atracción turística: son familias con historia y dignidad. Saluda cordialmente y solicita permiso antes de fotografiar a personas o ceremonias.',
      'color': Color(0xFF7C3AED),
    },
  ];

  @override
  void initState() {
    super.initState();
    _loadPledgeStatus();
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _loadPledgeStatus() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _hasSignedPledge = prefs.getBool('signed_environmental_pledge') ?? false;
      _nameController.text = prefs.getString('pledge_signer_name') ?? '';
    });
  }

  Future<void> _signPledge() async {
    final name = _nameController.text.trim();
    if (name.isEmpty) {
      CustomToast.show(context, message: 'Por favor ingresa tu nombre completo');
      return;
    }

    HapticFeedback.heavyImpact();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('signed_environmental_pledge', true);
    await prefs.setString('pledge_signer_name', name);

    setState(() {
      _hasSignedPledge = true;
    });

    if (mounted) {
      CustomToast.success(context, '¡Felicidades! Eres Guardián Oficial de Nicaragua');
    }
  }

  Future<void> _sharePledge() async {
    HapticFeedback.lightImpact();
    final name = _nameController.text.trim().isNotEmpty ? _nameController.text.trim() : 'Un explorador';
    final message = Uri.encodeComponent(
      '🌿🇳🇮 $name acaba de firmar el COMPROMISO AMBIENTAL DE BAQUEANO NICARAGUA para proteger nuestros volcanes, lagunas, arrecifes y fauna silvestre.\n\n'
      '¡Únete tú también al turismo regenerativo sin intermediarios con la app Baqueano!',
    );
    final uri = Uri.parse('https://wa.me/?text=$message');
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {
      if (mounted) {
        CustomToast.show(context, message: '¡Gracias por compartir el compromiso verde!');
      }
    }
  }

  Future<void> _copyOfficialEmail() async {
    await Clipboard.setData(const ClipboardData(text: 'denuncias@baqueano.com'));
    HapticFeedback.mediumImpact();
    if (mounted) {
      CustomToast.success(context, 'Correo denuncias@baqueano.com copiado al portapapeles');
    }
  }

  void _showEnvironmentalReportModal(BuildContext context) {
    HapticFeedback.lightImpact();

    String selectedInfraction = '🏹 Caza furtiva o captura de fauna silvestre';
    final TextEditingController locationCtrl = TextEditingController();
    final TextEditingController detailsCtrl = TextEditingController();
    final TextEditingController contactNameCtrl = TextEditingController();
    final TextEditingController contactPhoneCtrl = TextEditingController();
    bool isAnonymous = true;
    bool isLocating = false;
    final List<XFile> attachedPhotos = [];
    final ImagePicker picker = ImagePicker();

    final List<String> infractionTypes = const [
      '🏹 Caza furtiva o captura de fauna silvestre',
      '🪓 Tala no autorizada o deforestación',
      '🐢 Saqueo de nidos de tortugas o tráfico de carey',
      '🛢️ Vertido de contaminantes en ríos, lagunas o costas',
      '🔥 Fogatas ilegales o riesgo de incendio forestal',
      '🚯 Basurero clandestino en área protegida',
      '⚠️ Otra infracción o daño a recursos naturales',
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalCtx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            Future<void> captureGps() async {
              setModalState(() => isLocating = true);
              try {
                LocationPermission permission = await Geolocator.checkPermission();
                if (permission == LocationPermission.denied) {
                  permission = await Geolocator.requestPermission();
                }
                if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
                  if (modalCtx.mounted) {
                    CustomToast.error(modalCtx, 'Permiso de ubicación denegado. Escribe la ubicación manualmente.');
                  }
                  setModalState(() => isLocating = false);
                  return;
                }

                final pos = await Geolocator.getCurrentPosition(
                  locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
                );
                setModalState(() {
                  locationCtrl.text = 'GPS: ${pos.latitude.toStringAsFixed(5)}, ${pos.longitude.toStringAsFixed(5)}';
                  isLocating = false;
                });
                HapticFeedback.selectionClick();
                if (modalCtx.mounted) {
                  CustomToast.success(modalCtx, 'Coordenadas GPS capturadas con éxito');
                }
              } catch (_) {
                setModalState(() => isLocating = false);
                if (modalCtx.mounted) {
                  CustomToast.show(modalCtx, message: 'Ingresa la ubicación o sendero manualmente');
                }
              }
            }

            Future<void> pickPhoto(ImageSource source) async {
              try {
                final photo = await picker.pickImage(source: source, imageQuality: 85);
                if (photo != null) {
                  setModalState(() {
                    attachedPhotos.add(photo);
                  });
                  HapticFeedback.selectionClick();
                }
              } catch (_) {
                if (modalCtx.mounted) {
                  CustomToast.error(modalCtx, 'No se pudo cargar la imagen');
                }
              }
            }

            Future<void> sendByEmail() async {
              if (locationCtrl.text.trim().isEmpty && detailsCtrl.text.trim().isEmpty) {
                CustomToast.error(modalCtx, 'Por favor indica la ubicación o describe los hechos');
                return;
              }

              final now = DateTime.now();
              final dateFormatted = '${now.day}/${now.month}/${now.year}';
              final location = locationCtrl.text.trim().isNotEmpty ? locationCtrl.text.trim() : 'Lugar por verificar';
              final subject = Uri.encodeComponent('[ALERTA AMBIENTAL] - $location - $dateFormatted');

              final bodyText = StringBuffer();
              bodyText.writeln('CANAL DE ALERTA Y REPORTE AMBIENTAL — BAQUEANO NICARAGUA');
              bodyText.writeln('========================================================');
              bodyText.writeln('Tipo de Infracción: $selectedInfraction');
              bodyText.writeln('Ubicación / Coordenadas: $location');
              bodyText.writeln('Fecha y Hora del Suceso: ${now.toLocal()}');
              bodyText.writeln('');
              bodyText.writeln('DESCRIPCIÓN DETALLADA DE LOS HECHOS:');
              bodyText.writeln(detailsCtrl.text.trim().isNotEmpty ? detailsCtrl.text.trim() : 'Sin descripción adicional.');
              bodyText.writeln('');
              bodyText.writeln('DATOS DEL DENUNCIANTE:');
              if (isAnonymous) {
                bodyText.writeln('Condición: 100% ANÓNIMO Y CONFIDENCIAL (Protección al explorador garantizada por Baqueano)');
              } else {
                bodyText.writeln('Nombre: ${contactNameCtrl.text.trim()}');
                bodyText.writeln('Contacto: ${contactPhoneCtrl.text.trim()}');
              }
              bodyText.writeln('');
              bodyText.writeln('EVIDENCIAS ADJUNTAS:');
              bodyText.writeln('${attachedPhotos.length} fotografía(s) capturada(s) en el lugar.');
              bodyText.writeln('[POR FAVOR VERIFICA QUE TUS FOTOS O VIDEOS ESTÉN ADJUNTOS A ESTE CORREO]');
              bodyText.writeln('========================================================');
              bodyText.writeln('Canalizado por la plataforma oficial Baqueano para trámite ante MARENA, UAM y Policía Nacional.');

              final emailUri = Uri.parse('mailto:denuncias@baqueano.com?subject=$subject&body=${Uri.encodeComponent(bodyText.toString())}');

              Navigator.of(modalCtx).pop();
              try {
                await launchUrl(emailUri, mode: LaunchMode.externalApplication);
              } catch (_) {
                if (context.mounted) {
                  CustomToast.show(context, message: 'Copia denuncias@baqueano.com y envíanos tu reporte');
                }
              }
            }

            Future<void> sendByWhatsApp() async {
              final location = locationCtrl.text.trim().isNotEmpty ? locationCtrl.text.trim() : 'Por verificar';
              final msg = StringBuffer();
              msg.writeln('🚨 *ALERTA AMBIENTAL BAQUEANO*');
              msg.writeln('• *Infracción:* $selectedInfraction');
              msg.writeln('• *Ubicación:* $location');
              msg.writeln('• *Detalles:* ${detailsCtrl.text.trim()}');
              msg.writeln('• *Denunciante:* ${isAnonymous ? "Anónimo (Confidencial)" : contactNameCtrl.text.trim()}');
              msg.writeln('Adjunto fotos de evidencia en este chat.');

              final waUri = Uri.parse('https://wa.me/50588882222?text=${Uri.encodeComponent(msg.toString())}');
              Navigator.of(modalCtx).pop();
              try {
                await launchUrl(waUri, mode: LaunchMode.externalApplication);
              } catch (_) {
                if (context.mounted) {
                  CustomToast.show(context, message: 'Apertura de WhatsApp no disponible');
                }
              }
            }

            final navBarHeight = MediaQuery.of(modalCtx).padding.bottom;
            final keyboardHeight = MediaQuery.of(modalCtx).viewInsets.bottom;

            return SafeArea(
              bottom: true,
              child: Container(
                padding: EdgeInsets.only(
                  left: 20,
                  right: 20,
                  top: 20,
                  bottom: keyboardHeight + navBarHeight + 28,
                ),
                decoration: const BoxDecoration(
                  color: Color(0xFF071B22),
                  borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
                ),
                child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
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

                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.terracotta.withValues(alpha: 0.2),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.shield_rounded, color: AppColors.terracottaLight, size: 22),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'CANAL DE REPORTE AMBIENTAL',
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.goldLight,
                                  letterSpacing: 0.8,
                                ),
                              ),
                              Text(
                                'Formulario de Evidencia Legal',
                                style: GoogleFonts.montserrat(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close_rounded, color: Colors.white70),
                          onPressed: () => Navigator.of(modalCtx).pop(),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Tipo de Infracción
                    Text(
                      'Tipo de Infracción Observada:',
                      style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white70),
                    ),
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
                          value: selectedInfraction,
                          isExpanded: true,
                          dropdownColor: AppColors.bgDark,
                          icon: const Icon(Icons.arrow_drop_down, color: AppColors.gold),
                          items: infractionTypes.map((item) {
                            return DropdownMenuItem<String>(
                              value: item,
                              child: Text(
                                item,
                                style: GoogleFonts.inter(fontSize: 12.5, color: Colors.white),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            );
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) {
                              setModalState(() => selectedInfraction = val);
                            }
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Ubicación con botón GPS
                    Text(
                      'Ubicación Exacta o Coordenadas GPS:',
                      style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white70),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: locationCtrl,
                            style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
                            decoration: InputDecoration(
                              hintText: 'Ej: Sendero Volcán Telica, km 4...',
                              hintStyle: GoogleFonts.inter(color: AppColors.textMuted, fontSize: 12),
                              filled: true,
                              fillColor: AppColors.primaryDark,
                              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
                              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
                              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.gold)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.jungleGreen,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          onPressed: isLocating ? null : captureGps,
                          icon: isLocating
                              ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                              : const Icon(Icons.my_location_rounded, size: 16),
                          label: Text(
                            isLocating ? 'GPS...' : 'Mi GPS',
                            style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w700),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Descripción
                    Text(
                      'Descripción de los Hechos:',
                      style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white70),
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: detailsCtrl,
                      maxLines: 3,
                      style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
                      decoration: InputDecoration(
                        hintText: 'Detalla qué observaste: número aproximado de personas, herramientas, vehículos, fecha y hora...',
                        hintStyle: GoogleFonts.inter(color: AppColors.textMuted, fontSize: 12),
                        filled: true,
                        fillColor: AppColors.primaryDark,
                        contentPadding: const EdgeInsets.all(12),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.gold)),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Evidencia Fotográfica
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Evidencia Fotográfica (${attachedPhotos.length}):',
                          style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white70),
                        ),
                        Row(
                          children: [
                            IconButton(
                              icon: const Icon(Icons.camera_alt_rounded, color: AppColors.gold, size: 20),
                              tooltip: 'Tomar foto',
                              onPressed: () => pickPhoto(ImageSource.camera),
                            ),
                            IconButton(
                              icon: const Icon(Icons.photo_library_rounded, color: AppColors.goldLight, size: 20),
                              tooltip: 'Galería',
                              onPressed: () => pickPhoto(ImageSource.gallery),
                            ),
                          ],
                        ),
                      ],
                    ),
                    if (attachedPhotos.isNotEmpty) ...[
                      const SizedBox(height: 6),
                      SizedBox(
                        height: 70,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: attachedPhotos.length,
                          separatorBuilder: (_, __) => const SizedBox(width: 8),
                          itemBuilder: (ctx, idx) {
                            final file = attachedPhotos[idx];
                            return Stack(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: Image.file(
                                    File(file.path),
                                    width: 70,
                                    height: 70,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                                Positioned(
                                  top: 2,
                                  right: 2,
                                  child: GestureDetector(
                                    onTap: () {
                                      setModalState(() {
                                        attachedPhotos.removeAt(idx);
                                      });
                                    },
                                    child: Container(
                                      padding: const EdgeInsets.all(2),
                                      decoration: const BoxDecoration(
                                        color: Colors.black87,
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(Icons.close, color: Colors.white, size: 14),
                                    ),
                                  ),
                                ),
                              ],
                            );
                          },
                        ),
                      ),
                    ],
                    const SizedBox(height: 12),

                    // Anonimato y Confidencialidad
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppColors.primaryDark,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.borderLight),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            isAnonymous ? Icons.lock_outline_rounded : Icons.person_outline_rounded,
                            color: isAnonymous ? AppColors.jungleGreenLight : AppColors.goldLight,
                            size: 20,
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'Reporte 100% Anónimo y Confidencial',
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                          ),
                          Switch(
                            value: isAnonymous,
                            activeTrackColor: AppColors.jungleGreen,
                            activeThumbColor: Colors.white,
                            onChanged: (val) {
                              setModalState(() => isAnonymous = val);
                            },
                          ),
                        ],
                      ),
                    ),
                    if (!isAnonymous) ...[
                      const SizedBox(height: 8),
                      TextField(
                        controller: contactNameCtrl,
                        style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
                        decoration: InputDecoration(
                          hintText: 'Tu nombre completo (confidencial)',
                          hintStyle: GoogleFonts.inter(color: AppColors.textMuted, fontSize: 12),
                          filled: true,
                          fillColor: AppColors.primaryDark,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.borderLight)),
                        ),
                      ),
                      const SizedBox(height: 6),
                      TextField(
                        controller: contactPhoneCtrl,
                        style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
                        decoration: InputDecoration(
                          hintText: 'Teléfono o correo de contacto',
                          hintStyle: GoogleFonts.inter(color: AppColors.textMuted, fontSize: 12),
                          filled: true,
                          fillColor: AppColors.primaryDark,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.borderLight)),
                        ),
                      ),
                    ],

                    const SizedBox(height: 18),

                    // Botones de Despacho
                    BaqueanoButton(
                      text: 'ENVIAR DENUNCIA FORMAL A BAQUEANO',
                      icon: const Icon(Icons.mail_outline_rounded, size: 18),
                      variant: BaqueanoButtonVariant.primary,
                      height: 48,
                      width: double.infinity,
                      onPressed: sendByEmail,
                    ),
                    const SizedBox(height: 8),
                    BaqueanoButton(
                      text: 'Notificar por WhatsApp de Guardia 24/7',
                      icon: const Icon(Icons.chat_rounded, size: 18),
                      variant: BaqueanoButtonVariant.gold,
                      height: 42,
                      width: double.infinity,
                      onPressed: sendByWhatsApp,
                    ),
                    const SizedBox(height: 36),
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

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    return ResponsiveScaffold(
      currentIndex: 0,
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.symmetric(
          horizontal: isDesktop ? 48.0 : 20.0,
          vertical: 24.0,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SectionHeader(
              tag: 'OBJETIVO PRINCIPAL DE BAQUEANO',
              title: '🌿 Campaña Ambiental & Cuidado de Nuestros Recursos',
              subtitle: 'Sensibilización activa para turistas nacionales e internacionales: proteger los volcanes, lagunas, selvas y arrecifes de Nicaragua.',
            ),
            const SizedBox(height: 18),

            // Hero Banner Monumental de Sensibilización
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    const Color(0xFF064E3B), // Verde bosque profundo
                    AppColors.primaryDark,
                    const Color(0xFF082B35),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppColors.jungleGreenLight, width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.jungleGreen.withValues(alpha: 0.3),
                    blurRadius: 22,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.jungleGreen.withValues(alpha: 0.25),
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.jungleGreenLight),
                        ),
                        child: const Text('🇳🇮', style: TextStyle(fontSize: 32)),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'TURISMO REGENERATIVO & SOSTENIBLE',
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: AppColors.goldLight,
                                letterSpacing: 1.0,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              'Nicaragua no se visita: se cuida, se respeta y se honra.',
                              style: GoogleFonts.montserrat(
                                fontSize: 16,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Cada volcán que escalas, cada laguna cratérica donde nadas y cada playa donde desovan las tortugas marinas es el hogar de comunidades campesinas e indígenas. Nuestro compromiso innegociable es garantizar que tu visita deje una huella positiva imborrable en las familias locales y cero impacto destructivo en la naturaleza.',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: Colors.white.withValues(alpha: 0.88),
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 10,
                    runSpacing: 8,
                    children: [
                      _buildPillTag('🐢 78 Áreas Protegidas', AppColors.jungleGreenLight),
                      _buildPillTag('🌊 3 Reservas de Biosfera UNESCO', AppColors.goldLight),
                      _buildPillTag('🚫 0% Tolerancia a la Basura', AppColors.terracottaLight),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            // Título de Mandamientos
            Text(
              'LOS 8 MANDAMIENTOS DEL VIAJERO RESPONSABLE',
              style: GoogleFonts.spaceGrotesk(
                fontSize: 13,
                fontWeight: FontWeight.w800,
                color: AppColors.goldLight,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Reglas de oro para preservar la biodiversidad nicaragüense durante tus expediciones:',
              style: GoogleFonts.inter(fontSize: 13, color: Colors.white70),
            ),
            const SizedBox(height: 16),

            // Lista de los 8 Mandamientos Ambientales
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _commandments.length,
              separatorBuilder: (_, __) => const SizedBox(height: 14),
              itemBuilder: (context, index) {
                final item = _commandments[index];
                final Color accentColor = item['color'] as Color;

                return GlassContainer(
                  padding: const EdgeInsets.all(18),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: accentColor.withValues(alpha: 0.4), width: 1.2),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: accentColor.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: accentColor.withValues(alpha: 0.6)),
                        ),
                        child: Text(item['icon'] as String, style: const TextStyle(fontSize: 26)),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item['title'] as String,
                              style: GoogleFonts.montserrat(
                                fontSize: 15,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              item['highlight'] as String,
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w700,
                                color: accentColor,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              item['description'] as String,
                              style: GoogleFonts.inter(
                                fontSize: 12.5,
                                color: Colors.white70,
                                height: 1.45,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),

            const SizedBox(height: 32),

            // SECCIÓN INTERACTIVA: FIRMA DEL COMPROMISO AMBIENTAL
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                gradient: AppGradients.volcanicHero,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppColors.gold, width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.gold.withValues(alpha: 0.15),
                    blurRadius: 20,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.gold.withValues(alpha: 0.2),
                          shape: BoxShape.circle,
                        ),
                        child: const Text('📜', style: TextStyle(fontSize: 26)),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'PLEDGE DEL EXPLORADOR BAQUEANO',
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: AppColors.goldLight,
                                letterSpacing: 0.8,
                              ),
                            ),
                            Text(
                              'Firma tu Compromiso Verde Oficial',
                              style: GoogleFonts.montserrat(
                                fontSize: 17,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text(
                    '«Como explorador consciente en suelo nicaragüense, prometo honrar la naturaleza, respetar a los baqueanos campesinos, no dejar ningún rastro de basura, proteger la fauna silvestre y consumir comercio justo para que las familias rurales sigan siendo las guardianas de nuestras selvas y volcanes.»',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontStyle: FontStyle.italic,
                      color: Colors.white.withValues(alpha: 0.9),
                      height: 1.45,
                    ),
                  ),
                  const SizedBox(height: 18),

                  if (_hasSignedPledge) ...[
                    // Estado Firmado y Certificado
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.primaryDark,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.jungleGreenLight, width: 1.2),
                      ),
                      child: Column(
                        children: [
                          const Icon(Icons.verified_rounded, color: AppColors.jungleGreenLight, size: 36),
                          const SizedBox(height: 6),
                          Text(
                            '¡COMPROMISO VERDE FIRMADO!',
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: AppColors.jungleGreenLight,
                              letterSpacing: 1.0,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Guardián(a) Oficial: ${_nameController.text.trim()}',
                            style: GoogleFonts.montserrat(
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 14),
                          BaqueanoButton(
                            text: 'Compartir mi Compromiso en WhatsApp',
                            icon: const Icon(Icons.share_rounded, size: 18),
                            variant: BaqueanoButtonVariant.gold,
                            height: 44,
                            width: double.infinity,
                            onPressed: _sharePledge,
                          ),
                        ],
                      ),
                    ),
                  ] else ...[
                    // Formulario de Firma
                    TextField(
                      controller: _nameController,
                      style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                      cursorColor: AppColors.gold,
                      decoration: InputDecoration(
                        labelText: 'Tu Nombre Completo para el Certificado',
                        labelStyle: GoogleFonts.spaceGrotesk(color: AppColors.goldLight, fontSize: 13),
                        hintText: 'Ej: María José Morales',
                        hintStyle: GoogleFonts.inter(color: Colors.white38, fontSize: 13),
                        prefixIcon: const Icon(Icons.edit_note_rounded, color: AppColors.gold),
                        filled: true,
                        fillColor: AppColors.primaryDark,
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: const BorderSide(color: AppColors.borderLight),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: const BorderSide(color: AppColors.gold, width: 1.5),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    BaqueanoButton(
                      text: 'FIRMAR COMPROMISO VERDE AHORA',
                      icon: const Icon(Icons.check_circle_outline_rounded, size: 18),
                      variant: BaqueanoButtonVariant.primary,
                      height: 48,
                      width: double.infinity,
                      onPressed: _signPledge,
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 24),

            const SizedBox(height: 24),

            // CANAL DE ALERTA Y REPORTE AMBIENTAL — BAQUEANO
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: const Color(0xFF091C24),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppColors.terracottaLight.withValues(alpha: 0.6), width: 1.4),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.terracotta.withValues(alpha: 0.15),
                    blurRadius: 18,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.terracotta.withValues(alpha: 0.25),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.shield_rounded, color: AppColors.terracottaLight, size: 26),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'CANAL INSTITUCIONAL OFICIAL',
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 10.5,
                                fontWeight: FontWeight.w800,
                                color: AppColors.terracottaLight,
                                letterSpacing: 1.0,
                              ),
                            ),
                            Text(
                              'Alerta y Reporte Ambiental — Baqueano',
                              style: GoogleFonts.montserrat(
                                fontSize: 16.5,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text(
                    '«Si durante tu recorrido presencias actividades ilegales como caza furtiva, tala no autorizada, extracción de especies o vertido de contaminantes, repórtalo directamente a nuestro equipo. En Baqueano canalizamos y tramitamos formalmente la denuncia con las evidencias correspondientes ante las autoridades ambientales (MARENA, Alcaldía y Policía Nacional).»',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontStyle: FontStyle.italic,
                      color: Colors.white.withValues(alpha: 0.9),
                      height: 1.45,
                    ),
                  ),
                  const SizedBox(height: 18),

                  // 4 Pilares del Canal
                  Text(
                    'VENTAJAS ESTRATÉGICAS DE REPORTAR CON BAQUEANO:',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: AppColors.goldLight,
                      letterSpacing: 0.8,
                    ),
                  ),
                  const SizedBox(height: 10),
                  _buildStrategicPillar('🛡️', 'Filtro y Verificación', 'El equipo local valida si el reporte es real, clasifica la gravedad y recopila datos clave antes de activar a las autoridades.'),
                  const SizedBox(height: 8),
                  _buildStrategicPillar('📁', 'Custodia de Evidencias', 'Recibe fotografías, videos, audios y coordenadas GPS organizados en un expediente legal formal.'),
                  const SizedBox(height: 8),
                  _buildStrategicPillar('🔒', 'Protección y Anonimato', 'Evita trámites policiales directos o barreras de idioma; Baqueano actúa como tu canal formal y protector del territorio.'),
                  const SizedBox(height: 8),
                  _buildStrategicPillar('⚖️', 'Denuncia Formal Fundamentada', 'Presentación con respaldo técnico ante MARENA, la Unidad Ambiental de la Alcaldía (UAM) y la Policía Nacional.'),

                  const SizedBox(height: 20),

                  // Tarjeta del correo institucional oficial
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.primaryDark,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.gold.withValues(alpha: 0.4)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.mark_email_read_rounded, color: AppColors.goldLight, size: 22),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'CORREO DE EVIDENCIAS LEGALES:',
                                style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.textMuted),
                              ),
                              Text(
                                'denuncias@baqueano.com',
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.goldLight,
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.copy_rounded, color: AppColors.gold, size: 18),
                          tooltip: 'Copiar correo',
                          onPressed: _copyOfficialEmail,
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  BaqueanoButton(
                    text: 'REDACTAR REPORTE / ENVIAR EVIDENCIAS',
                    icon: const Icon(Icons.add_alert_rounded, size: 18),
                    variant: BaqueanoButtonVariant.primary,
                    height: 48,
                    width: double.infinity,
                    onPressed: () => _showEnvironmentalReportModal(context),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildPillTag(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.5)),
      ),
      child: Text(
        text,
        style: GoogleFonts.spaceGrotesk(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: color,
        ),
      ),
    );
  }

  Widget _buildStrategicPillar(String icon, String title, String description) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(icon, style: const TextStyle(fontSize: 16)),
        const SizedBox(width: 8),
        Expanded(
          child: RichText(
            text: TextSpan(
              style: GoogleFonts.inter(fontSize: 12, color: Colors.white70, height: 1.4),
              children: [
                TextSpan(
                  text: '$title: ',
                  style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w800, color: Colors.white),
                ),
                TextSpan(text: description),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
