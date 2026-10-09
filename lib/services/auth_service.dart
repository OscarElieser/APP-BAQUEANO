// ============================================================================
// 🧭 BAQUEANO — SERVICIO DE AUTENTICACIÓN CON IDENTIDAD VERIFICADA
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Garantizar que una persona solo figure como autenticada cuando Firebase Auth
//   mantenga una sesión válida para ella.
// - Evitar perfiles locales, sesiones paralelas y cambios de rol desde el APK,
//   porque ninguno de esos mecanismos constituye una identidad verificable.
// - Conservar un acceso de invitado explícito sin asociarle UID, correo ni rol.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Firebase Auth conserva su propia sesión y `idTokenChanges()` dirige el estado
//   reactivo; no se guardan credenciales ni copias del usuario en preferencias.
// - Google entrega una credencial que debe ser aceptada por Firebase antes de
//   crear el perfil usado por la interfaz.
// - Los datos de progreso se hidratan desde `users/{uid}` y los roles proceden
//   únicamente de custom claims o de ese perfil remoto protegido por reglas.
// - Cada operación asíncrona valida la sesión vigente y el ciclo de vida antes de
//   publicar cambios, evitando que una respuesta tardía restaure un usuario viejo.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES):
// - `AuthService`: inicio con Google, cierre de sesión y perfil Firebase reactivo.
// - `authServiceProvider`: proveedor Riverpod consumido por la interfaz Android.
// ============================================================================

