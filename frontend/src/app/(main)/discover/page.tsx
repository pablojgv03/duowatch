'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Search, Heart, Bookmark, Loader2, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MovieCard } from '@/components/movie/movie-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMovieSearch, useLikedMovies, useWatchlistMovies } from '@/hooks/use-movies';
import { useMovieDetailStore } from '@/store/movie-detail.store';
import { api } from '@/lib/api';
import { getPosterUrl } from '@/lib/utils';
import type { TMDBMediaItem, MovieInteraction } from '@/types';
import { cn } from '@/lib/utils';

type ContentFilter = 'all' | 'movie' | 'tv' | 'liked' | 'saved';

// Cuántos ítems mostrar inicialmente y cuántos añadir con "Ver más"
const INITIAL_DISPLAY = 24;
const LOAD_MORE_STEP  = 8;

function interactionToItem(i: MovieInteraction): TMDBMediaItem {
  const isMovie = i.mediaType === 'MOVIE';
  return {
    id: i.tmdbId,
    media_type: isMovie ? 'movie' : 'tv',
    ...(isMovie ? { title: i.title, release_date: '' } : { name: i.title, first_air_date: '' }),
    overview: '',
    poster_path: i.posterPath,
    backdrop_path: null,
    vote_average: 0,
    vote_count: 0,
    genre_ids: [],
    popularity: 0,
    original_language: 'en',
    posterUrl: i.posterPath ? getPosterUrl(i.posterPath) : null,
  } as unknown as TMDBMediaItem;
}

const FILTERS: { value: ContentFilter; label: string; icon?: React.ReactNode }[] = [
  { value: 'all',   label: 'Todo' },
  { value: 'movie', label: 'Películas' },
  { value: 'tv',    label: 'Series' },
  { value: 'liked', label: 'Favoritas', icon: <Heart className="h-3 w-3" /> },
  { value: 'saved', label: 'Guardadas', icon: <Bookmark className="h-3 w-3" /> },
];

