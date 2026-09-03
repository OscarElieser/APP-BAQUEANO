// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SECCIÓN DE CAPTACIÓN & REGISTRO DE NEGOCIOS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Brindar una puerta de entrada directa, formal y de alta gama para que dueños
//   de hoteles, restaurantes, cooperativas campesinas, operadoras de aventura
//   y guías nativos puedan postular su negocio para figurar en la app Baqueano.
// - Eliminar intermediarios abusivos y empoderar la economía turística nicaragüense,
//   ofreciendo captación de clientes nacionales y extranjeros en un solo lugar.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Contenedor con gradiente volcánico nocturno (`#082B35`, `#0F172A`), bordes dorados
//   sutiles con `AppColors.gold` y efectos de sombra de profundidad.
// - Micro-tarjetas de beneficios para el afiliado (tráfico directo, visibilidad global,
//   sello de confianza oficial).
// - Formulario modal interactivo (`_showRegisterBusinessModal`) con validación de
//   campos clave (nombre del negocio, rubro, departamento, contacto y WhatsApp).
// - Despacho dual: Envío formal a `negocios@baqueano.com` y enlace directo a WhatsApp
//   con el equipo comercial y de alianzas estratégicas.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGET EXPUESTO):
// - `AdvertiseBusinessSection`: Banner y llamado a la acción para la pantalla principal.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/baqueano_button.dart';
import '../../../core/widgets/custom_toast.dart';

class AdvertiseBusinessSection extends StatefulWidget {
  const AdvertiseBusinessSection({super.key});

  @override
  State<AdvertiseBusinessSection> createState() => _AdvertiseBusinessSectionState();
}

