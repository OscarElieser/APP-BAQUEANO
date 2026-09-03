// ============================================================================
// 🧭 BAQUEANO ADMIN — PUNTO DE ENTRADA WEB (MAIN.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Actuar como el punto de inicio de la plataforma web administrativa independiente
//   de BAQUEANO, permitiendo a los directores y gestores controlar en tiempo real
//   el catálogo de comercios, rutas turísticas, patrimonio histórico y multimedia.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Inicialización asíncrona de Google Firebase con `DefaultFirebaseOptions.currentPlatform`.
// - Envoltorio global con `ProviderScope` para reactividad con Riverpod.
// - Enrutamiento declarativo vía `AdminRouter.router` (GoRouter).
// - Tema oscuro con paleta volcánica oficial (#082B35, #C86432, #D4AF37, #0F172A).
//
// 📦 3. QUÉ (WHAT / WIDGET RAÍZ EXPUESTO):
// - `BaqueanoAdminApp`: Aplicación Flutter Web con MaterialApp.router.
// ============================================================================

// BAQUEANO
// ARCHIVO: main.dart
// MÓDULO: Arranque & Configuración
// PROYECTO: ADMIN WEB
// INTEGRACIÓN: Firebase Core, Riverpod, GoRouter & Flutter Web
// CONSUMIDO POR: Motor Web del navegador
// RESPONSABILIDAD: Inicializar servicios base y renderizar la interfaz administrativa.
// NO CONTIENE: Lógica de presentación de clientes o turistas.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:baqueano_app/config/firebase_options.dart';
import 'core/routing/admin_router.dart';
import 'core/theme/admin_colors.dart';

Future<void> main() async {
  // INTEGRACIÓN: Asegurar bindings de Flutter antes de llamadas asíncronas
  WidgetsFlutterBinding.ensureInitialized();

  // INTEGRACIÓN: Inicialización de Firebase con captura elegante
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  } catch (e) {
    debugPrint('Aviso de inicialización Firebase Admin: $e');
  }

  // INTEGRACIÓN: Inyección de ProviderScope para gestión de estado reactivo
  runApp(
    const ProviderScope(
      child: BaqueanoAdminApp(),
    ),
  );
}

class BaqueanoAdminApp extends StatelessWidget {
  const BaqueanoAdminApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'BAQUEANO · Centro de Control & Administración',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: AdminColors.bgDark,
        primaryColor: AdminColors.primaryDark,
        colorScheme: const ColorScheme.dark(
          primary: AdminColors.terracotta,
          secondary: AdminColors.gold,
          surface: AdminColors.bgCard,
        ),
      ),
      routerConfig: AdminRouter.router,
    );
  }
}
