'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResendVerification } from '@/hooks/use-auth';
import Link from 'next/link';

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const resend = useResendVerification();

  return (
    <motion.div
      className="w-full max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="glass-strong rounded-3xl p-8 border border-white/8 text-center">
        <div className="h-16 w-16 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center mx-auto mb-6">
          <Mail className="h-8 w-8 text-violet-400" />
        </div>

        <h1 className="text-2xl font-black mb-2">Revisa tu email</h1>
        <p className="text-muted-foreground mb-2">Hemos enviado un enlace de verificación a:</p>
        <p className="text-violet-400 font-semibold mb-6 break-all">{email}</p>

        <div className="bg-white/4 rounded-2xl p-4 mb-6 text-sm text-muted-foreground text-left space-y-1.5">
          <p>• Abre el email y haz clic en <strong className="text-foreground">"Verificar mi cuenta"</strong></p>
          <p>• El enlace expira en 24 horas</p>
          <p>• Revisa la carpeta de spam si no lo encuentras</p>
        </div>

        <Button
          variant="outline"
          className="w-full gap-2 mb-4"
          onClick={() => resend.mutate(email)}
          disabled={resend.isPending}
        >
          {resend.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Reenviar email
        </Button>

        <p className="text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
            Inicia sesión
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={null}>
      <CheckEmailContent />
    </Suspense>
  );
}
