import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, creamAlpha } from '@/theme/colors';
import { storyModes, type StoryMode } from './modes';
import { storyImages } from './story-images';

// ChooseModeView.swift ported: "Choose a mode" header + eager 2-column
// grid of artwork tiles.
export function ChooseMode({ onSelect }: { onSelect: (mode: StoryMode) => void }) {
  const rows: StoryMode[][] = [];
  for (let i = 0; i < storyModes.length; i += 2) rows.push(storyModes.slice(i, i + 2));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose a mode</Text>
        <Text style={styles.subtitle}>Pick a theme for your next story.</Text>
      </View>
      <View style={styles.grid}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((mode) => (
              <ModeTile key={mode.title} mode={mode} onPress={() => onSelect(mode)} />
            ))}
            {row.length === 1 ? <View style={styles.spacer} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function ModeTile({ mode, onPress }: { mode: StoryMode; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.tile}>
      <Image source={storyImages[mode.imageName]} style={styles.tileImage} contentFit="cover" />
      <Text numberOfLines={2} style={styles.tileLabel}>
        {mode.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.cream,
  },
  subtitle: {
    fontSize: 15,
    color: creamAlpha(0.65),
  },
  grid: {
    gap: 20,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 20,
  },
  spacer: {
    flex: 1,
  },
  tile: {
    flex: 1,
    gap: 8,
  },
  tileImage: {
    aspectRatio: 1,
    width: '100%',
    borderRadius: 22,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tileLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.cream,
    textAlign: 'center',
  },
});
