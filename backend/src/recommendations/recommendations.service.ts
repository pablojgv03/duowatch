import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TmdbService } from '../tmdb/tmdb.service';
import { InteractionType } from '@prisma/client';

// Géneros que solo existen en películas (no tienen equivalente directo en TV)
// Los mapeamos a géneros de TV equivalentes para que discoverTV devuelva resultados
const MOVIE_TO_TV_GENRE: Record<number, number> = {
  28: 10759,  // Action → Action & Adventure
  12: 10759,  // Adventure → Action & Adventure
  878: 10765, // Science Fiction → Sci-Fi & Fantasy
  14: 10765,  // Fantasy → Sci-Fi & Fantasy
  10752: 10768, // War → War & Politics
};

const TARGET_RESULTS = 24;

@Injectable()
export class RecommendationsService {
  constructor(
    private prisma: PrismaService,
    private tmdb: TmdbService,
  ) {}

  async getPersonalized(userId: string, page = 1, type?: 'movie' | 'tv') {
    const [prefs, interactions] = await Promise.all([
      this.prisma.userPreferences.findUnique({ where: { userId } }),
      this.prisma.movieInteraction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const liked = interactions.filter((i) => i.action === InteractionType.LIKED);
    const disliked = interactions.filter((i) => i.action === InteractionType.DISLIKED);

    // Solo excluir lo que el usuario rechazó explícitamente.
    // Liked/guardados pueden reaparecer en Discover (ya tienen el icono de corazón).
    const seenIds = new Set(disliked.map((i) => i.tmdbId));

    const rawGenres = prefs?.favoriteGenres?.length ? prefs.favoriteGenres : [28, 35, 18, 878];
    const movieGenres = rawGenres.slice(0, 4);
    const tvGenres = [...new Set(rawGenres.map((g) => MOVIE_TO_TV_GENRE[g] ?? g))].slice(0, 4);
    const minRating = prefs?.minRating || 5.5;

    // El filtro de tipo siempre se respeta. preferredTypes solo afecta géneros, no bloquea tipos.
    const wantsMovies = type !== 'tv';
    const wantsTV    = type !== 'movie';

    // Páginas TMDB sin solapamiento entre páginas del frontend:
    // frontend page=1 → TMDB 1-5 | page=2 → TMDB 6-10 | page=3 → TMDB 11-15
    const tmdbStart = (page - 1) * 5 + 1;

    // Últimas 3 que gustaron → boost en score de similares
    const recentLiked = liked.slice(0, 3);

    // Todas las llamadas en paralelo: discover (5 páginas sin solapar) + similares liked
    const [[m1, m2, m3, m4, m5, tv1, tv2, tv3, tv4, tv5], likedSimilar] = await Promise.all([
      Promise.all([
        wantsMovies ? this.tmdb.discoverMovies({ genres: movieGenres, minRating, page: tmdbStart })     : Promise.resolve({ results: [] as any[] }),
        wantsMovies ? this.tmdb.discoverMovies({ genres: movieGenres, minRating, page: tmdbStart + 1 }) : Promise.resolve({ results: [] as any[] }),
        wantsMovies ? this.tmdb.discoverMovies({ genres: movieGenres, minRating, page: tmdbStart + 2 }) : Promise.resolve({ results: [] as any[] }),
        wantsMovies ? this.tmdb.discoverMovies({ genres: movieGenres, minRating, page: tmdbStart + 3 }) : Promise.resolve({ results: [] as any[] }),
        wantsMovies ? this.tmdb.discoverMovies({ genres: movieGenres, minRating, page: tmdbStart + 4 }) : Promise.resolve({ results: [] as any[] }),
        wantsTV ? this.tmdb.discoverTV({ genres: tvGenres, minRating, page: tmdbStart })     : Promise.resolve({ results: [] as any[] }),
        wantsTV ? this.tmdb.discoverTV({ genres: tvGenres, minRating, page: tmdbStart + 1 }) : Promise.resolve({ results: [] as any[] }),
        wantsTV ? this.tmdb.discoverTV({ genres: tvGenres, minRating, page: tmdbStart + 2 }) : Promise.resolve({ results: [] as any[] }),
        wantsTV ? this.tmdb.discoverTV({ genres: tvGenres, minRating, page: tmdbStart + 3 }) : Promise.resolve({ results: [] as any[] }),
        wantsTV ? this.tmdb.discoverTV({ genres: tvGenres, minRating, page: tmdbStart + 4 }) : Promise.resolve({ results: [] as any[] }),
      ]),
      Promise.allSettled(
        recentLiked.map((i) =>
          i.mediaType === 'MOVIE'
            ? this.tmdb.getSimilarMovies(i.tmdbId)
            : this.tmdb.getSimilarTV(i.tmdbId),
        ),
      ),
    ]);

    // IDs similares a lo que gustó → boost ×1.5 en el score
    const boostedIds = new Set<number>();
    likedSimilar.forEach((r) => {
      if (r.status === 'fulfilled') r.value.forEach((item) => boostedIds.add(item.id));
    });

    const movieResults = [...(m1.results || []), ...(m2.results || []), ...(m3.results || []), ...(m4.results || []), ...(m5.results || [])];
    const tvResults = [...(tv1.results || []), ...(tv2.results || []), ...(tv3.results || []), ...(tv4.results || []), ...(tv5.results || [])];

    console.log(`[Rec] type=${type ?? 'all'} page=${page} | tmdbStart=${tmdbStart} | movieRaw=${movieResults.length} tvRaw=${tvResults.length} | seenIds=${seenIds.size}`);

    const uniqueMovies = this.deduplicateById(movieResults);
    const uniqueTV = this.deduplicateById(tvResults);

    const movies = uniqueMovies
      .filter((m) => !seenIds.has(m.id))
      .map((m) => ({
        ...m,
        media_type: 'movie' as const,
        posterUrl: this.tmdb.getPosterUrl(m.poster_path),
        backdropUrl: this.tmdb.getBackdropUrl(m.backdrop_path),
        score: this.scoreItem(m, rawGenres) * (boostedIds.has(m.id) ? 1.5 : 1),
      }));

    const shows = uniqueTV
      .filter((s) => !seenIds.has(s.id))
      .map((s) => ({
        ...s,
        media_type: 'tv' as const,
        posterUrl: this.tmdb.getPosterUrl(s.poster_path),
        backdropUrl: this.tmdb.getBackdropUrl(s.backdrop_path),
        score: this.scoreItem(s as any, rawGenres) * (boostedIds.has(s.id) ? 1.5 : 1),
      }));

    const result = [...movies, ...shows]
      .sort((a, b) => b.score - a.score)
      .slice(0, TARGET_RESULTS);

    console.log(`[Rec] after filter: movies=${movies.length} shows=${shows.length} → returning ${result.length}`);
    return result;
  }

  async getForDuo(userId: string, friendId: string) {
    const [myPrefs, friendPrefs, myInteractions, friendInteractions] = await Promise.all([
      this.prisma.userPreferences.findUnique({ where: { userId } }),
      this.prisma.userPreferences.findUnique({ where: { userId: friendId } }),
      this.prisma.movieInteraction.findMany({ where: { userId } }),
      this.prisma.movieInteraction.findMany({ where: { userId: friendId } }),
    ]);

    const myLiked = new Set(myInteractions.filter((i) => i.action !== 'DISLIKED').map((i) => i.tmdbId));
    const friendLiked = new Set(friendInteractions.filter((i) => i.action !== 'DISLIKED').map((i) => i.tmdbId));
    const bothSeen = new Set([...myLiked, ...friendLiked]);

    const myGenres = myPrefs?.favoriteGenres || [28, 35, 18];
    const friendGenres = friendPrefs?.favoriteGenres || [28, 35, 18];

    const sharedGenres = myGenres.filter((g) => friendGenres.includes(g));
    const targetMovieGenres = sharedGenres.length > 0 ? sharedGenres : [...new Set([...myGenres.slice(0, 2), ...friendGenres.slice(0, 2)])];
    const targetTVGenres = [...new Set(targetMovieGenres.map((g) => MOVIE_TO_TV_GENRE[g] ?? g))];

    const [movieResults, tvResults] = await Promise.all([
      this.tmdb.discoverMovies({ genres: targetMovieGenres.slice(0, 3), minRating: 6.5 }),
      this.tmdb.discoverTV({ genres: targetTVGenres.slice(0, 3), minRating: 6.5 }),
    ]);

    const movies = (movieResults.results || [])
      .filter((m) => !bothSeen.has(m.id))
      .map((m) => ({
        ...m,
        media_type: 'movie' as const,
        posterUrl: this.tmdb.getPosterUrl(m.poster_path),
        backdropUrl: this.tmdb.getBackdropUrl(m.backdrop_path),
        duoScore: this.scoreForDuo(m as any, myGenres, friendGenres),
      }));

    const shows = (tvResults.results || [])
      .filter((s) => !bothSeen.has(s.id))
      .map((s) => ({
        ...s,
        media_type: 'tv' as const,
        posterUrl: this.tmdb.getPosterUrl(s.poster_path),
        backdropUrl: this.tmdb.getBackdropUrl(s.backdrop_path),
        duoScore: this.scoreForDuo(s as any, myGenres, friendGenres),
      }));

    return [...movies, ...shows].sort((a, b) => b.duoScore - a.duoScore).slice(0, TARGET_RESULTS);
  }

  private deduplicateById<T extends { id: number }>(items: T[]): T[] {
    const seen = new Set<number>();
    return items.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }

  private scoreItem(item: { vote_average: number; popularity: number; genre_ids: number[] }, userGenres: number[]): number {
    const ratingScore = (item.vote_average / 10) * 40;
    const popularityScore = Math.min(item.popularity / 200, 1) * 20;
    const genreMatchCount = item.genre_ids.filter((g) => userGenres.includes(g)).length;
    const genreScore = (genreMatchCount / Math.max(userGenres.length, 1)) * 40;
    return ratingScore + popularityScore + genreScore;
  }

  private scoreForDuo(
    item: { vote_average: number; popularity: number; genre_ids: number[] },
    genresA: number[],
    genresB: number[],
  ): number {
    const ratingScore = (item.vote_average / 10) * 30;
    const popularityScore = Math.min(item.popularity / 200, 1) * 10;
    const matchA = item.genre_ids.filter((g) => genresA.includes(g)).length;
    const matchB = item.genre_ids.filter((g) => genresB.includes(g)).length;
    const genreScore = ((matchA + matchB) / (Math.max(genresA.length, 1) + Math.max(genresB.length, 1))) * 60;
    return ratingScore + popularityScore + genreScore;
  }
}
