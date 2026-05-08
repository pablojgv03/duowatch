'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ reset }: ErrorProps) {
  return (
    <div className="relative min-h-screen bg-cinema-950 flex items-center justify-center overflow-hidden">
      {/* Partículas decorativas */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[12%] left-[18%] w-1 h-1 rounded-full bg-white/15" />
        <div className="absolute top-[25%] left-[72%] w-1.5 h-1.5 rounded-full bg-fuchsia-400/25" />
        <div className="absolute top-[65%] left-[8%] w-1 h-1 rounded-full bg-white/10" />
        <div className="absolute top-[55%] left-[88%] w-1 h-1 rounded-full bg-violet-400/20" />
        <div className="absolute top-[82%] left-[55%] w-1.5 h-1.5 rounded-full bg-white/15" />
        {/* Glow orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-fuchsia-600/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-violet-600/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md">
        {/* Ícono */}
        <div className="glass p-5 rounded-2xl mb-8">
          <AlertTriangle className="h-12 w-12 text-fuchsia-400" />
        </div>

        {/* Título */}
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500 mb-3">
          Algo salió mal
        </h1>

        {/* Descripción */}
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Ocurrió un error inesperado. Estamos trabajando para solucionarlo.
        </p>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            onClick={reset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl glass border border-white/10 text-foreground font-semibold transition-all duration-200 hover:border-violet-500/40 hover:scale-105 active:scale-95"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
