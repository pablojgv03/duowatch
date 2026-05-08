'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForgotPassword } from '@/hooks/use-auth';

const schema = z.object({ email: z.string().email('Email inválido') });
type ForgotForm = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const forgot = useForgotPassword();

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<ForgotForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: ForgotForm) => {
    forgot.mutate(data.email, { onSuccess: () => setSent(true) });
  };

  return (
    <motion.div
      className="w-full max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="glass-strong rounded-3xl p-8 border border-white/8">
        {!sent ? (
          <>
            <div className="text-center mb-8">
              <div className="h-12 w-12 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-violet-400" />
              </div>
              <h1 className="text-2xl font-black mb-2">Recuperar contraseña</h1>
              <p className="text-muted-foreground text-sm">
                Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  autoComplete="email"
                  {...register('email')}
                  className={errors.email ? 'border-destructive/50' : ''}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <Button type="submit" className="w-full" size="lg" variant="gradient" disabled={forgot.isPending}>
                {forgot.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</> : 'Enviar enlace'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver al login
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
            <h1 className="text-2xl font-black mb-2">Email enviado</h1>
            <p className="text-muted-foreground mb-2">
              Si existe una cuenta con <span className="text-violet-400 font-semibold">{getValues('email')}</span>, recibirás un enlace para restablecer tu contraseña.
            </p>
            <p className="text-sm text-muted-foreground mb-6">Revisa también la carpeta de spam.</p>
            <Link href="/login">
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver al login
              </Button>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
