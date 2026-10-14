// ============================================================================
// 📞 BAQUEANO — PRUEBAS DEL CONTACTO DIRECTO CON EL PROPIETARIO
// ============================================================================
// 🎯 POR QUÉ: regla del propietario (2026-10-14): sin reservas, contacto directo
//   con el local o propietario; el Ops Center debe ver los contactos de Android.
// ⚙️ CÓMO: prueba los ayudantes de `OwnerContactSheet`, el cuerpo de la RPC de
//   `ContactActionService`, el interruptor de reservas, las claves en los 8
//   idiomas y la hoja en pantallas de teléfono y tablet.
// 📦 QUÉ: números de WhatsApp/llamada, plataforma android, canales visibles y
//   ausencia de «Reservar» en la hoja.
// ============================================================================

import 'dart:io';

import 'package:baqueano_app/config/feature_flags.dart';
import 'package:baqueano_app/core/i18n/app_i18n.dart';
import 'package:baqueano_app/data/repositories/catalog_repository.dart';
import 'package:baqueano_app/features/checkout/widgets/owner_contact_sheet.dart';
import 'package:baqueano_app/services/contact_action_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

const _business = CatalogBusiness(
  id: 'biz-ometepe-1',
  name: 'Finca Magdalena',
  department: 'Rivas',
  municipality: 'Altagracia',
  whatsapp: '8888-1234',
  phone: '+505 2222 3333',
  verified: true,
);

Future<void> _pumpSheet(WidgetTester tester, Size size, {CatalogBusiness? business = _business}) async {
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);
  await tester.pumpWidget(
    ProviderScope(
      child: MaterialApp(
        home: Scaffold(
          backgroundColor: const Color(0xFF082B35),
          body: OwnerContactSheet(business: business, destinationName: 'Ometepe', department: 'Rivas'),
        ),
      ),
    ),
  );
  await tester.pump(const Duration(milliseconds: 300));
}

void main() {
  test('las reservas quedan apagadas por la regla del propietario', () {
    expect(kReservationRequestsEnabled, isFalse);
  });

  test('números de WhatsApp y llamada se normalizan sin inventar dígitos', () {
    expect(OwnerContactSheet.whatsappDigits('8888-1234'), '50588881234');
    expect(OwnerContactSheet.whatsappDigits('+505 8888 1234'), '50588881234');
    expect(OwnerContactSheet.whatsappDigits(null), '');
    expect(OwnerContactSheet.dialable('+505 2222-3333'), '+50522223333');
    expect(OwnerContactSheet.hasChannel(_business), isTrue);
    expect(OwnerContactSheet.hasChannel(const CatalogBusiness(id: 'x', name: 'Sin canal')), isFalse);
  });

  test('el registro de contacto va a commercial_actions como android, sin datos personales', () {
    final body = ContactActionService.instance.buildBody(ContactChannel.whatsapp, 'biz-ometepe-1');
    expect(body['p_action_type'], 'whatsapp');
    expect(body['p_platform'], 'android');
    expect(body['p_business_id'], 'biz-ometepe-1');
    expect((body['p_anonymous_id'] as String).length, inInclusiveRange(8, 120));
    expect(body.keys, isNot(contains('p_phone')));
    expect(ContactActionService.actionType(ContactChannel.call), 'call');
    expect(ContactActionService.actionType(ContactChannel.email), 'contact');
  });

  test('las claves del contacto directo existen en los 8 idiomas', () {
    const keys = [
      'contact.owner.title',
      'contact.owner.note',
      'contact.owner.call',
      'contact.owner.waMessage',
      'contact.owner.ctaShort',
      'contact.owner.noneIn',
      'contact.owner.lodgingChoose',
      'contact.owner.beachAccess',
    ];
    for (final lang in kSupportedLanguages) {
      final values = AppStrings.parse(File('assets/i18n/$lang.json').readAsStringSync());
      for (final key in keys) {
        expect(values[key], isNotNull, reason: '$lang:$key');
        expect(values[key], isNotEmpty, reason: '$lang:$key');
      }
      expect(values['contact.owner.waMessage'], contains('{name}'), reason: lang);
    }
  });

  testWidgets('teléfono: WhatsApp y Llamar visibles, sin «Reservar»', (tester) async {
    await _pumpSheet(tester, const Size(360, 780));
    expect(find.text('Finca Magdalena'), findsOneWidget);
    expect(find.byKey(const ValueKey('owner_whatsapp')), findsOneWidget);
    expect(find.byKey(const ValueKey('owner_call')), findsOneWidget);
    expect(find.textContaining('Reserv'), findsNothing);
    expect(tester.takeException(), isNull);
  });

  testWidgets('pantalla de 320 px sin desbordes', (tester) async {
    await _pumpSheet(tester, const Size(320, 640));
    expect(find.byKey(const ValueKey('owner_whatsapp')), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('tablet: los dos canales en una fila sin desbordes', (tester) async {
    await _pumpSheet(tester, const Size(1024, 768));
    final wa = tester.getTopLeft(find.byKey(const ValueKey('owner_whatsapp')));
    final call = tester.getTopLeft(find.byKey(const ValueKey('owner_call')));
    expect(wa.dy, call.dy);
    expect(tester.takeException(), isNull);
  });
}
