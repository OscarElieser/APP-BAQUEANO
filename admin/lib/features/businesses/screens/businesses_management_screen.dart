// ============================================================================
// 🧭 BAQUEANO ADMIN — GESTIÓN DE NEGOCIOS CAMPESINOS & COMERCIOS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer el centro de control editorial para dar de alta, verificar, editar
//   y publicar restaurantes, hospedajes, cooperativas de guías nativos y artesanos.
// - Asegurar que solo los negocios con estado `published` sean visibles para los
//   turistas en la App, controlando la calidad y autenticidad del comercio justo.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Interfaz de tabla/tarjetas conectada en tiempo real a la colección `businesses`.
// - Modal de alta y edición con campos exhaustivos de contacto y ubicación.
// - Cambio de estado en un toque (`published`, `pending`, `archived`).
//
// 📦 3. QUÉ (WHAT / WIDGET EXPUESTO):
// - `BusinessesManagementScreen`: Pantalla administrativa de comercios.
// ============================================================================

// BAQUEANO
// ARCHIVO: businesses_management_screen.dart
// MÓDULO: Negocios & Comercios
// PROYECTO: ADMIN WEB
// INTEGRACIÓN: Cloud Firestore (`businesses`)
// CONSUMIDO POR: AdminRouter (`/negocios`)
// RESPONSABILIDAD: CRUD y ciclo de vida editorial de negocios locales.
// NO CONTIENE: Lógica de la app cliente.

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:baqueano_app/core/models/business_model.dart';
import '../../../core/theme/admin_colors.dart';
import '../../../core/widgets/admin_layout.dart';

class BusinessesManagementScreen extends StatefulWidget {
  const BusinessesManagementScreen({super.key});

  @override
  State<BusinessesManagementScreen> createState() => _BusinessesManagementScreenState();
}

class _BusinessesManagementScreenState extends State<BusinessesManagementScreen> {
  String _selectedStatusFilter = 'TODOS';
  final String _selectedCategoryFilter = 'TODAS';

  // Catálogo local mutable simulando Firestore en tiempo real
  final List<BusinessModel> _businesses = [
    BusinessModel(
      id: 'b-totoco',
      name: 'Totoco Eco-Lodge Ometepe',
      description: 'Cabañas bioclimáticas con vista directa al Volcán Concepción, piscina natural y restaurante orgánico.',
      category: 'Hospedaje',
      subcategory: 'Eco-Lodge Bioclimático',
      country: 'Nicaragua',
      department: 'Rivas',
      municipality: 'Altagracia',
      address: 'Laderas del Volcán Maderas, Isla de Ometepe',
      latitude: 11.4721,
      longitude: -85.5234,
      phone: '+505 8888-1234',
      email: 'reservas@totoco.com.ni',
      website: 'https://totoco.com.ni',
      socialNetworks: {'whatsapp': '+505 8888-1234'},
      openingHours: '7:00 AM - 9:00 PM',
      images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'],
      videos: [],
      rating: 4.9,
      reviewsCount: 128,
      status: 'published',
      verified: true,
      createdAt: DateTime.now().subtract(const Duration(days: 30)),
      updatedAt: DateTime.now(),
    ),
    BusinessModel(
      id: 'b-comedor-somoto',
      name: 'Comedor Campesino Doña Mary',
      description: 'Platos tradicionales al fogón de leña: gallo pinto, cuajada fresca, güirilas con crema y café de palo.',
      category: 'Restaurante',
      subcategory: 'Comedor Comunitario',
      country: 'Nicaragua',
      department: 'Madriz',
      municipality: 'Somoto',
      address: 'Entrada al Cañón de Somoto, Comunidad Sonís',
      latitude: 13.4833,
      longitude: -86.5833,
      phone: '+505 8765-4321',
      email: 'mary@somoto.ni',
      website: '',
      socialNetworks: {'whatsapp': '+505 8765-4321'},
      openingHours: '6:00 AM - 5:00 PM',
      images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'],
      videos: [],
      rating: 4.8,
      reviewsCount: 94,
      status: 'published',
      verified: true,
      createdAt: DateTime.now().subtract(const Duration(days: 20)),
      updatedAt: DateTime.now(),
    ),
    BusinessModel(
      id: 'b-guias-telica',
      name: 'Guías Nativos Volcán Telica',
      description: 'Asociación de baqueanos locales para senderismo nocturno a cráteres con lava incandescente.',
      category: 'Guía/Tour',
      subcategory: 'Senderismo de Cumbre',
      country: 'Nicaragua',
      department: 'León',
      municipality: 'Telica',
      address: 'Comunidad San Jacinto, León',
      latitude: 12.6022,
      longitude: -86.8450,
      phone: '+505 8444-9988',
      email: 'guias@telica.ni',
      website: '',
      socialNetworks: {'whatsapp': '+505 8444-9988'},
      openingHours: '24 Horas con Reserva',
      images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80'],
      videos: [],
      rating: 5.0,
      reviewsCount: 42,
      status: 'pending',
      verified: false,
      createdAt: DateTime.now().subtract(const Duration(days: 2)),
      updatedAt: DateTime.now(),
    ),
  ];

