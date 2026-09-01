import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/baqueano_button.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';
import '../../../core/widgets/custom_toast.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  final List<Map<String, dynamic>> _pendingApprovals = [
    {
      'name': 'Hospedaje Familiar Volcán Telica',
      'owner': 'Don Juan Talavera',
      'dept': 'León',
      'status': 'Pendiente Verificación INTUR',
      'fee': '\$25 USD / noche',
    },
    {
      'name': 'Guías Nativos Río Coco Abajo',
      'owner': 'Cooperativa Wiwilí',
      'dept': 'Nueva Segovia',
      'status': 'Documentación en Revisión',
      'fee': '\$40 USD / ruta',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 950;

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
              tag: 'PANEL DE CONTROL & GESTIÓN',
              title: '🔐 Panel de Administración CMS & Respaldos',
              subtitle: 'Control de calidad, validación de guías comunitarios, edición de catálogo y sincronización con Firebase Cloud.',
            ),
            const SizedBox(height: 16),

            // Stat cards
            Row(
              children: [
                Expanded(child: _buildAdminStatCard('DESTINOS ACTIVOS', '${CatalogData.destinations.length}', AppColors.terracotta, Icons.place)),
                const SizedBox(width: 12),
                Expanded(child: _buildAdminStatCard('NEGOCIOS VERIFICADOS', '${CatalogData.localBusinesses.length}', AppColors.jungleGreenLight, Icons.verified)),
                const SizedBox(width: 12),
                Expanded(child: _buildAdminStatCard('SOLICITUDES PENDIENTES', '${_pendingApprovals.length}', AppColors.warning, Icons.pending_actions)),
              ],
            ),

            const SizedBox(height: 28),

            // Action Toolbar
            Wrap(
              spacing: 12,
              runSpacing: 10,
              children: [
                BaqueanoButton(
                  text: 'Nuevo Destino',
                  icon: const Icon(Icons.add_location_alt, size: 16),
                  variant: BaqueanoButtonVariant.primary,
                  onPressed: () {
                    CustomToast.show(context, message: 'Formulario de nuevo destino abierto.');
                  },
                ),
                BaqueanoButton(
                  text: 'Generar Respaldo JSON',
                  icon: const Icon(Icons.cloud_download_outlined, size: 16),
                  variant: BaqueanoButtonVariant.secondary,
                  onPressed: () {
                    CustomToast.success(context, 'Base de datos exportada y respaldada en Google Cloud.');
                  },
                ),
                BaqueanoButton(
                  text: 'Sincronizar Firebase',
                  icon: const Icon(Icons.sync, size: 16),
                  variant: BaqueanoButtonVariant.outline,
                  onPressed: () {
                    CustomToast.success(context, 'Catálogo sincronizado exitosamente con Cloud Firestore.');
                  },
                ),
              ],
            ),

            const SizedBox(height: 32),

            // Pending Approvals List
            Text(
              'SOLICITUDES DE AFILIACIÓN COMUNITARIA',
              style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.gold, letterSpacing: 1.0),
            ),
            const SizedBox(height: 12),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _pendingApprovals.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final item = _pendingApprovals[index];
                return GlassContainer(
                  padding: const EdgeInsets.all(16),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderLight),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item['name'] as String,
                            style: GoogleFonts.montserrat(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.textLight),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Titular: ${item['owner']} · ${item['dept']} · ${item['fee']}',
                            style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            item['status'] as String,
                            style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.warning),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.check_circle, color: AppColors.success, size: 28),
                            onPressed: () {
                              setState(() => _pendingApprovals.removeAt(index));
                              CustomToast.success(context, 'Emprendimiento aprobado y publicado.');
                            },
                          ),
                          IconButton(
                            icon: const Icon(Icons.cancel, color: AppColors.error, size: 28),
                            onPressed: () {
                              setState(() => _pendingApprovals.removeAt(index));
                              CustomToast.error(context, 'Solicitud rechazada.');
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),

            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildAdminStatCard(String label, String value, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: color.withOpacity(0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: GoogleFonts.spaceGrotesk(fontSize: 9, fontWeight: FontWeight.w800, color: AppColors.textMuted)),
              Icon(icon, color: color, size: 18),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: GoogleFonts.montserrat(fontSize: 22, fontWeight: FontWeight.w900, color: color),
          ),
        ],
      ),
    );
  }
}
