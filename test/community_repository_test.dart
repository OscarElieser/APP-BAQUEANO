// ============================================================================
// 🧭 BAQUEANO — PRUEBAS DEL REPOSITORIO DE COMUNIDAD
// ============================================================================
// 🎯 POR QUÉ: la App debe mostrar solo experiencias reales y no inventar
//   valoraciones, banderas ni fotos; los envíos van siempre a moderación.
// ⚙️ CÓMO: prueba el mapeador y la validación sin red; el envío sin sesión
//   no contacta al servidor.
// 📦 QUÉ: mapeo completo, campos ausentes, URLs inseguras, límites del
//   servidor y estado `needsSignIn`.
// ============================================================================

import 'package:baqueano_app/data/repositories/community_repository.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('CommunityRepository.reviewFromTestimonial', () {
    test('mapea una experiencia publicada', () {
      final review = CommunityRepository.reviewFromTestimonial({
        'id': 'a1b2',
        'author_name': 'Ana López',
        'author_avatar': 'https://lh3.googleusercontent.com/a/x',
        'body': 'Bajamos el cañón con guías de la cooperativa local.',
        'destination_name': 'Cañón de Somoto',
        'rating': 5,
        'experience_type': 'ecoturismo',
        'published_at': '2026-10-04T15:00:00Z',
        'media': [
          {'kind': 'image', 'url': 'https://cdn.example/foto.webp'},
          {'kind': 'video', 'url': 'https://cdn.example/video.mp4'},
        ],
      });

      expect(review, isNotNull);
      expect(review!.author, 'Ana López');
      expect(review.destination, 'Cañón de Somoto');
      expect(review.rating, 5);
      expect(review.photos, ['https://cdn.example/foto.webp']);
      expect(review.date, '2026-10-04');
      expect(review.isEcoGuardian, isTrue);
      expect(review.countryFlag, isEmpty);
    });

    test('no inventa valoración ni foto cuando faltan', () {
      final review = CommunityRepository.reviewFromTestimonial({
        'id': 'x',
        'body': 'Relato sin valoración ni avatar.',
        'author_avatar': 'http://inseguro.example/a.png',
        'media': [
          {'kind': 'image', 'url': 'http://inseguro.example/f.jpg'},
        ],
      });

      expect(review!.rating, 0);
      expect(review.userPhotoUrl, isNull);
      expect(review.photos, isEmpty);
      expect(review.author, 'Viajero BAQUEANO');
    });

    test('descarta filas sin id o sin relato', () {
      expect(CommunityRepository.reviewFromTestimonial({'id': '', 'body': 'x'}), isNull);
      expect(CommunityRepository.reviewFromTestimonial({'id': 'a', 'body': '  '}), isNull);
    });
  });

  group('CommunityRepository.validate', () {
    test('acepta un relato dentro de los límites del servidor', () {
      expect(
        CommunityRepository.validate(
          title: 'Mi experiencia en Ometepe',
          body: 'Subimos el Maderas con un guía de la comunidad de Balgüe.',
          rating: 4,
        ),
        isNull,
      );
    });

    test('rechaza relato corto y valoración fuera de rango', () {
      expect(
        CommunityRepository.validate(title: 'Título ok', body: 'muy corto'),
        contains('30 caracteres'),
      );
      expect(
        CommunityRepository.validate(
          title: 'Título ok',
          body: 'Un relato suficientemente largo para pasar el mínimo.',
          rating: 6,
        ),
        contains('1 a 5'),
      );
    });
  });

  test('sin sesión no envía y pide iniciar sesión', () async {
    final repository = CommunityRepository(
      endpoint: 'https://example.invalid/community',
      tokenProvider: () async => null,
    );

    final result = await repository.submit(
      title: 'Mi experiencia en León',
      body: 'Hicimos sandboarding en Cerro Negro con guías locales certificados.',
      rating: 5,
    );

    expect(result.status, CommunitySubmitStatus.needsSignIn);
  });
}
