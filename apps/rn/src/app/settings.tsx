import Constants from 'expo-constants';
import { Stack, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { MoodyTwilightBackground } from '@/components/moody-twilight-background';
import { useToast } from '@/components/toast';
import { LegalLinks, openLegalLink } from '@/lib/legal-links';
import { auth } from '@/services/auth';
import { colors, creamAlpha } from '@/theme/colors';

// SettingsView.swift ported: grouped sections over the twilight background.
// The iOS Form's inset-grouped look is recreated with glass section cards.
// Pickers are rendered as chip rows (native wheel pickers need a dev build);
// the bedtime time picker is approximated with preset chips.

const SLEEP_TIMERS = ['Off', '10 min', '20 min', '30 min'] as const;
const VOICES = ['Shimmer · soft', 'Coral · bright', 'Fable · storyteller', 'Sage · calm'] as const;
const SPEEDS = ['Slower', 'Normal'] as const;
const REMINDER_TIMES = ['7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'] as const;

export default function SettingsScreen() {
  const router = useRouter();
  const toast = useToast();

  const [sleepTimer, setSleepTimer] = useState<string>('Off');
  const [voice, setVoice] = useState<string>(VOICES[0]);
  const [speed, setSpeed] = useState<string>('Normal');
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState<string>('8:00 PM');
  const [isDeleting, setIsDeleting] = useState(false);

  const appVersion = `${Constants.expoConfig?.version ?? '1.0.0'}`;

  const manageSubscription = () => {
    toast.show('Opens the App Store subscription sheet on device builds', { style: 'info' });
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete account?',
      'Your account, characters, and stories will be removed permanently.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            await new Promise((r) => setTimeout(r, 1200));
            await auth.signOut();
            setIsDeleting(false);
            router.dismissAll();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Settings',
          headerTransparent: true,
          headerShadowVisible: false,
          headerTintColor: colors.cream,
          headerTitleStyle: { color: colors.cream },
        }}
      />
      <MoodyTwilightBackground />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <Section header="Audio & Playback">
          <ChipSettingRow label="Sleep timer" options={SLEEP_TIMERS} value={sleepTimer} onChange={setSleepTimer} />
          <SoftDivider />
          <ChipSettingRow label="Narrator voice" options={VOICES} value={voice} onChange={setVoice} />
          <SoftDivider />
          <ChipSettingRow label="Narration speed" options={SPEEDS} value={speed} onChange={setSpeed} segmented />
        </Section>

        <Section
          header="Notifications"
          footer="We'll send a gentle nudge so you never miss story time."
        >
          <View style={styles.toggleRow}>
            <Text style={styles.rowTitle}>Daily bedtime reminder</Text>
            <Switch
              value={remindersEnabled}
              onValueChange={setRemindersEnabled}
              trackColor={{ true: colors.accent }}
            />
          </View>
          {remindersEnabled ? (
            <>
              <SoftDivider />
              <ChipSettingRow
                label="Remind me at"
                options={REMINDER_TIMES}
                value={reminderTime}
                onChange={setReminderTime}
              />
            </>
          ) : null}
        </Section>

        <Section
          header="Subscription"
          footer="Opens the App Store to cancel, change plan, or restore your subscription."
        >
          <LinkRow icon="creditcard" title="Manage Subscription" onPress={manageSubscription} />
        </Section>

        <Section header="About">
          <LinkRow icon="doc.text" title="Terms of Service" onPress={() => openLegalLink(LegalLinks.termsURL)} />
          <SoftDivider />
          <LinkRow icon="hand.raised" title="Privacy Policy" onPress={() => openLegalLink(LegalLinks.privacyURL)} />
          <SoftDivider />
          <View style={styles.toggleRow}>
            <View style={styles.rowLabel}>
              <SymbolView name="info.circle" size={17} tintColor={colors.accent} />
              <Text style={styles.rowTitle}>Version</Text>
            </View>
            <Text style={styles.versionText}>{appVersion}</Text>
          </View>
        </Section>

        <Section
          header="Danger zone"
          footer="This permanently deletes your account, characters, and stories. This cannot be undone."
        >
          <Pressable onPress={confirmDelete} disabled={isDeleting} style={styles.toggleRow}>
            <View style={styles.rowLabel}>
              <SymbolView name="trash" size={17} tintColor="#FF453A" />
              <Text style={[styles.rowTitle, { color: '#FF453A' }]}>Delete Account</Text>
            </View>
          </Pressable>
        </Section>
      </ScrollView>

      {isDeleting ? (
        <View style={styles.deletingOverlay}>
          <View style={styles.deletingCard}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.deletingText}>Deleting account…</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function Section({
  header,
  footer,
  children,
}: {
  header: string;
  footer?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>{header.toUpperCase()}</Text>
      <View style={styles.sectionCard}>{children}</View>
      {footer ? <Text style={styles.sectionFooter}>{footer}</Text> : null}
    </View>
  );
}

function SoftDivider() {
  return <View style={styles.divider} />;
}

function LinkRow({ icon, title, onPress }: { icon: string; title: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.toggleRow}>
      <View style={styles.rowLabel}>
        <SymbolView name={icon as never} size={17} tintColor={colors.accent} />
        <Text style={styles.rowTitle}>{title}</Text>
      </View>
      <SymbolView name="chevron.right" size={12} weight="semibold" tintColor={creamAlpha(0.35)} />
    </Pressable>
  );
}

function ChipSettingRow({
  label,
  options,
  value,
  onChange,
  segmented,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  segmented?: boolean;
}) {
  return (
    <View style={styles.chipRow}>
      <Text style={styles.rowTitle}>{label}</Text>
      <View style={[styles.chips, segmented && styles.chipsSegmented]}>
        {options.map((opt) => {
          const selected = opt === value;
          return (
            <Pressable
              key={opt}
              onPress={() => onChange(opt)}
              style={[
                styles.chip,
                segmented && styles.chipSegmented,
                { backgroundColor: selected ? colors.accent : creamAlpha(0.08) },
              ]}
            >
              <Text style={[styles.chipText, { color: selected ? 'white' : creamAlpha(0.75) }]}>
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.twilightBottom,
  },
  content: {
    padding: 16,
    gap: 24,
    paddingBottom: 48,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    fontSize: 13,
    color: creamAlpha(0.55),
    paddingHorizontal: 16,
  },
  sectionCard: {
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: creamAlpha(0.06),
    borderWidth: 1,
    borderColor: creamAlpha(0.08),
    paddingHorizontal: 16,
  },
  sectionFooter: {
    fontSize: 13,
    color: creamAlpha(0.45),
    paddingHorizontal: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    minHeight: 46,
  },
  rowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowTitle: {
    fontSize: 17,
    color: colors.cream,
  },
  versionText: {
    fontSize: 17,
    color: creamAlpha(0.55),
  },
  chipRow: {
    paddingVertical: 13,
    gap: 10,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipsSegmented: {
    flexWrap: 'nowrap',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  chipSegmented: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 9,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: creamAlpha(0.12),
  },
  deletingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deletingCard: {
    alignItems: 'center',
    gap: 14,
    padding: 28,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  deletingText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'white',
  },
});
