import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { accentAlpha, colors, creamAlpha } from '@/theme/colors';

// OtpSheet from SignInModal.swift: envelope badge, 6-digit code field
// (digits only), Verify pill, resend link with confirmation alert.
export function OtpSheet({
  email,
  isLoading,
  onVerify,
  onClose,
}: {
  email: string;
  isLoading: boolean;
  onVerify: (code: string) => void;
  onClose: () => void;
}) {
  const [code, setCode] = useState('');
  const canVerify = !isLoading && code.length === 6;

  const handleChange = (value: string) => {
    setCode(value.replace(/\D/g, '').slice(0, 6));
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close" style={styles.close}>
        <SymbolView name="xmark" size={18} weight="semibold" tintColor={colors.cream} />
      </Pressable>

      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <SymbolView name="envelope" size={26} tintColor={colors.accent} />
        </View>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to <Text style={styles.emailText}>{email}</Text>
        </Text>
      </View>

      <View style={styles.inputRow}>
        <SymbolView name="circle.grid.3x3" size={20} tintColor={creamAlpha(0.45)} />
        <TextInput
          value={code}
          onChangeText={handleChange}
          placeholder="Enter 6-digit code"
          placeholderTextColor={creamAlpha(0.45)}
          style={styles.input}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          returnKeyType="done"
          onSubmitEditing={() => canVerify && onVerify(code)}
        />
      </View>

      <Pressable
        onPress={() => onVerify(code)}
        disabled={!canVerify}
        style={({ pressed }) => [
          styles.cta,
          { opacity: canVerify || isLoading ? (pressed ? 0.85 : 1) : 0.7 },
        ]}
      >
        {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.ctaLabel}>Verify</Text>}
      </Pressable>

      <Pressable
        onPress={() =>
          Alert.alert('Code sent', 'A new code has been sent to your email.', [{ text: 'OK' }])
        }
        style={styles.resend}
      >
        <Text style={styles.resendText}>
          Didn't receive a code? <Text style={styles.resendLink}>Resend</Text>
        </Text>
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
    marginBottom: 24,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: accentAlpha(0.18),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.cream,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    color: creamAlpha(0.7),
    textAlign: 'center',
  },
  emailText: {
    color: colors.cream,
    fontWeight: '600',
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
  resend: {
    alignItems: 'center',
    paddingTop: 14,
  },
  resendText: {
    fontSize: 14,
    color: creamAlpha(0.7),
  },
  resendLink: {
    color: colors.accent,
    fontWeight: '600',
  },
});
