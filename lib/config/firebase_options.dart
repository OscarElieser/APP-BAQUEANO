// ============================================================================
// 🔥 CONFIGURACIÓN OFICIAL DE FIREBASE (FIREBASE_OPTIONS.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Conectar la aplicación Baqueano con el backend oficial de Google Firebase
//   (Cloud Firestore, Firebase Auth, Cloud Storage) para persistencia de datos,
//   autenticación de exploradores y catálogos de expediciones.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Implementa `FirebaseOptions` con llaves y credenciales oficiales del proyecto
//   `app-baqueano` (Project Number: 578585227888).
// - Detección de plataforma en tiempo de ejecución centrada en Android.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & CONSTANTES EXPUESTAS):
// - `DefaultFirebaseOptions.currentPlatform`: Opciones dinámicas según plataforma.
// - `DefaultFirebaseOptions.android`: Configuración nativa para Android.
// ============================================================================

import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        return android;
    }
  }

  /// Clave de par de certificados web push (VAPID Key) para Cloud Messaging
  static const String fcmVapidKey =
      'BHsot1kXaFMuZazNykRZPGIq5nt8cLoPi2csUI-l5CyT9IUG3VNf7t4UAbLdBe72Nke25NOofS5xN-Z6TbQuWRI';

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyDgdMOJ19RjsgY79LXDIeWlZ48uW5Oo6GE',
    appId: '1:578585227888:android:223b5a060d18d2c6f2fab5',
    messagingSenderId: '578585227888',
    projectId: 'app-baqueano',
    databaseURL: 'https://app-baqueano-default-rtdb.firebaseio.com/',
    storageBucket: 'app-baqueano.firebasestorage.app',
  );

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyDgdMOJ19RjsgY79LXDIeWlZ48uW5Oo6GE',
    appId: '1:578585227888:web:3e5c9baqueano',
    messagingSenderId: '578585227888',
    projectId: 'app-baqueano',
    databaseURL: 'https://app-baqueano-default-rtdb.firebaseio.com/',
    storageBucket: 'app-baqueano.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyDgdMOJ19RjsgY79LXDIeWlZ48uW5Oo6GE',
    appId: '1:578585227888:ios:3e5c9baqueano',
    messagingSenderId: '578585227888',
    projectId: 'app-baqueano',
    databaseURL: 'https://app-baqueano-default-rtdb.firebaseio.com/',
    storageBucket: 'app-baqueano.firebasestorage.app',
    iosBundleId: 'com.company.appbaqueano',
  );
}
