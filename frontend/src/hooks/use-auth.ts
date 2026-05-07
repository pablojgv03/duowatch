'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import type { AuthResponse, User } from '@/types';

export function useMe() {
  const { isAuthenticated } = useAuthStore();

  return useQuery<User>({
    queryKey: ['me'],
    queryFn: () => api.get('/users/me'),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
}

export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, { email: string; password: string }>({
    mutationFn: (data) => api.post('/auth/login', data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      queryClient.setQueryData(['me'], data.user);
      toast.success(`Bienvenido/a de vuelta, ${data.user.displayName || data.user.username}!`);
      if (!data.user.isOnboarded) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || 'Credenciales incorrectas');
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation<AuthResponse, Error, { email: string; username: string; password: string; displayName?: string }>({
    mutationFn: (data) => api.post('/auth/register', data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success('¡Cuenta creada correctamente!');
      router.push('/onboarding');
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || 'Error al crear la cuenta');
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSettled: () => {
      logout();
      queryClient.clear();
      router.push('/');
    },
  });
}
