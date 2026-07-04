import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient as SvgRadialGradient, Stop } from 'react-native-svg';

import { useProfile, useUsage } from '@/api/usage';
import { GlassCard } from '@/components/account/glass-card';
import { MenuRow, SoftDivider } from '@/components/account/menu-row';
import { SubscriptionBanner } from '@/components/account/subscription-banner';
import { UsageMeters } from '@/components/account/usage-meters';
import { MoodyTwilightBackground } from '@/components/moody-twilight-background';
import { useToast } from '@/components/toast';
import { auth } from '@/services/auth';
import { useSubscriptions } from '@/services/subscriptions';
import { colors, creamAlpha } from '@/theme/colors';

// AccountView.swift ported: halo hero with app icon, greeting, subscription
// banner, glass menu list, logout card. PRO toolbar nudge when not Pro.
export default function AccountScreen() {
  const router = useRouter();
  const toast = useToast();
  const { data: profile } = useProfile();
  const { data: usage } = useUsage();
  const { isPro } = useSubscriptions();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const greeting = profile?.name ? `Hello, ${profile.name}` : 'Hello, Storyteller';

  const confirmLogout = () => {
    Alert.alert('Are you sure you want to logout?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          setIsLoggingOut(true);
          await auth.signOut();
          setIsLoggingOut(false);
          router.dismissAll();
        },
      },
    ]);
  };

  const manageSubscription = () => {
    // Native flow opens the App Store subscription sheet; needs a dev build.
    toast.show('Subscription management opens the App Store on device builds', {
      style: 'info',
    });
  };

  return (
    <View style={styles.root}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerTransparent: true,
          headerShadowVisible: false,
          headerTintColor: colors.cream,
          headerRight: () =>
            isPro ? null : (
              <Pressable onPress={() => router.push('/paywall')} accessibilityLabel="Upgrade to Pro">
                <Text style={styles.proBadge}>PRO</Text>
              </Pressable>
            ),
        }}
      />
      <MoodyTwilightBackground />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <View style={styles.haloWrap}>
            <Svg width={220} height={220} style={StyleSheet.absoluteFill}>
              <Defs>
                <SvgRadialGradient id="coralHalo" cx="50%" cy="50%" r="50%">
                  <Stop offset="0" stopColor={colors.glowCoral} stopOpacity={0.32} />
                  <Stop offset="1" stopColor={colors.glowCoral} stopOpacity={0} />
                </SvgRadialGradient>
                <SvgRadialGradient id="goldHalo" cx="50%" cy="50%" r="50%">
                  <Stop offset="0" stopColor={colors.glowGold} stopOpacity={0.28} />
                  <Stop offset="1" stopColor={colors.glowGold} stopOpacity={0} />
                </SvgRadialGradient>
              </Defs>
              <Circle cx={110} cy={110} r={100} fill="url(#coralHalo)" />
              <Circle cx={110} cy={110} r={70} fill="url(#goldHalo)" />
            </Svg>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.appIcon}
              contentFit="contain"
            />
          </View>
          <View style={styles.greetingBlock}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.subtitle}>Manage your profile</Text>
          </View>
        </View>

        <SubscriptionBanner
          isPro={isPro}
          onUpgrade={() => router.push('/paywall')}
          onManage={manageSubscription}
        />

        {usage ? <UsageMeters stories={usage.stories} audio={usage.audio} /> : null}

        <GlassCard>
          <MenuRow icon="book.fill" title="My Stories" onPress={() => router.push('/my-stories')} />
          <SoftDivider />
          <MenuRow icon="gearshape.fill" title="Settings" onPress={() => router.push('/settings')} />
          <SoftDivider />
          <MenuRow
            icon="gift.fill"
            title="Share and Earn"
            onPress={() => toast.show('Share and Earn is coming soon', { style: 'info' })}
          />
          <SoftDivider />
          <MenuRow icon="bubble.left.fill" title="Send Feedback" onPress={() => router.push('/feedback')} />
        </GlassCard>

        <GlassCard>
          <MenuRow
            icon="rectangle.portrait.and.arrow.right"
            title="Logout"
            tint="#FF453A"
            isLoading={isLoggingOut}
            onPress={confirmLogout}
          />
        </GlassCard>
      </ScrollView>
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
    paddingTop: 12,
    gap: 24,
    paddingBottom: 40,
  },
  proBadge: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.accent,
  },
  hero: {
    alignItems: 'center',
    gap: 14,
    paddingTop: 12,
  },
  haloWrap: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIcon: {
    width: 96,
    height: 96,
    borderRadius: 22,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: creamAlpha(0.12),
  },
  greetingBlock: {
    alignItems: 'center',
    gap: 4,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.cream,
  },
  subtitle: {
    fontSize: 15,
    color: creamAlpha(0.6),
  },
});
