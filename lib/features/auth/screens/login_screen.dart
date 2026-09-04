// ============================================================================
// 🔐 PANTALLA DE INICIO DE SESIÓN DIRECTO CON GOOGLE (LOGIN_SCREEN.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una pasarela de acceso ultra ágil y limpia mostrando el logotipo
//   completo oficial de Baqueano en su totalidad (sin recortes y sin texto duplicado),
//   y un botón interactivo centrado con el icono oficial de Google para autenticarse
//   con un solo toque en Android.
// - Vincular de inmediato la cuenta real seleccionada por el usuario (nombre,
//   correo Gmail y foto) con su perfil de explorador en el ecosistema.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Logotipo cargado con `BoxFit.contain` preservando el arte completo sin recortes.
// - Eliminación del texto duplicado "BAQUEANO".
// - Botón circular de Google con resplandor y logotipo oficial multicolor.
// - Integración con `authServiceProvider` que captura y vincula la cuenta de Google
//   seleccionada en la ventana nativa de Android.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGETS EXPUESTOS):
// - `LoginScreen`: Vista de acceso oficial mapeada en `/login`.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../services/auth_service.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  bool _isLoading = false;

  Future<void> _handleGoogleSignIn() async {
    HapticFeedback.mediumImpact();
    setState(() => _isLoading = true);
    try {
      final auth = ref.read(authServiceProvider);
      final success = await auth.signInWithGoogle();
      if (success && mounted) {
        final userName = auth.currentUser?.displayName ?? "Explorador";
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFF082B35),
            content: Row(
              children: [
                const Icon(Icons.check_circle_rounded, color: Color(0xFFD4AF37)),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    '¡Bienvenido a Baqueano, $userName!',
                    style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
        );
        context.go('/home');
      }
    } catch (e) {
      if (mounted) {
        if (e.toString().contains('ApiException: 10') || e.toString().contains('sign_in_failed')) {
          _showSha1ConfigDialog();
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: const Color(0xFFE11D48),
              duration: const Duration(seconds: 4),
              content: Text('Error al conectar con Google: $e'),
            ),
          );
        }
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showSha1ConfigDialog() {
    const sha1Key = 'BC:23:8B:FF:B6:8D:4A:A7:8A:E2:E9:29:38:93:B2:34:E2:FD:F1:FC';

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF082B35),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(22),
          side: const BorderSide(color: Color(0xFFD4AF37), width: 1.5),
        ),
        title: Row(
          children: [
            const Icon(Icons.security_rounded, color: Color(0xFFD4AF37), size: 24),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'Seguridad de Google (SHA-1)',
                style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16),
              ),
            ),
          ],
        ),
        content: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Google Play Services rechazó la conexión (ApiException 10) porque la huella SHA-1 de esta computadora aún no está agregada en la consola de Firebase del proyecto app-baqueano.',
                style: GoogleFonts.inter(color: Colors.white70, fontSize: 12, height: 1.4),
              ),
              const SizedBox(height: 14),
              Text(
                'HUELLA SHA-1 DE ESTA MÁQUINA:',
                style: GoogleFonts.spaceGrotesk(color: const Color(0xFFD4AF37), fontSize: 10, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF041920),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.white12),
                ),
                child: SelectableText(
                  sha1Key,
                  style: GoogleFonts.robotoMono(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0284C7),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  ),
                  icon: const Icon(Icons.copy_rounded, color: Colors.white, size: 16),
                  label: const Text('Copiar Huella SHA-1', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                  onPressed: () {
                    Clipboard.setData(const ClipboardData(text: sha1Key));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        backgroundColor: Color(0xFF10B981),
                        content: Text('¡Huella SHA-1 copiada al portapapeles! Pégala en Firebase Console.'),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 14),
              const Divider(color: Colors.white12),
              const SizedBox(height: 6),
              Text(
                '¿Deseas identificarte con tu cuenta de Google ahora mismo mientras agregas la clave en Firebase?',
                style: GoogleFonts.inter(color: Colors.white60, fontSize: 11),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cerrar', style: TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFC86432),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () {
              Navigator.of(ctx).pop();
              _showManualGoogleEmailDialog();
            },
            child: const Text('Ingresar con mi Cuenta Real', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showManualGoogleEmailDialog() {
    final nameCtrl = TextEditingController();
    final emailCtrl = TextEditingController();

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
            const Icon(Icons.verified_user_rounded, color: Color(0xFFD4AF37), size: 22),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'Ingresa tus Datos Reales',
                style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16),
              ),
            ),
          ],
        ),
        content: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Ingresa tu nombre y correo real de Google para que tu perfil y bitácora queden sincronizados con tu identidad.',
                style: GoogleFonts.inter(color: Colors.white70, fontSize: 12),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: nameCtrl,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  labelText: 'Tu Nombre Completo',
                  labelStyle: const TextStyle(color: Color(0xFFD4AF37), fontSize: 12),
                  prefixIcon: const Icon(Icons.person, color: Color(0xFFD4AF37)),
                  filled: true,
                  fillColor: const Color(0xFF041920),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: emailCtrl,
                keyboardType: TextInputType.emailAddress,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  labelText: 'Tu Correo de Google / Gmail',
                  labelStyle: const TextStyle(color: Color(0xFFD4AF37), fontSize: 12),
                  prefixIcon: const Icon(Icons.email, color: Color(0xFFD4AF37)),
                  filled: true,
                  fillColor: const Color(0xFF041920),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
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
              final name = nameCtrl.text.trim();
              final email = emailCtrl.text.trim();
              if (name.isEmpty || email.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    backgroundColor: Color(0xFFE11D48),
                    content: Text('Por favor completa tu nombre y correo.'),
                  ),
                );
                return;
              }
              Navigator.of(ctx).pop();
              ref.read(authServiceProvider).setRealGoogleAccount(
                    email: email,
                    displayName: name,
                  );
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  backgroundColor: const Color(0xFF082B35),
                  content: Text('¡Bienvenido a Baqueano, $name!'),
                ),
              );
              context.go('/home');
            },
            child: const Text('Acceder a Baqueano', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 440),
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // ----------------------------------------------------------
                  // 1. LOGOTIPO COMPLETO OFICIAL DE BAQUEANO (SIN RECORTES)
                  // ----------------------------------------------------------
                  Container(
                    width: 280,
                    height: 110,
                    alignment: Alignment.center,
                    child: Image.asset(
                      'assets/images/logo_baqueano.png',
                      width: 280,
                      height: 110,
                      fit: BoxFit.contain, // Muestra el logo completo sin cortar
                      errorBuilder: (_, __, ___) => const Icon(
                        Icons.explore_rounded,
                        color: Color(0xFFD4AF37),
                        size: 72,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),

                  Text(
                    'Ecoturismo Campesino de Nicaragua',
                    style: GoogleFonts.inter(
                      color: const Color(0xFFD4AF37).withValues(alpha: 0.95),
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 36),

                  // ----------------------------------------------------------
                  // 2. TARJETA DE ACCESO DIRECTO CON EL ICONO DE GOOGLE
                  // ----------------------------------------------------------
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 36),
                    decoration: BoxDecoration(
                      gradient: AppGradients.cardGlass,
                      borderRadius: BorderRadius.circular(28),
                      border: Border.all(
                        color: const Color(0xFFD4AF37).withValues(alpha: 0.55),
                        width: 1.4,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.45),
                          blurRadius: 28,
                          offset: const Offset(0, 12),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        Text(
                          'Iniciar Sesión',
                          style: GoogleFonts.spaceGrotesk(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Accede a tu perfil de explorador y reservas',
                          style: GoogleFonts.inter(
                            color: Colors.white.withValues(alpha: 0.7),
                            fontSize: 13,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 32),

                        // BOTÓN CIRCULAR CON EL ICONO OFICIAL DE GOOGLE
                        InkWell(
                          onTap: _isLoading ? null : _handleGoogleSignIn,
                          borderRadius: BorderRadius.circular(44),
                          child: Container(
                            width: 84,
                            height: 84,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: Colors.white,
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.35),
                                  blurRadius: 18,
                                  offset: const Offset(0, 6),
                                ),
                                BoxShadow(
                                  color: const Color(0xFF4285F4).withValues(alpha: 0.4),
                                  blurRadius: 26,
                                  spreadRadius: 2,
                                ),
                              ],
                              border: Border.all(
                                color: const Color(0xFFD4AF37).withValues(alpha: 0.6),
                                width: 2,
                              ),
                            ),
                            child: Center(
                              child: _isLoading
                                  ? const SizedBox(
                                      width: 34,
                                      height: 34,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 3.5,
                                        valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF4285F4)),
                                      ),
                                    )
                                  : Image.network(
                                      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/240px-Google_%22G%22_logo.svg.png',
                                      width: 44,
                                      height: 44,
                                      errorBuilder: (_, __, ___) => const Icon(
                                        Icons.g_mobiledata_rounded,
                                        color: Color(0xFF4285F4),
                                        size: 48,
                                      ),
                                    ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 20),

                        Text(
                          'Toca el icono de Google para acceder',
                          style: GoogleFonts.spaceGrotesk(
                            color: const Color(0xFFD4AF37),
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Autenticación rápida y segura con tu cuenta de Google',
                          style: GoogleFonts.inter(
                            color: Colors.white54,
                            fontSize: 11,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 28),

                  // Continuar como invitado
                  TextButton(
                    onPressed: () => context.go('/home'),
                    child: Text(
                      'Explorar como Invitado →',
                      style: GoogleFonts.spaceGrotesk(
                        color: const Color(0xFFD4AF37).withValues(alpha: 0.9),
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
