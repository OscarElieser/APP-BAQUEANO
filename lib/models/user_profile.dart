import 'dart:convert';

class UserProfile {
  final String uid;
  final String email;
  final String displayName;
  final String photoUrl;
  final String role; // 'explorer', 'guide', 'admin'
  final String explorerLevel; // 'Novato', 'Aventurero', 'Baqueano Maestro'
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
    this.explorerLevel = 'Aventurero',
    this.xp = 1150,
    this.stamps = const ['somoto', 'cerro-negro', 'cascada-luna', 'ometepe'],
    this.badges = const ['primer-sendero', 'guardian-del-fuego', 'navegante-de-canones', 'catador-de-altura'],
    this.favorites = const ['cascada-la-luna', 'canon-de-somoto'],
    required this.createdAt,
  });

  bool get isAdmin => role == 'admin';
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
      'stamps': stamps,
      'badges': badges,
      'favorites': favorites,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  String toJson() => jsonEncode(toMap());

  factory UserProfile.fromJson(String jsonStr) {
    final map = jsonDecode(jsonStr) as Map<String, dynamic>;
    return UserProfile.fromMap(map, map['uid'] ?? '');
  }

  factory UserProfile.fromMap(Map<String, dynamic> map, String uid) {
    return UserProfile(
      uid: uid,
      email: map['email'] ?? '',
      displayName: map['displayName'] ?? 'Explorador Baqueano',
      photoUrl: map['photoUrl'] ?? '',
      role: map['role'] ?? 'explorer',
      explorerLevel: map['explorerLevel'] ?? 'Aventurero',
      xp: (map['xp'] as num?)?.toInt() ?? 1150,
      stamps: List<String>.from(map['stamps'] ?? []),
      badges: List<String>.from(map['badges'] ?? []),
      favorites: List<String>.from(map['favorites'] ?? []),
      createdAt: map['createdAt'] != null
          ? DateTime.tryParse(map['createdAt']) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  UserProfile copyWith({
    String? uid,
    String? email,
    String? displayName,
    String? photoUrl,
    String? role,
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
      role: role ?? this.role,
      explorerLevel: explorerLevel ?? this.explorerLevel,
      xp: xp ?? this.xp,
      stamps: stamps ?? this.stamps,
      badges: badges ?? this.badges,
      favorites: favorites ?? this.favorites,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
