import Link from 'next/link';
import { Clapperboard } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-cinema-950 flex items-center justify-center overflow-hidden">
      {/* Estrellas decorativas */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-1 h-1 rounded-full bg-white/20" />
        <div className="absolute top-[20%] left-[70%] w-1.5 h-1.5 rounded-full bg-violet-400/30" />
        <div className="absolute top-[35%] left-[5%] w-1 h-1 rounded-full bg-white/15" />
        <div className="absolute top-[60%] left-[85%] w-1 h-1 rounded-full bg-fuchsia-400/25" />
        <div className="absolute top-[75%] left-[25%] w-1.5 h-1.5 rounded-full bg-white/10" />
        <div className="absolute top-[15%] left-[45%] w-1 h-1 rounded-full bg-violet-300/20" />
        <div className="absolute top-[80%] left-[60%] w-1 h-1 rounded-full bg-white/15" />
        <div className="absolute top-[50%] left-[90%] w-1.5 h-1.5 rounded-full bg-fuchsia-300/20" />
        <div className="absolute top-[90%] left-[10%] w-1 h-1 rounded-full bg-violet-400/20" />
        {/* Glow orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet-600/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-fuchsia-600/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md">
        {/* Ícono */}
        <div className="glass p-5 rounded-2xl mb-8">
          <Clapperboard className="h-12 w-12 text-violet-400" />
        </div>

        {/* 404 */}
        <h1 className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500 mb-4">
          404
        </h1>

        {/* Subtítulo */}
        <h2 className="text-2xl font-bold text-white mb-3">
          Esta página se perdió en el multiverso
        </h2>

        {/* Descripción */}
        <p className="text-muted-foreground mb-8 leading-relaxed">
          La página que buscas no existe o fue movida.
        </p>

        {/* Botón */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
