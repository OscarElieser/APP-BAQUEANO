// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — GESTOR DE ESTADO: HISTORIA DE MI PAÍS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Administrar el estado reactivo del módulo 'Historia de mi país' (país seleccionado,
//   filtros temáticos, búsqueda global en tiempo real y favoritos del usuario).
// - Desacoplar la lógica de presentación de las fuentes de datos para permitir
//   la integración de nuevos países y sincronización con Cloud Firestore.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Patrón `ChangeNotifier` expuesto a través de `ChangeNotifierProvider` de Riverpod.
// - Búsqueda semántica instantánea que coteja nombres, biografías, ingredientes,
//   lugares y acontecimientos.
// - Persistencia de favoritos en memoria y preparado para vincular con Firestore.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES EXPUESTOS):
// - `CountryHistoryNotifier`: Controlador de estado con métodos reactivos.
// - `countryHistoryProvider`: Provider global para consumo en widgets Flutter.
// ============================================================================

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/country_history_repository.dart';
import '../data/nicaragua_history_data.dart';
import '../models/country_history_models.dart';

class CountryHistoryNotifier extends ChangeNotifier {
  final CountryHistoryRepository _repository;

  CountryHistoryNotifier({CountryHistoryRepository? repository})
      : _repository = repository ?? const LocalCountryHistoryRepository() {
    _init();
  }

  String _selectedCountryId = 'nicaragua';
  String _searchQuery = '';
  String _selectedCategory = 'TODOS';
  final Set<String> _favoriteItemIds = {};

  CountryProfile _profile = NicaraguaHistoryData.profile;
  List<HistoricalPeriod> _periods = NicaraguaHistoryData.periods;
  List<CountryDepartment> _departments = NicaraguaHistoryData.departments;
  List<GastronomicDish> _gastronomy = NicaraguaHistoryData.gastronomy;
  List<LiteraryAuthor> _writers = NicaraguaHistoryData.writers;
  List<VisualArtist> _artists = NicaraguaHistoryData.artists;
  List<CulturalTradition> _traditions = NicaraguaHistoryData.traditions;
  List<NationalSymbol> _symbols = NicaraguaHistoryData.symbols;
  List<IndigenousPeople> _indigenousPeoples = NicaraguaHistoryData.indigenousPeoples;
  List<NatureWonder> _natureWonders = NicaraguaHistoryData.natureWonders;
  List<HistoricalFigure> _historicalFigures = NicaraguaHistoryData.historicalFigures;
  List<CountryCuriosity> _curiosities = NicaraguaHistoryData.curiosities;

  // Getters
  String get selectedCountryId => _selectedCountryId;
  String get searchQuery => _searchQuery;
  String get selectedCategory => _selectedCategory;
  Set<String> get favoriteItemIds => _favoriteItemIds;

  CountryProfile get profile => _profile;
  List<HistoricalPeriod> get periods => _periods;
  List<CountryDepartment> get departments => _departments;
  List<GastronomicDish> get gastronomy => _gastronomy;
  List<LiteraryAuthor> get writers => _writers;
  List<VisualArtist> get artists => _artists;
  List<CulturalTradition> get traditions => _traditions;
  List<NationalSymbol> get symbols => _symbols;
  List<IndigenousPeople> get indigenousPeoples => _indigenousPeoples;
  List<NatureWonder> get natureWonders => _natureWonders;
  List<HistoricalFigure> get historicalFigures => _historicalFigures;
  List<CountryCuriosity> get curiosities => _curiosities;

  bool isFavorite(String itemId) => _favoriteItemIds.contains(itemId);

