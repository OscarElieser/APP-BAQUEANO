// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — REPOSITORIO MODULAR DE HISTORIA Y PAÍSES
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una abstracción limpia que permita obtener los datos culturales,
//   históricos y turísticos de cualquier país.
// - Inicialmente consume el catálogo enriquecido de Nicaragua, y está preparado
//   para consultar Cloud Firestore (`countries/{countryId}`) al incorporar nuevos
//   países como Costa Rica, Honduras, Guatemala o Panamá.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Patrón Repositorio con contrato abstracto `CountryHistoryRepository`.
// - Implementación por defecto `LocalCountryHistoryRepository` con fallback inmediato.
// - Búsqueda semántica transversal que filtra personajes, departamentos, comidas,
//   escritores y sitios naturales.
//
// 📦 3. QUÉ (WHAT / INTERFACES EXPUESTAS):
// - `CountryHistoryRepository`: Interfaz base.
// - `LocalCountryHistoryRepository`: Implementación con datos en memoria y caché.
// ============================================================================

import '../models/country_history_models.dart';
import 'nicaragua_history_data.dart';

abstract class CountryHistoryRepository {
  Future<List<CountryProfile>> getAvailableCountries();
  Future<CountryProfile> getCountryProfile(String countryId);
  Future<List<HistoricalPeriod>> getHistoryPeriods(String countryId);
  Future<List<CountryDepartment>> getDepartments(String countryId);
  Future<List<GastronomicDish>> getGastronomy(String countryId);
  Future<List<LiteraryAuthor>> getWriters(String countryId);
  Future<List<VisualArtist>> getArtists(String countryId);
  Future<List<CulturalTradition>> getTraditions(String countryId);
  Future<List<NationalSymbol>> getSymbols(String countryId);
  Future<List<IndigenousPeople>> getIndigenousPeoples(String countryId);
  Future<List<NatureWonder>> getNatureWonders(String countryId);
  Future<List<HistoricalFigure>> getHistoricalFigures(String countryId);
  Future<List<CountryCuriosity>> getCuriosities(String countryId);
}

class LocalCountryHistoryRepository implements CountryHistoryRepository {
  const LocalCountryHistoryRepository();

  @override
  Future<List<CountryProfile>> getAvailableCountries() async {
    return [NicaraguaHistoryData.profile];
  }

  @override
  Future<CountryProfile> getCountryProfile(String countryId) async {
    // Por ahora retorna Nicaragua; preparado para switch / Firestore dinámico
    return NicaraguaHistoryData.profile;
  }

  @override
  Future<List<HistoricalPeriod>> getHistoryPeriods(String countryId) async {
    return NicaraguaHistoryData.periods;
  }

  @override
  Future<List<CountryDepartment>> getDepartments(String countryId) async {
    return NicaraguaHistoryData.departments;
  }

  @override
  Future<List<GastronomicDish>> getGastronomy(String countryId) async {
    return NicaraguaHistoryData.gastronomy;
  }

  @override
  Future<List<LiteraryAuthor>> getWriters(String countryId) async {
    return NicaraguaHistoryData.writers;
  }

  @override
  Future<List<VisualArtist>> getArtists(String countryId) async {
    return NicaraguaHistoryData.artists;
  }

  @override
  Future<List<CulturalTradition>> getTraditions(String countryId) async {
    return NicaraguaHistoryData.traditions;
  }

  @override
  Future<List<NationalSymbol>> getSymbols(String countryId) async {
    return NicaraguaHistoryData.symbols;
  }

  @override
  Future<List<IndigenousPeople>> getIndigenousPeoples(String countryId) async {
    return NicaraguaHistoryData.indigenousPeoples;
  }

  @override
  Future<List<NatureWonder>> getNatureWonders(String countryId) async {
    return NicaraguaHistoryData.natureWonders;
  }

  @override
  Future<List<HistoricalFigure>> getHistoricalFigures(String countryId) async {
    return NicaraguaHistoryData.historicalFigures;
  }

  @override
  Future<List<CountryCuriosity>> getCuriosities(String countryId) async {
    return NicaraguaHistoryData.curiosities;
  }
}
