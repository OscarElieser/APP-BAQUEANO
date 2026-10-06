// ============================================================================
// 🧭 BAQUEANO — PRESENCIA ANDROID (lib/services/presence_service.dart)
// ============================================================================
// 🎯 POR QUÉ:
// - El Ops Center no veía a quienes usaban la app: Android no enviaba ninguna señal.
//   Web y Android comparten ahora el mismo backend (Edge Function baqueano-presence ->
//   Supabase presence_sessions/presence_events), sin una base aparte para la app.
//
// ⚙️ CÓMO:
// - Ids aleatorios en memoria por proceso de la app (tab_id y browser_id), sin guardarlos en
//   el teléfono: al cerrar la app desaparecen.
// - Latido cada 30 s en primer plano. Al pasar a segundo plano envía uno con visible=false
//   (el Ops Center lo muestra como "inactivo") y detiene el temporizador. Al volver,
//   reanuda. Si la app se cierra de golpe, el servidor la marca desconectada a los 90 s.
// - Si hay sesión de Firebase envía el ID Token en x-firebase-token: el servidor lo verifica
//   (firma, emisor y audiencia) y deduce UID, proveedor y rol. La app nunca declara su UID.
// - Ruta actual tomada de GoRouter (solo el path, sin parámetros).
// - Nunca rompe la app: cada error se ignora en silencio.
//
// 📦 QUÉ: PresenceService.instance.start() — llamado una vez desde main().
// ============================================================================
import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/widgets.dart';

import '../config/app_router.dart';

class PresenceService with WidgetsBindingObserver {
  PresenceService._();
  static final PresenceService instance = PresenceService._();

  static const String endpoint = String.fromEnvironment(
    'PRESENCE_ENDPOINT',
    defaultValue:
        'https://heiudfpthqwtjrtluqlm.supabase.co/functions/v1/baqueano-presence',
  );
  static const String appVersion =
      String.fromEnvironment('BAQUEANO_APP_VERSION', defaultValue: '1.0.0+1');
  static const Duration interval = Duration(seconds: 30);
  static const Set<String> _langs = {'es', 'en', 'fr', 'it', 'pt', 'de'};

  final String _tabId = _randomId();
  final String _deviceId = _randomId();
  Timer? _timer;
  bool _started = false;
  bool _visible = true;
  String _path = '/home';
  StreamSubscription<User?>? _authSub;

  static String _randomId() {
    final rnd = Random.secure();
    return List<int>.generate(16, (_) => rnd.nextInt(256))
        .map((b) => b.toRadixString(16).padLeft(2, '0'))
        .join();
  }

  void start() {
    if (_started) return;
    _started = true;
    WidgetsBinding.instance.addObserver(this);
    try {
      AppRouter.router.routerDelegate.addListener(_onRoute);
    } catch (_) {/* sin router: queda la ruta inicial */}
    try {
      _authSub = FirebaseAuth.instance.idTokenChanges().listen((_) => _send());
    } catch (_) {/* Firebase no inicializado: se envía como invitado */}
    _send();
    _schedule();
  }

  void _onRoute() {
    try {
      final path = AppRouter.router.routeInformationProvider.value.uri.path;
      if (path.isNotEmpty && path != _path) {
        _path = path;
        _send();
      }
    } catch (_) {/* ruta no disponible */}
  }

  void _schedule() {
    _timer?.cancel();
    if (!_visible) return;
    _timer = Timer.periodic(interval, (_) => _send());
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _visible = true;
      _send();
      _schedule();
    } else if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.hidden) {
      _visible = false;
      _timer?.cancel();
      _send();
    } else if (state == AppLifecycleState.detached) {
      _timer?.cancel();
      _send(leave: true);
    }
  }

  String _language() {
    final code =
        WidgetsBinding.instance.platformDispatcher.locale.languageCode.toLowerCase();
    return _langs.contains(code) ? code : 'es';
  }

  Future<void> _send({bool leave = false}) async {
    String? token;
    try {
      token = await FirebaseAuth.instance.currentUser?.getIdToken();
    } catch (_) {
      token = null;
    }
    final client = HttpClient()..connectionTimeout = const Duration(seconds: 5);
    try {
      final request = await client
          .postUrl(Uri.parse(endpoint))
          .timeout(const Duration(seconds: 8));
      request.headers
          .set(HttpHeaders.contentTypeHeader, 'application/json; charset=utf-8');
      if (token != null && token.isNotEmpty) {
        request.headers.set('x-firebase-token', token);
      }
      request.write(jsonEncode({
        'action': 'heartbeat',
        'tab_id': _tabId,
        'browser_id': _deviceId,
        'platform': 'android',
        'device': 'mobile',
        'app_version': appVersion,
        'path': _path,
        'language': _language(),
        'visible': _visible,
        'leave': leave,
      }));
      final response =
          await request.close().timeout(const Duration(seconds: 8));
      await response.drain<void>();
    } catch (_) {
      // La presencia nunca interrumpe la app.
    } finally {
      client.close(force: false);
    }
  }

  Future<void> dispose() async {
    _timer?.cancel();
    await _authSub?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    _started = false;
  }
}
