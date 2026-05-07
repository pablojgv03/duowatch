import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  original_language: string;
  media_type?: 'movie';
}

export interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  original_language: string;
  media_type?: 'tv';
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export type TMDBMediaItem = (TMDBMovie | TMDBTVShow) & { media_type: 'movie' | 'tv' };

@Injectable()
export class TmdbService {
  private readonly logger = new Logger(TmdbService.name);
  private readonly client: AxiosInstance;
  private readonly imageBase: string;

  constructor(private config: ConfigService) {
    this.client = axios.create({
      baseURL: config.get('TMDB_BASE_URL', 'https://api.themoviedb.org/3'),
      params: { api_key: config.get('TMDB_API_KEY'), language: 'es-ES' },
    });
    this.imageBase = config.get('TMDB_IMAGE_BASE_URL', 'https://image.tmdb.org/t/p');
  }

  getPosterUrl(path: string | null, size: 'w342' | 'w500' | 'w780' | 'original' = 'w500') {
    return path ? `${this.imageBase}/${size}${path}` : null;
  }

  getBackdropUrl(path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280') {
    return path ? `${this.imageBase}/${size}${path}` : null;
  }

  async getTrending(mediaType: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'week') {
    const { data } = await this.client.get(`/trending/${mediaType}/${timeWindow}`);
    return data.results as TMDBMediaItem[];
  }

  async getPopularMovies(page = 1) {
    const { data } = await this.client.get('/movie/popular', { params: { page } });
    return { results: data.results as TMDBMovie[], totalPages: data.total_pages };
  }

  async getPopularTV(page = 1) {
    const { data } = await this.client.get('/tv/popular', { params: { page } });
    return { results: data.results as TMDBTVShow[], totalPages: data.total_pages };
  }

  async getMovieDetails(tmdbId: number) {
    const { data } = await this.client.get(`/movie/${tmdbId}`, {
      params: { append_to_response: 'credits,videos,similar' },
    });
    return data;
  }

  async getTVDetails(tmdbId: number) {
    const { data } = await this.client.get(`/tv/${tmdbId}`, {
      params: { append_to_response: 'credits,videos,similar' },
    });
    return data;
  }

  async searchMulti(query: string, page = 1) {
    const { data } = await this.client.get('/search/multi', {
      params: { query, page, include_adult: false },
    });
    return {
      results: (data.results as TMDBMediaItem[]).filter((r) => r.media_type === 'movie' || r.media_type === 'tv'),
      totalPages: data.total_pages,
    };
  }

  async discoverMovies(params: {
    genres?: number[];
    minRating?: number;
    page?: number;
    language?: string;
    sortBy?: string;
  }) {
    const { data } = await this.client.get('/discover/movie', {
      params: {
        with_genres: params.genres?.join('|'),
        'vote_average.gte': params.minRating || 5,
        page: params.page || 1,
        with_original_language: params.language,
        sort_by: params.sortBy || 'popularity.desc',
        include_adult: false,
      },
    });
    return { results: data.results as TMDBMovie[], totalPages: data.total_pages };
  }

  async discoverTV(params: {
    genres?: number[];
    minRating?: number;
    page?: number;
    language?: string;
  }) {
    const { data } = await this.client.get('/discover/tv', {
      params: {
        with_genres: params.genres?.join('|'),
        'vote_average.gte': params.minRating || 5,
        page: params.page || 1,
        with_original_language: params.language,
        sort_by: 'popularity.desc',
        include_adult: false,
      },
    });
    return { results: data.results as TMDBTVShow[], totalPages: data.total_pages };
  }

  async getMovieGenres() {
    const { data } = await this.client.get('/genre/movie/list');
    return data.genres as TMDBGenre[];
  }

  async getTVGenres() {
    const { data } = await this.client.get('/genre/tv/list');
    return data.genres as TMDBGenre[];
  }

  async getSimilarMovies(tmdbId: number) {
    const { data } = await this.client.get(`/movie/${tmdbId}/similar`);
    return data.results as TMDBMovie[];
  }

  async getSimilarTV(tmdbId: number) {
    const { data } = await this.client.get(`/tv/${tmdbId}/similar`);
    return data.results as TMDBTVShow[];
  }

  async getMoviesByIds(ids: number[]) {
    const results = await Promise.allSettled(ids.map((id) => this.getMovieDetails(id)));
    return results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<any>).value);
  }
}
