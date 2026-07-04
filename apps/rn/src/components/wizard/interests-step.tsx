import { StyleSheet, View } from 'react-native';

import type { CharacterDraft } from './draft';
import { ChipFlow } from './chip-flow';
import { interestOptions } from './draft';
import { FieldLabel, WizardTextField } from './ui';

// Interests step: toggle chips + multiline "tell us more" note.
export function InterestsStep({
  draft,
  onChange,
}: {
  draft: CharacterDraft;
  onChange: (patch: Partial<CharacterDraft>) => void;
}) {
  const toggle = (option: string) => {
    onChange({
      interests: draft.interests.includes(option)
        ? draft.interests.filter((i) => i !== option)
        : [...draft.interests, option],
    });
  };

  return (
    <View style={styles.column}>
      <FieldLabel>Pick interests</FieldLabel>
      <ChipFlow
        options={interestOptions}
        isSelected={(option) => draft.interests.includes(option)}
        onTap={toggle}
      />

      <FieldLabel>Tell us more</FieldLabel>
      <WizardTextField
        large={false}
        placeholder="Anything else? e.g. loves dinosaurs"
        value={draft.extraInterestNote}
        onChangeText={(extraInterestNote) => onChange({ extraInterestNote })}
        multiline
        textAlignVertical="top"
        style={styles.note}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    gap: 18,
  },
  note: {
    minHeight: 140,
    paddingTop: 14,
  },
});
