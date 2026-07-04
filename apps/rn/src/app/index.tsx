import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, Stack, router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCharacters, type Character, type CharacterRole } from '@/api/characters';
import { Splash } from '@/components/auth/splash';
import { CharacterSection } from '@/components/home/character-section';
import { StartButton } from '@/components/home/start-button';
import { MoodyTwilightBackground } from '@/components/moody-twilight-background';
import { useToast } from '@/components/toast';
import { useAuth } from '@/services/auth';
import { generation, useInFlightGeneration } from '@/services/generation';
import { colors, creamAlpha } from '@/theme/colors';

// HomeView.swift ported: twilight background, Main/Side character grids,
// pinned Start button over a bottom fade, account button top-right.
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { isSignedIn, isLoading: authLoading } = useAuth();
  const inFlight = useInFlightGeneration();
  const { data: characters = [], refetch, isRefetching } = useCharacters();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const mainCharacters = characters.filter((c) => c.role === 'main');
  const sideCharacters = characters.filter((c) => c.role === 'side');

  const toggle = (character: Character) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(character.id)) next.delete(character.id);
      else next.add(character.id);
      return next;
    });
  };

  const handleStart = () => {
    if (selectedIds.size === 0) {
      toast.show('Please select at least one character for your story', {
        title: 'No character selected',
        style: 'info',
      });
      return;
    }
    router.push(`/create?characterIds=${[...selectedIds].join(',')}` as never);
  };

  const handleAdd = (role: CharacterRole) => {
    router.push(`/character-wizard?role=${role}` as never);
  };

  const handleEdit = (character: Character) => {
    router.push(`/character-wizard?characterId=${character.id}` as never);
  };

  // Auth gate: splash while restoring the session, GetStarted when signed out.
  if (authLoading) return <Splash />;
  if (!isSignedIn) return <Redirect href={'/get-started' as never} />;

  return (
    <View style={styles.root}>
      {/* Native navigation bar with a collapsing large title, matching
          .navigationTitle("Luna Stories") + hidden toolbar background. */}
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Luna Stories',
          headerLargeTitle: true,
          headerTransparent: true,
          headerLargeStyle: { backgroundColor: 'transparent' },
          headerLargeTitleStyle: { color: colors.cream },
          headerTitleStyle: { color: colors.cream },
          headerShadowVisible: false,
          headerRight: () => <AccountButton />,
        }}
      />
      <MoodyTwilightBackground />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.cream}
          />
        }
      >
        {inFlight ? (
          <GenerationBanner
            status={inFlight.status}
            title={inFlight.story?.title}
            onPress={() => {
              if (inFlight.status === 'ready' && inFlight.story) {
                const id = inFlight.story.id;
                generation.acknowledge();
                router.push(`/story/${id}` as never);
              }
            }}
            onDismiss={() => generation.acknowledge()}
          />
        ) : null}

        <View style={styles.sections}>
          <CharacterSection
            role="main"
            characters={mainCharacters}
            selectedIds={selectedIds}
            onToggle={toggle}
            onAdd={() => handleAdd('main')}
            onEdit={handleEdit}
          />
          <CharacterSection
            role="side"
            characters={sideCharacters}
            selectedIds={selectedIds}
            onToggle={toggle}
            onAdd={() => handleAdd('side')}
            onEdit={handleEdit}
          />
        </View>
      </ScrollView>

      {/* Bottom fade + pinned Start button (HomeView's 200pt gradient overlay). */}
      <View pointerEvents="box-none" style={styles.bottomOverlay}>
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.55)']}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.startWrap, { paddingBottom: Math.max(insets.bottom, 20) + 16 }]}>
          <StartButton onPress={handleStart} />
        </View>
      </View>
    </View>
  );
}

// Account button (two rounded bars) mirroring the iOS toolbar item.
function AccountButton() {
  return (
    <Pressable
      style={accountStyles.button}
      accessibilityLabel="Account"
      onPress={() => router.push('/account' as never)}
    >
      <View style={accountStyles.bars}>
        <View style={accountStyles.barLong} />
        <View style={accountStyles.barShort} />
      </View>
    </Pressable>
  );
}

// Compact banner for the in-flight generation (iOS GenerationBanner):
// spinner while pending/generating, tap-to-read once the story lands.
function GenerationBanner({
  status,
  title,
  onPress,
  onDismiss,
}: {
  status: string;
  title?: string | null;
  onPress: () => void;
  onDismiss: () => void;
}) {
  const ready = status === 'ready';
  return (
    <Pressable onPress={onPress} style={bannerStyles.card}>
      {ready ? (
        <SymbolView name="sparkles" size={20} tintColor={colors.accent} />
      ) : (
        <ActivityIndicator size="small" color={colors.accent} />
      )}
      <View style={bannerStyles.textColumn}>
        <Text style={bannerStyles.title} numberOfLines={1}>
          {ready ? (title ?? 'Your story is ready!') : 'Creating your story…'}
        </Text>
        <Text style={bannerStyles.subtitle}>
          {ready ? 'Tap to read it now' : 'This takes about a minute ✨'}
        </Text>
      </View>
      <Pressable onPress={onDismiss} hitSlop={8} accessibilityLabel="Dismiss">
        <SymbolView name="xmark" size={13} weight="bold" tintColor={creamAlpha(0.6)} />
      </Pressable>
    </Pressable>
  );
}

const bannerStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: creamAlpha(0.08),
    borderWidth: 1,
    borderColor: creamAlpha(0.12),
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.cream,
  },
  subtitle: {
    fontSize: 13,
    color: creamAlpha(0.65),
  },
});

const accountStyles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bars: {
    alignItems: 'flex-end',
    gap: 6,
  },
  barLong: {
    width: 18,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'white',
  },
  barShort: {
    width: 14,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'white',
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.twilightBottom,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 140,
  },
  sections: {
    gap: 20,
  },
  bottomOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
    justifyContent: 'flex-end',
  },
  startWrap: {
    paddingHorizontal: 24,
  },
});
