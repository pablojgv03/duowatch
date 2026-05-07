'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Compass,
  Sparkles,
  Users,
  User,
  Settings,
  LogOut,
  Film,
  Bell,
  Flame,
} from 'lucide-react';
import { cn, getAvatarUrl } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationsStore } from '@/store/notifications.store';
import { useLogout } from '@/hooks/use-auth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/discover', label: 'Descubrir', icon: Compass },
  { href: '/swipe', label: 'Matchear', icon: Flame },
  { href: '/matches', label: 'Mis Matches', icon: Sparkles },
  { href: '/friends', label: 'Amigos', icon: Users },
  { href: '/profile', label: 'Mi Perfil', icon: User },
  { href: '/settings', label: 'Ajustes', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationsStore();
  const logout = useLogout();

  if (!user) return null;

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-white/5 bg-cinema-950 fixed left-0 top-0 bottom-0 z-40">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-900/40">
            <Film className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient">DuoWatch</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={cn('nav-item', isActive && 'active')}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="font-medium">{item.label}</span>
                {item.label === 'Inicio' && unreadCount > 0 && (
                  <span className="ml-auto h-5 min-w-5 flex items-center justify-center rounded-full bg-violet-600 text-white text-xs font-bold px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
          <Avatar className="h-9 w-9 border border-violet-500/30">
            <AvatarImage src={getAvatarUrl(user)} alt={user.username} />
            <AvatarFallback className="text-xs">
              {(user.displayName || user.username)[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {user.displayName || user.username}
            </p>
            <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
          </div>
          <button
            onClick={() => logout.mutate()}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
