import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart' show defaultTargetPlatform, kIsWeb, TargetPlatform;

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
        return web;
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyDemoBaqueanoNicaragua2026Key',
    appId: '1:108234857284:web:3e5c9baqueano',
    messagingSenderId: '108234857284',
    projectId: 'baqueanonicaragua-3e5c9',
    authDomain: 'baqueanonicaragua-3e5c9.firebaseapp.com',
    storageBucket: 'baqueanonicaragua-3e5c9.appspot.com',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyDemoBaqueanoNicaragua2026Key',
    appId: '1:108234857284:android:3e5c9baqueano',
    messagingSenderId: '108234857284',
    projectId: 'baqueanonicaragua-3e5c9',
    storageBucket: 'baqueanonicaragua-3e5c9.appspot.com',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyDemoBaqueanoNicaragua2026Key',
    appId: '1:108234857284:ios:3e5c9baqueano',
    messagingSenderId: '108234857284',
    projectId: 'baqueanonicaragua-3e5c9',
    storageBucket: 'baqueanonicaragua-3e5c9.appspot.com',
    iosBundleId: 'com.baqueano.app',
  );
}
