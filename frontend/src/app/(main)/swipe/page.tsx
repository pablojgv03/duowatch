'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, X, Clock, ChevronRight, Flame, RotateCcw, Loader2 } from 'lucide-react';
import { SwipeCard, type SwipeCardRef } from '@/components/movie/swipe-card';
import { useInteract } from '@/hooks/use-movies';
import { api } from '@/lib/api';
import { getPosterUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { TMDBMediaItem } from '@/types';
import { getMediaTitle } from '@/types';
import { useSwipeStore, type SwipeAction, type TypeFilter } from '@/store/swipe.store';

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'Todo' },
  { value: 'movie', label: 'Películas' },
  { value: 'tv', label: 'Series' },
];

export default function SwipePage() {
  const { queue, history, typeFilter, addItems, consumeTop, setTypeFilter, reset, updateHistoryAction, incrementPage } =
    useSwipeStore();

  const [isFetching, setIsFetching] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const isFetchingRef = useRef(false);
  const cardRef = useRef<SwipeCardRef>(null);
  const interact = useInteract();

  const fetchMore = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsFetching(true);
    try {
      const { page, typeFilter: currentFilter } = useSwipeStore.getState();
      const type = currentFilter !== 'all' ? `&type=${currentFilter}` : '';
      const data = await api.get(`/recommendations?page=${page}${type}`);
      incrementPage();
      addItems((data as any) as TMDBMediaItem[]);
    } catch {
      // silencioso
    } finally {
      isFetchingRef.current = false;
      setIsFetching(false);
    }
  }, [addItems, incrementPage]);

  // Carga inicial solo si la cola está vacía (primera visita o tras reset)
  useEffect(() => {
    if (queue.length === 0 && !isFetchingRef.current) fetchMore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rellena la cola cuando queden pocas cartas
  useEffect(() => {
    if (queue.length < 5 && !isFetchingRef.current) fetchMore();
  }, [queue.length, fetchMore]);

  const onSwipeRight = useCallback(() => consumeTop('LIKED'), [consumeTop]);
  const onSwipeLeft  = useCallback(() => consumeTop('DISLIKED'), [consumeTop]);

  const handleTypeFilter = useCallback(
    (type: TypeFilter) => {
      if (useSwipeStore.getState().typeFilter === type) return;
      setTypeFilter(type);
    },
    [setTypeFilter],
  );

  const handleExternalLike    = useCallback(() => { cardRef.current?.like(); }, []);
  const handleExternalDislike = useCallback(() => { cardRef.current?.skip(); }, []);

  const handleReset = () => {
    reset();
    fetchMore();
  };

  const changeHistoryAction = (key: string, action: SwipeAction, item: TMDBMediaItem) => {
    const isMovie = item.media_type === 'movie';
    interact.mutate({
      tmdbId: item.id,
      mediaType: isMovie ? 'MOVIE' : 'TV',
      action,
      title: getMediaTitle(item),
      posterPath: item.poster_path || undefined,
    });
    updateHistoryAction(key, action);
  };

  const topItem   = queue[0];
  const backItems = queue.slice(1, 3);
  const isEmpty   = !isFetching && queue.length === 0;

  return (
    /*
     * h-[calc(100dvh-80px)]: en móvil la barra de nav inferior ocupa 80px (pb-20 del layout).
     * En desktop (lg) no hay nav inferior, usamos h-dvh.
     * overflow-hidden + flex-col elimina el scroll: la pila de cartas es flex-1 y toma el espacio restante.
     */
    <div className="flex flex-col h-[calc(100dvh-80px)] lg:h-dvh overflow-hidden px-4 pt-3 pb-2 lg:pt-6 lg:pb-4">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="w-full max-w-sm mx-auto shrink-0 mb-2 lg:mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-lg sm:text-2xl font-black flex items-center gap-2">
              <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
              Matchear
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
              Desliza para encontrar tu match
            </p>
          </div>
          <button
            onClick={() => setShowHistory(true)}
            className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            {history.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-violet-600 text-white text-[9px] font-bold flex items-center justify-center">
                {history.length}
              </span>
            )}
          </button>
        </div>

        {/* Filtros de tipo */}
        <div className="flex glass rounded-xl p-1 gap-1">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleTypeFilter(f.value)}
              className={cn(
                'flex-1 px-2 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                typeFilter === f.value
                  ? 'bg-violet-600 text-white'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Pila de cartas — flex-1 min-h-0 para ocupar el espacio restante ── */}
      <div className="relative w-full max-w-sm mx-auto flex-1 min-h-0">
        {isFetching && queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin" />
            <p className="text-sm">Cargando películas...</p>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-2">
            <Flame className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/30" />
            <p className="font-semibold">¡Lo has visto todo!</p>
            <p className="text-sm text-muted-foreground">Vuelve más tarde para más recomendaciones</p>
            <button
              onClick={handleReset}
              className="mt-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors"
            >
              Reiniciar
            </button>
          </div>
        ) : (
          <>
            {/* Cartas de fondo */}
            {backItems.map((item, i) => {
              const posterUrl = item.posterUrl || getPosterUrl(item.poster_path, 'w780');
              return (
                <div
                  key={`back-${item.media_type}-${item.id}`}
                  className="absolute inset-0 rounded-3xl overflow-hidden shadow-xl"
                  style={{
                    transform: `scale(${1 - (i + 1) * 0.04}) translateY(${(i + 1) * 10}px)`,
                    zIndex: 2 - i,
                    opacity: 1 - (i + 1) * 0.15,
                  }}
                >
                  {posterUrl && (
                    <Image src={posterUrl} alt={getMediaTitle(item)} fill className="object-cover" sizes="400px" />
                  )}
                  <div className="absolute inset-0 bg-black/40" />
                </div>
              );
            })}

            {/* Carta activa */}
            {topItem && (
              <div className="absolute inset-0" style={{ zIndex: 10 }}>
                <SwipeCard
                  key={`top-${topItem.media_type}-${topItem.id}`}
                  ref={cardRef}
                  item={topItem}
                  isTop
                  hideButtons
                  onSwipeLeft={onSwipeLeft}
                  onSwipeRight={onSwipeRight}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Botones externos ─────────────────────────────────────────── */}
      {topItem && (
        <>
          <div className="w-full max-w-sm mx-auto flex items-center justify-center gap-10 sm:gap-16 mt-3 sm:mt-5 shrink-0">
            <button
              onClick={handleExternalDislike}
              className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-cinema-900 border-2 border-red-500/60 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white hover:border-red-400 transition-all duration-200 hover:scale-110 shadow-lg"
            >
              <X className="h-5 w-5 sm:h-7 sm:w-7" />
            </button>

            <button
              onClick={handleExternalLike}
              className="h-14 w-14 sm:h-20 sm:w-20 rounded-full bg-violet-600 border-2 border-violet-400 flex items-center justify-center text-white hover:bg-violet-500 transition-all duration-200 hover:scale-110 shadow-xl shadow-violet-900/60"
            >
              <Heart className="h-6 w-6 sm:h-9 sm:w-9 fill-white" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-1.5 shrink-0 hidden sm:block">
            Arrastra la tarjeta o usa los botones
          </p>
        </>
      )}

      {/* ── Panel de historial ──────────────────────────────────────── */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setShowHistory(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-[min(320px,85vw)] bg-cinema-950 border-l border-white/10 z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 shrink-0">
                <div>
                  <h2 className="font-bold text-base sm:text-lg">Historial</h2>
                  <p className="text-xs text-muted-foreground">Últimas {history.length} decisiones</p>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="h-8 w-8 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                    <Clock className="h-10 w-10 mb-2 opacity-30" />
                    <p className="text-sm">Sin historial aún</p>
                  </div>
                ) : (
                  history.map((entry) => {
                    const title = getMediaTitle(entry.item);
                    const posterUrl = entry.item.posterUrl || getPosterUrl(entry.item.poster_path, 'w185');
                    return (
                      <div key={entry.key} className="flex items-center gap-3 p-3 rounded-xl glass group">
                        <div className="relative h-14 w-10 rounded-lg overflow-hidden shrink-0 bg-cinema-800">
                          {posterUrl && (
                            <Image src={posterUrl} alt={title} fill className="object-cover" sizes="40px" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{title}</p>
                          <span
                            className={cn(
                              'text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block',
                              entry.action === 'LIKED'
                                ? 'bg-violet-500/20 text-violet-300'
                                : 'bg-red-500/20 text-red-300',
                            )}
                          >
                            {entry.action === 'LIKED' ? '❤️ Like' : '✕ Skip'}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            changeHistoryAction(
                              entry.key,
                              entry.action === 'LIKED' ? 'DISLIKED' : 'LIKED',
                              entry.item,
                            )
                          }
                          title="Cambiar decisión"
                          className="h-8 w-8 rounded-full glass opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
