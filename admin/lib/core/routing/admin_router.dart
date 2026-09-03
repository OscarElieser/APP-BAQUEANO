// ============================================================================
// 🧭 BAQUEANO ADMIN — ENRUTADOR DECLARATIVO (ADMIN_ROUTER.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer enrutamiento declarativo y fluido para el Centro de Control Web de
//   BAQUEANO, con URLs canónicas limpias (`/dashboard`, `/negocios`, `/destinos`,
//   `/historia`, `/multimedia`, `/usuarios`, `/ajustes`) para navegación de escritorio.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Implementación con GoRouter 14+, redirección inicial de `/` hacia `/dashboard`,
//   manejo robusto de errores de ruta no encontrada y soporte de navegación web.
//
// 📦 3. QUÉ (WHAT / CLASE EXPUESTA):
// - `AdminRouter`: Configuración de GoRouter inyectable en `MaterialApp.router`.
// ============================================================================

// BAQUEANO
// ARCHIVO: admin_router.dart
// MÓDULO: Navegación & Enrutamiento
// PROYECTO: ADMIN WEB
// INTEGRACIÓN: GoRouter & MaterialApp.router
// CONSUMIDO POR: BaqueanoAdminApp (admin/lib/main.dart)
// RESPONSABILIDAD: Mapeo de rutas URL del portal administrativo.
// NO CONTIENE: Lógica de negocio ni widgets de clientes.

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/businesses/screens/businesses_management_screen.dart';
import '../../features/country_history/screens/country_history_admin_screen.dart';
import '../../features/dashboard/screens/dashboard_screen.dart';
import '../../features/destinations/screens/destinations_admin_screen.dart';
import '../../features/multimedia/screens/multimedia_center_screen.dart';
import '../../features/settings/screens/settings_audit_screen.dart';
import '../../features/users/screens/users_roles_screen.dart';

class AdminRouter {
  // INTEGRACIÓN: Configuración de rutas canónicas para el portal web administrativo
  static final GoRouter router = GoRouter(
    initialLocation: '/dashboard',
    routes: [
      GoRoute(
        path: '/',
        redirect: (_, __) => '/dashboard',
      ),
      GoRoute(
        path: '/dashboard',
        builder: (context, state) => const AdminDashboardScreen(),
      ),
      GoRoute(
        path: '/negocios',
        builder: (context, state) => const BusinessesManagementScreen(),
      ),
      GoRoute(
        path: '/destinos',
        builder: (context, state) => const DestinationsAdminScreen(),
      ),
      GoRoute(
        path: '/historia',
        builder: (context, state) => const CountryHistoryAdminScreen(),
      ),
      GoRoute(
        path: '/multimedia',
        builder: (context, state) => const MultimediaCenterScreen(),
      ),
      GoRoute(
        path: '/usuarios',
        builder: (context, state) => const UsersRolesScreen(),
      ),
      GoRoute(
        path: '/ajustes',
        builder: (context, state) => const SettingsAuditScreen(),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Center(
        child: Text(
          'Sección administrativa no encontrada: ${state.uri}',
          style: const TextStyle(color: Colors.white70),
        ),
      ),
    ),
  );
}
