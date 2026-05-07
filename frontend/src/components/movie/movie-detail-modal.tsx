'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Clock, Tv, Heart, Bookmark, Film, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMovieDetail, useInteract } from '@/hooks/use-movies';
import { useMovieDetailStore } from '@/store/movie-detail.store';
import { getPosterUrl, getBackdropUrl, formatRating, getRatingColor, cn } from '@/lib/utils';
import { getMediaTitle } from '@/types';

export function MovieDetailModal() {
  const { item, close } = useMovieDetailStore();
  const { data: detail, isLoading } = useMovieDetail(item);
  const interact = useInteract();
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => { setShowTrailer(false); }, [item?.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [close]);

  useEffect(() => {
    document.body.style.overflow = item ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [item]);

  const handleLike = () => item && interact.mutate({ tmdbId: item.id, mediaType: item.media_type === 'movie' ? 'MOVIE' : 'TV', action: 'LIKED', title: getMediaTitle(item), posterPath: item.poster_path || undefined });
  const handleSkip = () => item && interact.mutate({ tmdbId: item.id, mediaType: item.media_type === 'movie' ? 'MOVIE' : 'TV', action: 'DISLIKED', title: getMediaTitle(item), posterPath: item.poster_path || undefined });
  const handleWatchlist = () => item && interact.mutate({ tmdbId: item.id, mediaType: item.media_type === 'movie' ? 'MOVIE' : 'TV', action: 'WANT_TO_WATCH', title: getMediaTitle(item), posterPath: item.poster_path || undefined });

  return (
    <AnimatePresence>
      {item && (() => {
        const title = getMediaTitle(item);
        const isMovie = item.media_type === 'movie';
        const posterUrl = item.posterUrl || getPosterUrl(item.poster_path, 'w500');
        const backdropUrl = getBackdropUrl(detail?.backdrop_path ?? item.backdrop_path, 'w1280');
        const overview = detail?.overview || item.overview || '';
        const genres: { id: number; name: string }[] = detail?.genres || [];
        const runtime: number | undefined = detail?.runtime;
        const seasons: number | undefined = detail?.number_of_seasons;
        const voteAverage = detail?.vote_average ?? item.vote_average;
        const trailerKey = (() => {
          const videos = detail?.videos?.results ?? [];
          const pick = (type: string, official?: boolean) =>
            videos.find((v) => v.site === 'YouTube' && v.type === type && (official === undefined || v.official === official));
          return (
            pick('Trailer', true)?.key ??
            pick('Trailer')?.key ??
            pick('Teaser', true)?.key ??
            pick('Teaser')?.key ??
            videos.find((v) => v.site === 'YouTube')?.key
          );
        })();
        const rawDate = isMovie
          ? (detail?.release_date ?? ('release_date' in item ? (item as any).release_date : ''))
          : (detail?.first_air_date ?? ('first_air_date' in item ? (item as any).first_air_date : ''));
        const year = rawDate ? new Date(rawDate).getFullYear() : '';
        const formatRuntime = (min: number) => {
          const h = Math.floor(min / 60);
          const m = min % 60;
          return h > 0 ? `${h}h ${m}min` : `${m}min`;
        };

        return (
          // Overlay + centrado usando flexbox, nunca translate (Framer Motion sobreescribiría el translate de Tailwind)
          <motion.div
            key="modal-root"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            {/* Fondo oscuro */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Modal */}
            <motion.div
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-cinema-900 border border-white/10 shadow-2xl"
              initial={{ scale: 0.96, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 20 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Backdrop */}
              <div className="relative h-52 w-full overflow-hidden rounded-t-2xl bg-cinema-800">
                {backdropUrl ? (
                  <Image src={backdropUrl} alt={title} fill className="object-cover" sizes="680px" priority />
                ) : posterUrl ? (
                  <Image src={posterUrl} alt={title} fill className="object-cover blur-sm scale-110 opacity-40" sizes="680px" priority />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-cinema-900 via-cinema-900/20 to-transparent" />
                <button
                  onClick={close}
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/60 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Poster + Info */}
              <div className="flex gap-5 px-6 -mt-12">
                <div className="relative h-44 w-28 rounded-xl overflow-hidden shrink-0 shadow-xl border border-white/10">
                  {posterUrl ? (
                    <Image src={posterUrl} alt={title} fill className="object-cover" sizes="112px" />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-cinema-800">
                      {isMovie ? <Film className="h-10 w-10 text-muted-foreground/30" /> : <Tv className="h-10 w-10 text-muted-foreground/30" />}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 pt-14">
                  <h2 className="text-xl font-bold text-white leading-snug mb-1">{title}</h2>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mb-3">
                    {voteAverage > 0 && (
                      <span className={cn('flex items-center gap-1 font-semibold', getRatingColor(voteAverage))}>
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {formatRating(voteAverage)}
                      </span>
                    )}
                    {year && <span>{year}</span>}
                    {isMovie && runtime ? (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatRuntime(runtime)}
                      </span>
                    ) : null}
                    {!isMovie && seasons ? (
                      <span className="flex items-center gap-1">
                        <Tv className="h-3.5 w-3.5" />
                        {seasons} {seasons === 1 ? 'temporada' : 'temporadas'}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant={isMovie ? 'default' : 'secondary'}>{isMovie ? 'Película' : 'Serie'}</Badge>
                    {genres.slice(0, 3).map((g) => (
                      <Badge key={g.id} variant="outline" className="text-[11px]">{g.name}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Overview + Botones */}
              <div className="px-6 pt-5 pb-6">
                {isLoading ? (
                  <div className="space-y-2 mb-5">
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-3 w-5/6 rounded" />
                    <Skeleton className="h-3 w-4/6 rounded" />
                  </div>
                ) : overview ? (
                  <p className="text-sm text-foreground/80 leading-relaxed mb-5">{overview}</p>
                ) : (
                  <p className="text-sm text-muted-foreground mb-5 italic">Sin descripción disponible.</p>
                )}

                {trailerKey && (
                  <div className="mb-5">
                    {showTrailer ? (
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                        <iframe
                          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                          className="w-full h-full"
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                          title={`Tráiler de ${title}`}
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowTrailer(true)}
                        className="flex items-center gap-2 w-full h-10 px-4 rounded-xl bg-cinema-800 border border-white/10 text-white/60 hover:text-white hover:border-violet-500/50 hover:bg-violet-500/10 transition-all text-sm"
                      >
                        <Play className="h-4 w-4 fill-current" />
                        Ver tráiler
                      </button>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleSkip}
                    className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-cinema-800 border border-red-500/40 text-red-400 hover:bg-red-500/20 hover:border-red-500 transition-all text-sm font-medium"
                  >
                    <X className="h-4 w-4" />
                    Pasar
                  </button>
                  <button
                    onClick={handleWatchlist}
                    className="flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-cinema-800 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500 transition-all text-sm font-medium"
                  >
                    <Bookmark className="h-4 w-4" />
                    Guardar
                  </button>
                  <button
                    onClick={handleLike}
                    className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-violet-600 border border-violet-400 text-white hover:bg-violet-500 transition-all text-sm font-medium shadow-lg shadow-violet-900/40"
                  >
                    <Heart className="h-4 w-4 fill-white" />
                    Me gusta
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );
      })()}
    </AnimatePresence>
  );
}
