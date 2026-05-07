'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationsStore } from '@/store/notifications.store';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { Match, FriendRequest } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { accessToken, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationsStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const socket = io(WS_URL, {
      auth: { token: accessToken },
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Socket connected');
    });

    socket.on('new_match', ({ match, friend }: { match: Match; friend?: { displayName: string | null; username: string } }) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      const friendName = friend?.displayName || friend?.username || 'tu amigo/a';
      toast.success(`¡Has hecho match con ${friendName}!\n"${match.title}"`, {
        duration: 6000,
        icon: '🎬',
        style: { background: '#1c1c2e', color: '#fff', border: '1px solid rgba(139,92,246,0.4)' },
      });
    });

    socket.on('friend_request', ({ request, requester }: { request: FriendRequest; requester: any }) => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      toast.success(`${requester.displayName || requester.username} te ha enviado una solicitud`, {
        icon: '👋',
        duration: 5000,
      });
    });

    socket.on('friend_accepted', () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success('¡Nueva amistad!', { icon: '🎉' });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, accessToken]);

  return socketRef.current;
}
