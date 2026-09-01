// ============================================================================
// 🌋 MODELO DE DATOS DE DESTINOS & EXPEDICIONES (DESTINATION_MODEL.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Representar la entidad núcleo del ecosistema Baqueano: un destino turístico,
//   ruta de aventura o santuario natural de Nicaragua con toda su información
//   geográfica, tarifaria, dificultad técnica y acreditación del guía nativo.
// - Facilitar el cálculo automático de precios en Córdobas (NIO) y el filtrado
//   multidimensional en el mapa GPS, catálogo y motor de recomendaciones IA.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Clase inmutable con constructor `const` y método `copyWith()` para manejo
//   de estado reactivo sin mutaciones destructivas.
// - Getter computado `priceNio` que calcula la conversión cambiaria en tiempo real.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & PROPIEDADES EXPUESTAS):
// - `DestinationModel`: Entidad inmutable con coordenadas GPS (lat, lng), etiquetas,
//   dificultad, valoración comunitaria y distintivo del baqueano asignado.
// ============================================================================

class DestinationModel {
  /// Identificador único slug (ej: "cascada-la-luna", "canon-de-somoto").
  final String id;

  /// Título descriptivo del destino o expedición.
  final String title;

  /// Departamento de Nicaragua donde se ubica (ej: "Matagalpa", "Madriz", "Rivas").
  final String department;

  /// Categoría turística ('volcanes', 'cascadas', 'playas', 'lodges', 'colonial').
  final String category;

  /// Nivel de exigencia física ('Fácil', 'Moderado', 'Exigente').
  final String difficulty;

  /// Calificación promedio otorgada por exploradores (1.0 a 5.0 estrellas).
  final double rating;

  /// Cantidad total de reseñas verificadas registradas.
  final int reviewsCount;

  /// Precio base de la expedición en Dólares Estadounidenses (USD).
  final double priceUsd;

  /// Duración estimada de la actividad (ej: "1 día", "5 horas", "2 días").
  final String duration;

  /// Distancia total del recorrido o sendero (ej: "18 km", "6 km").
  final String distance;

  /// Descripción detallada del sendero, fauna, flora y actividades incluidas.
  final String description;

  /// URL de la fotografía principal en alta resolución.
  final String imageUrl;

  /// Lista de etiquetas temáticas para filtros de búsqueda rápida.
  final List<String> tags;

  /// Coordenada de latitud GPS para renderizado en mapa interactivo.
  final double latitude;

  /// Coordenada de longitud GPS para renderizado en mapa interactivo.
  final double longitude;

  /// Nombre del baqueano / guía nativo anfitrión.
  final String guideName;

  /// Distintivo o acreditación del guía (ej: "Guía Nativo Certificado", "Baqueano del Cañón").
  final String guideBadge;

  /// Indica si el usuario actual ha guardado el destino en sus favoritos locales.
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

  /// Getter computado que convierte el precio en USD a Córdobas (NIO) a la tasa oficial de 36.65 C$/USD.
  double get priceNio => priceUsd * 36.65;

  /// Crea una copia inmutable del modelo actual actualizando únicamente los campos especificados.
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
