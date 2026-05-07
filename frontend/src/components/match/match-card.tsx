'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, Star, Film, Tv } from 'lucide-react';
import { cn, getPosterUrl, formatRating, getRatingColor, getAvatarUrl, formatRelativeDate } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Match } from '@/types';
import { useAuthStore } from '@/store/auth.store';

interface MatchCardProps {
  match: Match;
  className?: string;
}

export function MatchCard({ match, className }: MatchCardProps) {
  const { user } = useAuthStore();
  const posterUrl = getPosterUrl(match.posterPath);
  const isMovie = match.mediaType === 'MOVIE';

  const friend = match.userAId === user?.id ? match.userB : match.userA;

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/5 bg-cinema-900 group cursor-pointer',
        className,
      )}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={match.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-cinema-800">
            {isMovie ? <Film className="h-16 w-16 text-muted-foreground/30" /> : <Tv className="h-16 w-16 text-muted-foreground/30" />}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-900 via-cinema-900/40 to-transparent" />

        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="match" className="gap-1">
            <Sparkles className="h-3 w-3" /> Match
          </Badge>
        </div>

        {match.score > 0 && (
          <div className="absolute top-3 right-3 glass rounded-lg px-2.5 py-1">
            <span className={cn('text-xs font-bold', getRatingColor(match.score / 10))}>
              {Math.round(match.score)}% compatible
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-base line-clamp-1">{match.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={isMovie ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                {isMovie ? 'Película' : 'Serie'}
              </Badge>
              {match.voteAverage > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                  <span className={cn('text-xs', getRatingColor(match.voteAverage))}>
                    {formatRating(match.voteAverage)}
                  </span>
                </div>
              )}
              <span className="text-xs text-muted-foreground">{formatRelativeDate(match.createdAt)}</span>
            </div>
          </div>

          {friend && (
            <div className="flex items-center gap-2 shrink-0">
              <Avatar className="h-8 w-8 border border-violet-500/30">
                <AvatarImage src={getAvatarUrl(friend)} alt={friend.username} />
                <AvatarFallback className="text-xs">
                  {(friend.displayName || friend.username)[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>

        {match.overview && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{match.overview}</p>
        )}
      </div>

      <div className="absolute inset-0 rounded-2xl border border-violet-500/0 group-hover:border-violet-500/20 transition-all duration-300 pointer-events-none" />
    </motion.div>
  );
}
