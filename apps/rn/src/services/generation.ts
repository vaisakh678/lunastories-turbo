import { makeId, mockDb } from '@/api/mock-data';
import type { Character, StoryResponse, StoryStatus } from '@/api/models';
import { createStore, useStore } from '@/lib/store';

// Mock of the iOS StoryGenerationManager: tracks the single in-flight
// generation, progresses pending → generating → ready on a timer, and
// appends the finished story to the mock stories list.

export interface InFlightGeneration {
  storyId: string;
  status: StoryStatus;
  characters: Character[];
  modeKey: string;
  /** Populated once status is "ready". */
  story?: StoryResponse;
}

export const generationStore = createStore<InFlightGeneration | null>(null);

export function useInFlightGeneration(): InFlightGeneration | null {
  return useStore(generationStore);
}

export const generation = {
  /** Kick off a mock generation; resolves immediately with the pending id. */
  start(characters: Character[], modeKey: string, _input: unknown): string {
    const storyId = makeId('story');
    generationStore.set({ storyId, status: 'pending', characters, modeKey });

    setTimeout(() => {
      generationStore.set((g) => (g?.storyId === storyId ? { ...g, status: 'generating' } : g));
    }, 1500);

    setTimeout(() => {
      const names = characters.map((c) => c.name).join(' and ');
      const story: StoryResponse = {
        id: storyId,
        status: 'ready',
        modeKey,
        title: `${names} and the Starlit Adventure`,
        summary: `A brand-new bedtime tale starring ${names}.`,
        coverSymbol: 'sparkles',
        coverTint: 'purple',
        coverIcons: [
          { symbolName: 'sparkles', tint: 'purple' },
          { symbolName: 'moon.stars.fill', tint: 'indigo' },
        ],
        durationSeconds: 160,
        moral: 'Every night holds a new adventure for brave hearts.',
        createdAt: new Date().toISOString(),
        content: {
          blocks: [
            { kind: 'text', text: `Tonight, ${names} discovered a staircase made of starlight winding up from the garden.` },
            { kind: 'illustration', symbolName: 'moon.stars.fill', tint: 'indigo' },
            { kind: 'text', text: 'Each step chimed like a tiny bell, and at the very top waited the friendliest cloud you ever saw.' },
            { kind: 'text', text: 'They bounced from cloud to cloud until the moon herself tucked them in with a silver blanket.' },
            { kind: 'text', text: 'And with one last twinkle, the stars carried them gently home to bed. The end.' },
          ],
        },
      };
      mockDb.stories.unshift(story);
      generationStore.set((g) => (g?.storyId === storyId ? { ...g, status: 'ready', story } : g));
    }, 8000);

    return storyId;
  },

  /** Dismiss the banner / acknowledge a landed story. */
  acknowledge(): void {
    generationStore.set(null);
  },
};
