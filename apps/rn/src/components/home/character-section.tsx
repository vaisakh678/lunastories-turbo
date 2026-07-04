import { StyleSheet, Text, View } from 'react-native';

import type { Character, CharacterRole } from '@/api/characters';
import { colors } from '@/theme/colors';
import { AddCharacterTile } from './add-character-tile';
import { CharacterCard } from './character-card';

const sectionTitles: Record<CharacterRole, string> = {
  main: 'Main Characters',
  side: 'Side Characters',
};

// CharacterSection from HomeView.swift: bold title2 header, 3-column grid
// (12pt column gap, 20pt row gap), cards then a trailing add-tile.
export function CharacterSection({
  role,
  characters,
  selectedIds,
  onToggle,
  onAdd,
}: {
  role: CharacterRole;
  characters: Character[];
  selectedIds: Set<string>;
  onToggle: (character: Character) => void;
  onAdd: () => void;
}) {
  // Chunk cards + add tile into rows of 3, padding the last row with
  // spacers so cells keep equal width (flex: 1 each).
  const cells: Array<Character | 'add'> = [...characters, 'add'];
  const rows: Array<Array<Character | 'add' | null>> = [];
  for (let i = 0; i < cells.length; i += 3) {
    const row: Array<Character | 'add' | null> = cells.slice(i, i + 3);
    while (row.length < 3) row.push(null);
    rows.push(row);
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{sectionTitles[role]}</Text>
      <View style={styles.grid}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, cellIndex) => {
              if (cell === null) return <View key={cellIndex} style={styles.spacer} />;
              if (cell === 'add') {
                return (
                  <AddCharacterTile
                    key="add"
                    onPress={onAdd}
                    accessibilityLabel={`Add ${sectionTitles[role]}`}
                  />
                );
              }
              return (
                <CharacterCard
                  key={cell.id}
                  character={cell}
                  isSelected={selectedIds.has(cell.id)}
                  onPress={() => onToggle(cell)}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.cream,
  },
  grid: {
    gap: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  spacer: {
    flex: 1,
  },
});
