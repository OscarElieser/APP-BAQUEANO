// ============================================================================
// 🗺️ ENRUTADOR PRINCIPAL DECLARATIVO (APP_ROUTER.DART)
// ============================================================================
//
// 🎯 POR QUÉ (WHY / PROPÓSITO):
// Permitir una navegación fluida, profunda y con URLs canónicas (Web) y transiciones
// nativas (Android/iOS) a través de todos los módulos de exploración, catálogo,
// mapa GPS, inteligencia artificial, pasaporte y panel de control CMS.
//
// ⚙️ CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// Utiliza GoRouter 14+ con enrutamiento declarativo, soporte para parámetros de ruta,
// redirecciones automáticas (ej. `/` hacia `/splash`), y carga optimizada de páginas.
//
// 📦 QUÉ (WHAT / ENTREGABLE):
// Definición de todas las 16 rutas canónicas de la aplicación Baqueano:
// `/splash`, `/home`, `/descubrir`, `/mapa`, `/ai`, `/pasaporte`, `/gastronomia`,
// `/musica`, `/videos`, `/playas`, `/hospedaje`, `/nocturna`, `/turismo`, `/marca`,
// `/ayuda`, `/terminos`, `/privacidad`, `/admin`.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../features/admin/screens/admin_screen.dart';
import '../features/ai_assistant/screens/ai_assistant_screen.dart';
import '../features/auth/screens/login_screen.dart';
import '../features/catalog/screens/beaches_screen.dart';
import '../features/catalog/screens/discover_screen.dart';
import '../features/catalog/screens/gastronomy_screen.dart';
import '../features/catalog/screens/lodging_screen.dart';
import '../features/catalog/screens/music_screen.dart';
import '../features/catalog/screens/nightlife_screen.dart';
import '../features/catalog/screens/tourism_screen.dart';
import '../features/catalog/screens/videos_screen.dart';
import '../features/community/screens/community_screen.dart';
import '../features/home/screens/home_screen.dart';
import '../features/institutional/screens/brand_screen.dart';
import '../features/institutional/screens/help_screen.dart';
import '../features/institutional/screens/privacy_screen.dart';
import '../features/institutional/screens/terms_screen.dart';
import '../features/emergency/screens/emergency_sos_screen.dart';
import '../features/history/screens/expedition_history_screen.dart';
import '../features/map/screens/map_screen.dart';
import '../features/messaging/screens/host_messaging_screen.dart';
import '../features/environmental/screens/environmental_campaign_screen.dart';
import '../features/monetization/screens/business_pricing_screen.dart';
import '../features/notifications/screens/notifications_screen.dart';
import '../features/profile/screens/profile_screen.dart';
import '../features/country_history/screens/country_history_screen.dart';
import '../features/search/screens/universal_search_screen.dart';
import '../features/splash/screens/splash_screen.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/splash',
    routes: [
      GoRoute(
        path: '/',
        redirect: (_, __) => '/splash',
      ),
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/home',
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: '/descubrir',
        builder: (context, state) => const DiscoverScreen(),
      ),
      GoRoute(
        path: '/mapa',
        builder: (context, state) => const MapScreen(),
      ),
      GoRoute(
        path: '/ai',
        builder: (context, state) => const AiAssistantScreen(),
      ),
      GoRoute(
        path: '/pasaporte',
        redirect: (_, __) => '/perfil',
      ),
      GoRoute(
        path: '/perfil',
        builder: (context, state) => const ProfileScreen(),
      ),
      GoRoute(
        path: '/historial',
        builder: (context, state) => const ExpeditionHistoryScreen(),
      ),
      GoRoute(
        path: '/notificaciones',
        builder: (context, state) => const NotificationsScreen(),
      ),
      GoRoute(
        path: '/mensajes',
        builder: (context, state) => const HostMessagingScreen(),
      ),
      GoRoute(
        path: '/busqueda',
        builder: (context, state) => const UniversalSearchScreen(),
      ),
      GoRoute(
        path: '/sos',
        builder: (context, state) => const EmergencySosScreen(),
      ),
      // Cultural Catalog
      GoRoute(
        path: '/gastronomia',
        builder: (context, state) => const GastronomyScreen(),
      ),
      GoRoute(
        path: '/musica',
        builder: (context, state) => const MusicScreen(),
      ),
      GoRoute(
        path: '/videos',
        builder: (context, state) => const VideosScreen(),
      ),
      GoRoute(
        path: '/playas',
        builder: (context, state) => const BeachesScreen(),
      ),
      GoRoute(
        path: '/hospedaje',
        builder: (context, state) => const LodgingScreen(),
      ),
      GoRoute(
        path: '/nocturna',
        builder: (context, state) => const NightlifeScreen(),
      ),
      GoRoute(
        path: '/turismo',
        builder: (context, state) => const TourismScreen(),
      ),
      GoRoute(
        path: '/destinos',
        redirect: (_, __) => '/turismo',
      ),
      // Campaña Ambiental y Cuidado de Recursos (con aliases)
      GoRoute(
        path: '/campana-ambiental',
        builder: (context, state) => const EnvironmentalCampaignScreen(),
      ),
      GoRoute(
        path: '/campana_ambiental',
        redirect: (_, __) => '/campana-ambiental',
      ),
      GoRoute(
        path: '/ambiental',
        redirect: (_, __) => '/campana-ambiental',
      ),
      GoRoute(
        path: '/ambiente',
        redirect: (_, __) => '/campana-ambiental',
      ),
      GoRoute(
        path: '/recursos',
        redirect: (_, __) => '/campana-ambiental',
      ),
      // Historia de mi país (Nicaragua y modular)
      GoRoute(
        path: '/historia-mi-pais',
        builder: (context, state) => const CountryHistoryScreen(),
      ),
      GoRoute(
        path: '/historia-mi-pais/:countryId',
        builder: (context, state) {
          final countryId = state.pathParameters['countryId'] ?? 'nicaragua';
          return CountryHistoryScreen(countryId: countryId);
        },
      ),
      // Community & Support
      GoRoute(
        path: '/comunidad',
        builder: (context, state) => const CommunityScreen(),
      ),
      GoRoute(
        path: '/relatos',
        redirect: (_, __) => '/comunidad',
      ),
      GoRoute(
        path: '/marca',
        builder: (context, state) => const BrandScreen(),
      ),
      GoRoute(
        path: '/ayuda',
        builder: (context, state) => const HelpScreen(),
      ),
      GoRoute(
        path: '/terminos',
        builder: (context, state) => const TermsScreen(),
      ),
      GoRoute(
        path: '/privacidad',
        builder: (context, state) => const PrivacyScreen(),
      ),
      GoRoute(
        path: '/admin',
        builder: (context, state) => const AdminScreen(),
      ),
      GoRoute(
        path: '/planes-negocios',
        builder: (context, state) => const BusinessPricingScreen(),
      ),
      GoRoute(
        path: '/planes_negocios',
        redirect: (_, __) => '/planes-negocios',
      ),
      GoRoute(
        path: '/planes',
        redirect: (_, __) => '/planes-negocios',
      ),
      GoRoute(
        path: '/afiliacion',
        redirect: (_, __) => '/planes-negocios',
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Ruta no encontrada: ${state.uri}'),
      ),
    ),
  );
}
