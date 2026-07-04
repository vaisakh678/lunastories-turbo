import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MoodyTwilightBackground } from '@/components/moody-twilight-background';
import { colors, creamAlpha } from '@/theme/colors';

// OnboardingCarouselView.swift ported: 4 paged slides (circular 240pt
// image, bold 28pt title, secondary body), animated page dots
// (22pt active pill / 8pt dot), Next → Get Started CTA, Skip top-right.

interface Slide {
  image: number;
  title: string;
  subtitle: string;
}

const slides: Slide[] = [
  {
    image: require('../../../assets/onboarding/onboarding_1.png'),
    title: 'Create your own story',
    subtitle:
      'Never get bored of the same old tales — create your own unique story with your child.',
  },
  {
    image: require('../../../assets/onboarding/onboarding_2.png'),
    title: 'Choose different characters and professions',
    subtitle:
      'Your kid can be dragons, unicorns, superheroes, pirates, astronauts — endless options!',
  },
  {
    image: require('../../../assets/onboarding/onboarding_3.png'),
    title: 'Include family, friends, and pets',
    subtitle: 'Make every story personal and special.',
  },
  {
    image: require('../../../assets/onboarding/onboarding_4.png'),
    title: "Set up your kid's profile",
    subtitle: "To start generating stories, set up your kid's profile first.",
  },
];

export function OnboardingCarousel({
  onFinish,
  onBack,
}: {
  onFinish: () => void;
  onBack: () => void;
}) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  const goTo = (next: number) => {
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
    setPage(next);
  };

  return (
    <View style={styles.root}>
      <MoodyTwilightBackground />

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={onBack} hitSlop={10} accessibilityLabel="Back">
          <SymbolView name="chevron.left" size={18} weight="semibold" tintColor={colors.cream} />
        </Pressable>
        <Pressable onPress={onFinish} hitSlop={10}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
        style={styles.pager}
      >
        {slides.map((slide, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <Image source={slide.image} style={styles.slideImage} contentFit="cover" />
            <View style={styles.slideText}>
              <Text style={styles.slideTitle}>{slide.title}</Text>
              <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <Dot key={i} active={i === page} />
        ))}
      </View>

      <View style={[styles.ctaWrap, { paddingBottom: Math.max(insets.bottom, 12) + 16 }]}>
        <Pressable
          onPress={() => (page < slides.length - 1 ? goTo(page + 1) : onFinish())}
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.ctaLabel}>{page < slides.length - 1 ? 'Next' : 'Get Started'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Dot({ active }: { active: boolean }) {
  const style = useAnimatedStyle(() => ({
    width: withTiming(active ? 22 : 8, { duration: 200 }),
    backgroundColor: withTiming(active ? colors.accent : 'rgba(142,142,147,0.3)', {
      duration: 200,
    }),
  }));
  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.twilightBottom,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 2,
  },
  skip: {
    fontSize: 17,
    color: creamAlpha(0.6),
  },
  pager: {
    flex: 1,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingBottom: 40,
  },
  slideImage: {
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  slideText: {
    gap: 12,
    paddingHorizontal: 32,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.cream,
    textAlign: 'center',
  },
  slideSubtitle: {
    fontSize: 17,
    lineHeight: 24,
    color: creamAlpha(0.7),
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  ctaWrap: {
    paddingHorizontal: 24,
  },
  cta: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
  },
});
