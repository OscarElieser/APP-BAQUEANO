class SystemConfigModel {
  final String bannerTitle;
  final String bannerSubtitle;
  final List<String> marqueeBrands;
  final double exchangeRate; // 36.65
  final String emergencyPhone;
  final String activeNotice;

  const SystemConfigModel({
    this.bannerTitle = 'Nicaragua en modo secreto',
    this.bannerSubtitle = 'Diseña rutas inmersivas con guías locales, reservas directas, mapa offline y un asistente AI',
    this.marqueeBrands = const [
      'Finca Selva Negra (Matagalpa)',
      'Cerro Negro Club (León)',
      'Ometepe Kayaks (Rivas)',
      'Baqueanos Nativos Cañón de Somoto',
      'Cooperativa Las Brisas',
      'Reserva Natural Indio Maíz',
    ],
    this.exchangeRate = 36.65,
    this.emergencyPhone = '+505 2277-4130',
    this.activeNotice = 'Temporada seca ideal para ascensos a volcanes y cañonismo.',
  });

  Map<String, dynamic> toMap() {
    return {
      'bannerTitle': bannerTitle,
      'bannerSubtitle': bannerSubtitle,
      'marqueeBrands': marqueeBrands,
      'exchangeRate': exchangeRate,
      'emergencyPhone': emergencyPhone,
      'activeNotice': activeNotice,
    };
  }

  factory SystemConfigModel.fromMap(Map<String, dynamic> map) {
    return SystemConfigModel(
      bannerTitle: map['bannerTitle'] ?? 'Nicaragua en modo secreto',
      bannerSubtitle: map['bannerSubtitle'] ?? '',
      marqueeBrands: List<String>.from(map['marqueeBrands'] ?? []),
      exchangeRate: (map['exchangeRate'] as num?)?.toDouble() ?? 36.65,
      emergencyPhone: map['emergencyPhone'] ?? '+505 2277-4130',
      activeNotice: map['activeNotice'] ?? '',
    );
  }
}
