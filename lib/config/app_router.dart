import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../features/admin/screens/admin_screen.dart';
import '../features/ai_assistant/screens/ai_assistant_screen.dart';
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
import '../features/map/screens/map_screen.dart';
import '../features/passport/screens/passport_screen.dart';
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
        builder: (context, state) => const PassportScreen(),
      ),
      GoRoute(
        path: '/perfil',
        redirect: (_, __) => '/pasaporte',
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
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Ruta no encontrada: ${state.uri}'),
      ),
    ),
  );
}
