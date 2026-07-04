import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Character } from '@/api/models';
import { CharacterIcon } from '@/components/character-icon';
import { colors } from '@/theme/colors';

// CharacterCard from HomeView.swift: square avatar clipped to a 22pt
// continuous-corner rect, 3pt accent border + checkmark when selected,
// name in semibold subheadline below.
export function CharacterCard({
  character,
  isSelected,
  onPress,
  onLongPress,
}: {
  character: Character;
  isSelected: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.container}>
      <View style={styles.tileWrap}>
        <CharacterIcon
          symbolName={character.symbolName}
          tintName={character.tintName}
          cornerRadius={22}
          glyphSize={30}
        />
        {isSelected ? (
          <>
            <View pointerEvents="none" style={styles.selectedBorder} />
            <View style={styles.checkBadge}>
              <SymbolView
                name="checkmark.circle.fill"
                size={20}
                type="palette"
                colors={['white', colors.accent]}
              />
            </View>
          </>
        ) : null}
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {character.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 6,
  },
  tileWrap: {
    aspectRatio: 1,
    borderRadius: 22,
    // borderCurve gives the SwiftUI "continuous" superellipse corners.
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  selectedBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    borderCurve: 'continuous',
    borderWidth: 3,
    borderColor: colors.accent,
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.cream,
  },
});
