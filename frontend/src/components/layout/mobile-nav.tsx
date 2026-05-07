'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Compass, Sparkles, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotificationsStore } from '@/store/notifications.store';

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/discover', label: 'Descubrir', icon: Compass },
  { href: '/matches', label: 'Matches', icon: Sparkles },
  { href: '/friends', label: 'Amigos', icon: Users },
  { href: '/profile', label: 'Perfil', icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const { unreadCount } = useNotificationsStore();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-cinema-950/95 backdrop-blur-xl">
      <div className="flex items-center justify-around py-2 px-4 safe-area-pb">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200',
                isActive ? 'text-violet-400' : 'text-muted-foreground',
              )}
            >
              <div className="relative">
                <Icon className="h-6 w-6" />
                {item.label === 'Inicio' && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 flex items-center justify-center rounded-full bg-violet-600 text-white text-[10px] font-bold px-0.5">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
