import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user_profile.dart';

class AuthService extends ChangeNotifier {
  UserProfile? _currentUser;
  bool _isLoading = false;

  AuthService() {
    // Default logged in user as Demo Explorer
    _currentUser = UserProfile(
      uid: 'demo-user-849204',
      email: 'explorador@baqueano.ni',
      displayName: 'Valeria Mendoza',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      role: 'explorer',
      explorerLevel: 'Baqueano Maestro',
      xp: 1150,
      createdAt: DateTime.now().subtract(const Duration(days: 90)),
    );
  }

  UserProfile? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;
  bool get isLoading => _isLoading;
  bool get isAdmin => _currentUser?.isAdmin ?? false;

  // Sign In with Email & Password
  Future<bool> signInWithEmailPassword(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 800));

    // Admin login shortcut or regular login
    if (email.toLowerCase().contains('admin')) {
      _currentUser = UserProfile(
        uid: 'admin-001',
        email: email,
        displayName: 'Administrador Baqueano',
        role: 'admin',
        explorerLevel: 'Baqueano Maestro',
        xp: 5000,
        createdAt: DateTime.now().subtract(const Duration(days: 365)),
      );
    } else {
      _currentUser = UserProfile(
        uid: 'user-${DateTime.now().millisecondsSinceEpoch}',
        email: email,
        displayName: email.split('@').first,
        role: 'explorer',
        explorerLevel: 'Novato',
        xp: 150,
        createdAt: DateTime.now(),
      );
    }

    _isLoading = false;
    notifyListeners();
    return true;
  }

  // Google Sign-In Native / Web
  Future<bool> signInWithGoogle() async {
    _isLoading = true;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 900));

    _currentUser = UserProfile(
      uid: 'google-user-7788',
      email: 'viajero.google@baqueano.ni',
      displayName: 'Carlos Hernández (Google)',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      role: 'explorer',
      explorerLevel: 'Aventurero',
      xp: 450,
      createdAt: DateTime.now().subtract(const Duration(days: 30)),
    );

    _isLoading = false;
    notifyListeners();
    return true;
  }

  // WhatsApp MFA simulation verification
  Future<bool> verifyMfaCode(String phone, String code) async {
    _isLoading = true;
    notifyListeners();
    await Future.delayed(const Duration(milliseconds: 600));
    _isLoading = false;
    notifyListeners();
    return code == '8492' || code.length == 4;
  }

  // Password Recovery via Email / WhatsApp
  Future<String> sendPasswordReset(String emailOrPhone) async {
    await Future.delayed(const Duration(milliseconds: 500));
    return 'Código de recuperación temporal enviado a $emailOrPhone vía WhatsApp / Email.';
  }

  // Toggle Role (for testing Admin vs Guide vs Explorer)
  void setRole(String role) {
    if (_currentUser != null) {
      _currentUser = _currentUser!.copyWith(role: role);
      notifyListeners();
    }
  }

  // Sign Out
  Future<void> signOut() async {
    _currentUser = null;
    notifyListeners();
  }
}

final authServiceProvider = ChangeNotifierProvider<AuthService>((ref) {
  return AuthService();
});
