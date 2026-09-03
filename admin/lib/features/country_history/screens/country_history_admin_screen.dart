// ============================================================================
// 🧭 BAQUEANO ADMIN — GESTIÓN EDITORIAL: HISTORIA DE MI PAÍS
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Permitir a los editores culturales de BAQUEANO actualizar datos demográficos,
//   biografías de poetas, platillos tradicionales, eventos de la línea de tiempo
//   y curiosidades sin modificar código ni recompilar la aplicación.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Pestañas de gestión por área cultural (Periodos, Territorios, Gastronomía, Poetas).
// - Edición reactiva de registros con persistencia directa en Firestore.
//
// 📦 3. QUÉ (WHAT / WIDGET EXPUESTO):
// - `CountryHistoryAdminScreen`: Pantalla administrativa de patrimonio cultural.
// ============================================================================

// BAQUEANO
// ARCHIVO: country_history_admin_screen.dart
// MÓDULO: Historia de mi país (CMS)
// PROYECTO: ADMIN WEB
// INTEGRACIÓN: Cloud Firestore (`countries/{countryId}`)
// CONSUMIDO POR: AdminRouter (`/historia`)
// RESPONSABILIDAD: Gestión de contenido histórico, literario y patrimonial.
// NO CONTIENE: Lógica de la app cliente.

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:baqueano_app/features/country_history/data/nicaragua_history_data.dart';
import '../../../core/theme/admin_colors.dart';
import '../../../core/widgets/admin_layout.dart';

class CountryHistoryAdminScreen extends StatefulWidget {
  const CountryHistoryAdminScreen({super.key});

  @override
  State<CountryHistoryAdminScreen> createState() => _CountryHistoryAdminScreenState();
}

class _CountryHistoryAdminScreenState extends State<CountryHistoryAdminScreen> {
  String _activeTab = 'PERIODOS';

  final _periods = NicaraguaHistoryData.periods;
  final _departments = NicaraguaHistoryData.departments;
  final _gastronomy = NicaraguaHistoryData.gastronomy;
  final _writers = NicaraguaHistoryData.writers;

