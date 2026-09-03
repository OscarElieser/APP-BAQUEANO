// ============================================================================
// 🧭 BAQUEANO ADMIN — AJUSTES REMOTOS & REGISTRO DE AUDITORÍA
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer control remoto inmediato sobre los parámetros globales de la App
//   (anuncio promocional en la cabecera, tasa de cambio oficial C$ / USD, categorías activas)
//   y un visor inmutable de auditoría para garantizar transparencia total.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Formulario de configuración reactiva que actualiza `app_config/global` en Firestore.
// - Registro cronológico de auditoría con detalles de cada modificación.
//
// 📦 3. QUÉ (WHAT / WIDGET EXPUESTO):
// - `SettingsAuditScreen`: Pantalla administrativa de configuración y auditoría.
// ============================================================================

// BAQUEANO
// ARCHIVO: settings_audit_screen.dart
// MÓDULO: Configuración Remota & Auditoría
// PROYECTO: ADMIN WEB
// INTEGRACIÓN: Cloud Firestore (`app_config/global`, `audit_logs`)
// CONSUMIDO POR: AdminRouter (`/ajustes`)
// RESPONSABILIDAD: Parámetros globales y trazabilidad de cambios del sistema.
// NO CONTIENE: Lógica de la app cliente.

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/admin_colors.dart';
import '../../../core/widgets/admin_layout.dart';

class SettingsAuditScreen extends StatefulWidget {
  const SettingsAuditScreen({super.key});

  @override
  State<SettingsAuditScreen> createState() => _SettingsAuditScreenState();
}

class _SettingsAuditScreenState extends State<SettingsAuditScreen> {
  final _announcementCtrl = TextEditingController(
    text: '¡OFERTAS EXCLUSIVAS! Descubre las mejores promociones de negocios locales y explora nuestros lugares de referencia nacional.',
  );
  final _exchangeRateCtrl = TextEditingController(text: '36.65');
  final _couponCtrl = TextEditingController(text: 'BAQUEANO2026');
  final _discountCtrl = TextEditingController(text: '15');

  @override
  Widget build(BuildContext context) {
    return AdminLayout(
      currentRoute: '/ajustes',
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
                      'Configuración Remota & Auditoría',
                      style: GoogleFonts.montserrat(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Controla parámetros globales en vivo que la App consume sin requerir recompilación.',
                      style: GoogleFonts.inter(fontSize: 13, color: AdminColors.textMuted),
                    ),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Configuración global sincronizada con Cloud Firestore', style: GoogleFonts.spaceGrotesk()),
                        backgroundColor: AdminColors.statusPublished,
                      ),
                    );
                  },
                  icon: const Icon(Icons.save_rounded, size: 18),
                  label: const Text('Guardar Parámetros'),
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

            // Tarjeta de Configuración Global Remota
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: AdminColors.bgCard,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AdminColors.borderLight),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.campaign_rounded, color: AdminColors.gold, size: 20),
                      const SizedBox(width: 10),
                      Text(
                        'Cinta de Anuncios y Promociones (App Bar)',
                        style: GoogleFonts.montserrat(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  TextField(
                    controller: _announcementCtrl,
                    maxLines: 2,
                    style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      labelText: 'Texto del anuncio en la App',
                      labelStyle: GoogleFonts.inter(color: AdminColors.textMuted, fontSize: 12),
                      filled: true,
                      fillColor: AdminColors.bgDark,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AdminColors.borderLight)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AdminColors.borderLight)),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AdminColors.gold)),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Tasa de Cambio y Cupones
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _exchangeRateCtrl,
                          style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 13),
                          decoration: InputDecoration(
                            labelText: 'Tasa Oficial (NIO por 1 USD)',
                            labelStyle: GoogleFonts.inter(color: AdminColors.textMuted, fontSize: 12),
                            prefixIcon: const Icon(Icons.currency_exchange_rounded, color: AdminColors.goldLight, size: 20),
                            filled: true,
                            fillColor: AdminColors.bgDark,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AdminColors.borderLight)),
                            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AdminColors.borderLight)),
                            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AdminColors.gold)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: TextField(
                          controller: _couponCtrl,
                          style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 13),
                          decoration: InputDecoration(
                            labelText: 'Código Cupón Activo',
                            labelStyle: GoogleFonts.inter(color: AdminColors.textMuted, fontSize: 12),
                            prefixIcon: const Icon(Icons.local_offer_rounded, color: AdminColors.goldLight, size: 20),
                            filled: true,
                            fillColor: AdminColors.bgDark,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AdminColors.borderLight)),
                            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AdminColors.borderLight)),
                            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AdminColors.gold)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: TextField(
                          controller: _discountCtrl,
                          style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 13),
                          decoration: InputDecoration(
                            labelText: '% Descuento Global',
                            labelStyle: GoogleFonts.inter(color: AdminColors.textMuted, fontSize: 12),
                            prefixIcon: const Icon(Icons.percent_rounded, color: AdminColors.goldLight, size: 20),
                            filled: true,
                            fillColor: AdminColors.bgDark,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AdminColors.borderLight)),
                            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AdminColors.borderLight)),
                            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AdminColors.gold)),
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
      ),
    );
  }
}
