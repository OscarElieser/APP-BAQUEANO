// ============================================================================
// 🧭 BAQUEANO — SERVICIO DE AUTENTICACIÓN CON IDENTIDAD VERIFICADA
// ============================================================================
//
// 🎯 POR QUÉ (WHY / PROPÓSITO):
// - Garantizar que una persona solo figure como autenticada cuando Firebase Auth
//   mantenga una sesión válida para ella.
// - Evitar perfiles locales, sesiones paralelas y cambios de rol desde el APK,
//   porque ninguno de esos mecanismos constituye una identidad verificable.
// - Conservar un acceso de invitado explícito sin asociarle UID, correo ni rol.
//
// ⚙️ CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Firebase Auth conserva su propia sesión y `idTokenChanges()` dirige el estado
//   reactivo; no se guardan credenciales ni copias del usuario en preferencias.
// - Google entrega una credencial que debe ser aceptada por Firebase antes de
//   crear el perfil usado por la interfaz.
// - Los datos de progreso se hidratan desde `users/{uid}` y los roles proceden
//   únicamente de custom claims o de ese perfil remoto protegido por reglas.
// - Cada operación asíncrona valida la sesión vigente y el ciclo de vida antes de
//   publicar cambios, evitando que una respuesta tardía restaure un usuario viejo.
//
// 📦 QUÉ (WHAT / ENTREGABLES):
// - `AuthService`: inicio con Google, cierre de sesión y perfil Firebase reactivo.
// - `authServiceProvider`: proveedor Riverpod consumido por la interfaz Android.
// ============================================================================

import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../models/user_profile.dart';

class AuthService extends ChangeNotifier {
  static const String _databaseId = 'appbaqueano';
  static const String _usersCollection = 'users';
  static const Set<String> _supportedRoles = {
    'explorer',
    'guide',
    'admin',
    'super_admin',
  };

  final firebase_auth.FirebaseAuth? _firebaseAuth;
  final FirebaseFirestore? _firestore;
  final GoogleSignIn _googleSignIn;

  StreamSubscription<firebase_auth.User?>? _idTokenSubscription;
  UserProfile? _currentUser;
  bool _isLoading = true;
  bool _isDisposed = false;
  int _synchronizationVersion = 0;
  String? _observedFirebaseUid;

  AuthService({
    firebase_auth.FirebaseAuth? firebaseAuth,
    FirebaseFirestore? firestore,
    GoogleSignIn? googleSignIn,
  }) : _firebaseAuth = firebaseAuth ?? _resolveFirebaseAuth(),
       _firestore = firestore ?? _resolveFirestore(),
       _googleSignIn =
           googleSignIn ??
           GoogleSignIn(
             serverClientId:
                 '578585227888-07hbecjlkb7kn08ku2dgm6039gjiqbvj.apps.googleusercontent.com',
             scopes: const ['email', 'profile'],
           ) {
    _listenToFirebaseSession();
  }

  UserProfile? get currentUser {
    final firebaseUser = _firebaseAuth?.currentUser;
    if (firebaseUser == null || _currentUser?.uid != firebaseUser.uid) {
      return null;
    }
    return _currentUser;
  }

  bool get isAuthenticated => _firebaseAuth?.currentUser != null;
  bool get isLoading => _isLoading;
  bool get isAdmin => isAuthenticated && (currentUser?.isAdmin ?? false);

  static firebase_auth.FirebaseAuth? _resolveFirebaseAuth() {
    try {
      return firebase_auth.FirebaseAuth.instance;
    } catch (error) {
      debugPrint('Firebase Auth no está disponible: $error');
      return null;
    }
  }

  static FirebaseFirestore? _resolveFirestore() {
    try {
      return FirebaseFirestore.instanceFor(
        app: Firebase.app(),
        databaseId: _databaseId,
      );
    } catch (error) {
      debugPrint('Firestore de perfiles no está disponible: $error');
      return null;
    }
  }

  void _listenToFirebaseSession() {
    final auth = _firebaseAuth;
    if (auth == null) {
      _isLoading = false;
      return;
    }

    _idTokenSubscription = auth.idTokenChanges().listen(
      (firebaseUser) {
        unawaited(_synchronizeFirebaseUser(firebaseUser));
      },
      onError: (Object error, StackTrace _) {
        debugPrint('Error observando la sesión Firebase: $error');
        if (auth.currentUser == null) {
          _currentUser = null;
        }
        _isLoading = false;
        _notifySafely();
      },
    );
  }

