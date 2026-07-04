import { Pressable, StyleSheet, Text, View } from 'react-native';

import { accentAlpha, colors } from '@/theme/colors';

// ChipFlow + FlowLayout from CharacterWizardSheet.swift — capsule chips
// wrapping onto new lines. flexWrap does what the custom Layout did.
export function ChipFlow({
  options,
  isSelected,
  onTap,
}: {
  options: string[];
  isSelected: (option: string) => boolean;
  onTap: (option: string) => void;
}) {
  return (
    <View style={styles.flow}>
      {options.map((option) => {
        const selected = isSelected(option);
        return (
          <Pressable
            key={option}
            onPress={() => onTap(option)}
            style={[
              styles.chip,
              { backgroundColor: selected ? colors.accent : accentAlpha(0.12) },
            ]}
          >
            <Text style={[styles.chipText, { color: selected ? 'white' : colors.accent }]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
