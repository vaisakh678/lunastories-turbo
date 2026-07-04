import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, creamAlpha } from '@/theme/colors';

// Shared wizard primitives from CharacterWizardSheet.swift: the segmented
// progress bar, field labels, and the rounded cream text field.

export function ProgressBar({ currentIndex, total }: { currentIndex: number; total: number }) {
  return (
    <View style={progressStyles.row}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            progressStyles.segment,
            { backgroundColor: i <= currentIndex ? colors.accent : 'rgba(142,142,147,0.25)' },
          ]}
        />
      ))}
    </View>
  );
}

const progressStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
});

export function FieldLabel({ children }: { children: string }) {
  return <Text style={labelStyles.label}>{children}</Text>;
}

const labelStyles = StyleSheet.create({
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: creamAlpha(0.6),
  },
});

// Text field: title3 font, 52pt min height, cream 8% fill, 18pt continuous
// radius, cream 18% border.
export function WizardTextField({
  large = true,
  style,
  ...props
}: TextInputProps & { large?: boolean }) {
  return (
    <TextInput
      placeholderTextColor={creamAlpha(0.35)}
      selectionColor={colors.accent}
      {...props}
      style={[fieldStyles.input, large ? fieldStyles.large : fieldStyles.regular, style]}
    />
  );
}

const fieldStyles = StyleSheet.create({
  input: {
    paddingHorizontal: 16,
    backgroundColor: creamAlpha(0.08),
    borderRadius: 18,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: creamAlpha(0.18),
    color: colors.cream,
  },
  large: {
    fontSize: 20,
    minHeight: 52,
    paddingVertical: 14,
  },
  regular: {
    fontSize: 17,
    paddingVertical: 14,
  },
});