export default function DiscoverPage() {
  const [filter, setFilter]         = useState<ContentFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Buffer de ítems traídos del backend para los filtros paginados (all/movie/tv)
  const [recBuffer, setRecBuffer]       = useState<TMDBMediaItem[]>([]);
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY);
  const [nextBackendPage, setNextBackendPage] = useState(2);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [isLoadingRec, setIsLoadingRec]   = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [recError, setRecError]           = useState(false);

  const openDetail     = useMovieDetailStore((s) => s.open);
  const isSearching    = searchQuery.length > 2;
  const isPaginated    = filter === 'all' || filter === 'movie' || filter === 'tv';
  const activeFilterRef = useRef<ContentFilter>('all');

  // Fetch inicial cuando cambia el filtro paginado
  const fetchInitial = useCallback(async (f: ContentFilter) => {
    if (f !== 'all' && f !== 'movie' && f !== 'tv') return;
    activeFilterRef.current = f;
    const typeParam = f !== 'all' ? `&type=${f}` : '';
    setIsLoadingRec(true);
    setRecError(false);
    setRecBuffer([]);
    setDisplayCount(INITIAL_DISPLAY);
    setNextBackendPage(2);
    setHasMorePages(true);
    try {
      const data = await api.get(`/recommendations?page=1${typeParam}`);
      // Ignorar respuesta si el filtro cambió mientras esperábamos
      if (activeFilterRef.current !== f) return;
      const items = (data as any) as TMDBMediaItem[];
      setRecBuffer(items);
      if (items.length < 24) setHasMorePages(false);
    } catch {
      if (activeFilterRef.current === f) setRecError(true);
    } finally {
      if (activeFilterRef.current === f) setIsLoadingRec(false);
    }
  }, []);

  useEffect(() => {
    fetchInitial(filter);
  }, [filter, fetchInitial]);

  // "Ver más": muestra los siguientes 8, fetching si hace falta
  const handleLoadMore = async () => {
    const nextDisplay = displayCount + LOAD_MORE_STEP;

    if (nextDisplay <= recBuffer.length) {
      // Tenemos suficientes en el buffer
      setDisplayCount(nextDisplay);
      return;
    }

    // Necesitamos otra página del backend
    if (!hasMorePages) return;
    setIsLoadingMore(true);
    const typeParam = filter !== 'all' ? `&type=${filter}` : '';
    try {
      const data = await api.get(`/recommendations?page=${nextBackendPage}${typeParam}`);
      const newItems = (data as any) as TMDBMediaItem[];
      const existingKeys = new Set(recBuffer.map((i) => `${i.media_type}-${i.id}`));
      const fresh = newItems.filter((i) => !existingKeys.has(`${i.media_type}-${i.id}`));
      if (fresh.length === 0) {
        setHasMorePages(false);
      } else {
        setRecBuffer((prev) => [...prev, ...fresh]);
        setNextBackendPage((p) => p + 1);
        if (fresh.length < 24) setHasMorePages(false);
      }
      setDisplayCount(nextDisplay);
    } catch {
      // silencioso
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Hooks para búsqueda, liked y saved (no paginados)
  const { data: searchResults, isLoading: searchLoading } = useMovieSearch(searchQuery);
  const { data: likedRaw,  isLoading: likedLoading  } = useLikedMovies();
  const { data: savedRaw,  isLoading: savedLoading  } = useWatchlistMovies();

  const likedIds = new Set((likedRaw ?? []).map((i) => i.tmdbId));
  const savedIds = new Set((savedRaw ?? []).map((i) => i.tmdbId));

  // Ítems a mostrar según el estado actual
  const getItems = (): TMDBMediaItem[] => {
    if (isSearching) {
      const results =
        (searchResults?.results as TMDBMediaItem[] | undefined) ??
        ((searchResults as any) as TMDBMediaItem[] | undefined) ??
        [];
      if (filter === 'movie') return results.filter((i) => i.media_type === 'movie');
      if (filter === 'tv')    return results.filter((i) => i.media_type === 'tv');
      return results;
    }
    if (filter === 'liked') return (likedRaw ?? []).map(interactionToItem);
    if (filter === 'saved') return (savedRaw ?? []).map(interactionToItem);
    return recBuffer.slice(0, displayCount);
  };

  const items = getItems();

  const isLoading =
    filter === 'liked' ? likedLoading  :
    filter === 'saved' ? savedLoading  :
    isSearching        ? searchLoading : isLoadingRec;

  const showLoadMore =
    isPaginated && !isSearching && !isLoadingRec && items.length > 0 &&
    (displayCount < recBuffer.length || hasMorePages);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black flex items-center gap-2">
          <Compass className="h-7 w-7 text-violet-400" />
          Descubrir
        </h1>
        <p className="text-muted-foreground mt-1">Encuentra tu próxima película favorita</p>
      </div>

      {/* Búsqueda + filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar películas y series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex glass rounded-xl p-1 gap-1 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                filter === f.value
                  ? 'bg-violet-600 text-white'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-2xl" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <AnimatePresence>
              {items.map((item, i) => (
                <motion.div
                  key={`${item.media_type}-${item.id}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.25) }}
                >
                  <MovieCard
                    item={item}
                    isLiked={likedIds.has(item.id)}
                    isSaved={savedIds.has(item.id)}
                    onClick={() => openDetail(item)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Botón "Ver más" */}
          {showLoadMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="flex items-center gap-2 px-6 py-3 rounded-xl glass border border-white/10 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-violet-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Ver más
                  </>
                )}
              </button>
            </div>
          )}
        </>
      ) : recError ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔑</span>
          </div>
          <p className="font-semibold text-lg mb-2">TMDB API key no configurada</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Edita <code className="text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded text-xs">backend/.env</code> y añade tu key de{' '}
            <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline">
              themoviedb.org
            </a>
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          {filter === 'liked' ? (
            <>
              <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="font-semibold text-lg">Sin favoritas aún</p>
              <p className="text-sm text-muted-foreground">Da like a películas y series para verlas aquí</p>
            </>
          ) : filter === 'saved' ? (
            <>
              <Bookmark className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="font-semibold text-lg">Lista vacía</p>
              <p className="text-sm text-muted-foreground">Guarda contenido para verlo después</p>
            </>
          ) : (
            <>
              <Search className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="font-semibold text-lg">Sin resultados</p>
              <p className="text-sm text-muted-foreground">
                {isSearching
                  ? `No encontramos nada para "${searchQuery}"`
                  : 'Configura tus preferencias en el onboarding'}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
