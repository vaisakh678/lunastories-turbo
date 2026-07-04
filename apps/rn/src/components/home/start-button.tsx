import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/colors';

// StartButton from HomeView.swift: always the active accent capsule
// (never a disabled gray) — the empty-selection case is handled by the
// caller with a toast instead.
export function StartButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Text style={styles.label}>Start</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
  },
});
