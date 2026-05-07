'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, Bookmark, Eye, X, Star, Tv, Film } from 'lucide-react';
import { cn, getPosterUrl, formatRating, getRatingColor, truncate } from '@/lib/utils';
import { useInteract } from '@/hooks/use-movies';
import type { TMDBMediaItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MovieCardProps {
  item: TMDBMediaItem;
  variant?: 'default' | 'swipe' | 'compact';
  className?: string;
  onLike?: () => void;
  onSkip?: () => void;
}

export function MovieCard({ item, variant = 'default', className, onLike, onSkip }: MovieCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const interact = useInteract();

  const title = 'title' in item ? item.title : item.name;
  const date = 'release_date' in item ? item.release_date : item.first_air_date;
  const year = date ? new Date(date).getFullYear() : '';
  const posterUrl = item.posterUrl || getPosterUrl(item.poster_path);
  const isMovie = item.media_type === 'movie';

  const handleLike = () => {
    interact.mutate({
      tmdbId: item.id,
      mediaType: isMovie ? 'MOVIE' : 'TV',
      action: 'LIKED',
      title,
      posterPath: item.poster_path || undefined,
    });
    onLike?.();
  };

  const handleSkip = () => {
    interact.mutate({
      tmdbId: item.id,
      mediaType: isMovie ? 'MOVIE' : 'TV',
      action: 'DISLIKED',
      title,
      posterPath: item.poster_path || undefined,
    });
    onSkip?.();
  };

  const handleWatchlist = () => {
    interact.mutate({
      tmdbId: item.id,
      mediaType: isMovie ? 'MOVIE' : 'TV',
      action: 'WANT_TO_WATCH',
      title,
      posterPath: item.poster_path || undefined,
    });
  };

  if (variant === 'compact') {
    return (
      <div className={cn('poster-card group w-full', className)}>
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-cinema-800">
          {posterUrl && !imageError ? (
            <Image
              src={posterUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 50vw, 200px"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-cinema-800">
              {isMovie ? <Film className="h-12 w-12 text-muted-foreground/30" /> : <Tv className="h-12 w-12 text-muted-foreground/30" />}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <p className="text-sm font-semibold text-white line-clamp-2">{title}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              <span className={cn('text-xs font-medium', getRatingColor(item.vote_average))}>
                {formatRating(item.vote_average)}
              </span>
            </div>
          </div>
          <div className="absolute top-2 right-2">
            <Badge variant={isMovie ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0.5">
              {isMovie ? 'Película' : 'Serie'}
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={cn('relative group rounded-2xl overflow-hidden bg-cinema-900 border border-white/5', className)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        {posterUrl && !imageError ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 50vw, 300px"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-cinema-800">
            {isMovie ? <Film className="h-16 w-16 text-muted-foreground/30" /> : <Tv className="h-16 w-16 text-muted-foreground/30" />}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant={isMovie ? 'default' : 'secondary'} className="text-[11px]">
            {isMovie ? 'Película' : 'Serie'}
          </Badge>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1 glass rounded-lg px-2 py-1">
          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
          <span className={cn('text-xs font-bold', getRatingColor(item.vote_average))}>
            {formatRating(item.vote_average)}
          </span>
        </div>

        <motion.div
          className="absolute bottom-0 left-0 right-0 p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: showActions ? 1 : 0, y: showActions ? 0 : 10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex gap-2 justify-center mb-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full glass text-red-400 hover:text-red-300 hover:bg-red-500/20"
              onClick={handleSkip}
            >
              <X className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-violet-600 text-white hover:bg-violet-500"
              onClick={handleLike}
            >
              <Heart className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full glass text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20"
              onClick={handleWatchlist}
            >
              <Bookmark className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-sm text-foreground line-clamp-1">{title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">{year}</span>
          {item.overview && (
            <span className="text-xs text-muted-foreground line-clamp-1 hidden group-hover:block">
              {truncate(item.overview, 60)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
