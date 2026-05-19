'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3003';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegister } from '@/hooks/use-auth';

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
  displayName: z.string().max(50).optional(),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const register = useRegister();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  return (
    <motion.div
      className="w-full max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="glass-strong rounded-3xl p-8 border border-white/8">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-match flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-900/40">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-black mb-2">Crear cuenta</h1>
          <p className="text-muted-foreground">Únete y empieza a hacer matches</p>
        </div>

        <form onSubmit={handleSubmit((data) => register.mutate(data))} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              {...registerField('email')}
              className={errors.email ? 'border-destructive/50' : ''}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="tu_usuario"
                autoComplete="username"
                {...registerField('username')}
                className={errors.username ? 'border-destructive/50' : ''}
              />
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">
                Nombre <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id="displayName"
                placeholder="Tu nombre"
                {...registerField('displayName')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                {...registerField('password')}
                className={errors.password ? 'border-destructive/50 pr-10' : 'pr-10'}
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

          <Button
            type="submit"
            className="w-full"
            size="lg"
            variant="gradient"
            disabled={register.isPending}
          >
            {register.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              'Crear cuenta gratis'
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-cinema-900 px-2 text-muted-foreground">o regístrate con</span>
          </div>
        </div>

        <a href={`${BACKEND_URL}/api/auth/google`} className="block">
          <Button variant="outline" className="w-full gap-3" size="lg" type="button">
            <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </Button>
        </a>

        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
            Inicia sesión
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