  Future<void> _synchronizeFirebaseUser(
    firebase_auth.User? firebaseUser,
  ) async {
    final incomingUid = firebaseUser?.uid;
    if (_observedFirebaseUid != incomingUid) {
      _observedFirebaseUid = incomingUid;
      ++_synchronizationVersion;
    }
    final synchronizationVersion = _synchronizationVersion;

    if (firebaseUser == null) {
      _currentUser = null;
      _isLoading = false;
      _notifySafely();
      return;
    }

    if (_currentUser?.uid != firebaseUser.uid) {
      _isLoading = true;
      _notifySafely();
    }

    UserProfile profile;
    try {
      profile = await _buildVerifiedProfile(firebaseUser);
    } catch (error) {
      debugPrint('Error construyendo el perfil Firebase: $error');
      profile = _buildFirebaseFallbackProfile(firebaseUser);
    }
    final activeFirebaseUser = _firebaseAuth?.currentUser;
    if (_isDisposed ||
        synchronizationVersion != _synchronizationVersion ||
        activeFirebaseUser?.uid != firebaseUser.uid) {
      return;
    }

    _currentUser = profile;
    _isLoading = false;
    _notifySafely();
  }

  Future<UserProfile> _buildVerifiedProfile(
    firebase_auth.User firebaseUser,
  ) async {
    final remoteProfile = await _loadRemoteProfile(firebaseUser.uid);
    final claimRole = await _loadRoleFromClaims(firebaseUser);
    final remoteRole = _normalizeRole(remoteProfile['role']);
    final safeRemoteRole =
        remoteRole == 'admin' || remoteRole == 'super_admin'
            ? null
            : remoteRole;
    final resolvedRole = claimRole ?? safeRemoteRole ?? 'explorer';

    final firebaseEmail = firebaseUser.email?.trim() ?? '';
    final firebaseDisplayName = firebaseUser.displayName?.trim() ?? '';
    final firebasePhotoUrl = firebaseUser.photoURL?.trim() ?? '';

    final mergedProfile = <String, dynamic>{
      ...remoteProfile,
      'email':
          firebaseEmail.isNotEmpty
              ? firebaseEmail
              : _nonEmptyString(remoteProfile['email']),
      'displayName':
          _nonEmptyString(remoteProfile['displayName']).isNotEmpty
              ? _nonEmptyString(remoteProfile['displayName'])
              : firebaseDisplayName,
      'photoUrl':
          _nonEmptyString(remoteProfile['photoUrl']).isNotEmpty
              ? _nonEmptyString(remoteProfile['photoUrl'])
              : firebasePhotoUrl,
      'role': resolvedRole,
      'explorerLevel':
          _nonEmptyString(remoteProfile['explorerLevel']).isNotEmpty
              ? _nonEmptyString(remoteProfile['explorerLevel'])
              : 'Novato',
      'xp': remoteProfile['xp'] ?? 0,
      'stamps': remoteProfile['stamps'] ?? const <String>[],
      'badges': remoteProfile['badges'] ?? const <String>[],
      'favorites': remoteProfile['favorites'] ?? const <String>[],
      'createdAt':
          remoteProfile['createdAt'] ??
          firebaseUser.metadata.creationTime ??
          DateTime.fromMillisecondsSinceEpoch(0, isUtc: true),
    };

    return UserProfile.fromMap(mergedProfile, firebaseUser.uid);
  }

  UserProfile _buildFirebaseFallbackProfile(firebase_auth.User firebaseUser) {
    return UserProfile(
      uid: firebaseUser.uid,
      email: firebaseUser.email?.trim() ?? '',
      displayName: firebaseUser.displayName?.trim() ?? '',
      photoUrl: firebaseUser.photoURL?.trim() ?? '',
      createdAt:
          firebaseUser.metadata.creationTime ??
          DateTime.fromMillisecondsSinceEpoch(0, isUtc: true),
    );
  }

  Future<Map<String, dynamic>> _loadRemoteProfile(String uid) async {
    final firestore = _firestore;
    if (firestore == null) {
      return const <String, dynamic>{};
    }

    try {
      final snapshot =
          await firestore.collection(_usersCollection).doc(uid).get();
      return snapshot.data() ?? const <String, dynamic>{};
    } catch (error) {
      debugPrint('No fue posible cargar el perfil remoto de Firebase: $error');
      return const <String, dynamic>{};
    }
  }

