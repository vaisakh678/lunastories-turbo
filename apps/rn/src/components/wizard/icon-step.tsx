import { Pressable, StyleSheet, View } from 'react-native';

import { bundledAvatarIds } from '@/api/models';
import { CharacterIcon } from '@/components/character-icon';
import { colors } from '@/theme/colors';
import type { CharacterDraft } from './draft';
import { FieldLabel } from './ui';

// Icon step: 3-column grid of bundled avatars, 3pt accent ring on the
// selected tile.
export function IconStep({
  draft,
  onChange,
}: {
  draft: CharacterDraft;
  onChange: (patch: Partial<CharacterDraft>) => void;
}) {
  const rows: string[][] = [];
  for (let i = 0; i < bundledAvatarIds.length; i += 3) {
    rows.push(bundledAvatarIds.slice(i, i + 3) as unknown as string[]);
  }

  return (
    <View style={styles.column}>
      <FieldLabel>Pick an icon</FieldLabel>
      <View style={styles.grid}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((avatarId) => {
              const isSelected = draft.iconName === avatarId;
              return (
                <Pressable
                  key={avatarId}
                  onPress={() => onChange({ iconName: avatarId })}
                  style={styles.tile}
                >
                  <CharacterIcon
                    symbolName={avatarId}
                    tintName="orange"
                    cornerRadius={22}
                    glyphSize={28}
                  />
                  {isSelected ? <View pointerEvents="none" style={styles.ring} /> : null}
                </Pressable>
              );
            })}
            {row.length < 3
              ? Array.from({ length: 3 - row.length }, (_, i) => (
                  <View key={`spacer-${i}`} style={styles.tile} />
                ))
              : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    gap: 12,
  },
  grid: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  tile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 22,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  ring: {
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
});
