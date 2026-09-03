import 'package:flutter/material.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';
import '../../home/widgets/destination_card.dart';

class TourismScreen extends StatelessWidget {
  const TourismScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

    final circuits = CatalogData.destinations.where((d) => d.category == 'volcanes' || d.category == 'colonial').toList();

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
              tag: 'CIRCUITOS ICÓNICOS',
              title: '📍 Turismo, Volcanes & Joyas Coloniales',
              subtitle: 'Cumbres activas de la Cordillera de los Maribios, ciudades coloniales de barroco español y santuarios de biodiversidad.',
            ),
            const SizedBox(height: 20),

            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
                maxCrossAxisExtent: isDesktop ? 380 : 500,
                mainAxisExtent: 470,
                crossAxisSpacing: 18,
                mainAxisSpacing: 18,
              ),
              itemCount: circuits.length,
              itemBuilder: (context, index) {
                final dest = circuits[index];
                return DestinationCard(
                  key: ValueKey('tourism-dest-${dest.id}'),
                  destination: dest,
                );
              },
            ),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }
}
