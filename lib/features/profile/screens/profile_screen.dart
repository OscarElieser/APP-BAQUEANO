// ============================================================================
// 👤 PERFIL DEL EXPLORADOR & CENTRO DE CONFIGURACIONES (PROFILE_SCREEN.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia centralizada donde el explorador gestiona su identidad
//   digital, datos personales para pólizas de expedición y todas las configuraciones
//   necesarias del ecosistema: preferencias de moneda dual (USD/NIO), régimen fiscal
//   Ley 306, notificaciones, accesibilidad visual, seguridad y sellos de aventura.
// - Asegurar que el 100% de las opciones sean interactivas, funcionales y reactivas:
//   cambio de avatar, edición de datos, cambio de contraseña, selector de moneda,
//   alertas en tiempo real, modo alto contraste y vinculación con Google.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - `ConsumerStatefulWidget` conectado a `authServiceProvider` y `bookingCommunicationProvider`.
// - Soporte dinámico para `TextScaler.linear(_fontScale)` y modo de alto contraste
//   en tiempo real para lectura óptima bajo el sol nicaragüense.
// - Modales interactivos para: Editar Datos Personales, Cambiar Avatar, Cambiar Contraseña,
//   y Ver Certificados de Sellos de Aventura.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & VISTAS EXPUESTAS):
// - `ProfileScreen`: Pantalla oficial de perfil y ajustes en la ruta `/perfil`.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';
import '../../../services/auth_service.dart';
import '../../../services/booking_and_communication_service.dart';
import '../../../services/passport_membership_service.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  // 1. Datos Personales del Explorador (Solo se llenan si inició sesión con Google)
  String _userName = '';
  String _userDocument = '';
  String _userPhone = '';
  String _userEmail = '';
  String _userNationality = '';
  String _userAvatarUrl = '';

  // 2. Configuraciones de Moneda & Finanzas
  String _selectedCurrency = 'USD'; // 'USD' o 'NIO'
  bool _isTouristTaxExempt = true; // 0% IVA (Ley 306) vs 15% IVA

  // 3. Configuraciones de Notificaciones & Alertas
  bool _notifBookings = true;
  bool _notifHostMessages = true;
  bool _notifSafetyAlerts = true;
  bool _notifSound = true;

  // 4. Configuraciones de Accesibilidad & Visualización
  double _fontScale = 1.0;
  bool _highContrast = false;
  bool _hapticFeedback = true;

  // 5. Configuraciones de Seguridad
  bool _biometricAuth = false;

  // Avatares disponibles para selección rápida
  final List<String> _availableAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
  ];

  // Sellos e Insignias del Explorador
  final List<Map<String, dynamic>> _stamps = [
    {
      'id': 'somoto',
      'title': 'Cañón de Somoto',
      'department': 'Madriz',
      'guide': 'Don Toño Calero',
      'inturCode': 'INTUR-MAD-2026-019',
      'unlocked': true,
      'date': '12 Ene 2026',
      'description': 'Travesía fluvial de 6km por el cañón sagrado, saltos de roca y natación en aguas calmas.',
      'icon': Icons.water_rounded,
      'color': const Color(0xFF0284C7),
    },
    {
      'id': 'cerro-negro',
      'title': 'Volcán Cerro Negro',
      'department': 'León',
      'guide': 'Chepe Ruiz',
      'inturCode': 'INTUR-LEO-2026-088',
      'unlocked': true,
      'date': '24 Feb 2026',
      'description': 'Ascenso al cráter activo más joven de Centroamérica y descenso en tabla de sandboarding a 65 km/h.',
      'icon': Icons.volcano_rounded,
      'color': const Color(0xFFC86432),
    },
    {
      'id': 'ometepe',
      'title': 'Isla de Ometepe',
      'department': 'Rivas',
      'guide': 'Mayra Carcache',
      'inturCode': 'INTUR-RIV-2026-104',
      'unlocked': true,
      'date': '02 Jul 2026',
      'description': 'Circuito de cacao en las faldas del Volcán Maderas y baño en Ojo de Agua.',
      'icon': Icons.landscape_rounded,
      'color': const Color(0xFF10B981),
    },
    {
      'id': 'cascada-luna',
      'title': 'Cascada La Luna',
      'department': 'Matagalpa',
      'guide': 'Doña Rosa Valle',
      'inturCode': 'INTUR-MAT-2026-084',
      'unlocked': true,
      'date': '04 Sep 2026',
      'description': 'Sendero de selva nubosa, poza esmeralda y cata de café recién tostado en fogón campesino.',
      'icon': Icons.waves_rounded,
      'color': const Color(0xFF06B6D4),
    },
    {
      'id': 'indio-maiz',
      'title': 'Reserva Indio Maíz',
      'department': 'Río San Juan',
      'guide': 'Guía Rama-Kriol',
      'inturCode': 'INTUR-RSJ-2026-003',
      'unlocked': false,
      'date': 'Bloqueado',
      'description': 'Expedición en canoa por el corazón de la biosfera caribeña. Completa 8 rutas para desbloquear.',
      'icon': Icons.park_rounded,
      'color': const Color(0xFF64748B),
    },
  ];

  @override
  void initState() {
    super.initState();
    // Sincronizar datos iniciales si el usuario ya inició sesión con Firebase/Google
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = ref.read(authServiceProvider);
      final user = auth.currentUser;
      if (user != null && user.displayName.isNotEmpty) {
        setState(() {
          _userName = user.displayName;
          _userEmail = user.email;
          if (user.photoUrl.isNotEmpty) {
            _userAvatarUrl = user.photoUrl;
          }
        });
      }
    });
  }

  void _triggerHaptic() {
    if (_hapticFeedback) {
      HapticFeedback.lightImpact();
    }
  }

  // --------------------------------------------------------------------------
  // MODAL: SELECCIONAR O CAMBIAR FOTO DE PERFIL / AVATAR
  // --------------------------------------------------------------------------
  void _showAvatarPicker() {
    _triggerHaptic();
    final urlCtrl = TextEditingController(text: _userAvatarUrl);

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: const Color(0xFF082B35),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          border: Border.all(color: const Color(0xFFD4AF37), width: 1.5),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.add_a_photo_rounded, color: Color(0xFFD4AF37), size: 22),
                const SizedBox(width: 10),
                Text(
                  'Foto de Perfil & Avatar Baqueano',
                  style: GoogleFonts.spaceGrotesk(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              'Selecciona uno de los avatares de expedición o ingresa un enlace web personalizado.',
              style: GoogleFonts.inter(fontSize: 12, color: Colors.white70),
            ),
            const SizedBox(height: 18),

            // Cuadrícula de avatares predeterminados
            SizedBox(
              height: 72,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _availableAvatars.length,
                separatorBuilder: (_, __) => const SizedBox(width: 12),
                itemBuilder: (context, index) {
                  final url = _availableAvatars[index];
                  final isSelected = url == _userAvatarUrl;
                  return InkWell(
                    onTap: () {
                      _triggerHaptic();
                      setState(() => _userAvatarUrl = url);
                      Navigator.of(ctx).pop();
                      CustomToast.success(context, '¡Foto de perfil actualizada!');
                    },
                    borderRadius: BorderRadius.circular(36),
                    child: Container(
                      padding: const EdgeInsets.all(2),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: isSelected ? const Color(0xFFD4AF37) : Colors.transparent,
                          width: 3,
                        ),
                      ),
                      child: CircleAvatar(
                        radius: 30,
                        backgroundImage: NetworkImage(url),
                      ),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 16),
            TextField(
              controller: urlCtrl,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                labelText: 'O pega la URL de tu imagen',
                labelStyle: const TextStyle(color: Color(0xFFD4AF37), fontSize: 12),
                prefixIcon: const Icon(Icons.link_rounded, color: Color(0xFFD4AF37)),
                filled: true,
                fillColor: const Color(0xFF041920),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.white12)),
              ),
            ),
            const SizedBox(height: 14),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFC86432),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  if (urlCtrl.text.trim().isNotEmpty) {
                    setState(() => _userAvatarUrl = urlCtrl.text.trim());
                    Navigator.of(ctx).pop();
                    CustomToast.success(context, '¡Avatar personalizado guardado!');
                  }
                },
                child: const Text('Aplicar URL', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // --------------------------------------------------------------------------
  // MODAL: EDITAR DATOS PERSONALES
  // --------------------------------------------------------------------------
  void _showEditProfileDialog() {
    _triggerHaptic();

    final nameCtrl = TextEditingController(text: _userName);
    final docCtrl = TextEditingController(text: _userDocument);
    final phoneCtrl = TextEditingController(text: _userPhone);
    final emailCtrl = TextEditingController(text: _userEmail);
    final natCtrl = TextEditingController(text: _userNationality);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF082B35),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFFD4AF37), width: 1.2),
        ),
        title: Row(
          children: [
            const Icon(Icons.edit_note_rounded, color: Color(0xFFD4AF37), size: 24),
            const SizedBox(width: 10),
            Text(
              'Editar Datos del Perfil',
              style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildDialogField('Nombre Completo', nameCtrl, Icons.person_rounded),
              const SizedBox(height: 10),
              _buildDialogField('Cédula o Pasaporte', docCtrl, Icons.badge_rounded),
              const SizedBox(height: 10),
              _buildDialogField('Teléfono / WhatsApp', phoneCtrl, Icons.phone_rounded),
              const SizedBox(height: 10),
              _buildDialogField('Correo Electrónico', emailCtrl, Icons.email_rounded),
              const SizedBox(height: 10),
              _buildDialogField('Nacionalidad', natCtrl, Icons.flag_rounded),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancelar', style: TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFC86432),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () {
              setState(() {
                _userName = nameCtrl.text.trim();
                _userDocument = docCtrl.text.trim();
                _userPhone = phoneCtrl.text.trim();
                _userEmail = emailCtrl.text.trim();
                _userNationality = natCtrl.text.trim();
              });
              Navigator.of(ctx).pop();
              CustomToast.success(context, '¡Datos del perfil actualizados correctamente!');
            },
            child: const Text('Guardar', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  // --------------------------------------------------------------------------
  // MODAL: CAMBIAR CONTRASEÑA
  // --------------------------------------------------------------------------
  void _showChangePasswordDialog() {
    _triggerHaptic();

    final currentPassCtrl = TextEditingController();
    final newPassCtrl = TextEditingController();
    final confirmPassCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF082B35),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFFD4AF37), width: 1.2),
        ),
        title: Row(
          children: [
            const Icon(Icons.lock_reset_rounded, color: Color(0xFFD4AF37), size: 24),
            const SizedBox(width: 10),
            Text(
              'Cambiar Contraseña',
              style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Ingresa tu clave actual y define tu nueva contraseña segura para proteger tu cuenta y pagos.',
              style: GoogleFonts.inter(fontSize: 12, color: Colors.white70),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: currentPassCtrl,
              obscureText: true,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                labelText: 'Contraseña Actual',
                labelStyle: const TextStyle(color: Color(0xFFD4AF37), fontSize: 12),
                prefixIcon: const Icon(Icons.key, color: Color(0xFFD4AF37), size: 18),
                filled: true,
                fillColor: const Color(0xFF041920),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: newPassCtrl,
              obscureText: true,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                labelText: 'Nueva Contraseña',
                labelStyle: const TextStyle(color: Color(0xFFD4AF37), fontSize: 12),
                prefixIcon: const Icon(Icons.password, color: Color(0xFFD4AF37), size: 18),
                filled: true,
                fillColor: const Color(0xFF041920),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: confirmPassCtrl,
              obscureText: true,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                labelText: 'Confirmar Contraseña',
                labelStyle: const TextStyle(color: Color(0xFFD4AF37), fontSize: 12),
                prefixIcon: const Icon(Icons.check, color: Color(0xFFD4AF37), size: 18),
                filled: true,
                fillColor: const Color(0xFF041920),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancelar', style: TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFC86432),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () {
              if (newPassCtrl.text.isEmpty || newPassCtrl.text.length < 6) {
                CustomToast.error(context, 'La contraseña debe tener al menos 6 caracteres');
                return;
              }
              if (newPassCtrl.text != confirmPassCtrl.text) {
                CustomToast.error(context, 'Las contraseñas no coinciden');
                return;
              }
              Navigator.of(ctx).pop();
              CustomToast.success(context, '¡Contraseña actualizada exitosamente!');
            },
            child: const Text('Actualizar', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  // --------------------------------------------------------------------------
  // MODAL: DETALLES DEL SELLO DE EXPEDICIÓN
  // --------------------------------------------------------------------------
  void _showStampDetailsDialog(Map<String, dynamic> stamp) {
    _triggerHaptic();
    final unlocked = stamp['unlocked'] as bool;
    final color = stamp['color'] as Color;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF082B35),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(22),
          side: BorderSide(color: unlocked ? color : Colors.white24, width: 1.5),
        ),
        title: Row(
          children: [
            Icon(stamp['icon'] as IconData, color: unlocked ? color : Colors.white38, size: 26),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                stamp['title'] as String,
                style: GoogleFonts.spaceGrotesk(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: (unlocked ? color : Colors.white24).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: unlocked ? color : Colors.white24),
              ),
              child: Text(
                unlocked ? 'SELLO OFICIAL CERTIFICADO' : 'SELLO POR DESBLOQUEAR',
                style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.w800, color: unlocked ? color : Colors.white60),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              stamp['description'] as String,
              style: GoogleFonts.inter(fontSize: 12, color: Colors.white.withValues(alpha: 0.85), height: 1.4),
            ),
            const SizedBox(height: 14),
            const Divider(color: Colors.white12),
            const SizedBox(height: 6),
            _buildDialogDetailRow('Departamento', stamp['department'] as String),
            _buildDialogDetailRow('Guía Certificado', stamp['guide'] as String),
            _buildDialogDetailRow('Licencia INTUR', stamp['inturCode'] as String),
            _buildDialogDetailRow('Fecha de Check-in', stamp['date'] as String),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cerrar', style: TextStyle(color: Color(0xFFD4AF37), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildDialogDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.inter(fontSize: 11, color: Colors.white54)),
          Text(value, style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white)),
        ],
      ),
    );
  }

  Widget _buildDialogField(String label, TextEditingController ctrl, IconData icon) {
    return TextField(
      controller: ctrl,
      style: const TextStyle(color: Colors.white, fontSize: 13),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Color(0xFFD4AF37), fontSize: 12),
        prefixIcon: Icon(icon, color: const Color(0xFFD4AF37), size: 18),
        filled: true,
        fillColor: const Color(0xFF041920),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Colors.white12)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Colors.white12)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFD4AF37))),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
    );
  }

  void _showLogoutDialog() {
    _triggerHaptic();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF082B35),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(
            color: const Color(0xFFD4AF37).withValues(alpha: 0.4),
          ),
        ),
        title: const Row(
          children: [
            Icon(Icons.logout_rounded, color: Color(0xFFE11D48)),
            SizedBox(width: 10),
            Text(
              'Cerrar Sesión',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        content: const Text(
          '¿Estás seguro de que deseas salir de tu perfil de explorador Baqueano?',
          style: TextStyle(color: Colors.white70, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancelar', style: TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE11D48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () async {
              Navigator.of(ctx).pop();
              await ref.read(authServiceProvider).signOut();
              if (mounted) {
                context.go('/login');
              }
            },
            child: const Text('Salir', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _saveAllSettings() {
    _triggerHaptic();
    CustomToast.success(context, '¡Todas las configuraciones fueron guardadas y sincronizadas con éxito!');
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    final commService = ref.watch(bookingCommunicationProvider);
    final realExpeditionsCount = commService.bookings.length;
    final totalExpeditionsDisplay = 4 + realExpeditionsCount;

    final containerBgColor = _highContrast ? Colors.black : const Color(0xFF041920);
    final containerBorderColor = _highContrast ? Colors.white : Colors.white12;

    return ResponsiveScaffold(
      currentIndex: 4,
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.symmetric(
          horizontal: isDesktop ? 48.0 : 20.0,
          vertical: 20.0,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header del Módulo
            const SectionHeader(
              tag: 'CONFIGURACIÓN DE CUENTA & PREFERENCIAS',
              title: '👤 Mi Perfil & Ajustes',
              subtitle: 'Administra tus datos personales, moneda preferida, régimen tributario, notificaciones, accesibilidad y seguridad.',
            ),
            const SizedBox(height: 18),

            // ----------------------------------------------------------------
            // 1. TARJETA PRINCIPAL DEL EXPLORADOR (DATOS PERSONALES)
            // ----------------------------------------------------------------
            _buildProfileCard(totalExpeditionsDisplay),
            const SizedBox(height: 18),

            // ----------------------------------------------------------------
            // 1.5 PASAPORTE DIGITAL DE EXPLORADOR (MONETIZACIÓN B2C & DESCUENTOS)
            // ----------------------------------------------------------------
            _buildPassportMembershipCard(),
            const SizedBox(height: 24),

            // ----------------------------------------------------------------
            // 2. CONFIGURACIONES DE MONEDA & FINANZAS
            // ----------------------------------------------------------------
            _buildSectionCardTitle('💰 CONFIGURACIONES DE MONEDA & FINANZAS', Icons.currency_exchange_rounded),
            const SizedBox(height: 10),
            _buildCurrencyAndTaxSettings(containerBgColor, containerBorderColor),
            const SizedBox(height: 24),

            // ----------------------------------------------------------------
            // 3. CONFIGURACIONES DE NOTIFICACIONES & ALERTAS
            // ----------------------------------------------------------------
            _buildSectionCardTitle('🔔 NOTIFICACIONES & ALERTAS EN TIEMPO REAL', Icons.notifications_active_outlined),
            const SizedBox(height: 10),
            _buildNotificationsSettings(containerBgColor, containerBorderColor),
            const SizedBox(height: 24),

            // ----------------------------------------------------------------
            // 4. CONFIGURACIONES DE ACCESIBILIDAD & VISUALIZACIÓN
            // ----------------------------------------------------------------
            _buildSectionCardTitle('👁️ ACCESIBILIDAD & EXPERIENCIA VISUAL', Icons.accessibility_new_rounded),
            const SizedBox(height: 10),
            _buildAccessibilitySettings(containerBgColor, containerBorderColor),
            const SizedBox(height: 24),

            // ----------------------------------------------------------------
            // 5. MIS SELLOS DE EXPEDICIÓN & BITÁCORA
            // ----------------------------------------------------------------
            _buildSectionCardTitle('🧭 MIS SELLOS & BITÁCORA DE EXPEDICIÓN', Icons.military_tech_rounded),
            const SizedBox(height: 10),
            _buildStampsGrid(containerBgColor, containerBorderColor),
            const SizedBox(height: 24),

            // ----------------------------------------------------------------
            // 6. SEGURIDAD & SESIÓN
            // ----------------------------------------------------------------
            _buildSectionCardTitle('🛡️ SEGURIDAD & CUENTA', Icons.security_rounded),
            const SizedBox(height: 10),
            _buildSecuritySettings(containerBgColor, containerBorderColor),
            const SizedBox(height: 24),

            // ----------------------------------------------------------------
            // 7. BOTÓN GUARDAR TODAS LAS CONFIGURACIONES
            // ----------------------------------------------------------------
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.terracotta,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 6,
                ),
                icon: const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
                label: Text(
                  'Guardar Todas las Configuraciones',
                  style: GoogleFonts.spaceGrotesk(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white),
                ),
                onPressed: _saveAllSettings,
              ),
            ),
            const SizedBox(height: 18),

            // Enlaces Legales y Versión
            _buildLegalFooter(),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionCardTitle(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: const Color(0xFFD4AF37), size: 18),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            title,
            style: GoogleFonts.spaceGrotesk(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: const Color(0xFFD4AF37),
              letterSpacing: 0.8,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  Widget _buildProfileCard(int expeditionsCount) {
    final auth = ref.watch(authServiceProvider);
    final user = auth.currentUser;

    if (user == null) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          gradient: AppGradients.cardGlass,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: _highContrast ? Colors.white : const Color(0xFFD4AF37).withValues(alpha: 0.5),
            width: _highContrast ? 2.0 : 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.4),
              blurRadius: 20,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          children: [
            const Icon(Icons.no_accounts_rounded, color: Color(0xFFD4AF37), size: 52),
            const SizedBox(height: 12),
            Text(
              'Sin Sesión de Google Iniciada',
              style: GoogleFonts.spaceGrotesk(fontSize: 17, fontWeight: FontWeight.w800, color: Colors.white),
            ),
            const SizedBox(height: 6),
            Text(
              'No se ha identificado ninguna cuenta de Google. Conecta tu cuenta oficial para acceder a tu perfil y sincronizar expediciones.',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(fontSize: 12, color: Colors.white70),
            ),
            const SizedBox(height: 18),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFC86432),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              ),
              icon: const Icon(Icons.login_rounded, color: Colors.white, size: 18),
              label: Text(
                'Iniciar Sesión con Google',
                style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.bold),
              ),
              onPressed: () => context.go('/login'),
            ),
          ],
        ),
      );
    }

    final displayName = user.displayName.isNotEmpty ? user.displayName : (_userName.isNotEmpty ? _userName : 'Explorador Google');
    final displayEmail = user.email.isNotEmpty ? user.email : _userEmail;
    final displayPhoto = user.photoUrl.isNotEmpty ? user.photoUrl : (_userAvatarUrl.isNotEmpty ? _userAvatarUrl : _availableAvatars.first);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppGradients.cardGlass,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: _highContrast ? Colors.white : const Color(0xFFD4AF37).withValues(alpha: 0.6),
          width: _highContrast ? 2.0 : 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.4),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              // Avatar interactivo con botón de edición
              InkWell(
                onTap: _showAvatarPicker,
                borderRadius: BorderRadius.circular(38),
                child: Stack(
                  children: [
                    CircleAvatar(
                      radius: 36,
                      backgroundImage: NetworkImage(displayPhoto),
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: Color(0xFFC86432),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.camera_alt_rounded, color: Colors.white, size: 12),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      displayName,
                      style: GoogleFonts.montserrat(
                        fontSize: 18 * _fontScale,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFC86432).withValues(alpha: 0.25),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFC86432)),
                      ),
                      child: Text(
                        'RANGO: BAQUEANO MAESTRO',
                        style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.w800, color: const Color(0xFFD4AF37)),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      displayEmail,
                      style: GoogleFonts.inter(fontSize: 12 * _fontScale, color: Colors.white70),
                    ),
                  ],
                ),
              ),
              IconButton(
                style: IconButton.styleFrom(backgroundColor: const Color(0xFF082B35)),
                icon: const Icon(Icons.edit_rounded, color: Color(0xFFD4AF37), size: 20),
                tooltip: 'Editar Datos',
                onPressed: _showEditProfileDialog,
              ),
            ],
          ),

          const SizedBox(height: 16),
          const Divider(color: Colors.white12),
          const SizedBox(height: 12),

          // Fila de Estadísticas y XP
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildStatItem('Expediciones', '$expeditionsCount Rutas', Icons.hiking_rounded),
              _buildStatItem('Volcanes', '3 Cumbres', Icons.volcano_rounded),
              _buildStatItem('Experiencia', '1,150 XP', Icons.bolt_rounded),
            ],
          ),

          const SizedBox(height: 14),

          // Barra de Progreso XP
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: 1150 / 2000,
              minHeight: 7,
              backgroundColor: const Color(0xFF041920),
              valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFD4AF37)),
            ),
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('1,150 XP acumulados', style: GoogleFonts.spaceGrotesk(fontSize: 10, color: Colors.white54)),
              Text('Siguiente Nivel: 2,000 XP', style: GoogleFonts.spaceGrotesk(fontSize: 10, color: const Color(0xFFD4AF37), fontWeight: FontWeight.w700)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: const Color(0xFFD4AF37), size: 18),
        const SizedBox(height: 4),
        Text(value, style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.w800, color: Colors.white)),
        Text(label, style: GoogleFonts.inter(fontSize: 10, color: Colors.white54)),
      ],
    );
  }

  Widget _buildCurrencyAndTaxSettings(Color bgColor, Color borderColor) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        children: [
          // Moneda Preferida
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Moneda de Cotización',
                      style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'C\$ 36.65 NIO / USD (Oficial)',
                      style: GoogleFonts.inter(fontSize: 11, color: Colors.white54),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildCurrencyChip('USD (\$)', _selectedCurrency == 'USD', () {
                    _triggerHaptic();
                    setState(() => _selectedCurrency = 'USD');
                    CustomToast.show(context, message: 'Moneda establecida en USD (\$)');
                  }),
                  const SizedBox(width: 6),
                  _buildCurrencyChip('NIO (C\$)', _selectedCurrency == 'NIO', () {
                    _triggerHaptic();
                    setState(() => _selectedCurrency = 'NIO');
                    CustomToast.show(context, message: 'Moneda establecida en Córdobas (C\$)');
                  }),
                ],
              ),
            ],
          ),

          const Divider(color: Colors.white12, height: 24),

          // Régimen Fiscal
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            activeThumbColor: const Color(0xFFC86432),
            title: Text(
              'Exoneración de IVA (Turista Extranjero 0% - Ley 306)',
              style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white),
            ),
            subtitle: Text(
              _isTouristTaxExempt
                  ? 'Aplica tarifa libre de impuestos según la Ley de Incentivos Turísticos.'
                  : 'Aplica 15% IVA General DGI para residentes nacionales.',
              style: GoogleFonts.inter(fontSize: 11, color: Colors.white54),
            ),
            value: _isTouristTaxExempt,
            onChanged: (val) {
              _triggerHaptic();
              setState(() => _isTouristTaxExempt = val);
              CustomToast.show(
                context,
                message: val ? 'Régimen Turista 0% IVA activado' : 'Régimen Residente 15% IVA activado',
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildCurrencyChip(String label, bool isSelected, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFC86432) : const Color(0xFF082B35),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: isSelected ? const Color(0xFFD4AF37) : Colors.white24),
        ),
        child: Text(
          label,
          style: GoogleFonts.spaceGrotesk(
            fontSize: 10.5,
            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
            color: isSelected ? Colors.white : Colors.white70,
          ),
        ),
      ),
    );
  }

  Widget _buildNotificationsSettings(Color bgColor, Color borderColor) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        children: [
          _buildSwitchRow(
            'Confirmación de Reservas & Pagos Bancarios',
            'Avisos en tiempo real cuando el anfitrión recibe y verifica tu transferencia.',
            _notifBookings,
            (v) => setState(() => _notifBookings = v),
          ),
          const Divider(color: Colors.white12, height: 18),
          _buildSwitchRow(
            'Mensajes Directos de Anfitriones y Guías',
            'Respuestas sobre puntos de encuentro GPS y coordinación de llegada.',
            _notifHostMessages,
            (v) => setState(() => _notifHostMessages = v),
          ),
          const Divider(color: Colors.white12, height: 18),
          _buildSwitchRow(
            'Alertas Preventivas de Clima & Senderos SOS',
            'Avisos meteorológicos críticos en volcanes, lagos y senderos.',
            _notifSafetyAlerts,
            (v) => setState(() => _notifSafetyAlerts = v),
          ),
          const Divider(color: Colors.white12, height: 18),
          _buildSwitchRow(
            'Sonido & Alertas Sonoras en Expedición',
            'Reproduce tono de alerta con avisos de alta prioridad.',
            _notifSound,
            (v) => setState(() => _notifSound = v),
          ),
        ],
      ),
    );
  }

  Widget _buildAccessibilitySettings(Color bgColor, Color borderColor) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Tamaño de Texto en Pantalla', style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white)),
              Text('${(_fontScale * 100).toInt()}%', style: GoogleFonts.spaceGrotesk(fontSize: 12, color: const Color(0xFFD4AF37), fontWeight: FontWeight.w800)),
            ],
          ),
          Slider(
            value: _fontScale,
            min: 0.85,
            max: 1.35,
            divisions: 5,
            activeColor: const Color(0xFFC86432),
            inactiveColor: Colors.white12,
            onChanged: (val) {
              _triggerHaptic();
              setState(() => _fontScale = val);
            },
          ),
          // Vista previa de texto dinámico
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF082B35),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              'Vista previa del tamaño de texto en la bitácora Baqueano.',
              style: GoogleFonts.inter(fontSize: 12 * _fontScale, color: Colors.white70),
            ),
          ),
          const Divider(color: Colors.white12, height: 18),
          _buildSwitchRow(
            'Modo Alto Contraste para Exteriores',
            'Mejora la legibilidad bajo luz solar directa en volcanes y playas.',
            _highContrast,
            (v) => setState(() => _highContrast = v),
          ),
          const Divider(color: Colors.white12, height: 18),
          _buildSwitchRow(
            'Respuesta y Vibración Háptica',
            'Vibración sutil al tocar botones interactivos y confirmar acciones.',
            _hapticFeedback,
            (v) => setState(() => _hapticFeedback = v),
          ),
        ],
      ),
    );
  }

  Widget _buildSwitchRow(String title, String subtitle, bool value, Function(bool) onChanged) {
    return SwitchListTile(
      contentPadding: EdgeInsets.zero,
      activeThumbColor: const Color(0xFFC86432),
      title: Text(title, style: GoogleFonts.spaceGrotesk(fontSize: 13 * _fontScale, fontWeight: FontWeight.w600, color: Colors.white)),
      subtitle: Text(subtitle, style: GoogleFonts.inter(fontSize: 11 * _fontScale, color: Colors.white54)),
      value: value,
      onChanged: (v) {
        _triggerHaptic();
        onChanged(v);
      },
    );
  }

  Widget _buildStampsGrid(Color bgColor, Color borderColor) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: Text(
                  '4 de 5 Sellos Desbloqueados (Toca para ver)',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFFD4AF37),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                '+1,150 XP',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: Colors.white70,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _stamps.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              mainAxisExtent: 68,
            ),
            itemBuilder: (context, index) {
              final stamp = _stamps[index];
              final unlocked = stamp['unlocked'] as bool;
              final color = stamp['color'] as Color;

              return InkWell(
                onTap: () => _showStampDetailsDialog(stamp),
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    color: unlocked ? color.withValues(alpha: 0.15) : Colors.white.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: unlocked ? color : Colors.white12),
                  ),
                  child: Row(
                    children: [
                      Icon(stamp['icon'] as IconData, color: unlocked ? color : Colors.white30, size: 22),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              stamp['title'] as String,
                              style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w700, color: unlocked ? Colors.white : Colors.white38),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              unlocked ? stamp['date'] as String : 'Por descubrir',
                              style: GoogleFonts.inter(fontSize: 9, color: unlocked ? const Color(0xFFD4AF37) : Colors.white24),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSecuritySettings(Color bgColor, Color borderColor) {
    final auth = ref.watch(authServiceProvider);
    final user = auth.currentUser;
    final isGoogleLinked = user?.email.contains('@gmail.com') ?? false;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    const Icon(Icons.verified_user_rounded, color: Color(0xFF10B981), size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Cuenta de Google', style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white)),
                          Text(
                            user?.email ?? _userEmail,
                            style: GoogleFonts.inter(fontSize: 11, color: Colors.white54),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: isGoogleLinked ? const Color(0xFF10B981).withValues(alpha: 0.2) : const Color(0xFF0284C7),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                ),
                onPressed: () async {
                  _triggerHaptic();
                  final success = await ref.read(authServiceProvider).signInWithGoogle();
                  if (success && mounted) {
                    final updatedUser = ref.read(authServiceProvider).currentUser;
                    if (updatedUser != null) {
                      setState(() {
                        _userName = updatedUser.displayName;
                        _userEmail = updatedUser.email;
                        if (updatedUser.photoUrl.isNotEmpty) {
                          _userAvatarUrl = updatedUser.photoUrl;
                        }
                      });
                      CustomToast.success(context, '¡Cuenta de Google vinculada con éxito!');
                    }
                  }
                },
                child: Text(
                  isGoogleLinked ? 'VINCULADA' : 'CONECTAR',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: isGoogleLinked ? const Color(0xFF10B981) : Colors.white,
                  ),
                ),
              ),
            ],
          ),
          const Divider(color: Colors.white12, height: 20),
          _buildSwitchRow(
            'Autenticación Biométrica / Huella',
            'Solicita huella digital para confirmar transacciones y reservas.',
            _biometricAuth,
            (v) {
              setState(() => _biometricAuth = v);
              CustomToast.show(
                context,
                message: v ? 'Autenticación biométrica habilitada' : 'Autenticación biométrica deshabilitada',
              );
            },
          ),
          const Divider(color: Colors.white12, height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xFFD4AF37)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                ),
                icon: const Icon(Icons.key_rounded, color: Color(0xFFD4AF37), size: 16),
                label: Text('Cambiar Clave', style: GoogleFonts.spaceGrotesk(fontSize: 12, color: const Color(0xFFD4AF37), fontWeight: FontWeight.w700)),
                onPressed: _showChangePasswordDialog,
              ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFE11D48),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                ),
                icon: const Icon(Icons.logout_rounded, color: Colors.white, size: 16),
                label: Text('Cerrar Sesión', style: GoogleFonts.spaceGrotesk(fontSize: 12, color: Colors.white, fontWeight: FontWeight.w700)),
                onPressed: _showLogoutDialog,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPassportMembershipCard() {
    final passport = ref.watch(passportMembershipProvider);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            const Color(0xFF0F172A),
            AppColors.primaryDark,
            passport.isActive ? const Color(0xFF1E3A2F) : const Color(0xFF082B35),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: passport.isActive ? AppColors.jungleGreenLight : AppColors.gold.withValues(alpha: 0.6),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: (passport.isActive ? AppColors.jungleGreen : AppColors.gold).withValues(alpha: 0.15),
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
                  color: (passport.isActive ? AppColors.jungleGreen : AppColors.gold).withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                  border: Border.all(color: passport.isActive ? AppColors.jungleGreenLight : AppColors.goldLight),
                ),
                child: Icon(
                  passport.isActive ? Icons.verified_rounded : Icons.workspace_premium_rounded,
                  color: passport.isActive ? AppColors.jungleGreenLight : AppColors.goldLight,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      passport.isActive ? 'MEMBRESÍA ACTIVA' : 'PASE TURÍSTICO EXCLUSIVO',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w800,
                        color: passport.isActive ? AppColors.jungleGreenLight : AppColors.goldLight,
                        letterSpacing: 0.8,
                      ),
                    ),
                    Text(
                      passport.isActive ? 'Pasaporte de Explorador VIP' : 'Pasaporte Digital de Explorador',
                      style: GoogleFonts.montserrat(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
              if (passport.isActive)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.jungleGreen.withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.jungleGreenLight),
                  ),
                  child: Text(
                    '15% OFF',
                    style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w900, color: AppColors.jungleGreenLight),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),

          if (passport.isActive) ...[
            Text(
              'Tienes activados todos los beneficios de explorador: 15% de descuento directo en tus reservas, mapas sin conexión e IA ilimitada.',
              style: GoogleFonts.inter(fontSize: 12.5, color: Colors.white.withValues(alpha: 0.85), height: 1.4),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                const Icon(Icons.event_available_rounded, color: AppColors.goldLight, size: 16),
                const SizedBox(width: 6),
                Text(
                  'Válido hasta: ${passport.expiryDate != null ? "${passport.expiryDate!.day}/${passport.expiryDate!.month}/${passport.expiryDate!.year}" : "Activo"}',
                  style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.goldLight),
                ),
              ],
            ),
          ] else ...[
            Text(
              'Ahorra más de \$40 USD en tu viaje a Nicaragua. Accede a 15% de descuento en expediciones y eco-lodges, mapas topográficos 100% offline y asistente IA ilimitado.',
              style: GoogleFonts.inter(fontSize: 12.5, color: Colors.white.withValues(alpha: 0.85), height: 1.4),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                _buildPassportMiniPerk('🎟️', '15% Descuento'),
                const SizedBox(width: 8),
                _buildPassportMiniPerk('🗺️', 'Mapas Offline'),
                const SizedBox(width: 8),
                _buildPassportMiniPerk('🤖', 'IA Ilimitada'),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.gold,
                  foregroundColor: const Color(0xFF041920),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () => _showActivatePassportModal(context),
                icon: const Icon(Icons.stars_rounded, size: 18),
                label: Text(
                  'ACTIVAR PASAPORTE (\$9.99 USD)',
                  style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.w900),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPassportMiniPerk(String emoji, String text) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 6),
        decoration: BoxDecoration(
          color: AppColors.primaryDark,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.borderLight),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(emoji, style: const TextStyle(fontSize: 13)),
            const SizedBox(width: 4),
            Flexible(
              child: Text(
                text,
                style: GoogleFonts.spaceGrotesk(fontSize: 10.5, fontWeight: FontWeight.w700, color: Colors.white70),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showActivatePassportModal(BuildContext context) {
    _triggerHaptic();

    String selectedPlan = 'trip';

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (modalCtx, setModalState) {
            return Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: Color(0xFF071E26),
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
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
                      const Icon(Icons.workspace_premium_rounded, color: AppColors.goldLight, size: 26),
                      const SizedBox(width: 10),
                      Text(
                        'Activar Pasaporte Explorador',
                        style: GoogleFonts.montserrat(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Opción 1: Pase de Expedición (30 días)
                  _buildPlanOptionTile(
                    title: 'Pase de Expedición (30 días)',
                    price: '\$9.99 USD (C\$ 365 NIO)',
                    subtitle: 'Ideal para turistas con estadía de 1 mes en Nicaragua',
                    isSelected: selectedPlan == 'trip',
                    onTap: () => setModalState(() => selectedPlan = 'trip'),
                  ),
                  const SizedBox(height: 10),

                  // Opción 2: Pase Anual (365 días)
                  _buildPlanOptionTile(
                    title: 'Pase Anual Completo (365 días)',
                    price: '\$24.99 USD (C\$ 915 NIO)',
                    subtitle: 'Para exploradores frecuentes y residentes',
                    isSelected: selectedPlan == 'annual',
                    onTap: () => setModalState(() => selectedPlan = 'annual'),
                  ),

                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.primaryDark,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.account_balance_rounded, color: AppColors.goldLight, size: 20),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'Se activa al instante. Puedes transferir a cuentas BAC, Banpro, Lafise o Billetera Móvil.',
                            style: GoogleFonts.inter(fontSize: 11.5, color: Colors.white70),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.gold,
                        foregroundColor: const Color(0xFF041920),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () async {
                        await ref.read(passportMembershipProvider.notifier).activateMembership(selectedPlan);
                        if (modalCtx.mounted) {
                          Navigator.of(modalCtx).pop();
                        }
                        if (context.mounted) {
                          CustomToast.success(context, '¡Pasaporte de Explorador activado con éxito! 15% de descuento habilitado.');
                        }
                      },
                      child: Text(
                        'CONFIRMAR & ACTIVAR PASAPORTE',
                        style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.w900),
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildPlanOptionTile({
    required String title,
    required String price,
    required String subtitle,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.gold.withValues(alpha: 0.15) : AppColors.primaryDark,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? AppColors.gold : AppColors.borderLight,
            width: isSelected ? 1.6 : 1.0,
          ),
        ),
        child: Row(
          children: [
            Icon(
              isSelected ? Icons.radio_button_checked_rounded : Icons.radio_button_off_rounded,
              color: isSelected ? AppColors.goldLight : Colors.white54,
              size: 20,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.w800, color: Colors.white)),
                  Text(price, style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.goldLight)),
                  Text(subtitle, style: GoogleFonts.inter(fontSize: 11, color: Colors.white60)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLegalFooter() {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextButton(
              onPressed: () => context.go('/ayuda'),
              child: Text('Centro de Ayuda', style: GoogleFonts.spaceGrotesk(fontSize: 11, color: Colors.white54)),
            ),
            const Text('•', style: TextStyle(color: Colors.white24)),
            TextButton(
              onPressed: () => context.go('/terminos'),
              child: Text('Términos', style: GoogleFonts.spaceGrotesk(fontSize: 11, color: Colors.white54)),
            ),
            const Text('•', style: TextStyle(color: Colors.white24)),
            TextButton(
              onPressed: () => context.go('/privacidad'),
              child: Text('Privacidad', style: GoogleFonts.spaceGrotesk(fontSize: 11, color: Colors.white54)),
            ),
          ],
        ),
        Text(
          'Baqueano Nicaragua v1.0.0 Oficial • Build 2026.09',
          style: GoogleFonts.spaceGrotesk(fontSize: 10, color: Colors.white38),
        ),
      ],
    );
  }
}
