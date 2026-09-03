// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MODELO DE REGISTRO DE AUDITORÍA
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer trazabilidad inmutable y seguridad sobre todas las modificaciones
//   realizadas desde la Web Administrativa (creación de negocios, publicaciones,
//   eliminaciones y cambios de estado editorial).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Entidad estructurada para la colección `audit_logs` de Cloud Firestore.
// - Almacena usuario responsable, rol, acción ejecutada, colección y fecha exacta.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES EXPUESTOS):
// - `AuditLogModel`: Registro de auditoría administrativa.
// ============================================================================

// BAQUEANO
// ARCHIVO: audit_log_model.dart
// MÓDULO: Auditoría & Trazabilidad
// PROYECTO: SHARED (Generado en ADMIN WEB / APP, almacenado en Firestore)
// INTEGRACIÓN: Cloud Firestore / audit_logs
// CONSUMIDO POR: SettingsAuditScreen, SecurityMonitor
// RESPONSABILIDAD: Representar eventos auditables inmutables.
// NO CONTIENE: Lógica de persistencia directa.

class AuditLogModel {
  final String id;
  final String userId;
  final String userEmail;
  final String userRole; // 'super_admin', 'admin', 'editor', 'moderator', 'content_manager'
  final String action; // 'create', 'update', 'delete', 'publish', 'unpublish'
  final String collectionName;
  final String documentId;
  final String description;
  final Map<String, dynamic> metadata;
  final DateTime timestamp;

  const AuditLogModel({
    required this.id,
    required this.userId,
    required this.userEmail,
    required this.userRole,
    required this.action,
    required this.collectionName,
    required this.documentId,
    required this.description,
    this.metadata = const {},
    required this.timestamp,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'userEmail': userEmail,
      'userRole': userRole,
      'action': action,
      'collectionName': collectionName,
      'documentId': documentId,
      'description': description,
      'metadata': metadata,
      'timestamp': timestamp.toIso8601String(),
    };
  }

  factory AuditLogModel.fromMap(Map<String, dynamic> map, [String? docId]) {
    return AuditLogModel(
      id: docId ?? map['id'] ?? '',
      userId: map['userId'] ?? '',
      userEmail: map['userEmail'] ?? '',
      userRole: map['userRole'] ?? 'admin',
      action: map['action'] ?? 'update',
      collectionName: map['collectionName'] ?? '',
      documentId: map['documentId'] ?? '',
      description: map['description'] ?? '',
      metadata: Map<String, dynamic>.from(map['metadata'] ?? {}),
      timestamp: map['timestamp'] != null
          ? DateTime.tryParse(map['timestamp']) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}
