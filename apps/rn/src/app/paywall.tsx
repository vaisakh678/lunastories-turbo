import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MoodyTwilightBackground } from '@/components/moody-twilight-background';
import { useToast } from '@/components/toast';
import { legalLinks, openLegalLink } from '@/lib/legal-links';
import {
  subscriptions,
  useSubscriptions,
  type SubscriptionPackage,
} from '@/services/subscriptions';
import { accentAlpha, colors, creamAlpha } from '@/theme/colors';

// PaywallView.swift ported: hero with glowing app icon, PRO gradient badge,
// features list, plan cards, gold→coral gradient CTA with trial-aware copy,
// restore/legal row, and the "Welcome to Luna Pro ✨" success overlay.

const FEATURES = [
  {
    icon: 'infinity',
    title: 'Unlimited stories',
    detail: 'Generate a fresh tale every single night, never the same twice.',
  },
  {
    icon: 'headphones',
    title: '10 audio narrations a week',
    detail: 'Soothing AI voice, ready in under a minute.',
  },
  {
    icon: 'books.vertical.fill',
    title: 'Every story world',
    detail: 'Alice, Oz, Jungle Book, Inventors, Construction, and more.',
  },
  {
    icon: 'heart.fill',
    title: 'Lessons that stick',
    detail: 'Pick a moral and Luna weaves it gently into the story.',
  },
  {
    icon: 'rectangle.dashed.badge.record',
    title: 'No ads, ever',
    detail: 'Just stories. Designed for bedtime, not for engagement metrics.',
  },
] as const;

