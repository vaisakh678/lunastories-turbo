import { StyleSheet, View } from 'react-native';

import { creamAlpha } from '@/theme/colors';

// StoryCardSkeleton from MyStoriesView.swift. The iOS .shimmering() modifier
// is currently a no-op there too, so these render as static gray bars.
export function StoryCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.cover} />
      <View style={styles.textColumn}>
        <View style={[styles.bar, { height: 16 }]} />
        <View style={[styles.bar, { height: 12 }]} />
        <View style={[styles.bar, { height: 10, width: 100, marginTop: 2 }]} />
      </View>
    </View>
  );
}

const GRAY = 'rgba(142, 142, 147, 0.18)';

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 12,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: creamAlpha(0.06),
    borderWidth: 1,
    borderColor: creamAlpha(0.08),
    overflow: 'hidden',
  },
  cover: {
    width: 84,
    height: 84,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: GRAY,
  },
  textColumn: {
    flex: 1,
    gap: 8,
  },
  bar: {
    borderRadius: 4,
    backgroundColor: GRAY,
    alignSelf: 'stretch',
  },
});
