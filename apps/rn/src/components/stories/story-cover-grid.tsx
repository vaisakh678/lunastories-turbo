import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import type { CoverIcon } from '@/api/models';
import { tintColor } from '@/api/models';
import { CharacterIcon } from '@/components/character-icon';

// StoryCoverGrid.swift ported: collages 1–4 cover icons (character avatars
// or SF symbols) into the cover square with 2pt gaps. Falls back to the
// single cover symbol on a tinted tile. Caller owns outer size + clipping.
export function StoryCoverGrid({
  icons,
  fallbackSymbol,
  tintName,
  glyphSize = 22,
}: {
  icons: CoverIcon[];
  fallbackSymbol: string;
  tintName: string;
  glyphSize?: number;
}) {
  const capped = icons.slice(0, 4);

  if (capped.length === 0) {
    const tint = tintColor(tintName);
    return (
      <View style={[styles.fill, styles.center, { backgroundColor: `${tint}2E` }]}>
        <SymbolView
          name={fallbackSymbol as never}
          size={glyphSize * 1.5}
          weight="semibold"
          tintColor={tint}
        />
      </View>
    );
  }

  const tile = (icon: CoverIcon, key: number) => (
    <View key={key} style={styles.tile}>
      <CharacterIcon
        symbolName={icon.symbolName}
        tintName={icon.tint}
        cornerRadius={0}
        glyphSize={glyphSize}
      />
    </View>
  );

  switch (capped.length) {
    case 1:
      return <View style={styles.fill}>{tile(capped[0], 0)}</View>;
    case 2:
      return <View style={[styles.fill, styles.row]}>{capped.map(tile)}</View>;
    case 3:
      return (
        <View style={[styles.fill, styles.row]}>
          {tile(capped[0], 0)}
          <View style={styles.column}>
            {tile(capped[1], 1)}
            {tile(capped[2], 2)}
          </View>
        </View>
      );
    default:
      return (
        <View style={[styles.fill, styles.column]}>
          <View style={styles.row}>
            {tile(capped[0], 0)}
            {tile(capped[1], 1)}
          </View>
          <View style={styles.row}>
            {tile(capped[2], 2)}
            {tile(capped[3], 3)}
          </View>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  fill: {
    width: '100%',
    height: '100%',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    gap: 2,
  },
  column: {
    flex: 1,
    flexDirection: 'column',
    gap: 2,
  },
  tile: {
    flex: 1,
    overflow: 'hidden',
  },
});
