// ============================================================================
// 🔥 SERVICIO OFICIAL CLOUD FIRESTORE (FIRESTORE_SERVICE.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Gestionar la sincronización en la nube y persistencia en tiempo real para el
//   catálogo de expediciones, negocios campesinos aliados, reservaciones y
//   estatus de exploradores en la base de datos `appbaqueano` de Cloud Firestore.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Conexión específica a la base de datos `appbaqueano` mediante
//   `FirebaseFirestore.instanceFor(databaseId: 'appbaqueano')`.
// - Soporte offline nativo en Android con recuperación de datos en caché.
// - Inyección de dependencias reactiva mediante Riverpod.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & SERVICIOS EXPUESTOS):
// - `FirestoreService`: Servicio con operaciones CRUD y streams reactivos.
// - `firestoreServiceProvider`: Provider global de Riverpod.
// ============================================================================

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/destination_model.dart';
import '../models/user_profile.dart';

final firestoreServiceProvider = Provider<FirestoreService>((ref) {
  return FirestoreService();
});

class FirestoreService {
  late final FirebaseFirestore _firestore;
  static const String databaseId = 'appbaqueano';

  FirestoreService() {
    try {
      _firestore = FirebaseFirestore.instanceFor(
        app: Firebase.app(),
        databaseId: databaseId,
      );
    } catch (_) {
      _firestore = FirebaseFirestore.instance;
    }
  }

  FirebaseFirestore get firestoreInstance => _firestore;

  // --------------------------------------------------------------------------
  // 🌋 COLECCIÓN: DESTINOS & EXPEDICIONES
  // --------------------------------------------------------------------------
  CollectionReference<Map<String, dynamic>> get _destinationsRef =>
      _firestore.collection('destinations');

  Stream<List<DestinationModel>> streamDestinations() {
    return _destinationsRef.snapshots().map((snapshot) {
      return snapshot.docs.map((doc) {
        return DestinationModel.fromMap(doc.data(), doc.id);
      }).toList();
    });
  }

  Future<void> saveDestination(DestinationModel destination) async {
    try {
      await _destinationsRef.doc(destination.id).set(destination.toMap());
    } catch (e) {
      debugPrint('Error guardando destino en Firestore: $e');
    }
  }

  // --------------------------------------------------------------------------
  // 👤 COLECCIÓN: PERFILES DE EXPLORADORES
  // --------------------------------------------------------------------------
  CollectionReference<Map<String, dynamic>> get _usersRef =>
      _firestore.collection('users');

  Stream<UserProfile?> streamUserProfile(String uid) {
    return _usersRef.doc(uid).snapshots().map((doc) {
      if (!doc.exists || doc.data() == null) return null;
      return UserProfile.fromMap(doc.data()!, doc.id);
    });
  }

  Future<void> saveUserProfile(UserProfile profile) async {
    try {
      await _usersRef.doc(profile.uid).set(profile.toMap());
    } catch (e) {
      debugPrint('Error guardando perfil de explorador en Firestore: $e');
    }
  }

  // --------------------------------------------------------------------------
  // 🆘 COLECCIÓN: REGISTRO DE ALERTAS SOS & CONTINGENCIA
  // --------------------------------------------------------------------------
  CollectionReference<Map<String, dynamic>> get _sosLogsRef =>
      _firestore.collection('sos_logs');

  Future<void> logSosEmergency({
    required String coordinates,
    required String emergencyType,
    String? userEmail,
  }) async {
    try {
      await _sosLogsRef.add({
        'coordinates': coordinates,
        'emergencyType': emergencyType,
        'userEmail': userEmail ?? 'anónimo',
        'timestamp': FieldValue.serverTimestamp(),
        'platform': 'android',
        'status': 'active',
      });
    } catch (e) {
      debugPrint('Error registrando alerta SOS en Firestore: $e');
    }
  }
}
