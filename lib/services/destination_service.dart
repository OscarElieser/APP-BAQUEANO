import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/baqueano_full_catalog.dart';
import '../models/destination_model.dart';
import '../models/business_model.dart';
import '../models/reservation_model.dart';
import '../models/experience_model.dart';

class DestinationService extends ChangeNotifier {
  List<DestinationModel> _destinations = [];
  List<BusinessModel> _businesses = [];
  List<ReservationModel> _reservations = [];
  List<ExperienceModel> _experiences = [];
  bool _isLoading = false;

  DestinationService() {
    _initData();
  }

  void _initData() {
    _destinations = List.from(BaqueanoFullCatalog.destinations);
    _businesses = List.from(BaqueanoFullCatalog.localBusinesses);
    _experiences = List.from(BaqueanoFullCatalog.communityExperiences);
    _reservations = [
      ReservationModel(
        bookingCode: 'BAQ-849204',
        userId: 'u-1',
        userEmail: 'explorador@baqueano.ni',
        destinationId: 'cascada-la-luna',
        destinationTitle: 'Cascada La Luna & Cañones',
        date: DateTime.now().add(const Duration(days: 3)),
        participants: 2,
        isForeignTourist: true,
        vatRate: 0.0,
        vatAmountUsd: 0.0,
        subtotalUsd: 70.0,
        discountUsd: 10.5,
        totalUsd: 59.5,
        totalNio: 2180.67,
        status: 'confirmed',
        qrData: 'BAQUEANO-PASS-NIC-849204-EXPLORER',
      ),
    ];
  }

  List<DestinationModel> get destinations => _destinations;
  List<BusinessModel> get businesses => _businesses;
  List<ReservationModel> get reservations => _reservations;
  List<ExperienceModel> get experiences => _experiences;
  bool get isLoading => _isLoading;

  List<DestinationModel> get popularDestinations =>
      _destinations.where((d) => d.isPopular).toList();

  List<DestinationModel> get favoriteDestinations =>
      _destinations.where((d) => d.isFavorite).toList();

  // Toggle favorite
  void toggleFavorite(String id) {
    final index = _destinations.indexWhere((d) => d.id == id);
    if (index != -1) {
      final dest = _destinations[index];
      _destinations[index] = dest.copyWith(isFavorite: !dest.isFavorite);
      notifyListeners();
    }
  }

  // Create new destination
  Future<void> addDestination(DestinationModel destination) async {
    _isLoading = true;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 400));
    _destinations.add(destination);

    _isLoading = false;
    notifyListeners();
  }

  // Update existing destination
  Future<void> updateDestination(DestinationModel destination) async {
    _isLoading = true;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 300));
    final index = _destinations.indexWhere((d) => d.id == destination.id);
    if (index != -1) {
      _destinations[index] = destination;
    }

    _isLoading = false;
    notifyListeners();
  }

  // Delete destination
  Future<void> deleteDestination(String id) async {
    _isLoading = true;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 300));
    _destinations.removeWhere((d) => d.id == id);

    _isLoading = false;
    notifyListeners();
  }

  // Add a new reservation
  Future<void> addReservation(ReservationModel reservation) async {
    _reservations.insert(0, reservation);
    notifyListeners();
  }

  // Add experience / review
  Future<void> addExperience(ExperienceModel experience) async {
    _experiences.insert(0, experience);
    notifyListeners();
  }
}

final destinationServiceProvider = ChangeNotifierProvider<DestinationService>((ref) {
  return DestinationService();
});
