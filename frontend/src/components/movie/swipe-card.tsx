'use client';

import { useRef, forwardRef, useImperativeHandle } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Heart, X, Bookmark, Star, Film, Tv, Info } from 'lucide-react';
import { cn, getPosterUrl, formatRating, getRatingColor } from '@/lib/utils';
import { useInteract } from '@/hooks/use-movies';
import { useMovieDetailStore } from '@/store/movie-detail.store';
import type { TMDBMediaItem } from '@/types';
import { Badge } from '@/components/ui/badge';

interface SwipeCardProps {
  item: TMDBMediaItem;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onBookmark?: () => void;
  isTop?: boolean;
  hideButtons?: boolean;
}

export interface SwipeCardRef {
  like: () => void;
  skip: () => void;
}

export const SwipeCard = forwardRef<SwipeCardRef, SwipeCardProps>(
  ({ item, onSwipeLeft, onSwipeRight, onBookmark, isTop = false, hideButtons = false }, ref) => {
    const interact = useInteract();
    const openDetail = useMovieDetailStore((s) => s.open);
    const isAnimatingRef = useRef(false);

    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);
    const likeOpacity = useTransform(x, [0, 100], [0, 1]);
    const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

    const title = 'title' in item ? item.title : item.name;
    const date = 'release_date' in item ? item.release_date : item.first_air_date;
    const year = date ? new Date(date).getFullYear() : '';
    const posterUrl = item.posterUrl || getPosterUrl(item.poster_path, 'w780');
    const isMovie = item.media_type === 'movie';

    const flyOut = async (direction: 'right' | 'left') => {
      if (isAnimatingRef.current) return false;
      isAnimatingRef.current = true;
      try {
        await animate(x, direction === 'right' ? 1000 : -1000, {
          duration: 0.35,
          ease: 'easeOut',
        });
        return true;
      } catch {
        return false;
      } finally {
        isAnimatingRef.current = false;
      }
    };

    const handleLike = async () => {
      if (isAnimatingRef.current) return;
      interact.mutate({
        tmdbId: item.id,
        mediaType: isMovie ? 'MOVIE' : 'TV',
        action: 'LIKED',
        title,
        posterPath: item.poster_path || undefined,
      });
      await flyOut('right');
      onSwipeRight?.();
    };

    const handleSkip = async () => {
      if (isAnimatingRef.current) return;
      interact.mutate({
        tmdbId: item.id,
        mediaType: isMovie ? 'MOVIE' : 'TV',
        action: 'DISLIKED',
        title,
        posterPath: item.poster_path || undefined,
      });
      await flyOut('left');
      onSwipeLeft?.();
    };

    const handleBookmark = () => {
      interact.mutate({
        tmdbId: item.id,
        mediaType: isMovie ? 'MOVIE' : 'TV',
        action: 'WANT_TO_WATCH',
        title,
        posterPath: item.poster_path || undefined,
      });
      onBookmark?.();
    };

    useImperativeHandle(ref, () => ({
      like: handleLike,
      skip: handleSkip,
    }));

    const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
      if (info.offset.x > 100) {
        handleLike();
      } else if (info.offset.x < -100) {
        handleSkip();
      } else {
        animate(x, 0, { type: 'spring', stiffness: 300, damping: 25 });
      }
    };

    return (
      <motion.div
        className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
        style={{ x, rotate, opacity }}
        drag={isTop ? 'x' : false}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.02 }}
      >
        <div className="relative h-full w-full rounded-3xl overflow-hidden shadow-2xl">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
              priority={isTop}
              draggable={false}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-cinema-800">
              {isMovie ? <Film className="h-24 w-24 text-muted-foreground/30" /> : <Tv className="h-24 w-24 text-muted-foreground/30" />}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

          <motion.div
            className="absolute top-8 right-8 bg-emerald-500 text-white font-black text-2xl px-4 py-2 rounded-2xl border-4 border-white rotate-12"
            style={{ opacity: likeOpacity }}
          >
            LIKE ❤️
          </motion.div>

          <motion.div
            className="absolute top-8 left-8 bg-red-500 text-white font-black text-2xl px-4 py-2 rounded-2xl border-4 border-white -rotate-12"
            style={{ opacity: nopeOpacity }}
          >
            NOPE ✕
          </motion.div>

          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant={isMovie ? 'default' : 'secondary'}>{isMovie ? 'Película' : 'Serie'}</Badge>
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-1 glass rounded-lg px-2.5 py-1.5">
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span className={cn('text-sm font-bold', getRatingColor(item.vote_average))}>
              {formatRating(item.vote_average)}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">{title}</h2>
                <p className="text-white/70 text-sm">{year}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); openDetail(item); }}
                className="h-10 w-10 rounded-full glass flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <Info className="h-5 w-5" />
              </button>
            </div>

            {isTop && !hideButtons && (
              <div className="flex gap-4 justify-center mt-6">
                <button
                  onClick={handleSkip}
                  className="h-16 w-16 rounded-full bg-black/40 border-2 border-red-500 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-110"
                >
                  <X className="h-7 w-7" />
                </button>
                <button
                  onClick={handleBookmark}
                  className="h-12 w-12 rounded-full bg-black/40 border-2 border-cyan-500 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all duration-200 hover:scale-110 self-center"
                >
                  <Bookmark className="h-5 w-5" />
                </button>
                <button
                  onClick={handleLike}
                  className="h-16 w-16 rounded-full bg-violet-600 border-2 border-violet-400 flex items-center justify-center text-white hover:bg-violet-500 transition-all duration-200 hover:scale-110 shadow-lg shadow-violet-900/50"
                >
                  <Heart className="h-7 w-7 fill-white" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  },
);

SwipeCard.displayName = 'SwipeCard';
