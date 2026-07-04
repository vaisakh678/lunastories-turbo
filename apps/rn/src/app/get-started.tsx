import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthSheet } from '@/components/auth/auth-sheet';
import { EmailSheet } from '@/components/auth/email-sheet';
import { OnboardingCarousel } from '@/components/auth/onboarding-carousel';
import { OtpSheet } from '@/components/auth/otp-sheet';
import { ProviderSheet, type LoadingProvider, type ProviderMode } from '@/components/auth/provider-sheet';
import { MoodyTwilightBackground } from '@/components/moody-twilight-background';
import { useToast } from '@/components/toast';
import { auth, useAuth } from '@/services/auth';
import { colors, creamAlpha } from '@/theme/colors';

// GetStartedView.swift ported. Flow mirrors the iOS AuthFlowModel:
// welcome → (Get Started) onboarding carousel → provider sheet (sign up)
//         → (Sign in link) provider sheet (sign in)
// providers → email → otp; any successful auth routes to Home.
type SheetStep = null | 'providers' | 'email' | 'otp';

export default function GetStartedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { isSignedIn } = useAuth();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [sheet, setSheet] = useState<SheetStep>(null);
  const [mode, setMode] = useState<ProviderMode>('signIn');
  const [loadingProvider, setLoadingProvider] = useState<LoadingProvider>(null);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      router.replace('/');
    }
  }, [isSignedIn, router]);

  const handleApple = async () => {
    setLoadingProvider('apple');
    try {
      await auth.signInWithApple();
    } catch (e) {
      toast.show((e as Error).message);
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleGoogle = async () => {
    setLoadingProvider('google');
    try {
      await auth.signInWithGoogle();
    } catch (e) {
      toast.show((e as Error).message);
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleEmailContinue = async () => {
    setIsLoading(true);
    try {
      await auth.sendEmailCode(email.trim());
      setSheet('otp');
    } catch (e) {
      toast.show((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (code: string) => {
    setIsLoading(true);
    try {
      await auth.verifyEmailCode(code);
      setSheet(null);
    } catch (e) {
      toast.show((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <MoodyTwilightBackground />

      {showOnboarding ? (
        <OnboardingCarousel
          onBack={() => setShowOnboarding(false)}
          onFinish={() => {
            setShowOnboarding(false);
            setMode('signUp');
            setSheet('providers');
          }}
        />
      ) : (
        <View style={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.hero}>
            <Image
              source={require('../../assets/onboarding/onboarding_0.png')}
              style={styles.heroImage}
              contentFit="cover"
            />
            <View style={styles.heroText}>
              <Text style={styles.title}>Welcome to Luna Stories</Text>
              <Text style={styles.subtitle}>
                Your story begins here.{'\n'}Let's explore together.
              </Text>
            </View>
          </View>

          <View style={styles.ctaColumn}>
            <Pressable
              onPress={() => setShowOnboarding(true)}
              style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.ctaLabel}>Get Started</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setMode('signIn');
                setSheet('providers');
              }}
              hitSlop={8}
            >
              <Text style={styles.signInRow}>
                <Text style={styles.signInHint}>Already have an account? </Text>
                <Text style={styles.signInLink}>Sign in</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      <AuthSheet visible={sheet === 'providers'} onDismiss={() => setSheet(null)}>
        <ProviderSheet
          mode={mode}
          loadingProvider={loadingProvider}
          onApple={handleApple}
          onGoogle={handleGoogle}
          onEmail={() => setSheet('email')}
          onClose={() => setSheet(null)}
        />
      </AuthSheet>

      <AuthSheet visible={sheet === 'email'} onDismiss={() => setSheet(null)}>
        <EmailSheet
          email={email}
          onChangeEmail={setEmail}
          isLoading={isLoading}
          onContinue={handleEmailContinue}
          onClose={() => setSheet(null)}
        />
      </AuthSheet>

      <AuthSheet visible={sheet === 'otp'} onDismiss={() => setSheet(null)}>
        <OtpSheet
          email={email.trim()}
          isLoading={isLoading}
          onVerify={handleVerify}
          onClose={() => setSheet(null)}
        />
      </AuthSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.twilightBottom,
  },
  content: {
    flex: 1,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: 220,
    height: 300,
    borderRadius: 40,
    borderCurve: 'continuous',
  },
  heroText: {
    gap: 12,
    paddingTop: 32,
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.cream,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 25,
    color: creamAlpha(0.7),
    textAlign: 'center',
  },
  ctaColumn: {
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 28,
    alignItems: 'stretch',
  },
  cta: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  ctaLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
  },
  signInRow: {
    textAlign: 'center',
    fontSize: 15,
  },
  signInHint: {
    color: creamAlpha(0.7),
  },
  signInLink: {
    color: colors.accent,
    fontWeight: '600',
  },
});
