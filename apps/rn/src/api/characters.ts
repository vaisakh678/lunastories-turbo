import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api, USE_MOCK } from './client';
import { delay, makeId, mockDb } from './mock-data';
import type { Character, CreateCharacterRequest, UpdateCharacterRequest } from './models';

export type { Character, CharacterRole } from './models';
export { avatarSources } from './models';

async function listCharacters(): Promise<Character[]> {
  if (USE_MOCK) {
    await delay(500);
    return [...mockDb.characters];
  }
  const { data } = await api.get<Character[]>('/characters');
  return data;
}

async function createCharacter(request: CreateCharacterRequest): Promise<Character> {
  if (USE_MOCK) {
    await delay(400);
    const created: Character = { ...request, id: makeId('char') };
    mockDb.characters.unshift(created);
    return created;
  }
  const { data } = await api.post<Character>('/characters', request);
  return data;
}

async function updateCharacter(id: string, patch: UpdateCharacterRequest): Promise<Character> {
  if (USE_MOCK) {
    await delay(400);
    const idx = mockDb.characters.findIndex((c) => c.id === id);
    if (idx < 0) throw new Error('Character not found');
    mockDb.characters[idx] = { ...mockDb.characters[idx], ...patch };
    return mockDb.characters[idx];
  }
  const { data } = await api.patch<Character>(`/characters/${id}`, patch);
  return data;
}

async function deleteCharacter(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay(400);
    mockDb.characters = mockDb.characters.filter((c) => c.id !== id);
    return;
  }
  await api.delete(`/characters/${id}`);
}

export function useCharacters() {
  return useQuery({
    queryKey: ['characters'],
    queryFn: listCharacters,
    staleTime: 30_000,
  });
}

export function useCreateCharacter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCharacter,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['characters'] }),
  });
}

export function useUpdateCharacter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateCharacterRequest }) =>
      updateCharacter(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['characters'] }),
  });
}

export function useDeleteCharacter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCharacter,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['characters'] }),
  });
}
