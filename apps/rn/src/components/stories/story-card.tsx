import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { StoryResponse, StoryStatus } from '@/api/models';
import { creamAlpha } from '@/theme/colors';
import { colors } from '@/theme/colors';
import { StoryCoverGrid } from './story-cover-grid';

const statusDisplayText: Record<StoryStatus, string> = {
  pending: 'Queued…',
  generating: 'Generating…',
  ready: 'Ready',
  failed: 'Failed',
};

// Abbreviated relative timestamp, close to RelativeDateTimeFormatter.
export function formatRelative(iso: string | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const seconds = Math.max(0, (Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

// StoryCard from MyStoriesView.swift: 84pt cover collage, title + summary,
// caption meta row (duration + relative date, or pending/failed status).
export function StoryCard({
  story,
  onPress,
}: {
  story: StoryResponse;
  onPress?: () => void;
}) {
  const ready = story.status === 'ready';
  const failed = story.status === 'failed';

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[styles.card, { opacity: ready ? 1 : 0.7 }]}
    >
      <View style={styles.cover}>
        <StoryCoverGrid
          icons={story.coverIcons ?? []}
          fallbackSymbol={story.coverSymbol ?? 'book.fill'}
          tintName={story.coverTint ?? 'blue'}
          glyphSize={20}
        />
      </View>

      <View style={styles.textColumn}>
        <Text style={styles.title} numberOfLines={2}>
          {story.title ?? 'Untitled story'}
        </Text>
        {story.summary ? (
          <Text style={styles.summary} numberOfLines={2}>
            {story.summary}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          {ready ? (
            <>
              {story.durationSeconds && story.durationSeconds > 0 ? (
                <>
                  <SymbolView
                    name="clock"
                    size={11}
                    tintColor={creamAlpha(0.45)}
                  />
                  <Text style={styles.metaText}>
                    {Math.max(1, Math.floor(story.durationSeconds / 60))} min
                  </Text>
                  <Text style={styles.metaText}>·</Text>
                </>
              ) : null}
              <Text style={styles.metaText}>{formatRelative(story.createdAt)}</Text>
            </>
          ) : (
            <>
              <SymbolView
                name={(failed ? 'exclamationmark.triangle.fill' : 'clock.arrow.circlepath') as never}
                size={11}
                tintColor={failed ? '#FF453A' : creamAlpha(0.45)}
              />
              <Text style={[styles.metaText, failed && styles.metaFailed]}>
                {statusDisplayText[story.status]}
              </Text>
            </>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 12,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: creamAlpha(0.06),
    borderWidth: 1,
    borderColor: creamAlpha(0.08),
    overflow: 'hidden',
  },
  cover: {
    width: 84,
    height: 84,
    borderRadius: 18,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  textColumn: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.cream,
  },
  summary: {
    fontSize: 15,
    color: creamAlpha(0.65),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: creamAlpha(0.45),
  },
  metaFailed: {
    color: '#FF453A',
  },
});
