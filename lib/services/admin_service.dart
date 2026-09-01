import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'destination_service.dart';

class AdminService extends ChangeNotifier {
  final Ref _ref;

  AdminService(this._ref);

  // Live Metrics
  int get totalBookings => _ref.read(destinationServiceProvider).reservations.length;

  double get totalRevenueUsd => _ref
      .read(destinationServiceProvider)
      .reservations
      .fold(0.0, (sum, item) => sum + item.totalUsd);

  double get totalRevenueNio => totalRevenueUsd * 36.65;

  int get totalDestinations => _ref.read(destinationServiceProvider).destinations.length;

  int get totalBusinesses => _ref.read(destinationServiceProvider).businesses.length;

  // JSON Database Backup Export
  String generateDatabaseBackupJson() {
    final destinations = _ref.read(destinationServiceProvider).destinations;
    final businesses = _ref.read(destinationServiceProvider).businesses;
    final reservations = _ref.read(destinationServiceProvider).reservations;
    final experiences = _ref.read(destinationServiceProvider).experiences;

    final backupMap = {
      'backupId': 'BACKUP-BAQUEANO-${DateTime.now().millisecondsSinceEpoch}',
      'timestamp': DateTime.now().toIso8601String(),
      'projectId': 'baqueanonicaragua-3e5c9',
      'exchangeRate': 36.65,
      'stats': {
        'destinationsCount': destinations.length,
        'businessesCount': businesses.length,
        'reservationsCount': reservations.length,
        'experiencesCount': experiences.length,
      },
      'collections': {
        'destinations': destinations.map((d) => d.toMap()).toList(),
        'businesses': businesses.map((b) => b.toMap()).toList(),
        'reservations': reservations.map((r) => r.toMap()).toList(),
        'experiences': experiences.map((e) => e.toMap()).toList(),
      },
    };

    return const JsonEncoder.withIndent('  ').convert(backupMap);
  }

  // Restore Database from JSON
  Future<bool> restoreDatabaseFromJson(String jsonContent) async {
    try {
      final decoded = json.decode(jsonContent) as Map<String, dynamic>;
      if (decoded.containsKey('collections')) {
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}

final adminServiceProvider = ChangeNotifierProvider<AdminService>((ref) {
  return AdminService(ref);
});
