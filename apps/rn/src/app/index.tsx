import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCharacters, type Character } from '@/api/characters';
import { CharacterSection } from '@/components/home/character-section';
import { StartButton } from '@/components/home/start-button';
import { MoodyTwilightBackground } from '@/components/moody-twilight-background';
import { useToast } from '@/components/toast';
import { colors } from '@/theme/colors';

// HomeView.swift ported: twilight background, Main/Side character grids,
// pinned Start button over a bottom fade, account button top-right.
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
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
    // TODO(story flow phase): open the story creation flow.
  };

  const handleAdd = () => {
    // TODO(wizard phase): open the character wizard sheet.
  };

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
        <View style={styles.sections}>
          <CharacterSection
            role="main"
            characters={mainCharacters}
            selectedIds={selectedIds}
            onToggle={toggle}
            onAdd={handleAdd}
          />
          <CharacterSection
            role="side"
            characters={sideCharacters}
            selectedIds={selectedIds}
            onToggle={toggle}
            onAdd={handleAdd}
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
    <Pressable style={accountStyles.button} accessibilityLabel="Account">
      <View style={accountStyles.bars}>
        <View style={accountStyles.barLong} />
        <View style={accountStyles.barShort} />
      </View>
    </Pressable>
  );
}

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
