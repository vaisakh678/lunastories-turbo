import { SymbolView } from 'expo-symbols';
import React from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { LegalLinks } from '@/lib/legal-links';
import { colors, creamAlpha } from '@/theme/colors';
import { GoogleLogo } from './google-logo';

// ProviderSheet from SignInModal.swift: Apple (black pill), Google +
// Email (cream-glass pills), "or" divider, terms footer.

export type ProviderMode = 'signIn' | 'signUp';
export type LoadingProvider = 'apple' | 'google' | null;

const modeCopy: Record<ProviderMode, { title: string; subtitle: string }> = {
  signIn: {
    title: 'Welcome Back',
    subtitle: 'Sign in to access your stories\nand keep the magic going.',
  },
  signUp: {
    title: 'Get Started',
    subtitle: 'Continue to sign up and start\nbuilding your bedtime stories.',
  },
};

export function ProviderSheet({
  mode,
  loadingProvider,
  onApple,
  onGoogle,
  onEmail,
  onClose,
}: {
  mode: ProviderMode;
  loadingProvider: LoadingProvider;
  onApple: () => void;
  onGoogle: () => void;
  onEmail: () => void;
  onClose: () => void;
}) {
  const disabled = loadingProvider !== null;
  return (
    <View style={styles.container}>
      <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close" style={styles.close}>
        <SymbolView name="xmark" size={18} weight="semibold" tintColor={colors.cream} />
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.title}>{modeCopy[mode].title}</Text>
        <Text style={styles.subtitle}>{modeCopy[mode].subtitle}</Text>
      </View>

      <ProviderButton
        label="Continue with Apple"
        background="#000000"
        foreground="#FFFFFF"
        icon={<SymbolView name="applelogo" size={18} tintColor="#FFFFFF" />}
        loading={loadingProvider === 'apple'}
        spinnerColor="#FFFFFF"
        disabled={disabled}
        onPress={onApple}
        style={{ marginBottom: 12 }}
      />

      <ProviderButton
        label="Continue with Google"
        background={creamAlpha(0.1)}
        foreground={colors.cream}
        icon={<GoogleLogo size={20} />}
        loading={loadingProvider === 'google'}
        spinnerColor={colors.cream}
        disabled={disabled}
        onPress={onGoogle}
      />

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <ProviderButton
        label="Continue with Email"
        background={creamAlpha(0.1)}
        foreground={colors.cream}
        icon={<SymbolView name="envelope.fill" size={16} tintColor={colors.cream} />}
        disabled={disabled}
        onPress={onEmail}
      />

      <Text style={styles.terms}>
        By continuing you agree to Luna Stories's{' '}
        <Text style={styles.termsLink} onPress={() => Linking.openURL(LegalLinks.termsURL)}>
          Terms & Conditions
        </Text>{' '}
        and{' '}
        <Text style={styles.termsLink} onPress={() => Linking.openURL(LegalLinks.privacyURL)}>
          Privacy Policy
        </Text>
      </Text>
    </View>
  );
}

function ProviderButton({
  label,
  background,
  foreground,
  icon,
  loading = false,
  spinnerColor,
  disabled = false,
  onPress,
  style,
}: {
  label: string;
  background: string;
  foreground: string;
  icon: React.ReactNode;
  loading?: boolean;
  spinnerColor?: string;
  disabled?: boolean;
  onPress: () => void;
  style?: object;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.providerButton,
        { backgroundColor: background },
        pressed && !disabled && { opacity: 0.85 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} style={styles.providerIcon} />
      ) : (
        <View style={styles.providerIcon}>{icon}</View>
      )}
      <Text style={[styles.providerLabel, { color: foreground }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },
  close: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
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
  providerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 999,
  },
  providerIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: creamAlpha(0.15),
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '500',
    color: creamAlpha(0.45),
  },
  terms: {
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 8,
    fontSize: 13,
    lineHeight: 18,
    color: creamAlpha(0.7),
    textAlign: 'center',
  },
  termsLink: {
    color: colors.accent,
  },
});
