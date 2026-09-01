class ExperienceModel {
  final String id;
  final String userId;
  final String userName;
  final String userAvatar;
  final String destinationId;
  final String destinationTitle;
  final double rating;
  final String comment;
  final List<String> photos;
  final DateTime timestamp;
  final int likesCount;
  final bool isApproved;

  const ExperienceModel({
    required this.id,
    required this.userId,
    required this.userName,
    this.userAvatar = '',
    required this.destinationId,
    required this.destinationTitle,
    required this.rating,
    required this.comment,
    this.photos = const [],
    required this.timestamp,
    this.likesCount = 0,
    this.isApproved = true,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'userName': userName,
      'userAvatar': userAvatar,
      'destinationId': destinationId,
      'destinationTitle': destinationTitle,
      'rating': rating,
      'comment': comment,
      'photos': photos,
      'timestamp': timestamp.toIso8601String(),
      'likesCount': likesCount,
      'isApproved': isApproved,
    };
  }

  factory ExperienceModel.fromMap(Map<String, dynamic> map, String id) {
    return ExperienceModel(
      id: id,
      userId: map['userId'] ?? '',
      userName: map['userName'] ?? 'Explorador Anónimo',
      userAvatar: map['userAvatar'] ?? '',
      destinationId: map['destinationId'] ?? '',
      destinationTitle: map['destinationTitle'] ?? '',
      rating: (map['rating'] as num?)?.toDouble() ?? 5.0,
      comment: map['comment'] ?? '',
      photos: List<String>.from(map['photos'] ?? []),
      timestamp: map['timestamp'] != null
          ? DateTime.tryParse(map['timestamp']) ?? DateTime.now()
          : DateTime.now(),
      likesCount: (map['likesCount'] as num?)?.toInt() ?? 0,
      isApproved: map['isApproved'] ?? true,
    );
  }
}
