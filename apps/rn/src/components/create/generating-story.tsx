import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { avatarSources, isAvatarId } from '@/api/models';
import { colors, creamAlpha } from '@/theme/colors';
import type { GenerationCue } from './shared';
import { storyImages } from './story-images';

// GeneratingStoryView.swift ported: breathing coral/gold halos, a cue
// carousel crossfading every 1.8s, rotating status lines, and a progress
// bar that eases to 95% over the estimated duration.

const ESTIMATED_SECONDS = 10;
const CUE_DURATION_MS = 1800;

const STATUSES = [
  'Picking the perfect words…',
  'Setting the scene…',
  'Adding a sprinkle of magic…',
  'Almost there…',
];

export function GeneratingStory({ cues }: { cues: GenerationCue[] }) {
  const [cueIndex, setCueIndex] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  const breathe = useSharedValue(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    breathe.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }), -1, true);
    progress.value = withTiming(0.95, { duration: ESTIMATED_SECONDS * 1000, easing: Easing.linear });

    const cueTimer = setInterval(() => setCueIndex((i) => i + 1), CUE_DURATION_MS);
    const statusTimer = setInterval(
      () => setStatusIndex((i) => Math.min(i + 1, STATUSES.length - 1)),
      (ESTIMATED_SECONDS / STATUSES.length) * 1000,
    );
    return () => {
      clearInterval(cueTimer);
      clearInterval(statusTimer);
    };
  }, [breathe, progress]);

  const outerHalo = useAnimatedStyle(() => ({
    opacity: 0.55 + breathe.value * 0.45,
  }));
  const innerHalo = useAnimatedStyle(() => ({
    opacity: 0.45 + breathe.value * 0.5,
  }));
  const progressBar = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const cue = cues.length > 0 ? cues[cueIndex % cues.length] : undefined;

  return (
    <View style={styles.container}>
      <View style={styles.stage}>
        <Animated.View style={[styles.haloOuter, outerHalo]} />
        <Animated.View style={[styles.haloInner, innerHalo]} />
        {cue ? <CueArtwork key={`artwork-${cue.id}-${cueIndex}`} cue={cue} /> : null}
      </View>

      <View style={styles.labels}>
        {cue ? (
          <Animated.Text
            key={`cue-${cueIndex}`}
            entering={FadeIn.duration(700)}
            exiting={FadeOut.duration(300)}
            style={styles.cueLabel}
          >
            {cue.label}
          </Animated.Text>
        ) : null}
        <Animated.Text
          key={`status-${statusIndex}`}
          entering={FadeIn.duration(400)}
          style={styles.status}
        >
          {STATUSES[statusIndex]}
        </Animated.Text>
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressBar]} />
        </View>
        <Text style={styles.eta}>About {ESTIMATED_SECONDS} seconds</Text>
      </View>
    </View>
  );
}

function CueArtwork({ cue }: { cue: GenerationCue }) {
  const source =
    (cue.imageName && storyImages[cue.imageName]) ||
    (isAvatarId(cue.symbolName) ? avatarSources[cue.symbolName] : undefined);

  return (
    <Animated.View entering={FadeIn.duration(700)} exiting={FadeOut.duration(300)}>
      {source ? (
        <Image source={source} style={styles.artworkImage} contentFit="cover" />
      ) : (
        <View style={[styles.artworkSymbol, { backgroundColor: `${cue.tint}52` }]}>
          <SymbolView
            name={cue.symbolName as never}
            size={56}
            weight="semibold"
            tintColor={colors.cream}
          />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 28,
  },
  stage: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloOuter: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(232, 89, 61, 0.32)',
    // RN has no blur() on plain views — a large shadow-free soft circle
    // reads close enough at this opacity.
    transform: [{ scale: 1.1 }],
  },
  haloInner: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(245, 186, 66, 0.30)',
  },
  artworkImage: {
    width: 132,
    height: 132,
    borderRadius: 28,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: creamAlpha(0.14),
  },
  artworkSymbol: {
    width: 132,
    height: 132,
    borderRadius: 28,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: creamAlpha(0.14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  labels: {
    alignItems: 'center',
    gap: 10,
  },
  cueLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.cream,
    textAlign: 'center',
  },
  status: {
    fontSize: 15,
    color: creamAlpha(0.6),
    textAlign: 'center',
  },
  progressBlock: {
    alignItems: 'center',
    gap: 6,
    alignSelf: 'stretch',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: creamAlpha(0.15),
    alignSelf: 'stretch',
    maxWidth: 280,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  eta: {
    fontSize: 12,
    color: creamAlpha(0.4),
  },
});
