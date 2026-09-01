import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/models/destination_model.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/baqueano_button.dart';
import '../../../core/widgets/custom_toast.dart';
import '../../checkout/widgets/checkout_modal.dart';

class DestinationCard extends StatefulWidget {
  final DestinationModel destination;
  final VoidCallback? onFavoriteToggled;

  const DestinationCard({
    super.key,
    required this.destination,
    this.onFavoriteToggled,
  });

  @override
  State<DestinationCard> createState() => _DestinationCardState();
}

class _DestinationCardState extends State<DestinationCard> {
  late bool _isFavorite;

  @override
  void initState() {
    super.initState();
    _isFavorite = widget.destination.isFavorite;
  }

  Color _getDifficultyColor(String difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'fácil':
        return AppColors.success;
      case 'moderado':
        return AppColors.warning;
      case 'exigente':
        return AppColors.error;
      default:
        return AppColors.gold;
    }
  }

  @override
  Widget build(BuildContext context) {
    final destination = widget.destination;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.25),
            blurRadius: 14,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image and Overlay Badges
          Stack(
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                child: Image.network(
                  destination.imageUrl,
                  height: 155,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    height: 155,
                    color: AppColors.primaryLight,
                    child: const Center(child: Icon(Icons.terrain, size: 40, color: AppColors.gold)),
                  ),
                ),
              ),

              // Gradient Overlay for readability
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                height: 60,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Colors.transparent, AppColors.bgDark.withOpacity(0.8)],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                    ),
                  ),
                ),
              ),

              // Difficulty Badge
              Positioned(
                top: 12,
                left: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.bgDark.withOpacity(0.85),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: _getDifficultyColor(destination.difficulty), width: 1),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _getDifficultyColor(destination.difficulty),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        destination.difficulty,
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Favorite Button
              Positioned(
                top: 10,
                right: 10,
                child: InkWell(
                  onTap: () {
                    setState(() => _isFavorite = !_isFavorite);
                    if (_isFavorite) {
                      CustomToast.success(context, '${destination.title} añadido a favoritos.');
                    }
                    widget.onFavoriteToggled?.call();
                  },
                  borderRadius: BorderRadius.circular(20),
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.bgDark.withOpacity(0.8),
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: Icon(
                      _isFavorite ? Icons.favorite : Icons.favorite_border,
                      size: 18,
                      color: _isFavorite ? AppColors.terracotta : Colors.white,
                    ),
                  ),
                ),
              ),

              // Department pill on image bottom
              Positioned(
                bottom: 10,
                left: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.terracotta.withOpacity(0.85),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    destination.department.toUpperCase(),
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      letterSpacing: 0.8,
                    ),
                  ),
                ),
              ),
            ],
          ),

          // Card Body
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Rating and stats
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.star_rounded, size: 18, color: AppColors.gold),
                        const SizedBox(width: 4),
                        Text(
                          '${destination.rating}',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '(${destination.reviewsCount})',
                          style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
                        ),
                      ],
                    ),
                    Text(
                      '${destination.duration} · ${destination.distance}',
                      style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
                    ),
                  ],
                ),

                const SizedBox(height: 8),

                // Title
                Text(
                  destination.title,
                  style: GoogleFonts.montserrat(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textLight,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),

                const SizedBox(height: 6),

                // Description
                Text(
                  destination.description,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: AppColors.textMuted,
                    height: 1.4,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),

                const SizedBox(height: 12),

                // Tags
                Wrap(
                  spacing: 6,
                  runSpacing: 4,
                  children: destination.tags.take(3).map((tag) {
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight.withOpacity(0.4),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '#$tag',
                        style: GoogleFonts.spaceGrotesk(fontSize: 10, color: AppColors.goldLight),
                      ),
                    );
                  }).toList(),
                ),

                const SizedBox(height: 14),
                const Divider(color: AppColors.borderLight, height: 1),
                const SizedBox(height: 12),

                // Price and Book Action
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Precio x persona', style: GoogleFonts.inter(fontSize: 10, color: AppColors.textMuted)),
                          Wrap(
                            crossAxisAlignment: WrapCrossAlignment.center,
                            children: [
                              Text(
                                '\$${destination.priceUsd.toInt()} USD',
                                style: GoogleFonts.montserrat(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.gold,
                                ),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '/ C\$${destination.priceNio.toInt()}',
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 11,
                                  color: AppColors.textMuted,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    BaqueanoButton(
                      text: 'Reservar',
                      variant: BaqueanoButtonVariant.primary,
                      height: 38,
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      onPressed: () => CheckoutModal.show(context, destination),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
