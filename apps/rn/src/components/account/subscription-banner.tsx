import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { accentAlpha, colors, creamAlpha } from '@/theme/colors';

// SubscriptionBanner from AccountView.swift: 44pt tinted icon chip,
// headline + caption, trailing "Upgrade"/"Manage" text.
export function SubscriptionBanner({
  isPro,
  onUpgrade,
  onManage,
}: {
  isPro: boolean;
  onUpgrade: () => void;
  onManage: () => void;
}) {
  return (
    <Pressable
      onPress={isPro ? onManage : onUpgrade}
      style={({ pressed }) => [
        styles.banner,
        { borderColor: isPro ? accentAlpha(0.35) : creamAlpha(0.08) },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={styles.chip}>
        <SymbolView
          name={(isPro ? 'crown.fill' : 'sparkles') as never}
          size={18}
          weight="semibold"
          tintColor={colors.accent}
        />
      </View>
      <View style={styles.textColumn}>
        <Text style={styles.title}>{isPro ? 'Luna Pro' : 'Unlock Luna Pro'}</Text>
        <Text style={styles.caption}>
          {isPro ? 'Your subscription is active' : 'Unlimited stories & narration'}
        </Text>
      </View>
      <Text style={[styles.action, { color: isPro ? creamAlpha(0.9) : colors.accent }]}>
        {isPro ? 'Manage' : 'Upgrade'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: creamAlpha(0.06),
    borderWidth: 1,
  },
  chip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderCurve: 'continuous',
    backgroundColor: accentAlpha(0.18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.cream,
  },
  caption: {
    fontSize: 12,
    color: creamAlpha(0.7),
  },
  action: {
    fontSize: 15,
    fontWeight: '600',
  },
});
