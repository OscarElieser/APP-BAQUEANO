// ============================================================================
// 🧭 BAQUEANO ADMIN — GESTIÓN DE USUARIOS & ROLES RBAC
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Implementar control de acceso granular basado en roles (RBAC) para que cada
//   miembro del equipo (super_admin, admin, editor, moderador, gestor de contenido)
//   disponga de los privilegios exactos sobre Firestore y Storage.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Tabla de gestión de usuarios con asignación dinámica de roles.
// - Matriz visual de permisos: crear, editar, eliminar, publicar, auditar.
//
// 📦 3. QUÉ (WHAT / WIDGET EXPUESTO):
// - `UsersRolesScreen`: Pantalla administrativa de identidad y seguridad.
// ============================================================================

// BAQUEANO
// ARCHIVO: users_roles_screen.dart
// MÓDULO: Usuarios & Seguridad RBAC
// PROYECTO: ADMIN WEB
// INTEGRACIÓN: Firebase Authentication & Cloud Firestore (`users`)
// CONSUMIDO POR: AdminRouter (`/usuarios`)
// RESPONSABILIDAD: Control de roles, permisos y usuarios administrativos.
// NO CONTIENE: Lógica de la app cliente.

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/admin_colors.dart';
import '../../../core/widgets/admin_layout.dart';

class UsersRolesScreen extends StatefulWidget {
  const UsersRolesScreen({super.key});

  @override
  State<UsersRolesScreen> createState() => _UsersRolesScreenState();
}

class _UsersRolesScreenState extends State<UsersRolesScreen> {
  final List<Map<String, dynamic>> _users = [
    {
      'name': 'Oscar Elieser',
      'email': 'oscar@baqueano.app',
      'role': 'super_admin',
      'permissions': ['Total', 'Publicar', 'Eliminar', 'Gestionar Roles', 'Auditoría'],
      'lastActive': 'Ahora mismo',
    },
    {
      'name': 'Carlos Mendoza',
      'email': 'carlos@baqueano.app',
      'role': 'admin',
      'permissions': ['Crear', 'Editar', 'Publicar', 'Ver Auditoría'],
      'lastActive': 'Hace 2 horas',
    },
    {
      'name': 'Elena Rivas',
      'email': 'elena_cultura@baqueano.app',
      'role': 'content_manager',
      'permissions': ['Crear', 'Editar Contenido', 'Subir Multimedia'],
      'lastActive': 'Hace 1 día',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return AdminLayout(
      currentRoute: '/usuarios',
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
                      'Usuarios & Roles de Administración (RBAC)',
                      style: GoogleFonts.montserrat(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Asigna roles y permisos específicos para controlar quién puede editar y publicar contenido.',
                      style: GoogleFonts.inter(fontSize: 13, color: AdminColors.textMuted),
                    ),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.person_add_rounded, size: 18),
                  label: const Text('Invitar Usuario'),
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

            // Tabla de Usuarios y Permisos
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AdminColors.bgCard,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AdminColors.borderLight),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Usuarios Administrativos con Acceso a Cloud Firestore',
                    style: GoogleFonts.montserrat(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white),
                  ),
                  const SizedBox(height: 16),
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _users.length,
                    separatorBuilder: (_, __) => const Divider(color: AdminColors.borderLight, height: 24),
                    itemBuilder: (context, index) {
                      final u = _users[index];
                      final isSuper = u['role'] == 'super_admin';

                      return Row(
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: isSuper ? AdminColors.terracotta : AdminColors.primaryLight,
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Text(
                                (u['name'] as String).substring(0, 1),
                                style: GoogleFonts.montserrat(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white),
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text(
                                      u['name'] as String,
                                      style: GoogleFonts.montserrat(fontSize: 14.5, fontWeight: FontWeight.w800, color: Colors.white),
                                    ),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: AdminColors.gold.withValues(alpha: 0.15),
                                        borderRadius: BorderRadius.circular(6),
                                        border: Border.all(color: AdminColors.goldLight),
                                      ),
                                      child: Text(
                                        (u['role'] as String).toUpperCase(),
                                        style: GoogleFonts.spaceGrotesk(fontSize: 9.5, fontWeight: FontWeight.w800, color: AdminColors.gold),
                                      ),
                                    ),
                                  ],
                                ),
                                Text(
                                  '${u['email']} · Última actividad: ${u['lastActive']}',
                                  style: GoogleFonts.inter(fontSize: 11.5, color: AdminColors.textMuted),
                                ),
                                const SizedBox(height: 6),
                                Wrap(
                                  spacing: 6,
                                  children: (u['permissions'] as List<String>).map((perm) {
                                    return Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: AdminColors.primaryDark,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        '✓ $perm',
                                        style: GoogleFonts.spaceGrotesk(fontSize: 10, color: AdminColors.goldLight),
                                      ),
                                    );
                                  }).toList(),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.shield_rounded, color: AdminColors.goldLight, size: 20),
                            onPressed: () {},
                            tooltip: 'Modificar Permisos',
                          ),
                        ],
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
