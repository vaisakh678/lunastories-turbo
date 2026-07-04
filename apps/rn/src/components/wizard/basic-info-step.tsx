import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Gender } from '@/api/models';
import { colors, creamAlpha } from '@/theme/colors';
import type { CharacterDraft } from './draft';
import { FieldLabel, WizardTextField } from './ui';

// Main-character Basic Info step: name field, age stepper, gender picker.
export function BasicInfoStep({
  draft,
  onChange,
}: {
  draft: CharacterDraft;
  onChange: (patch: Partial<CharacterDraft>) => void;
}) {
  return (
    <View style={styles.column}>
      <FieldLabel>Name</FieldLabel>
      <WizardTextField
        placeholder="e.g. Milo"
        value={draft.name}
        onChangeText={(name) => onChange({ name })}
        autoCapitalize="words"
      />

      <FieldLabel>Age</FieldLabel>
      <View style={styles.ageRow}>
        <Text style={styles.ageText}>{draft.age} years</Text>
        <Stepper
          value={draft.age}
          min={1}
          max={18}
          onChange={(age) => onChange({ age })}
        />
      </View>

      <FieldLabel>Gender</FieldLabel>
      <SegmentedControl
        options={['male', 'female', 'na'] satisfies Gender[]}
        selected={draft.gender}
        onSelect={(gender) => onChange({ gender })}
      />
    </View>
  );
}

// iOS-style stepper (SwiftUI Stepper has no RN counterpart — minus/plus
// pair styled like the system control).
function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <View style={styles.stepper}>
      <Pressable
        onPress={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        style={({ pressed }) => [styles.stepperButton, pressed && styles.stepperPressed]}
      >
        <SymbolView
          name="minus"
          size={15}
          weight="semibold"
          tintColor={value <= min ? 'rgba(255,255,255,0.3)' : 'white'}
        />
      </Pressable>
      <View style={styles.stepperDivider} />
      <Pressable
        onPress={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        style={({ pressed }) => [styles.stepperButton, pressed && styles.stepperPressed]}
      >
        <SymbolView
          name="plus"
          size={15}
          weight="semibold"
          tintColor={value >= max ? 'rgba(255,255,255,0.3)' : 'white'}
        />
      </Pressable>
    </View>
  );
}

// iOS-style segmented control (dark appearance). Shows raw values like the
// Swift Picker (Text(gender.rawValue)).
function SegmentedControl<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: T[];
  selected: T;
  onSelect: (option: T) => void;
}) {
  return (
    <View style={styles.segmentedContainer}>
      {options.map((option) => {
        const isSelected = option === selected;
        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={[styles.segment, isSelected && styles.segmentSelected]}
          >
            <Text style={[styles.segmentText, isSelected && styles.segmentTextSelected]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    gap: 18,
  },
  ageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ageText: {
    fontSize: 17,
    color: colors.cream,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(118,118,128,0.24)',
    borderRadius: 9,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  stepperButton: {
    width: 47,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperPressed: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  stepperDivider: {
    width: StyleSheet.hairlineWidth,
    height: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(118,118,128,0.24)',
    borderRadius: 9,
    borderCurve: 'continuous',
    padding: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 7,
    borderCurve: 'continuous',
  },
  segmentSelected: {
    backgroundColor: '#636366',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: creamAlpha(0.85),
  },
  segmentTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
});
