// ============================================================================
// 🎭 MODELOS DE DATOS CULTURALES & PATRIMONIO DE NICARAGUA (CULTURAL_MODELS.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Modelar de forma tipada y estructurada la riqueza cultural intangible de Nicaragua:
//   platillos gastronómicos ancestrales, repertorio folclórico de marimba, videos 4K,
//   eco-lodges bioclimáticos, vida nocturna bohemia, insignias del pasaporte digital
//   y mensajes de asistencia conversacional con IA.
// - Asegurar interoperabilidad entre las pantallas temáticas del catálogo y los
//   servicios de reserva y gamificación.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Clases inmutables con constructores `const` para optimización de renderizado en Flutter.
// - Estructuras de datos limpias compatibles con serialización JSON y Cloud Firestore.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & MODELOS EXPUESTOS):
// - `GastronomyDish`, `MusicTrack`, `VideoSpot`, `LodgingSpot`, `NightlifeSpot`,
//   `LocalBusiness`, `ExplorerReview`, `PassportBadge`, `ChatMessage`.
// ============================================================================

/// Representa un platillo de la gastronomía ancestral nicaragüense.
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

/// Representa una pista musical del reproductor de marimba y folklore.
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

/// Representa un video documental en resolución 4K sobre una expedición.
class VideoSpot {
  final String id;
  final String title;
  final String department;
  final String duration;
  final String quality; // '4K HDR', '4K 60FPS'
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

/// Representa un hospedaje ecológico o cabaña rústica en entorno rural.
class LodgingSpot {
  final String id;
  final String name;
  final String location;
  final String type; // 'Eco-Lodge', 'Hostal', 'Boutique'
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

/// Representa un establecimiento de vida nocturna bohemia, música en vivo o coctelería.
class NightlifeSpot {
  final String id;
  final String name;
  final String city;
  final String area; // 'La Zona Rosa', 'La Calzada', 'Bahía SJDS'
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

/// Representa un emprendimiento rural o prestador de servicios comunitario aliado.
class LocalBusiness {
  final String id;
  final String name;
  final String category;
  final String department;
  final String description;
  final String contact;
  final String ownerName;
  final String whatsapp;
  final String email;
  final String address;
  final double latitude;
  final double longitude;
  final String schedule;
  final List<String> services;
  final String icon;
  final String badge;

  const LocalBusiness({
    required this.id,
    required this.name,
    required this.category,
    required this.department,
    required this.description,
    required this.contact,
    this.ownerName = 'Baqueano Local',
    this.whatsapp = '50588889999',
    this.email = 'contacto@baqueano.ni',
    this.address = 'Nicaragua',
    this.latitude = 12.1364,
    this.longitude = -86.2514,
    this.schedule = 'Lun - Dom: 7:00 AM - 6:00 PM',
    this.services = const ['Atención Personalizada', 'Guía Local', 'Comercio Justo'],
    required this.icon,
    required this.badge,
  });
}

/// Representa el testimonio y reseña verificado de un explorador.
class ExplorerReview {
  final String id;
  final String author;
  final String countryFlag;
  final String destination;
  final String review;
  final double rating;

  const ExplorerReview({
    required this.id,
    required this.author,
    required this.countryFlag,
    required this.destination,
    required this.review,
    required this.rating,
  });
}

/// Representa un sello o medalla de gamificación desbloqueable en el Pasaporte Digital.
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

/// Representa un mensaje interactivo dentro del chat de Baqueano AI.
class ChatMessage {
  final String id;
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final List<String>? quickActions;

  const ChatMessage({
    required this.id,
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.quickActions,
  });
}
