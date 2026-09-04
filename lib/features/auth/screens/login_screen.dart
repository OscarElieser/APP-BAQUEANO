// ============================================================================
// 🧭 BAQUEANO — ACCESO ANDROID CON GOOGLE Y FIREBASE
// ============================================================================
//
// 🎯 POR QUÉ (WHY / PROPÓSITO):
// - Ofrecer acceso claro a funciones personales sin confundir un correo escrito
//   manualmente con una identidad verificada.
// - Mantener disponible la exploración como invitado, indicando que esa opción no
//   crea ni conserva una sesión autenticada.
//
// ⚙️ CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - El botón Google delega en `AuthService`; la navegación solo ocurre cuando
//   Firebase Auth confirma la credencial y el servicio publica el mismo UID.
// - Los errores de configuración se explican sin habilitar rutas alternativas de
//   identidad. El resto se comunica con mensajes breves y recuperables.
// - La opción invitado cierra cualquier sesión Firebase antes de entrar y cada
//   continuación asíncrona comprueba `mounted` antes de usar el contexto.
//
// 📦 QUÉ (WHAT / ENTREGABLES):
// - `LoginScreen`: acceso Google verificado y entrada explícita como invitado.
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
    if (_isLoading) {
      return;
    }

    HapticFeedback.mediumImpact();
    setState(() => _isLoading = true);

    try {
      final auth = ref.read(authServiceProvider);
      final success = await auth.signInWithGoogle();
      if (!mounted || !success) {
        return;
      }

      final verifiedUser = auth.currentUser;
      if (!auth.isAuthenticated || verifiedUser == null) {
        _showErrorMessage(
          'Firebase no pudo confirmar tu sesión. Inténtalo nuevamente.',
        );
        return;
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFF165D6F),
          content: Row(
            children: [
              const Icon(Icons.check_circle_rounded, color: Color(0xFFF4E6C1)),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  '¡Bienvenido a Baqueano, ${verifiedUser.displayName}!',
                  style: GoogleFonts.spaceGrotesk(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
      context.go('/home');
    } catch (error) {
      if (!mounted) {
        return;
      }
      if (_isFirebaseConfigurationError(error)) {
        _showFirebaseConfigurationDialog();
      } else {
        _showErrorMessage(
          'No fue posible verificar tu cuenta con Firebase. Inténtalo de nuevo.',
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _handleGuestAccess() async {
    if (_isLoading) {
      return;
    }

    HapticFeedback.selectionClick();
    setState(() => _isLoading = true);

    try {
      final auth = ref.read(authServiceProvider);
      await auth.signOut();
      if (!mounted) {
        return;
      }
      if (auth.isAuthenticated) {
        _showErrorMessage(
          'No fue posible cerrar la sesión activa. Inténtalo nuevamente.',
        );
        return;
      }
      context.go('/home');
    } catch (_) {
      if (mounted) {
        _showErrorMessage(
          'No fue posible activar el modo invitado de forma segura.',
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  bool _isFirebaseConfigurationError(Object error) {
    final message = error.toString().toLowerCase();
    return message.contains('apiexception: 10') ||
        message.contains('sign_in_failed') ||
        message.contains('developer_error') ||
        message.contains('firebase-not-initialized');
  }

  void _showErrorMessage(String message) {
    if (!mounted) {
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFFE11D48),
        duration: const Duration(seconds: 4),
        content: Text(message),
      ),
    );
  }

  void _showFirebaseConfigurationDialog() {
    if (!mounted) {
      return;
    }

    showDialog<void>(
      context: context,
      builder:
          (dialogContext) => AlertDialog(
            backgroundColor: const Color(0xFF0F172A),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(22),
              side: const BorderSide(color: Color(0xFFF65E01), width: 1.5),
            ),
            title: Row(
              children: [
                const Icon(
                  Icons.security_rounded,
                  color: Color(0xFFF4E6C1),
                  size: 24,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Identidad no verificada',
                    style: GoogleFonts.spaceGrotesk(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                      fontSize: 16,
                    ),
                  ),
                ),
              ],
            ),
            content: Text(
              'Google o Firebase rechazaron la configuración de acceso. '
              'Por seguridad, Baqueano no creará una cuenta local ni permitirá '
              'continuar como si la identidad estuviera autenticada.',
              style: GoogleFonts.inter(
                color: Colors.white.withValues(alpha: 0.78),
                fontSize: 12,
                height: 1.45,
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(dialogContext).pop(),
                child: const Text(
                  'Entendido',
                  style: TextStyle(color: Color(0xFFF4E6C1)),
                ),
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
                  SizedBox(
                    width: 280,
                    height: 110,
                    child: Image.asset(
                      'assets/images/logo_baqueano.png',
                      width: 280,
                      height: 110,
                      fit: BoxFit.contain,
                      cacheWidth: 840,
                      cacheHeight: 330,
                      errorBuilder:
                          (_, __, ___) => const Icon(
                            Icons.explore_rounded,
                            color: Color(0xFFF4E6C1),
                            size: 72,
                          ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Ecoturismo Campesino de Nicaragua',
                    style: GoogleFonts.inter(
                      color: const Color(0xFFF4E6C1).withValues(alpha: 0.95),
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 36),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 36,
                    ),
                    decoration: BoxDecoration(
                      gradient: AppGradients.cardGlass,
                      borderRadius: BorderRadius.circular(28),
                      border: Border.all(
                        color: const Color(0xFFF65E01).withValues(alpha: 0.6),
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
                        Semantics(
                          button: true,
                          label: 'Iniciar sesión con Google',
                          child: InkWell(
                            onTap: _isLoading ? null : _handleGoogleSignIn,
                            borderRadius: BorderRadius.circular(44),
                            child: Container(
                              width: 84,
                              height: 84,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Colors.white,
                                border: Border.all(
                                  color: const Color(
                                    0xFFF65E01,
                                  ).withValues(alpha: 0.7),
                                  width: 2,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.35),
                                    blurRadius: 18,
                                    offset: const Offset(0, 6),
                                  ),
                                  BoxShadow(
                                    color: const Color(
                                      0xFF4285F4,
                                    ).withValues(alpha: 0.4),
                                    blurRadius: 26,
                                    spreadRadius: 2,
                                  ),
                                ],
                              ),
                              child: Center(
                                child:
                                    _isLoading
                                        ? const SizedBox(
                                          width: 34,
                                          height: 34,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 3.5,
                                            valueColor:
                                                AlwaysStoppedAnimation<Color>(
                                                  Color(0xFF4285F4),
                                                ),
                                          ),
                                        )
                                        : Image.network(
                                          'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/240px-Google_%22G%22_logo.svg.png',
                                          width: 44,
                                          height: 44,
                                          cacheWidth: 88,
                                          cacheHeight: 88,
                                          errorBuilder:
                                              (_, __, ___) => const Icon(
                                                Icons.g_mobiledata_rounded,
                                                color: Color(0xFF4285F4),
                                                size: 48,
                                              ),
                                        ),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                        Text(
                          'Toca el icono de Google para acceder',
                          style: GoogleFonts.spaceGrotesk(
                            color: const Color(0xFFF4E6C1),
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Tu sesión solo se activa después de validarse con Firebase',
                          style: GoogleFonts.inter(
                            color: Colors.white.withValues(alpha: 0.58),
                            fontSize: 11,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),
                  TextButton(
                    onPressed: _isLoading ? null : _handleGuestAccess,
                    child: Text(
                      'Explorar como invitado, sin sesión →',
                      style: GoogleFonts.spaceGrotesk(
                        color: const Color(0xFFF4E6C1).withValues(alpha: 0.9),
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
