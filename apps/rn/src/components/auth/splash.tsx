import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { MoodyTwilightBackground } from '@/components/moody-twilight-background';
import { colors, creamAlpha } from '@/theme/colors';

// SplashView.swift ported: twilight gradient, coral + gold halos behind the
// rounded app icon, wordmark + tagline. Shown while the session restores.
// The blurred halo circles are approximated with SVG radial gradients
// (RN has no view-level gaussian blur in Expo Go).
export function Splash() {
  return (
    <View style={styles.root}>
      <MoodyTwilightBackground />
      <View style={styles.center}>
        <View style={styles.iconStack}>
          <Svg width={320} height={320} style={StyleSheet.absoluteFill}>
            <Defs>
              <RadialGradient id="coralHalo" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={colors.glowCoral} stopOpacity={0.35} />
                <Stop offset="0.7" stopColor={colors.glowCoral} stopOpacity={0.12} />
                <Stop offset="1" stopColor={colors.glowCoral} stopOpacity={0} />
              </RadialGradient>
              <RadialGradient id="goldHalo" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={colors.glowGold} stopOpacity={0.3} />
                <Stop offset="0.7" stopColor={colors.glowGold} stopOpacity={0.1} />
                <Stop offset="1" stopColor={colors.glowGold} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={160} cy={160} r={140} fill="url(#coralHalo)" />
            <Circle cx={160} cy={160} r={100} fill="url(#goldHalo)" />
          </Svg>
          <Image
            source={require('../../../assets/images/splash_icon.heic')}
            style={styles.icon}
            contentFit="contain"
          />
        </View>

        <View style={styles.wordmark}>
          <Text style={styles.title}>Luna Stories</Text>
          <Text style={styles.tagline}>Bedtime, magical.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.twilightBottom,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
  },
  iconStack: {
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 168,
    height: 168,
    borderRadius: 38,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: creamAlpha(0.12),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
  },
  wordmark: {
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.cream,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.4,
    color: creamAlpha(0.55),
  },
});
