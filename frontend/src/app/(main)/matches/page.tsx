'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Film, Tv, Trophy, Users, TrendingUp } from 'lucide-react';
import { useMatches, useMatchStats } from '@/hooks/use-matches';
import { useFriends } from '@/hooks/use-friends';
import { MatchCard } from '@/components/match/match-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn, getAvatarUrl, getScoreColor } from '@/lib/utils';
import type { Match } from '@/types';

type FilterType = 'all' | 'MOVIE' | 'TV';

export default function MatchesPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const { data: matches, isLoading } = useMatches();
  const { data: stats } = useMatchStats();
  const { data: friends } = useFriends();

  const filteredMatches = (matches || []).filter((m: Match) => {
    if (filter !== 'all' && m.mediaType !== filter) return false;
    if (selectedFriendId) {
      return m.userAId === selectedFriendId || m.userBId === selectedFriendId;
    }
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-violet-400" />
          Mis Matches
        </h1>
        <p className="text-muted-foreground mt-1">Películas y series que coincidís con tus amigos</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card-cinema p-4 text-center">
          <p className="text-3xl font-black text-gradient">{stats?.total || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Total matches</p>
        </div>
        <div className="card-cinema p-4 text-center">
          <p className="text-3xl font-black text-cyan-400">{stats?.byType?.movie || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Películas</p>
        </div>
        <div className="card-cinema p-4 text-center">
          <p className="text-3xl font-black text-fuchsia-400">{stats?.byType?.tv || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Series</p>
        </div>
      </div>

      {friends && friends.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-3">Filtrar por amigo</p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedFriendId(null)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all shrink-0',
                !selectedFriendId
                  ? 'border-violet-500 bg-violet-500/15 text-violet-300'
                  : 'border-white/8 text-muted-foreground hover:border-violet-500/40',
              )}
            >
              <Users className="h-4 w-4" />
              Todos
            </button>
            {friends.map((f) => (
              <button
                key={f.friendshipId}
                onClick={() => setSelectedFriendId(selectedFriendId === f.friend.id ? null : f.friend.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all shrink-0',
                  selectedFriendId === f.friend.id
                    ? 'border-violet-500 bg-violet-500/15 text-violet-300'
                    : 'border-white/8 text-muted-foreground hover:border-violet-500/40',
                )}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={getAvatarUrl(f.friend)} />
                  <AvatarFallback className="text-[10px]">
                    {(f.friend.displayName || f.friend.username)[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {f.friend.displayName || f.friend.username}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex glass rounded-xl p-1 gap-1 w-fit">
        {([
          { value: 'all', label: 'Todo', icon: Sparkles },
          { value: 'MOVIE', label: 'Películas', icon: Film },
          { value: 'TV', label: 'Series', icon: Tv },
        ] as { value: FilterType; label: string; icon: any }[]).map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              filter === f.value
                ? 'bg-violet-600 text-white'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <f.icon className="h-4 w-4" />
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video rounded-2xl" />
          ))}
        </div>
      ) : filteredMatches.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredMatches.map((match: Match, i: number) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
              >
                <MatchCard match={match} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Sparkles className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <p className="font-semibold text-lg mb-2">
            {selectedFriendId ? 'No hay matches con este amigo aún' : 'Aún no tienes matches'}
          </p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Ve a Descubrir, da like a películas y cuando un amigo también les guste ¡aparecerán aquí!
          </p>
        </div>
      )}
    </div>
  );
}
