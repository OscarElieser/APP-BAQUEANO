// ============================================================================
// 👤 PERFIL DE EXPLORADOR & PANEL DE IDENTIDAD (PROFILE_SCREEN.DART)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer al usuario una vista integral de su progreso como explorador de
//   Nicaragua, gestión de su régimen tributario (turista vs residente),
//   métricas de aventura y acceso centralizado a soporte y configuración.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Interfaz modular con estética Glassmorphism, tarjetas de estadísticas
//   en rejilla, selector reactivo de estatus fiscal y redirecciones fluidas
//   con GoRouter.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & WIDGETS EXPUESTOS):
// - `ProfileScreen`: Pantalla de perfil de usuario y configuración del explorador.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isTouristTaxExempt = true;
  String _selectedCurrency = 'USD';
  final String _userName = 'Oscar Elieser';
  final String _userEmail = 'oscarelieser.baqueano@gmail.com';
  final String _explorerRank = 'Guardián de Volcanes';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF082B35),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        title: const Text(
          'Perfil de Explorador',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w800,
            fontSize: 18,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.emergency_rounded,
                color: Color(0xFFE11D48)),
            tooltip: 'Centro SOS',
            onPressed: () => context.push('/sos'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          children: [
            // Tarjeta Principal de Identidad
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF082B35), Color(0xFF1E293B)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: const Color(0xFFD4AF37).withValues(alpha: 0.35),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.35),
                    blurRadius: 18,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Stack(
                    alignment: Alignment.bottomRight,
                    children: [
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: const Color(0xFFD4AF37),
                            width: 2.5,
                          ),
                          gradient: const LinearGradient(
                            colors: [Color(0xFFC86432), Color(0xFFD4AF37)],
                          ),
                        ),
                        child: const Icon(
                          Icons.person_rounded,
                          color: Colors.white,
                          size: 48,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: Color(0xFF082B35),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.verified_rounded,
                          color: Color(0xFF38BDF8),
                          size: 20,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    _userName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 19,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _userEmail,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.6),
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFC86432).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: const Color(0xFFC86432),
                        width: 1,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.military_tech_rounded,
                            color: Color(0xFFD4AF37), size: 18),
                        const SizedBox(width: 6),
                        Text(
                          _explorerRank.toUpperCase(),
                          style: const TextStyle(
                            color: Color(0xFFD4AF37),
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Métricas y Estadísticas del Explorador
            Row(
              children: [
                _buildStatCard(
                  icon: Icons.map_rounded,
                  title: '142 km',
                  label: 'Rutas Recorridas',
                  color: const Color(0xFF38BDF8),
                ),
                const SizedBox(width: 12),
                _buildStatCard(
                  icon: Icons.military_tech_rounded,
                  title: '12 / 17',
                  label: 'Sellos de Departamentos',
                  color: const Color(0xFFD4AF37),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _buildStatCard(
                  icon: Icons.confirmation_number_rounded,
                  title: '4 Canjeados',
                  label: 'Vouchers QR',
                  color: const Color(0xFFC86432),
                ),
                const SizedBox(width: 12),
                _buildStatCard(
                  icon: Icons.eco_rounded,
                  title: 'Nivel 4',
                  label: 'Impacto Comunitario',
                  color: const Color(0xFF10B981),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Configuración Fiscal & Moneda
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: Colors.white.withValues(alpha: 0.1),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Régimen Fiscal & Preferencias',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Switch de IVA Turista vs Residente
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Turista Extranjero (0% IVA)',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                                fontSize: 13,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              _isTouristTaxExempt
                                  ? 'Exoneración legal activa (0% IVA INTUR)'
                                  : 'Régimen residente nacional (15% IVA)',
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.5),
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Switch(
                        value: _isTouristTaxExempt,
                        activeColor: const Color(0xFFD4AF37),
                        activeTrackColor:
                            const Color(0xFFD4AF37).withValues(alpha: 0.3),
                        onChanged: (val) {
                          setState(() => _isTouristTaxExempt = val);
                        },
                      ),
                    ],
                  ),

                  const Divider(color: Colors.white12, height: 20),

                  // Selector de Moneda de Visualización
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Moneda Predeterminada',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                            ),
                          ),
                          Text(
                            'Tipo de cambio fijo: C\$36.65 / USD',
                            style: TextStyle(
                              color: Colors.white54,
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                      SegmentedButton<String>(
                        segments: const [
                          ButtonSegment(
                            value: 'USD',
                            label: Text('USD', style: TextStyle(fontSize: 11)),
                          ),
                          ButtonSegment(
                            value: 'NIO',
                            label: Text('NIO', style: TextStyle(fontSize: 11)),
                          ),
                        ],
                        selected: {_selectedCurrency},
                        onSelectionChanged: (set) {
                          setState(() => _selectedCurrency = set.first);
                        },
                        style: ButtonStyle(
                          backgroundColor:
                              WidgetStateProperty.resolveWith<Color>((states) {
                            if (states.contains(WidgetState.selected)) {
                              return const Color(0xFFC86432);
                            }
                            return const Color(0xFF0F172A);
                          }),
                          foregroundColor:
                              WidgetStateProperty.all(Colors.white),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Enlaces Rápidos y Soporte
            _buildActionTile(
              icon: Icons.confirmation_number_rounded,
              title: 'Mi Pasaporte & Vouchers QR',
              onTap: () => context.push('/pasaporte'),
            ),
            _buildActionTile(
              icon: Icons.travel_explore_rounded,
              title: 'Búsqueda Universal de Destinos',
              onTap: () => context.push('/busqueda'),
            ),
            _buildActionTile(
              icon: Icons.smart_toy_rounded,
              title: 'Asistente Baqueano AI',
              onTap: () => context.push('/ai'),
            ),
            _buildActionTile(
              icon: Icons.contact_support_rounded,
              title: 'Centro de Ayuda & Guías',
              onTap: () => context.push('/ayuda'),
            ),
            _buildActionTile(
              icon: Icons.verified_user_rounded,
              title: 'Privacidad y Términos Legales',
              onTap: () => context.push('/privacidad'),
            ),

            const SizedBox(height: 36),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String title,
    required String label,
    required Color color,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: color.withValues(alpha: 0.25),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 8),
            Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.55),
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionTile({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.06),
        ),
      ),
      child: ListTile(
        leading: Icon(icon, color: const Color(0xFFD4AF37), size: 22),
        title: Text(
          title,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
        ),
        trailing: const Icon(
          Icons.arrow_forward_ios_rounded,
          color: Colors.white38,
          size: 14,
        ),
        onTap: onTap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
    );
  }
}