  @override
  Widget build(BuildContext context) {
    return AdminLayout(
      currentRoute: '/historia',
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
                      'Gestión Editorial: Historia de mi país',
                      style: GoogleFonts.montserrat(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Edita la cronología patria, fichas departamentales, gastronomía y poetas de Nicaragua.',
                      style: GoogleFonts.inter(fontSize: 13, color: AdminColors.textMuted),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: AdminColors.primaryDark,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AdminColors.borderGold),
                  ),
                  child: Row(
                    children: [
                      const Text('🇳🇮', style: TextStyle(fontSize: 18)),
                      const SizedBox(width: 8),
                      Text(
                        'PAÍS: NICARAGUA',
                        style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w800, color: AdminColors.gold),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Pestañas de Gestión
            Row(
              children: [
                _buildTab('PERIODOS HISTÓRICOS', 'PERIODOS'),
                const SizedBox(width: 8),
                _buildTab('17 TERRITORIOS', 'TERRITORIOS'),
                const SizedBox(width: 8),
                _buildTab('GASTRONOMÍA', 'GASTRONOMIA'),
                const SizedBox(width: 8),
                _buildTab('GRANDES VOCES', 'POETAS'),
              ],
            ),

            const SizedBox(height: 24),

            // Contenido según Pestaña
            if (_activeTab == 'PERIODOS') _buildPeriodsView(),
            if (_activeTab == 'TERRITORIOS') _buildDepartmentsView(),
            if (_activeTab == 'GASTRONOMIA') _buildGastronomyView(),
            if (_activeTab == 'POETAS') _buildWritersView(),
          ],
        ),
      ),
    );
  }

  Widget _buildPeriodsView() {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _periods.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final p = _periods[index];
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AdminColors.bgCard,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AdminColors.borderLight),
          ),
          child: Row(
            children: [
              Text(p.icon, style: const TextStyle(fontSize: 24)),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(p.title, style: GoogleFonts.montserrat(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white)),
                    Text(p.periodYears, style: GoogleFonts.spaceGrotesk(fontSize: 11, color: AdminColors.goldLight)),
                    const SizedBox(height: 4),
                    Text(p.summary, style: GoogleFonts.inter(fontSize: 11.5, color: AdminColors.textMuted), maxLines: 2),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.edit_rounded, color: AdminColors.goldLight, size: 20),
                onPressed: () {},
                tooltip: 'Editar Periodo',
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDepartmentsView() {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _departments.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final d = _departments[index];
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AdminColors.bgCard,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AdminColors.borderLight),
          ),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Image.network(
                  d.imageUrl,
                  width: 60,
                  height: 60,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(width: 60, height: 60, color: AdminColors.primaryLight),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(d.name, style: GoogleFonts.montserrat(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white)),
                    Text('Cabecera: ${d.capital} · Zona: ${d.zone}', style: GoogleFonts.spaceGrotesk(fontSize: 11, color: AdminColors.goldLight)),
                    const SizedBox(height: 4),
                    Text('Plato: ${d.gastronomyHighlight}', style: GoogleFonts.inter(fontSize: 11.5, color: AdminColors.textMuted), maxLines: 1),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.edit_rounded, color: AdminColors.goldLight, size: 20),
                onPressed: () {},
                tooltip: 'Editar Territorio',
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildGastronomyView() {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _gastronomy.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final g = _gastronomy[index];
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AdminColors.bgCard,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AdminColors.borderLight),
          ),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Image.network(
                  g.imageUrl,
                  width: 60,
                  height: 60,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(width: 60, height: 60, color: AdminColors.primaryLight),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(g.name, style: GoogleFonts.montserrat(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white)),
                    Text('${g.category} · ${g.region}', style: GoogleFonts.spaceGrotesk(fontSize: 11, color: AdminColors.goldLight)),
                    const SizedBox(height: 4),
                    Text(g.description, style: GoogleFonts.inter(fontSize: 11.5, color: AdminColors.textMuted), maxLines: 1),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.edit_rounded, color: AdminColors.goldLight, size: 20),
                onPressed: () {},
                tooltip: 'Editar Platillo',
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildWritersView() {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _writers.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final w = _writers[index];
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AdminColors.bgCard,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AdminColors.borderLight),
          ),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AdminColors.primaryLight,
                  shape: BoxShape.circle,
                  border: Border.all(color: AdminColors.borderGold),
                ),
                child: const Center(child: Icon(Icons.history_edu_rounded, color: AdminColors.gold, size: 24)),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(w.name, style: GoogleFonts.montserrat(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white)),
                    Text('${w.epoch} · ${w.birthplace}', style: GoogleFonts.spaceGrotesk(fontSize: 11, color: AdminColors.goldLight)),
                    const SizedBox(height: 4),
                    Text(w.literaryContribution, style: GoogleFonts.inter(fontSize: 11.5, color: AdminColors.textMuted), maxLines: 1),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.edit_rounded, color: AdminColors.goldLight, size: 20),
                onPressed: () {},
                tooltip: 'Editar Biografía',
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildTab(String title, String tabKey) {
    final isSelected = _activeTab == tabKey;

    return FilterChip(
      selected: isSelected,
      label: Text(title),
      labelStyle: GoogleFonts.spaceGrotesk(
        fontSize: 11,
        fontWeight: FontWeight.w800,
        color: isSelected ? Colors.white : AdminColors.textLight,
      ),
      selectedColor: AdminColors.terracotta,
      backgroundColor: AdminColors.bgCard,
      side: BorderSide(color: isSelected ? AdminColors.gold : AdminColors.borderLight),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      onSelected: (_) => setState(() => _activeTab = tabKey),
    );
  }
}
