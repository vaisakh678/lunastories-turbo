import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { creamAlpha } from '@/theme/colors';

// The rounded-16 "glass list" container used across AccountView:
// cream 6% fill + cream 8% hairline border, continuous corners.
export function GlassCard({
  children,
  style,
  borderColor,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  borderColor?: string;
}) {
  return (
    <View style={[styles.card, borderColor ? { borderColor } : null, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: creamAlpha(0.06),
    borderWidth: 1,
    borderColor: creamAlpha(0.08),
    overflow: 'hidden',
  },
});
