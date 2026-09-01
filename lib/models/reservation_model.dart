class ReservationModel {
  final String bookingCode; // e.g. 'BAQ-849204'
  final String userId;
  final String userEmail;
  final String destinationId;
  final String destinationTitle;
  final DateTime date;
  final int participants;
  final bool isForeignTourist; // 0% VAT vs 15% VAT
  final double vatRate; // 0.0 or 0.15
  final double vatAmountUsd;
  final double subtotalUsd;
  final double discountUsd;
  final double totalUsd;
  final double totalNio;
  final String status; // 'pending', 'confirmed', 'completed'
  final String qrData;

  const ReservationModel({
    required this.bookingCode,
    required this.userId,
    required this.userEmail,
    required this.destinationId,
    required this.destinationTitle,
    required this.date,
    required this.participants,
    required this.isForeignTourist,
    required this.vatRate,
    required this.vatAmountUsd,
    required this.subtotalUsd,
    this.discountUsd = 0.0,
    required this.totalUsd,
    required this.totalNio,
    this.status = 'confirmed',
    required this.qrData,
  });

  Map<String, dynamic> toMap() {
    return {
      'bookingCode': bookingCode,
      'userId': userId,
      'userEmail': userEmail,
      'destinationId': destinationId,
      'destinationTitle': destinationTitle,
      'date': date.toIso8601String(),
      'participants': participants,
      'isForeignTourist': isForeignTourist,
      'vatRate': vatRate,
      'vatAmountUsd': vatAmountUsd,
      'subtotalUsd': subtotalUsd,
      'discountUsd': discountUsd,
      'totalUsd': totalUsd,
      'totalNio': totalNio,
      'status': status,
      'qrData': qrData,
    };
  }

  factory ReservationModel.fromMap(Map<String, dynamic> map) {
    return ReservationModel(
      bookingCode: map['bookingCode'] ?? 'BAQ-000000',
      userId: map['userId'] ?? '',
      userEmail: map['userEmail'] ?? '',
      destinationId: map['destinationId'] ?? '',
      destinationTitle: map['destinationTitle'] ?? '',
      date: map['date'] != null ? DateTime.tryParse(map['date']) ?? DateTime.now() : DateTime.now(),
      participants: (map['participants'] as num?)?.toInt() ?? 1,
      isForeignTourist: map['isForeignTourist'] ?? true,
      vatRate: (map['vatRate'] as num?)?.toDouble() ?? 0.0,
      vatAmountUsd: (map['vatAmountUsd'] as num?)?.toDouble() ?? 0.0,
      subtotalUsd: (map['subtotalUsd'] as num?)?.toDouble() ?? 0.0,
      discountUsd: (map['discountUsd'] as num?)?.toDouble() ?? 0.0,
      totalUsd: (map['totalUsd'] as num?)?.toDouble() ?? 0.0,
      totalNio: (map['totalNio'] as num?)?.toDouble() ?? 0.0,
      status: map['status'] ?? 'confirmed',
      qrData: map['qrData'] ?? '',
    );
  }
}
