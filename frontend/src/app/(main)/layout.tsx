'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { MovieDetailModal } from '@/components/movie/movie-detail-modal';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/hooks/use-socket';

function SocketInitializer() {
  useSocket();
  return null;
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (user && !user.isOnboarded) {
      router.replace('/onboarding');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-cinema-950">
      <SocketInitializer />
      <Sidebar />
      <main className="lg:pl-64 pb-20 lg:pb-0 min-h-screen">
        {children}
      </main>
      <MobileNav />
      <MovieDetailModal />
    </div>
  );
}
