import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, creamAlpha } from '@/theme/colors';

// ColorChipRow from CharacterWizardSheet.swift: 44pt color circles with a
// selection ring and caption label, wrapping adaptively.
export function ColorChipRow({
  options,
  selectedName,
  onSelect,
}: {
  options: { name: string; color: string }[];
  selectedName: string | null;
  onSelect: (name: string | null) => void;
}) {
  return (
    <View style={styles.grid}>
      {options.map((option) => {
        const isSelected = selectedName === option.name;
        return (
          <Pressable
            key={option.name}
            onPress={() => onSelect(isSelected ? null : option.name)}
            style={styles.item}
          >
            <View
              style={[
                styles.circle,
                {
                  backgroundColor: option.color,
                  borderWidth: isSelected ? 3 : 1,
                  borderColor: isSelected ? colors.accent : 'rgba(142,142,147,0.3)',
                },
              ]}
            />
            <Text style={styles.caption} numberOfLines={1}>
              {option.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  item: {
    width: 64,
    alignItems: 'center',
    gap: 6,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  caption: {
    fontSize: 12,
    color: creamAlpha(0.6),
  },
});
