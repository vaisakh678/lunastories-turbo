import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { accentAlpha, creamAlpha } from '@/theme/colors';
import { colors } from '@/theme/colors';

// AddCharacterTile from HomeView.swift: dashed accent border (1.5pt,
// dash [6,4]) over a faint cream fill, centered plus glyph. The trailing
// blank Text keeps its height aligned with CharacterCard's name row.
export function AddCharacterTile({
  onPress,
  accessibilityLabel,
}: {
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.container} accessibilityLabel={accessibilityLabel}>
      <View style={styles.tile}>
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Rect
            x={1}
            y={1}
            width="99%"
            height="99%"
            rx={22}
            ry={22}
            fill="none"
            stroke={accentAlpha(0.55)}
            strokeWidth={1.5}
            strokeDasharray="6 4"
          />
        </Svg>
        <SymbolView name="plus" size={30} weight="semibold" tintColor={colors.accent} />
      </View>
      <Text style={styles.spacerText}> </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 6,
  },
  tile: {
    aspectRatio: 1,
    borderRadius: 22,
    borderCurve: 'continuous',
    backgroundColor: creamAlpha(0.06),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  spacerText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
