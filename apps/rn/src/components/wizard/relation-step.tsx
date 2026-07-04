import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  relationDisplayNames,
  relationIcons,
  type CharacterRelation,
} from '@/api/models';
import { accentAlpha, colors, creamAlpha } from '@/theme/colors';
import type { CharacterDraft } from './draft';
import { FieldLabel, WizardTextField } from './ui';

const relations: CharacterRelation[] = [
  'parent',
  'grandparent',
  'friend',
  'pet',
  'sibling',
  'teacher',
  'imaginary',
  'other',
];

// Relationship step: 2-column grid of relation buttons; free-text field
// appears when "Other" is selected.
export function RelationStep({
  draft,
  onChange,
}: {
  draft: CharacterDraft;
  onChange: (patch: Partial<CharacterDraft>) => void;
}) {
  return (
    <View style={styles.column}>
      <FieldLabel>Choose a relation</FieldLabel>
      <View style={styles.grid}>
        {relations.map((relation) => {
          const isSelected = draft.relation === relation;
          return (
            <Pressable
              key={relation}
              onPress={() => {
                onChange(
                  isSelected
                    ? { relation: null }
                    : { relation, customRelation: '' },
                );
              }}
              style={[
                styles.cell,
                {
                  backgroundColor: isSelected ? colors.accent : creamAlpha(0.08),
                  borderWidth: isSelected ? 0 : 1,
                  borderColor: creamAlpha(0.15),
                },
              ]}
            >
              <View style={styles.cellIcon}>
                <SymbolView
                  name={relationIcons[relation] as never}
                  size={18}
                  weight="semibold"
                  tintColor={isSelected ? 'white' : colors.cream}
                />
              </View>
              <Text
                style={[styles.cellText, { color: isSelected ? 'white' : colors.cream }]}
                numberOfLines={1}
              >
                {relationDisplayNames[relation]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {draft.relation === 'other' ? (
        <WizardTextField
          large={false}
          placeholder="e.g. Mentor, Neighbour, Coach…"
          value={draft.customRelation}
          onChangeText={(customRelation) => onChange({ customRelation })}
          style={styles.customField}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    gap: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    borderCurve: 'continuous',
    // Two columns with a 12pt gap.
    flexBasis: '47%',
    flexGrow: 1,
  },
  cellIcon: {
    width: 28,
    alignItems: 'center',
  },
  cellText: {
    fontSize: 15,
    fontWeight: '500',
    flexShrink: 1,
  },
  customField: {
    borderColor: accentAlpha(0.4),
    borderRadius: 16,
  },
});