  Future<String?> _loadRoleFromClaims(firebase_auth.User firebaseUser) async {
    try {
      final tokenResult = await firebaseUser.getIdTokenResult();
      return _normalizeRole(tokenResult.claims?['role']);
    } catch (error) {
      debugPrint('No fue posible leer los roles del token Firebase: $error');
      return null;
    }
  }

  static String? _normalizeRole(Object? rawRole) {
    if (rawRole is! String) {
      return null;
    }
    final normalizedRole = rawRole.trim().toLowerCase();
    return _supportedRoles.contains(normalizedRole) ? normalizedRole : null;
  }

  static String _nonEmptyString(Object? value) {
    return value is String ? value.trim() : '';
  }

  /// Solicita una cuenta Google, pero solo publica el perfil después de que la
  /// credencial sea aceptada y exista como sesión activa en Firebase Auth.
  Future<bool> signInWithGoogle() async {
    final auth = _firebaseAuth;
    if (auth == null) {
      throw firebase_auth.FirebaseAuthException(
        code: 'firebase-not-initialized',
        message: 'Firebase Auth no está disponible en este dispositivo.',
      );
    }

    final previousFirebaseUid = auth.currentUser?.uid;
    _isLoading = true;
    _notifySafely();

    try {
      final googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        return false;
      }

      final googleAuthentication = await googleUser.authentication;
      if (googleAuthentication.idToken == null &&
          googleAuthentication.accessToken == null) {
        throw firebase_auth.FirebaseAuthException(
          code: 'missing-google-credential',
          message: 'Google no entregó una credencial verificable.',
        );
      }

      final credential = firebase_auth.GoogleAuthProvider.credential(
        accessToken: googleAuthentication.accessToken,
        idToken: googleAuthentication.idToken,
      );
      final userCredential = await auth.signInWithCredential(credential);
      final firebaseUser = userCredential.user;

      if (firebaseUser == null || auth.currentUser?.uid != firebaseUser.uid) {
        throw firebase_auth.FirebaseAuthException(
          code: 'missing-firebase-session',
          message:
              'Firebase no confirmó una sesión para la cuenta seleccionada.',
        );
      }

      await _synchronizeFirebaseUser(firebaseUser);
      if (!isAuthenticated || currentUser?.uid != firebaseUser.uid) {
        throw firebase_auth.FirebaseAuthException(
          code: 'profile-synchronization-failed',
          message: 'No fue posible sincronizar la identidad verificada.',
        );
      }

      return true;
    } catch (error) {
      debugPrint('Error en el flujo de autenticación Google/Firebase: $error');
      if (previousFirebaseUid == null && auth.currentUser != null) {
        try {
          await auth.signOut();
        } catch (rollbackError) {
          debugPrint('Error revirtiendo una sesión incompleta: $rollbackError');
        }
      }
      if (previousFirebaseUid == null) {
        try {
          await _googleSignIn.signOut();
        } catch (googleSignOutError) {
          debugPrint(
            'Error limpiando la cuenta Google incompleta: $googleSignOutError',
          );
        }
      }
      rethrow;
    } finally {
      _isLoading = false;
      _notifySafely();
    }
  }

  /// Cierra primero la sesión que constituye la autoridad de autenticación.
  /// Si Firebase no logra cerrarla, el método falla y no declara modo invitado.
  Future<void> signOut() async {
    final auth = _firebaseAuth;
    _isLoading = true;
    _notifySafely();

    Object? firebaseSignOutError;
    try {
      await auth?.signOut();
    } catch (error) {
      firebaseSignOutError = error;
      debugPrint('Error cerrando la sesión Firebase: $error');
    }

    if (auth?.currentUser == null) {
      if (_observedFirebaseUid != null) {
        _observedFirebaseUid = null;
        ++_synchronizationVersion;
      }
      _currentUser = null;
    }

    try {
      await _googleSignIn.signOut();
    } catch (error) {
      debugPrint('Error cerrando la sesión del selector Google: $error');
    } finally {
      _isLoading = false;
      _notifySafely();
    }

    if (auth?.currentUser != null) {
      if (firebaseSignOutError != null) {
        throw firebaseSignOutError;
      }
      throw StateError(
        'Firebase mantuvo una sesión activa después del cierre.',
      );
    }
  }

  void _notifySafely() {
    if (!_isDisposed) {
      notifyListeners();
    }
  }

  @override
  void dispose() {
    _isDisposed = true;
    unawaited(_idTokenSubscription?.cancel());
    super.dispose();
  }
}

final authServiceProvider = ChangeNotifierProvider<AuthService>((ref) {
  return AuthService();
});
