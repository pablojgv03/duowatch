'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, KeyRound } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useResetPassword } from '@/hooks/use-auth';

const schema = z.object({
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Las contraseñas no coinciden', path: ['confirm'] });

type ResetForm = z.infer<typeof schema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [showPassword, setShowPassword] = useState(false);
  const reset = useResetPassword();

  const { register, handleSubmit, formState: { errors } } = useForm<ResetForm>({
    resolver: zodResolver(schema),
  });

  if (!token) {
    return (
      <div className="glass-strong rounded-3xl p-8 border border-white/8 text-center w-full max-w-md">
        <p className="text-muted-foreground">Enlace inválido.</p>
        <Link href="/forgot-password">
          <Button variant="outline" className="mt-4">Solicitar nuevo enlace</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      className="w-full max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="glass-strong rounded-3xl p-8 border border-white/8">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="h-6 w-6 text-violet-400" />
          </div>
          <h1 className="text-2xl font-black mb-2">Nueva contraseña</h1>
          <p className="text-muted-foreground text-sm">Elige una contraseña segura para tu cuenta.</p>
        </div>

        <form onSubmit={handleSubmit((d) => reset.mutate({ token, password: d.password }))} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                {...register('password')}
                className={errors.password ? 'border-destructive/50 pr-10' : 'pr-10'}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmar contraseña</Label>
            <Input
              id="confirm"
              type={showPassword ? 'text' : 'password'}
              placeholder="Repite la contraseña"
              autoComplete="new-password"
              {...register('confirm')}
              className={errors.confirm ? 'border-destructive/50' : ''}
            />
            {errors.confirm && <p className="text-xs text-destructive">{errors.confirm.message}</p>}
          </div>

          <Button type="submit" className="w-full" size="lg" variant="gradient" disabled={reset.isPending}>
            {reset.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Actualizando...</> : 'Actualizar contraseña'}
          </Button>
        </form>
      </div>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
