import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppGradients {
  static const LinearGradient gold = LinearGradient(
    colors: [AppColors.gold, AppColors.goldLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient sunsetTerracotta = LinearGradient(
    colors: [AppColors.terracotta, Color(0xFFE27B48), AppColors.gold],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  static const LinearGradient volcanicHero = LinearGradient(
    colors: [
      Color(0xFF041920),
      Color(0xFF082B35),
      Color(0xFF0F172A),
    ],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient cardGlass = LinearGradient(
    colors: [
      Color(0x2E13424E),
      Color(0x1A082B35),
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient jungle = LinearGradient(
    colors: [AppColors.jungleGreen, AppColors.craterTeal],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient fireAccent = LinearGradient(
    colors: [Color(0xFFEA580C), AppColors.terracotta, AppColors.gold],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
