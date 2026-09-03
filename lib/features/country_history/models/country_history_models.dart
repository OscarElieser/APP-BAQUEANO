// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MODELOS DE HISTORIA, CULTURA & IDENTIDAD NACIONAL
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una estructura de datos inmutable, tipada y desacoplada que capture
//   la memoria histórica, cultural, lingüística, literaria, gastronómica y geográfica
//   de un país.
// - Diseñado de forma modular para iniciar con Nicaragua y permitir en el futuro
//   incorporar cualquier país (Costa Rica, Honduras, Guatemala, etc.) desde
//   Cloud Firestore o catálogos locales sin alterar la arquitectura.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Clases inmutables con constructores `const` para optimización de renderizado en Flutter.
// - Vínculos directos a destinos y anfitriones de BAQUEANO (`destinationRouteId`)
//   para enlazar cada hito histórico con experiencias turísticas tangibles.
// - Compatibilidad total con serialización JSON para futuras colecciones Firestore.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & MODELOS EXPUESTOS):
// - `CountryProfile`, `CountryQuickStats`, `HistoricalPeriod`, `HistoricalEvent`,
//   `CountryDepartment`, `CulturalTradition`, `GastronomicDish`, `LiteraryAuthor`,
//   `LiteraryWork`, `VisualArtist`, `NationalSymbol`, `IndigenousPeople`,
//   `NatureWonder`, `HistoricalFigure`, `CountryCuriosity`.
// ============================================================================

/// Perfil general de un país en el ecosistema Baqueano.
class CountryProfile {
  final String id;
  final String name;
  final String flagEmoji;
  final String heroTitle;
  final String heroSubtitle;
  final String heroBackdropUrl;
  final String overviewText;
  final CountryQuickStats stats;

  const CountryProfile({
    required this.id,
    required this.name,
    required this.flagEmoji,
    required this.heroTitle,
    required this.heroSubtitle,
    required this.heroBackdropUrl,
    required this.overviewText,
    required this.stats,
  });
}

/// Estadísticas rápidas y verificables del país.
class CountryQuickStats {
  final String population;
  final String populationYear;
  final String territorialDivisions;
  final List<String> officialLanguages;
  final String volcanoesCount;
  final String volcanoesDetail;
  final String lakesCount;
  final String lakesDetail;

  const CountryQuickStats({
    required this.population,
    required this.populationYear,
    required this.territorialDivisions,
    required this.officialLanguages,
    required this.volcanoesCount,
    required this.volcanoesDetail,
    required this.lakesCount,
    required this.lakesDetail,
  });
}

/// Periodo cronológico en la historia del país.
class HistoricalPeriod {
  final String id;
  final String title;
  final String periodYears;
  final String summary;
  final String icon;
  final List<HistoricalEvent> events;

  const HistoricalPeriod({
    required this.id,
    required this.title,
    required this.periodYears,
    required this.summary,
    required this.icon,
    required this.events,
  });
}

/// Evento o hito histórico específico dentro de un periodo.
class HistoricalEvent {
  final String id;
  final String year;
  final String title;
  final String description;
  final List<String> characters;
  final List<String> locations;
  final String imageUrl;
  final String historicalSignificance;
  final String? destinationRouteId;

  const HistoricalEvent({
    required this.id,
    required this.year,
    required this.title,
    required this.description,
    required this.characters,
    required this.locations,
    required this.imageUrl,
    required this.historicalSignificance,
    this.destinationRouteId,
  });
}

/// Ficha de un departamento o región autónoma.
class CountryDepartment {
  final String id;
  final String name;
  final String capital;
  final String zone;
  final String population;
  final String areaKm2;
  final int municipalitiesCount;
  final String cultureDescription;
  final String gastronomyHighlight;
  final String traditionsHighlight;
  final List<String> touristAttractions;
  final List<String> notableFigures;
  final String craftsHighlight;
  final String curiosity;
  final String imageUrl;
  final String? destinationRouteId;

  const CountryDepartment({
    required this.id,
    required this.name,
    required this.capital,
    required this.zone,
    required this.population,
    required this.areaKm2,
    required this.municipalitiesCount,
    required this.cultureDescription,
    required this.gastronomyHighlight,
    required this.traditionsHighlight,
    required this.touristAttractions,
    required this.notableFigures,
    required this.craftsHighlight,
    required this.curiosity,
    required this.imageUrl,
    this.destinationRouteId,
  });
}

/// Tradición, fiesta patronal o manifestación folclórica.
class CulturalTradition {
  final String id;
  final String title;
  final String type;
  final String date;
  final String location;
  final String origin;
  final String significance;
  final List<String> activities;
  final String foodAssociated;
  final String musicAssociated;
  final String imageUrl;
  final String? destinationRouteId;

