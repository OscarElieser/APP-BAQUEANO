// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MODELO DE DEPARTAMENTOS DE NICARAGUA
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Representar la división político-administrativa de primer nivel de Nicaragua
//   (15 departamentos y 2 regiones autónomas) para el Directorio Nacional.
// - Facilitar el filtrado geográfico, visualización y navegación regional.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Inmutable data class con coordenadas centrales (`latitude`, `longitude`),
//   zona geográfica (`Pacífico`, `Centro-Norte`, `Caribe`, `Sur`) y capital departamental.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & MODELO EXPUESTO):
// - `DepartmentModel`: Modelo representativo con serialización a Map y JSON.
// ============================================================================

class DepartmentModel {
  final String id;
  final String name;
  final String zone;
  final String capital;
  final double latitude;
  final double longitude;

  const DepartmentModel({
    required this.id,
    required this.name,
    required this.zone,
    required this.capital,
    required this.latitude,
    required this.longitude,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'zone': zone,
      'capital': capital,
      'latitude': latitude,
      'longitude': longitude,
    };
  }

  factory DepartmentModel.fromMap(Map<String, dynamic> map, [String? idFallback]) {
    return DepartmentModel(
      id: map['id'] ?? idFallback ?? '',
      name: map['name'] ?? '',
      zone: map['zone'] ?? 'Nacional',
      capital: map['capital'] ?? '',
      latitude: (map['latitude'] as num?)?.toDouble() ?? 12.8654,
      longitude: (map['longitude'] as num?)?.toDouble() ?? -85.2072,
    );
  }
}
