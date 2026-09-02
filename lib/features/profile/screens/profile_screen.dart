// ============================================================================
// 👤 PASAPORTE DEL EXPLORADOR, ACCESIBILIDAD & PERFIL (PROFILE_SCREEN.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia de pasaporte digital inmersiva donde el explorador
//   colecciona sellos de rutas (Somoto, Cerro Negro, Ometepe), gestiona su nivel,
//   personaliza la accesibilidad integral (tamaño de texto, contraste, háptica)
//   y controla su autenticación con Google y Firebase.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Interfaz Glassmorphism con paleta oficial (`#082B35`, `#C86432`, `#D4AF37`, `#0F172A`).
// - Integración con `authServiceProvider` para inicio de sesión con Google y cierre seguro.
// - Pasaporte interactivo con grid de sellos auténticos y barra de XP.
// - Panel de Accesibilidad interactivo con feedback háptico.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & VISTAS EXPUESTAS):
// - `ProfileScreen`: Vista de perfil y pasaporte mapeada en `/perfil`.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../services/auth_service.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  // Ajustes de accesibilidad
  double _fontScale = 1.0;
  bool _highContrast = false;
  bool _hapticFeedback = true;
  bool _isTouristTaxExempt = true;
  String _selectedCurrency = 'USD';

  // Sellos del pasaporte
  final List<Map<String, dynamic>> _stamps = [
    {
      'id': 'somoto',
      'title': 'Cañón de Somoto',
      'department': 'Madriz',
      'unlocked': true,
      'date': '15 Oct 2024',
      'icon': Icons.water_rounded,
      'color': const Color(0xFF0284C7),
    },
    {
      'id': 'cerro-negro',
      'title': 'Volcán Cerro Negro',
      'department': 'León',
      'unlocked': true,
      'date': '02 Nov 2024',
      'icon': Icons.volcano_rounded,
      'color': const Color(0xFFC86432),
    },
    {
      'id': 'ometepe',
      'title': 'Isla de Ometepe',
      'department': 'Rivas',
      'unlocked': true,
      'date': '12 Ene 2025',
      'icon': Icons.landscape_rounded,
      'color': const Color(0xFF10B981),
    },
    {
      'id': 'miraflor',
      'title': 'Reserva Miraflor',
      'department': 'Estelí',
      'unlocked': false,
      'date': 'Bloqueado',
      'icon': Icons.forest_rounded,
      'color': const Color(0xFF64748B),
    },
    {
      'id': 'indio-maiz',
      'title': 'Indio Maíz',
      'department': 'Río San Juan',
      'unlocked': false,
      'date': 'Bloqueado',
      'icon': Icons.park_rounded,
      'color': const Color(0xFF64748B),
    },
    {
      'id': 'cascada-luna',
      'title': 'Cascada La Luna',
      'department': 'Matagalpa',
      'unlocked': true,
      'date': '20 Feb 2025',
      'icon': Icons.waves_rounded,
      'color': const Color(0xFF06B6D4),
    },
  ];

  void _triggerHaptic() {
    if (_hapticFeedback) {
      HapticFeedback.lightImpact();
    }
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
          '¿Estás seguro de que deseas salir de tu Pasaporte de Explorador Baqueano?',
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

  Future<void> _handleConnectGoogle() async {
    _triggerHaptic();
    final auth = ref.read(authServiceProvider);
    await auth.signInWithGoogle();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Color(0xFF082B35),
          content: Text('¡Cuenta de Google vinculada con éxito al Pasaporte Baqueano!'),
        ),
      );
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authServiceProvider);
    final user = auth.currentUser;
    final userName = user?.displayName ?? 'Oscar Elieser';
    final userEmail = user?.email ?? 'explorador@baqueano.ni';
    final userXp = user?.xp ?? 1150;
    final explorerRank = user?.explorerLevel ?? 'Guardián de Volcanes';

    return Scaffold(
      backgroundColor: _highContrast ? Colors.black : const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF082B35),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
          onPressed: () => context.go('/home'),
        ),
        title: Text(
          'Pasaporte del Explorador',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w800,
            fontSize: 18 * _fontScale,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.emergency_rounded, color: Color(0xFFE11D48)),
            tooltip: 'Centro SOS',
            onPressed: () => context.push('/sos'),
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Color(0xFFD4AF37)),
            tooltip: 'Cerrar Sesión',
            onPressed: _showLogoutDialog,
          ),
        ],
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          children: [
            // ----------------------------------------------------------------
            // 1. TARJETA PRINCIPAL DEL PASAPORTE DIGITAL
            // ----------------------------------------------------------------
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF082B35), Color(0xFF1E293B)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: const Color(0xFFD4AF37).withValues(alpha: 0.4),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.4),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: const Color(0xFFD4AF37),
                            width: 2,
                          ),
                          image: DecorationImage(
                            image: NetworkImage(
                              user?.photoUrl.isNotEmpty == true
                                  ? user!.photoUrl
                                  : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                            ),
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              userName,
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 18 * _fontScale,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              userEmail,
                              style: TextStyle(
                                color: const Color(0xFFD4AF37).withValues(alpha: 0.85),
                                fontSize: 12 * _fontScale,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFC86432).withValues(alpha: 0.25),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: const Color(0xFFC86432)),
                              ),
                              child: Text(
                                '🧭 $explorerRank',
                                style: const TextStyle(
                                  color: Color(0xFFC86432),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 20),

                  // Barra de Experiencia (XP)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Experiencia de Expedición',
                        style: TextStyle(color: Colors.white70, fontSize: 12 * _fontScale),
                      ),
                      Text(
                        '$userXp / 2000 XP',
                        style: const TextStyle(
                          color: Color(0xFFD4AF37),
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: LinearProgressIndicator(
                      value: userXp / 2000,
                      minHeight: 8,
                      backgroundColor: Colors.white.withValues(alpha: 0.1),
                      valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFD4AF37)),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // ----------------------------------------------------------------
            // 2. CONECTIVIDAD GOOGLE AUTH
            // ----------------------------------------------------------------
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: AppGradients.cardGlass,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Row(
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white,
                    ),
                    child: const Icon(
                      Icons.g_mobiledata_rounded,
                      color: Color(0xFF4285F4),
                      size: 32,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Google Sign-In Conectado',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Sincronización en la nube con Firestore',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.55),
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                  TextButton(
                    onPressed: _handleConnectGoogle,
                    child: const Text(
                      'Sincronizar',
                      style: TextStyle(
                        color: Color(0xFFD4AF37),
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // ----------------------------------------------------------------
            // 3. COLECCIÓN DE SELLOS DEL PASAPORTE (STAMPS GRID)
            // ----------------------------------------------------------------
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Sellos de Expedición',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16 * _fontScale,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                Text(
                  '${_stamps.where((s) => s['unlocked'] == true).length}/${_stamps.length} Sellados',
                  style: const TextStyle(
                    color: Color(0xFFD4AF37),
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.85,
              ),
              itemCount: _stamps.length,
              itemBuilder: (context, index) {
                final stamp = _stamps[index];
                final isUnlocked = stamp['unlocked'] as bool;
                final color = stamp['color'] as Color;

                return Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: isUnlocked
                        ? color.withValues(alpha: 0.15)
                        : Colors.white.withValues(alpha: 0.04),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isUnlocked
                          ? color.withValues(alpha: 0.6)
                          : Colors.white.withValues(alpha: 0.1),
                    ),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        stamp['icon'] as IconData,
                        color: isUnlocked ? color : Colors.white24,
                        size: 28,
                      ),
                      const SizedBox(height: 6),
                      Text(
                        stamp['title'] as String,
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: isUnlocked ? Colors.white : Colors.white38,
                          fontSize: 11 * _fontScale,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        isUnlocked ? stamp['date'] as String : '🔒 Bloqueado',
                        style: TextStyle(
                          color: isUnlocked ? const Color(0xFFD4AF37) : Colors.white24,
                          fontSize: 9,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),

            const SizedBox(height: 28),

            // ----------------------------------------------------------------
            // 4. CENTRO DE ACCESIBILIDAD INTEGRAL
            // ----------------------------------------------------------------
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: AppGradients.cardGlass,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.accessibility_new_rounded, color: Color(0xFFD4AF37), size: 22),
                      const SizedBox(width: 10),
                      Text(
                        'Centro de Accesibilidad',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16 * _fontScale,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Selector de Tamaño de Texto
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Tamaño de Letra',
                        style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                      ),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.text_decrease_rounded, color: Colors.white70),
                            onPressed: () {
                              _triggerHaptic();
                              if (_fontScale > 0.85) setState(() => _fontScale -= 0.1);
                            },
                          ),
                          Text(
                            '${(_fontScale * 100).toInt()}%',
                            style: const TextStyle(color: Color(0xFFD4AF37), fontWeight: FontWeight.bold),
                          ),
                          IconButton(
                            icon: const Icon(Icons.text_increase_rounded, color: Colors.white70),
                            onPressed: () {
                              _triggerHaptic();
                              if (_fontScale < 1.35) setState(() => _fontScale += 0.1);
                            },
                          ),
                        ],
                      ),
                    ],
                  ),

                  const Divider(color: Colors.white12),

                  // Alto Contraste
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text(
                      'Modo Alto Contraste',
                      style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                    subtitle: const Text(
                      'Aumenta la legibilidad bajo luz solar directa',
                      style: TextStyle(color: Colors.white54, fontSize: 11),
                    ),
                    value: _highContrast,
                    activeColor: const Color(0xFFD4AF37),
                    onChanged: (val) {
                      _triggerHaptic();
                      setState(() => _highContrast = val);
                    },
                  ),

                  const Divider(color: Colors.white12),

                  // Respuesta Háptica
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text(
                      'Vibración Háptica Táctil',
                      style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                    subtitle: const Text(
                      'Confirmación de toques y botones físicos',
                      style: TextStyle(color: Colors.white54, fontSize: 11),
                    ),
                    value: _hapticFeedback,
                    activeColor: const Color(0xFFC86432),
                    onChanged: (val) {
                      setState(() => _hapticFeedback = val);
                      _triggerHaptic();
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // ----------------------------------------------------------------
            // 5. RÉGIMEN FISCAL & MONEDA PREFERIDA
            // ----------------------------------------------------------------
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: AppGradients.cardGlass,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.receipt_long_rounded, color: Color(0xFFC86432), size: 22),
                      const SizedBox(width: 10),
                      Text(
                        'Régimen Fiscal de Nicaragua',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16 * _fontScale,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text(
                      'Turista Extranjero (0% IVA Ley 306)',
                      style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                    subtitle: const Text(
                      'Aplica exención fiscal de incentivos turísticos en hospedaje rural',
                      style: TextStyle(color: Colors.white54, fontSize: 11),
                    ),
                    value: _isTouristTaxExempt,
                    activeColor: const Color(0xFFD4AF37),
                    onChanged: (val) {
                      _triggerHaptic();
                      setState(() => _isTouristTaxExempt = val);
                    },
                  ),
                  const Divider(color: Colors.white12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Moneda Principal de Visualización',
                        style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                      ),
                      DropdownButton<String>(
                        dropdownColor: const Color(0xFF082B35),
                        value: _selectedCurrency,
                        style: const TextStyle(color: Color(0xFFD4AF37), fontWeight: FontWeight.bold),
                        underline: const SizedBox(),
                        items: const [
                          DropdownMenuItem(value: 'USD', child: Text('USD (\$ Dólar)')),
                          DropdownMenuItem(value: 'NIO', child: Text('NIO (C\$ Córdoba)')),
                        ],
                        onChanged: (val) {
                          if (val != null) {
                            _triggerHaptic();
                            setState(() => _selectedCurrency = val);
                          }
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            // ----------------------------------------------------------------
            // 6. BOTÓN OFICIAL DE CERRAR SESIÓN
            // ----------------------------------------------------------------
            InkWell(
              onTap: _showLogoutDialog,
              borderRadius: BorderRadius.circular(16),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  color: const Color(0xFFE11D48).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: const Color(0xFFE11D48).withValues(alpha: 0.6),
                  ),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.logout_rounded, color: Color(0xFFE11D48), size: 20),
                    SizedBox(width: 10),
                    Text(
                      'Cerrar Sesión de Explorador',
                      style: TextStyle(
                        color: Color(0xFFE11D48),
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 36),
          ],
        ),
      ),
    );
  }
}
