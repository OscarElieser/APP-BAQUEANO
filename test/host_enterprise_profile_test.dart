// ============================================================================
// 🧭 BAQUEANO — PRUEBAS DEL CONTACTO DEL ANFITRIÓN EN EL CHECKOUT
// ============================================================================
//
// 🎯 POR QUÉ: auditoría 2026-10-06. Los perfiles de anfitrión del checkout
//   traían teléfonos sin fuente: tres no figuran en ninguna fuente, uno es un
//   relleno y otro es la línea oficial de BAQUEANO atribuida a un guía. La App
//   no debe llamar ni escribir a un número no verificado.
// ⚙️ CÓMO: prueba los getters de `HostEnterpriseProfile`, sin red ni UI.
// 📦 QUÉ: un perfil no verificado usa la línea oficial y marca "por verificar";
//   uno verificado usa sus propios datos.
// ============================================================================

import 'package:baqueano_app/features/checkout/widgets/checkout_modal.dart';
import 'package:flutter_test/flutter_test.dart';

HostEnterpriseProfile _profile({bool verified = false}) => HostEnterpriseProfile(
      businessName: 'Negocio de prueba',
      legalOwner: 'Persona de prueba',
      rucNumber: '-',
      inturLicense: '-',
      address: '-',
      phone: '+505 0000-0000',
      email: 'prueba@example.org',
      taxStatus: '-',
      verified: verified,
    );

void main() {
  test('perfil no verificado: contacto por la línea oficial de BAQUEANO', () {
    final p = _profile();
    expect(p.verified, isFalse);
    expect(p.contactPhone, HostEnterpriseProfile.officialPhone);
    expect(p.contactEmail, HostEnterpriseProfile.officialEmail);
    expect(p.contactName, HostEnterpriseProfile.officialTeam);
    expect(p.ownerLabel, 'Persona de prueba (por verificar)');
    // El dato original se conserva para que el equipo lo confirme.
    expect(p.phone, '+505 0000-0000');
  });

  test('perfil verificado: usa sus propios datos', () {
    final p = _profile(verified: true);
    expect(p.contactPhone, '+505 0000-0000');
    expect(p.contactEmail, 'prueba@example.org');
    expect(p.contactName, 'Persona de prueba');
    expect(p.ownerLabel, 'Persona de prueba');
  });
}
