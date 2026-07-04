import { Stack, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStory } from '@/api/stories';
import { MoodyTwilightBackground } from '@/components/moody-twilight-background';
import {
  AudioBarBackground,
  AudioPlayerBar,
  GenerateAudioBar,
  MakeAnotherCard,
  StoryHero,
  StoryPage,
} from '@/components/stories/reader';
import { useToast } from '@/components/toast';
import { colors, creamAlpha } from '@/theme/colors';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// StoryReaderView.swift ported: inline transparent nav bar with favorite
// heart, hero + paper page + make-another card, pinned glass audio bar.
export default function StoryReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { data: story, isLoading, error, refetch } = useStory(id);

  const [isFavorited, setIsFavorited] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  // Audio is stubbed until the dev-build phase: "generating" flips this
  // local flag and the player bar drives itself on a timer.
  const [hasAudio, setHasAudio] = useState(false);
  const [isMakingAnother, setIsMakingAnother] = useState(false);

  const generateAudio = async () => {
    setIsGeneratingAudio(true);
    await wait(2000);
    setIsGeneratingAudio(false);
    setHasAudio(true);
  };

  const makeAnother = async () => {
    setIsMakingAnother(true);
    await wait(1200);
    setIsMakingAnother(false);
    toast.show('A brand-new tale with these heroes is on its way', {
      title: 'Crafting another',
      style: 'info',
    });
  };

  const ready = story?.status === 'ready';

  return (
    <View style={styles.root}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerTransparent: true,
          headerTintColor: colors.cream,
          headerShadowVisible: false,
          headerRight: ready
            ? () => (
                <Pressable
                  onPress={() => setIsFavorited((f) => !f)}
                  hitSlop={8}
                  accessibilityLabel={isFavorited ? 'Unfavorite' : 'Favorite'}
                >
                  <SymbolView
                    name={isFavorited ? 'heart.fill' : 'heart'}
                    size={20}
                    tintColor={isFavorited ? '#FF453A' : colors.cream}
                  />
                </Pressable>
              )
            : undefined,
        }}
      />
      <MoodyTwilightBackground />

      {ready && story ? (
        <>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={styles.content}
          >
            <StoryHero story={story} />
            <StoryPage story={story} />
            <MakeAnotherCard isLoading={isMakingAnother} onPress={makeAnother} />
          </ScrollView>

          <View style={styles.bottomBar}>
            <AudioBarBackground>
              <View style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
                {hasAudio ? (
                  <AudioPlayerBar totalSeconds={story.durationSeconds ?? 0} />
                ) : (
                  <GenerateAudioBar
                    isGenerating={isGeneratingAudio}
                    onPress={generateAudio}
                  />
                )}
              </View>
            </AudioBarBackground>
          </View>
        </>
      ) : isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.cream} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <SymbolView name="wifi.exclamationmark" size={40} tintColor={creamAlpha(0.6)} />
          <Text style={styles.stateTitle}>Couldn&apos;t load story</Text>
          <Text style={styles.stateMessage}>{(error as Error).message}</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryLabel}>Retry</Text>
          </Pressable>
        </View>
      ) : story ? (
        // pending / generating / failed
        <View style={styles.center}>
          {story.status === 'failed' ? (
            <>
              <SymbolView
                name="exclamationmark.triangle.fill"
                size={40}
                tintColor="#FF9F0A"
              />
              <Text style={styles.stateTitle}>Couldn&apos;t generate this story</Text>
            </>
          ) : (
            <>
              <ActivityIndicator size="large" color={colors.cream} />
              <Text style={styles.stateMessage}>Still preparing this story…</Text>
            </>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.twilightBottom,
  },
  content: {
    gap: 24,
    paddingBottom: 220,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  stateTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.cream,
  },
  stateMessage: {
    fontSize: 15,
    color: creamAlpha(0.6),
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  retryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
});
