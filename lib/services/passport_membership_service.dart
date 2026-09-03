// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SERVICIO DE MEMBRESÍA & PASAPORTE EXPLORADOR
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Gestionar la membresía digital para turistas ("Pasaporte Explorador"),
//   permitiendo monetizar directamente al usuario final a cambio de beneficios
//   tangibles: 15% de descuento en eco-lodges y tours, mapas offline sin señal
//   y consultas ilimitadas con el Asistente IA de Baqueano.
// - Fomentar la fidelización de viajeros extranjeros y nacionales.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Servicio singleton respaldado por `SharedPreferences` para persistencia local.
// - Proveedor Riverpod `passportMembershipProvider` reactivo.
// - Métodos de activación, verificación de vigencia y cálculo de descuentos.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & SERVICIO EXPUESTO):
// - `PassportMembershipService`: Gestión de suscripción turística ($9.99 / $24.99).
// - `passportMembershipProvider`: Notificador reactivo para toda la aplicación.
// ============================================================================

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

class PassportMembershipState {
  final bool isActive;
  final String planType; // 'trip' ($9.99) o 'annual' ($24.99)
  final DateTime? expiryDate;
  final double discountRate; // 0.15 (15%)

  const PassportMembershipState({
    this.isActive = false,
    this.planType = 'none',
    this.expiryDate,
    this.discountRate = 0.15,
  });

  PassportMembershipState copyWith({
    bool? isActive,
    String? planType,
    DateTime? expiryDate,
    double? discountRate,
  }) {
    return PassportMembershipState(
      isActive: isActive ?? this.isActive,
      planType: planType ?? this.planType,
      expiryDate: expiryDate ?? this.expiryDate,
      discountRate: discountRate ?? this.discountRate,
    );
  }
}

class PassportMembershipNotifier extends StateNotifier<PassportMembershipState> {
  PassportMembershipNotifier() : super(const PassportMembershipState()) {
    _loadFromPreferences();
  }

  static const _keyIsActive = 'baqueano_passport_active';
  static const _keyPlanType = 'baqueano_passport_plan_type';
  static const _keyExpiry = 'baqueano_passport_expiry';

  Future<void> _loadFromPreferences() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final isActive = prefs.getBool(_keyIsActive) ?? false;
      final planType = prefs.getString(_keyPlanType) ?? 'none';
      final expiryStr = prefs.getString(_keyExpiry);

      DateTime? expiry;
      if (expiryStr != null) {
        expiry = DateTime.tryParse(expiryStr);
      }

      // Validar si la membresía ha expirado
      final now = DateTime.now();
      final valid = isActive && (expiry == null || expiry.isAfter(now));

      state = state.copyWith(
        isActive: valid,
        planType: valid ? planType : 'none',
        expiryDate: valid ? expiry : null,
      );
    } catch (e) {
      debugPrint('Error cargando estado de pasaporte: $e');
    }
  }

  /// Activa el pasaporte con el plan seleccionado
  Future<void> activateMembership(String planType) async {
    final prefs = await SharedPreferences.getInstance();
    final now = DateTime.now();
    final expiry = planType == 'annual'
        ? now.add(const Duration(days: 365))
        : now.add(const Duration(days: 30));

    await prefs.setBool(_keyIsActive, true);
    await prefs.setString(_keyPlanType, planType);
    await prefs.setString(_keyExpiry, expiry.toIso8601String());

    state = state.copyWith(
      isActive: true,
      planType: planType,
      expiryDate: expiry,
    );
  }

  /// Desactiva o reinicia la membresía
  Future<void> deactivateMembership() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyIsActive);
    await prefs.remove(_keyPlanType);
    await prefs.remove(_keyExpiry);

    state = const PassportMembershipState();
  }
}

final passportMembershipProvider =
    StateNotifierProvider<PassportMembershipNotifier, PassportMembershipState>((ref) {
  return PassportMembershipNotifier();
});