  Future<void> _init() async {
    _profile = await _repository.getCountryProfile(_selectedCountryId);
    _periods = await _repository.getHistoryPeriods(_selectedCountryId);
    _departments = await _repository.getDepartments(_selectedCountryId);
    _gastronomy = await _repository.getGastronomy(_selectedCountryId);
    _writers = await _repository.getWriters(_selectedCountryId);
    _artists = await _repository.getArtists(_selectedCountryId);
    _traditions = await _repository.getTraditions(_selectedCountryId);
    _symbols = await _repository.getSymbols(_selectedCountryId);
    _indigenousPeoples = await _repository.getIndigenousPeoples(_selectedCountryId);
    _natureWonders = await _repository.getNatureWonders(_selectedCountryId);
    _historicalFigures = await _repository.getHistoricalFigures(_selectedCountryId);
    _curiosities = await _repository.getCuriosities(_selectedCountryId);
    notifyListeners();
  }

  void setCountry(String countryId) {
    if (_selectedCountryId != countryId) {
      _selectedCountryId = countryId;
      _init();
    }
  }

  void setSearchQuery(String query) {
    _searchQuery = query.trim().toLowerCase();
    notifyListeners();
  }

  void setCategory(String category) {
    _selectedCategory = category;
    notifyListeners();
  }

  void toggleFavorite(String itemId) {
    if (_favoriteItemIds.contains(itemId)) {
      _favoriteItemIds.remove(itemId);
    } else {
      _favoriteItemIds.add(itemId);
    }
    notifyListeners();
  }

  // Filtrado de Departamentos
  List<CountryDepartment> get filteredDepartments {
    if (_searchQuery.isEmpty) return _departments;
    return _departments.where((d) {
      return d.name.toLowerCase().contains(_searchQuery) ||
          d.capital.toLowerCase().contains(_searchQuery) ||
          d.zone.toLowerCase().contains(_searchQuery) ||
          d.gastronomyHighlight.toLowerCase().contains(_searchQuery) ||
          d.cultureDescription.toLowerCase().contains(_searchQuery);
    }).toList();
  }

  // Filtrado de Gastronomía
  List<GastronomicDish> get filteredGastronomy {
    return _gastronomy.where((g) {
      final matchesSearch = _searchQuery.isEmpty ||
          g.name.toLowerCase().contains(_searchQuery) ||
          g.description.toLowerCase().contains(_searchQuery) ||
          g.region.toLowerCase().contains(_searchQuery) ||
          g.mainIngredients.any((i) => i.toLowerCase().contains(_searchQuery));
      return matchesSearch;
    }).toList();
  }

  // Filtrado de Escritores
  List<LiteraryAuthor> get filteredWriters {
    if (_searchQuery.isEmpty) return _writers;
    return _writers.where((w) {
      return w.name.toLowerCase().contains(_searchQuery) ||
          w.genre.toLowerCase().contains(_searchQuery) ||
          w.birthplace.toLowerCase().contains(_searchQuery) ||
          w.works.any((work) => work.title.toLowerCase().contains(_searchQuery));
    }).toList();
  }

  // Filtrado de Naturaleza
  List<NatureWonder> get filteredNatureWonders {
    if (_searchQuery.isEmpty) return _natureWonders;
    return _natureWonders.where((n) {
      return n.name.toLowerCase().contains(_searchQuery) ||
          n.department.toLowerCase().contains(_searchQuery) ||
          n.category.toLowerCase().contains(_searchQuery) ||
          n.description.toLowerCase().contains(_searchQuery);
    }).toList();
  }

  // Filtrado de Personajes Históricos
  List<HistoricalFigure> get filteredHistoricalFigures {
    if (_searchQuery.isEmpty) return _historicalFigures;
    return _historicalFigures.where((f) {
      return f.name.toLowerCase().contains(_searchQuery) ||
          f.role.toLowerCase().contains(_searchQuery) ||
          f.biography.toLowerCase().contains(_searchQuery) ||
          f.relatedLocations.any((loc) => loc.toLowerCase().contains(_searchQuery));
    }).toList();
  }
}

final countryHistoryProvider = ChangeNotifierProvider<CountryHistoryNotifier>((ref) {
  return CountryHistoryNotifier();
});