import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
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
  bool _googleSignInInFlight = false;
  int _synchronizationVersion = 0;
  String? _observedFirebaseUid;

  AuthService({
    firebase_auth.FirebaseAuth? firebaseAuth,
    FirebaseFirestore? firestore,
    GoogleSignIn? googleSignIn,
  }) : _firebaseAuth = firebaseAuth ?? _resolveFirebaseAuth(),
       _firestore = firestore ?? _resolveFirestore(),
       _googleSignIn =
           googleSignIn ?? GoogleSignIn(scopes: const ['email', 'profile']) {
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
      try {
        return FirebaseFirestore.instance;
      } catch (_) {
        debugPrint('Firestore de perfiles no está disponible: $error');
        return null;
      }
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

    try {
      final remoteProfile = await _fetchRemoteUserProfile(firebaseUser);
      if (_isDisposed || synchronizationVersion != _synchronizationVersion) {
        return;
      }

      final resolvedRole =
          remoteProfile?.role ??
          await _fetchTokenRole(firebaseUser) ??
          'explorer';

      final unifiedProfile = remoteProfile != null
          ? remoteProfile.copyWith(
              email: (firebaseUser.email?.isNotEmpty ?? false)
                  ? firebaseUser.email
                  : remoteProfile.email,
              displayName: (firebaseUser.displayName?.isNotEmpty ?? false)
                  ? firebaseUser.displayName!
                  : (remoteProfile.displayName.isNotEmpty
                      ? remoteProfile.displayName
                      : (firebaseUser.email?.split('@').first ?? 'Explorador')),
              photoUrl: (firebaseUser.photoURL?.isNotEmpty ?? false)
                  ? firebaseUser.photoURL
                  : remoteProfile.photoUrl,
            )
          : UserProfile(
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? '',
              displayName:
                  (firebaseUser.displayName?.isNotEmpty ?? false)
                      ? firebaseUser.displayName!
                      : (firebaseUser.email?.split('@').first ?? 'Explorador'),
              photoUrl: firebaseUser.photoURL ?? '',
              role: resolvedRole,
              explorerLevel: 'Novato',
              createdAt: DateTime.now(),
            );

      _currentUser = unifiedProfile;
      unawaited(_persistAndroidUserSession(firebaseUser, unifiedProfile));
    } catch (error) {
      if (_isDisposed || synchronizationVersion != _synchronizationVersion) {
        return;
      }

      debugPrint('Aviso: perfil Firestore diferido para ${firebaseUser.uid}: $error');
      _currentUser = UserProfile(
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? '',
        displayName:
            firebaseUser.displayName ??
            firebaseUser.email?.split('@').first ??
            'Explorador',
        photoUrl: firebaseUser.photoURL ?? '',
        role: 'explorer',
        explorerLevel: 'Novato',
        createdAt: DateTime.now(),
      );
    } finally {
      if (!_isDisposed &&
          synchronizationVersion == _synchronizationVersion) {
        _isLoading = false;
        _notifySafely();
      }
    }
  }

  Future<UserProfile?> _fetchRemoteUserProfile(
    firebase_auth.User firebaseUser,
  ) async {
    final firestore = _firestore;
    if (firestore == null) {
      return null;
    }

    final doc =
        await firestore.collection(_usersCollection).doc(firebaseUser.uid).get();

    if (!doc.exists) {
      return null;
    }

    final data = doc.data();
    if (data == null) {
      return null;
    }

    return UserProfile.fromMap(data, firebaseUser.uid);
  }

  Future<String?> _fetchTokenRole(firebase_auth.User firebaseUser) async {
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

    if (_googleSignInInFlight) {
      throw firebase_auth.FirebaseAuthException(
        code: 'google-sign-in-in-progress',
        message:
            'Google ya tiene una solicitud de acceso en curso. Espera unos segundos e inténtalo nuevamente.',
      );
    }

    final previousFirebaseUid = auth.currentUser?.uid;
    _googleSignInInFlight = true;
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
    } on firebase_auth.FirebaseAuthException catch (error) {
      _logAuthDiagnostic('FirebaseAuthException', error.code, error.message);
      await _rollbackIncompleteGoogleSession(auth, previousFirebaseUid);
      rethrow;
    } on PlatformException catch (error) {
      _logAuthDiagnostic('PlatformException', error.code, error.message);
      await _rollbackIncompleteGoogleSession(auth, previousFirebaseUid);
      if (_isGoogleSignInInProgressError(error)) {
        throw firebase_auth.FirebaseAuthException(
          code: 'google-sign-in-in-progress',
          message:
              'Google canceló esta solicitud porque ya había un acceso en curso. Cierra el selector de Google e inténtalo una sola vez.',
        );
      }
      rethrow;
    } catch (error) {
      _logAuthDiagnostic(
        error.runtimeType.toString(),
        'unknown',
        error.toString(),
      );
      await _rollbackIncompleteGoogleSession(auth, previousFirebaseUid);
      rethrow;
    } finally {
      _googleSignInInFlight = false;
      _isLoading = false;
      _notifySafely();
    }
  }

  static bool _isGoogleSignInInProgressError(PlatformException error) {
    final message =
        (error.message ?? error.details?.toString() ?? '').toLowerCase();
    return error.code == 'sign_in_failed' &&
        (message.contains('12502') ||
            message.contains('sign_in_currently_in_progress'));
  }

  void _logAuthDiagnostic(String type, String code, String? message) {
    final sanitizedMessage =
        (message ?? 'Sin mensaje')
            .replaceAll(RegExp(r'idToken=[^,\s]+'), 'idToken=[redacted]')
            .replaceAll(
              RegExp(r'accessToken=[^,\s]+'),
              'accessToken=[redacted]',
            )
            .replaceAll(
              RegExp(r'authorizationCode=[^,\s]+'),
              'authorizationCode=[redacted]',
            )
            .split('\n')
            .first;
    debugPrint(
      'Auth diagnostic [$type]: code=$code, message=$sanitizedMessage',
    );
  }

  Future<void> _rollbackIncompleteGoogleSession(
    firebase_auth.FirebaseAuth auth,
    String? previousFirebaseUid,
  ) async {
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

  /// Elimina definitivamente la cuenta del usuario en Firebase Auth y Firestore,
  /// anonimizando y suprimiendo sus datos de conformidad con las directivas
  /// de privacidad, derechos ARCO y requisitos de Google Play Store.
  Future<void> deleteAccount() async {
    final auth = _firebaseAuth;
    final firebaseUser = auth?.currentUser;
    if (firebaseUser == null) {
      throw StateError('No hay sesión activa para eliminar.');
    }

    _isLoading = true;
    _notifySafely();

    final uid = firebaseUser.uid;
    try {
      // 1. Eliminar documento del usuario en Firestore (users/{uid})
      try {
        await _firestore?.collection(_usersCollection).doc(uid).delete();
      } catch (firestoreError) {
        debugPrint('Aviso al suprimir documento de Firestore: $firestoreError');
      }

      // 2. Eliminar la identidad del usuario en Firebase Authentication
      await firebaseUser.delete();

      // 3. Cerrar la sesión asociada en Google Sign-In
      try {
        await _googleSignIn.signOut();
      } catch (googleError) {
        debugPrint(
          'Aviso cerrando sesión Google tras supresión: $googleError',
        );
      }

      _currentUser = null;
      _observedFirebaseUid = null;
      ++_synchronizationVersion;
    } catch (error) {
      debugPrint('Error en la eliminación definitiva de cuenta: $error');
      rethrow;
    } finally {
      _isLoading = false;
      _notifySafely();
    }
  }

  Future<void> _persistAndroidUserSession(
    firebase_auth.User firebaseUser,
    UserProfile profile,
  ) async {
    final firestore = _firestore;
    if (firestore == null) return;
    try {
      final userMap = <String, dynamic>{
        'uid': firebaseUser.uid,
        'email': profile.email,
        'displayName': profile.displayName,
        'photoUrl': profile.photoUrl,
        'role': profile.role,
        'platform': 'android',
        'explorerLevel': profile.explorerLevel,
        'status': 'active',
        'lastLogin': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
      };
      await firestore
          .collection(_usersCollection)
          .doc(firebaseUser.uid)
          .set(userMap, SetOptions(merge: true));

      await firestore.collection('audit_logs').add({
        'action': 'USER_LOGIN_ANDROID',
        'platform': 'android',
        'userId': firebaseUser.uid,
        'userEmail': profile.email,
        'performedBy':
            profile.displayName.isNotEmpty
                ? profile.displayName
                : (profile.email.isNotEmpty
                    ? profile.email
                    : 'Explorador Android'),
        'details': 'Inicio de sesión verificado en App Android Baqueano',
        'timestamp': FieldValue.serverTimestamp(),
      });
    } catch (error) {
      debugPrint('Aviso: telemetría de usuario Android diferida: $error');
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
