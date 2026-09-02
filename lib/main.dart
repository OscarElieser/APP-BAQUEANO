// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PUNTO DE ENTRADA PRINCIPAL (MAIN.DART)
// ============================================================================
//
// 🎯 POR QUÉ (WHY / PROPÓSITO):
// Proveer una experiencia de usuario inmersiva, exótica y de alto rendimiento que
// digitalice las rutas turísticas campesinas de Nicaragua, garantizando acceso
// directo sin intermediarios entre exploradores nacionales/internacionales y
// comunidades locales mediante una infraestructura multiplataforma moderna.
//
// ⚙️ CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// 1. Configuración de pantalla Edge-to-Edge con barras de sistema transparentes.
// 2. Inicialización asíncrona de Firebase (Cloud Firestore, Auth, Storage).
// 3. Envoltorio global en ProviderScope (Riverpod) para inyección de dependencias.
// 4. Enrutamiento declarativo y responsivo con GoRouter y tema oscuro volcánico.
//
// 📦 QUÉ (WHAT / ENTREGABLE):
// Widget raíz BaqueanoApp configurado con MaterialApp.router, soporte adaptativo
// para Android, iOS y Web, tipografía Montserrat/Space Grotesk y paleta volcánica.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_app_check/firebase_app_check.dart';
import 'config/app_router.dart';
import 'config/firebase_options.dart';
import 'core/theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Edge-to-Edge transparent system bars on mobile
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Colors.transparent,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  // Initialize Firebase with graceful catch
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );

    // Initialize Firebase App Check for Android security & bot protection
    await FirebaseAppCheck.instance.activate(
      androidProvider: AndroidProvider.debug,
      appleProvider: AppleProvider.debug,
    );
  } catch (e) {
    debugPrint('Firebase initialization notice: $e');
  }

  runApp(
    const ProviderScope(
      child: BaqueanoApp(),
    ),
  );
}

class BaqueanoApp extends StatelessWidget {
  const BaqueanoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'BAQUEANO · Nicaragua en Modo Secreto',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      routerConfig: AppRouter.router,
    );
  }
}
