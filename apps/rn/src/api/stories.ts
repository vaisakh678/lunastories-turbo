import { useQuery } from '@tanstack/react-query';

import { api, USE_MOCK } from './client';
import { delay, mockDb } from './mock-data';
import type { StoryPage, StoryResponse } from './models';

async function listStories(cursor?: string): Promise<StoryPage> {
  if (USE_MOCK) {
    await delay(500);
    return { items: [...mockDb.stories], nextCursor: null };
  }
  const { data } = await api.get<StoryPage>('/stories', { params: { cursor } });
  return data;
}

async function getStory(id: string): Promise<StoryResponse> {
  if (USE_MOCK) {
    await delay(300);
    const story = mockDb.stories.find((s) => s.id === id);
    if (!story) throw new Error('Story not found');
    return story;
  }
  const { data } = await api.get<StoryResponse>(`/stories/${id}`);
  return data;
}

export function useStories() {
  return useQuery({
    queryKey: ['stories'],
    queryFn: () => listStories(),
    staleTime: 30_000,
  });
}

export function useStory(id: string | undefined) {
  return useQuery({
    queryKey: ['story', id],
    queryFn: () => getStory(id!),
    enabled: !!id,
  });
}
