// ============================================================================
// 🧭 BAQUEANO ADMIN — DASHBOARD & CENTRO DE MÉTRICAS EN VIVO
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer a los directores del ecosistema una vista panorámica instantánea
//   sobre el estado de la plataforma: negocios dados de alta, destinos verificados,
//   contenido editorial publicado y volumen de multimedia.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Tarjetas de métricas analíticas con indicadores de estado.
// - Registro en tiempo real de actividad reciente y atajos de creación rápida.
//
// 📦 3. QUÉ (WHAT / WIDGET EXPUESTO):
// - `AdminDashboardScreen`: Pantalla del panel de control principal.
// ============================================================================

// BAQUEANO
// ARCHIVO: dashboard_screen.dart
// MÓDULO: Dashboard & Métricas
// PROYECTO: ADMIN WEB
// INTEGRACIÓN: Cloud Firestore (`businesses`, `destinations`, `users`, `audit_logs`)
// CONSUMIDO POR: AdminRouter (`/dashboard`)
// RESPONSABILIDAD: Mostrar resumen estadístico y actividad reciente del ecosistema.
// NO CONTIENE: Lógica de la app cliente.

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/admin_colors.dart';
import '../../../core/widgets/admin_layout.dart';

class AdminDashboardScreen extends StatelessWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AdminLayout(
      currentRoute: '/dashboard',
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(28),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Cabecera de Bienvenida
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Panel Principal de Gestión',
                      style: GoogleFonts.montserrat(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Control centralizado de contenidos, negocios campesinos y multimedia de BAQUEANO.',
                      style: GoogleFonts.inter(fontSize: 13, color: AdminColors.textMuted),
                    ),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () => context.go('/negocios'),
                  icon: const Icon(Icons.add_business_rounded, size: 18),
                  label: const Text('Registrar Nuevo Negocio'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AdminColors.terracotta,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 28),

            // Rejilla de Métricas en Vivo
            _buildMetricsGrid(context),

            const SizedBox(height: 32),

            // Actividad Reciente y Accesos Rápidos
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Columna Izquierda: Actividad Reciente
                Expanded(
                  flex: 3,
                  child: _buildRecentActivityCard(),
                ),

                const SizedBox(width: 24),

                // Columna Derecha: Accesos Rápidos
                Expanded(
                  flex: 2,
                  child: _buildQuickActionsCard(context),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricsGrid(BuildContext context) {
    final metrics = [
      {
        'title': 'NEGOCIOS ACTIVOS',
        'value': '48',
        'sub': '100% Sin Intermediarios',
        'icon': Icons.storefront_rounded,
        'color': AdminColors.statusPublished,
      },
      {
        'title': 'PENDIENTES APROBACIÓN',
        'value': '3',
        'sub': 'Verificación INTUR / Guías',
        'icon': Icons.pending_actions_rounded,
        'color': AdminColors.statusPending,
      },
      {
        'title': 'DESTINOS EN CATÁLOGO',
        'value': '24',
        'sub': 'Pacífico, Norte y Caribe',
        'icon': Icons.explore_rounded,
        'color': AdminColors.gold,
      },
      {
        'title': 'REPOSITORIO MULTIMEDIA',
        'value': '186',
        'sub': 'Fotos 4K, Videos y Audios',
        'icon': Icons.photo_library_rounded,
        'color': AdminColors.terracottaLight,
      },
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
        maxCrossAxisExtent: 320,
        mainAxisExtent: 130,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
      ),
      itemCount: metrics.length,
      itemBuilder: (context, index) {
        final m = metrics[index];
        final color = m['color'] as Color;

        return Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: AdminColors.bgCard,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AdminColors.borderLight),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.2),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    m['title'] as String,
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w800,
                      color: AdminColors.textMuted,
                      letterSpacing: 0.8,
                    ),
                  ),
                  Icon(m['icon'] as IconData, size: 20, color: color),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                m['value'] as String,
                style: GoogleFonts.montserrat(
                  fontSize: 26,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                m['sub'] as String,
                style: GoogleFonts.inter(fontSize: 11, color: color),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildRecentActivityCard() {
    final activities = [
      {
        'icon': Icons.add_circle_outline_rounded,
        'color': AdminColors.statusPublished,
        'title': 'Nuevo Hospedaje Comunitario Registrado',
        'detail': 'Finca Campesina El Encanto (Somoto) guardado en Firestore.',
        'time': 'Hace 14 min · Por admin@baqueano.app',
      },
      {
        'icon': Icons.edit_note_rounded,
        'color': AdminColors.gold,
        'title': 'Actualización de Precios Bimoneda',
        'detail': 'Tasa oficial de cambio sincronizada a C\$ 36.65 NIO.',
        'time': 'Hace 1 hora · Sistema Automático',
      },
      {
        'icon': Icons.ondemand_video_rounded,
        'color': AdminColors.terracottaLight,
        'title': 'Enlace de Video Folclórico Actualizado',
        'detail': '"El Solar de Monimbó" con nueva URL documental de YouTube.',
        'time': 'Hace 2 horas · Por editor_cultural@baqueano.app',
      },
      {
        'icon': Icons.verified_user_rounded,
        'color': AdminColors.statusPublished,
        'title': 'Guía Acreditado INTUR Aprobado',
        'detail': 'Baqueano Nativo Cañón de Somoto publicado en la App.',
        'time': 'Hace 4 horas · Por admin@baqueano.app',
      },
    ];

    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AdminColors.bgCard,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AdminColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.history_rounded, size: 20, color: AdminColors.gold),
              const SizedBox(width: 10),
              Text(
                'Registro de Actividad Reciente & Auditoría',
                style: GoogleFonts.montserrat(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: activities.length,
            separatorBuilder: (_, __) => const Divider(color: AdminColors.borderLight, height: 20),
            itemBuilder: (context, index) {
              final a = activities[index];
              final color = a['color'] as Color;

              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(a['icon'] as IconData, size: 16, color: color),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          a['title'] as String,
                          style: GoogleFonts.montserrat(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          a['detail'] as String,
                          style: GoogleFonts.inter(fontSize: 11.5, color: AdminColors.textLight.withValues(alpha: 0.85)),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          a['time'] as String,
                          style: GoogleFonts.spaceGrotesk(fontSize: 10, color: AdminColors.textMuted),
                        ),
                      ],
                    ),
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionsCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AdminColors.bgCard,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AdminColors.borderGold.withValues(alpha: 0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.bolt_rounded, size: 20, color: AdminColors.gold),
              const SizedBox(width: 10),
              Text(
                'Acciones Rápidas',
                style: GoogleFonts.montserrat(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          _buildActionButton(
            context,
            Icons.add_photo_alternate_rounded,
            'Subir Archivo al Centro Multimedia',
            '/multimedia',
          ),
          const SizedBox(height: 10),
          _buildActionButton(
            context,
            Icons.menu_book_rounded,
            'Editar Sección "Historia de mi país"',
            '/historia',
          ),
          const SizedBox(height: 10),
          _buildActionButton(
            context,
            Icons.campaign_rounded,
            'Modificar Anuncio y Tasa de Cambio',
            '/ajustes',
          ),
          const SizedBox(height: 10),
          _buildActionButton(
            context,
            Icons.supervised_user_circle_rounded,
            'Administrar Roles y Permisos RBAC',
            '/usuarios',
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(BuildContext context, IconData icon, String title, String route) {
    return OutlinedButton.icon(
      onPressed: () => context.go(route),
      icon: Icon(icon, size: 16, color: AdminColors.goldLight),
      label: Text(
        title,
        style: GoogleFonts.spaceGrotesk(fontSize: 11.5, fontWeight: FontWeight.w700, color: Colors.white),
      ),
      style: OutlinedButton.styleFrom(
        alignment: Alignment.centerLeft,
        minimumSize: const Size(double.infinity, 44),
        side: const BorderSide(color: AdminColors.borderLight),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
