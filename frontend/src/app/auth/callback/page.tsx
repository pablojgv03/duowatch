'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const redirect = searchParams.get('redirect') || '/dashboard';

    if (!accessToken || !refreshToken) {
      router.replace('/login');
      return;
    }

    // Pre-set tokens so the api interceptor can use them for /users/me
    useAuthStore.getState().setAuth(null as any, accessToken, refreshToken);

    api.get('/users/me').then((user: any) => {
      setAuth(user, accessToken, refreshToken);
      router.replace(redirect);
    }).catch(() => {
      router.replace('/login');
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500 mx-auto" />
        <p className="text-muted-foreground">Iniciando sesión con Google...</p>
      </div>
    </div>
  );
}
