import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/badge_chip.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';
import '../../home/widgets/destination_card.dart';

class DiscoverScreen extends StatefulWidget {
  const DiscoverScreen({super.key});

  @override
  State<DiscoverScreen> createState() => _DiscoverScreenState();
}

class _DiscoverScreenState extends State<DiscoverScreen> {
  String _searchQuery = '';
  String _selectedCategory = 'Todos';
  String _selectedDepartment = 'Todos';

  final List<String> _categories = [
    'Todos',
    'volcanes',
    'cascadas',
    'playas',
    'lodges',
    'colonial',
  ];

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    final filtered = CatalogData.destinations.where((d) {
      final matchesSearch = _searchQuery.isEmpty ||
          d.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          d.department.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          d.tags.any((t) => t.toLowerCase().contains(_searchQuery.toLowerCase()));

      final matchesCategory = _selectedCategory == 'Todos' || d.category.toLowerCase() == _selectedCategory.toLowerCase();
      final matchesDepartment = _selectedDepartment == 'Todos' || d.department.toLowerCase() == _selectedDepartment.toLowerCase();

      return matchesSearch && matchesCategory && matchesDepartment;
    }).toList();

    return ResponsiveScaffold(
      currentIndex: 1,
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.symmetric(
          horizontal: isDesktop ? 48.0 : 20.0,
          vertical: 24.0,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SectionHeader(
              tag: 'CATÁLOGO NACIONAL',
              title: '🧭 Descubrir Experiencias & Senderos',
              subtitle: 'Explora Nicaragua sin intermediarios. Filtra por categoría, departamento o busca senderos específicos.',
            ),
            const SizedBox(height: 16),

            // Search Bar
            TextField(
              onChanged: (val) => setState(() => _searchQuery = val),
              style: GoogleFonts.spaceGrotesk(color: AppColors.textLight),
              decoration: InputDecoration(
                hintText: 'Buscar por destino, volcán, cascada o departamento...',
                hintStyle: GoogleFonts.inter(color: AppColors.textMuted, fontSize: 13),
                prefixIcon: const Icon(Icons.search, color: AppColors.gold),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, color: AppColors.textMuted),
                        onPressed: () => setState(() => _searchQuery = ''),
                      )
                    : null,
                filled: true,
                fillColor: AppColors.bgCard,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.borderLight)),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.borderLight)),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.gold)),
              ),
            ),

            const SizedBox(height: 16),

            // Category Chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: _categories.map((cat) {
                  final isSelected = _selectedCategory == cat;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: BadgeChip(
                      label: cat == 'Todos' ? 'Todas las Categorías' : cat.toUpperCase(),
                      isSelected: isSelected,
                      onTap: () => setState(() => _selectedCategory = cat),
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 12),

            // Department Chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: CatalogData.departments.map((dept) {
                  final isSelected = _selectedDepartment == dept;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: BadgeChip(
                      label: dept,
                      color: AppColors.primary,
                      isSelected: isSelected,
                      onTap: () => setState(() => _selectedDepartment = dept),
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 24),

            // Results count
            Text(
              '${filtered.length} experiencia(s) encontrada(s)',
              style: GoogleFonts.spaceGrotesk(fontSize: 13, color: AppColors.goldLight, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 16),

            // Grid
            if (filtered.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(40),
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.search_off, size: 48, color: AppColors.textMuted),
                    const SizedBox(height: 12),
                    Text(
                      'No encontramos resultados para tu búsqueda.',
                      style: GoogleFonts.montserrat(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textLight),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Intenta ajustar los filtros de categoría o departamento.',
                      style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted),
                    ),
                  ],
                ),
              )
            else
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
                  maxCrossAxisExtent: isDesktop ? 380 : 500,
                  mainAxisExtent: 470,
                  crossAxisSpacing: 18,
                  mainAxisSpacing: 18,
                ),
                itemCount: filtered.length,
                itemBuilder: (context, index) {
                  return DestinationCard(destination: filtered[index]);
                },
              ),

            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }
}
