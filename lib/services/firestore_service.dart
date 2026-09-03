// ============================================================================
// 🔥 BAQUEANO ECOSYSTEM — SERVICIO CLOUD FIRESTORE CENTRAL
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Actuar como el puente único y reactivo de datos entre la App de turistas
//   y la Web Administrativa independiente sobre la base de datos `appbaqueano`.
// - Permitir que las actualizaciones realizadas en el panel web (nuevos negocios,
//   cambios de precios, nuevos platillos, medios) se reflejen al instante en la App.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Streams en tiempo real con filtrado de seguridad (`status == 'published'` para la App).
// - Operaciones CRUD protegidas para administradores.
// - Manejo de errores con fallback a estructuras locales cuando no hay conectividad.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES EXPUESTOS):
// - `FirestoreService`: Servicio central inyectado por Riverpod (`firestoreServiceProvider`).
// ============================================================================

// BAQUEANO
// ARCHIVO: firestore_service.dart
// MÓDULO: Infraestructura Cloud
// PROYECTO: SHARED (Consumido por APP y ADMIN WEB)
// INTEGRACIÓN: Cloud Firestore (`appbaqueano`)
// CONSUMIDO POR: BusinessRepository, DestinationService, AdminDashboardController
// RESPONSABILIDAD: Gestionar todas las lecturas y escrituras en tiempo real de Firestore.
// NO CONTIENE: Lógica de UI ni credenciales expuestas en texto plano.

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/models/app_config_model.dart';
import '../core/models/audit_log_model.dart';
import '../core/models/business_model.dart';
import '../core/models/media_item_model.dart';
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

  Future<void> deleteDestination(String destinationId) async {
    try {
      await _destinationsRef.doc(destinationId).delete();
    } catch (e) {
      debugPrint('Error eliminando destino en Firestore: $e');
    }
  }

  // --------------------------------------------------------------------------
  // 🏪 COLECCIÓN: NEGOCIOS LOCALES & EMPRENDIMIENTOS CAMPESINOS
  // --------------------------------------------------------------------------
  CollectionReference<Map<String, dynamic>> get _businessesRef =>
      _firestore.collection('businesses');

  /// Stream para la APP: Solo muestra negocios con estado 'published'
  Stream<List<BusinessModel>> streamPublishedBusinesses() {
    return _businessesRef
        .where('status', isEqualTo: 'published')
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((doc) {
        return BusinessModel.fromMap(doc.data(), doc.id);
      }).toList();
    });
  }

  /// Stream para el ADMIN WEB: Muestra todos los negocios (borrador, pendiente, publicado, archivado)
  Stream<List<BusinessModel>> streamAllBusinesses() {
    return _businessesRef.snapshots().map((snapshot) {
      return snapshot.docs.map((doc) {
        return BusinessModel.fromMap(doc.data(), doc.id);
      }).toList();
    });
  }

  Future<void> saveBusiness(BusinessModel business) async {
    try {
      await _businessesRef.doc(business.id).set(business.toMap());
    } catch (e) {
      debugPrint('Error guardando negocio en Firestore: $e');
    }
  }

  Future<void> deleteBusiness(String businessId) async {
    try {
      await _businessesRef.doc(businessId).delete();
    } catch (e) {
      debugPrint('Error eliminando negocio en Firestore: $e');
    }
  }

  // --------------------------------------------------------------------------
  // 🗂️ COLECCIÓN: CENTRO MULTIMEDIA CENTRALIZADO
  // --------------------------------------------------------------------------
  CollectionReference<Map<String, dynamic>> get _multimediaRef =>
      _firestore.collection('multimedia');

  Stream<List<MediaItemModel>> streamMultimediaItems({String? type}) {
    Query<Map<String, dynamic>> query = _multimediaRef;
    if (type != null) {
      query = query.where('type', isEqualTo: type);
    }
    return query.snapshots().map((snapshot) {
      return snapshot.docs.map((doc) {
        return MediaItemModel.fromMap(doc.data(), doc.id);
      }).toList();
    });
  }

  Future<void> saveMediaItem(MediaItemModel item) async {
    try {
      await _multimediaRef.doc(item.id).set(item.toMap());
    } catch (e) {
      debugPrint('Error guardando archivo multimedia en Firestore: $e');
    }
  }

  Future<void> deleteMediaItem(String itemId) async {
    try {
      await _multimediaRef.doc(itemId).delete();
    } catch (e) {
      debugPrint('Error eliminando archivo multimedia en Firestore: $e');
    }
  }

  // --------------------------------------------------------------------------
  // 👤 COLECCIÓN: PERFILES DE EXPLORADORES Y GESTORES
  // --------------------------------------------------------------------------
  CollectionReference<Map<String, dynamic>> get _usersRef =>
      _firestore.collection('users');

  Stream<UserProfile?> streamUserProfile(String uid) {
    return _usersRef.doc(uid).snapshots().map((doc) {
      if (!doc.exists || doc.data() == null) return null;
      return UserProfile.fromMap(doc.data()!, doc.id);
    });
  }

  Stream<List<UserProfile>> streamAllUsers() {
    return _usersRef.snapshots().map((snapshot) {
      return snapshot.docs.map((doc) {
        return UserProfile.fromMap(doc.data(), doc.id);
      }).toList();
    });
  }

  Future<void> saveUserProfile(UserProfile profile) async {
    try {
      await _usersRef.doc(profile.uid).set(profile.toMap());
    } catch (e) {
      debugPrint('Error guardando perfil de usuario en Firestore: $e');
    }
  }

  // --------------------------------------------------------------------------
  // 🛡️ COLECCIÓN: REGISTRO DE AUDITORÍA INMUTABLE
  // --------------------------------------------------------------------------
  CollectionReference<Map<String, dynamic>> get _auditLogsRef =>
      _firestore.collection('audit_logs');

  Stream<List<AuditLogModel>> streamAuditLogs({int limit = 50}) {
    return _auditLogsRef
        .orderBy('timestamp', descending: true)
        .limit(limit)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((doc) {
        return AuditLogModel.fromMap(doc.data(), doc.id);
      }).toList();
    });
  }

  Future<void> logAuditEvent(AuditLogModel log) async {
    try {
      await _auditLogsRef.add(log.toMap());
    } catch (e) {
      debugPrint('Error registrando auditoría en Firestore: $e');
    }
  }

  // --------------------------------------------------------------------------
  // ⚙️ COLECCIÓN: CONFIGURACIÓN REMOTA (APP CONFIG)
  // --------------------------------------------------------------------------
  DocumentReference<Map<String, dynamic>> get _appConfigDoc =>
      _firestore.collection('app_config').doc('global');

  Stream<AppConfigModel> streamAppConfig() {
    return _appConfigDoc.snapshots().map((doc) {
      if (!doc.exists || doc.data() == null) {
        return AppConfigModel(
          announcementText:
              '¡OFERTAS EXCLUSIVAS! Descubre las mejores promociones de negocios locales.',
          activeCategories: const [
            'Hospedaje',
            'Restaurantes',
            'Café',
            'Volcanes',
            'Playas',
          ],
          updatedAt: DateTime.now(),
        );
      }
      return AppConfigModel.fromMap(doc.data()!, doc.id);
    });
  }

  Future<void> saveAppConfig(AppConfigModel config) async {
    try {
      await _appConfigDoc.set(config.toMap());
    } catch (e) {
      debugPrint('Error guardando configuración global en Firestore: $e');
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
