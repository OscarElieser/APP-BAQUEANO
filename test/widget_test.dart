import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:baqueano_app/main.dart';
import 'package:baqueano_app/core/constants/app_constants.dart';

void main() {
  testWidgets('Baqueano App smoke test and initial render', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(
      const ProviderScope(
        child: BaqueanoApp(),
      ),
    );

    // Verify Baqueano brand name appears in header/scaffold
    expect(find.textContaining('BAQUEANO'), findsWidgets);
  });

  test('Exchange rate and VAT math logic test', () {
    const double priceUsd = 100.0;
    const double expectedNio = 3665.0; // 100 * 36.65

    expect(priceUsd * AppConstants.exchangeRateNioUsd, equals(expectedNio));

    // Tourist 0% VAT
    const double touristVat = priceUsd * AppConstants.touristVatRate;
    expect(touristVat, equals(0.0));

    // Resident 15% VAT
    const double residentVat = priceUsd * AppConstants.residentVatRate;
    expect(residentVat, equals(15.0));

    // Coupon discount 15%
    const double discount = priceUsd * AppConstants.promoCouponDiscount;
    expect(discount, equals(15.0));
  });
}