export default function PaywallScreen() {
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { packages, trialEligibility } = useSubscriptions();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [didSucceed, setDidSucceed] = useState(false);

  const selected: SubscriptionPackage | undefined =
    packages.find((p) => p.identifier === selectedId) ?? packages[0];

  useEffect(() => {
    if (!selectedId && packages.length) setSelectedId(packages[0].identifier);
  }, [packages, selectedId]);

  const trialFor = (pkg: SubscriptionPackage): number | undefined =>
    pkg.trialDays && trialEligibility[pkg.identifier] !== false ? pkg.trialDays : undefined;

  const ctaLabel = (() => {
    if (!selected) return 'Continue';
    const trial = trialFor(selected);
    return trial ? `Start ${trial}-day free trial` : 'Continue';
  })();

  const footerText = (() => {
    if (!selected) return 'Cancel anytime.';
    const trial = trialFor(selected);
    if (trial) {
      return `Free for ${trial} days, then ${selected.priceString}${selected.periodUnit}. Cancel anytime.`;
    }
    return `Then ${selected.priceString}${selected.periodUnit}. Cancel anytime.`;
  })();

  const purchase = async () => {
    if (!selected || isPurchasing) return;
    setIsPurchasing(true);
    try {
      const purchased = await subscriptions.purchase(selected);
      if (purchased) {
        setDidSucceed(true);
        setTimeout(() => router.back(), 1400);
      }
    } catch (e) {
      toast.show((e as Error).message, { title: "Couldn't complete the purchase" });
    } finally {
      setIsPurchasing(false);
    }
  };

  const restore = async () => {
    setIsRestoring(true);
    try {
      const restored = await subscriptions.restore();
      if (restored) {
        setDidSucceed(true);
        setTimeout(() => router.back(), 1400);
      } else {
        toast.show('No active Pro subscription found on this Apple ID.');
      }
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <MoodyTwilightBackground />

      <Pressable
        onPress={() => router.back()}
        accessibilityLabel="Close"
        style={[styles.close, { top: insets.top + 10 }]}
      >
        <SymbolView name="xmark" size={15} weight="semibold" tintColor={colors.cream} />
      </Pressable>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 44 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.iconGlowWrap}>
            <View style={[styles.glow, styles.glowCoral]} />
            <View style={[styles.glow, styles.glowGold]} />
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.appIcon}
              contentFit="cover"
            />
          </View>
          <Text style={styles.proBadge}>LUNA STORIES PRO</Text>
          <Text style={styles.heroTitle}>Unlock the full Luna magic</Text>
          <Text style={styles.heroSubtitle}>
            Unlimited bedtime stories. Every world. Every night.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <SymbolView
                  name={f.icon as never}
                  size={16}
                  weight="semibold"
                  tintColor={colors.accent}
                />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDetail}>{f.detail}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Plans */}
        <View style={styles.plans}>
          {packages.map((pkg) => (
            <PlanCard
              key={pkg.identifier}
              pkg={pkg}
              trialDays={trialFor(pkg)}
              isSelected={pkg.identifier === selected?.identifier}
              onPress={() => setSelectedId(pkg.identifier)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable onPress={purchase} disabled={isPurchasing} style={styles.ctaWrap}>
          <LinearGradient
            colors={['#F5BA42', '#E8593D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.cta, isPurchasing && { opacity: 0.55 }]}
          >
            {isPurchasing ? (
              <ActivityIndicator color={colors.cream} />
            ) : (
              <>
                <Text style={styles.ctaLabel}>{ctaLabel}</Text>
                <SymbolView name="arrow.right" size={14} weight="bold" tintColor={colors.cream} />
              </>
            )}
          </LinearGradient>
        </Pressable>

        <Text style={styles.footerText}>{footerText}</Text>

        <View style={styles.legalRow}>
          <Pressable onPress={restore} disabled={isRestoring}>
            {isRestoring ? (
              <ActivityIndicator size="small" color={creamAlpha(0.5)} />
            ) : (
              <Text style={styles.legalLink}>Restore</Text>
            )}
          </Pressable>
          <Text style={styles.legalDot}>·</Text>
          <Pressable onPress={() => openLegalLink(legalLinks.terms)}>
            <Text style={styles.legalLink}>Terms</Text>
          </Pressable>
          <Text style={styles.legalDot}>·</Text>
          <Pressable onPress={() => openLegalLink(legalLinks.privacy)}>
            <Text style={styles.legalLink}>Privacy</Text>
          </Pressable>
        </View>
      </View>

      {/* Success overlay */}
      {didSucceed ? (
        <View style={styles.successOverlay}>
          <BlurView intensity={30} tint="dark" style={styles.successCard}>
            <SymbolView name="sparkles" size={48} tintColor={colors.accent} />
            <Text style={styles.successTitle}>Welcome to Luna Pro ✨</Text>
            <Text style={styles.successSubtitle}>Tonight's stories are on us.</Text>
          </BlurView>
        </View>
      ) : null}
    </View>
  );
}

function PlanCard({
  pkg,
  trialDays,
  isSelected,
  onPress,
}: {
  pkg: SubscriptionPackage;
  trialDays?: number;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <BlurView
        intensity={30}
        tint="dark"
        style={[
          styles.planCard,
          {
            borderColor: isSelected ? colors.accent : creamAlpha(0.1),
            borderWidth: isSelected ? 1.75 : 1,
            backgroundColor: creamAlpha(isSelected ? 0.1 : 0.04),
          },
        ]}
      >
        <View style={styles.radio}>
          <View
            style={[
              styles.radioRing,
              { borderColor: isSelected ? colors.accent : creamAlpha(0.25) },
            ]}
          />
          {isSelected ? <View style={styles.radioDot} /> : null}
        </View>

        <View style={styles.planText}>
          <View style={styles.planTitleRow}>
            <Text style={styles.planTitle}>{pkg.title}</Text>
            {pkg.isAnnual ? (
              <View style={styles.bestValue}>
                <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
            ) : null}
          </View>
          {trialDays ? (
            <Text style={styles.trialBadge}>{`${trialDays}-DAY FREE TRIAL`}</Text>
          ) : null}
          <Text style={styles.planSubnote}>
            {pkg.isAnnual ? 'Save vs monthly · cancel anytime' : 'Cancel anytime'}
          </Text>
        </View>

        <View style={styles.planPriceCol}>
          <Text style={styles.planPrice}>{pkg.priceString}</Text>
          <Text style={styles.planPeriod}>{pkg.periodUnit.replace(' / ', '/ ')}</Text>
        </View>
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.twilightBottom,
  },
  close: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: creamAlpha(0.08),
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 28,
  },
  hero: {
    alignItems: 'center',
    gap: 6,
  },
  iconGlowWrap: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
  },
  glowCoral: {
    width: 180,
    height: 180,
    backgroundColor: 'rgba(232, 89, 61, 0.32)',
    // RN has no blur(radius:); large soft circles approximate the glow.
    transform: [{ scale: 1.1 }],
    opacity: 0.8,
  },
  glowGold: {
    width: 130,
    height: 130,
    backgroundColor: 'rgba(245, 186, 66, 0.30)',
    opacity: 0.85,
  },
  appIcon: {
    width: 96,
    height: 96,
    borderRadius: 22,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: creamAlpha(0.12),
  },
  proBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#F5BA42',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.cream,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    color: creamAlpha(0.65),
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  features: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: creamAlpha(0.06),
    borderWidth: 1,
    borderColor: creamAlpha(0.08),
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderCurve: 'continuous',
    backgroundColor: accentAlpha(0.18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    gap: 2,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.cream,
  },
  featureDetail: {
    fontSize: 13,
    color: creamAlpha(0.6),
  },
  plans: {
    gap: 12,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 18,
    borderCurve: 'continuous',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  radio: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioRing: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  planText: {
    flex: 1,
    gap: 2,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.cream,
  },
  bestValue: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: colors.cream,
  },
  trialBadge: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: colors.accent,
  },
  planSubnote: {
    fontSize: 12,
    color: creamAlpha(0.6),
  },
  planPriceCol: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.cream,
  },
  planPeriod: {
    fontSize: 11,
    color: creamAlpha(0.55),
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 10,
  },
  ctaWrap: {
    shadowColor: '#E8593D',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 999,
  },
  ctaLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.cream,
  },
  footerText: {
    fontSize: 12,
    color: creamAlpha(0.5),
    textAlign: 'center',
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  legalLink: {
    fontSize: 12,
    color: creamAlpha(0.5),
  },
  legalDot: {
    color: creamAlpha(0.3),
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCard: {
    alignItems: 'center',
    gap: 14,
    padding: 28,
    borderRadius: 22,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.cream,
  },
  successSubtitle: {
    fontSize: 15,
    color: creamAlpha(0.7),
  },
});
