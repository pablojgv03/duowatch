'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import type { AuthResponse, RegisterResponse, User } from '@/types';

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

  return useMutation<AuthResponse, any, { email: string; password: string }>({
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
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation<RegisterResponse, any, { email: string; username: string; password: string; displayName?: string }>({
    mutationFn: (data) => api.post('/auth/register', data),
    onSuccess: (data) => {
      router.push(`/check-email?email=${encodeURIComponent(data.email)}`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Error al crear la cuenta');
    },
  });
}

export function useVerifyEmail() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, any, string>({
    mutationFn: (token) => api.get(`/auth/verify-email?token=${token}`),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      queryClient.setQueryData(['me'], data.user);
      toast.success('¡Email verificado! Bienvenido/a a DuoWatch');
      router.push('/onboarding');
    },
    onError: () => {
      toast.error('El enlace de verificación es inválido o ha expirado');
    },
  });
}

export function useResendVerification() {
  return useMutation<{ message: string }, any, string>({
    mutationFn: (email) => api.post('/auth/resend-verification', { email }),
    onSuccess: () => {
      toast.success('Email reenviado. Revisa tu bandeja de entrada');
    },
    onError: () => {
      toast.error('Error al reenviar el email');
    },
  });
}

export function useForgotPassword() {
  return useMutation<{ message: string }, any, string>({
    mutationFn: (email) => api.post('/auth/forgot-password', { email }),
    onSuccess: () => {
      toast.success('Si el email existe, recibirás un enlace en breve');
    },
    onError: () => {
      toast.error('Error al procesar la solicitud');
    },
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation<{ message: string }, any, { token: string; password: string }>({
    mutationFn: (data) => api.post('/auth/reset-password', data),
    onSuccess: () => {
      toast.success('Contraseña actualizada correctamente');
      router.push('/login');
    },
    onError: () => {
      toast.error('El enlace ha expirado o es inválido');
    },
  });
}

export function useUpdateNotifications() {
  const queryClient = useQueryClient();

  return useMutation<User, any, boolean>({
    mutationFn: (emailNotifications) => api.patch('/users/me/notifications', { emailNotifications }),
    onSuccess: (data) => {
      queryClient.setQueryData(['me'], data);
      toast.success(data.emailNotifications ? 'Notificaciones activadas' : 'Notificaciones desactivadas');
    },
    onError: () => {
      toast.error('Error al actualizar las notificaciones');
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