  List<BusinessModel> get _filteredBusinesses {
    return _businesses.where((b) {
      final matchesStatus = _selectedStatusFilter == 'TODOS' ||
          b.status.toLowerCase() == _selectedStatusFilter.toLowerCase();
      final matchesCat = _selectedCategoryFilter == 'TODAS' ||
          b.category.toLowerCase() == _selectedCategoryFilter.toLowerCase();
      return matchesStatus && matchesCat;
    }).toList();
  }

  void _showCreateBusinessModal(BuildContext context, [BusinessModel? businessToEdit]) {
    final nameCtrl = TextEditingController(text: businessToEdit?.name ?? '');
    final descCtrl = TextEditingController(text: businessToEdit?.description ?? '');
    final catCtrl = TextEditingController(text: businessToEdit?.category ?? 'Hospedaje');
    final deptCtrl = TextEditingController(text: businessToEdit?.department ?? 'Matagalpa');
    final muniCtrl = TextEditingController(text: businessToEdit?.municipality ?? 'Matagalpa');
    final phoneCtrl = TextEditingController(text: businessToEdit?.phone ?? '+505 ');
    final imageCtrl = TextEditingController(
        text: businessToEdit?.images.isNotEmpty == true
            ? businessToEdit!.images.first
            : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80');

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
            const Icon(Icons.storefront_rounded, color: AdminColors.gold),
            const SizedBox(width: 10),
            Text(
              businessToEdit == null ? 'Registrar Nuevo Negocio' : 'Editar Negocio Local',
              style: GoogleFonts.montserrat(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white),
            ),
          ],
        ),
        content: SizedBox(
          width: 500,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildField(nameCtrl, 'Nombre del Negocio', Icons.business_rounded),
                const SizedBox(height: 12),
                _buildField(catCtrl, 'Categoría (Hospedaje, Restaurante, Guía/Tour)', Icons.category_rounded),
                const SizedBox(height: 12),
                _buildField(deptCtrl, 'Departamento', Icons.map_rounded),
                const SizedBox(height: 12),
                _buildField(muniCtrl, 'Municipio', Icons.location_city_rounded),
                const SizedBox(height: 12),
                _buildField(phoneCtrl, 'WhatsApp / Teléfono', Icons.phone_rounded),
                const SizedBox(height: 12),
                _buildField(descCtrl, 'Descripción / Servicios', Icons.description_rounded, maxLines: 3),
                const SizedBox(height: 12),
                _buildField(imageCtrl, 'URL Fotografía', Icons.image_rounded),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancelar', style: GoogleFonts.spaceGrotesk(color: AdminColors.textMuted)),
          ),
          ElevatedButton.icon(
            onPressed: () {
              final newBusiness = BusinessModel(
                id: businessToEdit?.id ?? 'b-${DateTime.now().millisecondsSinceEpoch}',
                name: nameCtrl.text.trim(),
                description: descCtrl.text.trim(),
                category: catCtrl.text.trim(),
                subcategory: 'Emprendimiento Verificado',
                country: 'Nicaragua',
                department: deptCtrl.text.trim(),
                municipality: muniCtrl.text.trim(),
                address: '${muniCtrl.text.trim()}, ${deptCtrl.text.trim()}',
                latitude: 12.0,
                longitude: -86.0,
                phone: phoneCtrl.text.trim(),
                email: 'contacto@baqueano.ni',
                website: '',
                socialNetworks: {'whatsapp': phoneCtrl.text.trim()},
                openingHours: '7:00 AM - 6:00 PM',
                images: [imageCtrl.text.trim()],
                videos: [],
                status: 'published',
                verified: true,
                createdAt: businessToEdit?.createdAt ?? DateTime.now(),
                updatedAt: DateTime.now(),
              );

              setState(() {
                if (businessToEdit != null) {
                  final idx = _businesses.indexWhere((b) => b.id == businessToEdit.id);
                  if (idx != -1) _businesses[idx] = newBusiness;
                } else {
                  _businesses.insert(0, newBusiness);
                }
              });

              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    businessToEdit == null ? 'Negocio registrado y publicado con éxito' : 'Negocio actualizado',
                    style: GoogleFonts.spaceGrotesk(),
                  ),
                  backgroundColor: AdminColors.statusPublished,
                ),
              );
            },
            icon: const Icon(Icons.check_circle_rounded, size: 18),
            label: Text(businessToEdit == null ? 'Guardar y Publicar' : 'Actualizar'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AdminColors.terracotta,
              foregroundColor: Colors.white,
            ),
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
      currentRoute: '/negocios',
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
                      'Gestión de Negocios Campesinos & Comercios',
                      style: GoogleFonts.montserrat(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Administra alojamientos, restaurantes, guías y artesanías vinculadas a Firestore.',
                      style: GoogleFonts.inter(fontSize: 13, color: AdminColors.textMuted),
                    ),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () => _showCreateBusinessModal(context),
                  icon: const Icon(Icons.add_rounded, size: 20),
                  label: const Text('Nuevo Negocio'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AdminColors.terracotta,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Filtros de Estado
            Row(
              children: [
                _buildFilterChip('TODOS', _selectedStatusFilter == 'TODOS', () {
                  setState(() => _selectedStatusFilter = 'TODOS');
                }),
                const SizedBox(width: 8),
                _buildFilterChip('PUBLICADOS', _selectedStatusFilter == 'published', () {
                  setState(() => _selectedStatusFilter = 'published');
                }),
                const SizedBox(width: 8),
                _buildFilterChip('PENDIENTES', _selectedStatusFilter == 'pending', () {
                  setState(() => _selectedStatusFilter = 'pending');
                }),
                const SizedBox(width: 8),
                _buildFilterChip('ARCHIVADOS', _selectedStatusFilter == 'archived', () {
                  setState(() => _selectedStatusFilter = 'archived');
                }),
              ],
            ),

            const SizedBox(height: 20),

            // Lista de Tarjetas de Negocio
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _filteredBusinesses.length,
              separatorBuilder: (_, __) => const SizedBox(height: 14),
              itemBuilder: (context, index) {
                final b = _filteredBusinesses[index];
                final isPub = b.status == 'published';

                return Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: AdminColors.bgCard,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: isPub ? AdminColors.borderGold : AdminColors.borderLight),
                  ),
                  child: Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(
                          b.images.isNotEmpty ? b.images.first : '',
                          width: 80,
                          height: 80,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            width: 80,
                            height: 80,
                            color: AdminColors.primaryLight,
                            child: const Icon(Icons.storefront, color: AdminColors.gold),
                          ),
                        ),
                      ),
                      const SizedBox(width: 18),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  b.name,
                                  style: GoogleFonts.montserrat(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white),
                                ),
                                const SizedBox(width: 10),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: (isPub ? AdminColors.statusPublished : AdminColors.statusPending).withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: isPub ? AdminColors.statusPublished : AdminColors.statusPending,
                                      width: 0.8,
                                    ),
                                  ),
                                  child: Text(
                                    b.status.toUpperCase(),
                                    style: GoogleFonts.spaceGrotesk(
                                      fontSize: 9.5,
                                      fontWeight: FontWeight.w800,
                                      color: isPub ? AdminColors.statusPublished : AdminColors.statusPending,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${b.category} · ${b.department}, ${b.municipality} · Contacto: ${b.phone}',
                              style: GoogleFonts.inter(fontSize: 12, color: AdminColors.goldLight),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              b.description,
                              style: GoogleFonts.inter(fontSize: 12, color: AdminColors.textMuted),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 16),

                      // Botonera de Acciones
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            icon: Icon(
                              isPub ? Icons.visibility_off_rounded : Icons.visibility_rounded,
                              color: isPub ? AdminColors.statusPending : AdminColors.statusPublished,
                              size: 20,
                            ),
                            tooltip: isPub ? 'Despublicar de la App' : 'Publicar en la App',
                            onPressed: () {
                              setState(() {
                                final idx = _businesses.indexWhere((item) => item.id == b.id);
                                if (idx != -1) {
                                  _businesses[idx] = b.copyWith(
                                    status: isPub ? 'draft' : 'published',
                                    updatedAt: DateTime.now(),
                                  );
                                }
                              });
                            },
                          ),
                          IconButton(
                            icon: const Icon(Icons.edit_rounded, color: Colors.white, size: 20),
                            tooltip: 'Editar Información',
                            onPressed: () => _showCreateBusinessModal(context, b),
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent, size: 20),
                            tooltip: 'Eliminar Negocio',
                            onPressed: () {
                              setState(() {
                                _businesses.removeWhere((item) => item.id == b.id);
                              });
                            },
                          ),
                        ],
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

  Widget _buildFilterChip(String label, bool isSelected, VoidCallback onTap) {
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
