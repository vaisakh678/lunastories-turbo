import { Stack, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { MoodyTwilightBackground } from '@/components/moody-twilight-background';
import { colors, creamAlpha } from '@/theme/colors';

// FeedbackView.swift ported: category chips, multiline message box, optional
// star rating, capsule submit, and the green-check success state. Submission
// is mocked (delay → success) until the real FeedbackAPI is wired.

const CATEGORIES = [
  { key: 'bug', label: 'Bug', symbol: 'ant.fill' },
  { key: 'idea', label: 'Idea', symbol: 'lightbulb.fill' },
  { key: 'praise', label: 'Praise', symbol: 'heart.fill' },
  { key: 'other', label: 'Other', symbol: 'ellipsis.circle.fill' },
] as const;

export default function FeedbackScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<string>('idea');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [didSubmit, setDidSubmit] = useState(false);

  const canSubmit = !isSubmitting && message.trim().length > 0;

  const submit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSubmitting(false);
    setDidSubmit(true);
  };

  return (
    <View style={styles.root}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Send Feedback',
          headerTransparent: true,
          headerShadowVisible: false,
          headerTintColor: colors.cream,
          headerTitleStyle: { color: colors.cream },
        }}
      />
      <MoodyTwilightBackground />

      {didSubmit ? (
        <View style={styles.success}>
          <View style={styles.successArt}>
            <View style={styles.successCircle} />
            <SymbolView name="checkmark" size={60} weight="semibold" tintColor="#30D158" />
          </View>
          <View style={styles.successTextBlock}>
            <Text style={styles.successTitle}>Thanks for the note!</Text>
            <Text style={styles.successSubtitle}>
              We read every message — your feedback helps make Luna Stories better.
            </Text>
          </View>
          <View style={styles.successSpacer} />
          <Pressable onPress={() => router.back()} style={styles.doneButton}>
            <Text style={styles.doneLabel}>Done</Text>
          </Pressable>
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.block}>
              <Text style={styles.sectionLabel}>What's this about?</Text>
              <View style={styles.chips}>
                {CATEGORIES.map((c) => {
                  const selected = category === c.key;
                  return (
                    <Pressable
                      key={c.key}
                      onPress={() => setCategory(c.key)}
                      style={[
                        styles.chip,
                        { backgroundColor: selected ? colors.accent : 'rgba(240,106,74,0.12)' },
                      ]}
                    >
                      <SymbolView
                        name={c.symbol as never}
                        size={12}
                        weight="semibold"
                        tintColor={selected ? 'white' : colors.accent}
                      />
                      <Text
                        style={[styles.chipLabel, { color: selected ? 'white' : colors.accent }]}
                      >
                        {c.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.block}>
              <Text style={styles.sectionLabel}>Your feedback</Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Tell us what's on your mind…"
                placeholderTextColor={creamAlpha(0.4)}
                multiline
                style={styles.input}
              />
            </View>

            <View style={styles.block}>
              <Text style={styles.sectionLabel}>Rate your experience (optional)</Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Pressable
                    key={i}
                    onPress={() => setRating(rating === i ? 0 : i)}
                    accessibilityLabel={`${i} star${i === 1 ? '' : 's'}`}
                  >
                    <SymbolView
                      name={i <= rating ? 'star.fill' : 'star'}
                      size={22}
                      tintColor={i <= rating ? '#FFD60A' : 'rgba(142,142,147,0.4)'}
                    />
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              onPress={submit}
              disabled={!canSubmit}
              style={[
                styles.submit,
                { backgroundColor: canSubmit ? colors.accent : 'rgba(142,142,147,0.4)' },
              ]}
            >
              {isSubmitting ? <ActivityIndicator size="small" color="white" /> : null}
              <Text style={styles.submitLabel}>
                {isSubmitting ? 'Sending…' : 'Send Feedback'}
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.twilightBottom,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  block: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: creamAlpha(0.6),
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  input: {
    minHeight: 160,
    padding: 14,
    paddingTop: 14,
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: creamAlpha(0.08),
    borderWidth: 1,
    borderColor: creamAlpha(0.18),
    fontSize: 17,
    color: colors.cream,
    textAlignVertical: 'top',
  },
  stars: {
    flexDirection: 'row',
    gap: 12,
  },
  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 999,
  },
  submitLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
  },
  success: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 20,
  },
  successArt: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(48,209,88,0.18)',
  },
  successTextBlock: {
    alignItems: 'center',
    gap: 10,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.cream,
  },
  successSubtitle: {
    fontSize: 15,
    color: creamAlpha(0.6),
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  successSpacer: {
    height: 40,
  },
  doneButton: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  doneLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
  },
});
