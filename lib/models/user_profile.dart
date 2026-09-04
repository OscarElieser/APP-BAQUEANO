// ============================================================================
// 🧭 BAQUEANO — PERFIL DE USUARIO PROVENIENTE DE FUENTES VERIFICADAS
// ============================================================================
//
// 🎯 POR QUÉ (WHY / PROPÓSITO):
// - Representar la identidad y el progreso que la aplicación recibe de Firebase
//   sin fabricar logros, favoritos, puntos ni privilegios para perfiles nuevos.
// - Mantener valores defensivos cuando un documento remoto está incompleto o
//   contiene tipos inesperados, evitando estados nulos o excepciones de interfaz.
//
// ⚙️ CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - El modelo normaliza cadenas, listas, números, fechas y un conjunto cerrado de
//   roles admitidos; los valores ausentes equivalen a progreso inicial vacío.
// - `copyWith` permite actualizar datos de presentación y progreso, pero no el
//   rol. Los privilegios se vuelven a construir desde claims o perfil remoto.
// - Las fechas aceptan ISO-8601, milisegundos, `DateTime` y marcas Firestore con
//   `toDate()`, usando época Unix cuando el origen no aporta una fecha válida.
//
// 📦 QUÉ (WHAT / ENTREGABLES):
// - `UserProfile`, serialización defensiva y utilidades de rol para la UI.
// ============================================================================

import 'dart:convert';

class UserProfile {
  static const Set<String> _supportedRoles = {
    'explorer',
    'guide',
    'admin',
    'super_admin',
  };

  final String uid;
  final String email;
  final String displayName;
  final String photoUrl;
  final String role;
  final String explorerLevel;
  final int xp;
  final List<String> stamps;
  final List<String> badges;
  final List<String> favorites;
  final DateTime createdAt;

  const UserProfile({
    required this.uid,
    required this.email,
    required this.displayName,
    this.photoUrl = '',
    this.role = 'explorer',
    this.explorerLevel = 'Novato',
    this.xp = 0,
    this.stamps = const <String>[],
    this.badges = const <String>[],
    this.favorites = const <String>[],
    required this.createdAt,
  });

  bool get isAdmin => role == 'admin' || role == 'super_admin';
  bool get isGuide => role == 'guide';
  bool get isExplorer => role == 'explorer';

  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'email': email,
      'displayName': displayName,
      'photoUrl': photoUrl,
      'role': role,
      'explorerLevel': explorerLevel,
      'xp': xp,
      'stamps': List<String>.from(stamps),
      'badges': List<String>.from(badges),
      'favorites': List<String>.from(favorites),
      'createdAt': createdAt.toIso8601String(),
    };
  }

  String toJson() => jsonEncode(toMap());

  factory UserProfile.fromJson(String jsonString) {
    final decoded = jsonDecode(jsonString);
    if (decoded is! Map<String, dynamic>) {
      throw const FormatException('El perfil debe ser un objeto JSON.');
    }
    return UserProfile.fromMap(decoded, _readString(decoded['uid']));
  }

  factory UserProfile.fromMap(Map<String, dynamic> map, String uid) {
    return UserProfile(
      uid: uid.trim(),
      email: _readString(map['email']),
      displayName: _readString(map['displayName']),
      photoUrl: _readString(map['photoUrl']),
      role: _readRole(map['role']),
      explorerLevel: _readString(map['explorerLevel'], fallback: 'Novato'),
      xp: _readNonNegativeInt(map['xp']),
      stamps: _readStringList(map['stamps']),
      badges: _readStringList(map['badges']),
      favorites: _readStringList(map['favorites']),
      createdAt: _readDateTime(map['createdAt']),
    );
  }

  UserProfile copyWith({
    String? uid,
    String? email,
    String? displayName,
    String? photoUrl,
    String? explorerLevel,
    int? xp,
    List<String>? stamps,
    List<String>? badges,
    List<String>? favorites,
    DateTime? createdAt,
  }) {
    return UserProfile(
      uid: uid ?? this.uid,
      email: email ?? this.email,
      displayName: displayName ?? this.displayName,
      photoUrl: photoUrl ?? this.photoUrl,
      role: role,
      explorerLevel: explorerLevel ?? this.explorerLevel,
      xp: xp == null || xp < 0 ? this.xp : xp,
      stamps: stamps ?? this.stamps,
      badges: badges ?? this.badges,
      favorites: favorites ?? this.favorites,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  static String _readString(Object? value, {String fallback = ''}) {
    if (value is! String) {
      return fallback;
    }
    final normalized = value.trim();
    return normalized.isEmpty ? fallback : normalized;
  }

  static String _readRole(Object? value) {
    final normalized = _readString(value).toLowerCase();
    return _supportedRoles.contains(normalized) ? normalized : 'explorer';
  }

  static int _readNonNegativeInt(Object? value) {
    if (value is! num || !value.isFinite || value < 0) {
      return 0;
    }
    return value.toInt();
  }

  static List<String> _readStringList(Object? value) {
    if (value is! Iterable) {
      return const <String>[];
    }
    final items = value
        .whereType<String>()
        .map((item) => item.trim())
        .where((item) => item.isNotEmpty)
        .toSet()
        .toList(growable: false);
    return List<String>.unmodifiable(items);
  }

  static DateTime _readDateTime(Object? value) {
    if (value is DateTime) {
      return value;
    }
    if (value is String) {
      return DateTime.tryParse(value) ??
          DateTime.fromMillisecondsSinceEpoch(0, isUtc: true);
    }
    if (value is int && value >= 0) {
      return DateTime.fromMillisecondsSinceEpoch(value, isUtc: true);
    }

    try {
      final dynamic timestamp = value;
      final dynamic converted = timestamp?.toDate();
      if (converted is DateTime) {
        return converted;
      }
    } catch (_) {
      // Un valor remoto de otro tipo no debe impedir cargar el resto del perfil.
    }

    return DateTime.fromMillisecondsSinceEpoch(0, isUtc: true);
  }
}
