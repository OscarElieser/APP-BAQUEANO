import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/theme/app_colors.dart';

class MarqueeTicker extends StatefulWidget {
  const MarqueeTicker({super.key});

  @override
  State<MarqueeTicker> createState() => _MarqueeTickerState();
}

class _MarqueeTickerState extends State<MarqueeTicker> {
  late final ScrollController _scrollController;
  bool _isDisposed = false;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    WidgetsBinding.instance.addPostFrameCallback((_) => _startInfiniteScroll());
  }

  void _startInfiniteScroll() async {
    while (!_isDisposed && mounted) {
      if (_scrollController.hasClients) {
        final maxScroll = _scrollController.position.maxScrollExtent;
        final currentScroll = _scrollController.offset;
        final remainingDistance = maxScroll - currentScroll;
        
        if (remainingDistance > 0) {
          final durationMs = (remainingDistance * 25).toInt();
          await _scrollController.animateTo(
            maxScroll,
            duration: Duration(milliseconds: durationMs),
            curve: Curves.linear,
          );
        }

        if (!_isDisposed && mounted && _scrollController.hasClients) {
          _scrollController.jumpTo(0);
        }
      } else {
        await Future.delayed(const Duration(milliseconds: 500));
      }
    }
  }

  @override
  void dispose() {
    _isDisposed = true;
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Duplicate partners list to create a seamless infinite loop
    final partners = [
      ...CatalogData.marqueePartners,
      ...CatalogData.marqueePartners,
      ...CatalogData.marqueePartners,
    ];

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.primaryDark.withValues(alpha: 0.95),
        border: const Border.symmetric(
          horizontal: BorderSide(color: AppColors.borderLight, width: 0.8),
        ),
      ),
      child: SingleChildScrollView(
        controller: _scrollController,
        scrollDirection: Axis.horizontal,
        physics: const NeverScrollableScrollPhysics(), // Driven by animation
        child: Row(
          children: [
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFFF5722),
                borderRadius: BorderRadius.circular(6),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFFF5722).withValues(alpha: 0.4),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Text(
                'RED DE ALIANZAS',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 10,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  letterSpacing: 1.0,
                ),
              ),
            ),
            ...partners.map(
              (partner) => Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    const Icon(Icons.verified, size: 14, color: AppColors.gold),
                    const SizedBox(width: 6),
                    Text(
                      partner,
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textLight.withValues(alpha: 0.9),
                      ),
                    ),
                    const SizedBox(width: 16),
                    const Text('✦', style: TextStyle(color: Color(0xFFFF5722), fontSize: 10)),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
