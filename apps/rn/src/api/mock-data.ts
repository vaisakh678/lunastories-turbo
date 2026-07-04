import type { Character, StoryResponse, UsageSummary, UserProfile } from './models';

// In-memory mock database backing the API layer while USE_MOCK is on.
// Mutable so mutations (add character, create story) behave realistically.

export const mockDb = {
  characters: [
    {
      id: '4b8f4c3e-0001-4000-8000-000000000001',
      name: 'Milo',
      role: 'main',
      symbolName: '095ad436-8ab2-4ac9-be7a-29023a53caad',
      tintName: 'orange',
      tagline: 'Brave little fox',
      age: 5,
      gender: 'male',
      interests: ['space', 'dinosaurs'],
    },
    {
      id: '4b8f4c3e-0002-4000-8000-000000000002',
      name: 'Grandma Rose',
      role: 'side',
      symbolName: 'd1dafc21-484d-4597-a216-ff20ac1bf22e',
      tintName: 'pink',
      tagline: 'Tells the best jokes',
      relation: 'grandparent',
    },
  ] as Character[],

  stories: [
    {
      id: 'story-0001',
      status: 'ready',
      modeKey: 'jungle_book',
      title: 'Milo and the Moonlit Jungle',
      summary: 'Milo follows fireflies deep into a gentle jungle night.',
      coverSymbol: 'moon.stars.fill',
      coverTint: 'indigo',
      coverIcons: [
        { symbolName: 'moon.stars.fill', tint: 'indigo' },
        { symbolName: 'leaf.fill', tint: 'green' },
        { symbolName: 'pawprint.fill', tint: 'orange' },
        { symbolName: 'sparkles', tint: 'yellow' },
      ],
      durationSeconds: 180,
      moral: 'Kindness lights the way, even in the dark.',
      createdAt: '2026-06-14T19:30:00Z',
      content: {
        blocks: [
          { kind: 'text', text: 'Once upon a time, in a jungle washed silver by the moon, a little fox named Milo tiptoed past sleeping ferns.' },
          { kind: 'illustration', symbolName: 'moon.stars.fill', tint: 'indigo' },
          { kind: 'text', text: 'A parade of fireflies blinked hello. "Follow us," they seemed to say, "there is something wonderful to see."' },
          { kind: 'text', text: 'Milo followed, one soft paw at a time, until the trees opened like curtains onto a shimmering pond.' },
          { kind: 'illustration', symbolName: 'sparkles', tint: 'yellow' },
          { kind: 'text', text: 'There, every animal of the jungle had gathered to watch the moon take her bath. Milo settled between a drowsy bear and a giggling monkey, and felt perfectly at home.' },
          { kind: 'text', text: 'And when his eyelids grew heavy, the fireflies carried his dreams all the way back to his den. Goodnight, Milo.' },
        ],
      },
    },
    {
      id: 'story-0002',
      status: 'ready',
      modeKey: 'construction_site',
      title: 'The Little Crane That Could',
      summary: 'Milo helps a shy crane build the tallest tower in town.',
      coverSymbol: 'wrench.and.screwdriver.fill',
      coverTint: 'yellow',
      coverIcons: [
        { symbolName: 'wrench.and.screwdriver.fill', tint: 'yellow' },
        { symbolName: 'building.2.fill', tint: 'blue' },
      ],
      durationSeconds: 150,
      moral: 'Big things are built one small brick at a time.',
      createdAt: '2026-06-12T19:00:00Z',
      content: {
        blocks: [
          { kind: 'text', text: 'Beep beep! The construction site woke up with a yawn and a rumble.' },
          { kind: 'illustration', symbolName: 'building.2.fill', tint: 'blue' },
          { kind: 'text', text: 'Carla the crane was too shy to lift her first beam. "What if I drop it?" she whispered.' },
          { kind: 'text', text: '"Then we pick it up together," said Milo, patting her big steel wheel.' },
          { kind: 'text', text: 'Brick by brick, beam by beam, the tower grew — and so did Carla\'s smile.' },
        ],
      },
    },
  ] as StoryResponse[],

  usage: {
    stories: {
      message: 'You have plenty of stories left this week.',
      used: 3,
      total: 100,
      remaining: 97,
      percentUsed: 3,
      resetsAt: '2026-06-20T00:00:00Z',
    },
    audio: {
      message: 'Audio narrations reset Saturday.',
      used: 2,
      total: 10,
      remaining: 8,
      percentUsed: 20,
      resetsAt: '2026-06-20T00:00:00Z',
    },
  } as UsageSummary,

  profile: {
    id: 'user-0001',
    name: 'Vaisakh',
    email: 'cortexlumora@gmail.com',
  } as UserProfile,
};

export function delay(ms = 500): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
