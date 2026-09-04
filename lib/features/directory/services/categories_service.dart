// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SERVICIO DE CATEGORÍAS Y DIVISIÓN TERRITORIAL
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Centralizar la carga, ordenamiento y consulta de categorías, departamentos
//   y municipios de Nicaragua para el Directorio Nacional.
// - Operar bajo una estrategia híbrida "Offline-First & Cloud-Ready": carga
//   inmediata desde assets JSON locales (`assets/data/`) y sincronización reactiva
//   con Cloud Firestore (`categories`, `departments`, `municipalities`).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Singleton Riverpod con caché en memoria.
// - Filtrado de municipios por `departmentId`.
// - Agrupación semántica de categorías por tipo de actividad.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & SERVICIO EXPUESTO):
// - `CategoriesService`: Gestión de taxonomías y división geográfica.
// - `categoriesServiceProvider`: Proveedor Riverpod global.
// ============================================================================

import 'dart:convert';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/category_model.dart';
import '../models/department_model.dart';
import '../models/municipality_model.dart';

class CategoriesService {
  List<CategoryModel> _cachedCategories = [];
  List<DepartmentModel> _cachedDepartments = [];
  List<MunicipalityModel> _cachedMunicipalities = [];

  FirebaseFirestore? get _firestore {
    try {
      if (Firebase.apps.isNotEmpty) {
        return FirebaseFirestore.instanceFor(
          app: Firebase.app(),
          databaseId: 'appbaqueano',
        );
      }
    } catch (_) {
      try {
        return FirebaseFirestore.instance;
      } catch (_) {}
    }
    return null;
  }

  /// Carga inicial de categorías desde assets con actualización desde Firestore
  Future<List<CategoryModel>> getCategories() async {
    if (_cachedCategories.isNotEmpty) return _cachedCategories;

    try {
      // 1. Carga desde asset local inmediato
      final jsonString = await rootBundle.loadString('assets/data/categories.json');
      final List<dynamic> jsonList = jsonDecode(jsonString);
      _cachedCategories = jsonList
          .map((item) => CategoryModel.fromMap(Map<String, dynamic>.from(item)))
          .where((cat) => cat.active)
          .toList();
      _cachedCategories.sort((a, b) => a.order.compareTo(b.order));
    } catch (e) {
      debugPrint('⚠️ [CategoriesService] Error cargando categories.json: $e');
    }

    // 2. Sincronización silenciosa con Firestore si existe conexión
    try {
      final db = _firestore;
      if (db != null) {
        final snapshot = await db.collection('categories').where('active', isEqualTo: true).get();
        if (snapshot.docs.isNotEmpty) {
          final cloudList = snapshot.docs
              .map((doc) => CategoryModel.fromMap(doc.data(), doc.id))
              .toList();
          cloudList.sort((a, b) => a.order.compareTo(b.order));
          _cachedCategories = cloudList;
        }
      }
    } catch (_) {
      // Mantener caché local si falla la red
    }

    return _cachedCategories;
  }

  /// Carga los 15 departamentos y 2 regiones autónomas de Nicaragua
  Future<List<DepartmentModel>> getDepartments() async {
    if (_cachedDepartments.isNotEmpty) return _cachedDepartments;

    try {
      final jsonString = await rootBundle.loadString('assets/data/departments.json');
      final List<dynamic> jsonList = jsonDecode(jsonString);
      _cachedDepartments = jsonList
          .map((item) => DepartmentModel.fromMap(Map<String, dynamic>.from(item)))
          .toList();
    } catch (e) {
      debugPrint('⚠️ [CategoriesService] Error cargando departments.json: $e');
    }
    return _cachedDepartments;
  }

  /// Carga los municipios y permite filtrarlos por departamento
  Future<List<MunicipalityModel>> getMunicipalities({String? departmentId}) async {
    if (_cachedMunicipalities.isEmpty) {
      try {
        final jsonString = await rootBundle.loadString('assets/data/municipalities.json');
        final List<dynamic> jsonList = jsonDecode(jsonString);
        _cachedMunicipalities = jsonList
            .map((item) => MunicipalityModel.fromMap(Map<String, dynamic>.from(item)))
            .toList();
      } catch (e) {
        debugPrint('⚠️ [CategoriesService] Error cargando municipalities.json: $e');
      }
    }

    if (departmentId != null && departmentId.isNotEmpty && departmentId != 'all') {
      return _cachedMunicipalities
          .where((m) => m.departmentId.toLowerCase() == departmentId.toLowerCase())
          .toList();
    }

    return _cachedMunicipalities;
  }
}

final categoriesServiceProvider = Provider<CategoriesService>((ref) {
  return CategoriesService();
});
