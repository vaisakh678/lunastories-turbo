import { StyleSheet, View } from 'react-native';

import type { CharacterDraft } from './draft';
import { ChipFlow } from './chip-flow';
import { ColorChipRow } from './color-chip-row';
import { eyeColorOptions, hairColorOptions, hairstyleOptions } from './draft';
import { FieldLabel } from './ui';

// Appearance step: hair color, eye color, hairstyle.
export function AppearanceStep({
  draft,
  onChange,
}: {
  draft: CharacterDraft;
  onChange: (patch: Partial<CharacterDraft>) => void;
}) {
  return (
    <View style={styles.column}>
      <View style={styles.group}>
        <FieldLabel>Hair color</FieldLabel>
        <ColorChipRow
          options={hairColorOptions}
          selectedName={draft.hairColor}
          onSelect={(hairColor) => onChange({ hairColor })}
        />
      </View>

      <View style={styles.group}>
        <FieldLabel>Eye color</FieldLabel>
        <ColorChipRow
          options={eyeColorOptions}
          selectedName={draft.eyeColor}
          onSelect={(eyeColor) => onChange({ eyeColor })}
        />
      </View>

      <View style={styles.group}>
        <FieldLabel>Hairstyle</FieldLabel>
        <ChipFlow
          options={hairstyleOptions}
          isSelected={(option) => draft.hairstyle === option}
          onTap={(option) =>
            onChange({ hairstyle: draft.hairstyle === option ? null : option })
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    gap: 22,
  },
  group: {
    gap: 10,
  },
});
