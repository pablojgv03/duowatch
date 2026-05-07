'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Friendship, FriendRequest } from '@/types';
import toast from 'react-hot-toast';

export function useFriends() {
  return useQuery<Friendship[]>({
    queryKey: ['friends'],
    queryFn: () => api.get('/friendships'),
    staleTime: 1000 * 60 * 2,
  });
}

export function useFriendRequests() {
  return useQuery<FriendRequest[]>({
    queryKey: ['friendRequests'],
    queryFn: () => api.get('/friendships/requests/received'),
    staleTime: 1000 * 30,
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => api.post(`/friendships/request/${userId}`),
    onSuccess: () => {
      toast.success('Solicitud de amistad enviada');
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || 'No se pudo enviar la solicitud');
    },
  });
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => api.patch(`/friendships/request/${requestId}/accept`),
    onSuccess: () => {
      toast.success('¡Nueva amistad! 🎉');
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    },
    onError: () => {
      toast.error('Error al aceptar la solicitud');
    },
  });
}

export function useRejectFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => api.patch(`/friendships/request/${requestId}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    },
  });
}

export function useRemoveFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendshipId: string) => api.delete(`/friendships/${friendshipId}`),
    onSuccess: () => {
      toast.success('Amistad eliminada');
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
}

export function useUserSearch(query: string) {
  return useQuery({
    queryKey: ['userSearch', query],
    queryFn: () => api.get(`/users/search?q=${encodeURIComponent(query)}`),
    enabled: query.length > 1,
    staleTime: 1000 * 30,
  });
}
