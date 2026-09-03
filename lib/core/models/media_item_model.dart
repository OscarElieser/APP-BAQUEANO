// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MODELO DEL CENTRO MULTIMEDIA
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Gestionar el repositorio centralizado de medios (fotografías 4K, videos documentales,
//   archivos de audio de marimba/podcasts y guías PDF) de manera reutilizable.
// - Evitar la duplicación de archivos permitiendo que un mismo recurso multimedia
//   se asocie a múltiples entidades (un departamento, un poeta, un platillo).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Modelo inmutable serializable para la colección `multimedia` de Cloud Firestore.
// - Soporte de metadatos completos: tipo de medio, tamaño en bytes, autor y etiquetas.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES EXPUESTOS):
// - `MediaItemModel`: Entidad multimedia consumida por la App y la Web Administrativa.
// ============================================================================

// BAQUEANO
// ARCHIVO: media_item_model.dart
// MÓDULO: Multimedia Centralizada
// PROYECTO: SHARED (Consumido por APP y ADMIN WEB)
// INTEGRACIÓN: Cloud Firestore / multimedia & Firebase Storage
// CONSUMIDO POR: MultimediaGallery, AdminMediaPicker, VideoSpotCard
// RESPONSABILIDAD: Representar archivos multimedia reutilizables con etiquetas y referencias.
// NO CONTIENE: Lógica de subida binaria directa.

class MediaItemModel {
  final String id;
  final String title;
  final String description;
  final String type; // 'image', 'video', 'audio', 'document'
  final String fileUrl;
  final String? thumbnailUrl;
  final String category; // 'Destinos', 'Gastronomía', 'Cultura', 'Historia', 'Naturaleza', 'Negocios'
  final List<String> tags;
  final String countryId;
  final List<String> relatedIds; // IDs de destinos, poetas, platillos asociados
  final int fileSizeBytes;
  final String author;
  final String status; // 'published', 'draft', 'archived'
  final DateTime createdAt;
  final DateTime updatedAt;

  const MediaItemModel({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.fileUrl,
    this.thumbnailUrl,
    required this.category,
    required this.tags,
    this.countryId = 'nicaragua',
    required this.relatedIds,
    this.fileSizeBytes = 0,
    required this.author,
    this.status = 'published',
    required this.createdAt,
    required this.updatedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'type': type,
      'fileUrl': fileUrl,
      'thumbnailUrl': thumbnailUrl,
      'category': category,
      'tags': tags,
      'countryId': countryId,
      'relatedIds': relatedIds,
      'fileSizeBytes': fileSizeBytes,
      'author': author,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  factory MediaItemModel.fromMap(Map<String, dynamic> map, [String? docId]) {
    return MediaItemModel(
      id: docId ?? map['id'] ?? '',
      title: map['title'] ?? '',
      description: map['description'] ?? '',
      type: map['type'] ?? 'image',
      fileUrl: map['fileUrl'] ?? '',
      thumbnailUrl: map['thumbnailUrl'],
      category: map['category'] ?? 'Destinos',
      tags: List<String>.from(map['tags'] ?? []),
      countryId: map['countryId'] ?? 'nicaragua',
      relatedIds: List<String>.from(map['relatedIds'] ?? []),
      fileSizeBytes: (map['fileSizeBytes'] as num?)?.toInt() ?? 0,
      author: map['author'] ?? 'Baqueano Media',
      status: map['status'] ?? 'published',
      createdAt: map['createdAt'] != null
          ? DateTime.tryParse(map['createdAt']) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: map['updatedAt'] != null
          ? DateTime.tryParse(map['updatedAt']) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}
