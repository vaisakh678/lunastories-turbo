import { Stack, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useStories } from '@/api/stories';
import { MoodyTwilightBackground } from '@/components/moody-twilight-background';
import { StoryCard } from '@/components/stories/story-card';
import { StoryCardSkeleton } from '@/components/stories/story-card-skeleton';
import { colors, creamAlpha } from '@/theme/colors';

// MyStoriesView.swift ported: large-title list of story cards over the
// twilight background; skeletons on cold load, empty state, pull-to-refresh.
export default function MyStoriesScreen() {
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useStories();
  const stories = data?.items ?? [];

  return (
    <View style={styles.root}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'My Stories',
          headerLargeTitle: true,
          headerTransparent: true,
          headerLargeStyle: { backgroundColor: 'transparent' },
          headerLargeTitleStyle: { color: colors.cream },
          headerTitleStyle: { color: colors.cream },
          headerTintColor: colors.cream,
          headerShadowVisible: false,
        }}
      />
      <MoodyTwilightBackground />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.cream}
          />
        }
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <StoryCardSkeleton key={i} />)
        ) : stories.length === 0 ? (
          <View style={styles.empty}>
            <SymbolView name="book" size={44} tintColor={creamAlpha(0.5)} />
            <Text style={styles.emptyTitle}>No stories yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first story from the home screen.
            </Text>
          </View>
        ) : (
          stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onPress={
                story.status === 'ready'
                  ? () => router.push(`/story/${story.id}`)
                  : undefined
              }
            />
          ))
        )}
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
    gap: 12,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.cream,
  },
  emptySubtitle: {
    fontSize: 15,
    color: creamAlpha(0.6),
    textAlign: 'center',
  },
});
