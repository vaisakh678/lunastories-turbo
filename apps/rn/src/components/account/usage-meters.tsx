import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import type { GenerationUsage } from '@/api/models';
import { colors, creamAlpha } from '@/theme/colors';
import { GlassCard } from './glass-card';

// Weekly usage meters (stories + audio) shown on the Account screen,
// styled after the app's glass cards and toast progress bars.
export function UsageMeters({
  stories,
  audio,
}: {
  stories: GenerationUsage;
  audio: GenerationUsage;
}) {
  return (
    <GlassCard style={styles.card}>
      <Text style={styles.header}>THIS WEEK</Text>
      <MeterRow icon="book.fill" label="Stories" usage={stories} />
      <MeterRow icon="headphones" label="Audio narrations" usage={audio} />
    </GlassCard>
  );
}

function MeterRow({
  icon,
  label,
  usage,
}: {
  icon: string;
  label: string;
  usage: GenerationUsage;
}) {
  const fraction = Math.min(Math.max(usage.percentUsed / 100, 0), 1);
  const tint = usage.percentUsed >= 80 ? colors.toastWarning : colors.accent;
  return (
    <View style={styles.row}>
      <SymbolView name={icon as never} size={15} weight="semibold" tintColor={tint} />
      <View style={styles.meterColumn}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.count}>
            {usage.used} / {usage.total}
          </Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${fraction * 100}%`, backgroundColor: tint }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: 14,
  },
  header: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: creamAlpha(0.5),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  meterColumn: {
    flex: 1,
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.cream,
  },
  count: {
    fontSize: 12,
    color: creamAlpha(0.6),
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: creamAlpha(0.15),
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
