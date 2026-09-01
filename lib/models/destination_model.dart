class DestinationModel {
  final String id;
  final String title;
  final String department;
  final String category; // 'volcanes', 'cascadas', 'playas', 'lodges', 'colonial'
  final String description;
  final String difficulty; // 'Fácil', 'Moderado', 'Exigente'
  final double rating;
  final int reviewsCount;
  final String duration;
  final String distance;
  final double priceUsd;
  final String imageUrl;
  final double latitude;
  final double longitude;
  final List<String> highlights;
  final List<String> included;
  final List<String> tags;
  final String guideName;
  final String guideBadge;
  final bool isPopular;
  final bool isFavorite;

  const DestinationModel({
    required this.id,
    required this.title,
    required this.department,
    required this.category,
    required this.description,
    required this.difficulty,
    required this.rating,
    required this.reviewsCount,
    required this.duration,
    this.distance = '10 km',
    required this.priceUsd,
    required this.imageUrl,
    required this.latitude,
    required this.longitude,
    this.highlights = const [],
    this.included = const [],
    this.tags = const [],
    this.guideName = 'Baqueano Local',
    this.guideBadge = 'Guía Certificado',
    this.isPopular = true,
    this.isFavorite = false,
  });

  double get priceNio => priceUsd * 36.65;

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'department': department,
      'category': category,
      'description': description,
      'difficulty': difficulty,
      'rating': rating,
      'reviewsCount': reviewsCount,
      'duration': duration,
      'distance': distance,
      'priceUsd': priceUsd,
      'imageUrl': imageUrl,
      'coordinates': {
        'lat': latitude,
        'lng': longitude,
      },
      'highlights': highlights,
      'included': included,
      'tags': tags,
      'guideName': guideName,
      'guideBadge': guideBadge,
      'isPopular': isPopular,
      'isFavorite': isFavorite,
    };
  }

  factory DestinationModel.fromMap(Map<String, dynamic> map, String id) {
    final coords = map['coordinates'] as Map<String, dynamic>?;
    return DestinationModel(
      id: id,
      title: map['title'] ?? '',
      department: map['department'] ?? '',
      category: map['category'] ?? 'volcanes',
      description: map['description'] ?? '',
      difficulty: map['difficulty'] ?? 'Moderado',
      rating: (map['rating'] as num?)?.toDouble() ?? 5.0,
      reviewsCount: (map['reviewsCount'] as num?)?.toInt() ?? 0,
      duration: map['duration'] ?? '1 día',
      distance: map['distance'] ?? '10 km',
      priceUsd: (map['priceUsd'] as num?)?.toDouble() ?? 35.0,
      imageUrl: map['imageUrl'] ?? '',
      latitude: coords != null ? (coords['lat'] as num).toDouble() : (map['latitude'] as num?)?.toDouble() ?? 12.0,
      longitude: coords != null ? (coords['lng'] as num).toDouble() : (map['longitude'] as num?)?.toDouble() ?? -86.0,
      highlights: List<String>.from(map['highlights'] ?? []),
      included: List<String>.from(map['included'] ?? []),
      tags: List<String>.from(map['tags'] ?? []),
      guideName: map['guideName'] ?? 'Baqueano Local',
      guideBadge: map['guideBadge'] ?? 'Guía Certificado',
      isPopular: map['isPopular'] ?? true,
      isFavorite: map['isFavorite'] ?? false,
    );
  }

  DestinationModel copyWith({
    String? id,
    String? title,
    String? department,
    String? category,
    String? description,
    String? difficulty,
    double? rating,
    int? reviewsCount,
    String? duration,
    String? distance,
    double? priceUsd,
    String? imageUrl,
    double? latitude,
    double? longitude,
    List<String>? highlights,
    List<String>? included,
    List<String>? tags,
    String? guideName,
    String? guideBadge,
    bool? isPopular,
    bool? isFavorite,
  }) {
    return DestinationModel(
      id: id ?? this.id,
      title: title ?? this.title,
      department: department ?? this.department,
      category: category ?? this.category,
      description: description ?? this.description,
      difficulty: difficulty ?? this.difficulty,
      rating: rating ?? this.rating,
      reviewsCount: reviewsCount ?? this.reviewsCount,
      duration: duration ?? this.duration,
      distance: distance ?? this.distance,
      priceUsd: priceUsd ?? this.priceUsd,
      imageUrl: imageUrl ?? this.imageUrl,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      highlights: highlights ?? this.highlights,
      included: included ?? this.included,
      tags: tags ?? this.tags,
      guideName: guideName ?? this.guideName,
      guideBadge: guideBadge ?? this.guideBadge,
      isPopular: isPopular ?? this.isPopular,
      isFavorite: isFavorite ?? this.isFavorite,
    );
  }
}