class _AdvertiseBusinessSectionState extends State<AdvertiseBusinessSection> {
  void _openRegisterBusinessModal(BuildContext context) {
    HapticFeedback.lightImpact();

    final formKey = GlobalKey<FormState>();
    final businessNameCtrl = TextEditingController();
    final contactNameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final linkCtrl = TextEditingController();
    final descriptionCtrl = TextEditingController();

    String selectedCategory = 'Hospedaje / Eco-Lodges / Cabañas';
    String selectedDepartment = 'Managua';

    final List<String> categories = const [
      'Hospedaje / Eco-Lodges / Cabañas',
      'Gastronomía / Restaurantes / Comedores',
      'Guías Nativos / Tours y Sandboarding',
      'Cooperativas Campesinas / Café y Cacao',
      'Transporte / Alquiler / Lanchas',
      'Artesanías / Talleres Culturales',
      'Ecoturismo y Campamentos de Aventura',
      'Otro Servicio Turístico',
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalCtx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            Future<void> submitByEmail() async {
              if (!formKey.currentState!.validate()) {
                return;
              }

              final bizName = businessNameCtrl.text.trim();
              final contact = contactNameCtrl.text.trim();
              final phone = phoneCtrl.text.trim();
              final email = emailCtrl.text.trim();
              final link = linkCtrl.text.trim();
              final desc = descriptionCtrl.text.trim();

              final subject = Uri.encodeComponent('[REGISTRO DE NEGOCIO] - $bizName ($selectedDepartment)');
              final bodyBuffer = StringBuffer();
              bodyBuffer.writeln('SOLICITUD DE AFILIACIÓN COMERCIAL — APP BAQUEANO');
              bodyBuffer.writeln('====================================================');
              bodyBuffer.writeln('Nombre Comercial: $bizName');
              bodyBuffer.writeln('Rubro o Categoría: $selectedCategory');
              bodyBuffer.writeln('Departamento / Ubicación: $selectedDepartment');
              bodyBuffer.writeln('Persona de Contacto: $contact');
              bodyBuffer.writeln('Teléfono / WhatsApp: $phone');
              bodyBuffer.writeln('Correo Electrónico: $email');
              if (link.isNotEmpty) {
                bodyBuffer.writeln('Red Social o Web: $link');
              }
              bodyBuffer.writeln('');
              bodyBuffer.writeln('DESCRIPCIÓN DE LA PROPUESTA / SERVICIOS:');
              bodyBuffer.writeln(desc.isNotEmpty ? desc : 'Deseo que me contacten para afiliar mi negocio.');
              bodyBuffer.writeln('====================================================');
              bodyBuffer.writeln('Enviado desde la app Baqueano Nicaragua.');

              final emailUri = Uri.parse('mailto:negocios@baqueano.com?subject=$subject&body=${Uri.encodeComponent(bodyBuffer.toString())}');

              Navigator.of(modalCtx).pop();
              try {
                await launchUrl(emailUri, mode: LaunchMode.externalApplication);
                if (context.mounted) {
                  CustomToast.success(context, '¡Solicitud preparada! Revisa tu cliente de correo para enviarla.');
                }
              } catch (_) {
                if (context.mounted) {
                  CustomToast.show(context, message: 'Escríbenos directamente a negocios@baqueano.com');
                }
              }
            }

            Future<void> submitByWhatsApp() async {
              if (businessNameCtrl.text.trim().isEmpty || phoneCtrl.text.trim().isEmpty) {
                CustomToast.error(modalCtx, 'Ingresa al menos el nombre del negocio y tu teléfono');
                return;
              }

              final bizName = businessNameCtrl.text.trim();
              final contact = contactNameCtrl.text.trim().isNotEmpty ? contactNameCtrl.text.trim() : 'Propietario(a)';
              final phone = phoneCtrl.text.trim();

              final msg = StringBuffer();
              msg.writeln('🤝 *SOLICITUD DE AFILIACIÓN COMERCIAL BAQUEANO*');
              msg.writeln('• *Negocio:* $bizName');
              msg.writeln('• *Rubro:* $selectedCategory');
              msg.writeln('• *Departamento:* $selectedDepartment');
              msg.writeln('• *Contacto:* $contact ($phone)');
              if (descriptionCtrl.text.trim().isNotEmpty) {
                msg.writeln('• *Detalles:* ${descriptionCtrl.text.trim()}');
              }
              msg.writeln('Deseo que mi negocio figure en la app Baqueano. ¡Quedo atento a su respuesta!');

              final waUri = Uri.parse('https://wa.me/50588883333?text=${Uri.encodeComponent(msg.toString())}');

              Navigator.of(modalCtx).pop();
              try {
                await launchUrl(waUri, mode: LaunchMode.externalApplication);
              } catch (_) {
                if (context.mounted) {
                  CustomToast.show(context, message: 'WhatsApp comercial no disponible');
                }
              }
            }

            final navBarHeight = MediaQuery.of(modalCtx).padding.bottom;
            final keyboardHeight = MediaQuery.of(modalCtx).viewInsets.bottom;

            return SafeArea(
              bottom: true,
              child: Container(
                padding: EdgeInsets.only(
                  left: 22,
                  right: 22,
                  top: 20,
                  bottom: keyboardHeight + navBarHeight + 28,
                ),
                decoration: const BoxDecoration(
                  color: Color(0xFF071E26),
                  borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
                ),
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                child: Form(
                  key: formKey,
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
                              color: AppColors.gold.withValues(alpha: 0.2),
                              shape: BoxShape.circle,
                              border: Border.all(color: AppColors.goldLight),
                            ),
                            child: const Icon(Icons.storefront_rounded, color: AppColors.goldLight, size: 22),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'ALIANZAS & AFILIACIÓN COMERCIAL',
                                  style: GoogleFonts.spaceGrotesk(
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.goldLight,
                                    letterSpacing: 0.8,
                                  ),
                                ),
                                Text(
                                  'Registra tu Negocio en Baqueano',
                                  style: GoogleFonts.montserrat(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w900,
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
                      const SizedBox(height: 8),

                      Text(
                        'Completa tus datos comerciales y nuestro equipo te contactará en menos de 24 horas para verificar y activar tu ficha destacada.',
                        style: GoogleFonts.inter(fontSize: 12, color: Colors.white70, height: 1.4),
                      ),
                      const SizedBox(height: 16),

                      // Nombre Comercial
                      Text('Nombre Comercial del Negocio:', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white)),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: businessNameCtrl,
                        style: GoogleFonts.inter(fontSize: 13.5, color: Colors.white),
                        decoration: _buildInputDecoration('Ej: Eco-Lodge Mirador Volcánico', Icons.business_rounded),
                        validator: (v) => (v == null || v.trim().isEmpty) ? 'Ingresa el nombre del negocio' : null,
                      ),
                      const SizedBox(height: 14),

                      // Rubro o Categoría
                      Text('Categoría o Rubro:', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white)),
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
                            value: selectedCategory,
                            isExpanded: true,
                            dropdownColor: const Color(0xFF082B35),
                            icon: const Icon(Icons.arrow_drop_down, color: AppColors.gold),
                            items: categories.map((cat) {
                              return DropdownMenuItem<String>(
                                value: cat,
                                child: Text(cat, style: GoogleFonts.inter(fontSize: 13, color: Colors.white)),
                              );
                            }).toList(),
                            onChanged: (val) {
                              if (val != null) {
                                setModalState(() => selectedCategory = val);
                              }
                            },
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Departamento
                      Text('Departamento donde opera:', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white)),
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
                            value: selectedDepartment,
                            isExpanded: true,
                            dropdownColor: const Color(0xFF082B35),
                            icon: const Icon(Icons.arrow_drop_down, color: AppColors.gold),
                            items: CatalogData.departments.where((d) => d != 'Todos').map((dept) {
                              return DropdownMenuItem<String>(
                                value: dept,
                                child: Text(dept, style: GoogleFonts.inter(fontSize: 13, color: Colors.white)),
                              );
                            }).toList(),
                            onChanged: (val) {
                              if (val != null) {
                                setModalState(() => selectedDepartment = val);
                              }
                            },
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Persona de Contacto
                      Text('Persona de Contacto:', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white)),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: contactNameCtrl,
                        style: GoogleFonts.inter(fontSize: 13.5, color: Colors.white),
                        decoration: _buildInputDecoration('Nombre y Apellido', Icons.person_outline_rounded),
                        validator: (v) => (v == null || v.trim().isEmpty) ? 'Ingresa tu nombre' : null,
                      ),
                      const SizedBox(height: 14),

                      // Teléfono / WhatsApp
                      Text('Teléfono o WhatsApp:', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white)),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: phoneCtrl,
                        keyboardType: TextInputType.phone,
                        style: GoogleFonts.inter(fontSize: 13.5, color: Colors.white),
                        decoration: _buildInputDecoration('+505 8888-0000', Icons.phone_android_rounded),
                        validator: (v) => (v == null || v.trim().isEmpty) ? 'Ingresa tu número de contacto' : null,
                      ),
                      const SizedBox(height: 14),

                      // Correo
                      Text('Correo Electrónico:', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white)),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: emailCtrl,
                        keyboardType: TextInputType.emailAddress,
                        style: GoogleFonts.inter(fontSize: 13.5, color: Colors.white),
                        decoration: _buildInputDecoration('contacto@tunegocio.com', Icons.alternate_email_rounded),
                      ),
                      const SizedBox(height: 14),

                      // Red Social o Web
                      Text('Instagram, Facebook o Web (Opcional):', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white70)),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: linkCtrl,
                        style: GoogleFonts.inter(fontSize: 13.5, color: Colors.white),
                        decoration: _buildInputDecoration('@tu_negocio_nicaragua', Icons.link_rounded),
                      ),
                      const SizedBox(height: 14),

                      // Breve descripción
                      Text('Breve descripción de tus servicios:', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white70)),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: descriptionCtrl,
                        maxLines: 2,
                        style: GoogleFonts.inter(fontSize: 13.5, color: Colors.white),
                        decoration: _buildInputDecoration('Capacidad de alojamiento, especialidades gastronómicas o rutas guiadas...', Icons.notes_rounded),
                      ),
                      const SizedBox(height: 20),

                      // Botones de acción
                      BaqueanoButton(
                        text: 'ENVIAR SOLICITUD DE REGISTRO',
                        icon: const Icon(Icons.send_rounded, size: 18),
                        variant: BaqueanoButtonVariant.primary,
                        height: 48,
                        width: double.infinity,
                        onPressed: submitByEmail,
                      ),
                      const SizedBox(height: 10),
                      BaqueanoButton(
                        text: 'Hablar con Asesor Comercial en WhatsApp',
                        icon: const Icon(Icons.chat_rounded, size: 18),
                        variant: BaqueanoButtonVariant.gold,
                        height: 42,
                        width: double.infinity,
                        onPressed: submitByWhatsApp,
                      ),
                      const SizedBox(height: 36),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
        );
      },
    );
  }

  InputDecoration _buildInputDecoration(String hint, IconData icon) {
    return InputDecoration(
      hintText: hint,
      hintStyle: GoogleFonts.inter(color: AppColors.textMuted, fontSize: 12.5),
      prefixIcon: Icon(icon, color: AppColors.gold, size: 20),
      filled: true,
      fillColor: AppColors.primaryDark,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.gold, width: 1.4)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: isDesktop ? 48.0 : 20.0,
        vertical: 16.0,
      ),
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.all(isDesktop ? 32.0 : 22.0),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              const Color(0xFF0F172A), // Noche Profunda
              AppColors.primaryDark,
              const Color(0xFF082B35), // Petróleo Volcánico
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(26),
          border: Border.all(color: AppColors.gold.withValues(alpha: 0.65), width: 1.5),
          boxShadow: [
            BoxShadow(
              color: AppColors.gold.withValues(alpha: 0.16),
              blurRadius: 24,
              offset: const Offset(0, 8),
            ),
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.4),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Badge superior exclusivo
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
              decoration: BoxDecoration(
                color: AppColors.gold.withValues(alpha: 0.18),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.gold, width: 1),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.workspace_premium_rounded, color: AppColors.goldLight, size: 16),
                  const SizedBox(width: 6),
                  Text(
                    'IMPULSA TU NEGOCIO CON BAQUEANO',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: AppColors.goldLight,
                      letterSpacing: 1.0,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Titular Monumental
            Text(
              '¿Quieres que tu negocio aparezca aquí?',
              style: GoogleFonts.montserrat(
                fontSize: isDesktop ? 24 : 20,
                fontWeight: FontWeight.w900,
                color: Colors.white,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 8),

            // Subtítulo comercial
            Text(
              'Conecta de inmediato con miles de exploradores nacionales y extranjeros. Sin intermediarios abusivos: las reservas, llamadas y consultas van 100% directas a tu WhatsApp o teléfono.',
              style: GoogleFonts.inter(
                fontSize: 13.5,
                color: Colors.white.withValues(alpha: 0.9),
                height: 1.45,
              ),
            ),
            const SizedBox(height: 18),

            // 3 Pilares de Beneficio
            LayoutBuilder(
              builder: (context, constraints) {
                final isNarrow = constraints.maxWidth < 650;
                final cards = [
                  _buildBenefitItem('🚀', 'Tráfico Directo 100%', 'Clientes directos a tu WhatsApp o teléfono, cero comisiones por reserva.'),
                  _buildBenefitItem('🌍', 'Alcance Global', 'Visibilidad verificada ante viajeros locales e internacionales.'),
                  _buildBenefitItem('🧭', 'Sello Oficial', 'Ficha destacada en catálogo cultural, mapas GPS y asistente inteligente.'),
                ];

                if (isNarrow) {
                  return Column(
                    children: cards.map((c) => Padding(padding: const EdgeInsets.only(bottom: 10), child: c)).toList(),
                  );
                }

                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: cards.map((c) => Expanded(child: Padding(padding: const EdgeInsets.symmetric(horizontal: 6), child: c))).toList(),
                );
              },
            ),

            const SizedBox(height: 20),

            // Barra de acción y botón
            Row(
              children: [
                Expanded(
                  child: BaqueanoButton(
                    text: 'REGISTRAR MI NEGOCIO AHORA',
                    icon: const Icon(Icons.rocket_launch_rounded, size: 18),
                    variant: BaqueanoButtonVariant.primary,
                    height: 50,
                    onPressed: () => _openRegisterBusinessModal(context),
                  ),
                ),
                const SizedBox(width: 10),
                BaqueanoButton(
                  text: 'Ver Planes',
                  icon: const Icon(Icons.workspace_premium_rounded, size: 18),
                  variant: BaqueanoButtonVariant.outline,
                  height: 50,
                  onPressed: () => context.push('/planes-negocios'),
                ),
              ],
            ),
            const SizedBox(height: 10),

            Row(
              children: [
                const Icon(Icons.bolt_rounded, color: AppColors.gold, size: 15),
                const SizedBox(width: 4),
                Text(
                  'Respuesta garantizada en menos de 24 horas por nuestro equipo comercial.',
                  style: GoogleFonts.inter(
                    fontSize: 11.5,
                    color: Colors.white60,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBenefitItem(String emoji, String title, String description) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.primaryDark.withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight, width: 0.8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(emoji, style: const TextStyle(fontSize: 20)),
          const SizedBox(height: 6),
          Text(
            title,
            style: GoogleFonts.montserrat(
              fontSize: 13,
              fontWeight: FontWeight.w800,
              color: AppColors.goldLight,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            description,
            style: GoogleFonts.inter(
              fontSize: 11.5,
              color: Colors.white70,
              height: 1.35,
            ),
          ),
        ],
      ),
    );
  }
}
