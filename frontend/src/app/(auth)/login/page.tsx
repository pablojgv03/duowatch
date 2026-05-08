'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, MailWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin, useResendVerification } from '@/hooks/use-auth';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const login = useLogin();
  const resend = useResendVerification();

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => {
    setUnverifiedEmail(null);
    login.mutate(data, {
      onError: (error: any) => {
        const msg = error?.response?.data?.message || error?.message || '';
        if (msg === 'EMAIL_NOT_VERIFIED') {
          setUnverifiedEmail(data.email);
        }
      },
    });
  };

  return (
    <motion.div
      className="w-full max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="glass-strong rounded-3xl p-8 border border-white/8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2">Bienvenido/a de vuelta</h1>
          <p className="text-muted-foreground">Inicia sesión para continuar</p>
        </div>

        <AnimatePresence>
          {unverifiedEmail && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 overflow-hidden"
            >
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex gap-3">
                <MailWarning className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-300 mb-1">Email no verificado</p>
                  <p className="text-xs text-amber-200/70 mb-3">
                    Verifica tu cuenta antes de iniciar sesión. Revisa la carpeta de spam si no encuentras el email.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-amber-500/40 text-amber-300 hover:bg-amber-500/10 gap-1.5"
                    onClick={() => resend.mutate(unverifiedEmail)}
                    disabled={resend.isPending}
                  >
                    {resend.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    Reenviar email de verificación
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              {...register('email')}
              className={errors.email ? 'border-destructive/50 focus:ring-destructive/50' : ''}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-violet-400 transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                {...register('password')}
                className={errors.password ? 'border-destructive/50 focus:ring-destructive/50 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={login.isPending}>
            {login.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Entrando...</> : 'Iniciar sesión'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
