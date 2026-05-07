'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, Bookmark, X, Star, Tv, Film } from 'lucide-react';
import { cn, getPosterUrl, formatRating, getRatingColor, truncate } from '@/lib/utils';
import { useInteract } from '@/hooks/use-movies';
import type { TMDBMediaItem } from '@/types';
import { Badge } from '@/components/ui/badge';

interface MovieCardProps {
  item: TMDBMediaItem;
  variant?: 'default' | 'compact';
  className?: string;
  isLiked?: boolean;
  isSaved?: boolean;
  onLike?: () => void;
  onSkip?: () => void;
  onClick?: () => void;
}

export function MovieCard({ item, variant = 'default', className, isLiked, isSaved, onLike, onSkip, onClick }: MovieCardProps) {
  const [imageError, setImageError] = useState(false);
  const interact = useInteract();

  const title = 'title' in item ? item.title : item.name;
  const date = 'release_date' in item ? item.release_date : item.first_air_date;
  const year = date ? new Date(date).getFullYear() : '';
  const posterUrl = item.posterUrl || getPosterUrl(item.poster_path);
  const isMovie = item.media_type === 'movie';

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    interact.mutate({
      tmdbId: item.id,
      mediaType: isMovie ? 'MOVIE' : 'TV',
      action: 'LIKED',
      title,
      posterPath: item.poster_path || undefined,
    });
    onLike?.();
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    interact.mutate({
      tmdbId: item.id,
      mediaType: isMovie ? 'MOVIE' : 'TV',
      action: 'DISLIKED',
      title,
      posterPath: item.poster_path || undefined,
    });
    onSkip?.();
  };

  const handleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
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
      <div className={cn('poster-card group w-full cursor-pointer', className)} onClick={onClick}>
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

  // Variant: default (grid) — overlay sin cambio de tamaño
  return (
    <div
      className={cn('relative group rounded-2xl overflow-hidden bg-cinema-900 border border-white/5 cursor-pointer', className)}
      onClick={onClick}
    >
      {/* Poster — altura fija, sin escala en hover */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {posterUrl && !imageError ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 50vw, 300px"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-cinema-800">
            {isMovie ? <Film className="h-16 w-16 text-muted-foreground/30" /> : <Tv className="h-16 w-16 text-muted-foreground/30" />}
          </div>
        )}

        {/* Gradiente siempre visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

        {/* Badges — se ocultan en hover */}
        <div className="absolute top-3 left-3 transition-opacity duration-200 group-hover:opacity-0">
          <Badge variant={isMovie ? 'default' : 'secondary'} className="text-[11px]">
            {isMovie ? 'Película' : 'Serie'}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 glass rounded-lg px-2 py-1 transition-opacity duration-200 group-hover:opacity-0">
          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
          <span className={cn('text-xs font-bold', getRatingColor(item.vote_average))}>
            {formatRating(item.vote_average)}
          </span>
        </div>

        {/* Overlay hover: descripción + botones */}
        <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col p-4">
          <h3 className="font-bold text-white text-sm mb-2 line-clamp-2">{title}</h3>
          <p className="text-xs text-white/80 leading-relaxed flex-1 overflow-hidden">
            {item.overview || 'Sin descripción disponible.'}
          </p>
          <div className="flex gap-2 justify-center mt-3 pt-3 border-t border-white/10">
            <button
              onClick={handleSkip}
              className="h-10 w-10 rounded-full bg-black/50 border border-red-500/60 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white hover:border-red-400 transition-all duration-150"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              onClick={handleLike}
              className="h-10 w-10 rounded-full bg-violet-600 border border-violet-400/60 flex items-center justify-center text-white hover:bg-violet-500 transition-all duration-150"
            >
              <Heart className="h-4 w-4 fill-white" />
            </button>
            <button
              onClick={handleWatchlist}
              className="h-10 w-10 rounded-full bg-black/50 border border-cyan-500/60 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-white hover:border-cyan-400 transition-all duration-150"
            >
              <Bookmark className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Info inferior — siempre visible */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-foreground line-clamp-1">{title}</h3>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-xs text-muted-foreground">{year}</span>
          {(isLiked || isSaved) && (
            <div className="flex items-center gap-1">
              {isLiked && <Heart className="h-3.5 w-3.5 fill-violet-500 text-violet-500" />}
              {isSaved && <Bookmark className="h-3.5 w-3.5 fill-cyan-500 text-cyan-500" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
