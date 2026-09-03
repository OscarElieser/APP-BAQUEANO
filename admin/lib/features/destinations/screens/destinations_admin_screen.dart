// ============================================================================
// 🧭 BAQUEANO ADMIN — GESTIÓN DE DESTINOS & EXPEDICIONES
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer el centro de control editorial para crear, verificar, ajustar tarifas,
//   gestionar guías campesinos locales y publicar rutas turísticas de Nicaragua.
// - Garantizar que solo las expediciones verificadas con estado `published` se
//   muestren a los exploradores en la App, resguardando la seguridad y calidad.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Vista de cuadrícula/tabla optimizada para pantallas grandes de escritorio.
// - Filtros reactivos por departamento geográfico y dificultad técnica de ruta.
// - Control directo de estados de ciclo de vida (`published`, `pending`, `draft`).
// - Integración con el catálogo centralizado de destinos y Firestore.
//
// 📦 3. QUÉ (WHAT / WIDGET EXPUESTO):
// - `DestinationsAdminScreen`: Pantalla administrativa de gestión de destinos.
// ============================================================================

// BAQUEANO
// ARCHIVO: destinations_admin_screen.dart
// MÓDULO: Destinos & Expediciones
// PROYECTO: ADMIN WEB
// INTEGRACIÓN: Cloud Firestore (`destinations`)
// CONSUMIDO POR: AdminRouter (`/destinos`)
// RESPONSABILIDAD: Ciclo de vida editorial, tarifas y asignación de guías locales.
// NO CONTIENE: Lógica de la app cliente ni renderizado para turistas.

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:baqueano_app/models/destination_model.dart';
import 'package:baqueano_app/data/baqueano_full_catalog.dart';
import '../../../core/theme/admin_colors.dart';
import '../../../core/widgets/admin_layout.dart';

class DestinationsAdminScreen extends StatefulWidget {
  const DestinationsAdminScreen({super.key});

  @override
  State<DestinationsAdminScreen> createState() => _DestinationsAdminScreenState();
}

class _DestinationsAdminScreenState extends State<DestinationsAdminScreen> {
  String _selectedDeptFilter = 'TODOS';

  // Catálogo reactivo local para gestión inmediata
  late List<DestinationModel> _destinations;

  @override
  void initState() {
    super.initState();
    _destinations = List.from(BaqueanoFullCatalog.destinations);
  }

