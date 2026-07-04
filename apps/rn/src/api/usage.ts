import { useQuery } from '@tanstack/react-query';

import { api, USE_MOCK } from './client';
import { delay, mockDb } from './mock-data';
import type { UsageSummary, UserProfile } from './models';

async function getUsage(): Promise<UsageSummary> {
  if (USE_MOCK) {
    await delay(300);
    return mockDb.usage;
  }
  const { data } = await api.get<UsageSummary>('/usage');
  return data;
}

async function getProfile(): Promise<UserProfile> {
  if (USE_MOCK) {
    await delay(300);
    return mockDb.profile;
  }
  const { data } = await api.get<UserProfile>('/me');
  return data;
}

export function useUsage() {
  return useQuery({ queryKey: ['usage'], queryFn: getUsage, staleTime: 60_000 });
}

export function useProfile() {
  return useQuery({ queryKey: ['profile'], queryFn: getProfile, staleTime: 60_000 });
}
