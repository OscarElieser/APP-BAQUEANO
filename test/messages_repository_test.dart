// ============================================================================
// 🧭 BAQUEANO — PRUEBAS DEL REPOSITORIO DE MENSAJES
// ============================================================================
// 🎯 POR QUÉ: la App debe mostrar las conversaciones tal como las guarda el servidor, sin
//   exponer el correo del equipo, y validar con los mismos límites antes de enviar.
// ⚙️ CÓMO: prueba los mapeadores y la validación sin red; sin sesión no se contacta al servidor.
// 📦 QUÉ: lista, hilo (autor equipo/persona), datos incompletos, límites y `login_required`.
// ============================================================================

import 'package:baqueano_app/data/repositories/messages_repository.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('MessagesRepository.summariesFrom', () {
    test('mapea las conversaciones y descarta filas sin id o asunto', () {
      final items = MessagesRepository.summariesFrom([
        {'id': 'c1', 'subject': 'Ferry a Ometepe', 'status': 'answered', 'unread': 1, 'last_message_at': '2026-10-07T09:45:00Z'},
        {'id': '', 'subject': 'Sin id'},
        {'id': 'c3', 'subject': '   '},
      ]);
      expect(items, hasLength(1));
      expect(items.first.subject, 'Ferry a Ometepe');
      expect(items.first.status, 'answered');
      expect(items.first.unread, 1);
      expect(items.first.lastMessageAt, DateTime.utc(2026, 10, 7, 9, 45));
    });

    test('una respuesta que no es lista da lista vacía', () {
      expect(MessagesRepository.summariesFrom(null), isEmpty);
      expect(MessagesRepository.summariesFrom({'id': 'x'}), isEmpty);
    });
  });

  group('MessagesRepository.threadFrom', () {
    test('marca los mensajes del equipo sin exponer su correo', () {
      final thread = MessagesRepository.threadFrom({
        'id': 'c1',
        'subject': 'Ferry a Ometepe',
        'status': 'closed',
        'messages': [
          {'author': 'user', 'body': '¿Hay ferry el domingo?', 'created_at': '2026-10-07T09:30:00Z'},
          {'author': 'staff', 'author_ref': 'equipo@baqueano.test', 'body': 'Sí, a las 10:00.', 'created_at': '2026-10-07T09:45:00Z'},
          {'author': 'user', 'body': ''},
        ],
      });
      expect(thread, isNotNull);
      expect(thread!.isClosed, isTrue);
      expect(thread.messages, hasLength(2));
      expect(thread.messages.first.fromTeam, isFalse);
      expect(thread.messages.last.fromTeam, isTrue);
      expect(thread.messages.last.body, 'Sí, a las 10:00.');
    });

    test('sin id no hay hilo', () {
      expect(MessagesRepository.threadFrom({'subject': 'x'}), isNull);
    });
  });

  group('MessagesRepository.validate', () {
    test('usa los mismos límites que el servidor', () {
      expect(MessagesRepository.validate(subject: 'ab', body: 'hola'), isNotNull);
      expect(MessagesRepository.validate(subject: 'a' * 121, body: 'hola'), isNotNull);
      expect(MessagesRepository.validate(subject: 'Consulta', body: '   '), isNotNull);
      expect(MessagesRepository.validate(body: 'a' * 2001), isNotNull);
      expect(MessagesRepository.validate(subject: 'Consulta', body: 'hola'), isNull);
      expect(MessagesRepository.validate(body: 'a' * 2000), isNull);
    });
  });

  test('sin sesión no contacta al servidor y pide iniciar sesión', () async {
    final repo = MessagesRepository(endpoint: 'https://invalid.example', tokenProvider: () async => null);
    await expectLater(
      repo.list(),
      throwsA(isA<MessagesException>().having((e) => e.code, 'code', 'login_required')),
    );
  });
}
