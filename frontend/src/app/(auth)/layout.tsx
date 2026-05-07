import Link from 'next/link';
import { Film } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cinema-950 flex flex-col">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-600/8 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 p-6">
        <Link href="/" className="flex items-center gap-2.5 w-fit">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
            <Film className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient">DuoWatch</span>
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        {children}
      </main>
    </div>
  );
}
