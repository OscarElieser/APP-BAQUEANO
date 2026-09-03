class GastronomyDish {
  final String id;
  final String name;
  final String region;
  final String history;
  final List<String> ingredients;
  final String recommendedPlace;
  final String icon;
  final String imageUrl;
  final String fullAddress;
  final String contactPhone;
  final String ownerName;
  final String estimatedPrice;
  final String? schedule;

  const GastronomyDish({
    required this.id,
    required this.name,
    required this.region,
    required this.history,
    required this.ingredients,
    required this.recommendedPlace,
    required this.icon,
    required this.imageUrl,
    this.fullAddress = 'Centro histórico y comedores tradicionales del municipio',
    this.contactPhone = '+505 2270-0000',
    this.ownerName = 'Comunidad Anfitriona Campesina',
    this.estimatedPrice = r'C$ 100 - C$ 160 NIO (~$3.00 - $4.50 USD)',
    this.schedule = 'Abierto todos los días de 6:00 AM a 6:00 PM',
  });
}

class MusicTrack {
  final String id;
  final String title;
  final String artist;
  final String genre;
  final String region;
  final String duration;
  final String history;
  final String coverUrl;
  final String? youtubeUrl;
  final String? audioAsset;

  const MusicTrack({
    required this.id,
    required this.title,
    required this.artist,
    required this.genre,
    required this.region,
    required this.duration,
    required this.history,
    required this.coverUrl,
    this.youtubeUrl,
    this.audioAsset,
  });
}

class VideoSpot {
  final String id;
  final String title;
  final String department;
  final String duration;
  final String quality;
  final String description;
  final String thumbnail;
  final String youtubeUrl;

  const VideoSpot({
    required this.id,
    required this.title,
    required this.department,
    required this.duration,
    required this.quality,
    required this.description,
    required this.thumbnail,
    required this.youtubeUrl,
  });
}

class LodgingSpot {
  final String id;
  final String name;
  final String location;
  final String type;
  final double pricePerNightUsd;
  final double rating;
  final List<String> amenities;
  final String description;
  final String imageUrl;
  final String? reservationInfo;

  const LodgingSpot({
    required this.id,
    required this.name,
    required this.location,
    required this.type,
    required this.pricePerNightUsd,
    required this.rating,
    required this.amenities,
    required this.description,
    required this.imageUrl,
    this.reservationInfo,
  });
}

class NightlifeSpot {
  final String id;
  final String name;
  final String city;
  final String area;
  final String musicStyle;
  final String schedule;
  final List<String> recommendedDrinks;
  final String description;
  final String imageUrl;

  const NightlifeSpot({
    required this.id,
    required this.name,
    required this.city,
    required this.area,
    required this.musicStyle,
    required this.schedule,
    required this.recommendedDrinks,
    required this.description,
    required this.imageUrl,
  });
}

class PassportBadge {
  final String id;
  final String title;
  final String description;
  final String icon;
  final bool isUnlocked;
  final int xpValue;

  const PassportBadge({
    required this.id,
    required this.title,
    required this.description,
    required this.icon,
    required this.isUnlocked,
    required this.xpValue,
  });
}
