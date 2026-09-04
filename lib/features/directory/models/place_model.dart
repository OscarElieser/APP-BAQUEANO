// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MODELO CENTRAL DE LUGARES Y ESTABLECIMIENTOS (PLACE MODEL)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Servir como el modelo canónico de datos para cualquier establecimiento,
//   sitio histórico, punto turístico, centro de salud o servicio de emergencia
//   en los 15 departamentos y 2 regiones autónomas de Nicaragua.
// - Soportar geolocalización precisa (lat/lng/geohash), verificación oficial,
//   canales de contacto directo (teléfono, WhatsApp, web) y cálculo de distancia.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Inmutable con serialización segura desde/hacia Map y Firestore.
// - Validación defensiva de nulos y tipos numéricos.
// - Campo dinámico `distanceKm` para ordenamiento "Cerca de ti".
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & MODELO EXPUESTO):
// - `PlaceModel`: Entidad central con todos los campos especificados por el proyecto.
// ============================================================================

class PlaceModel {
  final String placeId;
  final String name;
  final String categoryId;
  final String categoryName;
  final String subcategory;
  final String description;

  final String departmentId;
  final String departmentName;

  final String municipalityId;
  final String municipalityName;

  final String address;

  final double latitude;
  final double longitude;
  final String geohash;

  final String? phone;
  final String? whatsapp;
  final String? website;

  final String imageUrl;
  final List<String> imageUrls;

  final String? openingHours;
  final bool is24Hours;
  final bool isOpen;

  final bool isEmergency;
  final bool isTourist;
  final bool isCommercial;

  final bool verified;
  final String? verificationSource;
  final String? sourceUrl;
  final DateTime? lastVerifiedAt;

  final double rating;
  final int reviewCount;

  final String status; // 'published', 'draft', 'archived'

  final DateTime createdAt;
  final DateTime updatedAt;

  /// Distancia en kilómetros calculada respecto a la posición actual del usuario.
  final double? distanceKm;

  const PlaceModel({
    required this.placeId,
    required this.name,
    required this.categoryId,
    required this.categoryName,
    this.subcategory = '',
    this.description = '',
    required this.departmentId,
    required this.departmentName,
    required this.municipalityId,
    required this.municipalityName,
    required this.address,
    required this.latitude,
    required this.longitude,
    this.geohash = '',
    this.phone,
    this.whatsapp,
    this.website,
    this.imageUrl = '',
    this.imageUrls = const [],
    this.openingHours,
    this.is24Hours = false,
    this.isOpen = true,
    this.isEmergency = false,
    this.isTourist = false,
    this.isCommercial = false,
    this.verified = false,
    this.verificationSource,
    this.sourceUrl,
    this.lastVerifiedAt,
    this.rating = 5.0,
    this.reviewCount = 0,
    this.status = 'published',
    required this.createdAt,
    required this.updatedAt,
    this.distanceKm,
  });

  PlaceModel copyWith({
    String? placeId,
    String? name,
    String? categoryId,
    String? categoryName,
    String? subcategory,
    String? description,
    String? departmentId,
    String? departmentName,
    String? municipalityId,
    String? municipalityName,
    String? address,
    double? latitude,
    double? longitude,
    String? geohash,
    String? phone,
    String? whatsapp,
    String? website,
    String? imageUrl,
    List<String>? imageUrls,
    String? openingHours,
    bool? is24Hours,
    bool? isOpen,
    bool? isEmergency,
    bool? isTourist,
    bool? isCommercial,
    bool? verified,
    String? verificationSource,
    String? sourceUrl,
    DateTime? lastVerifiedAt,
    double? rating,
    int? reviewCount,
    String? status,
    DateTime? createdAt,
    DateTime? updatedAt,
    double? distanceKm,
  }) {
    return PlaceModel(
      placeId: placeId ?? this.placeId,
      name: name ?? this.name,
      categoryId: categoryId ?? this.categoryId,
      categoryName: categoryName ?? this.categoryName,
      subcategory: subcategory ?? this.subcategory,
      description: description ?? this.description,
      departmentId: departmentId ?? this.departmentId,
      departmentName: departmentName ?? this.departmentName,
      municipalityId: municipalityId ?? this.municipalityId,
      municipalityName: municipalityName ?? this.municipalityName,
      address: address ?? this.address,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      geohash: geohash ?? this.geohash,
      phone: phone ?? this.phone,
      whatsapp: whatsapp ?? this.whatsapp,
      website: website ?? this.website,
      imageUrl: imageUrl ?? this.imageUrl,
      imageUrls: imageUrls ?? this.imageUrls,
      openingHours: openingHours ?? this.openingHours,
      is24Hours: is24Hours ?? this.is24Hours,
      isOpen: isOpen ?? this.isOpen,
      isEmergency: isEmergency ?? this.isEmergency,
      isTourist: isTourist ?? this.isTourist,
      isCommercial: isCommercial ?? this.isCommercial,
      verified: verified ?? this.verified,
      verificationSource: verificationSource ?? this.verificationSource,
      sourceUrl: sourceUrl ?? this.sourceUrl,
      lastVerifiedAt: lastVerifiedAt ?? this.lastVerifiedAt,
      rating: rating ?? this.rating,
      reviewCount: reviewCount ?? this.reviewCount,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      distanceKm: distanceKm ?? this.distanceKm,
    );
  }

