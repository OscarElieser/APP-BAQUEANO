class DestinationModel {
  final String id;
  final String title;
  final String department;
  final String category; // 'volcanes', 'cascadas', 'playas', 'lodges', 'colonial'
  final String difficulty; // 'Fácil', 'Moderado', 'Exigente'
  final double rating;
  final int reviewsCount;
  final double priceUsd;
  final String duration;
  final String distance;
  final String description;
  final String imageUrl;
  final List<String> tags;
  final double latitude;
  final double longitude;
  final String guideName;
  final String guideBadge;
  final bool isFavorite;

  const DestinationModel({
    required this.id,
    required this.title,
    required this.department,
    required this.category,
    required this.difficulty,
    required this.rating,
    required this.reviewsCount,
    required this.priceUsd,
    required this.duration,
    required this.distance,
    required this.description,
    required this.imageUrl,
    required this.tags,
    required this.latitude,
    required this.longitude,
    required this.guideName,
    required this.guideBadge,
    this.isFavorite = false,
  });

  double get priceNio => priceUsd * 36.65;

  DestinationModel copyWith({
    String? id,
    String? title,
    String? department,
    String? category,
    String? difficulty,
    double? rating,
    int? reviewsCount,
    double? priceUsd,
    String? duration,
    String? distance,
    String? description,
    String? imageUrl,
    List<String>? tags,
    double? latitude,
    double? longitude,
    String? guideName,
    String? guideBadge,
    bool? isFavorite,
  }) {
    return DestinationModel(
      id: id ?? this.id,
      title: title ?? this.title,
      department: department ?? this.department,
      category: category ?? this.category,
      difficulty: difficulty ?? this.difficulty,
      rating: rating ?? this.rating,
      reviewsCount: reviewsCount ?? this.reviewsCount,
      priceUsd: priceUsd ?? this.priceUsd,
      duration: duration ?? this.duration,
      distance: distance ?? this.distance,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      tags: tags ?? this.tags,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      guideName: guideName ?? this.guideName,
      guideBadge: guideBadge ?? this.guideBadge,
      isFavorite: isFavorite ?? this.isFavorite,
    );
  }
}
