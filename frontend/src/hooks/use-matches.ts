'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Match, MatchStats } from '@/types';

export function useMatches() {
  return useQuery<Match[]>({
    queryKey: ['matches', 'me'],
    queryFn: () => api.get('/matches/me'),
    staleTime: 1000 * 60 * 2,
  });
}

export function useMatchStats() {
  return useQuery<MatchStats>({
    queryKey: ['matches', 'stats'],
    queryFn: () => api.get('/matches/stats'),
    staleTime: 1000 * 60 * 5,
  });
}

export function useMatchesWithFriend(friendId: string | null) {
  return useQuery<Match[]>({
    queryKey: ['matches', 'friend', friendId],
    queryFn: () => api.get(`/matches/with/${friendId}`),
    enabled: !!friendId,
    staleTime: 1000 * 60 * 2,
  });
}
