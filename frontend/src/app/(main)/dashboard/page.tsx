'use client';

import { motion } from 'framer-motion';
import { Sparkles, Heart, Users, Film, TrendingUp, ArrowRight, Bell } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useMatches, useMatchStats } from '@/hooks/use-matches';
import { useFriends, useFriendRequests } from '@/hooks/use-friends';
import { useTrending } from '@/hooks/use-movies';
import { MatchCard } from '@/components/match/match-card';
import { MovieCard } from '@/components/movie/movie-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn, getAvatarUrl, formatRelativeDate } from '@/lib/utils';
import type { TMDBMediaItem } from '@/types';

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  return (
    <div className="card-cinema p-5">
      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-lg`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: matches, isLoading: matchesLoading } = useMatches();
  const { data: stats } = useMatchStats();
  const { data: friends } = useFriends();
  const { data: requests } = useFriendRequests();
  const { data: trending, isLoading: trendingLoading } = useTrending('all');

  const recentMatches = matches?.slice(0, 4) || [];
  const trendingItems = (trending as TMDBMediaItem[] | undefined)?.slice(0, 8) || [];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div>
        <motion.h1
          className="text-3xl font-black mb-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Hola, <span className="text-gradient">{user?.displayName || user?.username}</span> 👋
        </motion.h1>
        <p className="text-muted-foreground">¿Qué vamos a ver hoy?</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Sparkles}
          label="Total Matches"
          value={stats?.total || 0}
          color="from-violet-500 to-fuchsia-500"
        />
        <StatCard
          icon={Film}
          label="Películas con match"
          value={stats?.byType?.movie || 0}
          color="from-cyan-500 to-blue-500"
        />
        <StatCard
          icon={Users}
          label="Amigos"
          value={friends?.length || 0}
          color="from-emerald-500 to-teal-500"
        />
        <StatCard
          icon={Heart}
          label="Compatibilidad media"
          value={stats ? `${Math.round(stats.averageScore)}%` : '—'}
          color="from-rose-500 to-pink-500"
        />
      </div>

      {requests && requests.length > 0 && (
        <div className="card-cinema p-5 border border-violet-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-violet-400" />
              <h2 className="font-bold">Solicitudes de amistad</h2>
              <Badge variant="default">{requests.length}</Badge>
            </div>
            <Link href="/friends">
              <Button variant="ghost" size="sm" className="gap-1">
                Ver todas <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {requests.slice(0, 5).map((req) => (
              <div key={req.id} className="flex items-center gap-2 glass rounded-xl px-3 py-2 shrink-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={req.requester ? getAvatarUrl(req.requester) : ''} />
                  <AvatarFallback className="text-xs">
                    {(req.requester?.displayName || req.requester?.username || '?')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {req.requester?.displayName || req.requester?.username}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-400" />
            Matches recientes
          </h2>
          <Link href="/matches">
            <Button variant="ghost" size="sm" className="gap-1">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        {matchesLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-video rounded-2xl" />
            ))}
          </div>
        ) : recentMatches.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentMatches.map((match, i) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <MatchCard match={match} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card-cinema p-12 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-semibold mb-1">Aún no hay matches</p>
            <p className="text-sm text-muted-foreground mb-4">
              Añade amigos y dad like a las mismas películas para generar matches
            </p>
            <Link href="/discover">
              <Button variant="gradient" size="sm" className="gap-1">
                Descubrir películas <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
            Trending esta semana
          </h2>
          <Link href="/discover">
            <Button variant="ghost" size="sm" className="gap-1">
              Explorar <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        {trendingLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {trendingItems.map((item, i) => (
              <motion.div
                key={`${item.media_type}-${item.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <MovieCard item={item} variant="compact" />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
