import { useQuery } from '@tanstack/react-query';
import { api, USE_MOCK } from './client';

export type CharacterRole = 'main' | 'side';

export interface Character {
  id: string;
  role: CharacterRole;
  name: string;
  /** Bundled avatar id (UUID) or an SF Symbol name — same contract as iOS. */
  symbolName: string;
  tint: string;
  tagline?: string;
}

// Local avatar bundle for mock data. Mirrors the iOS Avatars/ asset
// namespace; require() so Metro bundles the HEICs.
export const avatarSources: Record<string, number> = {
  'avatar-0': require('../../assets/avatars/avatar-0.heic'),
  'avatar-1': require('../../assets/avatars/avatar-1.heic'),
  'avatar-2': require('../../assets/avatars/avatar-2.heic'),
  'avatar-3': require('../../assets/avatars/avatar-3.heic'),
  'avatar-4': require('../../assets/avatars/avatar-4.heic'),
  'avatar-5': require('../../assets/avatars/avatar-5.heic'),
};

const mockCharacters: Character[] = [
  {
    id: '4b8f4c3e-0001-4000-8000-000000000001',
    role: 'main',
    name: 'Milo',
    symbolName: 'avatar-0',
    tint: 'orange',
  },
];

async function listCharacters(): Promise<Character[]> {
  if (USE_MOCK) {
    // Small delay so pull-to-refresh and loading states are visible.
    await new Promise((r) => setTimeout(r, 600));
    return mockCharacters;
  }
  const { data } = await api.get<Character[]>('/characters');
  return data;
}

export function useCharacters() {
  return useQuery({
    queryKey: ['characters'],
    queryFn: listCharacters,
    // SWR feel like the iOS CharactersViewModel: keep showing cached
    // characters while a refresh happens in the background.
    staleTime: 30_000,
  });
}
