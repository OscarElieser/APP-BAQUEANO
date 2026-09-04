// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MODELO DE MUNICIPIOS DE NICARAGUA
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Representar la división político-administrativa municipal de Nicaragua,
//   permitiendo al usuario filtrar con precisión milimétrica establecimientos,
//   servicios de emergencia y destinos en su municipio natal o de visita.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Vinculación jerárquica con `departmentId`, nombre oficial y centro geográfico.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & MODELO EXPUESTO):
// - `MunicipalityModel`: Modelo inmutable con fábrica desde Map/JSON.
// ============================================================================

class MunicipalityModel {
  final String id;
  final String departmentId;
  final String name;
  final double latitude;
  final double longitude;

  const MunicipalityModel({
    required this.id,
    required this.departmentId,
    required this.name,
    required this.latitude,
    required this.longitude,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'departmentId': departmentId,
      'name': name,
      'latitude': latitude,
      'longitude': longitude,
    };
  }

  factory MunicipalityModel.fromMap(Map<String, dynamic> map, [String? idFallback]) {
    return MunicipalityModel(
      id: map['id'] ?? idFallback ?? '',
      departmentId: map['departmentId'] ?? '',
      name: map['name'] ?? '',
      latitude: (map['latitude'] as num?)?.toDouble() ?? 12.8654,
      longitude: (map['longitude'] as num?)?.toDouble() ?? -85.2072,
    );
  }
}
