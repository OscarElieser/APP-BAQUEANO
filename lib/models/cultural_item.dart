class GastronomyDish {
  final String id;
  final String name;
  final String region;
  final String history;
  final List<String> ingredients;
  final String recommendedPlace;
  final String icon;
  final String imageUrl;

  const GastronomyDish({
    required this.id,
    required this.name,
    required this.region,
    required this.history,
    required this.ingredients,
    required this.recommendedPlace,
    required this.icon,
    required this.imageUrl,
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

  const MusicTrack({
    required this.id,
    required this.title,
    required this.artist,
    required this.genre,
    required this.region,
    required this.duration,
    required this.history,
    required this.coverUrl,
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
