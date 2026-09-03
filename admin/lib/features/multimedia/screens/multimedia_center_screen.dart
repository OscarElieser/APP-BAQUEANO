// ============================================================================
// 🧭 BAQUEANO ADMIN — CENTRO MULTIMEDIA CENTRALIZADO
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una biblioteca centralizada de medios digitales (fotografías 4K, videos
//   de YouTube/MP4, audios folclóricos de marimba y documentos turísticos).
// - Permitir asociar un mismo archivo a múltiples entidades (un departamento, un poeta,
//   un platillo o una ruta) evitando la duplicación innecesaria.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Pestañas de filtrado por formato (fotos, videos, música, documentos).
// - Tarjetas de previsualización con etiquetas temáticas y URLs copiables.
//
// 📦 3. QUÉ (WHAT / WIDGET EXPUESTO):
// - `MultimediaCenterScreen`: Pantalla del repositorio multimedia.
// ============================================================================

// BAQUEANO
// ARCHIVO: multimedia_center_screen.dart
// MÓDULO: Centro Multimedia
// PROYECTO: ADMIN WEB
// INTEGRACIÓN: Firebase Storage & Cloud Firestore (`multimedia`)
// CONSUMIDO POR: AdminRouter (`/multimedia`)
// RESPONSABILIDAD: Biblioteca centralizada y reutilizable de medios.
// NO CONTIENE: Lógica de la app cliente.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:baqueano_app/core/models/media_item_model.dart';
import '../../../core/theme/admin_colors.dart';
import '../../../core/widgets/admin_layout.dart';

class MultimediaCenterScreen extends StatefulWidget {
  const MultimediaCenterScreen({super.key});

  @override
  State<MultimediaCenterScreen> createState() => _MultimediaCenterScreenState();
}

class _MultimediaCenterScreenState extends State<MultimediaCenterScreen> {
  String _selectedType = 'TODOS';

  final List<MediaItemModel> _mediaItems = [
    MediaItemModel(
      id: 'm-somoto-4k',
      title: 'Cañón de Somoto en 4K Ultra HD',
      description: 'Expedición en botes inflables por farallones volcánicos del Río Coco.',
      type: 'video',
      fileUrl: 'https://www.youtube.com/watch?v=0k5Fz4vUaEI',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      category: 'Destinos',
      tags: ['Somoto', 'Río Coco', 'Madriz', 'Aventura'],
      relatedIds: ['d-madriz', 'nw-canon-somoto'],
      author: 'Expediciones Baqueano',
      createdAt: DateTime.now().subtract(const Duration(days: 10)),
      updatedAt: DateTime.now(),
    ),
    MediaItemModel(
      id: 'm-solar-monimbo',
      title: 'Audio Son Nica: El Solar de Monimbó',
      description: 'Interpretación en marimba de arco y compás 6/8 de Camilo Zapata.',
      type: 'audio',
      fileUrl: 'https://www.youtube.com/watch?v=0k5Fz4vUaEI',
      category: 'Cultura',
      tags: ['Masaya', 'Son Nica', 'Folklore'],
      relatedIds: ['solar-de-monimbo', 'd-masaya'],
      author: 'Patrimonio Cultural',
      createdAt: DateTime.now().subtract(const Duration(days: 15)),
      updatedAt: DateTime.now(),
    ),
    MediaItemModel(
      id: 'm-cerro-negro-photo',
      title: 'Fotografía: Sandboarding en Cerro Negro',
      description: 'Descenso en tabla sobre arena volcánica al atardecer.',
      type: 'image',
      fileUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      category: 'Destinos',
      tags: ['León', 'Volcán', 'Cerro Negro', 'Aventura'],
      relatedIds: ['d-leon', 'nw-cerro-negro'],
      author: 'Baqueano Photo Studio',
      createdAt: DateTime.now().subtract(const Duration(days: 5)),
      updatedAt: DateTime.now(),
    ),
  ];

  List<MediaItemModel> get _filteredItems {
    if (_selectedType == 'TODOS') return _mediaItems;
    return _mediaItems.where((m) => m.type.toLowerCase() == _selectedType.toLowerCase()).toList();
  }

  void _showUploadDialog(BuildContext context) {
    final titleCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    final urlCtrl = TextEditingController();
    final typeCtrl = TextEditingController(text: 'image');
    final tagCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AdminColors.primaryDark,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AdminColors.borderGold),
        ),
        title: Row(
          children: [
            const Icon(Icons.cloud_upload_rounded, color: AdminColors.gold),
            const SizedBox(width: 10),
            Text(
              'Agregar Recurso Multimedia',
              style: GoogleFonts.montserrat(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white),
            ),
          ],
        ),
        content: SizedBox(
          width: 480,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildField(titleCtrl, 'Título del archivo', Icons.title_rounded),
              const SizedBox(height: 12),
              _buildField(typeCtrl, 'Tipo (image, video, audio, document)', Icons.category_rounded),
              const SizedBox(height: 12),
              _buildField(urlCtrl, 'URL del archivo o enlace de YouTube', Icons.link_rounded),
              const SizedBox(height: 12),
              _buildField(tagCtrl, 'Etiquetas separadas por coma', Icons.tag_rounded),
              const SizedBox(height: 12),
              _buildField(descCtrl, 'Descripción / Notas', Icons.description_rounded, maxLines: 2),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancelar', style: GoogleFonts.spaceGrotesk(color: AdminColors.textMuted)),
          ),
          ElevatedButton(
            onPressed: () {
              final item = MediaItemModel(
                id: 'm-${DateTime.now().millisecondsSinceEpoch}',
                title: titleCtrl.text.trim(),
                description: descCtrl.text.trim(),
                type: typeCtrl.text.trim().toLowerCase(),
                fileUrl: urlCtrl.text.trim(),
                thumbnailUrl: urlCtrl.text.trim(),
                category: 'General',
                tags: tagCtrl.text.split(',').map((t) => t.trim()).toList(),
                relatedIds: [],
                author: 'Admin Baqueano',
                createdAt: DateTime.now(),
                updatedAt: DateTime.now(),
              );

              setState(() => _mediaItems.insert(0, item));
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Recurso añadido al Centro Multimedia', style: GoogleFonts.spaceGrotesk()),
                  backgroundColor: AdminColors.statusPublished,
                ),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: AdminColors.terracotta, foregroundColor: Colors.white),
            child: const Text('Guardar'),
          ),
        ],
      ),
    );
  }

  Widget _buildField(TextEditingController ctrl, String label, IconData icon, {int maxLines = 1}) {
    return TextField(
      controller: ctrl,
      maxLines: maxLines,
      style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 13),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.inter(color: AdminColors.textMuted, fontSize: 12),
        prefixIcon: Icon(icon, color: AdminColors.goldLight, size: 20),
        filled: true,
        fillColor: AdminColors.bgDark,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AdminColors.borderLight)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AdminColors.borderLight)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AdminColors.gold)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AdminLayout(
      currentRoute: '/multimedia',
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(28),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Cabecera
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Centro Multimedia Centralizado',
                      style: GoogleFonts.montserrat(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Biblioteca de fotos, videos y audios reutilizables en destinos, cultura y comercios.',
                      style: GoogleFonts.inter(fontSize: 13, color: AdminColors.textMuted),
                    ),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () => _showUploadDialog(context),
                  icon: const Icon(Icons.cloud_upload_rounded, size: 18),
                  label: const Text('Subir Archivo'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AdminColors.terracotta,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Filtros de Tipo
            Row(
              children: [
                _buildTypeChip('TODOS', _selectedType == 'TODOS', () => setState(() => _selectedType = 'TODOS')),
                const SizedBox(width: 8),
                _buildTypeChip('FOTOGRAFÍAS', _selectedType == 'image', () => setState(() => _selectedType = 'image')),
                const SizedBox(width: 8),
                _buildTypeChip('VIDEOS', _selectedType == 'video', () => setState(() => _selectedType = 'video')),
                const SizedBox(width: 8),
                _buildTypeChip('AUDIOS', _selectedType == 'audio', () => setState(() => _selectedType = 'audio')),
              ],
            ),

            const SizedBox(height: 24),

            // Rejilla de Medios
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                maxCrossAxisExtent: 360,
                mainAxisExtent: 260,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
              ),
              itemCount: _filteredItems.length,
              itemBuilder: (context, index) {
                final item = _filteredItems[index];

                return Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AdminColors.bgCard,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: AdminColors.borderLight),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AdminColors.terracotta.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              item.type.toUpperCase(),
                              style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.w800, color: AdminColors.terracottaLight),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.copy_rounded, size: 16, color: AdminColors.goldLight),
                            tooltip: 'Copiar URL',
                            onPressed: () {
                              Clipboard.setData(ClipboardData(text: item.fileUrl));
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('URL copiada al portapapeles')),
                              );
                            },
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        item.title,
                        style: GoogleFonts.montserrat(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        item.description,
                        style: GoogleFonts.inter(fontSize: 11.5, color: AdminColors.textMuted),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const Spacer(),
                      Wrap(
                        spacing: 6,
                        runSpacing: 4,
                        children: item.tags.map((tag) {
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AdminColors.primaryDark,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              '#$tag',
                              style: GoogleFonts.spaceGrotesk(fontSize: 10, color: AdminColors.goldLight),
                            ),
                          );
                        }).toList(),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTypeChip(String label, bool isSelected, VoidCallback onTap) {
    return FilterChip(
      selected: isSelected,
      label: Text(label),
      labelStyle: GoogleFonts.spaceGrotesk(
        fontSize: 11,
        fontWeight: FontWeight.w800,
        color: isSelected ? Colors.white : AdminColors.textLight,
      ),
      selectedColor: AdminColors.terracotta,
      backgroundColor: AdminColors.bgCard,
      side: BorderSide(color: isSelected ? AdminColors.gold : AdminColors.borderLight),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      onSelected: (_) => onTap(),
    );
  }
}
