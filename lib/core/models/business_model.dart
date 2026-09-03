// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MODELO DE NEGOCIO LOCAL & COMERCIO JUSTO
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Representar con máxima fidelidad a los emprendimientos comunitarios, cabañas,
//   restaurantes campesinos, guías nativos y artesanos de Nicaragua.
// - Soportar el ciclo de vida editorial completo (borrador, pendiente, publicado, archivado)
//   para que solo los negocios aprobados desde la Web Administrativa se muestren al turista.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Modelo inmutable compatible con Cloud Firestore (`fromMap`, `toMap`).
// - Integración de geolocalización (lat/lng) para posicionamiento en el mapa satelital.
// - Canales de contacto directo (WhatsApp, llamada, correo) sin intermediación.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES EXPUESTOS):
// - `BusinessModel`: Clase central consumida por la App y la Web Administrativa.
// ============================================================================

// BAQUEANO
// ARCHIVO: business_model.dart
// MÓDULO: Negocios & Comercio Justo
// PROYECTO: SHARED (Consumido por APP y ADMIN WEB)
// INTEGRACIÓN: Cloud Firestore / businesses
// CONSUMIDO POR: BusinessCard, BusinessShowcase, AdminBusinessForm
// RESPONSABILIDAD: Representar negocios locales con estado de publicación y geolocalización.
// NO CONTIENE: Lógica de UI ni consultas de red.

class BusinessModel {
  final String id;
  final String name;
  final String description;
  final String category; // 'Hospedaje', 'Restaurante', 'Cafetería', 'Artesanía', 'Guía/Tour', 'Transporte'
  final String subcategory;
  final String country;
  final String department;
  final String municipality;
  final String address;
  final double latitude;
  final double longitude;
  final String phone;
  final String email;
  final String website;
  final Map<String, String> socialNetworks;
  final String openingHours;
  final List<String> images;
  final List<String> videos;
  final double rating;
  final int reviewsCount;
  final String status; // 'draft', 'pending', 'published', 'unpublished', 'archived'
  final bool verified;
  final DateTime createdAt;
  final DateTime updatedAt;

  const BusinessModel({
    required this.id,
    required this.name,
    required this.description,
    required this.category,
    required this.subcategory,
    required this.country,
    required this.department,
    required this.municipality,
    required this.address,
    required this.latitude,
    required this.longitude,
    required this.phone,
    required this.email,
    required this.website,
    required this.socialNetworks,
    required this.openingHours,
    required this.images,
    required this.videos,
    this.rating = 5.0,
    this.reviewsCount = 0,
    this.status = 'published',
    this.verified = true,
    required this.createdAt,
    required this.updatedAt,
  });

  bool get isPublished => status == 'published';

  String get icon {
    switch (category.toLowerCase()) {
      case 'hospedaje':
        return '🛖';
      case 'restaurante':
      case 'comida':
        return '🍲';
      case 'cafetería':
      case 'café':
        return '☕';
      case 'artesanía':
        return '🏺';
      case 'guía/tour':
      case 'guía':
        return '🧭';
      case 'transporte':
        return '🚙';
      default:
        return '🏪';
    }
  }

  String get sustainabilityBadge => verified ? '100% Baqueano Comunitario' : 'En Verificación';

  String get locationDetail => address.isNotEmpty ? address : '$municipality, $department';

  String get priceRange => '\$\$';

  String get type => category.toLowerCase();

  // Serialización a mapa para Cloud Firestore
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'category': category,
      'subcategory': subcategory,
      'country': country,
      'department': department,
      'municipality': municipality,
      'address': address,
      'latitude': latitude,
      'longitude': longitude,
      'phone': phone,
      'email': email,
      'website': website,
      'socialNetworks': socialNetworks,
      'openingHours': openingHours,
      'images': images,
      'videos': videos,
      'rating': rating,
      'reviewsCount': reviewsCount,
      'status': status,
      'verified': verified,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  // Deserialización desde mapa de Cloud Firestore
  factory BusinessModel.fromMap(Map<String, dynamic> map, [String? docId]) {
    return BusinessModel(
      id: docId ?? map['id'] ?? '',
      name: map['name'] ?? '',
      description: map['description'] ?? '',
      category: map['category'] ?? 'Hospedaje',
      subcategory: map['subcategory'] ?? '',
      country: map['country'] ?? 'Nicaragua',
      department: map['department'] ?? '',
      municipality: map['municipality'] ?? '',
      address: map['address'] ?? '',
      latitude: (map['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (map['longitude'] as num?)?.toDouble() ?? 0.0,
      phone: map['phone'] ?? '',
      email: map['email'] ?? '',
      website: map['website'] ?? '',
      socialNetworks: Map<String, String>.from(map['socialNetworks'] ?? {}),
      openingHours: map['openingHours'] ?? '8:00 AM - 6:00 PM',
      images: List<String>.from(map['images'] ?? []),
      videos: List<String>.from(map['videos'] ?? []),
      rating: (map['rating'] as num?)?.toDouble() ?? 5.0,
      reviewsCount: (map['reviewsCount'] as num?)?.toInt() ?? 0,
      status: map['status'] ?? 'published',
      verified: map['verified'] ?? true,
      createdAt: map['createdAt'] != null
          ? DateTime.tryParse(map['createdAt']) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: map['updatedAt'] != null
          ? DateTime.tryParse(map['updatedAt']) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  BusinessModel copyWith({
    String? id,
    String? name,
    String? description,
    String? category,
    String? subcategory,
    String? country,
    String? department,
    String? municipality,
    String? address,
    double? latitude,
    double? longitude,
    String? phone,
    String? email,
    String? website,
    Map<String, String>? socialNetworks,
    String? openingHours,
    List<String>? images,
    List<String>? videos,
    double? rating,
    int? reviewsCount,
    String? status,
    bool? verified,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return BusinessModel(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      category: category ?? this.category,
      subcategory: subcategory ?? this.subcategory,
      country: country ?? this.country,
      department: department ?? this.department,
      municipality: municipality ?? this.municipality,
      address: address ?? this.address,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      website: website ?? this.website,
      socialNetworks: socialNetworks ?? this.socialNetworks,
      openingHours: openingHours ?? this.openingHours,
      images: images ?? this.images,
      videos: videos ?? this.videos,
      rating: rating ?? this.rating,
      reviewsCount: reviewsCount ?? this.reviewsCount,
      status: status ?? this.status,
      verified: verified ?? this.verified,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
