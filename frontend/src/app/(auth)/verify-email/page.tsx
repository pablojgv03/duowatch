'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVerifyEmail } from '@/hooks/use-auth';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const verify = useVerifyEmail();

  useEffect(() => {
    if (token) verify.mutate(token);
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      className="w-full max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="glass-strong rounded-3xl p-8 border border-white/8 text-center">
        {verify.isPending && (
          <>
            <Loader2 className="h-12 w-12 text-violet-400 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-black mb-2">Verificando cuenta...</h1>
            <p className="text-muted-foreground">Un momento, por favor</p>
          </>
        )}

        {verify.isSuccess && (
          <>
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
            <h1 className="text-2xl font-black mb-2">¡Cuenta verificada!</h1>
            <p className="text-muted-foreground">Redirigiendo a la app...</p>
          </>
        )}

        {verify.isError && (
          <>
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-black mb-2">Enlace inválido</h1>
            <p className="text-muted-foreground mb-6">
              El enlace de verificación ha expirado o ya fue utilizado.
            </p>
            <Link href="/login">
              <Button variant="gradient" className="w-full">Ir al login</Button>
            </Link>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
