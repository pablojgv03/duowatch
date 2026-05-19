'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Loader2, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const schema = z.object({
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-z0-9_]+$/, 'Solo letras minúsculas, números y _'),
});

type Form = z.infer<typeof schema>;

export default function SetupProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const username = watch('username', '');

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (!accessToken || !refreshToken) {
      router.replace('/login');
      return;
    }

    useAuthStore.getState().setAuth(null as any, accessToken, refreshToken);
  }, []);

  const onSubmit = async (data: Form) => {
    setLoading(true);
    try {
      const accessToken = searchParams.get('accessToken')!;
      const refreshToken = searchParams.get('refreshToken')!;

      const user: any = await api.patch('/users/me', { username: data.username });
      setAuth(user, accessToken, refreshToken);
      toast.success(`¡Bienvenido/a a DuoWatch, @${data.username}!`);
      router.replace('/onboarding');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error al guardar el username';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="glass-strong rounded-3xl p-8 border border-white/8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AtSign className="h-8 w-8 text-violet-400" />
            </div>
            <h1 className="text-2xl font-black mb-2">Elige tu username</h1>
            <p className="text-muted-foreground text-sm">
              Es como te encontrarán tus amigos en DuoWatch
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                <Input
                  id="username"
                  placeholder="nombre_de_usuario"
                  autoComplete="username"
                  className={`pl-7 ${errors.username ? 'border-destructive/50' : ''}`}
                  {...register('username')}
                />
              </div>
              {errors.username && (
                <p className="text-xs text-destructive">{errors.username.message}</p>
              )}
              {username && !errors.username && (
                <p className="text-xs text-emerald-400">@{username} disponible</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : 'Continuar'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
