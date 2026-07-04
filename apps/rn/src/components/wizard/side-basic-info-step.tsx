import { StyleSheet, View } from 'react-native';

import type { CharacterDraft } from './draft';
import { FieldLabel, WizardTextField } from './ui';

// Side-character Basic Info step: name only.
export function SideBasicInfoStep({
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
        placeholder="e.g. Grandma Rose"
        value={draft.name}
        onChangeText={(name) => onChange({ name })}
        autoCapitalize="words"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    gap: 18,
  },
});
