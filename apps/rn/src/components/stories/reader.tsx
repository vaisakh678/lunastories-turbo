import { BlurView } from 'expo-blur';
import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, Defs, RadialGradient as SvgRadialGradient, Stop } from 'react-native-svg';

import type { StoryResponse } from '@/api/models';
import { tintColor } from '@/api/models';
import { accentAlpha, colors, creamAlpha } from '@/theme/colors';
import { StoryCoverGrid } from './story-cover-grid';

// Reader pieces ported from StoryReaderView.swift.

/** Hero block: cover collage on a soft coral halo, then title + summary. */
export function StoryHero({ story }: { story: StoryResponse }) {
  return (
    <View style={heroStyles.container}>
      <View style={heroStyles.coverWrap}>
        {/* Warm halo behind the cover (blurred coral circle on iOS). */}
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Defs>
            <SvgRadialGradient id="halo" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={colors.glowCoral} stopOpacity={0.28} />
              <Stop offset="1" stopColor={colors.glowCoral} stopOpacity={0} />
            </SvgRadialGradient>
          </Defs>
          <Circle cx="50%" cy="50%" r="50%" fill="url(#halo)" />
        </Svg>
        <View style={heroStyles.cover}>
          <StoryCoverGrid
            icons={story.coverIcons ?? []}
            fallbackSymbol={story.coverSymbol ?? 'book.fill'}
            tintName={story.coverTint ?? 'blue'}
            glyphSize={56}
          />
        </View>
      </View>

      <View style={heroStyles.titleBlock}>
        <Text style={heroStyles.title}>{story.title ?? 'Untitled'}</Text>
        {story.summary ? <Text style={heroStyles.summary}>{story.summary}</Text> : null}
      </View>
    </View>
  );
}

const heroStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },
  coverWrap: {
    paddingVertical: 8,
  },
  cover: {
    width: '100%',
    aspectRatio: 1.3,
    borderRadius: 32,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: creamAlpha(0.14),
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  titleBlock: {
    paddingHorizontal: 20,
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.cream,
    textAlign: 'center',
  },
  summary: {
    fontSize: 15,
    color: creamAlpha(0.65),
    textAlign: 'center',
  },
});

/** The story prose on the warm cream "paper" card. */
export function StoryPage({ story }: { story: StoryResponse }) {
  const blocks = story.content?.blocks ?? [];
  return (
    <View style={pageStyles.page}>
      {blocks.map((block, i) => {
        if (block.kind === 'text') {
          return (
            <Text key={i} style={pageStyles.prose}>
              {block.text}
            </Text>
          );
        }
        const tint = tintColor(block.tint);
        return (
          <View key={i} style={[pageStyles.illustration, { backgroundColor: `${tint}29` }]}>
            <SymbolView
              name={block.symbolName as never}
              size={60}
              weight="semibold"
              tintColor={tint}
            />
          </View>
        );
      })}

      {story.moral ? (
        <View style={pageStyles.moralBlock}>
          <View style={pageStyles.moralDivider} />
          <Text style={pageStyles.moralLabel}>The moral of the story</Text>
          <Text style={pageStyles.moralText}>{story.moral}</Text>
        </View>
      ) : null}
    </View>
  );
}

const pageStyles = StyleSheet.create({
  page: {
    marginHorizontal: 16,
    paddingHorizontal: 24,
    paddingVertical: 28,
    gap: 22,
    borderRadius: 28,
    borderCurve: 'continuous',
    backgroundColor: colors.paper,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
  },
  prose: {
    fontSize: 19,
    lineHeight: 31,
    color: colors.ink,
  },
  illustration: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: 28,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moralBlock: {
    gap: 8,
    paddingTop: 4,
  },
  moralDivider: {
    height: 1,
    backgroundColor: 'rgba(41, 31, 56, 0.12)',
  },
  moralLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'rgba(41, 31, 56, 0.55)',
  },
  moralText: {
    fontSize: 17,
    fontStyle: 'italic',
    lineHeight: 26,
    color: colors.ink,
  },
});

/** "Make another with these heroes" card. Stubbed: spins briefly, then onDone. */
export function MakeAnotherCard({
  isLoading,
  onPress,
}: {
  isLoading: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} disabled={isLoading} style={makeAnotherStyles.card}>
      <View style={makeAnotherStyles.iconCircle}>
        {isLoading ? (
          <ActivityIndicator color={colors.cream} />
        ) : (
          <SymbolView name="sparkles" size={20} weight="semibold" tintColor={colors.cream} />
        )}
      </View>
      <View style={makeAnotherStyles.textColumn}>
        <Text style={makeAnotherStyles.title}>
          {isLoading ? 'Crafting another…' : 'Make another with these heroes'}
        </Text>
        <Text style={makeAnotherStyles.subtitle}>Same characters & mode, brand-new tale</Text>
      </View>
      <SymbolView name="chevron.right" size={13} weight="bold" tintColor={creamAlpha(0.5)} />
    </Pressable>
  );
}

const makeAnotherStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: accentAlpha(0.1),
    borderWidth: 1,
    borderColor: accentAlpha(0.3),
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: accentAlpha(0.32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.cream,
  },
  subtitle: {
    fontSize: 12,
    color: creamAlpha(0.65),
  },
});

/** Bottom bar when the story has no audio yet. */
export function GenerateAudioBar({
  isGenerating,
  onPress,
}: {
  isGenerating: boolean;
  onPress: () => void;
}) {
  return (
    <View style={audioStyles.generateWrap}>
      <Pressable
        onPress={onPress}
        disabled={isGenerating}
        style={[
          audioStyles.generateButton,
          { backgroundColor: isGenerating ? 'rgba(142,142,147,0.5)' : colors.accent },
        ]}
      >
        {isGenerating ? (
          <>
            <ActivityIndicator size="small" color="white" />
            <Text style={audioStyles.generateLabel}>Generating audio…</Text>
          </>
        ) : (
          <>
            <SymbolView name="waveform.badge.plus" size={18} tintColor="white" />
            <Text style={audioStyles.generateLabel}>Generate Audio</Text>
          </>
        )}
      </Pressable>
      {!isGenerating ? (
        <Text style={audioStyles.generateHint}>Takes about 10–15 seconds.</Text>
      ) : null}
    </View>
  );
}

/**
 * Playback bar — STUBBED audio. Renders the exact player UI from iOS
 * (skip ±15, play/pause circle, seek track, elapsed/total), but progress
 * is driven by a local timer instead of a real AVPlayer. Swap for
 * expo-audio in the dev-build phase.
 */
export function AudioPlayerBar({ totalSeconds }: { totalSeconds: number }) {
  const total = Math.max(totalSeconds, 1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timer.current = setInterval(() => {
        setElapsed((e) => {
          if (e + 1 >= total) {
            setIsPlaying(false);
            return total;
          }
          return e + 1;
        });
      }, 1000);
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [isPlaying, total]);

  const format = (seconds: number) => {
    const s = Math.max(0, Math.floor(seconds));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  const skip = (by: number) => setElapsed((e) => Math.min(total, Math.max(0, e + by)));

  const seekTo = (x: number) => {
    if (trackWidth <= 0) return;
    const fraction = Math.min(1, Math.max(0, x / trackWidth));
    setElapsed(fraction * total);
  };

  const pan = Gesture.Pan()
    .onBegin((e) => seekTo(e.x))
    .onChange((e) => seekTo(e.x))
    .runOnJS(true);

  const progress = trackWidth * (elapsed / total);

  return (
    <View style={audioStyles.playerWrap}>
      <View style={audioStyles.controlsRow}>
        <Pressable onPress={() => skip(-15)} accessibilityLabel="Back 15 seconds">
          <SymbolView name="gobackward.15" size={22} tintColor={colors.cream} />
        </Pressable>

        <Pressable
          onPress={() => setIsPlaying((p) => !p)}
          style={audioStyles.playButton}
          accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
        >
          <SymbolView
            name={isPlaying ? 'pause.fill' : 'play.fill'}
            size={28}
            weight="semibold"
            tintColor="white"
          />
        </Pressable>

        <Pressable onPress={() => skip(15)} accessibilityLabel="Forward 15 seconds">
          <SymbolView name="goforward.15" size={22} tintColor={colors.cream} />
        </Pressable>
      </View>

      <View style={audioStyles.seekBlock}>
        <GestureDetector gesture={pan}>
          <View
            style={audioStyles.track}
            onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          >
            <View style={audioStyles.trackFillBg} />
            <View style={[audioStyles.trackFill, { width: progress }]} />
            <View style={[audioStyles.thumb, { left: Math.max(0, progress - 8) }]} />
          </View>
        </GestureDetector>
        <View style={audioStyles.timeRow}>
          <Text style={audioStyles.timeText}>{format(elapsed)}</Text>
          <Text style={audioStyles.timeText}>{format(total)}</Text>
        </View>
      </View>
    </View>
  );
}

/** Glass background for the pinned audio bar area. */
export function AudioBarBackground({ children }: { children: React.ReactNode }) {
  return (
    <BlurView intensity={40} tint="dark" style={audioStyles.barBackground}>
      <View style={audioStyles.barDim} />
      {children}
    </BlurView>
  );
}

const audioStyles = StyleSheet.create({
  generateWrap: {
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 8,
    alignItems: 'center',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    alignSelf: 'stretch',
    paddingVertical: 16,
    borderRadius: 999,
  },
  generateLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
  },
  generateHint: {
    fontSize: 12,
    color: creamAlpha(0.5),
  },
  playerWrap: {
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seekBlock: {
    gap: 4,
  },
  track: {
    height: 24,
    justifyContent: 'center',
  },
  trackFillBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: creamAlpha(0.2),
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  thumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: creamAlpha(0.5),
  },
  barBackground: {
    overflow: 'hidden',
  },
  barDim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
});
