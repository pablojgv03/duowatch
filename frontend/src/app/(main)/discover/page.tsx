'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Filter, LayoutGrid, Layers, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SwipeCard } from '@/components/movie/swipe-card';
import { MovieCard } from '@/components/movie/movie-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRecommendations, useTrending, useMovieSearch } from '@/hooks/use-movies';
import type { TMDBMediaItem } from '@/types';
import { cn } from '@/lib/utils';

type ViewMode = 'swipe' | 'grid';
type FilterType = 'all' | 'movie' | 'tv';

export default function DiscoverPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cardIndex, setCardIndex] = useState(0);

  const { data: recommendations, isLoading: recsLoading, isError: recsError } = useRecommendations();
  const { data: searchResults, isLoading: searchLoading, isError: searchError } = useMovieSearch(searchQuery);

  const isSearching = searchQuery.length > 2;
  const rawItems: TMDBMediaItem[] = isSearching
    ? (searchResults?.results as TMDBMediaItem[] || [])
    : (recommendations as TMDBMediaItem[] || []);

  const hasError = isSearching ? searchError : recsError;

  const items = filter === 'all'
    ? rawItems
    : rawItems.filter((item) => item.media_type === filter);

  const isLoading = isSearching ? searchLoading : recsLoading;
  const swipeItems = items.slice(cardIndex, cardIndex + 3);

  const handleSwipe = useCallback(() => {
    setCardIndex((prev) => prev + 1);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-2">
            <Compass className="h-7 w-7 text-violet-400" />
            Descubrir
          </h1>
          <p className="text-muted-foreground mt-1">Encuentra tu próxima película favorita</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex glass rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                viewMode === 'grid' ? 'bg-violet-600 text-white' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('swipe')}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                viewMode === 'swipe' ? 'bg-violet-600 text-white' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Layers className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar películas y series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex glass rounded-xl p-1 gap-1">
          {([
            { value: 'all', label: 'Todo' },
            { value: 'movie', label: 'Películas' },
            { value: 'tv', label: 'Series' },
          ] as { value: FilterType; label: string }[]).map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                filter === f.value
                  ? 'bg-violet-600 text-white'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'swipe' ? (
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-sm h-[600px] mx-auto">
            {isLoading ? (
              <Skeleton className="w-full h-full rounded-3xl" />
            ) : swipeItems.length > 0 ? (
              swipeItems.map((item, i) => (
                <SwipeCard
                  key={`${item.media_type}-${item.id}`}
                  item={item}
                  isTop={i === 0}
                  onSwipeLeft={handleSwipe}
                  onSwipeRight={handleSwipe}
                  onBookmark={handleSwipe}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Compass className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="font-semibold">No hay más contenido</p>
                <p className="text-sm text-muted-foreground">Has visto todo por ahora</p>
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Arrastra a la derecha para dar like, a la izquierda para saltar
          </p>
        </div>
      ) : (
        <>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-2xl" />
              ))}
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              <AnimatePresence>
                {items.map((item, i) => (
                  <motion.div
                    key={`${item.media_type}-${item.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  >
                    <MovieCard item={item} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : hasError ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-16 w-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔑</span>
              </div>
              <p className="font-semibold text-lg mb-2">TMDB API key no configurada</p>
              <p className="text-sm text-muted-foreground max-w-sm">
                Edita <code className="text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded text-xs">backend/.env</code> y reemplaza{' '}
                <code className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded text-xs">YOUR_TMDB_API_KEY_HERE</code> por tu key gratuita de{' '}
                <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline">
                  themoviedb.org
                </a>
                , luego ejecuta{' '}
                <code className="text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded text-xs">docker-compose restart backend</code>
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Search className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="font-semibold text-lg">Sin resultados</p>
              <p className="text-sm text-muted-foreground">
                {isSearching ? `No encontramos nada para "${searchQuery}"` : 'Configura tus preferencias para ver recomendaciones'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
