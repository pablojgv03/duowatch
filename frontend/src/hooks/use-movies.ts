'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { TMDBMediaItem, TMDBGenre, MovieInteraction } from '@/types';
import toast from 'react-hot-toast';

export function useTrending(type: 'movie' | 'tv' | 'all' = 'all') {
  return useQuery<TMDBMediaItem[]>({
    queryKey: ['trending', type],
    queryFn: () => api.get(`/movies/trending?type=${type}`),
    staleTime: 1000 * 60 * 10,
  });
}

export function useMovieSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => api.get(`/movies/search?q=${encodeURIComponent(query)}`),
    enabled: query.length > 2,
    staleTime: 1000 * 30,
  });
}

export function useMovieGenres() {
  return useQuery<TMDBGenre[]>({
    queryKey: ['genres', 'movie'],
    queryFn: () => api.get('/movies/genres/movie'),
    staleTime: 1000 * 60 * 60,
  });
}

export function useTVGenres() {
  return useQuery<TMDBGenre[]>({
    queryKey: ['genres', 'tv'],
    queryFn: () => api.get('/movies/genres/tv'),
    staleTime: 1000 * 60 * 60,
  });
}

export function useRecommendations(page = 1) {
  return useQuery({
    queryKey: ['recommendations', page],
    queryFn: () => api.get(`/recommendations?page=${page}`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useDuoRecommendations(friendId: string | null) {
  return useQuery({
    queryKey: ['recommendations', 'duo', friendId],
    queryFn: () => api.get(`/recommendations/duo/${friendId}`),
    enabled: !!friendId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useMyInteractions() {
  return useQuery<MovieInteraction[]>({
    queryKey: ['interactions', 'me'],
    queryFn: () => api.get('/interactions/me'),
    staleTime: 1000 * 60 * 2,
  });
}

export function useLikedMovies() {
  return useQuery<MovieInteraction[]>({
    queryKey: ['interactions', 'liked'],
    queryFn: () => api.get('/interactions/me/liked'),
    staleTime: 1000 * 60 * 2,
  });
}

export function useInteract() {
  const queryClient = useQueryClient();

  return useMutation<
    MovieInteraction,
    Error,
    {
      tmdbId: number;
      mediaType: 'MOVIE' | 'TV';
      action: 'LIKED' | 'DISLIKED' | 'WATCHED' | 'WANT_TO_WATCH';
      title: string;
      posterPath?: string;
    }
  >({
    mutationFn: (data) => api.post('/interactions', data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });

      if (data.action === 'LIKED') {
        toast.success('¡Añadido a tus likes!', { icon: '❤️' });
      } else if (data.action === 'WANT_TO_WATCH') {
        toast.success('Añadido a tu lista', { icon: '📋' });
      } else if (data.action === 'WATCHED') {
        toast.success('Marcado como visto', { icon: '✅' });
      }
    },
    onError: () => {
      toast.error('Error al registrar tu interacción');
    },
  });
}
