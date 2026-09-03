// ============================================================================
// 🧭 BAQUEANO ADMIN — SISTEMA DE TOKENS Y COLORES OFICIALES
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Mantener la identidad volcánica oficial de BAQUEANO en la Web Administrativa.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Constantes hexadecimales inmutables sin dependencias circulares.
// - Uso estricto de `.withValues(alpha: X)` para transparencias en Flutter 3.27+.
//
// 📦 3. QUÉ (WHAT / TOKENS EXPUESTOS):
// - `AdminColors`: Paleta oficial volcánica y de acento.
// ============================================================================

// BAQUEANO
// ARCHIVO: admin_colors.dart
// MÓDULO: Tema & Estilo
// PROYECTO: ADMIN WEB
// INTEGRACIÓN: ThemeData y componentes visuales de Admin
// CONSUMIDO POR: AdminTheme, AdminLayout, AdminDashboardScreen
// RESPONSABILIDAD: Centralizar la paleta de colores oficial.
// NO CONTIENE: Lógica de widgets.

import 'package:flutter/material.dart';

class AdminColors {
  // Paleta Oficial Volcánica
  static const Color primaryDark = Color(0xFF082B35);
  static const Color primaryLight = Color(0xFF13424E);
  static const Color terracotta = Color(0xFFC86432);
  static const Color terracottaLight = Color(0xFFE07A48);
  static const Color gold = Color(0xFFD4AF37);
  static const Color goldLight = Color(0xFFF3E5AB);
  static const Color bgDark = Color(0xFF0F172A);
  static const Color bgCard = Color(0xFF132230);
  static const Color cyan = Color(0xFF06B6D4);

  // Estados Editoriales y de Gestión
  static const Color statusPublished = Color(0xFF10B981); // Verde publicado
  static const Color statusPending = Color(0xFFF59E0B);   // Ámbar en revisión
  static const Color statusDraft = Color(0xFF6B7280);     // Gris borrador
  static const Color statusArchived = Color(0xFFEF4444);  // Rojo archivado

  // Bordes y Textos
  static const Color borderLight = Color(0x25FFFFFF);
  static const Color borderGold = Color(0x40D4AF37);
  static const Color textLight = Color(0xFFF8FAFC);
  static const Color textMuted = Color(0xFF94A3B8);
}