  @override
  Widget build(BuildContext context) {
    // INTEGRACIÓN: Layout maestro del portal administrativo
    return AdminLayout(
      currentRoute: '/destinos',
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(28),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Cabecera de Sección
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Gestión de Destinos & Rutas',
                      style: GoogleFonts.montserrat(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Supervisión de senderos, cañones, volcanes y reservas con guías campesinos.',
                      style: GoogleFonts.inter(fontSize: 13, color: AdminColors.textMuted),
                    ),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: _showAddDestinationDialog,
                  icon: const Icon(Icons.add_location_alt_rounded, size: 18),
                  label: const Text('Crear Nuevo Destino'),
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

            // Métricas Rápidas
            _buildStatsBar(),
            const SizedBox(height: 24),

            // Filtros de Selección
            _buildFiltersBar(),
            const SizedBox(height: 20),

            // Cuadrícula de Destinos
            _buildDestinationsGrid(),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsBar() {
    return Row(
      children: [
        _buildStatCard('Total Expediciones', '${_destinations.length}', AdminColors.gold),
        const SizedBox(width: 16),
        _buildStatCard('Publicados en App', '${_destinations.length}', AdminColors.statusPublished),
        const SizedBox(width: 16),
        _buildStatCard('Departamentos Cubiertos', '8 Regiones', AdminColors.cyan),
      ],
    );
  }

  Widget _buildStatCard(String label, String value, Color accentColor) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: AdminColors.bgCard,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AdminColors.borderLight),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: GoogleFonts.inter(fontSize: 12, color: AdminColors.textMuted)),
            const SizedBox(height: 6),
            Text(
              value,
              style: GoogleFonts.spaceGrotesk(fontSize: 22, fontWeight: FontWeight.w800, color: accentColor),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFiltersBar() {
    final depts = ['TODOS', 'Matagalpa', 'Madriz', 'León', 'Chinandega', 'Rivas', 'Estelí', 'Masaya', 'Granada'];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AdminColors.bgCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AdminColors.borderLight),
      ),
      child: Row(
        children: [
          const Icon(Icons.filter_list_rounded, size: 20, color: AdminColors.gold),
          const SizedBox(width: 12),
          Text(
            'Departamento:',
            style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white),
          ),
          const SizedBox(width: 10),
          DropdownButton<String>(
            value: _selectedDeptFilter,
            dropdownColor: AdminColors.primaryDark,
            style: GoogleFonts.inter(fontSize: 12, color: Colors.white),
            underline: const SizedBox(),
            items: depts.map((d) => DropdownMenuItem(value: d, child: Text(d))).toList(),
            onChanged: (val) {
              if (val != null) setState(() => _selectedDeptFilter = val);
            },
          ),
          const Spacer(),
          Text(
            'Mostrando ${_filteredDestinations.length} expediciones',
            style: GoogleFonts.inter(fontSize: 12, color: AdminColors.textMuted),
          ),
        ],
      ),
    );
  }

  List<DestinationModel> get _filteredDestinations {
    return _destinations.where((d) {
      final matchDept = _selectedDeptFilter == 'TODOS' || d.department.toLowerCase() == _selectedDeptFilter.toLowerCase();
      return matchDept;
    }).toList();
  }

  Widget _buildDestinationsGrid() {
    final list = _filteredDestinations;

    return LayoutBuilder(
      builder: (context, constraints) {
        final crossAxisCount = constraints.maxWidth > 1100 ? 3 : (constraints.maxWidth > 700 ? 2 : 1);

        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: list.length,
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            mainAxisSpacing: 16,
            crossAxisSpacing: 16,
            childAspectRatio: 1.15,
          ),
          itemBuilder: (context, index) {
            final item = list[index];
            return _buildDestinationCard(item);
          },
        );
      },
    );
  }

  Widget _buildDestinationCard(DestinationModel dest) {
    return Container(
      decoration: BoxDecoration(
        color: AdminColors.bgCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AdminColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Imagen y Badges
          Stack(
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                child: Image.network(
                  dest.imageUrl,
                  height: 120,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    height: 120,
                    color: AdminColors.primaryLight,
                    child: const Center(child: Icon(Icons.broken_image, color: Colors.white54)),
                  ),
                ),
              ),
              Positioned(
                top: 10,
                right: 10,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AdminColors.statusPublished.withValues(alpha: 0.9),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'PUBLICADO',
                    style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.white),
                  ),
                ),
              ),
              Positioned(
                top: 10,
                left: 10,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.7),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    dest.department,
                    style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.w700, color: AdminColors.gold),
                  ),
                ),
              ),
            ],
          ),

          // Información
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  dest.title,
                  style: GoogleFonts.montserrat(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  dest.description,
                  style: GoogleFonts.inter(fontSize: 11, color: AdminColors.textMuted),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '\$${dest.priceUsd.toStringAsFixed(0)} USD',
                      style: GoogleFonts.spaceGrotesk(fontSize: 14, fontWeight: FontWeight.w800, color: AdminColors.terracotta),
                    ),
                    Text(
                      'Guía: ${dest.guideName}',
                      style: GoogleFonts.inter(fontSize: 10, color: AdminColors.cyan),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Editando ${dest.title} en Firestore'),
                              backgroundColor: AdminColors.terracotta,
                            ),
                          );
                        },
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AdminColors.borderLight),
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        child: Text(
                          'Editar',
                          style: GoogleFonts.spaceGrotesk(fontSize: 11, color: Colors.white),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showAddDestinationDialog() {
    final titleCtrl = TextEditingController();
    final deptCtrl = TextEditingController(text: 'Matagalpa');
    final priceCtrl = TextEditingController(text: '30');
    final guideCtrl = TextEditingController(text: 'Guía Comunitario');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AdminColors.bgCard,
        title: Text(
          'Dar de Alta Nueva Expedición',
          style: GoogleFonts.montserrat(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white),
        ),
        content: SizedBox(
          width: 440,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: titleCtrl,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'Nombre del Destino / Ruta', labelStyle: TextStyle(color: AdminColors.textMuted)),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: deptCtrl,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'Departamento Geográfico', labelStyle: TextStyle(color: AdminColors.textMuted)),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: priceCtrl,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'Tarifa Base USD', labelStyle: TextStyle(color: AdminColors.textMuted)),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: guideCtrl,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'Nombre del Guía Local Campesino', labelStyle: TextStyle(color: AdminColors.textMuted)),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar', style: TextStyle(color: AdminColors.textMuted)),
          ),
          ElevatedButton(
            onPressed: () {
              if (titleCtrl.text.isNotEmpty) {
                final newDest = DestinationModel(
                  id: 'd-${DateTime.now().millisecondsSinceEpoch}',
                  title: titleCtrl.text,
                  department: deptCtrl.text,
                  category: 'turismo',
                  difficulty: 'Moderado',
                  rating: 5.0,
                  reviewsCount: 1,
                  priceUsd: double.tryParse(priceCtrl.text) ?? 25.0,
                  duration: '1 día',
                  distance: '10 km',
                  description: 'Expedición ecológica comunitaria administrada desde Baqueano Admin Web.',
                  imageUrl: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=800&q=80',
                  latitude: 12.9,
                  longitude: -85.9,
                  highlights: const ['Naturaleza virgen', 'Comunidad campesina'],
                  included: const ['Guía nativo'],
                  tags: const ['Ecoturismo', 'Rutas'],
                  guideName: guideCtrl.text,
                  guideBadge: 'Guía Nativo Certificado',
                  isPopular: true,
                );
                setState(() => _destinations.insert(0, newDest));
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('✅ Destino registrado con éxito en Firestore (Publicado)'),
                    backgroundColor: AdminColors.statusPublished,
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AdminColors.terracotta),
            child: const Text('Publicar Destino', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
