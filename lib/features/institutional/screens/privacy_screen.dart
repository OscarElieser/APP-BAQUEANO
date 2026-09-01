import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';

class PrivacyScreen extends StatelessWidget {
  const PrivacyScreen({super.key});

  final List<Map<String, String>> privacyArticles = const [
    {
      'num': '01',
      'title': 'Compromiso Ético con la Privacidad',
      'content': 'En BAQUEANO consideramos la privacidad un derecho fundamental. Describimos con total transparencia cómo recolectamos, resguardamos y usamos tu información en la app y asistente de IA.',
    },
    {
      'num': '02',
      'title': 'Información que Recopilamos',
      'content': 'Únicamente datos necesarios: nombre, correo de contacto para reservas, datos de geolocalización opcionales (sólo si autorizas el permiso para centrar rutas) y consultas a Baqueano AI.',
    },
    {
      'num': '03',
      'title': 'Finalidad y Uso de los Datos',
      'content': 'Permitir la gestión de reservas comunitarias, generar presupuestos en tiempo real (USD/NIO) y sincronizar tus favoritos y rutas offline en tu dispositivo.',
    },
    {
      'num': '04',
      'title': 'Almacenamiento Seguro e Infraestructura en la Nube',
      'content': 'Toda la información es procesada mediante Google Cloud Platform (Cloud Firestore y Firebase Auth) con cifrado en tránsito (TLS/SSL) y cifrado en reposo (AES-256).',
    },
    {
      'num': '05',
      'title': 'Modo Offline y Almacenamiento Local',
      'content': 'Utilizamos almacenamiento local en dispositivo para que consultes tus mapas y rutas aún sin conexión celular en montañas o cañones remotos. Cero rastreadores publicitarios invasivos.',
    },
    {
      'num': '06',
      'title': 'Política Estricta de Cero Comercialización de Datos',
      'content': 'Baqueano NO vende ni comercializa bajo ninguna circunstancia datos personales a terceros o agencias publicitarias.',
    },
    {
      'num': '07',
      'title': 'Derechos ARCO (Acceso, Rectificación y Supresión)',
      'content': 'Tienes derecho en todo momento de acceder, rectificar o solicitar la eliminación definitiva de tu cuenta y datos asociados de nuestros servidores.',
    },
    {
      'num': '08',
      'title': 'Contacto y Oficial de Privacidad',
      'content': 'Para ejercer tus derechos de privacidad escribe directamente a: privacidad@baqueano.ni.',
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
              tag: 'PROTECCIÓN DE DATOS',
              title: '🛡️ Políticas de Privacidad & Seguridad Cloud',
              subtitle: 'Cifrado internacional en la nube, cero venta de datos personales y soporte local para el viajero.',
            ),
            const SizedBox(height: 16),

            ...privacyArticles.map((art) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 14.0),
                child: GlassContainer(
                  padding: const EdgeInsets.all(20),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppColors.borderLight),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.craterTeal.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.craterTeal),
                        ),
                        child: Text(
                          art['num']!,
                          style: GoogleFonts.spaceGrotesk(fontSize: 14, fontWeight: FontWeight.w900, color: AppColors.craterTealLight),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              art['title']!,
                              style: GoogleFonts.montserrat(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textLight),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              art['content']!,
                              style: GoogleFonts.inter(fontSize: 13, color: AppColors.textMuted, height: 1.45),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }
}
