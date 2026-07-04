import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient as SvgRadialGradient, Stop } from 'react-native-svg';

import { colors } from '@/theme/colors';

/**
 * Twilight aurora background — deep violet base with warm coral and gold
 * glows, ported 1:1 from MoodyTwilightBackground in SharedComponents.swift:
 * a 3-stop vertical gradient plus three radial glows (gold top-right,
 * coral left, violet bottom-center).
 */
export function MoodyTwilightBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[colors.twilightTop, colors.twilightMid, colors.twilightBottom]}
        style={StyleSheet.absoluteFill}
      />
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <SvgRadialGradient id="gold" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.glowGold} stopOpacity={0.32} />
            <Stop offset="1" stopColor={colors.glowGold} stopOpacity={0} />
          </SvgRadialGradient>
          <SvgRadialGradient id="coral" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.glowCoral} stopOpacity={0.3} />
            <Stop offset="1" stopColor={colors.glowCoral} stopOpacity={0} />
          </SvgRadialGradient>
          <SvgRadialGradient id="violet" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.glowViolet} stopOpacity={0.35} />
            <Stop offset="1" stopColor={colors.glowViolet} stopOpacity={0} />
          </SvgRadialGradient>
        </Defs>
        {/* Centers/radii mirror the UnitPoint + endRadius values from iOS. */}
        <Ellipse cx="85%" cy="5%" rx={380} ry={380} fill="url(#gold)" />
        <Ellipse cx="5%" cy="32%" rx={360} ry={360} fill="url(#coral)" />
        <Ellipse cx="50%" cy="105%" rx={460} ry={460} fill="url(#violet)" />
      </Svg>
    </View>
  );
}
