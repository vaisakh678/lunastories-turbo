import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { avatarSources, isAvatarId, tintColor } from '@/api/models';

// CharacterIconView.swift ported: bundled avatar image when symbolName is
// a UUID, otherwise the SF Symbol on a tinted background. Same square
// footprint either way so callers can swap freely.
export function CharacterIcon({
  symbolName,
  tintName,
  cornerRadius,
  glyphSize,
  style,
}: {
  symbolName: string;
  tintName: string;
  cornerRadius: number;
  glyphSize: number;
  style?: object;
}) {
  const tint = tintColor(tintName);
  if (isAvatarId(symbolName) && avatarSources[symbolName]) {
    return (
      <Image
        source={avatarSources[symbolName]}
        style={[styles.fill, { borderRadius: cornerRadius }, style]}
        contentFit="cover"
      />
    );
  }
  return (
    <View
      style={[
        styles.fill,
        styles.center,
        { borderRadius: cornerRadius, backgroundColor: `${tint}2E` },
        style,
      ]}
    >
      <SymbolView name={symbolName as never} size={glyphSize} weight="semibold" tintColor={tint} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    width: '100%',
    height: '100%',
    borderCurve: 'continuous',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
