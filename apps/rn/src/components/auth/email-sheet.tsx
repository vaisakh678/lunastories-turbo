import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { accentAlpha, colors, creamAlpha } from '@/theme/colors';

// EmailSheet from SignInModal.swift: email field with envelope icon,
// Continue pill enabled once the address looks plausible.
export function EmailSheet({
  email,
  onChangeEmail,
  isLoading,
  onContinue,
  onClose,
}: {
  email: string;
  onChangeEmail: (value: string) => void;
  isLoading: boolean;
  onContinue: () => void;
  onClose: () => void;
}) {
  const trimmed = email.trim();
  const canContinue = !isLoading && trimmed.includes('@') && trimmed.includes('.');

  return (
    <View style={styles.container}>
      <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close" style={styles.close}>
        <SymbolView name="xmark" size={18} weight="semibold" tintColor={colors.cream} />
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.title}>Enter your email</Text>
        <Text style={styles.subtitle}>We'll send you a 6-digit code to sign in.</Text>
      </View>

      <View style={styles.inputRow}>
        <SymbolView name="envelope" size={20} tintColor={creamAlpha(0.45)} />
        <TextInput
          value={email}
          onChangeText={onChangeEmail}
          placeholder="Email address"
          placeholderTextColor={creamAlpha(0.45)}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => canContinue && onContinue()}
        />
      </View>

      <Pressable
        onPress={onContinue}
        disabled={!canContinue}
        style={({ pressed }) => [
          styles.cta,
          { opacity: canContinue || isLoading ? (pressed ? 0.85 : 1) : 0.7 },
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.ctaLabel}>Continue</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  close: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.cream,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    color: creamAlpha(0.7),
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 15,
    borderRadius: 12,
    borderCurve: 'continuous',
    backgroundColor: creamAlpha(0.08),
    borderWidth: 1.5,
    borderColor: creamAlpha(0.15),
    marginBottom: 14,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.cream,
    padding: 0,
  },
  cta: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: colors.accent,
    shadowColor: accentAlpha(0.2),
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    minHeight: 48,
  },
  ctaLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
