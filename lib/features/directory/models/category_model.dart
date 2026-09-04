// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MODELO DE CATEGORÍAS DEL DIRECTORIO NACIONAL
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Estandarizar la taxonomía de categorías de lugares y servicios en Nicaragua
//   (Cultura, Comercio, Entretenimiento, Salud, Emergencias, Transporte).
// - Permitir navegación visual intuitiva mediante iconos y orden jerárquico.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Mapeo dinámico a `IconData` de Material Icons.
// - Clasificación por grupos semánticos (`culture`, `commerce`, `entertainment`,
//   `health`, `emergency`, `transport`).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & MODELO EXPUESTO):
// - `CategoryModel`: Modelo representativo con serialización a Map y Firestore.
// ============================================================================

import 'package:flutter/material.dart';

class CategoryModel {
  final String categoryId;
  final String name;
  final String description;
  final String icon;
  final String type; // 'culture', 'commerce', 'entertainment', 'health', 'emergency', 'transport'
  final int order;
  final bool active;

  const CategoryModel({
    required this.categoryId,
    required this.name,
    required this.description,
    required this.icon,
    required this.type,
    this.order = 0,
    this.active = true,
  });

  IconData get iconData {
    switch (icon) {
      case 'museum':
        return Icons.museum_rounded;
      case 'fort':
        return Icons.castle_rounded;
      case 'theater_comedy':
        return Icons.theater_comedy_rounded;
      case 'brush':
        return Icons.brush_rounded;
      case 'landscape':
        return Icons.landscape_rounded;
      case 'shopping_bag':
        return Icons.shopping_bag_rounded;
      case 'storefront':
        return Icons.storefront_rounded;
      case 'shopping_cart':
        return Icons.shopping_cart_rounded;
      case 'account_balance':
        return Icons.account_balance_rounded;
      case 'medication':
        return Icons.medication_rounded;
      case 'restaurant':
        return Icons.restaurant_rounded;
      case 'local_cafe':
        return Icons.local_cafe_rounded;
      case 'nightlife':
        return Icons.nightlife_rounded;
      case 'park':
        return Icons.park_rounded;
      case 'local_hospital':
        return Icons.local_hospital_rounded;
      case 'health_and_safety':
        return Icons.health_and_safety_rounded;
      case 'biotech':
        return Icons.biotech_rounded;
      case 'local_police':
        return Icons.local_police_rounded;
      case 'fire_truck':
        return Icons.fire_truck_rounded;
      case 'emergency':
        return Icons.emergency_rounded;
      case 'directions_bus':
        return Icons.directions_bus_rounded;
      case 'flight':
        return Icons.flight_takeoff_rounded;
      case 'directions_boat':
        return Icons.directions_boat_rounded;
      case 'local_gas_station':
        return Icons.local_gas_station_rounded;
      default:
        return Icons.place_rounded;
    }
  }

  Map<String, dynamic> toMap() {
    return {
      'categoryId': categoryId,
      'name': name,
      'description': description,
      'icon': icon,
      'type': type,
      'order': order,
      'active': active,
    };
  }

  factory CategoryModel.fromMap(Map<String, dynamic> map, [String? idFallback]) {
    return CategoryModel(
      categoryId: map['categoryId'] ?? idFallback ?? '',
      name: map['name'] ?? '',
      description: map['description'] ?? '',
      icon: map['icon'] ?? 'place',
      type: map['type'] ?? 'culture',
      order: (map['order'] as num?)?.toInt() ?? 0,
      active: map['active'] ?? true,
    );
  }
}