  /// Retorna un texto amigable de la distancia (ej. "1.2 km" o "450 m")
  String get formattedDistance {
    if (distanceKm == null) return '';
    if (distanceKm! < 1.0) {
      return '${(distanceKm! * 1000).round()} m';
    }
    return '${distanceKm!.toStringAsFixed(1)} km';
  }

  Map<String, dynamic> toMap() {
    return {
      'placeId': placeId,
      'name': name,
      'categoryId': categoryId,
      'categoryName': categoryName,
      'subcategory': subcategory,
      'description': description,
      'departmentId': departmentId,
      'departmentName': departmentName,
      'municipalityId': municipalityId,
      'municipalityName': municipalityName,
      'address': address,
      'latitude': latitude,
      'longitude': longitude,
      'geohash': geohash,
      'phone': phone,
      'whatsapp': whatsapp,
      'website': website,
      'imageUrl': imageUrl,
      'imageUrls': imageUrls,
      'openingHours': openingHours,
      'is24Hours': is24Hours,
      'isOpen': isOpen,
      'isEmergency': isEmergency,
      'isTourist': isTourist,
      'isCommercial': isCommercial,
      'verified': verified,
      'verificationSource': verificationSource,
      'sourceUrl': sourceUrl,
      'lastVerifiedAt': lastVerifiedAt?.toIso8601String(),
      'rating': rating,
      'reviewCount': reviewCount,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  factory PlaceModel.fromMap(Map<String, dynamic> map, [String? idFallback]) {
    final imgs = <String>[];
    if (map['imageUrls'] is List) {
      for (final item in (map['imageUrls'] as List)) {
        if (item != null) imgs.add(item.toString());
      }
    }

    return PlaceModel(
      placeId: map['placeId'] ?? idFallback ?? '',
      name: map['name'] ?? '',
      categoryId: map['categoryId'] ?? '',
      categoryName: map['categoryName'] ?? '',
      subcategory: map['subcategory'] ?? '',
      description: map['description'] ?? '',
      departmentId: map['departmentId'] ?? '',
      departmentName: map['departmentName'] ?? '',
      municipalityId: map['municipalityId'] ?? '',
      municipalityName: map['municipalityName'] ?? '',
      address: map['address'] ?? '',
      latitude: (map['latitude'] as num?)?.toDouble() ?? 12.8654,
      longitude: (map['longitude'] as num?)?.toDouble() ?? -85.2072,
      geohash: map['geohash'] ?? '',
      phone: map['phone'],
      whatsapp: map['whatsapp'],
      website: map['website'],
      imageUrl: map['imageUrl'] ?? (imgs.isNotEmpty ? imgs.first : ''),
      imageUrls: imgs,
      openingHours: map['openingHours'],
      is24Hours: map['is24Hours'] ?? false,
      isOpen: map['isOpen'] ?? true,
      isEmergency: map['isEmergency'] ?? false,
      isTourist: map['isTourist'] ?? false,
      isCommercial: map['isCommercial'] ?? false,
      verified: map['verified'] ?? false,
      verificationSource: map['verificationSource'],
      sourceUrl: map['sourceUrl'],
      lastVerifiedAt: map['lastVerifiedAt'] != null
          ? DateTime.tryParse(map['lastVerifiedAt'].toString())
          : null,
      rating: (map['rating'] as num?)?.toDouble() ?? 5.0,
      reviewCount: (map['reviewCount'] as num?)?.toInt() ?? 0,
      status: map['status'] ?? 'published',
      createdAt: map['createdAt'] != null
          ? DateTime.tryParse(map['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: map['updatedAt'] != null
          ? DateTime.tryParse(map['updatedAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}
