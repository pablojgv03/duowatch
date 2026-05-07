import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TmdbService } from '../tmdb/tmdb.service';
import { InteractionType } from '@prisma/client';

interface ScoredMedia {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  score: number;
}

@Injectable()
export class RecommendationsService {
  constructor(
    private prisma: PrismaService,
    private tmdb: TmdbService,
  ) {}

  async getPersonalized(userId: string, page = 1) {
    const [prefs, interactions] = await Promise.all([
      this.prisma.userPreferences.findUnique({ where: { userId } }),
      this.prisma.movieInteraction.findMany({ where: { userId } }),
    ]);

    const likedIds = new Set(
      interactions
        .filter((i) => i.action === InteractionType.LIKED || i.action === InteractionType.WATCHED)
        .map((i) => i.tmdbId),
    );

    const genres = prefs?.favoriteGenres?.length ? prefs.favoriteGenres : [28, 35, 18, 878];
    const selectedGenres = genres.slice(0, 3);

    const [movieResults, tvResults] = await Promise.all([
      prefs?.preferredTypes?.includes('movie') !== false
        ? this.tmdb.discoverMovies({
            genres: selectedGenres,
            minRating: prefs?.minRating || 6,
            page,
          })
        : { results: [] },
      prefs?.preferredTypes?.includes('tv') !== false
        ? this.tmdb.discoverTV({
            genres: selectedGenres,
            minRating: prefs?.minRating || 6,
            page,
          })
        : { results: [] },
    ]);

    const movies = (movieResults.results || [])
      .filter((m) => !likedIds.has(m.id))
      .map((m) => ({
        ...m,
        media_type: 'movie' as const,
        posterUrl: this.tmdb.getPosterUrl(m.poster_path),
        backdropUrl: this.tmdb.getBackdropUrl(m.backdrop_path),
        score: this.scoreMovie(m, genres),
      }));

    const shows = (tvResults.results || [])
      .filter((s) => !likedIds.has(s.id))
      .map((s) => ({
        ...s,
        media_type: 'tv' as const,
        posterUrl: this.tmdb.getPosterUrl(s.poster_path),
        backdropUrl: this.tmdb.getBackdropUrl(s.backdrop_path),
        score: this.scoreMovie(s as any, genres),
      }));

    const combined = [...movies, ...shows].sort((a, b) => b.score - a.score);

    return combined.slice(0, 20);
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
    const targetGenres = sharedGenres.length > 0 ? sharedGenres : [...new Set([...myGenres.slice(0, 2), ...friendGenres.slice(0, 2)])];

    const [movieResults, tvResults] = await Promise.all([
      this.tmdb.discoverMovies({ genres: targetGenres.slice(0, 3), minRating: 6.5 }),
      this.tmdb.discoverTV({ genres: targetGenres.slice(0, 3), minRating: 6.5 }),
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

    return [...movies, ...shows].sort((a, b) => b.duoScore - a.duoScore).slice(0, 20);
  }

  private scoreMovie(item: { vote_average: number; popularity: number; genre_ids: number[] }, userGenres: number[]): number {
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