  const CulturalTradition({
    required this.id,
    required this.title,
    required this.type,
    required this.date,
    required this.location,
    required this.origin,
    required this.significance,
    required this.activities,
    required this.foodAssociated,
    required this.musicAssociated,
    required this.imageUrl,
    this.destinationRouteId,
  });
}

/// Platillo o bebida de la gastronomía ancestral.
class GastronomicDish {
  final String id;
  final String name;
  final String category; // 'Desayuno', 'Almuerzo', 'Bebida', 'Postre', 'Comida Regional'
  final String description;
  final List<String> mainIngredients;
  final String region;
  final String celebrationMoment;
  final String culturalCuriosity;
  final String imageUrl;
  final String? destinationRouteId;

  const GastronomicDish({
    required this.id,
    required this.name,
    required this.category,
    required this.description,
    required this.mainIngredients,
    required this.region,
    required this.celebrationMoment,
    required this.culturalCuriosity,
    required this.imageUrl,
    this.destinationRouteId,
  });
}

/// Autor, poeta o escritor ilustre.
class LiteraryAuthor {
  final String id;
  final String name;
  final String epoch;
  final String genre;
  final String birthplace;
  final String biography;
  final String literaryContribution;
  final String portraitUrl;
  final bool isSpotlight;
  final List<LiteraryWork> works;
  final String? relatedDestinationId;

  const LiteraryAuthor({
    required this.id,
    required this.name,
    required this.epoch,
    required this.genre,
    required this.birthplace,
    required this.biography,
    required this.literaryContribution,
    required this.portraitUrl,
    this.isSpotlight = false,
    required this.works,
    this.relatedDestinationId,
  });
}

/// Obra o libro literario destacado.
class LiteraryWork {
  final String id;
  final String title;
  final String year;
  final String genre;
  final String description;
  final String coverUrl;
  final String? famousQuote;

  const LiteraryWork({
    required this.id,
    required this.title,
    required this.year,
    required this.genre,
    required this.description,
    required this.coverUrl,
    this.famousQuote,
  });
}

/// Artista plástico, escultor o creador visual.
class VisualArtist {
  final String id;
  final String name;
  final String discipline;
  final String epoch;
  final String biography;
  final List<String> notableWorks;
  final String portraitUrl;
  final String? relatedDestinationId;

  const VisualArtist({
    required this.id,
    required this.name,
    required this.discipline,
    required this.epoch,
    required this.biography,
    required this.notableWorks,
    required this.portraitUrl,
    this.relatedDestinationId,
  });
}

/// Símbolo patrio o nacional de identidad.
class NationalSymbol {
  final String id;
  final String name;
  final String category; // 'Bandera', 'Escudo', 'Himno', 'Árbol', 'Flor', 'Ave'
  final String? scientificName;
  final String significance;
  final String history;
  final String interestingFact;
  final String imageUrl;

  const NationalSymbol({
    required this.id,
    required this.name,
    required this.category,
    this.scientificName,
    required this.significance,
    required this.history,
    required this.interestingFact,
    required this.imageUrl,
  });
}

/// Pueblo originario o comunidad afrodescendiente.
class IndigenousPeople {
  final String id;
  final String name;
  final String region;
  final String language;
  final String traditions;
  final String gastronomy;
  final String crafts;
  final String history;
  final String culturalContributions;
  final String imageUrl;

  const IndigenousPeople({
    required this.id,
    required this.name,
    required this.region,
    required this.language,
    required this.traditions,
    required this.gastronomy,
    required this.crafts,
    required this.history,
    required this.culturalContributions,
    required this.imageUrl,
  });
}

/// Maravilla natural (Volcán, Lago, Reserva, Cañón).
class NatureWonder {
  final String id;
  final String name;
  final String category; // 'Volcán', 'Lago', 'Cañón', 'Reserva', 'Playa'
  final String department;
  final String description;
  final String biodiversity;
  final String imageUrl;
  final String destinationRouteId;

  const NatureWonder({
    required this.id,
    required this.name,
    required this.category,
    required this.department,
    required this.description,
    required this.biodiversity,
    required this.imageUrl,
    required this.destinationRouteId,
  });
}

/// Personaje histórico ilustre.
class HistoricalFigure {
  final String id;
  final String name;
  final String epoch;
  final String role;
  final String biography;
  final String mainContributions;
  final List<String> relatedLocations;
  final String significance;
  final String portraitUrl;
  final String? destinationRouteId;

  const HistoricalFigure({
    required this.id,
    required this.name,
    required this.epoch,
    required this.role,
    required this.biography,
    required this.mainContributions,
    required this.relatedLocations,
    required this.significance,
    required this.portraitUrl,
    this.destinationRouteId,
  });
}

/// Dato curioso verificable con fuente.
class CountryCuriosity {
  final String id;
  final String title;
  final String fact;
  final String source;
  final String icon;

  const CountryCuriosity({
    required this.id,
    required this.title,
    required this.fact,
    required this.source,
    required this.icon,
  });
}
