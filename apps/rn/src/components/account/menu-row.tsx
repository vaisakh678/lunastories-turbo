import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, creamAlpha } from '@/theme/colors';

// MenuRowLabel from AccountView.swift: tinted icon chip (32pt, radius 9),
// body title, trailing chevron (or spinner while loading).
export function MenuRow({
  icon,
  title,
  tint,
  isLoading,
  onPress,
}: {
  icon: string;
  title: string;
  /** Row text color; icon chip tints to match. Defaults to cream/accent. */
  tint?: string;
  isLoading?: boolean;
  onPress: () => void;
}) {
  const iconTint = tint ?? colors.accent;
  const textColor = tint ?? colors.cream;
  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.chip, { backgroundColor: `${iconTint}2E` }]}>
        <SymbolView name={icon as never} size={15} weight="semibold" tintColor={iconTint} />
      </View>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      <View style={styles.spacer} />
      {isLoading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <SymbolView name="chevron.right" size={13} tintColor={creamAlpha(0.35)} />
      )}
    </Pressable>
  );
}

export function SoftDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pressed: {
    backgroundColor: creamAlpha(0.04),
  },
  chip: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
  },
  spacer: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: creamAlpha(0.08),
    marginLeft: 62,
  },
});
