import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/data/catalog_data.dart';
import '../../../core/models/cultural_models.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/responsive_scaffold.dart';
import '../../../core/widgets/section_header.dart';
import '../../../core/widgets/custom_toast.dart';

class MusicScreen extends StatefulWidget {
  const MusicScreen({super.key});

  @override
  State<MusicScreen> createState() => _MusicScreenState();
}

class _MusicScreenState extends State<MusicScreen> with SingleTickerProviderStateMixin {
  int _currentTrackIndex = 0;
  bool _isPlaying = false;
  double _playbackProgress = 0.35;
  Timer? _playbackTimer;

  MusicTrack get _currentTrack => CatalogData.musicTracks[_currentTrackIndex];

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    _playbackTimer?.cancel();
    super.dispose();
  }

  void _togglePlayPause() {
    setState(() {
      _isPlaying = !_isPlaying;
      if (_isPlaying) {
        _startProgressSimulation();
        CustomToast.show(
          context,
          message: 'Reproduciendo: ${_currentTrack.title} (${_currentTrack.artist})',
          icon: Icons.music_note,
        );
      } else {
        _playbackTimer?.cancel();
      }
    });
  }

  void _startProgressSimulation() {
    _playbackTimer?.cancel();
    _playbackTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      setState(() {
        _playbackProgress += 0.02;
        if (_playbackProgress >= 1.0) {
          _playbackProgress = 0.0;
          _playNextTrack();
        }
      });
    });
  }

  void _playNextTrack() {
    setState(() {
      _currentTrackIndex = (_currentTrackIndex + 1) % CatalogData.musicTracks.length;
      _playbackProgress = 0.0;
    });
  }

  void _playPreviousTrack() {
    setState(() {
      _currentTrackIndex = (_currentTrackIndex - 1 + CatalogData.musicTracks.length) % CatalogData.musicTracks.length;
      _playbackProgress = 0.0;
    });
  }

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
              tag: 'PATRIMONIO SONORO',
              title: '🎵 Música Folclórica & Marimba de Arco',
              subtitle: 'El ritmo y alma de la tierra pinolera: marimba indígena, son nica campesino, polkas segovianas y palo de mayo caribeño.',
            ),
            const SizedBox(height: 16),

            // INTERACTIVE AUDIO PLAYER HERO
            _buildInteractiveAudioPlayer(isDesktop),

            const SizedBox(height: 36),

            // PLAYLIST & HISTORICAL CONTEXT
            Text(
              'REPERTORIO FOLCLÓRICO TRADICIONAL',
              style: GoogleFonts.spaceGrotesk(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppColors.gold,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 12),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: CatalogData.musicTracks.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final track = CatalogData.musicTracks[index];
                final isCurrent = index == _currentTrackIndex;

                return GlassContainer(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  borderRadius: BorderRadius.circular(16),
                  backgroundColor: isCurrent ? AppColors.terracotta.withOpacity(0.2) : null,
                  border: Border.all(
                    color: isCurrent ? AppColors.gold : AppColors.borderLight,
                    width: isCurrent ? 1.5 : 0.8,
                  ),
                  onTap: () {
                    setState(() {
                      _currentTrackIndex = index;
                      _playbackProgress = 0.0;
                      _isPlaying = true;
                      _startProgressSimulation();
                    });
                  },
                  child: Row(
                    children: [
                      // Play/Equalizer Icon
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: isCurrent ? AppColors.terracotta : AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(
                          isCurrent && _isPlaying ? Icons.graphic_eq : Icons.play_arrow_rounded,
                          color: Colors.white,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 14),

                      // Track Info
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              track.title,
                              style: GoogleFonts.montserrat(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: isCurrent ? AppColors.goldLight : AppColors.textLight,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${track.artist} · ${track.genre}',
                              style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      ),

                      // Duration & Tag
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            track.duration,
                            style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textLight),
                          ),
                          Text(
                            track.region,
                            style: GoogleFonts.inter(fontSize: 10, color: AppColors.terracottaLight),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),

            const SizedBox(height: 36),

            // GÉNEROS MUSICALES DE NICARAGUA
            const SectionHeader(
              tag: 'RITMOS Y RAÍCES',
              title: 'Géneros Musicales Autóctonos',
              subtitle: 'Cada rincón de Nicaragua tiene su propio latido cultural.',
            ),
            const SizedBox(height: 12),

            _buildGenresGrid(isDesktop),

            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildInteractiveAudioPlayer(bool isDesktop) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: AppGradients.volcanicHero,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: AppColors.borderGold, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: AppColors.terracotta.withOpacity(0.2),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          isDesktop
              ? Row(
                  children: [
                    _buildCoverArt(140),
                    const SizedBox(width: 24),
                    Expanded(child: _buildPlayerControls()),
                  ],
                )
              : Column(
                  children: [
                    _buildCoverArt(120),
                    const SizedBox(height: 18),
                    _buildPlayerControls(),
                  ],
                ),
          const SizedBox(height: 16),
          // History Card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.bgDark.withOpacity(0.6),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.auto_stories, color: AppColors.gold, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'CONTEXTO HISTÓRICO & CULTURAL',
                        style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.goldLight),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _currentTrack.history,
                        style: GoogleFonts.inter(fontSize: 12, color: AppColors.textLight.withOpacity(0.9), height: 1.4),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCoverArt(double size) {
    return Stack(
      alignment: Alignment.center,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: Image.network(
            _currentTrack.coverUrl,
            width: size,
            height: size,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(
              width: size,
              height: size,
              color: AppColors.primaryLight,
              child: const Icon(Icons.music_note, size: 48, color: AppColors.gold),
            ),
          ),
        ),
        if (_isPlaying)
          Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.3),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Center(
              child: Icon(Icons.graphic_eq, color: AppColors.gold, size: 36),
            ),
          ),
      ],
    );
  }

  Widget _buildPlayerControls() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.terracotta.withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.terracottaLight),
              ),
              child: Text(
                _currentTrack.genre.toUpperCase(),
                style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.terracottaLight),
              ),
            ),
            Text(
              _currentTrack.region,
              style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          _currentTrack.title,
          style: GoogleFonts.montserrat(
            fontSize: 20,
            fontWeight: FontWeight.w800,
            color: AppColors.textLight,
          ),
        ),
        Text(
          _currentTrack.artist,
          style: GoogleFonts.spaceGrotesk(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.goldLight,
          ),
        ),
        const SizedBox(height: 14),

        // Progress Bar
        SliderTheme(
          data: SliderThemeData(
            thumbColor: AppColors.gold,
            activeTrackColor: AppColors.terracotta,
            inactiveTrackColor: AppColors.borderLight,
            thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
            overlayShape: const RoundSliderOverlayShape(overlayRadius: 12),
          ),
          child: Slider(
            value: _playbackProgress.clamp(0.0, 1.0),
            onChanged: (val) {
              setState(() => _playbackProgress = val);
            },
          ),
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('01:14', style: GoogleFonts.spaceGrotesk(fontSize: 10, color: AppColors.textMuted)),
            Text(_currentTrack.duration, style: GoogleFonts.spaceGrotesk(fontSize: 10, color: AppColors.textMuted)),
          ],
        ),

        const SizedBox(height: 10),

        // Buttons
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            IconButton(
              icon: const Icon(Icons.skip_previous_rounded, color: AppColors.textLight, size: 28),
              onPressed: _playPreviousTrack,
            ),
            const SizedBox(width: 12),
            InkWell(
              onTap: _togglePlayPause,
              borderRadius: BorderRadius.circular(30),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  gradient: AppGradients.sunsetTerracotta,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.terracotta.withOpacity(0.4),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Icon(
                  _isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                  color: Colors.white,
                  size: 28,
                ),
              ),
            ),
            const SizedBox(width: 12),
            IconButton(
              icon: const Icon(Icons.skip_next_rounded, color: AppColors.textLight, size: 28),
              onPressed: _playNextTrack,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildGenresGrid(bool isDesktop) {
    final genres = [
      {'title': 'Marimba de Arco', 'desc': 'Instrumento nacional de teclas de madera de chiquirín y resonadores de jícaro.'},
      {'title': 'Son Nica', 'desc': 'Creado por Camilo Zapata, con compás 6/8 que recrea el andar del campesino.'},
      {'title': 'Palo de Mayo (Maypole)', 'desc': 'Danza caribeña afrodescendiente de Bluefields y Corn Island con percusión vibrante.'},
      {'title': 'Polkas & Mazurcas Segovianas', 'desc': 'Aclimatadas en el norte montañoso (Matagalpa, Jinotega, Estelí) con violines campesinos.'},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
        maxCrossAxisExtent: isDesktop ? 350 : 500,
        mainAxisExtent: 140,
        crossAxisSpacing: 14,
        mainAxisSpacing: 14,
      ),
      itemCount: genres.length,
      itemBuilder: (context, index) {
        final g = genres[index];
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.bgCard,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.borderLight),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                g['title']!,
                style: GoogleFonts.montserrat(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.goldLight),
              ),
              const SizedBox(height: 6),
              Text(
                g['desc']!,
                style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted, height: 1.35),
              ),
            ],
          ),
        );
      },
    );
  }
}
